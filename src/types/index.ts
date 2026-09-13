export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export const PERMANENT_SUPER_ADMIN_EMAILS = [
  'topogabolekwe@gmail.com',
  'gabolekwetopo@gmail.com'
] as const;

export function isPermanentSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return PERMANENT_SUPER_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  country: string;
  preferredCurrency: string;
  currencySymbol?: string;
  createdAt: string;
  tier: SubscriptionTier;
  role?: UserRole;
  isActive?: boolean;
  status?: 'active' | 'deactivated' | 'suspended';
  photoURL?: string;
  businessPlansCount?: number;
  referralCode?: string;
  referredBy?: string;
  referralClicksCount?: number;
  referralSignupsCount?: number;
  referralConversionsCount?: number;
  lastLoginAt?: string;
  updatedAt?: string;
}

export interface BusinessPlanInput {
  businessName: string;
  businessIdea: string;
  country: string;
  cityRegion: string;
  currency: string;
  startupCapital: string;
  industry: string;
  targetCustomers: string;
  employeeCount: string;
  businessGoals: string;
}

// -------------------------------------------------------------
// The 34 Business Plan Sections Models
// -------------------------------------------------------------

// 1. Executive Summary
export interface ExecutiveSummarySection {
  missionStatement: string;
  visionStatement: string;
  elevatorPitch: string;
  keysToSuccess: string[];
  coreSummary: string;
}

// 2. Business Description
export interface BusinessDescriptionSection {
  companyOverview: string;
  industryClassification: string;
  legalStructure: string;
  locationRationale: string;
  coreValues: string[];
}

// 3. Problem & Solution
export interface ProblemAndSolutionSection {
  coreProblem: string;
  marketPainPoints: string[];
  proposedSolution: string;
  uniqueValueProposition: string;
}

// 4. Products / Services
export interface ProductsServicesSection {
  offerings: {
    name: string;
    description: string;
    targetCustomerBenefit: string;
    pricingModel: string;
  }[];
  deliveryMethod: string;
  futureProductRoadmap: string;
}

// 5. Target Market
export interface TargetMarketSection {
  demographicProfile: string;
  geographicScope: string;
  psychographicTraits: string;
  marketSizeSummary: string;
}

// 6. Local Market Analysis
export interface LocalMarketAnalysisSection {
  regionalEconomicContext: string;
  localDemandDrivers: string;
  culturalAndLogisticalFactors: string;
  locationSpecificOpportunities: string;
}

// 7. Customer Personas
export interface CustomerPersonaItem {
  personaName: string;
  roleOrProfile: string;
  keyGoals: string;
  biggestPainPoint: string;
  purchasingDecisionFactors: string;
  preferredCommunicationChannel: string;
}

// 8. Competitor Analysis
export interface CompetitorAnalysisItem {
  competitorName: string;
  type: 'Direct' | 'Indirect' | 'Alternative';
  perceivedStrengths: string;
  perceivedWeaknesses: string;
  ourDifferentiation: string;
}

// 9. Competitive Advantage
export interface CompetitiveAdvantageSection {
  primaryMoat: string;
  coreDifferentiators: string[];
  sustainabilityOfAdvantage: string;
  customerRetentionMoat: string;
}

// 10. Business Model
export interface BusinessModelSection {
  monetizationModel: string;
  keyPartners: string[];
  costDrivers: string[];
  scalabilitySummary: string;
}

// 11. Pricing Strategy
export interface PricingStrategySection {
  pricingModelType: string;
  pricingTiers: {
    tierName: string;
    pricePoint: string;
    featuresOrScope: string;
  }[];
  marginStrategy: string;
  promotionalOrDiscountTerms: string;
}

// 12. Startup Cost Breakdown
export interface StartupCostBreakdownSection {
  items: {
    category: string;
    description: string;
    estimatedCost: number;
    necessity: 'Essential' | 'Recommended' | 'Optional';
  }[];
  totalEstimatedStartupCost: number;
  contingencyReserve: number;
}

// 13. Equipment & Asset Requirements
export interface EquipmentAssetRequirementsSection {
  assets: {
    itemName: string;
    purpose: string;
    estimatedCost: number;
    procurementType: 'Purchase' | 'Lease' | 'Software Subscription';
  }[];
  physicalFacilitiesRequirements: string;
}

