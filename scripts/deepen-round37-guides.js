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
    kicker: 'Guide · Jomtien · current prices · access',
    readTime: '14 min read',
    title: 'Jomtien gyms, classes and sport: current prices | Pattaya.Gym',
    desc: 'Compare Jomtien gyms, Muay Thai, yoga, courts, diving and family sport by current dated prices, access rules, status and exact corridor.',
    h1: 'Best gym in <span class="accent-cyan">Jomtien.</span>',
    lede: 'Choose the product and exact corridor first. The Jomtien filter reaches from Dongtan and Thepprasit to Na Jomtien and Ban Amphur, and it mixes memberships, coached sessions, courts, water days and resort facilities.',
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
  {
    slug: 'diving-watersports-pattaya',
    crumb: 'Diving & watersports',
    kicker: 'Guide · Scuba · kite · wake · sailing · current prices',
    readTime: '14 min read',
    title: 'Diving and watersports in Pattaya | current prices and booking',
    desc: 'Compare Pattaya scuba, first-dive, fun-dive, kitesurf, wingfoil, cable-wake and sailing products using current dated prices and first-hand operator evidence.',
    h1: 'Diving &amp; <span class="accent-cyan">watersports.</span>',
    lede: 'Choose the exact transaction before the operator: a first dive, certification, certified fun dive, wind lesson, cable session, sailing course and marina product use different prices, meeting points and booking rules.',
    body: require('./guide-bodies/diving-watersports-pattaya'),
    sisterLinks: [
      { url: '/guides/best-dive-operators-pattaya/', label: 'Best dive operators', desc: 'Compare current scuba products' },
      { url: '/category/watersports/', label: 'Watersports directory', desc: 'All current venue records' },
      { url: '/guides/best-gym-sattahip-pattaya/', label: 'Na Jomtien & Sattahip', desc: 'Wind and marina corridor' },
    ],
  },
  {
    slug: 'english-speaking-muay-thai-pattaya',
    crumb: 'English-speaking Muay Thai',
    kicker: 'Guide · Muay Thai · language evidence · current prices',
    readTime: '14 min read',
    title: 'English-speaking Muay Thai in Pattaya | evidence-led guide',
    desc: 'Find Pattaya Muay Thai camps with explicit or confirmable English support, current training prices, exact schedules and a trainer-language checklist.',
    h1: 'English-speaking <span class="accent-pink">Muay Thai.</span>',
    lede: 'An English website, an English-speaking receptionist and a trainer who can explain technique are not the same evidence. This guide separates them and shows what to confirm before paying.',
    body: require('./guide-bodies/english-speaking-muay-thai-pattaya'),
    sisterLinks: [
      { url: '/guides/best-muay-thai-pattaya/', label: 'Best Muay Thai', desc: 'Current product comparison' },
      { url: '/guides/muay-thai-pattaya-beginners/', label: 'Muay Thai beginners', desc: 'First-session planning' },
      { url: '/category/muay-thai/', label: 'Muay Thai directory', desc: 'All current camp records' },
    ],
  },
  {
    slug: 'family-friendly-pattaya',
    crumb: 'Family-friendly Pattaya',
    kicker: 'Guide · Family sport · current prices · access rules',
    readTime: '12 min read',
    title: 'Family-friendly sport in Pattaya | current prices and access',
    desc: 'Compare Pattaya water parks, hotel pool passes, swim schools, youth football and guest-only resort activities using current prices and access rules.',
    h1: 'Family-friendly <span class="accent-mint">Pattaya.</span>',
    lede: 'Choose the family product first: a public day attraction, non-resident pool pass, coaching term and hotel-guest activity use different prices, supervision rules and locations. This guide keeps those decisions separate.',
    body: require('./guide-bodies/family-friendly-pattaya'),
    sisterLinks: [
      { url: '/guides/kids-youth-sport-pattaya/', label: 'Kids and youth sport', desc: 'Age-banded coaching options' },
      { url: '/guides/swimming-pools-pattaya/', label: 'Swimming pools', desc: 'Leisure, lessons and lanes' },
      { url: '/category/kids-youth/', label: 'Kids directory', desc: 'All current family records' },
    ],
  },
];

const onlyArg = process.argv.find(arg => arg.startsWith('--guide-only='));
const onlySlug = onlyArg ? onlyArg.slice('--guide-only='.length) : '';
const selectedGuides = onlySlug ? GUIDES.filter(g => g.slug === onlySlug) : GUIDES;
if (onlySlug && selectedGuides.length === 0) {
  throw new Error(`Unknown --guide-only slug: ${onlySlug}`);
}

for (const g of selectedGuides) {
  const bytes = writeEditorialGuide(g);
  console.log(`  /guides/${g.slug}/ deepened (${(bytes / 1024).toFixed(1)} KB)`);
}
console.log(`Round 37: ${selectedGuides.length} guide(s) expanded to editorial depth.`);
