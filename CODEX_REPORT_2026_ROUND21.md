# CODEX_REPORT_2026_ROUND21 - pattaya-gym.com

## 1. Executive Summary

Overall health verdict: strong architecture, strong editorial ambition, but the current repository is not in a clean Round 20/21 release state. The biggest risk is not one broken page; it is trust drift: asset versions, generated metadata, structured data completeness, tool promises, and verification claims do not all agree with each other.

Severity counts:

| Severity | Count |
|---|---:|
| P0 - Critical | 0 |
| P1 - High | 5 |
| P2 - Medium | 10 |
| P3 - Low / polish | 8 |
| OBS - Observation | 6 |

Single most important fix: rebuild and ship a clean, internally consistent release where `ASSET_VERSION`, `status.json`, generated HTML footers, font preloads, `/api/venues.json`, `llms.txt`, and the changelog all agree on the current version/date, then add this as a hard deploy check.

No P0 issue was found. The site is crawlable, the current HTML files are not truncated, JSON-LD parses, core pages have canonicals, there are no duplicate titles/descriptions, and no HTML page-to-page broken links were found after query strings/scripts/non-HTML resources were excluded.

## 2. Scorecard

| Area | Score | Justification |
|---|---:|---|
| SEO - technical and on-page | 7/10 | Crawl/index basics are good, but metadata length quality, stale release markers, and incomplete LocalBusiness fields reduce trust and rich-result quality. |
| Usability - mobile and desktop | 7/10 | Good responsive foundation, focus styles, tap targets, and reduced-motion handling; tool stubs and a duplicate compare live region hurt product polish. |
| Future-proofing / AI discoverability | 8/10 | `robots.txt`, `llms.txt`, sitemaps, JSON-LD, and API endpoints are unusually strong; tool and freshness claims need tightening. |
| Network linking | 7/10 | Homepage/about/schema are coherent, but 20 pages use a shorter footer and omit four sister properties. |
| Internal linking | 7/10 | Main crawl graph is mostly healthy, but BJJ/ALFA and four utility/tool pages are isolated, and five venue pages sit at depth 4. |
| Ideas / growth surface | 8/10 | The site has clear opportunities in long-tail guides, map/search tooling, schema completeness, and network trust pages. |
| Build correctness | 6/10 | `build-v2.js` is productive but lets version drift, placeholder tools, weak schema coverage, and stale data endpoints ship. |
| Security headers / CSP | 8/10 | Strong baseline CSP and headers; unused third-party sources and `style-src 'unsafe-inline'` remain. |
| Data integrity | 6/10 | 158 venues exist, but several still have placeholder hours/address/description while the site markets them as verified. |
| Deployment robustness | 6/10 | `verify-deploy.js` catches syntax, truncation, sitemap-local-file, and CSP hash problems, but misses the issues found in this audit. |

## 3. P0 Findings

None found.

## 4. P1 Findings

### P1-1 - Mixed asset version and release-state drift

Files and lines:
- `C:\pattayagym\build-v2.js:23` - `const ASSET_VERSION = '415';`
- `C:\pattayagym\status.json:18-19` - reports `version: v415` and `asset_version: 415`
- `C:\pattayagym\changelog\index.html:79` - says Round 20 bumped asset version `415 -> 416`
- `C:\pattayagym\404.html:13,16,149` - CSS/footer use `v=415`/`v415`, font preload uses `v=414`
- `C:\pattayagym\compare\index.html:13,16-17,101` - CSS/footer use `v=415`/`v415`, font preloads use `v=416`

What is wrong: The repo says Round 20 shipped asset version 416, but the generator and most generated HTML are still 415, many font preloads are still 414, and `/compare/` has 416 font preloads mixed into a 415 page.

Why it matters: Cache-busting is a release contract. A mixed version state can leave users, Cloudflare, and crawlers seeing different CSS/font/JS generations. It also makes the public changelog and status endpoint less credible.

Recommended fix: Set the canonical release version in one source of truth, rebuild all HTML/assets/status/changelog outputs from that value, and add a deploy check that fails if any shipped HTML, JSON, `_headers`, or footer badge contains an unexpected `v=414`, `v=415`, or stale `asset_version` after the intended release.

