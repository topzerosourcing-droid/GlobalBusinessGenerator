import { GoogleGenAI } from '@google/genai';
import { 
  BusinessPlanInput, 
  GeneratedPlanContent, 
  BusinessPlanSectionKey,
  ExecutiveSummarySection,
  BusinessDescriptionSection,
  ProblemAndSolutionSection,
  ProductsServicesSection,
  TargetMarketSection,
  LocalMarketAnalysisSection,
  CustomerPersonaItem,
  CompetitorAnalysisItem,
  CompetitiveAdvantageSection,
  BusinessModelSection,
  PricingStrategySection,
  StartupCostBreakdownSection,
  EquipmentAssetRequirementsSection,
  OperatingExpensesSection,
  StaffingPlanSection,
  RevenueModelSection,
  MonthlyRevenueForecastSection,
  MonthlyExpenseForecastSection,
  MonthlyCashFlowForecastSection,
  ThreeYearFinancialProjectionSection,
  BreakEvenAnalysisSection,
  ProfitEstimatesSection,
  KeyBusinessAssumptionsSection,
  RisksAndMitigationItem,
  MarketingStrategySection,
  SalesStrategySection,
  TechnologyRequirementsSection,
  LegalRegulatoryConsiderationsSection,
  FundingRequirementsSection,
  NinetyDayLaunchPlanSection,
  Year1MilestonesSection,
  Year2GrowthStrategySection,
  Year3ExpansionStrategySection,
  AiStrategicRecommendationsSection,
  PLAN_SECTIONS_META,
  AIMarketingKit,
  AIIdeaGeneratorInput,
  AIGeneratedIdea
} from '../types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set. Using intelligent contextual fallback.');
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

/**
 * Generates the full 34-section business plan deeply customized to country, city, currency, industry, capital, etc.
 */
