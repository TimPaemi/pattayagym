# FULL WEBSITE AUDIT REPORT

**Site:** https://pattaya-gym.com  
**Audit date:** 2026-05-31 (evidence refreshed 2026-06-02 build `v452`, commit `d5f7624` on `main`)  
**Method:** Repo discovery, `verify-deploy.js`, `content-quality-audit.js`, live HTTP/CSP checks, targeted grep/crawl, prior `FULL_WEBSITE_AUDIT_2026-06-02.md` cross-check (many items now fixed).  
**Mode:** Audit only — no fixes applied.

---

## 1. Executive Summary

Pattaya.Gym is a **mature, high-intent static directory** with strong technical SEO foundations (sitemap, schema, CSP/HSTS, network hub, 44 editorial guides, 157 venue pages). It is **not** in a “ship with confidence” state for conversion tools after Round 66: **Content-Security-Policy on production is missing hashes for new inline scripts on `/compare/` and `/plan-my-trip/`**, which likely **blocks those tools in real browsers**. Separately, **`/outreach/venue-outreach.csv` is publicly downloadable (HTTP 200)** — an operational data leak.

| Dimension | Grade (1–10) |
|-----------|----------------|
| **Overall** | **7.5** |
| SEO | 8.0 |
| UI/UX | 8.0 |
| Mobile | 7.5 |
| Desktop | 8.5 |
| Performance | 7.5 |
| Content | 8.0 |
| Network linking | 8.5 |
| Trust / safety | 6.5 |

### Biggest 5 problems

1. **CSP hash drift** — `verify-deploy.js` FAIL: 3 inline-script hashes missing from `_headers`; live CSP has 9 hashes, repo computes 12. **Compare / Plan likely broken on production.**
2. **Public outreach CSV** — `https://pattaya-gym.com/outreach/venue-outreach.csv` returns **200** (venue IDs, websites, outreach email templates).
3. **Stale “158 venues”** in `llms.txt`, search lede, 4+ guide bodies, changelog copy, and internal docs — undermines E-E-A-T after AF Academy dedupe (157).
4. **Guides hub ItemList schema** — `numberOfItems: 21` while **44** guides exist in HTML/sitemap (sync script does not update existing JSON-LD).
5. **Two Tier B guides** under 1,200 words — thin for competitive 2026 SERPs (`pattaya-gyms-childcare-family-pools`, `family-friendly-pattaya`).

### Biggest 5 opportunities

1. **Fix CSP + run `node scripts/sync-csp-hashes.js`** — restores compare/plan and unblocks CI/deploy gate.
2. **Block or remove public outreach** — `_redirects` / Cloudflare rule / move CSV out of deploy root; immediate trust win.
3. **Single source of truth for venue count (157)** — extend `sync-index-venue-count.js` to `llms.txt`, search lede, guide injectors, `AGENTS.md`.
4. **Refresh guides hub ItemList** — update `sync-guides-hub.js` to replace stale ItemList JSON-LD (44 items).
5. **Deepen 2 Tier B guides + schema completeness** — geo 61%, phone 30% per `status.json`; strongest ranking lever after P0 fixes.

---

## 2. Website Inventory

| Item | Value |
|------|--------|
| **Framework** | None — static HTML/CSS/vanilla JS |
| **Builder** | `build-v2.js` (canonical) |
| **Package manager** | npm |
| **Deploy** | Cloudflare Pages, branch `main` |
| **Asset version** | `v452` (`ASSET_VERSION` in `build-v2.js`) |
| **Venues** | **157** (`data.js` / `status.json`) |
| **Guides** | **44** |
| **HTML pages shipped** | **286** (`status.json`) |
| **Sitemap URLs** | **282** (`sitemap.xml` / `status.json`) |
| **Categories** | 15 |
| **Areas** | 6 (+ area×category combo pages) |

### Routes (summary)

