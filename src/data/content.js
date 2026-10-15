export const CONTACT_EMAIL = 'info@renatusco.com';

/** Legacy mailto subjects. Enquire Now now opens the on-page form modal. */
export const INQUIRE = {
  default: {
    subject: 'Inquiry from renatusco.com',
  },
  subscription: {
    subject: 'Subscription Diagnostic',
    body: 'I would like to book a paid Subscription Diagnostic: map my software spend and leave with an actionable plan to reduce it.',
  },
  diagnostic: {
    subject: 'Free AI & Ops Diagnostic (15 min)',
    body: 'I would like a quick, no-pressure 15-minute AI & Ops Diagnostic.',
  },
};

/**
 * Clients shown on the home page logo wall. Logos are pre-flattened to one ink tone
 * by `npm run process-logos`.
 *
 * `scale` optically balances the set: wide wordmarks read large at a given height,
 * stacked or square lockups read small, so each logo gets a multiplier on the base
 * row height rather than all sharing one.
 */
export const CLIENTS = [
  {
    id: 'lockeroom',
    name: 'Lockeroom',
    sector: 'Fitness operations',
    logo: '/clients/lockeroom.png',
    scale: 1,
    href: '/portfolio/lockeroom',
  },
  {
    id: 'aspire',
    name: 'Aspire Constructions',
    sector: 'Construction',
    logo: '/clients/aspire.png',
    scale: 1,
  },
  {
    id: 'ajw',
    name: 'The AJW Group',
    sector: 'Renovation & restoration',
    logo: '/clients/ajw.png',
    scale: 1.62,
  },
  {
    id: 'mobility-collective',
    name: 'The Mobility Collective',
    sector: 'Health & wellness',
    logo: '/clients/mobility-collective.png',
    scale: 1.58,
  },
  {
    id: 'ipa',
    name: 'IPA',
    sector: 'Posing academy',
    logo: '/clients/ipa.png',
    scale: 1.2,
  },
  {
    id: 'jd-financial',
    name: 'JD Financial Group',
    sector: 'Financial services',
    logo: '/clients/jd-financial.png',
    scale: 0.85,
  },
  {
    id: 'apg-property',
    name: 'APG Property',
    sector: 'Commercial property',
    logo: '/clients/apg-property.svg',
    scale: 1.05,
  },
  {
    id: 'white-key',
    name: 'White Key Marketing',
    sector: 'Marketing',
    logo: '/clients/white-key.png',
    scale: 1.5,
  },
];

/** The client given hero treatment on the wall. Must match a CLIENTS id. */
export const FEATURED_CLIENT_ID = 'lockeroom';

export const TIERS = [
  {
    id: 'bronze',
    metal: 'Bronze',
    name: 'Foundation',
    price: 'Tailored to your business',
    audience: 'Starter businesses & sole traders',
    popular: false,
    accent: 'bronze',
    features: [
      'Professional website build',
      'CRM & spreadsheet clean-up',
      'Essential automations to remove manual work',
      '1× 30-minute onboarding call',
    ],
  },
  {
    id: 'silver',
    metal: 'Silver',
    name: 'Accelerate',
    price: 'Tailored to your business',
    audience: 'SMBs with 1-4 person teams',
    popular: false,
    accent: 'silver',
    features: [
      'Everything in Foundation',
      'Database restructure for AI readiness',
      'Workflow & automation setup',
      'Reporting dashboards (scoped to your needs)',
      '3× strategy sessions',
    ],
  },
  {
    id: 'gold',
    metal: 'Gold',
    name: 'Elevate',
    price: 'Tailored to your business',
    audience: 'Growing teams ready to scale',
    popular: true,
    accent: 'gold',
    features: [
      'Everything in Accelerate',
      'Full database restructure',
      'Multi-person team + individual logins',
      'PWA staff app',
      'Custom integrations & API setup',
      '6 months post-build support',
    ],
  },
  {
    id: 'meridian',
    metal: 'Meridian',
    name: 'Transform',
    price: 'Tailored to your business',
    audience: 'Enterprise-level transformation',
    popular: false,
    accent: 'meridian',
    features: [
      'Everything in Elevate',
      'Reformat & migrate all data',
      'Fully custom app build',
      'Bespoke architecture design',
      'Dedicated project team',
      '12+ months support',
    ],
  },
];

