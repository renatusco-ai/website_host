import {
  UUID_V4_RE,
  checkJsonBodySize,
  checkRateLimit,
  createSupabaseAdmin,
  extractClientIp,
  hashKey,
  isValidSingleSegmentPath,
} from './_lib.js';

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

  if (!UUID_V4_RE.test(sessionId) || !isValidSingleSegmentPath(sessionId, objectPath)) {
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

  // Reject deletes if this session has already been submitted
  const { data: committed, error: checkErr } = await supabase
    .from('app_store_intakes')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (checkErr) {
    console.error('[intake] delete session check error:', checkErr.message);
    res.status(502).json({ error: 'Could not verify submission status.' });
    return;
  }
  if (committed) {
    res.status(409).json({ error: 'Cannot delete assets after submission has been finalized.' });
    return;
  }

  const bucket = env.SUPABASE_INTAKE_BUCKET || 'app-store-intake-assets';
  const { error: removeErr } = await supabase.storage.from(bucket).remove([objectPath]);
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
