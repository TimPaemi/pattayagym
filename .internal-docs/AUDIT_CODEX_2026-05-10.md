# Codex Nuclear Audit — 2026-05-10

## TL;DR

The site is technically healthy: validation and build pass, the 158-venue / 0-stub invariant holds, generated output is idempotent, and all 209 HTML pages have core SEO metadata, one H1, Plausible, service-worker registration, and parse-valid JSON-LD. The single biggest finding is category contract drift: the repo defines 16 categories, but only 13 category pages are generated because MMA, BJJ, and Boxing currently have zero primary venues, and CrossFit has only one. The next most practical fixes are the six broken `/gyms/` internal links and the 50-page social metadata gap on non-venue generated pages. No production code was changed during the audit pass; only this audit file and the work log entry were written.

## 🟢 Strengths (what's clean)

- `npm run validate` exits 0 with 164 warnings, all optional phone/website data gaps.
- `npm run build` exits 0 and prints `Generated 158 venue pages (158 deep + 0 stubs)`; the temp-copy idempotency hash is stable across two builds.
- All 209 HTML pages have a title, meta description, canonical tag, hreflang pair, viewport, theme colour, DNS prefetch control, `<html lang="en">`, and exactly one H1.
- 631 JSON-LD blocks parse cleanly across 209/209 pages; all 158 venue pages have LocalBusiness-style schema, FAQPage, and BreadcrumbList.
- Sitemaps are internally consistent: 208 master URLs, 208 segment URLs, 0 bad lastmod values, 0 sitemap/file mismatches.
- No duplicate title tags, duplicate meta descriptions, duplicate H1s, duplicate venue IDs, insecure external `src=http://` references, missing image alts, missing noopener links, or `eval()` calls were found.
- Performance foundations are solid: 209/209 pages include inline critical CSS, non-blocking stylesheet loading, Plausible, service-worker registration, and OG image coverage.
- All specific known-fix checks from the work log pass, including Jetts closure documentation, corrected venue hours/postcodes, AF Academy redirect, Mermaids contact data, and 158/158 venue BreadcrumbList coverage.

## 🟡 Findings ranked by impact

### 1. Category taxonomy is not aligned with the 16-category contract

- **Severity**: High
- **Pages affected**: 3 missing category pages, 4 categories below the requested 2-venue floor
- **Evidence**: `mma`, `bjj`, and `boxing` exist in `data.js` but have 0 venues and no `/category/<key>/` page. `crossfit` has 1 venue. The build currently generates 13 category pages, not 16.
- **Fix recommendation**: Either remove dormant category keys from the public contract with redirects/noindex strategy, or assign/duplicate appropriate venues into MMA, BJJ, and Boxing categories and generate all 16 category pages. If categories remain primary URLs, enforce a minimum-count validator.
- **Effort estimate**: 2 hr

### 2. Six internal links point to the non-existent `/gyms/` route

- **Severity**: High
- **Pages affected**: 5 pages affected; examples: /compare/, /search/, /map/, /plan-my-trip/, /find-my-coach/
- **Evidence**: 6 broken internal hrefs were found: {"from":"/compare/","href":"/gyms/"}; {"from":"/compare/","href":"/gyms/"}; {"from":"/find-my-coach/","href":"/gyms/"}; {"from":"/map/","href":"/gyms/"}; {"from":"/plan-my-trip/","href":"/gyms/"}; {"from":"/search/","href":"/gyms/"}.
- **Fix recommendation**: Replace hardcoded `/gyms/` fallbacks with `/search/`, `/#directory`, or a generated venue index page. Add `/gyms/` route only if it is intentionally useful and included in sitemap/navigation.
- **Effort estimate**: 30 min

### 3. Non-venue schema is present but too generic for several page types

