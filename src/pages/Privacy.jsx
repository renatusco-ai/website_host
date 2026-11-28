import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STORY_PAGE_TRANSITION, StoryHero } from '../components/SiteStory';
import TodoMark from '../components/TodoMark';
import { CONTACT_EMAIL, DISAMBIGUATION, LEGAL_LINE } from '../data/content';

export default function Privacy() {
  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="privacy-story">
      <StoryHero
        compact
        eyebrow="Privacy"
        title={
          <>
            A plain-English <em>privacy note.</em>
          </>
        }
        lead="This note covers enquiry data sent through the contact form on this marketing site. It is not a description of data inside a client product."
      />

      <section className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner legal-copy">
          <h2>Who holds it</h2>
          <p>{LEGAL_LINE}</p>
          <p>{DISAMBIGUATION}</p>

          <h2>What we collect</h2>
          <p>When you send an enquiry we collect:</p>
          <ul>
            <li>Name</li>
            <li>Email</li>
            <li>Phone</li>
            <li>Company</li>
            <li>Message</li>
            <li>The page you sent it from, the referring page, and your browser user agent</li>
          </ul>
          <p>
            The form also has a honeypot field named website. If it is filled in, the submission is rejected and is not stored.
          </p>

          <h2>Why</h2>
          <p>
            We use this information to reply to your enquiry and to decide whether a conversation or a piece of work is a fit.
          </p>

          <h2>Where it is kept</h2>
          <p>
            Enquiry records are stored in Renatus&apos;s own database. When email delivery is configured, a copy is also emailed to the Renatus team.
          </p>
          <p>
            The enquiry form is handled by a serverless function in Vercel&apos;s iad1 region (US East). Static pages for visitors in Australia are served from Sydney (syd1). Function compute is not hosted in Australia.
          </p>

          <h2>How long, and overseas disclosure</h2>
          {/* TODO(shaun): confirm the retention period for enquiry records. */}
          <p>
            <TodoMark>retention period for enquiry records</TodoMark>
          </p>
          {/* TODO(shaun): confirm overseas disclosure detail under APP 8, including where the database and email provider store and process enquiry data. */}
          <p>
            <TodoMark>overseas disclosure detail under APP 8</TodoMark>
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this information:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <p>
            <Link to="/trust">Trust</Link>
            {' · '}
            <Link to="/contact">Contact</Link>
          </p>
        </div>
      </section>
    </motion.div>
  );
}
