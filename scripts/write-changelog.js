#!/usr/bin/env node
/**
 * write-changelog.js
 *
 * Generates a public-facing /changelog/ page listing every shipped round.
 * Linked from the footer version badge. Trust + transparency signal.
 *
 * Run: node scripts/write-changelog.js
 * Idempotent — rewrites the page each time so it stays in sync with
 * the current ASSET_VERSION and BUILD_TIMESTAMP.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : '407';
const ASSET = `?v=${ASSET_VERSION}`;
const TODAY = new Date().toISOString().slice(0, 10);
const BUILD_TS = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const TOP = ['★ EVERY GYM','EVERY RING','EVERY COURT','158 VENUES','HAND-CHECKED','NO PAID PLACEMENTS','PATTAYA · THAILAND','UPDATED ROLLING'];
const BOT = ['★ PATTAYA VILLA','NO PAID PLACEMENTS','100% HAND-CHECKED','EVERY GYM','EVERY RING','EVERY COURT','★ LIVE 158 VENUES','UPDATED ROLLING'];

function marquee(items, bot) {
  const cls = bot ? 'marquee marquee-bottom' : 'marquee';
  const inner = items.map(it => `<span>${esc(it)}</span><span class="star">·</span>`).join('');
  return `<div class="${cls}" aria-hidden="true"><div class="marquee-track"><div class="marquee-set">${inner}</div><div class="marquee-set" aria-hidden="true">${inner}</div></div></div>`;
}

const ROUNDS = [
  {
    n: 17, date: '2026-05-18', tag: 'v413',
    title: 'Codex Nuclear V4 audit — 5 P1 fixes + 10 P2 wins',
    summary: 'Closed every P1 finding from the Codex Round 17 audit plus 10 quick P2 wins. The single biggest improvement: generated venue HTML went from 210 html-validate errors to 0 by replacing the regex Markdown converter with markdown-it.',
    bullets: [
      'F02.1 — Replaced bespoke regex mdToHtml with markdown-it; generated venue HTML now passes html-validate cleanly (210 → 0 structural errors).',
      'F07.1 — Sitemap GUIDE_SLUGS is now derived from disk so the sitemap can no longer advertise URLs whose local files do not exist.',
      'F20.1 — New /privacy/ page: Google Analytics 4, localStorage keys, AI crawler policy, GDPR/PDPA rights, full disclosure.',
      'F21.1 — Softened every "updated weekly" / "within 7 days" claim across homepage, marquees, generated pages, methodology, and about. Honest copy matching actual rolling-verification cadence.',
      'F23.1 — Hardened verify-deploy.js: NUL/BOM scan now covers every text source file; every sitemap URL must resolve to a local file.',
      'F01.1 — Search "Open now" filter now parses real HH:MM windows against ICT.',
      'F01.2 — Fixed 2 venue Markdown front-matter category mismatches (ALFA → bjj, Rambaa → mma).',
      'F04.1 — Geo coordinates in LocalBusiness JSON-LD rounded to 6 decimals.',
      'F05.2 — robots.txt now explicitly allows /og/ so Google/Twitter can fetch per-venue OG images.',
      'F07.3 — Deleted stray extensionless junk files from repo root, added .wrangler/ to .gitignore.',
      'F12.1 — ARIA live regions on search stats and compare status.',
      'F12.2 — Visible 3px focus-visible outline on search filter selects.',
      'F19.2 — Added browsing-topics=() to Permissions-Policy.',
      'F20.2 — Replaced overstated "privacy-respecting" GA copy with precise statement linking to /privacy/.',
      'Asset version bumped 412 → 413.'
    ]
  },
  {
    n: 16, date: '2026-05-18', tag: 'v412',
    title: 'Real side-by-side /compare/ tool',
    summary: 'The /compare/ page was the last remaining honest-stub tool from Round 7. Round 16 turns it into a real, fully-functional, client-side comparison tool — pick up to 4 venues, see them side-by-side across 12 attributes, share the URL.',
    bullets: [
      '/compare/ now embeds a 158-venue summary JSON and renders a side-by-side comparison table on demand.',
      'Up to 4 venues compared at once (slots a/b/c/d) with bookmarkable, shareable ?a=&b=&c=&d= URLs.',
      '12 comparison rows: name · editors-pick · sport · area · price · hours · phone · website · maps · tags · description · verified-date.',
      '3 preset buttons (premium Muay Thai, hotel gyms, budget camps) for instant exploration.',
      'Web Share API + clipboard fallback on the Share button.',
      'rebuild-tool-stubs.js skips /compare/ now that it has its own real builder.',
      'Asset version bumped 411 → 412.'
    ]
  },
  {
    n: 15, date: '2026-05-18', tag: 'v411',
    title: 'Live Pattaya Sport Stats dashboard',
    summary: '/pattaya-sport-stats/ was ~150 words of static bullets. Now it is a server-rendered SVG dashboard regenerated on every build — proof of breadth and transparency competitors do not have.',
    bullets: [
      '4 big stat tiles: venues / categories / areas / paid placements.',
      'Horizontal bar chart of 15 categories ranked by venue count (15-color accent rotation).',
      'Horizontal bar chart of 6 neighborhoods ranked by venue count.',
      'SVG donut chart of price-tier distribution (฿/฿฿/฿฿฿/฿฿฿฿) with legend.',
      'Verification-freshness breakdown (within 30 / 30-60 / older).',
      '4 schema-completeness ring gauges (body / geo / phone / website).',
      'All inline SVG — no JS, no charting library, no external dependencies. Asset version 410 → 411.'
    ]
  },
  {
    n: 14, date: '2026-05-18', tag: 'v410',
    title: 'Per-area neighborhood guide depth',
    summary: 'Codex V3 P1-6 finding closed — every area page now has a real ~2000-word neighborhood guide instead of a sparse venue list. 6 areas covered in editorial depth.',
    bullets: [
      'AREA_CONTENT map keyed by area slug: summary, intro, best-for, transport, landmarks, starter picks.',
      'areaPage() rewritten to render rich, opinionated neighborhood guides above the venue grid.',
      '6 areas covered: Jomtien, Naklua, Pratamnak, Central Pattaya, East Pattaya, Sattahip.',
      'Sattahip page went from 104 words to ~2100 words — same uplift across all 6 areas.',
      'Channel-card h3/h4 markup mismatches from earlier rounds fixed across 5 variants.',
      'Asset version bumped 409 → 410.'
    ]
  },
  {
    n: 13, date: '2026-05-18', tag: 'v409',
    title: 'Open-now indicator + Share + Person schema',
    summary: 'Live operational signals on every venue page + cleaner social sharing + richer authorship signal for E-E-A-T.',
    bullets: [
      'Live "Open now / Closed" pill on every venue page driven by data-hours-spec attribute and visitor local time.',
      'Recently-verified feed surfaces the freshest hand-checks at the top of the site.',
      'Web Share API button on every venue page with clipboard fallback for unsupported browsers.',
      'Person schema for Tim Paemi on /about/ — explicit author entity for E-E-A-T.',
      'Asset version bumped 408 → 409.'
    ]
  },
  {
    n: 12, date: '2026-05-18', tag: 'v408',
    title: 'Community trust + ops tooling',
    summary: 'Sources, editor-pick badges, recently-viewed memory + machine-readable site state + operational tooling for the long tail.',
    bullets: [
      'Per-venue Sources block populated from each venue\'s front-matter for full citation transparency.',
      '"Spot an error?" mailto link on every venue — explicit invitation to crowdsource corrections.',
      'Editor\'s Pick trust pill surfaces hand-selected favorites in the trust bar.',
      'Recently-viewed (localStorage, last 8) at the top of every venue page.',
      '/status.json — machine-readable site identity, build version, schema completeness, freshness, endpoints, policies.',
      'scripts/ping-sitemap.js — pings Google + Bing on every push.',
      'scripts/stale-venues.js — CSV report of venues whose verified date is > 30 days.',
      'Asset version bumped 407 → 408.'
    ]
  },
  {
    n: 11, date: '2026-05-18', tag: 'v407',
    title: 'Trust + usability polish',
    summary: 'Per-venue verified-by-Tim badge, trust signals row, guide bylines, reading-time estimator, Pattaya local-time widget, print stylesheet, public changelog page (this one), larger footer version badge, /methodology/ cross-links from every ranking surface.',
    bullets: [
      'Every venue page now shows "★ Verified by Tim · [date]" in the hero.',
      'Every venue + category + area page shows "Hand-checked · No paid placement · How we rank" trust pills.',
      'Guide pages display author byline + reading time + last-updated date.',
      'Footer shows live Pattaya time (ICT) — useful for tourists checking from abroad.',
      'Print stylesheet means venue pages print clean for offline reference.',
      'Public /changelog/ page (this one) — full transparency on what changes each round.',
      'Asset version bumped 406 → 407.'
    ]
  },
  {
    n: 10, date: '2026-05-17', tag: 'v406',
    title: '3 new long-tail guide pages',
    summary: 'Autonomous editorial round — wrote 3 substantive new guides targeting high-intent commercial queries Codex flagged as missing.',
    bullets: [
      '/guides/english-speaking-muay-thai-pattaya/ — 10 gyms with English-fluent kru, ~1900 words.',
      '/guides/muay-thai-camps-with-accommodation-pattaya/ — 8 stay-and-train camps with pricing tiers, ~1800 words.',
      '/guides/gym-day-pass-pattaya/ — 12 gyms accepting walk-in day passes, ~1700 words.',
      'Each guide auto-gets Article schema + FAQPage schema + 8-12 internal venue links.'
    ]
  },
  {
    n: 9, date: '2026-05-17', tag: 'v406',
    title: 'Repo hygiene + README + NEXT_STEPS playbook',
    summary: 'Closed remaining Codex V3 P2/P3 polish items + wrote the off-page playbook.',
    bullets: [
      '.gitignore cleaned (stripped UTF-16 garbage, added archive patterns).',
      'Duplicate sitemap_index.xml deleted.',
      'README.md rewritten to V2 reality (build-v2.js, PUSH workflow, full schema map).',
      'NEXT_STEPS.md — comprehensive off-page playbook (GSC, Bing, GBP, backlinks, content).'
    ]
  },
  {
    n: 8, date: '2026-05-17', tag: 'v406',
    title: 'Geo coordinates pipeline + sitemap priority',
    summary: 'Codex called geo "the single biggest local-SEO unlock." Built the Nominatim pipeline.',
    bullets: [
      'scripts/geocode-venues.js — one-time Nominatim geocoder for all 158 venues.',
      'build-v2.js reads data/venue-geo.json and injects geo into LocalBusiness JSON-LD.',
      'Sitemap now emits priority + changefreq per URL pattern.'
    ]
  },
  {
    n: 7, date: '2026-05-17', tag: 'v406',
    title: 'Mobile CLS + tool stubs + guide schema',
    summary: 'Closed three biggest remaining Codex V3 findings in one pass.',
    bullets: [
      'Mobile CLS fixes — reserved space on .marquee, .btn-row, .result-card, .pa-network, .nav-row.',
      'Tool pages (/map/, /compare/, /plan-my-trip/, /find-my-coach/, /favorites/) converted to honest V2 static stubs with 3 working-alternative cards each.',
      'Article + FAQPage JSON-LD auto-injected on 17 guide pages.'
    ]
  },
  {
    n: 6, date: '2026-05-17', tag: 'v406',
    title: 'Category-area landing pages + postalCode fallback + heading hierarchy',
    summary: 'The biggest long-tail SEO unlock per Codex V3 Section L.',
    bullets: [
      '~80 combined category-area pages now generated at /area/<area>/<category>/ targeting "muay thai in jomtien pattaya" etc.',
      'parsePostalAddress() now infers Thai postal codes from area context (Bang Lamung=20150, Sattahip=20250).',
      '<h4 class="channel-card-name"> → <h3> globally (fixes 163-page heading hierarchy issue).'
    ]
  },
  {
    n: 5, date: '2026-05-17', tag: 'v406',
    title: 'Cache fix + metadata polish + contrast',
    summary: 'Closed all four Round 4 Codex P0s.',
    bullets: [
      'Removed `immutable` from _headers CSS/JS cache rules (now max-age=3600, must-revalidate).',
      'Asset version bumped 405 → 406 to force Cloudflare cache invalidation.',
      'Added og:site_name, twitter:site, robots meta, x-dns-prefetch-control, dns-prefetch hints to head().',
      'Back-to-top button text color #fff → #000 on pink (contrast 3.53:1 → 5.94:1, WCAG AA pass).'
    ]
  },
  {
    n: 4, date: '2026-05-17', tag: 'v405',
    title: 'P0 ship-blocker fixes (Codex Nuclear V3)',
    summary: 'Repaired three critical production issues + added deploy guard.',
    bullets: [
      'Homepage truncation repaired (was 307 lines mid-attribute, now 603 with proper closing tags).',
      'styles.css unclosed .back-to-top block fixed; restored .skip-link, .back-to-top.is-visible, prefers-reduced-motion rules.',
      'CSP rewrote with 3 active sha256 hashes + Cloudflare Insights origin allowed.',
      'NEW: scripts/verify-deploy.js — pre-push integrity check (truncation, NULs, brace balance, CSP coverage).'
    ]
  },
  {
    n: 3, date: '2026-05-17', tag: 'v404',
    title: 'P0+P1 from Codex post-live audit',
    summary: 'Sanitized tel: links, sitemap completeness, multi-session hours parsing, footer/heading fixes.',
    bullets: [
      'phoneToTel() helper sanitizes display phones into E.164-clean dial values.',
      'Sitemap +26 URLs (17 guides, 6 tool pages, 4 utility pages).',
      'parseHoursSpec() handles multi-session via & continuation (Fairtex now emits both 07:30-10:30 AND 15:30-18:30).',
      'rel="noopener noreferrer" sitewide; footer h4 → div.footer-col-h.',
      '5 broken YAML venue MDs fixed; --hint #555 → #888 (WCAG AA pass).'
    ]
  },
  {
    n: 2, date: '2026-05-17', tag: 'v403',
    title: 'Schema-rich rebuild + legacy migration',
    summary: 'Codex audit Round 2 fix order — biggest schema completion pass.',
    bullets: [
      '158/158 venue pages get BreadcrumbList + LocalBusiness with PostalAddress + parsed openingHoursSpecification.',
      '15/15 category + 6/6 area pages get BreadcrumbList alongside ItemList.',
      'Homepage gets WebSite + Organization + SearchAction JSON-LD graph.',
      '24 legacy pages (guides + tools) migrated to V2 chrome.',
      'HOTFIX: linked 141 orphan venue body markdowns via detailFile in data.js.'
    ]
  },
  {
    n: 1, date: '2026-05-16', tag: 'v402',
    title: 'V2 redesign ships to production',
    summary: 'Complete visual rebuild + content recovery.',
    bullets: [
      'TimPaemi-inspired V2 design: black bg, multi-color neon accents, infinite seamless marquees, pattaya<dot>gym brand mark.',
      'Restored truncated index.html, stripped NUL bytes from 7 corrupted files, repointed package.json at build-v2.js.',
      '158/158 venues now render with full body content (median 1,165 words).',
      'redesign-2026 branch merged to main; pattaya-gym.com live on V2.'
    ]
  }
];

const url = `${SITE}/changelog/`;
const title = 'Changelog — pattaya-gym.com';
const desc = 'Public transparency log of every update shipped to pattaya-gym.com. Each round of fixes documented with date, version tag, and scope.';

const webpage = {'@context':'https://schema.org','@type':'WebPage','@id':`${url}#webpage`,url,name:title,description:desc,inLanguage:'en',isPartOf:{'@id':`${SITE}/#website`}};
const crumbs = {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
  {'@type':'ListItem','position':1,'name':'Home','item':`${SITE}/`},
  {'@type':'ListItem','position':2,'name':'Changelog','item':url}
]};

const head = `<!DOCTYPE html>
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap">
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
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%23000'/%3E%3Ctext x='50%25' y='62%25' font-family='Inter,sans-serif' font-size='40' font-weight='800' fill='%23ff2e7e' text-anchor='middle'%3EP%3C/text%3E%3C/svg%3E">
<script type="application/ld+json">${JSON.stringify(webpage)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-F5F6KD3XFZ');</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>`;

const nav = `<header class="nav" role="banner"><div class="nav-row"><a href="/" class="brand">pattaya<span class="dot">.</span>gym</a><nav class="nav-links" aria-label="Primary"><a href="/category/muay-thai/">Muay Thai</a><a href="/category/fitness/">Fitness</a><a href="/category/golf/">Golf</a><a href="/guides/">Guides</a><a href="/search/">Search</a></nav><a href="/search/" class="nav-cta">★ Find a gym</a></div></header>`;

const breadcrumb = `<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);"><a href="/" style="color:var(--muted);">Home</a> <span style="color:var(--hint); margin:0 8px;">/</span> <span style="color:var(--text); font-weight:600;">Changelog</span></nav>`;

const pa = `<section class="pa-network"><a href="https://pattaya-authority.com/" target="_blank" rel="noopener noreferrer" style="text-decoration:none; color:inherit;"><div class="pa-network-badge">★ A Pattaya Authority property ★</div></a><h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2><p class="pa-network-sub">// Site engineered, operated &amp; maintained in-house<br>by the founders of TimPaemi</p></section>`;

const footer = `<footer class="footer" role="contentinfo"><div class="footer-grid"><div><div class="footer-brand">pattaya<span class="accent">.gym</span></div><p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> 158 venues hand-checked. No paid placements. Independent directory operated by TimPaemi Co., Ltd. from our Pattaya villa.</p><p style="font-size:13px; color:var(--muted); margin:var(--s-4) 0 0;">— Tim &amp; Paemi, founders</p><div class="footer-meta">TimPaemi Co., Ltd.<br>Pattaya City, Bang Lamung District<br>Chon Buri 20150 · Thailand</div></div><div class="footer-col"><div class="footer-col-h">// The site</div><ul><li><a href="/about/">About</a></li><li><a href="/methodology/">Methodology</a></li><li><a href="/guides/">Guides</a></li><li><a href="/search/">Search</a></li><li><a href="/changelog/">Changelog</a></li></ul></div><div class="footer-col"><div class="footer-col-h">// Projects</div><ul><li><a href="https://pattaya-authority.com/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a></li><li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Restaurant Guide</a></li><li><a href="/">Pattaya.Gym</a></li><li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Visa Help</a></li></ul></div><div class="footer-col"><div class="footer-col-h">// Direct</div><ul><li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li><li><a href="https://api.whatsapp.com/send/?phone=66967286999" target="_blank" rel="noopener noreferrer">WhatsApp · +66 96 728 6999</a></li><li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer">LINE · @timpaemi</a></li><li><a href="/contact/">Contact page</a></li></ul></div></div><div class="footer-base"><span>© 2026 TimPaemi Co., Ltd. · All rights reserved</span><span class="footer-version-badge">Built ${BUILD_TS} · <a href="/changelog/">v${ASSET_VERSION}</a></span><span class="pattaya-time">Pattaya · <span class="pattaya-time-value" id="pt-clock">--:--</span> ICT</span></div></footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>
<script>
 (function(){
  var btn = document.querySelector('.back-to-top');
  var bar = document.querySelector('.progress-bar');
  function update() {
    var doc = document.documentElement;
    var sh = doc.scrollHeight - doc.clientHeight;
    var pct = sh > 0 ? (window.scrollY / sh) * 100 : 0;
    if (bar) bar.style.width = pct + '%';
    if (btn) {
      if (window.scrollY > 600) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    }
  }
  if (btn) btn.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
</script>
<script>
 (function(){
  var el = document.getElementById('pt-clock');
  if (!el) return;
  function tick() {
    var now = new Date();
    var ict = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (7 * 3600000));
    var hh = String(ict.getHours()).padStart(2, '0');
    var mm = String(ict.getMinutes()).padStart(2, '0');
    el.textContent = hh + ':' + mm;
  }
  tick();
  setInterval(tick, 30000);
})();
</script>`;

const rounds = ROUNDS.map(r => `
<article class="changelog-entry" style="border-left:3px solid var(--pink); padding:var(--s-3) 0 var(--s-5) var(--s-5); margin-bottom:var(--s-6);">
  <header style="margin-bottom:var(--s-3);">
    <div style="font-family:var(--font-mono); font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); margin-bottom:6px;">
      <span style="color:var(--cyan);">Round ${r.n}</span>
      <span style="color:var(--hint); margin:0 8px;">·</span>
      <time datetime="${esc(r.date)}">${esc(r.date)}</time>
      <span style="color:var(--hint); margin:0 8px;">·</span>
      <span class="trust-pill" style="display:inline; padding:3px 8px;">${esc(r.tag)}</span>
    </div>
    <h2 style="font-family:var(--font-display); font-size:clamp(20px, 3vw, 28px); font-weight:700; margin:0; color:var(--text);">${esc(r.title)}</h2>
  </header>
  <p style="color:var(--text-2); margin:0 0 var(--s-3); line-height:1.6;">${esc(r.summary)}</p>
  <ul style="color:var(--text-2); padding-left:24px; margin:0; line-height:1.7;">${r.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
</article>
`).join('');

const html = head + marquee(TOP, false) + nav + breadcrumb + `
<main id="main">

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-6); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// Public changelog · v${ASSET_VERSION} · Updated ${TODAY}</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,8vw,96px); text-align:left;">
      Every <span class="accent-pink">change.</span>
    </h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;">
      Public log of every update shipped to <strong>pattaya-gym.com</strong>. We believe in operational transparency — every round of fixes is documented here with date, version tag, and scope. No silent changes.
    </p>
    <div class="trust-bar">
      <span class="trust-pill is-verified">★ ${ROUNDS.length} rounds shipped</span>
      <span class="trust-pill">Latest: v${ASSET_VERSION} · ${ROUNDS[0].date}</span>
      <span class="trust-pill">158/158 venues live</span>
      <a href="/methodology/" class="trust-pill is-link">Methodology →</a>
    </div>
  </div>
</section>

<section class="section" style="padding-top:var(--s-4);">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> Release history</div>
    <h2 class="h-section">From <span class="accent-cyan">round 1</span> to <span class="accent-pink">round ${ROUNDS[0].n}.</span></h2>
    <p class="lede">All rounds are tagged in git with a <code>main-pre-round&lt;N&gt;</code> rollback point. Most-recent-first.</p>
    <div style="max-width:880px; margin:var(--s-6) 0;">
      ${rounds}
    </div>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> Why a public changelog</div>
    <h2 class="h-section">Operating in the <span class="accent-yellow">open.</span></h2>
    <p class="lede" style="max-width:760px;">Most directories silently update. Pattaya.Gym tells you what changed and when. Every venue page also shows a <strong>verified date</strong> in the hero — that's when we last hand-checked it. If something goes stale, you know.</p>
    <p class="lede" style="max-width:760px;">Independent. No paid placements. No fake reviews. <a href="/methodology/" style="color:var(--cyan);">Full methodology →</a></p>
  </div>
</section>

</main>
` + pa + marquee(BOT, true) + footer + '\n</body>\n</html>\n';

const dir = path.join(ROOT, 'changelog');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
console.log(`/changelog/ written (${(html.length/1024).toFixed(1)} KB, ${ROUNDS.length} rounds documented)`);
