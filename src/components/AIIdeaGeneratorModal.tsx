import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  DollarSign, 
  MapPin, 
  Briefcase, 
  Wrench, 
  Globe2, 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  Loader2,
  Filter,
  Share2
} from 'lucide-react';
import { AIIdeaGeneratorInput, AIGeneratedIdea, CuratedBusinessIdea } from '../types';
import { Analytics } from '../lib/analytics';
import { COUNTRY_PROFILES, CURRENCY_SYMBOLS } from '../data/businessIdeas';

interface AIIdeaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIdeaForPlan: (prefillData: any) => void;
  initialCountry?: string;
  initialCapital?: string;
  initialIndustry?: string;
}

export const AIIdeaGeneratorModal: React.FC<AIIdeaGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectIdeaForPlan,
  initialCountry = 'Botswana',
  initialCapital = '3000',
  initialIndustry = 'Any'
}) => {
  const [formData, setFormData] = useState<AIIdeaGeneratorInput>({
    country: initialCountry,
    currency: 'USD',
    availableCapital: initialCapital,
    skillsInterests: 'Customer service, digital marketing, project management',
    preferredIndustry: initialIndustry,
    onlineOffline: 'Any',
    businessSize: 'Small Team',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<AIGeneratedIdea[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedRank, setExpandedRank] = useState<number | null>(1);

  if (!isOpen) return null;

  const handleCountryChange = (countryName: string) => {
    const matchedProfile = COUNTRY_PROFILES.find(
      (p) => p.name.toLowerCase() === countryName.toLowerCase()
    );
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      currency: matchedProfile ? matchedProfile.currency : prev.currency,
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setIdeas(null);

    Analytics.search(
      `${formData.country} ${formData.availableCapital} ${formData.preferredIndustry}`,
      { ...formData }
    );

    try {
      const response = await fetch('/api/generate-business-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
        setExpandedRank(1);
      } else {
        throw new Error('Invalid ideas response format');
      }
    } catch (err: any) {
      console.error('Failed to generate business ideas:', err);
      setErrorMessage(err.message || 'Unable to generate ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTurnIntoPlan = (idea: AIGeneratedIdea) => {
    Analytics.businessPlanCtaClick(`ai-idea-${idea.rank}`, idea.title, 'ai_idea_generator');
    onSelectIdeaForPlan(idea.prefillData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/30 text-amber-400 border border-indigo-400/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">AI Business Opportunity Strategist</h2>
              <p className="text-xs text-slate-300">Discover 10 ranked business ideas tailored to your budget, country & skills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Form */}
          <form onSubmit={handleGenerate} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Country */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                  Target Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Botswana">Botswana (BWP)</option>
                  <option value="South Africa">South Africa (ZAR)</option>
                  <option value="United Kingdom">United Kingdom (GBP)</option>
                  <option value="United States">United States (USD)</option>
                  <option value="Kenya">Kenya (KES)</option>
                  <option value="Nigeria">Nigeria (NGN)</option>
                  <option value="India">India (INR)</option>
                  <option value="Ghana">Ghana (GHS)</option>
                  <option value="Canada">Canada (CAD)</option>
                  <option value="Australia">Australia (AUD)</option>
                  <option value="Global">Global / Worldwide (USD)</option>
                </select>
              </div>

              {/* Capital & Currency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  Available Startup Capital
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.availableCapital}
                    onChange={(e) => setFormData({ ...formData, availableCapital: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-700"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="BWP">BWP (P)</option>
                    <option value="ZAR">ZAR (R)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="KES">KES (KSh)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              {/* Preferred Industry */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                  Preferred Industry
                </label>
                <select
                  value={formData.preferredIndustry}
                  onChange={(e) => setFormData({ ...formData, preferredIndustry: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Any">Any High-Potential Industry</option>
                  <option value="Technology & SaaS">Technology & Software</option>
                  <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                  <option value="Food & Beverage / Hospitality">Food, Beverage & Dining</option>
                  <option value="Professional & Business Services">Professional Services & Consulting</option>
                  <option value="Logistics, Transport & Supply Chain">Logistics & Express Delivery</option>
                  <option value="Renewable Energy & Utilities">Solar & Renewable Energy</option>
                  <option value="Agriculture & AgriTech">Agriculture & Agri-processing</option>
                  <option value="Healthcare, Wellness & Fitness">Health & Wellness</option>
                  <option value="Education & EdTech">Education & Skills Training</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Skills / Interests */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Wrench className="h-3.5 w-3.5 text-amber-600" />
                  Your Skills, Background or Interests
                </label>
                <input
                  type="text"
                  value={formData.skillsInterests}
                  onChange={(e) => setFormData({ ...formData, skillsInterests: e.target.value })}
                  placeholder="e.g. Sales, cooking, digital marketing, logistics, carpentry..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Online vs Offline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Globe2 className="h-3.5 w-3.5 text-blue-600" />
                  Work Preference
                </label>
                <select
                  value={formData.onlineOffline}
                  onChange={(e) => setFormData({ ...formData, onlineOffline: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Any">Any (Online, Hybrid or Offline)</option>
                  <option value="Online">Online / Home-based Only</option>
                  <option value="Offline">Offline / Physical Location</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500">
                Ranked 1 to 10 by feasibility, local market conditions & budget alignment.
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Market Opportunities...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Generate 10 Ranked Business Ideas</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Notice */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800">
              {errorMessage}
            </div>
          )}

          {/* Results List */}
          {ideas && ideas.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span>Top 10 Ranked Opportunities for {formData.country}</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Ranked from strongest (#1) to weakest (#10)
                </span>
              </div>

              <div className="space-y-3">
                {ideas.map((idea) => {
                  const isExpanded = expandedRank === idea.rank;
                  return (
                    <div
                      key={idea.rank}
                      className={`rounded-2xl border transition ${
                        idea.rank === 1
                          ? 'border-indigo-300 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/30 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Card Header Row */}
                      <div 
                        onClick={() => setExpandedRank(isExpanded ? null : idea.rank)}
                        className="cursor-pointer p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs ${
                            idea.rank === 1 
                              ? 'bg-amber-400 text-slate-950 shadow-xs' 
                              : idea.rank <= 3
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            #{idea.rank}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                {idea.title}
                              </h4>
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-100">
                                {idea.fitScore}% Match
                              </span>
                              <span className="text-xs text-slate-500">
                                {idea.industry}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                              {idea.tagline}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Est. Capital</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900">{idea.estimatedCapitalLocal}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTurnIntoPlan(idea);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95"
                          >
                            <span>Turn Into Plan</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/40 p-4 sm:p-5 space-y-4 rounded-b-2xl text-xs">
                          {/* Match Rationale & Why It Works */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 space-y-1">
                              <span className="font-bold text-indigo-950 flex items-center gap-1">
                                <Zap className="h-3.5 w-3.5 text-indigo-600" />
                                Why It Fits Your Profile:
                              </span>
                              <p className="text-slate-700 leading-relaxed">{idea.matchRationale}</p>
                            </div>

                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 space-y-1">
                              <span className="font-bold text-emerald-950 flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                Why It Works in {formData.country}:
                              </span>
                              <p className="text-slate-700 leading-relaxed">{idea.whyItWorksInCountry}</p>
                            </div>
                          </div>

                          {/* Quick Facts */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Difficulty</span>
                              <span className="font-bold text-slate-800">{idea.difficulty}</span>
                            </div>
                            <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Environment</span>
                              <span className="font-bold text-slate-800">{idea.workEnvironment}</span>
                            </div>
                            <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Market</span>
                              <span className="font-bold text-slate-800 truncate block">{idea.targetCustomers}</span>
                            </div>
                            <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Revenue Model</span>
                              <span className="font-bold text-slate-800 truncate block">{idea.revenueModel}</span>
                            </div>
                          </div>

                          {/* 3 First Steps */}
                          <div className="space-y-1.5 pt-1">
                            <span className="font-bold text-slate-700 block">Immediate Next Steps:</span>
                            <div className="space-y-1">
                              {idea.firstSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-slate-600">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action CTA */}
                          <div className="pt-2 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleTurnIntoPlan(idea)}
                              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                              <span>Generate Complete 34-Section Plan with This Idea</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
