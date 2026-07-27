#!/usr/bin/env node
/**
 * deepen-round43-ranked.js — Editorial depth blocks for 24-hour and cheapest ranked guides.
 * Idempotent marker: deepen-r43-block
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'deepen-r43-block';

const BLOCKS = {
  '24-hour-gyms-pattaya': `
<section class="guide-rank-primer" id="guide-rank-primer" aria-labelledby="${MARKER}-24h-h">
  <h2 id="${MARKER}-24h-h" class="guide-rank-section">If you only read one thing</h2>
  <p><strong>“24 hours” describes an access window, not necessarily a staffed reception or a public walk-in policy.</strong> Jetts and Anytime describe 24-hour member access, while their staffed hours are narrower. Fitness 7 publishes 24-hour operation, but this research pass did not find a current public price, a current day-pass rule or an owner statement that reception is staffed all night. A traveller arriving at 03:00 should not assume that a new membership, trial or one-off entry can be arranged then.</p>
  <p>This guide therefore separates three products that are often mixed together: round-the-clock member access at a commercial gym, a locally listed 24-hour independent gym, and a hotel fitness room available to registered guests. The right option depends less on the words “24/7” than on whether you already hold the required access credential.</p>

  <h2>Current options and the missing information</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Venue</th><th>Published access</th><th>What is verified</th><th>What still needs confirmation</th></tr></thead>
      <tbody>
        <tr><td><a href="/gyms/jetts-fitness-pattaya/">Jetts Fitness Pattaya</a></td><td>24-hour member access</td><td>Little Walk is the current Pattaya club. Staffed hours are Monday–Friday 06:00–22:00 and weekends/public holidays 08:00–20:00.</td><td>Current Pattaya joining price, visitor pass availability, key-card issue and whether a first visit can start outside staffed hours.</td></tr>
        <tr><td><a href="/gyms/anytime-fitness-pattaya/">Anytime Fitness Pattaya</a></td><td>24-hour member access</td><td>Two Pattaya-area branches are recorded; staffed hours vary by branch.</td><td>Current local tariff, any trial offer, enrolment fee, visitor entry and the exact branch reception window.</td></tr>
        <tr><td><a href="/gyms/fitness-7/">Fitness 7 Pattaya</a></td><td>Published as open 24 hours</td><td>The Avenue location describes a training floor over 2,000 sqm with cardio, resistance and free-weight equipment, a boxing ring, functional space and classes.</td><td>Current price, public day pass, overnight reception coverage, entry method, towel/locker terms and class timetable.</td></tr>
        <tr><td><a href="/gyms/james-gym-pattaya/">James Gym Pattaya</a></td><td>Maps and owner social profiles show 24 hours</td><td>The independent gym is represented by a live Maps record and owner social presence.</td><td>Current rates, overnight access procedure, staff coverage, complete equipment inventory and air-conditioning.</td></tr>
      </tbody>
    </table>
  </div>
  <p>No current public visitor price was found for those four 24-hour gym options during this check on 26 July 2026. A blank price is not evidence of free entry. Contact the exact branch during staffed hours and request the total amount, including any registration fee, key-card deposit or short-stay restriction.</p>

  <h2>Commercial gym, independent gym or hotel fitness room?</h2>
  <p><strong>Commercial chains</strong> are the clearest fit for someone who already has a valid member credential or can enrol during reception hours. Jetts publishes the sharpest distinction between 24-hour access and staffed hours. Anytime also separates member access from branch-specific staffed hours. Neither record supports promising a first-time traveller a 03:00 walk-in.</p>
  <p><strong>Fitness 7</strong> publishes the most detailed equipment outline among the central 24-hour candidates, which makes it a useful shortlist choice for strength, cardio and boxing-space needs. Its unresolved item is not the advertised operating window; it is the commercial access detail. Confirm the day-pass or membership price and how entry works before building a late-night plan around it.</p>
  <p><strong>James Gym</strong> is the independent alternative, but the current public record is thinner. Treat it as a lead to verify, not a guaranteed substitute for a chain. Ask for a written reply covering price, exact overnight entry, staff presence and the equipment you need.</p>
  <p><strong>Hotel fitness rooms</strong> solve a different problem. Andaz Pattaya Jomtien publishes a 24-hour fitness facility and a staffed window of 07:00–21:00, but the facility is for hotel guests and no public day pass was found. Pattaya Marriott and Mövenpick also publish 24-hour fitness facilities; no current public-gym pass was found for either. Unless the hotel confirms otherwise, treat these as accommodation amenities, not public gyms. Compare hotel-based choices in the <a href="/guides/luxury-sports-clubs-pattaya/">luxury sports club guide</a>.</p>

  <h2>A priced fallback if midnight access is optional</h2>
  <p>If a verified price matters more than training after 22:00, <a href="/gyms/coco-fitness/">Coco Fitness</a> publishes a current membership menu but closes at 22:00. On 26 July 2026 its owner page listed ฿1,599 for one month, ฿4,299 for three months, ฿8,299 for six and ฿12,999 for twelve; it also advertised a ฿2,998 couple promotion. Coco is on the fourth floor of Mike Shopping Mall and describes a training area over 1,000 sqm with machines, free weights, cardio, stretching and boxing facilities. The trade-off is explicit: known membership prices and defined daily hours versus an overnight window whose visitor price must be requested elsewhere.</p>
  <p><a href="/gyms/castra-gym/">Castra Gym</a> is a second priced fallback if the real need is a late-but-not-overnight training plan plus combat classes. Its fight-club page checked on 27 July 2026 listed Muay Thai group sessions at 09:00-10:00 and 17:30-18:30 on weekdays, BJJ on Monday, Wednesday and Friday from 19:00-20:00, ฿300 for one group class, ฿2,500 for ten classes valid for two months and ฿600 for a private class, with gym access included. That is not a 24-hour answer, but it is a current published alternative for a reader who values a known class price over a vague overnight-access promise.</p>

  <h2>Checklist before relying on a 03:00 session</h2>
  <ul>
    <li>Ask whether 24-hour access applies to all members, only certain plans, hotel guests or existing international members.</li>
    <li>Confirm the reception hours and complete enrolment, identity checks and key-card collection while staff are present.</li>
    <li>Request the full short-stay cost: pass or membership, joining fee, access-card deposit, cancellation terms and accepted payment method.</li>
    <li>Confirm overnight entry, exit and parking for the exact branch; do not infer them from another branch of the same chain.</li>
    <li>Ask whether lockers, showers, towels, air-conditioning and the equipment you need remain available overnight.</li>
    <li>Save the venue’s current phone number and live Maps pin before leaving your accommodation.</li>
  </ul>
  <p>For a single daytime or evening visit, the <a href="/guides/gym-day-pass-pattaya/">gym day-pass guide</a> may produce a better match. For central location trade-offs, use the <a href="/guides/best-gym-central-pattaya/">Central Pattaya gym guide</a>. Prices, visitor access and staffing can change independently of the advertised opening window, so reconfirm all three with the exact venue.</p>
</section>`,
  'cheapest-gyms-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-cheap-h">
  <h2 id="${MARKER}-cheap-h" class="guide-rank-section">How to read Pattaya gym pricing</h2>
  <p>Pattaya uses four tiers in our directory: ฿ (budget), ฿฿ (mid), ฿฿฿ (premium camp/resort), ฿฿฿฿ (luxury hotel). The table below shows parsed drop-in and monthly figures where venues publish them — always confirm at the gym; seasonal tourist rates shift.</p>
  <h3>Free and nearly-free options</h3>
  <ul>
    <li><a href="/gyms/pratumnak-fitness-park/">Pratumnak Fitness Park</a> — outdoor calisthenics, free.</li>
    <li><a href="/gyms/pattaya-public-pool-jomtien/">Jomtien Public Pool</a> and <a href="/gyms/pattaya-public-pool-naklua/">Naklua Public Pool</a> — municipal swim access, low entry fee.</li>
    <li>Beach running — Jomtien and Wong Amat at sunrise; see <a href="/guides/best-gym-jomtien-pattaya/">Jomtien guide</a>.</li>
  </ul>
  <h3>Best value monthly memberships</h3>
  <p><a href="/gyms/tonys-gym/">Tony's Gym</a> and <a href="/gyms/sun-fitness-buakao/">SUN Fitness</a> (multi-branch) anchor the ฿ tier for serious lifters. <a href="/gyms/wko-muay-thai/">WKO Muay Thai</a> remains the benchmark ~฿4,000/month Muay Thai value in central Pattaya — compare with resort camps in <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a>.</p>
  <h3>Hidden costs to ask about</h3>
  <p>Locker deposit, towel rental, air-con surcharge at some mall gyms, and "registration fee" on first visit. <a href="/guides/thai-gym-terms-pattaya/">Thai gym terms</a> covers price questions (<em>tao rai?</em>). Short-stay without monthly commitment: <a href="/guides/gym-day-pass-pattaya/">gym day pass guide</a>.</p>
  <p>Area-specific budget picks: <a href="/guides/best-gym-central-pattaya/">Central Pattaya</a> · <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua &amp; Pratamnak</a> · <a href="/compare/">Compare side-by-side</a>.</p>
</section>`,
};

const FAQ_BLOCKS = {
  '24-hour-gyms-pattaya': `
  <section class="guide-faq" aria-labelledby="faq-h">
    <h2 id="faq-h" style="font-size: 1.4rem; margin-bottom: 18px;">Common questions</h2>
    <details class="faq-item"><summary>Can a first-time visitor walk into a Pattaya gym at 03:00?</summary><p>Do not assume so. Jetts and Anytime publish 24-hour member access, while staffed enrolment hours are narrower. Fitness 7 publishes 24-hour operation, but no current owner statement confirming overnight reception or first-visit entry was found. Arrange access with the exact branch during staffed hours.</p></details>
    <details class="faq-item"><summary>Which 24-hour Pattaya gym publishes a current visitor price?</summary><p>No current public visitor price was found for Jetts, Anytime, Fitness 7 or James Gym during the 26 July 2026 check. Coco Fitness publishes memberships from ฿1,599 for one month, but it closes at 22:00 and is included only as a priced non-24-hour fallback.</p></details>
    <details class="faq-item"><summary>Are Pattaya hotel gyms with 24-hour fitness open to the public?</summary><p>Treat them as guest facilities unless the hotel confirms a public pass. Andaz identifies its 24-hour fitness room as a hotel-guest amenity. Pattaya Marriott and Mövenpick publish 24-hour fitness facilities, but no current public-gym pass was found for either.</p></details>
  </section>`
};

function inject(slug, block) {
  const fp = path.join(ROOT, 'guides', slug, 'index.html');
  if (!fs.existsSync(fp)) {
    console.warn(`  skip ${slug} — missing`);
    return false;
  }
  let html = fs.readFileSync(fp, 'utf8');
  if (slug === '24-hour-gyms-pattaya' && html.includes('<section class="guide-rank-primer"')) {
    html = html.replace(/<section class="guide-rank-primer"[\s\S]*?<\/section>/m, block.trim());
  } else if (html.includes(MARKER)) {
    html = html.replace(new RegExp(`<section class="guide-editorial-depth" id="${MARKER}"[\\s\\S]*?</section>`, 'm'), block.trim());
  } else {
    const anchor = '<div id="full-list"></div>';
    if (!html.includes(anchor)) {
      console.warn(`  skip ${slug} — anchor missing`);
      return false;
    }
    html = html.replace(anchor, block + '\n  ' + anchor);
  }
  if (FAQ_BLOCKS[slug]) {
    if (!html.includes('<section class="guide-faq"')) {
      console.warn(`  skip ${slug} FAQ — anchor missing`);
      return false;
    }
    html = html.replace(/<section class="guide-faq"[\s\S]*?<\/section>/m, FAQ_BLOCKS[slug].trim());
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
console.log(`Round 43 ranked deepen: ${n} guides.`);
