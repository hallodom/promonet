import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const production=path.join(root,'campaigns/production')
const preview=process.argv.includes('--preview')
const requested=process.argv.find(a=>a.startsWith('--campaign='))?.split('=')[1]
if(requested&&!['ai_ready','connect_tools'].includes(requested))throw new Error('Unknown campaign')
const html=await fs.readFile(path.join(root,'scripts/campaign-motion.html'))
const cache=path.join(root,'artifacts/campaign-qa/motion-sources')
await fs.mkdir(cache,{recursive:true})
// The paid source clips are HEVC; make browser-compatible working copies.
for(const id of requested?[requested]:['ai_ready','connect_tools'])for(const n of ['01','02']){
 const name=`${id}-${n}.mp4`,dest=path.join(cache,name)
 try{await fs.access(dest)}catch{
  const result=spawnSync('ffmpeg',['-y','-v','error','-i',path.join(production,'generated',name),'-an','-vf','scale=790:1404','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',dest],{encoding:'utf8'})
  if(result.status!==0)throw new Error(result.stderr)
 }
}
const server=http.createServer(async(req,res)=>{
 try{
  if(req.url==='/'){res.setHeader('Content-Type','text/html');return res.end(html)}
  const name=path.basename(new URL(req.url,'http://localhost').pathname)
  if(!/^(ai_ready|connect_tools)-(still\.png|0[12]\.mp4)$/.test(name)){res.writeHead(404);return res.end()}
  const data=await fs.readFile(name.endsWith('.mp4')?path.join(cache,name):path.join(production,'generated',name))
  res.setHeader('Content-Type',name.endsWith('.mp4')?'video/mp4':'image/png')
  res.setHeader('Content-Length',data.length);res.end(data)
 }catch{res.writeHead(500);res.end()}
})
server.listen(0,'127.0.0.1');await once(server,'listening')
const browser=await chromium.launch()
try{
 const page=await browser.newPage({viewport:{width:1080,height:1920}})
 await page.goto(`http://127.0.0.1:${server.address().port}`)
 for(const id of requested?[requested]:['ai_ready','connect_tools']){
  await page.evaluate(id=>window.init(id),id)
  const dir=path.join(production,id)
  if(preview){for(const t of [2,7,12,17,22,27,32]){
   const jpg=await page.evaluate(t=>window.render(t),t)
   await fs.writeFile(path.join(dir,`motion-preview-${t}.jpg`),Buffer.from(jpg,'base64'))
  }console.log(`${id}: preview frames ready`);continue}
  const target=path.join(dir,`${id}-motion-v2.mp4`)
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-framerate','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',target],{stdio:['pipe','ignore','pipe']})
  let errors='';ff.stderr.on('data',d=>errors+=d)
  const finished=once(ff,'close');ff.stdin.on('error',()=>{})
  for(let frame=0;frame<1050;frame++){
   const jpg=await page.evaluate(t=>window.render(t),frame/30)
   if(!ff.stdin.write(Buffer.from(jpg,'base64')))await once(ff.stdin,'drain')
   if(frame%150===0)console.log(`${id}: ${frame/30}/35 seconds rendered`)
  }
  ff.stdin.end();const [code]=await finished
  if(code!==0)throw new Error(errors)
  console.log(`${id}: completed ${target}`)
 }
}finally{await browser.close();server.close()}
