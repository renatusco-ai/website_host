import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from './rate-limit.js';

const INTENTS = {
  scoping: 'Free AI & Ops Diagnostic (15 min)',
  general: 'General enquiry',
};

const SPEND_VALUES = new Set(['', '$', '$$', '$$$', '$$$$']);

const LIMITS = {
  name: 120,
  email: 320,
  phone: 40,
  company: 200,
  message: 4000,
  spend: 20,
  pagePath: 300,
  referrer: 500,
  userAgent: 400,
  notes: 500,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS };

function headerValue(headers, name) {
  if (!headers) return '';
  const raw = headers[name] ?? headers[name.toLowerCase()] ?? '';
  if (Array.isArray(raw)) return raw.join(',');
  return String(raw);
}

export function clientIp(request) {
  const forwarded = headerValue(request.headers, 'x-forwarded-for');
  const realIp = headerValue(request.headers, 'x-real-ip');
  const candidate = forwarded || realIp || request.ip || '';
  return String(candidate).split(',')[0].trim();
}

function cleanSingleLine(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

function cleanMessage(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function coerceEnquiryBody(body, contentType = '') {
  if (Buffer.isBuffer(body)) return coerceEnquiryBody(body.toString('utf8'), contentType);
  if (typeof body === 'string') {
    if (body.length > 50_000) return { ok: false, reason: 'too_large' };
    const trimmed = body.trim();
    if (!trimmed) return { ok: true, value: {} };
    const form = contentType.includes('application/x-www-form-urlencoded');
    const json = contentType.includes('application/json') || (!form && (trimmed.startsWith('{') || trimmed.startsWith('[')));
    if (json) {
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          return { ok: false, reason: 'invalid_json' };
        }
        return { ok: true, value: parsed };
      } catch {
        return { ok: false, reason: 'invalid_json' };
      }
    }
    return { ok: true, value: Object.fromEntries(new URLSearchParams(body)) };
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) return { ok: true, value: body };
  return { ok: true, value: {} };
}

export function isFormSubmission(contentType = '') {
  return contentType.includes('application/x-www-form-urlencoded');
}

function formErrorDocument(message) {
  const safe = escapeHtml(message);
  return `<!DOCTYPE html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Enquiry not sent | Renatus</title>
  </head>
  <body>
    <main>
      <h1>Enquiry not sent</h1>
      <p>${safe}</p>
      <p><a href="/contact">Back to the contact form</a></p>
    </main>
  </body>
</html>`;
}

function fail(status, error, form) {
  const result = { status, error };
  if (form) result.html = formErrorDocument(error);
  return result;
}

function safePath(value) {
  const path = cleanSingleLine(value).slice(0, LIMITS.pagePath);
  if (!path.startsWith('/') || path.startsWith('//')) return '';
  return path;
}

function pathFromReferer(referer) {
  try {
    const url = new URL(referer);
    return safePath(url.pathname);
  } catch {
    return '';
  }
}

export function parseEnquiry(body) {
  const website = cleanSingleLine(body?.website);
  if (website) {
    return { error: 'Rejected', status: 400, honeypot: true };
  }

  const name = cleanSingleLine(body?.name);
  const email = cleanSingleLine(body?.email);
  const phone = cleanSingleLine(body?.phone);
  const company = cleanSingleLine(body?.company);
  const message = cleanMessage(body?.message);
  const spendRaw = cleanSingleLine(body?.spend);
  const intentKey = INTENTS[body?.intent] ? body.intent : 'general';

  if (name.length > LIMITS.name) return { error: 'Name is too long.', status: 400 };
  if (email.length > LIMITS.email) return { error: 'Email is too long.', status: 400 };
  if (phone.length > LIMITS.phone) return { error: 'Mobile is too long.', status: 400 };
  if (company.length > LIMITS.company) return { error: 'Company is too long.', status: 400 };
  if (message.length > LIMITS.message) return { error: 'Message is too long.', status: 400 };
  if (spendRaw.length > LIMITS.spend) return { error: 'Check the cost field and try again.', status: 400 };

  if (!phone || !email || !company) {
    return { error: 'Mobile, email, and company are required.', status: 400 };
  }

  if (!emailPattern.test(email)) {
    return { error: 'Enter a valid email address.', status: 400 };
  }

  const spend = SPEND_VALUES.has(spendRaw) ? spendRaw : '';

  return {
    data: {
      name,
      email,
      phone,
      company,
      message,
      spend,
      intent: intentKey,
      intentLabel: INTENTS[intentKey],
    },
  };
}

function notesFor(data) {
  const spend = data.spend || 'not shared';
  return `intent: ${data.intent}; spend: ${spend}`.slice(0, LIMITS.notes);
}

