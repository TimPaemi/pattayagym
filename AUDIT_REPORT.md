# pattaya-gym.com ? Codex Audit Report (V2 redesign)
Date: 2026-05-17
Auditor: Codex (read-only pass)
Branch: redesign-2026
HEAD: b505d47

## TL;DR

The V2 redesign is visually coherent in the core generated venue/category/area layer, and the 158-venue invariant is intact, but the repo is not yet operationally safe because the normal build command still runs the legacy builder instead of `build-v2.js`. The biggest single finding is that deployment/build documentation and `package.json` point at `build.js`, so a routine `npm run build` can regenerate from the old pipeline and drift away from the locked V2 design. The top areas needing work are build-pipeline alignment, CSP/script execution, sitewide V2 chrome/metadata completion, and schema/sitemap coverage.

## ?? What's clean

- 158/158 venue Markdown files exist in `venues/`, and 158/158 generated venue directories exist under `gyms/`.
- 15/15 categories and 6/6 normalized area pages are present.
- `node --check build-v2.js` and `node --check data.js` both passed syntax validation.
- 0/385 JSON-LD blocks failed JSON parsing.
- 212/212 HTML files have exactly one `<h1>` and a `<main id="main">` or `<main id="main-content">` landmark.
- 212/212 pages have image alt coverage in shipped HTML; no `<img>` tag was missing `alt`.
- 158/158 venue OG images exist under `og/<venue-id>.png`.
- `sitemap.xml` parses successfully, and all 185 URLs in it resolve to on-disk `index.html` files.
- `_redirects` has 17 active rules, no duplicate sources, and no missing local redirect targets.
- `styles.css` keeps scrollbars visible globally and hides scrollbars only on internal horizontal strips.
- `styles.css` has global `:focus-visible` styling and a `prefers-reduced-motion: reduce` block that stops marquee animation.
- CSS and JS raw/gzip sizes are currently reasonable: `styles.css` is 35.0 KB raw / 6.6 KB gzip; largest browser JS is `app.bundle.js` at 28.3 KB raw / 7.5 KB gzip.
- No obvious covert paid placement language was found in the audited snippets; the ?No paid placements? positioning is consistently present.

## ?? P0 ? Critical (ship-blockers)

### Build command still runs the legacy generator, not V2
- **Severity**: P0
- **Pages affected**: all generated output; 158 venue pages + 15 category pages + 6 area pages + utilities are at risk
- **Evidence**: `package.json:8` has `"build": "node build.js"`; `package.json:10` has `"watch": "node build.js --watch"`; `README.md:10` still documents `build.js -> build-extras.js -> build-discovery.js`; `build-v2.js:23` defines the active V2 `ASSET_VERSION = '404'`.
- **Fix**: change `package.json` scripts and README/deploy docs to make `build-v2.js` the canonical production build entry, then run the existing validation/build flow in a write-enabled session.
- **Effort**: 30 min

### CSP hashes are stale, so common inline scripts will be blocked in production
- **Severity**: P0
- **Pages affected**: 188 pages for the inline `gtag` bootstrap, 187 pages for progress/back-to-top, 15 pages for the auto-generated TOC script
- **Evidence**: `_headers:10` hardcodes six `sha256-...` script hashes, but scan found missing hashes `rONgU5LGw/DKhht1MIL/uLBSCKU79fw8fx74+3aqY/o=` on 188 pages, `8sto/wAweiskC/u/nx8azX1aWXMyloHn0n1/nhhYK7Q=` on 187 pages, and `c4qd8JNM1kB0FyJDaerbJmbsFW6I2sLcAIfR964XZbA=` on 15 pages.
- **Fix**: either move these scripts into versioned external JS files covered by `script-src 'self'`, or update CSP hashes mechanically during the V2 build.
- **Effort**: 2 hr

## ?? P1 ? High (fix this week)

### Locked V2 subpage navigation is not implemented
- **Severity**: P1
- **Pages affected**: 212 pages have no search+menu icon pair; 189 pages still expose horizontal `.nav-links`
- **Evidence**: locked design requires wordmark left + two icon buttons right; `build-v2.js:246-254` emits a horizontal text nav and a `nav-cta`; `index.html:59` has `<nav class="nav-links" aria-label="Primary">`; representative generated pages show `.nav-links` at line 35.
- **Fix**: update the V2 nav component to emit the locked icon-button structure and wire it to existing `site-ui.js` expectations, then regenerate pages.
- **Effort**: 2 hr

