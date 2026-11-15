// Content for the two English-only campaign landing pages. Copy mirrors the reels in
// campaigns/brief.json; media lives in public/campaigns (reel, poster, captions, per-shot loops).

export type CampaignId = 'ai_ready' | 'connect_tools'

type Point = { title: string; body: string }

export type Campaign = {
  id: CampaignId
  path: string
  title: string
  description: string
  /** Small label above the hero headline; omit to hide it. */
  eyebrow?: string
  headline: string
  intro: string
  cta: string
  offerLabel: string
  reelLabel: string
  /** Which rendered reel to show (public/campaigns/{reel}-reel.mp4). Defaults to the campaign id. */
  reel?: string
  /** Eyebrow above the sign-up form. */
  bookLabel?: string
  /** Shot ids used as silent background loops, in page order: hero, problem, solution, form. */
  loops: [string, string, string, string]
  loopAlts: [string, string, string, string]
  problem: { eyebrow: string; title: string; body: string }
  solution: { eyebrow: string; title: string; body: string; points: Point[] }
  /** Optional section between "what we do" and "who you'll work with" (AI-ready: preparing the business itself). */
  future?: { eyebrow: string; title: string; body: string; points: Array<Point & { href?: string; linkLabel?: string }> }
  why: { eyebrow: string; title: string; body: string }
  form: { title: string; body: string; submit: string; detailLabel: string; detailHint: string; detailPlaceholder: string; taskLabel?: string; taskPlaceholder?: string }
  faqs: Array<{ question: string; answer: string }>
}

