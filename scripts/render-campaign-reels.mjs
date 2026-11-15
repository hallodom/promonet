// Edits the two campaign reels from the Veo 3.1 footage in campaigns/source. No generation calls, no spend.
//   node scripts/render-campaign-reels.mjs [--campaign=ai_ready|connect_tools] [--preview]
// Footage is cut to the voiceover; a transparent overlay layer (scripts/campaign-reel-overlay.html,
// rendered in Playwright) adds the wordmark, graphics, captions and end card on top of the moving video.
import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'campaigns/source')
const work = path.join(root, 'campaigns/work')
const out = path.join(root, 'campaigns/output')
const pub = path.join(root, 'public/campaigns')
const FPS = 30, LEAD = 0.4, GAP = 0.35, CLIP = 8
const MUTE_AMBIENT = new Set(['a1', 'a3']) // Veo added speech to these shots; keep only the voiceover.
const CROP = { t1: 'crop=1080:1672:0:124,' } // Veo letterboxed t1; crop the black bars before it is scaled to fill.
const args = process.argv.slice(2), preview = args.includes('--preview')
const only = args.find((a) => a.startsWith('--campaign='))?.split('=')[1]
// --format=4x5 renders a separate feed copy (1080×1350, the middle of the 9:16 frame) as {id}-reel-4x5.mp4
// for Facebook/Instagram feed placements; the 9:16 reels and the landing-page assets are left untouched.
const format = args.find((a) => a.startsWith('--format='))?.split('=')[1] ?? '9x16'
if (!['9x16', '4x5'].includes(format)) throw new Error(`unknown --format=${format} (9x16 or 4x5)`)
const F45 = format === '4x5', FRAME_H = F45 ? 1350 : 1920, CROP_Y = 285, SFX = F45 ? '-4x5' : ''
const brief = JSON.parse(await fs.readFile(path.join(root, 'campaigns/brief.json'), 'utf8'))

const END = {
  ai_ready: { hold: 3.2, card: { eyebrow: 'FREE · 30 MINUTES · NO OBLIGATION', title: 'Are you\nAI-ready?', sub: 'Book your free AI evaluation call.', cta: 'Book your free call', url: 'promonetconsulting.com/ai-ready', note: ['We can’t guarantee AI recommendations.', 'Illustrative scenes. People shown are AI-generated.'] } },
  connect_tools: {
    hold: 3.0,
    price: { at: 3.0, eyebrow: 'WHY SO AFFORDABLE? AI MAKES BUILDING FASTER.', label: 'Simple connections from', amount: '£350', suffix: 'total', note: 'Incl. any VAT · fixed quote after a feasibility check' },
    card: { eyebrow: 'REAL PEOPLE · HANDS-ON HELP', title: 'Get your tools\ntalking.', sub: 'Simple connections from £350.', cta: 'Book your free call', url: 'promonetconsulting.com/connect-your-tools', note: ['£350 total incl. any VAT. Fixed quote after feasibility check.', 'Third-party costs separate. AI-generated people.'] },
  },
  // Feedback re-cut: 24s, no mention of AI, fixed £300. A copy; connect_tools above is unchanged.
  connect_tools_24s: {
    target: 24, minHold: 1.8, variant: true, music: 'connect_tools', endCardPhrase: 'Book your free call',
    // Feedback: music clearly audible throughout — higher level, gentle ducking under the voice.
    mix: { music: 0.65, duckRatio: 3, duckThreshold: 0.05, fadeOut: 0.8 }, // music ~4.5 dB under the voice (was ~9)
    price: { at: 0.8, eyebrow: 'ONE SIMPLE CONNECTION', label: 'Fixed price', amount: '£300', suffix: '', note: 'Third-party subscriptions separate' },
    card: { style: 'clean', badge: 'public/badges/uk-small-business-2026.png', eyebrow: 'REAL PEOPLE · HANDS-ON HELP', title: 'Promonet will help\nyou connect.', sub: 'One simple connection. Fixed price £300.', cta: 'Book your free call', url: 'promonetconsulting.com/connect-your-tools', note: ['Fixed price for one simple connection. Third-party costs separate.', 'Illustrative scenes; people shown are digitally generated.'] },
  },
  // Second feedback round: ~30s, small expert team, all tools talking, £350 fixed, live in under a week,
  // "Book your free chat", livelier graphics (anim v2). A copy; the reels above are unchanged.
  connect_tools_30s: {
    hold: 1.8, maxLen: 32, variant: true, anim: 'v2', music: 'connect_tools', endCardPhrase: 'Book your free chat',
    mix: { music: 0.65, duckRatio: 3, duckThreshold: 0.05, fadeOut: 0.8 },
    highlight: ['talking', 'finally', 'experts', 'team', 'week', '£350', 'free', 'chat'],
    price: { at: 0.3, eyebrow: 'ONE FULL INTEGRATION', label: 'Fixed price', amount: '£350', suffix: '', note: 'Incl. any VAT · third-party subscriptions separate' },
    card: { style: 'clean', badge: 'public/badges/uk-small-business-2026.png', eyebrow: 'SMALL EXPERT TEAM · PART OF YOURS', title: 'Get your tools\ntalking.', sub: 'One full integration, live in under a week. Fixed £350.', cta: 'Book your free chat', url: 'promonetconsulting.com/connect-your-tools', note: ['£350 incl. any VAT for one integration. Third-party costs separate.', 'Illustrative scenes; people shown are digitally generated.'] },
  },
}
const clipOf = (s) => s.clip ?? s.id

