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

1. **Hero** — Portfolio intro
2. **Aggregate stats** — `DataReadout` chips (static values)
3. **Case studies grid** — All `CASE_STUDIES` via `CaseStudyCard`
4. **Featured transformation** — Long-form anonymized fitness ops story + metrics
5. **CTA** — Workshop or project discussion

## Components used

| Component | Source | Notes |
|-----------|--------|-------|
| `CaseStudyCard` | `src/components/CaseStudyCard.jsx` | `linkable={false}` on this page |
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
  image?: string;       // card thumbnail URL (live)
  // PLANNED:
  // images?: string[]; // gallery for detail view
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

- Case study card images via `study.image` → `public/portfolio/{id}.png`
- `CaseStudyCard` renders optional image banner with `object-cover object-top` (browser chrome trimmed at render)

### Planned

| Workflow | Trigger | Suggested integration | Tags / metadata |
|----------|---------|----------------------|-----------------|
| Case study detail page | Card click | New route `/portfolio/:slug` | `page_type: case_study_detail` |
| CMS-driven portfolio | Build or runtime fetch | Sanity / Contentful `caseStudy` type | `collection: portfolio` |
| Image lightbox / gallery | User click | Client component | `interaction: gallery` |
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
  {id}.png           # Card thumbnail (live — 5 entries)
  {id}-01.png        # Gallery shots (planned)
  {id}-02.png
```

Current assets: `exercise-programming-engine`, `client-workbook`, `member-health-dashboard`, `renewal-automation`, `referral-tracking-crm`.

## Extension points

- Enable `linkable` on cards when `/portfolio/:slug` exists
- `CaseStudyCard` — image banner live when `study.image` is set
- Featured section could pull from `CASE_STUDIES.find(c => c.featured)` instead of hardcoded copy
- Home teasers auto-sync when case studies gain images

## Related docs

- [home.md](./home.md) — shows first 3 case studies
- [services.md](./services.md) — tiers referenced in future `services_tier` tags
- [../README.md](../README.md) — integration status
