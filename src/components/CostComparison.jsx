import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SectionReveal from './SectionReveal';
import { StorySectionHeading } from './SiteStory';
import { COST_EXAMPLES, COST_MODEL, COST_MODEL_DISCLAIMER } from '../data/content';

const money = (value) =>
  value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  });

function exampleFlag(example) {
  switch (example.status) {
    case 'documented':
      return { text: `Documented · ${example.client}`, verified: true };
    case 'modelled':
      return { text: `Modelled · ${example.client}`, verified: true };
    case 'indicative':
      return { text: 'Indicative list pricing', verified: false };
    default: {
      const exhaustive = example.status;
      throw new Error(`Unhandled cost example status: ${exhaustive}`);
    }
  }
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0 mt-1" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0 mt-1" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path
        d="M6 10.4l2.6 2.6L14.2 7.4"
        fill="none"
        stroke="var(--color-canvas)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CostComparison() {
  const [activeId, setActiveId] = useState(COST_EXAMPLES[0].id);
  const active = COST_EXAMPLES.find((example) => example.id === activeId);
  const stackTotal = active.rows.reduce((sum, row) => sum + row.annual, 0);
  const flag = exampleFlag(active);
  const amountSuffix = active.amountSuffix ?? '/yr';
  const stackLabel = active.stackLabel ?? 'Every year, before anything else';

  return (
    <section className="site-story-section cost-story">
      <div className="site-story-section__inner">
        <StorySectionHeading
          number="03"
          eyebrow="The economics"
          title={
            <>
              Growth should increase your return. <em>Not your rent.</em>
            </>
          }
          body="Nearly every platform charges by the seat. That is a pricing model built for the vendor, and none of it pays for anyone to help your team adopt the tool. An owned system lets your headcount grow without moving the bill, and we stay to implement it with you."
        />

        <div className="cost-story__models">
          <span className="cost-story__versus" aria-hidden="true">vs</span>
          <SectionReveal delay={0.1}>
            <div className="cost-story__model cost-story__model--old">
              <p className="text-[0.7rem] tracking-[0.18em] uppercase text-graphite mb-2">
                {COST_MODEL.traditional.subtitle}
              </p>
              <h3 className="heading-display text-2xl text-ink mb-7">
                {COST_MODEL.traditional.label}
              </h3>
              <ul className="space-y-4">
                {COST_MODEL.traditional.points.map((point) => (
                  <li key={point} className="flex gap-3 text-graphite text-sm leading-relaxed">
                    <span className="text-graphite">
                      <CrossIcon />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <div className="cost-story__model cost-story__model--new">
              <p className="text-[0.7rem] tracking-[0.18em] uppercase text-forest mb-2">
                {COST_MODEL.ours.subtitle}
              </p>
              <h3 className="heading-display text-2xl text-ink mb-7">
                {COST_MODEL.ours.label}
              </h3>
              <ul className="space-y-4">
                {COST_MODEL.ours.points.map((point) => (
                  <li key={point} className="flex gap-3 text-ink/75 text-sm leading-relaxed">
                    <span className="text-forest">
                      <CheckIcon />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
        </div>

        <SectionReveal delay={0.1}>
          <div className="cost-story__example">
            <p className="site-story-eyebrow">What this looks like</p>
            <h3>
              Follow the money in your industry.
            </h3>

            <div
              className="flex flex-wrap gap-2 mb-8"
              role="tablist"
              aria-label="Industry cost examples"
            >
              {COST_EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  role="tab"
                  aria-selected={example.id === activeId}
                  onClick={() => setActiveId(example.id)}
                  className={`industry-tab${example.id === activeId ? ' industry-tab--active' : ''}`}
                >
                  {example.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="cost-story__example-panel"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-8">
                  <p className="text-graphite text-sm">{active.context}</p>
                  <span className={`cost-flag${flag.verified ? ' cost-flag--verified' : ''}`}>
                    {flag.text}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-14">
                  <div>
                    <p className="text-[0.7rem] tracking-[0.18em] uppercase text-graphite mb-5">
                      The per-seat stack
                    </p>
                    <ul className="divide-y divide-smoke">
                      {active.rows.map((row) => (
                        <li
                          key={row.label}
                          className="py-4 flex items-start justify-between gap-6"
                        >
                          <span>
                            <span className="block text-ink text-sm">{row.label}</span>
                            <span className="block text-graphite text-xs mt-1">{row.basis}</span>
                          </span>
                          <span className="text-ink text-sm whitespace-nowrap tabular-nums">
                            {money(row.annual)}
                            {amountSuffix === '/yr' ? '/yr' : ''}
                          </span>
                        </li>
                      ))}
                      <li className="py-4 flex items-baseline justify-between gap-6">
                        <span className="text-ink text-sm font-medium">
                          {stackLabel}
                        </span>
                        <span className="heading-display text-2xl text-ink whitespace-nowrap tabular-nums">
                          {money(stackTotal)}
                        </span>
                      </li>
                    </ul>
                    <p className="text-graphite text-xs mt-5 leading-relaxed max-w-md">
                      {active.footnote}
                    </p>
                  </div>

                  <div className="lg:border-l lg:border-smoke lg:pl-12">
                    <p className="text-[0.7rem] tracking-[0.18em] uppercase text-forest mb-5">
                      {active.ours ? 'Saved by working with us' : 'With us'}
                    </p>
                    {active.ours ? (
                      <>
                        <p className="heading-display text-4xl md:text-5xl text-forest leading-none">
                          {money(active.ours.value)}
                          <span className="text-lg text-graphite"> {active.ours.period}</span>
                        </p>
                        {active.ours.rows && (
                          <ul className="mt-6 divide-y divide-smoke">
                            {active.ours.rows.map((row) => (
                              <li
                                key={row.label}
                                className="py-3 flex items-start justify-between gap-6"
                              >
                                <span>
                                  <span className="block text-ink text-sm">{row.label}</span>
                                  <span className="block text-graphite text-xs mt-1">{row.basis}</span>
                                </span>
                                <span className="text-ink text-sm whitespace-nowrap tabular-nums">
                                  {money(row.amount)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-graphite text-sm mt-4 leading-relaxed">
                          {active.ours.body}
                        </p>
                      </>
                    ) : active.replacement ? (
                      <>
                        <p className="heading-display text-4xl md:text-5xl text-forest leading-none">
                          {money(active.replacement)}
                          <span className="text-lg text-graphite">/yr</span>
                        </p>
                        <p className="text-graphite text-sm mt-4 leading-relaxed">
                          Flat hosting plus the AI usage they actually used, replacing
                          every tool listed on the left.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="heading-display text-3xl text-forest leading-tight">
                          One flat hosting rate, plus usage.
                        </p>
                        <p className="text-graphite text-sm mt-4 leading-relaxed">
                          Unlimited staff logins, so the number on the left stops moving
                          every time you hire. AI is billed only if your team uses it.
                        </p>
                      </>
                    )}
                    {active.href && (
                      <Link to={active.href} className="link-arrow inline-block mt-7">
                        See the full breakdown &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <p className="text-graphite/70 text-xs mt-6 max-w-2xl leading-relaxed">
              {COST_MODEL_DISCLAIMER}
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
