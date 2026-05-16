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
const DATA_FILE = path.join(ROOT, 'data.js');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const SITE = 'https://pattaya-gym.com';
const ASSET_VERSION = '236';
const DEFAULT_OG_IMAGE = `${SITE}/og-image.png`;
const PATTAYA_GEO = { latitude: 12.9236, longitude: 100.8825 };
const LAST_BUILD_DATE = new Date().toISOString().slice(0, 10);
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

function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .replace(/&[a-z]+;/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function telHref(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return '';

  const candidates = raw.match(/\+?\d[\d\s().-]{6,}\d/g) || [];

  for (const candidate of candidates) {
    let digits = candidate.replace(/[^\d+]/g, '');
    if (digits.startsWith('00')) digits = '+' + digits.slice(2);
    if (digits.startsWith('0')) digits = '+66' + digits.slice(1);
    if (!digits.startsWith('+') && digits.startsWith('66')) digits = '+' + digits;
    if (/^\+\d{7,15}$/.test(digits)) return digits;
  }

  return '';
}

function markThaiText(html) {
  return String(html).replace(/([\u0E00-\u0E3E\u0E40-\u0E7F][\u0E00-\u0E7F\s]*[\u0E00-\u0E3E\u0E40-\u0E7F])/g, '<span lang="th">$1</span>');
}

function applyInline(t) {
  // Bold first (so it doesn't clash with italic), then italic, then links
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
  return markThaiText(t);
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
          out.push(`<h2 id="${slugifyHeading(text)}" class="section-pros-cons">${applyInline(text)}</h2>`);
          out.push('<div class="callout callout-pros"><div class="callout-icon">✓</div><div class="callout-body">');
          sectionOpen = true;
          continue;
        }
        if (detected === 'cons') {
          sectionWrap = 'cons';
          out.push(`<h2 id="${slugifyHeading(text)}" class="section-pros-cons">${applyInline(text)}</h2>`);
          out.push('<div class="callout callout-cons"><div class="callout-icon">✕</div><div class="callout-body">');
          sectionOpen = true;
          continue;
        }
        if (detected === 'best-for') {
          sectionWrap = 'best-for';
          out.push(`<h2 id="${slugifyHeading(text)}">${applyInline(text)}</h2>`);
          out.push('<div class="callout callout-best"><div class="callout-icon">★</div><div class="callout-body">');
          sectionOpen = true;
          continue;
        }
        if (detected === 'not-best-for') {
          sectionWrap = 'not-best-for';
          out.push(`<h2 id="${slugifyHeading(text)}">${applyInline(text)}</h2>`);
          out.push('<div class="callout callout-notbest"><div class="callout-icon">⤬</div><div class="callout-body">');
          sectionOpen = true;
          continue;
        }
        if (detected === 'quick-ref') {
          sectionWrap = 'quick-ref';
          out.push(`<h2 id="${slugifyHeading(text)}" class="section-quick-ref">${applyInline(text)}</h2>`);
          continue;
        }
      }

      out.push(`<h${lvl} id="${slugifyHeading(text)}">${applyInline(text)}</h${lvl}>`);
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

// Reading time in minutes (rough — ~210 words/min)
function computeReadingTime(body) {
  if (!body) return 1;
  const words = body.replace(/[#*`>\-\[\]\(\)]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 210));
}

// Best-effort "Open now" detection. Returns 'open' | 'closed' | null (unknown).
// hoursStr examples we try to parse: "Daily 06:00-22:00", "Mon-Fri 07:00-09:00 & 19:00-20:00", "24/7", "24 hours"
function detectOpenStatus(hoursStr) {
  if (!hoursStr) return null;
  const s = String(hoursStr);
  if (/24\/7|24\s*hours|always\s*open/i.test(s)) return 'open';
  // Find time ranges like 07:00-22:00
  const ranges = [];
  const re = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    ranges.push({
      from: parseInt(m[1], 10) * 60 + parseInt(m[2], 10),
      to:   parseInt(m[3], 10) * 60 + parseInt(m[4], 10)
    });
  }
  if (!ranges.length) return null;
  // Use Bangkok time (UTC+7)
  return null;
}

// Auto TL;DR — first 2 sentences (~280 chars max), preserves bold from md
function buildTLDR(body) {
  if (!body) return '';
  // Skip headings, take first non-heading non-empty paragraph block
  const lines = body.split(/\r?\n/);
  const collected = [];
  let started = false;
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) { if (started) break; continue; }
    if (/^\s*$/.test(line)) { if (started) break; continue; }
    if (/^\s*-\s/.test(line)) continue;
    if (/^\s*\|/.test(line)) continue;
    started = true;
    collected.push(line.trim());
  }
  let text = collected.join(' ').replace(/\s+/g, ' ').trim();
  // Take first ~2 sentences or ~280 chars
  const sentences = text.split(/(?<=[.!?])\s+/);
  let out = '';
  for (const s of sentences) {
    if (out.length + s.length > 320) break;
    out += (out ? ' ' : '') + s;
    if (out.length > 200) break;
  }
  if (!out) out = text.slice(0, 280);
  // Apply inline formatting (bold, links — but strip links to plain text for tldr)
  out = out.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

// Per-category decorative SVG illustrations — added to venue hero blocks
// + category cards. Pure inline SVG, no external deps. Subtle opacity/colour.
function getCategoryArt(cat) {
  const c = (cat || '').toString().toLowerCase();
  // Stroke + fill share the same accent so the SVG inherits page theme.
  // viewBox 0 0 120 120 — scaled by container CSS. fill="none" by default.
  const minSvg = (s) => String(s).replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
  const wrap = (inner) =>
    `<svg class="cat-art" viewBox="0 0 120 120" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${minSvg(inner)}</svg>`;

  switch (c) {
    case 'muay-thai':
      // Boxing glove silhouette
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M30 50 Q30 30 50 28 L72 28 Q90 28 92 46 L92 72 Q92 86 78 90 L74 96 Q72 100 66 100 L40 100 Q32 100 30 92 Z"/>
        <path d="M55 50 Q66 48 75 52"/>
        <path d="M55 64 Q66 62 75 66"/>
        <path d="M55 78 Q66 76 75 80"/>
        <path d="M30 50 L20 56 Q14 60 18 68 L24 78"/>
      </g>`);
    case 'fitness':
      // Dumbbell
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
        <rect x="14" y="42" width="14" height="36" rx="3"/>
        <rect x="92" y="42" width="14" height="36" rx="3"/>
        <rect x="6" y="50" width="8" height="20" rx="2"/>
        <rect x="106" y="50" width="8" height="20" rx="2"/>
        <line x1="28" y1="60" x2="92" y2="60" stroke-width="6"/>
      </g>`);
    case 'yoga':
      // Lotus / meditation pose
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="60" cy="32" r="10"/>
        <path d="M40 50 Q50 56 60 56 Q70 56 80 50"/>
        <path d="M30 80 Q50 64 60 70 Q70 64 90 80 Q86 90 60 92 Q34 90 30 80 Z"/>
        <path d="M40 60 Q26 70 28 86"/>
        <path d="M80 60 Q94 70 92 86"/>
      </g>`);
    case 'golf':
      // Golf club + ball
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="30" y1="22" x2="84" y2="86"/>
        <path d="M76 80 Q92 88 96 102 Q88 100 80 92"/>
        <circle cx="22" cy="100" r="8"/>
        <circle cx="22" cy="100" r="1.2" fill="currentColor"/>
        <circle cx="26" cy="98" r="1.2" fill="currentColor"/>
        <circle cx="20" cy="104" r="1.2" fill="currentColor"/>
      </g>`);
    case 'racquet':
      // Tennis/badminton racquet
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="48" cy="48" rx="26" ry="30"/>
        <line x1="48" y1="22" x2="48" y2="74"/>
        <line x1="22" y1="48" x2="74" y2="48"/>
        <line x1="32" y1="28" x2="64" y2="68"/>
        <line x1="64" y1="28" x2="32" y2="68"/>
        <line x1="66" y1="68" x2="100" y2="104" stroke-width="3.5"/>
        <circle cx="100" cy="104" r="3"/>
      </g>`);
    case 'swimming':
      // Waves + swimmer
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="42" cy="36" r="8"/>
        <path d="M50 42 L70 50 L86 44"/>
        <path d="M55 50 L74 60 L90 56"/>
        <path d="M10 78 Q22 70 34 78 T58 78 T82 78 T106 78"/>
        <path d="M10 92 Q22 84 34 92 T58 92 T82 92 T106 92"/>
      </g>`);
    case 'watersports':
      // Wave + sailboat
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="60" y1="20" x2="60" y2="68"/>
        <path d="M60 26 L86 64 L60 64 Z"/>
        <path d="M60 36 L34 64 L60 64"/>
        <path d="M22 78 L98 78"/>
        <path d="M14 90 Q26 84 38 90 T62 90 T86 90 T110 90"/>
      </g>`);
    case 'adventure':
      // Mountain peaks
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 96 L40 50 L58 76 L78 36 L110 96 Z"/>
        <line x1="40" y1="50" x2="33" y2="62"/>
        <line x1="40" y1="50" x2="46" y2="60"/>
        <line x1="78" y1="36" x2="71" y2="48"/>
        <line x1="78" y1="36" x2="84" y2="46"/>
        <circle cx="92" cy="22" r="6"/>
      </g>`);
    case 'climbing':
      // Climbing holds + figure
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="60" y1="14" x2="60" y2="106"/>
        <circle cx="36" cy="32" r="5"/>
        <circle cx="84" cy="44" r="5"/>
        <circle cx="32" cy="64" r="5"/>
        <circle cx="86" cy="76" r="5"/>
        <circle cx="40" cy="96" r="5"/>
        <path d="M60 32 L36 32 M60 44 L84 44 M60 64 L32 64 M60 76 L86 76 M60 96 L40 96"/>
      </g>`);
    case 'kids-youth':
      // Kid figure / playful
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="60" cy="32" r="10"/>
        <path d="M60 42 L60 70"/>
        <path d="M60 50 L36 60 M60 50 L84 60"/>
        <path d="M60 70 L40 100 M60 70 L80 100"/>
        <circle cx="98" cy="86" r="6"/>
      </g>`);
    case 'crossfit':
      // Kettlebell
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 26 Q50 18 60 18 Q70 18 70 26 L70 32"/>
        <path d="M40 38 L80 38 Q96 38 100 60 L102 88 Q102 100 90 100 L30 100 Q18 100 18 88 L20 60 Q24 38 40 38 Z"/>
        <circle cx="60" cy="68" r="14"/>
      </g>`);
    case 'equestrian':
      // Horse silhouette
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 84 L22 60 Q22 48 36 46 L46 32 Q52 24 60 28 L70 36 L88 38 Q98 42 100 56 L100 84"/>
        <path d="M40 84 L40 96 M52 84 L52 96 M82 84 L82 96 M94 84 L94 96"/>
        <circle cx="92" cy="42" r="1.5" fill="currentColor"/>
        <path d="M46 32 L42 22 M52 28 L50 18"/>
      </g>`);
    case 'clubs':
    default:
      // Generic — crossed flags / community
      return wrap(`<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="60" cy="60" r="38"/>
        <path d="M40 56 Q60 40 80 56"/>
        <path d="M40 70 Q60 86 80 70"/>
        <line x1="40" y1="60" x2="80" y2="60" stroke-dasharray="2 4"/>
        <line x1="60" y1="22" x2="60" y2="98"/>
      </g>`);
  }
}

