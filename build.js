#!/usr/bin/env node
/**
 * pattaya-gym.com build script
 * Reads venues/*.md (frontmatter + markdown body) and generates:
 *   - gyms/<slug>/index.html  (one SEO landing page per venue)
 *   - sitemap.xml             (homepage + every venue URL)
 *
 * No external deps. Designed to run on Cloudflare Pages with `node build.js`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VENUES_DIR = path.join(ROOT, 'venues');
const OUT_DIR = path.join(ROOT, 'gyms');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const SITE = 'https://pattaya-gym.com';

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
          fm[key] = block
            .filter(l => l.trim().startsWith('- '))
            .map(l => l.replace(/^\s*-\s*/, '').trim());
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

// ---------- Markdown -> HTML ----------
function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function applyInline(t) {
  // Bold first (so it doesn't clash with italic), then italic, then links
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
  return t;
}

/**
 * Convert markdown body to HTML.
 * - Skips the first H1 (the page header already shows the venue name).
 * - Detects markdown tables and renders as styled HTML tables.
 * - Renders "Quick Reference Card" tables as a key-value fact card.
 * - Wraps Pros / Cons / Best For / Not Best For sections in styled callouts.
 */
function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let inList = false;
  let para = [];
  let firstH1Skipped = false;

  // Section state: tracks which special section we're inside so we can wrap lists
  // Values: null | 'pros' | 'cons' | 'best-for' | 'not-best-for' | 'quick-ref'
  let sectionWrap = null;
  let sectionOpen = false; // whether we currently have an open <div class="...">

  function closeSectionWrap() {
    if (sectionOpen) {
      out.push('</div></div>');
      sectionOpen = false;
    }
    sectionWrap = null;
  }

  function flushPara() {
    if (para.length === 0) return;
    let t = para.join(' ').trim();
    if (!t) { para = []; return; }
    out.push('<p>' + applyInline(t) + '</p>');
    para = [];
  }
  function closeList() {
    if (inList) { out.push('</ul>'); inList = false; }
  }

  function detectSectionFromHeading(text) {
    const norm = text.toLowerCase().replace(/[^a-z ]/g, '').trim();
    if (norm === 'pros') return 'pros';
    if (norm === 'cons') return 'cons';
    if (norm === 'best for') return 'best-for';
    if (norm === 'not best for') return 'not-best-for';
    if (norm === 'quick reference card' || norm === 'quick reference') return 'quick-ref';
    return null;
  }

  // Pre-pass: detect table blocks (a row, then a separator row of |---|---|, then more rows)
  // We rebuild a line array where consecutive table lines are replaced with a single placeholder.
  const processed = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const next = lines[i + 1] || '';
    const isHeaderRow = /^\s*\|.*\|\s*$/.test(line) && /^\s*\|\s*-{2,}/.test(next);
    if (isHeaderRow) {
      const headers = line.replace(/^\s*\||\|\s*$/g, '').split('|').map(s => s.trim());
      i += 2; // skip header row + separator
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        const cells = lines[i].replace(/^\s*\||\|\s*$/g, '').split('|').map(s => s.trim());
        rows.push(cells);
        i++;
      }
      processed.push({ type: 'table', headers, rows });
      continue;
    }
    processed.push({ type: 'line', text: line });
    i++;
  }

  for (const item of processed) {
    if (item.type === 'table') {
      flushPara(); closeList();

      // Quick Reference Card → fact-card layout (key-value, two columns total)
      if (sectionWrap === 'quick-ref' && item.headers.length === 2) {
        const dl = ['<dl class="fact-card">'];
        for (const r of item.rows) {
          if (r.length < 2) continue;
          dl.push(`<div class="fact-row"><dt>${applyInline(r[0])}</dt><dd>${applyInline(r[1])}</dd></div>`);
        }
        dl.push('</dl>');
        out.push(dl.join('\n'));
        continue;
      }

      // Standard styled table for everything else
      const html = ['<div class="md-table-wrap"><table class="md-table"><thead><tr>'];
      for (const h of item.headers) html.push(`<th>${applyInline(h)}</th>`);
      html.push('</tr></thead><tbody>');
      for (const r of item.rows) {
        html.push('<tr>');
        for (let c = 0; c < item.headers.length; c++) {
          html.push(`<td>${applyInline(r[c] || '')}</td>`);
        }
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');
      out.push(html.join(''));
      continue;
    }

    const line = item.text;

    // Headings
    if (/^#{1,6}\s/.test(line)) {
      flushPara(); closeList();

      const lvl = line.match(/^#+/)[0].length;
      let text = line.replace(/^#+\s+/, '');

      // Skip the first H1 — the page already renders the title in venue-h1
      if (lvl === 1 && !firstH1Skipped) {
        firstH1Skipped = true;
        continue;
      }

      // Close any open section wrapper before opening a new one
      closeSectionWrap();

      // H2 may begin a special section
      if (lvl === 2) {
        const detected = detectSectionFromHeading(text);
        if (detected === 'pros') {
          sectionWrap = 'pros';
          out.push(`<h2 class="section-pros-cons">${applyInline(text)}</h2>`);
          out.push('<div class="callout callout-pros"><div class="callout-icon">✓</div><div class="callout-body">');
          sectionOpen = true;
          continue;
        }
        if (detected === 'cons') {
          sectionWrap = 'cons';
          out.push(`<h2 class="section-pros-cons">${applyInline(text)}</h2>`);
          out.push('<div class="callout callout-cons"><div class="callout-icon">✕</div><div class="callout-body">');
          sectionOpen = true;
          continue;
        }
        if (detected === 'best-for') {
          sectionWrap = 'best-for';
          out.push(`<h2>${applyInline(text)}</h2>`);
          out.push('<div class="callout callout-best"><div class="callout-icon">★</div><div class="callout-body">');
          sectionOpen = true;
          continue;
        }
        if (detected === 'not-best-for') {
          sectionWrap = 'not-best-for';
          out.push(`<h2>${applyInline(text)}</h2>`);
          out.push('<div class="callout callout-notbest"><div class="callout-icon">⤬</div><div class="callout-body">');
          sectionOpen = true;
          continue;
        }
        if (detected === 'quick-ref') {
          sectionWrap = 'quick-ref';
          out.push(`<h2 class="section-quick-ref">${applyInline(text)}</h2>`);
          continue;
        }
      }

      out.push(`<h${lvl}>${applyInline(text)}</h${lvl}>`);
      continue;
    }

    // List items
    if (/^\s*-\s+/.test(line)) {
      flushPara();
      if (!inList) { out.push('<ul>'); inList = true; }
      let item = line.replace(/^\s*-\s+/, '');
      out.push('<li>' + applyInline(item) + '</li>');
      continue;
    }

    // Blank line
    if (/^\s*$/.test(line)) {
      flushPara(); closeList();
      continue;
    }

    para.push(line);
  }

  flushPara();
  closeList();
  closeSectionWrap();
  return out.join('\n');
}

// ---------- Page template ----------
function extractFirstParagraph(body) {
  const lines = body.split(/\r?\n/);
  const para = [];
  let started = false;
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) { if (started) break; continue; }
    if (/^\s*$/.test(line)) { if (started) break; continue; }
    if (/^\s*-\s/.test(line)) continue;
    started = true;
    para.push(line);
  }
  return para.join(' ')
    .replace(/\*\*?([^*]+)\*\*?/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ').trim();
}

function buildVenuePage(slug, fm, bodyHtml, body) {
  const url = `${SITE}/gyms/${slug}/`;
  const title = `${fm.name} | Pattaya Gym Directory`;
  const firstPara = extractFirstParagraph(body || '');
  const desc = (fm.description || firstPara || `Train at ${fm.name} in Pattaya, Thailand. Address, pricing, schedule, trainers, reviews and more.`).replace(/\s+/g, ' ').slice(0, 300);
  const cat = (fm.category || '').replace(/-/g, ' ');
  const sources = Array.isArray(fm.sources) ? fm.sources : [];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': url,
    name: fm.name,
    description: desc,
    url: fm.website || url,
    image: fm.photos && fm.photos[0] ? fm.photos[0] : `${SITE}/og-image.jpg`,
    address: { '@type': 'PostalAddress', streetAddress: fm.address || '', addressLocality: 'Pattaya', addressRegion: 'Chonburi', postalCode: '20150', addressCountry: 'TH' },
    telephone: fm.phone || undefined,
    priceRange: fm.priceRange || undefined,
    openingHours: fm.hours || undefined
  };
  Object.keys(schema).forEach(k => schema[k] === undefined && delete schema[k]);

  const social = fm.social || {};
  const socialLinks = [
    social.facebook && `<a href="https://facebook.com/${social.facebook}" rel="noopener" target="_blank">Facebook</a>`,
    social.instagram && `<a href="https://instagram.com/${social.instagram}" rel="noopener" target="_blank">Instagram</a>`
  ].filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(desc)}" />
  <link rel="canonical" href="${url}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escHtml(fm.name)}" />
  <meta property="og:description" content="${escHtml(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:locale" content="en_US" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(fm.name)}" />
  <meta name="twitter:description" content="${escHtml(desc)}" />

  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/venue.css" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23000'/%3E%3Ctext x='50' y='62' font-size='52' text-anchor='middle' fill='%23ffb800' font-family='sans-serif' font-weight='900'%3EP%3C/text%3E%3C/svg%3E" />

  <script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>
