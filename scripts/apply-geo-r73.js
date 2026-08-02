#!/usr/bin/env node
/**
 * apply-geo-r73.js — Merge venue-specific manual coordinates and quarantine placeholders.
 * Area centroids are useful on area pages but must never become venue GeoCoordinates.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GEO_PATH = path.join(ROOT, 'data', 'venue-geo.json');
const MANUAL_PATH = path.join(ROOT, 'data', 'manual-geo-r73.json');
const { GYMS } = require(path.join(ROOT, 'data.js'));
const BBOX = { south: 12.55, north: 13.25, west: 100.70, east: 101.25 };
function inEditorialRegion(lat, lng) {
  return Number(lat) >= BBOX.south && Number(lat) <= BBOX.north && Number(lng) >= BBOX.west && Number(lng) <= BBOX.east;
}

const SKIP_FALLBACK = new Set([
  'lumpinee-boxing-stadium',
  'chatrium-golf-soi-dao',
]);

let cache = {};
if (fs.existsSync(GEO_PATH)) {
  try {
    cache = JSON.parse(fs.readFileSync(GEO_PATH, 'utf8'));
  } catch (e) {
    cache = {};
  }
}

const manual = JSON.parse(fs.readFileSync(MANUAL_PATH, 'utf8'));
const now = new Date().toISOString();
let manualN = 0;
let quarantinedN = 0;
let skipN = 0;

for (const [id, row] of Object.entries(manual)) {
  if (id.startsWith('_')) continue;
  if (!row.lat || !row.lng) continue;
  cache[id] = {
    lat: Number(row.lat),
    lng: Number(row.lng),
    source: 'manual-r73',
    note: row.note || 'Round 73 hand-plotted',
    set_at: now,
  };
  manualN++;
}

for (const g of GYMS) {
  const c = cache[g.id];
  const placeholder = c && (c._flag === 'area_fallback' || c._flag === 'area_centroid' || c.strategy === 'area_centroid');
  if (placeholder) {
    cache[g.id] = {
      failed: true,
      source: 'needs-venue-specific-geo',
      _flag: 'missing_exact_geo',
      note: 'Area centroid removed from venue data; add a venue-specific sourced coordinate before publishing geo.',
      attempted_at: now,
    };
    quarantinedN++;
    continue;
  }
  if (c && c.lat && c.lng && !inEditorialRegion(c.lat, c.lng)) {
    cache[g.id] = {
      failed: true,
      source: 'needs-venue-specific-geo',
      _flag: 'outside_pattaya_region',
      note: 'Stored coordinate was outside the published Pattaya/Eastern Seaboard map bounds.',
      attempted_at: now,
    };
    quarantinedN++;
    skipN++;
    continue;
  }
  const needs = !c || c.failed || !c.lat;
  if (!needs) continue;
  if (SKIP_FALLBACK.has(g.id)) skipN++;
  cache[g.id] = {
    failed: true,
    source: 'needs-venue-specific-geo',
    _flag: SKIP_FALLBACK.has(g.id) ? 'outside_pattaya_region' : 'missing_exact_geo',
    note: SKIP_FALLBACK.has(g.id)
      ? 'Outside Pattaya editorial region or no safe venue coordinate.'
      : 'No venue-specific sourced coordinate is available.',
    attempted_at: now,
  };
  quarantinedN++;
}

fs.writeFileSync(GEO_PATH + '.tmp', JSON.stringify(cache, null, 2));
fs.renameSync(GEO_PATH + '.tmp', GEO_PATH);

const withLat = GYMS.filter(g => {
  const c = cache[g.id];
  return c && c.lat && c.lng && inEditorialRegion(c.lat, c.lng) && !c.failed && c._flag !== 'area_fallback' && c._flag !== 'area_centroid' && c.strategy !== 'area_centroid';
}).length;
console.log(`apply-geo-r73: manual=${manualN}, placeholders_quarantined=${quarantinedN}, outside_region=${skipN}`);
console.log(`apply-geo-r73: ${withLat}/${GYMS.length} venues with venue-specific GeoCoordinates-ready cache.`);
