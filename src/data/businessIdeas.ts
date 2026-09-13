import { CuratedBusinessIdea, CountryProfile } from '../types';

export const POPULAR_SEARCH_TAGS = [
  '⚡ Solar & Clean Energy',
  '🤖 AI Automation Agency',
  '🌱 Farm Cold-Chain',
  '🚚 Last-Mile Delivery',
  '📱 Micro-SaaS for SMBs',
  '🧁 Artisanal Food Brand',
  '🇧🇼 Botswana Opportunities',
  '🇿🇦 South Africa Ventures',
  '💰 Under $1,000 Ideas',
  '🏠 Home-Based Businesses',
];

export const TRENDING_SEARCH_TAGS = [
  'Solar Borehole Pumping',
  'Township Dark Stores',
  'AI Bookkeeping Studio',
  'Cassava Starch Processing',
  'EV Charger Installation',
  'Direct-to-Consumer Tea Export',
  'Quick-Commerce Hub',
  'Senior Care Transition',
];

export const CAPITAL_TIER_OPTIONS = [
  { id: '500', label: '$500', rangeLabel: 'Under $500', minUSD: 0, maxUSD: 500, description: 'Micro-budget, digital freelancing, home craft, zero-inventory services' },
  { id: '1000', label: '$1,000', rangeLabel: 'Under $1,000', minUSD: 0, maxUSD: 1000, description: 'Service agency, local cleaning, content studio, artisan food starter' },
  { id: '5000', label: '$5,000', rangeLabel: '$1,000 - $5,000', minUSD: 1000, maxUSD: 5000, description: 'E-commerce brand, training academy, commercial mobile detailing' },
  { id: '10000', label: '$10,000', rangeLabel: '$5,000 - $15,000', minUSD: 5000, maxUSD: 15000, description: 'B2B recycling, micro-SaaS, catering, equipment leasing' },
  { id: '25000', label: '$25,000', rangeLabel: '$15,000 - $35,000', minUSD: 15000, maxUSD: 35000, description: 'Solar microgrids, cold-chain transport, specialty retail storefront' },
  { id: '50000', label: '$50,000+', rangeLabel: '$35,000 - $100,000+', minUSD: 35000, maxUSD: 500000, description: 'Eco-packaging manufacturing, diagnostic clinics, fleet logistics' },
];

export const COUNTRY_PROFILES: CountryProfile[] = [
  {
    code: 'BW',
    name: 'Botswana',
    slug: 'botswana',
    flag: '🇧🇼',
    currency: 'BWP',
    currencySymbol: 'P',
    region: 'Southern Africa',
    economicOverview: 'Stable middle-income economy with growing non-mining diversification, high solar irradiance (over 3,200 hours/year), rapid digitization, and government incentives through CEDA and LEA.',
    topIndustries: ['Renewable Energy & Solar', 'Agriculture & Cattle Cold-Chain', 'Eco-Tourism & Hospitality', 'Digital Services & FinTech', 'Specialty Manufacturing'],
    startupAdvantages: [
      'Substantial solar energy potential in rural and agricultural regions',
      'Strong financial sector and stable Pula currency with minimal exchange controls',
      'Preferential market access via SADC and AfCFTA free trade areas',
      'Government procurement preferences for citizen-owned enterprises'
    ],
    keyRegulations: ['Companies and Intellectual Property Authority (CIPA) online registration', 'Botswana Unified Revenue Service (BURS) VAT compliance', 'LEA (Local Enterprise Authority) certification'],
    popularStartupHubs: ['Gaborone', 'Francistown', 'Maun', 'Kasane', 'Palapye']
  },
  {
    code: 'ZA',
    name: 'South Africa',
    slug: 'south-africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    currencySymbol: 'R',
    region: 'Southern Africa',
    economicOverview: 'Most industrialized economy in Africa with massive consumer markets, high demand for energy resilience solutions, thriving e-commerce logistics, and agro-processing exports.',
    topIndustries: ['Renewable Energy & Battery Storage', 'Township Economy & Last-Mile Logistics', 'FinTech & Digital Payments', 'Agri-Processing & Wine/Fruit Export', 'Cybersecurity & Surveillance'],
    startupAdvantages: [
      'High urgency for alternative power solutions (solar, inverters, backup storage)',
      'Vibrant township and peri-urban retail markets eager for localized digital solutions',
      'Advanced banking infrastructure and venture capital ecosystem',
      'Export opportunities across Africa and Europe'
    ],
    keyRegulations: ['CIPC company registration', 'SARS tax registration & UIF', 'B-BBEE compliance for corporate contracts'],
    popularStartupHubs: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Stellenbosch']
  },
  {
    code: 'US',
    name: 'United States',
    slug: 'united-states',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    region: 'North America',
    economicOverview: 'Largest consumer economy globally with high purchasing power, massive demand for AI-driven automation, personalized home/wellness services, and B2B software solutions.',
    topIndustries: ['AI & Automation Services', 'B2B Micro-SaaS', 'Specialized Home & Senior Services', 'Health & Wellness Services', 'CleanTech & Electrification'],
    startupAdvantages: [
      'Vast addressable market with high consumer willing-to-pay',
      'Streamlined digital LLC formation and multi-state expansion capabilities',
      'Abundant access to debt, equity, and credit facilities',
      'Rapid adoption of tech tools and remote service models'
    ],
    keyRegulations: ['State Secretary of State LLC/Corp filings', 'IRS Employer Identification Number (EIN)', 'City/County commercial operating licenses'],
    popularStartupHubs: ['Austin', 'San Francisco', 'New York', 'Miami', 'Atlanta', 'Denver']
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    slug: 'united-kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    region: 'Europe',
    economicOverview: 'Global financial hub with robust consumer demand for sustainable goods, green tech installation, fractional advisory services, and digital innovation under net-zero targets.',
    topIndustries: ['Clean Energy & EV Infrastructure', 'FinTech & Fractional Advisory', 'Sustainable Retail & Refill Services', 'Specialty Food & Heritage Export', 'HealthTech & Wellness'],
    startupAdvantages: [
      'Fast 24-hour online company formation via Companies House',
      'Government incentives for green technology and R&D tax credits',
      'High density of urban consumers committed to eco-friendly living',
      'Strong international business and export brand reputation'
    ],
    keyRegulations: ['Companies House incorporation', 'HMRC Corporation Tax and VAT', 'ICO GDPR registration for data controllers'],
    popularStartupHubs: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol']
  },
  {
    code: 'KE',
    name: 'Kenya',
    slug: 'kenya',
    flag: '🇰🇪',
    currency: 'KES',
    currencySymbol: 'KSh',
    region: 'East Africa',
    economicOverview: 'Known as the "Silicon Savannah", Kenya is East Africa’s economic and tech engine with ubiquitous mobile money adoption (M-Pesa), thriving horticulture exports, and green energy innovations.',
    topIndustries: ['Mobile Money & Agri-FinTech', 'Horticulture Cold Chain & Export', 'Clean Cooking & Off-Grid Solar', 'Digital Freelance Hubs', 'Eco-Packaging Materials'],
    startupAdvantages: [
      'Global pioneer in mobile money integration allowing friction-free micro-payments',
      'Strong agricultural export demand (avocados, tea, fresh vegetables, flowers)',
      'Highly educated, English-speaking young digital workforce',
      'Regional headquarters gateway for the East African Community (EAC)'
    ],
    keyRegulations: ['Business Registration Service (BRS) via eCitizen', 'KRA PIN and iTax compliance', 'County government single business permit'],
    popularStartupHubs: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']
  },
  {
    code: 'NG',
    name: 'Nigeria',
    slug: 'nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    currencySymbol: '₦',
    region: 'West Africa',
    economicOverview: 'Africa’s largest population and economic powerhouse with unparalleled entrepreneurial momentum, high commercial hustle, massive consumer food processing demand, and thriving creative industries.',
    topIndustries: ['Agro-Processing (Cassava, Rice, Oil)', 'Solar Mini-Grids & Commercial Backup', 'FinTech & Agency Banking POS', 'Last-Mile Dispatch Logistics', 'B2B Recycling & Manufacturing'],
    startupAdvantages: [
      'Over 220 million citizens creating insatiable domestic demand for staples and power',
      'Unstoppable entrepreneurial culture and rapid digital payment adoption',
      'Vast agricultural raw material supplies ready for localized value addition',
      'Growing international appetite for Nigerian creative and packaged food goods'
    ],
    keyRegulations: ['Corporate Affairs Commission (CAC) registration', 'Federal Inland Revenue Service (FIRS) TIN', 'NAFDAC certification for food/cosmetic processing'],
    popularStartupHubs: ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Kano']
  },
  {
    code: 'IN',
    name: 'India',
    slug: 'india',
    flag: '🇮🇳',
    currency: 'INR',
    currencySymbol: '₹',
    region: 'Asia',
    economicOverview: 'Fastest-growing major economy with unmatched digital public infrastructure (UPI, ONDC), rapidly expanding tier-2/3 consumer markets, and massive renewable energy mandates.',
    topIndustries: ['Quick-Commerce & Hyperlocal Retail', 'Value-Added Agri-Foods & Millets', 'Rooftop Solar EPC Contracting', 'Remote Tech & Knowledge Process Outsourcing', 'STEM & EdTech Services'],
    startupAdvantages: [
      'Unified Payments Interface (UPI) facilitating instantaneous, zero-fee digital transactions',
      'Tier-2 and tier-3 cities unlocking hundreds of millions of new aspirational consumers',
      'Government Startup India benefits, tax exemptions, and simplified regulatory filings',
      'Abundant engineering, operational, and creative talent at competitive cost'
    ],
    keyRegulations: ['Ministry of Corporate Affairs (MCA) SPICe+ registration', 'GST registration and compliance', 'Udyam MSME certificate for government schemes'],
    popularStartupHubs: ['Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad', 'Pune', 'Jaipur']
  }
];

