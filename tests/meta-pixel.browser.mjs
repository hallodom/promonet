import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright'
import { preview } from 'vite'

const site = 'https://promonetconsulting.com'

test('Meta Lead tracking requires marketing consent and a successful AI-ready submission', async (t) => {
  const previewServer = await preview({ preview: { host: '127.0.0.1', port: 0 } })
  t.after(() => new Promise((resolve) => previewServer.httpServer.close(resolve)))
  const address = previewServer.httpServer.address()
  const origin = `http://127.0.0.1:${address.port}`
  const browser = await chromium.launch()
  t.after(() => browser.close())
  const context = await browser.newContext()
  await context.addCookies([{ name: 'pn_consent', value: `1.0.1.${Date.now()}`, url: site }])

  const page = await context.newPage()
  let sdkLoads = 0
  let acceptEnquiry = false
  await context.route('https://connect.facebook.net/**', async (route) => {
    sdkLoads++
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.pixelCommands = Array.from(window.fbq.queue, command => Array.from(command));
        window.fbq.callMethod = (...command) => window.pixelCommands.push(command);
      `,
    })
  })
  await context.route(`${site}/**`, async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/consent') return route.fulfill({ status: 204 })
    if (url.pathname === '/api/contact') {
      return route.fulfill({
        status: acceptEnquiry ? 200 : 400,
        json: acceptEnquiry ? { ok: true } : { ok: false, error: 'Test enquiry rejected' },
      })
    }
    const response = await route.fetch({ url: `${origin}${url.pathname}${url.search}` })
    await route.fulfill({ response })
  })

  await page.goto(`${site}/ai-ready`)
  await page.getByRole('button', { name: 'Manage cookies' }).waitFor()
  assert.equal(sdkLoads, 0, 'an older marketing choice does not activate the new pixel')

  await page.getByRole('button', { name: 'Manage cookies' }).click()
  await page.getByRole('switch', { name: 'Marketing', exact: true }).click()
  await page.getByRole('button', { name: 'Save my choices' }).click()
  await page.waitForFunction(() => window.pixelCommands?.some(([action, event]) => action === 'track' && event === 'PageView'))
  assert.equal(sdkLoads, 1)

  const form = page.getByRole('form')
  await form.getByLabel('Your name').fill('Test Visitor')
  await form.getByLabel('Email', { exact: true }).fill('visitor@example.test')
  await form.getByLabel('Business name').fill('Test Business')
  await form.locator('[name=detail]').fill('https://example.test')
  const leads = () => page.evaluate(() => window.pixelCommands.filter(([action, event]) => action === 'track' && event === 'Lead'))
  await form.getByRole('button').click()
  await page.getByText('Test enquiry rejected').waitFor()
  assert.deepEqual(await leads(), [])

  acceptEnquiry = true
  await form.getByRole('button').click()
  await page.getByRole('heading', { name: 'Thanks, we’ve got it.' }).waitFor()
  assert.deepEqual(await leads(), [['track', 'Lead']])

  await page.getByRole('button', { name: 'Cookie settings' }).click()
  await page.getByRole('button', { name: 'Reject non-essential' }).click()
  assert.deepEqual(await page.evaluate(() => window.pixelCommands.at(-1)), ['consent', 'revoke'])
  await page.reload()
  await page.getByRole('form').waitFor()
  assert.equal(sdkLoads, 1, 'withdrawal keeps the pixel off on subsequent visits')
})
