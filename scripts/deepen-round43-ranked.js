#!/usr/bin/env node
/**
 * deepen-round43-ranked.js — Editorial depth blocks for 24-hour and cheapest ranked guides.
 * Idempotent marker: deepen-r43-block
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'deepen-r43-block';

const BLOCKS = {
  '24-hour-gyms-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-24h-h">
  <h2 id="${MARKER}-24h-h" class="guide-rank-section">Who needs 24-hour gyms in Pattaya?</h2>
  <p>Pattaya's heat peaks 11:00–15:00 — many fighters and lifters shift sessions to 21:00–01:00. Night-shift hospitality workers, bar staff, and casino-adjacent staff rely on true 24/7 clubs (<a href="/gyms/jetts-fitness-pattaya/">Jetts</a>, <a href="/gyms/anytime-fitness-pattaya/">Anytime</a>, <a href="/gyms/fitness-7/">Fitness 7</a>). Jet-lagged arrivals from Europe often train at 04:00 local before their body clock adjusts.</p>
  <p><strong>Hotel gyms</strong> (Hilton, Andaz, Marriott) advertise 24-hour fitness but may require guest status or day-pass approval — confirm on each <a href="/guides/luxury-sports-clubs-pattaya/">luxury sports club</a> page before you plan a 03:00 session.</p>
  <h3>Central vs Jomtien for late nights</h3>
  <p>Central Pattaya chains are walkable from Beach Road hotels. Jomtien resort gyms suit Na Jomtien long-stayers who want pool access after lifting. Area context: <a href="/guides/best-gym-central-pattaya/">Central Pattaya guide</a> · <a href="/guides/best-gym-jomtien-pattaya/">Jomtien guide</a>.</p>
  <h3>Safety at odd hours</h3>
  <p>Chain gyms use key-fob entry — safer than empty street-level iron rooms. Train with a buddy if walking back through central nightlife zones after midnight. Scooter parking: Pattaya Vehicle Rentals.</p>
  <p>Pair with <a href="/guides/gym-day-pass-pattaya/">gym day pass</a> if you only need one late session · Budget alternative hours: <a href="/guides/cheapest-gyms-pattaya/">cheapest gyms</a> (many close 22:00–23:00).</p>
</section>`,
  'cheapest-gyms-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-cheap-h">
  <h2 id="${MARKER}-cheap-h" class="guide-rank-section">How to read Pattaya gym pricing</h2>
  <p>Pattaya uses four tiers in our directory: ฿ (budget), ฿฿ (mid), ฿฿฿ (premium camp/resort), ฿฿฿฿ (luxury hotel). The table below shows parsed drop-in and monthly figures where venues publish them — always confirm at the gym; seasonal tourist rates shift.</p>
  <h3>Free and nearly-free options</h3>
  <ul>
    <li><a href="/gyms/pratumnak-fitness-park/">Pratumnak Fitness Park</a> — outdoor calisthenics, free.</li>
    <li><a href="/gyms/pattaya-public-pool-jomtien/">Jomtien Public Pool</a> and <a href="/gyms/pattaya-public-pool-naklua/">Naklua Public Pool</a> — municipal swim access, low entry fee.</li>
    <li>Beach running — Jomtien and Wong Amat at sunrise; see <a href="/guides/best-gym-jomtien-pattaya/">Jomtien guide</a>.</li>
  </ul>
  <h3>Best value monthly memberships</h3>
  <p><a href="/gyms/tonys-gym/">Tony's Gym</a> and <a href="/gyms/sun-fitness-buakao/">SUN Fitness</a> (multi-branch) anchor the ฿ tier for serious lifters. <a href="/gyms/wko-muay-thai/">WKO Muay Thai</a> remains the benchmark ~฿4,000/month Muay Thai value in central Pattaya — compare with resort camps in <a href="/guides/best-muay-thai-pattaya/">best Muay Thai</a>.</p>
  <h3>Hidden costs to ask about</h3>
  <p>Locker deposit, towel rental, air-con surcharge at some mall gyms, and "registration fee" on first visit. <a href="/guides/thai-gym-terms-pattaya/">Thai gym terms</a> covers price questions (<em>tao rai?</em>). Short-stay without monthly commitment: <a href="/guides/gym-day-pass-pattaya/">gym day pass guide</a>.</p>
  <p>Area-specific budget picks: <a href="/guides/best-gym-central-pattaya/">Central Pattaya</a> · <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua &amp; Pratamnak</a> · <a href="/compare/">Compare side-by-side</a>.</p>
</section>`,
};

function inject(slug, block) {
  const fp = path.join(ROOT, 'guides', slug, 'index.html');
  if (!fs.existsSync(fp)) {
    console.warn(`  skip ${slug} — missing`);
    return false;
  }
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes(MARKER)) {
    html = html.replace(new RegExp(`<section class="guide-editorial-depth" id="${MARKER}"[\\s\\S]*?</section>`, 'm'), block.trim());
  } else {
    const anchor = '<div id="full-list"></div>';
    if (!html.includes(anchor)) {
      console.warn(`  skip ${slug} — anchor missing`);
      return false;
    }
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
console.log(`Round 43 ranked deepen: ${n} guides.`);
