#!/usr/bin/env node
/**
 * write-round55-guides.js — Equestrian & polo editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'equestrian-pattaya',
    crumb: 'Equestrian',
    kicker: 'Guide · Horse riding · polo · current booking evidence',
    readTime: '10 min read',
    title: 'Equestrian & polo in Pattaya | Horseshoe Point, Thai Polo Club | Pattaya.Gym',
    desc: 'Compare Horseshoe Point and Thai Polo & Equestrian Club using current operator and 2026 competition evidence, with booking questions and honest access gaps.',
    h1: 'Equestrian & <span class="accent-cyan">polo.</span>',
    lede: 'Pattaya’s two equestrian records serve different decisions. Horseshoe Point publishes ordinary riding-school products and has current 2026 competition use; Thai Polo documents polo, eventing and specialist facilities. Neither publishes a simple current visitor tariff, so the first booking message matters.',
    body: require('./guide-bodies/equestrian-pattaya'),
    sisterLinks: [
      { url: '/guides/luxury-sports-clubs-pattaya/', label: 'Luxury sports clubs', desc: 'Resort sport tier' },
      { url: '/guides/best-golf-courses-pattaya/', label: 'Best golf courses', desc: 'Championship Pattaya golf' },
      { url: '/area/east-pattaya/', label: 'East Pattaya', desc: 'Pong and Mabprachan context' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
