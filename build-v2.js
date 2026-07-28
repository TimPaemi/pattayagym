#!/usr/bin/env node
/**
 * Pattaya.Gym v2 build script
 * Generates: venue pages, category pages, area pages, sitemap
 * Uses TimPaemi-inspired design (see styles.css)
 *
 * Reads:
 *   - data.js (CATEGORIES + GYMS)
 *   - venues/*.md (long-form venue content)
 *
 * Writes:
 *   - gyms/<slug>/index.html
 *   - category/<slug>/index.html
 *   - area/<slug>/index.html
 *   - sitemap.xml
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://pattaya-gym.com';
const ASSET_VERSION = '470';
const TODAY = new Date().toISOString().slice(0, 10);
const BUILD_TIMESTAMP = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

// ---------- Load data ----------
const { CATEGORIES, GYMS } = require('./data.js');
const VENUE_N = GYMS.length;

// ---------- Load venue geo cache (optional — populated by scripts/geocode-venues.js) ----------
let VENUE_GEO = {};
try {
  const geoPath = path.join(__dirname, 'data', 'venue-geo.json');
  if (fs.existsSync(geoPath)) {
    VENUE_GEO = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
  }
} catch (e) {
  // Cache is optional — build continues without geo if missing/corrupt
  VENUE_GEO = {};
}

// Area normalization — map data.js free-text area to URL slug
const AREA_MAP = {
  'jomtien': /jomtien/i,
  'naklua': /naklua|north\s*pattaya|wongamat/i,
  'pratamnak': /pratamnak|pratumnak/i,
  'central-pattaya': /central|beach\s*road|walking|soi\s*buakhao|3rd\s*road|mike|south\s*pattaya|pattaya\s*klang/i,
  'east-pattaya': /east|darkside|mabprachan|nong\s*prue|sukhumvit|huai\s*yai|chai\s*ngam/i,
  'sattahip': /sattahip|na\s*jomtien|bang\s*saray|bang\s*sare|u-tapao/i
};
const AREA_LABELS = {
  'jomtien': 'Jomtien Beach',
  'naklua': 'Naklua / North Pattaya',
  'pratamnak': 'Pratamnak Hill',
  'central-pattaya': 'Central Pattaya',
  'east-pattaya': 'East Pattaya / Darkside',
  'sattahip': 'Sattahip / Far South'
};

function areaSlugFor(area) {
  if (!area) return null;
  for (const [slug, re] of Object.entries(AREA_MAP)) {
    if (re.test(area)) return slug;
  }
  return null;
}

// ---------- Helpers ----------
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeMkdir(p) { fs.mkdirSync(p, { recursive: true }); }

// Normalize a display phone string to a dialable tel: value.
// Strips extensions ("ext. 2621"), parentheticals ("(Mr. Piyawath)"),
// and multi-number lists (takes the first number before / or ;).
function phoneToTel(phone) {
  if (!phone) return '';
  const first = String(phone).split(/[\/;,]/)[0];
  const cleaned = first
    .replace(/\bext\.?\s*\d+/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^+\d]/g, '');
  return cleaned;
}


function writeFile(filePath, content) {
  safeMkdir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

// ---------- Schema.org helpers ----------
// Map data.js category -> schema.org LocalBusiness subtype
function localBusinessType(category) {
  const map = {
    'muay-thai':    ['LocalBusiness', 'SportsActivityLocation'],
    'mma':          ['LocalBusiness', 'SportsActivityLocation'],
    'bjj':          ['LocalBusiness', 'SportsActivityLocation'],
    'crossfit':     ['LocalBusiness', 'ExerciseGym'],
    'fitness':      ['LocalBusiness', 'ExerciseGym', 'HealthClub'],
    'yoga':         ['LocalBusiness', 'HealthClub'],
    'golf':         ['LocalBusiness', 'GolfCourse', 'SportsActivityLocation'],
    'racquet':      ['LocalBusiness', 'SportsActivityLocation'],
    'swimming':     ['LocalBusiness', 'SportsActivityLocation'],
    'watersports':  ['LocalBusiness', 'SportsActivityLocation'],
    'climbing':     ['LocalBusiness', 'SportsActivityLocation'],
    'clubs':        ['LocalBusiness', 'SportsClub'],
    'kids-youth':   ['LocalBusiness', 'SportsActivityLocation'],
    'equestrian':   ['LocalBusiness', 'SportsActivityLocation'],
    'adventure':    ['LocalBusiness', 'SportsActivityLocation']
  };
  return map[category] || ['LocalBusiness'];
}

// Map area context to a fallback Thai postal code when address doesn't include one.
// Chon Buri Province postal codes:
//   20150 — Bang Lamung district (covers Pattaya City, Naklua, Pratamnak, Jomtien, Central Pattaya, East Pattaya, Huai Yai)
//   20250 — Sattahip district (covers Sattahip, Bang Saray, Na Jomtien, U-Tapao, Bang Sare)
//   20110 — Sriracha district (covers Laem Chabang, Sriracha)
//   20230 — Bo Win (industrial estates near Sriracha)
function postalCodeForArea(areaStr) {
  if (!areaStr) return undefined;
  const s = String(areaStr).toLowerCase();
  if (/sattahip|na\s*jomtien|bang\s*saray|bang\s*sare|u-tapao|sattahip|chak\s*ngaeo/i.test(s)) return '20250';
  if (/sriracha|laem\s*chabang/i.test(s)) return '20110';
  if (/bo\s*win/i.test(s)) return '20230';
  // Default to Bang Lamung district (covers all of Pattaya proper)
  if (/jomtien|naklua|pratamnak|pratumnak|central|walking|wongamat|huai\s*yai|nong\s*prue|mabprachan|darkside|east\s*pattaya|south\s*pattaya|north\s*pattaya|sukhumvit|buakhao|thepprasit|thappraya|soi\s|klang|pattaya/i.test(s)) return '20150';
  // Pattaya-directory default — all listed venues are Bang Lamung / Eastern Seaboard belt
  return '20150';
}

// Turn free-text address into a PostalAddress object (best-effort).
// `areaContext` is the venue's area string — used for postal-code fallback when address lacks a zip.
function parsePostalAddress(addr, areaContext) {
  if (!addr) return null;
  const a = String(addr).trim();
  if (!a || /^pattaya[\s—-]/i.test(a) && a.length < 12) return null; // ignore "Pattaya — verify"
  // Pull a postal code if present (5 digits)
  const zipMatch = a.match(/\b(\d{5})\b/);
  const postalCode = zipMatch ? zipMatch[1] : postalCodeForArea(areaContext);
  return {
    '@type': 'PostalAddress',
    streetAddress: a,
    addressLocality: 'Pattaya',
    addressRegion: 'Chon Buri',
    postalCode,
    addressCountry: 'TH'
  };
}

// Convert "Mon-Fri 06:00-22:00; Sat-Sun 08:00-20:00" into openingHoursSpecification.
// Returns array; empty array if not parseable.
function parseHoursSpec(hoursStr) {
  if (!hoursStr) return [];
  // Skip if the string mentions exceptions we can't represent cleanly
  if (/closed|except|verify|by\s*appointment|tbd|n\/a|call\s*ahead|seasonal|members?\s*only/i.test(hoursStr)) return [];
  const DAY = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };
  // Split on ; , and & — but & inherits days from previous segment
  const segments = String(hoursStr).split(/[;,]|&/).map(s => s.trim()).filter(Boolean);
  const out = [];
  let lastDays = null;
  for (const seg of segments) {
    // Match patterns like "Mon-Fri 06:00-22:00" or "Sat 08:00-20:00" or "Daily 24/7"
    // Word boundaries on day tokens so "Sundays" doesn't match as "Sun".
    const daysRe = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Daily|Everyday)\b(?:\s*[-\u2013\u2014]\s*\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b)?/i;
    const timeRe = /(\d{1,2}):?(\d{2})\s*[-\u2013\u2014]\s*(\d{1,2}):?(\d{2})/;
    const dm = seg.match(daysRe);
    const tm = seg.match(timeRe);
    if (!dm && !lastDays) continue;
    let days = [];
    const dayFromKey = (s) => DAY[s.toLowerCase().slice(0, 3)];
    if (dm && /daily|everyday/i.test(dm[1])) {
      days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    } else if (dm && dm[2]) {
      const order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      const a = order.indexOf(dayFromKey(dm[1]));
      const b = order.indexOf(dayFromKey(dm[2]));
      if (a >= 0 && b >= 0 && a <= b) days = order.slice(a, b + 1);
    } else if (dm) {
      days = [dayFromKey(dm[1])].filter(Boolean);
    }
    if (!days.length) {
      // No day matched in this segment — fall back to days from previous segment ("&" continuation)
      if (lastDays) {
        days = lastDays;
      } else {
        continue;
      }
    }
    lastDays = days;
    // 24/7 case
    if (/24\s*\/\s*7|all day/i.test(seg)) {
      out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: '00:00', closes: '23:59' });
      continue;
    }
    if (!tm) continue;
    const opens = `${tm[1].padStart(2,'0')}:${tm[2]}`;
    const closes = `${tm[3].padStart(2,'0')}:${tm[4]}`;
    out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens, closes });
  }
  return out;
}

// BreadcrumbList from an array of { label, href? } items + page url for the last.
function breadcrumbJsonLd(items, pageUrl) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      item: it.href ? `${SITE}${it.href}` : (i === items.length - 1 ? pageUrl : undefined)
    }))
  };
}

// ---------- Frontmatter parser ----------
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: text };
  const yaml = m[1];
  const body = m[2];
  const fm = {};
  const lines = yaml.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const flat = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (flat && !line.startsWith('  ')) {
      const key = flat[1];
      let val = flat[2];
      if (val === '' || val === null) {
        const block = [];
        i++;
        while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
          block.push(lines[i]);
          i++;
        }
        if (block.some(l => l.trim().startsWith('- '))) {
          fm[key] = block.filter(l => l.trim().startsWith('- '))
            .map(l => l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''));
        } else {
          const obj = {};
          block.forEach(l => {
            const kv = l.trim().match(/^([\w-]+):\s*(.*)$/);
            if (kv) obj[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
          });
          fm[key] = obj;
        }
        continue;
      }
      if (val.startsWith('[') && val.endsWith(']')) {
        fm[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      } else {
        fm[key] = val.replace(/^["']|["']$/g, '');
      }
      i++;
      continue;
    }
    i++;
  }
  return { fm, body };
}

// ---------- Markdown -> HTML (markdown-it; produces valid HTML5) ----------
// Round 17 fix for F02.1 (Codex): replace bespoke regex converter that produced
// 210 html-validate errors (stray </p>, malformed lists, missing th scope) with
// a real CommonMark parser. Configured with tables + linkify off + typographer
// off so the output is deterministic and equivalent to the prior intent.
const MarkdownIt = require('markdown-it');
const _md = new MarkdownIt({
  html: false,
  xhtmlOut: false,
  breaks: false,
  linkify: false,
  typographer: false
});
// Demote top-level # to <h2> (we reserve <h1> for the page hero) and add
// scope="col" to every <th>, matching Codex F02.2 fix.
_md.renderer.rules.heading_open = function (tokens, idx) {
  const t = tokens[idx];
  if (t.tag === 'h1') t.tag = 'h2';
  return `<${t.tag}>`;
};
_md.renderer.rules.heading_close = function (tokens, idx) {
  const t = tokens[idx];
  if (t.tag === 'h1') t.tag = 'h2';
  return `</${t.tag}>`;
};
_md.renderer.rules.th_open = function () { return '<th scope="col">'; };
function mdToHtml(md) {
  if (!md) return '';
  return _md.render(md).trim();
}

// ---------- Round 19 helpers: title/desc length safety (Codex F05.1) ----------
function truncateTitle(s, max = 65) {
  if (!s) return s;
  // Round 21 - Codex P2-1: never leave a dangling separator at the end of a title.
  const strip = t => t.replace(/[\s|:,·–-]+$/, '').trimEnd();
  if (s.length <= max) return strip(s);
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return strip((lastSpace > 30 ? cut.slice(0, lastSpace) : cut).trimEnd());
}
function truncateDesc(s, max = 155) {
  if (!s || s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

function venueSeoTitle(g, catLabel) {
  const name = g.name;
  const brand = ' | Pattaya.Gym';
  if (/pattaya/i.test(name)) {
    const full = `${name}${brand}`;
    return full.length <= 65 ? truncateTitle(full, 65) : truncateTitle(name, 65 - brand.length) + brand;
  }
  const core = `${name} — ${catLabel} Pattaya`;
  if (core.length + brand.length <= 65) return `${core}${brand}`;
  const suffix = ` Pattaya${brand}`;
  const displayName = name.includes(' — ') ? name.split(' — ')[0].trim() : name;
  const room = 65 - suffix.length;
  const short = displayName.length <= room ? displayName : truncateTitle(displayName, room);
  return `${short}${suffix}`;
}

function venueSeoDesc(g, catLabel) {
  const max = 155;
  const areaBit = g.area ? g.area.split(/[—\/,]/)[0].trim() : 'Pattaya';
  let base = (g.description || '').trim();
  if (!base) {
    return truncateDesc(`${g.name} — ${catLabel.toLowerCase()} in ${areaBit}, Pattaya. Hours, prices, contact and maps.`, max);
  }
  if (/pattaya/i.test(base)) return truncateDesc(base, max);
  const suffix = ' Near Pattaya, Thailand.';
  const room = max - suffix.length;
  if (base.length > room) {
    base = base.slice(0, room);
    const lastSpace = base.lastIndexOf(' ');
    if (lastSpace > room * 0.5) base = base.slice(0, lastSpace);
  }
  return truncateDesc(base + suffix, max);
}

const CATEGORY_INTRO = {
  'muay-thai': 'Compare Pattaya Muay Thai records by training format, verified price and location. The directory includes walk-in gyms, residential camps and event venues, so confirm that a listing offers the kind of training you need before travelling.',
  'fitness': 'Commercial gyms, hotel fitness centres, and budget weight rooms are spread across Central Pattaya, Jomtien, and the Darkside. Filter by 24-hour access, day pass, price tier, or neighbourhood — whether you need a tourist membership or a long-stay condo gym.',
  'golf': 'Pattaya sits inside one of Thailand\'s densest golf regions — championship courses from Phoenix Gold to Siam Country Club, mostly 20–45 minutes from the beach hotels. Green fees, caddie policy, and booking contacts for every course we track.',
  'yoga': 'Beachfront studios, rooftop flows, and resort wellness programmes cluster in Jomtien and Pratamnak. Compare drop-in class prices, styles (Ashtanga, Vinyasa, Yin), and English-speaking teachers.',
  'racquet': 'Tennis courts, padel, pickleball, badminton halls, and squash — from Fitz Club at Royal Cliff to budget covered courts inland. Hourly hire, coaching, and social leagues for short-stay visitors.',
  'swimming': 'Lap pools, hotel day-pass swimming, water parks, and swim schools — every pool venue in Pattaya with hours and whether non-guests can buy a day ticket.',
  'watersports': 'Scuba from Bali Hai, kitesurfing at Jomtien, sailing at Ocean Marina, and island boats to Koh Larn. Operators ranked by certification level, beginner suitability, and area.',
  'climbing': 'The climbing category contains one current Huai Yai gym, STICKY, and one permanently closed Harbor Pattaya record, Deep. Compare disciplines, hours and booking questions before travelling.',
  'crossfit': 'One former-affiliate record now operating as an independent functional-fitness venue in East Pattaya — current group schedule, unknown drop-in price, and general-gym alternatives.',
  'mma': 'The MMA category currently contains two mixed-discipline combat-school records. Compare their published schedules and locations, then confirm the exact MMA or grappling session directly because neither record has a current public tariff or class-by-class timetable.',
  'bjj': 'The direct BJJ category currently contains one closed legacy academy. Use the editorial comparison for active BJJ or grappling programmes filed under fitness, Muay Thai and residential combat camps, then confirm the exact session before travelling.',
  'clubs': 'Hash House Harriers, cycling meetups, beach aerobics, cricket, rugby, and social run clubs — the community sport layer beneath the commercial gyms.',
  'kids-youth': 'Football academies, trampoline parks, kids Muay Thai, swim lessons, and family sport — venues that explicitly welcome children.',
  'equestrian': 'Horse riding schools, polo clubs, and equestrian resorts east of Pattaya — Horseshoe Point, Thai Polo Equestrian Club, and beginner trail rides.',
  'adventure': 'Skydive, zipline, karting, ATV, shooting ranges, and tower jumps — adrenaline operators with safety credentials and booking practicalities.'
};

const CATEGORY_EDITORIAL = {
  'muay-thai': `
      <p><strong>Start with the training format, not the headline price.</strong> This category contains 22 directory records as checked on 26 July 2026, but that does not mean 22 interchangeable, bookable Pattaya camps. The set mixes day-training gyms, residential programmes, boxing or MMA hybrids and event venues; it also retains two Bangkok stadium reference records. One record still has an unverified exact location. Read the status and location on the venue page before treating any result as a place to train.</p>
      <h2>What published prices actually show</h2>
      <p>For an ordinary group session, owner-published prices checked on 25 July 2026 give a useful comparison. <a href="/gyms/sudsakorn-muay-thai-gym/">Sudsakorn Muay Thai</a> listed ฿400 for one daily session or ฿600 for two, with weekly plans at ฿1,800 or ฿3,000 and monthly plans at ฿6,000 or ฿9,000. <a href="/gyms/battle-conquer-gym/">Battle &amp; Conquer</a> listed a ฿500 group drop-in, ฿2,500 for one week and ฿7,000 for one month; its Muay Thai packages include access to the weights area, sauna and cold plunge. Fairtex listed ฿800 for one session, ฿7,000 for ten sessions and ฿16,500 for one month of unlimited training.</p>
      <p>Those numbers are not one market-wide price range. ISS separates general gym access from coached classes: its published rates checked on 25 July were ฿300 for a gym day pass and ฿1,000 for a one-day boxing or Muay Thai class package. Residential camps bundle more. Silk listed accommodation-based plans from ฿16,000 for one week, while Kombat listed a one-week residential package at ฿20,900 before its stated 7% VAT and card charge. Compare what is included—training frequency, room, meals, recovery facilities and taxes—rather than comparing the largest number alone.</p>
      <h2>How to choose a Pattaya Muay Thai gym</h2>
      <p><strong>Short visit:</strong> prioritize a clearly published single-session price and a class time that fits your day. <strong>Two-a-day training:</strong> compare weekly or monthly plans and travel time; crossing Pattaya twice a day can erase a small price saving. <strong>Training holiday:</strong> use the <a href="/guides/muay-thai-camps-with-accommodation-pattaya/">stay-and-train camp guide</a> and separate the accommodation value from the coaching value. <strong>Mixed training:</strong> check whether “gym” means a weight room, boxing class, BJJ programme or open Muay Thai session.</p>
      <p>The current wraparound records also show why the category should not be flattened into one “open gym” answer. <a href="/gyms/eagle-gym-pratamnak/">Eagle Gym Pratamnak</a> now publishes group-class blocks for Muay Thai, boxing and judo on Pratamnak Soi 5 but no stable current public rate card. That is still a valid current operating record because identity and training windows are confirmed. Compare it with <a href="/gyms/sudsakorn-muay-thai-gym/">Sudsakorn</a>, which publishes a full short-stay price ladder, or with <a href="/gyms/wko-muay-thai/">ISS</a>, which separates coached-class pricing from general gym access. The right comparison is not “which Muay Thai gym is cheapest?” but “which exact product fits my stay, area and contact tolerance?”</p>
      <p>The category also needs one cross-training caution. Some useful Muay Thai buyers do not actually want a pure camp. <a href="/gyms/castra-gym/">Castra Gym</a>, filed under fitness, now publishes Muay Thai group classes at 09:00-10:00 and 17:30-18:30 on weekdays, plus BJJ and a priced class ladder checked on 27 July 2026. That does not turn Castra into a category error; it shows why the buyer should name the exact purchase first. A mixed weights-plus-combat visitor may be better served by a fitness-led venue with a published fight-club tariff than by a traditional camp whose training is real but still fully contact-first.</p>
      <h2>A traditional camp can be contact-first</h2>
      <p><a href="/gyms/sor-klinmee/">Sor Klinmee Gym</a> illustrates the difference between a current camp identity and a bookable public product. Its exact Maps profile and operator Facebook page agree on the Nong Prue address and +66 86 141 6500. Maps lists 07:00-10:00 and an afternoon period from 15:00 Monday-Saturday, with a 21:00 Monday close, 20:30 Tuesday-Saturday close and Sunday closure. Those are business periods, not proof that a coached group starts at every opening time.</p>
      <p>The operator page identifies Sor Klinmee with Tappaya Sit-Or and remained active in July 2026, but it exposes no dependable visitor tariff, private-session price, equipment list or class-by-class schedule. Contact the gym with the intended date, experience and preferred period. A blank price must not be replaced with an old review, city-wide average or another camp's fee.</p>
      <h2>A renamed Jomtien gym still needs a direct price check</h2>
      <p><a href="/gyms/pattaya-thai-boxing-fitness/">Soi Seven MuayThai</a> is the current operator identity linked from the live Jomtien Thai Boxing Gym Maps place on Jomtien Soi 7. The operator page published a training video on 29 June 2026, and Maps lists 09:00-18:00 Monday-Saturday with Sunday closed. Those signals support a current Muay Thai identity; they do not turn the full business window into a class timetable.</p>
      <p>No current operator rate card was available on 26 July 2026. A visitor comment supplies a number, but this directory does not promote customer-reported pricing into a venue tariff. Travellers should message the operator with the date, experience level and preferred time, then ask for the session format, duration, current price, teaching language and glove or hand-wrap arrangements. The missing tariff is a contact step, not a reason to remove a confirmed operating gym.</p>
      <h2>Sityodtong publishes one precise pad-work product</h2>
      <p><a href="/gyms/sityodtong-pattaya/">Sityodtong Muay Thai Camp</a> is another active East Pattaya camp, but its current evidence supports a narrower price comparison. The operator's exact training-price page displayed <strong>฿400 for one individual pad-work session with a trainer</strong> when checked on 26 July 2026. Its official schedule lists training from 08:00 to 10:00 and 15:00 to 17:30 Monday-Saturday, with Sunday closed.</p>
      <p>That ฿400 amount should be compared only with another named trainer-led pad-work product. It does not establish the charge for a complete group session, both daily periods, private technical coaching, children's training or the camp's four-week housing option. Sityodtong suits a visitor who values its documented 1960 camp identity and is willing to ask for the complete product. Readers who need weekly, monthly or residential totals before contact should choose one of the camps with a current itemised package page.</p>
      <h2>Accommodation changes the product</h2>
      <p>A room-and-training price cannot be ranked beside a drop-in without unpacking it. <a href="/gyms/fairtex-pattaya/">Fairtex</a> published a six-night, ten-session package at ฿16,000 for one person or ฿23,000 for two sharing, and a one-month product at ฿46,500 for one or ฿63,000 for two sharing, checked on 26 July 2026. Its training-only page separately listed ฿800 for one session, ฿7,000 for ten and ฿16,500 for one month. Those parallel products let a traveller compare a room bundle with training bought separately.</p>
      <p><a href="/gyms/kombat-group-thailand/">Kombat Group</a> showed a different ladder. One week of Muay Thai or boxing was ฿12,900 in its Bronze fan-room tier, ฿20,900 Standard or ฿24,900 Deluxe. Bronze includes training, gym access, three Thai meals per day and a fan room with Thai-style bathroom, but excludes the pool and resort facilities. The higher tiers add an air-conditioned en-suite room, pool access and other named inclusions. Kombat says its prices exclude 7% VAT and a 3% card fee. <a href="/gyms/rage-fight-academy/">Rage</a> documents on-site rooms but no dependable package tariff, while Sityodtong describes a housing route without a current residential total. Use the <a href="/guides/muay-thai-camps-with-accommodation-pattaya/">current accommodation guide</a> and compare the written room, training load, meals, facility access, taxes and change terms. An unpriced room remains a contact-first option, not a reason to remove the camp or invent a band.</p>
      <h2>A stadium record is not a training camp</h2>
      <p><a href="/gyms/max-muay-thai-stadium/">MAX Muay Thai Stadium</a> belongs in this category because it is an active Muay Thai event venue, but it does not publish a standing visitor-training product. Its operator calendar checked on 26 July 2026 showed The Global Fight cards at 19:00 on 27 and 28 July, with five advertised bouts on each card. Those two entries establish current event programming; they do not establish a permanent nightly schedule, pads, sparring, private coaching or a class a traveller can join.</p>
      <p>The ticket page provides a seating plan and routes buyers to selected sales channels without exposing a dependable numeric operator tariff in accessible text. A spectator should confirm the date, card, door time, seating section, all-in amount, delivery or collection method and change policy. A trainee should exclude MAX from the price comparison and shortlist an actual camp. Keeping stadium and training records together helps a reader find both sides of the sport, but only if the access model is read before the headline count.</p>
      <h2>Venum is a multi-discipline enquiry, not a zero-price booking</h2>
      <p><a href="/gyms/venum-training-camp/">Venum Training Camp</a> advertises Muay Thai, western boxing, MMA, Brazilian Jiu-Jitsu and cross-training for beginners through experienced athletes. That breadth is useful for someone comparing several combat disciplines, but no current class-by-class timetable or usable public tariff was found. Its booking interface displayed “PRICE 0$” during the 26 July check without identifying a free class or package; this directory treats that as a placeholder, not evidence of zero-cost training.</p>
      <p>The operator site lists daily 07:00-19:00, while the exact Maps listing shows 09:00-19:00 Monday-Saturday and Sunday closed. Contact +66 87 285 7699 with the exact discipline and date, then ask for the session time, visitor price, equipment and inclusions in writing. Readers prioritising hands-only training should use the <a href="/guides/boxing-kickboxing-gym-pattaya/">boxing and kickboxing guide</a> rather than assuming every multi-discipline window includes western boxing.</p>
      <h2>English support needs trainer-level evidence</h2>
      <p>An English website, an English-speaking booking contact and an English-speaking trainer are three different findings. Kombat Group has the strongest explicit operator statement in the current set: its FAQ says all trainers speak English while qualifying that most Muay Thai trainers use a very basic level. Fairtex, Battle &amp; Conquer, ISS and Rage publish usable English booking information, but the checked pages do not guarantee the same spoken-English level from every trainer or in every session.</p>
      <p>Readers who need detailed verbal correction should name that requirement before paying and ask which coach leads the exact date. A one-session or private product can test the fit before a week or month is purchased. Contact-first camps such as Petchrungruang and Sor Klinmee should not be labelled English-speaking from foreign-student photos or visitor reviews alone. The <a href="/guides/english-speaking-muay-thai-pattaya/">English-speaking Muay Thai guide</a> separates explicit evidence from items that still require a test message.</p>
      <h2>Boxing, kickboxing and Muay Thai are different requests</h2>
      <p>Some records advertise western boxing, kickboxing, MMA or general striking alongside Muay Thai. ISS publishes one combined boxing-and-Muay-Thai class window; Venum and Rage advertise several combat disciplines; SMASH is filed under fitness because its operator presents kickboxing within a wider coached studio programme. None of those labels proves a hands-only class, K1 rules or a particular sparring format on the chosen date.</p>
      <p>Send the exact discipline and ruleset you want. The <a href="/guides/boxing-kickboxing-gym-pattaya/">boxing and kickboxing guide</a> separates the current evidence and keeps <a href="/gyms/pattaya-boxing-world/">Pattaya Boxing World</a> as an unverified former spectator-stadium record rather than reviving it as a training recommendation.</p>
      <h2>A Muay Thai offer can sit outside this category</h2>
      <p><a href="/gyms/mixfight-pattaya/">BOXING CLUB Mixfight Pattaya</a> is filed under MMA because its current public identity is a multi-discipline martial-arts school. A March 2026 owner update on the live Khao Makok listing names Muay Thai alongside western boxing, MMA, jiu-jitsu, yoga, fitness, children’s groups and fight preparation. Independent Sherdog and Tapology records also place combat-sports events at the venue. Those findings support a relevant school identity, but they do not supply a recurring Muay Thai class time or visitor product.</p>
      <p>This matters when using the category count as a shortlist. A primary category prevents a hybrid school from appearing in every discipline filter; it does not mean the other advertised disciplines are rejected. Mixfight can be a useful enquiry for a household or training group with several interests, while a dedicated camp with a published schedule may be the more efficient choice for someone who wants only Muay Thai. The operator has not published a dependable current tariff, telephone number or class-by-class timetable, so contact <strong>@coach.pattaya</strong> with the exact discipline, date, experience and group-or-private request. Ask about price, coaching language, equipment and whether sparring is optional. Do not translate the school’s 08:00–21:00 or 08:00–19:00 business windows into all-day Muay Thai instruction.</p>
      <h2>A legacy camp name is not a training option until its identity resolves</h2>
      <p><a href="/gyms/cho-nateetong/">Cho Nateetong Thai Boxing Camp</a> remains an unverified directory record. On 27 July 2026, an exact-name Maps search returned other active Pattaya gyms rather than an exact current Cho Nateetong place, and no current operator website or social channel was found. Historical addresses, phones, session times and prices cannot safely identify a venue after that failure. The record is retained to prevent those old claims from reappearing, but it should not be used to choose accommodation or travel to a pin.</p>
      <p>This is not a price-based exclusion. A confirmed camp may remain contact-first when its tariff is absent: <a href="/gyms/sitpholek-muay-thai/">Sitpholek</a>, for example, has a reconfirmed Khao Talo identity, address and phone even though its current class price and timetable were not public. The decision line is existence and exact identity, not whether a rate card is convenient. Use a confirmed operator record and the <a href="/guides/muay-thai-training-holiday-pattaya/">training-holiday guide</a> while Cho Nateetong remains unresolved.</p>
      <h2>A long training holiday should start with a reversible purchase</h2>
      <p>The current category evidence supports several first commitments, not one universal camp package. Battle &amp; Conquer publishes a ฿500 group session, ฿2,500 week and ฿7,000 month. Fairtex publishes ฿800 for one Muay Thai session, ฿7,000 for ten and ฿16,500 for a training month. ISS publishes ฿1,000 for a day of boxing and Muay Thai classes, ฿4,000 for a week and ฿8,000 for a month. Kombat's ฿20,900 standard week is a residential product before the operator's stated 7% VAT and 3% card charge. Those products commit the buyer to different combinations of class, duration, room and location.</p>
      <p><a href="/gyms/sitpholek-muay-thai/">Sitpholek</a> shows why an operating gym can remain in the choice set without a current rate. Its Khao Talo identity, address and +66 89 934 5001 phone were reconfirmed on 27 July 2026, but the public website is old and no dependable current tariff or class timetable was found. Contact-first is the correct outcome: ask for one session, one week, one month, exact start times and equipment terms rather than copying the historical figures.</p>
      <p>For a one-to-four-week trip, make the first purchase answer the biggest uncertainty. A single session tests coach and class fit; a training-only week tests the routine while accommodation stays flexible; a residential week reduces coordination but ties the room and training together. The <a href="/guides/muay-thai-training-holiday-pattaya/">training-holiday guide</a> compares those dated products and provides a written-quote checklist. Extend only after the exact session, route, inclusions, taxes and change terms work for the traveller.</p>
      <p>Before paying, ask the operator to reconfirm the exact class schedule, whether beginners can join that session, glove and hand-wrap arrangements, trainer language, private-session price, payment surcharges and what a package includes. The directory records a price only when it can be tied to a dated source; blank fields mean the current rate was not found, not that admission is free. For the editorial shortlist and its selection logic, continue to the <a href="/guides/best-muay-thai-pattaya/">best Muay Thai gyms in Pattaya guide</a>.</p>
      <h2>A four-part prepayment check for Muay Thai</h2>
      <p><strong>First, identify the exact transaction.</strong> A business period, group class, trainer-led pad-work session, private lesson, general-gym pass and residential package are different purchases. <a href="/gyms/sityodtong-pattaya/">Sityodtong</a> publishes THB 400 for one individual pad-work session with a trainer; that number does not establish the charge for a complete group class or both daily training periods. <a href="/gyms/wko-muay-thai/">ISS</a> publishes boxing and Muay Thai classes separately from its general-gym product. Name the product before comparing amounts.</p>
      <p><strong>Second, confirm the class that will actually run.</strong> Operator business hours can be wider than coached starts. Send the date, experience, desired intensity and preferred language. Ask whether the selected session accepts beginners, whether sparring or partner contact is optional, what time the coached portion begins and ends, and which trainer is assigned. A current venue identity does not guarantee that every advertised discipline appears in every open period.</p>
      <p><strong>Third, price the complete first visit.</strong> Request the session or pass, registration, gloves, hand wraps, other protective equipment, locker or towel, tax, card surcharge and deposit together. Fairtex, Battle &amp; Conquer, Sudsakorn and ISS publish useful dated products, but their inclusions differ. Kombat's residential rates combine training, accommodation, meals and facilities, while a training-only drop-in leaves room and transport outside the headline figure. A blank tariff at a confirmed gym such as Sitpholek means contact-first, not free training or a reason to erase the venue.</p>
      <p><strong>Fourth, preserve a reversible choice.</strong> One suitable session can test the class, coach, route and equipment policy. A week can test a two-a-day routine. A residential commitment adds room, meals and cancellation terms to the same decision. Extend only after the exact product works. If the operator cannot identify the venue, class, date and total in writing, do not replace those gaps with an old review or city-wide average.</p>
      <p>This check also explains the category's status boundaries. Cho Nateetong remains unverified because its exact current identity could not be confirmed, not because a price was missing. Operating contact-first camps remain visible when identity evidence is strong. Use the individual record for its sources and verification date, then use the <a href="/guides/muay-thai-pattaya-beginners/">beginner guide</a> or <a href="/guides/muay-thai-training-holiday-pattaya/">training-holiday guide</a> for the matching commitment level.</p>
      <h2>Do not turn a destination comparison into a category price</h2>
      <p>A cross-city search can make a single number look more representative than it is. The current Pattaya evidence ranges from a THB 400 individual trainer pad-work session at Sityodtong to THB 500 Battle &amp; Conquer group entry, THB 800 Fairtex group entry and THB 1,000 ISS boxing-and-Muay-Thai class day. Those four prices name different products. None is a Pattaya average, and the lowest is not automatically the cheapest complete coached session.</p>
      <p>The same discipline can also sit outside this filter. <a href="/gyms/smash-fitness-kickboxing/">SMASH Fitness Kickboxing</a> is filed under fitness because its operator presents kickboxing inside a wider strength-and-hybrid programme. Its current booking week showed named one-hour sessions and all-level labels, but the public membership portal used a dollar sign without establishing the transaction currency. The correct directory result is an operating, contact-first studio with an unresolved baht rate. It should neither inherit a Muay Thai camp price nor disappear because its tariff is unclear.</p>
      <p>Weekly and monthly amounts require a frequency column. Battle publishes THB 2,500 for a week and THB 7,000 for a month; Fairtex publishes THB 16,500 for a month of unlimited Muay Thai training; ISS publishes THB 4,000 for a class week and THB 8,000 for a class month. A buyer still needs the exact starts, sessions permitted, pause or expiry rules, equipment and contact level. Residential Kombat products add a room, meals and facility terms, so they belong in a separate comparison even when the page headline says Muay Thai.</p>
      <p>This discipline is especially important when comparing Phuket. The <a href="/guides/pattaya-vs-phuket-muay-thai-training/">Pattaya versus Phuket guide</a> uses named Tiger, Sinbi and AKA products rather than city averages. A Phuket single class, day pass, one-session-daily week, private hour and residential week are separate rows, just as they are in Pattaya. The guide may show a lower figure in either city without declaring that city's training universally cheaper or better.</p>
      <p>For this category, build the shortlist in three passes. First exclude records that are closed, unverified or not a standing training product. Second choose group, private, open-gym, event or residential access. Third compare only products with the same dates, training frequency, tax, equipment and room status. If a confirmed camp has no price, send the same quote request and leave the amount unresolved until the operator answers. The <a href="/guides/best-muay-thai-pattaya/">best Muay Thai guide</a> can then rank fit from evidence without treating missing commerce data as missing existence.</p>
      <h2>A clear rate card and a contact-first gym answer different questions</h2>
      <p><a href="/gyms/sudsakorn-muay-thai-gym/">Sudsakorn Muay Thai</a> is a good current example of a clean training-only price ladder. On 27 July 2026 the operator still published THB 400 for one session, THB 600 for two sessions in one day, THB 1,800 for a one-session-daily week, THB 3,000 for a two-session-daily week, THB 6,000 for a one-session-daily month and THB 9,000 for a two-session-daily month. That is useful because it tells the buyer exactly which duration and frequency is being sold. It still does not answer trainer language, private coaching, equipment or whether the two-session day suits the traveller's recovery and transport plan.</p>
      <p>At the other end, <a href="/gyms/rage-fight-academy/">Rage Fight Academy</a> publishes a broader product set without a stable fee table. The current site supports Muay Thai, boxing, BJJ, MMA, functional work, a pool and on-site rooms. That makes Rage a credible option for a mixed-discipline household or camp-style stay, but not a transparent one-click comparison against Sudsakorn. The right action is not to skip Rage for missing price; it is to ask for the named discipline, class or room package in writing and compare that exact reply to an equivalent product elsewhere.</p>
      <p><a href="/gyms/sitpholek-muay-thai/">Sitpholek</a> remains the third case. Its Khao Talo identity, address and phone are current, but the public tariff and full timetable are not. That keeps it inside the category because existence is confirmed. A short call or message is still needed before it can sit beside Sudsakorn on a usable week-or-month grid. The directory is more honest when it keeps that camp visible with its gap than when it either invents a price or drops the record altogether.</p>
      <p>This is the practical rule for a Muay Thai buyer: let the clearest published product answer the first-purchase question, and let the contact-first gym answer the “could this fit me better?” question. A single paid test at a gym with transparent pricing can be more useful than a week bought blind. A contact-first gym can still be the best long-term fit once the operator confirms the exact session, coach, equipment and total. The category count helps surface all three patterns, but the purchase decision still has to match the product that was actually named.</p>
      <h2>A class day, a gym pass and a recovery room are three products</h2>
      <p><a href="/gyms/wko-muay-thai/">ISS Boxing and Muay Thai</a> is now the clearest example inside this category of why one venue name can still contain several separate purchases. Its current official classes page splits the offer into a boxing-and-Muay-Thai class product, a general gym-and-facilities product, and a recovery-room product built around sauna, ice bath and specialised cardio. The class rate card checked on 27 July 2026 lists THB 1,000 per day, THB 4,000 per week and THB 8,000 per month for the coached boxing-and-Muay-Thai programme running Monday to Saturday from 14:00 to 15:30. The same page separately lists THB 300 per day, THB 800 per week and THB 1,500 per month for gym and facilities access. It then separately lists THB 200 per day, THB 600 per week and THB 1,000 per month for the weight-cut room, sauna, ice bath and specialised cardio.</p>
      <p>Those three ladders answer different buyer questions. The class product is about coached combat time. The general gym pass is about self-directed training and ordinary facility access. The recovery-room price is about post-session support and weight-management tools. None of the three proves that the others are included. A traveller who reads only one of the figures can easily underprice the first visit or assume a class rate includes the recovery setup. The record is more useful when it preserves the split than when it compresses everything into a single “Muay Thai price.”</p>
      <p><a href="/gyms/sudsakorn-muay-thai-gym/">Sudsakorn</a> and <a href="/gyms/sitpholek-muay-thai/">Sitpholek</a> help show the difference. Sudsakorn publishes a clean training-only ladder tied to one-session and two-session frequency. Sitpholek remains a confirmed camp with a current identity and phone but without a stable published tariff. ISS sits between those cases: its prices are public, but the buyer still has to choose the exact product rather than assume every entry under the gym name buys the same thing. That is why a category comparison needs a product column before it needs a ranking column.</p>
      <p>The same split also protects beginners from making the wrong first commitment. Someone testing Muay Thai for one coached day should not accidentally buy only open-gym access. Someone doing strength work around another camp should not pay for a full class week if the real need is facility use and occasional recovery. Someone cutting weight should ask whether the recovery-room product can be bought alone, whether use is supervised and whether any medical or safety rule applies. A published venue identity is not a licence to merge three commercial answers into one.</p>
      <p>The practical rule is simple: name the discipline, name the coaching requirement, and name the extra facility requirement in the same message. Then request the complete total for that exact combination. If the venue publishes several ladders, keep them separate in the comparison. If it publishes none, as with many contact-first camps, preserve the existence evidence and ask for a written quote. That keeps the category honest about what is known, what is sold and what still needs operator confirmation.</p>
      <h2>A Bangkok fight ticket and a Pattaya class are different Muay Thai products</h2>
      <p><a href="/gyms/lumpinee-boxing-stadium/">Lumpinee</a> and <a href="/gyms/rajadamnern-stadium/">Rajadamnern</a> make the category boundary clearer because both are live Muay Thai records but neither is a Pattaya training gym. Lumpinee's current operator pages checked on 27 July 2026 list Friday ONE Lumpinee tickets at THB 1,000, THB 2,500, THB 3,500 and THB 5,000, Saturday Lumpinee Super Champ tickets at THB 1,000, THB 1,500 and THB 2,000, and selected ONE Fight Night tickets at THB 1,200, THB 2,400, THB 3,750 and THB 4,500. Rajadamnern's current ticket flow instead varies by seating class, with the operator naming Superior Panoramic Balcony, VIP Lounge, Ringside, Club Class, 2nd Class LEO and 3rd Class, while the Maps ticket panel showed admission from THB 1,800 on 27 July 2026.</p>
      <p>Those are valid Muay Thai prices, but they are spectator prices tied to a seat and an event clock. They do not answer the same question as Sudsakorn's THB 400 one-session training product, ISS's THB 1,000 coached class day or Battle &amp; Conquer's THB 500 group session. A traveller who wants to <em>train</em> should compare class format, route, equipment and whether sparring is optional. A traveller who wants to <em>watch</em> should compare the card date, seat, gate time and total ticket cost. The category keeps both because Pattaya visitors often want both sides of the sport, but the buyer has to identify the product first.</p>
      <p>This split is especially useful on one-week trips. A Bangkok stadium night can be a good add-on once a Pattaya class routine is already chosen. It is a poor substitute for solving the first training session. The <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">1 week versus 1 month training guide</a> now treats that as a separate decision, and the <a href="/guides/best-muay-thai-pattaya/">best Muay Thai guide</a> keeps the actual training shortlist inside Pattaya. The category remains honest only when it shows that a live stadium identity and a live gym identity can both be true without being the same purchase.</p>`,
  'mma': `
      <p><strong>If you only read one thing: the MMA category is a two-record shortlist, not a complete timetable of interchangeable MMA classes.</strong> As checked on 26 July 2026, it contains <a href="/gyms/rambaa-somdet-m16/">Rambaa Somdet M16</a> in Nong Prue and <a href="/gyms/mixfight-pattaya/">BOXING CLUB Mixfight Pattaya</a> in Khao Makok. Both are active mixed-discipline schools, but their public evidence is stronger for overall venue activity and broad disciplines than for a class-by-class MMA schedule. Contact the school before travelling if cage work, grappling rounds or fight preparation is the reason for the visit.</p>
      <h2>How the two records differ</h2>
      <p>Rambaa is the East Pattaya option. Its live listing publishes two training periods Monday to Saturday, 07:00–09:00 and 15:00–18:30, with Sunday closed. The record ties the gym to Muay Thai and MMA, and independent fight databases document Rambaa Somdet's Shooto and MMA history. That background does not prove which discipline is taught in every listed period, whether a beginner can join, or whether private coaching is available on a particular day.</p>
      <p>Mixfight is farther south in Khao Makok and advertises a broader school programme. A March 2026 owner update names Muay Thai, boxing, MMA, jiu-jitsu, yoga, fitness, children's groups and fight preparation. Its live hours are 08:00–21:00 on Monday, Wednesday and Friday; 08:00–19:00 on Tuesday, Thursday and Saturday; and Sunday closed. Independent event records place combat-sports events, including MMA bouts, at the venue. Again, an event record confirms relevant activity, not a standing visitor class at every open hour.</p>
      <h2>Price is an unresolved comparison</h2>
      <p>No current operator-published group, private, weekly or monthly tariff was found for either record during the checks completed on 25 July 2026. The empty price fields mean the rate is unknown, not free or necessarily inexpensive. Ask for the price of the exact discipline and format, whether registration or equipment is extra, how long the session runs and whether payment covers open gym, a group class or one-to-one coaching.</p>
      <h2>Who this category suits</h2>
      <p>The two records suit a reader willing to contact a school and verify the session before travelling. Rambaa is the more direct location fit for an East Pattaya base and publishes split morning and afternoon periods. Mixfight publishes longer operating windows and a wider list of disciplines, which may suit a family or training group with different interests. Neither record is yet strong enough for a price-led recommendation, a guaranteed English-language class or a claim that a travelling white belt can simply join.</p>
      <p>Before choosing, send the operator your experience level, desired discipline, preferred date and whether you need group or private training. Ask about the class start time, sparring or rolling rules, gloves and protective equipment, gi or no-gi requirements, coaching language and current fee. For the broader distinction between striking, BJJ and MMA records in the city, use the <a href="/guides/bjj-mma-pattaya/">BJJ and MMA guide</a>.</p>
      <p>The East-side residential camps also matter even when they sit outside the two-record MMA shortlist. <a href="/gyms/kombat-group-thailand/">Kombat Group Thailand</a> currently publishes dedicated MMA residential packages from ฿14,900 for one Bronze week or ฿23,900 for one Standard week, checked 27 July 2026, while <a href="/gyms/silk-muay-thai/">Silk Muay Thai</a> remains a Muay-Thai-led stay-and-train option rather than an MMA booking. That is the practical boundary for this category: a venue can support a mixed-combat buyer without becoming a transparent local MMA drop-in on the evidence now available.</p>`,
  'bjj': `
      <p><strong>If you only read one thing: the single result below is closed.</strong> The BJJ category contains one directory record as checked on 27 July 2026: <a href="/gyms/alfa-bjj-pattaya/">ALFA BJJ Pattaya</a>, a former Soi Khopai academy whose exact Maps listing is permanently closed. It is retained as a closure finding, not a recommendation. Active BJJ and grappling programmes exist in Pattaya, but the relevant venues are currently filed under their primary fitness or combat-sport categories.</p>
      <h2>Active training options outside this one-record category</h2>
      <p><a href="/gyms/castra-gym/">Castra Gym</a> is the clearest short-visit option with a current operator-published timetable and tariff. Its fight-club page lists BJJ on Monday, Wednesday and Friday from 19:00 to 20:00. Prices checked on 25 July 2026 were ฿300 for one group class, ฿2,500 for ten group classes valid for two months and ฿600 for a private class; gym access is included. The operator says all levels, ages and genders are welcome, but a traveller should still confirm the chosen date and whether the session is gi or no-gi.</p>
      <p><a href="/gyms/rage-fight-academy/">Rage Fight Academy</a> identifies itself as a boxing, BJJ, MMA and Muay Thai gym and describes a dedicated BJJ/MMA mat zone within its South Pattaya camp. No stable current public BJJ fee table or dependable class-by-class schedule was available on the operator pages checked on 25 July 2026. Rage is therefore a contact-first alternative rather than a price comparison: send experience level, preferred date and gi or no-gi preference before travelling.</p>
      <p><a href="/gyms/kombat-group-thailand/">Kombat Group Thailand</a> is a residential Huai Yai option, not a simple drop-in academy. Its live pricing page checked on 26 July 2026 listed a standard-room BJJ Academy package from ฿17,900 for one week. That package includes training, equipment use, accommodation, three meals a day, pool access and specified extras. A separate Bronze BJJ package started at ฿10,900 for one week with a fan room and Thai-style bathroom, three Thai meals daily and gym use, but excluded the pool and other resort facilities. The operator says its displayed prices exclude 7% VAT and a 3% credit-card fee.</p>
      <h2>How to choose without a false ranking</h2>
      <p>Choose Castra when a published evening group schedule and per-class price matter most. Consider Rage when a multi-discipline camp near Thappraya is more important than a public tariff. Consider Kombat only when accommodation and meals are part of the purchase. <a href="/gyms/rusich-club-football/">Rusich Club</a> also publishes judo, sambo, jiu-jitsu and grappling sessions, but its programme is not presented as a standalone Brazilian Jiu-Jitsu academy; do not assume that every wrestling or grappling class follows BJJ rules.</p>
      <p>Before paying anywhere, ask for the exact discipline, coach, start time, class duration, gi or no-gi format, belt and experience mix, rolling policy, equipment requirement, language and total price including registration or taxes. A blank directory price means no stable first-hand tariff was found. For a broader comparison with MMA and striking programmes, continue to the <a href="/guides/bjj-mma-pattaya/">BJJ and MMA guide</a>.</p>`,
  'crossfit': `
      <p><strong>If you only read one thing: this category does not contain a current CrossFit affiliate.</strong> It contains one functional-fitness record, <a href="/gyms/crossfit-pattaya/">Jungle Gym Pattaya</a>, whose former CrossFit Pattaya entry is labelled “departed” in the official CrossFit Games affiliate directory. That directory status was checked on 26 July 2026. The gym can still offer coached strength and conditioning, but the directory cannot present it as an active licensed CrossFit affiliate.</p>
      <h2>What is currently verified</h2>
      <p>Jungle Gym's own current CrossFit page publishes weekday group-fitness sessions from 09:00 to 10:00 and 19:00 to 20:00, plus a Saturday session from 09:00 to 10:00. It says Saturday evening and Sunday are closed. The operator also says open-gym time or private training can be booked between the weekday group sessions. Call +66 84 818 3994 and name the exact date and format you want; an advertised operating window is not the same as a guaranteed place in a class.</p>
      <p>The former affiliate address in the CrossFit directory is Classic Sport Club Pattaya on Pornprapanimit Road in Nong Prue. Use the venue's current page and exact map before travelling because a historical affiliate address does not prove that every present-day session uses the same entrance, room or booking process. This is an East Pattaya choice rather than a central-beach walk-in. The broader <a href="/area/east-pattaya/">East Pattaya directory</a> can help compare the location with other functional or strength gyms.</p>
      <h2>Price cannot be compared yet</h2>
      <p>No stable current operator-published drop-in, class-pack or monthly tariff was found on the public pages checked on 26 July 2026. The empty price field means the rate is unknown, not free. Ask whether the quote covers one coached group session, open gym, an introductory assessment or private training; also ask about registration, programme requirements, payment method and cancellation terms. Without an exact dated owner tariff, this category cannot support a numeric Pattaya CrossFit price range.</p>
      <h2>Who this option suits</h2>
      <p>Jungle Gym is relevant to a visitor who wants scheduled functional group training in East Pattaya and is willing to confirm the session directly. The published morning and evening weekday times can suit someone living nearby, while the Saturday morning slot offers one weekend option. It is a weaker fit for a reader who specifically requires an active CrossFit affiliate, needs a guaranteed central location, or wants to compare transparent drop-in prices before making contact.</p>
      <p>“CrossFit” is a licensed brand, not a generic synonym for every circuit, boot-camp or functional-fitness class. Other Pattaya gyms may train barbells, conditioning, HYROX-style work or mixed strength without being affiliates. Compare coaching format, class size, scaling for beginners, equipment, open-gym access and actual commute rather than choosing on the label alone.</p>
      <h2>Questions to ask before attending</h2>
      <ul>
        <li>Is the listed group session running on the exact date, and is advance booking required?</li>
        <li>Can a first-time visitor join, or is an induction or movement assessment required?</li>
        <li>What is the total price for the chosen class or open-gym period, and what does it include?</li>
        <li>How are movements scaled for injuries, beginners or athletes unfamiliar with Olympic lifts?</li>
        <li>Does the session use the current Jungle Gym location shown on the operator's map?</li>
      </ul>
      <p>For a focused explanation of the departed affiliate record and practical alternatives, continue to the <a href="/guides/crossfit-pattaya/">CrossFit in Pattaya guide</a>.</p>`,
  'fitness': `
      <p><strong>If you only read one thing: the fitness category is a 43-record mixed index, not a list of interchangeable weight rooms.</strong> As checked on 26 July 2026, it includes independent gyms, 24-hour chains, hotel fitness centres, Pilates studios, fight-club facilities and long-stay neighbourhood rooms. Forty-two records carry no closure or verification warning in the dataset; True Fitness Pattaya is explicitly unverified. A hotel-gym record normally describes an amenity for registered guests unless its own page documents public access.</p>
      <h2>Compare the access model before the price</h2>
      <p><a href="/gyms/coco-fitness/">Coco Fitness</a> publishes daily 07:00-22:00 hours and current operator material describing a central mall gym, but no numeric rate is repeated here because the record lacks an exact post-level tariff URL. <a href="/gyms/elite-gym-fitness/">Elite Gym &amp; Fitness</a> publishes a different menu on its exact rate page, checked on 25 July 2026: ฿400 for a day, ฿2,500 for ten visits valid for less than three months, ฿3,000 for one month, ฿300 for one group class and ฿2,000 for one hour of personal training. A day, visit pack, membership, class and personal-training hour are separate products.</p>
      <p>Long-stay pricing can be lower but less flexible. <a href="/gyms/better-bodies-gym-na-jomtien/">Better Bodies Gym</a> listed ฿2,500 for three months or ฿4,500 for six months paid in advance on 25 July 2026, but no drop-in amount. At the other end of the facilities spectrum, <a href="/gyms/fitz-club/">Fitz Club</a> published a ฿800 adult day pass for outside guests in its 2026 tariff, covering the gym, pool, sauna and steam rooms while excluding tennis and squash. Do not compare those figures without accounting for duration, facilities and public-access terms.</p>
      <h2>Twenty-four-hour does not mean walk-in at midnight</h2>
      <p>Jetts Little Walk and Anytime Fitness publish 24-hour member access, while Fitness 7 and several neighbourhood records advertise round-the-clock operation. Staffed reception, visitor registration, payment and first-entry procedures can be shorter. Holiday Inn Pattaya now documents two 24-hour fitness centres, but they are hotel facilities with an age-16 rule and no published non-resident pass. Use the <a href="/guides/24-hour-gyms-pattaya/">24-hour gym guide</a> to separate member door access from a staffed tourist visit.</p>
      <h2>Who this category suits</h2>
      <p>A short-stay visitor should prioritise a confirmed day or weekly pass, staffed arrival time, equipment needed and an exact map. A one- to six-month resident can compare prepayment, cancellation, key-card and branch access. Someone needing coaching should ask whether the price covers an assessment, a group class or private training. Pilates and hotel wellness records may be better for structured movement or an accommodation-led trip, but weaker for heavy free-weight training.</p>
      <p>Blank prices mean no stable current first-hand tariff was found, not free admission. Before paying, ask about registration, card or key deposit, towels, lockers, showers, class booking, trainer fees, outside shoes, air conditioning, parking and whether the quoted period follows calendar dates or a fixed number of entries. For a decision-led shortlist, continue to the <a href="/guides/best-gyms-in-pattaya/">best Pattaya gyms guide</a>.</p>`,
  'yoga': `
      <p><strong>If you only read one thing: the yoga category contains eight studio records, but only three have current first-hand prices suitable for a numeric comparison.</strong> As checked on 26 July 2026, seven records carry no closure or verification warning. Yoga Haus Pattaya is explicitly unverified because the current identity and operation could not be established strongly enough. A blank price on any of the other records means contact the studio; it does not mean a free class.</p>
      <h2>Three current price menus</h2>
      <p><a href="/gyms/yoga-pattaya-studio/">Yoga Pattaya Studio</a> publishes the broadest visitor menu. Prices checked on 25 July were ฿500 for a standard drop-in or ฿600 for an Ashtanga drop-in. An eight-class standard pass valid for one month was ฿3,100, while eight Ashtanga classes were ฿3,500. Monthly unlimited access was ฿4,500 for standard classes or ฿5,800 across all classes. The same operator listed private sessions at ฿1,500 for one person or ฿1,800 for two and publishes English, Russian and Thai instruction.</p>
      <p><a href="/gyms/ashtanga-yoga-pattaya/">Ashtanga Yoga Pattaya</a> listed a lower ฿300 drop-in, ฿1,000 for four classes valid one month, ฿2,000 for ten classes valid two months and ฿2,500 for one month of unlimited practice, checked on 25 July 2026. Its price page says payment is by cash or QR. That makes the studio useful for an Ashtanga-focused comparison, but a pack is only good value when its validity and class times fit the stay.</p>
      <p><a href="/gyms/balance-yoga-studio-pattaya/">Balance Yoga Pattaya</a> published ฿500 for a group yoga class on 25 July 2026. Its same price page also lists separate products: ฿1,500 for a nail-board class, ฿1,000 for a handmade nail board and ฿1,000 for group sound healing. Do not treat those wellness products as alternative yoga drop-ins. The studio timetable page seen during the check was labelled February 2026, so it is an example of programme structure rather than proof that the same class runs this week.</p>
      <h2>Style and timetable matter more than a category label</h2>
      <p>The eight records include Ashtanga, Vinyasa, Yin and broader studio or wellness formats. A business-hours window is not a class timetable, and an active social page does not guarantee that a visitor can walk into the next session. ONE-D Yoga, Nok Yoga, Chama, Lek Thai Yoga and the other contact-first records need a direct check for the exact style, level, language, class length, location and price. Yoga Haus should be treated more cautiously until its current operation is verified.</p>
      <p>For one or two sessions, a documented drop-in is usually easier than calculating the theoretical per-class value of a pack. For a longer stay, compare expiry dates, blackout days, booking limits, cancellation rules and whether unused entries are transferable. Private practice can suit a beginner, an injury-aware return or someone needing a specific language, but confirm teacher scope rather than assuming a yoga class provides medical rehabilitation.</p>
      <h2>Before attending</h2>
      <p>Send the studio the date, preferred class, experience level and teaching language. Ask whether advance booking is required, whether mats and props are included, which floor or building entrance to use, when to arrive, what to wear and how to pay. Reconfirm the timetable on the day when the public page is an old calendar or a social feed rather than a dated booking schedule.</p>
      <p>For a trip built around several sessions, continue to the <a href="/guides/yoga-retreat-pattaya/">Pattaya yoga guide</a>. Use the <a href="/category/yoga/">individual studio records</a> for exact maps and dated price evidence, keeping published visitor prices separate from private sessions, multi-class packs and adjacent sound or nail-board products.</p>`,
  'golf': `
      <p><strong>If you only read one thing: this is a regional golf index, not a list of 17 courses inside Pattaya.</strong> As checked on 26 July 2026, the category contains 17 records. Thirteen are full-course records used by the <a href="/guides/best-golf-courses-pattaya/">Pattaya golf-course guide</a>; three are practice businesses—Pattaya Golf Driving Range, Diana Driving Range and Golf Hub Pattaya—and Chatrium Golf Resort Soi Dao is a distant Chanthaburi resort with limited operation during phased renovation. Read the format and area before comparing any price.</p>
      <h2>Compare the required round, not the green fee alone</h2>
      <p><a href="/gyms/chee-chan-golf/">Chee Chan Golf Resort</a> published a rate card valid from 1 April to 30 September 2026. Checked on 25 July, its weekday 18-hole green fee was ฿4,500 and the compulsory 18-hole caddie-and-cart charge was ฿1,300, making the documented required weekday total ฿5,800. The weekend/public-holiday green fee was ฿5,500, making the corresponding required total ฿6,800. Optional equipment and tips remain separate.</p>
      <p><a href="/gyms/laem-chabang-international/">Laem Chabang International</a> listed an ฿3,500 weekday or ฿4,000 weekend 18-hole green fee, ฿450 caddie fee and ฿980 compulsory buggy on 25 July 2026. Those required items total ฿4,930 on a weekday or ฿5,430 at a weekend before tips. <a href="/gyms/pattaya-country-club/">Pattaya Country Club</a> listed ฿2,500/฿3,000 green fees, a ฿400 caddie and ฿600 cart, producing ฿3,500 and ฿4,000 totals on the same check date. These are dated operator prices, not permanent market rates.</p>
      <h2>Promotions need their eligibility and expiry</h2>
      <p><a href="/gyms/pattana-sports-resort/">Pattana Sports Resort</a> advertised ฿1,650 including green fee, caddie and cart for weekday tee times before 07:30 during 1–31 July 2026. The offer is restricted to Thai nationals and foreign residents in Thailand, so it is not a general tourist rate. <a href="/gyms/bangpra-international/">Bangpra Golf Club</a> published an ฿1,850 green-fee, cart and caddie package for 18 holes on 28–29 July 2026 only. Neither short offer should be extended beyond its dates or conditions.</p>
      <h2>Course, range and simulator answer different needs</h2>
      <p>A full-course record requires a tee time and may add caddie, cart, rental and tip costs. <a href="/gyms/pattaya-golf-driving-range/">Pattaya Golf Driving Range</a> is an outdoor practice record; Pattaya Sports Club lists ฿55 for 55 balls when its member card is shown, checked on 26 July 2026, but that is a conditional club benefit rather than the public tariff. <a href="/gyms/golf-hub-pattaya/">Golf Hub Pattaya</a> is an indoor launch-monitor, teaching, fitting and repair business with two branches and no current public tariff found. Diana is another range with no current ball price published.</p>
      <h2>Location and operation cautions</h2>
      <p>The category spans Na Jomtien, Huai Yai, Si Racha, Bo Win, Ban Bueng, Rayong and Chanthaburi as well as Pattaya practice facilities. A Pattaya name does not make every course a city-centre venue. Chatrium Soi Dao states that holes 10–18 are open from 25 July to 30 October 2026 while holes 1–9 remain under renovation, with all 18 due to reopen on 1 November. Confirm the loop and operation before making the longer journey.</p>
      <p>Before booking, ask for the complete date-specific total: green fee, caddie, cart or buggy rule, tip guidance, rental clubs, shoes, deposit, payment surcharge and cancellation terms. State the number of players and requested tee time. Blank prices in this directory mean no stable current first-hand tariff was found, not free admission. Use the individual records for exact maps and dated source links, then use the <a href="/guides/best-golf-courses-pattaya/">course guide</a> for the fixed 13-course comparison.</p>`,
  'racquet': `
      <p><strong>If you only read one thing: the racquet category is a 25-record regional index, not a single market of interchangeable court hours.</strong> As checked on 26 July 2026, it mixes tennis, padel, pickleball and badminton from Pattaya through Na Jomtien, Huai Yai, Si Racha and Laem Chabang. Twenty-four records have no closure flag; <a href="/gyms/diamond-badminton/">Diamond Badminton</a> is permanently closed. Pattaya Tennis Club is retained as an unverified generic legacy listing, so use one of the named active venues instead.</p>
      <h2>Compare a court hour with a court hour</h2>
      <p><a href="/gyms/siam-bayshore-tennis/">Siam Bayshore Pattaya</a> provides the clearest current tennis tariff. Its operator page checked on 26 July lists six daytime courts open to hotel guests and the public from 07:00 to 18:00. Court hire is ฿350 per hour. A racket is ฿150 per hour, four used balls are ฿100 per hour, a basket of balls is ฿300 per hour and a can of new balls is ฿300. In-house guests receive one complimentary daytime court hour, but that hotel inclusion is not free public access.</p>
      <p>Badminton can be cheaper, but the published examples are farther from the central beach corridor. <a href="/gyms/sb-badminton-huai-yai/">SB Badminton Huai Yai</a> lists ฿180 per court-hour and opens daily from 13:00 to 23:00, checked on 25 July 2026. Most other badminton records publish a phone and hours but no stable owner tariff. Ask whether the quote is for the whole court or each player and whether rackets, shuttlecocks, lighting or a deposit cost extra.</p>
      <h2>Padel prices change by time and format</h2>
      <p><a href="/gyms/pattaya-padel-club/">Pattaya Padel Club</a> publishes time-band pricing beside Mabprachan Reservoir: ฿600 per court-hour from 10:00 to 16:00 and ฿800 from 07:00 to 10:00 or 16:00 to 22:00. One-hour coaching ranges from ฿1,600 for one player to ฿2,600 for four. <a href="/gyms/play-padel-pattaya/">Play Padel Pattaya</a> lists an indoor Pratamnak court at ฿1,200 per hour, private coaching from ฿600 per hour and racket rental at ฿100 per hour. Both menus were checked on 25 July 2026.</p>
      <p><a href="/gyms/chilli-padel-club/">Chilli Padel Club</a> lists ฿1,000 per hour for a whole court for up to four players, with happy-hour courts from ฿600. Five of its six Jomtien courts are roofed. Its operator hours and Maps closing time disagree by one hour, so use the live booking schedule for the last slot. Prime Padel on Sukhumvit 41 offers booking, coaching and equipment hire but has no stable public price outside the live booking flow.</p>
      <h2>Choose by access and weather, not only price</h2>
      <p>A hotel court may require front-desk check-in even when public access is explicit. A dedicated club may require an app booking and prepayment. A social game or coached introduction is not the same product as an empty court, and a solo player should not assume partner matching. For outdoor tennis, ask about rain, lighting and the last playable start time. For padel in rainy season, a roofed or indoor court can matter more than the nominal hourly difference.</p>
      <p>Before paying, send the venue the sport, date, start time, player count and experience level. Confirm the exact pin, surface, court cover, footwear, balls or shuttlecocks, racket rental, coaching, cancellation and total price. Blank prices mean no stable current first-hand tariff was found, not free admission. Use the <a href="/guides/tennis-badminton-pattaya/">tennis and badminton guide</a> for a sport-led shortlist and the <a href="/guides/padel-pickleball-pattaya/">padel and pickleball guide</a> for booking formats.</p>`,
  'swimming': `
      <p><strong>Start by deciding whether you need lanes, a lesson or a leisure day.</strong> As checked on 26 July 2026, this category contains 15 records: eleven current Pattaya-area operator or facility records, one public-beach record, two unverified legacy public-pool identities and First Serve Sports Club, an exclusion record located in Nonthaburi rather than Pattaya. The current records still are not interchangeable. They include children's swim schools, hotel leisure pools, a water park, municipal or competition facilities and Wong Amat Beach.</p>
      <h2>Published admission is usually for leisure, not lap training</h2>
      <p><a href="/gyms/hard-rock-pool/">Hard Rock Hotel Pattaya Pool</a> explicitly publishes non-guest access. The operator page checked on 26 July 2026 listed entry from 09:00 to 19:00 at ฿500 net per adult including one selected cocktail and ฿400 net per child under 12 including one fruit punch; tube hire starts at ฿200 net per day. This is a 2,000-square-metre freeform family leisure-pool product, not proof of a reserved lap lane or a hotel-gym pass.</p>
      <p><a href="/gyms/nara-maze-pool-day-pass/">Nara Maze</a> published a separate non-resident day product at ฿500 net, checked on 24 July 2026. It included access from 09:00 to 18:00, one water, one smoothie and a 20% discount on non-alcoholic food and drink. Compare eligibility, operating hours and inclusions rather than treating identical headline amounts as identical access.</p>
      <p><a href="/gyms/ramayana-water-park/">Ramayana Water Park</a> is a full leisure-day product farther south. Its tourist promotion checked on 26 July 2026 listed ฿1,099 online or ฿1,199 at the entrance for visitors at least 106 centimetres tall, with shorter children admitted free. Lockers, towels and cabanas are separate choices. A water-park ticket is not a substitute for quiet swimming practice.</p>
      <h2>Children's lessons are courses, not pool admission</h2>
      <p><a href="/gyms/manta-kids-pattaya/">Manta Kids Pattaya</a> publishes structured course prices rather than casual entry. Checked on 25 July 2026, Splash, Swirl and Swim Beginner were ฿8,500, while Swim was ฿10,900. Before enrolment, ask how many lessons the named level includes, the assessment process, class size, parent requirements, make-up policy and expiry. Other swim-school records require the same product-level questions even when a stable first-hand price was not found.</p>
      <h2>Public access must be proved</h2>
      <p><a href="/gyms/nong-prue-municipal-swimming-pool/">Nong Prue Municipal Swimming Pool</a> has current council notices and published public hours, making it the strongest municipal-access record in the category. <a href="/gyms/pattaya-city-school-11-swimming-pool/">Pattaya City School 11 Swimming Pool</a> documents a 50-metre, eight-lane competition facility, but its public-use hours remain unverified. A facility's existence does not establish that an independent visitor can buy a lane session.</p>
      <p>The generic <a href="/gyms/pattaya-public-pool-jomtien/">Jomtien</a> and <a href="/gyms/pattaya-public-pool-naklua/">Naklua</a> public-pool records remain explicitly unverified. Do not use their old names, pins or former price claims to plan a visit. <a href="/gyms/wong-amat-beach/">Wong Amat Beach</a> is a public beach, where sea conditions, water quality, weather and supervision differ from a controlled pool.</p>
      <h2>Questions to ask before swimming</h2>
      <p>Send the venue the date, swimmer age and intended use: independent laps, instruction, family play or hotel recovery. Confirm public or non-guest eligibility, water depth, lane availability, supervision, swim-cap rules, towel and locker charges, child-height rules and the all-in price. Recheck weather and operating notices for outdoor facilities. Blank price fields mean no stable current first-hand tariff was found, not free entry; each dated amount above is a product snapshot, not a permanent city-wide price.</p>`,
  'watersports': `
      <p><strong>If you only read one thing: these 21 records are not 21 interchangeable activity tickets.</strong> As checked on 26 July 2026, the category contains ten scuba-centre records, four wind or paddle-school identities, sailing and marina records, a wake park, a public-island record and an aquarium. Seventeen records carry no closure or verification warning. <a href="/gyms/mermaids-dive/">Mermaids Dive Center</a> is closed, <a href="/gyms/aquanauts-dive-center/">Aquanauts Dive Center</a> is likely closed, and the generic <a href="/gyms/kitesurf-pattaya/">Kitesurf Pattaya</a> and <a href="/gyms/wave-pattaya/">Wave Pattaya Watersports</a> records remain unverified. Keep those warnings in the shortlist instead of treating every result as bookable.</p>
      <h2>Choose the product before the operator</h2>
      <p>A certified-diver boat day, first scuba experience, multi-day course, snorkelling passenger place, kitesurf lesson, independent equipment rental, sailing-club course and marina race entry solve different problems. Even two businesses with Central Pattaya shops may board from a pier or meet elsewhere. The shop pin is therefore not proof of the launch point, pickup zone or return time. Send the operator the date, participant count, qualification and intended activity before comparing totals.</p>
      <p>Scuba provides the clearest like-for-like examples, but only after the format is fixed. <a href="/gyms/no-limit-divers/">No Limit Divers</a> listed a two-dive certified-diver trip with equipment at ฿2,800 and two try dives with an instructor at ฿3,900 on 25 July 2026. <a href="/gyms/dive-station-pattaya/">Dive Station Pattaya</a> listed a sale-priced certified-diver day at ฿3,000 and SSI Basic Diver at ฿4,000. Its day products include lunch and two sites, but the beginner format comprises one confined-water dive and one open-water dive. The similar-looking totals therefore do not buy the same experience.</p>
      <h2>Training courses need an inclusion check</h2>
      <p>Entry-level certification is a multi-day training purchase rather than a casual sea day. <a href="/gyms/jomtien-dive-center/">Jomtien Dive Center</a> listed PADI Open Water from ฿15,900, while <a href="/gyms/pattaya-scuba-adventures/">Pattaya Scuba Adventures</a> listed ฿14,990 for one person or from ฿13,490 per person for two or more. Dive Station listed SSI Open Water at a ฿14,990 sale price. All were checked on 25 July 2026. Ask about e-learning, pool or confined-water work, boat dives, equipment, certification fees, medical declarations, transfers, minimum group size and rescheduling. Do not rank a course on the headline number until those inclusions match.</p>
      <p>For a first experience rather than certification, <a href="/gyms/adventure-divers-pattaya/">Adventure Divers</a> listed Discover Scuba Diving at ฿4,000. <a href="/gyms/real-divers-pattaya/">Real Divers</a> displayed a 2026 anniversary Discover Scuba Gold promotion at ฿4,900 for two coral-reef dives with photos and video. Promotions and site plans can change, and no directory record can promise visibility, marine life or a specific boat route.</p>
      <h2>Wind, foil and paddle prices depend on conditions and skill</h2>
      <p><a href="/gyms/clubloongchat-watersports/">Clubloongchat Watersports</a> in Na Jomtien published a one-hour lesson at ฿1,700 on 25 July 2026. Its equipment menu ranged from ฿300 for one hour of SUP or surf-board use to ฿1,500 for one hour of kite-and-foil rental. A first kitesurf or sailboat rental requires an instructor for the first hour at an additional ฿400. Those rates cannot be separated from the operator's skill and weather checks.</p>
      <p><a href="/gyms/kba-kiteboarding-pattaya/">KBA Kiteboarding Asia Pattaya</a> listed an operator-wide one-hour kitesurf trial at ฿2,200, a six-hour beginner course at ฿11,000 and a twelve-hour course at ฿20,000, with equipment included. Confirm that the product is available at the Blue Lagoon branch and obtain the branch-specific total, wind window and cancellation terms before paying. The two unverified generic wind-sport records should not be used as directions or price comparisons.</p>
      <h2>Sailing records are not walk-in beach rentals</h2>
      <p><a href="/gyms/royal-varuna-yacht-club/">Royal Varuna Yacht Club</a> is a member club and RYA-accredited training centre in Pratamnak. Training enquiries are possible, but current membership and course tariffs were not public on the pages checked. <a href="/gyms/ocean-marina-jomtien/">Ocean Marina Jomtien</a> published a ฿7,500 entry fee for a 2026 Platu regatta; that is a crew race entry, not general marina admission, a lesson price or a berth fee. <a href="/gyms/sailbreeze-ocean-marina/">SailBreeze Yacht Charter</a> is another enquiry-led marina product. State whether you need training, racing, a charter, club membership or berth services.</p>
      <h2>Two category results are context, not operator lessons</h2>
      <p><a href="/gyms/koh-larn-coral-island/">Koh Larn</a> is a public-island destination record. It does not turn every beach vendor into a verified watersports operator. <a href="/gyms/underwater-world-pattaya/">Underwater World Pattaya</a> is an aquarium, not a participatory water activity; its operator admission checked on 25 July 2026 was ฿550 for visitors over 131 centimetres and ฿320 for children 91-130 centimetres. These records help distinguish a destination or attraction from training and equipment hire.</p>
      <h2>Questions to settle before payment</h2>
      <p>Confirm the exact meeting point, start and expected return, participant age or height, swimming ability, certification and recent-dive requirements, medical form, instructor ratio, equipment and size availability, transfers, food, insurance, weather threshold, cancellation or rescheduling policy and complete price. For diving, ask who chooses the sites and whether a dive computer or torch is extra. For wind sport, ask what happens if conditions fail. Blank prices mean no stable current first-hand tariff was found, not free access. Use the <a href="/guides/diving-watersports-pattaya/">diving and watersports guide</a> for a decision-led shortlist.</p>`,
  'clubs': `
      <p><strong>If you only read one thing: the clubs category is a 26-record community-sport index, not a list of 26 staffed gyms.</strong> As checked on 26 July 2026, it mixes associations, weekly or occasional social groups, public courts and stadiums, annual events, cue sport, bowling, clinical rehabilitation and several context records. Pattaya Bowl and Pattaya Beach Aerobics are explicitly unverified. Pattaya Floating Market and Sanctuary of Truth carry non-sport warnings. The composite cycling record has no revalidated group ride, and the legacy Pattaya Triathlon record has no current Pattaya race date. Read the individual purpose and status before travelling.</p>
      <h2>Choose participation, membership or public access</h2>
      <p><a href="/gyms/pattaya-hash-house/">Pattaya Hash House Harriers</a> is a recurring Monday social trail event, not a permanent running venue. The operator publishes gathering outside Buffalo Bar from 14:30, a last bus at 15:00 and a first circle at 16:00; the trail changes each week. <a href="/gyms/pattaya-panthers-rugby/">Pattaya Panthers</a> is a team club. Its current page welcomes all levels to contact and touch rugby and publishes Thursday training from 19:15 to 20:45 at Horseshoe Point, subject to direct confirmation of the session and pitch.</p>
      <p><a href="/gyms/pattaya-sports-club/">Pattaya Sports Club Association</a> is an office and membership network covering sports information, discounts and golf services. It is not evidence of on-site courts for every sport named on its website. <a href="/gyms/pattaya-archery-club/">Pattaya Archery Club</a> is a non-profit range-based club in Huai Yai with scheduled shooting and beginner coaching. <a href="/gyms/jomtien-beach-volleyball/">Jomtien Beach Volleyball</a> is informal public play near the Sea Rescue station rather than a staffed court-booking business.</p>
      <h2>Current prices buy different things</h2>
      <p>PH3's operator fee checked on 25 July 2026 was ฿400 for men, ฿150 for women and ฿50 for children aged 16 or under. That amount covers the organised hash and its published transport and social arrangements; it is not a general trail admission fee. Pattaya Monkey H3 listed ฿1,300 for Run 125 on 25 July, including a shirt memento, transport, drinks, circle food and the post-run venue. Registration for that dated run had closed, so the amount must not be reused as the next event's fee.</p>
      <p>Pattaya Sports Club listed one year at ฿600 plus a ฿400 signup fee, or six years at ฿3,000 plus the same signup fee, checked on 25 July 2026. Archery has a different cost stack: adult club membership was ฿2,000 per year, the one-time joining fee ฿1,000 and required Pattaya Shooting Park membership at the club rate ฿2,500 per year. A Thai partner of a paid annual member or a child under 16 was ฿1,000 per year. Compare the full first-year obligation, not only the lowest membership line.</p>
      <p>For casual play, <a href="/gyms/sf-strike-bowl/">SF Strike Bowl</a> displayed ฿180 per person per game, ฿50 shoe rental and ฿50 to buy socks on 25 July 2026. Jomtien Beach Volleyball is described by its current organiser page as free, with donations welcomed for equipment. These are not evidence of a city-wide bowling, court or club price range. Blank price fields mean no stable current first-hand amount was found, not free admission.</p>
      <h2>Public facilities need a use check</h2>
      <p><a href="/gyms/sriracha-municipal-stadium/">Sriracha Municipal Stadium</a> publishes public exercise periods of 05:00-07:30 and 13:00-20:00 daily except public holidays. The gap between those periods is not public access, and general exercise hours do not grant a team exclusive use of football or basketball areas. <a href="/gyms/eastern-national-sports-center-pattaya/">Eastern National Sports Center</a> and <a href="/gyms/nong-prue-municipal-stadium/">Nong Prue Municipal Stadium</a> are other public-complex records where event use, team booking and casual exercise require separate confirmation.</p>
      <p>The category also retains self-directed or cultural context. Pattaya Public Running Locations is an informational route record, not an organiser. Khao Chi Chan and Big Buddha Hill can form part of a walking day but do not provide club supervision. Nong Nooch's staged martial-arts sequences are part of a cultural show, not a training class. The hospital rehabilitation record describes clinical assessment and therapy rather than an exercise club membership.</p>
      <h2>Match the record to the intended day</h2>
      <p>For a weekly social run, open the organiser's next-run page on the day. For rugby, cricket, archery or lawn bowls, send experience level and ask which group is appropriate. For a public stadium, state whether the goal is individual exercise, team practice or an event. For the Pattaya Marathon, use the current event page for registration and route instructions; an annual-event record is not a weekly club timetable.</p>
      <p>Before paying or travelling, confirm the date, meeting point, organiser, participant eligibility, distance or playing format, equipment and footwear, insurance or registration, transport, cancellation and complete price. For rotating trails or one-off events, save the current event instructions rather than the category pin. Use the <a href="/guides/running-cycling-clubs-pattaya/">running, cycling and clubs guide</a> for a participation-led shortlist, then treat the individual record's status and operator page as the final check.</p>`,
  'kids-youth': `
      <p><strong>If you only read one thing: choose the programme by the child's age, level and exact session, not by business hours.</strong> The kids-and-youth category contains 14 directory records as checked on 26 July 2026. It mixes four football programmes, seven martial-arts academies, a school sports programme and two legacy trampoline records. JUMPZ Harbor Pattaya is permanently closed and BOUNCE Pattaya is unverified; neither should be treated as a current family activity.</p>
      <h2>Football ranges from open sessions to selection</h2>
      <p><a href="/gyms/planet-football-pattaya/">Planet Football Pattaya</a> provides the clearest published route for a first visit. Its Saturday open sessions divide children into Mini Kicks ages 4-6, Kiddy Kickers ages 7-9 and Soccer School ages 10-13. The operator listed each open session at <strong>THB 400 per player</strong> when checked on 26 July 2026. Its Development Programme for ages 7-15 was <strong>THB 2,500 per calendar month</strong>, with a separate THB 2,500 annual membership that includes specified kit and a ball. These figures come from the operator's current programme pages and should be reconfirmed for the selected date.</p>
      <p>Planet's academy squad is invite-only, so an open-session price does not buy academy placement. <a href="/gyms/pattaya-city-football-academy/">Pattaya City Football Academy</a>, <a href="/gyms/fast-pro-football-academy/">FAST PRO</a> and <a href="/gyms/af-academy-pattaya/">AF Academy</a> are other youth-football records, but their public evidence does not produce the same complete current price-and-timetable comparison. Send the child's age, experience, preferred day and location before travelling; several programmes use more than one pitch.</p>
      <h2>Martial arts require class placement</h2>
      <p>The taekwondo and mixed-martial-arts records include Pesuso, two RSR identities, Rangsiya, STC Monkeys, Thanita and Rusich. Competition evidence confirms active teams or event pathways for several of them, but a tournament result is not a normal class timetable. <a href="/gyms/rsr-pattaya-taekwondo-team/">RSR Pattaya Taekwondo Team</a> publishes business hours of 13:00-20:00 on Monday and Wednesday-Friday and 09:00-20:00 on weekends, with Tuesday closed. <a href="/gyms/rsr-grand-taekwondo/">RSR Grand Taekwondo</a> lists 10:00-20:00 Tuesday-Sunday. Neither window means that a suitable child can begin at any hour.</p>
      <p><a href="/gyms/thanita-martial-arts-pattaya/">Thanita Martial Arts Pattaya</a> covers taekwondo, hapkido, pencak silat and kickboxing. <a href="/gyms/rusich-club-football/">Rusich Club</a> publishes several combat disciplines and age-specific sessions. Ask for the exact discipline rather than requesting “martial arts” generally. Confirm the coach, age and experience group, lesson language, contact level, protective equipment, parent-observation rule and whether a trial is available.</p>
      <h2>School facilities and closed attractions are different records</h2>
      <p><a href="/gyms/regents-international-school-pattaya/">Regents International School Pattaya Sports Programme</a> documents sport for pupils and announced camps. It is not a general public walk-in sports centre. A school pool, pitch or hall should not be converted into visitor access without a specific current programme and eligibility rule.</p>
      <p><a href="/gyms/jumpz-trampoline-park/">JUMPZ Harbor Pattaya</a> remains in the directory as a closure finding. Its exact Maps record was permanently closed and the operator's current branch list omitted Pattaya. <a href="/gyms/bounce-pattaya/">BOUNCE Pattaya</a> is an unverified legacy identity; BOUNCE Thailand's current venue selector lists Bangkok branches, not Pattaya. Do not use an old photo, review or generic mall reference as a reason to travel.</p>
      <h2>What to confirm before a child attends</h2>
      <p>Send the operator the child's age, experience, goal, chosen date and preferred language. Ask for the exact start and finish, venue pin, group size, coach, guardian or observation policy, trial rule, footwear, kit and protective equipment. Request the complete first-month cost: registration, uniform, insurance, grading, match or tournament fees and refunds can sit outside headline tuition. Ask how injuries, allergies or additional needs should be disclosed and who is responsible before and after the supervised session.</p>
      <p>A blank directory price means no stable current first-hand tariff was found, not free admission. For a wider family decision tree, continue to the <a href="/guides/kids-youth-sport-pattaya/">kids and youth sport guide</a>. Use the individual venue page for status and source dates, then reconfirm the exact session directly before travelling.</p>`,
  'equestrian': `
      <p><strong>If you only read one thing: Pattaya's equestrian category is a two-record Pong shortlist, not a walk-in riding menu.</strong> As checked on 26 July 2026, it contains <a href="/gyms/horseshoe-point-resort/">Horseshoe Point</a> and <a href="/gyms/thai-polo-equestrian-club/">Thai Polo &amp; Equestrian Club</a>. Both have current evidence of equestrian use east of Pattaya, and neither carries a closure or verification warning. Neither publishes a complete current public lesson, trail-ride, membership or spectator tariff in the sources checked.</p>
      <h2>Horseshoe Point is the direct riding-enquiry option</h2>
      <p>Horseshoe Point's official riding-school page describes private lessons, group lessons, trail rides and pony rides at its resort property at 100 Moo 9 in Pong. An approved March 2026 competition schedule also documents current equestrian use at the site. That combination makes it the more direct record for someone seeking a lesson or recreational ride, but it does not establish that a same-day visitor can arrive without a reservation.</p>
      <p>The operator's contact page lists +66 38 735 050, while the exact Maps identity lists +66 63 994 7165. No dependable current lesson timetable, trail duration, participant age or weight rule, helmet policy or price was published in the checked pages. Send the number of riders, ages, experience, preferred date and requested format before travelling. Ask whether the quote includes a horse, helmet, instructor, arena or trail time and any resort access.</p>
      <h2>Thai Polo is a competition and club complex</h2>
      <p>Thai Polo &amp; Equestrian Club occupies more than 2,000 rai in Pong. Its operator lists three full-sized polo grounds, two practice fields, cross-country and eventing courses, stables and an equine clinic. Current 2025/26 club fixtures and a February 2026 FEI schedule support active competition use. Those facts describe the scale and sporting purpose of the complex; they do not make it a public pony-ride attraction.</p>
      <p>The exact Maps listing gives 08:00-17:00 Tuesday-Sunday and Monday closed. Treat those as venue business hours, not a standing lesson timetable or a guarantee that spectators can enter every field. Ask the club whether the intended date is a competition, training day or closed preparation period, whether admission or registration is required, which entrance is in use and whether riding, lessons or club participation are available to the visitor.</p>
      <h2>Do not compare blank prices</h2>
      <p>The category has no current operator-published amount that supports a numeric price comparison. A blank field means the transaction was not found, not free entry or a negotiable rate. A private lesson, group lesson, pony ride, trail ride, polo activity, horse livery and event admission are separate products. Request the full dated quote for the exact product, including equipment, horse allocation, instructor, duration, taxes, deposit and cancellation or weather terms.</p>
      <h2>Plan for the inland location</h2>
      <p>Both records are in Pong, east of the beach districts. A shared area label does not prove that their gates are adjacent or that a ride-hailing pickup will be straightforward after an event. Open the exact pin, confirm the gate and arrange the return plan around the booked finish. Do not copy a fixed beach-hotel transfer time or fare into the decision.</p>
      <p>For a first recreational ride, contact Horseshoe Point with the requested lesson or trail format. For polo, eventing, competition access or a larger club complex, contact Thai Polo with the exact activity and date. In both cases, confirm clothing, closed shoes or boots, helmet provision, rider limits, insurance or waiver, supervision for children, photography rules and what happens in unsuitable weather. The <a href="/guides/equestrian-pattaya/">Pattaya equestrian and polo guide</a> provides the longer planning context, while the two individual records carry the current source dates and exact maps.</p>`,
  'climbing': `
      <p><strong>If you only read one thing: this category has one current climbing gym and one closure record.</strong> As checked on 26 July 2026, <a href="/gyms/bean-cow-climbing-gym/">STICKY Climbing Gym</a> in Huai Yai is active. <a href="/gyms/deep-climbing-gym/">Deep Climbing Gym</a>, formerly on the eighth floor of Harbor Pattaya, is permanently closed. Deep remains in the directory to prevent an old article, price or map pin from being mistaken for a current option.</p>
      <h2>The active option is STICKY in Huai Yai</h2>
      <p>STICKY is the current name of the venue formerly known as Bean Cow Climbing Gym &amp; Community Center. Its current material supports bouldering and roped climbing, and owner activity continued in July 2026. The exact Maps record confirms the 61/23 Moo 1 address and the current STICKY identity. This is an East Pattaya trip rather than a Harbor Pattaya mall visit, so use the live pin and check the route from the actual accommodation.</p>
      <p>The owner publishes opening from 11:00 to 20:00 Tuesday through Sunday, with closure every Monday and on the first day of each month. A normal Sunday opening therefore does not override a first-of-the-month closure. Holiday or event changes can still occur; recheck the latest operator post for the intended date.</p>
      <h2>No complete current day-pass price is published</h2>
      <p>A July 2026 owner update advertised a group discount but did not publish the underlying day-pass amount. A promotion without the base price is not an exact tariff, so this category does not calculate a discounted total or reproduce an older Bean Cow rate. Ask for the current adult and child day pass, promotion eligibility and validity before organising a group.</p>
      <p>Equipment is another separate cost question. The public descriptions establish climbing formats, but not a complete current rental menu. Ask whether shoes, harness and belay device are included or rented separately; whether chalk is permitted or supplied; and what identification or deposit is required. For roped climbing, state whether the party has an experienced belayer and which certification or in-house check the gym requires.</p>
      <h2>Choose the discipline and supervision level</h2>
      <p>Bouldering does not require a rope partner, while top-rope and lead climbing introduce belay and competence questions. A first-time visitor should tell the operator the number of climbers, ages, experience and desired format. Ask whether an induction, instructor or advance booking is required, what supervision is available for children, and whether the quoted session has a time limit. The page's broad “all skill levels” message should not be converted into permission to lead climb without an assessment.</p>
      <h2>Why Deep is not an alternative</h2>
      <p>Deep's exact Google Maps listing is marked permanently closed, and Harborland's current attraction site does not present it as an operating climbing gym. Its former telephone, hours, wall specifications and admission price have been removed from the venue record. Do not travel to Harbor Pattaya expecting that legacy venue or use an old review to compare it with STICKY.</p>
      <p>Before travelling to STICKY, reconfirm the date, opening, base day-pass price, group-promotion terms, equipment, belay rules, supervision and exact pin. Blank pricing means the current first-hand amount was not found, not free entry. For a longer practical overview, use the <a href="/guides/climbing-pattaya/">climbing in Pattaya guide</a>, but treat the individual venue status as the final word.</p>`,
  'adventure': `
      <p><strong>If you only read one thing: “adventure” is a 16-record mixed booking category, not one comparable type of attraction.</strong> As checked on 26 July 2026, it combines karting, off-road tours, shooting ranges, skydiving, aerial courses, tower activities, motorsport and football-pitch records. <a href="/gyms/flight-of-the-gibbon/">Flight of the Gibbon Pattaya</a> is closed, and <a href="/gyms/pattaya-bike-boat-tours/">Pattaya Bike and Boat Tours</a> is explicitly unverified. Those records remain visible as status findings; neither should be turned into a current booking recommendation.</p>
      <h2>Choose the transaction before comparing prices</h2>
      <p>A kart race, ammunition package, guided ATV route and tandem skydive have different duration, supervision, eligibility and cancellation rules. The category also includes bookable football venues such as Palladium FC, K Football Stadium and Premier Football Arena. A pitch booking is a team-sport transaction, not an adrenaline ticket. Start by naming the exact activity, participant count and date, then compare only products with matching inclusions.</p>
      <p><a href="/gyms/easykart-pattaya/">EasyKart Pattaya Thepprasit</a> publishes the clearest current kart menu. Prices checked on <strong>25 July 2026</strong> were <strong>THB 499 for one kids race</strong>, <strong>THB 699 for one regular race</strong> and <strong>THB 699 for one two-seat-kart race</strong>. Three-race products for regular, fast and two-seat karts were THB 1,999, while two fast-kart races were THB 1,499. The operator places the kids product at ages 7-13 and over 125 centimetres. Confirm how the venue assesses eligibility, which kart class applies, race length, passenger rules and whether the selected multi-race product includes the advertised shirt.</p>
      <h2>Shooting packages are defined by firearms and shots</h2>
      <p><a href="/gyms/dragon-shooting-club/">Dragon Shooting Club</a> publishes instructor-led indoor-range packages rather than a general admission ticket. Its operator menu checked on <strong>25 July 2026</strong> listed <strong>THB 2,000 for two firearms and 30 shots</strong>, THB 3,000 for three firearms and 30 shots, THB 4,500 for four firearms and 40 shots, THB 6,000 for three firearms and 50 shots, and THB 7,500 for four firearms and 85 shots. Non-package shooting was advertised from THB 1,000.</p>
      <p>Do not compare those totals without the named firearms and ammunition count. Ask the operator for the exact package, instructor supervision, identification and participant requirements, hearing and eye protection, accompanying-person rules and whether any target, range or payment charge is extra. The operator site and live listing publish different phone numbers, so use the venue page's exact sources and confirm which contact is handling the booking.</p>
      <h2>Off-road prices need route and vehicle detail</h2>
      <p><a href="/gyms/atv-tours-pattaya/">ATV &amp; Buggy Adventures Pattaya</a> sells guided countryside routes from Pong. Prices checked on <strong>25 July 2026</strong> were <strong>THB 2,990 for the 27-kilometre Explorer tour</strong> and <strong>THB 3,500 for the 34-kilometre Adventure tour</strong>. The operator describes about two hours of riding within an approximately three-hour activity. A private VIP upgrade was listed at THB 2,000 per group.</p>
      <p>The published tour page lists scheduled departures and specified transfer, passenger, equipment, refreshment and insurance inclusions. Reconfirm the hotel or pickup area, vehicle type, driver and passenger eligibility, group size, route choice, weather policy and the complete amount for the selected date. An ATV price is not automatically a buggy price, and “hotel transfer” does not prove that every accommodation is inside the pickup zone.</p>
      <h2>Skydiving is a weather-dependent booking</h2>
      <p><a href="/gyms/thai-sky-adventures-skydive/">Thai Sky Adventures</a> operates from Nong Kham in Si Racha rather than central Pattaya. Its April 2026 operator price list, checked on <strong>25 July 2026</strong>, listed a <strong>tandem skydive at THB 9,450</strong> and media products from THB 3,800. The same tariff described free round-trip Pattaya transfer for a tandem customer and one companion, subject to confirmation.</p>
      <p>A published amount does not guarantee that a jump departs at the requested time. Ask about advance booking, arrival time, participant documentation and eligibility, clothing, media choice, transfer address, companion arrangements and what happens when weather or operations delay or reschedule the jump. AFF and A-licence training are separate programmes; do not use the tandem price as a training-course estimate.</p>
      <h2>Karting, circuits and aerial parks are not duplicates</h2>
      <p><a href="/gyms/pattaya-kart-speedway/">Pattaya Kart Speedway</a> separates beginner, experienced-driver, children's-kart and ATV products. It is active and publishes current hours, but its rate images were not accessible enough to create a verified numeric tariff. <a href="/gyms/bira-circuit/">Bira Circuit</a> is a motorsport circuit with event and track-use questions rather than an ordinary walk-in kart ticket. <a href="/gyms/tarzan-adventure-pattaya/">Tarzan Adventure Pattaya</a> is a guided aerial-obstacle and zipline park; <a href="/gyms/pattaya-sky-ride-helicopter/">Pattaya Park Sky Ride</a> belongs to a tower-attraction setting. Confirm the named activity, operating session, age or size rule, supervision, equipment and weather policy for each record instead of carrying a price or safety assumption from another venue.</p>
      <h2>Status and booking checks</h2>
      <p>Do not travel to the closed Flight of the Gibbon record, and do not book the unverified bike-and-boat identity without establishing a current operator, exact route, address and written terms. Blank prices elsewhere mean no stable first-hand tariff was found, not free access. Football and arena records should be quoted by pitch, duration, team size and equipment; attraction records should be quoted by participant and named product.</p>
      <p>Before paying, request the exact date, start and finish, participant eligibility, supervision, included equipment, transfer or meeting point, taxes, deposit, payment surcharge, cancellation and weather terms. Save the operator's reply. The <a href="/guides/adventure-pattaya/">Pattaya adventure guide</a> provides the longer planning view, while each venue page carries the exact source and verification date used for its current price or status.</p>`
};

function categoryIntroSection(cat) {
  const intro = CATEGORY_INTRO[cat.key];
  if (!intro) return '';
  const body = CATEGORY_EDITORIAL[cat.key] || `<p>${esc(intro)}</p>`;
  return `
<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <article class="venue-body u-prose">
${body}
    </article>
  </div>
</section>`;
}

// Editorial guide funnel per category (SEO internal links)
const CATEGORY_GUIDE_LINKS = {
  'muay-thai':   { url: '/guides/best-muay-thai-pattaya/', label: 'Best Muay Thai gyms in Pattaya' },
  'mma':         { url: '/guides/bjj-mma-pattaya/', label: 'BJJ & MMA in Pattaya' },
  'bjj':         { url: '/guides/bjj-mma-pattaya/', label: 'BJJ & MMA in Pattaya' },
  'crossfit':    { url: '/guides/crossfit-pattaya/', label: 'CrossFit in Pattaya' },
  'fitness':     { url: '/guides/best-gyms-in-pattaya/', label: 'Best gyms in Pattaya' },
  'yoga':        { url: '/guides/yoga-retreat-pattaya/', label: 'Yoga in Pattaya' },
  'golf':        { url: '/guides/best-golf-courses-pattaya/', label: 'Best golf courses in Pattaya' },
  'racquet':     { url: '/guides/tennis-badminton-pattaya/', label: 'Tennis & badminton in Pattaya' },
  'swimming':    { url: '/guides/swimming-pools-pattaya/', label: 'Swimming pools in Pattaya' },
  'watersports': { url: '/guides/diving-watersports-pattaya/', label: 'Diving & watersports in Pattaya' },
  'climbing':    { url: '/guides/climbing-pattaya/', label: 'Climbing in Pattaya' },
  'clubs':       { url: '/guides/running-cycling-clubs-pattaya/', label: 'Running & cycling clubs' },
  'kids-youth':  { url: '/guides/kids-youth-sport-pattaya/', label: 'Kids & youth sport in Pattaya' },
  'equestrian':  { url: '/guides/equestrian-pattaya/', label: 'Equestrian & polo in Pattaya' },
  'adventure':   { url: '/guides/adventure-pattaya/', label: 'Adventure sport in Pattaya' }
};

function categoryGuideSection(cat) {
  const g = CATEGORY_GUIDE_LINKS[cat.key];
  if (!g) return '';
  return `
<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Editorial guide</div>
    <h2 class="h-section">Ranked <span class="accent-cyan">picks.</span></h2>
    <p class="lede">Hand-checked shortlist with trip context: <a href="${g.url}" class="u-cyan">${esc(g.label)} →</a></p>
  </div>
</section>`;
}

function categoryHubCtas(cat) {
  return `
    <div class="btn-row u-mt-5">
      <a href="/search/?cat=${esc(cat.key)}" class="btn btn-primary">▶ Search ${esc(cat.label)}</a>
      <a href="/compare/" class="btn btn-secondary">Compare venues</a>
      <a href="/plan-my-trip/?sport=${esc(cat.key)}" class="btn btn-ghost">Plan trip</a>
      <a href="/favorites/" class="btn btn-ghost">♡ Favorites</a>
    </div>`;
}

// ---------- Category FAQ content (Round 24) ----------
const CATEGORY_FAQS = (function () {
  try { return require('./data/category-faqs.js'); }
  catch (e) { return {}; }
})();
function categoryFaqLd(cat) {
  const faqs = CATEGORY_FAQS[cat.key];
  if (!faqs || !faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE}/category/${cat.key}/#faq`,
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}
function categoryFaqHtml(cat) {
  const faqs = CATEGORY_FAQS[cat.key];
  if (!faqs || !faqs.length) return '';
  const items = faqs.map(f =>
    `<details class="faq-item"><summary>${esc(f.q)}</summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`
  ).join('\n      ');
  return `
<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">03</span> Common questions</div>
    <h2 class="h-section">${esc(cat.label)} in Pattaya \u2014 <span class="accent-cyan">FAQ.</span></h2>
    <div class="faq-list">
      ${items}
    </div>
  </div>
</section>
`;
}

// ---------- Area FAQ content (Round 25) ----------
const AREA_FAQS = (function () {
  try { return require('./data/area-faqs.js'); }
  catch (e) { return {}; }
})();
function areaFaqLd(slug, label) {
  const faqs = AREA_FAQS[slug];
  if (!faqs || !faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE}/area/${slug}/#faq`,
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}
function areaFaqHtml(slug, label) {
  const faqs = AREA_FAQS[slug];
  if (!faqs || !faqs.length) return '';
  const items = faqs.map(f =>
    `<details class="faq-item"><summary>${esc(f.q)}</summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`
  ).join('\n      ');
  return `
<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">04</span> Common questions</div>
    <h2 class="h-section">${esc(label)} \u2014 <span class="accent-cyan">FAQ.</span></h2>
    <div class="faq-list">
      ${items}
    </div>
  </div>
</section>
`;
}

// ---------- Shared HTML components ----------
const ASSET = `?v=${ASSET_VERSION}`;

function syncCssFontVersion() {
  const cssPath = path.join(ROOT, 'styles.css');
  let css = fs.readFileSync(cssPath, 'utf8');
  const updated = css.replace(/\/fonts\/([a-z0-9-]+\.woff2)\?v=\d+/g, `/fonts/$1?v=${ASSET_VERSION}`);
  if (updated !== css) fs.writeFileSync(cssPath, updated, 'utf8');
}

// FOOTER-SPEC-2026: every page carries author + publisher references to the
// TimPaemi entity (@id https://timpaemi.com/#timpaemi) plus the Organization
// entity itself, emitted once per page.
const { timpaemiRef, timpaemiOrganization, authorRefs, authorPersons } = require('./scripts/lib/timpaemi-author');
function withTimpaemiLd(jsonLd, url, title, modified) {
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? [...jsonLd] : [jsonLd]) : [];
  const isPageNode = b => b && typeof b['@type'] === 'string' && /Page$/.test(b['@type']) && b['@type'] !== 'FAQPage';
  const page = blocks.find(isPageNode);
  // author = the two people, publisher = the company. They are different things
  // and Google reads them differently; do not collapse them back into one node.
  if (page) {
    if (!page.author) page.author = authorRefs();
    if (!page.publisher) page.publisher = timpaemiRef();
    if (modified && !page.dateModified) page.dateModified = modified;
  } else {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url: url,
      name: title,
      author: authorRefs(),
      publisher: timpaemiRef(),
      ...(modified ? { dateModified: modified } : {})
    });
  }
  blocks.push({ '@context': 'https://schema.org', ...timpaemiOrganization() });
  // The Person nodes the refs above point at. Emitted once per page so every
  // @id in the graph resolves locally rather than dangling.
  for (const person of authorPersons()) blocks.push({ '@context': 'https://schema.org', ...person });
  return blocks;
}


/* Resolve a venue OG card at build time. Falls back to the site card when the
   per-venue PNG was never generated, so no page can ship a 404 image path. */
