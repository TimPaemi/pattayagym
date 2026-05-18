#!/usr/bin/env node
/**
 * repo-cleanup.js
 *
 * One-shot repo hygiene cleanup (Codex V3 P2/P3 items).
 *
 * Run from repo root: `node scripts/repo-cleanup.js`
 *
 * Actions (all idempotent):
 *  - Delete duplicate sitemap_index.xml (underscore variant; the canonical is sitemap-index.xml)
 *  - Delete known-junk binary files left by Cowork mount (zirZ3Bwy, zii7NKzl, $null)
 *  - Strip trailing NUL bytes from any .gitignore (cleanup belt-and-suspenders)
 *  - Report on tracked backup archives that should be removed via separate git rm
 *
 * Safe to run multiple times.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

let deleted = 0;
let cleaned = 0;
let warnings = [];

// 1. Delete duplicate sitemap_index.xml (Codex P3-1)
const dupSitemap = path.join(ROOT, 'sitemap_index.xml');
if (fs.existsSync(dupSitemap)) {
  fs.unlinkSync(dupSitemap);
  console.log('Deleted duplicate sitemap_index.xml (canonical is sitemap-index.xml)');
  deleted++;
}

// 2. Delete junk binary files
for (const junk of ['zirZ3Bwy', 'zii7NKzl', '$null']) {
  const p = path.join(ROOT, junk);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`Deleted junk file: ${junk}`);
    deleted++;
  }
  // Also check .backups
  const p2 = path.join(ROOT, '.backups', junk);
  if (fs.existsSync(p2)) {
    fs.unlinkSync(p2);
    console.log(`Deleted junk file: .backups/${junk}`);
    deleted++;
  }
}

// 3. Strip trailing NULs from .gitignore (belt-and-suspenders)
const gi = path.join(ROOT, '.gitignore');
if (fs.existsSync(gi)) {
  const buf = fs.readFileSync(gi);
  const stripped = buf.subarray(0, buf.length);
  // Strip trailing NULs
  let end = stripped.length;
  while (end > 0 && stripped[end - 1] === 0) end--;
  if (end < stripped.length) {
    fs.writeFileSync(gi, stripped.subarray(0, end));
    console.log(`Stripped ${stripped.length - end} trailing NUL bytes from .gitignore`);
    cleaned++;
  }
}

// 4. Report tracked backup archives (must be removed via git rm separately)
const candidates = [];
for (const entry of fs.readdirSync(ROOT)) {
  if (/^pattayagym_.*\.(zip|tar\.gz|tgz)$/i.test(entry) || /^BACKUP_MANIFEST.*\.md$/i.test(entry)) {
    candidates.push(entry);
  }
}
if (fs.existsSync(path.join(ROOT, '.backups'))) {
  for (const entry of fs.readdirSync(path.join(ROOT, '.backups'))) {
    if (/\.zip$|\.tar\.gz$|\.tgz$/i.test(entry)) {
      candidates.push(`.backups/${entry}`);
    }
  }
}
if (candidates.length > 0) {
  console.log('\nTracked backup archives found (run `git rm` to untrack — .gitignore now covers future ones):');
  for (const c of candidates) console.log(`  - ${c}`);
  warnings.push(`${candidates.length} tracked backup files. Run: git rm --cached ${candidates.join(' ')}`);
}

console.log(`\nCleanup: ${deleted} files deleted, ${cleaned} NUL-stripped, ${warnings.length} warnings`);
if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log('  ' + w);
}
