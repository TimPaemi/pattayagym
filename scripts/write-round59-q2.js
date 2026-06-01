#!/usr/bin/env node
/**
 * write-round59-q2.js — Tier C editorial rewrites (snooker, crossfit, swimming).
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'snooker-pool-billiards-pattaya',
    crumb: 'Pool & snooker',
    kicker: 'Guide · Pool · snooker · 9-foot tables · SF Strike · Megabreak',
    readTime: '12 min read',
    title: 'Pool & snooker in Pattaya | SF Strike, Megabreak | Pattaya.Gym',
    desc: 'Serious pool and snooker in Pattaya — Megabreak 9-foot tables on Soi Diana, SF Strike Bowl at Central Festival, Pattaya Bowl late nights, pricing, and training-week rhythm.',
    h1: 'Pool & <span class="accent-cyan">snooker.</span>',
    lede: 'Pattaya billiards ranges from bar coin-op tables to Megabreak\'s tournament 9-foot setup and SF Strike Bowl\'s mall bowling-plus-pool. This guide maps dedicated halls, pricing bands, and how cue sport fits a Muay Thai or gym week.',
    body: require('./guide-bodies/snooker-pool-billiards-pattaya'),
    sisterLinks: [
      { url: '/guides/running-cycling-clubs-pattaya/', label: 'Running & clubs', desc: 'Hash and social sport' },
      { url: '/guides/pattaya-digital-nomad-fitness/', label: 'Digital nomad fitness', desc: 'Long-stay week rhythm' },
      { url: '/guides/tennis-badminton-pattaya/', label: 'Tennis & badminton', desc: 'Racquet sport map' },
    ],
  },
  {
    slug: 'crossfit-pattaya',
    crumb: 'CrossFit Pattaya',
    kicker: 'Guide · CrossFit · Jungle Gym · Nong Prue · Darkside',
    readTime: '11 min read',
    title: 'CrossFit in Pattaya | Jungle Gym affiliate | Pattaya.Gym',
    desc: 'Pattaya\'s only CrossFit affiliate at Jungle Gym Nong Prue — Coach Murray, class times, archery and MMA on-site, plus alternatives if you stay on Beach Road.',
    h1: 'CrossFit in <span class="accent-cyan">Pattaya.</span>',
    lede: 'There is one CrossFit affiliate in Pattaya — Jungle Gym in Nong Prue. This guide covers class schedules, the multi-discipline campus, who should live on the Darkside, and what to do when you cannot commute from central or Jomtien.',
    body: require('./guide-bodies/crossfit-pattaya'),
    sisterLinks: [
      { url: '/guides/best-gym-east-pattaya/', label: 'East Pattaya gyms', desc: 'Kombat, Castra belt' },
      { url: '/guides/bjj-mma-pattaya/', label: 'BJJ & MMA', desc: 'Combat S&C options' },
      { url: '/guides/muay-thai-training-holiday-pattaya/', label: 'Training holiday', desc: 'Stay-and-train planning' },
    ],
  },
  {
    slug: 'swimming-pools-pattaya',
    crumb: 'Swimming pools',
    kicker: 'Guide · Public pools · hotel day-pass · water parks',
    readTime: '12 min read',
    title: 'Swimming pools in Pattaya | Public, hotel & water parks | Pattaya.Gym',
    desc: 'Where to swim in Pattaya — Naklua and Jomtien public pools, hotel day-passes (Hilton, Andaz, Marriott), Ramayana water park, and beach lap safety.',
    h1: 'Swimming <span class="accent-cyan">pools.</span>',
    lede: 'Pattaya swimming means municipal pools from ฿20 visits, five-star day-passes, beach mornings, and Ramayana-scale water parks. This guide maps every swim venue in our directory with access rules you should confirm before you travel.',
    body: require('./guide-bodies/swimming-pools-pattaya'),
    sisterLinks: [
      { url: '/guides/family-friendly-pattaya/', label: 'Family-friendly sport', desc: 'Kids and pools' },
      { url: '/guides/best-gym-jomtien-pattaya/', label: 'Best gym Jomtien', desc: 'Train + swim south' },
      { url: '/guides/luxury-sports-clubs-pattaya/', label: 'Luxury sports clubs', desc: 'Resort gym passes' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
