import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import type { Campaign } from '@/data/campaigns'

const field = 'w-full rounded-[4px] border border-obsidian/20 bg-white px-4 py-3 text-[15px] outline-none focus:border-voltage transition-colors'
const label = 'font-mono text-[11px] uppercase tracking-[0.14em] text-graphite mb-2 block'

/**
 * Campaign sign-up. Posts to the existing /api/contact endpoint, folding the campaign,
 * website/tools, task and UTM source into the message so enquiries are attributable.
 */
export default function CampaignForm({ campaign }: { campaign: Campaign }) {
  const { search, pathname } = useLocation()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const busy = useRef(false)
  const f = campaign.form

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy.current) return
    busy.current = true
    setStatus('sending')
    setError('')
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const utm = new URLSearchParams(search)
    const source = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map((k) => utm.get(k)).filter(Boolean).join(' / ')
    const message = [
      `Campaign: ${campaign.id} (${pathname})`,
      `${f.detailLabel}: ${data.detail}`,
      data.task ? `${f.taskLabel}: ${data.task}` : '',
      `Source: ${source || 'direct'}`,
    ].filter(Boolean).join('\n')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, company: data.company, message }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) throw new Error(typeof json.error === 'string' && res.status === 400 ? json.error : '')
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError((err instanceof Error && err.message) || 'We couldn’t send that just now. Your details are still here, so please try again, or email hello@promonetconsulting.com.')
    } finally {
      busy.current = false
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-[8px] bg-white border border-obsidian/10 p-8 shadow-[0_24px_50px_rgba(10,10,15,0.08)]">
        <CheckCircle2 className="text-imago mb-5" size={40} aria-hidden="true" />
        <h3 className="font-display text-2xl mb-3">Thanks, we’ve got it.</h3>
        <p className="text-graphite leading-relaxed">We’ll email you within one working day to arrange your free 30-minute call.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} aria-label={f.submit} className="rounded-[8px] bg-white border border-obsidian/10 p-6 md:p-8 space-y-5 shadow-[0_24px_50px_rgba(10,10,15,0.08)]">
      <div className="grid sm:grid-cols-2 gap-5">
        <label className="block"><span className={label}>Your name</span><input className={field} name="name" autoComplete="name" required maxLength={120} /></label>
        <label className="block"><span className={label}>Email</span><input className={field} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      </div>
      <label className="block"><span className={label}>Business name</span><input className={field} name="company" autoComplete="organization" required maxLength={200} /></label>
      <label className="block">
        <span className={label}>{f.detailLabel}</span>
        <input className={field} name="detail" required maxLength={500} placeholder={f.detailPlaceholder} aria-describedby={`${campaign.id}-hint`} />
        <span id={`${campaign.id}-hint`} className="block text-xs text-graphite mt-2">{f.detailHint}</span>
      </label>
      {f.taskLabel && (
        <label className="block"><span className={label}>{f.taskLabel}</span><textarea className={`${field} resize-y min-h-[96px]`} name="task" required rows={3} maxLength={2000} placeholder={f.taskPlaceholder} /></label>
      )}
      {status === 'error' && <p role="alert" className="text-sm text-emergence">{error}</p>}
      <button type="submit" disabled={status === 'sending'} className="w-full inline-flex items-center justify-center gap-3 font-semibold text-[15px] py-4 rounded-full bg-voltage text-bone hover:bg-voltage/90 disabled:opacity-60 transition-colors">
        {status === 'sending' ? 'Sending…' : f.submit}<ArrowRight size={18} aria-hidden="true" />
      </button>
      <p className="text-xs text-graphite text-center">No payment details. No obligation. We’ll only use this to arrange your call.</p>
    </form>
  )
}
