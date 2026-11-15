// Renders the v2 campaign reels from local Higgsfield outputs. No generation calls, no spend.
//   node scripts/render-campaign-v2.mjs [--campaign=ai_ready|connect_tools] [--preview] [--clean]
// --preview  writes one JPG per beat (+ end card) to campaigns/v2/<id>/preview-*.jpg
// --clean    also renders a caption-free master
import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const v2 = path.join(root, 'campaigns/v2')
const gen = path.join(v2, 'generated')
const work = path.join(v2, 'work')
const cache = path.join(root, 'artifacts/campaign-qa/v2-sources')
const FPS = 30, LEAD = 0.35, GAP = 0.3
const args = process.argv.slice(2)
const preview = args.includes('--preview'), clean = args.includes('--clean')
const only = args.find((a) => a.startsWith('--campaign='))?.split('=')[1]
const brief = JSON.parse(await fs.readFile(path.join(v2, 'brief.json'), 'utf8'))
if (only && !brief.campaigns[only]) throw new Error(`Unknown campaign ${only}`)

const END = {
  ai_ready: {
    hold: 3.2,
    card: {
      eyebrow: 'A SMALL BUSINESS HELPING YOURS', title: 'Are you\nAI-ready?',
      sub: 'Free 30-minute AI evaluation call.\nThree clear next steps.',
      cta: 'Book your free call', url: 'promonetconsulting.com/ai-ready',
      note: ['No obligation. We can’t guarantee AI recommendations.', 'Illustrative scenes. People shown are AI-generated.'],
    },
  },
  connect_tools: {
    hold: 2.6, endCardPhrase: 'Book your free',
    card: {
      eyebrow: 'REAL PEOPLE. HANDS-ON HELP.', title: 'Get your tools\ntalking.',
      sub: 'Simple connections from £350.\nFree 30-minute call first.',
      cta: 'Book your free call', url: 'promonetconsulting.com/connect-your-tools',
      note: ['£350 total incl. any VAT. Fixed quote after a feasibility check.', 'Third-party costs separate. Illustrative scenes; AI-generated people.'],
    },
  },
}

function run(cmd, argv) {
  const r = spawnSync(cmd, argv, { encoding: 'utf8', maxBuffer: 64 << 20 })
  if (r.status !== 0) throw new Error(`${cmd} ${argv.join(' ')}\n${r.stderr}`)
  return r.stdout + r.stderr
}
const duration = (f) => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).trim())
const exists = (f) => fs.access(f).then(() => true, () => false)
const silences = (f) => {
  const out = run('ffmpeg', ['-hide_banner', '-i', f, '-af', 'silencedetect=n=-40dB:d=0.15', '-f', 'null', '-'])
  const s = [...out.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]), e = [...out.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1])
  return s.map((x, i) => (x + (e[i] ?? x)) / 2)
}
// Spoken form → on-screen form.
const display = (s) => s.replace(/three hundred and fifty pounds/g, '£350').replace(/thirty-minute/g, '30-minute')

// Tightened VO: trim ends, cap long pauses, 5% faster. Deterministic from the downloaded originals.
async function voFile(id) {
  const out = path.join(work, `${id}-vo.wav`)
  if (!(await exists(out))) run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(gen, `${id}-vo.wav`), '-af',
    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=stop_periods=-1:stop_threshold=-45dB:stop_duration=0.45:stop_silence=0.32,atempo=1.05,aresample=48000',
    '-ac', '1', out])
  return out
}

// Split a VO line into caption chunks timed to its pauses (fallback: character share).
function chunksFor(text, voStart, voDur, pauses) {
  let parts = text.match(/[^,.?]+[,.?]?/g).map((s) => s.trim()).filter(Boolean)
  for (let i = 0; i < parts.length - 1; i++) if (parts[i].length < 12) { parts[i + 1] = `${parts[i]} ${parts[i + 1]}`; parts.splice(i--, 1) }
  const total = parts.reduce((n, p) => n + p.length, 0), used = new Set()
  let acc = 0, prev = 0
  const out = parts.map((p, i) => {
    acc += p.length
    let end = voDur
    if (i < parts.length - 1) {
      const est = (acc / total) * voDur
      const best = pauses.map((x, k) => [Math.abs(x - est), k, x]).filter(([d, k]) => d < 0.9 && !used.has(k)).sort((a, b) => a[0] - b[0])[0]
      if (best) { used.add(best[1]); end = best[2] } else end = est
    }
    const chunk = { text: display(p), start: voStart + prev, end: voStart + end }
    prev = end
    return chunk
  })
  // Keep captions to two lines: split long chunks by words, time by share.
  return out.flatMap((ch) => {
    if (ch.text.length <= 50) return [ch]
    const w = ch.text.split(' '), mid = Math.ceil(w.length / 2), a = w.slice(0, mid).join(' '), b = w.slice(mid).join(' ')
    const cut = ch.start + (ch.end - ch.start) * (a.length / (a.length + b.length))
    return [{ text: a, start: ch.start, end: cut }, { text: b, start: cut, end: ch.end }]
  })
}

