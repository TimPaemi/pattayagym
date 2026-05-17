# CODEX — NUCLEAR AUDIT (post-live V2 site, round 2)

You are auditing pattaya-gym.com **the day it went live with the V2 redesign**. Local repo: `C:\pattayagym`. Live site: `https://pattaya-gym.com`. Preview branch: `https://redesign-2026.pattayagym.pages.dev`.

This is **read-only investigation**. You do NOT modify code, run the build, commit, or push. You produce one comprehensive audit report at `C:\pattayagym\AUDIT_REPORT_LIVE.md` and stop. A human (not you) executes the fix order from your report.

**Out of scope this round:** Lighthouse / Core Web Vitals / perf deep-dive. That's a separate audit pass after this one. Don't run Lighthouse; don't speculate about LCP/CLS/INP scores. Static analysis only for perf indicators.

---

## ⚙️ Context — what shipped

- Branch `main` was just fast-forward-merged from `redesign-2026` and pushed. Cloudflare Pages auto-deploys `main` → `pattaya-gym.com`.
- Rollback safety tag: `main-pre-v2-rollback` (points at pre-merge `main`).
- Latest commit on main: check `git log --oneline -1`.
- V2 design: black bg, multi-color neon accents (pink, cyan, yellow, mint, red), Space Grotesk + Inter + JetBrains Mono fonts, infinite seamless marquees top + bottom, numbered chapter cards, reading progress bar, `pattaya<cyan-dot>gym.` brand mark.
- Build system: `build-v2.js` is the canonical builder (legacy `build.js` retained as `npm run build:legacy`).
- Cache buster on assets: `?v=404`.

### Required first reads
1. `README.md` — project description + npm scripts
2. `index.html` — homepage source
3. `build-v2.js` — builder (~1300 lines)
4. `styles.css` — V2 stylesheet (~1200 lines)
5. `data.js` — 158 venues, 15 categories
6. `AUDIT_CLAUDE.md` + `AUDIT_REPORT.md` — last round's findings (some fixed, some pending)
7. `git log --oneline -10` — recent history
8. `git status` — uncommitted work (should be near-clean)

---

## 🛡 Hard rules (do not violate)

- **READ-ONLY.** No `Edit`, `Write`, `git add`, `git commit`, `git push`, `node build-v2.js`, `npm run build`. Allowed: `git status`, `git log`, `git diff`, `node --check`, file reads, grep, `curl -I` / `curl -L`, `wc`, `find`, `head`, `tail`, `python3` for analysis only.
- **No scope drift.** You are NOT redesigning, NOT proposing new color palettes, NOT arguing about typography. The V2 design is locked.
- **No URL renames** without 301 redirect plan in your recommendation.
- **158-venue invariant** must hold. Flag any drift.
- **Do not commit** this audit prompt or your report. Tim does that.

---

## 🎯 Locked V2 design system (the spec you audit against)

### Colors (`:root` in `styles.css`)
- `--bg`: near-black `#0a0a0a` (or `#000000` per current spec)
- `--text` `#f5f5f5`, `--text-2` `#c4c4c4`, `--muted` `#888`, `--hint` `#555` (note: hint fails WCAG AA — flag if not yet fixed)
- Accents: `--pink #ff2e7e`, `--cyan #4ee0ff`, `--yellow #fde047`, `--mint #5fffa0`, `--red #ff3d3d`

### Type
- Display: `Space Grotesk` (700, 500)
- Body: `Inter` (400-700)
- Mono labels: `JetBrains Mono` (500, 700)

### Layout patterns
- `pattaya<cyan-dot>gym` brand mark — small inline circle (border-radius:50%, ~0.18em), NOT a square
- Top + bottom infinite seamless marquee strips (`.marquee-set` duplicated, `width: max-content`, `translate3d -50%` keyframe)
- Numbered chapter cards (`counter-increment: chapter` for h2s)
- Multi-color declaration headlines
- Cards with neon border-glow on hover
- Reading progress bar (fixed top)
- Footer: build timestamp + Pattaya Authority badge + `v404` (or current asset version)
- Sticky nav: wordmark left, horizontal text-link nav middle, pink "Find a gym" CTA right
- Skip-to-content link as first body child (only visible on `:focus`)
- Cache buster on every `<link rel="stylesheet">`: `?v=<ASSET_VERSION>` from build-v2.js

