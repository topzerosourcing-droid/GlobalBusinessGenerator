import React, { useState } from 'react';
import { 
  X as CloseIcon, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  Linkedin, 
  Facebook, 
  MessageCircle, 
  Instagram, 
  Lightbulb, 
  Megaphone, 
  FileText, 
  RefreshCw 
} from 'lucide-react';
import { AIMarketingKit, BusinessPlanInput, GeneratedPlanContent } from '../types';
import { generateMarketingKitWithAI } from '../server/geminiService';

interface MarketingKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: BusinessPlanInput;
  plan?: Partial<GeneratedPlanContent>;
  initialMarketingKit?: AIMarketingKit;
  onKitUpdated?: (kit: AIMarketingKit) => void;
}

export const MarketingKitModal: React.FC<MarketingKitModalProps> = ({
  isOpen,
  onClose,
  input,
  plan,
  initialMarketingKit,
  onKitUpdated,
}) => {
  const [kit, setKit] = useState<AIMarketingKit | null>(initialMarketingKit || null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'social' | 'pitch' | 'ideas'>('social');

  React.useEffect(() => {
    if (isOpen && !kit) {
      loadOrGenerateKit();
    }
  }, [isOpen]);

  const loadOrGenerateKit = async () => {
    setLoading(true);
    try {
      // First try API route
      const res = await fetch('/api/generate-marketing-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, plan }),
      });
      if (res.ok) {
        const data = await res.json();
        setKit(data);
        if (onKitUpdated) onKitUpdated(data);
      } else {
        // Fallback to client service
        const data = await generateMarketingKitWithAI(input, plan);
        setKit(data);
        if (onKitUpdated) onKitUpdated(data);
      }
    } catch (e) {
      console.warn('API error, using direct service:', e);
      const data = await generateMarketingKitWithAI(input, plan);
      setKit(data);
      if (onKitUpdated) onKitUpdated(data);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">AI Launch & Marketing Kit</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                  Viral Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ready-to-post launch materials and promotional assets tailored for {input.businessName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadOrGenerateKit}
              disabled={loading}
              title="Regenerate Kit with AI"
              className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2">
          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'social'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Social Media Launch Posts
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'pitch'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Headlines & Company Pitch
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'ideas'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            5 Guerrilla Marketing Ideas
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Generating AI Marketing Kit...</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Crafting customized social media launch copy, press announcements, and acquisition tactics for {input.businessName}.
              </p>
            </div>
          ) : kit ? (
            <>
              {/* TAB 1: SOCIAL POSTS */}
              {activeTab === 'social' && (
                <div className="space-y-4">
                  {/* LinkedIn Post */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <div className="p-1 rounded bg-[#0077b5]/10 text-[#0077b5]">
                          <Linkedin className="w-4 h-4" />
                        </div>
                        <span>LinkedIn Founder Launch Post</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(kit.linkedInPost, 'linkedin')}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {copiedKey === 'linkedin' ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy Post</>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      {kit.linkedInPost}
                    </p>
                  </div>

                  {/* Facebook Post */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <div className="p-1 rounded bg-[#1877f2]/10 text-[#1877f2]">
                          <Facebook className="w-4 h-4" />
                        </div>
                        <span>Facebook Community Post</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(kit.facebookPost, 'facebook')}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {copiedKey === 'facebook' ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy Post</>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      {kit.facebookPost}
                    </p>
                  </div>

                  {/* WhatsApp Status */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <div className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <span>WhatsApp Status / Broadcast Update</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(kit.whatsAppStatus, 'whatsapp')}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {copiedKey === 'whatsapp' ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy Status</>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      {kit.whatsAppStatus}
                    </p>
                  </div>

                  {/* Instagram Caption */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <div className="p-1 rounded bg-gradient-to-tr from-amber-500 to-pink-500 text-white">
                          <Instagram className="w-3.5 h-3.5" />
                        </div>
                        <span>Instagram Caption & Hashtags</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(kit.instagramCaption, 'instagram')}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {copiedKey === 'instagram' ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy Caption</>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      {kit.instagramCaption}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: PITCH & ANNOUNCEMENT */}
              {activeTab === 'pitch' && (
                <div className="space-y-4">
                  {/* Promotional Headline */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                        High-Impact Promotional Headline
                      </span>
                      <button
                        onClick={() => copyToClipboard(kit.promotionalHeadline, 'headline')}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {copiedKey === 'headline' ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy</>
                        )}
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-900 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                      "{kit.promotionalHeadline}"
                    </p>
                  </div>

                  {/* Short Business Launch Announcement */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Short Business Launch Announcement (Media / PR)
                      </span>
                      <button
                        onClick={() => copyToClipboard(kit.shortAnnouncement, 'announcement')}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {copiedKey === 'announcement' ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy</>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                      {kit.shortAnnouncement}
                    </p>
                  </div>

                  {/* 3-Sentence Business Description */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Core Business Description (One-Pager / Directory)
                      </span>
                      <button
                        onClick={() => copyToClipboard(kit.businessDescription, 'description')}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {copiedKey === 'description' ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy</>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                      {kit.businessDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: 5 MARKETING IDEAS */}
              {activeTab === 'ideas' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <p className="text-xs text-slate-600 font-medium">
                      Tailored customer acquisition tactics for your target market in {input.cityRegion || 'your region'}:
                    </p>
                    <button
                      onClick={() => copyToClipboard(kit.marketingIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n\n'), 'all_ideas')}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      {copiedKey === 'all_ideas' ? (
                        <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied All</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy All 5 Ideas</>
                      )}
                    </button>
                  </div>

                  {kit.marketingIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">{idea}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(idea, `idea_${idx}`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="Copy idea"
                      >
                        {copiedKey === `idea_${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Content attribution: <strong>Created with Global Business Generator</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            Close Kit
          </button>
        </div>
      </div>
    </div>
  );
};
