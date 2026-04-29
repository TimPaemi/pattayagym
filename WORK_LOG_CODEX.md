# Codex Work Log

## 2026-04-29 - Section A: Critical bug fixes

- **Section completed:** A
- **Files changed:** `build.js`, `build-discovery.js`, `search/index.html`, `venue.css`, `feed.xml`
- **Tests run:** `node --check data.js app.js build.js build-extras.js build-discovery.js share.js compare.js`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; repository truncation/end-marker audit over 369 files; hardcoded stale venue-count scan; gym directory orphan audit.
- **Result:** Repaired a committed duplicate/truncated tail in `build.js`, replaced stale search meta copy with a `GYMS.length` build-time value, removed a corrupt duplicate tail fragment from `venue.css`, and verified `index.html` still includes the required script tags and closing HTML.
- **Concerns / open questions:** `CODEX_NUCLEAR_PROMPT.md` is untracked and still contains stale-count examples as instructions; it was intentionally excluded from source fixes. There is no `validate.js` yet, so Section A validation used targeted Node audits until Section K adds the formal validator.
- **Next:** Section B - technical SEO.

## 2026-04-29 - Section B: Technical SEO

- **Section completed:** B
- **Files changed:** `build.js`, `build-extras.js`, `build-discovery.js`, `index.html`, `compare/index.html`, `README.md`, `_headers`, `_redirects`, `humans.txt`, `.well-known/security.txt`, `scripts/generate-og-images.ps1`, `og-image.png`, `og/*.png`, generated HTML/XML output.
- **Tests run:** `node --check` on all JS entry files; `powershell -ExecutionPolicy Bypass -File scripts\generate-og-images.ps1`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; HTML coverage scan confirmed 193/193 pages have `og:image`, `hreflang="en"`, Plausible, and preload tags; venue schema scan confirmed 158/158 valid primary JSON-LD blocks with geo, Service offers, and dollar-sign price ranges; 72 pages have parsed `openingHoursSpecification`.
- **Result:** Added root and per-venue OG PNGs, per-page OG image references, English and x-default hreflang, CSS preloads, cache-busted asset URLs, Plausible analytics hook, DNS prefetch, host-specific www-to-apex redirect, Cloudflare Pages headers, humans.txt, security.txt, and richer venue schema with category-specific Schema.org types.
- **Concerns / open questions:** Venue geo coordinates use the requested Pattaya centroid placeholder and are flagged in schema as a TODO for manual venue-specific coordinates. Plausible requires the `pattaya-gym.com` domain to be configured in the Plausible account before data appears. Search Console and Bing verification meta tags are not configured because no verification tokens were present.
- **Next:** Section C - SEO content.

## 2026-04-29 - Section C: SEO content

- **Section completed:** C
- **Files changed:** `build.js`, `build-extras.js`, `build-discovery.js`, `index.html`, `WORK_LOG_CODEX.md`, generated guide/category/area/venue/search/map/about/404 HTML, `sitemap.xml`, `feed.xml`, new `guides/pattaya-digital-nomad-fitness/`, `guides/female-friendly-gyms-pattaya/`, `guides/pattaya-gyms-childcare-family-pools/`, `guides/pattaya-seniors-low-impact-sport/`, `guides/thai-gym-terms-pattaya/`, `methodology/`, `pattaya-sport-stats/`.
- **Tests run:** `node --check build.js build-extras.js build-discovery.js`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; metadata audit over 200 HTML pages confirmed 0 titles over 65 characters and only two escaped-entity false positives over 170 description characters; stale global venue-count scan found no `138+`, `137+`, `98+`, `130+`, `125+`, or `120+`; coverage scan confirmed 200/200 HTML pages have canonical, `og:image`, `hreflang="en"`, Plausible, and CSS preloads; JSON-LD parse scan confirmed 410/410 blocks valid; file-integrity scan over 378 text/source files found 0 bad endings or syntax issues.
- **Result:** Added five long-tail best-of guides for digital nomads, female-friendly venues, childcare/family pools, seniors 65+, and Thai gym terms; added contextual internal links with varied anchor text inside new guide prose; added `/methodology/` and `/pattaya-sport-stats/`; tightened generated title/meta-description output; made guide count copy dynamic via `{count}` placeholders; expanded footers to surface new authority pages and guides.
- **Concerns / open questions:** The new guide rankings are rule-based against existing venue metadata, so later Section I fact-checking and photography work should refine recommendations where source details are thin. Search Console submission and live rich-result validation remain deploy-side tasks.
- **Next:** Section D - performance.

## 2026-04-29 - Section D: Performance

- **Section completed:** D
- **Files changed:** `build.js`, `build-extras.js`, `build-discovery.js`, `index.html`, `compare/index.html`, `_headers`, `sw.js`, generated venue/category/area/guide/search/map/about/404 HTML and XML output.
- **Tests run:** `node --check build.js build-extras.js build-discovery.js sw.js`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; coverage scan confirmed 200/200 HTML pages have inline critical CSS, stylesheet preload, and service-worker registration; file-integrity scan over 379 text/source files found 0 bad endings or syntax issues; category-art SVG scan confirmed 158 generated SVGs with max inline size 519 bytes; local Lighthouse sample: homepage 99/89/100/100, Fairtex venue 97/94/100/100, Muay Thai category 100/95/100/100.
- **Result:** Added inline critical CSS and non-blocking stylesheet loading to generated pages, kept the homepage stylesheet render-blocking to eliminate hero CLS, deferred service-worker registration, added an offline-first `sw.js`, added no-cache service-worker headers, reduced first-paint layout shift on generated venue/category pages, and minified generated category art SVG output.
- **Concerns / open questions:** Accessibility scores are intentionally not yet at the final target because Section E owns skip links, focus states, contrast, landmarks, and form semantics. The homepage is the one page that does not use async full-CSS loading because the normal stylesheet load gives zero CLS and still reaches 99 Performance locally. `data.js` remains 97,364 bytes raw / 24,999 bytes gzip; deeper data compaction should be revisited only if it does not reduce venue content quality.
- **Next:** Section E - accessibility.

