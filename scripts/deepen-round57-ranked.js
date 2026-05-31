#!/usr/bin/env node
/**
 * deepen-round57-ranked.js — Rusich + Russian-community editorial depth.
 * Idempotent marker: deepen-r57-block
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'deepen-r57-block';

const BLOCKS = {
  'pattaya-russian-speaking-sport': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-ru-h">
  <h2 id="${MARKER}-ru-h" class="guide-rank-section">Rusich Club &amp; Russian-community sport</h2>
  <p>Pattaya's Russian-speaking corridor runs <strong>Naklua → Wongamat → Pratamnak → Jomtien</strong>. Several venues confirm Russian coaching or bilingual staff — this block maps the highest-signal picks, not every gym with a Russian member.</p>
  <h3>Football &amp; kids</h3>
  <ul>
    <li><strong><a href="/gyms/rusich-club-football/">Rusich Club</a></strong> — Russian-language football coaching, ages 5–16, Naklua belt. Primary pick for Russian-speaking families wanting structured youth football.</li>
    <li><strong><a href="/gyms/af-academy-football/">AF Academy</a></strong> — trilingual English/Russian/Thai, accepts from age 3, multi-location. Pairs with <a href="/guides/kids-youth-sport-pattaya/">kids &amp; youth sport guide</a>.</li>
    <li><strong><a href="/gyms/fast-pro-football-academy/">FAST PRO Football Academy</a></strong> — competitive youth pathway; verify language on trial day.</li>
  </ul>
  <h3>Fitness &amp; yoga</h3>
  <ul>
    <li><strong><a href="/gyms/platinum-fitness/">Platinum Fitness</a></strong> — Russian-speaking front desk common; central drop-in friendly.</li>
    <li><strong><a href="/gyms/elite-gym-fitness/">Elite Gym Fitness</a></strong> — multilingual staff, Naklua corridor.</li>
    <li><strong><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a></strong> — English/Russian/Thai instruction on Thepprasit; see <a href="/guides/yoga-retreat-pattaya/">yoga retreat guide</a>.</li>
    <li><strong><a href="/gyms/castra-gym/">Castra Gym</a></strong> — East Pattaya iron with Russian long-stayer traffic.</li>
  </ul>
  <h3>Muay Thai &amp; watersports</h3>
  <p>Many camps train Eastern European long-stayers daily — start with <a href="/guides/english-speaking-muay-thai-pattaya/">English-speaking camps</a> (often multilingual) and <a href="/guides/best-muay-thai-pattaya/">best Muay Thai ranked list</a>. Kite: <a href="/gyms/kba-kiteboarding-pattaya/">KBA Kiteboarding</a>. Diving with Russian staff: <a href="/gyms/adventure-divers-pattaya/">Adventure Divers</a>.</p>
  <h3>Long-stay logistics</h3>
  <p>Visa and DTV questions: <a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a>. Social evenings: <a href="/guides/snooker-pool-billiards-pattaya/">pool &amp; snooker guide</a> · <a href="/guides/running-cycling-clubs-pattaya/">running &amp; clubs</a>.</p>
</section>`,
};

function inject(slug, block) {
  const fp = path.join(ROOT, 'guides', slug, 'index.html');
  if (!fs.existsSync(fp)) return false;
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes(MARKER)) {
    html = html.replace(new RegExp(`<section class="guide-editorial-depth" id="${MARKER}"[\\s\\S]*?</section>`, 'm'), block.trim());
  } else {
    const anchor = '<div id="full-list"></div>';
    if (!html.includes(anchor)) return false;
    html = html.replace(anchor, block + '\n  ' + anchor);
  }
  fs.writeFileSync(fp, html, 'utf8');
  return true;
}

let n = 0;
for (const [slug, block] of Object.entries(BLOCKS)) {
  if (inject(slug, block)) {
    n++;
    console.log(`  /guides/${slug}/ deepened (r57)`);
  }
}
console.log(`Round 57 ranked deepen: ${n} guides.`);
