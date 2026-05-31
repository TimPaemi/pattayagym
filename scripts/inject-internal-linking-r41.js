#!/usr/bin/env node
/**
 * inject-internal-linking-r41.js
 * Category/area guide strips, venue contextual guide links, ranked guide count fix,
 * expanded editorial funnel on remaining ranked guides.
 * Run after build-v2.js. Idempotent (markers guide-strip-r41, venue-guides-r41, editorial-funnel-r41).
 */

const fs = require('fs');
const path = require('path');
const { GYMS } = require('../data.js');

const ROOT = path.resolve(__dirname, '..');
const STRIP_MARKER = 'guide-strip-r41';
const VENUE_MARKER = 'venue-guides-r41';
const FUNNEL_MARKER = 'editorial-funnel-r41';

function guideCount() {
  return fs.readdirSync(path.join(ROOT, 'guides'), { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(ROOT, 'guides', e.name, 'index.html')))
    .length;
}

const N_GUIDES = guideCount();

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripSection(cards, title = 'Planning your trip?') {
  const grid = cards.map(c =>
    `<a href="/guides/${c.slug}/" class="intent-card intent-card-compact">
        <span class="intent-card-tag">// ${esc(c.tag)}</span>
        <span class="intent-card-title">${esc(c.title)}</span>
        <span class="intent-card-desc">${esc(c.desc)}</span>
      </a>`
  ).join('\n      ');
  return `
<section class="section taxonomy-guide-strip u-pt-0" id="${STRIP_MARKER}" aria-labelledby="${STRIP_MARKER}-h">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Guides</div>
    <h2 id="${STRIP_MARKER}-h" class="h-section">${title.split('?')[0]}<span class="accent-cyan">?</span></h2>
    <div class="intent-grid intent-grid-compact">
      ${grid}
    </div>
  </div>
</section>
`;
}

const MT_FUNNEL = [
  { slug: 'is-muay-thai-safe-pattaya', tag: 'Safety', title: 'Is Muay Thai safe?', desc: 'Injuries, red flags, medical' },
  { slug: 'muay-thai-pattaya-beginners', tag: 'Beginner', title: 'Muay Thai for beginners', desc: 'First week, gear, costs, red flags' },
  { slug: 'train-muay-thai-pattaya-1-week-1-month', tag: 'Trip length', title: '1 week vs 1 month', desc: 'Camps, budgets, schedules' },
  { slug: 'muay-thai-training-holiday-pattaya', tag: 'Holiday', title: 'Training holiday', desc: 'Stay-and-train 1–4 weeks' },
  { slug: 'english-speaking-muay-thai-pattaya', tag: 'English', title: 'English-speaking camps', desc: 'Train without Thai' },
];

