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
    title: 'Intentionality',
    description:
      'Every system we build has a clear purpose. We don\'t automate for the sake of it — we architect with precision.',
  },
  {
    symbol: 'II',
    title: 'Transformation',
    description:
      'Incremental improvement isn\'t enough. We pursue fundamental change — taking what exists and making it extraordinary.',
  },
  {
    symbol: 'III',
    title: 'Craftsmanship',
    description:
      'Like the sculptors of antiquity, we believe exceptional work demands exceptional attention to detail.',
  },
  {
    symbol: 'IV',
    title: 'Partnership',
    description:
      'Your operations are unique. We embed ourselves in your world to build systems that truly belong there.',
  },
];

export default function About() {
  return (
    <motion.div {...pageTransition}>
      {/* ─── HERO ─── */}
      <section className="pt-40 pb-24 md:pt-52 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="label-upper text-gold mb-6">About Renatus</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-marble leading-tight max-w-4xl">
              Born from the belief that every brand deserves{' '}
              <span className="text-gold italic">intelligent</span> foundations
            </h1>
          </SectionReveal>
        </div>
      </section>

      {/* ─── BRAND STORY ─── */}
      <section className="py-24 md:py-32 px-6 border-t border-marble/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-4">
            <SectionReveal>
              <p className="label-upper text-stone mb-4">The Name</p>
              <h2 className="heading-display text-4xl md:text-5xl text-marble">
                Renatus
              </h2>
              <p
                className="text-gold mt-2 text-lg"
                style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
              >
                Latin: &ldquo;reborn, renewed&rdquo;
              </p>
            </SectionReveal>
          </div>

          <div className="md:col-span-8 md:col-start-5">
            <SectionReveal delay={0.1}>
              <div className="space-y-6 text-stone leading-relaxed">
                <p className="text-lg md:text-xl text-marble/90" style={{ fontFamily: 'var(--font-display)' }}>
                  We founded Renatus on a simple observation: the most ambitious
                  brands are held back not by a lack of vision, but by the weight
                  of their own operations.
                </p>
                <p>
                  Manual processes. Disconnected tools. Data locked in silos.
                  Decisions bottlenecked through overloaded teams. These aren&rsquo;t
                  just inefficiencies — they&rsquo;re barriers to the future your brand
                  is trying to reach.
                </p>
                <p>
                  Renatus exists to dismantle those barriers. We deploy intelligent
                  AI systems that don&rsquo;t just automate tasks — they fundamentally
                  rethink how your operations work. The result isn&rsquo;t a faster
                  version of the old way. It&rsquo;s something entirely new.
                </p>
                <p>
                  Our name carries intent. <em>Renatus</em> — to be reborn. Not a
                  minor upgrade, not a patch. A genuine transformation of the
                  systems that power your brand, rebuilt from the ground up with
                  intelligence woven into every layer.
                </p>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── PHILOSOPHY ─── */}
      <section className="py-32 md:py-44 px-6 bg-obsidian">
        <div className="max-w-4xl mx-auto text-center">
          <SectionReveal>
            <p
              className="heading-display text-3xl sm:text-4xl md:text-5xl text-marble leading-snug"
            >
              The ancients built monuments that lasted millennia.{' '}
              <span className="text-gold">We build systems with the same ambition.</span>
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="label-upper text-gold mb-16">Our Principles</p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-marble/5">
            {VALUES.map((value, i) => (
              <SectionReveal key={value.symbol} delay={i * 0.1}>
                <div className="bg-black p-10 md:p-14 group hover:bg-obsidian transition-colors duration-500">
                  <span className="heading-display text-4xl text-marble/10 group-hover:text-gold/20 transition-colors duration-500 block mb-6">
                    {value.symbol}
                  </span>
                  <h3 className="heading-display text-2xl md:text-3xl text-marble mb-4">
                    {value.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed max-w-md">
                    {value.description}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM PLACEHOLDER ─── */}
      <section className="py-24 md:py-32 px-6 border-t border-marble/5">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="label-upper text-stone/50 mb-6">The Team</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <p
              className="heading-display text-2xl md:text-3xl text-marble/60 leading-relaxed"
            >
              A collective of strategists, engineers, and designers united by a
              conviction that intelligent automation is the next chapter of brand
              excellence.
            </p>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
