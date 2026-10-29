import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import SavingBreakdown from './SavingBreakdown';
import SoftwareStoryGraphic from './SoftwareStoryGraphic';

function ChapterVisual({ visual, imageY }) {
  switch (visual.kind) {
    case 'photo':
      return (
        <div className="founder-chapter__photo">
          <motion.img src={visual.src} alt={visual.alt} loading="lazy" style={{ y: imageY }} />
        </div>
      );
    case 'metrics':
      return (
        <div className="founder-chapter__metrics">
          {visual.items.map((item) => (
            <div key={item.label}>
              <p className="heading-display">{item.value}</p>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      );
    case 'graphic':
      return <SoftwareStoryGraphic type={visual.type} />;
    case 'saving':
      return <SavingBreakdown />;
    default: {
      const exhaustive = visual.kind;
      throw new Error(`Unhandled founder chapter visual: ${exhaustive}`);
    }
  }
}

export default function FounderChapter({ chapter, index }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const visualY = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const copyY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const number = String(index + 1).padStart(2, '0');

  return (
    <section
      ref={ref}
      className={`founder-chapter${index % 2 ? ' founder-chapter--reverse' : ''}`}
    >
      <span className="founder-chapter__ghost" aria-hidden="true">{number}</span>
      <div className="founder-chapter__inner">
        <motion.div
          className="founder-chapter__copy"
          style={reduceMotion ? undefined : { y: copyY }}
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="site-story-eyebrow">
            {number} &middot; {chapter.stage}
          </p>
          <h2>{chapter.title}</h2>
          <p className="founder-chapter__body">{chapter.body}</p>
          {chapter.tags && (
            <ul className="founder-chapter__tags">
              {chapter.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
          {chapter.stats && (
            <dl className="founder-chapter__stats">
              {chapter.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd className="heading-display">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </motion.div>

        <motion.div
          className="founder-chapter__visual"
          style={reduceMotion ? undefined : { y: visualY }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChapterVisual visual={chapter.visual} imageY={reduceMotion ? 0 : imageY} />
        </motion.div>
      </div>
    </section>
  );
}
