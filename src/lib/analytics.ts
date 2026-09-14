import { collection, addDoc } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { db, auth, analytics } from './firebase';
import { AnalyticsEventType, AnalyticsEvent } from '../types';

const PENDING_QUEUE_KEY = 'gbg_pending_analytics_queue';
const LOCAL_HISTORY_KEY = 'gbg_local_analytics';
const MAX_QUEUE_SIZE = 50;

/**
 * Recursively sanitizes data before writing to Firestore.
 * - Removes any key with an `undefined` value.
 * - Preserves `null`, booleans, numbers, strings, and objects.
 * - Filters `undefined` items out of arrays.
 */
export function sanitizeFirestoreData<T = any>(obj: T): T {
  if (obj === undefined) {
    return undefined as unknown as T;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null) {
        clean[key] = sanitizeFirestoreData(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean as T;
}

/**
 * Safely enqueues an event for offline deferred dispatch.
 */
function enqueueOfflineEvent(eventPayload: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY) || '[]';
    const queue: Array<Record<string, any>> = JSON.parse(raw);
    
    // Avoid duplicate events in queue
    const isDuplicate = queue.some(
      (item) => item.eventId && item.eventId === eventPayload.eventId
    );
    if (!isDuplicate) {
      queue.push(eventPayload);
      if (queue.length > MAX_QUEUE_SIZE) {
        queue.shift();
      }
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch {
    // Non-blocking storage safeguard
  }
}

/**
 * Flushes pending offline analytics events to Firestore when connectivity returns.
 */
export async function flushOfflineAnalyticsQueue(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    if (!raw) return;

    const queue: Array<Record<string, any>> = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;

    const eventsRef = collection(db, 'analytics_events');
    const remaining: Array<Record<string, any>> = [];

    for (const item of queue) {
      try {
        const cleanItem = sanitizeFirestoreData(item);
        await addDoc(eventsRef, cleanItem);
      } catch (err: any) {
        const isOffline =
          err?.code === 'unavailable' ||
          err?.message?.includes('offline') ||
          (typeof navigator !== 'undefined' && !navigator.onLine);
        if (isOffline) {
          remaining.push(item);
        }
        // If it's a permanent validation error, skip to avoid blocking the queue
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(PENDING_QUEUE_KEY);
    }
  } catch {
    // Non-blocking safeguard
  }
}

// Auto-flush pending events whenever the browser reconnects
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOfflineAnalyticsQueue().catch(() => {});
  });
}

/**
 * Robust analytics tracking service for Global Business Generator self-marketing funnel.
 * Tracks visits, starts, completions, shares, referrals, registrations, and conversions.
 * Guarantees zero `undefined` values sent to Firestore and robust offline resilience.
 */
export async function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  rawMetadata: Record<string, any> = {}
): Promise<void> {
  const now = new Date().toISOString();
  const currentUid = auth.currentUser?.uid || null;
  const storedReferralCode = typeof window !== 'undefined' 
    ? localStorage.getItem('gbg_active_referral') || null 
    : null;

  // 1. Sanitize raw metadata recursively - strips all undefined fields
  const cleanMetadata = sanitizeFirestoreData(rawMetadata) || {};

  // 2. Build sanitized event object
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const eventPayload: Record<string, any> = {
    eventId,
    eventType,
    timestamp: now,
    path: typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '',
    metadata: cleanMetadata,
    userId: currentUid,
  };

  // Only assign referralCode if it is defined and not undefined
  const resolvedReferral = cleanMetadata.referralCode || storedReferralCode;
  if (resolvedReferral !== undefined && resolvedReferral !== null && resolvedReferral !== '') {
    eventPayload.referralCode = resolvedReferral;
  }

  const sanitizedEvent = sanitizeFirestoreData(eventPayload);

  // 3. Update local history buffer (for debugging & immediate UI counters)
  try {
    if (typeof window !== 'undefined') {
      const rawEvents = localStorage.getItem(LOCAL_HISTORY_KEY) || '[]';
      const parsed = JSON.parse(rawEvents);
      parsed.push({ ...sanitizedEvent, id: `local_${Date.now()}` });
      if (parsed.length > 50) parsed.shift();
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(parsed));
    }
  } catch {
    // Ignore storage issues
  }

  // 4. Check if currently offline
  const isBrowserOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (isBrowserOffline) {
    enqueueOfflineEvent(sanitizedEvent);
    return;
  }

  // 5. Persist to Firestore analytics_events collection
  try {
    const eventsRef = collection(db, 'analytics_events');
    await addDoc(eventsRef, {
      ...sanitizedEvent,
      createdAt: now,
    });
  } catch (err: any) {
    const isOfflineErr =
      err?.code === 'unavailable' ||
      err?.message?.includes('offline') ||
      err?.message?.includes('network');

    if (isOfflineErr) {
      enqueueOfflineEvent(sanitizedEvent);
    }
    // Analytics failures must NEVER interrupt user checkout, auth, or plans
    console.debug('[Analytics] Event deferred or offline:', eventType);
  }

  // 6. Also log to Google Analytics if available
  try {
    if (analytics && typeof navigator !== 'undefined' && navigator.onLine) {
      const safeEvent = eventType.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
      const safeParams: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(cleanMetadata || {})) {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          const safeKey = k.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
          safeParams[safeKey] = typeof v === 'boolean' ? (v ? 1 : 0) : v;
        }
      }
      logEvent(analytics, safeEvent, safeParams);
    }
  } catch {
    // Non-fatal, suppress all analytics errors silently
  }
}

