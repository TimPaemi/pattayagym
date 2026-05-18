#!/usr/bin/env node
/**
 * ping-sitemap.js
 *
 * Notifies Google + Bing of sitemap changes via the webmaster sitemap-ping
 * URLs. Speeds up crawl discovery of new pages (category-area, guides, etc.).
 *
 * Run after each successful deploy:
 *   node scripts/ping-sitemap.js
 *
 * Safe to run multiple times. Non-blocking — failures logged but don't exit
 * nonzero so they don't break a PUSH chain.
 */

const SITEMAP = 'https://pattaya-gym.com/sitemap.xml';
const TARGETS = [
  { name: 'Google', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}` },
  { name: 'Bing',   url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}` }
];

async function pingOne(target) {
  try {
    const res = await fetch(target.url, { method: 'GET', headers: { 'User-Agent': 'PattayaGym-SitemapPinger/1.0 (info@pattaya-gym.com)' } });
    if (res.ok) {
      console.log(`  [OK]   ${target.name}: HTTP ${res.status}`);
    } else {
      console.log(`  [WARN] ${target.name}: HTTP ${res.status} (non-2xx but ping was delivered)`);
    }
  } catch (e) {
    console.log(`  [SKIP] ${target.name}: ${e.message} (network error — won't block deploy)`);
  }
}

(async () => {
  console.log(`Pinging sitemap to search engines: ${SITEMAP}`);
  for (const t of TARGETS) await pingOne(t);
  console.log('Sitemap pings done. Search engines will re-crawl in their own time (minutes to days).');
})();
