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
const MATRIX_EN = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/matrix.json'), 'utf8'),
)
const MATRIX_ES = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/matrix.es.json'), 'utf8'),
)
const MSG_EN = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/i18n/messages/en.json'), 'utf8'),
)
const MSG_ES = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/i18n/messages/es.json'), 'utf8'),
)
const PRODUCT_WEBSITES = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/product-websites.json'), 'utf8'),
)

const SITE_URL = 'https://promonetconsulting.com'
const SITE_NAME = 'Promonet'
const CONTACT_EMAIL = 'hello@promonetconsulting.com'
const OG_IMAGE = `${SITE_URL}/og-default.jpg`
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630
const OG_IMAGE_TYPE = 'image/jpeg'
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

function productLink(name, label = name) {
  const website = PRODUCT_WEBSITES[name.toLowerCase()]
  if (!website) return esc(label)
  return `<a href="${esc(website)}" target="_blank" rel="noreferrer">${esc(label)}</a>`
}

function interpolate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

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

function loadRoutes() {
  const routesPath = path.join(DIST, 'seo-routes.json')
  if (!fs.existsSync(routesPath)) {
    throw new Error('dist/seo-routes.json missing — run generate-seo-files.js first')
  }
  return JSON.parse(fs.readFileSync(routesPath, 'utf8')).routes || ['/']
}

function localeForPath(routePath) {
  return routePath === '/es' || routePath.startsWith('/es/') ? 'es' : 'en'
}

function addStaticPages(pages, locale, msgs, paths) {
  const seo = msgs.seo
  pages.set(paths.home, {
    locale,
    title: pageTitle(seo.homeTitle),
    description: seo.homeDescription,
    h1: msgs.home.heroTitleBefore + ' ' + msgs.home.heroTitleAccent,
    lead: seo.homeDescription,
    imageAlt: seo.ogImageAlt,
    jsonLdExtra: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: msgs.faqs.slice(0, 3).map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  })

  pages.set(paths.about, {
    locale,
    title: pageTitle(seo.aboutTitle),
    description: seo.aboutDescription,
    h1: msgs.about.title,
    lead: msgs.about.p1,
    imageAlt: seo.ogImageAlt,
  })

  pages.set(paths.pricing, {
    locale,
    title: pageTitle(seo.pricingTitle),
    description: seo.pricingDescription,
    h1: msgs.pricingPage.title,
    lead: msgs.pricingPage.subtitle,
    imageAlt: seo.ogImageAlt,
    jsonLdExtra: {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      name: seo.offerCatalogName,
      itemListElement: [
        { '@type': 'Offer', name: msgs.pricingData.base.name, price: '600', priceCurrency: 'GBP' },
        { '@type': 'Offer', name: msgs.pricingData.scaleup.name, price: '1500', priceCurrency: 'GBP' },
        { '@type': 'Offer', name: msgs.pricingData.oneoff.name, price: '1000', priceCurrency: 'GBP' },
      ],
    },
  })

  pages.set(paths.connect, {
    locale,
    title: pageTitle(seo.connectTitle),
    description: seo.connectDescription,
    h1: msgs.connectIndex.title,
    lead: seo.connectDescription,
    imageAlt: seo.ogImageAlt,
  })

  pages.set(paths.connectCrm, {
    locale,
    title: pageTitle(seo.connectCrmTitle),
    description: seo.connectCrmDescription,
    h1: msgs.connectCrm.title,
    lead: msgs.connectCrm.body,
    imageAlt: seo.ogImageAlt,
  })
}

function addConnectPages(pages, locale, msgs, matrix, paths) {
  const seo = msgs.seo
  const andWord = msgs.common.and
  const andMore = msgs.common.andMore

  for (const crm of matrix.crms) {
    for (const key of crm.verticals) {
      const vertical = matrix.verticals[key]
      if (!vertical) continue
      const slug = connectSlug(crm.slug, vertical.name)
      const routePath = locale === 'es' ? `/es/conectar/${slug}` : `/connect/${slug}`
      const tools = vertical.tools.slice(0, 3)
      const linkedTools = tools
        .map(
          (tool, index) =>
            `${index > 0 ? (index === tools.length - 1 ? `, ${andWord} ` : ', ') : ''}${productLink(tool)}`,
        )
        .join('')
      const leadHtml = `${esc(crm.blurb)}${esc(
        interpolate(msgs.connectPage.leadBefore, {
          verticalLower: vertical.title.toLowerCase(),
        }),
      )}${linkedTools}${vertical.tools.length > 3 ? esc(andMore) : ''}${esc(
        msgs.connectPage.leadAfter,
      )}${productLink(crm.name)}${esc(msgs.connectPage.leadEnd)}`

      pages.set(routePath, {
        locale,
        title: pageTitle(
          interpolate(seo.connectPageTitle, {
            crm: crm.name,
            vertical: vertical.title,
          }),
        ),
        description: interpolate(seo.connectPageDescription, {
          crm: crm.name,
          vertical: vertical.name,
        }),
        h1: interpolate(msgs.connectPage.title, {
          crm: crm.name,
          vertical: vertical.title,
        }),
        leadHtml,
        imageAlt: seo.ogImageAlt,
        breadcrumbs: [
          { name: msgs.connectPage.home, path: paths.home },
          { name: msgs.connectPage.connectTools, path: paths.connect },
          { name: msgs.connectPage.connectCrm, path: paths.connectCrm },
          { name: `${crm.name} → ${vertical.title}`, path: routePath },
        ],
      })
    }
  }
}

