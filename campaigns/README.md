# Promonet campaign production pack

## v2: current (14 November 2026)

Two narrated, footage-led reels with matching landing pages. They replace the silent v1 drafts below, which are kept for reference only.

| | AI visibility | Connected tools |
|---|---|---|
| Hook | "Are you AI-ready?" | "Do your tools talk to each other?" |
| Offer | Free 30-minute AI evaluation call + three next steps | Free 30-minute call; simple connections from £350 |
| Landing page | `/ai-ready` | `/connect-your-tools` |
| Captioned master | `v2/ai_ready/ai_ready-reel.mp4` (39.1s) | `v2/connect_tools/connect_tools-reel.mp4` (40.8s) |
| Clean master (no captions) | `v2/ai_ready/ai_ready-reel-clean.mp4` | `v2/connect_tools/connect_tools-reel-clean.mp4` |
| Captions | `ai_ready.srt` / `.vtt` | `connect_tools.srt` / `.vtt` |
| Cover / end card | `ai_ready-cover.jpg`, `ai_ready-endcard.jpg` | `connect_tools-cover.jpg`, `connect_tools-endcard.jpg` |

Masters are H.264 1080×1920 at 30fps, with AAC 48kHz audio and fast-start, at about −15 LUFS integrated with a −1.5 dBTP peak. Upload the **clean master** and add platform captions from the SRT if you prefer native captions. Otherwise upload the captioned master.

**Production:** the script, beats, prompts and cast are in `v2/brief.json`. Every Higgsfield job ID is in `v2/generation-jobs.json`.
- **Visuals:** GPT Image 2.6 keyframes (consistent cast via reference images), animated with Kling 3.0 Pro image-to-video.
- **Voice:** Vera stock voice (Seed Audio). It is not a cloned voice.
- **Music:** ElevenLabs Music, instrumental.

**Spend:** 199.67 Higgsfield credits against the 250 approved (balance 1,039.75 → 840.08). That covers 12 stills (33), 12 clips (138.25), 12 voiceover lines (~8) and 4 music beds (20.36). The first two 34s beds were too short for the edit and were replaced by 42s versions.

The people shown are AI-generated and illustrative, not Promonet staff or clients. Both the reels and the pages say so.

### Rebuild (no generation spend)

- `node scripts/render-campaign-v2.mjs --preview` writes one frame per beat to `v2/<id>/preview-*.jpg`.
- `node scripts/render-campaign-v2.mjs --clean` renders both captioned and clean masters, then exports the 720p web reel, poster and VTT to `public/campaigns/v2/`. Add `--campaign=ai_ready` to render one reel only, or `--web-only` to redo just the web exports.
- The pipeline is `scripts/campaign-v2.html`, a Canvas template for overlays, captions and end card, driven by Playwright and ffmpeg. Voiceover lines are trimmed to `v2/work/` (gitignored). Caption timings come from each line's pauses.

### Social copy

**AI visibility — Instagram**

Are you AI-ready? 🤖

More customers now ask AI assistants to recommend a local business. But can AI bots actually find your website, and understand what you do?

Book a free 30-minute AI evaluation call. We’ll check what AI can access and understand, then email you three clear next steps. Real people, plain English, no obligation.

Link in bio → promonetconsulting.com/ai-ready

#SmallBusinessUK #AIReady #SmallBusinessTips

Link: https://promonetconsulting.com/ai-ready?utm_source=instagram&utm_medium=social&utm_campaign=ai_ready&utm_content=reel_v2

**AI visibility — Facebook**

Is your website visible to AI?

People are starting to ask AI assistants for recommendations: “find me a good bike repair shop near me.” If AI bots can’t reach your pages, or your site doesn’t clearly say what you do, your business is easier to miss.

We’re Promonet, a small business helping small businesses. Book a free 30-minute AI evaluation call and we’ll show you what AI can and can’t see, then send three prioritised next steps. No obligation, and no promises of guaranteed AI rankings.

Book your free call: https://promonetconsulting.com/ai-ready?utm_source=facebook&utm_medium=social&utm_campaign=ai_ready&utm_content=reel_v2

**Connected tools — Instagram**

Do your tools talk to each other? 🔌

If you’re copying the same details from your inbox to a spreadsheet to your CRM, you’ve become the connection. We connect them, so the work flows on its own.

Real humans, hands-on, working directly with you. Because AI makes building software faster, simple connections start from £350 (total, including any VAT; fixed quote after a feasibility check; third-party costs separate).

Book a free 30-minute call. Link in bio → promonetconsulting.com/connect-your-tools

#SmallBusinessUK #BusinessAutomation #CRM

Link: https://promonetconsulting.com/connect-your-tools?utm_source=instagram&utm_medium=social&utm_campaign=connect_tools&utm_content=reel_v2

**Connected tools — Facebook**

How much of your week goes on retyping the same information?

When your tools don’t talk to each other, you end up as the connection: inbox to spreadsheet to CRM, again and again. Promonet connects the software you already use, with real people doing the work and talking to you directly.

AI-assisted development makes building faster, and we pass that saving on: simple one-way connections start from £350 total, including any applicable VAT. We check feasibility and give you a fixed quote first. Third-party costs are separate.

