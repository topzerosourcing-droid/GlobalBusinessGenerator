import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  FileCheck2, 
  Layers, 
  CheckCircle2, 
  Users, 
  Building2, 
  Compass,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CURATED_BUSINESS_IDEAS } from '../data/businessIdeas';
import { PRODUCT_PACKAGES } from '../services/entitlementService';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onNavigateToCreatePlan: () => void;
  onNavigateToIdeas: () => void;
  onSelectIdea: (idea: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onNavigateToCreatePlan,
  onNavigateToIdeas,
  onSelectIdea,
}) => {
  const { user } = useAuth();

  const handleStartPlan = () => {
    if (user) {
      onNavigateToCreatePlan();
    } else {
      onOpenAuth('register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/80 bg-linear-to-b from-white via-slate-50/50 to-slate-100/30">
        
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-100/60 blur-3xl rounded-full" />
          <div className="absolute top-1/2 right-10 w-96 h-96 bg-blue-100/40 blur-3xl rounded-full" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Global Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs mb-6 backdrop-blur-xs">
            <Globe className="h-3.5 w-3.5 text-indigo-600" />
            <span>Built for Entrepreneurs Across 190+ Countries</span>
          </div>

          {/* Headline - Exact required text */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15] max-w-4xl mx-auto">
            Turn Your Business Idea Into a{' '}
            <span className="bg-linear-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
              Real Business Plan
            </span>
          </h1>

          {/* Short Explanation */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Global Business Generator helps ambitious founders anywhere in the world turn raw concepts into comprehensive, investor-grade business plans complete with regional financial projections, market analyses, and operational roadmaps.
          </p>

          {/* CTAs - Exact required buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="cta-create-my-business-plan"
              onClick={handleStartPlan}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.99] transition duration-150"
            >
              <Sparkles className="h-4 w-4 text-indigo-200" />
              <span>Create My Business Plan</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              id="cta-explore-business-ideas"
              onClick={onNavigateToIdeas}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition duration-150"
            >
              <Compass className="h-4 w-4 text-indigo-600" />
              <span>Explore Business Ideas</span>
            </button>
          </div>

          {/* Key Assurance Indicators */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Contextualized to Your Country & Currency</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Secure Cloud Firestore Synchronization</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Powered by Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars / What Every Business Plan Includes */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Enterprise Rigor, Instant Speed</span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Everything Needed for Bankers, Grants & Co-Founders
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Unlike generic chatbots, Global Business Generator computes specific unit economics, regulatory considerations, and marketing channels tailored to your local economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:border-indigo-300 transition shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Executive Summary & Vision</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Clear elevator pitch, mission statement, problem-solution mapping, and defined competitive moats designed to hook investors immediately.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:border-indigo-300 transition shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Local & Global Market Analysis</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Industry headwinds, demographic buyer personas, total addressable market analysis, and differentiation against regional competitors.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:border-indigo-300 transition shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Capital & Cash Flow Projections</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Realistic startup capital allocation, monthly burn rates, break-even milestones, and 4-quarter financial models in your home currency.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:border-indigo-300 transition shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Team Structure & Operations</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Workflows customized to your exact team headcount, technology stack recommendations, and core operational responsibilities.
              </p>
            </div>

            {/* Pillar 5 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:border-indigo-300 transition shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Risk Assessment & Compliance</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Identification of high, medium, and low market risks with concrete mitigation playbooks and legal registration considerations.
              </p>
            </div>

            {/* Pillar 6 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:border-indigo-300 transition shadow-2xs">
              <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Actionable 90-Day Execution Plan</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Tactical breakdown of milestones for Day 1-30, Day 31-60, and Day 61-90 to transition seamlessly from planning into execution.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Curated Business Ideas Preview Section */}
      <section id="curated-ideas-preview" className="py-16 sm:py-20 bg-slate-100/60 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Global Opportunity Vault</span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                Explore High-Potential Global Business Ideas
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-xl">
                Need inspiration? Browse vetted opportunities tested across international markets. Select any idea to auto-populate your setup form.
              </p>
            </div>
            <button
              id="btn-view-all-ideas"
              onClick={onNavigateToIdeas}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              <span>View All Ideas Directory</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CURATED_BUSINESS_IDEAS.slice(0, 3).map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-indigo-400 hover:shadow-md transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                      {idea.category}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Cap: {idea.estimatedCapitalRange}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {idea.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {idea.fullDescription}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Team: {idea.suggestedTeam}
                  </span>
                  <button
                    id={`btn-use-idea-${idea.id}`}
                    onClick={() => onSelectIdea(idea)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition"
                  >
                    <span>Use Idea</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Founder Testimonials & Archetypes */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Cross-Border Impact</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Designed for Founders in Every Market
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "Having the currency and local capital allocation calculated in Euros with specific EU compliance checkpoints saved our early stage team weeks of consulting fees."
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  MN
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Matthias Neumann</h4>
                  <p className="text-[11px] text-slate-500">CleanTech Founder • Munich, Germany</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "The 90-day action plan was so practical that our commercial banking partner approved our initial working capital facility on the first review."
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs">
                  AK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Amina Kamau</h4>
                  <p className="text-[11px] text-slate-500">AgriLogistics Entrepreneur • Nairobi, Kenya</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "As a solo builder bootstrapping a SaaS product, having clear quarter-by-quarter unit economics gave me the confidence to leave full-time employment."
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                  JL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Jian Lin</h4>
                  <p className="text-[11px] text-slate-500">Software Founder • Singapore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section Teaser */}
      <section id="pricing-section" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Transparent Global SaaS Pricing</span>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Start Free, Scale as Your Venture Grows
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Generate your first business plans completely free. Expand to Pro for multi-scenario financial forecasts and export capabilities.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{PRODUCT_PACKAGES.free.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">$0</span>
                  <span className="text-xs text-slate-500">USD / forever</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{PRODUCT_PACKAGES.free.description}</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Business Idea & Feasibility Validation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Executive Summary Foundation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Basic Startup Capital & Revenue Teasers</span>
                  </li>
                </ul>
              </div>
              <button
                id="btn-pricing-free-tier"
                onClick={handleStartPlan}
                className="mt-6 w-full rounded-xl border border-slate-300 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                {PRODUCT_PACKAGES.free.ctaLabel}
              </button>
            </div>

            <div className="relative rounded-2xl border-2 border-emerald-600 bg-white p-6 shadow-lg flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                Most Popular
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{PRODUCT_PACKAGES.pro.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">${PRODUCT_PACKAGES.pro.priceUSD}</span>
                  <span className="text-xs text-slate-500">USD / one-time</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{PRODUCT_PACKAGES.pro.description}</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Complete 34-Section Strategic Plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>3-Year Financial Model & Cash-Flow</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Break-Even Analysis & Pricing Strategy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Professional Bank-Ready PDF Export</span>
                  </li>
                </ul>
              </div>
              <button
                id="btn-pricing-pro-tier"
                onClick={handleStartPlan}
                className="mt-6 w-full rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Unlock Pro Plan (${PRODUCT_PACKAGES.pro.priceUSD})
              </button>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="inline-block text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full mb-1">
                  Venture & Grants
                </div>
                <h3 className="font-bold text-slate-900">{PRODUCT_PACKAGES.investor.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">${PRODUCT_PACKAGES.investor.priceUSD}</span>
                  <span className="text-xs text-slate-500">USD / one-time</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{PRODUCT_PACKAGES.investor.description}</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Everything in Pro Business Plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Funding Tranches & Use-of-Funds Plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>10-Slide Pitch Deck Narrative Content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Investor & Loan Readiness Audit Suite</span>
                  </li>
                </ul>
              </div>
              <button
                id="btn-pricing-enterprise-tier"
                onClick={handleStartPlan}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-center text-xs font-bold text-white hover:bg-indigo-700 transition"
              >
                Get Investor Suite (${PRODUCT_PACKAGES.investor.priceUSD})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Globe className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              Global Business Generator
            </span>
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-right">
            Empowering international founders to build sustainable enterprises. © {new Date().getFullYear()} Global Business Generator. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
