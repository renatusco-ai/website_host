import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import MagneticButton from '../components/MagneticButton';
import PricingCard from '../components/PricingCard';
import EntryOfferCard from '../components/EntryOfferCard';
import { TIERS, PROCESS_STEPS, ENTRY_OFFERS } from '../data/content';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Services() {
  return (
    <motion.div {...pageTransition}>
      {/* Hero */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Services</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.04] max-w-4xl">
              Solutions, <span className="italic text-forest">not tools</span>.
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-sage text-lg mt-8 max-w-2xl leading-relaxed">
              We don&rsquo;t hand you software and walk away. Every engagement
              delivers a working solution — restructured data, automated workflows,
              and the knowledge your team needs to drive it.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Low-friction entry offers */}
      <section className="section-shell section-shell--paper border-y border-mist">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Where To Start</p>
            <h2 className="heading-display text-4xl md:text-5xl text-ink mb-4 max-w-2xl">
              We know how this works. Here&rsquo;s how to start, low-pressure.
            </h2>
            <p className="text-sage max-w-2xl mb-16 leading-relaxed">
              No hard sell, no hidden numbers until you ask. Pick the entry point
              that matches how ready you are.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ENTRY_OFFERS.map((offer, i) => (
              <EntryOfferCard key={offer.id} offer={offer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-shell">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">How We Work</p>
            <h2 className="heading-display text-4xl md:text-5xl text-ink mb-20">
              The Process
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {PROCESS_STEPS.map((step, i) => (
              <SectionReveal key={step.phase} delay={i * 0.15}>
                <div className="relative">
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-mist to-transparent" />
                  )}
                  <p className="label-upper text-gold mb-4">{step.phase}</p>
                  <h3 className="heading-display text-3xl md:text-4xl text-ink mb-4">
                    {step.title}
                  </h3>
                  <p className="text-sage text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="section-shell section-shell--paper border-y border-mist">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Service Tiers</p>
            <h2 className="heading-display text-4xl md:text-5xl text-ink mb-4">
              How We Transform Your Business
            </h2>
            <p className="text-sage max-w-2xl mb-16 leading-relaxed">
              From spreadsheet clean-up to enterprise transformation — every tier
              delivers a complete solution, not a tool to figure out on your own.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {TIERS.map((tier, i) => (
              <PricingCard key={tier.id} tier={tier} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section className="section-shell">
        <div className="max-w-4xl mx-auto text-center">
          <SectionReveal>
            <p className="heading-display text-3xl sm:text-4xl md:text-5xl text-ink leading-snug">
              Your data is the foundation.{' '}
              <span className="text-gold">We make it AI-ready.</span>
            </p>
          </SectionReveal>
          <SectionReveal delay={0.15}>
            <p className="text-sage text-lg mt-8 max-w-2xl mx-auto leading-relaxed">
              Most AI projects fail because the data underneath is a mess. We start
              by restructuring — cleaning CRMs, unifying databases, connecting
              siloed systems — so every automation and AI agent has something solid
              to build on.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section-shell section-shell--forest">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="section-eyebrow" style={{ color: 'var(--color-gold-soft)' }}>
              Not Sure Where to Start?
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-cream mb-8">
              Start with a workshop
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-cream/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Our AI workshops are the perfect entry point. Understand what&rsquo;s
              possible, then choose the tier that fits.
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
                Or discuss your project &rarr;
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
