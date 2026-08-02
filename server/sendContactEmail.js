import { Resend } from 'resend'

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export async function sendContactEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  const to = process.env.CONTACT_TO || 'hello@promonetconsulting.com'

  if (!apiKey) {
    return { ok: false, error: 'Missing RESEND_API_KEY', status: 500 }
  }
  if (!from) {
    return { ok: false, error: 'Missing RESEND_FROM', status: 500 }
  }

  const name = String(payload.name || '').trim()
  const email = String(payload.email || '').trim()
  const company = String(payload.company || '').trim()
  const message = String(payload.message || '').trim()

  if (!name || !email || !company || !message) {
    return { ok: false, error: 'Please fill in all fields.', status: 400 }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.', status: 400 }
  }

  const subject = `Promonet enquiry from ${name} (${company})`
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company}`,
    '',
    'Tools / message:',
    message,
  ].join('\n')

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">New Promonet enquiry</h2>
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin: 0 0 8px;"><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p style="margin: 16px 0 8px;"><strong>Tools / message:</strong></p>
        <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
      </body>
    </html>
  `

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject,
      text,
      html,
      tags: [{ name: 'source', value: 'contact-modal' }],
    })

    if (error) {
      return { ok: false, error: error.message || 'Failed to send email', status: 502 }
    }

    return { ok: true, id: data?.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to send email'
    return { ok: false, error: msg, status: 502 }
  }
}

export async function readJsonBody(req) {
  const chunks = []
  await new Promise((resolve, reject) => {
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve())
    req.on('error', reject)
  })
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw)
}
