#!/usr/bin/env node
/**
 * sync-llms-guides.js — Rebuild ## Curated guides in llms.txt from guide folders on disk,
 * and repair any stale venue count anywhere in the file.
 *
 * SCOPE: pattaya-gym.com only.
 *
 * On the count sweep: llms.txt claimed "Full-text search across all 157 venues" on
 * 2026-07-28, against a live directory of 215. Every other surface on the site has a
 * script keeping its count honest; this file did not, because only its guide section
 * was ever regenerated. A wrong number in a machine-readable file is worse than no
 * file at all - it is the one place a model will read a figure and repeat it without
 * checking. Google's May 2026 guidance is that llms.txt does nothing for Search; it
 * stays here only because it costs nothing once it is correct.
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
llms = llms.replace(/^>[^\n]+/m, `> Source-checked directory of Pattaya gyms, Muay Thai camps and sport venues. ${n} records, ${slugs.length} guides, 15 categories and 6 areas — with dated evidence, visible gaps and no paid placements.`);
llms = llms.replace(/- \[Map\][^\n]+/, `- [Map](${SITE}/map/): First-party explorer with venue-specific stored points; centroids and fallbacks are excluded`);
if (!/\[Find coaching\]/.test(llms)) llms = llms.replace(/(- \[Map\][^\n]+\n)/, `$1- [Find coaching](${SITE}/find-my-coach/): Match training needs to venue records that publish coaching signals\n`);
llms = llms.replace(/\d+ venues, \d+ guides/g, `${n} venues, ${slugs.length} guides`);
llms = llms.replace(/## Curated guides[\s\S]*?(?=\n## Methodology)/, block + '\n');
fs.writeFileSync(LLMS, llms, 'utf8');
console.log(`sync-llms-guides: ${slugs.length} guides in llms.txt`);

/* --- count sweep -------------------------------------------------------------
   Two different kinds of number live in this file and they must not be confused.

     - the SITE TOTAL ("215 venues", "Full-text search across all 215 venues")
     - PER-CATEGORY counts on the category-link lines ("29 venues", "17 courses")

   The first pass of this sweep rewrote both to the site total, which turned every
   category line into a claim that the site has 215 fitness venues. So: the site
   total is only corrected outside the category block, and category lines are
   recomputed from data.js instead. Both are now derived, neither is typed.        */
{
  const CATS = {};
  for (const g of GYMS) CATS[g.category] = (CATS[g.category] || 0) + 1;

  const lines = fs.readFileSync(LLMS, 'utf8').split('\n');
  let siteFixed = 0, catFixed = 0;

  const out = lines.map((line) => {
    const catLink = line.match(/^- \[[^\]]+\]\(https:\/\/pattaya-gym\.com\/category\/([a-z0-9-]+)\/\):\s*(\d+)(\s+\S+)/);
    if (catLink) {
      const [, slug, shown, unit] = catLink;
      const real = CATS[slug];
      if (real === undefined || String(real) === shown) return line;
      catFixed++;
      return line.replace(/:\s*\d+(\s+\S+)/, `: ${real}$1`);
    }
    // site total - only on lines that are not category links
    const fixed = line.replace(
      /\b\d{2,4}(?=\s+(?:venues|sport venues|listings|venue pages))/g,
      (m) => { if (m !== String(n)) siteFixed++; return String(n); }
    );
    return fixed;
  });

  const before = lines.join('\n');
  const after = out.join('\n');
  if (after !== before) fs.writeFileSync(LLMS, after, 'utf8');
  console.log(`llms.txt: site total ${n} (${siteFixed} stale), category counts recomputed (${catFixed} corrected)`);
}

{
  let current = fs.readFileSync(LLMS, 'utf8');
  const promise = `## Editorial promise\n\nPattaya.Gym publishes source-checked venue records with a sources-reviewed date. Published prices carry a separate as-of date; missing tariffs, unresolved operation and imprecise locations remain visible. The site does not claim first-hand visits. No paid placements, sponsored rankings or venue affiliate commissions.\n\nPublished by Tim and Paemi / TimPaemi Co., Ltd. in Pattaya, Thailand.\n\nLast update: ${new Date().toISOString().slice(0, 10)}\n`;
  current = current.replace(/## Editorial promise[\s\S]*$/, promise);
  fs.writeFileSync(LLMS, current, 'utf8');
}
