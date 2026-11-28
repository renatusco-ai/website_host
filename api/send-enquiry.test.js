import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
  processEnquiry,
  writeEnquiryResult,
  RATE_LIMIT_MAX,
} from './send-enquiry.js';
import { resetRateLimit } from './rate-limit.js';

for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'RESEND_FROM', 'ENQUIRY_TO']) {
  delete process.env[key];
}

let ipSeq = 0;

function nextIp() {
  ipSeq += 1;
  return `203.0.113.${ipSeq}`;
}

function mockDb(insertResult = { error: null }) {
  const inserts = [];
  return {
    inserts,
    from(table) {
      assert.equal(table, 'leads');
      return {
        insert(row) {
          inserts.push(row);
          return Promise.resolve(insertResult);
        },
      };
    },
  };
}

function call(body, { headers = {}, ip = nextIp(), env = {}, supabase = null, sendEmail, contentType } = {}) {
  const type = contentType ?? (typeof body === 'string' ? 'application/x-www-form-urlencoded' : 'application/json');
  return processEnquiry(
    {
      body,
      ip,
      headers: { 'content-type': type, ...headers },
    },
    { env, supabase, sendEmail },
  );
}

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '0400000000',
  company: 'Analytical Engines',
  message: 'The books do not match.',
  intent: 'scoping',
  spend: '$$',
  website: '',
  page_path: '/contact',
};

beforeEach(() => {
  resetRateLimit();
});

afterEach(() => {
  resetRateLimit();
});

describe('processEnquiry', { concurrency: false }, () => {
  it('rejects a filled honeypot and does not store it', async () => {
    const db = mockDb();
    const result = await call(
      { ...valid, website: 'https://spam.example' },
      { supabase: db, ip: '198.51.100.10' },
    );
    assert.equal(result.status, 400);
    assert.equal(result.error, 'Rejected');
    assert.equal(db.inserts.length, 0);
  });

  it('accepts JSON and maps the lead row', async () => {
    const db = mockDb();
    const result = await call(valid, {
      supabase: db,
      ip: '198.51.100.11',
      headers: { 'user-agent': 'TestAgent/1.0', referer: 'https://example.com/from' },
    });
    assert.equal(result.status, 200);
    assert.equal(result.location, undefined);
    assert.equal(db.inserts.length, 1);
    const row = db.inserts[0];
    assert.equal(row.source, 'website');
    assert.equal(row.business_name, 'Analytical Engines');
    assert.equal(row.email, 'ada@example.com');
    assert.equal(row.phone, '0400000000');
    assert.equal(row.page_path, '/contact');
    assert.equal(row.user_agent, 'TestAgent/1.0');
    assert.equal(row.referrer, 'https://example.com/from');
    assert.equal(row.notes, 'intent: scoping; spend: $$');
    assert.equal('status' in row, false);
    assert.equal('business_website' in row, false);
  });

  it('accepts a form post and redirects', async () => {
    const db = mockDb();
    const params = new URLSearchParams(valid);
    const result = await call(params.toString(), {
      supabase: db,
      ip: '198.51.100.12',
      contentType: 'application/x-www-form-urlencoded',
      headers: { 'user-agent': 'NoJs/1.0' },
    });
    assert.equal(result.status, 303);
    assert.equal(result.location, '/contact?sent=1');
    assert.equal(db.inserts.length, 1);
    assert.equal(db.inserts[0].notes, 'intent: scoping; spend: $$');
    assert.equal(db.inserts[0].user_agent, 'NoJs/1.0');
  });

  it('rate limits the next submission after the cap', async () => {
    const db = mockDb();
    const ip = '198.51.100.20';
    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      const result = await call(valid, { supabase: db, ip });
      assert.equal(result.status, 200);
    }
    const blocked = await call(valid, { supabase: db, ip });
    assert.equal(blocked.status, 429);
    assert.equal(db.inserts.length, RATE_LIMIT_MAX);
    assert.ok(blocked.retryAfterSec > 0);
  });

  it('returns 503 when neither storage nor email is configured', async () => {
    const result = await call(valid, { ip: '198.51.100.30', env: {}, supabase: null });
    assert.equal(result.status, 503);
  });

  it('falls back to email when Supabase is not configured', async () => {
    let sent = 0;
    const result = await call(valid, {
      ip: '198.51.100.31',
      supabase: null,
      env: { RESEND_API_KEY: 'test-key' },
      sendEmail: async () => {
        sent += 1;
        return { ok: true };
      },
    });
    assert.equal(result.status, 200);
    assert.equal(sent, 1);
  });

  it('returns success after a stored lead when email is not configured', async () => {
    const db = mockDb();
    let sent = 0;
    const result = await call(valid, {
      ip: '198.51.100.32',
      supabase: db,
      env: {},
      sendEmail: async () => {
        sent += 1;
        return { ok: true };
      },
    });
    assert.equal(result.status, 200);
    assert.equal(db.inserts.length, 1);
    assert.equal(sent, 0);
  });

  it('returns success when email fails after the insert', async () => {
    const db = mockDb();
    const result = await call(valid, {
      ip: '198.51.100.33',
      supabase: db,
      env: { RESEND_API_KEY: 'test-key' },
      sendEmail: async () => ({ ok: false }),
    });
    assert.equal(result.status, 200);
    assert.equal(db.inserts.length, 1);
    assert.equal(result.error, undefined);
  });

  it('does not store an invalid email', async () => {
    const db = mockDb();
    const result = await call({ ...valid, email: 'not-an-email' }, { supabase: db, ip: '198.51.100.34' });
    assert.equal(result.status, 400);
    assert.equal(db.inserts.length, 0);
  });

  it('rejects an oversized message', async () => {
    const db = mockDb();
    const result = await call(
      { ...valid, message: 'a'.repeat(4001) },
      { supabase: db, ip: '198.51.100.35' },
    );
    assert.equal(result.status, 400);
    assert.match(result.error, /too long/i);
    assert.equal(db.inserts.length, 0);
  });

  it('writes a form redirect without a JSON body', () => {
    const chunks = [];
    const headers = {};
    const res = {
      statusCode: 0,
      setHeader(name, value) {
        headers[name] = value;
      },
      end(body) {
        chunks.push(body);
      },
    };
    writeEnquiryResult(res, { status: 303, location: '/contact?sent=1' });
    assert.equal(res.statusCode, 303);
    assert.equal(headers.Location, '/contact?sent=1');
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0], undefined);
  });
});
