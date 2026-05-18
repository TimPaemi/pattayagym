# Codex Nuclear Audit Round 17 — Report

## Executive Summary

| Severity | Count | Top 3 issues (one-liner each) |
|---|---:|---|
| P0 — Ship-blocker. | 0 | None found. No syntax failure, broken deploy output, critical-path 5xx, or CSP hash miss was confirmed in the current tree. |
| P1 — Urgent. | 5 | Generated venue HTML is invalid on real pages; sitemap advertises 3 guide URLs that do not exist; GA/localStorage/AI-crawler consent posture has no privacy policy. |
| P2 — Important. | 27 | Release gates miss production drift and source corruption; CSP stays loose because 11,186 inline style attributes force `style-src 'unsafe-inline'`; 22 indexable pages are orphaned from the internal link graph. |
| P3 — Polish. | 6 | Mobile fixed controls ignore safe-area insets; favicon coverage lacks SVG/ICO files; several build writes are non-atomic and rebuilds are intentionally non-idempotent. |

I would put this site live for a client only after fixing the P1 items, because the public sitemap and generated HTML currently overstate production quality. The single biggest weakness is that the verification layer is narrower than the site's claims: it can pass while HTML validation, sitemap existence, privacy disclosure, and source-file corruption fail. The single biggest strength is the structured static architecture: data volume, canonical coverage, heading counts, schema breadth, CSP script hashing, and internal link integrity are already strong enough that the remaining issues are specific and fixable.

## 1. JavaScript correctness

**What I checked:** I read every root `.js` file and every `scripts/*.js` helper, then ran `node --check` across the JavaScript inventory. I cross-checked `data.js` against the 158 `venues/*.md` source files, ran `node validate.js`, and inspected the generated inline scripts for localStorage, compare JSON, sharing, live time, and CSP hash coverage. I also checked build constants and release verification scripts for drift against the current production generator.

**Findings:**

### F01.1 — P2 — The search "Open now" filter treats many closed venues as open
- **File(s):** `search-page.js` (lines 74-78)
- **Issue:** The filter uses `/24\/7|24\s*hour|daily/i`, so any hours string containing `Daily` is treated as open now regardless of the current Pattaya time.
- **Why it matters:** This creates false conversion signals for users trying to train immediately, and it undermines the site's "doors actually open today" positioning.
- **Fix:** Replace the regex shortcut with the same parsed-hours logic used by the generated venue page open-now script, or rename the filter to "Daily schedule" until real time parsing is shared.
- **Verification:** Search for `24\\/7|24\\s*hour|daily` in `search-page.js`; it should be gone. Test a venue with `Daily 09:00-18:00` at 22:00 ICT and confirm it does not appear under Open now.

### F01.2 — P2 — Two venue source files disagree with `data.js` category assignments
- **File(s):** `venues/alfa-bjj-pattaya.md` (line 4), `venues/rambaa-somdet-m16.md` (line 4), `data.js` (lines 37, 39)
- **Issue:** Both Markdown files say `category: muay-thai`, while `data.js` correctly classifies Rambaa as `mma` and ALFA as `bjj`. `node validate.js` reports both mismatches.
- **Why it matters:** Any future generator or content tool that reads front matter instead of `data.js` will put BJJ/MMA pages into Muay Thai, recreating hidden taxonomy drift.
- **Fix:** Change `venues/alfa-bjj-pattaya.md` to `category: bjj` and `venues/rambaa-somdet-m16.md` to `category: mma`.
- **Verification:** `node validate.js` should still exit 0, but warnings for those two files should disappear.

### F01.3 — P2 — The asset-version verifier ignores the production generator
- **File(s):** `scripts/verify.js` (lines 23, 139, 170-185), `build-v2.js` (line 23)
- **Issue:** `scripts/verify.js` checks `build.js`, `build-extras.js`, and `build-discovery.js`, but not `build-v2.js`, even though `package.json` uses `node build-v2.js` for production. It reports legacy v237 consistency while production is v412.
- **Why it matters:** A release gate can pass while the live generator is omitted from the version contract. This is how stale CSS/cache-bust regressions survive.
- **Fix:** Include `build-v2.js` and `scripts/build-compare-page.js` in the version check, or retire the v237 legacy builders from the gate.
- **Verification:** Run `node scripts/verify.js`; it should report the production v412 value or fail if legacy files still differ unexpectedly.

### F01.4 — P3 — Build writes are direct, not atomic
- **File(s):** `build-v2.js` (lines 95-98), `scripts/write-new-guides.js` (lines 474-475)
- **Issue:** Generated files are written directly with `fs.writeFileSync(target, content, 'utf8')` rather than writing to a temp file and renaming into place.
- **Why it matters:** A crash, Ctrl+C, disk hiccup, or editor lock can leave a truncated HTML/XML file in the repo. Round 16 already had a truncation scare.
- **Fix:** Add a shared `atomicWrite(file, content)` helper that writes `file + '.tmp-' + process.pid`, then `fs.renameSync(tmp, file)` after the write completes.
- **Verification:** Grep for `writeFileSync(path.join` and `writeFileSync(filePath`; generator output writes should route through the atomic helper.

### F01.5 — P2 — Compare page JSON is not hardened against `</script>` in future data
- **File(s):** `scripts/build-compare-page.js` (lines 54, 173)
- **Issue:** `JSON.stringify(venueSummary)` is inserted directly inside `<script type="application/json">`. The current embedded JSON is valid and contains no `</script>`, but the generator does not escape `<`, `>`, `&`, U+2028, or U+2029.
- **Why it matters:** One future venue description, tag, or imported field containing `</script>` would terminate the script element and break `/compare/`; if that content is ever external, it becomes an XSS boundary.
- **Fix:** Escape dangerous characters after stringify, for example replacing `<` with `\u003c`, `>` with `\u003e`, `&` with `\u0026`, and U+2028/U+2029 with escaped forms.
- **Verification:** Add a test venue description containing `</script><p>x</p>`, rebuild compare, and confirm `JSON.parse(document.getElementById('venues-data').textContent)` succeeds.

## 2. HTML correctness

**What I checked:** I inspected the homepage, `search/index.html`, `compare/index.html`, `about/index.html`, `methodology/index.html`, `changelog/index.html`, `pattaya-sport-stats/index.html`, and representative generated pages. I ran `html-validate` directly against the hand pages and generated venue/category/area pages because the package script is broken on Windows. I also machine-scanned all 258 HTML files for DOCTYPE, lang, charset, viewport, image dimensions/alts, labels, nested interactive elements, and inline style/script shape.

**Findings:**

### F02.1 — P1 — Generated venue pages contain invalid paragraph/list/table markup
- **File(s):** `build-v2.js` (lines 275-331), examples in `gyms/fairtex-pattaya/index.html` (lines 227-229, 252-253), `gyms/no-limit-divers/index.html` (lines 185-187, 200), `gyms/koh-larn-coral-island/index.html` (line 134)
- **Issue:** The Markdown converter wraps blocks before fully isolating generated lists, headings, and tables. `html-validate` reports 210 problems, including implicit paragraph closes and stray `</p>` on real generated venue pages.
- **Why it matters:** Browsers repair this differently, assistive technology gets a malformed content tree, and rich-result parsers can read the wrong text boundaries.
- **Fix:** Replace `mdToHtml` with a real Markdown parser such as `markdown-it` configured with tables, or change the converter to tokenize block elements before paragraph wrapping.
- **Verification:** Direct `npx --yes html-validate ... gyms/*/index.html` should return 0 errors.

### F02.2 — P2 — Generated tables omit `scope` on header cells
- **File(s):** `build-v2.js` (lines 313-318), `scripts/build-compare-page.js` (lines 252-256), examples in `compare/index.html` (line 181) and `gyms/fairtex-pattaya/index.html` (line 313)
- **Issue:** Table headers are emitted as bare `<th>` elements without `scope="col"` or `scope="row"`.
- **Why it matters:** Screen readers cannot reliably associate cells with headers, and the HTML validator flags these tables across venue and compare pages.
- **Fix:** In Markdown tables, emit `<th scope="col">`; in compare, emit `<th scope="col">Venue N</th>` and `<th scope="row" class="compare-row-label">...`.
- **Verification:** `html-validate` should no longer report `element-required-attributes` for `<th>`.

### F02.3 — P2 — The repo's all-page HTML validation command is broken on Windows
- **File(s):** `package.json` (line 17)
- **Issue:** `html:validate-all` wraps globs in single quotes. On PowerShell/cmd, those quotes are passed literally, causing `No files matching patterns ["'index.html'", ...]`.
- **Why it matters:** Tim can believe full HTML validation is wired while the command never validates any file on the Windows development machine.
- **Fix:** Remove single quotes from the globs or invoke the validator through a Node script that expands paths cross-platform.
- **Verification:** `npm run html:validate-all -- --formatter stylish` should run against real files instead of failing with quoted filenames.

## 3. Heading hierarchy