// 14. Operating Expenses
export interface OperatingExpensesSection {
  monthlyItems: {
    expenseCategory: string;
    estimatedMonthlyCost: number;
    isFixedCost: boolean;
  }[];
  totalEstimatedMonthlyOpex: number;
  runwayNotes: string;
}

// 15. Staffing Plan
export interface StaffingPlanSection {
  roles: {
    title: string;
    headcount: number;
    keyResponsibilities: string;
    estimatedMonthlyComp: string;
  }[];
  managementStructure: string;
  hiringMilestones: string;
}

// 16. Revenue Model
export interface RevenueModelSection {
  revenueStreams: {
    streamName: string;
    expectedContribution: string;
    pricingType: string;
  }[];
  salesCycleLength: string;
  repeatPurchaseLikelihood: string;
}

// 17. Monthly Revenue Forecast
export interface MonthlyRevenueForecastSection {
  months: {
    month: string;
    projectedUnitsOrClients: number;
    projectedRevenue: number;
  }[];
  totalYear1ProjectedRevenue: number;
  underlyingAssumptions: string;
}

// 18. Monthly Expense Forecast
export interface MonthlyExpenseForecastSection {
  months: {
    month: string;
    fixedExpenses: number;
    variableExpenses: number;
    totalExpenses: number;
  }[];
  totalYear1ProjectedExpenses: number;
  spendingNotes: string;
}

// 19. Monthly Cash Flow Forecast
export interface MonthlyCashFlowForecastSection {
  months: {
    month: string;
    openingBalance: number;
    cashInflow: number;
    cashOutflow: number;
    netCashFlow: number;
    closingBalance: number;
  }[];
  minimumCashThreshold: number;
  cashBufferAssessment: string;
}

// 20. 3-Year Financial Projection
export interface ThreeYearFinancialProjectionSection {
  years: {
    year: string;
    grossRevenue: number;
    costOfGoodsOrDelivery: number;
    operatingExpenses: number;
    netProfitBeforeTax: number;
    projectedGrowthRate: string;
  }[];
  multiYearGrowthDrivers: string;
}

// 21. Break-Even Analysis
export interface BreakEvenAnalysisSection {
  estimatedMonthlyFixedCosts: number;
  averageContributionMarginPerUnit: string;
  breakEvenMonthlyUnitsOrClients: number;
  breakEvenMonthlyRevenue: number;
  estimatedMonthsToBreakEven: number;
  breakEvenSummary: string;
}

// 22. Gross Profit & Net Profit Estimates
export interface ProfitEstimatesSection {
  projectedGrossMarginPercentage: number;
  projectedYear1GrossProfit: number;
  projectedYear1NetProfit: number;
  projectedYear1NetMarginPercentage: number;
  profitabilityLevers: string[];
}

// 23. Key Business Assumptions
export interface KeyBusinessAssumptionsSection {
  marketAssumptions: string[];
  financialAssumptions: string[];
  operationalAssumptions: string[];
  disclaimer: string;
}

// 24. Risks & Mitigation
export interface RisksAndMitigationItem {
  riskCategory: string;
  riskDescription: string;
  severity: 'Low' | 'Medium' | 'High';
  mitigationStrategy: string;
  contingencyAction: string;
}

// 25. Marketing Strategy
export interface MarketingStrategySection {
  positioningAndBrandNarrative: string;
  primaryMarketingChannels: {
    channel: string;
    allocationShare: string;
    strategy: string;
  }[];
  customerRetentionApproach: string;
}

// 26. Sales Strategy
export interface SalesStrategySection {
  salesFunnelOverview: string;
  conversionTactics: string[];
  channelPartnerships: string[];
  targetClosingCycle: string;
}

// 27. Technology Requirements
export interface TechnologyRequirementsSection {
  coreSoftwareAndPlatforms: string[];
  infrastructureAndHosting: string;
  cybersecurityAndDataPrivacy: string;
  automationOpportunities: string;
}

