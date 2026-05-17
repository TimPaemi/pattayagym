# Pattaya-gym.com Nuclear Audit V2

Date: 2026-05-17
Auditor: Codex
Repository: C:\pattayagym
Live site: https://pattaya-gym.com
Branch observed: redesign-2026
HEAD observed: cc6c1a8 HOTFIX: link 141 orphan venue body markdowns via detailFile
Mode: read-only audit execution, with this report as the only intended output file

## TL;DR

The Round 3/4 hotfix work repaired the biggest content-linkage failure: all 158 venue detail files are now connected, all venue Markdown parsed cleanly, the primary sitemap has 211 URLs, and sampled sitemap URLs returned 200 live. However, production and local source are not in a safe deploy state. The homepage is truncated both locally and live, ending inside a WhatsApp href and missing closing footer/body/html markup. Local `styles.css` is malformed by an unclosed `.back-to-top` block, while live `/styles.css?v=404` is a different stale file, so local fixes for contrast and nav sizing are not live. Lighthouse was run successfully on the live homepage, a venue page, and a category page; it confirms slow LCP around 4s, homepage CLS 0.344, accessibility failures, and CSP-blocked inline scripts on subpages. The site is materially better than the earlier broken build, but it should not be redeployed until the P0s below are fixed and verified.

## Strengths Confirmed

- 158/158 venues have `detailFile` pointers and every pointed Markdown file exists.
- PyYAML parsed all 158 venue Markdown files with 0 strict YAML errors.
- Body content is no longer stub-thin: minimum venue body word count was 724, median was 1060, and 0 pages were under 500 words.
- `sitemap.xml` contains 211 URLs, matching all intended index/detail/category/area/guide/tool/utility pages except the 404 page.
- 20 sampled sitemap URLs returned live 200 responses with expected HTML content types.
- 0 malformed generated `tel:` links were found; prior extension/multi-number phone bugs appear fixed.
- All 158 venue OG images exist, are 1200x630, and are under 200 KB.
- JSON-LD parses without syntax errors across the audited pages.
- The V2 visual direction remains locked in the generated markup: black background, neon accents, marquees, `pattaya<cyan-dot>gym`, Space Grotesk/Inter/JetBrains Mono, and `?v=404` asset versioning.

## P0 Critical

### P0-1: Homepage is truncated in local source and live production

Evidence:
- Local `index.html` ends at `index.html:566` inside `<li><a href="https://api.whatsapp.`.
- Local size was 30,282 bytes and live size was 30,099 bytes; both versions fail the `ends with </html>` check.
- The page is missing `</footer>`, `</body>`, and `</html>`.
- `html-validate` reports a parser/tokenization error at the truncated line.
- Lighthouse homepage failures include `link-name` and `crawlable-anchors`; Cloudflare Email Address Obfuscation injects its email decode script into the unterminated footer attribute on live HTML.
- This is not the acceptable Cloudflare email-obfuscation diff by itself; the underlying local file is already broken.

Impact:
- The homepage DOM is invalid, footer links are corrupted, and crawlers/accessibility tooling see broken anchors.
- Any future deployment preserving this file keeps the main entry page structurally broken.

Required fix:
- Restore/regenerate the full homepage and verify a byte tail containing `</footer>`, `</body>`, and `</html>`.
- Add a guard that fails the build if any emitted HTML file lacks closing `body/html` or ends inside an attribute.

### P0-2: Local CSS is malformed and production is serving a different stale immutable CSS file

Evidence:
- Local `styles.css` has 270 opening braces and 269 closing braces.
- The unclosed block starts at `styles.css:1148` on `.back-to-top`.
- Because `.back-to-top` never closes locally, the following `.footer-col-h` rules are swallowed and the tail rules are missing or invalid.
- Local `styles.css` contains `--hint: #888888` and `.nav-cta` sizing changes, but lacks `prefers-reduced-motion`, `.skip-link`, and `.back-to-top.is-visible` rules.
- Live `/styles.css?v=404` is 35,515 bytes while local is 35,877 bytes. Live CSS is brace-balanced but stale, still using `--hint: #555555` and not carrying local nav CTA sizing.
- Lighthouse live runs still fail contrast on footer hint text and show category CLS caused by the nav CTA.

Impact:
- Current source CSS is not safe to deploy.
- Current production CSS is not the same artifact as local source despite the locked `?v=404` version string.
- Previously claimed CSS fixes are not live.

Required fix:
- Repair the CSS tail, preserve all intended rules, validate CSS syntax, then bump the asset version beyond `404` and purge CDN cache.
- Add a CSS parse/brace validation step before deployment.

