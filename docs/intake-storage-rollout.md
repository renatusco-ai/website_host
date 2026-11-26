# Intake database and Storage rollout

Use the Supabase project for the environment you are deploying. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in a secure operator environment for the commands below. If the deployment used a custom `SUPABASE_INTAKE_BUCKET`, set `SUPABASE_INTAKE_LEGACY_BUCKET` to that bucket name in the deployment and the operator environment. Without an explicit value, the API recognizes an earlier `SUPABASE_INTAKE_BUCKET` override that differs from `intake-app-store-assets`, then falls back to `app-store-intake-assets`.

## Prepare and switch uploads

1. Rehearse on a test project with version 1 and 2 submissions, a pre-cutover draft with an uploaded asset, and a previously issued signed download link. Back up the intake rows and Storage assets before applying the changes to an existing environment.
2. Compare the target’s migration history and preview the deployment with `supabase db push --dry-run`. Apply the [initial intake schema](../supabase/migrations/20261126021631_app_store_intakes.sql), [quick form changes](../supabase/migrations/20261126021633_quick_app_store_intake.sql), and [intake naming changes](../supabase/migrations/20261126021635_intake_storage_names.sql) in that order, starting with the first migration pending in that project. The naming migration keeps the original table and RPC names available through a writable view and forwarding functions. Both API versions share the same records and counters.
3. From `website_host`, run the following commands. `provision` sets the target bucket to private with the existing size and MIME limits. Check the project's Storage policies for broader grants covering either bucket. Save the inventory output for reconciliation and resolve missing references.

   ```sh
   node scripts/migrate-intake-storage.mjs provision
   node scripts/migrate-intake-storage.mjs inventory
   ```

4. Deploy the compatible API with `INTAKE_UPLOAD_WRITE_MODE=legacy`, then confirm both bucket locations are available. Drain previous API instances and route old form clients to the compatible API before switching writes. Remove `INTAKE_UPLOAD_WRITE_MODE` from the deployment and redeploy to issue new upload URLs in `intake-app-store-assets`.
5. Test direct upload, removal, submission, and retry with a draft created before the switch. Keep the earlier bucket available for signed uploads already in flight, earlier draft keys, and previously issued download links.

The 26 November 2026 dry run against `renatus_schema` returned `DbPushMissingLocalError`. Run the production preflight from a migration workspace that includes the project’s existing migration history.

## Copy and reconcile

```sh
node scripts/migrate-intake-storage.mjs copy
node scripts/migrate-intake-storage.mjs inventory
node scripts/migrate-intake-storage.mjs orphans
```

`copy` reads committed submissions in batches. It verifies the source and destination bytes, size, and MIME type before updating the saved reference. It stores the new key only if the row still has the asset references it verified. Capture stderr to track failed submission IDs, investigate mismatches, and rerun the job. Verified copies left behind by an interruption are reused. Run `copy` again after in-flight uploads settle and as drafts with earlier assets are submitted. Check the final inventory for missing references and confirm a past signed link still opens within its original lifetime.

Active drafts retain their earlier uploads until submission, removal, or normal expiry. `orphans` reports candidates by bucket and key after the existing 48-hour window, using the latest object or upload request for the session across both formats. Point any external cleanup job at the report or the `intake_list_orphan_assets` RPC and pass the configured earlier bucket. Refresh candidates immediately before deleting, and delete through the Storage API. The old discovery RPC remains available for a legacy job during the switch.

## Retire earlier copies and recover

Keep the compatible release available. If the cutover fails, stop the copy or retire job and redeploy that release with `INTAKE_UPLOAD_WRITE_MODE=legacy`. Both formats remain readable and submission retries still resolve through the same database. Restore prefixed writes when ready and rerun the copy and inventory. Preserve both buckets and the shared database throughout recovery.

Retire committed copies only after verifying the corresponding prefixed objects, confirming no pre-switch uploads can still arrive, and waiting seven days from the last time the affected legacy objects could have received a signed download link. Use that confirmed time in ISO 8601 format.

```sh
node scripts/migrate-intake-storage.mjs retire --legacy-links-closed-at '<ISO timestamp>'
node scripts/migrate-intake-storage.mjs inventory
```

`retire` requires prefixed writes and verifies both copies again before removing the earlier object from Storage. It skips submissions created after the supplied cutoff. Reconcile and use a later cutoff to retire copies from subsequent submissions. Keep the earlier bucket provisioned for draft recovery and rollback writes.

## Create a migration

From `website_host`, run `supabase migration new <name>` to generate a UTC timestamped SQL file. Add the SQL to that file and commit it with the related change. Keep existing filenames stable after a migration has run in a deployed environment.