- **Severity**: Medium
- **Pages affected**: 182 pages affected by at least one schema-specific expectation
- **Evidence**: Venue pages have LocalBusiness/FAQ/Breadcrumb but not baseline WebPage. All 6 area pages lack ItemList schema. The 17 guide pages plus guide index use WebPage + ItemList/FAQ, but not Article or CollectionPage. 132 LocalBusiness blocks omit telephone and/or structured opening hours.
- **Fix recommendation**: Add WebPage to venue graph, ItemList to area pages, and Article/CollectionPage to guides. Keep telephone absent only when truly unknown, but consider explicit omission policy in schema comments. Improve hours parser coverage for non-standard but parseable hours strings.
- **Effort estimate**: 2 hr

### 4. Social metadata has a 50-page gap on generated non-venue pages

- **Severity**: Medium
- **Pages affected**: 50 pages affected
- **Evidence**: 50 pages miss `og:locale`, `twitter:title`, and `twitter:description`. Titles, descriptions, canonical URLs, OG title/description/url/image/type, Twitter card, and Twitter image otherwise pass.
- **Fix recommendation**: Update the shared head helpers in `build-extras.js` and `build-discovery.js` so every generated page emits the same OG locale and Twitter title/description fields as venue pages.
- **Effort estimate**: 30 min

### 5. data.js and venue Markdown still disagree on editorial fields

- **Severity**: Medium
- **Pages affected**: 303 field mismatches across 158 venue records
- **Evidence**: Mismatch counts: address 116, hours 142, description 22, website 8, priceRange 9, phone 6. Examples include Fairtex address/hours and many richer MD hours values that differ from compact data.js values.
- **Fix recommendation**: Decide which fields are canonical for cards/schema versus deep-page display. For exact facts such as phone/website/priceRange, sync values. For deliberately richer MD descriptions/hours, either document the expected divergence or stop validating those fields as exact matches.
- **Effort estimate**: 1 day

### 6. Contact/source/fact-check gaps remain concentrated in venue data

- **Severity**: Medium
- **Pages affected**: 117 empty phone fields, 61 empty website fields, 22 MD files without sources, 22 vague addresses
- **Evidence**: Vague address examples: sitpholek-muay-thai: Pattaya — verify exact; true-fitness-pattaya: Pattaya — verify exact; phoenix-gold-golf: Pattaya region; chee-chan-golf: Pattaya region; pattana-sports-resort: Pattaya region; st-andrews-2000: Pattaya region. CONTENT_AUDIT still has 1 pending external check (Burapha Golf Club) and 2 flagged rows (Pattaya Tennis Club, Yoga Pattaya Studio).
- **Fix recommendation**: Prioritise flagged rows first, then venues with vague addresses, then high-traffic venues missing sources/contact details. Do not bump `verified` dates until current address, phone, hours, and price tier are externally checked.
- **Effort estimate**: 1 day

### 7. Internal-link weight is thin for low-volume categories, new guides, and several venues

- **Severity**: Medium
- **Pages affected**: 26 sitemap URLs have fewer than 5 incoming internal links
- **Evidence**: Examples: /category/crossfit/ (1); /category/climbing/ (1); /category/clubs/ (1); /category/kids-youth/ (1); /category/equestrian/ (1); /guides/pattaya-russian-speaking-sport/ (1); /guides/pattaya-solo-female-fitness/ (1); /guides/best-gyms-near-walking-street-pattaya/ (1); /guides/bangkok-day-trip-sport-pattaya/ (1); /gyms/pattaya-petanque-club/ (2); /gyms/pattaya-sky-ride-helicopter/ (2); /guides/pattaya-gyms-childcare-family-pools/ (2).
- **Fix recommendation**: Add contextual links from relevant guides/category sections, surface low-link guides in footer/sidebar modules, and add related-venue blocks for low-link venues.
- **Effort estimate**: 2 hr

### 8. Several utility pages are thin by word count

