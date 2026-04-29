#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const VENUE_DIR = path.join(ROOT, 'venues');
const OUT_DEFAULT = path.join(ROOT, 'CONTENT_AUDIT_2026-04-29.md');
const TODAY = new Date().toISOString().slice(0, 10);

const TYPO_PATTERNS = [
  { pattern: /\bSitiodtong\b/gi, suggestion: 'Sityodtong' },
  { pattern: /\bSityodong\b/gi, suggestion: 'Sityodtong' },
  { pattern: /\bSityodtng\b/gi, suggestion: 'Sityodtong' },
  { pattern: /\bJomiten\b/gi, suggestion: 'Jomtien' },
  { pattern: /\bJomtein\b/gi, suggestion: 'Jomtien' },
  { pattern: /\bPratamnak\b/gi, suggestion: 'Pratumnak or Pratamnak - pick one style per page' }
];

const US_STYLE_REVIEW = [
  /\bcenter\b/gi,
  /\bcenters\b/gi,
  /\bprogram\b/gi,
  /\bprograms\b/gi,
  /\bfavorite\b/gi,
  /\bbehavior\b/gi,
  /\bcolor\b/gi,
  /\bcustomize\b/gi,
  /\borganize\b/gi,
  /\bspecialize\b/gi,
  /\boptimize\b/gi
];

const EXTERNAL_CHECKS = {
  'pickleball-pattaya': 'Checked 2026-04-29: official site confirms Pratumnak Soi 6 and daily 07:00-21:00; Pattaya Sports Club also lists Pickleball Pattaya on Pratumnak Soi 6.',
  'coco-fitness': 'Checked 2026-04-29: Global Gym Bunny source lists 4th floor, Mike Shopping Mall, 262 Beach Road, opening 07:00-23:00 and published walk-in/monthly pricing.',
  'max-muay-thai-stadium': 'Checked 2026-04-29: muaythaistadium.com lists MAX near King Power with ticket times by date, 42/108 Sukhumvit address and +66 80 471 6008 contact.'
};

function readVenueFiles() {
  return fs.readdirSync(VENUE_DIR)
    .filter(file => file.endsWith('.md'))
    .sort()
    .map(file => {
      const fullPath = path.join(VENUE_DIR, file);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (!match) return { file, fullPath, raw, body: raw, frontmatter: {}, sources: [] };
      return {
        file,
        fullPath,
        raw,
        body: match[2],
        frontmatter: parseFrontmatter(match[1]),
        sources: parseSources(match[1])
      };
    });
}

function parseFrontmatter(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    out[match[1]] = unquote(match[2].trim());
  }
  return out;
}

function parseSources(text) {
  const lines = text.split(/\r?\n/);
  const sources = [];
  let inSources = false;
  for (const line of lines) {
    if (/^sources:\s*$/.test(line)) {
      inSources = true;
      continue;
    }
    if (inSources && /^\S/.test(line)) break;
    if (inSources) {
      const match = line.match(/^\s*-\s*(\S+)/);
      if (match) sources.push(match[1]);
    }
  }
  return sources;
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function seededSample(items, count) {
  let seed = 20260429;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  }
  return items
    .map(item => ({ item, rank: rnd() }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, count)
    .map(entry => entry.item);
}

function stripUrls(text) {
  return text.replace(/https?:\/\/\S+/g, '');
}

function findTypoHits(venues) {
  const hits = [];
  for (const venue of venues) {
    const body = stripUrls(venue.body);
    const lines = body.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      for (const item of TYPO_PATTERNS) {
        if (item.pattern.test(lines[i])) {
          hits.push({
            file: venue.file,
            line: i + 1,
            match: lines[i].trim().slice(0, 180),
            suggestion: item.suggestion
          });
        }
        item.pattern.lastIndex = 0;
      }
    }
  }
  return hits;
}

