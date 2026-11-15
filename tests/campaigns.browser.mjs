import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import net from 'node:net'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const campaigns = JSON.parse(await fs.readFile(path.join(root, 'src/data/campaigns.json'), 'utf8'))
const output = path.join(root, 'artifacts/campaign-qa')
await fs.mkdir(output, { recursive: true })
const socket = net.createServer()
await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve))
const port = socket.address().port
await new Promise((resolve) => socket.close(resolve))
const origin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['server/index.js'], { cwd: root, env: { ...process.env, PORT: String(port), CANONICAL_HOST: '', RESEND_API_KEY: '', RESEND_FROM: '' }, stdio: 'ignore' })
let browser
try {
  for (let i = 0; i < 40; i++) {
    if (await fetch(`${origin}/health`).then((r) => r.ok).catch(() => false)) break
    if (i === 39) throw new Error('Production server did not start')
    await delay(100)
  }
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  // Any browser enquiry is intercepted. Server credentials above are empty as a second guard.
  let requests = []
  let mode = 'success'
  await page.route('**/api/contact', async (route) => {
    requests.push(route.request().postDataJSON())
    await delay(300)
    await route.fulfill({ status: mode === 'success' ? 200 : mode === 'invalid' ? 400 : 502, contentType: 'application/json', body: JSON.stringify(mode === 'success' ? { ok: true, id: 'mock-browser' } : { error: mode === 'invalid' ? 'Please enter a valid website address.' : 'Unable to send' }) })
  })
  for (const [id, campaign] of Object.entries(campaigns)) {
    const response = await fetch(`${origin}${campaign.path}`)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.ok(html.includes(campaign.headline))
    assert.ok(html.includes('A small business, helping small businesses'))
    assert.ok(html.includes(id === 'ai_ready' ? campaign.offerTitle : '<strong>£350</strong>'))
    assert.ok(!html.includes('hreflang="es"'))
    assert.ok(html.includes(`campaigns/v2/${id}-og.jpg`))
    for (const asset of [`${id}-reel.mp4`, `${id}-poster.jpg`, `${id}.vtt`, `${id}-og.jpg`]) {
      const r = await fetch(`${origin}/campaigns/v2/${asset}`, { method: 'HEAD' })
      assert.equal(r.status, 200, `missing ${asset}`)
    }
    const url = `${origin}${campaign.path}?utm_source=instagram&utm_medium=social&utm_campaign=${id}&utm_content=reel_v1`
    await page.goto(url)
    await page.getByRole('heading', { level: 1, name: campaign.headline }).waitFor()
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Promonet home')
    assert.equal(await page.locator('link[rel="canonical"]').last().getAttribute('href'), `https://promonetconsulting.com${campaign.path}`)
    assert.equal(await page.locator('link[hreflang="es"]').count(), 0)
    const reel = page.locator('.cv-phone video')
    assert.equal(await reel.getAttribute('muted') !== null || await reel.evaluate((v) => v.muted), true)
    await page.waitForFunction(() => { const v = document.querySelector('.cv-phone video'); return v && v.readyState >= 2 && v.videoWidth === 720 })
    const sound = page.getByRole('button', { name: 'Play with sound' })
    await sound.click()
    assert.equal(await reel.evaluate((v) => v.muted), false)
    await page.getByRole('button', { name: 'Mute' }).click()
    assert.equal(await reel.evaluate((v) => v.muted), true)
    for (const img of await page.locator('.cv-photo img').all()) {
      await img.scrollIntoViewIfNeeded()
      await page.waitForFunction((el) => el.complete && el.naturalWidth > 0, await img.elementHandle())
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: path.join(output, `${id}-desktop.png`), fullPage: true })
    await page.getByRole('link', { name: campaign.cta, exact: true }).first().click()
    assert.ok(page.url().endsWith('#request-call'))
    await page.getByRole('button', { name: 'Request my free 30-minute call' }).click()
    assert.equal(requests.length, 0, 'empty form must not submit')
    await page.getByLabel('Your name').fill('Test Owner')
    await page.getByLabel('Email address').fill('owner@example.test')
    await page.getByLabel('Business name').fill('Test Business')
    if (id === 'ai_ready') await page.getByLabel('Website address').fill('example.test')
    else {
      await page.getByLabel('Which tools would you like to connect?').fill('Enquiry form and CRM')
      await page.getByLabel('What are you copying or doing repeatedly?').fill('Copy customer enquiries into CRM.')
    }
    mode = 'failure'
    if (id === 'ai_ready') {
      mode = 'invalid'
      await page.getByRole('button', { name: 'Request my free 30-minute call' }).click()
      await page.getByRole('alert').waitFor()
      assert.equal(await page.getByRole('alert').innerText(), 'Please enter a valid website address.')
      mode = 'failure'
    }
    await page.getByRole('button', { name: 'Request my free 30-minute call' }).click()
    await page.getByRole('alert').waitFor()
    assert.equal(await page.getByLabel('Your name').inputValue(), 'Test Owner')
    requests = []
    mode = 'success'
    await page.getByRole('button', { name: 'Request my free 30-minute call' }).click()
    assert.equal(await page.getByRole('button', { name: 'Sending your request…' }).isDisabled(), true)
    await page.locator('form').evaluate((form) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    await page.getByRole('status').waitFor()
    assert.equal(requests.length, 1, 'second submit must be suppressed')
    assert.equal(requests[0].campaign, id)
    assert.equal(requests[0].landingPage, campaign.path)
    assert.equal(requests[0].utm.utm_source, 'instagram')
    assert.equal(requests[0].utm.utm_campaign, id)
    assert.match(await page.getByRole('status').innerText(), /hasn’t been booked/)
    requests = []
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(url)
      await page.getByRole('heading', { level: 1 }).waitFor()
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px on ${id}`)
      if (width === 390) await page.screenshot({ path: path.join(output, `${id}-mobile.png`), fullPage: true })
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    console.log(`${id}: direct HTML, SEO, assets, desktop/mobile and request flow passed`)
  }
  await page.goto(`${origin}/pricing`)
  await page.getByRole('heading', { name: 'Simple connection starter' }).waitFor()
  await page.goto(`${origin}/es/precios`)
  assert.equal(await page.getByRole('heading', { name: 'Simple connection starter' }).count(), 0)
  await page.goto(`${origin}/`)
  await page.getByRole('button', { name: 'Contact Us', exact: true }).first().click()
  await page.getByRole('dialog').waitFor()
  const modal = page.getByRole('dialog')
  await modal.locator('input[name="name"]').fill('Legacy Owner')
  await modal.locator('input[name="email"]').fill('legacy@example.test')
  await modal.locator('input[name="company"]').fill('Legacy Business')
  await modal.locator('textarea').fill('Please connect our tools.')
  await modal.getByRole('button', { name: 'Send', exact: true }).click()
  await page.getByText('Message sent.', { exact: true }).waitFor()
  assert.equal(requests.at(-1).message, 'Please connect our tools.')
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text()
  for (const campaign of Object.values(campaigns)) {
    const entry = sitemap.split('<url>').find((chunk) => chunk.includes(`<loc>https://promonetconsulting.com${campaign.path}</loc>`))
    assert.ok(entry)
    assert.ok(!entry.includes('hreflang="es"'))
  }
  for (const body of ['{broken', JSON.stringify({ name: 'x' })]) {
    assert.equal((await fetch(`${origin}/api/contact`, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } })).status, 400)
  }
  assert.deepEqual(errors, [])
  console.log('Legacy form, English/Spanish pricing, sitemap and invalid API requests passed; no real email sent.')
} finally {
  if (browser) await browser.close()
  server.kill()
}
