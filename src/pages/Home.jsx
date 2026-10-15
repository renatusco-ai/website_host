import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import EnquireNowButton from '../components/EnquireNowButton';
import BusinessTimeline from '../components/BusinessTimeline';
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
        body="Off-the-shelf software is built by venture-funded teams half a world away, for the widest possible market. They sell you the login and leave the rollout to you. But software was never the product — it is the tool that helps your team get the job done. It should fit the way you work, change when your business does, and come with someone who stays to make it stick."
      >
        The average tool was built for the average business.{' '}
        <em>Not for the way your team works.</em>
      </StoryStatement>

      <ClientLogoWall />

      <BusinessTimeline />

      <CostComparison />

      <StoryCloser
        eyebrow="How we choose work"
        title="If the saving cannot be quantified, we do not take the project."
        body="A Subscription Diagnostic maps the real cost of your stack and tests whether rebuilding makes commercial sense. You keep the plan either way."
      >
        <EnquireNowButton inquire="subscription" className="btn-primary">
          Find the saving
        </EnquireNowButton>
        <Link to="/portfolio">See the proof &rarr;</Link>
      </StoryCloser>
    </motion.div>
  );
}
