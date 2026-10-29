import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import EnquireNowButton from '../components/EnquireNowButton';
import {
  STORY_PAGE_TRANSITION,
  StoryCloser,
  StoryHero,
  StorySectionHeading,
} from '../components/SiteStory';
import { COST_EXAMPLES, LOCKEROOM_CASE } from '../data/content';

const money = (value) =>
  value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  });

function ProofCard({ example, featured = false }) {
  const stackTotal = example.rows.reduce((sum, row) => sum + row.annual, 0);
  const amountSuffix = example.amountSuffix ?? '/yr';

  return (
    <div
      className={`proof-story-card h-full p-8 md:p-10 rounded-2xl border ${
        featured ? 'proof-story-card--featured bg-canvas border-forest/20' : 'bg-cloud border-smoke'
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-3 mb-6">
        {example.status === 'documented' && (
          <span className="cost-flag cost-flag--verified">
            Documented &middot; {example.client}
          </span>
        )}
        {example.status === 'modelled' && (
          <span className="cost-flag cost-flag--verified">
            Modelled &middot; {example.client}
          </span>
        )}
        {example.status === 'indicative' && (
          <span className="cost-flag">Indicative list pricing</span>
        )}
      </div>

      <h2 className="heading-display text-3xl text-ink mb-2">{example.label}</h2>
      <p className="text-graphite text-sm mb-8">{example.context}</p>

      {example.ours && (
        <p className="heading-display text-4xl md:text-5xl text-forest leading-none mb-8">
          {money(example.ours.value)}
          <span className="text-lg text-graphite"> {example.ours.period}</span>
        </p>
      )}

      <ul className="divide-y divide-smoke mb-6">
        {example.rows.map((row) => (
          <li key={row.label} className="py-3 flex items-start justify-between gap-6">
            <span>
              <span className="block text-ink text-sm">{row.label}</span>
              <span className="block text-graphite text-xs mt-1">{row.basis}</span>
            </span>
            <span className="text-ink text-sm whitespace-nowrap tabular-nums">
              {money(row.annual)}
              {amountSuffix === '/yr' ? '/yr' : ''}
            </span>
          </li>
        ))}
        <li className="py-3 flex items-baseline justify-between gap-6">
          <span className="text-ink text-sm font-medium">
            {example.stackLabel ?? 'Every year, before anything else'}
          </span>
          <span className="heading-display text-xl text-ink tabular-nums">
            {money(stackTotal)}
          </span>
        </li>
      </ul>

      <p className="text-graphite text-xs leading-relaxed">{example.footnote}</p>

      {example.href && (
        <Link to={example.href} className="link-arrow inline-block mt-7">
          Read the full case study &rarr;
        </Link>
      )}
    </div>
  );
}

export default function Portfolio() {
  const lockeroom = COST_EXAMPLES.find((example) => example.id === 'fitness');
  const marketing = COST_EXAMPLES.find((example) => example.id === 'marketing');
  const potentials = COST_EXAMPLES.filter(
    (example) => example.id !== 'fitness' && example.id !== 'marketing',
  );

  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="portfolio-story">
      <StoryHero
        eyebrow="Portfolio"
        title={
          <>
            Evidence before <em>adjectives.</em>
          </>
        }
        lead="We show what was removed, what replaced it and where every saving came from. Delivered work is documented. Future work is clearly labelled."
        graphic="savings"
        actions={
          <>
            <a href="#flagship" className="btn-primary">See the documented result</a>
            <Link to="/learn-more" className="link-arrow">Understand the model &rarr;</Link>
          </>
        }
      />

      <section id="flagship" className="site-story-section portfolio-story__flagship-section">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="01"
            eyebrow={`Flagship · ${LOCKEROOM_CASE.sector}`}
            title="One system replaced a fragmented operating stack."
            body="A delivered example of what happens when software, data and workflow are treated as one commercial problem."
          />
          <SectionReveal>
            <div className="portfolio-story__flagship">
              <div>
                <img src={LOCKEROOM_CASE.logo} alt="Lockeroom logo" />
                <p>{LOCKEROOM_CASE.tagline}</p>
              </div>
              <div>
                <span>Documented net annual saving</span>
                <strong>{LOCKEROOM_CASE.headline.value}</strong>
                <p>{LOCKEROOM_CASE.headline.label}</p>
                <Link to="/portfolio/lockeroom">
                  Follow the full case study <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="02"
            eyebrow="The wider pattern"
            title="The problem changes shape. The economics repeat."
            body="Choose a sector below to see the visible stack cost. Each card shows its evidence status so delivered outcomes never blur into projections."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {lockeroom && (
              <SectionReveal>
                <ProofCard example={lockeroom} featured />
              </SectionReveal>
            )}
            {marketing && (
              <SectionReveal delay={0.1}>
                <ProofCard example={marketing} />
              </SectionReveal>
            )}
          </div>

          {potentials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {potentials.map((example, index) => (
                <SectionReveal key={example.id} delay={index * 0.08}>
                  <ProofCard example={example} />
                </SectionReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <StoryCloser
        eyebrow="Your evidence"
        title="What is your stack costing you?"
        body="Most businesses have never put every subscription, workaround and duplicated hour in one place. Start with a free 15-minute conversation and we will tell you honestly whether rebuilding is worth it."
      >
        <EnquireNowButton className="btn-primary" />
        <Link to="/contact">Compare the ways to start &rarr;</Link>
      </StoryCloser>
    </motion.div>
  );
}
