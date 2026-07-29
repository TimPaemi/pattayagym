#!/usr/bin/env node
'use strict';
/**
 * verify-regressions.js — one gate per defect repaired after the 2026-07 audit.
 *
 * Every check here exists because something shipped broken and no gate saw it.
 * Each one asserts the repaired state directly on the built corpus, so the
 * defect cannot come back quietly. If a check fails, the message says what
 * regressed and where.
 *
 * Run: node scripts/verify-regressions.js   (listed in scripts/ship-chain.json)
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';

const failures = [];
const passes = [];
function check(name, fn) {
  try {
    const detail = fn();
    passes.push(`${name} — ${detail}`);
  } catch (e) {
    failures.push(`${name}\n      ${String(e.message).split('\n').join('\n      ')}`);
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

const SKIP = new Set(['.git', 'node_modules', '.internal-docs', '.backups', 'packages',
  '.wrangler', '.cursor', '.github', 'dist', 'tmp', 'private', 'research', 'docs']);
function walkHtml(dir = ROOT, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(f, out);
    else if (/\.html$/i.test(e.name)) out.push(f);
  }
  return out;
}
const rel = f => path.relative(ROOT, f).replace(/\\/g, '/');
const urlFor = f => {
  const r = rel(f);
  if (r === 'index.html') return `${SITE}/`;
  return r.endsWith('/index.html') ? `${SITE}/${r.slice(0, -'index.html'.length)}` : `${SITE}/${r}`;
};
const HTML = walkHtml();
const { GYMS } = require('../data.js');

/* ------------------------------------------------------------------ S1-1 --- *
 * A prohibited sister domain shipped inside the author `sameAs` on 344 of 355
 * pages, twice per page, including the live homepage - and the network gate
 * reported "0 sister-site links" throughout, because it only ever looked inside
 * href=. Two assertions: the built corpus is clean, and the source constant
 * that produced it is clean (the gate skips scripts/, so it cannot see that).  */
const SISTER = ['pattaya-authority.com', 'pattaya-school-guide.com', 'pattaya-restaurant-guide.com',
  'pattayavisahelp.com', 'pattaya-afterdark.com', 'pattaya-coffee.com', 'pattayastream.com',
  'pattaya-medical.com', 'pattayapets.com', 'pattaya-vehicle-rentals.com', 'pattaya-insider.com',
  'timpaemi.live', 'pattaya-golf.com', 'retire-in-pattaya.com', 'movetopattaya.com',
  'pattayatools.pages.dev', 'koh-larn-thailand.com', 'mrweoutside.com', 'pattayaolympian.com',
  'pattayapersonaltrainer.com'];

check('S1-1  no sister domain anywhere in shipped JSON-LD', () => {
  const bad = [];
  let blocks = 0;
  for (const f of HTML) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      blocks++;
      const hit = SISTER.find(d => m[1].toLowerCase().includes(d));
      if (hit) bad.push(`${rel(f)} -> ${hit}`);
    }
  }
  assert(!bad.length, `${bad.length} JSON-LD block(s) reference a sister site:\n${bad.slice(0, 8).join('\n')}`);
  return `${blocks} blocks across ${HTML.length} pages, 0 references`;
});

check('S1-1  author sameAs source carries no sister domain', () => {
  const { personTim, personPaemi } = require('./lib/timpaemi-author.js');
  for (const p of [personTim(), personPaemi()]) {
    for (const u of [].concat(p.sameAs || [])) {
      const hit = SISTER.find(d => u.toLowerCase().includes(d));
      assert(!hit, `scripts/lib/timpaemi-author.js puts ${hit} in ${p.name}'s sameAs. The comment above NETWORK_SAMEAS forbids exactly this.`);
    }
  }
  return `Tim and Paemi sameAs are social profiles + own domain only`;
});

check('S1-1  network gate can actually see a sameAs leak', () => {
  /* Guards the gate itself: the bug was a gate that passed while the site was
     broken, so assert it inspects more than href=. */
  const gate = fs.readFileSync(path.join(ROOT, 'scripts/check-no-network-links.js'), 'utf8');
  assert(/referenceText|application\/ld\+json|<script/.test(gate),
    'check-no-network-links.js no longer inspects script/JSON-LD content — it is back to being href-only and blind to the leak that caused this.');
  return 'gate inspects attributes and script bodies, not only href=';
});

