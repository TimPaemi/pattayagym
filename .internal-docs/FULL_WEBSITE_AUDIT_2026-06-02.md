# FULL WEBSITE AUDIT REPORT — pattaya-gym.com

**Audit date:** 2026-06-02  
**Production URL:** https://pattaya-gym.com  
**Repo:** `c:\Projects\pattayagym` (TimPaemi/pattayagym, branch `main`, Cloudflare Pages)  
**Asset version:** v452  
**Method:** Codebase discovery + `verify-deploy.js` + `validate.js` + `content-quality-audit.js` + live sitemap crawl (284 URLs) + spot HTML/meta review. Lighthouse run failed (NO_NAVSTART) — performance scores need manual re-run.

---

## 1. Executive Summary

Pattaya.Gym is a **mature, production-grade static directory** with strong technical hygiene (CSP, HSTS, sitemap integrity, zero broken URLs in crawl), excellent **network hub linking**, and a distinctive dark editorial brand. Recent Round 60 Q3 work cleared all Tier C guides. The site is **ready for real traffic** in the Muay Thai / sport-directory niche, but it is **not yet at “2026 premium reference” bar** because of trust-copy drift, schema inconsistencies, half the guides still at Tier B depth, and a few indexable pages that under-deliver (map stub, 404 indexing).

| Dimension | Grade (1–10) |
|-----------|----------------|
| **Overall** | **7.6** |
| **SEO** | **7.5** |
| **UI/UX** | **8.0** |
| **Mobile** | **7.5** (CSS conventions good; pixel audit needs manual screenshots) |
| **Desktop** | **8.0** |
| **Performance** | **7.0** |
| **Content** | **7.5** |
| **Network linking** | **8.5** |
| **Trust / safety** | **7.0** |

### Biggest 5 problems

1. **Trust copy contradiction:** 34 guide pages still show marquee **“UPDATED WEEKLY”** while homepage, privacy, and methodology use **“UPDATED ROLLING”** — undermines E-E-A-T after explicit policy fix (changelog F21).
2. **FAQ / Article schema mismatch:** 14 guides carry FAQPage JSON-LD with generic or off-topic questions (e.g. “compare side-by-side” on non-compare guides).
3. **Sitemap lists redirecting duplicate venue:** `/gyms/af-academy-football/` remains in `sitemap.xml` but `_redirects` 301s to `af-academy-pattaya` — wastes crawl budget and risks duplicate signals.
4. **Indexable under-delivering pages:** `/map/` is indexed with copy promising an interactive map “rolling back online” but is effectively a stub; `/404/` uses `index, follow`.
5. **Guide depth gap:** 22 of 44 guides are Tier B (700–1199 words); 15 ranked guides still have `deepen-rNN` inject blocks layered on editorial content.

### Biggest 5 opportunities

1. **Bulk marquee migration** (`UPDATED WEEKLY` → `UPDATED ROLLING` on ranked/legacy guides) — one build script pass, high trust ROI.
2. **Tier B → Tier A guide deepening** — 22 guides; pattern established in Q1–Q3 (`guide-bodies/*.js` + `write-roundNN`).
3. **Per-guide OG images** — all pages share `og-image.png`; better CTR in social and AI citations.
4. **Compare / Plan trip performance** — split embedded JSON or lazy-load; 100–117 KB HTML on tool pages.
5. **Network schema alignment** — add `pattayavilla.com`, `pattayapersonaltrainer.com`, `mrweoutside.com` to Organization `sameAs` where homepage already promotes them.

---

## 2. Website Inventory

| Item | Value |
|------|--------|
| **Stack** | Static HTML/CSS/vanilla JS — no React/Next |
| **Canonical builder** | `build-v2.js` |
| **Source data** | `data.js`, `venues/*.md`, `data/venue-geo.json` |
| **Deploy** | Cloudflare Pages from `main`; `_headers`, `_redirects` |
| **Package manager** | npm (workspaces: `packages/ui` for component previews) |
| **HTML pages (local)** | 287 checked by `verify-deploy.js` |
| **Venues** | 158 |
| **Guides** | 44 slugs + `/guides/` hub |
| **Sitemap URLs** | 284 (158 gyms + 44 guides + hub + 15 categories + 51 area×category + 15 utility) |
| **Robots** | Open crawl; explicit AI bot allow-list; `Sitemap:` canonical |
| **Schema** | WebSite + Organization on homepage; LocalBusiness per venue; Article/FAQ on guides |
| **llms.txt** | Yes — AI/GEO map |
| **Privacy** | `/privacy/` — GA4, localStorage, GDPR/PDPA |
| **No `.env` in repo** | Confirmed — good |

