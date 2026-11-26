import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { ALLOWED_MIME_TYPES, SIGNED_DOWNLOAD_TTL_SECONDS, createSupabaseAdmin } from '../api/app-store-intake/_lib.js';
import { INTAKE_NAMES, intakeStorageNames, listIntakeStorageFolder } from '../api/app-store-intake/_storage.js';
import { MAX_FILE_SIZE_BYTES, UUID_V4_RE, intakeObjectFolder, resolveIntakeObjectPath } from '../src/data/appStoreIntake.js';

async function unwrap(request) {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

async function exists(storage, path) {
  // The SDK returns an error alongside false for a missing object and throws on unrelated errors.
  const result = await storage.exists(path);
  return result.data;
}

async function contents(storage, path) {
  const blob = await unwrap(storage.download(path));
  return {
    size: blob.size,
    type: blob.type.toLowerCase(),
    hash: createHash('sha256').update(Buffer.from(await blob.arrayBuffer())).digest('hex'),
  };
}

async function verifyCopy(source, destination, key, asset) {
  const [before, after] = await Promise.all([
    contents(source, key.legacyPath), contents(destination, key.targetPath),
  ]);
  if (before.hash !== after.hash || before.size !== after.size || before.type !== after.type ||
      before.size !== asset.size || before.type !== asset.mimeType) {
    throw new Error('The source, destination and recorded asset metadata do not match.');
  }
}

export async function copyIntakeSubmission(supabase, names, row) {
  const source = supabase.storage.from(names.legacyBucket);
  const destination = supabase.storage.from(names.bucket);
  const assets = [];
  let changed = false;
  for (const asset of row.assets) {
    const key = resolveIntakeObjectPath(row.session_id, asset.path);
    if (!key) throw new Error('The submission has an invalid asset path.');
    if (key.legacy) {
      if (!resolveIntakeObjectPath(row.session_id, key.targetPath)) {
        throw new Error('The legacy object name cannot be retained under the target prefix.');
      }
      if (!(await exists(destination, key.targetPath))) {
        const { error } = await source.copy(key.legacyPath, key.targetPath, { destinationBucket: names.bucket });
        // A retry can race another copy job. Verify the existing destination before accepting it.
        if (error && !(await exists(destination, key.targetPath))) throw error;
      }
      await verifyCopy(source, destination, key, asset);
      changed = true;
    }
    assets.push({ ...asset, path: key.targetPath });
  }
  if (!changed) return false;

  const updated = await unwrap(supabase.from(INTAKE_NAMES.submissions).update({ assets })
    .eq('id', row.id).eq('assets', JSON.stringify(row.assets)).select('id').maybeSingle());
  if (!updated) throw new Error('Asset references changed during the copy. Retry the submission.');
  return true;
}

async function* submissions(supabase) {
  let after;
  for (;;) {
    let query = supabase.from(INTAKE_NAMES.submissions)
      .select('id, session_id, created_at, assets').order('id').limit(100);
    if (after) query = query.gt('id', after);
    const rows = await unwrap(query);
    yield* rows;
    if (rows.length < 100) return;
    after = rows.at(-1).id;
  }
}

async function provision(supabase, bucket) {
  const buckets = await unwrap(supabase.storage.listBuckets());
  const options = {
    public: false, fileSizeLimit: MAX_FILE_SIZE_BYTES, allowedMimeTypes: [...ALLOWED_MIME_TYPES],
  };
  if (buckets.some(entry => entry.id === bucket)) await unwrap(supabase.storage.updateBucket(bucket, options));
  else await unwrap(supabase.storage.createBucket(bucket, options));
  return { bucket, ...options };
}

async function inventory(supabase, names) {
  const committed = new Set();
  const referenced = new Set();
  for await (const row of submissions(supabase)) {
    committed.add(row.session_id);
    for (const asset of row.assets) referenced.add(asset.path);
  }

  const listed = new Set();
  const report = { submissions: committed.size, legacyObjects: 0, prefixedObjects: 0, draftSessionsWithAssets: 0 };
  const drafts = new Set();
  for (const [bucket, legacy] of [[names.legacyBucket, true], [names.bucket, false]]) {
    const folders = await listIntakeStorageFolder(supabase, bucket, legacy ? '' : 'intake');
    for (const { name: sessionId } of folders) {
      if (!UUID_V4_RE.test(sessionId)) continue;
      const folder = intakeObjectFolder(sessionId, legacy);
      const files = await listIntakeStorageFolder(supabase, bucket, folder);
      for (const file of files) {
        const path = `${folder}/${file.name}`;
        if (!file.metadata || !resolveIntakeObjectPath(sessionId, path)) continue;
        listed.add(path);
        report[legacy ? 'legacyObjects' : 'prefixedObjects']++;
        if (!committed.has(sessionId)) drafts.add(sessionId);
      }
    }
  }
  report.draftSessionsWithAssets = drafts.size;
  report.missingAssetReferences = [...referenced].filter(path => !listed.has(path));
  return report;
}

async function retireIntakeSubmission(supabase, names, row, cutoff) {
  if (Date.parse(row.created_at) > cutoff || row.assets.length === 0) return false;
  const source = supabase.storage.from(names.legacyBucket);
  const destination = supabase.storage.from(names.bucket);
  const paths = [];
  for (const asset of row.assets) {
    const key = resolveIntakeObjectPath(row.session_id, asset.path);
    if (!key || key.legacy) return false;
    if (await exists(source, key.legacyPath)) {
      await verifyCopy(source, destination, key, asset);
      paths.push(key.legacyPath);
    }
  }
  if (!paths.length) return false;
  await unwrap(source.remove(paths));
  return true;
}

async function run() {
  const [action, flag, timestamp] = process.argv.slice(2);
  if (!['provision', 'inventory', 'copy', 'orphans', 'retire'].includes(action)) {
    throw new Error('Use provision, inventory, copy, orphans, or retire --legacy-links-closed-at <ISO timestamp>.');
  }
  const names = intakeStorageNames();
  const supabase = createSupabaseAdmin();
  if (!supabase) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for the intended environment.');

  if (action === 'provision') return provision(supabase, names.bucket);
  if (action === 'inventory') return inventory(supabase, names);
  if (action === 'orphans') {
    return unwrap(supabase.rpc(INTAKE_NAMES.orphans, { p_legacy_bucket: names.legacyBucket }));
  }

  const cutoff = Date.parse(timestamp);
  if (action === 'retire') {
    const isIsoTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp);
    if (names.writeLegacy || flag !== '--legacy-links-closed-at' || !isIsoTimestamp || !Number.isFinite(cutoff) ||
        Date.now() - cutoff < SIGNED_DOWNLOAD_TTL_SECONDS * 1000) {
      throw new Error('Retirement requires prefixed writes and a confirmed legacy-link cutoff at least seven days ago.');
    }
    for await (const row of submissions(supabase)) {
      if (row.assets.some(asset => resolveIntakeObjectPath(row.session_id, asset.path)?.legacy !== false)) {
        throw new Error('Complete and reconcile the copy before retiring any earlier objects.');
      }
    }
  }

  const report = { processed: 0, changed: 0, failed: 0 };
  for await (const row of submissions(supabase)) {
    report.processed++;
    try {
      const changed = action === 'copy'
        ? await copyIntakeSubmission(supabase, names, row)
        : await retireIntakeSubmission(supabase, names, row, cutoff);
      if (changed) report.changed++;
    } catch (error) {
      report.failed++;
      console.error(JSON.stringify({ action, submission: row.id, error: error.message }));
    }
  }
  if (report.failed) process.exitCode = 1;
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(await run(), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
