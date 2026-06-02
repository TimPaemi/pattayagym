#!/usr/bin/env node
/**
 * sync-llms-guides.js — Rebuild ## Curated guides in llms.txt from guide folders on disk.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LLMS = path.join(ROOT, 'llms.txt');
const SITE = 'https://pattaya-gym.com';
const { GYMS } = require(path.join(ROOT, 'data.js'));
const n = GYMS.length;

const TITLES = {
  '24-hour-gyms-pattaya': '24-hour gyms',
  'adventure-pattaya': 'Adventure sport',
  'bangkok-day-trip-sport-pattaya': 'Bangkok day-trip sport',
  'best-dive-operators-pattaya': 'Best dive operators',
  'best-for-beginners-pattaya': 'Best for beginners',
  'best-golf-courses-pattaya': 'Best golf courses',
  'best-gym-central-pattaya': 'Best gym Central Pattaya',
  'best-gym-east-pattaya': 'Best gym East Pattaya',
  'best-gym-jomtien-pattaya': 'Best gym Jomtien',
  'best-gym-naklua-pratamnak-pattaya': 'Best gym Naklua & Pratamnak',
  'best-gym-sattahip-pattaya': 'Na Jomtien & Sattahip',
  'best-gyms-near-walking-street-pattaya': 'Gyms near Walking Street',
  'best-muay-thai-pattaya': 'Best Muay Thai',
  'bjj-mma-pattaya': 'BJJ & MMA',
  'cheapest-gyms-pattaya': 'Cheapest gyms',
  'climbing-pattaya': 'Climbing',
  'crossfit-pattaya': 'CrossFit',
  'diving-watersports-pattaya': 'Diving & watersports',
  'english-speaking-muay-thai-pattaya': 'English-speaking Muay Thai',
  'equestrian-pattaya': 'Equestrian & polo',
  'family-friendly-pattaya': 'Family-friendly sport',
  'female-friendly-gyms-pattaya': 'Female-friendly gyms',
  'gym-day-pass-pattaya': 'Gym day pass',
  'is-muay-thai-safe-pattaya': 'Is Muay Thai safe?',
  'kids-youth-sport-pattaya': 'Kids & youth sport',
  'luxury-sports-clubs-pattaya': 'Luxury sports clubs',
  'muay-thai-camps-with-accommodation-pattaya': 'Muay Thai stay-and-train',
  'muay-thai-pattaya-beginners': 'Muay Thai for beginners',
  'muay-thai-training-holiday-pattaya': 'Muay Thai training holiday',
  'padel-pickleball-pattaya': 'Padel & pickleball',
  'pattaya-digital-nomad-fitness': 'Digital nomad fitness',
  'pattaya-gyms-childcare-family-pools': 'Childcare & family pools',
  'pattaya-russian-speaking-sport': 'Russian-speaking sport',
  'pattaya-seniors-low-impact-sport': 'Seniors low-impact sport',
  'pattaya-solo-female-fitness': 'Solo female fitness',
  'pattaya-vs-phuket-muay-thai-training': 'Pattaya vs Phuket training',
  'running-cycling-clubs-pattaya': 'Running & cycling clubs',
  'snooker-pool-billiards-pattaya': 'Pool & snooker',
  'swimming-pools-pattaya': 'Swimming & pools',
  'tennis-badminton-pattaya': 'Tennis & badminton',
  'thai-gym-terms-pattaya': 'Thai gym terms',
  'train-muay-thai-pattaya-1-week-1-month': 'Train 1 week vs 1 month',
  'training-thailand-visa-pattaya': 'Training & Thailand visa',
  'yoga-retreat-pattaya': 'Yoga retreat',
};

const guidesDir = path.join(ROOT, 'guides');
const slugs = fs.readdirSync(guidesDir, { withFileTypes: true })
  .filter(e => e.isDirectory() && fs.existsSync(path.join(guidesDir, e.name, 'index.html')))
  .map(e => e.name)
  .sort();

const lines = slugs.map(slug => {
  const label = TITLES[slug] || slug.replace(/-/g, ' ');
  return `- [${label}](${SITE}/guides/${slug}/)`;
});

const block = `## Curated guides (${slugs.length})

${lines.join('\n')}
`;

let llms = fs.readFileSync(LLMS, 'utf8');
llms = llms.replace(/\d+ venues, \d+ guides/g, `${n} venues, ${slugs.length} guides`);
llms = llms.replace(/## Curated guides[\s\S]*?(?=\n## Methodology)/, block + '\n');
fs.writeFileSync(LLMS, llms, 'utf8');
console.log(`sync-llms-guides: ${slugs.length} guides in llms.txt`);
