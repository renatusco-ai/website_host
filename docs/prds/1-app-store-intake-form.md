# PRD: Standalone iOS App Store Client Intake Form

**Status:** Approved (Council 10/10 — 3 Rounds; Fact-Verified against Apple App Store Guidelines, `.agent/app-store-compliance`, and `website_host`)\
**Target Repo:** `website_host` (feature branch, e.g., `feature/app-store-intake`)\
**Target Route:** `/app-store-intake` (unlisted, `noindex, nofollow`)\
**Reference Persona (Blank Business):** The Mobility Collective (`TMC` — `https://www.themobilitycollective.com` + `tmc-branding/`)

---

## 1. Problem & Goal

Renatus builds full-stack client apps quickly, but getting a **blank business** (a client with no existing app repo, no App Store Connect setup, and often only a website and brand kit) ready for Apple App Store submission is heavily manual and prone to back-and-forth.

**Goal:** Build a standalone, unlisted intake form page in `website_host` that Shaun can share via direct link with any new client. The form collects every business, legal, compliance, health, AI/social, financial-readiness, and brand detail required for iOS App Store submission upfront—in plain English, clearly separating **what is needed now** from **what can wait until the app is built**—stores submissions and uploaded brand assets securely in Supabase, and alerts Shaun via Resend with an automated **App Store Readiness & Gap Summary**.

---

## 2. Scope

### In Scope (v1)
- Unlisted standalone page at `/app-store-intake` inside `website_host` (zero links anywhere in `Navbar`, `Footer`, `PAGES` in `src/data/seo.js`, or sitemaps).
- Minimal Renatus-branded shell using `website_host`'s actual design tokens (`--color-canvas: #ffffff`, `--color-cloud: #edeff7`, `--color-forest: #126656`, `--color-spring: #00e093`, `--font-display` / `--font-body`: `Geist` from `src/index.css` & `index.html`)—no main site `Navbar`, `Footer`, `MobileEnquireBar`, or `PageTransition`.
- **Apple App Store (iOS) only** for v1.
- 7-step sectioned wizard with clickable progress navigation, plain-English client guidance, `"Not sure yet — Renatus to advise"` fallbacks on pre-build technical questions, and `localStorage` draft auto-save (including `sessionId` and uploaded asset metadata, excluding honeypot).
- Direct multi-file upload to a private **Supabase Storage** bucket via server-signed upload URLs, plus optional folder URL fallback and file removal.
- Persistent storage of structured intake records and serverless rate-limit counters in **Supabase Postgres**.
- Automated **Readiness & Gap Summary** shown on the confirmation screen and emailed to Shaun via **Resend** (with a safe, spam-hardened optional client confirmation receipt).
- Anti-abuse protections for an unauthenticated public endpoint (honeypot, Postgres-backed IP & email rate limiting, strict bucket + server MIME/size/cumulative-cap enforcement, and optional Cloudflare Turnstile support).

### Out of Scope (v1)
- Google Play / Android store requirements (deferred to v2).
- Client authentication / login portal or editable post-submission dashboard.
- Collecting raw bank account numbers, BSB/SWIFT codes, or tax IDs (TFN/EIN/W-8BEN-E) directly on the public form.
- Building or submitting the TMC iOS app itself (tracked separately).

---

## 3. UX & Page Shell Requirements

- **Routing & Layout (`src/App.jsx`):**
  - Refactor `src/App.jsx` to use React Router v7 nested layout routes: marketing pages live under `<Route element={<Layout />}>` (keeping `Navbar`, `Footer`, `MobileEnquireBar`, `PageTransition`), while `/app-store-intake` mounts under a dedicated `<StandaloneLayout>` (Renatus wordmark/emblem header only, no site navigation links, no `PageTransition`).
- **Search Engine & Crawler Exclusion (Pre-JS + Post-JS):**
  - Keep `/app-store-intake` out of `PAGES` in `src/data/seo.js`, navigation menus, and sitemaps.
  - Add a Vercel HTTP header rule in `vercel.json` for `/app-store-intake`: `X-Robots-Tag: noindex, nofollow`.
  - Extend `scripts/write-route-html.mjs` to emit a static `dist/app-store-intake.html` (outside `PAGES`) with `<meta name="robots" content="noindex, nofollow" />`, `<title>iOS App Store Onboarding Intake | Renatus</title>`, and the homepage `<link rel="canonical">` removed.
  - Update `src/components/PageMeta.jsx` so unlisted routes explicitly set `meta[name="robots"]` to `noindex, nofollow` (and public `PAGES` set `index, follow`) instead of returning early on `!page`.
