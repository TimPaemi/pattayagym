#!/usr/bin/env node
/**
 * deepen-round37-guides.js — Re-write Round 37 guides at full editorial depth (~1,500 words each).
 * Run: node scripts/deepen-round37-guides.js
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const GUIDES = [
  {
    slug: 'muay-thai-pattaya-beginners',
    crumb: 'Muay Thai for beginners',
    kicker: 'Guide · Muay Thai · absolute beginners · 7 camps',
    readTime: '9 min read',
    title: 'Muay Thai in Pattaya for beginners | Pattaya.Gym',
    desc: 'Which Pattaya Muay Thai gyms actually accept absolute beginners, what your first week feels like, gear checklist, realistic costs, and red flags for tourist traps.',
    h1: 'Muay Thai for <span class="accent-pink">beginners.</span>',
    lede: 'Pattaya is one of the easiest cities in Thailand to start Muay Thai — if you pick the right camp. This guide is only for absolute beginners: zero experience, maybe zero fitness, first pad round ever. We name seven camps that teach fundamentals patiently, with pricing and honest red flags.',
    body: require('./guide-bodies/beginners'),
  },
  {
    slug: 'best-gym-jomtien-pattaya',
    crumb: 'Best gym in Jomtien',
    kicker: 'Guide · Jomtien · gyms · Muay Thai · fitness',
    readTime: '8 min read',
    title: 'Best gym in Jomtien Pattaya | Pattaya.Gym',
    desc: 'Best gyms, Muay Thai camps, yoga studios, pools, and fitness options in Jomtien and Na Jomtien — hand-checked venues near Jomtien Beach with area context and compare links.',
    h1: 'Best gym in <span class="accent-cyan">Jomtien.</span>',
    lede: 'Jomtien is Pattaya\'s quieter beach strip — better for long-stay trainers than Walking Street chaos. This guide lists only venues actually in or beside Jomtien and Na Jomtien, with full write-ups so you do not commute 30 minutes to a gym that called itself "Jomtien" on a brochure.',
    body: require('./guide-bodies/jomtien'),
  },
  {
    slug: 'pattaya-vs-phuket-muay-thai-training',
    crumb: 'Pattaya vs Phuket Muay Thai',
    kicker: 'Guide · Compare · training destination',
    readTime: '8 min read',
    title: 'Pattaya vs Phuket for Muay Thai training | Pattaya.Gym',
    desc: 'Honest comparison: Pattaya vs Phuket for Muay Thai training holidays — cost, camp quality, nightlife, beaches, fights, visas, and who should pick which city.',
    h1: 'Pattaya vs <span class="accent-yellow">Phuket.</span>',
    lede: 'Both cities sell "train Muay Thai in paradise." The experience is not the same. This is an independent comparison from the Pattaya side — we map 158 Pattaya venues and say plainly when Phuket is the better fit for your trip type.',
    body: require('./guide-bodies/pattaya-vs-phuket'),
  },
];

for (const g of GUIDES) {
  const bytes = writeEditorialGuide(g);
  console.log(`  /guides/${g.slug}/ deepened (${(bytes / 1024).toFixed(1)} KB)`);
}
console.log('Round 37 guides expanded to editorial depth.');
