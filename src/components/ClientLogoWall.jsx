import { Link } from 'react-router-dom';
import SectionReveal from './SectionReveal';
import { StorySectionHeading } from './SiteStory';
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
    <section className="site-story-section site-story-section--paper client-story">
      <div className="site-story-section__inner">
        <StorySectionHeading
          number="01"
          eyebrow="Who we build for"
          title="Different industries. The same moment of outgrowing the system."
          body="Gyms, builders, property groups, practices and agencies come to us when the business has become more capable than the software holding it together."
        />

        {featured && (
          <SectionReveal delay={0.1}>
            <div className="client-story__featured">
              <div className="client-story__identity">
                <p className="site-story-eyebrow">
                  Flagship engagement &middot; {featured.sector}
                </p>
                <img
                  src={featured.logo}
                  alt={`${featured.name} logo`}
                  loading="lazy"
                />
                <p>{LOCKEROOM_CASE.tagline}</p>
              </div>

              <div className="client-story__result">
                <span>Documented result</span>
                <p className="heading-display text-5xl md:text-6xl text-forest leading-none">
                  {LOCKEROOM_CASE.headline.value}
                </p>
                <p>
                  {LOCKEROOM_CASE.headline.label}
                </p>
                <Link to={featured.href}>
                  Read the case study <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </SectionReveal>
        )}
      </div>

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
