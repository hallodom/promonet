import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/cn'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Plays a muted video only while it is on screen; with reduced motion it stays on its poster frame. */
function useVisiblePlayback(eager: boolean) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v || reducedMotion()) return
    v.muted = true
    if (!('IntersectionObserver' in window)) { void v.play().catch(() => {}); return }
    if (eager) v.preload = 'auto'
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; void v.play().catch(() => {}) } else if (v.muted) v.pause()
    }, { rootMargin: '200px' })
    io.observe(v)
    return () => io.disconnect()
  }, [eager])
  return ref
}

/** A silent looping shot from the campaign footage, used as a moving image in page sections. */
export function LoopVideo({ shot, label, className, eager = false }: { shot: string; label: string; className?: string; eager?: boolean }) {
  const ref = useVisiblePlayback(eager)
  return (
    <video
      ref={ref}
      className={cn('block w-full h-full object-cover', className)}
      poster={`/campaigns/loops/${shot}.jpg`}
      aria-label={label}
      role="img"
      loop
      muted
      playsInline
      preload="none"
      disablePictureInPicture
    >
      <source src={`/campaigns/loops/${shot}.mp4`} type="video/mp4" />
    </video>
  )
}

/** The full reel in a phone frame: plays muted on screen, with a button to restart it with sound. */
export function ReelPlayer({ campaign, label, className }: { campaign: string; label: string; className?: string }) {
  const ref = useVisiblePlayback(true)
  const [sound, setSound] = useState(false)

  function toggle() {
    const v = ref.current
    if (!v) return
    if (!sound) { v.muted = false; v.currentTime = 0; void v.play().catch(() => {}); setSound(true) } else { v.muted = true; setSound(false) }
  }

  return (
    <figure className={cn('w-full max-w-[340px]', className)}>
      <div className="relative aspect-[9/16] rounded-[32px] overflow-hidden border-[7px] border-obsidian bg-obsidian shadow-[0_40px_80px_rgba(10,10,15,0.35)]">
        <video ref={ref} className="w-full h-full object-cover" poster={`/campaigns/${campaign}-poster.jpg`} aria-label={label} loop muted playsInline preload="metadata" onEnded={() => setSound(false)}>
          <source src={`/campaigns/${campaign}-reel.mp4`} type="video/mp4" />
          <track kind="captions" src={`/campaigns/${campaign}.vtt`} srcLang="en" label="English" />
        </video>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={sound}
          className="absolute left-1/2 bottom-4 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-bone/95 text-obsidian px-4 py-2.5 text-[13px] font-semibold shadow-lg hover:bg-bone transition-colors whitespace-nowrap"
        >
          {sound ? <><VolumeX size={16} aria-hidden="true" />Mute</> : <><Volume2 size={16} aria-hidden="true" />Play with sound</>}
        </button>
      </div>
      <figcaption className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-graphite">Illustrative scenes · AI-generated people</figcaption>
    </figure>
  )
}
