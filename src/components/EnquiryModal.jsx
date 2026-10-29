import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import BookDemoForm from './BookDemoForm';

const INTRO = {
  general: {
    eyebrow: 'Enquiry',
    title: 'Tell us what is not working.',
    body: 'Fill this in and we will reply within 24 hours with an honest take.',
  },
  scoping: {
    eyebrow: '15 min · Free',
    title: 'AI & Ops Diagnostic',
    body: 'A quick, no-pressure conversation. You tell us what is broken. We tell you if it is worth a deeper look.',
  },
};

export default function EnquiryModal({ isOpen, intent = 'general', onClose }) {
  const intro = INTRO[intent] ?? INTRO.general;
  const lenis = useLenis();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      lenis?.start();
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, lenis]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="booking-modal" role="presentation" data-lenis-prevent>
          <motion.button
            type="button"
            className="booking-modal__backdrop"
            aria-label="Close enquiry form"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-modal-title"
            className="booking-modal__panel booking-modal__panel--form"
            data-lenis-prevent
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              className="booking-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>

            <p className="section-eyebrow mb-4">{intro.eyebrow}</p>
            <h2
              id="enquiry-modal-title"
              className="heading-display text-3xl md:text-4xl text-ink mb-3 pr-10"
            >
              {intro.title}
            </h2>
            <p className="text-graphite text-sm leading-relaxed mb-8">{intro.body}</p>

            <BookDemoForm
              key={intent}
              defaultIntent={intent}
              idPrefix="modal-"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
