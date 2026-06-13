import { Link } from 'react-router-dom';
import SectionReveal from './SectionReveal';
import DataReadout from './DataReadout';

function CardContent({ study, compact }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <span className="label-upper">{study.industry}</span>
        {!compact && study.metrics && (
          <DataReadout label={study.metrics.label} value={study.metrics.value} />
        )}
      </div>

      <h3 className="heading-display text-2xl md:text-3xl text-ink group-hover:text-gold transition-colors duration-500 mb-4">
        {study.title}
      </h3>

      <p className={`text-sage leading-relaxed ${compact ? 'text-sm line-clamp-3' : 'text-sm md:text-base'}`}>
        {study.outcome}
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        {study.tags.map((tag) => (
          <span
            key={tag}
            className="text-[0.65rem] uppercase tracking-wider text-sage border border-mist px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  );
}

export default function CaseStudyCard({ study, index = 0, compact = false, linkable = true }) {
  return (
    <SectionReveal delay={index * 0.1}>
      {linkable ? (
        <Link to="/work" className="case-study-card group block h-full">
          <CardContent study={study} compact={compact} />
        </Link>
      ) : (
        <div className="case-study-card h-full">
          <CardContent study={study} compact={compact} />
        </div>
      )}
    </SectionReveal>
  );
}