- **Severity**: Low
- **Pages affected**: 11 pages under 500 visible words
- **Evidence**: Examples: {"route":"/404.html","chars":1643,"words":243}; {"route":"/add-your-gym/","chars":2784,"words":410}; {"route":"/category/crossfit/","chars":3016,"words":435}; {"route":"/compare/","chars":1013,"words":151}; {"route":"/contact/","chars":1707,"words":248}; {"route":"/favorites/","chars":1719,"words":255}; {"route":"/find-my-coach/","chars":1925,"words":279}; {"route":"/map/","chars":1963,"words":291}; {"route":"/plan-my-trip/","chars":1887,"words":278}; {"route":"/press/","chars":2825,"words":407}; {"route":"/search/","chars":1900,"words":269}.
- **Fix recommendation**: Only expand pages where search intent exists. Prioritise `/search/`, `/map/`, `/compare/`, and `/find-my-coach/` with crawlable explanatory copy below the tool UI; leave 404 concise.
- **Effort estimate**: 2 hr

### 9. Security headers are good but CSP and Permissions-Policy are absent

- **Severity**: Low
- **Pages affected**: All routes
- **Evidence**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and HSTS are present. Permissions-Policy and Content-Security-Policy are absent. Static scan found 0 eval calls and 0 target=_blank noopener issues, but 1682 inline onload/onclick attributes, mostly stylesheet preload/onload and UI hooks.
- **Fix recommendation**: Add a measured Permissions-Policy first. Add CSP only after inventorying inline handlers and scripts, or pair CSP with nonce/hash work to avoid breaking static functionality.
- **Effort estimate**: 2 hr

### 10. Client payload is acceptable but `data.js` is the dominant browser asset

- **Severity**: Low
- **Pages affected**: Pages that load directory data
- **Evidence**: Shared assets total 187775 raw / 47329 gzip. data.js is 105908 raw / 27885 gzip. HTML+referenced asset P95 is 143479 raw / 36935 gzip.
- **Fix recommendation**: Leave as-is for now unless field data grows. If payload grows, split compact card/search data from full editorial source fields, or lazy-load only the pages that need the full array.
- **Effort estimate**: 1 day

### 11. `/404.html` canonical does not match the physical route scanned

- **Severity**: Low
- **Pages affected**: 1 page
- **Evidence**: `/404.html` emits canonical and og:url as `https://pattaya-gym.com/404`; static route scan expects `https://pattaya-gym.com/404.html`.
- **Fix recommendation**: Either generate `/404/index.html` and route to `/404/`, or canonicalize to `/404.html`. This is minor because 404 pages normally should not be indexed.
- **Effort estimate**: 5 min

### 12. American spelling residues need manual editorial review

- **Severity**: Low
- **Pages affected**: Multiple venue bodies
- **Evidence**: Remaining body hits include center 158, centers 29, favorite 3, program 79, programs 134, color 1, organize 1, behavior 1. Many are likely official names such as Center or programme-specific wording and should not be bulk-replaced blindly.
- **Fix recommendation**: Review Center/Centre and Program/Programme manually, preserving official business names and PADI terminology.
- **Effort estimate**: 2 hr

## A-P audit notes

**A. Validation + build integrity:** Validate, syntax checks, temp-copy build, watch, serve, and html validation all pass. The only validation warnings are optional phone/website gaps; no critical file shows >5-line truncation divergence from HEAD, and build idempotency passed.

**B. SEO meta:** Core SEO coverage is strong across 209 HTML pages: titles, descriptions, canonicals, hreflang, viewport, theme colour, DNS prefetch, lang, and H1 count are clean. The remaining meta issue is concentrated on 50 generated non-venue pages missing og:locale, twitter:title, and twitter:description, plus the minor 404 canonical mismatch.

**C. Structured data / JSON-LD:** JSON-LD is parse-clean with 631 blocks on 209/209 pages. Venue schema has LocalBusiness variants, FAQPage, and BreadcrumbList, but venue WebPage baseline, area ItemList, guide Article/CollectionPage typing, and LocalBusiness telephone/opening-hours completeness need follow-up.

**D. Sitemaps + crawl directives:** The sitemap system is internally consistent: 208 master URLs, 208 segment URLs, valid lastmod values, robots sitemap reference, and clean 301 syntax. The sitemap excludes only non-index content such as the 404 page.