const CATEGORY_STRIPS = {
  'muay-thai': MT_FUNNEL,
  mma: [
    { slug: 'bjj-mma-pattaya', tag: 'BJJ/MMA', title: 'BJJ & MMA guide', desc: 'Grappling, cage gyms, fight camps' },
    { slug: 'best-gym-east-pattaya', tag: 'East', title: 'East Pattaya camps', desc: 'Kombat Group, Rambaa M16' },
    { slug: 'best-muay-thai-pattaya', tag: 'Ranked', title: 'Best Muay Thai', desc: 'Pair striking with BJJ' },
  ],
  bjj: [
    { slug: 'bjj-mma-pattaya', tag: 'BJJ/MMA', title: 'BJJ & MMA guide', desc: 'ALFA BJJ, Venum, Rage, Kombat' },
    { slug: 'best-gym-east-pattaya', tag: 'East', title: 'East Pattaya', desc: 'Kombat Group grappling' },
    { slug: 'muay-thai-pattaya-beginners', tag: 'Beginner', title: 'Muay Thai beginners', desc: 'Cross-train MT + BJJ' },
  ],
  fitness: [
    { slug: 'cheapest-gyms-pattaya', tag: 'Budget', title: 'Cheapest gyms + table', desc: 'Monthly and drop-in prices' },
    { slug: 'gym-day-pass-pattaya', tag: 'Day pass', title: 'Gym day pass', desc: 'No membership needed' },
    { slug: '24-hour-gyms-pattaya', tag: '24h', title: '24-hour gyms', desc: 'Late-night training' },
  ],
  crossfit: [
    { slug: 'crossfit-pattaya', tag: 'CrossFit', title: 'CrossFit Pattaya', desc: 'Jungle Gym affiliate + alternatives' },
    { slug: 'best-gym-east-pattaya', tag: 'East', title: 'East Pattaya gyms', desc: 'Darkside training belt' },
    { slug: 'cheapest-gyms-pattaya', tag: 'Budget', title: 'Cheapest gyms', desc: 'Price comparison table' },
  ],
  yoga: [
    { slug: 'yoga-retreat-pattaya', tag: 'Retreat', title: 'Yoga retreat Pattaya', desc: 'Studios and wellness weeks' },
    { slug: 'pattaya-digital-nomad-fitness', tag: 'Nomad', title: 'Digital nomad fitness', desc: 'Work + train rhythm' },
    { slug: 'thai-gym-terms-pattaya', tag: 'Thai', title: 'Thai gym terms', desc: 'Phrase cheat sheet' },
  ],
  golf: [
    { slug: 'best-golf-courses-pattaya', tag: 'Golf', title: 'Best golf courses', desc: 'Ranked Pattaya courses' },
    { slug: 'luxury-sports-clubs-pattaya', tag: 'Luxury', title: 'Luxury sports clubs', desc: 'Premium facilities' },
    { slug: 'bangkok-day-trip-sport-pattaya', tag: 'Day trip', title: 'Bangkok day-trip sport', desc: 'Stadiums and courses near BKK' },
  ],
  racquet: [
    { slug: 'tennis-badminton-pattaya', tag: 'Tennis', title: 'Tennis & badminton', desc: 'Courts, clubs, booking tips' },
    { slug: 'padel-pickleball-pattaya', tag: 'Padel', title: 'Padel & pickleball', desc: 'Every court in Pattaya ranked' },
    { slug: 'luxury-sports-clubs-pattaya', tag: 'Luxury', title: 'Luxury clubs + tennis', desc: 'Fitz Club and resort courts' },
  ],
  swimming: [
    { slug: 'swimming-pools-pattaya', tag: 'Swim', title: 'Swimming & pools', desc: 'Hotel pools, water parks, lap swim' },
    { slug: 'family-friendly-pattaya', tag: 'Family', title: 'Family-friendly', desc: 'Pools and beaches for kids' },
    { slug: 'pattaya-gyms-childcare-family-pools', tag: 'Childcare', title: 'Childcare & family pools', desc: 'Train while kids swim' },
  ],
  watersports: [
    { slug: 'diving-watersports-pattaya', tag: 'Watersports', title: 'Diving & watersports', desc: 'Scuba, kite, sailing, Koh Larn' },
    { slug: 'best-dive-operators-pattaya', tag: 'Dive', title: 'Best dive operators', desc: 'PADI shops ranked' },
    { slug: 'best-gym-sattahip-pattaya', tag: 'Marina', title: 'Ocean Marina south', desc: 'Sailing and yacht corridor' },
  ],
  climbing: [
    { slug: 'climbing-pattaya', tag: 'Climbing', title: 'Climbing in Pattaya', desc: 'Deep vs Bean Cow, hotel walls' },
    { slug: 'best-for-beginners-pattaya', tag: 'Beginner', title: 'Best for beginners', desc: 'Intro-friendly venues' },
    { slug: 'family-friendly-pattaya', tag: 'Family', title: 'Family-friendly', desc: 'Kids adventure options' },
  ],
  clubs: [
    { slug: 'running-cycling-clubs-pattaya', tag: 'Clubs', title: 'Running & cycling clubs', desc: 'Hash, routes, beach aerobics' },
    { slug: 'pattaya-digital-nomad-fitness', tag: 'Nomad', title: 'Digital nomad fitness', desc: 'Long-stay social sport rhythm' },
    { slug: 'pattaya-seniors-low-impact-sport', tag: 'Seniors', title: 'Seniors low-impact', desc: 'Bowls, petanque, gentle sport' },
  ],
  'kids-youth': [
    { slug: 'kids-youth-sport-pattaya', tag: 'Kids', title: 'Kids & youth sport', desc: 'Football, trampoline, MT for kids' },
    { slug: 'family-friendly-pattaya', tag: 'Family', title: 'Family-friendly Pattaya', desc: 'Sport with kids' },
    { slug: 'pattaya-gyms-childcare-family-pools', tag: 'Childcare', title: 'Childcare & pools', desc: 'Parent training windows' },
  ],
  equestrian: [
    { slug: 'luxury-sports-clubs-pattaya', tag: 'Luxury', title: 'Luxury sports clubs', desc: 'Premium sport venues' },
    { slug: 'family-friendly-pattaya', tag: 'Family', title: 'Family-friendly', desc: 'Kids and parents' },
    { slug: 'bangkok-day-trip-sport-pattaya', tag: 'Day trip', title: 'Bangkok day trips', desc: 'Sport outside Pattaya' },
  ],
  adventure: [
    { slug: 'adventure-pattaya', tag: 'Adventure', title: 'Adventure in Pattaya', desc: 'Zipline, skydive, karting, ATV' },
    { slug: 'family-friendly-pattaya', tag: 'Family', title: 'Family-friendly', desc: 'Active family days' },
    { slug: 'climbing-pattaya', tag: 'Climbing', title: 'Climbing in Pattaya', desc: 'Indoor walls vs jungle ropes' },
  ],
};

