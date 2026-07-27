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
  <p>Key-fob chains (<a href="/gyms/jetts-fitness-pattaya/">Jetts</a>, <a href="/gyms/anytime-fitness-pattaya/">Anytime</a>) suit early/late solo sessions. Yoga studios: <a href="/guides/yoga-retreat-pattaya/">yoga retreat guide</a>. Medical: Pattaya Medical.</p>
</section>`,
  'pattaya-digital-nomad-fitness': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-dn-h">
  <h2 id="${MARKER}-dn-h" class="guide-rank-section">Fitness rhythm for remote workers</h2>
  <p>Pattaya nomads usually split the day: <strong>morning training before heat</strong>, cowork block midday, optional second session or pool recovery late afternoon. Wi-Fi cafés: Pattaya Coffee.</p>
  <h3>Best areas for work + train</h3>
  <ul>
    <li><strong>Jomtien</strong> — quiet, beach, monthly gym deals; <a href="/guides/best-gym-jomtien-pattaya/">Jomtien guide</a>.</li>
    <li><strong>Pratamnak / Naklua</strong> — hilltop condos, Muscle Factory iron; <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua guide</a>.</li>
    <li><strong>Central</strong> — maximum gym density, worst sleep near nightlife; <a href="/guides/best-gym-central-pattaya/">Central guide</a>.</li>
  </ul>
  <h3>Visa &amp; long-stay training</h3>
  <p>ED visa through camps, tourist extensions, or elite routes — <a href="/guides/training-thailand-visa-pattaya/">training &amp; visa guide</a> and Pattaya Visa Help. Month blocks: <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">1 week vs 1 month</a>.</p>
  <h3>Budget &amp; day passes</h3>
  <p>No monthly lock-in: <a href="/guides/gym-day-pass-pattaya/">gym day pass</a> · <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms table</a> · <a href="/compare/">compare venues</a>.</p>
</section>`,
  'luxury-sports-clubs-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-lux-h">
  <h2 id="${MARKER}-lux-h" class="guide-rank-section">If you only read one thing</h2>
  <p><strong>“Luxury” does not prove public access.</strong> Pattaya's upper-tier sport records split into three products: an outside-guest club pass with a published tariff, a facility included for registered hotel guests, and a booked sport such as golf, sailing or equestrian activity. Choose the access model first. A longer facility list is useless when the operator has not confirmed that the intended visitor may enter.</p>

  <h2>The real trade-off: breadth, certainty or the sport itself</h2>
  <p><a href="/gyms/fitz-club/">Fitz Club</a> offers the strongest public-access evidence. Royal Cliff publishes a 2026 outside-guest day pass and separately prices courts and coaching. <a href="/gyms/andaz-pattaya-jomtien/">Andaz Pattaya Jomtien Beach</a> and <a href="/gyms/pattaya-marriott-resort/">Pattaya Marriott Resort and Spa</a> publish broader resort amenities, but the checked operator pages describe them for registered hotel guests and do not publish a non-resident gym pass. Golf clubs publish bookable rounds with transparent mandatory extras, while sailing, polo and tournament tennis remain contact-first.</p>
  <p>The decision is therefore not “which club is most luxurious?” It is whether the trip needs one confirmed facilities day, accommodation with sport included, or access to a specific court, course, boat or horse. Comparing those products by the number of pools or stars hides the booking problem.</p>

  <div class="table-wrap">
  <table>
  <thead><tr><th>Venue</th><th>Access evidence</th><th>Current price evidence</th><th>Best fit</th></tr></thead>
  <tbody>
  <tr><td><a href="/gyms/fitz-club/">Fitz Club</a></td><td>Explicitly open to outside guests; pass excludes tennis and squash</td><td>฿800 adult and ฿400 child under 12, operator PDF checked 25 July 2026</td><td>One facilities day with gym, pool, sauna and steam</td></tr>
  <tr><td><a href="/gyms/andaz-pattaya-jomtien/">Andaz Pattaya Jomtien Beach</a></td><td>Fitness and activity programme described as guest-exclusive</td><td>No current non-resident gym or pool pass found on 26 July 2026</td><td>Registered guests wanting varied resort activities</td></tr>
  <tr><td><a href="/gyms/pattaya-marriott-resort/">Pattaya Marriott Resort and Spa</a></td><td>24-hour fitness centre and three pools described for hotel guests</td><td>No current non-resident facility tariff found on 26 July 2026</td><td>Accommodation-led fitness in Na Jomtien</td></tr>
  <tr><td><a href="/gyms/siam-country-club/">Siam Country Club</a></td><td>Reserved round at one of four named courses</td><td>Required green fee, cart and caddie stack from ฿7,200 weekday; checked 26 July 2026</td><td>Course-first golf day with explicit mandatory charges</td></tr>
  <tr><td><a href="/gyms/laem-chabang-international/">Laem Chabang</a></td><td>Advance-booked day or night golf</td><td>Required daytime stack ฿4,930 weekday or ฿5,430 weekend; checked 26 July 2026</td><td>Lower published full-round stack and a night-golf enquiry</td></tr>
  <tr><td><a href="/gyms/royal-varuna-yacht-club/">Royal Varuna Yacht Club</a></td><td>Member club with training enquiries and current sailing programme</td><td>No current public membership or training tariff found on 25 July 2026</td><td>Someone prioritising sailing instruction or club participation</td></tr>
  </tbody>
  </table>
  </div>

  <h2>Fitz Club: the clearest outside-guest product</h2>
  <p>Royal Cliff's current operator material lists a gym, group-class studio, swimming pool, sauna, steam rooms, seven floodlit hard tennis courts, two air-conditioned squash courts, table tennis and a multipurpose court configurable for several sports. The facilities page and 2026 tariff also separate ordinary access from coaching and court hire.</p>
  <p>The outside-guest Fitz day pass is <strong>฿800 per adult</strong> and <strong>฿400 for a child under 12</strong>, checked 25 July 2026. It covers the gym, pool, sauna and steam rooms but excludes tennis and squash. Personal training and private Thai boxing are each listed at ฿1,100 per hour. Every amount must be read with its named product: an ฿800 pass does not include a tennis court merely because courts exist on the property.</p>
  <p>The operator lists the gym, classes, sauna and steam from 07:00 to 21:00; racquet courts, multipurpose court and pool from 07:00 to 20:00. A visitor should still reserve any court or coach and ask whether towels, lockers, equipment, classes and child supervision are included. Fitz is the strongest choice when outside access must be confirmed before leaving the hotel.</p>

  <h2>Hotel fitness: book the room, not an assumed day pass</h2>
  <p>Andaz publishes a 24-hour Technogym fitness centre, a separate yoga and stretching room, three pools and a rotating programme that includes yoga, Pilates, circuit work, aqua boxing, beach boot camp and basic Thai boxing on selected days. Hyatt describes those experiences as exclusive to registered guests. The basic Thai-boxing item is marked chargeable without displaying the amount, so even a hotel booking does not make every activity free.</p>
  <p>Pattaya Marriott publishes an included 24-hour fitness centre for guests plus three outdoor pools serving adult, family and child uses. No current operator non-resident gym or pool tariff was found. <a href="/gyms/hilton-pattaya-fitness/">Hilton Pattaya Fitness Centre</a> confirms a hotel gym, spa and 16th-floor infinity pool, but its checked pages publish neither a public pass nor current fitness-centre hours.</p>
  <p>These records suit travellers who want training to be an amenity of accommodation. They do not support a recommendation to walk in from another hotel. The <a href="/guides/hotel-gym-pattaya/">hotel gym guide</a> covers the same access distinction in more detail. Ask reception about guest eligibility, room-key entry, age rules, pool hours and which scheduled sessions require booking or payment.</p>

  <h2>Golf: compare the mandatory stack, not the green fee</h2>
  <p>Siam Country Club operates Old Course, Plantation, Waterside and Rolling Hills. Prices checked 26 July 2026 list the Old Course green fee at ฿6,500 weekday or ฿8,500 weekend and public holiday; the other three list ฿5,700 or ฿6,700. Every player must also take an individual ฿1,000 cart and a ฿500 caddie. Before tip or rental, the required total is therefore ฿8,000 or ฿10,000 at Old Course and ฿7,200 or ฿8,200 at the other three.</p>
  <p>Laem Chabang's public charge page lists a lower mandatory stack. Its daytime green fee is ฿3,500 weekday or ฿4,000 weekend, with a ฿450 caddie and compulsory ฿980 buggy: ฿4,930 or ฿5,430 before tip. Night golf lists the ฿3,500 green fee on both weekday and weekend, plus the same caddie and buggy. A separate promotion checked 26 July lists stay-and-play from ฿4,080 per person for 1 April–30 September 2026, including a room, green fee, caddie and cart.</p>
  <p>The comparison is not a quality ranking. Siam offers four named course choices at a higher published stack; Laem Chabang offers 27 holes, day and night charges and a dated accommodation promotion. Both require confirmation of the selected date, course or loop, tee time, deposit, cancellation, rain and caddie-tip guidance. Use the <a href="/guides/best-golf-courses-pattaya/">Pattaya golf guide</a> when the course itself matters more than resort-style facilities.</p>

  <h2>Sailing, polo and tournament tennis are contact-first</h2>
  <p><a href="/gyms/royal-varuna-yacht-club/">Royal Varuna Yacht Club</a> publishes RYA youth and adult sailing courses, private tuition, Powerboat Level 2 and a current race calendar. It also lists a pool, lawn, private beachfront, restaurant and bar for members. The pages checked 25 July 2026 do not publish current membership fees or a complete training tariff. Ask whether a course is available to a non-member and what facility access the booking includes.</p>
  <p><a href="/gyms/thai-polo-equestrian-club/">Thai Polo &amp; Equestrian Club</a> documents a large competition complex with polo fields, practice fields, eventing facilities, stables and current competition use. Its ordinary riding, lesson, membership and event-access prices are not public. Business hours do not create walk-in horse access.</p>
  <p><a href="/gyms/greta-sport-club/">Greta Sport Club</a> has current 2026 federation evidence for tennis and beach tennis, but no current ordinary court, coaching, rental or membership tariff. Tournament use can reduce public availability. These three records may be the right luxury-sport choice when the sport is non-negotiable, but they are poor choices for someone who needs an instant public price.</p>

  <h2>How to book without paying for the wrong product</h2>
  <ul>
    <li>State whether every participant is a registered hotel guest, club member, outside visitor, child or spectator.</li>
    <li>Name the product: facilities pass, court, coaching, round, course, sailing lesson, event admission or membership.</li>
    <li>Request the all-in dated amount, including tax, service, caddie, cart, tip guidance, equipment, registration and deposits.</li>
    <li>Confirm the exact hours for that product. Hotel operation, fitness access, pool use and staffed reception can have different schedules.</li>
    <li>Ask about clothing, footwear, age, supervision, experience, handicap, certification or safety prerequisites.</li>
    <li>Obtain cancellation, weather, rescheduling, refund and no-show terms in writing.</li>
  </ul>
  <p>Someone wanting an ordinary weights session may get a clearer and cheaper product from a commercial gym. Someone wanting a combined pool, wet-area and gym day has a verified Fitz option. Someone building the trip around golf, sailing or polo should book the sport first and treat the surrounding facilities as secondary. For accommodation-only comparisons, continue to the <a href="/guides/hotel-gym-pattaya/">hotel fitness guide</a>; for court products, use the <a href="/guides/tennis-badminton-pattaya/">tennis and badminton guide</a>.</p>
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

