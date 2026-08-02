#!/usr/bin/env node
'use strict';
/**
 * Server-render the first search result page. This is both the no-JS fallback
 * and the layout-stability reservation: search-page.js progressively replaces
 * the same 24-card shape instead of inserting a full viewport after load.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'search', 'index.html');
const { GYMS, CATEGORIES } = require(path.join(ROOT, 'data.js'));
const PAGE_SIZE = 24;

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function catLabel(key) {
  const found = CATEGORIES.find(c => c.key === key);
  return found ? found.label : key;
}
function favorite(g) {
  return `<button type="button" class="favorite-btn" data-pg-favorite-id="${esc(g.id)}" data-pg-favorite-name="${esc(g.name)}" data-pg-favorite-category="${esc(g.category)}" data-pg-favorite-area="${esc(g.area)}" data-pg-favorite-price="${esc(g.priceRange)}" aria-pressed="false" aria-label="Save to favorites"><span class="fav-heart" aria-hidden="true">♡</span><span class="fav-btn-label">Save</span></button>`;
}
function card(g) {
  let desc = g.description || '';
  if (desc.length > 130) desc = `${desc.slice(0, 130).trim()}…`;
  return `<article class="result-card"><div class="result-card-head"><a class="result-card-main" href="/gyms/${esc(g.id)}/"><div class="result-card-tag">// ${esc(catLabel(g.category))}</div><h3 class="result-card-name">${esc(g.name)}</h3><div class="result-card-meta">${esc(g.area || '')}</div><p class="result-card-desc">${esc(desc)}</p><div class="result-card-foot"><span class="result-card-price">${esc(g.priceRange || '—')}</span><span class="result-card-arrow">View →</span></div></a>${favorite(g)}</div></article>`;
}

const ordered = [...GYMS].sort((a, b) => {
  if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
  return (a.name || '').localeCompare(b.name || '');
});
const first = ordered.slice(0, PAGE_SIZE);
let html = fs.readFileSync(FILE, 'utf8');
html = html.replace(/\sautofocus(?=\s*\/?>)/g, '');
html = html.replace(/Search \d+ venues/g, `Search ${GYMS.length} venues`);
html = html.replace(/Filter \d+ (?:verified |source-checked )?Pattaya gyms/, `Filter ${GYMS.length} source-checked Pattaya gyms`);
html = html.replace(/<p class="search-stats" id="stats"[\s\S]*?<\/p>/, `<p class="search-stats" id="stats" role="status" aria-live="polite" aria-atomic="true">Showing <strong>${first.length}</strong> of <strong>${GYMS.length}</strong> venues</p>`);
html = html.replace(/<div class="search-results" id="search-results"[\s\S]*?<\/div>\s*(?=<section class="section u-pt-0" id="popular-searches-seo">)/,
  `<div class="search-results" id="search-results" aria-busy="false" aria-labelledby="search-results-h">\n${first.map(card).join('\n')}\n</div>\n<div id="search-load-more" class="search-load-more-wrap"><button type="button" class="btn btn-secondary" disabled aria-describedby="search-js-note">Enable JavaScript to load ${GYMS.length - first.length} more</button><span id="search-js-note" class="sr-only">The first ${first.length} results are available without JavaScript.</span></div>\n`);
html = html.replace(/<button type="button" class="sf-pill( active)?" data-cat="([^"]+)">/g, (all, active, cat) => `<button type="button" class="sf-pill${active || ''}" data-cat="${cat}" aria-pressed="${active ? 'true' : 'false'}">`);
fs.writeFileSync(FILE, html, 'utf8');
console.log(`Search fallback: ${first.length}/${GYMS.length} server-rendered cards; autofocus removed.`);
