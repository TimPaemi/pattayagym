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

## 2026-04-29 - Section I (continued): Jetts Royal Garden Plaza cross-reference sweep

- **Section status:** Editorial cleanup follow-up to the Jetts Royal Garden Plaza closure correction.
- **Files changed:** `venues/jetts-fitness-pattaya.md`, `venues/castra-gym.md`, `venues/fitness-7.md`, `venues/sun-fitness-buakao.md`, `venues/platinum-fitness.md`.
- **Why:** After fixing the Jetts page itself, a sweep across all 158 venue MDs found 5 other pages still claiming "Jetts (Little Walk + Royal Garden)" or "Jetts (2 locations)" in market-position tables and Overview prose. Those are now stale and were corrected to "Jetts (Little Walk Mall)" or equivalent.
- **Specific edits:**
  - `castra-gym.md` line 50: `Jetts (Little Walk, Royal Garden)` → `Jetts (Little Walk Mall)`
  - `fitness-7.md` line 52: `Jetts (Little Walk + Royal Garden)` → `Jetts (Little Walk Mall)`
  - `sun-fitness-buakao.md` line 37 (Overview): `Jetts at Little Walk + Royal Garden` → `Jetts at Little Walk Mall`
  - `sun-fitness-buakao.md` line 52 (table): `Jetts (2 locations)` → `Jetts (Little Walk Mall)`
  - `platinum-fitness.md` line 40 (table): `Jetts (2 locations)` → `Jetts (Little Walk Mall)`
  - `jetts-fitness-pattaya.md` line 38 (Overview): rewritten from "operates from at least two key locations" claim to single-location reality with closure explanation
  - `jetts-fitness-pattaya.md` line 82 (Pattaya Locations section): address upgraded from `Little Walk Mall, Pattaya 2nd Road, Central Pattaya` → `8/114 Sukhumvit Rd, Bang Lamung District, Chonburi 20150 (Little Walk Mall)`. The "Pattaya 2nd Road" claim was geographically wrong; Little Walk is on Sukhumvit / Pattaya Klang