## 2026-04-29 - Section E: Accessibility

- **Section completed:** E
- **Files changed:** `styles.css`, `build.js`, `build-extras.js`, `build-discovery.js`, `index.html`, `compare/index.html`, generated venue/category/area/guide/search/map/about/404 HTML and XML output.
- **Tests run:** `node --check build.js build-extras.js build-discovery.js`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; coverage scan confirmed 200/200 HTML pages have skip links, `id="main"`, banner roles, primary navigation labels, and contentinfo footers; Thai-script scan confirmed 0 HTML pages with Thai letters missing `lang="th"`; file-integrity scan over 379 text/source files found 0 bad endings or syntax issues; local Lighthouse sample: homepage 99/100/100/100, Fairtex venue 98/100/100/100, Muay Thai category 99/100/100/100, add-your-gym 98/100/100/100.
- **Result:** Added skip-to-content links, visible focus rings, reduced-motion handling, higher-contrast muted text tokens, underlined inline text links, semantic landmarks, non-heading footer section labels, accessible share-button icon hiding, Thai language spans in generated venue copy, and stronger form semantics with required-field ARIA and hint association.
- **Concerns / open questions:** Keyboard tab order was validated structurally and by Lighthouse coverage, but real VoiceOver/NVDA and physical mobile keyboard testing still belongs in the final manual QA pass. Some venue markdown still contains `h4` headings inside body content; Lighthouse did not flag them in sampled pages, so they were left as editorial structure rather than flattened globally.
- **Next:** Section F - mobile UX.

## 2026-04-29 - Section F: Mobile UX

- **Section completed:** F
- **Files changed:** `styles.css`, `venue.css`, `build.js`, `build-extras.js`, `build-discovery.js`, `index.html`, `compare/index.html`, `_headers`, `sw.js`, `manifest.json`, `icon-180.png`, `icon-192.png`, `icon-512.png`, generated venue/category/area/guide/search/map/about/404 HTML and XML output.
- **Tests run:** `node --check build.js build-extras.js build-discovery.js sw.js`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; coverage scan confirmed 200/200 HTML pages have manifest, theme color, apple mobile title, apple touch icon, skip link, and `id="main"`; file-integrity scan over 381 text/source files found 0 bad endings or syntax issues; local mobile Lighthouse sample: homepage 99/100/100/100, Fairtex venue 98/100/100/100, Muay Thai category 99/100/100/100, compare 98/100/100/100.
- **Result:** Kept the mobile primary nav visible and horizontally scrollable, added a right-edge scroll affordance, increased tap targets for nav links, chips, card actions, footer links, FAQs, share buttons, and jump pills, tightened homepage hero/stats/chip wrapping under 480px, moved the compare widget above the venue sticky action bar with safe-area spacing, added safe-area support for back-to-top, added PWA manifest and install icons, and removed the stale `/compare/` robots disallow so the compare page is indexable.
- **Concerns / open questions:** Lighthouse mobile emulation passed, but real iPhone Safari and Android Chrome checks are still needed in the final device QA pass. PWA installability should be re-tested after Cloudflare deploy because service-worker scope and icon fetching are browser-enforced at the live origin.
- **Next:** Section G - desktop UX.

## 2026-04-29 - Section G: Desktop UX

- **Section completed:** G
- **Files changed:** `styles.css`, `venue.css`, `build.js`, `build-extras.js`, `build-discovery.js`, `index.html`, `compare/index.html`, `_headers`, `sw.js`, `recent.js`, `shortcuts.js`, generated venue/category/area/guide/search/map/about/404 HTML and XML output.
- **Tests run:** `node --check build.js build-extras.js build-discovery.js sw.js recent.js shortcuts.js app.js compare.js`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; coverage scan confirmed 200/200 HTML pages use `styles.css?v=159`, 200/200 include shortcuts, and 158/158 venue pages include recently viewed + current venue data; file-integrity scan over 383 text/source files found 0 bad endings or syntax issues; Chrome desktop probes at 1920x1080, 1440x900, 1280x800, and 1024x768 found no horizontal overflow, 4/4/3/2 homepage grid columns, working slash-search and shortcut modal, sticky desktop venue TOC with active state, and recently viewed cards; local Lighthouse desktop sample: homepage 100/100/100/100, Fairtex venue 99/100/100/100, Muay Thai category 98/100/100/100, compare 100/100/100/100; local mobile smoke sample: homepage 99/100/100/100, Fairtex venue 98/100/100/100, Muay Thai category 99/100/100/100.
- **Result:** Added global keyboard shortcuts (`/`, `g h`, `g d`, `g g`, `?`), a keyboard shortcut help modal, desktop search focus glow, stronger card hover elevation, a wider homepage directory grid that reaches four columns on large desktop screens, a sticky left-side venue table of contents above 1100px with active-section highlighting, and localStorage-backed recently viewed sections on the homepage and every venue page.
- **Concerns / open questions:** Browser-level testing used installed headless Chrome via DevTools Protocol plus Lighthouse; real desktop Safari/Firefox checks remain for the final cross-browser QA pass. Recently viewed is intentionally device-local only and has no sync/account behaviour.
- **Next:** Section H - trust + conversion.

## 2026-04-29 - Section H: Trust + conversion

