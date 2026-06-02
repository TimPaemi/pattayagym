#!/usr/bin/env node
/**
 * sync-index-venue-count.js — Align venue count copy with data.js GYMS.length site-wide.
 * Run after removing or adding venues in data.js.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { GYMS } = require(path.join(ROOT, 'data.js'));
const n = GYMS.length;

function patchVenueCount(html) {
  return html
    .replace(/\b158-venue\b/gi, `${n}-venue`)
    .replace(/\b158\+/g, `${n}+`)
    .replace(/\b158 VENUES\b/g, `${n} VENUES`)
    .replace(/\b158 Venues\b/g, `${n} Venues`)
    .replace(/\b158 venues\b/g, `${n} venues`)
    .replace(/\b158 hand-checked\b/gi, `${n} hand-checked`)
    .replace(/Search 158 Pattaya gyms/g, `Search ${n} Pattaya gyms`)
    .replace(/Search 158 venues/g, `Search ${n} venues`);
}

function patchFile(fp) {
  const orig = fs.readFileSync(fp, 'utf8');
  const next = patchVenueCount(orig);
  if (next !== orig) {
    fs.writeFileSync(fp, next, 'utf8');
    return true;
  }
  return false;
}

let files = 0;
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      walk(fp);
    } else if (ent.name.endsWith('.html')) {
      if (patchFile(fp)) files++;
    }
  }
}

walk(ROOT);
const manifest = path.join(ROOT, 'manifest.json');
if (fs.existsSync(manifest) && patchFile(manifest)) files++;
const bodiesDir = path.join(ROOT, 'scripts', 'guide-bodies');
if (fs.existsSync(bodiesDir)) {
  for (const ent of fs.readdirSync(bodiesDir)) {
    if (!ent.endsWith('.js')) continue;
    const fp = path.join(bodiesDir, ent);
    if (patchFile(fp)) files++;
  }
}
console.log(`sync-index-venue-count: updated ${files} file(s) to ${n} venues.`);
