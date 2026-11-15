import { Link, Outlet, useLocation } from 'react-router-dom'
import campaigns from '@/data/campaigns.json'
import '@/campaigns.css'
import Nav from './Nav'
import Footer from './Footer'
import ContactModal from './ContactModal'
import ScrollToTop from './ScrollToTop'
import CookieConsent from './CookieConsent'
import { ContactProvider } from '@/lib/contact'
import { LocaleProvider } from '@/i18n/LocaleContext'

export default function Layout() {
  const { pathname } = useLocation()
  const campaign = Object.values(campaigns).some((item) => item.path === pathname.replace(/\/$/, ''))
  return (
    <LocaleProvider>
      <ContactProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans">
          {campaign ? <header className="campaign-shell campaign-header"><Link to="/" className="campaign-wordmark" aria-label="Promonet home">promonet<span>.</span></Link><a href="#request-call">Let’s talk →</a></header> : <Nav />}
          <main className="flex-1">
            <Outlet />
          </main>
          {campaign ? <footer className="campaign-shell campaign-footer"><span>Promonet Consulting · Small business helping small businesses.</span><Link to="/about">Meet the team →</Link></footer> : <Footer />}
          {!campaign && <ContactModal />}
          <CookieConsent />
        </div>
      </ContactProvider>
    </LocaleProvider>
  )
}
