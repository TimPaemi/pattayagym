#!/usr/bin/env node
/**
 * deepen-round45-ranked.js — Editorial depth for solo female, nomad, luxury, dive guides.
 * Idempotent marker: deepen-r45-block
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'deepen-r45-block';

const BLOCKS = {
  'pattaya-solo-female-fitness': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-sf-h">
  <h2 id="${MARKER}-sf-h" class="guide-rank-section">Solo female training in Pattaya — practical notes</h2>
  <p>Pattaya hosts thousands of solo female long-stayers who train Muay Thai, lift, and swim without incident. Success comes from <strong>area choice + gym culture + communication</strong>, not avoiding the city entirely.</p>
  <h3>Areas women often prefer</h3>
  <p><strong>Jomtien and Pratamnak</strong> beat central nightlife zones for sleep and morning sessions. <strong>Naklua / Wong Amat</strong> suits resort-camp holidays (Fairtex). Avoid signing a monthly contract in central Pattaya if noise and late-night distraction break recovery — see area guides: <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> · <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua</a> · <a href="/guides/best-gym-central-pattaya/">Central</a>.</p>
  <h3>Muay Thai as a solo woman</h3>
  <p>Ethical camps scale pad power to your level — say early if rounds feel too hard. Read <a href="/guides/is-muay-thai-safe-pattaya/">is Muay Thai safe?</a> and <a href="/guides/female-friendly-gyms-pattaya/">female-friendly gyms</a>. Fairtex, Battle Conquer, and Kombat Group routinely train solo women.</p>
  <h3>Commercial gyms &amp; yoga</h3>
  <p>Key-fob chains (<a href="/gyms/jetts-fitness-pattaya/">Jetts</a>, <a href="/gyms/anytime-fitness-pattaya/">Anytime</a>) suit early/late solo sessions. Yoga studios: <a href="/guides/yoga-retreat-pattaya/">yoga retreat guide</a>. Medical: <a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a>.</p>
</section>`,
  'pattaya-digital-nomad-fitness': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-dn-h">
  <h2 id="${MARKER}-dn-h" class="guide-rank-section">Fitness rhythm for remote workers</h2>
  <p>Pattaya nomads usually split the day: <strong>morning training before heat</strong>, cowork block midday, optional second session or pool recovery late afternoon. Wi-Fi cafés: <a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">Pattaya Coffee</a>.</p>
  <h3>Best areas for work + train</h3>
  <ul>
    <li><strong>Jomtien</strong> — quiet, beach, monthly gym deals; <a href="/guides/best-gym-jomtien-pattaya/">Jomtien guide</a>.</li>
    <li><strong>Pratamnak / Naklua</strong> — hilltop condos, Muscle Factory iron; <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua guide</a>.</li>
    <li><strong>Central</strong> — maximum gym density, worst sleep near nightlife; <a href="/guides/best-gym-central-pattaya/">Central guide</a>.</li>
  </ul>
  <h3>Visa &amp; long-stay training</h3>
  <p>ED visa through camps, tourist extensions, or elite routes — <a href="/guides/training-thailand-visa-pattaya/">training &amp; visa guide</a> and <a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a>. Month blocks: <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">1 week vs 1 month</a>.</p>
  <h3>Budget &amp; day passes</h3>
  <p>No monthly lock-in: <a href="/guides/gym-day-pass-pattaya/">gym day pass</a> · <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms table</a> · <a href="/compare/">compare venues</a>.</p>
</section>`,
  'luxury-sports-clubs-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-lux-h">
  <h2 id="${MARKER}-lux-h" class="guide-rank-section">When luxury clubs beat commercial gyms</h2>
  <p>Resort and private clubs sell <strong>pool + spa + tennis/padel + clean locker rooms</strong> — not max deadlift platforms. Pick them when recovery infrastructure matters as much as the treadmill.</p>
  <h3>Tiers in Pattaya</h3>
  <p><strong>Beach Road 5-star</strong> — <a href="/gyms/hilton-pattaya-fitness/">Hilton</a> infinity pool gym, central festival zone. <strong>Pratamnak hill</strong> — <a href="/gyms/fitz-club/">Fitz Club</a> at Royal Cliff, seven tennis courts, squash, swim. <strong>Na Jomtien south</strong> — <a href="/gyms/andaz-pattaya-jomtien/">Andaz</a> onsen wellness; see <a href="/guides/best-gym-sattahip-pattaya/">Sattahip &amp; Na Jomtien guide</a>.</p>
  <h3>Day passes &amp; hotel guests</h3>
  <p>Policies change seasonally — call front desk before assuming walk-in access. Compare with mid-tier chains on <a href="/guides/24-hour-gyms-pattaya/">24-hour gyms</a> if you train at 05:00 daily.</p>
  <p>Golf + club combo: <a href="/guides/best-golf-courses-pattaya/">best golf courses</a> · Padel: <a href="/guides/padel-pickleball-pattaya/">padel &amp; pickleball</a>.</p>
</section>`,
  'best-dive-operators-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-dive-h">
  <h2 id="${MARKER}-dive-h" class="guide-rank-section">Diving Pattaya — how operators differ</h2>
  <p>Pattaya is a <strong>training and fun-dive hub</strong>, not Similan liveaboard territory — but Koh Larn, wreck sites, and day boats run year-round. Operators differ on boat size, instructor ratio, equipment age, and English depth.</p>
  <h3>Where boats leave from</h3>
  <p>Central Bali Hai Pier and south-side marinas — many divers stay <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> or <a href="/guides/best-gym-sattahip-pattaya/">Na Jomtien</a> and taxi to pier. Combine dive days with hotel pool recovery on <a href="/guides/luxury-sports-clubs-pattaya/">luxury clubs</a> list.</p>
  <h3>Training + fitness same trip</h3>
  <p>Open-water courses are 3–4 day commitments — plan gym around confined-water sessions. Cross-training: <a href="/guides/best-for-beginners-pattaya/">best for beginners</a> (other sports) · <a href="/compare/">compare dive shops</a>.</p>
  <p>Koh Larn day trip venue: <a href="/gyms/koh-larn-coral-island/">Koh Larn Coral Island</a> · Watersports hub: <a href="/category/watersports/">all watersports</a>.</p>
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
console.log(`Round 45 ranked deepen: ${n} guides.`);
