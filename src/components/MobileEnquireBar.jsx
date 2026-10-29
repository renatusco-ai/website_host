import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEnquiry } from '../context/EnquiryContext';

/** Scroll depth (px) before the bar appears, so it never competes with the hero CTA. */
const SHOW_AFTER = 520;

export default function MobileEnquireBar() {
  const { pathname } = useLocation();
  const { isOpen, openEnquiry } = useEnquiry();
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setPastHero(y > SHOW_AFTER);
  });

  const visible = pastHero && !isOpen && pathname !== '/contact';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="mobile-enquire-bar"
          initial={{ y: '140%' }}
          animate={{ y: 0 }}
          exit={{ y: '140%' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>Free 15-minute conversation</p>
          <button type="button" className="btn-primary" onClick={() => openEnquiry('general')}>
            Enquire Now
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