const AREA_HUB_STRIPS = {
  jomtien: [
    { slug: 'best-gym-jomtien-pattaya', tag: 'Area guide', title: 'Best gym in Jomtien', desc: 'MT, fitness, yoga, pools' },
    { slug: 'muay-thai-pattaya-beginners', tag: 'Beginner', title: 'Muay Thai beginners', desc: 'First camp picks' },
    { slug: 'pattaya-digital-nomad-fitness', tag: 'Nomad', title: 'Digital nomad fitness', desc: 'Long-stay rhythm' },
  ],
  naklua: [
    { slug: 'best-gym-naklua-pratamnak-pattaya', tag: 'Area guide', title: 'Naklua & Pratamnak gyms', desc: 'Fairtex, Sityodtong, Muscle Factory' },
    { slug: 'muay-thai-camps-with-accommodation-pattaya', tag: 'Stay & train', title: 'Camps with rooms', desc: 'On-site packages' },
    { slug: 'english-speaking-muay-thai-pattaya', tag: 'English', title: 'English-speaking MT', desc: 'Foreigner-friendly camps' },
  ],
  pratamnak: [
    { slug: 'best-gym-naklua-pratamnak-pattaya', tag: 'Area guide', title: 'Pratamnak & Naklua', desc: 'Hilltop iron and padel' },
    { slug: 'luxury-sports-clubs-pattaya', tag: 'Luxury', title: 'Luxury sports clubs', desc: 'Fitz Club tier' },
    { slug: 'cheapest-gyms-pattaya', tag: 'Budget', title: 'Cheapest gyms', desc: 'Price table' },
  ],
  'central-pattaya': [
    { slug: 'best-gym-central-pattaya', tag: 'Area guide', title: 'Best gym Central Pattaya', desc: 'WKO, 24h chains, Tony\'s' },
    { slug: 'best-gyms-near-walking-street-pattaya', tag: 'Central', title: 'Near Walking Street', desc: 'Beach Road gyms' },
    { slug: 'gym-day-pass-pattaya', tag: 'Day pass', title: 'Gym day pass', desc: 'Short-stay drop-ins' },
  ],
  'east-pattaya': [
    { slug: 'best-gym-east-pattaya', tag: 'Area guide', title: 'Best gym East Pattaya', desc: 'Kombat Group, Mabprachan, Darkside' },
    { slug: 'muay-thai-camps-with-accommodation-pattaya', tag: 'Stay & train', title: 'Camps with rooms', desc: 'All-inclusive east camps' },
    { slug: 'muay-thai-training-holiday-pattaya', tag: 'Holiday', title: 'Training holiday', desc: 'Rural camp stays' },
  ],
  sattahip: [
    { slug: 'best-gym-sattahip-pattaya', tag: 'Area guide', title: 'Na Jomtien & Sattahip', desc: 'Marina, resorts, water parks' },
    { slug: 'best-gym-jomtien-pattaya', tag: 'Jomtien', title: 'Jomtien beach gyms', desc: 'North Jomtien MT & fitness' },
    { slug: 'best-dive-operators-pattaya', tag: 'Dive', title: 'Dive operators', desc: 'PADI shops ranked' },
  ],
};

