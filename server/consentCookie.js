/**
 * Re-issues the visitor's cookie-consent choice as an HTTP (server-set) cookie.
 *
 * The browser writes `pn_consent` itself the moment the visitor chooses, but
 * Safari caps script-written cookies at 7 days. Setting the same value from the
 * server keeps the 12-month lifetime, so the banner isn't shown again weekly.
 * This is a strictly necessary cookie (it records the consent choice).
 *
 * Must stay in step with src/lib/consent.ts.
 */
export const CONSENT_COOKIE = 'pn_consent'
const MAX_AGE_SECONDS = 365 * 86400
const VALUE_PATTERN = /^\d{1,3}\.[01]\.[01]\.\d{10,15}$/

function readBody(req, limit = 256) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > limit) {
        reject(new Error('Body too large'))
        req.destroy()
      }
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/**
 * Handles POST /api/consent. Returns { status, headers } for the caller to send
 * with an empty body.
 */
export async function handleConsentRequest(req, { secure }) {
  if (req.method !== 'POST') return { status: 405, headers: { Allow: 'POST' } }

  let value
  try {
    value = (await readBody(req)).trim()
  } catch {
    return { status: 413, headers: {} }
  }
  if (!VALUE_PATTERN.test(value)) return { status: 400, headers: {} }

  const cookie = [
    `${CONSENT_COOKIE}=${value}`,
    `Max-Age=${MAX_AGE_SECONDS}`,
    'Path=/',
    'SameSite=Lax',
    secure ? 'Secure' : null,
  ]
    .filter(Boolean)
    .join('; ')

  return { status: 204, headers: { 'Set-Cookie': cookie, 'Cache-Control': 'no-store' } }
}
