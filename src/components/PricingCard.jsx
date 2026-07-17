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
        className={`group relative flex flex-col h-full p-8 md:p-10 rounded-xl border transition-all duration-500 bg-paper ${
          tier.popular
            ? 'border-gold ring-2 ring-gold/30 shadow-[0_16px_40px_rgba(32,57,47,0.10)]'
            : 'border-mist hover:border-gold/40 hover:shadow-[0_16px_40px_rgba(32,57,47,0.08)]'
        }`}
      >
        {tier.popular && (
          <span className="absolute -top-3 left-8 text-[0.65rem] font-semibold tracking-[0.18em] uppercase bg-gold text-cream px-3 py-1 rounded">
            Most Popular
          </span>
        )}

        <div className="mb-6">
          <p className={`label-upper mb-2 ${labelClass}`}>
            {tier.metal} &middot; {tier.name}
          </p>
          <p className="text-ink/70 text-base italic mt-1">{tier.price}</p>
          <p className="text-sage text-sm mt-2">{tier.audience}</p>
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
          className={tier.popular ? 'btn-gold w-full justify-center text-center' : 'btn-ghost w-full justify-center text-center'}
        >
          Enquire
        </Link>
      </div>
    </SectionReveal>
  );
}
