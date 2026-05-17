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
const ASSET_VERSION = '402';
const TODAY = new Date().toISOString().slice(0, 10);
const BUILD_TIMESTAMP = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

// ---------- Load data ----------
const { CATEGORIES, GYMS } = require('./data.js');

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

function writeFile(filePath, content) {
  safeMkdir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
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

// ---------- Minimal markdown -> HTML ----------
function mdToHtml(md) {
  if (!md) return '';
  let html = md;

  // Code blocks (preserve)
  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/g, (m, code) => {
    codeBlocks.push(code);
    return `<<<CODEBLOCK${codeBlocks.length - 1}>>>`;
  });

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>'); // demote h1

  // Bold + italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[\s(])\*([^*\n]+)\*([\s).,!?]|$)/g, '$1<em>$2</em>$3');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Lists (very basic)
  html = html.replace(/(^|\n)((?:- .+\n?)+)/g, (m, lead, items) => {
    const lis = items.trim().split(/\n/).map(l => `<li>${l.replace(/^- /, '').trim()}</li>`).join('');
    return `${lead}<ul>${lis}</ul>`;
  });
  html = html.replace(/(^|\n)((?:\d+\. .+\n?)+)/g, (m, lead, items) => {
    const lis = items.trim().split(/\n/).map(l => `<li>${l.replace(/^\d+\.\s*/, '').trim()}</li>`).join('');
    return `${lead}<ol>${lis}</ol>`;
  });

  // Tables (pipe syntax)
  html = html.replace(/(^|\n)(\|[^\n]+\|\n\|[\s\-:|]+\|\n(?:\|[^\n]+\|\n?)+)/g, (m, lead, table) => {
    const rows = table.trim().split('\n');
    const header = rows[0].split('|').slice(1, -1).map(c => c.trim());
    const body = rows.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()));
    let h = '<table><thead><tr>';
    header.forEach(c => h += `<th>${c}</th>`);
    h += '</tr></thead><tbody>';
    body.forEach(row => {
      h += '<tr>';
      row.forEach(c => h += `<td>${c}</td>`);
      h += '</tr>';
    });
    h += '</tbody></table>';
    return `${lead}${h}`;
  });

  // Paragraphs (only wrap loose lines)
  html = html.split(/\n{2,}/).map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-6]|ul|ol|table|blockquote|pre|p|div)[\s>]/.test(trimmed)) return trimmed;
    if (/^<<<CODEBLOCK\d+>>>$/.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  // Restore code blocks
  html = html.replace(/<<<CODEBLOCK(\d+)>>>/g, (m, i) => {
    return `<pre><code>${esc(codeBlocks[i].trim())}</code></pre>`;
  });

  return html;
}

// ---------- Shared HTML components ----------
const ASSET = `?v=${ASSET_VERSION}`;