/** Set true when high-quality, anonymised portfolio screenshots are ready */
export const PORTFOLIO_MEDIA_ENABLED = false;

export const CASE_STUDIES = [
  {
    id: 'data-neural-network',
    industry: 'Fitness Operations',
    title: 'Unified data architecture',
    outcome:
      'Restructured fragmented member, coach, and billing data into a single AI-ready source of truth, replacing siloed spreadsheets with a connected schema.',
    tags: ['Database restructure', 'Schema design', 'AI readiness'],
    metrics: { label: 'Data sources unified', value: '12+' },
  },
  {
    id: 'market-research-analyst',
    industry: 'AI Agents',
    title: 'Market research analyst agent',
    outcome:
      'Deployed an AI agent that monitors competitors, synthesises industry trends, and delivers structured briefings, replacing hours of manual research with on-demand intelligence.',
    tags: ['AI agents', 'Research automation', 'Competitive intel'],
    metrics: { label: 'Research hours saved', value: '20+/wk' },
  },
  {
    id: 'coach-os',
    industry: 'Staff Operations',
    title: 'Staff operating system',
    outcome:
      'Delivered a purpose-built staff platform for session planning, client tracking, and performance reviews, replacing manual workflows with intelligent automation.',
    tags: ['PWA', 'Workflow automation', 'Team logins'],
    metrics: { label: 'Staff hours tracked', value: '10K+' },
  },
  {
    id: 'staff-rostering',
    industry: 'Staff Operations',
    title: 'Staff rostering and scheduling system',
    outcome:
      'Replaced the group-chat roster chaos with a purpose-built scheduling system. Owners and managers see live shift coverage at a glance, staff submit availability and cover requests in one place, and double-bookings become impossible. No more chasing confirmations or finding out someone didn\'t show up because the message got buried.',
    tags: ['Rostering', 'Shift scheduling', 'Team management'],
    metrics: { label: 'Roster admin time saved', value: '10+ hrs/wk' },
  },
  {
    id: 'member-app',
    industry: 'Member Experience',
    title: 'Member-facing mobile app',
    outcome:
      'Built a cross-platform member app with real-time session data, coach visibility, and personalised engagement, all powered by the restructured backend.',
    tags: ['React Native', 'Real-time data', 'Member portal'],
    metrics: { label: 'Active members served', value: '500+' },
  },
  {
    id: 'renewal-automation',
    industry: 'Retention & Sales',
    title: 'Renewal intelligence system',
    outcome:
      'Automated renewal scoring, churn prediction, and coach assignment, turning a manual spreadsheet process into a real-time decision engine.',
    tags: ['AI agents', 'Predictive scoring', 'Automation'],
    metrics: { label: 'Renewal accuracy', value: '94%' },
    media: [
      {
        src: '/portfolio/renewal-automation.png',
        caption: 'Projected churn: renewal action queue with risk scoring',
      },
    ],
  },
  {
    id: 'referral-tracking-crm',
    industry: 'Growth & Sales',
    title: 'Referral tracking CRM',
    outcome:
      'Built a referral CRM that gives the whole team shared visibility on who referred whom, who has already made contact, and what was communicated, so nobody duplicates outreach or trips over each other chasing the same lead.',
    tags: ['CRM', 'Referral tracking', 'Team coordination'],
    metrics: { label: 'Referrals tracked', value: '1K+' },
    media: [
      {
        src: '/portfolio/referral-tracking-crm.png',
        caption: 'Referral tracker: pipeline, contact history, and conversion trends',
      },
    ],
  },
  {
    id: 'exercise-programming-engine',
    industry: 'Staff Operations',
    title: 'Exercise programming engine',
    outcome:
      'Built a full programming system where staff generate exercise plans with AI-assisted confidence scoring, syncing to the member app and on-the-floor web app in real time.',
    tags: ['Exercise programming', 'AI confidence scoring', 'Member sync', 'Multi-platform'],
    metrics: { label: 'Programs auto-generated', value: '1K+' },
    media: [
      {
        src: '/portfolio/exercise-programming-engine.png',
        caption: 'Day view: exercise prescription with personal-best history',
      },
      {
        src: '/portfolio/exercise-programming-engine-weekly.png',
        caption: 'Weekly view: full training week across multiple days',
      },
    ],
  },
  {
    id: 'client-workbook',
    industry: 'Client Management',
    title: 'Client workbook with live health data',
    outcome:
      'Delivered a coach workbook for client check-ins, attendance, and team notes, with external API integrations that live-sync steps, nutrition tracking, body weight, and nutrition targets from health data platforms.',
    tags: ['External API integrations', 'Health data sync', 'Nutrition tracking', 'Role-based access'],
    metrics: { label: 'Health data sources integrated', value: '5+' },
    media: [
      {
        src: '/portfolio/client-workbook.png',
        caption: 'Coach workbook: check-ins, attendance, and shared team notes',
      },
      {
        src: '/portfolio/client-workbook-nutrition.png',
        caption: 'Live health data: body weight, steps, and nutrition targets synced from external APIs',
      },
    ],
  },
  {
    id: 'member-health-dashboard',
    industry: 'Retention & Analytics',
    title: 'Member health and churn intelligence',
    outcome:
      'Built a member health dashboard with multi-factor churn risk scoring, AI-generated explanations, and team action queues, so staff stay on top of at-risk clients and coordinate renewals before it is too late.',
    tags: ['Churn prediction', 'Risk scoring', 'AI explanations', 'Team dashboards'],
    metrics: { label: 'Churn risk factors scored', value: '9' },
    media: [
      {
        src: '/portfolio/member-health-dashboard.png',
        caption: 'Member health: colour-coded risk overview across the full base',
      },
    ],
  },
  {
    id: 'finance-dashboard',
    industry: 'Finance & Reporting',
    title: 'Accounting intelligence dashboard',
    outcome:
      'Connected accounting, payroll, and operational data into live reporting dashboards, giving leadership real-time visibility without manual exports.',
    tags: ['Dashboards', 'Integrations', 'Live reporting'],
    metrics: { label: 'Manual reports eliminated', value: '100%' },
  },
];

