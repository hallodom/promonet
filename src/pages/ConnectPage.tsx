import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'
import ContactButton from '@/components/ContactButton'
import Seo from '@/components/Seo'
import ProductLink from '@/components/ProductLink'
import {
  breadcrumbJsonLd,
  connectPath,
  listConnectPages,
  pageTitle,
} from '@/lib/seo'
import { getMatrix } from '@/data/matrixLocale'
import { useLocale } from '@/i18n/LocaleContext'
import { connectPagePath } from '@/i18n/paths'

export default function ConnectPage() {
  useReveal()
  const { slug } = useParams<{ slug: string }>()
  const { t, locale, path } = useLocale()
  const matrix = getMatrix(locale)

  const parts = slug?.match(/^(.+?)-to-(.+?)-software$/)
  if (!parts) return <NotFound />

  const [, crmSlug, verticalSlug] = parts
  const crm = matrix.crms.find((c) => c.slug === crmSlug)
  const vertical =
    matrix.verticals[verticalSlug as keyof typeof matrix.verticals] ??
    Object.values(matrix.verticals).find(
      (v) => v.name.replace(/\s+/g, '-') === verticalSlug,
    )

  if (!crm || !vertical) return <NotFound />

  const pagePath = connectPagePath(slug!, locale)
  const pageMeta = listConnectPages(locale).find((p) => p.path === pagePath)
  const title =
    pageMeta?.title ??
    pageTitle(t('connectPage.title', { crm: crm.name, vertical: vertical.title }).replace(/\.$/, ''))
  const description =
    pageMeta?.description ??
    t('connectPage.metaDescription', { crm: crm.name, vertical: vertical.name })

  const toolPreview = vertical.tools.slice(0, 3)

  const relatedVerticals = crm.verticals
    .map((key) => {
      const v = matrix.verticals[key as keyof typeof matrix.verticals]
      if (!v) return null
      const relatedPath = connectPath(crm.slug, v.name, locale)
      if (relatedPath === pagePath) return null
      return { title: v.title, path: relatedPath, name: v.name }
    })
    .filter(Boolean) as Array<{ title: string; path: string; name: string }>

  const crumbs = [
    { name: t('connectPage.home'), path: path('home') },
    { name: t('connectPage.connectTools'), path: path('connect') },
    { name: t('connectPage.connectCrm'), path: path('connectCrm') },
    { name: `${crm.name} → ${vertical.title}`, path: pagePath },
  ]

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={pagePath}
        jsonLd={[breadcrumbJsonLd(crumbs)]}
      />

      <section className="pt-32 pb-20 border-b border-obsidian/8">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-10 text-sm text-graphite"
          >
            {crumbs.map((crumb, i) => (
              <span key={crumb.path} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-graphite/40">/</span>}
                {i === crumbs.length - 1 ? (
                  <span className="text-obsidian">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-voltage transition-colors no-underline"
                  >
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-6 block reveal">
            <ProductLink name={crm.name}>{crm.short}</ProductLink> → {vertical.title}
          </span>
          <h1 className="font-display text-[clamp(36px,6vw,72px)] leading-[1.02] tracking-[-0.02em] mb-8 max-w-[900px] text-balance reveal">
            {t('connectPage.title', { crm: crm.name, vertical: vertical.title })}
          </h1>
          <p className="text-lg text-graphite max-w-[640px] mb-8 reveal" style={{ transitionDelay: '100ms' }}>
            {crm.blurb}
            {t('connectPage.leadBefore', { verticalLower: vertical.title.toLowerCase() })}
            {toolPreview.map((tool, index) => (
              <span key={tool}>
                {index > 0 &&
                  (index === toolPreview.length - 1
                    ? `, ${t('common.and')} `
                    : ', ')}
                <ProductLink name={tool}>{tool}</ProductLink>
              </span>
            ))}
            {vertical.tools.length > 3 ? t('common.andMore') : ''}
            {t('connectPage.leadAfter')}
            <ProductLink name={crm.name}>{crm.name}</ProductLink>
            {t('connectPage.leadEnd')}{' '}
            <Link to={path('pricing')} className="text-voltage hover:underline font-semibold">
              {t('connectPage.seePricing')}
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2 reveal" style={{ transitionDelay: '150ms' }}>
            {vertical.tools.map((tool) => (
              <ProductLink
                key={tool}
                name={tool}
                className="px-3 py-1.5 text-xs font-mono rounded-[4px] border border-obsidian/10 bg-bone text-graphite"
              >
                {tool}
              </ProductLink>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <h2 className="font-display text-3xl md:text-4xl mb-12 tracking-[-0.015em] reveal">
            {t('connectPage.flowsTitle')}
          </h2>
          <div className="grid gap-4">
            {vertical.flows.map((flow, i) => (
              <div
                key={i}
                className="reveal group p-7 md:p-8 rounded-[4px] border border-obsidian/10 bg-bone hover:border-voltage/50 transition-colors"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-[3px] bg-voltage/10 text-voltage">
                    {flow.from}
                  </span>
                  <ArrowRight size={14} className="text-graphite" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">
                    {renderCrmReferences(flow.to, crm.name, crm.short)}
                  </span>
                </div>
                <p className="text-base leading-relaxed text-obsidian/80">
                  {renderCrmReferences(flow.body, crm.name, crm.short)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {relatedVerticals.length > 0 && (
        <section className="py-16 md:py-20 hairline-t">
          <div className="max-w-[1100px] mx-auto px-6 md:px-10">
            <h2 className="font-display text-2xl md:text-3xl mb-6 tracking-[-0.015em] reveal">
              {t('connectPage.relatedBefore')}
              <ProductLink name={crm.name}>{crm.name}</ProductLink>
              {t('connectPage.relatedAfter')}
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm reveal">
              {relatedVerticals.slice(0, 6).map((rel) => (
                <li key={rel.path}>
                  {t('connectPage.relatedItemBefore')}
                  <ProductLink name={crm.name}>{crm.name}</ProductLink>
                  {t('connectPage.relatedItemTo')}
                  <Link to={rel.path} className="text-voltage hover:underline">{rel.title}</Link>
                </li>
              ))}
              <li>
                <Link to={path('connectCrm')} className="text-graphite hover:text-voltage hover:underline">
                  {t('connectPage.allCrm')}
                </Link>
              </li>
              <li>
                <Link to={path('pricing')} className="text-graphite hover:text-voltage hover:underline">
                  {t('connectPage.pricing')}
                </Link>
              </li>
            </ul>
          </div>
        </section>
      )}

      <section className="py-24 bg-obsidian text-bone hairline-t border-bone/10">
        <div className="max-w-[800px] mx-auto px-6 md:px-10 text-center">
          <h3 className="font-display text-3xl md:text-5xl mb-5 tracking-[-0.02em] text-balance">
            {t('connectPage.ctaTitleBefore')}
            <ProductLink name={crm.name}>{crm.short}</ProductLink>
            {t('connectPage.ctaTitleMid')}
            {vertical.name}
            {t('connectPage.ctaTitleAfter')}
          </h3>
          <p className="text-bone/70 mb-10 max-w-[480px] mx-auto text-lg">
            {t('connectPage.ctaBodyBefore')}
            <ProductLink name={crm.name}>{crm.short}</ProductLink>
            {t('connectPage.ctaBodyMid')}
            {vertical.name}
            {t('connectPage.ctaBodyAfter')}
          </p>
          <ContactButton className="px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
        </div>
      </section>
    </>
  )
}

function renderCrmReferences(text: string, crmName: string, crmLabel: string) {
  return text.split('{CRM}').map((part, index) => (
    <span key={`${part}-${index}`}>
      {index > 0 && <ProductLink name={crmName}>{crmLabel}</ProductLink>}
      {part}
    </span>
  ))
}

function NotFound() {
  const { t, path } = useLocale()
  return (
    <>
      <Seo
        title={t('connectPage.notFoundSeoTitle')}
        description={t('connectPage.notFoundDescription')}
        path={path('connect')}
        noIndex
      />
      <section className="py-32 text-center">
        <div className="max-w-[600px] mx-auto px-6 md:px-10">
          <h1 className="font-display text-5xl mb-5 tracking-[-0.02em]">{t('connectPage.notFoundTitle')}</h1>
          <p className="text-graphite mb-10">{t('connectPage.notFoundBody')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={path('connect')} className="text-voltage hover:underline font-semibold">
              {t('connectPage.browseAll')}
            </Link>
            <Link to={path('connectCrm')} className="text-graphite hover:text-voltage hover:underline font-semibold">
              {t('connectPage.connectCrmCta')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
