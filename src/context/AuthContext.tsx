import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { auth, googleProvider, syncUserProfile, getUserProfile, updateUserProfileData, getCachedUserProfile } from '../lib/firebase';
import { UserProfile, isPermanentSuperAdminEmail } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isSuperAdmin: boolean;
  loading: boolean;
  isOffline: boolean;
  connectionStatus: 'online' | 'connecting' | 'offline';
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string, 
    pass: string, 
    name: string, 
    country: string, 
    currency: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'connecting' | 'offline'>('online');

  // Throttling & deduplication refs to prevent tight request loops
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);
  const currentUserRef = useRef<User | null>(null);

  currentUserRef.current = user;

  const loadUserProfile = useCallback(async (
    firebaseUser: User, 
    fallbackData?: { name?: string; country?: string; currency?: string },
    force: boolean = false
  ) => {
    // 1. Auth readiness guard: Never query Firestore before user is ready
    if (!firebaseUser?.uid) {
      return;
    }

    // 2. Loop prevention guard: Do not retry in tight loops (minimum 2s cooldown unless forced)
    const now = Date.now();
    if (!force && isFetchingRef.current) {
      return;
    }
    if (!force && now - lastFetchTimeRef.current < 2000) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;

    // Check if offline
    const isClientOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    if (isClientOffline) {
      setIsOffline(true);
      setConnectionStatus('offline');
    }

    try {
      const emailHint = firebaseUser.email || firebaseUser.providerData?.[0]?.email;
      
      // Attempt to load profile (gracefully falls back to local cache if offline)
      const existingProfile = await getUserProfile(firebaseUser.uid, emailHint);

      if (existingProfile) {
        setProfile(existingProfile);
        if (existingProfile._isOfflineFallback) {
          setIsOffline(true);
          setConnectionStatus('offline');
        } else {
          setIsOffline(false);
          setConnectionStatus('online');
        }
        return;
      }

      // If existingProfile is null AND client is NOT offline, create new profile once
      if (!isClientOffline) {
        const newProfile = await syncUserProfile(firebaseUser, {
          name: fallbackData?.name || firebaseUser.displayName || 'Founder',
          country: fallbackData?.country || 'United States',
          preferredCurrency: fallbackData?.currency || 'USD',
        });
        setProfile(newProfile);
        setIsOffline(false);
        setConnectionStatus('online');
      } else {
        // In offline mode, use cached profile or non-blocking provisional profile
        const cached = getCachedUserProfile(firebaseUser.uid);
        if (cached) {
          setProfile({ ...cached, _isOfflineFallback: true });
        }
        setIsOffline(true);
        setConnectionStatus('offline');
      }
    } catch (err: any) {
      // Normal offline conditions are not logged as fatal application crashes
      const isNetworkError = 
        err?.code === 'unavailable' || 
        err?.message?.includes('offline') || 
        err?.message?.includes('network');

      if (isNetworkError) {
        console.debug('[AuthContext] Temporary offline condition during profile load; session preserved.');
        setIsOffline(true);
        setConnectionStatus('offline');
        const cached = getCachedUserProfile(firebaseUser.uid);
        if (cached) {
          setProfile({ ...cached, _isOfflineFallback: true });
        }
      } else {
        console.warn('[AuthContext] Notice during profile load:', err?.message || err);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Pre-populate with cached profile immediately to prevent UI flicker
        const cached = getCachedUserProfile(currentUser.uid);
        if (cached) {
          setProfile(cached);
        }
        await loadUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  // Online / Offline Connectivity Listeners for Automatic Recovery
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      setConnectionStatus('connecting');
      console.debug('[AuthContext] Network connection restored. Auto-recovering profile...');
      if (currentUserRef.current) {
        await loadUserProfile(currentUserRef.current, undefined, true);
      }
      setConnectionStatus('online');
    };

    const handleOffline = () => {
      setIsOffline(true);
      setConnectionStatus('offline');
      console.debug('[AuthContext] Network connection offline.');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [loadUserProfile]);

  const handleGoogleSignIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await loadUserProfile(result.user, undefined, true);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await loadUserProfile(result.user, undefined, true);
    }
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    country: string, 
    currency: string
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      if (name) {
        await fbUpdateProfile(result.user, { displayName: name });
      }
      const newProf = await syncUserProfile(result.user, {
        name,
        country,
        preferredCurrency: currency,
      });
      setProfile(newProf);
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const updateUserPreferences = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfileData(user.uid, data);
    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user, undefined, true);
    }
  };

  // Robust Super Admin check preserving gabolekwetopo@gmail.com and topogabolekwe@gmail.com
  const isSuperAdmin = Boolean(
    (user?.email && isPermanentSuperAdminEmail(user.email)) ||
    user?.providerData?.some((p) => isPermanentSuperAdminEmail(p.email)) ||
    profile?.role === 'SUPER_ADMIN' ||
    (profile?.email && isPermanentSuperAdminEmail(profile.email))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isSuperAdmin,
        loading,
        isOffline,
        connectionStatus,
        signInWithGoogle: handleGoogleSignIn,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUserPreferences,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
