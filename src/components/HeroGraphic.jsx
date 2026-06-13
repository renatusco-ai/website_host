import { motion } from 'framer-motion';

const CHAOS_PATHS = [
  { d: 'M40,120 C90,80 70,180 150,150 S240,210 295,235', gold: false },
  { d: 'M50,205 C110,175 120,255 180,225 S250,250 296,240', gold: true },
  { d: 'M45,300 C100,330 130,250 175,290 S250,260 295,246', gold: false },
  { d: 'M72,362 C120,342 150,300 200,300 S262,252 296,244', gold: false },
  { d: 'M35,162 C80,152 92,212 160,186 S250,232 295,238', gold: false },
  { d: 'M60,92 C130,72 150,142 210,132 S270,226 296,236', gold: true },
  { d: 'M56,262 C96,252 120,300 186,262 S256,256 295,243', gold: false },
];

const CHAOS_MARKERS = [
  { x: 96, y: 118, type: 'tri' },
  { x: 124, y: 252, type: 'sq' },
  { x: 176, y: 184, type: 'dot' },
  { x: 150, y: 322, type: 'sq' },
  { x: 212, y: 132, type: 'tri' },
  { x: 84, y: 196, type: 'dot' },
];

const FOCAL = { x: 300, y: 240 };

const NODES = {
  n1: { x: 360, y: 150 },
  n2: { x: 360, y: 250 },
  n3: { x: 360, y: 330 },
  n5: { x: 430, y: 172 },
  n6: { x: 430, y: 256 },
  n7: { x: 430, y: 332 },
  n8: { x: 500, y: 122 },
  n9: { x: 500, y: 208 },
  n10: { x: 500, y: 296 },
  n11: { x: 500, y: 374 },
  n13: { x: 562, y: 250 },
  bar: { x: 432, y: 92, icon: 'bar' },
  user: { x: 564, y: 158, icon: 'user' },
  db: { x: 562, y: 344, icon: 'db' },
  pie: { x: 470, y: 414, icon: 'pie' },
};

const EDGES = [
  ['n1', 'n5'], ['n5', 'bar'], ['n5', 'n8'], ['n8', 'user'],
  ['n2', 'n6'], ['n6', 'n9'], ['n9', 'n13'], ['n9', 'n8'],
  ['n3', 'n7'], ['n7', 'n10'], ['n10', 'db'], ['n10', 'n11'],
  ['n11', 'pie'], ['n6', 'n5'], ['n9', 'n10'],
];

const BUNDLE = ['n1', 'n2', 'n3'];

function NodeIcon({ icon }) {
  if (icon === 'bar') {
    return (
      <g stroke="var(--color-gold)" strokeWidth="1.4" fill="none">
        <line x1="-5" y1="3" x2="-5" y2="-2" />
        <line x1="0" y1="3" x2="0" y2="-5" />
        <line x1="5" y1="3" x2="5" y2="-1" />
      </g>
    );
  }
  if (icon === 'user') {
    return (
      <g stroke="var(--color-forest)" strokeWidth="1.4" fill="none">
        <circle cx="0" cy="-3" r="3" />
        <path d="M-5,6 C-5,1 5,1 5,6" />
      </g>
    );
  }
  if (icon === 'db') {
    return (
      <g stroke="var(--color-gold)" strokeWidth="1.4" fill="none">
        <ellipse cx="0" cy="-4" rx="5" ry="2" />
        <path d="M-5,-4 V4 C-5,6 5,6 5,4 V-4" />
      </g>
    );
  }
  return (
    <g stroke="var(--color-forest)" strokeWidth="1.4" fill="none">
      <circle cx="0" cy="0" r="5" />
      <line x1="0" y1="0" x2="0" y2="-5" />
      <line x1="0" y1="0" x2="4.5" y2="2" />
    </g>
  );
}

export default function HeroGraphic() {
  return (
    <motion.div
      className="w-full"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 600 480"
        fill="none"
        className="w-full h-auto"
        aria-hidden="true"
      >
        {/* Chaotic data on the left */}
        {CHAOS_PATHS.map((p, i) => (
          <motion.path
            key={`chaos-${i}`}
            d={p.d}
            stroke={p.gold ? 'var(--color-gold)' : 'var(--color-sage)'}
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity={p.gold ? 0.65 : 0.45}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: p.gold ? 0.65 : 0.45 }}
            transition={{ duration: 1.6, delay: 0.1 + i * 0.12, ease: 'easeInOut' }}
          />
        ))}

        {CHAOS_MARKERS.map((m, i) => (
          <motion.g
            key={`marker-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.55, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            {m.type === 'tri' && (
              <path
                d={`M${m.x},${m.y - 4} L${m.x + 4},${m.y + 3} L${m.x - 4},${m.y + 3} Z`}
                fill="var(--color-sage)"
              />
            )}
            {m.type === 'sq' && (
              <rect x={m.x - 3} y={m.y - 3} width="6" height="6" fill="var(--color-gold)" opacity="0.7" />
            )}
            {m.type === 'dot' && <circle cx={m.x} cy={m.y} r="3" fill="var(--color-sage)" />}
          </motion.g>
        ))}

        {/* Converging bundle */}
        {BUNDLE.map((id, i) => (
          <motion.path
            key={`bundle-${id}`}
            d={`M${FOCAL.x},${FOCAL.y} C${FOCAL.x + 25},${FOCAL.y} ${NODES[id].x - 25},${NODES[id].y} ${NODES[id].x},${NODES[id].y}`}
            stroke="var(--color-forest)"
            strokeWidth="1.2"
            opacity="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 1.1 + i * 0.1, ease: 'easeInOut' }}
          />
        ))}
        <motion.circle
          cx={FOCAL.x}
          cy={FOCAL.y}
          r="4"
          fill="var(--color-gold)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />

        {/* Structured grid edges */}
        {EDGES.map(([a, b], i) => (
          <motion.line
            key={`edge-${i}`}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="var(--color-forest)"
            strokeWidth="1.2"
            opacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 0.6, delay: 1.5 + i * 0.05, ease: 'easeInOut' }}
          />
        ))}

        {/* Structured grid nodes */}
        {Object.entries(NODES).map(([id, n], i) => (
          <motion.g
            key={`node-${id}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 1.7 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            {n.icon ? (
              <>
                <circle cx={n.x} cy={n.y} r="15" fill="var(--color-paper)" stroke="var(--color-mist)" strokeWidth="1.2" />
                <g transform={`translate(${n.x}, ${n.y})`}>
                  <NodeIcon icon={n.icon} />
                </g>
              </>
            ) : (
              <circle
                cx={n.x}
                cy={n.y}
                r={id === 'n6' || id === 'n9' ? 6 : 5}
                fill={id === 'n6' || id === 'n10' || id === 'n8' ? 'var(--color-gold)' : 'var(--color-forest)'}
              />
            )}
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
}