export const CAMPAIGNS: Record<CampaignId, Campaign> = {
  ai_ready: {
    id: 'ai_ready',
    path: '/ai-ready',
    title: 'Is Your Business AI-Ready? Free 30-Minute AI Evaluation | Promonet',
    description: 'Get your business ready for AI. In a free 30-minute call, Promonet checks whether AI can find and understand your website and where AI could speed up your workflows, then sends three clear next steps.',
    headline: 'Are you AI ready?',
    intro: 'AI is changing how customers find businesses and how quickly work gets done. In a free 30-minute call, we’ll check whether AI can find and understand your business, look at where it could speed up the way you work, and give you three clear next steps.',
    cta: 'Book my free AI evaluation',
    offerLabel: 'Free · 30 minutes · Real people · No obligation',
    reelLabel: '28-second video: a customer asks an AI assistant for a local bike shop, a workshop owner checks her website, and a Promonet consultant explains the free AI evaluation call.',
    loops: ['a1', 'a2', 'a3', 'a4'],
    loopAlts: [
      'A woman on her sofa asking her phone’s AI assistant for a recommendation',
      'A bike workshop owner frowning at her website on a laptop',
      'A Promonet consultant explaining something on a video call',
      'A customer walking into a small bike shop on a sunny high street',
    ],
    problem: {
      eyebrow: '01 / The shift',
      title: 'Customers are asking AI. Is your business in the answer?',
      body: 'People increasingly ask assistants like ChatGPT, Gemini or Copilot to “recommend a good bike repair shop near me,” and they expect a quick reply when they get in touch. Those tools rely on what their bots can read on the web, so if your site never clearly says what you do and where, you’re easier to miss. And if the work behind the scenes still runs on retyping and chasing, it gets harder to keep up.',
    },
    solution: {
      eyebrow: '02 / Your free AI evaluation',
      title: 'Thirty minutes. Three clear next steps.',
      body: 'On a video call, we look at your website and the way you work, and explain in plain English what AI can and can’t see today and where it could save you time. Afterwards we email three prioritised next steps you can act on yourself, or with us.',
      points: [
        { title: 'Can AI find and understand you?', body: 'Crawler access, readable content and page structure: what AI tools can actually reach and interpret on your website.' },
        { title: 'Is your business clear?', body: 'Who you help, what you do and where you work, stated plainly enough to be repeated accurately.' },
        { title: 'Where could AI save you time?', body: 'The repetitive jobs in your week, and which ones AI or automation could realistically take on.' },
      ],
    },
    future: {
      eyebrow: '03 / Ready for what’s next',
      title: 'Get your business ready for a world that moves faster.',
      body: 'Being found by AI is only the start. Customers expect faster answers, and businesses that use AI well can quote, reply and follow up in minutes rather than days. We help you prepare your own business for that pace: practical changes to how your work flows, set up around your team, without the hype.',
      points: [
        { title: 'Map how your work flows', body: 'We find the repetitive jobs that slow you down: enquiries, quotes, follow-ups, admin and reporting.' },
        { title: 'Put AI to work where it helps', body: 'Practical tools such as drafting replies, summarising enquiries or sorting leads, fitted to how you already work.' },
        { title: 'Connect your tools', body: 'Your inbox, spreadsheets, CRM and calendar sharing information, so nothing is typed twice.', href: '/connect-your-tools', linkLabel: 'One full integration, fixed £350' },
        { title: 'Stay in control', body: 'Plain-English handovers, sensible checks and people in the loop, so you know what runs and why.' },
      ],
    },
    why: {
      eyebrow: '04 / Who you’ll talk to',
      title: 'A small business, helping small businesses.',
      body: 'Promonet is a small team with over 20 years of building CRM and web solutions. You talk directly to the people who do the work, not a call centre, and we only suggest changes that are worth your time.',
    },
    form: {
      title: 'Book your free AI evaluation call.',
      body: 'Tell us your website and we’ll arrange a time to look at it, and at how you work, together. No payment details, no obligation.',
      submit: 'Request my free AI evaluation',
      detailLabel: 'Website address',
      detailHint: 'The public website you’d like us to look at.',
      detailPlaceholder: 'yourbusiness.co.uk',
    },
    faqs: [
      { question: 'Is the AI evaluation really free?', answer: 'Yes. The 30-minute call and the email with three prioritised next steps are free, with no obligation. If you’d like help making changes, we’ll agree a scope and quote first.' },
      { question: 'Is this only about my website?', answer: 'No. We start with what AI can see of your website, then look at how your business runs day to day: where enquiries arrive, what gets retyped and what slows you down. Your three next steps can cover both.' },
      { question: 'What do you mean by AI bots?', answer: 'AI assistants and AI search tools use automated crawlers to read public web pages. Some websites block them by accident, hide key information in images or scripts, or never clearly say what the business does. We check for those common problems.' },
      { question: 'Can you guarantee AI will recommend my business?', answer: 'No. Accessible pages and clear content support discovery, but each AI service decides what to include. We don’t promise rankings, recommendations or a particular increase in traffic.' },
      { question: 'Do I need to prepare anything?', answer: 'Just your website address, a little context about your customers and a rough idea of the jobs that take up your week. We start with what’s publicly visible, so you don’t need to share passwords.' },
    ],
  },
  connect_tools: {
    id: 'connect_tools',
    path: '/connect-your-tools',
    title: 'Connect Your Business Tools for a Fixed £350 | Promonet',
    description: 'Get your tools talking to each other. A small team of experts works with you as part of your team: one full integration, live in under a week, for a fixed £350. Book your free chat.',
    eyebrow: 'Do your tools talk?',
    headline: 'Do your tools talk to each other?',
    intro: 'If you’re copying the same details from your inbox to a spreadsheet to your CRM, you’ve become the connection. Promonet is a small team of experts who work with you, as part of your team, to get your systems talking to each other.',
    cta: 'Book your free chat',
    offerLabel: 'Free chat · £350 fixed · One full integration · Live in under a week',
    reelLabel: '31-second video: a garden designer copies the same enquiry between tools, a Promonet expert sits down with him and connects them, and one full integration for a fixed £350 is explained.',
    reel: 'connect_tools_30s',
    bookLabel: 'Free chat · Real people · No obligation',
    loops: ['b1', 'b2', 't2', 't1'],
    loopAlts: [
      'A garden designer at a desk covered in sticky notes, rubbing his forehead',
      'Close-up of hands copying details from a phone into a laptop, surrounded by sticky notes',
      'A Promonet expert working on a laptop next to a notebook sketch of connected tools',
      'A Promonet expert sketching a connected workflow in a garden designer’s notebook as he looks on',
    ],
    problem: {
      eyebrow: '01 / The problem',
      title: 'When your tools don’t talk, you become the connection.',
      body: 'An enquiry arrives by email. You type it into a spreadsheet. Then into your CRM. Then you set a reminder. It’s the same information, again and again, and every retype is another chance for a typo or a missed follow-up.',
    },
    solution: {
      eyebrow: '02 / What we do',
      title: 'We get all your tools finally talking to each other.',
      body: 'Book a quick free chat and tell us which tools you use and what you’re copying. We confirm what’s possible, then build, test and explain the integration, so the work flows on its own. You work directly with the people doing the work.',
      points: [
        { title: 'One full integration', body: 'One integration between two tools with suitable existing integration access, for a fixed £350.' },
        { title: 'Live in under a week', body: 'Working in under a week from when we have access to your tools, with a short handover so you know what runs.' },
        { title: 'Built, tested, supported', body: 'Setup and testing, plus 14 days of fixes if the agreed integration develops a fault after handover.' },
      ],
    },
    why: {
      eyebrow: '03 / Who you’ll work with',
      title: 'A small team of experts, working as part of yours.',
      body: 'Promonet is a small team with over 20 years of building CRM and web solutions. We work alongside you like part of your own team: you talk directly to the experts doing the work, not a call centre, and you get hands-on help at a small-business price.',
    },
    form: {
      title: 'Tell us what you’re tired of copying.',
      body: 'Share your tools and the task. We’ll book a quick free chat, confirm what’s possible and get your integration working, for a fixed £350.',
      submit: 'Book your free chat',
      detailLabel: 'Which tools would you like to connect?',
      detailHint: 'For example: Gmail, a Google Sheet and HubSpot.',
      detailPlaceholder: 'Your inbox, spreadsheet, CRM…',
      taskLabel: 'What are you copying or doing repeatedly?',
      taskPlaceholder: 'A sentence or two about the task.',
    },
    faqs: [
      { question: 'What does the fixed £350 include?', answer: 'One full integration between two tools with suitable existing integration access, plus setup, testing, a short handover and 14 days of fixes for faults in the agreed integration. £350 is the total, including any applicable VAT. We confirm the scope on the free chat before you commit.' },
      { question: 'How can it be live in under a week?', answer: 'We focus on one well-defined integration at a time, and a small, experienced team builds and tests it. The week starts once we have access to your tools; if anything in your setup would take longer, we tell you on the chat before you commit.' },
      { question: 'Are there any other costs?', answer: 'Third-party subscriptions or usage charges are separate and identified before you commit. Migrations, complex custom systems and ongoing monitoring are quoted separately.' },
      { question: 'Can you connect any two tools?', answer: 'We first check each tool’s API, permissions and plan limits. Some products restrict what’s possible, and we’ll tell you before quoting rather than promise something we haven’t checked.' },
    ],
  },
}

export const CAMPAIGN_PATHS = Object.values(CAMPAIGNS).map((c) => c.path)
export const isCampaignPath = (pathname: string) => CAMPAIGN_PATHS.includes(pathname.replace(/\/$/, '') || '/')