global.getCategoryArt = getCategoryArt;

function assetHref(file) {
  return `${file}?v=${ASSET_VERSION}`;
}

function cleanText(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

function clipAtWord(s, max) {
  const text = cleanText(s);
  if (text.length <= max) return text;
  const cut = text.slice(0, Math.max(0, max - 3));
  const boundary = cut.lastIndexOf(' ');
  return (boundary > 40 ? cut.slice(0, boundary) : cut).replace(/[.,;:\s]+$/, '') + '...';
}

function venueMetaTitle(name) {
  const suffix = ' | Pattaya Gym';
  let base = cleanText(name)
    .replace(/&/g, 'and')
    .replace(/[?']/g, '')
    .replace(/[??]/g, '-')
    .replace(/\s+\([^)]{8,}\)/g, '');
  if ((base + suffix).length < 30) base += /pattaya/i.test(base) ? ' Venue' : ' Pattaya';
  return clipAtWord(base, 60 - suffix.length) + suffix;
}

function metaDesc(s) {
  const base = clipAtWord(s, 145);
  if (base.length >= 100) return base;
  const expanded = (base ? base.replace(/[.\s]+$/, '') + '. ' : '') + 'Find verified addresses, maps, hours, price range and contact details for training in Pattaya.';
  return clipAtWord(expanded, 155);
}

function criticalCss() {
  // Minimal FOUC prevention only. Editorial styling lives in styles.css.
  return `<style>:root{color-scheme:dark}html{background:#0a0a0a}body{margin:0;background:#0a0a0a;color:#f4f0e8;font-family:"Inter Tight",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased}*,*::before,*::after{box-sizing:border-box}a{color:inherit;text-decoration:none}img,svg,video{max-width:100%;display:block;height:auto}</style>`;
}

function desktopTocCriticalCss() {
  // TOC layout grid only — visual styling is in styles.css.
  return `<style>@media(min-width:1100px){.venue-content-shell.has-toc{display:grid;grid-template-columns:240px minmax(0,1fr);gap:48px;align-items:start}.venue-content-shell.has-toc .jump-to{position:sticky;top:96px;max-height:calc(100vh - 120px);overflow-y:auto}}</style>`;
}

function asyncStylesheet(file) {
  const href = assetHref(file);
  return `<link rel="preload" href="${href}" as="style" />
  <link rel="stylesheet" href="${href}" />`;
}

function accessibilityCriticalCss() {
  return `<style>.skip-link{position:absolute;left:-9999px;top:0;z-index:1000;background:#d4a72c;color:#0a0a0a;padding:12px 18px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;text-decoration:none}.skip-link:focus{left:8px;top:8px}:focus-visible{outline:2px solid #d4a72c;outline-offset:3px}</style>`;
}

function stylesheetTags(includeVenueCss = true) {
  return `${criticalCss()}
  ${desktopTocCriticalCss()}
  ${accessibilityCriticalCss()}
  ${asyncStylesheet('/styles.css')}
  ${includeVenueCss ? asyncStylesheet('/venue.css') : ''}`;
}

function serviceWorkerRegistration() {
  return `<script src="${assetHref('/site-ui.js')}" defer></script>`;
}

function finalizeHtml(html) {
  return String(html)
    .replace(/<button\b(?![^>]*\btype=)/g, '<button type="button"')
    .replace(/\s+onerror="this\.parentElement\.style\.display='none'"/g, ' data-fallback-hide="parent"')
    .replace(/\s+onload="this\.media='all'"/g, '')
    .replace(/\s+onload="this\.onload=null;this\.rel='stylesheet'"/g, '');
}

function newsletterFooterHtml() { return ""; }

function pageFeedbackHtml() { return ""; }

function schemaTypesForCategory(cat) {
  const key = String(cat || '').toLowerCase();
  const byCategory = {
    'muay-thai': ['LocalBusiness', 'SportsActivityLocation', 'SportsClub'],
    fitness: ['LocalBusiness', 'SportsActivityLocation', 'HealthClub', 'ExerciseGym'],
    crossfit: ['LocalBusiness', 'SportsActivityLocation', 'HealthClub', 'ExerciseGym'],
    golf: ['LocalBusiness', 'SportsActivityLocation', 'GolfCourse'],
    yoga: ['LocalBusiness', 'SportsActivityLocation', 'HealthAndBeautyBusiness'],
    climbing: ['LocalBusiness', 'SportsActivityLocation'],
    watersports: ['LocalBusiness', 'SportsActivityLocation'],
    swimming: ['LocalBusiness', 'SportsActivityLocation'],
    racquet: ['LocalBusiness', 'SportsActivityLocation', 'SportsClub'],
    'kids-youth': ['LocalBusiness', 'SportsActivityLocation'],
    equestrian: ['LocalBusiness', 'SportsActivityLocation'],
    adventure: ['LocalBusiness', 'SportsActivityLocation'],
    clubs: ['LocalBusiness', 'SportsActivityLocation', 'SportsClub']
  };
  return byCategory[key] || ['LocalBusiness', 'SportsActivityLocation'];
}

function serviceTypeForCategory(cat) {
  const key = String(cat || '').toLowerCase();
  return ({
    'muay-thai': 'Muay Thai training',
    fitness: 'Gym and fitness training',
    crossfit: 'Functional fitness training',
    golf: 'Golf course access',
    yoga: 'Yoga and Pilates classes',
    climbing: 'Indoor climbing',
    watersports: 'Watersports and diving',
    swimming: 'Swimming and aquatics',
    racquet: 'Racquet sports',
    'kids-youth': 'Youth sports programmes',
    equestrian: 'Equestrian sports',
    adventure: 'Adventure sports',
    clubs: 'Sports club activities'
  })[key] || 'Sports and fitness venue';
}

function mapPriceRangeToDollars(priceRange) {
  const raw = String(priceRange || '').trim();
  if (!raw) return undefined;
  const bahtCount = (raw.match(/฿/g) || []).length || (raw.match(/à¸¿/g) || []).length;
  if (bahtCount) return '$'.repeat(Math.max(1, Math.min(4, bahtCount)));
  const cleaned = raw.replace(/\s+/g, '');
  if (cleaned.length <= 4) return '$'.repeat(Math.max(1, Math.min(4, cleaned.length)));
  return raw;
}

function postalCodeFromAddress(address) {
  const match = String(address || '').match(/\b(\d{5})\b/);
  return match ? match[1] : undefined;
}

function openingDaysFromHours(hours) {
  const s = String(hours || '').toLowerCase();
  const all = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (/24\/7|24 hours|daily|every day|7 days/.test(s)) return all;
  if (/mon\s*[-–]\s*sat|monday\s*[-–]\s*saturday/.test(s)) return all.slice(0, 6);
  if (/mon\s*[-–]\s*fri|monday\s*[-–]\s*friday/.test(s)) return all.slice(0, 5);
  if (/sat\s*[-–]\s*sun|saturday\s*[-–]\s*sunday/.test(s)) return all.slice(5);
  if (/closed sunday|closed sundays/.test(s)) return all.slice(0, 6);
  return undefined;
}

function normaliseSchemaTime(hour, minute) {
  const h = String(hour).padStart(2, '0');
  const m = String(minute == null || minute === '' ? '00' : minute).padStart(2, '0');
  return `${h}:${m}`;
}

function parseOpeningHoursSpecification(hours) {
  const raw = String(hours || '');
  if (!raw.trim()) return undefined;
  const dayOfWeek = openingDaysFromHours(raw);
  if (/24\/7|24 hours/.test(raw.toLowerCase())) {
    return [{ '@type': 'OpeningHoursSpecification', dayOfWeek: dayOfWeek || openingDaysFromHours('daily'), opens: '00:00', closes: '23:59' }];
  }
  const ranges = [];
  const re = /(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    const openHour = Number(match[1]);
    const closeHour = Number(match[3]);
    if (openHour > 23 || closeHour > 24) continue;
    ranges.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dayOfWeek || openingDaysFromHours('daily'),
      opens: normaliseSchemaTime(match[1], match[2]),
      closes: normaliseSchemaTime(match[3], match[4])
    });
  }
  return ranges.length ? ranges : undefined;
}

