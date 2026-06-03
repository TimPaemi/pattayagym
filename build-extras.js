#!/usr/bin/env node
/**
 * pattaya-gym.com EXTRAS build:
 *   - /category/<slug>/index.html   (one landing page per category)
 *   - /map/index.html               (Leaflet map of all venues)
 *   - /about/index.html             (trust + methodology)
 *   - /404.html                     (friendly not-found)
 *   - /robots.txt                   (with sitemap reference)
 * Designed to run AFTER build.js. Keeps venue build isolated.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://pattaya-gym.com';
const ASSET_VERSION = '237';
const DEFAULT_OG_IMAGE = `${SITE}/og-image.png`;
const LAST_BUILD_DATE = new Date().toISOString().slice(0, 10);
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

function cleanupChildFiles(parent, expectedNames, label) {
  ensureDir(parent);
  const expected = new Set(Array.from(expectedNames).map(String));
  fs.readdirSync(parent, { withFileTypes: true }).forEach(entry => {
    if (!entry.isFile() || expected.has(entry.name)) return;
    fs.rmSync(resolveDirectChild(parent, entry.name), { force: true });
    console.log('  [CLEAN] removed stale ' + label + ': ' + entry.name);
  });
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
  return `<style>:root{color-scheme:dark}html{background:#0a0a0a}body{margin:0;background:#0a0a0a;color:#f4f0e8;font-family:"Inter Tight",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased}*,*::before,*::after{box-sizing:border-box}a{color:inherit;text-decoration:none}img,svg,video{max-width:100%;display:block;height:auto}</style>`;
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

function stylesheetTags(includeVenueCss = true) {
  return `${criticalCss()}
${desktopTocCriticalCss()}
${accessibilityCriticalCss()}
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

function loadGymsFromDataJs() {
  const code = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  const win = {};
  new Function('window', code)(win);
  return { GYMS: win.GYMS || [], CATEGORIES: win.CATEGORIES || [] };
}

function header() {
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
          <li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li>
          <li><a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=Hi%21%20I%27m%20reaching%20out%20via%20pattaya-gym.com" target="_blank" rel="noopener">WhatsApp +66</a></li>
          <li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener">LINE @timpaemi</a></li>
        <li><a href="/press/">Press</a></li>
      </ul>
    </div>
  </div>
  ${newsletterFooterHtml()}
  <div class="site-footer-base">
    <p>© ${new Date().getFullYear()} pattaya-gym.com — Every gym &amp; sport in Pattaya, Thailand.</p>
    <p class="sf-disclaimer">Last updated: ${LAST_BUILD_DATE}. Independent directory. No paid placements. Listings researched and source-cited from public information.</p>
          <p class="sf-builtby"><span class="sf-builtby-rule"></span><span class="sf-builtby-text">// Site built &amp; managed by <a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener author" class="sf-builtby-link">PATTAYA AUTHORITY</a> · <a href="https://timpaemi.com/" target="_blank" rel="noopener author" class="sf-builtby-link">TIM PAEMI</a> <span class="sf-builtby-star">★</span></span><span class="sf-builtby-rule"></span></p>
          
  </div>
</footer>`;
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
<meta name="application-name" content="Pattaya Gym" />
<meta name="msapplication-TileColor" content="#0b0b0d" />
<meta name="msapplication-TileImage" content="/icon-192.png" />
<meta name="color-scheme" content="dark" />
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
<meta property="og:type" content="website" />
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

// ============== CATEGORY LANDING PAGES ==============
function buildCategoryGuidesLinks(catKey) {
  const guides = {
    'muay-thai':   [['best-muay-thai-pattaya','Best Muay Thai gyms'],['best-for-beginners-pattaya','Best for beginners'],['cheapest-gyms-pattaya','Cheapest gyms'],['female-friendly-gyms-pattaya','Female-friendly venues']],
    'fitness':     [['24-hour-gyms-pattaya','24-hour gyms'],['cheapest-gyms-pattaya','Cheapest gyms'],['pattaya-digital-nomad-fitness','Digital nomad fitness'],['female-friendly-gyms-pattaya','Female-friendly']],
    'golf':        [['best-golf-courses-pattaya','Best golf courses'],['luxury-sports-clubs-pattaya','Luxury sports clubs']],
    'yoga':        [['female-friendly-gyms-pattaya','Female-friendly venues'],['pattaya-seniors-low-impact-sport','Seniors low-impact'],['pattaya-solo-female-fitness','Solo female']],
    'watersports': [['best-dive-operators-pattaya','Best dive operators'],['family-friendly-pattaya','Family-friendly']],
    'racquet':     [['family-friendly-pattaya','Family-friendly'],['luxury-sports-clubs-pattaya','Luxury sports clubs']],
    'swimming':    [['family-friendly-pattaya','Family-friendly'],['pattaya-gyms-childcare-family-pools','Childcare + family pools']],
    'climbing':    [['family-friendly-pattaya','Family-friendly'],['best-for-beginners-pattaya','Best for beginners']],
    'kids-youth':  [['family-friendly-pattaya','Family-friendly'],['pattaya-gyms-childcare-family-pools','Childcare + family pools']],
    'clubs':       [['pattaya-digital-nomad-fitness','Digital nomad fitness'],['pattaya-seniors-low-impact-sport','Seniors low-impact']],
    'adventure':   [['family-friendly-pattaya','Family-friendly'],['bangkok-day-trip-sport-pattaya','Bangkok day-trip sport']],
    'equestrian':  [['luxury-sports-clubs-pattaya','Luxury sports clubs']],
    'mma':         [['best-muay-thai-pattaya','Best Muay Thai gyms'],['best-for-beginners-pattaya','Best for beginners']],
    'bjj':         [['best-muay-thai-pattaya','Best Muay Thai gyms'],['best-for-beginners-pattaya','Best for beginners']],
    'crossfit':    [['cheapest-gyms-pattaya','Cheapest gyms'],['best-for-beginners-pattaya','Best for beginners']]
  };
  const list = guides[catKey] || [['best-muay-thai-pattaya','Best Muay Thai gyms'],['best-for-beginners-pattaya','Best for beginners']];
  let html = '<section style="margin: 56px 0 0;">';
  html += '<p style="font-size: 12px; color: #C84A0A; font-weight: 600; margin: 0 0 12px;">Curated guides</p>';
  html += '<h2 style="font-weight: 800; font-size: clamp(1.5rem, 3vw, 1.9rem); line-height: 1.08; letter-spacing: -0.03em; margin: 0 0 24px; color: #0A1220;">Hand-picked guides for this category</h2>';
  html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">';
  list.forEach(([slug,title]) => {
    html += '<a href="/guides/' + slug + '/" style="display:block;text-decoration:none;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:18px 20px;transition:border-color 0.25s,background 0.25s;">';
    html += '<span style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:rgba(255,216,74,0.85);letter-spacing:0.10em;text-transform:uppercase;margin-right:8px;">Guide →</span>';
    html += '<span style="font-family:\'Inter Tight\',sans-serif;font-weight:600;font-size:14.5px;color:#f7f7f8;">' + title + '</span>';
    html += '</a>';
  });
  html += '</div></section>';
  return html;
}

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
    <article class="cat-venue-card">
      <div class="cv-head">
        <h3><a href="/gyms/${escHtml(g.id)}/">${escHtml(g.name)}</a></h3>
        <button class="favorite-btn" data-pg-favorite-id="${escHtml(g.id)}" data-pg-favorite-name="${escHtml(g.name)}" data-pg-favorite-category="${escHtml(g.category)}" data-pg-favorite-area="${escHtml(g.area || '')}" data-pg-favorite-price="${escHtml(g.priceRange || '')}" aria-pressed="false" aria-label="Save to favorites"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button>
      </div>
      ${g.area ? `<div class="cv-meta">📍 ${escHtml(g.area)}</div>` : ''}
      ${g.hours ? `<div class="cv-meta">🕐 ${escHtml(g.hours)}</div>` : ''}
      <p>${escHtml(g.description || '')}</p>
      <div class="cv-tags">
        ${g.priceRange ? `<span class="cv-pill">💰 ${escHtml(g.priceRange)}</span>` : ''}
        ${(g.tags || []).slice(0, 3).map(t => `<span class="cv-pill cv-pill-tag">${escHtml(t)}</span>`).join('')}
      </div>
      <a class="cv-cta" href="/gyms/${escHtml(g.id)}/">View full page -></a>
    </article>
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
${commonHead(title, desc, url, 'CollectionPage')}
<link rel="alternate" type="application/rss+xml" title="Pattaya Gym - ${escHtml(cat.label)} feed" href="/feed/${escHtml(cat.key)}.xml" />
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
      <span class="meta-chip meta-chip-accent">${gymsInCat.length} venues verified</span><span class="meta-chip" style="font-family:'JetBrains Mono',monospace;font-size:11px;">// Updated ${new Date().toISOString().slice(0,10)}</span>
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
${buildCategoryGuidesLinks(cat.key)}
</main>
${footer()}
<script src="${assetHref('/share.js')}" defer></script>
<script src="${assetHref('/favorites.js')}" defer></script>
<script src="${assetHref('/compare.js')}" defer></script>
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

<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "Map", "item": SITE + "/map/" }
    ]
  })}</script>
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
  @media (max-width: 880px) { #pg-map { min-height: 440px; } }
</style>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page map-page" role="main">
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
  <div class="map-layout">
    <div id="pg-map"></div>
    <aside class="map-panel" aria-labelledby="map-panel-title">
      <div class="map-panel-head">
        <h2 id="map-panel-title">Visible venues</h2>
        <p id="map-panel-count" style="margin:4px 0 0;color:var(--text-muted);font-size:12px;"></p>
      </div>
      <div class="map-panel-list" id="map-panel-list"></div>
    </aside>
  </div>
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
  var activeCat = 'all';
  var activeLayers = [];
  var markerById = {};
  var panelList = document.getElementById('map-panel-list');
  var panelCount = document.getElementById('map-panel-count');
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
  function catLabel(k) {
    var cat = CATS.find(function(c){return c.key===k;});
    return cat ? cat.label : k;
  }
  function catColor(k) {
    var palette = { 'muay-thai':'#f87171','fitness':'#ffb800','golf':'#22c55e','yoga':'#a855f7','racquet':'#3b82f6','watersports':'#06b6d4','swimming':'#0ea5e9','climbing':'#ef4444','clubs':'#f59e0b','kids-youth':'#ec4899','equestrian':'#a16207','crossfit':'#84cc16','adventure':'#fb923c','mma':'#dc2626','bjj':'#7c3aed','boxing':'#fde047' };
    return palette[k] || '#ffb800';
  }
  function popupHtml(m) {
    return '<h4>' + esc(m.name) + '</h4>' +
      '<p>' + esc(catLabel(m.category)) + (m.area ? ' - ' + esc(m.area) : '') + (m.priceRange ? ' - ' + esc(m.priceRange) : '') + '</p>' +
      \`<a href="/gyms/\${encodeURIComponent(m.id)}/">View full page -></a>\`;
  }
  function markerLayer(m) {
    var color = catColor(m.category);
    var ico = L.divIcon({
      html: '<div style="background:' + color + ';border:2px solid #000;width:22px;height:22px;border-radius:50%;box-shadow:0 0 0 1px ' + color + '80;"></div>',
      className: 'pg-pin',
      iconSize: [22,22],
      iconAnchor: [11,11]
    });
    var mk = L.marker([m.lat, m.lng], { icon: ico });
    mk._pgId = m.id;
    mk.bindPopup(popupHtml(m));
    markerById[m.id] = mk;
    return mk;
  }
  function clusterLayer(items) {
    var lat = items.reduce(function(sum, m){ return sum + m.lat; }, 0) / items.length;
    var lng = items.reduce(function(sum, m){ return sum + m.lng; }, 0) / items.length;
    var layer = L.marker([lat, lng], {
      icon: L.divIcon({
        html: '<div class="map-cluster">' + items.length + '</div>',
        className: 'pg-cluster-wrap',
        iconSize: [36,36],
        iconAnchor: [18,18]
      })
    });
    layer.bindPopup('<h4>' + items.length + ' venues in this area</h4><p>Zoom in to split this cluster.</p>');
    layer.on('click', function () { map.flyTo([lat, lng], Math.max(map.getZoom() + 2, 13)); });
    return layer;
  }
  function filteredMarkers() {
    return MARKERS.filter(function (m) { return activeCat === 'all' || m.category === activeCat; });
  }
  function visibleLayers(list) {
    if (map.getZoom() >= 13) return list.map(markerLayer);
    var buckets = {};
    list.forEach(function (m) {
      var key = Math.round(m.lat * 22) + ':' + Math.round(m.lng * 22);
      buckets[key] = buckets[key] || [];
      buckets[key].push(m);
    });
    return Object.keys(buckets).map(function (key) {
      return buckets[key].length > 1 ? clusterLayer(buckets[key]) : markerLayer(buckets[key][0]);
    });
  }
  function renderPanel() {
    var bounds = map.getBounds();
    var list = filteredMarkers().filter(function (m) {
      return bounds.contains([m.lat, m.lng]);
    }).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    panelCount.textContent = list.length + ' visible of ' + filteredMarkers().length + ' matching venues';
    panelList.innerHTML = list.slice(0, 80).map(function (m) {
      return '<button class="map-panel-item" data-map-id="' + esc(m.id) + '">' +
        '<strong>' + esc(m.name) + '</strong>' +
        '<span>' + esc(catLabel(m.category)) + (m.area ? ' - ' + esc(m.area) : '') + (m.priceRange ? ' - ' + esc(m.priceRange) : '') + '</span>' +
      '</button>';
    }).join('');
  }
  function renderMarkers() {
    activeLayers.forEach(function (layer) { map.removeLayer(layer); });
    markerById = {};
    activeLayers = visibleLayers(filteredMarkers());
    activeLayers.forEach(function (layer) { layer.addTo(map); });
    renderPanel();
  }
  document.querySelectorAll('.ml-pill').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.ml-pill').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      activeCat = btn.dataset.cat;
      renderMarkers();
    });
  });
  panelList.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-map-id]');
    if (!btn) return;
    var marker = MARKERS.find(function (m) { return m.id === btn.dataset.mapId; });
    if (!marker) return;
    map.flyTo([marker.lat, marker.lng], 14);
    setTimeout(function () {
      renderMarkers();
      if (markerById[marker.id]) markerById[marker.id].openPopup();
    }, 450);
  });
  map.on('moveend zoomend', renderMarkers);
  renderMarkers();
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
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pattaya Gym Directory", "item": SITE + "/" },
      { "@type": "ListItem", "position": 2, "name": "About", "item": SITE + "/about/" }
    ]
  })}</script>
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
    <p>Email <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a> with corrections, new venue suggestions, or photos. We update venue pages as we get new information.</p>
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
<script src="${assetHref('/share.js')}" defer></script>
<script src="${assetHref('/compare.js')}" defer></script>
</body>
</html>
`;
}

// ============== 404 PAGE ==============
function build404() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
${commonHead('Page not found | Pattaya Gym', 'The page you\'re looking for doesn\'t exist. Browse our directory of every Pattaya gym, Muay Thai camp, dive operator, and sport venue.', `${SITE}/404.html`)}
<meta name="robots" content="noindex" />
<script defer>document.addEventListener('DOMContentLoaded',function(){if(window.plausible)window.plausible('404',{props:{path:location.pathname}});});</script>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
${header()}
<main id="main" class="venue-page" role="main" style="text-align: center; padding-top: 60px;">
  <div style="font-size: 8rem; font-weight: 900; color: var(--accent); line-height: 1; margin-bottom: 12px;">404</div>
  <h1 class="venue-h1" style="font-size: 1.8rem;">Lost in Pattaya?</h1>
  <p class="venue-lede" style="max-width: 520px; margin-left: auto; margin-right: auto;">The page you're looking for doesn't exist. Maybe it moved, maybe we typoed a slug somewhere — either way, here's where to go next.</p>
  <div style="max-width: 720px; margin: 36px auto 0; text-align: left;">
    <p style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-low); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px;">// Did you mean?</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
      <a href="/category/muay-thai/" style="display:block;padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;text-decoration:none;color:var(--text-hi);font-family:'JetBrains Mono',monospace;font-size:13px;">Muay Thai →</a>
      <a href="/category/fitness/" style="display:block;padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;text-decoration:none;color:var(--text-hi);font-family:'JetBrains Mono',monospace;font-size:13px;">Fitness gyms →</a>
      <a href="/category/golf/" style="display:block;padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;text-decoration:none;color:var(--text-hi);font-family:'JetBrains Mono',monospace;font-size:13px;">Golf courses →</a>
      <a href="/category/watersports/" style="display:block;padding:14px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;text-decoration:none;color:var(--text-hi);font-family:'JetBrains Mono',monospace;font-size:13px;">Watersports / Dive →</a>
      <a href="/search/" style="display:block;padding:14px 16px;background:rgba(255,184,0,0.06);border:1px solid rgba(255,184,0,0.22);border-radius:6px;text-decoration:none;color:var(--gold-2,#ffd84a);font-family:'JetBrains Mono',monospace;font-size:13px;">Open search →</a>
      <a href="/map/" style="display:block;padding:14px 16px;background:rgba(255,184,0,0.06);border:1px solid rgba(255,184,0,0.22);border-radius:6px;text-decoration:none;color:var(--gold-2,#ffd84a);font-family:'JetBrains Mono',monospace;font-size:13px;">Open map →</a>
    </div>
  </div>
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

// ============== /feed.xml — RSS feed of recently-verified venues ==============
function buildRss(allGyms, allCats, categoryKey) {
  const selected = categoryKey ? allGyms.filter(g => g.category === categoryKey) : allGyms;
  const sorted = selected.slice().sort((a, b) =>
    String(b.verified || '').localeCompare(String(a.verified || ''))
  ).slice(0, 30);
  const catLabel = (k) => {
    const c = allCats.find(x => x.key === k);
    return c ? c.label : k;
  };
  const feedTitle = categoryKey
    ? `Pattaya Gym Directory - ${catLabel(categoryKey)} venues`
    : 'Pattaya Gym Directory - Recently Added Venues';
  const feedUrl = categoryKey ? `${SITE}/feed/${categoryKey}.xml` : `${SITE}/feed.xml`;
  const feedDesc = categoryKey
    ? `Latest ${catLabel(categoryKey).toLowerCase()} venues in the Pattaya Gym Directory.`
    : 'Latest gyms, Muay Thai camps, dive operators, golf courses, and sport venues added to the Pattaya Gym Directory.';
  const latestVerified = sorted
    .map(g => g.verified)
    .filter(Boolean)
    .sort()
    .reverse()[0] || LAST_BUILD_DATE;
  const items = sorted.map(g => {
    const url = `${SITE}/gyms/${g.id}/`;
    const pubDate = new Date((g.verified || latestVerified) + 'T00:00:00Z').toUTCString();
    const desc = (g.description || '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    return `  <item>
    <title>${escHtml(g.name || '')}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${pubDate}</pubDate>
    <category>${escHtml(catLabel(g.category))}</category>
    <description><![CDATA[${desc}]]></description>
  </item>`;
  }).join('\n');
  const lastBuild = new Date(latestVerified + 'T00:00:00Z').toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escHtml(feedTitle)}</title>
  <link>${SITE}/</link>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  <description>${escHtml(feedDesc)}</description>
  <language>en-US</language>
  <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
</channel>
</rss>
`;
}

function buildRobots() {
  return `# Pattaya Gym Directory — open to all good-faith crawlers
# Independent directory · No paid placements · pattaya-gym.com

User-agent: *
Allow: /
Disallow: /uploads/
Disallow: /og/
Crawl-delay: 1

# === Search engines ===
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: YandexBot
Allow: /

# === AI / LLM crawlers (explicitly allowed for training + retrieval) ===
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Bytespider
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Diffbot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: facebookexternalhit
Allow: /

Sitemap: ${SITE}/sitemap.xml
Sitemap: ${SITE}/sitemap-index.xml
Sitemap: ${SITE}/sitemap-venues.xml
Sitemap: ${SITE}/sitemap-categories.xml
Sitemap: ${SITE}/sitemap-areas.xml
Sitemap: ${SITE}/sitemap-guides.xml
Sitemap: ${SITE}/sitemap-core.xml
`;
}

function buildLlmsTxt() {
  return `# Pattaya Gym Directory
> The most comprehensive, independently-verified directory of gyms, Muay Thai camps, BJJ academies, golf courses, dive operators, watersports, climbing, yoga and sport venues in Pattaya, Thailand. 158 venues, 15 categories, 6 areas — no paid placements, source-cited research.

This llms.txt file provides AI agents and language-model crawlers with a curated map of the most useful, high-signal pages on pattaya-gym.com.

## Core directory

- [Home](${SITE}/): Full directory with search, filters, featured venues
- [Search](${SITE}/search/): Full-text search across all 158 venues
- [Map](${SITE}/map/): Interactive map of every Pattaya sport venue
- [Compare](${SITE}/compare/): Side-by-side comparison of any 2–4 venues
- [Find My Coach](${SITE}/find-my-coach/): Coach matchmaker by discipline + language
- [Plan My Trip](${SITE}/plan-my-trip/): Build a Pattaya fitness itinerary

## Areas of Pattaya

- [Jomtien Beach](${SITE}/area/jomtien/): Beach-front gyms, dive operators, kitesurfing
- [Naklua / North Pattaya](${SITE}/area/naklua/): Quieter residential, yoga, fitness chains
- [Pratamnak Hill](${SITE}/area/pratamnak/): Densest fitness neighborhood, Muscle Factory, outdoor calisthenics
- [Central Pattaya](${SITE}/area/central-pattaya/): 24-hour gyms, hotel pools, walk-in Muay Thai
- [East Pattaya / Darkside](${SITE}/area/east-pattaya/): Mabprachan, equestrian, value-tier community gyms
- [Sattahip / Far South](${SITE}/area/sattahip/): Marinas, dive sites, waterparks

## Sport categories

- [Muay Thai camps](${SITE}/category/muay-thai/): 21 verified camps including Fairtex, Sityodtong, Kombat Group
- [Fitness / Gym](${SITE}/category/fitness/): 25 venues — 24-hour chains, hotel gyms, boutique
- [Golf](${SITE}/category/golf/): 17 courses including Siam Country Club, Laem Chabang, Phoenix Gold
- [Yoga / Pilates](${SITE}/category/yoga/): 6 studios
- [Tennis / Padel / Squash](${SITE}/category/racquet/): 11 venues
- [Watersports / Diving](${SITE}/category/watersports/): 20 dive operators + kitesurf + yacht clubs
- [Swimming](${SITE}/category/swimming/): 9 pools + waterparks
- [Climbing](${SITE}/category/climbing/): 2 climbing gyms
- [Running / Cycling Clubs](${SITE}/category/clubs/): 23 groups
- [Kids / Youth Sports](${SITE}/category/kids-youth/): 9 football academies + trampoline parks
- [Equestrian](${SITE}/category/equestrian/): 2 facilities including Thai Polo & Equestrian Club
- [Adventure / Multi-Sport](${SITE}/category/adventure/): 12 venues — skydiving, karts, ATV, ziplines
- [MMA](${SITE}/category/mma/): 1 verified MMA camp
- [BJJ / Grappling](${SITE}/category/bjj/): 1 verified BJJ academy
- [CrossFit / Functional](${SITE}/category/crossfit/): 1 affiliate

## Curated guides

- [Best Muay Thai gyms in Pattaya](${SITE}/guides/best-muay-thai-pattaya/)
- [Best dive operators](${SITE}/guides/best-dive-operators-pattaya/)
- [Best golf courses](${SITE}/guides/best-golf-courses-pattaya/)
- [Cheapest gyms](${SITE}/guides/cheapest-gyms-pattaya/)
- [Luxury sports clubs](${SITE}/guides/luxury-sports-clubs-pattaya/)
- [24-hour gyms](${SITE}/guides/24-hour-gyms-pattaya/)
- [Family-friendly venues](${SITE}/guides/family-friendly-pattaya/)
- [Best for beginners](${SITE}/guides/best-for-beginners-pattaya/)
- [Digital nomad fitness](${SITE}/guides/pattaya-digital-nomad-fitness/)
- [Female-friendly venues](${SITE}/guides/female-friendly-gyms-pattaya/)
- [Childcare, kids sport and pools](${SITE}/guides/pattaya-gyms-childcare-family-pools/)
- [Seniors 65+ low-impact sport](${SITE}/guides/pattaya-seniors-low-impact-sport/)
- [Thai gym terms cheat sheet](${SITE}/guides/thai-gym-terms-pattaya/)
- [Russian-speaking sport venues](${SITE}/guides/pattaya-russian-speaking-sport/)
- [Solo female fitness in Pattaya](${SITE}/guides/pattaya-solo-female-fitness/)
- [Gyms near Walking Street](${SITE}/guides/best-gyms-near-walking-street-pattaya/)
- [Bangkok day-trip sport from Pattaya](${SITE}/guides/bangkok-day-trip-sport-pattaya/)

## Methodology + about

- [About this site](${SITE}/about/): Editorial principles, independence policy
- [Research methodology](${SITE}/methodology/): How venues are verified, sources, update cadence
- [Pattaya sport tourism stats](${SITE}/pattaya-sport-stats/): Authoritative numbers
- [Contact](${SITE}/contact/): Submit corrections, partnerships
- [Press](${SITE}/press/): Press kit, citations, media inquiries

## Data feeds (machine-readable)

- [Master sitemap](${SITE}/sitemap.xml)
- [RSS — recently added](${SITE}/feed.xml)
- [Category RSS feeds](${SITE}/feed/): Per-category /feed/<category>.xml
- [Area RSS feeds](${SITE}/feed/area/): Per-area /feed/area/<slug>.xml

## Example AI queries

- "Find beginner-friendly Muay Thai gyms in Pattaya with English-speaking coaches."
- "Compare golf courses near Pattaya by travel time, prestige, and visitor suitability."
- "Which Pattaya gyms are best for digital nomads staying near Jomtien or Pratamnak?"
- "Plan a family-friendly Pattaya sport itinerary with pools, youth football, and indoor activities."

## Editorial promise

Every listing on pattaya-gym.com is researched and source-cited from public information.
No paid placements, no sponsored listings, no affiliate-only entries.
Independent directory operated since 2026. Built and maintained in Pattaya, Thailand.
Coordinates: 12.93°N, 100.88°E.

Last update: ${LAST_BUILD_DATE}
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
function buildVenuesApi(allGyms, allCats) {
  const today = new Date().toISOString().slice(0, 10);
  const catLabel = (k) => { const c = allCats.find(x => x.key === k); return c ? c.label : k; };
  const venues = allGyms.map(g => ({
    id: g.id,
    name: g.name,
    url: `${SITE}/gyms/${g.id}/`,
    category: g.category,
    categoryLabel: catLabel(g.category),
    area: g.area || null,
    address: g.address || null,
    phone: g.phone || null,
    website: g.website || null,
    socialFacebook: (g.social && g.social.facebook) ? `https://facebook.com/${g.social.facebook}` : null,
    socialInstagram: (g.social && g.social.instagram) ? `https://instagram.com/${g.social.instagram}` : null,
    hours: g.hours || null,
    priceRange: g.priceRange || null,
    description: g.description || null,
    tags: g.tags || [],
    mapsUrl: g.mapsUrl || null,
    verified: g.verified || null
  }));
  const data = {
    name: 'Pattaya Gym Directory',
    url: SITE + '/',
    description: 'Independently-verified directory of every gym, Muay Thai camp, BJJ academy, golf course, dive operator, watersports, climbing, yoga and sport venue in Pattaya, Thailand.',
    generated: today,
    license: 'CC BY 4.0',
    attribution: 'Source: pattaya-gym.com (independent directory, no paid placements)',
    counts: { venues: venues.length, categories: allCats.length },
    categories: allCats.map(c => ({ key: c.key, label: c.label })),
    venues: venues
  };
  return JSON.stringify(data);
}


function buildJsonFeed(allGyms, allCats) {
  const sorted = allGyms.slice().sort((a, b) => String(b.verified || '').localeCompare(String(a.verified || ''))).slice(0, 30);
  const items = sorted.map(g => ({
    id: `${SITE}/gyms/${g.id}/`,
    url: `${SITE}/gyms/${g.id}/`,
    title: g.name || '',
    content_text: g.description || '',
    date_published: (g.verified || LAST_BUILD_DATE) + 'T00:00:00Z',
    tags: [g.category, g.area].filter(Boolean)
  }));
  return JSON.stringify({
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Pattaya Gym Directory — Recently Added',
    home_page_url: SITE + '/',
    feed_url: SITE + '/feed.json',
    description: 'Latest verified gyms, Muay Thai camps, dive operators, golf courses and sport venues added to the Pattaya Gym Directory.',
    icon: SITE + '/og-image.png',
    favicon: SITE + '/icon-180.png',
    language: 'en',
    authors: [{ name: 'Pattaya Gym Directory', url: SITE + '/' }],
    items
  });
}

function buildCategoriesApi(allGyms, allCats) {
  const data = allCats.map(c => {
    const list = allGyms.filter(g => g.category === c.key);
    return {
      key: c.key,
      label: c.label,
      url: `${SITE}/category/${c.key}/`,
      venueCount: list.length,
      venues: list.map(g => ({ id: g.id, name: g.name, url: `${SITE}/gyms/${g.id}/`, area: g.area || null, priceRange: g.priceRange || null }))
    };
  });
  return JSON.stringify({
    name: 'Pattaya Gym Directory — categories',
    url: SITE + '/',
    generated: LAST_BUILD_DATE,
    license: 'CC BY 4.0',
    count: data.length,
    categories: data
  }, null, 2);
}

function buildAreasApi(allGyms) {
  const areas = [
    { slug: 'jomtien', name: 'Jomtien', keywords: ['jomtien','na jomtien','na chom thian'] },
    { slug: 'naklua', name: 'Naklua', keywords: ['naklua','na kluea'] },
    { slug: 'pratamnak', name: 'Pratamnak Hill', keywords: ['pratamnak','pratumnak','phra tamnak','buddha hill'] },
    { slug: 'east-pattaya', name: 'East Pattaya / Darkside', keywords: ['east pattaya','darkside','mabprachan','khao talo','khao mai kaeo'] },
    { slug: 'central-pattaya', name: 'Central Pattaya', keywords: ['central pattaya','walking street','beach road','soi buakhao','pattaya 2nd','pattaya 3rd','pattaya klang','the avenue'] },
    { slug: 'sattahip', name: 'Sattahip / Far South', keywords: ['sattahip','ban chang'] }
  ];
  const data = areas.map(a => {
    const list = allGyms.filter(g => {
      const hay = ((g.area || '') + ' ' + (g.address || '')).toLowerCase();
      return a.keywords.some(k => hay.indexOf(k) >= 0);
    });
    return {
      slug: a.slug,
      name: a.name,
      url: `${SITE}/area/${a.slug}/`,
      venueCount: list.length,
      venues: list.map(g => ({ id: g.id, name: g.name, url: `${SITE}/gyms/${g.id}/`, category: g.category, priceRange: g.priceRange || null }))
    };
  });
  return JSON.stringify({
    name: 'Pattaya Gym Directory — areas',
    url: SITE + '/',
    generated: LAST_BUILD_DATE,
    license: 'CC BY 4.0',
    count: data.length,
    areas: data
  }, null, 2);
}


function main() {
  const { GYMS, CATEGORIES } = loadGymsFromDataJs();
  const extraUrls = [];
  const activeCategories = CATEGORIES
    .filter(cat => GYMS.some(g => g.category === cat.key))
    .map(cat => cat.key);

  cleanupChildDirs(path.join(ROOT, 'category'), activeCategories, 'category output directory');

  // 1. Category landing pages
  let catCount = 0;
  CATEGORIES.forEach(cat => {
    const gymsInCat = GYMS.filter(g => g.category === cat.key);
    if (!gymsInCat.length) return;
    const dir = path.join(ROOT, 'category', cat.key);
    if (!fs.existsSync(path.dirname(dir))) fs.mkdirSync(path.dirname(dir));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), finalizeHtml(buildCategoryPage(cat, gymsInCat, CATEGORIES)));
    extraUrls.push(`/category/${cat.key}/`);
    catCount++;
    console.log('  [CAT] /category/' + cat.key + '/  (' + gymsInCat.length + ' venues)');
  });

  // 2. Map
  if (!fs.existsSync(path.join(ROOT, 'map'))) fs.mkdirSync(path.join(ROOT, 'map'));
  fs.writeFileSync(path.join(ROOT, 'map', 'index.html'), finalizeHtml(buildMapPage(GYMS, CATEGORIES)));
  extraUrls.push('/map/');
  console.log('  [MAP] /map/');

  // 3. About
  if (!fs.existsSync(path.join(ROOT, 'about'))) fs.mkdirSync(path.join(ROOT, 'about'));
  fs.writeFileSync(path.join(ROOT, 'about', 'index.html'), finalizeHtml(buildAboutPage(GYMS, CATEGORIES)));
  extraUrls.push('/about/');
  console.log('  [ABT] /about/');

  // 3b. Compare (already exists as a static file but we want it in the sitemap)
  if (fs.existsSync(path.join(ROOT, 'compare', 'index.html'))) {
    extraUrls.push('/compare/');
    console.log('  [SMP-CMP] /compare/ added to sitemap');
  }

  // 4. 404
  fs.writeFileSync(path.join(ROOT, '404.html'), finalizeHtml(build404()));
  console.log('  [404] /404.html');

  // 5. Robots + llms.txt
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), buildRobots());
  console.log('  [ROB] /robots.txt');
  fs.writeFileSync(path.join(ROOT, 'llms.txt'), buildLlmsTxt());
  console.log('  [LLM] /llms.txt');
  ensureDir(path.join(ROOT, 'api'));
  fs.writeFileSync(path.join(ROOT, 'api', 'venues.json'), buildVenuesApi(GYMS, CATEGORIES));
  console.log('  [API] /api/venues.json');
  fs.writeFileSync(path.join(ROOT, 'api', 'categories.json'), buildCategoriesApi(GYMS, CATEGORIES));
  console.log('  [API] /api/categories.json');
  fs.writeFileSync(path.join(ROOT, 'api', 'areas.json'), buildAreasApi(GYMS));
  console.log('  [API] /api/areas.json');
  fs.writeFileSync(path.join(ROOT, 'feed.json'), buildJsonFeed(GYMS, CATEGORIES));
  console.log('  [JF]  /feed.json');

  // 5b. RSS feed of recently-verified venues
  // NOTE: /feed.xml is intentionally NOT added to extraUrls (sitemap). RSS feeds belong in
  // <link rel="alternate" type="application/rss+xml"> on every page (already wired in commonHead),
  // not in the sitemap. Including XML feeds in sitemap.xml is non-standard and confuses crawlers.
  fs.writeFileSync(path.join(ROOT, 'feed.xml'), buildRss(GYMS, CATEGORIES));
  console.log('  [RSS] /feed.xml');
  const feedDir = path.join(ROOT, 'feed');
  ensureDir(feedDir);
  cleanupChildFiles(feedDir, activeCategories.map(key => `${key}.xml`), 'category RSS file');
  CATEGORIES.forEach(cat => {
    const gymsInCat = GYMS.filter(g => g.category === cat.key);
    if (!gymsInCat.length) return;
    fs.writeFileSync(path.join(feedDir, `${cat.key}.xml`), buildRss(GYMS, CATEGORIES, cat.key));
    console.log('  [RSS] /feed/' + cat.key + '.xml');
  });

  // 6. CSS injection for category grid
  appendCategoryCss();
  console.log('  [CSS] category grid styles appended to venue.css');

  // 7. Update sitemap to include these
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const today = new Date().toISOString().slice(0, 10);
    const existing = fs.readFileSync(sitemapPath, 'utf8');
    // Inject extra URLs before closing tag, dedupe
    function extrasPriority(u) {
      if (u === '/map/') return { p: '0.9', f: 'weekly' };
      if (u.startsWith('/category/')) return { p: '0.9', f: 'weekly' };
      if (u === '/compare/') return { p: '0.6', f: 'monthly' };
      if (u === '/about/') return { p: '0.5', f: 'monthly' };
      return { p: '0.6', f: 'monthly' };
    }
    const urlsToAdd = extraUrls
      .filter(u => existing.indexOf('<loc>' + SITE + u + '</loc>') < 0)
      .map(u => {
        const meta = extrasPriority(u);
        return `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>${meta.f}</changefreq><priority>${meta.p}</priority></url>`;
      })
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