/* ------------------------------------------------------------------ S1-3 --- *
 * Six records carried a status in their Markdown that never reached data.js, so
 * the generator treated non-operating venues as operating.                     */
check('S1-3  every venue status matches its source record', () => {
  const bad = [];
  for (const g of GYMS) {
    const md = fs.readFileSync(path.join(ROOT, g.detailFile), 'utf8');
    const m = md.match(/^status:\s*(.+)$/mi);
    const src = m ? m[1].trim().toLowerCase() : '';
    const data = String(g.status || '').trim().toLowerCase();
    if (src !== data) bad.push(`${g.id}: ${g.detailFile}="${src || '(none)'}" but data.js="${data || '(none)'}"`);
  }
  assert(!bad.length, `${bad.length} record(s) disagree with their Markdown:\n${bad.join('\n')}`);
  return `${GYMS.length} records, 0 mismatches`;
});

const UNRESOLVED = new Set(['closed', 'likely-closed', 'unverified', 'out-of-area', 'not-in-pattaya', 'informational']);

check('S1-3  a qualified record never renders as plainly operating', () => {
  const bad = [];
  for (const g of GYMS) {
    const st = String(g.status || '').toLowerCase();
    if (!st) continue;
    const p = path.join(ROOT, 'gyms', g.id, 'index.html');
    if (!fs.existsSync(p)) continue;
    const s = fs.readFileSync(p, 'utf8');
    if (!/trust-pill (?:is-status-flag|is-permanently-closed)/.test(s)) bad.push(`${g.id} (${st}): no visible status flag`);
    if (UNRESOLVED.has(st)) {
      if (/"@type":"FAQPage"/.test(s)) bad.push(`${g.id} (${st}): templated FAQ on a venue we cannot describe`);
      if (/trust-pill is-open-status/.test(s)) bad.push(`${g.id} (${st}): live open/closed pill asserts hours we do not stand behind`);
      if (/100% Hand-checked/.test(s)) bad.push(`${g.id} (${st}): claims "100% Hand-checked" beside an unresolved status`);
    }
  }
  assert(!bad.length, `${bad.length} problem(s):\n${bad.slice(0, 12).join('\n')}`);
  const n = GYMS.filter(g => g.status).length;
  return `${n} qualified records all show their status`;
});

/* ------------------------------------------------------------------ S1-4 --- *
 * dateModified was the venue verification date on all 215 venue pages, and the
 * newest verification date on the site everywhere else. Google is explicit that
 * a date must describe the page changing, not the action the page describes.   */
const LEDGER = (() => {
  const p = path.join(ROOT, 'data', 'sitemap-lastmod.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
})();

check('S1-4  dateModified comes from the content-date ledger', () => {
  const bad = [];
  let checked = 0;
  for (const f of HTML) {
    const s = fs.readFileSync(f, 'utf8');
    const dates = [...s.matchAll(/"dateModified"\s*:\s*"([^"]+)"/g)].map(m => m[1].slice(0, 10));
    if (!dates.length) continue;
    const entry = LEDGER[urlFor(f)];
    if (!entry) continue;
    checked++;
    for (const d of dates) if (d !== entry.date) bad.push(`${rel(f)}: dateModified ${d}, ledger says ${entry.date}`);
  }
  assert(checked > 300, `only ${checked} pages could be matched to the ledger — the ledger looks incomplete`);
  assert(!bad.length, `${bad.length} page(s) disagree with the ledger:\n${bad.slice(0, 8).join('\n')}\n  Run: node scripts/update-sitemap-lastmod.js`);
  return `${checked} pages, all equal to their content hash date`;
});

check('S1-4  build-v2 no longer publishes a verification date as dateModified', () => {
  /* Strip comments first: the block explaining this repair quotes the old code
     verbatim, and matching documentation would fail the gate forever. */
  const src = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^[ \t]*\/\/.*$/gm, ' ');
  assert(!/modified:\s*g\.verified/.test(src),
    'build-v2.js passes `modified: g.verified` again — every venue page would republish its check date as the page modification date.');
  assert(/modified:\s*pageModified\(/.test(src), 'build-v2.js no longer sources dateModified from pageModified().');
  return 'all head() call sites read the ledger';
});

check('S1-4  no page claims a future modification date', () => {
  const today = new Date().toISOString().slice(0, 10);
  const bad = [];
  for (const f of HTML) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/"dateModified"\s*:\s*"([^"]+)"/g)) {
      if (m[1].slice(0, 10) > today) bad.push(`${rel(f)}: ${m[1]}`);
    }
  }
  assert(!bad.length, `${bad.length} future date(s):\n${bad.slice(0, 5).join('\n')}`);
  return `none later than ${today}`;
});

