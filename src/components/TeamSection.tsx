import { useT } from '@/i18n/LocaleContext'

export default function TeamSection() {
  const t = useT()

  return (
    <section id="team" className="py-28 md:py-40 hairline-b">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-20 items-center">
          <div className="reveal order-2 lg:order-1">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[4px]">
              <img
                src="/team-office.jpg"
                alt={t('team.imageAlt')}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          </div>

          <div className="reveal order-1 lg:order-2" style={{ transitionDelay: '80ms' }}>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-voltage" />
              {t('team.eyebrow')}
            </div>
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-[-0.02em] mb-6 text-balance">
              {t('team.title')}
            </h2>
            <p className="text-lg leading-relaxed text-graphite mb-5 max-w-[480px]">
              {t('team.p1')}
            </p>
            <p className="text-lg leading-relaxed text-graphite max-w-[480px]">
              {t('team.p2Before')}
              <strong className="font-semibold text-obsidian">{t('team.p2Strong')}</strong>
              {t('team.p2After')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
