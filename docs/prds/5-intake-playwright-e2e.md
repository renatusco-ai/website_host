# PRD 5 — Playwright tests and demo recordings for App Store intake

## Problem statement

Renatus needs a repeatable way to verify and record the public client intake and the internal staff wizard. Each demo needs its own video. The staff demo starts with a client intake reference ready to use.

## Solution

Add Playwright Test to `website_host` with two independently runnable Chromium specs. Use the existing React form for Step 1 and the existing staff wizard prototype for Step 2. Generate realistic, repeatable form values with a fixed Faker.js seed.

## User stories

1. As a developer, I want to run the client intake test by itself so I can verify the form and confirmation screen.
2. As a developer, I want to run the staff wizard test from a fresh browser so I can verify the reference handoff and draft behavior.
3. As a presenter, I want one recording per step so I can share each workflow separately.
4. As a presenter, I want both videos to use consistent sample details so viewers can follow the same intake.
5. As a maintainer, I want routine tests to run without production credentials so developers can reproduce them locally.

## Setup and implementation decisions

- Add `@playwright/test` and `@faker-js/faker` as development dependencies and commit the updated npm lockfile. Use Chromium and configure Playwright to start the Vite dev server and a second local server for the staff prototype and its supporting scripts. Use Python 3 for the static server and bind both servers to localhost.
- Use a shared fixture that seeds Faker per test and generates business, contact, branding, app and staff field values. Use reserved example domains for email and website values. Generate a stable reference in the test response and use a small synthetic logo file for the upload.
- Simulate Supabase Storage and submission responses at the browser network boundary. Assert that the form sends the expected fields and uses the signed upload URL. These specs cover browser behavior and the reference handoff. The existing API tests cover server-side behavior.
- Disable video for normal runs. In recording mode, create a recording context only after setup completes. Step 2 prepares the same reference and client answers used by Step 1 in its own fixture. It uses that reference when opening the staff wizard. Step 2 requires no previous run or browser state from Step 1.
- Use a fixed recording viewport and save each video under a distinct filename. Await context closure before saving. Keep the recordings outside Playwright’s test output directory so a later run preserves the other step’s video. Ignore both directories in version control.

## Test scenarios

| Spec | Scenario | Expected behavior |
| --- | --- | --- |
| `intake-step-1.spec.js` | Open the public intake form, fill the client fields, upload a logo and submit. | The upload goes to the signed URL, the submission includes the asset reference, and the confirmation shows the intake reference and next steps. |
| `intake-step-2.spec.js` | Prepare the client reference before recording. Open that reference in the Renatus wizard, enter sample staff details, move through the five stages and save a draft. | The wizard accepts the reference. After a reload in the same tab, the reference, saved answers and current stage are restored. |

Use visible labels and accessible roles for interactions and assert visible outcomes. Keep the recording focused on the successful path through each step.

## Commands

Run from `website_host` after implementation. Prerequisites are Node.js, npm and Python 3.

| Action | Command |
| --- | --- |
| Install dependencies | `npm ci` |
| Install Chromium | `npx playwright install chromium` |
| Run Step 1 | `npx playwright test intake-step-1.spec.js` |
| Run Step 2 | `npx playwright test intake-step-2.spec.js` |
| Record Step 1 | `RECORD_DEMO=1 npx playwright test intake-step-1.spec.js` |
| Record Step 2 | `RECORD_DEMO=1 npx playwright test intake-step-2.spec.js` |

## Acceptance criteria

- Both specs pass individually from a fresh checkout after setup, including when Step 2 runs first.
- The same fixed seed produces the same field values and reference on repeat runs.
- Both test scenarios verify their expected behavior without live Supabase credentials, real uploads or outbound email.
- Recording each spec yields one playable video in its own output path, `demo-recordings/intake-step-1.webm` or `demo-recordings/intake-step-2.webm`. Run either recording command again without overwriting the other step's video.
- The Step 2 recording shows only the staff workflow. Client data and the reference are prepared before the recording context opens.
- The setup, test and recording commands are documented alongside the Playwright suite.

## Out of scope

- Changes to the intake forms, API, database schema or staff prototype.
- Verification against live Supabase or App Store Connect.
- Video editing, narration and conversion to MP4.

## References

- [Client intake and staff handoff](2-app-store-intake-split.md)
- [Renatus Step 2 intake wizard](3-renatus-step-2-intake-wizard.md)
- [Playwright video recording](https://playwright.dev/docs/videos)
