# CODEX — NUCLEAR AUDIT V3 (SEO + Lighthouse + Quality + Pattaya Ranking Chances)

You are the deepest and most thorough auditor we've ever had on this project. Your mission is to assess **pattaya-gym.com** from every angle that matters for ranking, converting, and outlasting competitors in the Pattaya sports-directory niche. This is the most comprehensive read-only audit yet — bigger and more rigorous than every prior round combined.

**Repository:** `C:\pattayagym`
**Live production:** `https://pattaya-gym.com`
**Preview deploy:** `https://redesign-2026.pattayagym.pages.dev`
**GitHub:** `https://github.com/TimPaemi/pattayagym`
**Current branch / HEAD:** check `git log --oneline -1` and `git status` first

You produce **one** comprehensive report at `C:\pattayagym\AUDIT_NUCLEAR_V3.md` and stop. A human (not you) executes the fix order afterward.

---

## 🛡 Hard rules (do not violate)

1. **STRICT READ-ONLY.** No `Edit`, `Write`, `git add`, `git commit`, `git push`, no `node build-v2.js`, no `npm run build`, no modifications to any source code. Allowed: file reads, grep, `git status`/`log`/`diff`/`show`, `node --check`, `wc`, `find`, `head`/`tail`, `curl -I`/`curl -L`/`curl -sS`, `python3` for analysis, `npx lighthouse` if your sandbox supports headless Chrome, `npx html-validate` (validation output only — don't auto-fix), web searches if available (for competitor research).

2. **No scope drift.** The V2 design system (black bg, multi-color neon accents, marquee strips, `pattaya<cyan-dot>gym` brand mark, Space Grotesk + Inter + JetBrains Mono fonts, asset version `?v=405`) is locked. Audit execution against the spec; don't propose redesigns.

3. **No URL renames** in recommendations without a 301 redirect plan. Production has been live and crawled; URL changes cost equity.

4. **158-venue invariant** must hold. Flag any drift.

5. **Don't auto-commit anything**, including this prompt and your output report.

6. **Don't speculate; verify.** If you can't actually run a check (e.g., Lighthouse fails in your environment), say so explicitly and substitute static analysis. Don't fabricate numbers.

7. **Don't re-open already-fixed P0s as new findings.** Verify prior-round fixes are still in place via the relevant cross-check (Section X).

---

## ⚙️ Context — what's shipped through Round 4

- **HOTFIX**: 141 orphan venue body MDs linked via `detailFile` in data.js. All 158 venues now render full body content (median 1,165 words).
- **Round 3**: Schema-rich rebuild — `BreadcrumbList`, `PostalAddress`, `openingHoursSpecification`, `phoneToTel()` sanitization, 211-URL sitemap, 24 legacy pages migrated.
- **Round 4 P0s**: Homepage truncation repaired; `styles.css` brace fixed; `.back-to-top.is-visible` + `.skip-link` + `prefers-reduced-motion` restored; asset version bumped `404`→`405`; CSP rewritten with 3 active hashes (gtag + venue-TOC + back-to-top) + Cloudflare Insights origin; new `scripts/verify-deploy.js` deploy guard added.
- **Round 4 follow-up**: `/search/` rebuilt with V2 styles + dedicated `/search-page.js` (live client-side filter). May still need Cloudflare cache purge to fully propagate.

**Required first reads** (in order):
1. `README.md`
2. `index.html`
3. `build-v2.js`
4. `data.js`
5. `styles.css`
6. `search-page.js`
7. `package.json`
8. `_headers`
9. `_redirects`
10. `robots.txt`
11. `sitemap.xml`
12. `AUDIT_REPORT_NUCLEAR.md` (Codex Round 4 audit)
13. `AUDIT_REPORT_LIVE.md` (Codex Round 2 audit)
14. `AUDIT_CLAUDE.md` (Claude Round 2 audit)
15. `scripts/verify-deploy.js`
16. `git log --oneline -25`
17. `git remote -v`
18. `git tag --list`

---

## 🎯 Audit dimensions (read every one — comprehensive)

### A. Local-vs-live integrity check

For each URL below, `curl -s -L` and compare against the local file (after stripping Cloudflare Email Address Obfuscation noise — which is the known acceptable diff). Report byte deltas, HTTP status, key response headers (Content-Type, Cache-Control, ETag, X-Robots-Tag), and any deviation. Flag if Cloudflare is serving stale immutable assets.

- `/`
- `/styles.css?v=405` (key — this should be the fresh post-Round-4 stylesheet)
- `/data.js?v=405`
- `/search-page.js?v=405`
- `/gyms/fairtex-pattaya/`
- `/gyms/fitz-club/` (1,873-word body after hotfix)
- `/gyms/sityodtong-pattaya/`
- `/gyms/lumpinee-boxing-stadium/`
- `/gyms/kombat-group-thailand/`
- `/category/muay-thai/`
- `/category/fitness/`
- `/category/golf/`
- `/area/jomtien/`
- `/area/east-pattaya/`
- `/area/pratamnak/`
- `/about/`
- `/contact/`
- `/methodology/`
- `/press/`
- `/guides/best-muay-thai-pattaya/`
- `/guides/best-dive-operators-pattaya/`
- `/search/`
- `/search/?cat=muay-thai` (deep link)
- `/sitemap.xml`
- `/robots.txt`
- `/404.html`
- `/_headers` (curl `-I` + verify CSP, HSTS, COOP, CORP, Permissions-Policy, Referrer-Policy, X-Frame-Options, nosniff are all present)

Output: parity table with raw bytes, normalized bytes (after stripping CF email rewrite), and Pass/Fail.

### B. Technical SEO — every page

For each of 212+ shipped HTML pages, programmatically verify:

- **Title**: present, 30-60 chars optimal (20-65 acceptable), unique site-wide, includes primary keyword + brand
- **Meta description**: 110-155 chars optimal (80-165 acceptable), unique, includes secondary keyword + CTA
- **Canonical link**: present, HTTPS, self-referential, matches actual URL
- **Hreflang**: `en` + `x-default` both self-referential
- **OG complete set**: `og:title|description|image|url|type|locale|site_name`
- **Twitter complete set**: `twitter:card|title|description|image|site` (if applicable)
- **Viewport meta**: present with `width=device-width, initial-scale=1`
- **theme-color**: `#000000`
- **html lang**: `en`
- **Charset**: `utf-8`
- **Robots meta**: present, `index, follow, max-image-preview:large, max-snippet:-1`
- **x-dns-prefetch-control**: set
- **Exactly one h1** per page
- **Heading hierarchy**: no h2→h4 skips, etc.
- **Internal anchor** integrity: every `href="#anchor"` resolves to a matching `id=`
- **Image alt**: every `<img>` has alt (decorative = `alt=""`)
- **JSON-LD**: parse-validates, includes appropriate `@type`s per page type

Aggregate: pass-rate per check, list of stragglers.

### C. Local SEO for Pattaya specifically

This is the differentiator. Audit local SEO signals against what would help us rank in Pattaya search:

- **LocalBusiness schema completeness**: for each venue, presence of `name`, `address` (PostalAddress with streetAddress + addressLocality + addressRegion + postalCode + addressCountry), `telephone`, `priceRange`, `openingHoursSpecification`, `geo` (GeoCoordinates), `areaServed`, `image`, `url`, `sameAs`. Coverage % per field across 158 venues. Currently missing: geo (0/158), most telephones, ~half of openingHoursSpecification.
- **NAP consistency**: name, address, phone format consistency across data.js + frontmatter + rendered HTML + footer credit + contact page. Same business name everywhere?
- **Geographic targeting**: pages explicitly mentioning "Pattaya" + neighborhood ("Jomtien", "Naklua", "Pratamnak", "Central Pattaya", "East Pattaya", "Sattahip") with frequency analysis. Are area pages keyword-targeted?
- **Neighborhood content depth**: word count per area page, internal link count to area pages, area-specific content beyond venue lists
- **Local intent keywords coverage**: scan content for variations like "gym near Walking Street", "Muay Thai camp Jomtien", "best fitness Pratamnak", "Pattaya 24 hour gym", "padel courts Pattaya", "diving Sattahip"
- **Map embed**: are venue pages linking to Google Maps via `mapsUrl`? Could embeds improve local relevance signals?
- **Currency / language localization**: ฿ (Thai Baht) symbol used consistently? English-only OK for this audience, but flag missed multilingual opportunity
- **Postal codes**: how many venue addresses include a valid Thailand postal code (20150, 20110, etc.)?

### D. Content SEO — depth, freshness, semantic relevance

- **Body word count distribution** per page type (homepage, venue, category, area, guide, utility). Median, P10, P90.
- **Thin content flags**: pages < 500 words or with < 1,500 bytes of meaningful body text
- **Keyword density / TF-IDF**: for each venue page, what's the primary keyword cluster? Are venue names + category + area mentioned naturally enough?
- **Semantic richness**: do venue pages include related entities (e.g., "Muay Thai" pages mention "kru", "ring", "pad work", "sparring", "clinch")?
- **Internal linking depth**: count of incoming internal links per URL. Pages with < 5 incoming links are SEO-orphaned. Map the linking graph.
- **Outbound link quality**: external links to authoritative sources (Wikipedia, Google Maps, venue official sites, governing bodies like WMC/IFMA for Muay Thai)?
- **Content freshness signals**: `verified:` date in frontmatter, `<time datetime>` markup, last-updated visible in footer
- **Editorial quality**: spot-check 10 random venue MDs for grammar, factual accuracy, tone consistency, sentence variety, use of strong vs weak verbs
- **Pratamnak/Pratumnak spelling**: confirmed both intentional per style guide — flag if a 3rd variant appears
- **British vs American English**: flag mixed spellings ("center"/"centre", "color"/"colour", "favorite"/"favourite")

### E. Lighthouse — Performance, Accessibility, Best Practices, SEO

**Run real Lighthouse against production if your sandbox supports headless Chrome:**

```bash
npx lighthouse https://pattaya-gym.com/ \
  --only-categories=performance,seo,accessibility,best-practices \
  --output=json --output-path=/tmp/lh-home.json \
  --chrome-flags="--headless --no-sandbox"

npx lighthouse https://pattaya-gym.com/gyms/fairtex-pattaya/ \
  --output=json --output-path=/tmp/lh-fairtex.json \
  --chrome-flags="--headless --no-sandbox"

npx lighthouse https://pattaya-gym.com/gyms/fitz-club/ \
  --output=json --output-path=/tmp/lh-fitz.json \
  --chrome-flags="--headless --no-sandbox"

npx lighthouse https://pattaya-gym.com/category/muay-thai/ \
  --output=json --output-path=/tmp/lh-muaythai.json \
  --chrome-flags="--headless --no-sandbox"

npx lighthouse https://pattaya-gym.com/area/jomtien/ \
  --output=json --output-path=/tmp/lh-jomtien.json \
  --chrome-flags="--headless --no-sandbox"

npx lighthouse https://pattaya-gym.com/search/ \
  --output=json --output-path=/tmp/lh-search.json \
  --chrome-flags="--headless --no-sandbox"

npx lighthouse https://pattaya-gym.com/guides/best-muay-thai-pattaya/ \
  --output=json --output-path=/tmp/lh-guide.json \
  --chrome-flags="--headless --no-sandbox"
```

Also run a **mobile** preset for the homepage and one venue:
```bash
npx lighthouse https://pattaya-gym.com/ \
  --preset=mobile --output=json --output-path=/tmp/lh-home-mobile.json \
  --chrome-flags="--headless --no-sandbox"

npx lighthouse https://pattaya-gym.com/gyms/fairtex-pattaya/ \
  --preset=mobile --output=json --output-path=/tmp/lh-fairtex-mobile.json \
  --chrome-flags="--headless --no-sandbox"
```

For each run, extract:
- Performance score (0-100)
- SEO score
- Accessibility score
- Best Practices score
- **Core Web Vitals**: LCP, CLS, INP (if available), FCP, TBT, Speed Index, TTI
- **LCP candidate element** (what's the largest element painted?)
- **CLS attributions** (which DOM nodes shifted?)
- **Top 5 perf opportunities** (savings in KB/ms)
- **Top 5 perf diagnostics**
- **All accessibility audits with score < 1**
- **All best-practices audits with score < 1**
- **All SEO audits with score < 1**

If Lighthouse cannot run, **say so explicitly** and substitute deep static analysis:
- Total page weight per page type (HTML bytes)
- Total CSS raw + gzipped
- Total JS raw + gzipped (including data.js — that's loaded on /search/)
- Render-blocking resources per page (count `<link rel="stylesheet">` without `media="print"` or preload pattern)
- LCP candidate guess (largest text or image element in viewport)
- Font loading strategy (Google Fonts CDN with `display=swap`? self-hosted?)
- Inline critical CSS present?
- Image lazy loading (`loading="lazy"`) usage
- OG image dimensions + file size sample (5 random venues)

Either way, produce concrete numbers.

### F. Mobile experience deep-check (360 / 414 / 768)

- `<meta name="viewport">` correctness on every page
- CSS media query breakpoints: which widths are explicitly handled? (Codex Round 2 said styles.css has `@media (max-width: 700px)` but not 600/760/900)
- Tap targets ≥ 44×44px on mobile: `.btn`, `.nav-cta`, `.sf-pill`, `.numcard`, icon buttons
- Mobile menu functionality: is the nav usable at <760px? Hamburger? Stacked?
- Horizontal scroll: is `overflow-x: hidden` set on body, OR are wide elements (marquees, scroll-rows) properly contained?
- Mobile typography scale: heading sizes don't overflow
- Touch-friendly form controls: inputs ≥ 16px font-size to prevent iOS zoom
- Mobile Lighthouse perf score (target: ≥ 75)

### G. Accessibility — WCAG 2.1 AA (with AAA spot-checks)

- **Skip-to-content link** on every page (first body child, only visible on `:focus-visible`)
- **`<main id="main">` landmark** on every page
- **Heading hierarchy**: no skipped levels (h2→h4)
- **Color contrast pairs** (compute exact ratios):
  - `--text #f5f5f5` on `--bg #000` (AAA target ≥ 7:1)
  - `--text-2 #c4c4c4` on bg (AAA)
  - `--muted #888` on bg (AA target ≥ 4.5:1)
  - `--hint #888` on bg (was `#555` pre-Round-3, should now pass AA)
  - Each accent color (pink #ff2e7e, cyan #4ee0ff, yellow #fde047, mint #5fffa0, red #ff3d3d) on black
  - White on pink CTA buttons
- **Focus styles**: `:focus-visible` rule exists and applies a visible outline (preferably with `outline-offset`)
- **Reduce motion**: `@media (prefers-reduced-motion: reduce)` pauses marquees + animations
- **Touch / pointer events**: no hover-only interactions on touch devices
- **ARIA**: search input has `aria-label`, forms have proper labels, landmarks are correctly typed
- **Keyboard navigation**: tab order is logical, no `tabindex > 0`, all interactive elements reachable
- **Screen reader spot-checks**: read out the homepage structure mentally — does it make sense without visuals?
- **Image alt text quality**: descriptive, not "image" / "picture" / "photo"

### H. JSON-LD structured data — every block

- Parse-validate every `<script type="application/ld+json">` block site-wide
- Aggregate counts by `@type`: LocalBusiness, SportsActivityLocation, ExerciseGym, HealthClub, GolfCourse, SportsClub, BreadcrumbList, ItemList, WebPage, AboutPage, ContactPage, CollectionPage, WebSite, Organization, SearchAction, FAQPage (currently 0 — flag), Article (currently 0 — flag)
- **Google Rich Results eligibility check**: for a sample venue page, run mentally against [Google's Rich Results criteria](https://developers.google.com/search/docs/appearance/structured-data/local-business). Would this venue qualify for the Local Business rich result? Cite specific gaps (geo, telephone, opening hours).
- **Homepage WebSite + SearchAction**: does the SearchAction `urlTemplate` actually work? Test: hit `/search/?q=fairtex` and verify it loads
- **Organization sameAs**: does the homepage's Organization graph link to all sister sites (pattaya-authority.com, pattaya-restaurant-guide.com, pattayavisahelp.com)?
- **BreadcrumbList**: position numbering correct, `item` URLs are absolute https
- **ItemList**: `numberOfItems` matches actual array length

### I. Sitemap + crawl directives

- Parse `sitemap.xml`, count `<url>` entries (target: 211)
- Cross-check every sitemap URL → live 200 (sample at least 20 via `curl -I`)
- Cross-check every on-disk `index.html` → present in sitemap. Flag missing.
- `robots.txt` references `sitemap.xml`? Allows all major search + AI crawlers (Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot, Anthropic-AI, Google-Extended)?
- `_redirects` validity: every 301 source has a target that exists OR is a documented external URL
- Duplicate sitemap files (`sitemap-index.xml` vs `sitemap_index.xml`) — Codex Round 2 P3-1 flagged both exist
- `<lastmod>` dates: are they fresh (within 30 days)?
- `<priority>` distribution: homepage 1.0, key category/area pages 0.9, venue pages 0.8, utility 0.5?
- `<changefreq>` consistency

### J. Internal + external link hygiene

- Walk every shipped HTML page. Categorize every `href` and `src`. Count:
  - Internal `/...`
  - External `https://`
  - External `http://` (mixed-content risk — Codex Round 2 said 18 still exist)
  - Anchor `#...`
  - Mailto / tel / sms
- For internal: verify target exists on disk + returns 200 live
- For anchors: every `#x` has a matching `id="x"` on same page
- For external `target="_blank"`: count compliance with `rel="noopener noreferrer"` (Codex Round 2 said 6 social links missing `noreferrer`)
- For `tel:`: verify all sanitized — no extensions, parens, multi-numbers (Codex Round 2 confirmed 0 malformed, but re-verify)
- For `mailto:`: well-formed
- Duplicate `href` instances on the same page (count, identify patterns — usually nav/footer repetition)

### K. Competitor analysis — Pattaya niche

If your sandbox can do web search, look up the actual current Google SERP for these queries (mark your search date):

1. **"gyms in pattaya"** — who ranks page 1? List top 10 domains, type (directory / aggregator / individual venue site / agency / blog).
2. **"muay thai pattaya"** — top 10.
3. **"best gym pattaya"** — top 10.
4. **"fitness pattaya"** — top 10.
5. **"golf pattaya"** — top 10.
6. **"pattaya yoga"** — top 10.
7. **"24 hour gym pattaya"** — top 10.
8. **"pattaya muay thai camps"** — top 10.

For each SERP, identify:
- How many results are aggregator directories vs individual venue sites
- Domain authority signals (TripAdvisor, BookMuayThai, MuayThaiCitizen, etc.)
- Common content patterns winners use (lists vs single-page reviews, with prices, with reviews)
- **Pattaya.gym's likely current rank** (your best estimate based on content/SEO state — flag honest assessment)
- **Content gaps** vs page-1 winners (what do they have that we don't?)
- **Structural advantages** Pattaya.gym has (158 verified venues > any single competitor; hand-checked; independent; no paid placements)

If web search isn't available, **say so explicitly** and skip Section K — but flag this as a high-value research deliverable for the next round.

### L. Keyword opportunity map

For each of the 15 categories × 6 areas = 90 long-tail combinations, plus known intent variations:

- "**[category]** in **[area]** Pattaya"
- "best **[category]** Pattaya"
- "**[category]** near **[landmark]** Pattaya"
- "cheapest **[category]** Pattaya"
- "English-speaking **[category]** Pattaya"
- "24-hour **[category]** Pattaya"
- "**[category]** for beginners Pattaya"
- "family-friendly **[category]** Pattaya"
- "**[category]** with accommodation Pattaya"

For each, scan current site content to see if a dedicated page or guide targets the keyword. Identify **gaps** = high-value keywords with no targeting page. Estimate search volume tier (high / medium / low based on Pattaya population + tourist volume).

### M. E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)

- **Experience**: do venue pages cite first-person verification ("we visited", "we trained here", "Tim trained at...")?
- **Expertise**: are technical sport terms used correctly (Muay Thai: kru, wai khru, mongkon, prajioud, clinch, teep, etc.)?
- **Authoritativeness**: editorial policy page exists? Methodology page exists? Bylines? About page with operator photo + bio?
- **Trustworthiness**: contact info easy to find? Privacy policy? Terms of service? "Last verified" dates? Sources cited in venue MDs? Disclosure of relationships (none — confirmed)?
- **Founder photo / signature**: would a "Meet Tim & Paemi" section with photos add E-E-A-T?
- **Verifiability**: can a user fact-check a venue's claims? Are external sources linked?

### N. AI search readiness (LLM crawlers + RAG eligibility)

- `llms.txt` present? Updated? Includes pointers to api/venues.json, sitemap.xml, structured data?
- `robots.txt` allows ChatGPT (GPTBot), Claude (ClaudeBot, Anthropic-AI), Perplexity (PerplexityBot), Google AI (Google-Extended)
- Structured data quality for AI consumption (LLM extraction is easier with rich schema.org)
- API endpoint quality: is `/api/venues.json` clean, complete, machine-readable?
- OpenAPI / OAS spec present?
- Content quality for AI extraction: are venue facts isolated (one fact per sentence)?

### O. Visual quality + V2 design adherence

For each page type (homepage + venue + category + area + utility + guide + search), verify:
- Black bg, V2 font stack (Space Grotesk + Inter + JetBrains Mono)
- Top + bottom seamless marquee (duplicated `.marquee-set`, `width: max-content`)
- `pattaya<cyan-dot>gym` brand mark (small inline circle dot, not square)
- Multi-color accents (pink, cyan, yellow, mint, red)
- Chapter-numbered h2s where applicable
- V2 footer with `v405` build version + Pattaya Authority badge
- Sticky nav: wordmark + horizontal nav links + pink CTA pill
- Reading progress bar at top
- Back-to-top button after scroll
- Skip-to-content link (focus only)
- Cache-buster `?v=405` on all stylesheet refs

Flag any visual regression, orphan class names (Codex Round 2 P2-5 mentioned: `cat-venue-card`, `cv-pill`, `favorite-btn`, `venue-cat-pill`, `bc-sep` etc. without CSS coverage), unstyled elements.

### P. Tool page functional state (search / map / compare / plan-my-trip / find-my-coach / favorites)

- `/search/` — should now work with V2 design + live filter (Round 4 follow-up). Test live: type query, click pills, change filters. Verify result cards render.
- `/map/` — does Leaflet load? Are venue markers placed? Map page functional or empty shell?
- `/compare/` — can users compare venues side-by-side? Does the page have working JS?
- `/plan-my-trip/` — interactive or static stub?
- `/find-my-coach/` — interactive or static stub?
- `/favorites/` — does localStorage-based favoriting work? Or is it dead JS?

For each: if dead, recommend either functional restoration OR convert to honest static guidance.

### Q. Build pipeline + repo hygiene

- `node --check` passes on: `build-v2.js`, `data.js`, `search-page.js`, `app.js`, `app.bundle.js`, `site-ui.js`, `compare.js`, `favorites.js`, `recent.js`, `shortcuts.js`, `share.js`, `analytics.js`, `scripts/verify-deploy.js`
- Build determinism: would `node build-v2.js` produce byte-identical output twice in a row? (Don't run it — just inspect for non-determinism: `Date.now()`, `new Date()` calls outside intended TIMESTAMP, random IDs)
- Repo size: total `.git` size, working tree size, biggest files
- Tracked archive artifacts (`.backups/*.zip`, `pattayagym_*.tar.gz`, `BACKUP_MANIFEST_*.md`) — count, recommend `.gitignore`
- `.gitignore` corruption (Codex Round 2 mentioned NUL/UTF-16-looking duplicate tail) — verify
- README accuracy: does it document the V2 build pipeline (`node build-v2.js`), V2 design system, current asset version, and deploy flow?
- Stale documentation: any `.md` file referencing old `build.js` chain that should be updated

### R. Security + headers

- Live response headers (via `curl -I https://pattaya-gym.com/` and a venue URL): HSTS preload, X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, COOP, CORP, CSP
- CSP completeness: inline-script hashes match all current `<script>` bodies on shipped pages (the verify-deploy.js does this — confirm)
- `.well-known/security.txt` exists + has Contact + Preferred-Languages
- `.well-known/ai-plugin.json` — for AI agent discovery
- No inline `onclick=` / `onmouseover=` handlers (count)
- HTTPS canonical URLs everywhere (no `http://`)
- Subresource Integrity (SRI) for external scripts (Google Fonts, Plausible, Google Analytics)?

### S. Image / asset audit

- `/og/<id>.png` for every venue: dimensions 1200×630, file size, format
- Default `/og-image.png`: exists, dimensions, file size
- Favicon: SVG data URI quality + fallback PNG
- Image lazy loading: `loading="lazy"` on below-fold images?
- Image format optimization: PNG vs WebP vs AVIF — flag missed compression opportunities
- Broken image refs (404s in HTML)

### T. PWA + offline readiness

- `/manifest.json`: required fields (name, short_name, start_url, display, theme_color, background_color, icons 192 + 512)
- Service worker file present? Registration? Cache strategy?
- Offline page strategy

### U. Migrated legacy guide/tool page health

The 17 guides + guides index + 6 tool pages were chrome-wrapped in Round 2. Inner classes like `cat-venue-card`, `cv-pill`, `favorite-btn`, `venue-hero`, `venue-lede`, `search-filter-panel`, `map-layout`, `channel-*` etc. may not have V2 CSS coverage.

For 3 sample guides + 3 tool pages:
- Inventory all class names inside `<article class="venue-body">` or `<main>`
- Cross-check each against `styles.css`
- Report orphan class names (rendered with browser defaults)
- Recommend: either add CSS rules, rewrite inner templates with V2 primitives, or delete orphan classes from markup

### V. Prior-audit finding verification (don't re-open fixed issues)

Verify status of every prior P0 / P1 / P2 from:
- AUDIT_REPORT_LIVE.md (Codex Round 2)
- AUDIT_CLAUDE.md (Claude Round 2)
- AUDIT_REPORT_NUCLEAR.md (Codex Round 4)

For each, mark: **Fixed** / **Partially fixed** / **Regressed** / **Still open**. Don't list resolved items as fresh findings.

### W. Editorial content fact-check spot-checks

Sample 10 random venue MDs. For each, identify 3 specific facts (hours, prices, founding year, head trainer, championship claims). Where possible, cross-reference with the venue's own website (via `curl` of g.website) to flag discrepancies.

If your sandbox can't do external HTTPS fetches reliably, document this and skip — flag for next round.

### X. Ranking probability assessment — bottom-line answer

After all the above, give your **honest assessment**:

1. **Where does pattaya-gym.com currently rank** (estimated) for the 8 head queries in Section K? (low / mid / high — be specific)
2. **What are the top 5 levers** that would move us 5+ positions in the next 90 days?
3. **What are the top 5 risks** (technical, content, or competitive) that could block ranking gains?
4. **Realistic 6-month outlook**: with current content depth + technical SEO state + assuming P0/P1 fixes ship, can we reasonably target page 1 for **"muay thai pattaya"**, **"gyms in pattaya"**, or **"pattaya muay thai camps"**?
5. **Single biggest unlock**: if you could change one thing about the site to maximize ranking probability in Pattaya, what would it be?

Be straight. Don't sugarcoat. Don't undersell either. The owner (Tim) is technical enough to handle honest assessments.

---

## 📦 Output format

Write to `C:\pattayagym\AUDIT_NUCLEAR_V3.md`:

```markdown
# pattaya-gym.com — Codex Nuclear Audit V3 (SEO + Lighthouse + Pattaya Ranking)
Date: <YYYY-MM-DD>
Auditor: Codex (read-only, deepest pass yet)
Branch: <current branch>
HEAD: <short hash>
Live site state confirmed: <timestamp of curl checks>
Lighthouse run: <yes/no — if no, why>
Competitor research run: <yes/no — if no, why>

## TL;DR
6-10 sentences. Overall site health + estimated current ranking for top queries + single biggest unlock + top 3 ship-now priorities + realistic 6-month outlook.

## 🎯 Ranking Probability Assessment (Section X synthesis)
Direct answers to the 5 questions in Section X. No hedging.

## 🟢 Strengths Confirmed
Bulleted with hard numbers. Specifically call out what gives pattaya-gym.com a structural ranking advantage (158 verified venues, independent / no paid placements, schema-rich, etc.).

## 🔴 P0 — Critical (ship now, ranking-impacting)
Each: Title / Severity / Pages affected (count + 3 examples) / Evidence (file:line snippets + curl outputs + Lighthouse audit IDs) / Fix recommendation / Effort estimate / Ranking impact rationale.

## 🟠 P1 — High (ship this week)
Same format.

## 🟡 P2 — Medium (ship this month)
Same format.

## 🟢 P3 — Low / polish
Same format.

## ⚡ Lighthouse Results (per URL, mobile + desktop)
Comprehensive table: Page / Strategy / Perf / SEO / A11y / Best-Practices / FCP / LCP / CLS / INP / TBT / Speed Index / Top 3 opportunities / Top 3 diagnostics.

If Lighthouse couldn't run: substitute static-perf table here.

## 🔍 SERP Competitor Analysis (Section K)
Per query: top 10 domains, our likely current rank, content gap analysis, structural advantages.

If web search unavailable: skip + flag.

## 🗺 Keyword Opportunity Map (Section L)
Table of 90+ long-tail combos. Columns: keyword / has dedicated page? / current targeting strength / search volume tier / priority.

## 📊 Raw Numbers Table (80+ rows)
Every metric from sections A–U.

## 🔧 Recommended Fix Order (30+ items)
Numbered, biggest leverage first. Each: title + estimated effort + P-level + ranking impact rationale.

## 🏗 What to build vs what to fix
Distinguish between BUG fixes (broken things) and FEATURE additions (new content/pages/schema). Prioritize accordingly.

## ⏭ Out-of-scope (defer to round 6)
Anything that would require human creative input (new editorial content, photoshoots, video) or external dependencies (Google Business Profile setup, backlink outreach).

## 📝 Notes for next session
Anything weird that didn't fit a clear bucket but matters strategically.

## 🎬 Closing — Tim's question answered
"Can we actually rank in Pattaya?" — one paragraph straight answer.
```

---

## 🚀 After writing

1. Save `C:\pattayagym\AUDIT_NUCLEAR_V3.md` (overwrite if exists)
2. Stop. No commits, no pushes, no code modifications.

---

## 🎯 Success criteria

The audit is "successful" when:

1. **Every dimension A–X has at least one paragraph** of findings
2. **Severity buckets P0–P3 each have findings OR explicit "(none)" markers**
3. **Lighthouse ran against ≥ 5 URLs** if your sandbox supports it (else explicit "skipped because X" + static perf substitute)
4. **Section K competitor analysis is done** with at least 4 of 8 head queries researched (else "skipped" + flag for next round)
5. **Section L keyword opportunity map** has ≥ 50 entries
6. **Section X ranking probability assessment** has direct answers to all 5 questions
7. **Raw numbers table has 80+ rows**
8. **Recommended fix order has 30+ items**
9. **No production code modified**
10. **Final file lives at `C:\pattayagym\AUDIT_NUCLEAR_V3.md`**
11. **Prior-audit findings are reconciled** (Section V) — don't re-open already-fixed P0s

---

## 🧭 If you encounter issues

- **Lighthouse fails** — note the error, fall back to static perf analysis, don't fabricate scores
- **Web search unavailable** — skip Section K, flag for next round
- **Mid-attribute truncation found** — flag in P0; the verify-deploy.js guard should have caught it pre-push, so if it shipped, that's a regression
- **NUL bytes in any file** — flag in P0; same guard issue
- **Cloudflare cache stale** — note in P1; recommend cache purge from dashboard
- **Lighthouse times out** — try with `--max-wait-for-load=30000`
- **Sandbox network restrictions** — document, skip the dimensions that need network, prioritize static-analysis sections

---

This is the deepest audit we will run before the next major content push. Take your time. Be thorough. Be honest. Be specific. Give Tim something he can act on for the next 90 days.

Go.
