import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STORY_PAGE_TRANSITION, StoryHero } from '../components/SiteStory';
import TodoMark from '../components/TodoMark';
import { DISAMBIGUATION, ENTITY_PLACE } from '../data/content';

export default function Trust() {
  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="trust-story">
      <StoryHero
        compact
        eyebrow="Trust"
        title={
          <>
            Hosting, enquiries, <em>and limits.</em>
          </>
        }
        lead="What this marketing site runs on, what happens to an enquiry, and the claims we are not making."
        actions={
          <>
            <Link to="/privacy" className="btn-primary">
              Privacy
            </Link>
            <Link to="/security" className="link-arrow">
              Security &rarr;
            </Link>
          </>
        }
      />

      <section className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner legal-copy">
          <h2>Who this is</h2>
          <p>{ENTITY_PLACE}.</p>
          <p>{DISAMBIGUATION}</p>

          <h2>Hosting</h2>
          <p>This marketing site is hosted on Vercel.</p>
          <p>
            For visitors in Australia, the static pages and the CDN edge are served from Sydney (syd1).
          </p>
          <p>
            Serverless functions, including the enquiry form, run in iad1 (US East). Those functions are not hosted in Australia.
          </p>

          <h2>Enquiries</h2>
          <p>
            The contact form asks for your name, email, phone, company and message. It also records the page you sent it from, the referring page, and your browser user agent.
          </p>
          <p>
            The form includes a honeypot field named website. People are not meant to fill it in. Submissions that fill it are rejected and are not stored. There is no CAPTCHA.
          </p>
          <p>
            A server-side rate limit allows about five submissions from the same address in ten minutes. On this host that check runs in the memory of each serverless instance, so it is a best-effort control rather than one shared counter.
          </p>
          <p>
            A valid submission is stored in Renatus&apos;s own database first. It is then emailed to the team when email delivery is configured. If email is not configured, the stored enquiry is still accepted.
          </p>
          <p>
            <Link to="/contact">Send an enquiry</Link>
            {' · '}
            <Link to="/privacy">How enquiry data is handled</Link>
          </p>

          <h2>Certifications</h2>
          {/* TODO(shaun): confirm we do not currently hold SOC 2 or ISO 27001. */}
          <p>
            We do not currently hold SOC 2 or ISO 27001 certification.
            <TodoMark>confirm certifications with Shaun</TodoMark>
          </p>

          <h2>Client product data</h2>
          {/* TODO(shaun): confirm client-product data hosting region, encryption, and backups. */}
          <p>
            This page does not describe where a client&apos;s product data is hosted, how it is encrypted, or how backups are kept.
            <TodoMark>client-product data hosting region, encryption, and backups are not verified yet</TodoMark>
          </p>
        </div>
      </section>
    </motion.div>
  );
}