export const BOOKING_SESSIONS = {
  discovery: {
    id: 'discovery',
    eyebrow: 'Intro Session',
    title: 'Free AI & Ops Diagnostic',
    description:
      'Reserved for businesses generating over $1M in annual revenue. Come prepared to talk through your biggest problems. We will tell you honestly whether we can help.',
    embedPath: 'mnl09r0/free-ai-ops-diagnostic-intro',
    url: 'https://tidycal.com/mnl09r0/free-ai-ops-diagnostic-intro',
  },
  audit: {
    id: 'audit',
    eyebrow: 'Paid Session',
    title: 'Operations & AI Optimization Audit',
    description:
      'A 60-minute paid working session. We dig into your operations, identify where AI and automation can help, and hand you a clear plan you can act on, whether or not you work with us further.',
    embedPath: 'mnl09r0/operations-ai-optimization-audit',
    url: 'https://tidycal.com/mnl09r0/operations-ai-optimization-audit',
  },
  subscriptionAudit: {
    id: 'subscriptionAudit',
    eyebrow: 'Subscription Audit',
    title: 'Subscription & Stack Audit',
    description:
      'We add up what you are paying to rent software, and whether rebuilding it would create a saving large enough to take the project on. You leave with the numbers either way.',
    embedPath: 'mnl09r0/operations-ai-optimization-audit',
    url: 'https://tidycal.com/mnl09r0/operations-ai-optimization-audit',
  },
};