const WIKIDATA_QIDS = {
  'lumpinee-boxing-stadium': 'Q1378411',
  'rajadamnern-stadium': 'Q1374988'
};

function buildVenueSchema(fm, slug, url, desc) {
  const image = `${SITE}/og/${slug}.png`;
  const sameAs = [
    fm.social && fm.social.facebook && `https://facebook.com/${fm.social.facebook}`,
    fm.social && fm.social.instagram && `https://instagram.com/${fm.social.instagram}`,
    WIKIDATA_QIDS[slug] && `https://www.wikidata.org/wiki/${WIKIDATA_QIDS[slug]}`
  ].filter(Boolean);

  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaTypesForCategory(fm.category),
    '@id': `${url}#venue`,
    name: fm.name,
    description: desc,
    url: fm.website || url,
    mainEntityOfPage: url,
    image,
    telephone: telHref(fm.phone) || fm.phone || undefined,
    priceRange: mapPriceRangeToDollars(fm.priceRange),
    address: {
      '@type': 'PostalAddress',
      streetAddress: fm.address || '',
      addressLocality: 'Pattaya',
      addressRegion: 'Chonburi',
      postalCode: postalCodeFromAddress(fm.address),
      addressCountry: 'TH'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: PATTAYA_GEO.latitude,
      longitude: PATTAYA_GEO.longitude
    },
    openingHours: fm.hours || undefined,
    openingHoursSpecification: parseOpeningHoursSpecification(fm.hours),
    sameAs: sameAs.length ? sameAs : undefined,
    dateModified: fm.verified || undefined,
    keywords: (fm.tags || []).join(', ') || undefined,
    availableLanguage: ['English', 'Thai'],
    paymentAccepted: 'Cash, Credit Card',
    currenciesAccepted: 'THB',
    containedInPlace: {
      '@type': 'Place',
      name: fm.area || 'Pattaya',
      containedInPlace: { '@type': 'City', name: 'Pattaya', address: { '@type': 'PostalAddress', addressCountry: 'TH' } }
    },
    makesOffer: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: serviceTypeForCategory(fm.category),
        serviceType: serviceTypeForCategory(fm.category),
        areaServed: { '@type': 'City', name: 'Pattaya' }
      }
    },
    additionalProperty: [{
      '@type': 'PropertyValue',
      name: 'geo_accuracy',
      value: 'Approximate Pattaya centroid. Coordinates pending field survey.'
    }]
  };

  Object.keys(schema).forEach(k => schema[k] === undefined && delete schema[k]);
  Object.keys(schema.address).forEach(k => schema.address[k] === undefined && delete schema.address[k]);
  return schema;
}


