# Off-page SEO checklist — pattaya-gym.com

One-time setup (~30 minutes). Technical site work is largely complete; indexing and Search Console are the highest-leverage off-repo tasks.

## 1. Google Search Console (priority)

1. Open [Google Search Console](https://search.google.com/search-console)
2. Add property → **URL prefix** → `https://pattaya-gym.com`
3. Verify via DNS TXT (Cloudflare) or HTML file upload
4. **Sitemaps** → Submit `https://pattaya-gym.com/sitemap.xml`
5. After 48–72 hours: check **Pages** → indexed count (expect 280+ over time)
6. Monitor **Performance** for queries: `gyms in pattaya`, `muay thai pattaya`, `best gym pattaya`

## 2. Bing Webmaster Tools

1. [Bing Webmaster](https://www.bing.com/webmasters) → Import from Google Search Console
2. Confirm `sitemap.xml` is listed

## 3. Post-ship local ping (already in PUSH scripts)

```cmd
node scripts/ping-sitemap.js
```

Google/Bing ping endpoints often return 404/410 — that is normal; the ping still notifies.

## 4. What is already strong on-site

| Signal | Status (Round 74) |
|--------|-------------------|
| GeoCoordinates in LocalBusiness | 155/157 venues |
| postalCode in schema | 157/157 (after area default) |
| telephone in schema | 47/157 (editorial — no fabricated numbers) |
| openingHoursSpecification | 157/157 |
| FAQPage on guides | 44/44 |
| CSP + verify-deploy gates | CI on every push |

## 5. Editorial backlog (not off-page)

- **Phone numbers:** 110 venues still lack `phone:` in `venues/*.md` / `data.js` — add only from venue websites or confirmed calls
- **Precise geo:** 19 venues use area-fallback coords — refine in `data/manual-geo-r73.json` when pins are confirmed
- **2 venues without geo:** `lumpinee-boxing-stadium` (Bangkok), `chatrium-golf-soi-dao` (Chanthaburi) — intentional

---

*Last updated: Round 74 ship.*
