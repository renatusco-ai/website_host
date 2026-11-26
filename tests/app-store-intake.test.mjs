import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClientReceiptEmail,
  buildShaunEmail,
  checkJsonBodySize,
  computeBrandFollowUps,
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
import { handleSubmitIntake } from '../api/app-store-intake/index.js';
import { handleUploadUrl } from '../api/app-store-intake/upload-url.js';
import { handleDeleteUpload } from '../api/app-store-intake/upload.js';
import { intakeStorageNames } from '../api/app-store-intake/_storage.js';
import { copyIntakeSubmission } from '../scripts/migrate-intake-storage.mjs';
import { restoreIntakeDraft } from '../src/data/appStoreIntake.js';

const SESSION_ID = '11111111-2222-4333-8444-555555555555';

function quickPayload(answers = {}, options = {}) {
  return {
    sessionId: SESSION_ID,
    submissionVersion: 2,
    ...options,
    answers: {
      legalName: 'Summit Fitness Pty Ltd',
      brandNameMatchesLegalName: true,
      contactName: 'Sam Fitness',
      contactEmail: 'SAM@example.test',
      contactPhone: '0412 345 678',
      appName: 'Summit',
      appSummary: 'Members follow guided workouts and browse the class timetable.',
      ...answers,
    },
  };
}

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

test('quick payload validates only the client fields and uses the legacy contract for old callers', () => {
  const quick = validateIntakePayload(quickPayload({
    publishingAccount: 'own',
    hasPrivacyPolicy: 'no',
    userDataCollected: ['none'],
  }));
  assert.deepEqual(quick.data.answers, {
    legalName: 'Summit Fitness Pty Ltd',
    brandName: 'Summit Fitness Pty Ltd',
    contactName: 'Sam Fitness',
    contactEmail: 'sam@example.test',
    contactPhone: '+61412345678',
    websiteUrl: null,
    brandKitUrl: null,
    brandColors: '',
    appName: 'Summit',
    appSummary: 'Members follow guided workouts and browse the class timetable.',
  });
  assert.equal(quick.data.sendClientCopy, false);
  assert.equal(validateIntakePayload(makeTmcPayload()).data.submissionVersion, 1);
  assert.equal(validateIntakePayload(quickPayload({}, { submissionVersion: 3 })).status, 400);
  assert.equal(validateIntakePayload(quickPayload({}, { website: 'filled' })).status, 400);
  assert.equal(validateIntakePayload(quickPayload({}, { assets: [{ path: 'other/logo.png' }] })).status, 400);

  const invalid = validateIntakePayload(quickPayload({
    brandNameMatchesLegalName: false,
    contactEmail: 'invalid',
    contactPhone: '123',
    websiteUrl: 'https:example.test',
    brandKitUrl: 'javascript:alert(1)',
    brandColors: 'x'.repeat(301),
    appName: 'x',
    appSummary: 'x'.repeat(2001),
  }));
  assert.deepEqual(Object.keys(invalid.fieldErrors), [
    'brandName', 'contactEmail', 'contactPhone', 'websiteUrl', 'brandKitUrl', 'brandColors', 'appName', 'appSummary',
  ]);
  assert.equal(
    validateIntakePayload(quickPayload({ websiteUrl: 'http://example.test', brandKitUrl: 'https://example.test/kit' }))
      .data.answers.brandKitUrl,
    'https://example.test/kit',
  );
});

test('a legacy draft restores the session, assets, receipt choice and only the quick form fields', () => {
  const legacy = makeTmcPayload({ phoneNumber: '0412 345 678', phoneCountryCode: '+61' });
  const asset = { path: SESSION_ID + '/abcdef12-logo.png', name: 'logo.png', size: 1024, mimeType: 'image/png' };
  const restored = restoreIntakeDraft(JSON.stringify({
    ...legacy,
    assets: [asset],
    stepIndex: 5,
    sendClientCopy: false,
    website: 'honeypot',
  }));
  assert.equal(restored.sessionId, SESSION_ID);
  assert.equal(restored.answers.phoneNumber, '0412 345 678');
  assert.equal(restored.answers.appName, legacy.answers.appName);
  assert.equal(restored.answers.brandColors, legacy.answers.brandColors);
  assert.deepEqual(restored.assets, [asset]);
  assert.equal(restored.sendClientCopy, false);
  assert.equal(restored.answers.publishingAccount, undefined);
  assert.equal(restored.answers.userDataCollected, undefined);
  assert.equal(restored.stepIndex, undefined);
  assert.equal(restored.website, undefined);
  assert.equal(restoreIntakeDraft('invalid JSON'), null);
});

