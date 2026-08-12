import matrixEn from '@/data/matrix.json'
import { getMatrix } from '@/data/matrixLocale'
import en from '@/i18n/messages/en.json'
import es from '@/i18n/messages/es.json'
import { DEFAULT_LOCALE, type Locale } from '@/i18n/locales'
import {
  connectPagePath,
  pathFor,
  toLocalePath,
} from '@/i18n/paths'

export const SITE_URL = 'https://promonetconsulting.com'
export const SITE_NAME = 'Promonet'
export const CONTACT_EMAIL = 'hello@promonetconsulting.com'
export const LINKEDIN_URL =
  'https://www.linkedin.com/company/promonet-consulting/'

/** Default share image for Open Graph / LinkedIn / X / Facebook (1200×630). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`
export const DEFAULT_OG_IMAGE_WIDTH = 1200
export const DEFAULT_OG_IMAGE_HEIGHT = 630
export const DEFAULT_OG_IMAGE_TYPE = 'image/jpeg'
export const DEFAULT_OG_IMAGE_ALT =
  'Promonet — CRM and tool integrations for small businesses'
export const SITE_LOGO = `${SITE_URL}/logo.png`

const catalogs = { en, es } as const

export type SeoRoute = {
  path: string
  title: string
  description: string
  priority?: string
  changefreq?: string
  locale: Locale
}

type Crm = (typeof matrixEn.crms)[number]
type Vertical = (typeof matrixEn.verticals)[keyof typeof matrixEn.verticals]

function messages(locale: Locale) {
  return catalogs[locale]
}

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '')
}

export function absoluteUrl(path = '/') {
  if (!path || path === '/') return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function pageTitle(title: string) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
}

export function connectSlug(crmSlug: string, verticalName: string) {
  return `${crmSlug}-to-${verticalName.replace(/\s+/g, '-')}-software`
}

export function connectPath(
  crmSlug: string,
  verticalName: string,
  locale: Locale = DEFAULT_LOCALE,
) {
  return connectPagePath(connectSlug(crmSlug, verticalName), locale)
}

export function ogImageAlt(locale: Locale = DEFAULT_LOCALE) {
  return messages(locale).seo.ogImageAlt
}

export function listConnectPages(locale: Locale = DEFAULT_LOCALE) {
  const matrix = getMatrix(locale)
  const seo = messages(locale).seo
  const pages: Array<{
    path: string
    crm: Crm
    verticalKey: string
    vertical: Vertical
    title: string
    description: string
  }> = []

  for (const crm of matrix.crms) {
    for (const verticalKey of crm.verticals) {
      const vertical = matrix.verticals[verticalKey as keyof typeof matrix.verticals]
      if (!vertical) continue
      const path = connectPath(crm.slug, vertical.name, locale)
      pages.push({
        path,
        crm,
        verticalKey,
        vertical,
        title: pageTitle(
          interpolate(seo.connectPageTitle, {
            crm: crm.name,
            vertical: vertical.title,
          }),
        ),
        description: interpolate(seo.connectPageDescription, {
          crm: crm.name,
          vertical: vertical.name,
        }),
      })
    }
  }

  return pages
}

export function listSeoRoutes(locale?: Locale): SeoRoute[] {
  const locales: Locale[] = locale ? [locale] : ['en', 'es']
  const routes: SeoRoute[] = []

  for (const loc of locales) {
    const seo = messages(loc).seo
    const connectPages = listConnectPages(loc).map((p) => ({
      path: p.path,
      title: p.title,
      description: p.description,
      priority: '0.7',
      changefreq: 'monthly',
      locale: loc,
    }))

    routes.push(
      {
        path: pathFor('home', loc),
        title: pageTitle(seo.homeTitle),
        description: seo.homeDescription,
        priority: '1.0',
        changefreq: 'weekly',
        locale: loc,
      },
      {
        path: pathFor('about', loc),
        title: pageTitle(seo.aboutTitle),
        description: seo.aboutDescription,
        priority: '0.6',
        changefreq: 'monthly',
        locale: loc,
      },
      {
        path: pathFor('pricing', loc),
        title: pageTitle(seo.pricingTitle),
        description: seo.pricingDescription,
        priority: '0.8',
        changefreq: 'monthly',
        locale: loc,
      },
      {
        path: pathFor('connect', loc),
        title: pageTitle(seo.connectTitle),
        description: seo.connectDescription,
        priority: '0.9',
        changefreq: 'weekly',
        locale: loc,
      },
      {
        path: pathFor('connectCrm', loc),
        title: pageTitle(seo.connectCrmTitle),
        description: seo.connectCrmDescription,
        priority: '0.9',
        changefreq: 'weekly',
        locale: loc,
      },
      ...connectPages,
    )
  }

  return routes
}

export function getHomeFaqs(locale: Locale = DEFAULT_LOCALE) {
  return messages(locale).faqs
}

/** @deprecated Prefer getHomeFaqs(locale) */
export const HOME_FAQS = en.faqs

export function organizationJsonLd(locale: Locale = DEFAULT_LOCALE) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    logo: SITE_LOGO,
    image: DEFAULT_OG_IMAGE,
    description: messages(locale).seo.orgDescription,
    areaServed: ['GB', 'Worldwide', 'ES'],
    serviceType: [
      'CRM integration',
      'Business tool integration',
      'Workflow automation',
    ],
    knowsAbout: [
      'CRM integrations',
      'Small business software',
      'Connecting business tools',
    ],
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function offerCatalogJsonLd(locale: Locale = DEFAULT_LOCALE) {
  const seo = messages(locale).seo
  const pricing = messages(locale).pricingData
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: seo.offerCatalogName,
    itemListElement: [
      {
        '@type': 'Offer',
        name: pricing.base.name,
        price: '600',
        priceCurrency: 'GBP',
        description: seo.offerBase,
      },
      {
        '@type': 'Offer',
        name: pricing.scaleup.name,
        price: '1500',
        priceCurrency: 'GBP',
        description: seo.offerScaleup,
      },
      {
        '@type': 'Offer',
        name: pricing.oneoff.name,
        price: '1000',
        priceCurrency: 'GBP',
        description: seo.offerOneOff,
      },
    ],
  }
}

export function hreflangAlternates(path: string) {
  return {
    en: absoluteUrl(toLocalePath(path, 'en')),
    es: absoluteUrl(toLocalePath(path, 'es')),
    xDefault: absoluteUrl(toLocalePath(path, 'en')),
  }
}
