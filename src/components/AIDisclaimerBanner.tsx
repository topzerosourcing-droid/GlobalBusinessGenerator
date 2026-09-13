import React from 'react';
import { AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { AI_DISCLAIMER_TEXT } from '../types';

interface AIDisclaimerBannerProps {
  compact?: boolean;
  className?: string;
}

export const AIDisclaimerBanner: React.FC<AIDisclaimerBannerProps> = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ${className}`}>
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <span>AI-Generated Estimates & Projections</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 shadow-2xs ${className}`}>
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
              Transparency & Regulatory Notice
            </span>
            <span className="rounded bg-amber-200/60 px-1.5 py-0.2 text-[10px] font-bold text-amber-900">
              AI Strategic Simulation
            </span>
          </div>
          <p className="leading-relaxed text-amber-900/90 text-xs">
            {AI_DISCLAIMER_TEXT}
          </p>
        </div>
      </div>
    </div>
  );
};
