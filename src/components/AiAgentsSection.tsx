import { Bot, Megaphone, Send, PenLine } from 'lucide-react'
import ContactButton from '@/components/ContactButton'
import { useT } from '@/i18n/LocaleContext'

const roles = [
  { key: 'social', icon: Megaphone },
  { key: 'sales', icon: Send },
  { key: 'content', icon: PenLine },
] as const

export default function AiAgentsSection() {
  const t = useT()

  return (
    <section id="ai-agents" aria-labelledby="ai-agents-title" className="py-24 md:py-32 bg-obsidian text-bone">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-24 items-center">
        <div className="reveal">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-bone/70 mb-8 flex items-center gap-3">
            <span className="w-6 h-px bg-bone/50" />
            {t('aiAgents.eyebrow')}
          </div>
          <h2 id="ai-agents-title" className="font-display text-[clamp(36px,5vw,60px)] leading-[1.05] tracking-[-0.02em] mb-6 text-balance">
            {t('aiAgents.title')}
          </h2>
          <p className="text-lg leading-relaxed text-bone/80 mb-5">
            {t('aiAgents.intro')}
          </p>
          <p className="leading-relaxed text-bone/70 mb-8">
            {t('aiAgents.body')}
          </p>
          <ContactButton
            message={t('aiAgents.contactMessage')}
            className="px-6 py-3.5 bg-bone text-obsidian rounded-[4px] hover:bg-bone/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bone"
          >
            {t('aiAgents.cta')}
          </ContactButton>
        </div>

        <div className="reveal rounded-[4px] border border-bone/20 overflow-hidden" style={{ transitionDelay: '100ms' }}>
          <div className="flex items-center gap-3 px-6 py-5 border-b border-bone/15">
            <Bot size={20} aria-hidden="true" className="text-bone/70 shrink-0" />
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]">{t('aiAgents.rolesLabel')}</p>
          </div>
          <ul className="divide-y divide-bone/15">
            {roles.map(({ key, icon: Icon }) => (
              <li key={key} className="flex gap-4 p-6 md:p-7">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-bone/10">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-xl mb-2">{t(`aiAgents.${key}Title`)}</h3>
                  <p className="text-sm leading-relaxed text-bone/70">{t(`aiAgents.${key}Body`)}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="px-6 py-5 border-t border-bone/15 text-sm leading-relaxed text-bone/70">
            {t('aiAgents.note')}
          </p>
        </div>
      </div>
    </section>
  )
}