### P1-2 - LocalBusiness JSON-LD is incomplete at scale

Files and lines:
- `C:\pattayagym\build-v2.js:574-610` - LocalBusiness schema object builder
- `C:\pattayagym\build-v2.js:593-605` - emits `geo` only when frontmatter/cache coordinates exist
- `C:\pattayagym\build-v2.js:606-607` - emits `openingHoursSpecification` only when parsing succeeds, otherwise falls back to string `openingHours`
- `C:\pattayagym\gyms\alfa-bjj-pattaya\index.html:35` - sample LocalBusiness lacks `geo` and has string `openingHours`
- `C:\pattayagym\gyms\adventure-divers-pattaya\index.html:35` - sample LocalBusiness lacks `geo` and `openingHoursSpecification`

What is wrong: Programmatic audit found 158 LocalBusiness blocks, all syntactically valid, but 102/158 are missing `geo` and 107/158 are missing `openingHoursSpecification`.

Why it matters: For a local directory, exact location and machine-readable hours are core structured-data fields. Missing them weakens local SEO, answer-engine extraction, and confidence in venue fact cards.

Recommended fix: Treat `geo` and structured hours as required for all venue pages that claim a physical venue. Add data-level validation that fails the build or marks the page as `verification pending` when coordinates/hours are unavailable. For venues that are regional/tour operators rather than fixed places, model them deliberately instead of emitting a partially populated LocalBusiness.

### P1-3 - Indexed tool pages and `llms.txt` promise products that are not live

Files and lines:
- `C:\pattayagym\llms.txt:12-13` - presents Find My Coach and Plan My Trip as active AI-useful tools
- `C:\pattayagym\find-my-coach\index.html:7,82` - says the coach finder is on the roadmap / being rebuilt
- `C:\pattayagym\plan-my-trip\index.html:7,69,82` - says the trip planner is on the roadmap / being rebuilt
- `C:\pattayagym\favorites\index.html:7,69,82,112` - says favorites are being rebuilt
- `C:\pattayagym\build-v2.js:2139-2149` - adds `compare`, `map`, `plan-my-trip`, `find-my-coach`, and `favorites` to the sitemap tool URL set

What is wrong: The AI-facing file advertises functional tools while the HTML pages are indexed roadmap/stub pages. `favorites.js` is also not loaded by these pages; only `/search/` loads external `data.js` and `search-page.js`.

Why it matters: This creates a bad loop for search engines, AI crawlers, and users: high-intent tool URLs are discoverable, but the pages explain that the tools do not exist yet. That hurts trust and wastes crawl/link equity.

Recommended fix: Either ship the tools or change their status everywhere. Until live, remove them from `llms.txt` core tools, remove or lower them in sitemap priority, and consider `noindex,follow` for stubs. If kept indexed, title them as roadmap/placeholder pages and do not present them as active utilities.

### P1-4 - Verification and hand-checked claims overstate the current data quality

Files and lines:
- `C:\pattayagym\build-v2.js:1810` - about page lede says every venue is personally verified
- `C:\pattayagym\build-v2.js:1815` - says every venue is visited/verified, every hours field checked, every phone number dialed
- `C:\pattayagym\changelog\index.html:381` - marquee says `100% HAND-CHECKED`
- `C:\pattayagym\status.json:14,62` - reports `handChecked: true` and rolling weekly reverification
- `C:\pattayagym\data.js:46` - Fight EVO360 has `hours: "Verify at venue"` and `Stub - needs deep research`
- `C:\pattayagym\data.js:47` - Sitpholek has `address: "Pattaya - verify exact"`, `hours: "Verify"`, and stub copy
- `C:\pattayagym\data.js:56` - Universe Gym has `hours: "Verify at gym"`
- `C:\pattayagym\data.js:62,90,108,127,136` - additional entries use verify-exact or `Verify` fields

What is wrong: The public trust copy says all hours/phones/venues are checked, but source data still contains explicit verification placeholders and empty phones.

Why it matters: This is an E-E-A-T/trust issue, not just copy polish. A local authority brand can say data is being improved, but it should not claim complete verification where fields still say `Verify`.