### Homepage is stale relative to V2 asset version and metadata contract
- **Severity**: P1
- **Pages affected**: homepage plus any page using homepage as visual reference
- **Evidence**: `index.html:11-12` references `styles.css?v=404`, but `index.html:518` says `Last updated ? 2026-05-17 ? v402`; scan found no homepage canonical tag, no homepage JSON-LD, no `progress-bar`, and only `twitter:card` at `index.html:22`.
- **Fix**: rebuild or surgically update the homepage to match `ASSET_VERSION = 404`, add canonical + WebSite/Organization/SearchAction JSON-LD, add full Twitter tags, and include the progress bar pattern.
- **Effort**: 2 hr

### SEO metadata is incomplete across the generated site
- **Severity**: P1
- **Pages affected**: 188 pages lack `hreflang` and `og:locale`; 188 pages lack `twitter:title`, `twitter:description`, and `twitter:image`; 118 pages have titles outside 20-65 characters
- **Evidence**: generated head in `build-v2.js` emits OG basics and `twitter:card` only; no `link rel="alternate"` is emitted. Homepage also lacks canonical entirely.
- **Fix**: extend `build-v2.js` `head()` to emit canonical, `hreflang="en"`, `hreflang="x-default"`, `og:locale`, and complete Twitter card fields, then trim or override long venue titles.
- **Effort**: 2 hr

### Structured data coverage is too shallow for venue/category/area pages
- **Severity**: P1
- **Pages affected**: 158 venue pages lack FAQPage; 179 venue/category/area pages lack BreadcrumbList; 158 LocalBusiness nodes lack `geo` and `openingHoursSpecification`; 111 venue LocalBusiness nodes lack `telephone`
- **Evidence**: `build-v2.js:409` emits `@type: LocalBusiness`; `build-v2.js:417` uses `openingHours` string, not `openingHoursSpecification`; JSON-LD scan found only `LocalBusiness`, `ItemList`, `WebPage`, `BreadcrumbList`, `Article`, `SpeakableSpecification`, `FAQPage`, and `CollectionPage` types.
- **Fix**: add per-page graph generation: BreadcrumbList everywhere, WebSite/Organization on homepage, FAQPage where visible FAQ exists, and richer LocalBusiness variants with `PostalAddress`, `geo`, and `openingHoursSpecification` where data exists.
- **Effort**: 1 day

### Sitemap omits 26 indexable on-disk pages
- **Severity**: P1
- **Pages affected**: 26 pages, including `add-your-gym/`, `colophon/`, `compare/`, `favorites/`, `find-my-coach/`, and 17 guide pages
- **Evidence**: sitemap scan: 185 `<url>` entries, 211 on-disk `index.html` pages, 26 disk pages missing, 0 extra sitemap URLs.
- **Fix**: decide whether each utility/guide should be indexable; add real content pages to `sitemap.xml` and set `noindex,follow` on tools that should stay out of search.
- **Effort**: 30 min

### V2 visual compliance is fragmented outside the generated core
- **Severity**: P1
- **Pages affected**: 23 pages have broken/missing duplicated marquee sets; 25 pages miss reading progress; 48 stylesheet links use old cache-busters (`v=237` or `v=222`); 23 pages retain legacy `sf-builtby` patterns
- **Evidence**: `compare/index.html:34` contains a large inline legacy CSS block; `compare/index.html:91` uses old `.nav-links`; `find-my-coach/index.html:167`, `search/index.html:209`, and `guides/index.html:268` contain `.sf-builtby`.
- **Fix**: migrate the 23 utility/guide/tool pages through the V2 shell without changing URLs or editorial content.
- **Effort**: 1 day

### Footer version is absent or stale
- **Severity**: P1
- **Pages affected**: 211 pages have no `v404` footer version; homepage has stale `v402`
- **Evidence**: `build-v2.js:339` renders `Last updated ? ${BUILD_TIMESTAMP}` with no asset version; `index.html:518` renders `v402` despite `styles.css?v=404`.
- **Fix**: include `v${ASSET_VERSION}` in the shared footer and update the static homepage footer.
- **Effort**: 30 min

