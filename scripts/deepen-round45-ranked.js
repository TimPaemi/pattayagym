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
  <p>Public sources do not provide a defensible citywide incident rate for solo women training in Pattaya. Plan with facts that can be checked before paying: the exact access product, staffed arrival process, class format, operator contact and return route.</p>
  <h3>Compare areas by route and training product</h3>
  <p>Compare the exact route and training product instead of treating one district as universally quieter or safer. The <a href="/gyms/fairtex-pattaya/">Fairtex record</a> documents a resort-camp option in the Naklua corridor; other formats and access models appear in the area guides for <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a>, <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua and Pratamnak</a>, and <a href="/guides/best-gym-central-pattaya/">Central Pattaya</a>.</p>
  <h3>Confirm Muay Thai session conditions</h3>
  <p>Do not assume that a camp will scale pad power or partner work without being asked; state the required intensity and boundaries before the session. Read <a href="/guides/is-muay-thai-safe-pattaya/">is Muay Thai safe?</a> and <a href="/guides/female-friendly-gyms-pattaya/">female-friendly gyms</a>. The retained records for <a href="/gyms/fairtex-pattaya/">Fairtex</a>, <a href="/gyms/battle-conquer-gym/">Battle Conquer</a>, and <a href="/gyms/kombat-group-thailand/">Kombat Group</a> document named training products, but the listings do not establish individual suitability, the current group mix or a coaching arrangement for a particular booking.</p>
  <h3>Commercial-gym first-entry checks</h3>
  <p>The <a href="/gyms/jetts-fitness-pattaya/">Jetts</a> and <a href="/gyms/anytime-fitness-pattaya/">Anytime</a> records distinguish 24-hour member access from staffed visitor registration; neither access label guarantees immediate first entry. Arrange an initial visit while staff can confirm the product. Yoga studios: <a href="/guides/yoga-retreat-pattaya/">yoga retreat guide</a>.</p>
