# pattaya-gym.com

The most comprehensive directory of gyms and sports venues in Pattaya, Thailand.

## Stack

- Pure HTML / CSS / JS — no build step.
- Hosted on Cloudflare Pages, auto-deploys on push to `main`.
- Domain: pattaya-gym.com

## Files

- `index.html` — homepage and directory shell
- `styles.css` — all styling
- `app.js` — search, filtering, rendering
- `data.js` — gym/venue data (this is the file you edit to add new venues)
- `sitemap.xml`, `robots.txt` — SEO basics
- `.gitignore`

## Adding a venue

Open `data.js` and append a new object to the `GYMS` array. Required fields: `id`, `name`, `category`, `area`, `description`. Then commit + push:

```cmd
git add data.js
git commit -m "Add: <venue name>"
git push
```

Cloudflare Pages will redeploy in ~30 seconds.

## Categories

Defined in `data.js` under `CATEGORIES`. Add new ones there if needed.

## Local preview

Just double-click `index.html` — it runs from the file system, no server needed.

## Per-venue SEO pages

Each `venues/<id>.md` becomes a dedicated page at `/gyms/<id>/` with full meta tags and `LocalBusiness` schema. Run the build before every push:

```cmd
node build.js
git add .
git commit -m "Update venues"
git push
```

This regenerates `gyms/<id>/index.html` for every `.md` file and updates `sitemap.xml`. To make it automatic on Cloudflare Pages: dashboard → `pattayagym` Pages project → Settings → Build & deployments → Build command = `node build.js` (Build output stays `/`).

## Local server preview

For generated pages and root-relative assets, use a local server:

```cmd
python -m http.server 8080
```

## Cloudflare Pages

- `_redirects` contains a host-specific `www.pattaya-gym.com` to `pattaya-gym.com` 301 redirect. Keep it host-specific to avoid an apex redirect loop.
- `_headers` sets default HTML caching, long-lived immutable caching for static CSS/JS/OG assets, and baseline security headers.
- Static assets are referenced with `?v=158` cache-busting query strings. Update that version when changing `styles.css`, `venue.css`, `app.js`, `data.js`, `share.js`, or `compare.js`.

## Search console

- Sitemap: `https://pattaya-gym.com/sitemap.xml`
- Robots: `https://pattaya-gym.com/robots.txt`
- Google Search Console verification meta tag: not configured in this repo yet.
- Bing Webmaster Tools verification meta tag: not configured in this repo yet.

## Analytics

All pages include the Plausible script for `pattaya-gym.com`. Analytics will record once the domain is configured in Plausible.

## Social images

Run this after changing venue names, categories, or adding venues:

```cmd
powershell -ExecutionPolicy Bypass -File scripts\generate-og-images.ps1
```

It creates `og-image.png` plus one `og/<venue-id>.png` image per venue.
