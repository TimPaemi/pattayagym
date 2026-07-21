#!/usr/bin/env node
/**
 * write-round43-guides.js — MT safety, Central Pattaya area hub, yoga retreat.
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'is-muay-thai-safe-pattaya',
    crumb: 'Is Muay Thai safe?',
    kicker: 'Guide · Muay Thai · safety & beginners',
    readTime: '9 min read',
    title: 'Is Muay Thai safe in Pattaya? Honest safety guide | Pattaya.Gym',
    desc: 'Is Muay Thai safe for tourists in Pattaya? Injury risks, red flags, women training alone, medical backup, and beginner-friendly camps — honest answers before you book.',
    h1: 'Is Muay Thai <span class="accent-pink">safe?</span>',
    lede: 'Yes — with the right camp and realistic expectations. Pattaya processes beginner foreigners every week; the risks are heat, shin soreness, and bad gyms — not random street violence in the ring. This guide names both.',
    body: require('./guide-bodies/is-muay-thai-safe'),
    sisterLinks: [
      { url: '/guides/muay-thai-pattaya-beginners/', label: 'Muay Thai beginners', desc: 'First-week camp picks' },
      { url: 'https://pattaya-medical.com/', external: true, label: 'Pattaya Medical', desc: 'Clinics and injury care' },
      { url: 'https://pattayapersonaltrainer.com/', external: true, label: 'Pattaya Personal Trainer', desc: '1-on-1 coaching' },
    ],
  },
  {
    slug: 'best-gym-central-pattaya',
    crumb: 'Best gym Central Pattaya',
    kicker: 'Guide · Central Pattaya · gyms · Muay Thai · 24h',
    readTime: '10 min read',
    title: 'Best gym in Central Pattaya | WKO, Battle Conquer, 24h chains | Pattaya.Gym',
    desc: 'Best gyms and Muay Thai camps in Central Pattaya — WKO, Battle Conquer, Tony\'s Gym, Fitness 7, Jetts, hotel day passes. Hand-checked venues near Beach Road and Soi Buakhao.',
    h1: 'Best gym in <span class="accent-yellow">Central.</span>',
    lede: 'Central Pattaya packs more gyms per block than anywhere else in the city — 24-hour chains, budget Muay Thai legends, and hotel fitness on Beach Road. This guide lists only venues actually in the central zone.',
    body: require('./guide-bodies/best-gym-central'),
    sisterLinks: [
      { url: '/guides/best-gyms-near-walking-street-pattaya/', label: 'Near Walking Street', desc: 'Beach Road gym cluster' },
      { url: 'https://pattaya-vehicle-rentals.com/', external: true, label: 'Vehicle Rentals', desc: 'Scooters and cars' },
      { url: 'https://pattaya-restaurant-guide.com/', external: true, label: 'Restaurant Guide', desc: 'Post-training food' },
    ],
  },
  {
    slug: 'yoga-retreat-pattaya',
    crumb: 'Yoga retreat Pattaya',
    kicker: 'Guide · Yoga · retreat & studios',
    readTime: '8 min read',
    title: 'Yoga retreat in Pattaya — studios, resort packages, 7-day plan | Pattaya.Gym',
    desc: 'Yoga retreat and multi-day wellness in Pattaya: best studios, resort yoga, train-and-stretch weeks, where to stay in Jomtien and Pratamnak, and sample schedules.',
    h1: 'Yoga retreat <span class="accent-cyan">Pattaya.</span>',
    lede: 'Pattaya is a city yoga hub, not a silent ashram — but you can build a genuine retreat week with studio mornings, beach yin, and spa recovery without leaving the airport corridor.',
    body: require('./guide-bodies/yoga-retreat'),
    sisterLinks: [
      { url: '/guides/pattaya-digital-nomad-fitness/', label: 'Digital nomad fitness', desc: 'Work + train rhythm' },
      { url: 'https://pattayavilla.com/', external: true, label: 'Pattaya Villa', desc: 'Long-stay accommodation' },
      { url: 'https://pattaya-coffee.com/', external: true, label: 'Pattaya Coffee', desc: 'Cafés between classes' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
