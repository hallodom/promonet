import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BadgeCheck, Bot, BookOpenText, Check, Clock3, Contact, DoorOpen, Mail, Sheet, Volume2, VolumeX, Workflow, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import campaigns from '@/data/campaigns.json'
import CampaignForm, { type CampaignId } from '@/components/CampaignForm'
import Seo from '@/components/Seo'
import { absoluteUrl, faqJsonLd } from '@/lib/seo'
import '@/campaigns.css'

const MEDIA = '/campaigns/v2'

// The landing page mirrors the reel beat-for-beat: hook → problem → what we do → real people → offer → sign-up.
const COPY = {
  ai_ready: {
    icon: Bot,
    problemImage: 'a2', problemAlt: 'Illustrative bike workshop owner frowning slightly at her website on a laptop',
    solutionEyebrow: '02 / What we check on your call',
    peopleImage: 'a4', peopleAlt: 'Illustrative Promonet consultant waving hello on a video call from a home office',
    peopleTitle: 'Real people. Plain English.',
    formImage: 'a6', formAlt: 'Illustrative bike workshop owner smiling in the doorway of her shop',
    formTitle: 'Book your free AI evaluation call.',
    formBody: 'Share your website and we’ll arrange a time to look at it together. You’ll leave with a clearer picture, and three practical next steps by email.',
  },
  connect_tools: {
    icon: Workflow,
    problemImage: 'b1', problemAlt: 'Illustrative garden designer at a desk covered in sticky notes, rubbing his forehead',
    solutionEyebrow: '02 / How we fix it',
    peopleImage: 'b5', peopleAlt: 'Illustrative Promonet developer and a garden designer working side by side at a laptop',
    peopleTitle: 'Real humans. Hands-on. Direct with you.',
    formImage: 'b6', formAlt: 'Illustrative garden designer relaxing with a cup of tea in a client’s garden',
    formTitle: 'Tell us what you’re tired of copying.',
    formBody: 'Share your tools and the task. We’ll arrange a time to explore what’s possible and whether a simple connection could help, then send a fixed quote before you commit.',
  },
} as const

