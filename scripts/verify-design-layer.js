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

const problems = {
  header: [],
  footer: [],
  marquee: [],
  darkMeta: [],
  staleCount: [],
  venueUi: [],
  toolUi: [],
  componentMarkup: [],
  componentCss: []
};
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
    if (/<(?:a|span) class="[^"]*cv-cta[^"]*"[^>]*>[^<]*→/.test(html)) {
      problems.componentMarkup.push(rel + ' (category-card CTA duplicates its CSS arrow)');
    }
    if (rel.startsWith('gyms' + path.sep)) {
      const reasons = [];
      if (!html.includes('class="venue-action-panel')) reasons.push('missing venue action panel');
      if (!html.includes('class="venue-facts"')) reasons.push('missing semantic facts grid');
      if (html.includes('venue-more-toggle')) reasons.push('dead More actions control returned');
      if (html.includes('▶ Call gym')) reasons.push('legacy play-icon CTA returned');
      const panel = (html.match(/<aside class="venue-action-panel[\s\S]*?<\/aside>/) || [''])[0];
      if (/mailto:info@pattaya-gym\.com/i.test(panel)) reasons.push('publisher email presented as venue action');
      const toolsCount = (html.match(/id="venue-tools-r84"/g) || []).length;
      if (toolsCount !== 1) reasons.push('expected one tools block, found ' + toolsCount);
      if (reasons.length) problems.venueUi.push(rel + ' (' + reasons.join('; ') + ')');
    }
    if (rel === path.join('map', 'index.html')) {
      const reasons = [];
      if (!html.includes('location-filters-map')) reasons.push('missing map filter layout');
      if (!html.includes('location-filter-actions')) reasons.push('missing grouped filter actions');
      if (!html.includes('location-mobile-note')) reasons.push('missing mobile list guidance');
      if ((html.match(/id="location-tool-data"/g) || []).length !== 1) reasons.push('location data payload is not unique');
      if ((html.match(/src="\/location-tools\.js\?v=/g) || []).length !== 1) reasons.push('location script tag is not unique');
      if (reasons.length) problems.toolUi.push(rel + ' (' + reasons.join('; ') + ')');
    }
    if (rel === path.join('find-my-coach', 'index.html')) {
      const reasons = [];
      if (!html.includes('location-filters-coach')) reasons.push('missing coach filter layout');
      if (!html.includes('location-filter-actions')) reasons.push('missing grouped filter actions');
      if ((html.match(/id="location-tool-data"/g) || []).length !== 1) reasons.push('location data payload is not unique');
      if ((html.match(/src="\/location-tools\.js\?v=/g) || []).length !== 1) reasons.push('location script tag is not unique');
      if (reasons.length) problems.toolUi.push(rel + ' (' + reasons.join('; ') + ')');
    }
  }
}

walk(ROOT);

const blockedToolStatuses = new Set([
  'closed', 'likely-closed', 'unverified', 'out-of-area', 'not-in-pattaya',
  'informational', 'non-sport', 'non-sport-attraction', 'public-beach'
]);
const gymById = new Map(GYMS.map(g => [g.id, g]));

try {
  const mapHtml = fs.readFileSync(path.join(ROOT, 'map', 'index.html'), 'utf8');
  const payloadMatch = mapHtml.match(/<script type="application\/json" id="location-tool-data">([\s\S]*?)<\/script>/);
  if (!payloadMatch) throw new Error('missing map payload');
  const payload = JSON.parse(payloadMatch[1]);
  const records = Array.isArray(payload.records) ? payload.records : [];
  const blocked = records.filter(record => {
    const source = gymById.get(record.id);
    return !source || blockedToolStatuses.has(String(source.status || '').toLowerCase());
  });
  if (blocked.length) problems.toolUi.push(`map/index.html (${blocked.length} blocked or unknown records reached map payload)`);
  if (records.some(record => !record.areaKey)) problems.toolUi.push('map/index.html (map record missing normalized areaKey)');
  if ((mapHtml.match(/class="location-result-card"/g) || []).length !== records.length) {
    problems.toolUi.push('map/index.html (SSR result list does not contain every map payload record)');
  }
  if (/<a class="location-pin"/.test(mapHtml) || !/<section class="coordinate-map" aria-hidden="true">/.test(mapHtml)) {
    problems.toolUi.push('map/index.html (visual map duplicates accessible venue links)');
  }
  const areaKeys = new Set(records.map(record => record.areaKey));
  if (areaKeys.size > 8) problems.toolUi.push(`map/index.html (${areaKeys.size} map area facets; expected a compact taxonomy)`);
  const toolJs = fs.readFileSync(path.join(ROOT, 'location-tools.js'), 'utf8');
  if (!toolJs.includes('item.areaKey || item.area')) problems.toolUi.push('location-tools.js (normalized map area filter is not used)');
} catch (error) {
  problems.toolUi.push(`map/index.html (${error.message})`);
}

try {
  const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'plan-venues.json'), 'utf8'));
  const blockedPlan = plan.filter(record => {
    const source = gymById.get(record.id);
    return !source || blockedToolStatuses.has(String(source.status || '').toLowerCase()) || String(source.status || '').toLowerCase() === 'public-beach';
  });
  if (blockedPlan.length) problems.toolUi.push(`data/plan-venues.json (${blockedPlan.length} unsafe recommendation records)`);
  if (plan.some(record => gymById.get(record.id)?.status && record.status !== gymById.get(record.id).status)) {
    problems.toolUi.push('data/plan-venues.json (source status not carried into planner data)');
  }
} catch (error) {
  problems.toolUi.push(`data/plan-venues.json (${error.message})`);
}

try {
  const compare = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'compare-venues.json'), 'utf8'));
  if (compare.some(record => String(record.status || '') !== String(gymById.get(record.id)?.status || ''))) {
    problems.toolUi.push('data/compare-venues.json (source status not carried into comparison data)');
  }
} catch (error) {
  problems.toolUi.push(`data/compare-venues.json (${error.message})`);
}

