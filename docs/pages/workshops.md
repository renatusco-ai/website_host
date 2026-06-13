# Page: Workshops

## Summary

Beginner-friendly AI education offering. Primary conversion page sitewide. Explains what workshops cover, who they're for, format, and provides booking surfaces (form + scheduling placeholder).

## Route

| Property | Value |
|----------|-------|
| **Path** | `/workshops` |
| **Component** | `src/pages/Workshops.jsx` |
| **Layout** | `Layout` |
| **Nav label** | Workshops |
| **Anchor** | `#book` — booking section |

Navbar primary CTA ("Book a Workshop") links here.

## Positioning copy (canonical)

| Element | Copy |
|---------|------|
| Eyebrow | AI Workshops |
| Headline | Learn AI by *doing*. |
| Subline | Friendly, hands-on workshops. No technical background required. |
| Format headline | Interactive, practical, no fluff |

## Page sections (top → bottom)

1. **Hero** — Value prop + CTA to `#book`
2. **What You'll Learn** — 4 modules from `WORKSHOP_TOPICS`
3. **Who It's For** — Static bullet list (in-page constant)
4. **What You'll Leave With** — Static outcomes list
5. **Format** — Session length, group vs 1-on-1, in-person/online
6. **Book Your Workshop** — `BookDemoForm` + `SchedulingEmbed`
7. **Bridge to services** — Link to `/services`

## Components used

| Component | Source | Role |
|-----------|--------|------|
| `BookDemoForm` | `src/components/BookDemoForm.jsx` | Enquiry capture |
| `SchedulingEmbed` | `src/components/SchedulingEmbed.jsx` | Calendly/Cal.com slot |
| `SectionReveal` | `src/components/SectionReveal.jsx` | Scroll animations |
| `MagneticButton` | `src/components/MagneticButton.jsx` | Hero CTA |

## Data dependencies

| Export | From | Usage |
|--------|------|-------|
| `WORKSHOP_TOPICS` | `src/data/content.js` | 4 learning modules |

In-page constants (not in `content.js` yet): `WHO_ITS_FOR`, `OUTCOMES`.

## CTAs and outbound links

| Label | Target |
|-------|--------|
| Book a Workshop | `#book` |
| Explore services | `/services` |

## APIs & workflows

### Current

| Integration | Behaviour |
|-------------|-----------|
| `BookDemoForm` | Opens `mailto:hello@renatus.ai` with pre-filled subject/body |
| `SchedulingEmbed` | Placeholder UI only — no embed URL |

### Planned

| Workflow | Trigger | Suggested integration | Tags / metadata |
|----------|---------|----------------------|-----------------|
| Workshop booking form submit | Form submit | POST to Formspree, Supabase Edge Function, or Resend | `source: workshops`, `intent: workshop_booking` |
| Calendly embed | Page load `#book` | `VITE_CALENDLY_WORKSHOP_URL` iframe | `event_type: ai_workshop` |
| Cal.com embed | Alternative | `VITE_CALCOM_WORKSHOP_URL` | Same as above |
| CRM lead create | Successful form/booking | HubSpot / Pipedrive webhook | `pipeline: workshops`, `stage: inbound` |
| Confirmation email | Post-submit | Resend / SendGrid template | `template: workshop_enquiry_ack` |
| Workshop capacity / dates | Dynamic section | Headless CMS or Airtable API | Display next available sessions |
| Payment / deposit (optional) | Pre-workshop | Stripe Checkout link | `product: workshop_deposit` |

### Suggested form payload (future API)

```json
{
  "name": "string",
  "email": "string",
  "company": "string",
  "message": "string",
  "source_page": "/workshops",
  "intent": "workshop_booking",
  "utm_campaign": "string | null"
}
```

## Extension points

- Add `workshopType` field to form (group vs 1-on-1, in-person vs online)
- Move `WHO_ITS_FOR` and `OUTCOMES` into `content.js` or CMS
- Split `BookDemoForm` into `WorkshopBookingForm` with workshop-specific fields when API is wired
- Add FAQ accordion section before `#book`

## Related docs

- [contact.md](./contact.md) — shared form component
- [services.md](./services.md) — upsell path after workshop
- [../README.md](../README.md) — integration status table
