# pattaya-gym.com — Codex Nuclear Audit V3 (SEO + Lighthouse + Pattaya Ranking)
Date: 2026-05-17
Auditor: Codex (read-only, deepest pass yet)
Branch: redesign-2026
HEAD: 47dd4c3
Live site state confirmed: 2026-05-17 15:31-15:49 America/Los_Angeles via curl checks
Lighthouse run: yes — Lighthouse 12.6.1, 14 valid runs. The requested --preset=mobile flag is not supported by this Lighthouse version, so I used Lighthouse default mobile plus --preset=desktop.
Competitor research run: yes — web-search proxy on 2026-05-17. Direct Google SERP scraping was blocked by Google's JavaScript/challenge page, so Section K is a search-proxy/rank-estimate, not rank-tracker truth.

## TL;DR
pattaya-gym.com is technically much stronger than a normal small local directory: 212 generated HTML pages, 211 sitemap URLs, 158 venue pages with full body copy, parse-valid JSON-LD, strong canonical/hreflang coverage, working security headers, and a real machine-readable API/LLM layer. The 158-venue invariant holds. The biggest live defect is cache/version drift: production /styles.css?v=405 is 8,549 bytes smaller than local and missing the local search CSS, while 23 guide/tool pages still reference styles.css?v=404. Lighthouse confirms the visible consequence: /search/ scores 57 mobile performance with CLS 0.490 and 74 desktop with CLS 0.565. Local SEO is the largest strategic gap: every venue has schema, but geo is 0/158, telephone is 47/158, opening hours are 51/158, and postalCode is 59/158. Content depth is excellent on venues, but category/area/utility pages are uneven and there are no combined category-area landing pages for the 90 long-tail combinations that can actually win Pattaya search. Estimated current Google rank bands: strong long-tail discovery, likely page 1 or near page 1 for 24 hour gym Pattaya and best gym Pattaya; page 2-4 for muay thai Pattaya, pattaya muay thai camps, pattaya yoga, and golf Pattaya. The single biggest unlock is a local-entity data completion sprint: geo + phone + hours + postal codes + category-area landing pages. With P0/P1 shipped, page 1 for gyms in Pattaya and pattaya muay thai camps is realistic within six months; muay thai Pattaya is possible but harder because Fairtex, Sityodtong, Reddit, and specialist Muay Thai publishers have stronger authority.

## 🎯 Ranking Probability Assessment (Section X synthesis)
1. Estimated current rank bands: 24 hour gym Pattaya 1-8; best gym Pattaya 4-10; gyms in Pattaya 5-12; fitness Pattaya 6-15; pattaya muay thai camps 10-25; muay thai Pattaya 12-25; pattaya yoga 15-35; golf Pattaya 20-40.
2. Top 5 levers: fix live asset/version drift; complete venue local schema fields; publish category-area long-tail pages; improve guide/entity E-E-A-T with bylines/sources/photos; reduce mobile CLS/LCP on search/home/category/area.
3. Top 5 risks: stale immutable assets, dead tool promises, incomplete LocalBusiness data, thin category/area pages, and stronger competitor authority from TripAdvisor, Golfasian, Fairtex, Sityodtong, Yoga Pattaya, and specialist Muay Thai/golf publishers.
4. Six-month outlook: page 1 for gyms in Pattaya is realistic if P0/P1 fixes ship and internal links are strengthened. Page 1 for pattaya muay thai camps is realistic with a packages/accommodation/prices guide plus completed schema. Page 1 for muay thai Pattaya is achievable but not guaranteed because the head term is brand- and authority-heavy.
5. Single biggest unlock: complete the local entity graph: add lat/lng, phone, postal code, exact opening hours, official sources, and combined area-category pages so every venue and every Pattaya neighborhood becomes machine-readable, internally linked, and query-addressable.

## 🟢 Strengths Confirmed
- 158/158 venues exist in data.js, 158/158 have detailFile, 158/158 venue pages render, and the rendered venue median is 1,246 words.
- 212 HTML pages have self-referential HTTPS canonicals, en + x-default hreflang, viewport, theme color, charset, lang, exactly one h1, parse-valid JSON-LD, resolved internal anchors, and image alt coverage.
- Sitemap is coherent at 211 URLs; every generated index.html URL is represented, and sampled live sitemap URLs returned 200.
- Live security headers are materially strong: CSP, HSTS preload, COOP, CORP, Permissions-Policy, Referrer-Policy, X-Frame-Options DENY, and nosniff are present.
- The AI/search layer is unusually good for a local directory: /api/venues.json, /openapi.yaml, /llms.txt, /.well-known/ai-plugin.json, and security.txt all exist and return live 200.
- Structural ranking advantage is real: 158 verified venues across 15 categories and 6 areas is broader than any individual gym site and broader than most blog listicles. The independent/no-paid-placements stance is a differentiator if surfaced more clearly on ranking pages.

## 🔴 P0 — Critical (ship now, ranking-impacting)
### P0-1 — Live /styles.css?v=405 is stale and immutable
- Severity: P0
- Pages affected: all pages using ?v=405; highest visible damage on /search/, homepage/category/area layout, and any page expecting appended search CSS.
- Evidence: local styles.css is 44,298 bytes; live /styles.css?v=405 is 35,749 bytes, ETag W/d17000..., cf-cache-status HIT, Cache-Control public max-age=31536000 immutable. Local search CSS starts at C:/pattayagym/styles.css:1230, and /search/ uses it at C:/pattayagym/search/index.html:61.
- Fix recommendation: purge Cloudflare for /styles.css?v=405 immediately or bump ASSET_VERSION to 406 and redeploy; add a live asset-hash parity guard to the deploy checklist.
- Effort estimate: 15-30 minutes.
- Ranking impact rationale: the stale asset creates a visible production quality regression and corresponds to Lighthouse /search/ CLS 0.490 mobile / 0.565 desktop.

### P0-2 — Guide/tool pages still ship v404 assets and footer version
- Severity: P0
- Pages affected: 23 pages still reference /styles.css?v=404; 24 pages show footer v404 including /search/.
- Evidence: examples are C:/pattayagym/guides/best-muay-thai-pattaya/index.html:13-14, C:/pattayagym/map/index.html:13-14, C:/pattayagym/compare/index.html:13-14, C:/pattayagym/favorites/index.html:13-14; C:/pattayagym/search/index.html:138 still says footer v404.
- Fix recommendation: regenerate or patch migrated guide/tool HTML so every stylesheet preload/link and footer reports v405 or the next bumped version.
- Effort estimate: 1-2 hours.
- Ranking impact rationale: guides are likely landing pages; stale assets make the locked V2 design unreliable.

