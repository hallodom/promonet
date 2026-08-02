import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readJsonBody, sendContactEmail } from './sendContactEmail.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const port = Number(process.env.PORT || 8080)

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
  '.map': 'application/json; charset=utf-8',
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

function serveStatic(req, res) {
  const urlPath = req.url?.split('?')[0] || '/'
  let filePath = safeJoin(dist, urlPath === '/' ? '/index.html' : urlPath)
  if (!filePath) return send(res, 400, 'Bad request')

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html')
  }

  // SPA fallback
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(dist, 'index.html')
  }

  if (!fs.existsSync(filePath)) {
    return send(res, 503, 'Build missing. Run npm run build.')
  }

  const ext = path.extname(filePath).toLowerCase()
  const type = mime[ext] || 'application/octet-stream'
  const data = fs.readFileSync(filePath)
  send(res, 200, data, {
    'Content-Type': type,
    'Cache-Control':
      ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  })
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '/'
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
