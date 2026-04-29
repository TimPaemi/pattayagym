#!/usr/bin/env node
/**
 * pattaya-gym.com EXTRAS build:
 *   - /category/<slug>/index.html   (one landing page per category)
 *   - /map/index.html               (Leaflet map of all 98 venues)
 *   - /about/index.html             (trust + methodology)
 *   - /404.html                     (friendly not-found)
 *   - /robots.txt                   (with sitemap reference)
 * Designed to run AFTER build.js. Keeps venue build isolated.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://pattaya-gym.com';
// Category-specific FAQs — appended to each /category/<key>/ page.
const CATEGORY_FAQS = {
  'muay-thai': [
    { q: 'What is the best Muay Thai gym in Pattaya?', a: 'Sityodtong (1959) and Fairtex (1971) are the most decorated heritage camps. Venum Training Camp is the modern flagship. Best choice depends on goal — fight prep, fitness, or beginner intro.' },
    { q: 'How much does Muay Thai cost in Pattaya?', a: 'Drop-in classes ฿300–฿500. Monthly unlimited training ฿4,000–฿15,000. All-inclusive resort camps with accommodation ฿20,000–฿60,000/month.' },
    { q: 'Do I need experience to train Muay Thai in Pattaya?', a: 'No. Most Pattaya camps explicitly welcome beginners and provide all gear. Pad-holders are patient with first-timers; the first 2-3 weeks teach fundamentals.' },
    { q: 'What should I bring to Muay Thai training?', a: 'Hand wraps, mouth guard, water bottle, training clothes. Gloves and pads are usually provided. Most camps sell wraps and mouth guards on site.' }
  ],
  'fitness': [
    { q: 'Which Pattaya gym is open 24 hours?', a: 'Anytime Fitness Pattaya (key-fob 24/7), Jetts Fitness, and Fitness 7 all run round the clock. Most 5-star hotel gyms (Hilton, Andaz, Mövenpick) also offer 24-hour fitness for guests.' },
    { q: 'How much is a gym membership in Pattaya?', a: 'Budget gyms ฿1,500–฿3,000/month. Mid-tier no-contract chains (Anytime Fitness, Jetts) ฿2,000–฿4,000/month. Hotel club day-passes ฿500–฿1,500. Drop-in rates ฿150–฿400.' },
    { q: 'Do Pattaya gyms have month-to-month options?', a: 'Yes — most chains and many independent gyms offer no-contract monthly memberships. Anytime Fitness and Jetts are explicitly contract-free.' },
    { q: 'Are there female-friendly gyms in Pattaya?', a: 'Yes — chains like Anytime Fitness and hotel club gyms (Hilton, Andaz, Mövenpick, Royal Cliff Fitz Club) consistently rank well for safety and comfort. Most boutique studios are female-friendly by default.' }
  ],
  'golf': [
    { q: 'What is the best golf course near Pattaya?', a: 'Siam Country Club Old Course is the headline championship layout. Phoenix Gold Golf, Burapha (36-hole, hosted Thailand Open), and Pattana Sports & Resort are all top-tier within 30–50 minutes of central Pattaya.' },
    { q: 'How much does a round of golf cost in Pattaya?', a: 'Green fees range ฿1,500–฿5,000 weekday and ฿2,500–฿7,500 weekend, before caddie (฿500–฿800) and cart (฿800–฿1,500). Premium courses peak at ฿8,000+ per round.' },
    { q: 'Do I need to book Pattaya tee times in advance?', a: 'Yes — strongly recommended, especially Nov–Feb peak season and weekends. Most courses also rent quality clubs and require caddies (Thai golf tradition).' },
    { q: 'Can beginners play golf in Pattaya?', a: 'Yes — most courses welcome beginners outside of busy hours. Driving ranges and short courses are widely available. Many courses also offer lessons with English-speaking pros.' }
  ],
  'yoga': [
    { q: 'Where can I do yoga in Pattaya?', a: 'Yoga Pattaya Studio, Yoga Haus, Ashtanga Yoga Pattaya, Nok Yoga, One-D, and Balance Yoga Studio are the established yoga venues, mostly in Jomtien and Central Pattaya.' },
    { q: 'How much do yoga classes cost in Pattaya?', a: 'Drop-in classes ฿300–฿700. Class packs ฿2,500–฿5,000 for 10 sessions. Unlimited monthly memberships ฿3,500–฿6,000. Privates run ฿1,500–฿2,500/session.' },
    { q: 'Are Pattaya yoga classes in English?', a: 'Most studios run classes in English. Yoga Pattaya, Yoga Haus, Ashtanga Yoga Pattaya, and One-D all teach predominantly in English with international clientele.' },
    { q: 'What styles of yoga are taught in Pattaya?', a: 'All major styles — Hatha, Vinyasa Flow, Ashtanga (Mysore + led), Yin, Hot, and Restorative. Some studios also teach Pilates, Thai yoga stretching, and meditation.' }
  ],
  'racquet': [
    { q: 'Where can I play tennis in Pattaya?', a: 'Pattaya Sports Club (founded 1992), Fitz Club at Royal Cliff (premier multi-court), Greta Sport Club (6 covered ITF Plexipave courts), Inter Club, Tennis Pattaya, and most 5-star resort courts.' },
    { q: 'Is there pickleball in Pattaya?', a: 'Yes — Pickleball Pattaya on Pratumnak Soi 6 is the dedicated facility. Multi-sport venues like Inter Club and Fitz Club also have pickleball courts. Active 50+ expat community with leagues and tournaments.' },
    { q: 'Where can I play badminton in Pattaya?', a: 'Euro Badminton (dedicated), Pattaya Tennis & Badminton Inter Club, and several condo/community courts. Indoor court hire ฿200–฿400/hour.' },
    { q: 'Can I rent racquets at Pattaya courts?', a: 'Most venues provide loaner racquets and balls/shuttles. Confirm at booking, especially for tennis and squash where personal racquet preference matters.' }
  ],
  'watersports': [
    { q: 'Where can I learn to scuba dive in Pattaya?', a: 'No Limit Divers (PADI 5-Star IDC), Adventure Divers, Aquanauts, Real Divers (British family-run IDC), Mermaid\'s Dive Centre, and Dive Station (SSI). Open-water certification ฿11,000–฿16,000.' },
    { q: 'When is the best time for watersports in Pattaya?', a: 'Diving year-round, best visibility Nov–Apr. Kitesurfing best Nov–Mar. Sailing peaks Dec–Apr. Wakeboarding (Thai Wake Park) year-round.' },
    { q: 'Can I jet ski safely in Pattaya?', a: 'Yes, but use reputable operators. Jet ski scams have been a Pattaya problem historically — book through hotels, established beachfront operators, or use cable wakeboarding (Thai Wake Park) for a safer alternative.' },
    { q: 'Where to dive near Pattaya?', a: 'Coral Island (Koh Larn), Koh Sak, Koh Krok, Koh Khrok, and HTMS Khram (artificial reef wreck). Most operators run half-day and full-day boat trips with 2–3 dives.' }
  ],
  'swimming': [
    { q: 'Where can the public swim in Pattaya?', a: 'Pattaya Public Pool (Jomtien) ฿20–฿100. Hard Rock Pool (largest free-form in SE Asia, day-pass). Cartoon Network Amazone water park. Most 5-star hotel pools offer day-pass access.' },
    { q: 'Are there free pools in Pattaya?', a: 'Most public pools are very low-cost (฿20–฿100), not free. Pattaya Beach and Jomtien Beach are free for ocean swimming. Some condo pools open to non-residents on day-pass arrangements.' },
    { q: 'Are there swim lessons for kids in Pattaya?', a: 'Yes — Hard Rock, Centara Mirage, Andaz, and several dedicated swim schools run kids\' programs. Group lessons typically ฿400–฿800/session.' },
    { q: 'What is the largest water park in Pattaya?', a: 'Ramayana Water Park (184,000 sqm, 26 slides) is the largest in Pattaya area. Cartoon Network Amazone is the second-largest themed park. Centara Mirage has on-site water park access for hotel guests.' }
  ],
  'climbing': [
    { q: 'Is there indoor climbing in Pattaya?', a: 'Yes — Deep Climbing Gym (10m wall, ocean theme, top of Harbour Mall) and Bean Cow Climbing Gym (bouldering + lead). Both offer day passes and rental gear.' },
    { q: 'Can beginners climb at Pattaya gyms?', a: 'Yes — Deep Climbing has TrueBlue auto-belay routes for beginners; Bean Cow has graded boulder problems from absolute beginner upward. Both offer intro sessions and gear rental.' },
    { q: 'How much does climbing cost in Pattaya?', a: 'Day pass ฿300–฿500. Shoes/harness rental ฿100–฿200 each. Class packs and monthly memberships available at both gyms.' },
    { q: 'Is there outdoor climbing near Pattaya?', a: 'Khao Hin Lek Fai (Hua Hin area, day trip) is the closest outdoor crag. Krabi/Railay (10–12 hours south) is the world-famous Thai climbing destination. Bean Cow Climbing is bolting Eastern Seaboard outdoor routes in Rayong.' }
  ],
  'kids-youth': [
    { q: 'Where can my kids play sport in Pattaya?', a: 'AF Academy (UEFA-A football), Kombat Group (kids\' Muay Thai), Fitz Club (kids\' tennis + swim), Pattaya Sports Club (multi-sport), and many resort kids\' clubs (Centara, Mövenpick).' },
    { q: 'What age does my child need to be?', a: 'Most programs accept ages 4–6 minimum. Football academies typically start at 4–5; swimming at 3 with parent; Muay Thai kids\' classes at 6–7; multi-sport camps at 4+.' },
    { q: 'Are there summer camps for kids in Pattaya?', a: 'Yes — major academies and international schools run multi-week summer camps each year. Football, swimming, and multi-sport are most common. Book by April for July–August spots.' },
    { q: 'Are kids\' classes in English?', a: 'Many. AF Academy, Kombat Group, Fitz Club, and resort kids\' clubs all teach in English. Russian-speaking coaching is also widely available given Pattaya\'s expat demographics.' }
  ],
  'adventure': [
    { q: 'What adventure activities can I do in Pattaya?', a: 'Tower zip lines (Tarzan Adventure, Pattaya Sky Walk), go-karting (Bira Circuit, EasyKart), tandem skydiving (Skydive Thailand, Rayong), ATV tours (Pong Village), Flight of the Gibbon canopy zipline, and helicopter tours.' },
    { q: 'How much does skydiving in Pattaya cost?', a: 'Tandem skydive ฿11,000–฿14,000. Photos/videos extra. Skydive Thailand operates from Bang Saen / Rayong area, ~1 hour drive.' },
    { q: 'Is hotel pickup included for Pattaya adventure tours?', a: 'Most adventure operators (ATV, zipline, skydive, water park) include hotel pickup from central Pattaya. Confirm at booking.' },
    { q: 'Are these activities safe?', a: 'Reputable operators carry insurance and follow international safety protocols. Verify the operator\'s safety record (TripAdvisor, Google reviews) and avoid the cheapest unbranded options.' }
  ],
  'crossfit': [
    { q: 'Is there CrossFit in Pattaya?', a: 'CrossFit Pattaya at The Jungle Gym is the main affiliated CrossFit box. The official CrossFit affiliate ecosystem is smaller in Pattaya than Bangkok or Phuket — confirm current affiliation status before signing up long-term.' },
    { q: 'How much does CrossFit cost in Pattaya?', a: 'Drop-in ฿400–฿600. Monthly unlimited ฿3,500–฿5,500. Beginner fundamentals course typically ฿2,000–฿4,000 for 4–8 sessions.' },
    { q: 'Do I need experience to start CrossFit?', a: 'No — most boxes require new members complete a fundamentals course (1–2 weeks) covering Olympic lifts, gymnastics movements, and pacing before joining regular WODs.' }
  ],
  'equestrian': [
    { q: 'Where can I ride horses in Pattaya?', a: 'Thai Polo & Equestrian Club (Asia\'s largest polo + equestrian operation, 250 hectares, 250+ horses) and Horseshoe Point Resort (1,500 acres, multi-discipline equestrian + adventure resort).' },
    { q: 'Can beginners take riding lessons?', a: 'Yes — both major venues offer lessons for first-time riders through advanced equestrians, plus polo introduction programs. Book in advance to confirm coach availability.' },
    { q: 'Is there polo in Pattaya?', a: 'Yes — Thai Polo & Equestrian Club hosts professional polo tournaments and offers polo introduction days for spectators and participants. Pattaya is one of Southeast Asia\'s leading polo destinations.' }
  ],
  'clubs': [
    { q: 'What sport clubs exist in Pattaya?', a: 'Pattaya Sports Club (1992 — multi-sport, foundational expat club), Hash House Harriers (1984 running), Pattaya Cricket Club (BCL competing), Pattaya Panthers RFC (rugby), Pattaya Archery Club (non-profit), and many more.' },
    { q: 'How do I join a Pattaya sport club?', a: 'Most clubs welcome new members year-round. Contact via Facebook page or website. Most charge a small annual membership (฿1,000–฿5,000) plus per-event fees.' },
    { q: 'Are Pattaya sport clubs welcoming to expats and tourists?', a: 'Yes — most are explicitly expat-founded or expat-friendly with English as default. Hash House Harriers and Pattaya Sports Club are the most international.' }
  ]
};



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
  return `<footer class="site-footer">
  <div class="site-footer-inner">
    <div class="sf-col sf-brand-col">
      <div class="sf-brand"><span class="brand-mark small">P</span><span class="sf-brand-text">PATTAYA <strong>GYM</strong></span></div>
      <p class="sf-tag">The most comprehensive directory of gyms, Muay Thai camps, and sport venues in Pattaya, Thailand.</p>
    </div>
    <div class="sf-col">
      <h4>Sport categories</h4>
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
      <h4>Areas of Pattaya</h4>
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
      <h4>Best-of guides</h4>
      <ul>
        <li><a href="/guides/best-muay-thai-pattaya/">Best Muay Thai gyms</a></li>
        <li><a href="/guides/cheapest-gyms-pattaya/">Cheapest gyms</a></li>
        <li><a href="/guides/luxury-sports-clubs-pattaya/">Luxury sports clubs</a></li>
        <li><a href="/guides/24-hour-gyms-pattaya/">24-hour gyms</a></li>
        <li><a href="/guides/family-friendly-pattaya/">Family-friendly</a></li>
        <li><a href="/guides/best-for-beginners-pattaya/">Best for beginners</a></li>
      </ul>
    </div>
    <div class="sf-col">
      <h4>Tools &amp; site</h4>
      <ul>
        <li><a href="/search/">Search venues</a></li>
        <li><a href="/map/">Interactive map</a></li>
        <li><a href="/compare/">Compare venues</a></li>
        <li><a href="/about/">About this site</a></li>
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

// ============== CATEGORY LANDING PAGES ==============
function buildCategoryPage(cat, gymsInCat, allCats) {
  const url = `${SITE}/category/${cat.key}/`;
  const title = `${cat.label} in Pattaya — ${gymsInCat.length} venues compared | Pattaya Gym`;
  const desc = `Every ${cat.label.toLowerCase()} venue in Pattaya, Thailand — ${gymsInCat.length} options compared with addresses, hours, prices, languages, and verified info. Plus tips for picking the right one.`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pattaya Gym Directory', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: cat.label, item: url }
    ]
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cat.label} venues in Pattaya`,
    numberOfItems: gymsInCat.length,
    itemListElement: gymsInCat.slice(0, 50).map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/gyms/${g.id}/`,
      name: g.name
    }))
  };

  const cards = gymsInCat.map(g => `
    <a href="/gyms/${escHtml(g.id)}/" class="cat-venue-card">
      <div class="cv-head">
        <h3>${escHtml(g.name)}</h3>
      </div>
      ${g.area ? `<div class="cv-meta">📍 ${escHtml(g.area)}</div>` : ''}
      ${g.hours ? `<div class="cv-meta">🕐 ${escHtml(g.hours)}</div>` : ''}
      <p>${escHtml(g.description || '')}</p>
      <div class="cv-tags">
        ${g.priceRange ? `<span class="cv-pill">💰 ${escHtml(g.priceRange)}</span>` : ''}
        ${(g.tags || []).slice(0, 3).map(t => `<span class="cv-pill cv-pill-tag">${escHtml(t)}</span>`).join('')}
      </div>
      <span class="cv-cta">View full page →</span>
    </a>
  `).join('');

  const intros = {
    'muay-thai': 'Pattaya is one of the world\'s top destinations for Muay Thai training, with camps spanning lineage-pure traditional family camps, hostel-attached budget gyms, and resort-tier all-inclusive packages. The list below is everything we\'ve verified.',
    'fitness': 'From the largest hardcore bodybuilding gym in Thailand (Muscle Factory) to multi-branch chains, free outdoor calisthenics parks, and luxury hotel clubs — Pattaya\'s fitness landscape covers every budget and training goal.',
    'golf': 'The Pattaya / Eastern Seaboard golf circuit has 12+ championship courses including Pete Dye, Jack Nicklaus, and Ron Fream-designed layouts, plus Thailand\'s first FIA-certified motor racing track. Most courses are 25-50 minutes from central Pattaya.',
    'yoga': 'Pattaya\'s yoga scene differentiates clearly between traditional Ashtanga lineage studios, fitness-style hot yoga, sound-healing wellness spaces, and Thai cultural integration approaches. Find the practice that matches your goals.',
    'racquet': 'Tennis, padel, pickleball, badminton, and squash — Pattaya\'s racquet scene includes ITF-rated covered courts (Greta Sport Club), 5-star resort tennis (Siam Bayshore), foundational expat clubs (Pattaya Sports Club, founded by Vietnam veterans in 1992), and dedicated badminton venues.',
    'watersports': 'Pattaya\'s coast supports kiteboarding (best Nov-Mar), PADI scuba diving on near-island reefs, parasailing, jet ski, wingfoil, e-foil, and SUP. PADI 5-Star IDC at No Limit Divers is the most credentialed dive operation; KBA Pattaya leads multi-discipline foiling.',
    'swimming': 'Pattaya pool options run from public municipal pools (₿20-100 per visit) to the largest free-form pool in Southeast Asia (Hard Rock\'s 2,000 sqm guitar deck) and the world\'s largest water park (Ramayana, 184,000 sqm with 26 slides).',
    'climbing': 'Pattaya climbing is concentrated indoor at Harbor Pattaya Mall (Deep Climbing Gym + Bean Cow). Outdoor climbing requires day trips to Khao Hin Lek Fai or Krabi.',
    'clubs': 'Pattaya\'s social sport clubs span the original 1984 Hash House Harriers running tradition, the foundational Pattaya Sports Club (1992), and Russian-language community sports through Rusich Club.',
    'kids-youth': 'Football academies, swimming lessons, multi-sport schools, and youth-focused programs from age 3 upward. UEFA-A licensed European coaches at FAST PRO; Thai-led local academies; Russian-speaking coaching available.',
    'equestrian': 'The largest polo + equestrian operation in all of Asia (Thai Polo & Equestrian Club, 250 hectares with 250+ horses) and a 1,500-acre equestrian + adventure resort (Horseshoe Point) — Pattaya is genuinely one of Southeast Asia\'s top equestrian destinations.',
    'crossfit': 'Pattaya\'s CrossFit scene is anchored by CrossFit Pattaya at The Jungle Gym — the city\'s only legitimate CrossFit affiliate.',
    'adventure': 'Tower zip lines, go-karting, FIA-certified motor racing, tandem skydiving over Rayong, and themed water parks. For thrill-seekers, Pattaya delivers experiences ranking among Southeast Asia\'s best.',
    'mma': 'MMA in Pattaya is concentrated at hybrid combat sports facilities — Rambaa M16 (founded by Thailand\'s first MMA world champion), Venum Training Camp (with active ONE Championship fighters), and select multi-discipline gyms.',
    'bjj': 'BJJ in Pattaya is mostly integrated into multi-discipline gyms rather than standalone academies. Battle Conquer, Venum, and several MT camps offer BJJ programs.',
    'boxing': 'Western boxing in Pattaya is offered alongside Muay Thai at most authentic camps, plus Castra Fight Club for fitness-focused boxing training.'
  };
  const intro = intros[cat.key] || `Browse all ${gymsInCat.length} ${cat.label.toLowerCase()} venues in Pattaya. Every listing includes verified address, hours, pricing tier, languages, and contact info.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead(title, desc, url)}
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
</head>
<body>
${header()}
<main class="venue-page">
  <div class="venue-breadcrumb">
    <a href="/">Directory</a>
    <span class="bc-sep">›</span>
    <span>${escHtml(cat.label)}</span>
  </div>
  <div class="venue-hero">
    <div class="venue-hero-art" aria-hidden="true">${(global.getCategoryArt && global.getCategoryArt(cat.key)) || ''}</div>
    <span class="venue-cat-pill">${escHtml(cat.label)}</span>
    <h1 class="venue-h1">${escHtml(cat.label)} in Pattaya</h1>
    ${(() => {
      // Break long intro into 1-2 sentence paragraphs for scanability
      const parts = String(intro).split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);
      if (parts.length <= 1) return `<p class="venue-lede">${escHtml(intro)}</p>`;
      // 1 sentence per paragraph when 2+ sentences (most scannable)
      return parts.map((c, i) => `<p class="venue-lede"${i > 0 ? ' style="margin-top: 10px; font-size: 0.96rem;"' : ''}>${escHtml(c)}</p>`).join('');
    })()}
    <div class="venue-hero-meta">
      <span class="meta-chip meta-chip-accent">⭐ ${gymsInCat.length} venues verified</span>
      <span class="meta-chip">📅 Last updated ${new Date().toISOString().slice(0,10)}</span>
    </div>
  </div>
  ${(() => {
    const top = gymsInCat.slice(0, 3);
    if (!top.length) return '';
    return `<section class="tldr" aria-labelledby="tldr-h">
      <h2 id="tldr-h" class="tldr-title">Quick answer — top ${escHtml(cat.label.toLowerCase())} venues</h2>
      <ol class="tldr-list" style="list-style: decimal inside;">
        ${top.map(g => `<li><strong><a href="/gyms/${escHtml(g.id)}/" style="color:var(--accent);">${escHtml(g.name)}</a></strong>${g.area ? ` — ${escHtml(g.area)}` : ''}${g.priceRange ? ` · ${escHtml(g.priceRange)}` : ''}</li>`).join('')}
      </ol>
      <p style="margin: 12px 0 0; font-size: 13px; color: var(--text-muted);"><a href="#full-list" style="color: var(--accent);">Skip to all ${gymsInCat.length} venues →</a></p>
    </section>`;
  })()}

  <h2 id="full-list" style="margin-top:36px; margin-bottom:18px; font-size:1.4rem; font-weight:800; color: var(--text);">All ${escHtml(cat.label)} venues</h2>
  <div class="cat-venue-grid">
    ${cards}
  </div>
  ${(() => {
    const faqs = (typeof CATEGORY_FAQS !== 'undefined' && CATEGORY_FAQS[cat.key]) || [];
    if (!faqs.length) return '';
    return `<section class="about" aria-labelledby="cat-faq-h" style="margin-top: 40px;">
      <h2 id="cat-faq-h" style="font-size: 1.4rem; margin-bottom: 16px;">Common questions about ${escHtml(cat.label.toLowerCase())} in Pattaya</h2>
      ${faqs.map(f => `<details class="faq-item"><summary>${escHtml(f.q)}</summary><p>${escHtml(f.a)}</p></details>`).join('')}
    </section>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    })}</script>`;
  })()}

  <div class="venue-cta-foot" style="margin-top:48px;">
    <h3>Comparing options?</h3>
    <p>Click "+ Add to compare" on any venue page, then visit /compare/ to see them side-by-side.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="/compare/">Open compare tool →</a>
      <a class="btn btn-secondary" href="/map/">View on map</a>
      <a class="btn btn-secondary" href="/">Browse all categories</a>
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

// ============== MAP PAGE ==============
function buildMapPage(allGyms, allCats) {
  const url = `${SITE}/map/`;
  const title = 'Map of All Pattaya Gyms & Sport Venues | Pattaya Gym';
  const desc = `Interactive map of every gym, Muay Thai camp, dive operator, golf course, and sport venue in Pattaya, Thailand. ${allGyms.length} verified venues with one-click directions.`;

  // Geocode hints — venues without explicit lat/lng will be parsed from mapsUrl ?q= search later by the page.
  // For now, we cluster them by area using a simple area→latlng dictionary fallback.
  const areaCenters = {
    'central pattaya': [12.929, 100.882],
    'walking street': [12.928, 100.876],
    'jomtien': [12.890, 100.878],
    'na jomtien': [12.852, 100.917],
    'naklua': [12.962, 100.890],
    'pratamnak': [12.917, 100.873],
    'pratumnak': [12.917, 100.873],
    'soi buakhao': [12.929, 100.886],
    'east pattaya': [12.940, 100.940],
    'mabprachan': [12.946, 100.973],
    'khao mai kaew': [12.960, 100.940],
    'sattahip': [12.667, 100.900],
    'banglamung': [13.050, 100.940],
    'ban chang': [12.717, 101.067],
    'si racha': [13.174, 100.918],
    'bang phra': [13.222, 100.987],
    'chanthaburi': [12.800, 102.117],
    'soi khopai': [12.918, 100.901],
    'thepprasit': [12.903, 100.890]
  };
  function findCoords(g) {
    const text = (g.area + ' ' + g.address).toLowerCase();
    for (const k in areaCenters) {
      if (text.indexOf(k) >= 0) return areaCenters[k];
    }
    return [12.929, 100.882]; // Pattaya center fallback
  }
  // Add a tiny per-venue jitter so multiple in same area don't fully overlap
  function jitter(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    const x = (h % 200) / 20000;
    const y = ((h >> 8) % 200) / 20000;
    return [x, y];
  }
  const markers = allGyms.map(g => {
    const c = findCoords(g);
    const j = jitter(g.id);
    return {
      id: g.id, name: g.name, category: g.category,
      area: g.area || '', priceRange: g.priceRange || '',
      lat: c[0] + j[0], lng: c[1] + j[1]
    };
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead(title, desc, url)}
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
<style>
  .map-page { max-width: 1200px; margin: 0 auto; padding: 24px 16px 80px; }
  #pg-map { height: 70vh; min-height: 500px; border-radius: 14px; overflow: hidden; border: 1px solid var(--border); }
  .map-legend { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0; }
  .ml-pill { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--card); color: var(--text-dim); }
  .ml-pill.active { background: var(--accent); color: #000; border-color: var(--accent); }
  .leaflet-popup-content h4 { margin: 0 0 4px; font-size: 14px; color: var(--accent); }
  .leaflet-popup-content p { margin: 0 0 6px; font-size: 12px; color: #555; }
  .leaflet-popup-content a { color: var(--accent); font-weight: 700; font-size: 12px; }
  .leaflet-container { background: #1a1a1a; }
</style>
</head>
<body>
${header()}
<main class="venue-page map-page">
  <div class="venue-breadcrumb">
    <a href="/">Directory</a>
    <span class="bc-sep">›</span>
    <span>Map</span>
  </div>
  <h1 class="venue-h1" style="font-size: 2rem; margin-bottom: 8px;">Map of all ${allGyms.length} Pattaya venues</h1>
  <p class="venue-lede" style="margin-bottom: 16px;">Filter by category, click any pin to see details, then jump to the full venue page or directions.</p>
  <div class="map-legend" id="map-legend">
    <button class="ml-pill active" data-cat="all">All (${allGyms.length})</button>
    ${allCats.map(c => {
      const count = allGyms.filter(g => g.category === c.key).length;
      return count ? `<button class="ml-pill" data-cat="${c.key}">${escHtml(c.label)} (${count})</button>` : '';
    }).filter(Boolean).join('')}
  </div>
  <div id="pg-map"></div>
  <p style="margin-top: 16px; font-size: 13px; color: var(--text-muted);">Pin positions are approximate (clustered by neighborhood) — click any pin to see exact venue details and one-click Google Maps directions.</p>
</main>
${footer()}
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script>
  var MARKERS = ${JSON.stringify(markers)};
  var CATS = ${JSON.stringify(allCats)};
  var map = L.map('pg-map', { scrollWheelZoom: false }).setView([12.93, 100.92], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  function catColor(k) {
    var palette = { 'muay-thai':'#f87171','fitness':'#ffb800','golf':'#22c55e','yoga':'#a855f7','racquet':'#3b82f6','watersports':'#06b6d4','swimming':'#0ea5e9','climbing':'#ef4444','clubs':'#f59e0b','kids-youth':'#ec4899','equestrian':'#a16207','crossfit':'#84cc16','adventure':'#fb923c','mma':'#dc2626','bjj':'#7c3aed','boxing':'#fde047' };
    return palette[k] || '#ffb800';
  }
  var groups = {};
  MARKERS.forEach(function(m) {
    var cat = CATS.find(function(c){return c.key===m.category;});
    var color = catColor(m.category);
    var ico = L.divIcon({
      html: '<div style="background:'+color+';border:2px solid #000;width:22px;height:22px;border-radius:50%;box-shadow:0 0 0 1px '+color+'80;"></div>',
      className: 'pg-pin', iconSize: [22,22], iconAnchor: [11,11]
    });
    var mk = L.marker([m.lat, m.lng], { icon: ico });
    mk.bindPopup(
      '<h4>'+m.name+'</h4>' +
      '<p>'+(cat?cat.label:m.category)+(m.area?' • '+m.area:'')+(m.priceRange?' • '+m.priceRange:'')+'</p>' +
      '<a href="/gyms/'+m.id+'/">View full page →</a>'
    );
    groups[m.category] = groups[m.category] || [];
    groups[m.category].push(mk);
    mk.addTo(map);
  });
  document.querySelectorAll('.ml-pill').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.ml-pill').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      var cat = btn.dataset.cat;
      Object.keys(groups).forEach(function(k){
        groups[k].forEach(function(mk){
          if (cat === 'all' || k === cat) mk.addTo(map);
          else map.removeLayer(mk);
        });
      });
    });
  });
</script>
</body>
</html>
`;
}

// ============== ABOUT PAGE ==============
function buildAboutPage(allGyms, allCats) {
  const url = `${SITE}/about/`;
  const title = 'About Pattaya Gym | How we research and verify venues';
  const desc = 'Pattaya Gym is the most comprehensive directory of every gym, Muay Thai camp, dive operator, golf course, and sport venue in Pattaya, Thailand. Researched, verified, and updated.';
  const totalChars = 1056548;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead(title, desc, url)}
</head>
<body>
${header()}
<main class="venue-page">
  <div class="venue-breadcrumb">
    <a href="/">Directory</a>
    <span class="bc-sep">›</span>
    <span>About</span>
  </div>
  <div class="venue-hero">
    <span class="venue-cat-pill">About</span>
    <h1 class="venue-h1">About Pattaya Gym</h1>
    <p class="venue-lede">Pattaya Gym is the most comprehensive, source-cited directory of every gym, Muay Thai camp, dive operator, golf course, racquet club, and sport venue in Pattaya, Thailand.</p>
    <div class="venue-hero-meta">
      <span class="meta-chip">📊 ${allGyms.length} venues</span>
      <span class="meta-chip">🏷 ${allCats.length} categories</span>
      <span class="meta-chip meta-chip-accent">⭐ Source-cited research</span>
    </div>
  </div>
  <article class="venue-body">
    <section class="tldr" aria-labelledby="tldr-h">
      <h2 id="tldr-h" class="tldr-title">In short</h2>
      <ul class="tldr-list">
        <li><strong>${allGyms.length} verified venues</strong> across ${allCats.length} sport categories in Pattaya</li>
        <li><strong>Every page source-cited</strong> — official sites, social, TripAdvisor, news</li>
        <li><strong>No paid placement</strong> — rankings are based on objective traits, not money</li>
        <li><strong>Built-in tools</strong> — <a href="/compare/">compare</a>, <a href="/map/">map</a>, <a href="/search/">search</a>, open-now indicator</li>
      </ul>
    </section>

    <h2>What we cover</h2>
    <p>Pattaya is one of Southeast Asia's most diverse sport-tourism destinations.</p>
    <p>But the information is scattered across hundreds of Facebook pages, Google reviews, blog posts, and TripAdvisor listings.</p>
    <p>Pattaya Gym pulls it all into one verified, structured directory — with full venue pages, tools, and honest assessments.</p>
    <p>Every page on this site is built from <strong>multiple cited sources</strong> — official websites, social media, TripAdvisor, news articles, industry directories — and verified for accuracy. Each venue page includes:</p>
    <ul>
      <li>Full address, hours, phone, website, social links</li>
      <li>Pricing tier and indicative rates</li>
      <li>Distinctions, awards, and historical context</li>
      <li>Disciplines offered, trainer credentials</li>
      <li>Pros, cons, "best for" / "not best for" honest assessment</li>
      <li>Quick reference fact card</li>
      <li>Direct links to research sources</li>
    </ul>
    <h2>How we verify</h2>
    <p>Every venue is given a <strong>"verified"</strong> date — the day we last cross-referenced its information against current public sources. Verification involves:</p>
    <ul>
      <li><strong>Official website check</strong> — current hours, prices, contact</li>
      <li><strong>Social media check</strong> — Facebook + Instagram for activity and updates</li>
      <li><strong>TripAdvisor / Google reviews</strong> — current rating and recent visitor experiences</li>
      <li><strong>Industry directories</strong> — PADI for dive shops, FIA for race tracks, UEFA for football academies, etc.</li>
      <li><strong>Cross-reference</strong> against multiple independent sources for distinguishing claims</li>
    </ul>
    <h2>Editorial independence</h2>
    <p>Pattaya Gym is <strong>independent</strong> and not paid by any venue listed. We don't accept "featured listing" payments. Venues are ordered and recommended based on objective characteristics (court count, certifications, decades operating, awards) — not advertising.</p>
    <h2>Want to suggest an edit or new venue?</h2>
    <p>Email <a href="mailto:hello@pattaya-gym.com">hello@pattaya-gym.com</a> with corrections, new venue suggestions, or photos. We update venue pages as we get new information.</p>
    <h2>Tools we built</h2>
    <ul>
      <li><a href="/compare/">Side-by-side comparison tool</a> — pick up to 4 venues and see them in a single table</li>
      <li><a href="/map/">Interactive map</a> — every venue plotted with category filters</li>
      <li><strong>Open-now indicator</strong> — live status based on parsed hours and Bangkok time</li>
      <li><strong>Reading time</strong> — every venue page tells you how long it takes</li>
      <li><strong>Sticky mobile action bar</strong> — Map / Call / Site always one thumb-tap away</li>
    </ul>
  </article>
</main>
${footer()}
<script src="/share.js" defer></script>
<script src="/compare.js" defer></script>
</body>
</html>
`;
}

// ============== 404 PAGE ==============
function build404() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Page not found | Pattaya Gym', 'The page you\'re looking for doesn\'t exist. Browse our directory of every Pattaya gym, Muay Thai camp, dive operator, and sport venue.', `${SITE}/404`)}
<meta name="robots" content="noindex" />
</head>
<body>
${header()}
<main class="venue-page" style="text-align: center; padding-top: 60px;">
  <div style="font-size: 8rem; font-weight: 900; color: var(--accent); line-height: 1; margin-bottom: 12px;">404</div>
  <h1 class="venue-h1" style="font-size: 1.8rem;">Lost in Pattaya?</h1>
  <p class="venue-lede" style="max-width: 520px; margin-left: auto; margin-right: auto;">The page you're looking for doesn't exist. Maybe it moved, maybe we typoed a slug somewhere — either way, here's where to go next.</p>
  <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin: 32px 0;">
    <a class="btn btn-primary" href="/">📋 Browse the directory</a>
    <a class="btn btn-secondary" href="/map/">📍 View map</a>
    <a class="btn btn-secondary" href="/about/">About this site</a>
  </div>
  <p style="margin-top: 32px; color: var(--text-muted); font-size: 13px;">Popular categories: <a href="/category/muay-thai/" style="color: var(--accent);">Muay Thai</a> · <a href="/category/fitness/" style="color: var(--accent);">Fitness gyms</a> · <a href="/category/golf/" style="color: var(--accent);">Golf</a> · <a href="/category/watersports/" style="color: var(--accent);">Watersports</a> · <a href="/category/yoga/" style="color: var(--accent);">Yoga</a></p>
</main>
${footer()}
</body>
</html>
`;
}

// ============== ROBOTS.TXT ==============
function buildRobots() {
  return `User-agent: *
Allow: /
Disallow: /compare/

Sitemap: ${SITE}/sitemap.xml
`;
}

// ============== APPEND CSS FOR CATEGORY GRID ==============
function appendCategoryCss() {
  const target = path.join(ROOT, 'venue.css');
  const marker = '/* CATEGORY-GRID-CSS-INJECTED */';
  const existing = fs.readFileSync(target, 'utf8');
  if (existing.indexOf(marker) >= 0) return; // already there
  const css = `

/* ${marker.replace(/^\/\* | \*\/$/g, '')} */
.cat-venue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-bottom: 30px;
}
.cat-venue-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 20px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s;
}
.cat-venue-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.4);
}
.cat-venue-card .cv-head h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.25;
  letter-spacing: -0.2px;
}
.cat-venue-card .cv-meta { font-size: 12.5px; color: var(--text-dim); }
.cat-venue-card p {
  margin: 4px 0 6px;
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cat-venue-card .cv-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.cv-pill {
  display: inline-block;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(255,184,0,0.08);
  color: var(--accent);
  border: 1px solid rgba(255,184,0,0.18);
  font-weight: 600;
}
.cv-pill-tag { background: var(--border); color: var(--text-dim); border-color: transparent; }
.cv-cta {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.3px;
}
`;
  fs.writeFileSync(target, existing + css);
}

