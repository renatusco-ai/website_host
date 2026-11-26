import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_TOTAL_SIZE_BYTES,
  SIGNED_DOWNLOAD_TTL_SECONDS,
  checkJsonBodySize,
  checkRateLimit,
  computeBrandFollowUps,
  computeReadinessGaps,
  createSupabaseAdmin,
  extractClientIp,
  getExtension,
  hashKey,
  sendIntakeEmails,
  validateIntakePayload,
  verifyTurnstileIfEnabled,
} from './_lib.js';
import { LEGACY_INTAKE_VERSION, resolveIntakeObjectPath } from '../../src/data/appStoreIntake.js';
import { INTAKE_NAMES, intakeStorageNames, listIntakeAssets } from './_storage.js';

function duplicateResponse(record, legacyRequest) {
  const response = { ok: true, id: record.id, duplicate: true };
  if (legacyRequest && record.submission_version === LEGACY_INTAKE_VERSION) {
    response.gaps = record.gaps || [];
  }
  return response;
}

export async function handleSubmitIntake(req, res, env = process.env) {
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

  const parsed = validateIntakePayload(req.body ?? {});
  if (parsed.error) {
    const response = { error: parsed.error };
    if (parsed.fieldErrors) response.fieldErrors = parsed.fieldErrors;
    res.status(parsed.status).json(response);
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
    res.status(503).json({ error: 'Intake storage is not configured yet.' });
    return;
  }

  // Run IP rate limiting BEFORE any DB reads
  const ipHash = hashKey(clientIp, env);
  const ipAllowed = await checkRateLimit(supabase, ipHash, 'submit_intake', 60 * 60, 5);
  if (!ipAllowed) {
    res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    return;
  }

  const { sessionId, submissionVersion, answers, claimedAssets, sendClientCopy } = parsed.data;
  const legacyRequest = submissionVersion === LEGACY_INTAKE_VERSION;

  // Idempotency check: return existing submission without re-sending emails
  const { data: existing, error: existingErr } = await supabase
    .from(INTAKE_NAMES.submissions)
    .select('id, submission_version, gaps')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (existingErr) {
    console.error('[intake] idempotency lookup error:', existingErr.message);
    res.status(502).json({ error: 'Could not verify submission.' });
    return;
  }
  if (existing) {
    res.status(200).json(duplicateResponse(existing, legacyRequest));
    return;
  }

  // Per-email receipt rate limit (3 / hour) to prevent email relay abuse
  let clientReceiptAllowed = true;
  if (sendClientCopy) {
    const emailHash = hashKey(`receipt:${answers.contactEmail}`, env);
    clientReceiptAllowed = await checkRateLimit(supabase, emailHash, 'client_receipt', 60 * 60, 3);
  }

  // Server-side verification of uploaded assets + cumulative 100 MB cap in Supabase Storage
  const verifiedAssets = [];
  if (claimedAssets.length > 0) {
    let byName;
    try {
      byName = await listIntakeAssets(supabase, intakeStorageNames(env), sessionId);
    } catch (error) {
      console.error('[intake] storage verify error:', error.message);
      res.status(502).json({ error: 'Could not verify uploaded files.' });
      return;
    }

    let totalBytes = 0;

    for (const claimed of claimedAssets) {
      const { name } = resolveIntakeObjectPath(sessionId, claimed.path);
      const obj = byName.get(name);
      if (!obj) {
        res
          .status(400)
          .json({ error: `Uploaded file "${claimed.name || claimed.path}" was not found.` });
        return;
      }
      const size = Number(obj.metadata?.size || 0);
      const mimeType = String(obj.metadata?.mimetype || 'application/octet-stream').toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(getExtension(obj.name)) || !ALLOWED_MIME_TYPES.has(mimeType)) {
        res.status(400).json({ error: 'An uploaded file has an unsupported type.' });
        return;
      }
      if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE_BYTES) {
        res.status(400).json({ error: 'Uploaded files must be between 1 byte and 25 MB.' });
        return;
      }
      totalBytes += size;
      if (totalBytes > MAX_TOTAL_SIZE_BYTES) {
        res.status(400).json({ error: 'Total uploaded files exceed the 100 MB submission limit.' });
        return;
      }
      verifiedAssets.push({
        path: obj.path,
        bucket: obj.bucket,
        name: String(claimed.name || obj.name).slice(0, 120),
        size,
        mimeType,
      });
    }
  }

  const gaps = legacyRequest
    ? computeReadinessGaps(answers, verifiedAssets)
    : computeBrandFollowUps(answers, verifiedAssets);

  const { data: inserted, error: insertErr } = await supabase
    .from(INTAKE_NAMES.submissions)
    .insert({
      session_id: sessionId,
      submission_version: submissionVersion,
      brand_name: answers.brandName,
      legal_name: answers.legalName,
      contact_name: answers.contactName,
      contact_email: answers.contactEmail,
      contact_phone: answers.contactPhone,
      website_url: answers.websiteUrl,
      app_name: answers.appName,
      publishing_account: answers.publishingAccount ?? null,
      answers,
      assets: verifiedAssets.map(({ bucket, ...asset }) => asset),
      gaps,
      client_ip_hash: ipHash,
    })
    .select('id, created_at')
    .single();

  // Race-safe idempotency: catch concurrent unique violation (23505)
  if (insertErr?.code === '23505') {
    const { data: raced } = await supabase
      .from(INTAKE_NAMES.submissions)
      .select('id, submission_version, gaps')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (raced) {
      res.status(200).json(duplicateResponse(raced, legacyRequest));
      return;
    }
  }

  if (insertErr?.code === '23514' && insertErr.message === 'An intake asset was removed.') {
    res.status(409).json({ error: 'An uploaded file was removed. Review the files in your draft and try again.' });
    return;
  }

  if (insertErr || !inserted) {
    console.error('[intake] DB insert error:', insertErr?.message);
    res.status(502).json({ error: 'Could not save your intake submission.' });
    return;
  }

  // Post-insert failures (signed URLs or Resend) must NOT lose client confirmation
  let emailDelivered = false;
  try {
    const signedAssets = [];
    for (const asset of verifiedAssets) {
      const { data: signed } = await supabase.storage
        .from(asset.bucket)
        .createSignedUrl(asset.path, SIGNED_DOWNLOAD_TTL_SECONDS, { download: true });
      if (signed?.signedUrl) {
        signedAssets.push({ ...asset, signedUrl: signed.signedUrl });
      }
    }

    const emailResult = await sendIntakeEmails(
      {
        id: inserted.id,
        createdAt: inserted.created_at,
        submissionVersion,
        answers,
        gaps,
        sendClientCopy,
        clientReceiptAllowed,
      },
      signedAssets,
      env,
    );
    emailDelivered = Boolean(emailResult?.emailDelivered);
  } catch (err) {
    console.error('[intake] post-insert notification error:', err?.message);
    emailDelivered = false;
  }

  const response = { ok: true, id: inserted.id, emailDelivered };
  if (legacyRequest) response.gaps = gaps;
  res.status(200).json(response);
}

export default async function handler(req, res) {
  return handleSubmitIntake(req, res, process.env);
}
