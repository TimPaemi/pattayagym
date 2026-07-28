#!/usr/bin/env node
/**
 * inject-venue-faq-r47.js — FAQ blocks + FAQPage schema on venue pages.
 * Run after build-v2.js + inject-internal-linking-r41.js. Idempotent: venue-faq-r47
 *
 * SCOPE: pattaya-gym.com only.
 *
 * WHY NON-OPERATING VENUES ARE NOW EXCLUDED (2026-07-28)
 * -----------------------------------------------------
 * The FAQ answers are templated by design: 645 pairs across 215 pages resolve to
 * 54 distinct questions and 204 distinct answers, and one answer appeared verbatim
 * on 44 pages. That is acceptable on a venue we can describe. It is actively wrong
 * on one we cannot.
 *
 * Measured case: gyms/pattaya-public-pool-jomtien states in its body that the venue
 * could not be confirmed to exist, then answered "Is Jomtien Public Swimming Pool
 * good for families?" with "Pool and water venues suit mixed-age groups." That is
 * confident advice about a venue the same page has just disclaimed - the exact
 * pattern a quality rater reads as unreliable, and the exact text an AI answer
 * would lift.
 *
 * So: if a record is closed, likely-closed, unverified or out-of-area, it gets no
 * FAQ block and no FAQPage schema. Those pages are short on purpose. Padding them
 * with generic reassurance makes them worse, not longer.
 *
 * Note also that FAQ rich results were dropped by Google on 2026-05-07, so the
 * FAQPage markup here earns no search feature at all now. It is retained only
 * because the visible Q&A still feeds ordinary snippets and AI retrieval - which
 * is precisely why the answers must be true.
 */

/* Statuses that mean "we cannot describe this venue with confidence". */
const NO_FAQ_STATUS = new Set(['closed', 'likely-closed', 'unverified', 'out-of-area']);

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
let stripped = 0;

for (const g of GYMS) {
  const fp = path.join(ROOT, 'gyms', g.id, 'index.html');
  if (!fs.existsSync(fp)) {
    skipped++;
    continue;
  }
  if (NO_FAQ_STATUS.has(g.status)) {
    // Strip any FAQ a previous run left behind, then move on.
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    html = html.replace(
      new RegExp(`<section class="section u-pt-0 venue-faq guide-faq" id="${MARKER}"[\\s\\S]*?</section>\\s*`, 'm'),
      ''
    );
    html = html.replace(
      /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[\s\S]*?<\/script>\s*/g,
      ''
    );
    if (html !== before) { fs.writeFileSync(fp, html, 'utf8'); stripped++; }
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

console.log(`Venue FAQ: ${n} venues (${skipped} skipped, ${stripped} FAQ block(s) removed from non-operating records).`);
