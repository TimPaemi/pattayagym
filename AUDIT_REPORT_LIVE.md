# pattaya-gym.com ? Codex Nuclear Audit Round 2 (post-V2 live)
Date: 2026-05-17
Auditor: Codex (read-only)
Branch: redesign-2026
HEAD: d06e0d8
Live URL state confirmed: 2026-05-17T14:41:22Z via curl checks

## TL;DR
The V2 launch is not in the old catastrophic state: `index.html` is intact at 546 lines, `styles.css` has no NUL padding, `node --check` passes for `build-v2.js`, `data.js`, and the retained legacy builders, and all 212 audited HTML pages have a title, description, viewport, one H1, a skip link, and a main landmark. The biggest production issues are now narrower but real: three venue phone CTAs emit malformed `tel:` links, the public search/map/compare-style tool pages advertise interactive controls while loading no feature JavaScript, and Cloudflare Email Address Obfuscation mutates live HTML away from the local repo. Top priorities are: fix dialable phone sanitization, restore or explicitly de-scope tool-page interactivity, disable or account for Cloudflare email rewriting, close sitemap/schema gaps, and clean the accessibility/semantic debt.

## ?? Strengths (what's clean)
- 212/212 shipped HTML pages have exactly one `<h1>`, a viewport tag, `<html lang="en">`, theme color, description, title, skip link, and a `<main>` landmark.
- 423/423 JSON-LD blocks parse as valid JSON; venue, category, area, guide, and utility pages all have at least baseline structured data.
- 158/158 venue pages exist, 158/158 venue Markdown files exist, 158/158 data records are present, and 158/158 venue OG images resolve locally.
- Internal link integrity is strong: 4,898 internal links scanned, 0 missing local targets, 0 broken same-page anchors.
- Live security headers are present on HTML, CSS, XML, robots, API, feed, and plugin endpoints: HSTS, CSP, COOP, CORP, Permissions-Policy, Referrer-Policy, X-Frame-Options, and nosniff are all delivered.
- `robots.txt` explicitly allows all required AI/search crawlers from the brief and references both the primary sitemap and sitemap shards.
- CSS footprint is lean for the current design: `styles.css` is 36,725 bytes raw / 6,741 bytes gzip, with global `:focus-visible` and `prefers-reduced-motion` coverage.

## ?? P0 ? Critical (ship-blockers or production-impacting)

### P0-1 ? Malformed `tel:` links remain on three public venue pages
- **Severity:** P0
- **Pages affected:** 3 venue pages, 8 malformed `tel:` hrefs.
- **Evidence:** `gyms/fitz-club/index.html:67` emits `tel:+6638250421ext.2621`; `gyms/petchrungruang-gym/index.html:67` emits `tel:+66861473166(Mr.Piyawath)`; `gyms/tara-tennis-club/index.html:67` emits `tel:+66951410568/+66879089800`. Source records show the unsanitized patterns in `data.js:57`, `data.js:36`, and `data.js:95`.
- **Fix recommendation:** Normalize venue `phone` at data/build boundaries: one display string may include extensions or multiple numbers, but every `tel:` href must contain one dialable E.164-style number. For Tara, choose the primary number in `tel:` and show the second as secondary text/link.
- **Effort:** 30-60 minutes plus generated-page verification.

### P0-2 ? Search, map, compare, and planning tools present interactive shells with no feature JavaScript
- **Severity:** P0
- **Pages affected:** `/search/`, `/map/`, `/compare/`, `/plan-my-trip/`, `/find-my-coach/`, `/favorites/`.
- **Evidence:** `search/index.html:69` renders a search input and `search/index.html:97` renders empty `#search-results`, but the page loads only the GA script. `map/index.html:66-77` renders filter pills, `#pg-map`, and an empty panel, but no Leaflet, venue data script, or map script is loaded. `compare/index.html:68` renders empty `#compare-content`, again with no local `compare.js`. Site-wide grep found no HTML references to `app.bundle.js`, `site-ui.js`, `compare.js`, `favorites.js`, `recent.js`, `shortcuts.js`, or `share.js`.
- **Fix recommendation:** Either load and CSP-cover the relevant feature scripts on each tool page, or convert the pages to honest static guidance and remove/filter interactive empty states. Because `/map/` is in navigation, fix map/search first.
- **Effort:** 4-8 hours depending on whether existing JS is still compatible with V2 DOM.

