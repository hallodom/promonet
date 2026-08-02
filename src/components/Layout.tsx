import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import Footer from './Footer'
import ContactModal from './ContactModal'
import ScrollToTop from './ScrollToTop'
import { ContactProvider } from '@/lib/contact'

export default function Layout() {
  return (
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
  )
}