Recommended fix: Introduce a first-class verification state per field: verified, source-only, pending, unknown. Use that state to suppress absolute claims, badge pending fields clearly, and keep `/status.json` honest about counts for verified hours, phone, address, geo, and source citations.

### P1-5 - BJJ category and ALFA page are isolated from the homepage crawl graph

Files and lines:
- `C:\pattayagym\index.html:329-358` - homepage sports cards link only Muay Thai, fitness, golf, and yoga
- `C:\pattayagym\index.html:360-361` - the fallback CTA goes to `/guides/`, not to a full category index
- `C:\pattayagym\category\bjj\index.html:35,81,99` - BJJ page exists and links only to ALFA
- `C:\pattayagym\gyms\alfa-bjj-pattaya\index.html:36,59` - ALFA links back to BJJ via breadcrumb
- `C:\pattayagym\sitemap.xml:39,67` - both BJJ and ALFA are in the sitemap
- `C:\pattayagym\llms.txt:39` - BJJ is listed as a verified category

What is wrong: Corrected link-graph analysis found `/category/bjj/` and `/gyms/alfa-bjj-pattaya/` in the sitemap, but unreachable from the homepage internal HTML crawl graph. They only link to each other.

Why it matters: Sitemaps help discovery, but internal links carry more ranking and trust context. A category with a dedicated academy should not be isolated, especially for AI/SEO long-tail queries like `BJJ Pattaya`.

Recommended fix: Add a real all-categories page or homepage category matrix that links all 15 categories, including BJJ, MMA, swimming, clubs, climbing, and watersports. Also add contextual links from combat-sport guides to `/category/bjj/` and ALFA.

## 5. P2 Findings

### P2-1 - Programmatic title truncation creates malformed SERP titles

Files and lines:
- `C:\pattayagym\build-v2.js:306` - `truncateTitle` helper
- `C:\pattayagym\build-v2.js:1406` - category-area title is truncated after concatenating category, area, brand
- `C:\pattayagym\area\east-pattaya\adventure\index.html:6` - title ends with dangling pipe
- `C:\pattayagym\area\east-pattaya\clubs\index.html:6` - title ends with dangling pipe
- `C:\pattayagym\area\east-pattaya\racquet\index.html:6` - title ends with dangling pipe

What is wrong: At least 42 titles are over 60 characters, and several East Pattaya category-area pages are truncated to a dangling `|` with the brand removed.

Why it matters: Search snippets may look broken, reduce CTR, and dilute brand consistency.

Recommended fix: Generate title patterns by page type instead of truncating arbitrary strings. Example: `East Pattaya BJJ Gyms | Pattaya.Gym`, `Jomtien Tennis Courts | Pattaya.Gym`. Add a check that rejects titles ending in punctuation such as `|`, `-`, or `:`.

### P2-2 - 92 meta descriptions sit outside the target range or read as boilerplate

Files and lines:
- `C:\pattayagym\area\central-pattaya\golf\index.html:7` - 99-character boilerplate sample
- `C:\pattayagym\area\central-pattaya\fitness\index.html:7` - 108-character boilerplate sample
- `C:\pattayagym\find-my-coach\index.html:7` - 195-character roadmap description
- `C:\pattayagym\404.html:7` - 88-character description
- `C:\pattayagym\build-v2.js:334` - head generator emits the supplied description directly

What is wrong: 92 HTML pages have descriptions outside the desired 120-160 character band. Most short category-area descriptions repeat the same pattern and leave useful CTR detail on the table.

Why it matters: Descriptions are not ranking factors directly, but they drive CTR and perceived quality in snippets and AI summary inputs.

Recommended fix: Create page-type-specific description builders with area/category value props, e.g. training style, venue count, best-use case, and no-paid-placement trust language. Validate length at build time.

### P2-3 - Network footer is inconsistent on 20 pages

Files and lines:
- `C:\pattayagym\compare\index.html:101` - footer lists only Pattaya Authority, Restaurant Guide, Pattaya.Gym, and Visa Help
- `C:\pattayagym\guides\index.html:214` - same shortened project footer
- `C:\pattayagym\search\index.html:134` - same shortened project footer
- `C:\pattayagym\index.html:574-581` - full footer includes TimPaemi, Authority, Restaurant Guide, Coffee, School, Visa, and Stream
- `C:\pattayagym\about\index.html:37,87,175-182` - Person schema/about/footer include the full sister list