/* ------------------------------------------------------------------ S2-F2 --- *
 * A dormant generator fallback claimed "We've personally confirmed the venue
 * exists and operates" - untrue, and invisible to the originality gate because
 * it only checks record-shaped patterns.                                       */
const FIRST_HAND = /\bwe visited\b|\bwe trained\b|\bwhen (?:we )?dropped\b|\bmats felt\b|\bwe watched\b|\bpersonally confirmed\b|\bchecked in person\b/i;

check('S2-F2  no false first-hand claim in output or generators', () => {
  const bad = [];
  for (const f of HTML) {
    const m = fs.readFileSync(f, 'utf8').match(FIRST_HAND);
    if (m) bad.push(`${rel(f)}: "${m[0]}"`);
  }
  for (const g of ['build-v2.js', 'build.js', 'build-extras.js', 'build-discovery.js']) {
    const p = path.join(ROOT, g);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, 'utf8').match(FIRST_HAND);
    if (m) bad.push(`${g} (dormant generator text): "${m[0]}"`);
  }
  for (const g of fs.readdirSync(path.join(ROOT, 'scripts')).filter(x => x.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(ROOT, 'scripts', g), 'utf8');
    if (g === 'verify-regressions.js') continue;
    const m = src.match(FIRST_HAND);
    if (m) bad.push(`scripts/${g}: "${m[0]}"`);
  }
  assert(!bad.length, `${bad.length} first-hand claim(s) this site cannot support:\n${bad.slice(0, 8).join('\n')}`);
  return `${HTML.length} pages and every generator, 0 claims`;
});

/* ------------------------------------------------------------- FAQ/visible --- *
 * Found while verifying S1-3: inject-venue-faq-r47.js was not idempotent, so a
 * clean build shipped its visible Q&A next to build-v2.js's completely different
 * questions in the FAQPage markup, while a rebuild made them agree. Google
 * requires FAQPage content to match what the page shows.                        */
check('FAQ    every FAQPage question is actually on the page', () => {
  const bad = [];
  let pages = 0, questions = 0;
  for (const g of GYMS) {
    const p = path.join(ROOT, 'gyms', g.id, 'index.html');
    if (!fs.existsSync(p)) continue;
    const s = fs.readFileSync(p, 'utf8');
    const m = s.match(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[\s\S]*?)<\/script>/);
    if (!m) continue;
    pages++;
    let faq; try { faq = JSON.parse(m[1]); } catch { bad.push(`${g.id}: FAQPage does not parse`); continue; }
    const visible = s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ');
    for (const q of [].concat(faq.mainEntity || [])) {
      questions++;
      const name = String(q.name || '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
      if (name && !visible.includes(name)) bad.push(`${g.id}: markup asks "${name}" but the page does not`);
    }
  }
  assert(!bad.length, `${bad.length} FAQ question(s) exist only in markup:\n${bad.slice(0, 6).join('\n')}\n  inject-venue-faq-r47.js must strip any FAQPage it did not write.`);
  return `${pages} venue pages, ${questions} questions, all visible`;
});

