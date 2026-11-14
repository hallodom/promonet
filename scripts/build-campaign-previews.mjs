import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const folder = path.join(root, 'campaigns/production')
const brief = JSON.parse(await fs.readFile(path.join(folder, 'brief.json'), 'utf8'))
const campaigns = JSON.parse(await fs.readFile(path.join(root, 'src/data/campaigns.json'), 'utf8'))
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const stamp = (seconds, separator = ',') => `00:00:${String(Math.floor(seconds)).padStart(2, '0')}${separator}${String(Math.round((seconds % 1) * 1000)).padStart(3, '0')}`
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  for (const [id, data] of Object.entries(brief.campaigns)) {
    const campaign = campaigns[id]
    const dir = path.join(folder, id)
    await fs.mkdir(dir, { recursive: true })
    const svg = await fs.readFile(path.join(root, 'public/campaigns', `${id}-hero.svg`))
    const image = `data:image/svg+xml;base64,${svg.toString('base64')}`
    const words = campaign.narration.split(/\s+/)
    const cues = []
    for (let i = 0; i < words.length; i += 8) {
      const chunk = words.slice(i, i + 8)
      cues.push({ start: i / words.length * 35, end: Math.min(i + 8, words.length) / words.length * 35, text: `${chunk.slice(0, 4).join(' ')}\n${chunk.slice(4).join(' ')}`.trim() })
    }
    await fs.writeFile(path.join(dir, 'captions-draft.srt'), cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n'))
    await fs.writeFile(path.join(dir, 'captions-draft.vtt'), 'WEBVTT\n\n' + cues.map((c) => `${stamp(c.start, '.')} --> ${stamp(c.end, '.')}\n${c.text}\n`).join('\n'))
    await fs.writeFile(path.join(dir, 'narration.txt'), `${campaign.narration}\n`)
    let concat = ''
    for (const [i, scene] of data.scenes.entries()) {
      await page.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;background:#f5f5f2;color:#111626;font-family:Arial,sans-serif}.frame{padding:150px 85px;height:1920px}.brand{font:700 44px Georgia,serif;letter-spacing:-2px}.brand span{color:#ff4a1c}.status{font:16px monospace;color:#515761;letter-spacing:1px;margin:22px 0 55px}h1{font:700 76px/1.12 Georgia,serif;letter-spacing:-2px;min-height:250px;margin:0 0 25px}img{width:850px;height:790px;object-fit:contain;display:block;margin:0 auto}.detail{font-size:34px;line-height:1.4;margin:32px 0 20px}.footer{font-size:23px;color:#2540e8;line-height:1.5}.terms{font-size:19px;color:#515761;line-height:1.5}</style></head><body><div class="frame"><div class="brand">promonet<span>.</span></div><p class="status">STORYBOARD · VOICE + GENERATED FOOTAGE PENDING</p><h1>${escape(scene.heading)}</h1><img src="${image}"><p class="detail">${escape(scene.detail)}</p>${id === 'connect_tools' && i === 3 ? '<p class="terms">Includes applicable VAT. Fixed quote after feasibility check.<br>Third-party subscriptions separate.</p>' : ''}<p class="footer">${i === 4 ? `promonetconsulting.com${campaign.path}<br>Free 30-minute call. No obligation.` : 'Small business helping small businesses.'}</p></div></body></html>`)
      await page.evaluate(() => Promise.all(Array.from(document.images).map((img) => img.decode())))
      await page.screenshot({ path: path.join(dir, `frame-${i}.png`) })
      concat += `file 'frame-${i}.png'\nduration ${scene.end - scene.start}\n`
    }
    concat += `file 'frame-${data.scenes.length - 1}.png'\n`
    await fs.writeFile(path.join(dir, 'frames.txt'), concat)
    const result = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'frames.txt', '-t', '35', '-vf', 'fps=30', '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${id}-storyboard.mp4`], { cwd: dir, encoding: 'utf8' })
    if (result.status !== 0) throw new Error(result.stderr || 'FFmpeg rendering failed')
    console.log(`${id}: silent 35-second storyboard and provisional captions rendered`)
  }
} finally { await browser.close() }
