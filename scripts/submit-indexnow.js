#!/usr/bin/env node
/**
 * submit-indexnow.js
 *
 * Pushes every sitemap URL to the IndexNow API (Bing, Yandex, Seznam, Naver).
 * Bing retired sitemap pings (HTTP 410) — IndexNow is the only push channel,
 * and Bing's index feeds ChatGPT search / Copilot.
 *
 * Key file: /<KEY>.txt at site root (must be deployed BEFORE submitting).
 *
 * Run after each successful deploy:
 *   node scripts/submit-indexnow.js
 *
 * Optional: pass specific URLs to submit only those.
 *   node scripts/submit-indexnow.js https://pattaya-gym.com/guides/foo/
 *
 * Non-blocking — failures logged but exit 0 so PUSH chains don't break.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOST = 'pattaya-gym.com';
const KEY = '647720c1a840875fc8363ef71cf5dd4a';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
}

(async () => {
  const cliUrls = process.argv.slice(2).filter(u => u.startsWith('http'));
  const urlList = cliUrls.length ? cliUrls : sitemapUrls();
  console.log(`IndexNow: submitting ${urlList.length} URLs for ${HOST}…`);

  // Sanity: key file must be live before engines will accept the batch.
  try {
    const keyRes = await fetch(KEY_LOCATION);
    const body = (await keyRes.text()).trim();
    if (!keyRes.ok || body !== KEY) {
      console.log(`  [WARN] Key file not live yet (HTTP ${keyRes.status}). Deploy first, then re-run.`);
      process.exit(0);
    }
  } catch (e) {
    console.log(`  [SKIP] Could not reach key file: ${e.message}`);
    process.exit(0);
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    });
    if (res.status === 200 || res.status === 202) {
      console.log(`  [OK] IndexNow accepted batch (HTTP ${res.status}). Bing/Yandex/Seznam/Naver notified.`);
    } else {
      console.log(`  [WARN] IndexNow HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`  [SKIP] IndexNow unreachable: ${e.message}`);
  }
  console.log('IndexNow done.');
})();
