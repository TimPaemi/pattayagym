#!/usr/bin/env node
/**
 * deepen-walking-street-guide.js
 * Adds walking-distance + Soi reference section to the Walking Street guide.
 * Idempotent — skips if section marker already present.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GUIDE = path.join(ROOT, 'guides', 'best-gyms-near-walking-street-pattaya', 'index.html');
const MARKER = 'Walking distance reference — from Walking Street south end';
const TODAY = new Date().toISOString().slice(0, 10);

const SECTION = `
  <section class="tldr" aria-labelledby="walk-dist-h" style="margin: var(--s-6) 0;">
    <h2 id="walk-dist-h">Walking distance reference — from Walking Street south end</h2>
    <p style="margin: 0 0 var(--s-4); color: var(--text-2); line-height: 1.65;">Distances are on-foot from the Bali Hai Pier / Walking Street footpath junction (south end of Walking Street where it meets Beach Road). Times assume normal Pattaya heat — add 2–3 minutes if you're walking mid-day in April.</p>
    <ul style="line-height: 1.75; color: var(--text-2); padding-left: 1.25rem;">
      <li><strong><a href="/gyms/tonys-gym/">Tony's Gym</a></strong> — Soi Diana (Soi 13 off 2nd Road). ~450 m · 6–8 min. Walk north along the footpath, turn right at the Soi Diana arch.</li>
      <li><strong><a href="/gyms/megabreak-pool-hall/">Megabreak Pool Hall</a></strong> — same Soi Diana corridor as Tony's. ~500 m · 7–9 min.</li>
      <li><strong><a href="/gyms/coco-fitness/">Coco Fitness</a></strong> — Mike Shopping Mall, Beach Road (north side). ~650 m · 8–10 min along Beach Road footpath.</li>
      <li><strong><a href="/gyms/fitness-7/">Fitness 7 (The Avenue)</a></strong> — 2nd Road, parallel to Beach Road one block inland. ~800 m · 10–12 min via Soi Post Office or Beach Road cut-through.</li>
      <li><strong><a href="/gyms/jetts-fitness-pattaya/">Jetts Fitness</a></strong> — Little Walk / Soi Buakhao belt. ~1.1 km · 12–15 min. Faster via baht-bus on 2nd Road (฿10).</li>
      <li><strong><a href="/gyms/universe-gym/">Universe Gym</a></strong> — Soi Buakhao. ~1.2 km · 14–16 min walk; 5 min baht-bus from 2nd Road.</li>
      <li><strong><a href="/gyms/battle-conquer-gym/">Battle Conquer Gym</a></strong> — Central Pattaya / Pattaya Tai. ~1.4 km · 16–20 min walk; baht-bus recommended in heat.</li>
      <li><strong><a href="/gyms/wko-muay-thai/">WKO Muay Thai (ISS Gym)</a></strong> — Pattaya Klang / Soi Arunothai. ~1.8 km · 22–25 min walk; 8 min baht-bus on 2nd Road northbound.</li>
      <li><strong><a href="/gyms/siam-bayshore-tennis/">Siam Bayshore tennis</a></strong> — Beach Road, south Walking Street block. ~300 m · 4–5 min. Closest racquet option.</li>
    </ul>
    <h3 style="margin: var(--s-5) 0 var(--s-3); font-size: 1.05rem;">Soi numbers you'll hear</h3>
    <ul style="line-height: 1.75; color: var(--text-2); padding-left: 1.25rem;">
      <li><strong>Soi 13 / Soi Diana</strong> — Tony's Gym, Megabreak, guesthouse belt between Beach Road and 2nd Road.</li>
      <li><strong>Soi Buakhao</strong> — one block east of 2nd Road; Jetts, Universe, LK Metro nightlife zone, budget hotels.</li>
      <li><strong>Soi Lengkee / Soi 8</strong> — hotel corridor between Beach Road and 2nd Road; good base for walkable gym access.</li>
      <li><strong>Soi Post Office</strong> — cut-through from Beach Road to 2nd Road near The Avenue / Fitness 7.</li>
      <li><strong>LK Metro</strong> — entertainment complex off Soi Buakhao; walkable but loud after 22:00.</li>
    </ul>
    <p style="margin: var(--s-4) 0 0; font-size: 13px; color: var(--muted);">Tip: baht-bus (songthaew) on Beach Road or 2nd Road costs ฿10 per ride — faster than walking in heat for anything beyond Soi Diana.</p>
  </section>
`;

const FAQ = `<details class="faq-item"><summary>Which Soi is closest to Walking Street for gyms?</summary><p>Soi Diana (Soi 13) is the closest gym corridor — Tony's Gym and Megabreak are 6–8 minutes on foot. Soi Buakhao (Jetts, Universe) is the next belt, 12–16 minutes walk or 5 minutes by baht-bus on 2nd Road.</p></details>`;

let html = fs.readFileSync(GUIDE, 'utf8');
if (html.includes(MARKER)) {
  console.log('Walking Street guide already deepened — skipped.');
  process.exit(0);
}

const anchor = '<h2>🚶 Closest walkable gyms</h2>';
if (!html.includes(anchor)) {
  console.error('Anchor not found in Walking Street guide');
  process.exit(1);
}
html = html.replace(anchor, SECTION + '\n    ' + anchor);

if (!html.includes('Which Soi is closest to Walking Street')) {
  html = html.replace(
    '<details class="faq-item"><summary>What is the closest gym to Walking Street?</summary>',
    FAQ + '<details class="faq-item"><summary>What is the closest gym to Walking Street?</summary>'
  );
}

html = html.replace(/Updated <time datetime="[^"]+">[^<]+<\/time>/, `Updated <time datetime="${TODAY}">${TODAY}</time>`);
html = html.replace(/"dateModified":"[^"]+"/, `"dateModified":"${TODAY}"`);

fs.writeFileSync(GUIDE, html, 'utf8');
console.log('Walking Street guide deepened with distance + Soi reference.');
