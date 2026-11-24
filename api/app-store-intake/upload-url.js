import {
  MAX_FILES,
  MAX_TOTAL_SIZE_BYTES,
  checkJsonBodySize,
  checkRateLimit,
  createSupabaseAdmin,
  extractClientIp,
  hashKey,
  validateUploadUrlRequest,
  verifyTurnstileIfEnabled,
} from './_lib.js';

export async function handleUploadUrl(req, res, env = process.env) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sizeErr = checkJsonBodySize(req);
  if (sizeErr) {
    res.status(sizeErr.status).json({ error: sizeErr.error });
    return;
  }

  const parsed = validateUploadUrlRequest(req.body ?? {});
  if (parsed.error) {
    res.status(parsed.status).json({ error: parsed.error });
    return;
  }

  const clientIp = extractClientIp(req);
  const turnstile = await verifyTurnstileIfEnabled(req.body?.turnstileToken, clientIp, env);
  if (!turnstile.ok) {
    res.status(turnstile.status).json({ error: turnstile.error });
    return;
  }

  const supabase = createSupabaseAdmin(env);
  if (!supabase) {
    res.status(503).json({ error: 'Storage service is not configured yet.' });
    return;
  }

  const ipHash = hashKey(clientIp, env);
  const allowed = await checkRateLimit(supabase, ipHash, 'upload_url', 15 * 60, 20);
  if (!allowed) {
    res.status(429).json({ error: 'Too many upload requests. Please try again in a few minutes.' });
    return;
  }

  const bucket = env.SUPABASE_INTAKE_BUCKET || 'app-store-intake-assets';
  const { sessionId, path, sizeBytes } = parsed.data;

  // Reject new uploads once this session has already been submitted
  const { data: committed, error: checkErr } = await supabase
    .from('app_store_intakes')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (checkErr) {
    console.error('[intake] upload-url session check error:', checkErr.message);
    res.status(502).json({ error: 'Could not verify submission status.' });
    return;
  }
  if (committed) {
    res.status(409).json({ error: 'Cannot upload files after submission has been finalized.' });
    return;
  }

  // Enforce 10-file and 100 MB cumulative session caps via Storage list()
  const { data: existing, error: listErr } = await supabase.storage.from(bucket).list(sessionId, {
    limit: 100,
  });
  if (listErr) {
    console.error('[intake] storage list error:', listErr.message);
    res.status(502).json({ error: 'Could not verify existing uploads.' });
    return;
  }

  const files = (existing || []).filter((item) => item && item.name && !item.name.endsWith('/'));
  if (files.length >= MAX_FILES) {
    res.status(400).json({ error: `Maximum of ${MAX_FILES} files per submission reached.` });
    return;
  }

  const existingBytes = files.reduce((sum, f) => sum + Number(f.metadata?.size || 0), 0);
  if (existingBytes + sizeBytes > MAX_TOTAL_SIZE_BYTES) {
    res.status(400).json({ error: 'Total upload limit of 100 MB per submission exceeded.' });
    return;
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (signErr || !signed) {
    console.error('[intake] signed upload URL error:', signErr?.message);
    res.status(502).json({ error: 'Could not generate upload URL.' });
    return;
  }

  res.status(200).json({
    signedUrl: signed.signedUrl,
    token: signed.token,
    path: signed.path || path,
  });
}

export default async function handler(req, res) {
  return handleUploadUrl(req, res, process.env);
}