const run = (cmd, a) => { const r = spawnSync(cmd, a, { encoding: 'utf8', maxBuffer: 64 << 20 }); if (r.status !== 0) throw new Error(`${cmd} ${a.join(' ')}\n${r.stderr}`); return r.stdout + r.stderr }
const dur = (f) => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).trim())
const pauses = (f) => { const o = run('ffmpeg', ['-hide_banner', '-i', f, '-af', 'silencedetect=n=-40dB:d=0.15', '-f', 'null', '-']); const s = [...o.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]), e = [...o.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]); return s.map((x, i) => (x + (e[i] ?? x)) / 2) }
const show = (s) => s.replace(/three hundred and fifty pounds/g, '£350').replace(/three hundred pounds/g, '£300').replace(/thirty-minute/g, '30-minute')

// Trim the ends, cap long pauses and speed up 5% so each line fits its 8-second shot.
function tightVo(id) {
  const f = path.join(work, `${id}-vo.wav`)
  run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(src, `${id}-vo.wav`), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=stop_periods=-1:stop_threshold=-45dB:stop_duration=0.4:stop_silence=0.28,atempo=1.05,aresample=48000', '-ac', '1', f])
  return f
}
// Caption chunks timed to the line's own pauses (falls back to character share), max two lines each.
function chunks(text, at, d, ps) {
  let parts = text.match(/[^,.?]+[,.?]?/g).map((s) => s.trim()).filter(Boolean)
  for (let i = 0; i < parts.length - 1; i++) if (parts[i].length < 12) { parts[i + 1] = `${parts[i]} ${parts[i + 1]}`; parts.splice(i--, 1) }
  const total = parts.reduce((n, p) => n + p.length, 0), used = new Set(); let acc = 0, prev = 0
  return parts.map((p, i) => {
    acc += p.length; let end = d
    if (i < parts.length - 1) { const est = (acc / total) * d, best = ps.map((x, k) => [Math.abs(x - est), k, x]).filter(([q, k]) => q < 0.9 && !used.has(k)).sort((a, b) => a[0] - b[0])[0]; if (best) { used.add(best[1]); end = best[2] } else end = est }
    const ch = { text: show(p), start: at + prev, end: at + end }; prev = end; return ch
  }).flatMap((ch) => { if (ch.text.length <= 48) return [ch]; const w = ch.text.split(' '), m = Math.ceil(w.length / 2), a = w.slice(0, m).join(' '), b = w.slice(m).join(' '), cut = ch.start + (ch.end - ch.start) * a.length / (a.length + b.length); return [{ text: a, start: ch.start, end: cut }, { text: b, start: cut, end: ch.end }] })
}

function timeline(id) {
  const camp = brief.campaigns[id], end = END[id], shots = [], vo = []
  let start = 0, voAt = LEAD
  camp.shots.forEach((s, i) => {
    const f = tightVo(s.id), d = dur(f), last = i === camp.shots.length - 1
    // The last shot holds for the end card; a variant with a target length stretches that hold to hit it exactly.
    let stop = voAt + d + (last ? end.hold ?? end.minHold : GAP)
    if (s.minDur) stop = Math.max(stop, start + s.minDur) // let a shot's graphic play out after a short line
    if (last && end.maxLen && stop > end.maxLen) throw new Error(`${id}: ${stop.toFixed(2)}s is over the ${end.maxLen}s limit`)
    if (last && end.target) { if (end.target < stop) throw new Error(`${id}: voiceover needs ${stop.toFixed(2)}s, over the ${end.target}s target`); stop = end.target }
    shots.push({ id: s.id, clip: clipOf(s), overlay: s.overlay, start, end: stop, speed: Math.max(1, (stop - start) / CLIP) })
    vo.push({ file: f, at: voAt, text: s.vo, d, ps: pauses(f) })
    start = stop; voAt = stop + 0.12
  })
  const all = vo.flatMap((v) => chunks(v.text, v.at, v.d, v.ps))
  const lastVo = vo.at(-1)
  // Optionally bring the end card in as the spoken call to action starts.
  const ctaChunk = end.endCardPhrase && all.find((k) => k.text.startsWith(end.endCardPhrase))
  const endCardAt = ctaChunk ? ctaChunk.start - 0.1 : lastVo.at + lastVo.d + 0.2
  return { id, shots, vo, chunks: all, duration: shots.at(-1).end, endCardAt, endCard: end.card, price: end.price, music: end.music ?? id, mixOpts: { music: 0.4, duckRatio: 5, duckThreshold: 0.04, fadeOut: 1.6, ...end.mix }, variant: !!end.variant, anim: end.anim ?? 'v1', highlight: end.highlight ?? null }
}

