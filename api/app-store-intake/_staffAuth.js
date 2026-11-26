import { createClient } from '@supabase/supabase-js';

export const STAFF_COOKIE_NAME = 'renatus_staff_session';
const STAFF_ROLES = new Set(['renatus_staff', 'staff', 'admin']);

function parseCsvSet(raw) {
  return new Set(
    String(raw || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (typeof cookieHeader !== 'string' || !cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

export function extractStaffToken(req) {
  const auth = req?.headers?.authorization || req?.headers?.Authorization;
  if (typeof auth === 'string') {
    const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
    if (match && match[1].trim()) return match[1].trim();
  }
  const cookies = parseCookies(req?.headers?.cookie);
  return cookies[STAFF_COOKIE_NAME] || '';
}

function isSecureRequest(req) {
  const proto = String(req?.headers?.['x-forwarded-proto'] || '').toLowerCase();
  if (proto === 'https') return true;
  return Boolean(req?.socket?.encrypted);
}

export function buildStaffSessionCookie(token, maxAgeSeconds = 3600, req = null) {
  const maxAge = Math.max(0, Math.floor(Number(maxAgeSeconds) || 3600));
  const parts = [
    `${STAFF_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/api/app-store-intake/staff',
    `Max-Age=${maxAge}`,
  ];
  if (isSecureRequest(req)) parts.push('Secure');
  return parts.join('; ');
}

export function buildClearStaffSessionCookie(req = null) {
  const parts = [
    `${STAFF_COOKIE_NAME}=`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/api/app-store-intake/staff',
    'Max-Age=0',
  ];
  if (isSecureRequest(req)) parts.push('Secure');
  return parts.join('; ');
}

export function createSupabaseAuthClient(env = process.env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isUserBanned(user) {
  if (!user?.banned_until) return false;
  const until = Date.parse(user.banned_until);
  return Number.isFinite(until) && until > Date.now();
}

export function isRenatusStaff(user, env = process.env) {
  if (!user || typeof user.id !== 'string' || !user.id) return false;
  if (isUserBanned(user)) return false;

  // Only inspect server-controlled app_metadata (never user-editable user_metadata).
  const appMeta = user.app_metadata && typeof user.app_metadata === 'object' ? user.app_metadata : {};
  if (appMeta.renatus_staff === true) return true;
  if (typeof appMeta.role === 'string' && STAFF_ROLES.has(appMeta.role.trim().toLowerCase())) {
    return true;
  }
  if (
    Array.isArray(appMeta.roles) &&
    appMeta.roles.some((role) => typeof role === 'string' && STAFF_ROLES.has(role.trim().toLowerCase()))
  ) {
    return true;
  }

  const allowedUserIds = parseCsvSet(env.INTAKE_STAFF_USER_IDS);
  if (allowedUserIds.has(user.id.toLowerCase())) return true;

  const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  const emailConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at);
  if (email && emailConfirmed) {
    const allowedEmails = parseCsvSet(env.INTAKE_STAFF_EMAILS);
    if (allowedEmails.has(email)) return true;

    const allowedDomains = parseCsvSet(env.INTAKE_STAFF_EMAIL_DOMAINS);
    const domain = email.includes('@') ? email.slice(email.lastIndexOf('@') + 1) : '';
    if (domain && allowedDomains.has(domain)) return true;
  }

  return false;
}

export function isAuthorizedForIntake(user, intakeId, env = process.env) {
  if (!isRenatusStaff(user, env)) return false;
  const appMeta = user.app_metadata && typeof user.app_metadata === 'object' ? user.app_metadata : {};
  if (Array.isArray(appMeta.allowed_intake_ids)) {
    const target = String(intakeId || '').toLowerCase();
    return appMeta.allowed_intake_ids.some((id) => String(id || '').toLowerCase() === target);
  }
  return true;
}

export async function authenticateStaffRequest(req, supabase, env = process.env, { intakeId } = {}) {
  const token = extractStaffToken(req);
  if (!token) {
    return {
      ok: false,
      status: 401,
      error: 'Sign in with a Renatus staff account to access this intake.',
    };
  }

  let data;
  let error;
  try {
    ({ data, error } = await supabase.auth.getUser(token));
  } catch (err) {
    console.error('[intake-staff] auth verification error:', err?.message);
    return { ok: false, status: 502, error: 'Could not verify staff authentication.' };
  }

  if (error || !data?.user?.id) {
    return {
      ok: false,
      status: 401,
      error: 'Your staff session is invalid or expired. Sign in again.',
    };
  }

  const user = data.user;
  if (!isRenatusStaff(user, env)) {
    return {
      ok: false,
      status: 403,
      error: 'Your account is not authorized to access Renatus intakes.',
    };
  }

  if (intakeId !== undefined && !isAuthorizedForIntake(user, intakeId, env)) {
    return {
      ok: false,
      status: 403,
      error: 'Your account is not authorized to access this intake.',
    };
  }

  return { ok: true, user };
}
