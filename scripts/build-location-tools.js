#!/usr/bin/env node
'use strict';
/**
 * Build the two location-sensitive planning tools from source-checked records.
 *
 * /map/ intentionally renders a first-party coordinate explorer rather than
 * loading a third-party map SDK before consent. Only venue-specific points are
 * admitted; area centroids, fallbacks and out-of-region matches are excluded.
 *
 * /find-my-coach/ matches training needs to venue records. It never invents
 * individual coach profiles: the output is explicitly a venue shortlist based
 * on published tags and the linked, dated record.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const { GYMS, CATEGORIES } = require(path.join(ROOT, 'data.js'));
const GEO = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'venue-geo.json'), 'utf8'));
const build = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const version = (build.match(/const ASSET_VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1] || '472';

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function json(value) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
function categoryLabel(key) {
  const found = CATEGORIES.find(c => c.key === key);
  return found ? found.label : key;
}
function safeGeo(entry) {
  if (!entry || !Number.isFinite(Number(entry.lat)) || !Number.isFinite(Number(entry.lng))) return false;
  if (['outside_pattaya_region', 'area_fallback', 'area_centroid', 'missing_exact_geo'].includes(entry._flag)) return false;
  if (entry.strategy === 'area_centroid') return false;
  const lat = Number(entry.lat), lng = Number(entry.lng);
  return lat >= 12.55 && lat <= 13.25 && lng >= 100.70 && lng <= 101.25;
}
function areaLabel(value) {
  return String(value || 'Area not stated').replace(/\s*\/\s*/g, ' / ');
}
function updateHead(html, title, desc, url) {
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  html = html.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">');
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(desc)}">`);
  html = html.replace(/<link rel="dns-prefetch" href="\/\/www\.googletagmanager\.com">\s*/g, '');
  html = html.replace(/<script defer src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]+"><\/script>\s*/g, '');
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (all, raw) => {
    try {
      const data = JSON.parse(raw);
      if (data['@type'] === 'WebPage') {
        data.name = title;
        data.description = desc;
        data.url = url;
      }
      return `<script type="application/ld+json">${json(data)}</script>`;
    } catch (_) { return all; }
  });
  return html;
}
function writeTool(slug, title, desc, main, data) {
  const file = path.join(ROOT, slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const url = `${SITE}/${slug}/`;
  html = updateHead(html, title, desc, url);
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, main);
  html = html.replace(/\s*<script defer src="\/location-tools\.js\?v=[^"]+"><\/script>/g, '');
  html = html.replace('</body>', `<script type="application/json" id="location-tool-data">${json(data)}</script>\n<script defer src="/location-tools.js?v=${version}"></script>\n</body>`);
  fs.writeFileSync(file, html, 'utf8');
}

