export function staffIntakeSample(client, staff) {
  const site = client.websiteUrl;
  const app = client.appName;
  const domain = new URL(site).hostname;
  const storefronts = 'Australia and New Zealand';
  const approvalDate = '2026-11-25';
  const stages = {
    kickoff: {
      owner: staff.owner,
      account: 'client_org',
      scope: `Public iPhone and iPad release in ${storefronts}. Free access. Client owns the content.`,
      legalEntity: client.legalName,
      enrolment: 'Active organisation',
      dunsStatus: 'Confirmed',
      dunsNumber: '000000000',
      accountHolder: `apple-owner@${domain}`,
      teamId: 'DEMO123456',
      usage: 'Use name and email for accounts and bookings. Optional Apple Health workouts stay on the device.',
      open: 'Client confirmed launch scope and device support at kickoff.',
    },
    build: {
      build: staff.releaseBuild,
      findings: 'Verified against release build',
      verification: 'Contact details go to the booking provider. Delete the account in Settings. Workout data stays on-device.',
      buildEvidence: 'QA-104 checked email sign-in, account deletion, HealthKit permissions and tracking settings.',
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
      listingAssets: 'STORE-120 · approved copy and iPhone/iPad screenshot sets',
      listing: true,
      age: true,
      disclosures: true,
      healthDeclarations: 'Completed',
    },
    review: {
      signin: 'Yes, demo login required',
      reviewTested: true,
      reviewEvidence: 'QA-108 · reviewer login and sample booking tested on the release build',
      notes: staff.reviewNotes,
      blockers: 'REL-108 · Support link and reviewer access tested. All blockers cleared.',
      blockersState: 'cleared',
      signoffOwner: staff.owner,
    },
  };

  const metadata = {
    'registration-country': 'Australia',
    'business-reg-number': 'Sample ABN 00 000 000 000',
    'target-devices': 'iPhone and iPad',
    'content-rights': 'Client owns the videos, app copy and brand assets. See RIGHTS-101.',
    'distribution-method': 'Public App Store release after TestFlight QA.',
    'monetization-price-schedule': 'Free ($0.00). No payments, digital unlocks or ads.',
    'user-accounts-deletion': 'Email sign-in is required for booking. Delete account under Settings > Account.',
    'in-app-tracking-att': 'No ads, cross-app tracking or advertising identifier.',
    'privacy-manifest': 'QA-104 verified PrivacyInfo.xcprivacy in the app and bundled SDKs.',
    'export-compliance': 'Uses standard HTTPS/TLS only. See build evidence QA-104.',
    'privacy-policy-url': `${site}/privacy`,
    'eula-terms': `Apple Standard EULA. Client terms published at ${site}/terms.`,
    'privacy-choices-url': `${site}/privacy-choices`,
    platforms: 'iOS and iPadOS',
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
    'pre-order': 'Pre-orders are out of scope for the first release.',
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
    availability: { checked: ['metadata-choice-availability-au', 'metadata-choice-availability-nz'] },
    'social-ugc-ai-features': { checked: ['metadata-choice-social-ugc-ai-features-none'] },
    'user-data-nutrition-labels': {
      checked: ['metadata-choice-user-data-nutrition-labels-contact'], other: 'Account identifiers.',
    },
    'purpose-strings': {
      checked: ['metadata-choice-purpose-strings-healthkit'],
      evidence: 'HealthKit · Use workout data to show your activity history.',
    },
  };

  const notApplicable = new Set([
    'paid-apps-tax-banking', 'social-login-siwa', 'eu-dsa', 'china-compliance',
    'whats-new', 'routing-coverage', 'iap-subscriptions',
  ]);
  const question = {
    text: 'Who checks the App Store page and support link at launch?',
    owner: staff.owner,
    stage: 'review',
  };
  return { stages, metadata, notApplicable, question, selections };
}
