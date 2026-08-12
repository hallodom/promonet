import { useNavigate, useLocation } from 'react-router-dom'
import { useLocale } from '@/i18n/LocaleContext'
import { LOCALE_META, type Locale } from '@/i18n/locales'
import { toLocalePath } from '@/i18n/paths'
import { cn } from '@/lib/cn'

type Props = {
  className?: string
}

export default function LanguageSwitcher({ className }: Props) {
  const { locale } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()

  function switchTo(target: Locale) {
    if (target === locale) return
    const next = toLocalePath(location.pathname + location.hash, target)
    navigate(next)
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em]',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {(['en', 'es'] as const).map((code, i) => (
        <span key={code} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-graphite/40" aria-hidden>|</span>}
          <button
            type="button"
            onClick={() => switchTo(code)}
            aria-pressed={locale === code}
            aria-label={code === 'en' ? 'Switch to English' : 'Cambiar a español'}
            className={cn(
              'px-1.5 py-1 rounded-[2px] transition-colors',
              locale === code
                ? 'text-obsidian font-semibold'
                : 'text-graphite hover:text-obsidian',
            )}
          >
            {LOCALE_META[code].label}
          </button>
        </span>
      ))}
    </div>
  )
}
