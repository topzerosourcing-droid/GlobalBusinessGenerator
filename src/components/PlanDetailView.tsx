import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Building, 
  Globe, 
  DollarSign, 
  Users, 
  Copy, 
  Check, 
  RotateCw, 
  Sparkles,
  Layers,
  ChevronDown,
  Edit3,
  Bookmark,
  ShieldAlert,
  FileCheck,
  Lock,
  ArrowRight,
  Award
} from 'lucide-react';
import { 
  BusinessPlan, 
  BusinessPlanSectionKey, 
  PLAN_SECTIONS_META, 
  GeneratedPlanContent,
  SectionCategory,
  PlanPackageId,
  PlanEntitlement
} from '../types';
import { SectionCard } from './SectionCard';
import { SectionEditModal } from './SectionEditModal';
import { AIDisclaimerBanner } from './AIDisclaimerBanner';
import { updateBusinessPlanInFirestore } from '../lib/firebase';
import { ShareModal } from './ShareModal';
import { MarketingKitModal } from './MarketingKitModal';
import { LockedSectionCard } from './LockedSectionCard';
import { InvestorReadinessCard } from './InvestorReadinessCard';
import { CheckoutModal } from './CheckoutModal';
import { useAuth } from '../context/AuthContext';
import { 
  getPlanEntitlement, 
  isSectionUnlocked, 
  PRODUCT_PACKAGES 
} from '../services/entitlementService';
import { Share2, Megaphone, Eye, ShieldCheck } from 'lucide-react';

interface PlanDetailViewProps {
  plan: BusinessPlan;
  onBack: () => void;
  onDelete?: (planId: string) => void;
  onUpdatePlan?: (updatedPlan: BusinessPlan) => void;
  onViewPublicPage?: (slug: string) => void;
  referralCode?: string;
}

type TabCategory = 'ALL' | SectionCategory;

