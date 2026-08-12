import { DEFAULT_LOCALE, type Locale, localeFromPathname } from './locales'

const STATIC_ROUTES = {
  home: { en: '/', es: '/es' },
  pricing: { en: '/pricing', es: '/es/precios' },
  about: { en: '/about', es: '/es/nosotros' },
  connect: { en: '/connect', es: '/es/conectar' },
  connectCrm: { en: '/connect/crm', es: '/es/conectar/crm' },
} as const

export type AppRoute = keyof typeof STATIC_ROUTES

export function pathFor(route: AppRoute, locale: Locale = DEFAULT_LOCALE): string {
  return STATIC_ROUTES[route][locale]
}

export function connectPagePath(slug: string, locale: Locale = DEFAULT_LOCALE): string {
  return locale === 'es' ? `/es/conectar/${slug}` : `/connect/${slug}`
}

export function homeHashPath(hash: string, locale: Locale = DEFAULT_LOCALE): string {
  const base = pathFor('home', locale)
  const clean = hash.replace(/^#/, '')
  return base === '/' ? `/#${clean}` : `${base}#${clean}`
}

/** Map a pathname (+ optional hash) to the equivalent URL in another locale. */
export function toLocalePath(pathname: string, target: Locale): string {
  const hashIndex = pathname.indexOf('#')
  const path = hashIndex >= 0 ? pathname.slice(0, hashIndex) : pathname
  const hash = hashIndex >= 0 ? pathname.slice(hashIndex) : ''

  for (const route of Object.keys(STATIC_ROUTES) as AppRoute[]) {
    const paths = STATIC_ROUTES[route]
    if (path === paths.en || path === paths.es) {
      return paths[target] + hash
    }
  }

  const enConnect = path.match(/^\/connect\/([^/]+)$/)
  if (enConnect && enConnect[1] !== 'crm') {
    return connectPagePath(enConnect[1], target) + hash
  }

  const esConnect = path.match(/^\/es\/conectar\/([^/]+)$/)
  if (esConnect && esConnect[1] !== 'crm') {
    return connectPagePath(esConnect[1], target) + hash
  }

  return pathFor('home', target) + hash
}

export function alternatePath(pathname: string, locale: Locale): string {
  return toLocalePath(pathname, locale)
}

export function currentLocale(pathname: string): Locale {
  return localeFromPathname(pathname)
}