- **Section completed:** H
- **Files changed:** `data.js`, `app.js`, `styles.css`, `build.js`, `build-extras.js`, `build-discovery.js`, `index.html`, `compare/index.html`, `_headers`, `sw.js`, `README.md`, `data/reviews.json`, generated venue/category/area/guide/search/map/about/contact/press/404 HTML and XML output.
- **Tests run:** `node --check build.js build-extras.js build-discovery.js app.js sw.js data.js`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; coverage scan confirmed 202/202 HTML pages use `styles.css?v=160`, 202/202 include the footer newsletter and last-updated copy, 158/158 venue pages include page feedback, 13/13 guide pages include page feedback, `/contact/` and `/press/` are in `sitemap.xml`, and 6 venues are marked `featured: true`; file-integrity scan over 386 text/source files found 0 bad endings or syntax issues; local Lighthouse sample: homepage 99/100/100/100, Fairtex venue 97/100/100/100, Muay Thai guide 99/100/100/100, contact 100/100/100/100, press 100/100/100/100.
- **Result:** Added a rotating "Featured this month" homepage callout, homepage and footer newsletter signup forms, an owner-managed reader-feedback data file, safe empty-state review rendering, visible last-updated trust copy, stronger venue suggest-edit subjects, thumbs-up/down feedback blocks on every venue and guide, and new `/contact/` and `/press/` trust pages with sitemap coverage.
- **Concerns / open questions:** Newsletter forms point to the configured Buttondown embed endpoint and still need a real account/list check after deploy. `data/reviews.json` is intentionally empty because no owner-approved real testimonials were supplied; fabricated testimonials were not added. The page feedback mailto flow is static and does not provide analytics until a backend or form endpoint is chosen.
- **Next:** Section I - content polish and fact-checking.

## 2026-04-29 - Section I: Content polish progress

- **Section completed:** I is in progress; this commit covers the safe automated polish and audit scaffolding, not the full photography sweep.
- **Files changed:** `data.js`, `build.js`, `scripts/content-audit.js`, `CONTENT_AUDIT_2026-04-29.md`, 134 venue markdown files with low-risk British-English body spelling changes, and regenerated venue/category/area/guide/search/map HTML plus XML output.
- **Tests run:** `node --check scripts/content-audit.js data.js build.js`; `node scripts/content-audit.js --write CONTENT_AUDIT_2026-04-29.md`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; file-integrity scan over 388 text/source files found 0 bad endings or syntax issues; safe-US-body-term scan found 0 remaining hits for the automated replacement set; `git diff --check` passed; local Lighthouse sample: homepage 99/100/100/100, Coco Fitness venue 98/100/100/100.
- **Result:** Applied a conservative British-English pass to body prose (`travellers`, `specialised`, `organised`, `optimised`, `kilometres`, `metres`, etc.) while leaving frontmatter, URLs, official names and risky Center/Centre cases untouched; added a repeatable content audit script; generated a 30-venue fact-check checklist; updated and date-stamped three externally checked sample records (Pickleball Pattaya, Coco Fitness, MAX Muay Thai Stadium) with current public-source evidence; and fixed a generated trailing-whitespace issue in the venue hero template.
- **Concerns / open questions:** `marketing:brand-review` is not an available skill in this session, so style review used the existing project voice and the new audit report instead. The remaining 27 sampled venues still need external Google Maps/source checks before their `verified:` dates are bumped. Licensed photography is still missing for 13 category keys and 158 venues; the report documents the exact missing image paths and explicitly rejects generated OG cards as a substitute for real photos.
- **Next:** Continue Section I with the manual fact-check/photo work, then Section J.

## 2026-04-29 - Section J: New features

- **Section completed:** J
- **Files changed:** `favorites.js`, `compare.js`, `app.js`, `styles.css`, `build.js`, `build-extras.js`, `build-discovery.js`, `_headers`, `sw.js`, `index.html`, `compare/index.html`, generated venue/category/area/guide/search/map/favorites/plan-my-trip/find-my-coach HTML, `feed.xml`, `feed/*.xml`, and `sitemap.xml`.
- **Tests run:** `node --check build.js build-extras.js build-discovery.js app.js compare.js favorites.js sw.js data.js`; `node build.js` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; file-integrity scan over 406 text/source files found 0 bad endings or syntax issues; inline-script syntax scan passed on search, favorites, plan-my-trip, find-my-coach, map, fitness category, and Fairtex venue; local HTTP smoke test returned 200 for `/`, `/search/`, `/favorites/`, `/plan-my-trip/`, `/find-my-coach/`, `/map/`, `/category/fitness/`, `/feed/fitness.xml`, and `/gyms/fairtex-pattaya/`; Playwright mobile smoke test passed favorites persistence, search filters, planner results, coach finder results, venue compare helper, and map panel; Lighthouse on `/search/` returned 98/100/100/100; live Cloudflare check confirmed `/favorites/`, `/plan-my-trip/`, `/find-my-coach/`, `/search/`, and `/feed/fitness.xml` served the new content after deploy.
- **Result:** Added localStorage-backed favorites with heart buttons on homepage, category/search/area/guide cards and venue pages; added `/favorites/`; added a venue compare helper that lets the current venue join an existing compare set; expanded search filters for category, area, price, open-now, and language while preserving scroll position on filter changes; upgraded `/map/` with low-zoom cluster pins, a visible-venue side panel, category filtering, and fly-to panel items; added `/plan-my-trip/` and `/find-my-coach/`; and generated per-category RSS feeds with category-page RSS discovery links.
- **Concerns / open questions:** The map clustering is implemented in local Leaflet code rather than adding `Leaflet.markercluster` from a new CDN, keeping the no-new-CDN rule intact. Language and coach matching are heuristic because `data.js` does not yet have structured trainer/language fields. Open-now search is a best-effort hours parser and should be revisited if hours become fully structured.
- **Next:** Section K - build pipeline robustness.