- **Plain-English Copy Rule:**
  - **Client-facing UI:** Use everyday business language. Never expose raw Apple Guideline numbers (`5.1.1(v)`, `3.1.5(a)`), Xcode/iOS terms (`PrivacyInfo.xcprivacy`, `ATT`, `E.164`, `privaterelay.appleid.com`), or foreign regulator acronyms (`France ANSSI`, `NCMEC`) in primary client labels.
  - **Internal Output (Shaun's Email & Postgres `gaps[]`):** Include exact Apple Guideline citations, 2026 compliance rules, and engineering notes so Renatus can act immediately.
- **Navigation & Draft Persistence:**
  - Top step indicator showing all 7 steps with completion state; users can jump back to visited steps or use **Back / Next**.
  - Auto-save form answers, `sessionId` (UUIDv4), and uploaded `assets[]` metadata to `localStorage` (`renatus_ios_intake_v1`) so refreshing mid-form preserves both text and uploaded files; explicitly **exclude** the honeypot field from `localStorage`. Provide a **Clear draft** button and clear `localStorage` on successful submission.
- **Upfront vs. Later Clarity:** Every field or section displays a clear badge (`Needed now` vs. `Optional — can finalize during build`) and a plain-English helper note explaining *why Apple asks for it* and *what steps are involved*.

---

## 4. Form Structure & Field Specification (7 Steps)

### Step 1 — Business & Legal Entity
*Purpose: Establish business ownership, App Review contact details, regulated-industry status, and the compliant Apple Developer publishing path.*
- **Legal Business Name** *(required, `Needed now`)* — Helper: "Registered entity name (e.g., Pty Ltd or sole trader). Apple uses this for legal verification."
- **Trading / Brand Name** *(required, `Needed now`)* — e.g., *The Mobility Collective*.
- **Primary Contact Name** *(required, `Needed now`)*
- **Primary Contact Email** *(required, `Needed now`)* — Also used for optional confirmation receipt.
- **Mobile / Phone** *(required, `Needed now`)* — Country-code selector (default `+61` Australia) + number input. UI auto-normalizes local numbers (e.g., `0412 345 678` -> `+61412345678`); server strips formatting and validates strict E.164 (`^\+[1-9]\d{6,14}$`). *(Internal note: Apple App Store Connect requires international format with country code since 19 Aug 2026.)*
- **Business Website URL** *(required, `Needed now`)* — e.g., `https://www.themobilitycollective.com`.
- **Country / Region of Registration** *(required, default: Australia)*
- **Business Registration Number (ABN / ACN / EIN)** *(optional, `Needed if publishing under own account or paid app`)*
- **Does your app operate in a regulated industry or provide special system features?** *(required, multi-select, default: None of these)*:
  - `Clinical healthcare, medical diagnosis, or treatment`
  - `Banking, finance, lending, or investments`
  - `Cryptocurrency or financial trading`
  - `Real-money gaming or gambling`
  - `Cannabis`
  - `Air travel`
  - `VPN / private networking`
  - `Mobile Device Management (MDM)`
  - `None of these`
- **Publishing Account Preference** *(required, single choice)*:
  - `Use Renatus's Apple Developer account (fastest for TestFlight pilots; public App Store launches require brand authorization and Apple eligibility review)`
  - `Use our own Apple Developer account (recommended for standalone public apps; required for regulated industries)`
  - `Not sure yet — Renatus to advise`
  - *Conditional block when `Own Apple Developer account` is selected:*
    - **Apple Developer Enrollment Status** *(required when Own Account)*: `Already enrolled as an Organization` / `Have a Personal/Individual account (needs migration)` / `Not enrolled yet`
    - **Apple Account Holder Email** *(optional — needed to invite Renatus to App Store Connect)*
    - **Apple Developer Team ID** *(optional)*
    - **D-U-N-S Number** *(optional)* — Helper: "A free 9-digit business ID from Dun & Bradstreet used by Apple to verify organizations. Apple organization enrollment and identity verification currently take 2–6 weeks (individual-to-organization migrations can take up to 60+ days), so start at least 6 weeks before launch."

### Step 2 — App Concept, Distribution & Draft Store Metadata
*Purpose: Capture Day-1 App Store Connect setup details and regional triggers while keeping pre-build marketing copy optional.*
- **Preferred App Name** *(required, `Needed now`, 2–30 chars counter)* — Helper: "2–30 characters. What appears under the icon on iPhone (e.g., `TMC`). Can be refined before submission."
- **What will the app do? (Plain-English summary)** *(required, `Needed now`, longtext, max 2,000 chars)* — Helper: "2–3 sentences on what users do in the app. Apple requires apps to offer real mobile utility beyond a repackaged website."
- **Distribution Goal** *(required, `Needed now`, single choice)*:
  - `Public App Store launch`
  - `Private pilot / beta first (via Apple TestFlight)` *(Helper: "Apple does not allow trials or beta apps on the public App Store—TestFlight is the right channel for pilots.")*
  - `Unlisted App Store link (direct-link download only)`
- **Primary Category** *(required, `Needed now`, select)* — Health & Fitness, Lifestyle, Business, Education, Sports, Medical, Finance, Social Networking, Other.
- **Primary App Store Language / Locale** *(required, `Needed now`, select, default: `English (Australia)`)* — `English (Australia)`, `English (U.S.)`, `English (U.K.)`, `Other`.
- **Target Devices** *(required, `Needed now`, choice, default: `iPhone only`)* — `iPhone only` / `iPhone & iPad` *(Helper: "Selecting iPad requires iPad-sized screens and screenshots.")*.
- **Target Age Rating Band** *(required, choice — Apple's current 2026 standardized bands)*:
  - `4+ (General audience — most fitness & business apps)`
  - `9+`
  - `13+`
  - `16+`
  - `18+`
  - `Not sure yet — Renatus to advise`
  - *Helper:* "Apple's current age bands are 4+, 9+, 13+, 16+, and 18+. Final rating is confirmed via Apple's Age Rating Questionnaire."
- **Is this app specifically made for children (Kids Category)?** *(required, choice, default: No)* — `No` / `Yes (Ages 5 & under, 6–8, or 9–11)` / `Not sure yet` *(Helper: "Kids Category apps have strict rules: no third-party ads or analytics, and parental gates on all links and purchases.")*
- **Target Countries / Regions for Release** *(required, multi-select, default: `Australia`)*:
  - `Australia`
  - `New Zealand`
  - `United States`
  - `United Kingdom`
  - `European Union`
  - `China Mainland`
  - `Worldwide (all storefronts)`
- **Subtitle** *(optional — `Can finalize during build`, max 30 chars)* — Helper: "Short tagline under the app name (e.g., *Mobility & Recovery Classes*)."
- **Promotional Text** *(optional — `Can finalize during build`, max 170 chars)* — Helper: "Short highlight at the top of your listing that can be updated anytime (e.g., *New 14-day hip mobility program now live*)."
- **Draft App Store Description** *(optional — `Can finalize during build`, longtext, max 4,000 chars)*
- **Search Keywords** *(optional — `Can finalize during build`, max 100 chars)* — Helper: "Comma-separated search terms (we'll format spacing automatically)."

### Step 3 — Brand Identity, Content Rights & Asset Uploads
*Purpose: Collect brand assets for the iOS app icon, splash screen, and store visuals, and confirm IP rights.*
- **Direct Multi-File Upload** *(optional if folder link provided)* — Drag-and-drop uploader to Supabase Storage:
  - Accepted formats: `.png`, `.svg`, `.jpg`, `.jpeg`, `.webp`, `.pdf`, `.zip`, `.eps`, `.ttf`, `.otf`, `.woff2`
  - Limits: Max **10 files**, max **25 MB per file**, **100 MB total per submission**.
  - Helper: "Upload your raw designer files, logo/brandmark, brand snapshot PDF, or zipped brand kit—no need to resize anything to 1024x1024, we'll handle that."
- **Brand Kit Folder Link (Optional Backup)** *(optional URL)* — Helper: "Have a large Google Drive, Dropbox, Figma, or Canva folder? Paste a share link here."
- **Brand Colors (Hex or Descriptions)** *(optional)* — e.g., `#1E2D40, #E0BA7B, #DED1BD, #F0F0EB`.
- **Preferred App Icon Background Color / Style** *(optional)* — Helper: "App Store icons cannot have transparent backgrounds (e.g., Dark Blue `#1E2D40` with white mark, or Off-White `#F0F0EB` with Dark Blue mark)."
- **Brand Fonts** *(optional)* — e.g., `Gloock` (plus optional select: `Free / Google Font`, `Paid license owned`, `Not sure`).
- **Third-Party Content & IP Rights** *(required, choice)*:
  - `All brand assets, copy, and media are owned by us`
  - `Includes third-party licensed content/media (we have written permission)`
  - `Not sure yet — Renatus to advise`

### Step 4 — Legal, Privacy & Support URLs
*Purpose: Catch missing Privacy Policy / Support / Terms URLs early and clarify account & login rules.*
- **Do you already have a live Privacy Policy page?** *(required, choice)*:
  - `Yes` -> reveals **Privacy Policy URL** *(required when Yes)*
  - `No — Renatus needs to help set this up` *(triggers Blocker flag + reveals optional **Who manages your website / platform?** e.g. Squarespace, Wix, Webflow, Custom/Agency, In-house)*
  - *Helper:* "Apple requires a live Privacy Policy both on your App Store listing and accessible inside the app."
- **Support URL** *(optional — defaults to website contact page if provided)* — Helper: "A live contact or support page on your website (e.g., `themobilitycollective.com/contact`)."
- **Public Support Email** *(required, `Needed now`)* — Displayed on App Store support and legal pages.
- **Terms of Service / User Agreement URL** *(optional — required if offering subscriptions or user-posted content)*
- **Will users create accounts or log in?** *(required, choice: `Yes` / `No` / `Not sure yet`)*
  - *Conditional sub-question when `Yes`:* **Will you offer social login (e.g., Google, Facebook)?** (`Yes` / `No` / `Not sure yet`)
  - *Conditional plain-English callout when `Yes`:* Explains that Apple requires (1) a way for users to permanently delete their account inside the app, (2) optional browsing without login for non-core content where possible, (3) **Sign in with Apple** alongside any third-party social login, and (4) a test login account for Apple's review team.

### Step 5 — Health, AI, Social & Data Privacy Declarations
*Purpose: Capture Apple App Privacy declarations, health/medical boundaries, mandatory 2026 social/AI disclosures, and encryption status.*
- **Health, Fitness & Medical Involvement** *(required, multi-select)*:
  - `General fitness, mobility, or workout guidance`
  - `Apple Health / Apple Watch integration`
  - `Collects user health, biometric, or injury/medical data`
  - `Provides medical advice, diagnosis, or clinical treatment`
  - `None of the above`
  - *Conditional plain-English helper:* Explains that health/fitness data can never be used for advertising or marketing, and medical/clinical apps require disclaimers and publishing under your own legal entity.
- **Social, Community & AI Features** *(required, multi-select)*:
  - `Social feed, user profiles, or messaging`
  - `Users can post comments, photos, videos, or content`
  - `AI assistant, chatbot, or AI-generated content`
  - `Live location sharing between users`
  - `Dating or relationships features`
  - `None of the above`
- **User Data the App Will Collect** *(required, multi-select)*:
  - `Contact info (name, email, phone)`
  - `Health & fitness data`
  - `Payment or purchase history`
  - `Photos, videos, or user-posted content`
  - `Location data`
  - `App analytics or crash reports`
  - `None — no personal data collected`
  - `Not sure yet — Renatus to advise`
- **In-App Advertising or Cross-App Tracking** *(required, choice)*:
  - `No ads or cross-app tracking`
  - `Basic internal analytics only (no cross-app tracking)`
  - `In-app ad networks or cross-app tracking (requires Apple permission prompt)`
  - `Not sure yet — Renatus to advise` *(Helper: "Running Instagram/Google ads for your business does not count here—this is only for tracking tools inside the mobile app.")*
- **Data Security / Encryption** *(optional, choice, default: Standard security)*:
  - `Standard security (HTTPS/TLS — applies to 99% of apps)`
  - `Custom or proprietary encryption`
  - `Not sure — Renatus to advise`

### Step 6 — Monetization & Financial Lodging Readiness
*Purpose: Determine whether Apple's Paid Apps Agreement, tax forms, and banking setup are required—without collecting sensitive bank/tax numbers on a public URL.*
- **How will the app make money?** *(required, multi-select)*:
  - `Free app (no payments in app)`
  - `One-time paid app download`
  - `Digital unlocks or on-demand digital content (e.g., recorded workout library — billed via Apple In-App Purchase)`
  - `Recurring digital subscriptions (billed via Apple In-App Purchase)`
  - `In-person classes, coaching, or physical goods (billed externally via Stripe/booking system — NOT Apple In-App Purchase)`
  - `Digital memberships billed externally on our website`
  - `Not sure yet — Renatus to advise`
- *Conditional block (shown if paid download, digital unlocks/IAP, subscriptions, or external digital memberships is selected):*
  - **Helper Callout (Apple Paid Apps Setup):** Explains that paid downloads and Apple In-App Purchases require signing Apple's Paid Apps Agreement, submitting tax forms, and verifying banking details inside App Store Connect. **Explicitly states:** *"Do not enter bank account or tax numbers here. We will handle financial lodging securely 1:1 once scoped."*
  - **Apple Paid Apps Setup Status** *(required when `One-time paid download`, `Digital unlocks/IAP`, or `Recurring digital subscriptions` is selected)*:
    - `Already active in App Store Connect`
    - `Ready to complete — send us the secure onboarding steps`
    - `Need advice on Apple billing vs. external payment rules`
  - **Finance / Billing Contact Name & Email** *(optional — if different from primary contact)*

### Step 7 — Review Notes, Timeline & Confirmation
*Purpose: Catch special Apple Review requirements and give clients a clean summary before submitting.*
- **Target Launch Window** *(optional, choice)* — `ASAP (TestFlight pilot)`, `Within 1 month (Public App Store)`, `1–3 months`, `Flexible`.
- **Special Notes for Renatus or Apple Review** *(optional, longtext, max 2,000 chars)* — e.g., existing booking system, beta tester list, or special review notes.
- **Send me a confirmation receipt email** *(checkbox, default: checked)*
- **Review Summary Panel** — Expandable recap of all answers and uploaded files before clicking **Submit Intake**.

---

## 5. Automated Readiness & Gap Summary Logic (Internal & Client Output)

On `POST /api/app-store-intake`, the server computes a deterministic `gaps[]` array (`{ severity, code, title, detail }`) saved to Postgres, summarized in plain English on the confirmation screen, and sent with full guideline references at the top of Shaun's Resend email:

| Trigger Condition | Severity | Internal Action / Apple Guideline Reference |
|---|---|---|
| Privacy Policy = `No` | **Blocker** | Create and host a live Privacy Policy URL (required in App Store Connect AND inside the app — Guideline **5.1.1(i)**). Note website manager/platform if provided. |
| Any Regulated Industry / Special Capability selected (Step 1) OR `Provides medical advice, diagnosis, or clinical treatment` (Step 5) AND (`Publishing Account != Own Account` OR `Enrollment Status != Already enrolled as Organization`) | **Blocker** | Guidelines **5.1.1(ix)** (healthcare/banking/crypto/gambling/cannabis/air travel), **5.3** (licensed/geo-restricted/free real-money gaming), **5.4** (VPN `NEVPNManager` + Org), **5.5** (MDM enterprise/edu/gov) require the regulated legal entity's own Organization Developer account. |
| Any Regulated Industry / Special Capability selected (Step 1) OR `Provides medical advice, diagnosis, or clinical treatment` (Step 5) (applies even when already enrolled as an Organization) | **Requirement** | Verify mandatory licensing, regional geo-restrictions, and technical rules: **5.1.1(ix)** regulated entity compliance, **3.2.2(ix)** lending limits, **5.3** free-to-download/no-IAP real-money gaming, **5.4** `NEVPNManager`/no data selling, **5.5** Apple-granted MDM capability. |
| `Own Account` selected AND `Enrollment Status != Already enrolled as Organization` | **Blocker** | Client must complete Apple Organization enrollment/migration (obtaining a D-U-N-S number if blank; **allow 2–6 weeks**, or up to 60+ days for individual-to-organization migrations). |
| `Terms / User Agreement URL` blank AND (`Recurring digital subscriptions` OR `Users can post content (UGC)` selected) | **Blocker** | Terms/EULA URL is mandatory in-app and in metadata for auto-renewable subscriptions (Guideline **3.1.2**) and UGC (zero-tolerance EULA, Guideline **1.2**). |
| (`Kids Category = Yes` OR `HealthKit / Health data` selected) AND `In-app ad networks / cross-app tracking` selected | **Blocker** | Prohibited combination: Kids apps cannot use third-party ad/analytics SDKs or IDFA (**1.3, 5.1.4**); HealthKit/health data can never be used for ads, marketing, or data mining (**5.1.2(vi), 5.1.3**). |
| `Digital memberships billed externally` selected AND `Target Regions` includes any non-US storefront (e.g., `Australia`, `UK`, `EU`, `Worldwide`) | **Blocker** | Guideline **3.1.1**: no-entitlement external purchase links are a US-storefront-only carve-out. Outside the US, digital access requires StoreKit IAP, a **3.1.3** exemption (Reader/Multiplatform/Enterprise), or regional entitlements (EU DMA Attachment 14: disclosure sheet, 12-month lock-in, monthly reporting). |
| (`One-time paid` OR `Digital unlocks/IAP` OR `Subscriptions`) selected AND `Paid Apps Setup Status != Already active` | **Blocker** | Schedule secure 1:1 Paid Apps Agreement, tax & banking lodging in App Store Connect. Also note: first IAP/subscription of each type must submit with a new app version (Aug 2026 rule); Restore Purchases required for non-consumables (**3.1.1**) & subscriptions (**3.1.2**); disable default-on **Multiseat/Volume Purchasing** (Oct 2026) if seat-sharing breaks pricing. |
| `Target Regions` includes `European Union` or `Worldwide` | **Blocker** | **EU DSA Trader Status** must be declared & verified in App Store Connect (missing removes app from EU); **EAA** WCAG 2.1 AA / EN 301 549 accessibility statement required. Conditional: **EU AI Act** (Art. 4/5/50 notices & markings if AI), **GDPR Art. 9** explicit consent (if health/biometric), **EU alternative ATT prompt** (DE/FR/IT/PL/RO on iOS 27.2+ if tracking). |
| `Target Regions` includes `China Mainland` or `Worldwide` | **Blocker** | Requires **MIIT app filing with a local Chinese entity** (plus Banhao license for games) AND mandatory App Store Connect **App Compliance** declarations (AI-Generated/Synthetic Content & Security Assessment, required even if `No`; existing apps deadline 31 Jan 2027). External AI references (ChatGPT/Gemini) trigger regional rejection. |
| `Publishing Account = Renatus` AND `Distribution Goal != Private pilot / beta (TestFlight)` | **Warning** | Public client-branded launch under Renatus's account risks Guideline **4.2.6** (template/reseller) and **5.2** (IP) rejection. Confirm eligibility or obtain written brand/IP authorization (or migrate to client's own account). |
| `Own Account` + `Already enrolled as Organization` + missing `Team ID` | **Action Needed** | Verify active membership, confirm Account Holder accepted latest **ADPLA** (e.g., 13 Oct 2026 update), and invite Renatus to App Store Connect. |
| (`One-time paid` OR `IAP` OR `Subscriptions`) AND `Paid Apps Setup Status = Already active` | **Requirement** | Verify latest **ADPLA** acceptance, submit first IAP/subscription with a new app version (Aug 2026 rule), implement Restore Purchases (**3.1.1 / 3.1.2**), and check default-on Multiseat/Volume Purchasing setting (Oct 2026). |
| `Kids Category = Yes` | **Requirement** | Guidelines **1.3 & 5.1.4**: parental gate on all exits/purchases, zero third-party ad/analytics SDKs, **COPPA Verifiable Parental Consent** if collecting data, EU DMA ban on out-of-app website purchases for Kids apps, and **UK Online Safety Act Children's Code** defaults if `United Kingdom` or `Worldwide` is selected. |
| `Accounts = Yes` | **Requirement** | Mandatory in-app account & data deletion + optional login for non-core features (**5.1.1(v)**), working reviewer demo account with no 2FA blocker (**2.1**), and **Sign in with Apple** (**4.8**, supporting both `privaterelay.appleid.com` and `private.icloud.com`) if social login is enabled. |
| `HealthKit / Health / Medical` selected | **Requirement** | Add validated health disclaimers (**1.4.1**), specific HealthKit purpose strings, and zero ad/marketing use (**5.1.2(vi), 5.1.3**). |
| `Social / UGC / AI / Live Location / Dating` selected | **Requirement** | Answer mandatory **Social Media declaration** (**2.3.6**, min `13+`, Declared Age Range API for under-13; Australia under-16 age assurance if AU; UK Online Safety Act Highly Effective Age Assurance if UK/Worldwide; US Declared Age Range + `RESCIND_CONSENT` & NCMEC 1-yr preservation if US); UGC/AI content moderation, report/block & 24h removal (**1.2**, Oct 2026 AI intimate-imagery Code of Conduct rule, **1.2.1(a)** creator age gating); third-party AI consent modal naming provider & data types (**5.1.2(i)**); Nov 2026 Shared Location / Dating descriptors. |
| Age Band conflict (`< 13+` with Social Media, OR `< 18+` with `Dating or relationships features`) OR `Age Band = 18+` | **Warning** | Resolve age-band floor conflict (`Social Media >= 13+`, `Dating >= 18+`). For `18+` apps, handle **18+ download gating** in Australia, Brazil, and Singapore (Feb 2026 Apple block) and **UK Online Safety Act Highly Effective Age Assurance** if `United Kingdom` or `Worldwide` is selected. |
| `In-app ad networks / cross-app tracking` selected (without Kids/Health conflict) | **Requirement** | Implement **App Tracking Transparency (ATT)** prompt before tracking (**5.1.2(i)**) and match App Privacy nutrition labels + `PrivacyInfo.xcprivacy` across all SDKs. |
| `Target Regions` includes `Worldwide` | **Requirement** | Exclude **OFAC embargoed territories** from storefront availability. |
| `Third-Party Content = Licensed` or `Not sure yet` | **Requirement** | Confirm written proof of rights for App Store Connect Content Rights question (**Guideline 5.2**). |
| `Encryption = Custom` or `Not sure` | **Action Needed** | Verify `ITSAppUsesNonExemptEncryption` export compliance docs (and **France ANSSI** declaration if shipping to France/EU). |
| `Support URL` blank | **Warning** | Confirm a live Support/Contact URL (e.g., website `/contact` — Guideline **1.5**). |
| No brand files uploaded AND no Brand Kit URL | **Warning** | Request square brandmark/logo (no Apple device imagery) and brand colors before generating the 1024x1024 icon & splash assets. |
| Any field answered with a `"Not sure"` option (normalized `unsure` enum value across Steps 1–6) | **Action Needed** | Review client's `"Not sure"` selections on kickoff call before finalizing App Store Connect setup. |
| Optional metadata left blank (Subtitle / Promo / Description / Keywords) | **Info (Deferred)** | Deferred until app build stage; will finalize before App Store Connect submission. |

---

## 6. Technical Architecture (`website_host` + Supabase + Resend)

### 6.1 Dependencies & Environment Variables
- Add `@supabase/supabase-js` to `website_host/package.json`.
- Commit the [initial intake migration](../../supabase/migrations/20261126021631_app_store_intakes.sql).
- Server-only environment variables (add to `.env.example` and Vercel project settings — **never** `VITE_`-prefixed):
```env
# Existing
RESEND_API_KEY=
RESEND_FROM=Renatus <shaun@renatusco.com>
ENQUIRY_TO=shaun@renatusco.com

# New (Supabase + Rate-Limit Security)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_INTAKE_BUCKET=app-store-intake-assets
RATE_LIMIT_SALT=
# Optional anti-bot upgrade (enable if needed)
TURNSTILE_SECRET_KEY=
```

### 6.2 Supabase Schema, RLS & Storage
1. **Postgres Table `public.app_store_intakes`:**
   - `id uuid primary key default gen_random_uuid()`
   - `session_id uuid not null unique` *(enforces idempotency on retries/double-clicks)*
   - `created_at timestamptz not null default now()`
   - `status text not null default 'new'` (`new | reviewed | in_progress | submitted | approved`)
   - `brand_name text not null`, `legal_name text not null`, `contact_name text not null`, `contact_email text not null`, `contact_phone text not null`, `website_url text not null`, `app_name text not null`, `publishing_account text not null`
   - `answers jsonb not null` *(normalized 7-step payload)*
   - `assets jsonb not null default '[]'` *(server-verified `{ path, name, size, mimeType }` from Storage)*
   - `gaps jsonb not null default '[]'` *(server-computed Readiness & Gap Summary)*
   - `client_ip_hash text` *(salted SHA-256 hash)*
   - **Hardening:** `ALTER TABLE public.app_store_intakes ENABLE ROW LEVEL SECURITY;` + `REVOKE ALL ON TABLE public.app_store_intakes FROM anon, authenticated;` (accessed exclusively via `service_role` in serverless functions).

2. **Postgres Table `public.intake_rate_limits` & Atomic RPC:**
   - Persistent serverless rate-limit store keyed by `(key_hash, action, window_start)` with `ENABLE ROW LEVEL SECURITY` and `REVOKE ALL ... FROM anon, authenticated`.
   - Atomic SQL RPC `check_and_increment_rate_limit(p_key_hash text, p_action text, p_window_seconds int, p_max_hits int) returns boolean`.
   - **RPC Hardening:** Explicitly `REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(text, text, int, int) FROM PUBLIC, anon, authenticated; GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(text, text, int, int) TO service_role;` so the function cannot be invoked via PostgREST `/rest/v1/rpc/...` using the anon key.
   - Client IP extracted from `x-vercel-forwarded-for` (fallback: first IP in `x-forwarded-for`) and hashed via `SHA-256(RATE_LIMIT_SALT + ':' + ip)`.

3. **Private Storage Bucket `app-store-intake-assets`:**
   - `public = false`, `file_size_limit = 26214400` (25 MB), `allowed_mime_types` restricted to the accepted asset MIME whitelist, and **zero** `anon`/`authenticated` Storage RLS policies.
   - Object path convention: `<sessionId>/<uuid_prefix>-<sanitized_filename>` (filename stripped to `[a-zA-Z0-9._-]`, preventing traversal and collisions).
   - **Upload:** Server issues short-lived signed upload URLs (`createSignedUploadUrl`) so up to 25 MB files upload directly from browser to Supabase Storage without hitting Vercel's 4.5 MB serverless body limit.
   - **Download (XSS-safe):** Server generates 7-day signed download URLs with `{ download: true }` (`Content-Disposition: attachment`) so `.svg` / `.pdf` files never execute inline in a browser.
   - **Orphan Cleanup:** Scheduled cleanup (Supabase `pg_cron` or Vercel Cron) deletes objects in `app-store-intake-assets` older than 48 hours whose `<sessionId>` does not exist in `public.app_store_intakes`.

### 6.3 Vercel Routing, API Endpoints & Vite Dev Middleware
- **`vercel.json`:**
  - Add `headers` rule for `/app-store-intake` setting `X-Robots-Tag: noindex, nofollow`.
  - Update SPA catch-all rewrite to exclude API routes: `"source": "/((?!api/).*)"` -> `"/index.html"`.
- **Serverless File Layout (avoiding Vercel file/directory collision & unintended public helper deployment):**
  - `api/app-store-intake/_lib.js` — pure validation, normalization, gap computation, sanitization, and email builders (underscore prefix prevents Vercel from deploying it as a public route, mirroring `api/send-enquiry.js`).
  - `api/app-store-intake/upload-url.js` -> `POST /api/app-store-intake/upload-url`
    - Validates: honeypot empty, `sessionId` is UUIDv4, Postgres IP rate limit (`20 / 15 min`), MIME/extension whitelist, `sizeBytes <= 25 MB`, and lists `<sessionId>/` in Storage to enforce **max 10 files** and **100 MB cumulative size** before issuing `{ signedUrl, token, path }`.
  - `api/app-store-intake/upload.js` -> `DELETE /api/app-store-intake/upload`
    - Validates: Postgres IP rate limit (`30 / 15 min`), `sessionId` is UUIDv4, `path` matches strict single-segment regex `^<sessionId>/[a-zA-Z0-9._-]+$` (rejecting `..` and extra `/`), and rejects deletion with `409 Conflict` if `session_id` already exists in `public.app_store_intakes`. Deletes the object from Storage so removed UI files free quota.
  - `api/app-store-intake/index.js` -> `POST /api/app-store-intake`
    - Validates: JSON body `<= 100 KB`, honeypot empty, Postgres IP rate limit (`5 / hour`) + per-email receipt limit (`3 / hour`), required Step 1–6 fields, strict E.164 phone, email format, URL fields strictly `http:`/`https:` only (rejecting `javascript:`/`data:`), max `2,000` chars per longtext (`4,000` for optional draft description).
    - **Idempotency:** If `session_id` already exists in `public.app_store_intakes`, return `200 { ok: true, id, gaps, duplicate: true }` without re-sending emails.
    - **Server-side Storage Verification:** Lists `<sessionId>/` in Supabase Storage to confirm every claimed asset exists and records server-verified `size` and `mimeType`.
    - Computes `gaps[]` server-side and inserts into `public.app_store_intakes`.
    - **Sanitized Resend Emails:**
      - Strip `\r\n` and clamp subject fields; HTML-escape all user values.
      - **Shaun's email (`ENQUIRY_TO`, `replyTo: contact_email`):** Subject `App Store Intake: <Brand Name> (<App Name>)`, top **Readiness & Gap Summary**, sectioned Q&A, 7-day `{ download: true }` signed asset links, and Supabase record ID.
      - **Optional client receipt (`sendClientCopy === true`):** Safe static confirmation template containing only reference ID, timestamp, and non-sensitive plain-English next steps / Readiness Summary (no attacker-controlled free text, no arbitrary URLs, no signed Storage links).
    - **Partial Failure Semantics:** If DB insert succeeds but Resend fails, log the error server-side and still return `200 { ok: true, id, gaps, emailDelivered: false }` so the client retains confirmation and does not duplicate-submit.
- **`vite.config.js` Local Dev Middleware:**
  - Register `/api/app-store-intake/upload-url` and `/api/app-store-intake/upload` **before** `/api/app-store-intake` (or match exact pathname) to prevent Connect prefix swallowing, and enforce the `100 KB` body cap locally.

---

## 7. Validation Walkthrough: Blank Business Persona (`The Mobility Collective / TMC`)

Running TMC through the 7 steps verifies a real blank-business submission end-to-end:
- **Step 1:** Legal/Brand: *The Mobility Collective*, Contact: *Caitlin Fisher*, Phone: `+61 ...` (normalized to E.164), Website: `https://www.themobilitycollective.com`, Regulated Industry: *None of these*, Account: *Use Renatus's Apple Developer account*.
- **Step 2:** App Name: `TMC`, Summary: *Mobility and recovery sessions for members*, Distribution Goal: *Public App Store launch* (or *Private pilot via TestFlight*), Category: *Health & Fitness*, Locale: *English (Australia)*, Devices: *iPhone only*, Age Band: `4+`, Kids Category: *No*, Storefront: *Australia*, Subtitle/Promo/Description/Keywords left blank (`Deferred until build`).
- **Step 3:** Direct upload of `tmc-branding/01_Logo/PNG/TMC_Brandmark_DarkBlue_RGB.png` + `03_Brand Snapshot/#667_WKM_The Mobility Collective_Brand Snapshot_1A.pdf`; Colors `#1E2D40, #E0BA7B, #DED1BD, #F0F0EB, #FFFFFF`; Icon Background: `#1E2D40` (Dark Blue) or `#F0F0EB` (Off-White); Font: `Gloock` (`Free / Google Font`); Content Rights: *Owned by us*.
- **Step 4:** Privacy Policy = `No` *(verified missing on `themobilitycollective.com`)*, Website Manager: *Custom / Agency*, Support URL = `https://www.themobilitycollective.com/contact`, Public Support Email = `hello@themobilitycollective.com`, Accounts = `No`.
- **Step 5:** Health & Fitness = *General fitness, mobility, or workout guidance*; Social/AI = *None*; User Data Collected = *None — no personal data collected*; Tracking = *No ads or cross-app tracking*; Encryption = *Standard security*.
- **Step 6:** Monetization = *Free app* (or *In-person studio classes billed externally* — no Apple IAP needed).
- **Step 7:** Target Launch Window = *ASAP (TestFlight pilot)* or *Within 1 month (Public App Store)*, Special Notes = *(optional)*, Send confirmation receipt = *checked*.
- **Expected Gap Summary Output:**
  - **Blocker:** Privacy Policy URL missing (must be published and linked both in App Store Connect and inside the app — Guideline **5.1.1(i)**).
  - **Warning (if Public App Store launch selected with Renatus account):** Verify Guideline **4.2.6** eligibility and prepare written brand/IP authorization (**5.2**) for submitting TMC under Renatus's account.
  - **Info (Deferred):** App subtitle, promotional text, draft description, and keywords deferred until build stage.

---

## 8. Acceptance Criteria

- [ ] `/app-store-intake` renders the standalone 7-step wizard with `website_host`'s actual `Geist` + white/cloud/forest/spring design tokens and zero `Navbar`, `Footer`, `MobileEnquireBar`, or `PageTransition`.
- [ ] Zero links to `/app-store-intake` exist anywhere on the main site; pre-JS HTML (`dist/app-store-intake.html`), HTTP response headers (`X-Robots-Tag`), and client-side `PageMeta.jsx` all enforce `noindex, nofollow`.
- [ ] `vercel.json` excludes `/api/*` from the SPA catch-all rewrite, and `vite.config.js` routes `/upload-url`, `/upload`, and `/api/app-store-intake` cleanly without prefix collisions.
- [ ] Refreshing mid-form restores answers, `sessionId`, and uploaded asset metadata from `localStorage` (never storing the honeypot); **Clear draft** and successful submission both clear `localStorage`.
- [ ] All client-facing labels use plain English with `Needed now` vs. `Optional — can finalize during build` badges, `"Not sure yet"` fallbacks on pre-build technical questions, and conditional callouts/fields working as specified.
- [ ] Validation enforces E.164 international phone format (auto-normalizing local AU input), App Name 2–30 chars, Subtitle max 30, Promo max 170, Keywords max 100, Description max 4,000, and `http:`/`https:`-only URLs (rejecting `javascript:`/`data:`).
- [ ] Multi-file uploads enforce max 10 files, 25 MB/file, and **100 MB cumulative cap** via Supabase Storage bucket limits + server `list()` verification; UI removal calls `DELETE /api/app-store-intake/upload` to free quota.
- [ ] Supabase RLS + `REVOKE ALL` verified: anon key cannot read/write `public.app_store_intakes`, `public.intake_rate_limits`, `app-store-intake-assets`, or execute `public.check_and_increment_rate_limit` via PostgREST RPC.
- [ ] `DELETE /api/app-store-intake/upload` enforces strict single-segment path regex (`^<sessionId>/[a-zA-Z0-9._-]+$`), Postgres IP rate limit, and rejects deletes for already-submitted sessions (`409`); `api/app-store-intake/_lib.js` is not deployed as a public endpoint.
- [ ] Postgres-backed rate limiting persists across serverless invocations; duplicate submission with the same `sessionId` is idempotent; partial Resend failure returns `200` with `emailDelivered: false`.
- [ ] Deterministic Gap Summary accurately triggers all Section 5 rules (verified against the TMC persona plus regulated/Kids/EU/China/external-billing test cases).
- [ ] Resend delivers HTML-escaped email to `ENQUIRY_TO` with `{ download: true }` signed asset links (preventing inline SVG XSS) and safe static client confirmation receipt when requested.
- [ ] Mobile-responsive (375px + desktop), keyboard-accessible, and `npm run build` passes cleanly in `website_host` with zero broken existing routes.