export const ENTRY_OFFERS = [
  {
    id: 'diagnostic',
    label: 'Free',
    duration: '15 min · Phone or video',
    title: 'Free AI & Ops Diagnostic',
    description:
      "A quick, no-pressure session to understand what you're dealing with. You tell us what's broken. We'll tell you honestly whether we can help.",
    features: [
      'Intro diagnostic session',
      'An honest read on whether it is worth pursuing',
      'No pitch, no pressure',
    ],
    cta: 'Enquire Now',
    inquire: 'diagnostic',
    accent: 'bronze',
  },
  {
    id: 'audit',
    label: 'Paid',
    duration: 'Working session · Video or in person',
    title: 'Subscription Diagnostic',
    note: 'Credited towards your project if you engage with us',
    description:
      'A paid working session. We map what you are paying to rent software and hand you an actionable plan to reduce that spend, whether or not you ever hire us.',
    features: [
      'An actionable plan you can take wherever you like',
      'A clearer picture of your current software landscape',
      'An honest read on whether rebuilding would create a quantified saving',
    ],
    cta: 'Enquire Now',
    inquire: 'subscription',
    accent: 'gold',
    popular: true,
  },
  {
    id: 'workshop',
    label: 'Team session',
    duration: 'Half-day · Leadership & management',
    title: 'Company AI Workshop',
    description:
      'An open education workshop for your management team: practical AI skills first, then company-specific discussion on how to implement with your people and systems.',
    features: [
      'Leadership-aligned AI literacy',
      'Open discussion on implementation',
      'Company-specific agenda layered in',
    ],
    cta: 'Enquire about a Workshop',
    ctaLink: '/workshops',
    accent: 'silver',
  },
];

export const WORKSHOP_TOPICS = [
  {
    title: 'AI fundamentals for leaders',
    description:
      'What AI actually is, what it can and cannot do, and how to evaluate tools without the hype, so management can lead with clarity.',
  },
  {
    title: 'Practical team workflows',
    description:
      'Hands-on exercises your team can use day to day: writing, research, analysis, and ops tasks that save real hours.',
  },
  {
    title: 'Your company, applied',
    description:
      'We layer company-specific discussion on top of the basics: your systems, people, bottlenecks, and where AI should (and should not) land first.',
  },
  {
    title: 'Implementation roadmap',
    description:
      'Leave with a shared plan: ownership, priorities, and the next steps for rolling AI into the business with your team aligned.',
  },
];

/** The three ways forward, shown at the top of the services page. */
export const SERVICE_OPTIONS = [
  {
    id: 'optimise',
    title: 'Optimise your stack',
    body: 'Keep the tools you already pay for and make them work properly. We clean the data, connect the systems and automate the manual steps in between.',
  },
  {
    id: 'custom',
    title: 'Build something custom',
    body: 'Replace the patchwork with one system built around how your business runs. You own it, and it is ready for the next five to ten years of growth.',
  },
  {
    id: 'change',
    title: 'Either one, with change management',
    body: 'Option one or two, plus a change lead who translates between your team and whoever is building, us or your own developers, and stays until the new way of working is embedded.',
    featured: true,
  },
];

export const PROCESS_STEPS = [
  {
    phase: 'Phase I',
    title: 'Discover',
    description:
      'We map your operations, audit your data, and identify where restructuring and automation will deliver the highest impact.',
  },
  {
    phase: 'Phase II',
    title: 'Architect',
    description:
      'We design the solution (data schema, workflows, integrations, and AI agents) tailored to your exact operational reality.',
  },
  {
    phase: 'Phase III',
    title: 'Deliver',
    description:
      'We build, deploy, and hand over a working solution. Not a tool to figure out: a system that runs from day one.',
  },
];

/** How a business's software changes as it grows, shown on the home page. The last stage is ours. */
export const BUSINESS_TIMELINE = [
  {
    stage: 'Day one',
    title: 'Starting out',
    body: 'A spreadsheet, an inbox and a group chat. It works because everyone is in the same room.',
  },
  {
    stage: '5 people',
    title: 'First hires',
    body: 'Subscriptions arrive one at a time. Each fixes a problem and adds another login.',
  },
  {
    stage: '15 people',
    title: 'Growing',
    body: 'Customer data now lives in six places. Someone spends Friday stitching it together.',
  },
  {
    stage: '30+ people',
    title: 'Outgrowing it',
    body: 'The business has changed shape. The tools have not. Workarounds become the job.',
  },
  {
    stage: 'With Renatus',
    title: 'Rebuilt around you',
    body: 'One system shaped to how your team works, implemented alongside them, and owned by you.',
    ours: true,
  },
];

