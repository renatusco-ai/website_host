import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import BookDemoForm from '../components/BookDemoForm';
import EnquireNowButton from '../components/EnquireNowButton';
import { CONTACT_EMAIL } from '../data/content';

const SUBSCRIPTION_LEAVE_WITH = [
  'An actionable plan you can take wherever you like',
  'A clearer picture of your current software landscape',
  'An honest read on whether rebuilding would create a quantified saving',
];

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Contact() {
  return (
    <motion.div {...pageTransition}>
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">You&rsquo;ll learn more</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.04] max-w-4xl">
              Two ways to start.{' '}
              <span className="italic text-forest">Both honest.</span>
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-sage text-lg mt-8 max-w-2xl leading-relaxed">
              We only take projects where we can quantify a substantial reduction in
              what you pay to rent software. A conversation is how we find out
              whether that is true for you.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <SectionReveal>
            <div className="h-full p-8 md:p-10 bg-forest text-cream rounded-2xl">
              <p className="label-upper mb-4" style={{ color: 'var(--color-gold-soft)' }}>
                Paid working session
              </p>
              <h2 className="heading-display text-3xl text-cream mb-4">
                Subscription Diagnostic
              </h2>
              <p className="text-cream/75 text-sm leading-relaxed mb-6">
                We identify where your software subscriptions are leaking money and
                write an actionable plan to reduce that spend. You keep the plan
                either way.
              </p>
              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_LEAVE_WITH.map((item) => (
                  <li key={item} className="text-cream/80 text-sm flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-soft mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <EnquireNowButton inquire="subscription" className="btn-gold w-full justify-center">
                Enquire Now
              </EnquireNowButton>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="h-full p-8 md:p-10 bg-paper border border-mist rounded-2xl">
              <p className="label-upper text-gold mb-4">15 minutes · Free</p>
              <h2 className="heading-display text-3xl text-ink mb-4">
                AI &amp; Ops Diagnostic
              </h2>
              <p className="text-sage text-sm leading-relaxed mb-6">
                A quick, no-pressure conversation. You tell us what is broken. We
                tell you honestly whether it is worth a deeper look.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Fifteen minutes, phone or video',
                  'No pitch, no deck',
                  'An honest yes, no, or not yet',
                ].map((item) => (
                  <li key={item} className="text-sage text-sm flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <EnquireNowButton inquire="diagnostic" className="btn-ghost w-full justify-center">
                Enquire Now
              </EnquireNowButton>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="py-12 px-6 bg-paper border-y border-mist">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="label-upper text-gold mb-2">Exploring AI for your company?</p>
            <p className="text-ink text-lg max-w-xl" style={{ fontFamily: 'var(--font-display)' }}>
              Prefer to align your leadership team first? Company workshops teach
              practical AI skills before you commit to a build.
            </p>
          </div>
          <Link to="/workshops" className="btn-gold shrink-0">
            Explore Company Workshops
          </Link>
        </div>
      </section>

      <section className="section-shell">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          <div className="lg:col-span-7">
            <SectionReveal>
              <p className="section-eyebrow">Write to us</p>
              <h2 className="heading-display text-3xl md:text-4xl text-ink mb-4">
                Prefer to send a note first?
              </h2>
              <p className="text-sage text-sm leading-relaxed mb-8 max-w-xl">
                Fill in the form below. Mobile, email, and company are required so we
                can get back to the right person.
              </p>
              <BookDemoForm />
            </SectionReveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 space-y-12">
            <SectionReveal delay={0.15}>
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
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
