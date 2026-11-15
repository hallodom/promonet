import { ArrowRight, Cable, Check, Clock3, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'
import Seo from '@/components/Seo'
import CampaignForm from '@/components/CampaignForm'
import { LoopVideo, ReelPlayer } from '@/components/CampaignVideo'
import { CAMPAIGNS, type CampaignId } from '@/data/campaigns'
import { absoluteUrl, faqJsonLd } from '@/lib/seo'
import { useReveal } from '@/lib/useReveal'

const Eyebrow = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <div className={`text-[11px] font-mono uppercase tracking-[0.18em] mb-6 flex items-center gap-3 ${light ? 'text-bone/80' : 'text-voltage'}`}>
    <span className={`w-6 h-px ${light ? 'bg-bone/60' : 'bg-voltage'}`} />
    {children}
  </div>
)

// Icons for the "future" points, in order: workflows, AI, connected tools, control.
const FUTURE_ICONS = [Workflow, Sparkles, Cable, ShieldCheck]

const Cta = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <a href="#book" className={`inline-flex items-center gap-3 rounded-full bg-voltage text-bone px-6 py-4 text-[15px] font-semibold shadow-[0_12px_30px_rgba(37,64,232,0.35)] hover:bg-voltage/90 transition-colors ${className}`}>
    {children}
    <ArrowRight size={18} aria-hidden="true" />
  </a>
)

