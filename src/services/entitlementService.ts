import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  PlanPackageId, 
  ProductPackage, 
  PlanEntitlement, 
  BusinessPlanSectionKey,
  BusinessPlan,
  isPermanentSuperAdminEmail
} from '../types';

/**
 * Three Definitive Product Packages as defined by specifications:
 * 1. FREE
 * 2. PRO BUSINESS PLAN
 * 3. INVESTOR / FUNDING PACKAGE
 */
export const PRODUCT_PACKAGES: Record<PlanPackageId, ProductPackage> = {
  free: {
    id: 'free',
    name: 'Free Plan',
    tagline: 'Basic overview & feasibility validation',
    description: 'Perfect for exploring your business idea and reviewing core market premises.',
    priceUSD: 0,
    ctaLabel: 'Start for Free',
    features: [
      'Business idea validation',
      'Executive summary preview',
      'Basic business model structure',
      'Basic startup capital estimate',
      'Basic marketing overview',
      'Limited preview of financial projections (Key metrics teaser)',
      'Single-view online plan viewer',
      'Standard community sharing link'
    ],
    unlockedHighlights: [
      'Executive Summary',
      'Business Description',
      'Problem & Solution',
      'Products & Services',
      'Business Model',
      'Basic Startup Estimate'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro Business Plan',
    tagline: 'Complete 34-section bank & operations blueprint',
    description: 'The standard choice for entrepreneurs seeking commercial loans, leases, or launching operations.',
    priceUSD: 29,
    badge: 'Most Popular',
    popular: true,
    ctaLabel: 'Unlock Full Business Plan',
    features: [
      'Complete 34-section business plan',
      'Detailed startup costs breakdown',
      '3-year financial projections',
      'Monthly revenue and expense forecasts',
      'Cash-flow forecast model',
      'Break-even analysis & sensitivity table',
      'Strategic pricing strategy',
      'In-depth competitor analysis matrix',
      'Comprehensive marketing strategy & channels',
      'Actionable 90-day launch plan',
      'Year 1–3 growth and expansion strategy',
      'Professional PDF export with print formatting',
      'AI Section Editor & custom regeneration',
      'AI Marketing Kit generation'
    ],
    unlockedHighlights: [
      'All 34 Comprehensive Plan Sections',
      'Full 3-Year Financial Model & Forecasts',
      'Monthly Revenue, Expense & Cash Flow',
      'Competitive Intelligence & Pricing Strategy',
      '90-Day Execution Roadmap',
      'Professional PDF Export'
    ]
  },
  investor: {
    id: 'investor',
    name: 'Investor / Funding Package',
    tagline: 'Venture, Angel & Grant-Ready Investment Suite',
    description: 'Tailored for founders pitching angel syndicates, venture capitalists, banks, and government funding grants.',
    priceUSD: 69,
    badge: 'Best Value for Capital Raising',
    ctaLabel: 'Get Investor / Funding Package',
    features: [
      'Everything in Pro Business Plan included',
      'Funding requirement analysis & tranche timeline',
      'Investor-focused executive summary & value thesis',
      'Investor pitch deck slide-by-slide outline',
      'Detailed financial model with unit economics & valuation leeways',
      'Funding use-of-funds allocation plan',
      'Investor / Loan readiness checklist & audit report',
      'Professional investor-ready PDF with financial tables & exhibits',
      'Executive summary one-pager export',
      'Cap table guidance & return-on-equity projections',
      'Priority AI generation & strategic recommendations'
    ],
    unlockedHighlights: [
      'Everything in Pro Plan',
      'Funding Requirements & Capital Tranches',
      'Investor Pitch Content & Deck Narrative',
      'Detailed Use-of-Funds Allocation Plan',
      'Investor/Loan Readiness Audit Checklist',
      'Premium Investor-Grade PDF Export'
    ]
  }
};

/**
 * Sections that are visible in the FREE package.
 * All other sections among the 34 require Pro or Investor entitlement.
 */
export const FREE_ACCESSIBLE_SECTIONS: BusinessPlanSectionKey[] = [
  'executiveSummary',
  'businessDescription',
  'problemAndSolution',
  'productsServices',
  'businessModel',
  'startupCostBreakdown', // Basic summary
  'marketingStrategy',    // Basic overview
  'grossProfitAndNetProfitEstimates' // Limited preview teaser
];

/**
 * Sections that receive special investor-focused enrichment
 */
export const INVESTOR_SPECIAL_SECTIONS: BusinessPlanSectionKey[] = [
  'fundingRequirements',
  'executiveSummary',
  'threeYearFinancialProjection',
  'breakEvenAnalysis',
  'grossProfitAndNetProfitEstimates',
  'keyBusinessAssumptions',
  'risksAndMitigation',
  'aiStrategicRecommendations'
];

/**
 * Default Entitlement structure for a Free plan
 */
export function createFreeEntitlement(planId: string, userId: string = 'guest'): PlanEntitlement {
  return {
    id: `ent_free_${planId}`,
    userId,
    planId,
    packageId: 'free',
    status: 'active',
    grantedAt: new Date().toISOString(),
    features: {
      canViewFull34Sections: false,
      canExportPDF: false,
      canExportInvestorPDF: false,
      hasFundingAndInvestorPack: false,
      hasFinancialForecasts: false,
      hasMarketingStrategy: false,
      hasLaunchAndGrowthPlan: false,
      unlockedSections: [...FREE_ACCESSIBLE_SECTIONS]
    }
  };
}

/**
 * Create Entitlement structure for Pro plan
 */
export function createProEntitlement(planId: string, userId: string, orderId?: string, token?: string): PlanEntitlement {
  return {
    id: `ent_pro_${planId}`,
    userId,
    planId,
    packageId: 'pro',
    status: 'active',
    grantedAt: new Date().toISOString(),
    orderId,
    verificationToken: token,
    features: {
      canViewFull34Sections: true,
      canExportPDF: true,
      canExportInvestorPDF: false,
      hasFundingAndInvestorPack: false,
      hasFinancialForecasts: true,
      hasMarketingStrategy: true,
      hasLaunchAndGrowthPlan: true,
      unlockedSections: [] // All unlocked
    }
  };
}

/**
 * Create Entitlement structure for Investor plan
 */
export function createInvestorEntitlement(planId: string, userId: string, orderId?: string, token?: string): PlanEntitlement {
  return {
    id: `ent_inv_${planId}`,
    userId,
    planId,
    packageId: 'investor',
    status: 'active',
    grantedAt: new Date().toISOString(),
    orderId,
    verificationToken: token,
    features: {
      canViewFull34Sections: true,
      canExportPDF: true,
      canExportInvestorPDF: true,
      hasFundingAndInvestorPack: true,
      hasFinancialForecasts: true,
      hasMarketingStrategy: true,
      hasLaunchAndGrowthPlan: true,
      unlockedSections: [] // All unlocked
    }
  };
}

export function createSuperAdminEntitlement(planId: string, userId: string = 'super_admin'): PlanEntitlement {
  return {
    id: `ent_superadmin_${planId}`,
    userId,
    planId,
    packageId: 'investor',
    status: 'active',
    grantedAt: new Date().toISOString(),
    verificationToken: 'SUPER_ADMIN_UNRESTRICTED_BYPASS_TOKEN',
    features: {
      canViewFull34Sections: true,
      canExportPDF: true,
      canExportInvestorPDF: true,
      hasFundingAndInvestorPack: true,
      hasFinancialForecasts: true,
      hasMarketingStrategy: true,
      hasLaunchAndGrowthPlan: true,
      unlockedSections: [] // All unlocked
    }
  };
}

/**
 * Resolve the effective entitlement for a plan.
 * Checks Firestore entitlements collection first. If none exists, or if offline,
 * falls back to free entitlement unless plan has status === 'paid' with verified packageId.
 * Permanently gives SUPER_ADMIN unrestricted investor entitlement.
 */
export async function getPlanEntitlement(
  planId: string, 
  userId?: string, 
  planSnapshot?: BusinessPlan | null,
  userEmail?: string | null,
  isSuperAdmin?: boolean
): Promise<PlanEntitlement> {
  // Super Admin unrestricted bypass
  if (isSuperAdmin || isPermanentSuperAdminEmail(userEmail)) {
    return createSuperAdminEntitlement(planId, userId || 'super_admin');
  }

  // If plan explicitly marked paid with entitlement attached
  if (planSnapshot && planSnapshot.status === 'paid' && planSnapshot.packageId) {
    if (planSnapshot.packageId === 'investor') {
      return createInvestorEntitlement(planId, userId || planSnapshot.userId, planSnapshot.entitlementId);
    }
    return createProEntitlement(planId, userId || planSnapshot.userId, planSnapshot.entitlementId);
  }

  // Check local entitlement storage cache
  try {
    const cached = localStorage.getItem(`gbg_entitlement_${planId}`);
    if (cached) {
      const parsed = JSON.parse(cached) as PlanEntitlement;
      if (parsed && parsed.status === 'active' && parsed.planId === planId) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore storage issues
  }

  // Query Firestore entitlements
  if (userId) {
    try {
      const entRef = collection(db, 'entitlements');
      const q = query(
        entRef,
        where('planId', '==', planId),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data() as PlanEntitlement;
        // Cache locally for offline fast reads
        localStorage.setItem(`gbg_entitlement_${planId}`, JSON.stringify(docData));
        return docData;
      }
    } catch (err) {
      console.debug('[Entitlements] Firestore read deferred:', err);
    }
  }

  // Default to Free Entitlement
  const freeEnt = createFreeEntitlement(planId, userId || 'guest');
  return freeEnt;
}

/**
 * Check if a specific 34-section key is unlocked for a given entitlement.
 * Always returns true for Super Admin.
 */
export function isSectionUnlocked(
  sectionKey: BusinessPlanSectionKey, 
  entitlement: PlanEntitlement | null | undefined,
  isSuperAdmin?: boolean
): boolean {
  if (isSuperAdmin) return true;
  if (!entitlement) return FREE_ACCESSIBLE_SECTIONS.includes(sectionKey);
  if (entitlement.packageId === 'pro' || entitlement.packageId === 'investor') {
    return true;
  }
  return FREE_ACCESSIBLE_SECTIONS.includes(sectionKey);
}

/**
 * Determine the upgrade prompt type for a locked section
 */
export function getSectionUpgradePrompt(sectionKey: BusinessPlanSectionKey): {
  badge: string;
  title: string;
  cta: string;
  recommendedPackage: PlanPackageId;
  reason: string;
} {
  const financialSections: BusinessPlanSectionKey[] = [
    'monthlyRevenueForecast',
    'monthlyExpenseForecast',
    'monthlyCashFlowForecast',
    'threeYearFinancialProjection',
    'breakEvenAnalysis',
    'grossProfitAndNetProfitEstimates',
    'pricingStrategy'
  ];

  const fundingSections: BusinessPlanSectionKey[] = [
    'fundingRequirements'
  ];

  if (fundingSections.includes(sectionKey)) {
    return {
      badge: 'INVESTOR PACKAGE REQUIRED',
      title: 'Funding Requirement Analysis & Investor Readiness',
      cta: 'Create Investor-Ready Plan',
      recommendedPackage: 'investor',
      reason: 'Unlock professional capital tranches, equity-dilution projections, and investor-ready use-of-funds models.'
    };
  }

  if (financialSections.includes(sectionKey)) {
    return {
      badge: 'PRO PLAN FEATURE',
      title: 'Detailed Financial Model & Cash Flow Forecast',
      cta: 'Unlock Financial Projections',
      recommendedPackage: 'pro',
      reason: 'Unlock dynamic 3-year cash flow forecasts, break-even timelines, and monthly revenue drivers.'
    };
  }

  return {
    badge: 'PRO PLAN FEATURE',
    title: 'Complete 34-Section Strategic Execution Blueprint',
    cta: 'Unlock Full Business Plan',
    recommendedPackage: 'pro',
    reason: 'Unlock exhaustive market intelligence, staffing schedules, and 90-day launch roadmap.'
  };
}
