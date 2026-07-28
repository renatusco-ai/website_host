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
    audience: 'SMBs with 1–4 person teams',
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
      'Restructured fragmented member, coach, and billing data into a single AI-ready source of truth — replacing siloed spreadsheets with a connected schema.',
    tags: ['Database restructure', 'Schema design', 'AI readiness'],
    metrics: { label: 'Data sources unified', value: '12+' },
  },
  {
    id: 'market-research-analyst',
    industry: 'AI Agents',
    title: 'Market research analyst agent',
    outcome:
      'Deployed an AI agent that monitors competitors, synthesises industry trends, and delivers structured briefings — replacing hours of manual research with on-demand intelligence.',
    tags: ['AI agents', 'Research automation', 'Competitive intel'],
    metrics: { label: 'Research hours saved', value: '20+/wk' },
  },
  {
    id: 'coach-os',
    industry: 'Staff Operations',
    title: 'Staff operating system',
    outcome:
      'Delivered a purpose-built staff platform for session planning, client tracking, and performance reviews — replacing manual workflows with intelligent automation.',
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
      'Built a cross-platform member app with real-time session data, coach visibility, and personalised engagement — all powered by the restructured backend.',
    tags: ['React Native', 'Real-time data', 'Member portal'],
    metrics: { label: 'Active members served', value: '500+' },
  },
  {
    id: 'renewal-automation',
    industry: 'Retention & Sales',
    title: 'Renewal intelligence system',
    outcome:
      'Automated renewal scoring, churn prediction, and coach assignment — turning a manual spreadsheet process into a real-time decision engine.',
    tags: ['AI agents', 'Predictive scoring', 'Automation'],
    metrics: { label: 'Renewal accuracy', value: '94%' },
    media: [
      {
        src: '/portfolio/renewal-automation.png',
        caption: 'Projected churn — renewal action queue with risk scoring',
      },
    ],
  },
  {
    id: 'referral-tracking-crm',
    industry: 'Growth & Sales',
    title: 'Referral tracking CRM',
    outcome:
      'Built a referral CRM that gives the whole team shared visibility — who referred whom, who has already made contact, and what was communicated — so nobody duplicates outreach or trips over each other chasing the same lead.',
    tags: ['CRM', 'Referral tracking', 'Team coordination'],
    metrics: { label: 'Referrals tracked', value: '1K+' },
    media: [
      {
        src: '/portfolio/referral-tracking-crm.png',
        caption: 'Referral tracker — pipeline, contact history, and conversion trends',
      },
    ],
  },
  {
    id: 'exercise-programming-engine',
    industry: 'Staff Operations',
    title: 'Exercise programming engine',
    outcome:
      'Built a full programming system where staff generate exercise plans with AI-assisted confidence scoring — syncing to the member app and on-the-floor web app in real time.',
    tags: ['Exercise programming', 'AI confidence scoring', 'Member sync', 'Multi-platform'],
    metrics: { label: 'Programs auto-generated', value: '1K+' },
    media: [
      {
        src: '/portfolio/exercise-programming-engine.png',
        caption: 'Day view — exercise prescription with personal-best history',
      },
      {
        src: '/portfolio/exercise-programming-engine-weekly.png',
        caption: 'Weekly view — full training week across multiple days',
      },
    ],
  },
  {
    id: 'client-workbook',
    industry: 'Client Management',
    title: 'Client workbook with live health data',
    outcome:
      'Delivered a coach workbook for client check-ins, attendance, and team notes — with external API integrations that live-sync steps, nutrition tracking, body weight, and nutrition targets from health data platforms.',
    tags: ['External API integrations', 'Health data sync', 'Nutrition tracking', 'Role-based access'],
    metrics: { label: 'Health data sources integrated', value: '5+' },
    media: [
      {
        src: '/portfolio/client-workbook.png',
        caption: 'Coach workbook — check-ins, attendance, and shared team notes',
      },
      {
        src: '/portfolio/client-workbook-nutrition.png',
        caption: 'Live health data — body weight, steps, and nutrition targets synced from external APIs',
      },
    ],
  },
  {
    id: 'member-health-dashboard',
    industry: 'Retention & Analytics',
    title: 'Member health and churn intelligence',
    outcome:
      'Built a member health dashboard with multi-factor churn risk scoring, AI-generated explanations, and team action queues — so staff stay on top of at-risk clients and coordinate renewals before it is too late.',
    tags: ['Churn prediction', 'Risk scoring', 'AI explanations', 'Team dashboards'],
    metrics: { label: 'Churn risk factors scored', value: '9' },
    media: [
      {
        src: '/portfolio/member-health-dashboard.png',
        caption: 'Member health — colour-coded risk overview across the full base',
      },
    ],
  },
  {
    id: 'finance-dashboard',
    industry: 'Finance & Reporting',
    title: 'Accounting intelligence dashboard',
    outcome:
      'Connected accounting, payroll, and operational data into live reporting dashboards — giving leadership real-time visibility without manual exports.',
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
      'Reserved for businesses generating over $1M in annual revenue. Come prepared to talk through your biggest problems — we will tell you honestly whether we can help.',
    embedPath: 'mnl09r0/free-ai-ops-diagnostic-intro',
    url: 'https://tidycal.com/mnl09r0/free-ai-ops-diagnostic-intro',
  },
  audit: {
    id: 'audit',
    eyebrow: 'Paid Session',
    title: 'Operations & AI Optimization Audit',
    description:
      'A 60-minute paid working session. We dig into your operations, identify where AI and automation can help, and hand you a clear plan you can act on — whether or not you work with us further.',
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
      "A quick, no-pressure session to understand what you're dealing with. You tell us what's broken — we'll tell you honestly whether we can help.",
    features: [
      'Intro diagnostic session',
      'An honest read on whether it is worth pursuing',
      'No pitch, no pressure',
    ],
    cta: 'Book Free Diagnostic',
    bookingType: 'discovery',
    accent: 'bronze',
  },
  {
    id: 'audit',
    label: 'Paid',
    duration: '60 min · Video or in person',
    title: 'Operations & AI Optimization Audit',
    note: 'Credited towards your project if you engage with us',
    description:
      'A paid working session, not a sales pitch. We dig into your operations and hand you a plan and tools you can act on immediately — whether or not you ever hire us.',
    features: [
      '60-minute deep-dive session',
      'A written action plan you keep either way',
      'Real tools and templates, not just advice',
    ],
    cta: 'Book Paid Audit Session',
    bookingType: 'audit',
    accent: 'gold',
    popular: true,
  },
  {
    id: 'workshop',
    label: 'Team session',
    duration: 'Half-day · Your whole team',
    title: 'AI Workshop',
    description:
      'Bring your whole team. A hands-on session that demystifies AI and leaves everyone with practical, usable skills — no restructuring commitment required.',
    features: [
      'Whole-team AI literacy',
      'Hands-on exercises, not theory',
      'A roadmap for what to tackle first',
    ],
    cta: 'Book a Workshop',
    ctaLink: '/workshops',
    accent: 'silver',
  },
];