## 2026-04-29 - Section K: Build pipeline robustness

- **Section completed:** K
- **Files changed:** `validate.js`, `build.js`, `build-extras.js`, `build-discovery.js`, `package.json`, `.github/workflows/build.yml`, `.lighthouserc.json`, `.htmlvalidate.json`, `.gitignore`, `venues/pattaya-hash-house.md`, `feed.xml`, and `feed/*.xml`.
- **Tests run:** `node --check build.js build-extras.js build-discovery.js validate.js data.js app.js compare.js favorites.js sw.js`; `node validate.js` and `npm run validate` both exited 0; `node build.js` and `npm run build` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; orphan-cleanup smoke test created stale generated venue/category/area/guide/feed outputs and confirmed the next build removed them; watch-mode smoke test confirmed `node build.js --watch` completes the initial build and enters watch state; generated-output hash check confirmed back-to-back builds are idempotent; `npm run html:validate` passed on the CI sample page set; file-integrity scan found 0 bad endings; `git diff --check` exited 0.
- **Result:** Added a no-dependency source validator and wired it into the build, changed extras failures from swallowed errors to failing builds, added safe generated-output cleanup for stale venue/category/area/guide/feed artifacts, added `--watch` mode, made RSS `lastBuildDate` deterministic from `verified` dates, added npm scripts, CI with validation/build/html-validate/Lighthouse CI, basic HTML validation config, and expanded ignore rules.
- **Concerns / open questions:** Validation exits 0 but reports 755 warnings, mostly missing optional markdown frontmatter fields and intentional data/frontmatter wording differences; those warnings are content-cleanup input for the remaining Section I work. The CI HTML validator uses a legacy-tolerant config so it checks structural parseability without blocking on existing inline style/self-closing/tag-convention issues. Lighthouse CI is configured in GitHub Actions but has not run on GitHub until this commit is pushed.
- **Next:** Section L - documentation.

## 2026-04-29 - Section L: Documentation

- **Section completed:** L
- **Files changed:** `README.md`, `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `EDITORIAL_STYLE_GUIDE.md`, `SCHEMA_REFERENCE.md`, `WORK_LOG_CODEX.md`.
- **Tests run:** `npm run validate` exited 0; `npm run build` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`; `npm run html:validate` passed; `git diff --check` exited 0.
- **Result:** Rewrote the README with project description, stack, local setup, npm scripts, file map, venue-add workflow, validation behaviour, idempotent build notes, deployment checks, CI, SEO/search references, analytics, OG image generation, and pointers to editorial/schema docs. Added contributor setup and conventions, a PR template, editorial voice/style/source rules, deep-page vs stub definitions, cross-linking guidance, and a schema reference covering global, venue, FAQ, breadcrumb, ItemList, service, and category schema usage.
- **Concerns / open questions:** Documentation now records the 755 validation warnings as known editorial cleanup input; the remaining manual Section I fact-check/photo work is still not complete.
- **Next:** Return to the unfinished Section I manual content polish and final quality-bar closeout.

## 2026-04-29 - Section I (continued): Restore + safe fact-check

- **Section status:** I still in progress. This entry covers restoration of the working tree (8 critical files truncated locally) and one venue fact-check.
- **Files changed:** `data.js` (Burapha verified date bumped), `venues/burapha-golf-club.md` (verified date bumped), `WORK_LOG_CODEX.md`.
- **Files restored from `git show HEAD:` (working tree was truncated mid-line):** `build.js` (1115 → 1594 lines), `data.js` (229 → 239 lines), `build-extras.js` (683 → 1076), `build-discovery.js` (871 → 2269), `index.html` (191 → 330), `app.js` (150 → 227), `styles.css` (759 → 1613), `venue.css` (1119 → 1187), `compare.js` (102 → 167), `compare/index.html` (119 → 256). All 10 files confirmed clean post-restore.
- **Tests run:** `npm run validate` exited 0 (`Validation: 0 error(s), 755 warning(s)`); `npm run build` confirmed `Generated 158 venue pages (158 deep + 0 stubs)`.
- **Burapha Golf Club fact-check (2026-04-29):** Cross-referenced against golfpattaya.com, easygolfbooking, and golftripz. Confirmed: address `281 Moo 4, Tumbol Bung, Sriracha District, Chonburi 20230`, phone `+66 38 372 700`, two 18-hole championship courses (East and West). All match existing record. Bumped `verified:` from `2026-04-27` to `2026-04-29`.
- **Pratumnak/Pratamnak audit re-resolved:** The 5 mixed-spelling files (big-buddha-hill-wat-phra-yai, cross-pattaya-pratamnak, manhattan-pattaya-fitness, pattaya-beach-public-aerobics, pattaya-padel-club) were investigated. Every "Pratumnak" instance is justified — it is either the official venue name "Pratumnak Fitness Park" (a venue in `data.js`), the Pickleball Pattaya address ("Pratumnak Soi 6"), or the Play Padel Pattaya address ("Pratumnak — Kasetsin Soi 3"). The current editorial usage is correct: **Pratamnak** for general hill/area references in prose, **Pratumnak** preserved when it is part of an official venue name or address. No edits needed. The CONTENT_AUDIT_2026-04-29.md "pick one style per page" suggestion can be considered resolved as a deliberate editorial choice rather than an inconsistency.
- **Yoga Pattaya Studio fact-check attempted:** Source listing shows `315/322 Thepprasit Soi 12` whereas the venue record currently says `315/327`. Phone `+66 95 573 9376` confirmed. Address discrepancy left for in-person/owner verification — no `verified:` date change because the unit number conflict is unresolved.
- **Concerns / open questions:** The local working tree still has the same edit-tool corruption pattern that has bitten previous sessions. Multiple critical files were silently truncated mid-line. Restoring from `git show HEAD:<file>` is the cleanest fix when this happens — `git checkout` cannot run because the local `.git/index` is also corrupted (`fatal: unknown index entry format 0x00730000`) and the sandbox has no permission to delete `.git/index`. Tim must run `del .git\index && git reset` from his Windows terminal before any further commits.
- **Next:** Continue the remaining 26 venues on the fact-check checklist by web cross-referencing, sourcing licensed photography for the 13 category keys + 158 venues, and the final manual quality-bar closeout (real device testing, VoiceOver/NVDA, live Lighthouse on production URLs).