**What I checked:** I scanned all 258 HTML files for `<h1>` counts and walked heading levels in document order. I also spot-checked the homepage, generated venue pages, category pages, area pages, guides, search, compare, about, methodology, changelog, and stats pages.

**Findings:**

No findings. All 258 HTML files have exactly one `<h1>`, and the automated heading walk found no skipped heading levels.

## 4. Schema.org JSON-LD

**What I checked:** I parsed every JSON-LD block and grouped the site by `@type`: LocalBusiness variants, BreadcrumbList, ItemList, FAQPage, Article, WebSite, Organization, Person, WebApplication, CollectionPage, WebPage, AboutPage, and ContactPage. I checked required practical properties, absolute images, ISO dates, page-local duplicate `@id`s, and the Person sameAs URLs. I also cross-checked geo precision from `data/venue-geo.json` against the LocalBusiness output.

**Findings:**

### F04.1 — P2 — LocalBusiness geo coordinates exceed the requested six-decimal precision
- **File(s):** `build-v2.js` (lines 614-620), `data/venue-geo.json` (examples: lines 33, 78, 113, 188, 363, 373, 393, 423, 628, 638, 683, 693, 708, 818)
- **Issue:** `build-v2.js` passes raw cached coordinates into JSON-LD. At least 14 venues have latitude values with 7 decimals, such as `12.9305323` and `12.9135434`.
- **Why it matters:** The precision is more exact than the audit contract requires and can imply false survey-grade accuracy for hand-checked venue locations.
- **Fix:** Round `geo.latitude` and `geo.longitude` with `Number(Number(cached.lat).toFixed(6))` and the same for longitude before emitting schema.
- **Verification:** Parse generated venue JSON-LD and assert no coordinate string has more than six digits after the decimal.

## 5. OpenGraph & Twitter cards

**What I checked:** I scanned all 258 HTML files for `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale`, `og:site_name`, and Twitter large-image tags. I checked image existence/dimensions for `og-image.png` and sampled per-venue `/og/*.png` files. I also checked title and description lengths for share snippets.

**Findings:**

### F05.1 — P2 — 44 social/meta snippets exceed practical length or end in literal ellipses
- **File(s):** `build-v2.js` (lines 345-389), examples in `guides/best-muay-thai-pattaya/index.html` (line 34), `find-my-coach/index.html` (description length 195), and 21 generated venue/area pages with titles over 70 characters
- **Issue:** The scan found 21 titles over 70 characters and 23 descriptions over 160 characters or ending in literal `...`. Guide descriptions such as `best-muay-thai-pattaya` are cut mid-thought.
- **Why it matters:** Search and social previews truncate the most important local intent terms, and literal ellipses look machine-cut rather than editorial.
- **Fix:** Add a `metaDescription(text, max = 155)` helper that truncates at word boundaries without `...`, and add per-template title caps for venue/category-area pages.
- **Verification:** Re-scan all HTML titles/descriptions; titles should be <=70 chars where possible and descriptions <=155-160 without trailing `...`.

### F05.2 — P2 — `robots.txt` blocks the per-venue OG image directory
- **File(s):** `robots.txt` (line 7), `build-v2.js` (line 558), sampled assets `og/fairtex-pattaya.png`, `og/tonys-gym.png`
- **Issue:** Venue pages point `og:image` at `/og/<venue>.png`, but `robots.txt` has `Disallow: /og/` for `User-agent: *`.
- **Why it matters:** Search and social crawlers that respect robots rules can be prevented from fetching the exact large preview images the page advertises.
- **Fix:** Remove `Disallow: /og/`, or add explicit `Allow: /og/*.png` above the disallow if uploads still need blocking.
- **Verification:** Fetch `https://pattaya-gym.com/robots.txt` and confirm `/og/` is crawlable; use Facebook Sharing Debugger or Twitter Card Validator on a venue URL.

## 6. Canonical & hreflang

**What I checked:** I scanned all 258 HTML files for canonical counts, canonical URL shape, `https://pattaya-gym.com` domain usage, trailing slash convention, query strings, fragments, and `hreflang="en"` plus `hreflang="x-default"` self-references.

**Findings:**

No findings. Every scanned HTML page has exactly one canonical, the canonicals use the live HTTPS domain with the trailing slash convention, and each page has the expected English and x-default alternate links.

## 7. Robots, sitemap, indexability

**What I checked:** I read `robots.txt`, `sitemap.xml`, `sitemap-index.xml`, and the split sitemap files. I cross-checked sitemap URLs against local generated files: 158 venue URLs, 15 category URLs, 6 area URLs plus category-area combinations, guides, and core pages. I also checked `<lastmod>`, `<priority>`, `<changefreq>`, and stray root files that Cloudflare Pages can serve.

**Findings:**

### F07.1 — P1 — The sitemap advertises three guide URLs that do not exist
- **File(s):** `build-v2.js` (lines 2065-2075, 2088), `sitemap.xml` (exact URLs), missing local files `guides/english-speaking-muay-thai-pattaya/index.html`, `guides/muay-thai-camps-with-accommodation-pattaya/index.html`, `guides/gym-day-pass-pattaya/index.html`
- **Issue:** `GUIDE_SLUGS` includes three guide slugs generated only by `scripts/write-new-guides.js`, but the Round 16 push script does not run that script and the files are absent in the repo.
- **Why it matters:** Google is told to crawl URLs that will 404 on production. This is an index-quality and trust problem, not a cosmetic sitemap issue.
- **Fix:** Either run `node scripts/write-new-guides.js` in the release flow and commit the three generated guide pages, or remove those three slugs from `GUIDE_SLUGS` until the pages are real.
- **Verification:** `Test-Path guides/<slug>/index.html` should return true for every URL in `sitemap.xml`; production `curl -I` should return 200 for each sitemap URL.

### F07.2 — P2 — `sitemap-index.xml` has stale `lastmod` values and a BOM
- **File(s):** `sitemap-index.xml` (lines 1-8)
- **Issue:** The sitemap index says every split sitemap was last modified `2026-05-15`, while this audit is on `2026-05-18` and the production build timestamp is later. A byte scan also found a UTF-8 BOM on this XML file.
- **Why it matters:** Stale sitemap index metadata weakens crawl recency signals, and the BOM is a small but avoidable XML hygiene inconsistency.
- **Fix:** Generate `sitemap-index.xml` from `build-v2.js` using the same `TODAY` value used for the other sitemap files, and write it without BOM.
- **Verification:** Rebuild and confirm `sitemap-index.xml` lastmod equals the build date and the first three bytes are not `EF BB BF`.

### F07.3 — P2 — Stray root files can deploy as junk public URLs
- **File(s):** `30` (lines 1-3), zero-byte files `af-academy-pattaya`, `git`, `kids-youth`, `kids-youth)`, `Venue`, plus `.wrangler/cache/wrangler-account.json` (lines 1-6)
- **Issue:** The repo root contains extensionless junk files and checked-in Wrangler account metadata. On a static host, extensionless files can become public paths such as `/git` or `/Venue`.
- **Why it matters:** These are embarrassing artifact URLs a competitor or crawler can surface, and the Wrangler account JSON leaks account name/id metadata even if not secret.
- **Fix:** Delete the stray root files, add `.wrangler/` to `.gitignore`, and make `verify-deploy.js` fail on unexpected extensionless root files except approved names like `_headers` and `_redirects`.
- **Verification:** `Get-ChildItem -File | Where-Object { -not $_.Extension -and $_.Name -notin '_headers','_redirects' }` should return 0.

## 8. Internal linking graph

**What I checked:** I extracted internal links from all HTML after stripping scripts, normalized trailing slashes, and compared targets to the local page set. I counted inbound and outbound links, looked for dead ends, broken internal links, redirect-chain risk, and overused anchor text.

**Findings:**

### F08.1 — P2 — 22 indexable pages have zero inbound internal links
- **File(s):** generated output from `build-v2.js` plus hand pages: `/add-your-gym/`, `/colophon/`, `/favorites/`, `/find-my-coach/`, `/pattaya-sport-stats/`, `/plan-my-trip/`, `/press/`, and 15 area-category pages
- **Issue:** The link graph scan found 22 pages with no inbound HTML links from the rest of the site, excluding 404. Examples include `/area/east-pattaya/mma/`, `/area/jomtien/racquet/`, `/area/naklua/adventure/`, and `/pattaya-sport-stats/`.
- **Why it matters:** Orphaned but indexable pages rely on the sitemap alone. Users and crawlers cannot naturally discover them, so they carry weaker internal authority.
- **Fix:** Add an area/category cross-link matrix on area pages, link `/pattaya-sport-stats/` from About/Methodology or footer, and either link or noindex utility tools that are not meant to rank.
- **Verification:** Re-run the inbound-link script; every indexable page should have at least one inbound link from a non-404 page.

## 9. External link hygiene

**What I checked:** I scanned all HTML for external anchors, `target="_blank"`, `rel` values, affiliate-looking URLs, and user-generated link surfaces.

**Findings:**

No findings. All scanned `target="_blank"` external links include `rel="noopener noreferrer"`, and I found no affiliate or user-generated external links requiring `sponsored` or `ugc`.

