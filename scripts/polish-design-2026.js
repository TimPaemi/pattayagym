#!/usr/bin/env node
/**
 * polish-design-2026.js — second pass of the 2026 redesign: the things a
 * stylesheet cannot reach.
 *
 * The generated HTML carries ~8,300 inline `style=` attributes. Inline styles
 * beat every stylesheet rule, so a handful of layout decisions from the old
 * dark design were surviving the restyle and had to be rewritten in the markup
 * and in the templates that emit it:
 *
 *   1. Guide/tool H1 at `clamp(40px,8vw,96px)` — 96px was tuned for a black
 *      hero with a marquee above it. On the light design it dwarfs everything.
 *      -> clamp(30px,5vw,48px), matching .hero-h1.
 *   2. `margin:0 auto` on body wrappers — the old design centred a 880px column
 *      inside a 1120px wrap, which now reads as a random 120px indent because
 *      the headings above it are left-aligned. -> margin dropped.
 *   3. Guide breadcrumbs were an inline mono ALL-CAPS bar while every other page
 *      type used .site-breadcrumb. -> all page types now share the class.
 *   4. Emoji used as iconography (⭐ 🕐 📍 💰 ✎). These render differently on
 *      every OS, cannot be brand-coloured and cannot be sized against the type
 *      scale. -> removed. ★ ♡ ✓ → stay: they are text dingbats, not emoji.
 *   5. A stale sitewide venue count of 157 in present-tense claims. data.js has
 *      215. sync-index-venue-count.js is hard-coded to the even older 158, so
 *      nothing was fixing 157. `changelog/` is skipped on purpose — those
 *      numbers are historical records, not claims.
 *
 * Both the shipped HTML and the emitting templates are patched, so the next
 * build does not reintroduce any of it.
 *
 * Idempotent. Run from repo root: node scripts/polish-design-2026.js
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

/* ---- Replacements applied to BOTH shipped HTML and emitting templates ---- */
const SHARED = [
  // 1. Oversized hero H1
  ['font-size:clamp(40px,8vw,96px)', 'font-size:clamp(30px,5vw,48px)'],
  // 2. Centred body columns
  ['<article class="venue-body" style="max-width:880px; margin:0 auto;">', '<article class="venue-body" style="max-width:880px;">'],
  ['<div class="hero-inner" style="max-width:var(--max); margin:0 auto;">', '<div class="hero-inner">'],
  ['<div class="wrap" style="max-width:var(--max); margin:0 auto;">', '<div class="wrap">'],
  // 3. Breadcrumb parity
  ['<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);">', '<nav aria-label="Breadcrumb" class="site-breadcrumb">'],
  ['<span style="color:var(--hint); margin:0 8px;">/</span>', '<span class="u-crumb-sep">/</span>'],
  ['<span style="color:var(--text); font-weight:600;">', '<span class="u-text-bold">'],
  ['<a href="/" style="color:var(--muted);">Home</a>', '<a href="/" class="u-muted">Home</a>'],
  ['<a href="/guides/" style="color:var(--muted);">Guides</a>', '<a href="/guides/" class="u-muted">Guides</a>'],
  // 4. Emoji used as icons
  ['⭐ ', ''], ['🕐 ', ''], ['📍 ', ''], ['💰 ', ''], ['✎ ', ''],
  ['⭐', ''], ['🕐', ''], ['📍', ''], ['💰', ''], ['✎', '']
];

/* ---- Stale sitewide count. Present-tense claims only. ----
   Every pattern requires a space or hyphen after the digits, which is what
   keeps them off phone numbers (+66815781199) and Facebook profile IDs
   (61575569020794) — both of which contain the substring "157".
   `changelog/` is excluded by the caller: those numbers are historical. */
const STALE = ['157', '158'];
const COUNT_SUFFIXES = [
  ' venues', ' Venues', ' verified', ' hand-checked', ' listings', ' Listings',
  ' gyms', ' Pattaya', ' entries', ' sport venues', ' venue pages',
  '-venue', '-entry', '-directory', '-listing'
];
const COUNT_FIXES = [];
for (const old of STALE) {
  if (old === String(N)) continue;
  for (const suffix of COUNT_SUFFIXES) {
    COUNT_FIXES.push([old + suffix, N + suffix]);
  }
}

/* ---- Templates that emit the offending markup ---- */
const TEMPLATES = [
  'build-v2.js',
  'scripts/lib/editorial-guide-shell.js',
  'scripts/lib/tool-chrome.js',
  'scripts/build-compare-page.js',
  'scripts/build-plan-page.js',
  'scripts/build-favorites-page.js',
  'scripts/write-changelog.js',
  'scripts/write-new-guides.js',
  'scripts/write-training-holiday-guide.js',
  'scripts/migrate-legacy-guides-chrome.js',
  'scripts/rebuild-tool-stubs.js'
];

function applyAll(text, pairs) {
  let out = text, hits = 0;
  for (const [from, to] of pairs) {
    if (!out.includes(from)) continue;
    hits += out.split(from).length - 1;
    out = out.split(from).join(to);
  }
  return { out, hits };
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

// --- Templates first, so a later build agrees with the swept HTML ---
let tplFiles = 0, tplHits = 0;
for (const rel of TEMPLATES) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) continue;
  const src = fs.readFileSync(fp, 'utf8');
  const { out, hits } = applyAll(src, SHARED);
  if (out !== src) { fs.writeFileSync(fp, out, 'utf8'); tplFiles++; tplHits += hits; }
}

// --- Then the shipped HTML ---
const CHANGELOG = path.join(ROOT, 'changelog') + path.sep;
let htmlChanged = 0, sharedHits = 0, countHits = 0;
for (const file of htmlFiles(ROOT)) {
  const orig = fs.readFileSync(file, 'utf8');
  let html = orig;

  const a = applyAll(html, SHARED);
  html = a.out; sharedHits += a.hits;

  // Historical numbers in the changelog are records, not claims.
  if (!file.startsWith(CHANGELOG)) {
    const b = applyAll(html, COUNT_FIXES);
    html = b.out; countHits += b.hits;
  }

  if (html !== orig) { fs.writeFileSync(file, html, 'utf8'); htmlChanged++; }
}

console.log(
  `polish-design-2026: templates ${tplFiles} files / ${tplHits} edits · ` +
  `html ${htmlChanged} files / ${sharedHits} layout+icon edits / ${countHits} count fixes (-> ${N})`
);
