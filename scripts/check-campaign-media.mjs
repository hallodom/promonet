import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const production = path.join(root, 'campaigns/production')
const output = path.join(root, 'artifacts/campaign-qa')
await fs.mkdir(output, { recursive: true })
const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`)
  return result.stdout
}
const files = process.argv.includes('--sources-only')
  ? ['ai_ready-01.mp4', 'ai_ready-02.mp4', 'connect_tools-01.mp4', 'connect_tools-02.mp4'].map((file) => path.join(production, 'generated', file))
  : ['ai_ready', 'connect_tools'].map((id) => path.join(production, id, `${id}-${process.argv.includes('--motion') ? 'motion-v2' : 'visual-draft'}.mp4`))
for (const file of files) {
  const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,codec_type,width,height,r_frame_rate', '-of', 'json', file]))
  const stream = probe.streams.find((s) => s.codec_type === 'video')
  const source = process.argv.includes('--sources-only')
  if (!stream || stream.width !== 1080 || stream.height !== 1920) throw new Error(`Unexpected dimensions: ${file}`)
  if (Math.abs(Number(probe.format.duration) - (source ? 5 : 35)) > 0.1) throw new Error(`Unexpected duration: ${file}`)
  run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-'])
  const sheet = path.join(output, `${path.basename(file, '.mp4')}-contact-sheet.jpg`)
  run('ffmpeg', ['-y', '-v', 'error', '-i', file, '-vf', source ? 'fps=2,scale=270:480,tile=5x2' : 'fps=1/3,scale=270:480,tile=6x2', '-frames:v', '1', '-q:v', '2', sheet])
  console.log(`${path.basename(file)}: ${stream.width}×${stream.height}, ${probe.format.duration}s, full decode OK`)
}
