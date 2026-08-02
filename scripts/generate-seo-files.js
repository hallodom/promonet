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
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { path: '/connect', priority: '0.9', changefreq: 'weekly' },
    { path: '/connect/crm', priority: '0.9', changefreq: 'weekly' },
  ]

  for (const crm of MATRIX.crms) {
    for (const key of crm.verticals) {
      const vertical = MATRIX.verticals[key]
      if (!vertical) continue
      routes.push({
        path: `/connect/${connectSlug(crm.slug, vertical.name)}`,
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

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
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

## Who it's for
- Small businesses and owners (roughly 5–50 people)
- Teams that need to connect CRM, accounting, booking, and niche tools
- Companies that want fixed pricing instead of open-ended hourly agency work

## Key pages
- [Home](${SITE_URL}/): Connect CRM and business tools for small businesses
- [Connect tools](${SITE_URL}/connect): Search and browse tools we can connect
- [Connect your CRM](${SITE_URL}/connect/crm): CRM → industry software matrix
- [Pricing](${SITE_URL}/pricing): Starter £600/mo, Growth £1,500/mo, One-off £1,000
- [About](${SITE_URL}/about): Team background and why Promonet exists

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
- Starter: £600 / month — one CRM + 1 tool, up to 3 flows, monitoring, 24-hour email support
- Growth: £1,500 / month — one CRM + 4 tools, unlimited flows, priority Slack, quarterly review
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

// Also emit a routes JSON for prerender + server 404 checks
const routesJson = JSON.stringify(
  {
    siteUrl: SITE_URL,
    routes: routes.map((r) => r.path),
    connectSlugs: routes
      .filter((r) => r.path.startsWith('/connect/') && r.path !== '/connect/crm')
      .map((r) => r.path.replace('/connect/', '')),
  },
  null,
  2,
)
writeBoth('seo-routes.json', routesJson)