---

## 📋 Audit dimensions (every one — comprehensive)

### A. Local vs live parity

The local repo is the source of truth. The live site should be byte-equivalent (modulo Cloudflare compression). For each of these URLs, `curl` the live response, compare to the local file on disk, report any deviation:
- `https://pattaya-gym.com/` vs `C:\pattayagym\index.html`
- `https://pattaya-gym.com/styles.css?v=404` vs `C:\pattayagym\styles.css`
- `https://pattaya-gym.com/gyms/fairtex-pattaya/` vs local
- `https://pattaya-gym.com/category/muay-thai/` vs local
- `https://pattaya-gym.com/area/jomtien/` vs local
- `https://pattaya-gym.com/about/` vs local
- `https://pattaya-gym.com/guides/best-muay-thai-pattaya/` vs local (this is a migrated legacy page)
- `https://pattaya-gym.com/_headers` (the CSP headers should be delivered via response headers — `curl -I` and confirm `Content-Security-Policy` is present)
- `https://pattaya-gym.com/sitemap.xml` vs local
- `https://pattaya-gym.com/robots.txt` vs local

Report any 4xx/5xx, redirects, or deviations.

### B. Visual consistency (V2 compliance across page types)

For each page type — homepage, venue (sample 5), category (sample 3), area (sample 2), utility (about, contact, methodology, press, add-your-gym, colophon, pattaya-sport-stats, 404), legacy-migrated (sample 5 of the 17 guides + search, compare, map, plan-my-trip, find-my-coach, favorites) — verify:
- Black background, V2 font stack loaded
- Top + bottom marquee present + seamless (duplicated `.marquee-set`)
- Brand mark uses cyan inline dot (not square)
- All h2s have chapter numbering
- Multi-color accents (no monochrome)
- Reading progress bar in body
- Footer: build timestamp + Pattaya Authority badge + version `v404`
- Sticky nav matches V2 pattern
- Cache buster `?v=404` on stylesheets
- `<a class="skip-link">` as first body child
- NO leftover legacy artifacts: `sf-builtby`, `PATTAYA.GYM` all-caps wordmark, `?v=237`, `?v=222`, Inter Tight font

Aggregate: percentage of pages that fully comply, list stragglers.

### C. Mobile responsiveness (360 / 414 / 768)

Use `curl` to fetch the homepage + venue + category + area page HTML, then inspect for:
- `<meta name="viewport" content="width=device-width">` present
- `@media (max-width: 600px)`, `(max-width: 760px)`, `(max-width: 900px)` rules in styles.css
- Are these rules covering: nav, hero, cards grid, stats grid, marquee, footer columns?
- Tap targets — `.btn`, `.nav-cta`, `.numcard`, icon buttons — must be ≥ 44px × 44px on mobile (check via min-height/min-width or explicit padding)
- Specifically inspect `.nav-cta` and the hero CTAs

For desktop check, scan styles.css for `--max` clamp + max-width on `.wrap`, `.hero-inner`, etc., and confirm the layout doesn't sprawl past ~1280px.

### D. SEO meta tags (every page)

For each shipped page (sample at least 10 across types), verify:
- `<title>` present, 20-65 chars, unique site-wide (count duplicates)
- `<meta name="description">` 80-165 chars, unique
- `<link rel="canonical">` self-referential https URL
- `<link rel="alternate" hreflang="en">` + `hreflang="x-default">` self-referential
- `<meta property="og:title|description|image|url|type|locale|site_name">`
- `<meta name="twitter:card|title|description|image">`
- `<meta name="viewport">` + `<meta name="theme-color" content="#000000">`
- `<html lang="en">`
- Exactly one `<h1>` per page

Aggregate counts: how many pages pass each check.

### E. Structured data / JSON-LD (every page)

