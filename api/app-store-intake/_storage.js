import { intakeObjectFolder, resolveIntakeObjectPath } from '../../src/data/appStoreIntake.js';

export const INTAKE_NAMES = Object.freeze({
  submissions: 'intake_app_store_submissions',
  removals: 'intake_asset_removals',
  rateLimit: 'intake_check_and_increment_rate_limit',
  touchUpload: 'intake_touch_upload_session',
  markRemoved: 'intake_mark_asset_removed',
  orphans: 'intake_list_orphan_assets',
  saveStaffDraft: 'intake_save_staff_draft',
  bucket: 'intake-app-store-assets',
  oldBucket: 'app-store-intake-assets',
});

export function intakeStorageNames(env = process.env) {
  const prior = env.SUPABASE_INTAKE_BUCKET?.trim();
  return {
    bucket: INTAKE_NAMES.bucket,
    legacyBucket: env.SUPABASE_INTAKE_LEGACY_BUCKET?.trim() ||
      (prior && prior !== INTAKE_NAMES.bucket ? prior : INTAKE_NAMES.oldBucket),
    writeLegacy: env.INTAKE_UPLOAD_WRITE_MODE === 'legacy',
  };
}

export function intakeObjectLocations(names, key) {
  return [
    { bucket: names.bucket, path: key.targetPath },
    { bucket: names.legacyBucket, path: key.legacyPath },
  ];
}

export async function listIntakeStorageFolder(supabase, bucket, folder) {
  const entries = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit, offset, sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;
    entries.push(...data);
    if (data.length < limit) return entries;
  }
}

export async function listIntakeAssets(supabase, names, sessionId) {
  const [target, legacy, removals] = await Promise.all([
    listIntakeStorageFolder(supabase, names.bucket, intakeObjectFolder(sessionId)),
    listIntakeStorageFolder(supabase, names.legacyBucket, intakeObjectFolder(sessionId, true)),
    supabase.from(INTAKE_NAMES.removals).select('object_name').eq('session_id', sessionId),
  ]);
  if (removals.error) throw removals.error;
  const removed = new Set(removals.data.map(row => row.object_name));
  const assets = new Map();
  // Prefer the prefixed location when an older path has already been copied.
  for (const [isLegacy, bucket, items] of [[false, names.bucket, target], [true, names.legacyBucket, legacy]]) {
    const folder = intakeObjectFolder(sessionId, isLegacy);
    for (const item of items) {
      const path = `${folder}/${item.name}`;
      if (!item.metadata || removed.has(item.name) || assets.has(item.name) ||
          !resolveIntakeObjectPath(sessionId, path)) continue;
      assets.set(item.name, { ...item, path, bucket });
    }
  }
  return assets;
}