function head({ title, desc, url, ogImage = `${SITE}/og-image.png`, jsonLd = null }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${url}">
<link rel="preload" href="/styles.css${ASSET}" as="style">
<link rel="stylesheet" href="/styles.css${ASSET}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%23000'/%3E%3Ctext x='50%25' y='62%25' font-family='Inter,sans-serif' font-size='40' font-weight='800' fill='%23ff2e7e' text-anchor='middle'%3EP%3C/text%3E%3C/svg%3E">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-F5F6KD3XFZ');</script>
</head>
<body>`;
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

function nav() {
  return `<header class="nav" role="banner">
  <div class="nav-row">
    <a href="/" class="brand">pattaya<span class="dot">.</span>gym</a>
    <nav class="nav-links" aria-label="Primary">
      <a href="/category/muay-thai/">Muay Thai</a>
      <a href="/category/fitness/">Fitness</a>
      <a href="/category/golf/">Golf</a>
      <a href="/category/yoga/">Yoga</a>
      <a href="/guides/">Guides</a>
    </nav>
    <a href="/search/" class="nav-cta">★ Find a gym</a>
  </div>
</header>`;
}

function paNetwork() {
  return `<section class="pa-network">
  <a href="https://pattaya-authority.com/" target="_blank" rel="noopener" style="text-decoration:none; color:inherit;">
    <div class="pa-network-badge">★ A Pattaya Authority property ★</div>
  </a>
  <h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2>
  <p class="pa-network-sub">// Site engineered, operated &amp; maintained in-house<br>by the founders of TimPaemi</p>
</section>`;
}

function backToTop() {
  return `<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" aria-label="Back to top" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑</button>
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
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
</script>`;
}

function footer() {
  return `<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div>
      <div class="footer-brand">pattaya<span class="accent">.gym</span></div>
      <p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> 158 venues hand-checked. No paid placements. Independent directory operated by TimPaemi Co., Ltd. from our Pattaya villa.</p>
      <p style="font-size:13px; color:var(--muted); margin:var(--s-4) 0 0;">— Tim &amp; Paemi, founders</p>
      <div class="footer-meta">
        TimPaemi Co., Ltd.<br>
        Pattaya City, Bang Lamung District<br>
        Chon Buri 20150 · Thailand
      </div>
    </div>
    <div class="footer-col">
      <h4>// The site</h4>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/methodology/">Methodology</a></li>
        <li><a href="/guides/">Guides</a></li>
        <li><a href="/search/">Search</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>// Projects</h4>
      <ul>
        <li><a href="https://pattaya-authority.com/" target="_blank" rel="noopener">Pattaya Authority</a></li>
        <li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener">Restaurant Guide</a></li>
        <li><a href="/">Pattaya.Gym</a></li>
        <li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener">Visa Help</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>// Direct</h4>
      <ul>
        <li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li>
        <li><a href="https://api.whatsapp.com/send/?phone=66967286999" target="_blank" rel="noopener">WhatsApp · +66 96 728 6999</a></li>
        <li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener">LINE · @timpaemi</a></li>
        <li><a href="/contact/">Contact page</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-base">
    <span>© 2026 TimPaemi Co., Ltd. · All rights reserved</span>
    <span style="color:var(--cyan);">★ Last updated · ${BUILD_TIMESTAMP}</span>
    <span>12.92°N · 100.87°E · Pattaya Villa</span>
  </div>
</footer>
${backToTop()}
</body>
</html>`;
}

// Standard top/bottom marquee items
const TOP_MARQUEE = ['★ EVERY GYM', 'EVERY RING', 'EVERY COURT', '158 VENUES', 'HAND-CHECKED', 'NO PAID PLACEMENTS', 'PATTAYA · THAILAND', 'UPDATED WEEKLY'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA', 'NO PAID PLACEMENTS', '100% HAND-CHECKED', 'EVERY GYM', 'EVERY RING', 'EVERY COURT', '★ LIVE 158 VENUES', 'UPDATED WEEKLY'];

function breadcrumb(items) {
  // items: [{label, href}], last has no href
  const parts = items.map((it, i) => {
    const isLast = i === items.length - 1;
    if (isLast) return `<span style="color:var(--text); font-weight:600;">${esc(it.label)}</span>`;
    return `<a href="${it.href}" style="color:var(--muted);">${esc(it.label)}</a>`;
  });
  return `<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);">
  ${parts.join(' <span style="color:var(--hint); margin:0 8px;">/</span> ')}
