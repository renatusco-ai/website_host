import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroGraphic from '../components/HeroGraphic';
import SectionReveal from '../components/SectionReveal';
import MagneticButton from '../components/MagneticButton';
import CaseStudyCard from '../components/CaseStudyCard';
import { CASE_STUDIES, VALUE_PILLARS } from '../data/content';

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
  const featuredStudies = CASE_STUDIES.slice(0, 3);

  return (
    <motion.div {...pageTransition}>
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.p
              className="section-eyebrow"
              {...fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              AI Workshops + Data Restructuring
            </motion.p>

            <motion.h1
              className="heading-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.02]"
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Understand AI.
              <br />
              Then <span className="italic text-forest">put it</span> to work.
            </motion.h1>

            <motion.p
              className="text-sage text-lg mt-8 max-w-md leading-relaxed"
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              Hands-on AI education and data restructuring that turn complexity into
              clarity — and insight into real impact.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-10"
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <MagneticButton>
                <Link to="/workshops" className="btn-gold">
                  Start with a Workshop
                </Link>
              </MagneticButton>
              <Link to="/services" className="link-arrow">
                Explore services &rarr;
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

      {/* Selected work */}
      <section className="section-shell section-shell--paper border-y border-mist">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Selected Work</p>
            <h2 className="heading-display text-4xl md:text-5xl text-ink mb-16 max-w-2xl">
              Real outcomes from restructured data
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredStudies.map((study, i) => (
              <CaseStudyCard key={study.id} study={study} index={i} compact />
            ))}
          </div>

          <SectionReveal delay={0.3}>
            <div className="mt-12">
              <Link to="/work" className="link-arrow">
                View all work &rarr;
              </Link>
            </div>
          </SectionReveal>
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
              Start with a workshop
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-cream/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Understand what AI can really do for your business — no technical
              background required — then build from there.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <MagneticButton>
                <Link to="/workshops" className="btn-gold">
                  Book an AI Workshop
                </Link>
              </MagneticButton>
              <Link
                to="/contact"
                className="text-cream/80 text-sm hover:text-gold-soft transition-colors"
              >
                Or get in touch &rarr;
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
