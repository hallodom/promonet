import { Link } from 'react-router-dom'
import { LINKEDIN_URL } from '@/lib/seo'
import LinkedInIcon from '@/components/LinkedInIcon'
import LinkedInButton from '@/components/LinkedInButton'
import SpamProtectedEmail from '@/components/SpamProtectedEmail'
import { useLocale } from '@/i18n/LocaleContext'
import { homeHashPath } from '@/i18n/paths'

export default function Footer() {
  const { t, path, locale } = useLocale()

  return (
    <footer className="border-t border-obsidian/8 bg-bone">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 pt-20 pb-10">
        <div className="grid md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12 mb-16">
          <div>
            <Link to={path('home')} className="inline-block no-underline mb-6">
              <span className="font-display text-xl tracking-[-0.015em]">
                Promonet<span className="text-emergence">.</span>
              </span>
            </Link>
            <p className="font-display text-2xl md:text-[28px] leading-[1.15] max-w-[360px] tracking-[-0.015em]">
              {t('footer.tagline')}
            </p>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.linkedinAria')}
              className="inline-flex mt-6 text-obsidian hover:opacity-70 transition-opacity"
            >
              <LinkedInIcon size={22} />
            </a>
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-graphite mb-5">
              {t('footer.connect')}
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link
                to={path('connect')}
                className="text-graphite hover:text-obsidian transition-colors"
              >
                {t('footer.connectTools')}
              </Link>
              <Link
                to={path('connectCrm')}
                className="text-graphite hover:text-obsidian transition-colors"
              >
                {t('footer.connectCrm')}
              </Link>
              <Link
                to={path('pricing')}
                className="text-graphite hover:text-obsidian transition-colors"
              >
                {t('footer.pricing')}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-graphite mb-5">
              {t('footer.company')}
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link
                to={path('about')}
                className="text-graphite hover:text-obsidian transition-colors"
              >
                {t('footer.about')}
              </Link>
              <Link
                to={homeHashPath('how', locale)}
                className="text-graphite hover:text-obsidian transition-colors"
              >
                {t('footer.how')}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-graphite mb-5">
              {t('footer.contact')}
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <SpamProtectedEmail className="text-left text-graphite hover:text-obsidian transition-colors" />
              <LinkedInButton className="self-start px-4 py-2.5 rounded-[4px] bg-obsidian text-bone hover:bg-obsidian/90" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-obsidian/8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono text-graphite">
          <span>© {new Date().getFullYear()} Promonet</span>
          <span>{t('footer.fixedPrice')}</span>
        </div>
      </div>
    </footer>
  )
}
