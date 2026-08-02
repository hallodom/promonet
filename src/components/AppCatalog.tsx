import { useEffect, useMemo, useState } from 'react'
import catalog from '@/data/apps.json'
import { cn } from '@/lib/cn'
import ContactButton from '@/components/ContactButton'

type AppEntry = {
  name: string
  slug: string
  category: string
  aliases: string[]
}

const apps = catalog.apps as AppEntry[]


export default function AppCatalog() {
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<AppEntry | null>(null)

  const categories = useMemo(() => {
    const set = new Set(apps.map((a) => a.category).filter(Boolean))
    return ['All', ...[...set].sort((a, b) => a.localeCompare(b))]
  }, [])

  const filtered = useMemo(() => {
    if (category === 'All') return apps
    return apps.filter((a) => a.category === category)
  }, [category])

  useEffect(() => {
    if (!selected) return
    document.getElementById('catalog-cta')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selected])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-3 block">
            Full catalog
          </span>
          <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em]">
            Browse every tool we can connect
          </h2>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          {filtered.length.toLocaleString()} of {catalog.count.toLocaleString()} apps
        </p>
      </div>

      <div className="sticky top-20 z-20 -mx-2 px-2 py-3 mb-8 bg-bone/90 dark:bg-obsidian/90 backdrop-blur-xl border-b border-obsidian/8 dark:border-bone/8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat)
                setSelected(null)
              }}
              className={cn(
                'px-3 py-1.5 rounded-[4px] text-xs font-mono uppercase tracking-wider transition-colors',
                category === cat
                  ? 'bg-voltage text-bone'
                  : 'border border-obsidian/10 dark:border-bone/10 text-graphite hover:border-voltage hover:text-voltage',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          id="catalog-cta"
          className="mb-8 p-5 rounded-[4px] bg-voltage/[0.06] dark:bg-voltage/10 border border-voltage/20"
        >
          <p className="text-sm text-graphite mb-1">We can connect</p>
          <p className="font-display text-xl md:text-2xl tracking-[-0.015em] mb-4">{selected.name}</p>
          <p className="text-sm text-graphite mb-5 max-w-[480px]">
            Talk to us about connecting {selected.name} to your CRM, accounting, booking software, or the rest of your stack.
          </p>
          <ContactButton
            message={`I'd like to connect ${selected.name} to the rest of my tools.`}
            className="px-5 py-3 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90"
          />
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((app) => (
          <button
            key={`${app.slug}-${app.name}`}
            type="button"
            onClick={() => setSelected(app)}
            className={cn(
              'text-left p-4 rounded-[4px] border transition-colors',
              selected?.name === app.name
                ? 'border-voltage bg-voltage/[0.06] dark:bg-voltage/10'
                : 'border-obsidian/10 dark:border-bone/10 bg-bone dark:bg-surface-1 hover:border-voltage/50',
            )}
          >
            <div className="font-medium text-sm mb-1 truncate">{app.name}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-graphite truncate">
              {app.category}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
