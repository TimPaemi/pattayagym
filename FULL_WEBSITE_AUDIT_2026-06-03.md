# FULL WEBSITE AUDIT — pattaya-gym.com

**Audit date:** 2026-06-03  
**Production:** https://pattaya-gym.com  
**Repo:** TimPaemi/pattayagym · branch `main` · ASSET_VERSION **v452**  
**Latest ship:** Round 76 (`218b32e`) — telephone 59/157  

**Commands run:** `verify-deploy.js` · `verify.js` · `validate.js` · `html:validate` · `html:validate-all` · `content-quality-audit.js` · `audit-venue-fields-r74.js` · `full-site-audit.js` (282 URL live crawl)

---

## Executive summary

| Dimension | Grade | Notes |
|-----------|-------|-------|
| **Overall** | **8.4** | Production-stable; schema gates enforced; guides all Tier A |
| **Technical / deploy** | **9.5** | 282/282 live 200; zero truncated HTML; CSP in sync |
| **SEO / schema** | **8.0** | Geo 155/157, postal 157/157, FAQ 44/44; phone gap 59/157 |
| **Content (guides)** | **9.0** | 44/44 Tier A (≥1200 words); no WEEKLY marquee drift |
| **Trust / honesty** | **8.5** | Phone sprint uses official sources only; no fabricated facts |
| **Performance** | **7.5** | Compare/plan pages heavy; no fresh Lighthouse in this run |

**Verdict:** Site is **ship-ready and crawl-clean**. Primary growth work is **verified phone coverage** (98 venues still without `telephone`), then optional geo pin refinement for `area_fallback` entries.

---

## 1. Local integrity gates

| Gate | Result |
|------|--------|
| `node scripts/verify-deploy.js` | **PASS** |
| `node scripts/verify.js` | **PASS** |
| `node validate.js` | **0 errors**, 151 warnings (optional MD fields) |
| `npm run html:validate` | **PASS** |
| `npm run html:validate-all` | **PASS** |

### verify-deploy schema coverage (157 venues)

| Field | Count | Gate |
|-------|-------|------|
| GeoCoordinates | 155/157 | ≥ 154 |
| postalCode | 157/157 | ≥ 154 |
| telephone | 59/157 | ≥ 57 (Round 76) |
| Guide FAQPage | 44/44 | all guides |

**Geo gaps (2):** `lumpinee-boxing-stadium`, `chatrium-golf-soi-dao` — intentionally outside Pattaya editorial region.

---

## 2. Live production (`full-site-audit.js`)

- **282/282** sitemap URLs → HTTP **200**
- **0** broken links on homepage spot-check (25 links)
- **6/6** sister network sites HTTP 200
- Key pages (home, guides, compare, plan, WKO gym, status.json, robots) all **200**
- **Note:** `status.json` version field may read `undefined` on live edge briefly after deploy — not a content failure

Machine report: `FULL_AUDIT_2026-06-03.md`

---

## 3. Content quality (`content-quality-audit.js`)

| Tier | Count |
|------|-------|
| A (≥1200 words) | **44** |
| B | **0** |
| C | **0** |

| Flag | Count |
|------|-------|
| `deepen-rNN` inject blocks | 0 |
| FAQ schema mismatch | 0 |
| `UPDATED WEEKLY` in guides | 0 |

Report: `CONTENT_QUALITY_AUDIT_2026-06-03.md`

---

## 4. Venue data hygiene (`audit-venue-fields-r74.js`)

| Metric | Value |
|--------|-------|
| Phones in `data.js` | 59/157 |
| Phones in venue MD | 59/157 |
| MD→data sync drift | **0** |
| openingHoursSpecification (HTML) | 157/157 |
| postalCode (HTML) | 157/157 |

**151 validate warnings:** mostly missing optional `phone` / `website` in venue MD — expected until phone sprint completes.

---

## 5. Phone sprint status

- **With phone:** 59/157 (38%)
- **Has website, no phone:** 57 venues — next batch targets
- **Pipeline:** `data/manual-phones-r*.json` + `scripts/apply-manual-phones.js`
- **Do not use:** site agency WhatsApp (+66 96 728 6999), mall switchboards for unrelated tenants, Koh Phangan numbers on Pattaya listings

### Rounds 75–76 shipped (12 phones)

Rage, Silk, Venum (+ website fix), Castra, Cross Pattaya, Ramayana, Pattaya Dive Centre, No Limit, Manhattan, Thai Polo, Chee Chan, Seafari.

---

## 6. Resolved vs prior audits (June 2)

| Issue (old audit) | Status now |
|-------------------|------------|
| 34× `UPDATED WEEKLY` marquee | **Fixed** — 0 in guides |
| `af-academy-football` in sitemap | **Fixed** — not in sitemap |
| FAQ generic/off-topic | **Fixed** — 44/44 FAQPage, inject from editorial |
| Guide Tier B/C gap | **Fixed** — 44/44 Tier A |
| postalCode / FAQ gates | **Enforced** in verify-deploy |
| telephone coverage | **In progress** — 59/157, gate at 57 |

---

## 7. Remaining backlog (prioritized)

### P0 — Data trust
1. **Phone sprint** — 57 venues with website but no phone; official contact pages only (~5–7 per round).
2. **Venum / fight-evo / bounce** — verify correct official domain before adding numbers.

### P1 — Schema / geo
3. Refine **19 area_fallback** geo pins in `data/venue-geo.json` where flagged.
4. **FIGHT EVO360** — restore official site or gymdesk-only sourcing when URL returns.

### P2 — Product / SEO polish
5. Per-guide **OG images** (still shared `og-image.png`).
6. **Compare / plan** lazy-load or split JSON payload (90–115 KB HTML).
7. Re-run **Lighthouse** on homepage + heaviest tool pages post-deploy.

### P3 — Off-page
8. User-run **`OFF_PAGE_GSC_CHECKLIST.md`** (GSC sitemap, Bing).

---

## 8. Inventory snapshot

| Item | Value |
|------|-------|
| Venues | 157 |
| Guides | 44 |
| HTML files checked | 287 |
| Sitemap URLs | 282 |
| Categories | 15 |
| Area hubs | 6 (+ 45 area×category) |

---

*Re-run after each ship: `node scripts/full-site-audit.js` · `node scripts/content-quality-audit.js` · `node scripts/verify-deploy.js`*