export function createSupabase(env) {
  const url = env?.SUPABASE_URL;
  const key = env?.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function defaultSendEmail(payload, env) {
  const key = env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: true };

  const to = env.ENQUIRY_TO || 'info@renatusco.com';
  const from = env.RESEND_FROM || 'Renatus <beth.t@example.com>';
  const resend = new Resend(key);
  const lines = [
    `Enquiry: ${payload.intentLabel}`,
    `Name: ${payload.name || '—'}`,
    `Mobile: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company}`,
    `Rough cost: ${payload.spend || 'Not shared'}`,
  ];
  if (payload.pagePath) lines.push(`Page: ${payload.pagePath}`);
  lines.push('', payload.message || '(No extra message)');

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: payload.email,
      subject: `${payload.intentLabel}: ${payload.company}`,
      text: lines.join('\n'),
    });
    if (error) {
      console.error('Resend rejected the enquiry email:', error.message || error.name || 'unknown');
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error('Resend threw while sending the enquiry email:', err?.name || 'Error');
    return { ok: false };
  }
}

function leadRow(data) {
  return {
    source: 'website',
    name: data.name || null,
    email: data.email,
    phone: data.phone,
    business_name: data.company,
    message: data.message || null,
    page_path: data.pagePath || null,
    referrer: data.referrer || null,
    user_agent: data.userAgent || null,
    notes: notesFor(data),
  };
}

/**
 * Accepts JSON or application/x-www-form-urlencoded.
 * Form posts redirect 303 to /contact?sent=1 on success.
 * Storage is attempted first when Supabase env is set. Email is best-effort after that.
 */
export async function processEnquiry(request, deps = {}) {
  const env = deps.env ?? process.env;
  const contentType = headerValue(request.headers, 'content-type');
  const form = isFormSubmission(contentType);
  const now = deps.now ?? Date.now();
  const ip = clientIp(request);
  const limit = checkRateLimit(ip, now);

  if (limit.limited) {
    return {
      ...fail(429, 'Too many enquiries. Please try again later.', form),
      retryAfterSec: limit.retryAfterSec,
    };
  }

  const coerced = coerceEnquiryBody(request.body, contentType);
  if (!coerced.ok) {
    const message = coerced.reason === 'too_large' ? 'Enquiry is too long.' : 'Invalid JSON';
    return fail(400, message, form);
  }
  const body = coerced.value;
  const parsed = parseEnquiry(body);
  if (parsed.error) {
    return fail(parsed.status, parsed.error, form);
  }

  const refererHeader = headerValue(request.headers, 'referer') || headerValue(request.headers, 'referrer');
  const data = {
    ...parsed.data,
    pagePath: safePath(body.page_path || body.pagePath) || pathFromReferer(refererHeader),
    referrer: cleanSingleLine(body.referrer || refererHeader).slice(0, LIMITS.referrer),
    userAgent: cleanSingleLine(body.user_agent || body.userAgent || headerValue(request.headers, 'user-agent')).slice(0, LIMITS.userAgent),
  };

  const supabase = deps.supabase === undefined ? createSupabase(env) : deps.supabase;
  const sendEmail = deps.sendEmail ?? defaultSendEmail;

  if (supabase) {
    try {
      const { error } = await supabase.from('leads').insert(leadRow(data));
      if (error) {
        console.error('Lead insert failed:', error.message || error.code || 'unknown');
        return fail(502, 'Could not send enquiry.', form);
      }
    } catch (err) {
      console.error('Lead insert threw:', err?.name || 'Error');
      return fail(502, 'Could not send enquiry.', form);
    }

    if (!env.RESEND_API_KEY) {
      console.info('Enquiry stored. RESEND_API_KEY is not set, so no email was sent.');
      return form ? { status: 303, location: '/contact?sent=1' } : { status: 200 };
    }

    const mailed = await sendEmail(data, env);
    if (!mailed.ok) {
      console.error('Enquiry email failed after the lead was stored. The insert still stands.');
    }
    return form ? { status: 303, location: '/contact?sent=1' } : { status: 200 };
  }

  if (!env.RESEND_API_KEY) {
    console.error('Enquiry rejected: neither Supabase nor Resend is configured.');
    return fail(503, 'Enquiry storage is not configured yet.', form);
  }

  const mailed = await sendEmail(data, env);
  if (!mailed.ok) {
    return fail(502, 'Could not send enquiry.', form);
  }
  return form ? { status: 303, location: '/contact?sent=1' } : { status: 200 };
}

export function writeEnquiryResult(res, result) {
  if (result.retryAfterSec) {
    res.setHeader('Retry-After', String(result.retryAfterSec));
  }
  if (result.location) {
    res.statusCode = result.status;
    res.setHeader('Location', result.location);
    res.end();
    return;
  }
  if (result.html) {
    res.statusCode = result.status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(result.html);
    return;
  }
  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(result.error ? { error: result.error } : { ok: true }));
}