### Heading hierarchy fails on footer/contact h4 patterns
- **Severity**: P1
- **Pages affected**: 188 pages
- **Evidence**: examples include `404.html:101 <h4>// The site</h4>`, `about/index.html:98 <h4 class="channel-card-name">info@pattaya-gym.com</h4>`, and `gyms/fairtex-pattaya/index.html:441 <h4>// The site</h4>` after h2 sections.
- **Fix**: promote footer-column labels and card labels to semantically appropriate h3/div elements, preserving visual classes.
- **Effort**: 2 hr

## ?? P2 ? Medium (fix this month)

### Skip-to-content links are missing from most pages
- **Severity**: P2
- **Pages affected**: 188 pages
- **Evidence**: scan found `main` landmarks on 212/212 pages, but no `<a href="#main">` or `#main-content` skip link on 188 pages.
- **Fix**: add a shared visible-on-focus skip link to the V2 shell and legacy utility shells.
- **Effort**: 30 min

### External links omit `noreferrer` everywhere
- **Severity**: P2
- **Pages affected**: 212 pages
- **Evidence**: `build-v2.js` footer links use `target="_blank" rel="noopener"`; `app.js:71-72` emits map/website links with `rel="noopener"`; scan found at least one target-blank external link missing `noreferrer` on every page.
- **Fix**: standardize `rel="noopener noreferrer"` for all target-blank external links.
- **Effort**: 30 min

### Homepage card renderer nests a button inside an anchor
- **Severity**: P2
- **Pages affected**: homepage interactive card grid
- **Evidence**: `app.js:76` defines `favoriteBtn` as a `<button>`; `app.js:78` returns `<a class="card" href="/gyms/${g.id}/">`; `app.js:81` inserts the button inside that anchor.
- **Fix**: render cards as `<article>`/`div` containers with separate link and favorite button targets, or make the whole card non-anchor and keep a single internal details link.
- **Effort**: 2 hr

### Venue source frontmatter is not fully YAML-parseable
- **Severity**: P2
- **Pages affected**: 5 Markdown venue files
- **Evidence**: YAML parse failed in `venues/koh-larn-coral-island.md`, `venues/laem-chabang-international.md`, `venues/pattaya-marathon.md`, `venues/phoenix-gold-golf.md`, and `venues/planet-football-pattaya.md` with ?mapping values are not allowed here.?
- **Fix**: quote values containing colons or special punctuation and add frontmatter validation to CI.
- **Effort**: 30 min

### Citation/source coverage is uneven
- **Severity**: P2
- **Pages affected**: 26 venue Markdown files missing `sources:` frontmatter
- **Evidence**: examples include `venues/alfa-bjj-pattaya.md`, `venues/anytime-fitness-pattaya.md`, `venues/bangkok-hospital-pattaya-rehab.md`, `venues/laem-chabang-international.md`, and `venues/lumpinee-boxing-stadium.md`.
- **Fix**: add primary/official sources to each missing venue and surface them in generated pages.
- **Effort**: 1 day

### Data completeness gaps reduce trust and schema richness
- **Severity**: P2
- **Pages affected**: 111 venues with empty `phone`, 53 with empty `website`, 8 with vague addresses
- **Evidence**: vague address examples include `venues/sitpholek-muay-thai.md` and `venues/true-fitness-pattaya.md` using ?verify exact at booking.?
- **Fix**: prioritize phone/website/address verification for high-traffic categories, and map unknown values to explicit ?not published? UI copy rather than blank schema.
- **Effort**: 1 day

### Backups and large archive files are tracked in git
- **Severity**: P2
- **Pages affected**: repo hygiene / deploy risk
- **Evidence**: tracked files include `.backups/pattayagym_source_2026-05-08_212722.zip`, `BACKUP_MANIFEST_2026-05-08.md`, `pattayagym_html_2026-05-08_212948.tar.gz`, `pattayagym_og_2026-05-08_212948.tar.gz`, and two source zips.
- **Fix**: move backups outside the repo or into ignored archival storage; remove from future git history with a normal delete commit unless history rewrite is explicitly approved.
- **Effort**: 30 min

### No service worker registration is present
- **Severity**: P2
- **Pages affected**: all pages
- **Evidence**: no `sw.js` file and no `serviceWorker` registration string were found.
- **Fix**: either document ?no service worker by design? or add a minimal cache-safe static asset service worker after confirming Cloudflare caching strategy.
- **Effort**: 2 hr