</nav>`;
}

// ---------- Venue page ----------
function venuePage(g, fm, body) {
  const cat = CATEGORIES.find(c => c.key === g.category);
  const catLabel = cat ? cat.label : g.category;
  const url = `${SITE}/gyms/${g.id}/`;
  const title = `${g.name} — ${catLabel} in Pattaya | Pattaya.Gym`;
  const desc = (g.description || '').slice(0, 158);
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

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: g.name,
    description: g.description,
    address: g.address || undefined,
    telephone: g.phone || undefined,
    url: url,
    image: ogImage,
    priceRange: g.priceRange || undefined,
    openingHours: g.hours || undefined,
    sameAs: [g.website, g.social?.facebook ? `https://facebook.com/${g.social.facebook}` : null, g.social?.instagram ? `https://instagram.com/${g.social.instagram}` : null].filter(Boolean)
  };

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
    v.phone && { lbl: 'Phone', val: v.phone, link: 'tel:' + v.phone.replace(/\s+/g,''), color: 'pink' },
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

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-8); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// ${esc(catLabel)}${g.area ? ' · ' + esc(g.area.split(/[—\/,]/)[0].trim()) : ''}${g.priceRange ? ' · ' + esc(g.priceRange) : ''}</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,9vw,100px); text-align:left;">
      ${firstWords ? esc(firstWords) + '<br>' : ''}<span class="${accent.class}">${esc(lastWord)}.</span>
    </h1>
    ${subtitleName ? `<p style="font-family:var(--font-mono); font-size:13px; color:var(--muted); letter-spacing:0.08em; margin:var(--s-4) 0 0; text-transform:uppercase;">${esc(subtitleName)}</p>` : ''}
    ${g.description ? `<p class="hero-lede" style="text-align:left; margin-left:0; margin-right:0; margin-top:var(--s-5); font-size:clamp(16px,2vw,19px);">${esc(g.description)}</p>` : ''}
    <div class="btn-row" style="justify-content:flex-start; margin-top:var(--s-6);">
      ${g.phone ? `<a href="tel:${esc(g.phone.replace(/\s+/g,''))}" class="btn btn-primary">▶ Call gym</a>` : ''}
      <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=${encodeURIComponent('Hi! Asking about ' + g.name + ' via pattaya-gym.com')}" target="_blank" rel="noopener" class="btn btn-secondary">● WhatsApp us</a>
      <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Inquiry: ' + g.name)}" class="btn btn-tertiary">Email →</a>
      ${g.mapsUrl ? `<a href="${esc(g.mapsUrl)}" target="_blank" rel="noopener" class="btn btn-ghost">📍 Map</a>` : ''}
      ${g.website ? `<a href="${esc(g.website)}" target="_blank" rel="noopener" class="btn btn-ghost">Website →</a>` : ''}
    </div>
  </div>
</section>

${infoFields.length ? `
<section class="section" style="padding-top:var(--s-4); padding-bottom:var(--s-8);">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Venue info</div>
    <div style="display:grid; grid-template-columns:1fr; gap:0; border:1px solid var(--line); border-radius:var(--r-lg); overflow:hidden; background:var(--surface);">
      ${infoFields.map((f, i) => `
      <div style="display:grid; grid-template-columns:130px 1fr; gap:var(--s-4); padding:var(--s-4) var(--s-5);${i < infoFields.length-1 ? ' border-bottom:1px solid var(--line);' : ''}">
        <div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); font-weight:600; letter-spacing:0.10em; text-transform:uppercase;">${esc(f.lbl)}</div>
        <div style="font-size:14px; color:var(--text); font-weight:500; line-height:1.5;${f.color === 'pink' ? ' color:var(--pink);' : ''}${f.color === 'cyan' ? ' color:var(--cyan);' : ''}${f.color === 'mint' ? ' color:var(--mint);' : ''}${f.color === 'yellow' ? ' color:var(--yellow);' : ''}">
          ${f.link ? `<a href="${esc(f.link)}"${f.link.startsWith('http') ? ' target="_blank" rel="noopener"' : ''} style="color:inherit; text-decoration:underline; text-decoration-color:rgba(255,255,255,0.2); text-underline-offset:3px;">${esc(f.val)}</a>` : esc(f.val)}
        </div>
      </div>
      `).join('')}
    </div>
  </div>
</section>
` : ''}

