# pattaya-gym.com — Nuclear Codex Prompt

You are taking over a live production website. Read this entire document carefully before writing a single line of code. The work is broad and the bar is high — go through every section, fix every issue, and finish in a state where the site is genuinely production-ready for SEO, mobile, desktop, accessibility, performance, conversion, and content.

---

## PART 1 — Project context

**Site:** pattaya-gym.com — a comprehensive directory of every gym, Muay Thai camp, dive operator, golf course, racquet club, kids' academy, watersports school, hotel fitness club, sports medicine venue, and cultural-sport landmark in Pattaya, Thailand.

**Tech stack:**
- Static HTML/CSS/JS — no build framework (no React/Next/etc.)
- Custom Node.js build chain: `build.js` → `build-extras.js` → `build-discovery.js`
- Source content: YAML frontmatter + Markdown body in `venues/*.md` (158 files)
- Data layer: `data.js` (158 venue records as JS array)
- Output: `gyms/<slug>/index.html` per venue + 13 category pages + 6 area pages + 8 best-of guides + homepage + utility pages
- Hosted on Cloudflare Pages, auto-deploys from GitHub repo TimPaemi/pattayagym on push to main

**Current state — what's working:**
- 158 deep venue pages (~10–22KB each)
- 8 best-of guides (best Muay Thai, cheapest gyms, luxury sports clubs, 24-hour gyms, family-friendly, best for beginners, best dive operators, best golf courses)
- 13 category landing pages (muay-thai, fitness, golf, yoga, racquet, watersports, swimming, climbing, clubs, kids-youth, equestrian, crossfit, adventure)
- 6 area landing pages (Jomtien, Naklua, Pratamnak, East Pattaya, Central Pattaya, Sattahip)
- Brand/utility: about, add-your-gym, search (full-text JS), compare (4-venue side-by-side), map (Leaflet), 404, guides hub, RSS feed
- 195 total indexed pages, 825+ FAQPage schema entries
- Existing UX features: sticky nav, back-to-top button, jump-to anchor nav on long venue pages, auto-FAQ on every venue (5 Qs each), homepage spotlight (recently-verified venues), 5-column footer with 35 internal links per page, auto-cross-linking between venue body content, scroll progress bar, sticky mobile action bar (Map/Call/Site/Compare/Share), drop cap on first venue paragraph, TL;DR auto-extract, "open now" badge using parsed hours + Bangkok time, reading-time estimate, per-category SVG decorative art on hero blocks
- SEO foundation: canonical URLs, OG/Twitter cards, JSON-LD WebSite/LocalBusiness/FAQPage/BreadcrumbList/ItemList schemas, sitemap.xml (170+ URLs), robots.txt with sitemap reference, RSS feed at /feed.xml with auto-discovery `<link rel="alternate">` on every page, hreflang missing (English-only)

**Current state — what's BROKEN:**
1. **CRITICAL — Live homepage is empty.** Stats show "—" instead of venue count, spotlight grid empty, directory grid empty. Cause: `index.html` was truncated mid-line by a buggy editor; the closing tags AND the `<script src="data.js">` and `<script src="app.js">` tags were cut off. Local file was repaired in last session — verify it's still intact before doing anything else.
2. **Outdated venue count copy** scattered across pages saying "138+" or "98+" — should reference the current count from `data.js` `GYMS.length`.
3. **No real OG images.** Every page references the same generic `/og-image.jpg` which may not even exist on the server. Social sharing looks bad.
4. **Performance not optimized.** No `preload` for critical CSS, no `font-display: swap`, no image optimization (no images yet anyway), no minification, no critical-path CSS inlining.
5. **Accessibility gaps.** No skip-to-content link. Some interactive elements missing ARIA labels. Color contrast not audited. Focus states not consistently styled.
6. **Mobile-only issues.** Sticky nav scrollable on mobile but the scroll affordance isn't visible. Some hero text wraps awkwardly under 380px. Jump-to pill row can overflow on narrow screens.
7. **Search page** doesn't preserve scroll position on filter change.
8. **Compare tool** loses state if you navigate away mid-selection.
9. **404 page** could include search box + popular pages.
10. **No newsletter/email capture.** Visitors who like the directory can't subscribe.
11. **No analytics.** No Google Analytics, no Plausible, no Cloudflare Web Analytics — flying blind.
12. **No www → apex redirect.** Both serve the site without canonical-redirect rules.