**E. Internal links + duplicates:** Duplicate title/H1/meta-description and duplicate venue IDs are clean, but six /gyms/ links are broken and 26 sitemap URLs have fewer than five incoming links. AF Academy remains a duplicate website pair but is 301-consolidated.

**F. Content depth + quality:** Venue Markdown depth is healthy, with zero venue MDs under 500 words or 800 chars. Content debt remains in 117 empty phone fields, 61 empty websites, 22 source-less venue MDs, 22 vague addresses, 11 thin utility pages, and spelling residues that require manual review.

**G. data.js ? MD frontmatter consistency:** The earlier name/area cleanup held, but exact field comparison still finds 303 mismatches, mostly address and hours differences where MD pages contain richer or more specific text than compact data.js records.

**H. Performance + page weight:** Static performance foundations are good: critical CSS, non-blocking CSS pattern, Plausible, service worker, and OG images cover all pages. data.js is the dominant client payload and should be watched as the directory grows.

**I. Accessibility:** Structural accessibility checks are clean after wrapped-label masking: 209/209 skip links and main landmarks, 0 bad buttons, 0 bad form inputs, 0 images missing alt, 0 empty-name anchors, and 0 heading-order issues. Colour contrast was not browser-measured in this static-only pass.

**J. UI / UX:** Footer credit, Pattaya Authority links, primary nav, newsletter card, compare page, map Leaflet references, service-worker cache/fetch logic, PWA manifest, and responsive breakpoints are all present. Search inputs that render have aria-label coverage.

**K. Security + headers:** Core headers, HSTS, security.txt, HTTPS canonicals, noopener, and eval avoidance pass. Permissions-Policy and CSP are absent; inline handler count is high because the site uses inline onload/onclick patterns.

**L. Editorial / fact-check status:** CONTENT_AUDIT still has one pending row (Burapha Golf Club) and two flagged rows (Pattaya Tennis Club and Yoga Pattaya Studio). No venue verified date is older than 30 days as of 2026-05-10.

**M. Categories + areas + guides coverage:** Area and guide coverage is good with 6 area pages and 17 guide pages. Category coverage misses the prompt contract: 16 category keys exist, but only 13 pages are generated and MMA/BJJ/Boxing have zero venues.

**N. Backups + git state:** The repo started dirty with one modified tracked file and 15 untracked paths; backup archives/manifests are untracked and ignored. HEAD is fb66f0443bfe0046b8c211af8f97f51c499d5011 on main with no ahead/behind marker.

**O. Speed / Core Web Vitals indicators:** Largest CSS is 33.4 KB raw, below the 50 KB flag. Largest browser data asset is data.js at 105.9 KB raw / 27.9 KB gzip; static regex sees stylesheet links on every page, but the pages also use the non-blocking preload/onload pattern. The likely LCP elements are text/hero headings rather than images.

**P. Specific known-issue check:** All listed work-log fixes still verify, including Jetts closure, Deep Climbing and Muscle Factory hours, Khao Chi Chan 06:00 opening, Bangpra postcode, Wong Amat 1.5 km, Ocean Marina 274/1-9, AF Academy 301, Mermaids contact data, footer links, and 158/158 venue BreadcrumbList schema.

## 📊 Raw numbers (one big table)

