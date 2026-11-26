export const STORAGE_KEY = 'renatus_ios_intake_v1';
export const LEGACY_INTAKE_VERSION = 1;
export const QUICK_INTAKE_VERSION = 2;

export const MAX_FILES = 10;
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = new Set([
  '.png', '.svg', '.jpg', '.jpeg', '.webp', '.pdf', '.zip', '.eps', '.ttf', '.otf', '.woff2',
]);

export const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const E164_RE = /^\+[1-9]\d{6,14}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const COUNTRY_CODES = [
  { code: '+61', label: 'AU (+61)' },
  { code: '+64', label: 'NZ (+64)' },
  { code: '+1', label: 'US/CA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+63', label: 'PH (+63)' },
];

export const DEFAULT_ANSWERS = {
  legalName: '',
  brandName: '',
  brandNameMatchesLegalName: false,
  contactName: '',
  contactEmail: '',
  phoneCountryCode: '+61',
  phoneNumber: '',
  websiteUrl: '',
  brandKitUrl: '',
  brandColors: '',
  appName: '',
  appSummary: '',
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

export function normalizePhone(raw, countryCode = '+61') {
  const cleaned = String(raw || '')
    .trim()
    .replace(/[\s\-().]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  const digits = cleaned.replace(/^0+/, '');
  return digits ? (countryCode || '+61') + digits : '';
}

export function isValidHttpUrl(raw) {
  try {
    const { protocol } = new URL(String(raw || '').trim());
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

export function getExtension(filename) {
  const index = filename.lastIndexOf('.');
  return index > 0 ? filename.slice(index).toLowerCase() : '';
}

export function intakeObjectFolder(sessionId, legacy = false) {
  return legacy ? sessionId : `intake/${sessionId}`;
}

export function resolveIntakeObjectPath(sessionId, path) {
  if (typeof sessionId !== 'string' || !UUID_V4_RE.test(sessionId) || typeof path !== 'string' || path.includes('..')) return null;
  const legacy = !path.startsWith('intake/');
  const [storedSessionId, name, extra] = (legacy ? path : path.slice('intake/'.length)).split('/');
  if (extra !== undefined || storedSessionId.toLowerCase() !== sessionId.toLowerCase()) return null;
  if (!name || !/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  // Preserve the earlier filename contract for uploads already in a draft.
  if (!legacy && !/^[a-f0-9]{8}-.+$/.test(name)) return null;
  return {
    name,
    legacy,
    legacyPath: `${intakeObjectFolder(storedSessionId, true)}/${name}`,
    targetPath: `${intakeObjectFolder(storedSessionId)}/${name}`,
  };
}

export function isValidSingleSegmentPath(sessionId, path) {
  return Boolean(resolveIntakeObjectPath(sessionId, path));
}

export function restoreIntakeDraft(raw) {
  try {
    const saved = JSON.parse(raw);
    if (!saved || !UUID_V4_RE.test(saved.sessionId)) return null;

    const answers = { ...DEFAULT_ANSWERS };
    for (const key of Object.keys(answers)) {
      const value = saved.answers?.[key];
      if (typeof value === typeof answers[key]) answers[key] = value;
    }

    const assets = new Map();
    for (const asset of Array.isArray(saved.assets) ? saved.assets : []) {
      const key = resolveIntakeObjectPath(saved.sessionId, asset?.path);
      if (key && (!assets.has(key.name) || !key.legacy)) assets.set(key.name, asset);
    }

    return {
      sessionId: saved.sessionId,
      answers,
      assets: [...assets.values()],
      sendClientCopy: typeof saved.sendClientCopy === 'boolean' ? saved.sendClientCopy : true,
    };
  } catch {
    return null;
  }
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export const PHONE_COUNTRY_CODE_RE = /^\+[1-9]\d{0,3}$/;

export function validateQuickIntakeAnswers(input) {
  const a = input ?? {};
  const legalName = text(a.legalName);
  const brandNameMatchesLegalName = a.brandNameMatchesLegalName === true;
  const rawCountryCode = text(a.phoneCountryCode);
  const phoneCountryCode = rawCountryCode || '+61';
  const answers = {
    legalName,
    brandName: brandNameMatchesLegalName ? legalName : text(a.brandName),
    brandNameMatchesLegalName,
    contactName: text(a.contactName),
    contactEmail: text(a.contactEmail).toLowerCase(),
    phoneCountryCode,
    contactPhone: normalizePhone(text(a.contactPhone), phoneCountryCode),
    websiteUrl: text(a.websiteUrl) || null,
    brandKitUrl: text(a.brandKitUrl) || null,
    brandColors: text(a.brandColors),
    appName: text(a.appName),
    appSummary: text(a.appSummary),
  };

  const errors = {};
  for (const [field, label] of [
    ['legalName', 'legal business name'],
    ['brandName', 'trading or brand name'],
    ['contactName', 'contact name'],
  ]) {
    if (field === 'brandName' && brandNameMatchesLegalName) continue;
    if (!answers[field]) {
      errors[field] = 'Enter your ' + label + '.';
    } else if (answers[field].length > 200) {
      errors[field] = 'Use 200 characters or fewer.';
    }
  }
  if (!EMAIL_RE.test(answers.contactEmail)) errors.contactEmail = 'Enter a valid contact email address.';
  if (!PHONE_COUNTRY_CODE_RE.test(phoneCountryCode) || !E164_RE.test(answers.contactPhone)) {
    errors.contactPhone = 'Enter a valid phone number, including its country code.';
  }
  if (answers.websiteUrl && (!/^https?:\/\//i.test(answers.websiteUrl) || !isValidHttpUrl(answers.websiteUrl))) {
    errors.websiteUrl = 'Enter a website URL starting with https:// or http://.';
  }
  if (answers.brandKitUrl && (!/^https?:\/\//i.test(answers.brandKitUrl) || !isValidHttpUrl(answers.brandKitUrl))) {
    errors.brandKitUrl = 'Enter a brand kit link starting with https:// or http://.';
  }
  if (answers.brandColors.length > 300) errors.brandColors = 'Use 300 characters or fewer.';
  if (answers.appName.length < 2 || answers.appName.length > 30) {
    errors.appName = 'Use 2 to 30 characters for your app name.';
  }
  if (!answers.appSummary) {
    errors.appSummary = 'Tell us who the app is for and what they’ll do in it.';
  } else if (answers.appSummary.length > 2000) {
    errors.appSummary = 'Use 2,000 characters or fewer.';
  }

  return { answers, errors };
}
