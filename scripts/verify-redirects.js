#!/usr/bin/env node
/**
 * GATE: URL routing coherence — _redirects and sitemap.xml vs the site on disk.
 *
 * SCOPE: pattaya-gym.com only. Hardcoded to this repo by design. Do not add a
 * site switch and do not copy it out to another repo.
 *
 * WHY THIS EXISTS
 * ---------------
 * On 2026-07-26 four area x category combos were retired: their venue counts had
 * fallen to zero, build-v2.js stopped emitting them, and the stale files left on
 * disk were 301'd to the parent area hub.
 *
 *   /area/central-pattaya/crossfit/  ->  /area/central-pattaya/
 *   /area/central-pattaya/yoga/      ->  /area/central-pattaya/
 *   /area/naklua/climbing/           ->  /area/naklua/
 *   /area/sattahip/clubs/            ->  /area/sattahip/
 *
 * That was correct on the day. It is not permanently correct, because build-v2.js
 * emits an area x category page the moment the combo has ONE venue:
 *
 *     if (venues.length === 0) continue;   // build-v2.js, ~line 2901
 *
 * and the sitemap writer lists it under the same condition (~line 2823). Venues
 * are added daily. The first Central Pattaya yoga studio added puts that URL into
 * a state where it is built on disk, listed in sitemap.xml, AND 301'd away.
 *
 * Cloudflare Pages resolves that in the worst possible direction. Its docs:
 * "Redirects are always followed, regardless of whether or not an asset matches
 * the incoming request." So the file loses. Google fetches a sitemap URL, gets a
 * 301 to the parent hub, and the new page never indexes.
 *
 * The mirror-image failure is what caused the retirement in the first place: a
 * combo EMPTIES, build-v2.js stops emitting it and stops sitemapping it, but the
 * old index.html stays on disk — because the build writes, it never prunes. The
 * result is a thin orphan page, live and indexable, competing with its own hub.
 *
 * Nothing else in the build sees either failure. validate, verify-deploy, verify,
 * seo-audit and verify-design-layer all read the HTML, and the HTML is fine. Both
 * conflicts live BETWEEN files, and this is the only gate that compares them.
 *
 * WHAT IT CHECKS
 *   A  shadowed page      - a redirect source that has an index.html on disk
 *   B  shadowed sitemap   - a redirect source that is listed in sitemap.xml
 *   C  dead destination   - a 301 pointing at something that does not exist
 *   D  redirect chain     - a destination that is itself a redirect source
 *   E  orphan page        - indexable HTML on disk, in no sitemap, no redirect
 *
 * --fix removes ONLY the rules caught by A or B — a redirect actively hiding a
 * live page. It never touches C, D or E; those are judgement calls. Run it, read
 * the diff, then re-run the gate.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REDIRECTS = path.join(ROOT, '_redirects');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const FIX = process.argv.includes('--fix');

/* Rules that are SUPPOSED to shadow a file on disk. Each needs a reason.
   The outreach CSV is an ops export: export-venue-outreach.js writes it into the
   deploy and the rule deliberately makes it unreachable in public. */
const INTENTIONAL_SHADOWS = new Set(['/outreach/venue-outreach.csv', '/outreach/*']);

/* Directories that are in the repo but are not served pages. */
const NOT_SERVED = new Set([
  'node_modules', 'packages', 'scripts', 'venues', 'guide-bodies', 'outreach',
  'dist', 'tmp', 'private', 'research', 'brand-kit'
]);

function norm(p) {
  if (!p) return '';
  let s = p.split('?')[0].split('#')[0];
  if (!s.startsWith('/')) s = '/' + s;
  return s;
}
/* '/a/b/' and '/a/b' are the same page; compare on the trailing-slash-free form. */
function key(p) {
  const s = norm(p);
  return s.length > 1 && s.endsWith('/') ? s.slice(0, -1) : s;
}

