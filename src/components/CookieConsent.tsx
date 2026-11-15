import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useT } from '@/i18n/LocaleContext'
import { cn } from '@/lib/cn'
import {
  PRIVACY_POLICY_PATH,
  acceptAll,
  closeCookieSettings,
  openCookieSettings,
  rejectNonEssential,
  saveConsent,
  useConsentState,
} from '@/lib/consent'

const BUTTON =
  'inline-flex items-center justify-center text-center font-sans font-semibold text-sm tracking-[0.02em] px-5 py-3 rounded-[4px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

/**
 * Cookie banner + preferences panel. Rendered client-side only (the consent
 * store returns "no choice, closed" during SSR/hydration), fixed-position so it
 * never shifts the page layout, and non-blocking (no cookie wall).
 */
export default function CookieConsent() {
  const { ready, consent, panelOpen } = useConsentState()

  if (!ready) return null
  if (panelOpen) return <PreferencesPanel />
  if (consent) return null
  return <Banner />
}

function PolicyLink({ className }: { className?: string }) {
  const t = useT()
  if (!PRIVACY_POLICY_PATH) return null
  return (
    <Link to={PRIVACY_POLICY_PATH} className={cn('underline underline-offset-2', className)}>
      {t('cookies.policyLink')}
    </Link>
  )
}

function Banner() {
  const t = useT()
  const titleId = useId()

  return (
    <section
      role="region"
      aria-labelledby={titleId}
      className="fixed inset-x-0 bottom-0 z-[90] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-[1080px] bg-obsidian text-bone rounded-[4px] border border-bone/10 shadow-[0_30px_80px_-20px_rgba(10,10,15,0.55)] p-5 sm:p-6 md:flex md:items-end md:gap-8">
        <div className="md:flex-1 min-w-0">
          <h2 id={titleId} className="font-display text-xl tracking-[-0.015em] mb-2">
            {t('cookies.title')}
          </h2>
          <p className="text-sm leading-relaxed text-bone/75">
            {t('cookies.body')} <PolicyLink className="text-bone hover:text-bone/80" />
          </p>
        </div>
        <div className="mt-5 md:mt-0 grid grid-cols-2 gap-2 md:flex md:shrink-0 md:gap-3">
          <button
            type="button"
            onClick={acceptAll}
            className={cn(BUTTON, 'bg-bone text-obsidian hover:bg-bone/90 focus-visible:outline-bone')}
          >
            {t('cookies.acceptAll')}
          </button>
          <button
            type="button"
            onClick={rejectNonEssential}
            className={cn(BUTTON, 'bg-bone text-obsidian hover:bg-bone/90 focus-visible:outline-bone')}
          >
            {t('cookies.rejectAll')}
          </button>
          <ManageButton />
        </div>
      </div>
    </section>
  )
}

function ManageButton() {
  const t = useT()
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={cn(
        BUTTON,
        'col-span-2 border border-bone/30 text-bone hover:bg-bone/10 focus-visible:outline-bone',
      )}
    >
      {t('cookies.manage')}
    </button>
  )
}

function PreferencesPanel() {
  const t = useT()
  const titleId = useId()
  const { consent } = useConsentState()
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false)
  const [marketing, setMarketing] = useState(consent?.marketing ?? false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCookieSettings()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('cookies.close')}
        className="absolute inset-0 bg-obsidian/55 backdrop-blur-sm"
        onClick={closeCookieSettings}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full sm:max-w-[560px] max-h-[92vh] overflow-y-auto bg-bone text-obsidian rounded-t-[8px] sm:rounded-[4px] shadow-[0_30px_80px_-20px_rgba(10,10,15,0.45)] border border-obsidian/10 outline-none"
      >
        <div className="flex items-start justify-between gap-4 px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-obsidian/8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-2">
              {t('cookies.eyebrow')}
            </p>
            <h2 id={titleId} className="font-display text-2xl md:text-3xl tracking-[-0.02em]">
              {t('cookies.prefsTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCookieSettings}
            className="p-2 -mr-2 rounded-[4px] text-graphite hover:text-obsidian hover:bg-obsidian/5 transition-colors"
            aria-label={t('cookies.close')}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 md:px-8 py-6">
          <p className="text-sm leading-relaxed text-graphite mb-6">
            {t('cookies.prefsIntro')} <PolicyLink className="text-obsidian hover:text-voltage" />
          </p>

          <ul className="divide-y divide-obsidian/10 border-y border-obsidian/10">
            <Category
              title={t('cookies.necessaryTitle')}
              body={t('cookies.necessaryBody')}
              status={t('cookies.alwaysOn')}
              checked
              disabled
            />
            <Category
              title={t('cookies.analyticsTitle')}
              body={t('cookies.analyticsBody')}
              checked={analytics}
              onChange={setAnalytics}
            />
            <Category
              title={t('cookies.marketingTitle')}
              body={t('cookies.marketingBody')}
              checked={marketing}
              onChange={setMarketing}
            />
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={acceptAll}
              className={cn(BUTTON, 'bg-obsidian text-bone hover:bg-obsidian/90 focus-visible:outline-obsidian')}
            >
              {t('cookies.acceptAll')}
            </button>
            <button
              type="button"
              onClick={rejectNonEssential}
              className={cn(BUTTON, 'bg-obsidian text-bone hover:bg-obsidian/90 focus-visible:outline-obsidian')}
            >
              {t('cookies.rejectAll')}
            </button>
            <button
              type="button"
              onClick={() => saveConsent({ analytics, marketing })}
              className={cn(BUTTON, 'col-span-2 bg-voltage text-bone hover:bg-voltage/90 focus-visible:outline-voltage')}
            >
              {t('cookies.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

type CategoryProps = {
  title: string
  body: string
  checked: boolean
  disabled?: boolean
  status?: string
  onChange?: (value: boolean) => void
}

function Category({ title, body, checked, disabled, status, onChange }: CategoryProps) {
  const id = useId()
  return (
    <li className="py-4 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="block font-semibold text-[15px] mb-1">
          {title}
        </label>
        <p id={`${id}-desc`} className="text-sm leading-relaxed text-graphite">
          {body}
        </p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={`${id}-desc`}
          disabled={disabled}
          onClick={() => onChange?.(!checked)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voltage',
            checked ? 'bg-voltage' : 'bg-obsidian/20',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'inline-block h-5 w-5 rounded-full bg-bone shadow transition-transform',
              checked ? 'translate-x-[22px]' : 'translate-x-0.5',
            )}
          />
        </button>
        {status && (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-graphite">{status}</span>
        )}
      </div>
    </li>
  )
}
