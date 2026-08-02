import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import matrix from '@/data/matrix.json'
import { useReveal } from '@/lib/useReveal'
import ContactButton from '@/components/ContactButton'

export default function ConnectPage() {
  useReveal()
  const { slug } = useParams<{ slug: string }>()

  const parts = slug?.match(/^(.+?)-to-(.+?)-software$/)
  if (!parts) return <NotFound />

  const [, crmSlug, verticalSlug] = parts
  const crm = matrix.crms.find((c) => c.slug === crmSlug)
  const vertical = matrix.verticals[verticalSlug as keyof typeof matrix.verticals]

  if (!crm || !vertical) return <NotFound />

  return (
    <>
      <section className="pt-32 pb-20 border-b border-obsidian/8 dark:border-bone/8">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-10 text-sm">
            <Link
              to="/connect"
              className="inline-flex items-center gap-2 text-graphite hover:text-voltage transition-colors no-underline"
            >
              <ArrowLeft size={14} /> All integrations
            </Link>
            <span className="text-graphite/40">·</span>
            <Link
              to="/connect/crm"
              className="text-graphite hover:text-voltage transition-colors no-underline"
            >
              Connect your CRM
            </Link>
          </div>

          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-6 block reveal">
            {crm.short} → {vertical.title}
          </span>
          <h1 className="font-display text-[clamp(36px,6vw,72px)] leading-[1.02] tracking-[-0.02em] mb-8 max-w-[900px] text-balance reveal">
            Connect {crm.name} to your {vertical.name} tools.
          </h1>
          <p className="text-lg text-graphite max-w-[640px] mb-8 reveal" style={{ transitionDelay: '100ms' }}>
            {crm.blurb}
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

      <section className="py-24 bg-obsidian text-bone hairline-t border-bone/10">
        <div className="max-w-[800px] mx-auto px-6 md:px-10 text-center">
          <h3 className="font-display text-3xl md:text-5xl mb-5 tracking-[-0.02em] text-balance">
            Want this built?
          </h3>
          <p className="text-bone/70 mb-10 max-w-[480px] mx-auto text-lg">
            Book a call. We'll scope your {crm.short} + {vertical.name} integration in 20 minutes.
          </p>
          <ContactButton className="px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
        </div>
      </section>
    </>
  )
}

function NotFound() {
  return (
    <section className="py-32 text-center">
      <div className="max-w-[600px] mx-auto px-6 md:px-10">
        <h1 className="font-display text-5xl mb-5 tracking-[-0.02em]">Integration not found</h1>
        <p className="text-graphite mb-10">We couldn't find that integration page.</p>
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
  )
}