function areaCategoryStrip(areaSlug, catKey) {
  const base = CATEGORY_STRIPS[catKey] || [];
  if (catKey === 'muay-thai') {
    if (areaSlug === 'jomtien') {
      return [
        { slug: 'best-gym-jomtien-pattaya', tag: 'Jomtien', title: 'Best gym Jomtien', desc: 'Beach-side MT picks' },
        ...MT_FUNNEL.slice(0, 2),
      ];
    }
    if (areaSlug === 'naklua') {
      return [
        { slug: 'best-gym-naklua-pratamnak-pattaya', tag: 'Naklua', title: 'Naklua MT guide', desc: 'Fairtex and Sityodtong' },
        { slug: 'muay-thai-camps-with-accommodation-pattaya', tag: 'Stay & train', title: 'Camps with rooms', desc: 'Resort packages' },
        { slug: 'english-speaking-muay-thai-pattaya', tag: 'English', title: 'English-speaking MT', desc: 'Clear coaching' },
      ];
    }
    if (areaSlug === 'central-pattaya') {
      return [
        { slug: 'best-gym-central-pattaya', tag: 'Central', title: 'Central Pattaya gyms', desc: 'WKO, Battle Conquer, 24h' },
        { slug: 'best-muay-thai-pattaya', tag: 'Ranked', title: 'Best Muay Thai', desc: 'Top camps ranked' },
        ...MT_FUNNEL.slice(0, 1),
      ];
    }
    if (areaSlug === 'east-pattaya') {
      return [
        { slug: 'best-gym-east-pattaya', tag: 'East', title: 'East Pattaya / Darkside', desc: 'Kombat Group, Sor Klinmee' },
        { slug: 'muay-thai-camps-with-accommodation-pattaya', tag: 'Stay & train', title: 'Camps with rooms', desc: 'Huai Yai packages' },
        ...MT_FUNNEL.slice(0, 1),
      ];
    }
  }
  if (areaSlug === 'pratamnak' && (catKey === 'fitness' || catKey === 'racquet')) {
    return [
      { slug: 'best-gym-naklua-pratamnak-pattaya', tag: 'Pratamnak', title: 'Pratamnak gyms', desc: 'Muscle Factory, padel, pickleball' },
      ...base.slice(0, 2),
    ];
  }
  if (areaSlug === 'jomtien' && CATEGORY_STRIPS[catKey]) {
    return [{ slug: 'best-gym-jomtien-pattaya', tag: 'Jomtien', title: 'Jomtien area guide', desc: 'All sports in Jomtien' }, ...base.slice(0, 2)];
  }
  if (areaSlug === 'east-pattaya' && CATEGORY_STRIPS[catKey]) {
    return [{ slug: 'best-gym-east-pattaya', tag: 'East', title: 'East Pattaya guide', desc: 'Darkside camps & Mabprachan' }, ...base.slice(0, 2)];
  }
  if (areaSlug === 'sattahip' && CATEGORY_STRIPS[catKey]) {
    return [{ slug: 'best-gym-sattahip-pattaya', tag: 'South', title: 'Na Jomtien & Sattahip', desc: 'Marina, resorts, water parks' }, ...base.slice(0, 2)];
  }
  return base.slice(0, 3);
}

function injectAfterHero(html, block) {
  if (html.includes(STRIP_MARKER)) return null;
  const idx = html.indexOf('<main id="main">');
  if (idx < 0) return null;
  const afterMain = html.slice(idx);
  const heroEnd = afterMain.indexOf('</section>');
  if (heroEnd < 0) return null;
  const insertAt = idx + heroEnd + '</section>'.length;
  return html.slice(0, insertAt) + '\n' + block + html.slice(insertAt);
}

function areaSlugFromVenue(areaStr) {
  const a = (areaStr || '').toLowerCase();
  if (a.includes('jomtien') || a.includes('na jomtien')) return 'jomtien';
  if (a.includes('naklua') || a.includes('wong amat') || a.includes('north pattaya')) return 'naklua';
  if (a.includes('pratamnak') || a.includes('pratumnak')) return 'pratamnak';
  if (a.includes('east') || a.includes('darkside') || a.includes('mabprachan') || a.includes('huai yai')) return 'east-pattaya';
  if (a.includes('sattahip')) return 'sattahip';
  if (a.includes('central') || a.includes('buakhao') || a.includes('beach road') || a.includes('walking')) return 'central-pattaya';
  return null;
}

