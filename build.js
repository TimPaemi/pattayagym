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

    // top-level key: value
    const flat = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (flat && !line.startsWith('  ')) {
      const key = flat[1];
      let val = flat[2];

      if (val === '' || val === null) {
        // nested block follows
        const block = [];
        i++;
        while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
          block.push(lines[i]);
          i++;
        }
        // determine if list or object
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

      // inline array
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

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let inList = false;
  let para = [];

  function flushPara() {
    if (para.length === 0) return;
    let t = para.join(' ').trim();
    if (!t) { para = []; return; }
    // inline formatting
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
    out.push('<p>' + t + '</p>');
    para = [];
  }
  function closeList() {
    if (inList) { out.push('</ul>'); inList = false; }
  }

  for (let raw of lines) {
    const line = raw;

    if (/^#{1,6}\s/.test(line)) {
      flushPara(); closeList();
      const lvl = line.match(/^#+/)[0].length;
      let text = line.replace(/^#+\s+/, '');
      text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      out.push(`<h${lvl}>${text}</h${lvl}>`);
      continue;
    }

    if (/^\s*-\s+/.test(line)) {
      flushPara();
      if (!inList) { out.push('<ul>'); inList = true; }
      let item = line.replace(/^\s*-\s+/, '');
      item = item.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      item = item.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
      item = item.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
      out.push('<li>' + item + '</li>');
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushPara(); closeList();
      continue;
    }

    para.push(line);
  }
  flushPara();
  closeList();
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

  // schema.org LocalBusiness
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
  ].filter(Boolean).join(' · ');

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
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23000'/%3E%3Ctext x='50' y='62' font-size='52' text-anchor='middle' fill='%23ffb800' font-family='sans-serif' font-weight='900'%3EP%3C/text%3E%3C/svg%3E" />

  <script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>

  <style>
    .venue-page { max-width: 880px; margin: 0 auto; padding: 24px 32px 80px; }
    .venue-breadcrumb { color: var(--text-muted); font-size: 13px; margin-bottom: 16px; }
    .venue-breadcrumb a { color: var(--text-dim); }
    .venue-h1 { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin: 8px 0 12px; }
    .venue-cat-pill { display: inline-block; background: rgba(255,184,0,0.12); color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 50px; margin-bottom: 8px; }
    .venue-hero-meta { display: flex; flex-wrap: wrap; gap: 14px; color: var(--text-dim); font-size: 14px; margin: 14px 0 20px; }
    .venue-actions { display: flex; flex-wrap: wrap; gap: 10px; padding: 14px 0 24px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 36px; }
    .venue-actions a { background: var(--border); color: var(--text); padding: 10px 18px; border-radius: 50px; font-size: 14px; font-weight: 600; }
    .venue-actions a.primary { background: var(--accent); color: #000; }
    .venue-actions a:hover { background: var(--accent-hover); color: #000; }
    .venue-body h2 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.3px; margin: 36px 0 14px; padding-top: 16px; border-top: 1px solid var(--border); }
    .venue-body h2:first-of-type { border-top: none; padding-top: 0; }
    .venue-body h3 { font-size: 1.15rem; font-weight: 700; margin: 24px 0 10px; color: var(--accent); }
    .venue-body p { color: var(--text-dim); margin-bottom: 14px; }
    .venue-body ul { padding-left: 22px; color: var(--text-dim); margin-bottom: 16px; }
    .venue-body li { margin-bottom: 6px; line-height: 1.5; }
    .venue-body strong { color: var(--text); }
    .venue-body a { color: var(--accent); }
    .venue-footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid var(--border); color: var(--text-muted); font-size: 13px; }
    .venue-footer details { margin-top: 14px; }
    .venue-footer summary { cursor: pointer; color: var(--text-dim); font-weight: 600; padding: 6px 0; }
    .venue-footer summary:hover { color: var(--accent); }
    .venue-footer ul { padding-left: 22px; margin-top: 8px; }
    .venue-footer li { margin-bottom: 4px; word-break: break-all; font-size: 12px; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--text-dim); font-size: 14px; padding: 8px 0; }
    .back-link:hover { color: var(--accent); }
  </style>
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
    <a class="back-link" href="/">&larr; Back to directory</a>
    <div class="venue-breadcrumb">
      <a href="/">Pattaya Gym Directory</a> &nbsp;/&nbsp; <a href="/?cat=${escHtml(fm.category || '')}">${escHtml(cat)}</a> &nbsp;/&nbsp; ${escHtml(fm.name)}
    </div>

    <span class="venue-cat-pill">${escHtml(cat)}</span>
    <h1 class="venue-h1">${escHtml(fm.name)}</h1>

    <div class="venue-hero-meta">
      ${fm.area ? `<span>📍 ${escHtml(fm.area)}</span>` : ''}
      ${fm.priceRange ? `<span>💰 ${escHtml(fm.priceRange)}</span>` : ''}
      ${fm.hours ? `<span>🕐 ${escHtml(fm.hours)}</span>` : ''}
    </div>

    <div class="venue-actions">
      ${fm.mapsUrl ? `<a class="primary" href="${escHtml(fm.mapsUrl)}" target="_blank" rel="noopener">View on Google Maps</a>` : ''}
      ${fm.website ? `<a href="${escHtml(fm.website)}" target="_blank" rel="noopener">Official Website</a>` : ''}
      ${fm.phone ? `<a href="tel:${escHtml(String(fm.phone).replace(/\s/g,''))}">Call ${escHtml(fm.phone)}</a>` : ''}
      ${socialLinks ? `<span style="padding:10px 4px;color:var(--text-muted);">${socialLinks}</span>` : ''}
    </div>

    <article class="venue-body">
      ${bodyHtml}
    </article>

    <footer class="venue-footer">
      <p>Last verified: <strong>${escHtml(fm.verified || 'N/A')}</strong>. Listing is researched from public sources. Errors? Email <a href="mailto:hello@pattaya-gym.com">hello@pattaya-gym.com</a> and we'll fix it.</p>
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
  lines.push('This is a basic listing for **' + g.name + '**. A full deep-dive page with history, trainers, pricing tiers, schedules, reviews, and on-the-ground details is in progress and will be published as research is completed.');
  lines.push('');
  lines.push('Know this venue and want to help us improve the listing? Email **hello@pattaya-gym.com** with corrections, photos, or details and we will incorporate.');
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
        id: slug,
        name: g.name,
        category: g.category,
        area: g.area,
        address: g.address,
        phone: g.phone,
        website: g.website,
        social: g.social || {},
        hours: g.hours,
        priceRange: g.priceRange,
        description: g.description,
        tags: g.tags,
        mapsUrl: g.mapsUrl,
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