### P0-3: CSP blocks the current shared inline UI script on 211 pages

Evidence:
- Current inline script hash missing from `_headers` CSP: `sha256-3sFDjj07/v+AcynubQTiklcYgjsk0m15gevlYPkjOxc=`.
- `_headers` contains 9 script hashes, but 7 are stale extras and the active back-to-top/progress script hash is absent.
- Lighthouse on `/gyms/fairtex-pattaya/` and `/category/muay-thai/` reports console errors for blocked inline script execution.
- Cloudflare beacon is also blocked by CSP when Cloudflare injects it.

Impact:
- The page progress/back-to-top behavior is shipped but blocked in production.
- Best Practices score is reduced and browser consoles show real security-policy failures.

Required fix:
- Externalize the shared script or add the exact current hash to `_headers`.
- Remove stale hashes after confirming all inline scripts in emitted HTML.
- Decide whether Cloudflare Insights is intentionally enabled; if yes, allow it explicitly, otherwise disable injection.

## P1 High

### P1-1: Interactive tool pages still ship as static shells without their browser JS

Evidence:
- No HTML file references `app.js`, `app.bundle.js`, `site-ui.js`, `compare.js`, `favorites.js`, `recent.js`, `shortcuts.js`, `share.js`, or `analytics.js`.
- `/search/`, `/map/`, `/compare/`, `/plan-my-trip/`, `/find-my-coach/`, and `/favorites/` render tool UIs but cannot provide the expected interactive behavior.
- The shipped JS files total about 63.7 KB raw and 19.5 KB gzip, but are dead payloads in the repository.

Impact:
- Key V2 discovery tools appear present but do not function.
- Prior P0 tool-page JS issue remains unresolved/deferred.

Required fix:
- Either wire the correct JS bundles into the relevant pages with CSP-compatible loading, or remove/rename the tool pages until functional.

### P1-2: Markdown renderer emits invalid HTML around lists and tables

Evidence:
- `build-v2.js:245-309` converts Markdown with regex substitutions and then wraps loose blocks afterward.
- Generated content can produce `<p><ul>...</ul></p>` and stray `</p>` around lists/tables.
- Full `html-validate` run produced 211 errors, mostly invalid paragraph/list/table structure and missing table header scopes.

Impact:
- Venue content is rich, but generated markup is not spec-clean.
- Assistive tech and crawlers may interpret sections inconsistently.

Required fix:
- Replace the regex Markdown renderer with a parser, or reorder/scope the wrapping logic so block elements are never nested inside paragraphs.
- Add `scope` to generated table headers.

### P1-3: Heading hierarchy fails on most generated pages

Evidence:
- Static audit found heading hierarchy violations on 163 pages.
- Lighthouse examples include `h4.channel-card-name` after higher-level skips.
- Venue social/contact cards and guide/category card headings are the repeated pattern.

Impact:
- Accessibility score is reduced and page outline quality is degraded.

Required fix:
- Normalize card heading levels so visual styling is decoupled from semantic rank.

### P1-4: Live accessibility fixes for contrast and nav stability are not deployed

Evidence:
- Live CSS still has `--hint: #555555`, causing 2.81:1 footer text contrast on black.
- Red/pink CTA buttons with white text fail contrast at about 3.5:1.
- Lighthouse category page reports CLS 0.161 with `a.nav-cta` as the shifting node.
- Local CSS appears to contain some intended fixes, but production still serves stale `?v=404` CSS.

Impact:
- Production fails WCAG contrast checks and has avoidable layout shift.

Required fix:
- Land the corrected CSS only after fixing P0-2, then bump asset version and verify Lighthouse again.

### P1-5: Structured data is valid but incomplete for rich-result coverage

Evidence:
- 158 venues have `LocalBusiness`/subtype schema and address/image/priceRange.
- Only 47/158 venue schemas have telephone.
- Only 51/158 have `openingHoursSpecification`.
- 0 venues have `geo`.
- 0 guide pages emit `FAQPage`; guide pages also lack `Article`/`Speakable` schema.

Impact:
- Schema syntax is fixed, but rich-result eligibility and local SEO completeness remain limited.

Required fix:
- Prioritize phone/hours/geo enrichment for high-value venues and add guide Article/FAQ schema where content supports it.

### P1-6: Missing escaping in custom Markdown conversion is a latent content/XSS risk

Evidence:
- `mdToHtml()` does not escape Markdown body text before HTML conversion.
- Link replacement emits raw `<a href="$2">$1</a>`.
- List and table cell content is inserted raw.

