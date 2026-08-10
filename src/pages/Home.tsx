import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'
import AppSearch from '@/components/AppSearch'
import PricingTiers from '@/components/PricingTiers'
import TeamSection from '@/components/TeamSection'
import ContactButton from '@/components/ContactButton'
import Seo from '@/components/Seo'
import { HOME_FAQS, faqJsonLd, listSeoRoutes } from '@/lib/seo'

const homeSeo = listSeoRoutes().find((r) => r.path === '/')!

const tools = [
  'HubSpot', 'Pipedrive', 'Capsule', 'Zoho', 'Stripe',
  'Calendly', 'Xero', 'Clio', 'Jobber', 'Dubsado', 'Honeybook',
  'Shopify', 'Mailchimp', 'Slack', 'Notion', 'Asana', 'Airtable',
]

const pipelines = [
  { from: 'Stripe', to: 'QuickBooks', label: 'invoice → bookkeeping', href: '/connect' },
  { from: 'Calendly', to: 'HubSpot', label: 'meeting → CRM', href: '/connect/crm' },
  { from: 'Shopify', to: 'Mailchimp', label: 'order → segment', href: '/connect' },
  { from: 'Capsule', to: 'Real Estate', label: 'lead → listing', href: '/connect/crm' },
  { from: 'CRM', to: 'Custom system', label: 'record → sync', href: '/connect/crm' },
]

const steps = [
  {
    n: '01',
    label: 'Map',
    title: 'A get to know you call.',
    body: 'We sketch the flows on a whiteboard, count the integrations, and send you a fixed quote. No "discovery phase." No assessment fee.',
    illustration: '/illustrations/step-map.png',
    alt: 'Charcoal sketch of two people talking',
  },
  {
    n: '02',
    label: 'Build',
    title: 'Two to four weeks.',
    body: 'We build, test, document, and connect every flow. Monitoring runs from day one. You see progress in plain English, not Jira.',
    illustration: '/illustrations/step-build.png',
    alt: 'Charcoal sketch of a wrench',
  },
  {
    n: '03',
    label: 'Run',
    title: 'It just runs.',
    body: "APIs change, you add tools, you change your mind — it's all in the price. We respond within 24 hours, every time.",
    illustration: '/illustrations/step-run.png',
    alt: 'Charcoal sketch of a happy smiling face',
  },
]

