#!/usr/bin/env node
/**
 * Build-time prerender: renders every route in dist/seo-routes.json with the
 * real React app (SSR bundle from `vite build --ssr src/entry-server.tsx`) and
 * writes dist/<route>/index.html, so crawlers get the full page markup plus the
 * per-route <head> tags. The client hydrates this markup (src/main.tsx).
 *
 * Also writes dist/404.html and dist/es/404.html, served by server/index.js
 * with a real 404 status for unknown paths.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SSR_ENTRY = path.join(ROOT, 'dist-ssr', 'entry-server.js')

const NOT_FOUND_PAGES = [
  { url: '/__not-found__', file: '404.html', lang: 'en-GB' },
  { url: '/es/__not-found__', file: 'es/404.html', lang: 'es-ES' },
]

function htmlLangFor(route) {
  return route === '/es' || route.startsWith('/es/') ? 'es-ES' : 'en-GB'
}

/**
 * React 19 emits hoistable tags (<title>, <meta>, <link>) at the start of a
 * non-document render. Split them off so they can be placed in <head>.
 */
function splitHoistedHead(appHtml) {
  const tagPattern = /^(?:<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*\/?>|<link\b[^>]*\/?>)/
  let rest = appHtml
  const head = []
  for (;;) {
    const match = rest.match(tagPattern)
    if (!match) break
    head.push(match[0])
    rest = rest.slice(match[0].length)
  }
  return { headTags: head, body: rest }
}

function stripTemplateHead(html) {
  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta[^>]+name=["']description["'][^>]*>\s*/gi, '')
}

function buildPage(template, { headTags, body, lang }) {
  let html = stripTemplateHead(template)
  const head = headTags.join('\n  ')
  // Title/description first so they sit within the first bytes of the document.
  html = html.replace(
    /(<meta name="viewport"[^>]*>)/,
    `$1\n  ${head}`,
  )
  if (!html.includes(head)) throw new Error('could not place head tags (viewport meta missing?)')
  html = html.replace(/<html[^>]*>/, `<html lang="${lang}">`)
  if (!html.includes('<div id="root"></div>')) throw new Error('template is missing <div id="root"></div>')
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1]
}

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function visibleText(body) {
  return decodeEntities(
    body
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ')
}

/** Every FAQPage question in JSON-LD must also be a visible question on the page. */
function auditFaqPage(body) {
  const problems = []
  const text = visibleText(body)
  for (const [, json] of body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const nodes = [JSON.parse(json)].flat()
    for (const node of nodes.filter((n) => n['@type'] === 'FAQPage')) {
      for (const q of node.mainEntity || []) {
        if (!text.includes(q.name)) problems.push(`FAQPage question not visible on page: ${q.name}`)
      }
    }
  }
  return problems
}

/** llms.txt / llms-full.txt must list every connect page with its rendered <title>. */
function auditLlmsConnectLinks(titlesByRoute) {
  const problems = []
  const connectRoutes = [...titlesByRoute.keys()].filter((r) =>
    /^\/(connect|es\/conectar)\/(?!crm$)[^/]+$/.test(r),
  )
  for (const file of ['llms.txt', 'llms-full.txt']) {
    const txt = fs.readFileSync(path.join(DIST, file), 'utf8')
    const listed = new Map()
    for (const [, title, url] of txt.matchAll(/^- \[([^\]]+)\]\((https:\/\/promonetconsulting\.com\/[^)]*)\)$/gm)) {
      listed.set(url.replace('https://promonetconsulting.com', ''), title)
    }
    for (const route of connectRoutes) {
      const expected = titlesByRoute.get(route)
      if (!listed.has(route)) problems.push(`${file}: missing integration page ${route}`)
      else if (listed.get(route) !== expected) {
        problems.push(`${file}: title for ${route} is "${listed.get(route)}", page <title> is "${expected}"`)
      }
    }
  }
  return problems
}