/* ------------------------------------------------------------------ S2-B1 --- */
check('S2-B1  a visible byline always has matching author markup', () => {
  const bad = [], dangling = [];
  for (const f of HTML) {
    const s = fs.readFileSync(f, 'utf8');
    const visible = /Tim &amp; Paemi/.test(s.replace(/<script[\s\S]*?<\/script>/gi, ''));
    if (visible && !/"author"\s*:/.test(s)) bad.push(rel(f));
    for (const id of ['tim', 'paemi', 'timpaemi']) {
      const ref = new RegExp(`"@id":"https://timpaemi\\.com/#${id}"`);
      const node = new RegExp(`"@type":"(?:Person|Organization)","@id":"https://timpaemi\\.com/#${id}"`);
      if (ref.test(s) && !node.test(s)) dangling.push(`${rel(f)} -> #${id}`);
    }
  }
  assert(!bad.length, `${bad.length} page(s) show the byline with no author markup:\n${bad.slice(0, 8).join('\n')}`);
  assert(!dangling.length, `${dangling.length} entity reference(s) do not resolve on their own page:\n${dangling.slice(0, 8).join('\n')}`);
  return `${HTML.length} pages, every byline backed and every @id resolvable`;
});

/* ------------------------------------------------------------------ S2-H1 --- */
check('S2-H1  control boundary meets WCAG 2.2 AA non-text contrast', () => {
  const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
  const tok = n => { const m = css.match(new RegExp(`--${n}:\\s*(#[0-9a-f]{6})`, 'i')); assert(m, `--${n} not found in styles.css`); return m[1]; };
  const lum = h => h.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255)
    .map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
    .reduce((a, v, i) => a + [0.2126, 0.7152, 0.0722][i] * v, 0);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const control = tok('line-control');
  const worst = ['bg', 'sunken', 'surface-3'].map(n => [n, ratio(control, tok(n))]).sort((a, b) => a[1] - b[1])[0];
  assert(worst[1] >= 3, `--line-control ${control} is only ${worst[1].toFixed(2)}:1 against --${worst[0]}; WCAG 2.2 AA 1.4.11 needs 3:1 for a control boundary.`);
  assert(/--line-control/.test(css.split('.btn-ghost')[1] || ''), '.btn-ghost no longer uses --line-control');
  return `--line-control ${control} is ${worst[1].toFixed(2)}:1 at worst (vs --${worst[0]})`;
});

/* ------------------------------------------------------------------ S2-H2 --- */
check('S2-H2  generated compare selects are programmatically labelled', () => {
  const gen = fs.readFileSync(path.join(ROOT, 'scripts/build-compare-page.js'), 'utf8');
  assert(/for="compare-slot-/.test(gen) && /<select id="compare-slot-/.test(gen),
    'build-compare-page.js no longer emits the id/for pair on its four venue pickers.');
  const out = fs.readFileSync(path.join(ROOT, 'compare/index.html'), 'utf8');
  assert(/for="compare-slot-/.test(out) && /id="compare-slot-/.test(out),
    'compare/index.html was built without the id/for pair — rebuild with scripts/build-compare-page.js.');
  return 'label[for] and select[id] present in generator and output';
});

/* ------------------------------------------------------------------ S2-H3 --- */
check('S2-H3  visible Thai is marked lang="th"', () => {
  const THAI = /[ก-ฺเ-๛]/;               // letters/marks; U+0E3F ฿ is currency, not language
  const bad = [];
  let wrapped = 0;
  for (const f of HTML) {
    let s = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ');
    wrapped += (s.match(/<span lang="th">/g) || []).length;
    s = s.replace(/<[a-z]+ lang="th">[\s\S]*?<\/[a-z]+>/gi, ' ');   // remove correctly annotated runs
    const text = s.replace(/<[^>]+>/g, ' ');
    if (THAI.test(text)) bad.push(`${rel(f)}: ${(text.match(/[ก-ฺเ-๛]+/g) || []).slice(0, 3).join(', ')}`);
  }
  assert(!bad.length, `${bad.length} page(s) show Thai text with no lang annotation:\n${bad.slice(0, 8).join('\n')}`);
  return `${wrapped} annotated runs, 0 unannotated`;
});

/* -------------------------------------------------- approved 2026-07-29 --- *
 * Four index- and access-affecting changes Tim approved individually. Each is
 * cheap to undo by accident, so each is asserted here.                         */