- Parse-validate every `<script type="application/ld+json">` block. Count blocks site-wide + parse errors.
- Per page type, list which `@types` are present:
  - Venue: `LocalBusiness` (variants: SportsActivityLocation/ExerciseGym/HealthClub/GolfCourse/SportsClub) + `BreadcrumbList`
  - Category: `ItemList` + `BreadcrumbList`
  - Area: `ItemList` + `BreadcrumbList`
  - Homepage: `WebSite` + `Organization` + `SearchAction`
  - Utility: `WebPage` / `AboutPage` / `ContactPage` + `BreadcrumbList`
  - Migrated legacy guide: `CollectionPage` or `WebPage` + `BreadcrumbList`
- `LocalBusiness` required fields present: `name`, `address` (PostalAddress), `telephone`, `priceRange`, `openingHoursSpecification` (or `openingHours` fallback), `geo` (optional but flag if missing)
- Flag any venues where `openingHoursSpecification` is missing despite `hours` being set in data.js (parser may have skipped it)
- FAQPage schema — currently NOT emitted by build-v2.js but the venue MD bodies have FAQ-shaped content. Flag as P1.
- Use Google's Rich Results Test (https://search.google.com/test/rich-results) mentally: for a venue page, would it qualify for the Local Business rich result? Cite which fields would block.

### F. Sitemap + crawl directives

