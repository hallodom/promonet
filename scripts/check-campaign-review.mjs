import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const browser=await chromium.launch()
try {
  const page=await browser.newPage({viewport:{width:390,height:844}})
  await page.goto('http://localhost:3010/campaigns/review.html')
  await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>v.readyState>=1))
  const media=await page.locator('video').evaluateAll(videos=>videos.map(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,controls:v.controls})))
  assert.equal(media.length,2)
  for(const video of media){assert.equal(video.duration,35);assert.equal(video.width,1080);assert.equal(video.height,1920);assert.equal(video.controls,true)}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  // Actually play each exported file and confirm that decoded frame playback advances.
  for(let index=0;index<2;index++) {
    await page.locator('video').nth(index).evaluate(async v=>{v.muted=true;v.currentTime=5;await v.play()})
    await page.waitForFunction(index=>document.querySelectorAll('video')[index].currentTime>5.5,index)
    await page.locator('video').nth(index).evaluate(v=>v.pause())
  }
  for(const route of ['/ai-ready','/connect-your-tools']) {
    const response=await page.request.get(`http://localhost:3010${route}`)
    assert.equal(response.status(),200)
  }
  console.log('Review hub: both 35-second 1080×1920 videos load and play, mobile layout fits, both landing routes respond.')
} finally { await browser.close() }