const OG_DIR = path.join(ROOT, "og");
const OG_PRESENT = fs.existsSync(OG_DIR)
  ? new Set(fs.readdirSync(OG_DIR).filter(f => f.endsWith(".png")).map(f => f.slice(0, -4)))
  : new Set();
let OG_FALLBACKS = 0;
function venueOgImage(id) {
  if (OG_PRESENT.has(id)) return `${SITE}/og/${id}.png`;
  OG_FALLBACKS++;
  return `${SITE}/og-image.png`;
}


/* The hours pill used to ship the literal string "Checking hours..." and wait for the
   inline open-status script to replace it with a live "Open, closes 20:00" state.
   That script works fine for humans. But 105 of 215 venue pages therefore told every
   crawler, snippet generator and AI retriever that this venue's opening hours were
   "Checking hours..." - the one fact they most need, replaced by a spinner.
   Render the real hours into the HTML instead. The inline script still overwrites
   textContent on load, so readers keep the live status and machines get a fact. */
function hoursPillLabel(raw) {
  const s = String(raw || '').trim();
  if (!s) return 'Hours on request';
  // Take the first clause; a pill cannot carry "Mon-Sat 07:00-09:00 and 15:00-18:30; Sun closed".
  let first = s.split(';')[0].trim().replace(/\s+and\s+\d.*$/i, '').trim();
  if (first.length > 34) first = first.slice(0, 33).trimEnd() + '\u2026';
  return first;
}

