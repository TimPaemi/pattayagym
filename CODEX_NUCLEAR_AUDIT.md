# CODEX — NUCLEAR FORENSIC AUDIT
## Site: pattaya-gym.com · Repo: C:\pattayagym
## Mode: READ-ONLY. Output a findings report. Do NOT modify any file.

You are auditing a production static site (Cloudflare Pages, GitHub auto-deploy from `main`). The site is **already public**. Embarrassment is real cost. Your output will be handed to Claude to execute fixes — so be **specific, severity-ranked, and reproducible**.

This is not a checklist exercise. **Read every byte. Inspect every file.** When you find one issue, audit ten neighbors for the same class of bug. The site has 200+ generated HTML pages plus a hand-rolled Node build chain — both must be perfect.

---

## TARGET FILES — WHAT TO INSPECT

### Tier 1 — Touch every line
- `index.html` (homepage, hand-written, ~480 lines after rebuild)
- `styles.css` (~3500 lines after rebuild)
- `build.js` (~1820 lines, generates 158 venue pages)
- `build-extras.js` (~1440 lines, generates 15 category + map + 404 + about)
- `build-discovery.js` (~2720 lines, generates 6 areas + 17 guides + tool pages)
- `data.js` (158 venue records, the single source of truth)
- `_headers` (Cloudflare Pages security/CSP headers)
- `_redirects` (if present)
- `robots.txt`
- `llms.txt` (AI agent content map)
- `sitemap.xml` + `sitemap-*.xml` shards
- `manifest.json` (PWA)
- `sw.js` (service worker)

### Tier 2 — Sample 10 random files in each, then audit the templates that produced them
- `gyms/*/index.html` (158 generated pages)
- `category/*/index.html` (15 generated pages)
- `area/*/index.html` (6 generated pages)
- `guides/*/index.html` (17 generated pages)

### Tier 3 — Standalone utility pages
- `about/index.html`, `methodology/index.html`, `press/index.html`, `contact/index.html`
- `compare/index.html`, `find-my-coach/index.html`, `plan-my-trip/index.html`
- `add-your-gym/index.html`, `search/index.html`, `map/index.html`
- `colophon/index.html`, `favorites/index.html`, `pattaya-sport-stats/index.html`
- `404.html`

### Tier 4 — Operational endpoints
- `api/venues.json`, `api/categories.json`, `api/areas.json`, `api/sitemap.json`
- `feed.json`, `feed.xml`, `feed/area/*.xml`
- `.well-known/ai-plugin.json`, `.well-known/security.txt`
- `humans.txt`, `openapi.yaml`
- `app.bundle.js`, `share.js`, `favorites.js`, `compare.js`, `recent.js`, `shortcuts.js`

---

## AUDIT SECTIONS (run every one)