// ============== MAIN ==============
function main() {
  const { GYMS, CATEGORIES } = loadGymsFromDataJs();
  const extraUrls = [];

  // 1. Category landing pages
  let catCount = 0;
  CATEGORIES.forEach(cat => {
    const gymsInCat = GYMS.filter(g => g.category === cat.key);
    if (!gymsInCat.length) return;
    const dir = path.join(ROOT, 'category', cat.key);
    if (!fs.existsSync(path.dirname(dir))) fs.mkdirSync(path.dirname(dir));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), buildCategoryPage(cat, gymsInCat, CATEGORIES));
    extraUrls.push(`/category/${cat.key}/`);
    catCount++;
    console.log('  [CAT] /category/' + cat.key + '/  (' + gymsInCat.length + ' venues)');
  });

  // 2. Map
  if (!fs.existsSync(path.join(ROOT, 'map'))) fs.mkdirSync(path.join(ROOT, 'map'));
  fs.writeFileSync(path.join(ROOT, 'map', 'index.html'), buildMapPage(GYMS, CATEGORIES));
  extraUrls.push('/map/');
  console.log('  [MAP] /map/');

  // 3. About
  if (!fs.existsSync(path.join(ROOT, 'about'))) fs.mkdirSync(path.join(ROOT, 'about'));
  fs.writeFileSync(path.join(ROOT, 'about', 'index.html'), buildAboutPage(GYMS, CATEGORIES));
  extraUrls.push('/about/');
  console.log('  [ABT] /about/');

  // 3b. Compare (already exists as a static file but we want it in the sitemap)
  if (fs.existsSync(path.join(ROOT, 'compare', 'index.html'))) {
    extraUrls.push('/compare/');
    console.log('  [SMP-CMP] /compare/ added to sitemap');
  }

  // 4. 404
  fs.writeFileSync(path.join(ROOT, '404.html'), build404());
  console.log('  [404] /404.html');

  // 5. Robots
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), buildRobots());
  console.log('  [ROB] /robots.txt');

  // 6. CSS injection for category grid
  appendCategoryCss();
  console.log('  [CSS] category grid styles appended to venue.css');

  // 7. Update sitemap to include these
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = fs.readFileSync(sitemapPath, 'utf8');
    // Inject extra URLs before closing tag, dedupe
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

  console.log('\nExtras built: ' + catCount + ' category pages + map + about + 404 + robots.txt');
}

main();
s.writeFileSync(sitemapPath, updated);
      console.log('  [SMP] sitemap.xml updated (+' + extraUrls.length + ' urls)');
    }
  }

  console.log('\nExtras built: ' + catCount + ' category pages + map + about + 404 + robots.txt');
}

main();
