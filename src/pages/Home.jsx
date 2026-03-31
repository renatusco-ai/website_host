import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroScene from '../components/HeroScene';
import LightShafts from '../components/LightShafts';
import SectionReveal from '../components/SectionReveal';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const VALUE_PROPS = [
  {
    number: '01',
    title: 'Intelligent Workflows',
    description:
      'AI agents that understand your operations and automate repetitive processes — from data entry to decision routing.',
  },
  {
    number: '02',
    title: 'Systems Architecture',
    description:
      'Custom-built automation infrastructure that connects your tools, centralises your data, and eliminates manual handoffs.',
  },
  {
    number: '03',
    title: 'Continuous Optimisation',
    description:
      'Self-improving systems that learn from every interaction, surfacing insights and tightening efficiency over time.',
  },
];

export default function Home() {
  return (
    <motion.div {...pageTransition}>
      {/* ─── FIXED 3D BACKGROUND ─── */}
      <div className="fixed inset-0 z-0">
        <HeroScene />
      </div>
      
      {/* ─── LIGHT SHAFTS (margins only) ─── */}
      <LightShafts />

      {/* ─── HERO ─── */}
      <section className="relative z-10 h-screen flex items-center justify-center overflow-hidden pointer-events-none">
        {/* Radial overlay for text readability */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.2) 50%, transparent 80%)',
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pointer-events-auto">
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.p variants={fadeUp} className="label-upper mb-6 text-gold">
              AI Operations Automation
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="heading-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-marble mb-6"
            >
              RENATUS
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-stone text-lg md:text-xl font-light max-w-xl mx-auto mb-10 leading-relaxed"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
            >
              Your Brand Reborn through AI Automation
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-5">
              <Link to="/contact" className="btn-gold">
                Book a Demo
              </Link>
              <Link to="/services" className="btn-ghost">
                Our Services
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <span className="label-upper text-[0.6rem] text-stone/50">Scroll</span>
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-stone/50 to-transparent"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      {/* ─── PHILOSOPHY STRIP ─── */}
      <section className="relative z-10 py-32 md:py-44 px-6 bg-black/40 backdrop-blur-[2px]">
        <div className="max-w-5xl mx-auto text-center">
          <SectionReveal>
            <p className="heading-display text-3xl sm:text-4xl md:text-5xl text-marble leading-snug">
              Every great brand was built on systems.{' '}
              <span className="text-gold">We make those systems intelligent.</span>
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ─── VALUE PROPOSITIONS ─── */}
      <section className="relative z-10 py-24 md:py-32 px-6 bg-black/65 backdrop-blur-[4px]">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="label-upper text-gold mb-16 text-center md:text-left">
              What We Deliver
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-marble/5">
            {VALUE_PROPS.map((item, i) => (
              <SectionReveal key={item.number} delay={i * 0.12}>
                <div className="bg-black/80 backdrop-blur-sm p-8 md:p-12 group hover:bg-obsidian transition-colors duration-500 h-full">
                  <span className="heading-display text-5xl md:text-6xl text-marble/10 group-hover:text-gold/20 transition-colors duration-500 block mb-8">
                    {item.number}
                  </span>
                  <h3 className="heading-display text-2xl md:text-3xl text-marble mb-4">
                    {item.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST / SOCIAL PROOF ─── */}
      <section className="relative z-10 py-24 md:py-32 px-6 bg-black border-t border-b border-marble/5">
        <div className="max-w-4xl mx-auto text-center">
          <SectionReveal>
            <p className="label-upper text-stone/50 mb-10">Trusted By</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <div className="flex items-center justify-center gap-12 md:gap-20 flex-wrap opacity-30">
              {['AXIOM', 'VECTRAL', 'ONYX', 'MERIDIAN', 'CAELUS'].map(
                (name) => (
                  <span
                    key={name}
                    className="heading-display text-xl md:text-2xl text-marble tracking-widest"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <blockquote className="mt-20 max-w-2xl mx-auto">
              <p
                className="text-xl md:text-2xl text-marble/80 leading-relaxed mb-6"
                style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
              >
                &ldquo;Renatus didn&rsquo;t just automate our workflows — they
                reimagined them. The efficiency gains were transformative.&rdquo;
              </p>
              <footer className="label-upper text-stone">
                — Operations Director, Axiom Group
              </footer>
            </blockquote>
          </SectionReveal>
        </div>
      </section>

      {/* ─── FOOTER CTA ─── */}
      <section className="relative z-10 py-32 md:py-44 px-6 bg-black">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="label-upper text-gold mb-6">Ready?</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-marble mb-8">
              Let&rsquo;s Rebuild What&rsquo;s Possible
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-stone text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Book a consultation and discover how intelligent automation can
              transform your operations from the ground up.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.3}>
            <Link to="/contact" className="btn-gold">
              Book a Demo
            </Link>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
