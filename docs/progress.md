# Progress

> Handoff chart. Update this when you stop. Read this when you start.

[Architecture](./architecture.md) · [Index](./README.md)

**Last updated:** 14 Sep 2026

**Branch:** `main`

**Rollback:** remote tag `pre-story-led-redesign-2026-09-14` (`f9bcb42`)

**Blocked on:** Cloudflare / Resend DNS for `renatusco.com`

## Where we are

The story-led visual redesign is on `main`. Enquiry form no longer opens Gmail.
It posts to `/api/enquiry` and Resend should deliver to `shaun@renatusco.com`.

**That send is not live yet.** Resend returned:

`The example.com domain is not verified`

Shaun is waiting for Cloudflare to propagate Resend DNS. Checking nameservers / DNS records until they resolve.

## Done this session

| Item | Status |
|------|--------|
| Pull latest Vite site, stash old Next rewrite | Done |
| Home hero: software changed / off-the-shelf | Done |
| Client logo wall + CSS carousel | Done |
| Per-seat vs usage + industry tabs | Done |
| Lockeroom case study + `$266,651` | Done |
| Marketing tab: `$188k saved / 3yr`, new cost `$146k` | Done |
| Portfolio as documented vs potential | Done |
| Contact: Subscription Diagnostic + 15-min free | Done |
| Enquire Now modal (E), Lenis locked while open | Done |
| Form: boxed fields; mobile / email / company required | Done |
| Resend path (`api/enquiry.js` + Vite middleware) | Wired, not delivering |
| TidyCal / mailto CTA | Removed from primary path |
| `/learn-more` software economics parallax story | Done |
| Site-wide story-led visual redesign | Done |
| SEO feedback pass (29 Oct): one CTA (Enquire Now), home reorder, change-management positioning, sticky mobile CTA | Done |
| Subscription Diagnostic retired site-wide | Done |
| `/about` founder page (replaces redirect to `/workshops`) | Done; founder photo pending |

## Blocked / next (in order)

1. **Wait for Cloudflare DNS** for the Resend domain records on `renatusco.com`
2. Confirm the domain is **Verified** at [resend.com/domains](https://resend.com/domains)
3. Set `RESEND_FROM` in `.env` (and Vercel) to a mailbox on that domain, e.g. `Renatus <shaun@renatusco.com>`
4. `RESEND_API_KEY` is already in local `.env` (gitignored). Add the **same key** in Vercel → Environment Variables
5. Restart Vite, submit Enquire Now, confirm mail lands in `shaun@renatusco.com`
6. Push that env to production and retest the live URL

Do not put the key in `.env.example`.

## Parked (not this pass)

- Lockeroom parallax phone scroll / “make it epic”
- New TidyCal embeds (user will supply later)
- Construction / property cost examples still indicative
- Swap remaining Free Diagnostic copy in nav-adjacent docs
- Analytics, CMS, CRM

## Files that matter for the blocked email

| File | Role |
|------|------|
| `src/components/BookDemoForm.jsx` | `POST /api/enquiry` |
| `api/enquiry.js` | Vercel handler |
| `api/send-enquiry.js` | Resend send |
| `vite.config.js` | Local `/api/enquiry` in `npm run dev` |
| `.env` | Local secrets. Not in git |

## Resume prompt

> Resend domain should be verified. Set `RESEND_FROM`, add the key on Vercel, send a test enquiry, then we continue.

## Wiki

[Architecture](./architecture.md) · [Index](./README.md) · [Home](./pages/home.md) · [Contact](./pages/contact.md) · [Portfolio](./pages/portfolio.md) · [Lockeroom](./pages/lockeroom.md)
