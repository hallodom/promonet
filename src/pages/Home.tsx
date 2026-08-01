import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'
import AppSearch from '@/components/AppSearch'

const tools = [
  'HubSpot', 'Pipedrive', 'Capsule', 'Zoho', 'Stripe',
  'Calendly', 'Xero', 'Clio', 'Jobber', 'Dubsado', 'Honeybook',
  'Shopify', 'Mailchimp', 'Slack', 'Notion', 'Asana', 'Airtable',
]

const pipelines = [
  { from: 'Stripe', to: 'QuickBooks', label: 'invoice → bookkeeping' },
  { from: 'Calendly', to: 'HubSpot', label: 'meeting → CRM' },
  { from: 'Shopify', to: 'Mailchimp', label: 'order → segment' },
  { from: 'Capsule', to: 'Real Estate', label: 'lead → listing' },
  { from: 'CRM', to: 'Custom system', label: 'record → sync' },
]

const steps = [
  {
    n: '01',
    label: 'Map',
    title: 'A 20-minute call.',
    body: 'We sketch the flows on a whiteboard, count the integrations, and send you a fixed quote. No "discovery phase." No assessment fee.',
  },
  {
    n: '02',
    label: 'Build',
    title: 'Two to four weeks.',
    body: 'We build, test, document, and connect every flow. Monitoring runs from day one. You see progress in plain English, not Jira.',
  },
  {
    n: '03',
    label: 'Run',
    title: 'It just runs.',
    body: "APIs change, you add tools, you change your mind — it's all in the price. We respond within 24 hours, every time.",
  },
]

