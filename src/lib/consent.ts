import { useSyncExternalStore } from 'react'

/**
 * Cookie consent (UK GDPR + PECR).
 *
 * The visitor's choice is kept in a first-party, strictly necessary cookie
 * (`pn_consent`). It is written from the browser straight away and then
 * re-issued by the server (`POST /api/consent`) so Safari's 7-day cap on
 * script-written cookies doesn't bring the banner back every week.
 *
 * Bump CONSENT_VERSION whenever the cookie policy or the list of optional
 * cookies changes: stored choices from older versions are ignored, so every
 * visitor is asked again.
 */
export const CONSENT_VERSION = 1
export const CONSENT_COOKIE = 'pn_consent'
/** Re-ask after 12 months, in line with ICO/CNIL guidance. */
export const CONSENT_MAX_AGE_DAYS = 365

/**
 * Path of the privacy / cookie policy page, once one exists. The banner and
 * preferences panel link to it when set.
 */
export const PRIVACY_POLICY_PATH: string | null = null

export type ConsentCategory = 'analytics' | 'marketing'

export type Consent = {
  version: number
  analytics: boolean
  marketing: boolean
  /** Unix ms when the choice was made. */
  updatedAt: number
}

type State = {
  /** False during SSR and hydration, when the stored choice can't be known. */
  ready: boolean
  consent: Consent | null
  panelOpen: boolean
}

type Listener = (state: State) => void

const SERVER_STATE: State = { ready: false, consent: null, panelOpen: false }
let state: State | null = null
const listeners = new Set<Listener>()

function encode(consent: Consent): string {
  return [consent.version, consent.analytics ? 1 : 0, consent.marketing ? 1 : 0, consent.updatedAt].join('.')
}

export function parseConsent(raw: string | undefined | null): Consent | null {
  if (!raw) return null
  const [v, a, m, t] = decodeURIComponent(raw).split('.')
  const version = Number(v)
  const updatedAt = Number(t)
  if (version !== CONSENT_VERSION || !Number.isFinite(updatedAt)) return null
  if (Date.now() - updatedAt > CONSENT_MAX_AGE_DAYS * 864e5) return null
  if (!/^[01]$/.test(a ?? '') || !/^[01]$/.test(m ?? '')) return null
  return { version, analytics: a === '1', marketing: m === '1', updatedAt }
}

function readCookie(): Consent | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)`))
    return parseConsent(match?.[1])
  } catch {
    return null
  }
}

function writeCookie(consent: Consent) {
  const value = encode(consent)
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  try {
    document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE_DAYS * 86400}; Path=/; SameSite=Lax${secure}`
  } catch {
    // Cookies blocked: the choice still applies for this page view.
  }
  // Let the server re-issue it as an HTTP cookie (longer-lived in Safari).
  fetch('/api/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: value,
    keepalive: true,
  }).catch(() => {})
}

function getState(): State {
  if (!state) state = { ready: true, consent: readCookie(), panelOpen: false }
  return state
}

function setState(next: Partial<State>) {
  state = { ...getState(), ...next }
  for (const listener of listeners) listener(state)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Current stored choice, or null if the visitor hasn't chosen yet. Client only. */
export function getConsent(): Consent | null {
  if (typeof document === 'undefined') return null
  return getState().consent
}

export function hasConsent(category: ConsentCategory): boolean {
  return Boolean(getConsent()?.[category])
}

export function saveConsent(choice: Pick<Consent, ConsentCategory>) {
  const consent: Consent = {
    version: CONSENT_VERSION,
    analytics: choice.analytics,
    marketing: choice.marketing,
    updatedAt: Date.now(),
  }
  writeCookie(consent)
  setState({ consent, panelOpen: false })
}

export function acceptAll() {
  saveConsent({ analytics: true, marketing: true })
}

export function rejectNonEssential() {
  saveConsent({ analytics: false, marketing: false })
}

export function openCookieSettings() {
  setState({ panelOpen: true })
}

export function closeCookieSettings() {
  setState({ panelOpen: false })
}

/**
 * Run `apply` now and whenever consent changes. Use this to load or switch
 * off anything non-essential (analytics, ad pixels, embeds that set cookies).
 */
export function onConsentChange(apply: (consent: Consent | null) => void) {
  apply(getConsent())
  const listener: Listener = (next) => apply(next.consent)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Consent state for components. Returns the server snapshot (`ready: false`)
 * during SSR and hydration, so nothing consent-dependent is rendered into the
 * prerendered HTML; React re-renders with the real state straight after.
 */
export function useConsentState(): State {
  return useSyncExternalStore(subscribe, getState, () => SERVER_STATE)
}
