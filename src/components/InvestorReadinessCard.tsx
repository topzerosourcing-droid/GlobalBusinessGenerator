import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  DollarSign, 
  PieChart, 
  FileText, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import { BusinessPlan } from '../types';

interface InvestorReadinessCardProps {
  plan: BusinessPlan;
  isUnlocked: boolean;
  onUpgradeClick: () => void;
}

export const InvestorReadinessCard: React.FC<InvestorReadinessCardProps> = ({
  plan,
  isUnlocked,
  onUpgradeClick
}) => {
  const { input, generatedPlan } = plan;
  const funding = generatedPlan.fundingRequirements;
  const exec = generatedPlan.executiveSummary;
  const financial = generatedPlan.monthlyRevenueForecast;

  // Investor readiness checklist items
  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Executive pitch thesis with quantifiable market size', checked: true },
    { id: '2', label: 'Detailed 3-year P&L and monthly cash burn rate calculated', checked: true },
    { id: '3', label: 'Clear capital deployment tranche allocation plan (Use of Funds)', checked: true },
    { id: '4', label: 'Risk mitigation matrix addressing competitor response and regulations', checked: true },
    { id: '5', label: 'Realistic break-even milestone horizon defined under 24 months', checked: true },
    { id: '6', label: 'Investor pitch deck slide-by-slide narrative structure formatted', checked: isUnlocked }
  ]);

  const toggleCheck = (id: string) => {
    if (!isUnlocked) return;
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const checkedCount = checklist.filter(c => c.checked).length;
  const readinessScore = Math.round((checkedCount / checklist.length) * 100);

  return (
    <div id="investor-readiness-suite" className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 p-6 sm:p-8 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
              <Award className="h-3.5 w-3.5" />
              <span>INVESTOR & FUNDING SUITE</span>
            </span>
            {isUnlocked ? (
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                Package Active
              </span>
            ) : (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                Preview Mode
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Capital Raising & Venture Pitch Readiness
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Structured for angel networks, seed funds, banks, and economic development grants in {input.country}.
          </p>
        </div>

        <div className="text-right shrink-0 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
            Readiness Score
          </span>
          <div className="text-2xl font-black text-slate-900">
            {readinessScore}%
            <span className="text-xs font-semibold text-emerald-600 ml-1.5">
              {readinessScore >= 80 ? 'Investment Ready' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Funding Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Target Capital</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">
            {funding?.primaryFundingGoal || `${input.startupCapital} ${input.currency}`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Required seed & working runway
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Use of Funds</span>
            <PieChart className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">
            {funding?.recommendedFundingStructure || 'Equipment, Inventory & Marketing'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Tranche milestone allocation
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Year 1 Run-Rate</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">
            {financial?.totalYear1ProjectedRevenue ? `${financial.totalYear1ProjectedRevenue.toLocaleString()} ${input.currency}` : `${input.currency} Projections`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Forecasted topline gross revenue
          </p>
        </div>
      </div>

      {/* Investor Pitch Deck Narrative & Checklist */}
      <div className="mt-6 pt-6 border-t border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>Investor & Loan Readiness Checklist</span>
          </h4>
          <span className="text-xs text-slate-500">{checkedCount} of {checklist.length} verified</span>
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div 
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-xs transition ${
                item.checked 
                  ? 'bg-white border-slate-200 text-slate-800' 
                  : 'bg-slate-50 border-dashed border-slate-300 text-slate-500'
              } ${isUnlocked ? 'cursor-pointer hover:border-indigo-300' : 'cursor-default'}`}
            >
              <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${
                item.checked ? 'text-emerald-600' : 'text-slate-300'
              }`} />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pitch Deck Slide Outline preview */}
      <div className="mt-6 pt-6 border-t border-indigo-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          10-Slide Investor Pitch Outline
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
          {[
            '1. Problem & Vision',
            '2. Market Size (TAM)',
            '3. Product Solution',
            '4. Business Model',
            '5. Competitive Moat',
            '6. Go-To-Market Plan',
            '7. Financial Milestones',
            '8. The Team',
            '9. Capital Ask ($)',
            '10. ROI & Exit Path'
          ].map((slide, i) => (
            <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* If Not Unlocked, show Investor CTA Banner */}
      {!isUnlocked && (
        <div className="mt-6 p-4 rounded-xl bg-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h5 className="font-bold text-sm">Need Venture Capital or a Commercial Bank Loan?</h5>
            <p className="text-xs text-indigo-100 mt-0.5">
              Unlock the complete Investor / Funding Package with executive one-pagers, valuation leeways, and print-ready exhibits.
            </p>
          </div>
          <button
            id="btn-investor-suite-upgrade"
            onClick={onUpgradeClick}
            className="shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            Unlock Investor Suite ($69 USD)
          </button>
        </div>
      )}
    </div>
  );
};