## 10. CSS quality

**What I checked:** I read `styles.css` and scanned all HTML/templates for inline `<style>` blocks, inline `style` attributes, hard-coded colors, focus styles, mobile viewport units, `!important`, fixed positioning, reduced-motion handling, and feature fallback patterns.

**Findings:**

### F10.1 — P2 — Inline style attributes keep CSP permanently loose
- **File(s):** `build-v2.js` (examples: lines 744, 1069, 1459), `scripts/build-compare-page.js` (lines 147-148, 239-250), `_headers` (line 10)
- **Issue:** The scan found 11,186 inline `style=` attributes across 258 HTML files. `_headers` therefore must allow `style-src 'unsafe-inline'`.
- **Why it matters:** The script side of CSP is tight, but style injection remains wide open and prevents moving toward a stricter CSP without a large template cleanup.
- **Fix:** Move repeated inline declarations into classes in `styles.css`, starting with generated hero ledes, report text, compare table cells, and footer microcopy.
- **Verification:** `rg -n "style=\"" -g "*.html"` should trend toward 0, and `_headers` should be able to remove `'unsafe-inline'` from `style-src`.

### F10.2 — P3 — The base layout uses `100vh` without a dynamic viewport fallback
- **File(s):** `styles.css` (line 77)
- **Issue:** `body` sets `min-height: 100vh` but does not add `min-height: 100dvh` for modern mobile browsers.
- **Why it matters:** Mobile Safari and Chrome URL-bar behavior can make full-height layouts feel cropped or jumpy.
- **Fix:** Add `min-height: 100dvh` after the existing `100vh` declaration.
- **Verification:** In mobile emulation, resize the browser chrome and confirm the body height tracks the visual viewport without bottom clipping.

## 11. Color contrast & accessibility

**What I checked:** I computed WCAG contrast for representative design-token combinations: primary text, secondary text, muted text, cyan/pink/yellow/mint accents on background and surface, and black text on accent buttons. I checked focus color against dark backgrounds as well.

**Findings:**

No findings. The sampled ratios all pass WCAG 2.2 AA: text on background is about 19.26:1, secondary text about 12.04:1, muted text about 5.92:1, and accent text combinations sampled above 4.5:1 for normal text.

## 12. Keyboard navigation & focus management

**What I checked:** I checked skip-link presence, global `:focus-visible`, fixed controls, search filters, compare pickers, dynamic results, and ARIA/live-region coverage for client-rendered updates. I also scanned for positive `tabindex` and modal/dropdown focus traps.

**Findings:**

### F12.1 — P2 — Dynamic search/compare result changes are not announced to assistive tech
- **File(s):** `search-page.js` (lines 103-138), `scripts/build-compare-page.js` (lines 227-237), `search/index.html` (results containers), `compare/index.html` (table mount and empty state)
- **Issue:** Search updates counts/cards through `innerHTML`, and compare toggles an empty message/table, but neither page exposes an `aria-live` status region.
- **Why it matters:** Keyboard and screen-reader users can change filters or selections without receiving confirmation that the result set changed.
- **Fix:** Add `role="status" aria-live="polite"` to the search stats element and compare empty/status element, and update text content with the count/selection summary.
- **Verification:** Use NVDA/VoiceOver or Chrome Accessibility pane; changing a filter or compare picker should announce the new result state.

### F12.2 — P2 — Search filter selects suppress the default outline and replace it with a weak border-only cue
- **File(s):** `styles.css` (line 1372)
- **Issue:** `.search-filter-panel select:focus { outline: none; border-color: var(--cyan); }` removes the user-agent focus outline and changes only border color.
- **Why it matters:** WCAG 2.4.13 expects a visible focus indicator with enough area and contrast; a one-pixel border color change is easy to miss.
- **Fix:** Use `:focus-visible` and match the global focus ring: `outline: 3px solid var(--cyan); outline-offset: 3px;`.
- **Verification:** Tab through `/search/`; every select should have the same visible ring as links and buttons.

## 13. Screen-reader & ARIA

**What I checked:** I scanned landmarks, icon-only controls, decorative SVG usage, skip links, form labels, table headers, image alt text, and button names. I separated findings already captured under HTML table semantics and dynamic live regions from new ARIA defects.

**Findings:**

No additional findings beyond F02.2 and F12.1. The remaining scanned controls have accessible names, images have alt text and dimensions, and I found no positive `tabindex` or unlabeled form inputs.

## 14. Performance — render path

**What I checked:** I inspected `<head>` order, stylesheet loading, font loading, third-party scripts, inline script placement, generated page size, and critical render path on homepage, venue pages, search, and compare.

**Findings:**

### F14.1 — P2 — Every generated page render-blocks on Google Fonts CSS
- **File(s):** `build-v2.js` (lines 364-368), `index.html` (font links in head)
- **Issue:** Pages preconnect to Google Fonts, then load `https://fonts.googleapis.com/css2...display=swap` as a normal stylesheet in the critical path.
- **Why it matters:** A third-party CSS request can delay first render, and it creates an avoidable dependency for a static local directory site.
- **Fix:** Self-host the needed font files with `@font-face { font-display: swap; }`, or use a system-font stack if brand fidelity is not worth the request.
- **Verification:** Chrome DevTools Network should show no `fonts.googleapis.com` request during initial render.

### F14.2 — P2 — The "live Pattaya time" widget is only as correct as the visitor's system clock
- **File(s):** `build-v2.js` (lines 515-529, 796-845)
- **Issue:** Both the footer clock and open-now logic derive ICT from `new Date()` on the visitor device.
- **Why it matters:** A user with a skewed clock or timezone misconfiguration sees wrong live time and possibly wrong open/closed status. The copy says "live Pattaya time," which reads as authoritative.
- **Fix:** Either label it as device-based, remove the live claim, or fetch a small server-generated timestamp/status at build or edge time.
- **Verification:** Temporarily set the OS clock wrong, load a venue page, and confirm the UI no longer presents the wrong value as authoritative.

## 15. Performance — assets

**What I checked:** I inspected `og-image.png`, sampled generated OG images, icon files, favicons, image sizes, and robots access. `og-image.png` is 1200x630 and 32.5 KB; sampled venue OG images are also 1200x630 and small.

**Findings:**

### F15.1 — P3 — Common favicon files are absent
- **File(s):** missing `favicon.svg`, missing `favicon.ico`, existing `icon-192.png`, `icon-512.png`, `manifest.json`
- **Issue:** The repo has PNG app icons and an inline SVG data favicon, but no physical `favicon.svg` or `favicon.ico`.
- **Why it matters:** Most modern browsers are fine, but older crawlers, bookmark tools, and some link preview systems still probe `/favicon.ico`.
- **Fix:** Add `favicon.svg` and `favicon.ico`, link the SVG in the head, and leave the PNG icons for PWA/mobile surfaces.
- **Verification:** `curl -I https://pattaya-gym.com/favicon.ico` and `/favicon.svg` should return 200.

## 16. Core Web Vitals 2026 — LCP / INP / CLS

**What I checked:** I identified likely LCP elements on homepage, a venue page, and compare. I checked reserved image dimensions, marquee/fixed UI, inline data size, layout-shift risk, and long-task risk from client-side scripts.

**Findings:**

### F16.1 — P2 — `/compare/` embeds a 97.5 KB venue JSON payload into the document
- **File(s):** `scripts/build-compare-page.js` (lines 54, 173, 332), `compare/index.html` (embedded JSON block)
- **Issue:** The compare page ships all 158 venue summaries inline before the app runs. The generated log reports 97.5 KB of embedded data.
- **Why it matters:** It is not catastrophic, but it increases HTML parse cost and first-load bytes for every compare visit, including users who only use a preset or bounce.
- **Fix:** Move the summary to `/compare/venues.json` or a hashed asset and lazy-load it after first paint; keep a tiny noscript/static fallback in HTML.
- **Verification:** `compare/index.html` should shrink materially and Network should show the JSON fetched after the document starts rendering.