**Persistent risk to be aware of:**
The previous AI session experienced repeated file-truncation bugs from its editor — `data.js`, `build.js`, `index.html`, `venue.css`, and others were truncated mid-line and committed in broken states. Cloudflare deployed broken builds. Always verify file integrity (proper closing tags, balanced braces, valid syntax) BEFORE committing. Run `node build.js` after any change to scripts/data and confirm it generates 158 pages cleanly.

---

## PART 2 — Files of interest

```
C:\pattayagym\
├── index.html                         ← homepage (static, hand-written)
├── data.js                            ← 158 venue records + 16 categories
├── app.js                             ← homepage JS (filters, search, spotlight, sticky nav)
├── styles.css                         ← global styles
├── venue.css                          ← per-venue page styles (loaded after styles.css)
├── share.js                           ← PG.share() social sharing helpers
├── compare.js                         ← PG.compare floating widget + localStorage
├── build.js                           ← venue page generator (chains build-extras + build-discovery)
├── build-extras.js                    ← category landings + map + about + 404 + robots.txt + RSS
├── build-discovery.js                 ← area landings + guides + search + add-your-gym
├── sitemap.xml                        ← auto-generated, 170+ URLs
├── feed.xml                           ← auto-generated RSS feed (30 most-recent venues)
├── robots.txt                         ← with sitemap reference
├── 404.html                           ← friendly not-found page
├── compare/index.html                 ← 4-venue side-by-side comparison tool (static + JS)
├── search/index.html                  ← full-text search page (generated)
├── map/index.html                     ← Leaflet interactive map (generated)
├── about/index.html                   ← brand authority page (generated)
├── add-your-gym/index.html            ← venue submission form (generated)
├── guides/index.html                  ← guides hub (generated)
├── guides/<8 guide slugs>/index.html  ← 8 best-of guides (generated)
├── category/<13 category slugs>/index.html ← category landings (generated)
├── area/<6 area slugs>/index.html     ← area landings (generated)
├── gyms/<158 venue slugs>/index.html  ← 158 venue pages (generated from venues/*.md)
├── venues/*.md                        ← 158 source markdown files (frontmatter + body)
└── READABILITY_WORK_LOG.md            ← previous session's audit log (read for context)
```

---

## PART 3 — Hard rules (do NOT violate)

1. **Do not break the build.** After EVERY change, run `node build.js` and confirm it outputs `Generated 158 venue pages (158 deep + 0 stubs)` with no errors. If it fails, fix the cause before continuing.
2. **Do not remove SEO content.** Preserve every keyword, every internal link, every canonical URL, every meta description, every structured-data block. Add freely; remove only what is genuinely broken.
3. **Do not change URLs/slugs.** All venue slugs, category keys, area slugs, and guide slugs are stable. Renaming any breaks Google indexing and external links.
4. **Do not touch `data.js` records carelessly.** Every venue object has exact field names (`id`, `name`, `category`, `area`, `address`, `phone`, `website`, `social`, `hours`, `priceRange`, `description`, `tags`, `mapsUrl`, `verified`). Adding fields is fine; renaming is not.
5. **Verify file integrity after every edit.** Use `wc -l`, `tail`, `node --check` (for JS), and the build script itself. Suspect any file shorter than expected.
6. **Preserve existing schema markup.** WebSite, LocalBusiness, FAQPage, BreadcrumbList, ItemList — all must continue to validate at https://search.google.com/test/rich-results.
7. **Mobile-first responsive design.** Every change must work on a 360px-wide phone viewport. Test by resizing the browser to ~375px before committing visual changes.
8. **Single source of truth for venue count.** Replace hardcoded "138+", "98+", or any specific count with `${GYMS.length}` (build-time) or runtime JS reads.
9. **No external CDN-loaded assets unless already used.** Current site uses Leaflet via CDN on the map page. Do not add jQuery, React, Alpine, Bootstrap, etc.
10. **Do not introduce a build framework.** This is a vanilla Node script chain. No webpack, no Vite, no Parcel, no esbuild.

