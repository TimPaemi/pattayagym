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
const ASSET_VERSION = '159';
const DEFAULT_OG_IMAGE = `${SITE}/og-image.png`;

function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function assetHref(file) {
  return `${file}?v=${ASSET_VERSION}`;
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
        <li><a href="/map/">Interactive map</a></li>
        <li><a href="/compare/">Compare venues</a></li>
        <li><a href="/about/">About this site</a></li>
        <li><a href="/methodology/">Research methodology</a></li>
        <li><a href="/pattaya-sport-stats/">Sport tourism stats</a></li>
        <li><a href="/add-your-gym/">Add your gym</a></li>
        <li><a href="mailto:hello@pattaya-gym.com">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="site-footer-base">
    <p>© ${new Date().getFullYear()} pattaya-gym.com — Every gym &amp; sport in Pattaya, Thailand.</p>
    <p class="sf-disclaimer">Independent directory. No paid placements. Listings researched and source-cited from public information.</p>
  </div>
</footer>`;
}
function commonHead(title, desc, canonical) {
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
<script defer data-domain="pattaya-gym.com" src="https://plausible.io/js/script.js"></script>
<script src="${assetHref('/shortcuts.js')}" defer></script>
${serviceWorkerRegistration()}
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23000'/%3E%3Ctext x='50' y='62' font-size='52' text-anchor='middle' fill='%23ffb800' font-family='sans-serif' font-weight='900'%3EP%3C/text%3E%3C/svg%3E" />`;
}

function venueCard(g) {
  const tags = (g.tags || []).slice(0, 3).map(t => `<span class="cv-pill cv-pill-tag">${escHtml(t)}</span>`).join('');
  return `<a href="/gyms/${escHtml(g.id)}/" class="cat-venue-card">
    <div class="cv-head"><h3>${escHtml(g.name)}</h3></div>
    ${g.area ? `<div class="cv-meta">📍 ${escHtml(g.area)}</div>` : ''}
    ${g.hours ? `<div class="cv-meta">🕐 ${escHtml(g.hours)}</div>` : ''}
    <p>${escHtml(g.description || '')}</p>
    <div class="cv-tags">
      ${g.priceRange ? `<span class="cv-pill">💰 ${escHtml(g.priceRange)}</span>` : ''}
      ${tags}
    </div>
    <span class="cv-cta">View full page →</span>
  </a>`;
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
  return `<style>:root{color-scheme:dark;--bg:#0b0b0d;--card:#151518;--text:#f5f5f5;--text-dim:#d0d0d0;--text-muted:#9b9b9b;--accent:#ffb800;--border:rgba(255,255,255,.12)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,sans-serif;line-height:1.6}a{color:inherit}.hero{position:relative;overflow:hidden}.nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 32px;max-width:1200px;margin:0 auto;width:100%;background:rgba(11,11,13,.92);backdrop-filter:blur(12px);border-bottom:1px solid transparent}.brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none;font-weight:900}.brand-mark{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:10px;background:var(--accent);color:#000}.brand-mark.small{width:28px;height:28px;border-radius:8px}.nav-links{display:flex;gap:16px;list-style:none;margin:0;padding:0}.nav-links a{text-decoration:none;color:var(--text-dim);font-weight:700}.venue-page{max-width:880px;margin:0 auto;padding:24px 32px 100px}.venue-breadcrumb{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);margin-bottom:24px;padding:4px 0}.venue-hero{position:relative;padding:32px 32px 28px;margin:0 -8px 36px}.venue-hero-art{position:absolute;top:18px;right:18px;width:116px;height:116px;color:var(--accent);opacity:.22;pointer-events:none;z-index:0}.venue-hero-art .cat-art{width:100%;height:100%;display:block}.venue-hero>*:not(.venue-hero-art){position:relative;z-index:1}.venue-hero .venue-h1{padding-right:130px}.venue-h1{font-size:clamp(1.9rem,4.6vw,2.9rem);line-height:1.08;margin:10px 0 14px;font-weight:950}.venue-lede{color:var(--text-dim);font-size:1.05rem;max-width:760px}.venue-cat-pill,.meta-chip{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:999px;padding:6px 10px}.venue-cat-pill,.meta-chip-accent{color:#000;background:var(--accent);border-color:var(--accent);font-weight:800}.venue-hero-meta,.venue-meta-line,.venue-actions,.share-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.venue-hero-meta{margin-top:16px}.venue-meta-line{margin-bottom:14px}.share-bar{padding:14px 16px;margin:0 0 18px;background:var(--card);border:1px solid var(--border);border-radius:12px}.share-btn{border:1px solid var(--border);padding:7px 13px;border-radius:8px}.cat-venue-grid,.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}.cat-venue-card,.card{display:block;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px;text-decoration:none}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:11px 16px;border-radius:10px;text-decoration:none;font-weight:800}.btn-primary{background:var(--accent);color:#000}.site-footer{border-top:1px solid var(--border);background:#080809}img{max-width:100%;height:auto}@media(max-width:720px){.nav{overflow-x:auto;padding:14px 16px}.nav-links{overflow-x:auto}.venue-page{padding:16px 18px 80px}.venue-hero{padding:24px 20px 22px;margin:0 0 28px}.venue-hero-art{width:78px;height:78px;top:12px;right:12px;opacity:.15}.venue-hero .venue-h1{padding-right:70px}.venue-h1{font-size:1.8rem}.share-bar{padding:10px 12px}.cat-venue-grid{grid-template-columns:1fr}}</style>`;
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

function stylesheetTags(includeVenueCss = true) {
  return `${criticalCss()}
${desktopTocCriticalCss()}
${accessibilityCriticalCss()}
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
</main>
${footer()}
<script src="${assetHref('/share.js')}" defer></script>
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
      <input type="search" class="search-input" id="q" placeholder="Try: muay thai jomtien · cheap yoga · 24 hour gym · english pickleball" autofocus />
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

// ============== MAIN ==============
function main() {
  const { GYMS, CATEGORIES } = loadGymsFromDataJs();
  const extraUrls = [];

  // 1. Area pages
  if (!fs.existsSync(path.join(ROOT, 'area'))) fs.mkdirSync(path.join(ROOT, 'area'));
  AREAS.forEach(a => {
    const dir = path.join(ROOT, 'area', a.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), buildAreaPage(a, GYMS, CATEGORIES));
    extraUrls.push(`/area/${a.slug}/`);
    console.log('  [AREA] /area/' + a.slug + '/');
  });

  // 2. Guides index + individual guides
  if (!fs.existsSync(path.join(ROOT, 'guides'))) fs.mkdirSync(path.join(ROOT, 'guides'));
  fs.writeFileSync(path.join(ROOT, 'guides', 'index.html'), buildGuidesIndex(GYMS));
  extraUrls.push('/guides/');
  console.log('  [GUIDES-IDX] /guides/');
  GUIDES.forEach(g => {
    const dir = path.join(ROOT, 'guides', g.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
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

  // 7. Update sitemap (dedup)
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

  console.log('\nDiscovery built: ' + AREAS.length + ' area pages + ' + GUIDES.length + ' guides + search + add form + methodology + stats');
}

main();