${bodyHtml ? `
<section class="section" style="padding-top:0;">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> About this venue</div>
    <article class="venue-body" id="venue-body" style="max-width:760px; margin:0; font-size:16px; line-height:1.75; color:var(--text-2);">
      ${bodyHtml}
    </article>
  </div>
</section>
<script>
(function(){
  var body = document.getElementById('venue-body');
  if (!body) return;
  var heads = body.querySelectorAll('h2');
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
  nav.appendChild(pills);
  body.insertBefore(nav, body.firstChild);
})();
</script>
` : `
<section class="section" style="padding-top:0; padding-bottom:var(--s-8);">
  <div class="wrap" style="max-width:760px;">
    <div class="eyebrow"><span class="num">★</span> Know more about this venue?</div>
    <div style="background:var(--surface); border:1px solid var(--line); border-left:3px solid var(--cyan); border-radius:var(--r-lg); padding:var(--s-6);">
      <p style="font-size:15px; color:var(--text-2); line-height:1.7; margin:0 0 var(--s-4);">This is a <strong style="color:var(--text);">verified entry</strong> in the Pattaya.Gym directory. We've personally confirmed the venue exists and operates. If you've trained here and can share more details — coaches, prices, schedule, what makes it different — we want to know.</p>
      <p style="font-size:15px; color:var(--text-2); line-height:1.7; margin:0;">Help us deepen this listing: <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Update: ' + g.name)}" style="color:var(--cyan); font-weight:600;">email us</a> · <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=${encodeURIComponent('Hi! Update for ' + g.name)}" target="_blank" rel="noopener" style="color:var(--mint); font-weight:600;">WhatsApp</a> · or <a href="/contact/" style="color:var(--pink); font-weight:600;">contact form</a>.</p>
    </div>
  </div>
</section>
`}

${(g.social && (g.social.facebook || g.social.instagram)) ? `
<section class="section" style="padding-top:0;">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Social</div>
    <div class="channels-grid">
      ${g.social.facebook ? `<a href="https://facebook.com/${esc(g.social.facebook)}" target="_blank" rel="noopener" class="channel-card is-fb"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Facebook</div><h4 class="channel-card-name">${esc(g.social.facebook)}</h4><div class="channel-card-sub">facebook.com</div></a>` : ''}
      ${g.social.instagram ? `<a href="https://instagram.com/${esc(g.social.instagram)}" target="_blank" rel="noopener" class="channel-card is-ig"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Instagram</div><h4 class="channel-card-name">@${esc(g.social.instagram)}</h4><div class="channel-card-sub">instagram.com</div></a>` : ''}
      ${g.website ? `<a href="${esc(g.website)}" target="_blank" rel="noopener" class="channel-card is-yt"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Website</div><h4 class="channel-card-name">Official site</h4><div class="channel-card-sub">${esc(g.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 28))}</div></a>` : ''}
      ${g.mapsUrl ? `<a href="${esc(g.mapsUrl)}" target="_blank" rel="noopener" class="channel-card is-tt"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Google Maps</div><h4 class="channel-card-name">View on map</h4><div class="channel-card-sub">Directions · location</div></a>` : ''}
    </div>
  </div>
</section>
` : ''}

