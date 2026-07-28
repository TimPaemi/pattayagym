# Pattaya.Gym redesign — 2026-07-26 handover

Branch: **`redesign-2026-07`** (created off `main`, nothing committed — per
`CODEX-GYM-LOOP.md` rule 6, Tim ships).

All gates pass. Nothing is pushed.

---

## What changed

### The design

| | Before | After |
|---|---|---|
| Canvas | Black `#000` | Light `#f7f8f3`, dark footer panel |
| Accents | Five at once (pink, cyan, yellow, mint, red) + neon glow | One volt `#cbff3c`, used as a fill only |
| Header | Dark two-row bar, 8 links, `★ Find a gym` | 60px white sticky row, 7 links, volt pill |
| Hero | Marquee ticker above a 96px fluid headline | Search-first: kicker, headline, search field, sport chips |
| Footer | 5 blocks, founder photo, `// Explore` prefixes, trust ticker, duplicate email line | Pattaya Insider shape: brand + description + publisher credit + socials, four columns, one legal bar, one small-print line |
| Stylesheet | 84.9 KB | 60.2 KB, covering all 280 classes in use |

Removed sitewide: the marquee tickers, the "declaration" manifesto blocks, the
network/projects grids, the founder profile card, the scroll-progress bar, the
eight-card stat grid and eight-card principles grid on the homepage, and all
emoji used as iconography.

### Two real content bugs fixed on the way

1. **The venue count was 58 short.** `data.js` has **215** venues; the homepage,
   title tag, meta description, OG/Twitter cards, WebSite JSON-LD and 49 guide
   pages all still said **157** — 98 occurrences. `sync-index-venue-count.js` is
   hard-coded to the even older `158`, so nothing was fixing `157`.
   Now 215 everywhere except `changelog/`, which is left alone on purpose: those
   numbers are historical records, not present-tense claims.
2. **Five guides had lost their FAQPage schema.** The documented ship chain runs
   `inject-guide-schema.js` *before* `write-round37-guides.js`,
   `write-round55-guides.js` and `write-training-holiday-guide.js`, so those
   rewrite the guides and drop the schema that was injected earlier.
   `inject-guide-schema.js` now runs again at the end of the chain. 47/47.

Also fixed: `--text-muted` was referenced by 15 pages but never declared (silent
inherit); four `area/*/*` pages had fallen out of every asset-bump allowlist and
were stuck on `?v=469` forever.

---

## Files changed

**New**
- `scripts/apply-design-2026.js` — rolls header, footer, marquee removal, light
  metas and the asset version onto every HTML file. Idempotent.
- `scripts/polish-design-2026.js` — fixes the inline-style leftovers a
  stylesheet cannot reach, and patches the templates that emit them.
- `../_brand/themes/pattaya-gym.css` — the palette, registered in the network
  design system with measured contrast ratios.

**Rewritten**
- `styles.css` — ground-up, on the network tokens.
- `index.html` — new homepage.
- `scripts/lib/v2-nav.js` — `NAV-SPEC-2026-V2`.
- `scripts/lib/site-footer.js` — `FOOTER-SPEC-2026-V2`.
- `DESIGN_RULES.md` — describes the new system; the old one described the neon one.

**Patched**
- `build-v2.js` — `ASSET_VERSION` 469 → **470**, light `theme-color` /
  `color-scheme`, `topMarquee()` removed from all six page templates.
- `scripts/inject-homepage-seo.js` — no longer injects the network hub.
- 8 templates touched by `polish-design-2026.js` (guide shell, tool chrome,
  compare, plan, favorites, changelog, guide writers, legacy migrator).
- 359 HTML files.

**Backup:** originals of `styles.css`, `index.html`, `build-v2.js`, `venue.css`,
`inject-homepage-seo.js`, `v2-nav.js`, `site-footer.js` are in
`.backups/pre-redesign-2026-07-26/`.

---

## Gate results

