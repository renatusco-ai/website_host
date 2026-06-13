# Page: About

## Summary

Brand story and philosophy page. Explains Renatus name, founding observation (data barrier to AI adoption), "service outside / tech company inside" positioning, and four principles.

## Route

| Property | Value |
|----------|-------|
| **Path** | `/about` |
| **Component** | `src/pages/About.jsx` |
| **Layout** | `Layout` |
| **Nav label** | About |

## Positioning copy (canonical)

| Element | Copy |
|---------|------|
| Eyebrow | About Renatus |
| Headline | A service on the outside. *A tech company on the inside.* |
| Philosophy | The AI industry sells tools. We deliver solutions. |
| Name meaning | Latin: "reborn, renewed" |

## Page sections (top → bottom)

1. **Hero** — Brand positioning headline
2. **Brand story** — Name etymology + founding narrative (two-column)
3. **Philosophy** — Forest-green band, tools vs solutions
4. **Our Principles** — Four value cards (in-page `VALUES` constant)
5. **The Team** — Collective description + workshop CTA

## Components used

| Component | Source |
|-----------|--------|
| `SectionReveal` | `src/components/SectionReveal.jsx` |

## Data dependencies

| Source | Usage |
|--------|-------|
| In-page `VALUES` constant | Four principle cards |
| No `content.js` imports | Copy is inline in page file |

### Principles (current)

1. Solutions, Not Tools
2. Data First
3. Education Built In
4. Partnership

## CTAs and outbound links

| Label | Target |
|-------|--------|
| Start with a workshop | `/workshops` |

## APIs & workflows

### Current

- None. Fully static.

### Planned

| Workflow | Trigger | Suggested integration | Tags / metadata |
|----------|---------|----------------------|-----------------|
| Team member profiles | Team section | CMS `teamMember` collection | `section: team` |
| Founder bio / photo | Brand story | CMS or static assets | `person: founder` |
| Press / media kit | New section | PDF download or `/press` route | `asset: media_kit` |
| Company timeline | Optional section | CMS milestones | `section: history` |
| Certifications / partners | Trust band | Static or CMS logos | `section: partners` |

## Extension points

- Move `VALUES` and long-form copy to `src/data/content.js` or CMS for easier edits
- Add team grid with photos when ready (currently placeholder text only)
- Link principles to relevant `/portfolio` case studies by tag

## Related docs

- [home.md](./home.md) — shares manifesto themes
- [workshops.md](./workshops.md) — primary CTA from this page
- [../README.md](../README.md)
