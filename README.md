# pattaya-gym.com

`pattaya-gym.com` is a 158-venue independent directory for gyms, Muay Thai camps, fitness clubs, golf courses, yoga studios, dive operators, racquet sports, kids' academies, hotel sport facilities, and sport-related landmarks across Pattaya, Thailand.

The site is content-first: every venue has a stable URL, a data record in `data.js`, a Markdown body in `venues/*.md`, schema.org structured data, internal links, social metadata, and full sitemap coverage. No paid placements. Hand-checked weekly.

Operated by **TimPaemi Co., Ltd.** as one of four sister directories (Pattaya Authority, Pattaya Restaurant Guide, Pattaya Visa Help, Pattaya.Gym).

## Tech Stack

- Static HTML, CSS, vanilla JavaScript. No bundler, no framework.
- Node.js build chain — single canonical generator: **`build-v2.js`**.
- Source data in `data.js` (158 venues + 15 categories + 6 areas) and `venues/*.md`.
- Geocoded coordinates cached in `data/venue-geo.json` (Nominatim/OSM).
- Output is committed to the repo and deployed via Cloudflare Pages.
- Hosted on Cloudflare Pages from `TimPaemi/pattayagym`, branch `main`.
- Asset version is bumped via a single constant `ASSET_VERSION` in `build-v2.js`.

## Local Setup

Install Node.js 22 or newer. Then:

```cmd
npm install
npm run build
npm run serve
```

Open `http://localhost:8080/`.

## NPM Scripts

- `npm run build` → `node build-v2.js`. Regenerates 158 venue pages, 15 category pages, 6 area pages, ~80 combined category-area pages, 8 utility pages, sitemap.xml.
- `npm run build:legacy` → `node build.js`. The pre-V2 build chain. Kept for emergency rollback only.
- `npm run validate` → `node validate.js`. Pre-build structural validation of `data.js` and `venues/*.md`.
- `npm run watch` → re-runs build-v2 on file changes.
- `npm run serve` → `npx http-server . -p 8080`.
- `npm run html:validate` → `npx html-validate` against the page sample.

## File Map

### Source

- `index.html` — homepage (hand-maintained, not generated; V2 design)
- `data.js` — `GYMS` + `CATEGORIES` records
- `venues/<id>.md` — long-form venue source with YAML frontmatter
- `data/venue-geo.json` — lat/lng cache populated by `GEOCODE_VENUES.cmd`
- `styles.css` — V2 stylesheet (black bg, multi-color neon)
- `_headers`, `_redirects` — Cloudflare Pages config

### Builder + scripts

- `build-v2.js` — canonical generator
- `search-page.js` — client-side search for `/search/`
- `scripts/verify-deploy.js` — pre-push integrity check (HTML tail, NUL bytes, CSS braces, CSP hash coverage)
- `scripts/geocode-venues.js` — one-time Nominatim geocoder; populates `data/venue-geo.json`
- `scripts/rebuild-tool-stubs.js` — rebuilds `/map/`, `/compare/`, `/plan-my-trip/`, `/find-my-coach/`, `/favorites/` as honest V2 static stubs
- `scripts/inject-guide-schema.js` — injects Article + FAQPage JSON-LD into the 17 guide pages
- `scripts/bump-legacy-assets.js` — syncs the 23 legacy-migrated pages (guides + tools) to current ASSET_VERSION

### Generated (output, committed)

- `gyms/<id>/index.html` — 158 venue pages
- `category/<key>/index.html` — 15 category pages
- `area/<slug>/index.html` — 6 area pages
- `area/<slug>/<category>/index.html` — ~80 combined area-category long-tail pages
- `about/`, `contact/`, `methodology/`, `press/`, `add-your-gym/`, `colophon/`, `pattaya-sport-stats/`, `404.html` — utility pages
- `guides/<slug>/index.html` — 17 long-form guide pages (chrome-wrapped from legacy)
- `sitemap.xml` — 285+ URLs with `<priority>` and `<changefreq>`
- `og/<id>.png` — per-venue 1200×630 OG images

### Deploy automation

- `PUSH_ROUND<N>.cmd` — each round of fixes has its own .cmd. Latest is the one to run.
- `GEOCODE_VENUES.cmd` — runs the one-time Nominatim geocoder (~3 min for 158 venues)

