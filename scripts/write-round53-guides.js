#!/usr/bin/env node
/**
 * write-round53-guides.js — Diving & watersports editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'diving-watersports-pattaya',
    crumb: 'Diving & watersports',
    kicker: 'Guide · Scuba · kitesurf · sailing · Koh Larn · marina',
    readTime: '10 min read',
    title: 'Diving & watersports in Pattaya | Scuba, kite, sailing, islands | Pattaya.Gym',
    desc: 'Where to dive, kite, sail, and play on the water in Pattaya — Bali Hai pier dive boats, Jomtien kite schools, Ocean Marina, Koh Larn day trips, and ranked dive shop picks.',
    h1: 'Diving & <span class="accent-cyan">watersports.</span>',
    lede: 'Pattaya watersport means morning dive boats from Bali Hai Pier, kitesurf on Jomtien when the wind runs, yacht schools at Ocean Marina, and Koh Larn island ferries — twenty-one venues in our directory. This guide maps each lane; dive shop tiers live in the ranked list.',
    body: require('./guide-bodies/diving-watersports-pattaya'),
    sisterLinks: [
      { url: '/guides/best-dive-operators-pattaya/', label: 'Best dive operators', desc: 'Ranked PADI and SSI shops' },
      { url: '/guides/best-gym-sattahip-pattaya/', label: 'Na Jomtien & Sattahip', desc: 'Marina and south corridor' },
      { url: 'https://mrweoutside.com/', external: true, label: 'Mr We Outside', desc: 'Outdoor adventure community' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
