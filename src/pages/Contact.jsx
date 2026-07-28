import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import BookDemoForm from '../components/BookDemoForm';
import BookDiscoveryButton from '../components/BookDiscoveryButton';
import { useBooking } from '../context/BookingContext';
import { CONTACT_EMAIL } from '../data/content';

const VALID_INTENTS = ['scoping', 'strategy', 'general'];

const PREP_ITEMS = [
  'Your biggest operational pain points',
  'Where manual work or broken systems are slowing the team down',
  'Roughly what it is costing you in time, money, or missed opportunity',
];

const AUDIT_BENEFITS = [
  'A 60-minute deep-dive into your operations and systems',
  'A prioritised list of what to fix first, and what to leave alone',
  'AI and automation opportunities mapped to your business',
  'A written action plan you keep, whether or not you work with us',
];

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Contact() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openBooking } = useBooking();
  const intentParam = searchParams.get('intent');
  const defaultIntent = VALID_INTENTS.includes(intentParam) ? intentParam : 'general';

  useEffect(() => {
    const bookParam = searchParams.get('book');
    const intent = searchParams.get('intent');

    let type = null;
    if (bookParam === 'discovery' || intent === 'scoping') type = 'discovery';
    if (bookParam === 'audit' || intent === 'strategy') type = 'audit';

    if (!type) return;

    openBooking(type);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('book');
    nextParams.delete('intent');
    setSearchParams(nextParams, { replace: true });
  }, [openBooking, searchParams, setSearchParams]);

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
              Let&rsquo;s have a{' '}
              <span className="italic text-forest">conversation</span>.
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-sage text-lg mt-8 max-w-2xl leading-relaxed">
              Book a free AI and operations diagnostic to talk through the biggest
              problems in your business. We will listen first, then tell you honestly
              whether we can help, and what it might look like if we can.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.3}>
            <div className="mt-10 p-6 bg-paper border border-mist rounded-xl max-w-2xl">
              <p className="label-upper mb-4">Please come prepared to discuss</p>
              <ul className="space-y-3 mb-6">
                {PREP_ITEMS.map((item) => (
                  <li key={item} className="text-sage text-sm flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sage text-xs leading-relaxed">
                Free AI &amp; Ops Diagnostic sessions are reserved for businesses
                generating over $1M in annual revenue.
              </p>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.35}>
            <div className="mt-8">
              <BookDiscoveryButton />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Workshop prompt */}
      <section className="py-12 px-6 bg-paper border-y border-mist">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="label-upper text-gold mb-2">Exploring AI for your company?</p>
            <p className="text-ink text-lg max-w-xl" style={{ fontFamily: 'var(--font-display)' }}>
              Prefer to align your leadership team first? Our company workshops teach
              practical AI skills and open up implementation discussion before you commit
              to a build.
            </p>
          </div>
          <Link to="/workshops" className="btn-gold shrink-0">
            Explore Company Workshops
          </Link>
        </div>
      </section>

      {/* Form */}
      <section className="section-shell">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          <div className="lg:col-span-7">
            <SectionReveal>
              <p className="section-eyebrow">Learn More</p>
              <h2 className="heading-display text-3xl md:text-4xl text-ink mb-4">
                Not sure if we are the right fit?
              </h2>
              <p className="text-sage text-sm leading-relaxed mb-10 max-w-xl">
                Send us a message about your business and what is not working. We
                will reply with an honest take on whether Renatus can help, with no
                pressure to book a call.
              </p>
              <BookDemoForm defaultIntent={defaultIntent} />
            </SectionReveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 space-y-12">
            <SectionReveal delay={0.15}>
              <div className="p-6 bg-forest text-cream rounded-xl border border-forest">
                <p className="label-upper mb-4" style={{ color: 'var(--color-gold-soft)' }}>
                  Ready to dive straight in?
                </p>
                <h3
                  className="heading-display text-2xl text-cream mb-3"
                >
                  60 Minute AI &amp; Operations Audit
                </h3>
                <p className="text-cream/75 text-sm leading-relaxed mb-5">
                  Skip the back-and-forth. Book a paid working session and we will
                  dig into what is broken, what it is costing you, and what a sensible
                  fix looks like.
                </p>
                <ul className="space-y-3 mb-6">
                  {AUDIT_BENEFITS.map((item) => (
                    <li key={item} className="text-cream/80 text-sm flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-soft mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <BookDiscoveryButton
                  bookingType="audit"
                  className="btn-gold w-full justify-center"
                >
                  Book Audit Session
                </BookDiscoveryButton>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.2}>
              <div className="space-y-8">
                <div>
                  <p className="label-upper mb-4">Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-ink text-lg hover:text-gold transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {CONTACT_EMAIL}
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
                      'A focused 60-minute working session',
                      'Honest assessment of what is worth fixing',
                      'A clear action plan you can use immediately',
                      'Credited toward your project if you engage with us',
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
              - Socrates
            </p>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
