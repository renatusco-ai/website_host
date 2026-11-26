export const STAFF_CONTROLS_VERSION = 1;

export const STAFF_STAGES = Object.freeze(['kickoff', 'build', 'legal', 'listing', 'review']);
const STAFF_STAGE_SET = new Set(STAFF_STAGES);

const MAX_STRING_LENGTH = 10_000;
const MAX_QUESTIONS = 200;
const MAX_RECORDS_PER_CATEGORY = 200;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DECIMAL_RE = /^\d+(?:\.\d+)?$/;

export const STAFF_BOOLEAN_KEYS = new Set([
  // Kickoff and Apple account
  'metadata-choice-data-purposes-signin',
  'metadata-choice-data-purposes-bookings',
  'metadata-choice-data-purposes-support',
  'metadata-choice-data-purposes-analytics',
  'metadata-choice-data-purposes-personalisation',
  'metadata-choice-data-purposes-payments',
  'metadata-other-data-purposes',
  'metadata-choice-regulated-industries-healthcare',
  'metadata-choice-regulated-industries-finance',
  'metadata-choice-regulated-industries-gaming',
  'metadata-choice-regulated-industries-cannabis',
  'metadata-choice-regulated-industries-devices',
  'metadata-choice-regulated-industries-none',
  'metadata-other-regulated-industries',
  'metadata-choice-target-devices-iphone',
  'metadata-choice-target-devices-ipad',
  'metadata-choice-content-rights-client',
  'metadata-choice-content-rights-renatus',
  'metadata-choice-content-rights-licensed',
  'metadata-choice-content-rights-openSource',
  'metadata-choice-content-rights-user',
  'metadata-choice-content-rights-pending',
  'metadata-other-content-rights',
  'generalFitness',
  'healthKit',
  'wearableSync',
  'healthData',
  'clinical',
  'noHealthFeatures',
  'metadata-other-health-fitness-medical',
  'metadata-choice-distribution-method-pilot',
  'metadata-choice-availability-au',
  'metadata-choice-availability-nz',
  'metadata-choice-availability-us',
  'metadata-choice-availability-uk',
  'metadata-choice-availability-eu',
  'metadata-choice-availability-cn',
  'metadata-other-availability',
  'metadata-choice-monetization-price-schedule-digital',
  'metadata-choice-monetization-price-schedule-subscription',
  'metadata-choice-monetization-price-schedule-physical',
  'metadata-choice-monetization-price-schedule-services',
  'metadata-choice-monetization-price-schedule-membership',
  'metadata-choice-monetization-price-schedule-ads',
  'metadata-choice-monetization-price-schedule-none',
  'metadata-other-monetization-price-schedule',
  'metadata-choice-paid-apps-tax-banking-agreement',
  'metadata-choice-paid-apps-tax-banking-tax',
  'metadata-choice-paid-apps-tax-banking-banking',

  // Build verification
  'metadata-choice-data-verification-inventory',
  'metadata-choice-data-verification-sharing',
  'metadata-choice-data-verification-retention',
  'metadata-choice-data-verification-deletion',
  'metadata-choice-data-verification-backups',
  'metadata-choice-data-verification-sdk',
  'metadata-choice-build-tests-sdk',
  'metadata-choice-build-tests-signin',
  'metadata-choice-build-tests-deletion',
  'metadata-choice-build-tests-permissions',
  'metadata-choice-build-tests-tracking',
  'metadata-choice-build-tests-health',
  'metadata-choice-user-accounts-deletion-account',
  'metadata-choice-user-accounts-deletion-signin',
  'metadata-choice-user-accounts-deletion-guest',
  'metadata-choice-user-accounts-deletion-inApp',
  'metadata-choice-user-accounts-deletion-web',
  'metadata-choice-user-accounts-deletion-support',
  'metadata-other-user-accounts-deletion',
  'metadata-choice-social-login-siwa-password',
  'metadata-choice-social-login-siwa-passwordless',
  'metadata-choice-social-login-siwa-apple',
  'metadata-choice-social-login-siwa-google',
  'metadata-choice-social-login-siwa-facebook',
  'metadata-choice-social-login-siwa-sso',
  'metadata-choice-social-login-siwa-none',
  'metadata-other-social-login-siwa',
  'metadata-choice-social-ugc-ai-features-social',
  'metadata-choice-social-ugc-ai-features-ugc',
  'metadata-choice-social-ugc-ai-features-ai',
  'metadata-choice-social-ugc-ai-features-location',
  'metadata-choice-social-ugc-ai-features-dating',
  'metadata-choice-social-ugc-ai-features-none',
  'metadata-other-social-ugc-ai-features',
  'metadata-choice-in-app-tracking-att-analytics',
  'metadata-choice-in-app-tracking-att-firstParty',
  'metadata-choice-in-app-tracking-att-thirdParty',
  'metadata-choice-in-app-tracking-att-tracking',
  'metadata-choice-in-app-tracking-att-att',
  'metadata-choice-in-app-tracking-att-attribution',
  'metadata-choice-in-app-tracking-att-none',
  'metadata-other-in-app-tracking-att',
  'metadata-na-privacy-manifest',
  'metadata-choice-privacy-manifest-app',
  'metadata-choice-privacy-manifest-sdk',
  'metadata-choice-privacy-manifest-reasons',
  'metadata-na-purpose-strings',
  'metadata-choice-purpose-strings-camera',
  'metadata-choice-purpose-strings-microphone',
  'metadata-choice-purpose-strings-photos',
  'metadata-choice-purpose-strings-location',
  'metadata-choice-purpose-strings-motion',
  'metadata-choice-purpose-strings-healthkit',
  'metadata-other-purpose-strings',

  // Legal approval
  'privacyReapproval',
  'termsReapproval',
  'metadata-na-eula-terms',

  // App Store listing
  'listing',
  'age',
  'disclosures',
  'metadata-choice-listing-assets-copy',
  'metadata-choice-listing-assets-iphone',
  'metadata-choice-listing-assets-ipad',
  'metadata-choice-listing-assets-icon',
  'metadata-choice-listing-assets-preview',
  'metadata-choice-listing-assets-localised',
  'metadata-choice-eu-dsa-disclosure',
  'metadata-choice-eu-dsa-contact',
  'metadata-choice-eu-dsa-accessibility',
  'metadata-choice-china-compliance-filing',
  'metadata-choice-china-compliance-ai',
  'metadata-choice-china-compliance-security',
  'metadata-na-whats-new',
  'metadata-na-routing-coverage',
  'metadata-choice-user-data-nutrition-labels-contact',
  'metadata-choice-user-data-nutrition-labels-health',
  'metadata-choice-user-data-nutrition-labels-purchases',
  'metadata-choice-user-data-nutrition-labels-ugc',
  'metadata-choice-user-data-nutrition-labels-analytics',
  'metadata-choice-user-data-nutrition-labels-none',
  'metadata-other-user-data-nutrition-labels',
  'metadata-na-iap-subscriptions',
  'metadata-choice-iap-subscriptions-consumable',
  'metadata-choice-iap-subscriptions-durable',
  'metadata-choice-iap-subscriptions-renewing',
  'metadata-choice-iap-subscriptions-nonRenewing',
  'metadata-choice-pre-order-enabled',

  // App Review and handoff
  'reviewTested',
  'metadata-choice-release-blockers-account',
  'metadata-choice-release-blockers-build',
  'metadata-choice-release-blockers-legal',
  'metadata-choice-release-blockers-privacy',
  'metadata-choice-release-blockers-listing',
  'metadata-choice-release-blockers-review',
  'metadata-other-release-blockers',
  'metadata-choice-review-notes-seeded',
  'metadata-choice-review-notes-transaction',
  'metadata-choice-review-notes-flags',
  'metadata-choice-review-notes-location',
  'metadata-choice-review-notes-attachment',
  'metadata-other-review-notes',
]);

