#!/usr/bin/env node
/**
 * geocode-venues.js
 *
 * Codex Nuclear V3 P1-1 (BIG): venue LocalBusiness schema is missing
 * geo coordinates (0/158). Google can't fully treat a venue as a local
 * entity without lat/lng. This is the single biggest local-SEO unlock.
 *
 * This script:
 *   1. Reads data.js (158 venues)
 *   2. For each venue without a cached geo, queries Nominatim (OpenStreetMap)
 *      using "name + address + Pattaya Thailand" as the search query
 *   3. Caches the result (lat, lng, accuracy, source) into data/venue-geo.json
 *   4. Skips venues that already have a cached geo (idempotent)
 *   5. Throttles to 1.1s per request (Nominatim ToS: 1 req/sec)
 *
 * Run ONCE locally from C:\pattayagym:
 *   node scripts/geocode-venues.js
 *
 * Then commit the resulting data/venue-geo.json and re-run the build.
 *
 * Re-run later when you add new venues — only the new ones get queried.
 * Re-run with `node scripts/geocode-venues.js --refresh` to force re-query all.
 *
 * Nominatim ToS: https://operations.osmfoundation.org/policies/nominatim/
 *  - Max 1 req/sec
 *  - Must include valid User-Agent + email/contact
 *  - Heavy usage requires self-hosting
 *
 * For Pattaya (~158 venues), this is well within the free tier.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CACHE_PATH = path.join(ROOT, 'data', 'venue-geo.json');
const REFRESH = process.argv.includes('--refresh');

// Load data.js as a module
const dataPath = path.join(ROOT, 'data.js');
const { GYMS } = require(dataPath);

// Load existing cache
let cache = {};
if (fs.existsSync(CACHE_PATH) && !REFRESH) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    console.log(`Loaded existing cache: ${Object.keys(cache).length} entries`);
  } catch (e) {
    console.warn('Cache file unreadable, starting fresh');
    cache = {};
  }
}

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'PattayaGym-Geocoder/1.0 (info@pattaya-gym.com)';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function geocode(venue) {
  // Build query: prefer specific address; fall back to "name Pattaya Thailand"
  let q;
  if (venue.address && venue.address.length > 12 && !/verify|tbd|confirm/i.test(venue.address)) {
    q = `${venue.address}, Pattaya, Thailand`;
  } else if (venue.area && venue.area.length > 4) {
    q = `${venue.name}, ${venue.area}, Pattaya, Thailand`;
  } else {
    q = `${venue.name}, Pattaya, Thailand`;
  }
  // Also bound to Chon Buri province so we don't accidentally match Bangkok / Phuket
  const url = `${NOMINATIM}?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=th&addressdetails=1&namedetails=0`;

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${q}`);
  }
  const arr = await res.json();
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const r = arr[0];
  const lat = parseFloat(r.lat);
  const lng = parseFloat(r.lon);
  if (isNaN(lat) || isNaN(lng)) return null;

  // Sanity check: result should be in Chonburi/Pattaya region (roughly 12.5-13.5°N, 100.5-101.5°E)
  // Wider bound to allow Sattahip (12.6°N) and Sriracha (13.1°N)
  if (lat < 12.4 || lat > 13.5 || lng < 100.5 || lng > 101.6) {
    return { lat, lng, accuracy: 'out_of_bounds', source: 'nominatim', display: r.display_name, query: q, _flag: 'outside_pattaya_region' };
  }
  return {
    lat,
    lng,
    accuracy: r.type || 'unknown',
    osm_type: r.osm_type,
    osm_id: r.osm_id,
    source: 'nominatim',
    display: r.display_name,
    query: q
  };
}

async function main() {
  let ok = 0, fail = 0, skipped = 0, suspect = 0;
  const queue = REFRESH ? GYMS : GYMS.filter(v => !cache[v.id]);
  console.log(`Geocoding ${queue.length} venues (${GYMS.length - queue.length} cached)\n`);

  for (let i = 0; i < queue.length; i++) {
    const v = queue[i];
    process.stdout.write(`[${i + 1}/${queue.length}] ${v.id.padEnd(40)} `);
    try {
      const result = await geocode(v);
      if (result) {
        cache[v.id] = result;
        if (result._flag === 'outside_pattaya_region') {
          suspect++;
          process.stdout.write(`SUSPECT (${result.lat.toFixed(4)}, ${result.lng.toFixed(4)})\n`);
        } else {
          ok++;
          process.stdout.write(`OK (${result.lat.toFixed(4)}, ${result.lng.toFixed(4)})\n`);
        }
      } else {
        fail++;
        cache[v.id] = { failed: true, source: 'nominatim', attempted_at: new Date().toISOString() };
        process.stdout.write(`NO RESULT\n`);
      }
    } catch (e) {
      fail++;
      cache[v.id] = { failed: true, error: e.message, attempted_at: new Date().toISOString() };
      process.stdout.write(`ERR: ${e.message}\n`);
    }
    // Save progress every 10 venues
    if ((i + 1) % 10 === 0) {
      fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
    }
    // Throttle to respect Nominatim ToS
    await sleep(1100);
  }

  // Final save
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

  console.log(`\nDone.`);
  console.log(`  OK:       ${ok}`);
  console.log(`  Suspect:  ${suspect} (outside expected Pattaya region — review manually)`);
  console.log(`  Failed:   ${fail}`);
  console.log(`  Cached:   ${GYMS.length - queue.length}`);
  console.log(`  Total:    ${Object.keys(cache).filter(k => cache[k].lat).length}/${GYMS.length} venues now have geo`);
  console.log(`\nNext: commit data/venue-geo.json and run node build-v2.js`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
