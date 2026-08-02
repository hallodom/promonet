import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import matrix from '@/data/matrix.json'
import { useReveal } from '@/lib/useReveal'
import ContactButton from '@/components/ContactButton'
import Seo from '@/components/Seo'
import {
  breadcrumbJsonLd,
  connectPath,
  listConnectPages,
} from '@/lib/seo'

export default function ConnectPage() {
  useReveal()
  const { slug } = useParams<{ slug: string }>()

  const parts = slug?.match(/^(.+?)-to-(.+?)-software$/)
  if (!parts) return <NotFound />

  const [, crmSlug, verticalSlug] = parts
  const crm = matrix.crms.find((c) => c.slug === crmSlug)
  // Resolve by matrix key or by name with spaces → hyphens (matches connectSlug)
  const vertical =
    matrix.verticals[verticalSlug as keyof typeof matrix.verticals] ??
    Object.values(matrix.verticals).find(
      (v) => v.name.replace(/\s+/g, '-') === verticalSlug,
    )

  if (!crm || !vertical) return <NotFound />

  const path = `/connect/${slug}`
  const pageMeta = listConnectPages().find((p) => p.path === path)
  const title =
    pageMeta?.title ?? `Connect ${crm.name} to ${vertical.title} | Promonet`
  const description =
    pageMeta?.description ??
    `Connect ${crm.name} to the ${vertical.name} software small businesses already run — fixed monthly price, no in-house dev team required.`

  const toolPreview = vertical.tools.slice(0, 3).join(', ')
  const intro = `${crm.blurb} For small businesses running ${vertical.title.toLowerCase()} — tools like ${toolPreview}${
    vertical.tools.length > 3 ? ', and more' : ''
  } — we connect ${crm.name} so leads, status updates, and handoffs stop living in copy-paste. Fixed monthly partnership or one-off build.`

  const relatedVerticals = crm.verticals
    .map((key) => {
      const v = matrix.verticals[key as keyof typeof matrix.verticals]
      if (!v) return null
      const relatedPath = connectPath(crm.slug, v.name)
      if (relatedPath === path) return null
      return { title: v.title, path: relatedPath, name: v.name }
    })
    .filter(Boolean) as Array<{ title: string; path: string; name: string }>

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Connect tools', path: '/connect' },
    { name: 'Connect your CRM', path: '/connect/crm' },
    { name: `${crm.name} → ${vertical.title}`, path },
  ]

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={path}
        jsonLd={[breadcrumbJsonLd(crumbs)]}
      />

      <section className="pt-32 pb-20 border-b border-obsidian/8 dark:border-bone/8">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-10 text-sm text-graphite"
          >
            {crumbs.map((crumb, i) => (
              <span key={crumb.path} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-graphite/40">/</span>}
                {i === crumbs.length - 1 ? (
                  <span className="text-obsidian dark:text-bone">{crumb.name}</span>
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
            {crm.short} → {vertical.title}
          </span>
          <h1 className="font-display text-[clamp(36px,6vw,72px)] leading-[1.02] tracking-[-0.02em] mb-8 max-w-[900px] text-balance reveal">
            Connect {crm.name} to {vertical.title}.
          </h1>
          <p className="text-lg text-graphite max-w-[640px] mb-8 reveal" style={{ transitionDelay: '100ms' }}>
            {intro}{' '}
            <Link to="/pricing" className="text-voltage hover:underline font-semibold">
              See pricing
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2 reveal" style={{ transitionDelay: '150ms' }}>
            {vertical.tools.map((tool) => (
              <span
                key={tool}
                className="px-3 py-1.5 text-xs font-mono rounded-[4px] border border-obsidian/10 dark:border-bone/10 bg-bone dark:bg-surface-1 text-graphite"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <h2 className="font-display text-3xl md:text-4xl mb-12 tracking-[-0.015em] reveal">
            Integration flows
          </h2>
          <div className="grid gap-4">
            {vertical.flows.map((flow, i) => (
              <div
                key={i}
                className="reveal group p-7 md:p-8 rounded-[4px] border border-obsidian/10 dark:border-bone/10 bg-bone dark:bg-surface-1 hover:border-voltage/50 transition-colors"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-[3px] bg-voltage/10 text-voltage">
                    {flow.from}
                  </span>
                  <ArrowRight size={14} className="text-graphite" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">
                    {flow.to.replace(/\{CRM\}/g, crm.short)}
                  </span>
                </div>
                <p className="text-base leading-relaxed text-obsidian/80 dark:text-bone/80">
                  {flow.body.replace(/\{CRM\}/g, crm.short)}
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
              Related {crm.name} integrations
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm reveal">
              {relatedVerticals.slice(0, 6).map((rel) => (
                <li key={rel.path}>
                  <Link to={rel.path} className="text-voltage hover:underline">
                    Connect {crm.name} to {rel.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/connect/crm" className="text-graphite hover:text-voltage hover:underline">
                  All CRM integrations
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-graphite hover:text-voltage hover:underline">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </section>
      )}

      <section className="py-24 bg-obsidian text-bone hairline-t border-bone/10">
        <div className="max-w-[800px] mx-auto px-6 md:px-10 text-center">
          <h3 className="font-display text-3xl md:text-5xl mb-5 tracking-[-0.02em] text-balance">
            Ready to connect {crm.short} to your {vertical.name} stack?
          </h3>
          <p className="text-bone/70 mb-10 max-w-[480px] mx-auto text-lg">
            Book a call. We&apos;ll scope your {crm.short} + {vertical.name} integration in 20 minutes.
          </p>
          <ContactButton className="px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
        </div>
      </section>
    </>
  )
}

function NotFound() {
  return (
    <>
      <Seo
        title="Integration not found | Promonet"
        description="That CRM integration page could not be found."
        path="/connect"
        noIndex
      />
      <section className="py-32 text-center">
        <div className="max-w-[600px] mx-auto px-6 md:px-10">
          <h1 className="font-display text-5xl mb-5 tracking-[-0.02em]">Integration not found</h1>
          <p className="text-graphite mb-10">We couldn&apos;t find that integration page.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/connect" className="text-voltage hover:underline font-semibold">
              Browse all integrations →
            </Link>
            <Link to="/connect/crm" className="text-graphite hover:text-voltage hover:underline font-semibold">
              Connect your CRM →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
