import { hasConsent, onConsentChange } from './consent'

// Meta publishes this ID in the pixel requests. Only the live site uses it.
const PIXEL_ID = '1666952154811890'
const SITE_HOST = 'promonetconsulting.com'

type Pixel = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue: IArguments[]
  push: Pixel
  loaded: boolean
  version: string
}

declare global {
  interface Window {
    fbq?: Pixel
    _fbq?: Pixel
  }
}

let pixel: Pixel | undefined
let marketingEnabled = false

function loadPixel(): Pixel {
  // Preserve the queue shape used by Meta's base snippet.
  const enqueue = function (...args: unknown[]) {
    if (enqueue.callMethod) enqueue.callMethod.apply(enqueue, args)
    else enqueue.queue.push(arguments)
  } as Pixel
  enqueue.queue = []
  enqueue.push = enqueue
  enqueue.loaded = true
  enqueue.version = '2.0'
  window.fbq = enqueue
  window._fbq = enqueue

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
  return enqueue
}

function clearPixelCookies() {
  for (const name of ['_fbp', '_fbc']) {
    document.cookie = `${name}=; Max-Age=0; Path=/`
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${SITE_HOST}`
  }
}

export function initMetaPixel() {
  if (window.location.hostname !== SITE_HOST) return

  onConsentChange((consent) => {
    const enabled = consent?.marketing === true
    if (!enabled) {
      marketingEnabled = false
      if (pixel) {
        // Discard events still waiting for the SDK before revoking consent.
        if (!pixel.callMethod) pixel.queue = pixel.queue.filter((command) => command[0] !== 'track')
        pixel('consent', 'revoke')
      }
      clearPixelCookies()
      return
    }

    if (marketingEnabled) return
    marketingEnabled = true
    if (!pixel) {
      pixel = loadPixel()
      pixel('consent', 'grant')
      pixel('set', 'autoConfig', false, PIXEL_ID)
      pixel('init', PIXEL_ID)
    } else {
      pixel('consent', 'grant')
    }
    pixel('track', 'PageView')
  })
}

export function trackAiReadyLead() {
  if (!pixel || !hasConsent('marketing')) return
  try {
    pixel('track', 'Lead')
  } catch {
    // The enquiry has already been accepted. A tracking failure cannot undo it.
  }
}
