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

`npx playwright test` runs both specs. Playwright starts Vite on `127.0.0.1:4173` and serves the [staff wizard](../../../docs/app-store-intake/renatus-step-2-intake.html) on `127.0.0.1:4174` when the workspace docs are available. Both specs generate the same sample client and reference from a fixed Faker seed. Step 2 signs in, opens the Step 1 submission, completes all five stages and 63 checklist entries, saves to the mocked Supabase staff API, reopens in a fresh browser context, and verifies the handoff summary. It also covers saving and reopening incomplete drafts (including hidden values and repeatable records) across fresh browser contexts, independent references, invalid references, failed saves, older local draft recovery, unauthenticated/unauthorized rejections, concurrent revision conflicts, and mobile operability. The browser mocks the intake, staff session, and Storage requests (validating staff drafts with the server schema), so the suite needs no Supabase credentials and sends no email.

Run `node --test tests/app-store-intake.test.mjs` for the server-side intake tests.

## Record the demos

```sh
RECORD_DEMO=1 npx playwright test intake-step-1.spec.js
RECORD_DEMO=1 npx playwright test intake-step-2.spec.js
```

Successful runs save `demo-recordings/intake-step-1.webm` or `demo-recordings/intake-step-2.webm` at 1440 × 900. The recordings show a macOS-style cursor and a ring on each click. Step 2 types the sample values at a slower pace for the recording. Each run replaces only the clip for the selected step. Normal runs leave those files alone and write their test artifacts to `test-results/`. Both directories are ignored by Git.
