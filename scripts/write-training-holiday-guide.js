#!/usr/bin/env node
/**
 * write-training-holiday-guide.js
 * High-intent guide: Muay Thai training holiday / retreat in Pattaya.
 * Run: node scripts/write-training-holiday-guide.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : '432';
const ASSET = `?v=${ASSET_VERSION}`;
const TODAY = new Date().toISOString().slice(0, 10);
const BUILD_TS = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const TOP_MARQUEE = ['★ EVERY GYM', 'EVERY RING', 'EVERY COURT', '158 VENUES', 'HAND-CHECKED', 'NO PAID PLACEMENTS', 'PATTAYA · THAILAND', 'UPDATED ROLLING'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA', 'NO PAID PLACEMENTS', 'HAND-CHECKED', 'EVERY GYM', 'EVERY RING', 'EVERY COURT', '★ LIVE 158 VENUES', 'UPDATED ROLLING'];

function marquee(items, bottom) {
  const cls = bottom ? 'marquee marquee-bottom' : 'marquee';
  const inner = items.map(it => `<span>${esc(it)}</span><span class="star">·</span>`).join('');
  return `<div class="${cls}" aria-hidden="true"><div class="marquee-track"><div class="marquee-set">${inner}</div><div class="marquee-set" aria-hidden="true">${inner}</div></div></div>`;
}

const NETWORK_SITES = [
  { name: 'Pattaya Authority', url: 'https://pattaya-authority.com/work/pattaya-gym-directory/', desc: 'Hub for the whole network' },
  { name: 'Restaurant Guide', url: 'https://pattaya-restaurant-guide.com/', desc: 'Where to eat after training' },
  { name: 'Visa Help', url: 'https://pattayavisahelp.com/', desc: 'Long-stay visas &amp; paperwork' },
  { name: 'School Guide', url: 'https://pattaya-school-guide.com/', desc: 'Families relocating' },
  { name: 'Coffee', url: 'https://pattaya-coffee.com/', desc: 'Remote work cafés' },
  { name: 'Medical', url: 'https://pattaya-medical.com/', desc: 'Clinics &amp; sports injury' },
];

const { v2NavHtml } = require('./lib/v2-nav.js');
function nav() {
  return v2NavHtml();
}

function paNetwork() {
  const links = NETWORK_SITES.map(s =>
    `<a href="${s.url}" class="pa-network-card" target="_blank" rel="noopener noreferrer"><span class="pa-network-card-name">${esc(s.name)}</span><span class="pa-network-card-desc">${s.desc}</span></a>`
  ).join('\n    ');
  return `<section class="pa-network">
  
    <div class="pa-network-badge">★ A Pattaya Authority property ★</div>
  
  <h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2>
  <p class="pa-network-sub">// Independent Pattaya guides · engineered in-house by TimPaemi</p>
  <nav class="pa-network-grid" aria-label="Pattaya Authority network">${links}
  </nav>
</section>`;
}

function footer() {
  return `<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div>
      <div class="footer-brand">pattaya<span class="accent">.gym</span></div>
      <div class="footer-slogan">Built in Pattaya. For Pattaya.</div>
      <p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> 158 venues hand-checked. No paid placements.</p>
      <div class="footer-meta">TimPaemi Co., Ltd.<br>Pattaya City, Chon Buri 20150 · Thailand</div>
    </div>
    <div class="footer-col"><div class="footer-col-h">// The site</div><ul><li><a href="/about/">About</a></li><li><a href="/methodology/">Methodology</a></li><li><a href="/guides/">Guides</a></li><li><a href="/compare/">Compare</a></li><li><a href="/search/">Search</a></li></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Projects</div><ul class="footer-projects"></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Direct</div><ul><li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li><li><a href="/contact/">Contact</a></li></ul></div>
  </div>
  <div class="footer-base"><span>© 2026 TimPaemi Co., Ltd.</span><span class="u-cyan">★ v${ASSET_VERSION} · ${BUILD_TS}</span></div>
</footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>
<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${ASSET}"></script>`;
}

const SLUG = 'muay-thai-training-holiday-pattaya';
const TITLE = 'Muay Thai training holiday in Pattaya | Pattaya.Gym';
const DESC = 'Plan a 1–4 week Muay Thai training holiday in Pattaya: best stay-and-train camps, realistic budgets, daily schedule, visa notes, and how Pattaya compares to Phuket for fight camps.';
const URL = `${SITE}/guides/${SLUG}/`;

const BODY = `
<p>A <strong>Muay Thai training holiday</strong> in Pattaya means you fly in with one job: train twice a day, recover, repeat — without spending half your trip on logistics. Pattaya is not Bangkok (lineage museums) or Phuket (resort marketing). It is the city where foreigners have trained at scale since the 1980s: English-friendly kru, fight nights most weeks, and packages from budget bunkhouse to full resort.</p>

<p>This guide is for the <strong>1–4 week traveller</strong> (and the 1–3 month serious amateur) who wants a realistic plan: which camps run real holidays, what you will pay, how days are structured, and what to book before you land.</p>

<h2>Why Pattaya for a training holiday (not only Phuket)</h2>

<ul>
<li><strong>Density:</strong> 19 verified Muay Thai venues in one city — you can switch camps mid-trip if a coach fit is wrong.</li>
<li><strong>Cost:</strong> Stay-and-train packages often run <strong>20–40% below Phuket resort camps</strong> for comparable hours.</li>
<li><strong>English:</strong> Higher share of Tier-A English kru than most Thai provinces outside Bangkok.</li>
<li><strong>Fight ecosystem:</strong> <a href="/gyms/max-muay-thai-stadium/">MAX Muay Thai</a> cards, local stadiums, and Bangkok (<a href="/gyms/lumpinee-boxing-stadium/">Lumpinee</a> / <a href="/gyms/rajadamnern-stadium/">Rajadamnern</a>) within a day trip.</li>
<li><strong>Long-stay life:</strong> Pair training with visa planning, food, and remote-work cafés — the Pattaya Authority network exists for exactly this trip type.</li>
</ul>

<p>Use our <a href="/compare/">compare tool</a> to shortlist three camps, then <a href="/plan-my-trip/">plan my trip</a> to map area and commute.</p>

<h2>Training holiday lengths — what changes</h2>

<h3>1 week (introduction)</h3>
<p>Goal: learn stance, basic combos, pad rhythm, respect gym culture. One session per day is enough. Pick a camp that specialises in beginners (<a href="/guides/best-for-beginners-pattaya/">beginner guide</a>). Budget <strong>฿15,000–35,000</strong> all-in if you want accommodation included.</p>

<h3>2 weeks (skill block)</h3>
<p>Goal: consistent improvement, maybe light sparring. Two-a-days optional. This is the sweet spot for first-time fight tourists. Budget <strong>฿25,000–55,000</strong> depending on resort vs budget camp.</p>

<h3>3–4 weeks (holiday that might become relocation)</h3>
<p>Goal: real conditioning, possible amateur fight prep. Consider camps with accommodation on-site (<a href="/guides/muay-thai-camps-with-accommodation-pattaya/">stay-and-train guide</a>) or rent an apartment near your gym (Jomtien / Naklua / Central). Budget <strong>฿40,000–120,000+</strong> for premium all-inclusive.</p>

<h2>Best camps for a Pattaya training holiday</h2>

<h3>Turn-key resort holiday — Fairtex Pattaya</h3>
<p><a href="/gyms/fairtex-pattaya/">Fairtex Training Center</a> is the default “training holiday” answer: on-site hotel, pool, restaurant, 9 rings, 17 trainers, English operating language. You land, check in, train — no taxi negotiations. ฿฿฿–฿฿฿฿. Best when your group mixes beginners and experienced partners.</p>

<h3>All-inclusive multi-discipline — Kombat Group</h3>
<p><a href="/gyms/kombat-group-thailand/">Kombat Group Thailand</a> (Huai Yai, East Pattaya) packages airport transfer, meals, laundry, accommodation, and two-a-days. Muay Thai plus boxing, MMA, BJJ if you want variety. ฿฿฿. Best for Europeans/Australians who want one invoice.</p>

<h3>English + value — WKO / ISS Gym</h3>
<p><a href="/gyms/wko-muay-thai/">WKO</a> is Central Pattaya, ~฿4,000/month training culture, Sakmongkol on pads — serious coaching without resort markup. Book your own hotel nearby. Best for independent travellers who hate resort bubbles.</p>

<h3>Lineage pilgrimage — Sityodtong</h3>
<p><a href="/gyms/sityodtong-pattaya/">Sityodtong Pattaya</a> (since 1960) is less resort, more gym temple. English-proficient kru, Naklua side. ฿฿. Best when “authentic lineage” matters more than pool photos.</p>

<h3>Comfort in heat — Battle Conquer</h3>
<p><a href="/gyms/battle-conquer-gym/">Battle Conquer</a> — fully air-conditioned Muay Thai, sauna, ice plunge, near beach. ฿฿. Best when Pattaya humidity would otherwise end your holiday on day 3.</p>

<h3>Boutique premium — Silk Muay Thai</h3>
<p><a href="/gyms/silk-muay-thai/">Silk Muay Thai</a> runs high-rated boutique packages (~฿25,500/month tier with room, meals, spa). ฿฿฿. Best for travellers who want small-group attention.</p>

<h2>Sample daily schedule (two-a-day holiday)</h2>

<ul>
<li><strong>06:30</strong> — Run or skip rope (optional; many camps include warm-up)</li>
<li><strong>07:00–09:00</strong> — Morning session: technique + pads</li>
<li><strong>09:30</strong> — Protein breakfast; nap or pool</li>
<li><strong>12:00</strong> — Light lunch; avoid heavy alcohol if training PM</li>
<li><strong>15:00–17:30</strong> — Afternoon session: clinch / sparring / conditioning</li>
<li><strong>18:00</strong> — Ice, stretch, massage (Pattaya sports massage is cheap and good)</li>
<li><strong>Friday/Saturday</strong> — Watch fights: MAX card or Bangkok stadium trip</li>
</ul>

<h2>Budget table (realistic 2026 ranges)</h2>

<div class="guide-price-table-wrap">
<table class="guide-price-table">
<caption>Muay Thai training holiday budgets (per person, THB)</caption>
<thead><tr><th scope="col">Tier</th><th scope="col">1 week</th><th scope="col">2 weeks</th><th scope="col">4 weeks</th></tr></thead>
<tbody>
<tr><td>Budget (train only, own hotel)</td><td>฿8,000–15,000</td><td>฿15,000–28,000</td><td>฿28,000–50,000</td></tr>
<tr><td>Mid stay-and-train</td><td>฿20,000–35,000</td><td>฿35,000–60,000</td><td>฿60,000–100,000</td></tr>
<tr><td>Premium resort camp</td><td>฿35,000–55,000</td><td>฿55,000–90,000</td><td>฿90,000–160,000+</td></tr>
</tbody>
</table>
</div>
<p>Excludes flights and visa fees. Add ฿3,000–8,000/week for food and taxis if not all-inclusive.</p>

<h2>Before you book — checklist</h2>

<ol>
<li>Confirm <strong>English coaching</strong> if needed — see <a href="/guides/english-speaking-muay-thai-pattaya/">English-speaking Muay Thai guide</a>.</li>
<li>Ask for <strong>private vs group ratio</strong> on pads (some holidays are crowded).</li>
<li>Clarify <strong>sparring policy</strong> for beginners (opt-in is normal).</li>
<li>Check <strong>gym location vs your hotel</strong> — Pattaya traffic punishes bad geography.</li>
<li>Read <a href="/methodology/">how we verify</a> listings; message us if hours/prices drift.</li>
</ol>

<h2>Visa and long-stay notes</h2>
<p>Most training holidays run on a <strong>tourist visa or visa exemption</strong> (check your nationality). Camps like <a href="/gyms/rage-fight-academy/">Rage Fight Academy</a> advertise education-visa pathways for multi-month stays — confirm legality with a specialist (Pattaya Visa Help), not a gym sales desk alone.</p>

<h2>FAQ</h2>

<h3>How much does a Muay Thai training holiday in Pattaya cost?</h3>
<p>Budget travellers training once daily with self-booked hotels often spend ฿8,000–15,000 per week on training. All-inclusive resort holidays run ฿20,000–55,000 per week depending on room tier and meals.</p>

<h3>Is Pattaya or Phuket better for a Muay Thai holiday?</h3>
<p>Phuket markets resort packages harder; Pattaya offers more camp choice per square kilometre and lower average cost. Serious fighters sometimes prefer Bangkok lineage; holiday-first travellers often prefer Pattaya logistics and nightlife balance.</p>

<h3>Do I need experience before a training holiday?</h3>
<p>No. Camps listed above accept beginners daily. Tell them your experience level when booking — they will put you on fundamentals pads, not hard sparring.</p>

<h3>Can I train Muay Thai in Pattaya for one month?</h3>
<p>Yes. Monthly unlimited training at mid-tier gyms runs roughly ฿4,000–12,000; all-inclusive month packages at resort camps run higher. Combine with our <a href="/guides/muay-thai-camps-with-accommodation-pattaya/">accommodation guide</a>.</p>

<h3>What should I pack for a Muay Thai holiday?</h3>
<p>Hand wraps, mouthguard, shin guards (optional week 1), running shoes, plenty of shirts. Gloves are usually available for rent — confirm size. Buy Thai shorts locally for ฿300–600.</p>

<h2>Related guides</h2>
<p><a href="/guides/best-muay-thai-pattaya/">Best Muay Thai Pattaya</a> · <a href="/guides/gym-day-pass-pattaya/">Gym day pass</a> · <a href="/guides/cheapest-gyms-pattaya/">Cheapest gyms</a> · <a href="/guides/best-gyms-near-walking-street-pattaya/">Near Walking Street</a> · <a href="/category/muay-thai/">All Muay Thai venues</a></p>
`;

const webpage = { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${URL}#webpage`, url: URL, name: TITLE, description: DESC, inLanguage: 'en', isPartOf: { '@id': `${SITE}/#website` } };
const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE}/guides/` }, { '@type': 'ListItem', position: 3, name: 'Muay Thai training holiday', item: URL }] };

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(DESC)}">
<link rel="canonical" href="${URL}">
<link rel="alternate" hreflang="en" href="${URL}">
<link rel="alternate" hreflang="x-default" href="${URL}">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<link rel="preload" href="/styles.css${ASSET}" as="style">
<link rel="preload" href="/fonts/space-grotesk-700.woff2${ASSET}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css${ASSET}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:title" content="${esc(TITLE)}">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:url" content="${URL}">
<meta property="og:type" content="article">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<script type="application/ld+json">${JSON.stringify(webpage)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${marquee(TOP_MARQUEE, false)}
${nav()}
<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);"><a href="/" style="color:var(--muted);">Home</a> <span style="color:var(--hint); margin:0 8px;">/</span> <a href="/guides/" style="color:var(--muted);">Guides</a> <span style="color:var(--hint); margin:0 8px;">/</span> <span style="color:var(--text); font-weight:600;">Muay Thai training holiday</span></nav>
<main id="main">
<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-6); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// Guide · Training holiday · stay-and-train</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,8vw,96px); text-align:left;">Muay Thai <span class="accent-pink">training holiday.</span></h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;">Plan a 1–4 week Muay Thai trip in Pattaya: which camps run real holidays, what you will pay, daily schedule, and how it compares to Phuket — from the team that hand-checks all 158 sport venues in the city.</p>
    <p class="hero-meta" style="text-align:left;">Updated ${TODAY} · Pattaya · <a href="/compare/">Compare camps</a> · <a href="/plan-my-trip/">Plan trip</a></p>
  </div>
</section>
<section class="section" style="padding-top:var(--s-4);">
  <div class="wrap">
    <article class="venue-body" style="max-width:880px; margin:0 auto;">
${BODY}
    </article>
  </div>
</section>
</main>
${paNetwork()}
${marquee(BOTTOM_MARQUEE, true)}
${footer()}
</body>
</html>
`;

const dir = path.join(ROOT, 'guides', SLUG);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
console.log(`Wrote /guides/${SLUG}/ (${(html.length / 1024).toFixed(1)} KB)`);
