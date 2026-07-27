#!/usr/bin/env node
/**
 * write-russian-speaking-guide.js — Evidence-led Russian-language sport guide.
 * Run: node scripts/write-russian-speaking-guide.js
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guide = {
  slug: 'pattaya-russian-speaking-sport',
  crumb: 'Russian-speaking sport',
  kicker: 'Guide · Russian-language evidence · classes · booking checks',
  readTime: '12 min read',
  title: 'Russian-Speaking Sport in Pattaya | Pattaya.Gym',
  desc: 'Evidence-led Russian-speaking sport in Pattaya: Rusich combat classes, multilingual yoga, language checks, current prices and booking questions.',
  h1: 'Russian-speaking <span class="accent-cyan">sport.</span>',
  lede: 'Compare the small set of Pattaya venues with current Russian-language evidence, then confirm the exact coach, class, date, price and location before booking.',
  body: require('./guide-bodies/pattaya-russian-speaking-sport'),
  sisterLinks: [
    { url: '/guides/kids-youth-sport-pattaya/', label: 'Kids & youth sport', desc: 'Age groups and guardian checks' },
    { url: '/guides/muay-thai-pattaya-beginners/', label: 'Beginner Muay Thai', desc: 'Choose the session before language' },
    { url: '/guides/yoga-retreat-pattaya/', label: 'Pattaya yoga', desc: 'Studios, classes and booking checks' },
    { url: '/guides/training-thailand-visa-pattaya/', label: 'Training and visa', desc: 'Long-stay planning boundaries' },
  ],
};

const bytes = writeEditorialGuide(guide);
console.log(`Wrote /guides/${guide.slug}/ (${(bytes / 1024).toFixed(1)} KB) editorial guide.`);