| Bucket | Examples | Indexability |
|--------|----------|--------------|
| Homepage | `/` | index |
| Venues | `/gyms/{id}/` ×157 | index, sitemap |
| Categories | `/category/{sport}/` ×15 | index |
| Areas | `/area/{slug}/` ×6 | index |
| Area×category | `/area/.../category/.../` | index |
| Guides | `/guides/{slug}/` ×44 + hub | index |
| Tools | `/search/`, `/compare/`, `/plan-my-trip/` | index |
| Map stub | `/map/` | **noindex** (correct; not in sitemap) |
| Stubs | `/find-my-coach/`, `/favorites/` | **noindex** (correct) |
| Trust | `/about/`, `/methodology/`, `/contact/`, `/press/`, `/privacy/` | index |
| Ops | `/changelog/`, `/pattaya-sport-stats/`, `/colophon/` | index (changelog is large) |
| Data | `/status.json`, `/feed.json`, `/data/compare-venues.json`, `/data/plan-venues.json` | JSON (compare/plan JSON **200** live) |
| **Leak risk** | `/outreach/venue-outreach.csv` | **public 200 — not in sitemap** |
| 404 | `/404.html` | **noindex, follow** ✓ |

### Sitemap / robots

- **`robots.txt`:** Allows `/`, AI crawlers explicitly allowed, `Sitemap:` declared. `Crawl-delay: 1` (ignored by Google).
- **`sitemap.xml`:** 282 URLs; gyms align with `GYMS.length` (157); map/favorites/find-my-coach omitted ✓.
- **`llms.txt`:** Present; **stale venue count (158)**.

### Schema status

- Homepage: `Organization` + `WebSite` with **13 `sameAs`** network URLs ✓
- Venues: `LocalBusiness` / subtype + FAQ + Breadcrumb (per build)
- Guides: ranked editorial + FAQ patterns; **hub ItemList stale (21 vs 44)**
- Compare/plan: `WebApplication` JSON-LD ✓
- **`status.json`:** public `DataCatalog` trust signal ✓

### Network domains (from `index.html` `sameAs` + footer cards)

pattaya-authority.com, timpaemi.com, pattaya-restaurant-guide.com, pattayavisahelp.com, pattaya-school-guide.com, pattaya-coffee.com, pattayastream.com, pattaya-medical.com, pattayapets.com, pattaya-vehicle-rentals.com, pattayavilla.com, pattayapersonaltrainer.com, mrweoutside.com

### Key scripts / gates

```text
npm run build | validate | html:validate | html:validate-all
node scripts/verify-deploy.js          # FAILED locally (CSP)
node scripts/content-quality-audit.js  # Tier A:42 B:2 C:0
node scripts/sync-csp-hashes.js        # required after inline script changes
node scripts/full-site-audit.js        # live crawl helper
```

---

## 3. Critical Issues

### C1 — CSP blocks Compare & Plan inline scripts (production)

| Field | Detail |
|-------|--------|
| **Issue** | Round 66 refactored compare/plan to `fetch('/data/*.json')` but left **large new inline `<script>` blocks** whose SHA-256 hashes are **not** in `_headers` or live CSP. |
| **Location** | `compare/index.html` (~L118–252), `plan-my-trip/index.html` (~L142+), `_headers` |
| **Why it matters** | Strict `script-src` only allows listed hashes + gtag. Browsers **refuse to run** compare/plan logic → tools stuck on “Loading venue directory…” |
| **Evidence** | `node scripts/verify-deploy.js` → 3 missing hashes (`qNaXTHsv…`, `0jcr6tp/…`, `TPPz6zUe…`). Live `curl -sI https://pattaya-gym.com/compare/` shows **9** script hashes only. |
| **Fix** | Run `node scripts/sync-csp-hashes.js`, commit `_headers`, redeploy. Add CI failure as hard gate (already in workflow — must pass before push). |
| **Priority** | P0 |
| **Effort** | 15–30 min |
| **Risk if ignored** | Broken flagship tools; wasted marketing/SEO for `/compare/` and `/plan-my-trip/` |

