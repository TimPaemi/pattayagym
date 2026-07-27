#!/usr/bin/env node
/**
 * GATE: no mojibake anywhere in the repo.
 *
 * SCOPE: pattaya-gym.com only. Hardcoded to this repo by design. Do not add a
 * site switch and do not copy it out to another repo.
 *
 * WHY THIS EXISTS
 * ---------------
 * On 2026-07-27 at 12:29 something re-saved data.js, build-v2.js and
 * build-discovery.js reading UTF-8 through a single-byte Windows codepage. A
 * build at 15:01 propagated the damage into 306 output files - all 215 venue
 * pages, every area and category hub, all four JSON APIs. Every price on the
 * site would have shipped as a three-character run instead of a baht sign.
 *
 * Every other gate passed. validate.js was clean, verify-deploy PASSED,
 * seo-audit PASSED, html-validate was clean, the sitemap aligned perfectly.
 * Mojibake is well-formed valid UTF-8 - structurally perfect and semantically
 * garbage. Only a human reading the page can see it, and by then it is live.
 *
 * That is the whole argument for this gate. It is cheap, it is boring, and it is
 * the only thing standing between a bad save and 215 broken price tags.
 *
 * The most likely source is a tool writing the file without an explicit UTF-8
 * encoding: PowerShell 5.1's Set-Content and > default to the system ANSI
 * codepage, and any editor guessing Windows-1252 does the same. If this fires
 * again, look at what last touched the named file.
 *
 * USAGE
 *   node scripts/verify-encoding.js          check, non-zero exit if corrupt
 *   node scripts/verify-encoding.js --fix    repair in place, then re-check
 *
 * Repair is safe on partially damaged files: it only rewrites a run that decodes
 * cleanly and shortens, so correctly-encoded characters sitting next to broken
 * ones are left alone. See scripts/lib/mojibake.js for the reasoning.
 */
const fs = require('fs');
const path = require('path');
const { repair, count } = require('./lib/mojibake.js');

const ROOT = path.resolve(__dirname, '..');
const FIX = process.argv.includes('--fix');

const SKIP_DIRS = new Set(['node_modules', '.git', 'packages', 'fonts', 'og', 'brand']);
const EXT = /\.(js|mjs|cjs|md|json|html|xml|txt|css|ps1|cmd|csv)$/i;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
      walk(p);
    } else if (EXT.test(e.name)) {
      files.push(p);
    }
  }
})(ROOT);

const hits = [];
for (const p of files) {
  let text;
  try { text = fs.readFileSync(p, 'utf8'); } catch { continue; }
  const n = count(text);
  if (n) hits.push({ p, rel: path.relative(ROOT, p).replace(/\\/g, '/'), n, text });
}

console.log(`verify-encoding: ${files.length} text files scanned`);

if (!hits.length) {
  console.log('\n  no mojibake, no replacement characters, no stray C1 controls   OK');
  console.log('\nverify-encoding: PASS');
  process.exit(0);
}

const bar = '-'.repeat(72);
console.log('\n' + bar);
console.log(`MOJIBAKE - ${hits.length} file(s) were saved through the wrong codepage`);
console.log(bar);

/* Group by whether the file is a source or something the build regenerates, so
   the fix order is obvious: repair sources, rebuild, and the rest follows. */
const OUTPUT_DIR = /^(gyms|area|category|api|data|sports|press|about|contact|terms|privacy|colophon|methodology|add-your-gym|pattaya-sport-stats|search|map|compare|plan-my-trip|favorites|find-my-coach|guides|changelog|feed|authors|private|research|tmp)\//;
const sources = hits.filter(h => !OUTPUT_DIR.test(h.rel));
const outputs = hits.filter(h => OUTPUT_DIR.test(h.rel));

if (sources.length) {
  console.log(`\n  SOURCE FILES (${sources.length}) - fix these, everything else is downstream:`);
  for (const h of sources.sort((a, b) => b.n - a.n)) console.log(`    ${String(h.n).padStart(5)}  ${h.rel}`);
}
if (outputs.length) {
  console.log(`\n  BUILD OUTPUT (${outputs.length}) - regenerated once the sources are clean:`);
  for (const h of outputs.sort((a, b) => b.n - a.n).slice(0, 10)) console.log(`    ${String(h.n).padStart(5)}  ${h.rel}`);
  if (outputs.length > 10) console.log(`    ... and ${outputs.length - 10} more`);
}

if (!FIX) {
  console.log('\n  FIX:  node scripts/verify-encoding.js --fix');
  console.log('        then rebuild, then run this again.');
  console.log('\n  Then find what wrote the source files - a tool saving without an');
  console.log('  explicit UTF-8 encoding will do it again on the next run.');
  console.log('\nverify-encoding: FAIL');
  process.exit(1);
}

console.log('\n  repairing...');
let repaired = 0;
const stubborn = [];
for (const h of hits) {
  const fixed = repair(h.text);
  if (fixed === h.text) { stubborn.push(h); continue; }
  /* Safety: the ASCII skeleton must be untouched. If a repair would alter any
     ASCII byte it is not an encoding repair, and we do not write it. */
  const ascii = s => s.replace(/[^\x00-\x7F]/g, '');
  if (ascii(fixed) !== ascii(h.text)) { stubborn.push(h); continue; }
  fs.writeFileSync(h.p, fixed, 'utf8');
  repaired++;
}
console.log(`  repaired ${repaired} file(s)`);

if (stubborn.length) {
  console.log(`\n  ${stubborn.length} file(s) could NOT be repaired automatically:`);
  for (const h of stubborn) console.log(`    ${h.rel}`);
  console.log('  These need a look by hand - characters may already be lost.');
  process.exit(1);
}

console.log('\n  Now rebuild, then run this gate again.');
process.exit(1);   // non-zero on purpose: files changed, the run must be repeated
