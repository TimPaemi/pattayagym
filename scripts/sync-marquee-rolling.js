#!/usr/bin/env node
/**
 * sync-marquee-rolling.js — Replace misleading UPDATED WEEKLY marquees site-wide.
 * Run: node scripts/sync-marquee-rolling.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let n = 0;

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      walk(fp);
    } else if (ent.name.endsWith('.html')) {
      let html = fs.readFileSync(fp, 'utf8');
      const orig = html;
      html = html.replace(/UPDATED WEEKLY/g, 'UPDATED ROLLING');
      html = html.replace(/100% HAND-CHECKED/g, 'HAND-CHECKED');
      if (html !== orig) {
        fs.writeFileSync(fp, html, 'utf8');
        n++;
      }
    }
  }
}

walk(ROOT);
console.log(`sync-marquee-rolling: updated ${n} HTML files.`);
