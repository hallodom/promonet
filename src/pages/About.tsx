import { useReveal } from '@/lib/useReveal'
import TeamSection from '@/components/TeamSection'
import ContactButton from '@/components/ContactButton'
import Seo from '@/components/Seo'
import { listSeoRoutes } from '@/lib/seo'
import { useLocale } from '@/i18n/LocaleContext'

export default function About() {
  useReveal()
  const { t, locale, path } = useLocale()
  const aboutPath = path('about')
  const aboutSeo = listSeoRoutes(locale).find((r) => r.path === aboutPath)!

  return (
    <>
      <Seo
        title={aboutSeo.title}
        description={aboutSeo.description}
        path={aboutPath}
      />

      <section className="pt-28 md:pt-36 pb-16 md:pb-24 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-[780px] reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-voltage" />
              {t('about.eyebrow')}
            </div>
            <h1 className="font-display text-[clamp(40px,7vw,88px)] leading-[1.02] tracking-[-0.02em] mb-8 text-balance">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-graphite max-w-[640px] mb-5">
              {t('about.p1')}
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-graphite max-w-[640px]">
              {t('about.p2')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="reveal">
              <h2 className="font-display text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] mb-6 text-balance">
                {t('about.storyTitle')}
              </h2>
              <p className="text-lg leading-relaxed text-graphite mb-5 max-w-[520px]">
                {t('about.storyP1')}
              </p>
              <p className="text-lg leading-relaxed text-graphite max-w-[520px]">
                {t('about.storyP2')}
              </p>
            </div>

            <div className="reveal space-y-8" style={{ transitionDelay: '80ms' }}>
              <div className="border-t border-obsidian/10 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-3">
                  {t('about.stat1Label')}
                </p>
                <p className="text-graphite leading-relaxed">
                  {t('about.stat1Body')}
                </p>
              </div>
              <div className="border-t border-obsidian/10 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-3">
                  {t('about.stat2Label')}
                </p>
                <p className="text-graphite leading-relaxed">
                  {t('about.stat2Body')}
                </p>
              </div>
              <div className="border-t border-obsidian/10 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-3">
                  {t('about.stat3Label')}
                </p>
                <p className="text-graphite leading-relaxed">
                  {t('about.stat3Body')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TeamSection />

      <section className="relative py-28 md:py-36 bg-obsidian text-bone overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,64,232,0.22)_0%,transparent_60%)]" />
        <div className="relative max-w-[800px] mx-auto px-6 md:px-10 text-center reveal">
          <h2 className="font-display text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.02em] mb-6 text-balance">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-lg text-bone/70 max-w-[480px] mx-auto mb-10">
            {t('about.ctaBody')}
          </p>
          <ContactButton className="px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
        </div>
      </section>
    </>
  )
}
