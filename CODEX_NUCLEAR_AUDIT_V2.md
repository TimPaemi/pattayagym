# CODEX — NUCLEAR AUDIT V2 (every-line code + UI + SEO + Lighthouse, post-hotfix)

You are auditing pattaya-gym.com after multiple rounds of fixes. This is the **deepest read-only audit yet**: every line of code, every page, every link, every byte of CSS, every JS handler, real Lighthouse runs against the live site, and a line-by-line scrutiny of `build-v2.js` and `data.js`.

**Repo:** `C:\pattayagym`
**Live (production):** `https://pattaya-gym.com`
**Preview:** `https://redesign-2026.pattayagym.pages.dev`

You produce **one** comprehensive report at `C:\pattayagym\AUDIT_REPORT_NUCLEAR.md` and stop. A human (not you) executes the fix order.

---

## 🛡 Hard rules (do not violate)

1. **READ-ONLY.** No `Edit`, `Write`, `git add`, `git commit`, `git push`, `node build-v2.js`, `npm run build`. Allowed: `git status`, `git log`, `git diff`, `git show`, `node --check`, file reads, grep, `wc`, `find`, `head`, `tail`, `curl -I` / `curl -L`, `python3` for analysis, `npx lighthouse` for perf (read-only — produces JSON, don't modify code from it), `npx html-validate` (validation only — produces stdout, don't auto-fix). Reading a screenshot via headless browser is fine if you can do it; don't modify production.

2. **No scope drift.** The V2 design (black bg, multi-color neon, marquee strips, `pattaya<cyan-dot>gym` brand mark, Space Grotesk + Inter + JetBrains Mono, asset version `?v=404`) is locked. Audit execution against the spec; don't propose redesigns.

3. **No URL renames** without 301 redirect plan in your recommendation. Production has been live; any URL change must preserve crawl equity.

4. **158-venue invariant** must hold. Flag any drift.

5. **Don't auto-commit anything**, including this prompt and your report.

6. **Don't speculate.** If you can't verify something, mark it as "needs human eyes" rather than guessing.

---

## ⚙️ Context — what's shipped through Round 3 + hotfix

- Latest commits on `redesign-2026` (and now merged to `main`):
  - HOTFIX: linked 141 orphan venue body MDs via `detailFile` in data.js
  - Round 3: P0/P1/P2 batch (CodexAudit Round 2 fix order)
  - Round 2: schema-rich rebuild (BreadcrumbList, PostalAddress, openingHoursSpec)
- Asset version: `?v=404`. Build pipeline: `npm run build` → `node build-v2.js`. Legacy preserved as `build:legacy`.
- Cloudflare Pages serves `main` → `pattaya-gym.com`.
- Cloudflare Email Address Obfuscation is **still on** at the time of this audit (rewrites `mailto:` and injects an email-decode script). Flag the parity diff but it's expected.

**Required first reads:**
1. `README.md`
2. `index.html` (homepage source)
3. `build-v2.js` (the generator — every line)
4. `data.js` (158 venues, 15 categories — every record)
5. `styles.css` (V2 stylesheet — every rule)
6. `package.json` (npm scripts)
7. `_headers` (Cloudflare Pages headers)
8. `_redirects` (Cloudflare Pages redirects)
9. `robots.txt`
10. `sitemap.xml`
11. `AUDIT_REPORT_LIVE.md` (Codex Round 2 audit)
12. `AUDIT_CLAUDE.md` (Claude Round 2 audit)
13. `git log --oneline -15`

---

## 📋 Audit dimensions (every one)

### A. Local vs live byte-parity (curl every key URL)

