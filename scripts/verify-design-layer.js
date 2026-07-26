#!/usr/bin/env node
/**
 * verify-design-layer.js — proves the 2026 design layer actually landed.
 *
 * verify-deploy.js checks structural integrity; it has no opinion about design.
 * This is the gate that catches the specific way this redesign can regress:
 * `build-v2.js` only regenerates the pages it owns, so if the two sweep scripts
 * (apply-design-2026.js, polish-design-2026.js) ever fall out of the ship chain,
 * roughly 59 static pages — guides, search, compare, map, plan, favorites,
 * changelog, sports, colophon — quietly revert to the old dark chrome while
 * every other gate still passes. You would ship a half-redesigned site and no
 * existing check would say a word.
 *
 * Exits non-zero on any page that is missing the current header or footer, still
 * carries a marquee, still declares a dark theme-color, or still claims a stale
 * venue count.
 *
 * Run from repo root: node scripts/verify-design-layer.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { GYMS } = require(path.join(ROOT, 'data.js'));
const N = GYMS.length;

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.backups', '.wrangler', 'tmp',
  'research', 'fonts', 'og', 'packages', 'private', 'venues', 'data', 'docs'
]);

// changelog/ is excluded from the count check only: its numbers are historical
// records of past builds, not present-tense claims about the directory.
const CHANGELOG = path.join(ROOT, 'changelog') + path.sep;

const NAV_MARKER = 'NAV-SPEC-2026-V2';
const FOOTER_MARKER = 'FOOTER-SPEC-2026-V2';

// Requiring a space or hyphen after the digits is what keeps this off phone
// numbers (+66815781199) and Facebook profile ids (61575569020794), both of
// which contain "157" as a substring.
const STALE_COUNT = /\b(157|158)[ -](venue|Venue|verified|hand-checked|listing|Listing|gym|Gym|Pattaya|entr|sport)/;

const problems = { header: [], footer: [], marquee: [], darkMeta: [], staleCount: [] };
let checked = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(fp);
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;

    checked++;
    const html = fs.readFileSync(fp, 'utf8');
    const rel = path.relative(ROOT, fp);

    if (!html.includes(NAV_MARKER)) problems.header.push(rel);
    if (!html.includes(FOOTER_MARKER)) problems.footer.push(rel);
    if (/class="marquee/.test(html)) problems.marquee.push(rel);
    if (html.includes('content="#000000"') || html.includes('color-scheme" content="dark')) {
      problems.darkMeta.push(rel);
    }
    if (!fp.startsWith(CHANGELOG)) {
      const stripped = html
        .replace(/facebook\.com\/[0-9]+/g, '')
        .replace(/[0-9]{8,}/g, '');
      if (STALE_COUNT.test(stripped)) problems.staleCount.push(rel);
    }
  }
}

walk(ROOT);

const LABELS = {
  header: 'missing the current header (NAV-SPEC-2026-V2)',
  footer: 'missing the current footer (FOOTER-SPEC-2026-V2)',
  marquee: 'still carry a marquee ticker',
  darkMeta: 'still declare the old dark theme-color / color-scheme',
  staleCount: `still claim a stale venue count (live count is ${N})`
};

console.log(`Design layer: ${checked} HTML files checked (venue count ${N})`);

let failed = 0;
for (const key of Object.keys(problems)) {
  const list = problems[key];
  if (!list.length) continue;
  failed += list.length;
  console.error(`  ✗ ${list.length} page(s) ${LABELS[key]}:`);
  for (const f of list.slice(0, 6)) console.error(`      ${f}`);
  if (list.length > 6) console.error(`      … and ${list.length - 6} more`);
}

if (failed) {
  console.error('');
  console.error('✗ Design layer FAILED.');
  console.error('  Almost always the cause: apply-design-2026.js and/or');
  console.error('  polish-design-2026.js did not run after the generators.');
  console.error('  Fix:  node scripts/apply-design-2026.js && node scripts/polish-design-2026.js');
  process.exit(1);
}

console.log('✓ Design layer consistent on every page');
process.exit(0);