/* Site-wide content date. Hub pages (categories, areas, area x category, info pages)
   have no verification date of their own, so they inherit the newest venue check on
   the site. Every page then carries a dateModified, which is what a crawler uses to
   decide whether a re-crawl is worth it. Derived, never typed. */
const SITE_MODIFIED = (() => {
  const dates = GYMS.map(g => g.verified).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
  return dates.length ? dates.sort().pop() : new Date().toISOString().slice(0, 10);
})();

function head({ title, desc, url, ogImage = `${SITE}/og-image.png`, jsonLd = null, modified = null, robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }) {
  // One <script> per JSON-LD item; Person authors + Organization publisher on every page.
  const ldBlocks = withTimpaemiLd(jsonLd, url, title, modified)
    .map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(truncateTitle(title))}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta name="theme-color" content="#f7f8f3">
<meta name="color-scheme" content="light">
<link rel="preload" href="/styles.css${ASSET}" as="style">
<link rel="stylesheet" href="/styles.css${ASSET}">
<!-- Self-hosted fonts — preload only the LCP display face -->
<link rel="preload" href="/fonts/space-grotesk.woff2${ASSET}" as="font" type="font/woff2" crossorigin>
<link rel="alternate" type="application/json" href="/feed.json" title="Pattaya.Gym feed">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pattaya.Gym">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@PattayaGym">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="author" content="TimPaemi (timpaemi.com)">
<meta name="robots" content="${robots}">
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="//maps.google.com">
<link rel="dns-prefetch" href="//www.googletagmanager.com">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/icon-180.png">
<link rel="manifest" href="/manifest.json">
${ldBlocks}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>`;
}

function topMarquee(items) {
  const set = items.map(it => it.star ? `<span class="star">·</span>` : `<span>${esc(it)}</span>`).join('');
  // Build using interleaved star separator
  const inner = items.map(item => `<span>${esc(item)}</span><span class="star">·</span>`).join('');
  return `<div class="marquee" aria-hidden="true">
  <div class="marquee-track">
    <div class="marquee-set">${inner}</div>
    <div class="marquee-set" aria-hidden="true">${inner}</div>
  </div>
