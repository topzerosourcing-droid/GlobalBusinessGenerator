import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Search, 
  Filter, 
  DollarSign, 
  Users, 
  Globe2, 
  ArrowRight, 
  Sparkles,
  Layers,
  Share2,
  CheckCircle2,
  Briefcase,
  Target,
  Maximize2,
  X as CloseIcon,
  MapPin,
  TrendingUp,
  Cpu,
  Zap,
  Building2,
  Coins,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { CURATED_BUSINESS_IDEAS, COUNTRY_PROFILES } from '../data/businessIdeas';
import { CuratedBusinessIdea, CountryProfile } from '../types';
import { ShareModal } from './ShareModal';
import { updateSeoMetadata, resetSeoMetadata } from '../lib/seo';
import { Analytics } from '../lib/analytics';
import { BusinessIdeaDetailView } from './BusinessIdeaDetailView';
import { CountryIdeaHubView } from './CountryIdeaHubView';
import { AIIdeaGeneratorModal } from './AIIdeaGeneratorModal';
import { WhatCanIStartWithSection } from './WhatCanIStartWithSection';

interface BusinessIdeasDirectoryProps {
  onSelectIdea: (idea: CuratedBusinessIdea) => void;
  referralCode?: string;
  initialIdeaId?: string;
  initialCountrySlug?: string;
  onOpenCreatePlanWithPrefill?: (prefill: any) => void;
}