What is wrong: 20 HTML pages omit `timpaemi.com`, `pattayastream.com`, `pattaya-coffee.com`, and `pattaya-school-guide.com` from the footer. Homepage/about/schema include the fuller network.

Why it matters: The owner is building a trust graph. Inconsistent network linking makes the graph look accidental rather than governed.

Recommended fix: Generate every footer from one canonical network array and use the same array for Organization/Person `sameAs`, about copy, privacy, press, `llms.txt`, and footer projects.

### P2-4 - Compare page has duplicate `id="compare-status"`

Files and lines:
- `C:\pattayagym\compare\index.html:77-78` - two identical live-region elements
- `C:\pattayagym\compare\index.html:164` - script uses `document.getElementById('compare-status')`

What is wrong: Duplicate IDs are invalid HTML. The script will address the first element only, while assistive technology may encounter two identical live regions.

Why it matters: This can cause confusing announcements and unreliable automated testing on one of the site's highest-value tools.

Recommended fix: Remove one live-region element. Add an HTML validation/deploy check for duplicate IDs.

### P2-5 - Search `open now` ignores day-of-week constraints

Files and lines:
- `C:\pattayagym\search-page.js:74-100` - parser extracts time windows and checks them against current Pattaya time
- `C:\pattayagym\data.js:36,195,205` - examples with day/season constraints such as `Mon-Sat`, `Wed + Fri`, `Nov-June`

What is wrong: The search page `open now` filter parses `HH:MM-HH:MM` windows but does not honor weekday or season text. A `Mon-Sat 07:00-09:30` venue can pass on Sunday if the time matches.

Why it matters: Users rely on `open now` for real-world travel decisions. Wrong open/closed status is a UX and trust failure.

Recommended fix: Reuse the structured `openingHoursSpecification` data emitted by the generator, including day-of-week matching, or precompute normalized hours in `data.js`/`api/venues.json` and have search consume that.

### P2-6 - Deployment verifier does not catch the most important regressions found here

Files and lines:
- `C:\pattayagym\scripts\verify-deploy.js:26-45` - JS syntax check list
- `C:\pattayagym\scripts\verify-deploy.js:96` - skip directories
- `C:\pattayagym\scripts\verify-deploy.js:121-140` - checks only `sitemap.xml` URLs against local files
- `C:\pattayagym\scripts\verify-deploy.js:142-170` - CSP hash sanity check

What is wrong: The deploy verifier catches useful problems, but it does not check asset-version consistency, generated data freshness, duplicate IDs, tool stubs in the sitemap, LocalBusiness geo/hour coverage, orphan pages, or footer network completeness.

Why it matters: The current high-impact issues would pass deployment even though they affect SEO, cache correctness, and brand trust.

Recommended fix: Add deploy gates for version consistency, JSON-LD semantic coverage thresholds, duplicate IDs, footer network array completeness, sitemap-vs-link graph orphans, and placeholder strings such as `Verify`/`Stub` on verified pages.

### P2-7 - CSP still allows unused third-party sources

Files and lines:
- `C:\pattayagym\_headers:10` - `script-src` allows `plausible.io`, `unpkg.com`, `static.cloudflareinsights.com`; `style-src` allows `unsafe-inline` and `unpkg.com`
- `C:\pattayagym\_headers:25-65` - local CSS/JS cache rules show assets are self-hosted
- `C:\pattayagym\build-v2.js:365` - GA4 bootstrap is the current analytics path

What is wrong: The CSP is much better than a default policy, but it still grants script/style permissions to third parties that do not appear to be used by the current generated HTML.

Why it matters: A strict CSP is only strict if the allowlist stays small. Extra domains increase blast radius if any dependency path is reintroduced or compromised.

Recommended fix: Remove unused `plausible.io`, `unpkg.com`, and Cloudflare Insights allowances if they are not intentionally used. Keep reducing inline styles so `style-src 'unsafe-inline'` can eventually be removed.

### P2-8 - Machine-readable freshness fields disagree with shipped state

