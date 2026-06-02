#!/usr/bin/env node
/**
 * write-depth-status-r64.js — Human-readable depth + integrity status after Round 64.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TODAY = new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, `DEPTH_STATUS_${TODAY}.md`);

function fileKb(rel) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) return null;
  return (fs.statSync(fp).size / 1024).toFixed(1);
}

function stripMainWords(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!m) return 0;
  const plain = m[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
  return plain.split(/\s+/).filter(Boolean).length;
}

const guidesDir = path.join(ROOT, 'guides');
const slugs = fs.readdirSync(guidesDir, { withFileTypes: true })
  .filter(e => e.isDirectory() && fs.existsSync(path.join(guidesDir, e.name, 'index.html')))
  .map(e => e.name);

const rows = slugs.map(slug => {
  const html = fs.readFileSync(path.join(guidesDir, slug, 'index.html'), 'utf8');
  const words = stripMainWords(html);
  const deepen = (html.match(/id="deepen-r\d+-block"/g) || []).length;
  const primer = html.includes('guide-rank-primer');
  const ranked = html.includes('cat-venue-grid');
  return { slug, words, tier: words >= 1200 ? 'A' : words >= 700 ? 'B' : 'C', deepen, primer, ranked };
});

const tierA = rows.filter(r => r.tier === 'A').length;
const tierB = rows.filter(r => r.tier === 'B').length;
const deepenLeft = rows.filter(r => r.deepen > 0);
const primerCount = rows.filter(r => r.primer).length;

let consolidateReport = null;
const crPath = path.join(ROOT, 'ROUND64_CONSOLIDATE_REPORT.json');
if (fs.existsSync(crPath)) {
  consolidateReport = JSON.parse(fs.readFileSync(crPath, 'utf8'));
}

const lines = [
  `# Depth & integrity status — ${TODAY}`,
  '',
  'Generated after Round 64 (consolidate ranked deepen blocks + full gate).',
  '',
  '## Executive summary',
  '',
  `| Metric | Value |`,
  `|--------|------:|`,
  `| Guides total | ${rows.length} |`,
  `| Tier A (≥1200 words in main) | ${tierA} |`,
  `| Tier B | ${tierB} |`,
  `| Ranked guides with guide-rank-primer | ${primerCount} |`,
  `| Ranked guides with legacy deepen-rNN blocks | ${deepenLeft.length} |`,
  '',
  '## Why deepen blocks existed',
  '',
  'Rounds 43–46, 57, and 63 appended `<section class="guide-editorial-depth" id="deepen-rNN-block">` chunks before `#full-list` so ranked guides gained word count and internal links without rewriting the ranked list generator. Stacking r46 + r63 on Bangkok (and similar pairs) inflated the audit "inject×2" flag and duplicated h2 topics (Muay Thai stadiums, golf).',
  '',
  '## Round 64 fix',
  '',
  '`scripts/consolidate-ranked-deepen-r64.js` merges all deepen-rNN sections into one `<section class="guide-rank-primer">`, dedupes duplicate h2 titles, and deletes the pipeline markers. Content stays in-page; only the implementation pattern changes.',
  '',
];

if (consolidateReport) {
  lines.push('## Consolidation run', '', '| Slug | Deepen before | Words before | Words after | Status |', '|------|---------------:|-------------:|------------:|--------|');
  for (const r of consolidateReport.report) {
    lines.push(`| ${r.slug} | ${r.deepenBefore ?? '—'} | ${r.wordsBefore} | ${r.wordsAfter ?? '—'} | ${r.status} |`);
  }
  lines.push('');
}

lines.push(
  '## Heavy HTML (tool pages)',
  '',
  '| Page | Size (KB) | Note |',
  '|------|----------:|------|',
  `| compare/index.html | ${fileKb('compare/index.html') ?? '—'} | Embedded venue JSON for client filter |`,
  `| plan-my-trip/index.html | ${fileKb('plan-my-trip/index.html') ?? '—'} | Embedded venue JSON for trip planner |`,
  '',
  'These are intentional single-file tools; splitting JSON to `/data/` would shrink HTML but add a fetch and CSP surface. Deferred unless LCP budget forces it.',
  '',
  '## Remaining deepen-rNN (should be empty post-R64)',
  ''
);

if (deepenLeft.length === 0) {
  lines.push('None — all ranked inject markers consolidated.');
} else {
  for (const r of deepenLeft) {
    lines.push(`- \`/guides/${r.slug}/\` — ${r.deepen} block(s), ${r.words}w`);
  }
}

lines.push(
  '',
  '## Thinnest guides (watch list)',
  ''
);

const thin = rows.filter(r => r.tier === 'A').sort((a, b) => a.words - b.words).slice(0, 8);
for (const r of thin) {
  lines.push(`- **${r.words}w** \`/guides/${r.slug}/\` ${r.ranked ? '(ranked)' : '(editorial)'}`);
}

lines.push(
  '',
  '## Gates to run before every ship',
  '',
  '```cmd',
  'node scripts/consolidate-ranked-deepen-r64.js',
  'node build-v2.js',
  'node scripts/inject-guide-schema.js',
  'node scripts/verify-deploy.js',
  'npm run html:validate',
  'node scripts/content-quality-audit.js',
  'node scripts/full-site-audit.js',
  '```',
  '',
  '---',
  '*Re-run `node scripts/write-depth-status-r64.js` after content rounds.*'
);

fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`Wrote ${OUT}`);
