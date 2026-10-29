import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import EnquireNowButton from '../components/EnquireNowButton';
import FounderChapter from '../components/FounderChapter';
import {
  STORY_PAGE_TRANSITION,
  StoryCloser,
  StoryHero,
  StorySectionHeading,
  StoryStatement,
} from '../components/SiteStory';
import { FOUNDER } from '../data/content';

export default function About() {
  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="about-story">
      <StoryHero
        eyebrow="About"
        title={
          <>
            {FOUNDER.name}. <em>{FOUNDER.role}.</em>
          </>
        }
        lead={FOUNDER.lead}
        visual={
          <div className="about-story__portrait">
            <img
              src={FOUNDER.portrait}
              alt={`${FOUNDER.name}, ${FOUNDER.role} of Renatus`}
              width="802"
              height="1500"
              fetchPriority="high"
            />
          </div>
        }
        actions={
          <>
            <EnquireNowButton />
            <a href="#story" className="link-arrow">
              Read the story &darr;
            </a>
          </>
        }
      />

      <StoryStatement
        tone="forest"
        eyebrow="The rare outcome"
        body="At Lockeroom, the new system and the change program together lifted productivity while operating costs came down."
      >
        More output. <em>Lower operating cost.</em> At the same time.{' '}
        <Link to="/portfolio/lockeroom" className="site-story-statement__link">
          Read how they did it &rarr;
        </Link>
      </StoryStatement>

      <div id="story">
        {FOUNDER.chapters.map((chapter, i) => (
          <FounderChapter key={chapter.stage} chapter={chapter} index={i} />
        ))}
      </div>

      <section className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner">
          <StorySectionHeading
            eyebrow="How Shaun works"
            title={
              <>
                Problem solving first. <em>Software second.</em>
              </>
            }
          />
          <div className="site-story-cards">
            {FOUNDER.principles.map((principle, i) => (
              <SectionReveal key={principle.title} delay={i * 0.1}>
                <div className="site-story-card">
                  <span className="site-story-card__number">0{i + 1}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.body}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <StoryCloser
        eyebrow="Work with Shaun"
        title="Bring the problem. We will bring the system and the change plan."
        body="A free 15-minute conversation. You tell us what is broken. We tell you honestly whether we can help."
      >
        <EnquireNowButton className="btn-primary" />
        <Link to="/services">See how we work &rarr;</Link>
      </StoryCloser>
    </motion.div>
  );
}