Impact:
- Current content is controlled, but the generator trusts Markdown body input too much.
- Future copied venue content can inject markup accidentally or maliciously.

Required fix:
- Escape text nodes by default and sanitize allowed links/HTML explicitly.

## P2 Medium

### P2-1: Venue data quality gaps remain

Evidence:
- 5 venues have flagged bad/vague addresses in `data.js`.
- 11 venue Markdown frontmatter addresses are vague.
- 7 venue websites still use `http://`.
- 29 descriptions are outside the 80-180 character target.
- Duplicate normalized address clusters remain: `pattaya verify exact` x4, `pattaya region` x6, `pattaya` x10, and Bali Hai departure wording x2.

Impact:
- The directory is usable but still has local-search quality and trust gaps.

Required fix:
- Clean addresses, confirm HTTPS availability for websites, and normalize descriptions in priority order by traffic/value.

### P2-2: 22 venue Markdown files still lack sources

Evidence:
- Missing `sources:` examples include `alfa-bjj-pattaya`, `sanit-sport-club`, `lumpinee-boxing-stadium`, `rajadamnern-stadium`, `anytime-fitness-pattaya`, `bounce-pattaya`, `royal-varuna-yacht-club`, `ocean-marina-jomtien`, `pattaya-bike-boat-tours`, and `pattaya-beach-public-aerobics`.

Impact:
- Content claims are harder to verify and future refresh work has weaker provenance.

Required fix:
- Add at least official website/social/map source references to each unsourced venue.

### P2-3: Metadata polish is incomplete

Evidence:
- 18 page titles are outside the 20-65 character target.
- 1 description is outside the 80-165 character target.
- Homepage is missing `og:site_name`.
- `404.html` canonicalizes to `/404/` while the emitted file path is `/404.html`.

Impact:
- No broad SEO failure, but polish and canonical consistency are not complete.

Required fix:
- Tune outlier titles/descriptions and decide whether `/404/` should exist or the canonical should point elsewhere.

### P2-4: External link hygiene needs cleanup

Evidence:
- 18 external HTTP references were found.
- 6 `target="_blank"` links use `rel="noopener"` but omit `noreferrer`; all are WhatsApp/LINE links on tool pages.
- Duplicate normalized website cluster `afacademy.pro/en` appears twice, apparently intentionally related to the AF Academy redirect.

Impact:
- Minor security/privacy and data-quality issues remain.

Required fix:
- Prefer HTTPS where available and use `rel="noopener noreferrer"` consistently.

### P2-5: Migrated guide/tool pages contain many orphaned classes

Evidence:
- Examples include `cat-venue-card`, `cv-pill`, `favorite-btn`, `venue-h1`, `venue-hero`, `venue-lede`, `search-filter-panel`, `search-filters`, `map-layout`, `map-panel`, `channel-*`, `cmp-add-more`, and `sec-h`.

Impact:
- Markup and stylesheet are drifting apart.
- Future UI changes become harder to reason about.

Required fix:
- Either restore intended styles or remove unused class names during the tool-page JS restoration pass.

### P2-6: Repository hygiene issues are still present

Evidence:
- `.gitignore` contains NUL/UTF-16-looking corrupted duplicate tail text.
- `.backups` and large archive artifacts are tracked.
- Local `main` is behind `origin/main` by 2 commits, while `redesign-2026` matches origin.
- README build-chain documentation is stale and still describes legacy build scripts as primary.

Impact:
- Operational confusion remains likely during handoff and deployment.

Required fix:
- Clean `.gitignore`, decide archive retention policy, and update README to describe `build-v2.js` as the active build path.

## P3 Low

### P3-1: Duplicate sitemap index files exist

Evidence:
- Both `sitemap-index.xml` and `sitemap_index.xml` exist locally and live, with matching live ETags.
- `robots.txt` references the hyphenated version.

Impact:
- Low direct risk, but avoid duplicate crawl entry points.

Required fix:
- Keep one canonical index file and redirect or delete the duplicate if hosting rules allow.

### P3-2: Minor dead code and stale diagnostics remain

Evidence:
- `build-v2.js` `topMarquee()` has an unused `set` variable.
- `main()` still logs the old sitemap-count formula even though sitemap generation now emits 211 URLs.
- Browser JS has event listeners without cleanup, though those files are currently unreferenced.

Impact:
- Low current runtime impact, but this adds audit noise.

Required fix:
- Remove dead variables and stale logs during the next generator cleanup.

### P3-3: CSS architecture is still flat and manually fragile

