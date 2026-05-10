# Pattaya Gym — Full Backup Manifest

Backup created: 2026-05-08

## Archives

### pattayagym_source_2026-05-08_212803.zip

- Size: 956K
- SHA-256: `cfa6d451150a6c78097f55b036ef6e4c1467320008f755badf6d03ecde2131f1`

### pattayagym_html_2026-05-08_212948.tar.gz

- Size: 2.2M
- SHA-256: `3328920141a17fd465e10fc49617d9b9323ade8d64a722e572866a0f267eb1b1`

### pattayagym_og_2026-05-08_212948.tar.gz

- Size: 3.3M
- SHA-256: `fa5401e1ac1e07b579638bfd0db1eeada1db1499b899de8699ccfc1be5a8822a`


## Restore procedure

If the live site is broken or files are corrupted, you can fully restore the project from these 3 archives.

### Full restore (all 3 archives)

```powershell
cd C:\
mkdir pattayagym_restored
cd pattayagym_restored

# 1. Source: data.js, build scripts, venues/, CSS/JS, configs
Expand-Archive -Path "..\pattayagym\pattayagym_source_2026-05-08_212803.zip" -DestinationPath .

# 2. Generated HTML pages
tar -xzf "..\pattayagym\pattayagym_html_2026-05-08_212948.tar.gz"

# 3. OG card images
tar -xzf "..\pattayagym\pattayagym_og_2026-05-08_212948.tar.gz"

# 4. Verify
node validate.js
# Expected: 0 errors, 164 warnings

node build.js
# Expected: Generated 158 venue pages (158 deep + 0 stubs)
```

### Source-only restore (rebuild HTML + OG from scratch)

If only the source archive is available, you can regenerate all the HTML and OG images:

```powershell
cd C:\pattayagym_restored
Expand-Archive -Path "..\pattayagym\pattayagym_source_2026-05-08_212803.zip" -DestinationPath .

npm install
npm run build
npm run generate-og   # if available, otherwise OG cards regenerate via script
```

## What's in each archive

### pattayagym_source_*.zip (956K, 215 files)
- `data.js` (158 venue records + 16 categories)
- `build.js`, `build-discovery.js`, `build-extras.js`, `validate.js` (build chain)
- `venues/*.md` (158 venue source files)
- `app.js`, `compare.js`, `share.js`, `shortcuts.js`, `sw.js` (client JS)
- `styles.css`, `venue.css` (stylesheets)
- `index.html` (homepage source)
- `package.json`, `manifest.json`, `robots.txt`, `_redirects`
- `sitemap.xml` + 5 segment sitemaps + `sitemap_index.xml`
- `feed.xml` + 13 category RSS feeds
- `scripts/` (helper scripts)
- All Markdown documentation (README, CONTRIBUTING, EDITORIAL_STYLE_GUIDE, SCHEMA_REFERENCE, WORK_LOG_CODEX, CONTENT_AUDIT, etc.)

### pattayagym_html_*.tar.gz (2.2M)
- `gyms/*/index.html` (158 generated venue pages)
- `area/*/index.html` (6 generated area pages)
- `category/*/index.html` (13 generated category pages)
- `guides/*/index.html` (17 generated guide pages)

### pattayagym_og_*.tar.gz (3.3M)
- `og/*.png` (158 venue OG card images)
- `og-image.png` (default site-wide OG card)

## Post-restore validation

After restoring, run these to confirm everything is intact:

```powershell
node --check data.js                                # data.js syntax OK
node validate.js                                    # 0 errors, 164 warnings expected
node build.js                                       # Generated 158 venue pages
git status                                          # See what changed vs. last commit
```

