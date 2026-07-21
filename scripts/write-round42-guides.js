#!/usr/bin/env node
/**
 * write-round42-guides.js — Padel/pickleball, training visa, Thai terms (editorial rebuild).
 */

const { writeEditorialGuide } = require('./lib/editorial-guide-shell');

const guides = [
  {
    slug: 'padel-pickleball-pattaya',
    crumb: 'Padel & pickleball',
    kicker: 'Guide · Racquet · padel & pickleball',
    readTime: '8 min read',
    title: 'Padel & pickleball in Pattaya | Courts, prices, where to play | Pattaya.Gym',
    desc: 'Every padel and pickleball court in Pattaya: Play Padel, Pickleball Pattaya, Pattaya Padel Club, booking tips, and where to stay on Pratamnak Hill.',
    h1: 'Padel & <span class="accent-cyan">pickleball.</span>',
    lede: 'Pattaya has dedicated padel and pickleball courts before most Thai cities — indoor Pratamnak, lakeside Mabprachan, and social pickleball leagues. This guide maps where to book.',
    body: require('./guide-bodies/padel-pickleball'),
    sisterLinks: [
      { url: 'https://pattaya-restaurant-guide.com/', external: true, label: 'Pattaya Restaurant Guide', desc: 'Eat after court sessions' },
      { url: '/guides/best-gym-naklua-pratamnak-pattaya/', label: 'Pratamnak gyms', desc: 'Combine racquet with MT or iron' },
      { url: 'https://pattaya-coffee.com/', external: true, label: 'Pattaya Coffee', desc: 'Remote work between matches' },
    ],
  },
  {
    slug: 'training-thailand-visa-pattaya',
    crumb: 'Training & visa',
    kicker: 'Guide · Long-stay · ED visa & training',
    readTime: '9 min read',
    title: 'Train Muay Thai in Thailand: visa guide for Pattaya | Pattaya.Gym',
    desc: 'ED visa, tourist stay, and long-stay training in Pattaya: which visa fits 1 week vs 6 months, camp sponsorship, and links to Pattaya Visa Help.',
    h1: 'Train here. <span class="accent-yellow">Stay legal.</span>',
    lede: 'Trip length picks your visa path — tourist holiday vs ED visa through a camp. This guide connects Pattaya training plans to the right immigration conversation without legal guesswork.',
    body: require('./guide-bodies/training-visa'),
    sisterLinks: [
      { url: 'https://pattayavisahelp.com/', external: true, label: 'Pattaya Visa Help', desc: 'Applications, extensions, agents' },
      { url: 'https://pattaya-medical.com/', external: true, label: 'Pattaya Medical', desc: 'Insurance and injury clinics' },
      { url: 'https://pattaya-school-guide.com/', external: true, label: 'Pattaya School Guide', desc: 'Families relocating' },
    ],
  },
  {
    slug: 'thai-gym-terms-pattaya',
    crumb: 'Thai gym terms',
    kicker: 'Guide · Thai phrases · gym & MT',
    readTime: '10 min read',
    title: 'Thai gym terms for Pattaya — Muay Thai phrase cheat sheet | Pattaya.Gym',
    desc: 'Thai phrases for Pattaya gyms and Muay Thai camps: check-in, prices, class words, sparring, directions, and polite basics — romanized cheat sheet.',
    h1: 'Thai gym <span class="accent-yellow">terms.</span>',
    lede: 'Fifteen phrases cover most gym check-ins, pad rounds, and price questions in Pattaya. Romanized for field use — not a language course, a training survival sheet.',
    body: require('./guide-bodies/thai-gym-terms'),
    sisterLinks: [
      { url: '/guides/muay-thai-pattaya-beginners/', label: 'Muay Thai beginners', desc: 'First week expectations' },
      { url: 'https://pattayavisahelp.com/', external: true, label: 'Pattaya Visa Help', desc: 'Immigration office trips' },
      { url: '/guides/english-speaking-muay-thai-pattaya/', label: 'English-speaking camps', desc: 'When you prefer zero Thai' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
