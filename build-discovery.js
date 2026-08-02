#!/usr/bin/env node
/**
 * pattaya-gym.com DISCOVERY pages:
 *   - /area/<slug>/      (Jomtien, Naklua, Pratamnak, East Pattaya, Central, Sattahip)
 *   - /guides/<slug>/    (Top-N listicles for long-tail SEO)
 *   - /search/           (client-side search page)
 *   - /add-your-gym/     (submission form page)
 * Runs after build-extras.js. Updates sitemap.xml.
 */
const fs = require('fs');
const path = require('path');
const { v2NavHtml } = require('./scripts/lib/v2-nav.js');
const { siteFooterHtml } = require('./scripts/lib/site-footer.js');

const ROOT = __dirname;
const SITE = 'https://pattaya-gym.com';
const ASSET_VERSION = '237';
const DEFAULT_OG_IMAGE = `${SITE}/og-image.png`;
const LAST_BUILD_DATE = new Date().toISOString().slice(0, 10);
function autoLinkVenues(html, currentSlug, allGyms) {
  if (!html || !Array.isArray(allGyms)) return html;
  const candidates = [];
  for (const g of allGyms) {
    if (!g || !g.id || g.id === currentSlug) continue;
    const name = g.name || '';
    if (!name) continue;
    const variants = new Set([name]);
    const noParen = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (noParen.length >= 6) variants.add(noParen);
    const noDash = noParen.replace(/\s*[\u2013\u2014\u2015|\-]\s+.*$/, '').trim();
    if (noDash.length >= 6) variants.add(noDash);
    const noPattaya = noDash.replace(/\s+Pattaya$/i, '').trim();
    if (noPattaya.length >= 6) variants.add(noPattaya);
    for (const v of variants) {
      const trimmed = String(v).trim();
      if (trimmed.length < 6) continue;
      if (/^(Pattaya|Thailand|Jomtien|Naklua|Fitness|Yoga|Boxing|Beach|Public)$/i.test(trimmed)) continue;
      candidates.push({ pattern: trimmed, slug: g.id });
    }
  }
  candidates.sort((a, b) => b.pattern.length - a.pattern.length);
  let out = html;
  const linkedSlugs = new Set();
  for (const c of candidates) {
    if (linkedSlugs.has(c.slug)) continue;
    const escaped = c.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(?<![\\w/-])' + escaped + '(?![\\w/-])', 'i');
    // Skip if pattern is inside an existing <a> or heading
    const split = out.split(/(<a\b[^>]*>[\s\S]*?<\/a>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<[^>]+>)/i);
    for (let i = 0; i < split.length; i++) {
      if (i % 2 === 1) continue;
      if (linkedSlugs.has(c.slug)) break;
      const match = split[i].match(re);
      if (match) {
        split[i] = split[i].replace(re, '<a href="/gyms/' + c.slug + '/">' + match[0] + '</a>');
        linkedSlugs.add(c.slug);
      }
    }
    out = split.join('');
  }
  return out;
}

function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function assetHref(file) {
  return `${file}?v=${ASSET_VERSION}`;
}
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function resolveDirectChild(parent, childName) {
  const parentPath = path.resolve(parent);
  const target = path.resolve(parentPath, childName);
  if (path.dirname(target) !== parentPath) {
    throw new Error('Refusing to operate outside ' + parentPath + ': ' + childName);
  }
  return target;
}
function cleanupChildDirs(parent, expectedNames, label) {
  ensureDir(parent);
  const expected = new Set(Array.from(expectedNames).map(String));
  fs.readdirSync(parent, { withFileTypes: true }).forEach(entry => {
    if (!entry.isDirectory() || expected.has(entry.name)) return;
    fs.rmSync(resolveDirectChild(parent, entry.name), { recursive: true, force: true });
    console.log('  [CLEAN] removed stale ' + label + ': ' + entry.name);
  });
}
function loadGymsFromDataJs() {
  const code = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  const win = {};
  new Function('window', code)(win);
  return { GYMS: win.GYMS || [], CATEGORIES: win.CATEGORIES || [] };
}
function header() {
  return `<a href="#main" class="skip-link">Skip to main content</a>
${v2NavHtml()}`;
  /* Legacy chrome retained below for historical full-build compatibility; unreachable. */
  return `<a href="#main" class="skip-link">Skip to main content</a>
<div class="marquee" aria-hidden="true"><div class="marquee-track"><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span></div></div>
<header class="nav" role="banner">
  <div class="nav-row">
    <a href="/" class="brand">Pattaya<span class="dot">.</span>Gym</a>
    <div class="nav-actions" aria-label="Primary">
      <a href="/search/" class="icon-btn" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></a>
      <a href="/" class="icon-btn icon-btn--ink" aria-label="Home"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg></a>
    </div>
  </div>
</header>`;
}

function newsletterFooterHtml() { return ""; }

function footer() {
  return siteFooterHtml(loadGymsFromDataJs().GYMS.length);
  /* Legacy chrome retained below for historical full-build compatibility; unreachable. */
  return `
  <div class="marquee-bottom" aria-hidden="true"><div class="marquee-track"><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span></div></div>
  <footer class="site-footer" role="contentinfo">
  <div class="site-footer-inner">
    <div class="sf-col sf-brand-col">
      <div class="sf-brand"><span class="brand-mark small">P</span><span class="sf-brand-text">PATTAYA <strong>GYM</strong></span></div>
      <p class="sf-tag">The most comprehensive directory of gyms, Muay Thai camps, and sport venues in Pattaya, Thailand.</p>
    </div>
    <div class="sf-col">
      <p class="sf-heading">Sport categories</p>
      <ul>
        <li><a href="/category/muay-thai/">Muay Thai camps</a></li>
        <li><a href="/category/fitness/">Fitness gyms</a></li>
        <li><a href="/category/golf/">Golf courses</a></li>
        <li><a href="/category/yoga/">Yoga studios</a></li>
        <li><a href="/category/watersports/">Watersports &amp; diving</a></li>
        <li><a href="/category/racquet/">Racquet sports</a></li>
        <li><a href="/category/swimming/">Swimming pools</a></li>
        <li><a href="/category/adventure/">Adventure</a></li>
      </ul>
    </div>
    <div class="sf-col">
      <p class="sf-heading">Areas of Pattaya</p>
      <ul>
        <li><a href="/area/jomtien/">Jomtien Beach</a></li>
        <li><a href="/area/naklua/">Naklua / North Pattaya</a></li>
        <li><a href="/area/pratamnak/">Pratamnak Hill</a></li>
        <li><a href="/area/central-pattaya/">Central Pattaya</a></li>
        <li><a href="/area/east-pattaya/">East Pattaya / Darkside</a></li>
        <li><a href="/area/sattahip/">Sattahip / Far South</a></li>
      </ul>
    </div>
    <div class="sf-col">
      <p class="sf-heading">Best-of guides</p>
      <ul>
        <li><a href="/guides/best-muay-thai-pattaya/">Best Muay Thai gyms</a></li>
        <li><a href="/guides/best-dive-operators-pattaya/">Best dive operators</a></li>
        <li><a href="/guides/best-golf-courses-pattaya/">Best golf courses</a></li>
        <li><a href="/guides/cheapest-gyms-pattaya/">Cheapest gyms</a></li>
        <li><a href="/guides/luxury-sports-clubs-pattaya/">Luxury sports clubs</a></li>
        <li><a href="/guides/24-hour-gyms-pattaya/">24-hour gyms</a></li>
        <li><a href="/guides/family-friendly-pattaya/">Family-friendly</a></li>
        <li><a href="/guides/best-for-beginners-pattaya/">Best for beginners</a></li>
        <li><a href="/guides/pattaya-digital-nomad-fitness/">Digital nomad fitness</a></li>
        <li><a href="/guides/female-friendly-gyms-pattaya/">Female-friendly venues</a></li>
        <li><a href="/guides/pattaya-seniors-low-impact-sport/">Seniors 65+ sport guide</a></li>
      </ul>
    </div>
    <div class="sf-col">
      <p class="sf-heading">Tools &amp; site</p>
      <ul>
        <li><a href="/search/">Search venues</a></li>
        <li><a href="/compare/">Compare venues</a></li>
        <li><a href="/plan-my-trip/">Plan my trip</a></li>
        <li><a href="/favorites/">Saved favorites</a></li>
        <li><a href="/map/">Map (rebuilding)</a></li>
        <li><a href="/find-my-coach/">Find my coach</a></li>
        <li><a href="/about/">About this site</a></li>
        <li><a href="/methodology/">Research methodology</a></li>
        <li><a href="/pattaya-sport-stats/">Sport tourism stats</a></li>
        <li><a href="/add-your-gym/">Add your gym</a></li>
        <li><a href="/contact/">Contact</a></li>
          <li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li>

          <li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener">LINE @timpaemi</a></li>
        <li><a href="/press/">Press</a></li>
      </ul>
    </div>
  </div>
  ${newsletterFooterHtml()}
  <div class="site-footer-base">
    <p>© ${new Date().getFullYear()} pattaya-gym.com — Every gym &amp; sport in Pattaya, Thailand.</p>
    <p class="sf-disclaimer">Last updated: ${LAST_BUILD_DATE}. Independent directory. No paid placements. Listings researched and source-cited from public information.</p>
          <p class="sf-builtby"><span class="sf-builtby-rule"></span><span class="sf-builtby-text">// Written and kept up to date by <a href="https://timpaemi.com/" rel="author noopener" class="sf-builtby-link">TIM &amp; PAEMI</a> <span class="sf-builtby-star">★</span></span><span class="sf-builtby-rule"></span></p>

  </div>
</footer>`;
}

function pageFeedbackHtml() { return ""; }

function commonHead(title, desc, canonical, schemaType, ogType) {
  const baselineSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": schemaType || "WebPage",
    "name": metaTitle(title),
    "description": metaDesc(desc),
    "url": canonical,
    "inLanguage": "en",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Pattaya Gym",
      "url": SITE + "/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": SITE + "/search/?q={search_term_string}" },
        "query-input": "required name=search_term_string"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Pattaya Gym",
      "url": SITE + "/",
      "logo": { "@type": "ImageObject", "url": DEFAULT_OG_IMAGE }
    }
  });
  return `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#f7f8f3" />
<meta name="apple-mobile-web-app-title" content="Pattaya Gym" />
<meta name="application-name" content="Pattaya Gym" />
<meta name="msapplication-TileColor" content="#f7f8f3" />
<meta name="msapplication-TileImage" content="/icon-192.png" />
<meta name="color-scheme" content="light" />
<meta name="build-id" content="${LAST_BUILD_DATE}" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icon-180.png" />
<title>${escHtml(metaTitle(title))}</title>
<meta name="description" content="${escHtml(metaDesc(desc))}" />
<link rel="canonical" href="${canonical}" />
<link rel="alternate" hreflang="en" href="${canonical}" />
<link rel="alternate" hreflang="x-default" href="${canonical}" />
<link rel="alternate" type="application/rss+xml" title="Pattaya Gym — Recently Added" href="/feed.xml" />
<link rel="alternate" type="application/json" title="Pattaya Gym Directory API" href="/api/venues.json" />
<link rel="alternate" type="application/feed+json" title="Pattaya Gym — JSON Feed" href="/feed.json" />
<link rel="alternate" type="text/markdown" title="Pattaya Gym for LLMs" href="/llms.txt" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta http-equiv="x-dns-prefetch-control" content="on" />
<link rel="dns-prefetch" href="//maps.google.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" />
<link rel="preconnect" href="https://plausible.io" crossorigin />
<meta property="og:type" content="${ogType || 'website'}" />
<meta property="og:locale" content="en_US" />
<meta property="og:site_name" content="Pattaya Gym" />
<meta property="og:title" content="${escHtml(metaTitle(title))}" />
<meta property="og:description" content="${escHtml(metaDesc(desc))}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:alt" content="Pattaya Gym — every sport venue in Pattaya, Thailand" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escHtml(metaTitle(title))}" />
<meta name="twitter:description" content="${escHtml(metaDesc(desc))}" />
<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />
<meta name="twitter:image:src" content="${DEFAULT_OG_IMAGE}" />
<meta name="thumbnail" content="${DEFAULT_OG_IMAGE}" />
<link rel="image_src" href="${DEFAULT_OG_IMAGE}" />
${stylesheetTags(true)}
<script type="application/ld+json">${baselineSchema}</script>
<script defer data-domain="pattaya-gym.com" src="https://plausible.io/js/script.js"></script>
<script src="${assetHref('/shortcuts.js')}" defer></script>
${siteUiScript()}
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23000'/%3E%3Ctext x='50' y='62' font-size='52' text-anchor='middle' fill='%23ffb800' font-family='sans-serif' font-weight='900'%3EP%3C/text%3E%3C/svg%3E" />`;
}

function venueCard(g) {
  const tags = (g.tags || []).slice(0, 3).map(t => `<span class="cv-pill cv-pill-tag">${escHtml(t)}</span>`).join('');
  return `<article class="cat-venue-card">
      <div class="cv-head">
      <h3><a href="/gyms/${escHtml(g.id)}/">${escHtml(g.name)}</a></h3>
      <button class="favorite-btn" data-pg-favorite-id="${escHtml(g.id)}" data-pg-favorite-name="${escHtml(g.name)}" data-pg-favorite-category="${escHtml(g.category || '')}" data-pg-favorite-area="${escHtml(g.area || '')}" data-pg-favorite-price="${escHtml(g.priceRange || '')}" aria-pressed="false" aria-label="Save to favorites"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button>
    </div>
${g.area ? `    <div class="cv-meta">📍 ${escHtml(g.area)}</div>` : ''}
${g.hours ? `    <div class="cv-meta">🕐 ${escHtml(g.hours)}</div>` : ''}
    <p>${escHtml(g.description || '')}</p>
    <div class="cv-tags">
${g.priceRange ? `      <span class="cv-pill">💰 ${escHtml(g.priceRange)}</span>` : ''}
      ${tags}
    </div>
    <a class="cv-cta" href="/gyms/${escHtml(g.id)}/">View full page -></a>
  </article>`;
}

function cleanText(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

function clipAtWord(s, max) {
  const text = cleanText(s);
  if (text.length <= max) return text;
  const cut = text.slice(0, Math.max(0, max - 3));
  const boundary = cut.lastIndexOf(' ');
  return (boundary > 40 ? cut.slice(0, boundary) : cut).replace(/[.,;:\s]+$/, '') + '...';
}

function metaTitle(s) {
  let title = clipAtWord(cleanText(s).replace(/&/g, 'and').replace(/[?']/g, '').replace(/[??]/g, '-'), 58);
  if (title.length < 30) {
    if (/^Press \| Pattaya Gym Directory$/i.test(title)) title = 'Press Kit | Pattaya Gym Directory';
    else if (/Pattaya Gym/i.test(title)) title = clipAtWord(title + ' Official', 58);
    else title = clipAtWord(title + ' | Pattaya Gym', 58);
  }
  return title;
}

function metaDesc(s) {
  const base = clipAtWord(s, 145);
  if (base.length >= 100) return base;
  const expanded = (base ? base.replace(/[.\s]+$/, '') + '. ' : '') + 'Find verified Pattaya sport venues, maps, hours, price ranges and contact details on Pattaya Gym Directory.';
  return clipAtWord(expanded, 155);
}

function criticalCss() {
  return `<style>:root{color-scheme:light}html{background:#f7f8f3}body{margin:0;background:#f7f8f3;color:#121212;font-family:"Inter Tight",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased}*,*::before,*::after{box-sizing:border-box}a{color:inherit;text-decoration:none}img,svg,video{max-width:100%;display:block;height:auto}</style>`;
}

function desktopTocCriticalCss() {
  return `<style>@media(min-width:1100px){.venue-content-shell.has-toc{display:grid;grid-template-columns:240px minmax(0,1fr);gap:48px;align-items:start}.venue-content-shell.has-toc .jump-to{position:sticky;top:96px;max-height:calc(100vh - 120px);overflow-y:auto}}</style>`;
}

function asyncStylesheet(file) {
  const href = assetHref(file);
  return `<link rel="preload" href="${href}" as="style" />
<link rel="stylesheet" href="${href}" />`;
}

function accessibilityCriticalCss() {
  return `<style>.skip-link{position:absolute;left:-9999px;top:0;z-index:1000;background:#d4a72c;color:#0a0a0a;padding:12px 18px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;text-decoration:none}.skip-link:focus{left:8px;top:8px}:focus-visible{outline:2px solid #d4a72c;outline-offset:3px}</style>`;
}

function trustCriticalCss() {
  // Stripped — editorial styling lives in styles.css.
  return ``;
}

function stylesheetTags(includeVenueCss = true) {
  return `${criticalCss()}
${desktopTocCriticalCss()}
${accessibilityCriticalCss()}
${trustCriticalCss()}
${asyncStylesheet('/styles.css')}
${includeVenueCss ? asyncStylesheet('/venue.css') : ''}`;
}

function siteUiScript() {
  return `<script src="${assetHref('/site-ui.js')}" defer></script>`;
}

function finalizeHtml(html) {
  return String(html)
    .replace(/<button\b(?![^>]*\btype=)/g, '<button type="button"')
    .replace(/\s+onerror="this\.parentElement\.style\.display='none'"/g, ' data-fallback-hide="parent"')
    .replace(/\s+onload="this\.media='all'"/g, '')
    .replace(/\s+onload="this\.onload=null;this\.rel='stylesheet'"/g, '');
}

function textForVenue(g) {
  return cleanText([
    g.name,
    g.category,
    g.area,
    g.address,
    g.hours,
    g.priceRange,
    g.description,
    (g.tags || []).join(' ')
  ].join(' ')).toLowerCase();
}

function guideCopy(value, sorted, allGyms) {
  const text = typeof value === 'function' ? value(sorted, allGyms) : value;
  return cleanText(text).replace(/\{count\}/g, String(sorted.length)).replace(/\{total\}/g, String(allGyms.length));
}

function categoryLabel(key, allCats) {
  const cat = (allCats || []).find(c => c.key === key);
  return cat ? cat.label : key;
}

function countBy(items, getKey) {
  const counts = new Map();
  items.forEach(item => {
    const key = getKey(item) || 'Unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function venueMarkdownCount() {
  const dir = path.join(ROOT, 'venues');
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(f => /\.md$/i.test(f)).length;
}

// ============== AREA PAGES ==============

// Area-specific FAQs — appended to each /area/<slug>/ page.
const AREA_FAQS = {
  'jomtien': [
    { q: 'Is Jomtien Beach better than Pattaya Beach?', a: 'For long-stay residents and watersports — yes. Jomtien is calmer, longer (6km), with cleaner sand, kitesurfing-friendly winds, and a meaningful Russian and European long-stay community. Walking Street nightlife is in Pattaya proper to the north.' },
    { q: 'What sports can I do in Jomtien?', a: 'Strong watersports scene — kitesurfing, parasailing, jet ski, scuba diving, sailing. Yoga studios cluster around Thepprasit. Fitness gyms and Muay Thai camps along Thappraya Road. Beach running and beach volleyball year-round.' },
    { q: 'How far is Jomtien from central Pattaya?', a: '5–10 minutes by Bolt/Grab to Walking Street and Beach Road. Songthaew (baht bus) on Thappraya Road runs frequently for ฿10–฿20.' }
  ],
  'naklua': [
    { q: 'Is Naklua a good area to stay?', a: 'Yes for quieter, more residential vibes — popular with long-stay expats wanting calm. Wong Amat Beach is family-friendly and less crowded than Pattaya Beach. Cape Dara Resort and Centara Grand Mirage anchor the luxury hotel scene.' },
    { q: 'What sports are in Naklua?', a: 'Several yoga studios, fitness chains (Jetts, Anytime Fitness branches in nearby South Pattaya), 5-star hotel fitness (Cape Dara, Centara Grand Mirage), Muay Thai camps, and Wong Amat Beach for swimming and beach sports.' },
    { q: 'How do I get to central Pattaya from Naklua?', a: '5–10 minutes by Bolt/Grab to Beach Road. Songthaew runs Pattaya-Naklua Road regularly. Walking distance varies by sub-area.' }
  ],
  'pratamnak': [
    { q: 'What is Pratamnak Hill known for?', a: 'Pratamnak Hill is Pattaya\'s densest fitness neighborhood — Muscle Factory (largest hardcore gym in Thailand), Pickleball Pattaya (dedicated facility), free outdoor calisthenics park, and several combat sports facilities. Also home to luxurious sea-view condos and cliff-side hotels.' },
    { q: 'Is Pratamnak good for serious training?', a: 'Yes — Muscle Factory is one of Thailand\'s most respected hardcore gyms, attracting national-level powerlifters and bodybuilders. Combat sports facilities and Pickleball Pattaya add to the serious training mix.' },
    { q: 'Can I stay in Pratamnak as a tourist?', a: 'Yes — many short-term rental condos. Within 5–10 minutes of Pattaya Beach, Walking Street, and Jomtien. Great base for fitness-focused trips.' }
  ],
  'east-pattaya': [
    { q: 'What is East Pattaya / Darkside?', a: '"Darkside" is the residential expat belt east of Sukhumvit Road — quieter, less touristy, mostly long-stay residents. Hosts the biggest equestrian (Horseshoe Point, Thai Polo) and adventure venues, plus the Klinmee family Muay Thai cluster.' },
    { q: 'How do I get to East Pattaya?', a: '15–25 minutes by Bolt/Grab from central Pattaya, depending on traffic and sub-area. Public transport limited — most residents drive or rent scooters.' },
    { q: 'What sports are in East Pattaya?', a: 'Equestrian (largest in Asia at Thai Polo), polo, ATV tours, archery (Pattaya Archery Club), value-tier community gyms (Castra), Mabprachan running route (4km loop), Muay Thai (Sit Klinmee family cluster).' }
  ],
  'central-pattaya': [
    { q: 'Where to train near Walking Street / Beach Road?', a: 'Tony\'s Gym, Universe Gym, Fitness 7 (24-hour), Jetts Fitness Little Walk + Royal Garden, Pattaya Boxing World (walk-in Muay Thai), Deep Climbing + Bean Cow at Harbor Pattaya Mall, hotel fitness at Hilton Pattaya. Most central venues within 10 minutes\' walk of major hotels.' },
    { q: 'Are there 24-hour gyms in central Pattaya?', a: 'Yes — Fitness 7 (Avenue Pattaya), Jetts Fitness Little Walk, and Hilton Pattaya fitness for guests. Pratamnak Soi 6 area (5 min away) adds Anytime Fitness 24/7 access.' },
    { q: 'What about hotel pools and spas in central Pattaya?', a: 'Hilton Pattaya 16th-floor infinity pool + eforea Spa, Dusit Thani Pattaya Devarana Wellness, Hard Rock pool (largest free-form in SE Asia), Holiday Inn Beach Road, several boutique spas. Day-passes available at most.' }
  ],
  'sattahip': [
    { q: 'What is Sattahip / Far South Pattaya known for?', a: 'Premium destinations — Greta Sport Club (6 covered ITF tennis courts), Ramayana Water Park (world\'s largest at 184,000 sqm with 26 slides), Cartoon Network Amazone, Chee Chan Golf Resort with Buddha mountain views, premium golf courses, and Khao Chi Chan (cliff Buddha image).' },
    { q: 'How far is Sattahip from Pattaya?', a: '20–35 minutes by Bolt/Grab from central Pattaya, depending on sub-area. Most premium venues offer hotel pickup or transfers. Self-drive recommended for multi-stop days.' },
    { q: 'Can I day-trip to Sattahip from Pattaya?', a: 'Yes — most visitors do. Combine 2–3 venues per day (e.g. Ramayana water park + Khao Chi Chan + Chee Chan Golf). Hotel pickup/Bolt round-trip ฿800–฿1,500 typical.' }
  ]
};

const AREAS = [
  {
    slug: 'jomtien',
    name: 'Jomtien',
    keywords: ['jomtien', 'na jomtien', 'na chom thian'],
    intro: 'Jomtien Beach is the long sandy stretch south of Pattaya proper. Quieter than Walking Street, dominated by long-stay condos and a meaningful Russian residential community. The watersports scene (kitesurfing, diving, parasailing) is especially strong here.',
    seoLine: 'Every gym, Muay Thai camp, dive operator, and sport venue in Jomtien Beach, Pattaya.'
  },
  {
    slug: 'naklua',
    name: 'Naklua',
    keywords: ['naklua', 'na kluea'],
    intro: 'Naklua sits north of central Pattaya — quieter, more residential, with a growing Russian community and Thai working-class population. Several yoga studios, fitness chains, and small specialty venues cluster along Pattaya-Naklua Road.',
    seoLine: 'Gyms, yoga studios, fitness clubs, and sport venues in Naklua, north Pattaya.'
  },
  {
    slug: 'pratamnak',
    name: 'Pratamnak Hill',
    keywords: ['pratamnak', 'pratumnak', 'phra tamnak', 'buddha hill'],
    intro: 'Pratamnak Hill is the elevated ridge between Pattaya Beach and Jomtien Beach — Pattaya\'s densest fitness neighborhood with the largest hardcore gym in the city (Muscle Factory), boutique hotel gyms, free outdoor calisthenics park, and combat sports facilities.',
    seoLine: 'Gyms, Muay Thai, fitness clubs, and sport venues on Pratamnak Hill, Pattaya.'
  },
  {
    slug: 'east-pattaya',
    name: 'East Pattaya / Darkside',
    keywords: ['east pattaya', 'darkside', 'mabprachan', 'khao talo', 'khao mai kaeo', 'soi siam country club'],
    intro: 'East Pattaya — known locally as "Darkside" — is the residential expat belt east of Sukhumvit Road. Mabprachan Reservoir, Khao Talo, and Soi Siam Country Club host the city\'s biggest equestrian and adventure facilities (Horseshoe Point, Thai Polo & Equestrian Club) plus value-tier community gyms (Castra) and the Klinmee family Muay Thai cluster.',
    seoLine: 'Gyms, equestrian, Muay Thai, and sport venues in East Pattaya / Darkside.'
  },
  {
    slug: 'central-pattaya',
    name: 'Central Pattaya',
    keywords: ['central pattaya', 'walking street', 'beach road', 'soi buakhao', 'pattaya 2nd', 'pattaya 3rd', 'pattaya klang', 'the avenue'],
    intro: 'Central Pattaya — the Beach Road / Walking Street / Soi Buakhao corridor — is dense with 24-hour commercial gyms, hotel pools, walk-in Muay Thai, indoor climbing at Harbor Pattaya Mall, and tourist-friendly fitness operators. Most central hotels are within 10 minutes\' walk of multiple training options.',
    seoLine: 'Walk-in gyms, hotel fitness clubs, climbing, indoor sports in central Pattaya.'
  },
  {
    slug: 'sattahip',
    name: 'Sattahip / Far South',
    keywords: ['sattahip', 'na chom thian', 'na jomtien'],
    intro: 'Sattahip district — south of Jomtien — hosts Pattaya\'s biggest premium destinations: Greta Sport Club\'s 6 covered tennis courts, the world\'s largest water park (Ramayana, 184,000 sqm), Cartoon Network Amazone / Columbia Pictures Aquaverse, Chee Chan Golf Resort with Buddha mountain views, and several premium golf courses.',
    seoLine: 'Premium golf, water parks, tennis, and resort sport venues in Sattahip, south Pattaya.'
  }
];

function buildAreaPage(area, allGyms, allCats) {
  const url = `${SITE}/area/${area.slug}/`;
  const lower = (s) => String(s||'').toLowerCase();
  const matchingGyms = allGyms.filter(g => {
    const text = lower(g.area + ' ' + g.address);
    return area.keywords.some(k => text.indexOf(k) >= 0);
  });
  const title = `${area.name} Gyms & Sport Venues — ${matchingGyms.length} options | Pattaya Gym`;
  const desc = `${area.seoLine} ${matchingGyms.length} verified venues with addresses, hours, prices, and contact info.`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pattaya Gym Directory', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Areas', item: `${SITE}/area/` },
      { '@type': 'ListItem', position: 3, name: area.name, item: url }
    ]
  };
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Sport venues in ${area.name}, Pattaya`,
    description: `Verified gyms, Muay Thai camps, dive operators, golf courses, and sport venues in ${area.name}.`,
    numberOfItems: matchingGyms.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: matchingGyms.slice(0, 50).map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/gyms/${g.id}/`,
      name: g.name
    }))
  };

  // Group by category for nicer layout
  const byCat = {};
  matchingGyms.forEach(g => { (byCat[g.category] = byCat[g.category] || []).push(g); });
  const sections = allCats.map(c => {
    const list = byCat[c.key];
    if (!list || !list.length) return '';
    return `
    <h2>${escHtml(c.label)} <span style="color: var(--text-muted); font-weight: 500; font-size: 0.65em;">(${list.length})</span></h2>
    <div class="cat-venue-grid">${list.map(venueCard).join('')}</div>`;
  }).filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead(title, desc, url, 'Place')}
