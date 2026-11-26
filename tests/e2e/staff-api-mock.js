import { validateStaffDraft } from '../../api/app-store-intake/_staffSchema.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createMockStaffBackend(initialRows = []) {
  const rows = new Map();
  for (const row of initialRows) {
    rows.set(row.id, structuredClone({
      createdAt: '2026-11-26T00:00:00Z',
      status: 'new',
      submissionVersion: 2,
      staffDraft: null,
      staffRevision: 0,
      staffSavedAt: null,
      staffSavedBy: null,
      ...row,
    }));
  }

  const users = new Map([
    ['staff@renatusco.com', {
      password: 'staff-password',
      token: 'mock-staff-token-1',
      authorized: true,
      user: { id: '11111111-1111-4111-8111-111111111111', email: 'staff@renatusco.com' },
    }],
    ['staff2@renatusco.com', {
      password: 'staff-password-2',
      token: 'mock-staff-token-2',
      authorized: true,
      user: { id: '22222222-2222-4222-8222-222222222222', email: 'staff2@renatusco.com' },
    }],
    ['unauthorized@example.test', {
      password: 'user-password',
      token: 'mock-unauth-token',
      authorized: false,
      user: { id: '33333333-3333-4333-8333-333333333333', email: 'unauthorized@example.test' },
    }],
  ]);

  const tokenMap = new Map([...users.values()].map((entry) => [entry.token, entry]));
  let failNextSave = null;
  let saveSeq = 0;

  function setFailNextSave(failure) {
    failNextSave = failure;
  }

  function makeSubmissionRow(id, client, logo = null) {
    return {
      id,
      createdAt: '2026-11-26T00:00:00Z',
      status: 'new',
      submissionVersion: 2,
      handoff: {
        legalName: client.legalName,
        brandName: client.brandName,
        contactName: client.contactName,
        contactEmail: client.contactEmail,
        contactPhone: `+61${client.contactPhone.replace(/\s+/g, '').replace(/^0/, '')}`,
        websiteUrl: client.websiteUrl || null,
        appName: client.appName,
        publishingAccount: null,
        answers: {
          ...client,
          brandNameMatchesLegalName: false,
          phoneCountryCode: '+61',
          sendClientCopy: true,
        },
        assets: logo
          ? [{ path: `intake/11111111-2222-4333-8444-555555555555/decaf123-${logo.name}`, name: logo.name, size: logo.buffer.length, mimeType: logo.mimeType }]
          : [],
        gaps: [],
      },
      staffDraft: null,
      staffRevision: 0,
      staffSavedAt: null,
      staffSavedBy: null,
    };
  }

  function addSubmission(id, client, logo = null) {
    const row = makeSubmissionRow(id, client, logo);
    rows.set(id, row);
    return row;
  }

  async function install(target, { defaultToken = null } = {}) {
    let cookieToken = defaultToken;

    function resolveSession(request) {
      const authHeader = request.headers()['authorization'] || '';
      const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const token = bearer || cookieToken || '';
      if (!token) return { status: 401, error: 'Sign in with a Renatus staff account to access this intake.' };
      const entry = tokenMap.get(token);
      if (!entry) return { status: 401, error: 'Your staff session is invalid or expired. Sign in again.' };
      if (!entry.authorized) return { status: 403, error: 'Your account is not authorized to access Renatus intakes.' };
      return { status: 200, entry };
    }

    await target.route('**/api/app-store-intake/staff/session', async (route) => {
      const req = route.request();
      const method = req.method();
      if (method === 'GET') {
        const session = resolveSession(req);
        if (session.status !== 200) {
          await route.fulfill({ status: session.status, json: { authenticated: false, error: session.error } });
          return;
        }
        await route.fulfill({ status: 200, json: { authenticated: true, user: session.entry.user } });
        return;
      }
      if (method === 'POST') {
        const body = req.postDataJSON() || {};
        const entry = users.get(String(body.email || '').trim().toLowerCase());
        if (!entry || entry.password !== body.password) {
          await route.fulfill({ status: 401, json: { error: 'Invalid staff email or password.' } });
          return;
        }
        if (!entry.authorized) {
          cookieToken = null;
          await route.fulfill({ status: 403, json: { error: 'Your account is not authorized to access Renatus intakes.' } });
          return;
        }
        cookieToken = entry.token;
        await route.fulfill({
          status: 200,
          json: { ok: true, accessToken: entry.token, expiresAt: 1900000000, user: entry.user },
        });
        return;
      }
      if (method === 'DELETE') {
        cookieToken = null;
        await route.fulfill({ status: 200, json: { ok: true } });
        return;
      }
      await route.fulfill({ status: 405, json: { error: 'Method not allowed' } });
    });

    await target.route('**/api/app-store-intake/staff**', async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.pathname.endsWith('/session')) {
        await route.fallback();
        return;
      }
      const method = req.method();
      const session = resolveSession(req);
      if (session.status !== 200) {
        await route.fulfill({ status: session.status, json: { error: session.error } });
        return;
      }

      if (method === 'GET') {
        const ref = (url.searchParams.get('reference') || '').trim();
        if (!UUID_RE.test(ref)) {
          await route.fulfill({ status: 400, json: { error: 'Enter a valid Step 1 intake reference (UUID).' } });
          return;
        }
        const row = rows.get(ref);
        if (!row) {
          await route.fulfill({ status: 404, json: { error: 'No intake submission was found for that reference.' } });
          return;
        }
        await route.fulfill({ status: 200, json: { ok: true, intake: structuredClone(row) } });
        return;
      }

      if (method === 'PUT') {
        if (failNextSave) {
          const failure = failNextSave;
          failNextSave = null;
          if (failure === 'abort') {
            await route.abort('failed');
            return;
          }
          await route.fulfill({ status: failure.status || 502, json: { error: failure.error || 'Temporary server error.' } });
          return;
        }

        const body = req.postDataJSON() || {};
        const ref = String(body.reference || '').trim();
        if (!UUID_RE.test(ref)) {
          await route.fulfill({ status: 400, json: { error: 'Enter a valid Step 1 intake reference (UUID).' } });
          return;
        }
        const row = rows.get(ref);
        if (!row) {
          await route.fulfill({ status: 404, json: { error: 'No intake submission was found for that reference.' } });
          return;
        }
        const validated = validateStaffDraft(body.staffDraft);
        if (validated.error) {
          await route.fulfill({ status: validated.status, json: { error: validated.error } });
          return;
        }
        if (row.staffRevision !== body.expectedRevision) {
          await route.fulfill({
            status: 409,
            json: {
              error:
                'Another staff member saved a newer revision while you were editing. Review your changes or reload the latest revision before saving again.',
              code: 'REVISION_CONFLICT',
              id: row.id,
              currentRevision: row.staffRevision,
              staffSavedAt: row.staffSavedAt,
              staffSavedBy: row.staffSavedBy,
              staffDraft: structuredClone(row.staffDraft),
            },
          });
          return;
        }
        saveSeq += 1;
        row.staffDraft = structuredClone(validated.data);
        row.staffRevision += 1;
        row.staffSavedAt = `2026-11-26T10:00:${String(saveSeq).padStart(2, '0')}Z`;
        row.staffSavedBy = session.entry.user.id;
        await route.fulfill({
          status: 200,
          json: {
            ok: true,
            id: row.id,
            staffDraft: structuredClone(row.staffDraft),
            staffRevision: row.staffRevision,
            staffSavedAt: row.staffSavedAt,
            staffSavedBy: row.staffSavedBy,
          },
        });
        return;
      }

      await route.fulfill({ status: 405, json: { error: 'Method not allowed' } });
    });
  }

  return { rows, users, addSubmission, setFailNextSave, install };
}
