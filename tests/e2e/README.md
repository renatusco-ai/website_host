# App Store intake browser tests

Run the commands below from `website_host` with Node.js 22.13 or later, npm, and Python 3.

```sh
npm ci
npx playwright install chromium
```

## Run the tests

```sh
npx playwright test intake-step-1.spec.js
npx playwright test intake-step-2.spec.js
```

`npx playwright test` runs both specs. Playwright starts Vite on `127.0.0.1:4173` and serves the [staff prototype](../../docs/renatus-step-2-intake.html) on `127.0.0.1:4174`. Both specs generate the same sample client and reference from a fixed Faker seed. Step 2 prepares its own handoff, reloads the draft in the same tab, and checks that the full field checklist returns to the saved stage. The browser mocks the intake and Storage requests, so the suite needs no Supabase credentials and sends no email.

Run `node --test tests/app-store-intake.test.mjs` for the server-side intake tests.

## Record the demos

```sh
RECORD_DEMO=1 npx playwright test intake-step-1.spec.js
RECORD_DEMO=1 npx playwright test intake-step-2.spec.js
```

Successful runs save `demo-recordings/intake-step-1.webm` or `demo-recordings/intake-step-2.webm` at 1440 × 900. The recordings show a macOS-style cursor and a ring on each click. Each run replaces only the clip for the selected step. Normal runs leave those files alone and write their test artifacts to `test-results/`. Both directories are ignored by Git.
