# Promonet

Marketing site for **Promonet** — CRM and tool integrations for small businesses (roughly 5–50 people). We connect CRMs and industry tools so owners stop copy-pasting between systems.

**Positioning:** Connect CRM & business tools for small businesses — fixed monthly or one-off pricing, with human support.

## Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- Tailwind CSS 3 (brand tokens, class-based dark mode)
- React Router 7 + `react-helmet-async` (per-route SEO)
- Node server (`server/index.js`) → **Sevalla Application Hosting**
- Contact form → **Resend** (`/api/contact`)

## Brand

| Token | Hex | Role |
| --- | --- | --- |
| Bone | `#F5F5F2` | Light marketing background |
| Obsidian | `#0A0A0F` | Dark surfaces / text |
| Voltage | `#2540E8` | Primary CTAs, links |
| Emergence | `#FF4A1C` | Accent (e.g. wordmark dot) |
| Graphite | `#69707D` | Secondary text (nudged from `#6B7280` to meet WCAG AA 4.5:1 on Bone) |
| Chrysalis | `#2D1B4E` | Brand-story moments |
| Imago | `#4A7C59` | Success states |

**Typography:** Roboto Slab (display) · Inter (body/UI) · JetBrains Mono (labels, stats)

Default theme is **light**. Users can toggle dark mode; preference is stored in `localStorage`.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home — hero, workflows, how it works, pricing, FAQ, CTA |
| `/about` | Team / company |
| `/pricing` | Base / Scale-up / One-off pricing |
| `/connect` | App search + full catalog (~1,300 tools) |
| `/connect/crm` | CRM → industry vertical matrix |
| `/connect/:slug` | Individual integration pages (e.g. `capsule-to-mortgage-software`) |

## Local development

```bash
npm install
npm run dev
```

Dev server: **http://127.0.0.1:3010/** (`vite.config.ts`).

```bash
npm run build       # apps catalog → tsc → vite (client) → vite --ssr → SEO files → prerender
npm start           # serve dist/ via server/index.js (PORT, default 8080)
npm run preview     # vite preview only (no 404/SEO server behaviour)
npm run build:apps  # refresh src/data/apps.json only
```

## SEO & crawler files

Build emits (into `public/` and `dist/`):

- `robots.txt` — allow all except `/api/`, points at sitemap
- `sitemap.xml` — every route (EN + ES, with hreflang alternates). `<lastmod>` is the last git commit touching that page type's sources (falls back to the committed `public/sitemap.xml` when the build has no git history)
- `llms.txt` / `llms-full.txt` — plain-text digests for AI crawlers
- `seo-routes.json` — the route list used by the prerender and by the server's 404 handling

### Prerendering (SSR at build time)

`npm run build:ssr` bundles `src/entry-server.tsx`; `scripts/prerender.mjs` then renders every route in `seo-routes.json` with the real app and writes `dist/<path>/index.html` — full page markup plus that route's `<title>`, description, robots, canonical, hreflang, Open Graph/Twitter tags (lifted into `<head>`) and JSON-LD. The client hydrates that markup (`src/main.tsx`). It also writes `dist/404.html` and `dist/es/404.html`.

The prerender fails the build if an indexable route is missing its title, description, canonical, OG/Twitter tags or JSON-LD, if a FAQPage question in JSON-LD is not visible on the page, or if `llms.txt` / `llms-full.txt` do not list every integration page with its rendered `<title>`. It warns on pages without exactly one `<h1>`, images without `alt`, or duplicate titles/descriptions.

`.reveal` blocks only start hidden under `html.reveal-js`, which the inline script in `index.html` sets when JavaScript, IntersectionObserver and motion are all available, so the prerendered HTML is fully visible without JS. The first section of each page animates in with CSS alone (so it registers as LCP).

Per-route tags and JSON-LD (Organization/ProfessionalService, WebSite, FAQPage on home — the first three integration FAQs only, OfferCatalog on pricing, BreadcrumbList on connect pages) come from `src/components/Seo.tsx` + `src/lib/seo.ts`.

### Server behaviour (`server/index.js`)

- Known routes (from `seo-routes.json`) → prerendered HTML, 200
- Anything else → `404.html` (or `es/404.html` under `/es`) with a real **404** status
- Trailing slashes, `/index.html` and duplicate slashes → **301** to the canonical path
- `www.` → apex and `X-Forwarded-Proto: http` → https in one 301; set `CANONICAL_HOST` to also fold any other hostname. Requests on other hosts get `X-Robots-Tag: noindex`
- Caching: `/assets/*` (hashed) 1 year immutable; HTML revalidates every request; `robots.txt`, `sitemap.xml`, `llms*.txt`, manifest 1 hour; other public files 1 day
- Brotli/gzip for text responses, weak ETags + 304s

### Analytics / Search Console (build-time env)

| Var | Effect |
| --- | --- |
| `VITE_GA_MEASUREMENT_ID` | Adds the GA4 `gtag.js` snippet (must look like `G-XXXXXXXXXX`). SPA navigations are counted by GA4's enhanced measurement "page changes based on browser history events" (on by default) |
| `VITE_GSC_VERIFICATION` | Adds `<meta name="google-site-verification">` (token or the full meta tag) |

Nothing is emitted when they are unset. They are read by `vite build`, so on Sevalla they must be available at **build** time.

## App catalog

Search and browse are backed by a **static** catalog (`src/data/apps.json`), not live scraping.

Built by [`scripts/build-apps-catalog.js`](scripts/build-apps-catalog.js) from:

1. ComparEdge open products API (CC BY 4.0)
2. Niche seeds in [`scripts/seed-niche-apps.json`](scripts/seed-niche-apps.json)
3. Tools from [`src/data/matrix.json`](src/data/matrix.json)
4. Extra long-tail SaaS list in the build script

`npm run build` always regenerates the catalog first. Commit `apps.json` so deploys work offline if the fetch step fails.

## CRM content

CRM × vertical copy lives in [`src/data/matrix.json`](src/data/matrix.json) (and a copy under `scripts/` for the older generator). Edit that file to add CRMs, verticals, or flow copy.

## Deploy (Sevalla Application Hosting)

- **Build command:** `npm run build`
- **Start command:** `npm start` (or `node server/index.js`)
- **Node:** ≥ 20
- Env vars for contact: `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO`
- Recommended: `CANONICAL_HOST=promonetconsulting.com`; optional `PORT`
- Build-time: `VITE_GA_MEASUREMENT_ID`, `VITE_GSC_VERIFICATION` (see above)

The Node server serves `dist/` (including prerendered routes and SEO files) and handles `/api/contact`.

## Contact

Contact modal posts to `/api/contact` (Resend → `eddy@promonetconsulting.com`). Requires `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO`.

