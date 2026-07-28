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
const { TIM_ID, PAEMI_ID } = require('./lib/timpaemi-author');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'packages', 'scripts', 'venues', 'dist',
  'tmp', 'private', 'research', 'brand-kit', 'fonts', 'og', 'brand', 'outreach']);

/* Same derivation as build-v2.js: the newest venue verification date on the site. */
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

let foundersFixed = 0, datesAdded = 0, filesChanged = 0;

for (const file of walkHtml(ROOT)) {
  const orig = fs.readFileSync(file, 'utf8');
  let html = orig;
  let pageHasDate = /"dateModified"/.test(html);

  html = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (whole, body) => {
      let json;
      try { json = JSON.parse(body); } catch { return whole; }
      let touched = false;
      if (fixFounders(json)) { touched = true; foundersFixed++; }
      if (!pageHasDate && stampDate(json)) { touched = true; pageHasDate = true; datesAdded++; }
      return touched ? `<script type="application/ld+json">${JSON.stringify(json)}</script>` : whole;
    }
  );

  if (html !== orig) { fs.writeFileSync(file, html, 'utf8'); filesChanged++; }
}

console.log(`entity graph: ${filesChanged} file(s) changed — ${foundersFixed} bare founder list(s) resolved to @id, ${datesAdded} dateModified added (${SITE_MODIFIED})`);
