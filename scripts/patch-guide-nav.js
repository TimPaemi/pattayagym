#!/usr/bin/env node
/**
 * patch-guide-nav.js — Replace guide page header with canonical v2-nav (idempotent).
 * Run: node scripts/patch-guide-nav.js
 */
const fs = require('fs');
const path = require('path');
const { v2NavHtml } = require('./lib/v2-nav.js');

const ROOT = path.resolve(__dirname, '..');
const NAV_BLOCK = /<header class="nav"[\s\S]*?<nav class="nav-mobile" id="nav-mobile"[\s\S]*?<\/nav>/;

function patchFile(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (!NAV_BLOCK.test(html)) return false;
  const next = html.replace(NAV_BLOCK, v2NavHtml().trim());
  if (next === html) return false;
  fs.writeFileSync(file, next, 'utf8');
  return true;
}

let n = 0;
const hub = path.join(ROOT, 'guides', 'index.html');
if (fs.existsSync(hub) && patchFile(hub)) {
  console.log('  patched guides/index.html');
  n++;
}
const guidesDir = path.join(ROOT, 'guides');
fs.readdirSync(guidesDir, { withFileTypes: true }).forEach((ent) => {
  if (!ent.isDirectory()) return;
  const f = path.join(guidesDir, ent.name, 'index.html');
  if (!fs.existsSync(f)) return;
  if (patchFile(f)) {
    console.log('  patched guides/' + ent.name + '/index.html');
    n++;
  }
});
console.log('patch-guide-nav: ' + n + ' file(s) updated');
