import { Link } from 'react-router-dom'
import { LINKEDIN_URL } from '@/lib/seo'
import LinkedInIcon from '@/components/LinkedInIcon'
import LinkedInButton from '@/components/LinkedInButton'
import SpamProtectedEmail from '@/components/SpamProtectedEmail'

export default function Footer() {
  return (
    <footer className="border-t border-obsidian/8 dark:border-bone/8 bg-bone dark:bg-obsidian">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-20 pb-10">
        <div className="grid md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12 mb-16">
          <div>
            <Link to="/" className="inline-block no-underline mb-6">
              <span className="font-display text-xl tracking-[-0.015em]">
                Promonet<span className="text-emergence">.</span>
              </span>
            </Link>
            <p className="font-display text-2xl md:text-[28px] leading-[1.15] max-w-[360px] tracking-[-0.015em]">
              CRM and tool integrations for small businesses.
            </p>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Promonet on LinkedIn"
              className="inline-flex mt-6 text-obsidian hover:opacity-70 dark:text-bone transition-opacity"
            >
              <LinkedInIcon size={22} />
            </a>
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-graphite mb-5">
              Connect
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link
                to="/connect"
                className="text-graphite hover:text-obsidian dark:hover:text-bone transition-colors"
              >
                Connect tools
              </Link>
              <Link
                to="/connect/crm"
                className="text-graphite hover:text-obsidian dark:hover:text-bone transition-colors"
              >
                Connect your CRM
              </Link>
              <Link
                to="/pricing"
                className="text-graphite hover:text-obsidian dark:hover:text-bone transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-graphite mb-5">
              Company
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link
                to="/about"
                className="text-graphite hover:text-obsidian dark:hover:text-bone transition-colors"
              >
                About
              </Link>
              <Link
                to="/#how"
                className="text-graphite hover:text-obsidian dark:hover:text-bone transition-colors"
              >
                How it works
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-graphite mb-5">
              Contact
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <SpamProtectedEmail className="text-left text-graphite hover:text-obsidian dark:hover:text-bone transition-colors" />
              <LinkedInButton className="self-start px-4 py-2.5 rounded-[4px] bg-obsidian text-bone hover:bg-obsidian/90 dark:bg-bone dark:text-obsidian dark:hover:bg-bone/90" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-obsidian/8 dark:border-bone/8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono text-graphite">
          <span>© {new Date().getFullYear()} Promonet</span>
          <span>Fixed-price CRM &amp; tool integrations</span>
        </div>
      </div>
    </footer>
  )
}