### F16.2 — P3 — Smooth scroll is forced in JS even for reduced-motion users
- **File(s):** `build-v2.js` (line 459), `index.html` (line 603), `scripts/build-compare-page.js` (line 306), `styles.css` (lines 1215-1225)
- **Issue:** CSS honors `prefers-reduced-motion`, but the back-to-top script always calls `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- **Why it matters:** Users who request reduced motion still get animated scroll from a common control.
- **Fix:** Check `matchMedia('(prefers-reduced-motion: reduce)').matches` and use `behavior: 'auto'` when true.
- **Verification:** Enable reduced motion in the OS/browser and click Back to top; the page should jump without animated scroll.

## 17. Mobile UX — every breakpoint

**What I checked:** I checked viewport meta, body font size, touch-control sizing, fixed controls, safe-area usage, 320px risk, and mobile viewport-unit behavior in CSS and templates.

**Findings:**

### F17.1 — P3 — The fixed back-to-top button ignores iOS safe-area insets
- **File(s):** `styles.css` (lines 1148-1151)
- **Issue:** `.back-to-top` is fixed at `bottom: 18px` with no `env(safe-area-inset-bottom)` compensation.
- **Why it matters:** On notched phones or Safari with bottom UI, the control can sit too close to the unsafe area.
- **Fix:** Use `bottom: calc(18px + env(safe-area-inset-bottom));`.
- **Verification:** Test on an iPhone safe-area viewport; the button should clear the bottom system area.

### F17.2 — P3 — Base mobile height still relies on legacy `100vh`
- **File(s):** `styles.css` (line 77)
- **Issue:** Same root cause as F10.2: `min-height: 100vh` lacks a `100dvh` override.
- **Why it matters:** It can create subtle mobile viewport jumps when browser chrome collapses or expands.
- **Fix:** Add `min-height: 100dvh` after the existing declaration.
- **Verification:** Use Chrome/Safari mobile emulation and scroll; no bottom crop or sudden height jump should appear.

## 18. Desktop UX — large viewports

**What I checked:** I checked max-width constraints, prose line lengths, grid behavior at wide widths, sticky/fixed controls, and whether header/footer content obscures main content.

**Findings:**

No findings. Prose and grid containers are constrained, the fixed controls do not cover primary desktop content, and sampled 1920px layouts remain readable.

## 19. Security headers — `_headers` file

**What I checked:** I read `_headers` and checked CSP, HSTS, Permissions-Policy, Referrer-Policy, content sniffing, frame blocking, COOP/CORP, cache rules, and CSP hash coverage against every inline script in 258 HTML files. The script hashes are currently complete: 12 non-JSON inline script hashes in HTML and 12 matching hashes in `_headers`.

**Findings:**

### F19.1 — P2 — CSP still requires `style-src 'unsafe-inline'`
- **File(s):** `_headers` (line 10), `build-v2.js` (examples: lines 744, 1069, 1459), `scripts/build-compare-page.js` (lines 147-148, 239-250)
- **Issue:** The CSP has a strong script hash list, but styles are wide open because of the inline-style volume described in F10.1.
- **Why it matters:** Inline styles are a weaker injection boundary and make CSP less meaningful than it looks in a header-only review.
- **Fix:** Move inline styles into CSS classes, then change `style-src` to `'self' https://fonts.googleapis.com` plus any deliberate hashes/nonces.
- **Verification:** Remove `'unsafe-inline'` locally and load representative pages with DevTools Console open; no CSP style violations should appear.

### F19.2 — P2 — Permissions-Policy does not lock down Topics API
- **File(s):** `_headers` (line 7)
- **Issue:** The header disables `interest-cohort=()` but not `browsing-topics=()`.
- **Why it matters:** FLoC is obsolete; Topics is the current privacy surface to explicitly deny when no ad tech is needed.
- **Fix:** Add `browsing-topics=()` to `Permissions-Policy`.
- **Verification:** Fetch headers and confirm `Permissions-Policy` contains both `interest-cohort=()` and `browsing-topics=()`.

## 20. Privacy & legal

**What I checked:** I searched for privacy, cookie, GDPR, PDPA, analytics, localStorage, and AI-crawler disclosures. I verified that GA is loaded on hand and generated pages, recently-viewed uses localStorage on venue pages, and robots explicitly allows AI/LLM crawlers.

**Findings:**

### F20.1 — P1 — Google Analytics and localStorage are live, but there is no privacy policy route
- **File(s):** `build-v2.js` (lines 387-388, 767-774, 2003), `index.html` (lines 87-88), `robots.txt` (lines 23-76), missing `privacy/index.html`
- **Issue:** The site loads Google Analytics, writes recently-viewed venue data to `localStorage`, and explicitly allows AI crawlers for training/retrieval, but `privacy/`, `cookies/`, `terms/`, and `legal/` paths do not exist.
- **Why it matters:** This is legal/trust risk for EU, UK, Thai, and privacy-conscious readers. It also conflicts with the site's accountability positioning.
- **Fix:** Add `/privacy/` covering GA cookies, localStorage keys and retention, contact details, PDPA/GDPR rights language, and AI crawler policy; link it from the footer.
- **Verification:** `Test-Path privacy/index.html` should return true, footer links should include Privacy, and the page should mention Google Analytics, localStorage, GDPR, and PDPA.

### F20.2 — P2 — The analytics disclosure overstates the privacy posture
- **File(s):** `build-v2.js` (line 2003), `_headers` (line 10), `index.html` (lines 87-88)
- **Issue:** The status page copy says `Google Analytics — privacy-respecting, no cross-site tracking`, but the GA bootstrap uses default `gtag('config','G-F5F6KD3XFZ')` and there is no visible consent or policy context.
- **Why it matters:** Even if GA4 IP handling is better than old Universal Analytics, the current copy is stronger than the implementation proves.
- **Fix:** Replace the claim with a precise statement: `Google Analytics is used for aggregate traffic measurement; see Privacy for cookie/localStorage details`, or add consent/anonymization controls and document them.
- **Verification:** Search generated pages for `privacy-respecting, no cross-site tracking`; it should be gone or backed by a privacy page and config.

## 21. Authenticity & E-E-A-T

**What I checked:** I cross-checked count claims, category counts, verified dates, no-paid-placement language, seven-day update claims, phone/coordinate plausibility, obvious LLM phrasing, Editor's Pick presentation, and Tim Paemi Person JSON-LD links.

**Findings:**

### F21.1 — P1 — "Updated weekly" is contradicted by every venue verified date
- **File(s):** `index.html` (lines 142, 164, 170, 256-258), `build-v2.js` (lines 536-537, 1019, 1069, 1459, 1796, 2034), `data.js` (158 `verified` fields)
- **Issue:** On 2026-05-18, all 158 venues have `verified` dates older than 7 days; the oldest are 21 days old. The homepage and generated pages repeatedly claim hand-checked weekly or updated weekly.
- **Why it matters:** A competitor only needs one screenshot of `Updated weekly` next to a three-week-old verified date to challenge the core trust promise.
- **Fix:** Change the claim to the actual SLA, such as `verified on a rolling schedule`, or implement weekly verification and update the source dates.
- **Verification:** Run a script comparing `new Date()` to every `g.verified`; no venue should exceed 7 days if the copy says weekly.

### F21.2 — P2 — The seven-day closure/update promise is not enforced by tooling
- **File(s):** `about/index.html` (lines 81, 94), `methodology/index.html` (line 101), `build-v2.js` (lines 744, 752, 1807, 1820, 1895, 1965), `scripts/stale-venues.js` (tool exists but reports 30-day stale windows)
- **Issue:** The site promises that reported errors or closures are re-checked/updated within 7 days, but the stale tooling and verified-date state do not enforce that SLA.
- **Why it matters:** Operational promises are content, not decoration. If Tim cannot prove the SLA, the copy creates avoidable trust and legal exposure.
- **Fix:** Add a 7-day follow-up queue/status field for reports, or soften the public copy to `we prioritize re-checks and publish updates after confirmation`.
- **Verification:** There should be an auditable source file or script output showing open reports and due dates inside the promised seven-day window.

## 22. Content quality & duplicate content

**What I checked:** I sampled 20 venue pages for word count and boilerplate, checked guide word counts/read times, scanned category/area templates for duplicate risk, and compared distinct URLs for materially identical generated content. Venue pages are generally not thin; the main content issue is guide metadata accuracy.

**Findings:**

### F22.1 — P2 — Several guide reading-time labels undercount the visible article length
- **File(s):** `guides/24-hour-gyms-pattaya/index.html` (line 77), `guides/best-muay-thai-pattaya/index.html` (line 76), `guides/pattaya-russian-speaking-sport/index.html` (line 77), plus two other guide pages from the scan
- **Issue:** Visible guide reading times are static or computed from a different word scope. Examples: `24-hour-gyms-pattaya` shows 4 min for about 1,036 visible words, `best-muay-thai-pattaya` shows 5 min for about 1,242 words, and `pattaya-russian-speaking-sport` shows 3 min for about 726 words.
- **Why it matters:** Small, but it is another trust-detail mismatch on editorial content that claims hand-checked precision.
- **Fix:** Generate reading time from the final article body at a documented WPM, excluding nav/footer/schema.
- **Verification:** Recompute visible article-body words / 225 WPM and compare against the rendered byline for all `guides/*/index.html`.

## 23. Build system & operations

**What I checked:** I read every `scripts/*.js`, the push scripts, `package.json`, generator write paths, verification gates, rollback commands, and build ordering. I ran `node scripts/verify.js`, `node scripts/verify-deploy.js`, `node validate.js`, and direct HTML validation.

**Findings:**

