#!/usr/bin/env node
/**
 * write-round44-guides.js — East Pattaya (Darkside) area guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'best-gym-east-pattaya',
    crumb: 'Best gym East Pattaya',
    kicker: 'Guide · East Pattaya · Darkside · camps',
    readTime: '10 min read',
    title: 'Best gym in East Pattaya (Darkside) | Kombat Group, Mabprachan | Pattaya.Gym',
    desc: 'Best gyms and Muay Thai camps in East Pattaya — Kombat Group, Sor Klinmee, Sanit Sport Club, Mabprachan wake and padel, Jungle Gym CrossFit. Hand-checked Darkside venues.',
    h1: 'Best gym on the <span class="accent-cyan">Darkside.</span>',
    lede: 'East Pattaya is where serious camps live away from Beach Road — Huai Yai all-inclusive resorts, Nong Prue authentic gyms, and Mabprachan lake sport. This guide covers only venues on the east belt, with honest transport reality.',
    body: require('./guide-bodies/best-gym-east'),
    sisterLinks: [
      { url: '/guides/muay-thai-camps-with-accommodation-pattaya/', label: 'Camps with accommodation', desc: 'Stay-and-train packages' },
      { url: 'https://pattaya-vehicle-rentals.com/', external: true, label: 'Vehicle Rentals', desc: 'Scooters for daily camp commute' },
      { url: 'https://mrweoutside.com/', external: true, label: 'Mr We Outside', desc: 'Outdoor sport community' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
