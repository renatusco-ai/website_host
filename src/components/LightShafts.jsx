import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const BEAMS = [
  { side: 'left', left: '-5%', width: '18%', angle: -14, color: 'marble', delay: 0 },
  { side: 'left', left: '3%', width: '10%', angle: -8, color: 'gold', delay: 1.5 },
  { side: 'right', right: '-4%', width: '16%', angle: 12, color: 'marble', delay: 0.8 },
  { side: 'right', right: '2%', width: '8%', angle: 18, color: 'gold', delay: 2.2 },
];

const COLORS = {
  marble: { from: 'rgba(240,235,227,0.14)', mid: 'rgba(240,235,227,0.05)', to: 'transparent' },
  gold: { from: 'rgba(196,162,101,0.10)', mid: 'rgba(196,162,101,0.03)', to: 'transparent' },
};

function DustParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 20}%`,
        right: `${5 + Math.random() * 20}%`,
        side: i < 9 ? 'left' : 'right',
        size: 1.5 + Math.random() * 2.5,
        startY: 30 + Math.random() * 50,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * -12,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            ...(p.side === 'left' ? { left: p.left } : { right: p.right }),
            top: `${p.startY}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(240,235,227,0.8)',
          }}
          animate={{
            y: [0, -60, -120],
            x: [0, 8, -4],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}

export default function LightShafts() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();

  const beamOpacity = useTransform(scrollYProgress, [0, 0.1, 0.45, 0.7, 1], [0.5, 1, 1, 0.5, 0]);
  const dustOpacity = useTransform(scrollYProgress, [0, 0.1, 0.5, 0.75, 1], [0.4, 1, 1, 0.4, 0]);

  return (
    <motion.div
      ref={ref}
      className="fixed inset-0 z-[2] pointer-events-none overflow-hidden"
      style={{ opacity: beamOpacity }}
    >
      {BEAMS.map((beam, i) => {
        const pos = beam.side === 'left' ? { left: beam.left } : { right: beam.right };
        const col = COLORS[beam.color];

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              ...pos,
              top: '-40%',
              width: beam.width,
              height: '180%',
              background: `linear-gradient(180deg, ${col.from} 0%, ${col.mid} 35%, ${col.to} 70%)`,
              transform: `rotate(${beam.angle}deg)`,
              transformOrigin: 'top center',
              mixBlendMode: 'screen',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: beam.delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      <motion.div style={{ opacity: dustOpacity }}>
        <DustParticles />
      </motion.div>
    </motion.div>
  );
}
