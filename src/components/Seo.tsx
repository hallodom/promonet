import { Helmet } from 'react-helmet-async'
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  absoluteUrl,
  hreflangAlternates,
  ogImageAlt,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo'
import { useLocale } from '@/i18n/LocaleContext'
import { LOCALE_META } from '@/i18n/locales'

type SeoProps = {
  title: string
  description: string
  path?: string
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  imageType?: string
  type?: 'website' | 'article'
  jsonLd?: Array<Record<string, unknown> | object>
  noIndex?: boolean
}

export default function Seo({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  imageWidth = DEFAULT_OG_IMAGE_WIDTH,
  imageHeight = DEFAULT_OG_IMAGE_HEIGHT,
  imageType = DEFAULT_OG_IMAGE_TYPE,
  type = 'website',
  jsonLd = [],
  noIndex = false,
}: SeoProps) {
  const { locale } = useLocale()
  const url = absoluteUrl(path)
  const graph = [organizationJsonLd(locale), websiteJsonLd(), ...jsonLd]
  const meta = LOCALE_META[locale]
  const altLocale = locale === 'en' ? 'es' : 'en'
  const alts = hreflangAlternates(path)
  const resolvedImageAlt = imageAlt ?? ogImageAlt(locale)

  return (
    <Helmet>
      <html lang={meta.htmlLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="en" href={alts.en} />
      <link rel="alternate" hrefLang="es" href={alts.es} />
      <link rel="alternate" hrefLang="x-default" href={alts.xDefault} />
      <link rel="image_src" href={image} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={meta.ogLocale} />
      <meta property="og:locale:alternate" content={LOCALE_META[altLocale].ogLocale} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content={imageType} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:alt" content={resolvedImageAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={resolvedImageAlt} />

      <script type="application/ld+json">{JSON.stringify(graph.length === 1 ? graph[0] : graph)}</script>
    </Helmet>
  )
}
