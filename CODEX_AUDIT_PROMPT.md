# CODEX — NUCLEAR AUDIT OF pattaya-gym.com

You are taking over the pattaya-gym.com production repo at `C:\pattayagym` (158-venue Pattaya, Thailand sports directory). Your job is to **audit every dimension of the site and write a single comprehensive audit report**. You do NOT make changes in this pass — only investigate and document. A follow-up prompt will tell you what to ship.

---

## ⚙️ Required first reads (before you start auditing)

1. `README.md` — project description, stack, npm scripts
2. `WORK_LOG_CODEX.md` — session history (read ALL entries, especially recent ones)
3. `CONTENT_AUDIT_2026-04-29.md` — past fact-check work
4. `CONTRIBUTING.md`, `EDITORIAL_STYLE_GUIDE.md`, `SCHEMA_REFERENCE.md` — editorial + schema conventions
5. `data.js` — 158-venue array + 16 categories
6. `validate.js`, `build.js`, `build-extras.js`, `build-discovery.js` — build chain
7. The output of `git log --oneline -20` and `git status` — recent history + uncommitted work

## 🛡 Constraints (do not violate)

- **Do not commit** `CODEX_NUCLEAR_PROMPT.md`, `CODEX_AUDIT_PROMPT.md`, `pattayagym_*.zip`, `pattayagym_*.tar.gz`, `BACKUP_MANIFEST_*.md`
- **Do not rename** URLs, venue IDs, category keys, area slugs, or guide slugs without a 301 redirect plan
- **Always run** `npm run validate` and `npm run build` before reporting clean state. Both must pass:
  - `Validation: 0 error(s), N warning(s)` (currently 164)
  - `Generated 158 venue pages (158 deep + 0 stubs)`
- **Atomic Python** for any bulk data.js or multi-file MD edits — the `Edit` tool has a known truncation bug on rapid sequential calls. Pattern: read full file → modify in memory → write whole file once.
- **No paid placements** — editorial integrity required
- The 158-venue, 0-stub invariant is **mandatory** in the build output

## 📋 What to audit (every single dimension)

### A. Validation + build integrity

- `npm run validate` exit code + error count + warning count + warning breakdown by type
- `npm run build` exit code + output (must say "Generated 158 venue pages (158 deep + 0 stubs)")
- `node --check` on every `.js` file (data.js, build.js, build-discovery.js, build-extras.js, validate.js, sw.js, app.js, compare.js, share.js, shortcuts.js)
- File truncation check — compare line counts of every critical file vs. `git show HEAD:<file>` for divergence > 5 lines
- Build idempotency — run build twice, hash gyms/ both times, confirm identical output
- Confirm `package.json` scripts work: validate, build, watch, serve, html:validate

### B. SEO meta (every page, 209 total)

- `<title>` present, 20-65 chars, unique across site
- `<meta name="description">` present, 80-165 chars, unique
- `<link rel="canonical">` present, self-referential and matches actual URL
- `<link rel="alternate" hreflang="en">` + `hreflang="x-default"` present
- `<meta property="og:title">`, `og:description`, `og:url`, `og:image`, `og:type`, `og:locale`
- `<meta name="twitter:card">`, `twitter:title`, `twitter:description`, `twitter:image`
- `<meta name="viewport">` and `<meta name="theme-color">` present
- `<meta http-equiv="x-dns-prefetch-control">` set
- `<html lang="en">` present
- Exactly one `<h1>` per page
- Hreflang URL matches canonical URL

### C. Structured data / JSON-LD

- Parse-validate every `<script type="application/ld+json">` block — count blocks, count parse errors
- Per page type, list which @types are present:
  - Venue pages: should have LocalBusiness + (variant: SportsClub/SportsActivityLocation/HealthClub/ExerciseGym/GolfCourse), FAQPage, BreadcrumbList, baseline WebPage
  - Category/area pages: ItemList + WebPage + BreadcrumbList
  - Guide pages: Article or CollectionPage + ItemList + FAQPage
  - Homepage: WebSite with SearchAction + Organization
  - Utility pages (about, contact, etc.): WebPage / AboutPage / ContactPage
- LocalBusiness required fields: `name`, `address`, `telephone`, `priceRange`, `geo`, `openingHoursSpecification`
- Aggregate stats: total JSON-LD blocks, parse errors, schema types observed, coverage 209/209

### D. Sitemaps + crawl directives

- `sitemap.xml` validity (parse via XML, count `<url>`)
- `sitemap_index.xml` validity (count `<sitemap>`)
- Segment sitemaps: `sitemap-core.xml`, `sitemap-venues.xml`, `sitemap-categories.xml`, `sitemap-areas.xml`, `sitemap-guides.xml` — all valid + total URLs match master
- Priority distribution: how many at 1.0 / 0.9 / 0.8 / 0.7 / 0.6 / 0.5
- Changefreq distribution: daily / weekly / monthly
- Every URL has `<lastmod>` in `YYYY-MM-DD`
- Cross-check: every sitemap URL corresponds to an actual `index.html` on disk, and every `index.html` on disk is in the sitemap
- `robots.txt` references `sitemap.xml` (verify)
- `_redirects` validity — every `301` line has correct syntax and target page exists or is intentional

