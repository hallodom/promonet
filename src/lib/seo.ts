import matrix from '@/data/matrix.json'

export const SITE_URL = 'https://promonetconsulting.com'
export const SITE_NAME = 'Promonet'
export const CONTACT_EMAIL = 'hello@promonetconsulting.com'

/** Default share image for Open Graph / LinkedIn / X / Facebook (1200×630). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`
export const DEFAULT_OG_IMAGE_WIDTH = 1200
export const DEFAULT_OG_IMAGE_HEIGHT = 630
export const DEFAULT_OG_IMAGE_TYPE = 'image/jpeg'
export const DEFAULT_OG_IMAGE_ALT =
  'Promonet — CRM and tool integrations for small businesses'
export const SITE_LOGO = `${SITE_URL}/logo.png`

export type SeoRoute = {
  path: string
  title: string
  description: string
  priority?: string
  changefreq?: string
}

type Crm = (typeof matrix.crms)[number]
type Vertical = (typeof matrix.verticals)[keyof typeof matrix.verticals]

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

export function connectPath(crmSlug: string, verticalName: string) {
  return `/connect/${connectSlug(crmSlug, verticalName)}`
}

export function listConnectPages() {
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
      const path = connectPath(crm.slug, vertical.name)
      pages.push({
        path,
        crm,
        verticalKey,
        vertical,
        title: pageTitle(`Connect ${crm.name} to ${vertical.title}`),
        description: `Connect ${crm.name} to the ${vertical.name} software small businesses already run — fixed monthly price, no in-house dev team required.`,
      })
    }
  }

  return pages
}

export function listSeoRoutes(): SeoRoute[] {
  const connectPages = listConnectPages().map((p) => ({
    path: p.path,
    title: p.title,
    description: p.description,
    priority: '0.7',
    changefreq: 'monthly',
  }))

  return [
    {
      path: '/',
      title: pageTitle('Connect CRM & Business Tools for Small Businesses'),
      description:
        'Promonet helps small businesses connect CRM, accounting, booking, and industry tools — fixed monthly or one-off pricing, with human support. No dev team required.',
      priority: '1.0',
      changefreq: 'weekly',
    },
    {
      path: '/about',
      title: pageTitle('About Promonet — CRM Integrations for Small Businesses'),
      description:
        'We are a small team of developers and designers helping small businesses connect CRM and industry tools at a low cost, with genuine human support.',
      priority: '0.6',
      changefreq: 'monthly',
    },
    {
      path: '/pricing',
      title: pageTitle('Pricing for CRM & Tool Integrations'),
      description:
        'Simple pricing for CRM and tool integrations: monthly partnership options from £600, or a fixed one-off connection from £1,000. No hidden hourly fees.',
      priority: '0.8',
      changefreq: 'monthly',
    },
    {
      path: '/connect',
      title: pageTitle('Connect Business Tools & Integrations'),
      description:
        'Search and browse tools we help small businesses connect — CRMs, accounting, booking, and niche industry software. Fixed monthly price.',
      priority: '0.9',
      changefreq: 'weekly',
    },
    {
      path: '/connect/crm',
      title: pageTitle('Connect Your CRM to Industry Tools'),
      description:
        'Connect Capsule, HubSpot, Pipedrive, Zoho, Copper, or Insightly to mortgage, legal, dental, real estate, and other industry software.',
      priority: '0.9',
      changefreq: 'weekly',
    },
    ...connectPages,
  ]
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    logo: SITE_LOGO,
    image: DEFAULT_OG_IMAGE,
    description:
      'CRM and tool integrations for small businesses. We connect your CRM to industry software and the rest of your stack for a fixed price.',
    areaServed: ['GB', 'Worldwide'],
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

export function offerCatalogJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Promonet integration pricing',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Base',
        price: '600',
        priceCurrency: 'GBP',
        description: 'Monthly CRM + tool integration partnership for small businesses.',
      },
      {
        '@type': 'Offer',
        name: 'Scale-up',
        price: '1500',
        priceCurrency: 'GBP',
        description: 'Monthly partnership with more tools, unlimited flows, and priority support.',
      },
      {
        '@type': 'Offer',
        name: 'One-off',
        price: '1000',
        priceCurrency: 'GBP',
        description: 'Fixed-price one-off connection build with documented handoff.',
      },
    ],
  }
}

export const HOME_FAQS = [
  {
    question: 'What does Promonet connect?',
    answer:
      'We help small businesses connect CRM platforms like Capsule, HubSpot, Pipedrive, Zoho, Copper, and Insightly to accounting, booking, and industry software — plus many other tools in your stack.',
  },
  {
    question: 'Is Promonet for small businesses?',
    answer:
      'Yes. Promonet is built for owners and small teams who need CRM and tool integrations without hiring a full-time development team.',
  },
  {
    question: 'How much does it cost to connect tools?',
    answer:
      'Monthly partnerships start at £600. Scale-up is £1,500 per month. A one-off connection starts at £1,000. Custom work is quoted separately.',
  },
  {
    question: 'How long does a typical integration take?',
    answer:
      'After a get-to-know-you call and fixed quote, most builds take two to four weeks, then we monitor and maintain the connections.',
  },
  {
    question: 'Do I need developers on my team?',
    answer:
      'No. We map, build, document, and maintain the connections for you, with human support when something needs a tweak.',
  },
]