const mapRecords = GYMS
  .filter(g => safeGeo(GEO[g.id]))
  .map(g => ({
    id: g.id, name: g.name, category: g.category, categoryLabel: categoryLabel(g.category),
    area: areaLabel(g.area), lat: Number(GEO[g.id].lat), lng: Number(GEO[g.id].lng),
    mapsUrl: g.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${g.name} Pattaya`)}`,
    precision: GEO[g.id].source === 'manual' ? 'Approximate property point' : 'Venue-specific stored point'
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
const latMin = Math.min(...mapRecords.map(x => x.lat));
const latMax = Math.max(...mapRecords.map(x => x.lat));
const lngMin = Math.min(...mapRecords.map(x => x.lng));
const lngMax = Math.max(...mapRecords.map(x => x.lng));
const mapPins = mapRecords.map((g, i) => {
  const x = ((g.lng - lngMin) / Math.max(0.0001, lngMax - lngMin) * 94 + 3).toFixed(2);
  const y = (97 - (g.lat - latMin) / Math.max(0.0001, latMax - latMin) * 94).toFixed(2);
  return `<a class="location-pin" href="/gyms/${esc(g.id)}/" data-tool-record data-name="${esc(g.name.toLowerCase())}" data-category="${esc(g.category)}" data-area="${esc(g.area.toLowerCase())}" style="--pin-x:${x}%;--pin-y:${y}%;--pin-i:${i % 8}" aria-label="${esc(g.name)}, ${esc(g.area)}"><span aria-hidden="true"></span><span class="location-pin-label">${esc(g.name)}</span></a>`;
}).join('\n');
const mapCards = mapRecords.slice(0, 24).map(g => `<article class="location-result-card" data-tool-record data-name="${esc(g.name.toLowerCase())}" data-category="${esc(g.category)}" data-area="${esc(g.area.toLowerCase())}">
  <div><span class="result-card-tag">// ${esc(g.categoryLabel)}</span><h3><a href="/gyms/${esc(g.id)}/">${esc(g.name)}</a></h3><p>${esc(g.area)} · ${esc(g.precision)}</p></div>
  <div class="location-card-actions"><a href="/gyms/${esc(g.id)}/">Evidence record</a><a href="${esc(g.mapsUrl)}" target="_blank" rel="noopener noreferrer">Open map listing ↗</a></div>
</article>`).join('\n');
const mapCats = CATEGORIES.filter(c => mapRecords.some(g => g.category === c.key));
const mapAreas = [...new Set(mapRecords.map(g => g.area))].sort();
const excludedGeo = GYMS.length - mapRecords.length;
const mapMain = `<main id="main" data-location-tool="map">
<section class="hero hub-hero location-tool-hero"><div class="hero-inner u-wrap-max">
  <div class="hero-kicker">// Location explorer · ${mapRecords.length} venue-specific points</div>
  <h1 class="hero-h1">Pattaya gym <span class="accent-cyan">map.</span></h1>
  <p class="hero-lede u-text-left-ml0">Explore ${mapRecords.length} gyms, camps, courts and sport venues with venue-specific stored coordinates. ${excludedGeo} directory records are deliberately excluded until their location is precise enough to publish.</p>
  <p class="location-trust-note"><strong>Precision rule:</strong> no neighborhood centroid and no guessed fallback is shown. Open any evidence record to see its dated sources, or use the venue's map listing for navigation.</p>
</div></section>
<section class="section u-pt-0"><div class="wrap">
  <form class="location-filters" id="location-tool-filters" role="search"><label>Venue name<input type="search" id="tool-query" autocomplete="off" placeholder="Search ${mapRecords.length} mapped venues"></label><label>Sport<select id="tool-category"><option value="all">All sports</option>${mapCats.map(c => `<option value="${esc(c.key)}">${esc(c.label)}</option>`).join('')}</select></label><label>Area<select id="tool-area"><option value="all">All areas</option>${mapAreas.map(a => `<option value="${esc(a.toLowerCase())}">${esc(a)}</option>`).join('')}</select></label><button type="submit" class="btn btn-primary">Apply</button><button type="reset" class="btn btn-ghost">Reset</button></form>
  <p class="search-stats" id="location-tool-status" role="status" aria-live="polite">Showing 24 of ${mapRecords.length} mapped venues; refine the filters to narrow the list</p>
  <section class="coordinate-map" aria-label="Geographic plot of mapped Pattaya sport venues"><div class="coordinate-map-grid" aria-hidden="true"></div>${mapPins}<span class="map-compass" aria-hidden="true">N ↑</span></section>
</div></section>
<section class="section u-pt-0"><div class="wrap"><div class="eyebrow"><span class="num">01</span> Map results</div><h2 class="sr-only">Mapped venue records</h2><div class="location-result-list" id="location-result-list">${mapCards}</div></div></section>
</main>`;
writeTool('map', `Pattaya gym map — ${mapRecords.length} source-checked locations`, `Filter ${mapRecords.length} Pattaya gyms, Muay Thai camps and sport venues with venue-specific coordinates. Area fallbacks and guessed centroids are excluded.`, mapMain, { type: 'map', count: mapRecords.length, records: mapRecords });

const COACH_TAGS = new Set(['coaching', 'personal-training', 'private-training', 'trainer-led', 'instructor', 'golf-academy', 'swim-school', 'instructor-development', 'teacher-training', 'group-training', 'group-classes']);
const closedTags = new Set(['closed', 'likely-closed', 'do-not-book', 'excluded']);
const coachRecords = GYMS.filter(g => (g.tags || []).some(t => COACH_TAGS.has(t)) && !(g.tags || []).some(t => closedTags.has(t)))
  .map(g => ({
    id: g.id, name: g.name, category: g.category, categoryLabel: categoryLabel(g.category), area: areaLabel(g.area),
    tags: g.tags || [], description: g.description || '', verified: g.verified || 'date not recorded'
  })).sort((a, b) => a.name.localeCompare(b.name));
function programFacets(tags) {
  const values = [];
  if (tags.some(t => ['private-training', 'personal-training'].includes(t))) values.push('private');
  if (tags.some(t => ['beginner-friendly', 'beginners', 'beginner-sessions', 'beginner-track'].includes(t))) values.push('beginner');
  if (tags.some(t => ['kids', 'youth', 'kids-youth', 'swim-school'].includes(t))) values.push('kids');
  if (tags.some(t => ['group-training', 'group-classes', 'beginner-sessions'].includes(t))) values.push('group');
  return values;
}
const coachCats = CATEGORIES.filter(c => coachRecords.some(g => g.category === c.key));
const coachAreas = [...new Set(coachRecords.map(g => g.area))].sort();
const coachCards = coachRecords.map(g => {
  const facets = programFacets(g.tags);
  const signals = g.tags.filter(t => COACH_TAGS.has(t) || ['beginner-friendly', 'beginners', 'kids', 'youth'].includes(t)).slice(0, 4);
  return `<article class="location-result-card coach-match-card" data-tool-record data-name="${esc(`${g.name} ${g.description}`.toLowerCase())}" data-category="${esc(g.category)}" data-area="${esc(g.area.toLowerCase())}" data-program="${esc(facets.join(' '))}">
  <div><span class="result-card-tag">// ${esc(g.categoryLabel)}</span><h3><a href="/gyms/${esc(g.id)}/">${esc(g.name)}</a></h3><p>${esc(g.area)}</p><p>${esc(g.description)}</p><ul class="match-signals" aria-label="Matching record signals">${signals.map(t => `<li>${esc(t.replace(/-/g, ' '))}</li>`).join('')}</ul></div>
  <div class="location-card-actions"><span>Record checked ${esc(g.verified)}</span><a href="/gyms/${esc(g.id)}/">Check coaching evidence →</a></div>
</article>`;
}).join('\n');
const coachMain = `<main id="main" data-location-tool="coach">
<section class="hero hub-hero location-tool-hero"><div class="hero-inner u-wrap-max">
  <div class="hero-kicker">// Coaching matcher · ${coachRecords.length} source-checked venue records</div><h1 class="hero-h1">Find training that <span class="accent-mint">fits.</span></h1>
  <p class="hero-lede u-text-left-ml0">Match your sport, area and training format to venues whose records mention coaching, instructors or trainer-led programs. This is a venue matcher—not an invented directory of individual coaches.</p>
  <p class="location-trust-note"><strong>Before booking:</strong> open the evidence record, check its review date and follow the operator source. Coach rosters and availability change faster than facilities.</p>
</div></section>
<section class="section u-pt-0"><div class="wrap">
  <form class="location-filters" id="location-tool-filters" role="search"><label>Keyword<input type="search" id="tool-query" autocomplete="off" placeholder="Try private Muay Thai or kids swimming"></label><label>Sport<select id="tool-category"><option value="all">All sports</option>${coachCats.map(c => `<option value="${esc(c.key)}">${esc(c.label)}</option>`).join('')}</select></label><label>Area<select id="tool-area"><option value="all">All areas</option>${coachAreas.map(a => `<option value="${esc(a.toLowerCase())}">${esc(a)}</option>`).join('')}</select></label><label>Format<select id="tool-program"><option value="all">Any format</option><option value="private">Private / personal</option><option value="beginner">Beginner signals</option><option value="kids">Kids / youth</option><option value="group">Group training</option></select></label><button type="submit" class="btn btn-primary">Apply</button><button type="reset" class="btn btn-ghost">Reset</button></form>
  <p class="search-stats" id="location-tool-status" role="status" aria-live="polite">Showing all ${coachRecords.length} matching venues</p><div class="location-result-list" id="location-result-list">${coachCards}</div>
</div></section></main>`;
writeTool('find-my-coach', 'Find coaching in Pattaya — source-checked venue matcher', `Filter ${coachRecords.length} Pattaya sport venues whose dated records mention coaching, instructors or trainer-led programs. No invented individual coach profiles.`, coachMain, { type: 'coach', count: coachRecords.length });

console.log(`Built /map/ with ${mapRecords.length} safe points (${excludedGeo} excluded) and /find-my-coach/ with ${coachRecords.length} source-checked venue matches.`);
