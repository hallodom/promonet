import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'
import AppSearch from '@/components/AppSearch'
import PricingTiers from '@/components/PricingTiers'
import TeamSection from '@/components/TeamSection'
import ContactButton from '@/components/ContactButton'
import LinkedInButton from '@/components/LinkedInButton'
import Seo from '@/components/Seo'
import { faqJsonLd, getHomeFaqs, listSeoRoutes } from '@/lib/seo'
import { useLocale } from '@/i18n/LocaleContext'
import { connectPagePath, homeHashPath } from '@/i18n/paths'

const tools = [
  { name: 'HubSpot', logo: '/tool-logos/hubspot.svg' },
  { name: 'Pipedrive', logo: '/tool-logos/pipedrive.svg', wordmark: true },
  { name: 'Capsule', logo: '/tool-logos/capsule.svg' },
  { name: 'Mortgage Brain', logo: '/tool-logos/mortgage-brain.svg', wordmark: true, wide: true },
  { name: 'Zoho', logo: '/tool-logos/zoho.svg' },
  { name: 'Stripe', logo: '/tool-logos/stripe.svg' },
  { name: 'Calendly', logo: '/tool-logos/calendly.svg' },
  { name: 'Xero', logo: '/tool-logos/xero.svg' },
  { name: 'Clio', logo: '/tool-logos/clio.svg', wordmark: true },
  { name: 'Jobber', logo: '/tool-logos/jobber.svg', wordmark: true },
  { name: 'Dubsado', logo: '/tool-logos/dubsado.svg', wordmark: true },
  { name: 'HoneyBook', logo: '/tool-logos/honeybook.svg', wordmark: true },
  { name: 'Shopify', logo: '/tool-logos/shopify.svg' },
  { name: 'Mailchimp', logo: '/tool-logos/mailchimp.svg' },
  { name: 'Slack', logo: '/tool-logos/slack.svg' },
  { name: 'Notion', logo: '/tool-logos/notion.svg' },
  { name: 'Asana', logo: '/tool-logos/asana.svg' },
  { name: 'Airtable', logo: '/tool-logos/airtable.svg' },
] as const

