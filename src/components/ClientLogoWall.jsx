import { Link } from 'react-router-dom';
import SectionReveal from './SectionReveal';
import { CLIENTS, FEATURED_CLIENT_ID, LOCKEROOM_CASE } from '../data/content';

/** Base row height in px. Each logo's `scale` multiplies this for optical balance. */
const ROW_HEIGHT = 58;

/**
 * The track renders the client set three times and slides by one set width. Two copies
 * would leave a gap on wide screens, because a single set is narrower than the viewport.
 */
const MARQUEE_COPIES = [0, 1, 2];

function LogoTile({ client }) {
  return (
    <div className="client-logo-tile" title={`${client.name} — ${client.sector}`}>
      <img
        src={client.logo}
        alt={`${client.name} logo`}
        style={{ maxHeight: `${ROW_HEIGHT * client.scale}px` }}
        className="w-auto max-w-full"
        loading="lazy"
      />
    </div>
  );
}

export default function ClientLogoWall() {
  const featured = CLIENTS.find((client) => client.id === FEATURED_CLIENT_ID);
  const rest = CLIENTS.filter((client) => client.id !== FEATURED_CLIENT_ID);

  return (
    <section className="section-shell bg-paper border-y border-mist">
      <div className="max-w-7xl mx-auto">
        <SectionReveal>
          <p className="section-eyebrow">Who We Build For</p>
          <h2 className="heading-display text-4xl md:text-5xl text-ink max-w-2xl">
            The businesses behind the work
          </h2>
          <p className="text-sage text-lg mt-5 max-w-2xl leading-relaxed">
            Gyms, builders, property groups, and practices. Different industries, the
            same problem: the business had outgrown the systems holding it together.
          </p>
        </SectionReveal>

        {featured && (
          <SectionReveal delay={0.1}>
            <div className="mt-14 flex flex-col items-center text-center p-8 md:p-14 bg-cream border border-mist rounded-2xl">
              <p className="text-[0.7rem] tracking-[0.18em] uppercase text-gold mb-7">
                Flagship engagement &middot; {featured.sector}
              </p>

              <img
                src={featured.logo}
                alt={`${featured.name} logo`}
                className="h-12 sm:h-16 md:h-20 w-auto"
                loading="lazy"
              />

              <p className="text-sage text-base mt-7 max-w-md leading-relaxed">
                {LOCKEROOM_CASE.tagline}
              </p>

              <div className="mt-10 pt-10 border-t border-mist w-full max-w-md">
                <p className="heading-display text-5xl md:text-6xl text-forest leading-none">
                  {LOCKEROOM_CASE.headline.value}
                </p>
                <p className="text-sage text-sm mt-4 leading-relaxed">
                  {LOCKEROOM_CASE.headline.label}
                </p>
              </div>

              <Link to={featured.href} className="link-arrow inline-block mt-9">
                Read the {featured.name} case study &rarr;
              </Link>
            </div>
          </SectionReveal>
        )}
      </div>

      {/* Full-bleed so the loop runs off both edges rather than stopping at the container */}
      <SectionReveal delay={0.2}>
        <div className="logo-marquee mt-14">
          <ul className="logo-marquee__track">
            {MARQUEE_COPIES.map((copy) =>
              rest.map((client) => (
                <li
                  key={`${client.id}-${copy}`}
                  className="logo-marquee__item"
                  aria-hidden={copy > 0 || undefined}
                >
                  <LogoTile client={client} />
                </li>
              )),
            )}
          </ul>
        </div>
      </SectionReveal>
    </section>
  );
}