Files and lines:
- `C:\pattayagym\api\venues.json:1` - `generated: 2026-05-16`
- `C:\pattayagym\llms.txt:91` - `Last update: 2026-05-16`
- `C:\pattayagym\status.json:18-19` - version/asset version still 415
- `C:\pattayagym\changelog\index.html:79` - Round 20 claims asset 416
- `C:\pattayagym\changelog\index.html:381` - footer on generated changelog says built 2026-05-19 v415

What is wrong: Different machine-readable and public files report different update states.

Why it matters: AI crawlers and partner tools will treat `/api/venues.json`, `/status.json`, `llms.txt`, and changelog as source-of-truth files. Contradictions make the site harder to cite confidently.

Recommended fix: Regenerate these files in the same build, stamp them from one build metadata object, and block deploys when generated dates or asset versions diverge.

### P2-9 - Indexed orphan utility/tool pages absorb sitemap equity without inbound links

Files and lines:
- `C:\pattayagym\build-v2.js:2139-2149` - includes `plan-my-trip`, `find-my-coach`, `favorites`, and utility extras in the sitemap
- `C:\pattayagym\favorites\index.html:35-36` - indexed WebPage/BreadcrumbList for favorites
- `C:\pattayagym\find-my-coach\index.html:35-36` - indexed WebPage/BreadcrumbList for coach finder
- `C:\pattayagym\plan-my-trip\index.html:35` - indexed WebPage for trip planner

What is wrong: Link-graph analysis found `/colophon/`, `/favorites/`, `/find-my-coach/`, and `/plan-my-trip/` with zero inbound internal HTML links. The 404 page is also isolated, which is normal and not counted as a defect.

Why it matters: Orphan indexed URLs are weak crawl targets. For stubs, they also waste attention that should flow to real category, area, venue, and guide pages.

Recommended fix: Either link these utilities intentionally from footer/navigation when they are real, or remove/noindex them until they ship.

### P2-10 - Several official venue website links still use HTTP

Files and lines:
- `C:\pattayagym\data.js:36` - `http://petchrungruang.com/`
- `C:\pattayagym\data.js:86` - `http://www.khaokheowgolf.com/`
- `C:\pattayagym\data.js:94` - `http://www.gretafarm.com/en/tennis/`
- `C:\pattayagym\data.js:168` - `http://pattayapadelclub.com/`
- `C:\pattayagym\data.js:174` - `http://www.pattayabikeandboattours.com/`
- `C:\pattayagym\data.js:197` - `http://www.gwgolfclub.com/`
- `C:\pattayagym\data.js:205` - `http://www.pattayacricketclub.com/`

What is wrong: The directory links to multiple venue websites over HTTP.

Why it matters: `upgrade-insecure-requests` protects embedded loads, but these are outbound user links. HTTP links look stale and can trigger browser warnings or downgrade trust.

Recommended fix: Check whether HTTPS versions work. Update links to HTTPS where supported; if not supported, keep HTTP but mark as verified legacy in the data audit.

## 6. P3 Findings

