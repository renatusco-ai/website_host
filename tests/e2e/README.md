# App Store intake browser tests

Run the commands below from `website_host` with Node.js 22.13 or later, npm, and Python 3. Use the Renatus workspace with the quick client intake and the sibling `docs` directory containing the Step 2 prototype and its scripts.

```sh
npm ci
npx playwright install chromium
```

## Run the tests

```sh
npx playwright test intake-step-1.spec.js
npx playwright test intake-step-2.spec.js
```

`npx playwright test` runs both specs. Playwright starts Vite on `127.0.0.1:4173` and the staff prototype on `127.0.0.1:4174`. Both specs generate the same sample client and reference from a fixed Faker seed. Step 2 prepares its own handoff and reloads the draft in the same tab. The browser mocks the intake and Storage requests, so the suite needs no Supabase credentials and sends no email.

Run `node --test tests/app-store-intake.test.mjs` for the server-side intake tests.

## Record the demos

```sh
RECORD_DEMO=1 npx playwright test intake-step-1.spec.js
RECORD_DEMO=1 npx playwright test intake-step-2.spec.js
```

Successful runs save `demo-recordings/intake-step-1.webm` or `demo-recordings/intake-step-2.webm` at 1440 × 900. Each run replaces only the clip for the selected step. Normal runs leave those files alone and write their test artifacts to `test-results/`. Both directories are ignored by Git.