</section>`,
  'pattaya-digital-nomad-fitness': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-dn-h">
  <h2 id="${MARKER}-dn-h" class="guide-rank-section">Build a schedule from venue-specific evidence</h2>
  <p>Build a remote-work training day from the selected venue's published hours and actual class timetable. The directory does not evidence one typical schedule for Pattaya remote workers, and a broad business window does not prove that a coached session or pool is available throughout it.</p>
  <h3>Compare areas for work and training</h3>
  <ul>
    <li><strong>Jomtien</strong> — compare the documented access products and exact pins in the <a href="/guides/best-gym-jomtien-pattaya/">Jomtien guide</a>; an area label does not establish a monthly deal.</li>
    <li><strong>Pratamnak / Naklua</strong> — the <a href="/gyms/muscle-factory-pattaya/">Muscle Factory record</a> documents a bodybuilding-oriented equipment offer, while the <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua and Pratamnak guide</a> separates other access models.</li>
    <li><strong>Central</strong> — use the <a href="/guides/best-gym-central-pattaya/">Central guide</a> for current venue density and access evidence; the directory does not support a universal sleep-quality judgment.</li>
  </ul>
  <h3>Keep immigration eligibility separate from training purchases</h3>
  <p>A training purchase and immigration eligibility are separate questions; no camp listing by itself proves a visa route. Use the <a href="/guides/training-thailand-visa-pattaya/">training and visa guide</a> for the evidence limits, and compare month blocks in the <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">1 week versus 1 month guide</a>.</p>
  <h3>Confirm the named short-stay product</h3>
  <p>A day-pass listing does not prove that every branch offers contract-free entry on every date. Compare the named short-stay product and its current terms in the <a href="/guides/gym-day-pass-pattaya/">gym day-pass guide</a>, then check the <a href="/guides/cheapest-gyms-pattaya/">dated price table</a> and <a href="/compare/">venue records</a> without inferring a monthly commitment or waiver from the guide label.</p>
</section>`,
  'luxury-sports-clubs-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-lux-h">
  <h2 id="${MARKER}-lux-h" class="guide-rank-section">If you only read one thing</h2>
  <p><strong>“Luxury” does not prove public access.</strong> The retained sport records document three different products: an outside-guest club pass with a published tariff, a facility included for registered hotel guests, and a booked sport such as golf, sailing or equestrian activity. The “upper-tier” label is editorial rather than an operator classification. Compare the access model first because a facility list alone does not confirm that the intended visitor may enter.</p>

  <h2>The real trade-off: breadth, certainty or the sport itself</h2>
  <p><a href="/gyms/fitz-club/">Fitz Club</a> has the most explicit outside-access evidence among the retained rows: Royal Cliff publishes a 2026 outside-guest day pass and separately prices courts and coaching. That is an evidence comparison, not a service-quality ranking. <a href="/gyms/andaz-pattaya-jomtien/">Andaz Pattaya Jomtien Beach</a> and <a href="/gyms/pattaya-marriott-resort/">Pattaya Marriott Resort and Spa</a> publish broader resort amenities, but the checked operator pages describe them for registered hotel guests and do not publish a non-resident gym pass. The retained Siam Country Club and Laem Chabang records publish bookable rounds with named mandatory extras; that evidence should not be generalized to every golf club. Sailing, polo and tournament tennis remain contact-first in this comparison.</p>
  <p>The decision is therefore not “which club is most luxurious?” It is whether the trip needs one confirmed facilities day, accommodation with sport included, or access to a specific court, course, boat or horse. Comparing those products by the number of pools or stars hides the booking problem.</p>

  <div class="table-wrap">
  <table>
  <thead><tr><th>Venue</th><th>Access evidence</th><th>Current price evidence</th><th>Documented product context</th></tr></thead>
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
  <p><a href="/gyms/fitz-club/">Royal Cliff's current operator material</a> lists a gym, group-class studio, swimming pool, sauna, steam rooms, seven floodlit hard tennis courts, two air-conditioned squash courts, table tennis and a multipurpose court configurable for several sports. The facilities page and 2026 tariff also separate ordinary access from coaching and court hire.</p>
  <p>The <a href="/gyms/fitz-club/">outside-guest Fitz day pass</a> is <strong>฿800 per adult</strong> and <strong>฿400 for a child under 12</strong>, checked 25 July 2026. It covers the gym, pool, sauna and steam rooms but excludes tennis and squash. Personal training and private Thai boxing are each listed at ฿1,100 per hour. Every amount must be read with its named product: an ฿800 pass does not include a tennis court merely because courts exist on the property.</p>
  <p>The operator lists the gym, classes, sauna and steam from 07:00 to 21:00; racquet courts, multipurpose court and pool from 07:00 to 20:00. A visitor should still reserve any court or coach and ask whether towels, lockers, equipment, classes and child supervision are included. Within this retained comparison, Fitz has the clearest published outside-access product; that evidence does not establish service quality or make it the best choice for every visitor.</p>

  <h2>Hotel fitness: book the room, not an assumed day pass</h2>
  <p><a href="/gyms/andaz-pattaya-jomtien/">Andaz</a> publishes a 24-hour Technogym fitness centre, a separate yoga and stretching room, three pools and a rotating programme that includes yoga, Pilates, circuit work, aqua boxing, beach boot camp and basic Thai boxing on selected days. Hyatt describes those experiences as exclusive to registered guests. The basic Thai-boxing item is marked chargeable without displaying the amount, so even a hotel booking does not make every activity free.</p>
  <p><a href="/gyms/pattaya-marriott-resort/">Pattaya Marriott</a> publishes an included 24-hour fitness centre for guests plus three outdoor pools serving adult, family and child uses. No current operator non-resident gym or pool tariff was found. <a href="/gyms/hilton-pattaya-fitness/">Hilton Pattaya Fitness Centre</a> confirms a hotel gym, spa and 16th-floor infinity pool, but its checked pages publish neither a public pass nor current fitness-centre hours.</p>
  <p>These records document training as an accommodation amenity; they do not establish suitability for a particular traveller or support a recommendation to walk in from another hotel. The <a href="/guides/hotel-gym-pattaya/">hotel gym guide</a> covers the same access distinction in more detail. Ask reception about guest eligibility, room-key entry, age rules, pool hours and which scheduled sessions require booking or payment.</p>

  <h2>Golf: compare the mandatory stack, not the green fee</h2>
  <p><a href="/gyms/siam-country-club/">Siam Country Club</a> operates Old Course, Plantation, Waterside and Rolling Hills. Prices checked 26 July 2026 list the Old Course green fee at ฿6,500 weekday or ฿8,500 weekend and public holiday; the other three list ฿5,700 or ฿6,700. Every player must also take an individual ฿1,000 cart and a ฿500 caddie. Before tip or rental, the required total is therefore ฿8,000 or ฿10,000 at Old Course and ฿7,200 or ฿8,200 at the other three.</p>
  <p><a href="/gyms/laem-chabang-international/">Laem Chabang's public charge page</a> lists a lower mandatory stack. Its daytime green fee is ฿3,500 weekday or ฿4,000 weekend, with a ฿450 caddie and compulsory ฿980 buggy: ฿4,930 or ฿5,430 before tip. Night golf lists the ฿3,500 green fee on both weekday and weekend, plus the same caddie and buggy. A separate promotion checked 26 July lists stay-and-play from ฿4,080 per person for 1 April–30 September 2026, including a room, green fee, caddie and cart.</p>
  <p>The comparison is not a quality ranking. Siam offers four named course choices at a higher published stack; Laem Chabang offers 27 holes, day and night charges and a dated accommodation promotion. Both require confirmation of the selected date, course or loop, tee time, deposit, cancellation, rain and caddie-tip guidance. Use the <a href="/guides/best-golf-courses-pattaya/">Pattaya golf guide</a> when the course itself matters more than resort-style facilities.</p>

  <h2>Sailing, polo and tournament tennis are contact-first</h2>
  <p><a href="/gyms/royal-varuna-yacht-club/">Royal Varuna Yacht Club</a> publishes RYA youth and adult sailing courses, private tuition, Powerboat Level 2 and a current race calendar. It also lists a pool, lawn, private beachfront, restaurant and bar for members. The pages checked 25 July 2026 do not publish current membership fees or a complete training tariff. Ask whether a course is available to a non-member and what facility access the booking includes.</p>
  <p><a href="/gyms/thai-polo-equestrian-club/">Thai Polo &amp; Equestrian Club</a> documents a large competition complex with polo fields, practice fields, eventing facilities, stables and current competition use. Its ordinary riding, lesson, membership and event-access prices are not public. Business hours do not create walk-in horse access.</p>
  <p><a href="/gyms/greta-sport-club/">Greta Sport Club</a> has current 2026 federation evidence for tennis and beach tennis, but no current ordinary court, coaching, rental or membership tariff. Tournament use does not establish ordinary public availability. The three retained records support contact-first enquiries for named sports, but not a “right choice” judgment or an instant public-price comparison.</p>

  <h2>Booking questions raised by the evidence gaps</h2>
  <ul>
    <li>State whether every participant is a registered hotel guest, club member, outside visitor, child or spectator.</li>
    <li>Name the product: facilities pass, court, coaching, round, course, sailing lesson, event admission or membership.</li>
    <li>Request the all-in dated amount, including tax, service, caddie, cart, tip guidance, equipment, registration and deposits.</li>
    <li>Confirm the exact hours for that product. Hotel operation, fitness access, pool use and staffed reception can have different schedules.</li>
    <li>Ask about clothing, footwear, age, supervision, experience, handicap, certification or safety prerequisites.</li>
    <li>Obtain cancellation, weather, rescheduling, refund and no-show terms in writing.</li>
  </ul>
  <p>This retained comparison does not establish that a commercial gym is cheaper or clearer for every ordinary weights session. It does document a Fitz outside-guest product combining pool, wet-area and gym access, while golf, sailing and polo require their own named booking checks. The evidence does not rank surrounding facilities as primary or secondary for an individual trip. For accommodation-only comparisons, continue to the <a href="/guides/hotel-gym-pattaya/">hotel fitness guide</a>; for court products, use the <a href="/guides/tennis-badminton-pattaya/">tennis and badminton guide</a>.</p>