// 28. Legal & Regulatory Considerations
export interface LegalRegulatoryConsiderationsSection {
  registrationRequirements: string;
  requiredPermitsAndLicenses: string[];
  taxAndStatutoryObligations: string;
  complianceGuidelines: string;
}

// 29. Funding Requirements
export interface FundingRequirementsSection {
  totalFundingRequired: number;
  allocationBreakdown: {
    useOfFunds: string;
    amount: number;
    percentage: number;
  }[];
  targetFundingSource: string;
  expectedInvestorReturnRationale: string;
}

// 30. 90-Day Launch Plan
export interface NinetyDayLaunchPlanSection {
  days1To30: string[];
  days31To60: string[];
  days61To90: string[];
  keyLaunchMilestone: string;
}

// 31. Year 1 Milestones
export interface Year1MilestonesSection {
  q1Milestone: string;
  q2Milestone: string;
  q3Milestone: string;
  q4Milestone: string;
  yearEndObjective: string;
}

// 32. Year 2 Growth Strategy
export interface Year2GrowthStrategySection {
  expansionGoals: string;
  productOrServiceInnovations: string;
  geographicOrDemographicExpansion: string;
  targetRevenueMilestone: string;
}

// 33. Year 3 Expansion Strategy
export interface Year3ExpansionStrategySection {
  strategicMaturityVision: string;
  scaleOrFranchisePotential: string;
  marketLeadershipGoal: string;
  targetRevenueMilestone: string;
}

// 34. AI Strategic Recommendations
export interface AiStrategicRecommendationsSection {
  highImpactOpportunities: string[];
  criticalPitfallsToAvoid: string[];
  immediateStrategicPriorities: string[];
  strategicVerdict: string;
}

// -------------------------------------------------------------
// Complete 34-Section Generated Plan Model
// -------------------------------------------------------------
export interface GeneratedPlanContent {
  // 1. Executive Summary
  executiveSummary: ExecutiveSummarySection;
  // 2. Business Description
  businessDescription: BusinessDescriptionSection;
  // 3. Problem & Solution
  problemAndSolution: ProblemAndSolutionSection;
  // 4. Products / Services
  productsServices: ProductsServicesSection;
  // 5. Target Market
  targetMarket: TargetMarketSection;
  // 6. Local Market Analysis
  localMarketAnalysis: LocalMarketAnalysisSection;
  // 7. Customer Personas
  customerPersonas: CustomerPersonaItem[];
  // 8. Competitor Analysis
  competitorAnalysis: CompetitorAnalysisItem[];
  // 9. Competitive Advantage
  competitiveAdvantage: CompetitiveAdvantageSection;
  // 10. Business Model
  businessModel: BusinessModelSection;
  // 11. Pricing Strategy
  pricingStrategy: PricingStrategySection;
  // 12. Startup Cost Breakdown
  startupCostBreakdown: StartupCostBreakdownSection;
  // 13. Equipment & Asset Requirements
  equipmentAssetRequirements: EquipmentAssetRequirementsSection;
  // 14. Operating Expenses
  operatingExpenses: OperatingExpensesSection;
  // 15. Staffing Plan
  staffingPlan: StaffingPlanSection;
  // 16. Revenue Model
  revenueModel: RevenueModelSection;
  // 17. Monthly Revenue Forecast
  monthlyRevenueForecast: MonthlyRevenueForecastSection;
  // 18. Monthly Expense Forecast
  monthlyExpenseForecast: MonthlyExpenseForecastSection;
  // 19. Monthly Cash Flow Forecast
  monthlyCashFlowForecast: MonthlyCashFlowForecastSection;
  // 20. 3-Year Financial Projection
  threeYearFinancialProjection: ThreeYearFinancialProjectionSection;
  // 21. Break-Even Analysis
  breakEvenAnalysis: BreakEvenAnalysisSection;
  // 22. Gross Profit & Net Profit Estimates
  grossProfitAndNetProfitEstimates: ProfitEstimatesSection;
  // 23. Key Business Assumptions
  keyBusinessAssumptions: KeyBusinessAssumptionsSection;
  // 24. Risks & Mitigation
  risksAndMitigation: RisksAndMitigationItem[];
  // 25. Marketing Strategy
  marketingStrategy: MarketingStrategySection;
  // 26. Sales Strategy
  salesStrategy: SalesStrategySection;
  // 27. Technology Requirements
  technologyRequirements: TechnologyRequirementsSection;
  // 28. Legal & Regulatory Considerations
  legalRegulatoryConsiderations: LegalRegulatoryConsiderationsSection;
  // 29. Funding Requirements
  fundingRequirements: FundingRequirementsSection;
  // 30. 90-Day Launch Plan
  ninetyDayLaunchPlan: NinetyDayLaunchPlanSection;
  // 31. Year 1 Milestones
  year1Milestones: Year1MilestonesSection;
  // 32. Year 2 Growth Strategy
  year2GrowthStrategy: Year2GrowthStrategySection;
  // 33. Year 3 Expansion Strategy
  year3ExpansionStrategy: Year3ExpansionStrategySection;
  // 34. AI Strategic Recommendations
  aiStrategicRecommendations: AiStrategicRecommendationsSection;