### E. Internal links + duplicates

- Walk every HTML file, extract every `href="/..."`, verify target exists (skip protocol-relative `//maps.google.com` and JS template literals)
- Count incoming-link weight per URL — flag pages with < 5 incoming internal links
- Same-page `href="#anchor"` validity — each anchor must have matching `id=` on the page
- External `http://` (non-secure) `src=` references — flag any (mixed-content risk)
- Duplicate venue IDs in `data.js`
- Duplicate websites in `data.js` (same business, two records)
- Duplicate H1 strings across pages (cannibalization risk)
- Duplicate title tags across pages
- Duplicate meta descriptions across pages
- Duplicate normalized addresses in `data.js` (excluding vague "Pattaya — verify" placeholders)

### F. Content depth + quality

- Word count per venue MD (body text only, excluding frontmatter + code blocks)
- Pages with < 800 chars visible HTML text (thin content)
- Pages with < 500 words in body (might rank poorly)
- Number of venues with empty `phone:` and `website:` fields in `data.js`
- Number of venue MDs without `sources:` frontmatter
- Number of venues with vague placeholder address (`"verify exact"`, `"confirm at booking"`, just `"Pattaya"`)
- Verified date freshness — list 5 oldest `verified:` dates
- Editorial consistency: Pratamnak vs Pratumnak usage (per editorial style guide, both are intentional — Pratumnak preserved in official venue names, Pratamnak for prose)
- British vs American spellings — flag mixed usage if any

### G. data.js ↔ MD frontmatter consistency

- For every venue, compare data.js record vs `venues/<id>.md` frontmatter on these fields: `id`, `name`, `category`, `area`, `address`, `phone`, `website`, `priceRange`, `hours`, `description`
- Count mismatches per field
- List all mismatches with both values for human review

### H. Performance + page weight

- Page weight per page (HTML bytes) — min, median, P95, max
- Shared asset total size: styles.css + venue.css + app.js + data.js + compare.js + sw.js + shortcuts.js
- Shared asset gzipped size (sum of `gzip.compress` per file)
- Pages with inline critical CSS (should be 209/209)
- Pages with non-blocking stylesheet load (preload + onload swap, or media="print" trick)
- Plausible analytics coverage (should be 209/209)
- Service worker registration coverage
- OG image existence — every venue should have `/og/<slug>.png` and the default `/og-image.png`
- CSS file size + gzip ratio
- JS file size + gzip ratio
- Total bytes per page including referenced CSS+JS (uncompressed and gzipped estimates)

### I. Accessibility

- Skip-to-content link on every page (`#main` or `#main-content`)
- `<main id="main">` landmark on every page
- Buttons without aria-label AND without text content
- Form inputs without label (mask `<label>` blocks first to handle wrapped pattern; then check for `aria-label`, `aria-labelledby`, or matching `<label for="">` outside the mask)
- `<img>` tags without `alt` attribute
- `<a>` tags with no accessible name (no text + no aria-label + no title)
- Headings hierarchy — flag pages where h2 appears before any h1, or h3 before h2
- Color contrast — visual inspection of key surfaces (skip if not feasible without running the page)

### J. UI / UX (visual layer)

- Footer credit ("Pattaya Authority — Premium Web Design & SEO Studio") visible and rendering correctly on every page — check CSS class `.sf-builtby`, count coverage, verify the badge / wordmark / arrow render
- Nav layout intact — primary navigation accessible
- Search input has `aria-label`
- Form inputs have visible labels
- Newsletter signup card renders in footer
- Compare tool renders with correct state UI
- Map page loads Leaflet correctly (check for `unpkg.com/leaflet@1.9.4` references)
- Service worker `sw.js` has both cache logic and fetch handler
- PWA manifest fields: name, short_name, start_url, display, icons (at least 192x192 + 512x512)
- Mobile breakpoints in `styles.css` — check that responsive rules exist for <600px and <760px

### K. Security + headers

