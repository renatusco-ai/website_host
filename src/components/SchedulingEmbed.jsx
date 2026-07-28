import { useEffect, useRef } from 'react';
import { CONTACT_EMAIL } from '../data/content';

const TIDYCAL_SCRIPT_SRC = 'https://asset-tidycal.b-cdn.net/js/embed.js';

function removeTidyCalScripts() {
  document.querySelectorAll(`script[src="${TIDYCAL_SCRIPT_SRC}"]`).forEach((node) => {
    node.remove();
  });
}

function mountTidyCalEmbed(container, embedPath) {
  container.innerHTML = '';

  const embed = document.createElement('div');
  embed.className = 'tidycal-embed';
  embed.setAttribute('data-path', embedPath);
  container.appendChild(embed);

  removeTidyCalScripts();

  const script = document.createElement('script');
  script.src = TIDYCAL_SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}

export default function SchedulingEmbed({ title = 'Schedule a call', embedPath, url }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!embedPath || !containerRef.current) return undefined;

    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled || !containerRef.current) return;
      mountTidyCalEmbed(containerRef.current, embedPath);
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [embedPath]);

  return (
    <div className="scheduling-embed">
      <p className="label-upper mb-4">{title}</p>
      {embedPath ? (
        <>
          <div className="scheduling-embed__frame-wrap">
            <div ref={containerRef} className="scheduling-embed__mount" />
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
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold hover:text-forest transition-colors">
              {CONTACT_EMAIL}
            </a>{' '}
            to request a time.
          </p>
        </div>
      )}
    </div>
  );
}