## ?? P1 ? High (fix this week)

### P1-1 ? Live HTML is not local-equivalent because Cloudflare rewrites email links
- **Severity:** P1
- **Pages affected:** Any page containing `mailto:` links; confirmed on `/`, `/about/`, `/gyms/fairtex-pattaya/`, `/category/muay-thai/`, `/area/jomtien/`, and `/guides/best-muay-thai-pattaya/`.
- **Evidence:** Local `index.html:455` has `mailto:info@pattaya-gym.com`; live curl rewrites it to `/cdn-cgi/l/email-protection...` and injects `/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js` before `</body>`. The same mutation happens to footer email links and Fairtex's venue email.
- **Fix recommendation:** Disable Cloudflare Email Address Obfuscation for this site, or explicitly accept it and update parity tests/CSP expectations. Direct contact links are part of the locked brand/contact contract, so disabling is cleaner.
- **Effort:** 15 minutes in Cloudflare, plus one curl parity recheck.

### P1-2 ? Primary `sitemap.xml` omits 26 indexable pages
- **Severity:** P1
- **Pages affected:** 26 URLs, including `/add-your-gym/`, `/compare/`, `/favorites/`, `/find-my-coach/`, `/map/`, `/plan-my-trip/`, `/press/`, `/pattaya-sport-stats/`, and 17 `/guides/*/` pages.
- **Evidence:** `sitemap.xml` contains 185 URLs, while 211 on-disk `index.html` URLs exist. The shard union covers 210 URLs; `/colophon/` is missing even from shards. `robots.txt` references both primary and shard sitemaps, but consumers that use only `sitemap.xml` miss 26 pages.
- **Fix recommendation:** Make `sitemap.xml` the complete canonical urlset or make it a sitemap index. Ensure `/colophon/` is included or deliberately `noindex`ed.
- **Effort:** 30-60 minutes.

### P1-3 ? Structured data is valid but materially incomplete
- **Severity:** P1
- **Pages affected:** 158 venue pages and 18 guide pages.
- **Evidence:** 158/158 venues have LocalBusiness variants and BreadcrumbList, but 0/158 have FAQPage, 0/158 have `geo`, 47/158 have schema telephone, and only 37/158 have `openingHoursSpecification` while 121 fall back to `openingHours`. Guide pages have 18/18 `CollectionPage` + `BreadcrumbList`, but 0/18 `Article` and 0/18 `SpeakableSpecification` despite the brief requiring Article + Speakable for guides.
- **Fix recommendation:** Extend `build-v2.js` schema graph generation: FAQPage from visible FAQ sections, Article/Speakable for guides, optional GeoCoordinates only when real data exists, and consistent `openingHoursSpecification` parsing.
- **Effort:** 1 day.

### P1-4 ? Title-length hygiene regressed across generated pages
- **Severity:** P1
- **Pages affected:** 123/212 pages outside the 20-65 character target.
- **Evidence:** Examples: `category/adventure/index.html` title is 73 chars; `gyms/atv-tours-pattaya/index.html` is 100 chars; `gyms/bangkok-hospital-pattaya-rehab/index.html` is 114 chars. Descriptions are mostly clean, with only 2 pages over target.
- **Fix recommendation:** Add title-shortening rules per page type. For venues, use `Venue Name | Pattaya.Gym` and avoid repeating long category labels in the title.
- **Effort:** 1-2 hours.

### P1-5 ? V2 chrome contract is not complete on all page types
- **Severity:** P1
- **Pages affected:** 187 pages missing visible `v404` footer version; 25 pages missing reading progress.
- **Evidence:** `build-v2.js:450` renders `? Last updated ? ${BUILD_TIMESTAMP}` without `v${ASSET_VERSION}`. `index.html:575` has `v404`, but generated pages do not. The 25 missing progress pages are mainly guides and tools such as `compare/index.html`, `favorites/index.html`, and the 17 guide pages.
- **Fix recommendation:** Put footer version and progress-bar markup in the shared V2 shell used by every page type.
- **Effort:** 1-2 hours.