| ID | File/line | Title | What is wrong | Recommended fix |
|---|---|---|---|---|
| P3-1 | `C:\pattayagym\compare.js:90,123`; `C:\pattayagym\compare\index.html:114-124` | Dead compare helper uses old URL contract | `compare.js` creates `/compare/?ids=...` links while the live compare page uses `a`, `b`, `c`, `d` params. | Delete the dead file or update it before loading it anywhere. |
| P3-2 | `C:\pattayagym\_headers:70-71` | Root OG image cache is effectively disabled | `/og-image.png` has `max-age=3` while `/og/*` is immutable. | Use a sane cache window and versioned URL if the root OG image changes. |
| P3-3 | `C:\pattayagym\70:1` | Stray root file remains | File `70` contains audit scratch text and is not a site asset. | Delete after confirming it is untracked/unneeded. |
| P3-4 | `C:\pattayagym\pattayagym_source_2026-05-08_212753.zip:1`; `C:\pattayagym\pattayagym_html_2026-05-08_212948.tar.gz:1`; `C:\pattayagym\pattayagym_og_2026-05-08_212948.tar.gz:1` | Archive files sit in web root | Old source/html/OG archives are present in the repository root; one source zip is 0 bytes. | Move archives outside the deploy root or ignore/delete them. |
| P3-5 | `C:\pattayagym\about\index.html:87`; `C:\pattayagym\build-v2.js:1821` | Network wording undersells the 10+ site brand | About says `one of seven sister sites`; the brand context says 10+ Pattaya-focused websites. | Use wording like `part of the TimPaemi/Pattaya Authority network` and list the canonical active properties. |
| P3-6 | `C:\pattayagym\build-v2.js:459-464`; `C:\pattayagym\compare\index.html:101` | Footer site column is inconsistent | Some generated footers omit useful utility links that changelog says were added in Round 19. | Generate footer site links from one array and include compare, stats, changelog, privacy, press, and add-your-gym consistently. |
| P3-7 | `C:\pattayagym\scripts\sync-csp-hashes.js:5-17,81` | CSP sync script writes production headers directly | This is operationally fine, but a failed/partial run could mutate `_headers` outside a full build flow. | Make CSP sync part of the build/deploy pipeline and follow with verify-deploy automatically. |
| P3-8 | `C:\pattayagym\search-page.js:72-78` | Source comments display badly under legacy PowerShell encoding | The file itself appears UTF-8 valid, but Windows PowerShell renders comments and Thai currency as mojibake without UTF-8 mode. | Add `.editorconfig` / docs requiring UTF-8 and use UTF-8 shell output in audit scripts. |

## 7. Network Linking Analysis

Canonical sister/network sites checked:

| Site | HTML files linking it | Href count | Rel posture | Consistency |
|---|---:|---:|---|---|
| `timpaemi.com` | 239/259 | 242 | `noopener noreferrer` | Missing from 20 pages, mainly guides/search/compare. |
| `pattaya-authority.com` | 259/259 | 639 | `noopener noreferrer` | Strong hub signal; appears in PA badge and footer. |
| `pattaya-restaurant-guide.com` | 259/259 | 264 | `noopener noreferrer` | Consistent. |
| `pattaya-gym.com` | Self | N/A | Internal links | Correct as current site. |
| `pattayavisahelp.com` | 259/259 | 264 | `noopener noreferrer` | Consistent. |
| `pattayastream.com` | 239/259 | 242 | `noopener noreferrer` | Missing from 20 pages. |
| `pattaya-coffee.com` | 239/259 | 242 | `noopener noreferrer` | Missing from 20 pages. |
| `pattaya-school-guide.com` | 239/259 | 242 | `noopener noreferrer` | Missing from 20 pages. |

Where the graph is strong:
- Homepage Organization `sameAs` includes the seven sister domains at `C:\pattayagym\index.html:58-70`.
- About Person `sameAs` includes the seven sister domains at `C:\pattayagym\about\index.html:37`.
- About page body explains the network at `C:\pattayagym\about\index.html:87`.
- Main generated footer includes all seven sister links at `C:\pattayagym\index.html:574-581` and `C:\pattayagym\about\index.html:175-182`.

Where it is weak:
- 20 pages use a reduced project footer and omit TimPaemi, Stream, Coffee, and School. Examples: `C:\pattayagym\compare\index.html:101`, `C:\pattayagym\guides\index.html:214`, `C:\pattayagym\search\index.html:134`.
- The network copy says `one of seven sister sites` even though the owner context is a 10+ site brand. The listed properties are coherent, but the phrasing is brittle.

Assessment: The link graph reads as mostly authoritative, not spammy. Pattaya Authority is clearly the hub, and the footer uses clean brand names. The fix is governance: one canonical network list consumed by footer, schema, `llms.txt`, about, press, privacy, and any future network page.

Ideal pattern:
- Organization `sameAs`: all canonical public brand domains, in stable order.
- Footer: full network on every HTML page, with no `nofollow` for owned editorial properties.
- About/press/privacy: one paragraph explaining ownership, independence, no paid placements, and the role of Pattaya Authority.
- Optional `/network/` page: the canonical human-readable and machine-readable trust graph.

## 8. Internal Linking Analysis