### Network domains (discovered)

**Organization `sameAs` (index.html):** pattaya-authority.com, timpaemi.com, pattaya-restaurant-guide.com, pattayavisahelp.com, pattaya-school-guide.com, pattaya-coffee.com, pattayastream.com, pattaya-medical.com, pattayapets.com, pattaya-vehicle-rentals.com  

**Homepage network cards (additional):** pattayapersonaltrainer.com, pattayavilla.com, mrweoutside.com  

**Sister-site health (live 2026-06-02):** All 6 checked in `full-site-audit.js` returned HTTP 200.

### Scripts / gates

| Command | Result |
|---------|--------|
| `node scripts/verify-deploy.js` | PASS |
| `node validate.js` | PASS (0 errors, 164 warnings — mostly missing optional phone/website in venue MD) |
| `npm run html:validate` | PASS — **sample only** (~20 URLs, not all 287) |
| `node scripts/content-quality-audit.js` | Tier A: 22 · B: 22 · C: 0 |
| `node scripts/full-site-audit.js` | 284/284 HTTP 200; robots.txt flagged (false positive on title) |

---

## 3. Critical Issues

### C1 — “UPDATED WEEKLY” on 34 guides vs honest “UPDATED ROLLING” policy

| Field | Detail |
|-------|--------|
| **Location** | Marquee on ranked/legacy guides, e.g. `guides/best-muay-thai-pattaya/index.html` lines 40–41; 34 files per `content-quality-audit.js` |
| **Why it matters** | Direct contradiction of methodology/changelog F21; damages trust for YMYL-adjacent sport/training advice |
| **Evidence** | Homepage uses `UPDATED ROLLING`; `guides/best-muay-thai-pattaya/` still `UPDATED WEEKLY` |
| **Fix** | Run `migrate-legacy-guides-chrome.js` / ranked marquee sync or extend `editorial-guide-shell.js` TOP/BOT constants to all ranked templates in `build-v2.js` / polish scripts |
| **Priority** | Critical |
| **Effort** | Small (1–2 hr batch) |
| **Risk if ignored** | Manual review / competitor screenshots citing misleading freshness |

### C2 — FAQPage schema generic or mismatched on 14 guides

| Field | Detail |
|-------|--------|
| **Location** | e.g. `guides/best-muay-thai-pattaya/index.html` FAQ includes “Want to compare these side-by-side?” |
| **Why it matters** | Rich-result eligibility risk; AI engines may cite wrong Q&A |
| **Evidence** | `content-quality-audit.js` `faqSchemaMismatch()` flags 14 slugs |
| **Fix** | Per-guide FAQ in `scripts/lib/venue-faq-templates.js` or `inject-guide-schema.js`; questions must match page topic |
| **Priority** | Critical |
| **Effort** | Medium |
| **Risk** | Schema spam perception |

### C3 — `af-academy-football` in sitemap but 301 to `af-academy-pattaya`

| Field | Detail |
|-------|--------|
| **Location** | `sitemap.xml` line ~168; `_redirects` lines 7–8 |
| **Why it matters** | Duplicate URL in index; stub HTML may still exist at `gyms/af-academy-football/` |
| **Evidence** | Sitemap contains football URL; redirect documented in `_redirects` |
| **Fix** | Remove from sitemap generation in `build-v2.js`; optionally stop emitting stub HTML; keep 301 |
| **Priority** | Critical |
| **Effort** | Small |
| **Risk** | Split ranking signals / crawl waste |

### C4 — `/404/` indexable

| Field | Detail |
|-------|--------|
| **Location** | `404.html` line 30: `robots: index, follow` |
| **Why it matters** | Error page can enter index; pollutes SERPs |
| **Evidence** | Meta robots on 404 template |
| **Fix** | `noindex, follow` on 404; keep helpful UX |
| **Priority** | Critical |
| **Effort** | Trivial |
| **Risk** | “Page not found” indexed |