export const STAFF_DATE_KEYS = new Set([
  'metadata-detail-monetization-price-schedule-effective',
  'metadata-detail-monetization-price-schedule-end',
  'privacyApprovedDate',
  'termsApprovedDate',
  'metadata-detail-pre-order-start',
  'metadata-detail-pre-order-end',
]);

export const STAFF_DECIMAL_KEYS = new Set([
  'metadata-detail-monetization-price-schedule-price',
]);

export const STAFF_SELECT_VALUES = Object.freeze({
  account: new Set(['', 'client_org', 'client_individual', 'renatus']),
  enrolment: new Set([
    '',
    'Active organisation',
    'Enrolment in progress',
    'Needs organisation enrolment',
    'Needs individual-to-organisation conversion',
  ]),
  dunsStatus: new Set(['', 'Lookup needed', 'Request submitted', 'Confirmed', 'Not applicable']),
  findings: new Set(['', 'Pending verification', 'Verified against release build']),
  healthDeclarations: new Set(['', 'Pending', 'Completed', 'Not applicable']),
  signin: new Set(['', 'Yes, demo login required', 'No, open access']),
  blockersState: new Set(['', 'open', 'cleared']),
  'metadata-detail-distribution-method-channel': new Set(['', 'public', 'unlisted', 'private']),
  'metadata-detail-paid-apps-tax-banking-status': new Set(['', 'active', 'ready', 'advice']),
  'metadata-detail-eu-dsa-status': new Set(['', 'trader', 'nonTrader']),
  'metadata-detail-iap-subscriptions-multiseat': new Set(['', 'enabled', 'disabled']),
});