function venueGuideLinks(gym) {
  const links = [];
  const cat = gym.category;
  const area = areaSlugFromVenue(gym.area);
  const tags = (gym.tags || []).join(' ').toLowerCase();

  if (cat === 'mma' || cat === 'bjj') {
    links.push({ slug: 'bjj-mma-pattaya', label: 'BJJ & MMA in Pattaya' });
    links.push({ slug: 'best-gym-east-pattaya', label: 'East Pattaya fight camps' });
    links.push({ slug: 'training-thailand-visa-pattaya', label: 'Training & visa guide' });
    links.push({ slug: 'best-muay-thai-pattaya', label: 'Best Muay Thai ranked list' });
  } else if (cat === 'muay-thai') {
    links.push({ slug: 'is-muay-thai-safe-pattaya', label: 'Is Muay Thai safe?' });
    links.push({ slug: 'muay-thai-pattaya-beginners', label: 'Muay Thai for beginners' });
    links.push({ slug: 'muay-thai-training-holiday-pattaya', label: 'Training holiday guide' });
    links.push({ slug: 'training-thailand-visa-pattaya', label: 'Training & visa guide' });
    if (tags.includes('accommodation') || tags.includes('all-inclusive')) {
      links.push({ slug: 'muay-thai-camps-with-accommodation-pattaya', label: 'Camps with accommodation' });
    }
    if (tags.includes('english')) {
      links.push({ slug: 'english-speaking-muay-thai-pattaya', label: 'English-speaking Muay Thai' });
    }
    links.push({ slug: 'gym-day-pass-pattaya', label: 'Gym day pass Pattaya' });
    links.push({ slug: 'best-muay-thai-pattaya', label: 'Best Muay Thai ranked list' });
  } else if (cat === 'fitness' || cat === 'crossfit') {
    if (cat === 'crossfit') {
      links.push({ slug: 'crossfit-pattaya', label: 'CrossFit Pattaya guide' });
      links.push({ slug: 'best-gym-east-pattaya', label: 'East Pattaya gyms' });
    }
    links.push({ slug: 'cheapest-gyms-pattaya', label: 'Cheapest gyms + price table' });
    links.push({ slug: 'gym-day-pass-pattaya', label: 'Gym day pass' });
    links.push({ slug: '24-hour-gyms-pattaya', label: '24-hour gyms' });
  } else if (cat === 'golf') {
    links.push({ slug: 'best-golf-courses-pattaya', label: 'Best golf courses' });
    links.push({ slug: 'luxury-sports-clubs-pattaya', label: 'Luxury sports clubs' });
  } else if (cat === 'yoga') {
    links.push({ slug: 'yoga-retreat-pattaya', label: 'Yoga retreat Pattaya' });
    links.push({ slug: 'thai-gym-terms-pattaya', label: 'Thai gym terms' });
    links.push({ slug: 'pattaya-digital-nomad-fitness', label: 'Digital nomad fitness' });
  } else if (cat === 'racquet') {
    links.push({ slug: 'tennis-badminton-pattaya', label: 'Tennis & badminton Pattaya' });
    links.push({ slug: 'padel-pickleball-pattaya', label: 'Padel & pickleball Pattaya' });
    links.push({ slug: 'best-gym-naklua-pratamnak-pattaya', label: 'Pratamnak padel & pickleball' });
    links.push({ slug: 'luxury-sports-clubs-pattaya', label: 'Luxury racquet clubs' });
  } else if (cat === 'swimming' || cat === 'watersports') {
    if (cat === 'swimming') {
      links.push({ slug: 'swimming-pools-pattaya', label: 'Swimming & pools guide' });
    }
    if (cat === 'watersports') {
      links.push({ slug: 'diving-watersports-pattaya', label: 'Diving & watersports Pattaya' });
    }
    links.push({ slug: 'best-dive-operators-pattaya', label: 'Best dive operators' });
    links.push({ slug: 'family-friendly-pattaya', label: 'Family-friendly sport' });
    if (cat === 'watersports') {
      links.push({ slug: 'best-gym-jomtien-pattaya', label: 'Jomtien dive & kite base' });
      links.push({ slug: 'best-gym-sattahip-pattaya', label: 'Marina & south corridor' });
    }
  } else if (cat === 'climbing') {
    links.push({ slug: 'climbing-pattaya', label: 'Climbing in Pattaya' });
    links.push({ slug: 'best-for-beginners-pattaya', label: 'Best for beginners' });
    links.push({ slug: 'family-friendly-pattaya', label: 'Family-friendly sport' });
  } else if (cat === 'adventure') {
    links.push({ slug: 'adventure-pattaya', label: 'Adventure in Pattaya' });
    links.push({ slug: 'family-friendly-pattaya', label: 'Family-friendly sport' });
    links.push({ slug: 'climbing-pattaya', label: 'Climbing in Pattaya' });
    links.push({ slug: 'best-gym-sattahip-pattaya', label: 'Sattahip & south adventure' });
  } else if (cat === 'kids-youth') {
    links.push({ slug: 'kids-youth-sport-pattaya', label: 'Kids & youth sport Pattaya' });
    links.push({ slug: 'family-friendly-pattaya', label: 'Family-friendly Pattaya' });
    links.push({ slug: 'pattaya-gyms-childcare-family-pools', label: 'Childcare & family pools' });
  } else if (cat === 'clubs') {
    links.push({ slug: 'running-cycling-clubs-pattaya', label: 'Running & cycling clubs' });
    links.push({ slug: 'pattaya-digital-nomad-fitness', label: 'Digital nomad fitness' });
    links.push({ slug: 'pattaya-seniors-low-impact-sport', label: 'Seniors low-impact sport' });
  } else {
    links.push({ slug: 'best-for-beginners-pattaya', label: 'Best for beginners' });
  }

  if (area === 'jomtien') links.push({ slug: 'best-gym-jomtien-pattaya', label: 'Best gym in Jomtien' });
  if (area === 'naklua' || area === 'pratamnak') links.push({ slug: 'best-gym-naklua-pratamnak-pattaya', label: 'Naklua & Pratamnak gyms' });
  if (area === 'central-pattaya') links.push({ slug: 'best-gym-central-pattaya', label: 'Best gym Central Pattaya' });
  if (area === 'east-pattaya') links.push({ slug: 'best-gym-east-pattaya', label: 'Best gym East Pattaya' });
  if (area === 'sattahip') links.push({ slug: 'best-gym-sattahip-pattaya', label: 'Na Jomtien & Sattahip' });

  const seen = new Set();
  const uniq = [];
  for (const l of links) {
    if (seen.has(l.slug)) continue;
    seen.add(l.slug);
    uniq.push(l);
    if (uniq.length >= 5) break;
  }
  return uniq;
}

