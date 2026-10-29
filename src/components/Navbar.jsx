import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from 'framer-motion';
import EnquireNowButton from './EnquireNowButton';

/** `match` lists extra paths that should highlight the link, e.g. workshops live under Services. */
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services', match: ['/workshops'] },
  { to: '/portfolio', label: 'Portfolio', match: ['/portfolio/lockeroom'] },
  { to: '/contact', label: 'Contact' },
];

const isActive = (link, pathname) => link.to === pathname || Boolean(link.match?.includes(pathname));

function Wordmark() {
  return (
    <img
      src="/brand/renatus-logo.svg"
      alt="Renatus"
      width="154"
      height="28"
      className="block h-7 w-auto"
    />
  );
}

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const [solid, setSolid] = useState(false);
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollY, 'change', (y) => {
    setSolid(y > 16);
  });

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-spring origin-left z-[60]"
        style={{ scaleX }}
      />
      <header
        className={`site-nav fixed top-0 left-0 right-0 z-50 mt-[2px] ${
          solid ? 'site-nav--solid' : ''
        }`}
      >
        <div
          className={`absolute inset-0 pointer-events-none ${
            solid
              ? 'bg-canvas'
              : 'bg-gradient-to-b from-canvas via-canvas/80 to-transparent'
          }`}
        />

        <nav className="site-nav__inner relative max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20">
          <Link to="/" className="relative z-10">
            <Wordmark />
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`site-nav__link label-upper transition-colors duration-300 hover:text-forest ${
                  isActive(link, location.pathname) ? 'site-nav__link--active text-forest' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            <EnquireNowButton className="btn-primary text-sm py-2.5 px-5" />
          </div>

          <button
            className="lg:hidden relative z-10 w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              className="block w-6 h-px bg-ink"
              animate={mobileOpen ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="block w-6 h-px bg-ink"
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block w-6 h-px bg-ink"
              animate={mobileOpen ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed inset-0 bg-canvas z-40 flex flex-col items-center justify-center gap-8"
            >
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    className={`heading-display text-4xl transition-colors hover:text-spring ${
                      isActive(link, location.pathname) ? 'text-spring' : 'text-ink'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <EnquireNowButton
                  className="btn-primary mt-4"
                  onClick={() => setMobileOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
