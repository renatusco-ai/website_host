import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import BookDemoForm from '../components/BookDemoForm';
import EnquireNowButton from '../components/EnquireNowButton';
import {
  STORY_PAGE_TRANSITION,
  StoryHero,
  StorySectionHeading,
  StoryStatement,
} from '../components/SiteStory';
import { CONTACT_EMAIL } from '../data/content';

const SUBSCRIPTION_LEAVE_WITH = [
  'An actionable plan you can take wherever you like',
  'A clearer picture of your current software landscape',
  'An honest read on whether rebuilding would create a quantified saving',
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
        lead="Tell us what feels expensive, fragmented or harder than it should be. We will help you decide whether the next move is a quick conversation, a proper diagnostic — or nothing yet."
        graphic="pioneer"
        actions={
          <>
            <a href="#choose" className="btn-primary">Choose your starting point</a>
            <a href="#write" className="link-arrow">Write a note instead &rarr;</a>
          </>
        }
        note="No pitch deck. No pretending every problem needs a build."
      />

      <section id="choose" className="site-story-section contact-story__choose">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="01"
            eyebrow="Choose the depth"
            title="A quick signal, or a decision-ready plan."
            body="Both paths begin with your real operating problem. The difference is how much evidence and action you need to leave with."
          />
          <div className="contact-story__paths">
          <SectionReveal>
            <div className="contact-story__path contact-story__path--paid">
              <p className="label-upper mb-4" style={{ color: 'var(--color-spring)' }}>
                Paid working session
              </p>
              <h2 className="heading-display text-3xl text-canvas mb-4">
                Subscription Diagnostic
              </h2>
              <p className="text-canvas/75 text-sm leading-relaxed mb-6">
                We identify where your software subscriptions are leaking money and
                write an actionable plan to reduce that spend. You keep the plan
                either way.
              </p>
              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_LEAVE_WITH.map((item) => (
                  <li key={item} className="text-canvas/80 text-sm flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-spring mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <EnquireNowButton inquire="subscription" className="btn-primary w-full justify-center">
                Enquire Now
              </EnquireNowButton>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="contact-story__path">
              <p className="label-upper text-forest mb-4">15 minutes · Free</p>
              <h2 className="heading-display text-3xl text-ink mb-4">
                AI &amp; Ops Diagnostic
              </h2>
              <p className="text-graphite text-sm leading-relaxed mb-6">
                A quick, no-pressure conversation. You tell us what is broken. We
                tell you honestly whether it is worth a deeper look.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Fifteen minutes, phone or video',
                  'No pitch, no deck',
                  'An honest yes, no, or not yet',
                ].map((item) => (
                  <li key={item} className="text-graphite text-sm flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-spring mt-1.5 shrink-0" />
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
        </div>
      </section>

      <StoryStatement
        tone="forest"
        eyebrow="Bringing the team?"
        body="A company workshop creates shared AI literacy before implementation. It is the right first move when the people need alignment before the systems need changing."
      >
        Start with the room. <Link to="/workshops"><em>Explore workshops &rarr;</em></Link>
      </StoryStatement>

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
