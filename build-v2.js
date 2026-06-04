#!/usr/bin/env node
/**
 * Pattaya.Gym v2 build script
 * Generates: venue pages, category pages, area pages, sitemap
 * Uses TimPaemi-inspired design (see styles.css)
 *
 * Reads:
 *   - data.js (CATEGORIES + GYMS)
 *   - venues/*.md (long-form venue content)
 *
 * Writes:
 *   - gyms/<slug>/index.html
 *   - category/<slug>/index.html
 *   - area/<slug>/index.html
 *   - sitemap.xml
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://pattaya-gym.com';
const ASSET_VERSION = '456';
const TODAY = new Date().toISOString().slice(0, 10);
const BUILD_TIMESTAMP = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

// ---------- Load data ----------
const { CATEGORIES, GYMS } = require('./data.js');
const VENUE_N = GYMS.length;

// ---------- Load venue geo cache (optional — populated by scripts/geocode-venues.js) ----------
let VENUE_GEO = {};
try {
  const geoPath = path.join(__dirname, 'data', 'venue-geo.json');
  if (fs.existsSync(geoPath)) {
    VENUE_GEO = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
  }
} catch (e) {
  // Cache is optional — build continues without geo if missing/corrupt
  VENUE_GEO = {};
}

// Area normalization — map data.js free-text area to URL slug
const AREA_MAP = {
  'jomtien': /jomtien/i,
  'naklua': /naklua|north\s*pattaya|wongamat/i,
  'pratamnak': /pratamnak|pratumnak/i,
  'central-pattaya': /central|beach\s*road|walking|soi\s*buakhao|3rd\s*road|mike|south\s*pattaya|pattaya\s*klang/i,
  'east-pattaya': /east|darkside|mabprachan|nong\s*prue|sukhumvit|huai\s*yai|chai\s*ngam/i,
  'sattahip': /sattahip|na\s*jomtien|bang\s*saray|bang\s*sare|u-tapao/i
};
const AREA_LABELS = {
  'jomtien': 'Jomtien Beach',
  'naklua': 'Naklua / North Pattaya',
  'pratamnak': 'Pratamnak Hill',
  'central-pattaya': 'Central Pattaya',
  'east-pattaya': 'East Pattaya / Darkside',
  'sattahip': 'Sattahip / Far South'
};

function areaSlugFor(area) {
  if (!area) return null;
  for (const [slug, re] of Object.entries(AREA_MAP)) {
    if (re.test(area)) return slug;
  }
  return null;
}

// ---------- Helpers ----------
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeMkdir(p) { fs.mkdirSync(p, { recursive: true }); }

// Normalize a display phone string to a dialable tel: value.
// Strips extensions ("ext. 2621"), parentheticals ("(Mr. Piyawath)"),
// and multi-number lists (takes the first number before / or ;).
function phoneToTel(phone) {
  if (!phone) return '';
  const first = String(phone).split(/[\/;,]/)[0];
  const cleaned = first
    .replace(/\bext\.?\s*\d+/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^+\d]/g, '');
  return cleaned;
}


function writeFile(filePath, content) {
  safeMkdir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

// ---------- Schema.org helpers ----------
// Map data.js category -> schema.org LocalBusiness subtype
function localBusinessType(category) {
  const map = {
    'muay-thai':    ['LocalBusiness', 'SportsActivityLocation'],
    'mma':          ['LocalBusiness', 'SportsActivityLocation'],
    'bjj':          ['LocalBusiness', 'SportsActivityLocation'],
    'crossfit':     ['LocalBusiness', 'ExerciseGym'],
    'fitness':      ['LocalBusiness', 'ExerciseGym', 'HealthClub'],
    'yoga':         ['LocalBusiness', 'HealthClub'],
    'golf':         ['LocalBusiness', 'GolfCourse', 'SportsActivityLocation'],
    'racquet':      ['LocalBusiness', 'SportsActivityLocation'],
    'swimming':     ['LocalBusiness', 'SportsActivityLocation'],
    'watersports':  ['LocalBusiness', 'SportsActivityLocation'],
    'climbing':     ['LocalBusiness', 'SportsActivityLocation'],
    'clubs':        ['LocalBusiness', 'SportsClub'],
    'kids-youth':   ['LocalBusiness', 'SportsActivityLocation'],
    'equestrian':   ['LocalBusiness', 'SportsActivityLocation'],
    'adventure':    ['LocalBusiness', 'SportsActivityLocation']
  };
  return map[category] || ['LocalBusiness'];
}

// Map area context to a fallback Thai postal code when address doesn't include one.
// Chon Buri Province postal codes:
//   20150 — Bang Lamung district (covers Pattaya City, Naklua, Pratamnak, Jomtien, Central Pattaya, East Pattaya, Huai Yai)
//   20250 — Sattahip district (covers Sattahip, Bang Saray, Na Jomtien, U-Tapao, Bang Sare)
//   20110 — Sriracha district (covers Laem Chabang, Sriracha)
//   20230 — Bo Win (industrial estates near Sriracha)
function postalCodeForArea(areaStr) {
  if (!areaStr) return undefined;
  const s = String(areaStr).toLowerCase();
  if (/sattahip|na\s*jomtien|bang\s*saray|bang\s*sare|u-tapao|sattahip|chak\s*ngaeo/i.test(s)) return '20250';
  if (/sriracha|laem\s*chabang/i.test(s)) return '20110';
  if (/bo\s*win/i.test(s)) return '20230';
  // Default to Bang Lamung district (covers all of Pattaya proper)
  if (/jomtien|naklua|pratamnak|pratumnak|central|walking|wongamat|huai\s*yai|nong\s*prue|mabprachan|darkside|east\s*pattaya|south\s*pattaya|north\s*pattaya|sukhumvit|buakhao|thepprasit|thappraya|soi\s|klang|pattaya/i.test(s)) return '20150';
  // Pattaya-directory default — all listed venues are Bang Lamung / Eastern Seaboard belt
  return '20150';
}

// Turn free-text address into a PostalAddress object (best-effort).
// `areaContext` is the venue's area string — used for postal-code fallback when address lacks a zip.
function parsePostalAddress(addr, areaContext) {
  if (!addr) return null;
  const a = String(addr).trim();
  if (!a || /^pattaya[\s—-]/i.test(a) && a.length < 12) return null; // ignore "Pattaya — verify"
  // Pull a postal code if present (5 digits)
  const zipMatch = a.match(/\b(\d{5})\b/);
  const postalCode = zipMatch ? zipMatch[1] : postalCodeForArea(areaContext);
  return {
    '@type': 'PostalAddress',
    streetAddress: a,
    addressLocality: 'Pattaya',
    addressRegion: 'Chon Buri',
    postalCode,
    addressCountry: 'TH'
  };
}

// Convert "Mon-Fri 06:00-22:00; Sat-Sun 08:00-20:00" into openingHoursSpecification.
// Returns array; empty array if not parseable.
function parseHoursSpec(hoursStr) {
  if (!hoursStr) return [];
  // Skip if the string mentions exceptions we can't represent cleanly
  if (/closed|except|verify|by\s*appointment|tbd|n\/a|call\s*ahead|seasonal|members?\s*only/i.test(hoursStr)) return [];
  const DAY = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };
  // Split on ; , and & — but & inherits days from previous segment
  const segments = String(hoursStr).split(/[;,]|&/).map(s => s.trim()).filter(Boolean);
  const out = [];
  let lastDays = null;
  for (const seg of segments) {
    // Match patterns like "Mon-Fri 06:00-22:00" or "Sat 08:00-20:00" or "Daily 24/7"
    // Word boundaries on day tokens so "Sundays" doesn't match as "Sun".
    const daysRe = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Daily|Everyday)\b(?:\s*[-\u2013\u2014]\s*\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b)?/i;
    const timeRe = /(\d{1,2}):?(\d{2})\s*[-\u2013\u2014]\s*(\d{1,2}):?(\d{2})/;
    const dm = seg.match(daysRe);
    const tm = seg.match(timeRe);
    if (!dm && !lastDays) continue;
    let days = [];
    const dayFromKey = (s) => DAY[s.toLowerCase().slice(0, 3)];
    if (dm && /daily|everyday/i.test(dm[1])) {
      days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    } else if (dm && dm[2]) {
      const order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      const a = order.indexOf(dayFromKey(dm[1]));
      const b = order.indexOf(dayFromKey(dm[2]));
      if (a >= 0 && b >= 0 && a <= b) days = order.slice(a, b + 1);
    } else if (dm) {
      days = [dayFromKey(dm[1])].filter(Boolean);
    }
    if (!days.length) {
      // No day matched in this segment — fall back to days from previous segment ("&" continuation)
      if (lastDays) {
        days = lastDays;
      } else {
        continue;
      }
    }
    lastDays = days;
    // 24/7 case
    if (/24\s*\/\s*7|all day/i.test(seg)) {
      out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: '00:00', closes: '23:59' });
      continue;
    }
    if (!tm) continue;
    const opens = `${tm[1].padStart(2,'0')}:${tm[2]}`;
    const closes = `${tm[3].padStart(2,'0')}:${tm[4]}`;
    out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens, closes });
  }
  return out;
}

// BreadcrumbList from an array of { label, href? } items + page url for the last.
function breadcrumbJsonLd(items, pageUrl) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      item: it.href ? `${SITE}${it.href}` : (i === items.length - 1 ? pageUrl : undefined)
    }))
  };
}

// ---------- Frontmatter parser ----------
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: text };
  const yaml = m[1];
  const body = m[2];
  const fm = {};
  const lines = yaml.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const flat = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (flat && !line.startsWith('  ')) {
      const key = flat[1];
      let val = flat[2];
      if (val === '' || val === null) {
        const block = [];
        i++;
        while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
          block.push(lines[i]);
          i++;
        }
        if (block.some(l => l.trim().startsWith('- '))) {
          fm[key] = block.filter(l => l.trim().startsWith('- '))
            .map(l => l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''));
        } else {
          const obj = {};
          block.forEach(l => {
            const kv = l.trim().match(/^([\w-]+):\s*(.*)$/);
            if (kv) obj[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
          });
          fm[key] = obj;
        }
        continue;
      }
      if (val.startsWith('[') && val.endsWith(']')) {
        fm[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      } else {
        fm[key] = val.replace(/^["']|["']$/g, '');
      }
      i++;
      continue;
    }
    i++;
  }
  return { fm, body };
}

// ---------- Markdown -> HTML (markdown-it; produces valid HTML5) ----------
// Round 17 fix for F02.1 (Codex): replace bespoke regex converter that produced
// 210 html-validate errors (stray </p>, malformed lists, missing th scope) with
// a real CommonMark parser. Configured with tables + linkify off + typographer
// off so the output is deterministic and equivalent to the prior intent.
const MarkdownIt = require('markdown-it');
const _md = new MarkdownIt({
  html: false,
  xhtmlOut: false,
  breaks: false,
  linkify: false,
  typographer: false
});
// Demote top-level # to <h2> (we reserve <h1> for the page hero) and add
// scope="col" to every <th>, matching Codex F02.2 fix.
_md.renderer.rules.heading_open = function (tokens, idx) {
  const t = tokens[idx];
  if (t.tag === 'h1') t.tag = 'h2';
  return `<${t.tag}>`;
};
_md.renderer.rules.heading_close = function (tokens, idx) {
  const t = tokens[idx];
  if (t.tag === 'h1') t.tag = 'h2';
  return `</${t.tag}>`;
};
_md.renderer.rules.th_open = function () { return '<th scope="col">'; };
function mdToHtml(md) {
  if (!md) return '';
  return _md.render(md).trim();
}

// ---------- Round 19 helpers: title/desc length safety (Codex F05.1) ----------
function truncateTitle(s, max = 65) {
  if (!s) return s;
  // Round 21 - Codex P2-1: never leave a dangling separator at the end of a title.
  const strip = t => t.replace(/[\s|:,·–-]+$/, '').trimEnd();
  if (s.length <= max) return strip(s);
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return strip((lastSpace > 30 ? cut.slice(0, lastSpace) : cut).trimEnd());
}
function truncateDesc(s, max = 155) {
  if (!s || s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

// ---------- Category FAQ content (Round 24) ----------
const CATEGORY_FAQS = (function () {
  try { return require('./data/category-faqs.js'); }
  catch (e) { return {}; }
})();
function categoryFaqLd(cat) {
  const faqs = CATEGORY_FAQS[cat.key];
  if (!faqs || !faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE}/category/${cat.key}/#faq`,
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}
function categoryFaqHtml(cat) {
  const faqs = CATEGORY_FAQS[cat.key];
  if (!faqs || !faqs.length) return '';
  const items = faqs.map(f =>
    `<details class="faq-item"><summary>${esc(f.q)}</summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`
  ).join('\n      ');
  return `
<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">03</span> Common questions</div>
    <h2 class="h-section">${esc(cat.label)} in Pattaya \u2014 <span class="accent-cyan">FAQ.</span></h2>
    <div class="faq-list">
      ${items}
    </div>
  </div>
</section>
`;
}

// ---------- Area FAQ content (Round 25) ----------
const AREA_FAQS = (function () {
  try { return require('./data/area-faqs.js'); }
  catch (e) { return {}; }
})();
function areaFaqLd(slug, label) {
  const faqs = AREA_FAQS[slug];
  if (!faqs || !faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE}/area/${slug}/#faq`,
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}
function areaFaqHtml(slug, label) {
  const faqs = AREA_FAQS[slug];
  if (!faqs || !faqs.length) return '';
  const items = faqs.map(f =>
    `<details class="faq-item"><summary>${esc(f.q)}</summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`
  ).join('\n      ');
  return `
<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">04</span> Common questions</div>
    <h2 class="h-section">${esc(label)} \u2014 <span class="accent-cyan">FAQ.</span></h2>
    <div class="faq-list">
      ${items}
    </div>
  </div>
</section>
`;
}

// ---------- Shared HTML components ----------
const ASSET = `?v=${ASSET_VERSION}`;

function syncCssFontVersion() {
  const cssPath = path.join(ROOT, 'styles.css');
  let css = fs.readFileSync(cssPath, 'utf8');
  const updated = css.replace(/\/fonts\/([a-z0-9-]+\.woff2)\?v=\d+/g, `/fonts/$1?v=${ASSET_VERSION}`);
  if (updated !== css) fs.writeFileSync(cssPath, updated, 'utf8');
}

function head({ title, desc, url, ogImage = `${SITE}/og-image.png`, jsonLd = null, robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }) {
  // Allow jsonLd to be a single object OR an array of objects (one <script> per item).
  const ldBlocks = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
        .map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
        .join('\n')
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(truncateTitle(title))}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<link rel="preload" href="/styles.css${ASSET}" as="style">
<link rel="stylesheet" href="/styles.css${ASSET}">
<!-- Self-hosted fonts — preload only the LCP display face -->
<link rel="preload" href="/fonts/space-grotesk.woff2${ASSET}" as="font" type="font/woff2" crossorigin>
<link rel="alternate" type="application/json" href="/feed.json" title="Pattaya.Gym feed">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pattaya.Gym">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@PattayaGym">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="robots" content="${robots}">
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="//maps.google.com">
<link rel="dns-prefetch" href="//www.googletagmanager.com">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
${ldBlocks}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>`;
}

function topMarquee(items) {
  const set = items.map(it => it.star ? `<span class="star">·</span>` : `<span>${esc(it)}</span>`).join('');
  // Build using interleaved star separator
  const inner = items.map(item => `<span>${esc(item)}</span><span class="star">·</span>`).join('');
  return `<div class="marquee" aria-hidden="true">
  <div class="marquee-track">
    <div class="marquee-set">${inner}</div>
    <div class="marquee-set" aria-hidden="true">${inner}</div>
  </div>
</div>`;
}

function bottomMarquee(items) {
  const inner = items.map(item => `<span>${esc(item)}</span><span class="star">·</span>`).join('');
  return `<div class="marquee marquee-bottom" aria-hidden="true">
  <div class="marquee-track">
    <div class="marquee-set">${inner}</div>
    <div class="marquee-set" aria-hidden="true">${inner}</div>
  </div>
</div>`;
}

const { v2NavHtml } = require('./scripts/lib/v2-nav.js');
function nav() {
  return v2NavHtml();
}

function pageScripts() {
  return `<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${ASSET}"></script>`;
}

function paNetwork() {
  const { paNetworkHtml } = require('./scripts/lib/pa-network-block');
  return paNetworkHtml({ hereOnGym: true, badgeUrl: 'https://pattaya-authority.com/work/pattaya-gym-directory/' });
}

function backToTop() {
  return `<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>`;
}

function footer() {
  return `<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div>
      <div class="footer-brand">pattaya<span class="accent">.gym</span></div>
      <div class="footer-slogan">Built in Pattaya. For Pattaya.</div>
      <p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> ${VENUE_N} venues hand-checked. No paid placements. Independent directory operated by TimPaemi Co., Ltd. from our Pattaya villa.</p>
      <p class="u-foot-meta">— Tim &amp; Paemi, founders</p>
      <div class="footer-meta">
        TimPaemi Co., Ltd.<br>
        Pattaya City, Bang Lamung District<br>
        Chon Buri 20150 · Thailand
      </div>
    </div>
    <div class="footer-col">
      <div class="footer-col-h">// The site</div>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/methodology/">Methodology</a></li>
        <li><a href="/guides/">Guides</a></li>
        <li><a href="/sports/">All sports</a></li>
        <li><a href="/search/">Search</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <div class="footer-col-h">// Projects</div>
      <ul class="footer-projects">
        <li><a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a></li>
        <li><a href="https://timpaemi.com/" target="_blank" rel="noopener noreferrer">TimPaemi</a></li>
        <li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya Restaurant Guide</a></li>
        <li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a></li>
        <li><a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a></li>
        <li><a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">Pattaya Coffee</a></li>
        <li><a href="https://pattayastream.com/" target="_blank" rel="noopener noreferrer">Pattaya Villa Stream</a></li>
        <li><a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a></li>
        <li><a href="https://pattayapets.com/" target="_blank" rel="noopener noreferrer">PattayaPets</a></li>
        <li><a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <div class="footer-col-h">// Direct</div>
      <ul>
        <li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li>
        <li><a href="https://api.whatsapp.com/send/?phone=66967286999" target="_blank" rel="noopener noreferrer">WhatsApp · +66 96 728 6999</a></li>
        <li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer">LINE · @timpaemi</a></li>
        <li><a href="/contact/">Contact page</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-base">
    <span>© 2026 TimPaemi Co., Ltd. · All rights reserved</span>
    <span class="footer-version-badge">Built ${BUILD_TIMESTAMP} · <a href="/changelog/">v${ASSET_VERSION}</a></span>
    <span class="pattaya-time">Pattaya · <span class="pattaya-time-value" id="pt-clock">--:--</span> ICT</span>
  </div>
</footer>
${backToTop()}
${pageScripts()}
</body>
</html>`;
}

// Standard top/bottom marquee items (venue count follows GYMS.length)
const TOP_MARQUEE = ['★ EVERY GYM', 'EVERY RING', 'EVERY COURT', `${VENUE_N} VENUES`, 'HAND-CHECKED', 'NO PAID PLACEMENTS', 'PATTAYA · THAILAND', 'UPDATED ROLLING'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA', 'NO PAID PLACEMENTS', 'HAND-CHECKED', 'EVERY GYM', 'EVERY RING', 'EVERY COURT', `★ LIVE ${VENUE_N} VENUES`, 'UPDATED ROLLING'];

function breadcrumb(items) {
  // items: [{label, href}], last has no href
  const parts = items.map((it, i) => {
    const isLast = i === items.length - 1;
    if (isLast) return `<span class="u-text-bold">${esc(it.label)}</span>`;
    return `<a href="${it.href}" class="u-muted">${esc(it.label)}</a>`;
  });
  return `<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);">
  ${parts.join(' <span class="u-crumb-sep">/</span> ')}
</nav>`;
}

// ---------- Venue page ----------
function venuePage(g, fm, body) {
  const cat = CATEGORIES.find(c => c.key === g.category);
  const catLabel = cat ? cat.label : g.category;
  const url = `${SITE}/gyms/${g.id}/`;
  const title = `${g.name} | Pattaya.Gym`;
  const desc = truncateDesc(g.description || '', 155);
  const ogImage = `${SITE}/og/${g.id}.png`;

  // Color accent based on category
  const accentColors = {
    'muay-thai': { color: 'pink', class: 'accent-pink' },
    'mma': { color: 'pink', class: 'accent-pink' },
    'bjj': { color: 'pink', class: 'accent-pink' },
    'fitness': { color: 'yellow', class: 'accent-yellow' },
    'crossfit': { color: 'yellow', class: 'accent-yellow' },
    'golf': { color: 'mint', class: 'accent-mint' },
    'yoga': { color: 'cyan', class: 'accent-cyan' },
    'racquet': { color: 'cyan', class: 'accent-cyan' },
    'swimming': { color: 'cyan', class: 'accent-cyan' },
    'watersports': { color: 'cyan', class: 'accent-cyan' },
    'climbing': { color: 'mint', class: 'accent-mint' },
    'clubs': { color: 'mint', class: 'accent-mint' },
    'kids-youth': { color: 'yellow', class: 'accent-yellow' },
    'equestrian': { color: 'mint', class: 'accent-mint' },
    'adventure': { color: 'mint', class: 'accent-mint' },
  };
  const accent = accentColors[g.category] || { color: 'pink', class: 'accent-pink' };

  // Strip parenthetical from headline name (e.g. "Foo (Bar / Baz)" -> "Foo" + subtitle "(Bar / Baz)")
  const parenMatch = g.name.match(/^(.+?)\s*[\(（]([^)）]+)[\)）]\s*$/);
  const displayName = parenMatch ? parenMatch[1].trim() : g.name;
  const subtitleName = parenMatch ? parenMatch[2].trim() : null;

  // Split for headline accent — last word gets the accent color
  const nameWords = displayName.split(/\s+/);
  const lastWord = nameWords.pop();
  const firstWords = nameWords.join(' ');

  // Related venues (same category, different venue, up to 3)
  const related = GYMS.filter(x => x.category === g.category && x.id !== g.id).slice(0, 3);

  // JSON-LD — rich LocalBusiness + BreadcrumbList graph
  const lbType = localBusinessType(g.category);
  const address = parsePostalAddress(fm.address || g.address, fm.area || g.area);
  // Prefer data.js short form for parsing (frontmatter often contains prose); fall back to fm if data.js empty.
  let hoursSpec = parseHoursSpec(g.hours);
  if (!hoursSpec.length) hoursSpec = parseHoursSpec(fm.hours);
  const sameAs = [g.website, fm.website, fm.social?.facebook ? `https://facebook.com/${fm.social.facebook}` : null, fm.social?.instagram ? `https://instagram.com/${fm.social.instagram}` : null, g.social?.facebook ? `https://facebook.com/${g.social.facebook}` : null, g.social?.instagram ? `https://instagram.com/${g.social.instagram}` : null].filter((v, i, a) => v && a.indexOf(v) === i);
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': lbType.length === 1 ? lbType[0] : lbType,
    '@id': `${url}#business`,
    name: g.name,
    description: g.description,
    url: url,
    image: ogImage,
    priceRange: fm.priceRange || g.priceRange || undefined,
    address: address || undefined,
    telephone: (fm.phone || g.phone) ? (phoneToTel(fm.phone || g.phone) || (fm.phone || g.phone)) : undefined,
    email: fm.email || undefined,
    geo: (function() {
      // Priority: 1) frontmatter override, 2) Nominatim geocode cache, 3) none
      // Round 17 — Codex F04.1: round to 6 decimals (~11cm precision).
      const round6 = n => Number(Number(n).toFixed(6));
      if (fm.lat && fm.lng) {
        return { '@type': 'GeoCoordinates', latitude: round6(fm.lat), longitude: round6(fm.lng) };
      }
      const cached = VENUE_GEO[g.id];
      if (cached && cached.lat && cached.lng && !cached.failed && cached._flag !== 'outside_pattaya_region') {
        return { '@type': 'GeoCoordinates', latitude: round6(cached.lat), longitude: round6(cached.lng) };
      }
      return undefined;
    })(),
    openingHoursSpecification: hoursSpec.length ? hoursSpec : undefined,
    openingHours: (!hoursSpec.length && (fm.hours || g.hours)) ? (fm.hours || g.hours) : undefined,
    areaServed: { '@type': 'City', name: 'Pattaya' },
    sameAs: sameAs.length ? sameAs : undefined
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: catLabel, href: `/category/${g.category}/` },
      { label: g.name }
    ], url)
  };
  const jsonLd = [localBusiness, breadcrumbLd];

  const bodyHtml = mdToHtml(body);

  // Prefer frontmatter (rich) over data.js (basic). Fallback chain: fm → g.
  const v = {
    address: fm.address || g.address,
    area: fm.area || g.area,
    hours: fm.hours || g.hours,
    priceRange: fm.priceRange || g.priceRange,
    phone: fm.phone || g.phone,
    email: fm.email || null,
    website: fm.website || g.website,
    mapsUrl: fm.mapsUrl || g.mapsUrl,
    founded: fm.founded || g.founded,
    founders: fm.founders || g.founders,
    currentDirector: fm.currentDirector || null,
    trainerHeadcount: fm.trainerHeadcount || g.trainerHeadcount,
    minimumAge: fm.minimumAge || g.minimumAge,
    languages: fm.languages || g.languages,
    verified: fm.verified || g.verified,
    social: fm.social || g.social || {}
  };

  // Build info rows for the data grid (only show populated fields)
  const infoFields = [
    v.address && { lbl: 'Address', val: v.address, link: v.mapsUrl, color: 'mint' },
    v.area && !v.address && { lbl: 'Area', val: v.area, color: 'cyan' },
    v.hours && { lbl: 'Hours', val: v.hours, color: 'cyan' },
    v.priceRange && { lbl: 'Price', val: v.priceRange, color: 'yellow' },
    v.phone && { lbl: 'Phone', val: v.phone, link: 'tel:' + phoneToTel(v.phone), color: 'pink' },
    v.email && { lbl: 'Email', val: v.email, link: 'mailto:' + v.email, color: 'cyan' },
    v.website && { lbl: 'Website', val: v.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), link: v.website, color: 'cyan' },
    v.founded && { lbl: 'Founded', val: v.founded, color: 'yellow' },
    v.founders && { lbl: 'Founders', val: Array.isArray(v.founders) ? v.founders.join(', ') : v.founders, color: 'pink' },
    v.currentDirector && { lbl: 'Director', val: v.currentDirector, color: 'mint' },
    v.trainerHeadcount && { lbl: 'Trainers', val: v.trainerHeadcount, color: 'pink' },
    v.minimumAge && { lbl: 'Min age', val: v.minimumAge, color: 'cyan' },
    v.languages && { lbl: 'Languages', val: Array.isArray(v.languages) ? v.languages.join(', ') : v.languages, color: 'mint' },
    v.verified && { lbl: 'Last verified', val: v.verified, color: 'pink' }
  ].filter(Boolean);

  return head({ title, desc, url, ogImage, jsonLd })
    + topMarquee(TOP_MARQUEE)
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: catLabel, href: `/category/${g.category}/` },
        { label: g.name }
      ])
    + `
<main id="main">

<section class="hero u-pt-10-pb-8">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// ${esc(catLabel)}${g.area ? ' · ' + esc(g.area.split(/[—\/,]/)[0].trim()) : ''}${g.priceRange ? ' · ' + esc(g.priceRange) : ''}</div>
    <h1 class="hero-h1 u-h-fluid">
      ${firstWords ? esc(firstWords) + '<br>' : ''}<span class="${accent.class}">${esc(lastWord)}.</span>
    </h1>
    ${subtitleName ? `<p style="font-family:var(--font-mono); font-size:13px; color:var(--muted); letter-spacing:0.08em; margin:var(--s-4) 0 0; text-transform:uppercase;">${esc(subtitleName)}</p>` : ''}
    ${g.verified ? `<div class="trust-bar" aria-label="Verification status">
      ${g.featured ? `<span class="trust-pill is-editors-pick" title="Editor's Pick — hand-selected as a top venue in this category">★ Editor's Pick</span>` : ''}
      ${hoursSpec.length ? `<span class="trust-pill is-open-status" data-hours-spec='${JSON.stringify(hoursSpec).replace(/'/g, '&#39;')}'>● Checking hours…</span>` : ''}
      <span class="trust-pill is-verified" title="Hand-checked by Tim Paemi">★ Verified by Tim · ${esc(g.verified)}</span>
      <span class="trust-pill">100% Hand-checked</span>
      <span class="trust-pill">No paid placement</span>
      <a href="/methodology/" class="trust-pill is-link" title="How we rank venues">How we rank →</a>
    </div>` : ''}
    ${g.description ? `<p class="hero-lede u-lede-h">${esc(g.description)}</p>` : ''}
    <div class="venue-hero-ctas-wrap">
      <div class="btn-row u-btn-row-left venue-hero-ctas" id="venue-hero-ctas">
        ${g.phone ? `<a href="tel:${esc(phoneToTel(g.phone))}" class="btn btn-primary">▶ Call gym</a>` : ''}
        <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=${encodeURIComponent('Hi! Asking about ' + g.name + ' via pattaya-gym.com')}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" title="Message Pattaya.Gym (directory team), not the venue direct line">● Ask Pattaya.Gym</a>
        ${g.mapsUrl ? `<a href="${esc(g.mapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">📍 Map</a>` : ''}
        <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Inquiry: ' + g.name)}" class="btn btn-tertiary btn-venue-more">Email →</a>
        ${g.website ? `<a href="${esc(g.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-venue-more">Website →</a>` : ''}
        <button type="button" class="btn btn-ghost btn-venue-more share-venue-btn" data-share-title="${esc(g.name)}" data-share-url="${url}">↗ Share</button>
      </div>
      <button type="button" class="btn btn-ghost venue-more-toggle" aria-expanded="false" aria-controls="venue-hero-ctas">+ More actions</button>
    </div>
  </div>
</section>

${infoFields.length ? `
<section class="section u-pt-4-pb-8">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Venue info</div>
    <div style="display:grid; grid-template-columns:1fr; gap:0; border:1px solid var(--line); border-radius:var(--r-lg); overflow:hidden; background:var(--surface);">
      ${infoFields.map((f, i) => `
      <div style="display:grid; grid-template-columns:130px 1fr; gap:var(--s-4); padding:var(--s-4) var(--s-5);${i < infoFields.length-1 ? ' border-bottom:1px solid var(--line);' : ''}">
        <div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); font-weight:600; letter-spacing:0.10em; text-transform:uppercase;">${esc(f.lbl)}</div>
        <div style="font-size:14px; color:var(--text); font-weight:500; line-height:1.5;${f.color === 'pink' ? ' color:var(--pink);' : ''}${f.color === 'cyan' ? ' color:var(--cyan);' : ''}${f.color === 'mint' ? ' color:var(--mint);' : ''}${f.color === 'yellow' ? ' color:var(--yellow);' : ''}">
          ${f.link ? `<a href="${esc(f.link)}"${f.link.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''} class="u-deemphasized">${esc(f.val)}</a>` : esc(f.val)}
        </div>
      </div>
      `).join('')}
    </div>
  </div>
</section>
` : ''}

${bodyHtml ? `
<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> About this venue</div>
    <article class="venue-body u-prose" id="venue-body">
      ${bodyHtml}
    </article>
    ${Array.isArray(fm.sources) && fm.sources.length ? `
    <div class="venue-sources u-max-760-mt-8">
      <div class="eyebrow u-mb-3"><span class="num">★</span> Sources we checked</div>
      <p class="u-info-card">Every claim on this page is verified against the venue's own sources. If something looks wrong, <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Inaccurate info: ' + g.name)}&body=${encodeURIComponent('Hi Tim — I noticed the following on /gyms/' + g.id + '/ that needs updating:\\n\\n')}" class="u-cyan">tell us</a> and we'll re-check as fast as we can.</p>
      <ul class="venue-source-list">
        ${fm.sources.map(s => `<li><a href="${esc(s)}" target="_blank" rel="noopener noreferrer">${esc(s.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></li>`).join('')}
      </ul>
    </div>` : ''}
    <div class="venue-report-info u-max-760-mt-6">
      <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Suggest update: ' + g.name)}&body=${encodeURIComponent('Hi Tim — I have an update for /gyms/' + g.id + '/:\\n\\n(your update here)\\n\\nSource link (if any):\\n\\nThanks!')}" class="report-info-link">
        <span class="report-info-icon">✎</span>
        <span class="report-info-text">Spot an error or have an update? <strong>Tell us</strong> — we'll re-check as fast as we can.</span>
      </a>
    </div>
    <div id="recently-viewed-mount" data-current-id="${esc(g.id)}" data-current-name="${esc(g.name)}"></div>
  </div>
</section>
<script>
 (function(){
  var KEY = 'pgym_recent_v1';
  var mount = document.getElementById('recently-viewed-mount');
  if (!mount) return;
  var currentId = mount.getAttribute('data-current-id');
  var currentName = mount.getAttribute('data-current-name');
  var list;
  try {
    list = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(list)) list = [];
  } catch (e) { list = []; }
  // Push current to front; dedupe; cap at 8
  list = [{ id: currentId, name: currentName, ts: Date.now() }]
    .concat(list.filter(function(x){ return x && x.id !== currentId; }))
    .slice(0, 8);
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  // Render OTHER recently-viewed (excluding current)
  var others = list.filter(function(x){ return x.id !== currentId; }).slice(0, 6);
  if (others.length === 0) return;
  var html = '<div class="recently-viewed">'
    + '<div class="recently-viewed-h">// You also viewed</div>'
    + '<div class="recently-viewed-list">'
    + others.map(function(v){
        var safe = v.name.replace(/[<>"&]/g, function(c){ return { '<':'&lt;','>':'&gt;','"':'&quot;','&':'&amp;' }[c]; });
        return '<a class="recently-viewed-item" href="/gyms/' + encodeURIComponent(v.id) + '/">' + safe + '</a>';
      }).join('')
    + '</div></div>';
  mount.innerHTML = html;
})();
</script>
<script>
 (function(){
  // OPEN-NOW INDICATOR
  // Reads each .is-open-status pill's data-hours-spec attribute (parsed openingHoursSpecification),
  // compares against current Pattaya time, and replaces text with "● Open · closes HH:MM" or
  // "○ Closed · opens HH:MM (Mon/Tue/...)".
  var DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function pattayaNow() {
    var n = new Date();
    return new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 7 * 3600000);
  }
  function minutesOfDay(hhmm) {
    var p = String(hhmm).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1] || '0', 10);
  }
  function nextOpening(spec, now) {
    // Find the next opening time across the next 7 days starting from now
    var todayDow = DAY_NAMES[now.getDay()];
    var nowMin = now.getHours() * 60 + now.getMinutes();
    // Same-day opening still ahead?
    for (var i = 0; i < spec.length; i++) {
      if (spec[i].dayOfWeek.indexOf(todayDow) >= 0 && minutesOfDay(spec[i].opens) > nowMin) {
        return { day: 'today', time: spec[i].opens };
      }
    }
    // Walk forward 1-7 days
    for (var d = 1; d <= 7; d++) {
      var future = new Date(now.getTime() + d * 86400000);
      var futDow = DAY_NAMES[future.getDay()];
      for (var i = 0; i < spec.length; i++) {
        if (spec[i].dayOfWeek.indexOf(futDow) >= 0) {
          return { day: (d === 1 ? 'tomorrow' : futDow), time: spec[i].opens };
        }
      }
    }
    return null;
  }
  function isOpenNow(spec, now) {
    var dow = DAY_NAMES[now.getDay()];
    var nowMin = now.getHours() * 60 + now.getMinutes();
    for (var i = 0; i < spec.length; i++) {
      var rule = spec[i];
      if (rule.dayOfWeek.indexOf(dow) === -1) continue;
      if (minutesOfDay(rule.opens) <= nowMin && nowMin < minutesOfDay(rule.closes)) {
        return { closes: rule.closes };
      }
    }
    return null;
  }
  var pills = document.querySelectorAll('.is-open-status');
  pills.forEach(function(pill){
    var raw = pill.getAttribute('data-hours-spec');
    if (!raw) return;
    var spec;
    try { spec = JSON.parse(raw.replace(/&#39;/g, "'")); } catch(e){ return; }
    if (!Array.isArray(spec) || spec.length === 0) return;
    var now = pattayaNow();
    var open = isOpenNow(spec, now);
    if (open) {
      pill.textContent = '● Open · closes ' + open.closes;
      pill.classList.add('is-open');
    } else {
      var next = nextOpening(spec, now);
      if (next) {
        var label = next.day === 'today' ? 'today' : (next.day === 'tomorrow' ? 'tomorrow' : next.day);
        pill.textContent = '○ Closed · opens ' + next.time + ' (' + label + ')';
      } else {
        pill.textContent = '○ Closed';
      }
      pill.classList.add('is-closed');
    }
  });
})();
</script>
<script>
 (function(){
  // WEB SHARE API
  var btns = document.querySelectorAll('.share-venue-btn');
  btns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var title = btn.getAttribute('data-share-title') || document.title;
      var url = btn.getAttribute('data-share-url') || window.location.href;
      if (navigator.share) {
        navigator.share({ title: title, url: url, text: 'Pattaya gym pick: ' + title }).catch(function(){});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function(){
          var orig = btn.textContent;
          btn.textContent = '✓ Link copied';
          setTimeout(function(){ btn.textContent = orig; }, 2000);
        });
      } else {
        // Final fallback — prompt
        window.prompt('Copy link:', url);
      }
    });
  });
})();
</script>
<script>
(function(){
  var body = document.getElementById('venue-body');
  if (!body) return;
  var heads = Array.prototype.slice.call(body.querySelectorAll(':scope > h2'));
  if (heads.length < 3) return;
  var nav = document.createElement('div');
  nav.className = 'jump-nav';
  var label = document.createElement('div');
  label.className = 'jump-nav-label';
  label.textContent = '★ On this page · ' + heads.length + ' sections';
  nav.appendChild(label);
  var pills = document.createElement('div');
  pills.className = 'jump-nav-pills';
  heads.forEach(function(h, i){
    var id = h.id || ('s-' + i);
    h.id = id;
    var a = document.createElement('a');
    a.href = '#' + id;
    a.innerHTML = '<span class="n">' + String(i+1).padStart(2,'0') + '</span><span>' + h.textContent + '</span>';
    pills.appendChild(a);
  });
  var hint = document.createElement('p');
  hint.className = 'jump-nav-hint';
  hint.textContent = 'Swipe for more sections →';
  nav.appendChild(pills);
  nav.appendChild(hint);
  var foldMobile = window.matchMedia('(max-width: 899px)').matches && heads.length >= 4;
  if (foldMobile) {
    var tools = document.createElement('div');
    tools.className = 'venue-section-tools';
    tools.innerHTML = '<button type="button" class="btn btn-ghost venue-section-expand">Expand all</button><button type="button" class="btn btn-ghost venue-section-collapse">Collapse all</button>';
    nav.appendChild(tools);
    for (var i = heads.length - 1; i >= 0; i--) {
      var h = heads[i];
      var nextH = heads[i + 1];
      var details = document.createElement('details');
      details.className = 'venue-section';
      if (i < 2) details.setAttribute('open', '');
      var summary = document.createElement('summary');
      summary.className = 'venue-section-summary';
      var panel = document.createElement('div');
      panel.className = 'venue-section-body';
      var node = h.nextSibling;
      while (node && node !== nextH) {
        var nxt = node.nextSibling;
        panel.appendChild(node);
        node = nxt;
      }
      summary.appendChild(h);
      details.appendChild(summary);
      details.appendChild(panel);
      if (nextH && nextH.parentNode) nextH.parentNode.insertBefore(details, nextH);
      else body.appendChild(details);
    }
    tools.querySelector('.venue-section-expand').addEventListener('click', function(){
      body.querySelectorAll('.venue-section').forEach(function(d){ d.setAttribute('open',''); });
    });
    tools.querySelector('.venue-section-collapse').addEventListener('click', function(){
      body.querySelectorAll('.venue-section').forEach(function(d, idx){
        if (idx < 2) d.setAttribute('open',''); else d.removeAttribute('open');
      });
    });
    pills.addEventListener('click', function(e){
      var link = e.target.closest('a');
      if (!link || !link.hash) return;
      var target = body.querySelector(link.hash);
      if (!target) return;
      var section = target.closest('.venue-section');
      if (section) section.setAttribute('open', '');
    });
  }
  body.insertBefore(nav, body.firstChild);
})();
</script>
` : `
<section class="section" style="padding-top:0; padding-bottom:var(--s-8);">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Know more about this venue?</div>
    <div style="background:var(--surface); border:1px solid var(--line); border-left:3px solid var(--cyan); border-radius:var(--r-lg); padding:var(--s-6);">
      <p style="font-size:15px; color:var(--text-2); line-height:1.7; margin:0 0 var(--s-4);">This is a <strong class="u-text">verified entry</strong> in the Pattaya.Gym directory. We've personally confirmed the venue exists and operates. If you've trained here and can share more details — coaches, prices, schedule, what makes it different — we want to know.</p>
      <p style="font-size:15px; color:var(--text-2); line-height:1.7; margin:0;">Help us deepen this listing: <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Update: ' + g.name)}" style="color:var(--cyan); font-weight:600;">email us</a> · <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=${encodeURIComponent('Hi! Update for ' + g.name)}" target="_blank" rel="noopener noreferrer" style="color:var(--mint); font-weight:600;">WhatsApp</a> · or <a href="/contact/" style="color:var(--pink); font-weight:600;">contact form</a>.</p>
    </div>
  </div>
</section>
`}

${(g.social && (g.social.facebook || g.social.instagram)) ? `
<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Social</div>
    <div class="channels-grid">
      ${g.social.facebook ? `<a href="https://facebook.com/${esc(g.social.facebook)}" target="_blank" rel="noopener noreferrer" class="channel-card is-fb"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Facebook</div><h3 class="channel-card-name">${esc(g.social.facebook)}</h3><div class="channel-card-sub">facebook.com</div></a>` : ''}
      ${g.social.instagram ? `<a href="https://instagram.com/${esc(g.social.instagram)}" target="_blank" rel="noopener noreferrer" class="channel-card is-ig"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Instagram</div><h3 class="channel-card-name">@${esc(g.social.instagram)}</h3><div class="channel-card-sub">instagram.com</div></a>` : ''}
      ${g.website ? `<a href="${esc(g.website)}" target="_blank" rel="noopener noreferrer" class="channel-card is-yt"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Website</div><h3 class="channel-card-name">Official site</h3><div class="channel-card-sub">${esc(g.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 28))}</div></a>` : ''}
      ${g.mapsUrl ? `<a href="${esc(g.mapsUrl)}" target="_blank" rel="noopener noreferrer" class="channel-card is-tt"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Google Maps</div><h3 class="channel-card-name">View on map</h3><div class="channel-card-sub">Directions · location</div></a>` : ''}
    </div>
  </div>
</section>
` : ''}

${(g.tags && g.tags.length) ? `
<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Tags</div>
    <div class="u-tags-row">
      ${g.tags.map(t => `<span style="background:var(--surface); border:1px solid var(--line); color:var(--text-2); padding:6px 14px; border-radius:var(--r-pill); font-family:var(--font-mono); font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;">${esc(t)}</span>`).join('')}
    </div>
  </div>
</section>
` : ''}

<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Contact channels</div>
    <h2 class="h-section">Reach us <span class="accent-mint">direct.</span></h2>
    <div class="channels-grid">
      <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Inquiry: ' + g.name)}" class="channel-card is-email">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// Email</div>
        <h3 class="channel-card-name">info@pattaya-gym.com</h3>
        <div class="channel-card-sub">Reply within 24h</div>
      </a>
      <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=${encodeURIComponent('Hi! Asking about ' + g.name + ' via pattaya-gym.com')}" target="_blank" rel="noopener noreferrer" class="channel-card is-wa">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Fastest</div>
        <h3 class="channel-card-name">whatsapp</h3>
        <div class="channel-card-sub">+66 96 728 6999</div>
      </a>
      <a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer" class="channel-card is-line">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// LINE</div>
        <h3 class="channel-card-name">@timpaemi</h3>
        <div class="channel-card-sub">Daily check</div>
      </a>
      ${g.phone ? `<a href="tel:${esc(phoneToTel(g.phone))}" class="channel-card is-agency">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Direct line</div>
        <h3 class="channel-card-name">Call gym</h3>
        <div class="channel-card-sub">${esc(g.phone)}</div>
      </a>` : `<a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer" class="channel-card is-agency">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Our agency</div>
        <h3 class="channel-card-name">pattaya authority</h3>
        <div class="channel-card-sub">pattaya-authority.com</div>
      </a>`}
    </div>
  </div>
</section>

${related.length ? `
<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Same sport</div>
    <h2 class="h-section">Other <span class="${accent.class}">${esc(catLabel.toLowerCase())}.</span></h2>
    <div class="numlist">
      ${related.map((r, i) => `
      <a href="/gyms/${r.id}/" class="numcard u-plain-link">
        <div class="numcard-head">
          <span class="numcard-num">${String(i+1).padStart(2,'0')}</span>
          <h3 class="numcard-title">// ${esc(r.name)}</h3>
        </div>
        <p class="numcard-body">${esc((r.description || '').slice(0, 140))}${(r.description || '').length > 140 ? '…' : ''}</p>
      </a>
      `).join('')}
    </div>
  </div>
</section>
` : ''}

</main>
`
    + paNetwork()
    + bottomMarquee(BOTTOM_MARQUEE)
    + footer();
}

// ---------- Category page ----------
function categoryPage(cat, venues) {
  const url = `${SITE}/category/${cat.key}/`;
  const title = `${cat.label} in Pattaya | Pattaya.Gym`;
  const desc = truncateDesc(`Every ${cat.label.toLowerCase()} venue in Pattaya — ${venues.length} hand-checked ${venues.length === 1 ? 'entry' : 'entries'} with hours, prices, location and contact details. Independent directory, no paid placements, verified on a rolling schedule.`);

  const accentColors = {
    'muay-thai': 'accent-pink', 'mma': 'accent-pink', 'bjj': 'accent-pink',
    'fitness': 'accent-yellow', 'crossfit': 'accent-yellow',
    'golf': 'accent-mint',
    'yoga': 'accent-cyan', 'racquet': 'accent-cyan', 'swimming': 'accent-cyan', 'watersports': 'accent-cyan',
    'climbing': 'accent-mint', 'clubs': 'accent-mint', 'kids-youth': 'accent-yellow',
    'equestrian': 'accent-mint', 'adventure': 'accent-mint'
  };
  const accent = accentColors[cat.key] || 'accent-pink';

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cat.label} in Pattaya`,
    numberOfItems: venues.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: venues.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/gyms/${v.id}/`,
      name: v.name
    }))
  };
  const crumbsLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: cat.label }
    ], `${SITE}/category/${cat.key}/`)
  };
  const faqLd = categoryFaqLd(cat);
  const faqHtml = categoryFaqHtml(cat);
  const jsonLd = faqLd ? [itemList, crumbsLd, faqLd] : [itemList, crumbsLd];

  return head({ title, desc, url, jsonLd })
    + topMarquee(TOP_MARQUEE)
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: cat.label }
      ])
    + `
<main id="main">

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-10); text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Sport · ${venues.length} venues in Pattaya</div>
    <h1 class="hero-h1" style="font-size:clamp(48px,11vw,140px); text-align:left;">
      <span class="${accent}">${esc(cat.label)}.</span>
    </h1>
    <p class="hero-lede u-text-left-ml0">Every <strong>${esc(cat.label.toLowerCase())}</strong> venue worth knowing in Pattaya. <strong>${venues.length} entries</strong> hand-checked. No paid placements. Verified on a rolling schedule. Closures and changes are re-checked as fast as we hear about them.</p>
    <p class="hero-meta u-text-left">${venues.length} venues · Updated ${TODAY} · Pattaya · Thailand</p>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> Quick pick</div>
    <h2 class="h-section">Where to <span class="${accent}">start.</span></h2>
    <p class="lede">${venues.length ? `Our top 3 picks from <strong class="u-text">${venues.length} ${cat.label.toLowerCase()} venues</strong>. Full list below.` : 'No venues currently listed.'}</p>
    <div class="numlist">
      ${venues.slice(0, 3).map((v, i) => `
      <a href="/gyms/${v.id}/" class="numcard u-plain-link">
        <div class="numcard-head">
          <span class="numcard-num">${String(i+1).padStart(2,'0')}</span>
          <h3 class="numcard-title">// ${esc(v.name)}</h3>
        </div>
        <p class="numcard-body">${esc(v.area ? `${v.area} · ${v.priceRange || ''}` : '')}${v.description ? ' · ' + esc(v.description.slice(0, 120)) + ((v.description||'').length > 120 ? '…' : '') : ''}</p>
      </a>
      `).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> All ${venues.length} venues</div>
    <h2 class="h-section">Every <span class="accent-mint">venue.</span> Hand-<span class="accent-pink">checked.</span></h2>
    <div class="numlist">
      ${venues.map((v, i) => `
      <a href="/gyms/${v.id}/" class="numcard u-plain-link">
        <div class="numcard-head">
          <span class="numcard-num">${String(i+1).padStart(2,'0')}</span>
          <h3 class="numcard-title">// ${esc(v.name)}</h3>
        </div>
        <p class="numcard-body">${v.area ? `<strong class="u-text">${esc(v.area)}</strong>` : ''}${v.priceRange ? ` · ${esc(v.priceRange)}` : ''}${v.hours ? ` · ${esc(v.hours)}` : ''}${v.description ? '<br>' + esc(v.description.slice(0, 180)) + ((v.description||'').length > 180 ? '…' : '') : ''}</p>
      </a>
      `).join('')}
    </div>
  </div>
</section>
${faqHtml}
</main>
`
    + paNetwork()
    + bottomMarquee(BOTTOM_MARQUEE)
    + footer();
}

// ---------- Area page ----------
// ---------- Per-area editorial depth ----------
// Codex Nuclear V3 P1-6: area pages were thin (Sattahip 104 words, East Pattaya 231).
// This map gives each area a real neighborhood guide: best-for, transport, landmarks, starter venues.
const AREA_CONTENT = {
  'jomtien': {
    accent: 'accent-cyan',
    summary: 'South Pattaya beachfront. Family-friendly, long-stay-friendly, and the strongest concentration of watersports and yoga in the city.',
    intro: `<p>Jomtien Beach is the southern half of greater Pattaya — a 6 km strip of beachfront stretching from Pratamnak Hill down to Na Jomtien. The vibe is calmer than Central Pattaya: long-stay condos rather than short-stay hotels, families and digital nomads rather than nightlife tourists, and a much higher density of yoga studios, watersports operators, and beachfront fitness than anywhere else in the city.</p><p>If you're booking a 1-3 month Pattaya stay and want to combine training with beach access and walkable food/shopping, Jomtien is the default neighborhood.</p>`,
    bestFor: [
      { label: 'Watersports & diving', why: 'Beachfront access to kitesurfing, paddleboarding, jet skis, parasailing, and the boats that run to Koh Larn.' },
      { label: 'Yoga & Pilates', why: 'Highest concentration of dedicated yoga studios in Pattaya, including several with beach-view rooftops.' },
      { label: 'Family fitness', why: 'Hotel resort gyms (Andaz, Movenpick, Holiday Inn) plus family pools, swimming clubs, kids classes.' },
      { label: 'Long-stay digital nomads', why: 'Walkable beach + condo zone, slower pace, plenty of co-working coffee.' }
    ],
    transport: 'Jomtien Beach Road runs north-south along the beach; Thappraya Road and the Pattaya Klang baht-bus (songthaew) route run parallel inland. The Soi numbering goes south from the Dolphin Roundabout. The baht-bus from Central Pattaya to Jomtien is ~฿10-20.',
    landmarks: [
      'Jomtien Beach (6 km public beach, free access)',
      'Pattaya Park Tower',
      'Dolphin Roundabout (the northern gateway to Jomtien)',
      'Ocean Marina Yacht Club (Sattahip end)',
      'Boat departures to Koh Larn from Bali Hai Pier (technically Central, but the natural ferry origin for Jomtien stays)'
    ],
    starterPicks: 'If you want the easiest first day: start at a Jomtien beachfront yoga studio for a morning class, then a Muay Thai session at one of the nearby camps, then dinner on the beach. Most accommodation here is walkable to all three.'
  },

  'naklua': {
    accent: 'accent-cyan',
    summary: 'North-end Pattaya. Quieter than Central, beachfront at Wong Amat, mixed expat residential and upper-mid-market hotels. Strong Muay Thai presence.',
    intro: `<p>Naklua is everything north of the Naklua-Pattaya bay line — the original fishing-village end of Pattaya before the city expanded south. It still feels different: narrower streets, more Thai-owned shops, a quieter beach (Wong Amat), and fewer tourists per square metre than Central Pattaya.</p><p>For Muay Thai trainers specifically, this is the most-loaded neighborhood in Pattaya — Fairtex, Sityodtong, and several smaller authentic camps all train here. Long-stay couples, female trainers, and tourists looking for a calmer base often pick Naklua over the noisier south.</p>`,
    bestFor: [
      { label: 'Muay Thai (especially long-stay)', why: 'Fairtex resort camp, Sityodtong (1960 legacy), Petchrungruang family camp — three of Pattaya\'s most-respected Muay Thai gyms within a few km of each other.' },
      { label: 'Beach + quiet', why: 'Wong Amat Beach is calmer than Pattaya Beach. Good for families with kids and for trainers who want to recover by the water.' },
      { label: 'Resort training', why: 'Mid-upper hotels (Cape Dara, Centara Grand Mirage) cluster here with full fitness/spa amenities.' }
    ],
    transport: 'Naklua Road is the main north-south spine; the baht-bus from Central Pattaya runs the length of it. North Pattaya Road connects to Sukhumvit. Bus station Pattaya Nuea is in this area, serving Bangkok-bound minivans and buses.',
    landmarks: [
      'Wong Amat Beach (quiet family beach)',
      'Sanctuary of Truth (carved wooden temple)',
      'Lan Po Naklua market (Thai-style fresh market)',
      'Mum Aroi seafood pier',
      'Naklua bus terminal (Bangkok routes)'
    ],
    starterPicks: 'If Muay Thai is the trip, start at Fairtex or Sityodtong depending on whether you want the resort experience or the lineage experience. Stay at one of the Naklua hotels for walkable training + beach + market food access.'
  },

  'pratamnak': {
    accent: 'accent-mint',
    summary: 'The premium hill between Pattaya and Jomtien. Hilton, Royal Cliff, Mövenpick — Pattaya\'s 5-star cluster. Quiet, high-end, view-heavy.',
    intro: `<p>Pratamnak Hill (also spelled Pratumnak — both are correct) is the elevated ridge separating Central Pattaya from Jomtien Beach. It\'s where the highest-end resorts cluster: Hilton, Royal Cliff Hotels Group (Fitz Club), Mövenpick Siam, Centara Grand Mirage. The streets are quiet, the views are panoramic over Pattaya Bay, and the vibe is much more "wellness retreat" than "tourist strip".</p><p>For sport, this is the luxury end of Pattaya — top-tier fitness clubs with multiple racquet sport courts, full-service spas, championship-class swimming, and on-call personal trainers for any discipline. Day passes and short stays are pricier but the experience is materially different from the chain gyms downtown.</p>`,
    bestFor: [
      { label: 'Luxury fitness clubs', why: 'Fitz Club at Royal Cliff — 7 tennis courts, 2 AC squash courts, swimming, weights, professional coaching.' },
      { label: 'Hotel fitness + spa', why: 'Hilton Pattaya, Andaz Jomtien (Pratamnak side), Royal Cliff — 5-star fitness as part of resort stay.' },
      { label: 'Family resort sport', why: 'Centara Grand Mirage Beach Resort family-friendly with multiple pools, kids clubs, sport amenities.' },
      { label: 'View training', why: 'Big Buddha Hill (Wat Phra Yai) is on Pratamnak — the staircase climb is a free public cardio session with the best view in Pattaya.' }
    ],
    transport: 'Pratamnak Soi 4, Pratamnak Soi 5, and Pratamnak Soi 6 run up the hill. Best accessed by taxi/Grab; the songthaew network is thinner here. The hill is between Beach Road (Central Pattaya) and Jomtien Beach Road — both are 5-10 min by car.',
    landmarks: [
      'Big Buddha Hill / Wat Phra Yai (free staircase climb, panoramic Pattaya view)',
      'Khao Phra Tamnak viewpoint',
      'Royal Cliff Hotels Group (luxury cluster)',
      'Cosy Beach (small, hotel-adjacent)',
      'Buddha Hill viewpoint at the south end'
    ],
    starterPicks: 'If the trip is wellness/luxury: book Hilton Pattaya, use the Fitz Club day pass for racquet sports + swimming, climb Big Buddha Hill at sunrise. That\'s a complete Pratamnak day.'
  },

  'central-pattaya': {
    accent: 'accent-pink',
    summary: 'The original Pattaya. Beach Road, Walking Street, Soi Buakhao. Loud, central, walkable, with the deepest pool of budget and mid-market gyms.',
    intro: `<p>Central Pattaya is the loud, dense, walkable heart of the city — Beach Road, Walking Street, Soi Buakhao, the Pattaya Klang corridor. It\'s where the original tourist economy is, and where the highest density of budget and mid-market gyms cluster. If you\'re here for 3-7 nights and want to walk to training from your hotel, this is the neighborhood.</p><p>For Muay Thai specifically, Central has WKO (the legendary budget camp), Battle Conquer (the air-conditioned option), Tony\'s Gym (cheapest weights room in Pattaya), and Pattaya Boxing World. For commercial fitness, every major chain (Anytime, Jetts, Fitness 7, Muscle Factory) has a Central Pattaya branch.</p>`,
    bestFor: [
      { label: 'Short-stay tourists', why: 'Hotel walkable to gym, beach, food, transport. Maximum convenience for 3-7 night trips.' },
      { label: 'Budget Muay Thai', why: 'WKO (~฿4,000/month), Tony\'s Gym (cheapest), Pattaya Thai Boxing Fitness — solid technique at low prices.' },
      { label: '24-hour gym access', why: 'Anytime Fitness, Jetts Fitness, Fitness 7 — chain gyms with extended or 24h access.' },
      { label: 'Mid-tier commercial fitness', why: 'Elite Gym, Castra, Manhattan Pattaya Fitness — well-equipped, reasonable prices, English-friendly.' }
    ],
    transport: 'Beach Road and Second Road run north-south along the beach corridor. Pattaya Klang (Central Road) runs east. Soi Buakhao runs north-south one block inland. The baht-bus loop covers all of this for ฿10-20.',
    landmarks: [
      'Walking Street (south end of Beach Road)',
      'Bali Hai Pier (boats to Koh Larn)',
      'Pattaya Beach (main public beach)',
      'Soi Buakhao (mid-market food + nightlife strip)',
      'Central Festival Pattaya Beach (mall)',
      'Big-C Pattaya Klang'
    ],
    starterPicks: 'If the trip is short and the goal is one-stop convenience: stay near Soi Buakhao, train at WKO or Battle Conquer in the morning, lift at Anytime Fitness in the afternoon, eat anywhere within a 10-minute walk.'
  },

  'east-pattaya': {
    accent: 'accent-mint',
    summary: 'Inland East / "Darkside". Mabprachan Lake, Pong, Nong Prue. Expat residential, cheaper rent, more serious gyms per square km than anywhere else in Pattaya.',
    intro: `<p>East Pattaya — locally called "Darkside" because it\'s east of the railway line — is the inland expat residential half of the city. Mabprachan Lake is the geographic center; the surrounding villages (Pong, Nong Prue, Huai Yai) are where many long-term foreign residents live because rent and houses are 30-50% cheaper than the beach side.</p><p>Sport-wise, East Pattaya punches above its weight. Several of the best-respected serious Muay Thai gyms are here (Sanit Sport Club, Kombat Group at Huai Yai). Most of the elite golf courses (Phoenix Gold, Treasure Hill, Burapha) are in the East Pattaya / Sriracha border region. And there\'s less tourist friction — gyms here cater to people who actually live in Pattaya.</p>`,
    bestFor: [
      { label: 'Serious Muay Thai (long-stay)', why: 'Sanit Sport Club (multi-zone), Kombat Group (all-inclusive), several smaller authentic camps. Less tourist polish, more training depth.' },
      { label: 'Golf', why: 'Phoenix Gold, Treasure Hill, Burapha Golf, Mountain Shadow — all within East Pattaya / nearby borders.' },
      { label: 'Family expat residential sport', why: 'Regents International School Pattaya (sports facilities), large house pools for swim clubs, equestrian (Thai Polo Equestrian Club, Horseshoe Point) all in this area.' },
      { label: 'Adventure / multi-sport', why: 'ATV tours, Tarzan Adventure ziplines, Flight of the Gibbon — outdoor adventure cluster is east-inland.' }
    ],
    transport: 'Sukhumvit-Pattaya highway is the main north-south spine; Tepprasit Road is the major east-west connection from beach to inland. Mabprachan Lake circle road loops around the eastern center. A car or scooter is much more practical than baht-bus.',
    landmarks: [
      'Mabprachan Lake (residential expat center)',
      'Sukhumvit Road (Highway 3)',
      'Tepprasit Road (connects beach to inland)',
      'Huai Yai (rural, near Chak Nok Lake — Kombat Group territory)',
      'Pong / Nong Prue villages',
      'Si Racha-Pattaya highway (Highway 7) for Bangkok access'
    ],
    starterPicks: 'If you\'re doing a 1-3 month training stay and want lower rent + serious training: rent a house near Mabprachan Lake, train at Sanit Sport Club or commute to Kombat Group, and use East Pattaya golf courses for cross-training.'
  },

  'sattahip': {
    accent: 'accent-yellow',
    summary: 'The quietest end. South of Jomtien toward U-Tapao Airport and the naval base. Dive operators, premium golf, Bang Saray, family-escape beaches.',
    intro: `<p>Sattahip is the southern district that includes Bang Saray, Na Jomtien, and the area around U-Tapao Pattaya International Airport. It\'s genuinely quiet — much less developed than Pattaya proper, with cleaner beaches, a working Royal Thai Navy base, and the kind of beachfront village pace that Pattaya hasn\'t had in 30 years.</p><p>For sport, this is the diving and golf end of Pattaya. The largest marina in Southeast Asia (Ocean Marina Yacht Club) is here. Several of the premium dive operators run trips from Bang Saray. Top-tier golf courses (Pattana Sports Resort, St. Andrews 2000, Chee Chan) are mid-Sattahip. And for families wanting a beach escape from Pattaya energy, Bang Saray and Sai Kaew are the quiet beach options.</p>`,
    bestFor: [
      { label: 'Diving', why: 'Bang Saray is the launching point for many dive trips. Pattaya Scuba Adventures, Seafari, Mermaid\'s Dive Center all operate from this area.' },
      { label: 'Premium golf', why: 'Pattana Sports Resort, St. Andrews 2000, Chatrium Golf Soi Dao, Chee Chan — top-tier courses within a 30-min drive.' },
      { label: 'Sailing & marina', why: 'Ocean Marina Yacht Club (largest in SE Asia), Royal Varuna Yacht Club. Sailing courses, charter, regattas.' },
      { label: 'Family beach escape', why: 'Bang Saray Beach and Sai Kaew Beach are 30-40 min from Central Pattaya but feel a decade older. Good for kids.' },
      { label: 'Airport-adjacent stays', why: 'U-Tapao Airport is in Sattahip. If you\'re flying into Pattaya for a sport-focused trip, Sattahip is a 10-min drive vs 60-min into Central Pattaya.' }
    ],
    transport: 'Sukhumvit south continues from Pattaya to Sattahip. U-Tapao airport access road. A car or motorbike is essential — baht-bus coverage here is thin to nonexistent. Buses to Sattahip run from Pattaya Klang and Bangkok.',
    landmarks: [
      'Bang Saray Beach (quiet village + beach)',
      'Sai Kaew Beach (military beach, public access, very clean)',
      'Ocean Marina Yacht Club',
      'U-Tapao Pattaya International Airport',
      'Royal Thai Navy base + Sattahip Naval Officers Club',
      'Khao Chi Chan Buddha Mountain (carved gold Buddha on a cliff)'
    ],
    starterPicks: 'If the trip is diving or golf, base in Bang Saray, dive from there, and use the proximity to the premium golf courses. If you\'re flying into U-Tapao for a Muay Thai trip and want a quiet start, spend the first 2 days in Sattahip before moving north to a Pattaya camp.'
  }
};

function areaPage(slug, label, venues) {
  const url = `${SITE}/area/${slug}/`;
  const title = `${label}, Pattaya — sport venues | Pattaya.Gym`;
  const desc = truncateDesc(`Every gym, Muay Thai camp, and sport venue in ${label}, Pattaya — ${venues.length} hand-checked entries with hours, prices and contact details. Independent directory, no paid placements.`);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Sport venues in ${label}`,
    numberOfItems: venues.length,
    itemListElement: venues.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/gyms/${v.id}/`,
      name: v.name
    }))
  };
  const crumbsLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: label }
    ], url)
  };
  const faqLd = areaFaqLd(slug, label);
  const faqHtml = areaFaqHtml(slug, label);
  const jsonLd = faqLd ? [itemList, crumbsLd, faqLd] : [itemList, crumbsLd];

  return head({ title, desc, url, jsonLd })
    + topMarquee(TOP_MARQUEE)
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: label }
      ])
    + `
<main id="main">

${(() => {
  const content = AREA_CONTENT[slug] || null;
  const accent = content ? content.accent : 'accent-cyan';
  // Top-3 sport categories in this area (by venue count)
  const catCounts = {};
  for (const v of venues) catCounts[v.category] = (catCounts[v.category] || 0) + 1;
  const topCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, count]) => ({ key, count, label: (CATEGORIES.find(c => c.key === key) || {}).label || key }));

  return `<section class="hero u-pt-10-pb-8">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Neighborhood · ${venues.length} venues · ${topCats.length} sports</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,10vw,120px); text-align:left;">
      <span class="${accent}">${esc(label)}.</span>
    </h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width:780px;">${content ? esc(content.summary) : `Every venue we track in <strong>${esc(label)}</strong>. ${venues.length} hand-checked entries across all sports.`}</p>
    <p class="hero-meta u-text-left">${venues.length} venues · ${esc(label)} · Pattaya · Updated ${TODAY}</p>
  </div>
</section>

${content ? `
<section class="section u-pt-0">
  <div class="wrap">
    <article class="venue-body" style="max-width:880px; margin:0;">
      <div class="eyebrow u-mb-3"><span class="num">01</span> About this neighborhood</div>
      <h2 class="h-section">What ${esc(label)} <span class="${accent}">is for.</span></h2>
      ${content.intro}
    </article>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> Best for</div>
    <h2 class="h-section">When to pick <span class="${accent}">${esc(label)}.</span></h2>
    <div class="numlist">
      ${content.bestFor.map((b, i) => `
      <div class="numcard">
        <div class="numcard-head">
          <span class="numcard-num">${String(i+1).padStart(2,'0')}</span>
          <h3 class="numcard-title">// ${esc(b.label)}</h3>
        </div>
        <p class="numcard-body">${esc(b.why)}</p>
      </div>
      `).join('')}
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap u-wrap-max">
    <article class="venue-body" style="max-width:880px; margin:0;">
      <div class="eyebrow u-mb-3"><span class="num">03</span> Transport &amp; access</div>
      <h2 class="h-section">How to <span class="accent-cyan">get there.</span></h2>
      <p>${esc(content.transport)}</p>

      <div class="eyebrow" style="margin:var(--s-6) 0 var(--s-3);"><span class="num">04</span> Landmarks &amp; orientation</div>
      <h2 class="h-section">Where you <span class="accent-yellow">are.</span></h2>
      <ul>${content.landmarks.map(l => `<li>${esc(l)}</li>`).join('')}</ul>

      <div class="eyebrow" style="margin:var(--s-6) 0 var(--s-3);"><span class="num">05</span> Starter pick</div>
      <h2 class="h-section">If you're <span class="accent-pink">new here.</span></h2>
      <p>${esc(content.starterPicks)}</p>
    </article>
  </div>
</section>
` : ''}

<section class="section u-pt-4">
  <div class="wrap">
    <div class="eyebrow"><span class="num">0${content ? '6' : '1'}</span> By sport</div>
    <h2 class="h-section">Sports in <span class="accent-mint">${esc(label)}.</span></h2>
    <p class="lede">Jump straight to the combined category-area page for any sport in ${esc(label)}.</p>
    <div class="btn-row" style="flex-wrap:wrap; gap:8px; margin-top:var(--s-4);">
      ${topCats.map(c => `<a href="/area/${slug}/${c.key}/" class="btn btn-ghost" style="font-size:13px;">${esc(c.label)} <span style="color:var(--muted); font-weight:400;">(${c.count})</span></a>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="padding-top:var(--s-6);">
  <div class="wrap">
    <div class="eyebrow"><span class="num">0${content ? '7' : '2'}</span> Every venue</div>
    <h2 class="h-section">All ${venues.length} venues in <span class="accent-yellow">${esc(label)}.</span></h2>
    <div class="numlist">
      ${venues.map((v, i) => {
        const cat = CATEGORIES.find(c => c.key === v.category);
        return `
      <a href="/gyms/${v.id}/" class="numcard u-plain-link">
        <div class="numcard-head">
          <span class="numcard-num">${String(i+1).padStart(2,'0')}</span>
          <h3 class="numcard-title">// ${esc(v.name)}</h3>
        </div>
        <p class="numcard-body">${cat ? `<strong class="u-text">${esc(cat.label)}</strong> · ` : ''}${esc(v.priceRange || '')}${v.hours ? ` · ${esc(v.hours)}` : ''}${v.description ? '<br>' + esc(v.description.slice(0, 180)) + ((v.description||'').length > 180 ? '…' : '') : ''}</p>
      </a>
      `;
      }).join('')}
      ${venues.length === 0 ? '<p class="u-muted">No venues currently listed in this area.</p>' : ''}
    </div>
  </div>
</section>

${(() => {
  // Round 19 — Codex F08.1: cross-link matrix to surface the category-area
  // combinations (e.g. /area/jomtien/muay-thai/). Without this block the 15
  // category-area pages were orphans in the link graph.
  const here = (slug || '').toLowerCase();
  const byCategory = {};
  for (const v of venues) {
    if (!v.category) continue;
    (byCategory[v.category] = byCategory[v.category] || []).push(v);
  }
  const sportLinks = CATEGORIES
    .filter(c => byCategory[c.key] && byCategory[c.key].length > 0)
    .map(c => `<a href="/area/${here}/${c.key}/" class="u-plain-link" style="display:inline-flex; align-items:center; gap:8px; padding:8px 14px; border:1px solid rgba(255,255,255,0.12); border-radius:999px; font-size:13px; background:rgba(255,255,255,0.02); transition:border-color var(--t-fast);"><span style="color:var(--cyan); font-weight:700;">${byCategory[c.key].length}</span> <span class="u-muted">${esc(c.label)}</span></a>`)
    .join('');
  return sportLinks ? `<section class="section u-pt-0"><div class="wrap"><div class="eyebrow"><span class="num">03</span> Browse this area by sport</div><h2 class="h-section">Every sport in <span class="accent-cyan">${esc(label)}.</span></h2><p class="lede">Each tag below opens a focused page listing every venue of that sport in ${esc(label)}.</p><div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:var(--s-5);">${sportLinks}</div></div></section>` : '';
})()}
${faqHtml}
</main>`;
})()}
`
    + paNetwork()
    + bottomMarquee(BOTTOM_MARQUEE)
    + footer();
}

// ---------- Combined category-area landing page ----------
// URL: /area/<area-slug>/<category-key>/
// Targets long-tail queries like "Muay Thai in Jomtien Pattaya".
function categoryAreaPage(areaSlug, areaLabel, cat, venues) {
  const url = `${SITE}/area/${areaSlug}/${cat.key}/`;
  const catLabel = cat.label;
  const core = `${catLabel} in ${areaLabel}, Pattaya`;
  const title = core.length <= 49 ? `${core} | Pattaya.Gym` : truncateTitle(core);
  const desc = truncateDesc(`Every ${catLabel.toLowerCase()} venue in ${areaLabel}, Pattaya — ${venues.length} hand-checked ${venues.length === 1 ? 'option' : 'options'} with hours, prices and contact details. Independent directory, no paid placements, verified on a rolling schedule.`);

  const accentColors = {
    'muay-thai':'accent-pink','mma':'accent-pink','bjj':'accent-pink',
    'fitness':'accent-yellow','crossfit':'accent-yellow',
    'golf':'accent-mint',
    'yoga':'accent-cyan','racquet':'accent-cyan','swimming':'accent-cyan','watersports':'accent-cyan',
    'climbing':'accent-mint','clubs':'accent-mint','kids-youth':'accent-yellow',
    'equestrian':'accent-mint','adventure':'accent-mint'
  };
  const accent = accentColors[cat.key] || 'accent-pink';

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${catLabel} in ${areaLabel}, Pattaya`,
    numberOfItems: venues.length,
    itemListElement: venues.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/gyms/${v.id}/`,
      name: v.name
    }))
  };
  const crumbsLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: areaLabel, href: `/area/${areaSlug}/` },
      { label: catLabel }
    ], url)
  };
  const jsonLd = [itemList, crumbsLd];

  return head({ title, desc, url, jsonLd })
    + topMarquee(TOP_MARQUEE)
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: areaLabel, href: `/area/${areaSlug}/` },
        { label: catLabel }
      ])
    + `
<main id="main">

<section class="hero u-pt-10-pb-8">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// ${esc(catLabel)} · ${esc(areaLabel)} · ${venues.length} venue${venues.length === 1 ? '' : 's'}</div>
    <h1 class="hero-h1 u-h-fluid-sm">
      <span class="${accent}">${esc(catLabel)}</span><br>
      <span style="color:var(--text-2); font-weight:600;">in ${esc(areaLabel)}.</span>
    </h1>
    <p class="hero-lede u-text-left-ml0">${venues.length} hand-checked <strong>${esc(catLabel.toLowerCase())}</strong> ${venues.length === 1 ? 'venue' : 'venues'} in <strong>${esc(areaLabel)}, Pattaya</strong>. No paid placements. Verified on a rolling schedule. The complete local list.</p>
    <p class="hero-meta u-text-left">${venues.length} venues · ${esc(areaLabel)} · Pattaya · Updated ${TODAY}</p>
    <div class="btn-row u-mt-5">
      <a href="/category/${cat.key}/" class="btn btn-secondary">● All ${esc(catLabel.toLowerCase())} in Pattaya</a>
      <a href="/area/${areaSlug}/" class="btn btn-tertiary">All ${esc(areaLabel)} venues →</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> The list</div>
    <h2 class="h-section">Every ${esc(catLabel.toLowerCase())} venue in <span class="${accent}">${esc(areaLabel)}.</span></h2>
    <div class="numlist">
      ${venues.map((v, i) => `
      <a href="/gyms/${v.id}/" class="numcard u-plain-link">
        <div class="numcard-head">
          <span class="numcard-num">${String(i+1).padStart(2,'0')}</span>
          <div class="numcard-title">// ${esc(v.name)}</div>
        </div>
        <p class="numcard-body"><strong class="u-text">${esc(v.priceRange || '')}</strong>${v.hours ? ` · ${esc(v.hours)}` : ''}${v.description ? '<br>' + esc(v.description.slice(0, 180)) + ((v.description||'').length > 180 ? '…' : '') : ''}</p>
      </a>
      `).join('')}
      ${venues.length === 0 ? `<p class="u-muted">No ${esc(catLabel.toLowerCase())} venues currently listed in ${esc(areaLabel)}. Try <a href="/category/${cat.key}/" class="u-cyan">all ${esc(catLabel.toLowerCase())} in Pattaya</a> or <a href="/area/${areaSlug}/" class="u-cyan">all venues in ${esc(areaLabel)}</a>.</p>` : ''}
    </div>
  </div>
</section>

<section class="section u-pt-4">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> Browse more</div>
    <h2 class="h-section">Looking elsewhere in <span class="accent-cyan">Pattaya?</span></h2>
    <p class="lede">Browse this sport in other neighborhoods, or explore everything ${esc(areaLabel)} offers.</p>
    <div class="btn-row">
      <a href="/category/${cat.key}/" class="btn btn-primary">▶ All ${esc(catLabel)} in Pattaya</a>
      <a href="/area/${areaSlug}/" class="btn btn-secondary">● All sports in ${esc(areaLabel)}</a>
      <a href="/search/?cat=${cat.key}" class="btn btn-tertiary">Filter search →</a>
    </div>
  </div>
</section>

</main>
`
    + paNetwork()
    + bottomMarquee(BOTTOM_MARQUEE)
    + footer();
}

// ---------- Utility / info page ----------
function utilityPage({ slug, title, desc, eyebrow, headlineLead, headlineAccent, accentClass, lede, bodyHtml, showContactCard = false, robots }) {
  const url = `${SITE}/${slug}/`;
  const robotsMeta = robots || (slug === '404' ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  // Pick a sensible @type per known slug
  const pageType = ({ 'about':'AboutPage', 'contact':'ContactPage', 'methodology':'AboutPage', 'press':'WebPage', 'add-your-gym':'WebPage', 'colophon':'AboutPage', 'pattaya-sport-stats':'WebPage', '404':'WebPage' })[slug] || 'WebPage';
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': pageType,
    '@id': `${url}#webpage`,
    url: url,
    name: title,
    description: desc,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE}/#website` }
  };
  const crumbsLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: eyebrow }
    ], url)
  };
  const utilJsonLd = [webPageLd, crumbsLd];
  // E-E-A-T: Person schema for Tim on the /about/ page (operator + author of every guide).
  if (slug === 'about') {
    utilJsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${SITE}/about/#tim-paemi`,
      name: 'Tim Paemi',
      jobTitle: 'Operator & founding editor',
      url: `${SITE}/about/`,
      worksFor: { '@id': `${SITE}/#organization` },
      knowsAbout: ['Muay Thai', 'Pattaya', 'Fitness', 'Sport tourism Thailand', 'Local directory editorial'],
      sameAs: [
        'https://pattaya-authority.com/',
        'https://timpaemi.com/',
        'https://pattaya-restaurant-guide.com/',
        'https://pattayavisahelp.com/',
        'https://pattaya-school-guide.com/',
        'https://pattaya-coffee.com/',
        'https://pattayastream.com/',
        'https://pattaya-medical.com/',
        'https://pattayapets.com/',
        'https://pattaya-vehicle-rentals.com/'
      ]
    });
  }

  const contactBlock = showContactCard ? `
<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Talk to us</div>
    <h2 class="h-section">Reach us <span class="accent-mint">direct.</span></h2>
    <div class="channels-grid">
      <a href="mailto:info@pattaya-gym.com" class="channel-card is-email">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// Email</div>
        <h3 class="channel-card-name">info@pattaya-gym.com</h3>
        <div class="channel-card-sub">Reply within 24h</div>
      </a>
      <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=Hi%21%20I%27m%20reaching%20out%20via%20pattaya-gym.com" target="_blank" rel="noopener noreferrer" class="channel-card is-wa">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Fastest</div>
        <h3 class="channel-card-name">whatsapp</h3>
        <div class="channel-card-sub">+66 96 728 6999</div>
      </a>
      <a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer" class="channel-card is-line">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// LINE</div>
        <h3 class="channel-card-name">@timpaemi</h3>
        <div class="channel-card-sub">Daily check</div>
      </a>
      <a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer" class="channel-card is-agency">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Our agency</div>
        <h3 class="channel-card-name">pattaya authority</h3>
        <div class="channel-card-sub">pattaya-authority.com</div>
      </a>
    </div>
  </div>
</section>` : '';

  return head({ title, desc, url, jsonLd: utilJsonLd, robots: robotsMeta })
    + topMarquee(TOP_MARQUEE)
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: eyebrow }
      ])
    + `
<main id="main">

<section class="hero u-pt-10-pb-8">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// ${esc(eyebrow)}</div>
    <h1 class="hero-h1 u-h-fluid">
      ${esc(headlineLead)}<br>
      <span class="${accentClass}">${esc(headlineAccent)}.</span>
    </h1>
    <p class="hero-lede u-lede-h">${lede}</p>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <article class="venue-body" style="max-width:760px; margin:0;">
      ${bodyHtml}
    </article>
  </div>
</section>

${contactBlock}

</main>
`
    + paNetwork()
    + bottomMarquee(BOTTOM_MARQUEE)
    + footer();
}

// ---------- Pattaya Sport Stats dashboard body builder ----------
// Round 15: real interactive-feeling dashboard with server-rendered SVG.
// No JS, no charting library, no external deps. Pure inline SVG from GYMS data.
function buildSportStatsBody() {
  // === Compute stats from data ===
  const total = GYMS.length;
  const catCounts = {};
  for (const g of GYMS) catCounts[g.category] = (catCounts[g.category] || 0) + 1;
  const catRows = CATEGORIES
    .map(c => ({ key: c.key, label: c.label, count: catCounts[c.key] || 0 }))
    .sort((a, b) => b.count - a.count);

  const areaCounts = {};
  for (const slug of Object.keys(AREA_MAP)) areaCounts[slug] = 0;
  let unmappedArea = 0;
  for (const g of GYMS) {
    const s = areaSlugFor(g.area);
    if (s) areaCounts[s]++; else unmappedArea++;
  }
  const areaRows = Object.keys(AREA_LABELS)
    .map(s => ({ slug: s, label: AREA_LABELS[s], count: areaCounts[s] }))
    .sort((a, b) => b.count - a.count);

  const priceCounts = { '฿': 0, '฿฿': 0, '฿฿฿': 0, '฿฿฿฿': 0, '—': 0 };
  for (const g of GYMS) {
    const p = g.priceRange || '—';
    if (priceCounts[p] !== undefined) priceCounts[p]++; else priceCounts['—']++;
  }

  const today = new Date();
  let fresh30 = 0, fresh60 = 0, older = 0;
  for (const g of GYMS) {
    if (!g.verified) { older++; continue; }
    const age = Math.round((today.getTime() - new Date(g.verified).getTime()) / 86400000);
    if (age <= 30) fresh30++;
    else if (age <= 60) fresh60++;
    else older++;
  }

  const phoneCount = GYMS.filter(g => g.phone && g.phone.length > 4).length;
  const websiteCount = GYMS.filter(g => g.website && g.website.length > 8).length;
  let geoCount = 0;
  try {
    const geoMap = VENUE_GEO || {};
    geoCount = GYMS.filter(g => geoMap[g.id] && geoMap[g.id].lat).length;
  } catch (e) { geoCount = 0; }
  const detailCount = GYMS.filter(g => g.detailFile).length;
  const sourcesCount = 0; // editorial — would need to parse each MD; leave for now

  // === Chart helpers ===
  const ACCENT_COLORS = ['#ff2e7e', '#4ee0ff', '#fde047', '#5fffa0', '#ff3d3d', '#a855f7', '#22d3ee', '#f97316', '#eab308', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#06b6d4'];
  function pct(n, d) { return d > 0 ? Math.round((n / d) * 100) : 0; }
  function bar(value, max, w, color) {
    const px = Math.max(2, Math.round((value / max) * w));
    return `<rect x="0" y="0" width="${px}" height="22" rx="3" fill="${color}"/>`;
  }

  // Horizontal bar chart for categories
  const catChartMax = Math.max(...catRows.map(r => r.count));
  const catChartHTML = `
<svg viewBox="0 0 600 ${catRows.length * 32 + 10}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Venues by sport category" style="width:100%; height:auto; max-width:600px; display:block; margin:0 auto;">
  ${catRows.map((r, i) => `
  <g transform="translate(180, ${i * 32 + 5})">
    <text x="-10" y="16" text-anchor="end" font-family="Inter, sans-serif" font-size="13" fill="#c4c4c4" font-weight="500">${esc(r.label)}</text>
    ${bar(r.count, catChartMax, 320, ACCENT_COLORS[i % ACCENT_COLORS.length])}
    <text x="${Math.max(2, Math.round((r.count / catChartMax) * 320)) + 8}" y="16" font-family="Inter, sans-serif" font-size="13" fill="#f5f5f5" font-weight="700">${r.count}</text>
  </g>`).join('')}
</svg>`;

  // Horizontal bar chart for areas
  const areaChartMax = Math.max(...areaRows.map(r => r.count));
  const areaChartHTML = `
<svg viewBox="0 0 600 ${areaRows.length * 36 + 10}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Venues by area" style="width:100%; height:auto; max-width:600px; display:block; margin:0 auto;">
  ${areaRows.map((r, i) => `
  <g transform="translate(220, ${i * 36 + 5})">
    <text x="-10" y="18" text-anchor="end" font-family="Inter, sans-serif" font-size="14" fill="#c4c4c4" font-weight="500">${esc(r.label)}</text>
    <rect x="0" y="2" width="${Math.max(2, Math.round((r.count / areaChartMax) * 280))}" height="26" rx="3" fill="${ACCENT_COLORS[(i + 1) % ACCENT_COLORS.length]}"/>
    <text x="${Math.max(2, Math.round((r.count / areaChartMax) * 280)) + 8}" y="20" font-family="Inter, sans-serif" font-size="14" fill="#f5f5f5" font-weight="700">${r.count}</text>
  </g>`).join('')}
</svg>`;

  // Donut for price tier distribution
  const priceEntries = Object.entries(priceCounts).filter(([k, v]) => v > 0);
  const priceTotal = priceEntries.reduce((s, [, v]) => s + v, 0);
  let priceCumulative = 0;
  const priceColors = { '฿': '#5fffa0', '฿฿': '#4ee0ff', '฿฿฿': '#fde047', '฿฿฿฿': '#ff2e7e', '—': '#666' };
  const donutR = 65;
  const donutCirc = 2 * Math.PI * donutR;
  const donutPaths = priceEntries.map(([tier, n]) => {
    const dash = (n / priceTotal) * donutCirc;
    const offset = priceCumulative;
    priceCumulative += dash;
    return `<circle cx="100" cy="100" r="${donutR}" fill="none" stroke="${priceColors[tier]}" stroke-width="26" stroke-dasharray="${dash} ${donutCirc - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 100 100)" />`;
  }).join('');
  const donutHTML = `
<div style="display:grid; grid-template-columns:1fr; gap:var(--s-4); align-items:center; justify-items:center;">
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Venues by price tier" style="width:200px; height:200px;">
    ${donutPaths}
    <text x="100" y="98" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="32" font-weight="700" fill="#f5f5f5">${total}</text>
    <text x="100" y="120" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#888" letter-spacing="2">VENUES</text>
  </svg>
  <ul style="list-style:none; padding:0; margin:0; display:grid; grid-template-columns:1fr; gap:8px; font-family:var(--font-mono); font-size:12px;">
    ${priceEntries.map(([tier, n]) => `<li style="display:flex; align-items:center; gap:10px;"><span style="display:inline-block; width:14px; height:14px; border-radius:3px; background:${priceColors[tier]};"></span> <strong class="u-text">${tier}</strong> <span class="u-muted">${n} venues · ${pct(n, priceTotal)}%</span></li>`).join('')}
  </ul>
</div>`;

  // Schema completeness gauges
  function gauge(label, n, total, color) {
    const p = pct(n, total);
    const dash = (p / 100) * 314.16;
    return `<div style="text-align:center;">
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="width:100px; height:100px;">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${dash} 314.16" transform="rotate(-90 60 60)"/>
        <text x="60" y="58" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="24" font-weight="700" fill="#f5f5f5">${p}%</text>
        <text x="60" y="76" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#888">${n}/${total}</text>
      </svg>
      <p style="font-family:var(--font-mono); font-size:11px; color:var(--muted); margin:8px 0 0; letter-spacing:0.06em; text-transform:uppercase;">${esc(label)}</p>
    </div>`;
  }

  return `
<h2>Top-line</h2>
<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:16px; margin:var(--s-5) 0;">
  <div style="background:rgba(255,46,126,0.08); border:1px solid rgba(255,46,126,0.25); border-radius:14px; padding:20px;"><div style="font-family:Space Grotesk, sans-serif; font-size:36px; font-weight:700; color:#ff2e7e;">${total}</div><div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:4px;">Venues hand-checked</div></div>
  <div style="background:rgba(78,224,255,0.08); border:1px solid rgba(78,224,255,0.25); border-radius:14px; padding:20px;"><div style="font-family:Space Grotesk, sans-serif; font-size:36px; font-weight:700; color:#4ee0ff;">${CATEGORIES.length}</div><div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:4px;">Sport categories</div></div>
  <div style="background:rgba(253,224,71,0.08); border:1px solid rgba(253,224,71,0.25); border-radius:14px; padding:20px;"><div style="font-family:Space Grotesk, sans-serif; font-size:36px; font-weight:700; color:#fde047;">${Object.keys(AREA_LABELS).length}</div><div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:4px;">Geographic areas</div></div>
  <div style="background:rgba(95,255,160,0.08); border:1px solid rgba(95,255,160,0.25); border-radius:14px; padding:20px;"><div style="font-family:Space Grotesk, sans-serif; font-size:36px; font-weight:700; color:#5fffa0;">0</div><div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:4px;">Paid placements</div></div>
</div>

<h2>Venues by sport</h2>
<p>Every one of the 15 sport categories has at least one venue. Muay Thai dominates by count — Pattaya has one of the world's largest concentrations of authentic Muay Thai gyms, from Sityodtong-lineage traditional camps to Fairtex-style premium resorts.</p>
${catChartHTML}

<h2>Venues by neighborhood</h2>
<p>Six distinct Pattaya neighborhoods, each with its own training character. Click any area for a full neighborhood guide.</p>
${areaChartHTML}

<h2>Price tier distribution</h2>
<p>Pattaya covers every price band — from ฿100/day Tony's Gym to ฿฿฿฿ Royal Cliff Fitz Club. Strong middle-market: most venues sit at ฿฿ or ฿฿฿ tier.</p>
${donutHTML}

<h2>Verification freshness</h2>
<p>Every venue has a <strong>verified date</strong> — the last time we hand-checked hours, prices, and operating status. Target: re-verify the full directory every 30 days. Current breakdown:</p>
<ul style="font-family:var(--font-mono); font-size:14px;">
  <li><strong style="color:#5fffa0;">${fresh30}</strong> venues verified within 30 days <span class="u-muted">(${pct(fresh30, total)}% of directory)</span></li>
  <li><strong style="color:#fde047;">${fresh60}</strong> venues verified 30-60 days ago</li>
  <li><strong style="color:#ff3d3d;">${older}</strong> venues older than 60 days <span class="u-muted">(refresh queue)</span></li>
</ul>

<h2>Schema completeness</h2>
<p>Machine-readable completeness — how much of each venue's data is structured. Higher = better Google rich-result eligibility and easier AI search extraction.</p>
<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:24px; margin:var(--s-5) 0; justify-items:center;">
  ${gauge('Body content', detailCount, total, '#5fffa0')}
  ${gauge('Geo coordinates', geoCount, total, '#4ee0ff')}
  ${gauge('Phone number', phoneCount, total, '#fde047')}
  ${gauge('Website', websiteCount, total, '#ff2e7e')}
</div>

<h2>What's <em>not</em> here</h2>
<p>Pattaya.Gym focuses exclusively on training venues — gyms, camps, courts, courses, studios, dive operators, sport landmarks. We do <strong>not</strong> cover entertainment venues, restaurants, nightlife, or visa services. For those, see our sister sites:</p>
<ul>
  <li><a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a> &mdash; flagship media agency</li>
  <li><a href="https://timpaemi.com/" target="_blank" rel="noopener noreferrer">TimPaemi</a> &mdash; parent brand</li>
  <li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya Restaurant Guide</a> &mdash; independent restaurant directory</li>
  <li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a> &mdash; long-stay visa support</li>
  <li><a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a> &mdash; independent school directory</li>
  <li><a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">Pattaya Coffee</a> &mdash; independent coffee directory</li>
  <li><a href="https://pattayastream.com/" target="_blank" rel="noopener noreferrer">Pattaya Villa Stream</a> &mdash; Pattaya content channel</li>
  <li><a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a> &mdash; Pattaya medical directory</li>
  <li><a href="https://pattayapets.com/" target="_blank" rel="noopener noreferrer">PattayaPets</a> &mdash; Pattaya pet services directory</li>
  <li><a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a> &mdash; Pattaya car & bike rental directory</li>
</ul>

<h2>About these numbers</h2>
<p>This page is regenerated on every site build from <a href="/api/venues.json">live data</a>. The numbers update automatically — no manual edits. Machine-readable equivalent at <a href="/status.json">/status.json</a>. Full methodology at <a href="/methodology/">/methodology/</a>.</p>
`;
}

const UTILITY_PAGES = [
  {
    slug: 'about',
    title: 'About Pattaya.Gym — Independent, hand-checked directory',
    desc: 'Pattaya.Gym is the most complete directory of gyms, Muay Thai camps, and sport venues in Pattaya. Independent. Hand-checked. No paid placements.',
    eyebrow: 'About',
    headlineLead: 'Independent.',
    headlineAccent: 'One purpose',
    accentClass: 'accent-pink',
    lede: 'Pattaya.Gym is the most complete directory of gyms, Muay Thai camps, and sport venues in Pattaya, Thailand. Every venue is independently researched and source-cited. No paid placements. No fake reviews. No SEO spam.',
    showContactCard: true,
    bodyHtml: `
<h2>Why this site exists</h2>
<p>Most directories you find for Pattaya gyms are scraped, paid-for, or both. Search results are dominated by sites that have never set foot in any of the venues they rank.</p>
<p>Pattaya.Gym is the opposite. Every venue is researched from public sources, official channels, and on-the-ground local knowledge. We cross-check hours, phone numbers, and locations against each venue's own listings wherever they are published — and where a detail cannot be confirmed yet, we flag it for follow-up rather than guessing. When a venue closes or changes hands, the page is updated as soon as we hear about it.</p>

<h2>How venues are ranked</h2>
<p>No money changes hands. Ranking is based on consistent quality, current operation, breadth of facility, instructor caliber, and community reputation. Gyms with closed doors or stale information get demoted automatically.</p>

<h2>What we operate</h2>
<p>Pattaya.Gym is part of the independent TimPaemi / Pattaya Authority network of Pattaya publications operated by <strong>TimPaemi Co., Ltd.</strong>. The full network: <a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a>, <a href="https://timpaemi.com/" target="_blank" rel="noopener noreferrer">TimPaemi</a>, <a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya Restaurant Guide</a>, <a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a>, <a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a>, <a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">Pattaya Coffee</a>, <a href="https://pattayastream.com/" target="_blank" rel="noopener noreferrer">Pattaya Villa Stream</a>, <a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a>, <a href="https://pattayapets.com/" target="_blank" rel="noopener noreferrer">PattayaPets</a>, and <a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a>. The agency funds the directories. The directories don't take money from listed venues. That's how the independence stays real.</p>

<h2>Who runs this</h2>
<p>Pattaya.Gym is operated by <strong>Tim Paemi</strong>, an independent operator and long-time Pattaya resident, alongside his wife and co-founder. The site is self-funded and has no commercial relationship with any listed venue.</p>

<h2>Editorial policy</h2>
<ul>
<li>If a venue closes, gets new ownership, or changes hours, the page is updated as soon as we hear about it.</li>
<li>If a venue refuses to respond to verification requests over 30 days, it gets marked stale and ranking-suppressed.</li>
<li>No sponsored placements. No affiliate links to listed venues. No commission on bookings.</li>
<li>Editorial reviews and rankings reflect merit, not budget.</li>
</ul>
`
  },
  {
    slug: 'contact',
    title: 'Contact Pattaya.Gym — Email, WhatsApp, LINE',
    desc: 'Three ways to reach Pattaya.Gym. Email info@pattaya-gym.com, WhatsApp +66 96 728 6999, or LINE @timpaemi. We reply to every message personally.',
    eyebrow: 'Contact',
    headlineLead: 'Reach us',
    headlineAccent: 'direct',
    accentClass: 'accent-mint',
    lede: 'Three ways to reach us. We reply to every message personally, usually within 24h. No bots. No auto-responders. Real humans in Pattaya.',
    showContactCard: true,
    bodyHtml: `
<h2>What we can help with</h2>
<ul>
<li>Recommending the right gym for your level, sport, and budget</li>
<li>Verifying current hours, pricing, or coach roster at any listed venue</li>
<li>Adding your gym, camp, or sport venue to the directory — free, no fees</li>
<li>Correcting outdated information on any venue page</li>
<li>Press, partnership, or media inquiries</li>
</ul>

<h2>What we won't do</h2>
<p>We don't book classes for you, take payment, or operate as an intermediary. You contact the gym directly — we just help you find the right one. No commission on bookings. No affiliate kickbacks.</p>

<h2>Response times</h2>
<ul>
<li><strong>WhatsApp:</strong> fastest — usually within 1–4h during Pattaya daytime hours (GMT+7)</li>
<li><strong>LINE:</strong> daily check, typically same-day reply</li>
<li><strong>Email:</strong> within 24h, often much faster</li>
</ul>

<h2>Where we are</h2>
<p>Operated from our villa in Pattaya City, Bang Lamung District, Chonburi 20150, Thailand. Coordinates 12.92°N, 100.87°E.</p>
`
  },
  {
    slug: 'methodology',
    title: 'Methodology — How Pattaya.Gym verifies venues',
    desc: 'The full research methodology behind Pattaya.Gym. How venues are sourced, verified, ranked, and updated. No paid placements. No scraping.',
    eyebrow: 'Methodology',
    headlineLead: 'How we',
    headlineAccent: 'verify',
    accentClass: 'accent-cyan',
    lede: 'The full research methodology behind every entry. How venues are sourced, verified, ranked, and kept current. Transparency over polish.',
    showContactCard: false,
    bodyHtml: `
<h2>Sourcing</h2>
<p>We source venues from a mix of local knowledge, on-foot exploration, community recommendations, and English/Thai search. Every entry traces back to at least one of:</p>
<ul>
<li>Direct visit by us or a trusted local</li>
<li>Verified primary source (the venue's own website or social, dated within 12 months)</li>
<li>Community recommendation from a long-term Pattaya resident</li>
</ul>
<p>We do <strong>not</strong> scrape Google Maps, TripAdvisor, or other directories without verification.</p>

<h2>Verification</h2>
<p>Each venue is checked for:</p>
<ul>
<li><strong>Is it open?</strong> — phone or in-person confirmation</li>
<li><strong>Stated hours match reality</strong> — cross-checked with current customers when possible</li>
<li><strong>Price tier accurate</strong> — entry-level pricing confirmed via published rate or direct quote</li>
<li><strong>Category appropriate</strong> — venue actually does the sport it claims</li>
<li><strong>Quality of facility</strong> — equipment, cleanliness, instructor presence</li>
</ul>

<h2>Ranking</h2>
<p>Within a category, venues rank by composite score: facility depth, instructor caliber, customer feedback signal, longevity, breadth of programs offered, and operational reliability (how often doors are open as advertised). No paid weighting.</p>

<h2>Updates</h2>
<p>A verified date appears on every venue page. Re-verification is rolling rather than rigid: priority queue first (popular venues, recent reports, venues that have moved or changed format), background queue second. When we hear of a closure or major change we re-check and update as fast as we reasonably can — typically within days, never longer than a couple of weeks. If we can't reach a venue across 30 days of attempts, it's marked stale and ranking-suppressed. Public reports of errors or closures can be sent to <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a>.</p>

<h2>Removals</h2>
<p>Venues are removed when:</p>
<ul>
<li>Permanent closure confirmed</li>
<li>Operations relocated outside Pattaya / Eastern Seaboard</li>
<li>Owner explicitly requests removal in writing</li>
</ul>
`
  },
  {
    slug: 'press',
    title: 'Press — Pattaya.Gym media kit and contact',
    desc: 'Press, media, and partnership inquiries for Pattaya.Gym and the TimPaemi Co. agency network.',
    eyebrow: 'Press',
    headlineLead: 'Press &',
    headlineAccent: 'media',
    accentClass: 'accent-yellow',
    lede: 'Press, media, and partnership inquiries for Pattaya.Gym and the broader TimPaemi Co. agency network.',
    showContactCard: true,
    bodyHtml: `
<h2>The agency</h2>
<p>Pattaya.Gym is one of four projects operated by <strong>TimPaemi Co., Ltd.</strong>, a Pattaya-based agency focused on long-term local market positioning.</p>

<h2>Sister projects</h2>
<ul>
<li><a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer"><strong>Pattaya Authority</strong></a> — flagship nightlife agency, one of the leading operators in Pattaya. Brand strategy, content production, venue partnerships.</li>
<li><strong>Pattaya.Gym</strong> (this site) — fitness directory. Every gym, every camp, every court in Pattaya.</li>
<li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer"><strong>Pattaya Restaurant Guide</strong></a> — independent restaurant guide. Editorial reviews, real visits, honest takes.</li>
<li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer"><strong>Pattaya Visa Help</strong></a> — visa and long-stay support for foreigners in Pattaya.</li>
</ul>

<h2>Reach</h2>
<ul>
<li>5M+ combined social followers across the agency network</li>
<li>500M+ total platform views across YouTube, TikTok, Instagram, Facebook</li>
<li>60+ social media accounts under cross-platform automation</li>
<li>Live streams 6–8 hours per night from our Pattaya villa</li>
</ul>

<h2>Press inquiries</h2>
<p>For interviews, partnership briefings, agency-level engagements, or media access — email <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a> with subject line beginning "Press:" and we'll route appropriately within 24h.</p>
`
  },
  {
    slug: 'add-your-gym',
    title: 'Add your gym to Pattaya.Gym — free listing',
    desc: 'Get your gym, camp, or sport venue listed on Pattaya.Gym. Free. No fees. No commission. Send us the details and we verify.',
    eyebrow: 'Add your gym',
    headlineLead: 'List your',
    headlineAccent: 'venue',
    accentClass: 'accent-pink',
    lede: 'Get your gym, camp, or sport venue added to Pattaya.Gym. Free. No fees. No commission. Send us the details — we verify and publish.',
    showContactCard: true,
    bodyHtml: `
<h2>What we need from you</h2>
<ul>
<li><strong>Venue name</strong> — exactly as you want it displayed</li>
<li><strong>Category</strong> — what sport(s) you cover</li>
<li><strong>Address</strong> — full street address + Google Maps link if possible</li>
<li><strong>Hours</strong> — current operating schedule, weekday and weekend</li>
<li><strong>Price range</strong> — drop-in fee, weekly pass, monthly membership</li>
<li><strong>Contact</strong> — phone, email, website, social media handles</li>
<li><strong>1-3 sentence description</strong> — what makes you different</li>
</ul>

<h2>What happens next</h2>
<ol>
<li>We verify the venue exists, hours are accurate, and contact info works</li>
<li>We visit or call to confirm — typically within a few days, never longer than two weeks</li>
<li>We write a neutral entry based on our verification, not your marketing copy</li>
<li>The page goes live with a "verified" date</li>
<li>We re-verify every 90 days going forward</li>
</ol>

<h2>What we charge</h2>
<p><strong>Nothing.</strong> Listings are free. We do not accept money for placement, ranking, or featured status. The agency network funds the directory, not the venues.</p>

<h2>What we won't do</h2>
<ul>
<li>Publish marketing copy verbatim — we write neutral entries</li>
<li>Boost ranking for payment — ranking reflects merit only</li>
<li>Hide negative info — if something's outdated, broken, or sketchy, we say so</li>
<li>Cross-promote unrelated businesses</li>
</ul>

<p class="u-mt-6"><strong>Send the details to <a href="mailto:info@pattaya-gym.com?subject=Add%20my%20gym">info@pattaya-gym.com</a></strong> or WhatsApp <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=Hi%21%20I%20want%20to%20add%20my%20gym%20to%20pattaya-gym.com" target="_blank" rel="noopener noreferrer">+66 96 728 6999</a> with "Add my gym" in the message.</p>
`
  },
  {
    slug: 'colophon',
    title: 'Colophon — How Pattaya.Gym is built',
    desc: 'The technical setup behind Pattaya.Gym. Static HTML, Node.js build, Cloudflare Pages. Built in-house by the founders of TimPaemi.',
    eyebrow: 'Colophon',
    headlineLead: 'How this',
    headlineAccent: 'is built',
    accentClass: 'accent-mint',
    lede: 'The technical and editorial setup behind Pattaya.Gym. No frameworks, no CMS, no bloat. Just markdown content rendered by a small Node.js build script.',
    showContactCard: false,
    bodyHtml: `
<h2>Stack</h2>
<ul>
<li><strong>Content:</strong> Markdown files with YAML frontmatter, one per venue</li>
<li><strong>Build:</strong> Node.js script (no dependencies) that reads markdown and emits static HTML</li>
<li><strong>Styling:</strong> Single CSS file with native CSS custom properties — no frameworks</li>
<li><strong>Hosting:</strong> Cloudflare Pages, deployed automatically from GitHub on every push</li>
<li><strong>Domain:</strong> pattaya-gym.com — registered direct, DNS via Cloudflare</li>
<li><strong>Analytics:</strong> Google Analytics 4 — aggregate traffic measurement only, no advertising features, no demographic/Signals profiles, shortest available retention; see <a href="/privacy/">/privacy/</a> for full cookie and localStorage details</li>
</ul>

<h2>Typography</h2>
<ul>
<li><strong>Display:</strong> Space Grotesk — for headlines and brand</li>
<li><strong>Body:</strong> Inter — for paragraphs and UI</li>
<li><strong>Mono:</strong> JetBrains Mono — for labels, marquees, and metadata</li>
</ul>

<h2>Colors</h2>
<p>Pure black background. Five accent colors: hot pink, cyan, yellow, mint, red. White for primary text, muted grays for hierarchy. No gradients except the multi-color brand identity.</p>

<h2>Performance</h2>
<ul>
<li>Static HTML files — no server-side rendering, no database queries</li>
<li>One CSS file, one font request, zero blocking JavaScript</li>
<li>Cloudflare CDN — global edge caching</li>
<li>Sub-2-second LCP on mobile 4G in most regions</li>
</ul>

<h2>Open source</h2>
<p>The site source lives on GitHub. The content (venue markdown) is curated by us and not currently open. The build script is small and could be adapted — get in touch if you're building something similar.</p>

<h2>Built by</h2>
<p>Site engineered, operated, and maintained in-house by the founders of TimPaemi Co., Ltd. — Pattaya, Thailand.</p>
`
  },
  {
    slug: 'pattaya-sport-stats',
    title: `Pattaya sport stats — ${VENUE_N} venues across 15 sports`,
    desc: `The numbers behind Pattaya as a training destination. ${VENUE_N} hand-checked venues, 15 sports, 6 areas. Verified on a rolling schedule.`,
    eyebrow: 'Stats',
    headlineLead: 'Pattaya',
    headlineAccent: 'by the numbers',
    accentClass: 'accent-yellow',
    lede: `The training landscape of Pattaya in numbers. ${VENUE_N} hand-checked venues across 15 sports and 6 distinct areas. One of the world's deepest single-city Muay Thai scenes.`,
    showContactCard: false,
    bodyHtml: buildSportStatsBody()
  },
  {
    // Round 17 — Codex F20.1 fix. GA + localStorage + AI crawlers are live but no
    // privacy disclosure existed. This page documents what we collect, how long
    // we keep it, and how EU/UK/Thai readers can exercise their rights.
    slug: 'privacy',
    title: 'Privacy policy — Pattaya.Gym',
    desc: 'How Pattaya.Gym handles visitor data: Google Analytics, localStorage, AI crawler access, and your GDPR/PDPA rights. Independent, no advertising, no resale.',
    eyebrow: 'Privacy',
    headlineLead: 'Your data,',
    headlineAccent: 'plain English',
    accentClass: 'accent-mint',
    lede: 'Pattaya.Gym is an independent directory. We sell no ads, we share no profiles, and we keep our data collection minimal. Here is exactly what happens when you visit.',
    showContactCard: false,
    bodyHtml: `
<p><strong>Last updated:</strong> 2026-05-18. <strong>Operator:</strong> TimPaemi Co., Ltd., Pattaya City, Thailand. <strong>Contact:</strong> <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a>.</p>

<h2>What we collect, in plain English</h2>
<p>We collect three classes of data and nothing else:</p>
<ol>
<li><strong>Aggregate analytics (Google Analytics 4).</strong> Page views, device class, country-level location, and referrer. We use this to see which guides and venues people actually read so we can write more of what helps. We do not enable Google Signals, advertising features, demographic profiles, or cross-site identity stitching. GA4 retention is set to the shortest available window (2 months for event data, 14 months for user data).</li>
<li><strong>Browser localStorage on venue pages.</strong> A small list of the last 8 venues you opened, stored only in your browser, so we can show a "Recently viewed" strip on venue pages. The key is <code>pattaya-gym:recently-viewed</code>. This never leaves your device and we cannot read it from the server.</li>
<li><strong>URL parameters on /compare/.</strong> When you compare venues, the picks are encoded in the URL itself (<code>?a=&amp;b=&amp;c=&amp;d=</code>) so the comparison is bookmarkable and shareable. The URL is the data; we store nothing about your comparison server-side.</li>
</ol>

<h2>What we do not do</h2>
<ul>
<li>No first-party login. No user accounts. No password storage.</li>
<li>No advertising of any kind. No retargeting pixels. No affiliate trackers. We have never been paid to feature, rank, or hide any venue.</li>
<li>No cross-site tracking. No fingerprinting. No data brokers. We do not sell, rent, or trade visitor data — there is nothing to sell.</li>
<li>No newsletter or marketing email collection on the site itself.</li>
</ul>

<h2>Cookies</h2>
<p>The only cookies set on this domain are the Google Analytics 4 cookies (<code>_ga</code>, <code>_ga_*</code>). They identify a browser anonymously for analytics counting. They are not used for advertising. You can block them with any ad blocker, with browser tracking-protection settings, or with the global privacy control. The site works completely without analytics enabled.</p>

<h2>AI and LLM crawler policy</h2>
<p>Our <a href="/robots.txt">robots.txt</a> explicitly allows the major AI/LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, Bytespider, cohere-ai, Diffbot, Amazonbot, and others) to retrieve our content for training and live retrieval. This is a deliberate editorial choice: a public, accurate Pattaya directory is more useful inside AI tools than locked away from them. We do not provide any private user data to these crawlers — only the same HTML pages a human browser sees.</p>

<h2>Third parties</h2>
<ul>
<li><strong>Cloudflare Pages</strong> hosts the site. Cloudflare receives a request log per page view (IP, user agent, URL) for routing and DDoS protection. Logs are managed under <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare's privacy policy</a>.</li>
<li><strong>Google Analytics 4</strong> processes the analytics events described above under <a href="https://policies.google.com/privacy">Google's privacy policy</a>.</li>
<li><strong>Fonts</strong> are self-hosted from <code>/fonts/</code> on our own domain (Round 18). No third-party font CDN is contacted on page load.</li>
</ul>
<p>No other third-party services are loaded on the site.</p>

<h2>Our sister network</h2>
<p>Pattaya.Gym is one of several independent publications operated by <strong>TimPaemi Co., Ltd.</strong>. Each runs on the same independence and editorial standards. The full network: <a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer">pattaya-authority.com</a>, <a href="https://timpaemi.com/" target="_blank" rel="noopener noreferrer">timpaemi.com</a>, <a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">pattaya-restaurant-guide.com</a>, <a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">pattayavisahelp.com</a>, <a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">pattaya-school-guide.com</a>, <a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">pattaya-coffee.com</a>, <a href="https://pattayastream.com/" target="_blank" rel="noopener noreferrer">pattayastream.com</a>, <a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">pattaya-medical.com</a>, <a href="https://pattayapets.com/" target="_blank" rel="noopener noreferrer">pattayapets.com</a>, and <a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">pattaya-vehicle-rentals.com</a>. Each site has its own privacy policy.</p>

<h2>Your rights — GDPR (EU/UK) and PDPA (Thailand)</h2>
<p>If you are in the EU, UK, or Thailand (or anywhere with similar legislation), you have the right to: request access to whatever data we hold on you (which is functionally nothing beyond aggregate GA counts you cannot be re-identified from), request deletion, request correction, withdraw consent, and lodge a complaint with your national data-protection authority. Email <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a> and we will respond within 30 days. Because we do not run accounts, most requests are satisfied simply by you clearing your browser data — but we will confirm in writing if you ask.</p>

<h2>Children</h2>
<p>This is a general-interest sport directory. We do not knowingly collect data from anyone under 13.</p>

<h2>Changes</h2>
<p>Material changes to this policy will be announced in the <a href="/changelog/">site changelog</a>. The "last updated" date above always reflects the most recent revision.</p>
`
  },
  {
    slug: '404',
    title: 'Page not found — Pattaya.Gym',
    desc: `That page doesn't exist on Pattaya.Gym. Browse ${VENUE_N} venues, 15 sports, or use search.`,
    eyebrow: '404',
    headlineLead: 'Page',
    headlineAccent: 'not found',
    accentClass: 'accent-pink',
    lede: 'That URL doesn\'t exist on Pattaya.Gym. It may have moved, or you may have followed a stale link. Use the buttons below to navigate, or browse the directory.',
    showContactCard: false,
    bodyHtml: `
<p><a href="/">Back to homepage →</a></p>
<p><a href="/search/">Search ${VENUE_N} venues →</a></p>
<p><a href="/category/muay-thai/">Browse Muay Thai →</a></p>
<p><a href="/category/fitness/">Browse fitness gyms →</a></p>
<p><a href="/contact/">Contact us →</a></p>
`
  }
];

// ---------- All-sports hub (Round 21 - Codex P1-5: de-orphan BJJ + every category) ----------
function sportsHubPage() {
  const url = `${SITE}/sports/`;
  const title = 'All sports in Pattaya - 15 categories | Pattaya.Gym';
  const desc = truncateDesc(`Browse every sport in Pattaya: Muay Thai, fitness, golf, yoga, BJJ, MMA, watersports, climbing, racquet sports, running clubs and more. ${VENUE_N} hand-checked venues across 15 categories.`);
  const cards = CATEGORIES.map(c => {
    const n = GYMS.filter(g => g.category === c.key).length;
    return `<a href="/category/${c.key}/" class="numcard u-plain-link">
        <div class="numcard-head"><span class="numcard-num">${String(n).padStart(2,'0')}</span><h3 class="numcard-title">// ${esc(c.label)}</h3></div>
        <p class="numcard-body">${n} ${n === 1 ? 'venue' : 'venues'} in Pattaya. Hand-checked, no paid placements.</p>
      </a>`;
  }).join('\n      ');
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Sport categories in Pattaya', numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/category/${c.key}/`, name: c.label }))
  };
  const crumbsLd = { '@context': 'https://schema.org', ...breadcrumbJsonLd([{ label: 'Home', href: '/' }, { label: 'All sports' }], url) };
  return head({ title, desc, url, jsonLd: [itemList, crumbsLd] })
    + topMarquee(TOP_MARQUEE)
    + nav()
    + breadcrumb([{ label: 'Home', href: '/' }, { label: 'All sports' }])
    + `
<main id="main">

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-8); text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Every sport &middot; 15 categories &middot; ${VENUE_N} venues</div>
    <h1 class="hero-h1" style="font-size:clamp(44px,10vw,128px); text-align:left;">All <span class="accent-cyan">sports.</span></h1>
    <p class="hero-lede u-text-left-ml0">Every sport and training discipline in Pattaya - from Muay Thai and BJJ to golf, diving, climbing and running clubs. Pick a category to see every hand-checked venue.</p>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> 15 categories</div>
    <h2 class="h-section">Browse by <span class="accent-pink">sport.</span></h2>
    <div class="numlist">${cards}</div>
  </div>
</section>

</main>
`
    + paNetwork()
    + bottomMarquee(BOTTOM_MARQUEE)
    + footer();
}

// ---------- Sitemap ----------
function generateSitemap() {
  // Round 17 fix (Codex F07.1): GUIDE_SLUGS is now derived from disk so the
  // sitemap can never advertise URLs that don't exist locally.
  const guidesDir = path.join(__dirname, 'guides');
  const GUIDE_SLUGS = fs.readdirSync(guidesDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(guidesDir, e.name, 'index.html')))
    .map(e => e.name)
    .sort();
  const TOOL_SLUGS = ['compare','plan-my-trip'];
  const UTILITY_EXTRA = ['sports','add-your-gym','colophon','press','pattaya-sport-stats','changelog','privacy'];
  const urls = [
    `${SITE}/`,
    `${SITE}/about/`,
    `${SITE}/contact/`,
    `${SITE}/methodology/`,
    `${SITE}/guides/`,
    `${SITE}/search/`,
    ...UTILITY_EXTRA.map(s => `${SITE}/${s}/`),
    ...TOOL_SLUGS.map(s => `${SITE}/${s}/`),
    ...GUIDE_SLUGS.map(s => `${SITE}/guides/${s}/`),
    ...CATEGORIES.map(c => `${SITE}/category/${c.key}/`),
    ...Object.keys(AREA_MAP).map(a => `${SITE}/area/${a}/`),
    ...GYMS.map(g => `${SITE}/gyms/${g.id}/`)
  ];
  // Combined category-area URLs (one per non-empty pairing) — long-tail surface
  for (const slug of Object.keys(AREA_MAP)) {
    for (const cat of CATEGORIES) {
      const has = GYMS.some(g => areaSlugFor(g.area) === slug && g.category === cat.key);
      if (has) urls.push(`${SITE}/area/${slug}/${cat.key}/`);
    }
  }
  // Sitemap priority + changefreq per URL pattern (Codex V3 P2-3 polish)
  function priorityFor(u) {
    if (u === `${SITE}/`) return '1.0';
    if (u.startsWith(`${SITE}/category/`) || u.startsWith(`${SITE}/area/`)) {
      // Combined area+category landing pages are highest-leverage long-tail surface
      if (u.split('/').filter(Boolean).length >= 5) return '0.85';
      return '0.9';
    }
    if (u.startsWith(`${SITE}/guides/`) && u.length > `${SITE}/guides/`.length + 1) return '0.8';
    if (u.startsWith(`${SITE}/gyms/`)) return '0.7';
    if (u === `${SITE}/search/` || u === `${SITE}/guides/`) return '0.7';
    return '0.5';
  }
  function changefreqFor(u) {
    if (u === `${SITE}/`) return 'daily';
    if (u.startsWith(`${SITE}/category/`) || u.startsWith(`${SITE}/area/`)) return 'weekly';
    if (u.startsWith(`${SITE}/gyms/`)) return 'weekly';
    if (u.startsWith(`${SITE}/guides/`)) return 'monthly';
    return 'monthly';
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod><changefreq>${changefreqFor(u)}</changefreq><priority>${priorityFor(u)}</priority></url>`).join('\n')}
</urlset>`;
  writeFile(path.join(ROOT, 'sitemap.xml'), xml);
}

// ---------- Main ----------
function main() {
  syncCssFontVersion();
  const stats = { venues: 0, categories: 0, areas: 0, skipped: 0 };

  // Venue pages
  for (const g of GYMS) {
    let fm = {};
    let body = '';
    if (g.detailFile) {
      const mdPath = path.join(ROOT, g.detailFile);
      if (fs.existsSync(mdPath)) {
        const text = fs.readFileSync(mdPath, 'utf8');
        const parsed = parseFrontmatter(text);
        fm = parsed.fm;
        body = parsed.body;
      }
    }
    const html = venuePage(g, fm, body);
    writeFile(path.join(ROOT, 'gyms', g.id, 'index.html'), html);
    stats.venues++;
  }

  // Category pages
  for (const cat of CATEGORIES) {
    const venues = GYMS.filter(g => g.category === cat.key);
    const html = categoryPage(cat, venues);
    writeFile(path.join(ROOT, 'category', cat.key, 'index.html'), html);
    stats.categories++;
  }

  // Area pages
  for (const slug of Object.keys(AREA_MAP)) {
    const venues = GYMS.filter(g => areaSlugFor(g.area) === slug);
    const html = areaPage(slug, AREA_LABELS[slug], venues);
    writeFile(path.join(ROOT, 'area', slug, 'index.html'), html);
    stats.areas++;
  }

  // Combined category-area landing pages — long-tail SEO targets
  // URL: /area/<area-slug>/<category-key>/
  // Only generate when venues exist; otherwise skip (avoid thin empty pages)
  let categoryAreaCount = 0;
  for (const slug of Object.keys(AREA_MAP)) {
    for (const cat of CATEGORIES) {
      const venues = GYMS.filter(g => areaSlugFor(g.area) === slug && g.category === cat.key);
      if (venues.length === 0) continue; // skip empty combos
      const html = categoryAreaPage(slug, AREA_LABELS[slug], cat, venues);
      writeFile(path.join(ROOT, 'area', slug, cat.key, 'index.html'), html);
      categoryAreaCount++;
    }
  }
  stats.categoryArea = categoryAreaCount;

  // Utility pages (about, contact, methodology, press, add-your-gym, colophon, stats, 404)
  let utilCount = 0;
  for (const pg of UTILITY_PAGES) {
    const html = utilityPage(pg);
    if (pg.slug === '404') {
      writeFile(path.join(ROOT, '404.html'), html);
    } else {
      writeFile(path.join(ROOT, pg.slug, 'index.html'), html);
    }
    utilCount++;
  }
  stats.utility = utilCount;

  // All-sports hub (Round 21 - Codex P1-5)
  writeFile(path.join(ROOT, 'sports', 'index.html'), sportsHubPage());

  // Sitemap
  generateSitemap();

  console.log(`✓ Built ${stats.venues} venues · ${stats.categories} categories · ${stats.areas} areas · ${stats.categoryArea} category-area · ${stats.utility} info pages`);
  // Sitemap count comes from generateSitemap() — accurate without manual addition

}

main();