function listPageMeta() {
  const pages = new Map()

  addStaticPages(pages, 'en', MSG_EN, {
    home: '/',
    about: '/about',
    pricing: '/pricing',
    connect: '/connect',
    connectCrm: '/connect/crm',
  })
  addConnectPages(pages, 'en', MSG_EN, MATRIX_EN, {
    home: '/',
    connect: '/connect',
    connectCrm: '/connect/crm',
  })

  addStaticPages(pages, 'es', MSG_ES, {
    home: '/es',
    about: '/es/nosotros',
    pricing: '/es/precios',
    connect: '/es/conectar',
    connectCrm: '/es/conectar/crm',
  })
  addConnectPages(pages, 'es', MSG_ES, MATRIX_ES, {
    home: '/es',
    connect: '/es/conectar',
    connectCrm: '/es/conectar/crm',
  })

  return pages
}

function organizationJsonLd(locale) {
  const msgs = locale === 'es' ? MSG_ES : MSG_EN
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    logo: SITE_LOGO,
    image: OG_IMAGE,
    description: msgs.seo.orgDescription,
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
  const locale = meta.locale || localeForPath(routePath)
  const url = absoluteUrl(routePath)
  const enHref = absoluteUrl(toEnPath(routePath))
  const esHref = absoluteUrl(toEsPath(routePath))
  const ogLocale = locale === 'es' ? 'es_ES' : 'en_GB'
  const ogAlt = locale === 'es' ? 'en_GB' : 'es_ES'
  const imageAlt = meta.imageAlt || OG_IMAGE_ALT_DEFAULT(locale)
  const graph = [organizationJsonLd(locale), websiteJsonLd()]
  if (meta.jsonLdExtra) graph.push(meta.jsonLdExtra)
  if (meta.breadcrumbs) graph.push(breadcrumbJsonLd(meta.breadcrumbs))

  return `
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${esc(url)}" />
<link rel="alternate" hreflang="en" href="${esc(enHref)}" />
<link rel="alternate" hreflang="es" href="${esc(esHref)}" />
<link rel="alternate" hreflang="x-default" href="${esc(enHref)}" />
<meta property="og:site_name" content="${esc(SITE_NAME)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(meta.title)}" />
<meta property="og:description" content="${esc(meta.description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:locale" content="${ogLocale}" />
<meta property="og:locale:alternate" content="${ogAlt}" />
<link rel="image_src" href="${esc(OG_IMAGE)}" />
<meta property="og:image" content="${esc(OG_IMAGE)}" />
<meta property="og:image:secure_url" content="${esc(OG_IMAGE)}" />
<meta property="og:image:type" content="${esc(OG_IMAGE_TYPE)}" />
<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
<meta property="og:image:alt" content="${esc(imageAlt)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(meta.title)}" />
<meta name="twitter:description" content="${esc(meta.description)}" />
<meta name="twitter:image" content="${esc(OG_IMAGE)}" />
<meta name="twitter:image:alt" content="${esc(imageAlt)}" />
<script type="application/ld+json">${JSON.stringify(graph)}</script>
`.trim()
}

function OG_IMAGE_ALT_DEFAULT(locale) {
  return locale === 'es' ? MSG_ES.seo.ogImageAlt : MSG_EN.seo.ogImageAlt
}

function buildBodySnippet(meta) {
  const crumbs = meta.breadcrumbs
    ? `<nav aria-label="Breadcrumb"><p>${meta.breadcrumbs
        .map((c) => `<a href="${esc(c.path)}">${esc(c.name)}</a>`)
        .join(' / ')}</p></nav>`
    : ''
  return `${crumbs}<h1>${meta.h1Html || esc(meta.h1)}</h1><p>${meta.leadHtml || esc(meta.lead || meta.description)}</p>`
}

function replaceOrInsertHead(html, headTags) {
  let out = html
  out = out.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
  out = out.replace(/<meta[^>]+name=["']description["'][^>]*>/gi, '')
  out = out.replace(/<meta[^>]+name=["']robots["'][^>]*>/gi, '')
  out = out.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, '')
  out = out.replace(/<link[^>]+rel=["']alternate["'][^>]*>/gi, '')
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
    const lang = meta.locale === 'es' ? 'es-ES' : 'en-GB'
    let html = replaceOrInsertHead(template, buildHeadTags(meta, route))
    html = injectRoot(html, buildBodySnippet(meta))
    html = html.replace(/<html[^>]*>/, `<html lang="${lang}">`)
    fs.writeFileSync(outFileForRoute(route), html)
    console.log(`prerender ${route} … ok`)
  }

  console.log(`Prerendered ${routes.length} routes (static)`)
}

main()
