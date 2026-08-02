#!/usr/bin/env node
/**
 * Prerenders SEO-critical routes into dist/<path>/index.html using Playwright.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const PORT = 4179

function loadRoutes() {
  const routesPath = path.join(DIST, 'seo-routes.json')
  if (!fs.existsSync(routesPath)) {
    throw new Error('dist/seo-routes.json missing — run generate-seo-files.js first')
  }
  const data = JSON.parse(fs.readFileSync(routesPath, 'utf8'))
  return data.routes || ['/']
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return (
    {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.txt': 'text/plain; charset=utf-8',
      '.xml': 'application/xml; charset=utf-8',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    }[ext] || 'application/octet-stream'
  )
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
      let filePath = path.join(DIST, urlPath === '/' ? 'index.html' : urlPath)
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html')
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        filePath = path.join(DIST, 'index.html')
      }
      res.writeHead(200, { 'Content-Type': contentType(filePath) })
      res.end(fs.readFileSync(filePath))
    })
    server.listen(PORT, '127.0.0.1', () => resolve(server))
  })
}

function outFileForRoute(route) {
  if (route === '/') return path.join(DIST, 'index.html')
  const dir = path.join(DIST, route.replace(/^\//, ''))
  fs.mkdirSync(dir, { recursive: true })
  return path.join(dir, 'index.html')
}


function dedupeHead(html) {
  // Keep a single title / description / canonical / og|twitter tag / robots / ld+json block
  // Prefer the LAST occurrence (Helmet/async usually appends the active route last under StrictMode).
  const keepLastByKey = new Map()
  const otherHead = []

  const headMatch = html.match(/<head([^>]*)>([\s\S]*?)<\/head>/i)
  if (!headMatch) return html
  const headAttrs = headMatch[1]
  const headInner = headMatch[2]

  const tagRe = /<title[^>]*>[\s\S]*?<\/title>|<meta\s+[^>]*>|<link\s+[^>]*>|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi
  const parts = []
  let lastIndex = 0
  let m
  while ((m = tagRe.exec(headInner))) {
    if (m.index > lastIndex) {
      const gap = headInner.slice(lastIndex, m.index)
      if (gap.trim()) otherHead.push(gap)
    }
    parts.push(m[0])
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < headInner.length) {
    const gap = headInner.slice(lastIndex)
    if (gap.trim()) otherHead.push(gap)
  }

  const rebuilt = []
  for (const tag of parts) {
    const lower = tag.toLowerCase()
    let key = null
    if (lower.startsWith('<title')) key = 'title'
    else if (/rel=["']canonical["']/i.test(tag)) key = 'canonical'
    else if (/name=["']description["']/i.test(tag)) key = 'description'
    else if (/name=["']robots["']/i.test(tag)) key = 'robots'
    else if (/property=["']og:/i.test(tag)) {
      const pm = tag.match(/property=["'](og:[^"']+)["']/i)
      key = pm ? pm[1].toLowerCase() : null
    } else if (/name=["']twitter:/i.test(tag)) {
      const tm = tag.match(/name=["'](twitter:[^"']+)["']/i)
      key = tm ? tm[1].toLowerCase() : null
    } else if (/type=["']application\/ld\+json["']/i.test(tag)) key = 'ld+json'
    else if (/rel=["']icon["']/i.test(tag) || /rel=["']apple-touch-icon["']/i.test(tag)) {
      // keep all icons
      rebuilt.push(tag)
      continue
    }

    if (key) {
      // <title>: first wins (matches document.title). Other SEO tags: last wins (Helmet appends).
      if (key === 'title') {
        if (!keepLastByKey.has(key)) keepLastByKey.set(key, tag)
      } else {
        keepLastByKey.set(key, tag)
      }
    } else {
      rebuilt.push(tag)
    }
  }

  // Order: charset-ish metas already in rebuilt; append managed tags
  const orderedKeys = [
    'title',
    'description',
    'robots',
    'canonical',
    'og:site_name',
    'og:type',
    'og:title',
    'og:description',
    'og:url',
    'og:image',
    'og:locale',
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image',
    'ld+json',
  ]
  for (const key of orderedKeys) {
    if (keepLastByKey.has(key)) rebuilt.push(keepLastByKey.get(key))
  }
  for (const [key, tag] of keepLastByKey) {
    if (!orderedKeys.includes(key)) rebuilt.push(tag)
  }

  const newHead = `<head${headAttrs}>\n${rebuilt.join('\n')}\n${otherHead.join('')}\n</head>`
  return html.replace(/<head[^>]*>[\s\S]*?<\/head>/i, newHead)
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('dist/index.html missing — run vite build first')
  }

  // Ensure seo files exist in dist
  const gen = path.join(ROOT, 'scripts/generate-seo-files.js')
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [gen], { stdio: 'inherit' })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('seo gen failed'))))
  })

  const routes = loadRoutes()
  const server = await startStaticServer()
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // 404 page shell
  const notFoundHtml = fs
    .readFileSync(path.join(DIST, 'index.html'), 'utf8')
    .replace(
      /<title>[^<]*<\/title>/,
      '<title>Page not found | Promonet</title>',
    )
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      '<meta name="description" content="That page could not be found." /><meta name="robots" content="noindex, nofollow" />',
    )
  fs.writeFileSync(path.join(DIST, '404.html'), notFoundHtml)

  for (const route of routes) {
    const url = `http://127.0.0.1:${PORT}${route}`
    process.stdout.write(`prerender ${route} … `)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {})
    // Let helmet settle
    await new Promise((r) => setTimeout(r, 150))
    const html = dedupeHead(await page.content())
    const out = outFileForRoute(route)
    fs.writeFileSync(out, html)
    console.log('ok')
  }

  await browser.close()
  server.close()
  console.log(`Prerendered ${routes.length} routes`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
