#!/usr/bin/env node
/**
 * write-round56-guides.js — Snooker, pool & billiards editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'snooker-pool-billiards-pattaya',
    crumb: 'Pool & snooker',
    kicker: 'Guide · Pool · snooker · billiards · SF Strike · Megabreak',
    readTime: '6 min read',
    title: 'Pool & snooker in Pattaya | SF Strike, Megabreak | Pattaya.Gym',
    desc: 'Where to play pool and snooker in Pattaya — SF Strike Bowl, Megabreak, Pattaya Bowl, hourly hire, and how to fit billiards into a training week.',
    h1: 'Pool & <span class="accent-cyan">snooker.</span>',
    lede: 'Pattaya billiards means air-conditioned halls on Second Road, multi-table venues like SF Strike Bowl, and casual league nights at Megabreak — low-impact social sport for expat groups and rainy-season backup.',
    body: require('./guide-bodies/snooker-pool-billiards-pattaya'),
    sisterLinks: [
      { url: '/guides/tennis-badminton-pattaya/', label: 'Tennis & badminton', desc: 'Racquet sport map' },
      { url: '/guides/pattaya-digital-nomad-fitness/', label: 'Digital nomad fitness', desc: 'Long-stay rhythm' },
      { url: 'https://timpaemi.com/live/', external: true, label: 'TIMPAEMI live', desc: 'Villa livestream' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
