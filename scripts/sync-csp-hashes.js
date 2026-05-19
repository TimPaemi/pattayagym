#!/usr/bin/env node
/**
 * sync-csp-hashes.js
 *
 * Auto-syncs the script-src sha256 hash list in _headers to exactly match
 * the inline scripts in shipped HTML. Run before any push that touched
 * inline JS (footer time widget, back-to-top, gtag bootstrap, etc.).
 *
 * Strategy:
 *   1. Walk every .html file (excluding node_modules, .git, .backups)
 *   2. Extract inline <script> bodies (skip src= scripts and JSON-LD)
 *   3. SHA-256 each, base64-encode
 *   4. Read _headers, parse current script-src hash set
 *   5. Compute union (or diff) — write back _headers with all current hashes
 *
 * Idempotent. Safe to run multiple times.
 * Adds new hashes. Removes obsolete ones (Round 20 - Codex F22.CSP).
 * Pass --keep-obsolete to preserve the legacy behaviour.
 *
 * Run: node scripts/sync-csp-hashes.js
 */
const KEEP_OBSOLETE = process.argv.includes('--keep-obsolete');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');

function* walkHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.backups') continue;
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(fp);
    else if (entry.name.endsWith('.html')) yield fp;
  }
}

const found = new Set();
const re = /<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g;
let scanned = 0;
for (const fp of walkHtml(ROOT)) {
  scanned++;
  const html = fs.readFileSync(fp, 'utf8');
  let m;
  while ((m = re.exec(html))) {
    const body = m[1];
    if (!body.trim()) continue;
    const h = crypto.createHash('sha256').update(body, 'utf8').digest('base64');
    found.add(h);
  }
}

const headersPath = path.join(ROOT, '_headers');
const hdrs = fs.readFileSync(headersPath, 'utf8');
const current = new Set(
  [...hdrs.matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g)].map(m => m[1])
);

const added = [...found].filter(h => !current.has(h));
const obsoleteByCurrentScan = [...current].filter(h => !found.has(h));
const union = KEEP_OBSOLETE ? new Set([...current, ...found]) : new Set(found);
const removed = KEEP_OBSOLETE ? [] : obsoleteByCurrentScan;

if (added.length === 0 && removed.length === 0) {
  console.log(`CSP hashes already in sync. ${scanned} HTML files scanned, ${found.size} unique inline scripts found, ${current.size} hashes in _headers.`);
  process.exit(0);
}

// Build the new script-src hash list — sorted alphabetically for stability
const allHashes = [...union].sort().map(h => `'sha256-${h}'`).join(' ');

// Find the existing script-src line and replace its hash sequence
const cspLine = hdrs.match(/Content-Security-Policy:[^\n\r]+/);
if (!cspLine) {
  console.error('Could not find Content-Security-Policy line in _headers');
  process.exit(1);
}

let newCsp = cspLine[0];
// Replace the run of 'sha256-...' hashes after 'self' with the new sorted list
newCsp = newCsp.replace(/(script-src 'self')\s+(?:'sha256-[A-Za-z0-9+/=]+'\s*)+/, `$1 ${allHashes} `);

const newHdrs = hdrs.replace(cspLine[0], newCsp);
fs.writeFileSync(headersPath, newHdrs, 'utf8');

console.log(`Synced CSP hashes:`);
console.log(`  HTML files scanned:    ${scanned}`);
console.log(`  Unique inline scripts: ${found.size}`);
console.log(`  Previously in CSP:     ${current.size}`);
console.log(`  Now in CSP:            ${union.size}`);
console.log(`  Newly added:           ${added.length}`);
for (const h of added) console.log(`    + sha256-${h}`);
if (removed.length > 0) {
  console.log(`  Pruned (no longer match any inline script): ${removed.length}`);
  for (const h of removed) console.log(`    - sha256-${h}`);
}
if (KEEP_OBSOLETE && obsoleteByCurrentScan.length > 0) {
  console.log(`  Kept (--keep-obsolete): ${obsoleteByCurrentScan.length}`);
  for (const h of obsoleteByCurrentScan) console.log(`    ~ sha256-${h}`);
}
