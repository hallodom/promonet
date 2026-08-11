import { Link } from 'react-router-dom'
import { useReveal } from '@/lib/useReveal'
import PricingTiers from '@/components/PricingTiers'
import TeamSection from '@/components/TeamSection'
import ContactButton from '@/components/ContactButton'
import Seo from '@/components/Seo'
import { listSeoRoutes, offerCatalogJsonLd } from '@/lib/seo'

const pricingSeo = listSeoRoutes().find((r) => r.path === '/pricing')!

export default function Pricing() {
  useReveal()

  return (
    <>
      <Seo
        title={pricingSeo.title}
        description={pricingSeo.description}
        path="/pricing"
        jsonLd={[offerCatalogJsonLd()]}
      />

      <section className="pt-28 md:pt-36 pb-16 md:pb-20 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-[760px] reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-voltage" />
              Pricing
            </div>
            <h1 className="font-display text-[clamp(40px,7vw,88px)] leading-[1.02] tracking-[-0.02em] mb-6 text-balance">
              Simple pricing that helps us work with you
            </h1>
            <p className="font-display text-[clamp(22px,3vw,34px)] leading-[1.2] tracking-[-0.015em] text-obsidian mb-6 max-w-[640px] text-balance">
              Monthly partnership options or a one-off project.
            </p>
            <p className="text-lg md:text-xl text-graphite max-w-[560px] mb-4"> No hidden hourly fees.
            </p>
            <p className="text-lg text-graphite max-w-[560px]">
              Pick a monthly partnership when you want ongoing monitoring and we become your new dev team, or book a one-off when you only need one integration done.{' '}
              <Link to="/connect" className="text-voltage hover:underline font-semibold">
                Browse tools we connect
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <PricingTiers />
        </div>
      </section>

      <TeamSection />

      <section
        id="cta"
        className="relative py-32 md:py-44 bg-obsidian text-bone overflow-hidden"
      >
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,64,232,0.22)_0%,transparent_60%)]" />

        <div className="relative max-w-[1000px] mx-auto px-6 md:px-10 text-center reveal">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 inline-flex items-center gap-3">
            <span className="w-6 h-px bg-voltage" />
            Get your Sunday nights back
            <span className="w-6 h-px bg-voltage" />
          </div>
          <h2 className="font-display text-[clamp(40px,7vw,92px)] leading-[1.0] tracking-[-0.02em] mb-8 text-balance">
            Ready to connect your stack?
          </h2>
          <p className="text-lg md:text-xl text-bone/70 max-w-[560px] mx-auto mb-12 text-balance">
            Book a get-to-know-you call. We&apos;ll map your tools, sketch the flows, and
            send you a fixed quote.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <ContactButton className="px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
          </div>

          <p className="text-xs font-mono uppercase tracking-[0.18em] text-graphite">
            24-hour response, every time
          </p>
        </div>
      </section>
    </>
  )
}
