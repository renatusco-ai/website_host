/**
 * Best-effort enquiry rate limit.
 *
 * Counters live in this process. On Vercel each serverless instance has its own
 * memory, so the cap is not shared across instances and is not a global lock.
 * public.leads, as described for this site, has no IP or timestamp column to
 * count recent inserts against, and the schema must not be changed here.
 */

const hits = new Map();

export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const RATE_LIMIT_MAX = 5;

export function checkRateLimit(key, now = Date.now()) {
  const id = key || 'unknown';
  const recent = (hits.get(id) || []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(id, recent);
    const retryAfterSec = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - recent[0])) / 1000));
    return { limited: true, retryAfterSec };
  }

  recent.push(now);
  hits.set(id, recent);
  return { limited: false, retryAfterSec: 0 };
}

export function resetRateLimit() {
  hits.clear();
}