export function getCountryProfile(slugOrNameOrCode: string): CountryProfile {
  const query = slugOrNameOrCode.toLowerCase().trim();
  const found = COUNTRY_PROFILES.find(
    (c) =>
      c.slug.toLowerCase() === query ||
      c.name.toLowerCase() === query ||
      c.code.toLowerCase() === query
  );

  if (found) return found;

  // Dynamic profile generator for ANY country requested
  const formattedName = slugOrNameOrCode
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    code: slugOrNameOrCode.slice(0, 2).toUpperCase(),
    name: formattedName,
    slug: slugOrNameOrCode.toLowerCase().replace(/\s+/g, '-'),
    flag: '🌍',
    currency: 'USD',
    currencySymbol: '$',
    region: 'International Market',
    economicOverview: `Emerging entrepreneurial ecosystem in ${formattedName} offering fertile opportunities across localized services, digital platforms, renewable power, and consumer goods.`,
    topIndustries: ['Digital Services & E-Commerce', 'Renewable Energy & Utilities', 'Agriculture & Food Processing', 'Logistics & Trade', 'Healthcare & Education'],
    startupAdvantages: [
      `Growing domestic demand for localized consumer and business solutions in ${formattedName}`,
      'Increasing digital connectivity and mobile internet penetration',
      'Abundant opportunities for import substitution and local production',
      'Direct integration with Global Business Generator strategic planning models'
    ],
    keyRegulations: ['Standard local commercial registry registration', 'National tax revenue compliance', 'Municipal operational licensing'],
    popularStartupHubs: [`${formattedName} Commercial Capital`, 'Major Regional Urban Centers']
  };
}

