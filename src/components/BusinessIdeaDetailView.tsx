import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  Briefcase, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Award, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Share2, 
  Globe2, 
  MapPin, 
  FileText,
  ChevronRight,
  ExternalLink,
  Zap,
  Building2,
  Calendar,
  Compass
} from 'lucide-react';
import { CuratedBusinessIdea } from '../types';
import { updateSeoMetadata, resetSeoMetadata } from '../lib/seo';
import { Analytics } from '../lib/analytics';
import { ShareModal } from './ShareModal';
import { CURATED_BUSINESS_IDEAS, COUNTRY_PROFILES } from '../data/businessIdeas';

interface BusinessIdeaDetailViewProps {
  idea: CuratedBusinessIdea;
  onBack: () => void;
  onNavigateIdea: (idea: CuratedBusinessIdea) => void;
  onNavigateCountry: (countrySlug: string) => void;
  onNavigateIndustry: (industry: string) => void;
  onNavigateCapital: (tierId: string) => void;
  onTurnIntoPlan: (idea: CuratedBusinessIdea) => void;
  referralCode?: string;
}

export const BusinessIdeaDetailView: React.FC<BusinessIdeaDetailViewProps> = ({
  idea,
  onBack,
  onNavigateIdea,
  onNavigateCountry,
  onNavigateIndustry,
  onNavigateCapital,
  onTurnIntoPlan,
  referralCode,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track analytics event
    Analytics.ideaView(idea.id, idea.title, idea.industry);

    // Update dynamic SEO metadata
    const countryNames = Array.isArray(idea.country) ? idea.country.join(', ') : idea.country;
    updateSeoMetadata({
      title: `${idea.title} — Startup Opportunity & 34-Section Business Plan | Global Business Generator`,
      description: `${idea.tagline} Estimated capital: ${idea.estimatedCapitalRange}. Difficulty: ${idea.difficulty}. Target Market: ${idea.targetCustomers.join(', ')}.`,
      keywords: [
        idea.title,
        idea.industry,
        idea.category,
        `business ideas in ${countryNames}`,
        'startup guide',
        'financial projections',
        'Global Business Generator'
      ],
      ogTitle: `${idea.title} — Startup Blueprint`,
      ogDescription: idea.businessOverview,
      ogUrl: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#idea=${idea.slug || idea.id}` : undefined,
    });

    return () => {
      resetSeoMetadata();
    };
  }, [idea]);

  // Find related ideas in same industry or region
  const relatedIdeas = CURATED_BUSINESS_IDEAS.filter(
    (i) => i.id !== idea.id && (i.industry === idea.industry || i.region === idea.region)
  ).slice(0, 3);

  const countriesList = Array.isArray(idea.country) ? idea.country : [idea.country];

  const getShareUrl = () => {
    if (typeof window === 'undefined') return `https://globalbusinessgenerator.com/#idea=${idea.slug || idea.id}`;
    const base = `${window.location.origin}${window.location.pathname}#idea=${idea.slug || idea.id}`;
    return referralCode ? `${base}&ref=${referralCode}` : base;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Top Breadcrumbs & Nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 font-medium">
          <button 
            id="breadcrumb-all-ideas"
            onClick={onBack}
            className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Business Ideas</span>
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button
            id="breadcrumb-industry"
            onClick={() => onNavigateIndustry(idea.industry)}
            className="text-slate-600 hover:text-indigo-600 transition hover:underline truncate max-w-[150px] sm:max-w-none"
          >
            {idea.industry}
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-slate-900 font-semibold truncate max-w-[180px] sm:max-w-none">{idea.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-share-idea-detail"
            onClick={() => {
              setShowShareModal(true);
              Analytics.shareClick('modal_open', 'idea', idea.id);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-indigo-600 transition"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Idea</span>
          </button>

          <button
            id="btn-quick-create-plan"
            onClick={() => {
              Analytics.businessPlanCtaClick(idea.id, idea.title, 'detail_header');
              onTurnIntoPlan(idea);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Turn Into Business Plan</span>
          </button>
        </div>
      </div>

      {/* Main Header Hero */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
            <Layers className="h-3.5 w-3.5" />
            {idea.category}
          </span>
          {idea.popularBadge && (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-100">
              {idea.popularBadge}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <Globe2 className="h-3.5 w-3.5 text-slate-500" />
            {idea.region}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {idea.title}
        </h1>
        <p className="mt-3 text-base sm:text-xl font-medium text-slate-600 leading-relaxed">
          {idea.tagline}
        </p>

        {/* Quick Highlights Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-b border-slate-100 py-5">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              Startup Capital
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900">{idea.estimatedCapitalRange}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              Difficulty
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900">{idea.difficulty}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              Environment
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900">{idea.workEnvironment} • {idea.locationType}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              Scalability
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900">{idea.scalability}</p>
          </div>
        </div>

        {/* Primary Conversion CTA Banner */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Ready to Launch?
            </div>
            <h3 className="text-lg sm:text-xl font-bold">Turn This Idea Into a Complete Business Plan</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Instantly generate an investor-ready 34-section business plan customized to your exact country, city, and capital.
            </p>
          </div>
          <button
            id="btn-hero-turn-into-plan"
            onClick={() => {
              Analytics.businessPlanCtaClick(idea.id, idea.title, 'detail_hero_banner');
              onTurnIntoPlan(idea);
            }}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition active:scale-95"
          >
            <span>Build My Business Plan</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid of the 12 Detailed Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Core Operational & Strategic Analysis */}
        <div className="md:col-span-2 space-y-6">

          {/* 1. Business Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-600" />
              1. Business Overview
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {idea.businessOverview}
            </p>
          </div>

          {/* 2. Why the Opportunity May Work */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              2. Why the Opportunity May Work
            </h2>
            <p className="text-xs text-slate-500">Key economic tailwinds and market timing advantages:</p>
            <ul className="space-y-2.5 mt-2">
              {idea.whyItWorks.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Target Customers */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              3. Target Customers
            </h2>
            <p className="text-xs text-slate-500">Primary paying customer profiles and segments:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
              {idea.targetCustomers.map((cust, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs sm:text-sm font-medium text-slate-800">
                  {cust}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Startup Requirements */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              4. Startup Requirements
            </h2>
            <p className="text-xs text-slate-500">Prerequisites and initial setup steps before launching:</p>
            <div className="space-y-2 mt-2">
              {idea.startupRequirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs sm:text-sm text-slate-700">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                    {idx + 1}
                  </div>
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Revenue Model & Streams */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              5. Revenue Model & Income Streams
            </h2>
            <p className="text-sm font-medium text-slate-800 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 text-emerald-950">
              {idea.revenueModel}
            </p>
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Specific Income Streams:</span>
              {idea.revenueStreams.map((stream, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 pl-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{stream}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Main Operating Costs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-slate-700" />
              6. Main Operating Costs
            </h2>
            <p className="text-xs text-slate-500">Recurring fixed and variable overhead line items:</p>
            <ul className="space-y-2 mt-2">
              {idea.mainOperatingCosts.map((cost, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <span className="text-slate-400 font-mono">•</span>
                  <span>{cost}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 7 & 8: Skills & Equipment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-600" />
                7. Skills Required
              </h3>
              <ul className="space-y-2">
                {idea.skillsRequired.map((skill, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-purple-600" />
                8. Equipment Required
              </h3>
              <ul className="space-y-2">
                {idea.equipmentRequired.map((equip, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <span>{equip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 9. Potential Challenges */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-rose-950 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              9. Potential Challenges & Risk Mitigation
            </h2>
            <ul className="space-y-2 mt-2">
              {idea.potentialChallenges.map((chal, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <span className="text-rose-500 font-bold shrink-0">⚠️</span>
                  <span>{chal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 10. Growth & Expansion Opportunities */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              10. Growth & Expansion Opportunities
            </h2>
            <ul className="space-y-2 mt-2">
              {idea.growthOpportunities.map((opp, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right 1 Column: Financial Model, Country Match, Internal Links, and CTA */}
        <div className="space-y-6">

          {/* 11 & 12. Example Financial Assumptions */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <DollarSign className="h-5 w-5" />
              <h3 className="font-bold text-base text-slate-900">11. Financial Projections</h3>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Break-Even Timeline:</span>
                <span className="font-bold text-slate-900">{idea.financialAssumptions.breakEvenMonths}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Est. Monthly Revenue:</span>
                <span className="font-bold text-emerald-700">{idea.financialAssumptions.estimatedMonthlyRevenue}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Projected Gross Margin:</span>
                <span className="font-bold text-indigo-700">{idea.financialAssumptions.projectedGrossMargin}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Initial Capital Range:</span>
                <span className="font-bold text-slate-900">{idea.estimatedCapitalRange}</span>
              </div>
            </div>

            <div className="rounded-xl bg-white p-3 border border-indigo-100/80 text-xs text-slate-700">
              <span className="font-bold text-indigo-900 block mb-1">Unit Economics:</span>
              {idea.financialAssumptions.unitEconomicsSummary}
            </div>

            <button
              id="btn-sidebar-turn-into-plan"
              onClick={() => {
                Analytics.businessPlanCtaClick(idea.id, idea.title, 'sidebar_financials');
                onTurnIntoPlan(idea);
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 p-3 text-xs sm:text-sm font-bold text-white shadow-sm transition active:scale-95"
            >
              <span>Build 34-Section Plan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Country Hub Connections */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Featured In Countries
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {countriesList.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateCountry(c.toLowerCase().replace(/\s+/g, '-'))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition"
                >
                  <MapPin className="h-3 w-3 text-indigo-500" />
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Internal Links to Capital & Industry */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Explore More Opportunities
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigateIndustry(idea.industry)}
                className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition"
              >
                <span>More in {idea.industry}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateCapital(idea.startupCapitalMin <= 1000 ? '1000' : idea.startupCapitalMin <= 5000 ? '5000' : idea.startupCapitalMin <= 15000 ? '10000' : '25000')}
                className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition"
              >
                <span>Ideas under {idea.estimatedCapitalRange}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Related Ideas */}
          {relatedIdeas.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Related Business Ideas
              </h4>
              <div className="space-y-3">
                {relatedIdeas.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onNavigateIdea(rel)}
                    className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                  >
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1">
                      {rel.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {rel.tagline}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-emerald-600">{rel.estimatedCapitalRange}</span>
                      <span className="font-medium group-hover:text-indigo-600 flex items-center gap-0.5">
                        Explore <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={`Business Opportunity: ${idea.title}`}
          shareUrl={getShareUrl()}
          attribution="Created with Global Business Generator"
          itemType="idea"
        />
      )}
    </div>
  );
};