<link rel="alternate" type="application/rss+xml" title="Pattaya Gym — ${escHtml(area.name)} venues" href="/feed/area/${area.slug}.xml" />
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb">
    <a href="/">Directory</a>
    <span class="bc-sep">›</span>
    <span>${escHtml(area.name)}</span>
  </div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Pattaya Area</span>
    <h1 class="venue-h1">${escHtml(area.name)} — gyms &amp; sport venues</h1>
    ${(() => {
      const parts = String(area.intro).split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);
      if (parts.length <= 1) return `<p class="venue-lede">${escHtml(area.intro)}</p>`;
      return parts.map((c, i) => `<p class="venue-lede"${i > 0 ? ' style="margin-top: 10px; font-size: 0.96rem;"' : ''}>${escHtml(c)}</p>`).join('');
    })()}
    <div class="venue-hero-meta">
      <span class="meta-chip meta-chip-accent">⭐ ${matchingGyms.length} venues</span>
      <span class="meta-chip" style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.04em;">// Updated ${new Date().toISOString().slice(0,10)}</span>
      <span class="meta-chip">🏷 ${Object.keys(byCat).length} categories</span>
    </div>
  </div>
  ${(() => {
    const catCounts = Object.entries(byCat).sort((a,b) => b[1].length - a[1].length).slice(0, 5);
    if (!catCounts.length) return '';
    const labels = (key) => { const c = allCats.find(x => x.key === key); return c ? c.label : key; };
    return `<section class="tldr" aria-labelledby="area-tldr-h">
      <h2 id="area-tldr-h" class="tldr-title">What ${escHtml(area.name)} is best for</h2>
      <ul class="tldr-list">
        ${catCounts.map(([key, list]) => `<li><strong>${escHtml(labels(key))}</strong> — ${list.length} venue${list.length === 1 ? '' : 's'} (top: <a href="/gyms/${escHtml(list[0].id)}/" style="color:var(--accent);">${escHtml(list[0].name)}</a>)</li>`).join('')}
      </ul>
      <p style="margin: 12px 0 0; font-size: 13px; color: var(--text-muted);"><a href="#area-full" style="color: var(--accent);">Skip to all ${matchingGyms.length} venues in ${escHtml(area.name)} →</a></p>
    </section>`;
  })()}
  <div id="area-full"></div>
  ${sections || '<p style="margin-top:30px;color:var(--text-dim);">No verified venues found in this area yet.</p>'}
  ${(() => {
    const faqs = (typeof AREA_FAQS !== 'undefined' && AREA_FAQS[area.slug]) || [];
    if (!faqs.length) return '';
    return `<section class="about" aria-labelledby="area-faq-h" style="margin-top: 40px;">
      <h2 id="area-faq-h" style="font-size: 1.4rem; margin-bottom: 16px;">Common questions about ${escHtml(area.name)}</h2>
      ${faqs.map(f => `<details class="faq-item"><summary>${escHtml(f.q)}</summary><p>${escHtml(f.a)}</p></details>`).join('')}
    </section>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    })}</script>`;
  })()}

  <div class="venue-cta-foot" style="margin-top:48px;">
    <h3>Looking for something specific?</h3>
    <p>Browse by category, search live, or compare venues side-by-side.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="/search/">▶ Search venues</a>
      <a class="btn btn-secondary" href="/compare/">Side-by-side compare</a>
      <a class="btn btn-tertiary" href="/map/">Map (rebuilding)</a>
    </div>
  </div>
