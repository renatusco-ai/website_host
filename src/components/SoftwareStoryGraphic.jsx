import { motion } from 'framer-motion';

const DRAW = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

const POP = {
  hidden: { opacity: 0, scale: 0.86 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

function GraphicFrame({ children, label }) {
  return (
    <motion.div
      className="story-graphic"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      aria-label={label}
      role="img"
    >
      <svg viewBox="0 0 520 360" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="518" height="358" rx="22" className="story-svg-frame" />
        {children}
      </svg>
    </motion.div>
  );
}

function TeamGraphic() {
  const people = Array.from({ length: 20 }, (_, index) => ({
    x: 54 + (index % 5) * 54,
    y: 62 + Math.floor(index / 5) * 52,
  }));

  return (
    <GraphicFrame label="A traditional software team of more than twenty people">
      <text x="40" y="32" className="story-svg-label">THE OLD BUILDING</text>
      {people.map((person, index) => (
        <motion.g key={`${person.x}-${person.y}`} variants={POP} custom={index * 0.025}>
          <circle cx={person.x} cy={person.y} r="8" className="story-svg-person" />
          <path
            d={`M${person.x - 13} ${person.y + 22} Q${person.x} ${person.y + 8} ${person.x + 13} ${person.y + 22}`}
            className="story-svg-line"
          />
        </motion.g>
      ))}
      <motion.path d="M332 55 V286" className="story-svg-divider" variants={DRAW} />
      <motion.g variants={POP} custom={0.3}>
        <text x="365" y="100" className="story-svg-number">$1m+</text>
        <text x="365" y="122" className="story-svg-small">BUILD BUDGET</text>
      </motion.g>
      <motion.g variants={POP} custom={0.45}>
        <text x="365" y="196" className="story-svg-number">18</text>
        <text x="365" y="218" className="story-svg-small">MONTHS</text>
      </motion.g>
      <motion.g variants={POP} custom={0.6}>
        <text x="365" y="292" className="story-svg-number">20+</text>
        <text x="365" y="314" className="story-svg-small">PEOPLE</text>
      </motion.g>
    </GraphicFrame>
  );
}

function MarketGraphic() {
  const shapes = [
    { x: 76, y: 96, type: 'circle' },
    { x: 76, y: 176, type: 'square' },
    { x: 76, y: 256, type: 'triangle' },
    { x: 444, y: 96, type: 'triangle' },
    { x: 444, y: 176, type: 'circle' },
    { x: 444, y: 256, type: 'square' },
  ];

  return (
    <GraphicFrame label="Different businesses being pushed through one generic product">
      <text x="40" y="32" className="story-svg-label">ONE PRODUCT. THE LARGEST POSSIBLE MARKET.</text>
      <motion.rect
        x="190"
        y="75"
        width="140"
        height="220"
        rx="18"
        className="story-svg-solid"
        variants={POP}
      />
      <text x="260" y="165" textAnchor="middle" className="story-svg-product">ONE</text>
      <text x="260" y="196" textAnchor="middle" className="story-svg-product">SIZE</text>
      <text x="260" y="227" textAnchor="middle" className="story-svg-product">FITS MOST</text>
      {shapes.map((shape, index) => (
        <motion.g key={`${shape.x}-${shape.y}`} variants={POP} custom={index * 0.08}>
          <motion.path
            d={`M${shape.x < 260 ? shape.x + 18 : shape.x - 18} ${shape.y} C${shape.x < 260 ? 125 : 395} ${shape.y}, ${shape.x < 260 ? 160 : 360} 180, ${shape.x < 260 ? 190 : 330} 180`}
            className="story-svg-flow"
            variants={DRAW}
          />
          {shape.type === 'circle' && <circle cx={shape.x} cy={shape.y} r="13" className="story-svg-shape" />}
          {shape.type === 'square' && <rect x={shape.x - 12} y={shape.y - 12} width="24" height="24" rx="4" className="story-svg-shape" />}
          {shape.type === 'triangle' && <path d={`M${shape.x} ${shape.y - 15} L${shape.x + 15} ${shape.y + 12} H${shape.x - 15} Z`} className="story-svg-shape" />}
        </motion.g>
      ))}
    </GraphicFrame>
  );
}

function PioneerGraphic() {
  return (
    <GraphicFrame label="A pioneer leaving the standard path">
      <text x="40" y="32" className="story-svg-label">THE DEFAULT PATH ENDS HERE</text>
      <motion.path d="M40 284 C150 284 185 250 252 190 S354 96 480 96" className="story-svg-road" variants={DRAW} />
      <motion.path d="M40 284 C150 284 185 250 252 190 C326 126 314 276 468 284" className="story-svg-gold-path" variants={DRAW} />
      {[95, 185, 274, 365, 445].map((x, index) => (
        <motion.circle key={x} cx={x} cy={index < 2 ? 284 - index * 18 : 96} r="5" className="story-svg-road-dot" variants={POP} custom={index * 0.1} />
      ))}
      <motion.g variants={POP} custom={0.65}>
        <circle cx="468" cy="284" r="22" className="story-svg-star-ring" />
        <path d="M468 267 L473 278 L485 280 L476 288 L478 301 L468 295 L457 301 L460 288 L450 280 L463 278 Z" className="story-svg-star" />
      </motion.g>
      <text x="335" y="68" className="story-svg-small">THE MARKET</text>
      <text x="385" y="332" className="story-svg-small story-svg-small--gold">YOUR EDGE</text>
    </GraphicFrame>
  );
}

function StackGraphic() {
  const tools = [
    { label: 'CRM', seats: '12 seats', amount: '$2,160/mo', y: 62 },
    { label: 'OPERATIONS', seats: '18 seats', amount: '$1,890/mo', y: 118 },
    { label: 'FORMS', seats: '9 seats', amount: '$630/mo', y: 174 },
    { label: 'REPORTING', seats: '7 seats', amount: '$980/mo', y: 230 },
    { label: 'WORKAROUND', seats: '+ labour', amount: '$???', y: 286 },
  ];

  return (
    <GraphicFrame label="A growing stack of per-seat subscriptions">
      <text x="40" y="32" className="story-svg-label">THE QUIET COMPOUNDING TAX</text>
      {tools.map((tool, index) => (
        <motion.g key={tool.label} variants={POP} custom={index * 0.12}>
          <rect x={42 + index * 8} y={tool.y} width="420" height="42" rx="9" className={index === tools.length - 1 ? 'story-svg-stack story-svg-stack--warning' : 'story-svg-stack'} />
          <text x={62 + index * 8} y={tool.y + 26} className="story-svg-stack-name">{tool.label}</text>
          <text x={285 + index * 8} y={tool.y + 26} className="story-svg-stack-meta">{tool.seats}</text>
          <text x={440 + index * 8} y={tool.y + 26} textAnchor="end" className="story-svg-stack-price">{tool.amount}</text>
        </motion.g>
      ))}
    </GraphicFrame>
  );
}

function FrictionGraphic() {
  const nodes = [
    { x: 76, y: 85, label: 'FORM' },
    { x: 232, y: 68, label: 'SHEET' },
    { x: 421, y: 104, label: 'CRM' },
    { x: 98, y: 250, label: 'INBOX' },
    { x: 285, y: 286, label: 'CHAT' },
    { x: 438, y: 235, label: 'REPORT' },
  ];
  const paths = [
    'M76 105 C80 188 300 110 421 124',
    'M232 88 C180 145 180 220 98 230',
    'M421 124 C340 155 380 255 285 266',
    'M98 230 C180 210 208 315 285 286',
    'M285 266 C342 180 370 250 438 255',
    'M76 105 C260 140 180 280 438 255',
  ];

  return (
    <GraphicFrame label="Disconnected tools joined by tangled manual workflows">
      <text x="40" y="32" className="story-svg-label">WORKAROUNDS BECOME THE OPERATING SYSTEM</text>
      {paths.map((path, index) => (
        <motion.path key={path} d={path} className={index === 5 ? 'story-svg-tangle story-svg-tangle--gold' : 'story-svg-tangle'} variants={DRAW} />
      ))}
      {nodes.map((node, index) => (
        <motion.g key={node.label} variants={POP} custom={index * 0.08}>
          <rect x={node.x - 35} y={node.y - 18} width="70" height="36" rx="8" className="story-svg-node" />
          <text x={node.x} y={node.y + 4} textAnchor="middle" className="story-svg-node-label">{node.label}</text>
        </motion.g>
      ))}
      <motion.g variants={POP} custom={0.6}>
        <rect x="170" y="147" width="180" height="62" rx="10" className="story-svg-ticket" />
        <text x="190" y="173" className="story-svg-ticket-title">SUPPORT TICKET #4821</text>
        <text x="190" y="193" className="story-svg-ticket-copy">Estimated reply: 3–5 days</text>
      </motion.g>
    </GraphicFrame>
  );
}

function SourceGraphic() {
  const tools = [
    { x: 80, y: 80, label: 'CRM' },
    { x: 80, y: 180, label: 'FORMS' },
    { x: 80, y: 280, label: 'BILLING' },
    { x: 440, y: 80, label: 'TEAM' },
    { x: 440, y: 180, label: 'AI' },
    { x: 440, y: 280, label: 'REPORTS' },
  ];

  return (
    <GraphicFrame label="Every tool connecting to one owned source of truth">
      <text x="40" y="32" className="story-svg-label">YOUR DATA. ONE OWNED FOUNDATION.</text>
      {tools.map((tool, index) => (
        <motion.g key={tool.label}>
          <motion.path
            d={`M${tool.x < 260 ? tool.x + 43 : tool.x - 43} ${tool.y} C${tool.x < 260 ? 180 : 340} ${tool.y}, ${tool.x < 260 ? 190 : 330} 180, ${tool.x < 260 ? 218 : 302} 180`}
            className="story-svg-source-line"
            variants={DRAW}
          />
          <motion.g variants={POP} custom={index * 0.08}>
            <rect x={tool.x - 43} y={tool.y - 19} width="86" height="38" rx="9" className="story-svg-source-tool" />
            <text x={tool.x} y={tool.y + 4} textAnchor="middle" className="story-svg-node-label">{tool.label}</text>
          </motion.g>
        </motion.g>
      ))}
      <motion.g variants={POP} custom={0.3}>
        <ellipse cx="260" cy="132" rx="42" ry="15" className="story-svg-database" />
        <path d="M218 132 V218 C218 238 302 238 302 218 V132" className="story-svg-database" />
        <ellipse cx="260" cy="218" rx="42" ry="15" className="story-svg-database" />
        <text x="260" y="171" textAnchor="middle" className="story-svg-db-title">YOUR DATA</text>
        <text x="260" y="192" textAnchor="middle" className="story-svg-db-copy">source of truth</text>
      </motion.g>
    </GraphicFrame>
  );
}

function SavingsGraphic() {
  return (
    <GraphicFrame label="Documented annual software savings">
      <text x="40" y="32" className="story-svg-label">DOCUMENTED — LOCKEROOM</text>
      <motion.g variants={POP}>
        <text x="40" y="102" className="story-svg-saving">$266,651</text>
        <text x="43" y="132" className="story-svg-small">SAVED EVERY YEAR</text>
      </motion.g>
      <motion.rect x="48" y="188" width="120" height="112" rx="10" className="story-svg-bar story-svg-bar--old" variants={POP} />
      <text x="108" y="324" textAnchor="middle" className="story-svg-small">OLD STACK</text>
      <motion.rect x="222" y="270" width="120" height="30" rx="10" className="story-svg-bar story-svg-bar--new" variants={POP} custom={0.2} />
      <text x="282" y="324" textAnchor="middle" className="story-svg-small">OWNED SYSTEM</text>
      <motion.path d="M370 188 V292 M352 274 L370 292 L388 274" className="story-svg-gold-path" variants={DRAW} />
      <text x="420" y="238" textAnchor="middle" className="story-svg-number">97%</text>
      <text x="420" y="262" textAnchor="middle" className="story-svg-small">LESS</text>
    </GraphicFrame>
  );
}

const GRAPHICS = {
  team: TeamGraphic,
  market: MarketGraphic,
  pioneer: PioneerGraphic,
  stack: StackGraphic,
  friction: FrictionGraphic,
  source: SourceGraphic,
  savings: SavingsGraphic,
};

export default function SoftwareStoryGraphic({ type }) {
  const Graphic = GRAPHICS[type];
  return Graphic ? <Graphic /> : null;
}