  // Optional legacy fields for backward compatibility
  marketAnalysis?: any;
  productsAndServices?: any;
  marketingAndSales?: any;
  operationalPlan?: any;
  financialPlan?: any;
  riskAnalysis?: any;
  actionPlan?: any;
}

export type BusinessPlanSectionKey =
  | 'executiveSummary'
  | 'businessDescription'
  | 'problemAndSolution'
  | 'productsServices'
  | 'targetMarket'
  | 'localMarketAnalysis'
  | 'customerPersonas'
  | 'competitorAnalysis'
  | 'competitiveAdvantage'
  | 'businessModel'
  | 'pricingStrategy'
  | 'startupCostBreakdown'
  | 'equipmentAssetRequirements'
  | 'operatingExpenses'
  | 'staffingPlan'
  | 'revenueModel'
  | 'monthlyRevenueForecast'
  | 'monthlyExpenseForecast'
  | 'monthlyCashFlowForecast'
  | 'threeYearFinancialProjection'
  | 'breakEvenAnalysis'
  | 'grossProfitAndNetProfitEstimates'
  | 'keyBusinessAssumptions'
  | 'risksAndMitigation'
  | 'marketingStrategy'
  | 'salesStrategy'
  | 'technologyRequirements'
  | 'legalRegulatoryConsiderations'
  | 'fundingRequirements'
  | 'ninetyDayLaunchPlan'
  | 'year1Milestones'
  | 'year2GrowthStrategy'
  | 'year3ExpansionStrategy'
  | 'aiStrategicRecommendations';

export type SectionCategory =
  | 'Executive & Core Strategy'
  | 'Market, Customers & Competition'
  | 'Business Model & Operations'
  | 'Financial Forecasts & Cash Flow'
  | 'Go-To-Market & Governance'
  | 'Execution Roadmap & Multi-Year Scale';

export interface SectionMeta {
  key: BusinessPlanSectionKey;
  number: number;
  title: string;
  category: SectionCategory;
  description: string;
}

export type BusinessPlanSectionMeta = SectionMeta;

