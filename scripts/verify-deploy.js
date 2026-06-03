#!/usr/bin/env node
/**
 * verify-deploy.js
 * Pre-push integrity check. Fails fast if the working tree has:
 *   - Any HTML file not ending with </html>
 *   - Any HTML file ending mid-attribute (truncation)
 *   - styles.css with unbalanced braces
 *   - Any HTML, JS, CSS, JSON, MD, .cmd, .xml or .txt source file
 *     with NUL bytes or UTF-8 BOM (Round 17 expansion - Codex F23.1).
 *     The build-v2.js NUL-byte truncation from Round 16 would have
 *     been caught here under the new rules.
 *   - Any sitemap URL whose local file is missing (catches GUIDE_SLUGS drift)
 *   - Any of the key build scripts failing `node --check`
 *
 * Run from repo root: `node scripts/verify-deploy.js`
 * Exit code 0 = clean, 1 = failures (logged).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const errors = [];

// --- Syntax check key JS files ---
const JS_FILES_TO_CHECK = [
  'build-v2.js', 'data.js',
  'scripts/build-compare-page.js',
  'scripts/build-plan-page.js',
  'scripts/write-changelog.js',
  'scripts/write-status-json.js',
  'scripts/rebuild-tool-stubs.js',
  'scripts/sync-csp-hashes.js',
  'scripts/inject-guide-schema.js',
  'scripts/bump-legacy-assets.js'
];
for (const f of JS_FILES_TO_CHECK) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  try {
    execSync(`node --check "${p}"`, { stdio: 'pipe' });
  } catch (e) {
    errors.push(`${f}: node --check FAILED - ${e.stderr ? e.stderr.toString().split('\n')[0] : e.message}`);
  }
}

// --- Walk HTML files ---
const htmlFiles = [];
function walkHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.backups' || entry.name === '.wrangler') continue;
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(fp);
    else if (entry.name.endsWith('.html')) htmlFiles.push(fp);
  }
}
walkHtml(ROOT);

let truncated = 0, midAttr = 0, nulled = 0;
for (const fp of htmlFiles) {
  const buf = fs.readFileSync(fp);
  const trimmed = buf.subarray(0, buf.length).toString('utf8').trimEnd();
  if (!trimmed.endsWith('</html>')) {
    errors.push(`${path.relative(ROOT, fp)}: does NOT end with </html>`);
    truncated++;
  }
  const tail = trimmed.slice(-200);
  if (/href="[^"]*$/.test(tail) || /src="[^"]*$/.test(tail) || /class="[^"]*$/.test(tail)) {
    errors.push(`${path.relative(ROOT, fp)}: ends mid-attribute`);
    midAttr++;
  }
  if (buf.includes(0)) {
    errors.push(`${path.relative(ROOT, fp)}: contains NUL bytes (${buf.filter(b => b === 0).length} of them)`);
    nulled++;
  }
}

// --- CSS brace balance check ---
const cssPath = path.join(ROOT, 'styles.css');
if (fs.existsSync(cssPath)) {
  const cssBuf = fs.readFileSync(cssPath);
  const cssStr = cssBuf.toString('utf8');
  const opens = (cssStr.match(/\{/g) || []).length;
  const closes = (cssStr.match(/\}/g) || []).length;
  if (opens !== closes) {
    errors.push(`styles.css: brace imbalance - ${opens} { vs ${closes} }`);
  }
  if (cssBuf.includes(0)) {
    errors.push(`styles.css: contains NUL bytes`);
  }
}

// --- Round 17 - Codex F23.1: NUL/BOM scan across all text source files ---
const SOURCE_EXT_RE = /\.(js|css|md|json|cmd|xml|txt)$/i;
const SOURCE_NAMES = new Set(['_headers', '_redirects']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.backups', '.wrangler', 'archive', 'archives']);
function walkSources(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSources(fp, out);
    else if (SOURCE_EXT_RE.test(entry.name) || SOURCE_NAMES.has(entry.name)) out.push(fp);
  }
}
const sourceFiles = [];
walkSources(ROOT, sourceFiles);
let sourceNul = 0, sourceBom = 0;
for (const fp of sourceFiles) {
  const buf = fs.readFileSync(fp);
  if (buf.length === 0) continue;
  if (buf.includes(0)) {
    errors.push(`${path.relative(ROOT, fp)}: contains NUL bytes (${buf.filter(b => b === 0).length} of them)`);
    sourceNul++;
  }
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    errors.push(`${path.relative(ROOT, fp)}: starts with UTF-8 BOM (EF BB BF)`);
    sourceBom++;
  }
}

// --- Round 17 - Codex F07.1: every sitemap URL must have a local file ---
const sitemapPath = path.join(ROOT, 'sitemap.xml');
let sitemapUrls = 0, sitemapMissing = 0;
if (fs.existsSync(sitemapPath)) {
  const sm = fs.readFileSync(sitemapPath, 'utf8');
  const matches = [...sm.matchAll(/<loc>https?:\/\/[^<]*?\/([^<]*?)<\/loc>/g)];
  for (const m of matches) {
    sitemapUrls++;
    const urlPath = m[1].replace(/\/$/, '');
    if (!urlPath) continue;
    const candidates = [
      path.join(ROOT, urlPath, 'index.html'),
      path.join(ROOT, urlPath)
    ];
    if (!candidates.some(c => fs.existsSync(c))) {
      errors.push(`sitemap.xml: ${m[0]} has no local file`);
      sitemapMissing++;
    }
  }
}

// --- CSP hash sanity ---
const headersPath = path.join(ROOT, '_headers');
if (fs.existsSync(headersPath)) {
  const hdrs = fs.readFileSync(headersPath, 'utf8');
  const cspHashes = [...hdrs.matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g)].map(m => m[1]);
  const crypto = require('crypto');
  const scriptBodyForHash = (body) => body.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const found = new Set();
  for (const fp of htmlFiles) {
    const html = fs.readFileSync(fp, 'utf8');
    const re = /<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(html))) {
      const body = m[1];
      if (!body.trim()) continue;
      const h = crypto.createHash('sha256').update(scriptBodyForHash(body), 'utf8').digest('base64');
      found.add(h);
    }
  }
  const missing = [...found].filter(h => !cspHashes.includes(h));
  if (missing.length) {
    console.error('\n--- CSP hash debug ---');
    console.error('Hashes in _headers CSP (' + cspHashes.length + '):');
    for (const h of cspHashes) console.error('  cspHashes: [' + h + ']');
    console.error('Hashes computed from inline scripts (' + found.size + '):');
    for (const h of found) console.error('  found:     [' + h + ']');
    console.error('--- end debug ---\n');
    for (const m of missing) errors.push(`_headers CSP: missing inline-script hash sha256-${m}`);
  }
}

// --- Round 22: robots.txt must only advertise sitemaps that exist on disk ---
{
  const robotsPath = path.join(ROOT, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robots = fs.readFileSync(robotsPath, 'utf8');
    for (const m of robots.matchAll(/^Sitemap:\s*https?:\/\/[^/]+\/(.+?)\s*$/gim)) {
      const rel = m[1].trim();
      if (rel && !fs.existsSync(path.join(ROOT, rel))) {
        errors.push(`robots.txt advertises a sitemap with no local file: ${rel}`);
      }
    }
  }
}

// --- P0: outreach CSV must not ship as a public static file ---
{
  const outreachCsv = path.join(ROOT, 'outreach', 'venue-outreach.csv');
  if (fs.existsSync(outreachCsv)) {
    const body = fs.readFileSync(outreachCsv, 'utf8');
    if (/venue_id|email_template|badge-listed/i.test(body)) {
      errors.push('outreach/venue-outreach.csv must not contain outreach data — use private/outreach/ only');
    }
    if (!body.includes('not published')) {
      errors.push('outreach/venue-outreach.csv must be the public stub (not published message) if present');
    }
  }
  const redirectsPath = path.join(ROOT, '_redirects');
  if (fs.existsSync(redirectsPath)) {
    const redirects = fs.readFileSync(redirectsPath, 'utf8');
    const hasOutreachBlock =
      /\/outreach\/venue-outreach\.csv\s+\/404\.html\s+30[12]/.test(redirects) &&
      /\/outreach\/\*\s+\/404\.html\s+30[12]/.test(redirects);
    if (!hasOutreachBlock) {
      errors.push('_redirects: missing 302 redirect for /outreach/* → /404.html (CF Pages does not support 404 status in _redirects)');
    }
  }
}

// --- Round 21 (Codex P1-1 / P2-6): asset-version consistency ---
let versionDrift = 0;
{
  const bv2 = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
  const avMatch = bv2.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
  const ASSET_VERSION = avMatch ? avMatch[1] : null;
  if (ASSET_VERSION) {
    for (const fp of htmlFiles) {
      const html = fs.readFileSync(fp, 'utf8');
      const stale = [...new Set([...html.matchAll(/\.(?:css|js|woff2)\?v=(\d+)/g)].map(m => m[1]))].filter(v => v !== ASSET_VERSION);
      if (stale.length) {
        errors.push(`${path.relative(ROOT, fp)}: stale asset version ?v=${stale.join(',')} (expected ${ASSET_VERSION})`);
        versionDrift++;
      }
    }
  }
}

// --- Round 21 (Codex P2-4 / P2-6): duplicate id attributes ---
let dupIdFiles = 0;
for (const fp of htmlFiles) {
  const html = fs.readFileSync(fp, 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const seen = {}, dups = [];
  for (const id of ids) { if (seen[id]) { if (dups.indexOf(id) < 0) dups.push(id); } else seen[id] = true; }
  if (dups.length) {
    errors.push(`${path.relative(ROOT, fp)}: duplicate id(s) ${dups.join(', ')}`);
    dupIdFiles++;
  }
}

// --- Round 66: compare/plan external JSON (no giant inline venue blobs) ---
const toolJson = ['data/compare-venues.json', 'data/plan-venues.json'];
for (const rel of toolJson) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) errors.push(`Missing ${rel} (run build-compare-page.js + build-plan-page.js)`);
  else {
    try {
      const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (!Array.isArray(arr) || arr.length < 100) {
        errors.push(`${rel}: expected array of 100+ venues, got ${Array.isArray(arr) ? arr.length : typeof arr}`);
      }
    } catch (e) {
      errors.push(`${rel}: invalid JSON - ${e.message}`);
    }
  }
}
const compareHtml = path.join(ROOT, 'compare', 'index.html');
if (fs.existsSync(compareHtml)) {
  const ch = fs.readFileSync(compareHtml, 'utf8');
  if (ch.includes('id="venues-data"')) {
    errors.push('compare/index.html: still embeds inline venues-data (should fetch /data/compare-venues.json)');
  }
  const kb = ch.length / 1024;
  if (kb > 85) errors.push(`compare/index.html: ${kb.toFixed(1)} KB (expected <85 KB without inline JSON)`);
}
const planHtml = path.join(ROOT, 'plan-my-trip', 'index.html');
if (fs.existsSync(planHtml)) {
  const ph = fs.readFileSync(planHtml, 'utf8');
  if (ph.includes('id="venues-data"')) {
    errors.push('plan-my-trip/index.html: still embeds inline venues-data (should fetch /data/plan-venues.json)');
  }
}

// --- Round 74: LocalBusiness schema coverage on venue pages ---
let venueGeo = 0;
let venuePostal = 0;
let venuePhone = 0;
let guideFaq = 0;
let guideTotal = 0;
const gymsDir = path.join(ROOT, 'gyms');
if (fs.existsSync(gymsDir)) {
  for (const ent of fs.readdirSync(gymsDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const fp = path.join(gymsDir, ent.name, 'index.html');
    if (!fs.existsSync(fp)) continue;
    const h = fs.readFileSync(fp, 'utf8');
    if (h.includes('"geo"') && h.includes('GeoCoordinates')) venueGeo++;
    if (h.includes('"postalCode"')) venuePostal++;
    if (h.includes('"telephone"')) venuePhone++;
  }
}
const guidesDir = path.join(ROOT, 'guides');
if (fs.existsSync(guidesDir)) {
  for (const ent of fs.readdirSync(guidesDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    guideTotal++;
    const fp = path.join(guidesDir, ent.name, 'index.html');
    if (fs.existsSync(fp) && fs.readFileSync(fp, 'utf8').includes('FAQPage')) guideFaq++;
  }
}
const { GYMS } = require(path.join(ROOT, 'data.js'));
const VENUE_N = GYMS.length;
if (venueGeo < VENUE_N - 3) {
  errors.push(`Venue schema: geo ${venueGeo}/${VENUE_N} (expected >= ${VENUE_N - 3})`);
}
if (venuePostal < VENUE_N - 3) {
  errors.push(`Venue schema: postalCode ${venuePostal}/${VENUE_N} (expected >= ${VENUE_N - 3})`);
}
if (guideTotal > 0 && guideFaq < guideTotal) {
  errors.push(`Guide schema: FAQPage ${guideFaq}/${guideTotal} (expected all guides)`);
}
const MIN_VENUE_PHONE = 87;
if (venuePhone < MIN_VENUE_PHONE) {
  errors.push(`Venue schema: telephone ${venuePhone}/${VENUE_N} (expected >= ${MIN_VENUE_PHONE})`);
}

// --- Report ---
console.log(`HTML files checked: ${htmlFiles.length}`);
console.log(`  truncated (no </html>): ${truncated}`);
console.log(`  mid-attribute endings:  ${midAttr}`);
console.log(`  with NUL bytes:         ${nulled}`);
console.log(`Source files checked: ${sourceFiles.length}`);
console.log(`  with NUL bytes:         ${sourceNul}`);
console.log(`  with UTF-8 BOM:         ${sourceBom}`);
console.log(`Sitemap URLs checked: ${sitemapUrls}`);
console.log(`Asset-version drift files: ${versionDrift}`);
console.log(`Duplicate-id files:        ${dupIdFiles}`);
console.log(`  missing local file:     ${sitemapMissing}`);
console.log(`Venue LocalBusiness schema: geo ${venueGeo}/${VENUE_N}, postalCode ${venuePostal}/${VENUE_N}, telephone ${venuePhone}/${VENUE_N}`);
console.log(`Guide schema: FAQPage ${guideFaq}/${guideTotal}`);

if (errors.length === 0) {
  console.log('\n\u2713 Deploy verify PASSED');
  process.exit(0);
} else {
  console.error(`\n\u2717 Deploy verify FAILED with ${errors.length} issue(s):`);
  for (const e of errors.slice(0, 25)) console.error('  - ' + e);
  if (errors.length > 25) console.error(`  ... and ${errors.length - 25} more`);
  process.exit(1);
}
