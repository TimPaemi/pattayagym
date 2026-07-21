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
node scripts/bump-legacy-assets.js
node scripts/sync-csp-hashes.js
node scripts/sync-llms-guides.js
node scripts/patch-guide-map-cta-r70.js
node scripts/apply-geo-r73.js
node scripts/update-sitemap-lastmod.js
node scripts/verify-deploy.js
npm run html:validate
```

**Hard gates:** `verify-deploy.js` must pass (no truncated HTML, NUL bytes, CSP hash drift, sitemap gaps). GitHub Actions runs `validate`, `build`, `verify-deploy`, `html:validate`, parallel `html:validate-all`, and Lighthouse CI on every push to `main`.

## Deploy workflow

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
| `scripts/verify-deploy.js` | Pre-push integrity gate |
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
