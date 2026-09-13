import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Globe, 
  Coins, 
  Calendar, 
  ArrowRight, 
  Trash2, 
  Sparkles,
  ExternalLink,
  Lock,
  CheckCircle2,
  Clock,
  Archive,
  Award
} from 'lucide-react';
import { BusinessPlan, PlanStatus } from '../types';

interface MyPlansListProps {
  plans: BusinessPlan[];
  onSelectPlan: (plan: BusinessPlan) => void;
  onCreateNew: () => void;
  onDeletePlan: (planId: string) => void;
}

export const MyPlansList: React.FC<MyPlansListProps> = ({
  plans,
  onSelectPlan,
  onCreateNew,
  onDeletePlan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const renderStatusBadge = (plan: BusinessPlan) => {
    const status: PlanStatus = plan.status || 'free_preview';
    const pkg = plan.packageId;

    if (status === 'paid') {
      if (pkg === 'investor') {
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            <Award className="w-3 h-3 text-indigo-600" />
            <span>Investor Package</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Pro (34 Sections)</span>
        </span>
      );
    }

    if (status === 'payment_pending') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Payment Pending</span>
        </span>
      );
    }

    if (status === 'archived') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
          <Archive className="w-3 h-3" />
          <span>Archived</span>
        </span>
      );
    }

    if (status === 'draft') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
          <span>Draft</span>
        </span>
      );
    }

    // Default: free_preview
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <Lock className="w-3 h-3 text-amber-600" />
        <span>Free Preview (6/34)</span>
      </span>
    );
  };

  const filteredPlans = plans.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.input.businessName.toLowerCase().includes(term) ||
      p.input.industry.toLowerCase().includes(term) ||
      p.input.country.toLowerCase().includes(term) ||
      p.input.cityRegion.toLowerCase().includes(term)
    );
  });

  return (
    <div className="mx-auto max-w-6xl">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Business Plans</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Securely synchronized with your Firestore account. Access, export, and review your strategic roadmaps.
          </p>
        </div>

        <button
          id="btn-create-new-plan-from-list"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-indigo-700 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Business Plan</span>
        </button>
      </div>

      {/* Search Filter */}
      {plans.length > 0 && (
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            id="input-search-plans"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, industry, or country..."
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white shadow-2xs"
          />
        </div>
      )}

      {/* Empty State */}
      {plans.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No business plans created yet</h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Turn your venture idea into an investor-ready document. Our AI will structure market forecasts, operations, and capital allocation in minutes.
          </p>
          <button
            id="btn-empty-create-plan"
            onClick={onCreateNew}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Sparkles className="h-4 w-4 text-indigo-300" />
            <span>Create Your First Business Plan</span>
          </button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No business plans match "{searchTerm}". Try a different search term.
        </div>
      ) : (
        /* Plans Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-indigo-400 hover:shadow-md transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {renderStatusBadge(plan)}
                  <span className="text-[11px] text-slate-400">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {plan.input.businessName}
                </h3>

                <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {plan.input.businessIdea}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span>{plan.input.cityRegion}, {plan.input.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="font-medium text-slate-700">
                      Capital: {plan.input.startupCapital} {plan.input.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  id={`btn-delete-plan-card-${plan.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete plan "${plan.input.businessName}"?`)) {
                      onDeletePlan(plan.id);
                    }
                  }}
                  title="Delete plan"
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  id={`btn-view-plan-${plan.id}`}
                  onClick={() => onSelectPlan(plan)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-600 transition"
                >
                  <span>Open Plan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