- Parse `sitemap.xml` — count `<url>` entries
- Every sitemap URL → real `index.html` on disk + returns 200 from live site (sample 10 via curl -I)
- Every `index.html` on disk → in sitemap (Codex's prior audit found 26 missing — verify how many remain)
- `robots.txt` references `sitemap.xml`
- `_redirects` syntax valid + every 301 source/target exists
- Newly-migrated `/guides/`, `/search/`, `/compare/`, `/map/`, `/plan-my-trip/`, `/find-my-coach/`, `/favorites/` — should be in sitemap or `noindex,follow`

### G. Internal + external link hygiene

- Walk every shipped HTML page, extract `href="/..."`, verify target file exists on disk + returns 200 live
- Same-page `href="#anchor"` validity — every anchor must have matching `id=`
- Count broken anchors per page
- External `target="_blank"` links — all must have `rel="noopener noreferrer"`. Count compliance
- Mixed-content risk: any `http://` `src=` references (should be 0)
- Dead external links — for the homepage + 5 venue pages, check if external `sameAs` URLs (Facebook, Instagram, venue websites) return 200 via `curl -I -L --max-time 5`
- Duplicate H1 strings across pages
- Duplicate `<title>` across pages
- Duplicate `<meta name="description">` across pages

### H. Accessibility (WCAG 2.1 AA)

- Skip-to-content link on every page (`<a class="skip-link" href="#main">`)
- `<main id="main">` landmark present
- Focus styles — `:focus-visible` rule exists in styles.css, applies to interactive elements
- Buttons without aria-label AND without visible text — list count + examples
- Inputs without label — count
- `<img>` without `alt` — count
- `<a>` with no accessible name — count
- Heading hierarchy — flag pages where h2 appears before h1, h3 before h2, etc. (Codex's prior audit flagged h4 used as styling-only on 188 pages)
- Color contrast:
  - `--text #f5f5f5` on `--bg` (should be AAA, ~19:1)
  - `--text-2 #c4c4c4` on bg (AAA, ~12:1)
  - `--muted #888` on bg (AA, ~5.9:1)
  - `--hint #555` on bg (FAIL AA, ~2.8:1) — was flagged P1 — verify if fixed
- `@media (prefers-reduced-motion: reduce)` rule pauses marquee animation
- `tabindex` abuse — flag any non-zero or non-(-1) tabindex
- Keyboard trap check: every modal/dialog dismissible via Escape

### I. Content integrity

- 158 venue MDs exist + parse YAML frontmatter (5 broken from prior audit — verify fix)
- Venue body word count — min / median / P90 / max
- Venues with `< 500 words` body (thin content risk)
- Venues with empty `phone:` (was 111) + empty `website:` (was 53)
- Venues with vague address ("verify exact", "confirm at booking", just "Pattaya")
- Venues missing `sources:` frontmatter (was 26)
- 5 oldest `verified:` dates — flag if > 30 days old
- Editorial consistency: Pratamnak vs Pratumnak usage (both intentional per style guide)
- British vs American spellings — flag inconsistencies

### J. Build pipeline + repo hygiene

- `node --check build-v2.js` passes
- `node --check data.js` passes
- `build-v2.js` does NOT require or call `build.js`, `build-extras.js`, `build-discovery.js`
- Run the build twice (mentally or via `node build-v2.js` if allowed — skip if you want to stay pure read-only) and verify deterministic output (skip if read-only constraint)
- Files committed that shouldn't be: `*.OLD.css`, `*.OLD.html`, `*.zip`, `*.tar.gz`, `BACKUP_MANIFEST_*.md`, `pattayagym_*.zip` — list any tracked
- `.gitignore` covers `node_modules`, `.backups`, `*.tmp`, `*.log`
- README still says deploy branch is `main`? Now CORRECT (main was just merged). Flag if README is wrong about anything else.

### K. Security headers + CSP

- Fetch headers from live site for `/`, `/gyms/fairtex-pattaya/`, `/styles.css` via `curl -I`
- Verify presence: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Content-Security-Policy`
- CSP `script-src` — list the hashes present. Compare to the actual inline-script SHA256s on the shipped pages. Any unmatched hash = production-blocked script.
- `.well-known/security.txt` present
- No inline `onclick=` / `onmouseover=` handlers (count)
- HTTPS everywhere — no `http://` canonical URLs

### L. Browser compatibility (static check)

In styles.css, flag use of:
- `:has()` (Chrome 105+, Safari 15.4+, Firefox 121+) — OK now
- `@layer` cascade layers (Chrome 99+, Safari 15.4+, Firefox 97+) — OK
- `text-wrap: balance` / `pretty` — OK as progressive enhancement
- `container queries` (`@container`) (Chrome 105+, Safari 16+, Firefox 110+) — flag if used
- `aspect-ratio` — universal now
- Logical properties (`margin-inline`, `padding-block`) — flag for IE fallback if needed (IE is dead, so just informational)

Flag any `-webkit-` or `-moz-` prefixes that are no longer needed.

### M. Usability (UX-level audit)

- Hero CTA visibility — is "Find your gym" immediately tappable above the fold on 360px viewport?
- Information hierarchy — does the homepage answer "what is this site?" within the first scroll-screen?
- Marquee speed — readable on desktop (28s loop)? Too fast / too slow on mobile?
- Reading progress bar — is it visible enough without being distracting?
- Auto-generated TOC on venue pages — does it work? Scroll-spy?
- "Back to top" button — visible after scrolling, accessible, smooth scroll?
- Search functionality on `/search/` — does the page actually function with V2 chrome? Or is it a broken stub?
- Compare tool on `/compare/` — same question
- Map page on `/map/` — Leaflet still loads? Markers render?
- 404 page — exists, on-brand, has navigation back to main paths
- Hover-only affordances on mobile — flag any clickable element that requires hover to discover

For each tool page (search, compare, map, plan-my-trip, find-my-coach, favorites) — open it via the live URL with curl + inspect what JS files it depends on. Test if those JS files load (200) and if they reference functions/elements that still exist in the V2 chrome.

### N. Migrated-legacy page health check

The 24 pages migrated in this last round (17 guides + index + 6 tools) had their `<main>` content wrapped in V2 chrome but the inner CSS classes (`venue-h1`, `venue-hero`, `bc-sep`, `cta-row`, `venue-cat-pill`, etc.) may not all exist in V2 styles.css. For 3 sample legacy guides + 2 tool pages:
- Visually inspect (via HTML inspection) whether key elements render with styling or fall back to browser defaults
- Identify any orphan class names that have no rule in V2 styles.css
- Flag broken layouts: unstyled buttons, missing card backgrounds, plain-text H1s
- Recommend either (a) adding the missing CSS rules to styles.css, or (b) rewriting the guide bodies to use V2 class names

### O. Specific known issues from prior audits — verify status

Each of these was flagged by the previous audits. Confirm fixed-or-still-open:
- `index.html` truncation (was at 307 lines, should now be 537+) — FIXED?
- NUL byte corruption on `styles.css`, `404.html`, `about/`, `contact/`, `gyms/fairtex-pattaya/`, `build.js`, `build-extras.js` — FIXED?
- `package.json` build script points at `build-v2.js` — FIXED?
- 3 CSP sha256 hashes in `_headers` — FIXED?
- Homepage canonical, hreflang, og:locale, twitter:title/desc/image — FIXED?
- Homepage WebSite + Organization JSON-LD — FIXED?
- All venue/category/area pages have BreadcrumbList — FIXED?
- All venues have PostalAddress in LocalBusiness — FIXED?
- 24 legacy pages migrated to V2 chrome — FIXED?
- Site-wide `?v=237` references — should be 0
- Site-wide `sf-builtby` class — should be 0
- Site-wide `PATTAYA.GYM` all-caps wordmark — should be 0
- `--hint #555` WCAG fail — STILL OPEN?
- 5 YAML-broken venue MDs — STILL OPEN?
- 26 sitemap-missing pages — partially fixed by legacy migration? Verify count.
- README deploy branch reference — STILL OPEN?
- FAQPage JSON-LD on venues — STILL OPEN?
- h4 hierarchy violations (188 pages) — STILL OPEN?

### P. Git state + deploy hygiene

- `git status` — uncommitted file count, untracked count
- HEAD commit on each of: `main`, `redesign-2026` — should now be identical (since main was just fast-forwarded)
- `main-pre-v2-rollback` tag — exists?
- Any local refs ahead of origin — flag

---

## 📦 Output format

Write to `C:\pattayagym\AUDIT_REPORT_LIVE.md`:

```markdown
# pattaya-gym.com — Codex Nuclear Audit Round 2 (post-V2 live)
Date: <YYYY-MM-DD>
Auditor: Codex (read-only)
Branch: <current branch>
HEAD: <short hash>
Live URL state confirmed: <timestamp of curl checks>

## TL;DR
3-5 sentences. Overall site health + biggest finding + top 3 priorities.

## 🟢 Strengths (what's clean)
Bulleted with hard numbers ("158/158 venue pages have BreadcrumbList JSON-LD, all parse cleanly").

## 🔴 P0 — Critical (ship-blockers or production-impacting)
Each: Title / Severity / Pages affected (count + 3 examples) / Evidence (file:line snippets) / Fix recommendation / Effort.

## 🟠 P1 — High (fix this week)
Same format.

## 🟡 P2 — Medium (fix this month)
Same format.

## 🟢 P3 — Low / polish
Same format.

## 📊 Raw numbers
One Markdown table, 50+ rows: parity check results, JSON-LD counts, sitemap counts, accessibility counts, link-integrity counts, file sizes, byte deltas.

## 🔧 Recommended fix order
Numbered 1-20, biggest leverage first. Each: title + estimated effort + which P-level it resolves.

## ⏭ Out-of-scope (deferred to round 3)
- Lighthouse / Core Web Vitals deep-dive (LCP / CLS / INP / TBT)
- Cloudflare Workers / edge logic
- Image optimization
- Font subsetting

## 📝 Notes for the next session
Anything weird that didn't fit a clear bucket but might matter.
```

---

## 🚀 After writing

1. Save `C:\pattayagym\AUDIT_REPORT_LIVE.md`
2. Stop. Do not commit, push, or run the build.
3. Tim reviews the report and hands it back to Claude for execution.

## 🎯 Success criteria

- Every dimension A–P has at least one paragraph
- Severity buckets P0–P3 each have at least one finding OR explicit "(none)" marker
- Raw numbers table has 50+ rows
- Recommended fix order has 15+ items
- No production code modified
- Audit cross-references both local repo state AND live site state (use `curl` on the live URLs)
- File saved at `C:\pattayagym\AUDIT_REPORT_LIVE.md`

Go.
