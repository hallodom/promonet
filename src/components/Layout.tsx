import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import Footer from './Footer'
import ContactModal from './ContactModal'
import ScrollToTop from './ScrollToTop'
import { ContactProvider } from '@/lib/contact'
import { LocaleProvider } from '@/i18n/LocaleContext'

export default function Layout() {
  return (
    <LocaleProvider>
      <ContactProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans">
          <Nav />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <ContactModal />
        </div>
      </ContactProvider>
    </LocaleProvider>
  )
}
