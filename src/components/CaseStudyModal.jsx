import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function CaseStudyModal({ study, onClose }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [study]);

  useEffect(() => {
    if (!study) return undefined;

    const count = study.media?.length ?? 0;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, count - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [study, onClose]);

  const media = study?.media ?? [];
  const current = media[index];
  const hasMultiple = media.length > 1;

  return (
    <AnimatePresence>
      {study && current && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className="relative w-full max-w-5xl"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={study.title}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-9 right-0 text-cream/70 hover:text-cream text-sm flex items-center gap-1.5 transition-colors"
            >
              Close
              <span className="text-lg leading-none" aria-hidden="true">&times;</span>
            </button>

            <div className="overflow-hidden rounded-xl border border-mist bg-paper shadow-2xl">
              {/* Designed browser frame */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-mist bg-cream">
                <span className="w-3 h-3 rounded-full bg-[#e6685b]" />
                <span className="w-3 h-3 rounded-full bg-[#f0bf4c]" />
                <span className="w-3 h-3 rounded-full bg-[#5fb85f]" />
                <div className="ml-3 flex-1 max-w-xs">
                  <div className="text-[0.7rem] text-sage bg-paper border border-mist rounded-full px-3 py-1 truncate">
                    app.lockeroom.com
                  </div>
                </div>
                <span className="label-upper hidden sm:block">{study.industry}</span>
              </div>

              {/* Image stage */}
              <div className="relative bg-ink/[0.03] flex items-center justify-center">
                <img
                  src={current.src}
                  alt={current.caption || study.title}
                  className={`w-full max-h-[68vh] object-contain ${current.placeholder ? 'blur-[6px]' : ''}`}
                />

                {current.placeholder && (
                  <span className="absolute top-3 left-3 text-[0.6rem] uppercase tracking-wider text-cream bg-ink/70 px-2.5 py-1 rounded">
                    Preview: anonymised capture pending
                  </span>
                )}

                {hasMultiple && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                      disabled={index === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper/90 border border-mist flex items-center justify-center text-ink text-xl leading-none disabled:opacity-30 hover:bg-paper transition-colors"
                      aria-label="Previous image"
                    >
                      &lsaquo;
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndex((i) => Math.min(i + 1, media.length - 1))}
                      disabled={index === media.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper/90 border border-mist flex items-center justify-center text-ink text-xl leading-none disabled:opacity-30 hover:bg-paper transition-colors"
                      aria-label="Next image"
                    >
                      &rsaquo;
                    </button>
                  </>
                )}
              </div>

              {/* Caption + gallery dots */}
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-mist">
                <div className="min-w-0">
                  <h3 className="heading-display text-lg text-ink">{study.title}</h3>
                  {current.caption && (
                    <p className="text-sage text-sm mt-0.5">{current.caption}</p>
                  )}
                </div>
                {hasMultiple && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {media.map((item, i) => (
                      <button
                        key={item.src}
                        type="button"
                        onClick={() => setIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === index ? 'bg-gold' : 'bg-mist hover:bg-sage'
                        }`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
