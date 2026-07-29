#!/usr/bin/env node
/**
 * normalize-entity-graph.js — make the JSON-LD entity graph consistent on every page.
 *
 * SCOPE: pattaya-gym.com only.
 *
 * Two leftovers this fixes, both found by the 2026-07-28 audit and both invisible to
 * every other gate because the JSON parses perfectly:
 *
 * 1. HAND-MAINTAINED @graph BLOCKS. index.html is not generated, and /press/ only has
 *    its <main> replaced, so both kept an Organization whose `founder` was a pair of
 *    bare {"@type":"Person","name":"Tim"} nodes - no @id, no url, no sameAs. Google's
 *    Article guidance is explicit that a Person needs url or sameAs to be resolvable;
 *    a bare name is not an entity, it is a string. Rewritten here to @id references
 *    that point at the full Person nodes the rest of the graph already defines.
 *
 * 2. MISSING dateModified. Nine pages - the homepage, the guide hub, the tool stubs
 *    and the changelog - carried no dateModified at all. It is what a crawler uses to
 *    decide whether re-crawling is worth the budget, and this site changes daily.
 *
 * Idempotent. Run after the design sweeps, before the sitemap.
 */
const fs = require('fs');
const path = require('path');
const { GYMS } = require('../data.js');
const { TIM_ID, PAEMI_ID, TIMPAEMI_ID, authorRefs, authorPersons, timpaemiRef,
        timpaemiOrganization, personTim, personPaemi } = require('./lib/timpaemi-author');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'packages', 'scripts', 'venues', 'dist',
  'tmp', 'private', 'research', 'brand-kit', 'fonts', 'og', 'brand', 'outreach']);

/* Same derivation as build-v2.js: the newest venue verification date on the site. */
const SITE = 'https://pattaya-gym.com';
const SITE_MODIFIED = (() => {
  const d = GYMS.map(g => g.verified).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x));
  return d.length ? d.sort().pop() : new Date().toISOString().slice(0, 10);
})();

function walkHtml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name.startsWith('.') || SKIP.has(e.name)) continue;
      walkHtml(path.join(dir, e.name), out);
    } else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}

/** Bare founder Persons -> @id references. Returns true if anything changed. */
function fixFounders(node) {
  let changed = false;
  if (Array.isArray(node)) { for (const n of node) if (fixFounders(n)) changed = true; return changed; }
  if (!node || typeof node !== 'object') return false;

  for (const key of ['founder', 'founders', 'employee', 'author']) {
    const v = node[key];
    if (!Array.isArray(v)) continue;
    const bare = v.filter(x => x && x['@type'] === 'Person' && x.name && !x['@id'] && !x.url && !x.sameAs);
    if (bare.length !== v.length || !v.length) continue;
    const mapped = v.map(x => {
      const n = String(x.name).trim().toLowerCase();
      if (n === 'tim') return { '@id': TIM_ID };
      if (n === 'paemi') return { '@id': PAEMI_ID };
      return x;
    });
    if (JSON.stringify(mapped) !== JSON.stringify(v)) { node[key] = mapped; changed = true; }
  }
  for (const v of Object.values(node)) if (fixFounders(v)) changed = true;
  return changed;
}

/** Stamp dateModified on the first WebPage-ish node. Returns true if it changed. */
function stampDate(node) {
  if (Array.isArray(node)) { for (const n of node) if (stampDate(n)) return true; return false; }
  if (!node || typeof node !== 'object') return false;
  const t = [].concat(node['@type'] || []);
  /* WebApplication is a SoftwareApplication is a CreativeWork, so dateModified is
     valid on it. The three tool pages - /compare/, /plan-my-trip/, /favorites/ -
     carry no WebPage node at all, only a WebApplication, so without this they were
     the last three pages on the site with no modification date. */
  const DATEABLE = x => typeof x === 'string' && (/Page$/.test(x) || x === 'WebApplication') && x !== 'FAQPage';
  if (t.some(DATEABLE) && !node.dateModified) {
    node.dateModified = SITE_MODIFIED;
    return true;
  }
  for (const v of Object.values(node)) if (stampDate(v)) return true;
  return false;
}

/* S2-B1, 2026-07-29 - a visible byline with no author markup.
   Every page on the site shows the "Tim & Paemi" byline, but six pages built
   outside build-v2.js - /changelog/, /compare/, /favorites/, /find-my-coach/,
   /map/, /plan-my-trip/ - carried no `author` in their JSON-LD at all. Google
   asks that all authors presented on the page also appear in the markup. This
   is author integrity, not a ranking lever.

   Adding the reference is not enough on its own: the @id it points at has to
   resolve, so the Person and Organization nodes are appended too, exactly as
   build-v2.js emits them elsewhere. */
const BYLINE = /Tim &amp; Paemi/;

/* S1-1, 2026-07-29 - hand-maintained pages held a stale copy of the entity.
   Removing the prohibited sister domain from scripts/lib/timpaemi-author.js
   fixed every generated page at once, but four pages are not generated from it:
   index.html is hand-maintained by design, and /favorites/, /guides/ and
   /search/ were last written by scripts that are no longer in the ship chain.
   All four kept shipping the old sameAs, including the live homepage.

   So: wherever one of the three canonical @ids is DEFINED (a node with a @type,
   not a bare reference to it), the definition is replaced with the current one
   from timpaemi-author.js. One definition of the entity, enforced on every
   build, regardless of which script wrote the page or how long ago. */
