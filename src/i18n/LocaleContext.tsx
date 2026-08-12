import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import en from './messages/en.json'
import es from './messages/es.json'
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  type Locale,
  localeFromPathname,
} from './locales'
import { pathFor, type AppRoute } from './paths'

type Messages = typeof en

const catalogs: Record<Locale, Messages> = { en, es }

type Vars = Record<string, string | number>

type LocaleContextValue = {
  locale: Locale
  t: (key: string, vars?: Vars) => string
  path: (route: AppRoute) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function lookup(messages: Messages, key: string): string | undefined {
  const parts = key.split('.')
  let cur: unknown = messages
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' ? cur : undefined
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] != null ? String(vars[name]) : '',
  )
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const locale = localeFromPathname(pathname)

  useEffect(() => {
    document.documentElement.lang = LOCALE_META[locale].htmlLang
  }, [locale])

  const value = useMemo<LocaleContextValue>(() => {
    const t = (key: string, vars?: Vars) => {
      const raw =
        lookup(catalogs[locale], key) ??
        lookup(catalogs[DEFAULT_LOCALE], key) ??
        key
      return interpolate(raw, vars)
    }
    return {
      locale,
      t,
      path: (route) => pathFor(route, locale),
    }
  }, [locale])

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

export function useT() {
  return useLocale().t
}
