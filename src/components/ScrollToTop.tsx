import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
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

    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