Tell us what you’re copying. Book a free 30-minute call: https://promonetconsulting.com/connect-your-tools?utm_source=facebook&utm_medium=social&utm_campaign=connect_tools&utm_content=reel_v2

---

## v1: superseded (kept for reference)

Two English campaigns for UK small-business owners, for Instagram and Facebook. Pages, generated photographs and four supporting video clips are implemented. Each production subfolder includes the original **silent storyboard** and a **silent visual draft** assembled from the generated footage. Neither is a finished narrated reel. Captions use provisional word-weighted timings; align them to the recorded voice before release.

## Review and production inputs

**Latest creative correction:** v1 and v2 are rejected directions, retained only for history. The next edit must be footage-led, with smooth camera movement, music/ambient sound and narration, and at most one brief useful UI screen per campaign. The reviewable shot plan and unapproved additional-video quote are in `production/film-v3.json`. Do not treat the earlier preference for more animated UI as current direction.

**Latest narration decision:** the user chose generated narration and selected Fraser in Higgsfield. This supersedes the original requirement to supply personal recordings below. Both exact scripts have been quoted at 6 credits total (2.9 + 3.1); generation is awaiting cost approval. The 80-credit footage test is also awaiting approval. No additional jobs have been submitted.

**Saved user preference:** use built-in OpenAI image generation for future stills, drawing on Codex usage limits. Reserve Higgsfield credits for video unless explicitly requested otherwise. Do not use an API-key billing route unless the user chooses it.

- AI page: `/ai-ready`; integration page: `/connect-your-tools`.
- Local review hub: http://localhost:3010/campaigns/review.html (both revised videos, downloads and matching landing pages together).
- Page copy and the exact approved narration: `src/data/campaigns.json`.
- Timed shot lists, generation prompts, model parameters and quote: `campaigns/production/brief.json`.
- Covers: `public/campaigns/ai_ready-cover.png` and `connect_tools-cover.png`.
- Each production subfolder contains `narration.txt`, `captions-draft.srt`, `captions-draft.vtt`, five storyboard frames and a 35-second storyboard MP4.
- Generated source files are preserved in `campaigns/production/generated/`, with campaign mappings in `assets.json`. `generation-jobs.json` records the six completed Higgsfield job IDs and spending.
- The assembled edits are `production/ai_ready/ai_ready-visual-draft.mp4` and `production/connect_tools/connect_tools-visual-draft.mp4`; both are labelled “Visual draft · Narration pending”.
- **Revised motion edits:** `production/ai_ready/ai_ready-motion-v2.mp4` and `production/connect_tools/connect_tools-motion-v2.mp4` supersede the static first drafts for review. They animate the website scan, checklist, record transfer, recurring time illustration and offer; both source clips play at natural speed. They remain silent pending the user's recordings.

Record each narration in your own voice, ideally 30–35 seconds, in a quiet room. Leave one second of quiet before and after; avoid music. WAV, M4A or a clear phone recording is suitable. The script contains approximately 70 words per campaign. These are separate recordings. Do not clone or replace the speaker's voice.

## Higgsfield quote — 14 November 2026

Live cost-estimate tools returned:

| Item | Quantity | Unit credits | Total credits |
|---|---:|---:|---:|
| GPT Image 2.6, high quality, 2k, 9:16 still | 2 | 2.75 | 5.5 |
| Seedance 2.5, 1080p, 9:16, five seconds, no audio | 4 | 80 | 320 |
| **First pass** | | | **325.5** |
| Optional replacement still | 1 | 2.75 | 2.75 |
| Optional replacement clip | 1 | 80 | 80 |
| **Maximum including that revision allowance** | | | **408.25** |

The user approved the **325.5-credit first pass**. All six jobs completed, with **325.5 Higgsfield credits debited** (balance 1,365.25 → 1,039.75). The optional revision allowance was not approved or spent. These are credits, not pounds. The four clips used text-to-video at the quoted settings. No extra generation or retries were submitted.

**Billing clarification:** the two GPT Image 2.6 stills were generated through Higgsfield and cost 5.5 Higgsfield credits total; they did not use the user's OpenAI subscription. Future stills can instead use built-in `gpt-image-2` generation, which counts toward general Codex usage limits. An explicitly selected OpenAI API-key workflow uses API billing. These are separate routes; the model labels are not interchangeable. See [official image-generation documentation](https://learn.chatgpt.com/docs/image-generation). The four video clips accounted for the remaining 320 Higgsfield credits.

The illustrated assets are original code-native graphics. Generated people and office scenes are illustrative, not actual Promonet staff or clients. Copy, prices and the wordmark are separate typeset overlays. Each generated photograph is shared across its page hero, reel cover, share card and visual draft, with matching alt descriptions. The original workflow diagrams remain available and appear in the visual drafts.

## Final edit

The revised motion edit uses seven five-second sequences: hook, animated workflow/review, potential value, experience with footage, offer, personal help with footage, and CTA with the matching landing-page photograph. The original five-scene brief is retained as production history. Time the final edit to the supplied narration, within 30–35 seconds; do not accelerate the voice unnaturally. Re-time subtitles to the actual recording, with at most two lines visible at once. Keep critical copy within x=85–930, y=250–1550 on the 1080×1920 frame; check current platform previews before posting. Finish with at least three seconds of the call-to-action and landing URL.