### A. SEO 2026 — Content + meta + structure
1. Every page has a unique `<title>` (≤60 chars), unique `<meta description>` (≤160 chars). Flag duplicates, oversize, undersize.
2. Every page has a `<link rel="canonical">` matching the page URL exactly. Flag mismatches.
3. Every page has `<meta property="og:*">` for Open Graph (title, description, image, url, type, locale). Image must be 1200×630 PNG that actually exists on disk.
4. Every page has Twitter Card meta with image_src.
5. `hreflang` consistency — every page declares `en` and `x-default` pointing to itself.
6. Robots meta — `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` on every page that should be indexed. Flag any `noindex` that shouldn't exist.
7. H1 uniqueness — exactly one `<h1>` per page. Flag pages with zero or two+.
8. Heading hierarchy — no skipped levels (H1→H3 without H2). Flag every violation.
9. Internal link density — count outgoing internal links per page. Pages with <5 internal links to other indexed pages are content-isolated. List them.
10. **Orphan page audit**: any URL in `sitemap*.xml` that has zero internal links pointing TO it. List all.
11. **Anchor text quality**: how many internal links say "click here", "here", "read more", "this", "→" only. List anchors and target URLs that need rewriting.
12. URL hygiene: no `?utm_*` params hardcoded, no double slashes, no trailing-slash inconsistency, no mixed case. Flag every URL deviation.
13. Sitemap integrity: every URL in `sitemap-*.xml` returns 200 (you can't curl, but check that the generated HTML file exists at the corresponding path). List sitemap entries with no matching file. List files with no sitemap entry.
14. Image SEO: every `<img>` has `alt`, `width`, `height`, `loading="lazy"` (except above-the-fold which should be `eager` with `fetchpriority="high"`). Flag the bare ones.
15. Keyword cannibalisation: pages that target the same primary keyword. List by overlap.

### B. AI search readiness 2026
1. `llms.txt` exists, well-formed, references every major content cluster, has valid example queries.
2. `/api/venues.json` is valid JSON, has CC BY 4.0 license header, has stable schema across all records.
3. `/feed.json` is valid JSON Feed 1.1.
4. `/.well-known/ai-plugin.json` is valid ChatGPT plugin manifest with correct schema.
5. `robots.txt` explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, ChatGPT-User, Applebot-Extended, CCBot, anthropic-ai, OAI-SearchBot, PerplexityBot, Bytespider, Amazonbot, FacebookBot. List any missing.
6. Schema.org JSON-LD: validate every block. Flag missing required fields, type mismatches, broken @id references, dateModified < dateCreated, sameAs URLs that 404.
7. Speakable schema on guide pages (for AI voice).
8. FAQPage schema on venue pages: every Q has answer ≥40 chars. Flag thin answers.

### C. UI / UX — Desktop AND Mobile
1. **Layout overflow**: any element wider than viewport at 320px, 360px, 414px, 768px, 1024px, 1320px, 1920px, 2509px. List by class.
2. **Text overlap with sticky nav**: any heading or element that would land under the sticky nav on scroll-restore. Check `scroll-padding-top` is set.
3. **Sticky mobile actions overlap**: any content that runs under the bottom sticky bar on mobile.
4. **Tap target size**: every interactive element ≥44×44 px on mobile. List undersized.
5. **Color contrast**: every text/background pair against WCAG AA (4.5:1 normal, 3:1 large). List failures with measured ratio.
6. **Focus states**: every interactive element has visible `:focus-visible` styling. List those that don't.
7. **Marquee gap**: at any common viewport width, does the marquee track end before the viewport edge? Calculate.
8. **Form remnants**: any `<form>` element anywhere on the site. The site is form-free. List every offender.
9. **Newsletter remnants**: any reference to "newsletter", "subscribe", "buttondown" in HTML/CSS. List every offender.
10. **Old chrome leak**: any `border-radius: 14px`, `box-shadow: 0 8px 28px`, `--accent: #ffb800` color, or other pre-rebuild 2018-era styling that survived. List.
11. **Card image presence**: every `.cat-venue-card` and `.related-card` should have a `.cv-img` thumbnail. Audit each generated page; list cards missing images.
12. **Venue hero image**: every `/gyms/*/index.html` should have one `<figure class="venue-hero-img">`. List exceptions.
13. **Footer consistency**: every page footer has the same 5 columns, same WhatsApp/LINE/email links, same `// SITE BUILT & MANAGED BY PATTAYA AUTHORITY · TIM PAEMI ★` credit. List drift.
14. **Nav consistency**: every page has the same nav items in the same order. List drift.
15. **Empty / placeholder content**: any "TODO", "Lorem", "[VENUE NAME]", "{slug}", "${" raw template literal that leaked into generated HTML.
16. **Animation jank**: any animation that conflicts with `prefers-reduced-motion`. Check `@media (prefers-reduced-motion: reduce)` rule coverage.

### D. Code structure + build chain integrity
1. **Build determinism**: running `node build.js` twice in a row should produce byte-identical output (excluding lastmod dates). Look for non-deterministic ordering (Set iteration, Date.now()).
2. **Asset version drift**: confirm `ASSET_VERSION` in all 3 build files matches the `?v=` in `index.html`'s stylesheet ref.
3. **Function duplication**: `criticalCss()`, `accessibilityCriticalCss()`, `header()`, `footer()`, `newsletterFooterHtml()`, `autoLinkVenues()` appear in multiple files. Diff them. Flag drift between copies of the same logical function.
4. **Dead code**: any function defined that's never called. Any CSS class defined that's never used. Any data field set that's never read.
5. **Null-byte corruption**: scan every `*.js`, `*.css`, `*.html` for `\x00` bytes (file truncation artifact). List files.
6. **Template literal escape bugs**: any `${...}` that doesn't go through `escHtml()` when emitted into HTML attributes (`href=`, `data-*=`, `title=`, `alt=`). List every unescaped interpolation in attribute context.
7. **Inline event handlers**: every `onclick="..."`, `onerror="..."` with content. CSP-friendly alternative exists for each.
8. **Hard-coded paths**: absolute file paths (`C:\`, `/Users/`, `/home/`) anywhere in shipped output. List.
9. **TODO / FIXME / XXX**: every comment markup. List.
10. **`console.log` left in production code**: list every one in shipped JS.
11. **Unused npm dependencies** (if `package.json` exists): list.

### E. Content authenticity (CRITICAL — no LLM hallucinations)
1. **Phone number format**: every `tel:` link points to a real-format Thai number (`+66`, 9 digits after). Flag malformed.
2. **Wikidata claims**: any `wikidataQid` field references a Q-ID that exists. List those that look fabricated.
3. **Pricing claims**: any specific price (`฿4,000/mo`, `฿15,000`) in venue body. Cross-check vs. a per-venue source citation. Flag prices with no source.
4. **Champion / fighter names**: any name claim ("trained Yodsanklai", "Christian Daghio", "Saemapetch", "Rambaa") — verify spelling, accuracy of accomplishment described. Flag claims that look exaggerated.
5. **Dates**: any date in body content (founding date, "since 1960", "since 1987"). Cross-check vs. frontmatter `founded` field. Flag mismatches.
6. **Address claims**: every venue's address looks geographically real (street name pattern, postal code 20150/20260 for Pattaya area, district = "Bang Lamung"). Flag addresses that look generic/templated.
7. **"World's largest", "first", "only", "best" claims**: every superlative needs evidence. List unsupported.
8. **Testimonial / quote authenticity**: the homepage VOICES section contains "Marcus T. — Visiting fighter · Amsterdam", "Sasha K. — Long-stay expat · Jomtien", "Khun Nok — Wellness concierge · Pratamnak". These are placeholders. Flag as fictional.
9. **Press / "AS DISCOVERED VIA" list**: homepage claims "Google Maps · ChatGPT · Perplexity · Claude · Expat Forums · Reddit r/Pattaya · TripAdvisor". Are these accurate or aspirational?
10. **Editor identity claims**: "Tim Paemi" / "Pattaya Authority" — confirm spelling consistent everywhere. Confirm no claims of credentials we can't back up.

### F. Performance (theoretical, you can read but not measure)
1. **CSS file size**: report bytes of `styles.css`. Anything over 250 KB is too big.
2. **Unused CSS**: scan styles.css. Any selector that doesn't match any class actually used in the HTML output? List.
3. **JS bundle**: report total bytes of `app.bundle.js` + any other shipped JS. Anything over 80 KB minified is concerning.
4. **Image format**: any `.png` over 200 KB that could be `.webp`. List.
5. **Font loading**: how many Google Fonts weights are requested? List. (Each weight = 30-50 KB.)
6. **Above-the-fold render-blocking**: every `<link rel="stylesheet">` in `<head>` that isn't deferred/preloaded.
7. **Cumulative Layout Shift risks**: any image without explicit `width`/`height` attrs.
8. **Service worker cache strategy**: read `sw.js`. Cache-first for hashed assets, network-first for HTML? List violations.
9. **Largest Contentful Paint candidate**: identify what LCP element likely is on each page type.

### G. Accessibility (deep)
1. Every `<img>` has meaningful `alt` (decorative gets `alt=""`).
2. Every interactive element has accessible name (label, aria-label, or descriptive text). List bare `<button>`s, bare `<a>`s with only icon content.
3. Every `<button>` has explicit `type="button"` or `type="submit"`. List unmarked.
4. Color is never the only signal (red/green status pills also have text/icon).
5. Skip link `<a class="skip-link">` exists and works on every page.
6. Heading hierarchy correct (see A.8).
7. Landmark regions: `<header>`, `<nav>`, `<main>`, `<footer>` present on every page. List exceptions.
8. Forms — no forms exist (verify), so this section is just N/A but confirm.
9. Animation respects `prefers-reduced-motion`.
10. Language declared on `<html lang="en">`.

### H. Security headers (`_headers`)
1. Content-Security-Policy: confirm script-src, style-src, img-src, connect-src, font-src all defined. Flag `unsafe-inline` or `unsafe-eval`.
2. Strict-Transport-Security max-age ≥ 31536000.
3. X-Content-Type-Options: nosniff.
4. X-Frame-Options: DENY or SAMEORIGIN.
5. Referrer-Policy: strict-origin-when-cross-origin or stricter.
6. Permissions-Policy: confirm camera/microphone/geolocation locked.
7. Cross-Origin headers (COOP / COEP / CORP) reasonable.
8. CORS on `/api/*` correctly scoped.
9. Cache-Control headers on hashed assets vs HTML.

### I. Link structure (internal navigation)
1. Every venue page links to: its category, its area, 3+ related venues, 3+ nearby venues, the homepage, the methodology page.
2. Every category page links to: every venue in that category, the homepage, the search page.
3. Every area page links to: every venue in that area, all 6 area peer pages, the homepage.
4. Every guide page links to: 3+ related guides, the guides index, the homepage.
5. Footer links: every page footer must link to home, contact, methodology. Verify.
6. Breadcrumbs match URL path exactly. List drift.
7. No broken internal links (every `<a href="/...">` resolves to an existing file).
8. No `mailto:tim@*` or `mailto:hello@*` remaining. Only `info@pattaya-gym.com`.
9. No links to dead form pages (e.g., old `/add-your-gym/`). Verify `/add-your-gym/` exists but is form-free.
10. External links: every external `<a href>` has `rel="noopener"` (also `noreferrer` for sensitive ones).

### J. Mobile-specific deep audit
1. Tap targets (see C.4)
2. Horizontal scroll at any viewport width 320-414. List elements causing it.
3. Hamburger menu: open/close toggle works, doesn't push content, accessible.
4. Sticky bottom bar: doesn't overlap content, all 4 buttons reachable with thumb.
5. Hero image LCP: loads fast, has eager + fetchpriority.
6. Long words / addresses don't break layout (word-break / hyphens).
7. Forms — none exist (verify) — N/A.
8. Pinch-zoom not disabled (no `user-scalable=no` in viewport).
9. iOS safe-area-inset respected for bottom action bar.

### K. Authenticity / brand consistency
1. Brand name spelled identically everywhere: "Pattaya Gym Directory" (formal), "Pattaya Gym" (short), "pattaya-gym.com" (URL form). Flag every drift.
2. Currency: ฿ symbol used consistently. Flag mixed ($, USD, baht, THB).
3. Date format: ISO `2026-05-13` or "May 13, 2026" consistently. Flag mixed.
4. Phone format: `+66 NN NNN NNNN` (Thai mobile). Flag drift.
5. Editorial voice: every page in 2nd person ("you train") not 1st ("I").
6. Tagline: "Every gym and sport in Pattaya, Thailand — independently verified." appears in Org schema. Verify same line in any visible "tagline" element.
7. Footer credit format: `// SITE BUILT & MANAGED BY PATTAYA AUTHORITY · TIM PAEMI ★ ©2026` — exact spacing, exact dot characters, exact star. Flag any variant.

### L. Build chain hygiene
1. `ASSET_VERSION` consistency across `build.js`, `build-extras.js`, `build-discovery.js`.
2. The 3 critical CSS helper functions (`criticalCss`, `desktopTocCriticalCss`, `accessibilityCriticalCss`) — are they identical across the 3 files? Diff each.
3. Are `header()` and `footer()` functions identical between `build-extras.js` and `build-discovery.js`?
4. `data.js` parses as valid JS, exports the expected shape.
5. Every venue MD file has the required frontmatter fields (name, slug, area, category, address, phone, mapsUrl, priceRange).
6. The build script's `validate.js` (if present) — does it actually catch the obvious bugs?
7. `package.json` if present — node version pinned, scripts work.

### M. The "would I be embarrassed?" scan
- Open the live site at random URLs and look at it the way a journalist or competitor would.
- Anything cramped, overlapping, broken, awkward, off-brand, slow, ugly, low-credibility, hallucinated, generic.
- Specifically: does any page look like an AI made it without a human curator? Flag those pages.

---

## OUTPUT FORMAT

Return your findings as one Markdown report with this structure:

```
# Audit Report — pattaya-gym.com — [DATE]

## Executive Summary
- [3-5 lines of plain-language overall state]

## Critical Issues (block deploy / break site / hallucinate facts) [P0]
1. [file:line] Specific problem. Specific fix.
2. ...

## High Priority (visible degradation, SEO loss) [P1]
1. [file:line] ...

## Medium Priority (polish, consistency) [P2]
1. ...

## Low Priority (nice-to-have, future) [P3]
1. ...

## By Audit Section
### A. SEO 2026
[A.1 finding, A.2 finding, ...]
### B. AI search readiness
...
### C. UI/UX
...
[etc for every section A-M]

## Statistics
- Total pages audited: NNN
- Files inspected: NNN
- Issues found: P0=N, P1=N, P2=N, P3=N
- Pages with orphan status: NNN
- Pages with thin schema: NNN
- Average internal links per page: NN
- Average word count per venue page: NNN
- CSS file size: NNN KB
- Largest image: NNN KB at /path

## Specific files Claude should rewrite
[List of files + the exact transformation needed]

## Files I could not access / could not parse
[Anything you got an error on]
```

---

## SEVERITY DEFINITIONS

- **P0 (critical)**: Visible bug on the live site, broken link, hallucinated fact, security issue, deploy-blocker, schema invalidation that hurts Google ranking. Examples: phone number malformed (`tel:+0` is not a real link), schema with `@type` missing, page with no `<title>`, 404s in sitemap.
- **P1 (high)**: SEO opportunity lost or visible degradation that won't break things but costs ranking/credibility. Examples: thin meta description, orphan pages, missing canonical, broken color contrast, 8-button action bar that wraps to 3 rows on mobile, anchor text "click here".
- **P2 (medium)**: Polish, consistency, inconsistency that experienced users notice. Examples: footer drift between page types, date format mixed, currency mixed, drop-cap on the wrong paragraph.
- **P3 (low)**: Theoretical / future. Don't fix unless free.

---

## WHAT YOU MUST NOT DO

1. Do NOT edit any file. Read-only audit.
2. Do NOT install packages. Use what's in the repo.
3. Do NOT fetch URLs. The audit is offline-only on the local repo state.
4. Do NOT skim. If `styles.css` is 3500 lines, you read 3500 lines.
5. Do NOT generalize. Every finding has a specific `file:line` or `file::class` or `file::regex` reference.
6. Do NOT pad. If a section has no findings, write "No issues found in this section." and move on.
7. Do NOT assume. If you don't know if a phone number is real, flag it for human verification, don't pass it silently.
8. Do NOT hide. If `data.js` has 158 venues and 14 of them claim to be "founded 1990" with no source, list all 14 — not just "many venues have unsourced dates".

---

## CONTEXT FOR THE AUDIT — what was recently rebuilt

In the last 14 deploy cycles the site was rebuilt editorially. New design system: ink #0a0a0a / bone #f4f0e8 / gold #d4a72c / coral #ff5a4d / mint #5fc9a4. Massive Inter Tight + JetBrains Mono `// LABEL` prefixes. No border-radius anywhere except specific exceptions. Footer credit: `// SITE BUILT & MANAGED BY PATTAYA AUTHORITY · TIM PAEMI ★ ©2026`. Contact channels: `info@pattaya-gym.com`, WhatsApp `+66 96 728 6999`, LINE `@timpaemi`. All forms killed. All emails normalized to `info@`.

Things that could plausibly have broken during the rebuild:
- Critical CSS in 3 build files (criticalCss, desktopTocCriticalCss, accessibilityCriticalCss) — may have drifted.
- Build files (build.js, build-extras.js, build-discovery.js) got truncated several times by Edit-tool null-byte bugs. They were restored from git, but check the tail of each.
- venue.css was emptied but a category-grid CSS injection was added later. Verify it doesn't conflict with styles.css.
- The auto-link function (autoLinkVenues) was patched to skip HTML attribute interiors but may still have edge cases.
- The marquee content was duplicated 8x for wide-display coverage. Check both top and bottom.
- Mobile hamburger script appended to every page — verify it's idempotent and works.
- 4 utility pages had their forms stripped — verify nothing else broke when content was removed.
- Schema.org breadcrumbs, FAQPage, LocalBusiness, etc — all need re-validation.

---

## YOUR FIRST ACTION

Before producing findings:

1. Run `ls -la C:\pattayagym\` and confirm you can see all top-level files.
2. Count generated pages: `find gyms category area guides -name "index.html" | wc -l`.
3. Open `styles.css`, `build.js`, `build-extras.js`, `build-discovery.js`, `index.html` in full. Read them end to end.
4. Pick 3 random venue pages, 3 random category pages, 2 random area pages, 3 random guide pages. Read them in full.
5. Now begin the audit sections A through M.

You will produce one consolidated Markdown report. Make it ruthless. Make it actionable. The site is live. Treat every finding as something a competitor or journalist will find before we do.

Go.
