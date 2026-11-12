import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import EnquireNowButton from './EnquireNowButton';
import useMissionTotal from '../hooks/useMissionTotal';
import {
  MISSION_GOAL,
  MISSION_MILESTONES,
  formatDollars,
  formatShare,
  missionProgress,
} from '../data/mission';

const EASE = [0.16, 1, 0.3, 1];
const COUNT_SECONDS = 1.9;
const FILL_DELAY = 1.7;

const MILESTONE_LABELS = ['$100k', '$1M', '$10M', '$100M'];

function LiveFigure({ value, reduceMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(reduceMotion ? value : 0);
  const text = useTransform(count, (n) => formatDollars(n));

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return undefined;
    }
    if (!inView) return undefined;
    // Animates from wherever the counter is now, so a live update does not restart at 0.
    const controls = animate(count, value, { duration: COUNT_SECONDS, ease: EASE });
    return () => controls.stop();
  }, [value, inView, reduceMotion, count]);

  return (
    <p
      className="mission-figure"
      ref={ref}
      style={{ '--mission-chars': Math.max(8, formatDollars(value).length) }}
    >
      <span className="sr-only">{formatDollars(value)}</span>
      <motion.span className="mission-figure__value" aria-hidden="true">
        {text}
      </motion.span>
    </p>
  );
}

function MissionTrack({ value, reduceMotion }) {
  const { fraction, reached, linearShare } = missionProgress(value);
  const progress = useMotionValue(reduceMotion ? fraction : 0);
  const firstDraw = useRef(true);
  const headLeft = useTransform(
    progress,
    (f) => `clamp(0.4rem, ${f * 100}%, calc(100% - 0.4rem))`,
  );
  const labelLeft = useTransform(
    progress,
    (f) => `clamp(1.5rem, ${f * 100}%, calc(100% - 1.5rem))`,
  );

  // The fill and the "Today" head share one value so they always move together.
  // Later live updates animate from the current position, not from 0.
  useEffect(() => {
    if (reduceMotion) {
      progress.set(fraction);
      return undefined;
    }
    const first = firstDraw.current;
    firstDraw.current = false;
    const controls = animate(progress, fraction, {
      duration: first ? 1.4 : 0.9,
      delay: first ? FILL_DELAY : 0,
      ease: EASE,
    });
    return () => controls.stop();
  }, [fraction, reduceMotion, progress]);
  const share = formatShare(linearShare);
  const total = MISSION_MILESTONES.length;

  // Marks light up once the first fill has drawn in past them.
  const [settled, setSettled] = useState(Boolean(reduceMotion));
  const [arrived, setArrived] = useState(Boolean(reduceMotion));
  useEffect(() => {
    if (reduceMotion) {
      setSettled(true);
      setArrived(true);
      return undefined;
    }
    const marks = setTimeout(() => setSettled(true), (FILL_DELAY + 0.9) * 1000);
    const head = setTimeout(() => setArrived(true), (FILL_DELAY + 1.4) * 1000);
    return () => {
      clearTimeout(marks);
      clearTimeout(head);
    };
  }, [reduceMotion]);
  const lit = settled ? reached : 0;

  return (
    <div className="mission-track">
      <div
        className="mission-track__bar"
        role="progressbar"
        aria-label="Progress to the $100 million mission"
        aria-valuemin={0}
        aria-valuemax={MISSION_GOAL}
        aria-valuenow={Math.min(value, MISSION_GOAL)}
        aria-valuetext={`${formatDollars(value)} saved every year, ${share}% of the way to ${formatDollars(MISSION_GOAL)}`}
      >
        <div className="mission-track__rail" />
        <motion.div
          className="mission-track__fill"
          style={{ scaleX: progress }}
        />
        <motion.span
          className={`mission-track__head${arrived ? ' is-arrived' : ''}`}
          style={{ left: headLeft }}
          aria-hidden="true"
        />
        {MISSION_MILESTONES.map((m, i) => (
          <span
            key={m}
            className={`mission-track__mark${i < lit ? ' is-reached' : ''}${
              i === total - 1 ? ' is-last' : ''
            }`}
            style={{ left: `${((i + 1) / total) * 100}%` }}
          />
        ))}
      </div>
      <motion.span
        className={`mission-track__today${arrived ? ' is-arrived' : ''}`}
        style={{ left: labelLeft }}
        aria-hidden="true"
      >
        Today
      </motion.span>
      <div className="mission-track__labels" aria-hidden="true">
        <span className="mission-track__label mission-track__label--start">$0</span>
        {MISSION_MILESTONES.map((m, i) => (
          <span
            key={m}
            className={`mission-track__label${i < lit ? ' is-reached' : ''}${
              i === total - 1 ? ' mission-track__label--end' : ''
            }`}
            style={{ left: `${((i + 1) / total) * 100}%` }}
          >
            {MILESTONE_LABELS[i]}
          </span>
        ))}
      </div>
      <p className="mission-track__share">
        {share}% of the way to {formatDollars(MISSION_GOAL)}
      </p>
    </div>
  );
}

export default function MissionHero() {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { confirmedAnnualSaving } = useMissionTotal();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const orbTopY = useTransform(scrollYProgress, [0, 1], [0, -65]);
  const orbBottomY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const rise = (y, duration, delay) => ({
    initial: reduceMotion ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: EASE },
  });

  return (
    <section ref={ref} className="site-story-hero mission-hero">
      <div className="site-story-hero__grid" aria-hidden="true" />
      <motion.div
        className="site-story-hero__orb site-story-hero__orb--top"
        style={reduceMotion ? undefined : { y: orbTopY }}
        aria-hidden="true"
      />
      <motion.div
        className="site-story-hero__orb site-story-hero__orb--bottom"
        style={reduceMotion ? undefined : { y: orbBottomY }}
        aria-hidden="true"
      />

      <div className="mission-hero__inner">
        <motion.p className="site-story-eyebrow" {...rise(18, 0.6, 0.08)}>
          Our mission
        </motion.p>
        <motion.h1 {...rise(32, 0.85, 0.16)}>
          We&rsquo;re on a mission to save businesses <em>$100 million</em> in
          recurring expenses.
        </motion.h1>

        <motion.div className="mission-hero__stat" {...rise(24, 0.8, 0.3)}>
          <p className="mission-live">
            <span className="mission-live__dot" aria-hidden="true" />
            Live
          </p>
          <LiveFigure value={confirmedAnnualSaving} reduceMotion={reduceMotion} />
          <p className="mission-hero__caption">
            saved every year for the businesses we work with, so far.
          </p>
        </motion.div>

        <motion.div {...rise(18, 0.7, 0.42)}>
          <MissionTrack value={confirmedAnnualSaving} reduceMotion={reduceMotion} />
        </motion.div>

        <div className="mission-hero__foot">
          <motion.p className="site-story-hero__lead" {...rise(22, 0.72, 0.5)}>
            We build custom software and business automation around the way your
            team works, then lead the change so your people actually use it. That
            is how productivity goes up while costs come down.
          </motion.p>
          <div className="mission-hero__cta">
            <motion.div className="site-story-hero__actions" {...rise(18, 0.65, 0.58)}>
              <EnquireNowButton />
              <Link to="/portfolio/lockeroom" className="link-arrow max-w-xs">
                See the $266k result &rarr;
              </Link>
            </motion.div>
            <motion.p
              className="site-story-hero__note"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Free 15-minute first conversation. We reply within 24 hours.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
