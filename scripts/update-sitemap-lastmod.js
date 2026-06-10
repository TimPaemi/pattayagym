#!/usr/bin/env node
/**
 * update-sitemap-lastmod.js
 *
 * Replaces the build-date lastmod that build-v2.js stamps on every sitemap URL
 * with a *real* per-page last-modified date, tracked via content hashes.
 *
 * Why: when all 285 URLs share one lastmod that moves every build, Google
 * learns the field is unreliable and ignores it — wasting the limited crawl
 * budget a young domain gets. Honest lastmod lets crawlers prioritize pages
 * that actually changed.
 *
 * How: hashes each page's HTML after stripping build-volatile noise
 * (?v= asset versions, version badges, build timestamps, dates). The hash +
 * date are cached in data/sitemap-lastmod.json (committed). A page only gets
 * a fresh lastmod when its meaningful content changes.
 *
 * Run LAST in the build pipeline, after every HTML-mutating script and
 * before verify-deploy:
 *   node scripts/update-sitemap-lastmod.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const CACHE = path.join(ROOT, 'data', 'sitemap-lastmod.json');
const TODAY = new Date().toISOString().slice(0, 10);

function fileForUrl(url) {
  const rel = url.replace(SITE, '').replace(/^\//, '');
  if (!rel) return path.join(ROOT, 'index.html');
  if (rel.endsWith('.html') || rel.endsWith('.xml') || rel.endsWith('.txt') || rel.endsWith('.json')) {
    return path.join(ROOT, rel);
  }
  return path.join(ROOT, rel, 'index.html');
}

// Strip everything that changes on every build without the page meaningfully changing.
function normalize(html) {
  return html
    .replace(/\?v=\d+/g, '')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, '')
    .replace(/\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2} UTC)?/g, '')
    .replace(/>v\d{2,4}</g, '><');
}

let cache = {};
if (fs.existsSync(CACHE)) {
  try { cache = JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch (e) { cache = {}; }
}

let xml = fs.readFileSync(SITEMAP, 'utf8');
const entries = [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>[^<]*<\/lastmod>/g)].map(m => m[1]);

let fresh = 0, kept = 0, missing = 0;
const nextCache = {};

for (const url of entries) {
  const file = fileForUrl(url);
  if (!fs.existsSync(file)) { missing++; continue; }
  const hash = crypto.createHash('sha256').update(normalize(fs.readFileSync(file, 'utf8'))).digest('hex').slice(0, 16);
  const prev = cache[url];
  let date;
  if (prev && prev.hash === hash) {
    date = prev.date;
    kept++;
  } else {
    date = TODAY;
    fresh++;
  }
  nextCache[url] = { hash, date };
  const escUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  xml = xml.replace(
    new RegExp(`(<url><loc>${escUrl}</loc><lastmod>)[^<]*(</lastmod>)`),
    `$1${date}$2`
  );
}

fs.writeFileSync(SITEMAP, xml, 'utf8');
fs.mkdirSync(path.dirname(CACHE), { recursive: true });
fs.writeFileSync(CACHE, JSON.stringify(nextCache, null, 1), 'utf8');

console.log(`Sitemap lastmod: ${entries.length} URLs — ${fresh} changed (=> ${TODAY}), ${kept} unchanged (kept cached date), ${missing} missing files.`);
