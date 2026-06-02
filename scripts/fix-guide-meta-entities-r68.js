#!/usr/bin/env node
/**
 * fix-guide-meta-entities-r68.js — Run normalize-guide-head-meta on all guide HTML.
 * Also invoked automatically at the end of inject-guide-schema.js.
 */

const fs = require('fs');
const path = require('path');
const { normalizeGuideHeadMeta } = require('./lib/normalize-guide-head-meta');

const ROOT = path.resolve(__dirname, '..');
let fixed = 0;
const guidesDir = path.join(ROOT, 'guides');
for (const ent of fs.readdirSync(guidesDir, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  const fp = path.join(guidesDir, ent.name, 'index.html');
  if (!fs.existsSync(fp)) continue;
  const orig = fs.readFileSync(fp, 'utf8');
  const next = normalizeGuideHeadMeta(orig);
  if (next !== orig) {
    fs.writeFileSync(fp, next, 'utf8');
    fixed++;
  }
}
console.log(`normalize-guide-head-meta: ${fixed} guide(s) updated.`);
