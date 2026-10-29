import { Link } from 'react-router-dom';
import { CONTACT_EMAIL } from '../data/content';
import EnquireNowButton from './EnquireNowButton';

export default function Footer() {
  return (
    <footer className="site-footer relative z-0 bg-forest text-canvas">
      <div className="site-footer__inner">
        <div className="site-footer__lead">
          <p>There is usually one expensive problem hiding in the stack.</p>
          <EnquireNowButton className="site-footer__headline">
            Let&rsquo;s find it. <span aria-hidden="true">&rarr;</span>
          </EnquireNowButton>
        </div>

        <div className="site-footer__details">
          <div>
            <img
              src="/brand/renatus-logo-on-dark.svg"
              alt="Renatus"
              width="198"
              height="36"
              className="block h-9 w-auto"
            />
            <p>
              Owned systems, structured data and practical AI for businesses that
              refuse to operate like everyone else.
            </p>
          </div>

          <div>
            <span>Explore</span>
            <div>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/services">Services</Link>
              <Link to="/portfolio">Portfolio</Link>
              <Link to="/learn-more">The story</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <span>Get in touch</span>
            <div>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <Link to="/workshops">Company workshops &rarr;</Link>
            </div>
          </div>
        </div>

        <div className="site-footer__base">
          <p>
            &copy; {new Date().getFullYear()} Renatus. All rights reserved.
          </p>
          <p>
            Understand AI. Then put it to work.
          </p>
        </div>
      </div>
    </footer>
  );
}
