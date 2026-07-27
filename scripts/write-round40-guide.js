#!/usr/bin/env node
/**
 * write-round40-guide.js — Naklua & Pratamnak area gym guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const g = {
  slug: 'best-gym-naklua-pratamnak-pattaya',
  crumb: 'Naklua & Pratamnak',
  kicker: 'Guide · Access · current prices · exact areas',
  readTime: '18 min read',
  title: 'Naklua & Pratamnak gyms: prices and access | Pattaya.Gym',
  desc: 'Compare Naklua and Pratamnak gyms, Muay Thai, courts, yoga, pools and hotel fitness by current dated prices, public access and exact location.',
  h1: 'Naklua & <span class="accent-cyan">Pratamnak.</span>',
  lede: 'Choose the side and access product first. The current filters contain 24 north-side records and 13 hill records, mixing public gyms, coached sessions, courts, clubs, hotel amenities and status warnings.',
  body: require('./guide-bodies/naklua-pratamnak'),
};

const bytes = writeEditorialGuide(g);
console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
