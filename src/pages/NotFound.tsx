import { Link } from 'react-router-dom'
import Seo from '@/components/Seo'
import { useLocale } from '@/i18n/LocaleContext'

export default function NotFound() {
  const { t, path } = useLocale()
  return (
    <>
      <Seo
        title={t('notFound.seoTitle')}
        description={t('notFound.description')}
        noIndex
      />
      <section className="py-32 text-center">
        <div className="max-w-[600px] mx-auto px-6 md:px-10">
          <h1 className="font-display text-5xl mb-5 tracking-[-0.02em]">{t('notFound.title')}</h1>
          <p className="text-graphite mb-10">{t('notFound.body')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={path('home')} className="text-voltage hover:underline font-semibold">
              {t('connectPage.home')}
            </Link>
            <Link to={path('connect')} className="text-graphite hover:text-voltage hover:underline font-semibold">
              {t('connectPage.browseAll')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
