import { useReveal } from '@/lib/useReveal'
import TeamSection from '@/components/TeamSection'
import ContactButton from '@/components/ContactButton'
import Seo from '@/components/Seo'
import { listSeoRoutes } from '@/lib/seo'

const aboutSeo = listSeoRoutes().find((r) => r.path === '/about')!

export default function About() {
  useReveal()

  return (
    <>
      <Seo
        title={aboutSeo.title}
        description={aboutSeo.description}
        path="/about"
      />

      <section className="pt-28 md:pt-36 pb-16 md:pb-24 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="max-w-[780px] reveal">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-voltage" />
              About
            </div>
            <h1 className="font-display text-[clamp(40px,7vw,88px)] leading-[1.02] tracking-[-0.02em] mb-8 text-balance">
              Built by people who&apos;ve lived the connectivity gap.
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-graphite max-w-[640px] mb-5">
              We help small businesses connect CRM and industry tools at a low cost,
              with genuine human support — so owners stop re-typing data between systems.
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-graphite max-w-[640px]">
              We&apos;re a small team of developers and designers. Over 20 years building
              some of the leading CRM solutions, we kept seeing the same thing:
              customers still struggling to connect their CRM to the rest of their
              tools — and their tools to each other, not just the CRM.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="reveal">
              <h2 className="font-display text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] mb-6 text-balance">
                We saw a gap. Then we decided to fill it.
              </h2>
              <p className="text-lg leading-relaxed text-graphite mb-5 max-w-[520px]">
                Businesses buy great software, then spend Sunday nights copying data
                between systems that were never meant to talk. Agencies quote
                enterprise prices. Support becomes a ticket queue.
              </p>
              <p className="text-lg leading-relaxed text-graphite max-w-[520px]">
                Promonet exists to help small businesses fix that problem — at a low
                cost, with genuine human support.
              </p>
            </div>

            <div className="reveal space-y-8" style={{ transitionDelay: '80ms' }}>
              <div className="border-t border-obsidian/10 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-3">
                  20 years
                </p>
                <p className="text-graphite leading-relaxed">
                  Building CRM products and watching connectivity stay the unsolved
                  part of the stack.
                </p>
              </div>
              <div className="border-t border-obsidian/10 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-3">
                  Low cost
                </p>
                <p className="text-graphite leading-relaxed">
                  Fixed monthly partnerships or one-off builds — priced for small
                  businesses, not enterprise RFPs.
                </p>
              </div>
              <div className="border-t border-obsidian/10 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-3">
                  Human support
                </p>
                <p className="text-graphite leading-relaxed">
                  Real people who know your tools. No account managers. No black-hole
                  ticket queues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TeamSection />

      <section className="relative py-28 md:py-36 bg-obsidian text-bone overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,64,232,0.22)_0%,transparent_60%)]" />
        <div className="relative max-w-[800px] mx-auto px-6 md:px-10 text-center reveal">
          <h2 className="font-display text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.02em] mb-6 text-balance">
            Ready to connect your stack?
          </h2>
          <p className="text-lg text-bone/70 max-w-[480px] mx-auto mb-10">
            Tell us which tools you&apos;re using. We&apos;ll help you connect them — simply,
            affordably, with humans on the other end.
          </p>
          <ContactButton className="px-7 py-4 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
        </div>
      </section>
    </>
  )
}