| Section | Metric | Result |
|---|---|---|
| A | `npm run validate` | exit 0; Validation: 0 error(s), 164 warning(s) |
| A | Validation warning breakdown | phone: 111; website: 53 |
| A | `npm run build` | exit 0 in temp copy; Generated 158 venue pages (158 deep + 0 stubs) |
| A | `node --check` listed JS files | 10/10 passed: data.js, build.js, build-discovery.js, build-extras.js, validate.js, sw.js, app.js, compare.js, share.js, shortcuts.js |
| A | File truncation line-count check | 0 critical files diverge from HEAD by >5 lines |
| A | Build idempotency | PASS; two temp-copy builds produced identical `gyms/` hash `d6581e7eca72945206de00b6c0bd7c7406fefa68da44af4bb04834fb887273d4` |
| A | package scripts | `validate`, `build`, `watch`, `serve`, `html:validate` smoke-tested successfully |
| B | HTML pages scanned | 209 |
| B | Titles | 209/209 present; 0 duplicate; 0 outside 20-65 chars |
| B | Meta descriptions | 209/209 present; 0 duplicate; 0 outside 80-165 chars |
| B | Canonicals | 208/209 self-referential; `/404.html` canonicalizes to `/404` |
| B | Hreflang | 209/209 have `en` and `x-default`; 0 URL mismatches |
| B | Open Graph | 50 pages missing og:locale; title/description/url/image/type otherwise covered |
| B | Twitter cards | 50 pages missing twitter:title and twitter:description; cards/images present |
| B | Viewport/theme/DNS/lang/H1 | 209/209 pass; exactly one H1 on every page |
| C | JSON-LD blocks | 631 blocks; 0 parse errors |
| C | JSON-LD coverage | 209/209 pages |
| C | Venue schema | 158/158 LocalBusiness variant; 158/158 FAQPage; 158/158 BreadcrumbList; 0/158 baseline WebPage |
| C | LocalBusiness missing required fields | 132 venue blocks missing telephone and/or openingHoursSpecification |
| C | Area schema | 6 area pages missing ItemList schema |
| C | Guide schema | 18 guide/index pages missing Article or CollectionPage type |
| C | Schema types observed | 30 distinct @types |
| D | Master sitemap URLs | 208 |
| D | Sitemap index entries | 5 |
| D | Segment sitemap URLs | sitemap-core.xml: 13; sitemap-venues.xml: 158; sitemap-categories.xml: 13; sitemap-areas.xml: 6; sitemap-guides.xml: 18 |
| D | Segment total vs master | 208 vs 208 |
| D | Priority distribution | 1.0: 1; 0.8: 175; 0.9: 22; 0.5: 6; 0.6: 4 |
| D | Changefreq distribution | daily: 1; weekly: 197; monthly: 10 |
| D | Sitemap lastmod validity | 0 invalid lastmod values |
| D | Sitemap/file cross-check | 0 sitemap URLs missing files; 0 index pages missing from sitemap |
| D | Robots and redirects | robots references sitemap: yes; 301 redirects: 3; redirect issues: 0 |
| E | Internal hrefs scanned | 13444 |
| E | Broken internal links | 6; examples: {"from":"/compare/","href":"/gyms/"}; {"from":"/compare/","href":"/gyms/"}; {"from":"/find-my-coach/","href":"/gyms/"}; {"from":"/map/","href":"/gyms/"}; {"from":"/plan-my-trip/","href":"/gyms/"}; {"from":"/search/","href":"/gyms/"} |
| E | Low incoming internal links | 26 sitemap URLs have <5 incoming links |
| E | Same-page anchors | 2197 checked; 0 missing targets |
| E | External http src | 0 |
| E | Duplicate venue IDs | 0 |
| E | Duplicate websites | 1; afacademy.pro/en: af-academy-football, af-academy-pattaya |
| E | Duplicate normalized addresses | 2; beach road: pattaya-dive-centre, pattaya-marathon; bali hai pier departures: adventure-divers-pattaya, aquanauts-dive-center, real-divers-pattaya |
| E | Duplicate H1/title/descriptions | H1 0; title 0; description 0 |
| F | Venue MD body depth | 0 under 500 words; 0 under 800 chars |
| F | Thin visible HTML | 11 pages under 500 words; 0 pages under 800 chars |
| F | Empty data.js phone/website | 117 empty phones; 61 empty websites |
| F | Venue MD without sources | 22 |
| F | Vague placeholder addresses | 22; examples: sitpholek-muay-thai: Pattaya — verify exact; true-fitness-pattaya: Pattaya — verify exact; phoenix-gold-golf: Pattaya region; chee-chan-golf: Pattaya region; pattana-sports-resort: Pattaya region; st-andrews-2000: Pattaya region |
| F | Oldest verified dates | fairtex-pattaya 2026-04-27; sityodtong-pattaya 2026-04-27; wko-muay-thai 2026-04-27; kombat-group-thailand 2026-04-27; battle-conquer-gym 2026-04-27 |
| F | Verified older than 30 days | 0 |
| F | Pratamnak / Pratumnak usage | Pratamnak 130; Pratumnak 76; intentional per style guide |
| F | American spelling residues | center: 158; centers: 29; favorite: 3; program: 79; programs: 134; color: 1; organize: 1; behavior: 1 |
| G | data.js <-> MD mismatches | 303; by field: address: 116; hours: 142; description: 22; website: 8; priceRange: 9; phone: 6 |
| H | HTML byte weight | min 16533; median 46133; P95 55691; max 70162 (/area/jomtien/) |
| H | Shared asset total | 187775 raw bytes; 47329 gzip bytes |
| H | Inline critical CSS | 209/209 |
| H | Non-blocking CSS load | 209/209 |
| H | Plausible coverage | 209/209 |
| H | Service-worker registration | 209/209 |
| H | OG image coverage | 0 missing venue OG images; default OG exists: yes |
| H | CSS sizes | styles.css 33381 raw/6650 gz; venue.css 28193 raw/6184 gz |
| H | Client JS sizes | data.js 105908 raw/27885 gz; app.js 9010 raw/3008 gz; compare.js 6022 raw/1871 gz; sw.js 1927 raw/702 gz; shortcuts.js 3334 raw/1029 gz |
| H | Estimated page total bytes | raw median 127879; raw P95 143479; gzip median 32469; gzip P95 36935 |
| I | Skip links/main landmark | skip 209/209; main 209/209 |
| I | Buttons/inputs/images/anchors accessible-name checks | 0 bad buttons; 0 bad inputs after wrapped-label masking; 0 images missing alt; 0 empty-name anchors |
| I | Heading hierarchy | 0 issues |
| I | Color contrast | Static audit only; visual/browser contrast pass not run |
| J | Footer credit | 209/209 pages include .sf-builtby; 209/209 link to pattaya-authority.com |
| J | Navigation/search/newsletter | nav 209/209; search inputs with aria-label present where rendered; newsletter 209/209 |
| J | Compare/map/service worker | compare PASS; Leaflet PASS; SW cache/fetch PASS |
| J | PWA manifest/responsive CSS | name: PASS, short_name: PASS, start_url: PASS, display: PASS, icons192: PASS, icons512: PASS; responsive <600 PASS, <760 PASS |
| K | Security headers | X-Frame-Options: PASS, X-Content-Type-Options: PASS, Referrer-Policy: PASS, Strict-Transport-Security: PASS, Permissions-Policy: FAIL, Content-Security-Policy: FAIL |
| K | security.txt | PASS |
| K | eval/inline handlers | eval() 0; inline onclick/onload 1682 |
| K | target=_blank rel=noopener | 0 missing noopener |
| K | HTTPS canonicals | 0 non-HTTPS canonical URLs |
| L | Pending external checks | 1: Burapha Golf Club |
| L | Flagged rows | 2: Pattaya Tennis Club; Yoga Pattaya Studio |
| L | Verified dates older than 30 days | 0 |
| M | Categories | 16; counts: muay-thai 21; mma 0; bjj 0; boxing 0; crossfit 1; fitness 25; yoga 6; golf 17; racquet 11; swimming 9; watersports 20; climbing 2; clubs 23; kids-youth 9; equestrian 2; adventure 12 |
| M | Category pages | 13/16 generated; missing: mma, bjj, boxing |
| M | Area pages | 6/6 |
| M | Guides | 17 guide pages + /guides/ index; invalid slugs: 0 |
| N | Git state before audit writes | 1 modified tracked; 15 untracked; ## main...origin/main |
| N | Backup files | 5; all untracked and ignored: true |
| N | HEAD | main fb66f0443bfe0046b8c211af8f97f51c499d5011 |
| O | Largest CSS | styles.css 33381 bytes |
| O | Largest client JS | data.js 105908 bytes raw / 27885 gzip |
| O | Static JS >25KB | build-discovery.js 147247; data.js 105908; build.js 73816; build-extras.js 65803 |
| O | Render-blocking stylesheet scan | 209/209 pages have stylesheet links that look render-blocking by static regex; note pages also use preload/onload non-blocking pattern |
| O | Likely LCP candidates | venue: .venue-h1 / hero text; home: .hero-title / hero search text; category: category page h1 / intro text; guide: guide h1 / intro text |
| O | Font loading strategy | font-display: swap present: no; appears to use system fonts |
| P | Known fixed checks | jettsClosure: PASS, deepClimbingHours: PASS, muscleFactoryHours: PASS, khaoChiChan0600: PASS, bangpra20110: PASS, wongAmat15km: PASS, oceanMarina274_1_9: PASS, afAcademyRedirect: PASS, mermaidsPhone: PASS, mermaidsWebsite: PASS, allFooterCreditLinks: PASS, venueBreadcrumbs: PASS |

