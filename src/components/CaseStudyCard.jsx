import { Link } from 'react-router-dom';
import SectionReveal from './SectionReveal';
import DataReadout from './DataReadout';
import { PORTFOLIO_MEDIA_ENABLED } from '../data/content';

function CardContent({ study, compact, onViewMedia }) {
  const hasMedia = study.media?.length > 0;
  const showMedia = PORTFOLIO_MEDIA_ENABLED && hasMedia && onViewMedia;
  const showDemoNote = !PORTFOLIO_MEDIA_ENABLED && hasMedia && !compact;

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <span className="label-upper">{study.industry}</span>
        {!compact && study.metrics && (
          <DataReadout label={study.metrics.label} value={study.metrics.value} />
        )}
      </div>

      <h3 className="heading-display text-2xl md:text-3xl text-ink group-hover:text-spring transition-colors duration-500 mb-4">
        {study.title}
      </h3>

      <p className={`text-graphite leading-relaxed ${compact ? 'text-sm line-clamp-3' : 'text-sm md:text-base'}`}>
        {study.outcome}
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        {study.tags.map((tag) => (
          <span
            key={tag}
            className="text-[0.65rem] uppercase tracking-wider text-graphite border border-smoke px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {showMedia && (
        <button
          type="button"
          onClick={() => onViewMedia(study)}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest border-b border-spring pb-0.5 hover:border-forest transition-colors"
        >
          View interface
          <span aria-hidden="true">&#8599;</span>
        </button>
      )}

      {showDemoNote && (
        <p className="mt-6 text-sm text-graphite leading-relaxed">
          <Link to="/contact" className="text-forest underline decoration-spring underline-offset-4 hover:decoration-forest transition-colors">
            Book a call for a live demo
          </Link>
          {' '}to see this in action.
        </p>
      )}
    </>
  );
}

export default function CaseStudyCard({
  study,
  index = 0,
  compact = false,
  linkable = true,
  onViewMedia,
}) {
  return (
    <SectionReveal delay={index * 0.1}>
      {linkable ? (
        <Link to="/portfolio" className="case-study-card group block h-full">
          <CardContent study={study} compact={compact} />
        </Link>
      ) : (
        <div className="case-study-card h-full">
          <CardContent study={study} compact={compact} onViewMedia={onViewMedia} />
        </div>
      )}
    </SectionReveal>
  );
}
