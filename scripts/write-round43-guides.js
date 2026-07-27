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
    kicker: 'Guide · Central Pattaya · access · current prices',
    readTime: '15 min read',
    title: 'Central Pattaya gyms: current prices and 24-hour access | Pattaya.Gym',
    desc: 'Compare Central Pattaya gyms by current dated prices, member access, staffed hours, coached classes, hotel eligibility and exact location.',
    h1: 'Best gym in <span class="accent-yellow">Central.</span>',
    lede: 'Choose by access model: a dated membership, staffed visitor entry, coached session, hotel facility or pool pass. The right Central Pattaya option depends on the product and exact pin.',
    body: require('./guide-bodies/best-gym-central'),
    sisterLinks: [
      { url: '/guides/best-gyms-near-walking-street-pattaya/', label: 'Near Walking Street', desc: 'Beach Road gym cluster' },
      { url: '/guides/24-hour-gyms-pattaya/', label: '24-hour gyms', desc: 'Member versus staffed access' },
      { url: '/guides/gym-day-pass-pattaya/', label: 'Gym day passes', desc: 'Short-stay entry options' },
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

const onlyArg = process.argv.find((arg) => arg.startsWith('--guide-only='));
const onlySlug = onlyArg ? onlyArg.slice('--guide-only='.length) : '';
const selectedGuides = onlySlug ? guides.filter((guide) => guide.slug === onlySlug) : guides;

if (onlySlug && selectedGuides.length === 0) {
  throw new Error(`Unknown guide slug: ${onlySlug}`);
}

for (const g of selectedGuides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
