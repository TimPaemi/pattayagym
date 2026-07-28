# pattaya-gym.com — Claude Audit Report

**Date:** 2026-05-17
**Branch:** `redesign-2026`
**HEAD:** `b505d47` ("fix: stop hiding the main browser scrollbar (was applied globally via * selector instead of just internal scroll strips)")
**Working tree:** 18 modified files, 0 untracked
**Auditor:** Claude (read-only)

---

## TL;DR

The V2 redesign is **mostly clean and visually consistent across the 179 build-v2.js-generated pages** (1 homepage + 158 venues + 15 categories + 6 areas + 8 utility — black bg, Space Grotesk/Inter/JetBrains Mono, multi-color accents, marquee strips, chapter-numbered h2s, build timestamp, PA Authority badge, asset `?v=404`). The single biggest finding is **`index.html` is silently truncated to 16,437 bytes / 307 lines, ending mid-tag at `<span class="numcard-num">01</sp`** — it has no `</main>`, no bottom marquee, no PA Network section, no `<footer>`, and no `</body></html>`. This is the same "CI tokenizer" truncation pattern fixed in task #162, regressed. Right behind it, **`styles.css` has 4,104 trailing NULL bytes** (35,011 bytes of valid CSS + 4,104 NUL padding to 39,115 — every byte after the last `}` is `\x00`) — browsers tolerate this but it is the exact same null-byte corruption from tasks #159 and #163, and 6 other shipped HTML files have the same NUL-padding artifact (`404.html`, `about/index.html`, `contact/index.html`, `gyms/fairtex-pattaya/index.html`, `build.js`, `build-extras.js`). Top 3 priorities: **(1)** rebuild `index.html` from `build-v2.js` (or restore from the working version captured in the Read-tool cache); **(2)** strip trailing NULs from the 7 affected files and add a pre-push guard; **(3)** regenerate the **24 stale legacy pages** under `/guides/`, `/search/`, `/compare/`, `/map/`, `/plan-my-trip/`, `/find-my-coach/`, `/favorites/` — they still ship `?v=237`, Inter Tight font, the old `sf-builtby` footer, and a different "wordmark + icon-button" nav from the rest of the site.

---

## 🟢 What's clean

1. **158/158 venue pages** render the V2 design (black bg, Space Grotesk, marquee top + bottom, brand inline-dot mark, progress bar, back-to-top, PA Authority badge, build timestamp in footer, sticky nav, `?v=404` asset bust, GA `G-F5F6KD3XFZ`).
2. **15/15 category pages** + **6/6 area pages** + **8/8 build-v2 utility pages** (about, contact, methodology, press, add-your-gym, colophon, pattaya-sport-stats, 404) — same V2 consistency.
3. **JSON-LD coverage is solid where it exists**: 158/158 venues have valid `LocalBusiness`, 15/15 categories have valid `ItemList`. **Zero parse errors** across 179 JSON-LD blocks.
4. **Sitemap is internally consistent**: `sitemap.xml` lists 185 URLs (158 venues + 15 categories + 6 areas + 6 utility), and **all 185 resolve to a real `index.html` on disk** — no broken sitemap entries.
5. **All 158 OG images exist on disk** under `/og/<slug>.png`; root `/og-image.png` exists. No broken `og:image` references.
6. **`robots.txt` properly lists 7 sitemaps**, allows all major search + AI crawlers (Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot, etc.), and `_redirects` cleanly handles `www → apex`, 4 legacy gym 301s, 4 guide-rename 301s.
7. **Scrollbar scoping is correct** (the just-shipped fix): `styles.css:91-98` shows scrollbar-hide is scoped to `.row-scroll, .marquee, .nearby-row, .quick-chips`, NOT applied globally via `*`. Body uses `overflow-x: hidden; overflow-y: auto` (`styles.css:67-68`).
8. **Hero accent dot is a proper inline circle**: `styles.css:365-374` defines `.accent-dot { width: 0.18em; height: 0.18em; background: var(--cyan); border-radius: 50%; }`. No `class="accent-block"` exists site-wide.
9. **Marquee uses `width: max-content` + `translate3d` keyframe** (`styles.css:137-169`) with two `.marquee-set` blocks for seamless 50%-shift loop. `prefers-reduced-motion` disables it (`styles.css:1183-1186`).
10. **Chapter counter on venue body**: `styles.css:864-895` correctly applies `counter-increment: chapter` with `content: "Chapter " counter(chapter, decimal-leading-zero)` and 4-color cycle.
11. **Color contrast passes WCAG AA** for primary text on black: `--text #f5f5f5` (19.3:1 AAA), `--text-2 #c4c4c4` (12.0:1 AAA), `--muted #888` (5.92:1 AA).
12. **`node --check build-v2.js` and `node --check data.js` both pass.**
13. **158/158 venue MD files parse**, average **1,313 body words**, all carry a `verified:` date, 0 vague addresses except 1 borderline.
14. **No legacy artifacts in the V2-generated pages**: `class="accent-block"` = 0 hits, `styles.OLD.css/index.OLD.html/styles.new.css/index.new.html` = 0 files, the string `PATTAYA.GYM` (all-caps wordmark) appears only inside the CSS comment header (`styles.css:2`), nowhere user-visible.
15. **`build-v2.js` does not require any of `build.js`, `build-extras.js`, `build-discovery.js`** — clean separation, no accidental cross-imports.

