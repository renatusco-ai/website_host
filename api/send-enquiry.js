import { Resend } from 'resend';

const INTENTS = {
  scoping: 'Free AI & Ops Diagnostic (15 min)',
  strategy: 'Subscription Diagnostic',
  general: 'General enquiry',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEnquiry(body) {
  if (body.website) {
    return { error: 'Rejected', status: 400 };
  }

  const phone = String(body.phone ?? '').trim();
  const email = String(body.email ?? '').trim();
  const company = String(body.company ?? '').trim();
  const name = String(body.name ?? '').trim();
  const message = String(body.message ?? '').trim();
  const spend = String(body.spend ?? '').trim();
  const intent = INTENTS[body.intent] ? body.intent : 'general';

  if (!phone || !email || !company) {
    return { error: 'Mobile, email, and company are required.', status: 400 };
  }

  if (!emailPattern.test(email)) {
    return { error: 'Enter a valid email address.', status: 400 };
  }

  return {
    data: {
      phone,
      email,
      company,
      name,
      message,
      spend,
      intent,
      intentLabel: INTENTS[intent],
    },
  };
}

export async function sendEnquiry(payload, env = process.env) {
  const key = env.RESEND_API_KEY;
  if (!key) {
    return { error: 'Email is not configured yet.', status: 503 };
  }

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
    '',
    payload.message || '(No extra message)',
  ];

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: payload.email,
    subject: `${payload.intentLabel}: ${payload.company}`,
    text: lines.join('\n'),
  });

  if (error) {
    return { error: error.message || 'Could not send enquiry.', status: 502 };
  }

  return { ok: true };
}
