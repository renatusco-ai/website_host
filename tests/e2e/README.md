# App Store intake browser tests

Run the commands below from `website_host` with Node.js 22.13 or later, npm, and Python 3. Step 2 requires the Renatus workspace’s `docs/app-store-intake/` directory.

```sh
npm ci
npx playwright install chromium
```

## Run the tests

```sh
npx playwright test intake-step-1.spec.js
npx playwright test intake-step-2.spec.js
```

`npx playwright test` runs both specs. Playwright starts Vite on `127.0.0.1:4173` and serves the [staff prototype](../../../docs/app-store-intake/renatus-step-2-intake.html) on `127.0.0.1:4174` when the workspace docs are available. Both specs generate the same sample client and reference from a fixed Faker seed. Step 2 enters the handoff, completes all five stages and 63 checklist entries, checks that the draft reloads, and verifies the handoff sign-off. It also covers checkbox selection, conditional notes, and drafts saved with the older field format. The browser mocks the intake and Storage requests, so the suite needs no Supabase credentials and sends no email.

Run `node --test tests/app-store-intake.test.mjs` for the server-side intake tests.

## Record the demos

```sh
RECORD_DEMO=1 npx playwright test intake-step-1.spec.js
RECORD_DEMO=1 npx playwright test intake-step-2.spec.js
```

Successful runs save `demo-recordings/intake-step-1.webm` or `demo-recordings/intake-step-2.webm` at 1440 × 900. The recordings show a macOS-style cursor and a ring on each click. Step 2 types the sample values at a slower pace for the recording. Each run replaces only the clip for the selected step. Normal runs leave those files alone and write their test artifacts to `test-results/`. Both directories are ignored by Git.
