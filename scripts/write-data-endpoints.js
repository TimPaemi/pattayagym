#!/usr/bin/env node
/**
 * write-data-endpoints.js
 *
 * Round 21 (Codex P2-8). The JSON API + feed used to be generated only by the
 * legacy build-extras.js, which the current PUSH pipeline no longer runs — so
 * /api/venues.json, /api/categories.json, /api/areas.json and /feed.json went
 * stale (their `generated` date drifted away from the real build date).
 *
 * This script regenerates all four from data.js on every build, so the
 * machine-readable endpoints AI crawlers rely on always agree with the site.
 *
 * Run: node scripts/write-data-endpoints.js
 * Idempotent.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const TODAY = new Date().toISOString().slice(0, 10);

const { GYMS, CATEGORIES } = require(path.join(ROOT, 'data.js'));
const catLabel = (k) => { const c = CATEGORIES.find(x => x.key === k); return c ? c.label : k; };

// ---- /api/venues.json ----
const venues = GYMS.map(g => ({
  id: g.id,
  name: g.name,
  url: `${SITE}/gyms/${g.id}/`,
  category: g.category,
  categoryLabel: catLabel(g.category),
  area: g.area || null,
  address: g.address || null,
  phone: g.phone || null,
  website: g.website || null,
  socialFacebook: (g.social && g.social.facebook) ? `https://facebook.com/${g.social.facebook}` : null,
  socialInstagram: (g.social && g.social.instagram) ? `https://instagram.com/${g.social.instagram}` : null,
  hours: g.hours || null,
  priceRange: g.priceRange || null,
  description: g.description || null,
  tags: g.tags || [],
  mapsUrl: g.mapsUrl || null,
  verified: g.verified || null
}));
const venuesApi = {
  name: 'Pattaya Gym Directory',
  url: SITE + '/',
  description: 'Independently-verified directory of every gym, Muay Thai camp, BJJ academy, golf course, dive operator, watersports, climbing, yoga and sport venue in Pattaya, Thailand.',
  generated: TODAY,
  license: 'CC BY 4.0',
  attribution: 'Source: pattaya-gym.com (independent directory, no paid placements)',
  counts: { venues: venues.length, categories: CATEGORIES.length },
  categories: CATEGORIES.map(c => ({ key: c.key, label: c.label })),
  venues
};
fs.writeFileSync(path.join(ROOT, 'api', 'venues.json'), JSON.stringify(venuesApi), 'utf8');

// ---- /api/categories.json ----
const categoriesApi = {
  name: 'Pattaya Gym Directory — categories',
  url: SITE + '/',
  generated: TODAY,
  license: 'CC BY 4.0',
  count: CATEGORIES.length,
  categories: CATEGORIES.map(c => {
    const list = GYMS.filter(g => g.category === c.key);
    return {
      key: c.key,
      label: c.label,
      url: `${SITE}/category/${c.key}/`,
      venueCount: list.length,
      venues: list.map(g => ({ id: g.id, name: g.name, url: `${SITE}/gyms/${g.id}/`, area: g.area || null, priceRange: g.priceRange || null }))
    };
  })
};
fs.writeFileSync(path.join(ROOT, 'api', 'categories.json'), JSON.stringify(categoriesApi, null, 2), 'utf8');

// ---- /api/areas.json ----
const AREAS = [
  { slug: 'jomtien', name: 'Jomtien', keywords: ['jomtien', 'na jomtien', 'na chom thian'] },
  { slug: 'naklua', name: 'Naklua', keywords: ['naklua', 'na kluea'] },
  { slug: 'pratamnak', name: 'Pratamnak Hill', keywords: ['pratamnak', 'pratumnak', 'phra tamnak', 'buddha hill'] },
  { slug: 'east-pattaya', name: 'East Pattaya / Darkside', keywords: ['east pattaya', 'darkside', 'mabprachan', 'khao talo', 'khao mai kaeo'] },
  { slug: 'central-pattaya', name: 'Central Pattaya', keywords: ['central pattaya', 'walking street', 'beach road', 'soi buakhao', 'pattaya 2nd', 'pattaya 3rd', 'pattaya klang', 'the avenue'] },
  { slug: 'sattahip', name: 'Sattahip / Far South', keywords: ['sattahip', 'ban chang'] }
];
const areasApi = {
  name: 'Pattaya Gym Directory — areas',
  url: SITE + '/',
  generated: TODAY,
  license: 'CC BY 4.0',
  count: AREAS.length,
  areas: AREAS.map(a => {
    const list = GYMS.filter(g => {
      const hay = ((g.area || '') + ' ' + (g.address || '')).toLowerCase();
      return a.keywords.some(k => hay.indexOf(k) >= 0);
    });
    return {
      slug: a.slug,
      name: a.name,
      url: `${SITE}/area/${a.slug}/`,
      venueCount: list.length,
      venues: list.map(g => ({ id: g.id, name: g.name, url: `${SITE}/gyms/${g.id}/`, category: g.category, priceRange: g.priceRange || null }))
    };
  })
};
fs.writeFileSync(path.join(ROOT, 'api', 'areas.json'), JSON.stringify(areasApi, null, 2), 'utf8');

// ---- /feed.json (JSON Feed 1.1, 30 most-recently-verified) ----
const recent = GYMS.slice().sort((a, b) => String(b.verified || '').localeCompare(String(a.verified || ''))).slice(0, 30);
const jsonFeed = {
  version: 'https://jsonfeed.org/version/1.1',
  title: 'Pattaya Gym Directory — Recently Added',
  home_page_url: SITE + '/',
  feed_url: SITE + '/feed.json',
  description: 'Latest verified gyms, Muay Thai camps, dive operators, golf courses and sport venues added to the Pattaya Gym Directory.',
  icon: SITE + '/og-image.png',
  favicon: SITE + '/icon-180.png',
  language: 'en',
  authors: [{ name: 'Pattaya Gym Directory', url: SITE + '/' }],
  items: recent.map(g => ({
    id: `${SITE}/gyms/${g.id}/`,
    url: `${SITE}/gyms/${g.id}/`,
    title: g.name || '',
    content_text: g.description || '',
    date_published: (g.verified || TODAY) + 'T00:00:00Z',
    tags: [g.category, g.area].filter(Boolean)
  }))
};
fs.writeFileSync(path.join(ROOT, 'feed.json'), JSON.stringify(jsonFeed), 'utf8');

console.log(`Data endpoints regenerated (generated: ${TODAY}) — venues.json (${venues.length}), categories.json (${CATEGORIES.length}), areas.json (${AREAS.length}), feed.json (${recent.length} items)`);
