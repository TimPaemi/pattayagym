#!/usr/bin/env node
/**
 * build-compare-page.js
 *
 * Generates /compare/index.html as a REAL functional venue-comparison tool:
 *
 *  - Side-by-side comparison of up to 4 Pattaya venues
 *  - URL-param state: /compare/?a=fairtex-pattaya&b=sityodtong-pattaya&c=kombat-group-thailand
 *  - Venue summary JSON at /data/compare-venues.json (~50KB, ~12KB gzip)
 *  - Pure client-side fetch from same origin (CSP connect-src 'self')
 *  - Picker dropdown lists all venues, sorted alphabetically
 *  - "Share this comparison" button copies URL via Web Share API or clipboard
 *  - "Reset" button clears selection
 *
 * Run: node scripts/build-compare-page.js (idempotent; called from PUSH chain)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : '411';
const ASSET = `?v=${ASSET_VERSION}`;
const BUILD_TS = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

const { GYMS, CATEGORIES } = require(path.join(ROOT, 'data.js'));
const { v2NavHtml } = require('./lib/v2-nav.js');
const { toolBreadcrumb, toolSiteFooterCol } = require('./lib/tool-chrome.js');
const VENUE_N = GYMS.length;

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Build slim summary per venue for the compare table — keep payload small
const venueSummary = GYMS.map(g => ({
  id: g.id,
  name: g.name,
  category: g.category,
  categoryLabel: (CATEGORIES.find(c => c.key === g.category) || {}).label || g.category,
  area: g.area || '',
  hours: g.hours || '',
  priceRange: g.priceRange || '',
  phone: g.phone || '',
  website: g.website || '',
  mapsUrl: g.mapsUrl || '',
  description: (g.description || '').slice(0, 240),
  tags: g.tags || [],
  verified: g.verified || '',
  featured: !!g.featured
})).sort((a, b) => a.name.localeCompare(b.name));

const VENUE_JSON = JSON.stringify(venueSummary);

const TOP_MARQUEE = ['★ EVERY GYM','EVERY RING','EVERY COURT',`${VENUE_N} VENUES`,'HAND-CHECKED','NO PAID PLACEMENTS','PATTAYA · THAILAND','UPDATED ROLLING'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA','NO PAID PLACEMENTS','HAND-CHECKED','EVERY GYM','EVERY RING','EVERY COURT',`★ LIVE ${VENUE_N} VENUES`,'UPDATED ROLLING'];

function marquee(items, bot) {
  const cls = bot ? 'marquee marquee-bottom' : 'marquee';
  const inner = items.map(it => `<span>${esc(it)}</span><span class="star">·</span>`).join('');
  return `<div class="${cls}" aria-hidden="true"><div class="marquee-track"><div class="marquee-set">${inner}</div><div class="marquee-set" aria-hidden="true">${inner}</div></div></div>`;
}

const title = 'Compare Pattaya gyms side by side — Pattaya.Gym';
const desc = 'Real side-by-side comparison of up to 4 Pattaya gyms, Muay Thai camps, or sport venues. Hours, prices, area, contact — all in one table. Live, bookmarkable.';
const url = `${SITE}/compare/`;

const webpage = {'@context':'https://schema.org','@type':'WebApplication','@id':`${url}#webpage`,url,name:title,description:desc,inLanguage:'en','applicationCategory':'UtilitiesApplication','operatingSystem':'Web','isPartOf':{'@id':`${SITE}/#website`}};
const crumbs = {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':`${SITE}/`},{'@type':'ListItem','position':2,'name':'Compare','item':url}]};

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
<link rel="alternate" type="application/json" href="/feed.json" title="Pattaya.Gym feed">
<link rel="preload" href="/data/compare-venues.json" as="fetch" type="application/json" crossorigin>
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
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<script type="application/ld+json">${JSON.stringify(webpage)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${marquee(TOP_MARQUEE, false)}
${v2NavHtml()}
${toolBreadcrumb([{ label: 'Home', href: '/' }, { label: 'Compare' }])}

<main id="main">

<section class="hero" style="padding-top:var(--s-8); padding-bottom:var(--s-4); text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Side-by-side · Up to 4 venues · Bookmarkable URLs</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,8vw,96px); text-align:left;">
      Compare <span class="accent-yellow">venues.</span>
    </h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;">Pick up to 4 Pattaya venues from the ${VENUE_N} in our directory. See hours, prices, area, contact channels, key tags, and verified date — side by side. Share the comparison via URL.</p>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> Pick venues</div>
    <h2 class="h-section">Add up to 4 <span class="accent-cyan">venues.</span></h2>
    <p id="compare-loading" class="lede" style="color:var(--muted);">Loading venue directory…</p>
    <noscript>
      <p class="lede" style="margin-top:var(--s-3);">JavaScript is required for the live comparison table. <a href="/search/">Search all ${VENUE_N} venues</a>, browse <a href="/category/muay-thai/">Muay Thai</a> or <a href="/category/fitness/">fitness</a>, or open preset links in section 03 below.</p>
    </noscript>
    <div class="compare-pickers" id="pickers">
      <!-- pickers rendered by JS -->
    </div>
    <div class="compare-actions" style="margin-top:var(--s-4);">
      <button type="button" class="btn btn-ghost" id="compare-share">↗ Share comparison</button>
      <button type="button" class="btn btn-ghost" id="compare-reset">Reset</button>
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> Side-by-side</div>
    <h2 class="h-section">Compare <span class="accent-pink">live.</span></h2>
    <!-- Round 17 — Codex F12.1: announce selection/result changes to assistive tech -->
    <div id="compare-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
    <p class="compare-table-scroll-hint" id="compare-scroll-hint">Swipe table to see all columns →</p>
    <div id="compare-table-mount" class="compare-table-scroll"></div>
    <div id="compare-empty" class="tool-empty-card" hidden>
      <h3>Pick at least 2 venues</h3>
      <p>Choose two or more gyms from the dropdowns above, or start from a preset below.</p>
      <div class="tool-empty-actions">
        <a href="/search/" class="btn btn-secondary">Search all venues</a>
        <a href="/favorites/" class="btn btn-secondary">♡ Favorites</a>
        <a href="/guides/best-muay-thai-pattaya/" class="btn btn-ghost">Best Muay Thai guide</a>
      </div>
    </div>
  </div>
</section>

<section class="section u-pt-4">
  <div class="wrap">
    <div class="eyebrow"><span class="num">03</span> Examples</div>
    <h2 class="h-section">Try a <span class="accent-mint">preset.</span></h2>
    <p class="lede">Three popular comparisons to start from:</p>
    <div class="btn-row" style="flex-wrap:wrap; gap:8px;">
      <a href="/compare/?a=fairtex-pattaya&amp;b=sityodtong-pattaya&amp;c=kombat-group-thailand" class="btn btn-secondary">Top 3 Muay Thai resort camps</a>
      <a href="/compare/?a=wko-muay-thai&amp;b=battle-conquer-gym&amp;c=tonys-gym" class="btn btn-secondary">Budget Muay Thai (Central)</a>
      <a href="/compare/?a=siam-country-club&amp;b=laem-chabang-international&amp;c=phoenix-gold-golf" class="btn btn-secondary">Top 3 golf courses</a>
    </div>
  </div>
</section>

</main>

<section class="pa-network"><a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer" class="u-plain-link"><div class="pa-network-badge">★ A Pattaya Authority property ★</div></a><h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2><p class="pa-network-sub">// Site engineered, operated &amp; maintained in-house<br>by the founders of TimPaemi</p></section>
${marquee(BOTTOM_MARQUEE, true)}
<footer class="footer" role="contentinfo"><div class="footer-grid"><div><div class="footer-brand">pattaya<span class="accent">.gym</span></div><div class="footer-slogan">Built in Pattaya. For Pattaya.</div><p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> ${VENUE_N} venues hand-checked. No paid placements. Independent directory operated by TimPaemi Co., Ltd. from our Pattaya villa.</p><p class="u-foot-meta">— Tim &amp; Paemi, founders</p><div class="footer-meta">TimPaemi Co., Ltd.<br>Pattaya City, Bang Lamung District<br>Chon Buri 20150 · Thailand</div></div>${toolSiteFooterCol()}<div class="footer-col"><div class="footer-col-h">// Projects</div><ul class="footer-projects"><li><a href="https://pattaya-authority.com/work/pattaya-gym-directory/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a></li><li><a href="https://timpaemi.com/" target="_blank" rel="noopener noreferrer">TimPaemi</a></li><li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya Restaurant Guide</a></li><li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a></li><li><a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a></li><li><a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">Pattaya Coffee</a></li><li><a href="https://pattayastream.com/" target="_blank" rel="noopener noreferrer">Pattaya Villa Stream</a></li><li><a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a></li><li><a href="https://pattayapets.com/" target="_blank" rel="noopener noreferrer">PattayaPets</a></li><li><a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a></li></ul></div><div class="footer-col"><div class="footer-col-h">// Direct</div><ul><li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li><li><a href="https://api.whatsapp.com/send/?phone=66967286999" target="_blank" rel="noopener noreferrer">WhatsApp · +66 96 728 6999</a></li><li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer">LINE · @timpaemi</a></li><li><a href="/contact/">Contact page</a></li></ul></div></div><div class="footer-base"><span>© 2026 TimPaemi Co., Ltd. · All rights reserved</span><span class="footer-version-badge">Built ${BUILD_TS} · <a href="/changelog/">v${ASSET_VERSION}</a></span><span class="pattaya-time">Pattaya · <span class="pattaya-time-value" id="pt-clock">--:--</span> ICT</span></div></footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>

<script>
 (function(){
  var data = [];
  var maxSlots = 4;
  var slots = ['a','b','c','d'];
  var STORAGE_KEY = 'pg_compare_slots_v1';

  function getSelected() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = slots.map(function(k){ return params.get(k) || ''; });
    if (fromUrl.some(Boolean)) return fromUrl;
    try {
      var saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length === maxSlots) return saved;
    } catch (e) { /* ignore */ }
    return ['','','',''];
  }
  function track(name, params){ try { if (window.gtag) window.gtag('event', name, params || {}); } catch(e){} }
  function setSelected(arr) {
    var params = new URLSearchParams();
    var picked = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) { params.set(slots[i], arr[i]); picked.push(arr[i]); }
    }
    var qs = params.toString();
    var newUrl = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', newUrl);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) { /* private mode */ }
    track('compare_pick', { count: picked.length, venues: picked.join('|') });
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[<>&"']/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]; });
  }
  function venueById(id) { return data.find(function(v){ return v.id === id; }); }

  // Render pickers (one per slot)
  var pickersEl = document.getElementById('pickers');
  function renderPickers() {
    var sel = getSelected();
    var html = '';
    for (var i = 0; i < maxSlots; i++) {
      var current = sel[i];
      html += '<div class="compare-picker"><label class="compare-picker-label">Venue ' + (i+1) + '</label><select data-slot="' + i + '" class="compare-picker-select"><option value="">— pick a venue —</option>';
      for (var j = 0; j < data.length; j++) {
        var v = data[j];
        var selected = v.id === current ? ' selected' : '';
        html += '<option value="' + escapeHtml(v.id) + '"' + selected + '>' + escapeHtml(v.name) + (v.featured ? ' ★' : '') + ' — ' + escapeHtml(v.categoryLabel) + '</option>';
      }
      html += '</select></div>';
    }
    pickersEl.innerHTML = html;
    pickersEl.querySelectorAll('select').forEach(function(s){
      s.addEventListener('change', function(){
        var slotIdx = parseInt(s.getAttribute('data-slot'), 10);
        var cur = getSelected();
        cur[slotIdx] = s.value || '';
        setSelected(cur);
        renderTable();
      });
    });
  }

  // Render side-by-side table
  var tableMount = document.getElementById('compare-table-mount');
  var emptyMsg = document.getElementById('compare-empty');
  var statusEl = document.getElementById('compare-status');
  function announce(msg) { if (statusEl) statusEl.textContent = msg; }
  function renderTable() {
    var ids = getSelected().filter(Boolean);
    var venues = ids.map(venueById).filter(Boolean);
    if (venues.length < 2) {
      tableMount.innerHTML = '';
      emptyMsg.hidden = false;
      announce(venues.length === 0 ? 'No venues selected for comparison.' : 'One venue selected. Pick at least one more to compare.');
      return;
    }
    emptyMsg.hidden = true;
    announce('Comparing ' + venues.length + ' venues: ' + venues.map(function(v){return v.name;}).join(', ') + '.');
    var rows = [
      { key: 'name', label: 'Name', render: function(v){ return '<a href="/gyms/' + escapeHtml(v.id) + '/" style="color:var(--cyan); font-weight:700; text-decoration:none; border-bottom:1px dotted rgba(78,224,255,0.35);">' + escapeHtml(v.name) + '</a>'; } },
      { key: 'editors', label: 'Editor\\'s Pick', render: function(v){ return v.featured ? '<span style="color:var(--yellow); font-weight:700;">★ Yes</span>' : '<span class="u-muted">—</span>'; } },
      { key: 'cat', label: 'Sport', render: function(v){ return '<a href="/category/' + escapeHtml(v.category) + '/" style="color:var(--text); text-decoration:none;">' + escapeHtml(v.categoryLabel) + '</a>'; } },
      { key: 'area', label: 'Area', render: function(v){ return escapeHtml(v.area || '—'); } },
      { key: 'price', label: 'Price', render: function(v){ return v.priceRange ? '<strong style="color:var(--yellow);">' + escapeHtml(v.priceRange) + '</strong>' : '<span class="u-muted">—</span>'; } },
      { key: 'hours', label: 'Hours', render: function(v){ return v.hours ? escapeHtml(v.hours) : '<span class="u-muted">—</span>'; } },
      { key: 'phone', label: 'Phone', render: function(v){ return v.phone ? '<a href="tel:' + escapeHtml(v.phone.replace(/[^+0-9]/g,'')) + '" style="color:var(--pink); text-decoration:none;">' + escapeHtml(v.phone) + '</a>' : '<span class="u-muted">unpublished</span>'; } },
      { key: 'web', label: 'Website', render: function(v){ return v.website ? '<a href="' + escapeHtml(v.website) + '" target="_blank" rel="noopener noreferrer" style="color:var(--cyan); text-decoration:underline; text-decoration-color:rgba(78,224,255,0.3);">official ↗</a>' : '<span class="u-muted">—</span>'; } },
      { key: 'map', label: 'Map', render: function(v){ return v.mapsUrl ? '<a href="' + escapeHtml(v.mapsUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--mint); text-decoration:none;">📍 directions</a>' : '<span class="u-muted">—</span>'; } },
      { key: 'tags', label: 'Tags', render: function(v){ return (v.tags && v.tags.length) ? v.tags.slice(0, 4).map(function(t){ return '<span style="display:inline-block; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:999px; font-size:11px; margin:2px 4px 2px 0;">' + escapeHtml(t) + '</span>'; }).join('') : '<span class="u-muted">—</span>'; } },
      { key: 'desc', label: 'Description', render: function(v){ return v.description ? escapeHtml(v.description) + (v.description.length >= 240 ? '…' : '') : '<span class="u-muted">—</span>'; } },
      { key: 'verified', label: 'Verified', render: function(v){ return v.verified ? '<span style="color:var(--cyan); font-family:var(--font-mono); font-size:12px;">★ ' + escapeHtml(v.verified) + '</span>' : '<span class="u-muted">—</span>'; } }
    ];
    var html = '<table class="compare-table"><thead><tr><th></th>';
    for (var i = 0; i < venues.length; i++) html += '<th>Venue ' + (i+1) + '</th>';
    html += '</tr></thead><tbody>';
    for (var r = 0; r < rows.length; r++) {
      html += '<tr><th class="compare-row-label">' + rows[r].label + '</th>';
      for (var i = 0; i < venues.length; i++) html += '<td>' + rows[r].render(venues[i]) + '</td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    tableMount.innerHTML = html;
  }

  document.getElementById('compare-share').addEventListener('click', function(){
    var url = window.location.href;
    var sel = getSelected().filter(Boolean);
    if (sel.length < 2) { alert('Pick at least 2 venues to share a comparison.'); return; }
    if (navigator.share) {
      navigator.share({ title: 'Pattaya gym comparison', url: url, text: 'Comparing ' + sel.length + ' Pattaya venues on Pattaya.Gym' }).catch(function(){});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function(){
        var btn = document.getElementById('compare-share');
        var orig = btn.textContent;
        btn.textContent = '✓ Link copied';
        setTimeout(function(){ btn.textContent = orig; }, 2000);
      });
    } else {
      window.prompt('Copy link:', url);
    }
  });

  document.getElementById('compare-reset').addEventListener('click', function(){
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    setSelected(['','','','']);
    renderPickers();
    renderTable();
  });

  function boot() {
    renderPickers();
    renderTable();
  }

  var loadingEl = document.getElementById('compare-loading');
  fetch('/data/compare-venues.json', { credentials: 'same-origin' })
    .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(d){ data = d; if (loadingEl) loadingEl.remove(); boot(); })
    .catch(function(){
      if (loadingEl) loadingEl.textContent = 'Could not load venue data. Refresh the page or use /search/ to browse venues.';
      announce('Venue data failed to load.');
    });
})();
</script>
<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${ASSET}"></script>
</body>
</html>
`;

const dataDir = path.join(ROOT, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const jsonPath = path.join(dataDir, 'compare-venues.json');
fs.writeFileSync(jsonPath, JSON.stringify(venueSummary), 'utf8');
fs.mkdirSync(path.join(ROOT, 'compare'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'compare', 'index.html'), html, 'utf8');
console.log(`/compare/index.html written (${(html.length/1024).toFixed(1)} KB HTML) + /data/compare-venues.json (${(VENUE_JSON.length/1024).toFixed(1)} KB, ${venueSummary.length} venues)`);
