#!/usr/bin/env node
/**
 * build-plan-page.js
 *
 * Generates /plan-my-trip/index.html as a REAL, data-driven trip planner.
 *
 * The visitor answers 4 questions that the venue dataset can honestly
 * support — sport, trip length, budget, travel style — and the tool
 * returns a tailored plan: a recommended base venue, a training
 * structure keyed to trip length, complementary venues for rest days,
 * and practical notes.
 *
 *  - Pure client-side, no fetch, no external dependencies
 *  - Venue summary JSON at /data/plan-venues.json (computed family/stay/day-pass flags)
 *  - URL-param state (?sport=&length=&budget=&style=) -> bookmarkable plans
 *  - Replaces the old honest-stub /plan-my-trip/ page (Round 21 noindex stub)
 *
 * Run: node scripts/build-plan-page.js  (idempotent; called from PUSH chain)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : '419';
const ASSET = `?v=${ASSET_VERSION}`;
const BUILD_TS = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

const { GYMS, CATEGORIES } = require(path.join(ROOT, 'data.js'));
const VENUE_N = GYMS.length;

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ---- Computed tag clusters (the only tag groups the data reliably supports) ----
const FAMILY = ['family','family-friendly','family-camp','family-run','kids','kids-club','kids-program','kids-coaching','all-ages','birthday-parties','youth'];
const STAY   = ['accommodation','on-site-accommodation','stay-and-train','all-inclusive','resort'];
const DAYPASS= ['day-pass','walk-in','drop-in','no-contract','free-trial','casual'];
const PRICE  = { '฿':1, '฿฿':2, '฿฿฿':3, '฿฿฿฿':4 };
const hasAny = (tags, set) => (tags || []).some(t => set.indexOf(t) >= 0);

const venueSummary = GYMS.map(g => ({
  id: g.id,
  name: g.name,
  category: g.category,
  categoryLabel: (CATEGORIES.find(c => c.key === g.category) || {}).label || g.category,
  area: g.area || '',
  priceTier: PRICE[g.priceRange] || 0,
  price: g.priceRange || '',
  featured: !!g.featured,
  family: hasAny(g.tags, FAMILY),
  stay: hasAny(g.tags, STAY),
  daypass: hasAny(g.tags, DAYPASS),
  hours: g.hours || '',
  desc: (g.description || '').slice(0, 190)
})).sort((a, b) => a.name.localeCompare(b.name));
const VENUE_JSON = JSON.stringify(venueSummary);

// Categories that work as a trip "base" (a sport you travel to train/do)
const SPORT_OPTIONS = CATEGORIES.map(c => ({
  key: c.key, label: c.label, count: GYMS.filter(g => g.category === c.key).length
})).filter(c => c.count > 0);

// Trip-length editorial guidance — used by both the static content and the JS.
const LENGTHS = [
  { key: 'weekend', label: 'A weekend', sub: '2–3 days',
    sessions: '2–4 sessions total',
    body: 'A short, focused taster. Pick one base venue and do not over-plan — two to four sessions is plenty. Most camps and gyms welcome single drop-in sessions or a day pass, so you can train without committing to a package.' },
  { key: 'week', label: 'One week', sub: '5–7 days',
    sessions: '5–6 training days',
    body: 'The classic Pattaya training week. Train five or six days; twice-daily sessions are normal at resort camps if your body can take it. Keep one full rest day. A weekly package almost always beats paying per session.' },
  { key: 'twoweek', label: 'Two weeks', sub: '10–16 days',
    sessions: '10–12 sessions',
    body: 'Enough time to build real progress. Settle into a routine — twice-daily where you can handle it, with two lighter or rest days. Two-week packages and on-site (stay-and-train) accommodation start to pay for themselves here.' },
  { key: 'month', label: 'A month or more', sub: '30+ days',
    sessions: 'a full training block',
    body: 'A genuine training block. Monthly packages are the best value by far, and stay-and-train accommodation makes the logistics effortless. Plan deload days so you do not burn out, and if you will stay longer look into an education visa.' }
];

const STYLES = [
  { key: 'solo',   label: 'Solo / focused training', note: 'training is the point of the trip' },
  { key: 'family', label: 'With family',             note: 'kids-friendly venues and family options matter' },
  { key: 'casual', label: 'Casual / exploring',      note: 'drop-in friendly, no big commitment' }
];

const BUDGETS = [
  { key: 'any', label: 'No strong preference' },
  { key: '1', label: 'Backpacker — ฿' },
  { key: '2', label: 'Mid-range — ฿฿' },
  { key: '3', label: 'Comfortable — ฿฿฿' },
  { key: '4', label: 'Premium / luxury — ฿฿฿฿' }
];

// Complementary categories for rest days / the non-training half of a trip.
const CROSS = {
  'muay-thai': ['swimming','golf','watersports','yoga'],
  'mma':       ['swimming','yoga','watersports'],
  'bjj':       ['swimming','yoga','fitness'],
  'crossfit':  ['swimming','yoga','watersports'],
  'fitness':   ['swimming','watersports','golf','yoga'],
  'yoga':      ['fitness','swimming','watersports'],
  'golf':      ['fitness','swimming','watersports'],
  'racquet':   ['fitness','swimming','golf'],
  'swimming':  ['fitness','watersports','golf'],
  'watersports':['swimming','golf','adventure'],
  'climbing':  ['fitness','swimming','adventure'],
  'clubs':     ['swimming','fitness','watersports'],
  'kids-youth':['swimming','watersports','adventure'],
  'equestrian':['golf','watersports','swimming'],
  'adventure': ['watersports','golf','swimming']
};

const TOP_MARQUEE = ['★ EVERY GYM','EVERY RING','EVERY COURT',`${VENUE_N} VENUES`,'HAND-CHECKED','NO PAID PLACEMENTS','PATTAYA · THAILAND','UPDATED ROLLING'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA','NO PAID PLACEMENTS','HAND-CHECKED','EVERY GYM','EVERY RING','EVERY COURT',`★ LIVE ${VENUE_N} VENUES`,'UPDATED ROLLING'];
function marquee(items, bot) {
  const cls = bot ? 'marquee marquee-bottom' : 'marquee';
  const inner = items.map(it => `<span>${esc(it)}</span><span class="star">·</span>`).join('');
  return `<div class="${cls}" aria-hidden="true"><div class="marquee-track"><div class="marquee-set">${inner}</div><div class="marquee-set" aria-hidden="true">${inner}</div></div></div>`;
}

const title = 'Plan your Pattaya training trip — free trip builder | Pattaya.Gym';
const desc = 'Free Pattaya training-trip planner. Answer four questions — sport, trip length, budget, travel style — and get a tailored plan: a base venue, a training structure, rest-day picks and practical notes.';
const url = `${SITE}/plan-my-trip/`;

const webapp = {'@context':'https://schema.org','@type':'WebApplication','@id':`${url}#webapp`,url,name:'Pattaya Training Trip Planner',description:desc,inLanguage:'en','applicationCategory':'TravelApplication','operatingSystem':'Web','isPartOf':{'@id':`${SITE}/#website`},'offers':{'@type':'Offer','price':'0','priceCurrency':'THB'}};
const crumbs = {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':`${SITE}/`},{'@type':'ListItem','position':2,'name':'Plan my trip','item':url}]};

// Static, indexable length-guidance content (the tool also uses this data).
const lengthCards = LENGTHS.map((l, i) => `
      <div class="numcard">
        <div class="numcard-head"><span class="numcard-num">${String(i+1).padStart(2,'0')}</span><h3 class="numcard-title">// ${esc(l.label)} <span class="u-muted">· ${esc(l.sub)}</span></h3></div>
        <p class="numcard-body"><strong class="u-text">${esc(l.sessions)}.</strong> ${esc(l.body)}</p>
      </div>`).join('');

const sportOpts = '<option value="any">I\'m flexible / not sure yet</option>' +
  SPORT_OPTIONS.map(s => `<option value="${esc(s.key)}">${esc(s.label)} (${s.count})</option>`).join('');
const lengthOpts = LENGTHS.map(l => `<option value="${esc(l.key)}">${esc(l.label)} — ${esc(l.sub)}</option>`).join('');
const budgetOpts = BUDGETS.map(b => `<option value="${esc(b.key)}">${esc(b.label)}</option>`).join('');
const styleOpts = STYLES.map(s => `<option value="${esc(s.key)}">${esc(s.label)}</option>`).join('');

const html = `<!DOCTYPE html>
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
<link rel="stylesheet" href="/styles.css${ASSET}">
<link rel="preload" href="/fonts/space-grotesk.woff2${ASSET}" as="font" type="font/woff2" crossorigin>
<link rel="alternate" type="application/json" href="/feed.json" title="Pattaya.Gym feed">
<link rel="preload" href="/data/plan-venues.json" as="fetch" type="application/json" crossorigin>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pattaya.Gym">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@PattayaGym">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<script type="application/ld+json">${JSON.stringify(webapp)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${marquee(TOP_MARQUEE, false)}
<header class="nav" role="banner"><div class="nav-row"><a href="/" class="brand">pattaya<span class="dot">.</span>gym</a><nav class="nav-links" aria-label="Primary"><a href="/category/muay-thai/">Muay Thai</a><a href="/category/fitness/">Fitness</a><a href="/category/golf/">Golf</a><a href="/sports/">All sports</a><a href="/guides/">Guides</a><a href="/search/">Search</a></nav><button type="button" class="nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile"><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span></button><a href="/search/" class="nav-cta">★ Find a gym</a></div></header>
<nav class="nav-mobile" id="nav-mobile" hidden aria-label="Mobile menu">
  <a href="/" class="nav-mobile-link">Home</a>
  <a href="/category/muay-thai/" class="nav-mobile-link">Muay Thai</a>
  <a href="/category/fitness/" class="nav-mobile-link">Fitness</a>
  <a href="/category/golf/" class="nav-mobile-link">Golf</a>
  <a href="/sports/" class="nav-mobile-link">All sports</a>
  <a href="/guides/" class="nav-mobile-link">Guides</a>
  <a href="/plan-my-trip/" class="nav-mobile-link">Plan my trip</a>
  <a href="/compare/" class="nav-mobile-link">Compare</a>
  <a href="/search/" class="nav-mobile-link">Search</a>
  <a href="/about/" class="nav-mobile-link">About</a>
  <a href="/methodology/" class="nav-mobile-link">Methodology</a>
  <a href="/changelog/" class="nav-mobile-link">Changelog</a>
  <a href="/search/" class="nav-mobile-cta">★ Find a gym</a>
</nav>
<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);">
  <a href="/" class="u-muted">Home</a> <span class="u-crumb-sep">/</span> <span class="u-text-bold">Plan my trip</span>
</nav>

<main id="main">

<section class="hero" style="padding-top:var(--s-8); padding-bottom:var(--s-4); text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Trip planner · ${VENUE_N} venues · Free · No sign-up</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,8vw,96px); text-align:left;">Plan your <span class="accent-pink">trip.</span></h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;">Answer four quick questions and we will build a Pattaya training-trip plan from the ${VENUE_N} venues in our directory — a base venue to train at, a realistic structure for your trip length, picks for rest days, and practical notes. No paid placements; the recommendations are ranked only on fit.</p>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> Build your plan</div>
    <h2 class="h-section">Four <span class="accent-cyan">questions.</span></h2>
    <div class="plan-form" style="display:grid; gap:var(--s-4); max-width:560px; margin-top:var(--s-5);">
      <label style="display:block;"><span style="display:block; font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); margin-bottom:6px;">1 · What do you want to do?</span>
        <select id="q-sport" class="plan-select" style="width:100%;">${sportOpts}</select></label>
      <label style="display:block;"><span style="display:block; font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); margin-bottom:6px;">2 · How long is your trip?</span>
        <select id="q-length" class="plan-select" style="width:100%;">${lengthOpts}</select></label>
      <label style="display:block;"><span style="display:block; font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); margin-bottom:6px;">3 · What is your budget?</span>
        <select id="q-budget" class="plan-select" style="width:100%;">${budgetOpts}</select></label>
      <label style="display:block;"><span style="display:block; font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); margin-bottom:6px;">4 · How are you travelling?</span>
        <select id="q-style" class="plan-select" style="width:100%;">${styleOpts}</select></label>
      <div class="btn-row" style="gap:8px; flex-wrap:wrap;">
        <button type="button" class="btn btn-primary" id="plan-go">▶ Build my plan</button>
        <button type="button" class="btn btn-ghost" id="plan-share">↗ Share this plan</button>
      </div>
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> Your plan</div>
    <div id="plan-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
    <div id="plan-output"></div>
    <p id="plan-empty" class="lede" style="color:var(--muted);">Answer the four questions above and press <strong>Build my plan</strong> — your tailored trip appears here.</p>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">03</span> How long should you train?</div>
    <h2 class="h-section">Trip length <span class="accent-yellow">guidance.</span></h2>
    <p class="lede">Honest expectations for each trip length — the planner uses exactly this logic.</p>
    <div class="numlist">${lengthCards}</div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">04</span> How this works</div>
    <h2 class="h-section">No <span class="accent-cyan">paid placements.</span></h2>
    <p class="lede u-max-760">The planner ranks venues only on how well they fit your answers — sport, budget tier, travel style, and our editor's picks. No venue pays to appear or to rank higher; pattaya-gym.com takes no money from listed venues. Every venue links to its full hand-checked page so you can verify the details yourself before you book. Built and maintained in Pattaya.</p>
  </div>
</section>

</main>

<section class="pa-network"><a href="https://pattaya-authority.com/" target="_blank" rel="noopener noreferrer" class="u-plain-link"><div class="pa-network-badge">★ A Pattaya Authority property ★</div></a><h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2><p class="pa-network-sub">// Site engineered, operated &amp; maintained in-house<br>by the founders of TimPaemi</p></section>
${marquee(BOTTOM_MARQUEE, true)}
<footer class="footer" role="contentinfo"><div class="footer-grid"><div><div class="footer-brand">pattaya<span class="accent">.gym</span></div><div class="footer-slogan">Built in Pattaya. For Pattaya.</div><p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> ${VENUE_N} venues hand-checked. No paid placements. Independent directory operated by TimPaemi Co., Ltd. from our Pattaya villa.</p><p class="u-foot-meta">— Tim &amp; Paemi, founders</p><div class="footer-meta">TimPaemi Co., Ltd.<br>Pattaya City, Bang Lamung District<br>Chon Buri 20150 · Thailand</div></div><div class="footer-col"><div class="footer-col-h">// The site</div><ul><li><a href="/about/">About</a></li><li><a href="/methodology/">Methodology</a></li><li><a href="/guides/">Guides</a></li><li><a href="/sports/">All sports</a></li><li><a href="/search/">Search</a></li><li><a href="/compare/">Compare</a></li><li><a href="/changelog/">Changelog</a></li></ul></div><div class="footer-col"><div class="footer-col-h">// Projects</div><ul class="footer-projects"><li><a href="https://pattaya-authority.com/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a></li><li><a href="https://timpaemi.com/" target="_blank" rel="noopener noreferrer">TimPaemi</a></li><li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya Restaurant Guide</a></li><li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a></li><li><a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a></li><li><a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">Pattaya Coffee</a></li><li><a href="https://pattayastream.com/" target="_blank" rel="noopener noreferrer">Pattaya Villa Stream</a></li><li><a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a></li><li><a href="https://pattayapets.com/" target="_blank" rel="noopener noreferrer">PattayaPets</a></li><li><a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a></li></ul></div><div class="footer-col"><div class="footer-col-h">// Direct</div><ul><li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li><li><a href="https://api.whatsapp.com/send/?phone=66967286999" target="_blank" rel="noopener noreferrer">WhatsApp · +66 96 728 6999</a></li><li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer">LINE · @timpaemi</a></li><li><a href="/contact/">Contact page</a></li></ul></div></div><div class="footer-base"><span>© 2026 TimPaemi Co., Ltd. · All rights reserved</span><span class="footer-version-badge">Built ${BUILD_TS} · <a href="/changelog/">v${ASSET_VERSION}</a></span><span class="pattaya-time">Pattaya · <span class="pattaya-time-value" id="pt-clock">--:--</span> ICT</span></div></footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>

<script id="plan-meta" type="application/json">${JSON.stringify({ lengths: LENGTHS, styles: STYLES, cross: CROSS })}</script>

<script>
 (function(){
  var data = [];
  var meta = JSON.parse(document.getElementById('plan-meta').textContent);
  var byId = {};
  var lengthBy = {}; meta.lengths.forEach(function(l){ lengthBy[l.key] = l; });
  var styleBy = {}; meta.styles.forEach(function(s){ styleBy[s.key] = s; });

  var qSport = document.getElementById('q-sport');
  var qLength = document.getElementById('q-length');
  var qBudget = document.getElementById('q-budget');
  var qStyle = document.getElementById('q-style');
  var out = document.getElementById('plan-output');
  var empty = document.getElementById('plan-empty');
  var statusEl = document.getElementById('plan-status');

  function track(name, params){ try { if (window.gtag) window.gtag('event', name, params || {}); } catch(e){} }
  function esc(s){ return String(s==null?'':s).replace(/[<>&"']/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c];}); }

  function venueCard(v, tagline){
    var price = v.price ? '<span style="color:var(--yellow); font-weight:700;">' + esc(v.price) + '</span>' : '';
    var flags = [];
    if (v.featured) flags.push('★ Editor\\'s pick');
    if (v.stay) flags.push('Stay &amp; train');
    if (v.family) flags.push('Family-friendly');
    if (v.daypass) flags.push('Drop-in OK');
    return '<a href="/gyms/' + esc(v.id) + '/" class="numcard u-plain-link" style="display:block;">'
      + '<div class="numcard-head"><span class="numcard-num">→</span><h3 class="numcard-title">// ' + esc(v.name) + '</h3></div>'
      + '<p class="numcard-body">' + (tagline ? '<strong class="u-text">' + esc(tagline) + '</strong> ' : '')
      + esc(v.categoryLabel) + (v.area ? ' &middot; ' + esc(v.area) : '') + (price ? ' &middot; ' + price : '')
      + (v.desc ? '<br>' + esc(v.desc) + (v.desc.length >= 190 ? '…' : '') : '')
      + (flags.length ? '<br><span style="font-family:var(--font-mono); font-size:11px; color:var(--cyan); letter-spacing:0.06em;">' + flags.join(' &nbsp;·&nbsp; ') + '</span>' : '')
      + '</p></a>';
  }

  function scoreBase(v, sport, budget, style){
    if (sport !== 'any' && v.category !== sport) return -999;
    var s = 0;
    if (budget !== 'any' && v.priceTier > 0){
      var d = Math.abs(v.priceTier - parseInt(budget,10));
      s += d === 0 ? 4 : (d === 1 ? 1.5 : -1.5);
    }
    if (v.featured) s += 2.5;
    if (style === 'family' && v.family) s += 3;
    if (style === 'casual' && v.daypass) s += 2;
    if (style === 'solo' && v.stay) s += 1.2;
    return s;
  }

  function pickComplementary(baseCat, budget, style, excludeIds){
    var cats = meta.cross[baseCat] || ['swimming','fitness','watersports'];
    var pool = data.filter(function(v){ return cats.indexOf(v.category) >= 0 && excludeIds.indexOf(v.id) < 0; });
    pool.forEach(function(v){
      var s = 0;
      if (budget !== 'any' && v.priceTier > 0){
        var d = Math.abs(v.priceTier - parseInt(budget,10));
        s += d === 0 ? 3 : (d === 1 ? 1 : -1);
      }
      if (v.featured) s += 2;
      if (style === 'family' && v.family) s += 2;
      v._s = s;
    });
    pool.sort(function(a,b){ return b._s - a._s; });
    // de-dupe by category so rest-day picks are varied
    var seen = {}, picks = [];
    for (var i = 0; i < pool.length && picks.length < 3; i++){
      if (seen[pool[i].category]) continue;
      seen[pool[i].category] = 1; picks.push(pool[i]);
    }
    return picks;
  }

  function practicalNotes(base, lengthKey, budget){
    var notes = [];
    var L = lengthBy[lengthKey];
    if (L) notes.push('Plan for <strong>' + esc(L.sessions) + '</strong> over your ' + esc(L.label.toLowerCase()) + '.');
    if (budget === '1') notes.push('On a backpacker budget, ask about per-session and weekly rates and look for day-pass venues — no need to prepay a long package.');
    else if (budget === '4') notes.push('At the premium tier, resort camps and 5-star facilities often bundle accommodation, recovery and meals — ask what is included.');
    else notes.push('A weekly or multi-week package almost always beats paying per session — ask each venue for its package rates.');
    if (base && base.stay) notes.push('<strong>' + esc(base.name) + '</strong> offers on-site stay-and-train accommodation — the simplest way to handle logistics.');
    notes.push('Message the venue ahead on the contact details on its page to confirm current hours and prices before you travel.');
    return notes;
  }

  function render(sport, lengthKey, budget, style){
    var L = lengthBy[lengthKey] || meta.lengths[1];
    var St = styleBy[style] || meta.styles[0];
    var ranked = data.map(function(v){ return { v:v, s:scoreBase(v, sport, budget, style) }; })
                     .filter(function(x){ return x.s > -900; })
                     .sort(function(a,b){ return b.s - a.s; });
    if (!ranked.length){
      out.innerHTML = '<p class="lede">No venues matched — try widening the budget or choosing a different sport.</p>';
      empty.style.display = 'none';
      announce('No venues matched your answers.');
      return;
    }
    var bases = ranked.slice(0, Math.min(3, ranked.length)).map(function(x){ return x.v; });
    var baseCat = bases[0].category;
    var comp = pickComplementary(baseCat, budget, style, bases.map(function(b){ return b.id; }));

    var html = '';
    html += '<div class="trust-bar" style="margin-bottom:var(--s-4);">'
      + '<span class="trust-pill is-verified">' + esc(L.label) + '</span>'
      + '<span class="trust-pill">' + esc(St.label) + '</span>'
      + (budget !== 'any' ? '<span class="trust-pill">Budget ' + esc(['','฿','฿฿','฿฿฿','฿฿฿฿'][parseInt(budget,10)] || budget) + '</span>' : '')
      + '</div>';

    html += '<h3 class="h-section" style="font-size:clamp(22px,3vw,30px);">Your base' + (bases.length > 1 ? ' — top ' + bases.length + ' picks' : '') + '</h3>';
    html += '<p class="lede">Anchor your trip around ' + (bases.length > 1 ? 'one of these' : 'this venue') + ' — ranked purely on fit with your answers.</p>';
    html += '<div class="numlist">';
    html += venueCard(bases[0], 'Best match');
    for (var i = 1; i < bases.length; i++) html += venueCard(bases[i], 'Also strong');
    html += '</div>';

    html += '<h3 class="h-section" style="font-size:clamp(22px,3vw,30px); margin-top:var(--s-6);">Your training structure</h3>';
    html += '<p class="lede"><strong class="u-text">' + esc(L.sessions) + '.</strong> ' + esc(L.body) + '</p>';

    if (comp.length){
      html += '<h3 class="h-section" style="font-size:clamp(22px,3vw,30px); margin-top:var(--s-6);">For rest days &amp; the rest of the trip</h3>';
      html += '<p class="lede">Pattaya is more than one sport — these pair well with your training for recovery or a change of pace.</p>';
      html += '<div class="numlist">';
      comp.forEach(function(v){ html += venueCard(v, v.categoryLabel); });
      html += '</div>';
    }

    var notes = practicalNotes(bases[0], lengthKey, budget);
    html += '<h3 class="h-section" style="font-size:clamp(22px,3vw,30px); margin-top:var(--s-6);">Practical notes</h3>';
    html += '<ul class="lede" style="padding-left:22px;">' + notes.map(function(n){ return '<li>' + n + '</li>'; }).join('') + '</ul>';

    html += '<p style="margin-top:var(--s-5);"><a href="/sports/" class="u-cyan">Browse all 15 sports →</a> &nbsp; <a href="/compare/" class="u-cyan">Compare venues side by side →</a></p>';

    out.innerHTML = html;
    empty.style.display = 'none';
    announce('Plan ready: base venue ' + bases[0].name + ', ' + comp.length + ' rest-day picks.');
  }
  function announce(m){ if (statusEl) statusEl.textContent = m; }

  function readForm(){
    return { sport:qSport.value, length:qLength.value, budget:qBudget.value, style:qStyle.value };
  }
  function applyToForm(p){
    if (p.sport) qSport.value = p.sport;
    if (p.length) qLength.value = p.length;
    if (p.budget) qBudget.value = p.budget;
    if (p.style) qStyle.value = p.style;
  }
  function go(updateUrl){
    if (!data.length) {
      announce('Venue data still loading — wait a moment and try again.');
      return;
    }
    var p = readForm();
    if (updateUrl){
      var qs = 'sport=' + encodeURIComponent(p.sport) + '&length=' + encodeURIComponent(p.length)
             + '&budget=' + encodeURIComponent(p.budget) + '&style=' + encodeURIComponent(p.style);
      history.replaceState(null, '', window.location.pathname + '?' + qs);
      track('plan_build', p);
    }
    render(p.sport, p.length, p.budget, p.style);
  }

  document.getElementById('plan-go').addEventListener('click', function(){ go(true); });
  document.getElementById('plan-share').addEventListener('click', function(){
    go(true);
    var u = window.location.href;
    if (navigator.share){ navigator.share({ title:'My Pattaya training-trip plan', url:u }).catch(function(){}); }
    else if (navigator.clipboard){
      navigator.clipboard.writeText(u).then(function(){
        var b = document.getElementById('plan-share'), o = b.textContent;
        b.textContent = '✓ Link copied'; setTimeout(function(){ b.textContent = o; }, 2000);
      });
    } else { window.prompt('Copy link:', u); }
  });

  function boot() {
    data.forEach(function(v){ byId[v.id] = v; });
    var params = new URLSearchParams(window.location.search);
    if (params.get('sport') || params.get('length')){
      applyToForm({ sport:params.get('sport'), length:params.get('length'), budget:params.get('budget'), style:params.get('style') });
      go(false);
    }
  }

  fetch('/data/plan-venues.json', { credentials: 'same-origin' })
    .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(d){ data = d; boot(); })
    .catch(function(){
      empty.textContent = 'Could not load venue data. Refresh the page or use /search/ to browse venues.';
      announce('Venue data failed to load.');
    });
 })();
</script>
<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${ASSET}"></script>
</body>
</html>
`;

const dataDir = path.join(ROOT, 'data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'plan-venues.json'), JSON.stringify(venueSummary), 'utf8');
fs.mkdirSync(path.join(ROOT, 'plan-my-trip'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'plan-my-trip', 'index.html'), html, 'utf8');
console.log(`/plan-my-trip/index.html written (${(html.length/1024).toFixed(1)} KB HTML) + /data/plan-venues.json (${(VENUE_JSON.length/1024).toFixed(1)} KB, ${venueSummary.length} venues)`);
