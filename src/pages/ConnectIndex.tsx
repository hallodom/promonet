import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'
import AppSearch from '@/components/AppSearch'
import AppCatalog from '@/components/AppCatalog'
import Seo from '@/components/Seo'
import catalog from '@/data/apps.json'
import { listSeoRoutes } from '@/lib/seo'
import { useLocale } from '@/i18n/LocaleContext'

export default function ConnectIndex() {
  useReveal()
  const { t, locale, path } = useLocale()
  const connectPath = path('connect')
  const connectSeo = listSeoRoutes(locale).find((r) => r.path === connectPath)!
  const count = catalog.count.toLocaleString(locale === 'es' ? 'es-ES' : 'en-GB')

  return (
    <>
      <Seo
        title={connectSeo.title}
        description={connectSeo.description}
        path={connectPath}
      />

      <section className="pt-32 pb-20 border-b border-obsidian/8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-6 block reveal">
            {t('connectIndex.eyebrow')}
          </span>
          <h1 className="font-display text-[clamp(40px,7vw,88px)] leading-[1.02] tracking-[-0.02em] mb-8 max-w-[900px] text-balance reveal">
            {t('connectIndex.title')}
          </h1>
          <p className="text-lg md:text-xl text-graphite max-w-[640px] mb-8 reveal" style={{ transitionDelay: '100ms' }}>
            {t('connectIndex.body', { count })}
          </p>
          <div className="reveal mb-10" style={{ transitionDelay: '120ms' }}>
            <Link
              to={path('connectCrm')}
              className="group inline-flex items-center gap-2 font-semibold text-sm tracking-[0.02em] text-voltage hover:underline"
            >
              {t('connectIndex.connectCrm')}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="reveal" style={{ transitionDelay: '150ms' }}>
            <AppSearch />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <AppCatalog />
        </div>
      </section>
    </>
  )
}
