import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroGraphic from '../components/HeroGraphic';
import SectionReveal from '../components/SectionReveal';
import BookDiscoveryButton from '../components/BookDiscoveryButton';
import { VALUE_PILLARS } from '../data/content';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <motion.div {...pageTransition}>
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.h1
              className="heading-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.02]"
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Getting your business <span className="italic text-forest">ready for AI</span>.
            </motion.h1>

            <motion.p
              className="text-sage text-lg mt-8 max-w-xl leading-relaxed"
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              We fix broken business systems using AI, built on real operational
              experience, so you never have to touch the tech.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-10"
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <BookDiscoveryButton />
              <Link to="/contact" className="link-arrow">
                Learn more &rarr;
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="order-first lg:order-last"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroGraphic />
          </motion.div>
        </div>
      </section>

      {/* Simple manifesto line */}
      <section className="px-6 py-16 md:py-20 bg-paper border-y border-mist">
        <div className="max-w-4xl mx-auto text-center">
          <SectionReveal>
            <p className="heading-display text-3xl sm:text-4xl text-ink leading-snug">
              We deliver solutions, not tools.
            </p>
            <p className="text-sage text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
              A service on the outside, a tech company on the inside. We restructure
              your data, automate the busywork, and teach your team to use AI with
              confidence.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Three simple pillars */}
      <section className="section-shell">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">What We Do</p>
            <h2 className="heading-display text-4xl md:text-5xl text-ink mb-16 max-w-2xl">
              Three steps, one clear outcome
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUE_PILLARS.map((pillar, i) => (
              <SectionReveal key={pillar.number} delay={i * 0.1}>
                <div className="h-full p-8 bg-paper border border-mist rounded-xl">
                  <span className="heading-display text-2xl text-gold block mb-5">
                    {pillar.number}
                  </span>
                  <h3 className="heading-display text-2xl text-ink mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sage text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-shell section-shell--forest">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="section-eyebrow" style={{ color: 'var(--color-gold-soft)' }}>
              Ready?
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-cream mb-8">
              Book a Free AI &amp; Ops Diagnostic
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-cream/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Tell us what is broken and we will tell you honestly whether we can fix
              it. Intro sessions are reserved for businesses generating over $1M in
              annual revenue.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <BookDiscoveryButton className="btn-gold" />
              <Link
                to="/portfolio"
                className="text-cream/80 text-sm hover:text-gold-soft transition-colors"
              >
                View our portfolio &rarr;
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