### P1-6 ? Accessibility semantics fail site-wide heading hierarchy and button requirements
- **Severity:** P1
- **Pages affected:** 212 heading hierarchy violations; 187 buttons without explicit `type`; 187 inline `onclick` handlers.
- **Evidence:** `404.html:145` has `<button class="back-to-top" ... onclick="...">` without `type`. `build-v2.js:420`, `build-v2.js:430`, and `build-v2.js:439` emit footer column labels as `<h4>`, producing H2?H4 skips across the site.
- **Fix recommendation:** Change decorative footer labels to non-heading elements or proper h3s; add `type="button"` to back-to-top; move back-to-top behavior into external JS or a CSP-hashed shared script.
- **Effort:** 2-4 hours.

### P1-7 ? External-link rel policy is inconsistent
- **Severity:** P1
- **Pages affected:** 2,532 target-blank external links lack `noreferrer`.
- **Evidence:** Footer/project links and venue website/map links commonly use `rel="noopener"` only; `app.js:71-72` does the same for map and website links.
- **Fix recommendation:** Standardize all `target="_blank"` external anchors to `rel="noopener noreferrer"` unless there is a documented analytics need.
- **Effort:** 30-60 minutes.

### P1-8 ? Homepage card renderer nests a button inside an anchor
- **Severity:** P1
- **Pages affected:** Homepage directory cards generated by browser JS if `app.js` is used again.
- **Evidence:** `app.js:76` creates `favoriteBtn` as a `<button>` and `app.js:78-81` inserts it inside `<a class="card" href="/gyms/${g.id}/">`.
- **Fix recommendation:** Refactor cards to an `<article>` with a distinct title/details link and a sibling favorite button.
- **Effort:** 1-2 hours.

## ?? P2 ? Medium (fix this month)

### P2-1 ? Five venue Markdown frontmatters are not YAML-parseable
- **Severity:** P2
- **Pages affected:** `venues/koh-larn-coral-island.md`, `venues/laem-chabang-international.md`, `venues/pattaya-marathon.md`, `venues/phoenix-gold-golf.md`, `venues/planet-football-pattaya.md`.
- **Evidence:** PyYAML reports `mapping values are not allowed here`; representative lines include unquoted colon-bearing fields like `venues/koh-larn-coral-island.md:10` (`hours: Beaches: ...`) and `venues/pattaya-marathon.md:16` (`worldAthleticsRated: Yes ? ...`).
- **Fix recommendation:** Quote colon-bearing scalar values and add a YAML parse check to CI.
- **Effort:** 30 minutes.

### P2-2 ? Content data gaps weaken trust and schema richness
- **Severity:** P2
- **Pages affected:** 111 venues with empty phone, 53 with empty website, 26 missing `sources:`, 16 vague addresses.
- **Evidence:** `data.js` has 111 `phone: ""` records and 53 `website: ""` records. Oldest verified dates are `2026-04-27`; by the current date, 2026-05-17, that is about 20 days old.
- **Fix recommendation:** Prioritize the top traffic venues and all records used in schema. Use explicit ?not published? copy where contact data is genuinely unavailable.
- **Effort:** Ongoing editorial/data pass.

### P2-3 ? Legacy/tool inner classes are not covered by `styles.css`
- **Severity:** P2
- **Pages affected:** Guides and tool pages.
- **Evidence:** Static class/CSS comparison found 25 classes on `guides/best-muay-thai-pattaya/index.html` with no `styles.css` selector (`venue-h1`, `venue-hero`, `cat-venue-card`, `cv-pill`, `faq-item`, etc.); `search/index.html` has 13 uncovered search classes; `map/index.html` has 9 uncovered map classes; `compare/index.html` has 14 uncovered compare/channel classes.
- **Fix recommendation:** Either add V2 rules for these legacy classes or rewrite those inner templates to use existing V2 primitives. Pair this with the tool JS repair.
- **Effort:** 4-8 hours.

