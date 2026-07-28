# FULL WEBSITE AUDIT — pattaya-gym.com

**Audit date:** 2026-06-03 (post Round 86)  
**Production:** https://pattaya-gym.com  
**Branch:** `main` · ASSET_VERSION **v452**  
**Latest ship:** Round 87 — full audit + changelog pa-network fix

**Commands run:** `verify-deploy.js` · `validate.js` · `html:validate` · `html:validate-all` · `content-quality-audit.js` · `audit-internal-links.js` · `full-site-audit.js`

---

## Executive summary

| Dimension | Grade | Notes |
|-----------|-------|-------|
| **Overall** | **8.7** | Crawl-clean; strong internal mesh (R84); phones 85% |
| **Technical** | **9.5** | 282/282 sitemap HTTP 200; all local gates PASS |
| **SEO / schema** | **8.6** | Geo 155/157 · postal 157/157 · FAQ 44/44 · tel 134/157 |
| **Content** | **9.0** | 44/44 Tier A guides; 0 FAQ drift |
| **Internal linking** | **9.2** | 157/157 taxonomy + tools; 157/157 r41; 0 orphan venues |
| **Trust** | **8.5** | Phones venue-sourced only; 23 venues correctly blank |

**Verdict:** **Ship-ready.** Round 87 fixes changelog regenerating a truncated 7-line `pa-network` after `inject-r84`.

---

## 1. Local gates (2026-06-03)

| Gate | Result |
|------|--------|
| `verify-deploy.js` | **PASS** |
| `npm run validate` | **0 errors**, 76 warnings (optional MD fields) |
| `html:validate` + `validate-all` | **PASS** |

### Schema (157 venues)

| Field | Count | Gate |
|-------|-------|------|
| GeoCoordinates | 155/157 | ≥ 154 |
| postalCode | 157/157 | ≥ 154 |
| telephone | 134/157 | ≥ 133 (R86) |
| Guide FAQPage | 44/44 | all |

**Geo exceptions:** `lumpinee-boxing-stadium`, `chatrium-golf-soi-dao`.

---

## 2. Live production (`full-site-audit.js`)

- **282/282** sitemap URLs → HTTP **200**
- **0** broken links on homepage spot-check (25 URLs)
- **6/6** sister TimPaemi sites up
- Machine log: `FULL_AUDIT_2026-06-03.md`

---

## 3. Internal linking (`audit-internal-links.js`)

| Marker | Pages |
|--------|-------|
| `venue-taxonomy-r84` | 157 |
| `venue-tools-r84` | 157 |
| `venue-guides-r41` | 157 |
| `venue-nearby-r84` | 115 |
| `sister-context-r84` | 92 |
| `pa-network-grid` | 285 |

- Venues with &lt;2 inbound internal links: **0**
- Broken internal hrefs from venue pages: **0**

See also: `FULL_INTERNAL_LINK_AUDIT_2026-06-03.md`

---

## 4. Content quality

| Tier | Count |
|------|-------|
| A (≥1200 words) | **44** |
| B / C | **0** |

Report: `CONTENT_QUALITY_AUDIT_2026-06-03.md`

---

## 5. Phone sprint (R81–R86)

| Round | Added | Total |
|-------|-------|-------|
| R85 | +11 | 129 |
| R86 | +5 | **134** (85%) |

**~23 without phone** — hash clubs, public beaches/pools/parks, walk-in-only gyms, wrong-city listings (Bounce, First Serve), Facebook-only (SUN Fitness, City Football Academy). Do not fabricate.

---

## 6. Round 87 fix

- `write-changelog.js` now uses `pa-network-block.js` (12-site grid).
- Ship pipeline: **`write-changelog.js` before `inject-internal-linking-r84.js`** so changelog never loses the grid.

---

## 7. Next levers

1. Homepage in-main hub links to top guides (hand `index.html`).
2. Resume phone research only where venue publishes a line (Facebook About, Google Business).
3. Optional: backfill changelog entries for ship rounds 75–86.

---

*Re-run: `node scripts/full-site-audit.js` · `node scripts/audit-internal-links.js`*
