#!/usr/bin/env node
/**
 * write-round37-guides.js — Round 37 editorial SEO guides (10 pages).
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');
const bestGymsNearWalkingStreetBody = require('./guide-bodies/best-gyms-near-walking-street');
const bestMuayThaiPattayaBody = require('./guide-bodies/best-muay-thai-pattaya');
const bjjMmaPattayaBody = require('./guide-bodies/bjj-mma-pattaya');
const boxingKickboxingPattayaBody = require('./guide-bodies/boxing-kickboxing-gym-pattaya');
const cheapestGymsPattayaBody = require('./guide-bodies/cheapest-gyms-pattaya');
const climbingPattayaBody = require('./guide-bodies/climbing-pattaya');
const crossfitPattayaBody = require('./guide-bodies/crossfit-pattaya');

const GUIDES = [
  {
    slug: 'muay-thai-pattaya-beginners',
    crumb: 'Muay Thai for beginners',
    kicker: 'Guide · Muay Thai · absolute beginners',
    title: 'Muay Thai in Pattaya for beginners | Pattaya.Gym',
    desc: 'Which Pattaya Muay Thai gyms actually accept absolute beginners, what your first week feels like, gear checklist, realistic costs, and red flags for tourist traps.',
    h1: 'Muay Thai for <span class="accent-pink">beginners.</span>',
    lede: 'Pattaya is one of the easiest cities in Thailand to start Muay Thai — if you pick the right camp. This guide is only for absolute beginners: zero experience, maybe zero fitness, first pad round ever.',
    body: `
<p><a href="/guides/best-for-beginners-pattaya/">Best for beginners</a> covers all sports. This page is <strong>Muay Thai only</strong> — the camps that patiently teach stance, guard, and basic combos without throwing you into hard sparring on day two.</p>

<h2>What beginners should expect in week 1</h2>
<ul>
<li><strong>Session length:</strong> 90–120 minutes including warm-up, technique, pads, cool-down.</li>
<li><strong>Pad work:</strong> You hold pads for partners and receive pad rounds — this is the core learning tool.</li>
<li><strong>Sparring:</strong> Usually <em>not</em> in week 1 at good beginner gyms. Light technical sparring may appear week 2–3 if you ask.</li>
<li><strong>Shin pain:</strong> Normal on the bag. Ice and rest days matter.</li>
<li><strong>Language:</strong> Counting and basic commands in Thai; good camps explain in English — see <a href="/guides/english-speaking-muay-thai-pattaya/">English-speaking guide</a>.</li>
</ul>

<h2>5 Pattaya camps that genuinely accept beginners</h2>

<h3>1. Fairtex Training Center Pattaya</h3>
<p><a href="/gyms/fairtex-pattaya/">Fairtex</a> runs the highest volume of first-timers in Pattaya. Structured fundamentals, many English-speaking trainers, resort facilities. ฿฿฿. Red flag to ignore: price — you pay for the beginner infrastructure.</p>

<h3>2. Kombat Group Thailand</h3>
<p><a href="/gyms/kombat-group-thailand/">Kombat Group</a> packages are built for travellers with no experience. All-inclusive removes logistics anxiety. East Pattaya (Huai Yai). Best if you want a <a href="/guides/muay-thai-training-holiday-pattaya/">training holiday</a> feel.</p>

<h3>3. Battle Conquer Gym</h3>
<p><a href="/gyms/battle-conquer-gym/">Battle Conquer</a> — air-conditioned, central, English-friendly, near beach. Ideal if heat is your main fear. ฿฿. Good “try Muay Thai without suffering” option.</p>

<h3>4. Pattaya Thai Boxing &amp; Fitness (Jomtien)</h3>
<p><a href="/gyms/pattaya-thai-boxing-fitness/">Jomtien walk-in gym</a> — ~฿300 casual pad rounds, no contract pressure. Perfect “day 1 experiment” before committing to a camp. See <a href="/guides/best-gym-jomtien-pattaya/">best gym Jomtien</a>.</p>

<h3>5. WKO Muay Thai (ISS Gym)</h3>
<p><a href="/gyms/wko-muay-thai/">WKO</a> — budget monthly (~฿4,000), legendary trainer Sakmongkol, English-operating gym. Best if you might stay 1–3 months after liking week 1.</p>

<h2>Beginner gear checklist</h2>
<ul>
<li>Hand wraps (buy locally ฿100–200)</li>
<li>Mouthguard (custom or boil-and-bite)</li>
<li>Shorts (Thai MT shorts ฿300–600 at camp shop)</li>
<li>Water bottle + towel</li>
<li>Optional week 1: rent gloves at gym; buy once you commit</li>
</ul>

<h2>Realistic beginner costs (2026)</h2>
<div class="guide-price-table-wrap">
<table class="guide-price-table">
<caption>Beginner Muay Thai pricing snapshot</caption>
<thead><tr><th scope="col">Format</th><th scope="col">Typical range (THB)</th></tr></thead>
<tbody>
<tr><td>Single drop-in class</td><td>฿400–600</td></tr>
<tr><td>10-class pack</td><td>฿3,500–5,500</td></tr>
<tr><td>Monthly unlimited (non-resort)</td><td>฿4,000–8,000</td></tr>
<tr><td>1-week resort package</td><td>฿20,000–40,000 all-inclusive</td></tr>
</tbody>
</table>
</div>

<h2>Red flags — tourist traps</h2>
<ul>
<li>Hard sparring forced on day 1</li>
<li>No warm-up or pad explanation — just “hit bag”</li>
<li>Prices only in USD with pressure upsell</li>
<li>Trainers cannot demonstrate basic stance correction in English when promised</li>
<li>No other beginners in a “beginner class”</li>
</ul>

<h2>FAQ</h2>
<h3>Am I too old or unfit to start Muay Thai in Pattaya?</h3>
<p>No — camps train tourists from 18 to 60+ daily. Tell trainers about injuries. Start with one session per day.</p>
<h3>Do beginners need to fight?</h3>
<p>No. Most beginners never compete. Sparring is optional at ethical gyms.</p>
<h3>How is this different from the general beginner guide?</h3>
<p><a href="/guides/best-for-beginners-pattaya/">Best for beginners</a> includes dive, golf, yoga. This page is Muay-Thai-specific depth.</p>

<h2>Related</h2>
<p><a href="/guides/muay-thai-training-holiday-pattaya/">Training holiday</a> · <a href="/guides/best-muay-thai-pattaya/">Best Muay Thai</a> · <a href="/guides/gym-day-pass-pattaya/">Day pass gyms</a> · <a href="/compare/">Compare camps</a></p>
`,
  },
  {
    slug: 'best-gym-jomtien-pattaya',
    crumb: 'Best gym in Jomtien',
    kicker: 'Guide · Jomtien · current prices · access',
    readTime: '14 min read',
    title: 'Jomtien gyms, classes and sport: current prices | Pattaya.Gym',
    desc: 'Compare Jomtien gyms, Muay Thai, yoga, courts, diving and family sport by current dated prices, access rules, status and exact corridor.',
    h1: 'Best gym in <span class="accent-cyan">Jomtien.</span>',
    lede: 'Choose the product and exact corridor first. The Jomtien filter reaches from Dongtan and Thepprasit to Na Jomtien and Ban Amphur, and it mixes memberships, coached sessions, courts, water days and resort facilities.',
    body: `
<p>Start with the full area directory: <a href="/area/jomtien/">Jomtien area hub</a> and <a href="/area/jomtien/muay-thai/">Muay Thai in Jomtien</a>. Use <a href="/compare/">compare</a> filtered by area if you are shortlisting hotels + gyms together.</p>

<h2>Why train in Jomtien</h2>
<ul>
<li>Quieter beach, safer swimming zones than central Pattaya Beach</li>
<li>Strong expat/resident base — gyms expect long-stay members</li>
<li>20–30 min to central Pattaya stadiums and nightlife when you want it</li>
<li>Na Jomtien / Sattahip south adds golf and water parks for rest days</li>
</ul>

<h2>Best Muay Thai near Jomtien Beach</h2>

<h3>Pattaya Thai Boxing &amp; Fitness (Jomtien)</h3>
<p><a href="/gyms/pattaya-thai-boxing-fitness/">Soi 7 Jomtien</a> — budget walk-in, ~฿300 pad rounds, 200m from beach. Best casual beginner try.</p>

<h3>Venum Training Camp</h3>
<p><a href="/gyms/venum-training-camp/">Venum</a> — Thepprasit / near Jomtien, modern multi-discipline (MT, MMA, BJJ), 2 rings. ฿฿.</p>

<h3>Rage Fight Academy</h3>
<p><a href="/gyms/rage-fight-academy/">Rage</a> — Thappraya, 5 min from Dongtan/Jomtien beaches, education-visa friendly, strong BJJ/MMA mat. ฿฿.</p>

<h3>Fight EVO360</h3>
<p><a href="/gyms/fight-evo360/">EVO360</a> — Thepprasit, sport-science programming angle. Verify hours on arrival.</p>

<h2>Best fitness &amp; hotel gyms (Jomtien)</h2>
<ul>
<li><a href="/gyms/andaz-pattaya-jomtien/">Andaz Pattaya Jomtien</a> — Hyatt-tier hotel gym (day pass policy varies)</li>
<li><a href="/gyms/pattaya-marriott-resort/">Pattaya Marriott Resort</a> — Na Jomtien resort fitness</li>
<li><a href="/gyms/renaissance-pattaya-resort/">Renaissance Pattaya</a> — resort gym + pool</li>
<li><a href="/gyms/movenpick-siam-pattaya/">Mövenpick Siam Na Jomtien</a> — family resort fitness</li>
</ul>
<p>For commercial chains and budget iron, see <a href="/area/jomtien/fitness/">Jomtien fitness category</a> and <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms</a> (city-wide table).</p>

<h2>Yoga &amp; recovery in Jomtien</h2>
<ul>
<li><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a> — Thepprasit, trilingual classes</li>
<li><a href="/gyms/ashtanga-yoga-pattaya/">Ashtanga Yoga Pattaya</a> — Mysore-style</li>
<li><a href="/gyms/balance-yoga-studio-pattaya/">Balance Yoga</a> — sound healing + sea-adjacent</li>
</ul>

<h2>Swim &amp; water days (rest from lifting)</h2>
<ul>
<li><a href="/gyms/pattaya-public-pool-jomtien/">Jomtien public pool</a> — budget laps</li>
<li><a href="/gyms/jomtien-dive-center/">Jomtien Dive Center</a> — PADI IDC on the beach</li>
<li><a href="/gyms/mermaids-dive/">Mermaid\'s Dive</a> — Soi White House Jomtien</li>
<li><a href="/gyms/ramayana-water-park/">Ramayana Water Park</a> — Na Jomtien day trip</li>
</ul>

<h2>How to pick your Jomtien base</h2>
<p><strong>Budget + beach walk:</strong> Pattaya Thai Boxing &amp; Fitness + public pool. <strong>Serious MT/MMA:</strong> Venum or Rage. <strong>Resort comfort:</strong> hotel gym + occasional MT drop-ins. <strong>Remote worker:</strong> yoga studio + Pattaya Coffee for work sessions.</p>

<h2>FAQ</h2>
<h3>Is Jomtien good for Muay Thai beginners?</h3>
<p>Yes — especially walk-in gyms and Venum/Rage for structured training. Pair with <a href="/guides/muay-thai-pattaya-beginners/">beginner Muay Thai guide</a>.</p>
<h3>How far is Jomtien from central Pattaya gyms?</h3>
<p>15–25 minutes by car/motorbike depending on traffic. Plan commute before signing a monthly contract far from your hotel.</p>
<h3>Best gym near Jomtien Beach Road?</h3>
<p>Pattaya Thai Boxing &amp; Fitness (Soi 7) is the closest authentic MT gym on the strip.</p>

<h2>Related</h2>
<p><a href="/guides/best-gyms-near-walking-street-pattaya/">Near Walking Street</a> · <a href="/area/jomtien/">All Jomtien venues</a> · <a href="/plan-my-trip/">Plan my trip</a></p>
`,
  },
  {
    slug: 'pattaya-vs-phuket-muay-thai-training',
    crumb: 'Pattaya vs Phuket Muay Thai',
    kicker: 'Guide · Compare · training destination',
    title: 'Pattaya vs Phuket for Muay Thai training | Pattaya.Gym',
    desc: 'Honest comparison: Pattaya vs Phuket for Muay Thai training holidays — cost, camp quality, nightlife, beaches, fights, visas, and who should pick which city.',
    h1: 'Pattaya vs <span class="accent-yellow">Phuket.</span>',
    lede: 'Both cities sell “train Muay Thai in paradise.” The experience is not the same. This is an independent comparison from the Pattaya side — we map 158 Pattaya venues and link out honestly when Phuket is the better fit.',
    body: `
<p>Searching <em>muay thai training holiday thailand</em> surfaces both cities. Use this page to decide <strong>where to book flights</strong> before you pay a camp deposit.</p>

<h2>Quick verdict</h2>
<div class="guide-price-table-wrap">
<table class="guide-price-table">
<caption>Pattaya vs Phuket — training holiday snapshot</caption>
<thead><tr><th scope="col">Factor</th><th scope="col">Pattaya</th><th scope="col">Phuket</th></tr></thead>
<tbody>
<tr><td>Average camp cost</td><td>Lower — more budget/authentic options</td><td>Higher — resort marketing premium</td></tr>
<tr><td>Camp density</td><td>19 verified MT venues in city</td><td>Fewer camps, more spread across island</td></tr>
<tr><td>English-friendly kru</td><td>Very high (decades of expat training)</td><td>High at tourist camps</td></tr>
<tr><td>Fight shows</td><td>MAX weekly + Bangkok day-trips</td><td>Stadium tourism strong (Bangla etc.)</td></tr>
<tr><td>Nightlife intensity</td><td>High (choose your district)</td><td>High (Patong)</td></tr>
<tr><td>Beach quality</td><td>Mixed — Jomtien/Wongamat best</td><td>Generally stronger island beaches</td></tr>
<tr><td>Best for</td><td>Value, variety, long-stay, Bangkok access</td><td>Beach-resort holiday + MT package</td></tr>
</tbody>
</table>
</div>

<h2>When Pattaya wins</h2>
<ul>
<li>You want <strong>maximum camp choice</strong> without island taxi logistics — see <a href="/guides/best-muay-thai-pattaya/">best Muay Thai Pattaya</a>.</li>
<li>Budget matters — <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms</a> and <a href="/gyms/wko-muay-thai/">WKO</a>-tier monthly training.</li>
<li>You might train <strong>1–3 months</strong> and need visa/restaurant/school ecosystem — Pattaya Visa Help + Pattaya Authority network.</li>
<li>You want <strong>Bangkok stadium trips</strong> (<a href="/gyms/lumpinee-boxing-stadium/">Lumpinee</a>, <a href="/gyms/rajadamnern-stadium/">Rajadamnern</a>) on weekends.</li>
<li>Lineage-focused training: <a href="/gyms/sityodtong-pattaya/">Sityodtong</a>, <a href="/gyms/fairtex-pattaya/">Fairtex</a>, family camps like <a href="/gyms/petchrungruang-gym/">Petchrungruang</a>.</li>
</ul>

<h2>When Phuket wins</h2>
<ul>
<li>Primary goal is <strong>beach resort holiday</strong> with Muay Thai as a side activity.</li>
<li>You want island photos/marketing “paradise camp” aesthetics first.</li>
<li>You are already booked in Patong/Kata/Karon and will not relocate.</li>
<li>Surf/water culture mix matters more than camp density.</li>
</ul>
<p>We do not list Phuket camps — this site is Pattaya-only by design. Research Phuket operators separately; apply the same red flags from our <a href="/guides/muay-thai-pattaya-beginners/">beginner guide</a>.</p>

<h2>Cost comparison (typical 2-week holiday)</h2>
<p><strong>Pattaya:</strong> mid-tier stay-and-train often <strong>฿35,000–60,000</strong> all-inclusive; budget train-only + apartment can run <strong>฿20,000–35,000</strong>. Details: <a href="/guides/muay-thai-training-holiday-pattaya/">training holiday guide</a>.</p>
<p><strong>Phuket:</strong> comparable resort packages frequently run <strong>10–25% higher</strong> for similar room class — island logistics and tourism positioning. Verify inclusions (meals, transfers, private vs group pads).</p>

<h2>Training quality — what actually differs</h2>
<p>Phuket’s famous camps (e.g. legacy island brands) can be excellent. Pattaya’s advantage is <strong>volume and competition between camps</strong> — you can switch if coaching fit is wrong. Pattaya also blends authentic Thai family gyms with resort camps in one metro area.</p>

<h2>Lifestyle &amp; distractions</h2>
<p>Both cities have nightlife that can wreck training discipline. Pattaya lets you live in quieter zones (<a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a>, Naklua, Pratamnak) while visiting central nightlife by choice. Phuket’s Patong is concentrated — plan accommodation away from Bangla if focus matters.</p>

<h2>FAQ</h2>
<h3>Is Pattaya or Phuket better for first-time Muay Thai?</h3>
<p>Pattaya — more beginner-tolerant gyms per km and lower cost to experiment. Start with <a href="/guides/muay-thai-pattaya-beginners/">beginners guide</a>.</p>
<h3>Can I visit both in one trip?</h3>
<p>Yes — domestic flight or bus between cities. Most serious trainers pick one base for at least 2 weeks to avoid reset fatigue.</p>
<h3>Which has better fights to watch?</h3>
<p>Both have tourist stadiums. Pattaya residents often day-trip to Bangkok for pinnacle stadium cards while training locally.</p>

<h2>Plan your Pattaya trip</h2>
<p><a href="/guides/muay-thai-camps-with-accommodation-pattaya/">Camps with accommodation</a> · <a href="/guides/english-speaking-muay-thai-pattaya/">English-speaking camps</a> · <a href="/compare/">Compare 158 venues</a> · <a href="/plan-my-trip/">Plan my trip</a></p>
`,
  },
  {
    slug: 'best-gyms-near-walking-street-pattaya',
    crumb: 'Gyms near Walking Street',
    kicker: 'Guide · Walking Street · verified access · current prices',
    readTime: '16 min read',
    title: 'Best gyms near Walking Street Pattaya | current access',
    desc: 'Compare gyms, combat training, tennis, badminton, cue sport and pool access near Walking Street by verified hours, current dated prices and access rules.',
    h1: 'Gyms near <span class="accent-pink">Walking Street.</span>',
    lede: 'The nearest useful option depends on whether you need weights, a coached class, a booked court or a recovery day. This guide separates those products and removes stale travel-time, fare and public-access assumptions.',
    body: bestGymsNearWalkingStreetBody,
  },
  {
    slug: 'best-muay-thai-pattaya',
    crumb: 'Best Muay Thai in Pattaya',
    kicker: 'Guide · Muay Thai · current prices · decision first',
    readTime: '18 min read',
    title: 'Best Muay Thai gyms in Pattaya | current prices',
    desc: 'Compare Pattaya Muay Thai gyms by current dated prices, class format, location, facilities, residential packages and unresolved access questions.',
    h1: 'Best Muay Thai in <span class="accent-pink">Pattaya.</span>',
    lede: 'The best fit depends on the transaction: one coached session, two-a-day training, a central gym, mixed combat disciplines or a residential package. This guide compares those products without review scores or stale price bands.',
    body: bestMuayThaiPattayaBody,
  },
  {
    slug: 'bjj-mma-pattaya',
    crumb: 'BJJ and MMA in Pattaya',
    kicker: 'Guide · BJJ · grappling · MMA · current prices',
    readTime: '18 min read',
    title: 'BJJ, grappling and MMA in Pattaya | current guide',
    desc: 'Compare Pattaya BJJ, grappling and MMA training by current class times, dated prices, location, residential packages and unresolved access questions.',
    h1: 'BJJ &amp; MMA in <span class="accent-cyan">Pattaya.</span>',
    lede: 'Pattaya has active BJJ, grappling and MMA programmes, but the only record in the direct BJJ category is closed. This guide maps the current cross-category choices without reviving old academy claims.',
    body: bjjMmaPattayaBody,
  },
  {
    slug: 'boxing-kickboxing-gym-pattaya',
    crumb: 'Boxing and kickboxing',
    kicker: 'Guide · Western boxing · kickboxing · current evidence',
    readTime: '16 min read',
    title: 'Boxing and kickboxing gyms in Pattaya | current guide',
    desc: 'Compare Pattaya boxing and kickboxing options by verified discipline, current class times, dated prices, facilities and residential or contact-first access.',
    h1: 'Boxing &amp; <span class="accent-pink">kickboxing.</span>',
    lede: 'Choose the exact striking product first. This guide separates combined boxing and Muay Thai classes, multi-discipline camps, fitness kickboxing, residential western boxing and an unverified former stadium.',
    body: boxingKickboxingPattayaBody,
    sisterLinks: [
      { url: '/guides/best-muay-thai-pattaya/', label: 'Best Muay Thai', desc: 'Current camp and price comparison' },
      { url: '/guides/bjj-mma-pattaya/', label: 'BJJ and MMA', desc: 'Grappling and hybrid fight gyms' },
      { url: '/area/central-pattaya/', label: 'Central Pattaya', desc: 'Compare access models by area' },
      { url: '/compare/', label: 'Compare venues', desc: 'Filter the directory' },
    ],
  },
  {
    slug: 'climbing-pattaya',
    crumb: 'Climbing in Pattaya',
    kicker: 'Guide · Climbing · current status · first visit',
    readTime: '12 min read',
    title: 'Climbing gyms in Pattaya | current status and access',
    desc: 'Find the current Pattaya climbing option, understand Deep Climbing Gym’s closure, and verify STICKY’s schedule, price and first-session access.',
    h1: 'Climbing in <span class="accent-cyan">Pattaya.</span>',
    lede: 'Pattaya’s directory has one current dedicated climbing venue and one closed record. This guide keeps that status explicit and shows what to confirm before travelling to STICKY in Huai Yai.',
    body: climbingPattayaBody,
    sisterLinks: [
      { url: '/category/climbing/', label: 'Climbing directory', desc: 'Current venue and closed record' },
      { url: '/guides/adventure-pattaya/', label: 'Adventure guide', desc: 'Separate climbing from ropes courses' },
      { url: '/area/east-pattaya/', label: 'East Pattaya', desc: 'Inland location context' },
      { url: '/compare/', label: 'Compare venues', desc: 'Filter the directory' },
    ],
  },
  {
    slug: 'crossfit-pattaya',
    crumb: 'CrossFit in Pattaya',
    kicker: 'Guide · Functional fitness · affiliate status · schedule',
    readTime: '12 min read',
    title: 'CrossFit in Pattaya | current affiliate status and options',
    desc: 'Understand CrossFit Pattaya’s departed affiliate status and evaluate Jungle Gym’s current functional-fitness schedule, access and location.',
    h1: 'CrossFit status in <span class="accent-yellow">Pattaya.</span>',
    lede: 'Pattaya has no verified current CrossFit affiliate in this directory. Jungle Gym is the active independent functional-fitness option connected to the former affiliate record.',
    body: crossfitPattayaBody,
    sisterLinks: [
      { url: '/category/crossfit/', label: 'CrossFit category', desc: 'The current status record' },
      { url: '/category/fitness/', label: 'Fitness directory', desc: 'General training alternatives' },
      { url: '/area/east-pattaya/', label: 'East Pattaya', desc: 'Nong Prue location context' },
      { url: '/guides/24-hour-gyms-pattaya/', label: '24-hour gyms', desc: 'Access outside class schedules' },
    ],
  },
  {
    slug: 'cheapest-gyms-pattaya',
    crumb: 'Cheapest gyms',
    kicker: 'Guide · Budget fitness · current dated prices',
    readTime: '17 min read',
    title: 'Cheapest gyms in Pattaya | current prices',
    desc: 'Compare current Pattaya gym day, week and monthly prices by product, area and included facilities, with unknown tariffs kept out of the ranking.',
    h1: 'Cheapest <span class="accent-yellow">gyms.</span>',
    lede: 'The lowest price changes with the transaction. Compare ordinary gym entry, coached-combat facilities and resort access using exact operator tariffs checked 25-26 July 2026.',
    body: cheapestGymsPattayaBody,
    sisterLinks: [
      { url: '/guides/gym-day-pass-pattaya/', label: 'Gym day pass', desc: 'Short-stay access without a month' },
      { url: '/guides/24-hour-gyms-pattaya/', label: '24-hour gyms', desc: 'Member access versus staffed hours' },
      { url: '/category/fitness/', label: 'Fitness directory', desc: 'All general-fitness records' },
      { url: '/compare/', label: 'Compare venues', desc: 'Filter by category and area' },
    ],
  },
];

let total = 0;
for (const g of GUIDES) {
  const bytes = writeEditorialGuide(g);
  total++;
  console.log(`  /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
console.log(`\nWrote ${total} Round 37 guides.`);
