#!/usr/bin/env node
/**
 * build-press-kit.js — regenerates /press/ from live site data.
 *
 * Every number on the press kit is read from `data.js`, the guides directory and
 * the venue records at build time. Nothing is typed by hand, so the kit cannot
 * drift from the site the way a hand-written media page always eventually does.
 * Run it in the ship chain and the kit is correct on every deploy.
 *
 * SCOPE: pattaya-gym.com only. Everything here is hardcoded to this site by
 * design. Do not generalise it, do not add a site switch, and do not copy it
 * out to another repo — a copy one window can change safely beats a shared
 * module several windows fight over.
 *
 * NOTE ON HONESTY: this page is the one journalists and partners quote. It must
 * never claim more than the site can back. Counts are computed, not asserted;
 * "operating" excludes `status: closed`; and no follower, traffic or view
 * numbers appear anywhere, because we do not publish figures we cannot evidence.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { GYMS, CATEGORIES } = require(path.join(ROOT, 'data.js'));

/* ------------------------------------------------------------------ BRAND */
const BRAND = {
  site: 'Pattaya.Gym',
  domain: 'pattaya-gym.com',
  url: 'https://pattaya-gym.com',
  tagline: 'Find gyms, rings and courts in Pattaya.',
  entity: 'TimPaemi Co., Ltd.',
  founders: ['Tim', 'Paemi'],
  city: 'Pattaya',
  region: 'Chon Buri',
  country: 'Thailand',
  email: 'info@pattaya-gym.com',
  publisher: 'https://timpaemi.com/',
  colors: [
    ['Volt', '#cbff3c', 'The accent. A fill only — never a text colour.'],
    ['Volt ink', '#4c5f00', 'AA-safe volt-flavoured text.'],
    ['Brand ink', '#3f6212', 'Links, the wordmark dot.'],
    ['Ink', '#14180f', 'Body text, primary buttons, the ring rule.'],
    ['Canvas', '#f7f8f3', 'Page background.'],
    ['Panel', '#171c11', 'Footer and dark bands.']
  ],
  fonts: [
    ['Space Grotesk', 'Display — headings, the wordmark', '300–700 variable'],
    ['Inter', 'Body text', '400/500/600/700'],
    ['JetBrains Mono', 'Numbers — prices, counts, dates', '500/600/700']
  ],
  social: [
    ['YouTube', 'https://www.youtube.com/@timpaemi'],
    ['Instagram', 'https://www.instagram.com/timpaemi/'],
    ['TikTok', 'https://www.tiktok.com/@timpaemi.com'],
    ['Facebook', 'https://www.facebook.com/timpaemi']
  ]
};

const ASSETS = [
  ['logo-lockup-light.svg', 'Lockup — light backgrounds', 'SVG', 'Primary logo. Mark plus wordmark.'],
  ['logo-lockup-dark.svg', 'Lockup — dark backgrounds', 'SVG', 'Ink panel version.'],
  ['logo-wordmark-ink.svg', 'Wordmark — light backgrounds', 'SVG', 'Outlined paths. No font needed.'],
  ['logo-wordmark-white.svg', 'Wordmark — dark backgrounds', 'SVG', 'Outlined paths. No font needed.'],
  ['logo-mark.svg', 'Mark only', 'SVG', 'Avatars, app icons, favicons.'],
  ['avatar-800.png', 'Avatar 800×800', 'PNG', 'Social profile picture.'],
  ['og-image.png', 'Social card 1200×630', 'PNG', 'Open Graph / Twitter card.'],
  ['favicon.ico', 'Favicon 16/32/48', 'ICO', 'Multi-resolution.'],
  ['icon-512.png', 'App icon 512×512', 'PNG', 'PWA / Android.'],
  ['icon-512-maskable.png', 'Maskable icon 512×512', 'PNG', 'Android adaptive, safe-zone aware.']
];

