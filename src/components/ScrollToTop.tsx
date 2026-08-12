import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { localeFromPathname } from '@/i18n/locales'
import { toLocalePath } from '@/i18n/paths'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    const prev = prevPathname.current
    prevPathname.current = pathname

    if (hash) {
      const id = decodeURIComponent(hash.replace(/^#/, ''))
      const scrollToHash = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return true
        }
        return false
      }

      if (scrollToHash()) return

      // Section may not be mounted yet on first paint
      const t = window.setTimeout(scrollToHash, 50)
      return () => window.clearTimeout(t)
    }

    // Locale switch between equivalent pages — keep scroll so pricing
    // cards (and other reveals) aren't mid-animation when the observer rebinds.
    const nextLocale = localeFromPathname(pathname)
    if (prev !== pathname && toLocalePath(prev, nextLocale) === pathname) {
      return
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
