export type Locale = 'en' | 'es'

export const LOCALES: Locale[] = ['en', 'es']
export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_META: Record<
  Locale,
  { htmlLang: string; ogLocale: string; label: string }
> = {
  en: { htmlLang: 'en-GB', ogLocale: 'en_GB', label: 'EN' },
  es: { htmlLang: 'es-ES', ogLocale: 'es_ES', label: 'ES' },
}

export function localeFromPathname(pathname: string): Locale {
  return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en'
}