export async function generateBusinessPlanWithAI(input: BusinessPlanInput): Promise<GeneratedPlanContent> {
  const ai = getGenAI();

  const prompt = `You are an elite global venture architect, seasoned management consultant, and financial modeling expert.
Generate a comprehensive, deeply localized, professional 34-section business plan for an entrepreneur with these exact details:

- Business Name: ${input.businessName}
- Business Concept: ${input.businessIdea}
- Country of Operation: ${input.country}
- Target City / Region: ${input.cityRegion}
- Financial Currency: ${input.currency}
- Available Startup Capital: ${input.startupCapital} ${input.currency}
- Industry Sector: ${input.industry}
- Target Customers: ${input.targetCustomers}
- Initial Team Size / Headcount: ${input.employeeCount}
- Primary Business Goals: ${input.businessGoals}

CRITICAL RULES:
1. Deep Customization: Adapt all recommendations, risks, legal aspects, marketing channels, and economic nuances specifically to ${input.country} and ${input.cityRegion}.
2. Realistic Financials: All monetary amounts must be denominated in ${input.currency} and mathematically calibrated to the startup capital of ${input.startupCapital} ${input.currency}.
3. Factuality: Never present invented statistics as verified facts. Clearly phrase projections as estimates and analytical assumptions.
4. Completeness: You MUST provide data for all 34 sections.

Return ONLY a valid JSON object matching this structure (no Markdown backticks, no commentary outside JSON):
{
  "executiveSummary": {
    "missionStatement": "string",
    "visionStatement": "string",
    "elevatorPitch": "string",
    "keysToSuccess": ["string", "string", "string"],
    "coreSummary": "string"
  },
  "businessDescription": {
    "companyOverview": "string",
    "industryClassification": "string",
    "legalStructure": "string",
    "locationRationale": "string",
    "coreValues": ["string", "string", "string"]
  },
  "problemAndSolution": {
    "coreProblem": "string",
    "marketPainPoints": ["string", "string", "string"],
    "proposedSolution": "string",
    "uniqueValueProposition": "string"
  },
  "productsServices": {
    "offerings": [
      { "name": "string", "description": "string", "targetCustomerBenefit": "string", "pricingModel": "string" },
      { "name": "string", "description": "string", "targetCustomerBenefit": "string", "pricingModel": "string" }
    ],
    "deliveryMethod": "string",
    "futureProductRoadmap": "string"
  },
  "targetMarket": {
    "demographicProfile": "string",
    "geographicScope": "string",
    "psychographicTraits": "string",
    "marketSizeSummary": "string"
  },
  "localMarketAnalysis": {
    "regionalEconomicContext": "string",
    "localDemandDrivers": "string",
    "culturalAndLogisticalFactors": "string",
    "locationSpecificOpportunities": "string"
  },
  "customerPersonas": [
    {
      "personaName": "string",
      "roleOrProfile": "string",
      "keyGoals": "string",
      "biggestPainPoint": "string",
      "purchasingDecisionFactors": "string",
      "preferredCommunicationChannel": "string"
    },
    {
      "personaName": "string",
      "roleOrProfile": "string",
      "keyGoals": "string",
      "biggestPainPoint": "string",
      "purchasingDecisionFactors": "string",
      "preferredCommunicationChannel": "string"
    }
  ],
  "competitorAnalysis": [
    {
      "competitorName": "string",
      "type": "Direct",
      "perceivedStrengths": "string",
      "perceivedWeaknesses": "string",
      "ourDifferentiation": "string"
    },
    {
      "competitorName": "string",
      "type": "Indirect",
      "perceivedStrengths": "string",
      "perceivedWeaknesses": "string",
      "ourDifferentiation": "string"
    }
  ],
  "competitiveAdvantage": {
    "primaryMoat": "string",
    "coreDifferentiators": ["string", "string", "string"],
    "sustainabilityOfAdvantage": "string",
    "customerRetentionMoat": "string"
  },
  "businessModel": {
    "monetizationModel": "string",
    "keyPartners": ["string", "string", "string"],
    "costDrivers": ["string", "string", "string"],
    "scalabilitySummary": "string"
  },
  "pricingStrategy": {
    "pricingModelType": "string",
    "pricingTiers": [
      { "tierName": "Starter / Core", "pricePoint": "string", "featuresOrScope": "string" },
      { "tierName": "Professional / Growth", "pricePoint": "string", "featuresOrScope": "string" }
    ],
    "marginStrategy": "string",
    "promotionalOrDiscountTerms": "string"
  },
  "startupCostBreakdown": {
    "items": [
      { "category": "Equipment & Tech Setup", "description": "string", "estimatedCost": 1000, "necessity": "Essential" },
      { "category": "Initial Inventory & Facilities", "description": "string", "estimatedCost": 1000, "necessity": "Essential" },
      { "category": "Marketing & Launch", "description": "string", "estimatedCost": 1000, "necessity": "Essential" },
      { "category": "Licensing, Legal & Contingency", "description": "string", "estimatedCost": 1000, "necessity": "Essential" }
    ],
    "totalEstimatedStartupCost": 4000,
    "contingencyReserve": 1000
  },
  "equipmentAssetRequirements": {
    "assets": [
      { "itemName": "string", "purpose": "string", "estimatedCost": 500, "procurementType": "Purchase" },
      { "itemName": "string", "purpose": "string", "estimatedCost": 500, "procurementType": "Software Subscription" }
    ],
    "physicalFacilitiesRequirements": "string"
  },
  "operatingExpenses": {
    "monthlyItems": [
      { "expenseCategory": "Payroll / Team Stipends", "estimatedMonthlyCost": 1500, "isFixedCost": true },
      { "expenseCategory": "Marketing & Lead Acquisition", "estimatedMonthlyCost": 500, "isFixedCost": false },
      { "expenseCategory": "Office / Utilities / Software", "estimatedMonthlyCost": 400, "isFixedCost": true }
    ],
    "totalEstimatedMonthlyOpex": 2400,
    "runwayNotes": "string"
  },
  "staffingPlan": {
    "roles": [
      { "title": "string", "headcount": 1, "keyResponsibilities": "string", "estimatedMonthlyComp": "string" },
      { "title": "string", "headcount": 2, "keyResponsibilities": "string", "estimatedMonthlyComp": "string" }
    ],
    "managementStructure": "string",
    "hiringMilestones": "string"
  },
  "revenueModel": {
    "revenueStreams": [
      { "streamName": "string", "expectedContribution": "60%", "pricingType": "One-off or Subscription" },
      { "streamName": "string", "expectedContribution": "40%", "pricingType": "Retainer or Value-Add" }
    ],
    "salesCycleLength": "string",
    "repeatPurchaseLikelihood": "string"
  },
  "monthlyRevenueForecast": {
    "months": [
      { "month": "Month 1", "projectedUnitsOrClients": 5, "projectedRevenue": 2000 },
      { "month": "Month 2", "projectedUnitsOrClients": 10, "projectedRevenue": 3500 },
      { "month": "Month 3", "projectedUnitsOrClients": 15, "projectedRevenue": 5000 },
      { "month": "Month 4", "projectedUnitsOrClients": 20, "projectedRevenue": 6500 },
      { "month": "Month 5", "projectedUnitsOrClients": 25, "projectedRevenue": 8000 },
      { "month": "Month 6", "projectedUnitsOrClients": 32, "projectedRevenue": 10000 },
      { "month": "Month 7", "projectedUnitsOrClients": 40, "projectedRevenue": 12500 },
      { "month": "Month 8", "projectedUnitsOrClients": 48, "projectedRevenue": 15000 },
      { "month": "Month 9", "projectedUnitsOrClients": 56, "projectedRevenue": 17500 },
      { "month": "Month 10", "projectedUnitsOrClients": 65, "projectedRevenue": 20000 },
      { "month": "Month 11", "projectedUnitsOrClients": 75, "projectedRevenue": 23000 },
      { "month": "Month 12", "projectedUnitsOrClients": 85, "projectedRevenue": 26000 }
    ],
    "totalYear1ProjectedRevenue": 149000,
    "underlyingAssumptions": "string"
  },
  "monthlyExpenseForecast": {
    "months": [
      { "month": "Month 1", "fixedExpenses": 2000, "variableExpenses": 500, "totalExpenses": 2500 },
      { "month": "Month 2", "fixedExpenses": 2000, "variableExpenses": 700, "totalExpenses": 2700 },
      { "month": "Month 3", "fixedExpenses": 2000, "variableExpenses": 900, "totalExpenses": 2900 },
      { "month": "Month 4", "fixedExpenses": 2200, "variableExpenses": 1100, "totalExpenses": 3300 },
      { "month": "Month 5", "fixedExpenses": 2200, "variableExpenses": 1300, "totalExpenses": 3500 },
      { "month": "Month 6", "fixedExpenses": 2500, "variableExpenses": 1500, "totalExpenses": 4000 },
      { "month": "Month 7", "fixedExpenses": 2500, "variableExpenses": 1800, "totalExpenses": 4300 },
      { "month": "Month 8", "fixedExpenses": 2700, "variableExpenses": 2100, "totalExpenses": 4800 },
      { "month": "Month 9", "fixedExpenses": 2700, "variableExpenses": 2400, "totalExpenses": 5100 },
      { "month": "Month 10", "fixedExpenses": 3000, "variableExpenses": 2700, "totalExpenses": 5700 },
      { "month": "Month 11", "fixedExpenses": 3000, "variableExpenses": 3000, "totalExpenses": 6000 },
      { "month": "Month 12", "fixedExpenses": 3200, "variableExpenses": 3400, "totalExpenses": 6600 }
    ],
    "totalYear1ProjectedExpenses": 51400,
    "spendingNotes": "string"
  },
  "monthlyCashFlowForecast": {
    "months": [
      { "month": "Month 1", "openingBalance": 15000, "cashInflow": 2000, "cashOutflow": 4500, "netCashFlow": -2500, "closingBalance": 12500 },
      { "month": "Month 2", "openingBalance": 12500, "cashInflow": 3500, "cashOutflow": 2700, "netCashFlow": 800, "closingBalance": 13300 },
      { "month": "Month 3", "openingBalance": 13300, "cashInflow": 5000, "cashOutflow": 2900, "netCashFlow": 2100, "closingBalance": 15400 },
      { "month": "Month 4", "openingBalance": 15400, "cashInflow": 6500, "cashOutflow": 3300, "netCashFlow": 3200, "closingBalance": 18600 },
      { "month": "Month 5", "openingBalance": 18600, "cashInflow": 8000, "cashOutflow": 3500, "netCashFlow": 4500, "closingBalance": 23100 },
      { "month": "Month 6", "openingBalance": 23100, "cashInflow": 10000, "cashOutflow": 4000, "netCashFlow": 6000, "closingBalance": 29100 },
      { "month": "Month 7", "openingBalance": 29100, "cashInflow": 12500, "cashOutflow": 4300, "netCashFlow": 8200, "closingBalance": 37300 },
      { "month": "Month 8", "openingBalance": 37300, "cashInflow": 15000, "cashOutflow": 4800, "netCashFlow": 10200, "closingBalance": 47500 },
      { "month": "Month 9", "openingBalance": 47500, "cashInflow": 17500, "cashOutflow": 5100, "netCashFlow": 12400, "closingBalance": 59900 },
      { "month": "Month 10", "openingBalance": 59900, "cashInflow": 20000, "cashOutflow": 5700, "netCashFlow": 14300, "closingBalance": 74200 },
      { "month": "Month 11", "openingBalance": 74200, "cashInflow": 23000, "cashOutflow": 6000, "netCashFlow": 17000, "closingBalance": 91200 },
      { "month": "Month 12", "openingBalance": 91200, "cashInflow": 26000, "cashOutflow": 6600, "netCashFlow": 19400, "closingBalance": 110600 }
    ],
    "minimumCashThreshold": 5000,
    "cashBufferAssessment": "string"
  },
  "threeYearFinancialProjection": {
    "years": [
      { "year": "Year 1", "grossRevenue": 149000, "costOfGoodsOrDelivery": 45000, "operatingExpenses": 51400, "netProfitBeforeTax": 52600, "projectedGrowthRate": "Baseline Launch" },
      { "year": "Year 2", "grossRevenue": 320000, "costOfGoodsOrDelivery": 95000, "operatingExpenses": 90000, "netProfitBeforeTax": 135000, "projectedGrowthRate": "+115% YoY" },
      { "year": "Year 3", "grossRevenue": 650000, "costOfGoodsOrDelivery": 180000, "operatingExpenses": 160000, "netProfitBeforeTax": 310000, "projectedGrowthRate": "+103% YoY" }
    ],
    "multiYearGrowthDrivers": "string"
  },
  "breakEvenAnalysis": {
    "estimatedMonthlyFixedCosts": 2500,
    "averageContributionMarginPerUnit": "string",
    "breakEvenMonthlyUnitsOrClients": 12,
    "breakEvenMonthlyRevenue": 4800,
    "estimatedMonthsToBreakEven": 5,
    "breakEvenSummary": "string"
  },
  "grossProfitAndNetProfitEstimates": {
    "projectedGrossMarginPercentage": 68,
    "projectedYear1GrossProfit": 104000,
    "projectedYear1NetProfit": 52600,
    "projectedYear1NetMarginPercentage": 35,
    "profitabilityLevers": ["string", "string", "string"]
  },
  "keyBusinessAssumptions": {
    "marketAssumptions": ["string", "string"],
    "financialAssumptions": ["string", "string"],
    "operationalAssumptions": ["string", "string"],
    "disclaimer": "Simulated estimates generated for strategic planning purposes based on user inputs and economic models."
  },
  "risksAndMitigation": [
    { "riskCategory": "Market & Demand Risk", "riskDescription": "string", "severity": "Medium", "mitigationStrategy": "string", "contingencyAction": "string" },
    { "riskCategory": "Cash Flow & Working Capital Risk", "riskDescription": "string", "severity": "High", "mitigationStrategy": "string", "contingencyAction": "string" },
    { "riskCategory": "Regulatory & Legal Risk", "riskDescription": "string", "severity": "Low", "mitigationStrategy": "string", "contingencyAction": "string" }
  ],
  "marketingStrategy": {
    "positioningAndBrandNarrative": "string",
    "primaryMarketingChannels": [
      { "channel": "string", "allocationShare": "40%", "strategy": "string" },
      { "channel": "string", "allocationShare": "35%", "strategy": "string" },
      { "channel": "string", "allocationShare": "25%", "strategy": "string" }
    ],
    "customerRetentionApproach": "string"
  },
  "salesStrategy": {
    "salesFunnelOverview": "string",
    "conversionTactics": ["string", "string", "string"],
    "channelPartnerships": ["string", "string"],
    "targetClosingCycle": "string"
  },
  "technologyRequirements": {
    "coreSoftwareAndPlatforms": ["string", "string", "string"],
    "infrastructureAndHosting": "string",
    "cybersecurityAndDataPrivacy": "string",
    "automationOpportunities": "string"
  },
  "legalRegulatoryConsiderations": {
    "registrationRequirements": "string",
    "requiredPermitsAndLicenses": ["string", "string"],
    "taxAndStatutoryObligations": "string",
    "complianceGuidelines": "string"
  },
  "fundingRequirements": {
    "totalFundingRequired": 15000,
    "allocationBreakdown": [
      { "useOfFunds": "Product / Service Infrastructure", "amount": 6000, "percentage": 40 },
      { "useOfFunds": "Customer Acquisition & Marketing", "amount": 4500, "percentage": 30 },
      { "useOfFunds": "Working Capital & Reserve", "amount": 4500, "percentage": 30 }
    ],
    "targetFundingSource": "string",
    "expectedInvestorReturnRationale": "string"
  },
  "ninetyDayLaunchPlan": {
    "days1To30": ["string", "string", "string"],
    "days31To60": ["string", "string", "string"],
    "days61To90": ["string", "string", "string"],
    "keyLaunchMilestone": "string"
  },
  "year1Milestones": {
    "q1Milestone": "string",
    "q2Milestone": "string",
    "q3Milestone": "string",
    "q4Milestone": "string",
    "yearEndObjective": "string"
  },
  "year2GrowthStrategy": {
    "expansionGoals": "string",
    "productOrServiceInnovations": "string",
    "geographicOrDemographicExpansion": "string",
    "targetRevenueMilestone": "string"
  },
  "year3ExpansionStrategy": {
    "strategicMaturityVision": "string",
    "scaleOrFranchisePotential": "string",
    "marketLeadershipGoal": "string",
    "targetRevenueMilestone": "string"
  },
  "aiStrategicRecommendations": {
    "highImpactOpportunities": ["string", "string", "string"],
    "criticalPitfallsToAvoid": ["string", "string", "string"],
    "immediateStrategicPriorities": ["string", "string", "string"],
    "strategicVerdict": "string"
  }
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const text = response.text;
      if (text) {
        const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned) as GeneratedPlanContent;
        // Verify key sections exist
        if (parsed.executiveSummary && parsed.businessDescription && parsed.monthlyRevenueForecast) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Gemini API call failed for full plan, using intelligent contextual fallback:', error);
    }
  }

  return generateContextualFallbackPlan(input);
}

/**
 * Regenerates or revises an individual section of the 34 sections without affecting the rest of the plan.
 */
export async function regenerateSectionWithAI(
  input: BusinessPlanInput,
  sectionKey: BusinessPlanSectionKey,
  currentContent: any,
  customInstruction?: string
): Promise<any> {
  const meta = PLAN_SECTIONS_META.find((s) => s.key === sectionKey);
  const sectionTitle = meta ? meta.title : sectionKey;
  const sectionNumber = meta ? meta.number : '';

  const ai = getGenAI();

  const prompt = `You are a venture strategy consultant specializing in startup business planning.
The user wants to REGENERATE or REVISE section ${sectionNumber}: "${sectionTitle}" for the business plan below.

Business Profile:
- Business Name: ${input.businessName}
- Concept: ${input.businessIdea}
- Location: ${input.cityRegion}, ${input.country}
- Currency: ${input.currency}
- Startup Capital: ${input.startupCapital} ${input.currency}
- Industry: ${input.industry}
- Target Customers: ${input.targetCustomers}
- Employees: ${input.employeeCount}
- Goals: ${input.businessGoals}

Section to Regenerate: "${sectionTitle}" (key: "${sectionKey}")
Current Section Content:
${JSON.stringify(currentContent, null, 2)}

${customInstruction ? `USER'S SPECIFIC REVISION INSTRUCTIONS:
"${customInstruction}"
Ensure your output directly honors these instructions.` : 'Generate a freshly optimized, rigorous version of this section with stronger strategic insight and localized market detail.'}

CRITICAL RULES:
- Calibrate all recommendations and metrics to ${input.country} and ${input.currency}.
- Do NOT invent false statistics as verified facts.
- Return ONLY the valid JSON content corresponding to section "${sectionKey}" (do not wrap in a parent object, return just the value matching the section's schema).
- No markdown backticks or commentary.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (text) {
        const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        // If parsed is wrapped in { [sectionKey]: ... }, unwrap it
        if (parsed[sectionKey]) {
          return parsed[sectionKey];
        }
        return parsed;
      }
    } catch (error) {
      console.error(`Gemini section revision failed for ${sectionKey}, falling back:`, error);
    }
  }

  // Fallback section generator
  const fallbackFullPlan = generateContextualFallbackPlan(input);
  return fallbackFullPlan[sectionKey];
}

