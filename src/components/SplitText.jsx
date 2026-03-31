import { motion } from 'framer-motion';

const charVariants = {
  hidden: {
    y: 100,
    opacity: 0,
    rotateX: 40,
  },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: 0.8,
      delay: i * 0.06,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function SplitText({ text, className = '', as: Tag = 'h1' }) {
  const letters = text.split('');

  return (
    <Tag className={className} style={{ perspective: '1000px' }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex overflow-hidden">
        {letters.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            custom={i}
            variants={charVariants}
            initial="hidden"
            animate="visible"
            className="inline-block"
            style={{
              transformOrigin: 'bottom center',
              willChange: 'transform, opacity',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    </Tag>
  );
}
