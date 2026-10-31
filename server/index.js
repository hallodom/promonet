import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import zlib from 'node:zlib'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { readJsonBody, sendContactEmail } from './sendContactEmail.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const port = Number(process.env.PORT || 8080)

const brotli = promisify(zlib.brotliCompress)
const gzip = promisify(zlib.gzip)

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
}

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.ico', '.txt', '.xml', '.map', '.webmanifest'])

// Crawler/discovery files change with each deploy and are not content-hashed.
const SHORT_CACHE_FILES = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/llms-full.txt',
  '/site.webmanifest',
  '/seo-routes.json',
])

const seo = loadSeoRoutes()
const knownRoutes = new Set(seo.routes)
const siteHost = new URL(seo.siteUrl).host
const canonicalHost = (process.env.CANONICAL_HOST || '').trim().toLowerCase() || null

function loadSeoRoutes() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(dist, 'seo-routes.json'), 'utf8'))
    return { siteUrl: data.siteUrl, routes: data.routes || [] }
  } catch {
    console.warn('dist/seo-routes.json missing — run npm run build')
    return { siteUrl: 'https://promonetconsulting.com', routes: [] }
  }
}

function cacheControlFor(urlPath, ext) {
  if (urlPath.startsWith('/assets/')) return 'public, max-age=31536000, immutable'
  if (ext === '.html') return 'public, max-age=0, must-revalidate'
  if (SHORT_CACHE_FILES.has(urlPath)) return 'public, max-age=3600'
  return 'public, max-age=86400, stale-while-revalidate=604800'
}

/** In-memory cache of file bodies, ETags and compressed variants (dist/ is immutable at runtime). */
const fileCache = new Map()

function loadFile(filePath) {
  let stat
  try {
    stat = fs.statSync(filePath)
  } catch {
    return null
  }
  if (!stat.isFile()) return null

  const cached = fileCache.get(filePath)
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) return cached

  const body = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const entry = {
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    ext,
    body,
    etag: `W/"${crypto.createHash('sha1').update(body).digest('base64url').slice(0, 27)}"`,
    lastModified: stat.mtime.toUTCString(),
    compressible: COMPRESSIBLE.has(ext) && body.length > 1024,
    variants: {},
  }
  fileCache.set(filePath, entry)
  return entry
}

function compressed(entry, encoding) {
  if (!entry.variants[encoding]) {
    entry.variants[encoding] =
      encoding === 'br'
        ? brotli(entry.body, {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
              [zlib.constants.BROTLI_PARAM_SIZE_HINT]: entry.body.length,
            },
          })
        : gzip(entry.body, { level: 9 })
  }
  return entry.variants[encoding]
}

function pickEncoding(req) {
  const header = String(req.headers['accept-encoding'] || '').toLowerCase()
  const accepts = (name) => {
    const match = header.match(new RegExp(`(?:^|,)\\s*${name}\\s*(?:;\\s*q=([0-9.]+))?`))
    return Boolean(match) && (match[1] === undefined || Number(match[1]) > 0)
  }
  if (accepts('br')) return 'br'
  if (accepts('gzip')) return 'gzip'
  return null
}

function send(req, res, status, body, headers = {}) {
  const buf = typeof body === 'string' ? Buffer.from(body) : body
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    'Content-Length': buf.length,
    ...headers,
  })
  res.end(req.method === 'HEAD' ? undefined : buf)
}

