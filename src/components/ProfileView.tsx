import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  Coins, 
  Calendar, 
  ShieldCheck, 
  Save, 
  Check, 
  Key, 
  Copy, 
  Building2,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GLOBAL_CURRENCIES } from '../data/businessIdeas';

export const ProfileView: React.FC = () => {
  const { user, profile, updateUserPreferences } = useAuth();

  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [country, setCountry] = useState(profile?.country || 'United States');
  const [currency, setCurrency] = useState(profile?.preferredCurrency || 'USD');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await updateUserPreferences({
        name: name.trim(),
        country: country.trim(),
        preferredCurrency: currency,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUserId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Account & Entrepreneur Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Managed directly in your Firestore user document. Preferences automatically set default values on new business plans.
        </p>
      </div>

      {/* Account Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {profile?.name || 'Entrepreneur'}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wide">
              {profile?.tier || 'Free'} Plan
            </span>
          </div>
        </div>

        {/* User ID & Metadata */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Firestore User ID (UID)
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-slate-800 truncate">{user?.uid}</span>
              <button
                id="btn-copy-uid"
                onClick={handleCopyUserId}
                className="text-indigo-600 hover:text-indigo-800 p-1 shrink-0"
                title="Copy User ID"
              >
                {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Profile Created Date
            </span>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Just now'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Regional & Currency Preferences
        </h3>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name / Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id="profile-input-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Country of Residence
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="profile-input-country"
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, United Kingdom, Botswana"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Default Business Currency
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <select
                  id="profile-select-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white"
                >
                  {GLOBAL_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>Profile updated in Firestore</span>
              </span>
            ) : <span />}

            <button
              id="btn-save-profile"
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 transition disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
