import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import BookDemoForm from '../components/BookDemoForm';
import SchedulingEmbed from '../components/SchedulingEmbed';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Contact() {
  return (
    <motion.div {...pageTransition}>
      {/* Hero */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Contact</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.04] max-w-4xl">
              Let&rsquo;s start a{' '}
              <span className="italic text-forest">conversation</span>.
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-sage text-lg mt-8 max-w-2xl leading-relaxed">
              Book an AI workshop to understand what&rsquo;s possible, or reach out to
              discuss a full data restructuring project. Every engagement starts with
              listening.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Workshop prompt */}
      <section className="py-12 px-6 bg-paper border-y border-mist">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="label-upper text-gold mb-2">New here?</p>
            <p className="text-ink text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Start with our beginner-friendly AI workshop
            </p>
          </div>
          <Link to="/workshops" className="btn-gold shrink-0">
            Book a Workshop
          </Link>
        </div>
      </section>

      {/* Form + scheduling */}
      <section className="section-shell">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          <div className="lg:col-span-7">
            <SectionReveal>
              <p className="section-eyebrow">Get in Touch</p>
              <BookDemoForm />
            </SectionReveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 space-y-12">
            <SectionReveal delay={0.15}>
              <SchedulingEmbed title="Schedule a call" />
            </SectionReveal>

            <SectionReveal delay={0.2}>
              <div className="space-y-8">
                <div>
                  <p className="label-upper mb-4">Email</p>
                  <a
                    href="mailto:hello@renatus.ai"
                    className="text-ink text-lg hover:text-gold transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    hello@renatus.ai
                  </a>
                </div>

                <div>
                  <p className="label-upper mb-4">Response Time</p>
                  <p className="text-ink text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                    Within 24 hours
                  </p>
                </div>

                <div>
                  <p className="label-upper mb-4">What to Expect</p>
                  <ul className="space-y-3">
                    {[
                      'A discovery call tailored to your needs',
                      'Data and operations assessment',
                      'Clear recommendation — workshop or service tier',
                      'Transparent pricing — no surprises',
                    ].map((item) => (
                      <li key={item} className="text-sage text-sm flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="section-shell section-shell--forest relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <SectionReveal>
            <p className="heading-display text-3xl sm:text-4xl md:text-5xl text-cream/80 leading-snug">
              &ldquo;The secret of change is to focus all of your energy not on
              fighting the old, but on{' '}
              <span className="text-gold-soft">building the new.</span>&rdquo;
            </p>
            <p className="label-upper mt-8" style={{ color: 'rgba(246,242,234,0.4)' }}>
              &mdash; Socrates
            </p>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
