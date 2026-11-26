export function staffIntakeSample(client, staff) {
  const site = client.websiteUrl;
  const app = client.appName;
  const domain = new URL(site).hostname;
  const approvalDate = '2026-11-25';
  const stages = {
    kickoff: {
      owner: staff.owner,
      account: 'client_org',
      scope: 'Confirm the translated listing copy with the client before launch.',
      legalEntity: client.legalName,
      enrolment: 'Active organisation',
      dunsStatus: 'Confirmed',
      dunsNumber: '000000000',
      accountHolder: `apple-owner@${domain}`,
      teamId: 'DEMO123456',
      open: 'Client confirmed launch scope and device support at kickoff.',
    },
    build: {
      build: staff.releaseBuild,
    },
    legal: {
      privacy: `${site}/privacy · policy checked against QA-104`,
      privacyVersion: '1.0',
      privacyApprovedVersion: '1.0',
      privacyApprovedDate: approvalDate,
      privacyApprovalEvidence: 'Client email approval LEG-101',
      privacyReapproval: false,
      terms: `${site}/terms · terms match the release build`,
      termsVersion: '1.0',
      termsApprovedVersion: '1.0',
      termsApprovedDate: approvalDate,
      termsApprovalEvidence: 'Client email approval LEG-102',
      termsUrl: `${site}/terms`,
      termsReapproval: false,
      approval: 'LEG-100 contains both approvals and the published links.',
    },
    listing: {
      storeRecord: 'https://appstoreconnect.example.test/apps/1000000001',
      support: staff.supportUrl,
      listing: true,
      age: true,
      disclosures: true,
      healthDeclarations: 'Completed',
    },
    review: {
      signin: 'Yes, demo login required',
      reviewEvidence: 'QA-108 · reviewer login and sample booking tested on the release build',
      signoffOwner: staff.owner,
    },
  };

  const metadata = {
    'registration-country': 'Australia',
    'business-reg-number': 'Sample ABN 00 000 000 000',
    'export-compliance': 'Uses standard HTTPS/TLS only. See build evidence QA-104.',
    'privacy-policy-url': `${site}/privacy`,
    'eula-terms': `Apple Standard EULA. Client terms published at ${site}/terms.`,
    'privacy-choices-url': `${site}/privacy-choices`,
    'store-app-name': app,
    'primary-language': 'English (Australia)',
    'bundle-id': `test.example.${app.toLowerCase()}.intake`,
    sku: `${app.toUpperCase()}-IOS-001`,
    'user-access': 'Full Access for the client’s App Store Connect team',
    subtitle: 'Move well, every day',
    'primary-category': 'Health & Fitness',
    'secondary-category': 'Lifestyle',
    'age-rating': 'Sample 4+ result from the completed age rating questionnaire.',
    'kids-category': 'No. The app is intended for the general audience.',
    'icon-background': `Opaque background using ${client.brandColors.split(',')[0]}.`,
    'brand-fonts': 'Geist · included with the open font license.',
    'app-icon': 'STORE-120/Icon.png · opaque 1024 x 1024 PNG',
    'iphone-screenshots': 'STORE-120/iPhone · six approved screens',
    'ipad-screenshots': 'STORE-120/iPad · six approved screens',
    'app-previews': 'STORE-120/Preview.mp4 · 20-second preview',
    'promotional-text': 'Book a class and follow short mobility routines at home.',
    description: `${app} helps members book mobility classes and follow short routines at home.`,
    keywords: 'mobility,fitness,workouts,stretching,classes',
    'support-email': `support@${domain}`,
    'marketing-url': site,
    'version-number': '1.0.0',
    copyright: `© 2026 ${client.legalName}`,
    'release-option-launch-window': 'Manual release after App Review. Target week of 30 November.',
    'review-contact-name': staff.owner,
    'review-contact-phone': `+61${client.contactPhone.replaceAll(' ', '').slice(1)}`,
    'review-contact-email': `review@${domain}`,
    'review-attachment': 'QA-108/Reviewer walkthrough.pdf',
  };

  const selections = {
    'regulated-industries': { checked: ['metadata-choice-regulated-industries-none'] },
    'health-fitness-medical': {
      checked: ['generalFitness', 'healthKit', 'healthData'], other: 'At-home mobility assessments.',
    },
    availability: {
      checked: ['metadata-choice-availability-au', 'metadata-choice-availability-nz', 'metadata-choice-availability-eu', 'metadata-choice-availability-cn'],
    },
    'social-ugc-ai-features': { checked: ['metadata-choice-social-ugc-ai-features-none'] },
    'user-data-nutrition-labels': {
      checked: ['metadata-choice-user-data-nutrition-labels-contact'], other: 'Account identifiers.',
    },
    'purpose-strings': {
      checked: ['metadata-choice-purpose-strings-healthkit'],
      evidence: 'HealthKit · Use workout data to show your activity history.',
    },
  };

  const structured = {
    'target-devices': { checked: ['iphone', 'ipad'] },
    platforms: { shared: true },
    'data-purposes': {
      checked: ['signin', 'bookings'],
      other: 'Monitor booking availability.',
      details: {
        'contact-purpose': 'Send booking confirmations and sign-in instructions.',
        'contact-recipients': 'Booking provider and the Renatus support team.',
        'other-purpose': 'Associate signed-in accounts with bookings.',
        'other-recipients': 'Renatus account service.',
      },
    },
    'content-rights': {
      checked: ['client', 'licensed'],
      details: { reference: 'RIGHTS-101 · licence for the client’s video soundtrack' },
    },
    'distribution-method': { checked: ['pilot'], details: { channel: 'public' } },
    'monetization-price-schedule': {
      checked: ['digital'],
      details: { price: '0', currency: 'AUD', effective: '2026-12-01', end: '2027-12-01' },
    },
    'paid-apps-tax-banking': {
      checked: ['agreement', 'tax', 'banking'],
      details: { status: 'active', evidence: 'FIN-32', name: staff.owner, email: `finance@${domain}` },
    },
    'data-verification': {
      checked: ['inventory', 'sharing', 'retention', 'deletion'],
      details: {
        findings: 'Contact details go to the booking provider. Account deletion is available in Settings.',
        retention: 'Deleted accounts are removed from operational storage within 30 days.',
        proof: 'QA-104 · account and data test report',
      },
    },
    'build-tests': {
      checked: ['sdk', 'signin', 'deletion', 'permissions', 'tracking', 'health'],
      details: {
        'sdk-evidence': 'QA-104 · app dependency review',
        'signin-evidence': 'QA-105 · sign-in test',
        'deletion-evidence': 'QA-106 · Settings > Delete account',
        'permissions-evidence': 'QA-107 · HealthKit permission test',
        'tracking-evidence': 'QA-109 · analytics event inspection',
        'health-evidence': 'QA-110 · workout history and data access',
      },
    },
    'user-accounts-deletion': {
      checked: ['account', 'signin', 'guest', 'inApp'],
      details: { steps: 'Open Settings, select Account, then Delete account.', evidence: 'QA-106 · release build test' },
    },
    'social-login-siwa': { checked: ['password', 'apple'], other: 'Passkey sign-in' },
    'in-app-tracking-att': {
      checked: ['analytics'], details: { sdks: 'Example Analytics SDK', behaviour: 'Sends internal event totals.' },
    },
    'privacy-manifest': {
      checked: ['app', 'sdk', 'reasons'],
      details: {
        'app-evidence': 'App/PrivacyInfo.xcprivacy',
        'sdk-evidence': 'QA-104 · bundled SDK manifests',
        'reasons-evidence': 'QA-104 · approved API reasons reviewed',
      },
    },
    'listing-assets': {
      checked: ['copy', 'iphone', 'ipad', 'icon', 'preview', 'localised'],
      details: { package: 'STORE-120 · approved listing copy and all device assets' },
    },
    'eu-dsa': {
      checked: ['disclosure', 'contact', 'accessibility'],
      details: { status: 'trader', evidence: 'STORE-EU-12 · trader information and accessibility review' },
    },
    'china-compliance': {
      checked: ['filing', 'ai', 'security'],
      details: { filing: 'DEMO-FILING-120', declarations: 'STORE-CN-12 · filing and declaration references' },
    },
    'iap-subscriptions': {
      checked: ['durable'], details: { multiseat: 'disabled' },
      records: { 'Non-consumable purchase': [{
        'Reference name': 'Mobility pack', 'Product ID': 'test.example.mobility.pack', Price: '4.99',
        'Display name': 'Mobility Pack', Description: 'Unlock the extended mobility sessions.',
        'Review screenshot reference': 'STORE-120/Mobility-pack.png',
      }] },
    },
    'pre-order': { checked: ['enabled'], details: { start: '2026-11-28', end: '2026-12-01' } },
    'review-notes': { checked: ['seeded', 'attachment'], details: { notes: staff.reviewNotes } },
    'release-blockers': {
      checked: ['review'], records: { 'Reviewer access': [
        { Blocker: 'Demo account access verified on the release build.', Owner: staff.owner },
        { Blocker: 'Sample booking seeded for App Review.', Owner: staff.owner },
      ] },
    },
  };
  const notApplicable = new Set(['whats-new', 'routing-coverage']);
  const question = {
    text: 'Who checks the App Store page and support link at launch?',
    owner: staff.owner,
    stage: 'review',
  };
  return { stages, metadata, notApplicable, question, selections, structured };
}