/**
 * Per-seat vs usage cost model, shown on the home page.
 *
 * Figures in COST_EXAMPLES are arithmetic on stated seat counts and published list
 * rates, not quotes. Every example carries its own `basis` string so the assumption
 * is visible on the page rather than buried here.
 */
export const COST_MODEL = {
  traditional: {
    label: 'Per-seat software',
    subtitle: 'What the big platforms charge you',
    points: [
      'Billed per seat, so the admin who logs in twice a month costs exactly the same as your heaviest power user.',
      'Each function needs its own subscription, and every one of them bills per seat again.',
      'A ten to twenty person business routinely pays for thirty-plus seats, because the same people get counted in every tool.',
      'AI features are bundled into the seat price whether your team ever opens them or not.',
      'Hire someone and the bill rises across every tool at once.',
    ],
  },
  ours: {
    label: 'Built and hosted by us',
    subtitle: 'What we charge you',
    points: [
      'One flat hosting rate. Staff logins are unlimited, so there is no seat maths to do.',
      'One system covers the jobs you were paying three or four separate tools to do.',
      'Hire someone and hosting does not move. Cost tracks usage, not headcount.',
      'AI is billed on what you actually use. If your team does not find it useful, you do not pay for it.',
      'You own the system. Leaving does not mean losing your data.',
    ],
  },
};

export const COST_EXAMPLES = [
  {
    id: 'fitness',
    label: 'Fitness & wellness',
    status: 'documented',
    client: 'Lockeroom',
    context: '14 staff, 500+ members, six subscriptions',
    rows: [
      { label: 'Health-data platform', basis: 'features later rebuilt in-house', annual: 35280 },
      { label: 'Five smaller subscriptions', basis: 'booking, admin, and reporting tools', annual: 26490 },
    ],
    ours: {
      value: 266651,
      period: 'saved every year',
      body:
        'Net of the $8,899 a year it costs to run the replacement. Documented FY26 figures, not a projection.',
    },
    footnote:
      'Actual documented FY26 figures. The system that replaced all six runs at $8,899 a year, hosting and AI usage included.',
    href: '/portfolio/lockeroom',
  },
  {
    id: 'marketing',
    label: 'Marketing & creative',
    status: 'modelled',
    client: 'White Key Marketing',
    context: '30+ staff, three rented platforms · three-year view',
    amountSuffix: 'over 3 years',
    stackLabel: 'Three years, staying as you are',
    rows: [
      { label: 'Workspace & docs', basis: 'Notion · $15,000/yr × 3', annual: 45000 },
      { label: 'File storage & sharing', basis: 'Dropbox · $20,000/yr × 3', annual: 60000 },
      {
        label: 'Proposals, signatures & payments',
        basis: 'Ignition · ~$76,000/yr × 3, modelled on $2M processed',
        annual: 228000,
      },
    ],
    ours: {
      value: 188000,
      period: 'saved over 3 years',
      body:
        'That is the gap between staying on Notion, Dropbox, and Ignition ($333k) and owning the stack ($146k). New cost is $16k for docs, $25k for storage, and $105k for payments on Stripe.',
      rows: [
        { label: 'Docs you own', basis: '$12,500 build + running', amount: 16000 },
        { label: 'Storage you own', basis: '$15,500 build + hosting', amount: 25000 },
        { label: 'Payments on Stripe', basis: 'processing only · build not yet scoped', amount: 105000 },
      ],
    },
    footnote:
      'Modelled stack review, excl. GST. Phase 1 and 2 build-and-run figures are firm. Phase 3 is processing cost only — its build fee is still to be scoped, and Ignition needs confirming against actual invoices.',
  },
  {
    id: 'construction',
    label: 'Construction & trades',
    status: 'indicative',
    context: '18 on the tools, 6 in the office',
    rows: [
      { label: 'Project management platform', basis: '12 seats × $99/user/mo', annual: 14256 },
      { label: 'Job scheduling & field app', basis: '18 seats × $39/user/mo', annual: 8424 },
    ],
    replacement: null,
    footnote:
      'Field staff who only need to see today\u2019s job are billed the same as the project manager who lives in it.',
  },
  {
    id: 'property',
    label: 'Commercial property',
    status: 'indicative',
    context: '8 in the office, two portfolios',
    rows: [
      { label: 'Lease & portfolio management', basis: '8 seats × $85/user/mo', annual: 8160 },
      { label: 'Invoicing & receivables chasing', basis: '8 seats × $45/user/mo', annual: 4320 },
    ],
    replacement: null,
    footnote:
      'The same eight people are counted twice, once in each platform, to get one view of money owed.',
  },
];

