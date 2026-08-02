#!/usr/bin/env node
'use strict';
/**
 * verify-asset-version.js - makes long-lived asset caching safe to switch on.
 *
 * Every CSS/JS reference on the site carries one shared ?v= number, ASSET_VERSION
 * in build-v2.js. That is a good scheme, and it is what lets the browser cache
 * these files for a year instead of revalidating roughly seven of them per page
 * after four hours.
 *
 * It has exactly one failure mode, and it is nasty: change styles.css, forget to
 * bump the number, and every returning visitor keeps the old stylesheet for a
 * year with no way to tell them otherwise. A cache you cannot bust is worse than
 * no cache. So the long cache is only defensible with a gate that makes the
 * forgotten bump impossible, and this is that gate.
 *
 * It fails when a cached-forever asset's bytes changed while ASSET_VERSION did
 * not, and when any shipped page references a version other than the current one
 * (a partially applied bump is the same bug wearing a hat).
 *
 * data.js is deliberately NOT on the immutable list. It is the venue dataset and
 * it changes on nearly every ship, so requiring a version bump for it would fail
 * the gate constantly and teach everyone to ignore it. It keeps a short cache.
 *
 * Ledger: data/asset-fingerprints.json (committed).
 * Run: node scripts/verify-asset-version.js   (listed in scripts/ship-chain.json)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const LEDGER = path.join(ROOT, 'data', 'asset-fingerprints.json');

/* Cached for a year in _headers. Keep the two lists in step. */
const IMMUTABLE = ['styles.css', 'venue.css', 'site-ui.js', 'favorites.js',
  'share.js', 'shortcuts.js', 'compare.js', 'search-page.js', 'analytics.js',
  'location-tools.js'];

const build = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const m = build.match(/const ASSET_VERSION\s*=\s*'([^']+)'/);
if (!m) { console.error('verify:asset-version FAILED\n  ASSET_VERSION not found in build-v2.js'); process.exit(1); }
const VERSION = m[1];

let ledger = {};
if (fs.existsSync(LEDGER)) { try { ledger = JSON.parse(fs.readFileSync(LEDGER, 'utf8')); } catch (e) { ledger = {}; } }

const errors = [];
const next = {};
let changed = 0;

for (const asset of IMMUTABLE) {
  const f = path.join(ROOT, asset);
  if (!fs.existsSync(f)) continue;
  const sha = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 16);
  const prev = ledger[asset];
  if (prev && prev.sha !== sha && prev.version === VERSION) {
    errors.push(`${asset} changed but ASSET_VERSION is still '${VERSION}'.\n` +
      `      It is cached for a year, so returning visitors would keep the old file.\n` +
      `      Bump ASSET_VERSION in build-v2.js and rebuild.`);
  }
  if (!prev || prev.sha !== sha) changed++;
  next[asset] = { sha, version: VERSION };
}

/* A half-applied bump leaves some pages on the old URL. */
const SKIP = new Set(['.git', 'node_modules', '.internal-docs', '.backups', 'packages',
  '.wrangler', '.cursor', '.github', 'dist', 'tmp', 'private', 'research', 'docs']);
function walk(dir, out) {
  out = out || [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (/\.html$/i.test(e.name)) out.push(f);
  }
  return out;
}
const stale = new Map();
let refs = 0;
for (const f of walk(ROOT)) {
  const s = fs.readFileSync(f, 'utf8');
  for (const r of s.matchAll(/(?:src|href)="\/?([A-Za-z0-9._\/-]+\.(?:css|js))\?v=([^"]+)"/g)) {
    refs++;
    if (r[2] !== VERSION) {
      const k = `${r[1]}?v=${r[2]}`;
      stale.set(k, (stale.get(k) || 0) + 1);
    }
  }
}
if (stale.size) {
  errors.push(`${[...stale.values()].reduce((a, b) => a + b, 0)} reference(s) still point at an old version: ` +
    [...stale.keys()].slice(0, 5).join(', ') + `\n      Current ASSET_VERSION is '${VERSION}'. Re-run the build chain.`);
}

if (errors.length) {
  console.error('verify:asset-version FAILED');
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
fs.writeFileSync(LEDGER, JSON.stringify(next, null, 1), 'utf8');
console.log(`verify:asset-version OK - v${VERSION} on all ${refs} references, ` +
  `${Object.keys(next).length} immutable asset(s) fingerprinted (${changed} changed this build).`);
