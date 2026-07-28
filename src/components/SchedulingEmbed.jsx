import { useEffect, useRef } from 'react';

const TIDYCAL_SCRIPT_SRC = 'https://asset-tidycal.b-cdn.net/js/embed.js';

let tidyCalScriptPromise = null;

function loadTidyCalScript() {
  if (tidyCalScriptPromise) return tidyCalScriptPromise;

  tidyCalScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${TIDYCAL_SCRIPT_SRC}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = TIDYCAL_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return tidyCalScriptPromise;
}

function refreshTidyCalEmbeds() {
  const existing = document.querySelector(`script[src="${TIDYCAL_SCRIPT_SRC}"]`);
  if (!existing) return;

  const script = document.createElement('script');
  script.src = TIDYCAL_SCRIPT_SRC;
  script.async = true;
  existing.replaceWith(script);
}

export default function SchedulingEmbed({ title = 'Schedule a call', embedPath, url }) {
  const embedRef = useRef(null);

  useEffect(() => {
    if (!embedPath || !embedRef.current) return undefined;

    let cancelled = false;

    loadTidyCalScript()
      .then(() => {
        if (cancelled) return;
        refreshTidyCalEmbeds();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [embedPath]);

  return (
    <div className="scheduling-embed">
      <p className="label-upper mb-4">{title}</p>
      {embedPath ? (
        <>
          <div className="scheduling-embed__frame-wrap">
            <div
              key={embedPath}
              ref={embedRef}
              className="tidycal-embed"
              data-path={embedPath}
            />
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-arrow mt-4 inline-flex"
            >
              Open booking page &rarr;
            </a>
          )}
        </>
      ) : (
        <div className="scheduling-embed__placeholder">
          <p className="text-ink text-sm mb-2">Booking link coming soon</p>
          <p className="text-sage text-xs leading-relaxed">
            Your booking calendar will appear here. Until then, email{' '}
            <a href="mailto:hello@renatus.ai" className="text-gold hover:text-forest transition-colors">
              hello@renatus.ai
            </a>{' '}
            to request a time.
          </p>
        </div>
      )}
    </div>
  );
}