</main>
${footer()}
<script src="${assetHref('/share.js')}" defer></script>
<script src="${assetHref('/favorites.js')}" defer></script>
<script src="${assetHref('/compare.js')}" defer></script>
</body>
</html>
`;
}

// ============== LISTICLE / GUIDE PAGES ==============
const GUIDES = [
  {
    slug: 'best-muay-thai-pattaya',
    title: 'Best Muay Thai Gyms in Pattaya 2026',
    h1: 'Best Muay Thai gyms in Pattaya',
    desc: 'Hand-picked best Muay Thai camps in Pattaya for 2026 — from authentic budget gyms to premium all-inclusive resort camps. With pricing, trainers, and what each is best for.',
    intro: 'Pattaya has {count} verified Muay Thai camps spanning every tier. This guide picks the best for different goals — from total beginners trying their first pad round to fight-prep students looking for serious sparring partners.',
    pickerKey: 'best-mt',
    filter: g => g.category === 'muay-thai',
    rank: g => {
      // Score by distinction richness, established lineage indicators
      const tags = (g.tags || []).join(' ').toLowerCase();
      const desc = (g.description || '').toLowerCase();
      let s = 0;
      if (/world.?champion|legend|legacy/.test(desc)) s += 10;
      if (/wmc|onefc|one championship|fairtex|sityodtong/.test(tags + desc)) s += 6;
      if (/lineage|family|legacy|founded|established/.test(desc)) s += 4;
      if (/premium|all-?inclusive|resort/.test(tags + desc)) s += 3;
      if (/budget|affordable|hostel/.test(tags + desc)) s += 2;
      if (/^฿฿$|^฿฿฿$|^฿฿฿฿$/.test(g.priceRange||'')) s += (g.priceRange || '').length;
      return s;
    },
    sections: [
      { label: '🥇 The Premier Choice', take: 1 },
      { label: '🥊 Best Authentic Family Camps', take: 3 },
      { label: '🏝 Best Resort + Stay Packages', take: 3 },
      { label: '💰 Best Budget Options', take: 3 },
      { label: '🌟 Other Notable Options', take: 4 }
    ],
    faqs: [
      { q: 'What is the best Muay Thai gym in Pattaya for beginners?', a: 'Sityodtong, Fairtex, and Kombat Group all run dedicated beginner programs in English. Most camps will pair beginners with patient pad-holders for the first 2-4 weeks of fundamentals.' },
      { q: 'How much does Muay Thai cost in Pattaya?', a: 'Drop-in sessions ฿300-฿500. Monthly unlimited training ฿4,000-฿15,000 depending on prestige. All-inclusive resort camps with accommodation ฿20,000-฿60,000/month.' },
      { q: 'Do I need to be fit to start Muay Thai in Pattaya?', a: 'No. Most camps explicitly welcome total beginners. Expect to be tired in week one — by week three, you\'ll be coasting through 2-hour sessions.' },
    ]
  },
  {
    slug: 'cheapest-gyms-pattaya',
    title: 'Cheapest Gyms in Pattaya 2026',
    h1: 'Cheapest gyms in Pattaya',
    desc: 'Budget gyms in Pattaya — from FREE outdoor parks to ฿7,000/year unlimited memberships. The best value-for-money fitness in the city.',
    intro: 'Pattaya has more affordable fitness options than most Western cities offer at any price. From completely free outdoor calisthenics parks to ฿20-100 public swimming pools and ฿7,000/year all-access gyms — you can train every day for less than a single Pattaya Walking Street night out.',
    pickerKey: 'cheapest',
    filter: g => g.category === 'fitness' || g.category === 'swimming' || g.category === 'muay-thai',
    rank: g => {
      const desc = (g.description||'').toLowerCase();
      const tags = (g.tags||[]).join(' ').toLowerCase();
      let s = 0;
      if (/free|no charge|公$|^฿$/.test(desc + ' ' + (g.priceRange||''))) s += 20;
      if (g.priceRange === '฿') s += 12;
      if (g.priceRange === '฿฿') s += 5;
      if (/budget|affordable|cheap|value|hostel/.test(desc + ' ' + tags)) s += 6;
      if (/public|municipal/.test(desc + ' ' + tags)) s += 8;
      return s;
    },
    sections: [
      { label: '🆓 Free Options', take: 2 },
      { label: '💸 Best Budget Memberships', take: 5 },
      { label: '🥊 Cheapest Muay Thai Sessions', take: 3 }
    ],
    faqs: [
      { q: 'What is the cheapest gym in Pattaya?', a: 'Free public running routes (Pattaya Beach, Mabprachan Lake) cost nothing. The cheapest membership gyms run ฿1,500-฿2,500/month — Castra Gym, Universe Gym, and Tony\'s Gym are typical.' },
      { q: 'Are there free workout spots in Pattaya?', a: 'Yes — Pattaya Beach 5.8km path, Jomtien Beach, Mabprachan Lake 4km loop, Pratumnak Park, and Chaiyapruek 400m track are all free public spaces with running and outdoor calisthenics.' },
      { q: 'Can I train Muay Thai cheaply in Pattaya?', a: 'Yes. WKO/ISS Gym at ~฿4,000/month is among the cheapest verified Muay Thai monthly rates with serious coaching. Drop-in classes at most camps run ฿300-฿500.' },
    ]
  },
  {
    slug: 'luxury-sports-clubs-pattaya',
    title: 'Luxury Sports Clubs in Pattaya 2026',
    h1: 'Luxury sports clubs in Pattaya',
    desc: 'Compare Pattaya premium sport by verified access: an outside-guest club pass, hotel-guest fitness, booked golf and contact-first sailing, polo and tennis.',
    intro: 'Luxury does not prove public access. Pattaya\'s upper-tier records mix one published outside-guest club pass, registered-hotel-guest amenities, bookable golf rounds and contact-first sailing, polo and tournament tennis. Choose the product and eligibility before comparing facility lists.',
    pickerKey: 'luxury',
    filter: g => g.priceRange === '฿฿฿' || g.priceRange === '฿฿฿฿',
    rank: g => {
      const desc = (g.description||'').toLowerCase();
      const tags = (g.tags||[]).join(' ').toLowerCase();
      let s = 0;
      if (g.priceRange === '฿฿฿฿') s += 20;
      if (g.priceRange === '฿฿฿') s += 10;
      if (/premier|premium|luxury|5-star|five-star|royal|award|championship|fia|itf|itf-/.test(desc + ' ' + tags)) s += 10;
      return s;
    },
    sections: [
      { label: '⭐ Top-Tier Picks', take: 4 },
      { label: '🏌 Premium Golf', take: 4 },
      { label: '🎾 Premium Racquet Sports', take: 3 }
    ],
    faqs: [
      { q: 'Which Pattaya luxury sports venue has a verified outside-guest day pass?', a: 'Fitz Club at Royal Cliff publishes a 2026 outside-guest pass covering its gym, pool, sauna and steam rooms. Tennis and squash are excluded and priced separately.' },
      { q: 'Can non-residents use the Andaz, Marriott or Hilton hotel gyms?', a: 'No current public gym pass was found on the checked operator pages. Treat the facilities as registered-guest amenities unless the exact hotel provides written date-specific confirmation.' },
      { q: 'How should Pattaya golf prices be compared?', a: 'Compare the required green fee, individual cart or buggy and caddie together, then add tip and rentals. A green-fee headline alone is not the complete round cost.' },
    ]
  },
  {
    slug: '24-hour-gyms-pattaya',
    title: '24-Hour Gyms in Pattaya',
    h1: '24/7 gyms in Pattaya',
    desc: 'Compare verified 24-hour gym access in Pattaya, including member-entry rules, staffed hours, hotel-guest restrictions and the current price gaps to confirm.',
    intro: 'A gym can advertise 24-hour access without operating a staffed public reception all night. This guide separates member access, independent-gym listings and hotel-guest fitness rooms, then identifies which prices and overnight entry terms still require direct confirmation.',
    pickerKey: '24h',
    filter: g => g.category === 'fitness' && /24|all.?day|always/i.test(g.hours || ''),
    rank: g => {
      const h = (g.hours||'').toLowerCase();
      let s = /24\/7|24\s*hour|always.?open/i.test(h) ? 20 : 5;
      return s;
    },
    sections: [
      { label: '🌙 Always-Open Options', take: 10 }
    ],
    faqs: [
      { q: 'Can a first-time visitor walk into a Pattaya gym at 03:00?', a: 'Do not assume so. Jetts and Anytime publish 24-hour member access, while staffed enrolment hours are narrower. Fitness 7 publishes 24-hour operation, but no current owner statement confirming overnight reception or first-visit entry was found. Arrange access with the exact branch during staffed hours.' },
      { q: 'Which 24-hour Pattaya gym publishes a current visitor price?', a: 'No current public visitor price was found for Jetts, Anytime, Fitness 7 or James Gym during the 26 July 2026 check. Coco Fitness publishes memberships from ฿1,599 for one month, but it closes at 22:00 and is included only as a priced non-24-hour fallback.' },
      { q: 'Are Pattaya hotel gyms with 24-hour fitness open to the public?', a: 'Treat them as guest facilities unless the hotel confirms a public pass. Andaz identifies its 24-hour fitness room as a hotel-guest amenity. Pattaya Marriott and Mövenpick publish 24-hour fitness facilities, but no current public-gym pass was found for either.' },
    ]
  },
  {
    slug: 'family-friendly-pattaya',
    title: 'Family-Friendly Sport Venues in Pattaya',
    h1: 'Family-friendly sport venues in Pattaya',
    desc: 'Best Pattaya sport venues for families with kids — water parks, kids\' football academies, multi-sport facilities, indoor activities, and safe family-oriented environments.',
    intro: 'Travelling to Pattaya with kids? These venues are explicitly family-oriented, accept young children (some from age 3), and offer activities adults and kids can enjoy together.',
    pickerKey: 'family',
    filter: g => {
      const t = ((g.tags||[]).join(' ') + ' ' + (g.description||'')).toLowerCase();
      return g.category === 'kids-youth' || g.category === 'swimming' || /family|kid|child|water.?park|trampolin|amusement/.test(t);
    },
    rank: g => {
      const t = ((g.tags||[]).join(' ') + ' ' + (g.description||'')).toLowerCase();
      let s = 0;
      if (g.category === 'kids-youth') s += 15;
      if (g.category === 'swimming') s += 5;
      if (/family/.test(t)) s += 8;
      if (/kid|child/.test(t)) s += 5;
      if (/water.?park|amusement|trampoline/.test(t)) s += 10;
      return s;
    },
    sections: [
      { label: '🌊 Water Parks & Swimming', take: 4 },
      { label: '⚽ Kids\' Sport Academies', take: 5 },
      { label: '🎢 Adventure & Fun', take: 3 }
    ],
    faqs: [
      { q: 'What is the best Pattaya activity for kids?', a: 'Cartoon Network Amazone and Centara Grand Mirage water park are the headline picks. Underwater World, Nong Nooch, and Flight of the Gibbon all work well for ages 5+.' },
      { q: 'Are there sports classes for kids in Pattaya?', a: 'Yes — AF Academy (football), Kombat Group (kids\' Muay Thai), Fitz Club (kids\' tennis + swim), and Pattaya Sports Club (multi-sport) all run dedicated youth programs.' },
      { q: 'Is Pattaya safe for families with young children?', a: 'Yes — the venues listed are all explicitly family-oriented with safety protocols, supervision, and English-speaking staff. Pattaya Beach and Jomtien Beach are calm-water family beaches.' },
    ]
  },
  {
    slug: 'best-for-beginners-pattaya',
    title: 'Best Beginner-Friendly Sport Venues in Pattaya',
    h1: 'Best beginner-friendly venues in Pattaya',
    desc: 'Compare 12 evidence-checked Pattaya starting points for Muay Thai, diving, padel, yoga, karting, children’s sport, swimming and general fitness.',
    intro: 'A useful beginner venue publishes or confirms a real first step: an introductory product, a single session, coaching, equipment or an assessment. This guide ranks 12 records with current first-hand evidence and states the gaps instead of treating every “all levels” label as proof.',
    pickerKey: 'beginners',
    filter: g => [
      'seafari-padi-dive',
      'sudsakorn-muay-thai-gym',
      'play-padel-pattaya',
      'yoga-pattaya-studio',
      'af-academy-pattaya',
      'easykart-pattaya',
      'dive-station-pattaya',
      'pattaya-dive-centre',
      'fitz-club',
      'castra-gym',
      'baby-shark-swim-club-pattaya',
      'pattaya-padel-club'
    ].includes(g.id),
    rank: g => ({
      'seafari-padi-dive': 12,
      'sudsakorn-muay-thai-gym': 11,
      'play-padel-pattaya': 10,
      'yoga-pattaya-studio': 9,
      'af-academy-pattaya': 8,
      'easykart-pattaya': 7,
      'dive-station-pattaya': 6,
      'pattaya-dive-centre': 5,
      'fitz-club': 4,
      'castra-gym': 3,
      'baby-shark-swim-club-pattaya': 2,
      'pattaya-padel-club': 1
    }[g.id] || 0),
    sections: [
      { label: 'Twelve evidence-checked starting points', take: 12 }
    ],
    primerHtml: () => `
  <section class="about" aria-labelledby="beginner-guide-decision" style="margin-top: 32px;">
    <h2 id="beginner-guide-decision">If you only read one thing</h2>
    <p><strong>Choose the smallest real commitment that still includes the help you need.</strong> A first Muay Thai group class, a supervised try-dive, a private padel lesson and an unsupervised gym day are not equivalent “beginner sessions.” Start by deciding whether you need instruction, equipment, a medical or age check, and a fixed booking. Then compare the complete price and travel route.</p>
    <p>The ranked set is deliberately restricted to 12 active records with a named starter product, current owner tariff, coaching route or assessment-based entry. It does not include every venue whose marketing copy contains “beginner,” “easy” or “all levels.” Closed and unverified records are excluded, and a hotel gym is included only where public access or a clear visitor product is documented.</p>

    <h2>Beginner comparison table</h2>
    <p>Numeric prices below were checked on the date in each cell and come from the exact operator page recorded in the linked venue's price-source metadata. A blank public rate is shown as a gap rather than estimated. Promotions, group conditions and availability can change after the check date.</p>
    <div style="overflow-x:auto;">
      <table>
        <thead><tr><th>Venue</th><th>Sport and first step</th><th>Published starting point</th><th>Confirm before booking</th></tr></thead>
        <tbody>
          <tr><td><a href="/gyms/seafari-padi-dive/">Seafari Diving Center</a></td><td>Scuba; one-day Discover Scuba Diving with two dives</td><td>26 Jul 2026: ฿4,500 per person</td><td>Medical process, swimming expectation, inclusions, pickup and no-fly guidance.</td></tr>
          <tr><td><a href="/gyms/sudsakorn-muay-thai-gym/">Sudsakorn Muay Thai</a></td><td>Muay Thai; one group training session</td><td>25 Jul 2026: ฿400 for one session</td><td>Beginner slot, gloves and wraps, trainer language and whether sparring is optional.</td></tr>
          <tr><td><a href="/gyms/play-padel-pattaya/">Play Padel Pattaya</a></td><td>Padel; private coaching or a booked court</td><td>25 Jul 2026: coaching from THB 600/hour; racket THB 100/hour</td><td>Player count, court charge, balls, prepayment and cancellation.</td></tr>
          <tr><td><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a></td><td>Yoga; standard one-hour drop-in</td><td>25 Jul 2026: ฿500</td><td>Style, level, teacher language, exact class time and mat arrangement.</td></tr>
          <tr><td><a href="/gyms/af-academy-pattaya/">AF Academy</a></td><td>Youth football; age-group trial</td><td>25 Jul 2026: first trial free; single session ฿600</td><td>Correct ground, age group, coach language, footwear and guardian arrangements.</td></tr>
          <tr><td><a href="/gyms/easykart-pattaya/">EasyKart Pattaya</a></td><td>Karting; kids or regular kart product</td><td>25 Jul 2026: kids race ฿499; regular race ฿699</td><td>Age, height, kart type, safety briefing, race length and weather policy.</td></tr>
          <tr><td><a href="/gyms/dive-station-pattaya/">Dive Station Pattaya</a></td><td>SSI scuba; Try Scuba or Basic Diver</td><td>25 Jul 2026: Try Scuba ฿3,000</td><td>Whether the product is confined-water only, full-day plan, equipment and medical rules.</td></tr>
          <tr><td><a href="/gyms/pattaya-dive-centre/">Pattaya Dive Centre</a></td><td>PADI scuba; Discover Scuba Diving with two dives</td><td>25 Jul 2026: ฿4,500</td><td>Transfer, rental equipment, food, computer, medical form and return window.</td></tr>
          <tr><td><a href="/gyms/fitz-club/">Fitz Club</a></td><td>General fitness and pool; outside-guest day pass</td><td>2026 tariff checked 25 Jul: adult ฿800</td><td>The pass excludes tennis and squash; reserve coaching or courts separately.</td></tr>
          <tr><td><a href="/gyms/castra-gym/">Castra Gym</a></td><td>Muay Thai or BJJ group class with gym access</td><td>25 Jul 2026: group class ฿300</td><td>Exact discipline, experience level, equipment, class date and general-gym fee.</td></tr>
          <tr><td><a href="/gyms/baby-shark-swim-club-pattaya/">Baby Shark Swim School</a></td><td>Children’s swimming; assessment or trial enquiry</td><td>No stable current public course fee</td><td>Child’s age, water experience, class size, lesson length and make-up policy.</td></tr>
          <tr><td><a href="/gyms/pattaya-padel-club/">Pattaya Padel Club</a></td><td>Padel; court plus one-hour coaching</td><td>27 Jul 2026: court ฿600-฿800/hour; coaching from ฿1,600</td><td>Number of players, equipment, balls, coach availability and total shared cost.</td></tr>
        </tbody>
      </table>
    </div>

    <h2>Choose instruction before intensity</h2>
    <p>A first-timer normally benefits more from a defined coach or instructor than from the largest facility. Sudsakorn provides a low-commitment single Muay Thai session with morning and afternoon training periods. Castra publishes separate Muay Thai and BJJ class times and says gym access is included with its fight-club classes. Before attending either, send your experience level and ask whether the selected session includes total beginners, how equipment is handled and whether contact or sparring can be avoided.</p>
    <p>Fitz Club is different: its outside-guest pass opens the gym, pool, sauna and steam rooms, but does not include a coach or racquet court. It suits someone already comfortable choosing a basic workout. A nervous first-time lifter may be better served by a separately booked trainer, while a visitor who only needs cardio and machines may not need instruction at all. “Beginner-friendly” should describe the entry process, not assume every beginner needs the same level of supervision.</p>

    <h2>First scuba experience versus certification</h2>
    <p>Seafari and Pattaya Dive Centre both publish PADI Discover Scuba Diving products at ฿4,500, but matching headline prices do not prove identical inclusions. Dive Station's ฿3,000 Try Scuba is an SSI-centred product and must be checked for the exact water setting and day structure. Ask each operator whether the product includes confined-water preparation, open-water dives, rental gear, a dive computer, boat and park fees, food, transfers, photos and insurance.</p>
    <p>A try-dive is not an Open Water certification. If certification is the objective, ask for the full number of training days, e-learning or manuals, confined-water sessions, open-water dives, certification fee and what happens when a student needs more time. Complete the medical questionnaire honestly. Send age, swimming confidence, health constraints and planned flight timing before payment, and obtain the operator's qualified no-fly guidance for the actual dive plan.</p>
    <p>For a larger operator comparison, use the <a href="/guides/best-dive-operators-pattaya/">eight-operator Pattaya dive guide</a>. It separates first dives, certification courses and certified-diver boat days instead of ranking them on one price line.</p>

    <h2>Padel: coaching, court and group arithmetic</h2>
    <p>Play Padel publishes a lower private-coaching starting figure than Pattaya Padel Club, but the two price structures are not directly interchangeable. At Play Padel, confirm whether the coach amount is additional to the THB 1,200 court-hour and whether balls are included; the page separately lists THB 100 racket rental and a card-payment addition in the app. New players booking ahead must prepay.</p>
    <p>Pattaya Padel Club publishes different court prices by time of day and coaching prices that change with player count. A group of four may lower the per-person coaching cost even when the total booking is higher. Tell either club that everybody is new, request a coaching slot rather than an open social match and confirm court, coach, rackets, balls and cancellation in one written total.</p>

    <h2>Yoga and general movement</h2>
    <p>Yoga Pattaya Studio offers the clearest current drop-in comparison in this shortlist, but its programme contains several styles and the teaching language varies by session. A standard one-hour drop-in does not guarantee that the chosen class is an introductory class. Ask which live timetable entry fits a first visit, whether it is taught in English, Russian or Thai, and whether a mat is supplied.</p>
    <p>A beginner seeking Pilates or personal training may also consider a coached studio such as GAYA, but it is not ranked here because no stable current owner tariff or class-by-class schedule was publicly accessible in this pass. That omission is deliberate: an active Maps listing and a “beginner-friendly” flag are not enough to manufacture a comparable starter product.</p>

    <h2>Children’s sport: age group comes first</h2>
    <p>AF Academy publishes the strongest defined youth entry in this set: age groups from 3 to 17, a free first trial and a paid single-session option. The company uses multiple training locations, so the Naklua contact address is not automatically the child’s pitch. Send the child's age and experience and obtain the current ground, start time, coach language, footwear and guardian policy.</p>
    <p>Baby Shark Swim School is a contact-first alternative. Its current first-hand evidence supports an indoor heated saltwater pool, a children's swim-school identity and public weekly business hours, but not a stable course fee. Ask for an assessment or trial, the teaching ratio, lesson duration, term commitment, make-up rule, swimwear and whether a guardian must remain poolside. Do not choose a children's lesson solely from a broad opening-hours listing.</p>
    <p><a href="/gyms/manta-kids-pattaya/">Manta Kids Pattaya</a> is another structured swim-school option that now has a fuller venue record but is still not ranked here because the public site exposes programme prices rather than a simple trial or one-off lesson product. Its current published ladder starts at ฿8,500 for Splash, Swirl and Swim Beginner, with Swim at ฿10,900, checked 27 July 2026. Parents should compare lesson count, age placement and make-up policy before treating those figures as like-for-like with any assessment-led school.</p>

    <h2>Karting is an activity product, not a driving lesson</h2>
    <p>EasyKart separates kids, regular, fast and two-seat kart products. Its 25 July 2026 page associated the kids kart with ages 7-13 and height above 125 cm. That is operator guidance, not a guarantee that every child can drive. Staff must make the final fit and safety decision. A first-timer should book the appropriate product, attend the briefing and avoid selecting a faster kart merely because the price table makes it available.</p>

    <h2>Budget and commitment</h2>
    <p>The smallest number in the table is not automatically the cheapest complete start. A ฿300 group class may require wraps or gloves; a THB 600 coaching line may sit beside a separate court charge; a free football trial still requires travel and suitable footwear; and a try-dive price may exclude an item another operator bundles. Compare the total for one complete, usable first experience.</p>
    <p>For a one-off visit, prioritise a dated single-session product and easy cancellation. For a one- to four-week stay, compare class packs only after testing one session. For children, avoid buying a term before confirming age-group fit and schedule. For high-consequence activities such as diving and karting, safety and eligibility questions come before a discount.</p>

    <h2>Before paying</h2>
    <ul>
      <li>Name the exact date, product, participant count, ages and experience level.</li>
      <li>Ask whether the published business hours are reception hours, class times or facility-access hours.</li>
      <li>Request the complete price including instruction, equipment, entry, deposits, tax and compulsory extras.</li>
      <li>Confirm language, group size and how the session is adapted for a total beginner.</li>
      <li>Send injuries, medical constraints, swimming confidence or child-development needs honestly.</li>
      <li>Check the exact map pin, building entrance, pickup or parking and return plan.</li>
      <li>Read cancellation, weather, missed-class, make-up and refund terms before prepaying.</li>
      <li>Do not treat reviews, a star rating or “all levels” marketing as a substitute for the operator's answer.</li>
    </ul>

    <h2>How this ranking works</h2>
    <p>The order rewards a clearly named first step, current first-hand evidence, a dated public price, manageable commitment and useful visitor logistics. It does not score coaching quality from reviews, imply a first-hand visit or promise that a particular instructor is available. Different goals produce different winners: Seafari leads for a defined first-dive product, Sudsakorn for a low-cost single Muay Thai session, Play Padel for a published coaching route, Yoga Pattaya for a transparent drop-in and AF Academy for a documented youth trial.</p>
  </section>`,
    faqs: [
      { q: 'What is the lowest-commitment published beginner session in this guide?', a: 'For coached adult sport, Castra listed a ฿300 group class and Sudsakorn a ฿400 Muay Thai session when checked on 25 July 2026. Confirm that the selected class accepts total beginners and ask about required equipment before travelling.' },
      { q: 'Is a try-dive the same as an Open Water certification?', a: 'No. A try-dive is a supervised introductory product and does not issue the full Open Water certification. Ask about medical screening, swimming requirements, water sessions, equipment and the complete certification path before choosing.' },
      { q: 'What should I tell a Pattaya venue before my first session?', a: 'Send the date, participant count, ages, experience, language, equipment needs, injuries or medical constraints and accommodation location. Ask for the exact start time, total price, inclusions and cancellation terms in writing.' },
    ]  },
  {
    slug: 'best-dive-operators-pattaya',
    title: 'Best Dive Operators in Pattaya 2026',
    h1: 'Best dive operators in Pattaya',
    desc: 'Compare eight current Pattaya dive-operator records by first-dive, Open Water and certified-diver products, dated public prices, agency, location and stated inclusions.',
    intro: 'Eight active operator records have enough current first-hand evidence for this comparison. The order rewards source clarity and visitor utility, not an unverified claim about underwater conditions, instructor quality or fleet performance.',
    pickerKey: 'dive',
    filter: g => [
      'pattaya-dive-centre',
      'no-limit-divers',
      'jomtien-dive-center',
      'adventure-divers-pattaya',
      'dive-station-pattaya',
      'pattaya-scuba-adventures',
      'real-divers-pattaya',
      'seafari-padi-dive'
    ].includes(g.id),
    rank: g => ({
      'pattaya-dive-centre': 8,
      'no-limit-divers': 7,
      'jomtien-dive-center': 6,
      'adventure-divers-pattaya': 5,
      'dive-station-pattaya': 4,
      'pattaya-scuba-adventures': 3,
      'real-divers-pattaya': 2,
      'seafari-padi-dive': 1
    }[g.id] || 0),
    sections: [
      { label: 'Eight operators with current first-hand evidence', take: 8 }
    ],
    primerHtml: () => `
  <section class="about" aria-labelledby="dive-guide-decision" style="margin-top: 32px;">
    <h2 id="dive-guide-decision">If you only read one thing</h2>
    <p><strong>Choose the exact dive product first, then compare the included equipment, location and pickup terms.</strong> A try-dive for a first-timer, an Open Water certification course and a two-dive day for an already certified diver are different purchases. The smallest published number can be misleading if it excludes rental gear, a dive computer, transport, a national-park charge or the training materials required for the chosen course.</p>
    <p>This guide is deliberately limited to eight active directory records with current operator, training-agency or live listing evidence: <a href="/gyms/pattaya-dive-centre/">Pattaya Dive Centre</a>, <a href="/gyms/no-limit-divers/">No Limit Divers</a>, <a href="/gyms/jomtien-dive-center/">Jomtien Dive Center</a>, <a href="/gyms/adventure-divers-pattaya/">Adventure Divers Pattaya</a>, <a href="/gyms/dive-station-pattaya/">Dive Station Pattaya</a>, <a href="/gyms/pattaya-scuba-adventures/">Pattaya Scuba Adventures</a>, <a href="/gyms/real-divers-pattaya/">Real Divers Pattaya</a> and <a href="/gyms/seafari-padi-dive/">Seafari Diving Center</a>. The ranking favours a useful current public product and transparent inclusions. It does not claim first-hand dives, independently measured safety, better visibility, a newer boat or superior instructors.</p>

    <h2>Operator comparison</h2>
    <p>Every numeric price below is tied to the operator page recorded on the linked venue page and was checked on the date stated in its cell. Sale prices can change. “No stable public rate used” means this comparison did not find a current exact tariff suitable for quoting; it does not mean the operator is expensive or unavailable.</p>
    <div style="overflow-x:auto;">
      <table>
        <thead><tr><th>Operator</th><th>Agency / area</th><th>Useful current published price</th><th>Decision point</th></tr></thead>
        <tbody>
          <tr><td><a href="/gyms/pattaya-dive-centre/">Pattaya Dive Centre</a></td><td>PADI; Beach Road</td><td>25 Jul 2026: Pattaya two-dive day ฿2,700 with own gear or ฿3,000 with rental; Open Water ฿14,990 for one person</td><td>Clear Pattaya and Samae San table; computers and torches are listed separately.</td></tr>
          <tr><td><a href="/gyms/no-limit-divers/">No Limit Divers</a></td><td>PADI; Central Pattaya</td><td>25 Jul 2026: equipment-included fun-diving day ฿2,800; Open Water ฿15,900</td><td>Publishes multi-day fun-dive packs and a detailed extras table.</td></tr>
          <tr><td><a href="/gyms/jomtien-dive-center/">Jomtien Dive Center</a></td><td>PADI; Jomtien Beach</td><td>25 Jul 2026: Pattaya day from ฿2,800; Samae San from ฿3,200</td><td>States pickup within five kilometres and identifies dive computer as excluded.</td></tr>
          <tr><td><a href="/gyms/adventure-divers-pattaya/">Adventure Divers Pattaya</a></td><td>PADI; Thappraya / Central</td><td>25 Jul 2026: day with own gear ฿2,800 or rental gear ฿3,300; Open Water ฿16,500</td><td>Publishes passenger, try-dive, extra-dive and course figures with stated inclusions.</td></tr>
          <tr><td><a href="/gyms/dive-station-pattaya/">Dive Station Pattaya</a></td><td>SSI; North Pattaya / Naklua</td><td>25 Jul 2026: certified-diver day sale ฿3,000; three-day SSI Open Water sale ฿14,990</td><td>The only SSI-centred record in this eight-operator set; prices shown were sales.</td></tr>
          <tr><td><a href="/gyms/pattaya-scuba-adventures/">Pattaya Scuba Adventures</a></td><td>PADI; South Pattaya</td><td>25 Jul 2026: Open Water ฿14,990 for one person or from ฿13,490 per person for two or more</td><td>The current live course product is more reliable than an older dated trip table.</td></tr>
          <tr><td><a href="/gyms/real-divers-pattaya/">Real Divers Pattaya</a></td><td>PADI 5 Star IDC; Jomtien</td><td>No general stable public rate used for this table</td><td>Current operator presence and a dated promotion are documented; confirm the exact ordinary product directly.</td></tr>
          <tr><td><a href="/gyms/seafari-padi-dive/">Seafari Diving Center</a></td><td>PADI 5 Star IDC; Central Pattaya</td><td>No stable current public rate found</td><td>PADI's current centre listing supports agency and services, not a price comparison.</td></tr>
        </tbody>
      </table>
    </div>

    <h2>First dive, certification or fun diving?</h2>
    <p><strong>First-ever dive:</strong> ask for a named introductory product, not merely “a dive.” On 25 July 2026, Pattaya Dive Centre listed a two-dive Discover Scuba Diving product at ฿4,500; No Limit listed a two-dive try-dive at ฿3,900; Adventure Divers listed a two-dive Discover Scuba Diving product at ฿4,000; and Dive Station displayed its Basic Diver sale at ฿4,000. Those prices belong to different operators and may differ in agency paperwork, confined-water preparation, photo products, pickup and supervision. Confirm minimum age, swimming expectations, medical screening and whether the trip is appropriate for a non-certified participant.</p>
    <p><strong>Open Water certification:</strong> compare the complete course path. The current public examples checked on 25 July 2026 ranged from Pattaya Scuba Adventures' group rate of ฿13,490 per person for two or more to Adventure Divers' ฿16,500 course. Pattaya Dive Centre listed ฿14,990 for one person and ฿13,000 per person for two or more; Dive Station listed an SSI sale at ฿14,990; No Limit listed ฿15,900. A lower group price is useful only if the dates, required number of students, e-learning or manual, equipment, confined-water work, open-water dives, certification fee and transfer plan all match the traveller.</p>
    <p><strong>Already certified:</strong> compare the dive-day structure and rental line. Pattaya Dive Centre and Adventure Divers both published lower own-equipment prices than rental-equipment prices on 25 July 2026. No Limit's current day figure was presented with equipment included. Jomtien Dive Center said equipment other than a dive computer was included. Send the agency, certification level, logged-dive recency and equipment needs with the enquiry so the operator can place the diver on a suitable trip rather than only quote the cheapest boat space.</p>

    <h2>PADI and SSI without the marketing shorthand</h2>
    <p>Seven records in this set identify with PADI; Dive Station identifies with SSI. That difference does not by itself rank teaching quality, safety or suitability. For an entry-level course, ask what certification will be issued, how the digital learning works, what happens if a skill needs more time, the maximum student-to-professional arrangement for the booked course and which language the instruction uses. For a certified-diver day, send the existing certification rather than assuming the agency logo on the shop determines whether the card is accepted.</p>
    <p>PADI 5 Star or IDC wording supports a centre's current agency status and professional-training scope. It does not prove that every visitor product is better, that an instructor speaks the requested language, or that a specific date has space. Seafari and Real Divers have current PADI 5 Star IDC evidence, but this comparison does not push them above operators with clearer visitor tariffs merely because of the badge.</p>

    <h2>Price inclusions that change the real comparison</h2>
    <p>Pattaya Dive Centre's 25 July 2026 table said its day trips include transfers, equipment where selected, professional support, lunch and refreshments; it listed computers and torches as extras. No Limit separately listed equipment, computer, camera, Nitrox, photos or video and a third dive, making it easier to identify additions. Jomtien Dive Center said its Pattaya trip includes standard equipment except a computer, a qualified guide, lunch, refreshments and pickup within five kilometres; its Samae San information listed an additional ฿100 national-park fee on 25 July 2026. Adventure Divers said pickup and drop-off, lunch and drinks were included in its published products.</p>
    <p>Do not combine those statements into a market-wide promise. Ask the selected operator whether the quote includes hotel pickup from the exact address, all required rental equipment, a dive computer, weights and cylinders, lunch and drinking water, certification or e-learning charges, boat or park fees, photos, taxes and card charges. Ask which omissions are optional and which are compulsory for that product.</p>

    <h2>Location, pickup and the actual day</h2>
    <p>Central-shop locations include Pattaya Dive Centre near Beach Road, Seafari in the Mike Shopping Mall area, No Limit on Second Road and Adventure Divers on Thappraya Road. Pattaya Scuba Adventures is in South Pattaya. Jomtien Dive Center and Real Divers serve the Jomtien side, while Dive Station is on the Naklua side. Shop location can affect an in-person visit, but it does not prove the boat departure point, dive site or pickup coverage.</p>
    <p>Jomtien Dive Center publishes a pickup radius of five kilometres; that is operator-specific. Others describe transfers or pickup in their product inclusions, but the guide does not turn those statements into universal Pattaya coverage. Give the full accommodation name and map pin, ask for the pickup time and meeting point, and confirm the return estimate as a range rather than building a fixed evening connection around a sea day.</p>
    <p>Weather, boat plan, diver mix and operational decisions can change a day. Ask how the operator communicates a change, what the cancellation or rescheduling terms are, whether the booked product can switch sites and which costs are refundable. This guide does not promise a particular island, wreck, depth, visibility figure, marine-life sighting or number of minutes underwater.</p>

    <h2>Closed and stale records removed from the ranking</h2>
    <p><a href="/gyms/mermaids-dive/">Mermaids Dive Center</a> is marked closed after its exact Maps listing showed permanently closed on 26 July 2026. <a href="/gyms/aquanauts-dive-center/">Aquanauts Dive Center</a> is retained as likely closed, not ranked as an active recommendation. Thai Wake Park is a wakeboarding record, not a scuba operator; a previous broad text match captured it because an unrelated word contained the letters “ssi.” The exact-ID filter now prevents those closure and false-positive errors.</p>
    <p>The eight-record count is a statement about this directory's current evidence set, not a claim that only eight businesses can arrange diving in the region. An operator without adequate current first-hand evidence is omitted rather than padded into the list. A newly found shop should be added only after its identity, exact location, current activity and operator or agency source can be checked.</p>

    <h2>Before paying for any Pattaya dive product</h2>
    <ul>
      <li>Name the exact product: introductory dive, Open Water course, certified fun dives, snorkelling passenger or another course.</li>
      <li>Send the date, number of people, ages, certification level and recent-dive history.</li>
      <li>Ask for the total payable amount and a written list of inclusions and compulsory extras.</li>
      <li>Confirm equipment sizes, dive-computer policy and whether personal equipment changes the price.</li>
      <li>Complete the operator's medical questionnaire honestly and ask what documentation is required when an answer triggers review.</li>
      <li>Ask the operator for the applicable no-fly interval and schedule onward flights only after receiving qualified guidance for the planned dives.</li>
      <li>Confirm pickup from the exact address, meeting point, expected return window and contact method on the morning of departure.</li>
      <li>Read cancellation, weather, rescheduling, minimum-participant and refund terms before payment.</li>
      <li>Check the certification agency, course materials, number of training days and what happens if more time is needed.</li>
      <li>Keep the operator's current telephone or messaging contact available; a search-result snippet is not a booking confirmation.</li>
    </ul>

    <h2>How to use the shortlist</h2>
    <p>For the clearest current certified-diver price comparison, begin with Pattaya Dive Centre, No Limit, Jomtien Dive Center and Adventure Divers, then align equipment and pickup. For a current SSI course or beginner product, compare Dive Station's exact sale terms rather than assuming SSI is automatically cheaper. For a PADI Open Water group, compare Pattaya Scuba Adventures and Pattaya Dive Centre only after confirming the minimum group condition and course dates. Consider Seafari or Real Divers when IDC-level scope, location or a specific course matters, but request a current written quote because this guide does not use a stable general tariff for either.</p>
    <p>For activities beyond these eight scuba records, continue to the <a href="/guides/diving-watersports-pattaya/">Pattaya diving and watersports guide</a>. That broader page can include snorkelling and other water activities with different skills and risk profiles. Keep the products separate: a snorkelling passenger place, an introductory scuba dive and a certification course are not interchangeable simply because they share a boat.</p>
  </section>`,
    faqs: [
      { q: 'How much did a Pattaya Open Water course cost in the checked operator pages?', a: 'Prices checked on 25 July 2026 ranged from ฿13,490 per person on a qualifying two-or-more booking to ฿16,500 among the exact current products used here. Compare dates, agency, materials, equipment, certification fees, transfers and group conditions before choosing.' },
      { q: 'Should I choose PADI or SSI in Pattaya?', a: 'Choose the operator, course delivery, language, schedule and complete inclusions first. Seven records in this set identify with PADI and Dive Station with SSI; the agency name alone does not establish instructor quality or fit.' },
      { q: 'What should a certified diver send before requesting a quote?', a: 'Send the intended date, certification level and agency, recent-dive history, number of divers, equipment needs, accommodation map pin and any medical or scheduling constraint. Ask for the total price and all compulsory extras in writing.' }
    ]
  },
  {
    slug: 'best-golf-courses-pattaya',
    title: 'Best Golf Courses Near Pattaya 2026 | Verified Guide',
    h1: 'Best golf courses near Pattaya',
    desc: 'Compare 13 current golf-course records near Pattaya by published total price, course format, exact location and the booking details still requiring confirmation.',
    intro: 'This evidence-led shortlist contains {count} current regional course records. It does not rank present-day conditioning or claim a first-hand playing review. Use the published totals, course format, exact location and evidence gaps below to decide which clubs to contact.',
    pickerKey: 'golf-best',
    filter: g => [
      'chee-chan-golf',
      'laem-chabang-international',
      'siam-country-club',
      'burapha-golf-club',
      'phoenix-gold-golf',
      'pattaya-country-club',
      'pattana-sports-resort',
      'st-andrews-2000',
      'treasure-hill-golf',
      'khao-kheow-country-club',
      'bangpra-international',
      'mountain-shadow-country-club',
      'greenwood-golf-club'
    ].includes(g.id),
    rank: g => ({
      'chee-chan-golf': 13,
      'laem-chabang-international': 12,
      'siam-country-club': 11,
      'burapha-golf-club': 10,
      'phoenix-gold-golf': 9,
      'pattaya-country-club': 8,
      'pattana-sports-resort': 7,
      'st-andrews-2000': 6,
      'treasure-hill-golf': 5,
      'khao-kheow-country-club': 4,
      'bangpra-international': 3,
      'mountain-shadow-country-club': 2,
      'greenwood-golf-club': 1
    }[g.id] || 0),
    sections: [
      { label: 'Current course shortlist', take: 13 }
    ],
    extraHtml: () => `<section class="venue-body guide-extra">
      <h2>If you only do one thing</h2>
      <p><strong>Ask for the complete player total in writing, attached to the exact course or loop and tee time.</strong> A green fee alone may not be the amount required to start the round. The reply should separate the green fee, caddie, cart or buggy, club and shoe rental, taxes, card charge, deposit and date-specific supplement. It should also say which items are compulsory for that booking. Do not combine policies from different clubs into a Pattaya-wide rule.</p>
      <p>This shortlist is ordered by decision-useful current evidence, not by claimed course condition, prestige or a first-hand playing review. Chee Chan and Laem Chabang lead because current operator pages make a required visitor total possible. Siam Country Club is high because its four-course identity and booking route are clear, but it has no stable public tariff in this record. A lower position can simply mean that more of the purchase still requires a written quote.</p>

      <h2>What is included</h2>
      <p>The 13 records are Chee Chan, Laem Chabang, Siam Country Club, Burapha, Phoenix Gold, Pattaya Country Club, Pattana, St Andrews 2000, Treasure Hill, Khao Kheow, Bangpra, Mountain Shadow and Greenwood. They form a regional shortlist rather than a Pattaya-city list: several are in Si Racha, Ban Bueng, Rayong or northern Chonburi. Exact route planning is part of the choice.</p>
      <p>Practice-only facilities are deliberately excluded from the ranking. <a href="/gyms/pattaya-golf-driving-range/">Pattaya Golf Driving Range</a>, <a href="/gyms/diana-driving-range/">Diana Driving Range</a> and <a href="/gyms/golf-hub-pattaya/">Golf Hub Pattaya</a> can help with practice, but they are not substitutes for an 18-hole course comparison. Chatrium Golf Resort Soi Dao is also excluded: it is in Chanthaburi, outside this local shortlist, and its record documents a limited 2026 renovation phase rather than normal full-course operation.</p>

      <h2>Four prices that can be checked exactly</h2>
      <div class="table-wrap"><table class="price-table">
        <thead><tr><th>Record</th><th>Checked product</th><th>Required published total</th><th>Important condition</th></tr></thead>
        <tbody>
          <tr><td><a href="/gyms/chee-chan-golf/">Chee Chan</a></td><td>18 holes, weekday</td><td>฿5,800</td><td>฿4,500 green fee plus compulsory ฿1,300 caddie and cart</td></tr>
          <tr><td><a href="/gyms/chee-chan-golf/">Chee Chan</a></td><td>18 holes, weekend or public holiday</td><td>฿6,800</td><td>฿5,500 green fee plus compulsory ฿1,300 caddie and cart</td></tr>
          <tr><td><a href="/gyms/laem-chabang-international/">Laem Chabang</a></td><td>18 holes, weekday</td><td>฿4,930</td><td>฿3,500 green, ฿450 caddie and compulsory ฿980 buggy</td></tr>
          <tr><td><a href="/gyms/laem-chabang-international/">Laem Chabang</a></td><td>18 holes, weekend</td><td>฿5,430</td><td>฿4,000 green, ฿450 caddie and compulsory ฿980 buggy</td></tr>
          <tr><td><a href="/gyms/pattaya-country-club/">Pattaya Country Club</a></td><td>18 holes, weekday</td><td>฿3,500</td><td>฿2,500 green, ฿400 caddie and ฿600 cart</td></tr>
          <tr><td><a href="/gyms/pattaya-country-club/">Pattaya Country Club</a></td><td>18 holes, weekend</td><td>฿4,000</td><td>฿3,000 green, ฿400 caddie and ฿600 cart</td></tr>
          <tr><td><a href="/gyms/pattana-sports-resort/">Pattana</a></td><td>July 2026 early bird</td><td>฿1,650</td><td>Green, caddie and cart included; weekday before 07:30; eligibility restricted</td></tr>
        </tbody>
      </table></div>
      <p>All figures in the table were checked against the exact operator source on 25 July 2026. Chee Chan's public card is valid from 1 April to 30 September 2026. Its nine-hole green fee was ฿2,250 on weekdays or ฿2,750 on weekends and public holidays, with a compulsory ฿700 caddie-and-cart charge. Laem Chabang says VAT is included and prices may change; its same page listed a full club set at ฿1,300 and shoes at ฿400. Pattaya Country Club listed a full set at ฿1,200 and shoes at ฿300.</p>
      <p>Pattana's ฿1,650 line is not a general tourist benchmark. The operator limited it to weekday tee times before 07:30 from 1-31 July 2026 and to Thai nationals or foreign residents in Thailand. It expires after 31 July and does not establish the price for an overseas visitor, a later start or another month. Anyone outside those conditions needs a current quote.</p>

      <h2>Course format changes the question</h2>
      <p>Siam Country Club is a four-course operation. Its current site names the Old Course, Plantation, Waterside and Rolling Hills, opened in 1971, 2008, 2014 and 2020 respectively. “Siam Country Club” is not precise enough for a transfer or tee-time request. Name the course and use its exact pin.</p>
      <p>Burapha documents 36 holes. The Tourism Authority of Thailand gives par 144 and 14,132 yards for the whole complex; those totals do not describe the specific 18-hole combination assigned to one visitor. Ask which nines make up the booking, which tees suit the group and whether any loop or practice facility is unavailable.</p>
      <p>Laem Chabang, Phoenix Gold, Pattana and Greenwood each document 27 holes or three nine-hole loops. At Phoenix the named nines are Mountain, Lakes and Ocean. A quote should identify the combination in play rather than leaving “18 holes” as the only description. For Greenwood, the official site still confirmed three nines and Peter W. Thomson design on 27 July 2026, but its public green-fee page still did not expose a dependable extractable current number, so it remains a contact-first comparison rather than a price-table entry.</p>
      <p>Chee Chan, Pattaya Country Club, St Andrews 2000, Treasure Hill, Bangpra and Mountain Shadow are documented as 18-hole records. That makes the identity simpler, but it does not answer tee choice, cart policy, temporary work or start-interval questions. Khao Kheow remains in the shortlist because its current identity and activity are supported; obtain the exact course arrangement and tariff directly.</p>

      <h2>Location and route planning</h2>
      <p>Chee Chan is in Na Jomtien/Sattahip. Phoenix Gold is in Huai Yai. Siam Country Club is in Pong, while Pattaya Country Club is on Highway 331 at Khao Mai Kaeo. These are the records most naturally grouped with the greater Pattaya side of the region, but none should be assigned a fixed travel time without the actual hotel and tee time.</p>
      <p>Laem Chabang, Burapha, Pattana and Khao Kheow are on the Si Racha side. Treasure Hill, Bangpra, Mountain Shadow and Greenwood extend the comparison farther north into Ban Bueng or Chonburi. St Andrews is in Ban Chang, Rayong. A lower green fee can be a poor fit if a private vehicle must wait for the round or the route creates a rushed arrival.</p>
      <p>Open the exact venue map before requesting transport. Give the driver the course name, map pin, player count, golf-bag count and required arrival time. Ask whether waiting, tolls and the return journey are included. For self-drive, confirm the correct gate, bag drop and parking area. This guide does not publish a universal central-Pattaya transfer time or fare because the start point, traffic, route and course location differ.</p>

      <h2>Price anatomy without a false universal rule</h2>
      <p>A written golf quote can contain a green fee, caddie fee, cart or buggy, rental set, shoe rental and other date-specific charges. Chee Chan explicitly makes its combined caddie and cart charge compulsory. Laem Chabang explicitly lists the buggy as compulsory. Pattaya Country Club's current venue record calculates its required green, caddie and cart total from the operator table. Those statements belong to those operators; this guide does not infer that the same components or policy apply at every course.</p>
      <p>Ask separately about caddie tips instead of treating an online custom or old package estimate as a compulsory amount. Ask whether one or two people share a cart, whether a non-playing companion is allowed, whether rental clubs require a deposit and what happens when weather interrupts the round. A reseller bundle may include transfer or another service, but this comparison uses the operator's own tariff when stating a course price.</p>

      <h2>Beginners and higher-handicap groups</h2>
      <p>A famous design is not automatically the most practical first round. Tell reservations the handicap or experience range, number of players and whether anyone needs rental clubs. Ask which tees are appropriate, whether the chosen loop is suitable, how much time before the tee time is required and whether a lesson or practice session can be booked separately. Do not ask the desk to guarantee a score or a particular course condition.</p>
      <p>For a warm-up without a full course booking, Pattaya Golf Driving Range has the clearest current conditional practice price in this directory: Pattaya Sports Club lists ฿55 for 55 balls when the PSC membership card is shown, checked 26 July 2026. That is a member benefit, not the public tray price. Diana Driving Range and Golf Hub remain useful comparison records, but neither contributes an assumed numeric rate here.</p>

      <h2>Where current prices are still missing</h2>
      <p>Siam Country Club provides a live tee-time enquiry but no stable public tariff in the checked first-hand pages. Burapha has current identity, hours and 36-hole evidence but no owner-owned public rate table found in this check. Phoenix Gold publishes its course identity, hours and booking contacts but not a stable current playing tariff. St Andrews, Treasure Hill, Khao Kheow, Bangpra, Mountain Shadow and Greenwood also require a direct current total rather than a copied reseller number.</p>
      <p>A missing figure is an evidence gap, not a sign that a course is cheap, expensive or unavailable. Request the same components from each candidate on the same date. Preserve the written replies until the booking is complete, and check whether the payer is dealing with the course or a third party.</p>

      <h2>Booking checklist</h2>
      <ul>
        <li>Name the exact course, and for multi-loop venues name or request the 18-hole combination.</li>
        <li>Give the play date, preferred tee-time window, player count and handicap or experience range.</li>
        <li>Request the total per player with every compulsory green, caddie, cart and date supplement separated.</li>
        <li>Ask whether rental clubs, shoes, a locker, taxes, deposit or card fee are additional.</li>
        <li>Confirm cart policy, sharing arrangement, caddie assignment and the handling of any non-playing companion.</li>
        <li>Ask for the required arrival time, dress code, footwear rule, exact entrance and check-in desk.</li>
        <li>Confirm the cancellation, no-show, rain-interruption, rescheduling and refund terms before payment.</li>
        <li>Give the accommodation map pin when asking about a transfer; confirm bags, tolls, waiting and return terms.</li>
        <li>Recheck temporary maintenance, available nines and the final tee time shortly before the date.</li>
        <li>Keep the dated operator quote and payment confirmation rather than relying on a search snippet.</li>
      </ul>

      <h2>How to read the order</h2>
      <p>Start with Chee Chan, Laem Chabang or Pattaya Country Club when a comparable current required total matters. Add Pattana only when the July early-bird eligibility and time window genuinely apply. Use Siam Country Club when choosing among its four named courses is the priority, then obtain the missing total. Burapha suits a 36-hole-complex comparison; Phoenix, Laem Chabang, Pattana and Greenwood suit readers comparing multi-nine formats.</p>
      <p>The rest of the list extends geographic and course-format choice without pretending that sparse tariff evidence establishes value. Open every individual record for current sources and unresolved questions. The <a href="/category/golf/">complete golf directory</a> includes courses and practice venues, while the <a href="/area/sattahip/">Sattahip area page</a> helps place Chee Chan against other southern activities.</p>
    </section>`,
    faqs: [
      { q: 'What required golf totals were checked near Pattaya?', a: 'On 25 July 2026, Chee Chan totalled ฿5,800 weekday or ฿6,800 weekend for 18 holes with its compulsory caddie and cart charge. Laem Chabang totalled ฿4,930 or ฿5,430, and Pattaya Country Club ฿3,500 or ฿4,000, using each operator\'s published components.' },
      { q: 'What should I confirm before booking a Pattaya golf course?', a: 'Confirm the exact course or nine-hole combination, tee time, total green, caddie and cart cost, compulsory items, rentals, arrival time, dress rule, exact entrance, transport and cancellation or rain terms in writing.' },
      { q: 'Are Pattaya driving ranges included in the course ranking?', a: 'No. Pattaya Golf Driving Range, Diana Driving Range and Golf Hub Pattaya are practice facilities, so they are discussed separately and excluded from the 13-course order.' }
    ]
  },
  {
    slug: 'pattaya-digital-nomad-fitness',
    title: 'Pattaya Digital Nomad Fitness Guide | Pattaya Gym',
    h1: 'Pattaya fitness for digital nomads',
    desc: 'Compare Pattaya 24-hour member gyms, short passes, yoga and scheduled Muay Thai without assuming overnight visitor access.',
    intro: 'A remote-work routine depends on the exact access product, staffed arrival window, class clock and route. This guide separates 24-hour member entry from reception hours and compares published short passes with contact-first gyms.',
    pickerKey: 'nomads',
    filter: g => {
      const text = textForVenue(g);
      return ['fitness', 'yoga', 'muay-thai', 'swimming', 'clubs', 'crossfit'].includes(g.category)
        && /24|no.?contract|day.?pass|central|jomtien|english|air.?con|pool|sauna|class|yoga|running|beach|hotel|fitness|workout/.test(text);
    },
    rank: g => {
      const text = textForVenue(g);
      let s = 0;
      if (/24|no.?contract|day.?pass/.test(text)) s += 14;
      if (/central|jomtien|beach/.test(text)) s += 8;
      if (/english|air.?con|sauna|pool/.test(text)) s += 6;
      if (g.category === 'fitness') s += 7;
      if (g.category === 'yoga' || g.category === 'clubs') s += 5;
      if (g.priceRange === '฿' || g.priceRange === '฿฿') s += 4;
      return s;
    },
    sections: [
      { label: 'Flexible memberships and 24-hour access', take: 6 },
      { label: 'Workday reset sessions', take: 5 },
      { label: 'Outdoor routines before or after calls', take: 4 }
    ],
    primerHtml: () => `
  <section class="about" aria-labelledby="nomad-guide-decision" style="margin-top: 32px;">
    <h2 id="nomad-guide-decision">If you only read one thing</h2>
    <p><strong>Choose the access clock before the venue name.</strong> A 24-hour door for an enrolled member is not proof of overnight reception or an instant tourist pass. A class timetable is not all-day access, and a monthly tariff is not a day-pass promise. Match the product to the gap between calls, then check the first-visit process, exact pin and complete dated price.</p>
    <p>For the lowest-uncertainty purchase in this set, <a href="/gyms/elite-gym-fitness-pattaya/">Elite Gym &amp; Fitness</a> publishes short access from a THB 300 day to a THB 2,200 month. <a href="/gyms/yoga-pattaya/">Yoga Pattaya</a> publishes class prices, while <a href="/gyms/wko-muay-thai/">ISS Boxing and Muay Thai</a> publishes a fixed afternoon class clock. The 24-hour chains are useful when member access matters, but current Pattaya visitor prices or staffed-arrival details still need checking.</p>
    <div class="table-wrap">
      <table class="price-table">
        <thead><tr><th>Remote-work need</th><th>Current evidence</th><th>Decision limit</th></tr></thead>
        <tbody>
          <tr><td>Member access at any hour</td><td><a href="/gyms/jetts-fitness-pattaya/">Jetts Little Walk</a>: 24-hour member access; staff Mon-Fri 06:00-22:00, weekends and public holidays 08:00-20:00</td><td>No current Pattaya public price was found; arrive during staff hours for first registration</td></tr>
          <tr><td>Two 24-hour branch choices</td><td><a href="/gyms/anytime-fitness-pattaya/">Anytime Fitness Pattaya</a>: separate Again Pattaya and Bukis Point branches with 24-hour member access</td><td>Staff hours and visitor price were not published in the checked branch material</td></tr>
          <tr><td>Large central 24-hour floor</td><td><a href="/gyms/fitness-7/">Fitness 7</a>: 24 hours; operator describes 2,000 m² and named equipment areas</td><td>No current public visitor tariff or overnight registration rule was found</td></tr>
          <tr><td>Published short gym pass</td><td><a href="/gyms/elite-gym-fitness-pattaya/">Elite Gym &amp; Fitness</a>: THB 300 day, THB 1,200 week, THB 2,200 month</td><td>Daily hours are 06:30-22:00, not 24 hours</td></tr>
          <tr><td>Booked yoga reset</td><td><a href="/gyms/yoga-pattaya/">Yoga Pattaya</a>: THB 500 standard group drop-in; THB 600 Ashtanga drop-in</td><td>Use the current timetable; a price does not reserve a class</td></tr>
          <tr><td>Fixed combat session</td><td><a href="/gyms/wko-muay-thai/">ISS</a>: boxing/Muay Thai classes Mon-Sat 14:00-15:30; THB 1,000 day, THB 4,000 week, THB 8,000 month</td><td>General gym access is a separately priced product</td></tr>
        </tbody>
      </table>
    </div>
    <p><strong>Trade-off:</strong> round-the-clock member entry maximises schedule freedom after onboarding, while a published short pass reduces price uncertainty. A scheduled class gives instruction but fixes the clock. Choose the constraint that would otherwise break the workday.</p>
  </section>`,
    faqs: [
      { q: 'Does a 24-hour Pattaya gym accept first-time visitors overnight?', a: 'Not necessarily. Jetts, Anytime and Fitness 7 publish round-the-clock access or operation, but the checked sources do not establish overnight reception or instant visitor registration. Confirm the branch, staffed arrival window, access method and complete price.' },
      { q: 'Which Pattaya fitness options publish short-stay prices?', a: 'Elite published THB 300 for a day, THB 1,200 for a week and THB 2,200 for a month on 27 July 2026. Yoga Pattaya and ISS publish class products, but those are scheduled instruction rather than unrestricted gym access.' },
      { q: 'How should a remote worker choose between a gym and a class?', a: 'Choose a gym when flexible access is the main constraint and a class when coaching is worth a fixed start time. Check travel time, first-entry rules, exact inclusions and cancellation terms before placing either around calls.' }
    ],
    extraHtml: () => `<article class="venue-body guide-extra">
      <h2>A three-step remote-work test</h2>
      <ol>
        <li><strong>Protect one repeatable time window.</strong> Use a 24-hour member product only after the access method works; use a class only if its exact start survives the meeting calendar.</li>
        <li><strong>Test the smallest published commitment.</strong> A day, single class or written trial answer is more reversible than an assumed monthly membership.</li>
        <li><strong>Extend after the route works.</strong> Recheck first-entry staffing, class booking, towel or locker terms, holiday changes and the full renewal or cancellation amount.</li>
      </ol>
      <p>No venue in this guide is ranked for Wi-Fi, coworking space, measured quietness or the quality of a first-hand workout. Those claims were not established by the checked operator sources.</p>
    </article>`
  },
  {
    slug: 'female-friendly-gyms-pattaya',
    title: 'Female-Friendly Gyms in Pattaya | Pattaya Gym',
    h1: 'Female-friendly gyms and sport venues in Pattaya',
    desc: 'Women-friendly Pattaya gyms, yoga studios, pools and beginner Muay Thai venues with safer locations, clear pricing and comfortable training culture.',
    intro: 'Female travellers and long-stay residents often optimise for a different mix: safe transport, clean changing rooms, transparent pricing, English-speaking staff, beginner-friendly classes and a training floor that feels comfortable rather than performative.',
    pickerKey: 'women',
    filter: g => {
      const text = textForVenue(g);
      return ['fitness', 'yoga', 'muay-thai', 'swimming', 'racquet'].includes(g.category)
        && /female|beginner|women|ladies|yoga|hotel|pool|classes|english|clean|safe|family|luxury|air.?con|trainer/.test(text);
    },
    rank: g => {
      const text = textForVenue(g);
      let s = 0;
      if (/female|women|ladies/.test(text)) s += 18;
      if (/beginner|all.?level|classes|english/.test(text)) s += 8;
      if (/hotel|luxury|pool|clean|safe|air.?con/.test(text)) s += 7;
      if (g.category === 'yoga' || g.category === 'swimming') s += 6;
      if (g.category === 'fitness') s += 4;
      return s;
    },
    sections: [
      { label: 'Most comfortable all-round choices', take: 6 },
      { label: 'Yoga, pools and lower-pressure training', take: 5 },
      { label: 'Beginner-friendly combat sport options', take: 4 }
    ],
    faqs: [
      { q: 'Are there women-only gyms in Pattaya?', a: 'The directory is stronger on female-friendly mixed venues than strictly women-only gyms. Look for yoga studios, hotel clubs, clean commercial gyms and beginner Muay Thai camps with English-speaking staff.' },
      { q: 'Is it safe for solo women to train in Pattaya?', a: 'Many venues are safe and professional, especially hotel clubs, chain gyms and established studios. Choose well-lit areas, use Grab or Bolt at night, and avoid venues that will not quote prices clearly.' },
      { q: 'Can beginner women try Muay Thai in Pattaya?', a: 'Yes. Several camps teach complete beginners and fitness-focused students. Tell the gym you want technique and conditioning, not hard sparring.' }
    ],
    extraHtml: sorted => {
      const yoga = sorted.find(g => g.category === 'yoga');
      const fairtex = sorted.find(g => g.id === 'fairtex-pattaya');
      return `<article class="venue-body guide-extra">
        <h2>Practical safety filters</h2>
        <ul>
          <li>Prioritise venues that publish opening hours, prices and maps links before you travel across town.</li>
          <li>For first sessions, choose staffed hours rather than key-fob-only late-night access.</li>
          <li>${yoga ? `<a href="/gyms/${yoga.id}/">A dedicated yoga studio</a>` : 'Dedicated yoga studios'} usually gives the lowest-pressure first week.</li>
          <li>${fairtex ? `<a href="/gyms/${fairtex.id}/">The Fairtex Naklua camp</a>` : 'Established heritage camps'} is better for structured Muay Thai than a random tourist pad session.</li>
        </ul>
      </article>`;
    }
  },
  {
    slug: 'pattaya-gyms-childcare-family-pools',
    title: 'Pattaya Gyms With Childcare and Pools | Pattaya Gym',
    h1: 'Pattaya gyms with childcare, kids sport and family pools',
    desc: 'Compare Pattaya family pool passes, kids sport lessons and guest-only facilities without confusing those products with childcare.',
    intro: 'Childcare, a coached children’s class, family leisure access and a hotel Kids Club are different products. This guide identifies what each current source actually establishes and keeps supervision or parent-training claims out unless an operator publishes them.',
    pickerKey: 'childcare-pools',
    filter: g => {
      const text = textForVenue(g);
      return g.category === 'kids-youth' || g.category === 'swimming'
        || /family|kid|child|junior|academy|pool|water.?park|swim|coaching|play|children/.test(text);
    },
    rank: g => {
      const text = textForVenue(g);
      let s = 0;
      if (g.category === 'kids-youth') s += 18;
      if (g.category === 'swimming') s += 10;
      if (/pool|swim|water.?park/.test(text)) s += 10;
      if (/child|kid|junior|academy|coaching/.test(text)) s += 8;
      if (/family|hotel|resort/.test(text)) s += 5;
      return s;
    },
    sections: [
      { label: 'Best pools and water-play venues', take: 5 },
      { label: 'Kids academies and coached sport', take: 6 },
      { label: 'Parent-friendly training bases', take: 4 }
    ],
    primerHtml: () => `
  <section class="about" aria-labelledby="family-guide-decision" style="margin-top: 32px;">
    <h2 id="family-guide-decision">If you only read one thing</h2>
    <p><strong>A child being admitted is not the same as a child being supervised.</strong> A pool day pass establishes leisure access; a coached academy session establishes instruction for its named age group and time; a hotel Kids Club may be restricted to registered guests. None automatically authorises a parent to leave the child or train elsewhere. Obtain the exact supervision, check-in, pickup and guardian rules in writing.</p>
    <div class="table-wrap">
      <table class="price-table">
        <thead><tr><th>Option</th><th>Verified product</th><th>What it does not establish</th></tr></thead>
        <tbody>
          <tr><td><a href="/gyms/hard-rock-pool/">Hard Rock Hotel pool</a></td><td>Non-resident leisure pool 09:00-19:00; THB 500 adult with selected cocktail, THB 400 child under 12 with fruit punch</td><td>Childcare, a lap lane or permission for a guardian to leave</td></tr>
          <tr><td><a href="/gyms/nara-maze-pool-day-pass/">Nara Maze</a></td><td>Non-guest pool 09:00-18:00; THB 500 net with water, smoothie and 20% food-and-drink discount excluding alcohol</td><td>Coached swimming, childcare or a separate gym product</td></tr>
          <tr><td><a href="/gyms/fitz-club/">Fitz Club</a></td><td>2026 outside-guest facilities pass: THB 800 adult, THB 400 child under 12</td><td>That every facility is appropriate for every child or that supervision is included</td></tr>
          <tr><td><a href="/gyms/af-academy-pattaya/">AF Academy</a></td><td>Ages 3-17; free first trial, THB 600 single session, THB 3,000 for eight, THB 3,600 for twelve</td><td>A central-Pattaya class, childcare outside the lesson or automatic age-group placement</td></tr>
          <tr><td><a href="/gyms/ramayana-water-park/">Ramayana Water Park</a></td><td>Tourist online price THB 1,099 or walk-in THB 1,199 for guests 106 cm and taller under the displayed offer; below 106 cm free</td><td>Childcare, sports coaching or permission to leave a child unaccompanied</td></tr>
          <tr><td><a href="/gyms/renaissance-pattaya-resort/">Renaissance Pattaya</a></td><td>Fitness centre, main, sunset and kids pools, and a Kids Club are documented for registered guests</td><td>A public day pass or outside-family access</td></tr>
        </tbody>
      </table>
    </div>
    <p><strong>Trade-off:</strong> a public pool pass gives a clear leisure product but not childcare. A coached academy gives a named session but may be at a specific training ground. A guest amenity can reduce on-site coordination only for eligible hotel guests. Choose the access and supervision model before comparing facilities.</p>
  </section>`,
    faqs: [
      { q: 'Do Pattaya gyms in this guide publish childcare?', a: 'No checked source establishes a general gym childcare service. The guide documents family pool admission, children’s lessons, water-park access and guest amenities; each has different supervision and guardian rules.' },
      { q: 'Which Pattaya options publish current family prices?', a: 'Hard Rock, Nara Maze, Fitz Club, AF Academy and Ramayana publish named current products in their records. Compare eligibility, age or height rules, hours, inclusions and the complete family total rather than the smallest headline amount.' },
      { q: 'Can a parent train while a child attends one of these products?', a: 'Do not assume so. Ask whether the child is continuously supervised, whether the guardian must remain poolside or on the premises, who may check in and collect the child, and whether the adult fitness area is a separate eligible product.' }
    ]
  },
  {
    slug: 'pattaya-seniors-low-impact-sport',
    title: 'Pattaya Seniors Low-Impact Sport Guide | Pattaya Gym',
    h1: 'Low-impact sport in Pattaya for seniors 65+',
    desc: 'Low-impact Pattaya fitness options for seniors: swimming, yoga, golf, walking routes, racquet clubs and rehab-friendly sport venues.',
    intro: 'Pattaya has a large retiree and long-stay community, so low-impact sport matters. This guide prioritises swimming, walking routes, yoga, golf, pickleball, gentle racquet sports and venues with controlled environments over high-intensity training.',
    pickerKey: 'seniors',
    filter: g => {
      const text = textForVenue(g);
      return ['swimming', 'yoga', 'golf', 'racquet', 'clubs', 'fitness'].includes(g.category)
        && /pool|swim|yoga|walk|walking|running|lake|golf|pickleball|tennis|rehab|physio|hotel|low|senior|beginner/.test(text);
    },
    rank: g => {
      const text = textForVenue(g);
      let s = 0;
      if (g.category === 'swimming' || g.category === 'yoga') s += 12;
      if (g.category === 'golf' || g.category === 'racquet') s += 8;
      if (/pickleball|walk|walking|lake|pool|swim|rehab|physio/.test(text)) s += 10;
      if (/beginner|hotel|air.?con|low/.test(text)) s += 5;
      if (g.priceRange === '฿' || g.priceRange === '฿฿') s += 3;
      return s;
    },
    sections: [
      { label: 'Gentle cardio and pool-based options', take: 6 },
      { label: 'Low-impact racquet and golf choices', take: 6 },
      { label: 'Easy public routes and community sport', take: 4 }
    ],
    primerHtml: () => `<section class="venue-body guide-extra">
      <p><strong>If you only read one thing: “low impact” is a planning label, not a medical clearance.</strong> Choose the exact product that matches the person's current ability, obtain clinical advice when health or recovery is involved, and confirm the session, access, total price and route before paying. A pool, yoga studio, rehabilitation department and social boules club solve different problems and should not be ranked as interchangeable exercise.</p>

      <p>This guide uses current Pattaya directory records to compare access models. It does not diagnose a condition, prescribe exercise or imply a first-hand visit. The strongest options below publish either a defined outside-guest product, a current timetable or a clinical service description. Where a fee or suitability rule is missing, the correct next step is a direct enquiry, not a guessed price or a recommendation based on reviews.</p>

      <h2>Match the activity to the real constraint</h2>

      <div class="table-wrap">
      <table class="price-table">
        <thead><tr><th>Current option</th><th>What the source establishes</th><th>Main unresolved question</th></tr></thead>
        <tbody>
          <tr><td><a href="/gyms/bangkok-hospital-pattaya-rehab/">Bangkok Hospital Pattaya Rehabilitation Center</a></td><td>Hospital-based assessment, physical and occupational therapy and an exercise zone; daily centre hours 08:00-20:00</td><td>The assessed treatment plan, appointment route, ordinary tariff, insurance and language support</td></tr>
          <tr><td><a href="/gyms/hard-rock-pool/">Hard Rock Hotel pool</a></td><td>Non-resident leisure-pool access 09:00-19:00; THB 500 adult with selected cocktail and THB 400 child under 12 with fruit punch</td><td>Lane suitability, towel, locker, capacity and the child's complete supervision rule</td></tr>
          <tr><td><a href="/gyms/nara-maze-pool-day-pass/">Nara Maze at Terra Nara</a></td><td>THB 500 net non-guest leisure-pool pass 09:00-18:00 with water, one smoothie and a food-and-drink discount excluding alcohol</td><td>Child pricing, lane dimensions, towels, lockers, parking and any reservation limit</td></tr>
          <tr><td><a href="/gyms/fitz-club/">Fitz Club</a></td><td>2026 outside-guest facilities pass at THB 800 adult or THB 400 child under 12 for gym, pool, sauna and steam</td><td>Whether the chosen activity is suitable; tennis, squash, coaching and other court products are separate</td></tr>
          <tr><td><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a></td><td>Group and private yoga, standard one-hour drop-in at THB 500 and Ashtanga at THB 600; current pass menu</td><td>The live class, level, teacher, language and any individual health constraint</td></tr>
          <tr><td><a href="/gyms/pattaya-petanque-club/">Pattaya Sai 3 Petanque Club</a></td><td>Current central club identity with listed 14:00-midnight hours</td><td>Visitor access, current fee, equipment, language, organised play and the correct overlapping entrance</td></tr>
        </tbody>
      </table>
      </div>

      <p><strong>Trade-off:</strong> the clearest public price may buy leisure rather than training. A clinical department offers assessment rather than casual entry. A social club can reduce formal structure but may require the most contact. Decide which uncertainty matters most before comparing the headline amount.</p>

      <h2>Clinical rehabilitation is not a gym category</h2>

      <p><a href="/gyms/bangkok-hospital-pattaya-rehab/">Bangkok Hospital Pattaya Rehabilitation Center</a> belongs in this guide only as a clinical route. Its operator describes physician assessment, physical and occupational therapy, treatment rooms and an exercise zone for post-orthopaedic, musculoskeletal and neurological needs. That evidence does not establish a public gym pass or allow this directory to select a treatment.</p>

      <p>Contact the centre with the reason for the appointment and ask whether the first booking should be with a physician or therapist. Confirm referrals, imaging or operation notes, medication information, language support, estimate and insurance pre-authorisation. The centre's 08:00-20:00 listing is not the same as the wider hospital's round-the-clock operation. For an emergency, use the appropriate hospital emergency pathway rather than a directory guide.</p>

      <h2>Pool access: leisure product versus training product</h2>

      <p><a href="/gyms/hard-rock-pool/">Hard Rock Hotel pool</a> and <a href="/gyms/nara-maze-pool-day-pass/">Nara Maze</a> publish explicit non-resident passes. That makes eligibility and the core price clearer than at a hotel that merely advertises a pool to registered guests. Both are documented as leisure settings; neither record publishes lap length, reserved training lanes or a coached programme.</p>

      <p><a href="/gyms/fitz-club/">Fitz Club</a> offers a broader facilities pass that includes its gym, pool, sauna and steam. The same pass excludes tennis and squash, which have separate prices. A wider inclusion list can be useful, but it also creates more suitability questions: confirm which facilities the visitor intends to use, child eligibility, supervision, current hours and any reservation procedure. Do not infer that a sauna, steam room or gym floor is medically appropriate because it appears in a package.</p>

      <p>For more pool records, use the <a href="/guides/swimming-pools-pattaya/">Pattaya pool guide</a>. It distinguishes public access, hotel leisure passes, children's instruction and unverified municipal access. If the goal is continuous lap work, require a source that states dimensions or lane access rather than treating a large leisure-pool area as proof.</p>

      <h2>Yoga and controlled studio sessions</h2>

      <p><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a> publishes named styles, drop-ins, passes and teaching languages. That is useful transaction evidence, but “open level” does not guarantee that a class is appropriate for every older beginner. Ask for the exact style, pace, duration, teacher and language. Describe balance, floor-transfer or movement constraints and ask whether a suitable variation is part of that session. Seek qualified medical advice when an injury or condition affects participation.</p>

      <p><a href="/gyms/one-d-yoga-studio/">ONE-D Yoga</a> has a current identity and morning and selected evening listing hours but no public tariff or class-by-class schedule. <a href="/gyms/balance-yoga-studio-pattaya/">Balance Yoga</a> publishes several prices but its accessible timetable was stale at verification. Both remain legitimate contact-first options. Missing schedules or prices do not make them closed; they simply make them less predictable for a visitor who needs a fixed, documented product.</p>

      <h2>Social boules and other community choices</h2>

      <p><a href="/gyms/pattaya-petanque-club/">Pattaya Sai 3 Petanque Club</a> is a current central identity with afternoon-to-midnight listed hours. Its record does not establish a beginner lesson, visitor fee, supplied boules or English-language organiser. Call before travelling and ask whether the intended time has casual play, practice or an event, which of the nearby overlapping pins to use and what equipment is needed.</p>

      <p><a href="/gyms/pattaya-lawn-bowls/">Pattaya lawn bowls</a> groups several facilities and roll-up information, so the exact site matters. Do not transfer a price, schedule or access rule from one bowls location to another. The <a href="/guides/running-cycling-clubs-pattaya/">community-sport guide</a> provides more club options but should not be used as a medical ranking.</p>

      <p>Racquet labels also need care. Pickleball, badminton and tennis can be adjusted in pace, but this guide does not declare them low-impact for a particular person. Use the <a href="/guides/padel-pickleball-pattaya/">padel and pickleball guide</a> or <a href="/guides/tennis-badminton-pattaya/">tennis and badminton guide</a> to find a current booking product, then ask about coaching, surface, doubles format, rest and equipment. A smaller court or social format does not replace individual advice.</p>

      <h2>Heat, timing and route planning without invented guarantees</h2>

      <p>Choose a repeatable time from the venue's current schedule. Indoor pools and studios reduce some weather uncertainty, while beach, walking, golf and outdoor club options remain exposed to conditions. This guide does not prescribe a universal “safe” hour. Ask the venue or organiser about the intended date, and make an individual plan for hydration, medication, sun exposure and transport with appropriate professional advice where needed.</p>

      <p>Use exact pins and entrances. Fitz Club is inside Royal Cliff on Pratamnak; Balance Yoga is inside a condominium; the rehabilitation centre is on the third floor of Building A at Bangkok Hospital Pattaya; Nara Maze is inside Terra Nara. An area page such as <a href="/area/central-pattaya/">Central Pattaya</a> or <a href="/area/naklua/">Naklua</a> provides context but does not establish a walk time, step-free route, parking space or return fare.</p>

      <h2>A low-commitment booking sequence</h2>

      <ol>
        <li><strong>Define the need.</strong> Separate clinical rehabilitation, independent exercise, supervised instruction and social play.</li>
        <li><strong>Choose one exact product.</strong> Use a dated day pass, drop-in, assessment or confirmed visitor session rather than a broad venue reputation.</li>
        <li><strong>State constraints.</strong> Ask about movement, language, access, changing facilities, guardian or companion rules and the exact entrance.</li>
        <li><strong>Get the complete total.</strong> Include registration, equipment, towels, lockers, coaching, transport and cancellation where relevant.</li>
        <li><strong>Extend only after the product fits.</strong> A longer package is useful only when the route, schedule, access and individual response are workable.</li>
      </ol>

      <p>The directory can verify current source statements and unresolved gaps; it cannot guarantee future availability, a health outcome or how an individual session will feel. Reconfirm any time-sensitive detail directly and retain the venue's written answer.</p>
    </section>`,
    faqs: [
      { q: 'Does “low impact” mean an activity is medically appropriate?', a: 'No. It is a planning label, not a diagnosis or clearance. Choose the exact product, describe relevant constraints, and obtain qualified medical guidance when health, injury or recovery affects participation.' },
      { q: 'Which Pattaya options publish outside-guest access?', a: 'Hard Rock and Nara Maze publish non-resident leisure-pool passes, while Fitz Club publishes a broader outside-guest facilities pass. Compare the exact inclusions and unresolved lane, supervision, locker and reservation rules.' },
      { q: 'Should a confirmed venue be removed when its price is missing?', a: 'No. A missing public tariff is a contact task, not evidence of closure. Ask the exact venue for the dated product, complete total, inclusions, eligibility, cancellation terms and entrance before travelling.' }
    ]
  },
  {
    slug: 'thai-gym-terms-pattaya',
    title: 'Thai Gym Terms for Pattaya Sport Visitors',
    h1: 'Thai gym terms for Pattaya sport visitors',
    desc: 'A Pattaya sport vocabulary cheat sheet for gyms, Muay Thai camps, yoga, swimming, golf, directions, prices and polite Thai phrases.',
    intro: 'You can train comfortably in English at many Pattaya venues, but a few Thai words make check-in, prices, directions and Muay Thai classes smoother. Use this as a quick field guide before your first session.',
    pickerKey: 'thai-terms',
    filter: g => ['muay-thai', 'fitness', 'yoga', 'watersports', 'golf', 'racquet'].includes(g.category),
    rank: g => {
      const text = textForVenue(g);
      let s = 0;
      if (g.category === 'muay-thai') s += 10;
      if (/thai|english|beginner|lesson|class|trainer|coach/.test(text)) s += 6;
      if (g.category === 'fitness' || g.category === 'yoga') s += 4;
      return s;
    },
    sections: [
      { label: 'Venues where Thai phrases help most', take: 6 },
      { label: 'Beginner-friendly places to practise', take: 6 }
    ],
    faqs: [
      { q: 'Do Pattaya gyms speak English?', a: 'Many tourist-facing gyms, Muay Thai camps, dive shops and hotel clubs speak English. Small local gyms may use basic English, gestures and phone translation.' },
      { q: 'Should I use Thai at Muay Thai camps?', a: 'A few words help. Say hello, thank the trainer, learn left/right/kick/punch/counting, and ask politely before filming.' },
      { q: 'What is the most useful Thai phrase for gyms?', a: 'Start with asking the price, whether the venue is open today, and whether one session or a day pass is available.' }
    ],
    extraHtml: () => `<article class="venue-body guide-extra">
      <h2>Core vocabulary cheat sheet</h2>
      <table>
        <thead><tr><th>English</th><th>Thai</th><th>How to use it</th></tr></thead>
        <tbody>
          <tr><td>Gym</td><td><span lang="th">&#x0e22;&#x0e34;&#x0e21;</span> (yim)</td><td>Ask a driver for the gym or look for signage.</td></tr>
          <tr><td>Muay Thai</td><td><span lang="th">&#x0e21;&#x0e27;&#x0e22;&#x0e44;&#x0e17;&#x0e22;</span> (muay thai)</td><td>The sport itself; camps often say this in English too.</td></tr>
          <tr><td>Boxing camp</td><td><span lang="th">&#x0e04;&#x0e48;&#x0e32;&#x0e22;&#x0e21;&#x0e27;&#x0e22;</span> (khai muay)</td><td>Useful for local Muay Thai gyms away from hotel areas.</td></tr>
          <tr><td>Trainer / teacher</td><td><span lang="th">&#x0e04;&#x0e23;&#x0e39;</span> (khru)</td><td>Polite way to address a Muay Thai trainer.</td></tr>
          <tr><td>Price</td><td><span lang="th">&#x0e23;&#x0e32;&#x0e04;&#x0e32;</span> (raa-khaa)</td><td>Use before asking about a drop-in, monthly fee or lesson.</td></tr>
          <tr><td>Open</td><td><span lang="th">&#x0e40;&#x0e1b;&#x0e34;&#x0e14;</span> (bpert)</td><td>Useful when checking whether a gym is open today.</td></tr>
          <tr><td>Closed</td><td><span lang="th">&#x0e1b;&#x0e34;&#x0e14;</span> (bpit)</td><td>Common on holiday or maintenance notices.</td></tr>
          <tr><td>Thank you</td><td><span lang="th">&#x0e02;&#x0e2d;&#x0e1a;&#x0e04;&#x0e38;&#x0e13;</span> (khop khun)</td><td>Use after pad work, coaching, directions or help.</td></tr>
        </tbody>
      </table>
      <h2>Polite questions to screenshot</h2>
      <ul>
        <li><strong>One session?</strong> Ask for a single class or day pass before discussing monthly membership.</li>
        <li><strong>Open today?</strong> Show the venue name and ask whether it is open now, especially around Thai holidays.</li>
        <li><strong>Can I film?</strong> Always ask before recording sparring, pad work or other members.</li>
      </ul>
    </article>`
  }
  ,
  {
    slug: 'pattaya-russian-speaking-sport',
    title: 'Pattaya Russian-Speaking Gyms, Camps & Sport Venues',
    h1: 'Pattaya sport venues with Russian-speaking staff',
    desc: 'Pattaya gyms, Muay Thai camps, kids football, yoga and dive operators with Russian-speaking instructors and staff. Built for the Russian expat community.',
    intro: 'Pattaya hosts one of the largest Russian-speaking communities in Thailand. Many sport venues — particularly in Naklua, Pratamnak, Jomtien and Sukhumvit — explicitly support Russian-language coaching. This guide collects the venues where Russian is a stated working language, organised by sport.',
    pickerKey: 'russian',
    filter: g => {
      const langs = (g.languages || []).join(' ').toLowerCase();
      const desc = (g.description || '').toLowerCase();
      const tags = (g.tags || []).join(' ').toLowerCase();
      return /russian/.test(langs) || /russian/.test(desc) || /russian/.test(tags);
    },
    rank: g => {
      const langs = (g.languages || []).join(' ').toLowerCase();
      const desc = (g.description || '').toLowerCase();
      let s = 0;
      if (/russian/.test(langs)) s += 10;
      if (/russian/.test(desc)) s += 5;
      if (g.category === 'kids-youth' || g.category === 'muay-thai') s += 4;
      if (g.category === 'fitness' || g.category === 'yoga') s += 3;
      return s;
    },
    sections: [
      { label: 'Top Russian-friendly picks', take: 4 },
      { label: 'Russian-speaking Muay Thai & combat camps', take: 4 },
      { label: 'Russian-speaking fitness, yoga & kids sport', take: 6 }
    ],
    faqs: [
      { q: 'Which Pattaya gyms have Russian-speaking trainers?', a: 'Several: AF Academy (kids football), Rusich Club (HSIF Thailand), Elite Gym & Fitness, KBA Kiteboarding (some staff), Castra Gym in East Pattaya, and Muscle Factory all have Russian-speaking staff or members. Check each venue\'s languages field on its page.' },
      { q: 'Is there a Russian football academy in Pattaya?', a: 'Yes — Rusich Club Pattaya (HSIF Thailand) runs Russian-language coaching for ages 5-16, and AF Academy markets explicitly to the Russian community in Naklua / Jomtien / Pratumnak / Central.' },
      { q: 'Where are the largest Russian expat areas in Pattaya?', a: 'Naklua / North Pattaya is the historical centre. Pratamnak Hill and Jomtien have grown significantly. Sukhumvit-corridor condos also house large Russian-speaking communities.' }
    ]
  },
  {
    slug: 'pattaya-solo-female-fitness',
    title: 'Pattaya for Solo Female Travelers — Sport & Fitness',
    h1: 'Pattaya sport venues for solo female travelers',
    desc: 'A verification-first guide for solo women comparing Pattaya gyms, Muay Thai, yoga and pools by exact product, current price evidence, staffed arrival and route.',
    intro: 'No directory can certify how a future visit will feel. This guide gives solo women a practical way to compare the facts operators do publish, identify the questions they do not answer, and make a small first booking before committing to a longer Pattaya training plan.',
    pickerKey: 'solo-female',
    primerHtml: () => `
      <section class="venue-body guide-extra">
        <p><strong>If you only read one thing:</strong> choose the exact first transaction and arrange the arrival and return before paying. “Open,” “beginner friendly,” “hotel gym” and “all levels” answer different questions. None establishes the coach leading your session, whether partner contact is optional, whether reception will be staffed, or how you will leave after an evening class. A single suitable session or day pass is usually a better first test than a non-refundable month.</p>

        <p>This guide does not label a venue safe, women-only or universally welcoming. The checked operator pages do not support those blanket promises. It also does not infer a female trainer from a photograph, a guest review or a venue category. Instead, it compares named products and tells you what to request in writing. Start with the <a href="/category/fitness/">fitness directory</a>, <a href="/category/muay-thai/">Muay Thai directory</a> or <a href="/category/yoga/">yoga directory</a> when the activity matters more than this planning lens.</p>

        <h2>Match the first purchase to the uncertainty</h2>
        <div class="guide-price-table-wrap">
          <table class="guide-price-table">
            <caption>Examples checked from operator sources, 25-27 July 2026</caption>
            <thead><tr><th scope="col">Option</th><th scope="col">Published product</th><th scope="col">Useful first check</th><th scope="col">Still ask</th></tr></thead>
            <tbody>
              <tr><td><a href="/gyms/smash-fitness-kickboxing/">SMASH</a></td><td>Kickboxing, strength and hybrid sessions in a live booking grid; no dependable baht tariff</td><td>Reserve the named one-hour session</td><td>Price, gloves, wraps, contact level and staffed arrival</td></tr>
              <tr><td><a href="/gyms/battle-conquer-gym/">Battle &amp; Conquer</a></td><td>THB 500 group session; THB 2,500 week; THB 7,000 month</td><td>Use one group session before extending</td><td>Beginner placement, partner work, equipment and exact coach</td></tr>
              <tr><td><a href="/gyms/wko-muay-thai/">ISS Boxing and Muay Thai</a></td><td>THB 1,000 class day; THB 4,000 week; THB 8,000 month</td><td>Confirm the Monday-Saturday 14:00-15:30 class</td><td>Which discipline, trainer language and glove or wrap terms</td></tr>
              <tr><td><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a></td><td>Group and private yoga with current passes and a changing timetable</td><td>Choose the exact class, teacher and language</td><td>Current slot, level, booking and cancellation</td></tr>
              <tr><td><a href="/gyms/hard-rock-pool/">Hard Rock pool</a></td><td>THB 500 net adult non-resident leisure-pool access with one named drink</td><td>Use only if a leisure pool is the intended product</td><td>Outside-guest window, changing access and current inclusions</td></tr>
            </tbody>
          </table>
        </div>

        <p>The amounts in the table are not a ranking. Battle sells a group Muay Thai session with gym and recovery access in its longer packages; ISS separates classes from general-gym and recovery products; Hard Rock sells leisure-pool access rather than a lane workout. SMASH is contact-first because its public portal did not establish a reliable currency. Missing price is a request for a quote, not evidence that an operating venue should be removed.</p>

        <h2>Combat training: name the contact you will accept</h2>
        <p>For Muay Thai, boxing or kickboxing, tell the operator whether you are new, returning or preparing for competition. Ask which session accepts that level and whether drills require pads, partner contact or sparring. If you do not want head contact or open sparring, say so before booking and repeat it to the coach. A general “all levels” label is useful but does not define every drill. The <a href="/guides/muay-thai-pattaya-beginners/">beginner Muay Thai guide</a> provides a longer class-placement checklist.</p>

        <p><a href="/gyms/fairtex-pattaya/">Fairtex</a> publishes one Muay Thai session at THB 800, ten at THB 7,000 and a training month at THB 16,500, while its accommodation products are separate transactions. <a href="/gyms/battle-conquer-gym/">Battle &amp; Conquer</a> publishes group sessions at 08:00-10:00 and 16:00-18:00. ISS publishes a 14:00-15:30 class Monday-Saturday. Those are useful scheduling facts, not guarantees about the individual trainer, group makeup or contact level on a future date. Request the date, start, coach, class format, price and equipment arrangement in one reply.</p>

        <h2>Yoga and general fitness: a venue clock is not a class clock</h2>
        <p><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a> publishes group and private practice in English, Russian and Thai, but its timetable changes; the selected teacher and language still need confirmation. <a href="/gyms/one-d-yoga-studio/">ONE-D Yoga</a> has current operator activity and split morning and evening operating periods, yet no dependable public class-by-class timetable or rate card. <a href="/gyms/ashtanga-yoga-pattaya/">Ashtanga Yoga Pattaya</a> describes Mysore-style individual progression within a shared room and explicitly tells visitors to ask for current schedule and prices. These are three different access models, not interchangeable “women's classes.”</p>

        <p>For a conventional gym, decide whether you need only equipment, a scheduled class or an appointment with a trainer. <a href="/gyms/elite-gym-fitness/">Elite Gym &amp; Fitness</a> publishes a THB 300 general-gym day pass and separates functional training from ordinary membership. A business window does not guarantee a staff member who can provide orientation at every hour. Ask for the staffed first-visit time, registration or ID requirements, changing and locker terms, class reservation and the complete amount.</p>

        <h2>Hotel facilities: confirm eligibility before comfort</h2>
        <p>A hotel amenity can look straightforward while remaining guest-only. Hard Rock publishes a specific outside-guest leisure-pool product, so eligibility and the base amount are documented. <a href="/gyms/movenpick-siam-pattaya/">Mövenpick Siam Na Jomtien</a> publishes a 24-hour fitness centre and seafront pool as hotel facilities but no non-resident fitness pass. <a href="/gyms/fitz-club/">Fitz Club</a> is different again: Royal Cliff publishes outside-guest sports-club prices and names gym, pool, racquet and wet-area facilities. Always match the public-access rule to the intended facility; a room booking, pool pass and sports-club day pass are separate contracts.</p>

        <h2>Build a two-pin arrival and return plan</h2>
        <p>Save the exact venue entrance, then save the place you intend to return to. Check the scheduled finish rather than only the business closing time. If the venue is inside a hotel, mall, condotel or multi-building complex, ask which reception, floor or building handles the first visit. For evening sessions, arrange the return before class and keep the venue's current phone available. No fixed walking time, fare or transport service is inferred by this guide.</p>

        <p>Send one compact message: “I want the [named product] on [date]. I am [experience level]. Please confirm start and finish, coach or teacher language, contact level, equipment, staffed check-in, total price, payment, cancellation and exact entrance.” An operator may not answer every item, but the gaps become visible before money changes hands. Screenshot the reply or booking confirmation and recheck changes on the day.</p>

        <h2>A reversible first-visit sequence</h2>
        <ol>
          <li>Shortlist by the exact activity, not a broad claim about atmosphere.</li>
          <li>Open the enriched venue record and check the source date, status, product and unresolved items.</li>
          <li>Request the session, coach or teacher, contact level, complete cost and arrival point in writing.</li>
          <li>Book the smallest product that answers the main uncertainty: one class, one day or one private appointment.</li>
          <li>Extend only after the schedule, coaching, facilities and route work for you.</li>
        </ol>

        <p>This process does not remove ordinary personal judgement, and it cannot predict another person's conduct. It does stop the directory from substituting reviews, gender stereotypes or marketing language for verifiable access facts. For longer routines, use the <a href="/guides/pattaya-digital-nomad-fitness/">digital-nomad fitness guide</a> to compare membership length, staffed access and commute friction after the first visit has been tested.</p>
      </section>`,
    filter: g => [
      'smash-fitness-kickboxing',
      'battle-conquer-gym',
      'wko-muay-thai',
      'fairtex-pattaya',
      'yoga-pattaya-studio',
      'one-d-yoga-studio',
      'ashtanga-yoga-pattaya',
      'elite-gym-fitness',
      'hard-rock-pool',
      'fitz-club',
      'movenpick-siam-pattaya',
      'castra-gym'
    ].includes(g.id),
    rank: g => {
      const order = [
        'smash-fitness-kickboxing',
        'battle-conquer-gym',
        'wko-muay-thai',
        'fairtex-pattaya',
        'yoga-pattaya-studio',
        'one-d-yoga-studio',
        'ashtanga-yoga-pattaya',
        'elite-gym-fitness',
        'hard-rock-pool',
        'fitz-club',
        'movenpick-siam-pattaya',
        'castra-gym'
      ];
      return order.length - order.indexOf(g.id);
    },
    sections: [
      { label: 'Published classes and first-session evidence', take: 4 },
      { label: 'Yoga and staffed fitness contacts', take: 4 },
      { label: 'Hotel and multi-facility access to verify', take: 4 }
    ],
    faqs: [
      { q: 'Can this guide certify that a Pattaya gym is safe for every solo woman?', a: 'No. It compares published products, current identity, price evidence, staffed arrival and unresolved questions. Confirm the exact session and route, make a small first booking and use your own judgement.' },
      { q: 'How should I ask a Muay Thai gym about contact or sparring?', a: 'State your experience and the contact you will accept. Ask whether the chosen session includes partner drills, body contact, head contact or open sparring, and repeat the boundary to the coach before class.' },
      { q: 'Does a hotel gym or pool automatically accept non-residents?', a: 'No. Hard Rock publishes an outside-guest pool product and Fitz Club publishes outside-guest sports access, while many hotel fitness centres are presented only as guest amenities. Confirm eligibility for the exact facility.' }
    ]
  },
  {
    slug: 'best-gyms-near-walking-street-pattaya',
    title: 'Best Gyms Near Walking Street, Pattaya',
    h1: 'Best gyms within walking distance of Walking Street',
    desc: 'Pattaya gyms, Muay Thai camps, fitness clubs and pools within a 5-15 minute walk of Walking Street and South Pattaya — for tourists staying in the Beach Road / 2nd Road / Soi Buakhao corridor.',
    intro: 'Walking Street is the centre of gravity for most short-stay Pattaya tourists. If your hotel is on Beach Road, 2nd Road, Soi Buakhao or LK Metro, you have surprisingly good gym access without needing a baht-bus or motorbike taxi. This guide picks the closest options by category.',
    pickerKey: 'walking-street',
    filter: g => {
      const area = (g.area || '').toLowerCase();
      const addr = (g.address || '').toLowerCase();
      return /central pattaya|south pattaya|beach road|2nd road|second road|soi buakhao|lk metro|walking street|the avenue|pattaya klang|beach\b/.test(area + ' ' + addr);
    },
    rank: g => {
      const area = (g.area || '').toLowerCase();
      const addr = (g.address || '').toLowerCase();
      let s = 0;
      if (/walking street|beach road|2nd road|second road/.test(area + addr)) s += 14;
      if (/central pattaya|south pattaya/.test(area + addr)) s += 8;
      if (/the avenue|mike\'s mall|harbor pattaya/.test(area + addr)) s += 6;
      if (g.priceRange === '฿' || g.priceRange === '฿฿') s += 3;
      return s;
    },
    sections: [
      { label: '🚶 Closest walkable gyms', take: 5 },
      { label: '🥊 Closest Muay Thai camps', take: 3 },
      { label: '🏊 Closest pools & beaches', take: 3 },
      { label: '🎾 Closest racquet sports', take: 3 }
    ],
    faqs: [
      { q: 'What is the closest gym to Walking Street?', a: 'Tony\'s Gym on Soi Diana, Fitness 7 at The Avenue Pattaya, and Coco Fitness at Mike\'s Mall are all within 5-10 minutes\' walk of Walking Street north end. Jetts at Little Walk and Universe Gym are 10-15 minutes.' },
      { q: 'Can I walk from a Beach Road hotel to a Muay Thai camp?', a: 'Most authentic Muay Thai camps are 10-30 minutes by car/baht-bus from Beach Road. The closest walkable options are at hotel fitness centres (FITZ Club at Royal Cliff, Cape Dara) which run group Muay Thai-style cardio classes.' },
      { q: 'Are the gyms near Walking Street safe at night?', a: 'Yes — Walking Street area is heavily policed and well-lit at night. Most 24/7 gyms (Jetts, Fitness 7) are inside malls with security. Female travellers report no issues with late-night sessions.' }
    ]
  },
  {
    slug: 'bangkok-day-trip-sport-pattaya',
    title: 'Bangkok Muay Thai Stadium Trip from Pattaya',
    h1: 'Bangkok Muay Thai stadium trip from Pattaya',
    desc: 'Plan a Pattaya-to-Bangkok fight night using the current Lumpinee and Rajadamnern calendars, dated ticket evidence, location trade-offs and a realistic return plan.',
    intro: 'This guide covers two out-of-area Bangkok stadium records: Lumpinee on Ramintra Road and Rajadamnern on Ratchadamnoen Nok Road. Neither is a Pattaya venue, and neither should be treated as a casual add-on without checking the date, route and return plan.',
    pickerKey: 'bangkok-day-trip',
    filter: g => ['lumpinee-boxing-stadium', 'rajadamnern-stadium'].includes(g.id),
    rank: g => g.id === 'lumpinee-boxing-stadium' ? 2 : 1,
    sections: [
      { label: 'The two Bangkok stadium records', take: 2 }
    ],
    primerHtml: () => `
  <section class="about" aria-labelledby="bangkok-trip-decision" style="margin-top: 32px;">
    <h2 id="bangkok-trip-decision">If you only read one thing</h2>
    <p><strong>Choose the event date first, then the stadium, then the transport.</strong> Do not begin with a generic promise that Bangkok is a fixed number of hours from Pattaya. Road conditions vary, the two stadiums are in different parts of Bangkok, and a late finish changes the return problem. The current evidence is strongest for the stadium calendars and ticket bands; it does not support a guaranteed Pattaya transfer, a fixed taxi fare or a same-night public-transport connection.</p>
    <p>The ranked list is intentionally limited to <a href="/gyms/lumpinee-boxing-stadium/">Lumpinee Boxing Stadium</a> and <a href="/gyms/rajadamnern-stadium/">Rajadamnern Stadium</a>. Older versions of this guide pulled in regional golf, diving and other records merely because their descriptions mentioned Bangkok. Those records were not Bangkok day-trip sport venues and have been removed from this ranking.</p>

    <h2>Current calendar snapshot</h2>
    <p><strong>Lumpinee:</strong> the official stadium calendar checked on 26 July 2026 listed ONE Lumpinee / ONE Friday Fights on Friday evenings from 18:30 to 23:30 and Lumpinee Super Champ on Saturday evenings from 18:30 to 21:00, with Saturday gates at 17:30. Its next displayed examples were Friday 31 July and Saturday 1 August. The same calendar listed an additional KAT PRO event on Monday 27 July and a selected ONE Fight Night at 09:00 on Saturday 15 August. This shows why the date-specific calendar matters: Friday and Saturday are the standing pattern, but additional events and morning cards can appear.</p>
    <p><strong>Rajadamnern:</strong> the official ticket calendar checked on 26 July 2026 advertised live Muay Thai seven nights a week. The displayed programme used 17:00 gates for many traditional Wednesday, Thursday and Sunday cards and 18:00 gates for Monday, Tuesday, Friday and Saturday cards. Event names, bout counts and round formats differed by day. The operator's FAQ says the stadium ticket office opens daily at 15:00. Use the selected date in the live booking flow rather than treating those gate times as a permanent weekly guarantee.</p>

    <h2>How the venues differ</h2>
    <p>Lumpinee is at 6 Ramintra Road in Bang Khen. The operator describes the current site as being on Bangkok's outskirts in the direction of Don Mueang Airport and points visitors to the MRT Pink Line at Ram Inthra 3, with connections elsewhere in the Bangkok rail network. That location can make Lumpinee a poor match for a day otherwise planned around Bangkok's historic centre. It can make more sense when the fight card itself is the trip or when the wider route already uses the north or northeast side of Bangkok.</p>
    <p>Rajadamnern is at 8 Rajadamnern Nok Road in the old-city side of Bangkok. Its central location is the more natural fit for a daytime plan around nearby Bangkok districts, but the final stadium approach and the post-event journey still need their own route checks. “Central Bangkok” is not a transport guarantee, and the guide does not claim that either stadium is universally easier from Pattaya.</p>
    <p>The sporting formats also differ. Lumpinee's Friday ONE series can mix Muay Thai with kickboxing, MMA or submission grappling depending on the card, while Saturday Super Champ is presented as a Muay Thai event. Rajadamnern's live calendar distinguishes traditional cards from other branded event formats and varies the number and length of bouts. Read the actual card if a specific ruleset, fighter or traditional five-round format is the reason for travelling.</p>

    <h2>Ticket evidence checked 25–26 July 2026</h2>
    <p>Lumpinee published clear seating bands when checked. Friday ONE Lumpinee tickets were ฿1,000 for Category 3 grandstand, ฿2,500 for Category 2 upper grandstand, ฿3,500 for Category 1 lower grandstand and ฿5,000 ringside. Saturday Lumpinee Super Champ tickets were ฿1,000 grandstand, ฿1,500 club class and ฿2,000 ringside. The operator also displayed separate prices for selected monthly ONE Fight Night events. These are event-specific products; use the live event and seating chart before payment.</p>
    <p>Rajadamnern's current operator calendar sends each date to its own booking flow and says prices vary by seating tier and event. The official-ticket panel visible through the current Maps listing showed admission from ฿1,800 on 25 July 2026. That “from” amount is a dated starting point, not a promise that every event or seat remains available at ฿1,800. Rajadamnern lists several seating types, including ringside, club class and higher or unassigned tiers; availability changes by card.</p>
    <p>Compare the complete purchase, not only the smallest number. Check the exact date, event title, seat location, fees, ticket delivery method, refund or change terms and the name of the authorised seller reached from the operator's page. This directory does not endorse a reseller price merely because it is lower.</p>

    <h2>Build a transport plan that survives a late finish</h2>
    <p>Start with a live route check from the actual Pattaya pickup point to the actual stadium. A hotel in Jomtien, Central Pattaya or Naklua does not have the same road access. Add a buffer for the Bangkok approach, time to collect or validate tickets and the published gate opening. Do not plan arrival for the first bell.</p>
    <p>A private car or pre-arranged driver can simplify the final leg and the late return, but agree in writing on pickup point, waiting time, parking, tolls, overtime and what happens if the card finishes late. If travelling by intercity bus or minivan, identify the Bangkok terminal, the onward stadium route and the last workable return before buying the fight ticket. “Bus to Bangkok” is only the first leg; neither stadium sits at Pattaya's intercity arrival point.</p>
    <p>The Friday Lumpinee programme is especially important because the official finish is 23:30. Do not assume that Bangkok rail, a Pattaya-bound bus or an on-demand car will line up with that finish. A Bangkok overnight stay can be the more robust choice for a late card, a group with children, or anyone who does not want to negotiate a long road return after the event. For an overnight, choose accommodation by the stadium and next-morning route rather than by a generic “Bangkok centre” label.</p>

    <h2>Three workable trip shapes</h2>
    <p><strong>Fight-only round trip:</strong> depart Pattaya with enough buffer for the date-specific gate time, attend one card and use a pre-arranged return. This is the simplest plan to describe but only works when the driver and late-finish terms are confirmed.</p>
    <p><strong>Bangkok day plus Rajadamnern:</strong> travel to Bangkok earlier, keep the daytime programme in the same broad part of the city, store bags safely and enter at the selected gate time. Return only if a confirmed late option exists; otherwise stay overnight. Do not add multiple distant Bangkok attractions just because they appear close on a regional map.</p>
    <p><strong>Lumpinee plus overnight:</strong> treat the Ramintra stadium as the main destination, use the Pink Line or a road transfer for the last leg, and stay in Bangkok after a late Friday card. This avoids turning an 18:30–23:30 event into a rushed same-night connection. A shorter Saturday Super Champ schedule may make a same-day return easier, but it still needs a live route and booked transport.</p>

    <h2>Before paying</h2>
    <ul>
      <li>Confirm that the event appears on the stadium's exact current calendar for the chosen date.</li>
      <li>Check gate time, expected programme window, ruleset and card rather than relying on a generic weekday.</li>
      <li>Use the operator-linked ticket flow and verify the seating tier, fees and delivery method.</li>
      <li>Map the complete route from the Pattaya pickup point to the exact stadium entrance.</li>
      <li>Confirm the return or overnight plan before buying a non-changeable ticket.</li>
      <li>Allow for Bangkok traffic, ticket collection and security without promising a fixed journey time.</li>
      <li>Ask the venue about accessibility, child admission or seating needs when relevant.</li>
      <li>Recheck the calendar on the day of travel because cards and timings can change.</li>
    </ul>

    <h2>What this guide does not claim</h2>
    <p>It does not claim that most Pattaya hotels sell stadium packages, that a tourist minibus includes a ticket, that either trip always takes 1.5–2 hours, or that a fixed taxi amount applies. No current first-hand evidence supported those statements. It also does not rank unrelated Bangkok golf or sport attractions. The decision here is deliberately narrow: choose between two current Bangkok Muay Thai stadium records and make the date and return logistics work.</p>
  </section>`,
    faqs: [
      { q: 'How long should I allow from Pattaya to a Bangkok stadium?', a: 'There is no dependable fixed duration. Check a live route from the actual Pattaya pickup point to the exact stadium, then add time for Bangkok traffic, ticket collection and the published gate opening.' },
      { q: 'Should I choose Lumpinee or Rajadamnern?', a: 'Choose by date, event format and location. Lumpinee publishes Friday ONE and Saturday Super Champ patterns on Ramintra Road; Rajadamnern publishes a seven-night calendar on Ratchadamnoen Nok Road. Read the selected card before booking.' },
      { q: 'Can I return to Pattaya after the fight?', a: 'Only if the return is confirmed before purchase. Late cards, especially Lumpinee Friday events scheduled to 23:30, may not align with rail or Pattaya-bound buses. A pre-arranged driver or Bangkok overnight can be more robust.' }
    ]
  }

];

function buildGuidePage(guide, allGyms) {
  const url = `${SITE}/guides/${guide.slug}/`;
  const filtered = allGyms.filter(guide.filter);
  const sorted = filtered.slice().sort((a, b) => guide.rank(b) - guide.rank(a));
  const guideTitle = guideCopy(guide.title, sorted, allGyms);
  const guideDesc = guideCopy(guide.desc, sorted, allGyms);
  const guideIntro = guideCopy(guide.intro, sorted, allGyms);

  // Distribute across sections
  const sectionsHtml = [];
  let cursor = 0;
  for (const sec of guide.sections) {
    const slice = sorted.slice(cursor, cursor + sec.take);
    cursor += sec.take;
    if (!slice.length) continue;
    sectionsHtml.push(`
    <h2>${escHtml(sec.label)}</h2>
    <div class="cat-venue-grid">${slice.map(venueCard).join('')}</div>`);
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pattaya Gym Directory', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE}/guides/` },
      { '@type': 'ListItem', position: 3, name: guide.h1, item: url }
    ]
  };
  const itemListSchema = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: guide.h1, numberOfItems: sorted.length,
    itemListElement: sorted.slice(0, 30).map((g, i) => ({
      '@type': 'ListItem', position: i + 1,
      url: `${SITE}/gyms/${g.id}/`, name: g.name
    }))
  };
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.venue-h1', '.venue-lede', '.tldr', '#tldr-h']
    },
    headline: guide.h1,
    description: guideDesc,
    url: url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en',
    image: DEFAULT_OG_IMAGE,
    datePublished: '2026-01-01',
    dateModified: new Date().toISOString().slice(0, 10),
    author: { '@type': 'Organization', name: 'Pattaya Gym', url: `${SITE}/` },
    publisher: { '@type': 'Organization', name: 'Pattaya Gym', url: `${SITE}/`, logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE } }
  };

  // TL;DR — top 3 picks block
  const top3 = sorted.slice(0, 3);
  const tldrHtml = top3.length ? `
  <section class="tldr" aria-labelledby="tldr-h">
    <h2 id="tldr-h" class="tldr-title">Quick answer — top picks</h2>
    <ol class="tldr-list" style="list-style: decimal inside;">
      ${top3.map((g, i) => `<li><strong><a href="/gyms/${g.id}/" style="color:var(--accent);">${escHtml(g.name)}</a></strong> — ${escHtml((g.description || '').slice(0, 110))}${(g.description||'').length > 110 ? '…' : ''}</li>`).join('')}
    </ol>
    <p style="margin: 12px 0 0; font-size: 13px; color: var(--text-muted);">Full ranking and reasoning below. <a href="#full-list" style="color: var(--accent);">Skip to full list →</a></p>
  </section>` : '';

  // FAQ block
  const faqs = guide.faqs || [];
  const faqHtml = faqs.length ? `
  <section class="guide-faq" aria-labelledby="faq-h" style="margin-top: 48px;">
    <h2 id="faq-h" style="font-size: 1.4rem; margin-bottom: 18px;">Common questions</h2>
    ${faqs.map(f => `<details class="faq-item"><summary>${escHtml(f.q)}</summary><p>${escHtml(f.a)}</p></details>`).join('')}
  </section>` : '';
  const primerHtml = typeof guide.primerHtml === 'function' ? guide.primerHtml(sorted, allGyms) : '';
  const extraHtml = typeof guide.extraHtml === 'function' ? guide.extraHtml(sorted, allGyms) : '';

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    '@id': `${url}#speakable`,
    cssSelector: ['.venue-h1', '.venue-lede', '.tldr', '#tldr-h']
  };

  // FAQPage schema (only if we have FAQs)
  const faqSchema = faqs.length ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  })}</script>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead(guideTitle, guideDesc, url, undefined, 'article')}
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
<script type="application/ld+json">${JSON.stringify(speakableSchema)}</script>
${faqSchema}
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb">
    <a href="/">Directory</a>
    <span class="bc-sep">›</span>
    <a href="/guides/">Guides</a>
    <span class="bc-sep">›</span>
    <span>${escHtml(guide.h1)}</span>
  </div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Guide</span>
    <h1 class="venue-h1">${escHtml(guide.h1)}</h1>
    ${(() => {
      const parts = String(guideIntro).split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);
      if (parts.length <= 1) return `<p class="venue-lede">${escHtml(guideIntro)}</p>`;
      return parts.map((c, i) => `<p class="venue-lede"${i > 0 ? ' style="margin-top: 10px; font-size: 0.96rem;"' : ''}>${escHtml(c)}</p>`).join('');
    })()}
    <div class="venue-hero-meta">
      <span class="meta-chip meta-chip-accent">⭐ ${sorted.length} venues ranked</span>
      <span class="meta-chip" style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.04em;">// Updated ${new Date().toISOString().slice(0,10)}</span>
    </div>
  </div>
