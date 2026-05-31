#!/usr/bin/env node
/**
 * write-round47-guides.js — CrossFit Pattaya editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'crossfit-pattaya',
    crumb: 'CrossFit',
    kicker: 'Guide · CrossFit · functional fitness · Jungle Gym',
    readTime: '7 min read',
    title: 'CrossFit in Pattaya | Jungle Gym affiliate + functional fitness alternatives | Pattaya.Gym',
    desc: 'Where to do CrossFit in Pattaya — the Jungle Gym affiliate in Nong Prue, class schedule, and hotel gym or combat S&C alternatives if you stay central or Jomtien.',
    h1: 'CrossFit <span class="accent-yellow">Pattaya.</span>',
    lede: 'Pattaya has one CrossFit affiliate — Jungle Gym on the Darkside — plus chains, iron gyms, and combat conditioning if you train elsewhere. This guide maps both the affiliate and realistic alternatives.',
    body: require('./guide-bodies/crossfit-pattaya'),
    sisterLinks: [
      { url: '/guides/best-gym-east-pattaya/', label: 'East Pattaya', desc: 'Jungle Gym, Kombat, Mabprachan' },
      { url: '/guides/bjj-mma-pattaya/', label: 'BJJ & MMA', desc: 'Combat S&C alternatives' },
      { url: 'https://pattaya-vehicle-rentals.com/', external: true, label: 'Vehicle Rentals', desc: 'Essential for east-side daily WODs' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