test('early follow-ups use supplied brand details; release checks use confirmed findings', () => {
  const draft = validateIntakePayload(quickPayload()).data.answers;
  const followUps = computeBrandFollowUps(draft, []);
  assert.deepEqual(followUps.map((item) => item.code), ['BRAND_ASSETS_MISSING', 'BRAND_COLORS_MISSING']);
  assert.ok(followUps.every((item) => item.severity === 'Action Needed'));
  assert.deepEqual(computeBrandFollowUps({
    ...draft,
    brandKitUrl: 'https://example.test/kit',
    brandColors: 'Forest green',
  }, []), []);

  const record = { id: 'reference', submissionVersion: 2, answers: draft, gaps: followUps };
  const signedAssets = [{ name: '<logo>.png', signedUrl: 'https://example.test/download?token=test', size: 1024 }];
  const teamEmail = buildShaunEmail(record, signedAssets);
  assert.match(teamEmail.html, /Request the logo or brand kit/);
  assert.match(teamEmail.html, /&lt;logo&gt;.png/);
  assert.match(teamEmail.html, /https:\/\/example.test\/download/);
  assert.doesNotMatch(teamEmail.html, /Readiness &amp; Gap Summary|Publishing Account/);
  const receipt = buildClientReceiptEmail(record);
  assert.match(receipt.text, /kickoff call.*personal information.*health or fitness/);
  assert.doesNotMatch(receipt.text, /Summit|example\.test|Request the logo/);

  const fitness = validateIntakePayload(makeTmcPayload({
    hasPrivacyPolicy: 'yes',
    privacyPolicyUrl: 'https://example.test/privacy',
    termsUrl: 'https://example.test/terms',
    publishingAccount: 'own',
    enrollmentStatus: 'org_active',
  })).data.answers;
  const healthAtLaunch = {
    ...fitness,
    hasAccounts: 'yes',
    healthInvolvement: ['health_biometric'],
    userDataCollected: ['health_fitness'],
    trackingAds: 'ad_tracking',
  };
  const fitnessGaps = computeReadinessGaps(fitness);
  assert.ok(fitnessGaps.every((item) => item.severity !== 'Blocker' && item.code !== 'ACCOUNT_REQUIREMENTS'));
  const healthGaps = computeReadinessGaps(healthAtLaunch);
  assert.equal(healthGaps.find((item) => item.code === 'PROHIBITED_TRACKING_COMBINATION')?.severity, 'Blocker');
  const verifiedHealthGaps = computeReadinessGaps({ ...healthAtLaunch, trackingAds: 'none' });
  assert.ok(verifiedHealthGaps.every((item) => item.severity !== 'Blocker'));
  assert.match(verifiedHealthGaps.find((item) => item.code === 'ACCOUNT_REQUIREMENTS').title, /demo login/i);
});

