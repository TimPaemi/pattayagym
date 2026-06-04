#!/usr/bin/env node
/**
 * build-favorites-page.js — /favorites/ shortlist (localStorage via favorites.js)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : '457';
const ASSET = `?v=${ASSET_VERSION}`;
const BUILD_TS = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
const { GYMS } = require(path.join(ROOT, 'data.js'));
const { v2NavHtml } = require('./lib/v2-nav.js');
const VENUE_N = GYMS.length;

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const TOP_MARQUEE = ['★ EVERY GYM', 'EVERY RING', 'EVERY COURT', `${VENUE_N} VENUES`, 'HAND-CHECKED', 'NO PAID PLACEMENTS', 'PATTAYA · THAILAND', 'UPDATED ROLLING'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA', 'NO PAID PLACEMENTS', 'HAND-CHECKED', 'EVERY GYM', 'EVERY RING', 'EVERY COURT', `★ LIVE ${VENUE_N} VENUES`, 'UPDATED ROLLING'];

function marquee(items, bot) {
  const cls = bot ? 'marquee marquee-bottom' : 'marquee';
  const inner = items.map(it => `<span>${esc(it)}</span><span class="star">·</span>`).join('');
  return `<div class="${cls}" aria-hidden="true"><div class="marquee-track"><div class="marquee-set">${inner}</div><div class="marquee-set" aria-hidden="true">${inner}</div></div></div>`;
}

const title = 'Your saved Pattaya gyms — Pattaya.Gym';
const desc = `Save venues to your personal shortlist in the browser. ${VENUE_N} Pattaya gyms, Muay Thai camps, and sport venues — no account, stored locally on your device.`;
const url = `${SITE}/favorites/`;

const html = `<!DOCTYPE html>
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
<link rel="preload" href="/fonts/space-grotesk.woff2${ASSET}" as="font" type="font/woff2" crossorigin>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:url" content="${url}">
<meta name="robots" content="noindex, follow">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${marquee(TOP_MARQUEE, false)}
${v2NavHtml()}
<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);">
  <a href="/" class="u-muted">Home</a> <span class="u-crumb-sep">/</span> <span class="u-text-bold">Favorites</span>
</nav>
<main id="main">
<section class="hero hub-hero" style="text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Shortlist · Browser-only · ${VENUE_N} venues</div>
    <h1 class="hero-h1">Your <span class="accent-pink">favorites.</span></h1>
    <p class="hero-lede u-text-left-ml0">Tap <strong>Save</strong> on ranked guide picks to build a shortlist. Stored in your browser only — not on our servers. Clear anytime.</p>
    <div class="btn-row u-mt-5">
      <a href="/search/" class="btn btn-primary">▶ Find venues</a>
      <a href="/compare/" class="btn btn-secondary">Compare →</a>
      <button type="button" class="btn btn-ghost" id="favorites-clear-all" data-clear-favorites>Clear list</button>
    </div>
  </div>
</section>
<section class="section u-pt-0" id="favorites-section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> Saved venues</div>
    <div id="favorites-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
    <div id="favorites-empty" class="tool-empty-card">
      <h3>No saved venues yet</h3>
      <p>Open any ranked guide and tap <strong>Save</strong> on a venue card. Your list appears here instantly.</p>
      <div class="tool-empty-actions">
        <a href="/guides/best-muay-thai-pattaya/" class="btn btn-secondary">Best Muay Thai guide</a>
        <a href="/search/" class="btn btn-ghost">Search all venues</a>
      </div>
    </div>
    <div id="favorites-list" class="favorites-list"></div>
  </div>
</section>
</main>
<section class="pa-network"><a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer" class="u-plain-link"><div class="pa-network-badge">★ A Pattaya Authority property ★</div></a><h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2><p class="pa-network-sub">// Independent Pattaya guides · TimPaemi network</p></section>
${marquee(BOTTOM_MARQUEE, true)}
<footer class="footer" role="contentinfo"><div class="footer-grid"><div><div class="footer-brand">pattaya<span class="accent">.gym</span></div><div class="footer-slogan">Built in Pattaya. For Pattaya.</div><p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> ${VENUE_N} venues hand-checked. No paid placements.</p></div><div class="footer-col"><div class="footer-col-h">// The site</div><ul><li><a href="/search/">Search</a></li><li><a href="/compare/">Compare</a></li><li><a href="/guides/">Guides</a></li></ul></div></div><div class="footer-base"><span>© 2026 TimPaemi Co., Ltd.</span><span class="u-cyan">★ v${ASSET_VERSION}</span></div></footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>
<script src="/data.js${ASSET}"></script>
<script defer src="/favorites.js${ASSET}"></script>
<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="/analytics.js${ASSET}"></script>
</body>
</html>
`;

fs.mkdirSync(path.join(ROOT, 'favorites'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'favorites', 'index.html'), html, 'utf8');
console.log(`/favorites/index.html written (${(html.length / 1024).toFixed(1)} KB)`);
