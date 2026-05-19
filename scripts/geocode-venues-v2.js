#!/usr/bin/env node
/**
 * geocode-venues-v2.js — Round 20 smarter geocoder
 *
 * The Round 8 geocoder (scripts/geocode-venues.js) used the full address string
 * as the Nominatim query. 140 of 158 venues returned no match because Thai
 * postal addresses are messy and Nominatim's coverage of Pattaya soi-level
 * addresses is sparse.
 *
 * This v2 retries with three escalating strategies and keeps the first hit:
 *   1) "<name>, <area>, Pattaya, Thailand"   — best when venue is on OSM
 *   2) "<name> Pattaya"                       — works for famous landmarks
 *   3) "<area>, Pattaya, Thailand"            — area centroid as last resort,
 *      tagged _flag='area_centroid' so the build can decide to skip it
 *
 * Pattaya bounding box (Sattahip to Chonburi): 12.5-13.3 N, 100.7-101.2 E.
 * Any hit outside that box is rejected.
 *
 * Honors Nominatim's 1 req/sec rate limit. Skips venues already with usable
 * coords. Reads + writes data/venue-geo.json atomically.
 *
 * Run:  node scripts/geocode-venues-v2.js
 *       node scripts/geocode-venues-v2.js --force   (re-geocode even cached)
 *       node scripts/geocode-venues-v2.js --limit 30  (only first 30 to-do)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const GEO_PATH = path.join(ROOT, 'data', 'venue-geo.json');
const { GYMS } = require(path.join(ROOT, 'data.js'));

const FORCE = process.argv.includes('--force');
const LIMIT_IDX = process.argv.indexOf('--limit');
const LIMIT = LIMIT_IDX > 0 ? parseInt(process.argv[LIMIT_IDX + 1], 10) : 200;

// Pattaya region bounding box (Sattahip in the south, Bang Saen/Chonburi in the north)
const BBOX = { south: 12.5, north: 13.3, west: 100.7, east: 101.2 };
function inPattaya(lat, lng) {
  return lat >= BBOX.south && lat <= BBOX.north && lng >= BBOX.west && lng <= BBOX.east;
}

let cache = {};
if (fs.existsSync(GEO_PATH)) {
  try { cache = JSON.parse(fs.readFileSync(GEO_PATH, 'utf8')); } catch (e) { cache = {}; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'pattaya-gym-geocoder/2.0 (https://pattaya-gym.com)' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(new Error('timeout')); });
  });
}

async function geocodeOne(query) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=3&countrycodes=th&q=' +
              encodeURIComponent(query);
  try {
    const results = await fetchJson(url);
    if (!Array.isArray(results) || !results.length) return null;
    for (const r of results) {
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lon);
      if (!isNaN(lat) && !isNaN(lng) && inPattaya(lat, lng)) {
        return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), display_name: r.display_name, osm_type: r.osm_type, osm_id: r.osm_id };
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function tryGeocodeVenue(g) {
  const name = g.name || '';
  const area = (g.area || '').split('/')[0].trim();
  // Strategy 1: name + area + Pattaya
  if (area) {
    const r1 = await geocodeOne(`${name}, ${area}, Pattaya, Thailand`);
    if (r1) return { ...r1, _strategy: 'name+area' };
    await sleep(1100);
  }
  // Strategy 2: name + Pattaya
  const r2 = await geocodeOne(`${name} Pattaya`);
  if (r2) return { ...r2, _strategy: 'name+pattaya' };
  await sleep(1100);
  // Strategy 3: area centroid (last resort)
  if (area && area !== 'Pattaya') {
    const r3 = await geocodeOne(`${area}, Pattaya, Thailand`);
    if (r3) return { ...r3, _strategy: 'area_centroid', _flag: 'area_centroid' };
  }
  return null;
}

async function main() {
  // Skip venues already with usable coords (unless --force)
  const todo = GYMS.filter(g => {
    if (FORCE) return true;
    const c = cache[g.id];
    if (!c) return true;
    if (c.failed) return true;
    if (c._flag === 'area_centroid') return true;  // re-try area centroids
    return !c.lat || !c.lng;
  }).slice(0, LIMIT);

  console.log(`Geocoding ${todo.length} of ${GYMS.length} venues (smarter v2 retry)...`);
  let hit = 0, miss = 0, centroid = 0;

  for (let i = 0; i < todo.length; i++) {
    const g = todo[i];
    process.stdout.write(`[${i + 1}/${todo.length}] ${g.id}... `);
    const r = await tryGeocodeVenue(g);
    if (r) {
      cache[g.id] = {
        lat: r.lat,
        lng: r.lng,
        display_name: r.display_name,
        osm_type: r.osm_type,
        osm_id: r.osm_id,
        source: 'nominatim-v2',
        strategy: r._strategy,
        ...(r._flag ? { _flag: r._flag } : {}),
        attempted_at: new Date().toISOString()
      };
      if (r._flag === 'area_centroid') { centroid++; console.log(`centroid (${r.lat}, ${r.lng})`); }
      else { hit++; console.log(`HIT [${r._strategy}] (${r.lat}, ${r.lng})`); }
    } else {
      cache[g.id] = { failed: true, source: 'nominatim-v2', attempted_at: new Date().toISOString() };
      miss++;
      console.log('miss');
    }
    // Save after every venue so a Ctrl+C doesn't lose progress
    fs.writeFileSync(GEO_PATH + '.tmp', JSON.stringify(cache, null, 2));
    fs.renameSync(GEO_PATH + '.tmp', GEO_PATH);
    await sleep(1100);
  }

  console.log(`\nDone. ${hit} precise hits, ${centroid} area-centroid hits, ${miss} misses.`);
  console.log(`Cache written to ${path.relative(ROOT, GEO_PATH)}`);
}

main().catch(err => { console.error(err); process.exit(1); });