// Auto-generate 3-5 FAQ items per venue page.
// Category-aware so a Muay Thai camp gets different Qs than a golf course.
function generateVenueFAQs(fm) {
  const name = fm.name || 'this venue';
  const area = fm.area || '';
  const cat = (fm.category || '').toLowerCase();
  const price = fm.priceRange || '';
  const hours = fm.hours || '';
  const desc = fm.description || '';
  const tags = (fm.tags || []).map(t => String(t).toLowerCase()).join(' ');
  const has = (s) => (desc + ' ' + tags).toLowerCase().includes(s);
  const fmt = (s) => String(s || '').replace(/[<>]/g, '').trim();

  const faqs = [];

  // Q1 — location (universal)
  if (area || fm.address) {
    faqs.push({
      q: `Where is ${name}?`,
      a: `${name} is located in ${fmt(area || fm.address)}, Pattaya, Thailand.${fm.address && fm.address !== area ? ' Full address: ' + fmt(fm.address) + '.' : ''}`
    });
  }

  // Q2 — hours (universal if hours data present)
  if (hours) {
    faqs.push({
      q: `What are the opening hours of ${name}?`,
      a: `${name} operates ${fmt(hours)}. Hours can change on Thai public holidays — call ahead or check their website to confirm.`
    });
  }

  // Q3 — pricing (category-aware, since '฿฿' means different things across sports)
  if (price) {
    const priceByCategory = {
      'muay-thai': {
        '฿':    'budget (฿200-500 drop-in, ฿4,000-8,000/month walk-in camp)',
        '฿฿':   'mid-tier (฿500-1,200 drop-in, ฿8,000-15,000/month)',
        '฿฿฿':  'premium (฿1,000-2,000 drop-in, ฿15,000-30,000/month with English-speaking trainers)',
        '฿฿฿฿': 'luxury / resort camp (฿30,000+/month, often with accommodation included)'
      },
      'fitness': {
        '฿':    'budget (฿100-300 day-pass, ฿1,200-2,000/month)',
        '฿฿':   'mid-tier (฿300-600 day-pass, ฿2,000-4,500/month)',
        '฿฿฿':  'premium (฿600-1,500 day-pass, ฿4,500-8,000/month, boutique or hotel)',
        '฿฿฿฿': 'luxury (5-star hotel gym, often members-or-guests-only, ฿8,000+/month)'
      },
      'golf': {
        '฿':    'budget (under ฿1,000 green fees weekday)',
        '฿฿':   'mid-tier (฿1,500-2,500 weekday, ฿2,500-3,500 weekend)',
        '฿฿฿':  'premium (฿2,500-4,500, championship-grade)',
        '฿฿฿฿': 'top-tier (฿4,500+, tournament-host courses, often resort-bundled)'
      },
      'yoga': {
        '฿':    'budget (under ฿400/class, ฿2,000-3,000 monthly pass)',
        '฿฿':   'mid-tier (฿400-700/class, ฿3,000-5,000 monthly)',
        '฿฿฿':  'premium (boutique studio, ฿700+/class, retreat packages)',
        '฿฿฿฿': 'luxury studio or destination retreat'
      },
      'racquet': {
        '฿':    'public courts or budget bookings (฿100-300/hour)',
        '฿฿':   'mid-tier club (฿300-700/hour)',
        '฿฿฿':  'premium club or hotel courts (฿700-1,500/hour, coaches included)',
        '฿฿฿฿': 'luxury / private-club access only'
      },
      'watersports': {
        '฿':    'budget rental or beginner intro (฿500-1,500/session)',
        '฿฿':   'mid-tier (฿1,500-3,500 single dive, scuba course intro)',
        '฿฿฿':  'premium dive operator, full PADI courses (฿3,500-12,000)',
        '฿฿฿฿': 'luxury liveaboard / private charter (฿12,000+)'
      },
      'swimming': {
        '฿':    'public pool or community access (฿50-150)',
        '฿฿':   'hotel day-pass or pool club (฿200-700)',
        '฿฿฿':  'premium hotel or waterpark (฿700-1,800)',
        '฿฿฿฿': 'luxury 5-star resort, often guests-only'
      },
      'adventure': {
        '฿':    'budget activity (under ฿800)',
        '฿฿':   'mid-tier (฿800-2,500 — karts, ATV, ziplines)',
        '฿฿฿':  'premium (฿2,500-7,000 — skydiving, helicopter)',
        '฿฿฿฿': 'luxury / charter (฿7,000+)'
      }
    };
    const map = priceByCategory[cat] || {
      '฿': 'budget tier',
      '฿฿': 'mid-tier',
      '฿฿฿': 'premium tier',
      '฿฿฿฿': 'luxury tier'
    };
    const explained = map[price] || 'see venue page for current rates';
    faqs.push({
      q: `How much does ${name} cost?`,
      a: `${name} is in the ${price} ${cat ? cat.replace('-', ' ') + ' ' : ''}price tier — ${explained}. Exact current rates change with season and group size; contact the venue to confirm.`
    });
  }

  // Q4 — category-specific
  if (cat === 'muay-thai') {
    faqs.push({
      q: `Is ${name} good for beginners?`,
      a: has('beginner') || has('all-level') || has('first-time')
        ? `Yes — ${name} explicitly welcomes beginners and runs entry-level instruction. No prior experience needed.`
        : `Most Pattaya Muay Thai camps welcome beginners. Contact ${name} directly to ask about their beginner programs and what to expect on day one.`
    });
  } else if (cat === 'fitness') {
    faqs.push({
      q: `Does ${name} require a long-term contract?`,
      a: has('no-contract') || has('drop-in')
        ? `${name} offers flexible no-contract options. Drop-in rates are typically available for visitors and short-stay residents.`
        : `Contact ${name} directly to ask about contract terms and drop-in rates. Most Pattaya gyms offer monthly options without long contracts.`
    });
  } else if (cat === 'golf') {
    faqs.push({
      q: `Do I need to book in advance at ${name}?`,
      a: `Tee-time booking in advance is strongly recommended at all Pattaya golf courses, especially on weekends and during peak tourist season (Nov–Feb). Most courses also rent clubs and arrange caddies on the day.`
    });
  } else if (cat === 'yoga') {
    faqs.push({
      q: `What styles of yoga does ${name} offer?`,
      a: desc.toLowerCase().includes('vinyasa') || desc.toLowerCase().includes('hatha') || desc.toLowerCase().includes('ashtanga') || desc.toLowerCase().includes('yin')
        ? `Per the venue page above, ${name} teaches a mix of styles. Class schedules vary — check their website or social media for the current week.`
        : `${name} typically offers a mix of yoga styles. Check their schedule for current class types and times.`
    });
  } else if (cat === 'watersports') {
    faqs.push({
      q: `Do I need experience for activities at ${name}?`,
      a: has('beginner') || has('first-time') || has('intro')
        ? `${name} caters to first-timers as well as experienced participants. Equipment and instruction are provided.`
        : `Most Pattaya watersports operators run programs for total beginners with full equipment and instruction included. Contact ${name} for current packages.`
    });
  } else if (cat === 'racquet') {
    faqs.push({
      q: `Can I rent racquets and equipment at ${name}?`,
      a: `Most Pattaya racquet venues provide loaner racquets and balls. Confirm with ${name} at booking, especially if you need specific equipment for tennis, pickleball, badminton, or squash.`
    });
  } else if (cat === 'swimming') {
    faqs.push({
      q: `Is ${name} open to non-members or hotel guests only?`,
      a: has('public') || has('municipal')
        ? `${name} is open to the public — typically pay-per-visit.`
        : `Access policies vary. Contact ${name} to confirm whether day-pass, membership, or hotel-guest-only access applies.`
    });
  } else if (cat === 'kids-youth') {
    faqs.push({
      q: `What age range does ${name} accept?`,
      a: `Age ranges vary by program. Contact ${name} directly to confirm minimum age and whether parental supervision is required during sessions.`
    });
  } else if (cat === 'adventure') {
    faqs.push({
      q: `Is hotel pickup included at ${name}?`,
      a: has('hotel pickup') || has('transfer')
        ? `Yes — ${name} typically includes hotel pickup from central Pattaya. Confirm pickup window at booking.`
        : `Hotel pickup may be available — confirm at booking. Otherwise Bolt/Grab from central Pattaya is the easiest option.`
    });
  } else if (cat === 'climbing') {
    faqs.push({
      q: `Do I need climbing experience to visit ${name}?`,
      a: `${name} caters to all skill levels — beginners use auto-belay routes and easy boulder problems, while experienced climbers tackle harder routes. Shoes and harnesses are typically rentable on site.`
    });
  } else if (cat === 'crossfit') {
    faqs.push({
      q: `Are CrossFit beginners welcome at ${name}?`,
      a: `Yes — beginners typically start with a fundamentals course or scaled drop-in class. Contact ${name} to confirm their on-ramp process.`
    });
  } else if (cat === 'equestrian') {
    faqs.push({
      q: `Are riding lessons available at ${name}?`,
      a: `Most Pattaya equestrian venues offer lessons for all levels — from first-time riders to experienced equestrians and polo players. Book in advance to confirm coach availability.`
    });
  } else {
    faqs.push({
      q: `Is ${name} suitable for first-time visitors?`,
      a: has('beginner') || has('all-level') || has('family') || has('kid')
        ? `Yes — ${name} welcomes first-time visitors and beginners.`
        : `${name} is open to a wide range of visitors. Contact the venue to confirm what fits your level and goals.`
    });
  }

  // Q5 — language (universal, always relevant for Pattaya)
  faqs.push({
    q: `Do staff at ${name} speak English?`,
    a: has('english') || has('international') || has('expat')
      ? `Yes — ${name} regularly serves international clients and English-speaking staff are available.`
      : `Pattaya is an international tourist city, and most venues have at least one English-speaking staff member. Contact ${name} ahead of your visit if you need language confirmation.`
  });

  // Q6 — accommodation / on-site (only if tags suggest it)
  if (has('accommodation') || has('on-site hotel') || has('all-inclusive') || has('hotel')) {
    faqs.push({
      q: `Does ${name} offer on-site accommodation?`,
      a: `Yes — ${name} provides on-site or partner accommodation. This makes it a strong fit for full-immersion training camps and longer-stay visitors. Contact the venue for room types, pricing and minimum stay.`
    });
  }

  // Q7 — kids / family (only if relevant)
  if (has('kid') || has('family') || has('child') || has('all-age')) {
    faqs.push({
      q: `Is ${name} suitable for kids or families?`,
      a: `${name} has signals of family-friendly accommodation in its profile — kids' programs, family pricing, or all-age access. Confirm minimum age and any parental-supervision requirements when booking.`
    });
  }

  // Q8 — payment / contracts (fitness specific, drop-in friendly)
  if ((cat === 'fitness' || cat === 'crossfit' || cat === 'yoga') && (has('drop-in') || has('no-contract') || has('day-pass'))) {
    faqs.push({
      q: `Can I drop in to ${name} for a single session?`,
      a: `Yes — ${name} accepts drop-in or day-pass visitors. Walk-in rates are typically ฿200–฿600 depending on the venue tier. Bring valid ID for first-visit registration.`
    });
  }

  // Q9 — fight-prep / pro track (Muay Thai with pro signals)
  if (cat === 'muay-thai' && (has('fighter-track') || has('pro') || has('professional') || has('champion'))) {
    faqs.push({
      q: `Does ${name} train professional or competitive fighters?`,
      a: `Yes — ${name} has a fighter-track program with professional or competitive-level coaching. Multi-session days, real sparring rounds and ring time are part of the program. Ask about visa-supported long-stay options.`
    });
  }

  // Q10 — booking method
  if (fm.website || (fm.social && (fm.social.facebook || fm.social.instagram))) {
    const channels = [];
    if (fm.phone) channels.push('phone (' + fmt(fm.phone) + ')');
    if (fm.website) channels.push('their website');
    if (fm.social && fm.social.facebook) channels.push('Facebook DM');
    if (fm.social && fm.social.instagram) channels.push('Instagram DM');
    faqs.push({
      q: `How do I book or contact ${name}?`,
      a: `${name} is reachable via ${channels.slice(0, 3).join(', ')}. Most Pattaya venues respond fastest to Facebook or Instagram messages. For same-day visits, call ahead to confirm session times.`
    });
  }

  return faqs.slice(0, 8);
}