### P2-4 ? `--hint` color fails WCAG AA on black
- **Severity:** P2
- **Pages affected:** Footer metadata and any hint-colored text.
- **Evidence:** `styles.css:19` sets `--hint: #555555`; measured contrast on `--bg #000000` is 2.82:1. `--muted #888888` measures 5.92:1.
- **Fix recommendation:** Raise `--hint` to at least `#777` or reuse `--muted` for readable metadata.
- **Effort:** 5 minutes.

### P2-5 ? Mobile CSS audit coverage is thin
- **Severity:** P2
- **Pages affected:** Sitewide responsive behavior.
- **Evidence:** `styles.css` has `@media (max-width: 700px)` but not the requested 600/760/900-specific checks. `.btn` has explicit mobile-height coverage, but `.nav-cta` at `styles.css:236` lacks explicit `min-height:44px`.
- **Fix recommendation:** Add a static mobile QA pass at 360/414/768 and guarantee 44px minimum tap area for nav CTAs and pill controls.
- **Effort:** 2 hours.

### P2-6 ? Repo/deploy hygiene still includes archives and stale docs
- **Severity:** P2
- **Pages affected:** Repo hygiene, deploy footprint, contributor clarity.
- **Evidence:** Tracked archive/backup artifacts include `.backups/pattayagym_source_2026-05-08_212722.zip`, `BACKUP_MANIFEST_2026-05-08.md`, two root source zips, and two tarballs. `README.md:10` still describes the legacy `build.js -> build-extras.js -> build-discovery.js` chain, while `package.json:8` correctly points `npm run build` to `node build-v2.js`.
- **Fix recommendation:** Remove archives in a normal cleanup commit and update README to V2 reality.
- **Effort:** 30-60 minutes.

### P2-7 ? HTTP external venue URLs remain in shipped pages
- **Severity:** P2
- **Pages affected:** At least 18 `http://` external references in generated HTML.
- **Evidence:** Examples include `gyms/greenwood-golf-club/index.html` (`http://www.gwgolfclub.com/`), `gyms/pattaya-cricket-club/index.html` (`http://www.pattayacricketclub.com/`), and `gyms/petchrungruang-gym/index.html:71` (`http://petchrungruang.com/`).
- **Fix recommendation:** Prefer HTTPS when it resolves; if a venue only supports HTTP, mark it as such in data and keep it out of canonical/schema `sameAs` where possible.
- **Effort:** 1-2 hours.

## ?? P3 ? Low / polish

### P3-1 ? Six stale CSP hashes remain after the current inline-script set
- **Severity:** P3
- **Pages affected:** Header policy only; no current script is blocked.
- **Evidence:** Exact hash check found 414 inline executable script instances, 3 unique hashes, and 0 missing CSP hashes. `_headers:10` still carries 9 hashes, leaving 6 stale entries.
- **Fix recommendation:** Remove stale hashes when scripts next move or rebuild; no emergency.
- **Effort:** 10 minutes.

### P3-2 ? Duplicate sitemap index file is still present
- **Severity:** P3
- **Pages affected:** Repo root.
- **Evidence:** Both `sitemap-index.xml` and `sitemap_index.xml` exist and each contains 5 sitemap entries. `robots.txt` references the dash form.
- **Fix recommendation:** Delete the underscore duplicate after confirming no external process references it.
- **Effort:** 5 minutes.

### P3-3 ? `llms.txt` omits an explicit API cluster
- **Severity:** P3
- **Pages affected:** AI search readiness document.
- **Evidence:** `llms.txt` references venues, categories, areas, guides, sitemap, search, and map clusters, but not an explicit API cluster string.
- **Fix recommendation:** Add a small API/data section pointing to `/api/venues.json`, `/api/categories.json`, `/api/areas.json`, and `/openapi.yaml`.
- **Effort:** 10 minutes.

### P3-4 ? Browser feature posture is conservative but under-uses progressive enhancements
- **Severity:** P3
- **Pages affected:** CSS only.
- **Evidence:** `styles.css` uses no `:has()`, `@layer`, `text-wrap`, `@container`, `aspect-ratio`, or logical properties. It has 8 `-webkit-` and 1 `-moz-` prefixes, all benign.
- **Fix recommendation:** No urgent action. Consider `text-wrap: balance` and `aspect-ratio` only when visual QA needs them.
- **Effort:** Optional.

