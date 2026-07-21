#!/usr/bin/env node
/**
 * write-round51-guides.js — Adventure / multi-sport editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'adventure-pattaya',
    crumb: 'Adventure',
    kicker: 'Guide · Zipline · skydive · karting · ATV · shooting',
    readTime: '10 min read',
    title: 'Adventure sport in Pattaya | Zipline, skydive, karting, ATV | Pattaya.Gym',
    desc: 'Where to find adventure in Pattaya — Thai Sky tandem skydive, Tarzan zipline, Flight of the Gibbon, karting, ATV tours, tower jump, shooting ranges, and booking tips.',
    h1: 'Adventure in <span class="accent-cyan">Pattaya.</span>',
    lede: 'Pattaya runs tandem skydiving, jungle ziplines, kart tracks on Thepprasit, ATV mud east of Mabprachan, a 170m tower jump, and indoor/outdoor shooting — twelve operators in our directory. This guide maps each type and who it suits.',
    body: require('./guide-bodies/adventure-pattaya'),
    sisterLinks: [
      { url: '/guides/family-friendly-pattaya/', label: 'Family-friendly', desc: 'Active holidays with kids' },
      { url: '/guides/climbing-pattaya/', label: 'Climbing', desc: 'Harbor Mall + Bean Cow walls' },
      { url: 'https://mrweoutside.com/', external: true, label: 'Mr We Outside', desc: 'Outdoor adventure community' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
