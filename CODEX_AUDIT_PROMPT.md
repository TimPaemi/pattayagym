# CODEX — FULL AUDIT OF pattaya-gym.com (V2 REDESIGN, 2026-05)

You are auditing the **post-redesign** production repo at `C:\pattayagym`. The site is a 158-venue Pattaya (Thailand) sports & fitness directory. It just shipped a complete visual rebuild on the `redesign-2026` branch — TimPaemi-inspired black background with multi-color neon accents, infinite marquees, numbered chapter cards, reading progress bar, etc.

Your job is **read-only investigation**. Do NOT edit files. Do NOT commit. Do NOT push. Do NOT run the build. Produce one comprehensive audit report and stop.

---

## ⚙️ Context — read these first

1. `README.md` — project description, npm scripts
2. `index.html` — homepage (V2 design, ~620 lines)
3. `styles.css` — V2 stylesheet (~1100 lines, source of truth)
4. `build-v2.js` — consolidated builder (replaces legacy `build.js` / `build-extras.js` / `build-discovery.js`)
5. `data.js` — 158-venue array + 15 categories + 6 areas
6. `venues/*.md` — venue body content (markdown + YAML frontmatter)
7. `_redirects`, `_headers`, `robots.txt`, `sitemap.xml`
8. Recent git log: `git log --oneline -20`, and `git status`

Also skim:
- `CONTRIBUTING.md`, `EDITORIAL_STYLE_GUIDE.md`, `SCHEMA_REFERENCE.md`
- `WORK_LOG_CODEX.md` if present

---

## 🛡 Hard rules (do not violate)

- **READ-ONLY.** No `Edit`, `Write`, `git commit`, `git push`, `node build-v2.js`, `npm run build`. You may run `node --check`, `git status`, `git log`, file reads, grep, head/tail, wc, find.
- **No scope drift.** You are not allowed to rewrite the design, suggest a new design, or argue about the design direction. The V2 design is locked. You are auditing how well it was executed.
- **Do not rename** URLs, venue IDs, category keys, area slugs without a 301 redirect plan in your recommendation.
- **No paid placements** — editorial integrity required. Flag any covert promotional language.
- The 158-venue invariant is **mandatory**. Flag any drift.

---

## 🎨 Locked design system (the reference)

You are auditing whether every page conforms to this:

**Colors** (CSS custom properties on `:root` in `styles.css`):
- `--bg` near-black `#0a0a0a`
- `--text` `#f5f5f5`, `--text-2` `#c4c4c4`
- Accents: `--pink #ff2e7e`, `--cyan #4ee0ff`, `--yellow #fde047`, `--mint #5fffa0`, `--red #ff3d3d`

**Type**:
- Display: `Space Grotesk` (700, 500)
- Body: `Inter` (400, 500)
- Mono labels: `JetBrains Mono` (500, 700)

**Layout patterns**:
- Top + bottom infinite seamless marquee strips
- "pattaya<cyan-dot>gym." brand mark (small inline dot, NOT a square)
- Numbered chapter cards (counter-increment 01, 02, 03…) on h2s
- Multi-color declaration headlines
- Cards with neon border-glow on hover
- Reading progress bar (fixed top, fills as you scroll)
- Auto-generated table of contents on long body pages
- Footer with "Pattaya Authority" badge + build timestamp + version (`v404` or higher)

**Subpage navigation**:
- Sticky top nav with "Pattaya.Gym" wordmark on the left
- 2 icon buttons on the right (search + menu)
- No horizontal nav of links — that is the OLD design

---

## 📋 Audit dimensions (every single one)

### A. Visual consistency (V2 design compliance)

For each page type — homepage, venue, category, area, utility (about/contact/methodology/press/add-your-gym/colophon/pattaya-sport-stats/404) — check:
- Black background + correct font stack loaded
- Top marquee + bottom marquee present and using `.marquee-set` duplicated for seamless loop
- Brand mark `pattaya<dot>gym.` (small dot, not a square)
- All h2s have counter-increment chapter numbers (`01`, `02`…)
- Multi-color accents present (no monochrome subpages)
- Reading progress bar present in `<body>`
- Footer: build timestamp + version + Pattaya Authority badge
- Sticky nav shows wordmark + 2 icon buttons (no old horizontal text nav)
- `?v=` cache-buster on every `<link rel="stylesheet">` and matches `ASSET_VERSION` in `build-v2.js`
- No leftover OLD design CSS classes (look for `.builtby`, `.sf-builtby`, legacy `.hero-old`, etc.)

Report: percentage of pages that fully comply, list of stragglers.

### B. Mobile responsiveness (<= 600px)

