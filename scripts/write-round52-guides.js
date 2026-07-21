#!/usr/bin/env node
/**
 * write-round52-guides.js — Kids & youth sport editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'kids-youth-sport-pattaya',
    crumb: 'Kids & youth',
    kicker: 'Guide · Football · trampoline · kids Muay Thai · schools',
    readTime: '8 min read',
    title: 'Kids & youth sport in Pattaya | Football, trampoline, MT for kids | Pattaya.Gym',
    desc: 'Where kids play sport in Pattaya — AF Academy football from age 3, FAST PRO, Rusich, BOUNCE trampoline, Harbor Mall stack, and Muay Thai kids programmes.',
    h1: 'Kids & youth <span class="accent-cyan">sport.</span>',
    lede: 'Pattaya kids sport means football academies from age 3, trampoline parks at Harbor Mall, and Muay Thai programmes at major camps — nine dedicated venues in our directory plus cross-category options. This guide maps each path for relocating and holiday families.',
    body: require('./guide-bodies/kids-youth-sport-pattaya'),
    sisterLinks: [
      { url: '/guides/pattaya-gyms-childcare-family-pools/', label: 'Childcare & pools', desc: 'Train while kids swim' },
      { url: 'https://pattaya-school-guide.com/', external: true, label: 'School Guide', desc: 'International schools Pattaya' },
      { url: '/guides/family-friendly-pattaya/', label: 'Family-friendly', desc: 'Sport holidays with kids' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
