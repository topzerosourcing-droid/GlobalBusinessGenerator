import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  increment,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, BusinessPlan, isPermanentSuperAdminEmail, PERMANENT_SUPER_ADMIN_EMAILS } from '../types';
import { 
  generateReferralCodeForUser, 
  recordReferralSignup, 
  recordReferralPlanConversion,
  getOrCreateUserReferralRecord
} from './referralService';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Ensure we pass the specific firestoreDatabaseId if configured (fallback to default)
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

export const storage = getStorage(app);

// Initialize Firebase Analytics with measurement ID: G-WRKKP8RRND
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// Authentication helpers
export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const logout = async () => {
  return await signOut(auth);
};

// User Profile Local Storage Helpers for Offline Resilience
export const getCachedUserProfile = (uid: string): UserProfile | null => {
  if (typeof window === 'undefined' || !uid) return null;
  try {
    const raw = localStorage.getItem(`gbg_profile_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // Non-blocking
  }
  return null;
};

export const setCachedUserProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined' || !profile?.uid) return;
  try {
    localStorage.setItem(`gbg_profile_${profile.uid}`, JSON.stringify(profile));
  } catch {
    // Non-blocking
  }
};

/**
 * Remove any undefined keys from an object to ensure Firestore compatibility
 */
export const stripUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

// User Profile Firestore helpers with robust offline resilience
export const getUserProfile = async (uid: string, emailHint?: string | null): Promise<UserProfile | null> => {
  if (!uid) return null;

  // 1. If navigator indicates offline, immediately return cached profile if available
  const isOfflineBrowser = typeof navigator !== 'undefined' && !navigator.onLine;
  const cached = getCachedUserProfile(uid);

  if (isOfflineBrowser && cached) {
    return { ...cached, _isOfflineFallback: true } as UserProfile;
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      const targetEmail = data.email || emailHint || auth.currentUser?.email || auth.currentUser?.providerData?.[0]?.email;
      
      // Auto-upgrade permanent super admin if needed
      if (isPermanentSuperAdminEmail(targetEmail) && (data.role !== 'SUPER_ADMIN' || data.tier !== 'enterprise' || data.status !== 'active')) {
        const upgraded: Partial<UserProfile> = {
          role: 'SUPER_ADMIN',
          tier: 'enterprise',
          status: 'active',
          isActive: true,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(userDocRef, stripUndefined(upgraded));
        try {
          await setDoc(doc(db, 'super_admins', uid), {
            uid,
            email: targetEmail || data.email,
            role: 'SUPER_ADMIN',
            verifiedAt: new Date().toISOString()
          }, { merge: true });
        } catch {
          // Non-blocking
        }
        const merged = { ...data, ...upgraded };
        setCachedUserProfile(merged);
        return merged;
      }

      setCachedUserProfile(data);
      return data;
    }

    // Document truly does not exist in Firestore
    return null;
  } catch (err: any) {
    const isOfflineErr = 
      err?.code === 'unavailable' ||
      err?.code === 'failed-precondition' ||
      err?.message?.includes('offline') ||
      err?.message?.includes('client is offline') ||
      err?.message?.includes('network') ||
      (typeof navigator !== 'undefined' && !navigator.onLine);

    if (isOfflineErr) {
      console.debug('[Firebase] Client is offline; using cached or fallback profile.');
      if (cached) {
        return { ...cached, _isOfflineFallback: true } as UserProfile;
      }
      // Construct fallback provisional profile from authenticated user
      const currentUser = auth.currentUser;
      const targetEmail = currentUser?.email || emailHint || '';
      const isSuperAdmin = isPermanentSuperAdminEmail(targetEmail);
      const fallback: UserProfile = {
        uid,
        name: currentUser?.displayName || targetEmail.split('@')[0] || 'Entrepreneur',
        email: targetEmail,
        country: 'United States',
        preferredCurrency: 'USD',
        createdAt: new Date().toISOString(),
        tier: isSuperAdmin ? 'enterprise' : 'free',
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
        status: 'active',
        isActive: true,
        businessPlansCount: 0,
        referralClicksCount: 0,
        referralSignupsCount: 0,
        referralConversionsCount: 0,
        _isOfflineFallback: true,
      } as any;
      return fallback;
    }

    // Non-offline unexpected error
    console.warn('[Firebase] Warning fetching user profile:', err?.message || err);
    return cached || null;
  }
};

export const syncUserProfile = async (
  user: User, 
  additionalData?: { country?: string; preferredCurrency?: string; name?: string }
): Promise<UserProfile> => {
  const userDocRef = doc(db, 'users', user.uid);
  const resolvedEmail = user.email || user.providerData?.find(p => p.email)?.email || '';
  const isSuperAdmin = isPermanentSuperAdminEmail(resolvedEmail);
  const cached = getCachedUserProfile(user.uid);

  // Check if there was an active referral in localStorage
  const activeReferral = typeof window !== 'undefined' 
    ? localStorage.getItem('gbg_active_referral') || undefined 
    : undefined;

  try {
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      let needsUpdate = false;
      const updates: Partial<UserProfile> = {};

      // Auto-upgrade if permanent super admin
      if (isSuperAdmin && (existing.role !== 'SUPER_ADMIN' || existing.tier !== 'enterprise' || existing.status !== 'active')) {
        updates.role = 'SUPER_ADMIN';
        updates.tier = 'enterprise';
        updates.status = 'active';
        updates.isActive = true;
        needsUpdate = true;

        try {
          await setDoc(doc(db, 'super_admins', user.uid), {
            uid: user.uid,
            email: resolvedEmail || user.email,
            role: 'SUPER_ADMIN',
            verifiedAt: new Date().toISOString()
          }, { merge: true });
        } catch {
          // Continue
        }
      }
      
      // If existing user has no referral code yet, backfill it
      if (!existing.referralCode) {
        const code = generateReferralCodeForUser(user.uid, existing.name);
        updates.referralCode = code;
        needsUpdate = true;
        await getOrCreateUserReferralRecord(user.uid, existing.name, code);
      }

      // If additional data provided, update
      if (additionalData?.country && additionalData.country !== existing.country) {
        updates.country = additionalData.country;
        needsUpdate = true;
      }
      if (additionalData?.preferredCurrency && additionalData.preferredCurrency !== existing.preferredCurrency) {
        updates.preferredCurrency = additionalData.preferredCurrency;
        needsUpdate = true;
      }
      if (additionalData?.name && additionalData.name !== existing.name) {
        updates.name = additionalData.name;
        needsUpdate = true;
      }

      if (needsUpdate) {
        updates.updatedAt = new Date().toISOString();
        await updateDoc(userDocRef, stripUndefined(updates));
        const updated = { ...existing, ...updates };
        setCachedUserProfile(updated);
        return updated;
      }
      setCachedUserProfile(existing);
      return existing;
    }
  } catch (readErr: any) {
    const isOffline = 
      readErr?.code === 'unavailable' ||
      readErr?.message?.includes('offline') ||
      (typeof navigator !== 'undefined' && !navigator.onLine);

    if (isOffline && cached) {
      return { ...cached, _isOfflineFallback: true } as UserProfile;
    }
  }

  // Detect locale defaults for country and currency
  const defaultCurrency = additionalData?.preferredCurrency || 'USD';
  const defaultCountry = additionalData?.country || 'United States';
  const displayName = additionalData?.name || user.displayName || user.email?.split('@')[0] || 'Entrepreneur';
  const myReferralCode = generateReferralCodeForUser(user.uid, displayName);

  // Record referral attribution if registered via an invite link
  const referredByCode = (activeReferral && activeReferral !== myReferralCode) ? activeReferral : undefined;

  const rawProfile: Record<string, any> = {
    uid: user.uid,
    name: displayName,
    email: user.email || '',
    country: defaultCountry,
    preferredCurrency: defaultCurrency,
    createdAt: new Date().toISOString(),
    tier: isSuperAdmin ? 'enterprise' : 'free',
    role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
    status: 'active',
    isActive: true,
    businessPlansCount: 0,
    referralCode: myReferralCode,
    referralClicksCount: 0,
    referralSignupsCount: 0,
    referralConversionsCount: 0,
  };

  if (user.photoURL) {
    rawProfile.photoURL = user.photoURL;
  }
  if (referredByCode) {
    rawProfile.referredBy = referredByCode;
  }

  const newProfile = stripUndefined(rawProfile) as UserProfile;
  setCachedUserProfile(newProfile);

  try {
    await setDoc(userDocRef, newProfile);
    
    // Register in super_admins directory if applicable
    if (isSuperAdmin) {
      await setDoc(doc(db, 'super_admins', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'SUPER_ADMIN',
        verifiedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Initialize referral record for user
    await getOrCreateUserReferralRecord(user.uid, displayName, myReferralCode);

    // Attribute signup to referrer
    if (referredByCode) {
      await recordReferralSignup(referredByCode, user.uid);
    }
  } catch (writeErr: any) {
    const isOffline = 
      writeErr?.code === 'unavailable' ||
      writeErr?.message?.includes('offline') ||
      (typeof navigator !== 'undefined' && !navigator.onLine);
    if (isOffline) {
      console.debug('[Firebase] Profile sync deferred while offline.');
    } else {
      console.warn('[Firebase] Warning syncing user profile:', writeErr?.message || writeErr);
    }
  }

  return newProfile;
};

export const updateUserProfileData = async (
  uid: string, 
  data: Partial<UserProfile>
): Promise<void> => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

// Helper to generate a clean URL-friendly share slug
export function generateShareSlug(businessName: string): string {
  const base = (businessName || 'venture')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 32);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${base || 'venture'}-${randomSuffix}`;
}

// Business Plan Firestore helpers
export const saveBusinessPlanToFirestore = async (
  userId: string, 
  plan: Omit<BusinessPlan, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  const planId = plan.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const planRef = doc(db, 'business_plans', planId);

  const now = new Date().toISOString();
  const shareSlug = plan.shareSlug || generateShareSlug(plan.input.businessName);

  const planData: BusinessPlan = {
    ...plan,
    id: planId,
    userId,
    shareSlug,
    isPublic: plan.isPublic !== undefined ? plan.isPublic : true,
    viewsCount: plan.viewsCount || 0,
    sharesCount: plan.sharesCount || 0,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(planRef, planData);

  // Update plans count on user profile and check for referral conversion
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      const count = (userData.businessPlansCount || 0) + 1;
      await updateDoc(userRef, { businessPlansCount: count });

      // If this is the user's first plan and they were referred, attribute conversion
      if (count === 1 && userData.referredBy) {
        await recordReferralPlanConversion(userData.referredBy, planId);
      }
    }
  } catch (e) {
    console.warn('Could not update user plan count / referral conversion:', e);
  }

  return planId;
};

export const getUserBusinessPlans = async (userId: string): Promise<BusinessPlan[]> => {
  try {
    const plansRef = collection(db, 'business_plans');
    const q = query(plansRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const plans: BusinessPlan[] = [];
    snapshot.forEach(docSnap => {
      plans.push(docSnap.data() as BusinessPlan);
    });
    // sort newest first
    return plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error getting business plans:', err);
    return [];
  }
};

/**
 * Public plan fetcher: safely queries by shareSlug or planId.
 * Strips out any private user identity info (e.g. userId) to ensure privacy.
 */
export const getPublicBusinessPlan = async (slugOrId: string): Promise<BusinessPlan | null> => {
  try {
    const plansRef = collection(db, 'business_plans');

    // 1. Try match by shareSlug
    const slugQuery = query(plansRef, where('shareSlug', '==', slugOrId), limit(1));
    const slugSnap = await getDocs(slugQuery);
    if (!slugSnap.empty) {
      const plan = slugSnap.docs[0].data() as BusinessPlan;
      if (plan.isPublic !== false) {
        // Mask userId for privacy
        return { ...plan, userId: 'anonymized_entrepreneur' };
      }
    }

    // 2. Try match by direct doc id
    const docRef = doc(db, 'business_plans', slugOrId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const plan = docSnap.data() as BusinessPlan;
      if (plan.isPublic !== false) {
        return { ...plan, userId: 'anonymized_entrepreneur' };
      }
    }

    return null;
  } catch (err) {
    console.error('Error fetching public business plan:', err);
    return null;
  }
};

export const incrementPlanViewCount = async (planId: string): Promise<void> => {
  try {
    const planRef = doc(db, 'business_plans', planId);
    await updateDoc(planRef, { viewsCount: increment(1) });
  } catch (err) {
    // Non-critical
  }
};

export const incrementPlanShareCount = async (planId: string): Promise<void> => {
  try {
    const planRef = doc(db, 'business_plans', planId);
    await updateDoc(planRef, { sharesCount: increment(1) });
  } catch (err) {
    // Non-critical
  }
};

export const deleteBusinessPlanFromFirestore = async (planId: string): Promise<void> => {
  const planRef = doc(db, 'business_plans', planId);
  await deleteDoc(planRef);
};

export const updateBusinessPlanInFirestore = async (
  planId: string,
  updatedData: Partial<BusinessPlan>
): Promise<void> => {
  const planRef = doc(db, 'business_plans', planId);
  await updateDoc(planRef, {
    ...updatedData,
    updatedAt: new Date().toISOString(),
  });
};

// =========================================================================
// SUPER ADMIN MANAGEMENT API & FIRESTORE HELPERS
// =========================================================================

/**
 * Super Admin: Retrieve all users across the entire system.
 * Guaranteed to list permanent super admins topogabolekwe@gmail.com and gabolekwetopo@gmail.com.
 */
export const getAllUsersForAdmin = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    const usersMap = new Map<string, UserProfile>();

    snap.forEach((docSnap) => {
      const u = docSnap.data() as UserProfile;
      // If email matches permanent super admin, enforce role & status
      if (isPermanentSuperAdminEmail(u.email)) {
        u.role = 'SUPER_ADMIN';
        u.tier = 'enterprise';
        u.status = 'active';
        u.isActive = true;
      }
      usersMap.set(u.email?.toLowerCase() || u.uid, u);
    });

    // Ensure both permanent super admin accounts are present in the list
    PERMANENT_SUPER_ADMIN_EMAILS.forEach((adminEmail) => {
      const normalized = adminEmail.toLowerCase();
      if (!usersMap.has(normalized)) {
        const placeholderAdmin: UserProfile = {
          uid: `super_admin_${normalized.replace(/[^a-z0-9]/g, '_')}`,
          name: normalized.includes('topo') ? 'Topo Gabolekwe (Super Admin)' : 'Super Admin',
          email: adminEmail,
          country: 'Botswana / Global',
          preferredCurrency: 'USD',
          createdAt: new Date().toISOString(),
          tier: 'enterprise',
          role: 'SUPER_ADMIN',
          status: 'active',
          isActive: true,
          businessPlansCount: 0,
          referralClicksCount: 0,
          referralSignupsCount: 0,
          referralConversionsCount: 0,
        };
        usersMap.set(normalized, placeholderAdmin);
      }
    });

    return Array.from(usersMap.values()).sort((a, b) => {
      // Super admins always first
      if (a.role === 'SUPER_ADMIN' && b.role !== 'SUPER_ADMIN') return -1;
      if (b.role === 'SUPER_ADMIN' && a.role !== 'SUPER_ADMIN') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (err) {
    console.error('Failed to fetch users for admin:', err);
    // Return at least the permanent super admins
    return PERMANENT_SUPER_ADMIN_EMAILS.map((email) => ({
      uid: `super_admin_${email.replace(/[^a-z0-9]/g, '_')}`,
      name: 'Super Admin',
      email,
      country: 'Botswana / Global',
      preferredCurrency: 'USD',
      createdAt: new Date().toISOString(),
      tier: 'enterprise',
      role: 'SUPER_ADMIN',
      status: 'active',
      isActive: true,
    }));
  }
};

/**
 * Super Admin: Provision or update any user profile.
 * Protects permanent super admin accounts from demotion.
 */
export const updateUserByAdmin = async (
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  
  if (snap.exists()) {
    const existing = snap.data() as UserProfile;
    if (isPermanentSuperAdminEmail(existing.email)) {
      // Cannot demote permanent super admin
      updates.role = 'SUPER_ADMIN';
      updates.status = 'active';
      updates.isActive = true;
    }
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } else {
    // If provisioning a new user
    await setDoc(userRef, {
      uid: userId,
      createdAt: new Date().toISOString(),
      status: 'active',
      isActive: true,
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }
};

/**
 * Super Admin: Deactivate or reactivate a user account.
 * Permanently protects permanent super admin accounts from deactivation.
 */
export const toggleUserStatusByAdmin = async (
  userId: string,
  email: string,
  currentStatus: 'active' | 'deactivated' | 'suspended' | undefined
): Promise<'active' | 'deactivated'> => {
  if (isPermanentSuperAdminEmail(email)) {
    throw new Error('Permanent Super Admin accounts (topogabolekwe@gmail.com, gabolekwetopo@gmail.com) cannot be deactivated.');
  }

  const newStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    status: newStatus,
    isActive: newStatus === 'active',
    updatedAt: new Date().toISOString()
  });

  return newStatus;
};

/**
 * Super Admin: Retrieve all business plans in the entire platform.
 */
export const getAllBusinessPlansForAdmin = async (): Promise<BusinessPlan[]> => {
  try {
    const plansRef = collection(db, 'business_plans');
    const snapshot = await getDocs(plansRef);
    const plans: BusinessPlan[] = [];
    snapshot.forEach((d) => {
      plans.push(d.data() as BusinessPlan);
    });
    return plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Failed to get all business plans for admin:', err);
    return [];
  }
};

/**
 * Super Admin: Retrieve all entitlements in the system.
 */
export const getAllEntitlementsForAdmin = async (): Promise<any[]> => {
  try {
    const entRef = collection(db, 'entitlements');
    const snap = await getDocs(entRef);
    const entitlements: any[] = [];
    snap.forEach((d) => {
      entitlements.push(d.data());
    });
    return entitlements;
  } catch (err) {
    console.error('Failed to get entitlements for admin:', err);
    return [];
  }
};

/**
 * Super Admin: Manually grant Pro or Investor entitlement to any user/plan.
 */
export const grantManualEntitlementByAdmin = async (
  planId: string,
  userId: string,
  packageId: 'pro' | 'investor',
  adminEmail: string
): Promise<any> => {
  const entId = `ent_manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const token = `SUPER_ADMIN_MANUAL_${adminEmail}_${Date.now()}`;
  
  const entitlement = {
    id: entId,
    userId,
    planId,
    packageId,
    status: 'active',
    grantedAt: new Date().toISOString(),
    grantedBy: adminEmail,
    verificationToken: token,
    features: {
      canViewFull34Sections: true,
      canExportPDF: true,
      canExportInvestorPDF: packageId === 'investor',
      hasFundingAndInvestorPack: packageId === 'investor',
      hasFinancialForecasts: true,
      hasMarketingStrategy: true,
      hasLaunchAndGrowthPlan: true,
      unlockedSections: []
    }
  };

  await setDoc(doc(db, 'entitlements', entId), entitlement);

  // Also update business plan status in firestore to paid
  try {
    await updateDoc(doc(db, 'business_plans', planId), {
      status: 'paid',
      packageId,
      entitlementId: entId,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    // Non-critical if plan is external or not yet saved
  }

  return entitlement;
};

/**
 * Super Admin: Revoke an entitlement.
 */
export const revokeEntitlementByAdmin = async (entitlementId: string): Promise<void> => {
  await updateDoc(doc(db, 'entitlements', entitlementId), {
    status: 'revoked',
    revokedAt: new Date().toISOString()
  });
};
