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
    name: 'Starter',
    price: '£600',
    period: 'month',
    tagline: 'For owners on one CRM plus a couple of tools.',
    features: ['One CRM + 1 tool', 'Up to 3 flows', 'Monitoring & alerts', '24-hour email support'],
  },
  {
    name: 'Growth',
    price: '£1,500',
    period: 'month',
    tagline: 'When the stack actually runs the business.',
    features: [
      'One CRM + 4 tools',
      'Unlimited flows',
      'Priority Slack support',
      'Quarterly architecture review',
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
    ],
    dark: true,
  },
  {
    name: 'Custom',
    price: '',
    period: '',
    tagline: 'Multi-region, multi-CRM, complex logic.',
    features: ['Everything in Growth', 'Dedicated engineer', 'Uptime SLA', 'Custom reporting'],
    custom: true,
  },
]
