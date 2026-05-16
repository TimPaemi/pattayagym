#!/usr/bin/env node
/**
 * bust-sw-and-verify.js
 *
 * 1. Bumps sw.js CACHE_NAME from v=222 to v=237 AND all precached URLs.
 * 2. Bumps ASSET_VERSION 236 -> 237 in 3 build files + all HTML refs.
 *
 * Run from C:\pattayagym (cmd.exe, not PowerShell):
 *   node bust-sw-and-verify.js
 *   node scripts/verify.js
 *   git add -A
 *   git commit -m "fix(sw): bust service worker cache to v=237"
 *   git push origin main
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const NEW_VERSION = '237';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// 1. sw.js: bump CACHE_NAME + every ?v=NNN in CORE_ASSETS
const swPath = path.join(ROOT, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
  sw = sw.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = 'pattaya-gym-v${NEW_VERSION}-${today}';`);
  sw = sw.replace(/\?v=\d+/g, `?v=${NEW_VERSION}`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`  sw.js: CACHE_NAME -> pattaya-gym-v${NEW_VERSION}-${today}, precache URLs -> ?v=${NEW_VERSION}`);
}

// 2. build files: ASSET_VERSION
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

// 3. HTML: bump every styles.css?v=NNN
const files = walk(ROOT);
let changed = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const after = before.replace(/styles\.css\?v=\d+/g, `styles.css?v=${NEW_VERSION}`);
  if (after !== before) {
    fs.writeFileSync(f, after, 'utf8');
    changed++;
  }
}
console.log(`  HTML: styles.css?v=${NEW_VERSION} in ${changed} file(s).`);

console.log('\nNext:');
console.log('  node scripts/verify.js');
console.log('  git add -A');
console.log(`  git commit -m "fix(sw): bust SW cache + bump assets to v=${NEW_VERSION}"`);
console.log('  git push origin main');
console.log('\nAfter push: in your browser, open dev tools -> Application -> Service Workers');
console.log('  -> click "Unregister" on pattaya-gym.com, then hard refresh (Ctrl+Shift+R).');
console.log('  Then visit https://pattaya-gym.com/category/fitness/');