// Dedicated helper methods for each tracked funnel stage with strict undefined protection
export const Analytics = {
  landingPageVisit: (source?: string) => 
    trackAnalyticsEvent('landing_page_view', { source: source || 'direct' }),

  businessPlanStart: (industry?: string, country?: string) => {
    const meta: Record<string, any> = {};
    if (industry) meta.industry = industry;
    if (country) meta.country = country;
    return trackAnalyticsEvent('business_plan_start', meta);
  },

  planCompleted: (planId: string, businessName: string, sectionsCount: number = 34) => 
    trackAnalyticsEvent('plan_completed', { planId, businessName, sectionsCount }),

  publicPageView: (pageType: 'plan' | 'idea', identifier: string, title?: string) => {
    const meta: Record<string, any> = { pageType, identifier };
    if (title) meta.title = title;
    return trackAnalyticsEvent('public_page_view', meta);
  },

  shareClick: (platform: string, itemType: 'plan' | 'idea' | 'referral' | string = 'plan', targetId: string = '') => 
    trackAnalyticsEvent('share_click', { platform, itemType, targetId }),

  referralClick: (referralCode: string, url: string) => 
    trackAnalyticsEvent('referral_click', { referralCode, url }),

  registration: (userId: string, referredBy?: string) => {
    const meta: Record<string, any> = { userId };
    if (referredBy) {
      meta.referredBy = referredBy;
    }
    return trackAnalyticsEvent('registration', meta);
  },

  freeToPaidConversion: (tier: string, currency: string, amount: number) => 
    trackAnalyticsEvent('free_to_paid_conversion', { tier, currency, amount }),

  ideaView: (ideaId: string, title: string, category?: string) => {
    const meta: Record<string, any> = { ideaId, title };
    if (category) meta.category = category;
    return trackAnalyticsEvent('idea_view', meta);
  },

  ideaSearch: (query: string, resultsCount: number) => 
    trackAnalyticsEvent('idea_search', { query, resultsCount }),

  search: (query: string, resultsCount: number = 0) => 
    trackAnalyticsEvent('idea_search', { query, resultsCount }),

  ideaFilterUsed: (filterType: string, value: string) => 
    trackAnalyticsEvent('idea_filter_used', { filterType, value }),

  filterUsed: (filterType: string, value: string) => 
    trackAnalyticsEvent('idea_filter_used', { filterType, value }),

  businessPlanCtaClick: (ideaId: string, ideaTitle: string, ctaLocation: string) => 
    trackAnalyticsEvent('business_plan_cta_click', { ideaId, ideaTitle, ctaLocation }),

  pageView: (path: string) => 
    trackAnalyticsEvent('landing_page_view', { path }),

  event: (name: string, data?: any) => 
    trackAnalyticsEvent('idea_view', sanitizeFirestoreData({ eventName: name, ...(data || {}) })),
};
