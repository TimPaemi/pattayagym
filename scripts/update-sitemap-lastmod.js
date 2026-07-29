#!/usr/bin/env node
/**
 * update-sitemap-lastmod.js — the site's content-date ledger.
 *
 * Replaces the build-date lastmod that build-v2.js stamps on every sitemap URL
 * with a *real* per-page last-modified date, tracked via content hashes, and
 * stamps the same date into each page's JSON-LD `dateModified`.
 *
 * Why lastmod: when all 285 URLs share one lastmod that moves every build,
 * Google learns the field is unreliable and ignores it — wasting the limited
 * crawl budget a young domain gets. Honest lastmod lets crawlers prioritize
 * pages that actually changed.
 *
 * WHY dateModified IS STAMPED HERE TOO — S1-4, 2026-07-29
 * ------------------------------------------------------
 * Until today `build-v2.js:1172` passed `modified: g.verified`, so all 215
 * venue pages published their *venue verification date* as the page's
 * `dateModified`, and 52 of those also equalled `priceAsOf`. Hub pages used
 * SITE_MODIFIED, which is just the newest verification date on the site.
 *
 * Google is explicit that a date must describe publication or update of the
 * page, "not the date of the action described on the page". Re-checking a
 * gym's phone number is an action described on the page; it is not an edit to
 * the page. Manufacturing freshness that way invites Google to disregard the
 * site's date signals entirely.
 *
 * So both fields now come from one place: this ledger. A page's date moves when
 * its content hash moves, and not otherwise. `verified` and `priceAsOf` remain
 * visible on the page as the separate, labelled facts they always were.
 *
 * The ledger covers every shipped page, not only the sitemapped ones, so the
 * handful of noindex/utility pages get an honest date too.
 *
 * NO FEEDBACK LOOP: `normalize()` strips every YYYY-MM-DD run before hashing,
 * so writing today's date into a page cannot change that page's hash and
 * cannot make it look modified on the next build. Hashes for every page are
 * computed before any stamping, so no page can influence another.
 *
 * Run LAST in the build pipeline, after every HTML-mutating script and before
 * verify-deploy:
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

const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.wrangler', '.cursor',
  '.internal-docs', '.backups', 'packages', 'scripts', 'venues', 'dist', 'tmp',
  'private', 'research', 'brand-kit', 'fonts', 'og', 'brand', 'outreach', 'docs']);

function fileForUrl(url) {
  const rel = url.replace(SITE, '').replace(/^\//, '');
  if (!rel) return path.join(ROOT, 'index.html');
  if (rel.endsWith('.html') || rel.endsWith('.xml') || rel.endsWith('.txt') || rel.endsWith('.json')) {
    return path.join(ROOT, rel);
  }
  return path.join(ROOT, rel, 'index.html');
}

/** Inverse of fileForUrl, for pages the sitemap does not list. */
function urlForFile(file) {
  let rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel === 'index.html') return `${SITE}/`;
  if (rel.endsWith('/index.html')) return `${SITE}/${rel.slice(0, -'index.html'.length)}`;
  return `${SITE}/${rel}`;
}

function walkHtml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(f, out);
    else if (/\.html$/i.test(e.name)) out.push(f);
  }
  return out;
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

/* ---- 1. hash every shipped page, before anything is rewritten -------------- */
const pages = walkHtml(ROOT);
const dateFor = new Map();          // url -> date
const fileByUrl = new Map();        // url -> absolute path
const nextCache = {};
let fresh = 0, kept = 0;

for (const file of pages) {
  const url = urlForFile(file);
  const hash = crypto.createHash('sha256').update(normalize(fs.readFileSync(file, 'utf8'))).digest('hex').slice(0, 16);
  const prev = cache[url];
  const date = (prev && prev.hash === hash) ? prev.date : TODAY;
  if (prev && prev.hash === hash) kept++; else fresh++;
  nextCache[url] = { hash, date };
  dateFor.set(url, date);
  fileByUrl.set(url, file);
}

/* ---- 2. sitemap lastmod, from the same ledger ------------------------------ */
let xml = fs.readFileSync(SITEMAP, 'utf8');
const entries = [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>[^<]*<\/lastmod>/g)].map(m => m[1]);
let missing = 0;

for (const url of entries) {
  let date = dateFor.get(url);
  if (!date) {
    // A sitemapped URL that is not a walked .html page (e.g. a feed or a path
    // shape the walker skips) still needs an honest date, so hash it directly.
    const file = fileForUrl(url);
    if (!fs.existsSync(file)) { missing++; continue; }
    const hash = crypto.createHash('sha256').update(normalize(fs.readFileSync(file, 'utf8'))).digest('hex').slice(0, 16);
    const prev = cache[url];
    date = (prev && prev.hash === hash) ? prev.date : TODAY;
    nextCache[url] = { hash, date };
    dateFor.set(url, date);
  }
  const escUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  xml = xml.replace(
    new RegExp(`(<url><loc>${escUrl}</loc><lastmod>)[^<]*(</lastmod>)`),
    `$1${date}$2`
  );
}

fs.writeFileSync(SITEMAP, xml, 'utf8');
fs.mkdirSync(path.dirname(CACHE), { recursive: true });
fs.writeFileSync(CACHE, JSON.stringify(nextCache, null, 1), 'utf8');

/* ---- 3. JSON-LD dateModified, from the same ledger ------------------------- */
let stamped = 0, unchanged = 0, noDateNode = [];
for (const [url, file] of fileByUrl) {
  const date = dateFor.get(url);
  const orig = fs.readFileSync(file, 'utf8');
  if (!/"dateModified"\s*:/.test(orig)) { noDateNode.push(path.relative(ROOT, file).replace(/\\/g, '/')); continue; }
  const next = orig.replace(/("dateModified"\s*:\s*")[^"]*(")/g, `$1${date}$2`);
  if (next !== orig) { fs.writeFileSync(file, next, 'utf8'); stamped++; } else unchanged++;
}

console.log(`Content-date ledger: ${pages.length} pages hashed — ${fresh} changed (=> ${TODAY}), ${kept} unchanged (kept cached date).`);
console.log(`Sitemap lastmod: ${entries.length} URLs, ${missing} missing files.`);
console.log(`JSON-LD dateModified: ${stamped} pages restamped, ${unchanged} already correct, ${noDateNode.length} pages carry no dateModified${noDateNode.length ? ' (' + noDateNode.slice(0, 5).join(', ') + ')' : ''}.`);
