import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { INTAKE_NAMES } from './_storage.js';
import {
  ALLOWED_EXTENSIONS,
  E164_RE,
  EMAIL_RE,
  LEGACY_INTAKE_VERSION,
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  QUICK_INTAKE_VERSION,
  UUID_V4_RE,
  getExtension,
  isValidHttpUrl,
  resolveIntakeObjectPath,
  normalizePhone,
  validateQuickIntakeAnswers,
} from '../../src/data/appStoreIntake.js';

export {
  ALLOWED_EXTENSIONS, E164_RE, EMAIL_RE, MAX_FILES, MAX_FILE_SIZE_BYTES, MAX_TOTAL_SIZE_BYTES,
  UUID_V4_RE, getExtension, isValidHttpUrl, isValidSingleSegmentPath, normalizePhone,
} from '../../src/data/appStoreIntake.js';
export const MAX_JSON_BODY_BYTES = 100 * 1024; // 100 KB
export const SIGNED_DOWNLOAD_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/svg+xml',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/postscript',
  'application/eps',
  'image/x-eps',
  'font/ttf',
  'font/otf',
  'font/woff2',
  'application/octet-stream',
]);

const ALLOWED_ENUMS = {
  publishingAccount: new Set(['renatus', 'own', 'unsure']),
  enrollmentStatus: new Set(['org_active', 'personal_migrate', 'not_enrolled']),
  distributionGoal: new Set(['public', 'testflight', 'unlisted']),
  ageRatingBand: new Set(['4+', '9+', '13+', '16+', '18+', 'unsure']),
  kidsCategory: new Set(['no', 'yes', 'unsure']),
  contentRights: new Set(['owned', 'licensed', 'unsure']),
  hasPrivacyPolicy: new Set(['yes', 'no']),
  hasAccounts: new Set(['yes', 'no', 'unsure']),
  hasSocialLogin: new Set(['yes', 'no', 'unsure']),
  trackingAds: new Set(['none', 'internal_only', 'ad_tracking', 'unsure']),
  encryption: new Set(['standard', 'custom', 'unsure']),
  paidAppsStatus: new Set(['already_active', 'ready_to_complete', 'need_advice']),
};

const UNSURE_VALUES = new Set([
  'unsure',
  'not_sure',
  'Not sure',
  'Not sure yet',
  'Not sure — Renatus to advise',
  'Not sure yet — Renatus to advise',
]);

let saltWarned = false;

export function isUnsureValue(val) {
  if (!val) return false;
  if (Array.isArray(val)) return val.some(isUnsureValue);
  const str = String(val).trim();
  return UNSURE_VALUES.has(str) || str.toLowerCase().startsWith('not sure');
}

export function checkJsonBodySize(req) {
  const headerLen = Number(req?.headers?.['content-length']);
  if (Number.isFinite(headerLen) && headerLen > MAX_JSON_BODY_BYTES) {
    return { error: 'Request payload too large.', status: 413 };
  }
  const serialized =
    typeof req?.body === 'string' ? req.body : JSON.stringify(req?.body ?? {});
  if (Buffer.byteLength(serialized, 'utf8') > MAX_JSON_BODY_BYTES) {
    return { error: 'Request payload too large.', status: 413 };
  }
  return null;
}

export async function verifyTurnstileIfEnabled(token, ip, env = process.env) {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };
  if (!token || typeof token !== 'string') {
    return { ok: false, error: 'Verification token is required.', status: 400 };
  }
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip && ip !== 'unknown') form.set('remoteip', ip);
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const data = await resp.json();
    if (!data?.success) {
      return { ok: false, error: 'Bot verification failed. Please retry.', status: 403 };
    }
    return { ok: true };
  } catch (err) {
    console.error('[intake] Turnstile verification error:', err?.message);
    return { ok: false, error: 'Bot verification unavailable. Please try again.', status: 503 };
  }
}

export function extractClientIp(req) {
  const vercelIp = req?.headers?.['x-vercel-forwarded-for'];
  if (typeof vercelIp === 'string' && vercelIp.trim()) {
    return vercelIp.split(',')[0].trim();
  }
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req?.socket?.remoteAddress || 'unknown';
}

export function hashKey(raw, env = process.env) {
  let salt = env.RATE_LIMIT_SALT;
  if (!salt) {
    if (env.NODE_ENV === 'production' && !saltWarned) {
      saltWarned = true;
      console.warn('[intake] RATE_LIMIT_SALT is not set in production; using fallback salt.');
    }
    salt = 'renatus-intake-default-salt';
  }
  return crypto.createHash('sha256').update(`${salt}:${raw}`).digest('hex');
}

export function sanitizeFilename(name) {
  const base = String(name || 'file')
    .trim()
    .replace(/^.*[\\/]/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '')
    .slice(0, 120);
  return base || 'file';
}

export function sanitizeSubject(raw, maxLen = 120) {
  return String(raw || '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function escapeHtml(raw) {
  return String(raw ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function createSupabaseAdmin(env = process.env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function checkRateLimit(supabase, keyHash, action, windowSeconds, maxHits) {
  if (!supabase) return true;
  const { data, error } = await supabase.rpc(INTAKE_NAMES.rateLimit, {
    p_key_hash: keyHash,
    p_action: action,
    p_window_seconds: windowSeconds,
    p_max_hits: maxHits,
  });
  if (error) {
    console.error('[intake] rate limit RPC error:', error.message);
    return false;
  }
  return Boolean(data);
}

export function validateUploadUrlRequest(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request payload.', status: 400 };
  }
  if (body.website) {
    return { error: 'Rejected.', status: 400 };
  }
  const sessionId = String(body.sessionId || '').trim();
  if (!UUID_V4_RE.test(sessionId)) {
    return { error: 'Invalid session ID.', status: 400 };
  }

  const filename = sanitizeFilename(body.filename);
  const ext = getExtension(filename);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      error: `File type "${ext || 'unknown'}" is not allowed. Accepted: PNG, SVG, JPG, WEBP, PDF, ZIP, EPS, TTF, OTF, WOFF2.`,
      status: 400,
    };
  }

  const mimeType = String(body.mimeType || 'application/octet-stream').trim().toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { error: `MIME type "${mimeType}" is not allowed.`, status: 400 };
  }

  const sizeBytes = Number(body.sizeBytes);
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { error: 'File size must be between 1 byte and 25 MB.', status: 400 };
  }

  const uniquePrefix = crypto.randomBytes(4).toString('hex');
  const objectName = `${uniquePrefix}-${filename}`;
  return { data: { sessionId, filename, mimeType, sizeBytes, objectName } };
}

