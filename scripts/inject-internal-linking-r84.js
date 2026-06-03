#!/usr/bin/env node
/**
 * inject-internal-linking-r84.js — Full internal link mesh: venue taxonomy, nearby area,
 * site tools, sister-context on ranked/utility pages, expanded pa-network grid.
 * Run after build-v2.js and inject-internal-linking-r41.js. Idempotent (r84 markers).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GYMS, CATEGORIES } = require('../data.js');
const { paNetworkHtml, sisterContextHtml, defaultSisterContextLinks } = require('./lib/pa-network-block');

const ROOT = path.resolve(__dirname, '..');
const TAX_MARKER = 'venue-taxonomy-r84';
const NEARBY_MARKER = 'venue-nearby-r84';
const TOOLS_MARKER = 'venue-tools-r84';
const SISTER_MARKER = 'sister-context-r84';
const HUB_MARKER = 'site-tools-hub-r84';
const HOMEPAGE_AREA_MARKER = 'homepage-area-hub-r88';

const AREA_MAP = {
  jomtien: /jomtien/i,
  naklua: /naklua|north\s*pattaya|wongamat/i,
  pratamnak: /pratamnak|pratumnak/i,
  'central-pattaya': /central|beach\s*road|walking|soi\s*buakhao|3rd\s*road|mike|south\s*pattaya|pattaya\s*klang|thepprasit|pattaya\s*city|^pattaya\b/i,
  'east-pattaya': /east|darkside|mabprachan|nong\s*prue|sukhumvit|huai\s*yai|si\s*racha|siracha|bang\s*phra|ban\s*bueng|khao\s*khansong|huay\s*yai/i,
  sattahip: /sattahip|na\s*jomtien|bang\s*saray|u-tapao|ban\s*chang|rayong/i,
};
const AREA_LABELS = {
  jomtien: 'Jomtien',
  naklua: 'Naklua',
  pratamnak: 'Pratamnak',
  'central-pattaya': 'Central Pattaya',
  'east-pattaya': 'East Pattaya',
  sattahip: 'Sattahip',
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function areaSlugFrom(areaStr) {
  const a = (areaStr || '').toLowerCase();
  for (const [slug, re] of Object.entries(AREA_MAP)) {
    if (re.test(a)) return slug;
  }
  if (/^pattaya(\s|$|\/|—|\s*city|\s*\()/i.test(a.trim())) return 'central-pattaya';
  return null;
}

function catLabel(key) {
  return (CATEGORIES.find((c) => c.key === key) || {}).label || key;
}

function taxonomySection(gym) {
  const cat = gym.category;
  const area = areaSlugFrom(gym.area);
  const pills = [
    `<a href="/category/${cat}/" class="u-plain-link" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid rgba(255,255,255,0.12);border-radius:999px;font-size:13px;"><span style="color:var(--cyan);font-weight:700;">★</span> All ${esc(catLabel(cat))} in Pattaya</a>`,
  ];
  if (area) {
    pills.push(
      `<a href="/area/${area}/" class="u-plain-link" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid rgba(255,255,255,0.12);border-radius:999px;font-size:13px;"><span style="color:var(--mint);font-weight:700;">◎</span> All sport in ${esc(AREA_LABELS[area] || area)}</a>`
    );
    pills.push(
      `<a href="/area/${area}/${cat}/" class="u-plain-link" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid rgba(255,255,255,0.12);border-radius:999px;font-size:13px;"><span style="color:var(--pink);font-weight:700;">→</span> ${esc(catLabel(cat))} in ${esc(AREA_LABELS[area] || area)}</a>`
    );
  }
  pills.push(`<a href="/sports/" class="u-plain-link" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid rgba(255,255,255,0.12);border-radius:999px;font-size:13px;">Browse all sports</a>`);
  return `
<section class="section u-pt-0" id="${TAX_MARKER}">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Browse</div>
    <h2 class="h-section">Find more <span class="accent-cyan">Pattaya sport.</span></h2>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:var(--s-4);">${pills.join('\n      ')}</div>
  </div>
</section>`;
}

function nearbySection(gym) {
  const area = areaSlugFrom(gym.area);
  if (!area) return '';
  let peers = GYMS.filter((g) => g.id !== gym.id && areaSlugFrom(g.area) === area && g.category !== gym.category)
    .slice(0, 4);
  if (!peers.length) {
    peers = GYMS.filter((g) => g.id !== gym.id && areaSlugFrom(g.area) === area).slice(0, 4);
  }
  if (!peers.length) return '';
  const cards = peers.map((r, i) => `
      <a href="/gyms/${r.id}/" class="numcard u-plain-link">
        <div class="numcard-head">
          <span class="numcard-num">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="numcard-title">// ${esc(r.name)}</h3>
        </div>
        <p class="numcard-body"><strong class="u-text">${esc(catLabel(r.category))}</strong> · ${esc((r.description || '').slice(0, 120))}${(r.description || '').length > 120 ? '…' : ''}</p>
      </a>`).join('');
  return `
<section class="section u-pt-0" id="${NEARBY_MARKER}">
  <div class="wrap">
    <div class="eyebrow"><span class="num">◎</span> Same area</div>
    <h2 class="h-section">Also in <span class="accent-mint">${esc(AREA_LABELS[area])}.</span></h2>
    <p class="lede">Other sports near this venue in ${esc(AREA_LABELS[area])} — cross-train without changing neighborhood.</p>
    <div class="numlist">${cards}</div>
    <p class="u-muted" style="margin-top:12px;font-size:13px;"><a href="/area/${area}/">All venues in ${esc(AREA_LABELS[area])} →</a></p>
  </div>
</section>`;
}

function toolsSection() {
  return `
<section class="section u-pt-0" id="${TOOLS_MARKER}">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Tools</div>
    <h2 class="h-section">Use our <span class="accent-yellow">directory tools.</span></h2>
    <ul class="venue-guide-link-list">
      <li><a href="/compare/">Compare venues</a> — shortlist gyms side-by-side</li>
      <li><a href="/plan-my-trip/">Plan my trip</a> — filter ${GYMS.length} venues by sport and area</li>
      <li><a href="/map/">Map view</a> — Pattaya venue map</li>
      <li><a href="/search/">Search</a> — find by name or sport</li>
      <li><a href="/find-my-coach/">Find my coach</a> — Muay Thai camp matcher</li>
      <li><a href="/guides/">All guides</a> — editorial trip planners</li>
    </ul>
  </div>
</section>`;
}

function homepageAreaHub() {
  const areas = [
    ['Jomtien', 'jomtien', 'Beach, camps, watersports'],
    ['Central Pattaya', 'central-pattaya', 'Walking Street belt'],
    ['Naklua', 'naklua', 'North Pattaya'],
    ['Pratamnak', 'pratamnak', 'Hill + fitness'],
    ['East Pattaya', 'east-pattaya', 'Darkside · Mabprachan'],
    ['Sattahip', 'sattahip', 'Na Jomtien · Bang Saray'],
  ];
  const areaCards = areas.map(([label, slug, desc]) =>
    `<a href="/area/${slug}/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Area</span><span class="intent-card-title">${esc(label)}</span><span class="intent-card-desc">${esc(desc)}</span></a>`
  ).join('\n      ');
  return `
<section class="section u-pt-0" id="${HOMEPAGE_AREA_MARKER}">
  <div class="wrap">
    <div class="eyebrow"><span class="num">◎</span> By area</div>
    <h2 class="h-section">Browse <span class="accent-mint">Pattaya by neighborhood.</span></h2>
    <p class="lede u-max-760">Six area hubs link every venue, sport filter, and editorial guide strip for that part of the city.</p>
    <div class="intent-grid intent-grid-compact" style="margin-top:var(--s-4);">
      ${areaCards}
      <a href="/category/fitness/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Sport</span><span class="intent-card-title">Fitness</span><span class="intent-card-desc">Gyms · 24h · hotel</span></a>
      <a href="/category/golf/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Sport</span><span class="intent-card-title">Golf</span><span class="intent-card-desc">Courses · ranges</span></a>
      <a href="/guides/best-muay-thai-pattaya/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Guide</span><span class="intent-card-title">Best Muay Thai</span><span class="intent-card-desc">Top camp picks</span></a>
    </div>
  </div>
</section>`;
}

function siteToolsHub() {
  return `
<section class="section u-pt-0" id="${HUB_MARKER}">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Directory</div>
    <h2 class="h-section">Explore <span class="accent-cyan">Pattaya.Gym.</span></h2>
    <div class="intent-grid intent-grid-compact" style="margin-top:var(--s-4);">
      <a href="/guides/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Guides</span><span class="intent-card-title">44 trip planners</span><span class="intent-card-desc">Ranked lists, visas, area picks</span></a>
      <a href="/category/muay-thai/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Sport</span><span class="intent-card-title">Muay Thai</span><span class="intent-card-desc">Every camp in Pattaya</span></a>
      <a href="/category/fitness/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Sport</span><span class="intent-card-title">Fitness gyms</span><span class="intent-card-desc">24h, budget, hotel gyms</span></a>
      <a href="/compare/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Tool</span><span class="intent-card-title">Compare</span><span class="intent-card-desc">Side-by-side venue table</span></a>
      <a href="/plan-my-trip/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Tool</span><span class="intent-card-title">Plan trip</span><span class="intent-card-desc">Build your shortlist</span></a>
      <a href="/map/" class="intent-card intent-card-compact"><span class="intent-card-tag">// Tool</span><span class="intent-card-title">Map</span><span class="intent-card-desc">${GYMS.length} pinned venues</span></a>
    </div>
  </div>
</section>`;
}

function insertBeforeAnchor(html, block, anchorSubstr) {
  const idx = html.indexOf(anchorSubstr);
  if (idx < 0) return null;
  return html.slice(0, idx) + block + '\n' + html.slice(idx);
}

function fixPaNetwork(html) {
  if (html.includes('pa-network-grid') && html.includes('Personal Trainer')) return null;
  const re = /<section class="pa-network">[\s\S]*?<\/section>/;
  if (!re.test(html)) return null;
  const isGuide = /\/guides\//.test(html) || html.includes('guide-rank-primer');
  return html.replace(re, paNetworkHtml({ hereOnGym: !isGuide, badgeUrl: 'https://pattaya-authority.com/' }));
}

function injectSisterBeforeMainEnd(html) {
  if (html.includes(SISTER_MARKER) || html.includes('sister-context-h')) return null;
  const end = html.lastIndexOf('</main>');
  if (end < 0) return null;
  return html.slice(0, end) + sisterContextHtml(defaultSisterContextLinks()) + '\n' + html.slice(end);
}

const stats = {
  r41: false,
  taxonomy: 0,
  nearby: 0,
  tools: 0,
  sister: 0,
  hub: 0,
  paNetwork: 0,
  homepageArea: 0,
};

console.log('Round 84 internal linking…');

try {
  execSync('node scripts/inject-internal-linking-r41.js', { cwd: ROOT, stdio: 'inherit' });
  stats.r41 = true;
} catch (e) {
  console.warn('inject-internal-linking-r41 warning:', e.message);
}

for (const g of GYMS) {
  const fp = path.join(ROOT, 'gyms', g.id, 'index.html');
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  let changed = false;

  const pn = fixPaNetwork(html);
  if (pn) { html = pn; stats.paNetwork++; changed = true; }

  const anchors = [
    '<section class="section">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">★</span> Same sport</div>',
    '<section class="section u-pt-0 venue-guide-links" id="venue-guides-r41">',
    '<section class="pa-network">',
  ];
  function insertBeforeFirstAnchor(block) {
    for (const a of anchors) {
      const next = insertBeforeAnchor(html, block, a);
      if (next) return next;
    }
    return null;
  }
  if (!html.includes(TAX_MARKER)) {
    const tax = taxonomySection(g);
    const next = insertBeforeFirstAnchor(tax);
    if (next) { html = next; stats.taxonomy++; changed = true; }
  }
  if (!html.includes(NEARBY_MARKER)) {
    const near = nearbySection(g);
    if (near) {
      const next = insertBeforeFirstAnchor(near);
      if (next) { html = next; stats.nearby++; changed = true; }
    }
  }
  if (!html.includes(TOOLS_MARKER)) {
    const tools = toolsSection();
    const end = html.lastIndexOf('</main>');
    if (end > 0) {
      html = html.slice(0, end) + tools + '\n' + html.slice(end);
      stats.tools++;
      changed = true;
    }
  }

  if (changed) fs.writeFileSync(fp, html, 'utf8');
}

const utilityPages = [
  'index.html',
  'sports/index.html',
  'about/index.html',
  'methodology/index.html',
  'changelog/index.html',
  'compare/index.html',
  'plan-my-trip/index.html',
  'map/index.html',
  'search/index.html',
  'find-my-coach/index.html',
  'favorites/index.html',
  'guides/index.html',
];
const indexFp = path.join(ROOT, 'index.html');
if (fs.existsSync(indexFp)) {
  let html = fs.readFileSync(indexFp, 'utf8');
  let changed = false;
  if (!html.includes(HOMEPAGE_AREA_MARKER)) {
    const anchor = '<section class="section intent-router" id="start-here">';
    const block = homepageAreaHub();
    const next = insertBeforeAnchor(html, block, anchor);
    if (next) { html = next; stats.homepageArea++; changed = true; }
  }
  if (changed) fs.writeFileSync(indexFp, html, 'utf8');
}

for (const rel of utilityPages) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  let changed = false;
  const pn = fixPaNetwork(html);
  if (pn) { html = pn; stats.paNetwork++; changed = true; }
  if (!html.includes(HUB_MARKER)) {
    const end = html.lastIndexOf('</main>');
    if (end > 0) {
      html = html.slice(0, end) + siteToolsHub() + '\n' + html.slice(end);
      stats.hub++;
      changed = true;
    }
  }
  const sis = injectSisterBeforeMainEnd(html);
  if (sis) { html = sis; stats.sister++; changed = true; }
  if (changed) fs.writeFileSync(fp, html, 'utf8');
}

const walkDirs = [
  path.join(ROOT, 'guides'),
  path.join(ROOT, 'category'),
  path.join(ROOT, 'area'),
];
for (const base of walkDirs) {
  if (!fs.existsSync(base)) continue;
  const stack = [base];
  while (stack.length) {
    const dir = stack.pop();
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(fp);
      else if (ent.name === 'index.html') {
        let html = fs.readFileSync(fp, 'utf8');
        let changed = false;
        const pn = fixPaNetwork(html);
        if (pn) { html = pn; stats.paNetwork++; changed = true; }
        const sis = injectSisterBeforeMainEnd(html);
        if (sis) { html = sis; stats.sister++; changed = true; }
        if (changed) fs.writeFileSync(fp, html, 'utf8');
      }
    }
  }
}

console.log(`\nRound 84 internal linking: r41=${stats.r41}, taxonomy=${stats.taxonomy}, nearby=${stats.nearby}, tools=${stats.tools}, sister=${stats.sister}, hub=${stats.hub}, paNetwork=${stats.paNetwork}, homepageArea=${stats.homepageArea}.`);
