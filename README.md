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
