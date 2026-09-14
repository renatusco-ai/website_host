import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import EnquireNowButton from '../components/EnquireNowButton';
import { CASE_STUDIES, LOCKEROOM_CASE } from '../data/content';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const money = (value) =>
  value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function LockeroomCaseStudy() {
  const { groups, subtotal, newCosts, net, secondary, headline } = LOCKEROOM_CASE;

  const workstreams = LOCKEROOM_CASE.workstreams
    .map((id) => CASE_STUDIES.find((study) => study.id === id))
    .filter(Boolean);

  return (
    <motion.div {...pageTransition}>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/portfolio" className="text-sage text-sm hover:text-forest transition-colors">
            &larr; All work
          </Link>

          <p className="section-eyebrow mt-10">Case Study &middot; {LOCKEROOM_CASE.sector}</p>

          <img
            src={LOCKEROOM_CASE.logo}
            alt="Lockeroom logo"
            className="h-12 sm:h-16 md:h-20 w-auto mt-6"
          />

          <h1 className="heading-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] mt-10 max-w-3xl">
            {LOCKEROOM_CASE.tagline}
          </h1>

          <p className="text-sage text-lg mt-8 max-w-2xl leading-relaxed">
            {LOCKEROOM_CASE.summary}
          </p>
        </div>
      </section>

      {/* Headline number */}
      <section className="px-6 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="p-8 md:p-12 bg-forest rounded-2xl">
              <p
                className="text-[0.7rem] tracking-[0.18em] uppercase mb-5"
                style={{ color: 'var(--color-gold-soft)' }}
              >
                {headline.label}
              </p>
              <p className="heading-display text-6xl sm:text-7xl md:text-8xl text-cream leading-none">
                {headline.value}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-10 border-t border-cream/15">
                {secondary.map((stat) => (
                  <div key={stat.label}>
                    <p className="heading-display text-3xl text-gold-soft leading-none">
                      {stat.value}
                    </p>
                    <p className="text-cream/60 text-xs mt-3 leading-relaxed">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Where the saving came from */}
      <section className="section-shell bg-paper border-y border-mist">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Where It Came From</p>
            <h2 className="heading-display text-3xl md:text-4xl text-ink max-w-2xl mb-12">
              Two streams, one system
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {groups.map((group, index) => (
              <SectionReveal key={group.id} delay={index * 0.1}>
                <div className="h-full p-8 bg-cream border border-mist rounded-xl">
                  <h3 className="heading-display text-2xl text-ink mb-3">{group.title}</h3>
                  <p className="heading-display text-4xl text-forest leading-none mb-1">
                    {group.annual.toLocaleString('en-AU', {
                      style: 'currency',
                      currency: 'AUD',
                      maximumFractionDigits: 0,
                    })}
                    <span className="text-base text-sage">/yr</span>
                  </p>
                  <p className="text-sage text-xs mb-6">
                    {group.monthly.toLocaleString('en-AU', {
                      style: 'currency',
                      currency: 'AUD',
                      maximumFractionDigits: 0,
                    })}{' '}
                    per month
                  </p>
                  <p className="text-sage text-sm leading-relaxed mb-6">{group.description}</p>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-ink/70 text-sm flex gap-3">
                        <span className="text-gold">&mdash;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionReveal>
            ))}
          </div>

          {/* Reconciliation */}
          <SectionReveal delay={0.2}>
            <div className="mt-12 p-8 md:p-10 bg-cream border border-mist rounded-2xl overflow-x-auto">
              <table className="savings-table">
                <thead>
                  <tr>
                    <th scope="col">Savings stream</th>
                    <th scope="col">Monthly</th>
                    <th scope="col">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id}>
                      <td>{group.title}</td>
                      <td className="tabular-nums">{money(group.monthly)}</td>
                      <td className="tabular-nums">{money(group.annual)}</td>
                    </tr>
                  ))}
                  <tr className="savings-table__total">
                    <td>Subtotal removed</td>
                    <td className="tabular-nums">{money(subtotal.monthly)}</td>
                    <td className="tabular-nums">{money(subtotal.annual)}</td>
                  </tr>
                  <tr className="savings-table__deduct">
                    <td>
                      {newCosts.label}
                      <span className="block text-xs mt-1">{newCosts.note}</span>
                    </td>
                    <td className="tabular-nums">({money(newCosts.monthly)})</td>
                    <td className="tabular-nums">({money(newCosts.annual)})</td>
                  </tr>
                  <tr className="savings-table__net">
                    <td>Net annual saving</td>
                    <td className="tabular-nums">{money(net.monthly)}</td>
                    <td className="tabular-nums">{money(net.annual)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* What we built */}
      <section className="section-shell">
        <div className="max-w-6xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">What We Built</p>
            <h2 className="heading-display text-3xl md:text-4xl text-ink max-w-2xl mb-4">
              The system that replaced the stack
            </h2>
            <p className="text-sage text-lg mb-12 max-w-2xl leading-relaxed">
              Seven connected workstreams, built on one restructured database, so member,
              coach, programming, and billing data all describe the same reality.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workstreams.map((study, index) => (
              <SectionReveal key={study.id} delay={(index % 3) * 0.08}>
                <div className="h-full p-7 bg-paper border border-mist rounded-xl">
                  <p className="text-[0.65rem] tracking-[0.16em] uppercase text-gold mb-4">
                    {study.industry}
                  </p>
                  <h3 className="heading-display text-xl text-ink mb-3">{study.title}</h3>
                  <p className="text-sage text-sm leading-relaxed">{study.outcome}</p>
                  {study.metrics && (
                    <p className="text-forest text-sm mt-5">
                      <span className="heading-display text-lg">{study.metrics.value}</span>{' '}
                      <span className="text-sage text-xs">{study.metrics.label}</span>
                    </p>
                  )}
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-shell section-shell--forest">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <h2 className="heading-display text-4xl sm:text-5xl text-cream mb-8">
              What is your stack costing you?
            </h2>
            <p className="text-cream/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Most businesses have never added it up. We will, and we will tell you
              honestly whether rebuilding is worth it for you.
            </p>
            <EnquireNowButton className="btn-gold" />
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