// ---------- parse _redirects -------------------------------------------------
if (!fs.existsSync(REDIRECTS)) { console.log('verify-redirects: no _redirects file - nothing to check.'); process.exit(0); }
const rawLines = fs.readFileSync(REDIRECTS, 'utf8').split(/\r?\n/);

const rules = [];
rawLines.forEach((line, i) => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const parts = t.split(/\s+/);
  if (parts.length < 2) return;
  const [from, to] = parts;
  const code = parts[2] || '301';
  if (/^https?:\/\//i.test(from)) return;           // host canonicalisation, not a path rule
  rules.push({ lineNo: i, raw: line, from: norm(from), to, code, splat: from.endsWith('/*') });
});

// ---------- disk + sitemap facts --------------------------------------------
function existsOnDisk(p) {
  const rel = norm(p).replace(/^\//, '');
  if (!rel) return fs.existsSync(path.join(ROOT, 'index.html')) ? 'page' : false;
  if (fs.existsSync(path.join(ROOT, rel, 'index.html'))) return 'page';
  if (fs.existsSync(path.join(ROOT, rel)) && fs.statSync(path.join(ROOT, rel)).isFile()) return 'file';
  return false;
}

const sitemapPaths = new Set();
if (fs.existsSync(SITEMAP)) {
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    try { sitemapPaths.add(key(new URL(m[1]).pathname)); } catch { /* ignore malformed loc */ }
  }
}

const sourceKeys = new Set(rules.filter(r => !r.splat).map(r => key(r.from)));

// ---------- checks A-D -------------------------------------------------------
const shadow = [];   // A + B  -> --fix can remove these
const dead = [];     // C
const chain = [];    // D

for (const r of rules) {
  if (INTENTIONAL_SHADOWS.has(r.from)) continue;
  if (r.splat) continue;                                    // prefix rules are ops-only here

  const k = key(r.from);
  const onDisk = existsOnDisk(r.from);
  const inSitemap = sitemapPaths.has(k);
  if (onDisk === 'page' || inSitemap) {
    shadow.push({ r, onDisk, inSitemap });
    continue;
  }

  // C - where does this 301 actually land?
  if (!/^https?:\/\//i.test(r.to)) {
    const destKey = key(r.to);
    if (sourceKeys.has(destKey)) { chain.push({ r, destKey }); continue; }
    if (!existsOnDisk(r.to)) dead.push(r);
  }
}

// ---------- check E: orphan indexable pages ---------------------------------
const htmlFiles = [];
(function walk(dir, rel) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name.startsWith('.') || NOT_SERVED.has(e.name)) continue;
      walk(path.join(dir, e.name), rel + '/' + e.name);
    } else if (e.name.endsWith('.html')) {
      htmlFiles.push({ abs: path.join(dir, e.name), rel: rel + '/' + e.name });
    }
  }
})(ROOT, '');