const pricing = [
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
    tagline: "When the stack actually runs the business.",
    features: ['One CRM + 4 tools', 'Unlimited flows', 'Priority Slack support', 'Quarterly architecture review'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'Multi-region, multi-CRM, complex logic.',
    features: ['Everything in Growth', 'Dedicated engineer', 'Uptime SLA', 'Custom reporting'],
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
]

export default function Home() {
  useReveal()

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-bone text-obsidian">
        <div className="relative max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center pt-16 md:pt-24 pb-20 md:pb-28">
            <div className="reveal">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-graphite mb-8">
                Integration, in plain English
              </div>

              <h1 className="font-display text-[clamp(48px,7vw,88px)] leading-[1.02] tracking-[-0.02em] text-balance mb-8">
                Your software finally{' '}
                <span className="text-voltage">talking together.</span>
              </h1>

              <p className="text-lg md:text-xl leading-[1.55] text-graphite max-w-[520px] mb-10 text-balance">
                We partner with you to connect your tools and CRM to the industry
                software you actually run on — mortgage, legal, dental, real estate,
                home services — for a fixed one off job or monthly on going
                partnership. No dev team required.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <a
                  href="#cta"
                  className="group inline-flex items-center gap-2 font-sans font-semibold text-sm tracking-[0.02em] px-6 py-3.5 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90 transition-colors"
                >
                  Book a 20-minute call
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </a>
                <Link
                  to="/connect"
                  className="inline-flex items-center gap-2 font-sans font-semibold text-sm tracking-[0.02em] px-6 py-3.5 border border-obsidian/15 text-obsidian rounded-[4px] hover:border-obsidian/40 transition-colors"
                >
                  Browse integrations
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-graphite">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-imago" />
                  Fixed monthly price — no hourly games
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-imago" />
                  We build it <em className="not-italic font-medium text-obsidian">and</em> maintain it
                </span>
              </div>
            </div>

            <figure className="relative reveal" style={{ transitionDelay: '120ms' }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
                alt="Small business owner with a coffee in her workspace"
                loading="eager"
                className="w-full aspect-[4/5] object-cover rounded-[4px] shadow-[0_30px_60px_-20px_rgba(10,10,15,0.18)]"
              />
              <figcaption className="absolute bottom-5 left-5 bg-bone text-obsidian text-xs font-medium px-3 py-2 rounded-[3px] shadow-sm">
                Owners. Not engineers.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ TOOL MARQUEE ============ */}
      <section className="bg-bone text-obsidian py-14 overflow-hidden border-t border-obsidian/8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 mb-8 text-center">
          <p className="text-sm text-graphite">
            We speak the software you already use — fluently.
          </p>
        </div>
        <div className="mask-fade-x relative">
          <div className="flex gap-14 marquee-track w-max">
            {[...tools, ...tools].map((tool, i) => (
              <span
                key={i}
                className="font-display font-medium text-2xl md:text-3xl text-obsidian/40 hover:text-obsidian transition-colors whitespace-nowrap"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
        <p className="max-w-[1280px] mx-auto px-6 md:px-10 mt-8 text-center text-sm text-graphite">
          …and Xero, Shopify, Mailchimp, Clio, Jobber, Dubsado, Honeybook, and a few dozen more.
        </p>
      </section>

      {/* ============ PROBLEM ============ */}
      <section id="about" className="py-28 md:py-40 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="font-mono">01</span>
              <span className="w-6 h-px bg-voltage" />
              The Sunday-night problem
            </div>
            <h2 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] mb-8 text-balance">
              You bought the tools. They just don't talk.
            </h2>
            <p className="text-lg leading-relaxed text-graphite max-w-[440px] mb-8">
              Most owners we meet run six to twelve tools that don't know each other
              exist. Data gets re-typed. Decisions run on stale numbers. Sunday night
              becomes spreadsheet night.
            </p>
            <p className="text-lg leading-relaxed text-graphite max-w-[440px]">
              We're the people who quietly fix that.
            </p>
          </div>

          {/* Live pipeline visual */}
          <div className="reveal" style={{ transitionDelay: '100ms' }}>
            <div className="rounded-[4px] hairline bg-bone dark:bg-surface-1 overflow-hidden">
              <div className="px-5 py-3 hairline-b font-mono text-[11px] uppercase tracking-[0.18em] text-graphite flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-imago status-pulse" />
                  Workflows talking together
                </span>
                <span>last sync · 12s ago</span>
              </div>

              {pipelines.map((p, i) => (
                <div
                  key={i}
                  className="relative px-5 md:px-6 py-5 hairline-b last:border-b-0 font-mono text-sm grid grid-cols-[1fr_auto] items-center gap-4 overflow-hidden group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-obsidian dark:text-bone truncate">{p.from}</span>
                    <ArrowRight size={14} className="text-voltage shrink-0" />
                    <span className="text-obsidian dark:text-bone truncate">{p.to}</span>
                    <span className="hidden md:inline text-graphite truncate">· {p.label}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-[3px] bg-imago/12 text-imago text-[10px] uppercase tracking-wider">
                      synced
                    </span>
                  </div>
                  <div
                    className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-voltage/10 to-transparent scan-line pointer-events-none"
                    style={{ animationDelay: `${i * 0.7}s` }}
                  />
                </div>
              ))}

              <div className="px-5 py-3 font-mono text-[11px] text-graphite flex items-center justify-between">
                <span>1,381 events today</span>
                <span className="text-imago">99.97% uptime</span>
              </div>
            </div>

            <div className="mt-8 reveal" style={{ transitionDelay: '160ms' }}>
              <AppSearch variant="compact" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="py-28 md:py-40 bg-surface-1/30 dark:bg-surface-1 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-[760px] mb-20 reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="font-mono">02</span>
              <span className="w-6 h-px bg-voltage" />
              How it works
            </div>
            <h2 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] text-balance">
              Three steps. Then it just runs.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-obsidian/10 dark:bg-bone/10 rounded-[4px] overflow-hidden hairline">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="reveal relative bg-bone dark:bg-obsidian p-8 md:p-10 group hover:bg-bone/60 dark:hover:bg-obsidian/60 transition-colors"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center justify-between mb-10">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-graphite">
                    {s.n} · {s.label}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="text-graphite opacity-0 group-hover:opacity-100 group-hover:text-voltage transition-all"
                  />
                </div>
                <h3 className="font-display text-3xl md:text-[34px] leading-[1.1] mb-4">
                  {s.title}
                </h3>
                <p className="text-graphite leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="py-28 md:py-40 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-[760px] mb-20 reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="font-mono">03</span>
              <span className="w-6 h-px bg-voltage" />
              Pricing
            </div>
            <h2 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] mb-6 text-balance">
              One price. Every month. No "starting at."
            </h2>
            <p className="text-lg text-graphite max-w-[560px]">
              You'll always know what you're paying. Promise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-obsidian/10 dark:bg-bone/10 rounded-[4px] overflow-hidden hairline">
            {pricing.filter((t) => !t.dark).map((tier, i) => {
              const inverted = Boolean(tier.featured)
              return (
              <div
                key={tier.name}
                className={`reveal relative p-8 md:p-10 ${
                  tier.featured
                    ? 'bg-voltage text-bone'
                    : 'bg-bone dark:bg-surface-1 text-obsidian dark:text-bone'
                }`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center justify-between mb-8">
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.18em] ${
                      inverted ? 'text-bone/80' : 'text-graphite'
                    }`}
                  >
                    {tier.name}
                  </span>
                  {tier.featured && (
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-bone text-voltage px-2 py-1 rounded-[2px]">
                      Most teams
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-[48px] md:text-[56px] leading-none tracking-[-0.02em]">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      className={`font-mono text-sm ${
                        inverted ? 'text-bone/70' : 'text-graphite'
                      }`}
                    >
                      / {tier.period}
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm mb-8 min-h-[40px] ${
                    inverted ? 'text-bone/80' : 'text-graphite'
                  }`}
                >
                  {tier.tagline}
                </p>

                <ul className="space-y-3 mb-10">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          inverted ? 'text-bone' : 'text-imago'
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#cta"
                  className={`inline-flex items-center justify-center gap-2 w-full font-sans font-semibold text-sm tracking-[0.02em] py-3.5 rounded-[4px] transition-colors ${
                    tier.featured
                      ? 'bg-bone text-voltage hover:bg-bone/90'
                      : 'bg-voltage text-bone hover:bg-voltage/90'
                  }`}
                >
                  {tier.featured ? 'Book a call' : 'Get a quote'}
                  <ArrowRight size={14} />
                </a>
              </div>
              )
            })}
          </div>

          {pricing.filter((t) => t.dark).map((tier) => (
            <div key={tier.name} className="mt-10 md:mt-12 reveal">
              <div className="max-w-[420px] relative p-8 md:p-10 rounded-[4px] bg-obsidian text-bone border border-obsidian">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/80">
                    {tier.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-bone/10 text-bone px-2 py-1 rounded-[2px]">
                    Project
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-[48px] md:text-[56px] leading-none tracking-[-0.02em]">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="font-mono text-sm text-bone/70">
                      / {tier.period}
                    </span>
                  )}
                </div>

                <p className="text-sm mb-8 text-bone/80">{tier.tagline}</p>

                <ul className="space-y-3 mb-10">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="shrink-0 mt-0.5 text-bone" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#cta"
                  className="inline-flex items-center justify-center gap-2 w-full font-sans font-semibold text-sm tracking-[0.02em] py-3.5 rounded-[4px] bg-bone text-obsidian hover:bg-bone/90 transition-colors"
                >
                  Book a one-off
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}

          <p className="mt-8 text-sm text-graphite font-mono">
            All plans · no asterisks · no hidden hourly fees · cancel any time
          </p>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section
        id="cta"
        className="relative py-32 md:py-44 bg-obsidian text-bone overflow-hidden"
      >
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,64,232,0.22)_0%,transparent_60%)]" />

        <div className="relative max-w-[1000px] mx-auto px-6 md:px-10 text-center reveal">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 inline-flex items-center gap-3">
            <span className="w-6 h-px bg-voltage" />
            Get your Sunday nights back
            <span className="w-6 h-px bg-voltage" />
          </div>
          <h2 className="font-display text-[clamp(40px,7vw,92px)] leading-[1.0] tracking-[-0.02em] mb-8 text-balance">
            Let's make your software talk.
          </h2>
          <p className="text-lg md:text-xl text-bone/70 max-w-[560px] mx-auto mb-12 text-balance">
            Book a 20-minute call. We'll map your tools, sketch the flows, and send
            you a fixed quote.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <a
              href="mailto:hello@promonet.io"
              className="group inline-flex items-center gap-2 font-sans font-semibold text-sm tracking-[0.02em] px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90 transition-colors"
            >
              Book a call
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="mailto:hello@promonet.io"
              className="inline-flex items-center gap-2 font-mono text-sm px-6 py-4 border border-bone/20 text-bone rounded-[4px] hover:bg-bone/5 hover:border-bone/40 transition-colors"
            >
              hello@promonet.io
            </a>
          </div>

          <p className="text-xs font-mono uppercase tracking-[0.18em] text-graphite">
            24-hour response, every time
          </p>
        </div>
      </section>
    </>
  )
}
