import React, { useState } from 'react';
import { 
  X as CloseIcon, 
  Copy, 
  Check, 
  MessageCircle, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Mail, 
  Share2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Analytics } from '../lib/analytics';
import { incrementPlanShareCount } from '../lib/firebase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareUrl: string;
  summaryText?: string;
  itemType?: 'plan' | 'idea' | 'referral';
  targetId?: string;
  referralCode?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  shareUrl,
  summaryText,
  itemType = 'plan',
  targetId = 'general',
  referralCode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const attribution = 'Created with Global Business Generator';
  const effectiveUrl = referralCode && !shareUrl.includes('ref=') 
    ? `${shareUrl}${shareUrl.includes('?') ? '&' : '?'}ref=${referralCode}` 
    : shareUrl;

  const defaultSummary = summaryText || `Check out this business plan for ${title} on Global Business Generator!`;
  const shareText = `${defaultSummary}\n\n${attribution}\n${effectiveUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(effectiveUrl);
    setCopied(true);
    Analytics.shareClick('copy_link', itemType, targetId);
    if (itemType === 'plan' && targetId) {
      incrementPlanShareCount(targetId);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareClick = (platform: string, openUrl: string) => {
    Analytics.shareClick(platform, itemType, targetId);
    if (itemType === 'plan' && targetId) {
      incrementPlanShareCount(targetId);
    }
    window.open(openUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const encodedUrl = encodeURIComponent(effectiveUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(`Business Plan: ${title} — ${attribution}`);

  const shareChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'Popular',
      action: () => handleShareClick('whatsapp', `https://api.whatsapp.com/send?text=${encodedText}`),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0077b5] hover:bg-[#006399] text-white',
      badge: 'B2B',
      action: () => handleShareClick('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`),
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-slate-900 hover:bg-black text-white',
      badge: 'Trending',
      action: () => handleShareClick('x_twitter', `https://twitter.com/intent/tweet?text=${encodedText}`),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877f2] hover:bg-[#1565cc] text-white',
      badge: null,
      action: () => handleShareClick('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-slate-700 hover:bg-slate-800 text-white',
      badge: null,
      action: () => {
        Analytics.shareClick('email', itemType, targetId);
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedText}`;
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Share Business Plan</h3>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick link copy bar */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Direct Public Link
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-indigo-500 transition-colors">
              <input
                type="text"
                readOnly
                value={effectiveUrl}
                className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-700 font-mono focus:outline-none select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
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
            </div>
          </div>

          {/* 1-Click Social Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              1-Click Share Across Networks
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {shareChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <button
                    key={channel.id}
                    onClick={channel.action}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all text-xs font-medium ${channel.color} shadow-xs active:scale-95`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{channel.name}</span>
                    </div>
                    {channel.badge && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20">
                        {channel.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attribution Notice */}
          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Attribution: <strong>{attribution}</strong> automatically appended.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Private financial identity and account emails remain hidden.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
