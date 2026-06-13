import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import MagneticButton from '../components/MagneticButton';
import BookDemoForm from '../components/BookDemoForm';
import SchedulingEmbed from '../components/SchedulingEmbed';
import { WORKSHOP_TOPICS } from '../data/content';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const WHO_ITS_FOR = [
  'Business owners curious about AI but unsure where to start',
  'Teams drowning in manual processes and spreadsheet chaos',
  'Leaders who want to evaluate AI tools without the hype',
  'Anyone who has tried AI tools and felt a little overwhelmed',
];

const OUTCOMES = [
  'A clear understanding of what AI can and cannot do for your business',
  'Hands-on experience with practical, everyday AI workflows',
  'A personalised roadmap for where AI fits in your business',
  'Confidence to make informed decisions about tools and vendors',
];

export default function Workshops() {
  return (
    <motion.div {...pageTransition}>
      {/* Hero */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">AI Workshops</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.04] max-w-4xl">
              Learn AI by <span className="italic text-forest">doing</span>.
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-sage text-lg md:text-xl mt-8 max-w-2xl leading-relaxed">
              Friendly, hands-on workshops that cut through the noise. No technical
              background required — just bring your questions and your real business
              challenges.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.3}>
            <div className="mt-10">
              <MagneticButton>
                <a href="#book" className="btn-gold">
                  Book a Workshop
                </a>
              </MagneticButton>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="section-shell section-shell--paper border-y border-mist">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="section-eyebrow">What You&rsquo;ll Learn</p>
            <h2 className="heading-display text-4xl md:text-5xl text-ink mb-16">
              Four modules, one clear outcome
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORKSHOP_TOPICS.map((topic, i) => (
              <SectionReveal key={topic.title} delay={i * 0.08}>
                <div className="h-full bg-cream p-8 md:p-10 rounded-xl border border-mist">
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

      {/* Who it's for + outcomes */}
      <section className="section-shell">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <SectionReveal>
            <p className="section-eyebrow">Who It&rsquo;s For</p>
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
            <p className="section-eyebrow">What You&rsquo;ll Leave With</p>
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
      <section className="section-shell section-shell--forest">
        <div className="max-w-4xl mx-auto text-center">
          <SectionReveal>
            <p className="section-eyebrow" style={{ color: 'var(--color-gold-soft)' }}>
              Format
            </p>
            <h2 className="heading-display text-3xl md:text-4xl text-cream mb-6">
              Interactive, practical, no fluff
            </h2>
            <p className="text-cream/70 leading-relaxed max-w-2xl mx-auto">
              Workshops run as live, interactive sessions — typically 2&ndash;3 hours
              for groups or a focused 1-on-1 for business owners. We use your real
              business scenarios, not generic examples. Available in person or
              online.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="section-shell">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          <div className="lg:col-span-7">
            <SectionReveal>
              <p className="section-eyebrow">Book Your Workshop</p>
              <h2 className="heading-display text-3xl md:text-4xl text-ink mb-8">
                Reserve your spot
              </h2>
              <BookDemoForm />
            </SectionReveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <SectionReveal delay={0.15}>
              <SchedulingEmbed title="Or schedule directly" />
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Bridge to services */}
      <section className="section-shell section-shell--paper border-t border-mist">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="section-eyebrow">Ready for More?</p>
            <h2 className="heading-display text-3xl md:text-4xl text-ink mb-6">
              From workshop to full transformation
            </h2>
            <p className="text-sage mb-10 leading-relaxed">
              Many clients start with a workshop and move into our service tiers once
              they see what&rsquo;s possible. Explore Foundation through Transform to
              find the right fit.
            </p>
            <Link to="/services" className="btn-ghost">
              Explore services
            </Link>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