Evidence:
- No `@layer` usage.
- Local CSS includes 49 hard-coded color literals and 50 hard-coded spacing values.
- Local CSS has 2 `!important` rules.
- No container queries or logical-property strategy were found.

Impact:
- Not a functional blocker, but the stylesheet is easy to regress.

Required fix:
- After P0/P1 repairs, consolidate repeated tokens and introduce a lightweight cascade organization.

### P3-4: PWA is basic only

Evidence:
- Manifest exists with 192/512 icons and standalone display.
- No service worker file or registration exists.

Impact:
- Installability basics exist, but no offline or repeat-visit caching strategy is available.

Required fix:
- Add service worker only after the asset-versioning/CSP issues are stable.

## Lighthouse Results - Live Production

| Page | Perf | A11y | Best Practices | SEO | FCP | LCP | CLS | TBT | INP | Speed Index | Top 5 opportunities / diagnostics |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| `/` | 64 | 84 | 100 | 92 | 3.2s | 4.0s | 0.344 | 40ms | n/a | 3.2s | Render-blocking resources ~1,840ms; unused JS ~66 KiB; server response 240ms; LCP element 3,980ms; layout shift + broken footer anchors |
| `/gyms/fairtex-pattaya/` | 80 | 94 | 93 | 100 | 3.3s | 4.1s | 0.032 | 50ms | n/a | 3.3s | Render-blocking resources ~1,930ms; unused JS ~66 KiB; server response 110ms; console CSP errors; LCP element 4,090ms |
| `/category/muay-thai/` | 74 | 96 | 93 | 100 | 3.2s | 4.0s | 0.161 | 30ms | n/a | 3.2s | Render-blocking resources ~1,830ms; unused JS ~66 KiB; server response 250ms; console CSP errors; nav CTA layout shift |

Notes:
- Lighthouse ran successfully with headless Chrome in this sandbox.
- INP was not reported by Lighthouse lab runs because no qualifying interaction was measured.

## Local vs Live Parity Snapshot

| URL | Status | Live bytes | Local bytes | Raw delta | Normalized delta | CF email obfuscation | Ends with `</html>` |
|---|---:|---:|---:|---:|---:|---|---|
| `/` | 200 | 30,099 | 30,282 | -183 | -60 | yes | no |
| `/styles.css?v=404` | 200 | 35,515 | 35,877 | -362 | 818 | no | n/a |
| `/gyms/fairtex-pattaya/` | 200 | 55,630 | 54,695 | 935 | -111 | yes | yes |
| `/gyms/fitz-club/` | 200 | 43,416 | 42,266 | 1,150 | -100 | yes | yes |
| `/gyms/lumpinee-boxing-stadium/` | 200 | 33,933 | 33,256 | 677 | -222 | yes | yes |
| `/category/muay-thai/` | 200 | 26,953 | 26,708 | 245 | -30 | yes | yes |
| `/area/jomtien/` | 200 | 35,588 | 35,343 | 245 | -30 | yes | yes |
| `/about/` | 200 | 15,195 | 14,813 | 382 | -60 | yes | yes |
| `/search/` | 200 | 13,603 | 13,525 | 78 | -30 | yes | yes |
| `/map/` | 200 | 12,763 | 12,668 | 95 | -30 | yes | yes |
| `/sitemap.xml` | 200 | 21,704 | 21,704 | 0 | 0 | no | n/a |
| `/robots.txt` | 200 | 1,408 | 1,408 | 0 | 0 | no | n/a |

Cloudflare Email Address Obfuscation is the expected HTML diff on pages with email links. The homepage truncation and CSS artifact mismatch are not acceptable Cloudflare-only diffs.

## Raw Numbers Table

