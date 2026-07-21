#!/usr/bin/env node
/**
 * write-round40-guide.js — Naklua & Pratamnak area gym guide.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const g = {
  slug: 'best-gym-naklua-pratamnak-pattaya',
  crumb: 'Naklua & Pratamnak',
  kicker: 'Guide · Area · North Pattaya & Pratamnak Hill',
  readTime: '9 min read',
  title: 'Best gym in Naklua & Pratamnak Pattaya | Pattaya.Gym',
  desc: 'Where to train in Naklua and Pratamnak: Fairtex, Sityodtong, Muscle Factory, padel, pickleball, pools, yoga, and hilltop fitness — venues you can actually reach from these areas.',
  h1: 'Naklua & <span class="accent-cyan">Pratamnak.</span>',
  lede: 'North Pattaya camps and hilltop iron — Fairtex, Sityodtong, Muscle Factory, padel, Wong Amat, and luxury resort gyms mapped for where you actually sleep.',
  body: require('./guide-bodies/naklua-pratamnak'),
};

const bytes = writeEditorialGuide(g);
console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
