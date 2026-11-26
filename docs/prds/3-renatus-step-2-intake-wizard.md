# PRD — Renatus Step 2 intake wizard

**Status** — Draft\
**Product** — Renatus App Store onboarding\
**Audience** — Renatus project leads, engineers and submission owners

## Problem statement

The Step 2 prototype uses three work tabs and a separate field checklist. Renatus staff can find the fields they need, but they have to decide where to start, what to record before the app exists and what to revisit after a build is available. A staff member returning to an intake needs to see where they left off and what is holding up the handoff.

## Solution

Turn the internal Step 2 intake into a five-stage wizard linked to the client’s Step 1 reference. Guide staff from kickoff to the App Review handoff. Staff can move ahead with partial answers, save a draft and come back when build evidence or client approval is available. The full field checklist stays available from every stage for quick lookup. The public Step 1 client form stays as the short onboarding form defined in PRD 2.

## User stories

1. As a project lead, I want the client’s intake reference, app name, business and contact visible throughout the wizard so I can confirm which project I’m working on.
2. As a project lead, I want kickoff instructions and Apple account links before the first entry fields so I can prepare for the call and resolve enrolment questions early.
3. As a project lead, I want to record the publishing path and applicable organisation details so I can follow up on D‑U‑N‑S, membership and team access.
4. As a project lead, I want to record data use, health or fitness features and launch decisions as proposed at kickoff so engineers can verify them later.
5. As a project lead, I want open questions to have an owner and due stage so I can follow them up across the handoff.
6. As a staff member, I want to move between stages and resume my saved draft so I can work as information becomes available.
7. As an engineer, I want build-specific fields to show **Awaiting build** so I can distinguish work that is blocked by the release candidate from work I can do now.
8. As an engineer, I want to record verified data use, SDKs, permissions and health behaviour against a build so declarations can be traced to evidence.
9. As a project lead, I want to record approval evidence for each version of the privacy policy and terms so I know what the client signed off on.
10. As a submission owner, I want to draft App Store metadata early and revisit screenshots, ratings and disclosures after build verification so I can prepare the listing in parallel.
11. As a submission owner, I want to document review access and test the review flow on the release build so Apple can exercise the required features.
12. As a submission owner, I want to see the unresolved blockers and the relevant stage from a review summary so I can finish the handoff.
13. As a staff member, I want to search the full reference inventory from any stage and jump to the matching field so I can find an item without working through each screen.
14. As a keyboard or screen reader user, I want the current stage, field errors and save result announced so I can complete the same workflow.

## Implementation decisions

### Wizard stages

| Stage | What Renatus records | What can stay open |
| --- | --- | --- |
| 1. Kickoff and Apple account | Step 1 reference and owner. Publishing account, organisation enrolment where applicable, D‑U‑N‑S, Account Holder and team access. Intended data use, health scope, distribution, storefronts, devices, monetisation, content rights and open questions. | Whether the client has an active account and who owns unresolved kickoff items. |
| 2. Build verification | Release build identifier. Actual collection, sharing, retention and deletion across the app, backend and SDKs. Account flows, social login, permissions, health features, tracking, privacy manifests and export compliance as applicable. | Findings that require the release candidate. |
| 3. Legal approval | Policy and terms drafts, document versions, approval dates, approval evidence, and live URLs. Record which material changes require revised approval. | Publication and client approval while the policy or terms are still being drafted or reviewed. |
| 4. App Store listing | App record metadata, listing copy, support URL, icons and device screenshots. Track age rating, privacy disclosures, applicable health declarations, and any regional or monetisation requirements. | Final assets and declarations that rely on the build. |
| 5. App Review and handoff | Review contact, notes, demo or open access, evidence that key flows were tested, and applicable blockers. Summarise outstanding work and record the submission owner’s sign-off. | Reviewer access and sign-off until the relevant evidence is ready. |

### Navigation and progress

- Show the current stage, step count and named progress indicators. Provide **Back**, **Continue** and **Save draft**. Let staff directly open any stage indicated in the progress navigation.
- Keep the top instructions and Apple links, including the D‑U‑N‑S lookup. When a stage needs specific instructions, place them above its fields. Keep the client handoff summary visible on desktop and easy to reopen on mobile.
- Apply the existing **Not started**, **Drafted**, **Awaiting build**, **Verified** and **Not applicable** statuses. Describe each stage’s outstanding work using its fields and their applicability. A stage the user has visited still needs review if evidence is missing.
- Allow a draft to save and advance with incomplete fields. When the user records the handoff as ready, present unresolved applicable requirements and link each item to its owning stage. Use the release build, verified disclosures and assets, approved legal versions, tested review access and cleared blockers defined in PRD 2 as the handoff criteria.
- When a new release build affects verified work, show the affected findings as requiring review. Reopen client approval when the approved legal text changes materially.

### Field inventory and draft compatibility

- Use the shared App Store Connect field inventory. The 12 client fields remain in Step 1 and the 63 Renatus fields remain reachable in Step 2. Assign every Renatus field one owning stage. Group related fields without combining their saved values or progress.
- Keep the full searchable field checklist available from each stage. Show the owning stage, required or conditional status, and whether a build is needed. Jump to the same editable field used in the wizard so a change is reflected in both views.
- Show enrolment fields for applicable organisation publishing accounts. Track whether App Review demo access is needed and tested. Staff enter actual demo credentials and financial account information in the designated Apple screens.
- Preserve existing field values, status identifiers and conditional values when loading existing prototype drafts. Save the current stage alongside the intake reference in the existing browser-tab draft. Resume at the saved stage when available and start at kickoff otherwise. Switching references keeps each intake’s data associated with the correct project.

## Acceptance criteria and testing

- From an empty draft, a Renatus user can enter the Step 1 reference, assign an owner and navigate all five stages with no release build. Missing build evidence appears as **Awaiting build** and the handoff summary lists unresolved items.
- The wizard preserves existing Step 2 values and per-field statuses across an upgrade. Saving from any stage and refreshing restores the reference, last stage, current values and statuses. Two intake references never display each other’s draft answers.
- Comparing the wizard against the reference shows 63 unique Renatus items with an entry or verification control and one owning stage apiece. The checklist finds each item and opens its owner. Step 1 still handles all 12 client fields.
- A client organisation case reveals the relevant Apple enrolment fields. A Renatus account case omits them from applicable handoff work. Test both an app with open access and an app that requires a demo login.
- A pre-build draft can record the app’s planned scope and store metadata. A release-ready example shows the evidence needed for sign-off. Changing an affected build or legal version reopens the appropriate verification or approval.
- Verify desktop and mobile navigation, keyboard operation, accessible focus after stage changes, and announced save feedback. Use the existing Playwright intake flow as prior art for a synthetic client-to-staff walkthrough.

## Out of scope

- Changes to Step 1, the public intake API or the Supabase schema.
- Multi-user draft storage, a new staff dashboard or client portal.
- Automatic legal drafting, automatic Apple submission and storing demo passwords or financial account details in the wizard.

## References

- Workflow ownership and release evidence. [PRD 2 — Quick client intake and Renatus App Store preparation](2-app-store-intake-split.md)
- Full field inventory and publishing guidance. [App Store Connect metadata reference](../app-store-connect-metadata-reference.html)
- Current staff form and browser-tab draft behaviour. [Renatus Step 2 intake prototype](../renatus-step-2-intake.html)
