#!/usr/bin/env node
/**
 * check-record-originality.js — enrich-loop gate
 *
 * Added 2026-07-28 after runs 39-42 appended the same six boilerplate sections to
 * 24 venue records and the §7 self-check passed all 24. That check tested headings,
 * word count, source count and first-hand claims; padding satisfies every one of them.
 *
 * This gate tests the thing that actually failed: whether the words are about THIS venue.
 *
 *   node scripts/check-record-originality.js <id> <id> ...
 *
 * Fails on:
 *   1. two records sharing a passage — 2+ sentences, or one 15+ word sentence
 *   2. three or more touched records gaining an identical number of words
 *      (a constant delta means one template, not research; two can be coincidence)
 *   3. a record whose additions carry no digit — no price, no time, no date, no
 *      street number. Enrichment that adds no number added no fact.
 *   4. a stray markdown artifact: a line that is a lone + or -
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const MIN_SENTENCE_WORDS = 8;
const MIN_TEMPLATE_GROUP = 3;
const MIN_SHARED_SENTENCES = 2;
const LONG_SENTENCE_WORDS = 15;
const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('usage: node scripts/check-record-originality.js <id> [<id> ...]');
  process.exit(2);
}

const body = (t) => t.replace(/^---[\s\S]*?---/, '');
const words = (t) => (t.match(/\b[\p{L}0-9][\p{L}0-9'-]*/gu) || []).length;
// Headings, list bullets and front-matter keys are template by design — the six H2s
// are mandated by CODEX-GYM-ENRICH-LOOP.md §3. Only prose sentences are compared.
const sentences = (t) =>
  body(t)
    .split(/\n/)
    .filter((l) => !/^\s*(#{1,6}\s|[-*+>]\s|\||```)/.test(l))
    .join('\n')
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter((s) => s.split(' ').length >= MIN_SENTENCE_WORDS);

function atHead(rel) {
  try {
    return execFileSync('git', ['show', 'HEAD:' + rel], { encoding: 'utf8', maxBuffer: 1 << 26 });
  } catch {
    return null;
  }
}

const problems = [];

// --- build a sentence index over every venue record on disk ---------------
const allFiles = fs
  .readdirSync('venues')
  .filter((f) => f.endsWith('.md'))
  .map((f) => path.posix.join('venues', f));

const seen = new Map(); // sentence -> [file, ...]
for (const f of allFiles) {
  const t = fs.readFileSync(f, 'utf8');
  for (const s of new Set(sentences(t))) {
    if (!seen.has(s)) seen.set(s, []);
    seen.get(s).push(f);
  }
}

// --- 1. cross-record sentence reuse ---------------------------------------
// Two records can land on the same short factual line by honest coincidence —
// "No current operator tariff was found on 27 July 2026" is the pattern §3 asks
// for, and two venues checked the same day will write it the same way. What is
// never coincidence is a shared PASSAGE. So a pair is flagged only when it shares
// two or more sentences, or one sentence long enough that nobody writes it twice.
for (const id of ids) {
  const f = path.posix.join('venues', id + '.md');
  if (!fs.existsSync(f)) problems.push(`MISSING  ${f}`);
}

const pairs = new Map(); // "fileA\u0000fileB" -> [shared sentence, ...]
for (const [sentence, files] of seen) {
  if (files.length < 2) continue;
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const key = files[i] + '\u0000' + files[j];
      if (!pairs.has(key)) pairs.set(key, []);
      pairs.get(key).push(sentence);
    }
  }
}

const touched = new Set(ids.map((id) => path.posix.join('venues', id + '.md')));
for (const [key, shared] of pairs) {
  const [a, b] = key.split('\u0000');
  if (!touched.has(a) && !touched.has(b)) continue;
  const long = shared.filter((x) => x.split(' ').length >= LONG_SENTENCE_WORDS);
  if (shared.length < MIN_SHARED_SENTENCES && long.length === 0) continue;
  const na = path.basename(a, '.md');
  const nb = path.basename(b, '.md');
  const why =
    shared.length >= MIN_SHARED_SENTENCES
      ? `share ${shared.length} sentences — that is a passage, not a coincidence`
      : `share a ${long[0].split(' ').length}-word sentence verbatim`;
  const show = (long.length ? long : shared).slice(0, 3);
  problems.push(
    `REUSED   ${na} and ${nb} ${why}\n` +
      show.map((x) => `           "${x.slice(0, 110)}${x.length > 110 ? '…' : ''}"`).join('\n') +
      (shared.length > show.length ? `\n           …and ${shared.length - show.length} more` : '')
  );
}

// --- 2. identical word deltas across the run ------------------------------
const deltas = new Map(); // delta -> [id, ...]
for (const id of ids) {
  const rel = path.posix.join('venues', id + '.md');
  if (!fs.existsSync(rel)) continue;
  const before = atHead(rel);
  if (before === null) continue; // new record, nothing to compare
  const d = words(body(fs.readFileSync(rel, 'utf8'))) - words(body(before));
  if (!deltas.has(d)) deltas.set(d, []);
  deltas.get(d).push(id);
}
for (const [d, group] of deltas) {
  // Two records can coincidentally land on the same delta. Three cannot.
  if (group.length >= MIN_TEMPLATE_GROUP && d !== 0) {
    problems.push(
      `TEMPLATE ${group.length} records each gained exactly ${d} words — that is one block of ` +
        `text pasted ${group.length} times, not ${group.length} pieces of research\n` +
        `           ${group.join(', ')}`
    );
  }
}

// --- 3. additions that contain no number ----------------------------------
for (const id of ids) {
  const rel = path.posix.join('venues', id + '.md');
  if (!fs.existsSync(rel)) continue;
  const before = atHead(rel);
  if (before === null) continue;
  const oldSet = new Set(sentences(before));
  const added = sentences(fs.readFileSync(rel, 'utf8')).filter((s) => !oldSet.has(s));
  if (!added.length) continue;
  const withNumber = added.filter((s) => /\d/.test(s)).length;
  if (withNumber === 0) {
    problems.push(
      `NO FACTS ${id} — ${added.length} new sentences, not one contains a number. ` +
        `No price, time, date or address was added.`
    );
  }
}

// --- 4. stray markdown artifacts ------------------------------------------
for (const id of ids) {
  const rel = path.posix.join('venues', id + '.md');
  if (!fs.existsSync(rel)) continue;
  const lines = fs.readFileSync(rel, 'utf8').split(/\r?\n/);
  lines.forEach((l, i) => {
    if (/^[+-]$/.test(l.trim()) && l.trim().length === 1) {
      problems.push(`ARTIFACT ${id}:${i + 1} — stray "${l.trim()}" on its own line (diff paste leftover)`);
    }
  });
}

if (problems.length) {
  console.log('check-record-originality: FAIL\n');
  for (const p of problems) console.log('  ' + p);
  console.log(
    `\n${problems.length} problem(s). Rewrite the flagged records with venue-specific, sourced ` +
      `detail, or shorten them honestly. Do not paste the same paragraph twice.`
  );
  process.exit(1);
}

console.log(`check-record-originality: PASS — ${ids.length} record(s), no reused sentences, no template deltas`);
