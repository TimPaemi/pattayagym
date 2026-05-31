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
  'muay-thai-pattaya-beginners': 'Muay Thai beginners',
  'best-gym-jomtien-pattaya': 'Best gym Jomtien',
  'pattaya-vs-phuket-muay-thai-training': 'Pattaya vs Phuket MT',
  'train-muay-thai-pattaya-1-week-1-month': '1 week vs 1 month',
  'best-gym-naklua-pratamnak-pattaya': 'Naklua & Pratamnak',
  'padel-pickleball-pattaya': 'Padel & pickleball',
  'training-thailand-visa-pattaya': 'Training & visa',
  'is-muay-thai-safe-pattaya': 'Is Muay Thai safe?',
  'best-gym-central-pattaya': 'Best gym Central',
  'yoga-retreat-pattaya': 'Yoga retreat',
  'best-gym-east-pattaya': 'Best gym East Pattaya',
  'best-gym-sattahip-pattaya': 'Na Jomtien & Sattahip',
  'bjj-mma-pattaya': 'BJJ & MMA',
  'crossfit-pattaya': 'CrossFit Pattaya',
  'swimming-pools-pattaya': 'Swimming & pools',
  'tennis-badminton-pattaya': 'Tennis & badminton',
  'climbing-pattaya': 'Climbing Pattaya',
  'adventure-pattaya': 'Adventure Pattaya',
  'kids-youth-sport-pattaya': 'Kids & youth sport',
};

const TLDR_ADD = [
  { slug: 'kids-youth-sport-pattaya', html: '<li><strong>Sport for kids?</strong> → <a href="/guides/kids-youth-sport-pattaya/">Kids &amp; youth sport in Pattaya</a></li>' },
  { slug: 'adventure-pattaya', html: '<li><strong>Zipline or skydive?</strong> → <a href="/guides/adventure-pattaya/">Adventure in Pattaya</a></li>' },
  { slug: 'climbing-pattaya', html: '<li><strong>Indoor climbing?</strong> → <a href="/guides/climbing-pattaya/">Climbing in Pattaya</a></li>' },
  { slug: 'tennis-badminton-pattaya', html: '<li><strong>Tennis or badminton?</strong> → <a href="/guides/tennis-badminton-pattaya/">Tennis &amp; badminton in Pattaya</a></li>' },
  { slug: 'swimming-pools-pattaya', html: '<li><strong>Pool day or lap swim?</strong> → <a href="/guides/swimming-pools-pattaya/">Swimming &amp; pools in Pattaya</a></li>' },
  { slug: 'crossfit-pattaya', html: '<li><strong>CrossFit WODs?</strong> → <a href="/guides/crossfit-pattaya/">CrossFit in Pattaya</a></li>' },
  { slug: 'bjj-mma-pattaya', html: '<li><strong>BJJ or MMA?</strong> → <a href="/guides/bjj-mma-pattaya/">BJJ &amp; MMA in Pattaya</a></li>' },
  { slug: 'best-gym-sattahip-pattaya', html: '<li><strong>Staying south / U-Tapao?</strong> → <a href="/guides/best-gym-sattahip-pattaya/">Na Jomtien &amp; Sattahip gyms</a></li>' },
  { slug: 'best-gym-east-pattaya', html: '<li><strong>Training on the Darkside?</strong> → <a href="/guides/best-gym-east-pattaya/">Best gym in East Pattaya</a></li>' },
  { slug: 'is-muay-thai-safe-pattaya', html: '<li><strong>Worried about safety?</strong> → <a href="/guides/is-muay-thai-safe-pattaya/">Is Muay Thai safe in Pattaya?</a></li>' },
  { slug: 'best-gym-central-pattaya', html: '<li><strong>Staying central / Beach Road?</strong> → <a href="/guides/best-gym-central-pattaya/">Best gym in Central Pattaya</a></li>' },
  { slug: 'yoga-retreat-pattaya', html: '<li><strong>Yoga retreat week?</strong> → <a href="/guides/yoga-retreat-pattaya/">Yoga retreat in Pattaya</a></li>' },
  { slug: 'padel-pickleball-pattaya', html: '<li><strong>Padel or pickleball?</strong> → <a href="/guides/padel-pickleball-pattaya/">Padel &amp; pickleball in Pattaya</a></li>' },
  { slug: 'training-thailand-visa-pattaya', html: '<li><strong>Long-stay training visa?</strong> → <a href="/guides/training-thailand-visa-pattaya/">Train in Thailand — visa guide</a></li>' },
  { slug: 'best-gym-naklua-pratamnak-pattaya', html: '<li><strong>Staying Naklua or Pratamnak?</strong> → <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Best gym Naklua &amp; Pratamnak</a></li>' },
  { slug: 'train-muay-thai-pattaya-1-week-1-month', html: '<li><strong>1 week or 1 month?</strong> → <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">Train Muay Thai — trip length guide</a></li>' },
  { slug: 'muay-thai-pattaya-beginners', html: '<li><strong>Never trained MT before?</strong> → <a href="/guides/muay-thai-pattaya-beginners/">Muay Thai for beginners</a></li>' },
  { slug: 'best-gym-jomtien-pattaya', html: '<li><strong>Staying in Jomtien?</strong> → <a href="/guides/best-gym-jomtien-pattaya/">Best gym in Jomtien</a></li>' },
  { slug: 'pattaya-vs-phuket-muay-thai-training', html: '<li><strong>Pattaya or Phuket?</strong> → <a href="/guides/pattaya-vs-phuket-muay-thai-training/">Pattaya vs Phuket training</a></li>' },
];