## Dimension Notes (A-P)

### A. Local vs live parity
CSS and sitemap parity are clean after normalizing line endings: `/styles.css?v=404` and `/sitemap.xml` normalized hashes match local, and `robots.txt` matches byte-for-byte. HTML pages do not match local because Cloudflare rewrites email addresses and injects `/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js`; this is a production transform, not a git deploy mismatch. `/_headers` itself returns 404 as a file, but response headers on live pages correctly deliver the CSP and security headers.

### B. Visual consistency
The V2 shell is broadly present: Space Grotesk/Inter/JetBrains Mono font links, `?v=404`, duplicated marquees, cyan-dot brand marks, black background, skip links, and PA Authority footer branding are present across the audited set. The execution gaps are measurable: 187 pages lack `v404` in the footer, 25 pages lack the reading progress marker, and legacy/tool inner class names are not fully covered by `styles.css`.

### C. Mobile responsiveness
All pages have `width=device-width` viewports. Static CSS has a 700px breakpoint and mobile button coverage for `.btn`, but does not include the requested 600/760/900 breakpoint coverage and `.nav-cta` lacks explicit 44px minimum target sizing. This pass did not run browser screenshots or Lighthouse per the brief.

### D. SEO meta tags
212/212 pages have titles, descriptions, canonical tags, viewport, theme color, language, and one H1. 211/212 canonicals are self-referential; only `404.html` canonicalizes to `/404/` instead of `/404.html`. Complete OG metadata is present on 211/212 pages and complete Twitter metadata is present on 212/212. The main SEO issue is title length: 123/212 are outside the 20-65 character target.

### E. Structured data / JSON-LD
All 423 JSON-LD blocks parse. Homepage has WebSite + Organization. Venue pages have LocalBusiness variants and BreadcrumbList. Category and area pages have ItemList + BreadcrumbList. Guide pages have CollectionPage + BreadcrumbList. Rich-result depth remains weak: no venue FAQPage, no guide Article/Speakable, no venue geo, partial telephone, and inconsistent openingHoursSpecification.

### F. Sitemap + crawl directives
`sitemap.xml` lists 185 URLs with no missing local files; 10 sampled live sitemap URLs returned 200. The shard union contains 210 URLs, while disk has 211 index pages; `/colophon/` is absent from all sitemap urlsets. `robots.txt` references the primary sitemap, index sitemap, and all shard sitemaps.

### G. Internal + external link hygiene
Internal link integrity is clean: 4,898 internal links, 0 broken local targets, and 0 broken anchors. External hygiene is weaker: 2,532 target-blank links lack `noreferrer`, at least 18 HTTP external venue references remain, and two sampled Rage Fight Academy URLs timed out after redirects during external HEAD checks.

### H. Accessibility
Skip links and `<main>` landmarks are present on all pages, all image tags have alt attributes, inputs are labelled, and no empty-name anchors/buttons were found. Sitewide issues remain: 212 heading hierarchy skips, 187 buttons without explicit type, 187 inline event handlers, and `--hint` fails text contrast.

### I. Content integrity
158 venue Markdown files exist and every generated venue page exists. Body depth is strong: min 724 words, median 1,061, P90 1,327, max 3,116, and 0 under 500 words. Content data gaps remain: 111 empty phones, 53 empty websites, 26 missing sources, 16 vague addresses, 5 YAML parse errors, and oldest verified dates from 2026-04-27.

### J. Build pipeline + repo hygiene
`node --check build-v2.js`, `node --check data.js`, `node --check build.js`, `node --check build-extras.js`, and `node --check build-discovery.js` all passed. The canonical package script is now correct (`package.json:8` uses `node build-v2.js`), but README still documents the legacy chain. Tracked backup archives remain and should be removed in a cleanup pass.

### K. Security headers + CSP
Live headers include CSP, HSTS preload, nosniff, DENY frame policy, strict-origin-when-cross-origin referrer policy, Permissions-Policy, COOP, CORP, and CORS on `/api/*`. Exact inline-script hashing found 3 current unique script hashes, all present in CSP; 6 old hashes can be removed later. Cloudflare Email Address Obfuscation injects a self-hosted external script into live HTML; it is allowed by `script-src 'self'` but causes parity and contact-link concerns.