export const COST_MODEL_DISCLAIMER =
  'Documented figures are from delivered work. Modelled figures come from a stack review and exclude GST. Indicative figures are arithmetic on published list rates, not quotes.';

/**
 * Flagship case study. Line items from the FY26 workbook are grouped into two streams
 * so the page shows the shape of the saving without publishing the full internal
 * breakdown of individual roles and tools.
 */
export const LOCKEROOM_CASE = {
  client: 'Lockeroom',
  sector: 'Fitness operations',
  logo: '/clients/lockeroom.png',
  tagline: 'A quarter of a million dollars in recurring cost, removed permanently.',
  summary:
    'Documented FY26 contribution value. Subscriptions retired, paid features rebuilt in-house, and staff capacity unlocked across client workbooks, scheduling, marketing, programming, and admin.',
  headline: { value: '$266,651', label: 'Net recurring cost removed, every year' },
  secondary: [
    { value: '$22,221', label: 'Removed per month' },
    { value: '6', label: 'Subscriptions retired' },
    { value: '96.8%', label: 'Of the old spend eliminated' },
  ],
  groups: [
    {
      id: 'software',
      title: 'Software retired',
      description:
        'Five subscriptions cancelled outright, plus a health-data platform whose features we rebuilt in-house. Figures are net of the one API we chose to keep.',
      monthly: 5147.52,
      annual: 61770.24,
      items: [
        'Five SaaS subscriptions cancelled',
        'Health-data platform features rebuilt in-house',
      ],
    },
    {
      id: 'capacity',
      title: 'Staff capacity unlocked',
      description:
        'Roles collapsed and manual work removed once the system did the job instead of a person. This is the larger half of the saving, and the half most software business cases ignore.',
      monthly: 17815,
      annual: 213780,
      items: [
        'Client workbook efficiency',
        'Schedule builder',
        'Marketing manager role collapsed',
        'Programming engine replaced a specialist role',
        'Two admin assistant roles no longer needed',
      ],
    },
  ],
  subtotal: { monthly: 22962.52, annual: 275550.24 },
  newCosts: {
    monthly: 741.6,
    annual: 8899.2,
    label: 'Less: what the replacement costs to run',
    note: 'Hosting, database, AI usage, and integrations combined.',
  },
  net: { monthly: 22220.92, annual: 266651.04 },
  /** Existing CASE_STUDIES ids that make up this engagement. */
  workstreams: [
    'exercise-programming-engine',
    'client-workbook',
    'member-health-dashboard',
    'staff-rostering',
    'member-app',
    'referral-tracking-crm',
    'renewal-automation',
  ],
};

export const VALUE_PILLARS = [
  {
    number: '01',
    title: 'Systems',
    description:
      'We design how work should flow as you take on staff (roles, handovers, and the data that keeps everyone aligned) so the business no longer depends on one person holding it all together.',
    detail: 'Ops design, CRM clean-up, schema architecture, staff workflows.',
  },
  {
    number: '02',
    title: 'Technology',
    description:
      'We build the tools that support those systems (dashboards, apps, and AI that remove busywork) so your team can execute without drowning in admin.',
    detail: 'Workflow automation, AI agents, staff apps, live reporting.',
  },
  {
    number: '03',
    title: 'Scale',
    description:
      'We leave you with an operational edge: clear processes, trained people, and technology that grows with the business, not a software handoff you have to figure out alone.',
    detail: 'Onboarding, team training, documentation, ongoing support.',
  },
];