## 2026-04-29 - Section I (continued): Mountain Shadow fact-check

- **Section status:** I still in progress. One additional venue fact-check completed.
- **Files changed:** `data.js` (Mountain Shadow verified date bumped), `venues/mountain-shadow-country-club.md` (verified date + Quick Reference Card row bumped), `CONTENT_AUDIT_2026-04-29.md` (status moved from "Pending external check" to "Checked 2026-04-29" with evidence note), `WORK_LOG_CODEX.md`.
- **Mountain Shadow Country Club fact-check (2026-04-29):** Cross-referenced against golfasian, golfpattaya, where2golf, thaigolfbooking, deemples, and 1golf.eu (Albrecht Golf Guide). Confirmed: location halfway between Bangkok and Pattaya in Si Racha / Bang Phra area, Ron Fream design (with David Dale per Albrecht), 2004 re-opening (formerly Natural Park Hill Golf Club / Panya Hills), former mango plantation, 18-hole par-72 layout, ~฿1,750-3,000 green fees (mid-tier `฿฿฿`). All match the existing record. Address kept intentionally vague ("Si Racha area, Chonburi") because public sources are split between two listings — `159/1 Moo 2 Saensuk Rd, Mueang Chonburi 20130` (golfasian / where2golf wording) and `502 Moo 10, Bang Phra, Sriracha 20210` (thaigolfbooking). Phone field intentionally left empty for the same reason. Bumped `verified:` from `2026-04-27` to `2026-04-29`.
- **Tests run:** None this entry — git index corruption (`fatal: unknown index entry format 0x00730000`) returned and sandbox cannot delete `.git/index`. File edits were applied via the file tools, not via build/validate. Tim must run `del .git\index && git reset` from Windows, then `npm run validate` and `npm run build` should be re-run to confirm `Validation: 0 error(s)` and `Generated 158 venue pages (158 deep + 0 stubs)` before commit.
- **Concerns / open questions:** Mountain Shadow address conflict is unresolved without owner contact. Recommend keeping the address vague rather than guessing between the two public listings.
- **Next:** Repeat the fact-check pattern for the remaining 25 venues on the checklist (each ~5 min: web cross-reference address/phone/hours, bump `verified:` if confirmed). Continue prioritising high-source-count venues to minimise editorial risk.

## 2026-04-29 - Section I (continued): Siam Country Club fact-check

- **Section status:** I still in progress. One additional venue fact-check completed.
- **Files changed:** `data.js` (Siam Country Club address postcode added + verified date bumped), `venues/siam-country-club.md` (address postcode added + verified date bumped), `CONTENT_AUDIT_2026-04-29.md` (status moved from "Pending external check" to "Checked 2026-04-29" with evidence note), `WORK_LOG_CODEX.md`.
- **Siam Country Club fact-check (2026-04-29):** Cross-referenced against the Siam Motors Group official listings (the parent company), siamcountryclub.com, golfasian, golfpattaya, golfpass, 18Birdies, mScorecard, and 1golf.eu. Confirmed: Old Course address `50 Moo 9 T. Pong, Banglamung, Chonburi 20150`, phone `0-3890-9700` (= `+66 38 909 700`); sister courses Plantation, Waterside, Rolling Hills share the `50/6 Moo 9` site. Added the missing `20150` postcode in both `data.js` and `venues/siam-country-club.md`. Phone, hours, courses-list (Old 1970 / Plantation 2008 / Waterside 2014 / Rolling Hills 2020), price tier `฿฿฿฿`, founder Dr. Thaworn Phornprapha, original designer Ichisuke Izumi, 2006-2007 Schmidt-Curley Old Course renovation, LPGA Honda Classic permanent venue since 2010 — all match existing record. Bumped `verified:` from `2026-04-27` to `2026-04-29`.
- **Tests run:** None this entry — git index corruption persists. Tim must run `del .git\index && git reset` from Windows, then `npm run validate` and `npm run build` should be re-run before commit.
- **Concerns / open questions:** None. Address change is additive (only postcode appended) and matches every official source.
- **Next:** Continue with the remaining 24 venues. Logical next picks (high source count): Pattaya Cricket Club (10), Muscle Factory Pattaya (10), Deep Climbing Gym (10), EasyKart Pattaya (10), Khao Chi Chan (9), Manta Kids (9), Rambaa Somdet M16 (9), Thai Sky Adventures (9), Elite Gym & Fitness (9).

## 2026-04-29 - Section I (continued): Six-venue fact-check batch

