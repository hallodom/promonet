# Promonet

Marketing site for **Promonet** — integration and automation for small businesses (roughly 5–50 people). We connect CRMs and industry tools so owners stop copy-pasting between systems.

**Tagline:** Your software finally talking together.

## Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- Tailwind CSS 3 (brand tokens, class-based dark mode)
- React Router 7
- Static build → deploy to Sevalla, Vercel, or any static host

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
| `/` | Home — hero, workflows, how it works, pricing (monthly + one-off), CTA |
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
npm run build    # rebuilds app catalog, then TypeScript + Vite
npm run preview  # serve dist/
npm run build:apps  # refresh src/data/apps.json only
```

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

Legacy HTML page generator (optional):

```bash
node scripts/build-connect-pages.js
```

The live site uses React routes, not those generated HTML files.

## Deploy

Production output is static files in `dist/`.

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- SPA fallback: [`vercel.json`](vercel.json) rewrites to `index.html` (configure the same on Sevalla/Netlify if needed)

## Contact

Site CTAs use `mailto:hello@promonet.io`.