function sendJson(req, res, status, data) {
  send(req, res, status, JSON.stringify(data), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
}

function redirect(req, res, location, status = 301) {
  send(req, res, status, '', {
    Location: location,
    'Cache-Control': 'public, max-age=3600',
  })
}

async function serveFile(req, res, filePath, { status = 200, urlPath, extraHeaders = {} } = {}) {
  const entry = loadFile(filePath)
  if (!entry) return false

  const headers = {
    'Content-Type': mime[entry.ext] || 'application/octet-stream',
    'Cache-Control': status === 200 ? cacheControlFor(urlPath, entry.ext) : 'no-cache',
    ETag: entry.etag,
    'Last-Modified': entry.lastModified,
    ...extraHeaders,
  }
  if (entry.compressible) headers.Vary = 'Accept-Encoding'

  if (status === 200 && req.headers['if-none-match'] === entry.etag) {
    res.writeHead(304, headers)
    res.end()
    return true
  }

  let body = entry.body
  if (entry.compressible) {
    const encoding = pickEncoding(req)
    if (encoding) {
      body = await compressed(entry, encoding)
      headers['Content-Encoding'] = encoding
    }
  }
  send(req, res, status, body, headers)
  return true
}

async function sendNotFound(req, res, urlPath, extraHeaders) {
  const isSpanish = urlPath === '/es' || urlPath.startsWith('/es/')
  const page = path.join(dist, isSpanish ? 'es/404.html' : '404.html')
  if (await serveFile(req, res, page, { status: 404, urlPath, extraHeaders })) return
  send(req, res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8', ...extraHeaders })
}

function resolveInDist(urlPath) {
  const resolved = path.normalize(path.join(dist, urlPath))
  if (resolved !== dist && !resolved.startsWith(dist + path.sep)) return null
  return resolved
}

async function serveStatic(req, res, extraHeaders) {
  const rawPath = (req.url || '/').split('?')[0] || '/'
  const search = (req.url || '').slice(rawPath.length)

  let urlPath
  try {
    urlPath = decodeURIComponent(rawPath)
  } catch {
    return send(req, res, 400, 'Bad request', { 'Content-Type': 'text/plain; charset=utf-8' })
  }
  if (urlPath.includes('\0')) {
    return send(req, res, 400, 'Bad request', { 'Content-Type': 'text/plain; charset=utf-8' })
  }

  // One canonical URL per page: no duplicate slashes, no trailing slash, no /index.html.
  let canonicalPath = rawPath.replace(/\/{2,}/g, '/')
  canonicalPath = canonicalPath.replace(/\/index\.html$/i, '/')
  if (canonicalPath.length > 1) canonicalPath = canonicalPath.replace(/\/+$/, '')
  if (canonicalPath !== rawPath) return redirect(req, res, `${canonicalPath}${search}`)

  if (!path.extname(urlPath)) {
    if (!knownRoutes.has(urlPath)) return sendNotFound(req, res, urlPath, extraHeaders)
    const page = urlPath === '/' ? path.join(dist, 'index.html') : resolveInDist(`${urlPath}/index.html`)
    if (page && (await serveFile(req, res, page, { urlPath, extraHeaders }))) return
    return send(req, res, 503, 'Build missing. Run npm run build.', {
      'Content-Type': 'text/plain; charset=utf-8',
    })
  }

  const filePath = resolveInDist(urlPath)
  const isHidden = urlPath.split('/').some((part) => part.startsWith('.'))
  if (filePath && !isHidden && (await serveFile(req, res, filePath, { urlPath, extraHeaders }))) return
  if (path.extname(urlPath).toLowerCase() === '.html') return sendNotFound(req, res, urlPath, extraHeaders)
  return send(req, res, 404, 'Not found', {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache',
  })
}

async function handleContact(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    return res.end()
  }

  if (req.method !== 'POST') {
    return sendJson(req, res, 405, { error: 'Method not allowed' })
  }

  try {
    const body = await readJsonBody(req)
    const result = await sendContactEmail(body)
    if (!result.ok) {
      return sendJson(req, res, result.status || 500, { error: result.error })
    }
    return sendJson(req, res, 200, { ok: true, id: result.id })
  } catch (err) {
    return sendJson(req, res, 500, {
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

/**
 * Single-hop redirect to https://<canonical host>. Without CANONICAL_HOST only
 * www.<site host> is folded into the site host, and other hosts (platform
 * preview domains) are served with X-Robots-Tag: noindex instead.
 */
function hostPolicy(req) {
  const host = String(req.headers.host || '').split(':')[0].toLowerCase()
  const proto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase()
  const isLocal = !host || host === 'localhost' || host === '127.0.0.1' || host === '::1'
  if (isLocal) return {}

  const target = canonicalHost || (host === `www.${siteHost}` ? siteHost : host)
  if (target !== host || (proto === 'http' && target === (canonicalHost || siteHost))) {
    return { redirectTo: `https://${target}${req.url || '/'}` }
  }
  if (host !== (canonicalHost || siteHost)) {
    return { headers: { 'X-Robots-Tag': 'noindex' } }
  }
  return {}
}

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url || '/'

    if (url === '/health' || url === '/api/health') {
      return sendJson(req, res, 200, { ok: true })
    }

    const policy = hostPolicy(req)
    if (policy.redirectTo) return redirect(req, res, policy.redirectTo)

    if (url.startsWith('/api/contact')) {
      return handleContact(req, res)
    }
    if (url.startsWith('/api/')) {
      return sendJson(req, res, 404, { error: 'Not found' })
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(req, res, 405, 'Method not allowed', {
        Allow: 'GET, HEAD',
        'Content-Type': 'text/plain; charset=utf-8',
      })
    }
    return await serveStatic(req, res, policy.headers)
  } catch (err) {
    console.error(err)
    if (!res.headersSent) send(req, res, 500, 'Server error', { 'Content-Type': 'text/plain; charset=utf-8' })
    else res.end()
  }
})

server.listen(port, () => {
  console.log(`Promonet listening on :${port}`)
})
