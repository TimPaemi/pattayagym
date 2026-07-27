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
  <details><summary>Which Central Pattaya gym publishes current membership prices?</summary><p><a href="/gyms/coco-fitness/">Coco Fitness</a> published one-, three-, six- and twelve-month prices checked on 26 July 2026. Its page did not publish a current day-pass amount, so one-off access still requires confirmation.</p></details>
  <details><summary>Can a visitor register at a 24-hour gym overnight?</summary><p>Do not assume so. Fitness 7 publishes 24-hour operation, while Jetts and Anytime distinguish member access from staffed service. A first-time visitor should ask for the registration window, price and access-card procedure; see the <a href="/guides/24-hour-gyms-pattaya/">24-hour gym guide</a>.</p></details>
  <details><summary>Where can I compare gym access with a Muay Thai class?</summary><p><a href="/gyms/wko-muay-thai/">ISS Boxing and Muay Thai</a> publishes separate prices for general gym access, boxing/Muay Thai classes and its recovery room. Use the exact product and date instead of comparing the lowest headline number.</p></details>
</section>`,
  'best-gym-sattahip-pattaya': `
<section class="guide-faq" aria-labelledby="guide-faq-h">
  <h2 id="guide-faq-h">Frequently asked questions</h2>
  <details><summary>Which Sattahip-area gym publishes current membership prices?</summary><p><a href="/gyms/better-bodies-gym-na-jomtien/">Better Bodies Gym</a> published ฿2,500 for three months and ฿4,500 for six months, checked on 25 July 2026. It did not publish a day-pass price, so short access still requires confirmation.</p></details>
  <details><summary>Can non-guests use Na Jomtien resort gyms?</summary><p>Do not assume so. The current Andaz, Pattaya Marriott, Mövenpick and Renaissance records document hotel fitness amenities but no stable public gym day pass. Ask the named resort for a dated outside-guest product before travelling.</p></details>
  <details><summary>Why do some Na Jomtien venues appear under Jomtien instead of Sattahip?</summary><p>The directory assigns each venue to the first area pattern its location matches. Na Jomtien therefore matches the Jomtien page before the later Sattahip rule. This guide intentionally combines the four direct <a href="/area/sattahip/">Sattahip-filter records</a> with relevant southern records from the <a href="/area/jomtien/">Jomtien filter</a>.</p></details>
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