let noindexed = 0, sitemapped = 0, redirected = 0;
const orphans = [];
for (const f of htmlFiles) {
  const html = fs.readFileSync(f.abs, 'utf8');
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) { noindexed++; continue; }
  let url = f.rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  if (url === '') url = '/';
  if (sitemapPaths.has(key(url))) { sitemapped++; continue; }
  if (sourceKeys.has(key(url))) { redirected++; continue; }   // reported by A instead
  orphans.push({ url, file: f.rel.replace(/^\//, '') });
}

// ---------- report -----------------------------------------------------------
const bar = '-'.repeat(72);
console.log(`verify-redirects: ${rules.length} path rules, ${sitemapPaths.size} sitemap URLs, ${htmlFiles.length} HTML pages`);

let failed = false;

if (shadow.length) {
  failed = true;
  console.log('\n' + bar);
  console.log(`REDIRECT CONFLICT - ${shadow.length} rule(s) are hiding a live page`);
  console.log(bar);
  for (const { r, onDisk, inSitemap } of shadow) {
    const why = [onDisk === 'page' ? 'built on disk' : null, inSitemap ? 'listed in sitemap.xml' : null]
      .filter(Boolean).join(' + ');
    console.log(`  ${r.from}`);
    console.log(`      is ${why}, but _redirects line ${r.lineNo + 1} sends it to ${r.to} (${r.code})`);
  }
  console.log('\n  This is what happens when a retired area x category combo refills:');
  console.log('  build-v2.js emits the page again, the sitemap lists it, and Cloudflare');
  console.log('  applies the old 301 anyway - a redirect always beats a matching asset.');
  console.log('  Google follows the hop straight back out and the page never indexes.');
  console.log('\n  FIX - delete these lines from _redirects:');
  const shadowKeys = new Set(shadow.map(s => key(s.r.from)));
  for (const l of rawLines) {
    const t = l.trim();
    if (!t || t.startsWith('#')) continue;
    if (shadowKeys.has(key(t.split(/\s+/)[0]))) console.log(`      ${t}`);
  }
  console.log('\n  or run:  npm run fix:redirects');
}

if (chain.length) {
  failed = true;
  console.log('\n' + bar);
  console.log(`REDIRECT CHAIN - ${chain.length} rule(s) point at another redirect`);
  console.log(bar);
  for (const { r, destKey } of chain) console.log(`  ${r.from} -> ${r.to}  (and ${destKey} is itself redirected)`);
  console.log('\n  Point the first rule at the final destination. Chained 301s lose');
  console.log('  signal and Google gives up after a few hops.');
}

if (dead.length) {
  failed = true;
  console.log('\n' + bar);
  console.log(`DEAD DESTINATION - ${dead.length} rule(s) 301 to something that does not exist`);
  console.log(bar);
  for (const r of dead) console.log(`  ${r.from} -> ${r.to}   (no ${r.to.replace(/^\//, '')}index.html on disk)`);
  console.log('\n  A 301 into a 404 is worse than a plain 404: the crawler follows the');
  console.log('  hop, then fails, and the original URL keeps its dead link equity.');
}

if (orphans.length) {
  failed = true;
  console.log('\n' + bar);
  console.log(`ORPHAN PAGE - ${orphans.length} indexable page(s) on disk are in no sitemap and no redirect`);
  console.log(bar);
  for (const o of orphans) console.log(`  ${o.url}   (${o.file})`);
  console.log('\n  The build writes pages, it never prunes them. When a combo empties or a');
  console.log('  slug is renamed, the old file stays on disk: live, indexable, thin, and');
  console.log('  competing with the page that replaced it. Decide per page - put it in');
  console.log('  the sitemap, 301 it, or noindex it. Do not just leave it.');
}

if (!failed) {
  console.log('\n  A  no redirect shadows a built page          OK');
  console.log('  B  no redirect shadows a sitemap URL         OK');
  console.log('  C  every destination resolves on disk        OK');
  console.log('  D  no redirect chains                        OK');
  console.log(`  E  no orphan indexable pages                 OK  (${sitemapped} sitemapped, ${noindexed} noindex, ${redirected} redirected)`);
  console.log('\nverify-redirects: PASS');
  process.exit(0);
}

// ---------- --fix ------------------------------------------------------------
if (FIX && shadow.length) {
  const drop = new Set(shadow.map(s => key(s.r.from)));
  const kept = rawLines.filter(l => {
    const t = l.trim();
    if (!t || t.startsWith('#')) return true;
    const from = t.split(/\s+/)[0];
    if (/^https?:\/\//i.test(from)) return true;
    if (drop.has(key(from))) { console.log(`  removed  ${t}`); return false; }
    return true;
  });
  fs.writeFileSync(REDIRECTS, kept.join('\n'), 'utf8');
  console.log(`\n  _redirects rewritten: ${rawLines.length - kept.length} line(s) removed.`);
  console.log('  Re-run the gate, then re-run SHIP-GYM.ps1.');
  process.exit(1);   // still non-zero: the file changed, the run must be repeated
}

console.log('\nverify-redirects: FAIL');
process.exit(1);
