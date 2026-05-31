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
  'pratamnak|racquet': 'Pratamnak is Pattaya\'s racquet hub — Play Padel, Pickleball Pattaya, Fitz Club tennis. <a href="/guides/padel-pickleball-pattaya/">Padel &amp; pickleball</a> · <a href="/guides/tennis-badminton-pattaya/">Tennis &amp; badminton</a>.',
  'east-pattaya|muay-thai': 'East Pattaya and Huai Yai hold Kombat Group and Sor Klinmee — rural camp settings away from Beach Road noise. <a href="/guides/best-gym-east-pattaya/">East Pattaya gym guide</a> · <a href="/guides/muay-thai-camps-with-accommodation-pattaya/">Stay-and-train camps</a>.',
  'east-pattaya|fitness': 'Nong Prue and Khao Talo run Castra Gym and Sanit Sport Club\'s fitness wing — less tourist traffic than central chains. <a href="/guides/best-gym-east-pattaya/">East Pattaya guide</a>.',
  'east-pattaya|crossfit': 'Pattaya\'s only CrossFit affiliate lives east at Jungle Gym Nong Prue. <a href="/guides/crossfit-pattaya/">CrossFit Pattaya guide</a> · <a href="/guides/best-gym-east-pattaya/">East Pattaya</a>.',
  'east-pattaya|mma': 'Rambaa Somdet M16 and Kombat Group anchor East Pattaya MMA — cage training 100m from Sor Klinmee. <a href="/guides/bjj-mma-pattaya/">BJJ &amp; MMA guide</a>.',
  'east-pattaya|bjj': 'Kombat Group runs full BJJ programme on the Darkside; Rambaa M16 for MMA transitions. <a href="/guides/bjj-mma-pattaya/">BJJ &amp; MMA guide</a>.',
  'jomtien|mma': 'Venum Training Camp and Rage Fight Academy stack MT, BJJ, and MMA near Jomtien Beach. <a href="/guides/bjj-mma-pattaya/">BJJ &amp; MMA guide</a>.',
  'central-pattaya|bjj': 'ALFA BJJ Pattaya is the city\'s first dedicated BJJ academy — Gi and No-Gi on Soi Ko Pai. <a href="/guides/bjj-mma-pattaya/">BJJ &amp; MMA guide</a>.',
  'sattahip|fitness': 'Na Jomtien resort strip — Andaz, Marriott, Renaissance, Mövenpick — 24-hour hotel fitness and spa recovery. <a href="/guides/best-gym-sattahip-pattaya/">Sattahip &amp; Na Jomtien guide</a>.',
  'sattahip|watersports': 'Ocean Marina is Southeast Asia\'s largest yacht hub; SailBreeze IYT school on-site. <a href="/guides/best-gym-sattahip-pattaya/">South Pattaya sport guide</a>.',
  'sattahip|swimming': 'Ramayana and Columbia Pictures Aquaverse water parks — Thailand\'s largest family swim days south of Jomtien. <a href="/guides/swimming-pools-pattaya/">Swimming &amp; pools guide</a>.',
  'sattahip|golf': 'Chee Chan Golf and Bang Saray courses sit on the Sattahip corridor — Buddha Mountain views. <a href="/guides/best-golf-courses-pattaya/">Best golf courses</a>.',
  'naklua|climbing': 'Deep Climbing Gym on Harbor Mall floor 8 is Pattaya\'s flagship indoor wall — AC, 10m routes, mall parking. <a href="/guides/climbing-pattaya/">Climbing guide</a>.',
  'east-pattaya|climbing': 'Bean Cow in Huay Yai runs CWA-certified instruction on an 8m wall — family-friendly Darkside option. <a href="/guides/climbing-pattaya/">Climbing guide</a> · <a href="/guides/best-gym-east-pattaya/">East Pattaya</a>.',
  'sattahip|adventure': 'Tarzan Adventure zipline sits between Nong Nooch and Golden Cliff Temple — Pattaya\'s main jungle course south of Jomtien. <a href="/guides/adventure-pattaya/">Adventure guide</a> · <a href="/guides/best-gym-sattahip-pattaya/">Sattahip guide</a>.',
  'central-pattaya|adventure': 'Pattaya Park Tower Jump and Thepprasit karting cluster — adrenaline without leaving the city belt. <a href="/guides/adventure-pattaya/">Adventure guide</a>.',
  'jomtien|adventure': 'Pattaya Park Tower Jump and EasyKart Thepprasit are the Jomtien-border adventure belt — tower zip line plus outdoor karting until late. <a href="/guides/adventure-pattaya/">Adventure guide</a>.',
  'naklua|adventure': 'Pattaya Bike and Boat Tours runs quiet countryside cycling from Naklua — the non-adrenaline adventure pick. <a href="/guides/adventure-pattaya/">Adventure guide</a>.',
  'east-pattaya|adventure': 'ATV tours east of Mabprachan and Pattaya Shooting Park on Soi Khao Mai Kaew — Darkside mud and ranges. <a href="/guides/adventure-pattaya/">Adventure guide</a> · <a href="/guides/best-gym-east-pattaya/">East Pattaya</a>.',
  'central-pattaya|kids-youth': 'Harbor Mall stacks BOUNCE trampoline, JumpZ, and Deep Climbing on upper floors — Pattaya\'s densest kids indoor belt. <a href="/guides/kids-youth-sport-pattaya/">Kids &amp; youth sport</a> · <a href="/guides/climbing-pattaya/">Climbing</a>.',
  'jomtien|kids-youth': 'AF Academy and FAST PRO run football programmes across Jomtien locations — after-school rhythm for relocating families. <a href="/guides/kids-youth-sport-pattaya/">Kids &amp; youth sport</a>.',
  'naklua|kids-youth': 'AF Academy trains from Naklua north through multi-location sessions — youngest football intake from age 3 in Pattaya. <a href="/guides/kids-youth-sport-pattaya/">Kids &amp; youth sport</a>.',
  'jomtien|watersports': 'Jomtien Beach runs Mermaid\'s, Jomtien Dive Center, and south-end kite schools — Bali Hai pier boats a short taxi north. <a href="/guides/diving-watersports-pattaya/">Diving &amp; watersports</a> · <a href="/guides/best-gym-jomtien-pattaya/">Jomtien gyms</a>.',
  'sattahip|watersports': 'Ocean Marina and KBA Blue Lagoon anchor Pattaya\'s south watersport belt — sailing, kite, and yacht charter. <a href="/guides/diving-watersports-pattaya/">Diving &amp; watersports</a> · <a href="/guides/best-gym-sattahip-pattaya/">Sattahip guide</a>.',
  'central-pattaya|watersports': 'Beach Road dive shops and Bali Hai pier departures — central base for morning boat schedules. <a href="/guides/diving-watersports-pattaya/">Diving &amp; watersports</a> · <a href="/guides/best-dive-operators-pattaya/">Best dive operators</a>.',
  'pratamnak|watersports': 'Royal Varuna Yacht Club on Pratamnak Hill — RYA sailing, regattas Jan–Mar, prestige junior programmes. <a href="/guides/diving-watersports-pattaya/">Diving &amp; watersports</a>.',
  'east-pattaya|watersports': 'Thai Wake Park near Mabprachan is Pattaya\'s cable wakeboarding option — no wind required. <a href="/guides/diving-watersports-pattaya/">Diving &amp; watersports</a> · <a href="/guides/best-gym-east-pattaya/">East Pattaya</a>.',
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
