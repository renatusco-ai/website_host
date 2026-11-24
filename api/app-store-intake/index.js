import {
  MAX_TOTAL_SIZE_BYTES,
  SIGNED_DOWNLOAD_TTL_SECONDS,
  checkJsonBodySize,
  checkRateLimit,
  computeReadinessGaps,
  createSupabaseAdmin,
  extractClientIp,
  hashKey,
  sendIntakeEmails,
  validateIntakePayload,
  verifyTurnstileIfEnabled,
} from './_lib.js';

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

  const { sessionId, answers, claimedAssets, sendClientCopy } = parsed.data;

  // Idempotency check: return existing submission without re-sending emails
  const { data: existing, error: existingErr } = await supabase
    .from('app_store_intakes')
    .select('id, gaps')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (existingErr) {
    console.error('[intake] idempotency lookup error:', existingErr.message);
    res.status(502).json({ error: 'Could not verify submission.' });
    return;
  }
  if (existing) {
    res.status(200).json({ ok: true, id: existing.id, gaps: existing.gaps || [], duplicate: true });
    return;
  }

  // Per-email receipt rate limit (3 / hour) to prevent email relay abuse
  let clientReceiptAllowed = true;
  if (sendClientCopy) {
    const emailHash = hashKey(`receipt:${answers.contactEmail}`, env);
    clientReceiptAllowed = await checkRateLimit(supabase, emailHash, 'client_receipt', 60 * 60, 3);
  }

  // Server-side verification of uploaded assets + cumulative 100 MB cap in Supabase Storage
  const bucket = env.SUPABASE_INTAKE_BUCKET || 'app-store-intake-assets';
  const verifiedAssets = [];
  if (claimedAssets.length > 0) {
    const { data: listed, error: listErr } = await supabase.storage.from(bucket).list(sessionId, {
      limit: 100,
    });
    if (listErr) {
      console.error('[intake] storage verify error:', listErr.message);
      res.status(502).json({ error: 'Could not verify uploaded files.' });
      return;
    }

    const byPath = new Map((listed || []).map((item) => [`${sessionId}/${item.name}`, item]));
    let totalBytes = 0;

    for (const claimed of claimedAssets) {
      const obj = byPath.get(claimed.path);
      if (!obj) {
        res
          .status(400)
          .json({ error: `Uploaded file "${claimed.name || claimed.path}" was not found.` });
        return;
      }
      const size = Number(obj.metadata?.size || 0);
      totalBytes += size;
      if (totalBytes > MAX_TOTAL_SIZE_BYTES) {
        res.status(400).json({ error: 'Total uploaded files exceed the 100 MB submission limit.' });
        return;
      }
      verifiedAssets.push({
        path: claimed.path,
        name: String(claimed.name || obj.name).slice(0, 120),
        size,
        mimeType: String(obj.metadata?.mimetype || 'application/octet-stream'),
      });
    }
  }

  const gaps = computeReadinessGaps(answers, verifiedAssets);

  const { data: inserted, error: insertErr } = await supabase
    .from('app_store_intakes')
    .insert({
      session_id: sessionId,
      brand_name: answers.brandName,
      legal_name: answers.legalName,
      contact_name: answers.contactName,
      contact_email: answers.contactEmail,
      contact_phone: answers.contactPhone,
      website_url: answers.websiteUrl,
      app_name: answers.appName,
      publishing_account: answers.publishingAccount,
      answers,
      assets: verifiedAssets,
      gaps,
      client_ip_hash: ipHash,
    })
    .select('id, created_at')
    .single();

  // Race-safe idempotency: catch concurrent unique violation (23505)
  if (insertErr?.code === '23505') {
    const { data: raced } = await supabase
      .from('app_store_intakes')
      .select('id, gaps')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (raced) {
      res.status(200).json({ ok: true, id: raced.id, gaps: raced.gaps || [], duplicate: true });
      return;
    }
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
        .from(bucket)
        .createSignedUrl(asset.path, SIGNED_DOWNLOAD_TTL_SECONDS, { download: true });
      if (signed?.signedUrl) {
        signedAssets.push({ ...asset, signedUrl: signed.signedUrl });
      }
    }

    const emailResult = await sendIntakeEmails(
      {
        id: inserted.id,
        createdAt: inserted.created_at,
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

  res.status(200).json({
    ok: true,
    id: inserted.id,
    gaps,
    emailDelivered,
  });
}

export default async function handler(req, res) {
  return handleSubmitIntake(req, res, process.env);
}