function ReelPlayer({ campaign, label }: { campaign: CampaignId; label: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const v = video.current
    if (!v || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [])

  function toggleSound() {
    const v = video.current
    if (!v) return
    if (muted || !playing) {
      v.muted = false
      v.currentTime = 0
      v.play().then(() => setPlaying(true)).catch(() => {})
      setMuted(false)
    } else {
      v.muted = true
      setMuted(true)
    }
  }

  return (
    <figure className="cv-reel">
      <div className="cv-phone">
        <video ref={video} muted loop playsInline preload="metadata" poster={`${MEDIA}/${campaign}-poster.jpg`} aria-label={label} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
          <source src={`${MEDIA}/${campaign}-reel.mp4`} type="video/mp4" />
          <track kind="captions" src={`${MEDIA}/${campaign}.vtt`} srcLang="en" label="English" />
        </video>
        <button type="button" className="cv-sound" onClick={toggleSound} aria-pressed={!muted}>
          {muted || !playing ? <><Volume2 size={18} aria-hidden="true" />Play with sound</> : <><VolumeX size={18} aria-hidden="true" />Mute</>}
        </button>
      </div>
      <figcaption>Illustrative scenes. People shown are AI-generated.</figcaption>
    </figure>
  )
}

function ChatMock() {
  return (
    <div className="cv-chat" aria-hidden="true">
      <p className="cv-chat-head"><span className="cv-dot" />AI assistant</p>
      <p className="cv-chat-q">Can you recommend a bike repair shop near me?</p>
      <p className="cv-chat-a">Here are three well-reviewed options nearby:</p>
      {[0, 1, 2].map((i) => <span key={i} className="cv-chat-row"><i /><b style={{ width: `${46 - i * 6}%` }} /><em>★★★★★</em></span>)}
      <p className="cv-chat-miss">Your business isn’t mentioned</p>
    </div>
  )
}

function ToolsDiagram({ connected }: { connected: boolean }) {
  const tools = [['Inbox', Mail], ['Spreadsheet', Sheet], ['CRM', Contact]] as const
  return (
    <div className={`cv-tools${connected ? ' is-connected' : ''}`} aria-hidden="true">
      <div className="cv-tools-row">
        {tools.map(([label, Icon], i) => (
          <div key={label} className="cv-tool-wrap">
            {i > 0 && <span className="cv-link">{!connected && <X size={18} />}</span>}
            <div className="cv-tool">{connected && <span className="cv-tool-tick"><Check size={14} /></span>}<Icon size={30} strokeWidth={1.8} /><span>{label}</span></div>
          </div>
        ))}
      </div>
      <p className={connected ? 'cv-badge-ok' : 'cv-badge-warn'}>{connected ? 'Connected · runs on its own' : 'You become the connection'}</p>
    </div>
  )
}

export default function Campaign({ campaign }: { campaign: CampaignId }) {
  const data = campaigns[campaign]
  const copy = COPY[campaign]
  const ai = campaign === 'ai_ready'
  const Icon = copy.icon
  const cta = (label = data.cta) => <a className="campaign-button" href="#request-call">{label}<ArrowRight size={18} aria-hidden="true" /></a>
  const img = (name: string, alt: string, eager = false) => <img src={`${MEDIA}/${name}.jpg`} alt={alt} width="860" height="1520" loading={eager ? 'eager' : 'lazy'} decoding="async" />
  const checks = [DoorOpen, BookOpenText, BadgeCheck]

  return (
    <div className="campaign-page">
      <Seo title={data.title} description={data.description} path={data.path} image={absoluteUrl(`${MEDIA}/${campaign}-og.jpg`)} imageAlt={data.imageAlt} jsonLd={[faqJsonLd(data.faqs)]} />

      <section className="cv-hero">
        <div className="campaign-shell cv-hero-grid">
          <div className="cv-hero-copy">
            <p className="campaign-eyebrow"><Icon size={16} aria-hidden="true" />{data.eyebrow}</p>
            <h1>{data.headline}</h1>
            <p className="cv-lead">{data.intro}</p>
            <div className="cv-actions">{cta()}<a className="cv-text-link" href="#how-it-works">How it works</a></div>
            <p className="campaign-offer-label">{data.offerLabel}</p>
            <ul className="cv-proof">
              <li><strong>20+ years</strong>building CRM solutions</li>
              <li><strong>Direct access</strong>to the people doing the work</li>
              <li><strong>Small business</strong>helping small businesses</li>
            </ul>
          </div>
          <ReelPlayer campaign={campaign} label={data.reelAlt} />
        </div>
      </section>

      <section className="campaign-shell campaign-section cv-split cv-problem">
        <figure className="cv-photo">{img(copy.problemImage, copy.problemAlt)}</figure>
        <div>
          <p className="campaign-eyebrow">01 / The problem</p>
          <h2>{data.problemTitle}</h2>
          <p className="campaign-prose">{data.problemBody}</p>
          {ai ? <ChatMock /> : <ToolsDiagram connected={false} />}
        </div>
      </section>

      <section id="how-it-works" className="cv-band">
        <div className="campaign-shell campaign-section">
          <div className="cv-section-head">
            <p className="campaign-eyebrow">{copy.solutionEyebrow}</p>
            <h2>{ai ? data.offerTitle : 'We connect them, so the work flows on its own.'}</h2>
            <p className="campaign-prose">{data.offerBody}</p>
          </div>
          {!ai && <ToolsDiagram connected />}
          <div className="campaign-benefits">
            {data.benefits.map((benefit, i) => {
              const BIcon = ai ? checks[i] : null
              return <article key={benefit.title}>{BIcon ? <BIcon size={26} className="cv-benefit-icon" aria-hidden="true" /> : <span className="campaign-step-number">0{i + 1}</span>}<h3>{benefit.title}</h3><p>{benefit.body}</p></article>
            })}
          </div>
          {ai ? (
            <div className="cv-offer-card">
              <div><p className="cv-pill">Free · 30 minutes</p><h3>{data.valueTitle}</h3><p>{data.valueBody}</p></div>
              <ol className="cv-steps-mini"><li><span>1</span>We review your site together</li><li><span>2</span>We explain what AI can and can’t see</li><li><span>3</span>You get three next steps by email</li></ol>
            </div>
          ) : (
            <div className="cv-offer-card">
              <div><p className="cv-pill">Why so affordable?</p><h3>{data.valueTitle}</h3><p>{data.valueBody}</p></div>
              <div className="cv-price"><span>Simple connections from</span><strong>£350</strong><small>total, including any applicable VAT</small><p>Fixed quote after a feasibility check. Third-party subscriptions are separate.</p></div>
            </div>
          )}
          <p className="campaign-scope-note">
            {ai
              ? 'A focused introductory review. AI services choose what to include; we don’t guarantee rankings or recommendations. Any implementation work is quoted separately.'
              : <>Migrations, complex custom systems, additional features and ongoing monitoring are quoted separately. <Link to="/pricing">Compare our wider services →</Link></>}
          </p>
          <div className="cv-center">{cta()}</div>
        </div>
      </section>

      <section className="campaign-shell campaign-section cv-split cv-people">
        <div>
          <p className="campaign-eyebrow">03 / A small business, helping small businesses</p>
          <h2>{copy.peopleTitle}</h2>
          <p className="cv-stat">20+<span>years building CRM solutions</span></p>
          <p className="campaign-prose">We’re a small team of developers and designers. You talk directly to the people who understand the problem, build the solution and explain how it works. No call centre, no jargon.</p>
          <ol className="cv-checklist">
            <li><Check size={18} aria-hidden="true" />A free 30-minute call to understand your business.</li>
            <li><Check size={18} aria-hidden="true" />{ai ? 'Three clear, prioritised next steps.' : 'A fixed quote before you commit.'}</li>
            <li><Check size={18} aria-hidden="true" />{ai ? 'Help implementing them, only if you want it.' : 'Built, tested and explained, with 14 days of fixes.'}</li>
          </ol>
          <Link className="cv-text-link" to="/about">Meet Promonet →</Link>
        </div>
        <figure className="cv-photo">{img(copy.peopleImage, copy.peopleAlt)}</figure>
      </section>

      <section className="cv-band cv-faq-band">
        <div className="campaign-shell campaign-section cv-split">
          <div><p className="campaign-eyebrow">Good questions</p><h2>A little clarity before we talk.</h2></div>
          <div className="campaign-faq">{data.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
        </div>
      </section>

      <section id="request-call" className="campaign-request">
        <div className="campaign-shell campaign-section cv-split">
          <div>
            <p className="campaign-eyebrow"><Clock3 size={16} aria-hidden="true" />Free / 30 minutes / Real people</p>
            <h2>{copy.formTitle}</h2>
            <p className="campaign-prose">{copy.formBody}</p>
            <figure className="cv-photo cv-photo-small">{img(copy.formImage, copy.formAlt)}</figure>
            <p className="campaign-request-note">A conversation with the people who do the work. No obligation to go further.</p>
          </div>
          <CampaignForm key={campaign} campaign={campaign} />
        </div>
      </section>
    </div>
  )
}
