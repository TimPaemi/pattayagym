#!/usr/bin/env node
/**
 * sync-guides-hub.js
 * Rebuilds /guides/ hub cards from disk + featured editorial picks.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HUB = path.join(ROOT, 'guides', 'index.html');
const SITE = 'https://pattaya-gym.com';

const FEATURED = [
  { slug: 'muay-thai-training-holiday-pattaya', title: 'Muay Thai training holiday', desc: '1–4 week stay-and-train plans, budgets, daily schedule', tag: 'High intent' },
  { slug: 'english-speaking-muay-thai-pattaya', title: 'English-speaking Muay Thai', desc: '10 camps where foreigners train without Thai', tag: 'Editorial' },
  { slug: 'muay-thai-camps-with-accommodation-pattaya', title: 'Camps with accommodation', desc: 'Stay-and-train packages on-site', tag: 'Editorial' },
  { slug: 'gym-day-pass-pattaya', title: 'Gym day pass Pattaya', desc: 'Drop-in gyms — no membership', tag: 'Editorial' },
  { slug: 'cheapest-gyms-pattaya', title: 'Cheapest gyms + price table', desc: 'Budget fitness with comparison table', tag: 'Ranked' },
  { slug: 'best-muay-thai-pattaya', title: 'Best Muay Thai Pattaya', desc: 'Top ranked camps by tier', tag: 'Ranked' },
];

const SLUG_TITLES = {
  '24-hour-gyms-pattaya': '24-hour gyms',
  'bangkok-day-trip-sport-pattaya': 'Bangkok day-trip sport',
  'best-dive-operators-pattaya': 'Best dive operators',
  'best-for-beginners-pattaya': 'Best for beginners',
  'best-golf-courses-pattaya': 'Best golf courses',
  'best-gyms-near-walking-street-pattaya': 'Near Walking Street',
  'best-muay-thai-pattaya': 'Best Muay Thai',
  'cheapest-gyms-pattaya': 'Cheapest gyms',
  'family-friendly-pattaya': 'Family-friendly',
  'female-friendly-gyms-pattaya': 'Female-friendly',
  'luxury-sports-clubs-pattaya': 'Luxury sports clubs',
  'pattaya-digital-nomad-fitness': 'Digital nomad fitness',
  'pattaya-gyms-childcare-family-pools': 'Childcare & family pools',
  'pattaya-russian-speaking-sport': 'Russian-speaking sport',
  'pattaya-seniors-low-impact-sport': 'Seniors low-impact',
  'pattaya-solo-female-fitness': 'Solo female fitness',
  'thai-gym-terms-pattaya': 'Thai gym terms',
  'english-speaking-muay-thai-pattaya': 'English-speaking MT',
  'muay-thai-camps-with-accommodation-pattaya': 'Stay-and-train',
  'gym-day-pass-pattaya': 'Day pass',
  'muay-thai-training-holiday-pattaya': 'Training holiday',
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const guidesDir = path.join(ROOT, 'guides');
const slugs = fs.readdirSync(guidesDir, { withFileTypes: true })
  .filter(e => e.isDirectory() && fs.existsSync(path.join(guidesDir, e.name, 'index.html')))
  .map(e => e.name)
  .sort();

let html = fs.readFileSync(HUB, 'utf8');
html = html.replace(/\/\/ Guides hub · \d+ guides/g, `// Guides hub · ${slugs.length} guides`);

const tldrLine = '<li><strong>Training holiday 1–4 weeks?</strong> → <a href="/guides/muay-thai-training-holiday-pattaya/">Muay Thai training holiday</a></li>';
if (!html.includes('muay-thai-training-holiday-pattaya')) {
  html = html.replace('</ul>\n  </section>\n\n  <h2 class="guide-rank-section">All guides</h2>', `${tldrLine}\n    </ul>\n  </section>\n\n  <h2 class="guide-rank-section">All guides</h2>`);
}

const holidayCard = `<a href="/guides/muay-thai-training-holiday-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Muay Thai training holiday in Pattaya</h3><span class="cv-pill">High intent</span></div>
      <p>Plan a 1–4 week stay-and-train trip: camps, budgets, daily schedule, visa notes — compare vs Phuket.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    `;
if (!html.includes('muay-thai-training-holiday-pattaya')) {
  html = html.replace('<div class="cat-venue-grid guide-hub-grid">\n    <a href="/guides/english-speaking', `<div class="cat-venue-grid guide-hub-grid">\n    ${holidayCard}<a href="/guides/english-speaking`);
}

const itemList = slugs.map((slug, i) => ({
  '@type': 'ListItem',
  position: i + 1,
  name: SLUG_TITLES[slug] || slug,
  url: `${SITE}/guides/${slug}/`,
}));

const collectionExtra = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Pattaya gym guides',
  numberOfItems: slugs.length,
  itemListElement: itemList,
};

if (!html.includes('"@type":"ItemList"') && !html.includes('"@type": "ItemList"')) {
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(collectionExtra)}</script>\n</head>`);
}

fs.writeFileSync(HUB, html, 'utf8');
console.log(`Guides hub synced: ${slugs.length} guides.`);
