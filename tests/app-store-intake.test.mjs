import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClientReceiptEmail,
  buildShaunEmail,
  checkJsonBodySize,
  computeReadinessGaps,
  escapeHtml,
  isValidHttpUrl,
  isValidSingleSegmentPath,
  normalizePhone,
  sanitizeFilename,
  sanitizeSubject,
  validateIntakePayload,
  validateUploadUrlRequest,
} from '../api/app-store-intake/_lib.js';

const SESSION_ID = '11111111-2222-4333-8444-555555555555';

function makeTmcPayload(overrides = {}, rootOverrides = {}) {
  return {
    sessionId: SESSION_ID,
    sendClientCopy: true,
    assets: [],
    ...rootOverrides,
    answers: {
      legalName: 'The Mobility Collective Pty Ltd',
      brandName: 'The Mobility Collective',
      contactName: 'Caitlin Fisher',
      contactEmail: 'caitlin@themobilitycollective.com',
      contactPhone: '+61412345678',
      websiteUrl: 'https://www.themobilitycollective.com',
      country: 'Australia',
      regulatedIndustries: ['none'],
      publishingAccount: 'renatus',
      appName: 'TMC',
      appSummary: 'Mobility and recovery sessions for members with native schedule and guided routines.',
      distributionGoal: 'public',
      primaryCategory: 'Health & Fitness',
      primaryLocale: 'English (Australia)',
      targetDevices: 'iPhone only',
      ageRatingBand: '4+',
      kidsCategory: 'no',
      targetRegions: ['Australia'],
      subtitle: '',
      promoText: '',
      draftDescription: '',
      keywords: '',
      brandKitUrl: '',
      brandColors: '#1E2D40, #E0BA7B, #DED1BD, #F0F0EB',
      iconBackground: '#1E2D40',
      brandFonts: 'Gloock',
      brandFontLicense: 'free_google',
      contentRights: 'owned',
      hasPrivacyPolicy: 'no',
      websiteManager: 'Custom / Agency',
      supportUrl: 'https://www.themobilitycollective.com/contact',
      supportEmail: 'hello@themobilitycollective.com',
      termsUrl: '',
      hasAccounts: 'no',
      healthInvolvement: ['general_fitness'],
      socialAiFeatures: ['none'],
      userDataCollected: ['none'],
      trackingAds: 'none',
      encryption: 'standard',
      monetization: ['free'],
      launchWindow: 'Within 1 month (Public App Store)',
      reviewNotes: '',
      ...overrides,
    },
  };
}

test('TMC persona validation & Gap Summary produces exact expected blockers/warnings/info', () => {
  const parsed = validateIntakePayload(makeTmcPayload());
  assert.ok(!parsed.error, parsed.error);

  const gaps = computeReadinessGaps(parsed.data.answers, [{ path: `${SESSION_ID}/abc-logo.png` }]);
  const byCode = Object.fromEntries(gaps.map((g) => [g.code, g]));

  assert.equal(byCode.PRIVACY_POLICY_MISSING.severity, 'Blocker');
  assert.equal(byCode.RENATUS_ACCOUNT_PUBLIC_LAUNCH.severity, 'Warning');
  assert.equal(byCode.METADATA_DEFERRED.severity, 'Info (Deferred)');
  assert.equal(byCode.ORG_ENROLLMENT_REQUIRED, undefined);

  // TestFlight pilot does NOT fire RENATUS_ACCOUNT_PUBLIC_LAUNCH warning
  const tfParsed = validateIntakePayload(makeTmcPayload({ distributionGoal: 'testflight' }));
  const tfGaps = computeReadinessGaps(tfParsed.data.answers, [{ path: `${SESSION_ID}/a.png` }]);
  assert.ok(!tfGaps.some((g) => g.code === 'RENATUS_ACCOUNT_PUBLIC_LAUNCH'));
});

test('Own account rules: already-enrolled Org without D-U-N-S has no Blocker; not-enrolled fires ORG_ENROLLMENT_REQUIRED', () => {
  const activeOrg = validateIntakePayload(
    makeTmcPayload({
      publishingAccount: 'own',
      enrollmentStatus: 'org_active',
      dunsNumber: '',
      teamId: '',
    }),
  );
  assert.ok(!activeOrg.error, activeOrg.error);
  const activeCodes = computeReadinessGaps(activeOrg.data.answers, [{ path: `${SESSION_ID}/a.png` }]).map(
    (g) => g.code,
  );
  assert.ok(!activeCodes.includes('ORG_ENROLLMENT_REQUIRED'));
  assert.ok(activeCodes.includes('OWN_ACCOUNT_ACCESS'));

  const notEnrolled = validateIntakePayload(
    makeTmcPayload({
      publishingAccount: 'own',
      enrollmentStatus: 'not_enrolled',
      dunsNumber: '',
    }),
  );
  const notEnrolledCodes = computeReadinessGaps(notEnrolled.data.answers, []).map((g) => g.code);
  assert.ok(notEnrolledCodes.includes('ORG_ENROLLMENT_REQUIRED'));
});

