# FULL WEBSITE AUDIT — pattaya-gym.com

**Audit date:** 2026-06-03 (re-run before Round 78)  
**Production:** https://pattaya-gym.com  
**Branch:** `main` · ASSET_VERSION **v452**  
**Latest ship:** Round 80 — telephone **90/157** (57%)

**Commands:** `verify-deploy.js` · `verify.js` · `validate.js` · `html:validate` · `html:validate-all` · `content-quality-audit.js` · `audit-venue-fields-r74.js` · `full-site-audit.js`

---

## Executive summary

| Dimension | Grade | Notes |
|-----------|-------|-------|
| **Overall** | **8.5** | Crawl-clean production; guides at full Tier A |
| **Technical** | **9.5** | 282/282 live HTTP 200; all local gates PASS |
| **SEO / schema** | **8.2** | Geo/postal/FAQ enforced; phone sprint 65→target 72 (R78) |
| **Content** | **9.0** | 44/44 Tier A; no marquee or FAQ drift |
| **Trust** | **8.5** | Phones from venue-owned pages only |

**Verdict:** **Ship-ready.** Main lever remains verified **telephone** coverage (92 venues still without phone before R78).

---

## 1. Local gates (2026-06-03)

| Gate | Result |
|------|--------|
| `verify-deploy.js` | **PASS** |
| `verify.js` | **PASS** |
| `validate.js` | **0 errors**, 151 warnings (optional MD fields) |
| `html:validate` + `validate-all` | **PASS** |

### Schema (157 venues)

| Field | Count | Gate |
|-------|-------|------|
| GeoCoordinates | 155/157 | ≥ 154 |
| postalCode | 157/157 | ≥ 154 |
| telephone | 65/157 | ≥ 64 (R77); **≥ 70 after R78** |
| Guide FAQPage | 44/44 | all |

**Geo exceptions:** `lumpinee-boxing-stadium`, `chatrium-golf-soi-dao`.

---

## 2. Live production

- **282/282** sitemap URLs → HTTP **200**
- **0** homepage dead links (25 checked)
- **6/6** sister sites up
- Machine log: `FULL_AUDIT_2026-06-03.md`

---

## 3. Content quality

| Tier | Count |
|------|-------|
| A (≥1200 words) | **44** |
| B / C | **0** |

Flags: `UPDATED WEEKLY` **0** · FAQ mismatch **0** · deepen injects **0**  
Report: `CONTENT_QUALITY_AUDIT_2026-06-03.md`

---

## 4. Venue data

| Metric | Value |
|--------|-------|
| Phones data.js ↔ MD | **65/157**, sync drift **0** |
| openingHoursSpecification | 157/157 |
| Website but no phone | **51** (next sprint queue) |

---

## 5. Phone sprint (R75–R77)

**12 + 6 = 18** numbers added in prior two sessions; pipeline: `data/manual-phones-r*.json` + `apply-manual-phones.js`.

**Skipped (no safe official line):** Jetts Pattaya, FIGHT EVO360 (site down), BOUNCE/Harbor ambiguity, First Serve (website = Nonthaburi HQ only), Clubloongchat (form only).

---

## 6. Backlog (priority)

1. **Phone sprint** — ~5–7 official contacts per round  
2. **area_fallback** geo pin review (19 venues)  
3. Per-guide OG images; compare/plan payload diet  
4. Lighthouse re-run on homepage + tool pages  
5. Off-page: `OFF_PAGE_GSC_CHECKLIST.md`

---

## 7. Inventory

157 venues · 44 guides · 287 HTML · 282 sitemap URLs · 15 categories

---

*After Round 78 ship, re-run `node scripts/full-site-audit.js` and bump telephone figures in this doc.*
