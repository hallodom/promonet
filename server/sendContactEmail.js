import { Resend } from 'resend'

const CAMPAIGNS = {
  ai_ready: { path: '/ai-ready', offer: 'Free 30-minute AI evaluation call + three prioritised next steps' },
  connect_tools: { path: '/connect-your-tools', offer: 'Free chat; one full integration, live in under a week, fixed £350' },
}
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

export function validateContact(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { ok: false, status: 400, error: 'Please send a valid enquiry.' }
  try {
    const field = (key, max, required = false) => {
      const raw = payload[key]
      if (raw != null && typeof raw !== 'string') throw new Error(`Please check ${key}.`)
      const value = (raw || '').trim()
      if (value.length > max || (required && !value)) throw new Error(`Please check ${key}.`)
      return value
    }
    const name = field('name', 120, true)
    const email = field('email', 254, true)
    const company = field('company', 200, true)
    if ([name, email, company].some((value) => /[\r\n]/.test(value))) throw new Error('Please check your contact details.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.')
    const campaign = field('campaign', 40)
    if (campaign && !Object.hasOwn(CAMPAIGNS, campaign)) throw new Error('Please choose a valid campaign.')
    const offer = CAMPAIGNS[campaign]?.offer || ''
    let message = field('message', 5000, campaign !== 'ai_ready')
    const websiteInput = field('website', 2048, campaign === 'ai_ready')
    let website = websiteInput
    if (website) {
      const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(website) ? website : `https://${website}`)
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error('Please enter a public website address.')
      website = url.href
    }
    const tools = field('tools', 500, campaign === 'connect_tools')
    const landingPage = field('landingPage', 200)
    if (landingPage && (!campaign || landingPage.replace(/\/$/, '') !== CAMPAIGNS[campaign].path)) throw new Error('Please check the enquiry page.')
    if (campaign === 'ai_ready' && !message) message = 'Please arrange my free 30-minute AI website visibility review.'
    const utm = {}
    if (payload.utm != null) {
      if (typeof payload.utm !== 'object' || Array.isArray(payload.utm)) throw new Error('Please check the campaign information.')
      for (const key of UTM_KEYS) {
        const value = payload.utm[key]
        if (value == null || value === '') continue
        if (typeof value !== 'string' || value.length > 200) throw new Error('Please check the campaign information.')
        utm[key] = value.trim()
      }
    }
    return { ok: true, value: { name, email, company, message, website, websiteInput, tools, campaign, offer, landingPage: campaign ? CAMPAIGNS[campaign].path : '', utm } }
  } catch (error) {
    return { ok: false, status: 400, error: error instanceof TypeError ? 'Please enter a valid website address.' : error.message }
  }
}

export function buildContactEmail(contact, { from, to }) {
  const { name, email, company, message, website, tools, campaign, offer, landingPage, utm } = contact
  const rows = [
    ['Name', name], ['Email', email], ['Company', company],
    ...(campaign ? [['Campaign', campaign], ['Requested offer', offer], ['Landing page', landingPage]] : []),
    ...(website ? [['Website', website]] : []), ...(tools ? [['Tools', tools]] : []),
    ['Tools / message', message], ...Object.entries(utm),
  ]
  return {
    from, to: [to], replyTo: email,
    subject: `Promonet ${campaign ? `${campaign} call request` : 'enquiry'} from ${name} (${company})`,
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n\n'),
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.5"><h2>New Promonet enquiry</h2>${rows.map(([label, value]) => `<p style="white-space:pre-wrap"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('')}</body></html>`,
    tags: [{ name: 'source', value: campaign || 'contact-modal' }],
  }
}

function buildCampaignConfirmation(contact, { from, to }) {
  const { name, email, company, campaign, websiteInput, tools, message } = contact
  const ai = campaign === 'ai_ready'
  const request = ai ? 'AI evaluation' : 'tools integration'
  const rows = [
    ['Name', name],
    ['Email', email],
    ['Business name', company],
    ...(ai ? [['Website address', websiteInput]] : [
      ['Tools you’d like to connect', tools],
      ['What you’re copying or doing repeatedly', message],
    ]),
  ]
  return {
    from,
    to: [email],
    replyTo: to,
    subject: `Promonet received your ${request} request`,
    text: [
      `Thanks for requesting a free ${request} call with Promonet. We’ll be in touch within one working day to arrange a time.`,
      'Here’s a copy of what you submitted:',
      ...rows.map(([label, value]) => `${label}: ${value}`),
    ].join('\n\n'),
    headers: { 'Auto-Submitted': 'auto-replied' },
  }
}

export async function sendContactEmail(payload, { env = process.env, sendEmail } = {}) {
  const validated = validateContact(payload)
  if (!validated.ok) return validated
  const { RESEND_API_KEY: apiKey, RESEND_FROM: from, CONTACT_TO: to = 'eddy@promonetconsulting.com' } = env
  if (!apiKey || !from) return { ok: false, status: 500, error: 'The enquiry service is temporarily unavailable.' }
  const deliveryFailed = { ok: false, status: 502, error: 'We couldn’t send your enquiry. Please try again.' }
  try {
    const notification = buildContactEmail(validated.value, { from, to })
    if (validated.value.campaign) {
      const confirmation = buildCampaignConfirmation(validated.value, { from, to })
      const { data, error } = await new Resend(apiKey).batch.send([notification, confirmation], { batchValidation: 'strict' })
      if (error || data?.data?.length !== 2) return deliveryFailed
      return { ok: true, id: data.data[0].id }
    }
    const deliver = sendEmail || ((mail) => new Resend(apiKey).emails.send(mail))
    const { data, error } = await deliver(notification)
    if (error) return deliveryFailed
    return { ok: true, id: data?.id }
  } catch {
    return deliveryFailed
  }
}

export async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 32768) throw Object.assign(new Error('Enquiry is too large.'), { status: 413 })
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
  } catch {
    throw Object.assign(new Error('Please send a valid enquiry.'), { status: 400 })
  }
}
