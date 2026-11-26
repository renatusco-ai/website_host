import { test, expect } from './intake-fixture.js';
import { staffIntakeSample } from './staff-intake-sample.js';

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

test('staff fills and restores every intake field, then verifies the handoff', async ({ intake, openDemo }, testInfo) => {
  const recording = process.env.RECORD_DEMO === '1';
  if (recording) test.setTimeout(240_000);

  const { client, reference, staff } = intake;
  const { stages, metadata, notApplicable, question, selections, structured } = staffIntakeSample(client, staff);
  const { page, clickOptions, pause } = await openDemo('intake-step-2', { staff: true });
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
  Object.assign(expected, await captureNamedFields(page));
  await pause(1000);
  const handoff = page.locator('#project-summary');
  for (const [name, value] of Object.entries({
    reference, appName: client.appName, brandName: client.brandName, contactName: client.contactName,
  })) {
    await fillNamed(handoff, name, value);
  }
  await button('Open intake').click(clickOptions);
  await expect(page.getByRole('status').filter({ hasText: 'Intake opened' })).toHaveText(`Intake opened · ${reference}`);
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

  await button('Save draft').click(clickOptions);
  await expect(page.getByRole('status').filter({ hasText: 'Draft saved' })).toHaveText('Draft saved in this tab.');
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
    await button('Mark handoff ready').click();
    await expect(page.getByText('Confirm that all applicable blockers are cleared.', { exact: false })).toBeVisible();
    await blockerStatus.selectOption('cleared');
  }
  await expect(page.getByText('Checks complete. The submission owner can mark the handoff ready.')).toBeVisible();
  await button('Mark handoff ready').click(clickOptions);
  await expect(page.getByText(`Handoff ready · ${staff.owner}`, { exact: false })).toBeVisible();
  expect(await captureNamedFields(page)).toEqual(expected);
  await pause(2000);

  if (!recording) {
    await stageButtons.filter({ hasText: '2. Build' }).click();
    await page.getByLabel('Release build', { exact: true }).fill(`${staff.releaseBuild}.1`);
    await expect(page.getByLabel('Data findings')).toHaveValue('Pending verification');
    await expect(page.getByLabel('Verification evidence', { exact: true })).toHaveValue('QA-104 · account and data test report');
    await stageButtons.filter({ hasText: '5. App Review' }).click();
    await expect(page.getByText('Finish the checks below before marking the handoff ready.')).toBeVisible();
    await button('Mark handoff ready').click();
    await expect(page.getByRole('status').filter({ hasText: 'Resolve the open items' })).toBeVisible();
  }
});

test('older draft notes carry into Other and None clears competing choices', async ({ page, baseURL }, testInfo) => {
  await page.route('https://**', route => route.abort());
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
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
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
