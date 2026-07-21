#!/usr/bin/env node
/**
 * inject-venue-faq-r47.js — FAQ blocks + FAQPage schema on venue pages.
 * Round 47: top 25 venues. Round 48+: all 158 venues.
 * Run after build-v2.js + inject-internal-linking-r41.js. Idempotent: venue-faq-r47
 */

const fs = require('fs');
const path = require('path');
const { GYMS } = require('../data.js');
const { faqsForVenue, faqHtml, faqJsonLd } = require('./lib/venue-faq-templates');

const ROOT = path.resolve(__dirname, '..');

const MARKER = 'venue-faq-r47';

function sectionBlock(faqs) {
  return `
<section class="section u-pt-0 venue-faq guide-faq" id="${MARKER}" aria-labelledby="${MARKER}-h">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> FAQ</div>
    <h2 id="${MARKER}-h" class="h-section">Common <span class="accent-cyan">questions.</span></h2>
    ${faqHtml(faqs)}
  </div>
</section>`;
}

function norm(s) {
  return s.replace(/\r\n/g, '\n');
}

function injectAtAnchor(html, block, ldScript) {
  const htmlNorm = norm(html);
  const anchors = [
    '<section class="section u-pt-0 venue-guide-links" id="venue-guides-r41">',
    '<section class="section u-pt-0">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">★</span> Social</div>',
    '<section class="section">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">★</span> Contact channels</div>',
    '<section class="section">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">★</span> Same sport</div>',
  ];
  for (const a of anchors) {
    const idx = htmlNorm.indexOf(norm(a));
    if (idx >= 0) {
      let out = html.slice(0, idx) + block + '\n' + html.slice(idx);
      if (!out.includes('"@type":"FAQPage"')) {
        out = out.replace('</head>', `${ldScript}\n</head>`);
      }
      return out;
    }
  }
  const mainEnd = html.lastIndexOf('</main>');
  if (mainEnd > 0) {
    let out = html.slice(0, mainEnd) + block + '\n' + html.slice(mainEnd);
    if (!out.includes('"@type":"FAQPage"')) {
      out = out.replace('</head>', `${ldScript}\n</head>`);
    }
    return out;
  }
  return null;
}

function inject(html, g, faqs) {
  const block = sectionBlock(faqs).trim();
  const ldScript = `<script type="application/ld+json">${JSON.stringify(faqJsonLd(g, faqs))}</script>`;

  if (html.includes(MARKER)) {
    html = html.replace(
      new RegExp(`<section class="section u-pt-0 venue-faq guide-faq" id="${MARKER}"[\\s\\S]*?</section>`, 'm'),
      block
    );
    html = html.replace(
      /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[\s\S]*?<\/script>\s*/g,
      ldScript + '\n'
    );
    if (!html.includes('"@type":"FAQPage"')) {
      html = html.replace('</head>', `${ldScript}\n</head>`);
    }
    return html;
  }

  return injectAtAnchor(html, block, ldScript);
}

let n = 0;
let skipped = 0;

for (const g of GYMS) {
  const fp = path.join(ROOT, 'gyms', g.id, 'index.html');
  if (!fs.existsSync(fp)) {
    skipped++;
    continue;
  }
  const faqs = faqsForVenue(g);
  if (faqs.length < 2) {
    skipped++;
    continue;
  }
  let html = fs.readFileSync(fp, 'utf8');
  const next = inject(html, g, faqs);
  if (next) {
    fs.writeFileSync(fp, next, 'utf8');
    n++;
  }
}

console.log(`Venue FAQ: ${n} venues (${skipped} skipped).`);