const FAQ_BLOCKS = {
  'luxury-sports-clubs-pattaya': `
  <section class="guide-faq" aria-labelledby="faq-h">
    <h2 id="faq-h">Common questions</h2>
    <details class="faq-item"><summary>Which Pattaya luxury sports venue has a verified outside-guest day pass?</summary><p>Fitz Club at Royal Cliff publishes a 2026 outside-guest pass at ฿800 per adult and ฿400 per child under 12, checked 25 July 2026. It includes the gym, pool, sauna and steam rooms but excludes tennis and squash.</p></details>
    <details class="faq-item"><summary>Can non-residents use the Andaz, Marriott or Hilton hotel gyms?</summary><p>No current public gym pass was found on the checked operator pages. Andaz and Pattaya Marriott describe fitness access for registered guests; Hilton confirms the amenity but does not publish a public pass. Obtain written date-specific confirmation before travelling from another hotel.</p></details>
    <details class="faq-item"><summary>Which is cheaper from the published golf totals: Siam Country Club or Laem Chabang?</summary><p>Laem Chabang's required daytime green-fee, caddie and buggy stack is ฿4,930 weekday or ฿5,430 weekend. Siam's required green-fee, individual-cart and caddie stack begins at ฿7,200 weekday on Plantation, Waterside or Rolling Hills. Prices were checked 26 July 2026 and exclude caddie tips and optional rentals.</p></details>
  </section>`
};