function venueSection(links) {
  const items = links.map(l => `<li><a href="/guides/${l.slug}/">${esc(l.label)}</a></li>`).join('\n        ');
  return `
<section class="section u-pt-0 venue-guide-links" id="${VENUE_MARKER}">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Guides</div>
    <h2 class="h-section">Plan your <span class="accent-cyan">Pattaya trip.</span></h2>
    <ul class="venue-guide-link-list">
        ${items}
    </ul>
    <p class="u-muted" style="margin-top:12px; font-size:13px;"><a href="/guides/">Browse all ${N_GUIDES} guides →</a> · <a href="/compare/">Compare venues</a></p>
  </div>
</section>
`;
}

function injectVenue(html, links) {
  if (html.includes(VENUE_MARKER)) return null;
  const block = venueSection(links);
  const norm = s => s.replace(/\r\n/g, '\n');
  const htmlNorm = norm(html);
  const anchors = [
    '<section class="section u-pt-0 venue-guide-links" id="venue-guides-r41">',
    '<section class="section u-pt-0">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">★</span> Social</div>',
    '<section class="section">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">★</span> Contact channels</div>',
    '<section class="section">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">★</span> Same sport</div>',
  ];
  for (const a of anchors) {
    const aNorm = norm(a);
    const idx = htmlNorm.indexOf(aNorm);
    if (idx >= 0) {
      const before = html.slice(0, idx);
      const after = html.slice(idx);
      return before + block + '\n' + after;
    }
  }
  const mainEnd = html.lastIndexOf('</main>');
  if (mainEnd > 0) return html.slice(0, mainEnd) + block + '\n' + html.slice(mainEnd);
  return null;
}

