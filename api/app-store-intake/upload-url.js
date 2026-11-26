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
import { intakeObjectFolder } from '../../src/data/appStoreIntake.js';
import { INTAKE_NAMES, intakeStorageNames, listIntakeAssets } from './_storage.js';

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

  const names = intakeStorageNames(env);
  const { sessionId, objectName, sizeBytes } = parsed.data;
  const { data: active, error: touchError } = await supabase.rpc(INTAKE_NAMES.touchUpload, { p_session_id: sessionId });
  if (touchError) {
    console.error('[intake] upload-url session check error:', touchError.message);
    res.status(502).json({ error: 'Could not verify submission status.' });
    return;
  }
  if (!active) {
    res.status(409).json({ error: 'Cannot upload files after submission has been finalized.' });
    return;
  }

  let files;
  try {
    files = [...(await listIntakeAssets(supabase, names, sessionId)).values()];
  } catch (error) {
    console.error('[intake] storage list error:', error.message);
    res.status(502).json({ error: 'Could not verify existing uploads.' });
    return;
  }
  if (files.length >= MAX_FILES) {
    res.status(400).json({ error: `Maximum of ${MAX_FILES} files per submission reached.` });
    return;
  }

  const existingBytes = files.reduce((sum, f) => sum + Number(f.metadata?.size || 0), 0);
  if (existingBytes + sizeBytes > MAX_TOTAL_SIZE_BYTES) {
    res.status(400).json({ error: 'Total upload limit of 100 MB per submission exceeded.' });
    return;
  }

  const bucket = names.writeLegacy ? names.legacyBucket : names.bucket;
  const path = `${intakeObjectFolder(sessionId, names.writeLegacy)}/${objectName}`;
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
