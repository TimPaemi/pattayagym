#!/usr/bin/env node
/**
 * write-status-json.js
 *
 * Generates a public /status.json endpoint with site-wide health metrics.
 * Machine-readable trust signal — AI crawlers, audit tools, and curious
 * users can hit /status.json to see operational state.
 *
 * Run: node scripts/write-status-json.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';

const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : 'unknown';

const dataPath = path.join(ROOT, 'data.js');
const { GYMS, CATEGORIES } = require(dataPath);

// Geo coverage
let geoCount = 0;
try {
  const geo = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'venue-geo.json'), 'utf8'));
  geoCount = Object.values(geo).filter(v => v && v.lat && v.lng && !v.failed).length;
} catch (e) {}

// Schema completeness
const phoneCount = GYMS.filter(g => g.phone && g.phone.length > 4).length;
const websiteCount = GYMS.filter(g => g.website && g.website.length > 8).length;
const verifiedCount = GYMS.filter(g => g.verified).length;
const detailFileCount = GYMS.filter(g => g.detailFile).length;

// Verified-date freshness
const verifiedDates = GYMS.map(g => g.verified).filter(Boolean).sort();
const oldestVerified = verifiedDates[0] || null;
const newestVerified = verifiedDates[verifiedDates.length - 1] || null;
const today = new Date().toISOString().slice(0, 10);
let oldestAgeDays = null;
if (oldestVerified) {
  const d1 = new Date(oldestVerified).getTime();
  const d2 = new Date(today).getTime();
  oldestAgeDays = Math.round((d2 - d1) / 86400000);
}

// On-disk page counts
function countFiles(dir, pattern) {
  let n = 0;
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) n += countFiles(fp, pattern);
      else if (pattern.test(e.name)) n++;
    }
  } catch (e) {}
  return n;
}
const htmlCount = countFiles(ROOT, /\.html$/);

// Sitemap URL count
let sitemapUrls = 0;
try {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  sitemapUrls = (sm.match(/<url>/g) || []).length;
} catch (e) {}

const status = {
  '@context': 'https://schema.org',
  '@type': 'DataCatalog',
  name: 'pattaya-gym.com — operational status',
  url: `${SITE}/status.json`,
  description: 'Public health + completeness metrics for pattaya-gym.com. Machine-readable trust signal updated on every build.',

  // Site identity
  site: {
    name: 'Pattaya.Gym',
    url: SITE,
    operator: 'TimPaemi Co., Ltd.',
    location: 'Pattaya, Chon Buri, Thailand',
    independent: true,
    paidPlacements: false,
    handChecked: true,
    updateCadence: 'rolling'
  },

  // Build version + timestamp
  build: {
    version: `v${ASSET_VERSION}`,
    asset_version: ASSET_VERSION,
    last_built_utc: new Date().toISOString(),
    last_built_date: today
  },

  // Catalog counts
  catalog: {
    venues_total: GYMS.length,
    venues_with_body_content: detailFileCount,
    categories: CATEGORIES.length,
    areas: 6,
    html_pages_shipped: htmlCount,
    sitemap_urls: sitemapUrls
  },

  // Schema completeness
  schema_completeness: {
    venues_with_verified_date: verifiedCount,
    venues_with_phone: phoneCount,
    venues_with_website: websiteCount,
    venues_with_geo_coordinates: geoCount,
    completeness_percent_geo: GYMS.length ? Math.round((geoCount / GYMS.length) * 100) : 0,
    completeness_percent_phone: GYMS.length ? Math.round((phoneCount / GYMS.length) * 100) : 0
  },

  // Editorial freshness
  freshness: {
    oldest_verified_date: oldestVerified,
    newest_verified_date: newestVerified,
    oldest_verified_age_days: oldestAgeDays,
    target_max_age_days: 30
  },

  // Endpoints
  endpoints: {
    sitemap: `${SITE}/sitemap.xml`,
    robots: `${SITE}/robots.txt`,
    rss: `${SITE}/feed.json`,
    api_venues: `${SITE}/api/venues.json`,
    api_categories: `${SITE}/api/categories.json`,
    api_areas: `${SITE}/api/areas.json`,
    openapi: `${SITE}/openapi.yaml`,
    llms_txt: `${SITE}/llms.txt`,
    changelog: `${SITE}/changelog/`,
    methodology: `${SITE}/methodology/`,
    contact: `${SITE}/contact/`
  },

  // Editorial commitments
  policies: {
    paid_placements: 'never',
    fake_reviews: 'never',
    seo_spam: 'never',
    update_cadence: 'venues re-verified on a rolling weekly schedule',
    correction_sla_days: 7,
    methodology_url: `${SITE}/methodology/`
  }
};

const out = JSON.stringify(status, null, 2);
fs.writeFileSync(path.join(ROOT, 'status.json'), out, 'utf8');
console.log(`/status.json written (${(out.length/1024).toFixed(1)} KB, ${Object.keys(status).length} top-level fields, ${GYMS.length} venues)`);