for (const areaSlug of ['central-pattaya', 'east-pattaya', 'jomtien', 'naklua', 'pratamnak', 'sattahip']) {
  const file = path.join(ROOT, 'area', areaSlug, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  if ((html.match(/<\/span>\s*Every venue<\/div>/g) || []).length !== 1 || (html.match(/<\/span>\s*By sport<\/div>/g) || []).length !== 1) {
    problems.componentMarkup.push(`area/${areaSlug}/index.html (area directory or sport router duplicated)`);
  }
  const sportAt = html.search(/<\/span>\s*By sport<\/div>/);
  const directoryAt = html.search(/<\/span>\s*Every venue<\/div>/);
  const editorialAt = html.search(/<\/span>\s*About this neighborhood<\/div>/);
  if (sportAt < 0 || directoryAt < sportAt || (editorialAt >= 0 && editorialAt < directoryAt)) {
    problems.componentMarkup.push(`area/${areaSlug}/index.html (task-first area hierarchy regressed)`);
  }
}

const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
for (const selector of [
  '.venue-action-panel {',
  '.venue-action-primary-grid {',
  '.venue-action-utility,',
  '.venue-facts {',
  '.taxonomy-link {',
  '.jump-nav-pills a.is-active {'
]) {
  if (!css.includes(selector)) problems.componentCss.push('styles.css (' + selector + ')');
}

const LABELS = {
  header: 'missing the current header (NAV-SPEC-2026-V2)',
  footer: 'missing the current footer (FOOTER-SPEC-2026-V2)',
  marquee: 'still carry a marquee ticker',
  darkMeta: 'still declare the old dark theme-color / color-scheme',
  staleCount: `still claim a stale venue count (live count is ${N})`,
  venueUi: 'regressed the shared venue UI component',
  toolUi: 'regressed a shared location-tool component',
  componentMarkup: 'carry conflicting shared-component markup',
  componentCss: 'are missing a required shared component selector'
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
