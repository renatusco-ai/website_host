# Page: Portfolio

## Summary

Portfolio / case studies page. Showcases anonymized proof of work from real projects (fitness ops, member apps, staff OS, rostering, renewal automation, referral CRM, market research agents, finance dashboards). Designed for future photo assets per case study.

## Route

| Property | Value |
|----------|-------|
| **Path** | `/portfolio` |
| **Legacy redirect** | `/work` → `/portfolio` |
| **Component** | `src/pages/Portfolio.jsx` |
| **Layout** | `Layout` |
| **Nav label** | Portfolio |

## Positioning copy (canonical)

| Element | Copy |
|---------|------|
| Eyebrow | Portfolio |
| Headline | Built to *deliver*. |
| Subline | Real projects, real outcomes. Client details anonymised. |
| Featured story | From fragmented spreadsheets to a unified operations platform |

## Page sections (top → bottom)

1. **Hero**: Portfolio intro
2. **Aggregate stats**: `DataReadout` chips (static values)
3. **Case studies grid**: All `CASE_STUDIES` via `CaseStudyCard`
4. **Featured transformation**: Long-form anonymized fitness ops story + metrics
5. **CTA**: Workshop or project discussion

## Components used

| Component | Source | Notes |
|-----------|--------|-------|
| `CaseStudyCard` | `src/components/CaseStudyCard.jsx` | `linkable={false}` here; shows "View interface" button when `study.media` + `onViewMedia` |
| `CaseStudyModal` | `src/components/CaseStudyModal.jsx` | Lightbox in a designed browser frame; gallery, captions, ESC/arrow keys, scroll lock |
| `DataReadout` | `src/components/DataReadout.jsx` | Stats + featured metrics |
| `SectionReveal` | `src/components/SectionReveal.jsx` | Animations |

## Data dependencies

| Export | From | Usage |
|--------|------|-------|
| `CASE_STUDIES` | `src/data/content.js` | Full grid (11 items) |

### Case study schema (current)

```ts
{
  id: string;           // slug key, e.g. 'coach-os'
  industry: string;     // e.g. 'Staff Operations'
  title: string;
  outcome: string;      // description paragraph
  tags: string[];
  metrics: { label: string; value: string };
  media?: {             // proof shots shown in the modal lightbox
    src: string;        // /portfolio/{id}.png
    caption?: string;
    placeholder?: boolean; // true => blurred + "anonymised capture pending" badge
  }[];
  // PLANNED:
  // featured?: boolean;
}
```

### Current case studies (display order)

| `id` | Title | Industry |
|------|-------|----------|
| `data-neural-network` | Unified data architecture | Fitness Operations |
| `market-research-analyst` | Market research analyst agent | AI Agents |
| `coach-os` | Staff operating system | Staff Operations |
| `staff-rostering` | Staff rostering and scheduling system | Staff Operations |
| `member-app` | Member-facing mobile app | Member Experience |
| `renewal-automation` | Renewal intelligence system | Retention & Sales |
| `referral-tracking-crm` | Referral tracking CRM | Growth & Sales |
| `exercise-programming-engine` | Exercise programming engine | Staff Operations |
| `client-workbook` | Client workbook with live health data | Client Management |
| `member-health-dashboard` | Member health and churn intelligence | Retention & Analytics |
| `finance-dashboard` | Accounting intelligence dashboard | Finance & Reporting |

## CTAs and outbound links

| Label | Target |
|-------|--------|
| Book an AI Workshop | `/workshops` |
| Or discuss a project → | `/contact` |

## APIs & workflows

### Current

- Cards are text-led; those with `study.media` expose a "View interface" button
- Clicking opens `CaseStudyModal`: a lightbox that renders shots inside a designed browser frame (never the real Chrome/bookmarks), with prev/next gallery, captions, and keyboard nav
- `placeholder: true` media render blurred with an "anonymised capture pending" badge: privacy-safe until clean re-captures replace them

### Planned

| Workflow | Trigger | Suggested integration | Tags / metadata |
|----------|---------|----------------------|-----------------|
| Case study detail page | Card click | New route `/portfolio/:slug` | `page_type: case_study_detail` |
| CMS-driven portfolio | Build or runtime fetch | Sanity / Contentful `caseStudy` type | `collection: portfolio` |
| Replace placeholder shots | Re-capture | Clean, chrome-free, anonymised images → drop `placeholder` flag | `asset_state: final` |
| Filter by tag/industry | User filter | Client-side or search API | `filter: tags` |
| Testimonial embed | Per case study | CMS relation | `type: testimonial` |
| Before/after data viz | Featured section | Static images or interactive chart | `viz: data_restructure` |

### Planned `CASE_STUDIES` extensions

```json
{
  "id": "coach-os",
  "image": "/portfolio/coach-os-hero.jpg",
  "images": ["/portfolio/coach-os-1.jpg", "/portfolio/coach-os-2.jpg"],
  "client_anonymized_label": "Multi-location fitness operations company",
  "services_tier": ["gold", "meridian"],
  "related_tags": ["PWA", "Workflow automation"]
}
```

### Image asset conventions

```
public/portfolio/
  {id}.png                 # Primary shot (shown in modal)
  {id}-{variant}.png       # Extra gallery shots, e.g. -weekly, -nutrition
```

Current assets (all flagged `placeholder` pending clean re-captures):
`exercise-programming-engine` (+ `-weekly`), `client-workbook` (+ `-nutrition`),
`member-health-dashboard`, `renewal-automation`, `referral-tracking-crm`.

Re-capture guidance: hide browser chrome (F11 / devtools device mode), use demo or
anonymised data, capture at 2x resolution. Then drop the `placeholder` flag in
`CASE_STUDIES`.

## Extension points

- Enable `linkable` on cards when `/portfolio/:slug` exists
- `CaseStudyCard`: image banner live when `study.image` is set
- Featured section could pull from `CASE_STUDIES.find(c => c.featured)` instead of hardcoded copy
- Home teasers auto-sync when case studies gain images

## Related docs

- [home.md](./home.md): shows first 3 case studies
- [services.md](./services.md): tiers referenced in future `services_tier` tags
- [../README.md](../README.md): integration status

## Wiki

[Architecture](../architecture.md) · [Progress](../progress.md) · [Index](../README.md) · [Home](./home.md) · [Learn More](./learn-more.md) · [Services](./services.md) · [Portfolio](./portfolio.md) · [Lockeroom](./lockeroom.md) · [Workshops](./workshops.md) · [Contact](./contact.md)