test('submit route verifies private files, persists a single row and survives notification failure', async (t) => {
  const env = {
    SUPABASE_URL: 'https://supabase.example.test',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    RATE_LIMIT_SALT: 'test-salt',
  };
  const stored = new Map();
  const path = SESSION_ID + '/abcdef12-logo.png';
  const targetPath = 'intake/' + SESSION_ID + '/fedcba21-brand.pdf';
  const removedPath = SESSION_ID + '/abcdef22-removed.png';
  const metadata = { size: 1024, mimetype: 'image/png' };
  const signed = [];
  const removed = new Set();
  const files = {
    'app-store-intake-assets': new Map([[path, metadata], [removedPath, metadata]]),
    'intake-app-store-assets': new Map([
      ['intake/' + removedPath, metadata],
      [targetPath, { size: 2048, mimetype: 'application/pdf' }],
    ]),
  };
  let failLegacyRemoval = true;

  t.mock.method(globalThis, 'fetch', async (input, init) => {
    const url = new URL(input);
    assert.equal(url.origin, env.SUPABASE_URL);
    assert.equal(new Headers(init.headers).get('authorization'), 'Bearer test-service-key');
    if (url.pathname === '/rest/v1/rpc/intake_check_and_increment_rate_limit') return Response.json(true);
    if (url.pathname === '/rest/v1/rpc/intake_touch_upload_session') {
      return Response.json(!stored.has(JSON.parse(init.body).p_session_id));
    }
    if (url.pathname === '/rest/v1/rpc/intake_mark_asset_removed') {
      const { p_session_id: sessionId, p_object_name: objectName } = JSON.parse(init.body);
      if (stored.has(sessionId)) return Response.json(false);
      assert.equal(sessionId, SESSION_ID);
      removed.add(objectName);
      return Response.json(true);
    }
    if (url.pathname === '/rest/v1/intake_asset_removals') {
      return Response.json([...removed].map(object_name => ({ object_name })));
    }
    if (url.pathname === '/rest/v1/intake_app_store_submissions' && init.method === 'GET') {
      const id = url.searchParams.get('session_id').slice(3);
      return Response.json(stored.has(id) ? [stored.get(id)] : []);
    }
    if (url.pathname === '/rest/v1/intake_app_store_submissions' && init.method === 'POST') {
      const row = JSON.parse(init.body);
      assert.ok(!stored.has(row.session_id));
      const id = stored.size === 0 ? 'submission-reference' : 'legacy-submission-reference';
      const record = { ...row, id, created_at: '2026-11-25T00:00:00Z' };
      stored.set(row.session_id, record);
      return Response.json(record);
    }
    const [, , , , operation, bucket, ...pathParts] = url.pathname.split('/');
    if (operation === 'list' && files[bucket]) {
      const { prefix } = JSON.parse(init.body);
      assert.equal(prefix, bucket === 'intake-app-store-assets' ? 'intake/' + SESSION_ID : SESSION_ID);
      return Response.json([...files[bucket]].filter(([key]) => key.startsWith(prefix + '/'))
        .map(([key, metadata]) => ({ name: key.split('/').at(-1), metadata })));
    }
    if (operation === 'sign' && files[bucket]) {
      const file = pathParts.join('/');
      assert.ok(files[bucket].has(file));
      assert.equal(JSON.parse(init.body).expiresIn, 604800);
      signed.push([bucket, file]);
      return Response.json({ signedURL: '/object/sign/fixture?token=test' });
    }
    if (operation === 'upload' && bucket === 'sign') {
      return Response.json({ url: '/object/upload/sign/' + pathParts.join('/') + '?token=test' });
    }
    if (init.method === 'DELETE' && files[operation]) {
      if (operation === 'app-store-intake-assets' && failLegacyRemoval) {
        failLegacyRemoval = false;
        return Response.json({ message: 'Temporary Storage failure' }, { status: 500 });
      }
      for (const key of JSON.parse(init.body).prefixes) files[operation].delete(key);
      return Response.json([]);
    }
    assert.fail('Unexpected service request: ' + url.pathname);
  });

  async function request(handler, body, method = 'POST', overrides = {}) {
    const result = {};
    const response = {
      status(code) { result.status = code; return this; },
      json(json) { result.json = json; },
    };
    await handler({ method, body, headers: {} }, response, { ...env, ...overrides });
    return result;
  }

  assert.equal((await request(handleUploadUrl, {
    sessionId: SESSION_ID, filename: 'logo.exe', sizeBytes: 1024,
  })).status, 400);

  const uploadRequest = { sessionId: SESSION_ID, filename: 'logo.png', mimeType: 'image/png', sizeBytes: 1024 };
  const quotaPaths = Array.from({ length: 7 }, (_, n) => `${SESSION_ID}/abcdef01-limit-${n}.png`);
  for (const key of quotaPaths.slice(0, -1)) files['app-store-intake-assets'].set(key, metadata);
  const upload = await request(handleUploadUrl, uploadRequest);
  assert.equal(upload.status, 200);
  assert.match(upload.json.path, new RegExp(`^intake/${SESSION_ID}/[a-f0-9]{8}-logo\\.png$`));
  assert.ok(upload.json.signedUrl.includes('/sign/intake-app-store-assets/'));
  const rollback = await request(handleUploadUrl, uploadRequest, 'POST', { INTAKE_UPLOAD_WRITE_MODE: 'legacy' });
  assert.equal(rollback.status, 200);
  assert.match(rollback.json.path, new RegExp(`^${SESSION_ID}/[a-f0-9]{8}-logo\\.png$`));
  assert.ok(rollback.json.signedUrl.includes('/sign/app-store-intake-assets/'));
  files['app-store-intake-assets'].set(quotaPaths.at(-1), metadata);
  assert.equal((await request(handleUploadUrl, uploadRequest)).status, 400);
  for (const key of quotaPaths) files['app-store-intake-assets'].delete(key);

  const deleteRequest = { sessionId: SESSION_ID, path: removedPath };
  assert.equal((await request(handleDeleteUpload, deleteRequest, 'DELETE')).status, 502);
  assert.equal(files['app-store-intake-assets'].has(removedPath), true);
  assert.equal(files['intake-app-store-assets'].has('intake/' + removedPath), false);
  assert.equal((await request(handleSubmitIntake, quickPayload({}, { assets: [{ path: removedPath }] }))).status, 400);
  assert.equal((await request(handleDeleteUpload, deleteRequest, 'DELETE')).status, 200);
  // An upload signed before removal can arrive late, but cannot be associated with the submission.
  files['app-store-intake-assets'].set(removedPath, metadata);
  assert.equal((await request(handleSubmitIntake, quickPayload({}, { assets: [{ path: removedPath }] }))).status, 400);

  files['app-store-intake-assets'].set(targetPath.slice('intake/'.length), files['intake-app-store-assets'].get(targetPath));
  const body = quickPayload({}, { assets: [
    { path, name: 'logo.png', size: 1 },
    { path: targetPath, name: 'brand.pdf' },
    { path: targetPath.slice('intake/'.length), name: 'brand.pdf' },
  ] });
  assert.equal((await request(handleSubmitIntake, {
    ...body, assets: [{ path: SESSION_ID + '/missing.png' }],
  })).status, 400);
  assert.equal(stored.size, 0);

  const saved = await request(handleSubmitIntake, body, 'POST', { INTAKE_UPLOAD_WRITE_MODE: 'legacy' });
  assert.deepEqual(saved, {
    status: 200, json: { ok: true, id: 'submission-reference', emailDelivered: false },
  });
  const record = stored.get(SESSION_ID);
  assert.equal(record.submission_version, 2);
  assert.equal(record.website_url, null);
  assert.equal(record.publishing_account, null);
  assert.deepEqual(record.gaps.map(({ code }) => code), ['BRAND_COLORS_MISSING']);
  assert.deepEqual(record.assets, [
    { path, name: 'logo.png', size: 1024, mimeType: 'image/png' },
    { path: targetPath, name: 'brand.pdf', size: 2048, mimeType: 'application/pdf' },
  ]);
  assert.deepEqual(await request(handleSubmitIntake, body), {
    status: 200, json: { ok: true, id: 'submission-reference', duplicate: true },
  });
  assert.equal(stored.size, 1);
  assert.deepEqual(signed, [['app-store-intake-assets', path], ['intake-app-store-assets', targetPath]]);
  assert.equal((await request(handleDeleteUpload, { sessionId: SESSION_ID, path }, 'DELETE')).status, 409);
  assert.equal((await request(handleUploadUrl, uploadRequest)).status, 409);

  const legacyId = '11111111-2222-4333-8444-555555555556';
  const legacy = makeTmcPayload({}, { sessionId: legacyId, sendClientCopy: false });
  assert.equal((await request(handleSubmitIntake, legacy)).status, 200);
  const legacyRecord = stored.get(legacyId);
  assert.equal(legacyRecord.submission_version, 1);
  assert.equal(legacyRecord.publishing_account, 'renatus');
  const migratedRetry = await request(handleSubmitIntake, quickPayload({}, { sessionId: legacyId }));
  assert.equal(migratedRetry.json.id, legacyRecord.id);
  assert.equal(migratedRetry.json.gaps, undefined);
});