const FUNNEL_R41 = {
  'best-dive-operators-pattaya': [
    { slug: 'diving-watersports-pattaya', title: 'Diving & watersports', desc: 'Scuba, kite, sailing, Koh Larn lanes.' },
    { slug: 'best-gym-sattahip-pattaya', title: 'Ocean Marina south', desc: 'Na Jomtien marina and dive launch.' },
    { slug: 'best-gym-jomtien-pattaya', title: 'Jomtien base', desc: 'Stay south, taxi to Bali Hai pier.' },
  ],
  'best-golf-courses-pattaya': [
    { slug: 'luxury-sports-clubs-pattaya', title: 'Luxury sports clubs', desc: 'Resort golf and tennis tier.' },
    { slug: 'bangkok-day-trip-sport-pattaya', title: 'Bangkok day trips', desc: 'Courses and stadiums near BKK.' },
    { slug: 'cheapest-gyms-pattaya', title: 'Cheapest gyms', desc: 'Budget gym between rounds.' },
  ],
  'family-friendly-pattaya': [
    { slug: 'kids-youth-sport-pattaya', title: 'Kids & youth sport', desc: 'Football academies, trampoline, MT for kids.' },
    { slug: 'adventure-pattaya', title: 'Adventure in Pattaya', desc: 'Zipline, karting, skydive, family days.' },
    { slug: 'climbing-pattaya', title: 'Climbing in Pattaya', desc: 'Deep Harbor Mall and Bean Cow family walls.' },
  ],
  'best-for-beginners-pattaya': [
    { slug: 'climbing-pattaya', title: 'Climbing in Pattaya', desc: 'Intro top-rope at Deep and Bean Cow.' },
    { slug: 'muay-thai-pattaya-beginners', title: 'Muay Thai beginners', desc: 'First pad rounds and camp picks.' },
    { slug: 'gym-day-pass-pattaya', title: 'Gym day pass', desc: 'Try a gym today without membership.' },
  ],
  'pattaya-digital-nomad-fitness': [
    { slug: 'running-cycling-clubs-pattaya', title: 'Running & cycling clubs', desc: 'Hash, beach aerobics, social sport.' },
    { slug: 'gym-day-pass-pattaya', title: 'Gym day pass', desc: 'Flexible drop-ins.' },
    { slug: 'cheapest-gyms-pattaya', title: 'Cheapest gyms', desc: 'Monthly budget table.' },
  ],
  'thai-gym-terms-pattaya': [
    { slug: 'english-speaking-muay-thai-pattaya', title: 'English-speaking MT', desc: 'Camps with clear coaching.' },
    { slug: 'muay-thai-pattaya-beginners', title: 'Muay Thai beginners', desc: 'First camp expectations.' },
    { slug: 'best-muay-thai-pattaya', title: 'Best Muay Thai', desc: 'Ranked camp list.' },
  ],
  'luxury-sports-clubs-pattaya': [
    { slug: 'tennis-badminton-pattaya', title: 'Tennis & badminton', desc: 'Fitz Club and resort courts.' },
    { slug: 'best-golf-courses-pattaya', title: 'Best golf courses', desc: 'Championship Pattaya golf.' },
    { slug: 'best-gym-naklua-pratamnak-pattaya', title: 'Pratamnak luxury cluster', desc: 'Fitz Club and hilltop gyms.' },
  ],
  'pattaya-solo-female-fitness': [
    { slug: 'female-friendly-gyms-pattaya', title: 'Female-friendly gyms', desc: 'Ranked women-friendly venues.' },
    { slug: 'muay-thai-pattaya-beginners', title: 'Muay Thai beginners', desc: 'Beginner-safe camps.' },
    { slug: 'best-gym-jomtien-pattaya', title: 'Jomtien gyms', desc: 'Quieter beach-side training.' },
  ],
  'bangkok-day-trip-sport-pattaya': [
    { slug: 'adventure-pattaya', title: 'Adventure in Pattaya', desc: 'Skydive, zipline, karting before BKK trips.' },
    { slug: 'best-muay-thai-pattaya', title: 'Best Muay Thai', desc: 'Includes Lumpinee day-trip.' },
    { slug: 'best-golf-courses-pattaya', title: 'Best golf courses', desc: 'Pattaya courses vs BKK.' },
  ],
  'pattaya-seniors-low-impact-sport': [
    { slug: 'running-cycling-clubs-pattaya', title: 'Running & cycling clubs', desc: 'Bowls, petanque, gentle hash options.' },
    { slug: 'family-friendly-pattaya', title: 'Family-friendly', desc: 'Gentle sport with family.' },
    { slug: 'pattaya-solo-female-fitness', title: 'Solo female fitness', desc: 'Low-pressure gym culture.' },
  ],
  'pattaya-russian-speaking-sport': [
    { slug: 'muay-thai-pattaya-beginners', title: 'Muay Thai beginners', desc: 'Many camps train Russians daily.' },
    { slug: 'english-speaking-muay-thai-pattaya', title: 'English-speaking MT', desc: 'Multilingual camp options.' },
    { slug: 'cheapest-gyms-pattaya', title: 'Cheapest gyms', desc: 'Budget fitness table.' },
  ],
  'pattaya-gyms-childcare-family-pools': [
    { slug: 'kids-youth-sport-pattaya', title: 'Kids & youth sport', desc: 'Football, trampoline, Harbor Mall stack.' },
    { slug: 'family-friendly-pattaya', title: 'Family-friendly Pattaya', desc: 'Broader family sport guide.' },
    { slug: 'best-gym-jomtien-pattaya', title: 'Jomtien family gyms', desc: 'Resort pools and kids zones.' },
  ],
};

const EDITORIAL = new Set([
  'english-speaking-muay-thai-pattaya', 'muay-thai-camps-with-accommodation-pattaya',
  'gym-day-pass-pattaya', 'muay-thai-training-holiday-pattaya', 'muay-thai-pattaya-beginners',
  'best-gym-jomtien-pattaya', 'pattaya-vs-phuket-muay-thai-training',
  'train-muay-thai-pattaya-1-week-1-month',   'best-gym-naklua-pratamnak-pattaya',
  'padel-pickleball-pattaya',
  'training-thailand-visa-pattaya',
  'thai-gym-terms-pattaya',
  'is-muay-thai-safe-pattaya', 'best-gym-central-pattaya', 'yoga-retreat-pattaya',
  'best-gym-east-pattaya', 'best-gym-sattahip-pattaya', 'bjj-mma-pattaya',   'crossfit-pattaya', 'swimming-pools-pattaya', 'tennis-badminton-pattaya',   'climbing-pattaya', 'adventure-pattaya', 'kids-youth-sport-pattaya', 'diving-watersports-pattaya', 'running-cycling-clubs-pattaya',
]);

