import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import BookDemoForm from '../components/BookDemoForm';
import EnquireNowButton from '../components/EnquireNowButton';
import {
  STORY_PAGE_TRANSITION,
  StoryHero,
  StorySectionHeading,
} from '../components/SiteStory';
import { CONTACT_EMAIL } from '../data/content';

const CONVERSATION_POINTS = [
  'Fifteen minutes, phone or video',
  'No pitch, no deck',
  'An honest yes, no, or not yet',
];

const WORKSHOP_POINTS = [
  'Half-day session for leadership and management',
  'Practical AI literacy, then your real workflows',
  'Leave with a shared plan and clear owners',
];

export default function Contact() {
  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="contact-story">
      <StoryHero
        eyebrow="Start here"
        title={
          <>
            Two ways in. <em>Both honest.</em>
          </>
        }
        lead="Tell us what feels expensive, fragmented or harder than it should be. We will tell you whether the answer is software, a change in how the team works, or nothing yet."
        graphic="pioneer"
        actions={
          <>
            <EnquireNowButton inquire="diagnostic" />
            <a href="#write" className="link-arrow">Write a note instead &rarr;</a>
          </>
        }
        note="No pitch deck. No pretending every problem needs a build."
      />

      <section id="choose" className="site-story-section contact-story__choose">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="01"
            eyebrow="Choose the starting point"
            title="A quick conversation, or the whole room."
            body="Both paths begin with your real operating problem. Talk it through with us one-on-one, or bring your leadership team into a workshop first."
          />
          <div className="contact-story__paths">
          <SectionReveal>
            <div className="contact-story__path contact-story__path--paid">
              <p className="label-upper mb-4" style={{ color: 'var(--color-spring)' }}>
                15 minutes · Free
              </p>
              <h2 className="heading-display text-3xl text-canvas mb-4">
                AI &amp; Ops Diagnostic
              </h2>
              <p className="text-canvas/75 text-sm leading-relaxed mb-6">
                A quick, no-pressure conversation. You tell us what is broken. We
                tell you honestly whether it is worth a deeper look.
              </p>
              <ul className="space-y-3 mb-8">
                {CONVERSATION_POINTS.map((item) => (
                  <li key={item} className="text-canvas/80 text-sm flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-spring mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <EnquireNowButton inquire="diagnostic" className="btn-primary w-full justify-center">
                Enquire Now
              </EnquireNowButton>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="contact-story__path">
              <p className="label-upper text-forest mb-4">Team session</p>
              <h2 className="heading-display text-3xl text-ink mb-4">
                Company AI Workshop
              </h2>
              <p className="text-graphite text-sm leading-relaxed mb-6">
                The right first move when the people need alignment before the
                systems need changing.
              </p>
              <ul className="space-y-3 mb-8">
                {WORKSHOP_POINTS.map((item) => (
                  <li key={item} className="text-graphite text-sm flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-spring mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/workshops" className="btn-ghost w-full justify-center">
                Explore workshops
              </Link>
            </div>
          </SectionReveal>
          </div>
        </div>
      </section>

      <section id="write" className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner contact-story__write">
          <StorySectionHeading
            number="02"
            eyebrow="Prefer to write first?"
            title="Put the problem in your own words."
            body="Mobile, email and company are required so the right person can respond. Expect a useful answer within 24 hours."
          />
          <SectionReveal>
            <div className="contact-story__form">
              <p className="text-graphite text-sm leading-relaxed mb-8 max-w-xl">
                Fill in the form below. Mobile, email, and company are required so we
                can get back to the right person.
              </p>
              <BookDemoForm />
              <div className="contact-story__direct">
                <span>Or email directly</span>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
