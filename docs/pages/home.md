# Page: Home

## Summary

Landing page. Primary entry point for Renatus positioning: approachable AI education + business data restructuring. Leads visitors toward workshops first, then services and portfolio.

## Route

| Property | Value |
|----------|-------|
| **Path** | `/` |
| **Component** | `src/pages/Home.jsx` |
| **Layout** | `Layout` (Navbar + Footer) |
| **Nav label** | Home |

## Positioning copy (canonical)

| Element | Copy |
|---------|------|
| Eyebrow | AI Workshops + Data Restructuring |
| Headline | The software changed. Your business hasn't. |
| Subline | You settled for off-the-shelf because custom wasn't an option. Now it is. |
| Manifesto | We deliver solutions, not tools. |
| Supporting line | A service on the outside, a tech company on the inside. |

## Page sections (top → bottom)

1. **Hero**: Headline, subline, `HeroGraphic`, dual CTAs
2. **Who We Build For**: `ClientLogoWall`: featured Lockeroom block + seven client logos
3. **How We Charge**: `CostComparison`: per-seat vs usage, plus industry-switchable example
4. **Closing CTA**: Subscription audit. We only take projects where savings can be quantified.

Sections 4 and 5 alternate `bg-paper` and `bg-cream` deliberately, so do not reorder them
without checking the background rhythm against the neighbouring sections.

## Components used

| Component | Source |
|-----------|--------|
| `HeroGraphic` | `src/components/HeroGraphic.jsx` |
| `SectionReveal` | `src/components/SectionReveal.jsx` |
| `BookDiscoveryButton` | `src/components/BookDiscoveryButton.jsx` |
| `ClientLogoWall` | `src/components/ClientLogoWall.jsx` |
| `CostComparison` | `src/components/CostComparison.jsx` |

## Data dependencies

| Export | From | Usage |
|--------|------|-------|
| `CLIENTS`, `FEATURED_CLIENT_ID` | `src/data/content.js` | Logo wall; `scale` optically balances each logo |
| `LOCKEROOM_CASE` | `src/data/content.js` | Featured block tagline and headline figure |
| `COST_MODEL`, `COST_EXAMPLES` | `src/data/content.js` | Per-seat vs usage columns and industry tabs |

## Cost figures

`COST_EXAMPLES[].status` is one of `documented`, `modelled`, or `indicative`:

- `fitness` / Lockeroom — `documented`. Delivered FY26 figures.
- `fitness` / Lockeroom — right-hand headline is **$266,651 saved every year**.
- `marketing` / White Key Marketing — right-hand headline is **$188,000 saved over 3 years**.
  Left is stay-as-you-are ($333k). The $16k + $25k + $105k = $146k is the new cost, listed
  under the saving. Phase 3 ($105k) is Stripe processing only.
- Construction and property — `indicative` list-rate arithmetic.

Do not drop the status flag or `COST_MODEL_DISCLAIMER` when editing those numbers.

## CTAs and outbound links

| Label | Target |
|-------|--------|
| Enquire Now | On-page enquiry modal |
| Learn how businesses are making crazy savings → | `/learn-more` |
| View our portfolio → | `/portfolio` |

## APIs & workflows

### Current

- None. Static content only.

### Planned

| Workflow | Trigger | Suggested integration |
|----------|---------|----------------------|
| Hero A/B copy test | Page load | Feature flag or CMS variant |
| Case study images | Section render | `CASE_STUDIES[].image` + CDN URLs |
| Newsletter capture | Optional footer band | Mailchimp / ConvertKit API |
| Analytics page view | Route `/` | `VITE_ANALYTICS_ID` |

## Extension points

- Add `image` and `slug` fields to `CASE_STUDIES` for photo proof-of-work and deep links to `/portfolio/:slug`
- Replace static pillars with CMS-driven content if copy changes frequently
- `HeroGraphic` could accept theme props if seasonal campaigns are needed

## Related docs

- [workshops.md](./workshops.md): company education path
- [learn-more.md](./learn-more.md): custom software economics story
- [portfolio.md](./portfolio.md): full case study portfolio
- [../architecture.md](../architecture.md): system map
- [../progress.md](../progress.md): where we left off
- [../README.md](../README.md): site-wide routing

## Wiki

[Architecture](../architecture.md) · [Progress](../progress.md) · [Index](../README.md) · [Home](./home.md) · [Learn More](./learn-more.md) · [Services](./services.md) · [Portfolio](./portfolio.md) · [Lockeroom](./lockeroom.md) · [Workshops](./workshops.md) · [Contact](./contact.md)
