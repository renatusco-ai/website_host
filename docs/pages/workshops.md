# Page: Workshops

## Summary

Company-facing AI education workshop page. Positioned for leadership and management teams: open discussion on AI implementation, practical AI skills, then company-specific application. Not a product demo.

## Route

| Property | Value |
|----------|-------|
| **Path** | `/workshops` |
| **Component** | `src/pages/Workshops.jsx` |
| **Layout** | `Layout` |
| **Nav label** | Workshops (after Portfolio, before Contact) |
| **Legacy** | `/about` redirects here |

## Positioning copy (canonical)

| Element | Copy |
|---------|------|
| Eyebrow | Company Workshops |
| Headline | Discuss AI implementation with your *team*. |
| Subline | Open education workshop for leadership and management. Practical AI skills, then company-specific discussion. |
| Strip | Education first. Your company context second. |

## Page sections (top → bottom)

1. **Hero** - Company workshop pitch + enquire CTA
2. **Positioning strip** - Education first / not a software demo
3. **Workshop agenda** - Four modules from `WORKSHOP_TOPICS`
4. **Who / outcomes** - Management teams + leave-with list
5. **How it runs** - Format points + half-day session card
6. **Book** - `BookDemoForm` enquiry
7. **Bridge** - Link to services / contact

## Data dependencies

| Export | From | Usage |
|--------|------|-------|
| `WORKSHOP_TOPICS` | `src/data/content.js` | Agenda modules |

## Related docs

- [services.md](./services.md) - upsell after workshop
- [contact.md](./contact.md) - shared form / diagnostic path
- [../README.md](../README.md) - route map

## Wiki

[Architecture](../architecture.md) · [Progress](../progress.md) · [Index](../README.md) · [Home](./home.md) · [Services](./services.md) · [Portfolio](./portfolio.md) · [Lockeroom](./lockeroom.md) · [Workshops](./workshops.md) · [Contact](./contact.md)