</head>
<body>
  <header class="hero" style="min-height: auto;">
    <nav class="nav">
      <a href="/" class="brand">
        <span class="brand-mark">P</span>
        <span class="brand-text">PATTAYA <strong>GYM</strong></span>
      </a>
      <ul class="nav-links">
        <li><a href="/#directory">Directory</a></li>
        <li><a href="/#categories">Categories</a></li>
        <li><a href="/#about">About</a></li>
      </ul>
    </nav>
  </header>

  <main class="venue-page">
    <div class="venue-breadcrumb">
      <a href="/">Directory</a>
      <span class="bc-sep">›</span>
      <a href="/?cat=${escHtml(fm.category || '')}">${escHtml(cat)}</a>
      <span class="bc-sep">›</span>
      <span>${escHtml(fm.name)}</span>
    </div>

    <div class="venue-hero">
      <span class="venue-cat-pill">${escHtml(cat)}</span>
      <h1 class="venue-h1">${escHtml(fm.name)}</h1>
      ${firstPara ? `<p class="venue-lede">${escHtml(firstPara.slice(0, 280))}${firstPara.length > 280 ? '…' : ''}</p>` : ''}

      <div class="venue-hero-meta">
        ${fm.area ? `<span class="meta-chip">📍 ${escHtml(fm.area)}</span>` : ''}
        ${fm.priceRange ? `<span class="meta-chip">💰 ${escHtml(fm.priceRange)}</span>` : ''}
        ${fm.hours ? `<span class="meta-chip">🕐 ${escHtml(fm.hours)}</span>` : ''}
        ${fm.distinction ? `<span class="meta-chip meta-chip-accent">⭐ ${escHtml(fm.distinction)}</span>` : ''}
      </div>

      <div class="venue-actions">
        ${fm.mapsUrl ? `<a class="btn btn-primary" href="${escHtml(fm.mapsUrl)}" target="_blank" rel="noopener">📍 View on Google Maps</a>` : ''}
        ${fm.website ? `<a class="btn btn-secondary" href="${escHtml(fm.website)}" target="_blank" rel="noopener">🔗 Official Website</a>` : ''}
        ${fm.phone ? `<a class="btn btn-secondary" href="tel:${escHtml(String(fm.phone).replace(/\s/g,''))}">📞 ${escHtml(fm.phone)}</a>` : ''}
        ${social.facebook ? `<a class="btn btn-ghost" href="https://facebook.com/${escHtml(social.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}
        ${social.instagram ? `<a class="btn btn-ghost" href="https://instagram.com/${escHtml(social.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}
      </div>
    </div>

    <article class="venue-body">
      ${bodyHtml}
    </article>

    <footer class="venue-footer">
      <p>Last verified: <strong>${escHtml(fm.verified || 'N/A')}</strong>. Listing researched from public sources. Errors? Email <a href="mailto:hello@pattaya-gym.com">hello@pattaya-gym.com</a>.</p>
      ${sources.length ? `<details>
        <summary>Research sources (${sources.length})</summary>
        <ul>
          ${sources.map(s => `<li><a href="${escHtml(s)}" rel="noopener" target="_blank">${escHtml(s)}</a></li>`).join('\n          ')}
        </ul>
      </details>` : ''}
    </footer>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <div><span class="brand-mark small">P</span><span>PATTAYA <strong>GYM</strong></span></div>
      <p>© ${new Date().getFullYear()} pattaya-gym.com — Every gym &amp; sport in Pattaya, Thailand.</p>
    </div>
  </footer>
</body>
</html>
`;
}

// ---------- Sitemap ----------
function buildSitemap(venues) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    `<url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    ...venues.map(v => `<url><loc>${SITE}/gyms/${v.slug}/</loc><lastmod>${v.fm.verified || today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join('\n  ')}\n</urlset>\n`;
}

// ---------- Main ----------
function loadGymsFromDataJs() {
  const code = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
  const win = {};
  new Function('window', code)(win);
  return { GYMS: win.GYMS || [], CATEGORIES: win.CATEGORIES || [] };
}


function buildStubBody(g, cats) {
  const cat = cats.find(c => c.key === g.category);
  const catLabel = cat ? cat.label : g.category;
  const lines = [];
  lines.push('## Overview');
  lines.push('');
  lines.push(g.description || ('Pattaya ' + catLabel + ' venue.'));
  lines.push('');
  lines.push('## Quick Facts');
  lines.push('');
  if (g.area) lines.push('- **Area:** ' + g.area);
  if (g.address) lines.push('- **Address:** ' + g.address);
  if (g.phone) lines.push('- **Phone:** ' + g.phone);
  if (g.website) lines.push('- **Website:** ' + g.website);
  if (g.hours) lines.push('- **Hours:** ' + g.hours);
  if (g.priceRange) lines.push('- **Price range:** ' + g.priceRange);
  if (g.tags && g.tags.length) lines.push('- **Tags:** ' + g.tags.join(', '));
  lines.push('');
  lines.push('## More Coming Soon');
  lines.push('');
  lines.push('This is a basic listing for **' + g.name + '**. A full deep-dive page is in progress.');
  lines.push('');
  lines.push('Email **hello@pattaya-gym.com** with corrections, photos, or details.');
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(VENUES_DIR)) fs.mkdirSync(VENUES_DIR);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  const loaded = loadGymsFromDataJs();
  const GYMS = loaded.GYMS;
  const CATEGORIES = loaded.CATEGORIES;
  const venues = [];

  const mdFiles = new Set(
    fs.readdirSync(VENUES_DIR).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))
  );

  let deepCount = 0, stubCount = 0;

  GYMS.forEach(g => {
    const slug = g.id;
    let fm, bodyHtml, body;

    if (mdFiles.has(slug)) {
      const raw = fs.readFileSync(path.join(VENUES_DIR, slug + '.md'), 'utf8');
      const parsed = parseFrontmatter(raw);
      fm = parsed.fm;
      body = parsed.body;
      bodyHtml = mdToHtml(body);
      deepCount++;
    } else {
      fm = {
        id: slug, name: g.name, category: g.category, area: g.area,
        address: g.address, phone: g.phone, website: g.website,
        social: g.social || {}, hours: g.hours, priceRange: g.priceRange,
        description: g.description, tags: g.tags, mapsUrl: g.mapsUrl,
        verified: g.verified
      };
      body = buildStubBody(g, CATEGORIES);
      bodyHtml = mdToHtml(body);
      stubCount++;
    }

    const html = buildVenuePage(slug, fm, bodyHtml, body);
    const venueDir = path.join(OUT_DIR, slug);
    if (!fs.existsSync(venueDir)) fs.mkdirSync(venueDir);
    fs.writeFileSync(path.join(venueDir, 'index.html'), html);

    venues.push({ slug, fm });
    const tag = mdFiles.has(slug) ? 'DEEP' : 'stub';
    console.log('  [' + tag + '] /gyms/' + slug + '/  (' + (fm.name || slug) + ')');
  });

  fs.writeFileSync(SITEMAP, buildSitemap(venues));
  console.log('\nGenerated ' + venues.length + ' venue pages (' + deepCount + ' deep + ' + stubCount + ' stubs)');
  console.log('sitemap.xml updated.');
}

main();