### F23.1 — P1 — The deploy verifier passes while source corruption and invalid HTML remain
- **File(s):** `scripts/verify-deploy.js` (lines 9, 37-64, 84-111), `push-output.txt` (contains NUL bytes), `build-v2.js` (invalid HTML source in `mdToHtml`)
- **Issue:** `verify-deploy.js` checks NUL bytes only in generated HTML and `styles.css`; it does not scan source text files like `push-output.txt`, and it does not run `html-validate`. In this tree, `verify-deploy.js` passes while `scripts/verify.js` fails on `push-output.txt` NUL bytes and direct `html-validate` finds 210 HTML problems.
- **Why it matters:** The final gate gives a false green light after exactly the kinds of regressions Round 16 was meant to prevent.
- **Fix:** Make `verify-deploy.js` scan all text source files for NUL/BOM/UTF-16 garbage, run the fixed HTML validator, and fail on sitemap URLs without local files.
- **Verification:** `node scripts/verify-deploy.js` should fail on the current tree until `push-output.txt`, HTML validation, and missing guide URLs are fixed.

### F23.2 — P2 — Round 16 release flow omits the script needed for three sitemap guides
- **File(s):** `PUSH_ROUND16.cmd` (lines 42-69), `scripts/write-new-guides.js` (lines 8-14, 140-145, 242, 339, 474-475), `build-v2.js` (lines 2073-2075)
- **Issue:** `PUSH_ROUND16.cmd` runs `build-v2.js`, compare, changelog, CSP sync, and verify, but never runs `scripts/write-new-guides.js`, the script that creates the three missing guide pages listed in the sitemap.
- **Why it matters:** The build pipeline can regenerate a sitemap that points at files the pipeline never creates.
- **Fix:** Add `node scripts\write-new-guides.js` before sitemap verification, or fold those guides into `build-v2.js` so one generator owns them.
- **Verification:** Delete the three guide folders, run the push build sequence locally, and confirm they are recreated before verification.

### F23.3 — P2 — Rollback tag publishing is force-updated
- **File(s):** `PUSH_ROUND16.cmd` (lines 82-84, 99)
- **Issue:** The script runs `git tag -f main-pre-round16 origin/main` and then `git push origin main-pre-round16 --force`.
- **Why it matters:** Rerunning the script can overwrite the remote rollback anchor. The final rollback command then depends on a mutable tag.
- **Fix:** Use immutable round-specific tags (`main-pre-round16-<timestamp>`), refuse to overwrite existing rollback tags, and print the exact immutable ref in rollback instructions.
- **Verification:** Re-running the push script should fail if the rollback tag already exists instead of moving it.

### F23.4 — P2 — Builds are intentionally non-idempotent because they stamp current time into output
- **File(s):** `build-v2.js` (lines 24-25, 510, 2124-2187)
- **Issue:** `TODAY` and `BUILD_TIMESTAMP` are derived from `new Date()` every run and embedded in output, so two builds from the same source can differ.
- **Why it matters:** Non-idempotent output makes forensic diffs noisy and hides real content changes in timestamp churn.
- **Fix:** Accept `BUILD_DATE`/`BUILD_TIMESTAMP` from the environment, default only in local dev, and document it in the push script.
- **Verification:** Run the build twice with the same `BUILD_TIMESTAMP`; `git diff` should be empty after the second run.

## 24. Cross-browser / cross-device

**What I checked:** I searched for `position: sticky`, `backdrop-filter`, `scroll-behavior`, `aspect-ratio`, `:has()`, view transitions, CSS nesting, `@layer`, flex gap, `text-wrap`, `content-visibility`, and ES2022+ syntax in shipped browser code. I checked Safari-specific fallbacks where the features appear.

**Findings:**

No findings beyond the reduced-motion smooth-scroll issue in F16.2. `backdrop-filter` has `-webkit-backdrop-filter` plus an rgba fallback, I found no `:has()`, CSS nesting, view transitions, `content-visibility`, or top-level-await browser code, and the shipped JavaScript stays within broadly supported syntax for the site's browser target.

## 25. The hardest dimension: "what would a competitor screenshot and laugh at"

**What I checked:** I read the site as a rival local directory operator looking for a screenshot that makes the brand look less independent, less local, or less careful than it claims. I prioritized issues visible to a non-engineer: broken promises, junk URLs, missing pages, overly dramatic copy, and network cross-promotion.

**Findings:**

### F25.1 — P2 — The strongest mockable screenshot is "Updated weekly" beside three-week-old verification dates
- **File(s):** `index.html` (lines 142, 164, 256-258), generated venue pages from `data.js` verified dates, `build-v2.js` (lines 536-537, 744, 752, 1019, 1069)
- **Issue:** The homepage, marquee, category pages, and footer repeat weekly freshness claims, while every venue currently has a verified date 19-21 days before 2026-05-18.
- **Why it matters:** This is easy to screenshot, easy to explain, and goes directly at the site's main differentiator: independent, hand-checked accuracy.
- **Fix:** Either make weekly verification true in data and process, or change the public promise to match the actual rolling verification cadence.
- **Verification:** Randomly open 10 venue pages and compare the visible verified date to today's date; none should contradict the freshness copy around it.

## Appendix A — files I read in full

These are the non-generated text/source files covered by full-file scans and targeted manual review for high-risk code paths.

