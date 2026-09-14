import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import EnquireNowButton from '../components/EnquireNowButton';
import { COST_EXAMPLES, LOCKEROOM_CASE } from '../data/content';

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
    maximumFractionDigits: 0,
  });

function ProofCard({ example, featured = false }) {
  const stackTotal = example.rows.reduce((sum, row) => sum + row.annual, 0);
  const amountSuffix = example.amountSuffix ?? '/yr';

  return (
    <div
      className={`h-full p-8 md:p-10 rounded-2xl border ${
        featured ? 'bg-cream border-forest/20' : 'bg-paper border-mist'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
        <p className="text-[0.7rem] tracking-[0.18em] uppercase text-gold">
          {featured ? 'Documented savings' : 'Potential'}
        </p>
        {example.status === 'documented' && (
          <span className="cost-flag cost-flag--verified">
            Documented &middot; {example.client}
          </span>
        )}
        {example.status === 'modelled' && (
          <span className="cost-flag cost-flag--verified">
            Modelled &middot; {example.client}
          </span>
        )}
        {example.status === 'indicative' && (
          <span className="cost-flag">Indicative list pricing</span>
        )}
      </div>

      <h2 className="heading-display text-3xl text-ink mb-2">{example.label}</h2>
      <p className="text-sage text-sm mb-8">{example.context}</p>

      {example.ours && (
        <p className="heading-display text-4xl md:text-5xl text-forest leading-none mb-8">
          {money(example.ours.value)}
          <span className="text-lg text-sage"> {example.ours.period}</span>
        </p>
      )}

      <ul className="divide-y divide-mist mb-6">
        {example.rows.map((row) => (
          <li key={row.label} className="py-3 flex items-start justify-between gap-6">
            <span>
              <span className="block text-ink text-sm">{row.label}</span>
              <span className="block text-sage text-xs mt-1">{row.basis}</span>
            </span>
            <span className="text-ink text-sm whitespace-nowrap tabular-nums">
              {money(row.annual)}
              {amountSuffix === '/yr' ? '/yr' : ''}
            </span>
          </li>
        ))}
        <li className="py-3 flex items-baseline justify-between gap-6">
          <span className="text-ink text-sm font-medium">
            {example.stackLabel ?? 'Every year, before anything else'}
          </span>
          <span className="heading-display text-xl text-ink tabular-nums">
            {money(stackTotal)}
          </span>
        </li>
      </ul>

      <p className="text-sage text-xs leading-relaxed">{example.footnote}</p>

      {example.href && (
        <Link to={example.href} className="link-arrow inline-block mt-7">
          Read the full case study &rarr;
        </Link>
      )}
    </div>
  );
}

export default function Portfolio() {
  const lockeroom = COST_EXAMPLES.find((example) => example.id === 'fitness');
  const marketing = COST_EXAMPLES.find((example) => example.id === 'marketing');
  const potentials = COST_EXAMPLES.filter(
    (example) => example.id !== 'fitness' && example.id !== 'marketing',
  );

  return (
    <motion.div {...pageTransition}>
      <section className="pt-36 pb-16 md:pt-44 md:pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Portfolio</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.04] max-w-4xl">
              Savings we can <span className="italic text-forest">show</span>,
              and savings we can model.
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-sage text-lg mt-8 max-w-2xl leading-relaxed">
              Lockeroom is delivered work with documented numbers. Marketing is a
              modelled stack review. The rest are indicative, so you can see the
              shape of the same problem in other industries.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="p-8 md:p-12 bg-forest rounded-2xl">
              <p
                className="text-[0.7rem] tracking-[0.18em] uppercase mb-5"
                style={{ color: 'var(--color-gold-soft)' }}
              >
                Flagship &middot; {LOCKEROOM_CASE.sector}
              </p>
              <img
                src={LOCKEROOM_CASE.logo}
                alt="Lockeroom logo"
                className="h-10 sm:h-12 w-auto mb-8"
              />
              <p className="heading-display text-5xl sm:text-6xl text-cream leading-none">
                {LOCKEROOM_CASE.headline.value}
              </p>
              <p className="text-cream/70 text-sm mt-4 max-w-md leading-relaxed">
                {LOCKEROOM_CASE.headline.label}. {LOCKEROOM_CASE.tagline}
              </p>
              <Link
                to="/portfolio/lockeroom"
                className="inline-block mt-8 text-gold-soft text-sm hover:text-cream transition-colors"
              >
                Read the Lockeroom case study &rarr;
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="section-shell">
        <div className="max-w-6xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">The numbers</p>
            <h2 className="heading-display text-3xl md:text-4xl text-ink mb-12 max-w-2xl">
              Documented first. Potential next.
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {lockeroom && (
              <SectionReveal>
                <ProofCard example={lockeroom} featured />
              </SectionReveal>
            )}
            {marketing && (
              <SectionReveal delay={0.1}>
                <ProofCard example={marketing} />
              </SectionReveal>
            )}
          </div>

          {potentials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {potentials.map((example, index) => (
                <SectionReveal key={example.id} delay={index * 0.08}>
                  <ProofCard example={example} />
                </SectionReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-shell section-shell--forest">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <h2 className="heading-display text-4xl sm:text-5xl text-cream mb-8">
              What is your stack costing you?
            </h2>
            <p className="text-cream/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              If we cannot show a substantial, measurable saving, we will not take
              the work. Enquire and we will tell you which conversation to have.
            </p>
            <EnquireNowButton className="btn-gold" />
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