### C2 — Outreach CSV publicly accessible

| Field | Detail |
|-------|--------|
| **Issue** | Backlink outreach export served at `/outreach/venue-outreach.csv` |
| **Location** | `outreach/venue-outreach.csv` (deployed static asset) |
| **Why it matters** | Exposes venue list, websites, badge URLs, **email templates** — competitive/process leak, not user-facing content |
| **Evidence** | `curl.exe` → **HTTP 200** for `https://pattaya-gym.com/outreach/venue-outreach.csv` |
| **Fix** | Remove from deploy output, add `_redirects` 404, or Cloudflare Access; keep CSV in repo only for local ops |
| **Priority** | P0 |
| **Effort** | 30 min |
| **Risk if ignored** | Scraping, spam targeting listed venues, trust damage if discovered |

### C3 — `verify-deploy.js` fails (deploy gate broken)

| Field | Detail |
|-------|--------|
| **Issue** | Same as C1 — repo cannot pass pre-ship gate |
| **Evidence** | Local run 2026-06-02: **3 issue(s)** CSP missing hashes |
| **Fix** | sync-csp-hashes + commit |
| **Priority** | P0 |
| **Effort** | Low |
| **Risk** | CI on `main` should fail; if green, investigate workflow bypass |

---

## 4. High-Priority Issues

### H1 — Stale “158 venues” across surfaces

| Field | Detail |
|-------|--------|
| **Locations** | `llms.txt` (L2, L9), `search/index.html` lede (L64), guides: `swimming-pools-pattaya`, `muay-thai-pattaya-beginners`, `pattaya-vs-phuket-muay-thai-training`, `changelog/` (historical), `AGENTS.md`, various `scripts/*.js` |
| **Why** | Factual inconsistency vs 157 venues damages trust and AI citations |
| **Fix** | Centralize count in build + `sync-index-venue-count.js`; grep `158` in generated HTML |
| **Priority** | P1 |
| **Effort** | 1–2 h |

### H2 — Guides hub ItemList schema: 21 items, 44 guides

| Field | Detail |
|-------|--------|
| **Location** | `guides/index.html` L35 — `numberOfItems:21`; UI hero says “44 guides · 157 venues” |
| **Why** | Google Rich Results / AI parsers get wrong catalog size |
| **Evidence** | `scripts/sync-guides-hub.js` only **inserts** ItemList if missing — does not **update** existing block |
| **Fix** | Patch sync script to replace ItemList JSON-LD; re-run |
| **Priority** | P1 |
| **Effort** | 30 min |

### H3 — Two Tier B guides (thin content)

| Field | Detail |
|-------|--------|
| **Routes** | `/guides/pattaya-gyms-childcare-family-pools/` (~894w), `/guides/family-friendly-pattaya/` (~962w) |
| **Why** | Below 1,200w Tier A threshold; weak vs intent for family/training holidays |
| **Evidence** | `CONTENT_QUALITY_AUDIT_2026-06-02.md` |
| **Fix** | Editorial deepen via guide-bodies / ranked injectors |
| **Priority** | P1 |
| **Effort** | 4–8 h each |

### H4 — Compare/plan: no meaningful static fallback

| Field | Detail |
|-------|--------|
| **Location** | `compare/index.html`, `plan-my-trip/index.html` |
| **Why** | No JS / CSP block / fetch fail → empty UX (only error text after fetch fail) |
| **Fix** | `<noscript>` links to search + top venues; or server-render minimal picker list |
| **Priority** | P1 |
| **Effort** | 2–4 h |

### H5 — Schema data completeness gaps

