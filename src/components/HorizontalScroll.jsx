import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ITEMS = [
  {
    number: '01',
    title: 'Intelligent Workflows',
    description:
      'AI agents that understand your operations and automate repetitive processes — from data entry to decision routing.',
    detail: 'Process mapping & redesign, AI agent deployment, real-time monitoring.',
  },
  {
    number: '02',
    title: 'Systems Architecture',
    description:
      'Custom-built automation infrastructure that connects your tools, centralises your data, and eliminates manual handoffs.',
    detail: 'API orchestration, data pipeline architecture, cross-platform sync.',
  },
  {
    number: '03',
    title: 'Continuous Optimisation',
    description:
      'Self-improving systems that learn from every interaction, surfacing insights and tightening efficiency over time.',
    detail: 'Automated dashboards, anomaly detection, predictive analytics.',
  },
];

function Card({ item, index }) {
  return (
    <div className="w-[85vw] md:w-[70vw] lg:w-[55vw] h-full flex-shrink-0 flex items-center px-6 md:px-12">
      <div className="w-full">
        <div className="flex items-start gap-6 md:gap-10">
          <span className="heading-display text-[8rem] md:text-[12rem] leading-none text-marble/[0.04] select-none flex-shrink-0">
            {item.number}
          </span>
          <div className="pt-6 md:pt-12 max-w-xl">
            <h3 className="heading-display text-4xl sm:text-5xl md:text-6xl text-marble mb-6 leading-tight">
              {item.title}
            </h3>
            <p className="text-stone text-base md:text-lg leading-relaxed mb-8">
              {item.description}
            </p>
            <p className="text-stone/50 text-sm leading-relaxed border-t border-marble/10 pt-6">
              {item.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HorizontalScroll() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', `-${(ITEMS.length - 1) * (100 / ITEMS.length)}%`]
  );

  return (
    <>
      {/* Mobile: vertical stack */}
      <section className="md:hidden relative z-10 py-24 px-6 bg-black/65 backdrop-blur-[4px]">
        <p className="label-upper text-gold mb-16">What We Deliver</p>
        <div className="space-y-16">
          {ITEMS.map((item) => (
            <div key={item.number}>
              <span className="heading-display text-6xl text-marble/[0.06] block mb-4">
                {item.number}
              </span>
              <h3 className="heading-display text-3xl text-marble mb-4">{item.title}</h3>
              <p className="text-stone text-sm leading-relaxed mb-4">{item.description}</p>
              <p className="text-stone/50 text-xs leading-relaxed border-t border-marble/10 pt-4">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Desktop: horizontal scroll */}
      <div
        ref={containerRef}
        className="hidden md:block z-10"
        style={{ height: `${(ITEMS.length - 0.8) * 100}vh`, position: 'relative' }}
      >
        <div className="sticky top-0 h-screen overflow-hidden bg-black/70">
          <div className="absolute top-12 left-6 md:left-12 z-20">
            <p className="label-upper text-gold">What We Deliver</p>
          </div>

          <motion.div
            className="flex h-full items-center"
            style={{
              x,
              width: `${ITEMS.length * 100}%`,
              willChange: 'transform',
            }}
          >
            {ITEMS.map((item, i) => (
              <Card key={item.number} item={item} index={i} />
            ))}
          </motion.div>

          {/* Progress dots */}
          <ProgressDots scrollYProgress={scrollYProgress} count={ITEMS.length} />
        </div>
      </div>
    </>
  );
}

function ProgressDots({ scrollYProgress, count }) {
  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
      {Array.from({ length: count }, (_, i) => (
        <ProgressDot key={i} index={i} count={count} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function ProgressDot({ index, count, scrollYProgress }) {
  const segmentSize = 1 / count;
  const start = index * segmentSize;
  const end = start + segmentSize;

  const opacity = useTransform(
    scrollYProgress,
    [start, start + segmentSize * 0.3, end - segmentSize * 0.3, end],
    [0.2, 1, 1, 0.2]
  );

  const scale = useTransform(
    scrollYProgress,
    [start, start + segmentSize * 0.3, end - segmentSize * 0.3, end],
    [1, 1.5, 1.5, 1]
  );

  return (
    <motion.div
      className="w-2 h-2 rounded-full bg-gold"
      style={{ opacity, scale }}
    />
  );
}