export const WORKSHOP_TOPICS = [
  {
    title: 'AI fundamentals',
    description: 'What AI actually is, what it can and cannot do, and how to evaluate tools without the hype.',
  },
  {
    title: 'Practical workflows',
    description: 'Hands-on exercises using AI for writing, research, data analysis, and day-to-day business tasks.',
  },
  {
    title: 'Data readiness',
    description: 'Why clean, structured data is the foundation every AI tool depends on — and how to get there.',
  },
  {
    title: 'Building your roadmap',
    description: 'Leave with a clear plan for where AI fits in your business and what to tackle first.',
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
      'We design the solution — data schema, workflows, integrations, and AI agents — tailored to your exact operational reality.',
  },
  {
    phase: 'Phase III',
    title: 'Deliver',
    description:
      'We build, deploy, and hand over a working solution. Not a tool to figure out — a system that runs from day one.',
  },
];

export const VALUE_PILLARS = [
  {
    number: '01',
    title: 'Restructure',
    description:
      'We clean, connect, and reorganise your business data so it becomes a foundation AI can actually build on — not a mess of spreadsheets and silos.',
    detail: 'CRM clean-up, database design, schema architecture, data migration.',
  },
  {
    number: '02',
    title: 'Automate',
    description:
      'We deploy intelligent workflows and AI agents that eliminate manual work — from lead processing to reporting — so your team focuses on what matters.',
    detail: 'Workflow automation, AI agent deployment, integrations, real-time monitoring.',
  },
  {
    number: '03',
    title: 'Educate',
    description:
      'We teach your team to understand and use AI confidently — because a solution only works when the people behind it know how to drive it.',
    detail: 'AI workshops, strategy sessions, ongoing support, documentation.',
  },
];