- `_headers` file present + check for: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, optionally `Permissions-Policy` and `Content-Security-Policy`
- `.well-known/security.txt` present
- No inline `eval()` calls in any HTML
- Count of inline `onclick=` / `onload=` handlers (these aren't security issues per se, but flag the count)
- All external links use `rel="noopener"` when `target="_blank"`
- HTTPS canonical URLs (no http://)

### L. Editorial / fact-check status

- Read `CONTENT_AUDIT_2026-04-29.md` — list all rows still marked "Pending external check"
- List all rows marked "Flagged" with the reason
- Count venues whose `verified:` date is older than 30 days

### M. Categories + areas + guides coverage

- 16 categories — confirm each has at least 2 venues
- Each category has its own /category/<key>/ page generated
- 6 areas — each has its own /area/<slug>/ page
- 17 guides currently (per build output); confirm all guide slugs are valid
- Suggest 3-5 long-tail guide ideas not yet covered (audit the existing guides + venue tags to spot gaps)

### N. Backups + git state

- Git status: uncommitted file count, untracked file count
- Local backup files in project root (`pattayagym_*.zip`, `pattayagym_*.tar.gz`, `BACKUP_MANIFEST_*.md`) — these exist and are .gitignored or untracked
- HEAD commit hash + branch + ahead/behind status

### O. Speed / Core Web Vitals indicators (static-analysis only)

- Largest CSS file size — flag if any > 50KB raw
- Largest JS file size — flag if any > 25KB raw  
- Total render-blocking resources per page (count `<link rel="stylesheet">` without `media="print"` or `as="style"` preload pattern)
- LCP candidate per page type (which element is likely the LCP — usually `.venue-h1` or hero text)
- Font loading strategy — `font-display: swap` present? (likely uses system fonts only — flag confirmed)

### P. Specific known-issue check (verify these are still fixed)

Per `WORK_LOG_CODEX.md`, these should be in a known-fixed state — verify:

- Jetts Royal Garden Plaza branch closure documented (May 2022 closure, body + frontmatter)
- Deep Climbing Gym hours: `Mon-Fri 10:30-19:00; Sat-Sun 10:30-19:30` (not mall hours)
- Muscle Factory hours: `Mon-Fri 07:00-24:00; Sat-Sun 07:00-23:00`
- Khao Chi Chan opening time: `06:00` (not 08:00)
- Bangpra International postcode: `20110` (not 20210)
- Wong Amat Beach length: `1.5 km` (not 4 km)
- Ocean Marina building range: `274/1-9` (not 274/1-3)
- af-academy-football: 301 redirect in `_redirects` to af-academy-pattaya
- Mermaids Dive: phone `+66 38 303 333`, website `mermaidsdivecenter.com`
- All footer credit pages link to `https://pattaya-authority.com/`
- All 158 venue pages have BreadcrumbList JSON-LD

## 📦 Output format

Write your audit to `C:\pattayagym\AUDIT_CODEX_<YYYY-MM-DD>.md` with the following structure:

```markdown
# Codex Nuclear Audit — <date>

## TL;DR

3-5 sentences describing overall site health + the single biggest finding.

## 🟢 Strengths (what's clean)

Bulleted list of dimensions that pass. Include actual numbers (e.g., "473 JSON-LD blocks, 0 parse errors").

## 🟡 Findings ranked by impact

Each finding gets a sub-section with:
- **Severity**: Critical / High / Medium / Low
- **Pages affected**: count + examples
- **Evidence**: the data showing the issue
- **Fix recommendation**: concrete steps a developer would take
- **Effort estimate**: 5 min / 30 min / 2 hr / 1 day

## 📊 Raw numbers (one big table)

A single Markdown table with every metric from sections A-P above.

## 🔧 Recommended fix order

A numbered list of 10-20 fixes in execution order, biggest-leverage first.

## 📝 Notes for the next session

Anything weird you noticed that isn't yet a clear "fix this" item but might matter later.
```

## 🚀 After writing the audit

1. Save the file to `C:\pattayagym\AUDIT_CODEX_<YYYY-MM-DD>.md` (replace date with today's date)
2. Append a short entry to `WORK_LOG_CODEX.md` noting:
   - Date
   - Section: M (audit) — read-only investigation, no code changed
   - Files changed: just `WORK_LOG_CODEX.md` + the new `AUDIT_CODEX_*.md`
   - Validate + build status (confirmed pre-audit; should be 0 errors / N warnings / 158 deep)
   - Top 3 findings summary
   - Pointer: "next session can read AUDIT_CODEX_<date>.md and execute the recommended fix order"
3. **Do not commit anything.** Tim will commit + push from his Windows terminal.

## 🧭 If you encounter issues during the audit

- **`fatal: unknown index entry format ...`** — git index is corrupted. Note this in the audit, do not attempt to fix from the sandbox. Tim will run `del .git\index && git reset` from Windows.
- **Edit tool truncating files** — switch to atomic Python rewrites (read full file → modify → write once).
- **Build times out** — note in the audit; investigate which build stage is slow.
- **MCP / connector errors** — log them and continue with whatever the sandbox can do.

## 🎯 Success criteria

The audit is "successful" when:
1. Every dimension A-P has at least one paragraph of findings (positive or negative)
2. The "Recommended fix order" has at least 10 items
3. The "Raw numbers" table has at least 30 rows
4. `npm run validate` passes (0 errors)
5. `npm run build` passes (158 deep + 0 stubs)
6. No production code was modified (the audit is pure read-only investigation)
7. The new `AUDIT_CODEX_<date>.md` file exists and is comprehensive
8. The work log entry is appended

Go.