</div>`;
}

function bottomMarquee(items) {
  const inner = items.map(item => `<span>${esc(item)}</span><span class="star">·</span>`).join('');
  return `<div class="marquee marquee-bottom" aria-hidden="true">
  <div class="marquee-track">
    <div class="marquee-set">${inner}</div>
    <div class="marquee-set" aria-hidden="true">${inner}</div>
  </div>
</div>`;
}

const { v2NavHtml } = require('./scripts/lib/v2-nav.js');
function nav() {
  return v2NavHtml();
}

function pageScripts() {
  return `<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${ASSET}"></script>`;
}

function venuePageScripts() {
  return `<script src="/data.js${ASSET}"></script>
<script defer src="/favorites.js${ASSET}"></script>
${pageScripts()}`;
}

function venueFavoriteBtn(g, opts) {
  const hero = opts && opts.hero;
  const cls = hero ? 'favorite-btn venue-hero-save' : 'favorite-btn';
  return `<button type="button" class="${cls}" data-pg-favorite-id="${esc(g.id)}" data-pg-favorite-name="${esc(g.name)}" data-pg-favorite-category="${esc(g.category)}" data-pg-favorite-area="${esc(g.area)}" data-pg-favorite-price="${esc(g.priceRange)}" aria-pressed="false" aria-label="Save to favorites"><span class="fav-heart" aria-hidden="true">&#9825;</span><span class="fav-btn-label">Save</span></button>`;
}

function venueToolsStrip(g) {
  const sport = g.category || 'any';
  return `
<section class="section u-pt-0 venue-tools-strip" id="venue-tools">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Next steps</div>
    <h2 class="h-section" style="font-size:clamp(20px,3vw,28px);">Use our <span class="accent-yellow">directory tools.</span></h2>
    <div class="btn-row venue-tools-actions">
      <a href="/compare/?a=${esc(g.id)}" class="btn btn-secondary">Compare with others</a>
      <a href="/plan-my-trip/?sport=${esc(sport)}" class="btn btn-ghost">Plan a trip</a>
      <a href="/favorites/" class="btn btn-ghost">♡ Favorites</a>
      <a href="/search/?cat=${esc(sport)}" class="btn btn-ghost">Search ${esc(sport)}</a>
    </div>
  </div>
</section>`;
}

function venueListingCard(v) {
  const cat = CATEGORIES.find(c => c.key === v.category);
  const tags = (v.tags || []).slice(0, 3).map(t => `<span class="cv-pill cv-pill-tag">${esc(t)}</span>`).join('');
  const desc = v.description || '';
  const descShort = desc.length > 180 ? desc.slice(0, 180).trim() + '…' : desc;
  return `<article class="cat-venue-card">
      <div class="cv-head">
      <h3><a href="/gyms/${v.id}/">${esc(v.name)}</a></h3>
      ${venueFavoriteBtn(v)}
    </div>
    <div class="cv-meta">${cat ? esc(cat.label) + ' · ' : ''}${esc(v.area || '')}</div>
    ${v.hours ? `<div class="cv-meta">${esc(v.hours)}</div>` : ''}
    ${descShort ? `<p>${esc(descShort)}</p>` : ''}
    <div class="cv-tags">
      <span class="cv-pill">${esc(v.priceRange || '—')}</span>
      ${tags}
    </div>
    <a class="cv-cta" href="/gyms/${v.id}/">View full page →</a>
  </article>`;
}

function paNetwork() {
  return '';
}

function backToTop() {
  return `<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>`;
}

const { siteFooterHtml } = require('./scripts/lib/site-footer.js');
function footer(scripts) {
  const scriptBlock = scripts || pageScripts();
  return `${siteFooterHtml(VENUE_N)}
${backToTop()}
${scriptBlock}
</body>
</html>`;
}

// Standard top/bottom marquee items (venue count follows GYMS.length)
const TOP_MARQUEE = ['★ EVERY GYM', 'EVERY RING', 'EVERY COURT', `${VENUE_N} VENUES`, 'HAND-CHECKED', 'NO PAID PLACEMENTS', 'PATTAYA · THAILAND', 'UPDATED ROLLING'];
const BOTTOM_MARQUEE = ['★ PATTAYA VILLA', 'NO PAID PLACEMENTS', 'HAND-CHECKED', 'EVERY GYM', 'EVERY RING', 'EVERY COURT', `★ LIVE ${VENUE_N} VENUES`, 'UPDATED ROLLING'];

function breadcrumb(items) {
  // items: [{label, href}], last has no href
  const parts = items.map((it, i) => {
    const isLast = i === items.length - 1;
    if (isLast) return `<span class="u-text-bold">${esc(it.label)}</span>`;
    return `<a href="${it.href}" class="u-muted">${esc(it.label)}</a>`;
  });
  return `<nav aria-label="Breadcrumb" class="site-breadcrumb">
  ${parts.join(' <span class="u-crumb-sep">/</span> ')}
</nav>`;
}

// ---------- Venue page ----------
// Additive: per-venue FAQPage built from verified data fields (no invented facts).
function venueFaqLd(g, catLabel, url) {
  const n = g.name;
  const faqs = [];
  if (g.area) faqs.push({ q: `Where is ${n} located?`, a: `${n} is located in ${g.area}, Pattaya, Thailand. The full address and map are on this page.` });
  faqs.push({ q: `What kind of venue is ${n}?`, a: `${n} is listed under ${catLabel} in the Pattaya sports & fitness directory.` });
  if (g.hours) faqs.push({ q: `What are ${n}'s opening hours?`, a: `${n} is listed with these hours: ${g.hours}. Confirm directly before visiting.` });
  if (faqs.length < 4 && g.phone) faqs.push({ q: `How do I contact ${n}?`, a: `You can reach ${n} by phone at ${g.phone}. Contact details are on this page.` });
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqs.slice(0, 4).map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}
function venuePage(g, fm, body) {
  const cat = CATEGORIES.find(c => c.key === g.category);
  const catLabel = cat ? cat.label : g.category;
  const url = `${SITE}/gyms/${g.id}/`;
  const title = venueSeoTitle(g, catLabel);
  const desc = venueSeoDesc(g, catLabel);
  // OG card: per-venue if one was generated, otherwise the site card. Never emit a path
  // that 404s - 58 venue pages shipped a missing /og/<slug>.png on 2026-07-27, which broke
  // every social share AND the `image` property of their LocalBusiness JSON-LD.
  const ogImage = venueOgImage(g.id);

  // Color accent based on category
  const accentColors = {
    'muay-thai': { color: 'pink', class: 'accent-pink' },
    'mma': { color: 'pink', class: 'accent-pink' },
    'bjj': { color: 'pink', class: 'accent-pink' },
    'fitness': { color: 'yellow', class: 'accent-yellow' },
    'crossfit': { color: 'yellow', class: 'accent-yellow' },
    'golf': { color: 'mint', class: 'accent-mint' },
    'yoga': { color: 'cyan', class: 'accent-cyan' },
    'racquet': { color: 'cyan', class: 'accent-cyan' },
    'swimming': { color: 'cyan', class: 'accent-cyan' },
    'watersports': { color: 'cyan', class: 'accent-cyan' },
    'climbing': { color: 'mint', class: 'accent-mint' },
    'clubs': { color: 'mint', class: 'accent-mint' },
    'kids-youth': { color: 'yellow', class: 'accent-yellow' },
    'equestrian': { color: 'mint', class: 'accent-mint' },
    'adventure': { color: 'mint', class: 'accent-mint' },
  };
  const accent = accentColors[g.category] || { color: 'pink', class: 'accent-pink' };

  // Strip parenthetical from headline name (e.g. "Foo (Bar / Baz)" -> "Foo" + subtitle "(Bar / Baz)")
  const parenMatch = g.name.match(/^(.+?)\s*[\(（]([^)）]+)[\)）]\s*$/);
  const displayName = parenMatch ? parenMatch[1].trim() : g.name;
  const subtitleName = parenMatch ? parenMatch[2].trim() : null;

  // Split for headline accent — last word gets the accent color
  const nameWords = displayName.split(/\s+/);
  const lastWord = nameWords.pop();
  const firstWords = nameWords.join(' ');

  // Related venues (same category, different venue, up to 3)
  const related = GYMS.filter(x => x.category === g.category && x.id !== g.id).slice(0, 3);

  // JSON-LD — rich LocalBusiness + BreadcrumbList graph
  const lbType = localBusinessType(g.category);
  const address = parsePostalAddress(fm.address || g.address, fm.area || g.area);
  // Prefer data.js short form for parsing (frontmatter often contains prose); fall back to fm if data.js empty.
  let hoursSpec = parseHoursSpec(g.hours);
  if (!hoursSpec.length) hoursSpec = parseHoursSpec(fm.hours);
  const sameAs = [g.website, fm.website, fm.social?.facebook ? `https://facebook.com/${fm.social.facebook}` : null, fm.social?.instagram ? `https://instagram.com/${fm.social.instagram}` : null, g.social?.facebook ? `https://facebook.com/${g.social.facebook}` : null, g.social?.instagram ? `https://instagram.com/${g.social.instagram}` : null].filter((v, i, a) => v && a.indexOf(v) === i);
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': lbType.length === 1 ? lbType[0] : lbType,
    '@id': `${url}#business`,
    name: g.name,
    description: g.description,
    url: url,
    image: ogImage,
    priceRange: fm.priceRange || g.priceRange || undefined,
    address: address || undefined,
    telephone: (fm.phone || g.phone) ? (phoneToTel(fm.phone || g.phone) || (fm.phone || g.phone)) : undefined,
    email: fm.email || undefined,
    geo: (function() {
      // Priority: 1) frontmatter override, 2) Nominatim geocode cache, 3) none
      // Round 17 — Codex F04.1: round to 6 decimals (~11cm precision).
      const round6 = n => Number(Number(n).toFixed(6));
      if (fm.lat && fm.lng) {
        return { '@type': 'GeoCoordinates', latitude: round6(fm.lat), longitude: round6(fm.lng) };
      }
      const cached = VENUE_GEO[g.id];
      if (cached && cached.lat && cached.lng && !cached.failed && cached._flag !== 'outside_pattaya_region') {
        return { '@type': 'GeoCoordinates', latitude: round6(cached.lat), longitude: round6(cached.lng) };
      }
      return undefined;
    })(),
    openingHoursSpecification: hoursSpec.length ? hoursSpec : undefined,
    openingHours: (!hoursSpec.length && (fm.hours || g.hours)) ? (fm.hours || g.hours) : undefined,
    areaServed: { '@type': 'City', name: 'Pattaya' },
    sameAs: sameAs.length ? sameAs : undefined
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: catLabel, href: `/category/${g.category}/` },
      { label: g.name }
    ], url)
  };
  const jsonLd = [localBusiness, breadcrumbLd, venueFaqLd(g, catLabel, url)].filter(Boolean);

  const bodyHtml = mdToHtml(body);

  // Prefer frontmatter (rich) over data.js (basic). Fallback chain: fm → g.
  const v = {
    address: fm.address || g.address,
    area: fm.area || g.area,
    hours: fm.hours || g.hours,
    priceRange: fm.priceRange || g.priceRange,
    phone: fm.phone || g.phone,
    email: fm.email || null,
    website: fm.website || g.website,
    mapsUrl: fm.mapsUrl || g.mapsUrl,
    founded: fm.founded || g.founded,
    founders: fm.founders || g.founders,
    currentDirector: fm.currentDirector || null,
    trainerHeadcount: fm.trainerHeadcount || g.trainerHeadcount,
    minimumAge: fm.minimumAge || g.minimumAge,
    languages: fm.languages || g.languages,
    verified: fm.verified || g.verified,
    social: fm.social || g.social || {}
  };

  // Build info rows for the data grid (only show populated fields)
  const infoFields = [
    v.address && { lbl: 'Address', val: v.address, link: v.mapsUrl, color: 'mint' },
    v.area && !v.address && { lbl: 'Area', val: v.area, color: 'cyan' },
    v.hours && { lbl: 'Hours', val: v.hours, color: 'cyan' },
    v.priceRange && { lbl: 'Price', val: v.priceRange, color: 'yellow' },
    v.phone && { lbl: 'Phone', val: v.phone, link: 'tel:' + phoneToTel(v.phone), color: 'pink' },
    v.email && { lbl: 'Email', val: v.email, link: 'mailto:' + v.email, color: 'cyan' },
    v.website && { lbl: 'Website', val: v.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), link: v.website, color: 'cyan' },
    v.founded && { lbl: 'Founded', val: v.founded, color: 'yellow' },
    v.founders && { lbl: 'Founders', val: Array.isArray(v.founders) ? v.founders.join(', ') : v.founders, color: 'pink' },
    v.currentDirector && { lbl: 'Director', val: v.currentDirector, color: 'mint' },
    v.trainerHeadcount && { lbl: 'Trainers', val: v.trainerHeadcount, color: 'pink' },
    v.minimumAge && { lbl: 'Min age', val: v.minimumAge, color: 'cyan' },
    v.languages && { lbl: 'Languages', val: Array.isArray(v.languages) ? v.languages.join(', ') : v.languages, color: 'mint' },
    v.verified && { lbl: 'Last verified', val: v.verified, color: 'pink' }
  ].filter(Boolean);

  return head({ title, desc, url, ogImage, jsonLd, modified: g.verified || undefined })
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: catLabel, href: `/category/${g.category}/` },
        { label: g.name }
      ])
    + `
<main id="main">

<section class="hero u-pt-10-pb-8">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// ${esc(catLabel)}${g.area ? ' · ' + esc(g.area.split(/[—\/,]/)[0].trim()) : ''}${g.priceRange ? ' · ' + esc(g.priceRange) : ''}</div>
    <h1 class="hero-h1 u-h-fluid">
      ${firstWords ? esc(firstWords) + '<br>' : ''}<span class="${accent.class}">${esc(lastWord)}.</span>
    </h1>
    ${subtitleName ? `<p style="font-family:var(--font-mono); font-size:13px; color:var(--muted); letter-spacing:0.08em; margin:var(--s-4) 0 0; text-transform:uppercase;">${esc(subtitleName)}</p>` : ''}
    ${g.verified ? `<div class="trust-bar" aria-label="Verification status">
      ${g.status === 'closed' ? `<span class="trust-pill is-permanently-closed" title="This venue has permanently closed">Permanently closed</span>` : ''}
      ${g.featured ? `<span class="trust-pill is-editors-pick" title="Editor's Pick — hand-selected as a top venue in this category">★ Editor's Pick</span>` : ''}
      ${g.status !== 'closed' && hoursSpec.length ? `<span class="trust-pill is-open-status" data-hours-spec='${JSON.stringify(hoursSpec).replace(/'/g, '&#39;')}'>● ${esc(hoursPillLabel(g.hours || fm.hours))}</span>` : ''}
      <span class="trust-pill is-verified" title="Hand-checked by Tim Paemi">★ Verified by Tim · ${esc(g.verified)}</span>
      <span class="trust-pill">100% Hand-checked</span>
      <span class="trust-pill">No paid placement</span>
      <a href="/methodology/" class="trust-pill is-link" title="How we rank venues">How we rank →</a>
    </div>` : ''}
    ${g.description ? `<p class="hero-lede u-lede-h">${esc(g.description)}</p>` : ''}
    <div class="venue-hero-ctas-wrap">
      <div class="btn-row u-btn-row-left venue-hero-ctas" id="venue-hero-ctas">
        ${g.phone ? `<a href="tel:${esc(phoneToTel(g.phone))}" class="btn btn-primary">▶ Call gym</a>` : ''}
        
        ${g.mapsUrl ? `<a href="${esc(g.mapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">Map</a>` : ''}
        ${venueFavoriteBtn(g, { hero: true })}
        <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Inquiry: ' + g.name)}" class="btn btn-tertiary btn-venue-more">Email →</a>
        ${g.website ? `<a href="${esc(g.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-venue-more">Website →</a>` : ''}
        <button type="button" class="btn btn-ghost btn-venue-more share-venue-btn" data-share-title="${esc(g.name)}" data-share-url="${url}">↗ Share</button>
      </div>
      <button type="button" class="btn btn-ghost venue-more-toggle" aria-expanded="false" aria-controls="venue-hero-ctas">+ More actions</button>
    </div>
  </div>
</section>

${infoFields.length ? `
<section class="section u-pt-4-pb-8">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Venue info</div>
    <div style="display:grid; grid-template-columns:1fr; gap:0; border:1px solid var(--line); border-radius:var(--r-lg); overflow:hidden; background:var(--surface);">
      ${infoFields.map((f, i) => `
      <div style="display:grid; grid-template-columns:130px 1fr; gap:var(--s-4); padding:var(--s-4) var(--s-5);${i < infoFields.length-1 ? ' border-bottom:1px solid var(--line);' : ''}">
        <div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); font-weight:600; letter-spacing:0.10em; text-transform:uppercase;">${esc(f.lbl)}</div>
        <div style="font-size:14px; color:var(--text); font-weight:500; line-height:1.5;${f.color === 'pink' ? ' color:var(--pink);' : ''}${f.color === 'cyan' ? ' color:var(--cyan);' : ''}${f.color === 'mint' ? ' color:var(--mint);' : ''}${f.color === 'yellow' ? ' color:var(--yellow);' : ''}">
          ${f.link ? `<a href="${esc(f.link)}"${f.link.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''} class="u-deemphasized">${esc(f.val)}</a>` : esc(f.val)}
        </div>
      </div>
      `).join('')}
    </div>
  </div>
</section>
` : ''}

${bodyHtml ? `
<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> About this venue</div>
    <article class="venue-body u-prose" id="venue-body">
      ${bodyHtml}
    </article>
    ${Array.isArray(fm.sources) && fm.sources.length ? `
    <div class="venue-sources u-max-760-mt-8">
      <div class="eyebrow u-mb-3"><span class="num">★</span> Sources we checked</div>
      <p class="u-info-card">Every claim on this page is verified against the venue's own sources. If something looks wrong, <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Inaccurate info: ' + g.name)}&body=${encodeURIComponent('Hi Tim — I noticed the following on /gyms/' + g.id + '/ that needs updating:\\n\\n')}" class="u-cyan">tell us</a> and we'll re-check as fast as we can.</p>
      <ul class="venue-source-list">
        ${fm.sources.map(s => `<li><a href="${esc(s)}" target="_blank" rel="noopener noreferrer">${esc(s.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></li>`).join('')}
      </ul>
    </div>` : ''}
    <div class="venue-report-info u-max-760-mt-6">
      <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Suggest update: ' + g.name)}&body=${encodeURIComponent('Hi Tim — I have an update for /gyms/' + g.id + '/:\\n\\n(your update here)\\n\\nSource link (if any):\\n\\nThanks!')}" class="report-info-link">
        <span class="report-info-icon"></span>
        <span class="report-info-text">Spot an error or have an update? <strong>Tell us</strong> — we'll re-check as fast as we can.</span>
      </a>
    </div>
    <div id="recently-viewed-mount" data-current-id="${esc(g.id)}" data-current-name="${esc(g.name)}"></div>
  </div>
</section>
<script>
 (function(){
  var KEY = 'pgym_recent_v1';
  var mount = document.getElementById('recently-viewed-mount');
  if (!mount) return;
  var currentId = mount.getAttribute('data-current-id');
  var currentName = mount.getAttribute('data-current-name');
  var list;
  try {
    list = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(list)) list = [];
  } catch (e) { list = []; }
  // Push current to front; dedupe; cap at 8
  list = [{ id: currentId, name: currentName, ts: Date.now() }]
    .concat(list.filter(function(x){ return x && x.id !== currentId; }))
    .slice(0, 8);
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  // Render OTHER recently-viewed (excluding current)
  var others = list.filter(function(x){ return x.id !== currentId; }).slice(0, 6);
  if (others.length === 0) return;
  var html = '<div class="recently-viewed">'
    + '<div class="recently-viewed-h">// You also viewed</div>'
    + '<div class="recently-viewed-list">'
    + others.map(function(v){
        var safe = v.name.replace(/[<>"&]/g, function(c){ return { '<':'&lt;','>':'&gt;','"':'&quot;','&':'&amp;' }[c]; });
        return '<a class="recently-viewed-item" href="/gyms/' + encodeURIComponent(v.id) + '/">' + safe + '</a>';
      }).join('')
    + '</div></div>';
  mount.innerHTML = html;
})();
</script>
<script>
 (function(){
  // OPEN-NOW INDICATOR
  // Reads each .is-open-status pill's data-hours-spec attribute (parsed openingHoursSpecification),
  // compares against current Pattaya time, and replaces text with "● Open · closes HH:MM" or
  // "○ Closed · opens HH:MM (Mon/Tue/...)".
  var DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function pattayaNow() {
    var n = new Date();
    return new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 7 * 3600000);
  }
  function minutesOfDay(hhmm) {
    var p = String(hhmm).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1] || '0', 10);
  }
  function nextOpening(spec, now) {
    // Find the next opening time across the next 7 days starting from now
    var todayDow = DAY_NAMES[now.getDay()];
    var nowMin = now.getHours() * 60 + now.getMinutes();
    // Same-day opening still ahead?
    for (var i = 0; i < spec.length; i++) {
      if (spec[i].dayOfWeek.indexOf(todayDow) >= 0 && minutesOfDay(spec[i].opens) > nowMin) {
        return { day: 'today', time: spec[i].opens };
      }
    }
    // Walk forward 1-7 days
    for (var d = 1; d <= 7; d++) {
      var future = new Date(now.getTime() + d * 86400000);
      var futDow = DAY_NAMES[future.getDay()];
      for (var i = 0; i < spec.length; i++) {
        if (spec[i].dayOfWeek.indexOf(futDow) >= 0) {
          return { day: (d === 1 ? 'tomorrow' : futDow), time: spec[i].opens };
        }
      }
    }
    return null;
  }
  function isOpenNow(spec, now) {
    var dow = DAY_NAMES[now.getDay()];
    var nowMin = now.getHours() * 60 + now.getMinutes();
    for (var i = 0; i < spec.length; i++) {
      var rule = spec[i];
      if (rule.dayOfWeek.indexOf(dow) === -1) continue;
      if (minutesOfDay(rule.opens) <= nowMin && nowMin < minutesOfDay(rule.closes)) {
        return { closes: rule.closes };
      }
    }
    return null;
  }
  var pills = document.querySelectorAll('.is-open-status');
  pills.forEach(function(pill){
    var raw = pill.getAttribute('data-hours-spec');
    if (!raw) return;
    var spec;
    try { spec = JSON.parse(raw.replace(/&#39;/g, "'")); } catch(e){ return; }
    if (!Array.isArray(spec) || spec.length === 0) return;
    var now = pattayaNow();
    var open = isOpenNow(spec, now);
    if (open) {
      pill.textContent = '● Open · closes ' + open.closes;
      pill.classList.add('is-open');
    } else {
      var next = nextOpening(spec, now);
      if (next) {
        var label = next.day === 'today' ? 'today' : (next.day === 'tomorrow' ? 'tomorrow' : next.day);
        pill.textContent = '○ Closed · opens ' + next.time + ' (' + label + ')';
      } else {
        pill.textContent = '○ Closed';
      }
      pill.classList.add('is-closed');
    }
  });
})();
</script>
<script>
 (function(){
  // WEB SHARE API
  var btns = document.querySelectorAll('.share-venue-btn');
  btns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var title = btn.getAttribute('data-share-title') || document.title;
      var url = btn.getAttribute('data-share-url') || window.location.href;
      if (navigator.share) {
        navigator.share({ title: title, url: url, text: 'Pattaya gym pick: ' + title }).catch(function(){});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function(){
          var orig = btn.textContent;
          btn.textContent = '✓ Link copied';
          setTimeout(function(){ btn.textContent = orig; }, 2000);
        });
      } else {
        // Final fallback — prompt
        window.prompt('Copy link:', url);
      }
    });
  });
})();
</script>
<script>
(function(){
  var body = document.getElementById('venue-body');
  if (!body) return;
  var heads = Array.prototype.slice.call(body.querySelectorAll(':scope > h2'));
  if (heads.length < 3) return;
  var nav = document.createElement('div');
  nav.className = 'jump-nav';
  var label = document.createElement('div');
  label.className = 'jump-nav-label';
  label.textContent = '★ On this page · ' + heads.length + ' sections';
  nav.appendChild(label);
  var pills = document.createElement('div');
  pills.className = 'jump-nav-pills';
  heads.forEach(function(h, i){
    var id = h.id || ('s-' + i);
    h.id = id;
    var a = document.createElement('a');
    a.href = '#' + id;
    a.innerHTML = '<span class="n">' + String(i+1).padStart(2,'0') + '</span><span>' + h.textContent + '</span>';
    pills.appendChild(a);
  });
  var hint = document.createElement('p');
  hint.className = 'jump-nav-hint';
  hint.textContent = 'Swipe for more sections →';
  nav.appendChild(pills);
  nav.appendChild(hint);
  var foldMobile = window.matchMedia('(max-width: 899px)').matches && heads.length >= 4;
  if (foldMobile) {
    var tools = document.createElement('div');
    tools.className = 'venue-section-tools';
    tools.innerHTML = '<button type="button" class="btn btn-ghost venue-section-expand">Expand all</button><button type="button" class="btn btn-ghost venue-section-collapse">Collapse all</button>';
    nav.appendChild(tools);
    var prevDetails = null;
    for (var i = heads.length - 1; i >= 0; i--) {
      var h = heads[i];
      var details = document.createElement('details');
      details.className = 'venue-section';
      if (i < 2) details.setAttribute('open', '');
      var summary = document.createElement('summary');
      summary.className = 'venue-section-summary';
      var panel = document.createElement('div');
      panel.className = 'venue-section-body';
      var node = h.nextSibling;
      while (node && node !== prevDetails) {
        var nxt = node.nextSibling;
        panel.appendChild(node);
        node = nxt;
      }
      summary.appendChild(h);
      details.appendChild(summary);
      details.appendChild(panel);
      if (prevDetails) body.insertBefore(details, prevDetails);
      else body.appendChild(details);
      prevDetails = details;
    }
    tools.querySelector('.venue-section-expand').addEventListener('click', function(){
      body.querySelectorAll('.venue-section').forEach(function(d){ d.setAttribute('open',''); });
    });
    tools.querySelector('.venue-section-collapse').addEventListener('click', function(){
      body.querySelectorAll('.venue-section').forEach(function(d, idx){
        if (idx < 2) d.setAttribute('open',''); else d.removeAttribute('open');
      });
    });
    pills.addEventListener('click', function(e){
      var link = e.target.closest('a');
      if (!link || !link.hash) return;
      var target = body.querySelector(link.hash);
      if (!target) return;
      var section = target.closest('.venue-section');
      if (section) section.setAttribute('open', '');
    });
  }
  body.insertBefore(nav, body.firstChild);
})();
</script>
` : `
<section class="section" style="padding-top:0; padding-bottom:var(--s-8);">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Know more about this venue?</div>
    <div style="background:var(--surface); border:1px solid var(--line); border-left:3px solid var(--cyan); border-radius:var(--r-lg); padding:var(--s-6);">
      <p style="font-size:15px; color:var(--text-2); line-height:1.7; margin:0 0 var(--s-4);">This is a <strong class="u-text">verified entry</strong> in the Pattaya.Gym directory. We've personally confirmed the venue exists and operates. If you've trained here and can share more details — coaches, prices, schedule, what makes it different — we want to know.</p>
      <p style="font-size:15px; color:var(--text-2); line-height:1.7; margin:0;">Help us deepen this listing: <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Update: ' + g.name)}" style="color:var(--cyan); font-weight:600;">email us</a> ·  · or <a href="/contact/" style="color:var(--pink); font-weight:600;">contact form</a>.</p>
    </div>
  </div>