| # | Metric | Value | Notes |
|---:|---|---:|---|
| 1 | Venues in `data.js` | 158 | All categories combined |
| 2 | Categories in `data.js` | 15 | V2 taxonomy |
| 3 | Venue Markdown files | 158 | `venues/*.md` |
| 4 | Venue `detailFile` pointers present | 158 | 100% |
| 5 | Venue `detailFile` pointers resolving | 158 | 100% |
| 6 | Strict YAML parse errors | 0 | PyYAML check |
| 7 | Venue body min word count | 724 | No stubs under 500 |
| 8 | Venue body median word count | 1,060 | Strong content depth |
| 9 | Venue body p90 word count | 1,315 | Strong upper distribution |
| 10 | Venue body max word count | 3,111 | Longest page |
| 11 | Venue bodies under 500 words | 0 | Prior thin content fixed |
| 12 | Venue Markdown files missing `sources` | 22 | Still needs provenance pass |
| 13 | Bad/vague data addresses | 5 | From data audit |
| 14 | Vague frontmatter addresses | 11 | From Markdown audit |
| 15 | HTTP venue websites | 7 | Data-level websites |
| 16 | Descriptions outside 80-180 chars | 29 | Data quality |
| 17 | Duplicate normalized address clusters | 4 | Needs manual review |
| 18 | Duplicate normalized website clusters | 1 | AF Academy duplicate appears intentional |
| 19 | Verified date max age | 20 days | All within 60 days |
| 20 | Generated HTML/index pages audited | 212 | Includes 404 |
| 21 | HTML files missing closing body/html | 1 | `index.html` |
| 22 | Homepage local bytes | 30,282 | Truncated |
| 23 | Homepage live bytes | 30,099 | Truncated live too |
| 24 | HTML titles present | 212 | 100% |
| 25 | Titles in 20-65 chars | 194 | 18 outliers |
| 26 | Meta descriptions present | 212 | 100% |
| 27 | Descriptions in 80-165 chars | 211 | 1 outlier |
| 28 | Canonicals present | 212 | 100% |
| 29 | HTTPS canonicals | 212 | 100% |
| 30 | Canonical self-match count | 211 | 404 mismatch |
| 31 | Hreflang en + x-default present | 212 | 100% |
| 32 | H1 pages | 212 | 100% |
| 33 | Complete Twitter card metadata | 212 | 100% |
| 34 | Complete OG metadata | 211 | Homepage missing `og:site_name` |
| 35 | Duplicate titles | 0 | Good |
| 36 | Duplicate descriptions | 0 | Good |
| 37 | JSON-LD parse errors | 0 | Good |
| 38 | BreadcrumbList nodes | 211 | All non-404/index intended pages |
| 39 | LocalBusiness nodes | 158 | Venue pages |
| 40 | SportsActivityLocation nodes | 103 | Venue subtype mix |
| 41 | ExerciseGym nodes | 26 | Venue subtype mix |
| 42 | HealthClub nodes | 31 | Venue subtype mix |
| 43 | SportsClub nodes | 23 | Venue subtype mix |
| 44 | GolfCourse nodes | 17 | Venue subtype mix |
| 45 | ItemList nodes | 21 | Collections/guides/tools |
| 46 | Venue schemas with address | 158 | 100% |
| 47 | Venue schemas with image | 158 | 100% |
| 48 | Venue schemas with priceRange | 158 | 100% |
| 49 | Venue schemas with telephone | 47 | Data gap |
| 50 | Venue schemas with openingHoursSpecification | 51 | Data/parser gap |
| 51 | Venue schemas with sameAs | 122 | Reasonable but incomplete |
| 52 | Venue schemas with geo | 0 | Missing local SEO field |
| 53 | FAQPage schema nodes | 0 | Guides lack FAQ schema |
| 54 | Sitemap URLs | 211 | Primary sitemap |
| 55 | Sampled sitemap URLs returning 200 | 20/20 | Live `curl -I -L` |
| 56 | Broken internal links | 0 | Static local check |
| 57 | Broken internal anchors | 0 | Static local check |
| 58 | External HTTPS refs | 4,021 | Includes repeated links |
| 59 | External HTTP refs | 18 | Needs cleanup |
| 60 | `mailto:` links | 542 | Many repeated footer/contact links |
| 61 | `tel:` links | 141 | Generated links |
| 62 | Malformed `tel:` links | 0 | Prior bug fixed |
| 63 | `target=_blank` missing `noreferrer` | 6 | Tool page social links |
| 64 | Duplicate href instances | 2,201 | Mostly nav/footer repetition |
| 65 | Skip link first body child | 212/212 | Markup good |
| 66 | `<main id="main">` pages | 212/212 | Markup good |
| 67 | Images missing alt | 0 | Good |
| 68 | Inputs missing labels | 0 | Good |
| 69 | Buttons missing names | 0 | Good |
| 70 | Positive tabindex values | 0 | Good |
| 71 | Heading hierarchy violation pages | 163 | Needs semantic cleanup |
| 72 | Local `styles.css` raw bytes | 35,877 | Source file |
| 73 | Local `styles.css` gzip bytes | 6,515 | Approximate gzip |
| 74 | Local `styles.css` lines | 1,180 | Source file |
| 75 | Local CSS opening braces | 270 | Malformed |
| 76 | Local CSS closing braces | 269 | Malformed |
| 77 | Local CSS unused selectors | 8 | Static scan |
| 78 | Local CSS hard color literals | 49 | Tokenization opportunity |
| 79 | Local CSS hard spacing values | 50 | Tokenization opportunity |
| 80 | Local CSS `!important` count | 2 | Low |
| 81 | Live CSS bytes | 35,515 | Stale/different artifact |
| 82 | Browser JS files shipped | 9 | All unreferenced |
| 83 | Browser JS references in HTML | 0 | Tool pages dead |
| 84 | `app.js` raw/gzip bytes | 11,086 / 3,706 | Unreferenced |
| 85 | `app.bundle.js` raw/gzip bytes | 28,293 / 7,529 | Unreferenced |
| 86 | `site-ui.js` raw/gzip bytes | 3,808 / 1,311 | Unreferenced |
| 87 | `compare.js` raw/gzip bytes | 6,078 / 1,874 | Unreferenced |
| 88 | `favorites.js` raw/gzip bytes | 6,111 / 1,967 | Unreferenced |
| 89 | `recent.js` raw/gzip bytes | 3,100 / 1,179 | Unreferenced |
| 90 | `shortcuts.js` raw/gzip bytes | 3,334 / 1,029 | Unreferenced |
| 91 | `share.js` raw/gzip bytes | 1,729 / 760 | Unreferenced |
| 92 | `analytics.js` raw/gzip bytes | 195 / 144 | Unreferenced |
| 93 | `eval()` / `Function()` uses in JS | 0 | Good |
| 94 | Inline unique script hashes | 3 | Current emitted HTML |
| 95 | CSP hashes in `_headers` | 9 | 1 active missing, 7 stale extras |
| 96 | Missing active CSP hashes | 1 | Back-to-top/progress script |
| 97 | OG venue PNGs | 158 | 100% |
| 98 | OG PNG dimension failures | 0 | All 1200x630 |
| 99 | OG PNGs over 200 KB | 0 | Good |
| 100 | Manifest icons | 2 | 192 and 512 |
| 101 | Service worker files | 0 | No offline/PWA caching |
| 102 | `node --check` failures | 0 | Checked generator and browser JS |
| 103 | `html-validate` errors | 211 | Mostly renderer/HTML structure |
| 104 | Tracked backup/archive artifacts | 5 | Repo hygiene |
| 105 | Branch parity with `origin/redesign-2026` | 0 ahead / 0 behind | Good |
| 106 | Local `main` vs `origin/main` | 0 ahead / 2 behind | Operational note |