---

## PART 4 — Work breakdown (the nuclear list)

Work through these sections in order. Each item is a discrete task — complete it, verify it, commit it (with a clear message), continue to the next.

### Section A — Critical bug fixes (do FIRST)

**A1.** Verify `index.html` is intact. Last 8 lines should include `</footer>`, `<script src="data.js"></script>`, `<script src="app.js"></script>`, `</body>`, `</html>`. If anything is missing, append it. Hardcoded venue count in the quick-answer block should read `158+` (or be replaced with dynamic JS write).

**A2.** Audit every file in the repo for truncation. For each file, check the last line ends as expected:
- HTML: `</html>`
- JS: matching brace + `;` or `();`
- CSS: matching `}`
- MD: complete sentence + frontmatter closed

For any file ending mid-line, restore from `git show HEAD:<file>` if HEAD has a clean version, or rebuild from source. Do not commit truncated files.

**A3.** Run `node build.js` and confirm clean build. If it errors, fix the root cause before doing anything else.

**A4.** Replace every hardcoded venue count (`138+`, `137+`, `98+`, etc.) with either:
- A build-time substitution (preferred for static HTML — generate index.html from a template that injects `${GYMS.length}`)
- A runtime JS write (acceptable for sections rendered by app.js)

Search across all files: `grep -rn "138+\|137+\|98+\|130+\|125+\|120+" .` — fix every occurrence.

**A5.** Audit and fix any orphaned `gyms/<slug>/index.html` files that don't correspond to a `data.js` entry. Run:
```bash
ls gyms/ | sort > /tmp/dirs
node -e "var d=require('./data.js'); console.log(d.GYMS.map(g=>g.id).sort().join('\n'))" > /tmp/data
diff /tmp/dirs /tmp/data
```
Either delete the orphans or add them back to data.js if they're real venues that fell out.

### Section B — SEO (technical)

**B1.** Add a real `og-image.jpg` (or `og-image.png`) at the root. Generate it as a 1200×630px PNG with the brand mark + tagline ("Every Gym & Sport in Pattaya"). Reference from every page's `<meta property="og:image">`. Use a deterministic SVG-to-PNG generator (Sharp + node-canvas if available, or pre-rendered).

**B2.** Per-page OG images. For every venue page, generate a 1200×630px image with: venue name (large), category pill, brand mark in corner. Reference per-venue via `<meta property="og:image">`. Save under `og/<slug>.png` and update `build.js` to emit the right tag per page. If image generation infrastructure is too complex, at minimum vary the OG description per page (which is already done).

**B3.** Add `hreflang` for English: `<link rel="alternate" hreflang="en" href="https://pattaya-gym.com/<page>" />` and `<link rel="alternate" hreflang="x-default" href="https://pattaya-gym.com/<page>" />` on every page.

