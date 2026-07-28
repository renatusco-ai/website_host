import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import MagneticButton from '../components/MagneticButton';
import CaseStudyCard from '../components/CaseStudyCard';
import DataReadout from '../components/DataReadout';
import { CASE_STUDIES } from '../data/content';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Portfolio() {
  return (
    <motion.div {...pageTransition}>
      {/* Hero */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Portfolio</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.04] max-w-4xl">
              Built to <span className="italic text-forest">deliver</span>.
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-sage text-lg mt-8 max-w-2xl leading-relaxed">
              Real projects, real outcomes. Every entry represents a complete
              solution: restructured data, automated workflows, and systems that run
              from day one. Client details anonymised.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Confidentiality notice */}
      <section className="px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <SectionReveal delay={0.25}>
            <div className="p-6 md:p-8 bg-paper border border-mist rounded-xl">
              <p className="text-ink text-sm md:text-base leading-relaxed">
                For client confidentiality, we don&rsquo;t publish screenshots of live
                systems online. Book a live demo and we can walk you through any of
                these projects in action.
              </p>
              <Link to="/contact" className="link-arrow mt-5 inline-flex">
                Book a live demo &rarr;
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Aggregate stats */}
      <section className="py-12 px-6 bg-paper border-y border-mist">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12">
          <DataReadout label="Projects delivered" value="40+" />
          <DataReadout label="Data sources unified" value="50+" />
          <DataReadout label="Workflows automated" value="200+" />
          <DataReadout label="Industries served" value="5" />
        </div>
      </section>

      {/* Case studies grid */}
      <section className="section-shell">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CASE_STUDIES.map((study, i) => (
              <CaseStudyCard key={study.id} study={study} index={i} linkable={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured deep-dive */}
      <section className="section-shell section-shell--paper border-t border-mist">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Featured Transformation</p>
            <h2 className="heading-display text-4xl md:text-5xl text-ink mb-8 max-w-3xl">
              From fragmented spreadsheets to a unified operations platform
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-12">
            <SectionReveal delay={0.1} className="md:col-span-7">
              <div className="space-y-6 text-sage leading-relaxed">
                <p>
                  A multi-location fitness operations company was running on a
                  patchwork of spreadsheets, disconnected CRM exports, and manual
                  processes. Member data lived in five different places. Coach
                  assignments were tracked by hand. Renewals were a quarterly
                  firefight.
                </p>
                <p>
                  We restructured everything, designing a unified data schema,
                  migrating historical records, building staff tools with individual
                  logins, deploying a member-facing app, and automating renewal
                  scoring. The result wasn&rsquo;t a tool they had to learn. It was an
                  operating system that replaced the chaos.
                </p>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.2} className="md:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                <DataReadout label="Data sources consolidated" value="12 → 1" />
                <DataReadout label="Manual processes eliminated" value="85%" />
                <DataReadout label="Renewal prediction accuracy" value="94%" />
                <DataReadout label="Staff adoption (week 1)" value="100%" />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-shell section-shell--forest">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="section-eyebrow" style={{ color: 'var(--color-gold-soft)' }}>
              Your Turn
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-cream mb-8">
              Ready for your transformation?
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-cream/70 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Every project starts with understanding your data. Book a workshop or
              reach out to discuss your specific challenges.
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
                Or discuss a project &rarr;
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