export const CURATED_BUSINESS_IDEAS: CuratedBusinessIdea[] = [
  {
    id: 'idea-1',
    slug: 'solar-microgrid-rural-energy-hub',
    title: 'Solar Microgrid & Rural Clean Energy Hub',
    tagline: 'Decentralized clean solar energy solutions for commercial and residential hubs.',
    category: 'CleanTech & Energy',
    industry: 'Renewable Energy & Utilities',
    country: ['Global', 'Botswana', 'South Africa', 'Kenya', 'Nigeria'],
    region: 'Africa',
    startupCapitalMin: 10000,
    startupCapitalMax: 35000,
    estimatedCapitalRange: '$10,000 - $35,000',
    difficulty: 'Moderate',
    complexity: 'Moderate',
    workEnvironment: 'Offline',
    locationType: 'Physical Location',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '2 - 5 members',
    scalability: 'High / Global Scale',
    businessOverview: 'Establish modular solar charging microgrids and battery storage hubs in peri-urban, rural, or agricultural zones facing grid instability. Supplies daily power subscriptions, phone/device charging kiosks, and cold-storage power leasing to local shops, farmers, and residential clusters.',
    fullDescription: 'Establish decentralized solar charging and power hubs with battery storage. Provides affordable subscription power and equipment leasing to local enterprises and households.',
    whyItWorks: [
      'Persistent national grid load shedding and off-grid coverage gaps leave millions of merchants without dependable electricity.',
      'Lithium-iron-phosphate (LiFePO4) battery and solar module costs have fallen significantly, unlocking viable unit economics.',
      'Small business owners willingly pay a predictable daily or weekly utility fee rather than burning expensive, dirty diesel.',
      'Qualifies for green venture capital subsidies and multilateral climate resilience grants.'
    ],
    targetCustomers: [
      'Rural & peri-urban shop owners, butcheries, hair salons, and bar lounges',
      'Off-grid commercial farmers needing irrigation pumping power',
      'Residential households seeking clean, noiseless home lighting and refrigeration'
    ],
    targetAudience: 'Off-grid communities, agricultural operations, and suburban micro-businesses',
    startupRequirements: [
      'Secure long-term site lease agreements or village council land permits',
      'Procure certified Tier-1 photovoltaic panels, inverters, and modular battery racks',
      'Register with local energy regulatory boards and municipal electrical authorities',
      'Install smart metering hardware and mobile money payment gateways (e.g. M-Pesa, Pula Pay, POS)'
    ],
    revenueModel: 'Tiered monthly power subscription tariffs, pay-per-use battery swapping fees, and appliance leasing margins.',
    potentialBusinessModel: 'Recurring monthly micro-utility subscriptions, hardware leasing fees, and battery-swapping station pay-per-use.',
    revenueStreams: [
      'Commercial shop subscription power ($25 - $75/month per merchant)',
      'Household lighting & device charging passes ($5 - $12/month)',
      'Solar water pumping daily tariffs for crop irrigation ($2 - $6/day)',
      'Battery pack swapping service for delivery e-bikes and fishermen'
    ],
    mainOperatingCosts: [
      'System technician wages and preventive maintenance schedule',
      'Site security, physical perimeter surveillance, and insurance',
      'Mobile SIM telemetry and data connectivity for remote IoT inverters',
      'Battery depreciation and replacement reserve fund (5-year cycle)'
    ],
    skillsRequired: [
      'Solar PV system sizing and basic electrical safety certification',
      'Local community relationship management and trust-building',
      'Inventory control and hardware preventative diagnostics'
    ],
    equipmentRequired: [
      'Monocrystalline solar panel array (10kW - 30kW)',
      'Hybrid inverter chargers with surge suppression',
      'Modular 48V LiFePO4 battery storage bank (20kWh - 60kWh)',
      'Weatherproof steel enclosure container and smart prepaid meters'
    ],
    potentialChallenges: [
      'Physical equipment theft or solar panel vandalism if site security is inadequate',
      'Seasonal reduction in solar generation during prolonged monsoon or cloudy stretches',
      'Late payment delinquency from informal micro-merchants'
    ],
    growthOpportunities: [
      'Expand into agricultural cold-room rentals powered by midday surplus solar energy',
      'Sell solar water heating kits and DC appliances on hire-purchase installment plans',
      'Replicate the microgrid model across adjacent farming villages and trade centers'
    ],
    defaultGoals: 'Achieve 200 subscribed households in Year 1, expand to commercial agricultural cooling systems in Year 2.',
    globalDemand: 'High across Africa, Southeast Asia, Latin America, and rural North America',
    financialAssumptions: {
      breakEvenMonths: 'Month 11',
      estimatedMonthlyRevenue: '$4,200 - $8,500',
      projectedGrossMargin: '68%',
      initialCapitalRequired: '$18,500 (Core 15kW array + 30kWh battery bank)',
      unitEconomicsSummary: 'Each merchant connection generates $45/mo recurring income against $11/mo marginal operating maintenance cost.'
    },
    popularBadge: '🔥 Popular CleanTech',
    trendingRank: 1,
    featuredInCountry: ['botswana', 'south-africa', 'kenya', 'nigeria']
  },
  {
    id: 'idea-2',
    slug: 'cold-chain-logistics-produce',
    title: 'Cold-Chain Logistics for Farm-to-Market Produce',
    tagline: 'Solar-powered cold storage and mobile refrigerated transport reducing food waste.',
    category: 'AgriTech & Logistics',
    industry: 'Agriculture & Supply Chain',
    country: ['Global', 'Kenya', 'Nigeria', 'South Africa', 'Botswana'],
    region: 'Africa',
    startupCapitalMin: 15000,
    startupCapitalMax: 50000,
    estimatedCapitalRange: '$15,000 - $50,000',
    difficulty: 'High',
    complexity: 'High',
    workEnvironment: 'Hybrid',
    locationType: 'Physical Location',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '3 - 8 members',
    scalability: 'High / Global Scale',
    businessOverview: 'Operate modular, walk-in solar cold rooms located at rural farming aggregation hubs paired with refrigerated mobile pickup routes. Enables smallholder farmers to keep tomatoes, leafy greens, berries, and milk chilled for up to 21 days, fetching 30% higher market prices in urban centers.',
    fullDescription: 'Deploy temperature-controlled pickup routes and modular cold rooms at rural collection hubs. Farmers book crate space via SMS or smartphone app to reach urban markets without spoilage.',
    whyItWorks: [
      'Over 40% of fresh produce in emerging markets rots before reaching wholesale buyers due to lack of cold-chain infrastructure.',
      'Supermarket chains and high-end restaurants will pay premium prices for verified unbroken cold-chain supply.',
      'Farmers urgently seek refrigerated space to prevent distress selling at rock-bottom prices during peak harvest.',
      'Directly combats food insecurity and greenhouse emissions from food spoilage.'
    ],
    targetCustomers: [
      'Smallholder and commercial vegetable, fruit, and dairy farmers',
      'Urban supermarket chains, hotels, and restaurant procurement directors',
      'Wholesale produce market traders and agricultural exporters'
    ],
    targetAudience: 'Smallholder fruit and vegetable farmers, wholesale grocers, urban supermarkets',
    startupRequirements: [
      'Acquire or lease an insulated refrigerated box truck (or trailer with chiller unit)',
      'Set up a 20ft converted refrigerated shipping container with solar backup at an aggregation hub',
      'Obtain food handling hygiene licenses and agricultural transport permits',
      'Establish a booking dispatch app or WhatsApp business hotline for pickup schedules'
    ],
    revenueModel: 'Per-crate daily chilling fee, refrigerated transport tonnage rate, and wholesale buyer brokerage commission.',
    potentialBusinessModel: 'Per-crate refrigerated transport tariffs, cold-room locker storage daily rent, and a 5-8% brokerage fee on wholesale buyer matching.',
    revenueStreams: [
      'Cold-room crate rental ($0.35 - $0.70 per 20kg crate per day)',
      'Scheduled refrigerated transport to urban wholesale centers ($45 - $80 per pallet)',
      'Direct buyer-farmer matching take-rate (6% - 10% on transacted crop volume)'
    ],
    mainOperatingCosts: [
      'Diesel and maintenance for refrigerated delivery vehicles',
      'Driver and cold-room site manager salaries',
      'Sanitation supplies, digital temperature loggers, and crate cleaning',
      'Insurance on transit cargo against breakdown or spoilage'
    ],
    skillsRequired: [
      'Agricultural post-harvest handling and temperature compliance',
      'Route logistics planning and vehicle fleet tracking',
      'B2B sales and contracts negotiation with wholesale buyers'
    ],
    equipmentRequired: [
      'Refrigerated van or trailer with thermal partition (2 - 4 ton capacity)',
      'Walk-in insulated cold storage room with rooftop solar backup',
      'Stackable food-grade plastic ventilation crates (500 units)',
      'IoT temperature monitoring probes with real-time SMS alerts'
    ],
    potentialChallenges: [
      'Vehicle mechanical breakdowns on rough rural farm access roads',
      'Crop seasonality causing uneven utilization during dry planting months',
      'Fuel price volatility impacting per-kilometer transit margins'
    ],
    growthOpportunities: [
      'Pre-cooling and grading/packaging services to earn export certification premiums',
      'Introduce digital warehouse receipts allowing farmers to access micro-loans against stored crops',
      'Expand routes to connect with coastal ports or international airport cargo terminals'
    ],
    defaultGoals: 'Reduce harvest loss by 40% across partner farms and secure contracts with 5 urban wholesale chains.',
    globalDemand: 'Surging in emerging economies and regional organic farming belts globally',
    financialAssumptions: {
      breakEvenMonths: 'Month 9',
      estimatedMonthlyRevenue: '$6,500 - $14,000',
      projectedGrossMargin: '52%',
      initialCapitalRequired: '$28,000 (Leased refrigerated van + modular hub chiller)',
      unitEconomicsSummary: 'Chilling 400 crates/day generates $6,000/mo net storage revenue, with transport adding $5,200/mo.'
    },
    popularBadge: '⭐ High Impact',
    trendingRank: 2,
    featuredInCountry: ['kenya', 'nigeria', 'south-africa', 'botswana']
  },
  {
    id: 'idea-3',
    slug: 'ai-workflow-automation-studio',
    title: 'AI-Powered Workflow Automation & Invoicing Studio',
    tagline: 'Automate repetitive workflows, CRM pipelines, and multi-currency invoicing for SMBs.',
    category: 'FinTech & Software',
    industry: 'Information Technology & Software (SaaS)',
    country: ['Global', 'United States', 'United Kingdom', 'South Africa'],
    region: 'North America',
    startupCapitalMin: 500,
    startupCapitalMax: 2500,
    estimatedCapitalRange: '$500 - $2,500',
    difficulty: 'Low',
    complexity: 'Low',
    workEnvironment: 'Online',
    locationType: 'Home-based',
    teamStructure: 'Solo-Friendly',
    suggestedTeam: '1 - 3 members',
    scalability: 'High / Global Scale',
    businessOverview: 'A specialized remote agency providing plug-and-play AI automation for accounting firms, law offices, medical practices, and digital agencies. Connects customer CRMs with AI document parsers, automated VAT/tax compliance tools, WhatsApp automated follow-ups, and payment gateways.',
    fullDescription: 'A lightweight software platform that connects with global payment processors and automatically handles tax residency regulations, local invoice formats, and foreign currency hedges.',
    whyItWorks: [
      'Small business owners waste 15+ hours each week on manual data entry, client reminders, and spreadsheet copying.',
      'Zero inventory, zero physical real estate, and negligible overhead enables 80%+ gross margins from Day 1.',
      'Low technical barrier using modern API workflow builders (Make, Zapier, n8n, OpenAI/Gemini SDKs).',
      'Retainer model provides predictable recurring revenue with high client lifetime value.'
    ],
    targetCustomers: [
      'Independent accounting and bookkeeping practices',
      'Law firms, immigration consultants, and notary agencies',
      'E-commerce brands and multi-currency digital agencies'
    ],
    targetAudience: 'Remote digital contractors, international agencies, e-commerce drop-shippers',
    startupRequirements: [
      'High-speed internet, professional development laptop, and workspace',
      'Commercial subscriptions to workflow tools (Make.com, n8n, OpenAI/Gemini API keys)',
      'Professional portfolio website showcasing 3 interactive workflow demos',
      'Standard client service agreement and NDA templates'
    ],
    revenueModel: 'Fixed-price implementation setup packages plus ongoing monthly maintenance and API monitoring retainers.',
    potentialBusinessModel: 'Freemium SaaS subscription ($12/mo Pro, $39/mo Agency) plus 0.5% micro-fee on automated foreign currency payouts.',
    revenueStreams: [
      'One-time workflow build & onboarding ($1,200 - $3,500 per client)',
      'Monthly maintenance, optimization & bug-fix retainer ($450 - $1,200/month)',
      'Custom AI prompt engineering and internal employee training workshops ($1,500/day)'
    ],
    mainOperatingCosts: [
      'API token usage and automation platform subscription tier costs',
      'Domain hosting, business email, and cloud storage',
      'Professional liability insurance and software licensing'
    ],
    skillsRequired: [
      'No-code / low-code workflow integration (Zapier, Make, n8n, REST APIs)',
      'Systematic problem-solving and business process mapping',
      'Client onboarding communication and project management'
    ],
    equipmentRequired: [
      'Modern laptop (MacBook or Windows PC with 16GB+ RAM)',
      'Dual monitor display for complex workflow visualization',
      'Noise-cancelling headset for client video consultations'
    ],
    potentialChallenges: [
      'Third-party API updates or token expiration breaking live client pipelines',
      'Client scope creep requiring strict milestone and change-request policies',
      'Educating non-technical clients on the limitations and capabilities of AI'
    ],
    growthOpportunities: [
      'Package the most requested workflows into an all-in-one micro-SaaS template',
      'Target high-ticket niche verticals (e.g. real estate brokerage automation)',
      'Hire junior automation builders to scale monthly client capacity'
    ],
    defaultGoals: 'Sign 5 monthly retainer clients by Month 3 and build a proprietary workflow library.',
    globalDemand: 'Universal with the exponential growth of international remote work',
    financialAssumptions: {
      breakEvenMonths: 'Month 1',
      estimatedMonthlyRevenue: '$4,500 - $12,000',
      projectedGrossMargin: '86%',
      initialCapitalRequired: '$850 (Software licenses, domain, portfolio hosting)',
      unitEconomicsSummary: 'Each client onboarded provides $1,800 setup + $650/mo retainer against ~$60/mo in software tool costs.'
    },
    popularBadge: '🚀 Best Under $1,000',
    trendingRank: 3,
    featuredInCountry: ['united-states', 'united-kingdom', 'south-africa', 'botswana']
  },
  {
    id: 'idea-4',
    slug: 'mobile-telehealth-diagnostic-van',
    title: 'Mobile Telehealth & Diagnostic Van Service',
    tagline: 'Primary care checkups, blood diagnostics, and tele-consultations directly to communities.',
    category: 'Healthcare & Wellness',
    industry: 'Healthcare & Medical Services',
    country: ['Global', 'South Africa', 'India', 'United States', 'Botswana'],
    region: 'Global',
    startupCapitalMin: 25000,
    startupCapitalMax: 65000,
    estimatedCapitalRange: '$25,000 - $65,000',
    difficulty: 'High',
    complexity: 'High',
    workEnvironment: 'Offline',
    locationType: 'Physical Location',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '3 - 6 members (Nurse practitioner, driver, telemedicine doctor)',
    scalability: 'Regional Growth',
    businessOverview: 'A customized diagnostic van equipped with digital point-of-care analyzers (glucose, cholesterol, malaria, vitals), ultrasound, and high-speed satellite connectivity. Travels to corporate campuses, residential estates, schools, and rural villages to provide rapid checkups and remote specialist consultations.',
    fullDescription: 'Equip a customized van with basic point-of-care diagnostics and satellite connectivity to connect patients to specialist doctors remotely.',
    whyItWorks: [
      'Long clinic queues and doctor shortages make routine health screening inaccessible or severely delayed.',
      'Corporate employers actively contract mobile wellness services to reduce employee sick leave and fulfill health mandates.',
      'Point-of-care diagnostic devices now return laboratory-accurate results in under 15 minutes.',
      'High recurring demand for chronic disease monitoring (diabetes, hypertension, cardiac health).'
    ],
    targetCustomers: [
      'Corporate workplaces and factory campuses requiring annual wellness screenings',
      'Retirement villages and residential housing estate associations',
      'School districts and peri-urban community health drives'
    ],
    targetAudience: 'Seniors, peri-urban residents, school districts, remote factory campuses',
    startupRequirements: [
      'Acquire and medically retrofit a commercial high-roof van or minivan',
      'Partner with a certified supervising physician or clinical director',
      'Procure point-of-care diagnostic machines and CE/FDA-certified medical consumables',
      'Secure health ministry transport licenses and clinical waste disposal agreements'
    ],
    revenueModel: 'Direct-to-patient screening fees, corporate wellness retainer contracts, and lab test processing markups.',
    potentialBusinessModel: 'Direct consultation fees, employer wellness subscription retainers, and public-private municipal healthcare voucher subsidies.',
    revenueStreams: [
      'Individual comprehensive health checkup packages ($25 - $75 per patient)',
      'Corporate employee wellness day retainers ($1,500 - $3,500 per day)',
      'Chronic prescription refill delivery and remote doctor tele-consultation cut ($15/visit)'
    ],
    mainOperatingCosts: [
      'Nurse practitioner and certified driver salaries',
      'Medical test strips, lancets, cartridges, and PPE consumables',
      'Vehicle fuel, satellite internet, and routine van servicing',
      'Clinical malpractice and medical transport insurance'
    ],
    skillsRequired: [
      'Clinical nursing and phlebotomy proficiency',
      'Strict adherence to patient data privacy (HIPAA/POPIA/GDPR) and medical records',
      'Corporate B2B wellness partnership sales'
    ],
    equipmentRequired: [
      'High-roof retrofitted medical van with privacy examination bed',
      'Point-of-care blood chemistry analyzer (cholesterol, glucose, HbA1c)',
      'Digital ECG machine and automated vital signs monitor',
      'Starlink or cellular bonded high-speed router for video tele-consults'
    ],
    potentialChallenges: [
      'Medical regulatory compliance and regional health board permits',
      'Maintaining equipment calibration and cold-chain storage for reagents',
      'Weather-related travel disruptions in unpaved rural sectors'
    ],
    growthOpportunities: [
      'Deploy a fleet of multiple vans across regional commercial corridors',
      'Partner with health insurance funds for direct cashless claims settlement',
      'Introduce mobile dentistry and digital eye screening modules'
    ],
    defaultGoals: 'Serve 500 patients monthly, achieve break-even in month 11, and secure municipal health partnership grants.',
    globalDemand: 'Extremely high worldwide, bridging the healthcare accessibility divide',
    financialAssumptions: {
      breakEvenMonths: 'Month 11',
      estimatedMonthlyRevenue: '$8,500 - $18,000',
      projectedGrossMargin: '58%',
      initialCapitalRequired: '$38,000 (Van lease deposit, medical fit-out, diagnostic units)',
      unitEconomicsSummary: 'Corporate health days generate $2,200/day at $700 total operational cost including nurse and consumables.'
    },
    popularBadge: '🏥 Essential Health',
    trendingRank: 4,
    featuredInCountry: ['south-africa', 'india', 'united-states', 'botswana']
  },
  {
    id: 'idea-5',
    slug: 'sustainable-agri-fiber-eco-packaging',
    title: 'Sustainable Agri-Fiber Eco-Packaging Fabrication',
    tagline: 'Biodegradable packaging pressed from agricultural waste (sugarcane bagasse, cassava, hemp).',
    category: 'Manufacturing & Circular Economy',
    industry: 'Manufacturing & Production',
    country: ['Global', 'Nigeria', 'Kenya', 'India', 'Botswana'],
    region: 'Global',
    startupCapitalMin: 8000,
    startupCapitalMax: 28000,
    estimatedCapitalRange: '$8,000 - $28,000',
    difficulty: 'Moderate',
    complexity: 'Moderate',
    workEnvironment: 'Offline',
    locationType: 'Physical Location',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '2 - 5 members',
    scalability: 'High / Global Scale',
    businessOverview: 'Collect surplus agricultural fibers (sugarcane bagasse, cassava pulp, hemp husks, maize stalks) and press them into 100% compostable takeaway food containers, egg cartons, protective mailer cushions, and beverage cup holders. Decomposes naturally in 90 days, replacing harmful polystyrene and single-use plastic.',
    fullDescription: 'Source local agricultural husks and bagasse to press compostable takeaway containers, mailer bags, and protective box inserts that break down naturally in 90 days.',
    whyItWorks: [
      'Over 60 countries have implemented strict bans or heavy penalties on single-use styrofoam and plastic packaging.',
      'Restaurants and supermarket chains actively search for certified eco-friendly containers to appease consumers.',
      'Agricultural fiber raw materials are plentiful and often free or negligible in cost at harvest sites.',
      'Products offer high thermal insulation and oil resistance compared to standard paperboard.'
    ],
    targetCustomers: [
      'Fast-casual restaurants, cloud kitchens, and specialty coffee shops',
      'E-commerce brands seeking plastic-free protective mailer inserts',
      'Poultry farms and supermarket egg distributors'
    ],
    targetAudience: 'Local restaurants, cloud kitchens, retail boutiques, cosmetics brands',
    startupRequirements: [
      'Lease a light-industrial workshop with three-phase power and ventilation',
      'Procure a semi-automatic hydraulic pulp molding press and custom molds',
      'Secure supply agreements with local sugarcane mills, cassava processors, or grain farms',
      'Obtain food-contact safety certification and biodegradable testing reports'
    ],
    revenueModel: 'Direct wholesale bulk sales to food-service operators and custom-embossed brand packaging contracts.',
    potentialBusinessModel: 'Direct wholesale batch sales to food service operators, custom branded packaging fabrication contracts, and recurring supply subscriptions.',
    revenueStreams: [
      'Wholesale takeaway clamshell boxes ($0.08 - $0.18 per unit in 10,000+ case orders)',
      'Custom branded/embossed packaging fabrication runs for boutique brands',
      'Protective corner guards and mailer packaging for logistics distributors'
    ],
    mainOperatingCosts: [
      'Electricity consumption for hydraulic heated press and dryers',
      'Raw fiber collection, transport, and pulping enzyme additives',
      'Factory floor technician wages and mold maintenance',
      'Carton packaging boxes and distribution transport'
    ],
    skillsRequired: [
      'Basic machine operation and hydraulic press maintenance',
      'Pulp consistency control and moisture testing',
      'B2B wholesale sales and restaurant procurement pitching'
    ],
    equipmentRequired: [
      'Pulp beater and hydraulic fiber hydrapulper vat',
      'Semi-automatic thermoforming pulp molding press machine',
      'Precision aluminum molds (clamshell box, 2-cup carrier, egg tray)',
      'Air compressor and hot-air drying tunnel'
    ],
    potentialChallenges: [
      'Initial tool/mold fabrication lead times and capital expenditure',
      'Ensuring consistent fiber purity and moisture levels without synthetic chemical binders',
      'Competing against cheap imported plastic if raw material sourcing is unoptimized'
    ],
    growthOpportunities: [
      'Manufacture custom molded electronics packaging inserts for hardware manufacturers',
      'Establish raw fiber collection hubs directly with rural smallholder farmer cooperatives',
      'Export pallet loads to neighboring countries with strict plastic bans'
    ],
    defaultGoals: 'Produce 50,000 units/month by month 6 and replace styrofoam across 40 local restaurants.',
    globalDemand: 'Explosive demand due to single-use plastic bans worldwide',
    financialAssumptions: {
      breakEvenMonths: 'Month 8',
      estimatedMonthlyRevenue: '$6,000 - $15,000',
      projectedGrossMargin: '55%',
      initialCapitalRequired: '$18,500 (Hydraulic pulp press, 2 custom molds, initial fiber supply)',
      unitEconomicsSummary: 'Unit production cost is $0.05/box, sold at $0.12/box wholesale to restaurants (58% gross margin).'
    },
    popularBadge: '🌱 Eco-Pioneer',
    trendingRank: 5,
    featuredInCountry: ['nigeria', 'kenya', 'india', 'botswana']
  },
  {
    id: 'idea-6',
    slug: 'solar-borehole-pumping-agri-hub',
    title: 'Solar Borehole Pumping & Cattle Agri-Supply Hub',
    tagline: 'Solar water pumping conversion and cattle monitoring hubs for pastoralists and farmers.',
    category: 'CleanTech & Energy',
    industry: 'Agriculture & AgriTech',
    country: ['Botswana', 'South Africa', 'Kenya', 'Global'],
    region: 'Africa',
    startupCapitalMin: 8000,
    startupCapitalMax: 25000,
    estimatedCapitalRange: '$8,000 - $25,000 (P100,000 - P320,000)',
    difficulty: 'Moderate',
    complexity: 'Moderate',
    workEnvironment: 'Offline',
    locationType: 'Physical Location',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '2 - 4 technicians and agronomists',
    scalability: 'Regional Growth',
    businessOverview: 'Replace expensive, failure-prone diesel generators at cattle posts and crop farms with reliable submersible solar borehole pumping systems. Bundles solar pump installations with automated water trough sensors, livestock mineral supplements, and IoT borehole telemetry.',
    fullDescription: 'Replace expensive diesel generators at cattle posts with reliable solar water pumping systems and livestock management supplies.',
    whyItWorks: [
      'Farmers spend thousands of dollars monthly hauling diesel to remote cattle posts across the Kalahari and savannah.',
      'Botswana, Namibia, and South Africa have some of the highest solar radiation in the world, guaranteeing continuous daytime pumping.',
      'Diesel generator breakdowns often cause catastrophic water shortages for valuable livestock herds.',
      'Payback period for farmers switching to solar is typically under 14 months.'
    ],
    targetCustomers: [
      'Commercial cattle ranchers and pastoralists with remote boreholes',
      'Horticulture farmers and greenhouse operators in peri-urban corridors',
      'Government livestock development centers and community syndicates'
    ],
    targetAudience: 'Livestock owners, cattle ranchers, commercial irrigation farmers',
    startupRequirements: [
      'Establish vendor partnerships with Tier-1 solar borehole pump manufacturers (e.g. Grundfos, Lorentz)',
      'Equip a rugged 4x4 field service vehicle with pipe-pulling rig and tools',
      'Register business with local agricultural associations and enterprise authorities',
      'Implement installment or lease-to-own financing partnerships with agricultural banks'
    ],
    revenueModel: 'Turnkey equipment installation contracts, recurring maintenance service plans, and agricultural input sales.',
    potentialBusinessModel: 'Turnkey solar pumping installation packages, annual maintenance contracts, and replacement solar pump hardware margins.',
    revenueStreams: [
      'Turnkey solar borehole conversions ($3,500 - $9,000 per borehole installation)',
      'Quarterly preventive maintenance and water testing subscription ($250/year per farm)',
      'IoT smart water level and tank overflow telemetry sensor packages ($450 install)'
    ],
    mainOperatingCosts: [
      '4x4 vehicle fuel and bush-road suspension maintenance',
      'Certified field electrical/plumbing technician wages',
      'Field installation safety tools and replacement pump component inventory'
    ],
    skillsRequired: [
      'Submersible borehole pump mechanics and DC solar wiring',
      'Agricultural water flow calculations (head height, liters/hour, pressure)',
      'Relationship building with traditional cattle syndicates and ranchers'
    ],
    equipmentRequired: [
      'Rugged 4x4 utility pickup with heavy-duty crane/winch hoist',
      'Multimeter, pipe fusion welding machine, and electrical crimping tools',
      'Demonstration trailer with working solar pump and water fountain display'
    ],
    potentialChallenges: [
      'Long travel distances between remote cattle posts across sandy terrain',
      'Variability in borehole water depth and salinity requiring specialized stainless steel pumps',
      'Seasonal cattle market liquidity fluctuations affecting customer cash flow'
    ],
    growthOpportunities: [
      'Expand into solar cold-rooms for fresh milk and carcass storage at cattle auctions',
      'Introduce GPS cattle ear tags integrated with borehole water station readers',
      'Partner with regional development funds for subsidized communal village water syndicates'
    ],
    defaultGoals: 'Convert 35 diesel boreholes to solar in Year 1, saving farmers over $120,000 in diesel fuel.',
    globalDemand: 'Very high across arid and semi-arid grazing zones globally',
    financialAssumptions: {
      breakEvenMonths: 'Month 6',
      estimatedMonthlyRevenue: '$7,000 - $18,000',
      projectedGrossMargin: '42%',
      initialCapitalRequired: '$14,000 (Field 4x4 deposit, installation tooling, 2 demo pumps)',
      unitEconomicsSummary: 'Average installation ticket is $5,200 with $1,900 net margin per converted borehole.'
    },
    popularBadge: '🇧🇼 Botswana Specialty',
    trendingRank: 6,
    featuredInCountry: ['botswana', 'south-africa']
  },
  {
    id: 'idea-7',
    slug: 'solar-loadshedding-inverter-service',
    title: 'Loadshedding Solar Inverter & Battery Backup Hub',
    tagline: 'Rapid turnkey backup power and rooftop solar installations for homes and businesses.',
    category: 'CleanTech & Energy',
    industry: 'Renewable Energy & Utilities',
    country: ['South Africa', 'Botswana', 'Nigeria', 'Global'],
    region: 'Africa',
    startupCapitalMin: 3000,
    startupCapitalMax: 12000,
    estimatedCapitalRange: '$3,000 - $12,000 (R50,000 - R200,000)',
    difficulty: 'Moderate',
    complexity: 'Moderate',
    workEnvironment: 'Offline',
    locationType: 'Flexible',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '2 - 4 certified electricians',
    scalability: 'Regional Growth',
    businessOverview: 'Install plug-and-play hybrid inverters and lithium battery backup systems for suburban households, medical practices, retail stores, and home offices struggling with power outages. Provides rapid 48-hour installation, compliance certification, and smart smartphone app monitoring.',
    fullDescription: 'Install hybrid inverters and lithium battery systems to keep homes and small businesses running smoothly during load shedding and blackouts.',
    whyItWorks: [
      'Chronic rolling blackouts disrupt daily commerce, refrigeration, WiFi, and security alarms.',
      'Suburban households view backup power as a non-negotiable basic necessity.',
      'Hybrid inverters allow clients to start with battery backup immediately, adding solar panels later as budget allows.',
      'Fast project turnaround (1-2 days per installation) delivers rapid cash cycle velocity.'
    ],
    targetCustomers: [
      'Suburban homeowners seeking uninterrupted WiFi, lights, entertainment, and refrigeration',
      'Doctor offices, dental practices, and veterinary clinics needing cold-chain stability',
      'Restaurants, cafes, and retail boutiques facing lost sales during power cuts'
    ],
    targetAudience: 'Homeowners, remote workers, medical practices, retail shops',
    startupRequirements: [
      'Certified wireman electrician license and registered electrical contractor accreditation',
      'Wholesale distributor accounts with inverter manufacturers (Deye, Sunsynk, Growatt, Hubble)',
      'Service vehicle stocked with circuit breakers, surge protectors, and cabling',
      'Professional quoting and electrical load calculation software'
    ],
    revenueModel: 'Equipment hardware margin markup (20-30%) plus fixed professional installation and compliance sign-off fees.',
    potentialBusinessModel: 'Turnkey hardware sales, professional installation fees, and annual electrical inspection certifications.',
    revenueStreams: [
      'Standard 5kW / 5kWh home backup installation ($2,800 - $4,200 per system)',
      'Full 8kW solar rooftop expansion upgrade ($5,500 - $9,500 per installation)',
      'Annual electrical Certificate of Compliance (CoC) and battery health audit ($150/visit)'
    ],
    mainOperatingCosts: [
      'Electrician wages and certified assistant compensation',
      'Tool depreciation, ladder racks, and testing instruments',
      'Vehicle fuel and commercial installer liability insurance'
    ],
    skillsRequired: [
      'Single-phase and three-phase distribution board wiring',
      'Battery management system (BMS) protocol configuration',
      'Clear consumer consultative sales and post-install support'
    ],
    equipmentRequired: [
      'Electrician tool kit, conduit benders, and digital insulation testers',
      'Heavy-duty transport vehicle with ladder mounts',
      'Demonstration inverter and lithium battery bench kit for client demos'
    ],
    potentialChallenges: [
      'Import delays on popular lithium battery brands during peak load shedding phases',
      'Underpricing quotes if complex home wiring faults are not identified beforehand',
      'Fluctuations in government grid stability affecting consumer urgency'
    ],
    growthOpportunities: [
      'Offer zero-down rental subscription models partnered with asset finance lenders',
      'Expand into commercial 50kW+ systems for shopping centers and light manufacturing',
      'Provide smart home energy management automation and EV wallbox chargers'
    ],
    defaultGoals: 'Complete 12 residential installations per month and maintain a 5-star customer referral rating.',
    globalDemand: 'High in countries with emerging grid challenges and high solar potential',
    financialAssumptions: {
      breakEvenMonths: 'Month 3',
      estimatedMonthlyRevenue: '$9,000 - $22,000',
      projectedGrossMargin: '38%',
      initialCapitalRequired: '$6,500 (Tools, demo inverter unit, safety gear, marketing)',
      unitEconomicsSummary: 'Average residential job yields $3,200 gross revenue with $850 net profit per 1-day installation.'
    },
    popularBadge: '🇿🇦 South Africa Essential',
    trendingRank: 7,
    featuredInCountry: ['south-africa', 'botswana', 'nigeria']
  },
  {
    id: 'idea-8',
    slug: 'township-suburban-dark-delivery-hub',
    title: 'Township & Suburban Last-Mile Dark Delivery Hub',
    tagline: 'Micro-fulfillment dark store providing 30-minute delivery for daily groceries and essentials.',
    category: 'Logistics, Transport & Supply Chain',
    industry: 'Logistics, Transport & Supply Chain',
    country: ['South Africa', 'Nigeria', 'Kenya', 'Global'],
    region: 'Africa',
    startupCapitalMin: 5000,
    startupCapitalMax: 15000,
    estimatedCapitalRange: '$5,000 - $15,000',
    difficulty: 'Moderate',
    complexity: 'Moderate',
    workEnvironment: 'Hybrid',
    locationType: 'Physical Location',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '3 - 6 members (Manager + motorbike riders)',
    scalability: 'Regional Growth',
    businessOverview: 'A localized micro-fulfillment center ("dark store") placed directly within high-density suburban or township commercial arteries. Stocks the 400 most frequently purchased items (bread, milk, prepaid airtime, medicine, baby formula, fast food) and delivers to doorsteps within 30 minutes via motorbike or e-bike.',
    fullDescription: 'Micro-fulfillment dark store stocking fast-moving daily household essentials with 30-minute doorstep delivery.',
    whyItWorks: [
      'Residents in busy townships and suburbs frequently lack easy transport to large mall supermarkets for emergency needs.',
      'Traditional e-commerce takes 24-48 hours and struggles with unmapped streets and informal addresses.',
      'WhatsApp-based ordering requires zero new app downloads, eliminating consumer adoption friction.',
      'High order frequency (families ordering 3-5 times per week) drives rapid inventory turns.'
    ],
    targetCustomers: [
      'Busy working mothers and families needing fast grocery refills without leaving home',
      'Local spaza shops needing emergency wholesale restocks when stock runs out',
      'Late-night snack, beverage, and over-the-counter medication shoppers'
    ],
    targetAudience: 'Township residents, suburban families, local spaza shop merchants',
    startupRequirements: [
      'Secure a low-cost, secure 40-80 sqm warehouse or converted shipping container in a central node',
      'Acquire 2-3 reliable 125cc delivery motorbikes or electric delivery scooters with insulated top boxes',
      'Build a simple WhatsApp Business automated catalog and order dispatcher',
      'Establish wholesale accounts with FMCG distributors for high volume pricing'
    ],
    revenueModel: 'Product retail margin (18-28%) plus a flat modest delivery fee per order ($1.20 - $2.50).',
    potentialBusinessModel: 'Retail grocery margins, nominal doorstep delivery fees, and FMCG brand featured placement promotions.',
    revenueStreams: [
      'Daily grocery & household product sales markup',
      'Flat delivery fee per drop-off ($1.50 per delivery)',
      'Featured placement fees from local bakeries and food brands to highlight new products'
    ],
    mainOperatingCosts: [
      'Motorbike fuel, maintenance, and fleet tracking telemetry',
      'Rider daily wages and commission-per-drop bonuses',
      'Storefront rental, electricity for refrigeration, and inventory shrinkage allowance'
    ],
    skillsRequired: [
      'High-speed order picking and inventory management',
      'Hyper-local neighborhood geographic knowledge and routing',
      'Customer service via WhatsApp and cash/card reconciliation'
    ],
    equipmentRequired: [
      '2 or 3 delivery motorbikes with heavy-duty insulated cargo delivery boxes',
      'Commercial display refrigerators and metal shelving units',
      'Smartphone order terminal with thermal receipt printer'
    ],
    potentialChallenges: [
      'Rider road safety and vehicle mechanical maintenance during bad weather',
      'Cash handling security in cash-predominant neighborhoods (addressed via cashless POS / mobile money)',
      'Managing fast-moving perishable inventory to prevent spoilage'
    ],
    growthOpportunities: [
      'Replicate the micro-hub across 5 adjacent neighborhoods within 18 months',
      'Partner with pharmacy chains to deliver prescription medications',
      'Introduce hot takeaway meals prepared by partner home cooks'
    ],
    defaultGoals: 'Reach 120 completed deliveries per day within 6 months with an average basket size of $18.',
    globalDemand: 'High in rapidly urbanizing developing markets and suburban neighborhoods',
    financialAssumptions: {
      breakEvenMonths: 'Month 5',
      estimatedMonthlyRevenue: '$11,000 - $24,000',
      projectedGrossMargin: '26%',
      initialCapitalRequired: '$8,500 (2 motorbikes, hub lease, initial fast-moving inventory)',
      unitEconomicsSummary: 'Average order $18 with $4.50 gross profit + $1.50 delivery fee = $6.00 gross contribution per drop.'
    },
    popularBadge: '⚡ Fast Delivery',
    trendingRank: 8,
    featuredInCountry: ['south-africa', 'nigeria', 'kenya']
  },
  {
    id: 'idea-9',
    slug: 'artisanal-heritage-food-export-brand',
    title: 'Artisanal Specialty Food Brand with Global Export',
    tagline: 'Single-origin, ethically harvested gourmet spices, tea, honey, or botanical oils direct-to-consumer.',
    category: 'Consumer Goods & Retail',
    industry: 'Food & Beverage / Hospitality',
    country: ['Global', 'Botswana', 'South Africa', 'United Kingdom', 'India'],
    region: 'Global',
    startupCapitalMin: 2500,
    startupCapitalMax: 10000,
    estimatedCapitalRange: '$2,500 - $10,000',
    difficulty: 'Moderate',
    complexity: 'Moderate',
    workEnvironment: 'Hybrid',
    locationType: 'Flexible',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '2 - 4 members',
    scalability: 'High / Global Scale',
    businessOverview: 'Source unique, ethically harvested botanical crops (such as wild Kalahari desert melon seed oil, single-estate rooibos, raw forest honey, or artisanal organic teas). Packages them into high-end, luxury glass packaging with transparent QR-code origin storytelling for export to specialty boutiques and direct online consumers in Europe and North America.',
    fullDescription: 'Package single-origin heritage specialty crops into luxury gift-worthy packaging with transparent traceability for export to high-income markets.',
    whyItWorks: [
      'Western and East Asian consumers pay top dollar for verified single-origin, clean-label, ethically traded superfoods and botanicals.',
      'Raw local harvest cost is low, enabling extraordinary gross margins (65-75%) when packaged as a luxury gift item.',
      'Lightweight dried items (tea, spices, cold-pressed oils) enjoy low international air freight costs.',
      'Transparent storytelling and farmer empowerment creates defensible brand loyalty.'
    ],
    targetCustomers: [
      'Health-conscious gourmet consumers, natural skincare enthusiasts, and luxury gift shoppers',
      'High-end boutique delicatessens, organic grocery stores, and specialty cafes',
      'Corporate holiday gift and luxury hotel amenity procurement teams'
    ],
    targetAudience: 'Conscious gourmet consumers, luxury gift shoppers, boutique cafes worldwide',
    startupRequirements: [
      'Secure ethical supply contracts with rural harvesting cooperatives or organic farms',
      'Source certified luxury food-grade packaging (amber glass jars, embossed foil labels)',
      'Obtain food hygiene certification and export phytosanitary permits',
      'Build a Shopify direct-to-consumer store with international courier fulfillment'
    ],
    revenueModel: 'High-margin direct-to-consumer (D2C) e-commerce sales and wholesale retail distribution margins.',
    potentialBusinessModel: 'Direct-to-consumer online margins, wholesale boutique distribution, and corporate gift hampers.',
    revenueStreams: [
      'D2C online sales ($28 - $65 per bottle / tin)',
      'Wholesale retail distribution to specialty boutiques ($14 - $32 per unit wholesale)',
      'Curated subscription boxes and custom corporate gift hampers ($85 - $160 per box)'
    ],
    mainOperatingCosts: [
      'Raw botanical harvesting and quality testing lab fees',
      'Custom packaging, labels, and tamper-evident sealing materials',
      'International air express freight and customs clearance documentation',
      'Social media influencer marketing and luxury packaging photography'
    ],
    skillsRequired: [
      'Luxury brand identity and packaging aesthetic design',
      'Export documentation and food import regulations (FDA, EU Food Standards)',
      'Digital e-commerce marketing and social media storytelling'
    ],
    equipmentRequired: [
      'Semi-automatic liquid/powder filling and capping machine',
      'Digital precision scale and tamper-evident induction sealer',
      'Professional product photography lighting setup'
    ],
    potentialChallenges: [
      'Strict international customs and organic certification requirements',
      'Managing seasonal crop variations while maintaining uniform taste and viscosity',
      'Customer acquisition costs on social media if brand storytelling is weak'
    ],
    growthOpportunities: [
      'Expand into luxury skincare and clean beauty formulations using the same botanical oils',
      'Secure distribution in premium airport duty-free luxury terminals',
      'Launch co-branded limited-edition releases with celebrity chefs and wellness influencers'
    ],
    defaultGoals: 'Ship to customers across 15 countries in Year 1 and secure shelf space in 30 boutique luxury retailers.',
    globalDemand: 'Steady high-margin premium consumer sector growing at 9% CAGR',
    financialAssumptions: {
      breakEvenMonths: 'Month 6',
      estimatedMonthlyRevenue: '$5,500 - $16,000',
      projectedGrossMargin: '71%',
      initialCapitalRequired: '$5,200 (Initial crop harvest batch, custom glass packaging, web store)',
      unitEconomicsSummary: 'Product costs $4.80 to harvest and package, sold for $34.00 online (85% product gross margin).'
    },
    popularBadge: '🌍 Global Export',
    trendingRank: 9,
    featuredInCountry: ['botswana', 'south-africa', 'united-kingdom', 'india']
  },
  {
    id: 'idea-10',
    slug: 'ev-charger-installation-green-homes',
    title: 'Commercial & Residential EV Charger Installation',
    tagline: 'Turnkey electric vehicle charging point installations for homes, offices, and hotels.',
    category: 'CleanTech & Energy',
    industry: 'Renewable Energy & Utilities',
    country: ['United Kingdom', 'United States', 'Global'],
    region: 'Europe',
    startupCapitalMin: 10000,
    startupCapitalMax: 35000,
    estimatedCapitalRange: '$10,000 - $35,000 (£8,000 - £28,000)',
    difficulty: 'Moderate',
    complexity: 'Moderate',
    workEnvironment: 'Offline',
    locationType: 'Physical Location',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '2 - 4 certified electricians',
    scalability: 'Regional Growth',
    businessOverview: 'A specialized electrical contracting firm focused exclusively on installing, commissioning, and maintaining Level 2 and DC fast electric vehicle charging stations for residential driveways, corporate parking lots, apartment complexes, and boutique hotels.',
    fullDescription: 'Install and maintain residential and commercial electric vehicle charging points with smart billing software.',
    whyItWorks: [
      'Rapidly rising electric vehicle adoption creates a massive backlog for certified charging point installers.',
      'Government grants and tax incentives in the UK, US, and Europe subsidize installation costs for property owners.',
      'Commercial businesses (hotels, supermarkets, gyms) need EV chargers to attract and retain affluent customers.',
      'Ongoing smart software management fees generate reliable recurring SaaS income.'
    ],
    targetCustomers: [
      'EV car owners requiring dedicated home driveway wallbox chargers',
      'Commercial property managers, office parks, and residential apartment buildings',
      'Hotels, bed & breakfasts, and golf clubs seeking hospitality charging amenities'
    ],
    targetAudience: 'EV owners, corporate facility managers, hotel directors',
    startupRequirements: [
      'Electrician qualification with specialized EV charging installation accreditation (e.g. City & Guilds 2919 / OZEV in UK)',
      'Approved installer agreements with leading EV hardware manufacturers (Easee, Wallbox, Zaptec)',
      'Commercial electrical installation tools and test equipment',
      'Online lead-generation funnel targeting new EV registrations'
    ],
    revenueModel: 'Hardware markup, fixed installation labor fees, and ongoing smart charger software management retainers.',
    potentialBusinessModel: 'Turnkey hardware sales, certified installation fees, and recurring commercial smart charger management SaaS.',
    revenueStreams: [
      'Standard residential wallbox installation ($950 - $1,600 per home)',
      'Commercial multi-bay workplace installation ($3,500 - $12,000 per site)',
      'Monthly cloud charger billing and load-balancing management fee ($15 - $35 per commercial socket/mo)'
    ],
    mainOperatingCosts: [
      'Certified electrician salaries and apprenticeship wages',
      'Specialist armored cables, distribution board breakers, and earth rods',
      'Vehicle lease, fuel, and electrical insurance coverage'
    ],
    skillsRequired: [
      'Electrical earthing arrangements, load curtailment, and DNO notification protocols',
      'Smart WiFi / 4G telemetry charger app commissioning',
      'High-touch customer consultative service and quoting'
    ],
    equipmentRequired: [
      'Dedicated service van with heavy-duty cable dispensers',
      'Multifunction electrical installation tester (MFT) and EVSE test adapter',
      'Heavy-duty core drill for exterior masonry penetrations'
    ],
    potentialChallenges: [
      'Upgrading older residential main fuse boards that have insufficient electrical capacity',
      'Delays with local electricity distribution network operators (DNO) for commercial capacity approvals',
      'Hardware firmware glitches requiring occasional on-site resets'
    ],
    growthOpportunities: [
      'Bundle EV charger installations with residential solar battery systems',
      'Own and operate private revenue-generating public charging stations on profit-share land leases',
      'Provide fleet electrification transitions for commercial vans and delivery fleets'
    ],
    defaultGoals: 'Install 20 residential units and 2 commercial multi-socket hubs per month within 9 months.',
    globalDemand: 'Explosive growth aligned with global vehicle electrification mandates',
    financialAssumptions: {
      breakEvenMonths: 'Month 4',
      estimatedMonthlyRevenue: '$14,000 - $32,000',
      projectedGrossMargin: '44%',
      initialCapitalRequired: '$12,000 (Testing instruments, certifications, van lease, initial hardware stock)',
      unitEconomicsSummary: 'Residential install charges $1,250 with $520 net margin per half-day job.'
    },
    popularBadge: '🔌 Fast Growth',
    trendingRank: 10,
    featuredInCountry: ['united-kingdom', 'united-states']
  },
  {
    id: 'idea-11',
    slug: 'quick-commerce-tier2-dark-store',
    title: 'Tier-2 City Quick-Commerce Micro-Fulfillment Center',
    tagline: 'Ultra-fast 15-minute delivery for daily groceries and medicine in booming tier-2 cities.',
    category: 'Logistics, Transport & Supply Chain',
    industry: 'Logistics, Transport & Supply Chain',
    country: ['India', 'Nigeria', 'Global'],
    region: 'Asia',
    startupCapitalMin: 8000,
    startupCapitalMax: 22000,
    estimatedCapitalRange: '$8,000 - $22,000 (₹6,50,000 - ₹18,00,000)',
    difficulty: 'Moderate',
    complexity: 'Moderate',
    workEnvironment: 'Hybrid',
    locationType: 'Physical Location',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '4 - 8 members',
    scalability: 'High / Global Scale',
    businessOverview: 'A neighborhood dark store located in rapidly growing tier-2/3 cities where major venture-backed delivery giants have not yet penetrated. Delivers essential groceries, snacks, dairy, personal care, and medicines within 15-20 minutes via UPI and WhatsApp order links.',
    fullDescription: 'Establish neighborhood dark stores delivering groceries and essentials within 15 minutes across fast-growing secondary urban markets.',
    whyItWorks: [
      'Tier-2 city consumers have high aspirational demand for quick delivery but are underserved by mega-platforms.',
      'Real estate rental costs in tier-2 cities are 60-75% cheaper than tier-1 metros, dramatically boosting profitability.',
      'UPI digital payments make instant prepaid ordering effortless without chargebacks.',
      'Local brand sourcing and fresh regional produce creates stronger neighborhood community loyalty.'
    ],
    targetCustomers: [
      'Young working couples and professionals living in secondary urban cities',
      'Families requiring urgent last-minute cooking ingredients or late-night baby supplies',
      'Elderly residents needing reliable home delivery of daily milk and medicines'
    ],
    targetAudience: 'Aspirational urban consumers, young families, busy professionals in tier-2 cities',
    startupRequirements: [
      'Rent a 600-1,000 sq ft commercial ground-floor space in a dense residential cluster',
      'Install industrial shelving, barcode scanners, and inventory ERP software',
      'Onboard 4 full-time electric two-wheeler delivery riders',
      'Establish direct relationships with local FMCG distributors and dairy cooperatives'
    ],
    revenueModel: 'Direct product markup margins (16-24%) and nominal delivery charges.',
    potentialBusinessModel: 'FMCG retail margin, brand promotional listing banners, and express doorstep delivery fees.',
    revenueStreams: [
      'Fast-moving grocery & beverage retail margins',
      'Express delivery charge ($0.40 - $0.80 per order)',
      'In-app banner promotions and promotional sampling deals with consumer brands'
    ],
    mainOperatingCosts: [
      'Store lease and commercial electricity for deep freezers',
      'Delivery rider wages and per-drop incentives',
      'Inventory holding costs and packaging bags'
    ],
    skillsRequired: [
      'High-speed picking logistics and stock rotation',
      'Hyper-local neighborhood digital marketing',
      'Vendor negotiations and working capital management'
    ],
    equipmentRequired: [
      'Commercial glass-door refrigerators and horizontal deep freezers',
      'Heavy-duty slotted angle steel storage racks',
      'Handheld barcode scanners and digital billing POS counter'
    ],
    potentialChallenges: [
      'Managing stock freshness and minimizing expiration losses on dairy and produce',
      'Maintaining 15-minute SLA during heavy rain or festival traffic jams',
      'Competing against longstanding neighborhood kirana stores on credit relationships'
    ],
    growthOpportunities: [
      'Expand the dark store footprint across 4 strategic quadrants of the city',
      'Introduce proprietary private-label staples (rice, pulses, spices) with 40%+ gross margins',
      'Add on-demand pet food and veterinary product delivery'
    ],
    defaultGoals: 'Process 250 orders daily with an average turnaround time under 18 minutes by Month 6.',
    globalDemand: 'Fastest-growing consumer retail segment in South Asia and Southeast Asia',
    financialAssumptions: {
      breakEvenMonths: 'Month 6',
      estimatedMonthlyRevenue: '$12,000 - $28,000',
      projectedGrossMargin: '22%',
      initialCapitalRequired: '$11,500 (Premises deposit, shelving, refrigeration, initial stock)',
      unitEconomicsSummary: 'Average order $9 with $1.90 gross profit + $0.50 delivery fee = $2.40 net unit contribution.'
    },
    popularBadge: '🇮🇳 India Opportunity',
    trendingRank: 11,
    featuredInCountry: ['india']
  },
  {
    id: 'idea-12',
    slug: 'senior-care-move-transition-services',
    title: 'Senior Care Relocation & Transition Concierge',
    tagline: 'Compassionate downsizing, home transition, and estate sorting for aging seniors.',
    category: 'Professional & Business Services',
    industry: 'Professional & Business Services',
    country: ['United States', 'United Kingdom', 'Global'],
    region: 'North America',
    startupCapitalMin: 1000,
    startupCapitalMax: 4000,
    estimatedCapitalRange: '$1,000 - $4,000',
    difficulty: 'Low',
    complexity: 'Low',
    workEnvironment: 'Hybrid',
    locationType: 'Flexible',
    teamStructure: 'Small Team (2-5)',
    suggestedTeam: '2 - 3 compassionate coordinators',
    scalability: 'Local / Community',
    businessOverview: 'A specialized, high-empathy service that assists elderly individuals and their adult children with the overwhelming physical and emotional process of downsizing from large family homes into retirement communities or assisted living. Handles sorting, estate dispersal, donation, packing, moving coordination, and complete unpacking so the new home is immediately comfortable.',
    fullDescription: 'Assist seniors and families with downsizing, estate dispersal, and seamless relocation into senior living communities.',
    whyItWorks: [
      'The global senior population (Baby Boomers) is at an all-time high, with millions transitioning residences annually.',
      'Adult children often live in other cities or have demanding careers and cannot spend weeks sorting decades of family belongings.',
      'Senior living communities actively refer clients to trusted transition coordinators to speed up facility move-in dates.',
      'Low initial startup capital and high service fee potential ($2,500 - $6,000 per relocation project).'
    ],
    targetCustomers: [
      'Adult children (aged 45-65) managing their aging parents’ household transition',
      'Retirement villages and assisted living directors seeking reliable move-in partners',
      'Estate executors and elder-law attorneys needing home liquidation'
    ],
    targetAudience: 'Seniors, adult children of aging parents, retirement communities',
    startupRequirements: [
      'General liability and bonded caregiving/moving insurance',
      'Establish partnership referral agreements with local senior living community marketing directors',
      'Build relationships with vetted movers, estate auctioneers, and donation charities',
      'Professional website with heartfelt video testimonials and downsizing checklists'
    ],
    revenueModel: 'Comprehensive turnkey project package fees ($2,500 - $6,500) or hourly transition rates ($65 - $110/hour).',
    potentialBusinessModel: 'Project-based transition packages, hourly organizing rates, and consignment commission on sold antiques.',
    revenueStreams: [
      'Full turnkey downsizing & move management package ($2,800 - $5,500 per home)',
      'Estate liquidation and antique consignment commission (15% - 25% of auctioned goods)',
      'Hourly specialized decluttering and space planning sessions ($75/hour)'
    ],
    mainOperatingCosts: [
      'Packing supplies (bubble wrap, heavy-duty wardrobe boxes, mattress covers)',
      'Marketing collateral and networking sponsorships with elder-care associations',
      'Commercial insurance and client communication software'
    ],
    skillsRequired: [
      'High emotional empathy and patient active listening with seniors',
      'Organizational space planning and floorplan visualization',
      'Vendor management and logistical scheduling'
    ],
    equipmentRequired: [
      'Professional packing kit, moving blankets, and furniture sliders',
      'Smartphone/tablet for floor planning and inventory photographing',
      'Labeling machines and protective floor runners'
    ],
    potentialChallenges: [
      'Managing senior emotional attachment and anxiety over personal memorabilia',
      'Coordinating multi-party schedules between movers, realtors, and assisted living staff',
      'Building initial trust without established reputation in eldercare networks'
    ],
    growthOpportunities: [
      'Add home modification safety consulting (grab bars, stair lifts, non-slip flooring)',
      'Partner with probate attorneys for high-value estate liquidations',
      'Franchise the operational system across neighboring metropolitan regions'
    ],
    defaultGoals: 'Complete 4 full household transitions monthly within 6 months of launch.',
    globalDemand: 'Surging across aging populations in North America, Europe, Japan, and Australasia',
    financialAssumptions: {
      breakEvenMonths: 'Month 2',
      estimatedMonthlyRevenue: '$7,500 - $18,000',
      projectedGrossMargin: '78%',
      initialCapitalRequired: '$1,800 (Insurance bonding, branding, supplies, senior directory listings)',
      unitEconomicsSummary: 'Each transition averages $3,800 fee with $800 in direct packing labor/supplies = $3,000 net contribution.'
    },
    popularBadge: '❤️ High Compassion',
    trendingRank: 12,
    featuredInCountry: ['united-states', 'united-kingdom']
  }
];

