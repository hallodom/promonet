import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const BOTTOM_INSET = 40

function isInRevealZone(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  return rect.top < vh - BOTTOM_INSET && rect.bottom > 0
}

function reveal(el: HTMLElement) {
  el.classList.add('in')
}

/**
 * Fade/slide elements with `.reveal` into view.
 * Re-binds on pathname so locale switches (`/` ↔ `/es`) don't leave
 * cards stuck at opacity: 0 after ScrollToTop / remount races.
 */
export function useReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    const pending = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.in)'))

    if (!('IntersectionObserver' in window)) {
      pending().forEach(reveal)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement)
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0, rootMargin: `0px 0px -${BOTTOM_INSET}px 0px` },
    )

    const syncAndObserve = () => {
      for (const el of pending()) {
        if (isInRevealZone(el)) {
          reveal(el)
          io.unobserve(el)
        } else {
          io.observe(el)
        }
      }
    }

    syncAndObserve()
    // After layout / ScrollToTop / hash scroll settle
    const t0 = window.setTimeout(syncAndObserve, 0)
    const t1 = window.setTimeout(syncAndObserve, 120)

    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      io.disconnect()
    }
  }, [pathname])
}