function trimmed(val) {
  return String(val ?? '').trim();
}

function trimmedOrDefault(val, fallback) {
  const s = trimmed(val);
  return s || fallback;
}

function normalizeArray(val) {
  if (!Array.isArray(val)) return [];
  return Array.from(new Set(val.map((v) => String(v || '').trim()).filter(Boolean)));
}

function validateClaimedAssets(raw, sessionId) {
  const assets = Array.isArray(raw) ? raw : [];
  const byName = new Map();
  for (const asset of assets) {
    const key = resolveIntakeObjectPath(sessionId, asset?.path);
    if (!key) return { error: 'Invalid uploaded asset path.', status: 400 };
    if (!byName.has(key.name)) byName.set(key.name, asset);
  }
  if (byName.size > MAX_FILES) {
    return { error: `Maximum of ${MAX_FILES} files per submission allowed.`, status: 400 };
  }
  return { claimedAssets: [...byName.values()] };
}

export function validateIntakePayload(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request payload.', status: 400 };
  }
  if (body.website) {
    return { error: 'Rejected.', status: 400 };
  }

  const sessionId = trimmed(body.sessionId);
  if (!UUID_V4_RE.test(sessionId)) {
    return { error: 'Invalid session ID.', status: 400 };
  }

  const a = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const submissionVersion = body.submissionVersion ?? LEGACY_INTAKE_VERSION;
  if (submissionVersion === QUICK_INTAKE_VERSION) {
    const { answers, errors } = validateQuickIntakeAnswers(a);
    const [firstError] = Object.values(errors);
    if (firstError) return { error: firstError, fieldErrors: errors, status: 400 };

    const assets = validateClaimedAssets(body.assets, sessionId);
    if (assets.error) return assets;
    return {
      data: {
        sessionId,
        submissionVersion,
        answers,
        claimedAssets: assets.claimedAssets,
        sendClientCopy: body.sendClientCopy === true,
      },
    };
  }
  if (submissionVersion !== LEGACY_INTAKE_VERSION) {
    return { error: 'Unsupported intake version. Refresh the form and try again.', status: 400 };
  }

  // Step 1
  const legalName = trimmed(a.legalName);
  const brandName = trimmed(a.brandName);
  const contactName = trimmed(a.contactName);
  const contactEmail = trimmed(a.contactEmail).toLowerCase();
  const contactPhone = normalizePhone(a.contactPhone, trimmedOrDefault(a.phoneCountryCode, '+61'));
  const websiteUrl = trimmed(a.websiteUrl);
  const country = trimmedOrDefault(a.country, 'Australia');
  const businessRegNumber = trimmed(a.businessRegNumber);
  const regulatedIndustries = normalizeArray(a.regulatedIndustries);
  const publishingAccount = trimmed(a.publishingAccount);

  // Conditional Step 1 fields — cleared when publishingAccount !== 'own'
  const isOwnAccount = publishingAccount === 'own';
  const enrollmentStatus = isOwnAccount ? trimmed(a.enrollmentStatus) : '';
  const accountHolderEmail = isOwnAccount ? trimmed(a.accountHolderEmail) : '';
  const teamId = isOwnAccount ? trimmed(a.teamId) : '';
  const dunsNumber = isOwnAccount ? trimmed(a.dunsNumber) : '';

  if (!legalName || !brandName || !contactName) {
    return { error: 'Legal business name, brand name, and contact name are required.', status: 400 };
  }
  if (legalName.length > 200 || brandName.length > 200 || contactName.length > 200) {
    return { error: 'Business and contact names must be 200 characters or fewer.', status: 400 };
  }
  if (!EMAIL_RE.test(contactEmail)) {
    return { error: 'Enter a valid primary contact email address.', status: 400 };
  }
  if (!E164_RE.test(contactPhone)) {
    return {
      error: 'Enter a valid mobile/phone number with country code (e.g. +61 412 345 678).',
      status: 400,
    };
  }
  if (!isValidHttpUrl(websiteUrl)) {
    return { error: 'Enter a valid website URL starting with https:// or http://.', status: 400 };
  }
  if (regulatedIndustries.length === 0) {
    return { error: 'Select your regulated industry status in Step 1.', status: 400 };
  }
  if (!ALLOWED_ENUMS.publishingAccount.has(publishingAccount)) {
    return { error: 'Select a valid publishing account preference in Step 1.', status: 400 };
  }
  if (isOwnAccount && !ALLOWED_ENUMS.enrollmentStatus.has(enrollmentStatus)) {
    return { error: 'Select a valid Apple Developer enrollment status in Step 1.', status: 400 };
  }
  if (accountHolderEmail && !EMAIL_RE.test(accountHolderEmail)) {
    return { error: 'Enter a valid Apple Account Holder email address.', status: 400 };
  }

  // Step 2 — validate raw trimmed lengths BEFORE accepting (no silent truncation)
  const appName = trimmed(a.appName);
  const appSummary = trimmed(a.appSummary);
  const distributionGoal = trimmed(a.distributionGoal);
  const primaryCategory = trimmed(a.primaryCategory);
  const primaryLocale = trimmedOrDefault(a.primaryLocale, 'English (Australia)');
  const targetDevices = trimmedOrDefault(a.targetDevices, 'iPhone only');
  const ageRatingBand = trimmed(a.ageRatingBand);
  const kidsCategory = trimmedOrDefault(a.kidsCategory, 'no');
  const targetRegions = normalizeArray(a.targetRegions);
  const subtitle = trimmed(a.subtitle);
  const promoText = trimmed(a.promoText);
  const draftDescription = trimmed(a.draftDescription);
  const keywords = trimmed(a.keywords)
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
    .join(',');

  if (appName.length < 2 || appName.length > 30) {
    return { error: 'Preferred app name must be between 2 and 30 characters.', status: 400 };
  }
  if (!appSummary || appSummary.length > 2000) {
    return { error: 'App summary is required and must be 2,000 characters or fewer.', status: 400 };
  }
  if (!ALLOWED_ENUMS.distributionGoal.has(distributionGoal)) {
    return { error: 'Select a valid distribution goal in Step 2.', status: 400 };
  }
  if (!primaryCategory) {
    return { error: 'Select a primary category in Step 2.', status: 400 };
  }
  if (!ALLOWED_ENUMS.ageRatingBand.has(ageRatingBand)) {
    return { error: 'Select a valid target age rating band in Step 2.', status: 400 };
  }
  if (!ALLOWED_ENUMS.kidsCategory.has(kidsCategory)) {
    return { error: 'Select a valid Kids Category option in Step 2.', status: 400 };
  }
  if (targetRegions.length === 0) {
    return { error: 'Select at least one target country or region in Step 2.', status: 400 };
  }
  if (subtitle.length > 30) {
    return { error: 'Subtitle must be 30 characters or fewer.', status: 400 };
  }
  if (promoText.length > 170) {
    return { error: 'Promotional text must be 170 characters or fewer.', status: 400 };
  }
  if (draftDescription.length > 4000) {
    return { error: 'Draft description must be 4,000 characters or fewer.', status: 400 };
  }
  if (keywords.length > 100) {
    return { error: 'Search keywords must be 100 characters or fewer (comma-separated).', status: 400 };
  }

  // Step 3
  const brandKitUrl = trimmed(a.brandKitUrl);
  if (brandKitUrl && !isValidHttpUrl(brandKitUrl)) {
    return { error: 'Brand kit link must start with https:// or http://.', status: 400 };
  }
  const brandColors = trimmed(a.brandColors).slice(0, 300);
  const iconBackground = trimmed(a.iconBackground).slice(0, 200);
  const brandFonts = trimmed(a.brandFonts).slice(0, 200);
  const brandFontLicense = trimmed(a.brandFontLicense).slice(0, 100);
  const contentRights = trimmed(a.contentRights);
  if (!ALLOWED_ENUMS.contentRights.has(contentRights)) {
    return { error: 'Confirm third-party content & IP rights in Step 3.', status: 400 };
  }

  // Step 4 — clear stale conditional fields when parent toggles off
  const hasPrivacyPolicy = trimmed(a.hasPrivacyPolicy);
  if (!ALLOWED_ENUMS.hasPrivacyPolicy.has(hasPrivacyPolicy)) {
    return { error: 'Indicate whether you have a live Privacy Policy in Step 4.', status: 400 };
  }
  const privacyPolicyUrl = hasPrivacyPolicy === 'yes' ? trimmed(a.privacyPolicyUrl) : '';
  const websiteManager = hasPrivacyPolicy === 'no' ? trimmed(a.websiteManager).slice(0, 150) : '';
  const supportUrl = trimmed(a.supportUrl);
  const supportEmail = trimmed(a.supportEmail);
  const termsUrl = trimmed(a.termsUrl);
  const hasAccounts = trimmed(a.hasAccounts);
  if (!ALLOWED_ENUMS.hasAccounts.has(hasAccounts)) {
    return { error: 'Indicate whether users will create accounts in Step 4.', status: 400 };
  }
  const hasSocialLogin = hasAccounts === 'yes' ? trimmed(a.hasSocialLogin) : '';
  if (hasSocialLogin && !ALLOWED_ENUMS.hasSocialLogin.has(hasSocialLogin)) {
    return { error: 'Select a valid social login option in Step 4.', status: 400 };
  }

  if (hasPrivacyPolicy === 'yes' && !isValidHttpUrl(privacyPolicyUrl)) {
    return { error: 'Enter a valid Privacy Policy URL starting with https:// or http://.', status: 400 };
  }
  if (supportUrl && !isValidHttpUrl(supportUrl)) {
    return { error: 'Support URL must start with https:// or http://.', status: 400 };
  }
  if (!EMAIL_RE.test(supportEmail)) {
    return { error: 'Enter a valid Public Support Email in Step 4.', status: 400 };
  }
  if (termsUrl && !isValidHttpUrl(termsUrl)) {
    return { error: 'Terms of Service URL must start with https:// or http://.', status: 400 };
  }

  // Step 5
  const healthInvolvement = normalizeArray(a.healthInvolvement);
  const socialAiFeatures = normalizeArray(a.socialAiFeatures);
  const userDataCollected = normalizeArray(a.userDataCollected);
  const trackingAds = trimmed(a.trackingAds);
  const encryption = trimmedOrDefault(a.encryption, 'standard');

  if (
    healthInvolvement.length === 0 ||
    socialAiFeatures.length === 0 ||
    userDataCollected.length === 0 ||
    !ALLOWED_ENUMS.trackingAds.has(trackingAds) ||
    !ALLOWED_ENUMS.encryption.has(encryption)
  ) {
    return { error: 'Complete all required privacy & feature declarations in Step 5.', status: 400 };
  }

  // Step 6 — clear stale conditional fields when parent toggles off
  const monetization = normalizeArray(a.monetization);
  if (monetization.length === 0) {
    return { error: 'Select how the app will make money in Step 6.', status: 400 };
  }
  const needsApplePaidSetup = monetization.some((m) =>
    ['paid_download', 'iap_digital', 'subscriptions'].includes(m),
  );
  const showMonetizationCallout = monetization.some((m) =>
    ['paid_download', 'iap_digital', 'subscriptions', 'external_digital'].includes(m),
  );
  const paidAppsStatus = needsApplePaidSetup ? trimmed(a.paidAppsStatus) : '';
  const financeContactName = showMonetizationCallout ? trimmed(a.financeContactName).slice(0, 200) : '';
  const financeContactEmail = showMonetizationCallout ? trimmed(a.financeContactEmail) : '';

  if (needsApplePaidSetup && !ALLOWED_ENUMS.paidAppsStatus.has(paidAppsStatus)) {
    return { error: 'Select a valid Apple Paid Apps setup status in Step 6.', status: 400 };
  }
  if (financeContactEmail && !EMAIL_RE.test(financeContactEmail)) {
    return { error: 'Enter a valid Finance/Billing contact email address.', status: 400 };
  }

  // Step 7
  const launchWindow = trimmed(a.launchWindow).slice(0, 100);
  const reviewNotes = trimmed(a.reviewNotes);
  if (reviewNotes.length > 2000) {
    return { error: 'Special notes must be 2,000 characters or fewer.', status: 400 };
  }
  const sendClientCopy = Boolean(body.sendClientCopy);

  const assets = validateClaimedAssets(body.assets, sessionId);
  if (assets.error) return assets;

  return {
    data: {
      sessionId,
      submissionVersion,
      sendClientCopy,
      claimedAssets: assets.claimedAssets,
      answers: {
        legalName,
        brandName,
        contactName,
        contactEmail,
        contactPhone,
        websiteUrl,
        country: country.slice(0, 100),
        businessRegNumber: businessRegNumber.slice(0, 80),
        regulatedIndustries,
        publishingAccount,
        enrollmentStatus,
        accountHolderEmail,
        teamId: teamId.slice(0, 40),
        dunsNumber: dunsNumber.slice(0, 40),
        appName,
        appSummary,
        distributionGoal,
        primaryCategory: primaryCategory.slice(0, 100),
        primaryLocale: primaryLocale.slice(0, 100),
        targetDevices: targetDevices.slice(0, 50),
        ageRatingBand,
        kidsCategory,
        targetRegions,
        subtitle,
        promoText,
        draftDescription,
        keywords,
        brandKitUrl,
        brandColors,
        iconBackground,
        brandFonts,
        brandFontLicense,
        contentRights,
        hasPrivacyPolicy,
        privacyPolicyUrl,
        websiteManager,
        supportUrl,
        supportEmail,
        termsUrl,
        hasAccounts,
        hasSocialLogin,
        healthInvolvement,
        socialAiFeatures,
        userDataCollected,
        trackingAds,
        encryption,
        monetization,
        paidAppsStatus,
        financeContactName,
        financeContactEmail,
        launchWindow,
        reviewNotes,
      },
    },
  };
}