</section>
`}

${(g.social && (g.social.facebook || g.social.instagram)) ? `
<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Social</div>
    <div class="channels-grid">
      ${g.social.facebook ? `<a href="https://facebook.com/${esc(g.social.facebook)}" target="_blank" rel="noopener noreferrer" class="channel-card is-fb"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Facebook</div><h3 class="channel-card-name">${esc(g.social.facebook)}</h3><div class="channel-card-sub">facebook.com</div></a>` : ''}
      ${g.social.instagram ? `<a href="https://instagram.com/${esc(g.social.instagram)}" target="_blank" rel="noopener noreferrer" class="channel-card is-ig"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Instagram</div><h3 class="channel-card-name">@${esc(g.social.instagram)}</h3><div class="channel-card-sub">instagram.com</div></a>` : ''}
      ${g.website ? `<a href="${esc(g.website)}" target="_blank" rel="noopener noreferrer" class="channel-card is-yt"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Website</div><h3 class="channel-card-name">Official site</h3><div class="channel-card-sub">${esc(g.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 28))}</div></a>` : ''}
      ${g.mapsUrl ? `<a href="${esc(g.mapsUrl)}" target="_blank" rel="noopener noreferrer" class="channel-card is-tt"><span class="channel-card-arrow">↗</span><div class="channel-card-tag">// Google Maps</div><h3 class="channel-card-name">View on map</h3><div class="channel-card-sub">Directions · location</div></a>` : ''}
    </div>
  </div>
</section>
` : ''}

${(g.tags && g.tags.length) ? `
<section class="section u-pt-0">
  <div class="wrap u-max-760">
    <div class="eyebrow"><span class="num">★</span> Tags</div>
    <div class="u-tags-row">
      ${g.tags.map(t => `<span style="background:var(--surface); border:1px solid var(--line); color:var(--text-2); padding:6px 14px; border-radius:var(--r-pill); font-family:var(--font-mono); font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;">${esc(t)}</span>`).join('')}
    </div>
  </div>
</section>
` : ''}

<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Contact channels</div>
    <h2 class="h-section">Reach us <span class="accent-mint">direct.</span></h2>
    <div class="channels-grid">
      <a href="mailto:info@pattaya-gym.com?subject=${encodeURIComponent('Inquiry: ' + g.name)}" class="channel-card is-email">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// Email</div>
        <h3 class="channel-card-name">info@pattaya-gym.com</h3>
        <div class="channel-card-sub">Reply within 24h</div>
      </a>
      
      <a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer" class="channel-card is-line">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// LINE</div>
        <h3 class="channel-card-name">@timpaemi</h3>
        <div class="channel-card-sub">Daily check</div>
      </a>
      ${g.phone ? `<a href="tel:${esc(phoneToTel(g.phone))}" class="channel-card is-agency">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">★ Direct line</div>
        <h3 class="channel-card-name">Call gym</h3>
        <div class="channel-card-sub">${esc(g.phone)}</div>
      </a>` : ''}
    </div>
  </div>
</section>

${related.length ? `
<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Same sport</div>
    <h2 class="h-section">Other <span class="${accent.class}">${esc(catLabel.toLowerCase())}.</span></h2>
    <div class="numlist guide-hub-grid">
      ${related.map(r => venueListingCard(r)).join('')}
    </div>
  </div>
</section>
` : ''}

${venueToolsStrip(g)}

</main>
`
    + paNetwork()
    + footer(venuePageScripts());
}

// ---------- Category page ----------
function categoryPage(cat, venues) {
  const url = `${SITE}/category/${cat.key}/`;
  const title = `${cat.label} in Pattaya (${venues.length} venues) | Pattaya.Gym`;
  const desc = truncateDesc(`Find every ${cat.label.toLowerCase()} venue in Pattaya — ${venues.length} hand-checked gyms and sport operators with hours, prices, maps and contact. Compare camps, filter by area, no paid placements.`);

  const accentColors = {
    'muay-thai': 'accent-pink', 'mma': 'accent-pink', 'bjj': 'accent-pink',
    'fitness': 'accent-yellow', 'crossfit': 'accent-yellow',
    'golf': 'accent-mint',
    'yoga': 'accent-cyan', 'racquet': 'accent-cyan', 'swimming': 'accent-cyan', 'watersports': 'accent-cyan',
    'climbing': 'accent-mint', 'clubs': 'accent-mint', 'kids-youth': 'accent-yellow',
    'equestrian': 'accent-mint', 'adventure': 'accent-mint'
  };
  const accent = accentColors[cat.key] || 'accent-pink';

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cat.label} in Pattaya`,
    numberOfItems: venues.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: venues.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/gyms/${v.id}/`,
      name: v.name
    }))
  };
  const crumbsLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: 'All sports', href: '/sports/' },
      { label: cat.label }
    ], `${SITE}/category/${cat.key}/`)
  };
  const faqLd = categoryFaqLd(cat);
  const faqHtml = categoryFaqHtml(cat);
  const jsonLd = faqLd ? [itemList, crumbsLd, faqLd] : [itemList, crumbsLd];

  return head({ title, desc, url, jsonLd , modified: SITE_MODIFIED })
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: 'All sports', href: '/sports/' },
        { label: cat.label }
      ])
    + `
<main id="main">

<section class="hero hub-hero hub-hero--category" style="text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Sport · ${venues.length} venues in Pattaya</div>
    <h1 class="hero-h1">
      ${esc(cat.label)} <span class="${accent}">in Pattaya.</span>
    </h1>
    <p class="hero-lede u-text-left-ml0">Every <strong>${esc(cat.label.toLowerCase())}</strong> gym and venue in Pattaya — <strong>${venues.length} hand-checked entries</strong> with hours, prices, maps and contact. No paid placements. Updated on a rolling schedule.</p>
    <p class="hero-meta u-text-left">${venues.length} venues · Updated ${TODAY} · Pattaya · Thailand</p>
    ${categoryHubCtas(cat)}
  </div>
</section>
${categoryIntroSection(cat)}

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> Quick pick</div>
    <h2 class="h-section">Where to <span class="${accent}">start.</span></h2>
    <p class="lede">${venues.length ? `Our top 3 picks from <strong class="u-text">${venues.length} ${cat.label.toLowerCase()} venues</strong>. Full list below.` : 'No venues currently listed.'}</p>
    <div class="numlist guide-hub-grid">
      ${venues.slice(0, 3).map(v => venueListingCard(v)).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> All ${venues.length} venues</div>
    <h2 class="h-section">Every <span class="accent-mint">venue.</span> Hand-<span class="accent-pink">checked.</span></h2>
    <div class="numlist guide-hub-grid">
      ${venues.map(v => venueListingCard(v)).join('')}
    </div>
  </div>
</section>
${categoryGuideSection(cat)}
${faqHtml}
</main>
`
    + paNetwork()
    + footer(venuePageScripts());
}

