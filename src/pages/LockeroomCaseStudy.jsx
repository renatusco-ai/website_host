import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';
import EnquireNowButton from '../components/EnquireNowButton';
import {
  STORY_PAGE_TRANSITION,
  StoryCloser,
  StoryHero,
  StorySectionHeading,
  StoryStatement,
} from '../components/SiteStory';
import { CASE_STUDIES, LOCKEROOM_CASE } from '../data/content';

const money = (value) =>
  value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function LockeroomCaseStudy() {
  const { groups, subtotal, newCosts, net, secondary, headline } = LOCKEROOM_CASE;

  const workstreams = LOCKEROOM_CASE.workstreams
    .map((id) => CASE_STUDIES.find((study) => study.id === id))
    .filter(Boolean);

  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="case-story">
      <StoryHero
        eyebrow={`Case study · ${LOCKEROOM_CASE.sector}`}
        title={
          <>
            One owned system. <em>A $266,651 annual saving.</em>
          </>
        }
        lead={LOCKEROOM_CASE.summary}
        graphic="savings"
        actions={
          <>
            <a href="#breakdown" className="btn-gold">Follow the numbers</a>
            <Link to="/portfolio" className="link-arrow">&larr; All work</Link>
          </>
        }
      />

      <StoryStatement
        eyebrow="The result"
        body="This is delivered work using FY26 figures: software retired, operating capacity recovered, then the new annual replacement cost deducted."
      >
        The headline is not a projection. <em>It reconciles.</em>
      </StoryStatement>

      <section id="breakdown" className="site-story-section case-story__headline-section">
        <div className="site-story-section__inner">
          <SectionReveal>
            <div className="case-story__headline">
              <div>
                <img src={LOCKEROOM_CASE.logo} alt="Lockeroom logo" />
                <p>{LOCKEROOM_CASE.tagline}</p>
              </div>
              <div>
              <p>{headline.label}</p>
              <strong>
                {headline.value}
              </strong>
              <div className="case-story__secondary">
                {secondary.map((stat) => (
                  <div key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="01"
            eyebrow="Where the saving came from"
            title="Two cost streams. One replacement."
            body="Software subscriptions were the visible layer. Recovered staff capacity was larger. Both changed because one connected system removed duplicated handling."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {groups.map((group, index) => (
              <SectionReveal key={group.id} delay={index * 0.1}>
                <div className="case-story__stream">
                  <h3 className="heading-display text-2xl text-ink mb-3">{group.title}</h3>
                  <p className="heading-display text-4xl text-forest leading-none mb-1">
                    {group.annual.toLocaleString('en-AU', {
                      style: 'currency',
                      currency: 'AUD',
                      maximumFractionDigits: 0,
                    })}
                    <span className="text-base text-sage">/yr</span>
                  </p>
                  <p className="text-sage text-xs mb-6">
                    {group.monthly.toLocaleString('en-AU', {
                      style: 'currency',
                      currency: 'AUD',
                      maximumFractionDigits: 0,
                    })}{' '}
                    per month
                  </p>
                  <p className="text-sage text-sm leading-relaxed mb-6">{group.description}</p>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-ink/70 text-sm flex gap-3">
                        <span className="text-gold">&mdash;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={0.2}>
            <div className="case-story__reconciliation">
              <p className="site-story-eyebrow">The reconciliation</p>
              <table className="savings-table">
                <thead>
                  <tr>
                    <th scope="col">Savings stream</th>
                    <th scope="col">Monthly</th>
                    <th scope="col">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id}>
                      <td>{group.title}</td>
                      <td className="tabular-nums">{money(group.monthly)}</td>
                      <td className="tabular-nums">{money(group.annual)}</td>
                    </tr>
                  ))}
                  <tr className="savings-table__total">
                    <td>Subtotal removed</td>
                    <td className="tabular-nums">{money(subtotal.monthly)}</td>
                    <td className="tabular-nums">{money(subtotal.annual)}</td>
                  </tr>
                  <tr className="savings-table__deduct">
                    <td>
                      {newCosts.label}
                      <span className="block text-xs mt-1">{newCosts.note}</span>
                    </td>
                    <td className="tabular-nums">({money(newCosts.monthly)})</td>
                    <td className="tabular-nums">({money(newCosts.annual)})</td>
                  </tr>
                  <tr className="savings-table__net">
                    <td>Net annual saving</td>
                    <td className="tabular-nums">{money(net.monthly)}</td>
                    <td className="tabular-nums">{money(net.annual)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="site-story-section">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="02"
            eyebrow="What replaced the stack"
            title="Seven workstreams. One version of reality."
            body="Member, coach, programming and billing data now live on one restructured foundation instead of being interpreted separately by disconnected tools."
          />
          <div className="case-story__workstreams">
            {workstreams.map((study, index) => (
              <SectionReveal key={study.id} delay={(index % 3) * 0.08}>
                <div className="case-story__workstream">
                  <span>0{index + 1}</span>
                  <p className="text-[0.65rem] tracking-[0.16em] uppercase text-gold mb-4">
                    {study.industry}
                  </p>
                  <h3 className="heading-display text-xl text-ink mb-3">{study.title}</h3>
                  <p className="text-sage text-sm leading-relaxed">{study.outcome}</p>
                  {study.metrics && (
                    <p className="text-forest text-sm mt-5">
                      <span className="heading-display text-lg">{study.metrics.value}</span>{' '}
                      <span className="text-sage text-xs">{study.metrics.label}</span>
                    </p>
                  )}
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <StoryCloser
        eyebrow="Your turn"
        title="What is your stack costing you?"
        body="Most businesses have never added every subscription and workaround together. We will — and tell you honestly whether rebuilding is worth it."
      >
        <EnquireNowButton inquire="subscription" className="btn-gold">
          Find the saving
        </EnquireNowButton>
        <Link to="/learn-more">Why the economics changed &rarr;</Link>
      </StoryCloser>
    </motion.div>
  );
}