### C5 — `/map/` indexed as incomplete product

| Field | Detail |
|-------|--------|
| **Location** | `map/index.html` title/description: “rolling back online” |
| **Why it matters** | High-intent URL fails user expectation; bounce + soft-404 risk |
| **Evidence** | Meta promises interactive map; page is fallback browse links |
| **Fix** | Either ship minimal map (geo from `venue-geo.json`) OR `noindex` until live; update `llms.txt` |
| **Priority** | Critical (UX + SEO) |
| **Effort** | Medium–large for real map; small for noindex |
| **Risk** | Trust damage from nav/footer links to map |

---

## 4. High-Priority Issues

### H1 — 22 guides Tier B (700–1199 words)

Weakest: `diving-watersports-pattaya` (720w), `adventure-pattaya` (727w), `yoga-retreat-pattaya` (733w).  
**Fix:** Continue `guide-bodies/*.js` editorial pattern from Q3.  
**Effort:** Large (content) · **Priority:** High

### H2 — `deepen-rNN` inject blocks on 15 ranked guides

**Location:** `guides/*/index.html` — class `deepen-r46-block`, etc.  
**Why:** Reads as bolt-on SEO patches vs unified editorial.  
**Fix:** Merge into body or remove after content absorbed.  
**Effort:** Medium

### H3 — Read time understates content depth

**Example:** `best-muay-thai-pattaya` — “5 min read” but ~1252 words (~10–12 min).  
**Fix:** Compute from word count in `inject-guide-schema.js` or shell.  
**Effort:** Small

### H4 — `html:validate` does not cover all 287 HTML files

**Fix:** CI should run `npm run html:validate-all` or expand sample set.  
**Effort:** Small

### H5 — Tool pages heavy HTML (compare 117 KB, plan 100 KB)

Embedded venue JSON in-page.  
**Fix:** Load `data.js` async or paginate; preload only selection set.  
**Effort:** Medium · **Performance**

### H6 — Global OG image for all pages

**Fix:** Generate per-venue/guide OG in `/og/` (partial set exists for venues).  
**Effort:** Medium

### H7 — No cookie consent UI (GA4 active)

**Location:** `privacy/index.html` documents `_ga` cookies; no banner.  
**Why:** EU/UK visitors — PDPA/GDPR expectation.  
**Fix:** Lightweight consent or geo-gated GA — **Needs legal preference**  
**Effort:** Medium

### H8 — `llms.txt` overstates `/map/` as core interactive tool

**Fix:** Align copy with map stub or restoration timeline.

---

## 5. Medium-Priority Issues

| ID | Issue | Location | Fix effort |
|----|-------|----------|------------|
| M1 | 164 venue MD warnings (missing phone/website) | `venues/*.md` | Ongoing editorial |
| M2 | Category MMA/BJJ show “1 venue” in llms — undercounts multi-venue guides | `llms.txt` | Copy update |
| M3 | `changelog/` 111 KB index — heavy for mobile | `changelog/index.html` | Pagination or collapse |
| M4 | Ranked guides use `cat-venue-grid` + inject — layout differs from editorial gold standard | 15 guides | Unify chrome |
| M5 | `find-my-coach`, `favorites` noindex — correct, but nav still exposes | stubs | Label “Soon” in nav |
| M6 | `Crawl-delay: 1` in robots — ignored by Google, may annoy others | `robots.txt` | Optional remove |
| M7 | Organization `sameAs` missing homepage network cards | `index.html` schema | Add 3 URLs |
| M8 | Venue pages 50–67 KB — long pages, many source links | top gyms | TOC already? verify |

---

## 6. Low-Priority Polish

- **robots.txt “missing title”** in audit — plain text file; audit script false positive.
- **Homepage audit “404” on `//maps.google.com`** — dns-prefetch href, not user link.
- **status.json version drift** on live — transient Cloudflare propagation.
- **Mixed `rel="noopener"` vs `noopener noreferrer`** — consistent preference `noreferrer` on external.
- **Twitter @PattayaGym** — verify account active (manual).

---

## 7. Mobile Audit

