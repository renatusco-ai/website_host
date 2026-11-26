// Field inventory shared by the App Store Connect reference and the Step 2 intake.
const APP_STORE_CONNECT_SECTIONS = [
  {
    id: 'client-business',
    title: 'Business and contact',
    path: 'Quick client intake',
    description: 'Tell Renatus who is behind the app and who to contact for kickoff.',
    fields: [
      {
        id: 'legal-business-name',
        name: 'Legal Business Name',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'required',
        limit: 'Max 200 characters',
        notes: 'Enter the registered business name.'
      },
      {
        id: 'brand-name',
        name: 'Trading or Brand Name',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'required',
        limit: 'Max 200 characters',
        notes: 'Use the same-name checkbox if the trading name matches the legal business name.'
      },
      {
        id: 'client-contact-name',
        name: 'Primary Contact Name',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'required',
        limit: 'Max 200 characters',
        notes: 'Renatus follows up with this person for kickoff.'
      },
      {
        id: 'client-contact-email',
        name: 'Contact Email',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'required',
        limit: 'Valid email address',
        notes: 'Used for follow-up and the optional confirmation receipt.'
      },
      {
        id: 'client-contact-phone',
        name: 'Contact Phone',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'required',
        limit: 'International phone number',
        notes: 'Choose a country code or enter the full number. The default country code is +61.'
      },
      {
        id: 'business-website-url',
        name: 'Business Website',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'optional',
        limit: 'HTTP or HTTPS URL',
        notes: 'Share your business website if you have one.'
      }
    ]
  },
  {
    id: 'client-brand',
    title: 'Brand',
    path: 'Quick client intake',
    description: 'Provide your logo or a shareable brand kit link and any colours you already use.',
    fields: [
      {
        id: 'brand-asset-uploads',
        name: 'Logo Files',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'optional',
        limit: 'Up to 10 files, 25 MB each, 100 MB total',
        notes: 'Upload PNG, SVG, JPG, JPEG, WebP, PDF, ZIP, EPS, TTF, OTF or WOFF2.'
      },
      {
        id: 'client-brand-kit',
        name: 'Brand Kit Link',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'optional',
        limit: 'HTTP or HTTPS URL',
        notes: 'Use a shareable link if your logo is already in a brand kit.'
      },
      {
        id: 'client-brand-colours',
        name: 'Brand Colours',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'optional',
        limit: 'Max 300 characters',
        notes: 'Enter hex codes or descriptions. Renatus follows up when brand details are incomplete.'
      }
    ]
  },
  {
    id: 'client-app-idea',
    title: 'App idea',
    path: 'Quick client intake',
    description: 'Give Renatus a working name and enough context to prepare for the kickoff call.',
    fields: [
      {
        id: 'app-name',
        name: 'Preferred App Name',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'required',
        limit: '2–30 characters',
        notes: 'Renatus confirms the final listing name later.'
      },
      {
        id: 'app-summary',
        name: 'Short Description',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'required',
        limit: 'Max 2,000 characters',
        notes: 'In two or three sentences, describe who the app is for and what they’ll do in it.'
      },
      {
        id: 'client-receipt',
        name: 'Email Me a Confirmation',
        source: 'intake',
        sourceLabel: 'Client form',
        req: 'optional',
        limit: 'Checked by default',
        notes: 'The form displays a reference and next steps after the intake is saved.'
      }
    ]
  },
  {
    id: 'business-developer-account',
    title: 'Business Entity & Apple Developer Account',
    path: 'Apple Developer Portal',
    description: 'Legal entity verification, regulated-industry boundaries, and Apple Developer Organization enrollment completed before App Store Connect submission.',
    fields: [
      {
        id: 'registration-country',
        name: 'Country / Region of Registration',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'required',
        limit: 'Max 100 characters (Default: Australia)',
        meta: 'Legal jurisdiction',
        notes: 'Country where the legal business entity is registered. Determines tax treaty, currency, and regional compliance obligations.'
      },
      {
        id: 'business-reg-number',
        name: 'Business Registration Number (ABN / ACN / EIN)',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'optional',
        limit: 'Max 80 characters',
        meta: 'Own account / Paid apps',
        notes: 'Needed when enrolling in an Organization Apple Developer account, completing D-U-N-S verification, or lodging Apple tax forms.'
      },
      {
        id: 'regulated-industries',
        name: 'Regulated Industry & Special System Features',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'required',
        limit: 'Multi-select (default: None of these): Healthcare/medical, Banking/finance/lending, Crypto/trading, Real-money gaming/gambling, Cannabis, Air travel, VPN, MDM, or None',
        meta: 'Guidelines 5.1.1(ix), 3.2.2(ix), 5.3–5.5',
        notes: 'Any regulated industry or clinical medical app requires publishing under the regulated legal entity’s own Organization Apple Developer account (Blocker if not active Org), plus licensing, geo-restrictions, <code>NEVPNManager</code> (VPN), or Apple-granted MDM entitlements.'
      },
      {
        id: 'publishing-account',
        name: 'Publishing Account',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'required',
        limit: 'Own Apple Developer Account, Renatus Account, or Not sure yet',
        meta: 'Guidelines 4.2.6 & 5.2',
        notes: 'Standalone public client-branded launches under a third-party/agency account risk Guideline 4.2.6 (template/reseller) and 5.2 (IP) rejection unless written brand authorization and eligibility are confirmed. TestFlight pilots can use Renatus’s account.'
      },
      {
        id: 'org-enrollment-status',
        name: 'Apple Developer Organization Enrollment Status',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'conditional',
        limit: 'Already enrolled as Organization / Personal account (needs migration) / Not enrolled yet',
        meta: 'Confirm for client-owned publishing accounts',
        notes: 'New Organization enrollment and verification take 2–6 weeks (individual-to-organization migrations can take 60+ days; Blocker if not yet active Org). Account Holder must also accept the latest Apple Developer Program License Agreement (ADPLA, e.g., 13 Oct 2026).'
      },
      {
        id: 'account-holder-team-duns',
        name: 'Apple Account Holder Email, Team ID & D-U-N-S Number',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'optional',
        limit: 'Valid email · Team ID (max 40 chars) · 9-digit D-U-N-S (max 40 chars)',
        meta: 'Confirm for client-owned publishing accounts',
        notes: 'D-U-N-S (free 9-digit Dun &amp; Bradstreet ID) is required by Apple to verify organizations. Account Holder email and Team ID are used to verify active membership and invite engineering to App Store Connect.'
      }
    ]
  },
  {
    id: 'new-app-record',
    title: 'New App Record',
    path: 'App Store Connect → Apps → + → New App',
    description: 'Initial App Store Connect record created once per app. Bundle ID and SKU are immutable after creation; all other metadata screens unlock immediately after creating this record.',
    fields: [
      {
        id: 'platforms',
        name: 'Platforms',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Select iOS (plus iPadOS / visionOS if applicable)',
        meta: 'Immutable',
        notes: 'Choose iOS for iPhone and iPad apps. Additional platforms can be added later as separate platform versions.'
      },
      {
        id: 'target-devices',
        name: 'Target Devices',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'required',
        limit: 'iPhone only or iPhone & iPad',
        meta: 'Xcode & Screenshots',
        notes: 'Determines Xcode targeted device family and whether mandatory iPad screenshots (13" display) must be supplied in App Store Connect.'
      },
      {
        id: 'store-app-name',
        name: 'Final App Store Name',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: '2–30 characters',
        notes: 'Confirm the preferred name and its availability in the primary language before creating the listing.'
      },
      {
        id: 'primary-language',
        name: 'Primary App Store Language / Locale',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'English (Australia), English (U.S.), English (U.K.), Other',
        meta: 'App-level',
        notes: 'Fallback storefront language whenever a user’s region does not have a dedicated localization.'
      },
      {
        id: 'bundle-id',
        name: 'Bundle ID',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Reverse-DNS string (e.g., com.company.appname)',
        meta: 'Immutable',
        notes: 'Must match the exact Bundle Identifier in Xcode and be pre-registered in Apple Developer → Certificates, Identifiers & Profiles → Identifiers.'
      },
      {
        id: 'sku',
        name: 'SKU',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Up to 100 alphanumeric chars, hyphens, periods, underscores',
        meta: 'Immutable · Internal only',
        notes: 'Unique internal identifier for reporting and sales logs. Never visible to App Store customers.'
      },
      {
        id: 'user-access',
        name: 'User Access',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Full Access or Limited Access',
        meta: 'Team permissions',
        notes: 'Controls whether all team members in App Store Connect can view and manage this app.'
      }
    ]
  },
  {
    id: 'app-information',
    title: 'App Information, Age Rating & Regional Disclosures',
    path: 'General → App Information',
    description: 'App-wide metadata shared across versions, including app utility, categorization, standardized 2026 age rating bands, Kids Category, IP rights, and regional filings.',
    fields: [
      {
        id: 'subtitle',
        name: 'Subtitle',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'optional',
        limit: 'Max 30 characters · Can finalize during build',
        meta: 'Editable per version',
        notes: 'Short tagline displayed directly below the app name on the App Store. Draft the subtitle from the verified app features.'
      },
      {
        id: 'primary-category',
        name: 'Primary Category',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Health &amp; Fitness, Lifestyle, Business, Education, Sports, Medical, Finance, Social Networking, Food &amp; Drink, Productivity, Other',
        meta: 'Editable per version',
        notes: 'Determines which App Store chart and browse section your app appears in. Games require a subcategory.'
      },
      {
        id: 'secondary-category',
        name: 'Secondary Category',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'optional',
        limit: '1 additional category',
        meta: 'Editable per version',
        notes: 'Optional secondary browse category if the app spans two domains.'
      },
      {
        id: 'age-rating',
        name: 'Age Rating Questionnaire',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: '2026 bands: 4+, 9+, 13+, 16+, 18+',
        meta: 'Editable per version',
        notes: 'Final rating is generated by Apple’s Age Rating Questionnaire. Social Media enforces minimum <code>13+</code> (Guideline 2.3.6); Dating &amp; Relationships enforces minimum <code>18+</code> (Nov 2026). <code>18+</code> apps face download gating in Australia, Brazil, and Singapore (Feb 2026) and UK Online Safety Act Highly Effective Age Assurance.'
      },
      {
        id: 'kids-category',
        name: 'Made for Kids (Kids Category)',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'No / Yes (5 &amp; Under, 6–8, or 9–11) / Not sure yet',
        meta: 'Guidelines 1.3 &amp; 5.1.4',
        notes: 'Enforces strict Kids Category rules: parental gates on all exits and purchases, zero third-party ad/analytics SDKs or IDFA (Blocker if combined with ad tracking), COPPA Verifiable Parental Consent if collecting data, EU DMA ban on out-of-app website purchases, and UK Children’s Code defaults.'
      },
      {
        id: 'content-rights',
        name: 'Content Rights & Third-Party IP',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'required',
        limit: 'Owned by us / Includes third-party licensed content (written permission) / Not sure yet',
        meta: 'Guideline 5.2',
        notes: 'Declare whether the app contains, shows, or accesses third-party content and maintain written proof of IP/licensing rights for App Store Connect.'
      },
      {
        id: 'eula-terms',
        name: 'License Agreement (EULA) & Terms of Service URL',
        source: 'renatus',
        sourceLabel: 'Legal approval',
        req: 'conditional',
        limit: 'Apple Standard EULA or custom live http:// / https:// URL',
        meta: 'Guidelines 3.1.2 &amp; 1.2',
        notes: 'Draft terms for client approval. The license defaults to Apple’s Standard EULA in App Store Connect. A live Terms of Service / EULA URL is strictly mandatory (Blocker if missing) both in-app and in metadata for auto-renewable subscriptions (3.1.2) and user-generated content (zero-tolerance EULA, 1.2).'
      },
      {
        id: 'eu-dsa',
        name: 'EU Digital Services Act (DSA) & EU Compliance',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'conditional',
        limit: 'Trader vs. Non-Trader + verified address, phone, email + EAA WCAG 2.1 AA',
        meta: 'Blocker if distributing in EU / Worldwide',
        notes: 'Missing DSA Trader Status removes the app from EU storefronts. Requires EAA WCAG 2.1 AA / EN 301 549 accessibility info, plus conditional EU AI Act (Art. 4/5/50 notices &amp; markings), GDPR Art. 9 explicit health consent, EU alternative ATT prompt (DE/FR/IT/PL/RO on iOS 27.2+), and EU DMA Attachment 14 (disclosure sheet, 12-month lock-in, monthly reporting) for external digital purchases.'
      },
      {
        id: 'china-compliance',
        name: 'China Mainland MIIT Filing & App Compliance',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'conditional',
        limit: 'MIIT ICP filing (local Chinese entity) + AI/Security declarations',
        meta: 'Blocker if distributing in China / Worldwide',
        notes: 'Requires MIIT app filing under a local Chinese entity (plus Banhao license for games) and mandatory App Store Connect App Compliance declarations (AI-Generated/Synthetic Content &amp; Security Assessment, required even if No; existing apps deadline 31 Jan 2027). External AI references (ChatGPT/Gemini) trigger regional rejection.'
      }
    ]
  },
  {
    id: 'brand-visuals-media',
    title: 'Brand Identity, Icon & Storefront Visuals',
    path: 'iOS App Version → Previews and Screenshots',
    description: 'Client brand assets supplied by the client and final App Store visual assets prepared for Xcode and the product page.',
    fields: [
      {
        id: 'icon-background',
        name: 'App Icon Background',
        source: 'renatus',
        sourceLabel: 'Build verification',
        req: 'optional',
        limit: 'Choose an opaque background appropriate for the brand',
        notes: 'Use the supplied colours and logo when preparing the app icon.'
      },
      {
        id: 'brand-fonts',
        name: 'Brand Fonts & Font License Status',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'optional',
        limit: 'Font names (max 200 chars) · License: Free / Google Font, Paid license owned, or Not sure',
        meta: 'IP / Mobile embedding',
        notes: 'Verifies whether custom brand typography can be legally embedded inside the iOS app binary.'
      },
      {
        id: 'app-icon',
        name: 'App Icon (Compiled Asset)',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: '1024 × 1024 px · PNG · No transparency · sRGB / Display P3',
        meta: 'Bundled in Xcode build',
        notes: 'Supplied inside the app binary’s Asset Catalog (not uploaded manually in the web UI). Apple applies rounded corners automatically.'
      },
      {
        id: 'iphone-screenshots',
        name: 'iPhone Screenshots',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: '1–10 images · 6.9" (1320×2868 or 1290×2796 px) · JPG or 24-bit PNG (no alpha)',
        meta: 'Per localization',
        notes: 'At least one 6.9" (or 6.5") iPhone screenshot set is mandatory; Apple scales down automatically for smaller iPhones unless custom sizes are uploaded.'
      },
      {
        id: 'ipad-screenshots',
        name: 'iPad Screenshots',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'conditional',
        limit: '1–10 images · 13" (2064×2752 or 2048×2732 px) · JPG or 24-bit PNG',
        meta: 'If iPad is supported',
        notes: 'Required whenever the release targets iPad and the Xcode build supports iPad. Not required for iPhone-only apps.'
      },
      {
        id: 'app-previews',
        name: 'App Preview Videos',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'optional',
        limit: 'Up to 3 videos · 15–30 sec · H.264/ProRes · Max 500 MB',
        meta: 'Per device size',
        notes: 'Short footage captured directly from the app UI. Must match target device resolution and frame rate (up to 30 fps).'
      }
    ]
  },
  {
    id: 'version-metadata',
    title: 'iOS App Version Metadata & Release',
    path: 'iOS App Version → General & Localized Info',
    description: 'Localized store listing copy, support links, build attachment, copyright, and release scheduling for the submitted version.',
    fields: [
      {
        id: 'promotional-text',
        name: 'Promotional Text',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'optional',
        limit: 'Max 170 characters · Can finalize during build',
        meta: 'Editable anytime',
        notes: 'Appears above the description and can be updated anytime without submitting a new build.'
      },
      {
        id: 'description',
        name: 'App Store Description',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Max 4,000 characters · Plain text only',
        meta: 'Required in App Store Connect',
        notes: 'Draft from the features in the release build. Use plain text.'
      },
      {
        id: 'keywords',
        name: 'Search Keywords',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Max 100 bytes · Comma-separated',
        meta: 'Can finalize during build',
        notes: 'Choose relevant search terms and avoid repeating the app name.'
      },
      {
        id: 'support-url',
        name: 'Support URL',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Valid, live http:// or https:// URL',
        meta: 'Guideline 1.5',
        notes: 'Mandatory in App Store Connect. Must resolve to an active webpage where users can contact your team (e.g., website /contact or /support page).'
      },
      {
        id: 'support-email',
        name: 'Public Support Email',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Valid monitored email address',
        meta: 'Support & legal pages',
        notes: 'Displayed on your App Store support page, Privacy Policy, and legal notices so users can reach support directly.'
      },
      {
        id: 'marketing-url',
        name: 'Marketing URL',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'optional',
        limit: 'Valid https:// URL',
        meta: 'Editable per version',
        notes: 'Public product or company homepage linked from the App Store listing (may use the business website from the quick form).'
      },
      {
        id: 'whats-new',
        name: 'What’s New in This Version',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'conditional',
        limit: 'Max 4,000 characters',
        meta: 'Updates only (v1.1+)',
        notes: 'Required for all subsequent version updates. Not shown or required on the initial v1.0 submission.'
      },
      {
        id: 'version-number',
        name: 'Version Number',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Semantic string (e.g., 1.0 or 1.0.0)',
        meta: 'Matches Info.plist',
        notes: 'Must match <code>CFBundleShortVersionString</code> in the attached iOS build.'
      },
      {
        id: 'copyright',
        name: 'Copyright',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Year + legal owner (e.g., © 2026 Company Pty Ltd)',
        meta: 'Confirm the rights holder and legal name',
        notes: 'Legal entity owning exclusive rights to the app, preceded by the year rights were obtained.'
      },
      {
        id: 'build',
        name: 'Build',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Signed .ipa uploaded via Xcode / Transporter',
        meta: 'Processed binary',
        notes: 'Must be compiled with the current required Xcode/iOS SDK, pass App Store Connect processing, and include valid icons and Info.plist keys.'
      },
      {
        id: 'release-option-launch-window',
        name: 'Version Release Option & Target Launch Window',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Confirm the launch window and choose manual, automatic or scheduled release.',
        meta: 'Launch control',
        notes: 'Choose whether the app goes live immediately upon approval, manually, or on a scheduled date. Align with Apple Organization enrollment lead time (2–6 weeks if needed).'
      },
      {
        id: 'routing-coverage',
        name: 'Routing App Coverage File',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'conditional',
        limit: 'Single .geojson file',
        meta: 'Maps routing apps only',
        notes: 'Only required if the app registers as a turn-by-turn or transit routing provider for Apple Maps.'
      }
    ]
  },
  {
    id: 'app-review-accounts',
    title: 'App Review Information & User Accounts',
    path: 'iOS App Version → App Review Information',
    description: 'Reviewer contact details, demo credentials, account deletion rules, Sign in with Apple, and submission notes.',
    fields: [
      {
        id: 'review-contact-name',
        name: 'App Review Contact Name',
        source: 'renatus',
        sourceLabel: 'App Review',
        req: 'required',
        limit: 'First & Last Name (max 200 chars)',
        meta: 'Internal to Apple',
        notes: 'Person Apple App Review should contact if clarification is needed during review.'
      },
      {
        id: 'review-contact-phone',
        name: 'App Review Contact Phone Number',
        source: 'renatus',
        sourceLabel: 'App Review',
        req: 'required',
        limit: 'Strict international E.164 (<code>/^\\+[1-9]\\d{6,14}$/</code>, e.g., +61412345678)',
        meta: 'Country code mandatory (Aug 2026)',
        notes: 'App Store Connect requires international E.164 format with country code (enforced since 19 Aug 2026). Confirm the number of the designated reviewer contact.'
      },
      {
        id: 'review-contact-email',
        name: 'App Review Contact Email',
        source: 'renatus',
        sourceLabel: 'App Review',
        req: 'required',
        limit: 'Valid monitored email address',
        meta: 'App Review contact',
        notes: 'Receives App Review status notifications and Resolution Center correspondence. Confirm who will receive reviewer correspondence during submission preparation.'
      },
      {
        id: 'user-accounts-deletion',
        name: 'User Accounts, Optional Browsing & In-App Deletion',
        source: 'renatus',
        sourceLabel: 'Build verification',
        req: 'required',
        limit: 'Yes / No / Not sure yet',
        meta: 'Guideline 5.1.1(v)',
        notes: 'If users create accounts, the app must allow permanent account and data deletion directly inside the app and allow browsing non-core features without login wherever possible.'
      },
      {
        id: 'demo-account',
        name: 'Sign-In Required & Demo Account Credentials',
        source: 'renatus',
        sourceLabel: 'App Review',
        req: 'conditional',
        limit: 'Active username + password (no 2FA/SMS wall)',
        meta: 'Guideline 2.1 · If accounts = Yes',
        notes: 'Mandatory if any part of the app requires sign-in. Credentials must stay active throughout review and grant full feature access without 2FA blockers.'
      },
      {
        id: 'social-login-siwa',
        name: 'Social Login & Sign in with Apple',
        source: 'renatus',
        sourceLabel: 'Build verification',
        req: 'conditional',
        limit: 'Confirm which sign-in options the release build offers.',
        meta: 'Guideline 4.8',
        notes: 'Whenever third-party social login (e.g., Google, Facebook) is offered, Sign in with Apple is mandatory and must support both <code>privaterelay.appleid.com</code> and <code>private.icloud.com</code>.'
      },
      {
        id: 'review-notes',
        name: 'App Review Notes',
        source: 'renatus',
        sourceLabel: 'App Review',
        req: 'optional',
        limit: 'Max 4,000 characters',
        meta: 'Recommended',
        notes: 'Explain non-obvious workflows, existing booking systems, beta tester lists, test payment steps, hardware dependencies, or compliance context.'
      },
      {
        id: 'review-attachment',
        name: 'Review Attachment',
        source: 'renatus',
        sourceLabel: 'App Review',
        req: 'optional',
        limit: 'Up to 500 MB (PDF, video, image)',
        meta: 'Optional proof',
        notes: 'Attach a demo video for hardware/IoT integrations or written brand/IP authorization letters when publishing for a client.'
      }
    ]
  },
  {
    id: 'app-privacy-safety',
    title: 'App Privacy, Health, Social, AI & Tracking',
    path: 'Trust & Safety → App Privacy',
    description: 'Mandatory privacy policy links, nutrition labels, health/medical boundaries, 2026 social/AI safety disclosures, and tracking permissions.',
    fields: [
      {
        id: 'privacy-policy-url',
        name: 'Privacy Policy URL',
        source: 'renatus',
        sourceLabel: 'Legal approval',
        req: 'required',
        limit: 'Valid live http:// or https:// URL',
        meta: 'Guideline 5.1.1(i) · Store + In-App',
        notes: 'Draft the policy from verified data use and obtain client approval. Required for every app (even if zero personal data is collected). Must be linked both in App Store Connect and accessible inside the app.'
      },
      {
        id: 'privacy-choices-url',
        name: 'User Privacy Choices URL',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'optional',
        limit: 'Valid https:// URL',
        meta: 'Self-service data control',
        notes: 'Optional link where users can manage privacy preferences or request data/account deletion.'
      },
      {
        id: 'user-data-nutrition-labels',
        name: 'User Data Collected & App Privacy Nutrition Labels',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'required',
        limit: 'Contact info, Health & fitness, Payment/purchase history, Photos/videos/UGC, Location, Analytics/crash reports, None, or Not sure yet',
        meta: '14 ASC categories × SDK audit',
        notes: 'Declare all data collected by the app and every embedded third-party SDK, classified into Data Used to Track You, Data Linked to You, Data Not Linked to You, or Data Not Collected.'
      },
      {
        id: 'health-fitness-medical',
        name: 'Health, Fitness & Medical Involvement',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; build verification',
        req: 'required',
        limit: 'General fitness/mobility, Apple Health/Watch (HealthKit), Biometric/injury/medical data, Medical advice/diagnosis/clinical treatment, or None',
        meta: 'Guidelines 1.4.1, 5.1.2(vi), 5.1.3',
        notes: 'Health/HealthKit apps require validated disclaimers (1.4.1), specific HealthKit purpose strings, and zero use of health data for ads, marketing, or data mining. Clinical/medical advice requires publishing under the regulated entity’s own Organization account.'
      },
      {
        id: 'social-ugc-ai-features',
        name: 'Social, Community, UGC, AI, Live Location & Dating',
        source: 'renatus',
        sourceLabel: 'Build verification',
        req: 'required',
        limit: 'Social feed/profiles/messaging, UGC posts/comments/media, AI assistant/generated content, Live location sharing, Dating/relationships, or None',
        meta: 'Guidelines 1.2, 1.2.1(a), 2.3.6, 5.1.2(i)',
        notes: 'Triggers mandatory Social Media declaration (2.3.6 min 13+, AU under-16 age assurance, UK HEAA, US Declared Age Range + <code>RESCIND_CONSENT</code>); UGC moderation, report/block, 24h removal &amp; creator age gating (1.2, 1.2.1(a), US NCMEC 1-yr); third-party AI consent modal naming provider &amp; data types (5.1.2(i)) + Oct 2026 1.2 AI intimate-imagery safeguards; Nov 2026 Shared Location &amp; Dating descriptors.'
      },
      {
        id: 'in-app-tracking-att',
        name: 'In-App Advertising & Cross-App Tracking (ATT)',
        source: 'renatus',
        sourceLabel: 'Build verification',
        req: 'required',
        limit: 'No ads/tracking, Basic internal analytics only, In-app ad networks/cross-app tracking, or Not sure yet',
        meta: 'Guideline 5.1.2(i) · Prohibited with Kids/Health',
        notes: 'Cross-app tracking requires Apple’s App Tracking Transparency (ATT) prompt before tracking. Strictly prohibited when combined with Kids Category or Health/HealthKit data. External business ads (Instagram/Google) do not count.'
      },
      {
        id: 'privacy-manifest',
        name: 'Privacy Manifest (PrivacyInfo.xcprivacy)',
        source: 'renatus',
        sourceLabel: 'Build verification',
        req: 'conditional',
        limit: 'XML plist bundled in binary & third-party SDKs',
        meta: 'Required Reason APIs',
        notes: 'Required in the Xcode build whenever the app or third-party SDKs call Apple’s Required Reason APIs (e.g., UserDefaults, file timestamps, disk space) or perform tracking; must match App Privacy labels.'
      }
    ]
  },
  {
    id: 'pricing-availability-monetization',
    title: 'Pricing, Distribution & Monetization',
    path: 'Monetization → Pricing and Availability / IAP',
    description: 'Distribution channel, storefront availability, monetization rules, Apple Paid Apps financial lodging, and In-App Purchase setup.',
    fields: [
      {
        id: 'distribution-method',
        name: 'Distribution Goal / Method',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'required',
        limit: 'Confirm public, TestFlight pilot, unlisted or eligible private distribution.',
        meta: 'Visibility',
        notes: 'Apple rejects trials and beta apps on the public App Store—use TestFlight for pilots. Unlisted apps require a separate Apple request and are downloadable only via direct link. Private (Apple Business Manager) is configured directly in App Store Connect.'
      },
      {
        id: 'availability',
        name: 'Target Countries / Regions (Storefront Availability)',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'required',
        limit: 'Australia, New Zealand, US, UK, European Union, China Mainland, Worldwide (all 175 storefronts)',
        meta: 'Triggers regional rules &amp; OFAC',
        notes: 'Selecting EU triggers DSA/EAA; China triggers MIIT/ICP; UK triggers Online Safety Act rules; Worldwide requires excluding OFAC embargoed territories.'
      },
      {
        id: 'monetization-price-schedule',
        name: 'Monetization Model & Base Price Schedule',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'required',
        limit: 'Free ($0.00), One-time paid, Digital unlocks/IAP, Recurring subscriptions, In-person/physical goods (external Stripe — NOT IAP), External digital memberships, or Not sure yet',
        meta: 'Guidelines 3.1.1, 3.1.3, 3.1.5(a)',
        notes: 'In-person classes/coaching/physical goods use external billing (3.1.5(a)). No-entitlement external digital links are a US-storefront-only carve-out (3.1.1; Blocker if external digital billing is used outside the US): outside the US, digital access requires StoreKit IAP, a 3.1.3 Reader/Multiplatform/Enterprise exemption, or EU DMA Attachment 14 (disclosure sheet, 12-month lock-in, monthly reporting).'
      },
      {
        id: 'paid-apps-tax-banking',
        name: 'Paid Apps Agreement, Tax, Banking & Finance Contact',
        source: 'renatus',
        sourceLabel: 'Kickoff &amp; account setup',
        req: 'conditional',
        limit: 'Status: Already active / Ready to complete 1:1 / Need advice · Optional Finance Contact Name (200 chars) &amp; Email',
        meta: 'Paid Apps Status: paid/IAP/subscriptions · Finance Contact: also shown for external digital',
        notes: 'Paid downloads, IAP, and subscriptions require signing Apple’s Paid Apps Agreement, tax forms (W-8BEN/W-9), and verified banking in App Store Connect → Business (Blocker if not already active). Finance/Billing contact is optional and also shown for external digital memberships. Never collect raw bank or tax numbers on a public form—complete 1:1.'
      },
      {
        id: 'iap-subscriptions',
        name: 'In-App Purchases, Subscriptions & Multiseat Settings',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'conditional',
        limit: 'Reference Name, Product ID, Price, Display Name, Description, Review Screenshot',
        meta: 'Aug 2026 & Oct 2026 rules',
        notes: 'First IAP or subscription of each type must submit with a new app version (Aug 2026 rule). Implement Restore Purchases for non-consumables (3.1.1) and subscriptions (3.1.2). Review default-on Multiseat/Volume Purchasing (Oct 2026) if seat-sharing breaks pricing.'
      },
      {
        id: 'pre-order',
        name: 'Pre-Order Window',
        source: 'renatus',
        sourceLabel: 'App Store Connect',
        req: 'optional',
        limit: '2 to 180 days before release date',
        meta: 'Optional launch mode',
        notes: 'Allows customers to view the product page and order the app before it becomes available to download.'
      }
    ]
  },
  {
    id: 'compliance-binary',
    title: 'Export Compliance & Binary Info.plist Declarations',
    path: 'Build Processing & Info.plist',
    description: 'Encryption classification and binary permission strings verified when uploading the Xcode build.',
    fields: [
      {
        id: 'export-compliance',
        name: 'Data Security / Encryption & Export Compliance',
        source: 'renatus',
        sourceLabel: 'Build verification',
        req: 'required',
        limit: 'Standard HTTPS/TLS (default, exempt) / Custom or proprietary encryption / Not sure',
        meta: 'ITSAppUsesNonExemptEncryption + France ANSSI',
        notes: 'Verify the encryption used by the release build before upload. Set <code>ITSAppUsesNonExemptEncryption</code> to <code>NO</code> if the app only uses standard Apple OS HTTPS/TLS encryption. Custom/proprietary encryption requires export compliance docs (and France ANSSI declaration if shipping to France/EU).'
      },
      {
        id: 'purpose-strings',
        name: 'Info.plist Permission Purpose Strings',
        source: 'renatus',
        sourceLabel: 'Build verification',
        req: 'conditional',
        limit: 'Clear, specific user-facing strings per protected capability',
        meta: 'Binary requirement',
        notes: 'Required for every protected API used (e.g., <code>NSCameraUsageDescription</code>, <code>NSLocationWhenInUseUsageDescription</code>, <code>NSHealthShareUsageDescription</code>, <code>NSUserTrackingUsageDescription</code>).'
      }
    ]
  }
];
