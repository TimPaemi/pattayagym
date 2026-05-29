#!/usr/bin/env node
/**
 * migrate-legacy-guides-chrome.js
 *
 * Brings ranked/list guides (venue-hero + cat-venue-grid) in line with the
 * Round 32 editorial guide shell: V2 nav, self-hosted fonts, deferred analytics,
 * hero typography, deduped section wrappers. Preserves all venue cards, FAQs,
 * and JSON-LD already on each page.
 *
 * Skips editorial guides already on the hero layout:
 *   english-speaking-muay-thai-pattaya
 *   muay-thai-camps-with-accommodation-pattaya
 *   gym-day-pass-pattaya
 *
 * Run: node scripts/migrate-legacy-guides-chrome.js
 * Idempotent (skips pages already migrated).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const EDITORIAL_SLUGS = new Set([
  'english-speaking-muay-thai-pattaya',
  'muay-thai-camps-with-accommodation-pattaya',
  'gym-day-pass-pattaya',
]);

const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : '428';
const ASSET = `?v=${ASSET_VERSION}`;
const BUILD_TS = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const TOP_MARQUEE = ['★ EVERY GYM', 'EVERY RING', 'EVERY COURT', '158 VENUES', 'HAND-CHECKED', 'NO PAID PLACEMENTS', 'PATTAYA · THAILAND', 'UPDATED WEEKLY'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA', 'NO PAID PLACEMENTS', '100% HAND-CHECKED', 'EVERY GYM', 'EVERY RING', 'EVERY COURT', '★ LIVE 158 VENUES', 'UPDATED WEEKLY'];

function marquee(items, bottom) {
  const cls = bottom ? 'marquee marquee-bottom' : 'marquee';
  const inner = items.map(it => `<span>${esc(it)}</span><span class="star">·</span>`).join('');
  return `<div class="${cls}" aria-hidden="true"><div class="marquee-track"><div class="marquee-set">${inner}</div><div class="marquee-set" aria-hidden="true">${inner}</div></div></div>`;
}

function nav() {
  return `<header class="nav" role="banner">
  <div class="nav-row">
    <a href="/" class="brand">pattaya<span class="dot">.</span>gym</a>
    <nav class="nav-links" aria-label="Primary">
      <a href="/category/muay-thai/">Muay Thai</a>
      <a href="/category/fitness/">Fitness</a>
      <a href="/category/golf/">Golf</a>
      <a href="/category/yoga/">Yoga</a>
      <a href="/sports/">All sports</a>
      <a href="/guides/">Guides</a>
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

function breadcrumb(label) {
  return `<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);"><a href="/" style="color:var(--muted);">Home</a> <span style="color:var(--hint); margin:0 8px;">/</span> <a href="/guides/" style="color:var(--muted);">Guides</a> <span style="color:var(--hint); margin:0 8px;">/</span> <span style="color:var(--text); font-weight:600;">${esc(label)}</span></nav>`;
}

function tail(hasFavorites) {
  const fav = hasFavorites ? `\n<script defer src="/favorites.js${ASSET}"></script>` : '';
  return `${paNetwork()}
${marquee(BOTTOM_MARQUEE, true)}
<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div>
      <div class="footer-brand">pattaya<span class="accent">.gym</span></div>
      <div class="footer-slogan">Built in Pattaya. For Pattaya.</div>
      <p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> 158 venues hand-checked. No paid placements. Independent directory operated by TimPaemi Co., Ltd. from our Pattaya villa.</p>
      <p class="u-foot-meta">— Tim &amp; Paemi, founders</p>
      <div class="footer-meta">TimPaemi Co., Ltd.<br>Pattaya City, Bang Lamung District<br>Chon Buri 20150 · Thailand</div>
    </div>
    <div class="footer-col"><div class="footer-col-h">// The site</div><ul><li><a href="/about/">About</a></li><li><a href="/methodology/">Methodology</a></li><li><a href="/guides/">Guides</a></li><li><a href="/sports/">All sports</a></li><li><a href="/search/">Search</a></li><li><a href="/compare/">Compare</a></li><li><a href="/changelog/">Changelog</a></li></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Projects</div><ul class="footer-projects"><li><a href="https://pattaya-authority.com/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a></li><li><a href="https://timpaemi.com/" target="_blank" rel="noopener noreferrer">TimPaemi</a></li><li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya Restaurant Guide</a></li><li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a></li><li><a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a></li><li><a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">Pattaya Coffee</a></li><li><a href="https://pattayastream.com/" target="_blank" rel="noopener noreferrer">Pattaya Villa Stream</a></li><li><a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a></li><li><a href="https://pattayapets.com/" target="_blank" rel="noopener noreferrer">PattayaPets</a></li><li><a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a></li></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Direct</div><ul><li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li><li><a href="https://api.whatsapp.com/send/?phone=66967286999" target="_blank" rel="noopener noreferrer">WhatsApp · +66 96 728 6999</a></li><li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer">LINE · @timpaemi</a></li><li><a href="/contact/">Contact page</a></li></ul></div>
  </div>
  <div class="footer-base"><span>© 2026 TimPaemi Co., Ltd. · All rights reserved</span><span class="u-cyan">★ Last updated · ${BUILD_TS} · v${ASSET_VERSION}</span><span>12.92°N · 100.87°E · Pattaya Villa</span></div>
</footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>
<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${ASSET}"></script>${fav}
</body>
</html>`;
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

function buildHead(title, desc, url, jsonLd) {
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
${jsonLd}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${marquee(TOP_MARQUEE, false)}
${nav()}`;
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) blocks.push(m[0]);
  return blocks.join('\n');
}

function parseMeta(html) {
  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || 'Pattaya.Gym guide';
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '';
  const url = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/) || [])[1] || SITE;
  const crumb = (html.match(/font-weight:600;">([^<]+)<\/span><\/nav>/) || [])[1] || title.split('|')[0].trim();
  return { title, desc, url, crumb };
}

function dedupeMainWrappers(inner) {
  let s = inner;
  const dupOpen =
    /<section class="section" style="padding-top:var\(--s-8\);">\s*<div class="wrap">\s*<article class="venue-body"[^>]*>\s*<section class="section" style="padding-top:var\(--s-8\);">\s*<div class="wrap">\s*<article class="venue-body"[^>]*>/i;
  if (dupOpen.test(s)) {
    s = s.replace(dupOpen, '<section class="section" style="padding-top:var(--s-4);"><div class="wrap"><article class="venue-body" style="max-width:880px; margin:0 auto;">');
  }
  s = s.replace(
    /<\/article>\s*<\/div>\s*<\/section>\s*<\/article>\s*<\/div>\s*<\/section>/gi,
    '</article></div></section>'
  );
  return s.trim();
}

function extractVenueHeroBlock(inner) {
  const start = inner.indexOf('<div class="venue-hero">');
  if (start < 0) return null;
  const afterOpen = start + '<div class="venue-hero">'.length;
  const endMarker = inner.slice(afterOpen).search(/<\/div>\s*(?=\s*<section class="tldr"|<section class="tldr"|<div id="full-list"|<h2)/);
  if (endMarker < 0) return null;
  const end = afterOpen + endMarker;
  return {
    content: inner.slice(afterOpen, end),
    before: inner.slice(0, start),
    after: inner.slice(end + '</div>'.length).replace(/^\s+/, ''),
  };
}

function repairHeroSplit(html) {
  if (!html.includes('class="venue-lede"')) return html;
  const re =
    /(<section class="hero"[\s\S]*?<div class="guide-byline">[\s\S]*?<\/div>)\s*<\/section>\s*<section class="section"[^>]*><div class="wrap"><article[^>]*>\s*((?:<p class="venue-lede"[\s\S]*?<div class="venue-hero-meta">[\s\S]*?<\/div>)\s*(?:<\/div>\s*)?)(?=\s*<section class="tldr"|<h2)/;
  return html.replace(re, (_, heroPart, orphan) => {
    const fixed = orphan
      .replace(/<p class="venue-lede" style="([^"]*)">/g, '<p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px; $1">')
    .replace(/class="venue-lede"/g, 'class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;"')
      .replace(/(class="hero-lede" style="[^"]*")\s+style="/g, '$1; ')
      .replace(/\s*<\/div>\s*$/i, '')
      .trim();
    return `${heroPart}\n${fixed}\n  </div>\n</section>\n<section class="section" style="padding-top:var(--s-4);"><div class="wrap"><article class="venue-body" style="max-width:880px; margin:0 auto;">\n`;
  });
}

function upgradeVenueHero(inner) {
  if (!inner.includes('venue-hero')) return repairHeroSplit(inner);
  if (inner.includes('class="hero"') && !inner.includes('class="venue-lede"')) return inner;

  const block = extractVenueHeroBlock(inner);
  if (!block) return repairHeroSplit(inner);

  let heroContent = block.content
    .replace(/<span class="venue-cat-pill">[^<]*<\/span>\s*/i, '')
    .replace(/<h1 class="venue-h1">/i, '<h1 class="hero-h1" style="font-size:clamp(40px,8vw,96px); text-align:left;">')
    .replace(/<p class="venue-lede" style="([^"]*)">/g, '<p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px; $1">')
    .replace(/class="venue-lede"/g, 'class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;"');

  const countMatch = heroContent.match(/(\d+)\s+venues ranked/i);
  const kicker = countMatch ? `// Guide · ${countMatch[1]} venues ranked` : '// Guide';

  const hero = `<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-6); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">${esc(kicker)}</div>
    ${heroContent.trim()}
  </div>
</section>`;

  let body = block.after.trim();
  body = dedupeMainWrappers(body);

  if (!body.startsWith('<section class="section"')) {
    body = `<section class="section" style="padding-top:var(--s-4);"><div class="wrap"><article class="venue-body" style="max-width:880px; margin:0 auto;">${body}</article></div></section>`;
  }

  return repairHeroSplit(hero + '\n' + body);
}

