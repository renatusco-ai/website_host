# PRD — Intake database and Storage naming

**Status** — Draft\
**Product** — Renatus App Store onboarding\
**Audience** — Renatus engineering and operations

## Problem statement

The App Store intake uses several names for its submissions, rate-limit functions, bucket and uploaded files. The metadata reference proposes a consistent `intake` prefix. Adopting those names means coordinating the database, API and Storage changes. Existing intake references, uploaded assets, browser drafts and signed download links need to keep working during the rollout.

## Solution

Adopt the names in the metadata reference for intake-owned tables, database objects, the private bucket and Storage object keys. Put new uploads in the prefixed bucket and migrate earlier references in stages. Keep one authoritative submissions table and one set of rate-limit counters through the transition.

## User stories

1. As a Renatus engineer, I want intake-owned database objects and Storage locations to have a consistent prefix so I can find them and tell which workflow owns them.
2. As a project lead, I want existing submissions to keep their references, answers and brand assets so I can continue onboarding clients already in progress.
3. As a client, I want to resume a draft with uploads from before the change so I can finish it without uploading the same files again.
4. As a client, I want upload, removal, submission and retry to work during the rollout so an interrupted request does not lose an asset or create a duplicate intake.
5. As a project lead, I want existing signed asset links to work for their original validity period so I can retrieve files from earlier intake notifications.
6. As an operator, I want to retry a partially completed migration and verify what moved so I can resolve failures before retiring the earlier Storage locations.
7. As an operator, I want the private bucket, access restrictions and rate limits to work through the change so the migration preserves the existing security and abuse controls.

## Implementation decisions

### Target names

| Resource | Current name | Target name |
| --- | --- | --- |
| Submissions table | `public.app_store_intakes` | `public.intake_app_store_submissions` |
| Rate-limit table | `public.intake_rate_limits` | `public.intake_rate_limits` |
| Submission date index | `idx_app_store_intakes_created_at` | `intake_app_store_submissions_created_at_idx` |
| Quick-form compatibility constraint | `app_store_intakes_legacy_required_fields` | `intake_legacy_required_fields` |
| Rate-limit RPC | `public.check_and_increment_rate_limit` | `public.intake_check_and_increment_rate_limit` |
| Orphan discovery RPC | `public.list_orphan_intake_assets` | `public.intake_list_orphan_assets` |
| Private brand asset bucket | `app-store-intake-assets` | `intake-app-store-assets` |
| Brand asset object key | `{session_id}/{hex8}-{name}` | `intake/{session_id}/{hex8}-{name}` |

Prefix other intake-owned constraints and indexes with `intake_`. `storage.buckets` and `storage.objects` describe the bucket and keys using Supabase’s platform schema.

### Database and application

- Add a forward migration that renames the existing intake objects and preserves row IDs, submission versions, session uniqueness, and rate-limit counters. Keep prior migration history so existing and fresh environments reach the same target schema.
- Preserve RLS, role grants, and `service_role` access to the RPCs through the cutover. Update dependencies and scheduled cleanup that refer to renamed objects. Coordinate schema and API rollout so active handlers can use the available names throughout the change.
- Use one naming configuration for the API’s table, RPC and bucket lookups and one path resolver for upload, verification, removal, download signing and browser-draft recovery. Update the default and deployment configuration for the target bucket. When an earlier bucket override exists, resolve it explicitly as a migration source.
- Keep the browser upload and submission contracts compatible with existing clients. Accept earlier and prefixed asset paths only within the request’s session. Count each logical upload once across the two locations and retain the existing file limits, idempotent submission reference and email behavior. A mixed draft can add or remove files normally. A migrated copy must never resurrect a file the client removed.

### Storage rollout and rollback

1. **Prepare.** Inventory source objects, paths referenced by saved submissions, and active upload sessions. Provision the target private bucket through the Storage API with the current file size and content-type limits. Release a version that can resolve both path formats before issuing new prefixed uploads. [Supabase Storage schema guidance](https://supabase.com/docs/guides/storage/schema/design)
2. **Switch new uploads.** Send new upload URLs to the target bucket and path. Keep the earlier bucket accessible through the current signed URLs and support uploads already in flight. Include objects that arrive through earlier signed upload URLs in the migration reconciliation. [Supabase signed upload documentation](https://supabase.com/docs/reference/javascript/file-buckets-createsigneduploadurl)
3. **Copy and verify.** Copy files in retryable batches through the Storage API. Match each destination to the source session and verify the content and served metadata before repointing saved asset references. During the transition, resolve earlier browser draft keys to the correct accessible object. Reconcile concurrent submissions or removals before changing their references. Keep a record of failed or mismatched copies for retry. [Supabase cross-bucket copy documentation](https://supabase.com/docs/guides/storage/management/copy-move-objects)
4. **Reconcile and retire.** Compare source assets, target assets and submission references. Retire earlier objects only after references resolve, in-flight uploads have settled, and previously issued download links have reached their original expiry. Make any cleanup operate on each bucket and key format and protect submitted assets and active drafts.
5. **Recover if needed.** Retain a compatible release and verified source-to-target mapping during rollout. If a cutover fails, pause copying or switching new writes and use a version that can serve both formats. Preserve submissions and assets written after the switch when recovering database or Storage configuration.

## Acceptance criteria and testing

- The database upgrade from the current schema and a fresh migration chain end with the target table, index, constraint and RPC names. Existing version 1 and version 2 records, session uniqueness and rate-limit counters survive the upgrade.
- New uploads use `intake-app-store-assets` and the `intake/` object prefix. Direct upload, verification, removal and signed download work through the normal client intake flow. Public access and cross-session paths are rejected.
- A draft with earlier uploads can add a prefixed upload, remove an asset, submit and retry. A source and destination copy count as one upload. A retry returns the same submission reference and sends no duplicate notification.
- Rehearse an interrupted copy, a failed integrity check, an upload during the switch and a removal concurrent with a copy. Confirm retries resolve cleanly. Existing signed links work until expiry, and cleanup protects submitted assets and active drafts in both locations.
- Rehearse rollback after receiving new uploads. Demonstrate that earlier and prefixed paths still resolve and that the system reads one authoritative intake record and rate-limit counter per key.
- Extend the existing intake API and Storage fixture tests for both path formats. Verify migrations against a seeded Supabase test environment and run the client flow in Playwright. Once the runtime uses the new names, align the reference diagram and copyable SQL with the implemented migration.

## Out of scope

- Changes to either intake form’s questions, the Step 2 wizard workflow, or the client-facing routes.
- Changes to retention, rate-limit thresholds, existing upload restrictions or historical submission contents beyond asset references.
- Running a migration or retiring deployed Storage resources as part of this PRD draft.

## References

- Target names and database structure. [App Store Connect metadata reference](../app-store-connect-metadata-reference.html)
- Public intake and browser draft behavior. [PRD 2 — Quick client intake and Renatus App Store preparation](2-app-store-intake-split.md)
