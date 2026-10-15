import { motion, useReducedMotion } from 'framer-motion';
import { StorySectionHeading } from './SiteStory';
import { BUSINESS_TIMELINE } from '../data/content';

export default function BusinessTimeline() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="site-story-section change-timeline">
      <div className="site-story-section__inner">
        <StorySectionHeading
          align="center"
          eyebrow="How businesses change"
          title={
            <>
              The business grows. <em>The software stacks up.</em>
            </>
          }
          body="Every stage of growth gets solved with another subscription, until the team is working for the tools. The last step is the one we build with you."
        />

        <motion.ol
          className="change-timeline__track"
          initial={reduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <span className="change-timeline__rail" aria-hidden="true">
            <motion.span
              className="change-timeline__rail-progress"
              variants={{
                hidden: { scaleX: 0, scaleY: 0 },
                visible: {
                  scaleX: 1,
                  scaleY: 1,
                  transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            />
          </span>

          {BUSINESS_TIMELINE.map((step, index) => (
            <motion.li
              key={step.title}
              className={`change-timeline__step${step.ours ? ' change-timeline__step--ours' : ''}`}
              variants={{
                hidden: { opacity: 0, y: 28 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, delay: 0.15 + index * 0.18, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <span className="change-timeline__node" aria-hidden="true">
                {step.ours ? (
                  <img src="/brand/renatus-emblem.svg" alt="" width="22" height="22" />
                ) : (
                  String(index + 1).padStart(2, '0')
                )}
              </span>
              <div className="change-timeline__card">
                <p className="change-timeline__stage">{step.stage}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
