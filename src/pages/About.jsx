import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const VALUES = [
  {
    symbol: 'I',
    title: 'Solutions, Not Tools',
    description:
      'We deliver working systems, not software licenses. Every engagement ends with something that runs — not something you have to figure out.',
  },
  {
    symbol: 'II',
    title: 'Data First',
    description:
      'AI is only as good as the data underneath it. We restructure, clean, and connect your business data before building anything on top.',
  },
  {
    symbol: 'III',
    title: 'Education Built In',
    description:
      'We teach your team to understand and use what we build. A solution nobody knows how to drive isn\'t really a solution.',
  },
  {
    symbol: 'IV',
    title: 'Partnership',
    description:
      'Your operations are unique. We embed ourselves in your world to build systems that truly belong there — not generic templates.',
  },
];

export default function About() {
  return (
    <motion.div {...pageTransition}>
      {/* Hero */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">About Renatus</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.08] max-w-4xl">
              A service on the outside.{' '}
              <span className="italic text-forest">A tech company on the inside.</span>
            </h1>
          </SectionReveal>
        </div>
      </section>

      {/* Brand story */}
      <section className="section-shell section-shell--paper border-y border-mist">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-4">
            <SectionReveal>
              <p className="label-upper mb-4">The Name</p>
              <h2 className="heading-display text-4xl md:text-5xl text-ink">
                Renatus
              </h2>
              <p className="text-gold mt-2 text-lg italic" style={{ fontFamily: 'var(--font-display)' }}>
                Latin: &ldquo;reborn, renewed&rdquo;
              </p>
            </SectionReveal>
          </div>

          <div className="md:col-span-8 md:col-start-5">
            <SectionReveal delay={0.1}>
              <div className="space-y-6 text-sage leading-relaxed">
                <p className="text-lg md:text-xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
                  We founded Renatus on a simple observation: the biggest barrier to
                  AI adoption isn&rsquo;t the technology — it&rsquo;s the data
                  underneath it.
                </p>
                <p>
                  Every week, another AI tool launches. Businesses buy subscriptions,
                  attend demos, and then stall — because their CRM is a mess, their
                  spreadsheets don&rsquo;t talk to each other, and nobody knows where
                  to start.
                </p>
                <p>
                  Renatus exists to fix that. We restructure business data, automate
                  workflows, and teach teams to use AI — delivering complete
                  solutions, not tools to figure out alone. We look like a service
                  business on the outside. On the inside, we&rsquo;re engineers,
                  architects, and educators building systems that actually work.
                </p>
                <p>
                  Our name carries intent. <em>Renatus</em> — to be reborn. Not a
                  minor upgrade. A genuine restructuring of the data and systems that
                  power your business, rebuilt with intelligence woven into every
                  layer.
                </p>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-shell section-shell--forest">
        <div className="max-w-4xl mx-auto text-center">
          <SectionReveal>
            <p className="heading-display text-3xl sm:text-4xl md:text-5xl text-cream leading-snug">
              The AI industry sells tools.{' '}
              <span className="text-gold-soft">We deliver solutions.</span>
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Values */}
      <section className="section-shell">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Our Principles</p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {VALUES.map((value, i) => (
              <SectionReveal key={value.symbol} delay={i * 0.1}>
                <div className="h-full bg-paper border border-mist rounded-xl p-10 md:p-12">
                  <span className="heading-display text-3xl text-gold block mb-6">
                    {value.symbol}
                  </span>
                  <h3 className="heading-display text-2xl md:text-3xl text-ink mb-4">
                    {value.title}
                  </h3>
                  <p className="text-sage text-sm leading-relaxed max-w-md">
                    {value.description}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-shell section-shell--paper border-t border-mist">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="label-upper mb-6">The Team</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <p className="heading-display text-2xl md:text-3xl text-ink/70 leading-relaxed">
              Strategists, engineers, and educators united by one conviction: AI only
              works when the data foundation is right — and the people behind it know
              how to use it.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <Link to="/workshops" className="btn-gold mt-10 inline-flex">
              Start with a workshop
            </Link>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