${(g.tags && g.tags.length) ? `
<section class="section" style="padding-top:0;">
  <div class="wrap" style="max-width:760px;">
    <div class="eyebrow"><span class="num">★</span> Tags</div>
    <div style="display:flex; flex-wrap:wrap; gap:8px;">
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
        <h4 class="channel-card-name">info@pattaya-gym.com</h4>
        <div class="channel-card-sub">Reply within 24h</div>
      </a>
      <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=${encodeURIComponent('Hi! Asking about ' + g.name + ' via pattaya-gym.com')}" target="_blank" rel="noopener" class="channel-card is-wa">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Fastest</div>
        <h4 class="channel-card-name">whatsapp</h4>
        <div class="channel-card-sub">+66 96 728 6999</div>
      </a>
      <a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener" class="channel-card is-line">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// LINE</div>
        <h4 class="channel-card-name">@timpaemi</h4>
        <div class="channel-card-sub">Daily check</div>
      </a>
      ${g.phone ? `<a href="tel:${esc(g.phone.replace(/\s+/g,''))}" class="channel-card is-agency">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Direct line</div>
        <h4 class="channel-card-name">Call gym</h4>
        <div class="channel-card-sub">${esc(g.phone)}</div>
      </a>` : `<a href="https://pattaya-authority.com/" target="_blank" rel="noopener" class="channel-card is-agency">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Our agency</div>
        <h4 class="channel-card-name">pattaya authority</h4>
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
      <a href="/gyms/${r.id}/" class="numcard" style="text-decoration:none; color:inherit;">
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
  const title = `${cat.label} in Pattaya — ${venues.length} venues hand-checked | Pattaya.Gym`;
  const desc = `Every ${cat.label.toLowerCase()} venue in Pattaya. ${venues.length} hand-checked entries. No paid placements. Updated weekly.`;

  const accentColors = {
    'muay-thai': 'accent-pink', 'mma': 'accent-pink', 'bjj': 'accent-pink',
    'fitness': 'accent-yellow', 'crossfit': 'accent-yellow',
    'golf': 'accent-mint',
    'yoga': 'accent-cyan', 'racquet': 'accent-cyan', 'swimming': 'accent-cyan', 'watersports': 'accent-cyan',
    'climbing': 'accent-mint', 'clubs': 'accent-mint', 'kids-youth': 'accent-yellow',
    'equestrian': 'accent-mint', 'adventure': 'accent-mint'
  };
  const accent = accentColors[cat.key] || 'accent-pink';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cat.label} in Pattaya`,
    itemListElement: venues.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/gyms/${v.id}/`,
      name: v.name
    }))
  };

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
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// Sport · ${venues.length} venues in Pattaya</div>
    <h1 class="hero-h1" style="font-size:clamp(48px,11vw,140px); text-align:left;">
      <span class="${accent}">${esc(cat.label)}.</span>
    </h1>
    <p class="hero-lede" style="text-align:left; margin-left:0;">Every <strong>${esc(cat.label.toLowerCase())}</strong> venue worth knowing in Pattaya. <strong>${venues.length} entries</strong> hand-checked. No paid placements. Updated weekly. If a venue closes, the page updates within 7 days.</p>
    <p class="hero-meta" style="text-align:left;">${venues.length} venues · Updated ${TODAY} · Pattaya · Thailand</p>
  </div>
</section>

<section class="section" style="padding-top:0;">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> Quick pick</div>
    <h2 class="h-section">Where to <span class="${accent}">start.</span></h2>
    <p class="lede">${venues.length ? `Our top 3 picks from <strong style="color:var(--text);">${venues.length} ${cat.label.toLowerCase()} venues</strong>. Full list below.` : 'No venues currently listed.'}</p>
    <div class="numlist">
      ${venues.slice(0, 3).map((v, i) => `
      <a href="/gyms/${v.id}/" class="numcard" style="text-decoration:none; color:inherit;">
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
      <a href="/gyms/${v.id}/" class="numcard" style="text-decoration:none; color:inherit;">
        <div class="numcard-head">
          <span class="numcard-num">${String(i+1).padStart(2,'0')}</span>
          <h3 class="numcard-title">// ${esc(v.name)}</h3>
        </div>
        <p class="numcard-body">${v.area ? `<strong style="color:var(--text);">${esc(v.area)}</strong>` : ''}${v.priceRange ? ` · ${esc(v.priceRange)}` : ''}${v.hours ? ` · ${esc(v.hours)}` : ''}${v.description ? '<br>' + esc(v.description.slice(0, 180)) + ((v.description||'').length > 180 ? '…' : '') : ''}</p>
      </a>
      `).join('')}
    </div>
  </div>
</section>

</main>
`
    + paNetwork()
    + bottomMarquee(BOTTOM_MARQUEE)
    + footer();
}

// ---------- Area page ----------
function areaPage(slug, label, venues) {
  const url = `${SITE}/area/${slug}/`;
  const title = `${label} — gyms & sport venues in Pattaya | Pattaya.Gym`;
  const desc = `Every gym, camp, and sport venue in ${label}, Pattaya. ${venues.length} hand-checked entries. No paid placements.`;

  return head({ title, desc, url })
    + topMarquee(TOP_MARQUEE)
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: label }
      ])
    + `
