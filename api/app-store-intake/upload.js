import {
  checkJsonBodySize,
  checkRateLimit,
  createSupabaseAdmin,
  extractClientIp,
  hashKey,
} from './_lib.js';
import { resolveIntakeObjectPath } from '../../src/data/appStoreIntake.js';
import { INTAKE_NAMES, intakeObjectLocations, intakeStorageNames } from './_storage.js';

export async function handleDeleteUpload(req, res, env = process.env) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sizeErr = checkJsonBodySize(req);
  if (sizeErr) {
    res.status(sizeErr.status).json({ error: sizeErr.error });
    return;
  }

  const body = req.body ?? {};
  const sessionId = String(body.sessionId || '').trim();
  const objectPath = String(body.path || '').trim();

  const key = resolveIntakeObjectPath(sessionId, objectPath);
  if (!key) {
    res.status(400).json({ error: 'Invalid session ID or asset path.' });
    return;
  }

  const supabase = createSupabaseAdmin(env);
  if (!supabase) {
    res.status(503).json({ error: 'Storage service is not configured yet.' });
    return;
  }

  const ipHash = hashKey(extractClientIp(req), env);
  const allowed = await checkRateLimit(supabase, ipHash, 'delete_upload', 15 * 60, 30);
  if (!allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    return;
  }

  // Record deletion intent before touching Storage so a failed delete can be retried
  // and a late upload or surviving alias cannot be submitted.
  const { data: active, error: checkErr } = await supabase.rpc(INTAKE_NAMES.markRemoved, {
    p_session_id: sessionId,
    p_object_name: key.name,
  });
  if (checkErr) {
    console.error('[intake] delete session check error:', checkErr.message);
    res.status(502).json({ error: 'Could not verify submission status.' });
    return;
  }
  if (!active) {
    res.status(409).json({ error: 'Cannot delete assets after submission has been finalized.' });
    return;
  }

  const results = await Promise.all(intakeObjectLocations(intakeStorageNames(env), key)
    .map(({ bucket, path }) => supabase.storage.from(bucket).remove([path])));
  const removeErr = results.find(result => result.error)?.error;
  if (removeErr) {
    console.error('[intake] storage remove error:', removeErr.message);
    res.status(502).json({ error: 'Could not remove file.' });
    return;
  }

  res.status(200).json({ ok: true });
}

export default async function handler(req, res) {
  return handleDeleteUpload(req, res, process.env);
}
