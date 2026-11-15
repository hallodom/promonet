import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export type CampaignId = 'ai_ready' | 'connect_tools'

export default function CampaignForm({ campaign }: { campaign: CampaignId }) {
  const { search, pathname } = useLocation()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const ai = campaign === 'ai_ready'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    submitting.current = true
    setStatus('sending')
    setError('')
    const fields = Object.fromEntries(new FormData(form))
    const params = new URLSearchParams(search)
    const utm = Object.fromEntries(
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
        .map((key) => [key, (params.get(key) || '').slice(0, 200)]),
    )
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ ...fields, campaign, landingPage: pathname, utm }),
      })
      const result = await response.json().catch(() => ({}))
      if (response.status === 400 && typeof result.error === 'string') {
        setStatus('error')
        setError(result.error)
        return
      }
      if (!response.ok || result.ok !== true) throw new Error('send-failed')
      setStatus('sent')
    } catch {
      setStatus('error')
      setError('We couldn’t confirm your request. Your details are still here—please try again, or email hello@promonetconsulting.com.')
    } finally {
      window.clearTimeout(timeout)
      submitting.current = false
    }
  }

  if (status === 'sent') return (
    <div className="campaign-form campaign-success" role="status" aria-live="polite">
      <CheckCircle2 size={40} aria-hidden="true" />
      <h3>Thanks. Let’s find a time to talk.</h3>
      <p>Your request has been received. We’ll email you to arrange your free 30-minute call. A time hasn’t been booked yet.</p>
    </div>
  )

  return (
    <form className="campaign-form" onSubmit={submit} aria-label={ai ? 'Request an AI evaluation' : 'Request a connection call'} aria-busy={status === 'sending'}>
      <div className="campaign-form-row">
        <label>Your name<input name="name" autoComplete="name" required maxLength={120} /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      </div>
      <label>Business name<input name="company" autoComplete="organization" required maxLength={200} /></label>
      {ai ? (
        <label>Website address<input name="website" type="text" inputMode="url" autoComplete="url" placeholder="yourbusiness.co.uk" required maxLength={2048} aria-describedby="website-hint" /><span id="website-hint" className="campaign-field-hint">The public website you’d like us to review.</span></label>
      ) : (<>
        <label>Which tools would you like to connect?<input name="tools" placeholder="For example, your enquiry form and CRM" required maxLength={500} /></label>
        <label>What are you copying or doing repeatedly?<textarea name="message" placeholder="Tell us a little about the task you’d like to simplify." rows={3} required maxLength={5000} /></label>
      </>)}
      <p className="campaign-field-hint">We’ll use these details to respond to your enquiry and arrange your call. This form does not subscribe you to marketing emails.</p>
      {error && <p className="campaign-error" role="alert">{error}</p>}
      <button className="campaign-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending your request…' : 'Request my free 30-minute call'}<ArrowRight size={18} aria-hidden="true" /></button>
      <p className="campaign-form-note">No payment details. No obligation. Just a useful conversation.</p>
    </form>
  )
}
