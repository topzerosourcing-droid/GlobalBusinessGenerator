import React from 'react';
import { 
  Edit3, 
  RotateCw, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Users, 
  AlertTriangle,
  Briefcase,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { 
  BusinessPlanSectionKey, 
  PLAN_SECTIONS_META, 
  BusinessPlanSectionMeta 
} from '../types';
import { AIDisclaimerBanner } from './AIDisclaimerBanner';

interface SectionCardProps {
  sectionKey: BusinessPlanSectionKey;
  data: any;
  currency: string;
  onEdit: (key: BusinessPlanSectionKey) => void;
  onRegenerate: (key: BusinessPlanSectionKey) => void;
  isEditable?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  sectionKey,
  data,
  currency,
  onEdit,
  onRegenerate,
  isEditable = true,
}) => {
  const meta = PLAN_SECTIONS_META.find((s) => s.key === sectionKey);
  if (!meta || !data) return null;

  const isFinancialOrEstimate = [
    'startupCostBreakdown',
    'equipmentAssetRequirements',
    'operatingExpenses',
    'monthlyRevenueForecast',
    'monthlyExpenseForecast',
    'monthlyCashFlowForecast',
    'threeYearFinancialProjection',
    'breakEvenAnalysis',
    'grossProfitAndNetProfitEstimates',
    'fundingRequirements',
    'keyBusinessAssumptions'
  ].includes(sectionKey);

  const formatMoney = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return `0 ${currency}`;
    return `${val.toLocaleString()} ${currency}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs print-avoid-break relative transition hover:border-slate-300">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-start sm:items-center gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-extrabold text-xs text-white tracking-wider">
            {String(meta.number).padStart(2, '0')}
          </span>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {meta.title}
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {meta.category}
              </span>
              {isFinancialOrEstimate && <AIDisclaimerBanner compact />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {meta.description}
            </p>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        {isEditable && (
          <div className="flex items-center gap-2 shrink-0 print-hidden">
            <button
              type="button"
              onClick={() => onEdit(sectionKey)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition shadow-2xs"
              title="Edit content directly"
            >
              <Edit3 className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onRegenerate(sectionKey)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
              title="Revise or regenerate section"
            >
              <RotateCw className="h-3.5 w-3.5 text-indigo-600" />
              <span>Revise</span>
            </button>
          </div>
        )}
      </div>

      {/* Section Body Content */}
      <div className="text-sm text-slate-800 leading-relaxed">
        {renderSectionContent(sectionKey, data, currency, formatMoney)}
      </div>

    </div>
  );
};

function renderSectionContent(
  sectionKey: BusinessPlanSectionKey,
  data: any,
  currency: string,
  formatMoney: (val: number | undefined) => string
) {
  switch (sectionKey) {
    // 1. Executive Summary
    case 'executiveSummary':
      return (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Elevator Pitch</h4>
            <p className="text-sm text-slate-900 leading-relaxed font-medium">{data.elevatorPitch}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">Mission Statement</h4>
              <p className="text-sm text-slate-700">{data.missionStatement}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">Vision Statement</h4>
              <p className="text-sm text-slate-700">{data.visionStatement}</p>
            </div>
          </div>

          {data.keysToSuccess && Array.isArray(data.keysToSuccess) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Keys to Success</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.keysToSuccess.map((key: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg bg-emerald-50/60 border border-emerald-100 p-3 text-xs text-emerald-950 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{key}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.coreSummary && (
            <p className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-3 pt-1">
              {data.coreSummary}
            </p>
          )}
        </div>
      );

    // 2. Business Description
    case 'businessDescription':
      return (
        <div className="space-y-4">
          <p className="text-sm text-slate-800 leading-relaxed">{data.companyOverview}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-500 uppercase block mb-0.5">Classification</span>
              <span className="font-semibold text-slate-900">{data.industryClassification}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-500 uppercase block mb-0.5">Legal Structure</span>
              <span className="font-semibold text-slate-900">{data.legalStructure}</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-500 uppercase block mb-0.5">Location Rationale</span>
              <span className="font-semibold text-slate-900">{data.locationRationale}</span>
            </div>
          </div>
          {data.coreValues && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Core Values</span>
              <div className="flex flex-wrap gap-2">
                {data.coreValues.map((v: string, i: number) => (
                  <span key={i} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // 3. Problem & Solution
    case 'problemAndSolution':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 mb-2">The Problem in the Market</h4>
              <p className="text-sm text-slate-800 mb-3">{data.coreProblem}</p>
              {data.marketPainPoints && (
                <ul className="space-y-1.5">
                  {data.marketPainPoints.map((point: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-red-950 font-medium">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">The Proposed Solution</h4>
              <p className="text-sm text-slate-800 mb-3">{data.proposedSolution}</p>
              <div className="rounded-lg bg-white/90 p-3 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-0.5">Unique Value Proposition</span>
                <p className="text-xs text-slate-900 font-semibold">{data.uniqueValueProposition}</p>
              </div>
            </div>
          </div>
        </div>
      );

    // 4. Products / Services
    case 'productsServices':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.offerings?.map((item: any, i: number) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                    {item.pricingModel}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{item.description}</p>
                <div className="pt-2 border-t border-slate-200/60 text-xs">
                  <span className="font-semibold text-slate-700">Customer Benefit: </span>
                  <span className="text-slate-600">{item.targetCustomerBenefit}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-500 uppercase block mb-0.5">Delivery Method</span>
              <p className="text-slate-700">{data.deliveryMethod}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-500 uppercase block mb-0.5">Future Product Roadmap</span>
              <p className="text-slate-700">{data.futureProductRoadmap}</p>
            </div>
          </div>
        </div>
      );

    // 5. Target Market
    case 'targetMarket':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Demographic Profile</span>
            <p className="text-xs text-slate-800 leading-relaxed">{data.demographicProfile}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Geographic Scope</span>
            <p className="text-xs text-slate-800 leading-relaxed">{data.geographicScope}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Psychographic Traits</span>
            <p className="text-xs text-slate-800 leading-relaxed">{data.psychographicTraits}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Market Opportunity</span>
            <p className="text-xs text-slate-800 leading-relaxed">{data.marketSizeSummary}</p>
          </div>
        </div>
      );

    // 6. Local Market Analysis
    case 'localMarketAnalysis':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-bold uppercase text-indigo-700 mb-1">Regional Economic Context</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{data.regionalEconomicContext}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-bold uppercase text-indigo-700 mb-1">Local Demand Drivers</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{data.localDemandDrivers}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-bold uppercase text-indigo-700 mb-1">Cultural & Logistical Dynamics</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{data.culturalAndLogisticalFactors}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-xs font-bold uppercase text-indigo-700 mb-1">Location-Specific Opportunities</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{data.locationSpecificOpportunities}</p>
            </div>
          </div>
        </div>
      );

    // 7. Customer Personas
    case 'customerPersonas':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(data) && data.map((p: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 p-5 bg-slate-50/40 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                  {p.personaName ? p.personaName.charAt(0) : 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{p.personaName}</h4>
                  <span className="text-xs text-slate-500 font-medium">{p.roleOrProfile}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700 block text-[11px] uppercase">Key Goals:</span>
                  <span className="text-slate-600">{p.keyGoals}</span>
                </div>
                <div>
                  <span className="font-semibold text-red-700 block text-[11px] uppercase">Biggest Pain Point:</span>
                  <span className="text-slate-600">{p.biggestPainPoint}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block text-[11px] uppercase">Purchasing Factor:</span>
                  <span className="text-slate-600">{p.purchasingDecisionFactors}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="font-semibold text-indigo-700">Preferred Channel:</span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-800 font-medium">{p.preferredCommunicationChannel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    // 8. Competitor Analysis
    case 'competitorAnalysis':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(data) && data.map((c: any, i: number) => (
              <div key={i} className="rounded-xl border border-slate-200 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{c.competitorName}</h4>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    c.type === 'Direct' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {c.type} Competitor
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-emerald-700">Perceived Strengths: </span>
                    <span className="text-slate-600">{c.perceivedStrengths}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-red-700">Perceived Weaknesses: </span>
                    <span className="text-slate-600">{c.perceivedWeaknesses}</span>
                  </div>
                  <div className="rounded-lg bg-indigo-50/70 p-2.5 border border-indigo-100 mt-2">
                    <span className="font-bold text-indigo-900 block text-[11px] uppercase">Our Differentiation Moat:</span>
                    <span className="text-indigo-950 font-medium">{c.ourDifferentiation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    // 9. Competitive Advantage
    case 'competitiveAdvantage':
      return (
        <div className="space-y-4">
          <div className="rounded-xl bg-indigo-50/60 p-4 border border-indigo-100">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block mb-1">Primary Competitive Moat</span>
            <p className="text-sm font-semibold text-indigo-950">{data.primaryMoat}</p>
          </div>
          {data.coreDifferentiators && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Core Differentiators</span>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.coreDifferentiators.map((diff: string, i: number) => (
                  <li key={i} className="rounded-xl border border-slate-200 p-3 text-xs text-slate-800 bg-slate-50 font-medium flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="rounded-xl border border-slate-200 p-3.5">
              <span className="font-bold text-slate-700 uppercase block mb-1">Sustainability of Advantage</span>
              <p className="text-slate-600">{data.sustainabilityOfAdvantage}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5">
              <span className="font-bold text-slate-700 uppercase block mb-1">Customer Retention Defensibility</span>
              <p className="text-slate-600">{data.customerRetentionMoat}</p>
            </div>
          </div>
        </div>
      );

    // 10. Business Model
    case 'businessModel':
      return (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Monetization Engine</span>
            <p className="text-sm font-medium text-slate-900">{data.monetizationModel}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Key Strategic Partners</span>
              <ul className="space-y-1.5">
                {data.keyPartners?.map((p: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-700 block">Primary Cost Drivers</span>
              <ul className="space-y-1.5">
                {data.costDrivers?.map((c: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {data.scalabilitySummary && (
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-700">Scalability Assessment: </span>
              {data.scalabilitySummary}
            </p>
          )}
        </div>
      );

    // 11. Pricing Strategy
    case 'pricingStrategy':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 uppercase">Framework:</span>
            <span className="font-bold text-indigo-700">{data.pricingModelType}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.pricingTiers?.map((t: any, i: number) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">{t.tierName}</span>
                <div className="text-base font-extrabold text-slate-900">{t.pricePoint}</div>
                <p className="text-xs text-slate-600">{t.featuresOrScope}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-700 block mb-0.5">Margin Strategy:</span>
              <p className="text-slate-600">{data.marginStrategy}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-700 block mb-0.5">Promotions & Discounts:</span>
              <p className="text-slate-600">{data.promotionalOrDiscountTerms}</p>
            </div>
          </div>
        </div>
      );

    // 12. Startup Cost Breakdown
    case 'startupCostBreakdown':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Cost Category</th>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4">Necessity</th>
                  <th className="py-3 px-4 text-right">Estimated Cost ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items?.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.category}</td>
                    <td className="py-3 px-4 text-slate-600">{item.description}</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {item.necessity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatMoney(item.estimatedCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-slate-900">Total Estimated Startup Budget</td>
                  <td className="py-3 px-4 text-right text-indigo-700 font-extrabold text-sm">
                    {formatMoney(data.totalEstimatedStartupCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {data.contingencyReserve && (
            <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900">
              <span className="font-bold">Allocated Contingency Working Capital Reserve:</span>
              <span className="font-extrabold text-amber-950">{formatMoney(data.contingencyReserve)}</span>
            </div>
          )}
        </div>
      );

    // 13. Equipment & Asset Requirements
    case 'equipmentAssetRequirements':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Asset / Equipment Item</th>
                  <th className="py-3 px-4">Operational Purpose</th>
                  <th className="py-3 px-4">Procurement Model</th>
                  <th className="py-3 px-4 text-right">Est. Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.assets?.map((asset: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{asset.itemName}</td>
                    <td className="py-3 px-4 text-slate-600">{asset.purpose}</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {asset.procurementType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{formatMoney(asset.estimatedCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.physicalFacilitiesRequirements && (
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 uppercase block mb-1">Facilities & Workspace Requirements</span>
              <p className="text-slate-600">{data.physicalFacilitiesRequirements}</p>
            </div>
          )}
        </div>
      );

    // 14. Operating Expenses
    case 'operatingExpenses':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Monthly Expense Category</th>
                  <th className="py-3 px-4">Cost Nature</th>
                  <th className="py-3 px-4 text-right">Est. Monthly Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.monthlyItems?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.expenseCategory}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.isFixedCost ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {item.isFixedCost ? 'Fixed Expense' : 'Variable Expense'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{formatMoney(item.estimatedMonthlyCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-slate-900">Total Monthly Operating Expenditure</td>
                  <td className="py-3 px-4 text-right text-indigo-700 font-extrabold text-sm">{formatMoney(data.totalEstimatedMonthlyOpex)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {data.runwayNotes && (
            <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              {data.runwayNotes}
            </p>
          )}
        </div>
      );

    // 15. Staffing Plan
    case 'staffingPlan':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.roles?.map((role: any, i: number) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4 bg-slate-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">{role.title}</h4>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    {role.headcount} {role.headcount === 1 ? 'person' : 'people'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{role.keyResponsibilities}</p>
                <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-700">
                  Target Comp: <span className="text-slate-900">{role.estimatedMonthlyComp}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-700 uppercase block mb-0.5">Management Structure:</span>
              <p className="text-slate-600">{data.managementStructure}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-700 uppercase block mb-0.5">Hiring Milestones:</span>
              <p className="text-slate-600">{data.hiringMilestones}</p>
            </div>
          </div>
        </div>
      );

    // 16. Revenue Model
    case 'revenueModel':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.revenueStreams?.map((stream: any, i: number) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{stream.streamName}</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {stream.expectedContribution}
                  </span>
                </div>
                <span className="text-xs text-slate-500 block">{stream.pricingType}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-700 uppercase block mb-0.5">Sales Cycle Duration:</span>
              <p className="text-slate-600">{data.salesCycleLength}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="font-bold text-slate-700 uppercase block mb-0.5">Repeat Purchase Likelihood:</span>
              <p className="text-slate-600">{data.repeatPurchaseLikelihood}</p>
            </div>
          </div>
        </div>
      );

    // 17. Monthly Revenue Forecast
    case 'monthlyRevenueForecast':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Projected Units/Clients</th>
                  <th className="py-2.5 px-3 text-right">Projected Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.months?.map((m: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">{m.month}</td>
                    <td className="py-2 px-3 text-slate-600">{m.projectedUnitsOrClients} accounts</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{formatMoney(m.projectedRevenue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="py-3 px-3 text-slate-900">Total Year 1 Projected Revenue</td>
                  <td className="py-3 px-3 text-right text-emerald-700 font-extrabold text-sm">
                    {formatMoney(data.totalYear1ProjectedRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {data.underlyingAssumptions && (
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-700">Assumptions: </span>
              {data.underlyingAssumptions}
            </p>
          )}
        </div>
      );

    // 18. Monthly Expense Forecast
    case 'monthlyExpenseForecast':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Fixed Expenses</th>
                  <th className="py-2.5 px-3 text-right">Variable Expenses</th>
                  <th className="py-2.5 px-3 text-right">Total Expenses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.months?.map((m: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">{m.month}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{formatMoney(m.fixedExpenses)}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{formatMoney(m.variableExpenses)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{formatMoney(m.totalExpenses)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="py-3 px-3 text-slate-900">Total Year 1 Projected Expenditure</td>
                  <td className="py-3 px-3 text-right text-red-700 font-extrabold text-sm">
                    {formatMoney(data.totalYear1ProjectedExpenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {data.spendingNotes && (
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              {data.spendingNotes}
            </p>
          )}
        </div>
      );

    // 19. Monthly Cash Flow Forecast
    case 'monthlyCashFlowForecast':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Opening</th>
                  <th className="py-2.5 px-3 text-right">Inflow</th>
                  <th className="py-2.5 px-3 text-right">Outflow</th>
                  <th className="py-2.5 px-3 text-right">Net Cash</th>
                  <th className="py-2.5 px-3 text-right">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.months?.map((m: any, i: number) => {
                  const isPositive = (m.netCashFlow || 0) >= 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{m.month}</td>
                      <td className="py-2 px-3 text-right text-slate-500">{formatMoney(m.openingBalance)}</td>
                      <td className="py-2 px-3 text-right text-emerald-700 font-medium">{formatMoney(m.cashInflow)}</td>
                      <td className="py-2 px-3 text-right text-red-700 font-medium">{formatMoney(m.cashOutflow)}</td>
                      <td className={`py-2 px-3 text-right font-bold ${isPositive ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isPositive ? '+' : ''}{formatMoney(m.netCashFlow)}
                      </td>
                      <td className="py-2 px-3 text-right font-extrabold text-slate-900">{formatMoney(m.closingBalance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-700">Minimum Liquidity Cushion: </span>
              <span className="font-extrabold text-slate-900">{formatMoney(data.minimumCashThreshold)}</span>
            </div>
            <p className="text-slate-600 sm:text-right">{data.cashBufferAssessment}</p>
          </div>
        </div>
      );

    // 20. 3-Year Financial Projection
    case 'threeYearFinancialProjection':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Gross Revenue</th>
                  <th className="py-3 px-4 text-right">COGS / Delivery</th>
                  <th className="py-3 px-4 text-right">Operating Expenses</th>
                  <th className="py-3 px-4 text-right">Net Profit Before Tax</th>
                  <th className="py-3 px-4 text-right">YoY Trajectory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.years?.map((y: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{y.year}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{formatMoney(y.grossRevenue)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatMoney(y.costOfGoodsOrDelivery)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatMoney(y.operatingExpenses)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700">{formatMoney(y.netProfitBeforeTax)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        {y.projectedGrowthRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.multiYearGrowthDrivers && (
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-700">Growth Drivers: </span>
              {data.multiYearGrowthDrivers}
            </p>
          )}
        </div>
      );

    // 21. Break-Even Analysis
    case 'breakEvenAnalysis':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Monthly Fixed Costs</span>
              <span className="text-base font-extrabold text-slate-900">{formatMoney(data.estimatedMonthlyFixedCosts)}</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Break-Even Revenue</span>
              <span className="text-base font-extrabold text-indigo-700">{formatMoney(data.breakEvenMonthlyRevenue)}</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Break-Even Units/Clients</span>
              <span className="text-base font-extrabold text-slate-900">{data.breakEvenMonthlyUnitsOrClients}</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Timeline to Break-Even</span>
              <span className="text-base font-extrabold text-emerald-700">Month {data.estimatedMonthsToBreakEven}</span>
            </div>
          </div>
          <div className="rounded-xl bg-indigo-50/60 p-4 border border-indigo-100 text-xs">
            <span className="font-bold text-indigo-950 uppercase block mb-1">Break-Even Strategic Summary</span>
            <p className="text-indigo-900 leading-relaxed">{data.breakEvenSummary}</p>
          </div>
        </div>
      );

    // 22. Gross Profit & Net Profit Estimates
    case 'grossProfitAndNetProfitEstimates':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Gross Margin</span>
              <span className="text-base font-extrabold text-slate-900">{data.projectedGrossMarginPercentage}%</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Year 1 Gross Profit</span>
              <span className="text-base font-extrabold text-slate-900">{formatMoney(data.projectedYear1GrossProfit)}</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Year 1 Net Profit</span>
              <span className="text-base font-extrabold text-emerald-700">{formatMoney(data.projectedYear1NetProfit)}</span>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Net Margin</span>
              <span className="text-base font-extrabold text-emerald-700">{data.projectedYear1NetMarginPercentage}%</span>
            </div>
          </div>
          {data.profitabilityLevers && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Key Profitability Levers</span>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {data.profitabilityLevers.map((lever: string, i: number) => (
                  <li key={i} className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-slate-700 font-medium">
                    • {lever}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );

    // 23. Key Business Assumptions
    case 'keyBusinessAssumptions':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block">Market Assumptions</span>
              <ul className="space-y-1 text-xs text-slate-700">
                {data.marketAssumptions?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block">Financial Assumptions</span>
              <ul className="space-y-1 text-xs text-slate-700">
                {data.financialAssumptions?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block">Operational Assumptions</span>
              <ul className="space-y-1 text-xs text-slate-700">
                {data.operationalAssumptions?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {data.disclaimer && (
            <p className="text-xs text-amber-900 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
              <span className="font-bold">Notice: </span>
              {data.disclaimer}
            </p>
          )}
        </div>
      );

    // 24. Risks & Mitigation
    case 'risksAndMitigation':
      return (
        <div className="space-y-3">
          {Array.isArray(data) && data.map((risk: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{risk.riskCategory}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  risk.severity === 'High' ? 'bg-red-100 text-red-800' :
                  risk.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {risk.severity} Severity
                </span>
              </div>
              <p className="text-xs text-slate-700">{risk.riskDescription}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="rounded-lg bg-emerald-50/50 p-2 border border-emerald-100">
                  <span className="font-bold text-emerald-900 block text-[11px]">Mitigation Strategy:</span>
                  <span className="text-emerald-950">{risk.mitigationStrategy}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                  <span className="font-bold text-slate-700 block text-[11px]">Contingency Action:</span>
                  <span className="text-slate-600">{risk.contingencyAction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    // 25. Marketing Strategy
    case 'marketingStrategy':
      return (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Brand Positioning Narrative</span>
            <p className="text-sm font-medium text-slate-900">{data.positioningAndBrandNarrative}</p>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Primary Acquisition Channels</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.primaryMarketingChannels?.map((ch: any, i: number) => (
                <div key={i} className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{ch.channel}</span>
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      {ch.allocationShare}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{ch.strategy}</p>
                </div>
              ))}
            </div>
          </div>
          {data.customerRetentionApproach && (
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 uppercase block mb-0.5">Customer Retention Approach</span>
              <p className="text-slate-600">{data.customerRetentionApproach}</p>
            </div>
          )}
        </div>
      );

    // 26. Sales Strategy
    case 'salesStrategy':
      return (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Sales Funnel Overview</span>
            <p className="text-xs text-slate-800 leading-relaxed">{data.salesFunnelOverview}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Conversion Tactics</span>
              <ul className="space-y-1">
                {data.conversionTactics?.map((t: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-700 block">Channel Partnerships</span>
              <ul className="space-y-1">
                {data.channelPartnerships?.map((p: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {data.targetClosingCycle && (
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-700">Target Closing Cycle: </span>
              {data.targetClosingCycle}
            </p>
          )}
        </div>
      );

    // 27. Technology Requirements
    case 'technologyRequirements':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Core Platforms & Tools</span>
              <ul className="space-y-1">
                {data.coreSoftwareAndPlatforms?.map((tool: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-700 block">Hosting & Infrastructure</span>
              <p className="text-slate-600">{data.infrastructureAndHosting}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="font-bold text-slate-700 uppercase block mb-1">Cybersecurity & Data Privacy</span>
              <p className="text-slate-600">{data.cybersecurityAndDataPrivacy}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="font-bold text-slate-700 uppercase block mb-1">Automation Opportunities</span>
              <p className="text-slate-600">{data.automationOpportunities}</p>
            </div>
          </div>
        </div>
      );

    // 28. Legal & Regulatory Considerations
    case 'legalRegulatoryConsiderations':
      return (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Corporate Registration Requirements</span>
            <p className="text-sm text-slate-900 font-medium">{data.registrationRequirements}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 p-3.5 space-y-1">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Permits & Licenses</span>
              <ul className="space-y-1">
                {data.requiredPermitsAndLicenses?.map((perm: string, i: number) => (
                  <li key={i} className="text-slate-700">• {perm}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 space-y-1">
              <span className="font-bold uppercase tracking-wider text-slate-700 block">Tax & Statutory Duties</span>
              <p className="text-slate-600">{data.taxAndStatutoryObligations}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 space-y-1">
              <span className="font-bold uppercase tracking-wider text-slate-700 block">Compliance Guidelines</span>
              <p className="text-slate-600">{data.complianceGuidelines}</p>
            </div>
          </div>
        </div>
      );

    // 29. Funding Requirements
    case 'fundingRequirements':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-indigo-50 border border-indigo-200 p-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">Total Capital Requirement</span>
              <span className="text-xl font-extrabold text-indigo-950">{formatMoney(data.totalFundingRequired)}</span>
            </div>
            <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-indigo-800 border border-indigo-200 shadow-2xs">
              {data.targetFundingSource || 'Initial Equity & Grants'}
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Use of Funds Allocation</th>
                  <th className="py-2.5 px-3">Share (%)</th>
                  <th className="py-2.5 px-3 text-right">Amount ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.allocationBreakdown?.map((alloc: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-semibold text-slate-800">{alloc.useOfFunds}</td>
                    <td className="py-2 px-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {alloc.percentage}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{formatMoney(alloc.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.expectedInvestorReturnRationale && (
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 uppercase block mb-1">Investor Return Rationale</span>
              <p className="text-slate-600">{data.expectedInvestorReturnRationale}</p>
            </div>
          )}
        </div>
      );

    // 30. 90-Day Launch Plan
    case 'ninetyDayLaunchPlan':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Days 1 - 30</span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Setup & Pilot</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.days1To30?.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Days 31 - 60</span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Soft Launch</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.days31To60?.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Days 61 - 90</span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Scale & Optimize</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {data.days61To90?.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {data.keyLaunchMilestone && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">90-Day Victory Milestone: </span>
                <span>{data.keyLaunchMilestone}</span>
              </div>
            </div>
          )}
        </div>
      );

    // 31. Year 1 Milestones
    case 'year1Milestones':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-1">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Q1 Target</span>
              <p className="text-slate-700">{data.q1Milestone}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-1">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Q2 Target</span>
              <p className="text-slate-700">{data.q2Milestone}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-1">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Q3 Target</span>
              <p className="text-slate-700">{data.q3Milestone}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-1">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Q4 Target</span>
              <p className="text-slate-700">{data.q4Milestone}</p>
            </div>
          </div>
          {data.yearEndObjective && (
            <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-3.5 text-xs text-indigo-950">
              <span className="font-bold uppercase block mb-0.5">Year-End Overarching Objective:</span>
              <p className="font-semibold">{data.yearEndObjective}</p>
            </div>
          )}
        </div>
      );

    // 32. Year 2 Growth Strategy
    case 'year2GrowthStrategy':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-4 space-y-1 bg-slate-50/50">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Expansion Objectives</span>
              <p className="text-slate-700">{data.expansionGoals}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-1 bg-slate-50/50">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Product & Service Innovations</span>
              <p className="text-slate-700">{data.productOrServiceInnovations}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-1 bg-slate-50/50">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Geographic & Market Reach</span>
              <p className="text-slate-700">{data.geographicOrDemographicExpansion}</p>
            </div>
            <div className="rounded-xl border border-indigo-200 p-4 space-y-1 bg-indigo-50/50">
              <span className="font-bold uppercase tracking-wider text-indigo-900 block">Target Year 2 Revenue Milestone</span>
              <p className="text-indigo-950 font-extrabold text-base">{data.targetRevenueMilestone}</p>
            </div>
          </div>
        </div>
      );

    // 33. Year 3 Expansion Strategy
    case 'year3ExpansionStrategy':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-4 space-y-1 bg-slate-50/50">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Maturity & Industry Benchmark</span>
              <p className="text-slate-700">{data.strategicMaturityVision}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-1 bg-slate-50/50">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Franchise & Licensing Scaling</span>
              <p className="text-slate-700">{data.scaleOrFranchisePotential}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-1 bg-slate-50/50">
              <span className="font-bold uppercase tracking-wider text-indigo-700 block">Market Leadership Goal</span>
              <p className="text-slate-700">{data.marketLeadershipGoal}</p>
            </div>
            <div className="rounded-xl border border-indigo-200 p-4 space-y-1 bg-indigo-50/50">
              <span className="font-bold uppercase tracking-wider text-indigo-900 block">Target Year 3 Revenue Milestone</span>
              <p className="text-indigo-950 font-extrabold text-base">{data.targetRevenueMilestone}</p>
            </div>
          </div>
        </div>
      );

    // 34. AI Strategic Recommendations
    case 'aiStrategicRecommendations':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">High-Impact Opportunities</span>
              <ul className="space-y-1.5 text-xs text-emerald-950">
                {data.highImpactOpportunities?.map((opp: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-900 block">Critical Pitfalls to Avoid</span>
              <ul className="space-y-1.5 text-xs text-red-950">
                {data.criticalPitfallsToAvoid?.map((pit: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{pit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">Immediate Priorities</span>
              <ul className="space-y-1.5 text-xs text-indigo-950">
                {data.immediateStrategicPriorities?.map((prio: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{prio}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {data.strategicVerdict && (
            <div className="rounded-xl bg-slate-900 p-5 text-white space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Strategic Consultant Verdict</span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold">
                  Recommended Path Forward
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {data.strategicVerdict}
              </p>
            </div>
          )}
        </div>
      );

    default:
      return (
        <pre className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto text-slate-800">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
}
