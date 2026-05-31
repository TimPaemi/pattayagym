#!/usr/bin/env node
/**
 * write-round48-guides.js — Swimming & pools editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'swimming-pools-pattaya',
    crumb: 'Swimming & pools',
    kicker: 'Guide · Swimming · pools · water parks · lap swim',
    readTime: '8 min read',
    title: 'Swimming & pools in Pattaya | Hotel pools, water parks, lap swim | Pattaya.Gym',
    desc: 'Where to swim in Pattaya — hotel day-pass pools, water parks, beach laps, swim schools, and family pool days mapped across 158 hand-checked venues.',
    h1: 'Swimming & <span class="accent-cyan">pools.</span>',
    lede: 'Pattaya swimming means hotel pool day passes, Ramayana water-park days, beach mornings, and dedicated swim schools — not just gym changeroom showers. This guide maps every swim venue type in our directory.',
    body: require('./guide-bodies/swimming-pools-pattaya'),
    sisterLinks: [
      { url: '/guides/family-friendly-pattaya/', label: 'Family-friendly', desc: 'Sport holidays with kids' },
      { url: '/guides/best-gym-sattahip-pattaya/', label: 'Na Jomtien & Sattahip', desc: 'Ramayana and resort pools south' },
      { url: 'https://pattaya-medical.com/', external: true, label: 'Pattaya Medical', desc: 'Pool safety and minor injuries' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
