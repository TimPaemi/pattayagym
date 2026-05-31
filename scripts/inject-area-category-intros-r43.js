#!/usr/bin/env node
/**
 * inject-area-category-intros-r43.js — Local intro paragraphs on area×category pages.
 * Run after build-v2.js + inject-internal-linking-r41.js. Idempotent: area-cat-intro-r43
 */

const fs = require('fs');
const path = require('path');
const { GYMS, CATEGORIES } = require('../data.js');

const ROOT = path.resolve(__dirname, '..');
const MARKER = 'area-cat-intro-r43';

const AREA_SLUGS = ['jomtien', 'naklua', 'pratamnak', 'central-pattaya', 'east-pattaya', 'sattahip'];
const AREA_LABEL = {
  'jomtien': 'Jomtien Beach',
  'naklua': 'Naklua / North Pattaya',
  'pratamnak': 'Pratamnak Hill',
  'central-pattaya': 'Central Pattaya',
  'east-pattaya': 'East Pattaya / Darkside',
  'sattahip': 'Sattahip / Far South',
};

const AREA_MAP = {
  'jomtien': /jomtien/i,
  'naklua': /naklua|north\s*pattaya|wongamat/i,
  'pratamnak': /pratamnak|pratumnak/i,
  'central-pattaya': /central|beach\s*road|walking|soi\s*buakhao|3rd\s*road|mike|south\s*pattaya|pattaya\s*klang/i,
  'east-pattaya': /east|darkside|mabprachan|nong\s*prue|sukhumvit|huai\s*yai|chai\s*ngam/i,
  'sattahip': /sattahip|na\s*jomtien|bang\s*saray|bang\s*sare|u-tapao/i,
};

function areaSlugFor(areaStr) {
  if (!areaStr) return null;
  for (const [slug, re] of Object.entries(AREA_MAP)) {
    if (re.test(areaStr)) return slug;
  }
  return null;
}

const CAT_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.key, c.label]));

const CUSTOM = {
  'central-pattaya|muay-thai': 'Central Pattaya holds WKO on Pattaya Klang, Battle Conquer near the beach, and Tony\'s Gym for pure iron — the highest walk-in Muay Thai density in the city. <a href="/guides/best-gym-central-pattaya/">Central gym guide</a> · <a href="/guides/is-muay-thai-safe-pattaya/">MT safety</a>.',
  'central-pattaya|fitness': 'Every major chain gym in Pattaya clusters central — Jetts, Anytime, Fitness 7, Platinum, Coco at Mike Mall. True 24-hour access lives here. <a href="/guides/best-gym-central-pattaya/">Central gym guide</a> · <a href="/guides/24-hour-gyms-pattaya/">24-hour gyms</a>.',
  'jomtien|muay-thai': 'Jomtien and Na Jomtien run Venum, Rage Fight Academy, and the legendary ~฿300 walk-in pad gym on the beach road. Quieter than central for two-a-day training. <a href="/guides/best-gym-jomtien-pattaya/">Jomtien gym guide</a>.',
  'jomtien|yoga': 'Jomtien and Thepprasit Road host Pattaya\'s strongest yoga studio cluster — morning flow before beach heat. <a href="/guides/yoga-retreat-pattaya/">Yoga retreat guide</a>.',
  'naklua|muay-thai': 'Naklua is Fairtex and Sityodtong territory — resort camps and lineage gyms on North Pattaya Road. <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Naklua &amp; Pratamnak guide</a>.',
  'pratamnak|fitness': 'Pratamnak Hill is Muscle Factory and SUN Fitness — bodybuilding culture with sea-view condos. <a href="/guides/best-gym-naklua-pratamnak-pattaya/">Pratamnak gym guide</a>.',
  'pratamnak|racquet': 'Pratamnak is Pattaya\'s padel and pickleball hub — Play Padel, Pickleball Pattaya, Fitz Club tennis. <a href="/guides/padel-pickleball-pattaya/">Padel &amp; pickleball guide</a>.',
  'east-pattaya|muay-thai': 'East Pattaya and Huai Yai hold Kombat Group and Sor Klinmee — rural camp settings away from Beach Road noise. <a href="/guides/best-gym-east-pattaya/">East Pattaya gym guide</a> · <a href="/guides/muay-thai-camps-with-accommodation-pattaya/">Stay-and-train camps</a>.',
  'east-pattaya|fitness': 'Nong Prue and Khao Talo run Castra Gym and Sanit Sport Club\'s fitness wing — less tourist traffic than central chains. <a href="/guides/best-gym-east-pattaya/">East Pattaya guide</a>.',
  'east-pattaya|crossfit': 'Pattaya\'s only CrossFit affiliate lives east at Jungle Gym Nong Prue. <a href="/guides/best-gym-east-pattaya/">East Pattaya guide</a>.',
};

function introText(areaSlug, catKey, count) {
  const key = `${areaSlug}|${catKey}`;
  if (CUSTOM[key]) return CUSTOM[key];
  const area = AREA_LABEL[areaSlug] || areaSlug;
  const cat = CAT_LABEL[catKey] || catKey;
  if (count === 0) {
    return `No ${cat.toLowerCase()} venues are currently listed in ${area} — browse <a href="/category/${catKey}/">all ${cat.toLowerCase()} in Pattaya</a> or <a href="/area/${areaSlug}/">all ${area} venues</a>.`;
  }
  return `${count} hand-checked ${cat.toLowerCase()} venue${count === 1 ? '' : 's'} in ${area}. Compare on <a href="/compare/">compare</a> or read area guides on <a href="/guides/">Pattaya.Gym guides</a>.`;
}

function block(html) {
  return `
<section class="section u-pt-0 area-cat-local-intro" id="${MARKER}">
  <div class="wrap u-max-760">
    <p class="lede">${html}</p>
  </div>
</section>`;
}

let n = 0;
for (const areaSlug of AREA_SLUGS) {
  for (const cat of CATEGORIES) {
    const fp = path.join(ROOT, 'area', areaSlug, cat.key, 'index.html');
    if (!fs.existsSync(fp)) continue;
    const venues = GYMS.filter(g => areaSlugFor(g.area) === areaSlug && g.category === cat.key);
    const text = introText(areaSlug, cat.key, venues.length);
    const section = block(text);

    let html = fs.readFileSync(fp, 'utf8');
    if (html.includes(MARKER)) {
      html = html.replace(new RegExp(`<section class="section u-pt-0 area-cat-local-intro" id="${MARKER}"[\\s\\S]*?</section>`, 'm'), section.trim());
    } else {
      const strip = html.indexOf('id="guide-strip-r41"');
      const listSection = html.indexOf('<section class="section">\n  <div class="wrap">\n    <div class="eyebrow"><span class="num">01</span> The list</div>');
      const insertAt = strip >= 0 ? html.indexOf('</section>', strip) + '</section>'.length : (listSection >= 0 ? listSection : -1);
      if (insertAt < 0) continue;
      html = html.slice(0, insertAt) + '\n\n' + section + html.slice(insertAt);
    }
    fs.writeFileSync(fp, html, 'utf8');
    n++;
  }
}
console.log(`Area×category intros (R43): ${n} pages.`);
