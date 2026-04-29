# pattaya-gym.com

`pattaya-gym.com` is a static directory for gyms, Muay Thai camps, sport clubs, dive operators, golf courses, kids' academies, hotel fitness clubs, sports medicine venues, and sport-related landmarks around Pattaya, Thailand.

The site is content-first: every venue has a stable URL, a data record, a Markdown source page, generated schema, internal links, social metadata, and sitemap coverage.

## Tech Stack

- Static HTML, CSS, and JavaScript. No React, Next.js, Vite, or bundled frontend framework.
- Custom Node.js build chain: `build.js` -> `build-extras.js` -> `build-discovery.js`.
- Source data in `data.js` and `venues/*.md`.
- Generated output committed to the repo for Cloudflare Pages.
- Hosted on Cloudflare Pages from GitHub repo `TimPaemi/pattayagym`, branch `main`.

## Local Setup

Install Node.js 22 or newer. Then run:

```cmd
npm install
npm run validate
npm run build
npm run serve
```

Open `http://localhost:8080/`.

If dependencies are not installed yet and you only need a quick static preview, this also works:

```cmd
python -m http.server 8080
```

## NPM Scripts

- `npm run validate` - runs `node validate.js` against `data.js` and `venues/*.md`.
- `npm run build` - validates, generates venue pages, then chains extras and discovery pages.
- `npm run watch` - reruns the build when `data.js`, `venues/*.md`, or build scripts change.
- `npm run serve` - serves the repo at `http://localhost:8080/`.
- `npm run html:validate` - runs the basic CI HTML sample validator.

## File Map

- `index.html` - static homepage shell.
- `data.js` - `GYMS` venue records and `CATEGORIES`.
- `venues/<id>.md` - long-form venue source pages with YAML frontmatter.
- `build.js` - venue page generator, sitemap base, validation gate, cleanup, watch mode.
- `build-extras.js` - category pages, map, about, 404, robots, RSS feeds.
- `build-discovery.js` - area pages, guides, search, add-your-gym, methodology, stats, contact, press, favorites, planning tools.
- `styles.css` - global site styles.
- `venue.css` - generated-page and venue-page styles.
- `app.js` - homepage directory, search, featured venues, reviews.
- `share.js`, `compare.js`, `favorites.js`, `recent.js`, `shortcuts.js` - client-side utilities.
- `og-image.png`, `og/*.png` - root and per-venue Open Graph images.
- `_headers`, `_redirects` - Cloudflare Pages headers and redirects.
- `WORK_LOG_CODEX.md` - implementation log and verification notes.
- `CONTENT_AUDIT_2026-04-29.md` - content audit and manual fact-check checklist.

## Adding A Venue

1. Create `venues/<id>.md`.
2. Add a matching object to `GYMS` in `data.js`.
3. Keep the `id` identical in the filename, frontmatter, and data record.
4. Use an existing venue page as the structure model.
5. Run:

```cmd
npm run validate
npm run build
```

6. Spot-check `gyms/<id>/index.html`.
7. Commit the source and generated output together.

Do not rename existing venue IDs, category keys, area slugs, or guide slugs. Those URLs are indexed and must remain stable.

## Validation

`validate.js` fails the build for structural data errors:

- Missing `data.js` or `venues/`.
- Duplicate venue IDs or category keys.
- Missing required venue fields: `id`, `name`, `category`, `area`, `verified`.
- Markdown frontmatter missing required fields.
- Filename/frontmatter ID mismatch.
- Unknown category keys.
- Data records without Markdown pages, or Markdown pages without data records.

It also reports warnings for missing optional fields and source wording differences. Warnings are intentionally non-blocking because many existing venue pages use richer editorial wording in Markdown than in the compact data record.

## Build Behaviour

`node build.js` is intended to be idempotent. It:

- Runs validation first.
- Removes stale generated venue/category/area/guide/feed outputs that no longer match source data.
- Generates 158 venue pages from Markdown.
- Writes `sitemap.xml`.
- Runs extras and discovery generation.
- Fails with a non-zero exit code if any stage throws.

Expected successful build line:

```text
Generated 158 venue pages (158 deep + 0 stubs)
```

## Deployment

Push to `main`. Cloudflare Pages deploys automatically.

After a deploy, check:

- `https://pattaya-gym.com/`
- `https://pattaya-gym.com/sitemap.xml`
- `https://pattaya-gym.com/feed.xml`
- A representative venue page, category page, and guide page.

`_redirects` contains the host-specific `www.pattaya-gym.com` to `pattaya-gym.com` redirect. Keep it host-specific to avoid an apex redirect loop.

## CI

GitHub Actions runs on PRs and pushes to `main`:

- `npm install --ignore-scripts`
- `npm run validate`
- `npm run build`
- `npm run html:validate`
- Lighthouse CI against homepage, Fairtex venue page, Muay Thai category, and search.

Lighthouse CI uploads reports as workflow artifacts and comments temporary report links on pull requests.

## SEO And Search

- Sitemap: `https://pattaya-gym.com/sitemap.xml`
- Robots: `https://pattaya-gym.com/robots.txt`
- RSS: `https://pattaya-gym.com/feed.xml`
- Category RSS: `https://pattaya-gym.com/feed/<category>.xml`
- Google Search Console verification meta tag: not configured in this repo yet.
- Bing Webmaster Tools verification meta tag: not configured in this repo yet.

Submit the sitemap manually after major deploys until Search Console/Bing automation is configured.

## Analytics

All pages include Plausible for `pattaya-gym.com`. Analytics records once the domain exists in the Plausible account.

## Social Images

Run this after changing venue names, categories, or adding venues:

```cmd
powershell -ExecutionPolicy Bypass -File scripts\generate-og-images.ps1
```

It creates `og-image.png` plus one `og/<venue-id>.png` image per venue.

## Style And Editorial References

- Use `EDITORIAL_STYLE_GUIDE.md` for voice, venue structure, British-English spelling, source standards, and cross-linking rules.
- Use `SCHEMA_REFERENCE.md` for structured-data rules and category-to-schema mapping.
- Use `CONTRIBUTING.md` before making broad edits.