| Field | Detail |
|-------|--------|
| **Source** | `status.json` — geo **61%**, phone **30%**, website **66%** |
| **Why** | Local pack / AI answers favor complete LocalBusiness |
| **Fix** | Owner outreach + verified updates (documented in `WORK_LOG_CODEX.md`) |
| **Priority** | P1 (ongoing) |
| **Effort** | Weeks |

---

## 5. Medium-Priority Issues

### M1 — Search page title vs lede mismatch

- Title: “Search **157** Pattaya gyms” ✓  
- Lede: “Search **158** verified…” ✗ — `search/index.html` L64

### M2 — Changelog indexed in sitemap

- `/changelog/` in sitemap at priority 0.5 — useful for transparency but **dilutes crawl budget** and exposes internal round jargon. Consider `noindex` or lower priority.

### M3 — Map page in nav + llms.txt but noindex stub

- Honest UX (“use Search meanwhile”) ✓ — ensure nav label sets expectation (“Map (beta)”).

### M4 — Single generic OG image on tools/hub pages

- Compare/plan/guides hub use `/og-image.png`; venues have `/og/{id}.png` ✓ — tools could use dedicated OG for share CTR.

### M5 — `html:validate` samples ~20 URLs, not all 286 pages

- `html:validate-all` exists but not in default CI — risk of drift on long tail venue pages.

### M6 — Live Lighthouse CLI unreliable locally

- `npx lighthouse https://pattaya-gym.com/` → `NO_NAVSTART` on Windows headless. **Needs manual verification** via PageSpeed Insights or LHCI artifacts from GitHub Actions.

### M7 — `Crawl-delay: 1` in robots.txt

- Google ignores; may slow Bing/other bots unnecessarily.

---

## 6. Low-Priority Polish Issues

- Category intros / ranked `deepen-rNN-block-*` IDs — cosmetic; inject counter 0 ✓  
- Cricket/lawn bowls venue pages mention “158” in body copy (venue-specific, not directory count)  
- Marquee motion — `prefers-reduced-motion` handled in `styles.css` ✓  
- Press/colophon pages — lower traffic; periodic copy refresh  
- `.lighthouserc.json` uses static dist URLs only (not production TTFB)

---

## 7. Mobile Audit

**Code + design-system evidence** (full pixel pass **needs manual verification** on iPhone Safari + Android Chrome per project playbook).

| Viewport | Finding | Location | Impact | Fix |
|----------|---------|----------|--------|-----|
| 320–430px | `overflow-x: hidden` on root | `styles.css` | Prevents horizontal scroll | Keep; spot-check tables on compare |
| All mobile | Nav burger **44×44px** | `styles.css` ~1455 | Good tap target | — |
| All mobile | `.nav-mobile-link` min-height 44px | `styles.css` | Thumb-friendly menu | — |
| All mobile | Hero H1 `clamp(40px,8vw,96px)` | compare, venues | Readable scale | Verify 320px no overflow |
| All mobile | Compare table `overflow-x: auto` pattern on tables | `styles.css` | Wide tables scroll | Test 4-column compare |
| All mobile | Sticky header + marquee | global | Can reduce above-fold | Acceptable brand pattern |
| All mobile | **Compare/plan broken if CSP blocks script** | tools | Critical UX failure | Fix C1 |
| 768px tablet | Grid reflow via CSS vars | categories | Generally solid | Manual screenshot |

**Per major template**

- **Homepage:** Intent router + network hub — strong 3-second clarity; verify card grid at 360px.  
- **Venue:** Long editorial — accordion/FAQ tap targets; map links open externally.  
- **Category/area:** Card grids — consistent.  
- **Guides (ranked):** TOC + long scroll — anchor jump; check sticky nav overlap.  
- **Search:** Live filter — input font size ≥16px **needs manual verification** (iOS zoom).  
- **Compare/plan:** Picker UI — depends on JS (blocked today).

---

## 8. Desktop Audit

