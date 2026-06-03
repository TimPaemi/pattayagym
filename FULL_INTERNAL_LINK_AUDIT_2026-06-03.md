# Internal linking audit — pattaya-gym.com

**Date:** 2026-06-03 · **Round:** 84  
**Focus:** In-page mesh + TimPaemi / Pattaya Authority network

---

## Shipped (Round 84)

| Layer | Coverage |
|-------|----------|
| **r41** (re-run every build) | 15 category guide strips · 6 area hubs · 45 area×category · **157/157** venue guide blocks |
| **Venue taxonomy** (`venue-taxonomy-r84`) | **157/157** — category, area, area×category, `/sports/` |
| **Same-area cross-sport** (`venue-nearby-r84`) | **115/157** (venues with mappable area + peers) |
| **Directory tools** (`venue-tools-r84`) | **157/157** — compare, plan, map, search, coach matcher, guides hub |
| **Sister context** (`sister-context-r84`) | **91** pages (ranked guides, categories, areas, utilities missing editorial block) |
| **Site tools hub** (`site-tools-hub-r84`) | **7** utility pages + homepage/changelog pa-network fix |
| **pa-network grid** | **287/287** HTML — **12** sister sites + Pattaya.Gym “here” via `scripts/lib/pa-network-block.js` |

---

## Architecture

- **`build-v2.js`** — `paNetwork()` now delegates to shared block (no 7-card drift).
- **`scripts/lib/editorial-guide-shell.js`** — same block for Tier A guides.
- **`scripts/inject-internal-linking-r84.js`** — post-build idempotent inject; chains **r41** first.
- **`scripts/audit-internal-links.js`** — marker coverage, orphan venues, broken `/gyms/` hrefs.

---

## Link graph (local)

- **287** HTML files scanned  
- **0** venue pages with &lt;2 inbound internal links (post-r84)  
- **0** broken internal hrefs from venue pages (tel/mailto excluded)

---

## Next levers

1. Add **`inject-internal-linking-r84.js`** to `PUSH_ROUND*.cmd` and `AGENTS.md` gate list (after `build-v2.js`).
2. Homepage **in-main** hub links (hero → top guides) — hand-maintained `index.html`.
3. Resume **telephone** sprint (~39 venues) — orthogonal but strengthens LocalBusiness trust.

---

## Commands

```cmd
node build-v2.js
node scripts/inject-internal-linking-r84.js
node scripts/audit-internal-links.js
node scripts/verify-deploy.js
```
