export default function TeamSection() {
  return (
    <section id="team" className="py-28 md:py-40 hairline-b">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-20 items-center">
          <div className="reveal order-2 lg:order-1">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[4px]">
              <img
                src="/team-office.jpg"
                alt="Promonet team that helps small businesses connect CRM and tools"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          </div>

          <div className="reveal order-1 lg:order-2" style={{ transitionDelay: '80ms' }}>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-voltage mb-8 flex items-center gap-3">
              <span className="w-6 h-px bg-voltage" />
              The team
            </div>
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-[-0.02em] mb-6 text-balance">
              We work as though we were part of your team.
            </h2>
            <p className="text-lg leading-relaxed text-graphite mb-5 max-w-[480px]">
              We're a small team — no account managers, no ticket queue.
              When you hire us, you get us: the same people who map your
              tools, build the flows, and stick around when something needs a tweak.
            </p>
            <p className="text-lg leading-relaxed text-graphite max-w-[480px]">
              We partner with you like your own team members. <strong className="font-semibold text-obsidian">Side by side, as friends, until your software is talking</strong> and your Sundays are free again.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