// Ambient (Veo) + voiceover + ducked music, loudness-normalised.
function mix(tl, file) {
  const n = tl.shots.length, inputs = [], parts = [], o = tl.mixOpts
  tl.shots.forEach((s, i) => { inputs.push('-i', path.join(src, `${s.clip}.mp4`)); const d = s.end - s.start; parts.push(`[${i}:a]atrim=0:${Math.min(CLIP, d / s.speed)},asetpts=PTS-STARTPTS${s.speed > 1 ? `,atempo=${(1 / s.speed).toFixed(4)}` : ''},aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=${d.toFixed(3)},atrim=0:${d.toFixed(3)},volume=${MUTE_AMBIENT.has(s.clip) ? 0 : 0.22}[amb${i}]`) })
  tl.vo.forEach((v, i) => { inputs.push('-i', v.file); parts.push(`[${n + i}:a]aformat=channel_layouts=stereo,adelay=${Math.round(v.at * 1000)}:all=1[v${i}]`) })
  inputs.push('-i', path.join(src, `${tl.music}-music.mp3`)); const m = n + tl.vo.length
  parts.push(`${tl.shots.map((_, i) => `[amb${i}]`).join('')}concat=n=${n}:v=0:a=1[amb]`)
  parts.push(`${tl.vo.map((_, i) => `[v${i}]`).join('')}amix=inputs=${tl.vo.length}:normalize=0,apad=whole_dur=${tl.duration}[vo]`, '[vo]asplit[voA][voB]')
  parts.push(`[${m}:a]atrim=0:${tl.duration},aformat=channel_layouts=stereo,aresample=48000,volume=${o.music},afade=t=in:d=0.3,afade=t=out:st=${tl.duration - o.fadeOut}:d=${o.fadeOut}[mus]`, `[mus][voA]sidechaincompress=threshold=${o.duckThreshold}:ratio=${o.duckRatio}:attack=25:release=350[duck]`)
  parts.push(`[voB][duck][amb]amix=inputs=3:normalize=0,atrim=0:${tl.duration},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`)
  run('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', parts.join(';'), '-map', '[a]', '-c:a', 'pcm_s16le', file])
}

function footageGraph(tl) {
  return tl.shots.map((s, i) => `[${i}:v]${CROP[s.clip] ?? ''}trim=0:${Math.min(CLIP, (s.end - s.start) / s.speed).toFixed(3)},setpts=(PTS-STARTPTS)*${s.speed.toFixed(4)},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=${FPS},setsar=1,trim=0:${(s.end - s.start).toFixed(3)},setpts=PTS-STARTPTS[s${i}]`).join(';')
    + `;${tl.shots.map((_, i) => `[s${i}]`).join('')}concat=n=${tl.shots.length}:v=1:a=0${F45 ? `[bg0];[bg0]crop=1080:${FRAME_H}:0:${CROP_Y}` : ''}[bg]`
}

