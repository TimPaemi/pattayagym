#!/usr/bin/env node
'use strict';
/**
 * annotate-thai-lang.js - S2-H3, WCAG 2.2 Language of Parts (3.1.2).
 *
 * Six pages show Thai script inside otherwise English prose: five venue records
 * giving the operator's Thai name, and /guides/thai-gym-terms-pattaya/, a table
 * of Thai phrases. Twenty-eight visible runs, and not one lang="th" anywhere on
 * the site. A screen reader voices those letters with English pronunciation
 * rules, producing noise rather than a Thai name.
 *
 * WHY THIS IS A SWEEP AND NOT ONLY A SOURCE FIX
 * ---------------------------------------------
 * build-v2.js wraps Thai in the venue Markdown it renders, which covers the five
 * venue pages. The guide is different: it is written by
 * scripts/write-round62-tier-b.js from scripts/guide-bodies/thai-gym-terms.js,
 * and that writer is NOT in the ship chain. Its page on disk is a surviving
 * artifact of an old run, so editing the source changed nothing at all. Anything
 * that must hold on every shipped page has to be enforced over shipped pages.
 *
 * The character class is built from code points rather than written literally,
 * so this file stays ASCII and cannot be corrupted by a bad save - the same
 * failure mode verify-encoding.js exists to catch.
 *
 * Thai letters and marks are U+0E01-U+0E3A and U+0E40-U+0E5B. U+0E3F, the baht
 * sign, falls in the gap between those two ranges and is therefore excluded on
 * purpose: a price written with that symbol sits in an English sentence, and
 * marking 1,900+ price strings as Thai would be worse than doing nothing.
 *
 * Idempotent: script/style bodies and already-annotated runs are masked out
 * before matching, and the mask uses NUL, which cannot occur in valid HTML.
 *
 * Run: node scripts/annotate-thai-lang.js   (listed in scripts/ship-chain.json)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['.git', 'node_modules', '.internal-docs', '.backups', 'packages',
  '.wrangler', '.cursor', '.github', 'dist', 'tmp', 'private', 'research', 'docs']);

const cp = String.fromCharCode;
const THAI_CLASS = '[' + cp(0x0E01) + '-' + cp(0x0E3A) + cp(0x0E40) + '-' + cp(0x0E5B) + ']';
const SEP = '[ ' + cp(0x00A0) + ']';
const THAI_PHRASE = new RegExp(THAI_CLASS + '+(?:' + SEP + '+' + THAI_CLASS + '+)*', 'g');
const HAS_THAI = new RegExp(THAI_CLASS);
const MASK = cp(0);

function walk(dir, out) {
  out = out || [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (/\.html$/i.test(e.name)) out.push(f);
  }
  return out;
}

function annotate(html) {
  const held = [];
  const hold = (m) => MASK + (held.push(m) - 1) + MASK;

  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, hold)
    .replace(/<style[\s\S]*?<\/style>/gi, hold)
    .replace(/<([a-z]+)\b[^>]*\blang="th"[^>]*>[\s\S]*?<\/\1>/gi, hold);

  let wrapped = 0;
  s = s.split(/(<[^>]*>)/).map(function (seg) {
    if (seg.charAt(0) === '<') return seg;
    return seg.replace(THAI_PHRASE, function (m) {
      wrapped++;
      return '<span lang="th">' + m + '</span>';
    });
  }).join('');

  s = s.replace(new RegExp(MASK + '(\\d+)' + MASK, 'g'), function (_, i) { return held[Number(i)]; });
  return { html: s, wrapped: wrapped };
}

let files = 0, runs = 0;
for (const f of walk(ROOT)) {
  const orig = fs.readFileSync(f, 'utf8');
  if (!HAS_THAI.test(orig)) continue;
  const res = annotate(orig);
  if (res.wrapped && res.html !== orig) {
    fs.writeFileSync(f, res.html, 'utf8');
    files++; runs += res.wrapped;
  }
}
console.log('thai lang: ' + runs + ' visible Thai run(s) annotated across ' + files + ' page(s).');
