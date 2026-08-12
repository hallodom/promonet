import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import ContactButton from './ContactButton'
import LanguageSwitcher from './LanguageSwitcher'
import { useLocale } from '@/i18n/LocaleContext'
import { homeHashPath } from '@/i18n/paths'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { t, path, locale } = useLocale()

  const navLinks = [
    { to: homeHashPath('how', locale), label: t('nav.how') },
    { to: path('connect'), label: t('nav.connect') },
    { to: path('connectCrm'), label: t('nav.connectCrm') },
    { to: path('pricing'), label: t('nav.pricing') },
    { to: path('about'), label: t('nav.about') },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`sticky top-0 z-50 bg-bone/80  backdrop-blur-xl text-obsidian  border-b transition-colors duration-300 ${
        scrolled
          ? 'border-obsidian/8 '
          : 'border-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to={path('home')} className="no-underline shrink-0">
          <span className="font-display text-xl tracking-[-0.015em]">
            Promonet<span className="text-emergence">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="px-3 py-2 rounded-md text-graphite hover:text-obsidian hover:bg-obsidian/5 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <ContactButton
            showArrow={false}
            className="hidden sm:inline-flex items-center font-semibold text-[13px] tracking-[0.02em] px-4 py-2.5 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90"
          />
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-md hover:bg-obsidian/5 transition-colors"
            aria-label={t('nav.menu')}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-obsidian/8 bg-bone">
          <nav className="px-6 py-6 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="px-3 py-3 rounded-md text-base text-graphite hover:text-obsidian hover:bg-obsidian/5 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="px-3 py-3">
              <LanguageSwitcher />
            </div>
            <ContactButton className="mt-3 w-full px-4 py-3 bg-voltage text-bone rounded-[4px] hover:bg-voltage/90" />
          </nav>
        </div>
      )}
    </header>
  )
}