```
node build-v2.js              215 venues · 15 categories · 6 areas · 52 category-area · 10 info pages
node validate.js              0 errors, 303 warnings (all pre-existing "missing optional field")
node scripts/verify-deploy.js PASSED  — 359 HTML, 0 truncated, 0 NUL, 0 BOM,
                                        0 asset drift, 0 duplicate ids, FAQPage 47/47
node scripts/verify.js        ALL CHECKS PASSED
node scripts/seo-audit.js     SEO GATE PASS
npm run html:validate         clean
html-validate guides/* gyms/* clean
sync-csp-hashes               7 inline scripts, 7 hashes, in sync
```

---

## Ship it

One command, from anywhere:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Projects\pattayagym\SHIP-GYM.ps1
```

`SHIP-GYM.ps1` runs the full 37-step chain, then four gates plus a design-layer
consistency check across all 359 pages, then tags the current `origin/main` for
rollback, commits, pushes the branch, fast-forwards `main`, and pings the search
engines. **If any gate fails it stops and pushes nothing.**

The reason that matters: PowerShell's `$ErrorActionPreference` does not catch a
non-zero exit from `node.exe`, so a naive script sails past a failed build and
pushes broken HTML live. Every command in this one has its exit code checked.

Useful switches:

| | |
|---|---|
| `-DryRun` | build + gates only, never touches git. Run this first if you are unsure. |
| `-NoPush` | build, gate, commit locally, do not push. |
| `-SkipBuild` | gates + push only, when you have already built. |
| `-Message "..."` | custom commit message. |

Rollback — the exact command is printed at the end of every run:

```powershell
git push origin <printed-tag>:main --force-with-lease
```

**Purge the Cloudflare cache after the push.** `ASSET_VERSION` went 469 → 470, so
`styles.css?v=470` is a new URL and should be fine, but the HTML itself is
cached at the edge.

### The one thing to add to your habits

`AGENTS.md` now lists the two sweep scripts in the ship chain, before
`bump-legacy-assets.js`. **Do not drop them.** `build-v2.js` only regenerates
the pages it owns; without the sweeps, the ~59 static pages (guides, search,
compare, map, plan, favorites, changelog, sports, colophon) silently revert to
the old dark chrome on the next build, and you get a half-redesigned site.

---

## Decisions I made without asking

- **Deleted `bump-and-push.js`** (moved to `_to_delete/pattayagym-2026-07-26/`).
  It hard-coded `NEW_VERSION = '236'` and rewrote every `styles.css?v=` in the
  repo — running it once would have failed `verify-deploy` on all 359 pages.
  Nothing referenced it except its own docs. `AGENTS.md` also now carries a
  "never run this" note in case it comes back.
- **Kept `venue.css`, against my earlier advice.** It is genuinely dead — no page
  links it, and all 8 of its selectors are duplicated in `styles.css` — but
  `build.js`, `build-extras.js` and `build-discovery.js` all still reference it,
  so deleting it would break `npm run build:legacy`. 1.8 KB is not worth that on
  a ship day. Delete it when the legacy builders go.
- **Kept the numbered eyebrows** (`01 BROWSE BY SPORT`). They read as an
  editorial device and they are used on 354 pages; the homepage sequence was
  renumbered so it no longer skips 02.
- **Kept "no paid placements"** as a present-tense fact in the footer
  description, rather than dropping it the way the Insider footer spec does. It
  is your established sitewide editorial position, and it is phrased as a
  statement of current practice rather than a permanent promise.
- **Replaced the 🔍 search icon with a CSS-drawn magnifier** instead of just
  deleting it — the affordance is worth keeping, the emoji was not.

## Worth doing next, not done here

1. **`sync-index-venue-count.js` is keyed to `158`.** `polish-design-2026.js`
   now handles stale counts generically (`157` and `158` → live count, matching
   only where a space or hyphen follows, so phone numbers and Facebook IDs are
   safe), but the older script is still hard-coded and will miss the next drift.
2. **The brand mark is CSS.** A volt tile with a dark inner rule — a ring seen
   from above. It works and costs no request, but the network README flags a real
   wordmark as the one item worth paying a designer for, and it would be reused
5. **Titles:** 21 pages have titles over 65 characters and 15 have meta
   descriptions over 165. Pre-existing, not a gate failure, but worth a pass.
6. **Telephone coverage** is 170/215 on venue schema — the weakest structured-data
   field.