<main id="main">

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-10); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// Area · ${venues.length} venues</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,10vw,120px); text-align:left;">
      <span class="accent-cyan">${esc(label)}.</span>
    </h1>
    <p class="hero-lede" style="text-align:left; margin-left:0;">Every venue we track in <strong>${esc(label)}</strong>. ${venues.length} hand-checked entries across all sports — gyms, camps, golf, yoga, watersports.</p>
    <p class="hero-meta" style="text-align:left;">${venues.length} venues · Pattaya · Updated ${TODAY}</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> All venues</div>
    <h2 class="h-section">Every venue in <span class="accent-yellow">${esc(label)}.</span></h2>
    <div class="numlist">
      ${venues.map((v, i) => {
        const cat = CATEGORIES.find(c => c.key === v.category);
        return `
      <a href="/gyms/${v.id}/" class="numcard" style="text-decoration:none; color:inherit;">
        <div class="numcard-head">
          <span class="numcard-num">${String(i+1).padStart(2,'0')}</span>
          <h3 class="numcard-title">// ${esc(v.name)}</h3>
        </div>
        <p class="numcard-body">${cat ? `<strong style="color:var(--text);">${esc(cat.label)}</strong> · ` : ''}${esc(v.priceRange || '')}${v.hours ? ` · ${esc(v.hours)}` : ''}${v.description ? '<br>' + esc(v.description.slice(0, 180)) + ((v.description||'').length > 180 ? '…' : '') : ''}</p>
      </a>
      `;
      }).join('')}
      ${venues.length === 0 ? '<p style="color:var(--muted);">No venues currently listed in this area.</p>' : ''}
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
function utilityPage({ slug, title, desc, eyebrow, headlineLead, headlineAccent, accentClass, lede, bodyHtml, showContactCard = false }) {
  const url = `${SITE}/${slug}/`;

  const contactBlock = showContactCard ? `
<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Talk to us</div>
    <h2 class="h-section">Reach us <span class="accent-mint">direct.</span></h2>
    <div class="channels-grid">
      <a href="mailto:info@pattaya-gym.com" class="channel-card is-email">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// Email</div>
        <h4 class="channel-card-name">info@pattaya-gym.com</h4>
        <div class="channel-card-sub">Reply within 24h</div>
      </a>
      <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=Hi%21%20I%27m%20reaching%20out%20via%20pattaya-gym.com" target="_blank" rel="noopener" class="channel-card is-wa">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Fastest</div>
        <h4 class="channel-card-name">whatsapp</h4>
        <div class="channel-card-sub">+66 96 728 6999</div>
      </a>
      <a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener" class="channel-card is-line">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// LINE</div>
        <h4 class="channel-card-name">@timpaemi</h4>
        <div class="channel-card-sub">Daily check</div>
      </a>
      <a href="https://pattaya-authority.com/" target="_blank" rel="noopener" class="channel-card is-agency">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Our agency</div>
        <h4 class="channel-card-name">pattaya authority</h4>
        <div class="channel-card-sub">pattaya-authority.com</div>
      </a>
    </div>
  </div>
</section>` : '';

  return head({ title, desc, url })
    + topMarquee(TOP_MARQUEE)
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: eyebrow }
      ])
    + `
<main id="main">

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-8); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// ${esc(eyebrow)}</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,9vw,100px); text-align:left;">
      ${esc(headlineLead)}<br>
      <span class="${accentClass}">${esc(headlineAccent)}.</span>
    </h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; margin-right:0; margin-top:var(--s-5); font-size:clamp(16px,2vw,19px);">${lede}</p>
  </div>
</section>

<section class="section" style="padding-top:0;">
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

const UTILITY_PAGES = [
  {
    slug: 'about',
    title: 'About Pattaya.Gym — Independent directory, hand-checked weekly',
    desc: 'Pattaya.Gym is the most complete directory of gyms, Muay Thai camps, and sport venues in Pattaya. Independent. Hand-checked. No paid placements.',
    eyebrow: 'About',
    headlineLead: 'Independent.',
    headlineAccent: 'One purpose',
    accentClass: 'accent-pink',
    lede: 'Pattaya.Gym is the most complete directory of gyms, Muay Thai camps, and sport venues in Pattaya, Thailand. Every venue is personally verified. No paid placements. No fake reviews. No SEO spam.',
    showContactCard: true,
    bodyHtml: `
