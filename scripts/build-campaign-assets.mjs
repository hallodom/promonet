import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'public/campaigns')
const production = path.join(root, 'campaigns/production')
const campaigns = JSON.parse(await fs.readFile(path.join(root, 'src/data/campaigns.json'), 'utf8'))
await fs.mkdir(output, { recursive: true })
await fs.mkdir(production, { recursive: true })

const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const text = (x, y, value, size = 18, fill = '#111626', weight = 500) => `<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}">${escape(value)}</text>`
const rect = (x, y, w, h, fill, r = 9, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`
const lines = (x, y, lengths, fill = '#dde1eb') => lengths.map((w, i) => rect(x, y + i * 19, w, 6, fill, 3)).join('')
function illustration(ai) {
  const shell = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="780" viewBox="0 0 720 780"><defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#2540e8" stroke-opacity=".07"/></pattern><filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#142063" flood-opacity=".12"/></filter></defs>${rect(0, 0, 720, 780, ai ? '#e7eafd' : '#e6ebe5', 8)}${rect(0, 0, 720, 780, 'url(#grid)', 8)}<circle cx="375" cy="360" r="260" stroke="#2540e8" stroke-opacity=".13" fill="none"/><circle cx="375" cy="360" r="210" stroke="#2540e8" stroke-opacity=".1" fill="none"/>${text(38, 52, ai ? 'A CLEARER PICTURE' : 'LESS COPYING. MORE DOING.', 12, '#2540e8', 700)}${text(38, 742, 'ILLUSTRATIVE WORKFLOW / PROMONET', 11, '#515761')}`
  if (ai) return shell + `<g filter="url(#shadow)">${rect(55, 160, 425, 380, '#fff')}${rect(55, 160, 425, 45, '#111626', 9)}<path d="M55 196h425v9H55z" fill="#111626"/><circle cx="78" cy="183" r="4" fill="#ff6743"/><circle cx="94" cy="183" r="4" fill="#ffc56c"/><circle cx="110" cy="183" r="4" fill="#8ac39a"/>${text(145, 187, 'yourbusiness.co.uk', 12, '#f5f5f2')}${rect(86, 233, 70, 8, '#2540e8', 4)}${text(86, 292, 'Good at what you do.', 25, '#111626', 700)}${text(86, 326, 'Clear about who you help.', 21, '#111626', 700)}${lines(86, 354, [300, 267, 285])}${rect(86, 426, 163, 40, '#2540e8', 4)}${text(105, 451, 'Let’s talk', 14, '#fff', 700)}${rect(270, 421, 170, 75, '#eef0fb', 5)}${lines(287, 441, [125, 94], '#bac4f4')}</g><path d="M480 340h45V266M525 340v145" fill="none" stroke="#2540e8" stroke-width="2" stroke-dasharray="5 6"/>${[[235,'01','Access'],[335,'02','Content'],[435,'03','Clarity']].map(([y,n,label]) => `<g filter="url(#shadow)">${rect(460,y,221,74,'#fff',7)}${rect(476,y+16,40,40,'#2540e8',5)}${text(486,y+42,n,14,'#fff',700)}${text(532,y+44,label,19,'#111626',700)}</g>`).join('')}<g filter="url(#shadow)">${rect(95, 580, 529, 88, '#2540e8', 7)}${text(122, 616, '30 minutes. Three practical next steps.', 21, '#fff', 700)}${text(122, 645, 'Start with a free website visibility review.', 16, '#dde3ff')}</g></svg>`
  return shell + `${rect(70, 122, 580, 90, '#f5f5f2', 7)}${text(95, 154, 'THE SAME DETAILS. AGAIN AND AGAIN.', 12, '#515761', 700)}${text(95, 187, 'Copy → paste → check → repeat', 22, '#515761')}<path d="M105 179l495 0" stroke="#ff4a1c" stroke-width="2" stroke-opacity=".65"/><g filter="url(#shadow)">${rect(55, 290, 250, 220, '#fff', 9)}${rect(415, 290, 250, 220, '#fff', 9)}${rect(78, 316, 43, 43, '#e7eafd', 7)}${text(87, 346, '↗', 29, '#2540e8')}${text(137, 345, 'Your enquiry', 18, '#111626', 700)}${text(80, 399, 'New customer details', 15, '#515761')}${lines(80, 425, [185, 160, 178])}${rect(438, 316, 43, 43, '#e7eafd', 7)}${text(451, 345, '✓', 23, '#2540e8')}${text(496, 345, 'Your CRM', 19, '#111626', 700)}${text(440, 399, 'Ready to follow up', 15, '#515761')}${lines(440, 425, [185, 160, 178])}</g><path d="M305 397h110" stroke="#2540e8" stroke-width="3"/><path d="m400 389 15 8-15 8" stroke="#2540e8" stroke-width="3" fill="none"/><circle cx="360" cy="397" r="21" fill="#2540e8"/>${text(349,405,'✓',24,'#fff')}<g filter="url(#shadow)">${rect(93, 573, 535, 101, '#111626', 7)}${text(119, 611, 'One useful connection.', 23, '#fff', 700)}${text(119, 644, 'Time back, week after week.', 22, '#cbd3f7')}</g></svg>`
}

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 })
  for (const [id, campaign] of Object.entries(campaigns)) {
    const svg = illustration(id === 'ai_ready')
    await fs.writeFile(path.join(output, `${id}-hero.svg`), svg)
    // Preserve generated-photo production covers/share cards on later illustration rebuilds.
    if (await fs.access(path.join(output, `${id}-hero.jpg`)).then(() => true).catch(() => false)) continue
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
    const render = async (width, height, content, file, type = 'png') => {
      await page.setViewportSize({ width, height })
      await page.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;background:#f5f5f2;color:#101320;font-family:Arial,sans-serif}.logo{font:bold 45px Georgia,serif;letter-spacing:-2px}.logo b{color:#ff4a1c}.eyebrow{font-size:20px;letter-spacing:2px;text-transform:uppercase;color:#2540e8}h1{font-family:Georgia,serif;letter-spacing:-2px;line-height:1.13;margin:25px 0}p{line-height:1.5}img{object-fit:contain}</style></head><body>${content}</body></html>`)
      await page.evaluate(() => Promise.all(Array.from(document.images).map((img) => img.decode())))
      await page.screenshot({ path: file, type, ...(type === 'jpeg' ? { quality: 92 } : {}) })
    }
    await render(1200,630,`<div style="display:flex;padding:54px;gap:35px;height:630px"><div style="flex:1"><div class="logo">promonet<b>.</b></div><p class="eyebrow" style="font-size:14px;margin-top:45px">${escape(campaign.eyebrow)}</p><h1 style="font-size:44px">${escape(campaign.headline)}</h1><p style="font-size:19px;color:#515761">${escape(campaign.offerLabel)}</p></div><img src="${dataUri}" width="440" height="510"></div>`,path.join(output,`${id}-og.jpg`),'jpeg')
    await render(1080,1920,`<div style="padding:170px 85px 160px"><div class="logo">promonet<b>.</b></div><p class="eyebrow" style="margin-top:65px">${id === 'ai_ready' ? 'Are you AI-ready?' : 'A small connection.'}</p><h1 style="font-size:73px;min-height:250px">${id === 'ai_ready' ? 'Can AI search<br>find your business?' : 'Time back.<br>Every week.'}</h1><img src="${dataUri}" width="900" height="780" style="width:100%;margin:25px 0"><p style="font:bold 37px/1.3 Georgia,serif">${id === 'ai_ready' ? 'Free 30-minute website review.' : 'Simple connections from £350 total.'}</p><p style="font-size:25px;color:#515761">Expert help. A small business that understands yours.</p></div>`,path.join(output,`${id}-cover.png`))
  }
} finally { await browser.close() }
console.log('Built campaign SVG illustrations, 1200×630 share images and 1080×1920 covers.')