- $(.github\PULL_REQUEST_TEMPLATE.md.Replace('\','/')) (23 lines)
- $(.github\workflows\build.yml.Replace('\','/')) (59 lines)
- $(.htmlvalidate.json.Replace('\','/')) (20 lines)
- $(.lighthouserc.json.Replace('\','/')) (48 lines)
- $(.well-known\ai-plugin.json.Replace('\','/')) (17 lines)
- $(.well-known\security.txt.Replace('\','/')) (18 lines)
- $(.wrangler\cache\wrangler-account.json.Replace('\','/')) (6 lines)
- $(_headers.Replace('\','/')) (71 lines)
- $(_redirects.Replace('\','/')) (25 lines)
- $(30.Replace('\','/')) (1 lines)
- $(404.html.Replace('\','/')) (187 lines)
- $(about\index.html.Replace('\','/')) (235 lines)
- $(add-your-gym\index.html.Replace('\','/')) (246 lines)
- $(af-academy-pattaya.Replace('\','/')) (0 lines)
- $(analytics.js.Replace('\','/')) (6 lines)
- $(api\areas.json.Replace('\','/')) (1016 lines)
- $(api\categories.json.Replace('\','/')) (1235 lines)
- $(api\sitemap.json.Replace('\','/')) (1 lines)
- $(api\venues.json.Replace('\','/')) (1 lines)
- $(app.bundle.js.Replace('\','/')) (788 lines)
- $(app.js.Replace('\','/')) (279 lines)
- $(AUDIT_CLAUDE.md.Replace('\','/')) (372 lines)
- $(AUDIT_CODEX_2026-05-10.md.Replace('\','/')) (271 lines)
- $(AUDIT_NUCLEAR_V3.md.Replace('\','/')) (597 lines)
- $(AUDIT_REPORT.md.Replace('\','/')) (303 lines)
- $(AUDIT_REPORT_LIVE.md.Replace('\','/')) (406 lines)
- $(AUDIT_REPORT_NUCLEAR.md.Replace('\','/')) (605 lines)
- $(build.js.Replace('\','/')) (1793 lines)
- $(build-discovery.js.Replace('\','/')) (2577 lines)
- $(build-extras.js.Replace('\','/')) (1485 lines)
- $(build-v2.js.Replace('\','/')) (2201 lines)
- $(bump-and-push.js.Replace('\','/')) (71 lines)
- $(changelog\index.html.Replace('\','/')) (359 lines)
- $(CODEX_AUDIT_PROMPT.md.Replace('\','/')) (310 lines)
- $(CODEX_EXECUTE_PROMPT.md.Replace('\','/')) (209 lines)
- $(CODEX_EXECUTE_REPORT.md.Replace('\','/')) (105 lines)
- $(CODEX_HARD_REVERT_PROMPT.md.Replace('\','/')) (177 lines)
- $(CODEX_HARD_REVERT_REPORT.md.Replace('\','/')) (52 lines)
- $(CODEX_HARD_REVERT_UNBLOCK.md.Replace('\','/')) (57 lines)
- $(CODEX_NUCLEAR_AUDIT.md.Replace('\','/')) (306 lines)
- $(CODEX_NUCLEAR_AUDIT_2026_ROUND17.md.Replace('\','/')) (177 lines)
- $(CODEX_NUCLEAR_AUDIT_LIVE.md.Replace('\','/')) (346 lines)
- $(CODEX_NUCLEAR_AUDIT_V2.md.Replace('\','/')) (472 lines)
- $(CODEX_NUCLEAR_AUDIT_V3.md.Replace('\','/')) (556 lines)
- $(CODEX_NUCLEAR_PROMPT.md.Replace('\','/')) (544 lines)
- $(CODEX_SPEED_PASS_PROMPT.md.Replace('\','/')) (188 lines)
- $(CODEX_STRIP_BOM_AND_FINISH.md.Replace('\','/')) (62 lines)
- $(colophon\index.html.Replace('\','/')) (215 lines)
- $(compare.js.Replace('\','/')) (167 lines)
- $(compare\index.html.Replace('\','/')) (256 lines)
- $(contact\index.html.Replace('\','/')) (235 lines)
- $(CONTENT_AUDIT.md.Replace('\','/')) (174 lines)
- $(CONTENT_AUDIT_2026-04-29.md.Replace('\','/')) (220 lines)
- $(CONTRIBUTING.md.Replace('\','/')) (102 lines)
- $(data.js.Replace('\','/')) (238 lines)
- $(data\reviews.json.Replace('\','/')) (5 lines)
- $(data\venue-geo.json.Replace('\','/')) (882 lines)
- $(DESIGN_RULES.md.Replace('\','/')) (136 lines)
- $(DISCOVERED-VENUES.md.Replace('\','/')) (289 lines)
- $(EDITORIAL_STYLE_GUIDE.md.Replace('\','/')) (161 lines)
- $(favorites.js.Replace('\','/')) (183 lines)
- $(favorites\index.html.Replace('\','/')) (168 lines)
- $(feed.json.Replace('\','/')) (1 lines)
- $(feed.xml.Replace('\','/')) (251 lines)
- $(feed\adventure.xml.Replace('\','/')) (107 lines)
- $(feed\area\central-pattaya.xml.Replace('\','/')) (221 lines)
- $(feed\area\east-pattaya.xml.Replace('\','/')) (165 lines)
- $(feed\area\jomtien.xml.Replace('\','/')) (221 lines)
- $(feed\area\naklua.xml.Replace('\','/')) (109 lines)
- $(feed\area\pratamnak.xml.Replace('\','/')) (102 lines)
- $(feed\area\sattahip.xml.Replace('\','/')) (116 lines)
- $(feed\bjj.xml.Replace('\','/')) (19 lines)
- $(feed\climbing.xml.Replace('\','/')) (27 lines)
- $(feed\clubs.xml.Replace('\','/')) (195 lines)
- $(feed\crossfit.xml.Replace('\','/')) (19 lines)
- $(feed\equestrian.xml.Replace('\','/')) (27 lines)
- $(feed\fitness.xml.Replace('\','/')) (211 lines)
- $(feed\golf.xml.Replace('\','/')) (147 lines)
- $(feed\kids-youth.xml.Replace('\','/')) (83 lines)
- $(feed\mma.xml.Replace('\','/')) (19 lines)
- $(feed\muay-thai.xml.Replace('\','/')) (163 lines)
- $(feed\racquet.xml.Replace('\','/')) (99 lines)
- $(feed\swimming.xml.Replace('\','/')) (83 lines)
- $(feed\watersports.xml.Replace('\','/')) (171 lines)
- $(feed\yoga.xml.Replace('\','/')) (59 lines)
- $(find-my-coach\index.html.Replace('\','/')) (168 lines)
- $(FIX_AND_PUSH_CENTERING.cmd.Replace('\','/')) (70 lines)
- $(GEOCODE_VENUES.cmd.Replace('\','/')) (33 lines)
- $(git.Replace('\','/')) (0 lines)
- $(GO_LIVE.cmd.Replace('\','/')) (121 lines)
- $(guides\24-hour-gyms-pattaya\index.html.Replace('\','/')) (333 lines)
- $(guides\bangkok-day-trip-sport-pattaya\index.html.Replace('\','/')) (283 lines)
- $(guides\best-dive-operators-pattaya\index.html.Replace('\','/')) (363 lines)
- $(guides\best-for-beginners-pattaya\index.html.Replace('\','/')) (359 lines)
- $(guides\best-golf-courses-pattaya\index.html.Replace('\','/')) (430 lines)
- $(guides\best-gyms-near-walking-street-pattaya\index.html.Replace('\','/')) (391 lines)
- $(guides\best-muay-thai-pattaya\index.html.Replace('\','/')) (392 lines)
- $(guides\cheapest-gyms-pattaya\index.html.Replace('\','/')) (337 lines)
- $(guides\family-friendly-pattaya\index.html.Replace('\','/')) (363 lines)
- $(guides\female-friendly-gyms-pattaya\index.html.Replace('\','/')) (410 lines)
- $(guides\index.html.Replace('\','/')) (245 lines)
- $(guides\luxury-sports-clubs-pattaya\index.html.Replace('\','/')) (350 lines)
- $(guides\pattaya-digital-nomad-fitness\index.html.Replace('\','/')) (410 lines)
- $(guides\pattaya-gyms-childcare-family-pools\index.html.Replace('\','/')) (402 lines)
- $(guides\pattaya-russian-speaking-sport\index.html.Replace('\','/')) (255 lines)
- $(guides\pattaya-seniors-low-impact-sport\index.html.Replace('\','/')) (415 lines)
- $(guides\pattaya-solo-female-fitness\index.html.Replace('\','/')) (404 lines)
- $(guides\thai-gym-terms-pattaya\index.html.Replace('\','/')) (382 lines)
- $(HARD_REVERT_PLAYBOOK.md.Replace('\','/')) (104 lines)
- $(humans.txt.Replace('\','/')) (59 lines)
- $(index.html.Replace('\','/')) (625 lines)
- $(kids-youth.Replace('\','/')) (0 lines)
- $(kids-youth).Replace('\','/')) (0 lines)
- $(llms.txt.Replace('\','/')) (91 lines)
- $(main.Replace('\','/')) (1 lines)
- $(manifest.json.Replace('\','/')) (20 lines)
- $(map\index.html.Replace('\','/')) (168 lines)
- $(methodology\index.html.Replace('\','/')) (214 lines)
- $(NEXT_STEPS.md.Replace('\','/')) (235 lines)
- $(openapi.yaml.Replace('\','/')) (79 lines)
- $(package.json.Replace('\','/')) (25 lines)
- $(package-lock.json.Replace('\','/')) (4919 lines)
- $(pattaya-sport-stats\index.html.Replace('\','/')) (382 lines)
- $(plan-my-trip\index.html.Replace('\','/')) (168 lines)
- $(press\index.html.Replace('\','/')) (235 lines)
- $(PUSH_AUDIT_FIXES.cmd.Replace('\','/')) (91 lines)
- $(PUSH_GEO.cmd.Replace('\','/')) (75 lines)
- $(PUSH_HOTFIX.cmd.Replace('\','/')) (87 lines)
- $(PUSH_HOTFIX_V2.cmd.Replace('\','/')) (83 lines)
- $(PUSH_ROUND10.cmd.Replace('\','/')) (114 lines)
- $(PUSH_ROUND11.cmd.Replace('\','/')) (104 lines)
- $(PUSH_ROUND12.cmd.Replace('\','/')) (120 lines)
- $(PUSH_ROUND13.cmd.Replace('\','/')) (116 lines)
- $(PUSH_ROUND14.cmd.Replace('\','/')) (113 lines)
- $(PUSH_ROUND15.cmd.Replace('\','/')) (90 lines)
- $(PUSH_ROUND16.cmd.Replace('\','/')) (100 lines)
- $(PUSH_ROUND3.cmd.Replace('\','/')) (124 lines)
- $(PUSH_ROUND4.cmd.Replace('\','/')) (89 lines)
- $(PUSH_ROUND4_SEARCH.cmd.Replace('\','/')) (75 lines)
- $(PUSH_ROUND5.cmd.Replace('\','/')) (97 lines)
- $(PUSH_ROUND6.cmd.Replace('\','/')) (107 lines)
- $(PUSH_ROUND7.cmd.Replace('\','/')) (117 lines)
- $(PUSH_ROUND8.cmd.Replace('\','/')) (119 lines)
- $(PUSH_ROUND9.cmd.Replace('\','/')) (111 lines)
- $(PUSH_V2_HOMEPAGE.cmd.Replace('\','/')) (63 lines)
- $(PUSH_V2_SUBPAGES.cmd.Replace('\','/')) (53 lines)
- $(READABILITY_WORK_LOG.md.Replace('\','/')) (756 lines)
- $(README.md.Replace('\','/')) (139 lines)
- $(REBUILD_FULL.cmd.Replace('\','/')) (114 lines)
- $(REBUILD_HEADER_FIX.cmd.Replace('\','/')) (53 lines)
- $(REBUILD_STEP1_HOMEPAGE.cmd.Replace('\','/')) (77 lines)
- $(recent.js.Replace('\','/')) (107 lines)
- $(RESEARCH-ROADMAP.md.Replace('\','/')) (151 lines)
- $(robots.txt.Replace('\','/')) (84 lines)
- $(SCHEMA_REFERENCE.md.Replace('\','/')) (125 lines)
- $(scripts\build-compare-page.js.Replace('\','/')) (332 lines)
- $(scripts\bump-legacy-assets.js.Replace('\','/')) (62 lines)
- $(scripts\content-audit.js.Replace('\','/')) (257 lines)
- $(scripts\generate-og-images.ps1.Replace('\','/')) (113 lines)
- $(scripts\geocode-venues.js.Replace('\','/')) (160 lines)
- $(scripts\inject-guide-schema.js.Replace('\','/')) (191 lines)
- $(scripts\ping-sitemap.js.Replace('\','/')) (38 lines)
- $(scripts\rebuild-tool-stubs.js.Replace('\','/')) (317 lines)
- $(scripts\repo-cleanup.js.Replace('\','/')) (91 lines)
- $(scripts\stale-venues.js.Replace('\','/')) (61 lines)
- $(scripts\sync-csp-hashes.js.Replace('\','/')) (100 lines)
- $(scripts\verify.js.Replace('\','/')) (203 lines)
- $(scripts\verify-deploy.js.Replace('\','/')) (129 lines)
- $(scripts\write-changelog.js.Replace('\','/')) (391 lines)
- $(scripts\write-new-guides.js.Replace('\','/')) (481 lines)
- $(scripts\write-status-json.js.Replace('\','/')) (156 lines)
- $(search\index.html.Replace('\','/')) (166 lines)
- $(search-page.js.Replace('\','/')) (240 lines)
- $(SEO_IGNITION_KIT.md.Replace('\','/')) (398 lines)
- $(share.js.Replace('\','/')) (43 lines)
- $(shortcuts.js.Replace('\','/')) (120 lines)
- $(sitemap.xml.Replace('\','/')) (263 lines)
- $(sitemap-areas.xml.Replace('\','/')) (9 lines)
- $(sitemap-categories.xml.Replace('\','/')) (18 lines)
- $(sitemap-core.xml.Replace('\','/')) (16 lines)
- $(sitemap-guides.xml.Replace('\','/')) (21 lines)
- $(sitemap-index.xml.Replace('\','/')) (9 lines)
- $(sitemap-venues.xml.Replace('\','/')) (161 lines)
- $(site-ui.js.Replace('\','/')) (113 lines)
- $(status.json.Replace('\','/')) (66 lines)
- $(styles.css.Replace('\','/')) (1847 lines)
- $(validate.js.Replace('\','/')) (191 lines)
- $(Venue.Replace('\','/')) (0 lines)
- $(venue.css.Replace('\','/')) (68 lines)
- $(venues\adventure-divers-pattaya.md.Replace('\','/')) (235 lines)
- $(venues\af-academy-football.md.Replace('\','/')) (180 lines)
- $(venues\af-academy-pattaya.md.Replace('\','/')) (232 lines)
- $(venues\alfa-bjj-pattaya.md.Replace('\','/')) (129 lines)
- $(venues\andaz-pattaya-jomtien.md.Replace('\','/')) (280 lines)
- $(venues\anytime-fitness-pattaya.md.Replace('\','/')) (138 lines)
- $(venues\aquanauts-dive-center.md.Replace('\','/')) (204 lines)
- $(venues\ashtanga-yoga-pattaya.md.Replace('\','/')) (235 lines)
- $(venues\atv-tours-pattaya.md.Replace('\','/')) (229 lines)
- $(venues\balance-yoga-studio-pattaya.md.Replace('\','/')) (233 lines)
- $(venues\bangkok-hospital-pattaya-rehab.md.Replace('\','/')) (149 lines)
- $(venues\bangpra-international.md.Replace('\','/')) (213 lines)
- $(venues\battle-conquer-gym.md.Replace('\','/')) (275 lines)
- $(venues\bean-cow-climbing-gym.md.Replace('\','/')) (195 lines)
- $(venues\big-buddha-hill-wat-phra-yai.md.Replace('\','/')) (167 lines)
- $(venues\bira-circuit.md.Replace('\','/')) (289 lines)
- $(venues\bounce-pattaya.md.Replace('\','/')) (154 lines)
- $(venues\burapha-golf-club.md.Replace('\','/')) (429 lines)
- $(venues\cape-dara-resort.md.Replace('\','/')) (235 lines)
- $(venues\cartoon-network-amazone.md.Replace('\','/')) (246 lines)
- $(venues\castra-gym.md.Replace('\','/')) (242 lines)
- $(venues\centara-grand-mirage.md.Replace('\','/')) (279 lines)
- $(venues\chatrium-golf-soi-dao.md.Replace('\','/')) (267 lines)
- $(venues\chee-chan-golf.md.Replace('\','/')) (253 lines)
- $(venues\cho-nateetong.md.Replace('\','/')) (185 lines)
- $(venues\clubloongchat-watersports.md.Replace('\','/')) (236 lines)
- $(venues\coco-fitness.md.Replace('\','/')) (169 lines)
- $(venues\crossfit-pattaya.md.Replace('\','/')) (206 lines)
- $(venues\cross-pattaya-pratamnak.md.Replace('\','/')) (234 lines)
- $(venues\deep-climbing-gym.md.Replace('\','/')) (213 lines)
- $(venues\diamond-badminton.md.Replace('\','/')) (174 lines)
- $(venues\diana-driving-range.md.Replace('\','/')) (235 lines)
- $(venues\dive-station-pattaya.md.Replace('\','/')) (198 lines)
- $(venues\dragon-shooting-club.md.Replace('\','/')) (180 lines)
- $(venues\dusit-thani-pattaya.md.Replace('\','/')) (157 lines)
- $(venues\easykart-pattaya.md.Replace('\','/')) (238 lines)
- $(venues\elite-gym-fitness.md.Replace('\','/')) (242 lines)
- $(venues\euro-badminton.md.Replace('\','/')) (181 lines)
- $(venues\fairtex-pattaya.md.Replace('\','/')) (451 lines)
- $(venues\fast-pro-football-academy.md.Replace('\','/')) (236 lines)
- $(venues\fight-evo360.md.Replace('\','/')) (243 lines)
- $(venues\first-serve-sports-club.md.Replace('\','/')) (221 lines)
- $(venues\fitness-7.md.Replace('\','/')) (221 lines)
- $(venues\fitz-club.md.Replace('\','/')) (304 lines)
- $(venues\flight-of-the-gibbon.md.Replace('\','/')) (280 lines)
- $(venues\golf-hub-pattaya.md.Replace('\','/')) (254 lines)
- $(venues\greenwood-golf-club.md.Replace('\','/')) (226 lines)
- $(venues\greta-sport-club.md.Replace('\','/')) (255 lines)
- $(venues\hard-rock-pool.md.Replace('\','/')) (260 lines)
- $(venues\hilton-pattaya-fitness.md.Replace('\','/')) (239 lines)
- $(venues\holiday-inn-pattaya.md.Replace('\','/')) (152 lines)
- $(venues\horseshoe-point-resort.md.Replace('\','/')) (239 lines)
- $(venues\intercontinental-pattaya.md.Replace('\','/')) (157 lines)
- $(venues\jetts-fitness-pattaya.md.Replace('\','/')) (235 lines)
- $(venues\jomtien-beach-volleyball.md.Replace('\','/')) (223 lines)
- $(venues\jomtien-dive-center.md.Replace('\','/')) (178 lines)
- $(venues\jumpz-trampoline-park.md.Replace('\','/')) (217 lines)
- $(venues\kba-kiteboarding-pattaya.md.Replace('\','/')) (256 lines)
- $(venues\khao-chi-chan-buddha-mountain.md.Replace('\','/')) (240 lines)
- $(venues\khao-kheow-country-club.md.Replace('\','/')) (239 lines)
- $(venues\kitesurf-pattaya.md.Replace('\','/')) (234 lines)
- $(venues\koh-larn-coral-island.md.Replace('\','/')) (172 lines)
- $(venues\kombat-group-thailand.md.Replace('\','/')) (363 lines)
- $(venues\laem-chabang-international.md.Replace('\','/')) (223 lines)
- $(venues\lumpinee-boxing-stadium.md.Replace('\','/')) (151 lines)
- $(venues\manhattan-pattaya-fitness.md.Replace('\','/')) (221 lines)
- $(venues\manta-kids-pattaya.md.Replace('\','/')) (249 lines)
- $(venues\max-muay-thai-stadium.md.Replace('\','/')) (251 lines)
- $(venues\megabreak-pool-hall.md.Replace('\','/')) (133 lines)
- $(venues\mermaids-dive.md.Replace('\','/')) (171 lines)
- $(venues\mountain-shadow-country-club.md.Replace('\','/')) (217 lines)
- $(venues\movenpick-siam-pattaya.md.Replace('\','/')) (237 lines)
- $(venues\muscle-factory-pattaya.md.Replace('\','/')) (249 lines)
- $(venues\nok-yoga-pattaya.md.Replace('\','/')) (212 lines)
- $(venues\no-limit-divers.md.Replace('\','/')) (258 lines)
- $(venues\nongnooch-cultural-show.md.Replace('\','/')) (207 lines)
- $(venues\ocean-marina-jomtien.md.Replace('\','/')) (160 lines)
- $(venues\one-d-yoga-studio.md.Replace('\','/')) (251 lines)
- $(venues\pattana-sports-resort.md.Replace('\','/')) (246 lines)
- $(venues\pattaya-archery-club.md.Replace('\','/')) (229 lines)
- $(venues\pattaya-beach-public-aerobics.md.Replace('\','/')) (183 lines)
- $(venues\pattaya-bike-boat-tours.md.Replace('\','/')) (130 lines)
- $(venues\pattaya-bowl.md.Replace('\','/')) (185 lines)
- $(venues\pattaya-boxing-world.md.Replace('\','/')) (227 lines)
- $(venues\pattaya-city-football-academy.md.Replace('\','/')) (189 lines)
- $(venues\pattaya-country-club.md.Replace('\','/')) (198 lines)
- $(venues\pattaya-cricket-club.md.Replace('\','/')) (253 lines)
- $(venues\pattaya-cycling-clubs.md.Replace('\','/')) (253 lines)
- $(venues\pattaya-dive-centre.md.Replace('\','/')) (199 lines)
- $(venues\pattaya-floating-market.md.Replace('\','/')) (119 lines)
- $(venues\pattaya-golf-driving-range.md.Replace('\','/')) (195 lines)
- $(venues\pattaya-hash-house.md.Replace('\','/')) (225 lines)
- $(venues\pattaya-kart-speedway.md.Replace('\','/')) (205 lines)
- $(venues\pattaya-lawn-bowls.md.Replace('\','/')) (229 lines)
- $(venues\pattaya-marathon.md.Replace('\','/')) (254 lines)
- $(venues\pattaya-marriott-resort.md.Replace('\','/')) (179 lines)
- $(venues\pattaya-monkey-hash-house.md.Replace('\','/')) (240 lines)
- $(venues\pattaya-padel-club.md.Replace('\','/')) (180 lines)
- $(venues\pattaya-panthers-rugby.md.Replace('\','/')) (230 lines)
- $(venues\pattaya-park-water-fun.md.Replace('\','/')) (251 lines)
- $(venues\pattaya-petanque-club.md.Replace('\','/')) (183 lines)
- $(venues\pattaya-public-pool-jomtien.md.Replace('\','/')) (228 lines)
- $(venues\pattaya-public-pool-naklua.md.Replace('\','/')) (208 lines)
- $(venues\pattaya-running-routes.md.Replace('\','/')) (232 lines)
- $(venues\pattaya-scuba-adventures.md.Replace('\','/')) (237 lines)
- $(venues\pattaya-shooting-park.md.Replace('\','/')) (244 lines)
- $(venues\pattaya-sky-ride-helicopter.md.Replace('\','/')) (253 lines)
- $(venues\pattaya-sports-club.md.Replace('\','/')) (246 lines)
- $(venues\pattaya-tennis-badminton-inter-club.md.Replace('\','/')) (226 lines)
- $(venues\pattaya-tennis-club.md.Replace('\','/')) (228 lines)
- $(venues\pattaya-thai-boxing-fitness.md.Replace('\','/')) (168 lines)
- $(venues\pattaya-triathlon.md.Replace('\','/')) (242 lines)
- $(venues\petchrungruang-gym.md.Replace('\','/')) (302 lines)
- $(venues\phoenix-gold-golf.md.Replace('\','/')) (192 lines)
- $(venues\pickleball-pattaya.md.Replace('\','/')) (135 lines)
- $(venues\planet-football-pattaya.md.Replace('\','/')) (217 lines)
- $(venues\platinum-fitness.md.Replace('\','/')) (232 lines)
- $(venues\play-padel-pattaya.md.Replace('\','/')) (170 lines)
- $(venues\pratumnak-fitness-park.md.Replace('\','/')) (257 lines)
- $(venues\rage-fight-academy.md.Replace('\','/')) (182 lines)
- $(venues\rajadamnern-stadium.md.Replace('\','/')) (169 lines)
- $(venues\ramayana-water-park.md.Replace('\','/')) (276 lines)
- $(venues\rambaa-somdet-m16.md.Replace('\','/')) (212 lines)
- $(venues\real-divers-pattaya.md.Replace('\','/')) (243 lines)
- $(venues\regents-international-school-pattaya.md.Replace('\','/')) (263 lines)
- $(venues\renaissance-pattaya-resort.md.Replace('\','/')) (186 lines)
- $(venues\royal-varuna-yacht-club.md.Replace('\','/')) (159 lines)
- $(venues\rusich-club-football.md.Replace('\','/')) (178 lines)
- $(venues\sailbreeze-ocean-marina.md.Replace('\','/')) (251 lines)
- $(venues\sanctuary-of-truth.md.Replace('\','/')) (134 lines)
- $(venues\sanit-sport-club.md.Replace('\','/')) (154 lines)
- $(venues\seafari-padi-dive.md.Replace('\','/')) (186 lines)
- $(venues\sf-strike-bowl.md.Replace('\','/')) (233 lines)
- $(venues\siam-bayshore-tennis.md.Replace('\','/')) (227 lines)
- $(venues\siam-country-club.md.Replace('\','/')) (227 lines)
- $(venues\silk-muay-thai.md.Replace('\','/')) (206 lines)
- $(venues\sitpholek-muay-thai.md.Replace('\','/')) (252 lines)
- $(venues\sityodtong-pattaya.md.Replace('\','/')) (303 lines)
- $(venues\sor-klinmee.md.Replace('\','/')) (205 lines)
- $(venues\st-andrews-2000.md.Replace('\','/')) (239 lines)
- $(venues\sun-fitness-buakao.md.Replace('\','/')) (219 lines)
- $(venues\tara-tennis-club.md.Replace('\','/')) (238 lines)
- $(venues\tarzan-adventure-pattaya.md.Replace('\','/')) (238 lines)
- $(venues\thai-polo-equestrian-club.md.Replace('\','/')) (305 lines)
- $(venues\thai-sky-adventures-skydive.md.Replace('\','/')) (296 lines)
- $(venues\thai-wake-park.md.Replace('\','/')) (254 lines)
- $(venues\tonys-gym.md.Replace('\','/')) (190 lines)
- $(venues\tos-tennis.md.Replace('\','/')) (200 lines)
- $(venues\treasure-hill-golf.md.Replace('\','/')) (219 lines)
- $(venues\true-fitness-pattaya.md.Replace('\','/')) (208 lines)
- $(venues\underwater-world-pattaya.md.Replace('\','/')) (273 lines)
- $(venues\universe-gym.md.Replace('\','/')) (182 lines)
- $(venues\venum-training-camp.md.Replace('\','/')) (200 lines)
- $(venues\wave-pattaya.md.Replace('\','/')) (253 lines)
- $(venues\wko-muay-thai.md.Replace('\','/')) (286 lines)
- $(venues\wong-amat-beach.md.Replace('\','/')) (170 lines)
- $(venues\yoga-haus-pattaya.md.Replace('\','/')) (203 lines)
- $(venues\yoga-pattaya-studio.md.Replace('\','/')) (136 lines)
- $(WORK_LOG_CODEX.md.Replace('\','/')) (576 lines)

## Appendix B — files I sampled

All 258 HTML files were machine-scanned for headings, canonical/hreflang, OG/Twitter tags, images, forms, tables, inline scripts/styles, CSP hash coverage, and internal links. The following generated/HTML pages were also manually sampled for template-level defects:

- `index.html` (625 lines)
- `search/index.html` (166 lines)
- `compare/index.html` (256 lines)
- `about/index.html` (235 lines)
- `methodology/index.html` (214 lines)
- `changelog/index.html` (359 lines)
- `pattaya-sport-stats/index.html` (382 lines)
- `gyms/fairtex-pattaya/index.html` (680 lines)
- `gyms/no-limit-divers/index.html` (565 lines)
- `gyms/koh-larn-coral-island/index.html` (622 lines)
- `gyms/fitz-club/index.html` (594 lines)
- `gyms/greta-sport-club/index.html` (568 lines)
- `gyms/pattaya-beach-public-aerobics/index.html` (507 lines)
- `gyms/royal-varuna-yacht-club/index.html` (534 lines)
- `gyms/silk-muay-thai/index.html` (566 lines)
- `gyms/wong-amat-beach/index.html` (514 lines)
- `gyms/rambaa-somdet-m16/index.html` (540 lines)
- `category/muay-thai/index.html` (368 lines)
- `category/fitness/index.html` (416 lines)
- `category/golf/index.html` (352 lines)
- `area/central-pattaya/index.html` (505 lines)
- `area/jomtien/index.html` (537 lines)
- `area/east-pattaya/mma/index.html` (208 lines)
- `guides/best-muay-thai-pattaya/index.html` (392 lines)
- `guides/24-hour-gyms-pattaya/index.html` (333 lines)

## Appendix C — files I did not touch

- `.git/` — excluded repository metadata; inspected branch/head only with git commands.
- `node_modules/` — dependency tree excluded from audit scope.
- `archive*`, `*.zip`, `*.tar.gz` — archive outputs excluded by the prompt.
- Binary images/icons (`*.png`, `*.jpg`, `*.ico`, `*.webp`) — not edited; only file size and PNG dimensions were inspected where relevant.
- Generated `gyms/*/index.html`, `category/*/index.html`, and `area/*/index.html` outside Appendix B samples — not edited; covered by automated scans and representative manual samples while generator source was audited.
- `CODEX_NUCLEAR_AUDIT_2026_ROUND17.md` — pre-existing untracked prompt/report file in the repo root; not modified.
