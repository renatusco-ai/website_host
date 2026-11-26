import { mkdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { fakerEN_AU as faker } from '@faker-js/faker';
import { test as base, expect } from '@playwright/test';
import { installDemoCursor } from './demo-cursor.js';

const viewport = { width: 1440, height: 900 };
const recordingsDir = new URL('../../demo-recordings/', import.meta.url);
const staffLogo = fileURLToPath(new URL('../../public/brand/renatus-logo.svg', import.meta.url));

export const test = base.extend({
  intake: async ({}, use) => {
    faker.seed(261126);
    const appName = faker.helpers.arrayElement(['Juniper', 'Luma', 'Harbour', 'Summit']);
    const activity = faker.helpers.arrayElement(['mobility', 'strength', 'stretching']);
    const brandName = `${appName} ${activity[0].toUpperCase()}${activity.slice(1)}`;
    const slug = faker.helpers.slugify(brandName).toLowerCase();
    const domain = `${slug}.example.test`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const [primary, accent] = Array.from({ length: 2 }, () => faker.color.rgb({ format: 'hex' }));
    const websiteUrl = `https://${domain}`;
    const client = {
      legalName: `${brandName} Pty Ltd`,
      brandName,
      contactName: `${firstName} ${lastName}`,
      contactEmail: faker.internet.email({ firstName, lastName, provider: domain }).toLowerCase(),
      contactPhone: `0491 570 ${String(faker.number.int({ min: 1, max: 9 })).padStart(3, '0')}`,
      websiteUrl,
      brandKitUrl: `${websiteUrl}/brand`,
      brandColors: `${primary}, ${accent}`,
      appName,
      appSummary: `${appName} lets members in ${faker.location.city()} book ${activity} classes and follow short routines at home.`,
    };
    const reference = faker.string.uuid();
    const staff = {
      owner: faker.person.fullName(),
      releaseBuild: `0.9 (${faker.number.int({ min: 10, max: 40 })})`,
      supportUrl: `${websiteUrl}/support`,
      reviewNotes: `Sign in, open ${faker.helpers.arrayElement(['Classes', 'Schedule'])}, and start a sample ${activity} session.`,
    };
    const logo = {
      name: `${slug}-logo.svg`,
      mimeType: 'image/svg+xml',
      buffer: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${primary}"/><path d="M10 48 32 14l22 34z" fill="${accent}"/></svg>`),
    };
    await use({ client, reference, staff, logo });
  },

  openDemo: async ({ browser, baseURL, actionTimeout }, use, testInfo) => {
    const recording = process.env.RECORD_DEMO === '1';
    const { staffURL } = testInfo.config.metadata;
    let context;
    let page;
    let name;

    try {
      await use(async (videoName, { staff = false } = {}) => {
        name = videoName;
        context = await browser.newContext({
          baseURL,
          viewport,
          serviceWorkers: 'block',
          ...(recording && { recordVideo: { dir: testInfo.outputPath('video'), size: viewport } }),
        });
        context.setDefaultTimeout(actionTimeout);
        if (recording) await context.addInitScript(installDemoCursor);
        const staffOrigin = new URL(staffURL).origin;
        await context.route(url => ![baseURL, staffOrigin].includes(url.origin), route => route.abort());
        await context.route('**/api/**', route => route.abort());
        if (staff) {
          await context.route(`${staffOrigin}/website_host/public/brand/renatus-logo.svg`,
            route => route.fulfill({ path: staffLogo, contentType: 'image/svg+xml' }));
        }
        page = await context.newPage();
        return {
          page,
          clickOptions: recording ? { delay: 200 } : {},
          pause: ms => recording ? setTimeout(ms) : Promise.resolve(),
        };
      });
    } finally {
      const video = page?.video();
      await context?.close();
      if (video) {
        if (testInfo.status === 'passed') {
          await mkdir(recordingsDir, { recursive: true });
          await video.saveAs(fileURLToPath(new URL(`${name}.webm`, recordingsDir)));
        }
        await video.delete();
      }
    }
  },
});

export { expect };