Internal graph summary:
- HTML pages analyzed: 259.
- HTML page-to-page broken links after stripping scripts/query strings and excluding non-HTML resources: 0.
- Broken same-page anchors: 0.
- Intentional/non-page internal resources linked from HTML: `/api/venues.json`, `/status.json`, `/robots.txt`.
- Orphan pages with zero inbound internal HTML links: `/colophon/`, `/favorites/`, `/find-my-coach/`, `/plan-my-trip/`. `/404.html` is also isolated, which is expected.
- Pages deeper than 3 clicks from homepage: `/gyms/dragon-shooting-club/`, `/gyms/flight-of-the-gibbon/`, `/gyms/koh-larn-coral-island/`, `/gyms/pattaya-cricket-club/`, `/gyms/pattaya-sky-ride-helicopter/` at depth 4.
- Unreachable from homepage graph despite sitemap presence: `/category/bjj/` and `/gyms/alfa-bjj-pattaya/`.

Breadcrumbs:
- BreadcrumbList JSON-LD is present on sampled page types and matches visible breadcrumbs in the checked examples: `C:\pattayagym\category\bjj\index.html:36,59` and `C:\pattayagym\gyms\alfa-bjj-pattaya\index.html:36,59`.

Contextual linking:
- Venue pages link back to category via breadcrumbs and include contact/map/source/report links.
- Area pages include a category matrix generated at `C:\pattayagym\build-v2.js:1378-1389`, which is a good long-tail SEO feature.
- Homepage currently promotes only four sports cards (`C:\pattayagym\index.html:329-358`) and points the all-sports CTA to guides rather than a complete category index (`C:\pattayagym\index.html:360-361`). This is the root cause of BJJ isolation.

Anchor text:
- No major `click here` pattern was found in the current internal link graph.
- Repeated anchors like `Changelog`, `Search`, and category names are expected navigational anchors.

Equity-flow assessment:
- High-value surfaces such as homepage, category, area, venue, guide, search, compare, and status pages are connected.
- Low-value stubs are in sitemap but not linked, which is better than prominently linking them, but worse than noindex/removal until functional.
- BJJ/ALFA needs real internal support because it is a commercially meaningful long-tail topic.

## 9. Ideas Backlog

### Quick wins - under about 1 hour each

| Idea | Payoff | Effort |
|---|---|---:|
| Rebuild from one version constant and verify no stale `v=414`/`v=415` remains after intended 416. | Fixes cache trust and release credibility. | Low |
| Remove one duplicate `compare-status` div. | Improves accessibility and validity. | Low |
| Update `llms.txt` lines 12-13 to mark coach/trip tools as roadmap, or remove until live. | Prevents AI crawlers from citing nonexistent tools. | Low |
| Add BJJ to homepage/category navigation, or add an all-categories page linked from homepage. | Improves crawl depth and long-tail discovery. | Low |
| Replace malformed category-area title patterns with shorter deterministic templates. | Better CTR and no dangling title punctuation. | Low |
| Normalize footer network links on guides/search/compare. | Makes the trust graph consistent. | Low |
| Change `/og-image.png` cache from 3 seconds to a practical TTL. | Small performance/cache polish. | Low |
| Remove or move root archive files and stray file `70`. | Cleaner deploy root and lower accidental exposure risk. | Low |

### Strategic bets

| Idea | Payoff | Effort |
|---|---|---:|
| Make venue verification field-level, not page-level. | Lets the site keep strong trust language without overstating partial data. | Medium |
| Complete geo coverage for all fixed-location venues and expose it in schema/API. | Major local SEO, map, AEO, and tool foundation. | Medium |
| Normalize opening hours into structured data consumed by schema, venue pages, search, compare, and API. | Fixes open-now accuracy and strengthens rich data extraction. | Medium |
| Create a canonical `/network/` or `/about/network/` page with Organization schema. | Turns the sister-site graph into a deliberate authority signal. | Medium |
| Ship real Find My Coach / Plan My Trip or remove their indexed footprint. | Converts current stubs into useful lead/engagement tools. | Medium |
| Add a generated all-categories index with counts, intro copy, and links to top guides. | Solves orphan categories and improves long-tail category discovery. | Low-medium |
| Add image sitemap or image metadata for OG/venue imagery once images become venue-specific. | Future visual search and social-rich result upside. | Medium |
| Extend deploy verification into a real quality gate. | Prevents repeat audit findings and reduces regression cost. | Medium |