- Check `styles.css` for `@media (max-width: 600px)` and `@media (max-width: 760px)` blocks
- For each page type, identify what breaks at 360px / 414px / 768px:
  - Hero text overflow
  - Card grid → single column?
  - Marquee speed still readable?
  - Stats grid wraps properly?
  - Nav icon buttons still tappable (44×44 minimum)?
  - Progress bar still visible?
  - Footer columns stack?
  - Long category titles overflow?
- Open at least 3 generated venue pages, 1 category page, 1 area page, the homepage, and check viewport meta + responsive class usage

### C. Desktop responsiveness (1440px+ / 1920px+)

- Does the hero feel sparse at 1920px? Are gutters proportional?
- Max-width clamp on main content (should be ~1184px)
- Marquee fills full width edge-to-edge
- Card grids reflow gracefully at 2/3/4 columns
- Footer 4-column grid stays 4-column

### D. SEO — meta tags (every generated page)

- `<title>` present, 20-65 chars, unique
- `<meta name="description">` present, 80-165 chars, unique
- `<link rel="canonical">` present, matches actual URL (https://pattaya-gym.com/...)
- `<link rel="alternate" hreflang="en">` + `hreflang="x-default"` present
- OG tags: `og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:locale`
- Twitter tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `<meta name="viewport">` and `<meta name="theme-color">`
- `<html lang="en">`
- Exactly one `<h1>` per page
- Hreflang URL = canonical URL

Aggregate: how many of the 200+ pages pass each check.

### E. SEO — structured data / JSON-LD

- Parse-validate every `<script type="application/ld+json">` block (count blocks, count parse errors)
- Coverage by page type:
  - Venue → LocalBusiness + variant (SportsClub / SportsActivityLocation / HealthClub / ExerciseGym / GolfCourse) + FAQPage + BreadcrumbList
  - Category → ItemList + BreadcrumbList + WebPage
  - Area → ItemList + BreadcrumbList + WebPage
  - Homepage → WebSite + Organization + SearchAction
  - Utility → WebPage / AboutPage / ContactPage
- LocalBusiness must have: `name`, `address`, `telephone`, `priceRange`, `geo`, `openingHoursSpecification`

### F. SEO — sitemap + crawl

- `sitemap.xml` parses, count `<url>` entries
- Every sitemap URL has a real `index.html` on disk
- Every `index.html` on disk is in the sitemap
- `robots.txt` references sitemap.xml
- `_redirects` syntax valid + every 301 target exists

### G. Performance (static analysis)

- Total page weight (HTML bytes only) per page type — min / median / max
- CSS file size (raw + estimated gzip)
- JS file size (raw + estimated gzip)
- Largest CSS > 80KB? Largest JS > 30KB?
- Number of render-blocking `<link rel="stylesheet">` per page (should be 1-2)
- Is `font-display: swap` used? Or are fonts self-hosted? Or via Google Fonts CDN?
- LCP candidate per page type (which element is likely the LCP)
- Service worker registration coverage
- OG image existence — flag missing `/og/<slug>.png`

### H. Accessibility (WCAG 2.1 AA targets)

- Skip-to-content link on every page (`#main` or `#main-content`)
- `<main id="main">` landmark present
- Buttons without aria-label AND without visible text
- Form inputs without label
- `<img>` without `alt`
- `<a>` with no accessible name
- Headings hierarchy violations (h2 before h1, h3 before h2, etc.)
- Color contrast spot-check: white `#f5f5f5` on black `#0a0a0a` (should be > 7:1, AAA), secondary `#c4c4c4` on black (should be > 4.5:1, AA)
- Focus-visible styles present on links and buttons (`:focus-visible` rules in CSS)
- Reduce-motion preference respected for marquee (`@media (prefers-reduced-motion: reduce)` rule should pause it)

### I. Content integrity

- 158 venue markdown files exist in `venues/`
- Each venue MD has parseable YAML frontmatter
- Word count per venue body (excluding frontmatter + code) — min / median / P90 / max
- Venues with < 500 words (thin content risk)
- Venues with empty `phone:` and `website:` in `data.js`
- Venues missing `sources:` frontmatter
- Venues with vague placeholder address ("verify exact", "confirm at booking", just "Pattaya")
- 5 oldest `verified:` dates
- Editorial consistency: Pratamnak vs Pratumnak usage (both are intentional per style guide — Pratumnak in official venue names, Pratamnak in prose)

### J. Build pipeline integrity

- `node --check build-v2.js` (syntax-valid?)
- `node --check data.js`
- Read build-v2.js and confirm:
  - It does NOT touch old build.js / build-extras.js / build-discovery.js
  - It generates: 158 venue, 15 category, 6 area, 8 utility pages + sitemap
  - It includes `ASSET_VERSION` constant and `BUILD_TIMESTAMP` injection
- Confirm `package.json` scripts still reference correct build entry

### K. Browser compatibility (static check)

- Look for unsupported features in styles.css:
  - `:has()` — modern browsers only (Chrome 105+, Safari 15.4+, Firefox 121+) — OK if used carefully
  - `@layer` cascade layers — Chrome 99+, Safari 15.4+, Firefox 97+ — OK now
  - `aspect-ratio` — universally supported now
  - `container queries` — Chrome 105+, Safari 16+, Firefox 110+ — flag if used
  - `text-wrap: balance` / `pretty` — flag as progressive enhancement
- Look for unsupported JS in inline scripts (optional chaining, nullish coalescing — universal now)

### L. Usability

- Tap targets ≥ 44×44 on mobile
- Click targets clearly distinguishable from non-interactive text
- Hover-only affordances flagged for mobile (touch devices don't hover)
- Marquee speed — too fast to read? Too slow to feel alive?
- Reading progress bar visible enough but not distracting
- Auto-generated TOC on long pages — does it scroll-spy / highlight current section?
- "Back to top" button — visible, accessible, returns smoothly
- Search functionality on homepage works without JS errors
- Compare tool state UI correctness
- Map page Leaflet load
- 404 page exists and is on-brand

### M. UI quirks specific to V2

Run this checklist against the homepage AND at least 3 venue pages, 1 category, 1 area:

- [ ] Hero brand mark uses small inline dot (border-radius:50%, ~0.18em), not a square
- [ ] Top marquee has duplicated `.marquee-set` (for seamless infinite loop)
- [ ] Top marquee uses `width: max-content` + `transform: translate3d(-50%, 0, 0)` animation, NOT a static repeat
- [ ] No global `*::-webkit-scrollbar { display: none }` rule — scrollbars hidden ONLY on `.row-scroll, .marquee, .nearby-row, .quick-chips`
- [ ] Body has `overflow-x: hidden; overflow-y: auto` so the right-side browser scrollbar IS visible
- [ ] All h2s on long-form pages have chapter numbering via `counter-increment`
- [ ] No legacy "PATTAYA.GYM" all-caps wordmark left behind on any subpage nav
- [ ] No old horizontal nav of text links — only wordmark + 2 icon buttons
- [ ] Footer build timestamp present and matches `BUILD_TIMESTAMP` value in `build-v2.js`
- [ ] Footer Pattaya Authority badge present
- [ ] Cache-buster `?v=` matches latest `ASSET_VERSION` (currently `404` or newer)

### N. Git state

- `git status` — uncommitted file count, untracked count
- HEAD commit + branch + ahead/behind
- Confirm we are on `redesign-2026` branch (or main if merged)
- Are any backup files committed by accident (`*.OLD.css`, `*.OLD.html`, `pattayagym_*.zip`, `BACKUP_MANIFEST_*.md`)?

---

## 📦 Output format

Write your audit to `C:\pattayagym\AUDIT_REPORT.md` with this exact structure:

```markdown
# pattaya-gym.com — Codex Audit Report (V2 redesign)
Date: <YYYY-MM-DD>
Auditor: Codex (read-only pass)
Branch: <branch name from git>
HEAD: <short commit hash>

## TL;DR

3–5 sentences. Single sentence on overall site health, then the biggest single finding, then top 3 areas needing work.

## 🟢 What's clean

Bulleted list of dimensions that pass, with actual numbers (e.g., "158/158 venue pages have BreadcrumbList JSON-LD").

## 🔴 P0 — Critical (ship-blockers)

Each finding:
- **Title**
- **Severity**: P0
- **Pages affected**: count + 3 examples
- **Evidence**: file path + line numbers + snippet
- **Fix**: concrete steps
- **Effort**: 5 min / 30 min / 2 hr / 1 day

## 🟠 P1 — High (fix this week)

Same format.

## 🟡 P2 — Medium (fix this month)

Same format.

## 🟢 P3 — Low / polish

Same format.

## 📊 Raw numbers

A single Markdown table with at least 40 rows covering metrics from A–N above.

## 🔧 Recommended fix order

Numbered 1–20, biggest leverage first. Each line: title + estimated effort + which P-level finding it resolves.

## 📝 Notes for the next session

Anything weird that didn't fit a clear "fix this" bucket but might matter later.
```

---

## 🚀 After writing the audit

1. Save to `C:\pattayagym\AUDIT_REPORT.md` (overwrite if exists)
2. Stop. Do not commit. Do not push. Tim will review from his Windows terminal and decide what to ship.

---

## 🎯 Success criteria

The audit is "successful" when:
1. Every dimension A–N has at least one paragraph of findings (positive or negative)
2. Severity buckets P0–P3 each have at least one finding OR an explicit "(none)" marker
3. "Raw numbers" table has at least 40 rows
4. "Recommended fix order" has at least 10 items
5. **No production code was modified**
6. The `AUDIT_REPORT.md` file exists at the repo root and is comprehensive

Go.