export function computeReadinessGaps(a, verifiedAssets = []) {
  const gaps = [];
  const add = (severity, code, title, clientTitle, detail, clientSummary) => {
    gaps.push({ severity, code, title, clientTitle, detail, clientSummary });
  };

  const regions = new Set(a.targetRegions || []);
  const hasWorldwide = regions.has('Worldwide');
  const hasEU = hasWorldwide || regions.has('European Union');
  const hasChina = hasWorldwide || regions.has('China Mainland');
  const hasUK = hasWorldwide || regions.has('United Kingdom');
  const hasAU = hasWorldwide || regions.has('Australia');
  const hasUS = hasWorldwide || regions.has('United States');
  const hasNonUS = hasWorldwide || Array.from(regions).some((r) => r !== 'United States');

  const regulatedSelected = (a.regulatedIndustries || []).filter((v) => v !== 'none');
  const hasMedicalClinical = (a.healthInvolvement || []).includes('medical_clinical');
  const isRegulated = regulatedSelected.length > 0 || hasMedicalClinical;

  const hasHealthData =
    (a.healthInvolvement || []).some((v) =>
      ['healthkit', 'health_biometric', 'medical_clinical'].includes(v),
    ) || (a.userDataCollected || []).includes('health_fitness');
  const hasTrackingAds = a.trackingAds === 'ad_tracking';
  const isKids = a.kidsCategory === 'yes';

  const socialSet = new Set(a.socialAiFeatures || []);
  const hasSocialFeed = socialSet.has('social_feed');
  const hasUGC = socialSet.has('ugc');
  const hasAI = socialSet.has('ai_features');
  const hasLiveLocation = socialSet.has('live_location');
  const hasDating = socialSet.has('dating');
  const hasAnySocialAi = hasSocialFeed || hasUGC || hasAI || hasLiveLocation || hasDating;

  const monSet = new Set(a.monetization || []);
  const hasPaidDownload = monSet.has('paid_download');
  const hasIapDigital = monSet.has('iap_digital');
  const hasSubscriptions = monSet.has('subscriptions');
  const hasExternalDigital = monSet.has('external_digital');
  const hasApplePaid = hasPaidDownload || hasIapDigital || hasSubscriptions;

  // 1. Privacy Policy missing -> Blocker
  if (a.hasPrivacyPolicy === 'no') {
    const mgr = a.websiteManager ? ` (Website managed via: ${a.websiteManager})` : '';
    add(
      'Blocker',
      'PRIVACY_POLICY_MISSING',
      'Privacy Policy URL required',
      'Privacy Policy page needed',
      `Create and host a live Privacy Policy URL required in App Store Connect AND inside the app (Guideline 5.1.1(i)).${mgr}`,
      'A live Privacy Policy page is required before submitting to Apple. Renatus can help set this up.',
    );
  }

  // 2. Regulated Industry / Clinical Medical -> Blocker if not own Org, plus universal Requirement
  if (isRegulated) {
    if (a.publishingAccount !== 'own' || a.enrollmentStatus !== 'org_active') {
      add(
        'Blocker',
        'REGULATED_ENTITY_ACCOUNT',
        'Regulated industry requires own Organization Developer account',
        'Company Apple Developer account required',
        'Guidelines 5.1.1(ix) (healthcare/banking/crypto/gambling/cannabis/air travel), 5.3 (real-money gaming), 5.4 (VPN NEVPNManager + Org), and 5.5 (MDM) require publishing under the regulated legal entity’s own Organization Apple Developer account.',
        'Apps in regulated industries must be published under your own company’s Apple Developer Organization account.',
      );
    }
    add(
      'Requirement',
      'REGULATED_COMPLIANCE',
      'Regulated industry licensing & technical compliance',
      'Industry licensing & regional checks',
      'Verify mandatory licensing, regional geo-restrictions, and technical rules: 5.1.1(ix) regulated entity verification, 3.2.2(ix) lending limits, 5.3 free-to-download/no-IAP real-money gaming, 5.4 NEVPNManager/no data selling, 5.5 Apple-granted MDM capability.',
      'We will confirm any required licenses or regional restrictions before submission.',
    );
  }

  // 3. Own Account enrollment lead time -> Blocker if not yet active Org
  if (a.publishingAccount === 'own' && a.enrollmentStatus !== 'org_active') {
    add(
      'Blocker',
      'ORG_ENROLLMENT_REQUIRED',
      'Apple Organization enrollment required (2–6 weeks lead time)',
      'Apple Organization account enrollment needed',
      `Client must complete Apple Organization enrollment/migration${
        !a.dunsNumber ? ' (obtaining a D-U-N-S number first)' : ''
      }. Allow 2–6 weeks for enrollment/verification, or up to 60+ days for individual-to-organization migrations.`,
      'Start your Apple Developer Organization enrollment early—Apple verification typically takes 2–6 weeks.',
    );
  }

  // 4. Terms / EULA missing for Subscriptions or UGC -> Blocker
  if (!a.termsUrl && (hasSubscriptions || hasUGC)) {
    add(
      'Blocker',
      'TERMS_EULA_MISSING',
      'Terms of Service / EULA URL required',
      'Terms of Service page needed',
      'Terms/EULA URL is mandatory in-app and in metadata for auto-renewable subscriptions (Guideline 3.1.2) and user-generated content (zero-tolerance EULA, Guideline 1.2).',
      'A live Terms of Service / User Agreement page is required for subscriptions or user-posted content.',
    );
  }

  // 5. Kids or Health + Tracking/Ads -> Blocker
  if ((isKids || hasHealthData) && hasTrackingAds) {
    add(
      'Blocker',
      'PROHIBITED_TRACKING_COMBINATION',
      'Cross-app tracking / ad SDKs prohibited with Kids or Health data',
      'In-app ad tracking conflicts with Kids or Health rules',
      'Kids apps cannot use third-party ad/analytics SDKs or IDFA (Guidelines 1.3, 5.1.4); HealthKit and health data can never be used for ads, marketing, or data mining (Guidelines 5.1.2(vi), 5.1.3).',
      'In-app ad tracking cannot be combined with Kids apps or health/fitness data.',
    );
  }

  // 6. External digital billing outside US -> Blocker
  if (hasExternalDigital && hasNonUS) {
    add(
      'Blocker',
      'EXTERNAL_DIGITAL_NON_US',
      'External digital billing restricted outside US storefront',
      'External digital billing rules to review',
      'Guideline 3.1.1: no-entitlement external purchase links are US-storefront-only. Outside the US, digital access requires StoreKit IAP, a 3.1.3 exemption (Reader/Multiplatform/Enterprise), or regional entitlements (EU DMA Attachment 14: disclosure sheet, 12-month lock-in, monthly reporting).',
      'Selling digital memberships outside Apple’s billing has strict regional rules—we will review the compliant payment setup with you.',
    );
  }

  // 7. Apple Paid Apps setup -> Blocker if not Already Active; Requirement if Already Active
  if (hasApplePaid) {
    if (a.paidAppsStatus !== 'already_active') {
      add(
        'Blocker',
        'PAID_APPS_LODGING',
        'Apple Paid Apps Agreement, tax & banking setup needed',
        'Apple Paid Apps, tax & banking setup',
        'Schedule secure 1:1 Paid Apps Agreement, tax & banking lodging in App Store Connect. First IAP/subscription of each type must submit with a new app version (Aug 2026 rule); Restore Purchases required for non-consumables (3.1.1) & subscriptions (3.1.2); review default-on Multiseat/Volume Purchasing (Oct 2026).',
        'We will walk you through Apple’s Paid Apps Agreement, tax, and banking setup securely 1:1.',
      );
    } else {
      add(
        'Requirement',
        'PAID_APPS_ACTIVE_CHECKS',
        'Paid Apps & IAP submission checks',
        'Apple billing & subscription checks',
        'Verify latest ADPLA acceptance (13 Oct 2026), submit first IAP/subscription with a new app version (Aug 2026 rule), implement Restore Purchases (3.1.1 / 3.1.2), and check default-on Multiseat/Volume Purchasing setting (Oct 2026).',
        'We will verify your active Apple Paid Apps setup and subscription settings before submission.',
      );
    }
  }

  // 8. European Union -> Blocker
  if (hasEU) {
    const extras = [];
    if (hasAI) extras.push('EU AI Act (Art. 4/5/50 notices & AI markings)');
    if (hasHealthData) extras.push('GDPR Art. 9 explicit consent for health/biometric data');
    if (hasTrackingAds) extras.push('EU alternative ATT prompt (DE/FR/IT/PL/RO on iOS 27.2+)');
    if (hasExternalDigital) extras.push('EU DMA Attachment 14 entitlement & monthly reporting');
    add(
      'Blocker',
      'EU_COMPLIANCE',
      'European Union DSA Trader Status & accessibility required',
      'European Union launch verification required',
      `EU DSA Trader Status must be declared & verified in App Store Connect (missing declaration removes app from EU storefronts), and EAA WCAG 2.1 AA / EN 301 549 accessibility info is required.${
        extras.length ? ` Conditional EU rules: ${extras.join('; ')}.` : ''
      }`,
      'Launching in the EU requires business trader verification and accessibility details in App Store Connect.',
    );
  }

  // 9. China Mainland -> Blocker
  if (hasChina) {
    add(
      'Blocker',
      'CHINA_COMPLIANCE',
      'China Mainland MIIT filing & App Compliance declarations required',
      'China Mainland launch registration required',
      'Requires MIIT app filing with a local Chinese entity (plus Banhao license for games) and mandatory App Store Connect App Compliance declarations (AI-Generated/Synthetic Content & Security Assessment, required even if No; existing apps deadline 31 Jan 2027). External AI references (ChatGPT/Gemini) trigger regional rejection.',
      'Launching in China Mainland requires local Chinese entity registration and additional compliance filings.',
    );
  }

  // 10. Renatus account for public/unlisted launch -> Warning (4.2.6 / 5.2)
  if (a.publishingAccount === 'renatus' && a.distributionGoal !== 'testflight') {
    add(
      'Warning',
      'RENATUS_ACCOUNT_PUBLIC_LAUNCH',
      'Public launch under Renatus account (Guideline 4.2.6 / 5.2 check)',
      'Brand authorization for publishing under Renatus’s account',
      'Submitting a standalone client-branded app under Renatus’s Apple Developer account risks Guideline 4.2.6 (template/reseller) and 5.2 (IP) rejection. Confirm eligibility and prepare written brand/IP authorization (or migrate to the client’s own account).',
      'We will prepare written brand authorization so Apple approves publishing your brand under Renatus’s account.',
    );
  }

  // 11. Own Account active Org missing Team ID -> Action Needed
  if (a.publishingAccount === 'own' && a.enrollmentStatus === 'org_active' && !a.teamId) {
    add(
      'Action Needed',
      'OWN_ACCOUNT_ACCESS',
      'Confirm Apple Developer Team ID & invite Renatus',
      'Invite Renatus to your Apple account',
      'Verify active Organization membership, confirm Account Holder accepted latest ADPLA (13 Oct 2026), and invite Renatus to App Store Connect.',
      'We will send quick instructions to invite Renatus to your App Store Connect account.',
    );
  }

  // 12. Kids Category -> Requirement
  if (isKids) {
    add(
      'Requirement',
      'KIDS_CATEGORY',
      'Kids Category privacy & parental gate rules',
      'Kids app privacy & parental controls',
      `Guidelines 1.3 & 5.1.4: parental gate on all exits/purchases, zero third-party ad/analytics SDKs, COPPA Verifiable Parental Consent if collecting data, and EU DMA ban on out-of-app website purchases.${
        hasUK ? ' UK Online Safety Act Children’s Code defaults apply for UK storefront.' : ''
      }`,
      'Kids Category apps require parental gates and strict child-privacy safeguards.',
    );
  }

  // 13. Accounts -> Requirement
  if (a.hasAccounts === 'yes') {
    add(
      'Requirement',
      'ACCOUNT_REQUIREMENTS',
      'In-app account deletion, demo login & Sign in with Apple',
      'Account deletion & Apple review login',
      `Mandatory in-app account & data deletion + optional login for non-core features (5.1.1(v)), working reviewer demo account with no 2FA blocker (2.1)${
        a.hasSocialLogin === 'yes'
          ? ', and Sign in with Apple (4.8, supporting both privaterelay.appleid.com and private.icloud.com)'
          : ''
      }.`,
      'Because users will have accounts, the app will include in-app account deletion and a test login for Apple’s review team.',
    );
  }

  // 14. Health / Fitness / Medical -> Requirement
  if (hasHealthData) {
    add(
      'Requirement',
      'HEALTH_COMPLIANCE',
      'Health & fitness disclaimers and privacy rules',
      'Health disclaimers & privacy safeguards',
      'Add validated health disclaimers (1.4.1), specific HealthKit purpose strings, and ensure zero health data is used for ads/marketing (5.1.2(vi), 5.1.3).',
      'We will include appropriate health disclaimers and strict health-data privacy controls.',
    );
  }

  // 15. Social / UGC / AI / Live Location / Dating -> Requirement
  if (hasAnySocialAi) {
    const notes = [];
    if (hasSocialFeed) {
      notes.push(
        `Mandatory Social Media declaration (2.3.6, min 13+, Declared Age Range API for under-13${
          hasAU ? '; Australia under-16 age assurance' : ''
        }${hasUK ? '; UK Online Safety Act Highly Effective Age Assurance' : ''}${
          hasUS ? '; US Declared Age Range + RESCIND_CONSENT' : ''
        })`,
      );
    }
    if (hasUGC) {
      notes.push(
        `UGC content filtering, report/block & 24h removal (1.2, 1.2.1(a) creator age gating${
          hasUS ? '; US NCMEC CyberTipline 1-yr preservation' : ''
        })`,
      );
    }
    if (hasAI) {
      notes.push(
        'Third-party AI consent modal naming provider & data types (5.1.2(i)) + Oct 2026 Guideline 1.2 AI moderation & intimate-imagery safeguards',
      );
    }
    if (hasLiveLocation || hasDating) {
      notes.push('Nov 2026 App Store Connect age rating descriptors (Shared Location / Dating & Relationships)');
    }
    add(
      'Requirement',
      'SOCIAL_AI_COMPLIANCE',
      'Social, UGC, AI & age-descriptor compliance',
      'Community, AI & safety declarations',
      `${notes.join('; ')}.`,
      'We will configure the required moderation, AI disclosure, and age-rating declarations for your app features.',
    );
  }

  // 16. Age Band conflicts & 18+ gating -> Warning
  const ageOrder = { '4+': 4, '9+': 9, '13+': 13, '16+': 16, '18+': 18 };
  const numericAge = ageOrder[a.ageRatingBand];
  const socialConflict = hasSocialFeed && numericAge && numericAge < 13;
  const datingConflict = hasDating && numericAge && numericAge < 18;
  const is18Plus = a.ageRatingBand === '18+' || hasDating;
  if (socialConflict || datingConflict || is18Plus) {
    const parts = [];
    if (socialConflict) parts.push('Social Media requires minimum 13+ rating (Guideline 2.3.6)');
    if (datingConflict) parts.push('Dating & Relationships requires minimum 18+ rating (Nov 2026)');
    if (is18Plus) {
      parts.push(
        `18+ download gating applies in Australia, Brazil, and Singapore (Feb 2026 Apple block)${
          hasUK ? ' and UK Online Safety Act Highly Effective Age Assurance' : ''
        }`,
      );
    }
    add(
      'Warning',
      'AGE_RATING_GATING',
      'Age rating floor or 18+ download gating',
      'Age rating adjustment & regional checks',
      `${parts.join('; ')}.`,
      'Your selected features affect the minimum App Store age rating—we will confirm the final rating during setup.',
    );
  }

  // 17. Tracking/Ads without Kids/Health conflict -> Requirement
  if (hasTrackingAds && !isKids && !hasHealthData) {
    add(
      'Requirement',
      'ATT_TRACKING',
      'App Tracking Transparency (ATT) prompt & Privacy Manifest',
      'Tracking permission prompt required',
      'Implement ATT prompt before cross-app tracking (5.1.2(i)) and match App Privacy nutrition labels + PrivacyInfo.xcprivacy across all SDKs.',
      'In-app tracking requires Apple’s permission prompt before collecting tracking data.',
    );
  }

  // 18. Worldwide OFAC -> Requirement
  if (hasWorldwide) {
    add(
      'Requirement',
      'OFAC_EXCLUSIONS',
      'Exclude OFAC embargoed territories',
      'Standard regional availability exclusions',
      'Confirm App Store Connect storefront availability excludes OFAC embargoed territories.',
      'Standard regional export exclusions will be applied for worldwide distribution.',
    );
  }

  // 19. Content Rights -> Requirement
  if (a.contentRights === 'licensed' || isUnsureValue(a.contentRights)) {
    add(
      'Requirement',
      'CONTENT_RIGHTS',
      'Confirm third-party content & IP rights',
      'Third-party media rights check',
      'Keep written proof of rights available for App Store Connect Content Rights question (Guideline 5.2).',
      'We will verify licensing documentation for any third-party media used in the app.',
    );
  }

  // 20. Encryption -> Action Needed
  if (a.encryption === 'custom' || isUnsureValue(a.encryption)) {
    add(
      'Action Needed',
      'EXPORT_COMPLIANCE',
      'Verify export compliance & encryption docs',
      'Security & encryption classification check',
      `Verify ITSAppUsesNonExemptEncryption export compliance documentation${
        hasEU ? ' (and France ANSSI declaration if shipping to France)' : ''
      }.`,
      'We will confirm your app’s encryption classification before upload.',
    );
  }

  // 21. Support URL blank -> Warning
  if (!a.supportUrl) {
    add(
      'Warning',
      'SUPPORT_URL_MISSING',
      'Confirm live Support URL',
      'Confirm website support page',
      'Apple requires a working Support URL (Guideline 1.5); confirm whether the main website contact page can be used.',
      'We will confirm the best contact/support page URL from your website for the App Store listing.',
    );
  }

  // 22. No brand assets & no folder URL -> Warning
  if (verifiedAssets.length === 0 && !a.brandKitUrl) {
    add(
      'Warning',
      'BRAND_ASSETS_MISSING',
      'Brand assets / icon artwork needed',
      'Logo & brand assets to send later',
      'Request square brandmark/logo (no Apple device imagery) and brand colors before generating the 1024x1024 app icon & splash screen.',
      'Send over your logo or brand kit when ready so we can prepare your app icon and branding.',
    );
  }

  // 23. Any "Not sure" selections -> Action Needed
  const unsureFields = [
    ['Publishing Account', a.publishingAccount],
    ['Target Age Rating', a.ageRatingBand],
    ['Kids Category', a.kidsCategory],
    ['Brand Font License', a.brandFontLicense],
    ['Content Rights', a.contentRights],
    ['User Accounts', a.hasAccounts],
    ['Social Login', a.hasSocialLogin],
    ['User Data Collected', a.userDataCollected],
    ['In-App Tracking', a.trackingAds],
    ['Encryption', a.encryption],
    ['Monetization', a.monetization],
  ]
    .filter(([, val]) => isUnsureValue(val))
    .map(([label]) => label);

  if (unsureFields.length > 0) {
    add(
      'Action Needed',
      'UNSURE_FOLLOWUP',
      'Follow up on "Not sure" selections',
      'Items to review together on kickoff',
      `Review client’s "Not sure" selections on kickoff call: ${unsureFields.join(', ')}.`,
      `No problem on the items marked "Not sure" (${unsureFields.join(', ')})—we will walk through them together on kickoff.`,
    );
  }

  // 24. Optional pre-build metadata deferred -> Info (Deferred)
  const deferredMeta = [];
  if (!a.subtitle) deferredMeta.push('Subtitle');
  if (!a.promoText) deferredMeta.push('Promotional Text');
  if (!a.draftDescription) deferredMeta.push('Draft Description');
  if (!a.keywords) deferredMeta.push('Keywords');
  if (deferredMeta.length > 0) {
    add(
      'Info (Deferred)',
      'METADATA_DEFERRED',
      'Pre-build store copy deferred',
      'Optional store copy saved for build stage',
      `Deferred until app build stage: ${deferredMeta.join(', ')}.`,
      `Deferred until build stage: ${deferredMeta.join(', ')}.`,
    );
  }

  return gaps;
}

