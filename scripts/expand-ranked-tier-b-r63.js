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
  <p>Treat this guide as a <strong>date-and-finish-time</strong> decision before it becomes a transport decision. The current Lumpinee listing supports Friday ONE cards from 18:30 to 23:30 and Saturday Super Champ from 18:30 to 21:00, while Rajadamnern's current calendar supports different gate times and card formats by day. That means the return problem changes with the exact card even before Bangkok traffic enters the calculation.</p>
  <h3>Rajadamnern vs Lumpinee — pick your night</h3>
  <p><a href="/gyms/rajadamnern-stadium/">Rajadamnern</a> is the better fit when the chosen date and Bangkok day are already centred around the old-city side of the capital. <a href="/gyms/lumpinee-boxing-stadium/">Lumpinee</a> is the cleaner fit when the card itself is the destination and the traveller is willing to plan around Ramintra Road rather than central Bangkok. The practical distinction is not romance versus production; it is exact location, exact event window and whether a same-night Pattaya return is still realistic once the card ends.</p>
  <h3>Golf day-trips</h3>
  <p>The same discipline applies to golf. Compare a Bangkok-area round against the current <a href="/guides/best-golf-courses-pattaya/">Pattaya golf guide</a> only after the exact tee time, course stack and transport plan are confirmed. A day-trip course can still be the right call, but it should win on the whole day product rather than on the course name alone.</p>
  <h3>What not to do</h3>
  <ul>
    <li>Do not assume every Bangkok fight night is a same-shape 18:00-22:00 trip.</li>
    <li>Do not build a Pattaya return around a late card until the exact driver, bus or overnight plan exists in writing.</li>
    <li>Do not compare a Bangkok stadium ticket with a Pattaya training class as if they were the same Muay Thai purchase.</li>
  </ul>
  <p>Camp context: <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a> · <a href="/guides/muay-thai-training-holiday-pattaya/">training holiday</a> · Longer commitment logic: <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">1 week vs 1 month</a>.</p>
  <h3>Ticket tiers and seating</h3>
  <p>Use the official seating map and event page for the chosen date. A cheaper upper tier can still be the right purchase if the trip is really about seeing a current Bangkok card from Pattaya rather than maximising one prestige night. Ringside, club and grandstand are not just price differences; they change how early you need to arrive, how you handle bags and how much of the night budget remains for the return plan.</p>
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
  <h2 id="${MARKER}-lux2-h" class="guide-rank-section">Build one day from confirmed access</h2>
  <p>A non-resident can build a facilities day around <a href="/gyms/fitz-club/">Fitz Club</a> because the operator publishes the access product: gym, pool, sauna and steam under the outside-guest pass, with courts and coaching priced separately. Confirm the dated pass, chosen facility hours, towel and locker terms, then reserve any court or instructor before planning the rest of the day.</p>
  <p>Andaz, Pattaya Marriott and Hilton solve a different problem. Their operator pages establish hotel fitness or pool amenities, but no current public facility pass was found. Book them when the room and guest access are the product; do not construct a non-resident itinerary from the amenity list. If the only requirement is weights or cardio, compare an ordinary <a href="/guides/gym-day-pass-pattaya/">gym day pass</a> before paying for a resort stay.</p>
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
  <h2 id="${MARKER}-dive2-h" class="guide-rank-section">Choose the operator by the exact dive product</h2>
  <p>A Discover Scuba day, an Open Water course and a certified-diver boat day are different purchases even when the same shop sells all three. <a href="/gyms/adventure-divers-pattaya/">Adventure Divers</a> is now a good example: its current operator page separates passenger, Discover Scuba, certified-diver and course products with different inclusions and prices. That makes the booking more useful than a generic label such as "PADI 5 Star" on its own.</p>
  <p><a href="/gyms/dive-station-pattaya/">Dive Station</a> remains the SSI-centred comparison point in this guide, while shops such as <a href="/gyms/pattaya-dive-centre/">Pattaya Dive Centre</a>, <a href="/gyms/no-limit-divers/">No Limit Divers</a> and Adventure Divers publish stronger current public product tables for PADI-led buyers. The better question is not "PADI or SSI?" by itself. It is "which exact product, with which inclusions, from which pickup zone, on which date?"</p>
  <p>Ask for the whole written product: boat day, gear, dive computer, pickup, lunch, park fees, certification materials, photo add-ons, weather-change policy and minimum participant conditions. Broader watersport context: <a href="/guides/diving-watersports-pattaya/">diving &amp; watersports guide</a>.</p>
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
  html = html.replace(/[ \t]+(?=\r?\n)/g, '');
  fs.writeFileSync(fp, html, 'utf8');
  return true;
}

let n = 0;
const onlyArg = process.argv.find((arg) => arg.startsWith('--guide-only='));
const onlySlug = onlyArg ? onlyArg.slice('--guide-only='.length) : '';
const selectedBlocks = onlySlug ? Object.entries(BLOCKS).filter(([slug]) => slug === onlySlug) : Object.entries(BLOCKS);
if (onlySlug && selectedBlocks.length === 0) throw new Error(`Unknown guide slug: ${onlySlug}`);
for (const [slug, block] of selectedBlocks) {
  if (inject(slug, block)) {
    n++;
    console.log(`  /guides/${slug}/ +r63 depth`);
  }
}
console.log(`Round 63 ranked Tier B expand: ${n} guides.`);