Export H.264 MP4, 1080×1920, 30fps, yuv420p, AAC narration at 48kHz, fast-start enabled. Normalise narration consistently, avoid clipping, and add no unlicensed music. Deliver captioned and clean masters plus final SRT/VTT, updated PNG covers and web-optimised hero/share images. Watch the full exports with audio and muted. No final export can be claimed until real voice and approved generated footage are present and checked.

## Social copy and links

### AI visibility — Instagram

Are you AI-ready? Start with your website.

A small improvement today could help more customers discover your business over time. We bring over 20 years of CRM development experience to practical AI adoption—and explain the next steps in plain English.

Request a free 30-minute website visibility review. We’ll email three prioritised next steps afterwards. No obligation, and no promises of guaranteed AI recommendations.

Link in bio: https://promonetconsulting.com/ai-ready?utm_source=instagram&utm_medium=social&utm_campaign=ai_ready&utm_content=reel_v1

#SmallBusinessUK #AIReadiness #SmallBusinessSupport

### AI visibility — Facebook

Can AI search find and understand your website?

Promonet is a small business helping other small businesses choose useful improvements. Start with a free 30-minute website visibility review covering access, readable content and how clearly your business comes across. You’ll receive three prioritised next steps by email.

Expert guidance, backed by over 20 years building CRM solutions. No obligation to buy anything.

Request your call: https://promonetconsulting.com/ai-ready?utm_source=facebook&utm_medium=social&utm_campaign=ai_ready&utm_content=reel_v1

### Connected tools — Instagram

Still copying information between tools that don’t talk?

A small, useful connection could give you time back every week. We combine over 20 years of CRM development experience with AI-assisted development to keep small projects affordable. You work directly with us.

Simple connections from £350 total, including applicable VAT. One qualifying one-way workflow, setup, testing, handover and 14 days of fault fixes. Fixed quote after a feasibility check; third-party costs separate.

Request a free 30-minute call. Link in bio: https://promonetconsulting.com/connect-your-tools?utm_source=instagram&utm_medium=social&utm_campaign=connect_tools&utm_content=reel_v1

#SmallBusinessUK #BusinessAutomation #CRM

### Connected tools — Facebook

How much time does your team spend moving the same information between tools?

Promonet helps small businesses connect the software they already use. A small investment now could reduce repetitive work and create useful capacity, week after week. You work directly with the experienced people building your connection.

Simple one-way connections start from £350 total, including applicable VAT, with setup, testing, handover and 14 days of fault fixes. We check feasibility and give you a fixed quote first; third-party costs are separate.

Tell us what you’re copying. Request a free 30-minute call: https://promonetconsulting.com/connect-your-tools?utm_source=facebook&utm_medium=social&utm_campaign=connect_tools&utm_content=reel_v1

## Rebuild and verify

`node scripts/preview-campaigns.mjs` starts the existing Vite development server without opening a browser. Preview at http://127.0.0.1:3010/ai-ready and http://127.0.0.1:3010/connect-your-tools. Contact delivery uses the same environment configuration as normal development.

`node scripts/build-campaign-assets.mjs` rebuilds the original SVG diagrams. When generated-photo heroes exist, it preserves the production covers and share cards.

`node scripts/assemble-campaign-media.mjs` rebuilds the generated-photo web assets and the two silent visual drafts from the local source files, without generation charges. Add `--images-only` to rebuild web images and covers alone. The draft template uses the four clips, diagrams, photographs and typeset overlays; remove the draft label only when the real narration has been added and checked.

`node scripts/check-campaign-media.mjs --sources-only` checks all four source clips; omit the flag to check the two assembled drafts. It validates dimensions/duration, decodes every frame and saves contact sheets to the QA folder.

`node scripts/render-campaign-motion.mjs` renders both revised motion edits from deterministic Canvas animation and the existing footage, without paid generation. Use `--preview` for seven still review frames, or `--campaign=ai_ready` / `--campaign=connect_tools` to render one campaign. `node scripts/check-campaign-media.mjs --motion` checks the revised exports. The browser-compatible video working copies are cached under the ignored QA folder; originals are untouched.

With the local preview server running, `node scripts/check-campaign-review.mjs` verifies playback of both revised exports, mobile review layout and both landing-page URLs.

`node scripts/build-campaign-previews.mjs` rebuilds silent storyboards and provisional captions, requiring local FFmpeg and Playwright Chromium. These scripts do not call a generation provider or spend credits.

Run `node --test tests/contact.test.mjs`, `npm run build`, then `node tests/campaigns.browser.mjs` for production route, form, SEO and mobile checks. Browser verification starts an isolated local server and intercepts email POSTs; it does not send real enquiries.

Track requests by campaign and source in enquiry emails, then record which requests turn into booked calls and projects. The first version adds no advertising pixels or marketing subscriptions. Deployment, account posting and ad buying are not part of this delivery.