### P0-3 — Tool pages still promise functionality they do not provide
- Severity: P0 carried forward from prior audits; not a new finding.
- Pages affected: /map/, /compare/, /plan-my-trip/, /find-my-coach/, /favorites/.
- Evidence: these pages do not load their matching JS/data bundles; /map/ has no Leaflet/data marker script and duplicate closing wrapper markup. llms.txt still describes them as interactive tools.
- Fix recommendation: either restore real JS-backed tools or convert pages to honest static guidance with no interactive promise.
- Effort estimate: 0.5-2 days depending on path.
- Ranking impact rationale: dead tools are a trust and conversion failure; they weaken E-E-A-T and can frustrate users landing from search.

## 🟠 P1 — High (ship this week)
### P1-1 — LocalBusiness schema is broad but locally incomplete
- Severity: P1
- Pages affected: 158 venue pages.
- Evidence: geo 0/158, telephone 47/158, openingHoursSpecification 51/158, postalCode 59/158, sameAs 122/158. Schema builder supports these fields at C:/pattayagym/build-v2.js:542-565, so this is data completion more than architecture.
- Fix recommendation: prioritize top 50 venues by search demand, then complete all 158 with lat/lng, phone, postal code, opening hours, official URL/social/source links.
- Effort estimate: 1-3 days for priority set; 1 week for full set.
- Ranking impact rationale: Google local rich result eligibility and AI extraction are blocked by missing geo/phone/hours.

### P1-2 — Mobile performance and CLS miss the target on key page types
- Severity: P1
- Pages affected: home, search, category, area templates.
- Evidence: mobile Lighthouse home perf 66 / CLS 0.343; search perf 57 / CLS 0.490; category Muay Thai perf 74 / CLS 0.163; Jomtien perf 71 / CLS 0.203. Top opportunities are render-blocking resources, unused JS, and legacy JS.
- Fix recommendation: reserve stable result/card/footer space, defer non-critical widgets, preload or self-host fonts, inline only the actual critical CSS, and eliminate stale search CSS deployment first.
- Effort estimate: 1-2 days.
- Ranking impact rationale: CWV weakness can suppress competitive SERPs and directly hurts mobile users in Thailand.

### P1-3 — No combined category-area landing pages exist
- Severity: P1
- Pages affected: 90 category-area opportunities.
- Evidence: every category page and area page exists independently, but no URL targets Muay Thai in Jomtien Pattaya, fitness in Pratamnak Pattaya, golf in Sattahip Pattaya, etc.
- Fix recommendation: start with 15-20 high-value combinations: Muay Thai/Fitness/Golf/Yoga/Racquet/Watersports in Jomtien, Pratamnak, Central Pattaya, East Pattaya, and Sattahip.
- Effort estimate: 2-5 days.
- Ranking impact rationale: long-tail local intent is where the directory can outrank stronger domains fastest.

### P1-4 — Heading hierarchy still fails on most pages
- Severity: P1
- Pages affected: 163/212 pages.
- Evidence: crawler found only 49/212 pages pass sequence; Lighthouse flags heading-order on home, venue, and search samples.
- Fix recommendation: normalize footer/social-card/contact headings so pages do not jump h2 to h4, and add a test in verify-deploy.js.
- Effort estimate: 0.5-1 day.
- Ranking impact rationale: primarily accessibility/trust, but also improves page comprehension for crawlers and assistive tech.

### P1-5 — Metadata completeness has systematic gaps
- Severity: P1
- Pages affected: 212 pages for Twitter/site robots meta; one OG issue on homepage.
- Evidence: twitter:site is missing on 212/212, robots meta is 0/212, x-dns-prefetch-control meta is 0/212, homepage lacks og:site_name while venue pages include it.
- Fix recommendation: add missing generator-level tags; keep robots value index, follow, max-image-preview:large, max-snippet:-1 if that is the chosen spec.
- Effort estimate: 1 hour.
- Ranking impact rationale: not catastrophic, but cheap site-wide SERP/social hygiene.

### P1-6 — Area and utility pages are underdeveloped relative to venue depth
- Severity: P1
- Pages affected: area pages, category pages, utility/tool pages.
- Evidence: utility median word count is 189; category median 479; thin pages include /area/sattahip/ 104 words, /category/bjj/ 119, /category/mma/ 136, /map/ 91, /compare/ 65.
- Fix recommendation: turn area pages into neighborhood guides with best-for sections, transport notes, nearby landmarks, and ranked internal links.
- Effort estimate: 2-4 days.
- Ranking impact rationale: area pages are the bridge between broad directory authority and local user intent.

## 🟡 P2 — Medium (ship this month)
### P2-1 — External link hygiene still has known leftovers
- Severity: P2
- Pages affected: 18 external http links and 6 blank-target links missing noreferrer.
- Evidence: examples include Greenwood Golf Club, Greta Sport Club, Khao Kheow Golf, Pattaya Padel Club, and Petchrungruang using http; crawl found 0 malformed tel and mailto issues.
- Fix recommendation: upgrade to HTTPS where live, otherwise document as legacy official-site URLs; add noopener noreferrer everywhere.
- Effort estimate: 1-2 hours.
- Ranking impact rationale: small trust/security cleanup; closes prior-audit leftovers.

### P2-2 — Orphan CSS classes on migrated guide/tool pages
- Severity: P2
- Pages affected: 17 guides + guide index + 6 tool pages.
- Evidence: 51 class names are used without CSS coverage. Examples: cat-venue-card, cv-pill, favorite-btn, venue-cat-pill, map-layout, tool-results, channel-*.
- Fix recommendation: either add V2 CSS rules for these primitives or rewrite inner templates to existing V2 classes.
- Effort estimate: 1-2 days.
- Ranking impact rationale: visual polish and trust; especially important for guide pages that should earn links.

### P2-3 — Sitemap secondary files and repo hygiene remain messy
- Severity: P2
- Pages affected: repo/deploy operations, not end-user pages.
- Evidence: sitemap-index.xml and sitemap_index.xml both exist and are tracked. .gitignore has 26 NUL bytes, push-output.txt has 1,671 NUL bytes, and .git is about 321 MB.
- Fix recommendation: clean .gitignore, remove duplicate underscore sitemap if no longer needed, move archives out of the repo, and update .gitignore.
- Effort estimate: 1-3 hours.
- Ranking impact rationale: indirect; reduces deploy mistakes that lead to production regressions like stale assets.