async function timeline(id) {
  const camp = brief.campaigns[id], end = END[id]
  let cursor = LEAD, start = 0
  const beats = [], vo = []
  for (const [i, b] of camp.beats.entries()) {
    const file = await voFile(b.id), d = duration(file), voStart = cursor, voEnd = cursor + d
    const last = i === camp.beats.length - 1
    const beatEnd = last ? voEnd + end.hold : voEnd + GAP
    beats.push({ id: b.id, start, end: beatEnd, voStart, voEnd, overlay: b.overlay, clip: `/clip/${b.id}.mp4`, chunks: chunksFor(b.vo, voStart, d, silences(file)) })
    vo.push({ file, at: voStart })
    start = beatEnd; cursor = beatEnd + (last ? 0 : 0)
  }
  const lastBeat = beats.at(-1)
  let endCardAt = lastBeat.voEnd + 0.15
  if (end.endCardPhrase) {
    const ch = lastBeat.chunks.find((k) => k.text.startsWith(end.endCardPhrase))
    if (ch) endCardAt = ch.start - 0.1
  }
  return { id, beats, vo, endCardAt, duration: lastBeat.end, endCard: end.card }
}

// H.264 all-intra working copies so Chromium seeks frame-accurately.
async function prepareClips(id) {
  await fs.mkdir(cache, { recursive: true })
  for (const b of brief.campaigns[id].beats) {
    const dest = path.join(cache, `${b.id}.mp4`)
    if (await exists(dest)) continue
    run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(gen, `${b.id}-clip.mp4`), '-an', '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30', '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', '-g', '1', '-pix_fmt', 'yuv420p', dest])
  }
}

