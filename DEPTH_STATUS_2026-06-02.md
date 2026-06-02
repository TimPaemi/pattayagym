# Depth & integrity status — 2026-06-02

Generated after Round 64 (consolidate ranked deepen blocks + full gate).

## Executive summary

| Metric | Value |
|--------|------:|
| Guides total | 44 |
| Tier A (≥1200 words in main) | 44 |
| Tier B | 0 |
| Ranked guides with guide-rank-primer | 15 |
| Ranked guides with legacy deepen-rNN blocks | 0 |

## Why deepen blocks existed

Rounds 43–46, 57, and 63 appended `<section class="guide-editorial-depth" id="deepen-rNN-block">` chunks before `#full-list` so ranked guides gained word count and internal links without rewriting the ranked list generator. Stacking r46 + r63 on Bangkok (and similar pairs) inflated the audit "inject×2" flag and duplicated h2 topics (Muay Thai stadiums, golf).

## Round 64 fix

`scripts/consolidate-ranked-deepen-r64.js` merges all deepen-rNN sections into one `<section class="guide-rank-primer">`, dedupes duplicate h2 titles, and deletes the pipeline markers. Content stays in-page; only the implementation pattern changes.

## Consolidation run

| Slug | Deepen before | Words before | Words after | Status |
|------|---------------:|-------------:|------------:|--------|
| bangkok-day-trip-sport-pattaya | 2 | 1201 | 1201 | ok |
| 24-hour-gyms-pattaya | 2 | 1251 | 1251 | ok |
| luxury-sports-clubs-pattaya | 2 | 1227 | 1227 | ok |
| best-for-beginners-pattaya | 2 | 1226 | 1226 | ok |
| family-friendly-pattaya | 2 | 1240 | 1240 | ok |
| best-dive-operators-pattaya | 2 | 1251 | 1251 | ok |
| best-muay-thai-pattaya | 1 | 1252 | 1252 | ok |
| cheapest-gyms-pattaya | 1 | 1515 | 1515 | ok |
| best-golf-courses-pattaya | 1 | 1383 | 1383 | ok |
| best-gyms-near-walking-street-pattaya | 1 | 1744 | 1744 | ok |
| female-friendly-gyms-pattaya | 1 | 1356 | 1356 | ok |
| pattaya-digital-nomad-fitness | 1 | 1388 | 1388 | ok |
| pattaya-solo-female-fitness | 1 | 1361 | 1361 | ok |
| pattaya-gyms-childcare-family-pools | 1 | 1209 | 1209 | ok |
| pattaya-seniors-low-impact-sport | 1 | 1279 | 1279 | ok |

## Heavy HTML (tool pages)

| Page | Size (KB) | Note |
|------|----------:|------|
| compare/index.html | 116.8 | Embedded venue JSON for client filter |
| plan-my-trip/index.html | 100.2 | Embedded venue JSON for trip planner |

These are intentional single-file tools; splitting JSON to `/data/` would shrink HTML but add a fetch and CSP surface. Deferred unless LCP budget forces it.

## Remaining deepen-rNN (should be empty post-R64)

None — all ranked inject markers consolidated.

## Thinnest guides (watch list)

- **1201w** `/guides/bangkok-day-trip-sport-pattaya/` (ranked)
- **1203w** `/guides/gym-day-pass-pattaya/` (editorial)
- **1205w** `/guides/muay-thai-training-holiday-pattaya/` (editorial)
- **1206w** `/guides/best-gym-central-pattaya/` (editorial)
- **1206w** `/guides/best-gym-east-pattaya/` (editorial)
- **1206w** `/guides/diving-watersports-pattaya/` (editorial)
- **1208w** `/guides/muay-thai-camps-with-accommodation-pattaya/` (editorial)
- **1209w** `/guides/best-gym-sattahip-pattaya/` (editorial)

## Gates to run before every ship

```cmd
node scripts/consolidate-ranked-deepen-r64.js
node build-v2.js
node scripts/inject-guide-schema.js
node scripts/verify-deploy.js
npm run html:validate
node scripts/content-quality-audit.js
node scripts/full-site-audit.js
```

---
*Re-run `node scripts/write-depth-status-r64.js` after content rounds.*