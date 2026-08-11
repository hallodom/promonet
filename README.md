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
| Graphite | `#6B7280` | Secondary text |
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
npm run build       # apps catalog → tsc → vite → SEO files → prerender
npm start           # serve dist/ via server/index.js (PORT, default 8080)
npm run preview     # vite preview only (no 404/SEO server behaviour)
npm run build:apps  # refresh src/data/apps.json only
```

## SEO & crawler files

Build emits (into `public/` and `dist/`):

- `robots.txt` — allow all, points at sitemap
- `sitemap.xml` — home, about, pricing, connect, CRM matrix, all connect slugs
- `llms.txt` / `llms-full.txt` — plain-text digests for AI crawlers
- `seo-routes.json` — route list for prerender + server 404 checks
- Prerendered HTML under `dist/<path>/index.html` (static SEO inject at build time)

Per-route `<title>`, meta description, canonical, Open Graph/Twitter, and JSON-LD (Organization, WebSite, FAQ on home, OfferCatalog on pricing, BreadcrumbList on connect pages) via `src/components/Seo.tsx` + `src/lib/seo.ts`.

Canonical site URL: `https://promonetconsulting.com`. Optional server env `CANONICAL_HOST=promonetconsulting.com` 301s other hosts (e.g. www) to the apex.

Unknown `/connect/:slug` values return **HTTP 404** with `dist/404.html` (not SPA 200).

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
- Optional: `CANONICAL_HOST=promonetconsulting.com`, `PORT`

The Node server serves `dist/` (including prerendered routes and SEO files) and handles `/api/contact`.

## Contact

Contact modal posts to `/api/contact` (Resend → `eddy@promonetconsulting.com`). Requires `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO`.

