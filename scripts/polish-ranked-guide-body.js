#!/usr/bin/env node
/**
 * polish-ranked-guide-body.js
 * Cleans ranked guide HTML: section classes, TL;DR footnote, related/FAQ/CTA classes.
 * Idempotent. Run after migrate-legacy-guides-chrome.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EDITORIAL = new Set([
  'english-speaking-muay-thai-pattaya',
  'muay-thai-camps-with-accommodation-pattaya',
  'gym-day-pass-pattaya',
  'muay-thai-training-holiday-pattaya',
  'muay-thai-pattaya-beginners',
  'best-gym-jomtien-pattaya',
  'pattaya-vs-phuket-muay-thai-training',
  'train-muay-thai-pattaya-1-week-1-month',
  'best-gym-naklua-pratamnak-pattaya',
  'padel-pickleball-pattaya',
  'training-thailand-visa-pattaya',
  'thai-gym-terms-pattaya',
  'is-muay-thai-safe-pattaya',
  'best-gym-central-pattaya',
  'yoga-retreat-pattaya',
  'best-gym-east-pattaya',
  'best-gym-sattahip-pattaya',
  'bjj-mma-pattaya',
  'crossfit-pattaya',
  'swimming-pools-pattaya',
  'tennis-badminton-pattaya',
]);

function polish(html, isHub) {
  let out = html;
  const orig = out;

  out = out.replace(/<h2>([^<]+)<\/h2>\s*<div class="cat-venue-grid">/g, '<h2 class="guide-rank-section">$1</h2>\n    <div class="cat-venue-grid">');

  out = out.replace(
    /<p style="margin: 12px 0 0; font-size: 13px; color: var\(--text-muted\);">([\s\S]*?)<\/p>/g,
    '<p class="tldr-footnote">$1</p>'
  );

  out = out.replace(
    /<ol class="tldr-list" style="list-style: decimal inside;">/g,
    '<ol class="tldr-list">'
  );

  out = out.replace(/\s*style="color:\s*var\(--accent\);"/g, '');
  out = out.replace(/\s*style="color:\s*var\(--accent\)\s*;"/g, '');

  out = out.replace(
    /<section class="about" aria-labelledby="faq-h"[^>]*>/g,
    '<section class="guide-faq" aria-labelledby="faq-h">'
  );

  out = out.replace(
    /<section class="about" aria-labelledby="related-guides-h"[^>]*>/g,
    '<section class="guide-related" aria-labelledby="related-guides-h">'
  );

  out = out.replace(
    /<div class="venue-cta-foot"[^>]*>/g,
    '<div class="guide-compare-cta">'
  );

  if (isHub) {
    out = out.replace(
      /<h2 style="margin: 36px 0 18px[^"]*">All guides<\/h2>\s*<div class="cat-venue-grid">/,
      '<h2 class="guide-rank-section">All guides</h2>\n  <div class="cat-venue-grid guide-hub-grid">'
    );
  }

  const guideCount = fs.readdirSync(path.join(ROOT, 'guides'), { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(ROOT, 'guides', e.name, 'index.html')))
    .length;
  out = out.replace(/Browse all \d+ Pattaya guides/g, `Browse all ${guideCount} Pattaya guides`);

  return out === orig ? null : out;
}

function polishFile(fp, isHub) {
  const html = fs.readFileSync(fp, 'utf8');
  const mainStart = html.indexOf('<main id="main">');
  const mainEnd = html.indexOf('</main>', mainStart);
  if (mainStart < 0) return false;

  const before = html.slice(0, mainStart + '<main id="main">'.length);
  const inner = html.slice(mainStart + '<main id="main">'.length, mainEnd);
  const after = html.slice(mainEnd);

  const polished = polish(inner, isHub);
  if (!polished) return false;

  fs.writeFileSync(fp, before + polished + after, 'utf8');
  return true;
}

let n = 0;
const guidesDir = path.join(ROOT, 'guides');
const hub = path.join(guidesDir, 'index.html');
if (polishFile(hub, true)) {
  n++;
  console.log('  /guides/ hub polished');
}

for (const ent of fs.readdirSync(guidesDir, { withFileTypes: true })) {
  if (!ent.isDirectory() || EDITORIAL.has(ent.name)) continue;
  const fp = path.join(guidesDir, ent.name, 'index.html');
  if (fs.existsSync(fp) && polishFile(fp, false)) {
    n++;
    console.log(`  /guides/${ent.name}/ polished`);
  }
}

console.log(`\nPolished ${n} guide bodies.`);
