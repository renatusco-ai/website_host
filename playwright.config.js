import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const clientOrigin = 'http://127.0.0.1:4173';
const staffOrigin = 'http://127.0.0.1:4174';
const staffURL = `${staffOrigin}/renatus-step-2-intake.html`;
const staffDocsAvailable = ['renatus-step-2-intake.html', 'renatus-step-2-wizard.js', 'app-store-connect-fields.js']
  .every(file => existsSync(new URL(`../docs/${file}`, import.meta.url)));

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  metadata: { staffURL, staffDocsAvailable },
  use: { browserName: 'chromium', baseURL: clientOrigin, video: 'off', actionTimeout: 10_000 },
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
      url: `${clientOrigin}/app-store-intake`,
      env: { SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', RESEND_API_KEY: '' },
    },
    ...(staffDocsAvailable ? [{
      command: 'python3 -m http.server 4174 --bind 127.0.0.1 --directory ../docs',
      url: staffURL,
    }] : []),
  ],
});
