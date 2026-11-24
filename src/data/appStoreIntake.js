export const STORAGE_KEY = 'renatus_ios_intake_v1';

export const STEPS = [
  { id: 'business', number: 1, shortTitle: 'Business', title: 'Business & Legal Entity' },
  { id: 'concept', number: 2, shortTitle: 'App Concept', title: 'App Concept, Storefronts & Draft Copy' },
  { id: 'brand', number: 3, shortTitle: 'Brand Assets', title: 'Brand Identity, Rights & Asset Uploads' },
  { id: 'legal', number: 4, shortTitle: 'Legal & URLs', title: 'Legal, Privacy & Support URLs' },
  { id: 'privacy', number: 5, shortTitle: 'Privacy & AI', title: 'Health, Social, AI & Data Declarations' },
  { id: 'monetization', number: 6, shortTitle: 'Monetization', title: 'Monetization & Paid Apps Readiness' },
  { id: 'review', number: 7, shortTitle: 'Review', title: 'Timeline, Notes & Confirmation' },
];

export const COUNTRY_CODES = [
  { code: '+61', label: 'AU (+61)' },
  { code: '+64', label: 'NZ (+64)' },
  { code: '+1', label: 'US/CA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+63', label: 'PH (+63)' },
];

export const REGULATED_OPTIONS = [
  { value: 'none', label: 'None of these', exclusive: true },
  { value: 'healthcare', label: 'Clinical healthcare, medical diagnosis, or treatment' },
  { value: 'banking', label: 'Banking, finance, lending, or investments' },
  { value: 'crypto', label: 'Cryptocurrency or financial trading' },
  { value: 'gambling', label: 'Real-money gaming or gambling' },
  { value: 'cannabis', label: 'Cannabis' },
  { value: 'air_travel', label: 'Air travel' },
  { value: 'vpn', label: 'VPN / private networking' },
  { value: 'mdm', label: 'Mobile Device Management (MDM)' },
];

export const PUBLISHING_ACCOUNT_OPTIONS = [
  {
    value: 'renatus',
    label: 'Use Renatus’s Apple Developer account',
    hint: 'Fastest for TestFlight pilots; public App Store launches require written brand authorization and Apple eligibility review.',
  },
  {
    value: 'own',
    label: 'Use our own Apple Developer account',
    hint: 'Recommended for standalone public apps and required for regulated industries.',
  },
  {
    value: 'unsure',
    label: 'Not sure yet — Renatus to advise',
    hint: 'We will recommend the best path on our kickoff call.',
  },
];

export const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'org_active', label: 'Already enrolled as an Organization' },
  { value: 'personal_migrate', label: 'Have a Personal/Individual account (needs migration)' },
  { value: 'not_enrolled', label: 'Not enrolled yet' },
];

export const DISTRIBUTION_GOAL_OPTIONS = [
  { value: 'public', label: 'Public App Store launch' },
  {
    value: 'testflight',
    label: 'Private pilot / beta first (via Apple TestFlight)',
    hint: 'Apple does not allow trials or beta apps on the public App Store—TestFlight is the right channel for pilots.',
  },
  { value: 'unlisted', label: 'Unlisted App Store link (direct-link download only)' },
];

export const PRIMARY_CATEGORIES = [
  'Health & Fitness',
  'Lifestyle',
  'Business',
  'Education',
  'Sports',
  'Medical',
  'Finance',
  'Social Networking',
  'Food & Drink',
  'Productivity',
  'Other',
];

export const PRIMARY_LOCALES = [
  'English (Australia)',
  'English (U.S.)',
  'English (U.K.)',
  'Other',
];

export const AGE_RATING_OPTIONS = [
  { value: '4+', label: '4+ (General audience — most fitness & business apps)' },
  { value: '9+', label: '9+' },
  { value: '13+', label: '13+' },
  { value: '16+', label: '16+' },
  { value: '18+', label: '18+' },
  { value: 'unsure', label: 'Not sure yet — Renatus to advise' },
];

export const TARGET_REGIONS = [
  'Australia',
  'New Zealand',
  'United States',
  'United Kingdom',
  'European Union',
  'China Mainland',
  { value: 'Worldwide', label: 'Worldwide (all storefronts)' },
];

export const HEALTH_OPTIONS = [
  { value: 'none', label: 'None of the above', exclusive: true },
  { value: 'general_fitness', label: 'General fitness, mobility, or workout guidance' },
  { value: 'healthkit', label: 'Apple Health / Apple Watch integration' },
  { value: 'health_biometric', label: 'Collects user health, biometric, or injury/medical data' },
  { value: 'medical_clinical', label: 'Provides medical advice, diagnosis, or clinical treatment' },
];

export const SOCIAL_AI_OPTIONS = [
  { value: 'none', label: 'None of the above', exclusive: true },
  { value: 'social_feed', label: 'Social feed, user profiles, or messaging' },
  { value: 'ugc', label: 'Users can post comments, photos, videos, or content' },
  { value: 'ai_features', label: 'AI assistant, chatbot, or AI-generated content' },
  { value: 'live_location', label: 'Live location sharing between users' },
  { value: 'dating', label: 'Dating or relationships features' },
];

