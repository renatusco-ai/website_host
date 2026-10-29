import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import MagneticButton from '../components/MagneticButton';
import BookDemoForm from '../components/BookDemoForm';
import EnquireNowButton from '../components/EnquireNowButton';
import {
  STORY_PAGE_TRANSITION,
  StoryCloser,
  StoryHero,
  StorySectionHeading,
  StoryStatement,
} from '../components/SiteStory';
import { WORKSHOP_TOPICS } from '../data/content';

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
  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="workshop-story">
      <StoryHero
        eyebrow="Company workshops"
        title={
          <>
            Give the whole team a way to think about <em>AI together.</em>
          </>
        }
        lead="Practical education first. Your company’s real workflows second. A facilitated session that turns uncertainty into a shared language and a clear next move."
        graphic="workshop"
        actions={
          <>
            <MagneticButton>
              <a href="#book" className="btn-primary">Enquire about a workshop</a>
            </MagneticButton>
            <EnquireNowButton inquire="diagnostic" className="link-arrow">
              Rather talk about your systems? Free 15-min chat &rarr;
            </EnquireNowButton>
          </>
        }
        note="Workshops align the team. The free 15-minute conversation is the fastest way to talk through a specific problem."
      />

      <StoryStatement
        eyebrow="What this is"
        body="This is not a software demo or an afternoon of generic prompts. Your team learns the fundamentals, then applies them to operations, hiring and day-to-day systems while the right people are in the room."
      >
        Inspiration fades. <em>Shared understanding compounds.</em>
      </StoryStatement>

      <section className="site-story-section">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="01"
            eyebrow="The room changes in four acts"
            title="From AI literacy to a company-specific next move."
            body="The first half builds a shared foundation. The second half turns that understanding toward your own workflows, risks and opportunities."
          />
          <div className="workshop-story__agenda">
            {WORKSHOP_TOPICS.map((topic, i) => (
              <SectionReveal key={topic.title} delay={i * 0.08}>
                <div className="workshop-story__module">
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{topic.title}</h3>
                    <p>{topic.description}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="02"
            eyebrow="Who enters. What leaves."
            title="The workshop creates alignment you can act on."
          />
          <div className="workshop-story__outcomes">
          <SectionReveal>
            <div className="workshop-story__list">
            <p className="site-story-eyebrow">Who it is for</p>
            <h3>Companies ready to lead deliberately.</h3>
            <ul className="space-y-4">
              {WHO_ITS_FOR.map((item) => (
                <li key={item} className="text-ink/80 flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-spring mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <div className="workshop-story__list workshop-story__list--forest">
            <p className="site-story-eyebrow">What the team leaves with</p>
            <h3>A shared language and a visible next step.</h3>
            <ul className="space-y-4">
              {OUTCOMES.map((item) => (
                <li key={item} className="text-ink/80 flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-spring mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            </div>
          </SectionReveal>
          </div>
        </div>
      </section>

      <section className="site-story-section">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="03"
            eyebrow="How it runs"
            title="Built around the people who will lead the change."
            body="A live half-day session, usually three to four hours, delivered in your workplace or online using your real scenarios and constraints."
          />
          <div className="site-story-cards">
            {FORMAT_POINTS.map((point, i) => (
              <SectionReveal key={point.title} delay={i * 0.1}>
                <div className="site-story-card">
                  <span className="site-story-card__number">0{i + 1}</span>
                  <h3>{point.title}</h3>
                  <p>{point.body}</p>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={0.2}>
            <div className="workshop-story__format">
              <span>Typical format</span>
              <strong>3–4 hours</strong>
              <p>Live with your leadership or management group. In person or online. Your real business, never canned examples.</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section id="book" className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner workshop-story__booking">
          <StorySectionHeading
            number="04"
            eyebrow="Bring the room together"
            title="Tell us who needs to leave ready."
            body="Share the team size, who would attend and what you want them able to do. We will return with a tailored format, timing and proposed agenda."
          />
          <SectionReveal>
            <div className="workshop-story__form">
            <p className="text-graphite text-sm leading-relaxed mb-10 max-w-xl">
              Tell us about your team size, who would attend, and what you want
              them to walk away able to do. We will come back with format, timing,
              and a proposed agenda tailored to your company.
            </p>
            <BookDemoForm />
            </div>
          </SectionReveal>
        </div>
      </section>

      <StoryCloser
        eyebrow="After the workshop"
        title="Shared literacy becomes a better implementation."
        body="When leadership is aligned, the next decision gets easier: investigate the economics, restructure the data or begin the build."
      >
        <Link to="/services" className="btn-primary">See how the work moves</Link>
        <Link to="/contact">Talk to us &rarr;</Link>
      </StoryCloser>
    </motion.div>
  );
}