## 10. Appendix - Methodology

Files inventoried and read/analyzed outside `.git` and `node_modules`: 752 total.

| Type | Count |
|---|---:|
| `.html` | 259 |
| `.md` | 198 |
| `.png` | 162 |
| `.js` | 33 |
| `.cmd` | 31 |
| `.xml` | 29 |
| `.json` | 14 |
| `.woff2` | 8 |
| `.txt` | 4 |
| `.zip` | 3 |
| `.gz` | 2 |
| `.css` | 2 |
| `.yml` | 1 |
| `.yaml` | 1 |
| `.ps1` | 1 |
| `.gitignore` | 1 |
| `_headers` | 1 |
| `_redirects` | 1 |
| extensionless root file `70` | 1 |

Additional inventory:
- Full filesystem including `.git` and `node_modules`: 19,017 files, about 189 MB.
- `node_modules` is present but not tracked by `git ls-files node_modules` in this checkout.
- Root archive files are tracked: `.backups/pattayagym_source_2026-05-08_212722.zip`, `pattayagym_html_2026-05-08_212948.tar.gz`, `pattayagym_og_2026-05-08_212948.tar.gz`, `pattayagym_source_2026-05-08_212753.zip`, and `pattayagym_source_2026-05-08_212803.zip`.

Automated checks performed:
- Recursive file inventory by extension.
- HTML head checks for title, meta description, canonical, h1 count, and duplicates.
- JSON-LD parsing across shipped HTML. 551 JSON-LD blocks parsed with 0 syntax errors.
- LocalBusiness semantic coverage checks for `geo` and `openingHoursSpecification`.
- Sitemap URL local-file resolution. 473 sitemap URLs resolved to local targets in the earlier sitemap pass.
- Internal HTML link graph with scripts stripped and query strings normalized.
- Network-domain reference count across all HTML files.
- Asset-version reference scan.
- Placeholder-data string scan for `Verify`, `Stub`, and verify-exact fields.
- CSP/header inspection and executable inline-script hash posture review.
- Encoding/truncation scan for current HTML files: no NUL bytes, UTF-8 BOMs, or truncated HTML endings were found in the checked source/build files. Windows PowerShell displayed UTF-8 text as mojibake during some reads; byte-level/Node UTF-8 reads showed the underlying files are valid UTF-8.

Assumptions and limits:
- This was a local repository audit, not a live Cloudflare Pages fetch. Findings refer to `C:\pattayagym` as provided.
- I did not modify any source file. The only write made for this audit is this report file.
- Vendor packages in `node_modules` and VCS internals in `.git` were inventoried but excluded from semantic line-by-line product audit because they are not authored site source.
- I did not run destructive commands, deployment commands, CSP sync, rebuild, geocoder, or push scripts.
- Binary images/fonts were inventoried by path/size presence; their visual content was not manually reviewed pixel-by-pixel.

## OBS Notes

| ID | File/line | Observation |
|---|---|---|
| OBS-1 | `C:\pattayagym\robots.txt:23-77` | AI crawler posture is explicit and permissive for GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, Meta, ByteDance, Cohere, Diffbot, Amazonbot, and Facebook fetchers. This is a strong AEO choice if intentional. |
| OBS-2 | `C:\pattayagym\index.html:58-70`; `C:\pattayagym\about\index.html:37` | Organization and Person `sameAs` arrays are complete for the seven named sister domains. |
| OBS-3 | `C:\pattayagym\styles.css:120`; `C:\pattayagym\styles.css:1235-1245` | Focus-visible and reduced-motion handling exist, which is good for WCAG posture. |
| OBS-4 | `C:\pattayagym\_redirects:1-25` | Redirect rules are narrow and purposeful; no obvious redirect chain was found in the local rules. |
| OBS-5 | `C:\pattayagym\scripts\sync-csp-hashes.js:10-17` | CSP hash sync correctly skips JSON-LD and prunes obsolete executable inline-script hashes. Earlier raw hash counts that include JSON-LD would be false positives. |
| OBS-6 | `C:\pattayagym\sitemap.xml:39,67` | Sitemap includes the isolated BJJ/ALFA URLs; the issue is internal HTML discovery, not sitemap omission. |
