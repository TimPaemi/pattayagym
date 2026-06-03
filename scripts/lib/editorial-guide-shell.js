#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function getBuildMeta() {
  const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
  const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
  const ASSET_VERSION = versionMatch ? versionMatch[1] : '433';
  return {
    SITE: 'https://pattaya-gym.com',
    ASSET: `?v=${ASSET_VERSION}`,
    ASSET_VERSION,
    TODAY: new Date().toISOString().slice(0, 10),
    BUILD_TS: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
  };
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const { GYMS } = require(path.join(ROOT, 'data.js'));
const VENUE_N = GYMS.length;
const TOP_MARQUEE = ['★ EVERY GYM', 'EVERY RING', 'EVERY COURT', `${VENUE_N} VENUES`, 'HAND-CHECKED', 'NO PAID PLACEMENTS', 'PATTAYA · THAILAND', 'UPDATED ROLLING'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA', 'NO PAID PLACEMENTS', 'HAND-CHECKED', 'EVERY GYM', 'EVERY RING', 'EVERY COURT', `★ LIVE ${VENUE_N} VENUES`, 'UPDATED ROLLING'];

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

function paNetwork() {
  const { paNetworkHtml } = require('./pa-network-block');
  return paNetworkHtml({ hereOnGym: true, badgeUrl: 'https://pattaya-authority.com/' });
}

function sisterContextBlock(links) {
  if (!links || !links.length) return '';
  const items = links.map(l => {
    const ext = l.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<li><a href="${l.url}"${ext}>${esc(l.label)}</a> — ${esc(l.desc)}</li>`;
  }).join('\n        ');
  return `
<section class="section sister-context u-pt-0" aria-labelledby="sister-context-h">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Pattaya network</div>
    <h2 id="sister-context-h" class="h-section">Go <span class="accent-cyan">deeper.</span></h2>
    <ul class="venue-guide-link-list">
        ${items}
    </ul>
  </div>
</section>`;
}

function footer(meta) {
  return `<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div>
      <div class="footer-brand">pattaya<span class="accent">.gym</span></div>
      <div class="footer-slogan">Built in Pattaya. For Pattaya.</div>
      <p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> ${VENUE_N} venues hand-checked. No paid placements.</p>
    </div>
    <div class="footer-col"><div class="footer-col-h">// The site</div><ul><li><a href="/guides/">Guides</a></li><li><a href="/compare/">Compare</a></li><li><a href="/methodology/">Methodology</a></li></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Projects</div><ul class="footer-projects"><li><a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a></li><li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Restaurant Guide</a></li><li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Visa Help</a></li></ul></div>
    <div class="footer-col"><div class="footer-col-h">// Direct</div><ul><li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li></ul></div>
  </div>
  <div class="footer-base"><span>© 2026 TimPaemi Co., Ltd.</span><span class="u-cyan">★ v${meta.ASSET_VERSION} · ${meta.BUILD_TS}</span></div>
</footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>
<script defer src="/site-ui.js${meta.ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${meta.ASSET}"></script>`;
}

function writeEditorialGuide(g) {
  const meta = getBuildMeta();
  const url = `${meta.SITE}/guides/${g.slug}/`;
  const webpage = { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${url}#webpage`, url, name: g.title, description: g.desc, inLanguage: 'en', isPartOf: { '@id': `${meta.SITE}/#website` } };
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${meta.SITE}/` },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${meta.SITE}/guides/` },
    { '@type': 'ListItem', position: 3, name: g.crumb, item: url },
  ] };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(g.title)}</title>
<meta name="description" content="${esc(g.desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<link rel="preload" href="/styles.css${meta.ASSET}" as="style">
<link rel="preload" href="/fonts/space-grotesk-700.woff2${meta.ASSET}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css${meta.ASSET}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:title" content="${esc(g.title)}">
<meta property="og:description" content="${esc(g.desc)}">
<meta property="og:image" content="${meta.SITE}/og-image.png">
<meta property="og:url" content="${url}">
<meta property="og:type" content="article">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<script type="application/ld+json">${JSON.stringify(webpage)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${marquee(TOP_MARQUEE, false)}
${nav()}
<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);"><a href="/" style="color:var(--muted);">Home</a> <span style="color:var(--hint); margin:0 8px;">/</span> <a href="/guides/" style="color:var(--muted);">Guides</a> <span style="color:var(--hint); margin:0 8px;">/</span> <span style="color:var(--text); font-weight:600;">${esc(g.crumb)}</span></nav>
<main id="main">
<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-6); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// ${esc(g.kicker)}</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,8vw,96px); text-align:left;">${g.h1}</h1>
<div class="guide-byline">
  <span class="guide-byline-author">By <a href="/about/">Tim Paemi</a></span>
  <span class="guide-byline-dot">·</span>
  <span class="guide-byline-time">${esc(g.readTime || '7 min read')}</span>
  <span class="guide-byline-dot">·</span>
  <span class="guide-byline-date">Updated <time datetime="${meta.TODAY}">${meta.TODAY}</time></span>
  <span class="guide-byline-dot">·</span>
  <a href="/methodology/" class="guide-byline-link">How we rank →</a>
</div>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;">${g.lede}</p>
    <p class="hero-meta" style="text-align:left;">Pattaya · ${VENUE_N} venues hand-checked · <a href="/compare/">Compare gyms</a></p>
  </div>
</section>
<section class="section" style="padding-top:var(--s-4);">
  <div class="wrap">
    <article class="venue-body" style="max-width:880px; margin:0 auto;">
${g.body}
    </article>
  </div>
</section>
${sisterContextBlock(g.sisterLinks)}
</main>
${paNetwork()}
${marquee(BOTTOM_MARQUEE, true)}
${footer(meta)}
</body>
</html>
`;

  const dir = path.join(ROOT, 'guides', g.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  return html.length;
}

module.exports = { writeEditorialGuide, getBuildMeta, ROOT, sisterContextBlock };