### P2-4 — README and stale docs no longer describe the current V2 pipeline accurately
- Severity: P2
- Pages affected: documentation.
- Evidence: README.md still describes a build.js -> build-extras.js -> build-discovery.js chain while package.json now sets build to node build-v2.js.
- Fix recommendation: update README and stale docs to the V2 pipeline, asset version process, Cloudflare purge rule, and verify-deploy guard.
- Effort estimate: 1-2 hours.
- Ranking impact rationale: indirect but important: bad docs create bad deploys.

### P2-5 — White text on pink fails contrast when used as normal text
- Severity: P2
- Pages affected: any CTA/control using white on #ff2e7e; back-to-top is the visible sample.
- Evidence: computed contrast is 3.53:1. Black on pink is fine; the nav-cta pattern already uses black text.
- Fix recommendation: use black text on pink, darken pink, or restrict white-on-pink to large/bold text that meets applicable thresholds.
- Effort estimate: 30 minutes.
- Ranking impact rationale: accessibility quality and Lighthouse a11y score.

### P2-6 — Guide/article rich-result opportunities are unused
- Severity: P2
- Pages affected: 17 guide pages and FAQs.
- Evidence: JSON-LD type counts include FAQPage 0 and Article 0.
- Fix recommendation: add Article schema to guides, FAQPage where visible FAQ content exists, and byline/date/source fields.
- Effort estimate: 0.5-1 day.
- Ranking impact rationale: better eligibility and clearer topical authority for guide SERPs.

## 🟢 P3 — Low / polish
### P3-1 — PWA is manifest-only
- Severity: P3
- Pages affected: install/offline behavior.
- Evidence: /manifest.json has required fields and icons; no sw.js, service-worker.js, or navigator.serviceWorker registration was found.
- Fix recommendation: either leave as manifest-only or add a conservative offline page/cache strategy after core SEO fixes.
- Effort estimate: 0.5-1 day.
- Ranking impact rationale: low direct SEO effect.

### P3-2 — Image format optimization can improve weight
- Severity: P3
- Pages affected: OG/social images and any future visible media.
- Evidence: 158/158 venue OG images are correct 1200x630 PNGs; median size 27,209 bytes. No WebP/AVIF variant strategy found.
- Fix recommendation: keep PNG for compatibility, optionally add WebP/AVIF for page-visible images if introduced.
- Effort estimate: 0.5 day.
- Ranking impact rationale: low unless page-visible media expands.

### P3-3 — Language and spelling consistency needs an editorial note
- Severity: P3
- Pages affected: site-wide copy.
- Evidence: both Pratamnak and Pratumnak appear intentionally; mixed British/American terms such as centre/center and travellers/travelers appear in data/copy.
- Fix recommendation: document house style: use both Pratamnak/Pratumnak for search capture, otherwise pick British or American spelling by page type.
- Effort estimate: 1 hour.
- Ranking impact rationale: polish and trust, not a blocker.

## ⚡ Lighthouse Results (per URL, mobile + desktop)
| Page | Strategy | Perf | SEO | A11y | BP | FCP | LCP | CLS | INP | TBT | Speed Index | Top opportunities | Diagnostics/failures |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| Home | mobile default | 66 | 100 | 94 | 100 | 2.97s | 3.74s | 0.343 | n/a | 97ms | 2.97s | render-blocking, unused JS, legacy JS | CLS .btn-row; color contrast; heading order |
| Home | desktop | 97 | 100 | 94 | 100 | 0.83s | 1.12s | 0.051 | n/a | 0ms | 0.83s | render-blocking, unused JS, legacy JS | color contrast; heading order |
| Fairtex | mobile default | 79 | 100 | 94 | 100 | 3.11s | 4.41s | 0.031 | n/a | 53ms | 3.11s | render-blocking, unused JS, legacy JS | color contrast; heading order |
| Fairtex | desktop | 96 | 100 | 94 | 100 | 0.92s | 1.10s | 0.053 | n/a | 0ms | 0.92s | render-blocking, unused JS, legacy JS | color contrast; heading order |
| Fitz Club | mobile default | 81 | 100 | 94 | 100 | 2.96s | 4.22s | 0.022 | n/a | 47ms | 2.96s | render-blocking, unused JS, legacy JS | color contrast; heading order |
| Fitz Club | desktop | 98 | 100 | 94 | 100 | 0.79s | 1.08s | 0.020 | n/a | 0ms | 0.79s | render-blocking, unused JS, legacy JS | color contrast; heading order |
| Category Muay Thai | mobile default | 74 | 100 | 100 | 100 | 2.96s | 4.22s | 0.163 | n/a | 55ms | 2.96s | render-blocking, unused JS, legacy JS | CLS near nav/hero |
| Category Muay Thai | desktop | 96 | 100 | 100 | 100 | 0.86s | 1.22s | 0.044 | n/a | 0ms | 0.86s | render-blocking, unused JS, legacy JS | minor CLS |
| Area Jomtien | mobile default | 71 | 100 | 100 | 100 | 2.95s | 4.19s | 0.203 | n/a | 56ms | 2.95s | render-blocking, unused JS, legacy JS | CLS section |
| Area Jomtien | desktop | 98 | 100 | 100 | 100 | 0.81s | 0.90s | 0.036 | n/a | 0ms | 0.81s | render-blocking, unused JS, legacy JS | minor render-blocking |
| Search | mobile default | 57 | 100 | 98 | 100 | 2.93s | 4.64s | 0.490 | n/a | 62ms | 2.93s | render-blocking, unused JS, legacy JS | CLS .pa-network + .result-card-desc; heading order |
| Search | desktop | 74 | 100 | 98 | 100 | 0.86s | 1.27s | 0.565 | n/a | 0ms | 0.86s | render-blocking, unused JS, legacy JS | CLS huge; LCP h2.pa-network-h |
| Guide Muay Thai | mobile default | 84 | 100 | 96 | 100 | 2.94s | 3.70s | 0.007 | n/a | 41ms | 2.94s | render-blocking, unused JS, legacy JS | color contrast |
| Guide Muay Thai | desktop | 97 | 100 | 96 | 100 | 0.86s | 1.13s | 0.009 | n/a | 0ms | 0.86s | render-blocking, unused JS, legacy JS | color contrast |

Notes: Lighthouse 12.6.1 did not return INP field values in these lab runs. Default Lighthouse mode is mobile emulation; the explicit --preset=mobile command failed because this version only accepts perf, experimental, and desktop presets. All valid results are from production URLs.