${tldrHtml}
${primerHtml}
  <div id="full-list"></div>
${autoLinkVenues(sectionsHtml.join(''), guide.slug, allGyms)}
${extraHtml}
${faqHtml}
${(() => {
    const related = GUIDES.filter(g => g.slug !== guide.slug).slice(0, 6);
    if (!related.length) return '';
    const picks = related.slice(0, 3);
    return `
  <section class="about" aria-labelledby="related-guides-h" style="margin-top: 48px;">
    <h2 id="related-guides-h" style="font-size: 1.4rem; margin-bottom: 16px;">Related Pattaya guides</h2>
    <div class="cat-venue-grid">
      ${picks.map(g => `
      <a href="/guides/${g.slug}/" class="cat-venue-card">
        <div class="cv-head"><h3>${escHtml(g.h1)}</h3></div>
        <p>${escHtml(g.desc)}</p>
        <span class="cv-cta">Read guide →</span>
      </a>`).join('')}
    </div>
    <p style="margin: 16px 0 0; font-size: 13px; color: var(--text-muted);"><a href="/guides/" style="color: var(--accent);">Browse all ${GUIDES.length} Pattaya guides →</a></p>
  </section>`;
})()}
  <div class="venue-cta-foot" style="margin-top:48px;">
    <h3>Want to compare these side-by-side?</h3>
    <p>Click "+ Add to compare" on any venue page. Then visit /compare/ to see them in a single table.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="/compare/">Open compare tool →</a>
      <a class="btn btn-secondary" href="/search/">Search venues</a>
    </div>
  </div>

