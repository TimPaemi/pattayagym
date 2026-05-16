#!/usr/bin/env node
/**
 * bump-and-push.js
 *
 * Bumps every styles.css?v=NNN reference in HTML to ?v=236
 * to bust browser caches after the centering fix landed.
 *
 * Run from C:\pattayagym in any shell:
 *   node bump-and-push.js
 *
 * Then (in same shell):
 *   git add -A
 *   git commit -m "perf: bump styles.css to v=236 to bust cache after centering fix"
 *   git push origin main
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const NEW_VERSION = '236';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// 1. Bump ASSET_VERSION in 3 build files (so future regens use the new version)
for (const bf of ['build.js', 'build-extras.js', 'build-discovery.js']) {
  const p = path.join(ROOT, bf);
  if (!fs.existsSync(p)) continue;
  const before = fs.readFileSync(p, 'utf8');
  const after = before.replace(/const ASSET_VERSION = '\d+';/, `const ASSET_VERSION = '${NEW_VERSION}';`);
  if (after !== before) {
    fs.writeFileSync(p, after, 'utf8');
    console.log(`  ${bf}: ASSET_VERSION -> '${NEW_VERSION}'`);
  }
}

// 2. Bump styles.css?v=NNN in every HTML file
const files = walk(ROOT);
let changed = 0;
const pattern = /styles\.css\?v=\d+/g;
const replacement = `styles.css?v=${NEW_VERSION}`;

for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  if (!pattern.test(before)) {
    pattern.lastIndex = 0;
    continue;
  }
  pattern.lastIndex = 0;
  const after = before.replace(pattern, replacement);
  if (after !== before) {
    fs.writeFileSync(f, after, 'utf8');
    changed++;
  }
}

console.log(`Bumped styles.css to ?v=${NEW_VERSION} in ${changed} HTML file(s).`);
console.log(`Total HTML files scanned: ${files.length}`);
console.log('\nNext steps:');
console.log('  node scripts/verify.js');
console.log('  git add -A');
console.log(`  git commit -m "perf: bump styles.css to v=${NEW_VERSION} to bust cache after centering fix"`);
console.log('  git push origin main');