export const BusinessIdeasDirectory: React.FC<BusinessIdeasDirectoryProps> = ({
  onSelectIdea,
  referralCode,
  initialIdeaId,
  initialCountrySlug,
  onOpenCreatePlanWithPrefill,
}) => {
  // Navigation sub-views within directory
  const [activeDetailIdea, setActiveDetailIdea] = useState<CuratedBusinessIdea | null>(null);
  const [activeCountryHub, setActiveCountryHub] = useState<CountryProfile | null>(null);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [aiGeneratorInitialCountry, setAiGeneratorInitialCountry] = useState<string>('Botswana');
  const [aiGeneratorInitialCapital, setAiGeneratorInitialCapital] = useState<string>('5000');
  const [shareIdea, setShareIdea] = useState<CuratedBusinessIdea | null>(null);

  // Search and multi-filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // 9 Explicit Filters requested by user:
  const [filterCountry, setFilterCountry] = useState<string>('All');
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [filterIndustry, setFilterIndustry] = useState<string>('All');
  const [filterCapitalRange, setFilterCapitalRange] = useState<string>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [filterOnlineOffline, setFilterOnlineOffline] = useState<string>('All');
  const [filterLocationType, setFilterLocationType] = useState<string>('All');
  const [filterTeamSetup, setFilterTeamSetup] = useState<string>('All');
  const [filterScalability, setFilterScalability] = useState<string>('All');

  // Handle initial idea or country slug if provided
  useEffect(() => {
    if (initialIdeaId) {
      const found = CURATED_BUSINESS_IDEAS.find(
        (i) => i.id === initialIdeaId || i.slug === initialIdeaId
      );
      if (found) {
        setActiveDetailIdea(found);
      }
    } else if (initialCountrySlug) {
      const foundCountry = COUNTRY_PROFILES.find((c) => c.slug === initialCountrySlug);
      if (foundCountry) {
        setActiveCountryHub(foundCountry);
      }
    }
  }, [initialIdeaId, initialCountrySlug]);

  // Update SEO for directory root
  useEffect(() => {
    if (!activeDetailIdea && !activeCountryHub) {
      updateSeoMetadata({
        title: 'Global Business Ideas Discovery Hub | Curated Startup Opportunities & Plans',
        description: 'Explore profitable, analyzed business ideas across global markets. Filter by country, capital, difficulty, and launch a complete 34-section business plan in minutes.',
        keywords: [
          'business ideas',
          'startup opportunities',
          'small business ideas',
          'business plan generator',
          'Botswana business ideas',
          'South Africa startups',
          'profitable business ideas'
        ],
      });
      Analytics.pageView('/ideas');
    }
  }, [activeDetailIdea, activeCountryHub]);

  // Filtering logic
  const filteredIdeas = CURATED_BUSINESS_IDEAS.filter((idea) => {
    // Search query
    const matchesSearch =
      searchTerm.trim() === '' ||
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.businessOverview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(idea.country) 
        ? idea.country.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
        : idea.country.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // 1. Country filter
    if (filterCountry !== 'All') {
      const countries = Array.isArray(idea.country) ? idea.country : [idea.country];
      const match = countries.some(
        (c) => c.toLowerCase() === filterCountry.toLowerCase() || c.toLowerCase() === 'global'
      );
      if (!match) return false;
    }

    // 2. Region filter
    if (filterRegion !== 'All') {
      if (idea.region !== filterRegion && idea.region !== 'Global') return false;
    }

    // 3. Industry filter
    if (filterIndustry !== 'All') {
      if (idea.industry !== filterIndustry) return false;
    }

    // 4. Startup capital filter
    if (filterCapitalRange !== 'All') {
      if (filterCapitalRange === 'under-1000' && idea.startupCapitalMin > 1000) return false;
      if (filterCapitalRange === '1000-5000' && (idea.startupCapitalMin > 5000 || idea.startupCapitalMax < 1000)) return false;
      if (filterCapitalRange === '5000-15000' && (idea.startupCapitalMin > 15000 || idea.startupCapitalMax < 5000)) return false;
      if (filterCapitalRange === '15000-35000' && (idea.startupCapitalMin > 35000 || idea.startupCapitalMax < 15000)) return false;
      if (filterCapitalRange === '35000-plus' && idea.startupCapitalMax < 35000) return false;
    }

    // 5. Difficulty filter
    if (filterDifficulty !== 'All') {
      if (idea.difficulty !== filterDifficulty) return false;
    }

    // 6. Online / Offline filter
    if (filterOnlineOffline !== 'All') {
      if (idea.workEnvironment !== filterOnlineOffline) return false;
    }

    // 7. Home-based / Physical location filter
    if (filterLocationType !== 'All') {
      if (idea.locationType !== filterLocationType) return false;
    }

    // 8. Solo / Team filter
    if (filterTeamSetup !== 'All') {
      const teamVal = idea.teamSetup || idea.teamStructure;
      if (teamVal !== filterTeamSetup) return false;
    }

    // 9. Scalability filter
    if (filterScalability !== 'All') {
      if (idea.scalability !== filterScalability) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilterCountry('All');
    setFilterRegion('All');
    setFilterIndustry('All');
    setFilterCapitalRange('All');
    setFilterDifficulty('All');
    setFilterOnlineOffline('All');
    setFilterLocationType('All');
    setFilterTeamSetup('All');
    setFilterScalability('All');
    setSearchTerm('');
  };

  const hasActiveFilters = 
    filterCountry !== 'All' ||
    filterRegion !== 'All' ||
    filterIndustry !== 'All' ||
    filterCapitalRange !== 'All' ||
    filterDifficulty !== 'All' ||
    filterOnlineOffline !== 'All' ||
    filterLocationType !== 'All' ||
    filterTeamSetup !== 'All' ||
    filterScalability !== 'All' ||
    searchTerm.trim() !== '';

  const handleOpenAiGenerator = (country?: string, capital?: string) => {
    if (country) setAiGeneratorInitialCountry(country);
    if (capital) setAiGeneratorInitialCapital(capital);
    setAiGeneratorOpen(true);
  };

  const handleTurnIdeaIntoPlan = (idea: CuratedBusinessIdea) => {
    Analytics.businessPlanCtaClick(idea.id, idea.title, 'directory_card');
    onSelectIdea(idea);
  };

  const getShareUrlForIdea = (idea: CuratedBusinessIdea) => {
    if (typeof window === 'undefined') return `https://globalbusinessgenerator.com/#idea=${idea.slug || idea.id}`;
    const base = `${window.location.origin}${window.location.pathname}#idea=${idea.slug || idea.id}`;
    return referralCode ? `${base}&ref=${referralCode}` : base;
  };

  // If viewing single idea detail view
  if (activeDetailIdea) {
    return (
      <BusinessIdeaDetailView
        idea={activeDetailIdea}
        onBack={() => {
          setActiveDetailIdea(null);
          if (typeof window !== 'undefined') window.location.hash = '';
        }}
        onNavigateIdea={(newIdea) => setActiveDetailIdea(newIdea)}
        onNavigateCountry={(slug) => {
          const profile = COUNTRY_PROFILES.find((c) => c.slug === slug);
          if (profile) {
            setActiveDetailIdea(null);
            setActiveCountryHub(profile);
          }
        }}
        onNavigateIndustry={(ind) => {
          setActiveDetailIdea(null);
          setFilterIndustry(ind);
        }}
        onNavigateCapital={(tier) => {
          setActiveDetailIdea(null);
          setFilterCapitalRange(tier === '1000' ? 'under-1000' : tier === '5000' ? '1000-5000' : '5000-15000');
        }}
        onTurnIntoPlan={handleTurnIdeaIntoPlan}
        referralCode={referralCode}
      />
    );
  }

  // If viewing country hub view
  if (activeCountryHub) {
    return (
      <CountryIdeaHubView
        countryProfile={activeCountryHub}
        onBack={() => {
          setActiveCountryHub(null);
          if (typeof window !== 'undefined') window.location.hash = '';
        }}
        onSelectCountry={(slug) => {
          const found = COUNTRY_PROFILES.find((c) => c.slug === slug);
          if (found) setActiveCountryHub(found);
        }}
        onSelectIdea={(idea) => setActiveDetailIdea(idea)}
        onOpenAIGenerator={(countryName) => handleOpenAiGenerator(countryName)}
        onTurnIntoPlan={handleTurnIdeaIntoPlan}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-16">
      {/* Hero Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
              <Lightbulb className="h-4 w-4" />
              <span>Global Business Idea & Opportunity Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Discover High-Demand Business Ideas Worldwide
            </h1>
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
              Explore analyzed market opportunities across emerging and developed economies. Every idea comes with verified startup costs, operational guides, and a 1-click 34-section business plan.
            </p>
          </div>

          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              id="btn-trigger-ai-ideas"
              onClick={() => handleOpenAiGenerator()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:from-indigo-700 hover:to-indigo-800 transition active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Launch Business Idea Generator</span>
            </button>
            <div className="text-[11px] text-slate-500 text-center lg:text-left">
              Get 10 ranked business ideas customized to your budget & country
            </div>
          </div>
        </div>

        {/* Featured Country Hubs Pill Strip */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-indigo-600" />
              Country-Specific Startup Hubs:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {COUNTRY_PROFILES.map((cp) => (
              <button
                key={cp.slug}
                onClick={() => setActiveCountryHub(cp)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition whitespace-nowrap"
              >
                <span>{cp.flag || cp.flagEmoji}</span>
                <span>{cp.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({cp.currency})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive 'What Business Can I Start With $X?' Section */}
      <WhatCanIStartWithSection
        onSelectIdea={(idea) => setActiveDetailIdea(idea)}
        onTurnIntoPlan={handleTurnIdeaIntoPlan}
        onOpenAIGenerator={(cap) => handleOpenAiGenerator('Botswana', cap)}
      />

      {/* Main Catalog Search & Comprehensive 9-Point Filters */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Top Search & Primary Filters Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id="search-ideas-catalog"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ideas, industries, keywords (e.g., Solar, Delivery, Catering, Agency)..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            {/* Quick Country & Industry Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={filterCountry}
                onChange={(e) => {
                  setFilterCountry(e.target.value);
                  Analytics.filterUsed('country', e.target.value);
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-hidden"
              >
                <option value="All">All Countries</option>
                <option value="Botswana">Botswana</option>
                <option value="South Africa">South Africa</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Kenya">Kenya</option>
                <option value="Nigeria">Nigeria</option>
                <option value="India">India</option>
                <option value="Ghana">Ghana</option>
              </select>

              <select
                value={filterIndustry}
                onChange={(e) => {
                  setFilterIndustry(e.target.value);
                  Analytics.filterUsed('industry', e.target.value);
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-hidden"
              >
                <option value="All">All Industries</option>
                <option value="Renewable Energy & Utilities">Renewable Energy</option>
                <option value="Food & Beverage / Hospitality">Food & Beverage</option>
                <option value="Logistics, Transport & Supply Chain">Logistics & Transport</option>
                <option value="Professional & Business Services">Professional Services</option>
                <option value="Technology & SaaS">Technology & Software</option>
                <option value="Agriculture & AgriTech">Agriculture & AgriTech</option>
                <option value="Healthcare, Wellness & Fitness">Healthcare & Wellness</option>
                <option value="Manufacturing & Production">Manufacturing</option>
                <option value="Education & EdTech">Education & Training</option>
                <option value="Retail & E-Commerce">Retail & E-Commerce</option>
              </select>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition shrink-0 ${
                  showAdvancedFilters || hasActiveFilters
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="flex h-2 w-2 rounded-full bg-indigo-600 ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Advanced Multi-Filters Panel */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {/* Region */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800"
                >
                  <option value="All">All Regions</option>
                  <option value="Southern Africa">Southern Africa</option>
                  <option value="East Africa">East Africa</option>
                  <option value="West Africa">West Africa</option>
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                  <option value="South Asia">South Asia</option>
                  <option value="Global">Global / Worldwide</option>
                </select>
              </div>

              {/* Startup Capital */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Startup Capital</label>
                <select
                  value={filterCapitalRange}
                  onChange={(e) => setFilterCapitalRange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800"
                >
                  <option value="All">All Capital Brackets</option>
                  <option value="under-1000">Under $1,000</option>
                  <option value="1000-5000">$1,000 - $5,000</option>
                  <option value="5000-15000">$5,000 - $15,000</option>
                  <option value="15000-35000">$15,000 - $35,000</option>
                  <option value="35000-plus">$35,000+</option>
                </select>
              </div>

              {/* Business Difficulty */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Business Difficulty</label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Low">Low Difficulty (Fast Launch)</option>
                  <option value="Moderate">Moderate Difficulty</option>
                  <option value="High">High Complexity / Technical</option>
                </select>
              </div>

              {/* Online / Offline */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Online / Offline</label>
                <select
                  value={filterOnlineOffline}
                  onChange={(e) => setFilterOnlineOffline(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800"
                >
                  <option value="All">All Environments</option>
                  <option value="Online">Online / Digital</option>
                  <option value="Offline">Offline / Physical</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Home-based / Physical */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Home-based / Physical</label>
                <select
                  value={filterLocationType}
                  onChange={(e) => setFilterLocationType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800"
                >
                  <option value="All">Any Location Type</option>
                  <option value="Home-based">Home-Based Only</option>
                  <option value="Commercial Location">Commercial / Storefront</option>
                </select>
              </div>

              {/* Solo / Team */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Solo / Team</label>
                <select
                  value={filterTeamSetup}
                  onChange={(e) => setFilterTeamSetup(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800"
                >
                  <option value="All">Any Team Setup</option>
                  <option value="Solo Founder">Solo Founder Friendly</option>
                  <option value="Small Team (2-4)">Small Team (2-4)</option>
                  <option value="Scalable Team (5+)">Scalable Team (5+)</option>
                </select>
              </div>

              {/* Scalability */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Expected Scalability</label>
                <select
                  value={filterScalability}
                  onChange={(e) => setFilterScalability(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800"
                >
                  <option value="All">Any Scalability</option>
                  <option value="High">High Scalability</option>
                  <option value="Very High">Very High Scalability</option>
                  <option value="Moderate">Moderate / Stable</option>
                </select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 p-2 text-xs font-bold text-slate-700 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          )}

          {/* Results Count & Active Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-900">{filteredIdeas.length}</strong> vetted opportunities
              {hasActiveFilters && <span> matching your criteria</span>}
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => {
            const countries = Array.isArray(idea.country) ? idea.country : [idea.country];
            return (
              <div
                key={idea.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-indigo-300 hover:shadow-lg transition relative"
              >
                <div>
                  {/* Category & Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                      {idea.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {idea.popularBadge && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-100">
                          {idea.popularBadge}
                        </span>
                      )}
                      <button
                        onClick={() => setShareIdea(idea)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        title="Share this idea"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3
                    onClick={() => setActiveDetailIdea(idea)}
                    className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition cursor-pointer leading-snug"
                  >
                    {idea.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 font-medium line-clamp-2">
                    {idea.tagline}
                  </p>

                  {/* Quick Specs Grid */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-100 grid grid-cols-2 gap-2.5 text-[11px]">
                    <div>
                      <span className="text-slate-400 block font-medium">Est. Capital</span>
                      <span className="font-bold text-slate-900">{idea.estimatedCapitalRange}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Difficulty</span>
                      <span className="font-bold text-slate-900">{idea.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Work Style</span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {idea.workEnvironment} • {idea.locationType}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Team Model</span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {idea.teamSetup || idea.teamStructure || 'Solo / Team'}
                      </span>
                    </div>
                  </div>

                  {/* Country Availability Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {countries.slice(0, 3).map((c, idx) => (
                      <span key={idx} className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 font-medium">
                        <MapPin className="h-2.5 w-2.5 text-indigo-500" />
                        {c}
                      </span>
                    ))}
                    {countries.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        +{countries.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveDetailIdea(idea)}
                    className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition flex items-center gap-1"
                  >
                    <span>View Analysis</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    id={`btn-turn-into-plan-${idea.id}`}
                    onClick={() => handleTurnIdeaIntoPlan(idea)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Turn Into Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredIdeas.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No matching business ideas found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Try adjusting your search criteria or generate custom business ideas based on your exact profile.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Reset Filters
              </button>
              <button
                onClick={() => handleOpenAiGenerator()}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                Generate Custom Ideas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareIdea && (
        <ShareModal
          isOpen={!!shareIdea}
          onClose={() => setShareIdea(null)}
          title={shareIdea.title}
          shareUrl={getShareUrlForIdea(shareIdea)}
          summaryText={`Check out this vetted business opportunity: ${shareIdea.title} — ${shareIdea.tagline} (Est. Capital: ${shareIdea.estimatedCapitalRange})`}
          itemType="idea"
          targetId={shareIdea.id}
          referralCode={referralCode}
        />
      )}

      {/* Business Idea Generator Modal */}
      <AIIdeaGeneratorModal
        isOpen={aiGeneratorOpen}
        onClose={() => setAiGeneratorOpen(false)}
        initialCountry={aiGeneratorInitialCountry}
        initialCapital={aiGeneratorInitialCapital}
        onSelectIdeaForPlan={(prefill) => {
          if (onOpenCreatePlanWithPrefill) {
            onOpenCreatePlanWithPrefill(prefill);
          } else {
            // Convert prefill into a CuratedBusinessIdea stub to pass to onSelectIdea
            const ideaStub: CuratedBusinessIdea = {
              id: `custom-${Date.now()}`,
              slug: `custom-${Date.now()}`,
              title: prefill.businessName || 'Custom Business Plan',
              tagline: prefill.businessIdea,
              industry: prefill.industry || 'General Business',
              category: prefill.industry || 'General Business',
              country: prefill.country || 'Global',
              region: 'Global',
              businessOverview: prefill.businessIdea,
              whyItWorks: ['High market demand', 'Optimal capital efficiency'],
              targetCustomers: [prefill.targetCustomers || 'Broad market'],
              startupRequirements: ['Register business', 'Launch marketing'],
              estimatedCapitalRange: prefill.startupCapital || '$5,000',
              startupCapitalMin: 1000,
              startupCapitalMax: 10000,
              revenueModel: 'Direct customer sales and ongoing service contracts',
              revenueStreams: ['Product / Service revenue'],
              mainOperatingCosts: ['Operations', 'Marketing'],
              skillsRequired: ['Management', 'Sales'],
              equipmentRequired: ['Essential tools'],
              potentialChallenges: ['Competition', 'Customer acquisition'],
              growthOpportunities: ['Geographic expansion'],
              financialAssumptions: {
                breakEvenMonths: '6 - 9 months',
                estimatedMonthlyRevenue: '$5,000 - $15,000',
                projectedGrossMargin: '45% - 60%',
                initialCapitalRequired: prefill.startupCapital || '$5,000',
                unitEconomicsSummary: 'Healthy operating margins with lean overhead.',
              },
              difficulty: 'Moderate',
              workEnvironment: 'Hybrid',
              locationType: 'Flexible',
              teamStructure: 'Small Team (2-5)',
              teamSetup: 'Small Team (2-4)',
              scalability: 'High / Global Scale',
              fullDescription: prefill.businessIdea,
              targetAudience: prefill.targetCustomers || 'General consumers',
              suggestedTeam: 'Founder + 2 staff',
              defaultGoals: prefill.businessGoals || 'Establish market presence',
            };
            onSelectIdea(ideaStub);
          }
        }}
      />
    </div>
  );
};