const CANONICAL = new Map([
  [TIM_ID, personTim],
  [PAEMI_ID, personPaemi],
  [TIMPAEMI_ID, timpaemiOrganization],
]);

function canonicalizeEntities(node) {
  if (Array.isArray(node)) { let c = false; for (const n of node) if (canonicalizeEntities(n)) c = true; return c; }
  if (!node || typeof node !== 'object') return false;
  let changed = false;
  const id = node['@id'];
  if (id && node['@type'] && CANONICAL.has(id)) {
    const want = CANONICAL.get(id)();
    const ctx = node['@context'];
    const before = JSON.stringify(node);
    for (const k of Object.keys(node)) if (k !== '@context') delete node[k];
    Object.assign(node, want);
    if (ctx) node['@context'] = ctx;
    // Only report a change when the definition actually differed, so the count
    // means "stale definitions found" rather than "nodes visited".
    if (JSON.stringify(node) !== before) changed = true;
  }
  for (const v of Object.values(node)) if (canonicalizeEntities(v)) changed = true;
  return changed;
}

function attachAuthor(node) {
  if (Array.isArray(node)) { for (const n of node) if (attachAuthor(n)) return true; return false; }
  if (!node || typeof node !== 'object') return false;
  const t = [].concat(node['@type'] || []);
  const HOSTS = x => typeof x === 'string' && (/Page$/.test(x) || x === 'WebApplication') && x !== 'FAQPage';
  if (t.some(HOSTS) && !node.author) {
    node.author = authorRefs();
    if (!node.publisher) node.publisher = timpaemiRef();
    return true;
  }
  for (const v of Object.values(node)) if (attachAuthor(v)) return true;
  return false;
}

let foundersFixed = 0, datesAdded = 0, filesChanged = 0, authorsAdded = 0, entitiesCanonicalized = 0;

for (const file of walkHtml(ROOT)) {
  const orig = fs.readFileSync(file, 'utf8');
  let html = orig;
  let pageHasDate = /"dateModified"/.test(html);
  /* Only pages that actually show the byline get author markup - markup must
     describe what is on the page, never the reverse. */
  let needsAuthor = BYLINE.test(html.replace(/<script[\s\S]*?<\/script>/gi, '')) && !/"author"\s*:/.test(html);

  let addEntityNodes = false;
  html = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (whole, body) => {
      let json;
      try { json = JSON.parse(body); } catch { return whole; }
      let touched = false;
      if (fixFounders(json)) { touched = true; foundersFixed++; }
      if (canonicalizeEntities(json)) { touched = true; entitiesCanonicalized++; }
      if (!pageHasDate && stampDate(json)) { touched = true; pageHasDate = true; datesAdded++; }
      if (needsAuthor && attachAuthor(json)) { touched = true; needsAuthor = false; authorsAdded++; addEntityNodes = true; }
      return touched ? `<script type="application/ld+json">${JSON.stringify(json)}</script>` : whole;
    }
  );

  /* A page can show the byline and carry no page-level node at all (/favorites/
     had only Organization + the two Person nodes). Give it a WebPage to host the
     authorship, matching what build-v2.js emits for every other page. */
  if (needsAuthor) {
    const url = SITE + '/' + path.relative(ROOT, file).replace(/\\/g, '/').replace(/index\.html$/, '');
    const title = (html.match(/<title>([^<]*)<\/title>/) || [, ''])[1].replace(/\s+\|.*$/, '').trim();
    const node = {
      '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${url}#webpage`,
      url, name: title, author: authorRefs(), publisher: timpaemiRef(),
    };
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(node)}</script>\n</head>`);
    needsAuthor = false; authorsAdded++; addEntityNodes = true;
  }

  /* Any page that REFERENCES one of the three entity @ids must also define it,
     or the reference dangles. Checked on every page every run, not only on the
     pages this script just touched, so a gap introduced by any other generator
     heals here too. */
  if (addEntityNodes || /"@id":"https:\/\/timpaemi\.com\/#(?:tim|paemi|timpaemi)"/.test(html)) {
    const blocks = [];
    if (!/"@id":"https:\/\/timpaemi\.com\/#timpaemi"[\s\S]*"@type":"Organization"|"@type":"Organization"[\s\S]*"@id":"https:\/\/timpaemi\.com\/#timpaemi"/.test(html)) {
      blocks.push({ '@context': 'https://schema.org', ...timpaemiOrganization() });
    }
    for (const person of authorPersons()) {
      // Match the NODE, not the bare @id - an @id also appears in every reference
      // to it, so testing the id alone always finds one and never appends the node.
      const nodeSig = new RegExp(`"@type":"Person","@id":"${person['@id'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`);
      if (!nodeSig.test(html)) blocks.push({ '@context': 'https://schema.org', ...person });
    }
    if (blocks.length) {
      const tags = blocks.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
      html = html.replace('</head>', `${tags}\n</head>`);
    }
  }

  if (html !== orig) { fs.writeFileSync(file, html, 'utf8'); filesChanged++; }
}

console.log(`entity graph: ${filesChanged} file(s) changed — ${foundersFixed} bare founder list(s) resolved to @id, ${datesAdded} dateModified added (${SITE_MODIFIED}), ${authorsAdded} page(s) given the author markup their visible byline claims, ${entitiesCanonicalized} stale entity definition(s) rewritten from scripts/lib/timpaemi-author.js`);
