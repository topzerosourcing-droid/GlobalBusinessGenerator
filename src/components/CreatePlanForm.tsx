import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Building, 
  Globe, 
  MapPin, 
  Coins, 
  DollarSign, 
  Users, 
  Target, 
  Flag, 
  FileText, 
  Loader2, 
  Check, 
  ArrowRight,
  Info,
  Wand2,
  CheckCircle2,
  Edit3,
  RotateCw,
  Save,
  ArrowLeft,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  BusinessPlanInput, 
  BusinessPlan, 
  GeneratedPlanContent, 
  CuratedBusinessIdea,
  BusinessPlanSectionKey,
  PLAN_SECTIONS_META
} from '../types';
import { saveBusinessPlanToFirestore } from '../lib/firebase';
import { GLOBAL_CURRENCIES, COMMON_INDUSTRIES } from '../data/businessIdeas';
import { SectionCard } from './SectionCard';
import { SectionEditModal } from './SectionEditModal';
import { AIDisclaimerBanner } from './AIDisclaimerBanner';

interface CreatePlanFormProps {
  initialIdea?: CuratedBusinessIdea | null;
  onPlanCreated: (plan: BusinessPlan) => void;
  onCancel?: () => void;
}

const EMPLOYEE_OPTIONS = [
  'Solo Founder (1 person)',
  '2 - 5 members (Core Founding Team)',
  '6 - 15 members (Small Team)',
  '16 - 50 members (Growing Organization)',
  '50+ members (Enterprise Venture)',
];

const CAPITAL_SHORTCUTS = [
  '1,000',
  '5,000',
  '15,000',
  '50,000',
  '100,000',
  '250,000',
];

