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

const ROOT = __dirname;
const SITE = 'https://pattaya-gym.com';
const ASSET_VERSION = '161';
const DEFAULT_OG_IMAGE = `${SITE}/og-image.png`;
const LAST_BUILD_DATE = new Date().toISOString().slice(0, 10);
const NEWSLETTER_ACTION = 'https://buttondown.com/api/emails/embed-subscribe/pattaya-gym';

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
  return `<script>
  (function () {
    function update() {
      var n = document.querySelector('.hero .nav');
      if (!n) return;
      if (document.documentElement.scrollTop > 30) n.classList.add('scrolled');
      else n.classList.remove('scrolled');
    }
    document.addEventListener('DOMContentLoaded', function () {
      document.addEventListener('scroll', update, { passive: true });
      update();
    });
  })();
  </script>
<a href="#main" class="skip-link">Skip to main content</a>
<header class="hero" style="min-height: auto;" role="banner">
  <nav class="nav" role="navigation" aria-label="Primary navigation">
    <a href="/" class="brand">
      <span class="brand-mark">P</span>
      <span class="brand-text">PATTAYA <strong>GYM</strong></span>
    </a>
    <ul class="nav-links">
      <li><a href="/#directory">Directory</a></li>
      <li><a href="/guides/">Guides</a></li>
      <li><a href="/map/">Map</a></li>
      <li><a href="/search/">Search</a></li>
      <li><a href="/compare/">Compare</a></li>
      <li><a href="/about/">About</a></li>
    </ul>
  </nav>
</header>`;
}

function newsletterFooterHtml() {
  return `<div class="footer-newsletter">
    <div class="newsletter-card">
      <div>
        <p class="newsletter-kicker">Stay current</p>
        <h2>Get Pattaya gym updates by email.</h2>
        <p>Fresh listings, corrected hours, and new guide notes from the directory.</p>
      </div>
      <form class="newsletter-form" action="${NEWSLETTER_ACTION}" method="post">
        <input type="hidden" name="embed" value="1" />
        <input type="hidden" name="tag" value="website-footer" />
        <div class="newsletter-field">
          <label for="footer-email">Email address *</label>
          <input id="footer-email" name="email" type="email" autocomplete="email" required aria-required="true" placeholder="you@example.com" />
        </div>
        <div class="newsletter-field">
          <label for="footer-first-name">First name <span aria-hidden="true">(optional)</span></label>
          <input id="footer-first-name" name="metadata__first-name" type="text" autocomplete="given-name" placeholder="Alex" />
        </div>
        <div>
          <p class="frequency-label" id="footer-frequency-label">Frequency</p>
          <div class="frequency-options" role="radiogroup" aria-labelledby="footer-frequency-label">
            <label><input type="radio" name="metadata__frequency" value="weekly" checked /> Weekly</label>
            <label><input type="radio" name="metadata__frequency" value="monthly" /> Monthly</label>
            <label><input type="radio" name="metadata__frequency" value="major-updates" /> Major updates</label>
          </div>
        </div>
        <button class="btn btn-primary" type="submit">Subscribe</button>
      </form>
    </div>
  </div>`;
}

function footer() {
  return `<footer class="site-footer" role="contentinfo">
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
        <li><a href="/favorites/">Saved favorites</a></li>
        <li><a href="/map/">Interactive map</a></li>
        <li><a href="/compare/">Compare venues</a></li>
        <li><a href="/plan-my-trip/">Plan my trip</a></li>
        <li><a href="/find-my-coach/">Find my coach</a></li>
        <li><a href="/about/">About this site</a></li>
        <li><a href="/methodology/">Research methodology</a></li>
        <li><a href="/pattaya-sport-stats/">Sport tourism stats</a></li>
        <li><a href="/add-your-gym/">Add your gym</a></li>
        <li><a href="/contact/">Contact</a></li>
        <li><a href="/press/">Press</a></li>
      </ul>
    </div>
  </div>
  ${newsletterFooterHtml()}
  <div class="site-footer-base">
    <p>© ${new Date().getFullYear()} pattaya-gym.com — Every gym &amp; sport in Pattaya, Thailand.</p>
    <p class="sf-disclaimer">Last updated: ${LAST_BUILD_DATE}. Independent directory. No paid placements. Listings researched and source-cited from public information.</p>
          <p class="sf-builtby">Designed, built &amp; maintained by <a href="https://pattaya-authority.com/" target="_blank" rel="noopener author" class="sf-builtby-link" title="Pattaya Authority — Premium Web Design &amp; SEO Studio">Pattaya Authority<span class="sf-builtby-arrow" aria-hidden="true">&#x2197;</span></a> <span class="sf-builtby-sep">·</span> Premium Web Design &amp; SEO Studio</p>
  </div>
</footer>`;
}

function pageFeedbackHtml(urlPath, title) {
  const safeTitle = title || 'Pattaya Gym page';
  const goodSubject = encodeURIComponent(`Helpful page: ${safeTitle}`);
  const badSubject = encodeURIComponent(`Needs work: ${safeTitle}`);
  const body = encodeURIComponent(`Page: ${SITE}${urlPath || '/'}\nWhat helped or what should change?\n`);
  return `<section class="page-feedback" aria-labelledby="page-feedback-title">
    <div class="page-feedback-card">
      <div>
        <p class="feedback-kicker">Editorial feedback</p>
        <h2 id="page-feedback-title">Did this page help?</h2>
        <p>Send a one-click note so we know which guides need more research.</p>
      </div>
      <div class="feedback-actions">
        <a class="btn" href="mailto:hello@pattaya-gym.com?subject=${goodSubject}&body=${body}">Helpful</a>
        <a class="btn" href="mailto:hello@pattaya-gym.com?subject=${badSubject}&body=${body}">Needs work</a>
      </div>
    </div>
  </section>`;
}

function commonHead(title, desc, canonical, schemaType) {
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
<meta name="theme-color" content="#0b0b0d" />
<meta name="apple-mobile-web-app-title" content="Pattaya Gym" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icon-180.png" />
<title>${escHtml(metaTitle(title))}</title>
<meta name="description" content="${escHtml(metaDesc(desc))}" />
<link rel="canonical" href="${canonical}" />
<link rel="alternate" hreflang="en" href="${canonical}" />
<link rel="alternate" hreflang="x-default" href="${canonical}" />
<link rel="alternate" type="application/rss+xml" title="Pattaya Gym — Recently Added" href="/feed.xml" />
<meta http-equiv="x-dns-prefetch-control" content="on" />
<link rel="dns-prefetch" href="//maps.google.com" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escHtml(metaTitle(title))}" />
<meta property="og:description" content="${escHtml(metaDesc(desc))}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />
${stylesheetTags(true)}
<script type="application/ld+json">${baselineSchema}</script>
<script defer data-domain="pattaya-gym.com" src="https://plausible.io/js/script.js"></script>
<script src="${assetHref('/shortcuts.js')}" defer></script>
${serviceWorkerRegistration()}
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23000'/%3E%3Ctext x='50' y='62' font-size='52' text-anchor='middle' fill='%23ffb800' font-family='sans-serif' font-weight='900'%3EP%3C/text%3E%3C/svg%3E" />`;
}