## Recommended Fix Order

1. Restore or regenerate the full homepage and verify it ends cleanly with `</footer>`, `</body>`, and `</html>`.
2. Add an HTML tail/parse guard that fails if any generated HTML file is truncated or ends inside an attribute.
3. Repair the local `styles.css` unclosed `.back-to-top` block and preserve intended tail rules.
4. Validate CSS syntax locally before any deployment.
5. Reconcile local CSS with live CSS, then bump the asset version beyond `?v=404` and purge CDN cache.
6. Fix CSP by externalizing the shared inline script or adding `sha256-3sFDjj07/v+AcynubQTiklcYgjsk0m15gevlYPkjOxc=`.
7. Remove stale CSP hashes after confirming active inline scripts.
8. Decide whether Cloudflare Insights is intended; either allow its script in CSP or disable injection.
9. Re-run Lighthouse on `/`, `/gyms/fairtex-pattaya/`, and `/category/muay-thai/` and compare LCP/CLS/A11y/Best Practices.
10. Wire the correct JS into `/search/`, `/map/`, `/compare/`, `/plan-my-trip/`, `/find-my-coach/`, and `/favorites/`, or temporarily remove those tool surfaces from navigation.
11. Replace or fix `mdToHtml()` so lists/tables are never wrapped inside paragraphs.
12. Add `scope` attributes to generated table headers.
13. Run `html-validate` across all emitted HTML and drive errors to zero or to a documented allowlist.
14. Normalize heading hierarchy across card components and venue sub-sections.
15. Fix live contrast issues for footer hint text and red/pink CTA buttons.
16. Stabilize nav CTA sizing and verify category-page CLS below 0.1.
17. Add safe text escaping/sanitization to Markdown body rendering and links.
18. Enrich high-value venue schema with telephone, hours, and geo data.
19. Add guide Article schema and FAQPage schema where content supports it.
20. Clean the 22 unsourced venue Markdown files.
21. Fix vague/bad addresses and duplicate address clusters.
22. Convert HTTP venue websites to HTTPS where available.
23. Tune outlier titles/descriptions and add homepage `og:site_name`.
24. Fix the 404 canonical decision and ensure the canonical target exists or is intentional.
25. Add `rel="noopener noreferrer"` to the 6 remaining external social links.
26. Remove or style orphaned migrated classes during tool-page restoration.
27. Clean `.gitignore` corruption and decide whether tracked archive artifacts should remain in git.
28. Update README to make `build-v2.js` the documented active build path.
29. Remove duplicate sitemap index file or redirect one version to the canonical one.
30. Remove stale build log formulas and minor dead variables.

