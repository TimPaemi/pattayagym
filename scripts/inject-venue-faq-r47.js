#!/usr/bin/env node
/**
 * inject-venue-faq-r47.js — FAQ blocks + FAQPage schema on top venue pages.
 * Run after build-v2.js + inject-internal-linking-r41.js. Idempotent: venue-faq-r47
 */

const fs = require('fs');
const path = require('path');
const { GYMS } = require('../data.js');
const { faqsForVenue, faqHtml, faqJsonLd } = require('./lib/venue-faq-templates');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'venue-faq-r47';
const SITE = 'https://pattaya-gym.com';

/** Featured + high-traffic guide anchors */
const TOP_VENUE_IDS = new Set([
  'fairtex-pattaya', 'venum-training-camp', 'fitz-club', 'anytime-fitness-pattaya',
  'mermaids-dive', 'ramayana-water-park',
  'kombat-group-thailand', 'wko-muay-thai', 'battle-conquer-gym', 'sityodtong-pattaya',
  'jetts-fitness-pattaya', 'muscle-factory', 'alfa-bjj-pattaya', 'rage-fight-academy',
  'crossfit-pattaya', 'hilton-pattaya-fitness', 'andaz-pattaya-jomtien',
  'ocean-marina-jomtien', 'phoenix-gold-golf', 'siam-country-club',
  'real-divers-pattaya', 'play-padel-pattaya', 'sor-klinmee', 'tonys-gym', 'platinum-fitness',
]);

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

function inject(html, g, faqs) {
  const url = `${SITE}/gyms/${g.id}/`;
  const block = sectionBlock(faqs).trim();
  const ld = faqJsonLd(g, faqs, url);
  const ldScript = `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;

  if (html.includes(MARKER)) {
    html = html.replace(
      new RegExp(`<section class="section u-pt-0 venue-faq guide-faq" id="${MARKER}"[\\s\\S]*?</section>`, 'm'),
      block
    );
    html = html.replace(
      /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[\s\S]*?<\/script>/,
      ldScript
    );
    if (!html.includes('"@type":"FAQPage"')) {
      html = html.replace('</head>', `${ldScript}\n</head>`);
    }
    return html;
  }

  const anchors = [
    '<section class="section u-pt-0 venue-guide-links" id="venue-guides-r41">',
    '<section class="section">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">★</span> Contact channels</div>',
    '<section class="section">\r\n  <div class="wrap">\r\n    <div class="eyebrow"><span class="num">★</span> Contact channels</div>',
    '<section class="section">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">★</span> Same sport</div>',
  ];
  for (const a of anchors) {
    if (html.includes(a)) {
      html = html.replace(a, block + '\n' + a);
      html = html.replace('</head>', `${ldScript}\n</head>`);
      return html;
    }
  }
  const mainEnd = html.lastIndexOf('</main>');
  if (mainEnd > 0) {
    html = html.slice(0, mainEnd) + block + '\n' + html.slice(mainEnd);
    html = html.replace('</head>', `${ldScript}\n</head>`);
    return html;
  }
  return null;
}

const gymById = Object.fromEntries(GYMS.map(g => [g.id, g]));
let n = 0;

for (const id of TOP_VENUE_IDS) {
  const g = gymById[id];
  if (!g) {
    console.warn(`  [skip] unknown venue id: ${id}`);
    continue;
  }
  const fp = path.join(ROOT, 'gyms', id, 'index.html');
  if (!fs.existsSync(fp)) continue;
  const faqs = faqsForVenue(g);
  if (faqs.length < 2) continue;
  let html = fs.readFileSync(fp, 'utf8');
  const next = inject(html, g, faqs);
  if (next) {
    fs.writeFileSync(fp, next, 'utf8');
    n++;
    console.log(`  /gyms/${id}/ FAQ added`);
  }
}

console.log(`Venue FAQ (R47): ${n} top venues.`);