// ============================================================
// "Best for / Not best for" block driven by venue tags
// ============================================================
function buildBestForBlock(fm) {
  const tags = (fm.tags || []).map(t => String(t).toLowerCase());
  const cat = fm.category || '';
  const has = (s) => tags.some(t => t.indexOf(s) >= 0);
  const desc = (fm.description || '').toLowerCase();
  const descHas = (s) => desc.indexOf(s) >= 0;

  const bestFor = [];
  const notBestFor = [];

  // Audience signals
  if (has('beginner') || descHas('beginner') || has('first-time') || has('intro')) bestFor.push('Beginners and first-timers');
  if (has('all-level') || has('family')) bestFor.push('All experience levels');
  if (has('pro') || has('fighter-track') || has('champion') || has('competitive')) bestFor.push('Competitive athletes and pro-track training');
  if (has('kid') || has('child') || has('youth')) bestFor.push('Kids and youth programs');
  if (has('female-friendly') || has('women')) bestFor.push('Female-friendly environment');
  if (has('english') || has('international') || has('expat')) bestFor.push('English-speaking travellers and long-stay expats');
  if (has('russian')) bestFor.push('Russian-speaking visitors');
  if (has('budget')) bestFor.push('Budget-conscious training');
  if (has('luxury') || has('premium') || has('5-star')) bestFor.push('Premium / 5-star experience');
  if (has('walk-in') || has('drop-in') || has('day-pass')) bestFor.push('Drop-in and short-stay visitors');
  if (has('accommodation') || has('all-inclusive') || has('on-site hotel')) bestFor.push('Full-immersion training stays with on-site accommodation');
  if (has('hotel') && fm.category === 'fitness') bestFor.push('Hotel guests and short-term stays');
  if (has('24-7') || has('24-hour') || has('24/7')) bestFor.push('Late-night or early-morning training');
  if (has('near-beach') || descHas('beach')) bestFor.push('Beach-adjacent training and lifestyle');
  if (has('multi-discipline')) bestFor.push('Multi-discipline cross-training');
  if (has('private-coach') || has('private')) bestFor.push('Private one-on-one coaching');

  // Counter-signals
  if (has('budget')) notBestFor.push('Visitors looking for luxury-resort amenities');
  if (has('luxury') || has('premium') || has('5-star')) notBestFor.push('Budget-conscious training plans');
  if (has('pro') || has('fighter-track')) notBestFor.push('Total first-timers without prior conditioning');
  if (has('kid') || has('child')) notBestFor.push('Adults-only training environments');
  if (cat === 'muay-thai' && has('budget')) notBestFor.push('Travellers needing on-site hotel-style accommodation');
  if (cat === 'golf' && (has('championship') || has('tournament'))) notBestFor.push('Casual or first-time golfers without prior course experience');
  if (has('membership-only')) notBestFor.push('Walk-in or drop-in visitors');

  // Dedupe + cap
  const uniq = (a) => Array.from(new Set(a)).slice(0, 6);
  const bf = uniq(bestFor);
  const nbf = uniq(notBestFor);

  if (!bf.length && !nbf.length) return '';

  let html = '<section class="venue-fit" aria-label="Who this venue is best for" style="margin: 32px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">';
  if (bf.length) {
    html += '<div style="background: rgba(255,184,0,0.04); border: 1px solid rgba(255,184,0,0.22); border-radius: 8px; padding: 18px 20px;">';
    html += '<p style="font-family: \'JetBrains Mono\', monospace; font-size: 11px; color: rgba(255,216,74,0.85); letter-spacing: 0.10em; margin: 0 0 12px; text-transform: uppercase; font-weight: 500;">// Best for</p>';
    html += '<ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.7; color: rgba(228,228,232,0.85);">';
    bf.forEach(b => { html += '<li>' + escHtml(b) + '</li>'; });
    html += '</ul></div>';
  }
  if (nbf.length) {
    html += '<div style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 18px 20px;">';
    html += '<p style="font-family: \'JetBrains Mono\', monospace; font-size: 11px; color: rgba(150,150,156,0.72); letter-spacing: 0.10em; margin: 0 0 12px; text-transform: uppercase; font-weight: 500;">// Not best for</p>';
    html += '<ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.7; color: rgba(180,180,184,0.7);">';
    nbf.forEach(b => { html += '<li>' + escHtml(b) + '</li>'; });
    html += '</ul></div>';
  }
  html += '</section>';
  return html;
}

// ============================================================
// Visible "Last verified" line for venue body
// ============================================================
function buildLastUpdatedNote(fm) {
  const d = fm.verified || fm.added;
  if (!d) return '';
  return '<p class="venue-verified-note" style="font-family: \'JetBrains Mono\', monospace; font-size: 12px; color: rgba(150,150,156,0.6); margin: 32px 0 0; letter-spacing: 0.02em;">// Last verified: ' + escHtml(d) + ' · Independent directory · No paid placements · <a href="/methodology/" style="color: rgba(255,216,74,0.85); text-decoration: none; border-bottom: 1px solid rgba(255,184,0,0.32);">Research methodology</a></p>';
}


// ============================================================
// Nearby venues — same area, different category (cross-discipline cross-link)
// ============================================================
function buildNearbyVenuesBlock(fm, allGyms) {
  if (!fm.area || !Array.isArray(allGyms)) return '';
  const myArea = String(fm.area).toLowerCase();
  // Match by area keywords (jomtien, naklua, pratamnak, etc.)
  const areaKeys = ['jomtien','naklua','pratamnak','pratumnak','sattahip','central pattaya','east pattaya','soi buakhao','walking street','beach road','mabprachan','khao talo','huay yai','huai yai','wong amat','na jomtien'];
  const myKeyword = areaKeys.find(k => myArea.indexOf(k) >= 0);
  if (!myKeyword) return '';
  const nearby = allGyms.filter(g => {
    if (!g || g.id === fm.id) return false;
    if (g.category === fm.category) return false; // exclude same category (already shown as "Related")
    const ga = ((g.area || '') + ' ' + (g.address || '')).toLowerCase();
    return ga.indexOf(myKeyword) >= 0;
  }).slice(0, 6);
  if (!nearby.length) return '';
  let html = '<section class="nearby-venues" aria-label="Other sport venues nearby" style="margin: 48px 0 0;">';
  html += '<p style="font-family: \'JetBrains Mono\', monospace; font-size: 12px; color: rgba(255,122,58,0.85); letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 16px;">// OTHER SPORT VENUES NEARBY</p>';
  html += '<h2 style="font-family: \'Inter Tight\', sans-serif; font-weight: 900; font-size: clamp(1.6rem, 3vw, 2.2rem); line-height: 1.05; letter-spacing: -0.025em; text-transform: uppercase; margin: 0 0 20px;">Different sport, same area.</h2>';
  html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px;">';
  for (const g of nearby) {
    html += '<a href="/gyms/' + escHtml(g.id) + '/" style="display:flex;flex-direction:column;gap:6px;text-decoration:none;color:inherit;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:18px 18px 16px;transition:transform 0.25s,border-color 0.25s,background 0.25s;">';
    html += '<span style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:rgba(255,216,74,0.85);letter-spacing:0.10em;text-transform:uppercase;">' + escHtml(g.category || '') + '</span>';
    html += '<h3 style="font-family:\'Inter Tight\',sans-serif;font-weight:700;font-size:1.05rem;line-height:1.2;letter-spacing:-0.015em;margin:0;color:#f7f7f8;">' + escHtml(g.name) + '</h3>';
    if (g.area) html += '<p style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px;color:rgba(228,228,232,0.72);margin:0;line-height:1.5;">' + escHtml(g.area) + '</p>';
    html += '</a>';
  }
  html += '</div></section>';
  return html;
}

