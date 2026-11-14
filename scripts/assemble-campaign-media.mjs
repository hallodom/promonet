import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const production = path.join(root, 'campaigns/production')
const generated = path.join(production, 'generated')
const web = path.join(root, 'public/campaigns')
const campaigns = JSON.parse(await fs.readFile(path.join(root, 'src/data/campaigns.json'), 'utf8'))
const brief = JSON.parse(await fs.readFile(path.join(production, 'brief.json'), 'utf8'))
const manifest = JSON.parse(await fs.readFile(path.join(generated, 'assets.json'), 'utf8'))
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const run = (args, cwd) => {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { cwd, encoding: 'utf8' })
  if (r.status !== 0) throw new Error(r.stderr || 'FFmpeg failed')
}
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 })
  const render = async (width, height, body, destination, transparent = false) => {
    await page.setViewportSize({ width, height })
    await page.setContent(`<html><head><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:${transparent ? 'transparent' : '#f5f5f2'};font-family:Arial,sans-serif;color:#111626}img{display:block;object-fit:cover}.brand{font:bold 44px Georgia,serif;letter-spacing:-2px}.brand b{color:#ff4a1c}h1{font:bold 76px/1.13 Georgia,serif;letter-spacing:-2px;margin:0}p{line-height:1.5}.eyebrow{font-size:17px;letter-spacing:2px;text-transform:uppercase;color:#2540e8}</style></head><body>${body}</body></html>`)
    await page.evaluate(() => Promise.all(Array.from(document.images).map((img) => img.decode())))
    await page.screenshot({ path: destination, omitBackground: transparent, ...(destination.endsWith('.jpg') ? { type: 'jpeg', quality: 90 } : {}) })
  }
  for (const [id, campaign] of Object.entries(campaigns)) {
    const dir = path.join(production, id)
    const photoPath = path.join(generated, manifest[id].still)
    const photo = `data:image/${photoPath.endsWith('.png') ? 'png' : 'jpeg'};base64,${(await fs.readFile(photoPath)).toString('base64')}`
    const diagram = `data:image/svg+xml;base64,${(await fs.readFile(path.join(web, `${id}-hero.svg`))).toString('base64')}`
    // Web hero, cover and share card all use the same generated photograph.
    await render(720, 780, `<img src="${photo}" style="width:720px;height:780px;object-position:center 58%">`, path.join(web, `${id}-hero.jpg`))
    await render(1200, 630, `<div style="display:flex;height:630px;padding:54px;gap:40px"><div style="flex:1"><div class="brand">promonet<b>.</b></div><p class="eyebrow" style="font-size:14px;margin-top:48px">${escape(campaign.eyebrow)}</p><h1 style="font-size:43px">${escape(campaign.headline)}</h1><p style="font-size:19px;color:#515761">${escape(campaign.offerLabel)}</p></div><img src="${photo}" style="width:440px;height:522px;border-radius:5px;object-position:center 58%"></div>`, path.join(web, `${id}-og.jpg`))
    await render(1080, 1920, `<img src="${photo}" style="position:absolute;inset:0;width:1080px;height:1920px"><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,24,.68),rgba(8,12,24,.05) 58%,rgba(8,12,24,.85));color:white;padding:190px 85px"><div class="brand">promonet<b>.</b></div><p class="eyebrow" style="margin:65px 0 28px;color:#d9dfff">${id === 'ai_ready' ? 'Are you AI-ready?' : 'A small connection.'}</p><h1 style="font-size:84px;max-width:830px">${id === 'ai_ready' ? 'Can AI search<br>find your business?' : 'Time back.<br>Every week.'}</h1><div style="position:absolute;left:85px;top:1290px;max-width:830px"><p style="font:bold 41px/1.3 Georgia,serif;margin:0 0 25px">${id === 'ai_ready' ? 'Free 30-minute website review.' : 'Simple connections from £350 total.'}</p><p style="font-size:26px">Expert help. A small business that understands yours.</p></div></div>`, path.join(web, `${id}-cover.png`))
    if (process.argv.includes('--images-only')) {
      console.log(`${id}: generated-photo hero, cover and share image assembled`)
      continue
    }
    const segments = []
    for (const [i, scene] of brief.campaigns[id].scenes.entries()) {
      const isDiagram = i === 1
      const overlay = path.join(dir, `edit-overlay-${i}.png`)
      const body = `<div style="position:absolute;inset:0;${isDiagram ? 'background:#f5f5f2;color:#111626' : 'background:linear-gradient(180deg,rgba(8,12,24,.75),transparent 60%,rgba(8,12,24,.86));color:white'};padding:190px 85px"><div class="brand">promonet<b>.</b></div><p style="font:16px monospace;letter-spacing:1px;opacity:.85;margin:24px 0 50px">VISUAL DRAFT · NARRATION PENDING</p><h1 style="max-width:830px">${escape(scene.heading)}</h1>${isDiagram ? `<img src="${diagram}" style="position:absolute;left:140px;top:610px;width:780px;height:700px;object-fit:contain">` : ''}<div style="position:absolute;top:1330px;left:85px;max-width:820px"><p style="font-size:34px;margin:0 0 24px">${escape(scene.detail)}</p>${id === 'connect_tools' && i === 3 ? '<p style="font-size:19px;margin:0">Includes applicable VAT. Fixed quote after feasibility check.<br>Third-party subscriptions separate.</p>' : ''}${i === 4 ? `<p style="font-size:23px;margin:0">promonetconsulting.com${campaign.path}<br>Free 30-minute call. No obligation.</p>` : ''}</div></div>`
      await render(1080, 1920, body, overlay, !isDiagram)
      const output = `edit-segment-${i}.mp4`
      const duration = scene.end - scene.start
      if (isDiagram) {
        run(['-loop', '1', '-framerate', '30', '-i', overlay, '-t', String(duration), '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p', output], dir)
      } else {
        const clip = i === 0 ? manifest[id].clips[0] : i === 3 ? manifest[id].clips[1] : null
        const source = clip ? ['-i', path.join(generated, clip)] : ['-loop', '1', '-framerate', '30', '-i', photoPath]
        run([...source, '-loop', '1', '-framerate', '30', '-i', overlay, '-filter_complex', `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration=8[base];[base][1:v]overlay=0:0:format=auto,format=yuv420p[v]`, '-map', '[v]', '-t', String(duration), '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', output], dir)
      }
      segments.push(`file '${output}'`)
    }
    await fs.writeFile(path.join(dir, 'edit-segments.txt'), segments.join('\n') + '\n')
    run(['-f', 'concat', '-safe', '0', '-i', 'edit-segments.txt', '-c', 'copy', '-movflags', '+faststart', `${id}-visual-draft.mp4`], dir)
    console.log(`${id}: generated-photo hero, cover, share image and 35-second visual draft assembled`)
  }
} finally { await browser.close() }