<h2>Why this site exists</h2>
<p>Most directories you find for Pattaya gyms are scraped, paid-for, or both. Search results are dominated by sites that have never set foot in any of the venues they rank.</p>
<p>Pattaya.Gym is the opposite. Every venue is visited or verified directly. Every hours field is checked. Every phone number is dialed. If a venue closes or changes hands, the page updates within 7 days.</p>

<h2>How venues are ranked</h2>
<p>No money changes hands. Ranking is based on consistent quality, current operation, breadth of facility, instructor caliber, and community reputation. Gyms with closed doors or stale information get demoted automatically.</p>

<h2>What we operate</h2>
<p>Pattaya.Gym is one project of <strong>TimPaemi Co., Ltd.</strong> alongside three other sites — <a href="https://pattaya-authority.com/" target="_blank" rel="noopener">Pattaya Authority</a> (flagship nightlife agency), <a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener">Pattaya Restaurant Guide</a>, and <a href="https://pattayavisahelp.com/" target="_blank" rel="noopener">Pattaya Visa Help</a>. The agency funds the directories. The directories don't take money from listed venues. That's how the independence stays real.</p>

<h2>Who runs this</h2>
<p>Pattaya.Gym is operated by <strong>Tim Paemi</strong>, an independent operator and long-time Pattaya resident, alongside his wife and co-founder. The site is self-funded and has no commercial relationship with any listed venue.</p>

<h2>Editorial policy</h2>
<ul>
<li>If a venue closes, gets new ownership, or changes hours, the page is updated within 7 days.</li>
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
<p>Verified date appears on every venue page. If a venue hasn't been re-verified in 90+ days, it gets queued. If we hear of a closure or major change, the page updates within 7 days. If we can't reach a venue across 30 days of attempts, it's marked stale and ranking-suppressed.</p>

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
<li><a href="https://pattaya-authority.com/" target="_blank" rel="noopener"><strong>Pattaya Authority</strong></a> — flagship nightlife agency, one of the leading operators in Pattaya. Brand strategy, content production, venue partnerships.</li>
<li><strong>Pattaya.Gym</strong> (this site) — fitness directory. Every gym, every camp, every court in Pattaya.</li>
<li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener"><strong>Pattaya Restaurant Guide</strong></a> — independent restaurant guide. Editorial reviews, real visits, honest takes.</li>
<li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener"><strong>Pattaya Visa Help</strong></a> — visa and long-stay support for foreigners in Pattaya.</li>
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
<li>We visit or call to confirm — usually within 7 days</li>
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

