// Static ads for the two campaigns, built from stills of the reel footage plus the UK small business badge.
//   node scripts/render-campaign-ads.mjs [--only=<ad id>]
// Writes campaigns/ads/{id}-4x5.jpg (1080×1350, Facebook/Instagram feed) and {id}-9x16.jpg (1080×1920, Stories/Reels,
// text kept out of the top 250px and bottom 330px that the app UI covers). Layout and graphics: scripts/campaign-ad.html.
// Stills are pulled from campaigns/source (gitignored) into campaigns/ads/stills once, then reused.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'campaigns/ads'), stills = path.join(dir, 'stills')
const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1]
const SIZES = { '4x5': { w: 1080, h: 1350 }, '9x16': { w: 1080, h: 1920 } }

// Still = clip + time; crop removes Veo's letterbox bars where it added them.
const STILLS = {
  a1: { t: 3.5 }, a2: { t: 3.5 }, a4: { t: 3.2, crop: '1080:1604:0:158' },
  b1: { t: 6 }, b2: { t: 3.5 }, t1: { t: 6, crop: '1080:1672:0:124' }, t2: { t: 1.2 },
}

const AI = { cta: 'Book your free AI evaluation', url: 'promonetconsulting.com/ai-ready', foot: 'Free 30-minute video call. We can’t guarantee AI recommendations.' }
const CT = { cta: 'Book your free chat', url: 'promonetconsulting.com/connect-your-tools', foot: '£350 incl. any VAT for one integration. Third-party costs separate.' }
const ADS = [
  { id: 'ai_ready-ask-ai', still: 'a1', graphic: 'chat', pos: ['50% 18%', '50% 30%'], drop: 60, eyebrow: 'FREE 30-MINUTE AI EVALUATION', headline: 'Are you AI ready?', sub: 'Customers are asking AI who to call. We’ll check whether it can find you, and where it could save you time.', ...AI },
  { id: 'ai_ready-checks', still: 'a2', graphic: 'checks', pos: ['55% 22%', '55% 26%'], drop: 170, eyebrow: '30 MINUTES · 3 CLEAR NEXT STEPS', headline: 'Can AI find your business?', sub: 'A free video call with real people. Three prioritised next steps by email afterwards.', ...AI },
  { id: 'ai_ready-faster', still: 'a4', graphic: 'flow', pos: ['50% 30%', '50% 40%'], eyebrow: 'READY FOR WHAT’S NEXT', headline: 'Ready for a world that <em>moves faster</em>?', sub: 'Customers expect quicker answers. We’ll show you where AI and connected tools can help you keep up.', ...AI, long: true },
  { id: 'connect_tools-tools-talk', still: 'b1', graphic: 'apart', pos: ['50% 26%', '50% 28%'], drop: 90, eyebrow: 'ONE FULL INTEGRATION · FIXED £350', headline: 'Do your tools <em>talk</em> to each other?', sub: 'Promonet gets them talking, so you stop being the connection. Live in under a week.', ...CT },
  { id: 'connect_tools-typed-twice', still: 'b2', graphic: 'copying', pos: ['50% 30%', '50% 35%'], eyebrow: 'INBOX · SPREADSHEET · CRM', headline: 'Still typing the same details <em>twice</em>?', sub: 'We connect your tools so every enquiry flows through on its own. Fixed £350.', ...CT, long: true },
  { id: 'connect_tools-expert-team', still: 't1', graphic: 'price', pos: ['50% 22%', '50% 22%'], drop: 150, eyebrow: 'SMALL EXPERT TEAM · PART OF YOURS', headline: 'Experts who work as part of your team.', sub: 'One full integration, built, tested and explained.', ...CT, long: true },
  { id: 'connect_tools-talking', still: 't2', graphic: 'connected', pos: ['70% 20%', '62% 28%'], eyebrow: 'LIVE IN UNDER A WEEK', headline: 'Get your tools <em>talking</em>.', sub: 'Your inbox, spreadsheet, CRM and calendar sharing information. One full integration, fixed £350.', ...CT },
]

const run = (cmd, a) => { const r = spawnSync(cmd, a, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(`${cmd} ${a.join(' ')}\n${r.stderr}`) }
await fs.mkdir(stills, { recursive: true })
for (const [clip, s] of Object.entries(STILLS)) {
  const f = path.join(stills, `${clip}.jpg`)
  if (await fs.access(f).then(() => true, () => false)) continue
  run('ffmpeg', ['-y', '-v', 'error', '-ss', String(s.t), '-i', path.join(root, 'campaigns/source', `${clip}.mp4`), '-frames:v', '1', ...(s.crop ? ['-vf', `crop=${s.crop}`] : []), '-q:v', '2', f])
}

const badge = pathToFileURL(path.join(root, 'public/badges/uk-small-business-2026.png')).href
const browser = await chromium.launch()
try {
  for (const [fmt, size] of Object.entries(SIZES)) {
    const page = await browser.newPage({ viewport: { width: size.w, height: size.h } })
    for (const ad of ADS.filter((a) => !only || a.id === only)) {
      await page.goto(pathToFileURL(path.join(root, 'scripts/campaign-ad.html')).href)
      await page.evaluate((c) => window.render(c), { ...ad, size, badge, photo: pathToFileURL(path.join(stills, `${ad.still}.jpg`)).href })
      // Fail loudly if text spills: every block must sit inside the frame's padding.
      const spill = await page.evaluate(() => { const f = document.querySelector('.frame'), r = f.getBoundingClientRect(), cs = getComputedStyle(f), top = parseFloat(cs.paddingTop), bot = r.height - parseFloat(cs.paddingBottom); return [...f.children].map((e) => e.getBoundingClientRect()).some((b) => b.height && (b.top < top - 1 || b.bottom > bot + 1)) })
      const file = path.join(dir, `${ad.id}-${fmt}.jpg`)
      await page.screenshot({ path: file, type: 'jpeg', quality: 92, clip: { x: 0, y: 0, ...{ width: size.w, height: size.h } } })
      console.log(`${spill ? 'SPILL ' : ''}${path.relative(root, file)}`)
    }
    await page.close()
  }
} finally { await browser.close() }
