#!/usr/bin/env node
/**
 * Writes robots.txt, sitemap.xml, llms.txt, llms-full.txt into public/ and dist/.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MATRIX = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/matrix.json'), 'utf8'),
)

const SITE_URL = 'https://promonetconsulting.com'
const CONTACT_EMAIL = 'hello@promonetconsulting.com'

function connectSlug(crmSlug, verticalName) {
  return `${crmSlug}-to-${verticalName.replace(/\s+/g, '-')}-software`
}

function listRoutes() {
  const enBase = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { path: '/connect', priority: '0.9', changefreq: 'weekly' },
    { path: '/connect/crm', priority: '0.9', changefreq: 'weekly' },
  ]
  const esBase = [
    { path: '/es', priority: '1.0', changefreq: 'weekly' },
    { path: '/es/nosotros', priority: '0.6', changefreq: 'monthly' },
    { path: '/es/precios', priority: '0.8', changefreq: 'monthly' },
    { path: '/es/conectar', priority: '0.9', changefreq: 'weekly' },
    { path: '/es/conectar/crm', priority: '0.9', changefreq: 'weekly' },
  ]

  const routes = [...enBase, ...esBase]

  for (const crm of MATRIX.crms) {
    for (const key of crm.verticals) {
      const vertical = MATRIX.verticals[key]
      if (!vertical) continue
      const slug = connectSlug(crm.slug, vertical.name)
      routes.push({
        path: `/connect/${slug}`,
        priority: '0.7',
        changefreq: 'monthly',
      })
      routes.push({
        path: `/es/conectar/${slug}`,
        priority: '0.7',
        changefreq: 'monthly',
      })
    }
  }
  return routes
}

function writeBoth(relPath, content) {
  for (const dir of ['public', 'dist']) {
    const full = path.join(ROOT, dir)
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true })
    fs.writeFileSync(path.join(full, relPath), content)
  }
  console.log(`wrote ${relPath}`)
}

const routes = listRoutes()
const today = new Date().toISOString().slice(0, 10)

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

function toEnPath(p) {
  if (p === '/es') return '/'
  if (!p.startsWith('/es')) return p
  return p
    .replace(/^\/es\/conectar/, '/connect')
    .replace(/^\/es\/precios$/, '/pricing')
    .replace(/^\/es\/nosotros$/, '/about')
}

function toEsPath(p) {
  if (p === '/') return '/es'
  if (p.startsWith('/es')) return p
  return p
    .replace(/^\/connect/, '/es/conectar')
    .replace(/^\/pricing$/, '/es/precios')
    .replace(/^\/about$/, '/es/nosotros')
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes
  .map((r) => {
    const loc = r.path === '/' ? '/' : r.path
    const enPath = toEnPath(r.path)
    const esPath = toEsPath(r.path)
    const enHref = `${SITE_URL}${enPath === '/' ? '/' : enPath}`
    const esHref = `${SITE_URL}${esPath}`
    return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enHref}"/>
    <xhtml:link rel="alternate" hreflang="es" href="${esHref}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enHref}"/>
  </url>`
  })
  .join('\n')}
</urlset>
`

const crmList = MATRIX.crms.map((c) => c.name).join(', ')
const verticalList = Object.values(MATRIX.verticals)
  .map((v) => v.title)
  .join(', ')

const llms = `# Promonet

> CRM and tool integrations for small businesses.

Promonet helps small business owners connect their CRM to industry software and the rest of their stack — without hiring a full-time development team. Fixed monthly partnerships or one-off builds, with human support.

The site is available in English (default) and Spanish under /es paths.

## Who it's for
- Small businesses and owners (roughly 5–50 people)
- Teams that need to connect CRM, accounting, booking, and niche tools
- Companies that want fixed pricing instead of open-ended hourly agency work

## Key pages (English)
- [Home](${SITE_URL}/): Connect CRM and business tools for small businesses
- [Connect tools](${SITE_URL}/connect): Search and browse tools we can connect
- [Connect your CRM](${SITE_URL}/connect/crm): CRM → industry software matrix
- [Pricing](${SITE_URL}/pricing): Base £600/mo, Scale-up £1,500/mo, One-off £1,000
- [About](${SITE_URL}/about): Team background and why Promonet exists

## Key pages (Spanish)
- [Inicio](${SITE_URL}/es)
- [Conectar herramientas](${SITE_URL}/es/conectar)
- [Conectar tu CRM](${SITE_URL}/es/conectar/crm)
- [Precios](${SITE_URL}/es/precios)
- [Nosotros](${SITE_URL}/es/nosotros)

## CRMs we commonly connect
${crmList}

## Industry software areas
${verticalList}

## Contact
Email: ${CONTACT_EMAIL}
`

const llmsFull = `# Promonet — full summary for AI systems

## What Promonet does
Promonet builds and maintains integrations that connect CRM platforms to other business tools and industry-specific software. The goal is to help small businesses stop re-typing data between systems.

We are not a generic IT helpdesk. We partner with owners like teammates: map the stack, build the connections, document them, and stick around when APIs change or new tools are added.

## Languages
- English (default): unprefixed URLs
- Spanish: /es, /es/precios, /es/nosotros, /es/conectar, /es/conectar/crm, /es/conectar/:slug

## Who it is for
Small businesses and owner-led teams who:
- Run a CRM plus several other tools that do not sync
- Cannot justify a full-time integration engineer
- Want a fixed monthly partnership or a clear one-off price

## What "connect tools" means
Connecting tools means moving data automatically between systems you already pay for — for example:
- Website lead → CRM → loan origination / practice management / job management
- Payments / invoices → accounting
- Booking software → CRM
- Status updates mirrored back into the CRM

## CRM platforms
${MATRIX.crms.map((c) => `- ${c.name}: ${c.blurb}`).join('\n')}

## Pricing (GBP)
- Base: £600 / month — one CRM + tools, monitoring, email and Zoom support
- Scale-up: £1,500 / month — multiple CRMs + tools, priority support
- One-off: £1,000 — one connection end-to-end, one follow-up task, documented handoff
- Custom: quoted for multi-CRM / complex logic

## How it works
1. Get-to-know-you call — map tools, sketch flows, fixed quote
2. Build — typically two to four weeks with monitoring from day one
3. Run — ongoing maintenance and 24-hour response on partnership plans

## Important URLs
${routes.map((r) => `- ${SITE_URL}${r.path === '/' ? '/' : r.path}`).join('\n')}

## Contact
${CONTACT_EMAIL}
Website: ${SITE_URL}
`

writeBoth('robots.txt', robots)
writeBoth('sitemap.xml', sitemap)
writeBoth('llms.txt', llms)
writeBoth('llms-full.txt', llmsFull)

const routesJson = JSON.stringify(
  {
    siteUrl: SITE_URL,
    routes: routes.map((r) => r.path),
    connectSlugs: [
      ...new Set(
        routes
          .filter(
            (r) =>
              (r.path.startsWith('/connect/') && r.path !== '/connect/crm') ||
              (r.path.startsWith('/es/conectar/') && r.path !== '/es/conectar/crm'),
          )
          .map((r) =>
            r.path
              .replace('/es/conectar/', '')
              .replace('/connect/', ''),
          ),
      ),
    ],
  },
  null,
  2,
)
writeBoth('seo-routes.json', routesJson)
