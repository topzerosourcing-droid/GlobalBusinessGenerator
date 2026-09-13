import React from 'react';
import { 
  Lock, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  Briefcase 
} from 'lucide-react';
import { BusinessPlanSectionKey, PlanPackageId } from '../types';
import { getSectionUpgradePrompt } from '../services/entitlementService';

interface LockedSectionCardProps {
  sectionKey: BusinessPlanSectionKey;
  sectionNumber: number;
  sectionTitle: string;
  onUpgradeClick: (preferredPackage: PlanPackageId) => void;
}

export const LockedSectionCard: React.FC<LockedSectionCardProps> = ({
  sectionKey,
  sectionNumber,
  sectionTitle,
  onUpgradeClick
}) => {
  const prompt = getSectionUpgradePrompt(sectionKey);
  const isInvestorPrompt = prompt.recommendedPackage === 'investor';

  return (
    <div 
      id={`locked-sec-${sectionKey}`}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
    >
      {/* Background blurred mockup to provide an authentic preview teaser without leaking raw data */}
      <div className="absolute inset-0 p-6 opacity-25 filter blur-[3px] select-none pointer-events-none space-y-3 bg-slate-50/50">
        <div className="h-5 w-1/3 bg-slate-400 rounded"></div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-300 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-300 rounded"></div>
          <div className="h-3 w-4/6 bg-slate-300 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="h-14 bg-slate-200 rounded-lg"></div>
          <div className="h-14 bg-slate-200 rounded-lg"></div>
          <div className="h-14 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* Foreground Lock Overlay & Value Proposition */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 bg-gradient-to-b from-white/90 via-white/95 to-white/98 backdrop-blur-xs">
        <div className="space-y-2 text-center sm:text-left max-w-xl">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="font-extrabold text-xs text-slate-400">
              SECTION {String(sectionNumber).padStart(2, '0')}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
              isInvestorPrompt 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              <Lock className="h-3 w-3" />
              <span>{prompt.badge}</span>
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {sectionTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {prompt.reason}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Commercial Grade Modeling</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Instant Unlock</span>
            </span>
          </div>
        </div>

        {/* Upgrade Call To Action Button */}
        <div className="shrink-0 w-full sm:w-auto text-center sm:text-right">
          <button
            id={`btn-unlock-${sectionKey}`}
            onClick={() => onUpgradeClick(prompt.recommendedPackage)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all ${
              isInvestorPrompt
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
            }`}
          >
            <span>{prompt.cta}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            {isInvestorPrompt ? '$69 USD one-time' : '$29 USD one-time'} • Lifetime access
          </p>
        </div>
      </div>
    </div>
  );
};
