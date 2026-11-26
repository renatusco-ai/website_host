import { test, expect } from './intake-fixture.js';
import { staffIntakeSample } from './staff-intake-sample.js';

test.beforeEach(({}, testInfo) => {
  if (!testInfo.config.metadata.staffDocsAvailable) {
    throw new Error('The Renatus Intake spec requires the workspace docs/ directory beside website_host/.');
  }
});

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
  const { stages, metadata, notApplicable, question, selections } = staffIntakeSample(client, staff);
  const { page, clickOptions, pause } = await openDemo('intake-step-2', { staff: true });
  const heading = name => page.getByRole('heading', { name, exact: true });
  const button = name => page.getByRole('button', { name, exact: true });
  const stageButtons = page.getByRole('navigation', { name: 'Wizard stages' }).getByRole('button');
  const named = (scope, name) => scope.locator(`[name="${name}"]`);
  const expected = {};
  const filledMetadata = new Set();
  const filledSelections = new Set();

  async function fillNamed(scope, name, value) {
    await fillControl(named(scope, name), value, recording, pause);
    expected[name] = value;
  }

  async function fillMetadata(field) {
    const id = await field.getAttribute('data-field-id');
    const skip = named(field, 'metadata-na-' + id);
    if (await skip.count()) await fillNamed(field, 'metadata-na-' + id, notApplicable.has(id));

    const selection = selections[id];
    if (selection) {
      const names = await field.locator('.choice input').evaluateAll(options => options.map(option => option.name));
      expect(names).toHaveLength(7);
      for (const name of names.slice(0, -1)) {
        await fillNamed(field, name, selection.checked.includes(name));
      }
      await fillNamed(field, 'metadata-other-' + id, Boolean(selection.other));
      const details = 'metadata-value-' + id;
      if (selection.other) await fillNamed(field, details, selection.other);
      else {
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
      await button('Add question').click(clickOptions);
      await fillControl(panel.getByLabel('Question', { exact: true }), question.text, recording, pause);
      await fillControl(panel.getByLabel('Owner', { exact: true }), question.owner, recording, pause);
      await fillControl(panel.getByRole('combobox', { name: 'Due stage' }), question.stage, recording, pause);
    }
    for (const field of await panel.locator('[data-field-slot]').all()) {
      await fillMetadata(field);
    }
    for (const group of await panel.locator('.stage-fields > details').all()) {
      await group.locator('summary').click(clickOptions);
      for (const field of await group.locator('[data-field-id]').all()) {
        await fillMetadata(field);
      }
    }
    if (stage !== 'review') await button('Continue').click(clickOptions);
  }

  expect(filledMetadata).toEqual(new Set(Object.keys(metadata)));
  expect(filledSelections).toEqual(new Set(Object.keys(selections)));
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
  await expect(page.getByLabel('Question', { exact: true })).toHaveValue(question.text);
  await expect(page.getByLabel('Owner', { exact: true })).toHaveValue(question.owner);
  await expect(page.getByLabel('Due stage', { exact: false })).toHaveValue(question.stage);

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
  await stageButtons.filter({ hasText: '5. App Review' }).click(clickOptions);
  await expect(page.getByText('Checks complete. The submission owner can mark the handoff ready.')).toBeVisible();
  await button('Mark handoff ready').click(clickOptions);
  await expect(page.getByText(`Handoff ready · ${staff.owner}`, { exact: false })).toBeVisible();
  expect(await captureNamedFields(page)).toEqual(expected);
  await pause(2000);
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
          },
        },
      },
    }));
  });
  await page.reload();

  async function openField(name) {
    await page.getByRole('button', { name: 'Full field checklist', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Find a field' }).fill(name);
    await page.getByRole('button', { name: `Open ${name}`, exact: true }).click();
  }

  await openField('Regulated industries and features');
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

  await openField('App permissions');
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
  await openField('App permissions');
  await expect(permissions.getByRole('checkbox', { name: 'Camera', exact: true })).toBeChecked();
  await expect(evidence).toHaveValue('Camera · Attach a photo to the intake.');
});
