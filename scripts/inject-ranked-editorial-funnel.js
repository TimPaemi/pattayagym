#!/usr/bin/env node
/**
 * inject-ranked-editorial-funnel.js
 * Prepends high-intent editorial guide cards to ranked guides' related section.
 * Idempotent — marker editorial-funnel-r40
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'editorial-funnel-r40';

const EDITORIAL = new Set([
  'english-speaking-muay-thai-pattaya',
  'muay-thai-camps-with-accommodation-pattaya',
  'gym-day-pass-pattaya',
  'muay-thai-training-holiday-pattaya',
  'muay-thai-pattaya-beginners',
  'best-gym-jomtien-pattaya',
  'pattaya-vs-phuket-muay-thai-training',
  'train-muay-thai-pattaya-1-week-1-month',
  'best-gym-naklua-pratamnak-pattaya',
  'padel-pickleball-pattaya',
  'training-thailand-visa-pattaya',
  'thai-gym-terms-pattaya',
  'is-muay-thai-safe-pattaya',
  'best-gym-central-pattaya',
  'yoga-retreat-pattaya',
  'best-gym-east-pattaya',
  'best-gym-sattahip-pattaya',
  'bjj-mma-pattaya',
  'crossfit-pattaya',
  'swimming-pools-pattaya',
  'tennis-badminton-pattaya',
  'climbing-pattaya',
]);

/** slug -> editorial cards to inject (max 3) */
const FUNNEL_BY_GUIDE = {
  'best-muay-thai-pattaya': [
    { slug: 'is-muay-thai-safe-pattaya', title: 'Is Muay Thai safe?', desc: 'Injury risks, red flags, and medical backup in Pattaya.' },
    { slug: 'bjj-mma-pattaya', title: 'BJJ & MMA', desc: 'Grappling and cage gyms to pair with MT.' },
    { slug: 'muay-thai-pattaya-beginners', title: 'Muay Thai for beginners', desc: 'First week, gear, costs, and red flags before you pick a camp.' },
  ],
  'best-for-beginners-pattaya': [
    { slug: 'climbing-pattaya', title: 'Climbing in Pattaya', desc: 'Intro top-rope at Deep and Bean Cow.' },
    { slug: 'muay-thai-pattaya-beginners', title: 'Muay Thai for beginners', desc: 'Dedicated beginner camps and pad-round expectations.' },
    { slug: 'english-speaking-muay-thai-pattaya', title: 'English-speaking Muay Thai', desc: 'Ten camps where foreigners train without Thai.' },
  ],
  'cheapest-gyms-pattaya': [
    { slug: 'gym-day-pass-pattaya', title: 'Gym day pass Pattaya', desc: 'Drop-in and walk-in options with no membership.' },
    { slug: 'muay-thai-pattaya-beginners', title: 'Muay Thai for beginners', desc: 'Cheap first pad rounds and beginner-friendly camps.' },
    { slug: 'train-muay-thai-pattaya-1-week-1-month', title: '1 week vs 1 month', desc: 'Budget a short trip vs a full training block.' },
  ],
  'best-gyms-near-walking-street-pattaya': [
    { slug: 'best-gym-central-pattaya', title: 'Best gym Central Pattaya', desc: 'WKO, Battle Conquer, 24h chains — full central guide.' },
    { slug: 'gym-day-pass-pattaya', title: 'Gym day pass', desc: 'Short-stay drop-ins near the nightlife zone.' },
    { slug: 'muay-thai-pattaya-beginners', title: 'Muay Thai beginners', desc: 'Avoid tourist-trap pad mills on Soi 6.' },
  ],
  'female-friendly-gyms-pattaya': [
    { slug: 'pattaya-solo-female-fitness', title: 'Solo female fitness', desc: 'Safety and gym culture for women training alone.' },
    { slug: 'muay-thai-pattaya-beginners', title: 'Muay Thai beginners', desc: 'Beginner camps that routinely train women.' },
    { slug: 'english-speaking-muay-thai-pattaya', title: 'English-speaking MT', desc: 'Clear coaching for first-time fighters.' },
  ],
  '24-hour-gyms-pattaya': [
    { slug: 'best-gym-central-pattaya', title: 'Central Pattaya 24h gyms', desc: 'Jetts, Anytime, Fitness 7 cluster on Beach Road corridor.' },
    { slug: 'gym-day-pass-pattaya', title: 'Gym day pass', desc: 'Night-owl drop-ins when you are not on a monthly deal.' },
    { slug: 'cheapest-gyms-pattaya', title: 'Cheapest gyms', desc: 'Price table — monthly and walk-in tiers.' },
  ],
  'family-friendly-pattaya': [
    { slug: 'climbing-pattaya', title: 'Climbing in Pattaya', desc: 'Deep Harbor Mall and Bean Cow family walls.' },
    { slug: 'swimming-pools-pattaya', title: 'Swimming & pools', desc: 'Hotel pools, water parks, lap swim.' },
    { slug: 'best-gym-sattahip-pattaya', title: 'Na Jomtien & Sattahip', desc: 'Water parks, resort pools, marina family days.' },
  ],
  'best-dive-operators-pattaya': [
    { slug: 'best-gym-sattahip-pattaya', title: 'South pier corridor', desc: 'Na Jomtien marina and dive launch points.' },
    { slug: 'best-gym-jomtien-pattaya', title: 'Jomtien base', desc: 'Stay south, taxi to Bali Hai pier.' },
    { slug: 'family-friendly-pattaya', title: 'Family-friendly', desc: 'Combine dive days with kid activities.' },
  ],
};

function card({ slug, title, desc }) {
  return `
      <a href="/guides/${slug}/" class="cat-venue-card editorial-funnel-card">
        <div class="cv-head"><h3>${title}</h3><span class="cv-pill">Editorial</span></div>
        <p>${desc}</p>
        <span class="cv-cta">Read guide →</span>
      </a>`;
}

function inject(html, slug) {
  const picks = FUNNEL_BY_GUIDE[slug];
  if (!picks) return null;
  if (html.includes(MARKER)) return null;

  const block = `<!-- ${MARKER} -->` + picks.map(card).join('');
  const re = /(<section class="guide-related"[^>]*>\s*<h2[^>]*>Related[^<]*<\/h2>\s*<div class="cat-venue-grid">)/;
  if (!re.test(html)) return null;
  return html.replace(re, `$1\n${block}`);
}

let n = 0;
const guidesDir = path.join(ROOT, 'guides');
for (const ent of fs.readdirSync(guidesDir, { withFileTypes: true })) {
  if (!ent.isDirectory() || EDITORIAL.has(ent.name)) continue;
  const picks = FUNNEL_BY_GUIDE[ent.name];
  if (!picks) continue;
  const fp = path.join(guidesDir, ent.name, 'index.html');
  if (!fs.existsSync(fp)) continue;
  const html = fs.readFileSync(fp, 'utf8');
  const next = inject(html, ent.name);
  if (next) {
    fs.writeFileSync(fp, next, 'utf8');
    n++;
    console.log(`  /guides/${ent.name}/ funnel links added`);
  }
}

console.log(`Editorial funnel: ${n} ranked guides updated.`);
