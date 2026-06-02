#!/usr/bin/env node
/**
 * deepen-round68-family-ranked.js — Tier B family guides → Tier A depth (≥1200w target).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'deepen-r68-block';

const BLOCKS = {
  'family-friendly-pattaya': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-fam-h">
  <h2 id="${MARKER}-fam-h" class="guide-rank-section">Sample one-week family sport itinerary</h2>
  <p><strong>Day 1–2 (arrival):</strong> Jomtien beach volleyball or calm swim at <a href="/gyms/wong-amat-beach/">Wong Amat</a> — avoid central Walking Street noise with toddlers. <strong>Day 3:</strong> Harbor Mall trampoline (<a href="/gyms/jumpz-trampoline-park/">Jumpz</a> / <a href="/gyms/bounce-pattaya/">BOUNCE</a>) morning, parent lifts at nearby <a href="/guides/best-gym-jomtien-pattaya/">Jomtien gym</a> while one parent supervises. <strong>Day 4:</strong> Water park — <a href="/gyms/ramayana-water-park/">Ramayana</a> or resort day-pass from <a href="/guides/swimming-pools-pattaya/">swimming guide</a>. <strong>Day 5:</strong> Football trial at <a href="/gyms/af-academy-pattaya/">AF Academy</a> (from age 3). <strong>Day 6–7:</strong> Rest or gentle <a href="/guides/equestrian-pattaya/">riding</a> on Mabprachan belt.</p>
  <h3>Budget bands (family of four, sport only)</h3>
  <ul>
    <li><strong>฿</strong> — Public pool + beach + one trampoline session (~฿2,000–4,000/week sport spend).</li>
    <li><strong>฿฿</strong> — Mix academies + hotel day-pass pool (~฿8,000–15,000).</li>
    <li><strong>฿฿฿+</strong> — Resort kids club + water park + private tennis — see <a href="/guides/luxury-sports-clubs-pattaya/">luxury clubs</a>.</li>
  </ul>
  <h3>Long-stay families</h3>
  <p>School placement drives neighbourhood choice — use <a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a> before signing a 12-month lease. Visa context: <a href="/guides/training-thailand-visa-pattaya/">training &amp; visa guide</a>. Housing: <a href="https://pattayavilla.com/" target="_blank" rel="noopener noreferrer">Pattaya Villa</a>.</p>
  <p>Compare venues: <a href="/compare/">compare tool</a> · Plan trip: <a href="/plan-my-trip/">plan my trip</a> · Kids hub: <a href="/guides/kids-youth-sport-pattaya/">kids &amp; youth sport</a>.</p>
  <h3>Red flags for family venues</h3>
  <p>Walk away from operators who refuse written supervision rules, have no first-aid kit visible, or push hard sparring for children under 12. Pattaya is generally family-welcoming, but nightlife-adjacent central gyms are poor evening choices with toddlers — prefer Jomtien or Naklua belts listed in our area guides. Re-verify pool depth and lifeguard presence on arrival — our directory dates are rolling, not live CCTV.</p>
</section>`,
  'pattaya-gyms-childcare-family-pools': `
<section class="guide-editorial-depth" id="${MARKER}" aria-labelledby="${MARKER}-cc-h">
  <h2 id="${MARKER}-cc-h" class="guide-rank-section">Morning training window — realistic playbook</h2>
  <p><strong>06:30–08:00</strong> — Parent A: pad session or gym weights. Parent B: kids breakfast + hotel pool splash (no lesson needed). <strong>09:00–11:00</strong> — Swap: Parent B trains; kids at football academy drop-off (AF Academy, Rusich) or swim lesson — confirm pickup policy in writing. <strong>11:30–14:00</strong> — Family lunch + AC break (critical May–October heat). <strong>16:00+</strong> — One structured activity only (trampoline, water park) — avoid stacking evening Muay Thai sparring for both parents same day.</p>
  <h3>Hotel vs standalone gym</h3>
  <p><a href="/gyms/cross-pattaya-pratamnak/">Cross Pattaya Pratamnak</a> is the clearest “gym + PLAYROOM + pool” bundle in our directory. Large resorts (<a href="/gyms/centara-grand-mirage/">Centara Mirage</a>, Na Jomtien Marriott/Renaissance) trade higher day-pass cost for supervised kids zones. Standalone iron gyms rarely offer childcare — do not assume front-desk babysitting.</p>
  <h3>Pool day-pass etiquette</h3>
  <p>Call ahead: many hotels allow non-guest pool access 10:00–17:00 with food minimum or ฿300–800/adult. Bring rash guards for kids; Pattaya sun is intense 11:00–15:00. Full swim map: <a href="/guides/swimming-pools-pattaya/">swimming &amp; pools guide</a>.</p>
  <h3>When things go wrong</h3>
  <p>Minor injuries: <a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a> directory. Rain backup: Harbor Mall indoor stack. Broader family days: <a href="/guides/family-friendly-pattaya/">family-friendly guide</a>.</p>
  <h3>Documentation to ask on arrival</h3>
  <p>Get WhatsApp contact for kids coach, written pool depth rules, and allergy policy if snacks are served. For multi-hour football academies, confirm whether parents must stay on-site — policies vary by age band and location.</p>
  <h3>Pairing with adult training</h3>
  <p>If both parents train Muay Thai, stagger sessions: one parent mornings, one evenings, never overlapping when only one adult supervises. Camps with on-site rooms (<a href="/guides/muay-thai-camps-with-accommodation-pattaya/">stay-and-train guide</a>) reduce taxi logistics. Use <a href="/compare/">compare</a> to line up gym hours vs kids academy schedules before you book accommodation.</p>
  <p>Teenagers (13+) can often join adult gym sessions with induction — confirm house rules first. Younger children should stay in tagged kids-youth or swimming venues; filter the <a href="/category/kids-youth/">kids category</a> for structured programmes.</p>
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
    console.log(`  + ${slug}`);
    n++;
  }
}
console.log(`deepen-round68-family-ranked: ${n} guide(s).`);
