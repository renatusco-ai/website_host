import { Link } from 'react-router-dom';
import SectionReveal from './SectionReveal';
import EnquireNowButton from './EnquireNowButton';
import { StorySectionHeading } from './SiteStory';
import { DIFFERENCE_POINTS } from '../data/content';

export default function ChangeDifference() {
  return (
    <section className="site-story-section">
      <div className="site-story-section__inner">
        <StorySectionHeading
          number="02"
          eyebrow="What makes us different"
          title={
            <>
              Anyone can build software. <em>We make sure it gets used.</em>
            </>
          }
          body="Most software projects fail at adoption, not code. Every Renatus engagement pairs the build with change management, so the result shows up in productivity and cost, not just a new login."
        />

        <div className="site-story-cards">
          {DIFFERENCE_POINTS.map((point, i) => (
            <SectionReveal key={point.title} delay={i * 0.1}>
              <div className={`site-story-card${i === 2 ? ' site-story-card--forest' : ''}`}>
                <span className="site-story-card__number">0{i + 1}</span>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={0.2}>
          <div className="difference-story__actions">
            <EnquireNowButton />
            <Link to="/about" className="link-arrow">
              Meet the founder &rarr;
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