// Auto-link cross-venue mentions in body HTML.
// When the venue body mentions another venue by name (e.g. "Sityodtong", "Fairtex Pattaya"),
// wrap the FIRST occurrence in a link to that venue's page.
// Skips: current venue (self-reference), text already inside <a>, text inside <h1-h6>,
// and very short / common ambiguous names.
function autoLinkVenues(html, currentSlug, allGyms) {
  if (!html || !Array.isArray(allGyms)) return html;

  // Build a list of [pattern, slug] pairs, longest names first so "Anytime Fitness Pattaya"
  // matches before "Anytime Fitness".
  const candidates = [];
  for (const g of allGyms) {
    if (!g || !g.id || g.id === currentSlug) continue;
    const name = g.name || '';
    if (!name) continue;
    // Generate match candidates from the name. Always include the full name.
    const variants = new Set([name]);
    // Strip parenthetical (e.g. "Andaz Pattaya Jomtien Beach (Hyatt)" → "Andaz Pattaya Jomtien Beach")
    const noParen = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (noParen.length >= 6) variants.add(noParen);
    // Strip everything after em-dash, en-dash, or pipe (e.g. "Hilton Pattaya — Fitness, Spa & Pool" → "Hilton Pattaya")
    const noDash = noParen.replace(/\s*[–—―|\-]\s+.*$/, '').trim();
    if (noDash.length >= 6) variants.add(noDash);
    // Strip trailing "Pattaya" (e.g. "Sityodtong Pattaya" → "Sityodtong")
    const noPattaya = noDash.replace(/\s+Pattaya$/i, '').trim();
    if (noPattaya.length >= 6) variants.add(noPattaya);
    for (const v of variants) {
      const trimmed = String(v).trim();
      if (trimmed.length < 6) continue; // too short, ambiguous
      // Skip generic / risky terms
      if (/^(Pattaya|Thailand|Jomtien|Naklua|Fitness|Yoga|Boxing|Beach|Public)$/i.test(trimmed)) continue;
      candidates.push({ pattern: trimmed, slug: g.id });
    }
  }
  // Sort longest first so multi-word matches are tried before substring matches
  candidates.sort((a, b) => b.pattern.length - a.pattern.length);

  // Track which slugs we've already linked to avoid duplicates per page
  const linkedSlugs = new Set();

  // We split HTML into safe and unsafe regions.
  // Unsafe: anything inside <a>...</a> or any heading tag <h1>-<h6>...</h6>
  // We process safe regions only.
  const skipRe = /(<a\b[^>]*>[\s\S]*?<\/a>)|(<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>)|(<script\b[\s\S]*?<\/script>)|(<style\b[\s\S]*?<\/style>)|(<[^>]+>)/gi;
  const parts = [];
  let last = 0;
  let m;
  while ((m = skipRe.exec(html)) !== null) {
    if (m.index > last) parts.push({ safe: true, text: html.slice(last, m.index) });
    parts.push({ safe: false, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < html.length) parts.push({ safe: true, text: html.slice(last) });

  // Process safe parts in order
  for (const part of parts) {
    if (!part.safe) continue;
    let text = part.text;
    for (const c of candidates) {
      if (linkedSlugs.has(c.slug)) continue;
      // Word-boundary match (start with word boundary, end with word boundary)
      const escaped = c.pattern.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('(^|[\\s\\(\\[\\>])(' + escaped + ')(?=[\\s,.;:!?\\)\\]\\<])', '');
      const match = re.exec(text);
      if (match) {
        const before = text.slice(0, match.index + match[1].length);
        const after = text.slice(match.index + match[0].length);
        text = before + '<a href="/gyms/' + c.slug + '/">' + match[2] + '</a>' + after;
        linkedSlugs.add(c.slug);
      }
    }
    part.text = text;
  }

  return parts.map(p => p.text).join('');
}

function buildVenuePage(slug, fm, bodyHtml, body, allGyms, allCats) {
  // Auto-link venue cross-references in body HTML
  bodyHtml = autoLinkVenues(bodyHtml, slug, allGyms);
  const url = `${SITE}/gyms/${slug}/`;
  const title = venueMetaTitle(fm.name);
  const firstPara = extractFirstParagraph(body || '');
  const desc = metaDesc(fm.description || firstPara || `Train at ${fm.name} in Pattaya, Thailand. Address, pricing, schedule, trainers, reviews and more.`);
  const cat = (fm.category || '').replace(/-/g, ' ');
  const sources = Array.isArray(fm.sources) ? fm.sources : [];

  // Related venues — same category, exclude self, pick first 3
  const related = (allGyms || [])
    .filter(g => g.category === fm.category && g.id !== slug)
    .slice(0, 3);

  // Resolve readable category label (CATEGORIES has emoji + label per key)
  const catObj = (allCats || []).find(c => c.key === fm.category);
  const catLabel = catObj ? catObj.label : cat;

  // Mobile-first 2026 helpers
  const readingMin = computeReadingTime(body);
  const openStatus = detectOpenStatus(fm.hours);
  const tldrHtml = buildTLDR(body);
  const languagesArr = Array.isArray(fm.languages) ? fm.languages : [];
  const languagesStr = languagesArr.join(' · ');
  const tocItems = [];
  const headingRe = /<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
  let headingMatch;
  while ((headingMatch = headingRe.exec(bodyHtml)) !== null) {
    const id = headingMatch[1];
    const label = headingMatch[2].replace(/<[^>]+>/g, '').trim();
    if (label) tocItems.push({ id, label });
  }
  const tocHtml = tocItems.length >= 3
    ? `<nav class="jump-to" aria-label="Table of contents">
        <span class="jump-to-label">On this page</span>
        ${tocItems.map(it => `<a href="#${it.id}" class="jump-pill">${escHtml(it.label)}</a>`).join('')}
      </nav>`
    : '';

  const ogImage = `${SITE}/og/${slug}.png`;
  const schema = buildVenueSchema(fm, slug, url, desc);

  const social = fm.social || {};
  const phoneHref = telHref(fm.phone);
  const socialLinks = [
    social.facebook && `<a href="https://facebook.com/${social.facebook}" rel="noopener" target="_blank">Facebook</a>`,
    social.instagram && `<a href="https://instagram.com/${social.instagram}" rel="noopener" target="_blank">Instagram</a>`
  ].filter(Boolean).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0b0b0d" />
  <meta name="apple-mobile-web-app-title" content="Pattaya Gym" />
  <meta name="application-name" content="Pattaya Gym" />
  <meta name="msapplication-TileColor" content="#0b0b0d" />
  <meta name="msapplication-TileImage" content="/icon-192.png" />
  <meta name="color-scheme" content="dark" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/icon-180.png" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(desc)}" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en" href="${url}" />
  <link rel="alternate" hreflang="x-default" href="${url}" />
  <link rel="alternate" type="application/rss+xml" title="Pattaya Gym — Recently Added" href="/feed.xml" />

  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta http-equiv="x-dns-prefetch-control" content="on" />
  <link rel="dns-prefetch" href="//maps.google.com" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" />
  <link rel="preconnect" href="https://plausible.io" crossorigin />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Pattaya Gym" />
  <meta property="og:title" content="${escHtml(fm.name)}" />
  <meta property="og:description" content="${escHtml(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:alt" content="${escHtml(fm.name || slug)} — Pattaya Gym" />
  <meta property="og:locale" content="en_US" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(fm.name)}" />
  <meta name="twitter:description" content="${escHtml(desc)}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta name="twitter:image:src" content="${ogImage}" />
  <meta name="thumbnail" content="${ogImage}" />
  <link rel="image_src" href="${ogImage}" />

  ${stylesheetTags(true)}
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23000'/%3E%3Ctext x='50' y='62' font-size='52' text-anchor='middle' fill='%23ffb800' font-family='sans-serif' font-weight='900'%3EP%3C/text%3E%3C/svg%3E" />
  <script defer data-domain="pattaya-gym.com" src="https://plausible.io/js/script.js"></script>
  <script src="${assetHref('/shortcuts.js')}" defer></script>
  ${serviceWorkerRegistration()}

  <script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: (catObj && catObj.label) || (fm.category || 'Venues'), item: SITE + '/category/' + (fm.category || '') + '/' },
      { '@type': 'ListItem', position: 3, name: fm.name || slug, item: url }
    ]
  })}</script>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url + '#webpage',
    url: url,
    name: (fm.name || slug) + ' | Pattaya Gym',
    description: (fm.description || '').slice(0, 160),
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', '@id': SITE + '/#website', name: 'Pattaya Gym Directory', url: SITE + '/' },
    primaryImageOfPage: { '@type': 'ImageObject', url: SITE + '/og-image.png' },
    breadcrumb: { '@id': url + '#breadcrumb' },
    datePublished: fm.added || fm.verified || undefined,
    dateModified: fm.verified || undefined
  })}</script>
<!-- Google tag (gtag.js) -->
<script src="${assetHref('/analytics.js')}"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <div class="marquee" aria-hidden="true"><div class="marquee-track"><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span><span class="star">★</span><span>PATTAYA GYM × THE PLUG FOR TRAINING</span><span class="star">★</span><span>158 VENUES · HAND-CHECKED · LIVE</span><span class="star">★</span><span>MUAY THAI · MMA · BOXING · GOLF · TENNIS · YOGA</span><span class="star">★</span></div></div>
  <header class="hero" style="min-height: auto;" role="banner">
    <nav class="nav" role="navigation" aria-label="Primary navigation">
      <a href="/" class="brand">PATTAYA<span class="dot">.</span>GYM</a>
      <ul class="nav-links" id="nav-links">
        <li><a href="/category/muay-thai/">Muay Thai</a></li>
        <li><a href="/category/fitness/">Gyms</a></li>
        <li><a href="/category/golf/">Golf</a></li>
        <li><a href="/category/yoga/">Yoga</a></li>
        <li><a href="/guides/">Guides</a></li>
        <li><a href="/map/">Map</a></li>
      </ul>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
    </nav>
  </header>

  <main id="main" class="venue-page" role="main">
    <div class="venue-breadcrumb">
      <a href="/">Directory</a>
      <span class="bc-sep">›</span>
      <a href="/?cat=${escHtml(fm.category || '')}">${escHtml(cat)}</a>
      <span class="bc-sep">›</span>
      <span>${escHtml(fm.name)}</span>
    </div>

      <div class="venue-hero">
      <div class="venue-hero-art" aria-hidden="true">${getCategoryArt(fm.category)}</div>
      <div class="venue-meta-line">
        <span class="venue-cat-pill">${escHtml(cat)}</span>
