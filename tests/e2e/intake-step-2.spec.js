import { test, expect } from './intake-fixture.js';
import { staffIntakeSample } from './staff-intake-sample.js';
import { createMockStaffBackend } from './staff-api-mock.js';

test.beforeEach(({}, testInfo) => {
  if (!testInfo.config.metadata.staffDocsAvailable) {
    throw new Error('The Renatus Intake spec requires the workspace docs/app-store-intake/ directory.');
  }
});

async function openField(page, name) {
  await page.getByRole('button', { name: 'Full field checklist', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Find a field' }).fill(name);
  await page.getByRole('button', { name: `Open ${name}`, exact: true }).click();
}

const stageTitles = {
  kickoff: 'Kickoff and Apple account',
  build: 'Build verification',
  legal: 'Legal approval',
  listing: 'App Store listing',
  review: 'App Review and handoff',
};

async function fillControl(control, value, recording, pause) {
  const { tagName, type } = await control.evaluate(element => ({
    tagName: element.tagName, type: element.type,
  }));

  if (type === 'checkbox') {
    await control.setChecked(value);
    await expect(control).toBeChecked({ checked: value });
  } else {
    if (recording) await control.scrollIntoViewIfNeeded();
    if (tagName === 'SELECT') {
      if (recording) await control.focus();
      await control.selectOption(value);
    } else if (recording && type !== 'date') {
      await control.click({ delay: 65 });
      await control.fill('');
      await control.pressSequentially(value, { delay: 5 });
    } else {
      if (recording) await control.focus();
      await control.fill(value);
    }
    await expect(control).toHaveValue(value);
  }
  await pause(260);
}

async function captureNamedFields(page) {
  return page.locator('#step-2 :is(input, select, textarea)[name]').evaluateAll(controls =>
    Object.fromEntries(controls.map(control => [
      control.name,
      control.type === 'checkbox' ? control.checked : control.value,
    ])));
}

async function createStaffPage(browser, baseURL, staffURL, backend, { defaultToken = null } = {}) {
  const context = await browser.newContext({ baseURL });
  const staffOrigin = new URL(staffURL).origin;
  await context.route(url => ![baseURL, staffOrigin].includes(url.origin), route => route.abort());
  await context.route('**/website_host/public/brand/renatus-logo.svg',
    route => route.continue({ url: `${baseURL}/brand/renatus-logo.svg` }));
  await backend.install(context, { defaultToken });
  const page = await context.newPage();
  return { context, page };
}

async function signInStaff(page, email = 'staff@renatusco.com', password = 'staff-password') {
  await page.getByLabel('Staff email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
}

test('staff fills and restores every intake field, then checks the handoff summary', async ({ browser, baseURL, intake, openDemo }, testInfo) => {
  const recording = process.env.RECORD_DEMO === '1';
  if (recording) test.setTimeout(240_000);

  const { client, logo, reference, staff } = intake;
  const { stages, metadata, notApplicable, question, selections, structured } = staffIntakeSample(client, staff);
  const backend = createMockStaffBackend();
  backend.addSubmission(reference, client, logo);
  const originalClientAnswers = structuredClone(backend.rows.get(reference).handoff.answers);

  const { page, clickOptions, pause } = await openDemo('intake-step-2', { staff: true });
  await backend.install(page, { defaultToken: 'mock-staff-token-1' });
  const heading = name => page.getByRole('heading', { name, exact: true });
  const button = name => page.getByRole('button', { name, exact: true });
  const stageButtons = page.getByRole('navigation', { name: 'Wizard stages' }).getByRole('button');
  const named = (scope, name) => scope.locator(`[name="${name}"]`);
  const expected = {};
  const filledMetadata = new Set();
  const filledSelections = new Set();
  const filledStructured = new Set();
  const filledRecords = [];

  async function fillNamed(scope, name, value) {
    await fillControl(named(scope, name), value, recording, pause);
    expected[name] = value;
  }

  async function fillStructured(field, id) {
    const { checked = [], details = {}, other, records = {}, shared } = structured[id];
    filledStructured.add(id);
    if (shared) {
      await expect(field.getByRole('checkbox', { name: 'iPhone', exact: true })).toBeChecked();
      await expect(field.getByRole('checkbox', { name: 'iPad', exact: true })).toBeChecked();
      return;
    }
    const existingNames = {
      'data-verification-findings': 'verification', 'listing-assets-package': 'listingAssets', 'review-notes-notes': 'notes',
    };
    const detailName = key => existingNames[`${id}-${key}`] || `metadata-detail-${id}-${key}`;
    for (const [key, value] of Object.entries(details)) {
      const name = detailName(key);
      if (await field.locator(`select[name="${name}"]`).count()) await fillNamed(field, name, value);
    }
    for (const key of checked) await fillNamed(field, `metadata-choice-${id}-${key}`, true);
    if (other) {
      await fillNamed(field, `metadata-other-${id}`, true);
      await fillNamed(field, `metadata-value-${id}`, other);
    }
    for (const [key, value] of Object.entries(details)) {
      const name = detailName(key);
      if (!await field.locator(`select[name="${name}"]`).count()) {
        await fillNamed(field, name, value);
      }
    }
    for (const [category, entries] of Object.entries(records)) {
      const group = field.getByRole('group', { name: category, exact: true });
      const item = id === 'release-blockers' ? 'blocker' : 'product';
      for (const [index, entry] of entries.entries()) {
        await group.getByRole('button', { name: `Add ${item}`, exact: true }).click(clickOptions);
        for (const [label, value] of Object.entries(entry)) {
          const input = group.getByLabel(label, { exact: true }).nth(index);
          await fillControl(input, value, recording, pause);
          filledRecords.push({ id, input, value });
        }
      }
    }
  }

  async function fillMetadata(field) {
    const id = await field.getAttribute('data-intake-control');
    const skip = named(field, 'metadata-na-' + id);
    if (await skip.count()) await fillNamed(field, 'metadata-na-' + id, notApplicable.has(id));

    if (structured[id]) {
      await fillStructured(field, id);
      return;
    }
    const selection = selections[id];
    if (selection) {
      const names = await field.locator('.choice input').evaluateAll(options => options.map(option => option.name));
      expect(names).toHaveLength(7);
      for (const name of names.slice(0, -1)) {
        await fillNamed(field, name, selection.checked.includes(name));
      }
      await fillNamed(field, 'metadata-other-' + id, Boolean(selection.other));
      const details = 'metadata-value-' + id;
      if (id === 'user-data-nutrition-labels') {
        await expect(named(field, details)).toHaveValue(selection.other);
      } else if (selection.other) {
        await fillNamed(field, details, selection.other);
      } else {
        await expect(named(field, details)).toBeHidden();
        expected[details] = '';
      }
      if (selection.evidence) await fillNamed(field, 'metadata-evidence-' + id, selection.evidence);
      filledSelections.add(id);
      return;
    }

    const value = named(field, 'metadata-value-' + id);
    if (await value.count()) {
      if (notApplicable.has(id)) {
        await expect(value).toBeHidden();
        expected['metadata-value-' + id] = '';
        return;
      }
      expect(metadata[id], `Sample evidence for ${id}`).toBeTruthy();
      await fillNamed(field, 'metadata-value-' + id, metadata[id]);
      filledMetadata.add(id);
    }
  }

  await page.goto(testInfo.config.metadata.staffURL);
  await expect(heading('Renatus Step 2 intake')).toBeVisible();
  await expect(page.getByText('Signed in as staff@renatusco.com')).toBeVisible();
  Object.assign(expected, await captureNamedFields(page));
  await pause(1000);
  const handoff = page.locator('#project-summary');
  await fillNamed(handoff, 'reference', reference);
  await button('Open intake').click(clickOptions);
  await expect(page.getByRole('status').filter({ hasText: 'Intake opened' })).toHaveText(`Intake opened · ${reference}`);
  // Handoff display fields initialized from Step 1 submission
  await expect(named(handoff, 'appName')).toHaveValue(client.appName);
  await expect(named(handoff, 'brandName')).toHaveValue(client.brandName);
  await expect(named(handoff, 'contactName')).toHaveValue(client.contactName);
  expected.appName = client.appName;
  expected.brandName = client.brandName;
  expected.contactName = client.contactName;
  await expect(stageButtons).toHaveText(['1. Kickoff', '2. Build', '3. Legal', '4. Listing', '5. App Review']);

  for (const [stage, fields] of Object.entries(stages)) {
    const title = stageTitles[stage];
    await expect(heading(title)).toBeVisible();
    const panel = page.getByRole('region', { name: title, exact: true });
    await pause(900);
    for (const [name, value] of Object.entries(fields)) {
      await fillNamed(panel, name, value);
    }
    if (stage === 'kickoff') {
      const data = selections['user-data-nutrition-labels'];
      for (const [name, value] of [
        ...data.checked.map(name => [name, true]),
        ['metadata-other-user-data-nutrition-labels', true],
        ['metadata-value-user-data-nutrition-labels', data.other],
      ]) {
        await fillControl(panel.locator(`[data-shared-name="${name}"]`), value, recording, pause);
        expected[name] = value;
      }
      await button('Add question').click(clickOptions);
      await fillControl(panel.getByLabel('Question', { exact: true }), question.text, recording, pause);
      await fillControl(panel.getByLabel('Owner', { exact: true }), question.owner, recording, pause);
      await fillControl(panel.getByRole('combobox', { name: 'Due stage' }), question.stage, recording, pause);
    }
    for (const field of await panel.locator('[data-field-slot]').all()) {
      await fillMetadata(field);
    }
    for (const field of await panel.locator('[data-intake-slot]:not([data-intake-slot="personal-data-kickoff"])').all()) {
      await fillMetadata(field);
    }
    for (const group of await panel.locator('.stage-fields > details').all()) {
      await group.locator(':scope > summary').click(clickOptions);
      for (const field of await group.locator('[data-field-id]').all()) {
        await fillMetadata(field);
      }
    }
    if (stage === 'review') {
      await fillNamed(panel, 'reviewTested', true);
      await fillNamed(panel, 'blockersState', 'cleared');
    }
    if (stage !== 'review') await button('Continue').click(clickOptions);
  }

  expect(filledMetadata).toEqual(new Set(Object.keys(metadata)));
  expect(filledSelections).toEqual(new Set(Object.keys(selections)));
  expect(filledStructured).toEqual(new Set(Object.keys(structured)));
  await expect(page.locator('[data-field-id]')).toHaveCount(63);
  await expect(page.locator('[name^="metadata-status-"]')).toHaveCount(0);
  await expect(page.getByRole('textbox', {
    name: 'Age rating result or questionnaire reference', exact: true, includeHidden: true,
  })).toHaveCount(1);
  expect(await captureNamedFields(page)).toEqual(expected);

  await button('Save').click(clickOptions);
  await expect(page.getByRole('status').filter({ hasText: 'Draft saved' })).toHaveText('Draft saved to Supabase.');
  expect(backend.rows.get(reference).staffRevision).toBe(1);
  expect(backend.rows.get(reference).handoff.answers).toEqual(originalClientAnswers);
  await pause(1000);
  await page.reload();
  await expect(heading(stageTitles.review)).toBeVisible();
  await expect(stageButtons.filter({ hasText: '5. App Review' })).toHaveAttribute('aria-current', 'step');
  expect(await captureNamedFields(page)).toEqual(expected);
  const savedQuestion = page.locator('#questions');
  await expect(savedQuestion.getByLabel('Question', { exact: true })).toHaveValue(question.text);
  await expect(savedQuestion.getByLabel('Owner', { exact: true })).toHaveValue(question.owner);
  await expect(savedQuestion.getByLabel('Due stage')).toHaveValue(question.stage);

  await button('Full field checklist').click(clickOptions);
  await expect(heading('App Store field checklist')).toBeVisible();
  await expect(page.getByText(/63 staff fields in Step 2/)).toBeVisible();
  await fillControl(page.getByRole('searchbox', { name: 'Find a field' }), 'Support URL', recording, pause);
  await expect(button('Open Support URL')).toBeVisible();
  await button('Return to current stage').click(clickOptions);
  await expect(heading(stageTitles.review)).toBeVisible();
  await expect(stageButtons.filter({ hasText: '5. App Review' })).toHaveAttribute('aria-current', 'step');

  await button('Full field checklist').click(clickOptions);
  await page.getByRole('searchbox', { name: 'Find a field' }).fill('');
  await fillControl(page.getByRole('searchbox', { name: 'Find a field' }), 'Health and fitness features', recording, pause);
  await fillControl(page.getByRole('combobox', { name: 'When to check it' }), 'build', recording, pause);
  await button('Open Health and fitness features').click(clickOptions);
  await expect(heading(stageTitles.kickoff)).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Apple Health or Watch' })).toBeChecked();
  await expect(page.locator('[data-scope-summary="target-devices"]')).toHaveText('iPhone · iPad');
  await stageButtons.filter({ hasText: '4. Listing' }).click(clickOptions);
  const purchase = page.locator('[data-field-id="iap-subscriptions"]');
  await purchase.locator('..').locator(':scope > summary').click(clickOptions);
  for (const { input, value } of filledRecords.filter(record => record.id === 'iap-subscriptions')) {
    await expect(input).toHaveValue(value);
  }
  await stageButtons.filter({ hasText: '2. Build' }).click(clickOptions);
  await fillNamed(page, 'findings', 'Verified against release build');
  await stageButtons.filter({ hasText: '5. App Review' }).click(clickOptions);
  for (const { input, value } of filledRecords.filter(record => record.id === 'release-blockers')) {
    await expect(input).toHaveValue(value);
  }
  if (!recording) {
    const blockerStatus = page.getByLabel('Blocker status');
    await blockerStatus.selectOption('open');
    await expect(page.locator('#handoff-issues')).toContainText('Confirm that all applicable blockers are cleared.');
    await blockerStatus.selectOption('cleared');
  }
  await expect(page.getByText('All handoff checks complete.')).toBeVisible();
  if (recording) await heading('Handoff summary').scrollIntoViewIfNeeded();
  await button('Save').click(clickOptions);
  await expect(page.getByText('Draft saved to Supabase.', { exact: true })).toBeVisible();
  expect(await captureNamedFields(page)).toEqual(expected);
  await pause(2000);

  if (!recording) {
    // Reopen in a fresh browser context (no sessionStorage) and verify all fields restore from Supabase
    const fresh = await createStaffPage(browser, baseURL, testInfo.config.metadata.staffURL, backend);
    try {
      await fresh.page.goto(testInfo.config.metadata.staffURL);
      await signInStaff(fresh.page);
      await fresh.page.getByLabel('Intake reference', { exact: true }).fill(reference);
      await fresh.page.getByRole('button', { name: 'Open intake', exact: true }).click();
      await expect(fresh.page.getByRole('heading', { name: stageTitles.review, exact: true })).toBeVisible();
      expect(await captureNamedFields(fresh.page)).toEqual(expected);
      await expect(fresh.page.getByText('All handoff checks complete.')).toBeVisible();
    } finally {
      await fresh.context.close();
    }

    await stageButtons.filter({ hasText: '2. Build' }).click();
    await page.getByLabel('Release build', { exact: true }).fill(`${staff.releaseBuild}.1`);
    await expect(page.getByLabel('Data findings')).toHaveValue('Pending verification');
    await expect(page.getByLabel('Verification evidence', { exact: true })).toHaveValue('QA-104 · account and data test report');
    await stageButtons.filter({ hasText: '5. App Review' }).click();
    await expect(page.getByText('Review the outstanding items before handoff.')).toBeVisible();
  }
});

test('staff saves incomplete drafts from each of the 5 stages (including hidden values and repeatable records) and reopens in a fresh browser', async ({ browser, baseURL, intake }, testInfo) => {
  const backend = createMockStaffBackend();
  backend.addSubmission(intake.reference, intake.client, intake.logo);
  const staffURL = testInfo.config.metadata.staffURL;

  const entries = [
    ['kickoff', 'Renatus owner', intake.staff.owner],
    ['build', 'Release build', intake.staff.releaseBuild],
    ['legal', 'Current policy version', 'Draft 1'],
    ['listing', 'App Store Connect record URL', 'https://appstoreconnect.example.test/apps/1'],
    ['review', 'Submission owner', intake.staff.owner],
  ];

  for (const [index, [stage, label, value]] of entries.entries()) {
    const session = await createStaffPage(browser, baseURL, staffURL, backend);
    try {
      await session.page.goto(staffURL);
      await signInStaff(session.page);
      await session.page.getByLabel('Intake reference', { exact: true }).fill(intake.reference);
      await session.page.getByRole('button', { name: 'Open intake', exact: true }).click();
      await expect(session.page.getByRole('status').filter({ hasText: 'Intake opened' })).toBeVisible();

      const save = session.page.getByRole('button', { name: 'Save', exact: true });
      const stageButtons = session.page.getByRole('navigation', { name: 'Wizard stages' }).getByRole('button');
      await stageButtons.nth(index).click();
      await session.page.getByRole('textbox', { name: label, exact: true }).fill(value);

      if (stage === 'kickoff') {
        // Enter hidden organisation values then switch publishing path so they become hidden
        await session.page.getByRole('combobox', { name: 'Publishing account' }).selectOption('client_org');
        await session.page.getByLabel('D‑U‑N‑S number, if available').fill('000123456');
        await session.page.getByRole('combobox', { name: 'Publishing account' }).selectOption('renatus');
        await expect(session.page.locator('#organisation')).toBeHidden();
      }
      if (stage === 'listing') {
        const iap = session.page.locator('[data-field-id="iap-subscriptions"]');
        await iap.locator('..').locator(':scope > summary').click();
        await iap.getByRole('checkbox', { name: 'Consumable purchase', exact: true }).check();
        const group = iap.getByRole('group', { name: 'Consumable purchase', exact: true });
        await group.getByRole('button', { name: 'Add product', exact: true }).click();
        await group.getByLabel('Reference name', { exact: true }).fill('Starter Credits');
        await group.getByLabel('Product ID', { exact: true }).fill('com.example.credits');
        await group.getByLabel('Price', { exact: true }).fill('9.99');
      }
      if (stage === 'review') {
        const blockers = session.page.locator('[data-intake-slot="release-blockers"]');
        await blockers.getByRole('checkbox', { name: 'Legal', exact: true }).check();
        const group = blockers.getByRole('group', { name: 'Legal', exact: true });
        await group.getByRole('button', { name: 'Add blocker', exact: true }).click();
        await group.getByLabel('Blocker', { exact: true }).fill('Awaiting signed privacy policy');
        await group.getByLabel('Owner', { exact: true }).fill(intake.staff.owner);
      }

      await expect(save).toHaveCount(1);
      await expect(session.page.getByRole('button', { name: 'Mark handoff ready', exact: true })).toHaveCount(0);
      await save.click();
      await expect(session.page.getByText('Draft saved to Supabase.', { exact: true })).toBeVisible();
    } finally {
      await session.context.close();
    }

    // Reopen in a completely fresh browser context (no sessionStorage) and verify stage + all values
    const reopen = await createStaffPage(browser, baseURL, staffURL, backend);
    try {
      await reopen.page.goto(staffURL);
      await signInStaff(reopen.page);
      await reopen.page.getByLabel('Intake reference', { exact: true }).fill(intake.reference);
      await reopen.page.getByRole('button', { name: 'Open intake', exact: true }).click();
      await expect(reopen.page.getByRole('heading', { name: stageTitles[stage], exact: true })).toBeVisible();
      await expect(reopen.page.getByRole('textbox', { name: label, exact: true })).toHaveValue(value);

      if (stage === 'kickoff') {
        // Reveal hidden organisation fields and verify D-U-N-S with leading zeros was restored
        await reopen.page.getByRole('combobox', { name: 'Publishing account' }).selectOption('client_org');
        await expect(reopen.page.getByLabel('D‑U‑N‑S number, if available')).toHaveValue('000123456');
      }
      if (stage === 'listing') {
        const iap = reopen.page.locator('[data-field-id="iap-subscriptions"]');
        await iap.locator('..').locator(':scope > summary').click();
        const group = iap.getByRole('group', { name: 'Consumable purchase', exact: true });
        await expect(group.getByLabel('Reference name', { exact: true })).toHaveValue('Starter Credits');
        await expect(group.getByLabel('Price', { exact: true })).toHaveValue('9.99');
      }
      if (stage === 'review') {
        const blockers = reopen.page.locator('[data-intake-slot="release-blockers"]');
        const group = blockers.getByRole('group', { name: 'Legal', exact: true });
        await expect(group.getByLabel('Blocker', { exact: true })).toHaveValue('Awaiting signed privacy policy');
        await expect(reopen.page.getByText('Review the outstanding items before handoff.')).toBeVisible();
      }
    } finally {
      await reopen.context.close();
    }
  }
});

test('two references load independent drafts, preserve Step 1 handoff, and handle invalid references and failed saves', async ({ browser, baseURL, intake }, testInfo) => {
  const refA = intake.reference;
  const refB = '22222222-3333-4444-8555-666666666666';
  const clientB = {
    ...intake.client,
    legalName: 'Second Studio Pty Ltd',
    brandName: 'Second Studio',
    contactName: 'Taylor Second',
    appName: 'SecondApp',
  };
  const backend = createMockStaffBackend();
  backend.addSubmission(refA, intake.client, intake.logo);
  backend.addSubmission(refB, clientB);
  const originalClientA = structuredClone(backend.rows.get(refA).handoff);

  const staffURL = testInfo.config.metadata.staffURL;
  const { context, page } = await createStaffPage(browser, baseURL, staffURL, backend);
  try {
    await page.goto(staffURL);
    await signInStaff(page);

    // Invalid reference format (400) and nonexistent UUID (404)
    await page.getByLabel('Intake reference', { exact: true }).fill('not-a-uuid');
    await page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(page.locator('#reference-error')).toContainText('valid Step 1 intake reference');

    await page.getByLabel('Intake reference', { exact: true }).fill('99999999-9999-4999-8999-999999999999');
    await page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(page.locator('#reference-error')).toContainText('No intake submission was found');

    // Open refA (existing submission without a staff draft)
    await page.getByLabel('Intake reference', { exact: true }).fill(refA);
    await page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(page.locator('#revision-meta')).toContainText('revision 0');
    await expect(page.getByLabel('App name', { exact: true })).toHaveValue(intake.client.appName);
    await page.locator('#client-submission summary').click();
    await expect(page.locator('#client-submission-list')).toContainText(intake.client.legalName);
    await expect(page.locator('#client-submission-list')).toContainText(intake.logo.name);

    // Simulate a failed save and verify unsaved changes remain in editor for retry
    await page.getByLabel('Renatus owner', { exact: true }).fill('Owner Alpha');
    backend.setFailNextSave({ status: 502, error: 'Database temporarily unreachable.' });
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.locator('#save-feedback-banner')).toContainText('Database temporarily unreachable');
    await expect(page.getByLabel('Renatus owner', { exact: true })).toHaveValue('Owner Alpha');
    expect(backend.rows.get(refA).staffRevision).toBe(0);

    // Retry Save succeeds with editor values intact
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Draft saved to Supabase.', { exact: true })).toBeVisible();
    expect(backend.rows.get(refA).staffRevision).toBe(1);
    expect(backend.rows.get(refA).handoff).toEqual(originalClientA);

    // Open refB -> completely independent empty draft
    await page.getByLabel('Intake reference', { exact: true }).fill(refB);
    await page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(page.getByLabel('App name', { exact: true })).toHaveValue('SecondApp');
    await expect(page.getByLabel('Renatus owner', { exact: true })).toHaveValue('');
    await page.getByLabel('Renatus owner', { exact: true }).fill('Owner Beta');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Draft saved to Supabase.', { exact: true })).toBeVisible();

    // Switch back to refA -> still has Owner Alpha
    await page.getByLabel('Intake reference', { exact: true }).fill(refA);
    await page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(page.getByLabel('Renatus owner', { exact: true })).toHaveValue('Owner Alpha');
  } finally {
    await context.close();
  }
});

test('local legacy draft recovery offers review before syncing into an empty draft and loads server version when both have work', async ({ browser, baseURL, intake }, testInfo) => {
  const refEmpty = intake.reference;
  const refBoth = '33333333-4444-4555-8666-777777777777';
  const backend = createMockStaffBackend();
  backend.addSubmission(refEmpty, intake.client);
  const rowBoth = backend.addSubmission(refBoth, intake.client);
  rowBoth.staffRevision = 2;
  rowBoth.staffSavedAt = '2026-11-26T09:30:00Z';
  rowBoth.staffSavedBy = '11111111-1111-4111-8111-111111111111';
  rowBoth.staffDraft = {
    controlsVersion: 1,
    stage: 'build',
    values: {
      appName: intake.client.appName,
      brandName: intake.client.brandName,
      contactName: intake.client.contactName,
      owner: 'Server Owner',
      build: '2.0 (20)',
    },
    records: {},
    questions: [],
  };

  const staffURL = testInfo.config.metadata.staffURL;
  const { context, page } = await createStaffPage(browser, baseURL, staffURL, backend);
  try {
    await page.goto(staffURL);
    await page.evaluate(({ refEmpty, refBoth }) => {
      sessionStorage.setItem('renatus-step2-wizard', JSON.stringify({
        lastReference: refEmpty,
        drafts: {
          [refEmpty]: {
            stage: 'kickoff',
            values: {
              reference: refEmpty,
              owner: 'Recovered Local Owner',
              'metadata-value-target-devices': 'iPhone and iPad',
              'metadata-value-platforms': 'iOS and iPadOS',
              buildEvidence: 'Legacy build note to preserve.',
            },
          },
          [refBoth]: {
            controlsVersion: 1,
            stage: 'kickoff',
            values: {
              owner: 'Local Tab Owner',
              build: '1.0 (9)',
            },
          },
        },
      }));
    }, { refEmpty, refBoth });

    await page.reload();
    await signInStaff(page);

    // Case 1: Empty server draft + matching older local draft -> review before applying, does NOT auto-save
    await page.getByLabel('Intake reference', { exact: true }).fill(refEmpty);
    await page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(page.locator('#draft-recovery-banner')).toBeVisible();
    await expect(page.locator('#recovery-message')).toContainText('empty server draft');
    await expect(page.getByLabel('Renatus owner', { exact: true })).toHaveValue('');
    expect(backend.rows.get(refEmpty).staffRevision).toBe(0);

    await page.locator('#recovery-details summary').click();
    await expect(page.locator('#recovery-diff-list')).toContainText('Recovered Local Owner');
    await page.getByRole('button', { name: 'Apply local draft', exact: true }).click();
    await expect(page.getByLabel('Renatus owner', { exact: true })).toHaveValue('Recovered Local Owner');
    await expect(page.locator('#draft-recovery-banner')).toBeHidden();
    // Still not saved until staff clicks Save
    expect(backend.rows.get(refEmpty).staffRevision).toBe(0);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Draft saved to Supabase.', { exact: true })).toBeVisible();
    expect(backend.rows.get(refEmpty).staffRevision).toBe(1);
    expect(backend.rows.get(refEmpty).staffDraft.values['metadata-choice-target-devices-iphone']).toBe(true);
    expect(backend.rows.get(refEmpty).staffDraft.values['metadata-previous-build-tests']).toBe('Legacy build note to preserve.');

    // Case 2: Both server and local contain work -> loads server version and lets staff review local differences
    await page.getByLabel('Intake reference', { exact: true }).fill(refBoth);
    await page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(page.getByRole('heading', { name: stageTitles.build, exact: true })).toBeVisible();
    await expect(page.getByLabel('Release build', { exact: true })).toHaveValue('2.0 (20)');
    await expect(page.locator('#draft-recovery-banner')).toBeVisible();
    await expect(page.locator('#recovery-message')).toContainText('Loaded the latest server draft (revision 2)');
    await page.locator('#recovery-details summary').click();
    await expect(page.locator('#recovery-diff-list')).toContainText('Local Tab Owner');
    await page.getByRole('button', { name: 'Dismiss local draft', exact: true }).click();
    await expect(page.locator('#draft-recovery-banner')).toBeHidden();
    expect(backend.rows.get(refBoth).staffRevision).toBe(2);
  } finally {
    await context.close();
  }
});

test('unauthenticated/unauthorized access is blocked and concurrent edits detect revision conflicts without overwriting newer work', async ({ browser, baseURL, intake }, testInfo) => {
  const ref = intake.reference;
  const backend = createMockStaffBackend();
  backend.addSubmission(ref, intake.client);
  const staffURL = testInfo.config.metadata.staffURL;

  // 1. Unauthenticated and unauthorized attempts
  const unauth = await createStaffPage(browser, baseURL, staffURL, backend);
  try {
    await unauth.page.goto(staffURL);
    await unauth.page.getByLabel('Intake reference', { exact: true }).fill(ref);
    await unauth.page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(unauth.page.locator('#reference-error')).toContainText('Sign in with a Renatus staff account');

    await unauth.page.getByLabel('Renatus owner', { exact: true }).fill('Unsaved Edit');
    await unauth.page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(unauth.page.locator('#save-feedback-banner')).toContainText('Sign in with a Renatus staff account');
    await expect(unauth.page.getByLabel('Renatus owner', { exact: true })).toHaveValue('Unsaved Edit');

    // Attempt sign-in with an authenticated non-staff account -> 403 rejected
    await unauth.page.getByLabel('Staff email', { exact: true }).fill('unauthorized@example.test');
    await unauth.page.getByLabel('Password', { exact: true }).fill('user-password');
    await unauth.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(unauth.page.locator('#staff-auth-error')).toContainText('not authorized');
  } finally {
    await unauth.context.close();
  }

  // 2. Concurrent edits across two staff browser contexts
  const tabA = await createStaffPage(browser, baseURL, staffURL, backend);
  const tabB = await createStaffPage(browser, baseURL, staffURL, backend);
  try {
    await tabA.page.goto(staffURL);
    await signInStaff(tabA.page, 'staff@renatusco.com', 'staff-password');
    await tabA.page.getByLabel('Intake reference', { exact: true }).fill(ref);
    await tabA.page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(tabA.page.locator('#revision-meta')).toContainText('revision 0');

    await tabB.page.goto(staffURL);
    await signInStaff(tabB.page, 'staff2@renatusco.com', 'staff-password-2');
    await tabB.page.getByLabel('Intake reference', { exact: true }).fill(ref);
    await tabB.page.getByRole('button', { name: 'Open intake', exact: true }).click();
    await expect(tabB.page.locator('#revision-meta')).toContainText('revision 0');

    // Staff A saves first -> revision 1
    await tabA.page.getByLabel('Renatus owner', { exact: true }).fill('Staff A Winner');
    await tabA.page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(tabA.page.getByText('Draft saved to Supabase.', { exact: true })).toBeVisible();
    expect(backend.rows.get(ref).staffRevision).toBe(1);

    // Staff B tries to save stale revision 0 -> 409 conflict, cannot overwrite Staff A
    await tabB.page.getByLabel('Renatus owner', { exact: true }).fill('Staff B Stale Edit');
    await tabB.page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(tabB.page.locator('#save-feedback-banner')).toContainText('newer revision (revision 1)');
    // Staff B's unsaved edit stays in editor for review
    await expect(tabB.page.getByLabel('Renatus owner', { exact: true })).toHaveValue('Staff B Stale Edit');
    // Server still has Staff A's revision 1
    expect(backend.rows.get(ref).staffDraft.values.owner).toBe('Staff A Winner');
    expect(backend.rows.get(ref).staffRevision).toBe(1);

    // Review conflict diff and reload latest revision
    await tabB.page.locator('#conflict-details summary').click();
    await expect(tabB.page.locator('#conflict-diff-list')).toContainText('Staff A Winner');
    await expect(tabB.page.locator('#conflict-diff-list')).toContainText('Staff B Stale Edit');
    await tabB.page.getByRole('button', { name: 'Reload latest revision', exact: true }).click();
    await expect(tabB.page.getByLabel('Renatus owner', { exact: true })).toHaveValue('Staff A Winner');
    await expect(tabB.page.locator('#revision-meta')).toContainText('revision 1');
  } finally {
    await tabA.context.close();
    await tabB.context.close();
  }
});

test('older draft notes carry into Other and None clears competing choices', async ({ page, baseURL }, testInfo) => {
  await page.route('https://**', route => route.abort());
  await page.route('**/api/**', route => route.fulfill({ status: 401, json: { authenticated: false } }));
  await page.route('**/website_host/public/brand/renatus-logo.svg', route => route.continue({ url: `${baseURL}/brand/renatus-logo.svg` }));
  await page.goto(testInfo.config.metadata.staffURL);
  await page.evaluate(() => {
    const reference = 'legacy-staff-draft';
    sessionStorage.setItem('renatus-step2-wizard', JSON.stringify({
      lastReference: reference,
      drafts: {
        [reference]: {
          stage: 'kickoff',
          values: {
            reference,
            'metadata-value-regulated-industries': 'Air travel licensing review',
            'metadata-status-regulated-industries': 'drafted',
            'metadata-status-purpose-strings': 'not-applicable',
            'metadata-value-target-devices': 'iPhone and iPad',
            'metadata-value-platforms': 'iOS and iPadOS',
            'metadata-value-social-login-siwa': 'Apple and Google',
            build: '0.9 (17)',
            findings: 'Verified against release build',
            buildEvidence: 'Confirm the booking SDK with the engineering team.',
            usage: 'The client mentioned a new partner. Confirm recipients at kickoff.',
            blockers: 'Confirm which account owns release access.',
            blockersState: 'cleared',
          },
        },
      },
    }));
  });
  await page.reload();

  await openField(page, 'Regulated industries and features');
  const regulated = page.getByRole('group', { name: 'Regulated industries and features' });
  await expect(regulated.getByRole('checkbox')).toHaveCount(7);
  const other = regulated.getByRole('checkbox', { name: 'Other', exact: true });
  const none = regulated.getByRole('checkbox', { name: 'None', exact: true });
  const healthcare = regulated.getByRole('checkbox', { name: 'Healthcare' });
  const details = page.getByLabel('Other regulated industry or feature');
  await expect(other).toBeChecked();
  await expect(details).toHaveValue('Air travel licensing review');
  await none.check();
  await expect(other).not.toBeChecked();
  await expect(details).toBeHidden();
  await healthcare.check();
  await expect(none).not.toBeChecked();
  await other.check();
  await expect(details).toHaveValue('Air travel licensing review');

  await openField(page, 'App permissions');
  const noPermissions = page.getByRole('checkbox', { name: 'App permissions does not apply' });
  const permissions = page.getByRole('group', { name: 'App permissions', exact: true });
  await expect(noPermissions).toBeChecked();
  await expect(permissions).toBeHidden();
  await noPermissions.uncheck();
  await expect(permissions.getByRole('checkbox')).toHaveCount(7);
  const evidence = page.getByLabel('Purpose strings or build evidence for the selected permissions');
  await expect(evidence).toBeHidden();
  await permissions.getByRole('checkbox', { name: 'Camera', exact: true }).check();
  await evidence.fill('Camera · Attach a photo to the intake.');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.reload();
  await openField(page, 'App permissions');
  await expect(permissions.getByRole('checkbox', { name: 'Camera', exact: true })).toBeChecked();
  await expect(evidence).toHaveValue('Camera · Attach a photo to the intake.');
  await expect(page.getByLabel('Data findings')).toHaveValue('Pending verification');
  const buildTests = page.locator('[data-intake-slot="build-tests"]');
  await buildTests.getByText('Previous answer').click();
  await expect(buildTests.getByText('Confirm the booking SDK with the engineering team.')).toBeVisible();
  await expect(buildTests.getByRole('checkbox', { name: 'SDKs reviewed' })).not.toBeChecked();

  await openField(page, 'Social Login & Sign in with Apple');
  const providers = page.getByRole('group', { name: 'Sign-in providers' });
  await expect(providers.getByRole('checkbox', { name: 'Apple', exact: true })).toBeChecked();
  await expect(providers.getByRole('checkbox', { name: 'Google', exact: true })).toBeChecked();

  await openField(page, 'Platforms');
  const targets = page.getByRole('group', { name: 'Targets' });
  await expect(targets.getByRole('checkbox', { name: 'iPhone', exact: true })).toBeChecked();
  await expect(targets.getByRole('checkbox', { name: 'iPad', exact: true })).toBeChecked();
  await page.getByRole('button', { name: '5. App Review', exact: true }).click();
  await expect(page.getByLabel('Blocker status')).toHaveValue('open');
  const blockers = page.locator('[data-intake-slot="release-blockers"]');
  await blockers.getByText('Previous answer').click();
  await expect(blockers.getByText('Confirm which account owns release access.')).toBeVisible();
});

test('shared targets and provider choices are operable on mobile', async ({ page, baseURL }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://**', route => route.abort());
  await page.route('**/api/**', route => route.fulfill({ status: 401, json: { authenticated: false } }));
  await page.route('**/website_host/public/brand/renatus-logo.svg', route => route.continue({ url: `${baseURL}/brand/renatus-logo.svg` }));
  await page.goto(testInfo.config.metadata.staffURL);

  await openField(page, 'Target Devices');
  const targets = page.getByRole('group', { name: 'Targets', exact: true });
  const phone = targets.getByRole('checkbox', { name: 'iPhone', exact: true });
  const tablet = targets.getByRole('checkbox', { name: 'iPad', exact: true });
  await expect(phone).toBeFocused();
  await page.keyboard.press('Space');
  await expect(phone).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(tablet).toBeFocused();
  await openField(page, 'Platforms');
  await expect(phone).toBeChecked();
  await expect(tablet).not.toBeChecked();
  const screenshots = page.getByRole('textbox', { name: 'iPad screenshot files or folder', exact: true, includeHidden: true });
  await expect(screenshots).toBeHidden();
  await tablet.check();
  await openField(page, 'iPad screenshot files or folder');
  await screenshots.fill('STORE-120/iPad');
  await openField(page, 'Platforms');
  await tablet.uncheck();
  await expect(screenshots).toBeHidden();
  await expect(screenshots).toBeDisabled();
  await tablet.check();
  await openField(page, 'iPad screenshot files or folder');
  await expect(screenshots).toHaveValue('STORE-120/iPad');

  await openField(page, 'Social Login & Sign in with Apple');
  const providers = page.getByRole('group', { name: 'Sign-in providers', exact: true });
  const google = providers.getByRole('checkbox', { name: 'Google', exact: true });
  const other = providers.getByRole('checkbox', { name: 'Other provider', exact: true });
  const otherName = providers.getByLabel('Other provider name', { exact: true });
  const noSignIn = providers.getByRole('checkbox', { name: 'No sign-in', exact: true });
  await google.check();
  await other.check();
  await otherName.fill('Passkeys');
  await noSignIn.check();
  await expect(google).not.toBeChecked();
  await expect(other).not.toBeChecked();
  await expect(otherName).toBeDisabled();
  await other.check();
  await expect(noSignIn).not.toBeChecked();
  await expect(otherName).toHaveValue('Passkeys');

  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.getByRole('textbox', { name: 'Release build', exact: true }).fill('0.9 (17)');
  await otherName.fill('');
  await page.getByRole('button', { name: '5. App Review', exact: true }).click();
  await expect(page.locator('#handoff-issues')).toContainText('Enter other provider name.');
});
