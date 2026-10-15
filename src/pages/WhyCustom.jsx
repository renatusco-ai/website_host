import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import EnquireNowButton from '../components/EnquireNowButton';
import SoftwareStoryGraphic from '../components/SoftwareStoryGraphic';

const CHAPTERS = [
  {
    number: '01',
    eyebrow: 'Once upon a time',
    title: 'Software was only for companies with deep pockets.',
    body: [
      'A serious system needed a team of 20 or more: engineers, designers, project managers, executives and the funding to keep them in a room for a year.',
      'Builds cost hundreds of thousands — sometimes millions — before the first customer could use them.',
    ],
    stat: '$100k–$1m+',
    statLabel: 'traditional build economics',
    graphic: 'team',
  },
  {
    number: '02',
    eyebrow: 'The maths shaped the product',
    title: 'To earn that money back, software had to serve everyone.',
    body: [
      'Big build cost demanded a big market. The winning product was not the one that understood one business deeply. It was the one that could be sold to thousands of businesses adequately.',
      'So software became general by design: common features, common workflows, common assumptions.',
    ],
    stat: 'One size',
    statLabel: 'designed to fit most',
    graphic: 'market',
  },
  {
    number: '03',
    eyebrow: 'But you are not most businesses',
    title: 'The thing that makes you different is exactly where generic software fails.',
    body: [
      'If you are pioneering a category, creating a better operating model or simply serving customers differently, your process is not an inconvenience. It is your edge.',
      'Settling for the same tools as everyone else means forcing that edge into somebody else’s idea of how your business should work.',
    ],
    pullQuote: 'Your difference is not a bug to work around. It is the value.',
    graphic: 'pioneer',
  },
  {
    number: '04',
    eyebrow: 'One gap becomes another subscription',
    title: 'Then the stack starts quietly compounding.',
    body: [
      'The first tool almost fits. A second fills the reporting gap. A third handles forms. Another connects the first three. Each feels essential. Each new seat feels small.',
      'Against the growth of the whole business, no single bill looks alarming. Together, per-seat pricing turns growth into an exponential software tax.',
    ],
    stat: 'Tools × seats',
    statLabel: 'the bill grows twice',
    graphic: 'stack',
  },
  {
    number: '05',
    eyebrow: 'The invoice is only the visible cost',
    title: 'Your team pays the rest in friction.',
    body: [
      'Duct-taped workflows. Re-keyed data. Spreadsheets that become critical infrastructure. Good team members ignoring protocol because the official process is too difficult.',
      'When something breaks, you join a queue, explain your business to a bot or a support desk without context, and wait. If you leave, your own data may be trapped in an export that the next tool cannot properly use.',
    ],
    stat: 'Time + trust',
    statLabel: 'lost outside the invoice',
    graphic: 'friction',
  },
  {
    number: '06',
    eyebrow: 'The economics have changed',
    title: 'Now your business can own the foundation.',
    body: [
      'Modern development and AI have collapsed the cost and team size required to build useful software. Custom is no longer reserved for venture-backed companies.',
      'We move the information scattered across your tools into one structured database you control. Your interface, automations, reporting and AI plug into that source of truth — not into one another.',
    ],
    pullQuote: 'Change the tool without rebuilding the business.',
    graphic: 'source',
  },
  {
    number: '07',
    eyebrow: 'This is not theoretical',
    title: 'The right system can pay for itself many times over.',
    body: [
      'For Lockeroom, replacing rented software and unnecessary operating overhead produced a documented net saving of $266,651 every year.',
      'The point is not to build custom software for everything. It is to find the expensive compromises, prove the saving, and only build where the numbers make sense.',
    ],
    stat: '$266,651',
    statLabel: 'documented annual saving',
    graphic: 'savings',
  },
];

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

function Chapter({ chapter, index }) {
  const isEven = index % 2 === 0;
  const reduceMotion = useReducedMotion();

  return (
    <section className={`story-chapter ${isEven ? 'story-chapter--left' : 'story-chapter--right'}`}>
      <motion.span
        className="story-chapter__node"
        initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {chapter.number}
      </motion.span>

      <motion.div
        className="story-chapter__copy"
        initial={reduceMotion ? false : { opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="story-chapter__eyebrow">{chapter.eyebrow}</p>
        <h2>{chapter.title}</h2>
        <div className="story-chapter__body">
          {chapter.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {chapter.pullQuote && (
          <p className="story-chapter__quote">{chapter.pullQuote}</p>
        )}
        {chapter.stat && (
          <div className="story-chapter__stat">
            <strong>{chapter.stat}</strong>
            <span>{chapter.statLabel}</span>
          </div>
        )}
      </motion.div>

      <motion.div
        className="story-chapter__visual"
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 100, rotate: isEven ? 1.5 : -1.5 }
        }
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <SoftwareStoryGraphic type={chapter.graphic} />
      </motion.div>
    </section>
  );
}

export default function WhyCustom() {
  const storyRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ['start 70%', 'end 55%'],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], [-120, 180]);
  const reverseY = useTransform(scrollYProgress, [0, 1], [180, -100]);

  return (
    <motion.div {...pageTransition} className="story-page">
      <section className="story-hero">
        <motion.div
          className="story-hero__orb story-hero__orb--one"
          aria-hidden="true"
          style={reduceMotion ? undefined : { y: backgroundY }}
        />
        <motion.div
          className="story-hero__orb story-hero__orb--two"
          aria-hidden="true"
          style={reduceMotion ? undefined : { y: reverseY }}
        />
        <div className="story-hero__inner">
          <motion.p
            className="story-hero__eyebrow"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            The economics of custom software
          </motion.p>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Learn how businesses are making{' '}
            <span>crazy savings.</span>
          </motion.h1>
          <motion.p
            className="story-hero__lead"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.38 }}
          >
            The old reason for renting generic software has disappeared.
            The bills have not.
          </motion.p>
          <motion.a
            href="#the-story"
            className="story-scroll-cue"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            Follow the story
            <span aria-hidden="true">↓</span>
          </motion.a>
        </div>
      </section>

      <div className="story-transition" aria-hidden="true">
        <span>Build</span>
        <span>Rent</span>
        <span>Own</span>
      </div>

      <div id="the-story" ref={storyRef} className="story-timeline">
        <svg
          className="story-timeline__path"
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M50 0 C8 90 90 155 50 245 C10 335 88 405 50 500 C12 590 90 660 50 750 C15 830 74 900 50 1000" />
          <motion.path
            d="M50 0 C8 90 90 155 50 245 C10 335 88 405 50 500 C12 590 90 660 50 750 C15 830 74 900 50 1000"
            className="story-timeline__path-progress"
            style={{ pathLength: reduceMotion ? 1 : scrollYProgress }}
          />
        </svg>

        {CHAPTERS.map((chapter, index) => (
          <Chapter key={chapter.number} chapter={chapter} index={index} />
        ))}
      </div>

      <section className="story-ending">
        <motion.p
          className="story-ending__eyebrow"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          The new default
        </motion.p>
        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          Stop renting compromises.
          <br />
          <em>Own what makes you different.</em>
        </motion.h2>
        <motion.div
          className="story-ending__actions"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <EnquireNowButton inquire="subscription" className="btn-primary">
            Find the saving
          </EnquireNowButton>
          <Link to="/portfolio/lockeroom">
            See the documented numbers <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
