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
const ASSET_VERSION = '400';
const TODAY = new Date().toISOString().slice(0, 10);

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
    <span>12.92°N · 100.87°E · Pattaya Villa</span>
  </div>
</footer>
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

  // Split venue name for headline (last word gets accent)
  const nameWords = g.name.split(/\s+/);
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

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-10); text-align:left;">
  <div class="hero-inner" style="max-width:var(--max); margin:0 auto;">
    <div class="hero-kicker">// ${esc(catLabel)} · ${esc(g.area || 'Pattaya')}${g.priceRange ? ' · ' + esc(g.priceRange) : ''}</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,9vw,110px); text-align:left;">
      ${esc(firstWords)}<br>
      <span class="${accent.class}">${esc(lastWord)}.</span>
    </h1>
    ${g.description ? `<p class="hero-lede" style="text-align:left; margin-left:0; margin-right:0;">${esc(g.description)}</p>` : ''}
    ${g.hours ? `<p class="hero-meta" style="text-align:left;">${esc(g.hours)}</p>` : ''}
    <div class="btn-row" style="justify-content:flex-start;">
      ${g.phone ? `<a href="tel:${esc(g.phone.replace(/\s+/g,''))}" class="btn btn-primary">▶ Call</a>` : ''}
      <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Inquiry: ' + g.name)}" class="btn btn-secondary">● Email us</a>
      <a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=${encodeURIComponent('Hi! Asking about ' + g.name + ' via pattaya-gym.com')}" target="_blank" rel="noopener" class="btn btn-tertiary">WhatsApp →</a>
      ${g.mapsUrl ? `<a href="${esc(g.mapsUrl)}" target="_blank" rel="noopener" class="btn btn-ghost">📍 Map</a>` : ''}
      ${g.website ? `<a href="${esc(g.website)}" target="_blank" rel="noopener" class="btn btn-ghost">Website →</a>` : ''}
    </div>
  </div>
</section>

<section class="section" style="padding-top:var(--s-6);">
  <div class="wrap">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-icon">⏱</div>
        <div class="stat-card-num c-cyan" style="font-size:14px; letter-spacing:0;">${esc(g.hours || 'Call to confirm')}</div>
        <div class="stat-card-lbl">Hours</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">💰</div>
        <div class="stat-card-num c-yellow">${esc(g.priceRange || '—')}</div>
        <div class="stat-card-lbl">Price tier</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">📍</div>
        <div class="stat-card-num c-mint" style="font-size:14px; letter-spacing:0;">${esc(g.area || 'Pattaya')}</div>
        <div class="stat-card-lbl">Area</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">✓</div>
        <div class="stat-card-num c-pink">${g.verified ? esc(g.verified) : 'Tracked'}</div>
        <div class="stat-card-lbl">Last verified</div>
      </div>
    </div>
  </div>
</section>

${bodyHtml ? `
<section class="section" style="padding-top:0;">
  <div class="wrap">
    <article class="venue-body" style="max-width:760px; margin:0 auto; font-size:16px; line-height:1.75; color:var(--text-2);">
      ${bodyHtml}
    </article>
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

  // Sitemap
  generateSitemap();

  console.log(`✓ Built ${stats.venues} venues · ${stats.categories} categories · ${stats.areas} areas`);
  console.log(`✓ Sitemap: ${GYMS.length + CATEGORIES.length + Object.keys(AREA_MAP).length + 6} URLs`);
}

main();
