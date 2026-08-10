#!/usr/bin/env node
/**
 * Static prerender (no browser): inject unique title/meta/H1/JSON-LD into
 * dist/<route>/index.html so crawlers see SEO content without JS.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const MATRIX = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/matrix.json'), 'utf8'),
)

const SITE_URL = 'https://promonetconsulting.com'
const SITE_NAME = 'Promonet'
const CONTACT_EMAIL = 'hello@promonetconsulting.com'
const OG_IMAGE = `${SITE_URL}/og-default.jpg`
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630
const OG_IMAGE_TYPE = 'image/jpeg'
const OG_IMAGE_ALT = 'Promonet — CRM and tool integrations for small businesses'
const SITE_LOGO = `${SITE_URL}/logo.png`

function connectSlug(crmSlug, verticalName) {
  return `${crmSlug}-to-${verticalName.replace(/\s+/g, '-')}-software`
}

function pageTitle(title) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
}

function absoluteUrl(p = '/') {
  if (!p || p === '/') return SITE_URL
  return `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function loadRoutes() {
  const routesPath = path.join(DIST, 'seo-routes.json')
  if (!fs.existsSync(routesPath)) {
    throw new Error('dist/seo-routes.json missing — run generate-seo-files.js first')
  }
  return JSON.parse(fs.readFileSync(routesPath, 'utf8')).routes || ['/']
}

function listPageMeta() {
  const pages = new Map()

  pages.set('/', {
    title: pageTitle('Connect CRM & Business Tools for Small Businesses'),
    description:
      'Promonet helps small businesses connect CRM, accounting, booking, and industry tools — fixed monthly or one-off pricing, with human support. No dev team required.',
    h1: 'Connect your CRM and tools — without a dev team.',
    lead:
      'Promonet helps small businesses connect CRM, accounting, booking, and industry software for a fixed one-off job or monthly partnership.',
    jsonLdExtra: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What does Promonet connect?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We help small businesses connect CRM platforms like Capsule, HubSpot, Pipedrive, Zoho, Copper, and Insightly to accounting, booking, and industry software — plus many other tools in your stack.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Promonet for small businesses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Promonet is built for owners and small teams who need CRM and tool integrations without hiring a full-time development team.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does it cost to connect tools?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Monthly partnerships start at £600. Scale-up is £1,500 per month. A one-off connection starts at £1,000. Custom work is quoted separately.',
          },
        },
      ],
    },
  })

  pages.set('/about', {
    title: pageTitle('About Promonet — CRM Integrations for Small Businesses'),
    description:
      'We are a small team of developers and designers helping small businesses connect CRM and industry tools at a low cost, with genuine human support.',
    h1: "Built by people who've lived the connectivity gap.",
    lead: 'We help small businesses connect CRM and industry tools at a low cost, with genuine human support.',
  })

  pages.set('/pricing', {
    title: pageTitle('Pricing for CRM & Tool Integrations'),
    description:
      'Simple pricing for CRM and tool integrations: monthly partnership options from £600, or a fixed one-off connection from £1,000. No hidden hourly fees.',
    h1: 'Pricing for CRM & tool integrations.',
    lead: 'Fixed prices for small businesses that need to connect CRM, accounting, booking, and industry tools.',
    jsonLdExtra: {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      name: 'Promonet integration pricing',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Base',
          price: '600',
          priceCurrency: 'GBP',
        },
        {
          '@type': 'Offer',
          name: 'Scale-up',
          price: '1500',
          priceCurrency: 'GBP',
        },
        {
          '@type': 'Offer',
          name: 'One-off',
          price: '1000',
          priceCurrency: 'GBP',
        },
      ],
    },
  })

  pages.set('/connect', {
    title: pageTitle('Connect Business Tools & Integrations'),
    description:
      'Search and browse tools we help small businesses connect — CRMs, accounting, booking, and niche industry software. Fixed monthly price.',
    h1: 'Connect business tools & integrations.',
    lead: 'Search or browse CRMs, accounting, mortgage, legal, dental, real estate, and niche tools. Fixed monthly price. No dev team required.',
  })

  pages.set('/connect/crm', {
    title: pageTitle('Connect Your CRM to Industry Tools'),
    description:
      'Connect Capsule, HubSpot, Pipedrive, Zoho, Copper, or Insightly to mortgage, legal, dental, real estate, and other industry software.',
    h1: 'Connect your CRM to industry tools.',
    lead: 'Pick your CRM. We will show you exactly what we connect it to — and how — for small businesses that need fixed-price integrations.',
  })

  for (const crm of MATRIX.crms) {
    for (const key of crm.verticals) {
      const vertical = MATRIX.verticals[key]
      if (!vertical) continue
      const routePath = `/connect/${connectSlug(crm.slug, vertical.name)}`
      const tools = vertical.tools.slice(0, 3).join(', ')
      const lead = `${crm.blurb} For small businesses running ${vertical.title.toLowerCase()} — tools like ${tools}${
        vertical.tools.length > 3 ? ', and more' : ''
      } — we connect ${crm.name} so leads, status updates, and handoffs stop living in copy-paste.`
      pages.set(routePath, {
        title: pageTitle(`Connect ${crm.name} to ${vertical.title}`),
        description: `Connect ${crm.name} to the ${vertical.name} software small businesses already run — fixed monthly price, no in-house dev team required.`,
        h1: `Connect ${crm.name} to ${vertical.title}.`,
        lead,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Connect tools', path: '/connect' },
          { name: 'Connect your CRM', path: '/connect/crm' },
          { name: `${crm.name} → ${vertical.title}`, path: routePath },
        ],
      })
    }
  }

  return pages
}

function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    logo: SITE_LOGO,
    image: OG_IMAGE,
    description:
      'CRM and tool integrations for small businesses. We connect your CRM to industry software and the rest of your stack for a fixed price.',
  }
}

function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

function buildHeadTags(meta, routePath) {
  const url = absoluteUrl(routePath)
  const graph = [organizationJsonLd(), websiteJsonLd()]
  if (meta.jsonLdExtra) graph.push(meta.jsonLdExtra)
  if (meta.breadcrumbs) graph.push(breadcrumbJsonLd(meta.breadcrumbs))

  return `
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:site_name" content="${esc(SITE_NAME)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(meta.title)}" />
<meta property="og:description" content="${esc(meta.description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:locale" content="en_GB" />
<link rel="image_src" href="${esc(OG_IMAGE)}" />
<meta property="og:image" content="${esc(OG_IMAGE)}" />
<meta property="og:image:secure_url" content="${esc(OG_IMAGE)}" />
<meta property="og:image:type" content="${esc(OG_IMAGE_TYPE)}" />
<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
<meta property="og:image:alt" content="${esc(OG_IMAGE_ALT)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(meta.title)}" />
<meta name="twitter:description" content="${esc(meta.description)}" />
<meta name="twitter:image" content="${esc(OG_IMAGE)}" />
<meta name="twitter:image:alt" content="${esc(OG_IMAGE_ALT)}" />
<script type="application/ld+json">${JSON.stringify(graph)}</script>
`.trim()
}

function buildBodySnippet(meta) {
  const crumbs = meta.breadcrumbs
    ? `<nav aria-label="Breadcrumb"><p>${meta.breadcrumbs
        .map((c) => `<a href="${esc(c.path)}">${esc(c.name)}</a>`)
        .join(' / ')}</p></nav>`
    : ''
  return `${crumbs}<h1>${esc(meta.h1)}</h1><p>${esc(meta.lead || meta.description)}</p>`
}

function replaceOrInsertHead(html, headTags) {
  let out = html
  out = out.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
  out = out.replace(/<meta[^>]+name=["']description["'][^>]*>/gi, '')
  out = out.replace(/<meta[^>]+name=["']robots["'][^>]*>/gi, '')
  out = out.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, '')
  out = out.replace(/<meta[^>]+property=["']og:[^"']+["'][^>]*>/gi, '')
  out = out.replace(/<meta[^>]+name=["']twitter:[^"']+["'][^>]*>/gi, '')
  out = out.replace(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    '',
  )
  if (!out.includes('</head>')) throw new Error('index.html missing </head>')
  return out.replace('</head>', `${headTags}\n</head>`)
}

function injectRoot(html, snippet) {
  if (html.includes('<div id="root"></div>')) {
    return html.replace(
      '<div id="root"></div>',
      `<div id="root"><div id="seo-prerender">${snippet}</div></div>`,
    )
  }
  return html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root"><div id="seo-prerender">${snippet}</div></div>`,
  )
}

function outFileForRoute(route) {
  if (route === '/') return path.join(DIST, 'index.html')
  const dir = path.join(DIST, route.replace(/^\//, ''))
  fs.mkdirSync(dir, { recursive: true })
  return path.join(dir, 'index.html')
}

function main() {
  const templatePath = path.join(DIST, 'index.html')
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html missing — run vite build first')
  }

  const gen = path.join(ROOT, 'scripts/generate-seo-files.js')
  const result = spawnSync(process.execPath, [gen], { stdio: 'inherit' })
  if (result.status !== 0) throw new Error('seo gen failed')

  const template = fs.readFileSync(templatePath, 'utf8')
  const metaByPath = listPageMeta()
  const routes = loadRoutes()

  const notFound = replaceOrInsertHead(
    template,
    `
<title>Page not found | Promonet</title>
<meta name="description" content="That page could not be found." />
<meta name="robots" content="noindex, nofollow" />
`.trim(),
  )
  fs.writeFileSync(
    path.join(DIST, '404.html'),
    injectRoot(notFound, '<h1>Page not found</h1><p>That page could not be found.</p>'),
  )

  for (const route of routes) {
    const meta = metaByPath.get(route)
    if (!meta) {
      console.warn(`skip (no meta): ${route}`)
      continue
    }
    let html = replaceOrInsertHead(template, buildHeadTags(meta, route))
    html = injectRoot(html, buildBodySnippet(meta))
    html = html.replace(/<html[^>]*>/, '<html lang="en-GB">')
    fs.writeFileSync(outFileForRoute(route), html)
    console.log(`prerender ${route} … ok`)
  }

  console.log(`Prerendered ${routes.length} routes (static)`)
}

main()

