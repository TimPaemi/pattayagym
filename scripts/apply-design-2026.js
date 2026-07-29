#!/usr/bin/env node
/**
 * apply-design-2026.js — one-time-then-idempotent sweep that rolls the 2026
 * light/volt design onto every static HTML page.
 *
 * build-v2.js regenerates venue / category / area / utility pages, but ~140
 * pages are static files on disk (homepage, guides/*, search, compare, map,
 * plan-my-trip, favorites, find-my-coach, changelog, colophon, sports, …) and
 * carry the old dark chrome baked in. This script brings them all forward:
 *
 *   1. Header + mobile drawer  -> NAV-SPEC-2026-V2 (scripts/lib/v2-nav.js)
 *   2. Footer                  -> FOOTER-SPEC-2026-V2 (scripts/lib/site-footer.js)
 *   3. Top marquee ticker      -> removed (balanced-tag walk, not a regex)
 *   4. theme-color / color-scheme meta -> light
 *   5. Legacy neon helper classes on headings -> the single accent family
 *   6. Asset ?v= query on every page -> build-v2.js ASSET_VERSION
 *
 * WHY (6) IS HERE: bump-legacy-assets.js only walks a hard-coded 56-page
 * allowlist, and build-v2.js only rewrites the pages it still generates. Four
 * area x category pages had fallen out of both (their category emptied out, so
 * the builder stopped emitting them) and sat on a stale ?v= forever, failing
 * verify-deploy's asset-version check. This sweep covers every HTML file, so
 * an orphaned page can no longer drift.
 *
 * WHY A BALANCED WALK FOR THE MARQUEE: the block is
 *   div.marquee > div.marquee-track > div.marquee-set x2
 * so a lazy `[\s\S]*?</div>` regex stops four closing tags too early and leaves
 * orphans, which fails html-validate. removeBalancedDiv() counts nesting.
 *
 * Idempotent: safe to run on every build. Run from repo root:
 *   node scripts/apply-design-2026.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { v2NavHtml } = require('./lib/v2-nav.js');
const { siteFooterHtml } = require('./lib/site-footer.js');
const { GYMS } = require(path.join(ROOT, 'data.js'));
const VENUE_N = GYMS.length;

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.backups', '.wrangler', 'tmp',
  'research', 'fonts', 'og', 'packages', 'private', 'venues', 'data', 'docs'
]);

const NAV_MARKER = 'NAV-SPEC-2026-V2';
const FOOTER_MARKER = 'FOOTER-SPEC-2026-V2';

// Single source of truth, same as verify-deploy.js reads.
const ASSET_VERSION = (
  fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8')
    .match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/) || [, null]
)[1];
if (!ASSET_VERSION) {
  console.error('apply-design-2026: could not read ASSET_VERSION from build-v2.js');
  process.exit(1);
}

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* htmlFiles(path.join(dir, entry.name));
    } else if (entry.name.endsWith('.html')) {
      yield path.join(dir, entry.name);
    }
  }
}

/**
 * Remove a <div ...> block by walking div nesting from `startIdx` so the
 * matching close tag is found regardless of how many children it has.
 * Returns the html with the block (and its trailing newline) removed.
 */
function removeBalancedDiv(html, startIdx) {
  const tagRe = /<div\b[^>]*>|<\/div\s*>/gi;
  tagRe.lastIndex = startIdx;
  let depth = 0;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[0].toLowerCase().startsWith('</')) {
      depth--;
      if (depth === 0) {
        let end = m.index + m[0].length;
        while (end < html.length && (html[end] === '\n' || html[end] === '\r')) end++;
        let start = startIdx;
        while (start > 0 && (html[start - 1] === ' ' || html[start - 1] === '\t')) start--;
        return html.slice(0, start) + html.slice(end);
      }
    } else {
      depth++;
    }
  }
  return null; // unbalanced — leave the file alone rather than corrupt it
}

function stripTopMarquee(html) {
  let changed = false;
  for (;;) {
    const m = html.match(/<div class="marquee(?![a-z-])[^"]*"[^>]*>/i);
    if (!m) break;
    const next = removeBalancedDiv(html, m.index);
    if (next === null) break;
    html = next;
    changed = true;
  }
  return { html, changed };
}

