<!-- NETWORK-HEADER v1 -->
# READ FIRST

**`C:\Projects\NETWORK-RULES.md` is the rulebook for every site in this network.** Read it before
touching footers, cross-domain links, schema, canonicals, indexing or design. It overrides
anything in this file.

**The two that break things most often:** exactly ONE cross-domain link per page (the followed
`timpaemi.com` author credit) and ZERO sister-site links anywhere — including JSON-LD, `sameAs`,
`llms.txt` and anything the build scripts inject.

**Before any structural change** (footer · publisher entity · canonicals · internal-link pattern ·
`noindex`/pruning · redesign · URL changes): log it in `C:\Projects\NETWORK-CHANGE-LOG.md`, and
do only one at a time. Content enrichment is not structural — ship that continuously.

**Site:** Pattaya Gym — https://pattaya-gym.com/
**Deploy:** `npm run build  then  node scripts/verify-deploy.js  then  git push`

**Retired 26 Jul 2026 — ignore anything below that says otherwise:** the publisher is
**TimPaemi**, not Pattaya Authority. Pattaya Authority must not appear on this site in any
footer, byline, JSON-LD, `llms.txt`, `humans.txt` or prose.
<!-- END NETWORK-HEADER -->

---

# SCOPE LOCK — this repo only

Added 2026-07-27. Several windows run in parallel, one per site. They collide,
and it is always the same failure: a window reads a network rulebook, concludes
it is working on a network, and starts building or wiring shared machinery.
This section exists to stop that.

**The repo is `C:\Projects\pattayagym`. Everything outside it is read-only.**

## 1 · Never build anything shared

No generator, engine, factory, template system, shared component library, shared
script or "reusable" module intended to serve more than this one site. Not in
this repo, not anywhere.

If you catch yourself writing the words *reusable*, *shared*, *for all sites*,
*network-wide*, *so the other sites can use it*, or *we can lift this out later*
— stop and delete that plan.

Duplication across sites is the intended trade. Each site is built separately,
on purpose. A copy that one window can change safely beats a shared module six
windows fight over. Do not de-duplicate across repos. Do not propose it. Do not
leave a TODO suggesting it.

## 2 · Never use a generator built for another repo