// ---------- Area page ----------
// ---------- Per-area editorial depth ----------
// Codex Nuclear V3 P1-6: area pages were thin (Sattahip 104 words, East Pattaya 231).
// This map gives each area a real neighborhood guide: best-for, transport, landmarks, starter venues.
const AREA_CONTENT = {
  'jomtien': {
    accent: 'accent-cyan',
    summary: 'A broad south-Pattaya filter covering Jomtien, Thepprasit and several Na Jomtien records, with strong racquet, diving, fitness and swimming options but wide travel distances.',
    intro: `<p><strong>If you only read one thing: this page is a 39-record regional filter, not a list of 39 confirmed venues within walking distance of Jomtien Beach.</strong> As checked on 26 July 2026, it returns 10 sport categories: 8 watersports records, 8 fitness, 5 racquet, 5 clubs, 4 swimming, 3 Muay Thai, 2 yoga, 2 kids and youth, 1 golf and 1 adventure record. The matching rule also captures addresses labelled Thepprasit, Na Jomtien and farther south toward Sattahip. Open each map before choosing accommodation or paying for a booking.</p>
      <p>The dataset carries no formal closure or verification warning on these 39 results, but two records still require extra caution. Mermaids Dive Center has record-level hours marked “Closed”, while Pattaya Public Pool Jomtien is a legacy public-pool identity whose current operation is unverified in its text. Neither should be treated as confirmed merely because it appears in the area count. More generally, a hotel fitness record confirms an amenity for guests unless its own page explicitly documents non-resident access.</p>
      <h2>Useful price comparisons, not one area price range</h2>
      <p>Current products in this filter are too different for one meaningful “Jomtien price”. <a href="/gyms/chilli-padel-club/">Chilli Padel Club</a> listed a whole court for up to four players at ฿1,000 per hour, or from ฿600 in happy hours, checked on 25 July 2026. Five of its six courts are roofed, and the operator publishes daily 07:00–24:00 hours. That makes it a practical group booking, but racket and ball rental should be confirmed separately.</p>
      <p><a href="/gyms/jomtien-dive-center/">Jomtien Dive Center</a> listed certified-diver day trips from ฿2,800 for Pattaya and ฿3,200 for Samaesan on 27 July 2026. Its current pricing page also keeps beginner try dives, Discover Scuba and Open Water products visible, with equipment other than a dive computer, a qualified guide, lunch, refreshments and pickup within five kilometres presented as included on the relevant trip pages. This is a full-day booked activity, not an hourly beach rental. At the other end of the commitment scale, <a href="/gyms/better-bodies-gym-na-jomtien/">Better Bodies Gym</a> published ฿2,500 for three months or ฿4,500 for six months paid in advance on the same date, but no drop-in price.</p>
      <p>FIGHT EVO360 illustrates why status beats a tempting rate: its booking page listed open gym at ฿150 and several classes from ฿300 to ฿500 on 25 July 2026, while its public timetable also contained repeated closed-day notices. The record is marked schedule-unconfirmed. Contact the gym before paying for a session.</p>
      <h2>Choose the corridor before the venue</h2>
      <p>Jomtien Beach Road and the Dongtan end suit beach access and local services. Thappraya and Thepprasit connect toward South Pattaya and hold several inland gyms. Na Jomtien venues can be materially farther south; a name containing “Jomtien” does not make it walkable from a central Jomtien hotel. Check the exact entrance, return transport and weather exposure, especially for boat trips and outdoor sport.</p>
      <p>For a normal gym search, use the <a href="/guides/best-gym-jomtien-pattaya/">Jomtien gym guide</a>. For a booked sea day, compare the <a href="/guides/diving-watersports-pattaya/">diving and watersports guide</a>. For court choice and partner-finding, use the <a href="/guides/padel-pickleball-pattaya/">padel and pickleball guide</a>. In every case, reconfirm the date, start time, total price, included equipment and cancellation terms with the operator.</p>`,
    bestFor: [
      { label: 'Padel and badminton', why: 'The filter includes roofed padel courts, social play and dedicated badminton venues; compare booking method, equipment hire and exact inland location.' },
      { label: 'Diving and boat days', why: 'Several operators publish full-day Pattaya or Samae San trips, but certification, sea conditions, pickup radius and departure logistics differ.' },
      { label: 'Long-stay fitness', why: 'Local gyms publish low multi-month rates, while hotel records generally describe guest amenities rather than public memberships.' },
      { label: 'Family swimming', why: 'The regional set includes swim schools, leisure pools and water parks; these are different products with different supervision and access rules.' }
    ],
    transport: 'Jomtien Beach Road follows the beachfront, while Thappraya and Thepprasit connect the area with South Pattaya and inland venues. Na Jomtien results can be much farther south. Check the live map, exact entrance and return route for each record instead of assuming the area label means a walkable beach location.',
    landmarks: [
      'Jomtien Beach and Beach Road',
      'Dongtan Beach at the north end of Jomtien',
      'Thappraya Road toward South Pattaya',
      'Thepprasit Road and its inland sport venues',
      'Na Jomtien corridor south of the main beach district',
      'Pattaya Park Tower',
      'Ocean Marina Yacht Club in Na Jomtien'
    ],
    starterPicks: 'For the simplest first booking, choose one venue with a dated price and an exact map, then verify the session directly. Chilli Padel suits a pre-booked group court; Jomtien Dive Center suits a full-day certified-diver plan; Better Bodies suits a longer stay rather than a one-off visit.'
  },

  'naklua': {
    accent: 'accent-cyan',
    summary: 'The Naklua and North Pattaya filter spans 24 records across ten categories, from Fairtex and local fitness rooms to diving, pools, clubs and Wong Amat activities. It includes unverified and non-sport records, so status and exact access matter.',
    intro: `<p><strong>If you only read one thing: the Naklua page is a 24-record north-Pattaya filter, not a promise of 24 public gyms within walking distance of Wong Amat Beach.</strong> As checked on 26 July 2026, it returns ten sport categories: six fitness records, four swimming, three Muay Thai, three clubs, two kids-and-youth, two adventure, and one each for yoga, golf, watersports and racquet sport. The location rule includes Naklua, Wong Amat and North Pattaya descriptions, so the exact entrance can be farther from the beach or across a major road.</p>
      <p>Read status before count. Naklua Public Swimming Pool and Pattaya Bike &amp; Boat Tours are retained as unverified records. Sanctuary of Truth is marked as a non-sport attraction, while Wong Amat Beach is a public-beach activity record rather than a staffed venue. Pattaya Bowl is also unverified. A hotel fitness listing normally proves an amenity for registered guests; it does not prove that a non-guest day pass is sold.</p>
      <h2>Compare defined products, not one Naklua price</h2>
      <p><a href="/gyms/fairtex-pattaya/">Fairtex Training Center</a> published Muay Thai at ฿800 for one session, ฿7,000 for ten sessions and ฿16,500 for one month when checked on 25 July 2026. Its BJJ prices on the same owner page were ฿300 for one class, ฿2,600 for ten and ฿4,000 for one month. Those are coached-training products, so compare the discipline and included access before treating the monthly figures as ordinary gym memberships.</p>
      <p><a href="/gyms/dive-station-pattaya/">Dive Station Pattaya</a> published sale prices checked on 25 July 2026: ฿4,000 for its Basic Diver product, ฿3,000 for a certified-diver day, ฿14,990 for the three-day SSI Open Water course and ฿1,350 for a snorkelling trip. These are advance-booked sea activities, not beach walk-ups; certification, equipment, boat plan, pickup, weather and cancellation terms should be reconfirmed for the selected day.</p>
      <p><a href="/gyms/nara-maze-pool-day-pass/">Nara Maze at Terra Nara</a> provides the clearest documented non-guest pool option in the filter. Its official offer checked on 24 July 2026 was ฿500 net for daily 09:00–18:00 access, including drinking water, one smoothie and a 20% discount on food and non-alcoholic drinks. That does not establish public access at every North Pattaya hotel pool.</p>
      <h2>Choose the right north-Pattaya corridor</h2>
      <p>Naklua Road is the main inland spine; Wong Amat addresses sit on beach-side sois, while North Pattaya Road leads toward Sukhumvit and the intercity bus terminal. These are related districts, not one compact block. A venue near the bus terminal may be inconvenient from a Wong Amat hotel, and a beachfront activity may have no changing room, equipment hire or supervision. Check the exact pin, road crossing, final entrance and return route before choosing accommodation around a listing.</p>
      <p>For coached combat training, Fairtex is the record with the strongest current timetable and price evidence in this filter. For a booked sea day, compare Dive Station with the wider <a href="/guides/diving-watersports-pattaya/">diving and watersports guide</a>. For general weights or cardio, open the six fitness records and ask whether access is public, guest-only, appointment-based or membership-only. The <a href="/guides/best-gyms-in-pattaya/">Pattaya gym guide</a> offers broader alternatives when the north-end location is not essential.</p>`,
    bestFor: [
      { label: 'Published-price combat training', why: 'Fairtex publishes separate current Muay Thai and BJJ tariffs; confirm the exact class time and inclusions for the intended date.' },
      { label: 'Advance-booked diving', why: 'Dive Station publishes beginner, certified-diver, Open Water and snorkelling products, each with different eligibility and logistics.' },
      { label: 'A documented non-guest pool day', why: 'Terra Nara publishes a defined Nara Maze day-pass product instead of relying on an assumption that hotel pools accept walk-ins.' },
      { label: 'North-end long stays', why: 'The filter has six fitness records, but public access and current tariffs vary; map the exact gym against the accommodation before booking.' }
    ],
    transport: 'Naklua Road, Wong Amat beach-side sois and North Pattaya Road form different access corridors. Use the exact live pin and entrance for each record. Do not assume every result is walkable from the beach or that a hotel amenity admits non-guests.',
    landmarks: [
      'Wong Amat Beach (quiet family beach)',
      'Sanctuary of Truth (carved wooden temple)',
      'Lan Po Naklua market (Thai-style fresh market)',
      'Mum Aroi seafood pier',
      'Naklua bus terminal (Bangkok routes)'
    ],
    starterPicks: 'Start with the product that has first-hand evidence: Fairtex for published Muay Thai or BJJ rates, Dive Station for a booked dive or snorkel product, or Nara Maze for a documented non-guest pool pass. Then verify the date, inclusions and exact route directly.'
  },

  'pratamnak': {
    accent: 'accent-mint',
    summary: 'The Pratamnak filter contains 13 records across fitness, yoga, racquet sport, Muay Thai, watersports and outdoor activity. It combines public, commercial, hotel and club access models rather than one luxury-resort market.',
    intro: `<p><strong>If you only read one thing: Pratamnak returns 13 directory records, but they are not one product or one walkable cluster.</strong> As checked on 26 July 2026, the filter contains six fitness records, two yoga studios, two racquet venues, one Muay Thai record, one watersports club and one outdoor club/activity record. None currently carries a closure or verification warning in the dataset. That clean status does not make every result publicly accessible: InterContinental is a hotel-guest fitness record, and Royal Varuna is a private yacht-club product.</p>
      <h2>Price comparisons that answer different questions</h2>
      <p><a href="/gyms/battle-conquer-gym/">Battle &amp; Conquer Gym</a> publishes both ordinary gym and coached Muay Thai access. Prices checked on 25 July 2026 were ฿200 for a gym day, ฿600 for one week, ฿1,300 for one month and ฿500 for a single group Muay Thai session. The group timetable was 08:00-10:00 and 16:00-18:00 daily. A training package can also include the boxing room, weights gym, sauna and cold plunge, so confirm which access type the quote covers.</p>
      <p><a href="/gyms/fitz-club/">Fitz Club</a> is the documented non-hotel-guest club option. Its 2026 outside-guest tariff checked on 25 July listed an adult day pass at ฿800 for the gym, pool, sauna and steam rooms, excluding tennis and squash. Personal training was ฿1,100 per hour. This is a broader facilities purchase than a basic gym entry, and court hire or coaching is separate.</p>
      <p>For racquet sport, <a href="/gyms/play-padel-pattaya/">Play Padel Pattaya</a> published THB 1,200 per court-hour, private coaching from THB 600 per hour and racket rental at THB 100 per hour on 25 July 2026. The court is booked through Padelmates and new players booking ahead must prepay. For yoga, Ashtanga Yoga Pattaya listed a ฿300 drop-in and Balance Yoga Studio a ฿500 group class on the same check date; each has its own timetable and building-access requirements.</p>
      <h2>Commercial, public, hotel or club?</h2>
      <p>Muscle Factory, Human Strong and Battle &amp; Conquer are conventional commercial training choices with different evidence around tariffs and equipment. <a href="/gyms/pratumnak-fitness-park/">Pratumnak Fitness Park</a> is a free public outdoor circuit whose city documentation supports the path, multipurpose court and exercise stations, but not a staffed locker room or guaranteed equipment condition. InterContinental describes an amenity for hotel guests. Royal Varuna requires direct confirmation of membership, course or visitor access. Match the access model to the trip before comparing names.</p>
      <h2>Location and fit</h2>
      <p>Pratamnak Hill sits between central Pattaya and Jomtien, but the listed venues spread across hill roads, Kasetsin, Cosy Beach and the Thappraya side. Slopes, road crossings and building entrances can make a short map distance inconvenient. Check the exact pin and return route instead of using a fixed taxi time. The area suits a traveller who wants a quieter base near one chosen club, studio or gym. It is weaker for someone expecting many venues on a single flat walking route or a universal baht-bus connection.</p>
      <p>Before paying, confirm the exact entrance, public or guest eligibility, staffed hours, booking method, equipment or court rental, class language and cancellation terms. For broader choices outside the hill, use the <a href="/guides/best-gyms-in-pattaya/">Pattaya gym guide</a>.</p>`,
    bestFor: [
      { label: 'A documented public day club', why: 'Fitz Club publishes an outside-guest tariff covering the gym, pool, sauna and steam rooms, with courts priced separately.' },
      { label: 'Coached combat plus ordinary gym access', why: 'Battle & Conquer publishes separate gym, group Muay Thai and private-training products.' },
      { label: 'Booked padel or yoga', why: 'The filter includes two racquet and two yoga records with dated prices, but each needs a confirmed slot or class.' },
      { label: 'Free outdoor movement', why: 'Pratumnak Fitness Park is a public circuit, while Big Buddha Hill is an outdoor stair-climb record rather than a staffed venue.' }
    ],
    transport: 'The results span Pratamnak sois, Kasetsin, Cosy Beach and the Thappraya side of the hill. Check the exact live pin, slope, road crossing, building entrance and return plan; no fixed journey time or universal public-transport route applies to all 13 records.',
    landmarks: [
      'Big Buddha Hill / Wat Phra Yai (free staircase climb, panoramic Pattaya view)',
      'Khao Phra Tamnak viewpoint',
      'Royal Cliff Hotels Group (luxury cluster)',
      'Cosy Beach (small, hotel-adjacent)',
      'Buddha Hill viewpoint at the south end'
    ],
    starterPicks: 'Choose by access model: Fitz for a published outside-guest facilities pass, Battle & Conquer for separately priced gym or Muay Thai access, Play Padel for a booked court or coach, or Pratumnak Fitness Park for a free outdoor session. Confirm the exact route and eligibility first.'
  },

  'central-pattaya': {
    accent: 'accent-pink',
    summary: 'Beach Road, Second Road, Pattaya Klang, Soi Buakhao and mapped South Pattaya records produce a broad central index. It mixes commercial gyms, combat sport, pools, clubs, attractions and closed or unverified legacy entries, so the individual status and access model matter more than the result count.',
    intro: `<p><strong>Central Pattaya is a mixed 38-record index, not a promise of 38 open gyms.</strong> The first-match area rule currently returns nine fitness records, six clubs, six watersports records, five Muay Thai records, four racquet records, three kids-and-youth records, two adventure records and one each for MMA, swimming and golf. Diamond Badminton and JUMPZ Harbor Pattaya are closed; Platinum Fitness, BOUNCE Pattaya and Pattaya Beach Aerobics are unverified; Pattaya Floating Market is explicitly non-sport. Those six status findings remain visible because an honest directory should not turn every location match into a recommendation. Records whose area names first match Jomtien, Naklua or Pratamnak stay in those more specific filters even when their text also mentions South or Central Pattaya.</p>
      <h2>Start with an access model</h2>
      <p>The fitness results include street and mall gyms, 24-hour member clubs, hotel facilities and a South Pattaya club with wet areas. A hotel fitness centre is normally a guest amenity unless its operator publishes outside access. A 24-hour label may describe an enrolled member’s door access rather than overnight staffing or tourist registration. A monthly tariff does not establish a day pass. Choose which product you need before comparing venue names.</p>
      <h2>Four central products run on four different clocks</h2>
      <p>A flexible opening window, a class timetable, an event card and a dated day pass solve different planning problems. Fitness 7 publishes 24-hour operation but no current public visitor price or overnight-reception rule. ISS publishes coached boxing and Muay Thai classes Monday-Saturday from 14:00 to 15:30, alongside separately priced gym access. MAX Muay Thai Stadium showed 19:00 fight cards on two specific July dates rather than a repeating nightly promise. Hard Rock publishes a non-resident pool window of 09:00-19:00, narrower than the hotel's own pool hours.</p>
      <p>Choose the clock before the venue. A traveller wanting an uncoached late session needs member-entry and staffed-arrival details. Someone wanting instruction needs the named class start. A spectator needs a confirmed card and ticket. A pool visitor needs the outside-guest window and inclusions. The Central count is broad because all four are sport-related records in the same corridor; it should not be collapsed into a single “open now” recommendation. For a fixed itinerary, obtain the exact product, arrival deadline and complete amount first, then compare the pin.</p>
      <p><a href="/gyms/coco-fitness/">Coco Fitness</a> is the fourth-floor Mike Shopping Mall option. Current operator material supports more than 1,000 square metres with machines, weights, cardio, stretching and boxing areas, plus daily 07:00–22:00 hours. The venue record does not retain numeric membership claims here because an exact post-level tariff URL was not available; the Facebook profile alone is insufficient under the directory's current price-citation rule.</p>
      <p><a href="/gyms/fitness-7/">Fitness 7 Pattaya</a> is the first-floor The Avenue option. The operator describes more than 2,000 square metres with cardio and resistance machines, free weights, a boxing ring, functional training and included classes, and publishes 24-hour operation. It does not publish a current Pattaya day pass, monthly fee or joining fee. The choice between Coco and Fitness 7 is therefore not “cheap versus expensive”: it is a staffed mall schedule versus documented 24-hour operation, with both current visitor prices requiring direct confirmation.</p>
      <h2>A staffed-hours alternative in Welcome Town</h2>
      <p><a href="/gyms/universe-gym/">Universe Gym</a> is an active fitness and bodybuilding gym at Welcome Town, 47/113 Moo 9. Its operator page was posting in April 2026 and publishes +66 92 886 6600; Maps retains +66 38 411 227 as an alternate. Maps lists 08:00–22:00 Monday-Friday and 09:00–22:00 on weekends. That makes Universe a conventional daytime-and-evening alternative to the round-the-clock records, but it does not make the product more transparent: no current owner drop-in, weekly or monthly tariff was accessible. The old universe-gym.com address linked from public profiles now redirects to a domain-sale page, so use the Facebook page, phone or exact Maps pin rather than the former website.</p>
      <p>Universe is most relevant when Welcome Town is convenient and a visitor is prepared to call for the exact access product. Ask whether a first visit requires registration, which training areas are included, whether personal guidance costs extra and whether holiday hours change. A social-page description of a well-equipped bodybuilding gym does not establish a complete machine inventory, a class timetable or a public day pass.</p>
      <h2>Separate member access from staffed arrival</h2>
      <p><a href="/gyms/jetts-fitness-pattaya/">Jetts Little Walk Pattaya</a> publishes 24-hour member access, with staff Monday-Friday 06:00–22:00 and weekends/public holidays 08:00–20:00. Its visitor page names Little Walk and describes flexible access without a long contract, but the checked page did not expose the Pattaya price. A first-time visitor should arrive during staffed hours and request the full amount, activation method, access-card terms and cancellation conditions.</p>
      <p><a href="/gyms/anytime-fitness-pattaya/">Anytime Fitness Pattaya</a> is one directory record covering separate Again Pattaya and Bukis Point branches. The central filter catches the record because one branch is described as South Pattaya; it does not mean both pins are in one central block. Both publish 24-hour member access, while staffed hours and prices vary. <a href="/gyms/tonys-gym/">Tony’s Fitness Group</a> now documents only the current South Pattaya Third Road open-air weight venue, whose location-specific Maps listing says 24 hours and gives phone +66 95 850 3475. Its Facebook identity remains online, but the newest public operator posts visible on 26 July 2026 were from April 2022. With no current owner tariff, equipment list or staffed schedule, the round-the-clock listing supports neither overnight registration nor an old multi-branch membership claim.</p>
      <h2>Combat training is not one product</h2>
      <p><a href="/gyms/wko-muay-thai/">ISS Boxing and Muay Thai</a> publishes separate facility and class prices. Checked on 25 July 2026, gym access was ฿300 for a day, ฿800 for a week or ฿1,500 for a month. Boxing/Muay Thai classes were ฿1,000 for a day, ฿4,000 for a week or ฿8,000 for a month, with classes listed Monday-Saturday 14:00–15:30. The same page lists a separate recovery/weight-cut room tariff. Compare the named product, not just the lowest number.</p>
      <p>The other mapped combat records need different questions. Venum and Rage are South Pattaya multi-discipline camps. Petchrungruang is an active family Muay Thai camp but has no current public fee table or complete normal-week timetable. <a href="/gyms/max-muay-thai-stadium/">MAX Muay Thai Stadium</a> is a spectator venue, not evidence of a standing visitor class. Its operator calendar checked on 26 July listed The Global Fight cards at 19:00 on 27 and 28 July, while the office publishes daily 13:00–21:00 hours. Those dated cards do not establish a permanent nightly schedule or an operator ticket tariff. Before travelling, distinguish group training, private coaching, open gym and a fight card; confirm the exact product, start time, equipment or seating, and total price.</p>
      <p><a href="/gyms/rage-fight-academy/">Rage Fight Academy</a> now has a clearer facility and access record. Its current operator site documents Muay Thai and boxing areas, three full-size rings, a BJJ/MMA mat zone, a functional-fitness and weight room, a pool and on-site accommodation. The exact Maps identity lists 08:00-19:00 Monday-Saturday and Sunday closed, but the public training page did not expose a dependable class-by-class timetable or fee table on 26 July 2026. Treat the opening window as venue hours and contact Rage for the exact discipline, session, equipment and price. The operator's 308/43 address and Maps' 308/45 number also differ, so use the exact pin for the Soi Norway entrance.</p>
      <h2>BJJ and MMA are not central walk-in categories</h2>
      <p>The direct <a href="/category/bjj/">BJJ category</a> contains one record, <a href="/gyms/alfa-bjj-pattaya/">ALFA BJJ Pattaya</a>, and that former standalone academy is closed. Its Soi Khopai identity must not be used as proof of a current central BJJ timetable. Active BJJ programmes sit inside venues filed under their primary fitness or combat category, so a search limited to the BJJ category can look empty even though current training exists elsewhere.</p>
      <p>Rage appears in this central filter because its area is described as South Pattaya. Its BJJ/MMA mat zone is verified, but a room description is not a class schedule: no dependable current BJJ fee table or class-by-class timetable was public on 26 July 2026. <a href="/gyms/mixfight-pattaya/">BOXING CLUB Mixfight Pattaya</a> is the filter's MMA record. Current owner evidence names MMA and jiu-jitsu among a wider programme, while the public sources do not publish a dependable visitor timetable or tariff for those exact disciplines. Both are contact-first options.</p>
      <p>The clearest published BJJ schedules and prices are outside the Central area result: <a href="/gyms/fairtex-pattaya/">Fairtex</a> is in North Pattaya and <a href="/gyms/castra-gym/">Castra Gym</a> is in Khao Talo. <a href="/gyms/kombat-group-thailand/">Kombat Group</a> is a residential Huai Yai purchase rather than a central drop-in. Use the <a href="/guides/bjj-mma-pattaya/">BJJ and MMA guide</a> to compare those formats, and place accommodation around the confirmed class rather than assuming every “South Pattaya” combat record is a central walk-in.</p>
      <h2>Central watersports records are booking bases, not central launch sites</h2>
      <p>The six watersports results illustrate why an area filter cannot replace the booking confirmation. Five are dive businesses with a shop or office address matched to Beach Road, Second Road, Thappraya or Central Pattaya; the sixth is Underwater World on Sukhumvit Road. A central dive-shop pin can be convenient for enquiries or equipment fitting, but it does not prove that the boat departs from that pin, that hotel pickup is included or that every trip returns at the shop's closing time.</p>
      <p><a href="/gyms/pattaya-dive-centre/">Pattaya Dive Centre</a> published a two-dive Pattaya day at ฿2,700 with a diver's own gear or ฿3,000 with rental gear, checked on 25 July 2026. <a href="/gyms/no-limit-divers/">No Limit Divers</a> listed a two-dive certified-diver trip with equipment at ฿2,800. For beginners, <a href="/gyms/seafari-padi-dive/">Seafari</a> and Pattaya Dive Centre each listed a one-day, two-dive Discover Scuba product at ฿4,500; Seafari's exact product was rechecked on 26 July. <a href="/gyms/adventure-divers-pattaya/">Adventure Divers</a> listed Discover Scuba Diving at ฿4,000. These amounts still require an inclusion check: equipment, transfers, lunch, medical documentation, photos, insurance and the number or type of dives can differ.</p>
      <p><a href="/gyms/adventure-divers-pattaya/">Adventure Divers Pattaya</a> is the clearest reminder that a central dive-shop pin is not automatically a boat-launch pin. Its current operator price page still distinguishes snorkeller places, beginner Discover Scuba and certified-diver day trips, and says local pickup, drop-off, lunch and drinks are included. That is a stronger booking base than a generic “dive shop” label, but a central hotel should still be planned around the written meeting point and pickup zone rather than only the Thappraya Road office address.</p>
      <p>Seafari's current PADI listing also identifies a PADI 5 Star Instructor Development Center with recreational, technical, professional and Emergency First Response scope, daily 08:00-19:00 shop hours and several listed centre languages. Those are centre-level facts, not a promise that the ฿4,500 first-dive product awards certification, leaves from the shop or has a named-language instructor on every date. Ask for the exact meeting point, assigned language, boat plan and written inclusion list before choosing a central hotel around the office pin.</p>
      <p><a href="/gyms/pattaya-scuba-adventures/">Pattaya Scuba Adventures</a> is the fifth dive record and publishes courses and boat operations, but its current exact price source in this dataset is the multi-day Open Water course rather than a certified-diver day. <a href="/gyms/underwater-world-pattaya/">Underwater World Pattaya</a> is a public aquarium, not a scuba operator; its admission checked on 25 July was ฿550 for visitors over 131 centimetres and ฿320 for children 91–130 centimetres. Choose the activity first, then confirm the meeting point, qualification, equipment, weather policy and complete price through the <a href="/category/watersports/">watersports category</a>.</p>
      <h2>The four racquet records need four different access checks</h2>
      <p>The central filter returns one public hotel-tennis product, two current contact-or-booking-first venues and one closure. <a href="/gyms/siam-bayshore-tennis/">Siam Bayshore Pattaya Tennis Courts</a> is the transparent option: the resort publishes six courts open to hotel guests and the public from 07:00 to 18:00. Prices checked on 26 July 2026 were ฿350 per court-hour, ฿150 per racket-hour, ฿100 for four used balls per hour, ฿300 for a basket of balls per hour or ฿300 for a can of new balls. In-house guests receive one complimentary daytime hour; that hotel inclusion does not make outside court hire free.</p>
      <p><a href="/gyms/prime-padel-pattaya/">Prime Padel Pattaya</a> is a current Sukhumvit 41 club with booking, coaching and racket hire, but its price is only visible in the live booking flow. <a href="/gyms/chanthong-badminton-court/">Chanthong Badminton Court</a> is a hotel facility on Third Road with listed daily hours of 10:00-23:30, yet neither its current tariff nor non-resident access is published. Contact the named venue before travelling. <a href="/gyms/diamond-badminton/">Diamond Badminton</a> is permanently closed and remains in the index solely to prevent older recommendations from sending players to its former Third Road address.</p>
      <p>Do not compare the four by category label alone. Tennis court hire, padel booking, hotel badminton eligibility and a closure finding are not equivalent products. Ask whether the quote covers the entire court or each person, whether balls or shuttlecocks and rackets are included, how rain or cancellation is handled, and whether coaching or partner matching must be arranged separately.</p>
      <p><a href="/gyms/easykart-pattaya/">EasyKart Pattaya Thepprasit</a> shows the same central-south rule in a non-racquet product. Its current operator page is transparent about hours and kart categories, but the useful transaction is still the exact product: kids kart, regular kart, fast kart or two-seat. Prime works the same way from the other direction: the identity, location and club function are current, yet the real purchase still lives inside the booking flow. A central result count can tell you that both are current. It cannot tell you that one is a whole-court booking question and the other is an age-and-height-gated karting purchase.</p>
      <h2>Late cue sport and hotel badminton require different calls</h2>
      <p><a href="/gyms/megabreak-pool-hall/">Megabreak Pool Hall</a> is a late-opening cue-sport venue on Soi Diana, not a gym membership or coached fitness product. Its current listing gives 14:00 openings on Tuesday, Thursday and Sunday, 17:00 openings on the other days and 03:00 closing throughout the week. A 23 July 2026 owner result confirms recent Thursday nine-ball activity, but it does not publish a permanent event calendar, table rate, cue-rental fee or guaranteed casual availability.</p>
      <p>Chanthong answers a different need: a badminton court listed as a facility of The Chanthong Pattaya hotel. Its 10:00-23:30 daily business window does not resolve whether non-residents can book, whether guests receive priority or whether rackets and shuttlecocks are available. For Megabreak, ask about the charge basis, cues and event restrictions. For Chanthong, ask about outside access, court duration, equipment, footwear and the Third Road entrance. Neither blank tariff means free use.</p>
      <h2>Bowling and multi-site youth football need exact bookings</h2>
      <p><a href="/gyms/sf-strike-bowl/">SF Strike Bowl</a> is a sixth-floor Central Pattaya bowling centre whose current operator page and exact Maps identity publish daily 12:00-22:00 hours and phone +66 92 223 3847. The exact Maps profile also lists accessible parking and entrance plus card and contactless payment. The former game, shoe and sock amounts were removed because they were no longer visible in the current business information checked on 26 July 2026. Ask whether the quote is per person, game, lane or time, what equipment costs and whether a reservation or deposit is required.</p>
      <p><a href="/gyms/pattaya-sports-club/">Pattaya Sports Club Association</a> solves a different central problem. Its current join page still lists one year at ฿600 plus a ฿400 signup fee, or six years at ฿3,000 plus the same signup fee, checked on 27 July 2026. That is a membership-and-network product from a Pattaya 3rd Road office, not proof of one building with all the courts and fields named on the wider club site. Use it when the membership itself matters; use a named venue record when the day requires an actual court, class or bay.</p>
      <p><a href="/gyms/af-academy-pattaya/">AF Academy</a> appears in the three-record youth group because its record describes both Jomtien/Pratamnak and Central Pattaya service areas. That match does not prove a central class at a particular time. The operator's current displayed timetable is for IP Soccer Club on Monday, Wednesday and Friday: ages 3-9 at 17:00-18:00 and ages 10 and older at 18:00-19:00. Prices checked on 26 July were a free first trial, ฿600 for one 60-minute session, ฿3,000 for eight and ฿3,600 for twelve. Obtain the exact pitch pin, age-group placement and product terms directly; the Naklua company address is not presented as the training ground.</p>
      <h2>Youth martial arts follow class placement, not open hours</h2>
      <p><a href="/gyms/rsr-grand-taekwondo/">RSR Grand Taekwondo</a> is one of the three kids-and-youth records in this filter. The academy is at 88/82 inside Wonder Space Pattaya and publishes 10:00-20:00 Tuesday-Sunday, with Monday closed. Its operator says training is for all ages, while a current Super 7 partner listing names Kru Sam and a GMAC record documents the RSR Pattaya Taekwondo Championship held on 20 June 2026. Those sources establish an active academy and competition connection, not a class beginning every hour.</p>
      <p>No current public RSR fee table or age-by-age class schedule was found. Send the student's age, experience, goal, available days and teaching-language needs before travelling. Ask about the trial, exact start time, uniform, grading, registration and event costs. A central location and a broad all-ages message should not be converted into unscheduled walk-in access.</p>
      <h2>Pools and hotel fitness need eligibility checks</h2>
      <p><a href="/gyms/hard-rock-pool/">Hard Rock Hotel Pattaya Pool</a> is a 2,000-square-metre freeform leisure product rather than a documented lap-training pool. Its operator page checked on 26 July 2026 lists the pool itself from 07:00 to 21:00 and non-resident access from 09:00 to 19:00. The current tariff is ฿500 net per adult including one selected cocktail and ฿400 net per child under 12 including one fruit punch; tube hire starts at ฿200 net per day. The operator describes cabanas for a maximum of four people or one family but does not publish a current cabana price. <a href="/gyms/nara-maze-pool-day-pass/">Nara Maze</a> published a different ฿500 net non-resident product when checked on 26 July, including access from 09:00 to 18:00, water, a smoothie and a food-and-drink discount. Nara Maze does not appear in the Central area filter because its more specific Naklua area name matches first, but it is a useful current non-guest alternative. The equal headline price does not make the location, eligibility, hours or inclusions equal.</p>
      <p><a href="/gyms/hilton-pattaya-fitness/">Hilton Pattaya Fitness Centre</a> confirms a hotel fitness centre, spa and 16th-floor infinity pool but publishes neither a current non-resident pass nor fitness-centre hours. Do not convert a hotel amenity into public access without direct confirmation. None of these leisure or hotel products establishes a reserved lap lane.</p>
      <h2>Spectator tickets and team pitches are separate decisions</h2>
      <p>MAX and <a href="/gyms/palladium-fc/">Palladium FC</a> both require booking questions, but for unrelated products. MAX publishes an event calendar, seating plan, ticket route and office contact. Palladium is an artificial-turf football and futsal venue on Soi Ko Phai 10; Maps listed daily 06:00–03:00 hours on 26 July while the operator Facebook page labelled it always open. Palladium publishes no current pitch tariff. A team organiser should call +66 83 923 1595 and confirm pitch size, match format, duration, deposit, footwear, ball provision and all-in team price. Neither record is a conventional fitness walk-in.</p>
      <h2>The golf result is a practice range, not a course</h2>
      <p><a href="/gyms/pattaya-golf-driving-range/">Pattaya Golf Driving Range</a> is the filter's single golf record because its area description includes Third Road. The exact Maps identity lists daily 07:00-22:00 and the owner Facebook profile uses the same telephone and Third Road location. A generic “always open” social label conflicts with those detailed hours, so the directory follows the specific weekly listing rather than claiming 24-hour practice.</p>
      <p>Pattaya Sports Club's exact member-discount page listed <strong>฿55 for 55 balls</strong> on 26 July 2026, conditional on showing a PSC membership card and not combining the offer with another card. That is not the ordinary public tray price. Bay count, covered-bay provision, club rental, coaching and the non-member tariff were not published. This record suits a PSC member seeking a ball session; anyone planning a full round should use the <a href="/guides/best-golf-courses-pattaya/">Pattaya golf-course guide</a> instead.</p>
      <h2>An operating attraction can still be a non-sport result</h2>
      <p><a href="/gyms/pattaya-floating-market/">Pattaya Floating Market</a> illustrates a different kind of warning from a closure. Its exact Maps identity remains active at 451/304 Moo 12 on Sukhumvit Road, links the operator domain and lists daily 09:00–19:00 operation. The record is therefore not deleted or labelled permanently closed. It is marked <strong>non-sport</strong> because the current first-hand material checked on 26 July 2026 did not present a dependable training, fitness-class or sports-booking product.</p>
      <p>Earlier directory material mentioned Muay Talay, rowboat, amphibious-boat and zipline activities. Those details were removed when they could not be matched to a current operator activity page, schedule and tariff. The absence of a stable admission price is not the reason for the status: missing prices are retained throughout this directory. The decisive issue is that an operating cultural market is not a verified sports facility. Anyone planning sightseeing can contact +66 88 444 7777 for the current admission and attraction programme; someone planning exercise should use a current club, gym or watersports record instead.</p>
      <p>This correction also explains why the area total must be read with its status summary. The location rule catches broad South Pattaya and Sukhumvit descriptions, so a result can belong geographically while failing the sports-use test. An honest index preserves that negative finding to stop old claims from resurfacing. It does not count the market as a workout recommendation, infer that a historical attraction still operates, or invent a zero price because a tariff was unavailable.</p>
      <h2>A central room and a residential camp solve different problems</h2>
      <p>A central hotel plus separately purchased training preserves access to the beach corridor and makes it easier to test a short product. <a href="/gyms/wko-muay-thai/">ISS Boxing and Muay Thai</a>, for example, publishes a 14:00-15:30 class Monday-Saturday at ฿1,000 for a day, ฿4,000 for a week or ฿8,000 for a month. Its general-gym access is separately priced. That transparency supports a training-only comparison, but the visitor still needs an accommodation contract and a route to the class.</p>
      <p>A residential camp bundles away some of that coordination, usually outside this central filter. Fairtex in North Pattaya published six nights with ten sessions at ฿16,000 for one person or ฿23,000 for two sharing; Kombat in Huai Yai published one-week Muay Thai or boxing tiers from ฿12,900 Bronze to ฿24,900 Deluxe, with materially different room and facility inclusions. Rage documents on-site rooms but no dependable package tariff. A central base is therefore not automatically cheaper or more flexible, and a camp is not automatically inclusive. Compare the room, training load, daily travel, meals, facility access, taxes and change terms through the <a href="/guides/muay-thai-camps-with-accommodation-pattaya/">current camp-accommodation guide</a>. If a central stay is non-negotiable, obtain the exact class time first and place the room around that product rather than the category count.</p>
      <h2>Central padel is a live-slot product, not a city-wide court price</h2>
      <p><a href="/gyms/prime-padel-pattaya/">Prime Padel Pattaya</a> is the central Sukhumvit 41 padel record. Its current Maps identity, operator Instagram and Playtomic listing support the club, while the Asia Pacific Padel Tour records a Grand Slam there on 17-19 July 2026. No stable tariff was verified outside the live booking flow. The honest central price is therefore the amount shown for the selected date and time, with racket hire, balls, coaching and cancellation confirmed alongside it.</p>
      <p>That access model differs from current fixed examples outside the filter. <a href="/gyms/play-padel-pattaya/">Play Padel</a> in Pratamnak publishes ฿1,200 per whole court-hour, coaching from ฿600 and standard racket rental at ฿100. <a href="/gyms/chilli-padel-club/">Chilli Padel</a> in Jomtien publishes ฿1,000 per whole court-hour and happy hour from ฿600, with five of six courts roofed. Pattaya Padel Club at Mabprachan publishes ฿600 from 10:00-16:00 and ฿800 in its other listed opening bands. Those prices do not prove that leaving Central saves money once the slot, equipment, player count and route are matched.</p>
      <p>Prime suits a player prioritising a central pin and willing to transact through the current booking system. A group prioritising indoor play, roof cover or a published time band may prefer another area. Solo players should ask for coaching or partner matching because a court booking does not create the other players. Use the <a href="/guides/padel-pickleball-pattaya/">padel and pickleball guide</a> for the six-record comparison, then price the exact slot before choosing accommodation around “Central Pattaya.”</p>
      <h2>Day-trip and evening-club clocks solve different schedules</h2>
      <p><a href="/gyms/no-limit-divers/">No Limit Divers</a> illustrates the gap between a central shop clock and a booked activity. Its current Maps listing publishes 08:00-20:00 daily at 485/9 Moo 10 on South Pattaya Road, while the operator says typical dive trips leave around 08:30-09:00 and return around 14:00-15:00. The shop pin is useful for contact and fitting; it is not proof of the boat departure point, pickup coverage, dive site or exact return time. A remote worker or short-stay visitor should reserve the whole trip window, not only the shop's opening hours.</p>
      <p><a href="/gyms/pattaya-petanque-club/">Pattaya Sai 3 Petanque Club</a> solves a different clock. Its exact bilingual Maps identity publishes 14:00-midnight daily at Plus Code WVJR+H8V. A nearby Open Pétanque listing has a different Plus Code and phone, so the hours confirm an evening-club window without resolving the active entrance, visitor fee, equipment or organised-game time. Call the selected listing before travelling and do not assume that a host or playing group is available throughout every open hour.</p>
      <p>The practical comparison is therefore day commitment versus evening availability, not watersport versus club as interchangeable exercise. For a work-led itinerary, the <a href="/guides/pattaya-digital-nomad-fitness/">digital-nomad fitness guide</a> separates member access, staffed arrival and class clocks. For these two records, confirm the exact meeting point, start and finish, inclusion or equipment list, total price and transport home.</p>
      <h2>The corridors are not interchangeable</h2>
      <p>The mapping spans the Beach Road/Second Road mall corridor, Pattaya Klang, Soi Buakhao and records described as South Pattaya. A Mike Shopping Mall workout, a Little Walk club and a Soi Bonkai facility can all appear under one area label while requiring different routes. Check the exact pin, road entrance and floor before choosing accommodation or paying. The area record does not publish fixed trip times, ride fares or a universal public-transport route.</p>
      <p>Use the <a href="/guides/best-gym-central-pattaya/">Central Pattaya gym guide</a> for a decision-led comparison and the <a href="/guides/24-hour-gyms-pattaya/">24-hour guide</a> for the member-access distinction. Before the first visit, request the exact entry product, full amount, staffed arrival window, registration requirements, towel and locker terms, class booking and holiday schedule. Blank price fields mean no stable current first-hand tariff was found, not free admission.</p>
      <h2>A pier, a shop and an activity can be three locations</h2>
      <p>Central Pattaya is often the start of an activity whose actual exercise or attraction happens elsewhere. <a href="/gyms/koh-larn-coral-island/">Koh Larn</a> is an offshore public destination reached from Bali Hai Pier. Pattaya City's transport table lists the public ferry at THB 30 and shows separate schedules for Naban and Tawaen piers, but the PDF has no clear revision date. The pier is an embarkation point, not evidence of a single island watersports operator or all-inclusive package.</p>
      <p><a href="/gyms/no-limit-divers/">No Limit Divers</a> adds another layer. Its South Pattaya shop provides a current contact and fitting location, while the day's pickup, boat departure, sites and return depend on the booked trip. The shop's business hours do not define the complete dive-day window. A central hotel can make the first contact convenient without making the underwater activity central.</p>
      <p><a href="/gyms/hard-rock-pool/">Hard Rock Hotel pool</a> is the contrasting case: the activity and the published non-resident check-in product are at the same central hotel. Its THB 500 adult and THB 400 child products apply during the outside-guest 09:00-19:00 window and include named drinks. They do not establish lap lanes, gym access or a city-wide hotel-pool rate.</p>
      <p>Use a three-pin test before paying. First save the sales or contact location. Second obtain the actual activity, pier or court pin. Third confirm the finish or return point. Ask who handles delays, what the complete total includes and whether transport connects those pins. This prevents a convenient central listing from being mistaken for a central training site, a guaranteed boat or an inclusive transfer.</p>
      <p>The same rule applies to multi-site academies, event venues and booked courts: a company address or reception desk is not automatically the session location. The area page groups records by text and first-match rules; it cannot promise that the useful entrance, activity and return all sit inside one walkable corridor. Use the venue record and written operator reply as the final location evidence.</p>
      <h2>A branch name and an activity pin are separate evidence</h2>
      <p><a href="/gyms/golf-hub-pattaya/">Golf Hub Pattaya</a> makes the branch problem explicit. Its central branch is at 350 Moo 9, B201 on Soi Buakhao and uses +66 90 913 0552. Its East Pattaya branch is at 311/3 Moo 6 on Soi Pornprapanimit, also known as Siam Country Club Road, and uses +66 65 978 1622. Both publish daily 10:00-17:00 hours, but the East branch separately advertises an indoor putting green and bunker. A generic business-name search or message to the wrong phone can therefore produce a real Golf Hub answer for the wrong facility.</p>
      <p>The product still needs naming after the branch is resolved. Golf Hub offers GCQuad practice, Swing Catalyst analysis, lessons, fitting, repair and several membership durations. No current bay, lesson, membership, fitting or repair price was public on 27 July 2026. A useful request includes the branch, date, bay duration, player count and required technology. A repair request instead names the club, labour, parts and turnaround. The missing rate is not evidence that either branch is closed or that a complimentary swing analysis equals a free lesson.</p>
      <p><a href="/gyms/pattaya-running-routes/">Pattaya Public Running Locations</a> shows the same issue without a commercial operator. Pattaya Beach, Jomtien Beach, Mabprachan Public Park, Nong Prue Public Park and the Pratamnak hill park area are distinct starting places, not one managed route. Only Pattaya Beach belongs naturally in a central-beach plan. The record does not claim measured distance, continuous access, lighting, water, toilets or a supported group. Save the exact start, crossings, turnaround and return; a broad map label cannot supply those details.</p>
      <p>SMASH adds a third boundary. The studio is on Thepprasit Road and the area matcher may group a South Pattaya description into the central index, but its exact 62/229-230 address is the navigation evidence. Its current hours and booking grid do not make the whole Thepprasit corridor central, walkable or served by a guaranteed route. Use the <a href="/gyms/smash-fitness-kickboxing/">SMASH venue record</a> for the contact and live session, then verify transport from the actual accommodation.</p>
      <h2>A day pass, a Monday club and a family ticket follow different clocks</h2>
      <p><a href="/gyms/dusit-thani-pattaya/">Dusit Thani Pattaya — Devarana Wellness</a>, <a href="/gyms/pattaya-hash-house/">Pattaya Hash House Harriers</a> and <a href="/gyms/underwater-world-pattaya/">Underwater World Pattaya</a> all sit inside the broad central-south corridor logic, but they solve completely different planning problems. Dusit's current site publishes a THB 2,499 Devarana wellness day pass, a separate tennis product from 07:00 to 20:00 at THB 1,000 per hour for up to two players, and an ice-bath offer at THB 1,200. Those are bookable hotel-wellness transactions that need a reservation and a clear statement of what is included.</p>
      <p>Pattaya Hash is not a day pass at all. Its own site says the group gathers at Buffalo Bar from 14:30 every Monday, the last bus leaves at 15:00 and the first circle starts at 16:00. The current public contribution is THB 400 for men, THB 150 for women and THB 50 for children aged 16 or under. The useful question is not whether it is cheaper than Dusit tennis. The useful question is whether the traveller wants a weekly social trail structure or a premium booked facility.</p>
      <p>Underwater World adds a third clock. The current operator pages publish daily 09:00 to 18:00 opening, 17:30 last admission and walk-in ticket prices of THB 550 for visitors over 131 cm and THB 320 for children 91–130 cm. That is a timed family attraction with feeding-show slots, not an exercise session. It can still matter to an active traveller or family choosing a central base, but it should not be compared to a gym pass, a club run or a hotel tennis hour as if those were the same product.</p>
      <p>This is why “Central Pattaya” has to be filtered by access model before price. A hotel day pass, a Monday club routine and an aquarium ticket can all be genuine central-area records while demanding different booking windows, clothing, transport plans and expectations. Start by choosing whether the day is training, social sport or family attraction. Then take the exact pin, cut-off time and product price from the individual record. The area label is only the shortlist, not the decision.</p>
      <p>The decision sequence is branch, product, activity pin and return. Start by selecting the exact branch or venue identity. Obtain the named session, bay, service or self-directed route. Save the entrance rather than only the company or area. Finally, plan where the activity ends and how the group or solo visitor returns. This method is more reliable than choosing “Central Pattaya” from a result count because the 38-record filter includes several access models, two closures, three unverified records and one non-sport record. The <a href="/guides/best-gym-central-pattaya/">Central Pattaya gym guide</a> narrows the staffed-access and price questions after the exact pin is known.</p>
      <h2>A central class, a hotel pool pass and a 24-hour membership do not solve the same day</h2>
      <p><a href="/gyms/wko-muay-thai/">ISS Boxing and Muay Thai</a>, <a href="/gyms/hard-rock-pool/">Hard Rock Hotel Pattaya Pool</a> and <a href="/gyms/anytime-fitness-pattaya/">Anytime Fitness Pattaya</a> are a useful three-record check inside the central-south corridor logic. ISS gives a named coached-combat session from 14:00 to 15:30 Monday to Saturday, with separate prices for the class, general gym access and recovery room. Hard Rock gives a non-resident leisure-pool product during the outside-guest window of 09:00 to 19:00, with the hotel publishing THB 500 for an adult and THB 400 for a child under 12 as checked on 26 July 2026. Anytime is different again: the operator evidence supports 24-hour member access at both the Again Pattaya and Bukit Point branches, but it does not publish a current public branch tariff. Those are three real central-area answers to three different problems.</p>
      <p>ISS is for a defined coached block. Hard Rock is for a timed daytime leisure visit. Anytime is for a membership-based training routine whose usable value depends on branch, joining terms and whether the traveller already has access. A reader who only asks “what is the cheapest central gym?” can miss that one product is a class, one is a pool pass and one is a membership door. The right first comparison is not baht alone; it is whether the day requires coaching, leisure access or open-hours flexibility.</p>
      <p>The area filter also hides a branch boundary. The directory keeps Again Pattaya and Bukit Point under one Anytime record because the brand, access model and current public pricing gap are the real story, but the two clubs are not the same trip. A hotel near Beach Road may make one branch practical and the other inconvenient. That is why the venue record keeps the operator page for Bukit Point while noting the separate Again Pattaya identity. A brand answer is not the same as an arrival answer.</p>
      <p>Hard Rock shows a second planning boundary. The published pool pass is clear enough to compare, but it remains a leisure product at a hotel. It does not establish lap lanes, gym access or a central-city rule that every beachfront hotel will sell the same thing. ISS shows the opposite risk: a public class page exists, but the lower facility-only price should not be mistaken for a coached combat session. Each record is usable precisely because it keeps the access model narrow.</p>
      <p>For a central stay, choose the day shape first. If the need is a coached combat session, use ISS and price the exact class or class-plus-recovery combination. If the need is a family or leisure pool day, use Hard Rock and confirm outside-guest availability that morning. If the need is flexible solo training at odd hours, choose the exact Anytime branch and ask the club for current joining terms. The area page can surface all three, but only the record can tell you which clock, which branch and which product you are actually buying.</p>
      <h2>A central stay should not be planned around a Bangkok stadium card</h2>
      <p>The central corridor becomes less useful the moment the chosen Muay Thai product is actually in Bangkok. <a href="/gyms/lumpinee-boxing-stadium/">Lumpinee</a> and <a href="/gyms/rajadamnern-stadium/">Rajadamnern</a> are both retained in the directory because Pattaya visitors do make those trips, but neither helps answer the central-area accommodation question in the same way that ISS, Hard Rock or an Anytime branch does. A Bangkok ticket solves an evening spectator plan. It does not solve the daytime class route, the 24-hour door question or the pool-access problem inside Central Pattaya.</p>
      <p>This matters because the word “Muay Thai” can make very different records look similar in a shortlist. Lumpinee's operator page checked 27 July 2026 publishes several ticket bands and date-specific event times. Rajadamnern publishes a seven-night event pattern with seat classes that vary by card. Those details matter if the plan is a fight night. They do not tell you whether your hotel should sit near Beach Road, Welcome Town or Soi Buakhao for a repeat training routine. A central room can still make sense for Pattaya classes and one Bangkok day trip, but the trip should be built around the actual activity pin, not the category label.</p>
      <p>The practical rule is to separate the recurring product from the optional product. If your daily routine is a central class at <a href="/gyms/wko-muay-thai/">ISS</a>, a hotel pool day at <a href="/gyms/hard-rock-pool/">Hard Rock</a> or odd-hour access through <a href="/gyms/anytime-fitness-pattaya/">Anytime Fitness Pattaya</a>, plan the room around those central answers first. Add Lumpinee or Rajadamnern only after the training week already works. The <a href="/guides/train-muay-thai-pattaya-1-week-1-month/">1 week versus 1 month guide</a> and the <a href="/guides/best-gym-central-pattaya/">Central Pattaya gym guide</a> are more reliable when the Bangkok spectator product is kept separate from the central training product.</p>`,
    bestFor: [
      { label: 'Short stays with a known schedule', why: 'Mall and street-level options are concentrated in the central corridor, but confirm the exact entrance and closing time before choosing a hotel around a venue.' },
      { label: 'A priced central gym product', why: 'ISS publishes separate general-gym and coached-combat access, with its exact class page carrying the dated tariff.' },
      { label: 'Late or 24-hour training', why: 'Fitness 7 publishes 24-hour operation; Jetts, Anytime and the current Tony’s listing publish round-the-clock access with different staffing or registration evidence.' },
      { label: 'Mixed access models', why: 'Commercial memberships, coached combat, hotel amenities, leisure-pool passes and club participation require different eligibility and pricing checks.' }
    ],
    transport: 'Beach Road and Second Road run along the central beach corridor; Pattaya Klang runs inland and Soi Buakhao is farther east. Check the live route and building entrance for the specific venue rather than assuming every “Central Pattaya” result is walkable.',
    landmarks: [
      'Walking Street (south end of Beach Road)',
      'Bali Hai Pier (boats to Koh Larn)',
      'Pattaya Beach (main public beach)',
      'Soi Buakhao (mid-market food + nightlife strip)',
      'Central Festival Pattaya Beach (mall)',
      'Big-C Pattaya Klang'
    ],
    starterPicks: 'For a short stay, first choose the product: ISS for separately priced facility or coached-combat access, Fitness 7 for documented 24-hour operation with a contact-first tariff, Coco for a central staffed-hours gym whose current price requires confirmation, or Hard Rock for a published non-guest leisure-pool pass. Then verify the exact pin and eligibility.'
  },

  'east-pattaya': {
    accent: 'accent-mint',
    summary: 'The inland index covers Nong Prue, Pong, Mabprachan, Huai Yai and broad Sukhumvit-area matches. It is useful for finding long-stay training, courts and outdoor sport, but each venue pin and access policy needs checking.',
    intro: `<p><strong>If you only read one thing: the East Pattaya filter is broad.</strong> It currently returns 61 directory records across 14 categories, but that is an index result rather than a claim that 61 bookable venues sit within one compact neighbourhood. The location rule matches East Pattaya, Nong Prue, Pong, Mabprachan, Huai Yai and addresses containing Sukhumvit, so it also catches some records whose practical location may be described as Central, South or North Pattaya. Sixty records have no closure or verification warning in the data; one, Pattaya Floating Market, is explicitly marked non-sport. Open the live map and read the individual status before choosing accommodation around a result.</p>
      <h2>What the index actually contains</h2>
      <p>The largest groups are ten Muay Thai records, ten kids-and-youth records and nine racquet records. The remainder comprises six club records, five swimming records, four fitness records, four golf records, four adventure records, two yoga records, two equestrian records, two watersports records and one each for MMA, CrossFit and climbing. Those counts mix ordinary memberships, coached combat sessions, school or academy programmes, court hire, pools, golf courses and book-ahead attractions. There is no honest single day-pass price for the area.</p>
      <h2>Use dated prices to compare the same product</h2>
      <p>For coached Muay Thai, <a href="/gyms/sudsakorn-muay-thai-gym/">Sudsakorn Muay Thai</a> published a ฿400 single session, ฿600 for two sessions in one day, ฿1,800 for one week at one session per day and ฿6,000 for one month at one session per day, checked 25 July 2026. Castra's fight-club page listed ฿300 for one group class, ฿2,500 for ten group classes valid for two months and ฿600 for a private class on the same check date; its general gym membership price was not published.</p>
      <p>Court hire is a different comparison. <a href="/gyms/pattaya-padel-club/">Pattaya Padel Club</a> listed ฿600 per hour from 10:00–16:00 and ฿800 per hour from 07:00–10:00 and 16:00–22:00, checked 25 July 2026. Its one-hour coaching ranged from ฿1,600 for one player to ฿2,600 for four. Silk Muay Thai's residential packages started at ฿16,000 for one week on the same date, but that product bundles a private room, training and specified inclusions. Compare session with session, court with court and residential package with residential package.</p>
      <p>The current batch adds two useful East Pattaya contrasts. <a href="/gyms/fitness-7/">Fitness 7 Pattaya</a> is central rather than inland, but its newly checked branch-wide rate card — ฿350 day, ฿1,600 month, ฿4,500 three months, ฿8,400 six months and ฿14,400 twelve months on 27 July 2026 — shows how cheap a plain gym-access product can look beside a camp package. <a href="/gyms/kombat-group-thailand/">Kombat Group</a> and <a href="/gyms/silk-muay-thai/">Silk Muay Thai</a> are the opposite case: their published East-side numbers are residential bundles, not simple class-only or gym-only equivalents. Compare access with access before calling one side more expensive.</p>
      <h2>Who East Pattaya suits</h2>
      <p>The inland area works best for a longer stay when the chosen venue is near the accommodation and the booking model is already clear. It offers two-a-day Muay Thai schedules, residential camp products, racquet courts, golf and book-ahead outdoor activities. It is a weaker choice for a short visitor expecting to walk between several venues or rely on a universal public-transport route. Sukhumvit Road, the railway-road corridor, local sois and the Mabprachan/Pong belt are not one walkable cluster.</p>
      <p>Before paying for accommodation, check the exact pin, road entrance, session time, parking or pickup policy and return plan. For a location-based shortlist, continue to the <a href="/guides/best-gym-east-pattaya/">East Pattaya gym guide</a>.</p>`,
    bestFor: [
      { label: 'Long-stay combat training', why: 'Several records publish morning and afternoon periods, but confirm the exact discipline, current rate and travel route before choosing a base.' },
      { label: 'Racquet and court bookings', why: 'The broad area index includes nine racquet records, including padel, badminton and tennis products with different booking rules.' },
      { label: 'School and youth programmes', why: 'Ten kids-and-youth records appear in the mapping; access may be limited to pupils, enrolled academy members or announced camps.' },
      { label: 'Book-ahead outdoor sport', why: 'Golf, ATV, shooting, equestrian and watersports records are spread across the inland belt and often require a reservation or direct eligibility check.' }
    ],
    transport: 'The filter spans multiple inland corridors rather than one centre. Check the exact venue pin and road entrance, then confirm parking, pickup or the transport you will use after the session; do not assume an East Pattaya label means two results are close together.',
    landmarks: [
      'Mabprachan Lake (residential expat center)',
      'Sukhumvit Road (Highway 3)',
      'Tepprasit Road (connects beach to inland)',
      'Huai Yai (rural, near Chak Nok Lake — Kombat Group territory)',
      'Pong / Nong Prue villages',
      'Si Racha-Pattaya highway (Highway 7) for Bangkok access'
    ],
    starterPicks: 'Choose the exact training product first, then place accommodation around its live pin and session times. A small price saving is not useful if the venue requires two difficult inland journeys every training day.'
  },

  'sattahip': {
    accent: 'accent-yellow',
    summary: 'A 21-record regional filter spanning Na Jomtien, Bang Saray and Sattahip, with fitness, watersports, swimming and book-ahead destination activities spread across a long southern corridor.',
    intro: `<p><strong>If you only read one thing: this page is a 21-record regional filter, not a walkable Sattahip neighbourhood shortlist.</strong> As checked on 26 July 2026, it contains eight fitness records, five watersports, three swimming, two clubs and one each for golf, racquet sport and adventure. The matching rule includes addresses containing Sattahip, Na Jomtien, Bang Saray, Bang Sare and U-Tapao, so two results can be materially far apart. Open the exact map before choosing accommodation or combining activities.</p>
      <p>None of the 21 records currently carries a formal closed or unverified status warning. That does not make every facility public. Hotel fitness rooms and resort pools generally document an amenity for registered guests unless the individual page explicitly publishes a non-resident product. Khao Chi Chan is a cultural walking stop rather than a sports venue. Water parks, swim schools, lap pools and hotel pools also answer different needs even though several appear under swimming.</p>
      <h2>Prices describe different products</h2>
      <p><a href="/gyms/chee-chan-golf/">Chee Chan Golf Resort</a> published an 18-hole public green fee of ฿4,500 on weekdays or ฿5,500 on weekends and public holidays, checked on 25 July 2026. Its rate card adds a compulsory ฿1,300 caddie-and-cart charge for 18 holes, producing a required ฿5,800 weekday or ฿6,800 weekend total before optional rental or any tip. The same card listed nine holes at ฿2,250 or ฿2,750 plus ฿700 for caddie and cart. Confirm the tee time and any dress or rental requirement directly.</p>
      <p><a href="/gyms/clubloongchat-watersports/">Clubloongchat Watersport</a> publishes book-ahead instruction and rentals rather than a single admission price. Its services checked on 25 July included a one-hour lesson at ฿1,700, stand-up paddleboard hire at ฿300 per hour and beginner windsurf equipment at ฿500 per hour. For a first kitesurf or sailing rental, the operator requires an instructor for the first hour at an additional ฿400. Skill, wind and equipment policy therefore matter as much as the headline rental amount.</p>
      <p><a href="/gyms/ramayana-water-park/">Ramayana Water Park</a> listed a tourist online ticket of ฿1,099 and a ฿1,199 walk-in ticket for guests at least 106 centimetres tall, checked on 25 July 2026; the displayed promotion admitted shorter children free. That is a leisure-water-park product, not a lap-pool fee. <a href="/gyms/better-bodies-gym-na-jomtien/">Better Bodies Gym</a> published a very different long-stay offer: ฿2,500 for three months or ฿4,500 for six months paid in advance, with no current drop-in amount.</p>
      <h2>Choose by corridor and booking model</h2>
      <p>Na Jomtien covers the northern end of this filter and includes resort, golf, gym and water-activity records. Bang Saray and Sattahip results sit farther south, while U-Tapao-labelled records may follow another route again. A shared area page does not establish a reliable transfer time. Check the live pin, entrance, road conditions and return plan from the actual accommodation.</p>
      <p>Book watersports against the weather, participant skill and the operator's cancellation terms. For golf, obtain the written total rather than comparing green fees alone; the <a href="/guides/best-golf-courses-pattaya/">current Pattaya course guide</a> explains caddie, cart and loop questions. For ordinary training, confirm whether the record is a public gym, a resort amenity or a membership product. For a gym-focused south-of-city shortlist, use the <a href="/guides/best-gym-sattahip-pattaya/">Sattahip gym guide</a> and keep each activity's exact map and access policy attached to the decision.</p>`,
    bestFor: [
      { label: 'Book-ahead watersports', why: 'Five watersports records appear in the filter; compare the exact activity, required skill, equipment, weather policy and launch location.' },
      { label: 'A documented golf day', why: 'Chee Chan publishes current public green, caddie and cart charges, making a written total possible without relying on a reseller.' },
      { label: 'Long-stay local fitness', why: 'Eight fitness records include neighbourhood and resort facilities; check public access and contract duration before comparing them.' },
      { label: 'Family water activities', why: 'The set includes water-park, swimming and resort-pool records, but admission, supervision and purpose differ between them.' },
      { label: 'A multi-stop day with planned transport', why: 'Na Jomtien, Bang Saray, Sattahip and U-Tapao results are spread along a long corridor and should be routed from exact pins.' }
    ],
    transport: 'The filter spans Na Jomtien, Bang Saray, Sattahip and U-Tapao rather than one centre. Check every exact pin and entrance, then arrange the outward and return journey around the booked start time. Do not infer a fixed fare or transfer time from the area label.',
    landmarks: [
      'Bang Saray Beach',
      'Ocean Marina Yacht Club',
      'U-Tapao Pattaya International Airport',
      'Khao Chi Chan Buddha Mountain',
      'Chee Chan Golf Resort',
      'Ramayana Water Park'
    ],
    starterPicks: 'Start with one record that has a current price, exact pin and clear access model. Chee Chan suits a pre-booked course day, Clubloongchat a skill-matched watersports booking, Ramayana a leisure day and Better Bodies a multi-month gym plan. Reconfirm the selected date and total directly.'
  }
};

