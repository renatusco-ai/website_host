import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import EnquireNowButton from '../components/EnquireNowButton';
import ClientLogoWall from '../components/ClientLogoWall';
import CostComparison from '../components/CostComparison';
import {
  STORY_PAGE_TRANSITION,
  StoryCloser,
  StoryHero,
  StoryStatement,
} from '../components/SiteStory';

export default function Home() {
  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="home-story">
      <StoryHero
        eyebrow="Software for businesses that refuse to be average"
        title={
          <>
            The software changed. <em>Your business hasn&rsquo;t.</em>
          </>
        }
        lead="You settled for off-the-shelf because custom wasn’t an option. Now it is — and the numbers can be extraordinary."
        graphic="evolution"
        actions={
          <>
              <EnquireNowButton />
              <Link to="/learn-more" className="link-arrow max-w-xs">
                Learn how businesses are making crazy savings &rarr;
              </Link>
          </>
        }
        note="We only recommend custom where the measurable saving justifies it."
      />

      <StoryStatement
        eyebrow="The mismatch"
        body="Every workaround is evidence. Every extra subscription is another clue. The problem is rarely your team — it is a generic stack trying to contain a business that has moved beyond it."
      >
        The average tool was built for the average business.{' '}
        <em>You did not build one.</em>
      </StoryStatement>

      <ClientLogoWall />

      <div className="story-transition" aria-hidden="true">
        <span>Rent</span>
        <span>Measure</span>
        <span>Own</span>
      </div>

      <CostComparison />

      <StoryCloser
        eyebrow="How we choose work"
        title="If the saving cannot be quantified, we do not take the project."
        body="A Subscription Diagnostic maps the real cost of your stack and tests whether rebuilding makes commercial sense. You keep the plan either way."
      >
        <EnquireNowButton inquire="subscription" className="btn-gold">
          Find the saving
        </EnquireNowButton>
        <Link to="/portfolio">See the proof &rarr;</Link>
      </StoryCloser>
    </motion.div>
  );
}