test('Regulated industry & Step 5 medical/clinical: Blocker when non-Org, Requirement-only when active Org', () => {
  const medNonOrg = validateIntakePayload(
    makeTmcPayload({
      publishingAccount: 'renatus',
      healthInvolvement: ['medical_clinical'],
    }),
  );
  const medByCode = Object.fromEntries(
    computeReadinessGaps(medNonOrg.data.answers, []).map((g) => [g.code, g]),
  );
  assert.equal(medByCode.REGULATED_ENTITY_ACCOUNT.severity, 'Blocker');
  assert.equal(medByCode.REGULATED_COMPLIANCE.severity, 'Requirement');

  const vpnOrg = validateIntakePayload(
    makeTmcPayload({
      publishingAccount: 'own',
      enrollmentStatus: 'org_active',
      teamId: 'TEAM123456',
      regulatedIndustries: ['vpn'],
    }),
  );
  const vpnByCode = Object.fromEntries(
    computeReadinessGaps(vpnOrg.data.answers, []).map((g) => [g.code, g]),
  );
  assert.equal(vpnByCode.REGULATED_ENTITY_ACCOUNT, undefined);
  assert.equal(vpnByCode.REGULATED_COMPLIANCE.severity, 'Requirement');
});

test('hasHealthData includes userDataCollected health_fitness and blocks ad tracking', () => {
  const parsed = validateIntakePayload(
    makeTmcPayload({
      healthInvolvement: ['general_fitness'],
      userDataCollected: ['health_fitness'],
      trackingAds: 'ad_tracking',
    }),
  );
  const byCode = Object.fromEntries(
    computeReadinessGaps(parsed.data.answers, []).map((g) => [g.code, g]),
  );
  assert.equal(byCode.PROHIBITED_TRACKING_COMBINATION.severity, 'Blocker');
  assert.equal(byCode.HEALTH_COMPLIANCE.severity, 'Requirement');
  assert.equal(byCode.ATT_TRACKING, undefined);
});

test('Live location does NOT false-positive <18+ Dating conflict; Dating & Social Media conflicts & 18+ gating work', () => {
  const locGaps = computeReadinessGaps(
    validateIntakePayload(makeTmcPayload({ ageRatingBand: '4+', socialAiFeatures: ['live_location'] })).data
      .answers,
    [],
  );
  assert.ok(!locGaps.some((g) => g.code === 'AGE_RATING_GATING'));

  const datingGaps = computeReadinessGaps(
    validateIntakePayload(makeTmcPayload({ ageRatingBand: '13+', socialAiFeatures: ['dating'] })).data
      .answers,
    [],
  );
  assert.ok(datingGaps.some((g) => g.code === 'AGE_RATING_GATING'));

  const socialGaps = computeReadinessGaps(
    validateIntakePayload(
      makeTmcPayload({
        ageRatingBand: '9+',
        socialAiFeatures: ['social_feed', 'ugc', 'ai_features'],
        targetRegions: ['Australia', 'United Kingdom', 'United States'],
      }),
    ).data.answers,
    [],
  );
  const byCode = Object.fromEntries(socialGaps.map((g) => [g.code, g]));
  assert.equal(byCode.AGE_RATING_GATING.severity, 'Warning');
  assert.equal(byCode.TERMS_EULA_MISSING.severity, 'Blocker');
  assert.match(byCode.SOCIAL_AI_COMPLIANCE.detail, /Australia under-16/);
  assert.match(byCode.SOCIAL_AI_COMPLIANCE.detail, /UK Online Safety Act/);
  assert.match(byCode.SOCIAL_AI_COMPLIANCE.detail, /NCMEC/);
});

