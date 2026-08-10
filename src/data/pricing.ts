export type PricingTier = {
  name: string
  price: string
  period: string
  tagline: string
  features: string[]
  featured?: boolean
  dark?: boolean
  custom?: boolean
}

export const pricing: PricingTier[] = [
  {
    name: 'Base',
    price: '£600',
    period: 'month',
    tagline: 'For owners on one CRM plus a couple of tools. On going dev partnership, whatever you need.',
    features: ['One CRM + 2 tools', 'Monitoring & alerts', 'Email and zoom calls support, We become your helpful dev team'],
  },
  {
    name: 'Scale-up',
    price: '£1,500',
    period: 'month',
    tagline: 'When the stack actually runs the business. On going dev partnership, whatever you need.',
    features: [
      'Multiple CRMs + 4 tools',
      'Monitoring & alerts',
      'Priority email and zoom calls support',
      'We become your helpful dev team',
    ],
    featured: true,
  },
  {
    name: 'One-off',
    price: '£1,000',
    period: 'one-off',
    tagline: 'One connection that works for you, with one follow-up task.',
    features: [
      'One connection built end-to-end',
      'One follow-up task included',
      'Documented handoff',
      'Fixed price — no retainer',
      'Email support and zoom calls until you are comfortable with the handoff',
    ],
    dark: true,
  },
  {
    name: 'Custom',
    price: '',
    period: '',
    tagline: 'Multi-region, multi-CRM, complex logic.',
    features: ['Everything in Scale-up', 'Dedicated engineer', 'Uptime SLA', 'Custom reporting'],
    custom: true,
  },
]
