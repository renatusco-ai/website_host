import { test, expect } from './intake-fixture.js';

test('client submits app details and receives an intake reference', async ({ baseURL, intake, openDemo }) => {
  const { client, logo, reference } = intake;
  const { page, clickOptions, pause } = await openDemo('intake-step-1');
  const signedUrl = new URL(`/__intake-storage/${logo.name}?token=demo-upload`, baseURL).href;
  const uploadRequests = [];
  const signedUploads = [];
  const submissions = [];

  await page.route('/api/app-store-intake/upload-url', async route => {
    const request = route.request();
    const payload = request.postDataJSON();
    uploadRequests.push({ method: request.method(), payload });
    const path = `intake/${payload.sessionId}/decaf123-${logo.name}`;
    await route.fulfill({ json: { signedUrl, token: 'demo-upload', path } });
  });
  await page.route(signedUrl, async route => {
    const request = route.request();
    signedUploads.push({
      method: request.method(), url: request.url(), mimeType: request.headers()['content-type'], bytes: request.postDataBuffer(),
    });
    await route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.route('/api/app-store-intake', async route => {
    const request = route.request();
    submissions.push({ method: request.method(), payload: request.postDataJSON() });
    await route.fulfill({ json: { ok: true, id: reference, emailDelivered: false } });
  });

  await page.goto('/app-store-intake');
  await expect(page.getByRole('heading', { name: 'Tell us about your app' })).toBeVisible();
  await pause(1500);
  await page.getByLabel('Legal business name', { exact: true }).fill(client.legalName);
  await page.getByLabel('Trading or brand name').fill(client.brandName);
  await page.getByLabel('Primary contact name').fill(client.contactName);
  await page.getByLabel('Contact email').fill(client.contactEmail);
  await page.getByLabel('Phone country code').selectOption('+61');
  await page.getByLabel('Contact phone', { exact: true }).fill(client.contactPhone);
  await page.getByLabel('Business website').fill(client.websiteUrl);
  await pause(1500);

  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Choose files' }).click(clickOptions),
  ]);
  await chooser.setFiles(logo);
  await expect(page.getByRole('list', { name: 'Uploaded files' }).getByText(logo.name)).toBeVisible();
  await page.getByLabel('Brand kit link').fill(client.brandKitUrl);
  await page.getByLabel('Brand colours').fill(client.brandColors);
  await pause(1500);

  await page.getByLabel('Preferred app name').fill(client.appName);
  await page.getByLabel('Short description').fill(client.appSummary);
  await page.getByLabel('Email me a confirmation').uncheck();
  await pause(1500);
  await page.getByRole('button', { name: 'Send app details' }).click(clickOptions);
  await expect(page.getByRole('heading', { name: 'We’ve received your app details' })).toBeVisible();
  await expect(page.getByText(reference, { exact: true })).toBeVisible();
  await expect(page.getByText(/On the kickoff call.*personal information.*health or fitness/)).toBeVisible();

  const sessionId = uploadRequests[0]?.payload.sessionId;
  expect(sessionId).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  expect(uploadRequests).toEqual([{ method: 'POST', payload: {
    sessionId, filename: logo.name, mimeType: logo.mimeType, sizeBytes: logo.buffer.length, website: '',
  } }]);
  expect(signedUploads).toEqual([{ method: 'PUT', url: signedUrl, mimeType: logo.mimeType, bytes: logo.buffer }]);
  expect(submissions).toEqual([{ method: 'POST', payload: {
    submissionVersion: 2,
    sessionId,
    answers: { ...client, phoneCountryCode: '+61', brandNameMatchesLegalName: false },
    assets: [{ path: `intake/${sessionId}/decaf123-${logo.name}`, name: logo.name }],
    sendClientCopy: false,
    website: '',
  } }]);
  await pause(2500);
});

test('Step 1 persists brand-match, phone country code, send-copy preference, and handles idempotent retry', async ({ page, intake }) => {
  const { client, reference } = intake;
  let storedRow = null;
  let submitCalls = 0;

  await page.route('/api/app-store-intake', async route => {
    submitCalls += 1;
    const payload = route.request().postDataJSON();
    if (storedRow && storedRow.session_id === payload.sessionId) {
      await route.fulfill({ json: { ok: true, id: storedRow.id, duplicate: true } });
      return;
    }
    storedRow = {
      id: reference,
      session_id: payload.sessionId,
      answers: {
        ...payload.answers,
        brandName: payload.answers.brandNameMatchesLegalName ? payload.answers.legalName : payload.answers.brandName,
        sendClientCopy: payload.sendClientCopy === true,
      },
    };
    await route.fulfill({ json: { ok: true, id: reference, emailDelivered: true } });
  });

  await page.goto('/app-store-intake');
  await page.getByLabel('Legal business name', { exact: true }).fill(client.legalName);
  await page.getByLabel('Same as the legal business name').check();
  await expect(page.getByLabel('Trading or brand name')).toBeDisabled();
  await page.getByLabel('Primary contact name').fill(client.contactName);
  await page.getByLabel('Contact email').fill(client.contactEmail);
  await page.getByLabel('Phone country code').selectOption('+64');
  await page.getByLabel('Contact phone', { exact: true }).fill('021 555 0100');
  await page.getByLabel('Business website').fill(client.websiteUrl);
  await page.getByLabel('Brand kit link').fill(client.brandKitUrl);
  await page.getByLabel('Brand colours').fill(client.brandColors);
  await page.getByLabel('Preferred app name').fill(client.appName);
  await page.getByLabel('Short description').fill(client.appSummary);
  await expect(page.getByLabel('Email me a confirmation')).toBeChecked();

  await page.getByRole('button', { name: 'Send app details' }).click();
  await expect(page.getByRole('heading', { name: 'We’ve received your app details' })).toBeVisible();
  await expect(page.getByText(reference, { exact: true })).toBeVisible();
  expect(storedRow.answers.brandNameMatchesLegalName).toBe(true);
  expect(storedRow.answers.brandName).toBe(client.legalName);
  expect(storedRow.answers.phoneCountryCode).toBe('+64');
  expect(storedRow.answers.sendClientCopy).toBe(true);
  expect(submitCalls).toBe(1);

  // Repeat the same session submission via API and confirm it resolves to the same reference
  const retry = await page.evaluate(async (sessionId) => {
    const res = await fetch('/api/app-store-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  }, storedRow.session_id);
  expect(retry).toEqual({ ok: true, id: reference, duplicate: true });
});