export const STAFF_TEXT_KEYS = new Set([
  // Step 1 handoff display overrides
  'appName',
  'brandName',
  'contactName',

  // Kickoff and Apple account
  'owner',
  'scope',
  'legalEntity',
  'dunsNumber',
  'accountHolder',
  'teamId',
  'open',
  'metadata-value-data-purposes',
  'metadata-detail-data-purposes-contact-purpose',
  'metadata-detail-data-purposes-contact-recipients',
  'metadata-detail-data-purposes-health-purpose',
  'metadata-detail-data-purposes-health-recipients',
  'metadata-detail-data-purposes-purchases-purpose',
  'metadata-detail-data-purposes-purchases-recipients',
  'metadata-detail-data-purposes-ugc-purpose',
  'metadata-detail-data-purposes-ugc-recipients',
  'metadata-detail-data-purposes-analytics-purpose',
  'metadata-detail-data-purposes-analytics-recipients',
  'metadata-detail-data-purposes-other-purpose',
  'metadata-detail-data-purposes-other-recipients',
  'metadata-value-registration-country',
  'metadata-value-business-reg-number',
  'metadata-value-regulated-industries',
  'metadata-value-content-rights',
  'metadata-detail-content-rights-reference',
  'metadata-value-health-fitness-medical',
  'metadata-detail-distribution-method-instructions',
  'metadata-value-availability',
  'metadata-value-monetization-price-schedule',
  'metadata-detail-monetization-price-schedule-currency',
  'metadata-detail-paid-apps-tax-banking-evidence',
  'metadata-detail-paid-apps-tax-banking-name',
  'metadata-detail-paid-apps-tax-banking-email',

  // Build verification
  'build',
  'verification',
  'metadata-detail-data-verification-retention',
  'metadata-detail-data-verification-proof',
  'metadata-detail-build-tests-sdk-evidence',
  'metadata-detail-build-tests-signin-evidence',
  'metadata-detail-build-tests-deletion-evidence',
  'metadata-detail-build-tests-permissions-evidence',
  'metadata-detail-build-tests-tracking-evidence',
  'metadata-detail-build-tests-health-evidence',
  'metadata-value-user-accounts-deletion',
  'metadata-detail-user-accounts-deletion-steps',
  'metadata-detail-user-accounts-deletion-evidence',
  'metadata-value-social-login-siwa',
  'metadata-value-social-ugc-ai-features',
  'metadata-value-in-app-tracking-att',
  'metadata-detail-in-app-tracking-att-sdks',
  'metadata-detail-in-app-tracking-att-behaviour',
  'metadata-detail-privacy-manifest-app-evidence',
  'metadata-detail-privacy-manifest-sdk-evidence',
  'metadata-detail-privacy-manifest-reasons-evidence',
  'metadata-value-export-compliance',
  'metadata-value-purpose-strings',
  'metadata-evidence-purpose-strings',

  // Legal approval
  'privacy',
  'privacyVersion',
  'privacyApprovedVersion',
  'privacyApprovalEvidence',
  'terms',
  'termsVersion',
  'termsApprovedVersion',
  'termsApprovalEvidence',
  'termsUrl',
  'approval',
  'metadata-value-privacy-policy-url',
  'metadata-value-eula-terms',
  'metadata-value-privacy-choices-url',

  // App Store listing
  'storeRecord',
  'support',
  'listingAssets',
  'metadata-value-store-app-name',
  'metadata-value-primary-language',
  'metadata-value-bundle-id',
  'metadata-value-sku',
  'metadata-value-user-access',
  'metadata-value-subtitle',
  'metadata-value-primary-category',
  'metadata-value-secondary-category',
  'metadata-value-age-rating',
  'metadata-value-kids-category',
  'metadata-detail-eu-dsa-evidence',
  'metadata-detail-china-compliance-filing',
  'metadata-detail-china-compliance-declarations',
  'metadata-value-icon-background',
  'metadata-value-brand-fonts',
  'metadata-value-app-icon',
  'metadata-value-iphone-screenshots',
  'metadata-value-ipad-screenshots',
  'metadata-value-app-previews',
  'metadata-value-promotional-text',
  'metadata-value-description',
  'metadata-value-keywords',
  'metadata-value-support-email',
  'metadata-value-marketing-url',
  'metadata-value-whats-new',
  'metadata-value-version-number',
  'metadata-value-copyright',
  'metadata-value-release-option-launch-window',
  'metadata-value-routing-coverage',
  'metadata-value-user-data-nutrition-labels',

  // App Review and handoff
  'reviewEvidence',
  'signoffOwner',
  'metadata-value-release-blockers',
  'metadata-value-review-contact-name',
  'metadata-value-review-contact-phone',
  'metadata-value-review-contact-email',
  'metadata-value-review-notes',
  'notes',
  'metadata-value-review-attachment',
]);

