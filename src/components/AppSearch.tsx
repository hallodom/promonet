import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
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

function scoreMatch(app: AppEntry, q: string): number {
  const name = app.name.toLowerCase()
  const aliases = (app.aliases || []).map((a) => a.toLowerCase())
  if (name === q) return 100
  if (aliases.includes(q)) return 95
  if (name.startsWith(q)) return 80
  if (aliases.some((a) => a.startsWith(q))) return 75
  if (name.includes(q)) return 60
  if (aliases.some((a) => a.includes(q))) return 55
  // loose token match
  const tokens = q.split(/\s+/).filter(Boolean)
  if (tokens.length > 1 && tokens.every((t) => name.includes(t) || aliases.some((a) => a.includes(t)))) {
    return 40
  }
  return 0
}


type Props = {
  variant?: 'full' | 'compact'
  className?: string
}

export default function AppSearch({ variant = 'full', className }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<AppEntry | null>(null)

  const trimmed = query.trim()
  const q = trimmed.toLowerCase()

  const results = useMemo(() => {
    if (q.length < 2) return []
    return apps
      .map((app) => ({ app, score: scoreMatch(app, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.app.name.localeCompare(b.app.name))
      .slice(0, 8)
      .map((r) => r.app)
  }, [q])

  const showEmpty = q.length >= 2 && results.length === 0
  const active = selected && (!q || scoreMatch(selected, q) > 0) ? selected : null

  return (
    <div
      className={cn(
        'rounded-[4px] border border-obsidian/10 dark:border-bone/10 bg-bone dark:bg-surface-1',
        variant === 'full' ? 'p-6 md:p-8' : 'p-5 md:p-6',
        className,
      )}
    >
      <div className={variant === 'full' ? 'mb-6' : 'mb-4'}>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-3 block">
          Search your stack
        </span>
        <h3
          className={cn(
            'font-display tracking-[-0.015em] text-balance',
            variant === 'full' ? 'text-2xl md:text-3xl mb-2' : 'text-xl md:text-2xl mb-2',
          )}
        >
          Get your tools talking to each other. Search it.
        </h3>
        <p className="text-sm text-graphite max-w-[520px]">
          CRMs, accounting, mortgage, legal, dental, real estate, and a few thousand more.
        </p>
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
          }}
          placeholder="Search any app — HubSpot, Clio, Dentrix…"
          className="w-full pl-10 pr-4 py-3 rounded-[4px] border border-obsidian/15 dark:border-bone/15 bg-bone dark:bg-obsidian text-obsidian dark:text-bone text-sm placeholder:text-graphite focus:outline-none focus:border-voltage transition-colors"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite mb-4">
        Searching {catalog.count.toLocaleString()} apps
      </p>

      {q.length >= 2 && results.length > 0 && (
        <ul className="mb-4 border border-obsidian/10 dark:border-bone/10 rounded-[4px] overflow-hidden divide-y divide-obsidian/8 dark:divide-bone/8">
          {results.map((app) => (
            <li key={app.slug + app.name}>
              <button
                type="button"
                onClick={() => setSelected(app)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors',
                  active?.name === app.name
                    ? 'bg-voltage/8 dark:bg-voltage/15'
                    : 'hover:bg-obsidian/[0.03] dark:hover:bg-bone/[0.04]',
                )}
              >
                <span className="font-medium truncate">{app.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-graphite shrink-0">
                  {app.category}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {active && (
        <div className="p-5 rounded-[4px] bg-voltage/[0.06] dark:bg-voltage/10 border border-voltage/20">
          <p className="text-sm text-graphite mb-1">We can connect</p>
          <p className="font-display text-xl md:text-2xl tracking-[-0.015em] mb-4">
            {active.name}
          </p>
          <p className="text-sm text-graphite mb-5 max-w-[480px]">
            Talk to us about connecting {active.name} to your CRM, accounting, booking software, or the rest of your stack.
          </p>
          <ContactButton
            message={`I'd like to connect ${active.name} to the rest of my tools.`}
            className="px-5 py-3 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90"
          />
        </div>
      )}

      {showEmpty && (
        <div className="p-5 rounded-[4px] border border-obsidian/10 dark:border-bone/10 bg-obsidian/[0.02] dark:bg-bone/[0.03]">
          <p className="font-display text-lg mb-2 tracking-[-0.015em]">
            Can’t find “{trimmed}”?
          </p>
          <p className="text-sm text-graphite mb-5 max-w-[480px]">
            We still connect custom and niche tools. Tell us what you use — we’ll connect it.
          </p>
          <ContactButton
            message={`I'd like to connect ${trimmed} to the rest of my tools.`}
            className="px-5 py-3 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90"
          />
        </div>
      )}
    </div>
  )
}