test('All remaining Section 5 rules: Paid Apps active vs lodging, US-only external digital, Accounts, ATT, OFAC, Rights, Encryption, Support, Assets, Unsure', () => {
  // US-only external digital does NOT fire EXTERNAL_DIGITAL_NON_US
  const usOnly = validateIntakePayload(
    makeTmcPayload({
      targetRegions: ['United States'],
      monetization: ['external_digital'],
    }),
  );
  assert.ok(!computeReadinessGaps(usOnly.data.answers, []).some((g) => g.code === 'EXTERNAL_DIGITAL_NON_US'));

  // Active Paid Apps fires Requirement (not Blocker)
  const paidActive = validateIntakePayload(
    makeTmcPayload({
      monetization: ['subscriptions'],
      paidAppsStatus: 'already_active',
      termsUrl: 'https://www.themobilitycollective.com/terms',
    }),
  );
  const paidActiveCodes = Object.fromEntries(
    computeReadinessGaps(paidActive.data.answers, []).map((g) => [g.code, g]),
  );
  assert.equal(paidActiveCodes.PAID_APPS_LODGING, undefined);
  assert.equal(paidActiveCodes.PAID_APPS_ACTIVE_CHECKS.severity, 'Requirement');

  // Worldwide + Accounts + Social Login + ATT + Licensed Rights + Custom Encryption + missing Support/Assets + Unsure
  const full = validateIntakePayload(
    makeTmcPayload({
      targetRegions: ['Worldwide'],
      hasAccounts: 'yes',
      hasSocialLogin: 'yes',
      healthInvolvement: ['none'],
      trackingAds: 'ad_tracking',
      contentRights: 'licensed',
      encryption: 'custom',
      supportUrl: '',
      brandKitUrl: '',
      brandFontLicense: 'unsure',
    }),
  );
  const fullByCode = Object.fromEntries(
    computeReadinessGaps(full.data.answers, []).map((g) => [g.code, g]),
  );
  assert.equal(fullByCode.EU_COMPLIANCE.severity, 'Blocker');
  assert.equal(fullByCode.CHINA_COMPLIANCE.severity, 'Blocker');
  assert.equal(fullByCode.ACCOUNT_REQUIREMENTS.severity, 'Requirement');
  assert.match(fullByCode.ACCOUNT_REQUIREMENTS.detail, /private\.icloud\.com/);
  assert.equal(fullByCode.ATT_TRACKING.severity, 'Requirement');
  assert.equal(fullByCode.OFAC_EXCLUSIONS.severity, 'Requirement');
  assert.equal(fullByCode.CONTENT_RIGHTS.severity, 'Requirement');
  assert.equal(fullByCode.EXPORT_COMPLIANCE.severity, 'Action Needed');
  assert.match(fullByCode.EXPORT_COMPLIANCE.detail, /France ANSSI/);
  assert.equal(fullByCode.SUPPORT_URL_MISSING.severity, 'Warning');
  assert.equal(fullByCode.BRAND_ASSETS_MISSING.severity, 'Warning');
  assert.equal(fullByCode.UNSURE_FOLLOWUP.severity, 'Action Needed');

  // Plain-English clientTitle check: no raw Guideline numbers or forbidden jargon in ANY clientTitle
  for (const g of Object.values(fullByCode)) {
    assert.ok(g.clientTitle, `Missing clientTitle on ${g.code}`);
    assert.ok(!/Guideline|\bATT\b|\bMIIT\b|\bDSA\b|\bOFAC\b|\bEULA\b|\bSDK/i.test(g.clientTitle));
  }
});