export const GLOBAL_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', country: 'United States', rateToUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', country: 'European Union', rateToUSD: 1.08 },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', country: 'United Kingdom', rateToUSD: 1.28 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', country: 'Canada', rateToUSD: 0.74 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', country: 'Australia', rateToUSD: 0.65 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', country: 'Japan', rateToUSD: 0.0067 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', country: 'India', rateToUSD: 0.012 },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula (BWP)', country: 'Botswana', rateToUSD: 0.073 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (ZAR)', country: 'South Africa', rateToUSD: 0.054 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (NGN)', country: 'Nigeria', rateToUSD: 0.00067 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KES)', country: 'Kenya', rateToUSD: 0.0077 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (BRL)', country: 'Brazil', rateToUSD: 0.18 },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso (MXN)', country: 'Mexico', rateToUSD: 0.051 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', country: 'Singapore', rateToUSD: 0.75 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', country: 'United Arab Emirates', rateToUSD: 0.27 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)', country: 'Switzerland', rateToUSD: 1.13 },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
  INR: '₹',
  BWP: 'P',
  ZAR: 'R',
  NGN: '₦',
  KES: 'KSh',
  BRL: 'R$',
  MXN: 'MX$',
  SGD: 'S$',
  AED: 'AED',
  CHF: 'CHF',
};