</main>
${footer()}
<script src="${assetHref('/share.js')}" defer></script>
<script src="${assetHref('/favorites.js')}" defer></script>
<script src="${assetHref('/compare.js')}" defer></script>
</body>
</html>
`;
}

// ============== /guides/ index ==============
function buildGuidesIndex(allGyms) {
  const url = `${SITE}/guides/`;
  const cards = GUIDES.map(g => `
    <a href="/guides/${g.slug}/" class="cat-venue-card">
      <div class="cv-head"><h3>${escHtml(g.h1)}</h3></div>
      <p>${escHtml(g.desc)}</p>
      <span class="cv-cta">Read guide →</span>
    </a>`).join('');
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Pattaya Gym Guides',
    description: `Curated guides to Pattaya gyms, Muay Thai camps, dive operators and sport venues. ${GUIDES.length} guides built from a verified directory of ${allGyms.length} venues.`,
    url: url,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'Pattaya Gym', url: `${SITE}/` },
    hasPart: GUIDES.map(g => ({
      '@type': 'Article',
      headline: g.h1,
      url: `${SITE}/guides/${g.slug}/`,
      description: g.desc
    }))
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pattaya Gym Directory', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: url }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Pattaya Gym Guides — Best of Pattaya by Category', 'Curated guides to the best Pattaya gyms, Muay Thai camps, dive operators, water parks, and sport venues — by budget, level, family fit, and more.', url)}
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(collectionSchema)}</script>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">›</span> <span>Guides</span></div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Guides</span>
    <h1 class="venue-h1">Pattaya gym guides</h1>
    <p class="venue-lede">Curated picks across budget tiers, experience levels, family-friendliness, and 24-hour access. All guides are built from the same verified directory of ${allGyms.length} venues.</p>
  </div>

  <section class="tldr" aria-labelledby="pick-h">
    <h2 id="pick-h" class="tldr-title">Pick the right guide for you</h2>
    <ul class="tldr-list">
      <li><strong>Want the best Muay Thai?</strong> → <a href="/guides/best-muay-thai-pattaya/">Best Muay Thai gyms</a></li>
      <li><strong>Looking to dive?</strong> → <a href="/guides/best-dive-operators-pattaya/">Best dive operators</a></li>
      <li><strong>Hitting the links?</strong> → <a href="/guides/best-golf-courses-pattaya/">Best golf courses</a></li>
      <li><strong>On a tight budget?</strong> → <a href="/guides/cheapest-gyms-pattaya/">Cheapest gyms</a></li>
      <li><strong>Looking for luxury?</strong> → <a href="/guides/luxury-sports-clubs-pattaya/">Luxury sports clubs</a></li>
      <li><strong>Train at odd hours?</strong> → <a href="/guides/24-hour-gyms-pattaya/">24-hour gyms</a></li>
      <li><strong>Travelling with kids?</strong> → <a href="/guides/family-friendly-pattaya/">Family-friendly</a></li>
      <li><strong>Total beginner?</strong> → <a href="/guides/best-for-beginners-pattaya/">Best for beginners</a></li>
      <li><strong>Working remotely?</strong> → <a href="/guides/pattaya-digital-nomad-fitness/">Digital nomad fitness</a></li>
      <li><strong>Solo female traveller?</strong> → <a href="/guides/female-friendly-gyms-pattaya/">Female-friendly venues</a></li>
      <li><strong>Need kids covered?</strong> → <a href="/guides/pattaya-gyms-childcare-family-pools/">Childcare, kids sport and pools</a></li>
      <li><strong>Prefer lower impact?</strong> → <a href="/guides/pattaya-seniors-low-impact-sport/">Seniors 65+ sport guide</a></li>
      <li><strong>Need Thai phrases?</strong> → <a href="/guides/thai-gym-terms-pattaya/">Thai gym terms cheat sheet</a></li>
    </ul>
  </section>

  <h2 style="margin: 36px 0 18px; font-size: 1.4rem; font-weight: 800; color: var(--text);">All guides</h2>
  <div class="cat-venue-grid">${cards}</div>
</main>
${footer()}
</body>
</html>
`;
}

