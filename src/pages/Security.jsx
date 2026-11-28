import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STORY_PAGE_TRANSITION, StoryHero } from '../components/SiteStory';
import TodoMark from '../components/TodoMark';

export default function Security() {
  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="security-story">
      <StoryHero
        compact
        eyebrow="Security"
        title={
          <>
            What we do <em>about security.</em>
          </>
        }
        lead="A short account of the marketing site. The longer notes, including client-product data we have not confirmed, are on the trust page."
        actions={
          <Link to="/trust" className="btn-primary">
            Read the trust page
          </Link>
        }
      />

      <section className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner legal-copy">
          <h2>This website</h2>
          <p>The marketing site is hosted on Vercel.</p>
          <p>
            For visitors in Australia, static pages and the CDN edge are served from Sydney (syd1). Serverless functions, including the enquiry form, run in iad1 (US East). Those functions are not hosted in Australia.
          </p>

          <h2>Enquiry form</h2>
          <p>
            Submissions that fill the honeypot field (website) are rejected and are not stored. There is no CAPTCHA. A server-side rate limit allows about five submissions from the same address in ten minutes, enforced in the memory of each serverless instance. Valid enquiries are stored in Renatus&apos;s own database, then emailed to the team when email delivery is configured.
          </p>

          <h2>Certifications</h2>
          {/* TODO(shaun): confirm we do not currently hold SOC 2 or ISO 27001. */}
          <p>
            We do not currently hold SOC 2 or ISO 27001 certification.
            <TodoMark>confirm certifications with Shaun</TodoMark>
          </p>

          <p>
            <Link to="/trust">Trust</Link>
            {' covers hosting, enquiry handling, and the unconfirmed client-product data notes. '}
            <Link to="/privacy">Privacy</Link>
            {' covers what an enquiry collects.'}
          </p>
        </div>
      </section>
    </motion.div>
  );
}