export function computeBrandFollowUps(answers, verifiedAssets) {
  const followUps = [];
  if (!answers.brandKitUrl && verifiedAssets.length === 0) {
    followUps.push({
      severity: 'Action Needed',
      code: 'BRAND_ASSETS_MISSING',
      title: 'Request the logo or brand kit',
      detail: 'Ask for a logo file or shareable brand kit link before preparing app visuals.',
    });
  }
  if (!answers.brandColors) {
    followUps.push({
      severity: 'Action Needed',
      code: 'BRAND_COLORS_MISSING',
      title: 'Confirm brand colours',
      detail: 'Check the supplied brand materials or confirm colours with the client.',
    });
  }
  return followUps;
}

export function buildShaunEmail(record, signedAssets = []) {
  const { id, answers: a, gaps } = record;
  const subject = `App Store Intake: ${sanitizeSubject(a.brandName, 60)} (${sanitizeSubject(a.appName, 30)})`;
  const quickIntake = record.submissionVersion === QUICK_INTAKE_VERSION;
  const summaryTitle = quickIntake ? 'Kickoff follow-ups' : 'Readiness & Gap Summary';
  const nextSteps = 'Assign a Renatus owner and link this intake reference in the project workspace. Discuss personal information and health or fitness features at kickoff, then confirm both during the build.';

  const gapRowsHtml = gaps
    .map(
      (g) =>
        `<tr><td style="padding:6px 10px;border:1px solid #d3d6e0;font-weight:600;white-space:nowrap;">${escapeHtml(
          g.severity,
        )}</td><td style="padding:6px 10px;border:1px solid #d3d6e0;"><strong>${escapeHtml(
          g.title,
        )}</strong><br/>${escapeHtml(g.detail)}</td></tr>`,
    )
    .join('');

  const assetLinksHtml = signedAssets.length
    ? `<ul>${signedAssets
        .map(
          (f) =>
            `<li><a href="${escapeHtml(f.signedUrl)}">${escapeHtml(f.name)}</a> (${Math.round(
              (f.size || 0) / 1024,
            )} KB)</li>`,
        )
        .join('')}</ul>`
    : '<p>No files uploaded directly.</p>';

  const sections = quickIntake ? [
    ['Record ID', id],
    ['Legal Business Name', a.legalName],
    ['Trading / Brand Name', a.brandName],
    ['Primary Contact', `${a.contactName} (${a.contactEmail} / ${a.contactPhone})`],
    ['Website', a.websiteUrl || '—'],
    ['Brand Kit Link', a.brandKitUrl || '—'],
    ['Brand Colours', a.brandColors || '—'],
    ['Preferred App Name', a.appName],
    ['App Description', a.appSummary],
  ] : [
    ['Record ID', id],
    ['Legal Business Name', a.legalName],
    ['Brand Name', a.brandName],
    ['Primary Contact', `${a.contactName} (${a.contactEmail} / ${a.contactPhone})`],
    ['Website', a.websiteUrl],
    ['Country / Reg #', `${a.country}${a.businessRegNumber ? ` — ${a.businessRegNumber}` : ''}`],
    ['Regulated Industries', (a.regulatedIndustries || []).join(', ')],
    [
      'Publishing Account',
      `${a.publishingAccount}${a.enrollmentStatus ? ` (${a.enrollmentStatus})` : ''}${
        a.accountHolderEmail ? ` | Holder: ${a.accountHolderEmail}` : ''
      }${a.teamId ? ` | Team ID: ${a.teamId}` : ''}${a.dunsNumber ? ` | D-U-N-S: ${a.dunsNumber}` : ''}`,
    ],
    ['App Name / Category', `${a.appName} — ${a.primaryCategory}`],
    ['Distribution Goal', a.distributionGoal],
    ['Locale / Devices', `${a.primaryLocale} | ${a.targetDevices}`],
    ['Age Band / Kids', `${a.ageRatingBand} | Kids: ${a.kidsCategory}`],
    ['Target Regions', (a.targetRegions || []).join(', ')],
    ['App Summary', a.appSummary],
    ['Optional Copy (Subtitle / Promo / Keywords)', `${a.subtitle || '—'} | ${a.promoText || '—'} | ${a.keywords || '—'}`],
    ['Draft App Store Description', a.draftDescription || '—'],
    [
      'Brand Kit URL / Colors / Fonts',
      `${a.brandKitUrl || '—'} | ${a.brandColors || '—'} | ${a.brandFonts || '—'}${
        a.brandFontLicense ? ` (${a.brandFontLicense})` : ''
      }`,
    ],
    ['Preferred Icon BG / Content Rights', `${a.iconBackground || '—'} | ${a.contentRights}`],
    [
      'Privacy Policy / Support / Terms',
      `Privacy: ${a.hasPrivacyPolicy === 'yes' ? a.privacyPolicyUrl : `Missing (${a.websiteManager || 'manager unspecified'})`} | Support: ${a.supportUrl || '—'} (${a.supportEmail}) | Terms: ${a.termsUrl || '—'}`,
    ],
    ['Accounts / Social Login', `${a.hasAccounts} | Social: ${a.hasSocialLogin || '—'}`],
    ['Health Involvement', (a.healthInvolvement || []).join(', ')],
    ['Social / UGC / AI / Location / Dating', (a.socialAiFeatures || []).join(', ')],
    ['User Data Collected', (a.userDataCollected || []).join(', ')],
    ['Tracking / Encryption', `${a.trackingAds} | ${a.encryption}`],
    [
      'Monetization / Paid Apps Status',
      `${(a.monetization || []).join(', ')}${a.paidAppsStatus ? ` (${a.paidAppsStatus})` : ''}`,
    ],
    [
      'Finance / Billing Contact',
      a.financeContactName || a.financeContactEmail
        ? `${a.financeContactName || '—'} (${a.financeContactEmail || '—'})`
        : '—',
    ],
    ['Launch Window / Notes', `${a.launchWindow || '—'} | ${a.reviewNotes || '—'}`],
  ];

  const qaRowsHtml = sections
    .map(
      ([label, val]) =>
        `<tr><td style="padding:6px 10px;border:1px solid #d3d6e0;font-weight:600;width:220px;">${escapeHtml(
          label,
        )}</td><td style="padding:6px 10px;border:1px solid #d3d6e0;">${escapeHtml(val)}</td></tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#126656;max-width:720px;">
      <h2>iOS App Store Intake — ${escapeHtml(a.brandName)} (${escapeHtml(a.appName)})</h2>
      <h3>${escapeHtml(summaryTitle)}</h3>
      ${quickIntake ? `<p>${nextSteps}</p>` : ''}
      ${gapRowsHtml ? `<table style="border-collapse:collapse;width:100%;margin-bottom:20px;">${gapRowsHtml}</table>` : ''}
      <h3>Uploaded Brand Assets (7-day download links)</h3>
      ${assetLinksHtml}
      <h3>Full Submission</h3>
      <table style="border-collapse:collapse;width:100%;">${qaRowsHtml}</table>
    </div>
  `.trim();

  const text = [
    `iOS App Store Intake — ${a.brandName} (${a.appName})`,
    `Record ID: ${id}`,
    '',
    summaryTitle,
    ...(quickIntake ? [nextSteps] : []),
    ...gaps.map((g) => `[${g.severity}] ${g.title}: ${g.detail}`),
    '',
    '=== UPLOADED ASSETS (7-DAY DOWNLOAD LINKS) ===',
    ...(signedAssets.length
      ? signedAssets.map((f) => `- ${f.name}: ${f.signedUrl}`)
      : ['(None uploaded directly)']),
    '',
    '=== FULL SUBMISSION ===',
    ...sections.map(([label, val]) => `${label}: ${val}`),
  ].join('\n');

  return { subject, html, text };
}

export function buildClientReceiptEmail(record) {
  // Static, spam-hardened receipt: NO attacker-controlled free text, NO arbitrary URLs, NO signed Storage links.
  const { id, createdAt, gaps } = record;
  const subject = 'We received your iOS App Store onboarding intake | Renatus';
  const quickIntake = record.submissionVersion === QUICK_INTAKE_VERSION;
  const nextSteps = quickIntake
    ? 'On the kickoff call, we’ll discuss how your app will use personal information and any health or fitness features you have in mind.'
    : 'Our team will review your submission and follow up with next steps shortly.';
  const receiptGaps = quickIntake ? [] : gaps;
  const summaryTitle = quickIntake ? 'What happens next' : 'Readiness Summary & Next Steps';

  const itemsHtml = receiptGaps
    .map(
      (g) =>
        `<li><strong>${escapeHtml(g.severity)}:</strong> ${escapeHtml(g.clientTitle || 'Next step')} — ${escapeHtml(
          g.clientSummary || '',
        )}</li>`,
    )
    .join('');

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#126656;max-width:640px;">
      <h2>Thanks — we have received your iOS App Store onboarding intake.</h2>
      <p><strong>Reference ID:</strong> ${escapeHtml(id)}<br/>
      <strong>Submitted:</strong> ${escapeHtml(createdAt || new Date().toISOString())}</p>
      <h3>${escapeHtml(summaryTitle)}</h3>
      ${itemsHtml ? `<ul>${itemsHtml}</ul>` : ''}
      <p>${nextSteps}</p>
    </div>
  `.trim();

  const text = [
    'Thanks — we have received your iOS App Store onboarding intake.',
    `Reference ID: ${id}`,
    `Submitted: ${createdAt || new Date().toISOString()}`,
    '',
    summaryTitle,
    ...receiptGaps.map((g) => `- [${g.severity}] ${g.clientTitle || 'Next step'}: ${g.clientSummary || ''}`),
    '',
    nextSteps,
  ].join('\n');

  return { subject, html, text };
}

export async function sendIntakeEmails(record, signedAssets, env = process.env) {
  const key = env.RESEND_API_KEY;
  if (!key) {
    return { emailDelivered: false, error: 'RESEND_API_KEY not configured.' };
  }

  try {
    const to = env.ENQUIRY_TO || 'shaun@renatusco.com';
    const from = env.RESEND_FROM || 'Renatus <shaun@renatusco.com>';
    const resend = new Resend(key);

    const shaunEmail = buildShaunEmail(record, signedAssets);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: record.answers.contactEmail,
      subject: shaunEmail.subject,
      html: shaunEmail.html,
      text: shaunEmail.text,
    });

    if (error) {
      console.error('[intake] Resend Shaun email failed:', error.message);
      return { emailDelivered: false, error: error.message };
    }

    if (record.sendClientCopy && record.clientReceiptAllowed !== false) {
      const clientEmail = buildClientReceiptEmail(record);
      const { error: clientErr } = await resend.emails.send({
        from,
        to: record.answers.contactEmail,
        subject: clientEmail.subject,
        html: clientEmail.html,
        text: clientEmail.text,
      });
      if (clientErr) {
        console.error('[intake] Resend client receipt failed:', clientErr.message);
      }
    }

    return { emailDelivered: true };
  } catch (err) {
    console.error('[intake] Resend unexpected error:', err?.message);
    return { emailDelivered: false, error: err?.message || 'Email delivery failed.' };
  }
}