<p style="margin-top:var(--s-6);"><strong>Send the details to <a href="mailto:info@pattaya-gym.com?subject=Add%20my%20gym">info@pattaya-gym.com</a></strong> or WhatsApp <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=Hi%21%20I%20want%20to%20add%20my%20gym%20to%20pattaya-gym.com" target="_blank" rel="noopener">+66 96 728 6999</a> with "Add my gym" in the message.</p>
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
<li><strong>Analytics:</strong> Google Analytics — privacy-respecting, no cross-site tracking</li>
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
    title: 'Pattaya sport stats — 158 venues across 15 sports',
    desc: 'The numbers behind Pattaya as a training destination. 158 hand-checked venues, 15 sports, 6 areas. Updated weekly.',
    eyebrow: 'Stats',
    headlineLead: 'Pattaya',
    headlineAccent: 'by the numbers',
    accentClass: 'accent-yellow',
    lede: 'The training landscape of Pattaya in numbers. 158 hand-checked venues across 15 sports and 6 distinct areas. One of the world\'s deepest single-city Muay Thai scenes.',
    showContactCard: false,
    bodyHtml: `
<h2>Top-line</h2>
<ul>
<li><strong>158</strong> verified venues</li>
<li><strong>15</strong> sport categories</li>
<li><strong>6</strong> distinct geographic areas</li>
<li><strong>Weekly</strong> verification cycle</li>
<li><strong>0</strong> paid placements</li>
</ul>

<h2>By sport (top categories)</h2>
<ul>
<li><strong>Muay Thai:</strong> 38 camps — Pattaya has one of the world's largest concentrations of authentic Muay Thai. From Sityodtong-lineage traditional gyms to Fairtex-style premium resorts.</li>
<li><strong>Fitness gyms:</strong> 29 venues — from Muscle Factory hardcore bodybuilding to Hilton Pattaya 5-star clubs.</li>
<li><strong>Golf:</strong> 17 courses — premium Eastern Seaboard golf, from Siam Country Club championship to Bangpra valley layouts.</li>
<li><strong>Yoga & Pilates:</strong> 14 studios — Ashtanga, Vinyasa, Hot, traditional Hatha. Beachfront classes to Naklua wellness centers.</li>
<li><strong>Racquet sports:</strong> 12 venues — tennis, padel, badminton, pickleball.</li>
<li><strong>MMA / BJJ / Combat:</strong> 11 venues — beyond Muay Thai.</li>
<li><strong>Watersports / Diving:</strong> 11 operators — PADI, SSI, kitesurfing, sailing.</li>
<li><strong>Swimming:</strong> 9 pools — public, hotel, training pools.</li>
</ul>

<h2>By area</h2>
<ul>
<li><strong>Jomtien Beach</strong> — South Pattaya beachfront, family-friendly</li>
<li><strong>Naklua / North Pattaya</strong> — quieter, Wong Amat Beach, mid/upper market</li>
<li><strong>Pratamnak Hill</strong> — premium hill between Pattaya and Jomtien</li>
<li><strong>Central Pattaya</strong> — the original Pattaya, Beach Road, Walking Street</li>
<li><strong>East Pattaya / Darkside</strong> — inland east, expat residential, serious gyms</li>
<li><strong>Sattahip / Far South</strong> — quietest end, toward U-Tapao</li>
</ul>

<h2>What's not here</h2>
<p>Pattaya.Gym focuses on training venues — gyms, camps, courts, courses, studios, dive operators. We don't cover entertainment venues, restaurants, nightlife, or visa services. For those, see our sister sites.</p>
`
  },
  {
    slug: '404',
    title: 'Page not found — Pattaya.Gym',
    desc: 'That page doesn\'t exist on Pattaya.Gym. Browse 158 venues, 15 sports, or use search.',
    eyebrow: '404',
    headlineLead: 'Page',
    headlineAccent: 'not found',
    accentClass: 'accent-pink',
    lede: 'That URL doesn\'t exist on Pattaya.Gym. It may have moved, or you may have followed a stale link. Use the buttons below to navigate, or browse the directory.',
    showContactCard: false,
    bodyHtml: `
<p><a href="/">Back to homepage →</a></p>
<p><a href="/search/">Search 158 venues →</a></p>
<p><a href="/category/muay-thai/">Browse Muay Thai →</a></p>
<p><a href="/category/fitness/">Browse fitness gyms →</a></p>
<p><a href="/contact/">Contact us →</a></p>
`
  }
];

// ---------- Sitemap ----------
function generateSitemap() {
  const urls = [
    `${SITE}/`,
    `${SITE}/about/`,
    `${SITE}/contact/`,
    `${SITE}/methodology/`,
    `${SITE}/guides/`,
    `${SITE}/search/`,
    ...CATEGORIES.map(c => `${SITE}/category/${c.key}/`),
    ...Object.keys(AREA_MAP).map(a => `${SITE}/area/${a}/`),
    ...GYMS.map(g => `${SITE}/gyms/${g.id}/`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}
</urlset>`;
  writeFile(path.join(ROOT, 'sitemap.xml'), xml);
}

// ---------- Main ----------
function main() {
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

  // Sitemap
  generateSitemap();

  console.log(`✓ Built ${stats.venues} venues · ${stats.categories} categories · ${stats.areas} areas · ${stats.utility} info pages`);
  console.log(`✓ Sitemap: ${GYMS.length + CATEGORIES.length + Object.keys(AREA_MAP).length + 6} URLs`);
}

main();