const TLDR_BLOCKS = {
  'luxury-sports-clubs-pattaya': `
  <section class="tldr" aria-labelledby="tldr-h">
    <h2 id="tldr-h" class="tldr-title">Quick answer — choose by access</h2>
    <ol class="tldr-list">
      <li><strong><a href="/gyms/fitz-club/">Outside-guest facilities day</a></strong> — Fitz Club has the current published pass; courts are separate.</li>
      <li><strong><a href="/gyms/andaz-pattaya-jomtien/">Hotel fitness stay</a></strong> — Andaz and Pattaya Marriott publish guest amenities, not a public gym pass.</li>
      <li><strong><a href="/gyms/laem-chabang-international/">Booked sport</a></strong> — compare the full golf cost stack, or contact sailing, polo and tennis clubs for the named product.</li>
    </ol>
    <p class="tldr-footnote">Prices and access were checked 25–26 July 2026. <a href="#full-list">Continue to the directory records →</a></p>
  </section>`
};

function inject(slug, block) {
  const fp = path.join(ROOT, 'guides', slug, 'index.html');
  if (!fs.existsSync(fp)) return false;
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes(MARKER)) {
    const standalone = new RegExp(`<section class="guide-editorial-depth" id="${MARKER}"[\\s\\S]*?</section>`, 'm');
    if (standalone.test(html)) {
      html = html.replace(standalone, block.trim());
    } else {
      html = html.replace(/<section class="guide-rank-primer"[\s\S]*?<\/section>/m, block.trim());
    }
  } else {
    const anchor = '<div id="full-list"></div>';
    if (!html.includes(anchor)) return false;
    html = html.replace(anchor, block + '\n  ' + anchor);
  }
  if (FAQ_BLOCKS[slug]) {
    if (!html.includes('<section class="guide-faq"')) return false;
    html = html.replace(/<section class="guide-faq"[\s\S]*?<\/section>/m, FAQ_BLOCKS[slug].trim());
  }
  if (TLDR_BLOCKS[slug]) {
    if (!html.includes('<section class="tldr"')) return false;
    html = html.replace(/<section class="tldr"[\s\S]*?<\/section>/m, TLDR_BLOCKS[slug].trim());
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
    console.log(`  /guides/${slug}/ deepened`);
  }
}
console.log(`Round 45 ranked deepen: ${n} guides.`);