## Adding A Venue

1. Create `venues/<id>.md` with YAML frontmatter (see existing venues for structure).
2. Add a matching object to `GYMS` in `data.js`. Keep `id` identical across filename, frontmatter, and data record.
3. Set `detailFile: "venues/<id>.md"` in the data record so the body content links.
4. Run `node build-v2.js` and `node scripts/verify-deploy.js` to confirm clean output.
5. (Optional but recommended) Run `node scripts/geocode-venues.js` so the new venue gets lat/lng added to its LocalBusiness schema.
6. Commit source AND generated output together.

**Do not rename existing venue IDs, category keys, area slugs, or guide slugs without a 301 redirect plan.** URLs are indexed; renames cost crawl equity.

## Deployment Workflow

Each fix round uses a `PUSH_ROUND<N>.cmd` script. The pattern is:

1. Cleanup `.git/index.lock`
2. Confirm branch is `redesign-2026`
3. `node --check` syntax on every JS file
4. Run `node build-v2.js` (full regeneration)
5. Run helper scripts (`bump-legacy-assets.js`, `rebuild-tool-stubs.js`, `inject-guide-schema.js`)
6. Run `node scripts/verify-deploy.js` — **hard gate** that fails fast on truncation, NUL bytes, brace imbalance, or missing CSP hashes
7. `git commit` with detailed multi-line message
8. `git push origin redesign-2026`
9. Tag `main-pre-roundN` rollback point at current `origin/main`
10. `git push origin redesign-2026:main` — refspec push (avoids the `checkout main` self-destruct that earlier rounds hit)

Production deploys automatically when `main` updates on GitHub.

### Cloudflare cache behavior

`_headers` uses `Cache-Control: public, max-age=3600, must-revalidate` (NOT `immutable`) on CSS/JS so version bumps via `?v=` actually invalidate the edge cache. If you ever need to force a refresh anyway: Cloudflare dashboard → Caching → Configuration → Purge Everything.

## SEO + Schema

- Sitemap: `/sitemap.xml` (285+ URLs, priority + changefreq emitted per URL)
- Robots: `/robots.txt` — allows all major search + AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
- Per-venue: `LocalBusiness` + subtype (`SportsActivityLocation` / `ExerciseGym` / `HealthClub` / `GolfCourse` / `SportsClub`) + `BreadcrumbList` + (where data exists) `geo`, `openingHoursSpecification`, `PostalAddress`, `telephone`, `sameAs`
- Homepage: `WebSite` + `Organization` + `SearchAction`
- Category/area pages: `ItemList` + `BreadcrumbList`
- Combined category-area pages: `ItemList` + 3-level `BreadcrumbList`
- Guides: `Article` + (where Q/A heading patterns exist) `FAQPage`
- Utility: `WebPage` / `AboutPage` / `ContactPage` + `BreadcrumbList`

Total: 400+ JSON-LD blocks, 0 parse errors.

## CSP

`_headers` Content-Security-Policy restricts inline scripts to specific SHA-256 hashes. The `scripts/verify-deploy.js` guard computes hashes of every inline `<script>` on every shipped HTML and fails the push if any are missing from the CSP allow-list. This prevents the "CSP blocks the production script" trap.

## Analytics

Google Analytics (`G-F5F6KD3XFZ`) on every page. Cloudflare Web Analytics also active via Cloudflare Pages auto-inject. No tracking cookies otherwise.

## Style + Editorial

- `EDITORIAL_STYLE_GUIDE.md` — voice, venue structure, spelling, source standards
- `SCHEMA_REFERENCE.md` — category-to-schema-type mapping
- `CONTRIBUTING.md` — before-you-edit checklist
- Pratamnak / Pratumnak: both spellings are intentional. Pratumnak in official venue names, Pratamnak in prose.

## Status

Site is live at `https://pattaya-gym.com/`. Eight rounds of post-V2 fixes shipped through `2026-05-17`. Latest audit: `AUDIT_NUCLEAR_V3.md`. See `NEXT_STEPS.md` for the off-page playbook (Google Search Console, Google Business Profile, backlink outreach, content expansion).
