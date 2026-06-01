#!/usr/bin/env node
/**
 * deepen-round46-ranked.js — Editorial depth for remaining ranked guides.
 * Idempotent marker: deepen-r46-block
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'deepen-r46-block';

const BLOCKS = {
  'best-muay-thai-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-mt-h">
  <h2 id="${MARKER}-mt-h" class="guide-rank-section">How we rank Muay Thai camps</h2>
  <p>Tiers reflect <strong>coaching depth, foreigner flow, facility honesty, and value</strong> — not Instagram follower counts. Resort camps (Fairtex, Kombat) lead for hand-holding; street gyms (WKO, Sor Klinmee) lead for authentic Thai rhythm at lower cost.</p>
  <h3>Pick by trip type</h3>
  <ul>
    <li><strong>First week ever</strong> → <a href="/guides/muay-thai-pattaya-beginners/">beginners guide</a> · <a href="/guides/is-muay-thai-safe-pattaya/">safety guide</a></li>
    <li><strong>1–4 week holiday</strong> → <a href="/guides/muay-thai-training-holiday-pattaya/">training holiday</a> · <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">1 week vs 1 month</a></li>
    <li><strong>East-side rural camp</strong> → <a href="/guides/best-gym-east-pattaya/">East Pattaya</a> · <a href="/guides/muay-thai-camps-with-accommodation-pattaya/">camps with rooms</a></li>
    <li><strong>BJJ + MT same trip</strong> → <a href="/guides/bjj-mma-pattaya/">BJJ &amp; MMA guide</a></li>
  </ul>
  <h3>Area shortcuts</h3>
  <p><a href="/guides/best-gym-central-pattaya/">Central</a> · <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> · <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua</a> · <a href="/guides/best-gym-east-pattaya/">East</a>. Bangkok stadium night: <a href="/guides/bangkok-day-trip-sport-pattaya/">Bangkok day trips</a>.</p>
</section>`,
  'best-gyms-near-walking-street-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-ws-h">
  <h2 id="${MARKER}-ws-h" class="guide-rank-section">Training near Walking Street without the noise</h2>
  <p>Beach Road hotels put you 5–15 minutes from iron gyms on Soi Diana and Soi Buakhao — but <strong>sleep quality suffers</strong> if you train early and party late. This list is walkability-first; for area context see <a href="/guides/best-gym-central-pattaya/">Central Pattaya guide</a>.</p>
  <h3>Soi corridors</h3>
  <p><strong>Soi Diana (Soi 13)</strong> — Tony's Gym, Megabreak, closest belt. <strong>Soi Buakhao</strong> — Jetts, Universe, 12–16 min walk or quick baht-bus. <strong>Mike Mall / Avenue</strong> — Coco Fitness, Fitness 7 for hotel guests.</p>
  <h3>Muay Thai from Beach Road</h3>
  <p>Authentic camps are rarely walkable — taxi to <a href="/gyms/wko-muay-thai/">WKO</a>, <a href="/gyms/battle-conquer-gym/">Battle Conquer</a>, or hotel cardio at <a href="/gyms/fitz-club/">Fitz Club</a>. Full ranked list: <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a>.</p>
  <p>Short-stay drop-ins: <a href="/guides/gym-day-pass-pattaya/">gym day pass</a> · Budget: <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms</a>.</p>
</section>`,
  'best-golf-courses-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-golf-h">
  <h2 id="${MARKER}-golf-h" class="guide-rank-section">Pattaya golf — how courses differ</h2>
  <p>Chon Buri province packs <strong>20+ layouts</strong> from municipal budget tracks to Siam Country Club Old Course. Pattaya proper means 20–45 minute drives to fairways — plan tee times around heat (07:00 start ideal Nov–Feb).</p>
  <h3>Tiers</h3>
  <p><strong>Championship</strong> — Siam Country Club, Phoenix Gold, Treasure Hill. <strong>Resort pairings</strong> — Chee Chan (Buddha Mountain views), Horseshoe Point east. <strong>Value</strong> — Bangpra, Pattana, municipal tracks on <a href="/compare/">compare tool</a>.</p>
  <h3>Combine with other sport</h3>
  <p>Resort gym + golf: <a href="/guides/luxury-sports-clubs-pattaya/">luxury sports clubs</a>. South-side golf days: <a href="/guides/best-gym-sattahip-pattaya/">Na Jomtien &amp; Sattahip</a>. Bangkok courses: <a href="/guides/bangkok-day-trip-sport-pattaya/">Bangkok day trips</a>.</p>
</section>`,
  'pattaya-gyms-childcare-family-pools': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-cc-h">
  <h2 id="${MARKER}-cc-h" class="guide-rank-section">Training windows when kids need occupying</h2>
  <p>Dedicated gym childcare is rare in Pattaya — families solve it with <strong>hotel kids clubs, swim schools, football academies, and water parks</strong> while parents train nearby. Broader family sport: <a href="/guides/family-friendly-pattaya/">family-friendly guide</a>.</p>
  <h3>Hotel &amp; resort picks</h3>
  <p><a href="/gyms/cross-pattaya-pratamnak/">Cross Pattaya Pratamnak</a> — gym + PLAYROOM + pool. <a href="/gyms/centara-grand-mirage/">Centara Grand Mirage</a> water park. Na Jomtien resorts: <a href="/guides/best-gym-sattahip-pattaya/">Sattahip guide</a>.</p>
  <h3>Structured kids sport</h3>
  <p>Football academies (AF Academy, Rusich Club), swim schools, trampoline parks. Schools context: <a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a>.</p>
</section>`,
  'pattaya-seniors-low-impact-sport': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-sen-h">
  <h2 id="${MARKER}-sen-h" class="guide-rank-section">Low-impact sport for 65+ in Pattaya</h2>
  <p>Pattaya suits retirees who want <strong>pool swimming, gentle yoga, hotel gym cardio, and social clubs</strong> without high-impact fight sport. Heat and humidity matter — train before 09:00 or after 16:00.</p>
  <h3>Best formats</h3>
  <p>Hotel club day passes (<a href="/guides/luxury-sports-clubs-pattaya/">luxury clubs guide</a>), yoga studios (<a href="/guides/yoga-retreat-pattaya/">yoga retreat</a>), Wong Amat beach walks, hotel pool laps. Medical backup: <a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a>.</p>
  <h3>Areas</h3>
  <p>Pratamnak and Naklua beat central nightlife for calm mornings — <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua guide</a>. Family visits: <a href="/guides/family-friendly-pattaya/">family-friendly</a>.</p>
</section>`,
  'bangkok-day-trip-sport-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-bkk-h">
  <h2 id="${MARKER}-bkk-h" class="guide-rank-section">Bangkok sport day-trips from Pattaya</h2>
  <p>Pattaya is 90–120 minutes from Bangkok — realistic for <strong>evening stadium cards, morning golf, or adventure parks</strong> without changing your beach base. Most operators run Pattaya ↔ BKK transfer packages.</p>
  <h3>Muay Thai stadiums</h3>
  <p><a href="/gyms/rajadamnern-stadium/">Rajadamnern</a> (world's oldest, almost nightly) and Lumpinee (RWS flagship Saturdays). Pair with Pattaya camp training: <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a> · <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">trip length guide</a>.</p>
  <h3>Golf &amp; other</h3>
  <p>Compare Pattaya fairways on <a href="/guides/best-golf-courses-pattaya/">best golf courses</a> before booking Bangkok tee times. Transport: <a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Vehicle Rentals</a>.</p>
</section>`,
};

function inject(slug, block) {
  const fp = path.join(ROOT, 'guides', slug, 'index.html');
  if (!fs.existsSync(fp)) return false;
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes(MARKER)) {
    html = html.replace(new RegExp(`<section class="guide-editorial-depth" id="${MARKER}"[\\s\\S]*?</section>`, 'm'), block.trim());
  } else {
    const anchor = '<div id="full-list"></div>';
    if (!html.includes(anchor)) return false;
    html = html.replace(anchor, block + '\n  ' + anchor);
  }
  fs.writeFileSync(fp, html, 'utf8');
  return true;
}

let n = 0;
for (const [slug, block] of Object.entries(BLOCKS)) {
  if (inject(slug, block)) {
    n++;
    console.log(`  /guides/${slug}/ deepened`);
  }
}
console.log(`Round 46 ranked deepen: ${n} guides.`);
