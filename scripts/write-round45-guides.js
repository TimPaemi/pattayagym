#!/usr/bin/env node
/**
 * write-round45-guides.js — Na Jomtien & Sattahip south area guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'best-gym-sattahip-pattaya',
    crumb: 'Na Jomtien & Sattahip',
    kicker: 'Guide · Sattahip · Na Jomtien · access · prices',
    readTime: '14 min read',
    title: 'Gyms in Sattahip & Na Jomtien | Prices, access, maps | Pattaya.Gym',
    desc: 'Compare Sattahip, Bang Saray and Na Jomtien gyms, resort fitness, watersports, golf and family activities by access, dated price and exact area.',
    h1: 'Na Jomtien & <span class="accent-yellow">Sattahip.</span>',
    lede: 'Compare the southern corridor from Na Jomtien and Ban Amphur through Bang Saray to Sattahip. The useful distinction is access: public gym, hotel-guest amenity, coached studio or book-ahead activity.',
    body: require('./guide-bodies/best-gym-sattahip'),
    sisterLinks: [
      { url: '/guides/best-gym-jomtien-pattaya/', label: 'Jomtien gyms', desc: 'Beach-road Muay Thai north' },
      { url: '/guides/best-gym-central-pattaya/', label: 'Central Pattaya', desc: 'More public gym choices' },
      { url: '/guides/diving-watersports-pattaya/', label: 'Watersports', desc: 'Dive, kite and sailing access' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
