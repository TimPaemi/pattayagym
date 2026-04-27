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
