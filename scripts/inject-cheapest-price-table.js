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

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Curated only from exact priceSourceUrl pages in the corresponding venue
// records. Do not return to prose regex parsing: it previously emitted malformed
// amounts and ranked unpriced venues from their broad baht-tier symbol.
const CURATED = [
  { id: 'battle-conquer-gym', product: 'Gym-only access', day: '฿200', week: '฿600', month: '฿1,300', checked: '2026-07-25' },
  { id: 'better-bodies-gym-na-jomtien', product: 'General gym access', day: '฿250', week: '฿400', month: '฿1,000', checked: '2026-07-26' },
  { id: 'wko-muay-thai', product: 'Gym and facilities', day: '฿300', week: '฿800', month: '฿1,500', checked: '2026-07-25' },
  { id: 'elite-gym-fitness', product: 'General gym access', day: '฿400', week: '—', month: '฿3,000', checked: '2026-07-25' },
  { id: 'fitz-club', product: 'Gym, pool, sauna and steam', day: '฿800', week: '—', month: '—', checked: '2026-07-25' },
];

function buildRows(gyms) {
  const byId = new Map(gyms.map(g => [g.id, g]));
  return CURATED.map(row => {
    const venue = byId.get(row.id);
    if (!venue) throw new Error(`Missing curated cheapest-guide venue: ${row.id}`);
    return {
      ...row,
      name: venue.name,
      area: String(venue.area || '').split('/')[0].trim(),
    };
  });
}

function tableHtml(rows) {
  const trs = rows.map(r => `<tr>
  <td><a href="/gyms/${esc(r.id)}/">${esc(r.name)}</a></td>
  <td>${esc(r.area)}</td>
  <td>${esc(r.product)}</td>
  <td>${esc(r.day)}</td>
  <td>${esc(r.week)}</td>
  <td>${esc(r.month)}</td>
  <td>${esc(r.checked)}</td>
</tr>`).join('\n');

  return `<section class="guide-price-compare" ${MARKER}="1" aria-labelledby="price-table-h">
  <h2 id="price-table-h" class="guide-rank-section">Current gym-access price comparison</h2>
  <p class="guide-price-note">Only exact operator tariffs are included. Products and facilities differ; the checked date links back to each venue record's price source. <a href="/compare/">Compare area and category →</a></p>
  <div class="guide-price-table-wrap">
  <table class="guide-price-table">
    <caption>Pattaya gym-access prices checked 25-26 July 2026</caption>
    <thead>
      <tr>
        <th scope="col">Venue</th>
        <th scope="col">Area</th>
        <th scope="col">Product</th>
        <th scope="col">Day</th>
        <th scope="col">Week</th>
        <th scope="col">Monthly</th>
        <th scope="col">Checked</th>
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
