import React, { useState } from 'react';
import { 
  X as CloseIcon, 
  Sparkles, 
  Share2, 
  ArrowRight, 
  Gift, 
  Eye, 
  Copy, 
  Check, 
  MessageCircle, 
  Linkedin, 
  Twitter, 
  Facebook,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import { BusinessPlan, UserProfile } from '../types';
import { buildReferralUrl } from '../lib/referralService';
import { Analytics } from '../lib/analytics';
import { incrementPlanShareCount } from '../lib/firebase';

interface PlanCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: BusinessPlan;
  userProfile?: UserProfile | null;
  onOpenMarketingKit: () => void;
  onViewPublicPage: (slug: string) => void;
}

export const PlanCompletedModal: React.FC<PlanCompletedModalProps> = ({
  isOpen,
  onClose,
  plan,
  userProfile,
  onOpenMarketingKit,
  onViewPublicPage,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!isOpen) return null;

  const referralCode = userProfile?.referralCode;
  const publicSlug = plan.shareSlug || plan.id;
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const publicPlanUrl = `${baseUrl}#plan=${publicSlug}${referralCode ? `&ref=${referralCode}` : ''}`;
  const referralUrl = referralCode ? buildReferralUrl(referralCode) : publicPlanUrl;

  const handleCopyPlanLink = () => {
    navigator.clipboard.writeText(publicPlanUrl);
    setCopiedLink(true);
    Analytics.shareClick('copy_link', 'plan', plan.id);
    incrementPlanShareCount(plan.id);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedRef(true);
    Analytics.shareClick('copy_referral', 'referral', referralCode || 'code');
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleShareSocial = (platform: string, shareEndpoint: string) => {
    Analytics.shareClick(platform, 'plan', plan.id);
    incrementPlanShareCount(plan.id);
    window.open(shareEndpoint, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const shareText = encodeURIComponent(
    `I just generated the complete 34-section business plan for ${plan.input.businessName} on Global Business Generator! 🚀\n\nCheck out the overview:\n${publicPlanUrl}\n\n— Created with Global Business Generator`
  );
  const encodedUrl = encodeURIComponent(publicPlanUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>34-Section Strategic Blueprint Ready</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Your business plan is ready. Share your idea and invite someone to build theirs.
            </h2>

            <p className="text-xs text-indigo-100/90 leading-relaxed">
              Showcase <strong>{plan.input.businessName}</strong> to mentors, partners, or customers, and invite fellow founders to launch their ventures.
            </p>
          </div>
        </div>

        {/* Action Body */}
        <div className="p-6 space-y-5">
          {/* Quick Social Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              1-Click Share Your New Venture
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleShareSocial('whatsapp', `https://api.whatsapp.com/send?text=${shareText}`)}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleShareSocial('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] font-semibold text-xs transition-colors"
              >
                <Linkedin className="w-5 h-5 text-[#0077b5]" />
                <span>LinkedIn</span>
              </button>

              <button
                onClick={() => handleShareSocial('x_twitter', `https://twitter.com/intent/tweet?text=${shareText}`)}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                <Twitter className="w-5 h-5 text-slate-800" />
                <span>X / Twitter</span>
              </button>

              <button
                onClick={() => handleShareSocial('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Quick Direct Link */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Public Showcase Link
              </span>
              <span className="text-xs font-mono text-slate-700 truncate block">
                {publicPlanUrl}
              </span>
            </div>
            <button
              onClick={handleCopyPlanLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                copiedLink ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copiedLink ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>

          {/* Two Viral Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenMarketingKit();
              }}
              className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-left transition-colors flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-950 block">Launch & Marketing Kit</span>
                <span className="text-[11px] text-indigo-700 leading-tight block mt-0.5">
                  Get social captions, launch PR, and 5 growth ideas.
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                onClose();
                onViewPublicPage(publicSlug);
              }}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 group-hover:scale-105 transition-transform">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">View Public Page</span>
                <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                  See how visitors and investors view your executive summary.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Attribution: <em>Created with Global Business Generator</em>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
          >
            <span>Review Full 34 Sections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