export const PLAN_SECTIONS_META: SectionMeta[] = [
  { key: 'executiveSummary', number: 1, title: 'Executive Summary', category: 'Executive & Core Strategy', description: 'Mission, vision, elevator pitch and critical keys to success' },
  { key: 'businessDescription', number: 2, title: 'Business Description', category: 'Executive & Core Strategy', description: 'Company overview, values, and location rationale' },
  { key: 'problemAndSolution', number: 3, title: 'Problem & Solution', category: 'Executive & Core Strategy', description: 'Unmet market pain points and proposed venture solution' },
  { key: 'productsServices', number: 4, title: 'Products / Services', category: 'Executive & Core Strategy', description: 'Core product lineup, delivery model and future roadmap' },
  { key: 'targetMarket', number: 5, title: 'Target Market', category: 'Market, Customers & Competition', description: 'Demographic, geographic and psychographic market sizing' },
  { key: 'localMarketAnalysis', number: 6, title: 'Local Market Analysis', category: 'Market, Customers & Competition', description: 'Regional economic conditions and location-specific dynamics' },
  { key: 'customerPersonas', number: 7, title: 'Customer Personas', category: 'Market, Customers & Competition', description: 'Archetypal customer profiles, goals, and buying triggers' },
  { key: 'competitorAnalysis', number: 8, title: 'Competitor Analysis', category: 'Market, Customers & Competition', description: 'Direct and indirect market competitors and vulnerability analysis' },
  { key: 'competitiveAdvantage', number: 9, title: 'Competitive Advantage', category: 'Market, Customers & Competition', description: 'Defensible economic moats and core differentiators' },
  { key: 'businessModel', number: 10, title: 'Business Model', category: 'Business Model & Operations', description: 'Monetization architecture, key partners, and cost drivers' },
  { key: 'pricingStrategy', number: 11, title: 'Pricing Strategy', category: 'Business Model & Operations', description: 'Pricing tiers, value-based models, and margin targets' },
  { key: 'startupCostBreakdown', number: 12, title: 'Startup Cost Breakdown', category: 'Financial Forecasts & Cash Flow', description: 'Itemized initial capital expenditures and contingency reserves' },
  { key: 'equipmentAssetRequirements', number: 13, title: 'Equipment & Asset Requirements', category: 'Business Model & Operations', description: 'Essential hardware, machinery, facilities and software' },
  { key: 'operatingExpenses', number: 14, title: 'Operating Expenses', category: 'Financial Forecasts & Cash Flow', description: 'Monthly fixed and variable overhead allocations' },
  { key: 'staffingPlan', number: 15, title: 'Staffing Plan', category: 'Business Model & Operations', description: 'Headcount requirements, compensation estimates, and management' },
  { key: 'revenueModel', number: 16, title: 'Revenue Model', category: 'Business Model & Operations', description: 'Revenue streams, sales cycles, and customer lifetime value dynamics' },
  { key: 'monthlyRevenueForecast', number: 17, title: 'Monthly Revenue Forecast', category: 'Financial Forecasts & Cash Flow', description: 'Month-by-month Year 1 income projections based on unit assumptions' },
  { key: 'monthlyExpenseForecast', number: 18, title: 'Monthly Expense Forecast', category: 'Financial Forecasts & Cash Flow', description: 'Month-by-month Year 1 operating expenditures' },
  { key: 'monthlyCashFlowForecast', number: 19, title: 'Monthly Cash Flow Forecast', category: 'Financial Forecasts & Cash Flow', description: 'Monthly opening balances, inflows, outflows, and net cash positions' },
  { key: 'threeYearFinancialProjection', number: 20, title: '3-Year Financial Projection', category: 'Financial Forecasts & Cash Flow', description: 'Three-year revenue, gross margin, opex, and net profit model' },
  { key: 'breakEvenAnalysis', number: 21, title: 'Break-Even Analysis', category: 'Financial Forecasts & Cash Flow', description: 'Calculated monthly break-even unit volume and revenue target' },
  { key: 'grossProfitAndNetProfitEstimates', number: 22, title: 'Gross Profit & Net Profit Estimates', category: 'Financial Forecasts & Cash Flow', description: 'Gross and net margin percentages and profit optimization levers' },
  { key: 'keyBusinessAssumptions', number: 23, title: 'Key Business Assumptions', category: 'Financial Forecasts & Cash Flow', description: 'Operational, market, and financial baseline assumptions' },
  { key: 'risksAndMitigation', number: 24, title: 'Risks & Mitigation', category: 'Go-To-Market & Governance', description: 'Matrix of operational, financial, and market risks with mitigations' },
  { key: 'marketingStrategy', number: 25, title: 'Marketing Strategy', category: 'Go-To-Market & Governance', description: 'Brand positioning, acquisition channels, and retention playbooks' },
  { key: 'salesStrategy', number: 26, title: 'Sales Strategy', category: 'Go-To-Market & Governance', description: 'Direct and inbound sales processes, conversion tactics, and cycles' },
  { key: 'technologyRequirements', number: 27, title: 'Technology Requirements', category: 'Go-To-Market & Governance', description: 'Core software stack, hosting, security, and automation tools' },
  { key: 'legalRegulatoryConsiderations', number: 28, title: 'Legal & Regulatory Considerations', category: 'Go-To-Market & Governance', description: 'Jurisdiction-specific registrations, compliance permits, and tax notes' },
  { key: 'fundingRequirements', number: 29, title: 'Funding Requirements', category: 'Financial Forecasts & Cash Flow', description: 'Capital required, investor use of funds, and ROI rationale' },
  { key: 'ninetyDayLaunchPlan', number: 30, title: '90-Day Launch Plan', category: 'Execution Roadmap & Multi-Year Scale', description: 'Action-by-action 30-60-90 day tactical execution roadmap' },
  { key: 'year1Milestones', number: 31, title: 'Year 1 Milestones', category: 'Execution Roadmap & Multi-Year Scale', description: 'Quarterly OKRs and end-of-year milestone targets' },
  { key: 'year2GrowthStrategy', number: 32, title: 'Year 2 Growth Strategy', category: 'Execution Roadmap & Multi-Year Scale', description: 'Market expansion, new product lines, and scaling targets' },
  { key: 'year3ExpansionStrategy', number: 33, title: 'Year 3 Expansion Strategy', category: 'Execution Roadmap & Multi-Year Scale', description: 'Long-term leadership, strategic partnerships, and franchise/scale model' },
  { key: 'aiStrategicRecommendations', number: 34, title: 'AI Strategic Recommendations', category: 'Execution Roadmap & Multi-Year Scale', description: 'Synthesized high-impact strategic advisory and priority actions' },
];