## Prior Audit Finding Status

| Prior finding | Status | Evidence |
|---|---|---|
| `index.html` truncation | Regressed | Local and live homepage are truncated at footer WhatsApp href |
| NUL byte corruption in deploy text | Partially fixed | HTML/CSS/JS mostly clean, but `.gitignore` still contains corrupted NUL-looking tail |
| `package.json` active build script wrong | Fixed | `build` now points to `node build-v2.js`; legacy build preserved separately |
| CSP hashes missing/stale | Partially fixed/regressed | GA/TOC hashes present, current back-to-top/progress hash missing, stale extras remain |
| Malformed `tel:` links | Fixed | 0 malformed generated tel links found |
| Tool-page JS missing | Still open | 9 browser JS files have 0 HTML refs |
| Homepage canonical/hreflang/OG | Mostly fixed | Canonical/hreflang/Twitter present; homepage still missing `og:site_name` and is truncated |
| Homepage WebSite/Organization JSON-LD | Fixed | Homepage graph present and valid |
| BreadcrumbList on venue/category/area | Fixed | 211 BreadcrumbList nodes parsed |
| PostalAddress on venue schemas | Fixed | 158/158 venue schemas have address |
| Sitemap completeness | Fixed | 211 intended URLs in primary sitemap; sampled live URLs returned 200 |
| Schema telephone | Partially fixed | 47/158 venues have telephone schema |
| Schema opening hours | Partially fixed | 51/158 venues have openingHoursSpecification |
| Title length | Partially fixed | 194/212 in target range |
| Footer version string | Mostly fixed | Subpages show V2 footer/version; homepage truncates before footer completes |
| Heading hierarchy | Still open | 163 pages with hierarchy violations |
| `rel="noopener noreferrer"` | Mostly fixed | 6 links still omit `noreferrer` |
| Button inside anchor in card JS | Unresolved in dead JS | Browser JS remains unreferenced, but legacy patterns should be checked before reactivation |
| Skip link | Partially fixed | Markup present on 212/212; local CSS tail currently broken |
| Broken YAML in venue MD | Fixed | 0 strict YAML errors |
| `--hint` contrast | Fixed locally but not live | Live CSS still uses `#555555` and fails contrast |
| `.nav-cta` min-height | Fixed locally but not live | Live category page still shifts on nav CTA |
| Backup zips tracked | Still open | 5 tracked archives/backups observed |
| HTTP external URLs | Still open | 18 HTTP refs / 7 data websites |
| 141 orphan MD hotfix | Fixed | 158/158 detailFile pointers resolve |

## Dimension Notes A-U

### A. Local and live parity

Local and live now mostly match for generated subpage HTML after accounting for Cloudflare Email Address Obfuscation, but two deviations matter: homepage truncation exists on both sides, and live CSS differs from local source while sharing the locked `?v=404` URL. The `www.pattaya-gym.com` redirect rule exists locally, but `curl` in this sandbox could not resolve the `www` host, so DNS should be checked outside the sandbox.

### B. Build pipeline and generator

`package.json` correctly points `build` to `node build-v2.js`. `build-v2.js` passes `node --check`, but the generator still uses a fragile regex Markdown converter and has stale diagnostics such as the old sitemap-count formula. The line-by-line review found the right high-risk areas: `phoneToTel()` is now effective, `parseHoursSpec()` is useful but imperfect around separator semantics, `parseFrontmatter()` is lenient, and `mdToHtml()` needs parser-grade escaping/block handling.

### C. Data model

The data layer is materially healthier after the detail-file hotfix. All venue content files resolve, all venue body content is substantial, and verification dates are fresh. Remaining data work is ordinary cleanup: vague addresses, HTTP websites, unsourced Markdown, description length outliers, and schema enrichment fields.

### D. CSS

The V2 design direction is intact, but the CSS delivery state is unsafe. Local CSS is malformed, production CSS is stale and different, and immutable asset versioning hides the mismatch. Fixing the CSS tail and asset versioning is a precondition for trusting any visual/a11y regression result.

### E. Browser JavaScript

Every browser JS file passes syntax checks, but every file is unreferenced by emitted HTML. That makes tool-page behavior nonfunctional while also leaving dead code paths with old `innerHTML` rendering patterns that must be reviewed before reactivation.

