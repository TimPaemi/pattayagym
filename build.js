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
  const now = new Date(Date.now() + 7 * 3600 * 1000);
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const open = ranges.some(r => {
    if (r.to <= r.from) return minutes >= r.from || minutes <= r.to; // crossing midnight
    return minutes >= r.from && minutes <= r.to;
  });
  return open ? 'open' : 'closed';
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
  const wrap = (inner) =>
    `<svg class="cat-art" viewBox="0 0 120 120" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

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

  // Q3 — pricing (if price tier present)
  if (price) {
    const priceMap = {
      '฿': 'budget tier (typically under ฿2,000/month or low drop-in rates)',
      '฿฿': 'mid-tier pricing (typically ฿2,000–฿5,000/month or moderate drop-in)',
      '฿฿฿': 'premium tier (typically ฿5,000–฿15,000/month or higher drop-in)',
      '฿฿฿฿': 'luxury tier (typically ฿15,000+/month or 5-star resort pricing)'
    };
    const explained = priceMap[price] || 'see venue page for current rates';
    faqs.push({
      q: `How much does ${name} cost?`,
      a: `${name} is in the ${price} tier — ${explained}. For exact current rates, contact the venue directly.`
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

  return faqs.slice(0, 5);
}

function buildVenuePage(slug, fm, bodyHtml, body, allGyms, allCats) {
  const url = `${SITE}/gyms/${slug}/`;
  const title = `${fm.name} | Pattaya Gym Directory`;
  const firstPara = extractFirstParagraph(body || '');
  const desc = (fm.description || firstPara || `Train at ${fm.name} in Pattaya, Thailand. Address, pricing, schedule, trainers, reviews and more.`).replace(/\s+/g, ' ').slice(0, 300);
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
      <div class="venue-hero-art" aria-hidden="true">${getCategoryArt(fm.category)}</div>
      <div class="venue-meta-line">
        <span class="venue-cat-pill">${escHtml(cat)}</span>
        ${openStatus === 'open' ? '<span class="open-badge open-now">● Open now</span>' : ''}
        ${openStatus === 'closed' ? '<span class="open-badge open-closed">● Closed now</span>' : ''}
        <span class="meta-dot">•</span>
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
        ${fm.phone ? `<a class="btn btn-secondary" href="tel:${escHtml(String(fm.phone).replace(/\s/g,''))}">📞 ${escHtml(fm.phone)}</a>` : ''}
        ${social.facebook ? `<a class="btn btn-ghost" href="https://facebook.com/${escHtml(social.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}
        ${social.instagram ? `<a class="btn btn-ghost" href="https://instagram.com/${escHtml(social.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}
        <button class="compare-btn" data-pg-compare-id="${escHtml(slug)}" data-pg-compare-name="${escHtml(fm.name)}"><span class="cmp-btn-label">+ Add to compare</span></button>
      </div>

      <div class="share-bar">
        <span class="share-label">Share</span>
        <button class="share-btn share-wa" onclick="PG.share('whatsapp')" aria-label="Share on WhatsApp"><span class="share-ico">💬</span> WhatsApp</button>
        <button class="share-btn share-fb" onclick="PG.share('facebook')" aria-label="Share on Facebook"><span class="share-ico">f</span> Facebook</button>
        <button class="share-btn share-tw" onclick="PG.share('twitter')" aria-label="Share on X"><span class="share-ico">𝕏</span> X</button>
        <button class="share-btn share-line" onclick="PG.share('line')" aria-label="Share on LINE"><span class="share-ico">L</span> LINE</button>
        <button class="share-btn share-tg" onclick="PG.share('telegram')" aria-label="Share on Telegram"><span class="share-ico">✈</span> Telegram</button>
        <button class="share-btn share-copy" onclick="PG.share('copy')" aria-label="Copy link"><span class="share-ico">🔗</span> Copy link</button>
      </div>
    </div>

    ${tldrHtml ? `<aside class="tldr-card" aria-label="At a glance summary">
      <div class="tldr-tag">⚡ The quick answer</div>
      <p>${tldrHtml}</p>
    </aside>` : ''}

    <article class="venue-body">
      ${bodyHtml}
    </article>

    <div class="venue-cta-foot">
      <h3>Visited or trained at ${escHtml(fm.name)}?</h3>
      <p>Help other Pattaya travellers find the right gym — share this page or tell us what we got wrong.</p>
      <div class="cta-row">
        <button class="btn btn-primary" onclick="PG.share('whatsapp')">💬 Share on WhatsApp</button>
        <a class="btn btn-secondary" href="mailto:hello@pattaya-gym.com?subject=${encodeURIComponent('Update for ' + fm.name)}">✏️ Suggest an edit</a>
        ${fm.mapsUrl ? `<a class="btn btn-secondary" href="${escHtml(fm.mapsUrl)}" target="_blank" rel="noopener">⭐ Leave a Google review</a>` : ''}
      </div>
    </div>

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

  <!-- Sticky bottom action bar (mobile thumb-reach) -->
  <nav class="sticky-actions" aria-label="Quick actions">
    ${fm.mapsUrl ? `<a class="sa-btn sa-primary" href="${escHtml(fm.mapsUrl)}" target="_blank" rel="noopener" aria-label="Open in Google Maps">
      <span class="sa-ico">📍</span><span class="sa-lbl">Map</span>
    </a>` : ''}
    ${fm.phone ? `<a class="sa-btn" href="tel:${escHtml(String(fm.phone).replace(/\s/g,''))}" aria-label="Call ${escHtml(fm.name)}">
      <span class="sa-ico">📞</span><span class="sa-lbl">Call</span>
    </a>` : ''}
    ${fm.website ? `<a class="sa-btn" href="${escHtml(fm.website)}" target="_blank" rel="noopener" aria-label="Visit website">
      <span class="sa-ico">🔗</span><span class="sa-lbl">Site</span>
    </a>` : ''}
    <button class="sa-btn sa-compare" data-pg-compare-id="${escHtml(slug)}" data-pg-compare-name="${escHtml(fm.name)}" aria-label="Add to compare">
      <span class="sa-ico">⊕</span><span class="sa-lbl cmp-btn-label">Compare</span>
    </button>
    <button class="sa-btn" onclick="PG.share('native')" aria-label="Share this page">
      <span class="sa-ico">↗</span><span class="sa-lbl">Share</span>
    </button>
  </nav>

  <div class="scroll-progress" id="pg-scroll-progress"></div>

  <script src="/share.js" defer></script>
  <script src="/compare.js" defer></script>
  <script>
  (function () {
    var bar = document.getElementById('pg-scroll-progress');
    if (!bar) return;
    function update() {
      var h = document.documentElement;
      var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.width = (Math.max(0, Math.min(1, scrolled)) * 100) + '%';
    }
    document.addEventListener('scroll', update, { passive: true });
    update();
  })();
  </script>
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

    const html = buildVenuePage(slug, fm, bodyHtml, body, GYMS, CATEGORIES);
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

  // Chain extras
  try {
    console.log('\n--- Building extras ---');
    require('./build-extras.js');
    console.log('\n--- Building discovery (areas, guides, search, add form) ---');
    require('./build-discovery.js');
  } catch (e) {
    console.error('Extras build failed:', e.message);
  }
}

main();
