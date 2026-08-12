import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'
import Seo from '@/components/Seo'
import { connectSlug, listSeoRoutes } from '@/lib/seo'
import { getMatrix } from '@/data/matrixLocale'
import { useLocale } from '@/i18n/LocaleContext'
import { connectPagePath } from '@/i18n/paths'

export default function ConnectCrm() {
  useReveal()
  const { t, locale, path } = useLocale()
  const matrix = getMatrix(locale)
  const crmPath = path('connectCrm')
  const crmSeo = listSeoRoutes(locale).find((r) => r.path === crmPath)!

  return (
    <>
      <Seo
        title={crmSeo.title}
        description={crmSeo.description}
        path={crmPath}
      />

      <section className="pt-32 pb-20 border-b border-obsidian/8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <Link
            to={path('connect')}
            className="inline-flex items-center gap-2 text-sm text-graphite hover:text-voltage transition-colors mb-10 no-underline"
          >
            <ArrowLeft size={14} /> {t('connectCrm.back')}
          </Link>

          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-6 block reveal">
            {t('connectCrm.eyebrow')}
          </span>
          <h1 className="font-display text-[clamp(40px,7vw,88px)] leading-[1.02] tracking-[-0.02em] mb-8 max-w-[900px] text-balance reveal">
            {t('connectCrm.title')}
          </h1>
          <p className="text-lg md:text-xl text-graphite max-w-[600px] reveal" style={{ transitionDelay: '100ms' }}>
            {t('connectCrm.body')}
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid gap-20">
            {matrix.crms.map((crm, ci) => (
              <div key={crm.slug} className="reveal" style={{ transitionDelay: `${ci * 60}ms` }}>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 pb-6 border-b border-obsidian/8">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-graphite mb-3 block">
                      0{ci + 1}
                    </span>
                    <h2 className="font-display text-4xl md:text-5xl mb-3 tracking-[-0.02em]">{crm.name}</h2>
                    <p className="text-graphite max-w-[600px] leading-relaxed">{crm.blurb}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crm.verticals.map((v) => {
                    const vertical = matrix.verticals[v as keyof typeof matrix.verticals]
                    if (!vertical) return null
                    const slug = connectSlug(crm.slug, vertical.name)
                    return (
                      <Link
                        key={slug}
                        to={connectPagePath(slug, locale)}
                        className="group flex flex-col p-6 rounded-[4px] border border-obsidian/10 bg-bone hover:border-voltage hover:bg-voltage/[0.02] transition-colors no-underline"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="font-mono text-[11px] uppercase tracking-wider text-graphite">
                            {crm.short} <span className="text-voltage">→</span> {vertical.name}
                          </div>
                          <ArrowUpRight
                            size={16}
                            className="text-graphite group-hover:text-voltage group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                          />
                        </div>
                        <div className="font-display text-xl mb-2 tracking-[-0.015em] group-hover:text-voltage transition-colors">
                          {vertical.title}
                        </div>
                        <div className="text-xs text-graphite mt-auto">
                          {vertical.tools.slice(0, 3).join(' · ')}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
