import React, { useEffect } from 'react';
import { 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  Coins, 
  Globe2, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  DollarSign,
  Briefcase
} from 'lucide-react';
import { CountryProfile, CuratedBusinessIdea } from '../types';
import { COUNTRY_PROFILES, CURATED_BUSINESS_IDEAS } from '../data/businessIdeas';
import { updateSeoMetadata, resetSeoMetadata } from '../lib/seo';
import { Analytics } from '../lib/analytics';

interface CountryIdeaHubViewProps {
  countryProfile: CountryProfile;
  onBack: () => void;
  onSelectCountry: (countrySlug: string) => void;
  onSelectIdea: (idea: CuratedBusinessIdea) => void;
  onOpenAIGenerator: (countryName: string) => void;
  onTurnIntoPlan: (idea: CuratedBusinessIdea) => void;
}

export const CountryIdeaHubView: React.FC<CountryIdeaHubViewProps> = ({
  countryProfile,
  onBack,
  onSelectCountry,
  onSelectIdea,
  onOpenAIGenerator,
  onTurnIntoPlan,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateSeoMetadata({
      title: `Best Business Ideas in ${countryProfile.name} (${countryProfile.currency}) | Global Business Generator`,
      description: `Explore profitable business ideas, startup costs, and 34-section business plan blueprints in ${countryProfile.name}. Fast-growing industries in ${(countryProfile.popularStartupHubs || []).join(', ')}.`,
      keywords: [
        `business ideas in ${countryProfile.name}`,
        `startup opportunities ${countryProfile.name}`,
        `business plan ${countryProfile.name}`,
        `how to start a business in ${countryProfile.name}`,
        ...(countryProfile.popularStartupHubs || [])
      ],
      ogTitle: `Startup & Business Opportunities in ${countryProfile.name}`,
      ogDescription: countryProfile.economicOverview,
      ogUrl: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#country=${countryProfile.slug}` : undefined,
    });

    Analytics.event('country_hub_view', {
      country: countryProfile.name,
      currency: countryProfile.currency,
    });

    return () => {
      resetSeoMetadata();
    };
  }, [countryProfile]);

  // Find curated ideas that apply to this country
  const matchedIdeas = CURATED_BUSINESS_IDEAS.filter((idea) => {
    if (Array.isArray(idea.country)) {
      return idea.country.some(
        (c) => c.toLowerCase() === countryProfile.name.toLowerCase() || c.toLowerCase() === 'global'
      );
    }
    return idea.country.toLowerCase() === countryProfile.name.toLowerCase() || idea.country.toLowerCase() === 'global';
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Top Breadcrumb & Country Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 text-xs sm:text-sm text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Business Ideas</span>
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-semibold text-slate-900 flex items-center gap-1">
            <span className="text-base">{countryProfile.flag || countryProfile.flagEmoji}</span>
            <span>{countryProfile.name} Hub</span>
          </span>
        </div>

        {/* Quick Country Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Switch Country:</span>
          <select
            value={countryProfile.slug}
            onChange={(e) => onSelectCountry(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-hidden"
          >
            {COUNTRY_PROFILES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.flag || c.flagEmoji} {c.name} ({c.currency})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Country Hero Banner */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-xs border border-white/15">
              <span className="text-sm">{countryProfile.flag || countryProfile.flagEmoji}</span>
              <span>Regional Startup Intelligence Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Best Business Ideas & Opportunities in {countryProfile.name}
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              {countryProfile.economicOverview}
            </p>

            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-slate-200">
                Primary Currency: <strong className="text-white">{countryProfile.currency} ({countryProfile.currencySymbol})</strong>
              </span>
              {countryProfile.popularStartupHubs && countryProfile.popularStartupHubs.length > 0 && (
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-slate-200">
                  Commercial Hubs: <strong className="text-white">{countryProfile.popularStartupHubs.join(', ')}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
            <button
              onClick={() => onOpenAIGenerator(countryProfile.name)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:bg-amber-300 transition active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Idea Strategist for {countryProfile.name}</span>
            </button>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-slate-300">
              <span className="font-bold text-white block mb-1">Key Advantages:</span>
              <ul className="space-y-1 text-[11px]">
                {countryProfile.startupAdvantages.slice(0, 2).map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Top Industries in this Country */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          <span>High-Growth Sectors in {countryProfile.name}</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {countryProfile.topIndustries.map((ind, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-semibold text-slate-800 flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="truncate">{ind}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Matched Curated Business Ideas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Curated Business Opportunities in {countryProfile.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete blueprints with startup costs, operational guides, and 1-click business plans.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1">
            {matchedIdeas.length} Opportunities Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchedIdeas.map((idea) => (
            <div
              key={idea.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                    {idea.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {idea.estimatedCapitalRange}
                  </span>
                </div>

                <div>
                  <h3 
                    onClick={() => onSelectIdea(idea)}
                    className="cursor-pointer text-base font-bold text-slate-900 group-hover:text-indigo-600 transition"
                  >
                    {idea.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {idea.tagline}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-b border-slate-100 py-2.5">
                  <div>
                    <span className="text-slate-400 block font-medium">Difficulty:</span>
                    <span className="font-semibold text-slate-800">{idea.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Work Style:</span>
                    <span className="font-semibold text-slate-800">{idea.workEnvironment}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectIdea(idea)}
                  className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="h-3 w-3" />
                </button>

                <button
                  onClick={() => {
                    Analytics.businessPlanCtaClick(idea.id, idea.title, 'country_hub_card');
                    onTurnIntoPlan(idea);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition active:scale-95"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Build Plan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Country Hub Footer & Strategy Prompt */}
      <div className="rounded-2xl bg-slate-100 p-6 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          Have a specific budget or unique skill in {countryProfile.name}?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Analyze local market conditions in {countryProfile.name} and generate 10 ranked, capital-aligned business ideas.
        </p>
        <button
          onClick={() => onOpenAIGenerator(countryProfile.name)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Launch Opportunity Generator for {countryProfile.name}</span>
        </button>
      </div>
    </div>
  );
};