export const CreatePlanForm: React.FC<CreatePlanFormProps> = ({
  initialIdea,
  onPlanCreated,
  onCancel,
}) => {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [businessIdea, setBusinessIdea] = useState('');
  const [country, setCountry] = useState(profile?.country || 'United States');
  const [cityRegion, setCityRegion] = useState('');
  const [currency, setCurrency] = useState(profile?.preferredCurrency || 'USD');
  const [startupCapital, setStartupCapital] = useState('15,000');
  const [industry, setIndustry] = useState('Information Technology & Software (SaaS)');
  const [targetCustomers, setTargetCustomers] = useState('');
  const [employeeCount, setEmployeeCount] = useState('2 - 5 members (Core Founding Team)');
  const [businessGoals, setBusinessGoals] = useState('');

  // Review & Refine State (Before Saving)
  const [isReviewingBeforeSave, setIsReviewingBeforeSave] = useState(false);
  const [generatedDraftPlan, setGeneratedDraftPlan] = useState<GeneratedPlanContent | null>(null);
  const [submittedInput, setSubmittedInput] = useState<BusinessPlanInput | null>(null);
  const [isSavingToFirestore, setIsSavingToFirestore] = useState(false);
  const [editingSectionKey, setEditingSectionKey] = useState<BusinessPlanSectionKey | null>(null);
  const [selectedReviewCategory, setSelectedReviewCategory] = useState<string>('ALL');

  // Pre-fill from initialIdea or profile
  useEffect(() => {
    if (initialIdea) {
      setBusinessName(initialIdea.title);
      setBusinessIdea(initialIdea.fullDescription || initialIdea.businessOverview || initialIdea.tagline);
      setIndustry(initialIdea.industry || 'Information Technology & Software (SaaS)');
      setTargetCustomers(
        Array.isArray(initialIdea.targetCustomers)
          ? initialIdea.targetCustomers.join(', ')
          : initialIdea.targetAudience || 'General market'
      );
      setBusinessGoals(initialIdea.defaultGoals || 'Establish profitable operations within Year 1');
      if (initialIdea.suggestedTeam) {
        setEmployeeCount(`${initialIdea.suggestedTeam} members`);
      }
      if (initialIdea.estimatedCapitalRange) {
        setStartupCapital(initialIdea.estimatedCapitalRange.replace(/[^0-9, -]/g, '').trim() || '5,000');
      }
      if (initialIdea.country) {
        const countryVal = Array.isArray(initialIdea.country) ? initialIdea.country[0] : initialIdea.country;
        if (countryVal && countryVal !== 'Global') {
          setCountry(countryVal);
          if (countryVal === 'Botswana') setCurrency('BWP');
          else if (countryVal === 'South Africa') setCurrency('ZAR');
          else if (countryVal === 'United Kingdom') setCurrency('GBP');
          else if (countryVal === 'Kenya') setCurrency('KES');
          else if (countryVal === 'Nigeria') setCurrency('NGN');
          else if (countryVal === 'India') setCurrency('INR');
        }
      }
    }
  }, [initialIdea]);

  useEffect(() => {
    if (profile?.country && !country) {
      setCountry(profile.country);
    }
    if (profile?.preferredCurrency && (!currency || currency === 'USD')) {
      setCurrency(profile.preferredCurrency);
    }
  }, [profile]);

  const handleGenerateNameSuggestion = () => {
    const prefixes = ['Global', 'Apex', 'Terra', 'Venture', 'Nexus', 'Horizon', 'Omni', 'Nova', 'Crest', 'Vital'];
    const suffix = industry.split(' ')[0] || 'Ventures';
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    setBusinessName(`${randomPrefix} ${suffix} Solutions`);
  };

  const handleInitialGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('You must be signed in to create and save a business plan.');
      return;
    }

    if (!businessName.trim() || !businessIdea.trim()) {
      setErrorMessage('Please provide both a business name and a description of your idea.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const inputData: BusinessPlanInput = {
      businessName: businessName.trim(),
      businessIdea: businessIdea.trim(),
      country: country.trim() || 'Global',
      cityRegion: cityRegion.trim() || 'Metropolitan Hub',
      currency: currency.trim() || 'USD',
      startupCapital: startupCapital.trim() || '15000',
      industry: industry.trim() || 'General Business',
      targetCustomers: targetCustomers.trim() || 'Local and international buyers',
      employeeCount,
      businessGoals: businessGoals.trim() || 'Achieve product-market fit and break-even in Year 1.',
    };

    setSubmittedInput(inputData);

    try {
      setProgressStep('Consulting AI strategist and regional economic intelligence...');
      
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: Failed to generate business plan`);
      }

      setProgressStep('Structuring all 34 sections and financial allocations...');
      const generatedContent: GeneratedPlanContent = await response.json();

      setGeneratedDraftPlan(generatedContent);
      setIsReviewingBeforeSave(true);
    } catch (err: any) {
      console.error('Error in plan generation workflow:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred while generating the plan. Please try again.');
    } finally {
      setIsSubmitting(false);
      setProgressStep('');
    }
  };

  const handleSaveSectionDraft = (sectionKey: BusinessPlanSectionKey, newSectionContent: any) => {
    if (!generatedDraftPlan) return;
    setGeneratedDraftPlan({
      ...generatedDraftPlan,
      [sectionKey]: newSectionContent,
    });
  };

  const handleFinalizeAndSaveToFirestore = async () => {
    if (!user || !submittedInput || !generatedDraftPlan) return;

    setIsSavingToFirestore(true);
    try {
      const planId = await saveBusinessPlanToFirestore(user.uid, {
        userId: user.uid,
        input: submittedInput,
        generatedPlan: generatedDraftPlan,
        status: 'free_preview',
      });

      const fullPlan: BusinessPlan = {
        id: planId,
        userId: user.uid,
        input: submittedInput,
        generatedPlan: generatedDraftPlan,
        status: 'free_preview',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onPlanCreated(fullPlan);
    } catch (err: any) {
      console.error('Error saving finalized business plan:', err);
      alert('Failed to save business plan: ' + err?.message);
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  // ==========================================
  // REVIEW & REFINE BEFORE SAVING SCREEN
  // ==========================================
  if (isReviewingBeforeSave && generatedDraftPlan && submittedInput) {
    const reviewCategories = [
      { id: 'ALL', label: 'All 34 Sections', count: 34 },
      { id: 'Executive & Core Strategy', label: '1. Executive', count: 4 },
      { id: 'Market, Customers & Competition', label: '2. Market', count: 5 },
      { id: 'Business Model & Operations', label: '3. Operations', count: 6 },
      { id: 'Financial Forecasts & Cash Flow', label: '4. Financials', count: 8 },
      { id: 'Go-To-Market & Governance', label: '5. Governance', count: 5 },
      { id: 'Execution Roadmap & Multi-Year Scale', label: '6. Roadmap', count: 6 },
    ];

    const filteredSections = PLAN_SECTIONS_META.filter((sec) => {
      if (selectedReviewCategory === 'ALL') return true;
      return sec.category === selectedReviewCategory;
    });

    return (
      <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-200">
        
        {/* Review Banner & Action Controls */}
        <div className="rounded-2xl bg-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>34 Sections Generated • Review & Edit Before Saving</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {submittedInput.businessName}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
                You can review every section below. Click <strong>Edit</strong> to modify text directly or <strong>AI Revise</strong> to regenerate individual sections with custom instructions. When satisfied, click <strong>Save & Finalize</strong> to add to your permanent dashboard.
              </p>
            </div>

            {/* Finalize Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsReviewingBeforeSave(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Inputs</span>
              </button>

              <button
                type="button"
                id="btn-save-final-plan"
                disabled={isSavingToFirestore}
                onClick={handleFinalizeAndSaveToFirestore}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-md hover:bg-emerald-400 transition disabled:opacity-60"
              >
                {isSavingToFirestore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Saving to Account...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-slate-950" />
                    <span>Save & Finalize Business Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Global AI Disclaimer */}
        <AIDisclaimerBanner />

        {/* Review Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {reviewCategories.map((cat) => {
            const isActive = selectedReviewCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedReviewCategory(cat.id)}
                className={`whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Render Sections */}
        <div className="space-y-8">
          {filteredSections.map((sec) => {
            const sectionData = (generatedDraftPlan as any)[sec.key];
            return (
              <div key={sec.key} id={`review-sec-${sec.key}`} className="scroll-mt-20">
                <SectionCard
                  sectionKey={sec.key}
                  data={sectionData}
                  currency={submittedInput.currency}
                  onEdit={(key) => setEditingSectionKey(key)}
                  onRegenerate={(key) => setEditingSectionKey(key)}
                  isEditable={true}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Save Bar */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Satisfied with your business plan?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Saving will store all 34 customized sections to your Firestore database where you can print, export, or further refine anytime.
            </p>
          </div>
          <button
            type="button"
            disabled={isSavingToFirestore}
            onClick={handleFinalizeAndSaveToFirestore}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {isSavingToFirestore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving to Account...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save & Finalize Business Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Section Edit / Regeneration Modal */}
        {editingSectionKey && (
          <SectionEditModal
            isOpen={true}
            onClose={() => setEditingSectionKey(null)}
            sectionKey={editingSectionKey}
            initialContent={(generatedDraftPlan as any)[editingSectionKey]}
            planInput={submittedInput}
            onSaveContent={(secKey, content) => {
              handleSaveSectionDraft(secKey, content);
            }}
          />
        )}

      </div>
    );
  }

  // ==========================================
  // INPUT FORM SCREEN
  // ==========================================
  return (
    <div className="mx-auto max-w-4xl">
      
      {/* Top Banner */}
      <div className="mb-8 rounded-2xl bg-linear-to-r from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 mb-2 border border-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Full 34-Section Strategic Business Plan Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Create New Business Plan
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Fill in your venture parameters below. Our AI will analyze economic conditions in {country}, synthesize customer acquisition strategies, and structure complete financial allocations in {currency}.
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="self-start sm:self-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
          <Info className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-red-900">Plan Generation Error</h4>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleInitialGenerate} className="space-y-8">
        
        {/* Section 1: Business Identity & Concept */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
            <Building className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">1. Business Identity & Core Idea</h2>
          </div>

          <div className="space-y-5">
            {/* Business Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateNameSuggestion}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Suggest Name</span>
                </button>
              </div>
              <input
                id="input-business-name"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex AgriLogistics, TerraClean Power, NovaFlow SaaS"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
              />
            </div>

            {/* Business Idea / Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Business Idea & Concept Description <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-medium">
                  {businessIdea.length} characters
                </span>
              </div>
              <textarea
                id="input-business-idea"
                required
                rows={4}
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="Describe your product or service, how it works, what customer problem it solves, and how you will deliver value to your community or global buyers..."
                className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition leading-relaxed"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Industry Sector <span className="text-red-500">*</span>
              </label>
              <select
                id="select-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white transition"
              >
                {COMMON_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Global Geography & Capital Allocation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
            <Globe className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">2. Geography & Financial Capital</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Country */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Country of Operation <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="input-country"
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, United Kingdom, Botswana, Germany, India"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
                />
              </div>
            </div>

            {/* City / Region */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                City / Region / Target Hub <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="input-city-region"
                  type="text"
                  required
                  value={cityRegion}
                  onChange={(e) => setCityRegion(e.target.value)}
                  placeholder="e.g. Austin TX, London, Gaborone, Berlin, Nairobi"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Financial Currency <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <select
                  id="select-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white transition"
                >
                  {GLOBAL_CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol}) — {curr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Available Startup Capital */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Available Startup Capital ({currency}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="input-startup-capital"
                  type="text"
                  required
                  value={startupCapital}
                  onChange={(e) => setStartupCapital(e.target.value)}
                  placeholder="15,000"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
                />
              </div>
              {/* Quick shortcuts */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Quick amounts:</span>
                {CAPITAL_SHORTCUTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStartupCapital(amt)}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                      startupCapital === amt
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Operations, Customers & Objectives */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
            <Target className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">3. Target Market & Operational Scale</h2>
          </div>

          <div className="space-y-5">
            {/* Target Customers */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Customers & Key Audience <span className="text-red-500">*</span>
              </label>
              <input
                id="input-target-customers"
                type="text"
                required
                value={targetCustomers}
                onChange={(e) => setTargetCustomers(e.target.value)}
                placeholder="e.g. Smallholder grain farmers, commercial real estate managers, remote software workers"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Number of Employees */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Initial Number of Employees <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    id="select-employee-count"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white transition"
                  >
                    {EMPLOYEE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Business Goals */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Year 1 Business Goals & Milestones <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Flag className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="input-business-goals"
                    type="text"
                    required
                    value={businessGoals}
                    onChange={(e) => setBusinessGoals(e.target.value)}
                    placeholder="e.g. Launch MVP in month 2, acquire 100 paying customers, achieve break-even by month 9"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Card & Progress Indicator */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Generate Full 34-Section Business Plan</span>
            </h3>
            <p className="text-xs text-slate-600 max-w-lg">
              You will be able to review, edit, and revise individual sections before saving the plan permanently to your account.
            </p>
            {isSubmitting && progressStep && (
              <p className="text-xs font-semibold text-indigo-700 animate-pulse mt-2 flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{progressStep}</span>
              </p>
            )}
          </div>

          <button
            id="btn-submit-generate-plan"
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.99] transition disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Strategy...</span>
              </>
            ) : (
              <>
                <span>Generate Business Plan</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
