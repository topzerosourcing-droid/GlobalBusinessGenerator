import React, { useState } from 'react';
import { X, Lock, Mail, User, Globe, Coins, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GLOBAL_CURRENCIES } from '../data/businessIdeas';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

const POPULAR_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'India',
  'South Africa',
  'Botswana',
  'Nigeria',
  'Kenya',
  'Brazil',
  'Mexico',
  'United Arab Emirates',
  'Switzerland',
  'Netherlands',
  'New Zealand',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { signInWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState('USD');

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      const rawMsg = err?.message || '';
      if (rawMsg.includes('auth/unauthorized-domain')) {
        setError(
          'This domain (globalbusinessgenerator.vercel.app) is pending authorization in the Firebase Console. Go to Firebase Console > Authentication > Settings > Authorized Domains and add globalbusinessgenerator.vercel.app.'
        );
      } else {
        setError(err?.message?.replace('Firebase: ', '') || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please provide your full name.');
        }
        await registerWithEmail(email, password, name.trim(), country, currency);
      }
      onClose();
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      let msg = err?.message || 'Authentication failed. Please check your credentials.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Try signing in.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-3">
            <Globe className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Welcome to Global Business Generator' : 'Join Global Business Generator'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {mode === 'login' 
              ? 'Access your international venture workspace and business plans.'
              : 'Create your entrepreneur profile to begin generating venture strategies.'}
          </p>
        </div>

        {/* Google One-Click Button */}
        <button
          id="btn-auth-google"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:bg-slate-100 transition disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">or continue with email</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="auth-input-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Henderson"
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="auth-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@example.com"
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="auth-input-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select
                    id="auth-select-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white"
                  >
                    {POPULAR_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Currency</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select
                    id="auth-select-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white"
                  >
                    {GLOBAL_CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Founder Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                id="btn-switch-to-register"
                onClick={() => {
                  setError(null);
                  setMode('register');
                }}
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                id="btn-switch-to-login"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
