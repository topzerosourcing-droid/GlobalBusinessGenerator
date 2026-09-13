import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { ReferralRecord } from '../types';
import { Analytics } from './analytics';

export function generateReferralCodeForUser(uid: string, name?: string): string {
  const cleanName = (name || 'VIP')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4);
  const uidFragment = uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  return `${cleanName || 'GBG'}${uidFragment || '8888'}`;
}

export function buildReferralUrl(referralCode: string): string {
  if (typeof window === 'undefined') return `https://globalbusinessgenerator.com/?ref=${referralCode}`;
  const origin = window.location.origin;
  const path = window.location.pathname;
  return `${origin}${path}?ref=${referralCode}`;
}

/**
 * Initializes or retrieves referral tracking record in Firestore
 */
export async function getOrCreateUserReferralRecord(
  userId: string,
  userName: string,
  existingCode?: string
): Promise<ReferralRecord> {
  const code = existingCode || generateReferralCodeForUser(userId, userName);
  const refDoc = doc(db, 'referrals', code);

  try {
    const snap = await getDoc(refDoc);
    if (snap.exists()) {
      return snap.data() as ReferralRecord;
    }

    const newRecord: ReferralRecord = {
      referralCode: code,
      userId,
      userName: userName || 'Entrepreneur',
      createdAt: new Date().toISOString(),
      clicksCount: 0,
      signupsCount: 0,
      conversionsCount: 0,
      recentEvents: [],
    };

    await setDoc(refDoc, newRecord);
    return newRecord;
  } catch (err) {
    console.warn('Could not sync referral document in Firestore:', err);
    return {
      referralCode: code,
      userId,
      userName,
      createdAt: new Date().toISOString(),
      clicksCount: 0,
      signupsCount: 0,
      conversionsCount: 0,
    };
  }
}

/**
 * Records an inbound referral visit
 */
export async function trackReferralVisit(code: string): Promise<void> {
  if (!code || code.trim() === '') return;
  const cleanCode = code.trim().toUpperCase();

  // Store in localStorage for attribution window
  if (typeof window !== 'undefined') {
    localStorage.setItem('gbg_active_referral', cleanCode);
  }

  // Analytics event
  Analytics.referralClick(cleanCode, typeof window !== 'undefined' ? window.location.href : '');

  try {
    const refDoc = doc(db, 'referrals', cleanCode);
    const snap = await getDoc(refDoc);
    if (snap.exists()) {
      await updateDoc(refDoc, {
        clicksCount: increment(1),
        recentEvents: arrayUnion({
          type: 'click',
          timestamp: new Date().toISOString(),
        }),
      });
    }
  } catch (err) {
    console.debug('Inbound referral counter skipped:', err);
  }
}

/**
 * Records a successful registration from a referred user
 */
export async function recordReferralSignup(code: string, newUserId: string): Promise<void> {
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();

  Analytics.registration(newUserId, cleanCode);

  try {
    const refDoc = doc(db, 'referrals', cleanCode);
    const snap = await getDoc(refDoc);
    if (snap.exists()) {
      await updateDoc(refDoc, {
        signupsCount: increment(1),
        recentEvents: arrayUnion({
          type: 'signup',
          timestamp: new Date().toISOString(),
          details: `Entrepreneur joined platform`,
        }),
      });
    }
  } catch (err) {
    console.warn('Referral signup attribution skipped:', err);
  }
}

/**
 * Records a business plan completion from a referred user
 */
export async function recordReferralPlanConversion(code: string, planId: string): Promise<void> {
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();

  try {
    const refDoc = doc(db, 'referrals', cleanCode);
    const snap = await getDoc(refDoc);
    if (snap.exists()) {
      await updateDoc(refDoc, {
        conversionsCount: increment(1),
        recentEvents: arrayUnion({
          type: 'conversion',
          timestamp: new Date().toISOString(),
          details: `Completed 34-section business plan (${planId.slice(0, 8)})`,
        }),
      });
    }
  } catch (err) {
    console.warn('Referral plan conversion attribution skipped:', err);
  }
}

/**
 * Gets currently active referral code stored in localStorage
 */
export function getActiveReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gbg_active_referral');
}

/**
 * Captures referral code from query params or hash and persists it
 */
export function captureReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  let ref = urlParams.get('ref');

  if (!ref && window.location.hash.includes('ref=')) {
    const hashPart = window.location.hash.split('ref=')[1];
    ref = hashPart ? hashPart.split('&')[0] : null;
  }

  if (ref && ref.trim() !== '') {
    const clean = ref.trim().toUpperCase();
    trackReferralVisit(clean);
    return clean;
  }
  return getActiveReferralCode();
}

/**
 * Fetches current stats for the user's referral code
 */
export async function getReferralStats(code: string): Promise<ReferralRecord | null> {
  if (!code) return null;
  try {
    const refDoc = doc(db, 'referrals', code.trim().toUpperCase());
    const snap = await getDoc(refDoc);
    if (snap.exists()) {
      return snap.data() as ReferralRecord;
    }
  } catch (err) {
    console.warn('Error fetching referral stats:', err);
  }
  return null;
}