const html = await fs.readFile(path.join(root, 'scripts/campaign-reel-overlay.html'))
// End-card badge (optional), passed to the overlay page as a data URL.
const badgeData = async (tl) => tl.endCard.badge ? `data:image/png;base64,${(await fs.readFile(path.join(root, tl.endCard.badge))).toString('base64')}` : null
const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end(html) })
server.listen(0, '127.0.0.1'); await once(server, 'listening')
const browser = await chromium.launch()
await Promise.all([work, out, path.join(pub, 'loops')].map((d) => fs.mkdir(d, { recursive: true })))
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: FRAME_H } })
  await page.goto(`http://127.0.0.1:${server.address().port}/`)
  for (const id of only ? [only] : Object.keys(brief.campaigns)) {
    const tl = timeline(id)
    await fs.writeFile(path.join(work, `${id}-timeline.json`), JSON.stringify(tl, null, 2))
    if (F45) tl.format = '4x5'
    console.log(`${id}: ${tl.duration.toFixed(2)}s · shots ${tl.shots.map((s) => `${s.id} ${(s.end - s.start).toFixed(1)}s${s.speed > 1 ? ` (x${s.speed.toFixed(2)} slower)` : ''}`).join(', ')}`)
    const inputs = tl.shots.flatMap((s) => ['-i', path.join(src, `${s.clip}.mp4`)])
    if (preview) {
      await page.evaluate((t) => window.init(t), { ...tl, captions: true, badge: await badgeData(tl) })
      const times = [...tl.shots.map((s) => s.start + (s.end - s.start) * 0.62), tl.duration - 0.3]
      for (const [i, t] of times.entries()) {
        const ov = path.join(work, 'ov.png'); await fs.writeFile(ov, Buffer.from(await page.evaluate((t) => window.frame(t), t), 'base64'))
        run('ffmpeg', ['-y', '-v', 'error', ...inputs, '-i', ov, '-filter_complex', `${footageGraph(tl)};[bg]trim=start=${t}:end=${t + 0.05},setpts=PTS-STARTPTS[f];[f][${tl.shots.length}:v]overlay[o]`, '-map', '[o]', '-frames:v', '1', path.join(out, `${id}${SFX}-preview-${i + 1}.jpg`)])
      }
      console.log(`${id}: preview frames in campaigns/output`); continue
    }
    const audio = path.join(work, `${id}-mix.wav`); mix(tl, audio)
    const cues = tl.chunks.map((k) => ({ ...k, end: Math.min(k.end + 0.1, tl.duration) }))
    const ts = (s, sep) => { const ms = Math.round(s * 1000); return `00:${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}${sep}${String(ms % 1000).padStart(3, '0')}` }
    await fs.writeFile(path.join(out, `${id}.srt`), cues.map((k, i) => `${i + 1}\n${ts(k.start, ',')} --> ${ts(k.end, ',')}\n${k.text}\n`).join('\n'))
    await fs.writeFile(path.join(out, `${id}.vtt`), `WEBVTT\n\n${cues.map((k) => `${ts(k.start, '.')} --> ${ts(k.end, '.')}\n${k.text}\n`).join('\n')}`)
    for (const captions of [true, false]) {
      await page.evaluate((t) => window.init(t), { ...tl, captions, badge: await badgeData(tl) })
      const target = path.join(out, `${id}-reel${captions ? '' : '-clean'}${SFX}.mp4`)
      const ff = spawn('ffmpeg', ['-y', '-v', 'error', ...inputs, '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(FPS), '-i', 'pipe:0', '-i', audio,
        '-filter_complex', `${footageGraph(tl)};[bg][${tl.shots.length}:v]overlay=format=auto:shortest=1,format=yuv420p[v]`, '-map', '[v]', '-map', `${tl.shots.length + 1}:a`,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', target], { stdio: ['pipe', 'ignore', 'pipe'] })
      let err = ''; ff.stderr.on('data', (d) => (err += d)); ff.stdin.on('error', () => {})
      const done = once(ff, 'close'), frames = Math.round(tl.duration * FPS)
      for (let f = 0; f < frames; f++) { if (!ff.stdin.write(Buffer.from(await page.evaluate((t) => window.frame(t), f / FPS), 'base64'))) await once(ff.stdin, 'drain') }
      ff.stdin.end(); const [code] = await done; if (code !== 0) throw new Error(err)
      console.log(`${id}: wrote ${path.relative(root, target)}`)
    }
    if (F45) continue // the feed copy is for ads only; the site keeps using the 9:16 reel
    // Landing-page assets: 720p reel with sound, poster from the moving hook shot, captions, and silent loops per shot.
    const reel = path.join(out, `${id}-reel.mp4`)
    run('ffmpeg', ['-y', '-v', 'error', '-i', reel, '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', path.join(pub, `${id}-reel.mp4`)])
    run('ffmpeg', ['-y', '-v', 'error', '-ss', '1.6', '-i', path.join(out, `${id}-reel-clean.mp4`), '-frames:v', '1', '-vf', 'scale=720:1280', '-q:v', '4', path.join(pub, `${id}-poster.jpg`)])
    await fs.copyFile(path.join(out, `${id}.vtt`), path.join(pub, `${id}.vtt`))
    // Silent page loops per clip. Variants only add loops for clips that don't have one yet (e.g. new footage).
    for (const clip of new Set(tl.shots.map((s) => s.clip))) {
      const dest = path.join(pub, 'loops', `${clip}.mp4`)
      if (tl.variant && await fs.access(dest).then(() => true, () => false)) continue
      const vf = `${CROP[clip] ?? ''}scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280`
      run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(src, `${clip}.mp4`), '-an', '-t', '7.5', '-vf', `${vf},fps=24`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dest])
      run('ffmpeg', ['-y', '-v', 'error', '-ss', '1', '-i', path.join(src, `${clip}.mp4`), '-frames:v', '1', '-vf', vf, '-q:v', '5', path.join(pub, 'loops', `${clip}.jpg`)])
    }
  }
} finally { await browser.close(); server.close() }