export const PlanDetailView: React.FC<PlanDetailViewProps> = ({
  plan,
  onBack,
  onDelete,
  onUpdatePlan,
  onViewPublicPage,
  referralCode,
}) => {
  const { user, isSuperAdmin } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<BusinessPlan>(plan);
  const [activeCategory, setActiveCategory] = useState<TabCategory>('ALL');
  const [copied, setCopied] = useState(false);
  
  // Entitlement and Monetization State
  const [entitlement, setEntitlement] = useState<PlanEntitlement | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTargetPackage, setCheckoutTargetPackage] = useState<PlanPackageId>('pro');

  // Section Editing Modal State
  const [editingSectionKey, setEditingSectionKey] = useState<BusinessPlanSectionKey | null>(null);

  // Marketing & Share Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMarketingKit, setShowMarketingKit] = useState(false);

  const { input, generatedPlan } = currentPlan;

  // Resolve plan entitlement on mount or plan changes
  useEffect(() => {
    let mounted = true;
    getPlanEntitlement(currentPlan.id, currentPlan.userId, currentPlan, user?.email, isSuperAdmin).then((ent) => {
      if (mounted) {
        setEntitlement(ent);
      }
    });
    return () => {
      mounted = false;
    };
  }, [currentPlan.id, currentPlan.userId, currentPlan.status, user?.email, isSuperAdmin]);

  const isFreePreview = !isSuperAdmin && (!entitlement || entitlement.packageId === 'free');
  const isInvestorTier = isSuperAdmin || entitlement?.packageId === 'investor';
  const isPaid = isSuperAdmin || !isFreePreview;

  const categories: { id: TabCategory; label: string; count: number }[] = [
    { id: 'ALL', label: 'All 34 Sections (Full Document)', count: 34 },
    { id: 'Executive & Core Strategy', label: '1. Executive & Core', count: 4 },
    { id: 'Market, Customers & Competition', label: '2. Market & Customers', count: 5 },
    { id: 'Business Model & Operations', label: '3. Model & Operations', count: 6 },
    { id: 'Financial Forecasts & Cash Flow', label: '4. Financial Projections', count: 8 },
    { id: 'Go-To-Market & Governance', label: '5. Go-To-Market & Risk', count: 5 },
    { id: 'Execution Roadmap & Multi-Year Scale', label: '6. Roadmap & Scale', count: 6 },
  ];

  const visibleSections = PLAN_SECTIONS_META.filter((sec) => {
    if (activeCategory === 'ALL') return true;
    return sec.category === activeCategory;
  });

  const handleCopySummary = () => {
    const exec = generatedPlan.executiveSummary;
    const text = `${input.businessName} — Business Plan (${input.cityRegion}, ${input.country})
Mission: ${exec?.missionStatement || 'N/A'}
Elevator Pitch: ${exec?.elevatorPitch || 'N/A'}
Capital Allocation: ${input.startupCapital} ${input.currency}
Team Headcount: ${input.employeeCount}
Year 1 Revenue Projection: ${generatedPlan.monthlyRevenueForecast?.totalYear1ProjectedRevenue?.toLocaleString() || 'N/A'} ${input.currency}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    if (isFreePreview && !isSuperAdmin) {
      setCheckoutTargetPackage('pro');
      setIsCheckoutOpen(true);
      return;
    }
    window.print();
  };

  const handleOpenUpgrade = (pkg: PlanPackageId = 'pro') => {
    setCheckoutTargetPackage(pkg);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (newEntitlement: PlanEntitlement) => {
    setEntitlement(newEntitlement);
    const updatedPlan: BusinessPlan = {
      ...currentPlan,
      status: 'paid',
      packageId: newEntitlement.packageId,
      entitlementId: newEntitlement.id,
      updatedAt: new Date().toISOString()
    };
    setCurrentPlan(updatedPlan);
    onUpdatePlan?.(updatedPlan);
  };

  const handleSaveSection = async (sectionKey: BusinessPlanSectionKey, newSectionContent: any) => {
    const updatedGeneratedPlan: GeneratedPlanContent = {
      ...currentPlan.generatedPlan,
      [sectionKey]: newSectionContent,
    };

    const updatedPlan: BusinessPlan = {
      ...currentPlan,
      generatedPlan: updatedGeneratedPlan,
      updatedAt: new Date().toISOString(),
    };

    setCurrentPlan(updatedPlan);
    onUpdatePlan?.(updatedPlan);

    // Save to Firestore
    try {
      await updateBusinessPlanInFirestore(currentPlan.id, {
        generatedPlan: updatedGeneratedPlan,
      });
    } catch (err) {
      console.error('Failed to sync updated section to Firestore:', err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl print:p-0">
      
      {/* Free Preview Notification & Upgrade Bar */}
      {isFreePreview && (
        <div 
          id="free-preview-banner"
          className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-indigo-600 p-[1.5px] shadow-lg print-hidden animate-in fade-in slide-in-from-top-3 duration-300"
        >
          <div className="rounded-[15px] bg-slate-950 px-5 py-4 text-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded">
                    Free Preview Mode
                  </span>
                  <span className="text-xs text-slate-300">
                    6 of 34 Sections Available
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5 font-medium">
                  Unlock the full 34-section business plan, 3-year cash flow projections & executive PDF export.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
              <button
                id="banner-unlock-pro-btn"
                onClick={() => handleOpenUpgrade('pro')}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>Unlock Full Business Plan ($29)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                id="banner-unlock-investor-btn"
                onClick={() => handleOpenUpgrade('investor')}
                className="hidden lg:flex px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Investor Package ($69)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Controls Bar (Hidden during Print) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print-hidden">
        <button
          id="btn-plan-back"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Plans</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Entitlement Status Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border">
            {isPaid ? (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="capitalize">{entitlement?.packageId} Plan Unlocked</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Free Preview Tier</span>
              </span>
            )}
          </div>

          <button
            id="btn-open-marketing-kit"
            onClick={() => setShowMarketingKit(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
          >
            <Megaphone className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI Marketing Kit</span>
          </button>

          <button
            id="btn-share-plan-public"
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <Share2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Share</span>
          </button>

          {onViewPublicPage && (
            <button
              id="btn-view-public-page"
              onClick={() => onViewPublicPage(currentPlan.shareSlug || currentPlan.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span>Public Page</span>
            </button>
          )}

          <button
            id="btn-copy-plan-summary"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            id="btn-print-plan"
            onClick={handlePrint}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs transition ${
              isFreePreview
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title={isFreePreview ? 'Upgrade to Pro to export PDF' : 'Print or Save as PDF'}
          >
            {isFreePreview ? <Lock className="h-3.5 w-3.5 text-emerald-200" /> : <Printer className="h-3.5 w-3.5" />}
            <span>{isFreePreview ? 'Export PDF (Pro)' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {/* Plan Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8 print:border-none print:shadow-none print:p-0">
        
        {/* Cover Document Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>34-Section Strategic Business Plan</span>
              </span>
              <span className="text-xs text-slate-400">
                Generated {new Date(currentPlan.createdAt).toLocaleDateString()} • {input.country} Edition
              </span>
              {isInvestorTier && (
                <span className="rounded-md bg-indigo-600 text-white px-2 py-0.5 text-[11px] font-extrabold flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>INVESTOR SUITE ACTIVE</span>
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {input.businessName}
            </h1>
            
            <p className="mt-1.5 text-sm text-slate-600 max-w-2xl leading-relaxed">
              {input.businessIdea}
            </p>
          </div>

          {/* Core Metric Badges */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0 text-xs">
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-800">{input.cityRegion}, {input.country}</span>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                Capital: {input.startupCapital} {input.currency}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800">{input.employeeCount.split(' ')[0]} Headcount</span>
            </div>
          </div>
        </div>

        {/* Global AI Disclaimer Banner */}
        <div className="mt-6">
          <AIDisclaimerBanner />
        </div>

        {/* Category Navigation Tabs (Hidden when printing) */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 print-hidden scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Investor / Capital Raising Suite Module */}
      <InvestorReadinessCard
        plan={currentPlan}
        isUnlocked={isInvestorTier}
        onUpgradeClick={() => handleOpenUpgrade('investor')}
      />

      {/* Table of Contents Quick Selector (Hidden when printing) */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs print-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Document Directory (Showing {visibleSections.length} of 34 Sections)</span>
          </div>
          <span className="text-xs text-slate-400">Click any section to jump directly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {visibleSections.map((sec) => {
            const unlocked = isSectionUnlocked(sec.key, entitlement, isSuperAdmin);
            return (
              <a
                key={sec.key}
                href={`#sec-${sec.key}`}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition truncate ${
                  unlocked
                    ? 'border-slate-100 bg-slate-50/70 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
                    : 'border-amber-200/60 bg-amber-50/40 text-slate-600 hover:bg-amber-100/50'
                }`}
              >
                <span className={`font-extrabold text-[10px] shrink-0 ${unlocked ? 'text-indigo-600' : 'text-amber-700'}`}>
                  {String(sec.number).padStart(2, '0')}
                </span>
                <span className="truncate text-[11px] font-medium">{sec.title}</span>
                {!unlocked && <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0 ml-auto" />}
              </a>
            );
          })}
        </div>
      </div>

      {/* Sections List with Entitlement Gates */}
      <div className="space-y-8">
        {visibleSections.map((sec) => {
          const sectionData = (generatedPlan as any)[sec.key];
          const unlocked = isSectionUnlocked(sec.key, entitlement, isSuperAdmin);

          if (!unlocked) {
            return (
              <div key={sec.key} id={`sec-${sec.key}`} className="scroll-mt-20">
                <LockedSectionCard
                  sectionKey={sec.key}
                  sectionNumber={sec.number}
                  sectionTitle={sec.title}
                  onUpgradeClick={handleOpenUpgrade}
                />
              </div>
            );
          }

          return (
            <div key={sec.key} id={`sec-${sec.key}`} className="scroll-mt-20">
              <SectionCard
                sectionKey={sec.key}
                data={sectionData}
                currency={input.currency}
                onEdit={(key) => setEditingSectionKey(key)}
                onRegenerate={(key) => setEditingSectionKey(key)}
                isEditable={true}
              />
            </div>
          );
        })}
      </div>

      {/* Subtle Platform Attribution (Visible on plan and print) */}
      <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center space-y-1">
        <p className="text-xs font-semibold text-slate-700">
          Created with <span className="text-indigo-600 font-extrabold">Global Business Generator</span>
        </p>
        <p className="text-[11px] text-slate-500">
          The international standard for AI-assisted strategic, market, and financial business plans.
        </p>
      </div>

      {/* Section Edit / Regeneration Modal */}
      {editingSectionKey && (
        <SectionEditModal
          isOpen={true}
          onClose={() => setEditingSectionKey(null)}
          sectionKey={editingSectionKey}
          initialContent={(generatedPlan as any)[editingSectionKey]}
          planInput={input}
          onSaveContent={handleSaveSection}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={input.businessName}
        shareUrl={
          typeof window !== 'undefined'
            ? `${window.location.origin}${window.location.pathname}#plan=${currentPlan.shareSlug || currentPlan.id}${referralCode ? `&ref=${referralCode}` : ''}`
            : ''
        }
        summaryText={`Discover the complete business plan for ${input.businessName} (${input.cityRegion}, ${input.country}):`}
        itemType="plan"
        targetId={currentPlan.id}
        referralCode={referralCode}
      />

      {/* Marketing Kit Modal */}
      <MarketingKitModal
        isOpen={showMarketingKit}
        onClose={() => setShowMarketingKit(false)}
        plan={currentPlan}
        referralCode={referralCode}
        onSaveKit={async (kit) => {
          const updatedPlan: BusinessPlan = {
            ...currentPlan,
            marketingKit: kit,
          };
          setCurrentPlan(updatedPlan);
          onUpdatePlan?.(updatedPlan);
          await updateBusinessPlanInFirestore(currentPlan.id, { marketingKit: kit });
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPackageId={checkoutTargetPackage}
        plan={currentPlan}
        userId={currentPlan.userId}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Danger Zone: Delete Plan (Hidden on print) */}
      {onDelete && (
        <div className="mt-12 flex justify-end print-hidden border-t border-slate-200 pt-6">
          <button
            id="btn-delete-plan"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${input.businessName}"? This action cannot be undone.`)) {
                onDelete(currentPlan.id);
              }
            }}
            className="text-xs text-red-600 hover:text-red-800 font-semibold transition"
          >
            Delete this Business Plan
          </button>
        </div>
      )}

    </div>
  );
};