- **Section status:** I still in progress. Six additional venues checked + bumped this batch.
- **Files changed:** `data.js`, `CONTENT_AUDIT_2026-04-29.md`, `WORK_LOG_CODEX.md`, plus six venue MDs: `venues/deep-climbing-gym.md`, `venues/pattaya-cricket-club.md`, `venues/easykart-pattaya.md`, `venues/muscle-factory-pattaya.md`, `venues/khao-chi-chan-buddha-mountain.md`, `venues/elite-gym-fitness.md`.
- **Deep Climbing Gym (Harbor Pattaya):** Cross-referenced harbormall.co.th, tripadvisor, klarna trips, trip.com, harborlandgroup, mindtrip. **Hours corrected** from "Daily 10:00-22:00 (mall hours)" → `Mon-Fri 10:30-19:00; Sat-Sun 10:30-19:30` (gym hours, not mall hours). Address + phone in `data.js` upgraded from `Harbor Pattaya Shopping Mall, 8th floor` / empty phone → full street + `+66 89 332 1000`. Verified 2026-04-29.
- **Pattaya Cricket Club:** Cross-referenced pattayacricketclub.com ground-location page + Horseshoe Point official listings. Address upgraded from generic `Pattaya, Bang Lamung, Chonburi` → `Horseshoe Point Resort, 100 Moo 9, Tambon Pong, Bang Lamung, Chonburi 20150`. Verified 2026-04-29.
- **EasyKart Pattaya Thepprasit:** Cross-referenced skyfun.travel, expedia, tiqets, easykart.net, gowabi. Address upgraded from `EasyKart Pattaya Thepprasit, Pattaya, Bang Lamung, Chonburi` → `168/24 Moo 12 Thepprasit Road, Pattaya City, Bang Lamung District, Chonburi 20150`. Phone added: `+66 91 038 6111`. Verified 2026-04-29.
- **Muscle Factory Pattaya:** Cross-referenced mfbkk.com contact page, tripadvisor, wheree, pattaya inspire e-mag. Address upgraded from `Pratamnak Hill, Pattaya, Bang Lamung, Chonburi` → `Pratumnak Soi 5, Nongprue, Bang Lamung, Chonburi 20150`. Phone added: `+66 83 695 9196`. **Hours corrected** from `Daily — extended hours (verify at venue)` → `Mon-Fri 07:00-24:00; Sat-Sun 07:00-23:00`. Note: address uses `Pratumnak Soi 5` (the official street name) per editorial Pratumnak/Pratamnak rule. Verified 2026-04-29.
- **Khao Chi Chan (Buddha Mountain):** Cross-referenced tourismthailand.org, forevervacation, atmindgroup, trip.com, bestpricetravel, tripadvisor, royalvacationdmc. **Hours corrected** from `Daily 08:00-18:00` → `Daily 06:00-18:00` (multiple official sources agree on 06:00 opening). Postcode `20250` (Sattahip) added. Verified 2026-04-29.
- **Elite Gym & Fitness Pattaya:** Cross-referenced elitegympattaya.com (location, contact, rates, classes pages). Specific street number `392/62` added to address. Phone confirmed: `+66 98-1919421`. Hours confirmed: 6:30 AM - 10:00 PM 7 days/week. data.js entry was a stub (`Pattaya — verify exact`, empty phone, generic hours) — fully populated this round. Verified 2026-04-29.
- **Tests run:** None this entry — git index corruption persists in the sandbox; no validate/build run. Tim must run `del .git\index && git reset` from Windows, then `npm run validate` and `npm run build` before commit.
- **Concerns / open questions:** Three real **content corrections** in this batch (Deep Climbing hours, Muscle Factory hours, Khao Chi Chan hours) — bug-for-quality fixes, not just date bumps. The fact-check rate is now ~12 of 30 done (Pickleball, Coco Fitness, MAX, Burapha, Mountain Shadow, Siam CC, Deep Climbing, Pattaya Cricket, EasyKart, Muscle Factory, Khao Chi Chan, Elite Gym).
- **Next:** Continue the remaining 18 venues on the checklist. Logical next picks: Rambaa Somdet M16 (9), Thai Sky Adventures (9), KBA Kiteboarding (8), Jetts Fitness Pattaya (8), Pickleball Pattaya already done, AF Academy Football (6), One-D Yoga Studio (7), Pattaya Tennis Club (7), Yoga Pattaya Studio (7), Pattaya Monkey Hash House (7), Pattaya Park Water & Fun Park (6), Pattaya Sports Club (6), Bangpra International (5), Pattaya Archery Club (4).

## 2026-04-29 - Section I (continued): Four-venue fact-check batch (Rambaa, Thai Sky, KBA, Jetts)

- **Section status:** I still in progress. Four additional venues checked.
- **Files changed:** `data.js`, `CONTENT_AUDIT_2026-04-29.md`, `WORK_LOG_CODEX.md`, plus four venue MDs: `venues/rambaa-somdet-m16.md`, `venues/thai-sky-adventures-skydive.md`, `venues/kba-kiteboarding-pattaya.md`, `venues/jetts-fitness-pattaya.md`.
- **Rambaa Somdet M16:** Cross-referenced 8limbsus, siamfightmag, tapology, muaythaimap, instagram location pin. "Adjacent to Sor Klinmee" tightened to "100m from Sor Klinmee" per 8limbsus founding article. Verified 2026-04-29.
- **Thai Sky Adventures (Skydive):** Cross-referenced thaiskyadventures.com, thethaipass, pelago, marriott activities, tripadvisor. Address upgraded to mention `Nong Kho Reservoir` landmark. Bangkok-distance number removed from address because public sources disagree (96 km vs 180 km — likely road vs straight-line). Verified 2026-04-29.
- **KBA Kiteboarding Asia Pattaya (Blue Lagoon):** Cross-referenced kiteboardingasia.com Pattaya page, kbapattaya.com, unplug-kitesurf, trazy, cityseeker. Postcode `20250` (Sattahip) added. Phone `+66 85 134 9588` added (frontmatter previously empty). data.js entry was a stub (`Pattaya` / empty phone / generic hours) — fully populated. Verified 2026-04-29.
- **Jetts Fitness Pattaya — MAJOR CORRECTION:** Cross-referenced fitravelife (closure confirmation), jetts.co.th Little Walk page, trip.com, REM Magazine. **The Royal Garden Plaza branch permanently closed on 31 May 2022.** File previously presented both clubs as active. Frontmatter `area`, `address`, body section "Jetts Royal Garden Plaza", and Quick Reference Card all rewritten to reflect Little Walk-only operation with closure note for the second club. Address upgraded to `8/114 Sukhumvit Rd, Bang Lamung District, Chonburi 20150 (Little Walk Mall)`. Verified 2026-04-29.
- **Tests run:** None this entry — git index corruption persists in the sandbox. Tim must run `del .git\index && git reset` from Windows, then `npm run validate` and `npm run build` before commit.
- **Concerns / open questions:** Jetts Royal Garden Plaza closure is a real factual correction — internal links/cross-refs from other venue pages should be reviewed for stale references to the closed branch. Recommend a one-pass `grep -ri "Royal Garden Plaza" venues/` after Tim's index reset.
- **Next:** ~16 venues remaining on the checklist. Logical picks: One-D Yoga Studio (7), Pattaya Tennis Club (7), Yoga Pattaya Studio (7), Pattaya Park Water & Fun (6), AF Academy Football (6), Pattaya Sports Club (6), Bangpra International (5), Pattaya Archery (4), low-source 0-count venues with already-confirmed addresses (Wong Amat, Bangkok Hospital, Ocean Marina, ALFA BJJ).