### F. SEO metadata

Core metadata coverage is strong: titles, descriptions, canonical links, hreflang, and Twitter card metadata are present across the audited set. Remaining metadata issues are outlier title lengths, one description outlier, homepage missing `og:site_name`, and the 404 canonical mismatch.

### G. JSON-LD

Schema syntax is valid and broad coverage exists for venue, breadcrumb, collection, website, and organization nodes. The main limitation is completeness, not validity: phone, hours, geo, FAQ, Article, and Speakable coverage are incomplete or absent.

### H. Sitemap and robots

The primary sitemap is now coherent at 211 URLs, and sampled live sitemap URLs returned 200. `robots.txt` references the primary sitemap and shard sitemaps. Duplicate sitemap index files remain a low-priority cleanup item.

### I. Link integrity

Internal link and anchor checks are clean, and malformed `tel:` links are fixed. External link hygiene remains imperfect because of HTTP URLs and six social links missing `noreferrer`.

### J. Accessibility

Skip-link and `main` landmarks are present, and basic image/input/button checks are good. Accessibility debt is concentrated in invalid homepage markup, color contrast, heading hierarchy, and layout shift.

### K. Content quality

Venue body depth is now a strength. Editorial consistency remains mixed around spelling variants such as `center`/`centre`; `Pratamnak`/`Pratumnak` was treated as intentional per the brief. Source references still need completion.

### L. Representative generated-page checks

Representative venue outputs show the prior content-link issue is fixed: Fairtex, Fitz Club, Lumpinee/Rajadamnern, golf venues, and previously broken Markdown pages now have body content and schema. Fitz/Tara/Petchrungruang phone normalization now emits dialable single `tel:` links rather than multi-number or extension strings.

### M. Browser compatibility

The shipped CSS avoids many bleeding-edge selectors, but it also lacks a deliberate modern fallback strategy. `prefers-reduced-motion` exists in live CSS but is missing from the malformed local tail, proving the current source/deploy split can erase compatibility and accessibility safeguards.

### N. UX and product behavior

The homepage communicates the V2 directory concept, and the 404 page is on-brand. However, the tool pages are not actually tools until their JS is wired, and the homepage footer break damages trust at the first entry point.

### O. Security headers

Live headers include HSTS preload, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP, CORP, and CSP. The main security defect is CSP drift from current inline scripts, plus the unresolved decision around Cloudflare script injection.

### P. Performance

Lighthouse shows LCP around 4s on all sampled live pages and homepage CLS at 0.344. Render-blocking CSS/fonts, unused JS diagnostics, and nav/hero layout instability are the main targets after P0 correctness fixes.

### Q. Image assets

Venue OG image coverage is complete and dimensions/size are good. No image-alt failures were found in generated pages. Future performance work can consider next-gen image formats only after correctness and CSS parity are repaired.

### R. PWA

The manifest and icon basics exist, but there is no service worker. That is acceptable for now; offline caching should not be added until asset versioning, CSS parity, and CSP are stable.

### S. Migrated legacy classes

Legacy/migrated class names remain throughout guide and tool pages without matching CSS. This should be cleaned during the same pass that restores tool-page JS so markup, styling, and behavior are aligned.

### T. Prior audit verification

The biggest prior data/content failures are fixed: detail-file linkage, YAML validity, sitemap breadth, PostalAddress schema, and tel sanitization. The biggest regressions/open issues are homepage truncation, CSP drift, CSS live/local mismatch, heading hierarchy, and nonfunctional tool pages.

### U. Git and release state

The current working branch observed was `redesign-2026`, aligned with `origin/redesign-2026`. Local `main` was behind `origin/main` by 2 commits. Tags for rollback points exist, but repo hygiene is weakened by tracked backup archives, stale README build docs, and `.gitignore` corruption.

## Out of Scope For This Audit

- No source fixes were made.
- No build was run.
- No deployment, git add, commit, or push was performed.
- No redesign recommendations were made; the locked V2 visual direction was treated as fixed scope.
- Cloudflare Email Address Obfuscation was treated as a known acceptable diff except where it exposed/amplified the truncated homepage.

## Notes For Next Session

Start with P0-1 and P0-2 before touching feature work. Do not trust visual or Lighthouse results until the homepage is complete, CSS is syntactically valid, live CSS matches local source, and the asset version is bumped. After those repairs, run `html-validate`, CSS validation, `node --check`, live curl parity, and the same three Lighthouse URLs before moving into tool-page JS restoration.