### L. Browser compatibility
Static CSS is conservative: no `:has()`, `@layer`, `text-wrap`, container queries, aspect-ratio, or logical properties were found. Existing prefixes are limited to sticky/backdrop/font smoothing/scrollbar-style compatibility and are not a blocker.

### M. Usability
The homepage answers ?what is this site?? in the first screen and exposes the main directory promise clearly. The serious usability regressions are tool pages: `/search/`, `/map/`, and `/compare/` render controls and empty containers but load no feature JS. `/map/` is especially visible because it is linked from the main nav.

### N. Migrated-legacy page health check
Migrated guides/tool pages no longer show the old `?v=237`, `sf-builtby`, `PATTAYA.GYM`, or Inter Tight artifacts. However, sampled pages still use inner classes not covered by V2 CSS: guides have 25 uncovered classes, search 13, compare 14, map 9, and find-my-coach 15. This explains likely browser-default or under-styled internals without changing the locked V2 shell.

### O. Specific prior audit issues
Fixed: index truncation, NUL byte corruption, package build script, CSP current hashes, homepage canonical/hreflang/OG/Twitter, homepage WebSite/Organization JSON-LD, BreadcrumbList on venues/categories/areas, PostalAddress on venues, `?v=237`, `sf-builtby`, and visible all-caps `PATTAYA.GYM`. Still open: `--hint` contrast, 5 YAML-broken venue files, primary sitemap drift, FAQPage on venues, h4 hierarchy violations, and data completeness gaps.

### P. Git state + deploy hygiene
Local branch is `redesign-2026`, not `main`, but `HEAD`, `origin/main`, and `origin/redesign-2026` are all `d06e0d8` with 0/0 ahead-behind, so the deployed refs are aligned. `main-pre-v2-rollback` exists. The only current worktree item before this report was untracked `CODEX_NUCLEAR_AUDIT_LIVE.md`; this report is intentionally uncommitted.

## ?? Raw numbers

