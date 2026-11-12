import { useEffect, useState } from 'react';
import { MISSION_FALLBACK } from '../data/mission';

const REFRESH_MS = 60_000;

function isValid(data) {
  return (
    data &&
    typeof data.confirmedAnnualSaving === 'number' &&
    Number.isFinite(data.confirmedAnnualSaving) &&
    data.confirmedAnnualSaving > 0
  );
}

/**
 * Live mission total. Starts on the fallback so the first paint is instant,
 * then polls /api/mission while the tab is visible. Failures are silent and
 * keep the last good value (under plain `vite dev` the route does not exist).
 */
export default function useMissionTotal() {
  const [data, setData] = useState(MISSION_FALLBACK);

  useEffect(() => {
    let cancelled = false;
    let controller = null;

    async function load() {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch('/api/mission', {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        const type = response.headers.get('content-type') ?? '';
        if (!response.ok || !type.includes('json')) return;
        const next = await response.json();
        if (cancelled || !isValid(next)) return;
        setData((prev) =>
          prev.confirmedAnnualSaving === next.confirmedAnnualSaving &&
          prev.clientCount === next.clientCount
            ? prev
            : next,
        );
      } catch {
        // Keep the last good value.
      }
    }

    function tick() {
      if (document.visibilityState === 'visible') load();
    }

    load();
    const timer = setInterval(tick, REFRESH_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  return data;
}
