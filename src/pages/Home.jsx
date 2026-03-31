import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroScene from '../components/HeroScene';
import LightShafts from '../components/LightShafts';
import SectionReveal from '../components/SectionReveal';
import MagneticButton from '../components/MagneticButton';
import AnimatedCounter from '../components/AnimatedCounter';
import SplitText from '../components/SplitText';
import HorizontalScroll from '../components/HorizontalScroll';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};



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
          <motion.p
            className="label-upper mb-6 text-gold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            AI Operations Automation
          </motion.p>

          <SplitText
            text="RENATUS"
            className="heading-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-marble mb-6"
          />

          <motion.p
            className="text-stone text-lg md:text-xl font-light max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Your Brand Reborn through AI Automation
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <MagneticButton>
              <Link to="/contact" className="btn-gold">
                Book a Demo
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/services" className="btn-ghost">
                Our Services
              </Link>
            </MagneticButton>
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

      {/* ─── METRICS / PROOF ─── */}
      <section className="relative z-10 py-24 px-6 bg-black/80 backdrop-blur-md border-y border-marble/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-marble/10">
          <SectionReveal delay={0.1}>
            <div className="pt-8 md:pt-0">
              <AnimatedCounter
                value={97}
                suffix="%"
                duration={2.5}
                className="heading-display text-6xl md:text-7xl text-gold block mb-4"
              />
              <p className="label-upper text-stone">Client Retention</p>
            </div>
          </SectionReveal>
          
          <SectionReveal delay={0.2}>
            <div className="pt-16 md:pt-0">
              <AnimatedCounter
                value={3.2}
                suffix="x"
                decimals={1}
                duration={2}
                className="heading-display text-6xl md:text-7xl text-gold block mb-4"
              />
              <p className="label-upper text-stone">Avg. Efficiency Gain</p>
            </div>
          </SectionReveal>
          
          <SectionReveal delay={0.3}>
            <div className="pt-16 md:pt-0">
              <AnimatedCounter
                value={40}
                suffix="+"
                duration={2}
                className="heading-display text-6xl md:text-7xl text-gold block mb-4"
              />
              <p className="label-upper text-stone">Systems Deployed</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ─── VALUE PROPOSITIONS (horizontal scroll) ─── */}
      <HorizontalScroll />

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
            <MagneticButton>
              <Link to="/contact" className="btn-gold">
                Book a Demo
              </Link>
            </MagneticButton>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