// ============== /methodology/ PAGE ==============
function buildMethodologyPage(allGyms, allCats) {
  const url = `${SITE}/methodology/`;
  const today = new Date().toISOString().slice(0, 10);
  const mdCount = venueMarkdownCount();
  const byCategory = countBy(allGyms, g => g.category);
  const activeCategoryCount = byCategory.length;
  const catRows = byCategory
    .map(([key, count]) => `<tr><td>${escHtml(categoryLabel(key, allCats))}</td><td>${count}</td></tr>`)
    .join('');
  const newest = allGyms.map(g => g.verified).filter(Boolean).sort().slice(-1)[0] || today;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Pattaya Gym research methodology',
    url,
    dateModified: today,
    mainEntity: {
      '@type': 'Thing',
      name: 'Pattaya Gym Directory editorial methodology',
      description: `How pattaya-gym.com researches, verifies and updates ${allGyms.length} Pattaya sport venues.`
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Research Methodology | Pattaya Gym', `How Pattaya Gym researches, verifies and updates ${allGyms.length} Pattaya gyms, Muay Thai camps, golf courses and sport venues.`, url)}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Research Methodology", "item": SITE + "/methodology/" }
    ]
  })}</script>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">›</span> <span>Methodology</span></div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Methodology</span>
    <h1 class="venue-h1">How we research and verify Pattaya sport venues</h1>
    <p class="venue-lede">This directory is built from venue-level research, public source checks and structured editorial review. The current build covers ${allGyms.length} venues across ${activeCategoryCount} active sport categories, with ${mdCount} Markdown source pages.</p>
    <div class="venue-hero-meta">
      <span class="meta-chip meta-chip-accent">${allGyms.length} venue records</span>
      <span class="meta-chip">${mdCount} source pages</span>
      <span class="meta-chip">Updated ${today}</span>
    </div>
  </div>

  <article class="venue-body">
    <h2>Source hierarchy</h2>
    <p>We prefer official venue sources first: the venue website, booking page, current social profile, published timetable, official Google Business Profile and first-party maps listing. Specialist bodies such as PADI, SSI, golf-course operators, hotel brands and sport federations are used where relevant.</p>
    <p>Third-party directories, travel sites and user reviews are supporting evidence only. They help identify stale opening hours, renamed venues and location changes, but they do not override the venue's own current information without a second source.</p>

    <h2>What gets verified</h2>
    <ul>
      <li><strong>Identity:</strong> venue name, sport category, location and whether the venue is still operating.</li>
      <li><strong>Visitor utility:</strong> address, maps link, phone, website or social profile, hours, likely price tier and practical access notes.</li>
      <li><strong>Editorial fit:</strong> what the venue is best for, who should avoid it, and which similar venues deserve comparison.</li>
      <li><strong>Freshness:</strong> every record carries a verified date; the newest verified date in this build is ${escHtml(newest)}.</li>
    </ul>

    <h2>Ranking policy</h2>
    <p>Guide rankings are editorial, not paid placement. They combine category fit, source confidence, practical value to visitors, uniqueness, location, operating hours, budget fit and beginner suitability. The same venue can rank differently in different guides because "best" depends on the visitor's goal.</p>

    <h2>Directory coverage by category</h2>
    <table>
      <thead><tr><th>Category</th><th>Venues</th></tr></thead>
      <tbody>${catRows}</tbody>
    </table>

    <h2>Corrections and transparency</h2>
    <p>Venue details in Pattaya change quickly. If you spot outdated hours, a closed business, a wrong phone number or a better source, send the correction to <a href="mailto:info@pattaya-gym.com?subject=Directory%20correction">info@pattaya-gym.com</a>. We prioritise corrections that include an official source URL or a current photo of posted hours.</p>
  </article>
