# Renatus Website

Static marketing single-page app: React 18 + Vite 6, Tailwind CSS v4, `react-router-dom` v7 (client-side routing), Framer Motion + Lenis. All content is static (`src/data/content.js`); there is no backend, database, or auth. See `docs/README.md` for the route map and per-page docs.

## Cursor Cloud specific instructions

- Dependencies are already installed by the startup update script (`npm install`). Node 22 is used.
- Run the dev server with `npm run dev` (Vite, serves on `http://localhost:5173`). Build with `npm run build`; preview a production build with `npm run preview`.
- There is no lint or test script configured (`package.json` has only `dev`, `build`, `preview`, and `process-portfolio`). Do not assume a test runner exists.
- `npm run process-portfolio` regenerates optimized images in `public/portfolio/` from source assets using `sharp`; only relevant when changing portfolio imagery.
- No environment variables are required to run the app. `VITE_*` vars referenced in `docs/` are aspirational/future integrations and are not wired up. The contact/booking form uses a `mailto:` fallback and an inline scheduling embed placeholder — no API keys needed.
- Core user flow to smoke-test: load `/`, navigate via the navbar (`/services`, `/portfolio`, `/workshops`, `/contact`), fill the enquiry form on `/contact`, and open the "Book Free Diagnostic" modal (booking overlay) from the navbar CTA.
