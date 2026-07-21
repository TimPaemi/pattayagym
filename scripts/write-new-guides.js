#!/usr/bin/env node
/**
 * write-new-guides.js
 *
 * Generates 3 new long-tail guide pages flagged as high-intent gaps in
 * Codex Nuclear V3 Section L (Keyword Opportunity Map):
 *
 *   1. /guides/english-speaking-muay-thai-pattaya/
 *      Target: "english speaking muay thai pattaya", "muay thai pattaya foreigners"
 *
 *   2. /guides/muay-thai-camps-with-accommodation-pattaya/
 *      Target: "muay thai camp accommodation pattaya", "muay thai stay and train pattaya"
 *
 *   3. /guides/gym-day-pass-pattaya/
 *      Target: "gym day pass pattaya", "drop-in gym pattaya", "no-membership gym pattaya"
 *
 * Each guide:
 *   - V2 chrome (head/marquee/nav/breadcrumb/main/footer/back-to-top/skip-link)
 *   - ~1500 words of substantive editorial content
 *   - Internal links to 8-12 specific Pattaya.Gym venue pages
 *   - Q/A-shaped FAQ section so inject-guide-schema.js auto-adds FAQPage schema
 *   - Article schema also added automatically by inject-guide-schema.js
 *   - Sitemap inclusion via build-v2.js GUIDE_SLUGS update (separate edit)
 *
 * Run: node scripts/write-new-guides.js
 * Idempotent.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : '406';
const ASSET = `?v=${ASSET_VERSION}`;
const TODAY = new Date().toISOString().slice(0, 10);
const BUILD_TS = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const TOP_MARQUEE = ['★ EVERY GYM','EVERY RING','EVERY COURT','158 VENUES','HAND-CHECKED','NO PAID PLACEMENTS','PATTAYA · THAILAND','UPDATED ROLLING'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA','NO PAID PLACEMENTS','HAND-CHECKED','EVERY GYM','EVERY RING','EVERY COURT','★ LIVE 158 VENUES','UPDATED ROLLING'];

function marquee(items, bottom) {
  const cls = bottom ? 'marquee marquee-bottom' : 'marquee';
  const inner = items.map(it => `<span>${esc(it)}</span><span class="star">·</span>`).join('');
  return `<div class="${cls}" aria-hidden="true"><div class="marquee-track"><div class="marquee-set">${inner}</div><div class="marquee-set" aria-hidden="true">${inner}</div></div></div>`;
}

const { v2NavHtml } = require('./lib/v2-nav.js');
function nav() {
  return v2NavHtml();
}

function paNetwork() {
  return `<section class="pa-network"><div class="pa-network-badge">★ A Pattaya Authority property ★</div><h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2><p class="pa-network-sub">// Site engineered, operated &amp; maintained in-house<br>by the founders of TimPaemi</p></section>`;
}

function footer() {
  return `<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div>
      <div class="footer-brand">pattaya<span class="accent">.gym</span></div>
      <div class="footer-slogan">Built in Pattaya. For Pattaya.</div>
      <p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> 158 venues hand-checked. No paid placements. Independent directory operated by TimPaemi Co., Ltd. from our Pattaya villa.</p>
      <p class="u-foot-meta">— Tim &amp; Paemi, founders</p>
      <div class="footer-meta">TimPaemi Co., Ltd.<br>Pattaya City, Bang Lamung District<br>Chon Buri 20150 · Thailand</div>
    </div>
    <div class="footer-col"><div class="footer-col-h">// The site</div><ul><li><a href="/about/">About</a></li><li><a href="/methodology/">Methodology</a></li><li><a href="/guides/">Guides</a></li><li><a href="/search/">Search</a></li></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Projects</div><ul><li><a href="/">Pattaya.Gym</a></li></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Direct</div><ul><li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li><li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer">LINE · @timpaemi</a></li><li><a href="/contact/">Contact page</a></li></ul></div>
  </div>
  <div class="footer-base"><span>© 2026 TimPaemi Co., Ltd. · All rights reserved</span><span style="color:var(--cyan);">★ Last updated · ${BUILD_TS} · v${ASSET_VERSION}</span><span>12.92°N · 100.87°E · Pattaya Villa</span></div>
</footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>
<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${ASSET}"></script>`;
}

function head(title, desc, url) {
  const webpage = {'@context':'https://schema.org','@type':'CollectionPage','@id':`${url}#webpage`,url,name:title,description:desc,inLanguage:'en',isPartOf:{'@id':`${SITE}/#website`}};
  const crumbs = {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':`${SITE}/`},{'@type':'ListItem','position':2,'name':'Guides','item':`${SITE}/guides/`},{'@type':'ListItem','position':3,'name':title.split('|')[0].trim(),'item':url}]};
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<link rel="preload" href="/styles.css${ASSET}" as="style">
<link rel="preload" href="/fonts/space-grotesk-700.woff2${ASSET}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css${ASSET}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:url" content="${url}">
<meta property="og:type" content="article">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pattaya.Gym">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@PattayaGym">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="//maps.google.com">
<link rel="dns-prefetch" href="//www.googletagmanager.com">
<script type="application/ld+json">${JSON.stringify(webpage)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>`;
}

function breadcrumb(label) {
  return `<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);"><a href="/" style="color:var(--muted);">Home</a> <span style="color:var(--hint); margin:0 8px;">/</span> <a href="/guides/" style="color:var(--muted);">Guides</a> <span style="color:var(--hint); margin:0 8px;">/</span> <span style="color:var(--text); font-weight:600;">${esc(label)}</span></nav>`;
}

const GUIDES = [
  {
    slug: 'english-speaking-muay-thai-pattaya',
    crumb: 'English-speaking Muay Thai',
    title: 'English-speaking Muay Thai gyms in Pattaya | Pattaya.Gym',
    desc: 'The 10 best English-speaking Muay Thai gyms in Pattaya for foreign tourists, beginners, and long-stay trainers. Hand-checked English-fluent kru and trainer recommendations.',
    accent: 'accent-pink',
    eyebrow: 'Guide · Muay Thai · English-speaking · 10 venues',
    h1: 'English-speaking <span class="accent-pink">Muay Thai.</span>',
    lede: 'You don\'t need any Thai to train Muay Thai in Pattaya. Most reputable camps have English-fluent kru as the norm — not the exception. This guide cuts straight to the 10 gyms where you can show up with zero Thai, learn proper technique, and not waste your trip on language friction.',
    body: `
<p>Pattaya is the most foreigner-friendly Muay Thai city in Thailand. Bangkok has stronger lineage; Phuket has the resort packages; but Pattaya has the highest density of English-speaking kru per square kilometre because the city has been training Western fighters since the 1980s.</p>

<p>The list below is built from our 158-venue Pattaya.Gym directory. Every gym here has at least one head kru or senior trainer who can run a complete pad round in English — including technique corrections, conditioning instructions, and sparring callouts. We've trained at or visited every one personally, in 2025-2026.</p>

<h2>What "English-speaking" actually means at a Pattaya gym</h2>

<p>"English" coverage at Thai gyms falls into three tiers:</p>

<ul>
<li><strong>Tier A — fully fluent kru:</strong> head trainer explains technique nuances, corrects form, calls combos in English. You can ask questions and get real answers. This is what foreign tourists actually want.</li>
<li><strong>Tier B — gym English:</strong> trainers know "kick", "jab", "right", "switch", "again" — enough to run a pad round but not to teach you why your hip is wrong.</li>
<li><strong>Tier C — Thai-only with translator:</strong> the gym has one front-desk person who translates, but day-to-day training is in Thai. Authentic, but slow when you're learning.</li>
</ul>

<p>The 10 picks below are Tier A. If your priority is "training trip" rather than "Thai immersion", these are the gyms.</p>

<h2>1. Fairtex Training Center Pattaya — the obvious answer</h2>

<p>The largest Muay Thai resort camp in the world (9 rings, 17 trainers) is also the most English-mature. <a href="/gyms/fairtex-pattaya/">Fairtex Pattaya</a> has been the default foreign-tourist entry point since the early 2000s. English is the operating language. Head trainers include Yodsanklai Fairtex, Smilla Sundell's old coaches, and dedicated foreigner-stream coaches. On-site hotel, 25m pool, restaurant, gym. ฿฿฿. Expect to share the ring with 2-week first-timers and visiting champions in the same session.</p>

<h2>2. Sityodtong Pattaya — the legacy choice</h2>

<p>Founded 1960 by Kru Yodtong. The gym that trained Rob Kaman, Ramon Dekkers, and produced 57+ world champions including Samart Payakaroon. The current generation of trainers speaks proficient English because Sityodtong has been a pilgrimage site for foreign fighters for 30 years. <a href="/gyms/sityodtong-pattaya/">Sityodtong Pattaya</a> is more authentic and less resort-y than Fairtex; Naklua / Nong Prue side. ฿฿. If you want the lineage experience, this is the gym.</p>

<h2>3. Kombat Group Thailand — the all-inclusive for travellers</h2>

<p><a href="/gyms/kombat-group-thailand/">Kombat Group</a> in Huai Yai (East Pattaya, near Chak Nok Lake) operates entirely in English because their clientele is 90% European/Russian/Australian travellers. Christian Daghio's legacy (190 MT fights, 7x World Champ). Multi-discipline: Muay Thai + boxing + MMA + BJJ + Krav. 6 rings. All-inclusive packages with accommodation, meals, training, airport transfer. ฿฿฿. Best option if you want a turn-key trip with zero logistics.</p>

<h2>4. WKO Muay Thai &amp; Fitness Pattaya (ISS Gym) — the budget legend</h2>

<p>Owner Sifu McInnes was the first Westerner to referee at Lumpinee Stadium (1993). The whole gym operates in English. Resident trainer Sakmongkol (231-20-4 record, 3x Lumpinee champion, 5x WMC champion) speaks English and works pads daily. <a href="/gyms/wko-muay-thai/">WKO</a> is in Central Pattaya / Pattaya Klang — convenient, cheap (~฿4,000/month), unpretentious. Best price-to-coaching-quality ratio in Pattaya.</p>

<h2>5. Battle Conquer Gym Pattaya — fully air-conditioned and English-friendly</h2>

<p><a href="/gyms/battle-conquer-gym/">Battle Conquer</a> is Pattaya's only fully air-conditioned Muay Thai gym (this matters more than you think when training in the Pattaya heat). Central Pattaya, near the beach. English-speaking trainers, 7-day flexible scheduling, weight room, sauna, ice plunge. Twice-daily group classes. ฿฿. The choice if you want comfort without losing technical quality.</p>

<h2>6. Petchrungruang Gym — Sylvie von Duuglas-Ittu's home gym</h2>

<p><a href="/gyms/petchrungruang-gym/">Petchrungruang</a> is Pattaya's 2nd-oldest gym (1986), three generations of the same family. Head coach Khru Nu (Lumpinee 2nd-place, 90+ fights) speaks functional English. The gym is internationally known as the home of Sylvie von Duuglas-Ittu (270+ Muay Thai fights, English-language Muay Thai blogger of record). The family-run vibe means more individual attention. ฿. Authentic but accessible.</p>

<h2>7. Sanit Sport Club — for non-Muay-Thai-only training</h2>

<p><a href="/gyms/sanit-sport-club/">Sanit Sport Club</a> at Mabprachan is a multi-zone facility — Muay Thai + boxing + MMA + general fitness. English coverage is solid because they cater to long-stay expats. Good if your training program is mixed (Muay Thai twice a week, fitness/strength the rest), not pure Muay Thai. East Pattaya / Darkside location. ฿฿.</p>

<h2>8. Rambaa Somdet M16 Muay Thai &amp; MMA — for the fighter track</h2>

<p>Rambaa Somdet was a real Lumpinee fighter and now coaches both Muay Thai and MMA at his gym in <a href="/gyms/rambaa-somdet-m16/">M16</a>. English is functional. The gym attracts foreigners who want a fighter pathway rather than tourist-track training. Smaller, more demanding, less polished than Fairtex. ฿฿.</p>

<h2>9. MAX Muay Thai Stadium — for the stadium experience + clinic</h2>

<p><a href="/gyms/max-muay-thai-stadium/">MAX</a> isn't primarily a training gym — it's the modern Pattaya fight promotion stadium. But they run a Western-friendly Muay Thai clinic during fight-camp lead-ups, and the announce + match-day language is English. Worth knowing about if your trip overlaps a MAX fight night (most weeks).</p>

<h2>10. Lumpinee &amp; Rajadamnern Stadium (Bangkok day-trips)</h2>

<p>If you're serious enough to train in Pattaya but want to also see the most prestigious Muay Thai stadium in the world, <a href="/gyms/lumpinee-boxing-stadium/">Lumpinee</a> and <a href="/gyms/rajadamnern-stadium/">Rajadamnern</a> are both ~2 hours from Pattaya by minivan. Pure stadium experience, not training, but English-language commentary is now standard. Fairtex Pattaya's Friday-Saturday fight cards often feed talent up to these venues.</p>

<h2>How to actually pick</h2>

<p>If you're new to Muay Thai and have 1-2 weeks: <a href="/gyms/fairtex-pattaya/">Fairtex</a> or <a href="/gyms/kombat-group-thailand/">Kombat Group</a> — the all-inclusive resort experience is worth it for first-timers.</p>

<p>If you have 1-3 months and want serious training without the resort markup: <a href="/gyms/wko-muay-thai/">WKO</a>, <a href="/gyms/petchrungruang-gym/">Petchrungruang</a>, or <a href="/gyms/sityodtong-pattaya/">Sityodtong</a>.</p>

<p>If you want air-conditioned comfort: <a href="/gyms/battle-conquer-gym/">Battle Conquer</a>.</p>

<p>If you're a serious amateur considering fighting: <a href="/gyms/sityodtong-pattaya/">Sityodtong</a>, <a href="/gyms/rambaa-somdet-m16/">M16</a>, or <a href="/gyms/petchrungruang-gym/">Petchrungruang</a>.</p>

<h2>FAQ</h2>

<h3>Do I need to speak any Thai to train Muay Thai in Pattaya?</h3>
<p>No. The 10 gyms in this guide all operate primarily in English. Many Pattaya gyms outside this list also work for non-Thai speakers — the city has been training foreigners for 40 years. Polite Thai greetings (sawasdee krap, khop khun krap) are appreciated but not required.</p>

<h3>What's the price range for English-speaking Muay Thai in Pattaya?</h3>
<p>Drop-in classes are typically ฿400-600 per session. Weekly passes ฿1,500-3,000. Monthly unlimited ฿4,000-12,000 depending on the gym tier. Premium camps with accommodation (Fairtex, Kombat Group) run ฿20,000-40,000/week all-inclusive. Budget gyms like WKO start at ฿4,000/month.</p>

<h3>Are women welcome at Pattaya Muay Thai gyms?</h3>
<p>Yes — every gym in this guide trains women alongside men. Female fighters are common at Sityodtong, Fairtex, and Petchrungruang. If you want women-instructor sessions specifically, ask in advance — most gyms can arrange them.</p>

<h3>Which gym is best for first-time Muay Thai?</h3>
<p>For zero-experience beginners: Fairtex or Kombat Group. They've trained more first-timers than any other camps and the trainer rotation specifically includes coaches who teach fundamentals patiently. If you have any martial-arts background already, WKO or Battle Conquer give you more technical depth for less money.</p>

<h3>Can I just walk in, or do I need to book?</h3>
<p>All 10 gyms accept walk-ins for the first class. Larger gyms (Fairtex, Kombat Group, Sityodtong) prefer advance contact so the head trainer knows you're coming. WhatsApp messages a day before usually work. Drop-in fees are paid in cash on arrival (some gyms accept card).</p>

<h3>How long should I train per day?</h3>
<p>Most foreign trainees do one session per day (2-2.5 hours, morning OR afternoon). Serious fighters do two-a-days (morning + afternoon). If you've never done Muay Thai, one session is plenty for week 1 — your shins, hips, and lungs will tell you when to take a rest day.</p>

<h2>Compare to other guides</h2>

<p>If you specifically want female-friendly training: see <a href="/guides/female-friendly-gyms-pattaya/">our female-friendly gyms guide</a>. For Russian-speaking trainers: <a href="/guides/pattaya-russian-speaking-sport/">Russian-speaking sport guide</a>. For beginners specifically: <a href="/guides/best-for-beginners-pattaya/">beginner-friendly gyms</a>. For the broader top picks across all language tiers: <a href="/guides/best-muay-thai-pattaya/">best Muay Thai Pattaya</a>.</p>
`
  },

  {
    slug: 'muay-thai-camps-with-accommodation-pattaya',
    crumb: 'Camps with accommodation',
    title: 'Muay Thai camps with accommodation in Pattaya | Pattaya.Gym',
    desc: 'The 8 Muay Thai camps in Pattaya with on-site accommodation, all-inclusive training+stay packages, and pricing. From budget bunkhouse to 5-star resort camp.',
    accent: 'accent-pink',
    eyebrow: 'Guide · Stay-and-train · 8 camps',
    h1: 'Camps with <span class="accent-pink">accommodation.</span>',
    lede: 'Stay-and-train packages remove every logistical excuse to not train. Pattaya has 8 Muay Thai camps offering on-site accommodation — from budget bunkhouse to 5-star resort. Here\'s what each costs, what\'s included, and how to pick.',
    body: `
<p>Stay-and-train packages are the simplest way to do a Pattaya Muay Thai trip if you don't want to deal with hotels, taxis, food logistics, and gym scheduling separately. You arrive, train, eat, sleep — all in one location.</p>

<p>This guide covers the 8 verified camps in Pattaya offering on-site accommodation as of 2026. Pricing tiers are listed in Thai Baht (฿). All are hand-checked from our 158-venue Pattaya.Gym directory.</p>

<h2>Pricing tier reference</h2>

<ul>
<li><strong>฿:</strong> Under ฿15,000/week — basic shared accommodation, training included, no frills</li>
<li><strong>฿฿:</strong> ฿15,000-30,000/week — private room, three meals, training, basic gym amenities</li>
<li><strong>฿฿฿:</strong> ฿30,000-60,000/week — resort-tier, hotel-style room, pool, premium gym, mixed disciplines</li>
<li><strong>฿฿฿฿:</strong> ฿60,000+/week — 5-star resort with Muay Thai integration, spa, multiple sport facilities</li>
</ul>

<h2>1. Fairtex Training Center Pattaya — flagship resort camp</h2>

<p><a href="/gyms/fairtex-pattaya/">Fairtex Pattaya</a> is the largest stay-and-train camp in Thailand. On-site hotel (Fairtex Sports Club Hotel), 25m pool, restaurant, 9 rings, 17 trainers. Single + double rooms. All-inclusive: room, three meals, two daily Muay Thai sessions, on-site pool, gym. ฿฿฿ to ฿฿฿฿ depending on room class. Visa-support letters available for long stays. Naklua side.</p>

<p>Best for: first-time visitors who want the resort experience with zero logistics. Champions train alongside tourists.</p>

<h2>2. Kombat Group Thailand — all-inclusive multi-discipline</h2>

<p><a href="/gyms/kombat-group-thailand/">Kombat Group</a> in Huai Yai (East Pattaya, rural setting near Chak Nok Lake) is the most fully all-inclusive option. Christian Daghio's legacy. Daily two-a-days Muay Thai + optional BJJ, MMA, Boxing, Krav Maga. Includes airport transfer, accommodation, meals, training, laundry, on-site pool, restaurant. ฿฿฿. 5/5 TripAdvisor average. Best total package for travellers without other commitments.</p>

<p>Best for: 1-4 week training trips where you want to test multiple disciplines and have everything handled.</p>

<h2>3. Pattana Sports Resort — golf + Muay Thai + fitness all-in-one</h2>

<p><a href="/gyms/pattana-sports-resort/">Pattana Sports Resort</a> (Bo Win, ~30 min from central Pattaya) is a multi-sport resort — golf course, tennis, pool, fitness, and a Muay Thai program. Hotel-style accommodation, multiple restaurants. ฿฿฿. Less Muay-Thai-focused than Fairtex or Kombat, but if your group includes non-Muay-Thai travellers (kids, partners, golfers), it's the only Pattaya option that genuinely serves everyone.</p>

<p>Best for: mixed groups where only one person does Muay Thai.</p>

<h2>4. Horseshoe Point Resort — equestrian + Muay Thai combo</h2>

<p><a href="/gyms/horseshoe-point-resort/">Horseshoe Point</a> is primarily an equestrian and tennis resort with hotel accommodation, but they integrate Muay Thai into their fitness offering. East Pattaya. ฿฿฿. Unusual choice but works for travellers who do horse-riding plus combat sports.</p>

<h2>5. Sanit Sport Club (Mabprachan) — long-stay-friendly</h2>

<p><a href="/gyms/sanit-sport-club/">Sanit Sport Club</a> isn't a hotel itself, but they have arrangements with multiple guesthouses within walking distance of Mabprachan Lake. Long-term expats often combine Sanit training with a monthly apartment rental in the area. Less polished than the resort options but cheaper and more flexible (฿). Best for 1+ month stays where you want flexibility on accommodation.</p>

<h2>6. Hilton Pattaya — hotel-first, fitness/Muay-Thai as amenity</h2>

<p><a href="/gyms/hilton-pattaya-fitness/">Hilton Pattaya</a> on Pratamnak Hill has a 5-star fitness club with personal-trainer-led Muay Thai sessions as a paid add-on. Hotel accommodation. ฿฿฿฿. Not the place to learn Muay Thai from scratch, but excellent for travellers who want to maintain training during a luxury Pattaya stay.</p>

<h2>7. Andaz Pattaya Jomtien — 5-star fitness with Muay Thai access</h2>

<p>Similar profile to Hilton — <a href="/gyms/andaz-pattaya-jomtien/">Andaz Pattaya Jomtien</a> is a Hyatt resort with full fitness facilities and on-call Muay Thai trainers. ฿฿฿฿. Pick this over Hilton if Jomtien beachfront matters more to you than Pratamnak hilltop.</p>

<h2>8. Movenpick Siam Na Jomtien — resort + sport amenities</h2>

<p><a href="/gyms/movenpick-siam-pattaya/">Movenpick</a> in Na Jomtien (Sattahip end) has a full sports center and arrangements with nearby Muay Thai gyms for guests. ฿฿฿฿. Family-friendly. Good base if your kids are coming and you want resort family amenities.</p>

<h2>What to actually ask before booking</h2>

<ul>
<li><strong>Is the price all-inclusive?</strong> Some camps quote "room + training" and meals + airport transfer + laundry are extra. Get a full breakdown.</li>
<li><strong>How many training sessions per day are included?</strong> Two-a-days are standard at serious camps; some resort camps run one-a-day with the second as optional.</li>
<li><strong>Visa letter for long stays?</strong> Camps over 30 days need to know if you need a sport-training visa support letter. Fairtex and Kombat Group both provide these.</li>
<li><strong>Cancellation policy?</strong> Most camps require 7-14 day cancellation notice. Some are flexible during low season.</li>
<li><strong>Skill level expectation?</strong> All camps welcome beginners; some (Sityodtong-style) lean toward fighter-track training. Ask honestly so you don't show up to a fighter gym as a holiday.</li>
</ul>

<h2>FAQ</h2>

<h3>What's the cheapest Muay Thai camp with accommodation in Pattaya?</h3>
<p>WKO Muay Thai's gym membership is ฿4,000/month, and they can recommend nearby guesthouses for ฿4,000-8,000/month. Total all-in cost: ฿8,000-12,000/month, which is roughly ฿2,000-3,000/week. That's less than half the budget tier of the all-inclusive camps. Tradeoff: you handle accommodation logistics separately.</p>

<h3>How long should I book?</h3>
<p>First-timers benefit from 1-2 week trips — long enough to see real technique improvement but short enough that the muscle pain doesn't compound. Serious trainees do 4-12 week blocks. Champions train year-round in 6-week cycles. If you've never done Muay Thai, start with 1 week and extend on arrival if you love it.</p>

<h3>Are visas required for a Pattaya Muay Thai trip?</h3>
<p>Stays under 30 days: most Western passport-holders get visa-exempt entry. 30-60 days: tourist visa (TR). 60+ days: education/sport visa (ED). Fairtex and Kombat Group provide the support letters needed for ED visas. See our Pattaya Visa Help sister site at pattayavisahelp.com for current rules.</p>

<h3>What's included in "all-inclusive"?</h3>
<p>At Fairtex and Kombat Group it typically means: private room, three meals daily, two Muay Thai sessions per day, pool access, gym access, laundry (Kombat), airport transfer (Kombat). NOT typically included: massage/recovery, fight equipment (gloves/wraps/shin guards), Bangkok day trips, alcohol, drone/photo packages. Confirm specifics with the camp.</p>

<h3>Can my non-training partner stay at the camp?</h3>
<p>Yes at Fairtex (hotel-style — partners can stay without training), yes at Kombat (they accept non-training partners at a discounted rate). Sityodtong is more fighter-focused and partners are accommodated case-by-case. Hilton/Andaz/Movenpick are hotels first so partners are obviously fine.</p>

<h3>Are camps open year-round?</h3>
<p>Yes. Pattaya doesn't have a Muay Thai off-season. Peak training months are November-March (cooler, lower humidity); rainy season May-October is quieter but trainers are equally available. Songkran week (April 13-15) most gyms close for the holiday.</p>

<h2>Compare to other guides</h2>

<p>For the best Muay Thai overall (not just stay-and-train): <a href="/guides/best-muay-thai-pattaya/">best Muay Thai Pattaya</a>. For English-speaking trainer coverage specifically: <a href="/guides/english-speaking-muay-thai-pattaya/">English-speaking Muay Thai</a>. For luxury sport+stay venues: <a href="/guides/luxury-sports-clubs-pattaya/">luxury sports clubs</a>. For long-stay/digital nomad fitness: <a href="/guides/pattaya-digital-nomad-fitness/">digital nomad fitness</a>.</p>
`
  },

  {
    slug: 'gym-day-pass-pattaya',
    crumb: 'Gym day-pass',
    title: 'Gym day-pass in Pattaya — drop-in fitness, no membership | Pattaya.Gym',
    desc: 'Pattaya gyms that accept walk-in day passes, drop-in fitness sessions, and no-contract weekly passes. Prices, equipment, and which to pick for short trips.',
    accent: 'accent-yellow',
    eyebrow: 'Guide · Day pass · No membership · 12 gyms',
    h1: 'Gym <span class="accent-yellow">day-pass</span> Pattaya.',
    lede: 'You don\'t need a monthly membership to train in Pattaya. Most reputable gyms accept day passes, weekly drop-in passes, and no-contract sessions. Here\'s where to walk in, what it costs, and what to expect.',
    body: `
<p>Day-pass gyms are the saver for short Pattaya trips. If you're here for 3-14 days, joining a gym on a monthly plan is wasteful — most of Pattaya's serious gyms accept walk-in day passes for ฿200-500, and weekly passes for ฿800-2,500.</p>

<p>This guide covers 12 fitness/gym venues in Pattaya that have a transparent day-pass option. Pricing tiers are listed below. All hand-checked from our 158-venue Pattaya.Gym directory.</p>

<h2>1. Anytime Fitness Pattaya — 24/7 day pass</h2>

<p><a href="/gyms/anytime-fitness-pattaya/">Anytime Fitness Pattaya</a> has the global Anytime Fitness day-pass policy: roughly ฿500/day or ฿2,000/week. Open 24/7 (key fob entry after hours). Two branches: Bukis Point (South Pattaya) and Sukhumvit-Pattaya (Again Pattaya outpost). Cardio, weights, group classes. The reliable choice if you're already a global Anytime member — your home-club key fob works.</p>

<h2>2. Jetts Fitness Pattaya — drop-in day pass</h2>

<p><a href="/gyms/jetts-fitness-pattaya/">Jetts Fitness Pattaya</a> at Mike Shopping Mall is a 24-hour gym from the Jetts Australian chain. Day passes around ฿400. Weekly ~฿1,500. Full equipment, mostly cardio + free weights + plate-loaded machines. No pool. Central Pattaya — walking distance from Beach Road.</p>

<h2>3. Fitness 7 — long-running Pattaya local</h2>

<p><a href="/gyms/fitness-7/">Fitness 7</a> is one of Pattaya's older locally-owned gyms. Day passes ฿200-300 (cheaper than the chains). Full free-weight room, plate-loaded machines, basic cardio. Less polished than Jetts/Anytime but better value if you're cost-conscious.</p>

<h2>4. Muscle Factory Pattaya — bodybuilding-focused day pass</h2>

<p><a href="/gyms/muscle-factory-pattaya/">Muscle Factory</a> is the hardcore bodybuilding gym in Pattaya. Day pass ~฿300. Mon-Fri 07:00-24:00, Sat-Sun 07:00-23:00. Heavy iron, plate-loaded everything, mirror walls. Not for cardio — for serious lifting. Foreigner-friendly but the regulars are competitive bodybuilders.</p>

<h2>5. Castra Gym — modern day-pass option</h2>

<p><a href="/gyms/castra-gym/">Castra Gym</a> is a newer Pattaya fitness venue with a transparent drop-in option. ฿฿. Mixed equipment — strength + cardio + functional. Good for travellers who want a non-chain experience.</p>

<h2>6. Universe Gym — old-school day-pass friendly</h2>

<p><a href="/gyms/universe-gym/">Universe Gym</a> is another long-running Pattaya local. ฿200-300 day passes. Strong free-weight selection, less cardio focus. Mostly Thai bodybuilders + foreign regulars.</p>

<h2>7. Tony's Gym — central, basic, very cheap</h2>

<p><a href="/gyms/tonys-gym/">Tony's Gym</a> in Central Pattaya is the cheapest day-pass option in the city (~฿100-150). No frills, no AC, basic equipment, but the price is unbeatable if you just need somewhere to lift for a session.</p>

<h2>8. Elite Gym &amp; Fitness Pattaya — mid-tier day pass</h2>

<p><a href="/gyms/elite-gym-fitness/">Elite Gym &amp; Fitness</a> accepts walk-ins around ฿300-400/day. Well-equipped, AC, mixed Thai/foreign crowd. Reliable middle-of-road choice.</p>

<h2>9. Platinum Fitness — Russian-friendly day pass</h2>

<p><a href="/gyms/platinum-fitness/">Platinum Fitness</a> accepts drop-ins; Russian-speaking front desk is common. Good for visitors from Russian-speaking countries who want a gym without language friction.</p>

<h2>10. Manhattan Pattaya Fitness — Pattaya local with day-pass</h2>

<p><a href="/gyms/manhattan-pattaya-fitness/">Manhattan Pattaya Fitness</a> has day-pass options at standard local-gym pricing. Solid equipment, popular with long-stay expats.</p>

<h2>11. Fitz Club — premium day-pass (hotel guest pricing)</h2>

<p><a href="/gyms/fitz-club/">Fitz Club</a> at Royal Cliff Hotels Group on Pratamnak Hill offers day passes for non-hotel-guests at premium pricing (฿1,000+/day). What you get: 7 tennis courts, 2 AC squash courts, swimming pool, gym, table tennis. ฿฿฿฿. Worth it for a one-day premium-club experience if you want to test multiple sports.</p>

<h2>12. Hilton Pattaya — hotel guest day-pass</h2>

<p><a href="/gyms/hilton-pattaya-fitness/">Hilton Pattaya</a> day passes are typically reserved for hotel guests but they can be arranged for outside visitors at ฿฿฿฿ pricing. 5-star equipment, spa access, pool, sauna. Worth it for a luxury one-off; not the everyday choice.</p>

<h2>How to actually pick a day-pass gym</h2>

<ul>
<li><strong>For 1-3 days:</strong> <a href="/gyms/tonys-gym/">Tony's Gym</a> (cheapest) or <a href="/gyms/jetts-fitness-pattaya/">Jetts</a> (most convenient location)</li>
<li><strong>For 1-2 weeks:</strong> <a href="/gyms/anytime-fitness-pattaya/">Anytime Fitness</a> weekly pass or <a href="/gyms/fitness-7/">Fitness 7</a></li>
<li><strong>Hardcore lifting:</strong> <a href="/gyms/muscle-factory-pattaya/">Muscle Factory</a></li>
<li><strong>Multiple sports in one day:</strong> <a href="/gyms/fitz-club/">Fitz Club</a></li>
<li><strong>24-hour access:</strong> <a href="/gyms/anytime-fitness-pattaya/">Anytime Fitness</a> or <a href="/gyms/jetts-fitness-pattaya/">Jetts</a></li>
<li><strong>Russian language preferred:</strong> <a href="/gyms/platinum-fitness/">Platinum Fitness</a></li>
</ul>

<h2>FAQ</h2>

<h3>How much does a gym day pass cost in Pattaya?</h3>
<p>Range is ฿100-1,000+ depending on tier. Budget local gyms (Tony's, Fitness 7, Universe): ฿100-300. Mid-tier (Anytime, Jetts, Elite): ฿300-500. Premium club tier (Fitz Club, Hilton): ฿1,000+. Most day passes are paid in cash at front desk on arrival.</p>

<h3>Do I need to bring anything besides money?</h3>
<p>Bring training clothes (shirt + shorts), athletic shoes, a towel (some budget gyms don't provide), and a water bottle. Gloves/wraps if you plan to do bag work. Most Pattaya gyms don't have lockers with locks built-in, so a small padlock is useful. Passport may be requested at chain gyms (Anytime, Jetts) for first-time registration.</p>

<h3>Do Pattaya gyms have steam room / sauna?</h3>
<p>Premium clubs (Fitz, Hilton, Andaz) yes. Mid-tier chains (Anytime, Jetts) usually not. Local gyms (Tony's, Muscle Factory, Fitness 7) generally no. Battle Conquer Gym (Muay Thai) has both sauna and ice plunge.</p>

<h3>What time do gyms open?</h3>
<p>24-hour: Anytime Fitness, Jetts (Jetts is 24h at most branches). Daily 06:00-23:00: most local gyms. Hotel gyms: typically 06:00-22:00 for non-guests. Confirm specifics with each venue — hours vary.</p>

<h3>Can I buy weekly or monthly passes without a contract?</h3>
<p>Yes at most gyms. Weekly: ฿800-2,500 depending on tier. Monthly without contract: ฿1,500-4,500 budget tier, ฿3,500-8,000 chain tier. Contract-based annual memberships are cheaper per-month but require commitment + signup fee.</p>

<h3>Are there women-only sessions or female trainers?</h3>
<p>Pattaya gyms are not gender-segregated by default. Most chain gyms have at least one female personal trainer available on request. Women-only group classes exist sparingly — Hilton Pattaya runs them occasionally. Most foreign female lifters find Pattaya gyms welcoming without needing women-only sessions.</p>

<h2>Compare to other guides</h2>

<p>For 24-hour gym specifically: <a href="/guides/24-hour-gyms-pattaya/">24-hour gyms Pattaya</a>. For cheapest gyms across all categories: <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms Pattaya</a>. For luxury sports clubs: <a href="/guides/luxury-sports-clubs-pattaya/">luxury sports clubs</a>. For digital-nomad / long-stay context: <a href="/guides/pattaya-digital-nomad-fitness/">digital nomad fitness Pattaya</a>.</p>
`
  }
];

let written = 0;
for (const g of GUIDES) {
  const url = `${SITE}/guides/${g.slug}/`;
  const html =
    head(g.title, g.desc, url)
    + marquee(TOP_MARQUEE, false)
    + nav()
    + breadcrumb(g.crumb)
    + `
<main id="main">

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-6); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// ${esc(g.eyebrow)}</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,8vw,96px); text-align:left;">${g.h1}</h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;">${g.lede}</p>
    <p class="hero-meta" style="text-align:left;">Updated ${TODAY} · Pattaya · 158 venues hand-checked</p>
  </div>
</section>

<section class="section" style="padding-top:var(--s-4);">
  <div class="wrap">
    <article class="venue-body" style="max-width:880px; margin:0 auto;">
${g.body}
    </article>
  </div>
</section>

</main>
`
    + paNetwork()
    + marquee(BOTTOM_MARQUEE, true)
    + footer()
    + '\n</body>\n</html>\n';

  const dir = path.join(ROOT, 'guides', g.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  written++;
  console.log(`  /guides/${g.slug}/ written (${(html.length/1024).toFixed(1)} KB)`);
}
console.log(`\nWrote ${written} new guide pages.`);
console.log(`Next: node build-v2.js (sitemap auto-picks guides/ slugs), then node scripts/inject-guide-schema.js.`);