function venueCard(g) {
  const tags = (g.tags || []).slice(0, 3).map(t => `<span class="cv-pill cv-pill-tag">${escHtml(t)}</span>`).join('');
  return `<article class="cat-venue-card">
    <div class="cv-head">
      <h3><a href="/gyms/${escHtml(g.id)}/">${escHtml(g.name)}</a></h3>
      <button class="favorite-btn" data-pg-favorite-id="${escHtml(g.id)}" data-pg-favorite-name="${escHtml(g.name)}" data-pg-favorite-category="${escHtml(g.category || '')}" data-pg-favorite-area="${escHtml(g.area || '')}" data-pg-favorite-price="${escHtml(g.priceRange || '')}" aria-pressed="false" aria-label="Save to favorites"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button>
    </div>
    ${g.area ? `<div class="cv-meta">📍 ${escHtml(g.area)}</div>` : ''}
    ${g.hours ? `<div class="cv-meta">🕐 ${escHtml(g.hours)}</div>` : ''}
    <p>${escHtml(g.description || '')}</p>
    <div class="cv-tags">
      ${g.priceRange ? `<span class="cv-pill">💰 ${escHtml(g.priceRange)}</span>` : ''}
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
  return clipAtWord(s, 60);
}

function metaDesc(s) {
  return clipAtWord(s, 158);
}

function criticalCss() {
  return `<style>:root{color-scheme:dark;--bg:#0b0b0d;--card:#151518;--text:#f5f5f5;--text-dim:#d0d0d0;--text-muted:#9b9b9b;--accent:#ffb800;--border:rgba(255,255,255,.12)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,sans-serif;line-height:1.6}a{color:inherit}.hero{position:relative;overflow:hidden}.nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 32px;max-width:1200px;margin:0 auto;width:100%;background:rgba(11,11,13,.92);backdrop-filter:blur(12px);border-bottom:1px solid transparent}.brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none;font-weight:900}.brand-mark{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:10px;background:var(--accent);color:#000}.brand-mark.small{width:28px;height:28px;border-radius:8px}.nav-links{display:flex;gap:16px;list-style:none;margin:0;padding:0}.nav-links a{text-decoration:none;color:var(--text-dim);font-weight:700}.venue-page{max-width:880px;margin:0 auto;padding:24px 32px 100px}.venue-breadcrumb{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);margin-bottom:24px;padding:4px 0}.venue-hero{position:relative;padding:32px 32px 28px;margin:0 -8px 36px}.venue-hero-art{position:absolute;top:18px;right:18px;width:116px;height:116px;color:var(--accent);opacity:.22;pointer-events:none;z-index:0}.venue-hero-art .cat-art{width:100%;height:100%;display:block}.venue-hero>*:not(.venue-hero-art){position:relative;z-index:1}.venue-hero .venue-h1{padding-right:130px}.venue-h1{font-size:clamp(1.9rem,4.6vw,2.9rem);line-height:1.08;margin:10px 0 14px;font-weight:950}.venue-lede{color:var(--text-dim);font-size:1.05rem;max-width:760px}.venue-cat-pill,.meta-chip{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:999px;padding:6px 10px}.venue-cat-pill,.meta-chip-accent{color:#000;background:var(--accent);border-color:var(--accent);font-weight:800}.venue-hero-meta,.venue-meta-line,.venue-actions,.share-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.venue-hero-meta{margin-top:16px}.venue-meta-line{margin-bottom:14px}.share-bar{padding:14px 16px;margin:0 0 18px;background:var(--card);border:1px solid var(--border);border-radius:12px}.share-btn{border:1px solid var(--border);padding:7px 13px;border-radius:8px}.cat-venue-grid,.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}.cat-venue-card,.card{display:block;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px;text-decoration:none}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:11px 16px;border-radius:10px;text-decoration:none;font-weight:800}.btn-primary{background:var(--accent);color:#000}.site-footer{border-top:1px solid var(--border);background:#080809}img{max-width:100%;height:auto}@media(max-width:720px){.nav{overflow-x:auto;padding:14px 16px}.nav-links{overflow-x:auto}.venue-page{padding:14px 16px 110px}.venue-hero{padding:20px 18px 18px;margin:0 0 28px}.venue-hero-art{width:78px;height:78px;top:12px;right:12px;opacity:.15}.venue-hero .venue-h1{padding-right:70px}.venue-h1{font-size:1.7rem}.share-bar{padding:10px 12px}.cat-venue-grid{grid-template-columns:1fr}}</style>`;
}

function desktopTocCriticalCss() {
  return `<style>.venue-content-shell{display:block}@media(min-width:1100px){.venue-page{max-width:1080px}.venue-content-shell.has-toc{display:grid;grid-template-columns:210px minmax(0,780px);gap:32px;align-items:start}.venue-content-shell.has-toc .jump-to{display:flex;position:sticky;top:96px;max-height:calc(100vh - 120px);overflow-y:auto;flex-direction:column;align-items:stretch;gap:6px;margin:0;padding:14px;border:1px solid var(--border);border-radius:12px;background:rgba(255,184,0,.04)}.venue-content-shell.has-toc .jump-to-label{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:800;color:var(--accent);margin:0 0 4px}.venue-content-shell.has-toc .jump-pill{display:flex;align-items:center;width:100%;justify-content:flex-start;border-radius:8px;padding:8px 10px;min-height:36px;color:var(--text-dim);background:var(--card);border:1px solid var(--border);text-decoration:none;font-size:13px;font-weight:600;line-height:1.25}.venue-content-shell.has-toc .venue-body{min-width:0}}@media(min-width:1320px){.venue-page{max-width:1140px}.venue-content-shell.has-toc{grid-template-columns:230px minmax(0,820px)}}</style>`;
}

function asyncStylesheet(file) {
  const href = assetHref(file);
  return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="${href}" /></noscript>`;
}

function accessibilityCriticalCss() {
  return `<style>.skip-link{position:absolute;left:16px;top:10px;z-index:1000;transform:translateY(-140%);background:var(--accent);color:#000;padding:10px 14px;border-radius:8px;font-weight:800}.skip-link:focus{transform:translateY(0)}:focus-visible{outline:2px solid var(--accent);outline-offset:3px}</style>`;
}

function trustCriticalCss() {
  return `<style>.contact-panel,.press-panel{max-width:1200px;margin:0 auto;padding:28px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(135deg,rgba(255,184,0,.09),rgba(255,255,255,.035))}.contact-panel h1,.press-panel h1{margin:0 0 10px;font-size:clamp(1.45rem,2.6vw,2rem);line-height:1.15}.newsletter-form{display:grid;gap:12px}.newsletter-field{display:grid;gap:6px}.newsletter-field label,.frequency-label{color:var(--text);font-size:13px;font-weight:800}.newsletter-field input,.newsletter-field select,.newsletter-field textarea{width:100%;min-height:44px;padding:11px 13px;border:1px solid var(--border);border-radius:10px;background:rgba(0,0,0,.24);color:var(--text);font:inherit}.site-footer{margin-top:80px;padding:50px 24px 28px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.25));border-top:1px solid var(--border)}.site-footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1fr;gap:36px}.sf-brand-col{padding-right:12px}.sf-brand{display:flex;align-items:center;gap:10px;margin-bottom:12px}.sf-tag{font-size:13px;line-height:1.55;color:var(--text-dim);margin:0;max-width:280px}.sf-heading{display:block;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:var(--accent);font-weight:800;margin:0 0 14px}.sf-col ul{list-style:none;padding:0;margin:0}.sf-col li{margin-bottom:8px}.sf-col a{display:inline-flex;align-items:center;min-height:44px;color:var(--text-dim);text-decoration:none;font-size:13.5px}.footer-newsletter{max-width:1200px;margin:36px auto 0;padding-top:28px;border-top:1px solid var(--border)}.newsletter-card{display:grid;grid-template-columns:minmax(0,.85fr) minmax(280px,1.15fr);gap:28px;padding:22px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(135deg,rgba(255,184,0,.09),rgba(255,255,255,.035))}.site-footer-base{max-width:1200px;margin:38px auto 0;padding-top:24px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:12.5px;color:var(--text-muted)}.site-footer-base p{margin:0}@media(max-width:980px){.site-footer-inner{grid-template-columns:1fr 1fr 1fr;gap:28px}.sf-brand-col{grid-column:1/-1;padding-right:0}}@media(max-width:760px){.contact-panel,.press-panel{padding:32px 18px}.newsletter-card{grid-template-columns:1fr}}@media(max-width:600px){.site-footer-inner{grid-template-columns:1fr 1fr;gap:24px}.site-footer{padding:36px 18px 22px}}</style>`;
}

function stylesheetTags(includeVenueCss = true) {
  return `${criticalCss()}
${desktopTocCriticalCss()}
${accessibilityCriticalCss()}
${trustCriticalCss()}
${asyncStylesheet('/styles.css')}
${includeVenueCss ? asyncStylesheet('/venue.css') : ''}`;
}

function serviceWorkerRegistration() {
  return `<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}</script>`;
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
${commonHead(title, desc, url)}
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
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
      <span class="meta-chip">📅 Updated ${new Date().toISOString().slice(0,10)}</span>
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
    <p>Browse by category, view the full map, or compare venues side-by-side.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="/map/">📍 Open the map</a>
      <a class="btn btn-secondary" href="/compare/">Side-by-side compare</a>
      <a class="btn btn-secondary" href="/">Browse all</a>
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
    desc: 'Premium-tier sports and fitness clubs in Pattaya — 5-star hotel-attached facilities, ITF-rated tennis, championship golf, and members-only luxury training environments.',
    intro: 'Pattaya is not just budget tourism — at the top tier, the city hosts genuinely world-class sports facilities. FITZ Club at Royal Cliff (triple-TripAdvisor Travelers\' Choice winner), Greta Sport Club\'s 6 covered ITF Plexipave tennis courts, championship Pete Dye and Jack Nicklaus golf, and Asia\'s largest polo + equestrian operation are all here.',
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
      { q: 'What is the most exclusive sports club in Pattaya?', a: 'FITZ Club at Royal Cliff Hotels is the headline luxury racquet/swim/fitness club — multi-award-winning. For golf, Siam Country Club Old Course and Phoenix Gold rank top-tier.' },
      { q: 'Which Pattaya hotels have the best 5-star fitness facilities?', a: 'Hilton Pattaya, Andaz Jomtien (Hyatt), Centara Grand Mirage, Cape Dara, Mövenpick Siam Na Jomtien, Royal Cliff (Fitz Club), and Dusit Thani all offer day-pass access to genuinely premium facilities.' },
      { q: 'Is there a luxury polo or equestrian club in Pattaya?', a: 'Thai Polo & Equestrian Club is the most prominent — internationally recognised, hosting tournaments. Horseshoe Point Resort is the second major equestrian destination.' },
    ]
  },
  {
    slug: '24-hour-gyms-pattaya',
    title: '24-Hour Gyms in Pattaya',
    h1: '24/7 gyms in Pattaya',
    desc: '24-hour gyms in Pattaya, Thailand — full list of facilities open round-the-clock for shift workers, jet-lagged travelers, and dedicated trainers.',
    intro: 'Pattaya\'s tropical climate and tourist economy make 24/7 gym access genuinely useful. Hot midday avoidance, jet-lag adjustment, late-evening training after dinner — these are all real reasons to want round-the-clock access.',
    pickerKey: '24h',
    filter: g => /24|all.?day|always/i.test(g.hours || ''),
    rank: g => {
      const h = (g.hours||'').toLowerCase();
      let s = /24\/7|24\s*hour|always.?open/i.test(h) ? 20 : 5;
      return s;
    },
    sections: [
      { label: '🌙 Always-Open Options', take: 10 }
    ],
    faqs: [
      { q: 'Which 24-hour gyms in Pattaya don\'t require membership?', a: 'Most 24/7 gyms are membership-based, but Anytime Fitness offers 1-day free trials and Jetts has no-contract month-to-month plans you can cancel anytime.' },
      { q: 'Can I drop in at 3am to a Pattaya gym?', a: 'Yes — Anytime Fitness Pattaya (key-fob), Jetts (key-card), and Fitness 7 (24-hour staffed) all allow access at any hour for members.' },
      { q: 'Do Pattaya hotels have 24-hour fitness centers?', a: 'Many 5-star hotels offer 24-hour fitness for guests — Hilton, Andaz, Mövenpick, and Centara Grand Mirage all run 24/7. Day-pass availability varies.' },
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
    desc: 'New to Muay Thai, scuba diving, golf, kitesurfing or yoga? These Pattaya venues are explicitly beginner-friendly with patient instruction, scaled difficulty, and welcoming culture.',
    intro: 'You don\'t need any prior experience to start most sports in Pattaya. These venues are explicitly beginner-friendly — they market to first-timers, offer entry-level packages, and have patient instructors who don\'t mind teaching basics.',
    pickerKey: 'beginners',
    filter: g => {
      const t = ((g.tags||[]).join(' ') + ' ' + (g.description||'')).toLowerCase();
      return /beginner|first.?time|intro|easy|patient|all.?level/.test(t);
    },
    rank: g => {
      const t = ((g.tags||[]).join(' ') + ' ' + (g.description||'')).toLowerCase();
      let s = 0;
      if (/beginner/.test(t)) s += 10;
      if (/first.?time|intro|easy|patient/.test(t)) s += 5;
      if (/all.?level/.test(t)) s += 4;
      return s;
    },
    sections: [
      { label: '🎓 Best for First-Timers', take: 12 }
    ],
    faqs: [
      { q: 'What sport is easiest to start in Pattaya?', a: 'Yoga, swimming, and running require no prior skill. For combat sports, most Muay Thai camps welcome total beginners. For watersports, scuba (open-water course in 3-4 days) and SUP are popular entry points.' },
      { q: 'Do I need equipment to start a sport in Pattaya?', a: 'Most venues provide all equipment for beginners — Muay Thai gloves and pads, dive gear, paddles for pickleball, racquets at hotel courts. Bring workout clothes and water.' },
      { q: 'Are Pattaya gyms beginner-friendly to women?', a: 'Many — Anytime Fitness, hotel gyms (Hilton, Andaz, Mövenpick), boutique yoga studios, and Fitz Club all rank well on female-friendly safety and comfort. The big bro-coded iron gyms are the exception, not the rule.' },
    ]  },
  {
    slug: 'best-dive-operators-pattaya',
    title: 'Best Dive Operators in Pattaya 2026',
    h1: 'Best dive operators in Pattaya',
    desc: 'Hand-picked best PADI and SSI dive shops in Pattaya for 2026 — from Five-Star IDC centres to British family-run schools and dedicated technical-diving operations.',
    intro: 'Pattaya hosts more than 10 active dive operators serving the islands of Koh Larn, Koh Sak, Koh Krok and HTMS Khram wreck. This guide ranks the best by certification level, instructor depth, fleet quality, and reputation. Whether you want your Open Water cert in 4 days or a Tec Trimix course, there\'s an operator here that fits.',
    pickerKey: 'dive',
    filter: g => g.category === 'watersports' && /dive|scuba|padi|ssi|divers|aquanauts|mermaid/i.test(((g.tags||[]).join(' ') + ' ' + (g.name||'') + ' ' + (g.description||''))),
    rank: g => {
      const text = ((g.tags||[]).join(' ') + ' ' + (g.description||'')).toLowerCase();
      let s = 0;
      if (/5.?star|five.?star|idc/.test(text)) s += 15;
      if (/padi/.test(text)) s += 8;
      if (/ssi/.test(text)) s += 6;
      if (/family|british|established/.test(text)) s += 4;
      if (/technical|tec|trimix/.test(text)) s += 5;
      if (g.priceRange === '฿฿฿') s += 2;
      return s;
    },
    sections: [
      { label: '⭐ PADI 5-Star IDC Centres', take: 2 },
      { label: '🌊 Family-Run & Established Schools', take: 4 },
      { label: '🏝 Other Verified Operators', take: 6 }
    ],
    faqs: [
      { q: 'How much does Open Water dive certification cost in Pattaya?', a: 'PADI Open Water typically ฿11,000–฿16,000 over 3–4 days. SSI similar. Includes manual, gear, boat trips, and pool/confined-water sessions.' },
      { q: 'Where do Pattaya dive boats go?', a: 'Coral Island (Koh Larn), Koh Sak, Koh Krok, Koh Khrok for shallow reefs. HTMS Khram (artificial reef wreck, ~30m) for advanced divers. Most operators run half-day or full-day boats with 2–3 dives.' },
      { q: 'Are Pattaya dive sites good for beginners?', a: 'Yes — most reef dives are 8–18m with calm, clear water year-round. Visibility peaks Nov–Apr (15–25m). Gulf of Thailand currents are mild compared to Andaman Sea destinations.' }
    ]
  },
  {
    slug: 'best-golf-courses-pattaya',
    title: 'Best Golf Courses in Pattaya 2026',
    h1: 'Best golf courses near Pattaya',
    desc: 'Hand-picked best Pattaya / Eastern Seaboard golf courses for 2026 — from championship Pete Dye and Jack Nicklaus designs to value-tier 27-hole layouts and resort options with Buddha mountain views.',
    intro: 'The Pattaya / Eastern Seaboard is one of Asia\'s densest premium-golf clusters with {count} verified courses including championship Pete Dye, Jack Nicklaus and Peter Thomson designs. Most are within 30–50 minutes of central Pattaya. This guide ranks the best by architecture, conditioning, hosting history, and overall experience.',
    pickerKey: 'golf-best',
    filter: g => g.category === 'golf',
    rank: g => {
      const text = (g.description || '').toLowerCase() + ' ' + ((g.tags||[]).join(' ').toLowerCase());
      let s = 0;
      if (/championship|tour|tournament|host/.test(text)) s += 12;
      if (/pete dye|nicklaus|thomson|fream/.test(text)) s += 10;
      if (/27.?holes?|36.?holes?/.test(text)) s += 6;
      if (g.priceRange === '฿฿฿฿') s += 8;
      if (g.priceRange === '฿฿฿') s += 5;
      if (/old course|premier|premium/.test(text)) s += 6;
      return s;
    },
    sections: [
      { label: '🏆 Championship & Tournament-Grade', take: 4 },
      { label: '🌟 Top-Tier Premium', take: 4 },
      { label: '💚 Best Value & Hidden Gems', take: 4 },
      { label: '🌳 Other Verified Courses', take: 6 }
    ],
    faqs: [
      { q: 'What is the best golf course in Pattaya?', a: 'Siam Country Club Old Course is the headline championship layout. Phoenix Gold Golf, Burapha (36-hole, Thailand Open host), and Pattana Sports & Resort all rank top-tier. Best is subjective — fast greens, tight fairways, or scenic views all have strong contenders.' },
      { q: 'How much does golf in Pattaya cost?', a: 'Green fees ฿1,500–฿5,000 weekday, ฿2,500–฿7,500 weekend. Premium courses peak at ฿8,000+. Plus caddie ฿500–฿800 (mandatory at most courses) and cart ฿800–฿1,500.' },
      { q: 'Are caddies required at Pattaya golf courses?', a: 'Yes at virtually all courses — Thai golf tradition. Caddies typically expect ฿500–฿800 base plus tips. Most are excellent with course knowledge and pace; many speak basic English.' },
      { q: 'When is the best time to golf in Pattaya?', a: 'Cool dry season Nov–Feb is peak — book tee times 2–4 weeks ahead, especially weekends. Hot season Mar–May has cheaper rates and quieter courses. Rainy season Jun–Oct sees afternoon storms but morning play is fine.' }
    ]
  },
  {
    slug: 'pattaya-digital-nomad-fitness',
    title: 'Pattaya Digital Nomad Fitness Guide | Pattaya Gym',
    h1: 'Pattaya fitness for digital nomads',
    desc: 'Flexible Pattaya gyms, yoga studios, runs, pools and Muay Thai camps for remote workers who need short memberships, late hours and easy routines.',
    intro: 'Remote workers need frictionless training more than perfect programming. This guide favours venues with 24-hour access, no-contract plans, central or Jomtien locations, English-friendly staff, and routines that fit around calls.',
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
    faqs: [
      { q: 'What is the best Pattaya gym setup for a digital nomad?', a: 'Use a no-contract chain or 24-hour gym for lifting, then add one low-friction recovery option such as yoga, swimming, beach running or Muay Thai once or twice a week.' },
      { q: 'Which Pattaya areas are easiest for remote-worker fitness routines?', a: 'Central Pattaya works best for late access and chain gyms. Jomtien works better for beach running, yoga and calmer long-stay routines.' },
      { q: 'Can I train without committing to a long membership?', a: 'Yes. Many Pattaya gyms offer day passes, weekly passes or no-contract memberships. Muay Thai camps also commonly accept drop-in classes.' }
    ],
    extraHtml: sorted => {
      const jetts = sorted.find(g => g.id === 'jetts-fitness-pattaya');
      const beach = sorted.find(g => /beach|jomtien/i.test(g.area || '') && g.category === 'clubs');
      return `<article class="venue-body guide-extra">
        <h2>Sample remote-worker weekly routine</h2>
        <ul>
          <li><strong>Monday and Thursday:</strong> lift at ${jetts ? `<a href="/gyms/${jetts.id}/">a no-contract Jetts branch</a>` : 'a no-contract chain gym'} before dinner, when air-conditioned gyms are quieter.</li>
          <li><strong>Tuesday:</strong> use a yoga or mobility class as a screen-break day rather than another maximal session.</li>
          <li><strong>Wednesday:</strong> train Muay Thai technique only; avoid hard sparring before late calls.</li>
          <li><strong>Weekend:</strong> use ${beach ? `<a href="/gyms/${beach.id}/">the beach-running option</a>` : 'Jomtien or Pattaya Beach'} for easy cardio, then keep one full rest day.</li>
        </ul>
      </article>`;
    }
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
    desc: 'Family-friendly Pattaya gyms, pools, kids academies and water parks for parents who need safe activities, swim time and child-friendly sport options.',
    intro: 'This guide is for parents who still want to train. It favours pools, kids academies, supervised sport programmes, hotel clubs and large family venues where children have a genuine activity instead of waiting beside the equipment.',
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
    faqs: [
      { q: 'Do Pattaya gyms offer childcare?', a: 'Dedicated childcare is uncommon, but family pools, kids academies and hotel clubs solve the same problem by giving children a supervised or structured activity while adults train nearby.' },
      { q: 'Which Pattaya venues are best for children who need to burn energy?', a: 'Water parks, football academies, swim schools, trampoline or adventure venues, and hotel pool clubs are usually better than conventional gyms.' },
      { q: 'Can parents train while kids take lessons?', a: 'Yes at multi-sport clubs, hotel clubs and some academies. Confirm supervision, pickup rules and lesson times directly before relying on it.' }
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
    faqs: [
      { q: 'What is the safest sport for seniors in Pattaya?', a: 'Swimming, walking routes, beginner yoga, golf practice and pickleball are usually the safest starting points because intensity can be scaled easily.' },
      { q: 'Are Pattaya gyms suitable for older beginners?', a: 'Some are. Choose air-conditioned commercial gyms, hotel clubs or coached studios rather than hardcore bodybuilding rooms if joint safety and supervision matter.' },
      { q: 'When should seniors train outdoors in Pattaya?', a: 'Early morning is best. Heat and humidity rise quickly after 9am, so carry water and avoid peak-afternoon outdoor sessions.' }
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
    desc: 'Pattaya gyms, Muay Thai camps, yoga studios, swimming pools and group classes with strong female-friendly signals — safety, women-only sessions, female trainers, and welcoming atmospheres.',
    intro: 'Solo female travelers training in Pattaya have plenty of welcoming options — but knowing which venues have proven track records with female travelers, women-only group classes, or female trainers takes some research. This guide pulls together the most consistently female-friendly Pattaya sport venues, organised by category.',
    pickerKey: 'solo-female',
    filter: g => {
      const tags = (g.tags || []).join(' ').toLowerCase();
      const desc = (g.description || '').toLowerCase();
      return /female|women|family|kids|yoga|swim|hotel|premium/.test(tags + ' ' + desc) || g.category === 'yoga' || g.category === 'swimming';
    },
    rank: g => {
      const desc = (g.description || '').toLowerCase();
      const tags = (g.tags || []).join(' ').toLowerCase();
      let s = 0;
      if (/female|women|female-friendly|girl/.test(desc + tags)) s += 12;
      if (g.category === 'yoga') s += 8;
      if (g.category === 'swimming') s += 5;
      if (/family|kids/.test(tags + desc)) s += 4;
      if (/hotel|5-star|premium|luxury/.test(tags + desc)) s += 3;
      if (/safe|welcoming|community/.test(desc)) s += 2;
      return s;
    },
    sections: [
      { label: '🌸 Top solo-female-friendly picks', take: 5 },
      { label: '🧘 Best yoga studios for women', take: 4 },
      { label: '🏊 Best pools & swimming', take: 3 },
      { label: '🥊 Female-friendly Muay Thai & combat', take: 3 }
    ],
    faqs: [
      { q: 'Is Pattaya safe for solo female travelers training in gyms?', a: 'Generally yes — hotel-attached gyms, established yoga studios, and family-owned camps are very welcoming. Stick to verified venues with Western reviews and trust your read of each space.' },
      { q: 'Which Pattaya Muay Thai gyms welcome women?', a: 'Sityodtong, Fairtex, Kombat Group, Rage Fight Academy, and Venum Training Camp all run women-friendly programs. Most camps now explicitly welcome female fighters and recreational students.' },
      { q: 'Are there women-only fitness sessions in Pattaya?', a: 'A handful of yoga studios run female-only or trauma-informed sessions. Hotel gyms (Hilton, Centara, Andaz) provide the most reliably comfortable mainstream gym environments.' }
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
    title: 'Bangkok Day-Trip Sport Venues from Pattaya',
    h1: 'Bangkok day-trip sport venues',
    desc: 'Iconic Bangkok sport destinations within day-trip range of Pattaya — Lumpinee Boxing Stadium, Rajadamnern Stadium, world-class courses and venues. Travel times, ticket info, and itinerary tips.',
    intro: 'Pattaya is 1.5-2 hours from Bangkok. For sport tourists wanting the bucket-list Thai experiences — fight night at Lumpinee or Rajadamnern, world-class Bangkok venues — a day trip is genuinely doable from a Pattaya base. This guide picks the best Bangkok sport day-trips with practical logistics.',
    pickerKey: 'bangkok-day-trip',
    filter: g => {
      const area = (g.area || '').toLowerCase();
      const desc = (g.description || '').toLowerCase();
      return /bangkok/.test(area + ' ' + desc);
    },
    rank: g => {
      const desc = (g.description || '').toLowerCase();
      const tags = (g.tags || []).join(' ').toLowerCase();
      let s = 0;
      if (/legendary|iconic|world.?class|first|original|championship/.test(desc + tags)) s += 12;
      if (/stadium|tournament|championship/.test(desc + tags)) s += 8;
      if (g.category === 'muay-thai') s += 5;
      return s;
    },
    sections: [
      { label: '🏟 Top Bangkok bucket-list sport venues', take: 4 },
      { label: '🥊 Bangkok stadium fight nights', take: 2 }
    ],
    faqs: [
      { q: 'How long does it take to drive from Pattaya to Bangkok stadiums?', a: 'Bangkok is 1.5-2 hours from Pattaya by car or bus depending on traffic. A day-trip with afternoon arrival, evening fight night, and post-fight bus back to Pattaya is realistic and popular.' },
      { q: 'Should I visit Lumpinee or Rajadamnern Stadium?', a: 'Both are essential. Rajadamnern (founded 1945) is the world\'s first Muay Thai stadium and runs fights every Mon-Sun. Lumpinee (Ramintra Road since 2014) is the modern flagship — Friday and Saturday cards. Many Pattaya visitors do both on different trips.' },
      { q: 'Can I combine a Bangkok stadium night with a Pattaya stay?', a: 'Yes — most Pattaya hotels can book the round-trip transfer + tickets package. Tourist mini-buses run Pattaya → Bangkok stadium → Pattaya same-day for ~฿1,500-2,500 inclusive of tickets.' }
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
  <section class="about" aria-labelledby="faq-h" style="margin-top: 48px;">
    <h2 id="faq-h" style="font-size: 1.4rem; margin-bottom: 18px;">Common questions</h2>
    ${faqs.map(f => `<details class="faq-item"><summary>${escHtml(f.q)}</summary><p>${escHtml(f.a)}</p></details>`).join('')}
  </section>` : '';
  const extraHtml = typeof guide.extraHtml === 'function' ? guide.extraHtml(sorted, allGyms) : '';

  // FAQPage schema (only if we have FAQs)
  const faqSchema = faqs.length ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  })}</script>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead(guideTitle, guideDesc, url)}
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
${faqSchema}
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
      <span class="meta-chip">📅 Updated ${new Date().toISOString().slice(0,10)}</span>
    </div>
  </div>
  ${tldrHtml}
  <div id="full-list"></div>
  ${sectionsHtml.join('')}
  ${extraHtml}
  ${faqHtml}
  <div class="venue-cta-foot" style="margin-top:48px;">
    <h3>Want to compare these side-by-side?</h3>
    <p>Click "+ Add to compare" on any venue page. Then visit /compare/ to see them in a single table.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="/compare/">Open compare tool →</a>
      <a class="btn btn-secondary" href="/map/">View on map</a>
    </div>
  </div>
  ${pageFeedbackHtml(`/guides/${guide.slug}/`, guide.h1)}
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Pattaya Gym Guides — Best of Pattaya by Category', 'Curated guides to the best Pattaya gyms, Muay Thai camps, dive operators, water parks, and sport venues — by budget, level, family fit, and more.', url)}
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
<script type="application/ld+json">${JSON.stringify(schema)}</script>
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
    <p>Venue details in Pattaya change quickly. If you spot outdated hours, a closed business, a wrong phone number or a better source, send the correction to <a href="mailto:hello@pattaya-gym.com?subject=Directory%20correction">hello@pattaya-gym.com</a>. We prioritise corrections that include an official source URL or a current photo of posted hours.</p>
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
<script type="application/ld+json">${JSON.stringify(schema)}</script>
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
  <p class="search-stats" id="stats"></p>
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

  <form class="form-card" action="mailto:hello@pattaya-gym.com" method="post" enctype="text/plain">
    <div class="form-row">
      <label for="name">Venue name *</label>
      <input id="name" name="name" type="text" required aria-required="true" placeholder="e.g. Tiger Muay Thai Pattaya" />
    </div>
    <div class="form-row">
      <label for="category">Category *</label>
      <select id="category" name="category" required aria-required="true">
        <option value="">Select…</option>
        <option>Muay Thai</option>
        <option>MMA</option>
        <option>BJJ / Grappling</option>
        <option>Boxing</option>
        <option>CrossFit / Functional</option>
        <option>Fitness / Gym</option>
        <option>Yoga / Pilates</option>
        <option>Golf</option>
        <option>Tennis / Padel / Squash</option>
        <option>Swimming</option>
        <option>Watersports / Diving</option>
        <option>Climbing</option>
        <option>Running / Cycling Clubs</option>
        <option>Kids / Youth Sports</option>
        <option>Equestrian</option>
        <option>Adventure / Multi-Sport</option>
      </select>
    </div>
    <div class="form-row">
      <label for="address">Full address *</label>
      <input id="address" name="address" type="text" required aria-required="true" placeholder="123 Soi Buakhao, Pattaya, Chonburi 20150" />
    </div>
    <div class="form-row">
      <label for="website">Website</label>
      <input id="website" name="website" type="url" placeholder="https://..." />
    </div>
    <div class="form-row">
      <label for="phone">Phone</label>
      <input id="phone" name="phone" type="tel" placeholder="+66 ..." />
    </div>
    <div class="form-row">
      <label for="hours">Operating hours</label>
      <input id="hours" name="hours" type="text" placeholder="Mon-Fri 09:00-22:00, Sat-Sun 10:00-18:00" />
    </div>
    <div class="form-row">
      <label for="pricing">Pricing</label>
      <input id="pricing" name="pricing" type="text" placeholder="e.g. 400 baht drop-in, 4,000 baht/month" />
    </div>
    <div class="form-row">
      <label for="distinction">What makes your venue distinctive?</label>
      <span class="hint" id="distinction-hint">Awards, lineage, equipment, trainers, certifications — what would the directory page highlight?</span>
      <textarea id="distinction" name="distinction" aria-describedby="distinction-hint" placeholder="e.g. Only PADI 5-Star IDC dive shop in Pattaya"></textarea>
    </div>
    <div class="form-row">
      <label for="contact">Your name &amp; email *</label>
      <input id="contact" name="contact" type="text" required aria-required="true" placeholder="Tim · tim@gym.com" />
    </div>
    <button class="form-submit" type="submit">Send submission →</button>
  </form>
  <p style="text-align: center; color: var(--text-muted); font-size: 13px; max-width: 540px; margin: 24px auto;">Form opens your email client. Or email <a href="mailto:hello@pattaya-gym.com" style="color: var(--accent);">hello@pattaya-gym.com</a> directly with the same details.</p>
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
  <p class="search-stats" id="stats"></p>
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
        '<h3><a href="/gyms/'+encodeURIComponent(g.id)+'/">'+highlight(g.name, q)+'</a></h3>' +
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
<link rel="stylesheet" href="${assetHref('/styles.css')}" />
<link rel="stylesheet" href="${assetHref('/venue.css')}" />
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main">
  <div class="venue-breadcrumb"><a href="/">Directory</a> <span class="bc-sep">&gt;</span> <span>Contact</span></div>
  <section class="contact-panel" aria-labelledby="contact-title">
    <p class="newsletter-kicker">Contact the editor</p>
    <h1 id="contact-title">Send a correction, venue lead, or partnership note.</h1>
    <p>Email is the fastest route: <a href="mailto:hello@pattaya-gym.com">hello@pattaya-gym.com</a>. Venue owners can also use the structured <a href="/add-your-gym/">add-your-gym form</a>.</p>
    <form class="newsletter-form" action="mailto:hello@pattaya-gym.com" method="post" enctype="text/plain">
      <div class="newsletter-field">
        <label for="contact-name">Name *</label>
        <input id="contact-name" name="name" type="text" autocomplete="name" required aria-required="true" />
      </div>
      <div class="newsletter-field">
        <label for="contact-email">Email *</label>
        <input id="contact-email" name="email" type="email" autocomplete="email" required aria-required="true" />
      </div>
      <div class="newsletter-field">
        <label for="contact-topic">Topic</label>
        <select id="contact-topic" name="topic">
          <option>Venue correction</option>
          <option>New venue lead</option>
          <option>Reader feedback</option>
          <option>Press or partnership</option>
        </select>
      </div>
      <div class="newsletter-field">
        <label for="contact-message">Message *</label>
        <textarea id="contact-message" name="message" rows="6" required aria-required="true" placeholder="Include the page URL or venue name if this is a correction."></textarea>
      </div>
      <button class="btn btn-primary" type="submit">Open email draft</button>
    </form>
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
<link rel="stylesheet" href="${assetHref('/styles.css')}" />
<link rel="stylesheet" href="${assetHref('/venue.css')}" />
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
    <p>Email <a href="mailto:hello@pattaya-gym.com?subject=Press%20request%20for%20Pattaya%20Gym">hello@pattaya-gym.com</a> for interview requests, corrections, or data questions.</p>
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
      <button class="btn btn-secondary" type="button" onclick="PG.favorites && PG.favorites.clear()">Clear favorites</button>
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
    <form class="planner-card" id="trip-form">
      <label for="trip-days">Trip length
        <select id="trip-days">
          <option value="3">3 days</option>
          <option value="7" selected>1 week</option>
          <option value="14">2 weeks</option>
          <option value="30">1 month</option>
        </select>
      </label>
      <label for="trip-goal">Primary goal
        <select id="trip-goal">
          <option value="fitness">General fitness</option>
          <option value="muay-thai">Muay Thai training</option>
          <option value="family">Family-friendly sport</option>
          <option value="low-impact">Low-impact / seniors</option>
          <option value="watersports">Watersports and diving</option>
          <option value="golf">Golf-focused trip</option>
        </select>
      </label>
      <label for="trip-budget">Budget
        <select id="trip-budget">
          <option value="all">Any budget</option>
          <option value="฿">Budget</option>
          <option value="฿฿" selected>Mid-range</option>
          <option value="฿฿฿">Premium</option>
          <option value="฿฿฿฿">Luxury</option>
        </select>
      </label>
      <label for="trip-area">Area preference
        <select id="trip-area"><option value="all">Any area</option></select>
      </label>
      <button class="btn btn-primary" type="submit">Build itinerary</button>
    </form>
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
      return '<article class="tool-result-card"><h3><a href="/gyms/'+encodeURIComponent(g.id)+'/">'+esc(g.name)+'</a></h3><p>'+esc(catLabel(g.category))+(g.area?' - '+esc(g.area):'')+(g.priceRange?' - '+esc(g.priceRange):'')+'</p><p>'+esc(g.description || '')+'</p><button class="favorite-btn" data-pg-favorite-id="'+esc(g.id)+'" data-pg-favorite-name="'+esc(g.name)+'" data-pg-favorite-category="'+esc(g.category || '')+'" data-pg-favorite-area="'+esc(g.area || '')+'" data-pg-favorite-price="'+esc(g.priceRange || '')+'" aria-pressed="false"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button></article>';
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
    <form class="planner-card" id="coach-form">
      <label for="coach-discipline">Discipline
        <select id="coach-discipline">
          <option value="muay-thai">Muay Thai</option>
          <option value="boxing">Boxing</option>
          <option value="mma">MMA</option>
          <option value="bjj">BJJ / grappling</option>
        </select>
      </label>
      <label for="coach-language">Preferred language
        <select id="coach-language">
          <option value="all">Any language</option>
          <option value="english">English</option>
          <option value="thai">Thai</option>
          <option value="russian">Russian</option>
        </select>
      </label>
      <label for="coach-style">Training style
        <select id="coach-style">
          <option value="beginner">Beginner-friendly</option>
          <option value="fight">Fight preparation</option>
          <option value="fitness">Fitness and conditioning</option>
          <option value="private">Private coaching</option>
        </select>
      </label>
      <label for="coach-gender">Coach preference
        <select id="coach-gender">
          <option value="all">No preference</option>
          <option value="female">Female-friendly signals</option>
        </select>
      </label>
      <button class="btn btn-primary" type="submit">Find matches</button>
    </form>
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
      return '<article class="tool-result-card"><h3><a href="/gyms/'+encodeURIComponent(g.id)+'/">'+esc(g.name)+'</a></h3><p>'+esc(catLabel(g.category))+(g.area?' - '+esc(g.area):'')+(g.priceRange?' - '+esc(g.priceRange):'')+'</p><p>'+esc(g.description || '')+'</p><button class="favorite-btn" data-pg-favorite-id="'+esc(g.id)+'" data-pg-favorite-name="'+esc(g.name)+'" data-pg-favorite-category="'+esc(g.category || '')+'" data-pg-favorite-area="'+esc(g.area || '')+'" data-pg-favorite-price="'+esc(g.priceRange || '')+'" aria-pressed="false"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button></article>';
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
function main() {
  const { GYMS, CATEGORIES } = loadGymsFromDataJs();
  const extraUrls = [];

  // 1. Area pages
  ensureDir(path.join(ROOT, 'area'));
  cleanupChildDirs(path.join(ROOT, 'area'), AREAS.map(a => a.slug), 'area output directory');
  AREAS.forEach(a => {
    const dir = path.join(ROOT, 'area', a.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), buildAreaPage(a, GYMS, CATEGORIES));
    extraUrls.push(`/area/${a.slug}/`);
    console.log('  [AREA] /area/' + a.slug + '/');
  });

  // 2. Guides index + individual guides
  ensureDir(path.join(ROOT, 'guides'));
  cleanupChildDirs(path.join(ROOT, 'guides'), GUIDES.map(g => g.slug), 'guide output directory');
  fs.writeFileSync(path.join(ROOT, 'guides', 'index.html'), buildGuidesIndex(GYMS));
  extraUrls.push('/guides/');
  console.log('  [GUIDES-IDX] /guides/');
  GUIDES.forEach(g => {
    const dir = path.join(ROOT, 'guides', g.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), buildGuidePage(g, GYMS));
    extraUrls.push(`/guides/${g.slug}/`);
    console.log('  [GUIDE] /guides/' + g.slug + '/');
  });

  // 3. Search page
  if (!fs.existsSync(path.join(ROOT, 'search'))) fs.mkdirSync(path.join(ROOT, 'search'));
  fs.writeFileSync(path.join(ROOT, 'search', 'index.html'), buildSearchPage(GYMS, CATEGORIES));
  extraUrls.push('/search/');
  console.log('  [SEARCH] /search/');

  // 4. Add-your-gym
  if (!fs.existsSync(path.join(ROOT, 'add-your-gym'))) fs.mkdirSync(path.join(ROOT, 'add-your-gym'));
  fs.writeFileSync(path.join(ROOT, 'add-your-gym', 'index.html'), buildAddPage());
  extraUrls.push('/add-your-gym/');
  console.log('  [ADD] /add-your-gym/');

  // 5. Methodology page
  if (!fs.existsSync(path.join(ROOT, 'methodology'))) fs.mkdirSync(path.join(ROOT, 'methodology'));
  fs.writeFileSync(path.join(ROOT, 'methodology', 'index.html'), buildMethodologyPage(GYMS, CATEGORIES));
  extraUrls.push('/methodology/');
  console.log('  [METHOD] /methodology/');

  // 6. Directory statistics page
  if (!fs.existsSync(path.join(ROOT, 'pattaya-sport-stats'))) fs.mkdirSync(path.join(ROOT, 'pattaya-sport-stats'));
  fs.writeFileSync(path.join(ROOT, 'pattaya-sport-stats', 'index.html'), buildStatsPage(GYMS, CATEGORIES));
  extraUrls.push('/pattaya-sport-stats/');
  console.log('  [STATS] /pattaya-sport-stats/');

  // 7. Contact and press pages
  if (!fs.existsSync(path.join(ROOT, 'contact'))) fs.mkdirSync(path.join(ROOT, 'contact'));
  fs.writeFileSync(path.join(ROOT, 'contact', 'index.html'), buildContactPage());
  extraUrls.push('/contact/');
  console.log('  [CONTACT] /contact/');

  if (!fs.existsSync(path.join(ROOT, 'press'))) fs.mkdirSync(path.join(ROOT, 'press'));
  fs.writeFileSync(path.join(ROOT, 'press', 'index.html'), buildPressPage(GYMS, CATEGORIES));
  extraUrls.push('/press/');
  console.log('  [PRESS] /press/');

  // 8. Section J utility tools
  if (!fs.existsSync(path.join(ROOT, 'favorites'))) fs.mkdirSync(path.join(ROOT, 'favorites'));
  fs.writeFileSync(path.join(ROOT, 'favorites', 'index.html'), buildFavoritesPage(GYMS));
  extraUrls.push('/favorites/');
  console.log('  [FAV] /favorites/');

  if (!fs.existsSync(path.join(ROOT, 'plan-my-trip'))) fs.mkdirSync(path.join(ROOT, 'plan-my-trip'));
  fs.writeFileSync(path.join(ROOT, 'plan-my-trip', 'index.html'), buildTripPlannerPage(GYMS, CATEGORIES));
  extraUrls.push('/plan-my-trip/');
  console.log('  [TRIP] /plan-my-trip/');

  if (!fs.existsSync(path.join(ROOT, 'find-my-coach'))) fs.mkdirSync(path.join(ROOT, 'find-my-coach'));
  fs.writeFileSync(path.join(ROOT, 'find-my-coach', 'index.html'), buildCoachFinderPage(GYMS, CATEGORIES));
  extraUrls.push('/find-my-coach/');
  console.log('  [COACH] /find-my-coach/');

  // 9. Update sitemap (dedup)
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = fs.readFileSync(sitemapPath, 'utf8');
    const urlsToAdd = extraUrls
      .filter(u => existing.indexOf('<loc>' + SITE + u + '</loc>') < 0)
      .map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`)
      .join('\n');
    if (urlsToAdd) {
      const updated = existing.replace('</urlset>', urlsToAdd + '\n</urlset>');
      fs.writeFileSync(sitemapPath, updated);
      console.log('  [SMP] sitemap.xml updated (+' + extraUrls.length + ' urls)');
    }
  }

  console.log('\nDiscovery built: ' + AREAS.length + ' area pages + ' + GUIDES.length + ' guides + search + add form + methodology + stats + contact + press + Section J tools');
}

main();
