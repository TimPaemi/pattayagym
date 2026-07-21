#!/usr/bin/env node
/**
 * inject-cheapest-price-table.js
 * Inserts sortable-style fitness price comparison table into cheapest-gyms guide.
 */

const fs = require('fs');
const path = require('path');
const { loadGyms } = require('./lib/load-gyms');

const ROOT = path.resolve(__dirname, '..');
const GUIDE = path.join(ROOT, 'guides', 'cheapest-gyms-pattaya', 'index.html');
const MARKER = 'data-price-table-v1';

const FITNESS_CATS = new Set(['fitness', 'crossfit']);

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parsePricesFromMd(md) {
  const day = md.match(/day\s*pass[:\s]*\*?\*?~?฿?([\d,]+)/i) || md.match(/tourist\s+day[:\s]*\*?\*?~?฿?([\d,]+)/i);
  const month = md.match(/monthly[:\s]*\*?\*?~?฿?([\d,]+)/i) || md.match(/month[:\s]*\*?\*?~?฿?([\d,]+)/i);
  const drop = md.match(/drop[- ]?in[:\s]*\*?\*?~?฿?([\d,]+)/i);
  return {
    day: day ? `฿${day[1]}` : '',
    month: month ? `฿${month[1]}` : '',
    drop: drop ? `฿${drop[1]}` : '',
  };
}

function parsePricesFromDesc(desc) {
  const m = desc.match(/~?฿([\d,]+)\/month/i);
  const d = desc.match(/~?฿([\d,]+)/);
  return {
    day: '',
    month: m ? `฿${m[1]}` : '',
    drop: d && !m ? `฿${d[1]}` : '',
  };
}

function tierNum(priceRange) {
  return (priceRange || '').length || 9;
}

function buildRows(gyms) {
  const rows = [];
  for (const g of gyms) {
    if (!FITNESS_CATS.has(g.category)) continue;
    let prices = parsePricesFromDesc(g.description || '');
    const mdPath = path.join(ROOT, 'venues', `${g.id}.md`);
    if (fs.existsSync(mdPath)) {
      const fromMd = parsePricesFromMd(fs.readFileSync(mdPath, 'utf8'));
      prices = { ...prices, ...Object.fromEntries(Object.entries(fromMd).filter(([, v]) => v)) };
    }
    if (!prices.day && !prices.month && !prices.drop) {
      prices.drop = g.priceRange || '—';
    }
    rows.push({
      id: g.id,
      name: g.name,
      area: g.area,
      tier: g.priceRange || '—',
      ...prices,
      sort: tierNum(g.priceRange),
    });
  }
  rows.sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
  return rows;
}

function tableHtml(rows) {
  const trs = rows.map(r => `<tr>
  <td><a href="/gyms/${esc(r.id)}/">${esc(r.name)}</a></td>
  <td>${esc(r.area.split('/')[0].trim())}</td>
  <td>${esc(r.tier)}</td>
  <td>${esc(r.drop || r.day || '—')}</td>
  <td>${esc(r.day || '—')}</td>
  <td>${esc(r.month || '—')}</td>
</tr>`).join('\n');

  return `<section class="guide-price-compare" ${MARKER}="1" aria-labelledby="price-table-h">
  <h2 id="price-table-h" class="guide-rank-section">Fitness gym price comparison</h2>
  <p class="guide-price-note">Drop-in, day-pass, and monthly figures parsed from verified venue pages where published. Confirm at the gym — prices change. <a href="/compare/">Compare side-by-side →</a></p>
  <div class="guide-price-table-wrap">
  <table class="guide-price-table">
    <caption>Pattaya fitness &amp; CrossFit venues — price snapshot (${rows.length} gyms)</caption>
    <thead>
      <tr>
        <th scope="col">Venue</th>
        <th scope="col">Area</th>
        <th scope="col">Tier</th>
        <th scope="col">Drop-in</th>
        <th scope="col">Day pass</th>
        <th scope="col">Monthly</th>
      </tr>
    </thead>
    <tbody>
${trs}
    </tbody>
  </table>
  </div>
</section>
`;
}

let html = fs.readFileSync(GUIDE, 'utf8');
if (html.includes(MARKER)) {
  html = html.replace(/<section class="guide-price-compare"[\s\S]*?<\/section>\s*/i, '');
}

const rows = buildRows(loadGyms(ROOT));
const block = tableHtml(rows);
const anchor = '<div id="full-list"></div>';
if (!html.includes(anchor)) {
  console.error('Anchor not found in cheapest-gyms guide');
  process.exit(1);
}
html = html.replace(anchor, `${block}\n  ${anchor}`);
fs.writeFileSync(GUIDE, html, 'utf8');
console.log(`Price table injected (${rows.length} fitness rows).`);
