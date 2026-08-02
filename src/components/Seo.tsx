import { Helmet } from 'react-helmet-async'
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo'

type SeoProps = {
  title: string
  description: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  jsonLd?: Array<Record<string, unknown> | object>
  noIndex?: boolean
}

export default function Seo({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  jsonLd = [],
  noIndex = false,
}: SeoProps) {
  const url = absoluteUrl(path)
  const graph = [organizationJsonLd(), websiteJsonLd(), ...jsonLd]

  return (
    <Helmet>
      <html lang="en-GB" />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_GB" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <script type="application/ld+json">{JSON.stringify(graph.length === 1 ? graph[0] : graph)}</script>
    </Helmet>
  )
}