function areaPage(slug, label, venues) {
  const url = `${SITE}/area/${slug}/`;
  const title = `Gyms in ${label}, Pattaya (${venues.length}) | Pattaya.Gym`;
  const desc = truncateDesc(`Every gym, Muay Thai camp and sport venue in ${label}, Pattaya — ${venues.length} hand-checked listings with hours, prices, maps and contact. Filter by sport or compare side by side.`);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Sport venues in ${label}`,
    numberOfItems: venues.length,
    itemListElement: venues.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/gyms/${v.id}/`,
      name: v.name
    }))
  };
  const crumbsLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: label }
    ], url)
  };
  const faqLd = areaFaqLd(slug, label);
  const faqHtml = areaFaqHtml(slug, label);
  const jsonLd = faqLd ? [itemList, crumbsLd, faqLd] : [itemList, crumbsLd];

  return head({ title, desc, url, jsonLd , modified: SITE_MODIFIED })
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: label }
      ])
    + `
<main id="main">

${(() => {
  const content = AREA_CONTENT[slug] || null;
  const accent = content ? content.accent : 'accent-cyan';
  // Top-3 sport categories in this area (by venue count)
  const catCounts = {};
  for (const v of venues) catCounts[v.category] = (catCounts[v.category] || 0) + 1;
  const topCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, count]) => ({ key, count, label: (CATEGORIES.find(c => c.key === key) || {}).label || key }));

  return `<section class="hero hub-hero hub-hero--area u-pt-10-pb-8">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Neighborhood · ${venues.length} venues · ${topCats.length} sports</div>
    <h1 class="hero-h1">
      Gyms in <span class="${accent}">${esc(label)}, Pattaya.</span>
    </h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width:780px;">${content ? esc(content.summary) : `Every gym and sport venue in <strong>${esc(label)}, Pattaya</strong> — ${venues.length} hand-checked entries across Muay Thai, fitness, yoga, golf and more.`}</p>
    <p class="hero-meta u-text-left">${venues.length} venues · ${esc(label)} · Pattaya · Updated ${TODAY}</p>
    <div class="btn-row u-mt-5">
      <a href="/search/?area=${esc(slug)}" class="btn btn-primary">▶ Search ${esc(label)}</a>
      <a href="/sports/" class="btn btn-secondary">All sports</a>
      <a href="/compare/" class="btn btn-ghost">Compare</a>
    </div>
  </div>
</section>

${content ? `
<section class="section u-pt-0">
  <div class="wrap">
    <article class="venue-body" style="max-width:880px; margin:0;">
      <div class="eyebrow u-mb-3"><span class="num">01</span> About this neighborhood</div>
      <h2 class="h-section">What ${esc(label)} <span class="${accent}">is for.</span></h2>
      ${content.intro}
    </article>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> Best for</div>
    <h2 class="h-section">When to pick <span class="${accent}">${esc(label)}.</span></h2>
    <div class="numlist">
      ${content.bestFor.map((b, i) => `
      <div class="numcard">
        <div class="numcard-head">
          <span class="numcard-num">${String(i+1).padStart(2,'0')}</span>
          <h3 class="numcard-title">// ${esc(b.label)}</h3>
        </div>
        <p class="numcard-body">${esc(b.why)}</p>
      </div>
      `).join('')}
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap u-wrap-max">
    <article class="venue-body" style="max-width:880px; margin:0;">
      <div class="eyebrow u-mb-3"><span class="num">03</span> Transport &amp; access</div>
      <h2 class="h-section">How to <span class="accent-cyan">get there.</span></h2>
      <p>${esc(content.transport)}</p>

      <div class="eyebrow" style="margin:var(--s-6) 0 var(--s-3);"><span class="num">04</span> Landmarks &amp; orientation</div>
      <h2 class="h-section">Where you <span class="accent-yellow">are.</span></h2>
      <ul>${content.landmarks.map(l => `<li>${esc(l)}</li>`).join('')}</ul>

      <div class="eyebrow" style="margin:var(--s-6) 0 var(--s-3);"><span class="num">05</span> Starter pick</div>
      <h2 class="h-section">If you're <span class="accent-pink">new here.</span></h2>
      <p>${esc(content.starterPicks)}</p>
    </article>
  </div>
</section>
` : ''}

<section class="section u-pt-4">
  <div class="wrap">
    <div class="eyebrow"><span class="num">0${content ? '6' : '1'}</span> By sport</div>
    <h2 class="h-section">Sports in <span class="accent-mint">${esc(label)}.</span></h2>
    <p class="lede">Jump straight to the combined category-area page for any sport in ${esc(label)}.</p>
    <div class="btn-row" style="flex-wrap:wrap; gap:8px; margin-top:var(--s-4);">
      ${topCats.map(c => `<a href="/area/${slug}/${c.key}/" class="btn btn-ghost" style="font-size:13px;">${esc(c.label)} <span style="color:var(--muted); font-weight:400;">(${c.count})</span></a>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="padding-top:var(--s-6);">
  <div class="wrap">
    <div class="eyebrow"><span class="num">0${content ? '7' : '2'}</span> Every venue</div>
    <h2 class="h-section">All ${venues.length} venues in <span class="accent-yellow">${esc(label)}.</span></h2>
    <div class="numlist guide-hub-grid">
      ${venues.length ? venues.map(v => venueListingCard(v)).join('') : '<p class="u-muted">No venues currently listed in this area.</p>'}
    </div>
  </div>
</section>

${(() => {
  // Round 19 — Codex F08.1: cross-link matrix to surface the category-area
  // combinations (e.g. /area/jomtien/muay-thai/). Without this block the 15
  // category-area pages were orphans in the link graph.
  const here = (slug || '').toLowerCase();
  const byCategory = {};
  for (const v of venues) {
    if (!v.category) continue;
    (byCategory[v.category] = byCategory[v.category] || []).push(v);
  }
  const sportLinks = CATEGORIES
    .filter(c => byCategory[c.key] && byCategory[c.key].length > 0)
    .map(c => `<a href="/area/${here}/${c.key}/" class="u-plain-link" style="display:inline-flex; align-items:center; gap:8px; padding:8px 14px; border:1px solid rgba(255,255,255,0.12); border-radius:999px; font-size:13px; background:rgba(255,255,255,0.02); transition:border-color var(--t-fast);"><span style="color:var(--cyan); font-weight:700;">${byCategory[c.key].length}</span> <span class="u-muted">${esc(c.label)}</span></a>`)
    .join('');
  return sportLinks ? `<section class="section u-pt-0"><div class="wrap"><div class="eyebrow"><span class="num">03</span> Browse this area by sport</div><h2 class="h-section">Every sport in <span class="accent-cyan">${esc(label)}.</span></h2><p class="lede">Each tag below opens a focused page listing every venue of that sport in ${esc(label)}.</p><div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:var(--s-5);">${sportLinks}</div></div></section>` : '';
})()}
${faqHtml}
</main>`;
})()}
`
    + paNetwork()
    + footer(venuePageScripts());
}

// ---------- Combined category-area landing page ----------
// URL: /area/<area-slug>/<category-key>/
// Targets long-tail queries like "Muay Thai in Jomtien Pattaya".
function categoryAreaPage(areaSlug, areaLabel, cat, venues) {
  const url = `${SITE}/area/${areaSlug}/${cat.key}/`;
  const catLabel = cat.label;
  const core = `${catLabel} in ${areaLabel}, Pattaya`;
  const title = core.length <= 49 ? `${core} | Pattaya.Gym` : truncateTitle(core);
  const desc = truncateDesc(`Every ${catLabel.toLowerCase()} venue in ${areaLabel}, Pattaya — ${venues.length} hand-checked ${venues.length === 1 ? 'option' : 'options'} with hours, prices and contact details. Independent directory, no paid placements, verified on a rolling schedule.`);

  const accentColors = {
    'muay-thai':'accent-pink','mma':'accent-pink','bjj':'accent-pink',
    'fitness':'accent-yellow','crossfit':'accent-yellow',
    'golf':'accent-mint',
    'yoga':'accent-cyan','racquet':'accent-cyan','swimming':'accent-cyan','watersports':'accent-cyan',
    'climbing':'accent-mint','clubs':'accent-mint','kids-youth':'accent-yellow',
    'equestrian':'accent-mint','adventure':'accent-mint'
  };
  const accent = accentColors[cat.key] || 'accent-pink';

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${catLabel} in ${areaLabel}, Pattaya`,
    numberOfItems: venues.length,
    itemListElement: venues.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/gyms/${v.id}/`,
      name: v.name
    }))
  };
  const crumbsLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: areaLabel, href: `/area/${areaSlug}/` },
      { label: catLabel }
    ], url)
  };
  const jsonLd = [itemList, crumbsLd];

  return head({ title, desc, url, jsonLd , modified: SITE_MODIFIED })
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: areaLabel, href: `/area/${areaSlug}/` },
        { label: catLabel }
      ])
    + `
<main id="main">

<section class="hero hub-hero hub-hero--category" style="text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// ${esc(catLabel)} · ${esc(areaLabel)} · ${venues.length} venue${venues.length === 1 ? '' : 's'}</div>
    <h1 class="hero-h1">
      <span class="${accent}">${esc(catLabel)}</span><br>
      <span class="hub-hero-sub">in ${esc(areaLabel)}.</span>
    </h1>
    <p class="hero-lede u-text-left-ml0">${venues.length} hand-checked <strong>${esc(catLabel.toLowerCase())}</strong> ${venues.length === 1 ? 'venue' : 'venues'} in <strong>${esc(areaLabel)}, Pattaya</strong>. No paid placements. Verified on a rolling schedule. The complete local list.</p>
    <p class="hero-meta u-text-left">${venues.length} venues · ${esc(areaLabel)} · Pattaya · Updated ${TODAY}</p>
    <div class="btn-row u-mt-5">
      <a href="/search/?cat=${esc(cat.key)}&amp;area=${esc(areaSlug)}" class="btn btn-primary">▶ Search in ${esc(areaLabel)}</a>
      <a href="/category/${cat.key}/" class="btn btn-secondary">● All ${esc(catLabel.toLowerCase())} in Pattaya</a>
      <a href="/area/${areaSlug}/" class="btn btn-tertiary">All ${esc(areaLabel)} venues →</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> The list</div>
    <h2 class="h-section">Every ${esc(catLabel.toLowerCase())} venue in <span class="${accent}">${esc(areaLabel)}.</span></h2>
    <div class="numlist guide-hub-grid">
      ${venues.length ? venues.map(v => venueListingCard(v)).join('') : `<p class="u-muted">No ${esc(catLabel.toLowerCase())} venues currently listed in ${esc(areaLabel)}. Try <a href="/category/${cat.key}/" class="u-cyan">all ${esc(catLabel.toLowerCase())} in Pattaya</a> or <a href="/area/${areaSlug}/" class="u-cyan">all venues in ${esc(areaLabel)}</a>.</p>`}
    </div>
  </div>
</section>

<section class="section u-pt-4">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> Browse more</div>
    <h2 class="h-section">Looking elsewhere in <span class="accent-cyan">Pattaya?</span></h2>
    <p class="lede">Browse this sport in other neighborhoods, or explore everything ${esc(areaLabel)} offers.</p>
    <div class="btn-row">
      <a href="/category/${cat.key}/" class="btn btn-primary">▶ All ${esc(catLabel)} in Pattaya</a>
      <a href="/area/${areaSlug}/" class="btn btn-secondary">● All sports in ${esc(areaLabel)}</a>
      <a href="/search/?cat=${cat.key}&amp;area=${areaSlug}" class="btn btn-tertiary">Filter search →</a>
    </div>
  </div>
</section>

</main>
`
    + paNetwork()
    + footer(venuePageScripts());
}

// ---------- Utility / info page ----------
function utilityPage({ slug, title, desc, eyebrow, headlineLead, headlineAccent, accentClass, lede, bodyHtml, showContactCard = false, robots }) {
  const url = `${SITE}/${slug}/`;
  const robotsMeta = robots || (slug === '404' ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  // Pick a sensible @type per known slug
  const pageType = ({ 'about':'AboutPage', 'contact':'ContactPage', 'methodology':'AboutPage', 'press':'WebPage', 'add-your-gym':'WebPage', 'colophon':'AboutPage', 'pattaya-sport-stats':'WebPage', '404':'WebPage' })[slug] || 'WebPage';
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': pageType,
    '@id': `${url}#webpage`,
    url: url,
    name: title,
    description: desc,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE}/#website` }
  };
  const crumbsLd = {
    '@context': 'https://schema.org',
    ...breadcrumbJsonLd([
      { label: 'Home', href: '/' },
      { label: eyebrow }
    ], url)
  };
  const utilJsonLd = [webPageLd, crumbsLd];
  // FOOTER-SPEC-2026: the TimPaemi Organization entity + author/publisher refs
  // are injected centrally in head() on every page — no per-page entity here.

  const contactBlock = showContactCard ? `
<section class="section">
  <div class="wrap">
    <div class="eyebrow"><span class="num">★</span> Talk to us</div>
    <h2 class="h-section">Reach us <span class="accent-mint">direct.</span></h2>
    <div class="channels-grid">
      <a href="mailto:info@pattaya-gym.com" class="channel-card is-email">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// Email</div>
        <h3 class="channel-card-name">info@pattaya-gym.com</h3>
        <div class="channel-card-sub">Reply within 24h</div>
      </a>
      
      <a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer" class="channel-card is-line">
        <span class="channel-card-arrow">↗</span>
        <div class="channel-card-tag">// LINE</div>
        <h3 class="channel-card-name">@timpaemi</h3>
        <div class="channel-card-sub">Daily check</div>
      </a>
    </div>
  </div>
</section>` : '';

  return head({ title, desc, url, jsonLd: utilJsonLd, robots: robotsMeta , modified: SITE_MODIFIED })
    + nav()
    + breadcrumb([
        { label: 'Home', href: '/' },
        { label: eyebrow }
      ])
    + `
<main id="main">

<section class="hero u-pt-10-pb-8">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// ${esc(eyebrow)}</div>
    <h1 class="hero-h1 u-h-fluid">
      ${esc(headlineLead)}<br>
      <span class="${accentClass}">${esc(headlineAccent)}.</span>
    </h1>
    <p class="hero-lede u-lede-h">${lede}</p>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <article class="venue-body" style="max-width:760px; margin:0;">
      ${bodyHtml}
    </article>
  </div>
</section>

${contactBlock}

</main>
`
    + paNetwork()
    + footer();
}

