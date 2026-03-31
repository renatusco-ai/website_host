import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import BookDemoForm from '../components/BookDemoForm';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Contact() {
  return (
    <motion.div {...pageTransition}>
      {/* ─── HERO ─── */}
      <section className="pt-40 pb-24 md:pt-52 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="label-upper text-gold mb-6">Contact</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-marble leading-tight max-w-4xl">
              Let&rsquo;s start a{' '}
              <span className="text-gold italic">conversation</span>
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-stone text-lg mt-8 max-w-2xl leading-relaxed">
              Book a demo to see how Renatus can transform your operations, or
              simply reach out to discuss your needs.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ─── FORM + DETAILS ─── */}
      <section className="py-24 md:py-32 px-6 border-t border-marble/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          {/* Form */}
          <div className="lg:col-span-7">
            <SectionReveal>
              <p className="label-upper text-marble mb-8">Book a Demo</p>
              <BookDemoForm />
            </SectionReveal>
          </div>

          {/* Contact details */}
          <div className="lg:col-span-4 lg:col-start-9">
            <SectionReveal delay={0.15}>
              <div className="space-y-12">
                <div>
                  <p className="label-upper text-stone mb-4">Email</p>
                  <a
                    href="mailto:hello@renatus.ai"
                    className="text-marble text-lg hover:text-gold transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    hello@renatus.ai
                  </a>
                </div>

                <div>
                  <p className="label-upper text-stone mb-4">Response Time</p>
                  <p
                    className="text-marble text-lg"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Within 24 hours
                  </p>
                </div>

                <div>
                  <p className="label-upper text-stone mb-4">What to Expect</p>
                  <ul className="space-y-3">
                    {[
                      'A 30-minute discovery call',
                      'Operational assessment',
                      'Custom automation roadmap',
                      'Clear pricing — no surprises',
                    ].map((item) => (
                      <li key={item} className="text-stone text-sm flex items-start gap-3">
                        <span className="w-1 h-1 rounded-full bg-gold mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 border-t border-marble/5">
                  <p className="label-upper text-stone/50 mb-4">Follow</p>
                  <div className="flex gap-6">
                    {['LinkedIn', 'Twitter'].map((platform) => (
                      <a
                        key={platform}
                        href="#"
                        className="text-stone text-sm hover:text-gold transition-colors"
                      >
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── DECORATIVE ACCENT ─── */}
      <section className="py-32 md:py-44 px-6 bg-obsidian relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)',
            }}
          />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <SectionReveal>
            <p
              className="heading-display text-3xl sm:text-4xl md:text-5xl text-marble/60 leading-snug"
            >
              &ldquo;The secret of change is to focus all of your energy not on
              fighting the old, but on{' '}
              <span className="text-gold">building the new.</span>&rdquo;
            </p>
            <p className="label-upper text-stone/40 mt-8">— Socrates</p>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
