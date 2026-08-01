import { Link } from 'react-router-dom'

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
              Your software, finally talking to each other.
            </p>
          </div>

          {[
            { title: 'Practice', links: ['Integration', 'Automation', 'Observability', 'Architecture'] },
            { title: 'Company', links: ['About', 'Engineers', 'Journal', 'Careers'] },
            { title: 'Contact', links: ['hello@promonet.io', '+44 (0)20 0000 0000', 'LinkedIn'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-graphite mb-5">
                {col.title}
              </h4>
              <div className="flex flex-col gap-3 text-sm">
                {col.links.map((link) => (
                  <a
                    key={link}
                    href={link.includes('@') ? `mailto:${link}` : '#'}
                    className="text-graphite hover:text-obsidian dark:hover:text-bone transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-obsidian/8 dark:border-bone/8 flex flex-col sm:flex-row gap-3 justify-between text-[11px] font-mono uppercase tracking-[0.14em] text-graphite">
          <span>&copy; 2026 Promonet Ltd</span>
          <span>24-hour response, every time</span>
        </div>
      </div>
    </footer>
  )
}
