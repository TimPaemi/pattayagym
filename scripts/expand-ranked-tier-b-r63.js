#!/usr/bin/env node
/**
 * expand-ranked-tier-b-r63.js — Extra ranked editorial depth for Tier B guides (≥1200w target).
 * Inserts before #full-list; idempotent marker: deepen-r63-block
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'deepen-r63-block';

const BLOCKS = {
  'bangkok-day-trip-sport-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-bkk-h">
  <h2 id="${MARKER}-bkk-h" class="guide-rank-section">Bangkok day-trip logistics from Pattaya</h2>
  <p>Most Pattaya hotels and camps can book <strong>stadium transfer + ticket</strong> packages — you leave 14:00–16:00, watch fights 18:00–22:00, return after midnight. DIY: Grab/Bolt to Bangkok ฿1,200–1,800 one way depending on traffic; shared minibus from South Pattaya bus stations often cheaper but less flexible on return time.</p>
  <h3>Rajadamnern vs Lumpinee — pick your night</h3>
  <p><a href="/gyms/rajadamnern-stadium/">Rajadamnern</a> runs cards most nights — historic stadium, RWS series Saturdays. <a href="/gyms/lumpinee-boxing-stadium/">Lumpinee</a> (Ramintra) is the modern flagship — Friday/Saturday prestige cards. First-time viewers: Rajadamnern atmosphere is classic; Lumpinee production is slicker. Dress smart-casual; stadiums sell food and beer — pace yourself if you train next morning in Pattaya.</p>
  <h3>Golf day-trips</h3>
  <p>Bangkok fairways (Alpine, Thai Country Club belt) compete with Pattaya's own championship tracks — see <a href="/guides/best-golf-courses-pattaya/">Pattaya golf guide</a> before booking BKK tee times only for bragging rights. Early tee (06:30–07:00) beats traffic both directions. Cart and caddie fees are standard — budget tips in baht cash.</p>
  <h3>What not to do</h3>
  <ul>
    <li>Do not schedule hard Pattaya pad session the morning after a late Bangkok card — sleep debt + shins do not mix.</li>
    <li>Do not buy tickets from street touts outside venues — use camp desk, hotel concierge, or official RWS channels.</li>
    <li>Allow 2.5–3 hours return buffer after fights — Sukhumvit traffic at 23:00 is unpredictable.</li>
  </ul>
  <p>Camp context: <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a> · <a href="/guides/muay-thai-training-holiday-pattaya/">training holiday</a> · Transport: Vehicle Rentals.</p>
  <h3>Ticket tiers and seating</h3>
  <p>Ringside costs more but worth it once — further seats still deliver atmosphere. Arrive 45 minutes early for merchandise and fighter stare-downs. Bags may be searched — travel light. Children welcome at many cards but ear protection recommended close to ring.</p>
</section>`,
  '24-hour-gyms-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-24h-h">
  <h2 id="${MARKER}-24h-h" class="guide-rank-section">24-hour training rhythm in Pattaya heat</h2>
  <p>Split sessions work well: <strong>05:00–07:00 lift</strong>, cowork or beach 10:00–16:00, optional second cardio 21:00. Fighters on two-a-days often use 24h gyms only for weights on rest weeks — pads stay at camp rings.</p>
  <p>Membership vs day pass: monthly key-fob at <a href="/gyms/anytime-fitness-pattaya/">Anytime</a> or <a href="/gyms/jetts-fitness-pattaya/">Jetts</a> pays off after ~8 visits. Tourists under 10 days: <a href="/guides/gym-day-pass-pattaya/">day pass guide</a>. Budget iron that closes at 23:00: <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms</a>.</p>
  <h3>Equipment at 03:00</h3>
  <p>Chains keep lights and AC on; peak midnight crowd is smaller than 18:00 after-work rush. Bring headphones — some venues play Thai pop loudly. Respect re-rack rules; staff may be minimal overnight.</p>
</section>`,
  'luxury-sports-clubs-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-lux2-h">
  <h2 id="${MARKER}-lux2-h" class="guide-rank-section">Luxury club day — sample itinerary</h2>
  <p><strong>08:00</strong> hotel gym weights · <strong>10:00</strong> pool laps · <strong>12:00</strong> spa or onsen (Andaz) · <strong>15:00</strong> tennis or padel booking at <a href="/gyms/fitz-club/">Fitz Club</a> · <strong>18:00</strong> sunset swim. One venue rarely covers all — Fitz for racquet, Hilton for central Beach Road, Andaz for Jomtien south recovery.</p>
  <p>Compare total cost vs mid-tier chain + separate padel court — luxury wins on locker quality, towel service, and family-safe pools. Muay Thai still happens at dedicated camps: <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a>.</p>
</section>`,
  'best-for-beginners-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-beg2-h">
  <h2 id="${MARKER}-beg2-h" class="guide-rank-section">Beginner mistakes to avoid</h2>
  <p>Booking a month at a fighter-track gym before one trial day. Skipping mouthguard on first pad day. Training through dizziness in afternoon heat. Choosing central Pattaya hotel for "convenience" then sleeping through morning class after nightlife.</p>
  <p>Better path: one <a href="/guides/gym-day-pass-pattaya/">day pass</a> + one walk-in pad session + then pick area guide (<a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a>, <a href="/guides/best-gym-central-pattaya/">Central</a>, <a href="/guides/best-gym-east-pattaya/">East</a>). Muay Thai depth: <a href="/guides/muay-thai-pattaya-beginners/">MT beginners</a> · Safety: <a href="/guides/is-muay-thai-safe-pattaya/">is MT safe?</a></p>
</section>`,
  'family-friendly-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-fam2-h">
  <h2 id="${MARKER}-fam2-h" class="guide-rank-section">School holidays and rainy days</h2>
  <p>May–October afternoon storms push families indoors — Harbor Mall trampoline stack, Underwater World, or resort kids clubs. Book football academies (AF Academy, Rusich) for term-structure; holiday camps spike in October break.</p>
  <p>Parents training Muay Thai: morning session while kids swim at hotel pool, afternoon family beach — not both parents in evening sparring same day kids need supervision. Kids sport hub: <a href="/guides/kids-youth-sport-pattaya/">kids &amp; youth guide</a> · Childcare: <a href="/guides/pattaya-gyms-childcare-family-pools/">childcare &amp; pools</a>.</p>
</section>`,
  'best-dive-operators-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-dive2-h">
  <h2 id="${MARKER}-dive2-h" class="guide-rank-section">Choosing PADI vs SSI shop</h2>
  <p>Both certify Open Water globally. PADI dominates marketing; SSI shops like <a href="/gyms/dive-station-pattaya/">Dive Station</a> suit flexible online theory. IDC-heavy shops (Aquanauts, Mermaid's) matter if you might become an instructor — not for a one-week holiday try-dive.</p>
  <p>Ask: boat size, diver-to-guide ratio, equipment age, refund policy on weather cancellation. Wreck dives need advanced cert — do not book HTMS Khram penetration on holiday Open Water. Broader watersport map: <a href="/guides/diving-watersports-pattaya/">diving &amp; watersports guide</a>.</p>
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
    console.log(`  /guides/${slug}/ +r63 depth`);
  }
}
console.log(`Round 63 ranked Tier B expand: ${n} guides.`);