**B4.** Add proper LocalBusiness schema to every venue page including:
- `address` as PostalAddress with `streetAddress`, `addressLocality: "Pattaya"`, `addressRegion: "Chonburi"`, `addressCountry: "TH"`, `postalCode` if known
- `geo` as GeoCoordinates with `latitude`/`longitude` (use placeholder Pattaya coords 12.9236, 100.8825 if exact not known — flag as TODO for manual update)
- `telephone`
- `url` (the venue's website)
- `image` (per-venue OG image when generated)
- `priceRange` mapped to dollar signs ($, $$, $$$, $$$$)
- `openingHoursSpecification` parsed from the `hours` string when possible

**B5.** Add Service schema to relevant venues (SportsClub, HealthClub, ExerciseGym, GolfCourse, etc. — pick the appropriate Schema.org type per category):
- Muay Thai → SportsActivityLocation + SportsClub
- Fitness → HealthClub or ExerciseGym
- Golf → GolfCourse
- Yoga → HealthAndBeautyBusiness or YogaStudio
- Climbing → SportsActivityLocation
- Watersports → SportsActivityLocation

**B6.** Add `<link rel="preload" href="/styles.css" as="style">` and same for `/venue.css` on venue pages. Defer non-critical JS.

**B7.** Add Cloudflare Web Analytics or Plausible (or both). Free, privacy-friendly, no cookie consent banner needed. Lightweight (~1KB).

**B8.** Configure www → apex redirect in Cloudflare Pages settings (or via `_redirects` file at root): `/* https://pattaya-gym.com/:splat 301`. Document in README.

**B9.** Write `_headers` file at root with:
- `Cache-Control: public, max-age=86400` for HTML
- `Cache-Control: public, max-age=31536000, immutable` for /styles.css /venue.css /app.js /data.js /share.js /compare.js (use cache-busting via query string when these change — `data.js?v=158` style)
- Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

**B10.** Add a real `humans.txt` and `security.txt` at `/.well-known/` for trust signals.

**B11.** Submit updated sitemap.xml to Google Search Console + Bing Webmaster Tools after deploy. Document the verification meta tags in README.

### Section C — SEO (content)

**C1.** Review and improve the `<title>` and `<meta description>` of every generated page. Goals:
- Title: 50–60 chars, includes primary keyword + brand
- Description: 150–160 chars, contains a compelling action + secondary keyword + USP

Audit current outputs. Many will be too long, too short, or duplicate.

**C2.** Add internal-link anchor text variation. Currently many internal links are repeated literal venue names. Vary phrasing: "Sityodtong Pattaya", "the Sityodtong camp", "this 1959 Naklua camp", etc. Helps long-tail SEO without keyword stuffing.

**C3.** Add 5 more high-search-volume best-of guides:
- Pattaya for digital nomads (fitness routines for working travelers)
- Pattaya for women (female-friendly gyms, safety, single-female-traveler tips)
- Best Pattaya gyms with childcare / family pools
- Pattaya seniors (65+) — low-impact options
- Best Pattaya Thai-language gym terms guide (sport vocabulary cheat sheet)

Wire each into `build-discovery.js` GUIDES array with filter, rank, sections, faqs.

**C4.** Add a "How we research and verify" methodology landing page at `/methodology/`. Boost authority and E-E-A-T signals.

**C5.** Add a "Pattaya sport tourism stats" landing page at `/pattaya-sport-stats/`. Include real numbers from the directory: number of venues, top categories by venue count, free vs paid options, areas with most venues. Updates automatically from `data.js`.

### Section D — Performance

**D1.** Lighthouse audit homepage + a representative venue page + a category page. Get scores into 95+ territory for Performance, 100 for Accessibility, 100 for Best Practices, 95+ for SEO.

**D2.** Inline critical CSS in the `<head>` of every page (~3KB max). Move non-critical CSS to async load via `<link rel="preload" as="style" onload="this.rel='stylesheet'">` pattern.

**D3.** Optimize SVG icons in `getCategoryArt()` (build.js). Some have inline whitespace that can be stripped. Each art SVG should be <1KB inlined.

**D4.** Add `loading="lazy"` to every `<img>` below the fold. None exist yet — when images are added (per-venue photos), they must be lazy-loaded.

**D5.** Self-host (or remove) any external font references. Check Leaflet on /map/ — uses CDN tiles + CDN CSS — accept this trade-off but consider switching to MapTiler with self-hosted tile cache if Cloudflare bandwidth becomes an issue.

**D6.** Compress data.js. Currently ~96KB. Many descriptions are repetitive. Strip tag arrays of duplicates. Consider gzip pre-compression for Cloudflare to serve `.gz` if available.

**D7.** Add `<meta http-equiv="x-dns-prefetch-control" content="on">` and `<link rel="dns-prefetch" href="//maps.google.com">` for outbound link DNS resolution.

**D8.** Implement service worker for offline-capable browsing of already-visited pages. Standard offline-first cache strategy.

### Section E — Accessibility (WCAG 2.1 AA target)

**E1.** Add a "skip to main content" link as the first focusable element in `<body>` of every page:
```html
<a href="#main" class="skip-link">Skip to main content</a>
```
Style it visually-hidden until focused, then visible. Wire to `id="main"` on the main content container.

**E2.** Audit color contrast site-wide. Use a tool like WebAIM Contrast Checker. Body text on dark background must hit 4.5:1; large headings 3:1. Adjust `--text-dim` and `--text-muted` if needed.

**E3.** Verify every `<a>` and `<button>` has either visible text content or an `aria-label`. The sticky bottom action bar buttons (Map/Call/Site/Compare/Share) — confirm aria-labels are present and meaningful.

**E4.** Verify tab order is logical on every page. Use keyboard alone to navigate the site — header nav, hero search, category chips, directory cards, venue page jump-to nav, FAQ accordion, footer links, sticky bottom bar. Fix any traps or unreachable elements.

**E5.** Add visible focus rings on all interactive elements. CSS `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` baseline.

**E6.** ARIA landmarks: every page should have `<header role="banner">`, `<nav role="navigation">`, `<main role="main" id="main">`, `<footer role="contentinfo">`. Multiple navs should have distinct `aria-label`.

**E7.** Add `prefers-reduced-motion` media query to disable smooth scrolling, transforms, transitions:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

**E8.** Form accessibility on `/add-your-gym/`: every input has a `<label for="...">`, error messages are programmatically associated via `aria-describedby`, required fields have `aria-required="true"`.

**E9.** Make the FAQ `<details>` accordions keyboard-friendly (they are by default, but verify with screen readers — VoiceOver / NVDA).

**E10.** Add `lang="en"` on `<html>` (already done) and `lang="th"` on inline Thai text spans (e.g., venue names in Thai script if any appear).

### Section F — Mobile UX (375px viewport target)

**F1.** Test every page type at 375px. Specifically check:
- Hero text doesn't overflow
- Category chips wrap nicely or scroll horizontally
- Directory cards stack to single column
- Jump-to nav pills wrap or scroll
- Sticky action bar buttons don't truncate (current 5 buttons may be tight)
- Compare widget pill bar doesn't overflow viewport
- FAQ summary text doesn't overlap the +/- toggle

**F2.** Increase tap-target sizes. Apple HIG recommends 44×44pt minimum. Verify:
- Header nav links
- Footer links
- Category chips
- Card "View Details" button
- Sticky action bar buttons (likely already big enough)
- Jump-to pills (currently small — bump to 32px height min)
- FAQ summary

**F3.** On mobile (<720px), the hero stats currently show 3 columns. Stack to 1 column or 3 small columns under 480px. Verify.

**F4.** Mobile sticky nav: make the horizontal scroll affordance visible. Add a subtle gradient fade on the right edge to indicate more nav items below the fold.

**F5.** The compare floating widget on mobile sits over the bottom action bar. Audit z-index stacking. Compare widget should sit ABOVE sticky action bar OR move to top when conflicting.

**F6.** Test on a real iPhone Safari + Android Chrome. Verify:
- Sticky positioning works (Safari sometimes loses it)
- Smooth scrolling works
- Form inputs don't trigger zoom-on-focus (font-size must be ≥16px on inputs)
- Bottom action bar respects iOS safe-area-inset-bottom

**F7.** Add safe-area-inset support:
```css
.sticky-actions { padding-bottom: env(safe-area-inset-bottom, 0); }
.back-to-top { bottom: calc(80px + env(safe-area-inset-bottom, 0)); }
```

**F8.** Add `<meta name="theme-color" content="#0b0b0d">` so the iOS / Android browser chrome matches the site dark theme.

**F9.** Add `<meta name="apple-mobile-web-app-title" content="Pattaya Gym">` and a real apple-touch-icon (180×180 PNG).

**F10.** Add a Web App Manifest at `/manifest.json` for PWA install:
```json
{
  "name": "Pattaya Gym Directory",
  "short_name": "Pattaya Gym",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b0b0d",
  "theme_color": "#0b0b0d",
  "icons": [
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"}
  ]
}
```
Reference from every page's `<head>`.

### Section G — Desktop UX

**G1.** Test at 1920×1080, 1440×900, 1280×800, 1024×768 viewports.

**G2.** Maximum content width on long-form pages should cap around 880px (already set on `.venue-page`) — verify it's actually applied and centered.

**G3.** On the directory grid, decide between fixed 3-column or `repeat(auto-fit, minmax(320px, 1fr))`. Currently auto-fit — verify it produces 3 cols at 1280px+, 4 cols at 1600px+.

**G4.** Hero search input — focus styling should be more prominent on desktop. Add a glowing accent shadow on focus.

**G5.** Add hover states to every clickable element. Card hover: subtle elevation (`box-shadow`) + accent border. Link hover: underline thickening + color shift.

**G6.** Add keyboard shortcuts:
- `/` → focus search
- `g + h` → go home
- `g + d` → go to directory
- `g + g` → go to guides
- `?` → show keyboard shortcut help modal

**G7.** Sticky table of contents on desktop venue pages. The jump-to pill row works on mobile; on desktop (>1100px), make it a fixed left-side TOC that highlights the current section as the user scrolls.

**G8.** Add a "Recently viewed" section to the homepage and venue pages, populated from `localStorage`. Shows the last 4 venues the user looked at.

### Section H — Trust + conversion

**H1.** Add a newsletter signup section to the homepage and a footer-wide email capture. Use Buttondown or MailerLite (free tier) as the backend. Capture: email, optional first name, frequency preference.

**H2.** Add a "Featured this month" callout above the fold on the homepage. Rotates editorially-curated venues (set in `data.js` as `featured: true`).

**H3.** Add testimonials / reviews section. Pull from Google Reviews via a manual JSON file at `/data/reviews.json` for now (~3-5 anonymized real testimonials about the directory itself, not the venues).

**H4.** Add a "Last updated" timestamp on every page. Pull from frontmatter `verified` field for venues; from a `lastBuild` global for static pages.

**H5.** Add a real `Contact` page at `/contact/`. Email, optional Discord/Telegram link, contact form (mailto: backed for now).

**H6.** Add a `Press` page at `/press/` documenting media mentions of the site as they accumulate. Empty for now but structure ready.

**H7.** Add a "Suggest an edit" affordance on every venue page. Email mailto-link with subject prefilled like `Edit suggestion: <Venue Name>`. (Already in venue page footer — verify and improve.)

**H8.** Add a "Did this help?" thumbs-up/down at the bottom of every venue and guide page. Send to a simple endpoint (or to mailto:) for editorial feedback. Used to identify pages that need rework.

### Section I — Content polish

**I1.** Fact-check pass. Spot-check 30 random venue pages — confirm:
- Address is correct (verify against Google Maps)
- Phone is current (the format is right; for some venues phone is empty — that's OK)
- Hours match the venue's website / FB page
- Price tier (฿/฿฿/฿฿฿/฿฿฿฿) is consistent with the description body

Build a checklist. Mark each verified. Update `verified:` date on the frontmatter.

**I2.** Photography sweep. Currently zero images on the site. Source 1 hero image per category (13 images, free Unsplash or Pexels) and 1 per venue (158 images). Optimize as WebP at 1200px wide max, with `<picture>` fallback to JPEG. Add to venue pages above the fold.

**I3.** Spelling + grammar pass on all 158 venue MD files. Bias toward British English (Pattaya is more British/Aussie expat than American). Consistency: "centre" not "center", "metre" not "meter", "behaviour" not "behavior". (Some pages are already British, others American — pick one and make consistent.)

**I4.** Style guide enforcement. Pull the `marketing:brand-review` skill if available. Voice: confident, expert-but-approachable, no marketing fluff, real-world specific.

**I5.** Add `Last updated: <date>` timestamps prominently on every guide and category page (currently only on venue pages). Boosts trust + freshness signal.

**I6.** Audit cross-references between venue MD files. The auto-link pass only links to OTHER venues by exact name match. Some pages have "Sityodtong" mentioned with a typo ("Sitiodtong") that won't auto-link. Run a fuzzy-match audit.

### Section J — New features

**J1.** "Save to favorites" — allow visitors to save venues to a `localStorage`-backed list. Floating widget similar to compare. Visible heart icon on each card. Page at `/favorites/` shows saved list.

**J2.** "Compare to me" — when a venue is open, show a "compare to..." dropdown with the other venues already in the compare set. One-click to add this venue to compare.

**J3.** Search filters. The search page has a category filter. Add filters for: area, price tier, hours (open now), languages (English, Russian, Thai, etc.).

**J4.** Map page improvements:
- Cluster pins (Leaflet.markercluster) when zoomed out
- Side panel listing visible venues
- Filter the panel by category
- Click a panel item to fly to the pin

**J5.** "Plan my trip" tool — a simple wizard that asks: how long are you in Pattaya, what's your fitness goal, your budget, your area preference. Returns 5–8 recommended venues with daily-schedule template.

**J6.** "Find my coach" tool — for combat sports — filter trainers by lineage, weight class experience, language, gender preference (some women specifically want female trainers).

**J7.** RSS feed enhancement. Add per-category RSS feeds: `/feed/muay-thai.xml`, `/feed/fitness.xml`, etc. Reference from the category page heads via `<link rel="alternate" type="application/rss+xml">`.

### Section K — Build pipeline robustness

**K1.** Make the build idempotent. Currently rebuilding overwrites `gyms/<slug>/index.html`, `category/<key>/index.html`, etc. Add cleanup: delete files for slugs that no longer exist in `data.js`, deletes orphaned category/area dirs.

**K2.** Add a `--watch` mode to `build.js` that re-runs on file changes. Use `chokidar` (acceptable lightweight dep) or `fs.watch` (built-in but flaky on Linux).

**K3.** Add a `validate.js` script that:
- Parses all 158 venue MD files
- Confirms every frontmatter has `id`, `name`, `category`, `area`, `verified` (required) + warns on missing optional fields
- Confirms every `id` matches the filename
- Confirms every category key in MD matches a key in `data.js` `CATEGORIES`
- Confirms every venue in MD matches a record in `data.js`
- Confirms every record in `data.js` has a corresponding MD file
- Reports orphans, mismatches, duplicates

Wire `validate.js` into the build chain — fail the build if validation errors.

**K4.** Add a CI workflow at `.github/workflows/build.yml`. On every PR + main push:
- Install Node
- Run `node validate.js`
- Run `node build.js`
- Run a basic HTML validator against output (html-validate)
- Run Lighthouse CI on a sample of pages
- Upload results as PR comment

**K5.** Add `package.json` with proper scripts:
```json
{
  "name": "pattaya-gym",
  "private": true,
  "scripts": {
    "build": "node build.js",
    "validate": "node validate.js",
    "watch": "node build.js --watch",
    "serve": "npx http-server . -p 8080"
  }
}
```

**K6.** Add `.gitignore` covering `*.bak`, `node_modules/`, `.DS_Store`, `*.log`, `tmp/`.

### Section L — Documentation

**L1.** Update `README.md` with:
- Project description
- Tech stack
- How to run locally (`npm run serve` or `python3 -m http.server`)
- How to add a new venue (create `venues/<slug>.md`, add record to `data.js`, run `node build.js`)
- How to deploy (push to main → Cloudflare auto-deploys)
- Where to find what (file map)
- How validation works
- Style guide pointer
- Editorial pointer

**L2.** Add a `CONTRIBUTING.md` for future helpers — setup, conventions, PR template.

**L3.** Add an `EDITORIAL_STYLE_GUIDE.md` codifying voice, tone, structure of venue pages, what counts as a "deep" page, what's a "stub", how cross-linking should work.

**L4.** Add a `SCHEMA_REFERENCE.md` documenting which Schema.org types we use where, and why.

---

## PART 5 — Quality bars

You are not done until ALL of these are true:

| Metric | Target |
|---|---|
| Lighthouse Performance (homepage) | ≥ 95 |
| Lighthouse Performance (venue page) | ≥ 95 |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | ≥ 95 |
| Number of broken internal links | 0 (run a link checker) |
| Number of HTML validation errors site-wide | 0 (run html-validate) |
| Number of files with truncation/syntax errors | 0 |
| Pages indexable by Google (no `noindex` accidentally) | All except `/404.html` |
| Sitemap entries that 200 OK | 100% |
| FAQPage schema entries that validate | 100% |
| Pages with proper canonical URL | 100% |
| Pages with proper OG image (real, non-generic) | 100% |
| Mobile usability errors in Search Console | 0 |
| Tap targets ≥ 44px on mobile | 100% |
| Color contrast ≥ 4.5:1 (body text) | 100% |
| Skip-to-content link working | Yes |
| Build runs in < 5 seconds | Yes |
| `node validate.js` exits 0 | Yes |

---

## PART 6 — Workflow

For each section above:

1. Read it
2. Ask yourself: is this needed? (Almost always: yes.)
3. Plan the change. List which files you'll touch.
4. Make the change.
5. Run `node validate.js` (or `node --check <file>` for individual JS files).
6. Run `node build.js`. Confirm: `Generated 158 venue pages (158 deep + 0 stubs)`.
7. Spot-check the affected page(s) by opening in a browser (or using `curl` to fetch and grep for expected content).
8. Run Lighthouse on the affected page (Chrome DevTools or `lhci`).
9. `git add -A && git commit -m "<descriptive>"`. Use Conventional Commits where possible (`feat:`, `fix:`, `perf:`, `a11y:`, `seo:`, `docs:`, `refactor:`, `test:`, `chore:`).
10. Push to main. Verify Cloudflare deploy succeeds. Confirm the change is live.

Do NOT batch commits across sections. Each section's work should land in one or two commits with clear scope.

---

## PART 7 — Reporting

After every major section (A–L), produce a short report:

- **Section completed:** A
- **Files changed:** index.html, data.js, build.js
- **Tests run:** node build.js (clean), node --check app.js (clean), Lighthouse desktop (95/100/100/95)
- **Concerns / open questions:** (e.g., couldn't find geo coords for 12 venues — flagged in TODO list)
- **Next:** Section B

Save these reports as `WORK_LOG_CODEX.md` so future sessions have continuity.

---

## PART 8 — Final checklist before closing the work

Before declaring "done":

- [ ] All 12 sections complete
- [ ] Quality bar table 100%
- [ ] `git log` shows clear, atomic commits with good messages
- [ ] No uncommitted changes
- [ ] CI green on main
- [ ] Live site (https://pattaya-gym.com) shows latest deploy
- [ ] Sitemap submitted to Google + Bing
- [ ] Cloudflare Web Analytics live and showing data
- [ ] PWA installable on mobile (test in Chrome)
- [ ] Newsletter signup confirmed end-to-end (test with your own email)
- [ ] Compare tool tested with 4 venues
- [ ] Map page renders all 158 venues
- [ ] Search returns hits for "muay thai jomtien", "yoga", "anytime fitness"
- [ ] Run a final Lighthouse audit on https://pattaya-gym.com — paste the JSON report into `WORK_LOG_CODEX.md`
- [ ] Push the final report

---

## PART 9 — Things that are NOT scope

- Adding new venues (we have 158; quality > quantity now)
- Building a CMS / admin panel (vanilla static stays vanilla)
- Implementing a backend / database (everything is build-time)
- Multi-language translation (English only for now; flagged for future)
- Native mobile apps (PWA install only)
- Paid ads tracking (no commercial conversion right now)
- Affiliate links (Tim hasn't decided on monetization yet)

---

## PART 10 — Closing

When all of the above is genuinely complete, the site will be in the top 1% of independent directory sites globally for technical SEO, accessibility, mobile UX, performance, content depth, and editorial quality. That's the bar. Don't stop early.

Be skeptical. Verify everything. Commit small. Test relentlessly. Read the build output every time.

Good luck.
