#!/usr/bin/env node
/**
 * inject-homepage-seo.js
 * Homepage: intent router + Pattaya network hub (idempotent).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const INTENT_MARKER = 'id="start-here"';
const NETWORK_MARKER = 'id="pattaya-network"';

function guideCount() {
  const guidesDir = path.join(ROOT, 'guides');
  return fs.readdirSync(guidesDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(guidesDir, e.name, 'index.html')))
    .length;
}

const INTENT_BLOCK = `
<section class="section intent-router" id="start-here">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Start here</div>
    <h2 class="h-section">Find your <span class="accent-cyan">intent.</span></h2>
    <p class="lede">Curated guides and tools — pick the trip you are actually planning.</p>
    <div class="intent-grid">
      <a href="/guides/train-muay-thai-pattaya-1-week-1-month/" class="intent-card">
        <span class="intent-card-tag">// Trip length</span>
        <span class="intent-card-title">1 week vs 1 month training</span>
        <span class="intent-card-desc">Camps, budgets, schedules per stay</span>
      </a>
      <a href="/guides/muay-thai-training-holiday-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Training holiday</span>
        <span class="intent-card-title">Muay Thai training holiday</span>
        <span class="intent-card-desc">Stay-and-train packages &amp; daily rhythm</span>
      </a>
      <a href="/guides/muay-thai-pattaya-beginners/" class="intent-card">
        <span class="intent-card-tag">// Absolute beginner</span>
        <span class="intent-card-title">Muay Thai for beginners</span>
        <span class="intent-card-desc">First week, gear, costs, red flags</span>
      </a>
      <a href="/guides/is-muay-thai-safe-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Safety</span>
        <span class="intent-card-title">Is Muay Thai safe?</span>
        <span class="intent-card-desc">Injuries, red flags, medical backup</span>
      </a>
      <a href="/guides/best-gym-central-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Central Pattaya</span>
        <span class="intent-card-title">Best gym Central Pattaya</span>
        <span class="intent-card-desc">WKO, 24h chains, Tony's Gym</span>
      </a>
      <a href="/guides/best-gym-jomtien-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Jomtien</span>
        <span class="intent-card-title">Best gym in Jomtien</span>
        <span class="intent-card-desc">Beach-side MT, fitness, yoga, pools</span>
      </a>
      <a href="/guides/best-gym-naklua-pratamnak-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Naklua &amp; Pratamnak</span>
        <span class="intent-card-title">North &amp; hilltop gyms</span>
        <span class="intent-card-desc">Fairtex, Muscle Factory, padel, Wong Amat</span>
      </a>
      <a href="/guides/padel-pickleball-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Racquet</span>
        <span class="intent-card-title">Padel &amp; pickleball</span>
        <span class="intent-card-desc">Courts on Pratamnak &amp; Mabprachan</span>
      </a>
      <a href="/guides/tennis-badminton-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Tennis</span>
        <span class="intent-card-title">Tennis &amp; badminton</span>
        <span class="intent-card-desc">Fitz Club, courts, badminton halls</span>
      </a>
      <a href="/guides/bjj-mma-pattaya/" class="intent-card">
        <span class="intent-card-tag">// BJJ / MMA</span>
        <span class="intent-card-title">BJJ &amp; MMA in Pattaya</span>
        <span class="intent-card-desc">Grappling, cage gyms, fight camps</span>
      </a>
      <a href="/guides/crossfit-pattaya/" class="intent-card">
        <span class="intent-card-tag">// CrossFit</span>
        <span class="intent-card-title">CrossFit Pattaya</span>
        <span class="intent-card-desc">Jungle Gym affiliate + alternatives</span>
      </a>
      <a href="/guides/training-thailand-visa-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Long-stay</span>
        <span class="intent-card-title">Training &amp; visa</span>
        <span class="intent-card-desc">ED visa, tourist stay, camp paths</span>
      </a>
      <a href="/guides/yoga-retreat-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Yoga</span>
        <span class="intent-card-title">Yoga retreat Pattaya</span>
        <span class="intent-card-desc">Studios, resort packages, 7-day plan</span>
      </a>
      <a href="/guides/swimming-pools-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Swimming</span>
        <span class="intent-card-title">Swimming &amp; pools</span>
        <span class="intent-card-desc">Hotel pools, water parks, lap swim</span>
      </a>
      <a href="/guides/diving-watersports-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Diving</span>
        <span class="intent-card-title">Diving &amp; watersports</span>
        <span class="intent-card-desc">Scuba, kite, sailing, Koh Larn islands</span>
      </a>
      <a href="/guides/climbing-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Climbing</span>
        <span class="intent-card-title">Climbing in Pattaya</span>
        <span class="intent-card-desc">Deep Harbor Mall, Bean Cow, intro sessions</span>
      </a>
      <a href="/guides/adventure-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Adventure</span>
        <span class="intent-card-title">Adventure in Pattaya</span>
        <span class="intent-card-desc">Skydive, zipline, karting, ATV, shooting</span>
      </a>
      <a href="/guides/kids-youth-sport-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Kids</span>
        <span class="intent-card-title">Kids &amp; youth sport</span>
        <span class="intent-card-desc">Football academies, trampoline, MT for kids</span>
      </a>
      <a href="/guides/pattaya-vs-phuket-muay-thai-training/" class="intent-card">
        <span class="intent-card-tag">// Compare cities</span>
        <span class="intent-card-title">Pattaya vs Phuket training</span>
        <span class="intent-card-desc">Which city fits your holiday</span>
      </a>
      <a href="/guides/cheapest-gyms-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Budget</span>
        <span class="intent-card-title">Cheapest gyms + price table</span>
        <span class="intent-card-desc">Drop-in, day pass, monthly comparison</span>
      </a>
      <a href="/guides/gym-day-pass-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Short stay</span>
        <span class="intent-card-title">Gym day pass Pattaya</span>
        <span class="intent-card-desc">No membership — train today</span>
      </a>
      <a href="/guides/muay-thai-camps-with-accommodation-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Stay &amp; train</span>
        <span class="intent-card-title">Camps with accommodation</span>
        <span class="intent-card-desc">All-inclusive packages on-site</span>
      </a>
      <a href="/guides/luxury-sports-clubs-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Luxury</span>
        <span class="intent-card-title">Luxury sports clubs</span>
        <span class="intent-card-desc">Fitz Club, resort golf, premium tier</span>
      </a>
      <a href="/guides/equestrian-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Equestrian</span>
        <span class="intent-card-title">Equestrian &amp; polo</span>
        <span class="intent-card-desc">Horseshoe Point, Thai Polo Club</span>
      </a>
      <a href="/guides/pattaya-digital-nomad-fitness/" class="intent-card">
        <span class="intent-card-tag">// Nomad</span>
        <span class="intent-card-title">Digital nomad fitness</span>
        <span class="intent-card-desc">Long-stay rhythm, gyms + social sport</span>
      </a>
      <a href="/guides/running-cycling-clubs-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Clubs</span>
        <span class="intent-card-title">Running &amp; cycling clubs</span>
        <span class="intent-card-desc">Hash, beach aerobics, cricket, rugby</span>
      </a>
      <a href="/guides/snooker-pool-billiards-pattaya/" class="intent-card">
        <span class="intent-card-tag">// Pool</span>
        <span class="intent-card-title">Pool &amp; snooker</span>
        <span class="intent-card-desc">SF Strike, Megabreak, billiards nights</span>
      </a>
      <a href="/guides/pattaya-russian-speaking-sport/" class="intent-card">
        <span class="intent-card-tag">// Russian</span>
        <span class="intent-card-title">Russian-speaking sport</span>
        <span class="intent-card-desc">Rusich, AF Academy, multilingual gyms</span>
      </a>
      <a href="/compare/" class="intent-card intent-card-tool">
        <span class="intent-card-tag">// Tool</span>
        <span class="intent-card-title">Compare 158 venues</span>
        <span class="intent-card-desc">Side-by-side filters — shareable shortlist</span>
      </a>
      <a href="/plan-my-trip/" class="intent-card intent-card-tool">
        <span class="intent-card-tag">// Tool</span>
        <span class="intent-card-title">Plan my trip</span>
        <span class="intent-card-desc">Map goals to areas and categories</span>
      </a>
      <a href="/guides/" class="intent-card intent-card-all">
        <span class="intent-card-tag">// All guides</span>
        <span class="intent-card-title">Browse __GUIDE_COUNT__ guides</span>
        <span class="intent-card-desc">Ranked picks by budget, area, sport</span>
      </a>
    </div>
  </div>
</section>
`;

const NETWORK_BLOCK = `
<section class="section network-hub" id="pattaya-network">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> Pattaya network</div>
    <h2 class="h-section">The TimPaemi <span class="accent-pink">Pattaya guides.</span></h2>
    <p class="lede">Pattaya.Gym is one property in an independent network built in Pattaya — restaurants, visas, schools, coffee, medical, and more. Cross-linked for long-stay trainers and relocators.</p>
    <nav class="network-grid" aria-label="Pattaya Authority network sites">
      <a href="https://pattaya-authority.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Pattaya Authority</span><span class="network-card-desc">Network hub · all properties</span></a>
      <a href="https://pattaya-restaurant-guide.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Restaurant Guide</span><span class="network-card-desc">Eat after training</span></a>
      <a href="https://pattayavisahelp.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Visa Help</span><span class="network-card-desc">Long-stay &amp; ED visa</span></a>
      <a href="https://pattaya-school-guide.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">School Guide</span><span class="network-card-desc">Families relocating</span></a>
      <a href="https://pattaya-coffee.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Pattaya Coffee</span><span class="network-card-desc">Remote work cafés</span></a>
      <a href="https://pattayapersonaltrainer.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Personal Trainer</span><span class="network-card-desc">1-on-1 coaching</span></a>
      <a href="https://pattayavilla.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Pattaya Villa</span><span class="network-card-desc">Long-stay accommodation</span></a>
      <a href="https://mrweoutside.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Mr We Outside</span><span class="network-card-desc">Outdoor community</span></a>
      <a href="https://pattayastream.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Villa Stream</span><span class="network-card-desc">Life in Pattaya</span></a>
      <a href="https://pattaya-medical.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Pattaya Medical</span><span class="network-card-desc">Clinics &amp; injury</span></a>
      <a href="https://pattayapets.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">PattayaPets</span><span class="network-card-desc">Vets &amp; pet life</span></a>
      <a href="https://pattaya-vehicle-rentals.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">Vehicle Rentals</span><span class="network-card-desc">Scooters &amp; cars</span></a>
      <a href="https://timpaemi.com/" class="network-card" target="_blank" rel="noopener noreferrer"><span class="network-card-name">TimPaemi</span><span class="network-card-desc">Founders · agency</span></a>
    </nav>
  </div>
</section>
`;

let html = fs.readFileSync(INDEX, 'utf8');

const INTENT = INTENT_BLOCK.replace('__GUIDE_COUNT__', String(guideCount()));

if (html.includes(INTENT_MARKER)) {
  html = html.replace(/<section class="section intent-router"[\s\S]*?<\/section>\s*/m, '');
}
if (html.includes(NETWORK_MARKER)) {
  html = html.replace(/<section class="section network-hub"[\s\S]*?<\/section>\s*/m, '');
}

const whoAnchor = '<section class="section" id="who">';
const whoMatch = html.match(/<section class="section" id="who">/);
if (!whoMatch || whoMatch.index == null) {
  console.error('Homepage anchor not found');
  process.exit(1);
}
const nl = html.includes('\r\n') ? '\r\n' : '\n';
html = html.slice(0, whoMatch.index) + INTENT + nl + NETWORK_BLOCK + nl + html.slice(whoMatch.index);
fs.writeFileSync(INDEX, html, 'utf8');
console.log('Homepage: intent router + network hub injected.');
