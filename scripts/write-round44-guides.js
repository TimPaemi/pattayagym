#!/usr/bin/env node
/**
 * write-round44-guides.js — East Pattaya (Darkside) area guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'best-gym-east-pattaya',
    crumb: 'Best gym East Pattaya',
    kicker: 'Guide · East Pattaya · current prices · access',
    readTime: '18 min read',
    title: 'East Pattaya gyms: current prices, camps and courts | Pattaya.Gym',
    desc: 'Compare East Pattaya gyms, Muay Thai camps, courts and youth sport by current dated prices, access model and exact inland location.',
    h1: 'Best gym on the <span class="accent-cyan">Darkside.</span>',
    lede: 'East Pattaya spans several inland corridors. Choose by current access product, exact pin and travel plan rather than treating the Darkside as one compact gym district.',
    body: require('./guide-bodies/best-gym-east'),
    sisterLinks: [
      { url: '/guides/muay-thai-camps-with-accommodation-pattaya/', label: 'Camps with accommodation', desc: 'Stay-and-train packages' },
      { url: '/guides/tennis-badminton-pattaya/', label: 'Racquet sport', desc: 'Tennis, badminton and court access' },
      { url: '/guides/best-gym-central-pattaya/', label: 'Central Pattaya', desc: 'Beach-corridor alternative' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
