#!/usr/bin/env node
/**
 * patch-guide-map-cta-r70.js — Ranked guide CTAs: map stub → live search (map is noindex).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OLD = '<a class="btn btn-secondary" href="/map/">View on map</a>';
const NEW = '<a class="btn btn-secondary" href="/search/">Search venues</a>';

let n = 0;
const guidesDir = path.join(ROOT, 'guides');
for (const ent of fs.readdirSync(guidesDir, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  const fp = path.join(guidesDir, ent.name, 'index.html');
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  if (!html.includes(OLD)) continue;
  html = html.split(OLD).join(NEW);
  fs.writeFileSync(fp, html, 'utf8');
  n++;
  console.log(`  ${ent.name}`);
}
console.log(`patch-guide-map-cta-r70: ${n} guide(s).`);
