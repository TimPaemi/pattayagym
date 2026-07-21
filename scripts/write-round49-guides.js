#!/usr/bin/env node
/**
 * write-round49-guides.js — Tennis & badminton editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'tennis-badminton-pattaya',
    crumb: 'Tennis & badminton',
    kicker: 'Guide · Tennis · badminton · racquet clubs',
    readTime: '9 min read',
    title: 'Tennis & badminton in Pattaya | Courts, clubs, booking | Pattaya.Gym',
    desc: 'Where to play tennis and badminton in Pattaya — Fitz Club, Pattaya Tennis Club, Greta covered courts, Euro Badminton, hotel courts, and how they differ from padel.',
    h1: 'Tennis & <span class="accent-cyan">badminton.</span>',
    lede: 'Pattaya runs floodlit tennis on Pratamnak, covered courts south at Greta, budget badminton halls on the Darkside, and seven courts at Fitz Club. Padel and pickleball have their own guide — this page is tennis and badminton only.',
    body: require('./guide-bodies/tennis-badminton-pattaya'),
    sisterLinks: [
      { url: '/guides/padel-pickleball-pattaya/', label: 'Padel & pickleball', desc: 'Dedicated padel and pickleball courts' },
      { url: '/guides/best-gym-naklua-pratamnak-pattaya/', label: 'Pratamnak gyms', desc: 'Fitz Club and hilltop training' },
      { url: 'https://pattayavilla.com/', external: true, label: 'Pattaya Villa', desc: 'Long-stay near Pratamnak courts' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