// ---------- Pattaya Sport Stats dashboard body builder ----------
// Round 15: real interactive-feeling dashboard with server-rendered SVG.
// No JS, no charting library, no external deps. Pure inline SVG from GYMS data.
function buildSportStatsBody() {
  // === Compute stats from data ===
  const total = GYMS.length;
  const catCounts = {};
  for (const g of GYMS) catCounts[g.category] = (catCounts[g.category] || 0) + 1;
  const catRows = CATEGORIES
    .map(c => ({ key: c.key, label: c.label, count: catCounts[c.key] || 0 }))
    .sort((a, b) => b.count - a.count);

  const areaCounts = {};
  for (const slug of Object.keys(AREA_MAP)) areaCounts[slug] = 0;
  let unmappedArea = 0;
  for (const g of GYMS) {
    const s = areaSlugFor(g.area);
    if (s) areaCounts[s]++; else unmappedArea++;
  }
  const areaRows = Object.keys(AREA_LABELS)
    .map(s => ({ slug: s, label: AREA_LABELS[s], count: areaCounts[s] }))
    .sort((a, b) => b.count - a.count);

  const priceCounts = { '฿': 0, '฿฿': 0, '฿฿฿': 0, '฿฿฿฿': 0, '—': 0 };
  for (const g of GYMS) {
    const p = g.priceRange || '—';
    if (priceCounts[p] !== undefined) priceCounts[p]++; else priceCounts['—']++;
  }

  const today = new Date();
  let fresh30 = 0, fresh60 = 0, older = 0;
  for (const g of GYMS) {
    if (!g.verified) { older++; continue; }
    const age = Math.round((today.getTime() - new Date(g.verified).getTime()) / 86400000);
    if (age <= 30) fresh30++;
    else if (age <= 60) fresh60++;
    else older++;
  }

  const phoneCount = GYMS.filter(g => g.phone && g.phone.length > 4).length;
  const websiteCount = GYMS.filter(g => g.website && g.website.length > 8).length;
  let geoCount = 0;
  try {
    const geoMap = VENUE_GEO || {};
    geoCount = GYMS.filter(g => geoMap[g.id] && geoMap[g.id].lat).length;
  } catch (e) { geoCount = 0; }
  const detailCount = GYMS.filter(g => g.detailFile).length;
  const sourcesCount = 0; // editorial — would need to parse each MD; leave for now

  // === Chart helpers ===
  const ACCENT_COLORS = ['#ff2e7e', '#4ee0ff', '#fde047', '#5fffa0', '#ff3d3d', '#a855f7', '#22d3ee', '#f97316', '#eab308', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#06b6d4'];
  function pct(n, d) { return d > 0 ? Math.round((n / d) * 100) : 0; }
  function bar(value, max, w, color) {
    const px = Math.max(2, Math.round((value / max) * w));
    return `<rect x="0" y="0" width="${px}" height="22" rx="3" fill="${color}"/>`;
  }

  // Horizontal bar chart for categories
  const catChartMax = Math.max(...catRows.map(r => r.count));
  const catChartHTML = `
<svg viewBox="0 0 600 ${catRows.length * 32 + 10}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Venues by sport category" style="width:100%; height:auto; max-width:600px; display:block; margin:0 auto;">
  ${catRows.map((r, i) => `
  <g transform="translate(180, ${i * 32 + 5})">
    <text x="-10" y="16" text-anchor="end" font-family="Inter, sans-serif" font-size="13" fill="#c4c4c4" font-weight="500">${esc(r.label)}</text>
    ${bar(r.count, catChartMax, 320, ACCENT_COLORS[i % ACCENT_COLORS.length])}
    <text x="${Math.max(2, Math.round((r.count / catChartMax) * 320)) + 8}" y="16" font-family="Inter, sans-serif" font-size="13" fill="#f5f5f5" font-weight="700">${r.count}</text>
  </g>`).join('')}
</svg>`;

  // Horizontal bar chart for areas
  const areaChartMax = Math.max(...areaRows.map(r => r.count));
  const areaChartHTML = `
<svg viewBox="0 0 600 ${areaRows.length * 36 + 10}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Venues by area" style="width:100%; height:auto; max-width:600px; display:block; margin:0 auto;">
  ${areaRows.map((r, i) => `
  <g transform="translate(220, ${i * 36 + 5})">
    <text x="-10" y="18" text-anchor="end" font-family="Inter, sans-serif" font-size="14" fill="#c4c4c4" font-weight="500">${esc(r.label)}</text>
    <rect x="0" y="2" width="${Math.max(2, Math.round((r.count / areaChartMax) * 280))}" height="26" rx="3" fill="${ACCENT_COLORS[(i + 1) % ACCENT_COLORS.length]}"/>
    <text x="${Math.max(2, Math.round((r.count / areaChartMax) * 280)) + 8}" y="20" font-family="Inter, sans-serif" font-size="14" fill="#f5f5f5" font-weight="700">${r.count}</text>
  </g>`).join('')}
</svg>`;

  // Donut for price tier distribution
  const priceEntries = Object.entries(priceCounts).filter(([k, v]) => v > 0);
  const priceTotal = priceEntries.reduce((s, [, v]) => s + v, 0);
  let priceCumulative = 0;
  const priceColors = { '฿': '#5fffa0', '฿฿': '#4ee0ff', '฿฿฿': '#fde047', '฿฿฿฿': '#ff2e7e', '—': '#666' };
  const donutR = 65;
  const donutCirc = 2 * Math.PI * donutR;
  const donutPaths = priceEntries.map(([tier, n]) => {
    const dash = (n / priceTotal) * donutCirc;
    const offset = priceCumulative;
    priceCumulative += dash;
    return `<circle cx="100" cy="100" r="${donutR}" fill="none" stroke="${priceColors[tier]}" stroke-width="26" stroke-dasharray="${dash} ${donutCirc - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 100 100)" />`;
  }).join('');
  const donutHTML = `
<div style="display:grid; grid-template-columns:1fr; gap:var(--s-4); align-items:center; justify-items:center;">
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Venues by price tier" style="width:200px; height:200px;">
    ${donutPaths}
    <text x="100" y="98" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="32" font-weight="700" fill="#f5f5f5">${total}</text>
    <text x="100" y="120" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#888" letter-spacing="2">VENUES</text>
  </svg>
  <ul style="list-style:none; padding:0; margin:0; display:grid; grid-template-columns:1fr; gap:8px; font-family:var(--font-mono); font-size:12px;">
    ${priceEntries.map(([tier, n]) => `<li style="display:flex; align-items:center; gap:10px;"><span style="display:inline-block; width:14px; height:14px; border-radius:3px; background:${priceColors[tier]};"></span> <strong class="u-text">${tier}</strong> <span class="u-muted">${n} venues · ${pct(n, priceTotal)}%</span></li>`).join('')}
  </ul>
</div>`;

  // Schema completeness gauges
  function gauge(label, n, total, color) {
    const p = pct(n, total);
    const dash = (p / 100) * 314.16;
    return `<div style="text-align:center;">
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="width:100px; height:100px;">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${dash} 314.16" transform="rotate(-90 60 60)"/>
        <text x="60" y="58" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="24" font-weight="700" fill="#f5f5f5">${p}%</text>
        <text x="60" y="76" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#888">${n}/${total}</text>
      </svg>
      <p style="font-family:var(--font-mono); font-size:11px; color:var(--muted); margin:8px 0 0; letter-spacing:0.06em; text-transform:uppercase;">${esc(label)}</p>
    </div>`;
  }

  return `
<h2>Top-line</h2>
<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:16px; margin:var(--s-5) 0;">
  <div style="background:rgba(255,46,126,0.08); border:1px solid rgba(255,46,126,0.25); border-radius:14px; padding:20px;"><div style="font-family:Space Grotesk, sans-serif; font-size:36px; font-weight:700; color:#ff2e7e;">${total}</div><div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:4px;">Venues hand-checked</div></div>
  <div style="background:rgba(78,224,255,0.08); border:1px solid rgba(78,224,255,0.25); border-radius:14px; padding:20px;"><div style="font-family:Space Grotesk, sans-serif; font-size:36px; font-weight:700; color:#4ee0ff;">${CATEGORIES.length}</div><div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:4px;">Sport categories</div></div>
  <div style="background:rgba(253,224,71,0.08); border:1px solid rgba(253,224,71,0.25); border-radius:14px; padding:20px;"><div style="font-family:Space Grotesk, sans-serif; font-size:36px; font-weight:700; color:#fde047;">${Object.keys(AREA_LABELS).length}</div><div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:4px;">Geographic areas</div></div>
  <div style="background:rgba(95,255,160,0.08); border:1px solid rgba(95,255,160,0.25); border-radius:14px; padding:20px;"><div style="font-family:Space Grotesk, sans-serif; font-size:36px; font-weight:700; color:#5fffa0;">0</div><div style="font-family:var(--font-mono); font-size:11px; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:4px;">Paid placements</div></div>
</div>

<h2>Venues by sport</h2>
<p>Every one of the 15 sport categories has at least one venue. Muay Thai dominates by count — Pattaya has one of the world's largest concentrations of authentic Muay Thai gyms, from Sityodtong-lineage traditional camps to Fairtex-style premium resorts.</p>
${catChartHTML}

<h2>Venues by neighborhood</h2>
<p>Six distinct Pattaya neighborhoods, each with its own training character. Click any area for a full neighborhood guide.</p>
${areaChartHTML}

<h2>Price tier distribution</h2>
<p>Pattaya covers every price band — from ฿100/day Tony's Gym to ฿฿฿฿ Royal Cliff Fitz Club. Strong middle-market: most venues sit at ฿฿ or ฿฿฿ tier.</p>
${donutHTML}

<h2>Verification freshness</h2>
<p>Every venue has a <strong>verified date</strong> — the last time we hand-checked hours, prices, and operating status. Target: re-verify the full directory every 30 days. Current breakdown:</p>
<ul style="font-family:var(--font-mono); font-size:14px;">
  <li><strong style="color:#5fffa0;">${fresh30}</strong> venues verified within 30 days <span class="u-muted">(${pct(fresh30, total)}% of directory)</span></li>
  <li><strong style="color:#fde047;">${fresh60}</strong> venues verified 30-60 days ago</li>
  <li><strong style="color:#ff3d3d;">${older}</strong> venues older than 60 days <span class="u-muted">(refresh queue)</span></li>
</ul>

<h2>Schema completeness</h2>
<p>Machine-readable completeness — how much of each venue's data is structured. Higher = better Google rich-result eligibility and easier AI search extraction.</p>
<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:24px; margin:var(--s-5) 0; justify-items:center;">
  ${gauge('Body content', detailCount, total, '#5fffa0')}
  ${gauge('Geo coordinates', geoCount, total, '#4ee0ff')}
  ${gauge('Phone number', phoneCount, total, '#fde047')}
  ${gauge('Website', websiteCount, total, '#ff2e7e')}
</div>

<h2>What's <em>not</em> here</h2>
<p>Pattaya.Gym focuses exclusively on training venues — gyms, camps, courts, courses, studios, dive operators, sport landmarks. We do <strong>not</strong> cover entertainment venues, restaurants, nightlife, or visa services. For those, see our sister sites:</p>
<ul>
</ul>

<h2>About these numbers</h2>
<p>This page is regenerated on every site build from <a href="/api/venues.json">live data</a>. The numbers update automatically — no manual edits. Machine-readable equivalent at <a href="/status.json">/status.json</a>. Full methodology at <a href="/methodology/">/methodology/</a>.</p>
`;
}

const UTILITY_PAGES = [
  {
    slug: 'about',
    title: 'About Pattaya.Gym — Independent, hand-checked directory',
    desc: 'Pattaya.Gym is the most complete directory of gyms, Muay Thai camps, and sport venues in Pattaya. Independent. Hand-checked. No paid placements.',
    eyebrow: 'About',
    headlineLead: 'Independent.',
    headlineAccent: 'One purpose',
    accentClass: 'accent-pink',
    lede: 'Pattaya.Gym is the most complete directory of gyms, Muay Thai camps, and sport venues in Pattaya, Thailand. Every venue is independently researched and source-cited. No paid placements. No fake reviews. No SEO spam.',
    showContactCard: true,
    bodyHtml: `
<h2>Why this site exists</h2>
<p>Most directories you find for Pattaya gyms are scraped, paid-for, or both. Search results are dominated by sites that have never set foot in any of the venues they rank.</p>
<p>Pattaya.Gym is the opposite. Every venue is researched from public sources, official channels, and on-the-ground local knowledge. We cross-check hours, phone numbers, and locations against each venue's own listings wherever they are published — and where a detail cannot be confirmed yet, we flag it for follow-up rather than guessing. When a venue closes or changes hands, the page is updated as soon as we hear about it.</p>

<h2>How venues are ranked</h2>
<p>No money changes hands. Ranking is based on consistent quality, current operation, breadth of facility, instructor caliber, and community reputation. Gyms with closed doors or stale information get demoted automatically.</p>

<h2>What we operate</h2>
<p>Pattaya.Gym is part of the independent TimPaemi network of Pattaya publications operated by <strong>TimPaemi Co., Ltd.</strong>.. The agency funds the directories. The directories don't take money from listed venues. That's how the independence stays real.</p>

<h2>Who runs this</h2>
<p><img src="/authors/timpaemi.jpg" alt="Tim and Paemi, founders and editors of Pattaya.Gym" width="120" height="120" loading="lazy" style="float:right; border-radius:12px; margin:0 0 12px 16px;"></p>
<p>Pattaya.Gym is published by <strong>TimPaemi Co., Ltd.</strong> and written by two people: Tim and Paemi. The company funds the site; the two of us do the research and the writing. It is self-funded and has no commercial relationship with any listed venue.</p>

<h3 id="tim">Tim — founder and editor</h3>
<p>A long-time Pattaya resident. Tim researches and writes the venue records and the guides, works the sources for prices and opening hours, and decides what goes on a page and what gets flagged as unconfirmed. Reachable at <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a>.</p>

<h3 id="paemi">Paemi — co-founder and editor</h3>
<p>Co-founder of TimPaemi Co., Ltd., also based in Pattaya. Paemi works on venue research and Thai-language sourcing — the operator pages, Thai social posts and local listings that an English-only search never reaches.</p>

<p>Everything across the network carries the TimPaemi byline; <a href="https://timpaemi.com/" rel="author noopener">timpaemi.com</a> is the identity behind every site.</p>

<h2>Editorial policy</h2>
<ul>
<li>If a venue closes, gets new ownership, or changes hours, the page is updated as soon as we hear about it.</li>
<li>If a venue refuses to respond to verification requests over 30 days, it gets marked stale and ranking-suppressed.</li>
<li>No sponsored placements. No affiliate links to listed venues. No commission on bookings.</li>
<li>Editorial reviews and rankings reflect merit, not budget.</li>
</ul>
`
  },
  {
    slug: 'contact',
    title: 'Contact Pattaya.Gym — Email, WhatsApp, LINE',
    desc: 'Three ways to reach Pattaya.Gym. Email info@pattaya-gym.com,, or LINE @timpaemi. We reply to every message personally.',
    eyebrow: 'Contact',
    headlineLead: 'Reach us',
    headlineAccent: 'direct',
    accentClass: 'accent-mint',
    lede: 'Three ways to reach us. We reply to every message personally, usually within 24h. No bots. No auto-responders. Real humans in Pattaya.',
    showContactCard: true,
    bodyHtml: `
<h2>What we can help with</h2>
<ul>
<li>Recommending the right gym for your level, sport, and budget</li>
<li>Verifying current hours, pricing, or coach roster at any listed venue</li>
<li>Adding your gym, camp, or sport venue to the directory — free, no fees</li>
<li>Correcting outdated information on any venue page</li>
<li>Press, partnership, or media inquiries</li>
</ul>

<h2>What we won't do</h2>
<p>We don't book classes for you, take payment, or operate as an intermediary. You contact the gym directly — we just help you find the right one. No commission on bookings. No affiliate kickbacks.</p>

<h2>Response times</h2>
<ul>
<li><strong>WhatsApp:</strong> fastest — usually within 1–4h during Pattaya daytime hours (GMT+7)</li>
<li><strong>LINE:</strong> daily check, typically same-day reply</li>
<li><strong>Email:</strong> within 24h, often much faster</li>
</ul>

<h2>Where we are</h2>
<p>Operated from our villa in Pattaya City, Bang Lamung District, Chonburi 20150, Thailand. Coordinates 12.92°N, 100.87°E.</p>
`
  },
  {
    slug: 'methodology',
    title: 'Methodology — How Pattaya.Gym verifies venues',
    desc: 'The full research methodology behind Pattaya.Gym. How venues are sourced, verified, ranked, and updated. No paid placements. No scraping.',
    eyebrow: 'Methodology',
    headlineLead: 'How we',
    headlineAccent: 'verify',
    accentClass: 'accent-cyan',
    lede: 'The full research methodology behind every entry. How venues are sourced, verified, ranked, and kept current. Transparency over polish.',
    showContactCard: false,
    bodyHtml: `
<h2>Sourcing</h2>
<p>We source venues from a mix of local knowledge, on-foot exploration, community recommendations, and English/Thai search. Every entry traces back to at least one of:</p>
<ul>
<li>Direct visit by us or a trusted local</li>
<li>Verified primary source (the venue's own website or social, dated within 12 months)</li>
<li>Community recommendation from a long-term Pattaya resident</li>
</ul>
<p>We do <strong>not</strong> scrape Google Maps, TripAdvisor, or other directories without verification.</p>

<h2>Verification</h2>
<p>Each venue is checked for:</p>
<ul>
<li><strong>Is it open?</strong> — phone or in-person confirmation</li>
<li><strong>Stated hours match reality</strong> — cross-checked with current customers when possible</li>
<li><strong>Price tier accurate</strong> — entry-level pricing confirmed via published rate or direct quote</li>
<li><strong>Category appropriate</strong> — venue actually does the sport it claims</li>
<li><strong>Quality of facility</strong> — equipment, cleanliness, instructor presence</li>
</ul>

<h2>Ranking</h2>
<p>Within a category, venues rank by composite score: facility depth, instructor caliber, customer feedback signal, longevity, breadth of programs offered, and operational reliability (how often doors are open as advertised). No paid weighting.</p>

<h2>Updates</h2>
<p>A verified date appears on every venue page. Re-verification is rolling rather than rigid: priority queue first (popular venues, recent reports, venues that have moved or changed format), background queue second. When we hear of a closure or major change we re-check and update as fast as we reasonably can — typically within days, never longer than a couple of weeks. If we can't reach a venue across 30 days of attempts, it's marked stale and ranking-suppressed. Public reports of errors or closures can be sent to <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a>.</p>

<h2>Removals</h2>
<p>Venues are removed when:</p>
<ul>
<li>Permanent closure confirmed</li>
<li>Operations relocated outside Pattaya / Eastern Seaboard</li>
<li>Owner explicitly requests removal in writing</li>
</ul>
`
  },
  {
    slug: 'press',
    title: 'Press — Pattaya.Gym media kit and contact',
    desc: 'Press, media, and partnership inquiries for Pattaya.Gym and the TimPaemi Co. agency network.',
    eyebrow: 'Press',
    headlineLead: 'Press &',
    headlineAccent: 'media',
    accentClass: 'accent-yellow',
    lede: 'Press, media, and partnership inquiries for Pattaya.Gym and the broader TimPaemi Co. agency network.',
    showContactCard: true,
    bodyHtml: `
<h2>The agency</h2>
<p>Pattaya.Gym is one of four projects operated by <strong>TimPaemi Co., Ltd.</strong>, a Pattaya-based agency focused on long-term local market positioning.</p>

<h2>Sister projects</h2>
<ul>
<li><strong>Pattaya.Gym</strong> (this site) — fitness directory. Every gym, every camp, every court in Pattaya.</li>
</ul>

<h2>Reach</h2>
<ul>
<li>5M+ combined social followers across the agency network</li>
<li>500M+ total platform views across YouTube, TikTok, Instagram, Facebook</li>
<li>60+ social media accounts under cross-platform automation</li>
<li>Live streams 6–8 hours per night from our Pattaya villa</li>
</ul>

<h2>Press inquiries</h2>
<p>For interviews, partnership briefings, agency-level engagements, or media access — email <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a> with subject line beginning "Press:" and we'll route appropriately within 24h.</p>
`
  },
  {
    slug: 'add-your-gym',
    title: 'Add your gym to Pattaya.Gym — free listing',
    desc: 'Get your gym, camp, or sport venue listed on Pattaya.Gym. Free. No fees. No commission. Send us the details and we verify.',
    eyebrow: 'Add your gym',
    headlineLead: 'List your',
    headlineAccent: 'venue',
    accentClass: 'accent-pink',
    lede: 'Get your gym, camp, or sport venue added to Pattaya.Gym. Free. No fees. No commission. Send us the details — we verify and publish.',
    showContactCard: true,
    bodyHtml: `
<h2>What we need from you</h2>
<ul>
<li><strong>Venue name</strong> — exactly as you want it displayed</li>
<li><strong>Category</strong> — what sport(s) you cover</li>
<li><strong>Address</strong> — full street address + Google Maps link if possible</li>
<li><strong>Hours</strong> — current operating schedule, weekday and weekend</li>
<li><strong>Price range</strong> — drop-in fee, weekly pass, monthly membership</li>
<li><strong>Contact</strong> — phone, email, website, social media handles</li>
<li><strong>1-3 sentence description</strong> — what makes you different</li>
</ul>

<h2>What happens next</h2>
<ol>
<li>We verify the venue exists, hours are accurate, and contact info works</li>
<li>We visit or call to confirm — typically within a few days, never longer than two weeks</li>
<li>We write a neutral entry based on our verification, not your marketing copy</li>
<li>The page goes live with a "verified" date</li>
<li>We re-verify every 90 days going forward</li>
</ol>

<h2>What we charge</h2>
<p><strong>Nothing.</strong> Listings are free. We do not accept money for placement, ranking, or featured status. The agency network funds the directory, not the venues.</p>

<h2>What we won't do</h2>
<ul>
<li>Publish marketing copy verbatim — we write neutral entries</li>
<li>Boost ranking for payment — ranking reflects merit only</li>
<li>Hide negative info — if something's outdated, broken, or sketchy, we say so</li>
<li>Cross-promote unrelated businesses</li>
</ul>

<p class="u-mt-6"><strong>Send the details to <a href="mailto:info@pattaya-gym.com?subject=Add%20my%20gym">info@pattaya-gym.com</a></strong> or WhatsApp  with "Add my gym" in the message.</p>
`
  },
  {
    slug: 'colophon',
    title: 'Colophon — How Pattaya.Gym is built',
    desc: 'The technical setup behind Pattaya.Gym. Static HTML, Node.js build, Cloudflare Pages. Built in-house by the founders of TimPaemi.',
    eyebrow: 'Colophon',
    headlineLead: 'How this',
    headlineAccent: 'is built',
    accentClass: 'accent-mint',
    lede: 'The technical and editorial setup behind Pattaya.Gym. No frameworks, no CMS, no bloat. Just markdown content rendered by a small Node.js build script.',
    showContactCard: false,
    bodyHtml: `
<h2>Stack</h2>
<ul>
<li><strong>Content:</strong> Markdown files with YAML frontmatter, one per venue</li>
<li><strong>Build:</strong> Node.js script (no dependencies) that reads markdown and emits static HTML</li>
<li><strong>Styling:</strong> Single CSS file with native CSS custom properties — no frameworks</li>
<li><strong>Hosting:</strong> Cloudflare Pages, deployed automatically from GitHub on every push</li>
<li><strong>Domain:</strong> pattaya-gym.com — registered direct, DNS via Cloudflare</li>
<li><strong>Analytics:</strong> Google Analytics 4 — aggregate traffic measurement only, no advertising features, no demographic/Signals profiles, shortest available retention; see <a href="/privacy/">/privacy/</a> for full cookie and localStorage details</li>
</ul>

<h2>Typography</h2>
<ul>
<li><strong>Display:</strong> Space Grotesk — for headlines and brand</li>
<li><strong>Body:</strong> Inter — for paragraphs and UI</li>
<li><strong>Mono:</strong> JetBrains Mono — for labels, marquees, and metadata</li>
</ul>

<h2>Colors</h2>
<p>Pure black background. Five accent colors: hot pink, cyan, yellow, mint, red. White for primary text, muted grays for hierarchy. No gradients except the multi-color brand identity.</p>

<h2>Performance</h2>
<ul>
<li>Static HTML files — no server-side rendering, no database queries</li>
<li>One CSS file, one font request, zero blocking JavaScript</li>
<li>Cloudflare CDN — global edge caching</li>
<li>Sub-2-second LCP on mobile 4G in most regions</li>
</ul>

<h2>Open source</h2>
<p>The site source lives on GitHub. The content (venue markdown) is curated by us and not currently open. The build script is small and could be adapted — get in touch if you're building something similar.</p>

<h2>Built by</h2>
<p>Site engineered, operated, and maintained in-house by the founders of TimPaemi Co., Ltd. — Pattaya, Thailand.</p>
`
  },
  {
    slug: 'pattaya-sport-stats',
    title: `Pattaya sport stats — ${VENUE_N} venues across 15 sports`,
    desc: `The numbers behind Pattaya as a training destination. ${VENUE_N} hand-checked venues, 15 sports, 6 areas. Verified on a rolling schedule.`,
    eyebrow: 'Stats',
    headlineLead: 'Pattaya',
    headlineAccent: 'by the numbers',
    accentClass: 'accent-yellow',
    lede: `The training landscape of Pattaya in numbers. ${VENUE_N} hand-checked venues across 15 sports and 6 distinct areas. One of the world's deepest single-city Muay Thai scenes.`,
    showContactCard: false,
    bodyHtml: buildSportStatsBody()
  },
  {
    // Round 17 — Codex F20.1 fix. GA + localStorage + AI crawlers are live but no
    // privacy disclosure existed. This page documents what we collect, how long
    // we keep it, and how EU/UK/Thai readers can exercise their rights.
    slug: 'privacy',
    title: 'Privacy policy — Pattaya.Gym',
    desc: 'How Pattaya.Gym handles visitor data: Google Analytics, localStorage, AI crawler access, and your GDPR/PDPA rights. Independent, no advertising, no resale.',
    eyebrow: 'Privacy',
    headlineLead: 'Your data,',
    headlineAccent: 'plain English',
    accentClass: 'accent-mint',
    lede: 'Pattaya.Gym is an independent directory. We sell no ads, we share no profiles, and we keep our data collection minimal. Here is exactly what happens when you visit.',
    showContactCard: false,
    bodyHtml: `
<p><strong>Last updated:</strong> 2026-05-18. <strong>Operator:</strong> TimPaemi Co., Ltd., Pattaya City, Thailand. <strong>Contact:</strong> <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a>.</p>

<h2>What we collect, in plain English</h2>
<p>We collect three classes of data and nothing else:</p>
<ol>
<li><strong>Aggregate analytics (Google Analytics 4).</strong> Page views, device class, country-level location, and referrer. We use this to see which guides and venues people actually read so we can write more of what helps. We do not enable Google Signals, advertising features, demographic profiles, or cross-site identity stitching. GA4 retention is set to the shortest available window (2 months for event data, 14 months for user data).</li>
<li><strong>Browser localStorage on venue pages.</strong> A small list of the last 8 venues you opened, stored only in your browser, so we can show a "Recently viewed" strip on venue pages. The key is <code>pattaya-gym:recently-viewed</code>. This never leaves your device and we cannot read it from the server.</li>
<li><strong>URL parameters on /compare/.</strong> When you compare venues, the picks are encoded in the URL itself (<code>?a=&amp;b=&amp;c=&amp;d=</code>) so the comparison is bookmarkable and shareable. The URL is the data; we store nothing about your comparison server-side.</li>
</ol>

<h2>What we do not do</h2>
<ul>
<li>No first-party login. No user accounts. No password storage.</li>
<li>No advertising of any kind. No retargeting pixels. No affiliate trackers. We have never been paid to feature, rank, or hide any venue.</li>
<li>No cross-site tracking. No fingerprinting. No data brokers. We do not sell, rent, or trade visitor data — there is nothing to sell.</li>
<li>No newsletter or marketing email collection on the site itself.</li>
</ul>

<h2>Cookies</h2>
<p>The only cookies set on this domain are the Google Analytics 4 cookies (<code>_ga</code>, <code>_ga_*</code>). They identify a browser anonymously for analytics counting. They are not used for advertising. You can block them with any ad blocker, with browser tracking-protection settings, or with the global privacy control. The site works completely without analytics enabled.</p>

<h2>AI and LLM crawler policy</h2>
<p>Our <a href="/robots.txt">robots.txt</a> explicitly allows the major AI/LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, Bytespider, cohere-ai, Diffbot, Amazonbot, and others) to retrieve our content for training and live retrieval. This is a deliberate editorial choice: a public, accurate Pattaya directory is more useful inside AI tools than locked away from them. We do not provide any private user data to these crawlers — only the same HTML pages a human browser sees.</p>

<h2>Third parties</h2>
<ul>
<li><strong>Cloudflare Pages</strong> hosts the site. Cloudflare receives a request log per page view (IP, user agent, URL) for routing and DDoS protection. Logs are managed under <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare's privacy policy</a>.</li>
<li><strong>Google Analytics 4</strong> processes the analytics events described above under <a href="https://policies.google.com/privacy">Google's privacy policy</a>.</li>
<li><strong>Fonts</strong> are self-hosted from <code>/fonts/</code> on our own domain (Round 18). No third-party font CDN is contacted on page load.</li>
</ul>
<p>No other third-party services are loaded on the site.</p>

<h2>Who publishes this site</h2>
<p>Pattaya.Gym is one of several independent publications operated by <strong>TimPaemi Co., Ltd.</strong>. Each runs on the same independence and editorial standards. Each site has its own privacy policy.</p>

<h2>Your rights — GDPR (EU/UK) and PDPA (Thailand)</h2>
<p>If you are in the EU, UK, or Thailand (or anywhere with similar legislation), you have the right to: request access to whatever data we hold on you (which is functionally nothing beyond aggregate GA counts you cannot be re-identified from), request deletion, request correction, withdraw consent, and lodge a complaint with your national data-protection authority. Email <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a> and we will respond within 30 days. Because we do not run accounts, most requests are satisfied simply by you clearing your browser data — but we will confirm in writing if you ask.</p>

<h2>Children</h2>
<p>This is a general-interest sport directory. We do not knowingly collect data from anyone under 13.</p>

<h2>Changes</h2>
<p>Material changes to this policy will be announced in the <a href="/changelog/">site changelog</a>. The "last updated" date above always reflects the most recent revision.</p>
`
  },
  {
    // FOOTER-SPEC-2026: Terms page — linked from the footer LEGAL column and legal line.
    slug: 'terms',
    title: 'Terms of use — Pattaya.Gym',
    desc: 'The terms of use for Pattaya.Gym: what the directory is, how the information is verified, what we are responsible for, and what we are not.',
    eyebrow: 'Terms',
    headlineLead: 'Terms of',
    headlineAccent: 'use',
    accentClass: 'accent-cyan',
    lede: 'Pattaya.Gym is a free, independent directory. These terms explain what you can expect from the information here — and where our responsibility ends.',
    showContactCard: false,
    bodyHtml: `
<p><strong>Last updated:</strong> 2026-07-21. <strong>Operator:</strong> TimPaemi Co., Ltd., Pattaya City, Thailand. <strong>Contact:</strong> <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a>.</p>

<h2>What this site is</h2>
<p>Pattaya.Gym is an editorial directory of sport and fitness venues in Pattaya, Thailand, published by TimPaemi Co., Ltd. Access is free. No account is required, and no listing is paid for.</p>

<h2>Accuracy of information</h2>
<p>Venue details — opening hours, prices, contact details, locations — are checked by hand on a rolling schedule, but venues change without telling us. Always confirm critical details (prices, schedules, class times) directly with the venue before travelling or paying. Information on this site is provided in good faith, "as is", without warranty of any kind.</p>

<h2>No professional advice</h2>
<p>Nothing on this site is medical, legal, or financial advice. Training carries inherent risk; consult a professional where appropriate.</p>

<h2>Intellectual property</h2>
<p>Text, photographs, and data compilations on this site are the property of TimPaemi Co., Ltd. unless otherwise credited. You may quote with attribution and a link. Wholesale republication requires written permission.</p>

<h2>External links</h2>
<p>We link to venue websites, social profiles, and map services. We are not responsible for the content or practices of external sites.</p>

<h2>Liability</h2>
<p>To the maximum extent permitted by law, TimPaemi Co., Ltd. is not liable for any loss or damage arising from use of this site or reliance on its content.</p>

<h2>Changes</h2>
<p>These terms may be updated; the date above reflects the latest revision. Material changes are announced in the <a href="/changelog/">changelog</a>. Questions: <a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a>.</p>
`
  },
  {
    slug: '404',
    title: 'Page not found — Pattaya.Gym',
    desc: `That page doesn't exist on Pattaya.Gym. Browse ${VENUE_N} venues, 15 sports, or use search.`,
    eyebrow: '404',
    headlineLead: 'Page',
    headlineAccent: 'not found',
    accentClass: 'accent-pink',
    lede: 'That URL doesn\'t exist on Pattaya.Gym. It may have moved, or you may have followed a stale link. Search the directory or jump to a popular section below.',
    showContactCard: false,
    bodyHtml: `
<form class="search-404-form" action="/search/" method="get" role="search">
  <label for="q404" class="sr-only">Search ${VENUE_N} Pattaya venues</label>
  <input type="search" id="q404" name="q" class="search-input" placeholder="Search ${VENUE_N} venues by name, sport, area…" autocomplete="off">
  <button type="submit" class="btn btn-primary">▶ Search</button>
</form>
<div class="tool-empty-actions u-mt-6">
  <a href="/" class="btn btn-secondary">Home</a>
  <a href="/favorites/" class="btn btn-ghost">♡ Favorites</a>
  <a href="/compare/" class="btn btn-ghost">Compare</a>
</div>
<div class="eyebrow u-mt-8"><span class="num">★</span> Popular</div>
<div class="numlist u-mt-4">
  <a href="/category/muay-thai/" class="numcard u-plain-link"><div class="numcard-head"><span class="numcard-num">01</span><h3 class="numcard-title">// Muay Thai</h3></div><p class="numcard-body">Every camp in Pattaya — hand-checked.</p></a>
  <a href="/category/fitness/" class="numcard u-plain-link"><div class="numcard-head"><span class="numcard-num">02</span><h3 class="numcard-title">// Fitness</h3></div><p class="numcard-body">Gyms, hotel fitness, 24-hour options.</p></a>
  <a href="/area/jomtien/" class="numcard u-plain-link"><div class="numcard-head"><span class="numcard-num">03</span><h3 class="numcard-title">// Jomtien</h3></div><p class="numcard-body">Beachfront neighborhood venues.</p></a>
  <a href="/guides/" class="numcard u-plain-link"><div class="numcard-head"><span class="numcard-num">04</span><h3 class="numcard-title">// Guides</h3></div><p class="numcard-body">Ranked lists and trip planners.</p></a>
</div>
<p class="u-mt-6"><a href="/contact/">Wrong link? Tell us →</a></p>
`
  }
];

// ---------- All-sports hub (Round 21 - Codex P1-5: de-orphan BJJ + every category) ----------
function sportsHubPage() {
  const url = `${SITE}/sports/`;
  const title = `Pattaya Gyms & Sport — ${VENUE_N} Venues, 15 Categories | Pattaya.Gym`;
  const desc = truncateDesc(`Browse every Pattaya gym and sport venue: Muay Thai camps, fitness chains, golf, yoga, BJJ, diving, climbing and more. ${VENUE_N} hand-checked listings — filter by area, price or sport.`);
  const cards = CATEGORIES.map(c => {
    const n = GYMS.filter(g => g.category === c.key).length;
    return `<a href="/category/${c.key}/" class="numcard u-plain-link">
        <div class="numcard-head"><span class="numcard-num">${String(n).padStart(2,'0')}</span><h3 class="numcard-title">// ${esc(c.label)}</h3></div>
        <p class="numcard-body">${n} ${n === 1 ? 'venue' : 'venues'} in Pattaya. Hand-checked, no paid placements.</p>
      </a>`;
  }).join('\n      ');
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Sport categories in Pattaya', numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/category/${c.key}/`, name: c.label }))
  };
  const crumbsLd = { '@context': 'https://schema.org', ...breadcrumbJsonLd([{ label: 'Home', href: '/' }, { label: 'All sports' }], url) };
  return head({ title, desc, url, jsonLd: [itemList, crumbsLd] , modified: SITE_MODIFIED })
    + nav()
    + breadcrumb([{ label: 'Home', href: '/' }, { label: 'All sports' }])
    + `
<main id="main">

<section class="hero hub-hero hub-hero--category" style="text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Every sport &middot; 15 categories &middot; ${VENUE_N} venues</div>
    <h1 class="hero-h1">Pattaya <span class="accent-cyan">gyms &amp; sport.</span></h1>
    <p class="hero-lede u-text-left-ml0">Every gym, Muay Thai camp, and sport venue in Pattaya — ${VENUE_N} hand-checked listings across 15 categories. From budget fitness on Soi Buakhao to resort golf east of the city.</p>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> 15 categories</div>
    <h2 class="h-section">Browse by <span class="accent-pink">sport.</span></h2>
    <div class="numlist">${cards}</div>
  </div>
</section>

</main>
`
    + paNetwork()
    + footer();
}

// ---------- Sitemap ----------
function generateSitemap() {
  // Round 17 fix (Codex F07.1): GUIDE_SLUGS is now derived from disk so the
  // sitemap can never advertise URLs that don't exist locally.
  const guidesDir = path.join(__dirname, 'guides');
  const GUIDE_SLUGS = fs.readdirSync(guidesDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(guidesDir, e.name, 'index.html')))
    .map(e => e.name)
    .sort();
  const TOOL_SLUGS = ['compare','plan-my-trip'];
  const UTILITY_EXTRA = ['sports','add-your-gym','colophon','press','pattaya-sport-stats','changelog','privacy','terms'];
  const urls = [
    `${SITE}/`,
    `${SITE}/about/`,
    `${SITE}/contact/`,
    `${SITE}/methodology/`,
    `${SITE}/guides/`,
    `${SITE}/search/`,
    ...UTILITY_EXTRA.map(s => `${SITE}/${s}/`),
    ...TOOL_SLUGS.map(s => `${SITE}/${s}/`),
    ...GUIDE_SLUGS.map(s => `${SITE}/guides/${s}/`),
    ...CATEGORIES.map(c => `${SITE}/category/${c.key}/`),
    ...Object.keys(AREA_MAP).map(a => `${SITE}/area/${a}/`),
    ...GYMS.map(g => `${SITE}/gyms/${g.id}/`)
  ];
  // Combined category-area URLs (one per non-empty pairing) — long-tail surface
  for (const slug of Object.keys(AREA_MAP)) {
    for (const cat of CATEGORIES) {
      const has = GYMS.some(g => areaSlugFor(g.area) === slug && g.category === cat.key);
      if (has) urls.push(`${SITE}/area/${slug}/${cat.key}/`);
    }
  }
  // Sitemap priority + changefreq per URL pattern (Codex V3 P2-3 polish)
  function priorityFor(u) {
    if (u === `${SITE}/`) return '1.0';
    if (u.startsWith(`${SITE}/category/`) || u.startsWith(`${SITE}/area/`)) {
      // Combined area+category landing pages are highest-leverage long-tail surface
      if (u.split('/').filter(Boolean).length >= 5) return '0.85';
      return '0.9';
    }
    if (u.startsWith(`${SITE}/guides/`) && u.length > `${SITE}/guides/`.length + 1) return '0.8';
    if (u.startsWith(`${SITE}/gyms/`)) return '0.7';
    if (u === `${SITE}/search/` || u === `${SITE}/guides/`) return '0.7';
    if (u === `${SITE}/compare/` || u === `${SITE}/plan-my-trip/`) return '0.75';
    return '0.5';
  }
  function changefreqFor(u) {
    if (u === `${SITE}/`) return 'daily';
    if (u.startsWith(`${SITE}/category/`) || u.startsWith(`${SITE}/area/`)) return 'weekly';
    if (u.startsWith(`${SITE}/gyms/`)) return 'weekly';
    if (u.startsWith(`${SITE}/guides/`)) return 'monthly';
    return 'monthly';
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod><changefreq>${changefreqFor(u)}</changefreq><priority>${priorityFor(u)}</priority></url>`).join('\n')}
</urlset>`;
  writeFile(path.join(ROOT, 'sitemap.xml'), xml);
}

// ---------- Main ----------
function main() {
  syncCssFontVersion();
  const stats = { venues: 0, categories: 0, areas: 0, skipped: 0 };

  // Venue pages
  for (const g of GYMS) {
    let fm = {};
    let body = '';
    if (g.detailFile) {
      const mdPath = path.join(ROOT, g.detailFile);
      if (fs.existsSync(mdPath)) {
        const text = fs.readFileSync(mdPath, 'utf8');
        const parsed = parseFrontmatter(text);
        fm = parsed.fm;
        body = parsed.body;
      }
    }
    const html = venuePage(g, fm, body);
    writeFile(path.join(ROOT, 'gyms', g.id, 'index.html'), html);
    stats.venues++;
  }

  // Category pages
  for (const cat of CATEGORIES) {
    const venues = GYMS.filter(g => g.category === cat.key);
    const html = categoryPage(cat, venues);
    writeFile(path.join(ROOT, 'category', cat.key, 'index.html'), html);
    stats.categories++;
  }

  // Area pages
  for (const slug of Object.keys(AREA_MAP)) {
    const venues = GYMS.filter(g => areaSlugFor(g.area) === slug);
    const html = areaPage(slug, AREA_LABELS[slug], venues);
    writeFile(path.join(ROOT, 'area', slug, 'index.html'), html);
    stats.areas++;
  }

  // Combined category-area landing pages — long-tail SEO targets
  // URL: /area/<area-slug>/<category-key>/
  // Only generate when venues exist; otherwise skip (avoid thin empty pages)
  let categoryAreaCount = 0;
  for (const slug of Object.keys(AREA_MAP)) {
    for (const cat of CATEGORIES) {
      const venues = GYMS.filter(g => areaSlugFor(g.area) === slug && g.category === cat.key);
      if (venues.length === 0) continue; // skip empty combos
      const html = categoryAreaPage(slug, AREA_LABELS[slug], cat, venues);
      writeFile(path.join(ROOT, 'area', slug, cat.key, 'index.html'), html);
      categoryAreaCount++;
    }
  }
  stats.categoryArea = categoryAreaCount;

  // Utility pages (about, contact, methodology, press, add-your-gym, colophon, stats, 404)
  let utilCount = 0;
  for (const pg of UTILITY_PAGES) {
    const html = utilityPage(pg);
    if (pg.slug === '404') {
      writeFile(path.join(ROOT, '404.html'), html);
    } else {
      writeFile(path.join(ROOT, pg.slug, 'index.html'), html);
    }
    utilCount++;
  }
  stats.utility = utilCount;

  // All-sports hub (Round 21 - Codex P1-5)
  writeFile(path.join(ROOT, 'sports', 'index.html'), sportsHubPage());

  // Sitemap
  generateSitemap();

  console.log(`✓ Built ${stats.venues} venues · ${stats.categories} categories · ${stats.areas} areas · ${stats.categoryArea} category-area · ${stats.utility} info pages`);
  // Sitemap count comes from generateSitemap() — accurate without manual addition

}

main();