const ts = (s) => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}` }
async function writeSubs(tl, dir) {
  const cues = tl.beats.flatMap((b) => b.chunks).map((k) => ({ ...k, end: Math.min(k.end + 0.12, tl.duration) }))
  await fs.writeFile(path.join(dir, `${tl.id}.srt`), cues.map((k, i) => `${i + 1}\n${ts(k.start)} --> ${ts(k.end)}\n${k.text}\n`).join('\n'))
  await fs.writeFile(path.join(dir, `${tl.id}.vtt`), `WEBVTT\n\n${cues.map((k) => `${ts(k.start).replace(',', '.')} --> ${ts(k.end).replace(',', '.')}\n${k.text}\n`).join('\n')}`)
}

function mixAudio(tl, out) {
  const music = path.join(gen, `${tl.id}-music.mp3`)
  const inputs = ['-i', music, ...tl.vo.flatMap((v) => ['-i', v.file])]
  const delays = tl.vo.map((v, i) => `[${i + 1}]adelay=${Math.round(v.at * 1000)}:all=1[v${i}]`).join(';')
  const fadeAt = Math.max(0, tl.duration - 1.8)
  const graph = `${delays};${tl.vo.map((_, i) => `[v${i}]`).join('')}amix=inputs=${tl.vo.length}:normalize=0,apad=whole_dur=${tl.duration}[vo];[vo]asplit[vo1][vo2];`
    + `[0]atrim=0:${tl.duration},volume=0.42,afade=t=in:d=0.4,afade=t=out:st=${fadeAt}:d=1.8,aresample=48000[mus];`
    + `[mus][vo1]sidechaincompress=threshold=0.04:ratio=5:attack=25:release=350[duck];`
    + `[vo2][duck]amix=inputs=2:normalize=0,atrim=0:${tl.duration},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`
  run('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', graph, '-map', '[a]', '-c:a', 'pcm_s16le', '-ar', '48000', out])
}

// Landing-page copies: 720p reel, poster and captions under public/campaigns/v2.
async function exportWeb(id) {
  const dir = path.join(v2, id), pub = path.join(root, 'public/campaigns/v2')
  await fs.mkdir(pub, { recursive: true })
  run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(dir, `${id}-reel.mp4`), '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', path.join(pub, `${id}-reel.mp4`)])
  run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(dir, `${id}-cover.jpg`), '-vf', 'scale=720:1280', '-q:v', '4', path.join(pub, `${id}-poster.jpg`)])
  await fs.copyFile(path.join(dir, `${id}.vtt`), path.join(pub, `${id}.vtt`))
}
if (args.includes('--web-only')) { for (const id of only ? [only] : Object.keys(brief.campaigns)) await exportWeb(id); process.exit(0) }

const html = await fs.readFile(path.join(root, 'scripts/campaign-v2.html'))
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x')
    if (url.pathname === '/') { res.setHeader('Content-Type', 'text/html'); return res.end(html) }
    const m = url.pathname.match(/^\/clip\/([ab][1-6])\.mp4$/)
    if (!m) { res.writeHead(404); return res.end() }
    const data = await fs.readFile(path.join(cache, `${m[1]}.mp4`))
    res.setHeader('Content-Type', 'video/mp4'); res.setHeader('Content-Length', data.length); res.end(data)
  } catch { res.writeHead(500); res.end() }
})
server.listen(0, '127.0.0.1'); await once(server, 'listening')
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
  await page.goto(`http://127.0.0.1:${server.address().port}/`)
  for (const id of only ? [only] : Object.keys(brief.campaigns)) {
    await prepareClips(id)
    const tl = await timeline(id), dir = path.join(v2, id)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(work, `${id}-timeline.json`), JSON.stringify(tl, null, 2))
    console.log(`${id}: ${tl.duration.toFixed(2)}s, end card at ${tl.endCardAt.toFixed(2)}s`)
    if (preview) {
      for (const captions of [true]) {
        await page.evaluate((c) => window.init(c), { ...tl, captions })
        const times = [...tl.beats.map((b, i, all) => i === all.length - 1 ? Math.min(b.start + (b.end - b.start) * 0.5, tl.endCardAt - 0.3) : b.chunks.at(-1).start + 0.6), tl.endCardAt + 1.2, 1.2]
        for (const [i, t] of times.entries()) await fs.writeFile(path.join(dir, `preview-${i + 1}.jpg`), Buffer.from(await page.evaluate((t) => window.render(t), t), 'base64'))
      }
      console.log(`${id}: preview frames written`); continue
    }
    const audio = path.join(work, `${id}-mix.wav`)
    mixAudio(tl, audio)
    await writeSubs(tl, dir)
    for (const captions of clean ? [true, false] : [true]) {
      await page.evaluate((c) => window.init(c), { ...tl, captions })
      const target = path.join(dir, `${id}-reel${captions ? '' : '-clean'}.mp4`)
      const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(FPS), '-i', 'pipe:0', '-i', audio,
        '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', target], { stdio: ['pipe', 'ignore', 'pipe'] })
      let errors = ''; ff.stderr.on('data', (d) => (errors += d)); ff.stdin.on('error', () => {})
      const done = once(ff, 'close'), frames = Math.round(tl.duration * FPS)
      for (let f = 0; f < frames; f++) {
        const jpg = await page.evaluate((t) => window.render(t), f / FPS)
        if (!ff.stdin.write(Buffer.from(jpg, 'base64'))) await once(ff.stdin, 'drain')
        if (f % 300 === 0) console.log(`${id}${captions ? '' : ' (clean)'}: ${(f / FPS).toFixed(0)}/${tl.duration.toFixed(0)}s`)
      }
      ff.stdin.end(); const [code] = await done
      if (code !== 0) throw new Error(errors)
      console.log(`${id}: wrote ${path.relative(root, target)}`)
    }
    // Cover (hook frame) and end-card frame for social/landing use.
    await page.evaluate((c) => window.init(c), { ...tl, captions: true })
    await fs.writeFile(path.join(dir, `${id}-cover.jpg`), Buffer.from(await page.evaluate((t) => window.render(t), Math.min(2.2, tl.beats[0].end - 0.5)), 'base64'))
    await fs.writeFile(path.join(dir, `${id}-endcard.jpg`), Buffer.from(await page.evaluate((t) => window.render(t), tl.duration - 0.2), 'base64'))
    await exportWeb(id)
  }
} finally { await browser.close(); server.close() }
