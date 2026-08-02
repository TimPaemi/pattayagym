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
  <p>Chon Buri's directory records span municipal tracks through the <a href="/gyms/siam-country-club/">Siam Country Club</a> course group. Treat journey time and preferred tee time as booking questions rather than assuming that every course sits inside Pattaya proper.</p>
  <h3>Course records, not quality tiers</h3>
  <p><strong>Named course-format comparison</strong> — compare <a href="/gyms/siam-country-club/">Siam Country Club</a>, <a href="/gyms/phoenix-gold-golf/">Phoenix Gold</a> and <a href="/gyms/treasure-hill-golf/">Treasure Hill</a> by the layouts and holes their retained records actually document. <a href="/gyms/chee-chan-golf/">Chee Chan</a> is the retained resort-branded golf record near Buddha Mountain. Horseshoe Point is not included here because its current record documents equestrian rather than golf activity. Compare <a href="/gyms/bangpra-international/">Bangpra</a>, <a href="/gyms/pattana-sports-resort/">Pattana</a> and municipal records on the <a href="/compare/">compare tool</a>. These group labels do not establish current course conditioning, difficulty or quality; use the dated mandatory-charge stack and confirm the selected layout.</p>
  <h3>Keep golf and other sport bookings separate</h3>
  <p>Use the <a href="/guides/luxury-sports-clubs-pattaya/">luxury sports-club guide</a> to compare separately documented resort facilities, and the <a href="/guides/best-gym-sattahip-pattaya/">Na Jomtien and Sattahip guide</a> for south-side area context. Those links do not establish a combined gym-and-golf package, shared booking or transfer. Compare Bangkok options separately in the <a href="/guides/bangkok-day-trip-sport-pattaya/">Bangkok day-trip guide</a>.</p>
</section>`,
  'pattaya-gyms-childcare-family-pools': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-cc-h">
  <h2 id="${MARKER}-cc-h" class="guide-rank-section">Compare family facilities without assuming childcare</h2>
  <p>The retained directory records do not establish dedicated childcare at ordinary Pattaya gyms. Hotel kids clubs, swim schools, football academies and water parks are separate products, and none should be treated as supervision while a parent trains unless the operator confirms the child's eligibility, guardian rules, session time and hand-off arrangement. Broader family sport: <a href="/guides/family-friendly-pattaya/">family-friendly guide</a>.</p>
  <h3>Documented hotel and resort facilities</h3>
  <p><a href="/gyms/cross-pattaya-pratamnak/">Cross Pattaya Pratamnak</a> documents a gym, PLAYROOM and pool, while <a href="/gyms/centara-grand-mirage/">Centara Grand Mirage</a> documents a water-park facility. Co-location does not establish that a child may use either facility without a guardian while a parent trains; confirm guest eligibility, supervision and simultaneous access. Na Jomtien resorts: <a href="/guides/best-gym-sattahip-pattaya/">Sattahip guide</a>.</p>
  <h3>Confirm structured youth-product terms</h3>
  <p>Football academies such as <a href="/gyms/af-academy-pattaya/">AF Academy</a> and <a href="/gyms/rusich-club-football/">Rusich Club</a> publish structured youth products; confirm the current age band, timetable and guardian arrangements before treating either as childcare. Swim schools and trampoline parks are distinct products, and their listings do not establish a supervision window while a parent trains.</p>
</section>`,
  'pattaya-seniors-low-impact-sport': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-sen-h">
  <h2 id="${MARKER}-sen-h" class="guide-rank-section">Evidence limits for lower-impact options</h2>
  <p>The directory records compare <strong>documented pools, yoga, hotel fitness facilities and social clubs</strong>, but they do not establish a swimming session, a cardio format, or that every option is low-impact or suitable for every older adult. Use the selected venue's actual hours and personal suitability rather than treating 09:00 or 16:00 as universal safety cutoffs.</p>
  <h3>Formats documented in the retained records</h3>
  <p>Hotel club day passes (<a href="/guides/luxury-sports-clubs-pattaya/">luxury clubs guide</a>), yoga studios (<a href="/guides/yoga-retreat-pattaya/">yoga retreat</a>), documented hotel pools, and self-directed walks. A pool listing does not establish lap lanes or a lap-swimming session. <a href="/gyms/wong-amat-beach/">Wong Amat Beach's evidence-limited public record</a> supports the last option, but does not establish supervised exercise, safe-swim coverage or medical suitability. This sport directory does not verify a medical-backup provider for an individual plan.</p>
  <h3>Confirm access and routes by area</h3>
  <p>Compare exact access products and routes in the <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua and Pratamnak guide</a> rather than assuming those districts guarantee calmer mornings than Central Pattaya. Family visits: <a href="/guides/family-friendly-pattaya/">family-friendly</a>.</p>
</section>`,
  'bangkok-day-trip-sport-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-bkk-h">
  <h2 id="${MARKER}-bkk-h" class="guide-rank-section">Bangkok sport day-trips from Pattaya</h2>
  <p>A Bangkok sport visit from Pattaya is a separate transport plan whose duration depends on the exact venue, date and route. The retained stadium records do not verify an operator transfer from Pattaya, so do not treat a generic 90–120-minute estimate or an assumed package as booking evidence.</p>
  <h3>Muay Thai stadiums</h3>
  <p><a href="/gyms/rajadamnern-stadium/">Rajadamnern</a> lists recurring event products across seven nights, while <a href="/gyms/lumpinee-boxing-stadium/">Lumpinee</a> lists Friday ONE Lumpinee and Saturday Lumpinee Super Champ cards plus selected Saturday-morning events. Those recurring patterns do not confirm that a card, start time or ticket remains available on a selected date. Both are spectator products, not evidence of visitor training. Pair either with Pattaya camp training: <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a> · <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">trip length guide</a>.</p>
  <h3>Keep golf and transport evidence separate</h3>
  <p>Compare Pattaya fairways on <a href="/guides/best-golf-courses-pattaya/">best golf courses</a> before booking Bangkok tee times. The retained stadium and golf records do not verify a transport provider, vehicle product or return arrangement from Pattaya; obtain those details separately for the exact venue and date.</p>
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