export const AI_DISCLAIMER_TEXT =
  'AI-Generated Strategic & Financial Estimates: Projections, market sizing, cash flow forecasts, and cost models in this document are simulated estimates generated for planning purposes based on user inputs and regional economic indicators. They are not audited financial statements or guaranteed outcomes. Independent verification with certified legal, tax, and financial advisors in your jurisdiction is recommended before committing capital.';

export interface AIMarketingKit {
  facebookPost: string;
  linkedInPost: string;
  whatsAppStatus: string;
  instagramCaption: string;
  shortAnnouncement: string;
  promotionalHeadline: string;
  businessDescription: string;
  marketingIdeas: string[];
  attributionTag: string;
}

export type BusinessPlanStatus = 
  | 'draft' 
  | 'free_preview' 
  | 'payment_pending' 
  | 'paid' 
  | 'archived'
  | 'cancelled' 
  | 'refunded' 
  | 'generated' 
  | 'finalized';

export type PlanStatus = BusinessPlanStatus;

export interface BusinessPlan {
  id: string;
  userId: string;
  input: BusinessPlanInput;
  generatedPlan: GeneratedPlanContent;
  status: BusinessPlanStatus;
  createdAt: string;
  updatedAt: string;
  shareSlug?: string;
  isPublic?: boolean;
  marketingKit?: AIMarketingKit;
  viewsCount?: number;
  sharesCount?: number;
  entitlementId?: string;
  packageId?: PlanPackageId;
}