Fetch each via `curl -s -L` and compare to local file (after stripping Cloudflare's email-decode injection). Report exact byte deltas:

- `/` (homepage)
- `/styles.css?v=404`
- `/gyms/fairtex-pattaya/`
- `/gyms/fitz-club/` (was a stub before hotfix — must now have ~1,800w body)
- `/gyms/lumpinee-boxing-stadium/`
- `/gyms/hilton-pattaya-fitness/`
- `/category/muay-thai/`
- `/category/fitness/`
- `/area/jomtien/`
- `/area/east-pattaya/`
- `/about/`
- `/contact/`
- `/methodology/`
- `/guides/best-muay-thai-pattaya/` (migrated legacy)
- `/search/` (tool page — likely broken JS still)
- `/map/` (tool page — likely broken)
- `/sitemap.xml` (should be 211 URLs)
- `/robots.txt`
- `/404.html`

For each: HTTP status, content-length, content-type, key response headers. Flag any 4xx/5xx, redirects, mismatched content-type.

### B. Build pipeline integrity (line-by-line `build-v2.js`)

Open `build-v2.js` and **read every function**. For each, note:
- Does the function name + JSDoc-style intent match the implementation?
- Are there unused variables, dead branches, or unreachable code?
- Is error handling adequate (e.g., venue MD parse errors are swallowed silently or surfaced)?
- Is escape-handling consistent (`esc()` vs raw string interpolation in templates)?
- Are template literals correctly escaped against XSS for venue-derived text?
- Are async / sync calls consistent (it's synchronous Node — should not be using fs.promises)?

Specifically scrutinize:
- `head()` — output meta tags consistency
- `nav()` — link integrity, aria attributes
- `venuePage()` — schema graph construction (LocalBusiness subtype, openingHoursSpecification parser correctness)
- `categoryPage()`, `areaPage()`, `utilityPage()` — schema + breadcrumb
- `parseFrontmatter()` — quoted vs unquoted YAML, list parsing
- `mdToHtml()` — table rendering, link auto-linking, header counter logic
- `generateSitemap()` — completeness (211 URLs target)
- `phoneToTel()` — phone sanitization edge cases (e.g. `+66 38 250 421 ext. 2621` → `+6638250421`)
- `parseHoursSpec()` — multi-session inheritance via `&`

Run `node --check build-v2.js` and `node --check data.js`. Report any warnings.

### C. data.js review (every venue record)

For each of 158 venues, verify:
- `id` is unique, kebab-case, matches `venues/<id>.md` filename (the hotfix linkage)
- `name` is human-readable, no HTML
- `category` is one of the 15 known keys
- `area` is non-empty
- `address` is non-empty and not a placeholder ("verify exact", "TBD")
- `phone` either empty or starts with `+66`
- `website` either empty or is a valid `https://` URL (flag `http://`)
- `social.facebook` and `social.instagram` resolve to plausible handles (no spaces)
- `hours` is non-empty (or note "schedule-only" venues)
- `priceRange` uses ฿ characters consistently
- `description` is 80-180 chars (truncation risk for SEO)
- `tags` is a non-empty array
- `mapsUrl` resolves to a real Google Maps query
- `detailFile` exists on disk
- `verified` date is YYYY-MM-DD and not older than 60 days
- No duplicate `id`s
- No duplicate `name`s
- No duplicate normalized `address`es
- No duplicate `website`s

Aggregate counts + flagged records.

### D. styles.css review (every rule)

Open `styles.css` and read every rule. For each, note:
- Selector specificity — flag any `!important` (count + list)
- Unused selectors — for each `.classname` in CSS, grep HTML files to see if it appears. Report dead selectors. (e.g., `.venue-h1` is used by venue pages but `.cv-pill` might be dead.)
- Hard-coded colors that should use CSS variables
- Hard-coded font-family that bypasses the `--font-display` / `--font-body` tokens
- Hard-coded sizes that should use `--s-*` spacing tokens
- Animations that ignore `prefers-reduced-motion`
- Focus styles — verify `:focus-visible` is the modern target
- Hover-only interactions on touch contexts
- Tap targets ≥ 44px on mobile
- Cascade layer (`@layer`) usage — currently absent, flag missed opportunity

File-size budget: `styles.css` raw + gzipped. Flag if > 60KB raw.

### E. JS file review (every .js you ship to browsers)

For each of `app.js`, `app.bundle.js`, `site-ui.js`, `compare.js`, `favorites.js`, `recent.js`, `shortcuts.js`, `share.js`, `analytics.js`:
- `node --check` passes
- File is referenced from at least one HTML page (grep)
- Is it loaded async / defer / sync?
- Does it use modern syntax (optional chaining, nullish coalescing, async/await)?
- Does it depend on globals from data.js (e.g., `window.GYMS`, `window.CATEGORIES`)?
- Does it set up event listeners that get cleaned up properly?
- Does it use `localStorage` / `sessionStorage` (Cloudflare R2 / Pages-compatible)?
- Are there any `eval()`, `Function()`, or `innerHTML +=` patterns that bypass CSP?

Report: file size raw + gzip + presence on which pages.

### F. SEO meta tags — every page

For each of the 212 shipped HTML pages, programmatically verify:
- `<title>` exists, 20-65 chars, unique site-wide
- `<meta name="description">` exists, 80-165 chars, unique site-wide
- `<link rel="canonical">` exists, https, self-referential
- `<link rel="alternate" hreflang="en">` + `hreflang="x-default">` both present + match canonical
- Open Graph complete set: `og:title|description|image|url|type|locale|site_name`
- Twitter Card complete set: `twitter:card|title|description|image`
- `<meta name="viewport">` + `<meta name="theme-color" content="#000000">`
- `<html lang="en">`
- Exactly one `<h1>`
- Hreflang URL matches canonical URL

Aggregate: how many pages pass each check. Flag duplicates of any meta field.

### G. JSON-LD structured data — every block

For each shipped page, parse-validate every `<script type="application/ld+json">` block. Aggregate:
- Total blocks, parse errors (must be 0)
- Per page type, list `@types` present
- For venue `LocalBusiness`: required fields (`name`, `address`, `telephone`, `priceRange`, `openingHoursSpecification`), optional fields (`geo`, `email`, `sameAs`, `image`, `areaServed`)
- Validate against Google Rich Results criteria for LocalBusiness — would this venue qualify? Cite specific gaps.
- For `BreadcrumbList`: position numbering is correct, `item` URLs are absolute https
- For `ItemList`: `numberOfItems` matches array length
- For homepage `WebSite`: `SearchAction` template URL is functional
- For homepage `Organization`: `sameAs` array has at least 3 entries (the 3 sister sites)

Flag any schema where a required field is missing or has a placeholder ("Pattaya — verify").

### H. Sitemap + crawl directives

- Parse `sitemap.xml`, count `<url>` entries, verify well-formed XML
- Cross-check every sitemap URL → live 200 (sample at least 20 via `curl -I`)
- Cross-check every on-disk `index.html` → in sitemap. Flag any missing.
- Verify `sitemap.xml` is referenced from `robots.txt`
- Check `sitemap_index.xml` / `sitemap-index.xml` — if both exist, flag as duplicate
- Validate `_redirects` syntax. For each redirect, verify target file exists OR external URL returns 200/301.

### I. Internal + external link hygiene

- Walk every shipped HTML page. Extract every `href` and `src`. Categorize:
  - Internal (`/...` or relative)
  - External http://
  - External https://
  - Anchor (`#...`)
  - Protocol-relative (`//...`)
  - Mailto / tel / sms

For each:
- Internal targets exist on disk + return 200 on live site (sample-check via curl)
- Anchor targets have matching `id=` on same page
- `target="_blank"` external anchors have `rel="noopener noreferrer"` — count compliance
- `http://` references — flag as mixed-content risk
- `mailto:` and `tel:` href values are well-formed (this is where the recent Tara Tennis bug came from — `tel:+66951410568/+66879089800`)
- Duplicate `href` values within the same page (likely UX confusion)

Aggregate: total links, broken count by category.

### J. Accessibility (WCAG 2.1 AA, with AAA spot-checks)

- Skip-to-content link on every page (`<a class="skip-link" href="#main">`) — first body child
- `<main id="main">` landmark on every page
- Heading hierarchy: every page should have exactly one h1; h2-h6 in order with no skip. Flag h4 used as styling-only (was a Codex Round 2 finding).
- Buttons without aria-label AND without visible text
- Inputs without `<label>` or `aria-label` / `aria-labelledby`
- `<img>` without `alt` (decorative images should have `alt=""`)
- `<a>` with no accessible name
- Color contrast pairs (calculate exact ratios):
  - `--text` on `--bg` (AAA ≥ 7:1)
  - `--text-2` on `--bg` (AAA)
  - `--muted` on `--bg` (AA ≥ 4.5:1)
  - `--hint` on `--bg` (must be ≥ 4.5:1; was at 2.8:1 pre-Round-3 with `#555`, should be 5.92:1 now with `#888`)
  - Accent colors on `--bg`
- Focus styles: `:focus-visible` rule exists and is applied to interactive elements with sufficient outline
- Reduce-motion: `@media (prefers-reduced-motion: reduce)` pauses marquee animation
- ARIA: search inputs have `aria-label`, modals (if any) have `role="dialog"` + `aria-modal="true"`
- Tab order: tabindex usage — no `tabindex > 0`, no implicit traps
- Keyboard-only navigation: can a user reach every interactive element and dismiss any modal via Esc?

### K. Content integrity

- 158 venue MDs exist
- 158 detailFile pointers resolve correctly (this was the recent hotfix — verify it stuck)
- For each MD frontmatter: parses as strict YAML (PyYAML) without errors (5 were broken in Round 2, fixed in Round 3 — verify)
- Body word count per venue: min / median / P90 / max
- Venues with body < 500 words (thin content risk)
- Venues with empty `phone:` or `website:` in data.js
- Venues with vague/placeholder address
- Venues missing `sources:` frontmatter
- 5 oldest `verified:` dates
- Editorial consistency: Pratamnak vs Pratumnak (both intentional)
- British vs American spellings — flag mixed usage

### L. Build script behavioral testing (mental dry-run, not execution)

For each entry in `data.js`, walk through what `build-v2.js` would generate. For 3 sample venues + 1 category + 1 area + 1 utility:
- Title generation matches the spec (length, format)
- Description sourcing (data.js > frontmatter > generic fallback)
- OG image path: `/og/<id>.png` — flag if file missing
- Canonical URL is correct
- Breadcrumb items match URL structure
- LocalBusiness `@type` matches category (e.g., golf → `GolfCourse`, fitness → `ExerciseGym`)
- Phone → `tel:` sanitization runs

Sample at least: `fitz-club` (post-hotfix body verify), `fairtex-pattaya` (multi-session hours), `kombat-group-thailand` (resort camp), `siam-country-club` (golf), `pattaya-marathon` (event, was YAML-broken).

### M. Browser compatibility (static check)

Scan `styles.css` and `*.js` for features and report support cutoffs:
- `:has()` (Chrome 105, Safari 15.4, Firefox 121)
- `@layer` (Chrome 99, Safari 15.4, Firefox 97)
- `text-wrap: balance` / `pretty` (Chrome 114, Safari 17.5, Firefox 121)
- `container queries` `@container` (Chrome 105, Safari 16, Firefox 110)
- `aspect-ratio` — universal now
- Optional chaining `?.` — universal
- `??` nullish coalescing — universal
- Logical properties (`margin-inline`, `padding-block`)
- `prefers-reduced-motion` / `prefers-color-scheme`

Flag any `-webkit-` / `-moz-` prefixes that are no longer needed.

### N. Usability — UX-level audit

- Above-the-fold on 360px viewport: is the H1 + lede + primary CTA visible without scrolling?
- Information hierarchy: does the homepage answer "what is this site, who runs it, what's the value" in scroll-screen 1?
- Marquee speed: readable on desktop / mobile?
- Reading progress bar: visible but not distracting?
- Auto-generated TOC on long pages: works? scroll-spy highlights current section?
- Back-to-top button: visible after scrolling 600px, smooth scroll, accessible
- Hover-only affordances on mobile (no hover on touch) — flag any
- Tool pages — `/search/`, `/map/`, `/compare/`, `/plan-my-trip/`, `/find-my-coach/`, `/favorites/` — are they functional or are they still empty JS shells from Codex Round 2 finding P0-2?
- 404 page: on-brand + navigation back to main paths
- Mobile menu: works at <760px? all primary nav reachable?

### O. Security headers + CSP — fetch from production

Via `curl -I -L https://pattaya-gym.com/` and a few other URLs, verify response headers:
- `Strict-Transport-Security` with `preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Content-Security-Policy` — extract every `sha256-` hash, then scan all shipped pages for inline `<script>` bodies and compute their SHA-256. Every body's hash must be in CSP. Report any missing (would block in production) or stale (no longer needed).

Also check `.well-known/security.txt` presence.

### P. Performance (Lighthouse + static analysis)

This round, **run Lighthouse against production** if you can:

```bash
npx lighthouse https://pattaya-gym.com/ --only-categories=performance,seo,accessibility,best-practices --output=json --output-path=/tmp/lh-home.json --chrome-flags="--headless --no-sandbox"
npx lighthouse https://pattaya-gym.com/gyms/fairtex-pattaya/ --output=json --output-path=/tmp/lh-venue.json --chrome-flags="--headless --no-sandbox"
npx lighthouse https://pattaya-gym.com/category/muay-thai/ --output=json --output-path=/tmp/lh-category.json --chrome-flags="--headless --no-sandbox"
```

Extract from each JSON: LCP, CLS, INP (or TBT proxy), FCP, performance score (0-100), SEO score, accessibility score, best-practices score. Plus the top 5 opportunities + diagnostics per page.

If Lighthouse cannot be run in your environment, **say so explicitly and do static perf analysis instead**:
- Total HTML weight per page
- Total CSS (raw + gzipped)
- Total JS (raw + gzipped)
- Render-blocking resources per page
- LCP candidate (what's the largest element in the viewport?)
- Font loading strategy (Google Fonts with `display=swap`? self-hosted?)
- Inline critical CSS used?
- Image formats (PNG vs WebP vs AVIF) — sample OG images
- Image lazy loading (`loading="lazy"`) usage
- Service worker presence (currently absent — flag)

Either way, produce concrete numbers, not adjectives.

### Q. Image / asset audit

- `/og/<id>.png` — verify every 158 venue has its OG image, image dimensions are 1200×630 (or close), file size budget per image (flag > 200KB)
- `/og-image.png` — default
- Favicon: SVG data URI is fine but flag if PNG fallback missing
- Static image references in venue MD bodies — any broken `src=`?

### R. PWA / offline readiness

- Manifest file: `/manifest.json` — exists? has `name`, `short_name`, `start_url`, `display`, `icons` (192 + 512)
- Service worker: file present + registration script?
- Offline page strategy: any planned cache or just network-only?

### S. Migrated legacy page health check (24 pages)

The 17 guides + guides index + 6 tool pages were content-wrapped by a Python migration script. Inner CSS classes may not all exist in V2 `styles.css`. For 3 sample guides + 3 tool pages:
- Inspect rendered HTML and inventory all class names inside `<article class="venue-body">`
- Cross-check each class against `styles.css` selectors
- Report orphan class names (will render unstyled — browser defaults)
- Recommend either adding CSS rules or rewriting inner templates

### T. Specific prior-audit issues — current status

For each Codex Round 2 + Claude Round 2 finding, verify status:

**P0s (must be fixed):**
- index.html truncation — fixed?
- NUL byte corruption — fixed? (recurring artifact of Windows mount)
- package.json build script — points at build-v2.js?
- CSP sha256 hashes — current set covered?
- Malformed `tel:` links — sanitized via phoneToTel?
- Tool page JS — still missing (deferred to Round 5?)

**P1s:**
- Homepage canonical / hreflang / og:locale / twitter — all on?
- Homepage WebSite + Organization JSON-LD — present?
- BreadcrumbList on venue/category/area — all 179 pages?
- PostalAddress on venues — all 158?
- Sitemap completeness — 211 URLs?
- Schema telephone present (uses phoneToTel)?
- openingHoursSpecification — at least the venues with parseable hours?
- Title length — 20-65 chars compliance %?
- Footer v404 on all pages?
- Heading hierarchy — h4 → div in footer columns?
- rel="noopener noreferrer" — all external target=_blank?
- Card button-in-anchor — refactored?
- Skip-link — every page?

**P2s:**
- YAML-broken 5 venue MDs — fixed?
- `--hint` contrast — bumped to #888?
- `.nav-cta` min-height 44px?
- Backup zips in repo — still tracked?
- HTTP external URLs — converted to HTTPS or marked?
- HOTFIX: 141 orphan venue MDs — linked via detailFile?

### U. Git state + repo hygiene

- `git status` — uncommitted file count, untracked count
- Current commit on `main`, `redesign-2026` — should be identical post-hotfix
- `main-pre-v2-rollback`, `main-pre-round3-rollback`, `main-pre-hotfix2` tags — all present?
- Tracked backup archives / zip / tarballs — list any
- `.gitignore` covers `node_modules`, `.backups`, `*.tmp`, `*.log`, `*.zip`
- README documents the V2 build pipeline (not the old build.js chain)
- Stale documentation: any `.md` referencing pre-V2 architecture?

---

## 📦 Output format

Write to `C:\pattayagym\AUDIT_REPORT_NUCLEAR.md`:

```markdown
# pattaya-gym.com — Codex Nuclear Audit V2 (post-hotfix)
Date: <YYYY-MM-DD>
Auditor: Codex (read-only, every-line + Lighthouse)
Branch: <current branch>
HEAD: <short hash>
Live URL state confirmed: <timestamp of curl checks>
Lighthouse run: <yes/no, with output JSON paths if yes>

## TL;DR
4-6 sentences. Overall site health + the single biggest finding + top 3 priorities + state of Lighthouse scores (or static-perf summary if Lighthouse skipped).

## 🟢 Strengths (what's clean)
Bulleted with hard numbers ("158/158 venue body content links resolve correctly; median body 1,165 words").

## 🔴 P0 — Critical (ship-blockers or production-impacting)
Each: Title / Severity / Pages affected (count + 3 examples) / Evidence (file:line snippets, curl outputs) / Fix recommendation / Effort estimate.

## 🟠 P1 — High (fix this week)
Same format.

## 🟡 P2 — Medium (fix this month)
Same format.

## 🟢 P3 — Low / polish
Same format.

## 📊 Raw numbers
One Markdown table, 60+ rows: parity counts, JSON-LD counts, link-integrity counts, accessibility counts, content-integrity counts, performance numbers, security-header presence, etc.

## ⚡ Lighthouse per URL (if run)
For homepage, fairtex venue, muay-thai category: LCP / CLS / INP / FCP / TBT / performance score / SEO score / a11y score / best-practices score + top 5 opportunities per page.

If Lighthouse not run: state why + static-analysis perf table instead.

## 🔧 Recommended fix order
Numbered 1-25, biggest leverage first. Each line: title + estimated effort + P-level resolved.

## ⏭ Out-of-scope (deferred to round 5)
Tool page JS restoration if not handled this round. Image format optimization. Service worker implementation. Font subsetting.

## 📝 Notes for the next session
Anything weird that doesn't fit a clear bucket but might matter.
```

---

## 🚀 After writing

1. Save `C:\pattayagym\AUDIT_REPORT_NUCLEAR.md` (overwrite if exists).
2. Stop. No commits, no pushes, no code modifications.

## 🎯 Success criteria

- Every dimension A–U has at least one paragraph
- Severity buckets P0–P3 each have a finding OR explicit "(none)" marker
- Raw numbers table has **60+ rows**
- Recommended fix order has **20+ items**
- If Lighthouse can run, provide real numbers; if not, state why and give static analysis
- Cross-reference both local repo state AND live site state via `curl`
- Specifically verify all prior-audit findings are still resolved (don't re-open already-fixed P0s as new findings)
- File saved at `C:\pattayagym\AUDIT_REPORT_NUCLEAR.md`

Go.
