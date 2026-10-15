import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SchedulingEmbed from './SchedulingEmbed';
import { BOOKING_SESSIONS } from '../data/content';

const PREP_ITEMS = [
  'Your biggest operational pain points right now',
  'Where manual work or broken systems are slowing the team down',
  'Roughly what it is costing you in time, money, or missed opportunity',
];

export default function BookingModal({ isOpen, bookingType = 'discovery', onClose }) {
  const session = BOOKING_SESSIONS[bookingType] || BOOKING_SESSIONS.discovery;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="booking-modal" role="presentation">
          <motion.button
            type="button"
            className="booking-modal__backdrop"
            aria-label="Close booking modal"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            className="booking-modal__panel"
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

            <p className="section-eyebrow mb-4">{session.eyebrow}</p>
            <h2 id="booking-modal-title" className="heading-display text-3xl md:text-4xl text-ink mb-4">
              {session.title}
            </h2>
            <p className="text-graphite text-sm leading-relaxed mb-6">{session.description}</p>

            {bookingType === 'discovery' && (
              <div className="mb-8 p-5 bg-cloud border border-smoke rounded-xl">
                <p className="label-upper mb-4">Please prepare</p>
                <ul className="space-y-3">
                  {PREP_ITEMS.map((item) => (
                    <li key={item} className="text-graphite text-sm flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-spring mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <SchedulingEmbed
              key={bookingType}
              title="Pick a time"
              embedPath={session.embedPath}
              url={session.url}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