</section>`,
  'best-dive-operators-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-dive-h">
  <h2 id="${MARKER}-dive-h" class="guide-rank-section">Diving Pattaya — how operators differ</h2>
  <p>Pattaya's retained operator records document both training and certified-diver products, while <a href="/gyms/koh-larn-coral-island/">Koh Larn</a> is a separate informational destination record. Do not infer year-round departures, a particular wreck, boat size, instructor ratio, equipment assignment or teaching language from the area label; confirm each against the selected operator and date.</p>
  <h3>Confirm boat meeting and departure points</h3>
  <p>Do not infer a Bali Hai or south-side-marina departure from an operator's Pattaya address. Confirm the shop meeting point, boat departure point, transfer arrangement and return time for the selected date before choosing accommodation or transport. If hotel-pool access matters, compare the separately documented facilities on the <a href="/guides/luxury-sports-clubs-pattaya/">luxury clubs</a> list; neither a pool listing nor this guide establishes a recovery outcome between dive days.</p>
  <h3>Confirm course sequence before arranging other training</h3>
  <p>The retained course names do not establish a universal duration or daily sequence. Ask the operator how many dates the selected product uses and when its confined-water, open-water and classroom components occur before arranging other training. Cross-training: <a href="/guides/best-for-beginners-pattaya/">best for beginners</a> (other sports) · <a href="/compare/">compare dive shops</a>.</p>
  <p>Use the retained records for <a href="/gyms/pattaya-dive-centre/">Pattaya Dive Centre</a>, <a href="/gyms/adventure-divers-pattaya/">Adventure Divers</a> and <a href="/gyms/no-limit-divers/">No Limit Divers</a> to compare named courses and operator products. A listed course does not establish the boat, instructor ratio, equipment assignment or departure point for a particular booking, so confirm those details directly.</p>
  <p>Koh Larn day trip venue: <a href="/gyms/koh-larn-coral-island/">Koh Larn Coral Island</a> · Watersports hub: <a href="/category/watersports/">all watersports</a>.</p>
</section>`,
};

