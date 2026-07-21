#!/usr/bin/env node
/**
 * write-round45-guides.js — Na Jomtien & Sattahip south area guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'best-gym-sattahip-pattaya',
    crumb: 'Na Jomtien & Sattahip',
    kicker: 'Guide · Sattahip · marina · resort · south',
    readTime: '10 min read',
    title: 'Best gym in Na Jomtien & Sattahip | Marina, resorts, water parks | Pattaya.Gym',
    desc: 'Best gyms, resort fitness, marina sport, water parks and golf in Na Jomtien and Sattahip south Pattaya — Ocean Marina, Ramayana, Andaz, U-Tapao corridor.',
    h1: 'Na Jomtien & <span class="accent-yellow">Sattahip.</span>',
    lede: 'South of Jomtien Beach is a different Pattaya — yacht marinas, Thailand\'s biggest water parks, U-Tapao airport, and 5-star resort gyms without Walking Street noise. This guide is the far-south sport belt only.',
    body: require('./guide-bodies/best-gym-sattahip'),
    sisterLinks: [
      { url: '/guides/best-gym-jomtien-pattaya/', label: 'Jomtien gyms', desc: 'Beach-road Muay Thai north' },
      { url: 'https://pattayavilla.com/', external: true, label: 'Pattaya Villa', desc: 'South-side long-stay stays' },
      { url: 'https://pattaya-vehicle-rentals.com/', external: true, label: 'Vehicle Rentals', desc: 'Essential for Sattahip daily sport' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