Do not import, call, copy-by-reference or depend on anything living outside this
repo — including `C:\Projects\_brand\`, a sibling site's `scripts/`, or a shared
file at the `C:\Projects` root.

If this repo ever gains such a dependency, cut it:

1. Find every build-time or runtime reference resolving outside this folder —
   imports, CSS `@import`, script `src`, config paths, any `node` script reading
   `../` above the repo root.
2. Copy those files in, to this repo's own `scripts/`, `src/lib/` or
   `src/styles/`. Copy, never move.
3. Repoint every reference at the local copy.
4. Strip anything the copy carries for other sites: per-site switches, site maps,
   theme registries, `if (site === 'x')` branches, CLI flags selecting a target
   site. What is left does exactly one thing for exactly this site, values
   hardcoded.
5. Delete nothing outside this repo. Other windows are still using those files.
6. Build, confirm output is unchanged, and report what you vendored in.

**The test: this repo must build with the rest of `C:\Projects` deleted.**
Verified clean on 2026-07-27 — no build-time or runtime path escapes this folder.

## 3 · Reading is fine, writing is not

You may read another repo to copy a pattern, check how something was solved, or
match a convention. You may never write to one, refactor one, tidy one, rename
in one, or run a build in one.

Two Astro builds at once delete each other's `dist/` and both fail. One build at
a time, in this repo only.

Files at the `C:\Projects` root are shared by every window. Do not edit them.

## 4 · If something outside this repo needs to change

Say so and stop. Describe what needs changing and why. Do not do it and mention
it afterwards — another window may be mid-edit in that exact file.

## 5 · Index-affecting changes need explicit approval

`noindex`, pruning, canonicals, redirects, URL changes, sitemap rules, robots
directives, bulk frontmatter edits. Not routine. Must not be bundled into other
work.

State the downside in clicks, not pages or percentages, and wait for a yes.

In July 2026 an index gate quarantined 4,635 pages on one site and took it from
40 clicks a day to zero within 24 hours. Nothing was deleted and it was fully
reverted, but the traffic did not come back the same day. Do not rebuild
anything like it.

**Content enrichment is not structural. Ship that continuously.**

## Before you report

- the repo you worked in, by full path
- that no file outside it was written, renamed or deleted
- anything you vendored in to cut an external dependency
- that no shared or reusable module was created
- that no `noindex` value was added or removed without being asked

**Do not commit. Do not push. Tim ships.**


# Cursor Agent Guide — pattaya-gym.com

This repo is the production source for **https://pattaya-gym.com**, deployed automatically from GitHub `main` to **Cloudflare Pages**.

## Stack

- Static HTML/CSS/vanilla JS — no framework
- Canonical builder: **`build-v2.js`**
- Source data: `data.js`, `venues/*.md`, `data/venue-geo.json`
- Deploy config: `_headers`, `_redirects` (Cloudflare Pages)
- GitHub repo: `TimPaemi/pattayagym`
- Production branch: **`main`** (Cloudflare auto-deploys on push)

## Before every ship

Run the full gate locally (or use `PUSH_ROUND<N>.cmd`):

```cmd
npm install
node build-v2.js
node scripts/rebuild-tool-stubs.js
node scripts/build-compare-page.js
node scripts/build-plan-page.js
node scripts/write-status-json.js
node scripts/write-changelog.js
node scripts/write-data-endpoints.js
node scripts/inject-area-guide-faq-r74.js
node scripts/inject-guide-schema.js
node scripts/fix-guide-meta-entities-r68.js
node scripts/write-round55-guides.js
node scripts/inject-venue-faq-r47.js
node scripts/inject-area-category-intros-r43.js
node scripts/deepen-round43-ranked.js
node scripts/inject-internal-linking-r84.js
node scripts/inject-ranked-editorial-funnel.js
node scripts/write-round37-guides.js
node scripts/deepen-round37-guides.js
node scripts/write-training-holiday-guide.js
node scripts/inject-cheapest-price-table.js
node scripts/export-venue-outreach.js
node scripts/inject-homepage-seo.js
node scripts/sync-guides-hub.js
node scripts/migrate-legacy-guides-chrome.js
node scripts/polish-ranked-guide-body.js
node scripts/apply-design-2026.js
node scripts/polish-design-2026.js
node scripts/inject-guide-schema.js
node scripts/build-press-kit.js
node scripts/bump-legacy-assets.js
node scripts/sync-csp-hashes.js
node scripts/sync-llms-guides.js
node scripts/patch-guide-map-cta-r70.js
node scripts/apply-geo-r73.js
node scripts/update-sitemap-lastmod.js
node scripts/verify-deploy.js
node scripts/verify-encoding.js
node scripts/check-no-network-links.js
node scripts/verify-design-layer.js
node scripts/verify-redirects.js
npm run html:validate
```

**Hard gates:** `verify-encoding.js` must pass - on 2026-07-27 a bad save turned every baht sign and em dash in data.js, build-v2.js and build-discovery.js into codepage garbage, a build propagated it to 306 files, and every other gate stayed green because mojibake is valid UTF-8. `check-no-network-links.js` must pass - it is only a `prebuild` hook, and SHIP-GYM.ps1 calls `node build-v2.js` directly, so it was being skipped on every ship; three guides had picked up sister-site links. `verify-redirects.js` must pass — it is the only check that compares `_redirects`, `sitemap.xml` and the pages on disk against each other, and the one that stops a retired area x category combo from being rebuilt and 301d away the day a venue refills it. `verify-deploy.js` must pass (no truncated HTML, NUL bytes, CSP hash drift, sitemap gaps). GitHub Actions runs `validate`, `build`, `verify-deploy`, `html:validate`, parallel `html:validate-all`, and Lighthouse CI on every push to `main`.

## Deploy workflow

**Normal route — one command, runs everything above plus all gates, and pushes nothing if a gate fails:**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Projects\pattayagym\SHIP-GYM.ps1
```

Add `-DryRun` to build and gate without touching git. The manual steps below are the fallback.


1. Work on branch `redesign-2026` (or feature branch → PR → merge to `main`).
2. Bump `ASSET_VERSION` in `build-v2.js` when CSS/JS/fonts change.
3. Regenerate all output; commit **source + generated HTML together**.
4. Push `redesign-2026`, then refspec to production:

```cmd
git push origin redesign-2026
git tag -f main-pre-round<N> origin/main
git push origin redesign-2026:main
node scripts/ping-sitemap.js
node scripts/submit-indexnow.js
```

Rollback: `git push origin main-pre-round<N>:main --force-with-lease`

## Do not

- **Never run `bump-and-push.js`** — it hard-codes `NEW_VERSION = 236` and will fail `verify-deploy` on every page. Delete it.

- Rename venue IDs, category keys, area slugs, or guide URLs without 301 redirects
- Add React/Next.js or external CDNs
- Skip `verify-deploy.js`
- Commit `.env` or secrets
- Fabricate venue facts, hours, prices, or contact details

## Key files

| File | Role |
|---|---|
| `build-v2.js` | Generates venues (see `GYMS.length` in `data.js`), categories, areas, utility pages, sitemap |
| `index.html` | Hand-maintained homepage (not generated) |
| `scripts/apply-design-2026.js` | Rolls the 2026 chrome (header, footer, no marquee, light metas, asset version) onto EVERY html file, including the ~59 static pages build-v2.js never regenerates. Idempotent. Do not drop from the chain. |
| `scripts/polish-design-2026.js` | Fixes the inline-style leftovers a stylesheet cannot reach, and patches the templates that emit them. Idempotent. |
| `scripts/verify-deploy.js` | Pre-push integrity gate |
| `scripts/build-press-kit.js` | Regenerates /press/ from live data — every figure computed from data.js and the venue records, never typed. Must run AFTER the design sweeps. |
| `scripts/verify-design-layer.js` | Pre-push gate: proves the 2026 chrome and the live venue count landed on all 359 pages. Catches the one regression no other gate sees — the design sweeps falling out of the chain. |
| `scripts/verify-encoding.js` | Pre-push gate: no mojibake anywhere. `npm run fix:encoding` repairs in place - safe on partly-damaged files, it only rewrites runs that decode cleanly. Logic and reasoning in `scripts/lib/mojibake.js`. |
| `scripts/check-no-network-links.js` | Pre-push gate: zero sister-site links, exactly one followed timpaemi.com credit per page. Runs as `prebuild` too, but SHIP bypasses `npm run build`, so it is listed explicitly in the gate block. |
| `scripts/verify-redirects.js` | Pre-push gate: `_redirects` vs sitemap vs disk. Catches a 301 shadowing a live page (Cloudflare applies redirects even when an asset matches), a 301 into a 404, a redirect chain, and an orphan indexable page the build wrote but never pruned. `npm run fix:redirects` removes only the shadowing rules. |
| `scripts/sync-csp-hashes.js` | Keeps `_headers` CSP in sync with inline scripts |
| `.github/workflows/build.yml` | CI on push/PR |
| `CONTRIBUTING.md` | Editorial + data conventions |
| `EDITORIAL_STYLE_GUIDE.md` | Voice and venue structure |

## Cloudflare

- Pages project connected to `TimPaemi/pattayagym`, branch `main`
- Cache busting via `?v=` query on CSS/JS/fonts (`ASSET_VERSION`)
- `_headers` sets CSP, HSTS, cache policy — do not weaken security headers
- Purge cache only if edge serves stale assets after a version bump

## Adding a venue

1. Create `venues/<id>.md` with YAML frontmatter
2. Add matching record to `GYMS` in `data.js`
3. Run build pipeline + verify-deploy
4. Optional: `node scripts/geocode-venues.js` for lat/lng schema
