#!/usr/bin/env node
/**
 * inject-area-guide-faq-r74.js — Add guide-faq sections to area guides missing FAQ-shaped content.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const BLOCKS = {
  'best-gym-central-pattaya': `
<section class="guide-faq" aria-labelledby="guide-faq-h">
  <h2 id="guide-faq-h">Frequently asked questions</h2>
  <details><summary>What is the best gym in Central Pattaya?</summary><p>For commercial iron, <a href="/gyms/fitness-7/">Fitness 7 @ The Avenue</a> and <a href="/gyms/jetts-fitness-pattaya/">Jetts Little Walk</a> lead on hours and equipment. For Muay Thai on a budget, <a href="/gyms/wko-muay-thai/">WKO</a> is the default central camp.</p></details>
  <details><summary>Is Central Pattaya good for Muay Thai tourists?</summary><p>Yes for walk-in density — but verify pricing before signing Beach Road packages. Pair our <a href="/guides/is-muay-thai-safe-pattaya/">safety guide</a> with venue pages; air-con comfort seekers should look at <a href="/gyms/battle-conquer-gym/">Battle Conquer</a>.</p></details>
  <details><summary>Are there 24-hour gyms in Central Pattaya?</summary><p>Yes — see <a href="/guides/24-hour-gyms-pattaya/">24-hour gyms guide</a>. Jetts, Anytime, and Fitness 7 cover most central hotel zones without a scooter.</p></details>
  <details><summary>Should I stay in Central or move to Jomtien?</summary><p>Central wins for 3–7 night trips tied to Beach Road hotels. Long-stayers often relocate to <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> or <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua</a> for sleep quality — compare commutes before you sign a lease.</p></details>
</section>`,
  'best-gym-sattahip-pattaya': `
<section class="guide-faq" aria-labelledby="guide-faq-h">
  <h2 id="guide-faq-h">Frequently asked questions</h2>
  <details><summary>What gyms are in Sattahip and far south Pattaya?</summary><p>Ramayana Water Park, Cartoon Network Aquaverse, Regents school sport, Thai Sky Adventures skydive, Bira Circuit, and golf toward Phoenix / Treasure Hill belts. Hub: <a href="/area/sattahip/">Sattahip area</a>.</p></details>
  <details><summary>Is Sattahip good for a training holiday base?</summary><p>Strong for golf, water parks, and quiet residential training — weak for nightly Beach Road convenience. Many fighters stay central or Jomtien and day-trip south for adventure.</p></details>
  <details><summary>How far is Sattahip from central Pattaya?</summary><p>20–40 minutes by car depending on venue — plan taxis or rent from <a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a>. U-Tapao airport (UTP) sits inside the district for arrivals.</p></details>
  <details><summary>Where should families train in the south belt?</summary><p><a href="/gyms/ramayana-water-park/">Ramayana</a> and resort pools — pair with <a href="/guides/family-friendly-pattaya/">family-friendly guide</a>. Confirm child height rules before booking karting or skydive add-ons.</p></details>
</section>`,
};

let n = 0;
for (const [slug, block] of Object.entries(BLOCKS)) {
  const fp = path.join(ROOT, 'guides', slug, 'index.html');
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('class="guide-faq"')) continue;
  const anchor = '<section class="section sister-context';
  if (!html.includes(anchor)) continue;
  html = html.replace(anchor, block.trim() + '\n\n' + anchor);
  fs.writeFileSync(fp, html, 'utf8');
  console.log(`  + FAQ section ${slug}`);
  n++;
}
console.log(`inject-area-guide-faq-r74: ${n} guide(s).`);
