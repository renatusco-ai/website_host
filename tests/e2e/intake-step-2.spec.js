import { test, expect } from './intake-fixture.js';

test('staff opens the client reference and resumes a saved draft', async ({ intake, openDemo }, testInfo) => {
  const { client, reference, staff } = intake;
  const handoff = {
    reference, appName: client.appName, brandName: client.brandName, contactName: client.contactName,
  };
  const { page, clickOptions, pause } = await openDemo('intake-step-2', handoff);
  const heading = name => page.getByRole('heading', { name, exact: true });
  const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
  const referenceInput = page.getByLabel('Intake reference');
  const stageButtons = page.getByRole('navigation', { name: 'Wizard stages' }).getByRole('button');

  await page.goto(testInfo.config.metadata.staffURL);
  await expect(heading('Renatus Step 2 intake')).toBeVisible();
  await pause(1200);
  await expect(referenceInput).toHaveValue(reference);
  await expect(page.getByLabel('App name', { exact: true })).toHaveValue(client.appName);
  await expect(page.getByLabel('Client business')).toHaveValue(client.brandName);
  await expect(page.getByLabel('Client contact')).toHaveValue(client.contactName);
  await referenceInput.scrollIntoViewIfNeeded();
  await pause(1500);
  await page.getByRole('button', { name: 'Open intake' }).click(clickOptions);
  await expect(page.getByRole('status').filter({ hasText: 'Intake opened' })).toHaveText(`Intake opened · ${reference}`);
  await expect(heading('Kickoff and Apple account')).toBeVisible();
  await expect(stageButtons).toHaveText(['1. Kickoff', '2. Build', '3. Legal', '4. Listing', '5. App Review']);
  await page.getByLabel('Renatus owner').fill(staff.owner);
  await page.getByRole('combobox', { name: 'Publishing account', exact: true }).selectOption({ label: 'Renatus account' });
  await page.getByLabel('Launch scope').fill(staff.scope);
  await page.getByLabel('Personal information, purpose and recipients').fill(staff.usage);
  await page.getByRole('checkbox', { name: 'General fitness or workouts' }).check();
  await pause(1600);

  await continueButton.click(clickOptions);
  await expect(heading('Build verification')).toBeVisible();
  await page.getByLabel('Release build', { exact: true }).fill(staff.releaseBuild);
  await pause(1500);

  await continueButton.click(clickOptions);
  await expect(heading('Legal approval')).toBeVisible();
  await page.getByLabel('Policy draft or notes').fill(staff.policyDraft);
  await page.getByLabel('Terms draft or notes').fill(staff.termsDraft);
  await pause(1500);

  await continueButton.click(clickOptions);
  await expect(heading('App Store listing')).toBeVisible();
  await page.getByLabel('Support URL', { exact: true }).fill(staff.supportUrl);
  await page.getByLabel('Listing copy and device screenshot references').fill(staff.listingAssets);
  await pause(1500);

  await continueButton.click(clickOptions);
  await expect(heading('App Review and handoff')).toBeVisible();
  const reviewerAccess = page.getByRole('combobox', { name: 'Reviewer access', exact: true });
  const reviewNotes = page.getByLabel(/Review notes, key flows and access prerequisites/);
  await reviewerAccess.selectOption({ label: 'Yes, demo login required' });
  await reviewNotes.fill(staff.reviewNotes);
  await pause(1500);
  await page.getByRole('button', { name: 'Save draft' }).click(clickOptions);
  await expect(page.getByRole('status').filter({ hasText: 'Draft saved' })).toHaveText('Draft saved in this tab.');
  await pause(1800);

  await page.reload();
  await expect(referenceInput).toHaveValue(reference);
  await expect(heading('App Review and handoff')).toBeVisible();
  await expect(stageButtons.filter({ hasText: '5. App Review' })).toHaveAttribute('aria-current', 'step');
  await expect(reviewerAccess).toHaveValue('Yes, demo login required');
  await expect(reviewNotes).toHaveValue(staff.reviewNotes);
  await expect(page.getByLabel('Renatus owner')).toHaveValue(staff.owner);
  await expect(page.getByLabel('Release build', { exact: true })).toHaveValue(staff.releaseBuild);
  await expect(page.getByLabel('Policy draft or notes')).toHaveValue(staff.policyDraft);
  await expect(page.getByLabel('Support URL', { exact: true })).toHaveValue(staff.supportUrl);
  await heading('App Review and handoff').scrollIntoViewIfNeeded();
  await pause(1200);

  await page.getByRole('button', { name: 'Full field checklist', exact: true }).click(clickOptions);
  await expect(heading('App Store field checklist')).toBeVisible();
  await expect(page.getByText(/\d+ staff fields in Step 2/)).toBeVisible();
  await page.getByRole('searchbox', { name: 'Find a field' }).fill('Support URL');
  await expect(page.getByRole('button', { name: 'Open Support URL', exact: true })).toBeVisible();
  await pause(1600);

  await page.getByRole('button', { name: 'Return to current stage', exact: true }).click(clickOptions);
  await expect(heading('App Review and handoff')).toBeVisible();
  await expect(stageButtons.filter({ hasText: '5. App Review' })).toHaveAttribute('aria-current', 'step');
  await expect(reviewNotes).toHaveValue(staff.reviewNotes);
  await pause(2000);
});
