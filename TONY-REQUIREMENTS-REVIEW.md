# Tony requirements review

Reviewed against the supplied purpose statement, Master Website Guide, customer-journey image, and numbered page briefs. This is a review of the local implementation, not approval of a production launch.

## Governing direction

The owner is the protagonist. Problems and outcomes lead; capabilities support the solution. Business Concierge is the coordination model, not a product. Each page inherits the previous chapter and hands off to the next.

The user's newer visual instructions govern: Poppins, primarily 16px or larger text, restrained smaller metadata, blue theme, white button text, full-width backgrounds, 1528px content containers, a 100vh video hero, a lighter overlay, and a flush scrolled header. These intentionally replace the older cream/gold/serif direction.

## Page-by-page findings and changes

| Page | Tony's intended job | Current implementation / review outcome |
| --- | --- | --- |
| Home | Recognition: “You understand me.” | Existing five video chapters retained. The specific hero-to-body bridge uses the supplied black-and-white barbershop photograph and “Business has always been human” copy, without service cards or CTAs. Human Component, Wingman, Business Concierge, connected framework, distinct Voice/Non-voice families, six outcomes, working-business imagery, and handoff to What We Solve. Replaced the dense third-section diagnostic with three photo-led everyday pressure stories with staggered documentary images and reduced-motion-aware entrance/hover effects. Deeper diagnosis now belongs to the next page. |
| What We Solve | Look beneath the symptom | Symptoms, underlying causes, People/Business Systems/Process lens, Concierge, six outcomes, and Who We Help handoff. Added the missing capability families after the problem-solving explanation; these are not package choices. |
| Who We Help | Recognize the owner's operating context | Working environments, contextual business problems, industry expertise staying with the owner, connected support, and How It Works handoff. Added automotive imagery and capability explanations. Examples describe possible needs, not client endorsements. |
| How It Works | Explain the working relationship | Business-first conversation, Concierge, Diagnose/Build/Operate, preserve/improve/build principle, focused pilot, shared responsibilities, and Results handoff. Added capability context and Plan/Execute/Review/Adjust to make ongoing accountability explicit. |
| Results | Explain meaningful business change | Activity versus outcome, all six outcome categories, three labeled illustrative scenarios, relevant measures, and About handoff. Added the four explicit evidence labels: Verified, Observed/Qualitative, Illustrative, and Expected/Target. No verified client performance is invented. |
| About | Establish trust through experience and lessons | Customer-centered opening, work-first story, supplied archival photographs, small-business interconnections, framework, human belief, operating principles, 5As, founder accountability later in the page, and Resources handoff. Alternating image layout is now separated from SVG arrow rotation. |
| Resources | Give useful help before a sale | Problem-led topic filters, featured friction guide, six complete reading pages, practical exercises, and Let's Talk handoff. No placeholder download or gated guide. The guides are newly authored site content, not represented as Tony-approved publications. |
| Let's Talk | Make starting a conversation easy | No service selection, context-first questions, optional supporting fields, what happens next, concise FAQs, and a direct email alternative. Draft preparation clearly explains that nothing has been sent. |

## Requirements retained across the site

- Main navigation opens real pages; logos return Home; next-chapter links preserve the eight-page order.
- People, Business Systems, and Process remain connected. Technology/AI supports this framework rather than becoming the protagonist.
- Voice-enabled and Non-voice capabilities remain distinct and subordinate to the business problem.
- Supplied real photographs support working contexts. Archival material provides company history, not fabricated client proof.
- Results are qualified; no invented testimonials, numbers, client logos, awards, or guarantees.
- Responsive layouts, semantic headings, alt text, focus indicators, reduced-motion behavior, and clear form labels remain part of the implementation.
- Header and typography are shared across pages. Layout reversal is an image-order class; only SVG arrows receive 180-degree rotation.

## Production work still outstanding

1. **Live implementation:** this remains a static local website, not a deployed WordPress/Elementor build. Production templates, hosting, and integration remain future work.
2. **Form delivery:** connect the contact flow to the chosen delivery endpoint and verify real delivery and confirmation. Do not claim receipt before that exists; the local version prepares an email draft.
3. **SEO and URLs:** local `noindex,nofollow` is intentional. Before launch, confirm the live domain, existing URLs, redirects, canonicals, sitemap, indexing, and appropriate structured data.
4. **Evidence and approval:** publish verified results or testimonials only after evidence and approval exist. Review the adapted copy and new guides with Tony before production publication.
5. **Pilot details:** the master mentions a 30-day pilot, while the newer numbered How It Works brief describes a focused pilot without a fixed duration. The local copy follows the newer numbered brief. Confirm duration, scope, review cadence, and commercial terms before making specific promises.
6. **Launch QA:** a full keyboard/accessibility audit, performance/Core Web Vitals measurements, production device checks, and live analytics/contact checks remain launch tasks; source checks and representative browser review do not substitute for them.

## Source documents

All paths below are relative to the parent `tony` folder:

- `00 - MASTER WEBSITE GUIDE/The purpose of this copy is to answer one question.pdf`
- `00 - MASTER WEBSITE GUIDE/00_MASTER_WEBSITE_GUIDE_One_Mahogany_Global.pdf`
- `00 - MASTER WEBSITE GUIDE/One Continuous Customer Journey.png`
- `01 - HOME Page/01 OMG HOME PAGE _ Website Rework Prompt.pdf`
- `02 - WHAT WE SOLVE Page/02 OMG WHAT WE SOLVE PAGE _ Website Rework Prompt.pdf`
- `03 - WHO WE HELP Page/03 OMG WHO WE HELP PAGE _ Website Rework Prompt.pdf`
- `04 - HOW IT WORKS Page/04 OMG HOW IT WORKS PAGE _ Website Rework Prompt.pdf`
- `05 - RESULTS Page/05 OMG RESULTS PAGE _ Website Rework Prompt.pdf`
- `06 - ABOUT US Page/ONE MAHOGANY GLOBAL _ About Page.pdf`
- `07 - RESOURCES Page/07 OMG RESOURCES PAGE _ Website Rework Prompt.pdf`
- `08 - LET_S TALK Page/08 OMG LET_S TALK PAGE _ Webstie Rework Prompt.pdf`

Additional source: `01 - HOME Page/01 - HOME Page _ images/Bridge/HOME PAGE — HERO-TO-BODY BRIDGE.pdf`. The image is preserved uncropped, with the copy on the left and the full archival frame on the right.

Latest user-selected bridge variation: restored the earlier centered introduction with a photo card and support panel, using the alternative archival barber close-up (`historic-barber.webp`). This intentionally adapts the standalone bridge note’s no-cards/no-CTA layout to the user’s preferred UI.

User-authorized exception: the capability section now uses an AI-generated branded office concept, explicitly requested by the user. Its alt text and asset provenance identify it as generated, not evidence of actual offices or staff. Other documentary assets remain supplied photography.
