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

function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function loadGymsFromDataJs() {
  const code = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  const win = {};
  new Function('window', code)(win);
  return { GYMS: win.GYMS || [], CATEGORIES: win.CATEGORIES || [] };
}
function header() {
  return `<header class="hero" style="min-height: auto;">
  <nav class="nav">
    <a href="/" class="brand">
      <span class="brand-mark">P</span>
      <span class="brand-text">PATTAYA <strong>GYM</strong></span>
    </a>
    <ul class="nav-links">
      <li><a href="/#directory">Directory</a></li>
      <li><a href="/map/">Map</a></li>
      <li><a href="/search/">Search</a></li>
      <li><a href="/about/">About</a></li>
    </ul>
  </nav>
</header>`;
}
function footer() {
  return `<footer class="footer">
  <div class="footer-inner">
    <div><span class="brand-mark small">P</span><span>PATTAYA <strong>GYM</strong></span></div>
    <p>© ${new Date().getFullYear()} pattaya-gym.com — Every gym &amp; sport in Pattaya, Thailand.</p>
  </div>
</footer>`;
}
function commonHead(title, desc, canonical) {
  return `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(desc)}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escHtml(title)}" />
<meta property="og:description" content="${escHtml(desc)}" />
<meta property="og:url" content="${canonical}" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="stylesheet" href="/styles.css" />
<link rel="stylesheet" href="/venue.css" />
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

// ============== AREA PAGES ==============
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
<main class="venue-page">
  <div class="venue-breadcrumb">
    <a href="/">Directory</a>
    <span class="bc-sep">›</span>
    <span>${escHtml(area.name)}</span>
  </div>
  <div class="venue-hero">
    <span class="venue-cat-pill">Pattaya Area</span>
    <h1 class="venue-h1">${escHtml(area.name)} — gyms &amp; sport venues</h1>
    <p class="venue-lede">${escHtml(area.intro)}</p>
    <div class="venue-hero-meta">
      <span class="meta-chip meta-chip-accent">⭐ ${matchingGyms.length} venues</span>
      <span class="meta-chip">📅 Updated ${new Date().toISOString().slice(0,10)}</span>
      <span class="meta-chip">🏷 ${Object.keys(byCat).length} categories</span>
    </div>
  </div>
  ${sections || '<p style="margin-top:30px;color:var(--text-dim);">No verified venues found in this area yet.</p>'}
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
<script src="/share.js" defer></script>
<script src="/compare.js" defer></script>
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
    intro: 'Pattaya has 14+ verified Muay Thai camps spanning every tier. This guide picks the best for different goals — from total beginners trying their first pad round to fight-prep students looking for serious sparring partners.',
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
    ]
  }
];

function buildGuidePage(guide, allGyms) {
  const url = `${SITE}/guides/${guide.slug}/`;
  const filtered = allGyms.filter(guide.filter);
  const sorted = filtered.slice().sort((a, b) => guide.rank(b) - guide.rank(a));

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

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead(guide.title, guide.desc, url)}
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
</head>
<body>
${header()}
<main class="venue-page">
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
    <p class="venue-lede">${escHtml(guide.intro)}</p>
    <div class="venue-hero-meta">
      <span class="meta-chip meta-chip-accent">⭐ ${sorted.length} venues ranked</span>
      <span class="meta-chip">📅 Updated ${new Date().toISOString().slice(0,10)}</span>
    </div>
  </div>
  ${sectionsHtml.join('')}
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
<script src="/share.js" defer></script>
<script src="/compare.js" defer></script>
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
<main class="venue-page">
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
      <li><strong>On a tight budget?</strong> → <a href="/guides/cheapest-gyms-pattaya/">Cheapest gyms</a></li>
      <li><strong>Looking for luxury?</strong> → <a href="/guides/luxury-sports-clubs-pattaya/">Luxury sports clubs</a></li>
      <li><strong>Train at odd hours?</strong> → <a href="/guides/24-hour-gyms-pattaya/">24-hour gyms</a></li>
      <li><strong>Travelling with kids?</strong> → <a href="/guides/family-friendly-pattaya/">Family-friendly</a></li>
      <li><strong>Total beginner?</strong> → <a href="/guides/best-for-beginners-pattaya/">Best for beginners</a></li>
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

// ============== /search/ PAGE ==============
function buildSearchPage(allGyms, allCats) {
  const url = `${SITE}/search/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Search Pattaya Gyms & Sport Venues', 'Search 98+ verified Pattaya gyms, Muay Thai camps, dive operators, golf courses, and sport venues by name, area, category, or feature.', url)}
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
<main class="venue-page">
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
<script src="/data.js"></script>
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
    color: var(--text); font-size: 15px; font-family: inherit;
  }
  .form-row textarea { min-height: 100px; resize: vertical; }
  .form-row input:focus, .form-row textarea:focus, .form-row select:focus { outline: 0; border-color: var(--accent); }
  .form-submit { display: inline-flex; align-items: center; gap: 6px; padding: 14px 28px; background: var(--accent); color: #000; border: 0; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; }
  .form-submit:hover { background: #ffc933; }
</style>
</head>
<body>
${header()}
<main class="venue-page">
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
      <input id="name" name="name" type="text" required placeholder="e.g. Tiger Muay Thai Pattaya" />
    </div>
    <div class="form-row">
      <label for="category">Category *</label>
      <select id="category" name="category" required>
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
      <input id="address" name="address" type="text" required placeholder="123 Soi Buakhao, Pattaya, Chonburi 20150" />
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
      <span class="hint">Awards, lineage, equipment, trainers, certifications — what would the directory page highlight?</span>
      <textarea id="distinction" name="distinction" placeholder="e.g. Only PADI 5-Star IDC dive shop in Pattaya"></textarea>
    </div>
    <div class="form-row">
      <label for="contact">Your name &amp; email *</label>
      <input id="contact" name="contact" type="text" required placeholder="Tim · tim@gym.com" />
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

  // 5. Update sitemap (dedup)
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

  console.log('\nDiscovery built: ' + AREAS.length + ' area pages + ' + GUIDES.length + ' guides + search + add form');
}

main();