export const STAFF_PREVIOUS_KEYS = new Set([
  'metadata-previous-data-purposes',
  'metadata-previous-target-devices',
  'metadata-previous-platforms',
  'metadata-previous-content-rights',
  'metadata-previous-distribution-method',
  'metadata-previous-monetization-price-schedule',
  'metadata-previous-paid-apps-tax-banking',
  'metadata-previous-data-verification',
  'metadata-previous-build-tests',
  'metadata-previous-user-accounts-deletion',
  'metadata-previous-social-login-siwa',
  'metadata-previous-in-app-tracking-att',
  'metadata-previous-privacy-manifest',
  'metadata-previous-eu-dsa',
  'metadata-previous-china-compliance',
  'metadata-previous-iap-subscriptions',
  'metadata-previous-pre-order',
  'metadata-previous-review-notes',
  'metadata-previous-release-blockers',
]);

export const STAFF_RECORD_SCHEMAS = Object.freeze({
  'iap-subscriptions': {
    categories: new Set(['consumable', 'durable', 'renewing', 'nonRenewing']),
    fields: new Set(['reference', 'id', 'price', 'name', 'description', 'screenshot']),
    decimalFields: new Set(['price']),
  },
  'release-blockers': {
    categories: new Set(['account', 'build', 'legal', 'privacy', 'listing', 'review', 'other']),
    fields: new Set(['blocker', 'owner']),
    decimalFields: new Set(),
  },
});