test('Validation edge cases: raw length 400s, invalid enums, stale conditional clearing, honeypot, body size, filename .. collapse, 00-phone', () => {
  // Raw length limits return 400 instead of silent truncation
  assert.ok(validateIntakePayload(makeTmcPayload({ appName: 'A'.repeat(31) })).error);
  assert.ok(validateIntakePayload(makeTmcPayload({ subtitle: 'B'.repeat(31) })).error);
  assert.ok(validateIntakePayload(makeTmcPayload({ promoText: 'C'.repeat(171) })).error);
  assert.ok(validateIntakePayload(makeTmcPayload({ draftDescription: 'D'.repeat(4001) })).error);
  assert.ok(validateIntakePayload(makeTmcPayload({ keywords: 'k'.repeat(101) })).error);

  // Invalid enums & missing conditionals return 400
  assert.ok(validateIntakePayload(makeTmcPayload({ hasPrivacyPolicy: 'maybe' })).error);
  assert.ok(validateIntakePayload(makeTmcPayload({ hasPrivacyPolicy: 'yes', privacyPolicyUrl: '' })).error);
  assert.ok(validateIntakePayload(makeTmcPayload({ publishingAccount: 'own', enrollmentStatus: '' })).error);
  assert.ok(validateIntakePayload(makeTmcPayload({ monetization: ['paid_download'], paidAppsStatus: '' })).error);
  assert.ok(validateIntakePayload(makeTmcPayload({}, { website: 'bot-filled' })).error);

  // Stale conditional fields cleared when parent toggled off (no hidden lockout or false UNSURE_FOLLOWUP)
  const staleCleared = validateIntakePayload(
    makeTmcPayload({
      publishingAccount: 'renatus',
      accountHolderEmail: 'not-an-email',
      hasAccounts: 'no',
      hasSocialLogin: 'unsure',
      monetization: ['free'],
      financeContactEmail: 'also-invalid',
    }),
  );
  assert.ok(!staleCleared.error, staleCleared.error);
  assert.equal(staleCleared.data.answers.accountHolderEmail, '');
  assert.equal(staleCleared.data.answers.hasSocialLogin, '');
  assert.equal(staleCleared.data.answers.financeContactEmail, '');
  const staleGaps = computeReadinessGaps(staleCleared.data.answers, [{ path: `${SESSION_ID}/a.png` }]);
  assert.ok(!staleGaps.some((g) => g.code === 'UNSURE_FOLLOWUP'));

  // Filename ".." collapses cleanly so upload-url and single-segment path validation stay consistent
  const safeName = sanitizeFilename('logo..v2.png');
  assert.equal(safeName, 'logo.v2.png');
  assert.equal(isValidSingleSegmentPath(SESSION_ID, `${SESSION_ID}/1234-${safeName}`), true);
  assert.equal(isValidSingleSegmentPath(SESSION_ID, `${SESSION_ID}/../other/logo.png`), false);

  // Phone normalization: 00-prefix and non-AU country code
  assert.equal(normalizePhone('0061412345678', '+61'), '+61412345678');
  assert.equal(normalizePhone('0412 345 678', '+61'), '+61412345678');
  assert.equal(normalizePhone('07700 900123', '+44'), '+447700900123');

  // 100 KB JSON body size guard
  assert.equal(checkJsonBodySize({ headers: {}, body: { ok: true } }), null);
  assert.equal(checkJsonBodySize({ headers: { 'content-length': '200000' }, body: {} }).status, 413);

  // URL, subject, HTML, and Shaun email completeness (all 5 previously omitted fields present)
  assert.equal(isValidHttpUrl('https://themobilitycollective.com'), true);
  assert.equal(isValidHttpUrl('javascript:alert(1)'), false);
  assert.equal(sanitizeSubject('Brand\r\nBcc: evil@x.com'), 'Brand Bcc: evil@x.com');
  assert.equal(escapeHtml('<script>"&\''), '&lt;script&gt;&quot;&amp;&#39;');
  assert.ok(validateUploadUrlRequest({ sessionId: SESSION_ID, filename: 'x.exe', mimeType: 'application/octet-stream', sizeBytes: 10 }).error);

  const fullEmailParsed = validateIntakePayload(
    makeTmcPayload({
      publishingAccount: 'own',
      enrollmentStatus: 'org_active',
      accountHolderEmail: 'holder@tmc.com',
      draftDescription: 'Full draft store description here.',
      brandFontLicense: 'paid_owned',
      monetization: ['paid_download'],
      paidAppsStatus: 'already_active',
      financeContactName: 'Alex CFO',
      financeContactEmail: 'finance@tmc.com',
      reviewNotes: 'http://phish.example.com <script>alert(1)</script>',
    }),
  );
  const gaps = computeReadinessGaps(fullEmailParsed.data.answers, []);
  const shaunEmail = buildShaunEmail({ id: 'ref-123', answers: fullEmailParsed.data.answers, gaps }, []);
  assert.ok(shaunEmail.html.includes('holder@tmc.com'));
  assert.ok(shaunEmail.html.includes('Full draft store description here.'));
  assert.ok(shaunEmail.html.includes('paid_owned'));
  assert.ok(shaunEmail.html.includes('Alex CFO'));
  assert.ok(shaunEmail.html.includes('finance@tmc.com'));
  assert.ok(!shaunEmail.html.includes('<script>alert(1)</script>'));

  const clientReceipt = buildClientReceiptEmail({ id: 'ref-123', createdAt: '2026-11-24T00:00:00Z', gaps });
  assert.ok(!clientReceipt.html.includes('phish.example.com'));
  assert.ok(!clientReceipt.text.includes('phish.example.com'));
});