---

## 🔴 P0 — Critical

### P0-1 — `index.html` is truncated mid-tag

- **Severity:** Critical (the homepage is broken HTML on disk).
- **Pages affected:** `index.html` (the live homepage).
- **Evidence:** `index.html` is **16,437 bytes / 307 lines**. Last 40 bytes:
  `<span class="numcard-num">01</sp` (file ends here — no `</span>`, no remaining numcards, no `</section>`, no `</main>`, no `<section class="pa-network">`, no `<div class="marquee marquee-bottom">`, no `<footer>`, no `</body></html>`). Confirmed via `python3 -c "open('index.html','rb').read()[-200:]"`.
- **Diagnostic:** This is the same regression as completed task #162 ("Repair truncated index.html — restore missing footer tail (CI tokenizer error)"). The current commit `b505d47` re-introduced it. (Note: the Read tool returns a longer cached version with full footer; the canonical filesystem state is the 16,437-byte truncated one.)
- **Fix:** Run `node build-v2.js` to regenerate from template (the `homepage()` function in `build-v2.js` is the source of truth — though browse `build-v2.js` to confirm a homepage template still exists, or restore via `git checkout HEAD~10 -- index.html` then re-apply nav/v404 tweaks).
- **Effort:** 5 min (rebuild) / 15 min (verify + push + add `scripts/verify.js` check).

### P0-2 — 7 text files corrupted with trailing NULL-byte padding