function upgradeHubHero(inner) {
  if (!inner.includes('venue-h1') || inner.includes('class="hero"')) return inner;
  return inner.replace(
    /<div class="venue-hero">([\s\S]*?)<\/div>/,
    (_, body) => `<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-6); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// Guides hub</div>
    ${body.replace(/class="venue-h1"/g, 'class="hero-h1" style="font-size:clamp(40px,8vw,72px); text-align:left;"').replace(/class="venue-lede"/g, 'class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;"')}
  </div>
</section>`
  );
}

function migratePage(filePath, slug, isHub) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('class="venue-lede"') && html.includes('class="hero"')) {
    /* repair pass */
  } else if (html.includes('nav-mobile') && html.includes('/fonts/space-grotesk-700.woff2') && html.includes('site-ui.js') && !html.includes('fonts.googleapis.com')) {
    if (!isHub && html.includes('class="hero"') && !html.includes('venue-hero')) return 'skip';
    if (isHub && html.includes('hero-kicker')) return 'skip';
  }

  const { title, desc, url, crumb } = parseMeta(html);
  const jsonLd = extractJsonLd(html);
  const mainStart = html.indexOf('<main id="main">');
  const mainEnd = html.indexOf('</main>', mainStart);
  if (mainStart < 0 || mainEnd < 0) {
    console.warn(`  skip ${slug}: no <main>`);
    return 'fail';
  }

  let inner = html.slice(mainStart + '<main id="main">'.length, mainEnd);
  inner = dedupeMainWrappers(inner);
  if (isHub) inner = upgradeHubHero(inner);
  else inner = upgradeVenueHero(inner);

  const hasFavorites = inner.includes('favorite-btn');
  const crumbHtml = isHub
    ? `<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);"><a href="/" style="color:var(--muted);">Home</a> <span style="color:var(--hint); margin:0 8px;">/</span> <span style="color:var(--text); font-weight:600;">Guides</span></nav>`
    : breadcrumb(crumb);

  inner = repairHeroSplit(inner);

  const out =
    buildHead(title, desc, url, jsonLd) +
    crumbHtml +
    `\n<main id="main">\n${inner}\n</main>\n` +
    tail(hasFavorites);

  fs.writeFileSync(filePath, out, 'utf8');
  return 'ok';
}

const guidesDir = path.join(ROOT, 'guides');
let ok = 0;
let skip = 0;

const hub = path.join(guidesDir, 'index.html');
if (fs.existsSync(hub)) {
  const r = migratePage(hub, 'index', true);
  if (r === 'ok') {
    ok++;
    console.log('  /guides/ hub migrated');
  } else if (r === 'skip') {
    skip++;
    console.log('  /guides/ hub already current');
  }
}

for (const ent of fs.readdirSync(guidesDir, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  if (EDITORIAL_SLUGS.has(ent.name)) {
    console.log(`  /guides/${ent.name}/ skipped (editorial layout)`);
    skip++;
    continue;
  }
  const fp = path.join(guidesDir, ent.name, 'index.html');
  if (!fs.existsSync(fp)) continue;
  const r = migratePage(fp, ent.name, false);
  if (r === 'ok') {
    ok++;
    console.log(`  /guides/${ent.name}/ migrated`);
  } else if (r === 'skip') {
    skip++;
    console.log(`  /guides/${ent.name}/ already current`);
  }
}

console.log(`\nLegacy guide chrome: ${ok} migrated, ${skip} skipped.`);
