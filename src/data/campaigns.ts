// Content for the two English-only campaign landing pages. Copy mirrors the reels in
// campaigns/brief.json; media lives in public/campaigns (reel, poster, captions, per-shot loops).

export type CampaignId = 'ai_ready' | 'connect_tools'

type Point = { title: string; body: string }

export type Campaign = {
  id: CampaignId
  path: string
  title: string
  description: string
  eyebrow: string
  headline: string
  intro: string
  cta: string
  offerLabel: string
  reelLabel: string
  /** Shot ids used as silent background loops, in page order: hero, problem, solution, form. */
  loops: [string, string, string, string]
  loopAlts: [string, string, string, string]
  problem: { eyebrow: string; title: string; body: string }
  solution: { eyebrow: string; title: string; body: string; points: Point[] }
  why: { eyebrow: string; title: string; body: string }
  form: { title: string; body: string; submit: string; detailLabel: string; detailHint: string; detailPlaceholder: string; taskLabel?: string; taskPlaceholder?: string }
  faqs: Array<{ question: string; answer: string }>
}

export const CAMPAIGNS: Record<CampaignId, Campaign> = {
  ai_ready: {
    id: 'ai_ready',
    path: '/ai-ready',
    title: 'Is Your Website Visible to AI? Free 30-Minute AI Evaluation | Promonet',
    description: 'Can AI bots find and understand your website? Book a free 30-minute AI evaluation call with Promonet and get three clear next steps. Real people, no obligation.',
    eyebrow: 'Are you AI-ready?',
    headline: 'Can AI actually find your business?',
    intro: 'More customers now ask AI assistants to recommend a local business. In a free 30-minute call, we’ll check whether AI bots can access and understand your website, then give you three clear next steps.',
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
      body: 'People increasingly ask assistants like ChatGPT, Gemini or Copilot to “recommend a good bike repair shop near me.” Those tools rely on what their bots can read on the web. If they can’t reach your pages, or your site never clearly says what you do and where, you’re easier to miss.',
    },
    solution: {
      eyebrow: '02 / Your free AI evaluation',
      title: 'Thirty minutes. Three clear next steps.',
      body: 'We look at your website together on a video call and explain, in plain English, what AI bots can and can’t see. Afterwards we email three prioritised next steps you can act on yourself, or with us.',
      points: [
        { title: 'Can AI bots access it?', body: 'Crawler access, robots settings and whether your important pages can be reached at all.' },
        { title: 'Can they understand it?', body: 'Readable content, page structure and the signals that help machines interpret your pages.' },
        { title: 'Is your business clear?', body: 'Who you help, what you do and where you work, stated plainly enough to be repeated accurately.' },
      ],
    },
    why: {
      eyebrow: '03 / Who you’ll talk to',
      title: 'A small business, helping small businesses.',
      body: 'Promonet is a small team with over 20 years of building CRM and web solutions. You talk directly to the people who do the work, not a call centre, and we only suggest changes that are worth your time.',
    },
    form: {
      title: 'Book your free AI evaluation call.',
      body: 'Tell us your website and we’ll arrange a time to look at it together. No payment details, no obligation.',
      submit: 'Request my free AI evaluation',
      detailLabel: 'Website address',
      detailHint: 'The public website you’d like us to look at.',
      detailPlaceholder: 'yourbusiness.co.uk',
    },
    faqs: [
      { question: 'Is the AI evaluation really free?', answer: 'Yes. The 30-minute call and the email with three prioritised next steps are free, with no obligation. If you’d like help making changes, we’ll agree a scope and quote first.' },
      { question: 'What do you mean by AI bots?', answer: 'AI assistants and AI search tools use automated crawlers to read public web pages. Some websites block them by accident, hide key information in images or scripts, or never clearly say what the business does. We check for those common problems.' },
      { question: 'Can you guarantee AI will recommend my business?', answer: 'No. Accessible pages and clear content support discovery, but each AI service decides what to include. We don’t promise rankings, recommendations or a particular increase in traffic.' },
      { question: 'Do I need to prepare anything?', answer: 'Just your website address and a little context about your customers. We start with what’s publicly visible, so you don’t need to share passwords.' },
    ],
  },
  connect_tools: {
    id: 'connect_tools',
    path: '/connect-your-tools',
    title: 'Connect Your Business Tools, From £350 | Promonet',
    description: 'Stop copying details between your inbox, spreadsheets and CRM. Promonet connects your tools with real, hands-on help. Simple connections from £350. Free 30-minute call.',
    eyebrow: 'Do your tools talk?',
    headline: 'Do your tools talk to each other?',
    intro: 'If you’re copying the same details from your inbox to a spreadsheet to your CRM, you’ve become the connection. We connect them, hands-on and directly with you, so the work flows on its own.',
    cta: 'Book my free connection call',
    offerLabel: 'Free 30-minute call · Simple connections from £350',
    reelLabel: '35-second video: a garden designer copies the same enquiry between tools, a Promonet developer connects them, and simple connections from £350 are explained.',
    loops: ['b1', 'b2', 'b3', 'b4'],
    loopAlts: [
      'A garden designer at a desk covered in sticky notes, rubbing his forehead',
      'Close-up of hands copying details from a phone into a laptop, surrounded by sticky notes',
      'A Promonet developer sketching a connected workflow in a notebook',
      'A phone on a garden table while a gardener plants flowers in the background',
    ],
    problem: {
      eyebrow: '01 / The problem',
      title: 'When your tools don’t talk, you become the connection.',
      body: 'An enquiry arrives by email. You type it into a spreadsheet. Then into your CRM. Then you set a reminder. It’s the same information, again and again, and every retype is another chance for a typo or a missed follow-up.',
    },
    solution: {
      eyebrow: '02 / What we do',
      title: 'We connect them, so the work flows on its own.',
      body: 'Tell us which tools you use and what you’re copying. We check what’s possible, agree a fixed quote, then build, test and explain the connection. You work directly with the developer doing the work.',
      points: [
        { title: 'One useful workflow', body: 'A simple, one-way connection between two tools with suitable existing integration access.' },
        { title: 'Built, tested, explained', body: 'Setup, testing and a short handover so you understand what runs and how to use it.' },
        { title: '14 days of fixes', body: 'If the agreed workflow develops a fault in the first 14 days after handover, we fix it.' },
      ],
    },
    why: {
      eyebrow: '03 / Why so affordable?',
      title: 'AI makes building software faster. We pass that on.',
      body: 'AI-assisted development cuts the time it takes to build and test an integration. Experienced people with over 20 years of CRM work still design, check and support everything, so you get hands-on help at a small-business price.',
    },
    form: {
      title: 'Tell us what you’re tired of copying.',
      body: 'Share your tools and the task. We’ll arrange a free 30-minute call, check feasibility and send a fixed quote before you commit.',
      submit: 'Request my free connection call',
      detailLabel: 'Which tools would you like to connect?',
      detailHint: 'For example: Gmail, a Google Sheet and HubSpot.',
      detailPlaceholder: 'Your inbox, spreadsheet, CRM…',
      taskLabel: 'What are you copying or doing repeatedly?',
      taskPlaceholder: 'A sentence or two about the task.',
    },
    faqs: [
      { question: 'What does “from £350” include?', answer: 'One simple, one-way workflow between two tools with suitable existing integration access, plus setup, testing, a short handover and 14 days of fixes for faults in the agreed workflow. £350 is the minimum total, including any applicable VAT. We confirm a fixed quote after checking feasibility.' },
      { question: 'Why is it cheaper than I expected?', answer: 'AI-assisted development means much less time on boilerplate code and testing, and we pass that saving on. The work is still designed, reviewed and supported by experienced people.' },
      { question: 'Are there any other costs?', answer: 'Third-party subscriptions or usage charges are separate and identified before you commit. Migrations, complex custom systems and ongoing monitoring are quoted separately.' },
      { question: 'Can you connect any two tools?', answer: 'We first check each tool’s API, permissions and plan limits. Some products restrict what’s possible, and we’ll tell you before quoting rather than promise something we haven’t checked.' },
    ],
  },
}

export const CAMPAIGN_PATHS = Object.values(CAMPAIGNS).map((c) => c.path)
export const isCampaignPath = (pathname: string) => CAMPAIGN_PATHS.includes(pathname.replace(/\/$/, '') || '/')
