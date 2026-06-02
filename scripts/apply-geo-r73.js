#!/usr/bin/env node
/**
 * apply-geo-r73.js — Merge manual-geo-r73.json, then area fallback for remaining failed venues.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GEO_PATH = path.join(ROOT, 'data', 'venue-geo.json');
const MANUAL_PATH = path.join(ROOT, 'data', 'manual-geo-r73.json');
const { GYMS } = require(path.join(ROOT, 'data.js'));

const BBOX = { south: 12.5, north: 13.3, west: 100.7, east: 101.2 };
function inPattaya(lat, lng) {
  return lat >= BBOX.south && lat <= BBOX.north && lng >= BBOX.west && lng <= BBOX.east;
}

const AREA_COORDS = {
  jomtien: { lat: 12.888, lng: 100.877 },
  najomtien: { lat: 12.856, lng: 100.905 },
  sattahip: { lat: 12.856, lng: 100.905 },
  naklua: { lat: 12.96, lng: 100.894 },
  pratamnak: { lat: 12.912, lng: 100.863 },
  pratumnak: { lat: 12.912, lng: 100.863 },
  east: { lat: 12.917, lng: 100.878 },
  darkside: { lat: 12.917, lng: 100.878 },
  huay: { lat: 12.95, lng: 100.915 },
  central: { lat: 12.934, lng: 100.884 },
  sukhumvit: { lat: 12.93, lng: 100.884 },
  buakhao: { lat: 12.901, lng: 100.898 },
  thepprasit: { lat: 12.905, lng: 100.875 },
  sriracha: { lat: 13.044, lng: 100.976 },
  chonburi: { lat: 13.044, lng: 100.976 },
  default: { lat: 12.928, lng: 100.884 },
};

const SKIP_FALLBACK = new Set([
  'lumpinee-boxing-stadium',
  'chatrium-golf-soi-dao',
]);

function areaKey(areaStr) {
  const a = String(areaStr || '').toLowerCase();
  if (a.includes('jomtien') || a.includes('dongtan')) return a.includes('na jomtien') || a.includes('sattahip') ? 'najomtien' : 'jomtien';
  if (a.includes('sattahip') || a.includes('sriracha') || a.includes('rayong') || a.includes('laem chabang')) return 'sriracha';
  if (a.includes('naklua') || a.includes('north pattaya')) return 'naklua';
  if (a.includes('pratamnak') || a.includes('pratumnak')) return 'pratamnak';
  if (a.includes('east pattaya') || a.includes('darkside') || a.includes('huay yai') || a.includes('mabprachan')) return 'east';
  if (a.includes('buakhao')) return 'buakhao';
  if (a.includes('thepprasit')) return 'thepprasit';
  if (a.includes('central') || a.includes('sukhumvit') || a.includes('walking street') || a.includes('pattaya klang')) return 'central';
  return 'default';
}

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
let fallbackN = 0;
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
  const needs = !c || c.failed || !c.lat;
  if (!needs) continue;
  if (SKIP_FALLBACK.has(g.id)) {
    cache[g.id] = {
      failed: true,
      source: 'manual-r73-skip',
      _flag: 'outside_pattaya_region',
      note: 'Outside Pattaya editorial region or no safe fallback',
      attempted_at: now,
    };
    skipN++;
    continue;
  }
  const key = areaKey(g.area);
  const pt = AREA_COORDS[key] || AREA_COORDS.default;
  if (!inPattaya(pt.lat, pt.lng)) continue;
  cache[g.id] = {
    lat: pt.lat,
    lng: pt.lng,
    source: 'area_fallback_r73',
    strategy: key,
    _flag: 'area_fallback',
    note: `Area centroid from "${g.area}" — confirm on maps before travel`,
    set_at: now,
  };
  fallbackN++;
}

fs.writeFileSync(GEO_PATH + '.tmp', JSON.stringify(cache, null, 2));
fs.renameSync(GEO_PATH + '.tmp', GEO_PATH);

const withLat = GYMS.filter(g => cache[g.id] && cache[g.id].lat && !cache[g.id].failed).length;
console.log(`apply-geo-r73: manual=${manualN}, area_fallback=${fallbackN}, skipped=${skipN}`);
console.log(`apply-geo-r73: ${withLat}/${GYMS.length} venues with GeoCoordinates-ready cache.`);
