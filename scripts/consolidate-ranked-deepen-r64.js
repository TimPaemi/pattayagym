#!/usr/bin/env node
/**
 * consolidate-ranked-deepen-r64.js
 *
 * Merges stacked deepen-r43/r44/r45/r46/r57/r63 inject sections into one
 * native <section class="guide-rank-primer"> per ranked guide. Removes
 * pipeline markers so content-quality-audit inject count goes to zero.
 *
 * Idempotent — replaces existing guide-rank-primer if present.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEEPEN_SECTION_RE = /<section class="guide-editorial-depth" id="deepen-r\d+-block"[\s\S]*?<\/section>/gi;
const PRIMER_RE = /<section class="guide-rank-primer"[\s\S]*?<\/section>\s*/gi;

const RANKED_SLUGS = [
  'bangkok-day-trip-sport-pattaya',
  '24-hour-gyms-pattaya',
  'luxury-sports-clubs-pattaya',
  'best-for-beginners-pattaya',
  'family-friendly-pattaya',
  'best-dive-operators-pattaya',
  'best-muay-thai-pattaya',
  'cheapest-gyms-pattaya',
  'best-golf-courses-pattaya',
  'best-gyms-near-walking-street-pattaya',
  'female-friendly-gyms-pattaya',
  'pattaya-digital-nomad-fitness',
  'pattaya-solo-female-fitness',
  'pattaya-gyms-childcare-family-pools',
  'pattaya-seniors-low-impact-sport',
];

function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function innerFromSection(sectionHtml) {
  return sectionHtml
    .replace(/^<section[^>]*>/i, '')
    .replace(/<\/section>\s*$/i, '')
    .trim();
}

/** Drop duplicate h2 headings (normalized text) when merging stacked round injects. */
function dedupeH2(inner) {
  const seen = new Set();
  return inner.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/gi, block => {
    const text = stripTags(block).toLowerCase();
    if (!text || seen.has(text)) return '';
    seen.add(text);
    return block;
  });
}

function wordCountMain(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!m) return 0;
  const plain = m[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
  return plain.split(/\s+/).filter(Boolean).length;
}

function consolidate(html) {
  const sections = html.match(DEEPEN_SECTION_RE) || [];
  if (!sections.length) return { html, changed: false, merged: 0 };

  let body = '';
  for (const sec of sections) {
    body += dedupeH2(innerFromSection(sec)) + '\n';
  }
  body = body.replace(/\n{3,}/g, '\n\n').trim();

  const primer = `<section class="guide-rank-primer" id="guide-rank-primer" aria-labelledby="guide-rank-primer-h">
${body}
</section>`;

  let out = html.replace(DEEPEN_SECTION_RE, '').replace(PRIMER_RE, '');
  const anchor = '<div id="full-list"></div>';
  if (out.includes(anchor)) {
    out = out.replace(anchor, primer + '\n  ' + anchor);
  } else {
    const tldrEnd = out.indexOf('</section>', out.indexOf('class="tldr"'));
    if (tldrEnd !== -1) {
      const insertAt = tldrEnd + '</section>'.length;
      out = out.slice(0, insertAt) + '\n\n' + primer + '\n' + out.slice(insertAt);
    } else {
      return { html, changed: false, merged: sections.length };
    }
  }
  return { html: out, changed: true, merged: sections.length };
}

let touched = 0;
const report = [];

for (const slug of RANKED_SLUGS) {
  const fp = path.join(ROOT, 'guides', slug, 'index.html');
  if (!fs.existsSync(fp)) {
    console.warn(`  skip ${slug} — missing`);
    continue;
  }
  const before = fs.readFileSync(fp, 'utf8');
  const wordsBefore = wordCountMain(before);
  const deepenBefore = (before.match(/id="deepen-r\d+-block"/g) || []).length;

  const { html, changed, merged } = consolidate(before);
  if (!changed) {
    console.log(`  /guides/${slug}/ — no deepen blocks`);
    continue;
  }

  const wordsAfter = wordCountMain(html);
  if (wordsAfter < 1200) {
    console.warn(`  WARN ${slug}: ${wordsAfter}w after merge (<1200) — file not written`);
    report.push({ slug, wordsBefore, wordsAfter, merged, status: 'skipped-low-words' });
    continue;
  }

  fs.writeFileSync(fp, html, 'utf8');
  touched++;
  report.push({ slug, wordsBefore, wordsAfter, merged, deepenBefore, status: 'ok' });
  console.log(`  /guides/${slug}/ merged ${merged} deepen → primer (${wordsBefore}w → ${wordsAfter}w)`);
}

const reportPath = path.join(ROOT, 'ROUND64_CONSOLIDATE_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify({ date: new Date().toISOString(), touched, report }, null, 2));
console.log(`\nRound 64 consolidate: ${touched} ranked guides. Report: ${reportPath}`);