export default function Campaign({ id }: { id: CampaignId }) {
  useReveal()
  const c = CAMPAIGNS[id]

  return (
    <>
      <Seo title={c.title} description={c.description} path={c.path} image={absoluteUrl(`/campaigns/${id}-og.jpg`)} imageAlt={c.loopAlts[id === 'ai_ready' ? 1 : 0]} jsonLd={[faqJsonLd(c.faqs)]} englishOnly />

      {/* Hero: the hook shot plays full-bleed behind the copy; the full reel sits alongside. */}
      <section className="relative overflow-hidden bg-obsidian text-bone">
        <div className="absolute inset-0" aria-hidden="true">
          <LoopVideo shot={c.loops[0]} label="" eager className="opacity-60 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/75 to-obsidian/20" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-obsidian to-transparent" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 py-16 md:py-24 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
          <div className="reveal">
            {c.eyebrow && <Eyebrow light>{c.eyebrow}</Eyebrow>}
            <h1 className="font-display font-display-tight text-[clamp(42px,6.4vw,84px)] leading-[1.02] mb-6 text-balance">{c.headline}</h1>
            <p className="text-lg md:text-xl text-bone/80 leading-relaxed max-w-[580px] mb-9">{c.intro}</p>
            <Cta>{c.cta}</Cta>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-bone/60">{c.offerLabel}</p>
            <ul className="mt-10 pt-8 border-t border-bone/15 grid grid-cols-3 gap-6 max-w-[560px] text-[13px] text-bone/65">
              <li><strong className="block text-bone text-[15px] mb-1">20+ years</strong>building CRM and web solutions</li>
              <li><strong className="block text-bone text-[15px] mb-1">Real people</strong>you talk to the person doing the work</li>
              <li><strong className="block text-bone text-[15px] mb-1">Small business</strong>helping small businesses</li>
            </ul>
          </div>
          <ReelPlayer campaign={c.reel ?? id}label={c.reelLabel} className="reveal justify-self-center" />
        </div>
      </section>

      {/* 01: the problem, over the second shot */}
      <section className="py-20 md:py-28 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="reveal aspect-[4/5] rounded-[12px] overflow-hidden bg-obsidian/5"><LoopVideo shot={c.loops[1]} label={c.loopAlts[1]} /></div>
          <div className="reveal">
            <Eyebrow>{c.problem.eyebrow}</Eyebrow>
            <h2 className="font-display text-[clamp(30px,4vw,48px)] leading-[1.1] mb-6 text-balance">{c.problem.title}</h2>
            <p className="text-lg text-graphite leading-relaxed">{c.problem.body}</p>
          </div>
        </div>
      </section>

      {/* 02: what we do, with the third shot */}
      <section className="py-20 md:py-28 bg-obsidian/[0.03] hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-[1fr_0.8fr] gap-10 md:gap-16 items-center mb-14">
            <div className="reveal">
              <Eyebrow>{c.solution.eyebrow}</Eyebrow>
              <h2 className="font-display text-[clamp(30px,4vw,48px)] leading-[1.1] mb-6 text-balance">{c.solution.title}</h2>
              <p className="text-lg text-graphite leading-relaxed mb-8">{c.solution.body}</p>
              <Cta>{c.cta}</Cta>
            </div>
            <div className="reveal aspect-[4/5] rounded-[12px] overflow-hidden bg-obsidian/5 max-w-[420px] w-full justify-self-center"><LoopVideo shot={c.loops[2]} label={c.loopAlts[2]} /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {c.solution.points.map((p, i) => (
              <article key={p.title} className="reveal rounded-[8px] bg-white border border-obsidian/10 p-7">
                <span className="font-mono text-[12px] text-voltage block mb-5">0{i + 1}</span>
                <h3 className="font-display text-[22px] leading-snug mb-3">{p.title}</h3>
                <p className="text-[15px] text-graphite leading-relaxed">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Optional: preparing the business itself for a faster, AI-assisted way of working */}
      {c.future && (
        <section className="py-20 md:py-28 hairline-b">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-end mb-12 md:mb-14">
              <div className="reveal">
                <Eyebrow>{c.future.eyebrow}</Eyebrow>
                <h2 className="font-display text-[clamp(30px,4vw,48px)] leading-[1.1] text-balance">{c.future.title}</h2>
              </div>
              <p className="reveal text-lg text-graphite leading-relaxed">{c.future.body}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {c.future.points.map((p, i) => {
                const Icon = FUTURE_ICONS[i % FUTURE_ICONS.length]
                return (
                  <article key={p.title} className="reveal group relative flex flex-col rounded-[8px] bg-white border border-obsidian/10 p-7 overflow-hidden">
                    <span className="absolute inset-x-0 top-0 h-[3px] bg-voltage origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" aria-hidden="true" />
                    <span className="w-11 h-11 rounded-full bg-voltage/10 text-voltage grid place-items-center mb-6"><Icon size={20} aria-hidden="true" /></span>
                    <h3 className="font-display text-[21px] leading-snug mb-3">{p.title}</h3>
                    <p className="text-[15px] text-graphite leading-relaxed">{p.body}</p>
                    {p.href && (
                      <Link to={p.href} className="mt-auto pt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-voltage hover:underline underline-offset-4">
                        {p.linkLabel ?? 'Find out more'}<ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    )}
                  </article>
                )
              })}
            </div>
            <div className="reveal mt-12 flex flex-col sm:flex-row sm:items-center gap-5">
              <Cta>{c.cta}</Cta>
              <p className="text-[15px] text-graphite">Start with the free 30-minute call. We’ll tell you what’s worth doing first.</p>
            </div>
          </div>
        </section>
      )}

      {/* who / why affordable */}
      <section className="py-20 md:py-28 bg-obsidian text-bone">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="reveal">
            <Eyebrow light>{c.why.eyebrow}</Eyebrow>
            <h2 className="font-display text-[clamp(30px,4vw,48px)] leading-[1.1] mb-6 text-balance">{c.why.title}</h2>
            <p className="text-lg text-bone/75 leading-relaxed mb-8">{c.why.body}</p>
            {id === 'connect_tools' ? (
              <div className="rounded-[8px] bg-bone text-obsidian p-7 max-w-[440px]">
                <p className="text-sm text-graphite font-semibold">One full integration · Fixed price</p>
                <p className="font-display text-[84px] leading-none text-voltage my-2">£350</p>
                <p className="text-sm text-graphite">Live in under a week from when we have access. Total, including any applicable VAT. Third-party subscriptions are separate.</p>
              </div>
            ) : (
              <ul className="space-y-3 text-bone/85">
                {['A free 30-minute call, on video or phone', 'Three prioritised next steps by email', 'Help implementing them, only if you want it'].map((s) => (
                  <li key={s} className="flex gap-3 items-start"><Check className="text-imago shrink-0 mt-1" size={18} aria-hidden="true" />{s}</li>
                ))}
              </ul>
            )}
            <Link to="/about" className="inline-block mt-8 text-sm text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone">Meet the Promonet team →</Link>
          </div>
          <div className="reveal aspect-[4/5] rounded-[12px] overflow-hidden"><LoopVideo shot={c.loops[3]} label={c.loopAlts[3]} /></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 hairline-b">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid md:grid-cols-[0.8fr_1.2fr] gap-10 md:gap-16">
          <div className="reveal">
            <Eyebrow>Good questions</Eyebrow>
            <h2 className="font-display text-[clamp(30px,4vw,44px)] leading-[1.1] text-balance">A little clarity before we talk.</h2>
          </div>
          <div className="reveal">
            {c.faqs.map((f) => (
              <details key={f.question} className="group border-t border-obsidian/15 last:border-b py-5">
                <summary className="cursor-pointer list-none flex justify-between gap-6 font-semibold text-[16px]">{f.question}<span aria-hidden="true" className="text-voltage group-open:rotate-45 transition-transform">+</span></summary>
                <p className="pt-4 text-graphite leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Sign-up */}
      <section id="book" className="py-20 md:py-28 bg-voltage/[0.06] scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="reveal">
            <Eyebrow><Clock3 size={14} aria-hidden="true" />{c.bookLabel ?? 'Free · 30 minutes · Real people'}</Eyebrow>
            <h2 className="font-display text-[clamp(30px,4vw,48px)] leading-[1.1] mb-6 text-balance">{c.form.title}</h2>
            <p className="text-lg text-graphite leading-relaxed mb-8">{c.form.body}</p>
            <div className="hidden md:block aspect-video rounded-[12px] overflow-hidden"><LoopVideo shot={c.loops[3]} label={c.loopAlts[3]} className="object-[50%_35%]" /></div>          </div>
          <div className="reveal"><CampaignForm campaign={c} /></div>
        </div>
      </section>
    </>
  )
}
