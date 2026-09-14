import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroGraphic from '../components/HeroGraphic';
import SectionReveal from '../components/SectionReveal';
import BookDiscoveryButton from '../components/BookDiscoveryButton';
import ClientLogoWall from '../components/ClientLogoWall';
import CostComparison from '../components/CostComparison';

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

      <ClientLogoWall />

      <CostComparison />

      {/* Closing CTA */}
      <section className="section-shell section-shell--forest">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="section-eyebrow" style={{ color: 'var(--color-gold-soft)' }}>
              How we choose work
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-cream mb-8">
              We only take projects where the savings can be quantified.
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-cream/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              If we cannot show a substantial, measurable reduction in what you are
              paying to rent software, we will not take the work. A subscription
              audit is how we find out.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <BookDiscoveryButton
                className="btn-gold"
                bookingType="subscriptionAudit"
              >
                Book a Subscription Audit
              </BookDiscoveryButton>
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
