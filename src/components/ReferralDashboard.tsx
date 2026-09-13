import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  TrendingUp, 
  MousePointerClick, 
  UserCheck, 
  FileCheck2, 
  Share2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Gift
} from 'lucide-react';
import { UserProfile, ReferralRecord } from '../types';
import { buildReferralUrl, getReferralStats } from '../lib/referralService';
import { ShareModal } from './ShareModal';

interface ReferralDashboardProps {
  userProfile: UserProfile;
  onCreatePlan: () => void;
}

export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({
  userProfile,
  onCreatePlan,
}) => {
  const [stats, setStats] = useState<ReferralRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const referralCode = userProfile.referralCode || 'GBG' + userProfile.uid.slice(0, 4).toUpperCase();
  const referralUrl = buildReferralUrl(referralCode);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getReferralStats(referralCode);
      if (data) {
        setStats(data);
      } else {
        setStats({
          referralCode,
          userId: userProfile.uid,
          userName: userProfile.name,
          createdAt: userProfile.createdAt,
          clicksCount: userProfile.referralClicksCount || 0,
          signupsCount: userProfile.referralSignupsCount || 0,
          conversionsCount: userProfile.referralConversionsCount || 0,
          recentEvents: [],
        });
      }
    } catch (e) {
      console.warn('Could not fetch referral record:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [referralCode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const clicks = stats?.clicksCount || 0;
  const signups = stats?.signupsCount || 0;
  const conversions = stats?.conversionsCount || 0;
  const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10 backdrop-blur-xs">
            <Gift className="w-3.5 h-3.5 text-indigo-300" />
            <span>Viral Referral Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Invite Founders & Earn Creator Rewards
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Share your unique invite link with aspiring entrepreneurs, business partners, or colleagues. 
            When they create an account and generate their first 34-section business plan, both of you unlock priority AI generation and platform recognition.
          </p>

          {/* Share Link Box */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-indigo-200 mb-2">
              Your Personal Referral Link & Code
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
              <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 backdrop-blur-xs">
                <LinkIcon className="w-4 h-4 text-indigo-300 shrink-0" />
                <span className="text-xs font-mono text-white truncate">{referralUrl}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/40 text-[10px] font-bold uppercase tracking-wider text-indigo-100 shrink-0">
                  {referralCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-slate-900 hover:bg-slate-100 active:scale-95'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Link Clicks</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {clicks.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total inbound referral visits</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrations</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {signups.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Users joined with your link</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plans Completed</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {conversions.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Full 34-section plans generated</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversion Rate</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {conversionRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Visits converted to plans</p>
        </div>
      </div>

      {/* Referral Program Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900">Share Your Custom Link</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Send your link via WhatsApp, LinkedIn, X, or email to friends or business founders who have an idea.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900">They Sign Up & Build</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            When they register with your code attached, their account is attributed to you permanently.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900">Unlock Global Badges</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Track live conversion stats in this dashboard with automatic attribution and priority model throughput.
          </p>
        </div>
      </div>

      {/* Recent Referral Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Referral Milestones</h2>
            <p className="text-xs text-slate-500">Live events recorded from your referral link</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {stats?.recentEvents && stats.recentEvents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.recentEvents.slice().reverse().map((evt, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    evt.type === 'conversion' ? 'bg-purple-500' :
                    evt.type === 'signup' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`} />
                  <div>
                    <span className="font-semibold text-slate-800 capitalize">
                      {evt.type === 'conversion' ? 'Plan Completed' :
                       evt.type === 'signup' ? 'New Registration' : 'Link Click'}
                    </span>
                    {evt.details && <span className="text-slate-500 ml-2">— {evt.details}</span>}
                  </div>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {new Date(evt.timestamp).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No referral activity recorded yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Share your link above to begin tracking visits, signups, and completed business plans.
            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Join Global Business Generator"
        shareUrl={referralUrl}
        summaryText={`Turn any business idea into a professional 34-section business plan with Global Business Generator! Use my invite link:`}
        itemType="referral"
        referralCode={referralCode}
      />
    </div>
  );
};
