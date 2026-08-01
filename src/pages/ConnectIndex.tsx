import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/lib/useReveal'
import AppSearch from '@/components/AppSearch'
import AppCatalog from '@/components/AppCatalog'
import catalog from '@/data/apps.json'

export default function ConnectIndex() {
  useReveal()

  return (
    <>
      <section className="pt-32 pb-20 border-b border-obsidian/8 dark:border-bone/8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-6 block reveal">
            Integrations
          </span>
          <h1 className="font-display text-[clamp(40px,7vw,88px)] leading-[1.02] tracking-[-0.02em] mb-8 max-w-[900px] text-balance reveal">
            Any tool. Connected to the rest.
          </h1>
          <p className="text-lg md:text-xl text-graphite max-w-[640px] mb-8 reveal" style={{ transitionDelay: '100ms' }}>
            Search or browse {catalog.count.toLocaleString()} apps — CRMs, accounting, mortgage, legal, dental, real estate, and niche tools. Fixed monthly price. No dev team required.
          </p>
          <div className="reveal mb-10" style={{ transitionDelay: '120ms' }}>
            <Link
              to="/connect/crm"
              className="group inline-flex items-center gap-2 font-semibold text-sm tracking-[0.02em] text-voltage hover:underline"
            >
              Connect your CRM
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