${openStatus === 'open' ? '        <span class="open-badge open-now">● Open now</span>\n' : ''}${openStatus === 'closed' ? '        <span class="open-badge open-closed">● Closed now</span>\n' : ''}        <span class="meta-dot">•</span>
        <span class="reading-meta">📖 ${readingMin} min read</span>
        ${fm.verified ? `<span class="meta-dot">•</span><span class="reading-meta">Verified ${escHtml(fm.verified)}</span>` : ''}
      </div>
      <h1 class="venue-h1">${escHtml(fm.name)}</h1>
      ${firstPara ? `<p class="venue-lede">${escHtml(firstPara.slice(0, 240))}${firstPara.length > 240 ? '…' : ''}</p>` : ''}

      <div class="venue-hero-meta">
        ${fm.area ? `<span class="meta-chip">📍 ${escHtml(fm.area)}</span>` : ''}
        ${fm.priceRange ? `<span class="meta-chip">💰 ${escHtml(fm.priceRange)}</span>` : ''}
        ${fm.hours ? `<span class="meta-chip">🕐 ${escHtml(fm.hours)}</span>` : ''}
        ${languagesStr ? `<span class="meta-chip">🗣 ${escHtml(languagesStr)}</span>` : ''}
        ${fm.distinction ? `<span class="meta-chip meta-chip-accent">⭐ ${escHtml(fm.distinction)}</span>` : ''}
      </div>

      <div class="venue-actions">
        ${fm.mapsUrl ? `<a class="btn btn-primary" href="${escHtml(fm.mapsUrl)}" target="_blank" rel="noopener">📍 View on Google Maps</a>` : ''}
        ${fm.mapsUrl ? `<a class="btn btn-secondary" href="${escHtml(fm.mapsUrl)}" target="_blank" rel="noopener">⭐ Read Google Reviews</a>` : ''}
        ${fm.website ? `<a class="btn btn-secondary" href="${escHtml(fm.website)}" target="_blank" rel="noopener">🔗 Official Website</a>` : ''}
        ${phoneHref ? `<a class="btn btn-secondary" href="tel:${escHtml(phoneHref)}">📞 ${escHtml(fm.phone)}</a>` : ''}
        ${social.facebook ? `<a class="btn btn-ghost" href="https://facebook.com/${escHtml(social.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}
        ${social.instagram ? `<a class="btn btn-ghost" href="https://instagram.com/${escHtml(social.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}
        <button type="button" class="favorite-btn" data-pg-favorite-id="${escHtml(slug)}" data-pg-favorite-name="${escHtml(fm.name)}" data-pg-favorite-category="${escHtml(fm.category || '')}" data-pg-favorite-area="${escHtml(fm.area || '')}" data-pg-favorite-price="${escHtml(fm.priceRange || '')}" aria-pressed="false" aria-label="Save to favorites"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button>
        <button type="button" class="compare-btn" data-pg-compare-id="${escHtml(slug)}" data-pg-compare-name="${escHtml(fm.name)}"><span class="cmp-btn-label">+ Add to compare</span></button>
      </div>

      <div class="share-bar">
        <span class="share-label">Share</span>
        <button type="button" class="share-btn share-wa" data-share-target="whatsapp" aria-label="Share on WhatsApp"><span class="share-ico" aria-hidden="true">💬</span> WhatsApp</button>
        <button type="button" class="share-btn share-fb" data-share-target="facebook" aria-label="Share on Facebook"><span class="share-ico" aria-hidden="true">f</span> Facebook</button>
        <button type="button" class="share-btn share-tw" data-share-target="twitter" aria-label="Share on X"><span class="share-ico" aria-hidden="true">𝕏</span> X</button>
        <button type="button" class="share-btn share-line" data-share-target="line" aria-label="Share on LINE"><span class="share-ico" aria-hidden="true">L</span> LINE</button>
        <button type="button" class="share-btn share-tg" data-share-target="telegram" aria-label="Share on Telegram"><span class="share-ico" aria-hidden="true">✈</span> Telegram</button>
        <button type="button" class="share-btn share-copy" data-share-target="copy" aria-label="Copy link"><span class="share-ico" aria-hidden="true">🔗</span> Copy link</button>
      </div>
    </div>

    ${tldrHtml ? `<aside class="tldr-card" aria-label="At a glance summary">
      <div class="tldr-tag">⚡ The quick answer</div>
      <p>${tldrHtml}</p>
    </aside>` : ''}

    <div class="venue-content-shell${tocHtml ? ' has-toc' : ''}">
      ${tocHtml}

      <article class="venue-body">
        ${bodyHtml}
        ${buildBestForBlock(fm)}
        ${buildLastUpdatedNote(fm)}
      </article>
    </div>

    <div class="venue-cta-foot">
      <h3>Visited or trained at ${escHtml(fm.name)}?</h3>
      <p>Help other Pattaya travellers find the right gym — share this page or tell us what we got wrong.</p>
      <div class="cta-row">
        <button type="button" class="btn btn-primary" data-share-target="whatsapp">💬 Share on WhatsApp</button>
        <a class="btn btn-secondary" href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Edit suggestion: ' + fm.name)}">✏️ Suggest an edit</a>
        ${fm.mapsUrl ? `<a class="btn btn-secondary" href="${escHtml(fm.mapsUrl)}" target="_blank" rel="noopener">⭐ Leave a Google review</a>` : ''}
      </div>
    </div>

    ${buildNearbyVenuesBlock(fm, allGyms)}

    ${related.length ? `<section class="related-venues">
      <h2>More ${escHtml(catLabel)} venues in Pattaya</h2>
      <div class="related-grid">
        ${related.map(r => `<a href="/gyms/${escHtml(r.id)}/" class="related-card">
          <span class="rc-cat">${escHtml(catLabel)}</span>
          <h3>${escHtml(r.name)}</h3>
          <p>${escHtml(r.area || r.address || '')}</p>
        </a>`).join('\n        ')}
      </div>
      <p style="margin-top: 16px; font-size: 14px;"><a href="/?cat=${escHtml(fm.category || '')}" style="color: var(--text-dim);">Browse all ${escHtml(catLabel)} venues →</a></p>
    </section>` : ''}

    ${(() => {
      const _faqs = generateVenueFAQs(fm);
      if (!_faqs.length) return '';
      return `<section class="about" aria-labelledby="v-faq-h" style="margin-top: 40px;">
        <h2 id="v-faq-h" style="font-size: 1.4rem; margin-bottom: 16px;">Common questions about ${escHtml(fm.name || 'this venue')}</h2>
        ${_faqs.map(f => `<details class="faq-item"><summary>${escHtml(f.q)}</summary><p>${escHtml(f.a)}</p></details>`).join('')}
      </section>
      <script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: _faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      })}</script>`;
    })()}

    

    <footer class="venue-footer">
      <p>Last verified: <strong>${escHtml(fm.verified || 'N/A')}</strong>. Listing researched from public sources. Errors? Email <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a>.</p>
      ${sources.length ? `<details>
        <summary>Research sources (${sources.length})</summary>
        <ul>
          ${sources.map(s => `<li><a href="${escHtml(s)}" rel="noopener" target="_blank">${escHtml(s)}</a></li>`).join('\n          ')}
        </ul>
      </details>` : ''}
    </footer>
  </main>

  
  <div class="marquee-bottom" aria-hidden="true"><div class="marquee-track"><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span><span>FIND YOUR GYM.</span><span class="star">★</span><span>BOOK A SESSION.</span><span class="star">★</span><span>TRAIN IN PATTAYA.</span><span class="star">★</span></div></div>
  <footer class="site-footer" role="contentinfo">
    <div class="site-footer-inner">
      <div class="sf-col sf-brand-col">
        <div class="sf-brand"><span class="brand-mark small">P</span><span class="sf-brand-text">PATTAYA <strong>GYM</strong></span></div>
        <p class="sf-tag">The most comprehensive directory of gyms, Muay Thai camps, and sport venues in Pattaya, Thailand.</p>
      </div>
      <div class="sf-col">
        <p class="sf-heading">Sport categories</p>
        <ul>
          <li><a href="/category/muay-thai/">Muay Thai camps</a></li>
          <li><a href="/category/fitness/">Fitness gyms</a></li>
          <li><a href="/category/golf/">Golf courses</a></li>
          <li><a href="/category/yoga/">Yoga studios</a></li>
          <li><a href="/category/watersports/">Watersports &amp; diving</a></li>
          <li><a href="/category/racquet/">Racquet sports</a></li>
          <li><a href="/category/swimming/">Swimming pools</a></li>
          <li><a href="/category/adventure/">Adventure</a></li>
        </ul>
      </div>
      <div class="sf-col">
        <p class="sf-heading">Areas of Pattaya</p>
        <ul>
          <li><a href="/area/jomtien/">Jomtien Beach</a></li>
          <li><a href="/area/naklua/">Naklua / North Pattaya</a></li>
          <li><a href="/area/pratamnak/">Pratamnak Hill</a></li>
          <li><a href="/area/central-pattaya/">Central Pattaya</a></li>
          <li><a href="/area/east-pattaya/">East Pattaya / Darkside</a></li>
          <li><a href="/area/sattahip/">Sattahip / Far South</a></li>
        </ul>
      </div>
      <div class="sf-col">
        <p class="sf-heading">Best-of guides</p>
        <ul>
          <li><a href="/guides/best-muay-thai-pattaya/">Best Muay Thai gyms</a></li>
          <li><a href="/guides/best-dive-operators-pattaya/">Best dive operators</a></li>
          <li><a href="/guides/best-golf-courses-pattaya/">Best golf courses</a></li>
          <li><a href="/guides/cheapest-gyms-pattaya/">Cheapest gyms</a></li>
          <li><a href="/guides/luxury-sports-clubs-pattaya/">Luxury sports clubs</a></li>
          <li><a href="/guides/24-hour-gyms-pattaya/">24-hour gyms</a></li>
          <li><a href="/guides/family-friendly-pattaya/">Family-friendly</a></li>
          <li><a href="/guides/best-for-beginners-pattaya/">Best for beginners</a></li>
          <li><a href="/guides/pattaya-digital-nomad-fitness/">Digital nomad fitness</a></li>
          <li><a href="/guides/female-friendly-gyms-pattaya/">Female-friendly venues</a></li>
          <li><a href="/guides/pattaya-seniors-low-impact-sport/">Seniors 65+ sport guide</a></li>
        </ul>
      </div>
      <div class="sf-col">
        <p class="sf-heading">Tools &amp; site</p>
        <ul>
          <li><a href="/search/">Search venues</a></li>
          <li><a href="/favorites/">Saved favorites</a></li>
          <li><a href="/map/">Interactive map</a></li>
          <li><a href="/compare/">Compare venues</a></li>
          <li><a href="/plan-my-trip/">Plan my trip</a></li>
          <li><a href="/find-my-coach/">Find my coach</a></li>
          <li><a href="/about/">About this site</a></li>
          <li><a href="/methodology/">Research methodology</a></li>
          <li><a href="/pattaya-sport-stats/">Sport tourism stats</a></li>
          <li><a href="/add-your-gym/">Add your gym</a></li>
          <li><a href="/contact/">Contact</a></li>
          <li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li>
          <li><a href="https://api.whatsapp.com/send/?phone=66967286999&amp;text=Hi%21%20I%27m%20reaching%20out%20via%20pattaya-gym.com" target="_blank" rel="noopener">WhatsApp +66</a></li>
          <li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener">LINE @timpaemi</a></li>
          <li><a href="/press/">Press</a></li>
        </ul>
      </div>
    </div>
    ${newsletterFooterHtml()}
    <div class="site-footer-base">
      <p>© ${new Date().getFullYear()} pattaya-gym.com — Every gym &amp; sport in Pattaya, Thailand.</p>
      <p class="sf-disclaimer">Last updated: ${LAST_BUILD_DATE}. Independent directory. No paid placements. Listings researched and source-cited from public information.</p>
          <p class="sf-builtby"><span class="sf-builtby-rule"></span><span class="sf-builtby-text">// Site built &amp; managed by <a href="https://pattaya-authority.com/" target="_blank" rel="noopener author" class="sf-builtby-link">PATTAYA AUTHORITY</a> · <a href="https://timpaemi.com/" target="_blank" rel="noopener author" class="sf-builtby-link">TIM PAEMI</a> <span class="sf-builtby-star">★</span></span><span class="sf-builtby-rule"></span></p>
          
    </div>
  </footer>

  <!-- Sticky bottom action bar (mobile thumb-reach) -->
  <nav class="sticky-actions" aria-label="Quick actions">
    ${fm.mapsUrl ? `<a class="sa-btn sa-primary" href="${escHtml(fm.mapsUrl)}" target="_blank" rel="noopener" aria-label="Open in Google Maps">
      <span class="sa-ico">📍</span><span class="sa-lbl">Map</span>
    </a>` : ''}
    ${phoneHref ? `<a class="sa-btn" href="tel:${escHtml(phoneHref)}" aria-label="Call ${escHtml(fm.name)}">
      <span class="sa-ico">📞</span><span class="sa-lbl">Call</span>
    </a>` : ''}
    ${fm.website ? `<a class="sa-btn" href="${escHtml(fm.website)}" target="_blank" rel="noopener" aria-label="Visit website">
      <span class="sa-ico">🔗</span><span class="sa-lbl">Site</span>
    </a>` : ''}
    <button type="button" class="sa-btn sa-compare" data-pg-compare-id="${escHtml(slug)}" data-pg-compare-name="${escHtml(fm.name)}" aria-label="Add to compare">
      <span class="sa-ico">⊕</span><span class="sa-lbl cmp-btn-label">Compare</span>
    </button>
    <button type="button" class="sa-btn" data-share-target="native" aria-label="Share this page">
      <span class="sa-ico">↗</span><span class="sa-lbl">Share</span>
    </button>
  </nav>

  <div class="scroll-progress" id="pg-scroll-progress"></div>
  <button type="button" class="back-to-top" id="pg-back-to-top" aria-label="Back to top">↑</button>

  <script type="application/json" id="pg-current-venue">${JSON.stringify({
    id: slug,
    name: fm.name || slug,
    category: fm.category || '',
    area: fm.area || '',
    priceRange: fm.priceRange || '',
    href: `/gyms/${slug}/`
  }).replace(/</g, '\\u003c')}</script>
  <script src="${assetHref('/share.js')}" defer></script>
  <script src="${assetHref('/favorites.js')}" defer></script>
  <script src="${assetHref('/compare.js')}" defer></script>
  <script src="${assetHref('/recent.js')}" defer></script>
</body>
</html>
`;
}

// ---------- Sitemap ----------
// Priority + changefreq tuned for Google ranking signals:
//   1.0 = homepage (max signal)
//   0.8 = venue pages (the directory's primary value)
//   homepage changefreq=daily, venues changefreq=weekly (verified date may bump)
function buildSitemap(venues) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    `<url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...venues.map(v => `<url><loc>${SITE}/gyms/${v.slug}/</loc><lastmod>${v.fm.verified || today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join('\n  ')}\n</urlset>\n`;
}

// ---------- Main ----------
function loadGymsFromDataJs() {
  const code = fs.readFileSync(DATA_FILE, 'utf8');
  const win = {};
  new Function('window', code)(win);
  return { GYMS: win.GYMS || [], CATEGORIES: win.CATEGORIES || [] };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function resolveDirectChild(parent, childName) {
  const parentPath = path.resolve(parent);
  const target = path.resolve(parentPath, childName);
  if (path.dirname(target) !== parentPath) {
    throw new Error('Refusing to operate outside ' + parentPath + ': ' + childName);
  }
  return target;
}

function cleanupChildDirs(parent, expectedNames, label) {
  ensureDir(parent);
  const expected = new Set(Array.from(expectedNames).map(String));
  fs.readdirSync(parent, { withFileTypes: true }).forEach(entry => {
    if (!entry.isDirectory() || expected.has(entry.name)) return;
    const target = resolveDirectChild(parent, entry.name);
    fs.rmSync(target, { recursive: true, force: true });
    console.log('  [CLEAN] removed stale ' + label + ': ' + entry.name);
  });
}

function runValidation() {
  if (process.argv.includes('--skip-validate')) {
    console.log('Validation skipped by --skip-validate.');
    return;
  }
  const { validate } = require('./validate.js');
  const result = validate({ root: ROOT, silent: true });
  if (!result.ok) {
    result.errors.forEach(e => console.error('[VALIDATION] ' + e));
    throw new Error('Validation failed with ' + result.errors.length + ' error(s). Run node validate.js for details.');
  }
  console.log('Validation: 0 error(s), ' + result.warnings.length + ' warning(s).');
}

function clearBuildModuleCache() {
  ['./build-extras.js', './build-discovery.js'].forEach(mod => {
    const id = require.resolve(mod);
    delete require.cache[id];
  });
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
  lines.push('Email **info@pattaya-gym.com** with corrections, photos, or details.');
  return lines.join('\n');
}

function runBuild() {
  runValidation();
  clearBuildModuleCache();
  ensureDir(VENUES_DIR);
  ensureDir(OUT_DIR);

  const loaded = loadGymsFromDataJs();
  const GYMS = loaded.GYMS;
  const CATEGORIES = loaded.CATEGORIES;
  const venues = [];

  const mdFiles = new Set(
    fs.readdirSync(VENUES_DIR).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''))
  );

  let deepCount = 0, stubCount = 0;

  cleanupChildDirs(OUT_DIR, GYMS.map(g => g.id), 'venue output directory');

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

    const html = buildVenuePage(slug, fm, bodyHtml, body, GYMS, CATEGORIES);
    const venueDir = path.join(OUT_DIR, slug);
    ensureDir(venueDir);
    fs.writeFileSync(path.join(venueDir, 'index.html'), finalizeHtml(html));

    venues.push({ slug, fm });
    const tag = mdFiles.has(slug) ? 'DEEP' : 'stub';
    console.log('  [' + tag + '] /gyms/' + slug + '/  (' + (fm.name || slug) + ')');
  });

  fs.writeFileSync(SITEMAP, buildSitemap(venues));
  console.log('\nGenerated ' + venues.length + ' venue pages (' + deepCount + ' deep + ' + stubCount + ' stubs)');
  console.log('sitemap.xml updated.');

  // Chain extras
  console.log('\n--- Building extras ---');
  require('./build-extras.js');
  console.log('\n--- Building discovery (areas, guides, search, add form) ---');
  require('./build-discovery.js');
}