const HEADER_RE = /<header class="nav"[^>]*>[\s\S]*?<\/header>/i;
const NAVMOBILE_RE = /\n?[ \t]*<nav class="nav-mobile"[^>]*>[\s\S]*?<\/nav>\n?/i;
const FOOTER_RE = /<footer class="footer"[^>]*>[\s\S]*?<\/footer>/i;

let files = 0, navs = 0, footers = 0, marquees = 0, metas = 0, accents = 0, versions = 0, icons = 0;

for (const file of htmlFiles(ROOT)) {
  const orig = fs.readFileSync(file, 'utf8');
  let html = orig;

  // 1 + 2. Chrome. Remove the old drawer first, then replace the header with
  // the module output (which contains both header and the new drawer), so the
  // pass stays idempotent when run against already-swept files.
  if (HEADER_RE.test(html) && !html.includes(NAV_MARKER)) {
    html = html.replace(NAVMOBILE_RE, '\n');
    html = html.replace(HEADER_RE, () => v2NavHtml());
    navs++;
  }
  /* 2026-07-29: this used to be `&& !html.includes(FOOTER_MARKER)`, which made the
     sweep a one-shot migration rather than a sync. Once a page had a V2 footer it
     was never refreshed again, so every later edit to scripts/lib/site-footer.js
     landed on new pages only. That is why the Google Preferred Sources link, added
     to the footer module after those pages were first swept, was present on 319
     pages and missing from 36 - including the homepage, the guides hub and 32
     guides. siteFooterHtml() takes only the venue count, so the canonical footer is
     identical everywhere and replacing it unconditionally converges. The footer
     module is now genuinely the single source for the footer. */
  if (FOOTER_RE.test(html)) {
    const beforeFooter = html;
    html = html.replace(FOOTER_RE, () => siteFooterHtml(VENUE_N));
    if (html !== beforeFooter) footers++;
  }

  // 3. Marquee tickers.
  const mq = stripTopMarquee(html);
  html = mq.html;
  if (mq.changed) marquees++;

  // 4. Dark-mode metas.
  const beforeMeta = html;
  html = html
    .replace(/<meta name="theme-color" content="#000000">/gi, '<meta name="theme-color" content="#f7f8f3">')
    .replace(/<meta name="color-scheme" content="dark">/gi, '<meta name="color-scheme" content="light">');
  if (html !== beforeMeta) metas++;

  // 5. Legacy neon text helpers -> the single accent family. The .accent-*
  //    classes are kept (there are ~2,600 of them and the stylesheet maps them
  //    all onto two calm colours); only the glow helpers are rewritten.
  const beforeAccent = html;
  html = html
    .replace(/class="c-pink"/g, 'class="accent-pink"')
    .replace(/class="c-cyan"/g, 'class="accent-cyan"')
    .replace(/class="c-mint"/g, 'class="accent-mint"')
    .replace(/class="c-yellow"/g, 'class="accent-yellow"')
    .replace(/class="c-red"/g, 'class="accent-pink"');
  if (html !== beforeAccent) accents++;

  // 6. Icon set. The old build emitted only an SVG favicon, so Safari, Windows
  //    tiles, Android install prompts and every legacy crawler got nothing. One
  //    <link> per format, added once, in the same place on every page.
  const ICON_SET = [
    '<link rel="icon" href="/favicon.ico" sizes="32x32">',
    '<link rel="apple-touch-icon" href="/icon-180.png">',
    '<link rel="manifest" href="/manifest.json">'
  ];
  const beforeIcons = html;
  if (html.includes('<link rel="icon" type="image/svg+xml" href="/favicon.svg">') && !html.includes('apple-touch-icon')) {
    html = html.replace(
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg">',
      ICON_SET[0] + '\n<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n' + ICON_SET[1] + '\n' + ICON_SET[2]
    );
  }
  if (html !== beforeIcons) icons++;

  // 6. Asset cache-busting version, on every page including orphans.
  const beforeVer = html;
  html = html.replace(/\.(css|js|woff2)\?v=\d+/g, (_m, ext) => `.${ext}?v=${ASSET_VERSION}`);
  if (html !== beforeVer) versions++;

  if (html !== orig) {
    fs.writeFileSync(file, html, 'utf8');
    files++;
  }
}

console.log(
  `apply-design-2026: ${files} files changed — navs ${navs}, footers ${footers}, ` +
  `marquees removed ${marquees}, metas ${metas}, neon helpers ${accents}, ` +
  `asset versions ${versions}, icon sets ${icons} (v${ASSET_VERSION}, venue count ${VENUE_N})`
);
