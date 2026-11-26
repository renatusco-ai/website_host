import {
  MAX_STAFF_DRAFT_BODY_BYTES,
  UUID_RE,
  checkJsonBodySize,
  checkRateLimit,
  createSupabaseAdmin,
  hashKey,
} from '../_lib.js';
import { INTAKE_NAMES } from '../_storage.js';
import { authenticateStaffRequest, isAuthorizedForIntake } from '../_staffAuth.js';
import { validateStaffDraft } from '../_staffSchema.js';

const STAFF_SELECT_COLUMNS = [
  'id',
  'created_at',
  'status',
  'submission_version',
  'legal_name',
  'brand_name',
  'contact_name',
  'contact_email',
  'contact_phone',
  'website_url',
  'app_name',
  'publishing_account',
  'answers',
  'assets',
  'gaps',
  'staff_draft',
  'staff_revision',
  'staff_saved_at',
  'staff_saved_by',
].join(', ');

function setNoStore(res) {
  res.setHeader?.('Cache-Control', 'no-store');
}

function getQueryParam(req, name) {
  if (req?.query && typeof req.query[name] === 'string') {
    return req.query[name].trim();
  }
  if (typeof req?.url === 'string') {
    try {
      const url = new URL(req.url, 'http://localhost');
      return (url.searchParams.get(name) || '').trim();
    } catch {
      return '';
    }
  }
  return '';
}

function formatIntakeRecord(row) {
  const assets = Array.isArray(row.assets)
    ? row.assets.map((asset) => ({
        path: asset?.path || '',
        name: asset?.name || '',
        size: Number(asset?.size || 0),
        mimeType: asset?.mimeType || '',
      }))
    : [];
  const gaps = Array.isArray(row.gaps) ? row.gaps : [];

  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    submissionVersion: row.submission_version,
    handoff: {
      legalName: row.legal_name,
      brandName: row.brand_name,
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      websiteUrl: row.website_url ?? null,
      appName: row.app_name,
      publishingAccount: row.publishing_account ?? null,
      answers: row.answers && typeof row.answers === 'object' ? row.answers : {},
      assets,
      gaps,
    },
    staffDraft: row.staff_draft ?? null,
    staffRevision: Number(row.staff_revision ?? 0),
    staffSavedAt: row.staff_saved_at ?? null,
    staffSavedBy: row.staff_saved_by ?? null,
  };
}

export async function handleStaffIntake(req, res, env = process.env) {
  setNoStore(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabase = createSupabaseAdmin(env);
  if (!supabase) {
    res.status(503).json({ error: 'Intake storage is not configured yet.' });
    return;
  }

  if (req.method === 'GET') {
    const auth = await authenticateStaffRequest(req, supabase, env);
    if (!auth.ok) {
      res.status(auth.status).json({ error: auth.error });
      return;
    }

    const reference = getQueryParam(req, 'reference') || getQueryParam(req, 'id');
    if (!UUID_RE.test(reference)) {
      res.status(400).json({ error: 'Enter a valid Step 1 intake reference (UUID).' });
      return;
    }

    if (!isAuthorizedForIntake(auth.user, reference, env)) {
      res.status(403).json({ error: 'Your account is not authorized to access this intake.' });
      return;
    }

    const userHash = hashKey(`staff-read:${auth.user.id}`, env);
    const allowed = await checkRateLimit(supabase, userHash, 'staff_intake_read', 15 * 60, 240);
    if (!allowed) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
      return;
    }

    const { data: row, error } = await supabase
      .from(INTAKE_NAMES.submissions)
      .select(STAFF_SELECT_COLUMNS)
      .eq('id', reference)
      .maybeSingle();

    if (error) {
      console.error('[intake-staff] lookup error:', error.message);
      res.status(502).json({ error: 'Could not load the intake submission.' });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'No intake submission was found for that reference.' });
      return;
    }

    if (!isAuthorizedForIntake(auth.user, row.id, env)) {
      res.status(403).json({ error: 'Your account is not authorized to access this intake.' });
      return;
    }

    res.status(200).json({ ok: true, intake: formatIntakeRecord(row) });
    return;
  }

  // PUT — atomic revision-checked save of staff_draft
  const sizeErr = checkJsonBodySize(req, MAX_STAFF_DRAFT_BODY_BYTES);
  if (sizeErr) {
    res.status(sizeErr.status).json({ error: sizeErr.error });
    return;
  }

  const auth = await authenticateStaffRequest(req, supabase, env);
  if (!auth.ok) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const reference = typeof body.reference === 'string' ? body.reference.trim() : '';
  if (!UUID_RE.test(reference)) {
    res.status(400).json({ error: 'Enter a valid Step 1 intake reference (UUID).' });
    return;
  }

  if (!isAuthorizedForIntake(auth.user, reference, env)) {
    res.status(403).json({ error: 'Your account is not authorized to save this intake.' });
    return;
  }

  const expectedRevision = body.expectedRevision;
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    res.status(400).json({ error: 'A valid expectedRevision integer is required to save.' });
    return;
  }

  const validated = validateStaffDraft(body.staffDraft);
  if (validated.error) {
    res.status(validated.status).json({ error: validated.error });
    return;
  }

  const userHash = hashKey(`staff-write:${auth.user.id}`, env);
  const allowed = await checkRateLimit(supabase, userHash, 'staff_intake_write', 15 * 60, 120);
  if (!allowed) {
    res.status(429).json({ error: 'Too many save requests. Please wait a moment and try again.' });
    return;
  }

  const { data: rpcResult, error: rpcError } = await supabase.rpc(INTAKE_NAMES.saveStaffDraft, {
    p_id: reference,
    p_expected_revision: expectedRevision,
    p_staff_draft: validated.data,
    p_staff_saved_by: auth.user.id,
  });

  if (rpcError) {
    console.error('[intake-staff] save RPC error:', rpcError.message);
    res.status(502).json({ error: 'Could not save your staff draft. Your changes are still in the editor.' });
    return;
  }

  const row = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
  if (!row || row.outcome === 'not_found') {
    res.status(404).json({ error: 'No intake submission was found for that reference.' });
    return;
  }

  if (row.outcome === 'conflict') {
    res.status(409).json({
      error:
        'Another staff member saved a newer revision while you were editing. Review your changes or reload the latest revision before saving again.',
      code: 'REVISION_CONFLICT',
      id: row.id,
      currentRevision: Number(row.staff_revision ?? 0),
      staffSavedAt: row.staff_saved_at ?? null,
      staffSavedBy: row.staff_saved_by ?? null,
      staffDraft: row.staff_draft ?? null,
    });
    return;
  }

  res.status(200).json({
    ok: true,
    id: row.id,
    staffDraft: row.staff_draft,
    staffRevision: Number(row.staff_revision),
    staffSavedAt: row.staff_saved_at,
    staffSavedBy: row.staff_saved_by,
  });
}

export default async function handler(req, res) {
  return handleStaffIntake(req, res, process.env);
}