const CARD_ADD = [
  { slug: 'kids-youth-sport-pattaya', card: `<a href="/guides/kids-youth-sport-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Kids &amp; youth sport in Pattaya</h3><span class="cv-pill">Kids</span></div>
      <p>AF Academy football from age 3, BOUNCE trampoline, Harbor Mall stack, Rusich, FAST PRO.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'adventure-pattaya', card: `<a href="/guides/adventure-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Adventure in Pattaya</h3><span class="cv-pill">Adventure</span></div>
      <p>Skydive, Tarzan zipline, karting, ATV, tower jump, shooting — all 12 operators mapped.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'climbing-pattaya', card: `<a href="/guides/climbing-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Climbing in Pattaya</h3><span class="cv-pill">Climbing</span></div>
      <p>Deep at Harbor Mall vs Bean Cow Huay Yai — real walls, hotel walls, family picks.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'tennis-badminton-pattaya', card: `<a href="/guides/tennis-badminton-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Tennis &amp; badminton in Pattaya</h3><span class="cv-pill">Racquet</span></div>
      <p>Fitz Club, Pattaya Tennis Club, Greta covered courts, Euro Badminton — booking map.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'swimming-pools-pattaya', card: `<a href="/guides/swimming-pools-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Swimming &amp; pools in Pattaya</h3><span class="cv-pill">Swim</span></div>
      <p>Hotel day-pass pools, water parks, beach laps, swim schools — all swim types mapped.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'crossfit-pattaya', card: `<a href="/guides/crossfit-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>CrossFit in Pattaya</h3><span class="cv-pill">CrossFit</span></div>
      <p>Jungle Gym affiliate on the Darkside — plus chain-gym and combat S&amp;C alternatives.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'bjj-mma-pattaya', card: `<a href="/guides/bjj-mma-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>BJJ &amp; MMA in Pattaya</h3><span class="cv-pill">Combat</span></div>
      <p>ALFA BJJ, Venum, Rage, Kombat Group, Rambaa M16 — Gi, No-Gi, cage gyms.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'best-gym-sattahip-pattaya', card: `<a href="/guides/best-gym-sattahip-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Na Jomtien &amp; Sattahip south</h3><span class="cv-pill">Area</span></div>
      <p>Ocean Marina, Ramayana, Andaz, U-Tapao corridor — resort &amp; marina sport.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'best-gym-east-pattaya', card: `<a href="/guides/best-gym-east-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Best gym in East Pattaya (Darkside)</h3><span class="cv-pill">Area</span></div>
      <p>Kombat Group, Sor Klinmee, Sanit Mabprachan, Jungle Gym CrossFit.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'is-muay-thai-safe-pattaya', card: `<a href="/guides/is-muay-thai-safe-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Is Muay Thai safe in Pattaya?</h3><span class="cv-pill">Safety</span></div>
      <p>Injuries, red flags, women training alone, medical backup — honest answers.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'best-gym-central-pattaya', card: `<a href="/guides/best-gym-central-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Best gym in Central Pattaya</h3><span class="cv-pill">Area</span></div>
      <p>WKO, Battle Conquer, Tony's, Fitness 7, Jetts — Beach Road corridor.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'yoga-retreat-pattaya', card: `<a href="/guides/yoga-retreat-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Yoga retreat in Pattaya</h3><span class="cv-pill">Yoga</span></div>
      <p>Studios, resort packages, train-and-stretch weeks, sample 7-day plan.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'padel-pickleball-pattaya', card: `<a href="/guides/padel-pickleball-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Padel &amp; pickleball in Pattaya</h3><span class="cv-pill">Racquet</span></div>
      <p>Play Padel, Pickleball Pattaya, Mabprachan lakeside — courts and booking.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'training-thailand-visa-pattaya', card: `<a href="/guides/training-thailand-visa-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Train in Thailand — visa guide</h3><span class="cv-pill">Long-stay</span></div>
      <p>ED visa, tourist stay, camp sponsorship — Pattaya training paths.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'best-gym-naklua-pratamnak-pattaya', card: `<a href="/guides/best-gym-naklua-pratamnak-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Best gym in Naklua &amp; Pratamnak</h3><span class="cv-pill">Area</span></div>
      <p>Fairtex, Sityodtong, Muscle Factory, padel, Wong Amat — north &amp; hilltop venues.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'train-muay-thai-pattaya-1-week-1-month', card: `<a href="/guides/train-muay-thai-pattaya-1-week-1-month/" class="cat-venue-card">
      <div class="cv-head"><h3>Train Muay Thai: 1 week vs 1 month</h3><span class="cv-pill">Trip length</span></div>
      <p>Which camps, budgets, and schedules fit a 7-day trip vs a 4-week block.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'muay-thai-pattaya-beginners', card: `<a href="/guides/muay-thai-pattaya-beginners/" class="cat-venue-card">
      <div class="cv-head"><h3>Muay Thai in Pattaya for beginners</h3><span class="cv-pill">High intent</span></div>
      <p>Absolute beginners: 5 camps, gear list, costs, tourist-trap red flags.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'best-gym-jomtien-pattaya', card: `<a href="/guides/best-gym-jomtien-pattaya/" class="cat-venue-card">
      <div class="cv-head"><h3>Best gym in Jomtien Pattaya</h3><span class="cv-pill">Area</span></div>
      <p>Muay Thai, fitness, yoga, pools near Jomtien Beach — not mis-tagged central listings.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
  { slug: 'pattaya-vs-phuket-muay-thai-training', card: `<a href="/guides/pattaya-vs-phuket-muay-thai-training/" class="cat-venue-card">
      <div class="cv-head"><h3>Pattaya vs Phuket for Muay Thai</h3><span class="cv-pill">Compare</span></div>
      <p>Which city wins for training holidays — cost, camps, beaches, fights.</p>
      <span class="cv-cta">Read guide →</span>
    </a>\n    ` },
];

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

for (const { slug, html: line } of TLDR_ADD) {
  if (!html.includes(slug)) {
    html = html.replace('</ul>\n  </section>\n\n  <h2 class="guide-rank-section">All guides</h2>', `${line}\n    </ul>\n  </section>\n\n  <h2 class="guide-rank-section">All guides</h2>`);
  }
}

let cardInsert = '';
for (const { slug, card } of CARD_ADD) {
  if (!html.includes(slug)) cardInsert += card;
}
if (cardInsert) {
  html = html.replace('<div class="cat-venue-grid guide-hub-grid">\n    <a href="/guides/', `<div class="cat-venue-grid guide-hub-grid">\n    ${cardInsert}<a href="/guides/`);
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