</main>
${footer()}
</body>
</html>
`;
}

// ============== /pattaya-sport-stats/ PAGE ==============
function buildStatsPage(allGyms, allCats) {
  const url = `${SITE}/pattaya-sport-stats/`;
  const today = new Date().toISOString().slice(0, 10);
  const byCategory = countBy(allGyms, g => g.category);
  const byArea = countBy(allGyms, g => cleanText(g.area || 'Unknown area'));
  const byPrice = countBy(allGyms, g => g.priceRange || 'Unknown');
  const freeish = allGyms.filter(g => /free|public|beach|park|lake|running route|calisthenics/i.test(textForVenue(g)) && (g.priceRange === '฿' || /free|public/i.test(textForVenue(g))));
  const verifiedDates = allGyms.map(g => g.verified).filter(Boolean).sort();
  const newest = verifiedDates[verifiedDates.length - 1] || today;
  const oldest = verifiedDates[0] || today;
  const topCatRows = byCategory.map(([key, count]) => {
    const pct = Math.round((count / allGyms.length) * 100);
    return `<tr><td><a href="/category/${escHtml(key)}/">${escHtml(categoryLabel(key, allCats))}</a></td><td>${count}</td><td>${pct}%</td></tr>`;
  }).join('');
  const topAreaRows = byArea.slice(0, 12).map(([area, count]) => `<tr><td>${escHtml(area)}</td><td>${count}</td></tr>`).join('');
  const priceRows = byPrice.map(([price, count]) => `<tr><td>${escHtml(price)}</td><td>${count}</td></tr>`).join('');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Pattaya sport venue directory statistics',
    url,
    dateModified: today,
    spatialCoverage: { '@type': 'Place', name: 'Pattaya, Chonburi, Thailand' },
    variableMeasured: ['venue count', 'category count', 'area count', 'price tier count'],
    description: `Live build statistics from ${allGyms.length} Pattaya gym and sport venue records.`
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Pattaya Sport Tourism Stats | Pattaya Gym', `Live Pattaya sport tourism stats from ${allGyms.length} venues: top categories, areas, price tiers, free options and verification freshness.`, url)}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Pattaya Sport Stats", "item": SITE + "/pattaya-sport-stats/" }
    ]
  })}</script>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">›</span> <span>Pattaya sport stats</span></div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Stats</span>
    <h1 class="venue-h1">Pattaya sport tourism stats</h1>
    <p class="venue-lede">A live snapshot of the Pattaya sport directory: venue counts, category mix, area concentration, budget tiers and freshness signals generated directly from data.js.</p>
    <div class="venue-hero-meta">
      <span class="meta-chip meta-chip-accent">${allGyms.length} venues</span>
      <span class="meta-chip">${byCategory.length} active categories</span>
      <span class="meta-chip">${freeish.length} free or public options flagged</span>
      <span class="meta-chip">Updated ${today}</span>
    </div>
  </div>

  <section class="tldr" aria-labelledby="stats-h">
    <h2 id="stats-h" class="tldr-title">Quick numbers</h2>
    <ul class="tldr-list">
      <li><strong>${allGyms.length} total venues</strong> in the current public directory.</li>
      <li><strong>${byCategory[0][1]} ${escHtml(categoryLabel(byCategory[0][0], allCats)).toLowerCase()} venues</strong> make the largest category.</li>
      <li><strong>${byArea[0][1]} venues</strong> use ${escHtml(byArea[0][0])} as their primary area label.</li>
      <li><strong>${freeish.length} venues</strong> are flagged as free, public, beach, park or route-style options.</li>
      <li><strong>Verified date range:</strong> ${escHtml(oldest)} to ${escHtml(newest)}.</li>
    </ul>
  </section>

  <article class="venue-body">
    <h2>Venues by category</h2>
    <table>
      <thead><tr><th>Category</th><th>Venues</th><th>Share</th></tr></thead>
      <tbody>${topCatRows}</tbody>
    </table>

    <h2>Top area labels</h2>
    <table>
      <thead><tr><th>Area label</th><th>Venues</th></tr></thead>
      <tbody>${topAreaRows}</tbody>
    </table>

    <h2>Price tier distribution</h2>
    <table>
      <thead><tr><th>Price tier</th><th>Venues</th></tr></thead>
      <tbody>${priceRows}</tbody>
    </table>

    <h2>How to read these numbers</h2>
    <p>Counts reflect the editorial directory, not every informal sport activity in Chonburi. A golf course, hotel fitness club, dive operator, Muay Thai camp and public running route each count as one venue record when they have a dedicated page and enough source material to help visitors make a decision.</p>
    <p>Area labels are intentionally practical rather than municipal. Visitors search for places like Jomtien, Naklua, Pratamnak and East Pattaya, so the stats use those familiar labels even when official postal boundaries differ.</p>
  </article>
</main>
${footer()}
</body>
</html>
`;
}

// ============== /search/ PAGE ==============
function buildSearchPage(allGyms, allCats) {
  const url = `${SITE}/search/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Search Pattaya Gyms & Sport Venues', `Search ${allGyms.length}+ verified Pattaya gyms, Muay Thai camps, dive operators, golf courses, and sport venues by name, area, category, or feature.`, url)}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Search", "item": SITE + "/search/" }
    ]
  })}</script>
<style>
  .search-input-wrap { position: relative; max-width: 720px; margin: 0 auto 24px; }
  .search-input {
    width: 100%; padding: 18px 56px 18px 22px; border-radius: 14px;
    background: var(--card); border: 2px solid var(--border); color: var(--text);
    font-size: 17px; transition: border-color 0.2s;
  }
  .search-input:focus { outline: 0; border-color: var(--accent); }
  .search-icon { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); font-size: 22px; color: var(--text-muted); }
  .search-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 26px; max-width: 720px; margin-left: auto; margin-right: auto; }
  .sf-pill { padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 999px; background: var(--card); border: 1px solid var(--border); color: var(--text-dim); cursor: pointer; }
  .sf-pill.active { background: var(--accent); color: #000; border-color: var(--accent); }
  .search-stats { color: var(--text-muted); font-size: 13px; margin: 0 auto 14px; max-width: 720px; }
  #search-results { max-width: 720px; margin: 0 auto; }
  .sr-card { display: block; padding: 16px 20px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; text-decoration: none; margin-bottom: 10px; transition: border-color 0.15s; }
  .sr-card:hover { border-color: var(--accent); }
  .sr-card h3 { margin: 0 0 4px; font-size: 1.05rem; color: var(--text); font-weight: 700; }
  .sr-card .sr-meta { font-size: 12px; color: var(--text-muted); }
  .sr-card .sr-cat { display: inline-block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 700; }
  .sr-card p { margin: 6px 0 0; font-size: 13px; color: var(--text-dim); line-height: 1.5; }
  .sr-empty { text-align: center; color: var(--text-muted); padding: 40px 20px; }
  mark { background: rgba(255,184,0,0.3); color: var(--accent); padding: 0 2px; border-radius: 2px; }
</style>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">›</span> <span>Search</span></div>
  <div class="venue-hero" style="text-align: center; padding: 36px 28px;">
    <span class="venue-cat-pill">Search</span>
    <h1 class="venue-h1" style="margin-bottom:6px;">Find your gym</h1>
    <p class="venue-lede" style="margin: 0 auto 20px; max-width: 580px;">Search by venue name, neighborhood, sport, language, price tier, or feature. ${allGyms.length} verified venues.</p>
    <div class="search-input-wrap">
      <input type="search" class="search-input" id="q" aria-label="Search Pattaya venues" placeholder="Try: muay thai jomtien · cheap yoga · 24 hour gym · english pickleball" autofocus />
      <span class="search-icon">🔍</span>
    </div>
    <div class="search-filters" id="filters">
      <button class="sf-pill active" data-cat="all">All categories</button>
      ${allCats.map(c => `<button class="sf-pill" data-cat="${c.key}">${escHtml(c.label)}</button>`).join('')}
    </div>
    <p style="font-size: 12.5px; color: var(--text-muted); margin: 14px auto 0; max-width: 580px; line-height: 1.6;">
      Tip: combine a sport with an area ("yoga jomtien"), or with a feature ("24 hour", "english", "cheap", "family"). Multiple words narrow results.
    </p>
  </div>
    <h2 id="search-results-title" style="max-width:720px;margin:0 auto 12px;font-size:1.1rem;">Search results</h2>
  <div id="search-results"></div>
</main>
${footer()}
<script src="${assetHref('/data.js')}"></script>
<script>
(function() {
  var GYMS = window.GYMS || [];
  var CATS = window.CATEGORIES || [];
  var qInput = document.getElementById('q');
  var resultsEl = document.getElementById('search-results');
  var statsEl = document.getElementById('stats');
  var activeCat = 'all';

  function catLabel(k) { var c = CATS.find(function(x){return x.key===k;}); return c?c.label:k; }
  function escapeRe(s){ return s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'); }
  function highlight(text, q) {
    if (!q || !text) return text || '';
    var re = new RegExp('('+escapeRe(q)+')', 'gi');
    return String(text).replace(re, '<mark>$1</mark>');
  }
  function score(g, q) {
    if (!q) return 1;
    var ql = q.toLowerCase();
    var hay = (g.name+' '+g.area+' '+g.address+' '+(g.tags||[]).join(' ')+' '+g.description+' '+g.category+' '+g.hours+' '+g.priceRange).toLowerCase();
    if (!hay.includes(ql)) {
      // try splitting query
      var parts = ql.split(/\\s+/).filter(Boolean);
      if (!parts.every(function(p){return hay.includes(p);})) return 0;
      return 1;
    }
    if (g.name.toLowerCase().includes(ql)) return 5;
    if (g.area && g.area.toLowerCase().includes(ql)) return 4;
    if ((g.tags||[]).some(function(t){return t.toLowerCase().includes(ql);})) return 3;
    return 2;
  }

  function render() {
    var q = qInput.value.trim();
    var res = GYMS
      .filter(function(g){ return activeCat === 'all' || g.category === activeCat; })
      .map(function(g){ return {g:g, s:score(g, q)}; })
      .filter(function(x){ return x.s > 0; })
      .sort(function(a,b){ return b.s - a.s; });

    if (!res.length) {
      resultsEl.innerHTML = '<div class="sr-empty">No venues match. Try a broader search or browse by <a href="/" style="color:var(--accent);">category</a>.</div>';
      statsEl.textContent = q ? 'No results for "'+q+'"' : 'Type to search...';
      return;
    }

    statsEl.textContent = res.length + ' result' + (res.length===1?'':'s') + (q?' for "'+q+'"':'') + (activeCat==='all'?'':' in ' + catLabel(activeCat));
    resultsEl.innerHTML = res.map(function(x){
      var g = x.g;
      return '<a class="sr-card" href="/gyms/'+g.id+'/">' +
        '<div class="sr-cat">'+catLabel(g.category)+'</div>' +
        '<h3>'+highlight(g.name, q)+'</h3>' +
        '<div class="sr-meta">'+(g.area?'📍 '+highlight(g.area,q)+' · ':'')+(g.priceRange?'💰 '+g.priceRange+' · ':'')+(g.hours?'🕐 '+g.hours:'')+'</div>' +
        '<p>'+highlight(g.description||'', q)+'</p>' +
      '</a>';
    }).join('');
  }

  qInput.addEventListener('input', render);
  document.getElementById('filters').addEventListener('click', function(e){
    var b = e.target.closest('.sf-pill');
    if (!b) return;
    document.querySelectorAll('.sf-pill').forEach(function(x){x.classList.remove('active');});
    b.classList.add('active');
    activeCat = b.dataset.cat;
    render();
  });

  // Pre-populate from URL ?q=
  var urlQ = new URLSearchParams(location.search).get('q');
  if (urlQ) qInput.value = urlQ;
  render();
})();
</script>
</body>
</html>
`;
}

// ============== /add-your-gym/ SUBMISSION FORM ==============
function buildAddPage() {
  const url = `${SITE}/add-your-gym/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Add Your Gym to Pattaya Gym Directory', 'Own a gym, Muay Thai camp, dive operator, or sport venue in Pattaya? Submit your listing for free verification and inclusion in the directory.', url)}

<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Add Your Gym", "item": SITE + "/add-your-gym/" }
    ]
  })}</script>
<style>
  .form-card { max-width: 640px; margin: 0 auto; padding: 32px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; }
  .form-row { margin-bottom: 18px; }
  .form-row label { display: block; font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .form-row .hint { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
  .form-row input, .form-row textarea, .form-row select {
    width: 100%; padding: 12px 14px; border-radius: 10px;
    background: rgba(0,0,0,0.3); border: 1px solid var(--border);
    color: var(--text); font-size: 16px; font-family: inherit;
  }
  .form-row textarea { min-height: 100px; resize: vertical; }
  .form-row input:focus, .form-row textarea:focus, .form-row select:focus { outline: 0; border-color: var(--accent); }
  .form-submit { display: inline-flex; align-items: center; gap: 6px; padding: 14px 28px; background: var(--accent); color: #000; border: 0; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; }
  .form-submit:hover { background: #ffc933; }
</style>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">›</span> <span>Add your gym</span></div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Submit</span>
    <h1 class="venue-h1">Add your gym to the directory</h1>
    <p class="venue-lede">Free listing. We verify your venue against public sources, write a full deep-dive page, and add it to the directory — usually within 1-2 weeks. No payment required, no "featured" slots for sale.</p>
  </div>

  <section class="tldr" style="max-width: 640px; margin: 0 auto 24px;" aria-labelledby="why-h">
    <h2 id="why-h" class="tldr-title">What you get</h2>
    <ul class="tldr-list">
      <li><strong>A full deep-dive page</strong> on pattaya-gym.com — with your address, hours, prices, distinctions, and photos</li>
      <li><strong>Permanent backlink</strong> + listing in your category and area landing pages</li>
      <li><strong>Compare-tool inclusion</strong> — visitors can stack you next to competitors</li>
      <li><strong>Search visibility</strong> on the site's full-text search</li>
      <li><strong>Free verification refresh</strong> annually — keep your info current</li>
    </ul>
  </section>

  <section class="tldr" style="max-width: 640px; margin: 0 auto 24px;" aria-labelledby="how-h">
    <h2 id="how-h" class="tldr-title">How it works (3 steps)</h2>
    <ol class="tldr-list" style="list-style: decimal inside;">
      <li><strong>Submit the form below</strong> with your venue details</li>
      <li><strong>We verify</strong> against your website, social media, and TripAdvisor (1–2 weeks)</li>
      <li><strong>Page goes live</strong> — you get a link to share with members and customers</li>
    </ol>
  </section>

  <div class="channels"><a class="channel channel-email" href="mailto:info@pattaya-gym.com"><span class="channel-label">// EMAIL</span><span class="channel-addr">info@pattaya-gym.com</span><span class="channel-arrow">→</span></a><a class="channel channel-line" href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener"><span class="channel-label">// LINE</span><span class="channel-addr">@timpaemi</span><span class="channel-arrow">→</span></a></div>
  <p style="text-align: center; color: var(--text-muted); font-size: 13px; max-width: 540px; margin: 24px auto;">Form opens your email client. Or email <a href="mailto:info@pattaya-gym.com" style="color: var(--accent);">info@pattaya-gym.com</a> directly with the same details.</p>
</main>
${footer()}
</body>
</html>
`;
}

// Section J override: richer client-side search with persistent scroll and deeper filters.
function buildSearchPage(allGyms, allCats) {
  const url = `${SITE}/search/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Search Pattaya Gyms & Sport Venues', `Search ${allGyms.length}+ verified Pattaya gyms, Muay Thai camps, dive operators, golf courses, and sport venues by name, area, category, price, hours, or language.`, url)}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Search", "item": SITE + "/search/" }
    ]
  })}</script>
<style>
  .search-input-wrap { position: relative; max-width: 720px; margin: 0 auto 24px; }
  .search-input { width: 100%; padding: 18px 56px 18px 22px; border-radius: 14px; background: var(--card); border: 2px solid var(--border); color: var(--text); font-size: 17px; transition: border-color 0.2s, box-shadow 0.2s; }
  .search-input:focus { outline: 0; border-color: var(--accent); box-shadow: 0 0 0 4px rgba(255,184,0,0.12); }
  .search-icon { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); font-size: 22px; color: var(--text-muted); }
  .search-filters { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 auto 18px; max-width: 720px; }
  .sf-pill { min-height: 38px; padding: 7px 12px; font-size: 12px; font-weight: 700; border-radius: 999px; background: var(--card); border: 1px solid var(--border); color: var(--text-dim); cursor: pointer; }
  .sf-pill.active { background: var(--accent); color: #000; border-color: var(--accent); }
  .search-stats { color: var(--text-muted); font-size: 13px; margin: 0 auto 14px; max-width: 720px; }
  #search-results { max-width: 720px; margin: 0 auto; }
  .sr-card { display: block; padding: 16px 20px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; text-decoration: none; margin-bottom: 10px; transition: border-color 0.15s; }
  .sr-card:hover { border-color: var(--accent); }
  .sr-card h3 { margin: 0 0 4px; font-size: 1.05rem; color: var(--text); font-weight: 700; }
  .sr-card h3 a { color: inherit; text-decoration: none; }
  .sr-card .sr-meta { font-size: 12px; color: var(--text-muted); }
  .sr-card .sr-cat { display: inline-block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
  .sr-card p { margin: 6px 0 0; font-size: 13px; color: var(--text-dim); line-height: 1.5; }
  .sr-empty { text-align: center; color: var(--text-muted); padding: 40px 20px; }
  mark { background: rgba(255,184,0,0.3); color: var(--accent); padding: 0 2px; border-radius: 2px; }
</style>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">›</span> <span>Search</span></div>
  <div class="venue-hero" style="text-align: center; padding: 36px 28px;">
    <span class="venue-cat-pill">Search</span>
    <h1 class="venue-h1" style="margin-bottom:6px;">Find your gym</h1>
    <p class="venue-lede" style="margin: 0 auto 20px; max-width: 580px;">Search by venue name, neighbourhood, sport, language, price tier, open-now status, or feature. ${allGyms.length} verified venues.</p>
    <div class="search-input-wrap">
      <input type="search" class="search-input" id="q" aria-label="Search Pattaya venues" placeholder="Try: muay thai jomtien, cheap yoga, 24 hour gym, english pickleball" autofocus />
      <span class="search-icon" aria-hidden="true">&#128269;</span>
    </div>
    <div class="search-filters" id="filters">
      <button class="sf-pill active" data-cat="all">All categories</button>
      ${allCats.map(c => `<button class="sf-pill" data-cat="${c.key}">${escHtml(c.label)}</button>`).join('')}
    </div>
    <div class="search-filter-panel" aria-label="Search filters">
      <label for="area-filter">Area
        <select id="area-filter"><option value="all">All areas</option></select>
      </label>
      <label for="price-filter">Price
        <select id="price-filter">
          <option value="all">All prices</option>
          <option value="฿">฿ budget</option>
          <option value="฿฿">฿฿ mid-range</option>
          <option value="฿฿฿">฿฿฿ premium</option>
          <option value="฿฿฿฿">฿฿฿฿ luxury</option>
        </select>
      </label>
      <label for="language-filter">Language
        <select id="language-filter"><option value="all">Any language</option></select>
      </label>
      <label class="search-check" for="open-filter"><input id="open-filter" type="checkbox" /> <span>Open now</span></label>
    </div>
  </div>
    <h2 id="search-results-title" style="max-width:720px;margin:0 auto 12px;font-size:1.1rem;">Search results</h2>
  <div id="search-results"></div>
</main>
${footer()}
<script src="${assetHref('/data.js')}"></script>
<script src="${assetHref('/favorites.js')}"></script>
<script>
(function() {
  var GYMS = window.GYMS || [];
  var CATS = window.CATEGORIES || [];
  var qInput = document.getElementById('q');
  var resultsEl = document.getElementById('search-results');
  var statsEl = document.getElementById('stats');
  var areaFilter = document.getElementById('area-filter');
  var priceFilter = document.getElementById('price-filter');
  var languageFilter = document.getElementById('language-filter');
  var openFilter = document.getElementById('open-filter');
  var activeCat = 'all';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
  function catLabel(k) { var c = CATS.find(function(x){return x.key===k;}); return c?c.label:k; }
  function escapeRe(s){ return s.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\\\$&'); }
  function highlight(text, q) {
    if (!q || !text) return esc(text || '');
    var re = new RegExp('('+escapeRe(q)+')', 'gi');
    return esc(text).replace(re, '<mark>$1</mark>');
  }
  function venueText(g) {
    return [g.name, g.area, g.address, g.description, g.category, g.hours, g.priceRange, (g.tags || []).join(' '), (g.languages || []).join(' ')].join(' ').toLowerCase();
  }
  function languagesFor(g) {
    var explicit = Array.isArray(g.languages) ? g.languages.slice() : [];
    var text = venueText(g);
    ['English','Thai','Russian','French','German','Chinese','Japanese','Korean'].forEach(function (lang) {
      if (text.indexOf(lang.toLowerCase()) >= 0 && explicit.indexOf(lang) < 0) explicit.push(lang);
    });
    if (!explicit.length) explicit.push('English');
    return explicit;
  }
  function bangkokMinutes() {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var hour = Number(parts.find(function (p) { return p.type === 'hour'; }).value);
    var minute = Number(parts.find(function (p) { return p.type === 'minute'; }).value);
    return hour * 60 + minute;
  }
  function isOpenNow(g) {
    var h = String(g.hours || '').toLowerCase();
    if (!h) return false;
    if (/24\\s*\\/\\s*7|24 hours|always open|round the clock/.test(h)) return true;
    if (/closed|appointment|varies|seasonal|event|fight/.test(h)) return false;
    var match = h.match(/(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?\\s*[-–]\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?/i);
    if (!match) return /daily|open/i.test(h);
    function toMinutes(hour, minute, meridian) {
      var hh = Number(hour);
      var mm = Number(minute || 0);
      if (meridian) {
        meridian = meridian.toLowerCase();
        if (meridian === 'pm' && hh < 12) hh += 12;
        if (meridian === 'am' && hh === 12) hh = 0;
      }
      return hh * 60 + mm;
    }
    var start = toMinutes(match[1], match[2], match[3]);
    var end = toMinutes(match[4], match[5], match[6] || match[3]);
    var now = bangkokMinutes();
    return end < start ? (now >= start || now <= end) : (now >= start && now <= end);
  }
  function score(g, q) {
    if (!q) return 1;
    var ql = q.toLowerCase();
    var hay = venueText(g);
    if (!hay.includes(ql)) {
      var parts = ql.split(/\\s+/).filter(Boolean);
      if (!parts.every(function(p){return hay.includes(p);})) return 0;
      return 1;
    }
    if (String(g.name || '').toLowerCase().includes(ql)) return 5;
    if (g.area && g.area.toLowerCase().includes(ql)) return 4;
    if ((g.tags||[]).some(function(t){return t.toLowerCase().includes(ql);})) return 3;
    return 2;
  }
  function passFilters(g) {
    if (activeCat !== 'all' && g.category !== activeCat) return false;
    if (areaFilter.value !== 'all' && String(g.area || '') !== areaFilter.value) return false;
    if (priceFilter.value !== 'all' && String(g.priceRange || '') !== priceFilter.value) return false;
    if (languageFilter.value !== 'all' && languagesFor(g).indexOf(languageFilter.value) < 0) return false;
    if (openFilter.checked && !isOpenNow(g)) return false;
    return true;
  }
  function populateFilters() {
    var areas = {};
    var langs = {};
    GYMS.forEach(function (g) {
      if (g.area) areas[g.area] = true;
      languagesFor(g).forEach(function (lang) { langs[lang] = true; });
    });
    Object.keys(areas).sort().forEach(function (area) {
      var option = document.createElement('option');
      option.value = area;
      option.textContent = area;
      areaFilter.appendChild(option);
    });
    Object.keys(langs).sort().forEach(function (lang) {
      var option = document.createElement('option');
      option.value = lang;
      option.textContent = lang;
      languageFilter.appendChild(option);
    });
  }
  function render(preserveScroll) {
    var y = window.scrollY;
    var q = qInput.value.trim();
    var res = GYMS.filter(passFilters).map(function(g){ return {g:g, s:score(g, q)}; }).filter(function(x){ return x.s > 0; }).sort(function(a,b){ return b.s - a.s; });
    if (!res.length) {
      resultsEl.innerHTML = '<div class="sr-empty">No venues match. Try a broader search or browse by <a href="/" style="color:var(--accent);">category</a>.</div>';
      statsEl.textContent = q ? 'No results for "'+q+'"' : 'No venues match the selected filters';
      if (preserveScroll) requestAnimationFrame(function () { window.scrollTo(0, y); });
      return;
    }
    statsEl.textContent = res.length + ' result' + (res.length===1?'':'s') + (q?' for "'+q+'"':'') + (activeCat==='all'?'':' in ' + catLabel(activeCat));
    resultsEl.innerHTML = res.map(function(x){
      var g = x.g;
      return '<article class="sr-card">' +
        '<div class="card-head"><div class="sr-cat">'+esc(catLabel(g.category))+'</div>' +
        '<button class="favorite-btn card-favorite" data-pg-favorite-id="'+esc(g.id)+'" data-pg-favorite-name="'+esc(g.name)+'" data-pg-favorite-category="'+esc(g.category || '')+'" data-pg-favorite-area="'+esc(g.area || '')+'" data-pg-favorite-price="'+esc(g.priceRange || '')+'" aria-pressed="false" aria-label="Save to favorites"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button></div>' +
        \`<h3><a href="/gyms/\${encodeURIComponent(g.id)}/">\${highlight(g.name, q)}</a></h3>\` +
        '<div class="sr-meta">'+(g.area?'Area: '+highlight(g.area,q)+' - ':'')+(g.priceRange?'Price: '+esc(g.priceRange)+' - ':'')+(g.hours?'Hours: '+esc(g.hours):'')+'</div>' +
        '<p>'+highlight(g.description||'', q)+'</p>' +
      '</article>';
    }).join('');
    if (window.PG && PG.favorites) {
      PG.favorites.bindButtons(resultsEl);
      PG.favorites.refreshAllButtons();
      PG.favorites.renderWidget();
    }
    if (preserveScroll) requestAnimationFrame(function () { window.scrollTo(0, y); });
  }

  qInput.addEventListener('input', function () { render(false); });
  document.getElementById('filters').addEventListener('click', function(e){
    var b = e.target.closest('.sf-pill');
    if (!b) return;
    document.querySelectorAll('.sf-pill').forEach(function(x){x.classList.remove('active');});
    b.classList.add('active');
    activeCat = b.dataset.cat;
    render(true);
  });
  [areaFilter, priceFilter, languageFilter, openFilter].forEach(function (el) {
    el.addEventListener('change', function () { render(true); });
  });
  var urlQ = new URLSearchParams(location.search).get('q');
  if (urlQ) qInput.value = urlQ;
  populateFilters();
  render(false);
})();
</script>
</body>
</html>
`;
}

