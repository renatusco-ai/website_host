import {
  EMAIL_RE,
  checkJsonBodySize,
  checkRateLimit,
  createSupabaseAdmin,
  extractClientIp,
  hashKey,
} from '../_lib.js';
import {
  authenticateStaffRequest,
  buildClearStaffSessionCookie,
  buildStaffSessionCookie,
  createSupabaseAuthClient,
  isRenatusStaff,
} from '../_staffAuth.js';

function setNoStore(res) {
  res.setHeader?.('Cache-Control', 'no-store');
}

export async function handleStaffSession(req, res, env = process.env) {
  setNoStore(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'DELETE') {
    res.setHeader?.('Set-Cookie', buildClearStaffSessionCookie(req));
    res.status(200).json({ ok: true });
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
      res.status(auth.status).json({ authenticated: false, error: auth.error });
      return;
    }
    res.status(200).json({
      authenticated: true,
      user: { id: auth.user.id, email: auth.user.email || '' },
    });
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

  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!EMAIL_RE.test(email) || !password || password.length > 512) {
    res.status(400).json({ error: 'Enter a valid staff email address and password.' });
    return;
  }

  const ipHash = hashKey(extractClientIp(req), env);
  const allowed = await checkRateLimit(supabase, ipHash, 'staff_signin', 15 * 60, 20);
  if (!allowed) {
    res.status(429).json({ error: 'Too many sign-in attempts. Please wait a few minutes.' });
    return;
  }

  const authClient = createSupabaseAuthClient(env);
  if (!authClient) {
    res.status(503).json({ error: 'Staff authentication is not configured yet.' });
    return;
  }

  let data;
  let error;
  try {
    ({ data, error } = await authClient.auth.signInWithPassword({ email, password }));
  } catch (err) {
    console.error('[intake-staff] sign-in request error:', err?.message);
    res.status(502).json({ error: 'Could not reach the authentication service.' });
    return;
  }

  if (error || !data?.session?.access_token || !data?.user?.id) {
    res.status(401).json({ error: 'Invalid staff email or password.' });
    return;
  }

  if (!isRenatusStaff(data.user, env)) {
    res.setHeader?.('Set-Cookie', buildClearStaffSessionCookie(req));
    res.status(403).json({ error: 'Your account is not authorized to access Renatus intakes.' });
    return;
  }

  res.setHeader?.(
    'Set-Cookie',
    buildStaffSessionCookie(data.session.access_token, data.session.expires_in, req),
  );
  res.status(200).json({
    ok: true,
    accessToken: data.session.access_token,
    expiresAt: data.session.expires_at ?? null,
    user: { id: data.user.id, email: data.user.email || email },
  });
}

export default async function handler(req, res) {
  return handleStaffSession(req, res, process.env);
}
