#!/usr/bin/env node
/**
 * rebuild-tool-stubs.js
 *
 * The 5 tool pages (/map/, /compare/, /plan-my-trip/, /find-my-coach/, /favorites/)
 * were originally interactive JS-driven tools. They lost their JS during V2 migration.
 * Codex Nuclear V3 P0-3 flags them as "tool pages promise functionality they do not provide."
 *
 * This script rebuilds each as an HONEST V2 static page that:
 *  - Acknowledges the tool is being upgraded
 *  - Points users to working alternatives (/search/ + /category/* + /area/*)
 *  - Preserves the URL (no 301 churn, no SEO loss)
 *  - Carries proper V2 chrome (marquee, nav, footer, schema, hreflang)
 *
 * Run from repo root: `node scripts/rebuild-tool-stubs.js`
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';

// Read current asset version
const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : '406';
const ASSET = `?v=${ASSET_VERSION}`;
const TODAY = new Date().toISOString().slice(0, 10);
const BUILD_TIMESTAMP = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const TOP_MARQUEE = ['★ EVERY GYM','EVERY RING','EVERY COURT','158 VENUES','HAND-CHECKED','NO PAID PLACEMENTS','PATTAYA · THAILAND','UPDATED ROLLING'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA','NO PAID PLACEMENTS','HAND-CHECKED','EVERY GYM','EVERY RING','EVERY COURT','★ LIVE 158 VENUES','UPDATED ROLLING'];

function marquee(items, bottom) {
  const cls = bottom ? 'marquee marquee-bottom' : 'marquee';
  const inner = items.map(it => `<span>${esc(it)}</span><span class="star">·</span>`).join('');
  return `<div class="${cls}" aria-hidden="true">
  <div class="marquee-track">
    <div class="marquee-set">${inner}</div>
    <div class="marquee-set" aria-hidden="true">${inner}</div>
  </div>
</div>`;
}

function nav() {
  return `<header class="nav" role="banner">
  <div class="nav-row">
    <a href="/" class="brand">pattaya<span class="dot">.</span>gym</a>
    <nav class="nav-links" aria-label="Primary">
      <a href="/category/muay-thai/">Muay Thai</a>
      <a href="/category/fitness/">Fitness</a>
      <a href="/category/golf/">Golf</a>
      <a href="/sports/">All sports</a>
      <a href="/guides/">Guides</a>
      <a href="/search/">Search</a>
    </nav>
    <button type="button" class="nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile"><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span></button>
    <a href="/search/" class="nav-cta">★ Find a gym</a>
  </div>
</header>
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
</nav>`;
}

function pageScripts() {
  return `<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${ASSET}"></script>`;
}

function paNetwork() {
  return `<section class="pa-network">
  <a href="https://pattaya-authority.com/" target="_blank" rel="noopener noreferrer" class="u-plain-link">
    <div class="pa-network-badge">★ A Pattaya Authority property ★</div>
  </a>
  <h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2>
  <p class="pa-network-sub">// Site engineered, operated &amp; maintained in-house<br>by the founders of TimPaemi</p>
</section>`;
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
    <div class="footer-col"><div class="footer-col-h">// The site</div><ul><li><a href="/about/">About</a></li><li><a href="/methodology/">Methodology</a></li><li><a href="/guides/">Guides</a></li><li><a href="/sports/">All sports</a></li><li><a href="/search/">Search</a></li><li><a href="/compare/">Compare</a></li><li><a href="/pattaya-sport-stats/">Sport stats</a></li><li><a href="/changelog/">Changelog</a></li><li><a href="/privacy/">Privacy</a></li><li><a href="/press/">Press</a></li><li><a href="/add-your-gym/">Add your venue</a></li></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Projects</div><ul class="footer-projects"><li><a href="https://pattaya-authority.com/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a></li><li><a href="https://timpaemi.com/" target="_blank" rel="noopener noreferrer">TimPaemi</a></li><li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya Restaurant Guide</a></li><li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a></li><li><a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a></li><li><a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">Pattaya Coffee</a></li><li><a href="https://pattayastream.com/" target="_blank" rel="noopener noreferrer">Pattaya Villa Stream</a></li><li><a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a></li><li><a href="https://pattayapets.com/" target="_blank" rel="noopener noreferrer">PattayaPets</a></li><li><a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a></li></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Direct</div><ul><li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li><li><a href="https://api.whatsapp.com/send/?phone=66967286999" target="_blank" rel="noopener noreferrer">WhatsApp · +66 96 728 6999</a></li><li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer">LINE · @timpaemi</a></li><li><a href="/contact/">Contact page</a></li></ul></div>
  </div>
  <div class="footer-base">
    <span>© 2026 TimPaemi Co., Ltd. · All rights reserved</span>
    <span class="u-cyan">★ Last updated · ${BUILD_TIMESTAMP} · v${ASSET_VERSION}</span>
    <span>12.92°N · 100.87°E · Pattaya Villa</span>
  </div>
</footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>
${pageScripts()}`;
}

function head(title, desc, url, noindex) {
  const webpage = {
    '@context':'https://schema.org','@type':'WebPage','@id':`${url}#webpage`,
    url, name: title, description: desc, inLanguage: 'en',
    isPartOf: {'@id': `${SITE}/#website`}
  };
  const crumbs = {
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement: [
      {'@type':'ListItem','position':1,'name':'Home','item':`${SITE}/`},
      {'@type':'ListItem','position':2,'name':title.split('—')[0].split('|')[0].trim(),'item':url}
    ]
  };
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
<link rel="stylesheet" href="/styles.css${ASSET}">
<link rel="preload" href="/fonts/space-grotesk.woff2${ASSET}" as="font" type="font/woff2" crossorigin>
<link rel="alternate" type="application/json" href="/feed.json" title="Pattaya.Gym feed">
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
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="//maps.google.com">
<link rel="dns-prefetch" href="//www.googletagmanager.com">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<script type="application/ld+json">${JSON.stringify(webpage)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>`;
}

function breadcrumb(label) {
  return `<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);">
  <a href="/" class="u-muted">Home</a> <span class="u-crumb-sep">/</span> <span class="u-text-bold">${esc(label)}</span>
</nav>`;
}

// Each stub: title, desc, breadcrumb, eyebrow num, accent, h1, intro, "Use instead" cards, support note
const STUBS = [
  {
    slug: 'map',
    title: 'Pattaya gym map — 158 venues',
    desc: 'Interactive map of every gym, Muay Thai camp, and sport venue in Pattaya is rolling back online. In the meantime, browse 158 venues by area or sport.',
    crumb: 'Map',
    eyebrow: 'Map · Pattaya · 158 venues',
    accent: 'accent-cyan',
    h1: 'Pattaya gym <span class="accent-cyan">map.</span>',
    intro: 'Our interactive Leaflet map is being rebuilt for V2. Until it returns, every venue is browsable by neighborhood (6 areas), by sport (15 categories), or via the live search.',
    alts: [
      {url: '/search/', title: 'Live venue search', desc: 'Filter 158 venues by name, sport, area, price, or open-now status. Live results, no page reload.'},
      {url: '/area/jomtien/', title: 'Browse by area', desc: 'Every venue in Jomtien, Naklua, Pratamnak, Central Pattaya, East Pattaya, or Sattahip.'},
      {url: '/category/muay-thai/', title: 'Browse by sport', desc: '15 sports including Muay Thai, fitness, golf, yoga, watersports, climbing, racquet sports.'}
    ]
  },
  // NOTE: 'compare' is now built by scripts/build-compare-page.js as a real functional tool.
  // Do NOT add it back here — that would overwrite the real /compare/ page with a stub.
  // NOTE: 'plan-my-trip' is now built by scripts/build-plan-page.js as a real
  // functional trip planner. Do NOT add it back here - that would overwrite it.
  {
    slug: 'find-my-coach', noindex: true,
    title: 'Find your Pattaya coach',
    desc: 'A coach finder by sport, language, level, and area is on the roadmap. Until it ships, browse venues by category and check each one for English-speaking, women-only, or beginner-friendly trainers.',
    crumb: 'Find a coach',
    eyebrow: 'Coach finder · Coming back',
    accent: 'accent-mint',
    h1: 'Find your <span class="accent-mint">coach.</span>',
    intro: 'A coach-by-coach finder is being built for V2. For now, each venue page lists head trainers, languages, beginner-friendliness, and program style — so you can shortlist matches by browsing venues directly.',
    alts: [
      {url: '/category/muay-thai/', title: 'Browse Muay Thai venues', desc: '38 camps with head trainers named, lineage notes, English-speaking flags, beginner-friendly flags.'},
      {url: '/guides/pattaya-solo-female-fitness/', title: 'Solo female fitness', desc: 'Female-friendly Pattaya gyms, women-only classes, and trauma-informed trainers.'},
      {url: '/search/', title: 'Filter by what you need', desc: 'Live search includes language flags and beginner-friendly tags on most venue cards.'}
    ]
  },
  {
    slug: 'favorites', noindex: true,
    title: 'Your saved Pattaya gyms',
    desc: 'A local-storage favorites tool is being rebuilt. For now, bookmark your shortlist in your browser, or use the search filter and category pages to build a list.',
    crumb: 'Favorites',
    eyebrow: 'Favorites · Coming back',
    accent: 'accent-pink',
    h1: 'Your <span class="accent-pink">favorites.</span>',
    intro: 'The save-this-venue tool is being rebuilt for V2 with browser local-storage so your shortlist persists across visits. Until it returns, use your browser bookmarks — every venue has a stable URL that you can bookmark and share.',
    alts: [
      {url: '/search/', title: 'Build a shortlist', desc: 'Live search makes it easy to filter to 3-5 venues that match your criteria.'},
      {url: '/category/muay-thai/', title: 'Top picks by sport', desc: 'Each category page surfaces the top 3 venues at the top with full editorial picks below.'},
      {url: '/about/', title: 'How we rank', desc: 'Our methodology — independent, hand-checked, no paid placements, re-verified on a rolling schedule.'}
    ]
  }
];

function render(stub) {
  const url = `${SITE}/${stub.slug}/`;
  const altCards = stub.alts.map(a => `
      <a href="${a.url}" class="numcard u-plain-link">
        <div class="numcard-head">
          <span class="numcard-num">→</span>
          <h3 class="numcard-title">// ${esc(a.title)}</h3>
        </div>
        <p class="numcard-body">${esc(a.desc)}</p>
      </a>`).join('');

  return head(stub.title, stub.desc, url, stub.noindex)
    + marquee(TOP_MARQUEE, false)
    + nav()
    + breadcrumb(stub.crumb)
    + `
<main id="main">

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-6); text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// ${esc(stub.eyebrow)}</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,9vw,108px); text-align:left;">
      ${stub.h1}
    </h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width: 680px;">${stub.intro}</p>
    <div class="btn-row u-mt-6">
      <a href="/search/" class="btn btn-primary">▶ Use search instead</a>
      <a href="/guides/" class="btn btn-secondary">● Browse guides</a>
      <a href="/" class="btn btn-tertiary">Back to home →</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> Use this instead</div>
    <h2 class="h-section">Working <span class="${stub.accent}">alternatives.</span></h2>
    <p class="lede">While the tool is being rebuilt, these 3 paths get you to the same outcome.</p>
    <div class="numlist">${altCards}</div>
  </div>
</section>

<section class="section u-pt-4">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> When this returns</div>
    <h2 class="h-section">No <span class="accent-cyan">paid placements.</span> No <span class="accent-pink">fake reviews.</span></h2>
    <p class="lede">When the ${esc(stub.crumb.toLowerCase())} tool ships, it will follow the same rules as the rest of Pattaya.Gym — no paid placements, no fake reviews, no SEO spam. Subscribe via our RSS or check back monthly. The venue data the tool will pull from is already complete and live at <a href="/search/" class="u-cyan">/search/</a>.</p>
  </div>
</section>

</main>
`
    + paNetwork()
    + marquee(BOTTOM_MARQUEE, true)
    + footer()
    + '\n</body>\n</html>\n';
}

let written = 0;
for (const stub of STUBS) {
  const out = render(stub);
  const fp = path.join(ROOT, stub.slug, 'index.html');
  fs.writeFileSync(fp, out, 'utf8');
  written++;
}
console.log(`Rebuilt ${written} tool stub pages (/${STUBS.map(s => s.slug).join('/, /')}/) with V2 chrome + honest alternative-path cards`);