## 🔧 Recommended fix order

1. Fix the six hardcoded `/gyms/` broken links or intentionally add a `/gyms/` index route.
2. Resolve the category contract: either generate all 16 category pages with enough venues or remove dormant public category keys with a redirect/noindex plan.
3. Patch shared head helpers so all 209 pages include `og:locale`, `twitter:title`, and `twitter:description`.
4. Add ItemList schema to area pages.
5. Add Article or CollectionPage schema to guide pages and guide index as appropriate.
6. Add baseline WebPage schema to venue pages without disturbing LocalBusiness/FAQ/Breadcrumb graphs.
7. Resolve the two formally flagged fact-check rows: Pattaya Tennis Club and Yoga Pattaya Studio.
8. Clear the one pending CONTENT_AUDIT row for Burapha Golf Club or update the audit note with current evidence.
9. Triage the 22 vague addresses, starting with exact-match businesses rather than route/club aggregator pages.
10. Decide and document canonical ownership for data.js vs MD fields, then sync high-risk mismatches: phone, website, priceRange, address.
11. Add contextual links to 26 pages with fewer than 5 incoming internal links.
12. Expand useful utility pages that are under 500 visible words, especially `/search/`, `/map/`, `/compare/`, and `/find-my-coach/`.
13. Add Permissions-Policy; plan CSP separately after inline handler inventory.
14. Review whether `/404.html` should canonicalize to `/404.html` or be generated as `/404/`.
15. Manually review American spelling residues while preserving official names and technical terms.
16. Consider a future compact client data payload if `data.js` keeps growing.

## 📝 Notes for the next session

- Build/idempotency checks were run in a temporary copy at `%TEMP%\pattayagym-audit-*` to preserve the existing dirty production working tree. The source snapshot still validated and built cleanly.
- The repo already had unrelated dirty state before this audit: `methodology/index.html` modified plus 15 untracked paths. I left those untouched.
- The accessibility static audit was re-run with wrapped-label masking; the refined pass found 0 bad buttons, 0 bad labelled inputs, 0 missing image alts, and 0 empty-name anchors.
- Area and guide pages have schema blocks, but they are too generic for the prompt's target page types. Treat this as schema enhancement, not a JSON-LD parse failure.
- LocalBusiness telephone and opening-hours gaps overlap with real venue data gaps. Do not fabricate either field just to satisfy schema completeness.
- Long-tail guide ideas not yet covered: Best padel and pickleball courts in Pattaya; Sports rehab, physiotherapy, sauna, ice bath and recovery in Pattaya; Free outdoor fitness in Pattaya: beaches, parks, stairs and running loops; Best Pattaya hotel gyms and day-pass fitness options; Rainy-season indoor sport in Pattaya.
