import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import EnquireNowButton from '../components/EnquireNowButton';
import BusinessTimeline from '../components/BusinessTimeline';
import ChangeDifference from '../components/ChangeDifference';
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
        eyebrow="Custom software & change management · Australia"
        title={
          <>
            The software changed. <em>Your business hasn&rsquo;t.</em>
          </>
        }
        lead="We build custom software and business automation around the way your team works, then lead the change so your people actually use it. That is how productivity goes up while costs come down."
        graphic="evolution"
        actions={
          <>
            <EnquireNowButton />
            <Link to="/portfolio/lockeroom" className="link-arrow max-w-xs">
              See the $266k result &rarr;
            </Link>
          </>
        }
        note="Free 15-minute first conversation. We reply within 24 hours."
      />

      <ClientLogoWall />

      <ChangeDifference />

      <StoryStatement
        eyebrow="The mismatch"
        body="Off-the-shelf software is built by venture-funded teams half a world away, for the widest possible market. They sell you the login and leave the rollout to you. But software was never the product — it is the tool that helps your team get the job done. It should fit the way you work, change when your business does, and come with someone who stays to make it stick."
      >
        The average tool was built for the average business.{' '}
        <em>Not for the way your team works.</em>
      </StoryStatement>

      <BusinessTimeline />

      <CostComparison />

      <StoryCloser
        eyebrow="Start with a conversation"
        title="Tell us what is not working. We will tell you honestly if we can fix it."
        body="A free 15-minute conversation. No pitch. If custom software is not the answer, we will say so."
      >
        <EnquireNowButton className="btn-primary" />
        <Link to="/portfolio">See the proof &rarr;</Link>
      </StoryCloser>
    </motion.div>
  );
}