export function convertToUSD(amount: number, currencyCode: string): number {
  const cur = GLOBAL_CURRENCIES.find((c) => c.code.toUpperCase() === currencyCode.toUpperCase());
  if (!cur) return amount;
  return amount * cur.rateToUSD;
}

export function convertFromUSD(amountUSD: number, targetCurrencyCode: string): { amount: number; formatted: string } {
  const cur = GLOBAL_CURRENCIES.find((c) => c.code.toUpperCase() === targetCurrencyCode.toUpperCase());
  if (!cur || cur.rateToUSD <= 0) {
    return {
      amount: amountUSD,
      formatted: `$${amountUSD.toLocaleString()}`
    };
  }
  const localVal = Math.round(amountUSD / cur.rateToUSD);
  return {
    amount: localVal,
    formatted: `${cur.symbol}${localVal.toLocaleString()} ${cur.code}`
  };
}

export const COMMON_INDUSTRIES = [
  'Renewable Energy & Utilities',
  'Agriculture & AgriTech',
  'Information Technology & Software (SaaS)',
  'Logistics, Transport & Supply Chain',
  'Manufacturing & Production',
  'Healthcare & Medical Services',
  'Food & Beverage / Hospitality',
  'Consumer Goods & Retail',
  'Professional & Business Services',
  'Education & EdTech',
  'CleanTech & Energy',
  'FinTech & Financial Services',
  'Construction & Real Estate',
  'Media, Entertainment & Creative',
  'Tourism, Travel & Leisure',
];