export default function Home() {
  useReveal()

  return (
    <>
      <Seo
        title={homeSeo.title}
        description={homeSeo.description}
        path="/"
        jsonLd={[faqJsonLd(HOME_FAQS)]}
      />

      <section className="relative overflow-hidden bg-bone text-obsidian">
        <div className="relative max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center pt-16 md:pt-24 pb-20 md:pb-28">
            <div className="reveal">
              <h1 className="font-display text-[clamp(48px,7vw,88px)] leading-[1.02] tracking-[-0.02em] text-balance mb-8">
                Your software finally{' '}
                <span className="text-voltage">talking together.</span>
              </h1>

              <p className="text-lg md:text-xl leading-[1.55] text-graphite max-w-[520px] mb-10 text-balance">
                We're a small remote first friendly team who help small to medium sized businesses connect CRM, accounting, booking, and
                industry software for a fixed one-off job or monthly partnership. 
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <ContactButton className="px-6 py-3.5 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
                <Link
                  to="/connect"
                  className="inline-flex items-center gap-2 font-sans font-semibold text-sm tracking-[0.02em] px-6 py-3.5 border border-obsidian/15 text-obsidian rounded-[4px] hover:border-obsidian/40 transition-colors"
                >
                  Connect tools
                </Link>
                <Link
                  to="/connect/crm"
                  className="inline-flex items-center gap-2 font-sans font-semibold text-sm tracking-[0.02em] px-6 py-3.5 border border-obsidian/15 text-obsidian rounded-[4px] hover:border-obsidian/40 transition-colors"
                >
                  Connect your CRM
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-graphite">
                <Link
                  to={{ pathname: '/', hash: 'pricing' }}
                  className="flex items-center gap-2 hover:text-obsidian transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-imago" />
                  Fixed price — no hourly games
                </Link>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-imago" />
                  Built for small businesses, we work directly with you as a friendly team
                </span>
              </div>
            </div>

            <figure className="relative reveal" style={{ transitionDelay: '120ms' }}>
              <img
                src="/small-business-owner-crm-integrations.jpg"
                alt="Small business owner whose CRM and tools Promonet helps connect"
                loading="eager"
                className="w-full aspect-[4/5] object-cover rounded-[4px] shadow-[0_30px_60px_-20px_rgba(10,10,15,0.18)]"
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="bg-bone text-obsidian py-14 overflow-hidden border-t border-obsidian/8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 mb-8 text-center">
          <p className="text-sm text-graphite">
            Tools small businesses ask us to connect every week.
          </p>
        </div>
        <div className="mask-fade-x relative">
          <div className="flex gap-14 marquee-track w-max">
            {[...tools, ...tools].map((tool, i) => (
              <Link
                key={i}
                to="/connect"
                className="font-display font-medium text-2xl md:text-3xl text-obsidian/40 hover:text-obsidian transition-colors whitespace-nowrap"
              >
                {tool}
              </Link>
            ))}
          </div>
        </div>
        <p className="max-w-[1280px] mx-auto px-6 md:px-10 mt-8 text-center text-sm text-graphite">
          …and Xero, Shopify, Mailchimp, Clio, Jobber, Dubsado, Honeybook, and a few dozen more.{' '}
          <Link to="/connect" className="text-voltage hover:underline">
            Browse every tool
          </Link>
          .
        </p>
      </section>

      <section id="about" className="py-28 md:py-40 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="font-mono">01</span>
              <span className="w-6 h-px bg-voltage" />
              The Sunday-night problem
            </div>
            <h2 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] mb-8 text-balance">
              You bought the tools but they still don't talk.
            </h2>
            <p className="text-lg leading-relaxed text-graphite max-w-[440px] mb-8">
              Most small-business owners we meet run six to twelve tools that don't
              sync. Data gets re-typed. Decisions run on stale numbers. Sunday night
              becomes spreadsheet night.
            </p>
            <p className="text-lg leading-relaxed text-graphite max-w-[440px] mb-8">
              We're the people who quietly connect the tools to each other.
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <Link to="/connect/crm" className="text-voltage hover:underline">
                Connect your CRM →
              </Link>
              <Link to="/pricing" className="text-voltage hover:underline">
                See pricing →
              </Link>
              <Link to="/about" className="text-voltage hover:underline">
                About Promonet →
              </Link>
            </div>
          </div>

          <div className="reveal" style={{ transitionDelay: '100ms' }}>
            <div className="rounded-[4px] hairline bg-bone dark:bg-surface-1 overflow-hidden">
              <div className="px-5 py-3 hairline-b font-mono text-[11px] uppercase tracking-[0.18em] text-graphite flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-imago status-pulse" />
                  Connected workflows
                </span>
                <span>last sync · 12s ago</span>
              </div>

              {pipelines.map((p, i) => (
                <Link
                  key={i}
                  to={p.href}
                  className="relative px-5 md:px-6 py-5 hairline-b last:border-b-0 font-mono text-sm grid grid-cols-[1fr_auto] items-center gap-4 overflow-hidden group hover:bg-obsidian/[0.02] dark:hover:bg-bone/[0.03] transition-colors"
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
                </Link>
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

      <TeamSection />

      <section id="how" className="py-28 md:py-40 bg-surface-1/30 dark:bg-surface-1 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-[760px] mb-20 reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="font-mono">02</span>
              <span className="w-6 h-px bg-voltage" />
              How it works
            </div>
            <h2 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] text-balance">
              Three steps. Then your tools stay connected.
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
                <div className="mt-10">
                  <img
                    src={s.illustration}
                    alt={s.alt}
                    loading="lazy"
                    className="w-full max-w-[220px] h-auto mix-blend-multiply dark:mix-blend-screen dark:invert"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-28 md:py-40 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-[760px] mb-20 reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="font-mono">03</span>
              <span className="w-6 h-px bg-voltage" />
              Pricing
            </div>
            <h2 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] mb-6 text-balance">
              Simple pricing - get in touch and let's get started
            </h2>
            <p className="text-lg text-graphite max-w-[560px] mb-4">
              Monthly partnerships or a one-off project — a simple fixed price for
              small businesses. No hidden hourly fees.
            </p>
            <Link to="/pricing" className="text-sm font-semibold text-voltage hover:underline">
              Full pricing details →
            </Link>
          </div>

          <PricingTiers />
        </div>
      </section>

      <section className="py-24 md:py-32 hairline-b">
        <div className="max-w-[860px] mx-auto px-6 md:px-10">
          <h2 className="font-display text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] mb-10 reveal">
            Questions small businesses ask before connecting tools
          </h2>
          <div className="space-y-6">
            {HOME_FAQS.map((faq) => (
              <div key={faq.question} className="reveal border-t border-obsidian/10 dark:border-bone/10 pt-6">
                <h3 className="font-display text-xl mb-3 tracking-[-0.015em]">{faq.question}</h3>
                <p className="text-graphite leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            Ready to connect your stack?
          </h2>
          <p className="text-lg md:text-xl text-bone/70 max-w-[560px] mx-auto mb-12 text-balance">
            Tell us which CRM and tools you use. We'll map the flows and send a fixed
            quote — built for small businesses, not enterprise theatre.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <ContactButton className="px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
          </div>

          <p className="text-xs font-mono uppercase tracking-[0.18em] text-graphite">
            24-hour response, every time
          </p>
        </div>
      </section>
    </>
  )
}