function buildContactPage() {
  const url = `${SITE}/contact/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Contact Pattaya Gym | Corrections and Partnerships', 'Contact Pattaya Gym to suggest venue edits, submit sports listings, share reader feedback, or ask about directory research and partnerships.', url)}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Contact", "item": SITE + "/contact/" }
    ]
  })}</script>
<link rel="stylesheet" href="${assetHref('/styles.css')}" />
<link rel="stylesheet" href="${assetHref('/venue.css')}" />
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">&gt;</span> <span>Contact</span></div>
  <section class="contact-panel" aria-labelledby="contact-title">
    <p class="newsletter-kicker">Contact the editor</p>
    <h1 id="contact-title">Send a correction, venue lead, or partnership note.</h1>
    <p>Email is the fastest route: <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a>. Venue owners can also use the structured <a href="/add-your-gym/">add-your-gym form</a>.</p>
    <div class="channels"><a class="channel channel-email" href="mailto:info@pattaya-gym.com"><span class="channel-label">// EMAIL</span><span class="channel-addr">info@pattaya-gym.com</span><span class="channel-arrow">→</span></a><a class="channel channel-line" href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener"><span class="channel-label">// LINE</span><span class="channel-addr">@timpaemi</span><span class="channel-arrow">→</span></a></div>
  </section>
</main>
${footer()}
</body>
</html>
`;
}

function buildPressPage(allGyms, allCats) {
  const url = `${SITE}/press/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Press | Pattaya Gym Directory', 'Press information for Pattaya Gym, including directory facts, editorial scope, media contact details, and future coverage notes.', url)}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Press", "item": SITE + "/press/" }
    ]
  })}</script>
<link rel="stylesheet" href="${assetHref('/styles.css')}" />
<link rel="stylesheet" href="${assetHref('/venue.css')}" />
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">&gt;</span> <span>Press</span></div>
  <section class="press-panel" aria-labelledby="press-title">
    <p class="newsletter-kicker">Press room</p>
    <h1 id="press-title">Pattaya Gym press notes</h1>
    <p>Pattaya Gym is an independent, English-language directory covering gyms, Muay Thai camps, golf courses, dive operators, sports clubs, hotel fitness venues, and sport tourism landmarks in Pattaya, Thailand.</p>
    <h2>Fast facts</h2>
    <ul class="tldr-list">
      <li>${allGyms.length} venue records across ${allCats.length} sport categories.</li>
      <li>Long-form venue pages are generated from source markdown plus structured venue data.</li>
      <li>Editorial policy: no paid placements, public-source research, visible last-updated dates.</li>
    </ul>
    <h2>Media mentions</h2>
    <p>No public media mentions have been logged yet. This page is ready to document coverage as it accumulates.</p>
    <h2>What journalists can cite</h2>
    <ul class="tldr-list">
      <li>Directory size, category counts, and area counts are generated from the current data.js venue records.</li>
      <li>Venue profiles combine structured data with long-form editorial notes from public sources.</li>
      <li>The site is English-only for now and focused on Pattaya, Jomtien, Naklua, Pratamnak, East Pattaya, Sattahip, and nearby day-trip sport venues.</li>
    </ul>
    <h2>Suggested attribution</h2>
    <p>When citing the directory, use "Pattaya Gym Directory, pattaya-gym.com" and link to the relevant guide, category, or venue page.</p>
    <h2>Corrections policy</h2>
    <p>Venue details change quickly in Pattaya. Send corrections with the source URL, venue name, and date checked; accepted updates are reflected on the relevant page with a visible last-updated or last-verified timestamp.</p>
    <h2>Media contact</h2>
    <p>Email <a href="mailto:info@pattaya-gym.com?subject=Press%20request%20for%20Pattaya%20Gym">info@pattaya-gym.com</a> for interview requests, corrections, or data questions.</p>
  </section>
</main>
${footer()}
</body>
</html>
`;
}

function buildFavoritesPage(allGyms) {
  const url = `${SITE}/favorites/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Saved Pattaya Gyms | Pattaya Gym Favorites', 'View the Pattaya gyms, Muay Thai camps, golf courses, dive operators, and sport venues you saved while browsing the directory.', url)}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Favorites", "item": SITE + "/favorites/" }
    ]
  })}</script>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">&gt;</span> <span>Favorites</span></div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Favorites</span>
    <h1 class="venue-h1">Your saved Pattaya venues</h1>
    <p class="venue-lede">Favorites are stored in this browser only. Use the heart buttons on cards and venue pages to build a shortlist before you compare, map, or plan your trip.</p>
    <div class="venue-actions">
      <a class="btn btn-primary" href="/search/">Find more venues</a>
      <a class="btn btn-secondary" href="/compare/">Open compare tool</a>
      <button class="btn btn-secondary" type="button" data-clear-favorites="true">Clear favorites</button>
    </div>
  </div>
  <p id="favorites-empty" class="sr-empty">No favorites saved yet. Start with <a href="/search/" style="color:var(--accent);">search</a> or browse the <a href="/" style="color:var(--accent);">homepage directory</a>.</p>
  <div class="cat-venue-grid" id="favorites-list"></div>
</main>
${footer()}
<script src="${assetHref('/data.js')}"></script>
<script src="${assetHref('/favorites.js')}"></script>
</body>
</html>
`;
}

function buildTripPlannerPage(allGyms, allCats) {
  const url = `${SITE}/plan-my-trip/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Plan My Pattaya Fitness Trip | Pattaya Gym', 'Build a simple Pattaya fitness itinerary from verified gyms, Muay Thai camps, pools, golf courses, dive operators, and family-friendly sport venues.', url)}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Plan My Trip", "item": SITE + "/plan-my-trip/" }
    ]
  })}</script>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">&gt;</span> <span>Plan my trip</span></div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Trip planner</span>
    <h1 class="venue-h1">Plan your Pattaya training trip</h1>
    <p class="venue-lede">Choose your stay length, training goal, budget, and preferred area. The planner returns 5-8 venues plus a simple daily rhythm you can adjust.</p>
  </div>
  <div class="tool-grid">
    <div class="channels"><a class="channel channel-email" href="mailto:info@pattaya-gym.com"><span class="channel-label">// EMAIL</span><span class="channel-addr">info@pattaya-gym.com</span><span class="channel-arrow">→</span></a><a class="channel channel-line" href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener"><span class="channel-label">// LINE</span><span class="channel-addr">@timpaemi</span><span class="channel-arrow">→</span></a></div>
    <section class="tool-results" aria-live="polite">
      <h2 style="margin-top:0;">Recommended venues</h2>
      <div class="tool-results-list" id="trip-results"></div>
      <h2>Daily rhythm</h2>
      <ol class="tldr-list" id="trip-schedule"></ol>
    </section>
  </div>
</main>
${footer()}
<script src="${assetHref('/data.js')}"></script>
<script src="${assetHref('/favorites.js')}"></script>
<script>
(function () {
  var GYMS = window.GYMS || [];
  var CATS = ${JSON.stringify(allCats)};
  var area = document.getElementById('trip-area');
  var form = document.getElementById('trip-form');
  var results = document.getElementById('trip-results');
  var schedule = document.getElementById('trip-schedule');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; }); }
  function catLabel(k) { var c = CATS.find(function(x){return x.key===k;}); return c?c.label:k; }
  function text(g) { return [g.name,g.category,g.area,g.description,(g.tags||[]).join(' ')].join(' ').toLowerCase(); }
  function populateAreas() {
    var seen = {};
    GYMS.forEach(function (g) { if (g.area) seen[g.area] = true; });
    Object.keys(seen).sort().forEach(function (a) {
      var o = document.createElement('option');
      o.value = a;
      o.textContent = a;
      area.appendChild(o);
    });
  }
  function goalScore(g, goal) {
    var t = text(g);
    if (goal === 'muay-thai') return g.category === 'muay-thai' ? 12 : (/boxing|mma|bjj|fight/.test(t) ? 5 : 0);
    if (goal === 'family') return /family|kids|youth|pool|water.?park|academy|child|junior/.test(t) || g.category === 'kids-youth' || g.category === 'swimming' ? 10 : 0;
    if (goal === 'low-impact') return /yoga|pilates|pool|swim|senior|low.?impact|walking|golf/.test(t) || ['yoga','swimming','golf'].indexOf(g.category) >= 0 ? 10 : 0;
    if (goal === 'watersports') return ['watersports','swimming'].indexOf(g.category) >= 0 ? 10 : 0;
    if (goal === 'golf') return g.category === 'golf' ? 10 : 0;
    return ['fitness','crossfit','yoga','swimming','muay-thai'].indexOf(g.category) >= 0 ? 8 : 1;
  }
  function render() {
    var days = Number(document.getElementById('trip-days').value || 7);
    var goal = document.getElementById('trip-goal').value;
    var budget = document.getElementById('trip-budget').value;
    var pickedArea = area.value;
    var picks = GYMS.map(function (g) {
      var s = goalScore(g, goal);
      if (budget !== 'all' && g.priceRange === budget) s += 4;
      if (pickedArea !== 'all' && g.area === pickedArea) s += 5;
      if (/beginner|english|day pass|drop.?in|family|open/.test(text(g))) s += 1;
      return { g:g, s:s };
    }).filter(function (x) { return x.s > 0; }).sort(function (a,b) { return b.s - a.s; }).slice(0, Math.min(8, Math.max(5, days)));
    results.innerHTML = picks.map(function (x) {
      var g = x.g;
      return \`<article class="tool-result-card"><h3><a href="/gyms/\${encodeURIComponent(g.id)}/">\${esc(g.name)}</a></h3><p>\${esc(catLabel(g.category))}\${g.area?' - '+esc(g.area):''}\${g.priceRange?' - '+esc(g.priceRange):''}</p><p>\${esc(g.description || '')}</p><button class="favorite-btn" data-pg-favorite-id="\${esc(g.id)}" data-pg-favorite-name="\${esc(g.name)}" data-pg-favorite-category="\${esc(g.category || '')}" data-pg-favorite-area="\${esc(g.area || '')}" data-pg-favorite-price="\${esc(g.priceRange || '')}" aria-pressed="false"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button></article>\`;
    }).join('');
    schedule.innerHTML = [
      'Morning: primary training session near your base area.',
      'Midday: recovery, pool, beach walk, or lunch close to the venue.',
      'Afternoon: lighter technique, mobility, golf range, or dive theory depending on the goal.',
      days >= 7 ? 'Every third day: use a lower-impact venue to manage heat, sleep and travel fatigue.' : 'Keep the final day flexible so you can repeat the venue that fits best.',
      'Evening: confirm the next day by phone or social media because Pattaya hours change quickly.'
    ].map(function (x) { return '<li>'+esc(x)+'</li>'; }).join('');
    if (window.PG && PG.favorites) { PG.favorites.bindButtons(results); PG.favorites.refreshAllButtons(); }
  }
  populateAreas();
  form.addEventListener('submit', function (event) { event.preventDefault(); render(); });
  form.addEventListener('change', render);
  render();
})();
</script>
</body>
</html>
`;
}

function buildCoachFinderPage(allGyms, allCats) {
  const url = `${SITE}/find-my-coach/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Find My Pattaya Coach | Muay Thai, MMA and Boxing', 'Use Pattaya Gym venue metadata to shortlist Muay Thai, MMA, BJJ, and boxing gyms by discipline, language, beginner fit, and female-friendly signals.', url)}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Find My Coach", "item": SITE + "/find-my-coach/" }
    ]
  })}</script>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">&gt;</span> <span>Find my coach</span></div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Combat sport finder</span>
    <h1 class="venue-h1">Find a Pattaya fight coach or camp</h1>
    <p class="venue-lede">This is a rule-based shortlist from venue metadata, not a live trainer roster. Confirm current coaches, language fit, and sparring expectations with the gym before booking.</p>
  </div>
  <div class="tool-grid">
    <div class="channels"><a class="channel channel-email" href="mailto:info@pattaya-gym.com"><span class="channel-label">// EMAIL</span><span class="channel-addr">info@pattaya-gym.com</span><span class="channel-arrow">→</span></a><a class="channel channel-line" href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener"><span class="channel-label">// LINE</span><span class="channel-addr">@timpaemi</span><span class="channel-arrow">→</span></a></div>
    <section class="tool-results" aria-live="polite">
      <h2 style="margin-top:0;">Best-fit camps and gyms</h2>
      <div class="tool-results-list" id="coach-results"></div>
    </section>
  </div>
</main>
${footer()}
<script src="${assetHref('/data.js')}"></script>
<script src="${assetHref('/favorites.js')}"></script>
<script>
(function () {
  var GYMS = window.GYMS || [];
  var CATS = ${JSON.stringify(allCats)};
  var form = document.getElementById('coach-form');
  var results = document.getElementById('coach-results');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; }); }
  function catLabel(k) { var c = CATS.find(function(x){return x.key===k;}); return c?c.label:k; }
  function text(g) { return [g.name,g.category,g.area,g.description,g.hours,(g.tags||[]).join(' '),(g.languages||[]).join(' ')].join(' ').toLowerCase(); }
  function render() {
    var discipline = document.getElementById('coach-discipline').value;
    var language = document.getElementById('coach-language').value;
    var style = document.getElementById('coach-style').value;
    var gender = document.getElementById('coach-gender').value;
    var picks = GYMS.map(function (g) {
      var t = text(g);
      var s = 0;
      if (discipline === g.category) s += 12;
      if (discipline === 'boxing' && /boxing/.test(t)) s += 8;
      if (discipline === 'mma' && /mma|mixed martial|fight|cage|grappling/.test(t)) s += 8;
      if (discipline === 'bjj' && /bjj|jiu.?jitsu|grappling|wrestling/.test(t)) s += 8;
      if (discipline === 'muay-thai' && /muay thai|thai boxing|camp/.test(t)) s += 8;
      if (language !== 'all' && t.indexOf(language) >= 0) s += 4;
      if (language === 'english' && !/russian|thai only/.test(t)) s += 1;
      if (style === 'beginner' && /beginner|intro|all levels|fitness|friendly/.test(t)) s += 5;
      if (style === 'fight' && /fighter|fight|sparring|stadium|champion|professional|one championship/.test(t)) s += 5;
      if (style === 'fitness' && /fitness|conditioning|weight loss|beginner|group class/.test(t)) s += 4;
      if (style === 'private' && /private|one.?to.?one|personal|pt/.test(t)) s += 4;
      if (gender === 'female' && /female|women|woman|safe|beginner|yoga|friendly/.test(t)) s += 3;
      return { g:g, s:s };
    }).filter(function (x) { return x.s > 0 && ['muay-thai','mma','bjj','boxing','fitness'].indexOf(x.g.category) >= 0; }).sort(function (a,b) { return b.s - a.s; }).slice(0, 8);
    if (!picks.length) {
      results.innerHTML = '<p class="sr-empty">No strong matches. Try a broader discipline or remove language constraints.</p>';
      return;
    }
    results.innerHTML = picks.map(function (x) {
      var g = x.g;
      return \`<article class="tool-result-card"><h3><a href="/gyms/\${encodeURIComponent(g.id)}/">\${esc(g.name)}</a></h3><p>\${esc(catLabel(g.category))}\${g.area?' - '+esc(g.area):''}\${g.priceRange?' - '+esc(g.priceRange):''}</p><p>\${esc(g.description || '')}</p><button class="favorite-btn" data-pg-favorite-id="\${esc(g.id)}" data-pg-favorite-name="\${esc(g.name)}" data-pg-favorite-category="\${esc(g.category || '')}" data-pg-favorite-area="\${esc(g.area || '')}" data-pg-favorite-price="\${esc(g.priceRange || '')}" aria-pressed="false"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button></article>\`;
    }).join('');
    if (window.PG && PG.favorites) { PG.favorites.bindButtons(results); PG.favorites.refreshAllButtons(); }
  }
  form.addEventListener('submit', function (event) { event.preventDefault(); render(); });
  form.addEventListener('change', render);
  render();
})();
</script>
</body>
</html>
`;
}

// ============== MAIN ==============

function buildAreaRss(area, allGyms) {
  const lower = (s) => String(s||'').toLowerCase();
  const matching = allGyms.filter(g => {
    const haystack = lower(g.area + ' ' + g.address);
    return area.keywords.some(k => haystack.indexOf(k) >= 0);
  });
  const sorted = matching.slice().sort((a, b) =>
    String(b.verified || '').localeCompare(String(a.verified || ''))
  ).slice(0, 30);
  const feedUrl = `${SITE}/feed/area/${area.slug}.xml`;
  const feedTitle = `Pattaya Gym Directory - ${area.name} venues`;
  const feedDesc = `Latest gyms, Muay Thai, dive, golf, and sport venues in ${area.name}, Pattaya.`;
  const latestVerified = sorted.map(g => g.verified).filter(Boolean).sort().reverse()[0] || LAST_BUILD_DATE;
  const items = sorted.map(g => {
    const url = `${SITE}/gyms/${g.id}/`;
    const pubDate = new Date((g.verified || latestVerified) + 'T00:00:00Z').toUTCString();
    const desc = (g.description || '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    return `  <item>
    <title>${escHtml(g.name || '')}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${desc}]]></description>
  </item>`;
  }).join('\n');
  const lastBuild = new Date(latestVerified + 'T00:00:00Z').toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escHtml(feedTitle)}</title>
  <link>${SITE}/area/${area.slug}/</link>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  <description>${escHtml(feedDesc)}</description>
  <language>en-us</language>
  <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
</channel>
</rss>
`;
}

function main() {
  const { GYMS, CATEGORIES } = loadGymsFromDataJs();
  const extraUrls = [];

  // 1. Area pages
  ensureDir(path.join(ROOT, 'area'));
  cleanupChildDirs(path.join(ROOT, 'area'), AREAS.map(a => a.slug), 'area output directory');
  AREAS.forEach(a => {
    const dir = path.join(ROOT, 'area', a.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), finalizeHtml(buildAreaPage(a, GYMS, CATEGORIES)));
    extraUrls.push(`/area/${a.slug}/`);
    console.log('  [AREA] /area/' + a.slug + '/');
  });

  // 2. Guides index + individual guides
  ensureDir(path.join(ROOT, 'guides'));
  cleanupChildDirs(path.join(ROOT, 'guides'), GUIDES.map(g => g.slug), 'guide output directory');
  fs.writeFileSync(path.join(ROOT, 'guides', 'index.html'), finalizeHtml(buildGuidesIndex(GYMS)));
  extraUrls.push('/guides/');
  console.log('  [GUIDES-IDX] /guides/');
  GUIDES.forEach(g => {
    const dir = path.join(ROOT, 'guides', g.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), finalizeHtml(buildGuidePage(g, GYMS)));
    extraUrls.push(`/guides/${g.slug}/`);
    console.log('  [GUIDE] /guides/' + g.slug + '/');
  });

  // 3. Search page
  if (!fs.existsSync(path.join(ROOT, 'search'))) fs.mkdirSync(path.join(ROOT, 'search'));
  fs.writeFileSync(path.join(ROOT, 'search', 'index.html'), finalizeHtml(buildSearchPage(GYMS, CATEGORIES)));
  extraUrls.push('/search/');
  console.log('  [SEARCH] /search/');

  // 4. Add-your-gym
  if (!fs.existsSync(path.join(ROOT, 'add-your-gym'))) fs.mkdirSync(path.join(ROOT, 'add-your-gym'));
  fs.writeFileSync(path.join(ROOT, 'add-your-gym', 'index.html'), finalizeHtml(buildAddPage()));
  extraUrls.push('/add-your-gym/');
  console.log('  [ADD] /add-your-gym/');

  // 5. Methodology page
  if (!fs.existsSync(path.join(ROOT, 'methodology'))) fs.mkdirSync(path.join(ROOT, 'methodology'));
  fs.writeFileSync(path.join(ROOT, 'methodology', 'index.html'), finalizeHtml(buildMethodologyPage(GYMS, CATEGORIES)));
  extraUrls.push('/methodology/');
  console.log('  [METHOD] /methodology/');

  // 6. Directory statistics page
  if (!fs.existsSync(path.join(ROOT, 'pattaya-sport-stats'))) fs.mkdirSync(path.join(ROOT, 'pattaya-sport-stats'));
  fs.writeFileSync(path.join(ROOT, 'pattaya-sport-stats', 'index.html'), finalizeHtml(buildStatsPage(GYMS, CATEGORIES)));
  extraUrls.push('/pattaya-sport-stats/');
  console.log('  [STATS] /pattaya-sport-stats/');

  // 7. Contact and press pages
  if (!fs.existsSync(path.join(ROOT, 'contact'))) fs.mkdirSync(path.join(ROOT, 'contact'));
  fs.writeFileSync(path.join(ROOT, 'contact', 'index.html'), finalizeHtml(buildContactPage()));
  extraUrls.push('/contact/');
  console.log('  [CONTACT] /contact/');

  if (!fs.existsSync(path.join(ROOT, 'press'))) fs.mkdirSync(path.join(ROOT, 'press'));
  fs.writeFileSync(path.join(ROOT, 'press', 'index.html'), finalizeHtml(buildPressPage(GYMS, CATEGORIES)));
  extraUrls.push('/press/');
  console.log('  [PRESS] /press/');

  // 8. Section J utility tools
  if (!fs.existsSync(path.join(ROOT, 'favorites'))) fs.mkdirSync(path.join(ROOT, 'favorites'));
  fs.writeFileSync(path.join(ROOT, 'favorites', 'index.html'), finalizeHtml(buildFavoritesPage(GYMS)));
  extraUrls.push('/favorites/');
  console.log('  [FAV] /favorites/');

  if (!fs.existsSync(path.join(ROOT, 'plan-my-trip'))) fs.mkdirSync(path.join(ROOT, 'plan-my-trip'));
  fs.writeFileSync(path.join(ROOT, 'plan-my-trip', 'index.html'), finalizeHtml(buildTripPlannerPage(GYMS, CATEGORIES)));
  extraUrls.push('/plan-my-trip/');
  console.log('  [TRIP] /plan-my-trip/');

  if (!fs.existsSync(path.join(ROOT, 'find-my-coach'))) fs.mkdirSync(path.join(ROOT, 'find-my-coach'));
  fs.writeFileSync(path.join(ROOT, 'find-my-coach', 'index.html'), finalizeHtml(buildCoachFinderPage(GYMS, CATEGORIES)));
  extraUrls.push('/find-my-coach/');
  console.log('  [COACH] /find-my-coach/');

  // 9. Update sitemap (dedup)
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = fs.readFileSync(sitemapPath, 'utf8');
    function urlPriority(u) {
      if (u === '/search/' || u === '/map/') return { p: '0.9', f: 'weekly' };
      if (u.startsWith('/area/')) return { p: '0.9', f: 'weekly' };
      if (u === '/guides/') return { p: '0.9', f: 'weekly' };
      if (u.startsWith('/guides/')) return { p: '0.8', f: 'weekly' };
      if (u === '/compare/' || u === '/favorites/' || u === '/find-my-coach/' || u === '/plan-my-trip/') return { p: '0.6', f: 'monthly' };
      if (u === '/about/' || u === '/methodology/' || u === '/contact/' || u === '/press/' || u === '/pattaya-sport-stats/' || u === '/add-your-gym/') return { p: '0.5', f: 'monthly' };
      return { p: '0.6', f: 'monthly' };
    }
    const urlsToAdd = extraUrls
      .filter(u => existing.indexOf('<loc>' + SITE + u + '</loc>') < 0)
      .map(u => {
        const meta = urlPriority(u);
        return `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>${meta.f}</changefreq><priority>${meta.p}</priority></url>`;
      })
      .join('\n');
    if (urlsToAdd) {
      const updated = existing.replace('</urlset>', urlsToAdd + '\n</urlset>');
      fs.writeFileSync(sitemapPath, updated);
      console.log('  [SMP] sitemap.xml updated (+' + extraUrls.length + ' urls)');
    }
  }

  // Per-area RSS feeds
  const feedAreaDir = path.join(ROOT, 'feed', 'area');
  if (!fs.existsSync(path.join(ROOT, 'feed'))) fs.mkdirSync(path.join(ROOT, 'feed'));
  if (!fs.existsSync(feedAreaDir)) fs.mkdirSync(feedAreaDir);
  AREAS.forEach(area => {
    fs.writeFileSync(path.join(feedAreaDir, `${area.slug}.xml`), buildAreaRss(area, GYMS));
    console.log('  [RSS-AREA] /feed/area/' + area.slug + '.xml');
  });

  console.log('\nDiscovery built: ' + AREAS.length + ' area pages + ' + GUIDES.length + ' guides + search + add form + methodology + stats + contact + press + Section J tools');
}

function buildSingleGuide(slug) {
  const { GYMS } = loadGymsFromDataJs();
  const guide = GUIDES.find(g => g.slug === slug);
  if (!guide) throw new Error(`Unknown guide slug: ${slug}`);
  const dir = path.join(ROOT, 'guides', guide.slug);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), finalizeHtml(buildGuidePage(guide, GYMS)));
  console.log('  [GUIDE-ONLY] /guides/' + guide.slug + '/');
}

const guideOnlyArg = process.argv.find(arg => arg.startsWith('--guide-only='));
if (guideOnlyArg) {
  buildSingleGuide(guideOnlyArg.slice('--guide-only='.length));
} else {
  main();
}