| Metric | Result |
| --- | --- |
| Branch | `redesign-2026` |
| HEAD | `d06e0d8` |
| origin/main | `d06e0d8` |
| origin/redesign-2026 | `d06e0d8` |
| HEAD vs origin/main | `0 / 0` |
| HEAD vs origin/redesign-2026 | `0 / 0` |
| Rollback tag | `main-pre-v2-rollback` present |
| Pre-report dirty state | 1 untracked file: `CODEX_NUCLEAR_AUDIT_LIVE.md` |
| HTML pages audited | 212 |
| Index pages audited | 211 |
| Venue HTML pages | 158 |
| Category pages | 15 |
| Area pages | 6 |
| Guide pages incl. guide index | 18 |
| Utility pages | 13 |
| Venue Markdown files | 158 |
| Data records | 158 |
| Category records | 15 |
| `index.html` size | 30,673 bytes / 546 lines |
| `styles.css` size | 36,725 bytes raw / 6,741 gzip |
| `styles.css` lines | 1,210 in Python split / 1,167 by PowerShell line count |
| Largest browser JS | `app.bundle.js` 28,293 bytes raw / 7,529 gzip |
| Total audited JS raw size | 63,539 bytes across app/site utility files |
| Null-byte files | 0 |
| `node --check build-v2.js` | PASS |
| `node --check data.js` | PASS |
| `node --check legacy builders` | PASS for `build.js`, `build-extras.js`, `build-discovery.js` |
| Local/live `/` raw parity | mismatch due Cloudflare email rewriting |
| Local/live `/styles.css?v=404` parity | raw mismatch, normalized line endings match |
| Local/live `/gyms/fairtex-pattaya/` parity | mismatch due Cloudflare email rewriting |
| Local/live `/category/muay-thai/` parity | mismatch due Cloudflare email rewriting |
| Local/live `/area/jomtien/` parity | mismatch due Cloudflare email rewriting |
| Local/live `/about/` parity | mismatch due Cloudflare email rewriting |
| Local/live `/guides/best-muay-thai-pattaya/` parity | mismatch due Cloudflare email rewriting |
| Local/live `/sitemap.xml` parity | raw mismatch, normalized line endings match |
| Local/live `/robots.txt` parity | exact match |
| Live `/_headers` URL | 404 as file; CSP delivered on real responses |
| Primary sitemap entries | 185 |
| Sitemap shard union entries | 210 |
| Disk index URLs | 211 |
| Primary sitemap URLs missing local files | 0 |
| Disk URLs missing from primary sitemap | 26 |
| Disk URLs missing from all sitemap shards | 1 (`/colophon/`) |
| Sampled sitemap live statuses | 10/10 returned 200 |
| Internal links scanned | 4,898 |
| Broken internal links | 0 |
| Broken same-page/cross-page anchors | 0 |
| target=_blank links missing `noreferrer` | 2,532 |
| HTTP external refs in HTML href/schema | 18 |
| Sample external URLs checked | 21 |
| Sample external HTTP 200 | 19 |
| Sample external timeouts | 2 Rage Fight Academy URLs after redirect |
| JSON-LD blocks | 423 |
| JSON-LD parse errors | 0 |
| JSON-LD BreadcrumbList nodes | 211 |
| JSON-LD LocalBusiness nodes | 158 |
| Venue pages with LocalBusiness variants | 158/158 |
| Venue pages with BreadcrumbList | 158/158 |
| Venue pages with FAQPage | 0/158 |
| Venue pages with schema telephone | 47/158 |
| Venue pages with PostalAddress | 158/158 |
| Venue pages with geo | 0/158 |
| Venue pages with openingHoursSpecification | 37/158 |
| Venue pages with openingHours fallback | 121/158 |
| Category ItemList/BreadcrumbList | 15/15 and 15/15 |
| Area ItemList/BreadcrumbList | 6/6 and 6/6 |
| Guide Article/Speakable | 0/18 and 0/18 |
| Homepage schema | WebSite + Organization |
| Titles present | 212/212 |
| Title length 20-65 chars | 89/212 |
| Descriptions present | 212/212 |
| Description length 80-165 chars | 210/212 |
| Canonical present | 212/212 |
| Canonical self-match | 211/212 |
| Hreflang en+x-default self-match | 211/212 |
| Complete Open Graph set | 211/212 |
| Complete Twitter card set | 212/212 |
| Viewport present | 212/212 |
| Theme color `#000000` | 212/212 |
| `<html lang="en">` | 212/212 |
| Exactly one H1 | 212/212 |
| Duplicate titles | 0 |
| Duplicate descriptions | 0 |
| Duplicate H1 strings | 0 |
| Skip links present | 212/212 |
| Skip link first body child | 212/212 |
| Main landmarks present | 212/212 |
| Images without alt | 0 |
| Inputs without label | 0 |
| Buttons without accessible name | 0 |
| Buttons without explicit type | 187 |
| Inline event handlers | 187 |
| Heading hierarchy violations | 212 |
| Forms present | 0 |
| Bad tabindex values | 0 |
| `--text` contrast on bg | 19.26:1 |
| `--text-2` contrast on bg | 12.04:1 |
| `--muted` contrast on bg | 5.92:1 |
| `--hint` contrast on bg | 2.82:1 FAIL |
| CSS `:focus-visible` | present |
| CSS `prefers-reduced-motion` | present |
| CSS max-width token | `--max: 1280px` |
| CSS max-width 600/760/900 breakpoints | absent |
| CSS max-width 700 breakpoint | present |
| CSS `:has()` | absent |
| CSS `@layer` | absent |
| CSS `@container` | absent |
| CSS `aspect-ratio` | absent |
| CSS `text-wrap` | absent |
| CSS `-webkit-` prefix count | 8 |
| CSS `-moz-` prefix count | 1 |
| Pages missing footer `v404` | 187 |
| Pages missing reading progress marker | 25 |
| Pages with stale `?v=237`/`?v=222` | 0 |
| Pages with `sf-builtby` | 0 |
| Pages with visible all-caps `PATTAYA.GYM` | 0 |
| Pages with Inter Tight font | 0 |
| Malformed `tel:` hrefs | 8 on 3 pages |
| Venue MD body word min | 724 |
| Venue MD body word median | 1,061 |
| Venue MD body word P90 | 1,327 |
| Venue MD body word max | 3,116 |
| Venue MD under 500 words | 0 |
| Venue MD empty phone | 111 |
| Venue MD empty website | 53 |
| Venue MD missing sources | 26 |
| Vague addresses | 16 |
| YAML parse errors | 5 |
| Oldest verified dates | `2026-04-27` examples |
| `feed.json` validity | valid JSON Feed 1.1 |
| API JSON files | 6/6 valid JSON checked |
| `api/venues.json` license field | `CC BY 4.0` present |
| Robots missing required bots | 0 |
| `llms.txt` API cluster | missing explicit API cluster |
| Redirect rules | 17 |
| Redirect target errors | 0 |
| Security.txt | present |
| CSP current inline hashes missing | 0 |
| CSP stale extra hashes | 6 |
| Service worker file/registration | 0 found |
| Tracked archive/backup artifacts | 6 |
| `sitemap_index.xml` duplicate | present |

