#!/usr/bin/env node
/**
 * write-round51-guides.js — Adventure / multi-sport editorial guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'adventure-pattaya',
    crumb: 'Adventure',
    kicker: 'Guide · Skydive · karting · ATV · zipline · shooting',
    readTime: '13 min read',
    title: 'Adventure sport in Pattaya | Zipline, skydive, karting, ATV | Pattaya.Gym',
    desc: 'Compare current Pattaya adventure records for skydiving, karting, ATV, ziplines, motorsport and shooting, with dated prices, booking gaps and closure warnings.',
    h1: 'Adventure in <span class="accent-cyan">Pattaya.</span>',
    lede: 'The directory has 16 adventure-category records, but four are football or multi-sport venues and two relevant records carry a closure or identity warning. This guide compares the current evidence without presenting every record as open or bookable.',
    body: require('./guide-bodies/adventure-pattaya'),
    sisterLinks: [
      { url: '/guides/family-friendly-pattaya/', label: 'Family-friendly', desc: 'Active holidays with kids' },
      { url: '/guides/climbing-pattaya/', label: 'Climbing', desc: 'Harbor Mall + Bean Cow walls' },
      { url: '/guides/best-gym-east-pattaya/', label: 'East Pattaya', desc: 'Pong, Mabprachan and Huai Yai context' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
