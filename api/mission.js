import { MISSION_FALLBACK } from '../src/data/mission.js';

const TIMEOUT_MS = 5000;

function fallback() {
  return { ...MISSION_FALLBACK, source: 'fallback' };
}

async function fetchLive(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) return null;

  const body = await response.json();
  const saving = body?.confirmedAnnualSaving;
  // Zero or missing is not a sensible live value: use the fallback instead.
  if (typeof saving !== 'number' || !Number.isFinite(saving) || saving <= 0) {
    return null;
  }

  const count = body.clientCount;
  return {
    confirmedAnnualSaving: saving,
    clientCount:
      typeof count === 'number' && Number.isFinite(count) && count >= 0
        ? count
        : MISSION_FALLBACK.clientCount,
    updatedAt: typeof body.updatedAt === 'string' ? body.updatedAt : null,
    source: 'live',
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');

  let payload = null;
  const url = process.env.RENATUS_OS_SAVINGS_URL;
  if (url) {
    try {
      payload = await fetchLive(url);
    } catch {
      payload = null;
    }
  }

  res.status(200).json(payload ?? fallback());
}
