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
  const found = new Set();
  for (const fp of htmlFiles) {
    const html = fs.readFileSync(fp, 'utf8');
    const re = /<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(html))) {
      const body = m[1];
      if (!body.trim()) continue;
      const h = crypto.createHash('sha256').update(body, 'utf8').digest('base64');
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

if (errors.length === 0) {
  console.log('\n\u2713 Deploy verify PASSED');
  process.exit(0);
} else {
  console.error(`\n\u2717 Deploy verify FAILED with ${errors.length} issue(s):`);
  for (const e of errors.slice(0, 25)) console.error('  - ' + e);
  if (errors.length > 25) console.error(`  ... and ${errors.length - 25} more`);
  process.exit(1);
}
