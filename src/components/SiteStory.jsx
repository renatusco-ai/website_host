import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import SoftwareStoryGraphic from './SoftwareStoryGraphic';

export const STORY_PAGE_TRANSITION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export function StoryHero({
  eyebrow,
  title,
  lead,
  graphic,
  actions,
  note,
  compact = false,
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const graphicY = useTransform(scrollYProgress, [0, 1], [0, -65]);

  return (
    <section
      ref={ref}
      className={`site-story-hero${compact ? ' site-story-hero--compact' : ''}`}
    >
      <div className="site-story-hero__grid" aria-hidden="true" />
      <motion.div
        className="site-story-hero__orb site-story-hero__orb--top"
        style={reduceMotion ? undefined : { y: graphicY }}
        aria-hidden="true"
      />
      <motion.div
        className="site-story-hero__orb site-story-hero__orb--bottom"
        style={reduceMotion ? undefined : { y: copyY }}
        aria-hidden="true"
      />

      <div className="site-story-hero__inner">
        <motion.div
          className="site-story-hero__copy"
          style={reduceMotion ? undefined : { y: copyY }}
        >
          <motion.p
            className="site-story-eyebrow"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="site-story-hero__lead"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.3 }}
          >
            {lead}
          </motion.p>
          {actions && (
            <motion.div
              className="site-story-hero__actions"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.42 }}
            >
              {actions}
            </motion.div>
          )}
          {note && (
            <motion.p
              className="site-story-hero__note"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              {note}
            </motion.p>
          )}
        </motion.div>

        {graphic && (
          <motion.div
            className="site-story-hero__visual"
            style={reduceMotion ? undefined : { y: graphicY }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, rotate: 1.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <SoftwareStoryGraphic type={graphic} />
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function StoryStatement({ eyebrow, children, body, tone = 'cream' }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={`site-story-statement site-story-statement--${tone}`}>
      <motion.div
        className="site-story-statement__inner"
        initial={reduceMotion ? false : { opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        {eyebrow && <p className="site-story-eyebrow">{eyebrow}</p>}
        <h2>{children}</h2>
        {body && <p className="site-story-statement__body">{body}</p>}
      </motion.div>
    </section>
  );
}

export function StorySectionHeading({ number, eyebrow, title, body, align = 'left' }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      className={`site-story-section-heading site-story-section-heading--${align}`}
      initial={reduceMotion ? false : { opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {number && <span className="site-story-section-heading__number">{number}</span>}
      <div>
        {eyebrow && <p className="site-story-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {body && <p>{body}</p>}
      </div>
    </motion.header>
  );
}

export function StoryCloser({ eyebrow, title, body, children }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="site-story-closer">
      <div className="site-story-closer__rings" aria-hidden="true" />
      <motion.div
        className="site-story-closer__inner"
        initial={reduceMotion ? false : { opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        {eyebrow && <p className="site-story-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {body && <p>{body}</p>}
        {children && <div className="site-story-closer__actions">{children}</div>}
      </motion.div>
    </section>
  );
}