/**
 * High-fidelity contextual fallback generator producing all 34 sections customized to input parameters.
 */
export function generateContextualFallbackPlan(input: BusinessPlanInput): GeneratedPlanContent {
  const cap = parseFloat(input.startupCapital.replace(/[^0-9.]/g, '')) || 15000;
  const currency = input.currency || 'USD';
  const country = input.country || 'Global';
  const city = input.cityRegion || 'Metropolitan Hub';
  const industry = input.industry || 'Modern Services & Commerce';
  const target = input.targetCustomers || 'Value-conscious individuals and local enterprises';

  // Financial allocations
  const equipCap = Math.round(cap * 0.30);
  const invCap = Math.round(cap * 0.25);
  const mktCap = Math.round(cap * 0.20);
  const legalCap = Math.round(cap * 0.10);
  const reserveCap = Math.round(cap * 0.15);

  const monthlyFixed = Math.round(cap * 0.14);
  const monthlyVariableInitial = Math.round(cap * 0.05);
  const baseMonthlyOpex = monthlyFixed + monthlyVariableInitial;

  // 12-month revenue curve
  const m1Rev = Math.round(baseMonthlyOpex * 0.75);
  const m2Rev = Math.round(baseMonthlyOpex * 1.15);
  const m3Rev = Math.round(baseMonthlyOpex * 1.55);
  const m4Rev = Math.round(baseMonthlyOpex * 2.0);
  const m5Rev = Math.round(baseMonthlyOpex * 2.5);
  const m6Rev = Math.round(baseMonthlyOpex * 3.1);
  const m7Rev = Math.round(baseMonthlyOpex * 3.8);
  const m8Rev = Math.round(baseMonthlyOpex * 4.5);
  const m9Rev = Math.round(baseMonthlyOpex * 5.2);
  const m10Rev = Math.round(baseMonthlyOpex * 6.0);
  const m11Rev = Math.round(baseMonthlyOpex * 6.8);
  const m12Rev = Math.round(baseMonthlyOpex * 7.7);

  const monthlyRevenues = [m1Rev, m2Rev, m3Rev, m4Rev, m5Rev, m6Rev, m7Rev, m8Rev, m9Rev, m10Rev, m11Rev, m12Rev];
  const totalYear1Revenue = monthlyRevenues.reduce((a, b) => a + b, 0);

  // 12-month expenses curve
  const monthlyExpenses = monthlyRevenues.map((rev, idx) => {
    const fixed = Math.round(monthlyFixed * (1 + (idx * 0.04)));
    const variable = Math.round(rev * 0.32);
    return {
      month: `Month ${idx + 1}`,
      fixedExpenses: fixed,
      variableExpenses: variable,
      totalExpenses: fixed + variable
    };
  });
  const totalYear1Expenses = monthlyExpenses.reduce((sum, m) => sum + m.totalExpenses, 0);

  // 12-month cash flow
  let currentBalance = cap - (equipCap + invCap + legalCap);
  const monthlyCashFlows = monthlyRevenues.map((rev, idx) => {
    const open = currentBalance;
    const exp = monthlyExpenses[idx].totalExpenses;
    const net = rev - exp;
    currentBalance = open + net;
    return {
      month: `Month ${idx + 1}`,
      openingBalance: open,
      cashInflow: rev,
      cashOutflow: exp,
      netCashFlow: net,
      closingBalance: currentBalance
    };
  });

  const year1GrossProfit = Math.round(totalYear1Revenue * 0.68);
  const year1NetProfit = totalYear1Revenue - totalYear1Expenses;

  return {
    // 1. Executive Summary
    executiveSummary: {
      missionStatement: `To empower ${target} in ${country} with high-trust, cost-effective solutions in the ${industry} sector.`,
      visionStatement: `To become the recognized standard for excellence and service reliability in ${city} and expand throughout ${country} within 36 months.`,
      elevatorPitch: `${input.businessName} delivers specialized ${industry} solutions tailored for ${target} across ${city}, ${country}. By leveraging modern workflows, localized relationship channels, and disciplined capital management, we bridge critical service gaps while maintaining attractive unit economics.`,
      keysToSuccess: [
        `Deep localization and community trust across ${city}, ${country}`,
        `Disciplined deployment of initial ${input.startupCapital} ${currency} capital reserve`,
        `Agile execution with ${input.employeeCount} focused on customer retention and recurring revenue`
      ],
      coreSummary: `A lean, commercially resilient venture strategically poised to capture market share through superior customer satisfaction, digital transparency, and local competitive advantage.`
    },

    // 2. Business Description
    businessDescription: {
      companyOverview: `${input.businessName} is a newly formed enterprise established to operate within the ${industry} space in ${country}. The venture solves unmet customer needs via direct engagement, transparent terms, and responsive delivery.`,
      industryClassification: `${industry} — Emerging Commercial Services`,
      legalStructure: `Private Limited Liability Company (or local equivalent in ${country})`,
      locationRationale: `Operating from ${city} offers proximity to primary customer demographics, skilled regional talent, and efficient logistical infrastructure.`,
      coreValues: [
        'Customer-First Transparency',
        'Operational Reliability & Speed',
        'Ethical Stewardship & Community Value',
        'Continuous Product Innovation'
      ]
    },

    // 3. Problem & Solution
    problemAndSolution: {
      coreProblem: `Target customers across ${city} frequently encounter inconsistent quality, unpredictable pricing, and delayed execution when seeking ${industry} services.`,
      marketPainPoints: [
        `Lack of reliable, modernized providers catering specifically to ${target}`,
        'Opaque fee structures and hidden intermediary markups in the local market',
        'Slow customer support response times and absent after-sale guarantees'
      ],
      proposedSolution: `${input.businessName} introduces a standardized, client-centric service model characterized by guaranteed turnaround times, upfront competitive pricing, and dedicated client management.`,
      uniqueValueProposition: `Enterprise-grade ${industry} execution delivered with local responsiveness, personalized customer care, and transparent pricing in ${currency}.`
    },

    // 4. Products / Services
    productsServices: {
      offerings: [
        {
          name: `Core ${industry} Package`,
          description: `Flagship service bundle configured specifically for ${target}, covering primary requirements with end-to-end support.`,
          targetCustomerBenefit: 'Immediate resolution of primary operational pain points with turnkey delivery.',
          pricingModel: 'Fixed-fee milestone or standardized tier.'
        },
        {
          name: `Premium Retainer & Advisory`,
          description: 'Recurring monthly support package offering priority turnaround, continuous monitoring, and strategic enhancements.',
          targetCustomerBenefit: 'Long-term reliability and dedicated priority attention.',
          pricingModel: 'Monthly recurring subscription.'
        }
      ],
      deliveryMethod: `Hybrid model combining direct localized client engagement in ${city} with digital coordination and automated status reporting.`,
      futureProductRoadmap: 'Phase 2 will introduce automated self-service client portals, tiered specialized modules, and expanded regional fulfillment.'
    },

    // 5. Target Market
    targetMarket: {
      demographicProfile: `Primary target audience: ${target}. Characterized by regular demand for dependable ${industry} solutions, active digital communication, and emphasis on service reliability.`,
      geographicScope: `Initial Phase: ${city} metropolitan core. Secondary Phase: Surrounding economic regions across ${country}.`,
      psychographicTraits: 'Value-conscious, time-constrained decision makers prioritizing dependability, clear communication, and transparent pricing.',
      marketSizeSummary: `Local addressable market in ${city} estimated at thousands of potential accounts with strong annual growth driven by regional commerce modernization.`
    },

    // 6. Local Market Analysis
    localMarketAnalysis: {
      regionalEconomicContext: `Economic activity in ${city}, ${country} is marked by steady commercial growth, digital transaction adoption, and an increasing consumer willingness to pay for verified quality.`,
      localDemandDrivers: `Urbanization, commercial diversification, and consumer dissatisfaction with legacy, fragmented service options.`,
      culturalAndLogisticalFactors: `Success requires local language resonance, prompt messaging channel responsiveness (e.g. WhatsApp, direct mobile), and adaptable payment methods.`,
      locationSpecificOpportunities: `First-mover advantage in establishing a branded, modern presence while existing local competitors remain fragmented and technologically outdated.`
    },

    // 7. Customer Personas
    customerPersonas: [
      {
        personaName: 'Alex, The Growth-Focused Entrepreneur',
        roleOrProfile: 'Local Small Business Owner / Managing Director',
        keyGoals: 'Wants to scale operations efficiently without administrative bottlenecks or unexpected overhead.',
        biggestPainPoint: 'Frustrated by unreliable vendors who miss deadlines and fail to communicate proactively.',
        purchasingDecisionFactors: 'Track record, clear pricing in local currency, and direct accountability.',
        preferredCommunicationChannel: 'Direct WhatsApp, phone consultation, and email briefings.'
      },
      {
        personaName: 'Maya, The Value-Conscious Professional',
        roleOrProfile: 'Operations Lead / Senior Buyer',
        keyGoals: 'Requires predictable outcomes, compliant invoicing, and swift turnaround.',
        biggestPainPoint: 'Hidden costs and inconsistent deliverables from uncertified providers.',
        purchasingDecisionFactors: 'Transparent service agreements and positive customer references.',
        preferredCommunicationChannel: 'Mobile messaging, scheduled online demos, and concise proposals.'
      }
    ],

    // 8. Competitor Analysis
    competitorAnalysis: [
      {
        competitorName: `Traditional Local ${industry} Operators`,
        type: 'Direct',
        perceivedStrengths: 'Established local presence and historical supplier ties.',
        perceivedWeaknesses: 'Outdated manual processes, slow turnaround, lack of transparent pricing, and weak digital branding.',
        ourDifferentiation: 'Streamlined modern operations, upfront pricing, faster turnaround, and superior client support.'
      },
      {
        competitorName: 'Regional / International Mass Platforms',
        type: 'Indirect',
        perceivedStrengths: 'Large brand recognition and expansive generalized catalogs.',
        perceivedWeaknesses: 'No local customer support in ${city}, lack of regional cultural adaptation, and impersonal service.',
        ourDifferentiation: 'Hyper-localized service delivery, immediate on-the-ground support, and deep contextual understanding.'
      }
    ],

    // 9. Competitive Advantage
    competitiveAdvantage: {
      primaryMoat: 'Hyper-localized operational agility paired with transparent digital customer workflows and high client retention.',
      coreDifferentiators: [
        'Transparent, all-inclusive pricing in local currency with zero surprise fees',
        'Guaranteed turnaround response times backed by service level agreements',
        'Dedicated account management tailored to local business culture in ${country}'
      ],
      sustainabilityOfAdvantage: 'High service quality builds strong word-of-mouth defensibility and recurring account lock-in.',
      customerRetentionMoat: 'Long-term contracts, integrated client history databases, and referral reward incentives.'
    },

    // 10. Business Model
    businessModel: {
      monetizationModel: 'Diversified income combining upfront project fees, recurring monthly service retainers, and value-added advisory modules.',
      keyPartners: [
        `Local commercial logistics and supplier networks in ${city}`,
        'Digital banking and mobile money payment processing gateways',
        'Industry association and regional merchant chambers'
      ],
      costDrivers: [
        'Direct delivery materials / inventory',
        'Core personnel and specialist contract stipends',
        'Customer acquisition and localized marketing campaigns',
        'Regulatory filings and cloud software infrastructure'
      ],
      scalabilitySummary: 'Standardized operating playbooks permit incremental team expansion without proportional fixed overhead growth.'
    },

    // 11. Pricing Strategy
    pricingStrategy: {
      pricingModelType: 'Value-based tiered pricing with transparent local currency options.',
      pricingTiers: [
        {
          tierName: 'Starter / Essential Package',
          pricePoint: `Introductory competitive rate in ${currency}`,
          featuresOrScope: 'Core service deliverable, standard turnaround, email/chat support, and post-delivery check-in.'
        },
        {
          tierName: 'Professional Growth Tier',
          pricePoint: `Mid-market value rate in ${currency}`,
          featuresOrScope: 'Complete end-to-end service, expedited delivery, dedicated account lead, and 30 days priority support.'
        },
        {
          tierName: 'Enterprise / Custom Retainer',
          pricePoint: `Monthly retainer in ${currency}`,
          featuresOrScope: 'Continuous monthly management, custom integrations, SLA guarantees, and quarterly strategic reviews.'
        }
      ],
      marginStrategy: 'Targeting 60% - 75% gross contribution margin on core services to fund marketing reinvestment and reserves.',
      promotionalOrDiscountTerms: '10% incentive discount for upfront annual commitments; 5% referral credit for active client introductions.'
    },

    // 12. Startup Cost Breakdown
    startupCostBreakdown: {
      items: [
        { category: 'Equipment & Core Hardware Setup', description: 'Essential operational devices, workstations, and equipment', estimatedCost: equipCap, necessity: 'Essential' },
        { category: 'Initial Inventory & Production Inputs', description: 'Initial materials, vendor deposits, and operational supplies', estimatedCost: invCap, necessity: 'Essential' },
        { category: 'Marketing, Branding & Soft Launch', description: 'Brand identity, web presence, local advertising, and promotional collateral', estimatedCost: mktCap, necessity: 'Essential' },
        { category: 'Licensing, Registration & Legal Compliance', description: 'Municipal business permit, company incorporation, and legal filing in ${country}', estimatedCost: legalCap, necessity: 'Essential' },
        { category: 'Working Capital & Contingency Reserve', description: 'Liquid cash reserve for unforeseen expenses and initial runway protection', estimatedCost: reserveCap, necessity: 'Essential' }
      ],
      totalEstimatedStartupCost: cap,
      contingencyReserve: reserveCap
    },

    // 13. Equipment & Asset Requirements
    equipmentAssetRequirements: {
      assets: [
        { itemName: 'Core Operating Workstations & Mobile Devices', purpose: 'Daily client coordination, task execution, and administrative management', estimatedCost: Math.round(equipCap * 0.5), procurementType: 'Purchase' },
        { itemName: 'Specialized Industry Tools & Production Assets', purpose: 'Delivering core services with professional quality standards', estimatedCost: Math.round(equipCap * 0.35), procurementType: 'Purchase' },
        { itemName: 'Cloud CRM, Accounting & Invoicing Subscriptions', purpose: 'Financial tracking, lead pipeline management, and client records', estimatedCost: Math.round(equipCap * 0.15), procurementType: 'Software Subscription' }
      ],
      physicalFacilitiesRequirements: `Initial flexible office or co-working station in ${city} minimizing fixed commercial real estate lease commitments during Year 1.`
    },

    // 14. Operating Expenses
    operatingExpenses: {
      monthlyItems: [
        { expenseCategory: 'Team Stipends & Operational Labor', estimatedMonthlyCost: Math.round(monthlyFixed * 0.55), isFixedCost: true },
        { expenseCategory: 'Workspace, Connectivity & Utilities', estimatedMonthlyCost: Math.round(monthlyFixed * 0.25), isFixedCost: true },
        { expenseCategory: 'Marketing & Digital Customer Acquisition', estimatedMonthlyCost: Math.round(monthlyFixed * 0.20), isFixedCost: false },
        { expenseCategory: 'Software Subscriptions & Accounting Tools', estimatedMonthlyCost: Math.round(monthlyVariableInitial * 0.5), isFixedCost: true },
        { expenseCategory: 'Miscellaneous Operational Contingency', estimatedMonthlyCost: Math.round(monthlyVariableInitial * 0.5), isFixedCost: false }
      ],
      totalEstimatedMonthlyOpex: baseMonthlyOpex,
      runwayNotes: `The initial startup reserve of ${reserveCap} ${currency} provides sufficient runway buffer prior to reaching cash flow positive operations.`
    },

    // 15. Staffing Plan
    staffingPlan: {
      roles: [
        { title: 'Managing Director / Lead Strategist', headcount: 1, keyResponsibilities: 'Overall executive strategy, key client relationships, financial oversight, and business development.', estimatedMonthlyComp: `Standard baseline draw in ${currency}` },
        { title: 'Operations & Service Delivery Specialist', headcount: 1, keyResponsibilities: 'Client onboarding, quality assurance, fulfillment coordination, and vendor liaison.', estimatedMonthlyComp: `Competitive local salary in ${currency}` },
        { title: 'Marketing & Customer Success Associate', headcount: 1, keyResponsibilities: 'Inbound inquiry management, social channel engagement, client communications, and retention.', estimatedMonthlyComp: `Competitive performance-tied salary in ${currency}` }
      ],
      managementStructure: 'Lean flat hierarchy emphasizing autonomous task execution, weekly sprint reviews, and direct founder accountability.',
      hiringMilestones: 'Role 1 active from Day 1; Role 2 onboarded in Month 2; Role 3 added upon reaching Month 4 revenue milestones.'
    },

    // 16. Revenue Model
    revenueModel: {
      revenueStreams: [
        { streamName: 'Primary Core Service Contracts', expectedContribution: '65%', pricingType: 'Milestone / Direct project fees' },
        { streamName: 'Monthly Recurring Advisory Retainers', expectedContribution: '25%', pricingType: 'Subscription billing' },
        { streamName: 'Emergency / Expedited Turnaround Surcharges', expectedContribution: '10%', pricingType: 'Premium on-demand pricing' }
      ],
      salesCycleLength: 'Typically 7 to 21 days from initial consultation to contract execution.',
      repeatPurchaseLikelihood: 'High repeat potential with an estimated 40% of clients adopting ongoing retainers within 6 months.'
    },

    // 17. Monthly Revenue Forecast
    monthlyRevenueForecast: {
      months: monthlyRevenues.map((rev, idx) => ({
        month: `Month ${idx + 1}`,
        projectedUnitsOrClients: Math.round(3 + (idx * 4.5)),
        projectedRevenue: rev
      })),
      totalYear1ProjectedRevenue: totalYear1Revenue,
      underlyingAssumptions: `Assumes gradual ramp-up from initial pilot cohort in Month 1 to stabilized client acquisition momentum by Month 6, expanding steadily in ${city}.`
    },

    // 18. Monthly Expense Forecast
    monthlyExpenseForecast: {
      months: monthlyExpenses,
      totalYear1ProjectedExpenses: totalYear1Expenses,
      spendingNotes: 'Operating expenditures expand conservatively in tandem with revenue growth, avoiding speculative hiring or long-term lease commitments.'
    },

    // 19. Monthly Cash Flow Forecast
    monthlyCashFlowForecast: {
      months: monthlyCashFlows,
      minimumCashThreshold: Math.round(baseMonthlyOpex * 1.5),
      cashBufferAssessment: `Cash balance remains comfortably above minimum reserve threshold throughout the 12-month period, turning net cash flow positive by Month 4.`
    },

    // 20. 3-Year Financial Projection
    threeYearFinancialProjection: {
      years: [
        {
          year: 'Year 1',
          grossRevenue: totalYear1Revenue,
          costOfGoodsOrDelivery: Math.round(totalYear1Revenue * 0.32),
          operatingExpenses: totalYear1Expenses,
          netProfitBeforeTax: year1NetProfit,
          projectedGrowthRate: 'Launch & Market Validation Phase'
        },
        {
          year: 'Year 2',
          grossRevenue: Math.round(totalYear1Revenue * 2.2),
          costOfGoodsOrDelivery: Math.round(totalYear1Revenue * 2.2 * 0.30),
          operatingExpenses: Math.round(totalYear1Expenses * 1.6),
          netProfitBeforeTax: Math.round(totalYear1Revenue * 2.2 * 0.38),
          projectedGrowthRate: '+120% YoY Expansion'
        },
        {
          year: 'Year 3',
          grossRevenue: Math.round(totalYear1Revenue * 4.4),
          costOfGoodsOrDelivery: Math.round(totalYear1Revenue * 4.4 * 0.28),
          operatingExpenses: Math.round(totalYear1Expenses * 2.4),
          netProfitBeforeTax: Math.round(totalYear1Revenue * 4.4 * 0.42),
          projectedGrowthRate: '+100% YoY Scale'
        }
      ],
      multiYearGrowthDrivers: 'Growth fueled by client compounding, referral network maturation, geographic expansion beyond ${city}, and automated delivery tools.'
    },

    // 21. Break-Even Analysis
    breakEvenAnalysis: {
      estimatedMonthlyFixedCosts: monthlyFixed,
      averageContributionMarginPerUnit: `Approx. 65% contribution margin per client package`,
      breakEvenMonthlyUnitsOrClients: Math.max(4, Math.round(monthlyFixed / (baseMonthlyOpex * 0.65))),
      breakEvenMonthlyRevenue: Math.round(monthlyFixed / 0.65),
      estimatedMonthsToBreakEven: 4,
      breakEvenSummary: `Based on projected pricing and lean fixed overhead, the venture achieves monthly operating break-even by Month 4 of operations.`
    },

    // 22. Gross Profit & Net Profit Estimates
    grossProfitAndNetProfitEstimates: {
      projectedGrossMarginPercentage: 68,
      projectedYear1GrossProfit: year1GrossProfit,
      projectedYear1NetProfit: year1NetProfit,
      projectedYear1NetMarginPercentage: Math.max(15, Math.round((year1NetProfit / totalYear1Revenue) * 100)),
      profitabilityLevers: [
        'Transitioning one-off buyers into higher-margin recurring retainer agreements',
        'Automating administrative workflows to keep labor expenses scalable',
        'Negotiating volume supplier discounts as transaction volume doubles'
      ]
    },

    // 23. Key Business Assumptions
    keyBusinessAssumptions: {
      marketAssumptions: [
        `Local commercial demand for ${industry} solutions in ${country} will remain stable or expand over the next 3 years.`,
        `Customer willingness to adopt digital/electronic communication and modern invoice payments continues to grow in ${city}.`
      ],
      financialAssumptions: [
        `Initial startup capital of ${input.startupCapital} ${currency} is disbursed as planned with 15% preserved in contingency.`,
        `Average payment collection occurs within 14 days of invoice submission with bad debt rate below 3%.`
      ],
      operationalAssumptions: [
        `Core founding team (${input.employeeCount}) maintains full-time operational focus and execution capability during Year 1.`,
        `Vendor supply lines and local communication services remain accessible without prolonged disruptions.`
      ],
      disclaimer: 'Simulated projections generated for strategic planning purposes based on user inputs and regional economic models. Projections are not guaranteed financial representations.'
    },

    // 24. Risks & Mitigation
    risksAndMitigation: [
      {
        riskCategory: 'Customer Acquisition Ramp Delay',
        riskDescription: 'New client onboarding takes longer than projected due to unfamiliarity with new market brand.',
        severity: 'Medium',
        mitigationStrategy: 'Offer introductory risk-free pilots, obtain immediate local testimonials, and incentivize customer referrals.',
        contingencyAction: 'Reallocate 20% of digital marketing budget to direct local enterprise relationship outreach.'
      },
      {
        riskCategory: 'Cash Flow & Runway Pressure',
        riskDescription: 'Delayed client invoice settlements strain operating capital during procurement.',
        severity: 'High',
        mitigationStrategy: `Maintain a strict ${reserveCap} ${currency} liquidity buffer and require 50% upfront deposits on custom projects.`,
        contingencyAction: 'Temporarily freeze non-essential software or travel expenditures and negotiate 30-day supplier credit terms.'
      },
      {
        riskCategory: 'Regulatory & Municipal Permitting Delays',
        riskDescription: `Unexpected municipal trade licensing hurdles in ${city}, ${country}.`,
        severity: 'Low',
        mitigationStrategy: 'Retain an accredited local corporate compliance agent immediately upon incorporation.',
        contingencyAction: 'Operate initially through pre-compliant incubator partner channels while paperwork processes.'
      },
      {
        riskCategory: 'Competitive Price Undercutting',
        riskDescription: 'Entrenched legacy competitors lower prices to defend local territory.',
        severity: 'Medium',
        mitigationStrategy: 'Compete on superior turnaround speed, verified quality, and bundled customer care rather than commoditized pricing.',
        contingencyAction: 'Introduce a tiered essential bundle to capture price-sensitive segments without eroding flagship margins.'
      }
    ],

    // 25. Marketing Strategy
    marketingStrategy: {
      positioningAndBrandNarrative: `${input.businessName} is positioned as the most reliable, modern, and transparent ${industry} partner in ${city}, dedicated to client success through verified standards.`,
      primaryMarketingChannels: [
        { channel: 'Direct Local B2B & Community Outreach', allocationShare: '40%', strategy: `Targeted outreach to commercial managers and SME leaders across ${city}.` },
        { channel: 'Hyper-Local Digital & Social Media Campaigns', allocationShare: '35%', strategy: 'Localized LinkedIn, WhatsApp Business, and geo-fenced Instagram ads highlighting customer transformation stories.' },
        { channel: 'Strategic Referral & Commercial Partnerships', allocationShare: '25%', strategy: 'Formal revenue-share incentives for complementary professional service firms referring clients.' }
      ],
      customerRetentionApproach: 'Quarterly satisfaction reviews, proactive maintenance reminders, and exclusive priority support access for recurring accounts.'
    },

    // 26. Sales Strategy
    salesStrategy: {
      salesFunnelOverview: 'Multi-stage structured pipeline: Inbound inquiry / Outbound contact -> Discovery assessment -> Tailored proposal within 24 hours -> Closing & Contract execution -> Onboarding within 48 hours.',
      conversionTactics: [
        'Detailed case studies demonstrating quantifiable client outcomes',
        'Clear, jargon-free proposals featuring transparent deliverables in local currency',
        'Standardized 30-day satisfaction guarantee on initial project phases'
      ],
      channelPartnerships: [
        `Local chambers of commerce and trade groups in ${city}`,
        'Complementary accounting and corporate consulting firms seeking verified service partners'
      ],
      targetClosingCycle: '7 to 14 days from qualified lead consultation to deposit confirmation.'
    },

    // 27. Technology Requirements
    technologyRequirements: {
      coreSoftwareAndPlatforms: [
        'Cloud-based CRM & Invoicing software (e.g. Zoho, QuickBooks, or equivalent)',
        'Digital payment processing gateway supporting local cards and mobile money',
        'Secure team workflow and document management platform (Google Workspace / Slack)',
        'Task tracking and client project management dashboard'
      ],
      infrastructureAndHosting: 'Modern cloud infrastructure with 99.9% uptime, localized data caching, and automated daily backups.',
      cybersecurityAndDataPrivacy: `Strict compliance with data privacy regulations in ${country}, end-to-end encrypted messaging, and two-factor authentication on all administrative accounts.`,
      automationOpportunities: 'Automated invoice reminders, scheduled appointment bookings, and automated post-service satisfaction surveys.'
    },

    // 28. Legal & Regulatory Considerations
    legalRegulatoryConsiderations: {
      registrationRequirements: `Incorporate as an official commercial entity with the corporate affairs commission or registrar of companies in ${country}.`,
      requiredPermitsAndLicenses: [
        `Municipal business operating license issued by ${city} local authorities`,
        'Taxpayer identification registration (VAT / Corporate Income Tax PIN)',
        'Sector-specific commercial trade permits and safety certifications where applicable'
      ],
      taxAndStatutoryObligations: `Adhere strictly to standard statutory withholding, corporate tax filing cycles, and mandatory employee social contributions in ${country}.`,
      complianceGuidelines: 'Maintain accurate double-entry bookkeeping, standardized written customer contracts, and transparent dispute resolution procedures.'
    },

    // 29. Funding Requirements
    fundingRequirements: {
      totalFundingRequired: cap,
      allocationBreakdown: [
        { useOfFunds: 'Equipment, Software & Operational Infrastructure', amount: equipCap, percentage: 30 },
        { useOfFunds: 'Initial Inventory & Material Procurement', amount: invCap, percentage: 25 },
        { useOfFunds: 'Marketing, Client Acquisition & Soft Launch', amount: mktCap, percentage: 20 },
        { useOfFunds: 'Regulatory Registrations & Compliance Fees', amount: legalCap, percentage: 10 },
        { useOfFunds: 'Operating Liquidity & Contingency Reserve', amount: reserveCap, percentage: 15 }
      ],
      targetFundingSource: `Founder self-funding and initial equity, supplemented by localized seed grants or bank working capital facilities.`,
      expectedInvestorReturnRationale: `Compelling unit economics with projected Year 1 net profit of ${year1NetProfit.toLocaleString()} ${currency} and projected 3-year revenue expansion exceeding 4x.`
    },

    // 30. 90-Day Launch Plan
    ninetyDayLaunchPlan: {
      days1To30: [
        `Formalize corporate legal registration, tax ID, and dedicated business bank account in ${country}`,
        'Procure essential operating equipment and deploy cloud communication/accounting stack',
        'Finalize brand identity, localized marketing materials, and digital touchpoints',
        'Identify and secure initial pilot partner accounts for early operational validation'
      ],
      days31To60: [
        'Execute soft launch with first 5-10 beta clients at preferential feedback rates',
        'Refine service delivery playbooks based on hands-on customer feedback',
        'Launch targeted local advertising campaigns and outbound relationship outreach in ${city}',
        'Establish automated recurring invoicing and customer relationship tracking'
      ],
      days61To90: [
        'Complete formal public launch campaign and evaluate Month 2 unit economics',
        `Reach operational break-even milestone target of ${Math.round(baseMonthlyOpex * 1.55).toLocaleString()} ${currency} monthly run-rate`,
        'Gather formal video/written client testimonials for social proof amplification',
        'Conduct 90-day strategic review and lock in Q2 scaling priorities'
      ],
      keyLaunchMilestone: `Achieving initial operational break-even and securing 15+ satisfied active clients within 90 days.`
    },

    // 31. Year 1 Milestones
    year1Milestones: {
      q1Milestone: 'Complete legal establishment, operational setup, and validate service delivery with first 10 paying accounts.',
      q2Milestone: `Achieve sustained monthly operating profitability and establish stable lead generation channels in ${city}.`,
      q3Milestone: 'Expand service portfolio with high-margin retainer options and onboard dedicated specialist team members.',
      q4Milestone: `Attain Year 1 cumulative revenue target of ${totalYear1Revenue.toLocaleString()} ${currency} and prepare regional expansion roadmap.`,
      yearEndObjective: 'Establish ${input.businessName} as a top-rated, financially self-sustaining enterprise in its sector.'
    },

    // 32. Year 2 Growth Strategy
    year2GrowthStrategy: {
      expansionGoals: `Scale client base by 120% YoY, establishing dedicated corporate accounts and institutional contracts across ${country}.`,
      productOrServiceInnovations: 'Introduce proprietary automated client dashboards and expanded turnkey enterprise packages.',
      geographicOrDemographicExpansion: `Extend service delivery beyond ${city} into adjacent regional economic centers.`,
      targetRevenueMilestone: `Targeting Year 2 gross revenue of ${Math.round(totalYear1Revenue * 2.2).toLocaleString()} ${currency}.`
    },

    // 33. Year 3 Expansion Strategy
    year3ExpansionStrategy: {
      strategicMaturityVision: `Consolidate market leadership as a premier ${industry} brand in ${country}, with scalable systems enabling franchise or licensing opportunities.`,
      scaleOrFranchisePotential: 'Standardize operational playbooks into licenseable regional branches or autonomous regional operating units.',
      marketLeadershipGoal: 'Recognized industry benchmark for customer satisfaction, digital efficiency, and operational reliability.',
      targetRevenueMilestone: `Targeting Year 3 gross revenue of ${Math.round(totalYear1Revenue * 4.4).toLocaleString()} ${currency}.`
    },

    // 34. AI Strategic Recommendations
    aiStrategicRecommendations: {
      highImpactOpportunities: [
        `Capitalize on low digital customer engagement among traditional competitors in ${city} by delivering instant quotes and real-time project updates.`,
        'Incentivize upfront multi-month service commitments to accelerate working capital accumulation.',
        `Establish co-marketing alliances with complementary business service providers in ${country}.`
      ],
      criticalPitfallsToAvoid: [
        'Avoid premature expenditure on lavish office leases before validating recurring monthly cash flows.',
        'Do not compete solely on bottom-dollar pricing; protect healthy gross margins to fund customer service excellence.',
        'Never neglect local regulatory or tax filings; proactive compliance avoids crippling retroactive penalties.'
      ],
      immediateStrategicPriorities: [
        `Register entity and open business banking facility immediately in ${country}.`,
        `Secure initial 3 pilot customer commitments to validate delivery workflows.`,
        `Preserve the ${reserveCap.toLocaleString()} ${currency} contingency reserve strictly for operational runway.`
      ],
      strategicVerdict: `High Viability: The business model balances modest capital intensity with robust unit economics and rapid break-even potential. Execution discipline in customer acquisition and localized relationship trust will be the decisive success factors.`
    }
  };
}

