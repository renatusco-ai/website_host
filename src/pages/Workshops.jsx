import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import MagneticButton from '../components/MagneticButton';
import BookDemoForm from '../components/BookDemoForm';
import { useBooking } from '../context/BookingContext';
import { WORKSHOP_TOPICS } from '../data/content';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const WHO_ITS_FOR = [
  'Leadership and management teams preparing to roll out AI across the business',
  'Founders and operators who need the whole team speaking the same language on AI',
  'Companies ready to discuss implementation openly, not sit through a product pitch',
  'Teams that want basic AI skills first, then company-specific workflows layered on top',
];

const OUTCOMES = [
  'Shared understanding of what AI can and cannot do in your business',
  'Hands-on practice with practical AI workflows your team can use immediately',
  'Company-specific discussion: where AI fits your operations, people, and systems',
  'A clear next-step plan for implementation, ownership, and what to tackle first',
];

const FORMAT_POINTS = [
  {
    title: 'Built for teams',
    body: 'Designed for management groups and cross-functional leaders, not solo hobbyists. Everyone leaves aligned.',
  },
  {
    title: 'Open discussion',
    body: 'We facilitate honest conversation about AI implementation: risks, readiness, and what is worth doing now.',
  },
  {
    title: 'Your business, not generic demos',
    body: 'Core AI literacy first, then we layer in examples and exercises drawn from how your company actually runs.',
  },
];

export default function Workshops() {
  const { openBooking } = useBooking();

  return (
    <motion.div {...pageTransition}>
      {/* Hero */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Company Workshops</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.04] max-w-4xl">
              Discuss AI implementation with your{' '}
              <span className="italic text-forest">team</span>.
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-sage text-lg md:text-xl mt-8 max-w-2xl leading-relaxed">
              An open education workshop for leadership and management teams.
              We teach practical AI skills, then layer in company-specific discussion
              so your people leave ready to implement, not just inspired.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <MagneticButton>
                <a href="#book" className="btn-gold">
                  Enquire about a workshop
                </a>
              </MagneticButton>
              <button
                type="button"
                className="link-arrow"
                onClick={() => openBooking('audit')}
              >
                Need strategy you can act on now? Book the 60 min audit &rarr;
              </button>
            </div>
            <p className="text-sage text-sm mt-5 max-w-xl leading-relaxed">
              Workshops are built for education and team alignment. If you want a
              true strategy-to-action plan for your business now, the paid 60 minute
              Operations &amp; AI Audit is the better fit.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Positioning strip */}
      <section className="px-6 py-16 md:py-20 bg-paper border-y border-mist">
        <div className="max-w-4xl mx-auto text-center">
          <SectionReveal>
            <p className="heading-display text-3xl sm:text-4xl text-ink leading-snug">
              Education first. Your company context second.
            </p>
            <p className="text-sage text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
              This is not a software demo. It is a facilitated session where your
              team learns the fundamentals, then works through how AI should show up
              in your operations, hiring, and day-to-day systems. We will discuss
              implementation, but the focus is literacy and shared understanding,
              not a custom strategy sprint.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Agenda / modules */}
      <section className="section-shell">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Workshop Agenda</p>
            <h2 className="heading-display text-4xl md:text-5xl text-ink mb-4 max-w-3xl">
              From literacy to your implementation plan
            </h2>
            <p className="text-sage max-w-2xl mb-16 leading-relaxed">
              Four focused modules. The first half builds shared skill. The second
              half applies it to your business.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORKSHOP_TOPICS.map((topic, i) => (
              <SectionReveal key={topic.title} delay={i * 0.08}>
                <div className="h-full bg-paper p-8 md:p-10 rounded-xl border border-mist">
                  <span className="heading-display text-2xl text-gold block mb-4">
                    0{i + 1}
                  </span>
                  <h3 className="heading-display text-2xl text-ink mb-3">
                    {topic.title}
                  </h3>
                  <p className="text-sage text-sm leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who + outcomes */}
      <section className="section-shell section-shell--paper border-y border-mist">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <SectionReveal>
            <p className="section-eyebrow">Who It&rsquo;s For</p>
            <h2 className="heading-display text-3xl text-ink mb-8">
              Built for companies ready to lead on AI
            </h2>
            <ul className="space-y-4">
              {WHO_ITS_FOR.map((item) => (
                <li key={item} className="text-ink/80 flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <p className="section-eyebrow">What Your Team Leaves With</p>
            <h2 className="heading-display text-3xl text-ink mb-8">
              Alignment you can act on
            </h2>
            <ul className="space-y-4">
              {OUTCOMES.map((item) => (
                <li key={item} className="text-ink/80 flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </section>

      {/* Format */}
      <section className="section-shell">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">How It Runs</p>
            <h2 className="heading-display text-4xl md:text-5xl text-ink mb-16 max-w-3xl">
              A workshop your management team can actually use
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {FORMAT_POINTS.map((point, i) => (
              <SectionReveal key={point.title} delay={i * 0.1}>
                <div className="h-full">
                  <h3 className="heading-display text-2xl text-ink mb-3">
                    {point.title}
                  </h3>
                  <p className="text-sage text-sm leading-relaxed">{point.body}</p>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={0.2}>
            <div className="p-8 md:p-10 bg-forest text-cream rounded-xl max-w-3xl">
              <p className="label-upper mb-4" style={{ color: 'var(--color-gold-soft)' }}>
                Session format
              </p>
              <p className="heading-display text-2xl md:text-3xl text-cream mb-4">
                Half-day live workshop
              </p>
              <p className="text-cream/75 leading-relaxed">
                Typically 3-4 hours with your leadership or management group.
                Delivered in person at your workplace or online. We use your real
                scenarios, systems, and constraints, not canned examples.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="section-shell section-shell--paper border-t border-mist">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">Book a Company Workshop</p>
            <h2 className="heading-display text-3xl md:text-4xl text-ink mb-4">
              Bring AI education into your business
            </h2>
            <p className="text-sage text-sm leading-relaxed mb-10 max-w-xl">
              Tell us about your team size, who would attend, and what you want
              them to walk away able to do. We will come back with format, timing,
              and a proposed agenda tailored to your company.
            </p>
            <BookDemoForm />
          </SectionReveal>
        </div>
      </section>

      {/* Bridge */}
      <section className="section-shell section-shell--forest">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="section-eyebrow" style={{ color: 'var(--color-gold-soft)' }}>
              After the workshop
            </p>
            <h2 className="heading-display text-3xl md:text-4xl text-cream mb-6">
              From shared literacy to working systems
            </h2>
            <p className="text-cream/70 mb-10 leading-relaxed">
              Many companies start with a workshop so leadership is aligned, then
              move into a diagnostic or build engagement when they are ready to
              put systems in place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/services" className="btn-gold">
                Explore services
              </Link>
              <Link
                to="/contact"
                className="text-cream/80 text-sm hover:text-gold-soft transition-colors"
              >
                Talk to us &rarr;
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
