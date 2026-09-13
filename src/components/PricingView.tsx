import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  Lock,
  FileCheck,
  Award,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRODUCT_PACKAGES } from '../services/entitlementService';
import { PlanPackageId, BusinessPlan } from '../types';
import { CheckoutModal } from './CheckoutModal';

interface PricingViewProps {
  plans?: BusinessPlan[];
  onOpenPlan?: (plan: BusinessPlan) => void;
  onNavigateToGenerator?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  plans = [],
  onOpenPlan,
  onNavigateToGenerator
}) => {
  const { user } = useAuth();
  const [selectedPackageForCheckout, setSelectedPackageForCheckout] = useState<PlanPackageId | null>(null);
  const [targetPlanId, setTargetPlanId] = useState<string>(plans[0]?.id || '');
  const [notice, setNotice] = useState<string | null>(null);

  const targetPlan = plans.find(p => p.id === targetPlanId) || plans[0] || {
    id: 'sample_plan_demo',
    userId: user?.uid || 'guest_user',
    status: 'draft',
    input: {
      businessName: 'My Global Venture',
      businessIdea: 'Comprehensive Strategic Plan',
      country: 'United States',
      cityRegion: 'San Francisco, CA',
      currency: 'USD',
      startupCapital: '50,000',
      employeeCount: '1-5 employees',
      targetAudience: 'Global',
      industryCategory: 'Technology & Services'
    },
    generatedPlan: {} as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const handleSelectPackage = (pkgId: PlanPackageId) => {
    if (pkgId === 'free') {
      setNotice('The Free package is automatically applied when you generate any business plan.');
      return;
    }
    setSelectedPackageForCheckout(pkgId);
  };

  const packagesList = [
    PRODUCT_PACKAGES.free,
    PRODUCT_PACKAGES.pro,
    PRODUCT_PACKAGES.investor
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mb-2">
          <CreditCard className="h-3.5 w-3.5" />
          <span>One-Time Licensing • Lifetime Access</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Transparent Product Packages
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
          Generate a free foundation, then unlock the full 34-section business plan or the investor-ready fundraising suite when you are ready to scale. No recurring subscription fees.
        </p>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-start justify-between gap-2 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>{notice}</p>
          </div>
          <button 
            onClick={() => setNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Plan Target Selector if User has multiple plans */}
      {plans.length > 1 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700">Select Plan to License:</span>
          <select
            value={targetPlanId}
            onChange={(e) => setTargetPlanId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.input.businessName} ({p.status === 'paid' ? 'Unlocked' : 'Free Preview'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3 Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packagesList.map((pkg) => {
          const isPro = pkg.id === 'pro';
          const isInvestor = pkg.id === 'investor';
          const isFree = pkg.id === 'free';

          return (
            <div
              key={pkg.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 sm:p-8 shadow-xs transition ${
                isPro
                  ? 'border-2 border-emerald-600 shadow-md ring-1 ring-emerald-600/20'
                  : isInvestor
                  ? 'border-2 border-indigo-600 shadow-md ring-1 ring-indigo-600/20'
                  : 'border-slate-200'
              }`}
            >
              {pkg.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white ${
                  isInvestor ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}>
                  {pkg.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
                  {isFree && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      Standard
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{pkg.tagline}</p>

                <div className="mt-5 flex items-baseline gap-1 border-b border-slate-100 pb-5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    ${pkg.priceUSD}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 ml-1">
                    {isFree ? 'forever free' : 'USD one-time'}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    What's Included:
                  </span>
                  <ul className="space-y-2.5">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${
                          isInvestor ? 'text-indigo-600' : isPro ? 'text-emerald-600' : 'text-slate-400'
                        }`} />
                        <span className="font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  id={`btn-pricing-package-${pkg.id}`}
                  onClick={() => handleSelectPackage(pkg.id)}
                  className={`w-full rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isFree
                      ? 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      : isInvestor
                      ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 shadow-indigo-600/20'
                      : 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  <span>
                    {isFree ? 'Generate Free Plan' : `Unlock ${pkg.name} ($${pkg.priceUSD})`}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  {isFree ? 'No credit card needed' : 'Single plan license • Instant unlock'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70">
          <h3 className="text-base font-bold text-slate-900">Detailed Package Comparison</h3>
          <p className="text-xs text-slate-500">Every section and tool transparently mapped across packages.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Feature / Deliverable</th>
                <th className="py-3 px-4 text-center">Free ($0)</th>
                <th className="py-3 px-4 text-center text-emerald-700">Pro ($29)</th>
                <th className="py-3 px-4 text-center text-indigo-700">Investor ($69)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Business Idea & Vision Formulation', free: true, pro: true, inv: true },
                { name: 'Executive Summary Foundation', free: true, pro: true, inv: true },
                { name: 'Basic Business Model & Startup Estimate', free: true, pro: true, inv: true },
                { name: 'Basic Marketing Overview', free: true, pro: true, inv: true },
                { name: 'Complete 34-Section Strategic Blueprint', free: false, pro: true, inv: true },
                { name: 'Detailed Startup Costs Breakdown', free: false, pro: true, inv: true },
                { name: '3-Year Financial Projections (P&L)', free: false, pro: true, inv: true },
                { name: 'Monthly Cash-Flow & Run-Rate Model', free: false, pro: true, inv: true },
                { name: 'Break-Even Analysis & Milestones', free: false, pro: true, inv: true },
                { name: '90-Day Execution Launch Plan', free: false, pro: true, inv: true },
                { name: 'Professional PDF & Print Export', free: false, pro: true, inv: true },
                { name: 'Funding Requirement Analysis', free: false, pro: false, inv: true },
                { name: 'Investor-Focused Executive Summary', free: false, pro: false, inv: true },
                { name: '10-Slide Pitch Deck Narrative Content', free: false, pro: false, inv: true },
                { name: 'Capital Tranche Use-of-Funds Plan', free: false, pro: false, inv: true },
                { name: 'Investor & Loan Readiness Checklist', free: false, pro: false, inv: true },
                { name: 'Investor-Ready Print & Exhibition Suite', free: false, pro: false, inv: true },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">{row.name}</td>
                  <td className="py-3 px-4 text-center">
                    {row.free ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center bg-emerald-50/20">
                    {row.pro ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center bg-indigo-50/20">
                    {row.inv ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPackageForCheckout && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setSelectedPackageForCheckout(null)}
          selectedPackageId={selectedPackageForCheckout}
          plan={targetPlan}
          userId={user?.uid || 'guest_user'}
          userEmail={user?.email || undefined}
          onSuccess={(entitlement) => {
            setSelectedPackageForCheckout(null);
            if (onOpenPlan && targetPlan) {
              onOpenPlan({
                ...targetPlan,
                status: 'paid',
                packageId: entitlement.packageId
              });
            }
          }}
        />
      )}
    </div>
  );
};
