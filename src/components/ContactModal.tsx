import { useEffect, useId, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { CONTACT_EMAIL, useContact } from '@/lib/contact'
import { useT } from '@/i18n/LocaleContext'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactModal() {
  const { open, closeContact, defaultMessage } = useContact()
  const t = useT()
  const titleId = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setEmail('')
    setCompany('')
    setMessage(defaultMessage || t('contact.defaultMessage'))
    setStatus('idle')
    setError('')
  }, [open, defaultMessage, t])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContact()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, closeContact])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !company.trim() || !message.trim()) {
      setError(t('contact.fillAll'))
      setStatus('error')
      return
    }

    setStatus('sending')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          message: message.trim(),
        }),
      })

      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        throw new Error(data.error || t('contact.sendFailed'))
      }

      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : t('contact.sendFailed'))
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        aria-label={t('contact.closeForm')}
        className="absolute inset-0 bg-obsidian/55 backdrop-blur-sm"
        onClick={closeContact}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full sm:max-w-[520px] max-h-[92vh] overflow-y-auto bg-bone text-obsidian rounded-t-[8px] sm:rounded-[4px] shadow-[0_30px_80px_-20px_rgba(10,10,15,0.45)] border border-obsidian/10"
      >
        <div className="flex items-start justify-between gap-4 px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-obsidian/8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltage mb-2">
              {t('contact.eyebrow')}
            </p>
            <h2 id={titleId} className="font-display text-2xl md:text-3xl tracking-[-0.02em]">
              {t('contact.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeContact}
            className="p-2 -mr-2 rounded-[4px] text-graphite hover:text-obsidian hover:bg-obsidian/5 transition-colors"
            aria-label={t('contact.close')}
          >
            <X size={18} />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="px-6 md:px-8 py-10">
            <p className="font-display text-2xl tracking-[-0.02em] mb-3">{t('contact.sentTitle')}</p>
            <p className="text-graphite mb-8">
              {t('contact.sentBody', { email: email || 'email' })}
            </p>
            <button
              type="button"
              onClick={closeContact}
              className="inline-flex items-center justify-center font-sans font-semibold text-sm tracking-[0.02em] px-6 py-3.5 rounded-[4px] bg-voltage text-bone hover:bg-voltage/90 transition-colors"
            >
              {t('contact.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="px-6 md:px-8 py-6 md:py-8 space-y-5">
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite mb-2 block">
                {t('contact.name')}
              </span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[4px] border border-obsidian/15 bg-bone px-4 py-3 text-sm outline-none focus:border-voltage transition-colors"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite mb-2 block">
                {t('contact.email')}
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[4px] border border-obsidian/15 bg-bone px-4 py-3 text-sm outline-none focus:border-voltage transition-colors"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite mb-2 block">
                {t('contact.company')}
              </span>
              <input
                type="text"
                name="company"
                autoComplete="organization"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-[4px] border border-obsidian/15 bg-bone px-4 py-3 text-sm outline-none focus:border-voltage transition-colors"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite mb-2 block">
                {t('contact.messageLabel')}
              </span>
              <textarea
                name="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-[4px] border border-obsidian/15 bg-bone px-4 py-3 text-sm outline-none focus:border-voltage transition-colors resize-y min-h-[120px]"
              />
            </label>

            {status === 'error' && error && (
              <p className="text-sm text-emergence">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full inline-flex items-center justify-center font-sans font-semibold text-sm tracking-[0.02em] py-3.5 rounded-[4px] bg-voltage text-bone hover:bg-voltage/90 disabled:opacity-60 transition-colors"
            >
              {status === 'sending' ? t('contact.sending') : t('contact.send')}
            </button>

            <p className="text-xs font-mono text-graphite text-center">
              {t('contact.sendsTo', { email: CONTACT_EMAIL })}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
