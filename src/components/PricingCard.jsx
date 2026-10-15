import { Link } from 'react-router-dom';
import SectionReveal from './SectionReveal';

const ACCENT_LABEL = {
  bronze: 'tier-accent-bronze',
  silver: 'tier-accent-silver',
  gold: 'tier-accent-gold',
  meridian: 'tier-accent-meridian',
};

const ACCENT_DOT = {
  bronze: 'tier-dot-bronze',
  silver: 'tier-dot-silver',
  gold: 'tier-dot-gold',
  meridian: 'tier-dot-meridian',
};

export default function PricingCard({ tier, index = 0 }) {
  const labelClass = ACCENT_LABEL[tier.accent] || ACCENT_LABEL.gold;
  const dotClass = ACCENT_DOT[tier.accent] || ACCENT_DOT.gold;

  return (
    <SectionReveal delay={index * 0.08}>
      <div
        className={`pricing-story-card group relative flex flex-col h-full p-8 md:p-10 rounded-xl border transition-all duration-500 bg-cloud ${
          tier.popular
            ? 'border-spring ring-2 ring-spring/30 shadow-[0_16px_40px_rgba(18,102,86,0.10)]'
            : 'border-smoke hover:border-spring/40 hover:shadow-[0_16px_40px_rgba(18,102,86,0.08)]'
        }`}
      >
        {tier.popular && (
          <span className="absolute -top-3 left-8 text-[0.65rem] font-semibold tracking-[0.18em] uppercase bg-spring text-forest px-3 py-1 rounded-full">
            Most Popular
          </span>
        )}

        <div className="mb-6">
          <p className={`label-upper mb-2 ${labelClass}`}>
            {tier.metal} &middot; {tier.name}
          </p>
          <p className="text-ink/70 text-base mt-1">{tier.price}</p>
          <p className="text-graphite text-sm mt-2">{tier.audience}</p>
        </div>

        <ul className="space-y-3 flex-1 mb-8">
          {tier.features.map((feature) => (
            <li key={feature} className="text-ink/80 text-sm flex items-start gap-3">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
              {feature}
            </li>
          ))}
        </ul>

        <Link
          to="/contact"
          className={tier.popular ? 'btn-primary w-full justify-center text-center' : 'btn-ghost w-full justify-center text-center'}
        >
          Enquire
        </Link>
      </div>
    </SectionReveal>
  );
}