export const USER_DATA_OPTIONS = [
  { value: 'none', label: 'None — no personal data collected', exclusive: true },
  { value: 'unsure', label: 'Not sure yet — Renatus to advise', exclusive: true },
  { value: 'contact_info', label: 'Contact info (name, email, phone)' },
  { value: 'health_fitness', label: 'Health & fitness data' },
  { value: 'payment_history', label: 'Payment or purchase history' },
  { value: 'user_media', label: 'Photos, videos, or user-posted content' },
  { value: 'location', label: 'Location data' },
  { value: 'analytics_crash', label: 'App analytics or crash reports' },
];

export const TRACKING_OPTIONS = [
  { value: 'none', label: 'No ads or cross-app tracking' },
  { value: 'internal_only', label: 'Basic internal analytics only (no cross-app tracking)' },
  { value: 'ad_tracking', label: 'In-app ad networks or cross-app tracking (requires Apple permission prompt)' },
  { value: 'unsure', label: 'Not sure yet — Renatus to advise' },
];

export const ENCRYPTION_OPTIONS = [
  { value: 'standard', label: 'Standard security (HTTPS/TLS — applies to 99% of apps)' },
  { value: 'custom', label: 'Custom or proprietary encryption' },
  { value: 'unsure', label: 'Not sure — Renatus to advise' },
];

export const MONETIZATION_OPTIONS = [
  { value: 'free', label: 'Free app (no payments in app)', exclusive: true },
  { value: 'unsure', label: 'Not sure yet — Renatus to advise', exclusive: true },
  { value: 'paid_download', label: 'One-time paid app download' },
  {
    value: 'iap_digital',
    label: 'Digital unlocks or on-demand digital content (e.g., recorded workout library — billed via Apple In-App Purchase)',
  },
  { value: 'subscriptions', label: 'Recurring digital subscriptions (billed via Apple In-App Purchase)' },
  {
    value: 'in_person_physical',
    label: 'In-person classes, coaching, or physical goods (billed externally via Stripe/booking system — NOT Apple In-App Purchase)',
  },
  { value: 'external_digital', label: 'Digital memberships billed externally on our website' },
];

export const PAID_APPS_STATUS_OPTIONS = [
  { value: 'already_active', label: 'Already active in App Store Connect' },
  { value: 'ready_to_complete', label: 'Ready to complete — send us the secure onboarding steps' },
  { value: 'need_advice', label: 'Need advice on Apple billing vs. external payment rules' },
];

export const LAUNCH_WINDOW_OPTIONS = [
  'ASAP (TestFlight pilot)',
  'Within 1 month (Public App Store)',
  '1–3 months',
  'Flexible',
];

export const DEFAULT_ANSWERS = {
  legalName: '',
  brandName: '',
  contactName: '',
  contactEmail: '',
  phoneCountryCode: '+61',
  phoneNumber: '',
  websiteUrl: '',
  country: 'Australia',
  businessRegNumber: '',
  regulatedIndustries: ['none'],
  publishingAccount: '',
  enrollmentStatus: '',
  accountHolderEmail: '',
  teamId: '',
  dunsNumber: '',
  appName: '',
  appSummary: '',
  distributionGoal: '',
  primaryCategory: 'Health & Fitness',
  primaryLocale: 'English (Australia)',
  targetDevices: 'iPhone only',
  ageRatingBand: '',
  kidsCategory: 'no',
  targetRegions: ['Australia'],
  subtitle: '',
  promoText: '',
  draftDescription: '',
  keywords: '',
  brandKitUrl: '',
  brandColors: '',
  iconBackground: '',
  brandFonts: '',
  brandFontLicense: '',
  contentRights: '',
  hasPrivacyPolicy: '',
  privacyPolicyUrl: '',
  websiteManager: '',
  supportUrl: '',
  supportEmail: '',
  termsUrl: '',
  hasAccounts: '',
  hasSocialLogin: '',
  healthInvolvement: [],
  socialAiFeatures: [],
  userDataCollected: [],
  trackingAds: '',
  encryption: 'standard',
  monetization: [],
  paidAppsStatus: '',
  financeContactName: '',
  financeContactEmail: '',
  launchWindow: '',
  reviewNotes: '',
};

export function createUuidV4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatPhoneToE164(countryCode, rawNumber) {
  const cleaned = String(rawNumber || '')
    .trim()
    .replace(/[\s\-().]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
  const digits = cleaned.replace(/^0+/, '');
  return digits ? `${countryCode || '+61'}${digits}` : '';
}

export function formatKeywords(raw) {
  return String(raw || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
    .join(',');
}

export function labelForOption(options, val) {
  if (!val) return '—';
  const found = options.find((o) => (typeof o === 'string' ? o : o.value) === val);
  if (!found) return val;
  return typeof found === 'string' ? found : found.label;
}

export function labelsForValues(options, values) {
  if (!Array.isArray(values) || values.length === 0) return '—';
  return values.map((v) => labelForOption(options, v)).join(', ');
}
