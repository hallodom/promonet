import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { validateContact, buildContactEmail, sendContactEmail, readJsonBody } from '../server/sendContactEmail.js'

const base = { name: 'Test Owner', email: 'owner@example.test', company: 'Example Business', message: 'Copy enquiries to CRM.' }
const ai = { ...base, campaign: 'ai_ready', website: 'example.test', message: '', landingPage: '/ai-ready', utm: { utm_source: 'instagram', utm_campaign: 'ai_ready' } }
const integration = { ...base, campaign: 'connect_tools', tools: 'Enquiry form and CRM', landingPage: '/connect-your-tools', utm: { utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'connect_tools' } }
const env = { RESEND_API_KEY: 'test-not-a-key', RESEND_FROM: 'test@example.test', CONTACT_TO: 'team@example.test' }

test('legacy modal submissions keep their message, recipient and source', async () => {
  let mail
  const result = await sendContactEmail(base, { env, sendEmail: async (value) => { mail = value; return { data: { id: 'mock-legacy' } } } })
  assert.equal(result.id, 'mock-legacy')
  assert.deepEqual(mail.to, ['team@example.test'])
  assert.equal(mail.replyTo, base.email)
  assert.deepEqual(mail.tags, [{ name: 'source', value: 'contact-modal' }])
  assert.match(mail.text, /Copy enquiries/)
})

test('AI requests normalise a website and generate the appropriate message', () => {
  const result = validateContact(ai)
  assert.equal(result.ok, true)
  assert.equal(result.value.website, 'https://example.test/')
  assert.match(result.value.message, /AI website visibility/)
  assert.match(result.value.offer, /three prioritised next steps/)
})

test('campaign emails include offer, tools, page and UTM attribution', async () => {
  let mail
  const result = await sendContactEmail(integration, { env, sendEmail: async (value) => { mail = value; return { data: { id: 'mock-campaign' } } } })
  assert.equal(result.ok, true)
  for (const value of ['£350 total', 'Enquiry form and CRM', '/connect-your-tools', 'facebook', 'social', 'connect_tools']) assert.ok(mail.text.includes(value))
  assert.equal(mail.tags[0].value, 'connect_tools')
})

test('required fields, campaign scope and contact types are validated', () => {
  for (const payload of [null, [], 'bad', {}, { ...base, name: '  ' }, { ...base, email: 'bad' }, { ...base, company: {} }, { ...base, campaign: 'unknown' }, { ...base, campaign: '__proto__' }, { ...ai, website: '' }, { ...ai, landingPage: '/wrong' }, { ...integration, tools: '' }, { ...integration, message: '' }, { ...base, name: 'a\nb' }]) {
    const result = validateContact(payload)
    assert.equal(result.ok, false, JSON.stringify(payload))
    assert.equal(result.status, 400)
  }
})

test('website validation rejects unsafe schemes, credentials and malformed URLs', () => {
  for (const website of ['javascript:alert(1)', 'file:///etc/passwd', 'https://name:password@example.test', 'not a website', 'https://', 'https://localhost']) assert.equal(validateContact({ ...ai, website }).ok, false, website)
  for (const website of ['https://example.test/about', 'http://example.test', 'www.example.test']) assert.equal(validateContact({ ...ai, website }).ok, true, website)
})

test('field limits and malformed attribution cannot bypass validation', () => {
  for (const payload of [{ ...base, name: 'a'.repeat(121) }, { ...integration, tools: 'a'.repeat(501) }, { ...base, message: 'a'.repeat(5001) }, { ...ai, utm: [] }, { ...ai, utm: { utm_source: {} } }, { ...ai, utm: { utm_source: 'a'.repeat(201) } }]) assert.equal(validateContact(payload).ok, false)
})

test('HTML email escapes all visitor-supplied content', () => {
  const result = validateContact({ ...integration, name: '<script>alert(1)</script>', tools: '<img onerror="bad">', utm: { utm_source: '<b>unsafe</b>' } })
  const mail = buildContactEmail(result.value, { from: env.RESEND_FROM, to: env.CONTACT_TO })
  assert.ok(!mail.html.includes('<script>'))
  assert.ok(!mail.html.includes('<img'))
  assert.ok(mail.html.includes('&lt;script&gt;'))
  assert.ok(mail.html.includes('&lt;b&gt;unsafe&lt;/b&gt;'))
})

test('delivery failures return a safe error and missing configuration sends nothing', async () => {
  const failed = await sendContactEmail(base, { env, sendEmail: async () => ({ error: { message: 'private provider information' } }) })
  assert.equal(failed.status, 502)
  assert.ok(!failed.error.includes('private'))
  const thrown = await sendContactEmail(base, { env, sendEmail: async () => { throw new Error('transport failed') } })
  assert.equal(thrown.status, 502)
  const noConfig = await sendContactEmail(base, { env: {}, sendEmail: async () => { assert.fail('must not send') } })
  assert.equal(noConfig.status, 500)
})

test('JSON body parser accepts valid input and rejects malformed or oversized requests', async () => {
  assert.deepEqual(await readJsonBody(Readable.from([Buffer.from(JSON.stringify(ai))])), ai)
  await assert.rejects(readJsonBody(Readable.from([Buffer.from('{bad')])), { status: 400 })
  await assert.rejects(readJsonBody(Readable.from([Buffer.alloc(32769)])), { status: 413 })
})