export default function Home() {
  useReveal()
  const { t, locale, path } = useLocale()
  const homePath = path('home')
  const homeSeo = listSeoRoutes(locale).find((r) => r.path === homePath)!
  const faqs = getHomeFaqs(locale)

  const pipelines = [
    { from: 'Stripe', to: 'QuickBooks', label: t('home.pipelineInvoice'), href: path('connect') },
    { from: 'Calendly', to: 'HubSpot', label: t('home.pipelineMeeting'), href: path('connectCrm') },
    { from: 'Shopify', to: 'Mailchimp', label: t('home.pipelineOrder'), href: path('connect') },
    { from: 'Capsule', to: 'Mortgage Brain', label: t('home.pipelineEnquiry'), href: connectPagePath('capsule-to-mortgage-software', locale) },
    { from: 'CRM', to: 'Custom system', label: t('home.pipelineRecord'), href: path('connectCrm') },
  ]

  const steps = [
    {
      n: '01',
      label: t('home.step1Label'),
      title: t('home.step1Title'),
      body: t('home.step1Body'),
      illustration: '/illustrations/step-map.png',
      alt: t('home.step1Alt'),
    },
    {
      n: '02',
      label: t('home.step2Label'),
      title: t('home.step2Title'),
      body: t('home.step2Body'),
      illustration: '/illustrations/step-build.png',
      alt: t('home.step2Alt'),
    },
    {
      n: '03',
      label: t('home.step3Label'),
      title: t('home.step3Title'),
      body: t('home.step3Body'),
      illustration: '/illustrations/step-run.png',
      alt: t('home.step3Alt'),
    },
  ]

  return (
    <>
      <Seo
        title={homeSeo.title}
        description={homeSeo.description}
        path={homePath}
        jsonLd={[faqJsonLd(faqs)]}
      />

      <section className="relative overflow-hidden bg-bone text-obsidian">
        <div className="relative max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center pt-16 md:pt-24 pb-20 md:pb-28">
            <div className="reveal">
              <h1 className="font-display text-[clamp(48px,7vw,88px)] leading-[1.02] tracking-[-0.02em] text-balance mb-8">
                {t('home.heroTitleBefore')}{' '}
                <span className="text-voltage">{t('home.heroTitleAccent')}</span>
              </h1>

              <p className="text-lg md:text-xl leading-[1.55] text-graphite max-w-[520px] mb-10 text-balance">
                {t('home.heroP1')}
                <Link to={path('connectCrm')} className="text-voltage hover:underline">
                  {t('home.heroConnectCrm')}
                </Link>
                {t('home.heroP2')}
                <Link to={path('connect')} className="text-voltage hover:underline">
                  {t('home.heroIndustry')}
                </Link>
                {t('home.heroP3')}
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <ContactButton className="px-6 py-3.5 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
                <LinkedInButton className="px-6 py-3.5 bg-obsidian text-bone rounded-[4px] hover:bg-obsidian/90" />
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-graphite">
                <Link
                  to={homeHashPath('pricing', locale)}
                  className="flex items-center gap-2 hover:text-obsidian transition-colors"
                  onClick={(e) => {
                    if (window.location.pathname === homePath || (homePath === '/' && window.location.pathname === '/')) {
                      e.preventDefault()
                      document
                        .getElementById('pricing')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      window.history.replaceState(null, '', homeHashPath('pricing', locale))
                    }
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-imago" />
                  {t('home.bulletFixed')}
                </Link>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-imago" />
                  {t('home.bulletFriendly')}
                </span>
              </div>
            </div>

            <figure className="relative reveal" style={{ transitionDelay: '120ms' }}>
              <img
                src="/small-business-owner-crm-integrations.jpg"
                alt={t('home.heroImageAlt')}
                loading="eager"
                className="w-full aspect-[4/5] object-cover rounded-[4px] shadow-[0_30px_60px_-20px_rgba(10,10,15,0.18)]"
              />
              <figcaption className="hero-handnote mt-3 w-fit max-w-[min(100%,22rem)] bg-transparent">
                <img
                  src="/illustrations/no-more-exporting-handwritten.png"
                  alt={t('home.handnoteAlt')}
                  width={1466}
                  height={159}
                  className="block h-7 md:h-8 w-auto max-w-full select-none pointer-events-none mix-blend-multiply"
                  loading="eager"
                />
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="bg-bone text-obsidian py-14 overflow-hidden border-t border-obsidian/8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 mb-8 text-center">
          <p className="text-sm text-graphite">
            {t('home.marqueeLabel')}
          </p>
        </div>
        <div className="mask-fade-x relative">
          <div className="flex gap-14 marquee-track w-max">
            {[...tools, ...tools].map((tool, i) => (
              <Link
                key={i}
                to={path('connect')}
                aria-label={tool.name}
                className="group flex items-center gap-3 font-display font-medium text-2xl md:text-3xl text-obsidian/40 hover:text-obsidian transition-colors whitespace-nowrap"
              >
                <img
                  src={tool.logo}
                  alt=""
                  aria-hidden="true"
                  className={`object-contain opacity-40 group-hover:opacity-100 transition-opacity ${
                    'wordmark' in tool
                      ? `h-7 md:h-8 w-auto ${'wide' in tool ? 'max-w-[11rem]' : 'max-w-[9rem]'}`
                      : 'h-7 w-7 md:h-8 md:w-8'
                  }`}
                />
                {!('wordmark' in tool) && <span>{tool.name}</span>}
              </Link>
            ))}
          </div>
        </div>
        <p className="max-w-[1280px] mx-auto px-6 md:px-10 mt-8 text-center text-sm text-graphite">
          {t('home.marqueeMore')}{' '}
          <Link to={path('connect')} className="text-voltage hover:underline">
            {t('home.browseEvery')}
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
              {t('home.aboutEyebrow')}
            </div>
            <h2 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] mb-8 text-balance">
              {t('home.aboutTitle')}
            </h2>
            <p className="text-lg leading-relaxed text-graphite max-w-[440px] mb-8">
              {t('home.aboutP1')}
            </p>
            <p className="text-lg leading-relaxed text-graphite max-w-[440px] mb-8">
              <strong className="font-semibold text-obsidian">{t('home.aboutStrong')}</strong>
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <Link to={path('connectCrm')} className="text-voltage hover:underline">
                {t('home.linkConnectCrm')}
              </Link>
              <Link to={path('pricing')} className="text-voltage hover:underline">
                {t('home.linkPricing')}
              </Link>
              <Link to={path('about')} className="text-voltage hover:underline">
                {t('home.linkAbout')}
              </Link>
            </div>
          </div>

          <div className="reveal" style={{ transitionDelay: '100ms' }}>
            <div className="rounded-[4px] hairline bg-bone overflow-hidden">
              <div className="px-5 py-3 hairline-b font-mono text-[11px] uppercase tracking-[0.18em] text-graphite flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-imago status-pulse" />
                  {t('home.connectedWorkflows')}
                </span>
                <span>{t('home.lastSync')}</span>
              </div>

              {pipelines.map((p, i) => (
                <Link
                  key={i}
                  to={p.href}
                  className="relative px-5 md:px-6 py-5 hairline-b last:border-b-0 font-mono text-sm grid grid-cols-[1fr_auto] items-center gap-4 overflow-hidden group hover:bg-obsidian/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-obsidian truncate">{p.from}</span>
                    <ArrowRight size={14} className="text-voltage shrink-0" />
                    <span className="text-obsidian truncate">{p.to}</span>
                    <span className="hidden md:inline text-graphite truncate">· {p.label}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-[3px] bg-imago/12 text-imago text-[10px] uppercase tracking-wider">
                      {t('common.synced')}
                    </span>
                  </div>
                  <div
                    className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-voltage/10 to-transparent scan-line pointer-events-none"
                    style={{ animationDelay: `${i * 0.7}s` }}
                  />
                </Link>
              ))}

              <div className="px-5 py-3 font-mono text-[11px] text-graphite flex items-center justify-between">
                <span>{t('home.eventsToday')}</span>
                <span className="text-imago">{t('home.uptime')}</span>
              </div>
            </div>

            <div className="mt-8 reveal" style={{ transitionDelay: '160ms' }}>
              <AppSearch variant="compact" />
            </div>
          </div>
        </div>
      </section>

      <TeamSection />

      <section id="how" className="py-28 md:py-40 bg-surface-1/30 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-[760px] mb-20 reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="font-mono">02</span>
              <span className="w-6 h-px bg-voltage" />
              {t('home.howEyebrow')}
            </div>
            <h2 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] text-balance">
              {t('home.howTitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-obsidian/10 rounded-[4px] overflow-hidden hairline">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="reveal relative bg-bone p-8 md:p-10 group hover:bg-bone/60 transition-colors"
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
                    className="w-full max-w-[220px] h-auto mix-blend-multiply"
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
              {t('home.pricingEyebrow')}
            </div>
            <h2 className="font-display text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] mb-6 text-balance">
              {t('home.pricingTitle')}
            </h2>
            <p className="text-lg text-graphite max-w-[560px] mb-4">
              <strong className="font-semibold text-obsidian">{t('home.pricingMonthly')}</strong>
              {t('home.pricingOr')}
              <strong className="font-semibold text-obsidian">{t('home.pricingOneOff')}</strong>
              {t('home.pricingPAfter')}
            </p>
            <Link to={path('pricing')} className="text-sm font-semibold text-voltage hover:underline">
              {t('home.pricingFull')}
            </Link>
          </div>

          <PricingTiers />
        </div>
      </section>

      <section className="py-24 md:py-32 hairline-b">
        <div className="max-w-[860px] mx-auto px-6 md:px-10">
          <h2 className="font-display text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] mb-10 reveal">
            {t('home.faqTitle')}
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="reveal border-t border-obsidian/10 pt-6">
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
            {t('home.ctaEyebrow')}
            <span className="w-6 h-px bg-voltage" />
          </div>
          <h2 className="font-display text-[clamp(40px,7vw,92px)] leading-[1.0] tracking-[-0.02em] mb-8 text-balance">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-lg md:text-xl text-bone/70 max-w-[560px] mx-auto mb-12 text-balance">
            {t('home.ctaBody')}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <ContactButton className="px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
            <LinkedInButton className="px-7 py-4 bg-bone text-obsidian rounded-[4px] hover:bg-bone/90" />
          </div>

          <p className="text-xs font-mono uppercase tracking-[0.18em] text-graphite">
            {t('home.ctaResponse')}
          </p>
        </div>
      </section>
    </>
  )
}
