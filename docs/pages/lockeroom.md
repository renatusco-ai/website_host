# Page: Lockeroom Case Study

## Summary

Flagship case study for Lockeroom, the largest engagement to date. Leads on documented FY26
contribution value: net recurring cost removed, split into two grouped streams, reconciled
against what the replacement system costs to run.

## Route

| Property | Value |
|----------|-------|
| **Path** | `/portfolio/lockeroom` |
| **Component** | `src/pages/LockeroomCaseStudy.jsx` |
| **Layout** | `Layout` |
| **Nav label** | Not in nav; reached from the home logo wall, the cost comparison, and `/portfolio` |

## Headline figures (canonical)

| Figure | Value | Source |
|--------|-------|--------|
| Net annual saving | $266,651.04 | FY26 workbook |
| Net monthly saving | $22,220.92 | FY26 workbook |
| Subtotal removed | $275,550.24 | Sum of both streams |
| Replacement run cost | $8,899.20/yr | Hosting, database, AI usage, integrations |

## Grouping rule

The FY26 workbook itemises individual tools and roles. The page deliberately groups them into
two streams so the shape of the saving is public without publishing internal role-by-role
costs:

1. **Software retired** - $61,770.24/yr. Five cancelled subscriptions plus a health-data
   platform whose features were rebuilt in-house, net of the one API kept.
2. **Staff capacity unlocked** - $213,780.00/yr. Roles collapsed and manual work removed.

Both stream totals must continue to reconcile to `subtotal`, and `subtotal - newCosts` must
equal `net`. Edit the figures in `LOCKEROOM_CASE` only, never in the component.

## Page sections (top → bottom)

1. **Hero** - Back link, Lockeroom logo, tagline, summary
2. **Headline number** - Forest panel with net annual saving + three supporting stats
3. **Where it came from** - Two grouped stream cards, then the reconciliation table
4. **What we built** - Seven workstreams pulled from `CASE_STUDIES` by id
5. **CTA** - Book Free Diagnostic

## Data dependencies

| Export | From | Usage |
|--------|------|-------|
| `LOCKEROOM_CASE` | `src/data/content.js` | All figures, grouping, and copy |
| `CASE_STUDIES` | `src/data/content.js` | Workstream cards, selected via `LOCKEROOM_CASE.workstreams` |

## Planned

- Parallax scrolling mobile-device mockup showing the built product rolling down the page
- Real screenshots per workstream (several already exist under `public/portfolio/`)

## Related docs

- [portfolio.md](./portfolio.md) - parent grid
- [home.md](./home.md) - logo wall and cost comparison both link here
- [../README.md](../README.md) - route map

## Wiki

[Architecture](../architecture.md) · [Progress](../progress.md) · [Index](../README.md) · [Home](./home.md) · [Services](./services.md) · [Portfolio](./portfolio.md) · [Lockeroom](./lockeroom.md) · [Workshops](./workshops.md) · [Contact](./contact.md)