function funnelCard({ slug, title, desc }) {
  return `
      <a href="/guides/${slug}/" class="cat-venue-card editorial-funnel-card">
        <div class="cv-head"><h3>${esc(title)}</h3><span class="cv-pill">Editorial</span></div>
        <p>${esc(desc)}</p>
        <span class="cv-cta">Read guide →</span>
      </a>`;
}

function injectFunnel(html, slug) {
  const picks = FUNNEL_R41[slug];
  if (!picks || html.includes(FUNNEL_MARKER)) return null;
  const block = `<!-- ${FUNNEL_MARKER} -->` + picks.map(funnelCard).join('');
  const re = /(<section class="guide-related"[^>]*>\s*<h2[^>]*>Related[^<]*<\/h2>\s*<div class="cat-venue-grid">)/;
  if (!re.test(html)) return null;
  return html.replace(re, `$1\n${block}`);
}

function fixGuideCount(html) {
  return html.replace(/Browse all \d+ Pattaya guides/g, `Browse all ${N_GUIDES} Pattaya guides`);
}

let stats = { category: 0, areaHub: 0, areaCat: 0, venue: 0, funnel: 0, countFix: 0 };

// Category pages
for (const cat of Object.keys(CATEGORY_STRIPS)) {
  const fp = path.join(ROOT, 'category', cat, 'index.html');
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  const next = injectAfterHero(html, stripSection(CATEGORY_STRIPS[cat], 'Planning your trip?'));
  if (next) {
    fs.writeFileSync(fp, next, 'utf8');
    stats.category++;
    console.log(`  /category/${cat}/ guide strip`);
  }
}

// Area hubs
for (const [area, cards] of Object.entries(AREA_HUB_STRIPS)) {
  const fp = path.join(ROOT, 'area', area, 'index.html');
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  const next = injectAfterHero(html, stripSection(cards, 'Training in this area?'));
  if (next) {
    fs.writeFileSync(fp, next, 'utf8');
    stats.areaHub++;
    console.log(`  /area/${area}/ guide strip`);
  }
}

// Area × category
const areasDir = path.join(ROOT, 'area');
for (const areaEnt of fs.readdirSync(areasDir, { withFileTypes: true })) {
  if (!areaEnt.isDirectory()) continue;
  const areaSlug = areaEnt.name;
  const areaPath = path.join(areasDir, areaSlug);
  for (const catEnt of fs.readdirSync(areaPath, { withFileTypes: true })) {
    if (!catEnt.isDirectory()) continue;
    const catKey = catEnt.name;
    const fp = path.join(areaPath, catKey, 'index.html');
    if (!fs.existsSync(fp)) continue;
    const cards = areaCategoryStrip(areaSlug, catKey);
    if (!cards.length) continue;
    let html = fs.readFileSync(fp, 'utf8');
    const next = injectAfterHero(html, stripSection(cards, 'Planning your trip?'));
    if (next) {
      fs.writeFileSync(fp, next, 'utf8');
      stats.areaCat++;
    }
  }
}
console.log(`  ${stats.areaCat} area×category strips`);

// Venues
const gymById = Object.fromEntries(GYMS.map(g => [g.id, g]));
for (const g of GYMS) {
  const fp = path.join(ROOT, 'gyms', g.id, 'index.html');
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  const links = venueGuideLinks(g);
  const next = injectVenue(html, links);
  if (next) {
    fs.writeFileSync(fp, next, 'utf8');
    stats.venue++;
  }
}
console.log(`  ${stats.venue} venue guide link blocks`);

// Ranked guide funnel + count fix
const guidesDir = path.join(ROOT, 'guides');
for (const ent of fs.readdirSync(guidesDir, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  const fp = path.join(guidesDir, ent.name, 'index.html');
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  let changed = false;
  if (!EDITORIAL.has(ent.name)) {
    const f = injectFunnel(html, ent.name);
    if (f) { html = f; stats.funnel++; changed = true; }
  }
  const fixed = fixGuideCount(html);
  if (fixed !== html) { html = fixed; stats.countFix++; changed = true; }
  if (changed) fs.writeFileSync(fp, html, 'utf8');
}

console.log(`\nRound 41 internal linking: ${stats.category} categories, ${stats.areaHub} area hubs, ${stats.areaCat} area×cat, ${stats.venue} venues, ${stats.funnel} funnel guides, ${stats.countFix} count fixes.`);
