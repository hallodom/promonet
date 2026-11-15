import { onConsentChange, type Consent } from './consent'

/**
 * Google Analytics 4, loaded only after the visitor opts in to analytics
 * cookies. Nothing is requested from Google (and no _ga cookies are set)
 * before that. Marketing consent maps to Google's ad_* consent signals.
 *
 * Set VITE_GA_MEASUREMENT_ID (G-XXXXXXXXXX) at build time to enable it.
 */
const GA_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim()
const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/

type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }
}

let loaded = false

function consentSignals(consent: Consent | null) {
  const analytics = consent?.analytics ? 'granted' : 'denied'
  const marketing = consent?.marketing ? 'granted' : 'denied'
  return {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  }
}

function loadGa(consent: Consent) {
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag.js expects the `arguments` object itself, not an array.
    window.dataLayer!.push(arguments)
  }
  window.gtag('consent', 'default', consentSignals(consent))
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(script)
  loaded = true
}

/** Remove first-party GA cookies (_ga, _ga_<id>) on this host and its parent domains. */
function clearGaCookies() {
  const names = document.cookie
    .split(';')
    .map((c) => c.trim().split('=')[0])
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name === '_gat')
  if (!names.length) return
  const parts = location.hostname.split('.')
  const domains = ['']
  for (let i = 0; i < parts.length - 1; i++) domains.push(`; Domain=.${parts.slice(i).join('.')}`)
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain}`
    }
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined' || !GA_ID_PATTERN.test(GA_ID)) return
  onConsentChange((consent) => {
    if (consent?.analytics) {
      if (!loaded) loadGa(consent)
      else window.gtag?.('consent', 'update', consentSignals(consent))
      return
    }
    if (loaded) window.gtag?.('consent', 'update', consentSignals(consent))
    clearGaCookies()
  })
}