## 🔍 SERP Competitor Analysis (Section K)
Direct Google result scraping was blocked; this is based on web-search proxy results and manual review of surfaced pages. Sources used include [TripAdvisor Pattaya gyms](https://www.tripadvisor.com/Attractions-g293919-Activities-c40-t129-Pattaya_Chonburi_Province.html), [Golfasian Pattaya golf guide](https://www.golfasian.com/golf-news/the-best-golf-courses-in-pattaya/), [Pattaya Pointer Muay Thai guide](https://pattayapointer.com/guides/pattaya-muay-thai-guide/), [Yoga Pattaya Studio](https://yogapattaya.com/), [Balance Yoga Studio](https://balancepattaya.com/), [Fairtex Training Center](https://fairtextrainingcenter.com/), [Sityodtong](https://sityodtongthailand.com/home/), [Thailand Nomads gym guide](https://www.thailandnomads.com/best-gyms-in-pattaya/), and [Buzzin Pattaya Jetts 24 Hour Fitness](https://buzzinpattaya.com/jetts-24-hour-fitness-little-walk-pattaya/).

| Query | Proxy top domains surfaced on 2026-05-17 | Aggregator count | Estimated pattaya-gym.com rank band | Gap vs winners |
|---|---|---:|---|---|
| gyms in pattaya | pattaya-gym.com, tripadvisor.com, thailandnomads.com, buzzinpattaya.com, castragym.com, elitegympattaya.com, top-rated.online, thaimbc.com, amari.com, expatsthai.com | 5/10 | 5-12 | Review volume, GBP/entity authority, price/day-pass snippets |
| muay thai pattaya | fairtextrainingcenter.com, sityodtongthailand.com, pattayapointer.com, pattaya-gym.com, muaythaicampsinthailand.com, muaythaiadvisor.com, actionsportasia.com, thebaht.com, wheredex.com, reddit.com | 6/10 | 12-25 | Authoritative camp brands and specialist Muay Thai publishers |
| best gym pattaya | pattaya-gym.com, tripadvisor.com, thailandnomads.com, buzzinpattaya.com, castragym.com, elitegympattaya.com, top-rated.online, thaimbc.com, amari.com, expatsthai.com | 6/10 | 4-10 | Needs stronger dedicated best-gym guide with current prices and proof |
| fitness pattaya | pattaya-gym.com, castragym.com, elitegympattaya.com, top-rated.online, thailandnomads.com, amari.com, buzzinpattaya.com, lovethailand.org, fairtextrainingcenter.com, thaimbc.com | 4/10 | 6-15 | Individual venue/entity pages are strong; directory can win with comparison depth |
| golf pattaya | golfasian.com, pattayapointer.com, fairwaysofeden.com, sawadeegolf.com, thailandnomads.com, siamcountryclub.com, cheechangolf.com, tripadvisor.com, golfpattaya.com, pattayasports.org | 7/10 | 20-40 | Mature travel vertical with booking, tee-time, green-fee, transport intent |
| pattaya yoga | yogapattaya.com, balancepattaya.com, thailandnomads.com, tripadvisor.com, pattaya-gym.com, elitegympattaya.com, hotel/spa pages, Facebook/Maps listings | 3/10 | 15-35 | Need class schedules, teacher names, and Russian/Thai language targeting |
| 24 hour gym pattaya | pattaya-gym.com, buzzinpattaya.com, jettsfitness.com, anytimefitness.co.th, fitness7 pages/listings, Tony's pages/listings, TripAdvisor/Maps, Reddit | 4/10 | 1-8 | One of the best current opportunities; guide already targets it |
| pattaya muay thai camps | fairtextrainingcenter.com, boxethaipattaya.com, sityodtongthailand.com, pattayapointer.com, thebaht.com, wheredex.com, muaythaicampsinthailand.com, actionsportasia.com, muaythaiadvisor.com, reddit.com | 6/10 | 10-25 | Needs packages/accommodation/prices/training schedule table |

Common winning patterns: list pages with prices, current hours, Google review/social proof, best-for segmentation, first-hand tone, venue photos, maps, and booking/tee-time/package CTAs. Pattaya.gym's advantage is breadth and independence; competitors' advantage is authority, reviews, photos, and transactional intent.

## 🗺 Keyword Opportunity Map (Section L)
Every row below lacks a dedicated combined category-area page today. The site has the component category page and area page, but that is weaker than a landing page that answers the exact query.

| Keyword | Has dedicated page? | Current targeting strength | Search volume tier | Priority |
|---|---|---|---|---|
| Muay Thai in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Muay Thai in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Muay Thai in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Muay Thai in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Muay Thai in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Muay Thai in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| MMA in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| MMA in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| MMA in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| MMA in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| MMA in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| MMA in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| BJJ in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| BJJ in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| BJJ in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| BJJ in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| BJJ in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| BJJ in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| CrossFit in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| CrossFit in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| CrossFit in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| CrossFit in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| CrossFit in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| CrossFit in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Fitness in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Fitness in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Fitness in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Fitness in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Fitness in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Fitness in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Yoga in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Yoga in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Yoga in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Yoga in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Yoga in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Yoga in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Golf in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Golf in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Golf in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Golf in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Golf in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Golf in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | high | P1 |
| Racquet sports in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Racquet sports in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Racquet sports in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Racquet sports in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Racquet sports in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Racquet sports in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Swimming in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Swimming in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Swimming in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Swimming in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Swimming in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Swimming in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Watersports in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Watersports in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Watersports in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Watersports in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Watersports in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Watersports in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Climbing in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Climbing in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Climbing in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Climbing in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Climbing in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Climbing in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Clubs in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Clubs in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Clubs in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Clubs in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Clubs in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Clubs in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Kids sport in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Kids sport in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Kids sport in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Kids sport in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Kids sport in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Kids sport in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Equestrian in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Equestrian in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Equestrian in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Equestrian in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Equestrian in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Equestrian in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | low | P3 |
| Adventure in Jomtien Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Adventure in Naklua Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Adventure in Pratamnak Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Adventure in Central Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Adventure in East Pattaya Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |
| Adventure in Sattahip Pattaya | No | partial: category and area pages exist separately, but no combined landing page | medium | P2 |

Additional high-value intent gaps: gym near Walking Street Pattaya is partially covered by a guide; cheapest gym Pattaya, 24-hour gym Pattaya, family-friendly Pattaya sport, and best for beginners Pattaya have guides; English-speaking Muay Thai Pattaya, Muay Thai camp Jomtien, fitness Pratamnak, padel courts Pattaya, diving Sattahip, and gym with accommodation Pattaya need stronger dedicated or guide-level targeting.

## 📊 Raw Numbers Table (80+ rows)
| Metric | Value |
|---|---:|
| Git branch | redesign-2026 |
| HEAD | 47dd4c3 |
| Dirty pre-existing file | push-output.txt modified |
| Untracked pre-existing file | CODEX_NUCLEAR_AUDIT_V3.md |
| HTML pages crawled | 212 |
| Sitemap URL count | 211 |
| Sitemap lastmod | 2026-05-17 on all URLs |
| Sitemap priority tags | 0 |
| Sitemap changefreq tags | 0 |
| Venue invariant | 158 data venues / 158 venue HTML / 158 detailFile links |
| Categories | 15 |
| Areas | 6 |
| Venue MD files | 158 |
| Venue MD median words | 1,222.5 |
| Venue MD P10/P90 | 980.8 / 1,522.0 |
| Shortest venue MD | rusich-club-football.md, 855 words |
| Longest venue MD | fairtex-pattaya.md, 3,407 words |
| Rendered venue median words | 1,246 |
| Homepage words | 1,026 |
| Category median words | 479 |
| Area median words | 677.5 |
| Guide median words | 918 |
| Utility median words | 189 |
| Thin pages under 500 words | 24 |
| Titles present | 212/212 |
| Title 30-60 chars | 174/212 |
| Title 20-65 chars | 194/212 |
| Brand in title | 211/212 |
| Meta descriptions present | 212/212 |
| Description 110-155 chars | 102/212 |
| Description 80-165 chars | 211/212 |
| Canonical self HTTPS | 212/212 |
| Hreflang en + x-default | 212/212 |
| OG complete | 211/212 |
| Twitter complete | 0/212 missing twitter:site |
| Viewport meta | 212/212 |
| theme-color #000000 | 212/212 |
| html lang en | 212/212 |
| charset utf-8 | 212/212 |
| Robots meta | 0/212 |
| x-dns-prefetch-control meta | 0/212 |
| Exactly one h1 | 212/212 |
| Heading hierarchy pass | 49/212 |
| Heading hierarchy fail | 163/212 |
| Internal anchors resolved | 212/212 |
| Images with alt | 212/212 |
| JSON-LD blocks | 423 parse-valid |
| LocalBusiness schema | 158 |
| Venue schema geo | 0/158 |
| Venue schema telephone | 47/158 |
| Venue schema openingHoursSpecification | 51/158 |
| Venue schema postalCode | 59/158 |
| Venue schema sameAs | 122/158 |
| Venue mapsUrl | 158/158 |
| Venue website | 105/158 |
| Venue phone | 47/158 |
| Venue verified date | 158/158 |
| API venue count | 158 |
| API category count | 15 |
| Internal hrefs | 5,181 |
| External https hrefs | 4,023 |
| External http hrefs | 18 |
| Anchor hrefs | 238 |
| mailto hrefs | 542 |
| tel hrefs | 141 |
| Malformed tel | 0 |
| Malformed mailto | 0 |
| Missing internal targets | 0 |
| target blank external links | 2,533 |
| target blank missing noreferrer | 6 |
| Local styles.css raw/gzip | 44,298 / 8,025 bytes |
| Live styles.css?v=405 bytes | 35,749 |
| CSS live-local delta | -8,549 bytes |
| data.js raw/gzip | 113,063 / 28,924 bytes |
| search-page.js raw/gzip | 7,848 / 2,714 bytes |
| app.bundle.js raw/gzip | 28,293 / 7,529 bytes |
| Pages using styles.css?v=404 | 23 |
| Pages showing footer v404 | 24 |
| CSS classes defined | 144 |
| Classes used | 169 |
| Orphan class names | 51 |
| OG venue images | 158/158 |
| OG image dimensions | all 1200x630 |
| OG venue median size | 27,209 bytes |
| Default og-image.png | 1200x630, 32,546 bytes |
| Icon 192 | 192x192, 2,471 bytes |
| Icon 512 | 512x512, 7,347 bytes |
| Manifest required fields | present |
| Service worker | absent |
| security.txt | present/live 200 |
| ai-plugin.json | present/live 200 |
| openapi.yaml | present/live 200 |
| llms.txt | present/live 200 |
| Duplicate sitemap index files | sitemap-index.xml + sitemap_index.xml |
| Tracked archive artifacts | two tracked backup artifacts plus manifest; root archives present |
| Working tree bytes excl .git/node_modules | 23,246,812 |
| .git bytes | 321,408,964 |
| .gitignore NUL bytes | 26 |
| push-output.txt NUL bytes | 1,671 |
| Unknown NUL file | zirZ3Bwy, 12,238 NUL bytes |
| node --check files | 12/12 pass |
| verify-deploy.js | PASSED: 212 HTML, no truncation/mid-attribute/NUL, CSS/CSP OK |
| Contrast text #f5f5f5 on black | 19.26:1 |
| Contrast text-2 #c4c4c4 on black | 12.04:1 |
| Contrast muted/hint #888 on black | 5.92:1 |
| Contrast pink #ff2e7e on black | 5.94:1 |
| Contrast cyan #4ee0ff on black | 13.43:1 |
| Contrast yellow #fde047 on black | 15.93:1 |
| Contrast mint #5fffa0 on black | 16.30:1 |
| Contrast red #ff3d3d on black | 5.99:1 |
| Contrast white on pink | 3.53:1 FAIL |
| Homepage mobile Lighthouse | Perf 66, SEO 100, A11y 94, BP 100 |
| Search mobile Lighthouse | Perf 57, CLS 0.490 |
| Search desktop Lighthouse | Perf 74, CLS 0.565 |
| Best mobile perf sampled | Guide 84 |
| Worst mobile perf sampled | Search 57 |
| Best desktop perf sampled | Fitz/Jomtien 98 |
| Worst desktop perf sampled | Search 74 |
| Live root headers | CSP, HSTS, COOP, CORP, Permissions-Policy, Referrer-Policy, DENY, nosniff present |
| X-Robots-Tag live | absent |
| Inline event handlers | 0 |
| External HTTP examples | greenwood, greta, khao-kheow, pattaya-padel, petchrungruang |
| Pattaya mentions | 20,407 |
| Jomtien mentions | 1,126 |
| Naklua mentions | 480 |
| Pratamnak mentions | 289 |
| Pratumnak mentions | 197 |
| Central Pattaya mentions | 526 |
| East Pattaya mentions | 231 |
| Sattahip mentions | 170 |
| Walking Street mentions | 181 |
| Local search CSS rule | C:/pattayagym/styles.css:1230 |
| Local search markup | C:/pattayagym/search/index.html:61 |
| Asset version constant | C:/pattayagym/build-v2.js:23 = 405 |

## 🔧 Recommended Fix Order (30+ items)
1. **Bust or purge the stale live /styles.css?v=405 asset** — P0, effort S. Restores the Round 4 search CSS and removes the largest live parity failure.
2. **Add /search-page.js to immutable asset rules and bump all affected assets together** — P0, effort S. Prevents mixed cache generations across CSS, data, and page JS.
3. **Regenerate or patch all guide/tool HTML still referencing styles.css?v=404** — P0, effort M. Brings 23 pages back onto the locked V2 asset version.
4. **Either restore tool-page JavaScript or convert dead tools to honest static guidance** — P0, effort M. Avoids promising map/compare/favorites functionality that does not exist.
5. **Add geo coordinates to all 158 venues** — P1, effort L. Largest LocalBusiness rich-result gap; Google local understanding improves materially.
6. **Complete phone numbers for priority venues** — P1, effort M. LocalBusiness telephone coverage is only 47/158.
7. **Complete opening hours and postal codes for priority venues** — P1, effort M. Hours are 51/158 and postalCode is 59/158.
8. **Fix mobile CLS on search, homepage, category, and area templates** — P1, effort M. Search CLS 0.49 mobile / 0.565 desktop is a direct UX and CWV liability.
9. **Reduce render-blocking font/CSS cost** — P1, effort M. Every Lighthouse run flags render-blocking resources; mobile LCP is 3.7-4.6s.
10. **Add combined category-area landing pages for top opportunities** — P1, effort L. No page targets Muay Thai in Jomtien Pattaya, fitness in Pratamnak, etc.
11. **Add Article schema for guides and FAQPage for guide FAQs** — P1, effort M. FAQPage and Article are both 0 despite guide content existing.
12. **Fix heading hierarchy globally** — P1, effort M. 163/212 pages fail h2-to-h4 sequencing, matching Lighthouse a11y failures.
13. **Add missing twitter:site and homepage og:site_name** — P1, effort S. Twitter complete set is 0/212; OG is 211/212.
14. **Add explicit robots meta and x-dns-prefetch-control meta if retained in spec** — P1, effort S. Both are 0/212 versus the audit target.
15. **Expand area pages from list pages into neighborhood guides** — P1, effort M. Area pages are internally underlinked and some are thin.
16. **Strengthen internal links to area and guide pages** — P1, effort M. Area pages have roughly one incoming link; many venues/guides have fewer than five.
17. **Replace 18 external http links with HTTPS or mark as legacy** — P2, effort S. Removes mixed-content and trust blemishes.
18. **Add noreferrer to the six remaining blank-target external links** — P2, effort S. Closes prior rel-policy issue.
19. **Fix white-on-pink contrast on back-to-top/CTA usage** — P2, effort S. 3.53:1 fails WCAG AA for normal text.
20. **Resolve guide/tool orphan class names** — P2, effort M. 51 class names are used without CSS coverage.
21. **Add sitemap priority/changefreq or document omission** — P2, effort S. All 211 sitemap URLs lack both tags despite prior target.
22. **Delete or stop publishing duplicate sitemap_index.xml** — P2, effort S. Prior audit duplicate remains.
23. **Clean .gitignore NUL/UTF-16 tail** — P2, effort S. Repo hygiene issue survives multiple rounds.
24. **Move backup artifacts out of repo and enforce .gitignore** — P2, effort S. Repo and .git sizes are inflated by archives.
25. **Update README to V2 build reality** — P2, effort S. README still documents the old build chain while package build is node build-v2.js.
26. **Audit stale docs referencing old build.js pipeline** — P2, effort M. Stale operational docs raise deploy risk.
27. **Add visible author/byline and methodology snippets on guide pages** — P2, effort M. Improves E-E-A-T for competitive guide SERPs.
28. **Add sameAs/official source links for remaining venues** — P2, effort M. sameAs is 122/158.
29. **Render source citations from venue MDs** — P2, effort M. Source data exists but is not consistently prominent to users/crawlers.
30. **Add image compression/WebP strategy for future visible media** — P2, effort M. PNG OGs are correct, but future page media needs modern delivery.
31. **Add service worker/offline page only if PWA is truly desired** — P3, effort M. Manifest exists but offline readiness is absent.
32. **Standardize Pratamnak/Pratumnak handling in style docs** — P3, effort S. Both intended variants appear; make it explicit.
33. **Normalize British/American spelling by page type** — P3, effort M. Mixed center/centre and traveler/traveller style appears.
34. **Add SRI only where practical for stable third-party scripts** — P3, effort S. Nice-to-have; dynamic Google assets make broad SRI awkward.
35. **Defer multilingual landing experiments until English core stabilizes** — P3, effort L. Russian/Thai demand exists, but English core has higher leverage now.

## 🏗 What to build vs what to fix
**Bug fixes first:** stale live CSS, v404 guide/tool assets, dead tool pages, heading hierarchy, metadata omissions, external link hygiene, .gitignore NULs, duplicate sitemap index, README drift, and mobile CLS. These are defects in already-shipped behavior.

**Feature/data additions second:** venue geo/phone/hours/postal completion, category-area landing pages, Article/FAQ schema, visible bylines/founder proof, richer area guides, source citations, multilingual variants, and optional PWA/offline strategy. These create new ranking surface and trust but should not precede production correctness fixes.

## ⏭ Out-of-scope (defer to round 6)
Human photos of Tim/Paemi, venue visit photos, first-person training notes, formal backlink outreach, Google Business Profile/entity work, venue-owner partnerships, paid rank tracking, multilingual translation QA, video assets, and major redesign ideas are out of scope. The V2 design system is locked; all recommendations above execute within it.

## 📝 Notes for next session
- The report did not modify production code or run a build. node scripts/verify-deploy.js passed locally, but live CSS parity still fails.
- Direct Google SERP access was blocked; run a real rank tracker or Search Console query export before making final rank claims.
- Cloudflare Email Address Obfuscation explains most HTML byte deltas; the stylesheet delta is not CF noise.
- /search/ is functionally working: query fairtex returned two result cards and area=naklua narrowed it to one card in browser testing. The problem is visual/layout stability from stale CSS and injected content.
- Search footer says v404 while assets are v405; do not use footer version alone as deploy truth.

## Dimension-by-Dimension Findings (A-X)
**A. Local-vs-live integrity:** HTML parity mostly passes after stripping Cloudflare email obfuscation. The hard fail is /styles.css?v=405, which is stale live, immutable, and 8,549 bytes smaller than local. data.js?v=405 and search-page.js?v=405 are byte-identical. /_headers is not publicly served as content; header behavior was verified on real URLs.

| URL | HTTP | Live bytes | Local bytes | Raw delta | Normalized delta | Result |
|---|---:|---:|---:|---:|---:|---|
| / | 200 | 31,995 | 31,711 | +284 | -93 | CF email-only |
| /styles.css?v=405 | 200 | 35,749 | 44,298 | -8,549 | -8,549 | FAIL |
| /data.js?v=405 | 200 | 113,063 | 113,063 | 0 | 0 | PASS |
| /search-page.js?v=405 | 200 | 7,848 | 7,848 | 0 | 0 | PASS |
| /gyms/fairtex-pattaya/ | 200 | 56,134 | 54,695 | +1,439 | +561 | CF email-only |
| /gyms/fitz-club/ | 200 | 43,920 | 42,266 | +1,654 | +636 | CF email-only plus email rewrite |
| /gyms/sityodtong-pattaya/ | 200 | 47,618 | 46,497 | +1,121 | +504 | CF email-only |
| /gyms/lumpinee-boxing-stadium/ | 200 | 34,437 | 33,256 | +1,181 | +504 | CF email-only |
| /gyms/kombat-group-thailand/ | 200 | 48,192 | 47,061 | +1,131 | +504 | CF email-only |
| /category/muay-thai/ | 200 | 27,457 | 26,708 | +749 | +504 | CF email-only |
| /category/fitness/ | 200 | 31,840 | 31,091 | +749 | +504 | CF email-only |
| /category/golf/ | 200 | 25,600 | 24,851 | +749 | +504 | CF email-only |
| /area/jomtien/ | 200 | 36,092 | 35,343 | +749 | +504 | CF email-only |
| /area/east-pattaya/ | 200 | 28,657 | 27,908 | +749 | +504 | CF email-only |
| /area/pratamnak/ | 200 | 19,060 | 18,311 | +749 | +504 | CF email-only |
| /about/ | 200 | 15,699 | 14,813 | +886 | +504 | CF email-only |
| /contact/ | 200 | 14,630 | 13,744 | +886 | +504 | CF email-only |
| /methodology/ | 200 | 13,609 | 12,860 | +749 | +504 | CF email-only |
| /press/ | 200 | 15,044 | 14,021 | +1,023 | +504 | CF email-only |
| /guides/best-muay-thai-pattaya/ | 200 | 34,109 | 33,742 | +367 | +122 | CF email-only |
| /guides/best-dive-operators-pattaya/ | 200 | 31,396 | 30,999 | +397 | +152 | CF email-only |
| /search/ | 200 | 13,405 | 12,822 | +583 | +338 | CF email-only |
| /search/?cat=muay-thai | 200 | 13,405 | 12,822 | +583 | +338 | CF email-only |
| /sitemap.xml | 200 | 21,704 | 21,704 | 0 | 0 | PASS |
| /robots.txt | 200 | 1,408 | 1,408 | 0 | 0 | PASS |
| /404.html | 200 | 11,695 | 10,946 | +749 | +504 | CF email-only |

**B. Technical SEO:** Canonical, hreflang, viewport, theme-color, charset, lang, h1, image alt, anchor integrity, and JSON-LD validity are strong. Systematic misses are robots meta 0/212, x-dns-prefetch-control 0/212, twitter:site 0/212, homepage og:site_name missing, and heading hierarchy failures on 163/212 pages.

**C. Local SEO for Pattaya:** Venue breadth is the moat, but local fields are incomplete: geo 0/158, telephone 47/158, openingHoursSpecification 51/158, postalCode 59/158. Pattaya/neighborhood mentions are dense enough for the city, but area pages need neighborhood-specific copy and stronger internal links. Maps links exist for 158/158; embeds are optional, but lat/lng schema is not optional for local SEO quality.

**D. Content SEO:** Venue content depth is excellent. Median rendered venue page is 1,246 words and every venue MD source was found. Weakness is template/page-type imbalance: utility median 189 words, category median 479, and 24 pages are under 500 words. Semantic terms exist on strong Muay Thai pages, but category-area combinations are mostly untargeted.

**E. Lighthouse:** Real production Lighthouse ran successfully across seven URLs in mobile default and desktop. SEO scores are 100 across samples; best practices are 100. Performance is desktop-strong except search, but mobile misses the target on home/search/category/area. Top opportunities are render-blocking resources, unused JS, and legacy JS.

**F. Mobile experience:** Viewport is present everywhere. CSS breakpoints include 700/768/800/900 patterns, not a full 360/414/768 strategy. Mobile nav stacks rather than using a hamburger. Tap target classes mostly use adequate padding, but CLS and font loading are the real mobile problems. Search mobile score is 57, below the 75 target.

**G. Accessibility:** Skip link and main id=main are present, reduced motion CSS exists, focus-visible styling exists, no positive tabindex or inline handlers were found. Contrast is mostly excellent on black, but white-on-pink is 3.53:1 and fails normal text. Heading order remains the largest a11y issue.

**H. JSON-LD structured data:** 423 JSON-LD blocks parse. Counts include LocalBusiness 158, BreadcrumbList 211, ItemList 21, WebSite/SearchAction/Organization on homepage, and category-specific venue subtypes. FAQPage and Article are both 0. A sample venue would not be fully eligible for robust Local Business rich treatment because geo, phone, and hours are often absent.

**I. Sitemap + crawl directives:** sitemap.xml has 211 URLs and fresh 2026-05-17 lastmod values; sampled live URLs return 200. Every on-disk generated index page maps into the sitemap. Robots allows major search and AI crawlers and references sitemap-index.xml. Duplicate sitemap_index.xml still exists. Priority/changefreq are absent.

**J. Link hygiene:** Internal targets resolve and tel/mailto sanitization is good. External cleanup remains: 18 http links and six blank-target links missing noreferrer. Duplicate href instances are mostly expected nav/footer/card repetition.

**K. Competitors:** Search-proxy results show Pattaya.gym already being discovered for some long-tail and gym queries. Competitors split into aggregators, specialist guides, individual venues, and Reddit/Maps-style UGC. Pattaya.gym can beat aggregators on coverage and freshness, but must add more local facts and proof.

**L. Keyword opportunities:** The 90 category-area combinations are the main gap. Today the site answers them indirectly; it needs dedicated pages or guide sections for high-value pairs. Also prioritize English-speaking, 24-hour, beginner, with accommodation, near Walking Street, and cheapest modifiers.

**M. E-E-A-T:** Methodology, about, contact, press, security.txt, source-cited venue MDs, and no-paid-placement positioning are strong. Missing or weak: visible bylines on guides, founder/operator photo and signature, first-person verification notes, and more prominent source links on venue pages.

**N. AI search readiness:** Strong. /llms.txt, /api/venues.json, /openapi.yaml, /.well-known/ai-plugin.json, and permissive AI crawler robots rules exist. The main AI extraction weakness is not file discovery; it is missing geo/phone/hours/postal fields and dead tool promises in llms.txt.

**O. Visual quality + V2 adherence:** Homepage, venue, category, area, and many utility pages follow V2: black background, Space Grotesk/Inter/JetBrains Mono, neon accents, marquees, brand dot, progress bar, footer, skip/back-to-top. Regressions are v404 guide/tool assets, orphan classes, and live stale CSS missing search styling.

**P. Tool page functional state:** /search/ works with live filtering. /map/, /compare/, /plan-my-trip/, /find-my-coach/, and /favorites/ are not functionally restored to the level their copy implies. Either wire the scripts/data or convert them to honest static pages.

**Q. Build pipeline + repo hygiene:** node --check passed for all requested JS files and verify-deploy.js passed. Build determinism is mostly stable but build-v2.js uses current date/timestamp intentionally, so byte-identical rebuilds across time are not expected. Repo hygiene issues remain: .gitignore NUL bytes, duplicate sitemap index, archive artifacts, and stale README/docs.

**R. Security + headers:** Live headers are strong and CSP hashes match current inline scripts per deploy guard. security.txt and ai-plugin.json exist. Inline event handlers count is 0. X-Robots-Tag is absent. SRI is not used for third-party assets; this is low priority given the current external set.

**S. Image / asset audit:** All 158 venue OG images exist at 1200x630. Default OG and icon PNGs exist. Below-fold visible image strategy is limited because pages are mostly text/cards. Future visible images should use lazy loading and modern formats.

**T. PWA + offline readiness:** Manifest is present with name, short_name, start_url, display, background/theme colors, and 192/512 icons. No service worker or offline strategy is present. Treat PWA as optional polish unless installability becomes a product goal.

**U. Migrated legacy guide/tool page health:** Sample guide/tool pages show orphan class names and v404 assets. This is the main V2 adherence risk outside the core generated pages. Recommended path: rewrite inner templates to V2 primitives rather than preserving old class vocabulary.

**V. Prior-audit finding verification:** See reconciliation table below. Resolved P0s were not reopened as fresh findings; stale CSS is flagged specifically as a live parity/cache regression after Round 4, while local CSS syntax and CSP hash issues are fixed.

| Prior finding | Source | Status now | Evidence |
|---|---|---|---|
| Homepage mid-attribute truncation | Round 4 P0 | Fixed | verify-deploy.js passed; no truncated HTML |
| CSS malformed brace / stale live stylesheet | Round 4 P0 | Partially fixed/regressed live | Local CSS braces pass; live CSS is stale and 8,549 bytes smaller |
| CSP missing active inline hashes | Round 4 P0 | Fixed | _headers has four active script hashes and Cloudflare Insights origin |
| Orphan venue body markdown | Hotfix | Fixed | 158/158 venues have detailFile; rendered venue median 1,246 words |
| Malformed tel links | Round 2 P0 | Fixed | 0 malformed tel links; phoneToTel exists in build-v2.js |
| Search page static shell | Round 4 follow-up | Mostly fixed, visually regressed live | Search JS works, but live CSS stale and footer still v404 |
| Map/compare/favorites tool shells | Round 2/Round 4 | Still open | Tool pages do not load expected JS/data and show static shells |
| Heading-order failures | Round 2/Round 4 | Still open | 163/212 pages fail sequence; Lighthouse flags heading-order |
| Schema incomplete | Round 2/Round 4 | Still open | geo 0/158, phone 47/158, hours 51/158 |
| Duplicate sitemap index files | Round 2 P3 | Still open | sitemap-index.xml and sitemap_index.xml both exist/tracked |
| Missing noreferrer | Round 2 P2 | Still open | 6 blank-target external links still miss noreferrer |
| .gitignore NUL corruption | Round 2 | Still open | 26 NUL bytes still present |
| Hint contrast #555 | Round 3/4 | Fixed | --hint #888 contrast is 5.92:1 on black |
| Back-to-top/skip/reduce-motion restored | Round 4 | Fixed locally/live | selectors/rules are present |
| 24 legacy pages migrated | Round 3 | Partially fixed | Pages exist, but many still use v404 and orphan classes |

**W. Editorial fact-check spot-checks:** Ten venue fact checks found no obvious catastrophic falsehoods, but several exact details need source-level confirmation. Fairtex official site confirms Pattaya address, phone, BJJ/MMA/Muay Thai positioning, and 7:30am-8pm training-center language. FITZ official site confirms Royal Cliff sports club positioning with tennis/squash/fitness. InterContinental confirms Phra Tamnak address and resort fitness/spa context. AF Academy official site confirms Pattaya children's football positioning but the crawled page did not surface the stored phone. Real Divers confirms British-run PADI 5 Star IDC Pattaya positioning but not every stored operating detail. Thai Sky Adventures confirms Pattaya ocean-view skydiving but not the stored 07:00 detail. Pattaya Triathlon source confirms Pattaya/Bali Hai triathlon context. Thai Polo confirms Pattaya polo/equestrian positioning but not every local-area label. Movenpick confirms Na Jomtien Pattaya family hotel/fitness context. Pattaya Panthers confirms Pattaya rugby club identity. Next round should verify hours/prices against official sources for the top 50 venues.

**X. Ranking probability:** The site can actually rank in Pattaya. It has enough breadth and content depth to win long-tail and mid-tail local directory queries, especially best gym, 24-hour gym, and neighborhood/category searches. It will not reliably beat Fairtex/Sityodtong/Golfasian/TripAdvisor on the hardest head terms until entity data, local proof, guide E-E-A-T, mobile stability, and internal landing-page coverage improve.

## 🎬 Closing — Tim's question answered
Yes, pattaya-gym.com can rank in Pattaya, but the next 90 days have to be local-entity execution rather than more visual redesign. The site already has the hard part most competitors do not have: 158 venue pages, independent positioning, schema-rich generation, source-backed copy, and a machine-readable data layer. The blockers are practical and fixable: stale production assets, dead tool promises, incomplete geo/phone/hours data, thin neighborhood pages, and missing category-area landing pages. Ship those, and page 1 for gyms in Pattaya, best gym Pattaya, 24 hour gym Pattaya, and pattaya muay thai camps is a realistic target; muay thai Pattaya remains the hardest fight because it is crowded with authoritative camp brands and specialist publishers.
