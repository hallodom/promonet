import type { Locale } from '@/i18n/locales'
import en from '@/i18n/messages/en.json'
import es from '@/i18n/messages/es.json'

export type PricingKey = 'base' | 'scaleup' | 'oneoff' | 'custom'

export type PricingTier = {
  id: PricingKey
  name: string
  price: string
  period: string
  tagline: string
  features: string[]
  featured?: boolean
  dark?: boolean
  custom?: boolean
}

const catalogs = { en, es } as const

const PRICE: Record<PricingKey, string> = {
  base: '£600',
  scaleup: '£1,500',
  oneoff: '£1,000',
  custom: '',
}

const FLAGS: Record<
  PricingKey,
  Pick<PricingTier, 'featured' | 'dark' | 'custom'>
> = {
  base: {},
  scaleup: { featured: true },
  oneoff: { dark: true },
  custom: { custom: true },
}

export function getPricing(locale: Locale = 'en'): PricingTier[] {
  const data = catalogs[locale].pricingData
  return (Object.keys(PRICE) as PricingKey[]).map((key) => {
    const tier = data[key]
    return {
      id: key,
      name: tier.name,
      price: PRICE[key],
      period: 'period' in tier ? tier.period : '',
      tagline: tier.tagline,
      features: [...tier.features],
      ...FLAGS[key],
    }
  })
}

/** English default for scripts / SEO that don't have a locale context. */
export const pricing: PricingTier[] = getPricing('en')