| Width | Finding | Location | Fix |
|-------|---------|----------|-----|
| 1024–1920px | `--max` centered wrap | global layout | Consistent ✓ |
| 1280px+ | Category card grids align | build-v2 templates | Minor card height variance acceptable |
| 1440px+ | Hero display type large but clamped | homepage | Premium feel ✓ |
| Ultra-wide | Content stays in max-width — no broken stretch | — | ✓ |
| Desktop | Hover states on cards/links | CSS | Verify focus-visible pairs |
| Desktop | Compare table readability | compare | Adequate with horizontal scroll |
| Desktop | Footer network grid | build-v2 | Strong cross-site discovery ✓ |

**Alignment nits (low):** Some guide sections use inline `style=` on heroes — consistent but harder to maintain than tokens-only.

---

## 9. SEO Audit

### Passes (do not regress)

- Canonicals on sampled pages ✓  
- `hreflang` en + x-default on key templates ✓  
- 404 **noindex, follow** ✓  
- AF Academy football **301** to `af-academy-pattaya` ✓  
- No `UPDATED WEEKLY` in guide HTML ✓  
- Venue OG images per-id ✓  
- `robots.txt` + sitemap + AI bot allowlist ✓  
- Breadcrumbs + FAQ schema on venues (per build) ✓  

### Issues

| Type | Detail |
|------|--------|
| **Metadata** | Stale 158 in llms, search lede, some guides |
| **Schema** | Guides ItemList 21≠44; compare may not execute → Rich Results untested |
| **Indexability** | Map noindex ✓; outreach should not be indexable (not in sitemap but **crawlable**) |
| **Sitemap** | 282 URLs fresh `lastmod` 2026-06-02 ✓ |
| **Headings** | Ranked guides use structured H1/H2 ✓ — spot-check 5 guides |
| **Thin content** | 2 Tier B guides |
| **Cannibalization** | Low risk — guides are segmented by intent |
| **AI / GEO** | Strong: `llms.txt`, `status.json`, methodology, entity-rich copy; weakened by count drift + broken tools |
| **Internal links** | Footer + hub + editorial funnels — strong |
| **CWV** | **Needs manual verification** (Lighthouse NO_NAVSTART local); Round 66 reduced HTML weight on compare/plan (JSON externalized) — positive once CSP fixed |

---

## 10. Content Audit

| Category | Finding |
|----------|---------|
| **Outdated** | “158” strings; changelog documents old counts (acceptable as history if labeled) |
| **Weak** | 2 Tier B family guides |
| **Duplicate** | AF Academy deduped ✓ |
| **Missing** | Interactive map (honest stub); optional glossary entity page |
| **Expand** | Family/childcare guides; geo/phone completeness |
| **Remove/noindex** | Public outreach CSV (not content — ops) |
| **Rewrite** | None at Tier C (0 guides) |
| **Factual** | 157 venues in `data.js` — align all public claims |
| **Trust** | Methodology, no paid placements, TimPaemi operator — strong |
| **Risk** | Low legal risk; training/sport claims generally sourced |

---

## 11. Network Linking Audit

### Current

- Homepage **intent router** (8 cards) + **pa-network** grid ✓  
- Footer sister-site cards on generated pages with `rel="noopener noreferrer"` ✓  
- `Organization.sameAs` lists **13** properties — aligned with footer ✓  
- pattaya-authority.com work page linked as network hub ✓  

### Gaps

- Contextual links from thin family guides to pattaya-school-guide.com / pattayavilla.com (natural for audience)  
- No over-linking — good  

### Recommended map

| Must-link | From | To |
|-----------|------|-----|
| Authority hub | About, press | pattaya-authority.com |
| Long-stay | Visa-related guides | pattayavisahelp.com |
| Families | Tier B family guides | pattaya-school-guide.com |
| Training trips | plan-my-trip, MT guides | pattayapersonaltrainer.com, pattayavilla.com |

| Remove/update | Action |
|---------------|--------|
| Outreach CSV | Remove from public web |
| Stale counts | Sync 157 everywhere |

