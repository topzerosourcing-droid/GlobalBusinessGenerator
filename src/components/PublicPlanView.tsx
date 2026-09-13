import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Globe2, 
  MapPin, 
  DollarSign, 
  ArrowRight, 
  Share2, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Target,
  BarChart3,
  Award
} from 'lucide-react';
import { BusinessPlan } from '../types';
import { getPublicBusinessPlan, incrementPlanViewCount } from '../lib/firebase';
import { updateSeoMetadata, resetSeoMetadata } from '../lib/seo';
import { Analytics } from '../lib/analytics';
import { ShareModal } from './ShareModal';

interface PublicPlanViewProps {
  slug: string;
  onNavigateHome?: () => void;
  onBack?: () => void;
  onCreatePlan?: (prefillIdea?: string) => void;
  onCreateOwnPlan?: () => void;
  referralCode?: string;
}

export const PublicPlanView: React.FC<PublicPlanViewProps> = ({
  slug,
  onNavigateHome,
  onBack,
  onCreatePlan,
  onCreateOwnPlan,
  referralCode,
}) => {
  const handleBack = onBack || onNavigateHome || (() => {
    if (typeof window !== 'undefined') window.location.hash = '';
  });
  const handleCreatePlan = onCreateOwnPlan || onCreatePlan || (() => {});

  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      setLoading(true);
      try {
        const found = await getPublicBusinessPlan(slug);
        if (!found) {
          setError('This business plan could not be found or has been set to private by its creator.');
        } else {
          setPlan(found);
          // Increment views
          incrementPlanViewCount(found.id);
          // Analytics track
          Analytics.publicPageView('plan', slug, found.input.businessName);

          const planContent = found.generatedPlan || (found as any).content || {};
          // Update Dynamic SEO Metadata
          updateSeoMetadata({
            title: `${found.input.businessName} — Business Plan Summary | Global Business Generator`,
            description: planContent.executiveSummary?.elevatorPitch || 
              `Comprehensive 34-section business plan for ${found.input.businessName}, operating in ${found.input.cityRegion}, ${found.input.country}.`,
            keywords: [
              found.input.industry,
              found.input.country,
              found.input.businessName,
              'business plan',
              'startup forecast',
              'Global Business Generator'
            ],
            ogTitle: `${found.input.businessName} — Business Plan Overview`,
            ogDescription: planContent.executiveSummary?.elevatorPitch || `Verified strategic business plan for ${found.input.businessName}.`,
          });
        }
      } catch (err) {
        setError('An unexpected error occurred while loading this public business plan.');
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();

    return () => {
      resetSeoMetadata();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Loading Business Plan...</h2>
          <p className="text-xs text-slate-500">Retrieving verified public executive summary and market forecast.</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Plan Not Available</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => handleCreatePlan()}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Build Your Own Business Plan
            </button>
            <button
              onClick={handleBack}
              className="w-full py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              Go to Global Business Generator
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { input } = plan;
  const content = plan.generatedPlan || (plan as any).content || {};
  const currency = input.currency || 'USD';
  const execSummary = content.executiveSummary;
  const breakEven = content.breakEvenAnalysis;
  const threeYear = content.threeYearFinancialProjection;
  const targetMarket = content.targetMarket;
  const productsServices = content.productsServices;
  const ninetyDay = content.ninetyDayLaunchPlan;
  const competitiveAdv = content.competitiveAdvantage;

  const publicUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-100">
      {/* Top Banner Branding & Global CTA */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div 
          onClick={handleBack} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
              Global Business Generator
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Public Showcase
              </span>
            </span>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Empowering founders worldwide with comprehensive 34-section business plans
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share Plan</span>
          </button>
          <button
            onClick={() => handleCreatePlan(input.businessIdea)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs active:scale-95"
          >
            <span>Create Your Own Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50/70 via-purple-50/20 to-transparent rounded-bl-full pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {input.industry}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                <MapPin className="w-3 h-3 text-slate-500" />
                {input.cityRegion ? `${input.cityRegion}, ${input.country}` : input.country}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                <DollarSign className="w-3 h-3 text-slate-500" />
                Capital: {input.startingCapital || 'Self-Funded'} {currency}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                Verified 34-Section Strategic Architecture
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {input.businessName}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                {execSummary?.elevatorPitch || input.businessIdea}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Break-Even</div>
                <div className="text-base font-bold text-indigo-600 mt-0.5">
                  {breakEven?.breakEvenTimelineMonths ? `Month ${breakEven.breakEvenTimelineMonths}` : 'Under 12 Mo.'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Year 1 Target</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {threeYear?.year1Revenue || 'Positive Cash Flow'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Year 3 Target</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">
                  {threeYear?.year3Revenue || 'Scale Expansion'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Target Reach</div>
                <div className="text-base font-bold text-slate-900 mt-0.5 truncate">
                  {input.targetCustomers || 'Regional Focus'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Summary & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Core Mission & Strategic Vision</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {execSummary?.missionAndVision || 'Deliver exceptional local value through high-efficiency service delivery.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Competitive Advantage</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {competitiveAdv?.uniqueValueProposition || 'Local agility, customer-first transparent pricing, and digital accessibility.'}
            </p>
          </div>
        </section>

        {/* Core Products / Services */}
        {productsServices?.primaryOfferings && productsServices.primaryOfferings.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Products & Service Offerings</h2>
              <span className="text-xs text-slate-500 font-medium">Core Value Units</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productsServices.primaryOfferings.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    <span className="text-xs font-semibold text-indigo-600">{item.estimatedPrice}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 90-Day Roadmap Teaser */}
        {ninetyDay && (
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">90-Day Execution Roadmap</h2>
              <span className="text-xs text-slate-500 font-medium">Launch Phases</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Days 1 - 30: Foundation</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ninetyDay.month1Focus}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Days 31 - 60: Pilot Launch</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ninetyDay.month2Focus}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Days 61 - 90: Scaling</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ninetyDay.month3Focus}</p>
              </div>
            </div>
          </section>
        )}

        {/* Viral Conversion Box */}
        <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur-xs border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Free AI Strategic Generator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Turn Your Own Idea Into a Professional Business Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Global Business Generator generates 34 customized strategic sections, localized financial projections, customer personas, competitor models, and an AI Marketing Kit for any country and industry in seconds.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleCreatePlan(input.businessIdea)}
              className="px-6 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Build My Business Plan — 100% Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-colors border border-white/15 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share This Plan</span>
            </button>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full 34-Section Strategic Blueprint</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Deeply Localized to 195+ Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Print, Export, and AI Marketing Kit</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-700">
          Created with Global Business Generator — The International Standard for Business Plan Generation
        </p>
        <p className="max-w-xl mx-auto text-slate-400 text-[11px]">
          Founder privacy is strictly preserved. Private financial accounts, emails, and identifiers are never published on public showcases.
        </p>
      </footer>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={input.businessName}
        shareUrl={publicUrl}
        summaryText={`Explore the 34-section business plan for ${input.businessName} (${input.cityRegion || input.country}) on Global Business Generator.`}
        itemType="plan"
        targetId={plan.id}
        referralCode={referralCode}
      />
    </div>
  );
};