**CSS evidence:** `min-height: 44px` on nav/CTAs (`styles.css` lines 269, 1484, 1502). Skip link present. Viewport `width=device-width, initial-scale=1, viewport-fit=cover`. Mobile nav drawer with `aria-expanded`.

**Needs manual verification** (Playwright/screenshots at 375px, 390px, 430px):

| Page | Check |
|------|--------|
| `/` | Hero `clamp()` type scale; intent router grid; network cards wrap |
| `/compare/` | Table horizontal scroll; sticky filters |
| `/plan-my-trip/` | Form fields; results panel |
| `/search/` | Filter chips overflow |
| `/guides/best-muay-thai-pattaya/` | Ranked cards single column |
| `/gyms/fairtex-pattaya/` | Long venue body; source list |
| `/category/muay-thai/` | Card grid columns |

**Likely issues (code-informed, not screenshot-proven):**

- Compare page 117 KB — slow first paint on 3G.
- Marquee animation — `prefers-reduced-motion` support **Needs verification** in CSS.
- Sticky header may reduce usable viewport on small screens — verify content not hidden under nav.

---

## 8. Desktop Audit

**Passes:** `--max` width container, consistent nav, dark luxury aesthetic, card grids on category pages.

**Needs manual verification** at 1280px / 1920px:

- Ultra-wide empty margins on compare/plan (acceptable if max-width intentional).
- Footer network grid column balance.
- Guide hero left-aligned typography vs centered legacy pages.

---

## 9. SEO Audit

### Passes

- Canonical URLs on sampled pages — self-referencing HTTPS.
- hreflang `en` + `x-default` on templates.
- 284/284 sitemap URLs return 200 (live crawl).
- www → apex 301 in `_redirects`.
- Strong internal linking: category strips, area×category, venue guide blocks (`inject-internal-linking-r41.js`).
- `llms.txt` + AI bot allow — GEO-ready.
- BreadcrumbList JSON-LD on guides/venues.
- Hand-maintained homepage with intent router (post `inject-homepage-seo.js`).

### Issues

| Type | Finding |
|------|---------|
| Metadata | Many meta descriptions truncated with `...` — verify full sentence in SERP |
| Canonical | Duplicate venue redirect pair — see C3 |
| Indexability | 404 + map — see C4, C5 |
| Sitemap | Includes redirecting gym slug |
| Headings | Generally one H1; ranked guides use hero H1 — OK |
| Schema | FAQ mismatch — see C2 |
| Thin content | 22 Tier B guides |
| Duplicate | inject blocks repeat funnel copy |
| OG | Single shared image |
| AI/GEO | Strong llms + Article schema on new guides; weakened by trust marquee |

---

## 10. Content Audit

| Status | Detail |
|--------|--------|
| **Outdated** | Marquee “UPDATED WEEKLY”; some guide `dateModified` static 2026-05-17 |
| **Strong** | Q3 guides (tennis, equestrian, kids, climbing, BJJ, running); russian-speaking; snooker/swim/crossfit |
| **Weak / thin** | Tier B list — diving, adventure, yoga, area guides under 900w |
| **Duplicate** | af-academy-football vs pattaya; inject blocks repeat |
| **Misleading** | Read time; weekly update claim |
| **Placeholder** | map page honest but indexed |
| **Remove/noindex** | 404 from index; consider football stub |
| **Rewrite queue** | Tier B guides (22) |
| **Factual** | Venue MD sourced; 164 missing optional fields — not fabrications, but incomplete contact |

---

## 11. Network Linking Audit

### Current (strong)

- Homepage: 12+ network cards + Authority project grid.
- Footer: Pattaya Authority, TimPaemi, Restaurant, Visa, School, Coffee, Stream, Medical, Pets, Vehicles.
- Venue pages: `pa-network-card` strip.
- Guides: contextual links to Visa, Villa, Medical, School in body copy.
- Schema `sameAs` on Organization.

### Gaps

| Gap | Recommendation |
|-----|----------------|
| pattayavilla.com, pattayapersonaltrainer.com, mrweoutside.com not in `sameAs` | Add to Organization JSON-LD |
| Restaurant guide not in footer of all templates | Already in footer — OK |
| Cross-link from Visa/Medical sites back | Off-site — **manual verification** |
| Guide → network contextual | Add Villa on accommodation guides; Medical on injury/MT guides consistently |