### Mobile breakpoints and tap targets need a pass
- **Severity**: P2
- **Pages affected**: sitewide CSS
- **Evidence**: `styles.css:1176` only has `@media (max-width: 700px)`; audit requested 600/760 checks. `.btn` has a 48px min-height, but `.nav-cta` at `styles.css:236` lacks explicit 44px minimum and is used as a primary nav target.
- **Fix**: add targeted 600/760 breakpoint checks and guarantee 44x44 min tap area for nav/icon controls.
- **Effort**: 2 hr

## ?? P3 ? Low / polish

### Locked `--bg` token is slightly off
- **Severity**: P3
- **Pages affected**: sitewide visual contract
- **Evidence**: locked system says `--bg #0a0a0a`; `styles.css:8` sets `--bg: #000000`, while `styles.css:9` sets `--surface: #0a0a0a`.
- **Fix**: decide whether pure black is intentional; if not, align `--bg` to the locked token.
- **Effort**: 5 min

### Desktop container max-width exceeds the stated design target
- **Severity**: P3
- **Pages affected**: sitewide layout rhythm
- **Evidence**: `styles.css:50` sets `--max: 1280px`; audit target says main content should clamp around 1184px.
- **Fix**: compare 1440/1920 screenshots before changing; if content feels too wide, reduce `--max` or use per-section max widths.
- **Effort**: 30 min

### README still says production branch is `main`
- **Severity**: P3
- **Pages affected**: contributor/deploy clarity
- **Evidence**: `README.md:13` says Cloudflare Pages deploys from branch `main`; current branch is `redesign-2026`.
- **Fix**: update deployment docs after Tim confirms the actual Cloudflare Pages branch.
- **Effort**: 5 min

### 404 canonical points to `/404/`, not the shipped file path
- **Severity**: P3
- **Pages affected**: one page
- **Evidence**: scan found `404.html` canonical is `https://pattaya-gym.com/404/`, while the shipped file is `404.html`.
- **Fix**: either create `/404/index.html` or canonicalize the error template consistently.
- **Effort**: 5 min

## ?? Raw numbers

| Metric | Result |
| --- | --- |
| Branch | `redesign-2026` |
| HEAD | `b505d47` |
| Ahead/behind vs origin/redesign-2026 | `0 / 0` |
| Pre-existing dirty tracked files | 1 (`CODEX_AUDIT_PROMPT.md`) |
| Pre-existing untracked files | 1 (`AUDIT_CLAUDE.md`) |
| HTML files audited | 212 |
| `index.html` files audited | 211 |
| Venue Markdown files | 158 |
| Generated venue directories | 158 |
| Category pages | 15 |
| Area pages | 6 |
| Utility/other HTML pages | 15 |
| Sitemap entries | 185 |
| On-disk index URLs missing from sitemap | 26 |
| Sitemap URLs missing files | 0 |
| Active redirect rules | 17 |
| Redirect target errors | 0 |
| JSON-LD blocks parsed | 385 |
| JSON-LD parse errors | 0 |
| LocalBusiness JSON-LD nodes | 158 |
| Venue pages missing `geo` | 158 |
| Venue pages missing `openingHoursSpecification` | 158 |
| Venue pages missing schema telephone | 111 |
| Pages missing BreadcrumbList where expected | 179 |
| Venue pages missing FAQPage | 158 |
| Homepage WebSite schema present | No |
| Homepage Organization schema present | No |
| Pages with exactly one H1 | 212/212 |
| Pages with heading hierarchy violations | 188 |
| Pages missing skip link | 188 |
| Pages with `<main>` landmark | 212/212 |
| Pages with missing image alt | 0 |
| Pages with target-blank rel missing `noreferrer` | 212 |
| Pages lacking complete hreflang pair | 188 |
| Pages missing `og:locale` | 188 |
| Pages missing full Twitter fields | 188 |
| Pages with title length outside 20-65 | 118 |
| Duplicate titles | 0 |
| Duplicate descriptions | 0 |
| OG images missing on disk | 0 |
| Pages missing progress bar | 25 |
| Pages with bad/missing duplicated marquee sets | 23 |
| Pages with `.nav-links` horizontal nav | 189 |
| Pages missing locked search/menu icon pair | 212 |
| Pages with stale stylesheet cache-busters | 48 links |
| Pages missing footer version | 211 |
| Homepage footer version | `v402` |
| Active V2 asset version | `404` |
| `styles.css` size | 35,011 bytes raw / 6,566 gzip |
| `venue.css` size | 1,861 bytes raw / 839 gzip |
| Largest browser JS file | `app.bundle.js`, 28,293 bytes raw / 7,529 gzip |
| CSS render-blocking stylesheet count distribution | 189 pages with 2, 22 pages with 3, 1 page with 4 |
| Venue body word-count min | 724 |
| Venue body word-count median | 1,061 |
| Venue body word-count P90 | 1,315 |
| Venue body word-count max | 3,116 |
| Venue pages under 500 words | 0 |
| Markdown files with YAML parse errors | 5 |
| Venue Markdown files missing `sources:` | 26 |
| Vague venue addresses | 8 |
| Data records missing phone | 111 |
| Data records missing website | 53 |
| Duplicate venue IDs | 0 |
| OG venue images present | 158/158 |
| `node --check build-v2.js` | PASS |
| `node --check data.js` | PASS |
| Service worker files/registrations | 0 |
| Tracked backup/archive artifacts | 7 |
| CSS `:focus-visible` rule | Present |
| `prefers-reduced-motion` marquee pause | Present |
| Global scrollbar hiding | Not present |
| Root background token | `#000000`, locked spec says `#0a0a0a` |

