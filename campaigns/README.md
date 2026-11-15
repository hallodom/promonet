# Promonet campaigns — brief for AI assistants

Read this before writing copy, ads, emails or posts for Promonet's two paid campaigns. It is the source of truth for the offers, the claims we can and can't make, and the assets that already exist. Where this file and older material disagree, this file wins.

## The company

- **Promonet Consulting**: a small UK team with over 20 years of building CRM and web solutions, working with small businesses.
- **Positioning:** "A small business, helping small businesses." You talk directly to the people doing the work, not a call centre.
- **Tone:** plain English, warm, practical, no hype. Short sentences. British spelling. Write for owners of small UK businesses (trades, shops, studios, local services), not for technical buyers.
- **Brand:**
  - **Colours:** ink `#0a0a0f`, paper `#f5f5f2`, blue `#2540e8`, orange `#ff4a1c` (accent and emphasis).
  - **Fonts:** Roboto Slab (headlines), Inter (body), JetBrains Mono (labels).
  - **Wordmark:** "promonet" in lower case.
  - **Badge:** the UK small business badge, `public/badges/uk-small-business-2026.png`.

## Campaign 1: AI-ready (`ai_ready`)

- **Landing page:** https://promonetconsulting.com/ai-ready
- **Hook:** "Are you AI ready?"
- **Audience:** small business owners who sense that customers now ask ChatGPT, Gemini or Copilot for recommendations, and aren't sure whether their business shows up.
- **Offer:** a **free 30-minute AI evaluation video call**, followed by **three prioritised next steps by email**. No payment details, no obligation.
- **What the call covers:**
  1. Can AI find and understand your website? (crawler access, readable content, page structure)
  2. Is your business clear? (who you help, what you do, where)
  3. Where could AI save you time? (the repetitive jobs in your week)
  4. Getting ready for a world that moves faster: quicker replies, connected tools, people in the loop.
- **CTA:** "Book your free AI evaluation" (the page button reads "Book my free AI evaluation").
- **Approved headlines:**
  - Are you AI ready?
  - Can AI find your business?
  - Ready for a world that moves faster?
- **Must not say:**
  - Never promise that AI will recommend, rank or list the business.
  - Never promise more traffic or leads.
  - Required line where space allows: "We can't guarantee AI recommendations."

## Campaign 2: Connect your tools (`connect_tools`)

- **Landing page:** https://promonetconsulting.com/connect-your-tools
- **Hook:** "Do your tools talk to each other?"
- **Audience:** owners who copy the same details from inbox to spreadsheet to CRM to calendar, and have "become the connection".
- **Offer:** a **free chat**, then **one full integration** between two tools, **live in under a week**, for a **fixed £350**.
- **What the £350 covers:**
  - one integration between two tools that have suitable existing integration access
  - setup, testing and a short handover
  - 14 days of fixes if the agreed integration develops a fault
- **The fine print on price:**
  - £350 is the total, including any applicable VAT.
  - Third-party subscriptions or usage costs are separate.
  - Scope is confirmed on the free chat before the customer commits.
- **"Under a week"** counts from when we have access to the tools.
- **Message:** Promonet is a small team of experts who work with you, as part of your team, to get your tools talking, so everything finally flows.
- **CTA:** "Book your free chat".
- **Approved headlines:**
  - Do your tools talk to each other?
  - Still typing the same details twice?
  - Experts who work as part of your team.
  - Get your tools talking.
- **Must not say:**
  - Don't say "from £350", "£300", or "simple connections". All three are retired; the price is a fixed £350 for one full integration.
  - Don't mention AI in this campaign.
  - Don't promise that any two tools can be connected; we check APIs and plan limits first.

## Required wording for both campaigns

- **Price line** (any connect-your-tools ad): "£350 incl. any VAT for one integration. Third-party costs separate."
- **Landing pages are English-only.**

## Tracking

- **UTM:** add `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` and `utm_term` to the landing page URLs. The enquiry form sends them with the lead.
- **Campaign ids:** use `ai_ready` and `connect_tools` as the `utm_campaign` values.
- **utm_content:** use the asset id, for example `connect_tools-typed-twice-4x5`.

## Assets that already exist

### Video reels

| File | Use |
|---|---|
| `public/campaigns/ai_ready-reel.mp4` | AI-ready, 28s, 9:16. Stories, Reels, and the landing page. |
| `campaigns/output/ai_ready-reel-4x5.mp4` | AI-ready, 28s, 4:5. Facebook and Instagram feeds. |
| `public/campaigns/connect_tools_30s-reel.mp4` | Connect your tools, 31s, 9:16. The current cut, also on the landing page. |
| `public/campaigns/connect_tools-reel.mp4`, `connect_tools_24s-reel.mp4` | **Superseded; don't run them.** They use the old "from £350" and £300 offers. |

- Each reel has a version without captions, `*-reel-clean.mp4` in `campaigns/output/`.
- Captions are in `public/campaigns/*.vtt`.
- The `.mp4` files in `campaigns/output/` aren't in git.

### Static ads

`campaigns/ads/`, 1080×1350 (`-4x5`) and 1080×1920 (`-9x16`):

| Id | Still | Headline |
|---|---|---|
| `ai_ready-ask-ai` | Woman asking her phone | Are you AI ready? |
| `ai_ready-checks` | Bike workshop owner at her laptop | Can AI find your business? |
| `ai_ready-faster` | Customer entering a high-street bike shop | Ready for a world that moves faster? |
| `connect_tools-tools-talk` | Frustrated garden designer | Do your tools talk to each other? |
| `connect_tools-typed-twice` | Hands copying details, sticky notes | Still typing the same details twice? |
| `connect_tools-expert-team` | Expert sketching a workflow with him | Experts who work as part of your team. |
| `connect_tools-talking` | Expert at her desk | Get your tools talking. |

### Characters in the footage

Use these when describing a scene or asking for a matching image:

- **AI-ready:**
  - a woman in a cream jumper asking her phone (a1)
  - a bike workshop owner in a navy apron (a2)
  - a customer entering a green-fronted bike shop (a4)
- **Connect your tools:**
  - a British-Indian garden designer in his fifties, olive quarter-zip, garage office full of sticky notes (b1, b2)
  - the Promonet expert: a woman in her late thirties, dark curly hair, rust cardigan (t1, t2)

## Ad placement notes (Meta)

- **Feeds:** use 4:5. Taller video is masked in feeds.
- **Stories and Reels:** use 9:16. Keep text out of the top 250px and bottom 330px, where the app UI sits.
- **Primary text:** one problem line, one offer line, then the CTA. Example: "Still typing the same enquiry into three places? We'll connect your tools: one full integration, live in under a week, fixed £350. Book your free chat."

## Regenerating assets

Every command uses the local footage in `campaigns/source/`, which isn't in git.

- **Static ads:** edit the `ADS` list in `scripts/render-campaign-ads.mjs`, then run:
  ```bash
  node scripts/render-campaign-ads.mjs [--only=<id>]
  ```
- **Reels:** the scripts are in `campaigns/brief.json`, and the end cards and price cards are in `scripts/render-campaign-reels.mjs`. Run:
  ```bash
  node scripts/render-campaign-reels.mjs --campaign=<id> [--format=4x5] [--preview]
  ```
- **Landing page copy:** `src/data/campaigns.ts`.