### Recommended hub map

```
pattaya-authority.com (network hub)
    ├── pattaya-gym.com (sport directory) ← THIS SITE
    ├── pattayavisahelp.com (long-stay)
    ├── pattaya-school-guide.com (families)
    ├── pattaya-medical.com (injury)
    ├── pattaya-vehicle-rentals.com (transport)
    ├── pattayavilla.com (housing)
    └── pattaya-restaurant-guide.com (recovery meals)
```

**Anchor text:** Descriptive (“Pattaya Visa Help — education visa”) — already good on cards.

---

## 12. UI/UX + Visual Audit

### Passes

- Clear brand: `pattaya.gym` wordmark, pink/cyan accents.
- Primary CTA “Find a gym” persistent.
- Trust pills: hand-checked, no paid placements.
- Compare + Plan tools are real (not stubs).
- Editorial guides: byline, read time, sister links.

### Issues

- **Map** breaks promise (see C5).
- **Find my coach / Favorites** in mobile nav but noindex stubs — label as coming soon.
- **Ranked vs editorial** visual inconsistency between guide types.
- **Changelog** very long — power users only.

---

## 13. Performance Audit

| Risk | Detail |
|------|--------|
| LCP | Homepage preloads CSS + Space Grotesk woff2 — good pattern |
| CLS | Marquee animation — verify reduced-motion |
| INP | Compare/plan JS on large DOM — **Needs Lighthouse** |
| Payload | compare 117 KB, plan 100 KB HTML |
| JS | Self-hosted bundles; CSP allowlist GTM/GA/Cloudflare insights |
| Images | OG PNG; venue images in `/og/{id}.png` |
| Fonts | Self-hosted — good vs CDN |

**Lighthouse:** Failed with NO_NAVSTART in CI environment — re-run locally:  
`npx lighthouse https://pattaya-gym.com/ --view`

**Recommended:** Split embedded JSON on tool pages; add `fetchpriority="high"` only on homepage hero if image added.

---

## 14. Accessibility Audit

| Severity | Issue |
|----------|--------|
| **Pass** | Skip link; `lang="en"`; semantic header/nav/main; burger `aria-expanded` |
| **Pass** | 44px min touch targets (partial components) |
| **Medium** | Marquee `aria-hidden` — OK for decorative |
| **Medium** | Color contrast on `--muted` text — **verify WCAG** on `.guide-byline`, footer |
| **Medium** | Focus visible states — **spot-check** keyboard nav on compare filters |
| **Low** | Icon-only burger — has `aria-label` |
| **Needs verification** | Form labels on plan-my-trip wizard |

---

## 15. Security, Privacy + Content Leak Audit

### Passes

- Strong CSP (hashed inline scripts), HSTS, X-Frame-Options DENY, CORP/COOP.
- No `.env` committed.
- No API keys in grep sample.
- Privacy page documents GA4 + localStorage.
- `/uploads/` disallowed in robots.

### Risks

| Risk | Level | Notes |
|------|-------|-------|
| GA4 without consent banner | Medium | EU traffic |
| Public phone/email | Low | Intentional business contact |
| WhatsApp pre-filled links | Low | Conversion by design |
| `af-academy-football` duplicate page | Low | Redirect + stale file |
| Changelog mentions internal round numbers | Low | Transparency feature, not leak |
| No staging URLs found in repo | — | Good |

**Secrets scan:** No `API_KEY` / `.env` in repo root. Scripts use `process.env` only in dev tooling — **not shipped**.

---

## 16. 2026 Standards Gap Analysis

| Area | Gap |
|------|-----|
| **E-E-A-T** | Author bylines present; weakened by weekly marquee lie |
| **AI search** | llms.txt + bot allow strong; FAQ schema quality weak on ranked |
| **Topical authority** | 44 guides + 158 venues — excellent breadth; half guides need depth |
| **Visual 2026** | Dark editorial premium — competitive; map stub feels 2023 |
| **Tools** | Compare/plan ahead of typical directories |
| **Competitors** | TripAdvisor/Google Maps win on reviews; you win on independence + sport depth |
| **GEO** | Entity clarity good (Organization, 158 LocalBusiness) |