---

## 12. UI/UX + Visual Audit

**Strengths:** Dark premium V2 system; Space Grotesk + mono kickers; clear brand “pattaya.gym”; marquees reinforce positioning; skip link present; trust pills on homepage.

**Issues:**

- Compare/plan non-functional (CSP) — worst UX issue  
- Map linked as full nav item but stub — set expectations  
- Search lede/count typo — minor confusion  
- Single OG on tools — weaker social previews  

**CTAs:** “★ Find a gym” consistent; plan/compare in mobile nav ✓  

**Brand:** Consistent with TimPaemi network; independent directory voice clear ✓  

---

## 13. Performance Audit

| Area | Assessment |
|------|------------|
| **Round 66 win** | Compare/plan HTML ~21–30 KB; JSON ~95/69 KB cached separately with preload `as=fetch` ✓ |
| **Fonts** | Self-hosted woff2, preload on guides ✓ |
| **Third-party** | gtag deferred; Cloudflare insights allowed in CSP |
| **Images** | Venue OG PNGs; lazy patterns in listings **needs per-page check** |
| **CWV risks** | Large inline scripts (blocked anyway); marquee animation; hero images on homepage |
| **Caching** | `_headers` asset versioning `?v=452` ✓ |

**Recommended optimizations (after CSP fix):**

1. Run LHCI on CI artifacts — tune LCP image preload on homepage  
2. Consider `fetchpriority="high"` on homepage hero if LCP is image  
3. Audit compare JSON cache headers (already in `_headers` for `/data/`)  

---

## 14. Accessibility Audit

| Severity | Issue |
|----------|-------|
| **Medium** | Compare/plan rely on JS with no noscript path |
| **Low** | Marquee `aria-hidden` ✓ — good |
| **Low** | Skip link ✓ |
| **Low** | `prefers-reduced-motion` ✓ |
| **Needs manual** | Color contrast on muted text; focus rings on custom buttons; VoiceOver on mobile menu |

**Passes:** Semantic landmarks (`header`, `main`, `nav`); burger `aria-expanded`; breadcrumb `nav` labels.

---

## 15. Security, Privacy + Content Leak Audit

| Risk | Severity | Evidence |
|------|----------|----------|
| Public outreach CSV | **Critical** | HTTP 200 live |
| CSP inline drift | **Critical** | verify-deploy fail |
| Secrets in repo | Low | grep found no API keys in HTML/JS; `.env` not committed per AGENTS.md |
| TODO/staging in public HTML | Low | no staging URLs in generated pages |
| `status.json` | Info | Public by design — no PII |
| Analytics | Info | G-F5F6KD3XFZ via `analytics.js` — privacy policy should mention |
| `target="_blank"` | Pass | `rel="noopener noreferrer"` on network cards |
| Source maps | Low | Static site — minimal exposure |

**Outreach CSV contents:** venue_id, name, website, email templates — **should not be public.**

---

## 16. 2026 Standards Gap Analysis

| Area | Gap |
|------|-----|
| **AI search** | `llms.txt` + AI robots allowlist — ahead of peers; fix count + ItemList |
| **Trust** | `status.json`, methodology — strong; outreach leak hurts |
| **Tools** | Compare/plan modern architecture (external JSON) — undermined by CSP miss |
| **Content depth** | 42/44 guides Tier A — excellent; 2 guides need depth |
| **Visual** | On-par with 2026 editorial directories; map stub feels incomplete |
| **Competitors** | TripAdvisor/Google Maps win on UGC photos; you win on independence + breadth |
| **GEO** | Entity clarity good if facts consistent |

---

## 17. Recommended Fix Roadmap

### Immediate (today)

1. `node scripts/sync-csp-hashes.js` → commit `_headers` → deploy  
2. Block `/outreach/*` from public (delete from Pages output or 404 rule)  
3. Re-run `verify-deploy.js` until PASS  

