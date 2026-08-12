import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowDownAZ, LayoutGrid } from 'lucide-react'
import catalog from '@/data/apps.json'
import { cn } from '@/lib/cn'
import ContactButton from '@/components/ContactButton'
import ProductLink from '@/components/ProductLink'
import { useLocale } from '@/i18n/LocaleContext'

type AppEntry = {
  name: string
  slug: string
  category: string
  aliases: string[]
  website?: string
}

type ViewMode = 'category' | 'az'

const ALL = '__all__'
const apps = catalog.apps as AppEntry[]

function displayCategory(category: string) {
  if (category.toLowerCase() === 'crm') return 'CRM'
  return category
}

function letterFor(name: string) {
  const ch = name.trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(ch) ? ch : '#'
}

export default function AppCatalog() {
  const { t, locale } = useLocale()
  const [view, setView] = useState<ViewMode>('category')
  const [category, setCategory] = useState(ALL)
  const [selected, setSelected] = useState<AppEntry | null>(null)
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-GB'

  const categories = useMemo(() => {
    const set = new Set(apps.map((a) => displayCategory(a.category)).filter(Boolean))
    return [ALL, ...[...set].sort((a, b) => a.localeCompare(b, numberLocale))]
  }, [numberLocale])

  const filtered = useMemo(() => {
    const base =
      view === 'az' || category === ALL
        ? apps
        : apps.filter((a) => displayCategory(a.category) === category)

    if (view !== 'az') return base
    return [...base].sort((a, b) =>
      a.name.localeCompare(b.name, numberLocale, { sensitivity: 'base' }),
    )
  }, [category, view, numberLocale])

  const azGroups = useMemo(() => {
    if (view !== 'az') return []
    const map = new Map<string, AppEntry[]>()
    for (const app of filtered) {
      const letter = letterFor(app.name)
      const list = map.get(letter)
      if (list) list.push(app)
      else map.set(letter, [app])
    }
    return [...map.entries()].sort((a, b) => {
      if (a[0] === '#') return 1
      if (b[0] === '#') return -1
      return a[0].localeCompare(b[0])
    })
  }, [filtered, view])

  useEffect(() => {
    if (!selected) return
    document.getElementById('catalog-cta')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selected])

  return (
    <div>
      <div className="flex items-center justify-end gap-1 mb-4">
        <ViewTooltip label={t('appCatalog.byCategory')}>
          <button
            type="button"
            onClick={() => {
              setView('category')
              setSelected(null)
            }}
            aria-label={t('appCatalog.viewCategory')}
            aria-pressed={view === 'category'}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-[4px] border transition-colors',
              view === 'category'
                ? 'border-voltage bg-voltage text-bone'
                : 'border-obsidian/10 text-graphite hover:border-voltage hover:text-voltage',
            )}
          >
            <LayoutGrid size={16} strokeWidth={1.75} />
          </button>
        </ViewTooltip>
        <ViewTooltip label={t('appCatalog.byAz')}>
          <button
            type="button"
            onClick={() => {
              setView('az')
              setCategory(ALL)
              setSelected(null)
            }}
            aria-label={t('appCatalog.viewAz')}
            aria-pressed={view === 'az'}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-[4px] border transition-colors',
              view === 'az'
                ? 'border-voltage bg-voltage text-bone'
                : 'border-obsidian/10 text-graphite hover:border-voltage hover:text-voltage',
            )}
          >
            <ArrowDownAZ size={16} strokeWidth={1.75} />
          </button>
        </ViewTooltip>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-3 block">
            {t('appCatalog.eyebrow')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em]">
            {view === 'az' ? t('appCatalog.titleAz') : t('appCatalog.titleCategory')}
          </h2>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
          {t('appCatalog.count', {
            filtered: filtered.length.toLocaleString(numberLocale),
            total: catalog.count.toLocaleString(numberLocale),
          })}
        </p>
      </div>

      {view === 'category' && (
        <div className="sticky top-20 z-20 -mx-2 px-2 py-3 mb-8 bg-bone/90 backdrop-blur-xl border-b border-obsidian/8">
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
                    : 'border border-obsidian/10 text-graphite hover:border-voltage hover:text-voltage',
                )}
              >
                {cat === ALL ? t('common.all') : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'az' && (
        <div className="sticky top-20 z-20 -mx-2 px-2 py-3 mb-8 bg-bone/90 backdrop-blur-xl border-b border-obsidian/8">
          <div className="flex flex-wrap gap-1.5">
            {azGroups.map(([letter]) => (
              <a
                key={letter}
                href={`#az-${letter === '#' ? 'other' : letter}`}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-[4px] border border-obsidian/10 px-2 font-mono text-xs text-graphite hover:border-voltage hover:text-voltage transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div
          id="catalog-cta"
          className="mb-8 p-5 rounded-[4px] bg-voltage/[0.06] border border-voltage/20"
        >
          <p className="text-sm text-graphite mb-1">{t('appCatalog.weCanConnect')}</p>
          <p className="font-display text-xl md:text-2xl tracking-[-0.015em] mb-4">
            <ProductLink name={selected.name}>{selected.name}</ProductLink>
          </p>
          <p className="text-sm text-graphite mb-5 max-w-[480px]">
            {t('appCatalog.talkAbout', { name: selected.name })}
          </p>
          <ContactButton
            message={t('appCatalog.message', { name: selected.name })}
            className="px-5 py-3 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90"
          />
        </div>
      )}

      {view === 'category' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((app) => (
            <AppCard
              key={`${app.slug}-${app.name}`}
              app={app}
              selected={selected?.name === app.name}
              onSelect={() => setSelected(app)}
              askLabel={t('appCatalog.askAbout', { name: app.name })}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {azGroups.map(([letter, letterApps]) => (
            <section key={letter} id={`az-${letter === '#' ? 'other' : letter}`}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-4 sticky top-32 bg-bone/90 backdrop-blur-xl py-2 border-b border-obsidian/8">
                {letter}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {letterApps.map((app) => (
                  <AppCard
                    key={`${app.slug}-${app.name}`}
                    app={app}
                    selected={selected?.name === app.name}
                    onSelect={() => setSelected(app)}
                    askLabel={t('appCatalog.askAbout', { name: app.name })}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function ViewTooltip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2',
          'whitespace-nowrap rounded-[4px] bg-obsidian px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone',
          'opacity-0 translate-y-1 scale-95',
          'transition-all duration-200 ease-out',
          'group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100',
          'group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100',
        )}
      >
        {label}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-obsidian"
        />
      </span>
    </div>
  )
}

function AppCard({
  app,
  selected,
  onSelect,
  askLabel,
}: {
  app: AppEntry
  selected: boolean
  onSelect: () => void
  askLabel: string
}) {
  return (
    <div
      className={cn(
        'group relative text-left p-4 rounded-[4px] border transition-colors',
        selected
          ? 'border-voltage bg-voltage/[0.06]'
          : 'border-obsidian/10 bg-bone hover:border-voltage/50',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="absolute inset-0 rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voltage"
        aria-label={askLabel}
      />
      <div className="relative z-10 w-fit max-w-full font-medium text-sm mb-1 truncate">
        <ProductLink name={app.name} className="relative">
          {app.name}
        </ProductLink>
      </div>
      <div className="relative pointer-events-none font-mono text-[10px] uppercase tracking-wider text-graphite truncate">
        {displayCategory(app.category)}
      </div>
    </div>
  )
}