## ?? Recommended fix order

1. **Sanitize malformed `tel:` links** ? 30-60 min ? resolves P0-1.
2. **Restore actual JS behavior on `/search/` and `/map/`** ? 4 hr ? resolves the highest-visibility part of P0-2.
3. **Restore `/compare/`, `/favorites/`, `/plan-my-trip/`, and `/find-my-coach/` scripts or make them static** ? 4 hr ? finishes P0-2.
4. **Disable or explicitly account for Cloudflare Email Address Obfuscation** ? 15 min ? resolves P1-1 and live/local parity noise.
5. **Make `sitemap.xml` complete or convert it into a sitemap index** ? 30-60 min ? resolves P1-2.
6. **Add `/colophon/` to sitemap shards or noindex it** ? 10 min ? closes the remaining shard union gap.
7. **Add guide Article + Speakable schema** ? 2 hr ? resolves guide part of P1-3.
8. **Add venue FAQPage and richer opening hours schema** ? 4 hr ? resolves venue schema P1-3.
9. **Add real geo only where verified and avoid placeholders** ? 2 hr + data work ? improves LocalBusiness eligibility.
10. **Shorten generated titles** ? 1-2 hr ? resolves P1-4.
11. **Add footer `v404` and progress marker to the shared shell** ? 1 hr ? resolves P1-5.
12. **Fix footer heading hierarchy and button types** ? 2 hr ? resolves P1-6.
13. **Move inline back-to-top handlers into shared JS or a hashed script** ? 1 hr ? reduces CSP/a11y debt from P1-6.
14. **Standardize external rel to `noopener noreferrer`** ? 30 min ? resolves P1-7.
15. **Refactor homepage card HTML to avoid nested button-in-anchor** ? 1-2 hr ? resolves P1-8.
16. **Quote the 5 broken YAML frontmatters** ? 30 min ? resolves P2-1.
17. **Patch missing CSS or rewrite inner classes for guide/tool content** ? 4-8 hr ? resolves P2-3 and likely visual defaulting.
18. **Raise `--hint` contrast** ? 5 min ? resolves P2-4.
19. **Add explicit mobile tap-target and breakpoint QA rules** ? 2 hr ? resolves P2-5.
20. **Clean repo archives and update README for V2** ? 30-60 min ? resolves P2-6.

## ? Out-of-scope (deferred to round 3)
- Lighthouse / Core Web Vitals deep-dive (LCP / CLS / INP / TBT)
- Cloudflare Workers / edge logic
- Image optimization
- Font subsetting

## ?? Notes for the next session
- I did not modify production code, run `node build-v2.js`, run `npm run build`, commit, or push.
- The report intentionally distinguishes fixed prior-audit issues from current live issues. Do not re-open the old truncation/NUL findings unless a fresh scan reproduces them.
- Cloudflare's email obfuscation is the reason live HTML is not byte-equivalent for HTML pages. If Tim wants exact local/live parity, that Cloudflare feature must be disabled.
- Tool pages are the highest embarrassment risk after phone links because they look like product features but do not currently load their product JavaScript.
- `package.json` is already corrected to `node build-v2.js`; the stale build-chain language is in README, not the npm script.
