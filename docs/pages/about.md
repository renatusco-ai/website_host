# Page: About

## Summary

Founder page for Shaun. Positions Renatus around change management and problem solving, with custom software as the tool. Evidence comes from the Lockeroom engagement.

## Route

| Property | Value |
|----------|-------|
| **Path** | `/about` |
| **Component** | `src/pages/About.jsx` |
| **Layout** | `Layout` (Navbar + Footer) |
| **Nav label** | About |

## Page sections (top → bottom)

1. **Hero**: "Shaun Townsend. Founder & MD." with the cut-out portrait (`public/about/shaun-portrait.webp`)
2. **The rare outcome**: forest statement, links to `/portfolio/lockeroom`
3. **Story chapters**: `FounderChapter` renders each `FOUNDER.chapters` item as a parallax scene (photo, metrics, or graphic visual)
4. **How Shaun works**: `FOUNDER.principles` cards
5. **Closer**: Enquire Now

## Images

Sources live in Dropbox: `Videos/Content/01092026/Initial Shoot/shaun`.

- `shaun-portrait.webp`: DSC06875-2, background removed, cropped at the waist
- `lockeroom-meeting.webp`: Lockeroom meeting photo
- `lockeroom-team.webp`: DSC06996, Shaun working with a teammate, used on the operations chapter

## Data dependencies

| Export | From | Usage |
|--------|------|-------|
| `FOUNDER` | `src/data/content.js` | All page copy |

## Open items

- Add Person / Organization JSON-LD for search

## Wiki

[Architecture](../architecture.md) · [Progress](../progress.md) · [Index](../README.md) · [Home](./home.md) · [Learn More](./learn-more.md) · [Services](./services.md) · [Portfolio](./portfolio.md) · [Lockeroom](./lockeroom.md) · [Workshops](./workshops.md) · [About](./about.md) · [Contact](./contact.md)