- **Severity:** Critical (browsers tolerate it but CDN/edge transforms and minifiers may not; same pattern that previously broke a deploy — task #159).
- **Files affected & null-byte count:**
  - `styles.css` — 4,104 trailing NULs (valid CSS bytes 0-35,010, NULs 35,011-39,114).
  - `404.html` — 9,468 trailing NULs (valid 0-9,473).
  - `about/index.html` — 7,060 trailing NULs.
  - `contact/index.html` — 5,140 trailing NULs.
  - `gyms/fairtex-pattaya/index.html` — 22,757 trailing NULs (only venue affected).
  - `build.js` — 330 trailing NULs (legacy, still on disk).
  - `build-extras.js` — 131 trailing NULs (legacy, still on disk).
- **Evidence:** `python3 -c "d=open('styles.css','rb').read(); print(d.count(b'\\x00'), d[-50:])"` → `4104 b'\\x00\\x00\\x00…'`. All 7 files terminate with valid content followed by a NUL run; no embedded NULs interrupting structure.
- **Fix:** `python3 -c "import sys; d=open(p,'rb').read().rstrip(b'\\x00'); open(p,'wb').write(d)"` per file, then commit. Add to `scripts/verify.js`: fail if any `.html`, `.css`, `.js` ends in `\x00`.
- **Effort:** 20 min (script + verify + commit).

### P0-3 — 24 legacy pages still shipping `?v=237`, Inter Tight font, and old footer

- **Severity:** Critical (visible visual mismatch on common pages: `/search/`, `/guides/`, `/map/`, `/compare/`, `/plan-my-trip/`, `/find-my-coach/`, `/favorites/` + all 17 guide listicles).
- **Pages affected:** `guides/index.html` + 17 guide subpages, `search/index.html`, `compare/index.html`, `map/index.html`, `plan-my-trip/index.html`, `find-my-coach/index.html`, `favorites/index.html` = 24 HTML files.
- **Evidence on `guides/index.html:268`:**
  - Stylesheets: `/styles.css?v=237` + `/venue.css?v=237` (rest of site is `?v=404`).
  - Font: `Inter+Tight:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500` (rest of site loads `Space+Grotesk + Inter + JetBrains+Mono`).
  - Footer contains: `<p class="sf-builtby">…Site built & managed by PATTAYA AUTHORITY · TIM PAEMI…</p>` — the legacy `sf-builtby` class explicitly called out as a regression flag in the audit brief.
  - Nav pattern: "wordmark + icon-button search" (matches the OLD pattern, while new pages use "wordmark + horizontal text-link nav + nav-cta").
- **Root cause:** `build-v2.js` regenerates only homepage, venue, category, area, and 8 utility pages. It has no template for `/guides/*`, `/search/`, `/compare/`, `/map/`, `/plan-my-trip/`, `/find-my-coach/`, `/favorites/`. Those are still output by `build-discovery.js` / `build-extras.js`, which are now syntax-broken (`node --check build-discovery.js` fails with "Unexpected end of input" at line 2577; `build-extras.js` and `build.js` fail with "Invalid or unexpected token" due to their own trailing NULs).
- **Fix:** Add templates for these 24 pages to `build-v2.js` (mirror utilityPage()), or delete `build.js`/`build-extras.js`/`build-discovery.js` and hand-port the 7 interactive pages + 17 guides into `build-v2.js`. As a stopgap: rename `sf-builtby` block to a V2-styled PA Authority badge and bump `?v=237` → `?v=404` site-wide.
- **Effort:** 4–8 hours (porting templates), or 30 min (stopgap CSS + version bump).

### P0-4 — index.html nav links point to non-existent anchors

- **Severity:** Critical (broken UX on the homepage).
- **Pages affected:** `index.html` only.
- **Evidence:** `index.html:60-65` nav lists `<a href="#sports">`, `<a href="#guide">`, `<a href="#areas">`, `<a href="#operate">`, `<a href="#contact">`. On-disk DOM has only `id="who"`, `id="declaration"`, `id="operate"`, `id="live"`, `id="sports"`, `id="areas"`. The `#guide` and `#contact` anchors don't exist; the truncation also removed any potential `#projects` and `#contact` sections that the Read-tool cached version showed at line 352/391.
- **Fix:** Replace `#guide` → `/guides/`, `#contact` → `/contact/` in the nav. Or restore the truncated tail which contains the `id="contact"` section.
- **Effort:** 2 min (after P0-1 is resolved this may auto-fix).

---

## 🟠 P1 — High

### P1-1 — Area pages have no JSON-LD at all

- **Pages affected:** All 6 `/area/*/index.html`.
- **Evidence:** `area/jomtien/index.html` — searched for `application/ld+json` → 0 hits. Compare to category pages (1 `ItemList` each) and venue pages (1 `LocalBusiness` each).
- **Fix:** In `build-v2.js`'s `areaPage()` function, add an `ItemList` JSON-LD (same shape as `categoryPage()`).
- **Effort:** 15 min.

### P1-2 — No `BreadcrumbList` JSON-LD on venue, category, or area pages

- **Severity:** High (Google rich-result eligibility loss).
- **Pages affected:** 158 venues + 15 categories + 6 areas = 179 pages. Note: visible HTML breadcrumb DOM IS present (`venue/index.html:44-46` etc.), but no machine-readable JSON-LD.
- **Evidence:** Scan of all 158 venue pages: `with_bc: 0` for `@type: BreadcrumbList`.
- **Fix:** Add a `BreadcrumbList` block to each builder template.
- **Effort:** 30 min.

### P1-3 — `FAQPage` JSON-LD removed despite visible FAQ DOM

- **Severity:** High (auto-FAQ schema was task #51 — completed in old build; lost in V2 rebuild).
- **Pages affected:** 158 venues + categories + areas (any page with `<h2>FAQ</h2>` body content).
- **Evidence:** Scan: `with_faq: 0` across all 158 venue pages.
- **Fix:** Build-v2 should detect FAQ-shaped headings in venue MD and emit `FAQPage` JSON-LD.
- **Effort:** 1 hour.

### P1-4 — Homepage missing `<link rel="canonical">`

- **Severity:** High (every other page has it).
- **Pages affected:** `index.html`.
- **Evidence:** `index.html:1-28` head block has no `<link rel="canonical">`. All 10 sampled subpages do (`gyms/*`, `category/*`, `area/*`, `about/`, `contact/`, etc.).
- **Fix:** Add `<link rel="canonical" href="https://pattaya-gym.com/">` after `<meta name="description">`.
- **Effort:** 2 min.

### P1-5 — 111 venues have empty `phone:` and 53 have empty `website:` in data.js + frontmatter

- **Severity:** High (these are the same blanks counted in task #111 — partially closed but 111 still empty).
- **Pages affected:** Counted across 158 MD files: 111 with empty phone, 53 with empty website.
- **Evidence:** `data.js` regex scan: 111 `phone: ""` entries, 53 `website: ""` entries. MD frontmatter mirrors the same gap (the build prefers `fm.phone || data.phone`, so empty in both layers means no contact CTA on the page).
- **Fix:** Continue the data-gap research from task #111. Stub-fallback CTA logic in `build-v2.js:355` already routes to WhatsApp/email when phone is missing — that's working, this is just a content-completeness item.
- **Effort:** Ongoing.

### P1-6 — No `prefers-color-scheme` light-mode handling; `--hint #555` fails contrast

- **Severity:** Medium-High (`--hint` used in footer-meta + footer-base hits 2.82:1 vs `#000` — below WCAG AA 4.5:1).
- **Pages affected:** All site (footer meta).
- **Evidence:** `styles.css:1054` `.footer-meta { color: var(--hint); }`, `styles.css:1082` `.footer-base { color: var(--hint); }`. `--hint: #555555` (styles.css:19) computes 2.82:1.
- **Fix:** Bump `--hint` to `#777777` (4.48:1, edge of AA) or `#888888` (matches `--muted`, 5.92:1).
- **Effort:** 1 min.

---

## 🟡 P2 — Medium

### P2-1 — Homepage has no `<link rel="canonical">`, no `BreadcrumbList`, no JSON-LD of any kind

- **Pages affected:** `index.html`.
- **Evidence:** 0 JSON-LD blocks. No `Organization`, no `WebSite` with `potentialAction: SearchAction`, no `BreadcrumbList`.
- **Fix:** Add `Organization` + `WebSite` JSON-LD with sitelinks search box.
- **Effort:** 15 min.

### P2-2 — No `<link rel="alternate" hreflang>` anywhere

- **Pages affected:** All 10 sampled — `hreflang: False`.
- **Evidence:** Site is English-only and Pattaya-focused, so this is not blocking — but `hreflang="en"` + `hreflang="x-default"` self-referential pair would help.
- **Effort:** 5 min in builder.

### P2-3 — No skip-to-content link on 7/8 sampled pages

- **Pages affected:** `index.html`, all venue pages, all category pages, all area pages, all utility pages. Only `search/index.html` (which is a stale legacy page) has the legacy skip-link.
- **Evidence:** `skip-link`, `skip-to`, `Skip to` not present in any V2 head. `<main id="main">` IS present on every page, so screen-reader skip-to-main is keyboard-implementable but the visual skip-link is missing.
- **Fix:** Add `<a class="skip-link" href="#main">Skip to content</a>` as first body child + CSS `:focus { … }`.
- **Effort:** 10 min.

### P2-4 — 29 on-disk pages NOT in sitemap.xml

- **Pages affected:** `/add-your-gym/`, `/colophon/`, `/compare/`, `/favorites/`, `/find-my-coach/`, all 17 `/guides/*`, `/map/`, `/pattaya-sport-stats/`, `/plan-my-trip/`, `/press/` + 3 node_modules false positives.
- **Evidence:** Disk crawl vs sitemap.xml diff (sitemap has 185, disk has 211 indexable, delta = 26 real pages + 3 node_modules junk).
- **Fix:** In `build-v2.js:generateSitemap()`, add `add-your-gym`, `colophon`, `compare`, `favorites`, `find-my-coach`, all 17 guide URLs, `map`, `pattaya-sport-stats`, `plan-my-trip`, `press`. (Node_modules should be `.gitignored` and not deployed.)
- **Effort:** 15 min.

### P2-5 — Venue H1 missing a space: `Fairtex Training CenterPattaya.`

- **Pages affected:** 158 venues.
- **Evidence:** `gyms/fairtex-pattaya/index.html:52-54`: `<h1>Fairtex Training Center<br><span class="accent-pink">Pattaya.</span></h1>` — visually fine due to `<br>` but text-extraction (and Lighthouse / a11y readers) yields `Fairtex Training CenterPattaya.` with no separating space.
- **Fix:** Add a space before the `<br>`, or insert ` ` between, or update CSS to use `display: block` instead of `<br>`.
- **Effort:** 5 min in `build-v2.js`.

### P2-6 — Old `build.js`, `build-extras.js`, `build-discovery.js` still present and `node --check` fails

- **Severity:** Medium (they're never invoked by V2 deploy, but they're 88KB / 87KB / 88KB of dead weight that's syntax-broken and confusing).
- **Evidence:** `node --check build.js` → `SyntaxError: Invalid or unexpected token at line 1794` (due to trailing NULs). Same for build-extras.js (line 1486) and build-discovery.js ("Unexpected end of input" at line 2577 — truncation, no NULs).
- **Fix:** Delete after migrating templates for /guides, /search, /compare, /map, /plan-my-trip, /find-my-coach, /favorites into `build-v2.js`.
- **Effort:** depends on P0-3.

### P2-7 — 3 zip archives accidentally committed

- **Pages affected:** Repo root has `pattayagym_source_2026-05-08_212753.zip` + `pattayagym_source_2026-05-08_212803.zip`; `.backups/pattayagym_source_2026-05-08_212722.zip` is tracked.
- **Evidence:** `git ls-files | grep '\.zip$'` returns 3 hits.
- **Fix:** `git rm` all three and add `*.zip` to `.gitignore`. Also `zirZ3Bwy` and `.backups/zii7NKzl` are 200KB binary blobs (truncated archives) — clean them too.
- **Effort:** 5 min.

### P2-8 — Two sitemap-index files (`sitemap-index.xml` vs `sitemap_index.xml`)

- **Evidence:** Both exist on disk. `robots.txt` references only `sitemap-index.xml` (dash). The underscore variant `sitemap_index.xml` is stale duplicate.
- **Fix:** Delete `sitemap_index.xml`.
- **Effort:** 1 min.

### P2-9 — Homepage missing bottom-marquee + PA Authority badge + footer (consequence of P0-1)

- Already covered by P0-1; will auto-resolve.

---

## 🟢 P3 — Low / polish

### P3-1 — `--pad: 22px` mobile / `40px` desktop; no `760px` breakpoint named in audit brief

- The brief mentions `@media (max-width: 760px)`. styles.css uses `max-width: 700px` (and min-width: 700/768/800/900). Behaviour is fine; just a naming/expectation gap.
- **Effort:** none if behavior works.

### P3-2 — Marquee animation duration 28s — slightly fast on wide monitors

- Subjective; `styles.css:140` `animation: marquee 28s linear infinite`. Consider 40s for 1920px+.
- **Effort:** 1 min.

### P3-3 — `<script>` for progress bar is inlined per page (158 + 24 copies)

- Each venue page repeats the same 12-line IIFE. Move to a `/site-ui.js` import.
- **Effort:** 20 min, saves ~300 bytes/page × 180 pages ≈ 54 KB transfer savings.

### P3-4 — Google Fonts loaded synchronously — render-blocking

- `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` blocks render. Already have `rel="preload"` for `/styles.css` but not fonts.
- **Fix:** Use `<link rel="preload" as="style" onload="this.rel='stylesheet'">` pattern or self-host woff2.
- **Effort:** 10 min.

### P3-5 — Inline SVG favicon is the same on every page (data URI repeats ~480 bytes × 187 pages)

- Move to a real `/favicon.ico` or `/favicon.svg` file.
- **Effort:** 5 min.

### P3-6 — All venues `verified:` between 2026-04-27 and 2026-04-29 (≥18 days stale)

- Editorial commitment is "weekly". Mass re-verification pass due.
- **Effort:** ongoing content task.

### P3-7 — `index.html:11` references `?v=404` but page itself has no canonical/ld+json — content auditors might mistake "v=404" for a 404 error.

- Cosmetic. Maybe bump to v405 next deploy.

### P3-8 — `feed.json` last entry (Sattahip) is 13,621 bytes — single-file RSS-like feed. Not referenced from any `<link rel="alternate">` in head.

- Add `<link rel="alternate" type="application/feed+json" href="/feed.json">` to head.
- **Effort:** 3 min.

### P3-9 — `humans.txt` ends without final newline (2281 bytes, last char `/`).

- Cosmetic.

### P3-10 — One vague-ish address in venue MD (length < 25 chars).

- Audit found 1/158 MDs with `address` < 25 chars. Likely a beach/landmark venue. Acceptable.

---

## 📊 Raw numbers

| Metric | Value |
|---|---|
| Branch | `redesign-2026` |
| HEAD short hash | `b505d47` |
| Uncommitted modified files | 18 |
| Untracked files | 0 |
| Total HTML pages on disk (excl. node_modules) | ~211 |
| Pages in sitemap.xml | 185 |
| Pages in sitemap.xml that resolve on disk | 185/185 (100%) |
| Pages on disk NOT in sitemap (real) | 26 |
| Venue MD files | 158 |
| Venue MDs parseable YAML frontmatter | 158/158 |
| Venue MD avg body word count | 1,313 |
| Venue MDs with body < 700 words | 0 |
| Venue MDs with body 700–1500 words | 140 |
| Venue MDs with body > 1500 words | 18 |
| Venue MDs with empty `phone:` | 111 |
| Venue MDs with empty `website:` | 53 |
| Venue MDs with vague/very short address | 1 |
| Verified-date range across all MDs | 2026-04-27 … 2026-04-29 |
| Days since oldest verified (audit date 2026-05-17) | 20 |
| Venue HTML pages | 158/158 |
| Category HTML pages | 15/15 |
| Area HTML pages | 6/6 |
| Build-v2 utility pages | 8 |
| Legacy non-v2 HTML pages (stale ?v=237 + sf-builtby) | 24 |
| OG images present | 158/158 |
| Pages with `<main id="main">` | 8/8 sampled |
| Pages with visible skip-to-content link | 1/8 (legacy search only) |
| Pages with single `<h1>` | 8/8 sampled |
| Pages with `viewport` meta | 8/8 sampled |
| Pages with `<html lang="en">` | 8/8 sampled |
| Pages with `hreflang` | 0/8 sampled |
| Pages with canonical | 7/8 (homepage missing) |
| Pages with theme-color `#000000` | 8/8 sampled |
| Pages with twitter:card | 8/8 sampled |
| JSON-LD blocks total | 173+ |
| Venue pages with valid LocalBusiness LD | 158/158 |
| Venue pages with FAQPage LD | 0/158 |
| Venue pages with BreadcrumbList LD | 0/158 |
| Category pages with ItemList LD | 15/15 |
| Category pages with BreadcrumbList LD | 0/15 |
| Area pages with any JSON-LD | 0/6 |
| JSON-LD parse failures | 0 |
| Build-v2.js `node --check` | OK |
| data.js `node --check` | OK |
| build.js `node --check` | FAIL (NUL bytes) |
| build-extras.js `node --check` | FAIL (NUL bytes) |
| build-discovery.js `node --check` | FAIL (truncation) |
| HTML/CSS/JS files with trailing NUL bytes | 7 |
| `styles.css` total bytes | 39,115 |
| `styles.css` valid bytes (NULs stripped) | 35,011 |
| `index.html` total bytes | 16,437 |
| `index.html` ends in `</html>` | NO |
| `index.html` ends in `</footer>` | NO |
| `index.html` ends in `</main>` | NO |
| `index.html` ends in NUL bytes | No (truncation, not NUL pad) |
| Homepage page weight (raw) | 16.4 KB |
| Venue avg page weight (raw / clean) | 22.2 KB / 22.1 KB |
| Venue page max | 75.4 KB (fairtex, NUL-padded) |
| Category avg page weight | 19.1 KB |
| Area avg page weight | 20.8 KB |
| Render-blocking `<link rel=stylesheet>` per page | 2 (site CSS + Google Fonts) |
| Preconnects per page | 2 |
| Preloads per page | 1 |
| Inline scripts per page | 1–4 |
| External scripts per page | 1 (GA) |
| Marquee `.marquee-set` blocks per page | 2 (top) + 2 (bottom) = 4 |
| `--text` contrast vs `--bg` | 19.26:1 (AAA) |
| `--text-2` contrast vs `--bg` | 12.04:1 (AAA) |
| `--muted` contrast vs `--bg` | 5.92:1 (AA) |
| `--hint` contrast vs `--bg` | 2.82:1 (FAIL) |
| `prefers-reduced-motion` rule present | Yes |
| Sticky nav present | All V2 pages |
| Brand inline-dot mark | Yes (V2 pages) |
| Asset version in V2 pages | `?v=404` |
| Asset version in legacy 24 pages | `?v=237` |
| Footer build timestamp on V2 pages | `2026-05-17 11:52 UTC` |
| Files with `sf-builtby` class | 24 HTML + 3 builders = 27 |
| `.backups/` zips committed | 3 |

---

## 🔧 Recommended fix order

1. **Restore `index.html`** — regenerate via `build-v2.js` (need to confirm builder has homepage template; if not, restore from git `HEAD~5..HEAD~15`).
2. **Strip trailing NULs from `styles.css`, `404.html`, `about/index.html`, `contact/index.html`, `gyms/fairtex-pattaya/index.html`** (5 production files; 2 legacy `build*.js` can be deleted instead). 1 Python one-liner per file.
3. **Add `scripts/verify.js` guard** that fails if any deployed text file ends in `\x00` or lacks `</html>`. Wire into pre-push.
4. **Add `<link rel="canonical">` to homepage.**
5. **Fix homepage nav anchors** (`#guide` → `/guides/`, `#contact` → `/contact/` — or restore the truncated contact section).
6. **Port the 24 legacy pages to `build-v2.js`** (guides, search, compare, map, plan-my-trip, find-my-coach, favorites). Visible visual mismatch with rest of site.
7. **Add `BreadcrumbList` JSON-LD to venue/category/area builder templates.**
8. **Add any JSON-LD to area pages** (currently 0). Use `ItemList` + `Place`.
9. **Add `FAQPage` JSON-LD** — detect FAQ headings in venue MD body and emit schema.
10. **Bump `--hint` from `#555` to `#888`** for WCAG AA on footer meta.
11. **Add `Organization` + `WebSite` (with SearchAction) JSON-LD to homepage.**
12. **Add `<a class="skip-link" href="#main">` to all V2 builders + matching CSS.**
13. **Add `add-your-gym`, `colophon`, `compare`, `favorites`, `find-my-coach`, all 17 guides, `map`, `pattaya-sport-stats`, `plan-my-trip`, `press` to `sitemap.xml` generator.**
14. **Add `hreflang="en"` + `hreflang="x-default"` self-referential pair to builder.**
15. **Delete `build.js`, `build-extras.js`, `build-discovery.js`, `sitemap_index.xml`, and the 3 committed `.zip` archives** + add `*.zip` to `.gitignore`.
16. **Fix venue H1 missing space** — change `${name}<br>...` to include a space or restructure as separate text nodes.
17. **Mass re-verify all 158 venues** — current oldest `verified:` is 20 days old; missing the weekly cadence.
18. **Self-host Google Fonts** or apply non-blocking preload pattern.
19. **Extract progress-bar + back-to-top inline script** into `/site-ui.js` referenced site-wide.
20. **Add `<link rel="alternate" type="application/feed+json" href="/feed.json">`** + bump `--text-shadow` glow halos for color-blind accessibility check.

---

## 📝 Notes

- The `Read` tool appears to deliver a cached or pre-truncation version of `index.html` (524 lines including a full footer + PA Network + 4-vertical projects grid + contact section). The canonical filesystem state — confirmed via `python3 open().read()` + `wc -l` + `ls -la` — is **307 lines, 16,437 bytes, terminating mid-tag**. If you see the homepage rendering fine in a browser today, the production deploy may be serving a different version (a CDN cached copy from before the truncation), masking the on-disk regression. Verify with `curl -s https://pattaya-gym.com/ | wc -c`.
- The "scrollbar visible" fix (commit `b505d47`) is correctly applied — `*::-webkit-scrollbar { display: none }` is gone, replaced with scoped selectors on `.row-scroll`, `.marquee`, `.nearby-row`, `.quick-chips`. Body has `overflow-x: hidden; overflow-y: auto` (browser scrollbar visible).
- Audit brief expected "All subpage navs use wordmark + 2 icon buttons (NOT old PATTAYA.GYM all-caps + horizontal text links)". Actual state is inverted: the V2 redesign uses **wordmark + horizontal text links + pink CTA pill** (see `index.html:56-68`, replicated on all gyms/category/area/about/contact pages), while the **legacy stale pages** (`/search/`, `/guides/`, `/map/`, etc.) use the older **wordmark + icon-buttons** pattern. So the audit-brief expectation is either inverted in the brief itself, or the V2 design intent shifted at some point — flagging for human review. Neither pattern uses the old "PATTAYA.GYM" all-caps wordmark (good).
- `pattaya-gym.com/og/<slug>.png` images have NULL bytes too (1,600–1,900 each), but those are PNG IDAT-compressed binary data — normal, not corruption.
- `gyms/fairtex-pattaya/` is the only venue page with NUL-padding. Likely it was hand-edited (it's in `git status` as modified) and the editor flushed extra zeros. Other 157 venue HTMLs are clean.
- `data.js` has no `'use strict'` and `node --check` passes — but the `require('./data.js')` call in `build-v2.js:30` depends on the module exporting `CATEGORIES` and `GYMS`. Confirmed present.
- The 8 pending tasks #7 (www subdomain) and #8 (Google Search Console) and #16 (push deep venue batch) are out-of-scope for this read-only audit.

— end of report —
