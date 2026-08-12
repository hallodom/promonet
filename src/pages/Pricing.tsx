import { Link } from 'react-router-dom'
import { useReveal } from '@/lib/useReveal'
import PricingTiers from '@/components/PricingTiers'
import TeamSection from '@/components/TeamSection'
import ContactButton from '@/components/ContactButton'
import Seo from '@/components/Seo'
import { listSeoRoutes, offerCatalogJsonLd } from '@/lib/seo'
import { useLocale } from '@/i18n/LocaleContext'

export default function Pricing() {
  useReveal()
  const { t, locale, path } = useLocale()
  const pricingPath = path('pricing')
  const pricingSeo = listSeoRoutes(locale).find((r) => r.path === pricingPath)!

  return (
    <>
      <Seo
        title={pricingSeo.title}
        description={pricingSeo.description}
        path={pricingPath}
        jsonLd={[offerCatalogJsonLd(locale)]}
      />

      <section className="pt-28 md:pt-36 pb-16 md:pb-20 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-[760px] reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-voltage" />
              {t('pricingPage.eyebrow')}
            </div>
            <h1 className="font-display text-[clamp(40px,7vw,88px)] leading-[1.02] tracking-[-0.02em] mb-6 text-balance">
              {t('pricingPage.title')}
            </h1>
            <p className="font-display text-[clamp(22px,3vw,34px)] leading-[1.2] tracking-[-0.015em] text-obsidian mb-6 max-w-[640px] text-balance">
              {t('pricingPage.subtitle')}
            </p>
            <p className="text-lg md:text-xl text-graphite max-w-[560px] mb-4">
              {t('pricingPage.noHidden')}
            </p>
            <p className="text-lg text-graphite max-w-[560px]">
              {t('pricingPage.bodyBefore')}{' '}
              <Link to={path('connect')} className="text-voltage hover:underline font-semibold">
                {t('pricingPage.browseTools')}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <PricingTiers />
        </div>
      </section>

      <TeamSection />

      <section
        id="cta"
        className="relative py-32 md:py-44 bg-obsidian text-bone overflow-hidden"
      >
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,64,232,0.22)_0%,transparent_60%)]" />

        <div className="relative max-w-[1000px] mx-auto px-6 md:px-10 text-center reveal">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 inline-flex items-center gap-3">
            <span className="w-6 h-px bg-voltage" />
            {t('pricingPage.ctaEyebrow')}
            <span className="w-6 h-px bg-voltage" />
          </div>
          <h2 className="font-display text-[clamp(40px,7vw,92px)] leading-[1.0] tracking-[-0.02em] mb-8 text-balance">
            {t('pricingPage.ctaTitle')}
          </h2>
          <p className="text-lg md:text-xl text-bone/70 max-w-[560px] mx-auto mb-12 text-balance">
            {t('pricingPage.ctaBody')}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <ContactButton className="px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
          </div>

          <p className="text-xs font-mono uppercase tracking-[0.18em] text-graphite">
            {t('pricingPage.ctaResponse')}
          </p>
        </div>
      </section>
    </>
  )
}