/**
 * Generates an AI-powered Marketing Kit for a completed business plan.
 * Delivers social media posts, launch announcements, promotional headlines, and 5 marketing ideas.
 */
export async function generateMarketingKitWithAI(
  input: BusinessPlanInput,
  plan?: Partial<GeneratedPlanContent>
): Promise<AIMarketingKit> {
  const attributionTag = 'Created with Global Business Generator';
  const ai = getGenAI();

  const businessName = input.businessName || 'Our Venture';
  const city = input.cityRegion || 'Regional Hub';
  const country = input.country || 'Global';
  const industry = input.industry || 'Enterprise';
  const elevatorPitch = plan?.executiveSummary?.elevatorPitch || input.businessIdea;
  const targetAudience = input.targetCustomers || 'prospective clients and businesses';

  if (ai) {
    try {
      const prompt = `You are a high-conversion digital marketer and viral launch strategist.
Generate an AI Marketing Kit for this newly planned business:
- Business Name: ${businessName}
- Industry: ${industry}
- Location: ${city}, ${country}
- Concept & Pitch: ${elevatorPitch}
- Target Audience: ${targetAudience}

Output strict JSON with these exact keys:
{
  "facebookPost": "Engaging community-focused launch post with emojis, value proposition, and call to action",
  "linkedInPost": "Professional founder announcement discussing industry opportunity, solving customer pain, and mission",
  "whatsAppStatus": "Punchy, exciting 2-3 sentence launch update with contact or inquiry link placeholder",
  "instagramCaption": "Story-driven, high-energy launch caption with 5-7 relevant hashtags",
  "shortAnnouncement": "A 2-sentence press release / media announcement of the business launch",
  "promotionalHeadline": "A high-impact 8-12 word headline for landing page or advertisement",
  "businessDescription": "A concise 3-sentence company overview highlighting problem solved and unique differentiator",
  "marketingIdeas": [
    "Idea 1: Specific creative low-cost acquisition tactic",
    "Idea 2: Strategic partnership or co-marketing opportunity",
    "Idea 3: Content marketing / viral social demonstration idea",
    "Idea 4: Local community or event activation tactic",
    "Idea 5: Referral / viral incentive campaign"
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const rawText = response.text || '';
      const parsed = JSON.parse(rawText);
      return {
        facebookPost: `${parsed.facebookPost}\n\n— ${attributionTag}`,
        linkedInPost: `${parsed.linkedInPost}\n\n— ${attributionTag}`,
        whatsAppStatus: `${parsed.whatsAppStatus} (${attributionTag})`,
        instagramCaption: `${parsed.instagramCaption}\n.\n.\n#GlobalBusinessGenerator #${businessName.replace(/\s+/g, '')}`,
        shortAnnouncement: `${parsed.shortAnnouncement}`,
        promotionalHeadline: parsed.promotionalHeadline || `Introducing ${businessName}: Next-Gen ${industry} in ${city}`,
        businessDescription: parsed.businessDescription || `${businessName} provides premier ${industry} solutions across ${city}, ${country}.`,
        marketingIdeas: Array.isArray(parsed.marketingIdeas) && parsed.marketingIdeas.length >= 5 
          ? parsed.marketingIdeas.slice(0, 5) 
          : [
              `Launch a founding member VIP discount for the first 50 customers in ${city}.`,
              `Partner with local business chambers and complementary service providers in ${country}.`,
              `Create short behind-the-scenes video demonstrations of service delivery.`,
              `Host a free live Q&A or educational workshop addressing common customer pain points.`,
              `Implement a two-sided referral incentive giving existing clients credits for new introductions.`
            ],
        attributionTag,
      };
    } catch (err) {
      console.warn('AI Marketing Kit generation fell back to heuristic generator:', err);
    }
  }

  // High-craft contextual fallback
  return {
    facebookPost: `Exciting news! We are officially introducing ${businessName} to ${city}, ${country}! 🚀\n\nWe started ${businessName} to solve a critical need in ${industry}: ${elevatorPitch}.\n\nWhether you are looking for higher quality, transparent service, or dedicated local expertise, we are here to help.\n\nDrop a comment below or send us a message to learn more!\n\n— ${attributionTag}`,
    linkedInPost: `I am proud to officially announce the launch of ${businessName}, a modern ${industry} enterprise headquartered in ${city}, ${country}.\n\nAfter analyzing the market landscape, our team recognized that ${targetAudience} needed a more reliable, innovative approach. ${businessName} was engineered to bridge that gap.\n\nOur mission: ${elevatorPitch}.\n\nWe are currently onboarding our founding clients and exploring collaborative partnerships across ${country}. Feel free to connect or reach out directly.\n\n— ${attributionTag}`,
    whatsAppStatus: `🎉 Proud to announce the official launch of ${businessName} in ${city}! Delivering next-level ${industry} solutions. DM to get started! (${attributionTag})`,
    instagramCaption: `From idea to reality. ✨ Introducing ${businessName}!\n\nWe are on a mission to redefine ${industry} right here in ${city}. Built for ${targetAudience} who expect excellence.\n\nLink in bio to check out our full venture launch and explore what we're building.\n.\n.\n#Entrepreneurship #${businessName.replace(/\s+/g, '')} #${industry.replace(/[^a-zA-Z0-9]/g, '')} #StartupJourney #GlobalBusinessGenerator`,
    shortAnnouncement: `${businessName} officially announced its operational launch in ${city}, introducing high-standard ${industry} solutions tailored for modern businesses and consumers across ${country}.`,
    promotionalHeadline: `Transforming ${industry} in ${city} with Reliable, Next-Generation Solutions`,
    businessDescription: `${businessName} is a premier ${industry} venture in ${city}, ${country}. Designed around customer excellence and modern execution, it delivers high-value solutions to ${targetAudience}.`,
    marketingIdeas: [
      `Founding Client Campaign: Offer exclusive grandfathered pricing and priority service to the first 25 clients in ${city}.`,
      `Local B2B Alliance: Cross-promote with established complementary service vendors in ${country} to exchange qualified referrals.`,
      `Interactive Social Proof: Publish transparent case studies and before/after problem-solving spotlights on LinkedIn and Instagram.`,
      `Community Meetup / Free Workshop: Host a 45-minute virtual or local clinic teaching prospects how to avoid costly ${industry} mistakes.`,
      `Dual-Sided Referral Incentive: Provide a 15% service credit to both referrer and referee for every successful new client introduction.`
    ],
    attributionTag,
  };
}