test('a restored draft accepts both path formats and collapses copies without crossing sessions', () => {
  const name = 'abcdef12-logo.png';
  const legacy = { path: `${SESSION_ID}/${name}`, name: 'logo.png' };
  const current = { ...legacy, path: `intake/${legacy.path}` };
  const otherSession = '11111111-2222-4333-8444-555555555556';
  const invalid = [
    { path: `intake/${otherSession}/${name}` },
    { path: `intake/${SESSION_ID}/nested/${name}` },
    { path: `intake/${SESSION_ID}/../${name}` },
  ];
  assert.deepEqual(restoreIntakeDraft(JSON.stringify({
    sessionId: SESSION_ID, assets: [legacy, ...invalid, current],
  })).assets, [current]);
  for (const asset of invalid) {
    assert.equal(validateIntakePayload(quickPayload({}, { assets: [asset] })).status, 400);
  }
});

test('the Storage copy job resumes after interruption and rejects wrong content before rewriting references', async () => {
  const names = intakeStorageNames({ SUPABASE_INTAKE_BUCKET: 'custom-source' });
  assert.equal(names.legacyBucket, 'custom-source');
  assert.equal(intakeStorageNames({
    SUPABASE_INTAKE_BUCKET: 'custom-source', SUPABASE_INTAKE_LEGACY_BUCKET: 'explicit-source',
  }).legacyBucket, 'explicit-source');
  const legacyPath = `${SESSION_ID}/abcdef12-logo.png`;
  const targetPath = `intake/${legacyPath}`;
  const file = new Blob(['source'], { type: 'image/png' });
  const assets = [{ path: legacyPath, name: 'logo.png', size: file.size, mimeType: file.type }];
  const row = { id: 'saved-intake', session_id: SESSION_ID, assets };
  const source = new Map([[legacyPath, file]]);
  const destination = new Map();
  let copies = 0;
  let writes = 0;
  let expectedAssets = assets;
  const supabase = {
    storage: {
      from(bucket) {
        const files = bucket === names.legacyBucket ? source : destination;
        return {
          async exists(path) { return { data: files.has(path) }; },
          async download(path) { return { data: files.get(path) }; },
          async copy(path, target, { destinationBucket }) {
            assert.equal(bucket, names.legacyBucket);
            assert.equal(destinationBucket, names.bucket);
            destination.set(target, files.get(path));
            copies++;
            return {};
          },
        };
      },
    },
    from(table) {
      assert.equal(table, 'intake_app_store_submissions');
      return {
        update({ assets }) {
          writes++;
          const filters = {};
          return {
            eq(column, value) { filters[column] = value; return this; },
            select() { return this; },
            async maybeSingle() {
              assert.equal(filters.id, row.id);
              if (filters.assets !== JSON.stringify(expectedAssets)) return { data: null };
              expectedAssets = assets;
              return { data: { id: row.id } };
            },
          };
        },
      };
    },
  };

  destination.set(targetPath, new Blob(['forged'], { type: file.type }));
  await assert.rejects(copyIntakeSubmission(supabase, names, row), /do not match/);
  assert.equal(writes, 0);
  destination.delete(targetPath);
  expectedAssets = [];
  await assert.rejects(copyIntakeSubmission(supabase, names, row), /changed during the copy/);
  assert.equal(copies, 1);
  assert.equal(source.has(legacyPath), true);
  assert.equal(destination.has(targetPath), true);
  expectedAssets = assets;
  assert.equal(await copyIntakeSubmission(supabase, names, row), true);
  assert.equal(copies, 1);
  assert.deepEqual(expectedAssets, [{ ...assets[0], path: targetPath }]);
  assert.equal(await copyIntakeSubmission(supabase, names, { ...row, assets: expectedAssets }), false);
});
