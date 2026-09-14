import { Link } from 'react-router-dom';
import SectionReveal from './SectionReveal';
import EnquireNowButton from './EnquireNowButton';

const ACCENT_LABEL = {
  bronze: 'tier-accent-bronze',
  silver: 'tier-accent-silver',
  gold: 'tier-accent-gold',
};

const ACCENT_DOT = {
  bronze: 'tier-dot-bronze',
  silver: 'tier-dot-silver',
  gold: 'tier-dot-gold',
};

export default function EntryOfferCard({ offer, index = 0 }) {
  const labelClass = ACCENT_LABEL[offer.accent] || ACCENT_LABEL.gold;
  const dotClass = ACCENT_DOT[offer.accent] || ACCENT_DOT.gold;
  const ctaClassName = offer.popular
    ? 'btn-gold w-full justify-center text-center'
    : 'btn-ghost w-full justify-center text-center';

  return (
    <SectionReveal delay={index * 0.08} className={offer.popular ? 'md:-my-4 relative z-10' : ''}>
      <div
        className={`group relative flex flex-col h-full p-8 md:p-10 rounded-xl border transition-all duration-500 bg-paper ${
          offer.popular
            ? 'border-gold ring-2 ring-gold/30 shadow-[0_20px_48px_rgba(32,57,47,0.14)] md:p-12'
            : 'border-mist hover:border-gold/40 hover:shadow-[0_16px_40px_rgba(32,57,47,0.08)]'
        }`}
      >
        {offer.popular && (
          <span className="absolute -top-3 left-8 text-[0.65rem] font-semibold tracking-[0.18em] uppercase bg-gold text-cream px-3 py-1 rounded">
            Most Popular
          </span>
        )}

        <div className="mb-6">
          <p className={`label-upper mb-2 ${labelClass}`}>{offer.duration}</p>
          <p className={`heading-display text-ink ${offer.popular ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'}`}>
            {offer.label}
          </p>
          <h3 className={`heading-display text-ink mt-1 ${offer.popular ? 'text-2xl' : 'text-xl'}`}>{offer.title}</h3>
          {offer.note && (
            <p className="text-gold text-sm font-medium mt-3 leading-snug">{offer.note}</p>
          )}
        </div>

        <p className="text-sage text-sm leading-relaxed mb-6">{offer.description}</p>

        <ul className="space-y-3 flex-1 mb-8">
          {offer.features.map((feature) => (
            <li key={feature} className="text-ink/80 text-sm flex items-start gap-3">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
              {feature}
            </li>
          ))}
        </ul>

        {offer.inquire ? (
          <EnquireNowButton inquire={offer.inquire} className={ctaClassName}>
            {offer.cta}
          </EnquireNowButton>
        ) : (
          <Link to={offer.ctaLink} className={ctaClassName}>
            {offer.cta}
          </Link>
        )}
      </div>
    </SectionReveal>
  );
}
