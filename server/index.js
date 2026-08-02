import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readJsonBody, sendContactEmail } from './sendContactEmail.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const port = Number(process.env.PORT || 8080)
const canonicalHost = (process.env.CANONICAL_HOST || '').trim().toLowerCase()

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
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
}

let connectSlugs = null
function loadConnectSlugs() {
  if (connectSlugs) return connectSlugs
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(dist, 'seo-routes.json'), 'utf8'),
    )
    connectSlugs = new Set(data.connectSlugs || [])
  } catch {
    connectSlugs = new Set()
  }
  return connectSlugs
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers)
  res.end(body)
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), {
    'Content-Type': 'application/json; charset=utf-8',
  })
}

async function handleContact(req, res) {
  if (req.method === 'OPTIONS') {
    return send(res, 204, '', {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  try {
    const body = await readJsonBody(req)
    const result = await sendContactEmail(body)
    if (!result.ok) {
      return sendJson(res, result.status || 500, { error: result.error })
    }
    return sendJson(res, 200, { ok: true, id: result.id })
  } catch (err) {
    return sendJson(res, 500, {
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
}

function safeJoin(base, requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0] || '/')
  const resolved = path.normalize(path.join(base, decoded))
  if (!resolved.startsWith(base)) return null
  return resolved
}

function sendFile(res, filePath, status = 200) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false
  }
  const ext = path.extname(filePath).toLowerCase()
  const type = mime[ext] || 'application/octet-stream'
  const data = fs.readFileSync(filePath)
  send(res, status, data, {
    'Content-Type': type,
    'Cache-Control':
      ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  })
  return true
}

function serveStatic(req, res) {
  const urlPath = req.url?.split('?')[0] || '/'

  // Unknown /connect/:slug → real HTTP 404 (not SPA 200)
  const connectMatch = urlPath.match(/^\/connect\/([^/]+)\/?$/)
  if (connectMatch && connectMatch[1] !== 'crm') {
    const slugs = loadConnectSlugs()
    if (slugs.size > 0 && !slugs.has(connectMatch[1])) {
      const notFound = path.join(dist, '404.html')
      if (sendFile(res, notFound, 404)) return
      return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' })
    }
  }

  let filePath = safeJoin(dist, urlPath === '/' ? '/index.html' : urlPath)
  if (!filePath) return send(res, 400, 'Bad request')

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html')
  }

  // Prefer prerendered route HTML when requesting a clean path without extension
  if (!path.extname(urlPath) && urlPath !== '/') {
    const prerendered = safeJoin(dist, `${urlPath.replace(/\/$/, '')}/index.html`)
    if (prerendered && fs.existsSync(prerendered) && fs.statSync(prerendered).isFile()) {
      filePath = prerendered
    }
  }

  // SPA fallback for unknown non-connect routes
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(dist, 'index.html')
  }

  if (!sendFile(res, filePath, 200)) {
    return send(res, 503, 'Build missing. Run npm run build.')
  }
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '/'

  if (canonicalHost) {
    const host = (req.headers.host || '').split(':')[0].toLowerCase()
    if (host && host !== canonicalHost) {
      return send(res, 301, '', {
        Location: `https://${canonicalHost}${url}`,
      })
    }
  }

  if (url.startsWith('/api/contact')) {
    return handleContact(req, res)
  }
  if (url === '/health' || url === '/api/health') {
    return sendJson(res, 200, { ok: true })
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method not allowed')
  }
  return serveStatic(req, res)
})

server.listen(port, () => {
  console.log(`Promonet listening on :${port}`)
})
