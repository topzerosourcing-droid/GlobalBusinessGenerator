import { collection, addDoc, doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { db, auth, analytics } from './firebase';
import { AnalyticsEventType, AnalyticsEvent } from '../types';

/**
 * Robust analytics tracking service for Global Business Generator self-marketing funnel.
 * Tracks visits, starts, completions, shares, referrals, registrations, and conversions.
 */

export async function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  metadata: Record<string, any> = {}
): Promise<void> {
  const now = new Date().toISOString();
  const currentUid = auth.currentUser?.uid || null;
  const storedReferralCode = typeof window !== 'undefined' 
    ? localStorage.getItem('gbg_active_referral') || null 
    : null;

  const eventData: AnalyticsEvent = {
    eventType,
    timestamp: now,
    path: typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '',
    metadata,
    userId: currentUid,
    referralCode: storedReferralCode || (metadata.referralCode as string | undefined),
  };

  // Local mirror in storage for instant offline / client metrics
  try {
    const rawEvents = localStorage.getItem('gbg_local_analytics') || '[]';
    const parsed = JSON.parse(rawEvents);
    parsed.push({ ...eventData, id: `local_${Date.now()}` });
    if (parsed.length > 50) parsed.shift();
    localStorage.setItem('gbg_local_analytics', JSON.stringify(parsed));
  } catch (e) {
    // Ignore storage issues
  }

  // Persist to Firestore analytics_events collection
  try {
    const eventsRef = collection(db, 'analytics_events');
    await addDoc(eventsRef, {
      ...eventData,
      createdAt: now,
    });
  } catch (err) {
    // Analytics failures must never crash client flow
    console.debug('Analytics capture deferred or offline:', err);
  }

  // Also log to Google Analytics (Measurement ID: G-WRKKP8RRND) if available
  try {
    if (analytics) {
      logEvent(analytics, eventType, metadata);
    }
  } catch (err) {
    // Non-fatal
  }
}

// Dedicated helper methods for each tracked funnel stage
export const Analytics = {
  landingPageVisit: (source?: string) => 
    trackAnalyticsEvent('landing_page_view', { source: source || 'direct' }),

  businessPlanStart: (industry?: string, country?: string) => 
    trackAnalyticsEvent('business_plan_start', { industry, country }),

  planCompleted: (planId: string, businessName: string, sectionsCount: number = 34) => 
    trackAnalyticsEvent('plan_completed', { planId, businessName, sectionsCount }),

  publicPageView: (pageType: 'plan' | 'idea', identifier: string, title?: string) => 
    trackAnalyticsEvent('public_page_view', { pageType, identifier, title }),

  shareClick: (platform: string, itemType: 'plan' | 'idea' | 'referral' | string = 'plan', targetId: string = '') => 
    trackAnalyticsEvent('share_click', { platform, itemType, targetId }),

  referralClick: (referralCode: string, url: string) => 
    trackAnalyticsEvent('referral_click', { referralCode, url }),

  registration: (userId: string, referredBy?: string) => 
    trackAnalyticsEvent('registration', { userId, referredBy }),

  freeToPaidConversion: (tier: string, currency: string, amount: number) => 
    trackAnalyticsEvent('free_to_paid_conversion', { tier, currency, amount }),

  ideaView: (ideaId: string, title: string, category?: string) =>
    trackAnalyticsEvent('idea_view', { ideaId, title, category }),

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
    trackAnalyticsEvent('idea_view', { eventName: name, ...data }),
};