### Next (high ROI)

4. Sync 157 count: `llms.txt`, search lede, guide bodies, `AGENTS.md`  
5. Fix `sync-guides-hub.js` ItemList replacement → 44 items  
6. Deepen 2 Tier B family guides  

### Deep improvements

7. Schema phone/geo outreach program  
8. Map interactive rebuild or demote nav prominence  
9. Compare/plan noscript fallback  
10. Run `html:validate-all` in CI  

### Optional polish

11. Tool-specific OG images  
12. Changelog noindex debate  
13. Remove `Crawl-delay`  

---

## 18. File-Level Action Plan

| File | Issue | Change | Priority |
|------|-------|--------|----------|
| `_headers` | Missing 3 script hashes | Run `sync-csp-hashes.js` | P0 |
| `outreach/` or `_redirects` | Public CSV | 404 or exclude from deploy | P0 |
| `compare/index.html`, `plan-my-trip/index.html` | Inline script hashes | Regenerate CSP after any edit | P0 |
| `llms.txt` | Says 158 | 157 | P1 |
| `search/index.html` | Lede 158 | 157 | P1 |
| `guides/index.html` | ItemList 21 | Regenerate via fixed sync script | P1 |
| `scripts/sync-guides-hub.js` | No ItemList update | Replace existing JSON-LD block | P1 |
| `guides/swimming-pools-pattaya/index.html` (+ 2 guides) | 158 in body | 157 | P1 |
| `guide-bodies/*.js` or deepen scripts | Tier B guides | +300–500 words each | P1 |
| `AGENTS.md` | Says 158 venues | 157 | P2 |
| `scripts/migrate-legacy-guides-chrome.js`, `write-new-guides.js` | Hardcoded 158 | Use `VENUE_N` | P2 |
| `scripts/export-venue-outreach.js` | Writes to public dir | Output outside deploy root | P0 |

---

## 19. Verification Checklist

- [ ] `node scripts/verify-deploy.js` — PASS (0 issues)  
- [ ] `npm run validate` — PASS  
- [ ] `node scripts/content-quality-audit.js` — Tier B = 0 (optional goal)  
- [ ] Live `/compare/` — pickers populate, table renders (browser console: no CSP errors)  
- [ ] Live `/plan-my-trip/` — same  
- [ ] `curl` outreach URL → **404**  
- [ ] `llms.txt` → 157 venues  
- [ ] Guides hub View Source → ItemList `numberOfItems: 44`  
- [ ] Grep generated HTML for `\b158\b` directory claims → 0 false positives  
- [ ] `npm run html:validate` + spot `html:validate-all`  
- [ ] Mobile 375px screenshots — home, venue, compare, guide  
- [ ] Desktop 1440px screenshots — same  
- [ ] PageSpeed Insights or LHCI — performance ≥85, a11y ≥90, SEO ≥95  
- [ ] Rich Results Test — sample venue + guides hub  
- [ ] Search Console — no soft 404 on /map/  

---

## 20. Final Verdict

| Question | Answer |
|----------|--------|
| **Ready for serious traffic?** | **Almost** — directory pages yes; **tools and trust leaks say no** until P0 fixed. |
| **Ready for Google?** | **Mostly yes** — sitemap, schema, content breadth strong; fix schema/count drift and public CSV. |
| **Ready for users?** | **Directory yes; compare/plan likely no** on production today (CSP). |
| **Ready as network hub?** | **Yes** — homepage/footer/sameAs are best-in-class for the property. |
| **Single highest-impact fix** | **`node scripts/sync-csp-hashes.js` + deploy** — restores compare/plan and CI integrity. |

---

*Supersedes stale items in `FULL_WEBSITE_AUDIT_2026-06-02.md` where noted (158 sitemap mismatch, UPDATED WEEKLY, inline 100KB JSON — all fixed in Rounds 65–66).*
