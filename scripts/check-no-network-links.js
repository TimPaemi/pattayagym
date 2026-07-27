#!/usr/bin/env node
'use strict';
/* NETWORK-SAFETY-RULES §3 / §7 gate.
   Owned site: zero sister-site references in anything that ships. The only
   permitted cross-domain link is the followed timpaemi.com author credit.
   Replaces the retired check:network-footer / check:network-intents gates,
   which asserted the opposite. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['.backups', 'node_modules', 'dist', '.git', '.wrangler', '.cursor', '.github', 'scripts', 'tmp', 'research', 'docs']);
const EXT = /\.(html?|css|js|mjs|json|txt|xml|webmanifest)$/i;
const SKIP_FILES = new Set(['package-lock.json', 'package.json']);
const SKIP_PATTERNS = [/^lh-.*\.json$/i]; // local Lighthouse dumps, never shipped

const SISTER = [
  'pattaya-school-guide.com',
  'pattaya-authority.com', 'pattaya-restaurant-guide.com', 'pattayavisahelp.com',
  'pattaya-afterdark.com', 'pattaya-coffee.com', 'pattayastream.com',
  'pattaya-medical.com', 'pattayapets.com', 'pattaya-vehicle-rentals.com',
  'pattaya-insider.com', 'timpaemi.live', 'pattaya-golf.com', 'retire-in-pattaya.com',
  'movetopattaya.com', 'pattayatools.pages.dev', 'koh-larn-thailand.com',
  'mrweoutside.com', 'pattayaolympian.com', 'pattayapersonaltrainer.com',
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (EXT.test(e.name) && !SKIP_FILES.has(e.name) && !SKIP_PATTERNS.some((re) => re.test(e.name))) out.push(f);
  }
  return out;
}

const errors = [];
let timpaemiLinks = 0;
let pagesChecked = 0;

for (const file of walk(root)) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const s = fs.readFileSync(file, 'utf8');

  for (const d of SISTER) {
    const escaped = d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`href=["'][^"']*${escaped}`, 'i').test(s)) {
      errors.push(`${rel}: links to sister site ${d}`);
    }
  }
  if (/class="(network-intents|pa-net)"|<!--PA-NET:START-->/.test(s)) {
    errors.push(`${rel}: retired network module still present`);
  }

  if (/\.html?$/i.test(rel) && rel !== 'offline.html') {
    pagesChecked++;
    const links = (s.match(/href="https:\/\/timpaemi\.com\/?"/g) || []).length;
    if (links < 1) errors.push(`${rel}: expected a timpaemi.com publisher link, found none`);
    timpaemiLinks += links;
    if (/href="https:\/\/timpaemi\.com[^"]*"[^>]*rel="[^"]*nofollow/.test(s)) {
      errors.push(`${rel}: the timpaemi.com author credit must be followed, not nofollow`);
    }
  }
}

if (errors.length) {
  console.error('check:no-network-links FAILED');
  for (const e of errors.slice(0, 40)) console.error('  ' + e);
  if (errors.length > 40) console.error(`  …and ${errors.length - 40} more`);
  process.exit(1);
}
console.log(`check:no-network-links OK — ${pagesChecked} pages, ${timpaemiLinks} followed timpaemi.com credits, 0 sister-site links`);
