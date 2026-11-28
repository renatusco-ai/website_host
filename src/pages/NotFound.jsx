import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STORY_PAGE_TRANSITION, StoryHero } from '../components/SiteStory';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | Renatus';
  }, []);

  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="not-found-story">
      <StoryHero
        compact
        eyebrow="404"
        title={
          <>
            That page <em>is not here.</em>
          </>
        }
        lead="The address does not match a page on this site."
        actions={
          <>
            <Link to="/" className="btn-primary">
              Home
            </Link>
            <Link to="/trust" className="link-arrow">
              Trust
            </Link>
            <Link to="/privacy" className="link-arrow">
              Privacy
            </Link>
            <Link to="/contact" className="link-arrow">
              Contact
            </Link>
          </>
        }
      />
    </motion.div>
  );
}