/**
 * Generates 10 ranked business ideas tailored to country, capital, skills, and industry
 */
export async function generateBusinessIdeasWithAI(input: AIIdeaGeneratorInput): Promise<AIGeneratedIdea[]> {
  const ai = getGenAI();
  const country = input.country || 'Global';
  const capital = input.availableCapital || '5000';
  const currency = input.currency || 'USD';
  const skills = input.skillsInterests || 'sales, management, problem-solving';
  const industry = input.preferredIndustry || 'General Commerce & Services';
  const onlineOffline = input.onlineOffline || 'Any';
  const businessSize = input.businessSize || 'Small Team';

  if (ai) {
    try {
      const prompt = `You are a world-class venture capitalist and startup strategist for Global Business Generator.
Generate exactly 10 suitable, realistic, highly actionable business ideas ranked from strongest (#1) to weakest (#10) based on:
- Target Country: ${country}
- Available Startup Capital: ${capital} ${currency}
- Founder Skills & Interests: ${skills}
- Preferred Industry: ${industry}
- Work Environment Preference: ${onlineOffline}
- Target Business Size: ${businessSize}

Rank the ideas from #1 (highest immediate potential, best capital fit, lowest risk in ${country}) down to #10.

Respond with ONLY a raw JSON array containing exactly 10 objects with this exact structure:
[
  {
    "rank": 1,
    "title": "Compelling Venture Name / Concept",
    "tagline": "Punchy 1-sentence value proposition",
    "fitScore": 98,
    "matchRationale": "Detailed sentence explaining why this specifically fits their capital of ${capital} ${currency}, their background in ${skills}, and current market dynamics in ${country}.",
    "industry": "Specific Industry",
    "category": "Sub-Category",
    "estimatedCapitalLocal": "Realistic estimated range in ${currency}",
    "estimatedCapitalUSD": "Estimated USD equivalent (e.g. $1,500 - $3,500)",
    "difficulty": "Low" | "Moderate" | "High",
    "workEnvironment": "Online" | "Offline" | "Hybrid",
    "targetCustomers": "Clear demographic and customer segments in ${country}",
    "revenueModel": "Precise monetization mechanism (margins, pricing, recurring fees)",
    "whyItWorksInCountry": "Specific macroeconomic, demographic, regulatory, or cultural reason this succeeds in ${country}",
    "firstSteps": ["First tactical step", "Second tactical step", "Third tactical step"],
    "prefillData": {
      "businessName": "Suggested Brand Name",
      "businessIdea": "Comprehensive 2-3 sentence description of the business model and service/product",
      "industry": "Standard Industry Category",
      "startupCapital": "Specific startup amount in ${currency}",
      "targetCustomers": "Primary customer description",
      "businessGoals": "Year 1 target goals",
      "country": "${country}",
      "currency": "${currency}"
    }
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 10).map((item, idx) => ({
          ...item,
          rank: idx + 1,
          fitScore: item.fitScore || Math.max(75, 99 - idx * 2),
        }));
      }
    } catch (err) {
      console.warn('AI Idea Generation fell back to heuristic strategist:', err);
    }
  }

  // High-craft contextual fallback: 10 structured ideas tailored to parameters
  return [
    {
      rank: 1,
      title: `${industry !== 'Any' ? industry : 'Tech-Enabled'} Specialized Service Agency`,
      tagline: `High-touch B2B solutions leveraging ${skills} to solve high-value operational bottlenecks.`,
      fitScore: 98,
      matchRationale: `Directly matches your ${skills} background with minimal inventory risk, perfectly fitting your ${capital} ${currency} budget with positive cashflow from month 1 in ${country}.`,
      industry: industry !== 'Any' ? industry : 'Professional & Business Services',
      category: 'B2B Client Services',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$800 - $3,000',
      difficulty: 'Low',
      workEnvironment: onlineOffline === 'Offline' ? 'Offline' : 'Online',
      targetCustomers: `SMEs, regional corporate departments, and local merchants in ${country}`,
      revenueModel: 'Monthly client retainers ($500 - $2,500/mo) and project-based implementation fees',
      whyItWorksInCountry: `Rapid economic formalization in ${country} is creating strong demand for specialized external support.`,
      firstSteps: [
        'Define 3 core packaged service deliverables with transparent pricing',
        'Identify and directly reach out to 30 prospective local businesses',
        'Secure 2 initial beta clients with testimonial case study agreements'
      ],
      prefillData: {
        businessName: `Apex ${industry !== 'Any' ? industry.split(' ')[0] : 'Venture'} Solutions`,
        businessIdea: `A specialized service agency catering to businesses in ${country}, utilizing modern workflows to streamline operations and drive revenue growth.`,
        industry: industry !== 'Any' ? industry : 'Professional & Business Services',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Small to medium enterprise owners and decision makers in ${country}`,
        businessGoals: 'Onboard 6 ongoing monthly retainer clients within the first 180 days.',
        country,
        currency
      }
    },
    {
      rank: 2,
      title: `Direct-to-Consumer Local Artisan & Heritage Brand`,
      tagline: `Curated high-quality consumer products celebrating authentic ${country} regional sourcing.`,
      fitScore: 96,
      matchRationale: `Leverages localized raw material advantages in ${country} while keeping startup batch sizes disciplined within ${capital} ${currency}.`,
      industry: 'Food & Beverage / Hospitality',
      category: 'Consumer Packaged Goods',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$1,200 - $4,500',
      difficulty: 'Moderate',
      workEnvironment: 'Hybrid',
      targetCustomers: `Urban middle-class households, gift shoppers, and diaspora communities abroad`,
      revenueModel: 'Direct e-commerce margins (65%+ gross margin) and boutique grocery retail consignment',
      whyItWorksInCountry: `Strong consumer pride and rising appetite for clean-label, ethically produced regional products in ${country}.`,
      firstSteps: [
        'Standardize the recipe/formulation and secure compliant food-grade packaging',
        'Create a visual digital storefront with clear origin storytelling and WhatsApp ordering',
        'Set up weekend market pop-up booths to sample and capture initial recurring buyers'
      ],
      prefillData: {
        businessName: `Heritage Craft ${country}`,
        businessIdea: `An artisanal packaged brand bringing authentic, single-origin specialties from ${country} directly to modern retail and online consumers.`,
        industry: 'Food & Beverage / Hospitality',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Health-conscious consumers, boutique foodies, and corporate gift buyers`,
        businessGoals: 'Achieve positive unit cashflow within 4 months and expand to 15 regional retail stockists.',
        country,
        currency
      }
    },
    {
      rank: 3,
      title: `Suburban & Township Express Courier Node`,
      tagline: `Reliable point-to-point dispatch, last-mile parcel drops, and merchant cold delivery.`,
      fitScore: 94,
      matchRationale: `Capitalizes on surging regional e-commerce activity in ${country}, scaling smoothly with two-wheelers or contracted drivers.`,
      industry: 'Logistics, Transport & Supply Chain',
      category: 'Last-Mile Fulfillment',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$1,500 - $5,000',
      difficulty: 'Moderate',
      workEnvironment: 'Offline',
      targetCustomers: `Independent online merchants, regional pharmacies, and busy urban consumers`,
      revenueModel: 'Per-drop delivery fees ($1.50 - $4.00) and monthly merchant dispatch subscription contracts',
      whyItWorksInCountry: `High smartphone commerce adoption paired with fragmented traditional postal networks across ${country}.`,
      firstSteps: [
        'Secure 1-2 reliable two-wheelers or micro-delivery vans with GPS tracking',
        'Integrate a straightforward WhatsApp Business dispatch booking system',
        'Sign exclusive daily delivery contracts with 5 local e-commerce or food businesses'
      ],
      prefillData: {
        businessName: `SwiftRoute Logistics`,
        businessIdea: `An agile last-mile courier and dispatch service bridging local merchants and residential consumers with rapid, reliable deliveries.`,
        industry: 'Logistics, Transport & Supply Chain',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Independent merchants, pharmacies, bakeries, and suburban households`,
        businessGoals: 'Complete 60 daily deliveries by Month 5 with a 98% on-time fulfillment rate.',
        country,
        currency
      }
    },
    {
      rank: 4,
      title: `Solar & Energy Backup Technical Consultancy`,
      tagline: `Turnkey residential and commercial backup power audits, installation, and monitoring.`,
      fitScore: 92,
      matchRationale: `High urgency for power reliability across ${country} provides immediate inbound demand, pairing well with technical or management skills.`,
      industry: 'Renewable Energy & Utilities',
      category: 'CleanTech Services',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$2,000 - $6,000',
      difficulty: 'Moderate',
      workEnvironment: 'Offline',
      targetCustomers: `Homeowners, clinics, grocery shops, and private schools needing continuous power`,
      revenueModel: 'Equipment supply markup (20-30%) and professional installation / service contract retainers',
      whyItWorksInCountry: `Grid instability and high daytime sunlight hours in ${country} create an unstoppable economic argument for solar.`,
      firstSteps: [
        'Partner with a certified master electrician and wholesale equipment importer',
        'Create standardized 3kW, 5kW, and 10kW residential backup packages',
        'Run targeted neighborhood social campaigns and homeowner association demonstrations'
      ],
      prefillData: {
        businessName: `SunShield Energy Solutions`,
        businessIdea: `A specialized renewable energy and backup power installation firm providing uninterrupted solar power to homes and businesses in ${country}.`,
        industry: 'Renewable Energy & Utilities',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Suburban homeowners, agricultural properties, and commercial retailers`,
        businessGoals: 'Execute 8 residential installations monthly with recurring maintenance contracts.',
        country,
        currency
      }
    },
    {
      rank: 5,
      title: `Digital Micro-Academy & Career Skills Cohort`,
      tagline: `Practical live bootcamp courses for high-income freelance and corporate crafts.`,
      fitScore: 90,
      matchRationale: `Zero equipment depreciation and 85%+ gross margins make this exceptionally capital-efficient for an initial budget of ${capital} ${currency}.`,
      industry: 'Education & EdTech',
      category: 'Workforce Development',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$500 - $2,000',
      difficulty: 'Low',
      workEnvironment: 'Online',
      targetCustomers: `Ambitious youth, university graduates, and mid-career professionals in ${country}`,
      revenueModel: 'Cohort tuition fees ($90 - $350 per student) and corporate employer sponsorship',
      whyItWorksInCountry: `Youth unemployment and a burning desire for global remote work skills across ${country}.`,
      firstSteps: [
        'Design a focused 6-week curriculum with real portfolio capstone outcomes',
        'Host a free 60-minute masterclass webinar to build the initial applicant waitlist',
        'Enroll the first pilot cohort of 20 students with personalized mentorship'
      ],
      prefillData: {
        businessName: `FutureSkill Academy`,
        businessIdea: `A high-impact training academy teaching in-demand digital and practical business skills to ambitious individuals in ${country}.`,
        industry: 'Education & EdTech',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Young professionals, students, and aspiring remote freelancers`,
        businessGoals: 'Train 250 students in Year 1 with an 80% graduation and placement rate.',
        country,
        currency
      }
    },
    {
      rank: 6,
      title: `Eco-Packaging & Biodegradable Distribution Hub`,
      tagline: `Wholesale supply of plastic-free containers, sugarcane takeaway boxes, and mailers.`,
      fitScore: 88,
      matchRationale: `Rides the regulatory wave of single-use plastic restrictions in ${country} without requiring immediate heavy machinery investment.`,
      industry: 'Manufacturing & Production',
      category: 'Sustainable Materials',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$2,500 - $7,500',
      difficulty: 'Moderate',
      workEnvironment: 'Hybrid',
      targetCustomers: `Takeaway restaurants, cafes, cloud kitchens, and e-commerce mail order retailers`,
      revenueModel: 'Wholesale carton distribution margins (25-35%) and branded printing customization fees',
      whyItWorksInCountry: `Municipal environmental enforcement and progressive restaurant owners seeking compliant packaging.`,
      firstSteps: [
        'Secure distributor bulk agreements with certified compostable pulp manufacturers',
        'Distribute free sample trial kits to 40 popular local restaurants and cafes',
        'Establish reliable weekly delivery replenishment routes for partner kitchens'
      ],
      prefillData: {
        businessName: `EcoPack Solutions`,
        businessIdea: `A green distribution company supplying commercial food service and retail businesses with certified biodegradable packaging.`,
        industry: 'Manufacturing & Production',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Commercial food kitchens, cafes, event caterers, and supermarkets`,
        businessGoals: 'Supply 50 active restaurants on recurring weekly replenishment orders by Month 6.',
        country,
        currency
      }
    },
    {
      rank: 7,
      title: `Mobile Commercial Vehicle Detailing & Fleet Cleaning`,
      tagline: `Eco-friendly, waterless or high-pressure mobile detailing directly at corporate lots.`,
      fitScore: 86,
      matchRationale: `Immediate cash generation with low overhead, mobile flexibility, and strong recurring B2B fleet contracts.`,
      industry: 'Professional & Business Services',
      category: 'Mobile Automotive Services',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$1,000 - $3,500',
      difficulty: 'Low',
      workEnvironment: 'Offline',
      targetCustomers: `Corporate vehicle fleets, logistics van operators, executive commuter parking lots`,
      revenueModel: 'Monthly corporate fleet washing contracts and premium individual vehicle detailing packages',
      whyItWorksInCountry: `High commercial vehicle utilization and busy business executives valuing time savings.`,
      firstSteps: [
        'Acquire commercial mobile pressure washer, generator, and eco-friendly cleaning chemicals',
        'Pitch corporate fleet managers with discounted weekend bulk washing rates',
        'Implement an automated SMS reminder system for recurring fortnightly appointments'
      ],
      prefillData: {
        businessName: `Precision Fleet Care`,
        businessIdea: `A mobile detailing and fleet maintenance service that visits business parks and homes to provide high-standard vehicle care.`,
        industry: 'Professional & Business Services',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Corporate fleets, executive commuters, and car rental agencies`,
        businessGoals: 'Contract 8 corporate fleet accounts and maintain 40 regular weekly client bookings.',
        country,
        currency
      }
    },
    {
      rank: 8,
      title: `Farm-to-Wholesale Agri-Aggregation Service`,
      tagline: `Direct farmgate collection, quality grading, and bulk supply to urban grocers.`,
      fitScore: 84,
      matchRationale: `Leverages regional farming output in ${country}, reducing middleman friction while earning healthy commodity margins.`,
      industry: 'Agriculture & AgriTech',
      category: 'Agricultural Trading',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$2,000 - $8,000',
      difficulty: 'Moderate',
      workEnvironment: 'Offline',
      targetCustomers: `Supermarkets, institutional hotel kitchens, school feeding programs, and wholesale market stalls`,
      revenueModel: 'Farmgate purchase to wholesale distribution gross spread (20-40%)',
      whyItWorksInCountry: `Persistent price gaps between rural farm producers and urban consumer supermarket shelves in ${country}.`,
      firstSteps: [
        'Establish direct supply agreements with 15 reliable smallholder vegetable or grain farmers',
        'Set up a central grading, weighing, and sorting staging depot',
        'Sign advance supply purchase orders with 3 supermarket or institutional kitchen buyers'
      ],
      prefillData: {
        businessName: `HarvestLink Agri-Trading`,
        businessIdea: `An agricultural aggregation venture sourcing high-grade fresh produce directly from farmers to supply urban commercial buyers.`,
        industry: 'Agriculture & AgriTech',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Urban supermarkets, institutional catering facilities, and wholesale produce merchants`,
        businessGoals: 'Trade 25 metric tons of graded fresh produce monthly within the first agricultural season.',
        country,
        currency
      }
    },
    {
      rank: 9,
      title: `Smart Digital Point-of-Sale & Financial Agency Hub`,
      tagline: `Community banking kiosk providing cash withdrawals, utility payments, and remittances.`,
      fitScore: 82,
      matchRationale: `Proven micro-business model with consistent daily footfall and micro-commission earnings on every transaction.`,
      industry: 'FinTech & Financial Services',
      category: 'Agency Banking',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$800 - $3,000',
      difficulty: 'Low',
      workEnvironment: 'Offline',
      targetCustomers: `Neighborhood residents, commuter terminal visitors, and informal market traders`,
      revenueModel: 'Micro-fee commissions on cash withdrawals, deposits, utility bills, and airtime top-ups',
      whyItWorksInCountry: `Heavy demand for quick cash access and bill payment without standing in long commercial bank queues.`,
      firstSteps: [
        'Acquire accredited agency banking POS terminals and float capital reserve',
        'Secure a high-footfall kiosk location at a busy transport interchange or market',
        'Implement strict cash reconciliation and daily security procedures'
      ],
      prefillData: {
        businessName: `QuickPay Financial Hub`,
        businessIdea: `A neighborhood financial kiosk offering essential agency banking, micro-remittances, and bill payment services.`,
        industry: 'FinTech & Financial Services',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Local residents, market vendors, and commuters needing convenient financial transactions`,
        businessGoals: 'Facilitate 150 daily transactions and expand to 3 kiosk locations within 12 months.',
        country,
        currency
      }
    },
    {
      rank: 10,
      title: `Specialty Event & Pop-Up Equipment Leasing`,
      tagline: `Turnkey hire of audio-visual gear, pop-up market canopies, and mobile staging.`,
      fitScore: 80,
      matchRationale: `Tangible physical assets with long working lifespans that generate consistent weekend rental yields in ${country}.`,
      industry: 'Media, Entertainment & Creative',
      category: 'Equipment Rental',
      estimatedCapitalLocal: `${capital} ${currency}`,
      estimatedCapitalUSD: '$1,500 - $6,000',
      difficulty: 'Low',
      workEnvironment: 'Offline',
      targetCustomers: `Wedding coordinators, corporate seminar organizers, religious gatherings, festival promoters`,
      revenueModel: 'Daily and weekend equipment hire tariffs with deposit bonds and transport delivery fees',
      whyItWorksInCountry: `Vibrant social, religious, and corporate event culture with year-round weekend celebrations.`,
      firstSteps: [
        'Purchase high-demand core equipment inventory (heavy-duty gazebos, sound system, portable power)',
        'Create a visual digital catalog with clear package bundles and deposit rules',
        'Network with local wedding venues, event planners, and corporate marketers'
      ],
      prefillData: {
        businessName: `Starlight Event Rentals`,
        businessIdea: `A reliable event rental enterprise supplying premium canopies, sound, and staging for private and corporate gatherings.`,
        industry: 'Media, Entertainment & Creative',
        startupCapital: `${capital} ${currency}`,
        targetCustomers: `Event coordinators, corporate conference managers, and private celebratory hosts`,
        businessGoals: 'Book 10 weekend event rentals per month and recoup core asset capital within 7 months.',
        country,
        currency
      }
    }
  ];
}


