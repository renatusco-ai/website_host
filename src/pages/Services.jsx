import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import IntakeWizard from '../components/IntakeWizard';
import SectionReveal from '../components/SectionReveal';
import PricingCard from '../components/PricingCard';
import EntryOfferCard from '../components/EntryOfferCard';
import {
  STORY_PAGE_TRANSITION,
  StoryCloser,
  StoryHero,
  StorySectionHeading,
  StoryStatement,
} from '../components/SiteStory';
import { TIERS, PROCESS_STEPS, ENTRY_OFFERS, SERVICE_OPTIONS } from '../data/content';

export default function Services() {
  const [activeWizard, setActiveWizard] = useState(null);
  const closeWizard = useCallback(() => setActiveWizard(null), []);

  return (
    <motion.div {...STORY_PAGE_TRANSITION} className="services-story">
      <IntakeWizard wizardId={activeWizard} onClose={closeWizard} />
      <StoryHero
        eyebrow="Services"
        title={
          <>
            Find the expensive problem. <em>Build only what pays.</em>
          </>
        }
        lead="We restructure the data, remove the workarounds and build the system around the way your business actually wins."
        graphic="source"
        actions={
          <>
            <a href="#start" className="btn-primary">Choose a starting point</a>
            <Link to="/learn-more" className="link-arrow">
              Why custom makes sense now &rarr;
            </Link>
          </>
        }
        note="No software pitch. The commercial case comes first."
      />

      <section className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner">
          <StorySectionHeading
            align="center"
            eyebrow="Your options"
            title={
              <>
                Three ways forward. <em>Each one built to stick.</em>
              </>
            }
            body="Make the stack you have work harder, replace it with something you own, or do either with someone whose job is getting your team to actually use it."
          />
          <div className="site-story-cards">
            {SERVICE_OPTIONS.map((option, i) => (
              <SectionReveal key={option.title} delay={i * 0.1}>
                <div
                  className={`site-story-card site-story-card--option${option.featured ? ' site-story-card--forest' : ''}`}
                >
                  <span className="site-story-card__number">0{i + 1}</span>
                  <h3>{option.title}</h3>
                  <p>{option.body}</p>
                  <button
                    type="button"
                    className="btn-primary site-story-card__cta"
                    onClick={() => setActiveWizard(option.id)}
                  >
                    Get started <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <StoryStatement
        eyebrow="The rule"
        body="A beautiful application is worthless if the data underneath is fragmented. Every engagement moves in the same direction: understand the cost, organise the truth, then build the smallest complete solution."
      >
        We do not add another tool to the stack.{' '}
        <em>We remove the need for the stack.</em>
      </StoryStatement>

      <section id="start" className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="01"
            eyebrow="Choose the first conversation"
            title="Start at the depth your decision needs."
            body="A quick diagnostic can establish whether there is a problem. A paid working session maps the economics. A workshop aligns the people who will need to lead the change."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ENTRY_OFFERS.map((offer, i) => (
              <EntryOfferCard key={offer.id} offer={offer} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="site-story-section">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="02"
            eyebrow="How the work moves"
            title="From scattered evidence to one working system."
            body="Each phase earns the next. We do not jump to a build before the data, workflow and commercial case are understood."
          />
          <div className="services-story__process">
            {PROCESS_STEPS.map((step, i) => (
              <SectionReveal key={step.phase} delay={i * 0.15}>
                <div className="services-story__process-step">
                  <span>0{i + 1}</span>
                  <p>{step.phase}</p>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="site-story-section site-story-section--paper">
        <div className="site-story-section__inner">
          <StorySectionHeading
            number="03"
            eyebrow="How far the transformation goes"
            title="The scope grows with the problem — not with a package quota."
            body="From a clean foundation to a fully custom operating system, each tier describes the level of change rather than a box of features to consume."
          />
          <div className="services-story__tiers">
            {TIERS.map((tier, i) => (
              <PricingCard key={tier.id} tier={tier} index={i} />
            ))}
          </div>
        </div>
      </section>

      <StoryStatement
        tone="forest"
        eyebrow="The build order"
        body="Clean CRMs. Unified databases. Connected systems. Then — and only then — automations, interfaces and AI agents with something reliable to work from."
      >
        Data first. Interface second. <em>AI last.</em>
      </StoryStatement>

      <StoryCloser
        eyebrow="Not sure where to start?"
        title="Begin with understanding, not implementation."
        body="Bring the team into a workshop, or bring the software bills into a diagnostic. We will tell you which conversation is worth having."
      >
        <Link to="/workshops" className="btn-primary">Explore company workshops</Link>
        <Link to="/contact">Compare your starting points &rarr;</Link>
      </StoryCloser>
    </motion.div>
  );
}