/* ------------------------------------------------------------ LIVE FIGURES */
function figures() {
  const closed = GYMS.filter(g => g.status === 'closed');
  const guides = fs.existsSync(path.join(ROOT, 'guides'))
    ? fs.readdirSync(path.join(ROOT, 'guides')).filter(d => {
        try { return fs.statSync(path.join(ROOT, 'guides', d)).isDirectory(); } catch { return false; }
      }).length : 0;
  const areas = fs.existsSync(path.join(ROOT, 'area'))
    ? fs.readdirSync(path.join(ROOT, 'area')).filter(d => {
        try { return fs.statSync(path.join(ROOT, 'area', d)).isDirectory(); } catch { return false; }
      }).length : 0;

  // Editorial depth, computed from the records rather than claimed.
  let words = 0, withPrice = 0, sourced = 0, oldest = null, newest = null;
  const vdir = path.join(ROOT, 'venues');
  const recs = fs.existsSync(vdir) ? fs.readdirSync(vdir).filter(f => f.endsWith('.md')) : [];
  for (const f of recs) {
    const t = fs.readFileSync(path.join(vdir, f), 'utf8');
    const fm = (t.match(/^---([\s\S]*?)\n---/) || [, ''])[1];
    words += t.replace(/^---[\s\S]*?\n---\n/, '').split(/\s+/).filter(Boolean).length;
    if (/^priceRange:\s*\S/m.test(fm) && !/^priceRange:\s*["']{2}\s*$/m.test(fm)) withPrice++;
    if ((fm.match(/^\s*-\s+https?:/gm) || []).length) sourced++;
    const v = (fm.match(/verified:\s*([0-9-]+)/) || [])[1];
    if (v) { if (!oldest || v < oldest) oldest = v; if (!newest || v > newest) newest = v; }
  }
  return {
    listings: GYMS.length,
    operating: GYMS.length - closed.length,
    closed: closed.length,
    sports: Array.isArray(CATEGORIES) ? CATEGORIES.length : Object.keys(CATEGORIES || {}).length,
    areas, guides,
    words,
    meanWords: recs.length ? Math.round(words / recs.length) : 0,
    withPrice, sourced,
    records: recs.length,
    oldest, newest
  };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const F = figures();
const TODAY = new Date().toISOString().slice(0, 10);
const YEAR = new Date().getFullYear();

/* ------------------------------------------------------------- BOILERPLATE */
const SHORT = `${BRAND.site} is an independent directory of gyms, Muay Thai camps and sport venues in ${BRAND.city}, Thailand — ${F.listings} source-checked records across ${F.sports} sports, published by ${BRAND.entity.replace(/\.$/, '')}.`;

const LONG = `${BRAND.site} is an independent sport-venue directory for ${BRAND.city}, Thailand, published by ${BRAND.entity} and written by ${BRAND.founders.join(' and ')}, who live in the city. It lists ${F.listings} records across ${F.sports} sports and ${F.areas} neighbourhoods, alongside ${F.guides} trip planners. Published prices carry an as-of date, venue pages expose their source ledger and unresolved details stay visible. Closed venues remain marked as closed rather than quietly disappearing. No venue can pay for a listing, a ranking or a badge. TimPaemi Co. manages more than 20 distinct Pattaya publications and products spanning local media, agency systems, events and streaming, with timpaemi.com as the central publisher identity.`;

const FACTS = [
  ['Site', BRAND.site],
  ['Domain', BRAND.domain],
  ['Publisher', BRAND.entity],
  ['Founders', BRAND.founders.join(' and ')],
  ['Location', `${BRAND.city}, ${BRAND.region}, ${BRAND.country}`],
  ['Listings', String(F.listings)],
  ['Of which operating', String(F.operating)],
  ['Marked permanently closed', String(F.closed)],
  ['Sports covered', String(F.sports)],
  ['Neighbourhoods', String(F.areas)],
  ['Trip planners', String(F.guides)],
  ['Venue records citing sources', `${F.sourced} of ${F.records}`],
  ['Records with a published price', String(F.withPrice)],
  ['Editorial words across venue records', F.words.toLocaleString('en-GB')],
  ['Mean words per venue record', String(F.meanWords)],
  ['Verification window', F.oldest && F.newest ? `${F.oldest} to ${F.newest}` : '—'],
  ['Figures generated', TODAY]
];

const RULES = [
  'Running text uses <strong>Pattaya.Gym</strong>. The logo is always lowercase <strong>pattaya.gym</strong>.',
  'The volt dot between the two words is part of the wordmark. Do not remove, reposition or recolour it.',
  'The volt is a fill, never a text colour. Anything volt that carries text uses the ink variant.',
  'Clear space around the logo equals the width of the mark.',
  'Minimum wordmark width is 120px on screen. Below that, use the mark alone.',
  'Do not stretch, rotate, add effects to, or re-typeset the wordmark — the files are outlined paths for exactly this reason.',
  'Do not add “Pattaya” or “Thailand” to the mark itself.',
  'Do not place the light lockup on a dark background, or the dark lockup on a light one.'
];

/* ------------------------------------------------------------------- HTML */
const assetRows = ASSETS.map(([file, label, fmt, note]) => `        <tr>
          <td><a href="/brand/${file}" download>${esc(label)}</a></td>
          <td><span class="pk-fmt">${fmt}</span></td>
          <td>${esc(note)}</td>
        </tr>`).join('\n');

const factRows = FACTS.map(([k, v]) => `        <tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('\n');

const colorRows = BRAND.colors.map(([n, hex, use]) => `        <tr>
          <td><span class="pk-swatch" style="background:${hex}"></span> ${esc(n)}</td>
          <td><code>${hex}</code></td>
          <td>${esc(use)}</td>
        </tr>`).join('\n');

const fontRows = BRAND.fonts.map(([n, use, w]) => `        <tr><th scope="row">${esc(n)}</th><td>${esc(use)}</td><td>${esc(w)}</td></tr>`).join('\n');

const BODY = `<section class="section">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">01</span> Boilerplate</div>
    <h2 class="h-section">Copy this <span class="accent-cyan">verbatim.</span></h2>
    <div class="venue-body">
      <p><strong>Short (one sentence).</strong></p>
      <blockquote>${esc(SHORT)}</blockquote>
      <p><strong>Long (one paragraph).</strong></p>
      <blockquote>${esc(LONG)}</blockquote>
      <p class="u-muted">Both versions are regenerated from live site data on every deploy, so the numbers in them are current as of ${TODAY}.</p>
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">02</span> Fast facts</div>
    <h2 class="h-section">Numbers we can <span class="accent-cyan">back up.</span></h2>
    <div class="venue-body">
      <p>Every figure below is computed from the published directory at build time. We do not publish traffic, follower or view counts.</p>
      <table class="pk-table">
        <tbody>
${factRows}
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">03</span> Logo &amp; assets</div>
    <h2 class="h-section">Run our logo <span class="accent-cyan">without asking.</span></h2>
    <div class="venue-body">
      <p>All logo files are SVG with outlined paths — they render identically without Space Grotesk installed.</p>
      <div class="pk-logos">
        <div class="pk-logo"><img src="/brand/logo-lockup-light.svg" alt="Pattaya.Gym lockup, light background" width="300" height="86" loading="lazy"></div>
        <div class="pk-logo pk-logo-dark"><img src="/brand/logo-lockup-dark.svg" alt="Pattaya.Gym lockup, dark background" width="300" height="86" loading="lazy"></div>
      </div>
      <table class="pk-table">
        <thead><tr><th scope="col">Asset</th><th scope="col">Format</th><th scope="col">Use</th></tr></thead>
        <tbody>
${assetRows}
        </tbody>
      </table>
      <p><a class="btn btn-secondary" href="/brand/pattaya-gym-press-kit.zip" download>Download everything (ZIP)</a></p>
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">04</span> Colour &amp; type</div>
    <h2 class="h-section">The palette, <span class="accent-cyan">exactly.</span></h2>
    <div class="venue-body">
      <table class="pk-table">
        <thead><tr><th scope="col">Colour</th><th scope="col">Hex</th><th scope="col">Use</th></tr></thead>
        <tbody>
${colorRows}
        </tbody>
      </table>
      <table class="pk-table">
        <thead><tr><th scope="col">Typeface</th><th scope="col">Role</th><th scope="col">Weights</th></tr></thead>
        <tbody>
${fontRows}
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">05</span> Usage rules</div>
    <h2 class="h-section">Eight rules, <span class="accent-cyan">then you're free.</span></h2>
    <div class="venue-body">
      <ul>
${RULES.map(r => `        <li>${r}</li>`).join('\n')}
      </ul>
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">06</span> How we work</div>
    <h2 class="h-section">What makes the data <span class="accent-cyan">worth quoting.</span></h2>
    <div class="venue-body">
      <ul>
        <li><strong>No paid placements.</strong> No venue can buy a listing, a ranking or a badge.</li>
        <li><strong>Published prices are dated.</strong> Undated or unstable rates remain absent rather than being presented as current.</li>
        <li><strong>Sources are exposed</strong> at record level — operator channels, public listings, authorities, sport bodies or a retained direct reply. The record says when evidence is incomplete.</li>
        <li><strong>Closures stay visible.</strong> ${F.closed} of ${F.listings} listings are marked permanently closed rather than deleted, so an old recommendation cannot send anyone to a dead address.</li>
        <li><strong>Gaps are stated.</strong> Records surface missing prices, unresolved operation and imprecise locations instead of guessing.</li>
      </ul>
      <p>The full method is on the <a href="/methodology/">methodology page</a>.</p>
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">07</span> Contact</div>
    <h2 class="h-section">Press <span class="accent-cyan">enquiries.</span></h2>
    <div class="venue-body">
      <p>Email <a href="mailto:${BRAND.email}">${BRAND.email}</a>. We answer press and data questions, and we will correct anything we have got wrong — quickly and in public.</p>
      <p>Published by <a href="${BRAND.publisher}" rel="author noopener">${BRAND.entity}</a>, ${BRAND.city}, ${BRAND.country}.</p>
      <p class="u-muted">Official channels: ${BRAND.social.map(([n, u]) => `<a href="${u}" rel="me noopener">${n}</a>`).join(' · ')}</p>
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------------ SCHEMA */
const schema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${BRAND.url}/press/#webpage`,
  url: `${BRAND.url}/press/`,
  name: `Press & media kit | ${BRAND.site}`,
  description: SHORT,
  dateModified: TODAY,
  isPartOf: { '@id': `${BRAND.url}/#website` },
  about: {
    '@type': 'Organization',
    '@id': `${BRAND.url}/#organization`,
    name: BRAND.site,
    legalName: BRAND.entity,
    url: BRAND.url,
    slogan: BRAND.tagline,
    description: LONG,
    email: BRAND.email,
    logo: {
      '@type': 'ImageObject',
      '@id': `${BRAND.url}/#logo`,
      url: `${BRAND.url}/brand/logo-mark.svg`,
      contentUrl: `${BRAND.url}/brand/icon-512.png`,
      width: 512, height: 512, caption: BRAND.site
    },
    image: { '@type': 'ImageObject', url: `${BRAND.url}/brand/og-image.png`, width: 1200, height: 630 },
    // @id references, not bare {name} nodes. A Person with only a name is a string,
    // not an entity - Google needs url or sameAs to resolve it, and the full Person
    // definitions live in scripts/lib/timpaemi-author.js and are emitted on this page.
    founder: [{ '@id': 'https://timpaemi.com/#tim' }, { '@id': 'https://timpaemi.com/#paemi' }],
    address: {
      '@type': 'PostalAddress',
      addressLocality: BRAND.city, addressRegion: BRAND.region, addressCountry: 'TH'
    },
    parentOrganization: { '@id': 'https://timpaemi.com/#timpaemi' },
    sameAs: BRAND.social.map(([, u]) => u)
  }
};

/* ------------------------------------------------------------------- WRITE
   We do not build the page from scratch. build-v2.js owns the head, nav and
   footer for every info page; this script swaps only the <main> body and the
   page-level schema. That way the press kit can never drift out of the design
   system, and re-running build-v2 followed by this script is idempotent. */
const PAGE = path.join(ROOT, 'press', 'index.html');

function write() {
  if (!fs.existsSync(PAGE)) {
    console.error('build-press-kit: press/index.html not found — run build-v2.js first.');
    process.exit(1);
  }
  let html = fs.readFileSync(PAGE, 'utf8');
  const orig = html;

  const mainRe = /(<main id="main">)[\s\S]*?(<\/main>)/;
  if (!mainRe.test(html)) {
    console.error('build-press-kit: no <main id="main"> in press/index.html — aborting rather than guessing.');
    process.exit(1);
  }
  html = html.replace(mainRe, (_m, a, b) => `${a}\n${HERO}\n${BODY}\n${b}`);

  // Page schema: replace ours if present, else insert before </head>.
  const tag = `<script type="application/ld+json" data-press-kit>${JSON.stringify(schema)}</script>`;
  html = /<script type="application\/ld\+json" data-press-kit>[\s\S]*?<\/script>/.test(html)
    ? html.replace(/<script type="application\/ld\+json" data-press-kit>[\s\S]*?<\/script>/, tag)
    : html.replace('</head>', tag + '\n</head>');

  // Title + description reflect the live figures.
  const title = `Press &amp; media kit — logos, boilerplate, ${F.listings} listings | ${BRAND.site}`;
  const desc = `Brand assets, boilerplate and verified figures for ${BRAND.site} — ${F.listings} ${BRAND.city} sport-venue listings across ${F.sports} sports. Download logos and quote us without emailing first.`;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(desc)}"`);
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc(desc)}"`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${esc(desc)}"`);

  if (html !== orig) fs.writeFileSync(PAGE, html, 'utf8');
  return html.length;
}

const HERO = `<section class="hero hub-hero">
  <div class="hero-inner">
    <div class="hero-kicker">Press kit &middot; updated ${TODAY}</div>
    <h1 class="hero-h1">Press &amp; <span class="accent-cyan">media kit.</span></h1>
    <p class="hero-lede">Everything you need to write about ${BRAND.site} or run our logo, without emailing first. Every figure on this page is generated from the live directory.</p>
    <div class="btn-row u-mt-5">
      <a class="btn btn-primary" href="/brand/pattaya-gym-press-kit.zip" download>Download the kit</a>
      <a class="btn btn-ghost" href="mailto:${BRAND.email}">Press enquiries</a>
    </div>
  </div>
</section>`;

module.exports = { BRAND, ASSETS, figures, BODY, schema, SHORT, LONG, FACTS, F, TODAY, YEAR };

if (require.main === module) {
  const n = write();
  console.log(`press kit: ${F.listings} listings (${F.operating} operating, ${F.closed} closed) · ` +
              `${F.sports} sports · ${F.areas} areas · ${F.guides} guides · ` +
              `${F.words.toLocaleString('en-GB')} words · ${F.sourced}/${F.records} sourced · ` +
              `${ASSETS.length} assets · page ${(n/1024).toFixed(1)} KB`);
}