const ALLOWED_TOP_LEVEL_KEYS = new Set(['controlsVersion', 'stage', 'values', 'records', 'questions']);
const ALLOWED_QUESTION_KEYS = new Set(['text', 'owner', 'due']);

export const ALL_ALLOWED_STAFF_VALUE_KEYS = new Set([
  ...STAFF_BOOLEAN_KEYS,
  ...STAFF_DATE_KEYS,
  ...STAFF_DECIMAL_KEYS,
  ...Object.keys(STAFF_SELECT_VALUES),
  ...STAFF_TEXT_KEYS,
  ...STAFF_PREVIOUS_KEYS,
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidIsoDate(raw) {
  const match = DATE_RE.exec(raw);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateStringField(key, raw) {
  if (typeof raw !== 'string') {
    return { error: `Field "${key}" must be a string.`, status: 400 };
  }
  const value = raw.trim();
  if (value.length > MAX_STRING_LENGTH) {
    return { error: `Field "${key}" exceeds the maximum length.`, status: 400 };
  }
  return { value };
}

export function validateStaffDraft(input) {
  if (!isPlainObject(input)) {
    return { error: 'Staff draft must be a JSON object.', status: 400 };
  }

  for (const key of Object.keys(input)) {
    if (!ALLOWED_TOP_LEVEL_KEYS.has(key)) {
      return { error: `Unknown staff draft property "${key}".`, status: 400 };
    }
  }

  if (!Number.isInteger(input.controlsVersion) || input.controlsVersion !== STAFF_CONTROLS_VERSION) {
    return {
      error: `Unsupported staff draft controlsVersion. Expected ${STAFF_CONTROLS_VERSION}.`,
      status: 400,
    };
  }

  if (typeof input.stage !== 'string' || !STAFF_STAGE_SET.has(input.stage)) {
    return { error: 'Invalid staff draft stage.', status: 400 };
  }

  if (!isPlainObject(input.values)) {
    return { error: 'Staff draft values must be a JSON object.', status: 400 };
  }

  const values = {};
  for (const [key, raw] of Object.entries(input.values)) {
    if (!ALL_ALLOWED_STAFF_VALUE_KEYS.has(key)) {
      return { error: `Unknown staff draft field "${key}".`, status: 400 };
    }

    if (STAFF_BOOLEAN_KEYS.has(key)) {
      if (typeof raw !== 'boolean') {
        return { error: `Checkbox field "${key}" must be a JSON boolean.`, status: 400 };
      }
      values[key] = raw;
      continue;
    }

    const parsed = validateStringField(key, raw);
    if (parsed.error) return parsed;

    if (STAFF_DATE_KEYS.has(key)) {
      if (parsed.value !== '' && !isValidIsoDate(parsed.value)) {
        return { error: `Date field "${key}" must be empty or a valid YYYY-MM-DD date.`, status: 400 };
      }
      values[key] = parsed.value;
      continue;
    }

    if (STAFF_DECIMAL_KEYS.has(key)) {
      if (parsed.value !== '' && !DECIMAL_RE.test(parsed.value)) {
        return { error: `Decimal field "${key}" must be empty or a non-negative decimal string.`, status: 400 };
      }
      values[key] = parsed.value;
      continue;
    }

    if (Object.hasOwn(STAFF_SELECT_VALUES, key)) {
      if (!STAFF_SELECT_VALUES[key].has(parsed.value)) {
        return { error: `Field "${key}" has an unsupported option value.`, status: 400 };
      }
      values[key] = parsed.value;
      continue;
    }

    values[key] = parsed.value;
  }

  const records = {};
  if (input.records !== undefined) {
    if (!isPlainObject(input.records)) {
      return { error: 'Staff draft records must be a JSON object.', status: 400 };
    }
    for (const [groupKey, groupValue] of Object.entries(input.records)) {
      if (!Object.hasOwn(STAFF_RECORD_SCHEMAS, groupKey)) {
        return { error: `Unknown repeatable record group "${groupKey}".`, status: 400 };
      }
      if (!isPlainObject(groupValue)) {
        return { error: `Record group "${groupKey}" must be a JSON object.`, status: 400 };
      }
      const schema = STAFF_RECORD_SCHEMAS[groupKey];
      const normalizedGroup = {};
      for (const [category, rows] of Object.entries(groupValue)) {
        if (!schema.categories.has(category)) {
          return { error: `Unknown record category "${category}" in "${groupKey}".`, status: 400 };
        }
        if (!Array.isArray(rows) || rows.length > MAX_RECORDS_PER_CATEGORY) {
          return { error: `Record list "${groupKey}.${category}" must be an array of at most ${MAX_RECORDS_PER_CATEGORY} items.`, status: 400 };
        }
        const normalizedRows = [];
        for (const row of rows) {
          if (!isPlainObject(row)) {
            return { error: `Each entry in "${groupKey}.${category}" must be a JSON object.`, status: 400 };
          }
          const normalizedRow = {};
          for (const [fieldKey, fieldVal] of Object.entries(row)) {
            if (!schema.fields.has(fieldKey)) {
              return { error: `Unknown field "${fieldKey}" in "${groupKey}.${category}".`, status: 400 };
            }
            const parsed = validateStringField(`${groupKey}.${category}.${fieldKey}`, fieldVal);
            if (parsed.error) return parsed;
            if (schema.decimalFields.has(fieldKey) && parsed.value !== '' && !DECIMAL_RE.test(parsed.value)) {
              return { error: `Field "${fieldKey}" in "${groupKey}.${category}" must be empty or a non-negative decimal string.`, status: 400 };
            }
            normalizedRow[fieldKey] = parsed.value;
          }
          for (const requiredKey of schema.fields) {
            if (!Object.hasOwn(normalizedRow, requiredKey)) normalizedRow[requiredKey] = '';
          }
          normalizedRows.push(normalizedRow);
        }
        normalizedGroup[category] = normalizedRows;
      }
      records[groupKey] = normalizedGroup;
    }
  }

  const questions = [];
  if (input.questions !== undefined) {
    if (!Array.isArray(input.questions) || input.questions.length > MAX_QUESTIONS) {
      return { error: `Staff draft questions must be an array of at most ${MAX_QUESTIONS} items.`, status: 400 };
    }
    for (const item of input.questions) {
      if (!isPlainObject(item)) {
        return { error: 'Each staff draft question must be a JSON object.', status: 400 };
      }
      for (const key of Object.keys(item)) {
        if (!ALLOWED_QUESTION_KEYS.has(key)) {
          return { error: `Unknown question field "${key}".`, status: 400 };
        }
      }
      const textField = validateStringField('questions.text', item.text ?? '');
      if (textField.error) return textField;
      const ownerField = validateStringField('questions.owner', item.owner ?? '');
      if (ownerField.error) return ownerField;
      const dueField = validateStringField('questions.due', item.due ?? '');
      if (dueField.error) return dueField;
      if (dueField.value !== '' && !STAFF_STAGE_SET.has(dueField.value)) {
        return { error: 'Question due stage must be empty or a valid wizard stage.', status: 400 };
      }
      if (textField.value || ownerField.value || dueField.value) {
        questions.push({ text: textField.value, owner: ownerField.value, due: dueField.value });
      }
    }
  }

  return {
    data: {
      controlsVersion: STAFF_CONTROLS_VERSION,
      stage: input.stage,
      values,
      records,
      questions,
    },
  };
}
