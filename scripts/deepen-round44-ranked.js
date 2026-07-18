#!/usr/bin/env node
/**
 * deepen-round44-ranked.js — Editorial depth for beginners, family, female ranked guides.
 * Idempotent marker: deepen-r44-block
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'deepen-r44-block';

const BLOCKS = {
  'best-for-beginners-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-beg-h">
  <h2 id="${MARKER}-beg-h" class="guide-rank-section">How we define "beginner-friendly"</h2>
  <p>A venue makes this list if it accepts first-timers without prior experience, explains equipment or rules in English (or patiently in Thai), and does not pressure hard sparring or upsells on day one. Muay Thai beginners should start with the dedicated <a href="/guides/muay-thai-pattaya-beginners/">Muay Thai beginners guide</a> — this page covers <strong>all sports</strong>.</p>
  <h3>Muay Thai first-timers</h3>
  <p>Resort camps (<a href="/gyms/fairtex-pattaya/">Fairtex</a>, <a href="/gyms/kombat-group-thailand/">Kombat Group</a>) and comfort gyms (<a href="/gyms/battle-conquer-gym/">Battle Conquer</a>) lead for hand-holding. Budget walk-in test: <a href="/gyms/pattaya-thai-boxing-fitness/">Jomtien Thai Boxing</a> ~฿300. Safety context: <a href="/guides/is-muay-thai-safe-pattaya/">is Muay Thai safe?</a></p>
  <h3>First time in a commercial gym</h3>
  <p>Chain gyms (<a href="/gyms/jetts-fitness-pattaya/">Jetts</a>, <a href="/gyms/anytime-fitness-pattaya/">Anytime</a>) offer orientation tours. Budget iron: <a href="/gyms/coco-fitness/">Coco Fitness</a> Mike Mall day pass with towel included. Free outdoor: <a href="/gyms/pratumnak-fitness-park/">Pratumnak Fitness Park</a>.</p>
  <h3>Try before you commit</h3>
  <p><a href="/guides/gym-day-pass-pattaya/">Gym day pass guide</a> · <a href="/compare/">Compare venues</a> · Area picks: <a href="/guides/best-gym-central-pattaya/">Central</a> · <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> · <a href="/guides/best-gym-east-pattaya/">East Pattaya</a></p>
</section>`,
  'family-friendly-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-fam-h">
  <h2 id="${MARKER}-fam-h" class="guide-rank-section">Planning sport with kids in Pattaya</h2>
  <p>Families split into two needs: <strong>kids active while parents train</strong> vs <strong>everyone doing sport together</strong>. This guide lists both — water parks, football academies, resort kids clubs, and public pools.</p>
  <h3>Parents who need a training window</h3>
  <p><a href="/guides/pattaya-gyms-childcare-family-pools/">Childcare &amp; family pools guide</a> covers hotels and clubs with kids zones while you lift or swim laps. <a href="/gyms/cross-pattaya-pratamnak/">Cross Pattaya Pratamnak</a> bundles gym + PLAYROOM kids zone + pool.</p>
  <h3>All-ages active days</h3>
  <p><a href="/gyms/ramayana-water-park/">Ramayana Water Park</a> (day trip south) · <a href="/gyms/centara-grand-mirage/">Centara Grand Mirage</a> water park · <a href="/gyms/jumpz-trampoline-park/">Jumpz Trampoline</a> · beach volleyball <a href="/gyms/jomtien-beach-volleyball/">Jomtien</a>.</p>
  <h3>Where to stay</h3>
  <p>Jomtien and Naklua beat central Pattaya for family sleep quality. Area guides: <a href="/guides/best-gym-jomtien-pattaya/">Jomtien</a> · <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua</a>. Schools: Pattaya School Guide.</p>
</section>`,
  'female-friendly-gyms-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-ff-h">
  <h2 id="${MARKER}-ff-h" class="guide-rank-section">What "female-friendly" means here</h2>
  <p>We list venues where women routinely train alone without harassment, staff speak enough English to adjust sessions, and facilities (locks, hours, lighting) feel safe — not "pink dumbbell" marketing. Deeper solo-travel context: <a href="/guides/pattaya-solo-female-fitness/">solo female fitness guide</a>.</p>
  <h3>Muay Thai for women</h3>
  <p><a href="/gyms/fairtex-pattaya/">Fairtex</a>, <a href="/gyms/battle-conquer-gym/">Battle Conquer</a>, and <a href="/gyms/kombat-group-thailand/">Kombat Group</a> regularly host solo female long-stayers. Beginner expectations: <a href="/guides/muay-thai-pattaya-beginners/">Muay Thai beginners</a> · <a href="/guides/is-muay-thai-safe-pattaya/">safety guide</a>.</p>
  <h3>Commercial gyms</h3>
  <p>Air-con chains (<a href="/gyms/platinum-fitness/">Platinum</a>, <a href="/gyms/jetts-fitness-pattaya/">Jetts</a>, <a href="/gyms/anytime-fitness-pattaya/">Anytime</a>) with key-fob entry suit early-morning or late-night solo sessions. Yoga studios: <a href="/guides/yoga-retreat-pattaya/">yoga retreat guide</a>.</p>
  <h3>Areas women often prefer</h3>
  <p>Jomtien and Pratamnak over central nightlife zones for long stays — <a href="/guides/best-gym-jomtien-pattaya/">Jomtien guide</a> · <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Pratamnak guide</a>. Medical backup: Pattaya Medical.</p>
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
    console.log(`  /guides/${slug}/ deepened`);
  }
}
console.log(`Round 44 ranked deepen: ${n} guides.`);