## ?? Recommended fix order

1. Fix `package.json` and deploy docs to use `build-v2.js` ? 30 min ? resolves P0 build drift.
2. Move inline scripts to external JS or regenerate CSP hashes ? 2 hr ? resolves P0 production script blocking.
3. Update shared V2 head metadata (`hreflang`, Twitter, OG locale, homepage canonical) ? 2 hr ? resolves P1 SEO meta coverage.
4. Add homepage JSON-LD and align homepage footer/progress/version ? 2 hr ? resolves stale homepage gap.
5. Replace `.nav-links` with locked search/menu icon nav in the V2 shell ? 2 hr ? resolves V2 subpage nav compliance.
6. Add version to the generated footer and refresh homepage `v402` ? 30 min ? resolves footer drift.
7. Close sitemap drift for the 26 missing utility/guide/tool pages ? 30 min ? resolves crawl coverage gap.
8. Add BreadcrumbList and richer LocalBusiness schema generation ? 1 day ? resolves structured data P1.
9. Migrate the 23 old utility/guide/tool pages to the V2 shell ? 1 day ? resolves marquee/progress/cache-buster/legacy built-by drift.
10. Fix heading hierarchy by replacing footer/contact h4 labels where semantic h3/div is appropriate ? 2 hr ? resolves Lighthouse a11y issue.
11. Add skip links to the shared shell and legacy utility pages ? 30 min ? improves keyboard access.
12. Change target-blank external links to `rel="noopener noreferrer"` ? 30 min ? improves security/privacy best practice.
13. Refactor homepage card markup to remove nested `<button>` inside `<a>` ? 2 hr ? resolves invalid interactive HTML.
14. Repair five YAML frontmatter files ? 30 min ? stabilizes source parsing.
15. Add missing `sources:` frontmatter to 26 venues ? 1 day ? improves E-E-A-T trust.
16. Verify phone/website/address gaps for the highest-traffic 30 venues first ? 1 day ? improves trust and schema completeness.
17. Remove tracked backup archives with a normal delete commit ? 30 min ? cleans repo/deploy footprint.
18. Decide whether service worker is intentionally absent ? 30 min decision / 2 hr implementation ? closes performance audit item.
19. Add 600/760px responsive checks and explicit nav tap-target minimums ? 2 hr ? improves mobile reliability.
20. Confirm `--bg` and `--max` against screenshots before token/layout changes ? 30 min ? resolves polish drift without changing locked direction blindly.

## ?? Notes for the next session

- I did not modify production code, run `npm run build`, run `node build-v2.js`, commit, or push.
- The only file written by this pass is this report: `AUDIT_REPORT.md`.
- The repo was already dirty before the audit: `CODEX_AUDIT_PROMPT.md` modified and `AUDIT_CLAUDE.md` untracked.
- The scan found fewer content-quality problems than expected: no venue body is under 500 words, and title/description uniqueness is clean. The weak points are generator alignment, metadata/schema completeness, and old-shell stragglers.
- The CSP finding should be verified in a browser or with `curl -I` after deployment because local static file previews do not enforce `_headers`.
- The V2 design direction itself was not challenged; findings are about execution against the locked V2 contract.
