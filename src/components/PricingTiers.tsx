import { Check } from 'lucide-react'
import { pricing } from '@/data/pricing'
import ContactButton from '@/components/ContactButton'

export default function PricingTiers() {
  return (
    <>
      <div className="grid md:grid-cols-3 gap-px bg-obsidian/10 dark:bg-bone/10 rounded-[4px] overflow-hidden hairline">
        {pricing
          .filter((t) => !t.custom)
          .map((tier, i) => {
            const inverted = Boolean(tier.featured || tier.dark)
            return (
              <div
                key={tier.name}
                className={`reveal relative p-8 md:p-10 ${
                  tier.featured
                    ? 'bg-voltage text-bone'
                    : tier.dark
                      ? 'bg-obsidian text-bone'
                      : 'bg-bone dark:bg-surface-1 text-obsidian dark:text-bone'
                }`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center justify-between mb-8">
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.18em] ${
                      inverted ? 'text-bone/80' : 'text-graphite'
                    }`}
                  >
                    {tier.name}
                  </span>
                  {tier.featured && (
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-bone text-voltage px-2 py-1 rounded-[2px]">
                      Most teams
                    </span>
                  )}
                  {tier.dark && (
                    <span className="font-mono text-[10px] uppercase tracking-wider bg-bone/10 text-bone px-2 py-1 rounded-[2px]">
                      Project
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-display text-[48px] md:text-[56px] leading-none tracking-[-0.02em]">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      className={`font-mono text-sm ${
                        inverted ? 'text-bone/70' : 'text-graphite'
                      }`}
                    >
                      / {tier.period}
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm mb-8 min-h-[40px] ${
                    inverted ? 'text-bone/80' : 'text-graphite'
                  }`}
                >
                  {tier.tagline}
                </p>

                <ul className="space-y-3 mb-10">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          inverted ? 'text-bone' : 'text-imago'
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <ContactButton
                  className={`w-full py-3.5 rounded-[4px] ${
                    tier.featured
                      ? 'bg-bone text-voltage hover:bg-bone/90'
                      : tier.dark
                        ? 'bg-bone text-obsidian hover:bg-bone/90'
                        : 'bg-voltage text-bone hover:bg-voltage/90'
                  }`}
                />
              </div>
            )
          })}
      </div>

      {pricing
        .filter((t) => t.custom)
        .map((tier) => (
          <div key={tier.name} className="mt-10 md:mt-14 reveal">
            <div className="rounded-[4px] border border-obsidian/15 dark:border-bone/15 bg-bone dark:bg-obsidian overflow-hidden">
              <div className="px-6 md:px-10 py-4 border-b border-obsidian/10 dark:border-bone/10 flex items-center justify-between gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage">
                  Custom
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-graphite">
                  Built around your stack
                </span>
              </div>
              <div className="p-6 md:p-10 grid md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-center">
                <div>
                  <div className="flex flex-wrap items-baseline gap-3 mb-3">
                    <h3 className="font-display text-3xl md:text-4xl tracking-[-0.02em]">
                      {tier.name}
                    </h3>
                    {tier.price && (
                      <span className="font-mono text-lg text-graphite">{tier.price}</span>
                    )}
                  </div>
                  <p className="text-graphite mb-6 max-w-[520px]">{tier.tagline}</p>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <Check size={16} className="shrink-0 mt-0.5 text-imago" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:text-right">
                  <ContactButton className="px-7 py-3.5 rounded-[4px] bg-voltage text-bone hover:bg-voltage/90" />
                </div>
              </div>
            </div>
          </div>
        ))}

      <p className="mt-8 text-sm text-graphite font-mono">
        All plans · no asterisks · no hidden hourly fees · cancel any time
      </p>
    </>
  )
}