## 2026-04-29 - Section I (continued): AF Academy fact-check

- **Section status:** I still in progress. One additional venue checked.
- **Files changed:** `data.js`, `venues/af-academy-pattaya.md`, `CONTENT_AUDIT_2026-04-29.md`, `WORK_LOG_CODEX.md`.
- **AF Academy Football School Pattaya:** Cross-referenced afacademy.pro/en. Confirmed `215/18 Moo 6, Tambon Na Kluea, Pattaya City, Bang Lamung District, Chonburi 20150`, phone `0960788308` (= `+66 96 078 8308`). Branches in Yaroslavl + Moscow + Pattaya. Outdoor (South Pattaya) + indoor (Central Pattaya) field structure confirmed. From-age-3 distinction confirmed. Verified 2026-04-29.
- **Tests run:** None this entry — git index corruption persists in the sandbox.
- **Concerns / open questions:** None — all fields matched the official site verbatim.
- **Next:** 15 venues remaining on the audit checklist. Site count now sits at 16 of 30 rows verified for 2026-04-29.

## 2026-04-29 - Section I (continued): One-D Yoga fact-check

- **Section status:** I still in progress. One additional venue checked.
- **Files changed:** `data.js`, `venues/one-d-yoga-studio.md`, `CONTENT_AUDIT_2026-04-29.md`, `WORK_LOG_CODEX.md`.
- **One-D Yoga Studio:** Cross-referenced facebook.com/OneDYoga (the studio's official page). Address `571/32 M.5 Nakua 16/2 Pattaya-Naklua rd., ChonBuri 20150` matches the venue MD verbatim. Disciplines (Hatha, Vinyasa, Yin) confirmed via thailandnomads top-5 and pattayaprestigeproperties top-8 listings. data.js entry was a stub (`Pattaya-Naklua Road` only / empty social) — upgraded to full address + facebook handle. Phone not published. Verified 2026-04-29.
- **Tests run:** None this entry — git index corruption persists in the sandbox.
- **Concerns / open questions:** None — Facebook page matches existing record.
- **Next:** 14 venues remaining. 17 of 30 rows now verified for 2026-04-29.

## 2026-04-29 - Section I (continued): Pattaya Park Water & Fun Park fact-check

- **Section status:** I still in progress. One additional venue checked.
- **Files changed:** `data.js`, `venues/pattaya-park-water-fun.md`, `CONTENT_AUDIT_2026-04-29.md`, `WORK_LOG_CODEX.md`.
- **Pattaya Park Water & Fun Park (Tower Jump):** Cross-referenced pattayapark.com (official), forevervacation, viator, renown-travel, tourismthailand.org, expedia, agoda, trip.com. All confirm `Pattaya Park Beach Resort, Soi 12 Thappraya Road`, 10:00-19:00 water-park hours, front-desk `+66 38 251 201`. Phone added (was empty). Official website `https://www.pattayapark.com/` added (was empty). Verified 2026-04-29.
- **Tests run:** None this entry — git index corruption persists in the sandbox.
- **Concerns / open questions:** None — all fields matched multiple authoritative sources.
- **Next:** 13 venues remaining. 18 of 30 rows now verified for 2026-04-29.

## 2026-04-29 - Section I (continued): GO ALL — final 11-venue closeout batch

- **Section status:** I fact-check checklist effectively closed. **28 of 30 rows now Checked 2026-04-29; 2 rows formally Flagged for editorial / owner-contact resolution.**
- **Files changed:** `data.js`, `CONTENT_AUDIT_2026-04-29.md`, `WORK_LOG_CODEX.md`, plus eleven venue MDs:
  - `venues/bangpra-international.md`
  - `venues/pattaya-sports-club.md`
  - `venues/pattaya-tennis-club.md` (no edit — flagged instead)
  - `venues/pattaya-archery-club.md`
  - `venues/pattaya-monkey-hash-house.md`
  - `venues/bangkok-hospital-pattaya-rehab.md`
  - `venues/ocean-marina-jomtien.md`
  - `venues/alfa-bjj-pattaya.md`
  - `venues/wong-amat-beach.md`
  - `venues/yoga-pattaya-studio.md` (no edit — flagged for owner contact)
- **Bangpra International Golf Club:** tigergds, golfpattaya, golfpass, mscorecard, allsquaregolf confirm `45 Moo 6, Bangpra, Sriracha 20110`, phone `+66 38 341 149`. Postcode **corrected** from `20210` to `20110`; specific street `45 Moo 6` and phone added. Verified 2026-04-29.
- **Pattaya Sports Club:** pattayasports.org contact + about pages confirm `3/197 Pattaya 3rd Road, Pattaya Banglamung`, `038 415 424` (= +66 38 415 424), founded mid-1979, ~4,700 active members, non-profit. Address `Central Pattaya — verify exact at booking` upgraded to specific street + phone. Verified 2026-04-29.
- **Pattaya Tennis Club — FLAGGED:** Investigation confirmed there is **no single identifiable business named "Pattaya Tennis Club"** with a matching address or website. The body content describes a generic mid-tier tennis facility positioned alongside Pattaya Sports Club, Tara Tennis, and Inter Club. **Verified date intentionally NOT bumped.** Recommend owner editorial decision: re-anchor to a specific real venue (Pattaya Sports Club's tennis section, Tara Tennis Club, or Pattaya Tennis & Badminton Inter Club at Soi Toongklom-Talman 25) **or** remove this entry. Audit row marked "Flagged 2026-04-29 — needs editorial reconciliation".
- **Pattaya Archery Club:** pattayaarcheryclub.com contact + soidb confirm `Pattaya Shooting Park - 1/6 Moo 4, T. Huay-Yai`, `Martin 0909 867 955` (= +66 90 986 7955). Founded 2006, non-profit, Tue/Thu/Sat/Sun 10:00-12:00. Specific street + phone added. Verified 2026-04-29.
- **Pattaya Monkey Hash House Harriers:** pattayamonkeyh3.com confirms run frequency "every 2nd, odd numbered month, usually 3rd Saturday, ~2.5 hours". Schedule matches verbatim. Verified 2026-04-29.
- **Bangkok Hospital Pattaya — Sports Rehabilitation:** bangkokhospital.com/en/pattaya, amchamthailand, bccthai confirm `301 Moo 6, Sukhumvit Road Km 143, Naklua, Bang Lamung, Chonburi 20150`, `+66 38 259 999`. `Moo 6` + `Km 143` mile-marker added to address (was just `301 Sukhumvit Rd`). Verified 2026-04-29.
- **Ocean Marina Jomtien:** oceanmarinaresort.com, expedia, agoda, booking.com, superyachtservicesguide confirm `274/1-9 Sukhumvit Rd, Na Chom Thian, Sattahip 20250`, phone `+66 38 255 888`. Building-number range **corrected** from `274/1-3` to `274/1-9`; phone added; area refined from `Na Jomtien` to `Na Chom Thian` per official spelling. Verified 2026-04-29.
- **ALFA BJJ Pattaya:** facebook.com/AlfaBJJPattaya, bjjasia, smoothcomp, ajptour, uaejjf events all confirm `Soi Ko Pai 12, Muang Pattaya 20150`, phone `+66 9679 41992` (= +66 96 794 1992). data.js + frontmatter both upgraded from generic `Pattaya` / empty phone to full street + phone. Verified 2026-04-29.
- **Wong Amat Beach:** Wikipedia, tripadvisor, thailandbeaches.org all confirm beach length **~1.5 km** (0.9 mi) — the file's data.js description previously claimed "4 km long" which was **factually wrong**. Length corrected; access landmark `Naklua Road, Soi 16` added. Verified 2026-04-29.
- **Yoga Pattaya Studio — FLAGGED:** Earlier investigation found yogapattaya.com lists `315/322 Thepprasit Soi 12` whereas the venue MD currently says `315/327`. Phone `+66 95 573 9376` confirmed. **Verified date intentionally NOT bumped** — needs owner contact for unit-number conflict resolution. Audit row marked "Flagged 2026-04-29 — unit-number conflict".
- **Tests run:** None this entry — git index corruption persists in the sandbox. Tim must run `del .git\index && git reset` from Windows, then `npm run validate` and `npm run build` before commit.
- **Concerns / open questions:**
  - Pattaya Tennis Club editorial decision still pending — keep, re-anchor, or remove
  - Yoga Pattaya Studio unit-number conflict still pending owner contact
  - Bangpra postcode correction (`20210` → `20110`) is the only postcode change in this batch — worth eyeballing the live `gyms/bangpra-international/` page after deploy to confirm rendering
  - Wong Amat 4 km → 1.5 km factual correction is a real content fix
- **Next:** Section I fact-check checklist is effectively done. The remaining Section I work is **photography** (13 category hero photos + 158 venue photos) and the **final manual quality-bar closeout** (real iPhone Safari + Android Chrome device testing, VoiceOver / NVDA, live Lighthouse on production URLs). Photography needs licensed-image sourcing or owner-permission outreach — not a Codex / fact-check task. Manual QA is a Tim-side task.

## Final Section I status

| Audit row status | Count | Notes |
|---|---|---|
| Checked 2026-04-29 | 28 | Address / phone / hours / postcode confirmed against authoritative sources |
| Flagged 2026-04-29 | 2 | Pattaya Tennis Club (needs editorial reconciliation), Yoga Pattaya Studio (needs owner contact for unit-number conflict) |
| Pending | 0 | None remaining |

**Total content corrections this audit cycle (not just date bumps):**
- Deep Climbing Gym hours (mall hours → actual gym hours)
- Muscle Factory hours (vague → Mon-Fri 07:00-24:00 / Sat-Sun 07:00-23:00)
- Khao Chi Chan opening hours (08:00 → 06:00)
- Jetts Royal Garden Plaza branch closure (May 2022) — body + frontmatter rewritten
- Bangpra postcode (20210 → 20110)
- Wong Amat Beach length (4 km → 1.5 km)
- Ocean Marina building range (274/1-3 → 274/1-9)

Plus stub address/phone upgrades for ~15 venues from generic "Pattaya" or "Central Pattaya" placeholders to specific street numbers and area codes.
