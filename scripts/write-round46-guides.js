#!/usr/bin/env node
/**
 * write-round46-guides.js — BJJ & MMA editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'bjj-mma-pattaya',
    crumb: 'BJJ & MMA',
    kicker: 'Guide · BJJ · MMA · grappling · fight camps',
    readTime: '9 min read',
    title: 'BJJ & MMA in Pattaya | Gi, No-Gi, cage gyms, fight camps | Pattaya.Gym',
    desc: 'Where to train BJJ, MMA, and grappling in Pattaya — ALFA BJJ, Venum, Rage Fight Academy, Kombat Group, Rambaa M16, and CrossFit S&C for fighters.',
    h1: 'BJJ & <span class="accent-pink">MMA.</span>',
    lede: 'Pattaya is Muay Thai country — but dedicated BJJ academies, cage gyms, and multi-discipline fight camps now cover Gi, No-Gi, MMA, and strength work from Jomtien to the Darkside. This guide maps the real grappling scene.',
    body: require('./guide-bodies/bjj-mma-pattaya'),
    sisterLinks: [
      { url: '/guides/best-gym-east-pattaya/', label: 'East Pattaya camps', desc: 'Kombat Group, Rambaa, Jungle Gym' },
      { url: '/guides/best-muay-thai-pattaya/', label: 'Best Muay Thai', desc: 'Ranked MT camps to pair with BJJ' },
      { url: 'https://pattayavisahelp.com/', external: true, label: 'Pattaya Visa Help', desc: 'Education visa via fight camps' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
