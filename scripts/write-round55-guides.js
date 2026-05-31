#!/usr/bin/env node
/**
 * write-round55-guides.js — Equestrian & polo editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'equestrian-pattaya',
    crumb: 'Equestrian',
    kicker: 'Guide · Horse riding · polo · Horseshoe Point · Thai Polo Club',
    readTime: '7 min read',
    title: 'Equestrian & polo in Pattaya | Horseshoe Point, Thai Polo Club | Pattaya.Gym',
    desc: 'Where to ride horses and play polo near Pattaya — Horseshoe Point Resort at Mabprachan and Thai Polo & Equestrian Club, booking tips, and who each venue suits.',
    h1: 'Equestrian & <span class="accent-cyan">polo.</span>',
    lede: 'Pattaya equestrian means two world-scale venues — Horseshoe Point\'s 1,500-acre riding school at Mabprachan and Thai Polo Club\'s 250-hectare polo fields north of the city. This guide maps both, booking rules, and how to pair a horse day with golf or Muay Thai.',
    body: require('./guide-bodies/equestrian-pattaya'),
    sisterLinks: [
      { url: '/guides/luxury-sports-clubs-pattaya/', label: 'Luxury sports clubs', desc: 'Resort sport tier' },
      { url: '/guides/best-golf-courses-pattaya/', label: 'Best golf courses', desc: 'Championship Pattaya golf' },
      { url: 'https://pattayavilla.com/', external: true, label: 'Pattaya Villa', desc: 'Long-stay near Mabprachan' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