const FAQ_BLOCKS = {
  'luxury-sports-clubs-pattaya': `
  <section class="guide-faq" aria-labelledby="faq-h">
    <h2 id="faq-h">Common questions</h2>
    <details class="faq-item"><summary>Which Pattaya luxury sports venue has a verified outside-guest day pass?</summary><p><a href="/gyms/fitz-club/">Fitz Club at Royal Cliff</a> publishes a 2026 outside-guest pass at ฿800 per adult and ฿400 per child under 12, checked 25 July 2026. It includes the gym, pool, sauna and steam rooms but excludes tennis and squash.</p></details>
    <details class="faq-item"><summary>Can non-residents use the Andaz, Marriott or Hilton hotel gyms?</summary><p>No current public gym pass was found on the checked operator pages. <a href="/gyms/andaz-pattaya-jomtien/">Andaz</a> and <a href="/gyms/pattaya-marriott-resort/">Pattaya Marriott</a> describe fitness access for registered guests; <a href="/gyms/hilton-pattaya-fitness/">Hilton</a> confirms the amenity but does not publish a public pass. Obtain written date-specific confirmation before travelling from another hotel.</p></details>
    <details class="faq-item"><summary>Which is cheaper from the published golf totals: Siam Country Club or Laem Chabang?</summary><p><a href="/gyms/laem-chabang-international/">Laem Chabang's</a> required daytime green-fee, caddie and buggy stack is ฿4,930 weekday or ฿5,430 weekend. <a href="/gyms/siam-country-club/">Siam's</a> required green-fee, individual-cart and caddie stack begins at ฿7,200 weekday on Plantation, Waterside or Rolling Hills. Prices were checked 26 July 2026 and exclude caddie tips and optional rentals.</p></details>
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