---

## 17. Recommended Fix Roadmap

### Immediate (this week)

1. Fix 404 `noindex`.
2. Remove `af-academy-football` from sitemap (keep 301).
3. Bulk replace `UPDATED WEEKLY` → `UPDATED ROLLING` on all guides.
4. Map page: `noindex` OR minimal geo map MVP.
5. Fix top 5 FAQ schema templates on highest-traffic guides (best-muay-thai, cheapest, beginners).

### Next (high ROI)

1. Deepen 5 thinnest Tier B guides (diving, adventure, yoga, sattahip, thai-terms).
2. Remove or merge `deepen-rNN` blocks on ranked guides.
3. Sync read time with word count.
4. `html:validate-all` in GitHub Actions.
5. Add missing `sameAs` network URLs.

### Deep improvements

1. All 22 Tier B → Tier A.
2. Per-guide OG images.
3. Compare/plan payload reduction.
4. Restore interactive map with `venue-geo.json`.
5. Cookie consent strategy for GA4.

### Optional polish

- Lighthouse CI budget.
- Reduce changelog page weight.
- Remove `Crawl-delay` from robots.

---

## 18. File-Level Action Plan

| File | Issue | Change | Priority |
|------|-------|--------|----------|
| `build-v2.js` | 404 robots; sitemap football slug; ranked marquee | Template fixes | Critical |
| `404.html` | indexable | `noindex, follow` | Critical |
| `_redirects` | football redirect | Keep; remove sitemap entry in builder | Critical |
| `map/index.html` | stub indexed | noindex or implement map | Critical |
| `scripts/inject-guide-schema.js` | FAQ + read time | Per-slug FAQ; word-based read time | Critical |
| `scripts/lib/editorial-guide-shell.js` | ROLLING constant | Already correct — propagate to ranked | Critical |
| `scripts/polish-ranked-guide-body.js` | WEEKLY marquee | TOP/BOT constants | Critical |
| `scripts/deepen-round46-ranked.js` etc. | inject blocks | Remove after merge | High |
| `llms.txt` | map description | Honest status | High |
| `index.html` | sameAs incomplete | Add 3 domains | Medium |
| `compare/index.html` / `scripts/build-compare-page.js` | 117 KB | External data load | Medium |
| `package.json` / `.github/workflows/build.yml` | validate scope | `html:validate-all` | Medium |
| `venues/*.md` | missing phone | Editorial backfill | Medium |
| `styles.css` | reduced-motion | Audit marquee | Low |

---

## 19. Verification Checklist

After fixes:

- [ ] `node scripts/verify-deploy.js` PASS
- [ ] `node validate.js` 0 errors
- [ ] `npm run html:validate-all` PASS
- [ ] `node scripts/content-quality-audit.js` — Tier B count trending down; 0 WEEKLY flags
- [ ] `node scripts/full-site-audit.js` — 284×200; 404 noindex; map decision reflected
- [ ] Manual: homepage, compare, plan, one guide, one venue — mobile 375px + desktop 1440px screenshots
- [ ] Lighthouse mobile + desktop ≥90 perf/a11y/SEO on homepage (or documented exception)
- [ ] Rich Results Test on 3 guides — FAQ valid
- [ ] GSC: no indexed `/404/`; football URL drops
- [ ] No console errors on compare/plan/search

---

## 20. Final Verdict

| Question | Answer |
|----------|--------|
| **Ready for serious traffic?** | **Yes**, for niche sport-directory and Muay Thai intent — with map and trust-copy fixes. |
| **Ready for Google?** | **Mostly** — crawl health excellent; fix schema honesty, 404 indexing, sitemap duplicate. |
| **Ready for users?** | **Yes** on search/compare/guides; **no** on map until restored or de-emphasized. |
| **Ready for the network?** | **Yes** — best-in-network linking; minor schema alignment needed. |
| **Single highest-impact fix?** | **Replace “UPDATED WEEKLY” with “UPDATED ROLLING” site-wide** — fastest trust win aligned with stated editorial policy. |

---

*Generated by senior audit pass 2026-06-02. Re-run after changes: `node scripts/full-site-audit.js` + `node scripts/content-quality-audit.js`.*
