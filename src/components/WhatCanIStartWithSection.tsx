import React, { useState } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Coins,
  ChevronRight,
  Filter
} from 'lucide-react';
import { CuratedBusinessIdea } from '../types';
import { CURATED_BUSINESS_IDEAS } from '../data/businessIdeas';
import { Analytics } from '../lib/analytics';

interface WhatCanIStartWithSectionProps {
  onSelectIdea: (idea: CuratedBusinessIdea) => void;
  onTurnIntoPlan: (idea: CuratedBusinessIdea) => void;
  onOpenAIGenerator: (capital: string) => void;
}

interface CapitalTier {
  id: string;
  label: string;
  maxUSD: number;
  description: string;
}

const CAPITAL_TIERS: CapitalTier[] = [
  { id: '500', label: '$500', maxUSD: 500, description: 'Micro-ventures, digital services, agency & solo operations' },
  { id: '1000', label: '$1,000', maxUSD: 1000, description: 'Service agencies, micro-logistics, food popups' },
  { id: '5000', label: '$5,000', maxUSD: 5000, description: 'Artisan retail brands, equipment rental, dispatch fleets' },
  { id: '10000', label: '$10,000', maxUSD: 10000, description: 'Solar power audits, wellness studios, mobile fleets' },
  { id: '25000', label: '$25,000', maxUSD: 25000, description: 'Boutique hospitality, specialty fabrication, agro-depots' },
  { id: '50000', label: '$50,000+', maxUSD: 1000000, description: 'Industrial production, agri-processing, commercial hubs' },
];

export const WhatCanIStartWithSection: React.FC<WhatCanIStartWithSectionProps> = ({
  onSelectIdea,
  onTurnIntoPlan,
  onOpenAIGenerator,
}) => {
  const [selectedTierId, setSelectedTierId] = useState<string>('5000');
  const [countryFilter, setCountryFilter] = useState<string>('All');

  const activeTier = CAPITAL_TIERS.find((t) => t.id === selectedTierId) || CAPITAL_TIERS[2];

  // Filter ideas that fit within the selected budget
  const matchedIdeas = CURATED_BUSINESS_IDEAS.filter((idea) => {
    const fitsCapital = idea.startupCapitalMin <= activeTier.maxUSD;
    if (!fitsCapital) return false;

    if (countryFilter !== 'All') {
      const ideaCountries = Array.isArray(idea.country) ? idea.country : [idea.country];
      return ideaCountries.some(
        (c) => c.toLowerCase() === countryFilter.toLowerCase() || c.toLowerCase() === 'global'
      );
    }
    return true;
  });

  const handleTierClick = (tier: CapitalTier) => {
    setSelectedTierId(tier.id);
    Analytics.filterUsed('capital_tier', tier.label);
  };

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/20 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Coins className="h-4 w-4" />
            <span>Interactive Capital Explorer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            What Business Can I Start With...?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Select your available startup budget to see realistic, vetted ventures you can launch immediately.
          </p>
        </div>

        {/* AI Custom Budget Trigger */}
        <button
          onClick={() => onOpenAIGenerator(activeTier.id === '50000' ? '50000' : activeTier.id)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>AI Custom Budget Scan</span>
        </button>
      </div>

      {/* Tier Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {CAPITAL_TIERS.map((tier) => {
          const isSelected = tier.id === selectedTierId;
          return (
            <button
              key={tier.id}
              onClick={() => handleTierClick(tier)}
              className={`flex flex-col items-center justify-center rounded-2xl py-3 px-2 border transition ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md scale-102'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm sm:text-base font-black tracking-tight">{tier.label}</span>
              <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                {tier.id === '50000' ? 'Enterprise' : 'Budget'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tier Info & Country Quick Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-b border-indigo-100/60 py-3 text-xs">
        <div className="text-slate-600 font-medium">
          Showing ventures feasible with <strong className="text-slate-900">{activeTier.label}</strong>: {activeTier.description}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Filter by Country:</span>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Countries</option>
            <option value="Botswana">Botswana</option>
            <option value="South Africa">South Africa</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United States">United States</option>
            <option value="Kenya">Kenya</option>
            <option value="Nigeria">Nigeria</option>
            <option value="India">India</option>
          </select>
        </div>
      </div>

      {/* Matched Ideas List / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matchedIdeas.slice(0, 6).map((idea) => (
          <div
            key={idea.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {idea.category}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {idea.estimatedCapitalRange}
                </span>
              </div>

              <h4 
                onClick={() => onSelectIdea(idea)}
                className="cursor-pointer text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition"
              >
                {idea.title}
              </h4>

              <p className="text-xs text-slate-500 line-clamp-2">
                {idea.tagline}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectIdea(idea)}
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
              >
                View Details
              </button>

              <button
                onClick={() => {
                  Analytics.businessPlanCtaClick(idea.id, idea.title, 'capital_tier_card');
                  onTurnIntoPlan(idea);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-700 transition"
              >
                <span>Build Plan</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {matchedIdeas.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-xs">
          No ideas currently matched for this specific filter. Try selecting "All Countries" or launch the AI Idea Generator!
        </div>
      )}
    </div>
  );
};