function watch() {
  let timer = null;
  let building = false;
  let pending = false;

  function buildOnce() {
    if (building) {
      pending = true;
      return;
    }
    building = true;
    try {
      runBuild();
      console.log('\nWatch build complete at ' + new Date().toLocaleTimeString() + '.');
    } catch (e) {
      console.error(e.stack || e.message);
    } finally {
      building = false;
      if (pending) {
        pending = false;
        schedule('queued change');
      }
    }
  }

  function schedule(reason) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log('\n[watch] Change detected' + (reason ? ': ' + reason : '') + '. Rebuilding...');
      buildOnce();
    }, 250);
  }

  buildOnce();
  [
    DATA_FILE,
    path.join(ROOT, 'build.js'),
    path.join(ROOT, 'build-extras.js'),
    path.join(ROOT, 'build-discovery.js'),
    path.join(ROOT, 'validate.js')
  ].forEach(file => {
    if (!fs.existsSync(file)) return;
    fs.watch(file, { persistent: true }, () => schedule(path.basename(file)));
  });
  fs.watch(VENUES_DIR, { persistent: true }, (eventType, filename) => {
    if (!filename || String(filename).endsWith('.md')) schedule(path.join('venues', String(filename || '')));
  });
  console.log('\nWatching data.js, venues/, and build scripts. Press Ctrl+C to stop.');
}

function main() {
  if (process.argv.includes('--watch')) {
    watch();
    return;
  }
  try {
    runBuild();
  } catch (e) {
    console.error(e.stack || e.message);
    process.exitCode = 1;
  }
}

main();
