import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { auth, googleProvider, syncUserProfile, getUserProfile, updateUserProfileData } from '../lib/firebase';
import { UserProfile, isPermanentSuperAdminEmail } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isSuperAdmin: boolean;
  loading: boolean;
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

  const loadUserProfile = async (firebaseUser: User, fallbackData?: { name?: string; country?: string; currency?: string }) => {
    try {
      let existingProfile = await getUserProfile(firebaseUser.uid);
      if (!existingProfile) {
        existingProfile = await syncUserProfile(firebaseUser, {
          name: fallbackData?.name || firebaseUser.displayName || 'Founder',
          country: fallbackData?.country || 'United States',
          preferredCurrency: fallbackData?.currency || 'USD',
        });
      }
      setProfile(existingProfile);
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await loadUserProfile(result.user);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await loadUserProfile(result.user);
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
      await loadUserProfile(user);
    }
  };

  const isSuperAdmin = Boolean(
    (user?.email && isPermanentSuperAdminEmail(user.email)) ||
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
