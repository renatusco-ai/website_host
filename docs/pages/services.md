# Page: Services

## Summary

Service offering and pricing page. Explains the "solutions, not tools" delivery model, three-phase process (Discover / Architect / Deliver), and four-tier pricing ladder from Foundation through Transform.

## Route

| Property | Value |
|----------|-------|
| **Path** | `/services` |
| **Component** | `src/pages/Services.jsx` |
| **Layout** | `Layout` |
| **Nav label** | Services |

## Positioning copy (canonical)

| Element | Copy |
|---------|------|
| Eyebrow | Services |
| Headline | Solutions, *not tools*. |
| Narrative | Your data is the foundation. We make it AI-ready. |

## Page sections (top → bottom)

1. **Hero**: Service positioning
2. **Narrative**: Data-first / AI-readiness story
3. **How We Work**: `PROCESS_STEPS` (Discover, Architect, Deliver)
4. **Service Tiers**: `TIERS` rendered via `PricingCard` × 4
5. **CTA**: Workshop entry point + contact

## Components used

| Component | Source |
|-----------|--------|
| `PricingCard` | `src/components/PricingCard.jsx` |
| `SectionReveal` | `src/components/SectionReveal.jsx` |
| `MagneticButton` | `src/components/MagneticButton.jsx` |

## Data dependencies

| Export | From | Usage |
|--------|------|-------|
| `TIERS` | `src/data/content.js` | Pricing ladder |
| `PROCESS_STEPS` | `src/data/content.js` | Process section |

### Tier reference (current pricing)

| ID | Metal · Name | Price | Popular |
|----|--------------|-------|---------|
| `bronze` | Bronze · Foundation | From $3,000 |: |
| `silver` | Silver · Accelerate | $5.5K - $8.5K |: |
| `gold` | Gold · Elevate | $15K - $25K | Yes |
| `meridian` | Meridian · Transform | $25K - $35K |: |

## CTAs and outbound links

| Label | Target |
|-------|--------|
| Get Started (per tier) | `/contact` |
| Book an AI Workshop | `/workshops` |
| Or discuss your project → | `/contact` |

## APIs & workflows

### Current

- None. Static pricing and copy.

### Planned

| Workflow | Trigger | Suggested integration | Tags / metadata |
|----------|---------|----------------------|-----------------|
| Tier selection pre-fill | "Get Started" click | Query param `/contact?tier=gold` | `selected_tier`, `estimated_budget` |
| Dynamic pricing | CMS update | Sanity / Contentful `TIERS` collection | Versioned pricing |
| ROI calculator | Optional section | Client-side or API | `tool: roi_calculator` |
| Scoping questionnaire | Post-tier click | Typeform / Tally embed | `workflow: service_scoping` |
| CRM deal creation | Contact form with tier | HubSpot deal stage by tier | `deal_tier: elevate` |
| PDF proposal generator | Internal workflow | n8n / Make.com on form submit | `artifact: proposal_pdf` |
| Stripe payment link (deposit) | Meridian / Elevate | Stripe Payment Links per tier | `product_sku: tier_gold` |

### Suggested tier click payload (future)

```json
{
  "tier_id": "gold",
  "tier_name": "Elevate",
  "price_range": "$15K - $25K",
  "source_page": "/services",
  "intent": "service_enquiry"
}
```

## Extension points

- Add comparison table (feature matrix across tiers)
- Link each tier feature bullet to `/portfolio` case study tags
- `PricingCard` could read `ctaHref` from tier config for tier-specific landing pages
- Move tier copy to CMS when pricing changes often

## Related docs

- [workshops.md](./workshops.md): recommended entry funnel
- [contact.md](./contact.md): tier enquiry destination
- [portfolio.md](./portfolio.md): proof points for tier claims
