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
| Headline | Understand AI. Then *put it* to work. |
| Subline | Hands-on AI education and data restructuring that turn complexity into clarity: and insight into real impact. |
| Manifesto | We deliver solutions, not tools. |
| Supporting line | A service on the outside, a tech company on the inside. |

## Page sections (top → bottom)

1. **Hero**: Headline, subline, `HeroGraphic`, dual CTAs
2. **Manifesto strip**: "Solutions, not tools" + partnership line
3. **What We Do**: Three static pillar cards (Restructure / Automate / Educate)
4. **Selected Portfolio**: First 3 case study teasers from `CASE_STUDIES`
5. **Workshop CTA band**: Forest-green section, book workshop
6. **Closing CTA**: Book workshop or contact

## Components used

| Component | Source |
|-----------|--------|
| `HeroGraphic` | `src/components/HeroGraphic.jsx` |
| `SectionReveal` | `src/components/SectionReveal.jsx` |
| `MagneticButton` | `src/components/MagneticButton.jsx` |
| `CaseStudyCard` | `src/components/CaseStudyCard.jsx` (`compact`, `linkable`) |

## Data dependencies

| Export | From | Usage |
|--------|------|-------|
| `VALUE_PILLARS` | `src/data/content.js` | Three pillar cards |
| `CASE_STUDIES` | `src/data/content.js` | `.slice(0, 3)` for teasers |

## CTAs and outbound links

| Label | Target |
|-------|--------|
| Start with a Workshop | `/workshops` |
| Explore services → | `/services` |
| View full portfolio → | `/portfolio` |
| Book an AI Workshop | `/workshops` |
| Or get in touch → | `/contact` |

## APIs & workflows

### Current

- None. Static content only.

### Planned

| Workflow | Trigger | Suggested integration |
|----------|---------|----------------------|
| Hero A/B copy test | Page load | Feature flag or CMS variant |
| Case study images | Section render | `CASE_STUDIES[].image` + CDN URLs |
| Social proof logos | Below hero or manifesto | Static array or CMS |
| Newsletter capture | Optional footer band | Mailchimp / ConvertKit API |
| Analytics page view | Route `/` | `VITE_ANALYTICS_ID` |

## Extension points

- Add `image` and `slug` fields to `CASE_STUDIES` for photo proof-of-work and deep links to `/portfolio/:slug`
- Replace static pillars with CMS-driven content if copy changes frequently
- `HeroGraphic` could accept theme props if seasonal campaigns are needed

## Related docs

- [workshops.md](./workshops.md): primary conversion target
- [portfolio.md](./portfolio.md): full case study portfolio
- [../README.md](../README.md): site-wide routing
