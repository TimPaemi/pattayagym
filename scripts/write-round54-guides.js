#!/usr/bin/env node
/**
 * write-round54-guides.js — Running, cycling & clubs editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'running-cycling-clubs-pattaya',
    crumb: 'Running & clubs',
    kicker: 'Guide · Running · cycling · hash · beach aerobics · social clubs',
    readTime: '9 min read',
    title: 'Running & cycling clubs in Pattaya | Hash, routes, social sport | Pattaya.Gym',
    desc: 'How to join running and cycling clubs in Pattaya — hash house harriers, public routes, beach aerobics, cricket, rugby, lawn bowls, and marathon events.',
    h1: 'Running & <span class="accent-cyan">cycling clubs.</span>',
    lede: 'Pattaya social sport means Monday hash runs, weekend cycling meetups, free sunrise beach aerobics, and expat cricket and rugby teams — twenty-one club venues in our directory. This guide maps how to plug in without a gym membership.',
    body: require('./guide-bodies/running-cycling-clubs-pattaya'),
    sisterLinks: [
      { url: '/guides/pattaya-digital-nomad-fitness/', label: 'Digital nomad fitness', desc: 'Long-stay training rhythm' },
      { url: 'https://mrweoutside.com/', external: true, label: 'Mr We Outside', desc: 'Outdoor community' },
      { url: '/guides/pattaya-seniors-low-impact-sport/', label: 'Seniors low-impact', desc: 'Bowls, petanque, gentle sport' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