function countUsStyle(venues) {
  const counts = new Map();
  for (const venue of venues) {
    const text = stripUrls(venue.body);
    for (const pattern of US_STYLE_REVIEW) {
      const matches = text.match(pattern);
      if (!matches) continue;
      const key = pattern.source.replace(/\\b/g, '').replace(/\\/g, '');
      counts.set(key, (counts.get(key) || 0) + matches.length);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function imageAudit(venues) {
  const categories = new Set(venues.map(v => v.frontmatter.category).filter(Boolean));
  const categoryMissing = [...categories].sort().filter(cat => !hasAnyImage(path.join(ROOT, 'images', 'categories', cat)));
  const venueMissing = venues.filter(venue => !hasAnyImage(path.join(ROOT, 'images', 'venues', venue.frontmatter.id || path.basename(venue.file, '.md'))));
  return { categoryMissing, venueMissing };
}

function hasAnyImage(basePath) {
  return ['.webp', '.jpg', '.jpeg', '.png', '.avif'].some(ext => fs.existsSync(basePath + ext));
}

function markdownTable(rows, columns) {
  const header = `| ${columns.map(c => c.title).join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${columns.map(c => cleanCell(c.value(row))).join(' | ')} |`);
  return [header, divider, ...body].join('\n');
}

function cleanCell(value) {
  return String(value == null ? '' : value).replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|');
}

function buildReport() {
  const venues = readVenueFiles();
  const sample = seededSample(venues, 30);
  const typos = findTypoHits(venues);
  const usStyle = countUsStyle(venues);
  const images = imageAudit(venues);

  const lines = [];
  lines.push('# Content Audit - 2026-04-29');
  lines.push('');
  lines.push('Generated by `node scripts/content-audit.js --write`.');
  lines.push('');
  lines.push('## Scope');
  lines.push('');
  lines.push(`- Venue markdown files scanned: ${venues.length}`);
  lines.push('- British-English body pass already applied only to low-risk prose terms such as travellers, specialised, organised, optimised, kilometres and metres.');
  lines.push('- Frontmatter, URLs, brand names and the risky Center/Centre cases are left for manual review so official venue names are not corrupted.');
  lines.push('- Real-world venue verification still requires checking the source website, Google Maps listing or current social page before changing a `verified` date.');
  lines.push('');
  lines.push('## 30-Venue Fact-Check Checklist');
  lines.push('');
  lines.push('Do not mark these rows complete or bump venue frontmatter dates until the address, phone, hours and price tier have been checked against current public sources.');
  lines.push('');
  lines.push(markdownTable(sample, [
    { title: 'Status', value: v => EXTERNAL_CHECKS[v.frontmatter.id] ? 'Checked 2026-04-29' : 'Pending external check' },
    { title: 'Venue', value: v => v.frontmatter.name || v.frontmatter.id || v.file },
    { title: 'File', value: v => `venues/${v.file}` },
    { title: 'Address in source', value: v => v.frontmatter.address || '' },
    { title: 'Phone', value: v => v.frontmatter.phone || '' },
    { title: 'Hours', value: v => v.frontmatter.hours || '' },
    { title: 'Last verified', value: v => v.frontmatter.verified || '' },
    { title: 'Source count', value: v => v.sources.length },
    { title: 'Evidence note', value: v => EXTERNAL_CHECKS[v.frontmatter.id] || '' }
  ]));
  lines.push('');
  lines.push('## Photography Sweep');
  lines.push('');
  lines.push(`- Missing category hero photos: ${images.categoryMissing.length}`);
  lines.push(`- Missing venue photos: ${images.venueMissing.length}`);
  lines.push('- Current OG images are generated social cards, not venue photography. They should not be treated as a substitute for licensed venue/category photos.');
  if (images.categoryMissing.length) {
    lines.push('');
    lines.push('Missing category photo keys:');
    lines.push('');
    for (const cat of images.categoryMissing) lines.push(`- images/categories/${cat}.webp`);
  }
  lines.push('');
  lines.push('## Fuzzy Cross-Reference Audit');
  lines.push('');
  if (!typos.length) {
    lines.push('- No known high-risk typo patterns found.');
  } else {
    lines.push(markdownTable(typos, [
      { title: 'File', value: h => `venues/${h.file}` },
      { title: 'Body line', value: h => h.line },
      { title: 'Snippet', value: h => h.match },
      { title: 'Suggested review', value: h => h.suggestion }
    ]));
  }
  lines.push('');
  lines.push('## Remaining British-English Review Terms');
  lines.push('');
  lines.push('These are intentionally not auto-fixed because many may be official names, schema terms, PADI designations or frontmatter-derived concepts.');
  lines.push('');
  lines.push(markdownTable(usStyle, [
    { title: 'Term pattern', value: row => row[0] },
    { title: 'Remaining body hits', value: row => row[1] }
  ]));
  lines.push('');
  lines.push('## Next Editorial Actions');
  lines.push('');
  lines.push('- Verify the 30 sampled venues against current Google Maps, venue websites or active social pages.');
  lines.push('- Update `verified:` dates only when the current address, hours, phone and price tier have been checked.');
  lines.push('- Source licensed category and venue photography locally under `images/categories/` and `images/venues/` before wiring images into generated pages.');
  lines.push('- Manually review Center/Centre and Program/Programme cases so official names such as PADI Dive Center are not changed incorrectly.');
  lines.push('');
  return lines.join('\n');
}

const report = buildReport();
const writeIndex = process.argv.indexOf('--write');
if (writeIndex !== -1) {
  const outPath = process.argv[writeIndex + 1] ? path.resolve(process.argv[writeIndex + 1]) : OUT_DEFAULT;
  fs.writeFileSync(outPath, report + '\n', 'utf8');
  console.log(`Wrote ${path.relative(ROOT, outPath)} on ${TODAY}`);
} else {
  process.stdout.write(report);
}