- **Remaining incidental references:** A few non-Jetts mentions of "Royal Garden Plaza" survive in `jumpz-trampoline-park.md` line 32 (listing it as a family-friendly mall — still factually correct, the mall itself is still open) and `manhattan-pattaya-fitness.md` line 64 ("walking access to both Pattaya Beach and Jomtien Beach" — unrelated geographic phrase). No edits needed.
- **Tests run:** None — git index corruption persists in the sandbox.
- **Concerns / open questions:** Sweep was constrained to body-text claims about Jetts having 2 locations. The build-discovery cross-link auto-generator may also surface stale anchor text — recommend a post-deploy `npm run build` re-run to regenerate the gyms/*/ HTML output and confirm no auto-generated cross-link references stale data.
- **Next:** Section I content polish is now substantively done. Remaining handoff items: licensed photography (Tim-side decision on stock vs. owner outreach), final manual QA closeout (real iPhone Safari + Android Chrome + VoiceOver/NVDA + live Lighthouse on production URLs), Yoga Pattaya unit-number resolution (owner contact), Pattaya Tennis Club editorial decision (keep / re-anchor / remove), Pending tasks #7 + #8 (www subdomain redirect + Google Search Console submission).

## 2026-04-29 - Section I (continued): data.js truncation recovery + green-build confirmation

- **Section status:** Recovery + verification.
- **Files changed:** `data.js` (restored from `git show HEAD:data.js`), `WORK_LOG_CODEX.md`.
- **What happened:** Mid-session, ran `node validate.js --all-warnings` to investigate the 755-warning baseline. The script crashed with `SyntaxError: Unexpected token ')'` at line 232. Investigation showed `data.js` had been silently truncated mid-line at the InterContinental Pattaya entry (line 229) — the recurring edit-tool truncation bug that has bitten previous sessions. The on-disk file was 228 lines with the InterContinental entry cut off after `hours: "24/7 fitness for guests; spa daily",`. The closing `];` and `module.exports`/`window` assignments were lost.
- **Recovery:** `git show HEAD:data.js > data.js` restored the file. Critical insight: **HEAD already contained all my data.js edits from this entire session** — Tim must have been committing/pushing the work between batches from his Windows terminal, so HEAD at the time of restoration was a clean canonical copy of every fact-check edit. Diff between truncated working tree and HEAD was exactly 11 lines (the truncated tail).
- **Verification post-restore:**
  - `node --check data.js` → **SYNTAX OK**
  - `node validate.js` → **Validation: 0 error(s), 750 warning(s)** (down from 755 — the 5-warning reduction comes from this session's stub upgrades adding previously-missing optional fields)
  - `node build.js` → **Generated 158 venue pages (158 deep + 0 stubs)**
  - All other critical files (build.js, build-extras.js, build-discovery.js, index.html, app.js, styles.css, venue.css, compare.js, compare/index.html, validate.js) compared line-counts against HEAD: **all clean, no other truncation**.
  - All 18 critical venue MDs touched this session (Jetts, Deep Climbing, Muscle Factory, Khao Chi Chan, Elite Gym, EasyKart, Wong Amat, ALFA BJJ, Bangkok Hospital, Ocean Marina, Pattaya Park, Bangpra, Sports Club, Archery, Castra, Fitness 7, SUN Fitness, Platinum) compared against HEAD: **all clean**.
- **Concerns / open questions:** The truncation bug is intermittent and there's no preventive fix from the sandbox side. Recommendation: keep the `git show HEAD:data.js > data.js` recovery pattern documented for future sessions. Encouragingly, this time HEAD was up-to-date with the session's work, so recovery was lossless — that depended on Tim's commit cadence keeping pace with the work. **For future sessions, batching commits more aggressively (after every 3-5 edits) would minimise loss exposure.**
- **Final session state:**
  - `data.js`: 239 lines, syntax green, 158 venues
  - Validation: 0 errors, 750 warnings
  - Build: 158 deep + 0 stubs
  - Section I fact-check: 28/30 Checked, 2/30 Flagged
  - Cross-reference sweep complete (Jetts Royal Garden Plaza)
  - Recovery from truncation complete
  - Ready for Tim's deploy commit + push

- **Next:** Tim's git/deploy flow remains: `del .git\index && git reset` (if needed) → `git status` → `git add` → `git commit` → `git push`. The deploy command list from the earlier message is still accurate; `data.js` is in clean post-restore state and includes all fact-check work.

## 2026-04-29 - Section I closeout: discovered backlog (post-Section I work)

While running validate.js to confirm green build, surfaced **750 warnings** worth a triage so future sessions know what's structural vs. cosmetic.

**Warning distribution (validate.js --all-warnings):**

| Type | Count | Severity | Notes |
|---|---|---|---|
| Missing optional MD frontmatter field (`description`, `tags`, `mapsUrl`, `phone`, `website`) | 584 | Low — most fields are present in `data.js`; the validator just notes when they're absent from MD frontmatter. Build still works because build.js reads from data.js | Low priority — pure metadata cosmetic |
| Area string differs MD vs data.js | 109 | Low — display only; MDs typically have richer phrasing | Resync data.js to match MD canonical phrasing in a future editorial pass |
| Name string differs MD vs data.js | 55 | Medium — affects displayed names + canonical URLs / schema | Worth a focused editorial sync pass; risk of SEO regressions if done carelessly |

**One real structural issue worth flagging for future work:**

- **Duplicate AF Academy entries:** `data.js` and `venues/` contain **two separate records for the same business** — `af-academy-football` (older stub-era entry, name: "AF Academy", verified 2026-04-27) and `af-academy-pattaya` (deeper entry, name: "AF Academy Football School Pattaya", verified 2026-04-29). Both share website `https://www.afacademy.pro/en`. This generates two distinct URLs (`/gyms/af-academy-football/` and `/gyms/af-academy-pattaya/`) which is real duplicate-content SEO risk. **Not fixed this session** because deduplication requires URL handling (301 redirects via `_redirects`), schema-cross-link sweeps, sitemap update — out of scope for fact-checking. Recommend a future Section M (or J extension) cleanup pass: pick the `af-academy-pattaya` entry as canonical (richer detail, verified 2026-04-29), 301-redirect `/gyms/af-academy-football/` → `/gyms/af-academy-pattaya/`, remove the stub from `data.js`.

**Verification of additional file integrity (post-truncation recovery):**

All 18 critical venue MDs touched this session compared cleanly against HEAD line-counts. All 10 critical JS/HTML/CSS files compared cleanly against HEAD. **The truncation was isolated to data.js only** and is now fully recovered.

## 2026-04-29 - Section M (post-Section I): data.js name resync (cards / listings / search)

- **Section status:** New cleanup section to address the 55 name mismatches between MD frontmatter and data.js. Editorial sync to make cross-cutting pages (cards, category listings, area pages, search, related-venue widgets, schema ItemList) display the same name as the venue's deep page.
- **Files changed:** `data.js`, `WORK_LOG_CODEX.md`.
- **Edits applied (data.js name field, syncing to MD canonical):**
  - `fight-evo360`: `FIGHT EVO360` → `Fight EVO360 Muay Thai Gym`
  - `tonys-gym`: `Tony's Gym` → `Tony's Fitness Gym (Tony's Group Pattaya)`
  - `wko-muay-thai`: `WKO Muay Thai & Fitness (ISS Gym)` → `WKO Muay Thai & Fitness Pattaya (ISS Gym)`
  - `treasure-hill-golf`: `Treasure Hill Golf Club` → `Treasure Hill Golf & Country Club`
  - `chee-chan-golf`: `Chee Chan Golf` → `Chee Chan Golf Resort`
  - `pattana-sports-resort`: `Pattana Sports Resort` → `Pattana Golf Club & Resort (Pattana Sports Resort)`
  - `tos-tennis`: `Tos Tennis Pattaya` → `TOS Tennis Club / TOS Tennis Academy`
  - `bira-circuit`: `Bira Circuit (FIA Motor Racing Track)` → `Bira Circuit (FIA-Standard Motor Racing Track)`
  - `fitz-club`: `Fitz Club (Royal Cliff Hotels)` → `Fitz Club — Racquets, Health & Fitness (Royal Cliff Hotels Group)`
  - `sun-fitness-buakao`: `SUN Fitness Buakao` → `SUN Fitness Pattaya (3 branches)`
  - `manhattan-pattaya-fitness`: `Manhattan Pattaya Fitness` → `Manhattan Pattaya (Hotel Gym)`
  - `kba-kiteboarding-pattaya`: `KBA - Kiteboarding Asia Pattaya` → `KBA Kiteboarding Asia Pattaya (Blue Lagoon)`
  - `thai-sky-adventures-skydive`: `Thai Sky Adventures (Skydive Pattaya)` → `Thai Sky Adventures (Tandem Skydiving Pattaya)`
  - `deep-climbing-gym`: `Deep Climbing Gym` → `Deep Climbing Gym (Harbor Pattaya)`
  - `ocean-marina-jomtien`: `Ocean Marina Jomtien — Southeast Asia Largest Marina` → `Ocean Marina Jomtien — Southeast Asia's Largest Marina` (added missing apostrophe)
  - `pattaya-park-water-fun`: `Pattaya Park Water & Fun Park (Tower Jump)` → `Pattaya Park Water & Fun Park (with Tower Jump)`
  - `wong-amat-beach`: `Wong Amat Beach — Naklua Family Swimming Beach` → `Wong Amat Beach — Naklua / Pattaya's Family Swimming Beach`
- **Why these:** Each was a clear improvement — disambiguator added (Harbor Pattaya, Blue Lagoon, ISS Gym, 3 branches, Hotel Gym, Tower Jump), grammatical fix (added missing apostrophe in "Asia's"), or correctness (FIA-Standard, Tandem Skydiving). Skipped purely-decorative editorial suffixes (e.g. "— Wellness, Fitness & Spa") on hotel/resort entries where the brand-only name is more standard.
- **Truncation event during this section:** Mid-edit, data.js was silently truncated again — the working tree shrank from 239 to 229 lines, cutting off mid-line at the Holiday Inn entry. Recovered by stitching: kept the on-disk file's lines 1-229 (which had all 17 name resyncs intact) and appended HEAD's lines 230-239 (Holiday Inn entry + closing brackets + module.exports + window assignments). **No edits were lost.**
- **Tests run post-restore:**
  - `node --check data.js` → SYNTAX OK
  - `node validate.js` → **Validation: 0 error(s), 733 warning(s)** (down from 750 — **17-warning reduction** confirms the resyncs took effect across the validator's name-mismatch + redundant-warnings cascade)
  - `node build.js` → **Generated 158 venue pages (158 deep + 0 stubs)**
  - Name-mismatch warnings down from 55 → 38 (17 resolved)
- **Concerns / open questions:** The data.js truncation bug is now confirmed to recur whenever the file is edited multiple times in rapid succession from this sandbox. Recommendation: keep batches small (≤5 edits per data.js session, then commit + verify before continuing). 38 name mismatches remain — most are purely-decorative editorial suffix differences (hotel/resort tier descriptors). Future cleanup can decide whether to keep them as deliberate brevity-on-cards or sync them too.
- **Next:** Stop editing data.js this session to avoid further truncation. Tim's deploy flow: stage data.js + WORK_LOG_CODEX.md + regenerated cross-cutting pages → commit → push.

## 2026-04-29 - Section M (continued): Atomic Python writes for bulk area + name resync

- **Section status:** Continuation of Section M. Switched from `Edit` tool (which kept truncating data.js) to atomic Python rewrites that load → modify in memory → write whole file once. **No truncation events** during these atomic batches, even with 30-40 edits per batch.
- **Files changed:** `data.js`, plus `venues/andaz-pattaya-jomtien.md`, `venues/cape-dara-resort.md`, `venues/centara-grand-mirage.md`, `venues/st-andrews-2000.md`, `WORK_LOG_CODEX.md`.
- **Batch 1 — 12 area edits:** Replaced generic `area: "Pattaya"` placeholders with MD canonical specifics for `ashtanga-yoga-pattaya`, `bean-cow-climbing-gym`, `dragon-shooting-club`, `greta-sport-club`, `manhattan-pattaya-fitness`, `no-limit-divers`, `pattaya-country-club`, `pattaya-scuba-adventures`, `pattaya-tennis-badminton-inter-club`, `regents-international-school-pattaya`, `tos-tennis`, `true-fitness-pattaya`. **Warnings 733 → 727** (-6).
- **Batch 2 — 6 area edits:** Replaced generic `area: "Pattaya region"` for `chee-chan-golf`, `khao-kheow-country-club`, `mountain-shadow-country-club`, `pattana-sports-resort`, `phoenix-gold-golf`, `st-andrews-2000`. **Warnings 727 → 721** (-6).
- **Batch 3 — 25 area edits across A-F venues:** Adventure Divers, AF Academy (both records), ALFA BJJ, Aquanauts, Bangpra, Bira Circuit, Burapha, Cape Dara, Cartoon Network, Castra, Centara, Chatrium Soi Dao, Cho Nateetong, ClubLoongchat, Coco Fitness, Cross Pattaya Pratamnak, Deep Climbing, Diamond Badminton, Dive Station, Elite Gym, Fast Pro Football, Fight EVO360, Fitness 7, Fitz Club, Flight of the Gibbon. **Warnings 721 → 699** (-22; sub-700 milestone).
- **Batch 4 — 38 area edits across G-Y venues:** AF Academy, Alfa BJJ, Anytime Fitness, ATV Tours, Balance Yoga, Bangkok Hospital, Castra Gym, Golf Hub, Greenwood, Greta, Hard Rock, Hilton, Jetts, Jomtien Dive, JumpZ, KBA, Khao Chi Chan, Kitesurf Pattaya, Kombat Group, Manta Kids, NongNooch, Ocean Marina, Pattaya Archery, Pattaya Bowl, Pattaya Cricket, Pattaya Cycling, Pattaya Park, Pattaya Petanque, Pattaya Public Pool Naklua, Pattaya Running Routes, Pattaya Scuba, Pattaya Sports Club, Pattaya Tennis & Badminton, Pattaya Thai Boxing, Platinum Fitness, Play Padel. **Warnings 699 → 662** (-37).
- **Batch 5 — 38 area edits across L-Y venues (rest):** Laem Chabang, Lumpinee, MAX Muay Thai, Mermaids Dive, Nok Yoga, One-D Yoga, Pattaya Country Club, Pattaya Dive Centre, Pattaya Hash House, Pattaya Marathon, Pattaya Monkey Hash, Pattaya Sky Ride, Pattaya Triathlon, Pratumnak Fitness Park, Rage Fight, Rajadamnern, Ramayana, Rambaa Somdet, Real Divers, SailBreeze, Seafari PADI, SF Strike Bowl, Siam Bayshore, Siam Country Club, Sor Klinmee, SUN Fitness, Tarzan Adventure, Thai Polo, Thai Sky Adventures, Thai Wake Park, Tony's Gym, Tos Tennis, Treasure Hill, True Fitness, Underwater World, Venum, Wave Pattaya, Yoga Haus. **Warnings 662 → 624** (-38).
- **Batch 6 — 30 name edits:** Synced data.js name to MD canonical for AF Academy Football, ATV Tours, Bean Cow, Big Buddha Hill, Cartoon Network, Chatrium Soi Dao, Cross Pattaya Pratamnak, EasyKart, Fitness 7, Flight of the Gibbon, Hilton, Jomtien Beach Volleyball, JumpZ (reverse — MD-to-data.js), Koh Larn, Manta Kids, No Limit Divers, NongNooch, Pattaya Bowl, Pattaya Cycling Clubs, Pattaya Lawn Bowls, Pattaya Marathon, Pattaya Padel, Pattaya Running Routes, Pattaya Sky Ride, Planet Football, Ramayana Water, Rusich Club, SailBreeze, Siam Bayshore Tennis, Underwater World. **Warnings 624 → 594** (-30).
- **Batch 7 — 4 hotel/resort MD-to-data.js + 4 data.js-to-MD:** For brand-only hotel cards on cross-pages, dropped the editorial suffix from MD (Andaz, Cape Dara, Centara, St. Andrews 2000) so MD = data.js brand name; updated data.js for First Serve, Greta, Hard Rock, Sitpholek to match MD canonical. **Warnings 594 → 586** (-8).
- **Final tally for Section M:**
  - **Warnings before resync:** 750 (initial baseline at start of session)
  - **Warnings now:** 586
  - **Reduction:** 164 warnings (22% improvement)
  - **Name mismatches:** 55 → 0 (all 55 resolved or aligned)
  - **Area mismatches:** 109 → 0 (all 109 resolved)
  - **Remaining 586 warnings:** 100% are `missing optional field` metadata cosmetic — `description`, `tags`, `mapsUrl`, `phone`, `website` not duplicated in MD frontmatter (already present in data.js, build still works correctly)
- **Tests run:**
  - `node --check data.js` → SYNTAX OK (239 lines, no truncation)
  - `node validate.js` → **0 errors, 586 warnings**
  - `node build.js` → **Generated 158 venue pages (158 deep + 0 stubs)**
- **Lessons learned about the truncation bug:** The `Edit` tool truncates data.js when called many times in succession (probably an auto-save race or buffer overflow). Atomic Python read → modify → write avoids the issue completely — 7 atomic batches with 153 total edits caused zero truncation events. **Recommendation: future bulk-edit work on data.js should use atomic Python writes, not the Edit tool.**
- **Remaining cleanup work for future sessions:**
  - 586 missing-optional-field warnings — purely cosmetic, can backfill venue MD frontmatter from data.js values for completeness
  - AF Academy duplicate (`af-academy-football` vs `af-academy-pattaya`) — needs URL handling decision
  - Pattaya Tennis Club generic-venue editorial reconciliation
  - Yoga Pattaya Studio unit-number conflict (315/327 vs 315/322)
- **Cross-page consistency:** Every venue card on the homepage, every category listing, every area page, every guide ranking, every related-venue widget, every search result, every comparison entry, and every JSON-LD ItemList now displays the same name and area as the venue's deep page. **Brand and SEO consistency restored across the entire 158-venue, 200+ HTML page site.**

## 2026-04-29 - Section M (continued): MD frontmatter backfill from data.js (final cleanup)

- **Section status:** Final warning-cleanup pass. Backfilled description, tags, mapsUrl from data.js records into the corresponding MD frontmatter for **135 venues** that previously had these fields missing in YAML frontmatter (the values existed in data.js, just weren't duplicated in MD).
- **Files changed:** `data.js` (no changes — read-only source), 135 venue MDs in `venues/`, `WORK_LOG_CODEX.md`.
- **Method:** Atomic Python script — loaded data.js via Node into JSON, parsed each MD frontmatter, identified missing optional fields, appended them at end of frontmatter (before closing `---`) with proper YAML quoting for strings containing apostrophes/colons/special chars, wrote each MD back. **No truncation events** — atomic write avoided the Edit-tool issue.
- **Backfill counts:**
  - **description:** 135 added
  - **tags:** 135 added
  - **mapsUrl:** 135 added
  - **phone:** 0 added (data.js values are empty strings — would not satisfy validator's `trim() === ''` check)
  - **website:** 0 added (same reason)
- **Verification:**
  - `node --check data.js` → SYNTAX OK
  - `node validate.js` → **0 errors, 181 warnings** (down from 586 — **−405 warnings, 69% reduction in this batch alone**)
  - `node build.js` → **Generated 158 venue pages (158 deep + 0 stubs)**
  - All 135 modified MDs verified syntactically valid YAML
- **Remaining 181 warnings — composition:**
  - **123 missing phone** — data.js records have `phone: ""` for these venues; no external phone data available
  - **56 missing website** — data.js records have `website: ""` for these venues; venue has no published website
  - **0 area mismatches**
  - **0 name mismatches**
  - **0 empty markdown bodies**
  - **0 missing description / tags / mapsUrl**
- **Total session warning reduction:** **750 → 181 = 569 warnings cleared (76% reduction)**.

## Final session summary (Tim's deploy state)

| Metric | Session start | Session end | Δ |
|---|---|---|---|
| Validation warnings | 750 | **181** | **−569 (76%)** |
| Validation errors | 0 | **0** | clean |
| Build output | 158 deep + 0 stubs | 158 deep + 0 stubs | clean |
| data.js syntax | OK | **OK** | clean (after 2 truncation recoveries) |
| Section I fact-check rows checked | 3/30 | **28/30** | **+25 venues** |
| Section I rows formally flagged | 0 | 2 | (Pattaya Tennis Club, Yoga Pattaya Studio) |
| Cross-page name mismatches | 55 | **0** | **−55 (100%)** |
| Cross-page area mismatches | 109 | **0** | **−109 (100%)** |
| MD frontmatter description coverage | 23 venues | **158 venues** | **+135** |
| MD frontmatter tags coverage | 23 venues | **158 venues** | **+135** |
| MD frontmatter mapsUrl coverage | 23 venues | **158 venues** | **+135** |
| Real factual corrections shipped | — | 7+ (Jetts closure, hours, postcodes, length) | — |

**The remaining 181 warnings are now ALL "we genuinely don't know the phone/website" residuals** — pure data-gap warnings, not consistency issues. Filling them requires external venue contact / research, not data-cleanup work.

**Recommendation for Tim's deploy:** stage data.js + venues/ + WORK_LOG_CODEX.md + the auto-regenerated `gyms/`, `area/`, `category/`, `guides/`, `map/`, `pattaya-sport-stats/`, `sitemap.xml`, `feed.xml`, `feed/` and push. The validation now sits at the **clean baseline** that future work should maintain (0 errors + only data-gap warnings).
