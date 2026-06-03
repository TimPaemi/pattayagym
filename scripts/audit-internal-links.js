#!/usr/bin/env node
/**
 * audit-internal-links.js — Internal link graph: orphans, thin inbound, broken paths.
 */

const fs = require('fs');
const path = require('path');
const { GYMS } = require('../data.js');

const ROOT = path.resolve(__dirname, '..');
const SKIP_PREFIX = ['http:', 'https:', 'mailto:', 'tel:', 'javascript:'];

function walkHtmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      walkHtmlFiles(fp, out);
    } else if (ent.name.endsWith('.html')) out.push(fp);
  }
  return out;
}

function normalizeHref(href) {
  let h = href.trim();
  if (!h || h.startsWith('#')) return null;
  if (SKIP_PREFIX.some((p) => h.startsWith(p))) return null;
  if (h.startsWith('//')) h = 'https:' + h;
  if (h.startsWith('http://') || h.startsWith('https://')) {
    try {
      const u = new URL(h);
      if (u.hostname !== 'pattaya-gym.com' && u.hostname !== 'www.pattaya-gym.com') return null;
      h = u.pathname + u.search;
    } catch {
      return null;
    }
  }
  if (!h.startsWith('/')) h = '/' + h;
  if (h.endsWith('/index.html')) h = h.slice(0, -10) + (h.endsWith('/') ? '' : '/');
  if (!h.endsWith('/') && !path.extname(h)) h += '/';
  return h;
}

function extractLinks(html) {
  const links = [];
  const re = /<a\s[^>]*href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) links.push(m[1]);
  return links;
}

const pages = walkHtmlFiles(ROOT).filter((f) => !f.includes('node_modules'));
const inbound = new Map();
const outbound = new Map();
const broken = [];

for (const fp of pages) {
  const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
  let url = '/' + rel;
  if (url.endsWith('/index.html')) url = url.slice(0, -10) || '/';
  if (!url.endsWith('/')) url += '/';

  const html = fs.readFileSync(fp, 'utf8');
  const hrefs = extractLinks(html).map(normalizeHref).filter(Boolean);
  outbound.set(url, hrefs);
  for (const h of hrefs) {
    inbound.set(h, (inbound.get(h) || 0) + 1);
  }
}

const venueUrls = new Set(GYMS.map((g) => `/gyms/${g.id}/`));
const keyHubs = ['/guides/', '/compare/', '/plan-my-trip/', '/map/', '/search/', '/sports/'];

console.log('=== Internal link audit ===\n');
console.log(`Pages scanned: ${pages.length}`);
console.log(`Unique internal targets: ${inbound.size}`);

const orphans = [...venueUrls].filter((u) => (inbound.get(u) || 0) < 2);
orphans.sort((a, b) => (inbound.get(a) || 0) - (inbound.get(b) || 0));
console.log(`\nVenues with <2 inbound internal links: ${orphans.length}`);
if (orphans.length) {
  console.log('  Sample (lowest inbound):');
  orphans.slice(0, 12).forEach((u) => console.log(`    ${inbound.get(u) || 0}  ${u}`));
}

const thinHubs = keyHubs.filter((h) => (inbound.get(h) || 0) < 20);
if (thinHubs.length) {
  console.log('\nThin hub inbound (<20):');
  thinHubs.forEach((h) => console.log(`    ${inbound.get(h) || 0}  ${h}`));
}

const markers = ['venue-taxonomy-r84', 'venue-nearby-r84', 'venue-tools-r84', 'venue-guides-r41', 'sister-context-r84', 'pa-network-grid'];
console.log('\nMarker coverage (sample pages):');
for (const mk of markers) {
  let n = 0;
  for (const fp of pages) {
    if (fs.readFileSync(fp, 'utf8').includes(mk)) n++;
  }
  console.log(`  ${mk}: ${n} pages`);
}

let missingGrid = 0;
let hasPersonalTrainer = 0;
for (const fp of pages) {
  const html = fs.readFileSync(fp, 'utf8');
  if (!html.includes('pa-network')) continue;
  if (!html.includes('pa-network-grid')) missingGrid++;
  if (html.includes('Personal Trainer')) hasPersonalTrainer++;
}
console.log(`\npa-network sections: missing grid=${missingGrid}, with Personal Trainer=${hasPersonalTrainer}`);

// File existence for internal hrefs from gyms only
for (const fp of pages.filter((f) => f.includes(`${path.sep}gyms${path.sep}`))) {
  const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
  let from = '/' + rel;
  if (from.endsWith('/index.html')) from = from.slice(0, -10) || '/';
  for (const h of outbound.get(from) || []) {
    if (!h.startsWith('/')) continue;
    const disk = path.join(ROOT, h.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
    const diskFlat = path.join(ROOT, h.replace(/^\//, ''));
    if (!fs.existsSync(disk) && !fs.existsSync(diskFlat) && !h.includes('?')) {
      broken.push({ from, to: h });
    }
  }
}

if (broken.length) {
  const uniq = [...new Map(broken.map((b) => [`${b.from}|${b.to}`, b])).values()];
  console.log(`\nBroken internal links from venue pages: ${uniq.length}`);
  uniq.slice(0, 15).forEach((b) => console.log(`    ${b.from} → ${b.to}`));
} else {
  console.log('\nBroken internal links from venue pages: 0');
}

console.log('\nDone.');