function audit(route, headTags, body, { expectIndexable }) {
  const problems = []
  const warnings = []
  const find = (pred) => headTags.filter(pred)
  const titles = find((t) => t.startsWith('<title'))
  const descriptions = find((t) => t.startsWith('<meta') && attr(t, 'name') === 'description')
  const canonicals = find((t) => t.startsWith('<link') && attr(t, 'rel') === 'canonical')
  const robots = find((t) => t.startsWith('<meta') && attr(t, 'name') === 'robots')

  if (titles.length !== 1) problems.push(`expected 1 <title>, got ${titles.length}`)
  if (descriptions.length !== 1) problems.push(`expected 1 meta description, got ${descriptions.length}`)
  if (robots.length !== 1) problems.push(`expected 1 meta robots, got ${robots.length}`)

  if (expectIndexable) {
    if (canonicals.length !== 1) problems.push(`expected 1 canonical, got ${canonicals.length}`)
    const href = canonicals[0] && attr(canonicals[0], 'href')
    const expected = `https://promonetconsulting.com${route === '/' ? '/' : route}`
    if (href && href !== expected) problems.push(`canonical ${href} != ${expected}`)
    if (robots[0] && /noindex/.test(attr(robots[0], 'content') || '')) problems.push('indexable route is noindex')
    for (const key of ['og:title', 'og:description', 'og:url', 'og:image']) {
      if (!find((t) => attr(t, 'property') === key).length) problems.push(`missing ${key}`)
    }
    if (!find((t) => attr(t, 'name') === 'twitter:card').length) problems.push('missing twitter:card')
    if (!body.includes('application/ld+json')) problems.push('missing JSON-LD')
    problems.push(...auditFaqPage(body))
  }

  const h1Count = (body.match(/<h1\b/g) || []).length
  if (h1Count !== 1) warnings.push(`expected 1 <h1>, got ${h1Count}`)

  for (const img of body.match(/<img\b[^>]*>/g) || []) {
    if (!/\salt="/.test(img)) warnings.push(`<img> without alt: ${img.slice(0, 80)}`)
  }

  return { problems, warnings }
}

async function main() {
  const templatePath = path.join(DIST, 'index.html')
  if (!fs.existsSync(templatePath)) throw new Error('dist/index.html missing — run vite build first')
  if (!fs.existsSync(SSR_ENTRY)) throw new Error('dist-ssr/entry-server.js missing — run the SSR build first')
  const routesPath = path.join(DIST, 'seo-routes.json')
  if (!fs.existsSync(routesPath)) throw new Error('dist/seo-routes.json missing — run generate-seo-files.js first')

  // dist/index.html is overwritten by the "/" route below, so keep the pristine
  // Vite template next to the SSR bundle (dist-ssr/ is not served).
  const templateCopy = path.join(path.dirname(SSR_ENTRY), 'template.html')
  const current = fs.readFileSync(templatePath, 'utf8')
  if (current.includes('<div id="root"></div>')) fs.writeFileSync(templateCopy, current)
  if (!fs.existsSync(templateCopy)) throw new Error('no pristine index.html template — rerun vite build')
  const template = fs.readFileSync(templateCopy, 'utf8')

  const { render } = await import(pathToFileURL(SSR_ENTRY).href)
  const { routes } = JSON.parse(fs.readFileSync(routesPath, 'utf8'))

  let failed = 0
  const seen = { titles: new Map(), descriptions: new Map() }
  const titlesByRoute = new Map()

  const renderPage = (url, lang, expectIndexable) => {
    const { html: appHtml } = render(url)
    const { headTags, body } = splitHoistedHead(appHtml)
    const { problems, warnings } = audit(url, headTags, body, { expectIndexable })
    if (expectIndexable) {
      const title = headTags.find((t) => t.startsWith('<title'))
      if (title) titlesByRoute.set(url, decodeEntities(title.replace(/<[^>]+>/g, '')))
      const desc = headTags.find((t) => attr(t, 'name') === 'description')
      for (const [map, value] of [[seen.titles, title], [seen.descriptions, desc && attr(desc, 'content')]]) {
        if (!value) continue
        if (map.has(value)) warnings.push(`duplicate of ${map.get(value)}: ${value.slice(0, 80)}`)
        else map.set(value, url)
      }
    }
    for (const w of warnings) console.warn(`  warn ${url}: ${w}`)
    if (problems.length) {
      failed += 1
      for (const p of problems) console.error(`  FAIL ${url}: ${p}`)
    }
    return buildPage(template, { headTags, body, lang })
  }

  for (const route of routes) {
    const html = renderPage(route, htmlLangFor(route), true)
    const outFile =
      route === '/' ? templatePath : path.join(DIST, route.replace(/^\//, ''), 'index.html')
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    fs.writeFileSync(outFile, html)
  }

  for (const page of NOT_FOUND_PAGES) {
    const html = renderPage(page.url, page.lang, false)
    const outFile = path.join(DIST, page.file)
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    fs.writeFileSync(outFile, html)
  }

  const llmsProblems = auditLlmsConnectLinks(titlesByRoute)
  for (const p of llmsProblems) console.error(`  FAIL ${p}`)
  if (llmsProblems.length) failed += 1

  if (failed) throw new Error(`prerender: ${failed} route(s) failed SEO checks`)
  console.log(`Prerendered ${routes.length} routes + ${NOT_FOUND_PAGES.length} not-found pages (SSR)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