export interface CuratedBusinessIdea {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  industry: string;
  country: string | string[];
  region: 'Global' | 'Africa' | 'North America' | 'Europe' | 'Asia' | 'Latin America' | 'Oceania';
  startupCapitalMin: number;
  startupCapitalMax: number;
  estimatedCapitalRange: string;
  difficulty: 'Low' | 'Moderate' | 'High';
  complexity?: 'Low' | 'Moderate' | 'High'; // Backward compatibility
  workEnvironment: 'Online' | 'Offline' | 'Hybrid';
  locationType: 'Home-based' | 'Physical Location' | 'Flexible';
  teamStructure: 'Solo-Friendly' | 'Small Team (2-5)' | 'Larger Team (5+)';
  teamSetup?: string; // Backward compatibility alias
  suggestedTeam?: string; // Backward compatibility
  scalability: 'Local / Community' | 'Regional Growth' | 'High / Global Scale' | string;
  businessOverview: string;
  fullDescription?: string; // Backward compatibility
  whyItWorks: string[];
  targetCustomers: string[];
  targetAudience?: string; // Backward compatibility
  startupRequirements: string[];
  revenueModel: string;
  potentialBusinessModel?: string; // Backward compatibility
  revenueStreams: string[];
  mainOperatingCosts: string[];
  skillsRequired: string[];
  equipmentRequired: string[];
  potentialChallenges: string[];
  growthOpportunities: string[];
  defaultGoals?: string;
  globalDemand?: string;
  financialAssumptions: {
    breakEvenMonths: string;
    estimatedMonthlyRevenue: string;
    projectedGrossMargin: string;
    initialCapitalRequired: string;
    unitEconomicsSummary: string;
  };
  popularBadge?: string;
  trendingRank?: number;
  featuredInCountry?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface AIIdeaGeneratorInput {
  country: string;
  availableCapital: string | number;
  currency: string;
  skillsInterests: string;
  preferredIndustry: string;
  onlineOffline: 'Any' | 'Online' | 'Offline' | 'Hybrid';
  businessSize: 'Solo' | 'Small Team' | 'Scalable Startup';
}

export interface AIGeneratedIdea {
  rank: number;
  title: string;
  tagline: string;
  fitScore: number;
  matchRationale: string;
  industry: string;
  category: string;
  estimatedCapitalLocal: string;
  estimatedCapitalUSD: string;
  difficulty: 'Low' | 'Moderate' | 'High';
  workEnvironment: 'Online' | 'Offline' | 'Hybrid';
  targetCustomers: string;
  revenueModel: string;
  whyItWorksInCountry: string;
  firstSteps: string[];
  prefillData: {
    businessName: string;
    businessIdea: string;
    industry: string;
    startupCapital: string;
    targetCustomers: string;
    businessGoals: string;
    country: string;
    currency: string;
  };
}

export interface CountryProfile {
  code: string;
  name: string;
  slug: string;
  flag: string;
  flagEmoji?: string;
  currency: string;
  currencySymbol: string;
  region: string;
  economicOverview: string;
  topIndustries: string[];
  startupAdvantages: string[];
  keyRegulations: string[];
  popularStartupHubs: string[];
}

export interface ReferralRecord {
  referralCode: string;
  userId: string;
  userName?: string;
  createdAt: string;
  clicksCount: number;
  signupsCount: number;
  conversionsCount: number;
  recentEvents?: {
    type: 'click' | 'signup' | 'conversion';
    timestamp: string;
    details?: string;
  }[];
}

export type AnalyticsEventType =
  | 'landing_page_view'
  | 'business_plan_start'
  | 'plan_completed'
  | 'public_page_view'
  | 'share_click'
  | 'referral_click'
  | 'registration'
  | 'free_to_paid_conversion'
  | 'idea_view'
  | 'idea_search'
  | 'idea_filter_used'
  | 'business_plan_cta_click';

export interface AnalyticsEvent {
  id?: string;
  eventType: AnalyticsEventType;
  timestamp: string;
  path?: string;
  metadata?: Record<string, any>;
  userId?: string | null;
  referralCode?: string | null;
}

// ----------------------------------------------------
// Monetization, Entitlements & Order Management Types
// ----------------------------------------------------

export type PlanPackageId = 'free' | 'pro' | 'investor';

export interface ProductPackage {
  id: PlanPackageId;
  name: string;
  tagline: string;
  description: string;
  priceUSD: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  unlockedHighlights: string[];
  ctaLabel: string;
}

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'completed'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface OrderRecord {
  orderId: string;
  userId: string;
  planId: string;
  productPackage: PlanPackageId;
  amount: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentProvider: string;
  providerOrderId?: string;
  providerTransactionId?: string;
  customerEmail?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  paymentProvider: string;
  transactionId: string;
  status: 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
}

export interface PlanEntitlementFeatures {
  canViewFull34Sections: boolean;
  canExportPDF: boolean;
  canExportInvestorPDF: boolean;
  hasFundingAndInvestorPack: boolean;
  hasFinancialForecasts: boolean;
  hasMarketingStrategy: boolean;
  hasLaunchAndGrowthPlan: boolean;
  unlockedSections: BusinessPlanSectionKey[];
}

export interface PlanEntitlement {
  id: string;
  userId: string;
  planId: string;
  packageId: PlanPackageId;
  status: 'active' | 'revoked' | 'refunded';
  grantedAt: string;
  orderId?: string;
  verificationToken?: string;
  features: PlanEntitlementFeatures;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodEnd?: string;
  createdAt: string;
}

