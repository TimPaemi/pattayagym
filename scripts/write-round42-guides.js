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
    body: require('./guide-bodies/padel-pickleball-enriched'),
    sisterLinks: [
      { url: '/guides/best-gym-naklua-pratamnak-pattaya/', label: 'Pratamnak gyms', desc: 'Combine racquet with MT or iron' },
      { url: '/guides/tennis-badminton-pattaya/', label: 'Tennis & badminton', desc: 'Other racquet options' },
      { url: '/guides/pattaya-digital-nomad-fitness/', label: 'Digital nomad fitness', desc: 'Work between matches' },
    ],
  },
  {
    slug: 'training-thailand-visa-pattaya',
    crumb: 'Training & visa',
    kicker: 'Guide · Long-stay · ED visa & training',
    readTime: '9 min read',
    title: 'Train Muay Thai in Thailand: visa guide for Pattaya | Pattaya.Gym',
    desc: 'ED visa, tourist stay, and long-stay training in Pattaya: which visa fits 1 week vs 6 months, camp sponsorship, and official-planning questions.',
    h1: 'Train here. <span class="accent-yellow">Stay legal.</span>',
    lede: 'Trip length picks your visa path — tourist holiday vs ED visa through a camp. This guide connects Pattaya training plans to the right immigration conversation without legal guesswork.',
    body: require('./guide-bodies/training-visa'),
    sisterLinks: [
      { url: '/guides/muay-thai-training-holiday-pattaya/', label: 'Training holiday', desc: 'Short-stay planning' },
      { url: '/guides/train-muay-thai-pattaya-1-week-1-month/', label: '1 week vs 1 month', desc: 'Trip-length planning' },
      { url: '/guides/muay-thai-camps-with-accommodation-pattaya/', label: 'Camps with rooms', desc: 'Residential planning' },
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
      { url: '/guides/gym-day-pass-pattaya/', label: 'Gym day passes', desc: 'Check-in and first-visit questions' },
      { url: '/guides/english-speaking-muay-thai-pattaya/', label: 'English-speaking camps', desc: 'When you prefer zero Thai' },
    ],
  },
];

for (const g of guides) {
  const bytes = writeEditorialGuide(g);
  console.log(`Wrote /guides/${g.slug}/ (${(bytes / 1024).toFixed(1)} KB)`);
}
