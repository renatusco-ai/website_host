import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import EnquireNowButton from '../components/EnquireNowButton';
import BusinessTimeline from '../components/BusinessTimeline';
import ChangeDifference from '../components/ChangeDifference';
import ClientLogoWall from '../components/ClientLogoWall';
import CostComparison from '../components/CostComparison';
import MissionHero from '../components/MissionHero';
import {
  STORY_PAGE_TRANSITION,
  StoryCloser,
  StoryStatement,
} from '../components/SiteStory';

export default function Home() {
  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="home-story">
      <MissionHero />

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
