#!/usr/bin/env node
/**
 * write-round50-guides.js — Climbing editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'climbing-pattaya',
    crumb: 'Climbing',
    kicker: 'Guide · Climbing · bouldering · top rope · lead',
    readTime: '7 min read',
    title: 'Climbing in Pattaya | Deep Climbing, Bean Cow, hotel walls | Pattaya.Gym',
    desc: 'Where to climb in Pattaya — Deep Climbing Gym at Harbor Mall, Bean Cow in Huay Yai, hotel rock walls vs real gyms, and how to pair climbing with Muay Thai.',
    h1: 'Climbing in <span class="accent-cyan">Pattaya.</span>',
    lede: 'Pattaya climbing means two real indoor gyms — Deep at Harbor Mall north and Bean Cow on the Darkside — plus hotel adventure walls that are not the same sport. This guide maps both gyms, who each suits, and family-friendly options.',
    body: require('./guide-bodies/climbing-pattaya'),
    sisterLinks: [
      { url: '/guides/family-friendly-pattaya/', label: 'Family-friendly', desc: 'Sport holidays with kids' },
      { url: '/guides/best-gym-east-pattaya/', label: 'East Pattaya', desc: 'Bean Cow + Kombat belt' },
      { url: 'https://mrweoutside.com/', external: true, label: 'Mr We Outside', desc: 'Outdoor adventure community' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
