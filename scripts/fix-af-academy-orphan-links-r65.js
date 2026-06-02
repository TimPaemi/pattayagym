#!/usr/bin/env node
/**
 * fix-af-academy-orphan-links-r65.js — Point remaining internal links at af-academy-pattaya.
 * Run after removing af-academy-football from data.js.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { GYMS, CATEGORIES } = require(path.join(ROOT, 'data.js'));

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const canon = GYMS.find(g => g.id === 'af-academy-pattaya');
if (!canon) {
  console.error('fix-af-academy-orphan-links-r65: af-academy-pattaya missing from data.js');
  process.exit(1);
}

function venueCardArticle(g) {
  const tags = (g.tags || []).slice(0, 3).map(t => `<span class="cv-pill cv-pill-tag">${esc(t)}</span>`).join('');
  return `<article class="cat-venue-card">
      <div class="cv-head">
      <h3><a href="/gyms/${g.id}/">${esc(g.name)}</a></h3>
      <button type="button" class="favorite-btn" data-pg-favorite-id="${esc(g.id)}" data-pg-favorite-name="${esc(g.name)}" data-pg-favorite-category="${esc(g.category)}" data-pg-favorite-area="${esc(g.area)}" data-pg-favorite-price="${esc(g.priceRange)}" aria-pressed="false" aria-label="Save to favorites"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button>
    </div>
    <div class="cv-meta">📍 ${esc(g.area)}</div>
    <div class="cv-meta">🕐 ${esc(g.hours || 'Verify')}</div>
    <p>${esc(g.description)}</p>
    <div class="cv-tags">
      <span class="cv-pill">💰 ${esc(g.priceRange || '—')}</span>
      ${tags}
    </div>
    <a class="cv-cta" href="/gyms/${g.id}/">View full page -></a>
  </article>`;
}

const CARD_RE = /<article class="cat-venue-card">[\s\S]*?af-academy-football[\s\S]*?<\/article>/g;
const SCAN_DIRS = ['guides', 'gyms', 'area', 'category', 'feed', 'scripts/guide-bodies'];

function patchHtml(html) {
  const orig = html;
  if (html.includes('af-academy-football')) {
    html = html.replace(CARD_RE, venueCardArticle(canon));
    html = html.replace(/\/gyms\/af-academy-football\//g, '/gyms/af-academy-pattaya/');
    html = html.replace(/data-pg-favorite-id="af-academy-football"/g, 'data-pg-favorite-id="af-academy-pattaya"');
    html = html.replace(/data-pg-favorite-name="AF Academy Football School"/g, `data-pg-favorite-name="${esc(canon.name)}"`);
    html = html.replace(/AF Academy Football School<\/a>/g, `${esc(canon.name)}</a>`);
    html = html.replace(/af-academy-football/g, 'af-academy-pattaya');
  }
  return html === orig ? null : html;
}

let n = 0;
for (const dir of SCAN_DIRS) {
  const base = path.join(ROOT, dir);
  if (!fs.existsSync(base)) continue;
  const stack = [base];
  while (stack.length) {
    const d = stack.pop();
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const fp = path.join(d, ent.name);
      if (ent.isDirectory()) stack.push(fp);
      else if (/\.(html|js|xml|csv)$/.test(ent.name)) {
        const html = fs.readFileSync(fp, 'utf8');
        const next = patchHtml(html);
        if (next) {
          fs.writeFileSync(fp, next, 'utf8');
          n++;
          console.log('patched', path.relative(ROOT, fp));
        }
      }
    }
  }
}

// venue-outreach-list.csv (legacy flat file)
const csvPath = path.join(ROOT, 'venue-outreach-list.csv');
if (fs.existsSync(csvPath)) {
  let csv = fs.readFileSync(csvPath, 'utf8');
  if (csv.includes('af-academy-football')) {
    csv = csv.replace(/af-academy-football/g, 'af-academy-pattaya');
    csv = csv.replace(/AF Academy Football School/g, canon.name);
    fs.writeFileSync(csvPath, csv, 'utf8');
    n++;
    console.log('patched venue-outreach-list.csv');
  }
}

console.log(`fix-af-academy-orphan-links-r65: ${n} file(s) updated.`);