check('SEC    internal trees are blocked from the public site', () => {
  const red = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
  const head = fs.readFileSync(path.join(ROOT, '_headers'), 'utf8');
  for (const t of ['/.internal-docs/*', '/research/*', '/private/*', '/.backups/*']) {
    assert(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+/404\\.html\\s+30[12]').test(red),
      `_redirects no longer blocks ${t} - those files are publicly fetchable again.`);
    assert(head.includes(t.replace(/\*$/, '*')), `_headers no longer sets noindex/no-store on ${t}`);
  }
  const rob = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
  for (const d of ['/.internal-docs/', '/research/', '/private/']) {
    assert(rob.includes('Disallow: ' + d), `robots.txt no longer disallows ${d}`);
  }
  return 'blocked in _redirects, _headers and robots.txt';
});

check('SEC    preview host is marked noindex', () => {
  const f = path.join(ROOT, 'functions/_middleware.js');
  assert(fs.existsSync(f), 'functions/_middleware.js is gone - pattayagym.pages.dev is indexable again.');
  const src = fs.readFileSync(f, 'utf8');
  assert(/X-Robots-Tag/.test(src) && /noindex/.test(src), 'the middleware no longer sets X-Robots-Tag: noindex');
  assert(/pattaya-gym\.com/.test(src), 'the middleware no longer recognises the production hostname');
  return 'non-production hostnames get X-Robots-Tag: noindex';
});

check('SEO    robots.txt matches the 2027 crawler set', () => {
  const r = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
  assert(!/crawl-delay/i.test(r), 'Crawl-delay is back - Google does not support it.');
  for (const dead of ['Claude-Web', 'anthropic-ai']) {
    assert(!new RegExp('User-agent:\\s*' + dead, 'i').test(r), `${dead} is a retired token and is back in robots.txt`);
  }
  for (const live of ['Claude-User', 'Claude-SearchBot', 'OAI-AdsBot', 'OAI-SearchBot', 'ClaudeBot', 'GPTBot']) {
    assert(new RegExp('User-agent:\\s*' + live, 'i').test(r), `${live} is missing from robots.txt`);
  }
  assert(/Sitemap:\s*https:\/\/pattaya-gym\.com\/sitemap\.xml/.test(r), 'the sitemap line is missing');
  return 'current agents present, retired and unsupported directives gone';
});

check('SEO    sitemap carries only loc and lastmod', () => {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const urls = (sm.match(/<url>/g) || []).length;
  assert(!/<priority>/.test(sm), 'sitemap <priority> is back - Google has ignored it since 8 July 2026.');
  assert(!/<changefreq>/.test(sm), 'sitemap <changefreq> is back - Google has ignored it since 8 July 2026.');
  assert((sm.match(/<lastmod>/g) || []).length === urls, 'not every sitemap URL carries a lastmod');
  return `${urls} URLs, each with a content-hash lastmod and nothing ignored`;
});

check('GLOBAL page language and currency are declared', () => {
  let lang = 0;
  for (const f of HTML) if (/"inLanguage":"en"/.test(fs.readFileSync(f, 'utf8'))) lang++;
  assert(lang > 340, `only ${lang} of ${HTML.length} pages declare inLanguage`);
  let cur = 0;
  for (const g of GYMS) {
    const p = path.join(ROOT, 'gyms', g.id, 'index.html');
    if (fs.existsSync(p) && /"currenciesAccepted":"THB"/.test(fs.readFileSync(p, 'utf8'))) cur++;
  }
  assert(cur === GYMS.length, `${GYMS.length - cur} venue page(s) do not state their currency`);
  return `${lang} pages declare English, all ${cur} venue records declare THB`;
});

/* -------------------------------------------------------------------------- */
for (const p of passes) console.log(`  ok   ${p}`);
if (failures.length) {
  console.error(`\nverify:regressions FAILED — ${failures.length} of ${passes.length + failures.length} checks`);
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log(`verify:regressions OK — ${passes.length} checks, every 2026-07 audit repair still holds.`);
