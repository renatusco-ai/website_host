# PRD — Quick client intake and Renatus App Store preparation

**Status** — Draft\
**Product** — Renatus iOS client onboarding at `/app-store-intake`

## Problem statement

The current seven-step intake asks clients to make decisions about Apple Developer accounts, privacy, health features, store metadata and monetisation before the app is built. Clients may have a business, a brand and an app idea at that stage. Renatus needs accurate answers about the actual build to prepare the legal documents and App Store submission.

## Solution

1. **What the client provides.** The client submits a short form with their business and contact details, website, logo, brand colours, preferred app name and a two- or three-sentence description. Confirmation tells them that Renatus will discuss privacy and any health or fitness features on the kickoff call.
2. **What Renatus handles.** Renatus leads the kickoff discussion, verifies the app’s data use and features during the build, and drafts the privacy policy and terms for the client to approve. Renatus prepares the App Store listing and screenshots, completes Apple’s age rating questionnaire and applicable privacy and health declarations, and prepares the demo login and notes for App Review.

## User stories

1. As a client, I want to describe the app in my own words so I can get started with the information I already have.
2. As a client, I want to upload a logo or share a brand kit link and describe my colours in plain English so I can send the material I have on hand.
3. As a client, I want confirmation and clear next steps so I know the form arrived and what we’ll discuss on the kickoff call.
4. As a Renatus project lead, I want the submission and brand assets in one place so I can prepare for kickoff.
5. As a client, I want Renatus to ask how the app will use personal information and what health or fitness features I have in mind so we can clarify the app’s requirements together.
6. As a Renatus engineer, I want to verify those answers against the build, backend and third-party services so that the policy and Apple declarations describe the app users will receive.
7. As a client, I want to review and approve the privacy policy and terms before they go live so they reflect my business and how the app works.
8. As a Renatus submission owner, I want to prepare the listing, screenshots and Apple questionnaires from the release build so the submission matches its features and store settings.
9. As an App Review reviewer, I want clear instructions and working demo access when sign-in is required so I can exercise the app’s key features.

## Implementation decisions

### Part 1 — Quick client form

Use a single page with three groups. Keep the existing direct link, mobile-friendly layout, local draft and confirmation reference.

| Group | Fields | Submission rules |
| --- | --- | --- |
| Business and contact | Legal business name, trading or brand name, primary contact name, email and phone, business website | Require the names and contact details. Let the client indicate that the trading name matches the legal name. Accept an HTTP or HTTPS website URL if the business has one. Keep existing email and international phone validation. |
| Brand | Logo upload or a shareable brand kit link, brand colours | Accept existing supported brand file types and limits. Accept hex codes or colour descriptions. Allow incomplete brand details and flag them for Renatus to follow up. |
| App idea | Preferred app name and short description | Require both. Retain the 2–30 character app name limit and the 2,000 character description cap. Prompt for two or three sentences covering who the app is for and what they’ll do in it. |

Keep the optional client receipt. Notify Renatus with a reference, submitted details and protected brand asset links. Show the client a successful submission and next steps once the record is saved, even if email delivery fails. Use the same submission reference for retries. The public form should be valid with only its own required fields completed.

### Part 2 — Renatus kickoff, build and submission preparation

Use the existing project workspace to track decisions against the intake reference. Assign a Renatus owner at handoff and record open questions, their owners and the stage at which they must be resolved.

| Stage | Renatus responsibilities | Completion evidence |
| --- | --- | --- |
| Kickoff | Ask what personal information the app will use, why it needs it and who will receive it. Ask whether features include general fitness or workouts, Apple Health or Apple Watch integration, health or biometric data, or clinical advice. Review the publishing account, distribution, storefronts, supported devices, monetisation and content rights where they affect the build or release. | Kickoff notes record the client’s intent, decisions and open questions. |
| Build | Confirm actual data collection, use, sharing, retention and deletion across the app, backend and third-party SDKs. Verify account flows, permissions, tracking and health features where applicable. Check the supporting requirements in the reference against the agreed launch scope. | The project record captures verified findings and applicable release blockers, with the findings tied to the build being assessed. |
| Legal approval | Draft the privacy policy and terms from the verified app behaviour. Send both to the client for approval, capture approval of the specific versions, and arrange publication. Verify the live links in the app and App Store Connect as applicable. Reconfirm approval if a material change affects the approved text. | Document versions, approval date and live links are recorded. |
| App Store Connect | Prepare the listing copy, category and other required metadata, support URL and screenshots for the supported devices. Complete Apple’s age rating questionnaire and App Privacy disclosures using the release build and its SDKs. Complete the applicable health declarations and capture any supporting review information. | Listing and screenshots are ready. Questionnaire and declaration answers match the release build. |
| App Review | Where sign-in is required, create a dedicated demo login with representative test data and verify access to key flows. Prepare notes with sign-in steps, feature walkthroughs and any access prerequisites. For an app with open access, provide the review steps without credentials. Supply demo credentials through the designated App Review fields. | The submission owner verifies that the notes and any demo login work against the release build. |

Before handoff for submission, the Renatus owner checks that both legal documents are approved, listing and review materials are ready, and applicable blockers are resolved. A build change that affects a disclosure, screenshot, legal document or reviewer flow reopens the affected work.

### Data and reference updates

- Keep the existing Supabase intake and private brand asset flow. Version the submission format and validate the short form server-side. Update the schema to allow an absent `website_url` and a deferred `publishing_account` on new records. Preserve historical submissions and carry over the short-form fields and existing asset references from in-progress drafts. Derive any early follow-up tasks from what the client actually provided. Evaluate submission readiness using Renatus’s confirmed findings.
- Update the App Store Connect reference alongside implementation. Tab 1 should show the quick form fields and who handles the remaining metadata. Tab 2 should match the revised intake payload and storage mapping. Tab 3 should show the handoff from form submission through kickoff, build verification, approval and App Review preparation.

## Acceptance criteria and testing

- A new client can submit the short form from the existing link on mobile or desktop. Successful submission requires no answers about publishing, privacy, health, monetisation, ratings or store metadata.
- The client can submit using a logo upload or a brand kit link. If brand details are missing, the handoff identifies what to follow up on. The server rejects invalid contact fields, unsupported URLs and disallowed uploads. The form supports keyboard navigation and announces validation errors.
- A form refresh or rollout preserves compatible draft details and asset references. A retry of a successful submission returns the same reference. If email fails after a save, the client still sees a confirmation. Existing submissions remain readable.
- A kickoff-to-review dry run covers a basic fitness app and an app that collects health data and requires sign-in. In both cases the team can trace disclosures, policy approval, listing content and review steps to the build. In the sign-in case, the demo credentials open the required reviewer flows.
- Extend the existing intake validation and gap-summary tests to cover the new public payload, legacy records and the distinction between deferred and confirmed answers. Verify private upload handling and restricted access through the normal submission flow.

## Out of scope

- Android and Google Play onboarding, a client portal and a new internal dashboard.
- Automatic legal drafting, automatic App Store Connect submission and Apple’s review outcome.

## References

- The current field inventory, schema, flow and submission checklist are documented in the [App Store Connect metadata reference](../app-store-connect-metadata-reference.html).
- This PRD replaces the client-facing scope of the original seven-step implementation and moves submission preparation to Renatus. [Standalone iOS App Store client intake PRD](1-app-store-intake-form.md)
