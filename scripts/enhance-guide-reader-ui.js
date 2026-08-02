#!/usr/bin/env node
'use strict';

/**
 * enhance-guide-reader-ui.js
 *
 * Final, server-rendered reader-navigation pass for substantive guide pages.
 * It runs after every guide writer and immediately before the sitemap/content
 * hash ledger. The transform is intentionally guide-only, dependency-free and
 * idempotent: existing heading ids are preserved, generated TOCs are replaced,
 * and tables already carrying the generated scroll-region marker are skipped.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GUIDES_DIR = path.join(ROOT, 'guides');
const TOC_START = '<!-- GUIDE-TOC:START -->';
const TOC_END = '<!-- GUIDE-TOC:END -->';
const MIN_EXPECTED_GUIDES = 47;
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr'
]);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeEntities(value) {
  const named = {
    amp: '&', apos: "'", gt: '>', hellip: '...', laquo: '<<', ldquo: '"',
    lsquo: "'", lt: '<', mdash: '-', nbsp: ' ', ndash: '-', quot: '"',
    raquo: '>>', rdquo: '"', rsquo: "'"
  };
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal) => String.fromCodePoint(parseInt(decimal, 10)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
}

function plainText(html) {
  return decodeEntities(String(html).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifyHeading(label, fallbackIndex) {
  const slug = String(label)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return `section-${slug || fallbackIndex}`;
}

function parseOpenTag(openTag) {
  const match = String(openTag).match(/^<\s*([a-z][\w:-]*)\b([\s\S]*?)\/?\s*>$/i);
  if (!match) throw new Error(`Cannot parse opening tag: ${openTag.slice(0, 120)}`);
  const attrs = [];
  const attrRe = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let attrMatch;
  while ((attrMatch = attrRe.exec(match[2]))) {
    attrs.push({
      name: attrMatch[1],
      value: attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? null
    });
  }
  return { tagName: match[1].toLowerCase(), attrs };
}

function getAttrFromParsed(parsed, name) {
  const wanted = String(name).toLowerCase();
  const attr = parsed.attrs.find(item => item.name.toLowerCase() === wanted);
  return attr ? attr.value : null;
}

function getAttr(nodeOrTag, name) {
  const parsed = typeof nodeOrTag === 'string' ? parseOpenTag(nodeOrTag) : nodeOrTag.parsed;
  return getAttrFromParsed(parsed, name);
}

function setAttr(parsed, name, value) {
  const wanted = String(name).toLowerCase();
  const existing = parsed.attrs.find(item => item.name.toLowerCase() === wanted);
  if (existing) {
    existing.name = name;
    existing.value = String(value);
  } else {
    parsed.attrs.push({ name, value: String(value) });
  }
}

function removeAttr(parsed, name) {
  const wanted = String(name).toLowerCase();
  parsed.attrs = parsed.attrs.filter(item => item.name.toLowerCase() !== wanted);
}

function serializeOpenTag(parsed) {
  const attrs = parsed.attrs.map(attr => {
    if (attr.value == null) return ` ${attr.name}`;
    return ` ${attr.name}="${escapeHtml(attr.value)}"`;
  }).join('');
  return `<${parsed.tagName}${attrs}>`;
}

function classTokens(nodeOrTag) {
  return new Set(String(getAttr(nodeOrTag, 'class') || '').split(/\s+/).filter(Boolean));
}

function addClasses(parsed, classes) {
  const tokens = new Set(String(getAttrFromParsed(parsed, 'class') || '').split(/\s+/).filter(Boolean));
  for (const cls of classes) tokens.add(cls);
  setAttr(parsed, 'class', [...tokens].join(' '));
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  return String(haystack).split(needle).length - 1;
}

function getMainParts(html) {
  const open = /<main\b[^>]*>/i.exec(html);
  if (!open) throw new Error('missing <main>');
  if ((html.match(/<main\b/gi) || []).length !== 1) throw new Error('expected exactly one <main>');
  const innerStart = open.index + open[0].length;
  const closeStart = html.indexOf('</main>', innerStart);
  if (closeStart < 0) throw new Error('missing </main>');
  return {
    before: html.slice(0, innerStart),
    inner: html.slice(innerStart, closeStart),
    after: html.slice(closeStart),
    innerStart
  };
}

function scanElements(fragment) {
  const nodes = [];
  const stack = [];
  const tagRe = /<\/?([a-z][\w:-]*)\b[^>]*>/gi;
  let match;
  while ((match = tagRe.exec(fragment))) {
    const raw = match[0];
    const tag = match[1].toLowerCase();
    if (raw.startsWith('</')) {
      let stackIndex = stack.length - 1;
      while (stackIndex >= 0 && stack[stackIndex].tag !== tag) stackIndex--;
      if (stackIndex < 0) continue;
      const node = stack[stackIndex];
      node.closeStart = match.index;
      node.end = tagRe.lastIndex;
      stack.length = stackIndex;
      continue;
    }

    const node = {
      tag,
      start: match.index,
      openEnd: tagRe.lastIndex,
      openTag: raw,
      parsed: parseOpenTag(raw),
      parent: stack.length ? stack[stack.length - 1] : null,
      closeStart: null,
      end: null
    };
    nodes.push(node);
    const selfClosing = /\/\s*>$/.test(raw) || VOID_TAGS.has(tag);
    if (!selfClosing) stack.push(node);
  }
  return nodes;
}

function collectIdCounts(html) {
  const counts = new Map();
  const re = /\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  let match;
  while ((match = re.exec(html))) {
    const id = match[1] ?? match[2];
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  return counts;
}

function allocateId(base, used) {
  let id = base;
  let suffix = 2;
  while (used.has(id)) id = `${base}-${suffix++}`;
  used.add(id);
  return id;
}

function isEligibleHeading(attrs, label) {
  const parsed = parseOpenTag(`<h2${attrs}>`);
  const classes = new Set(String(getAttrFromParsed(parsed, 'class') || '').split(/\s+/).filter(Boolean));
  const id = getAttrFromParsed(parsed, 'id');
  const normalizedLabel = String(label).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return !classes.has('tldr-title') && id !== 'sister-context-h' && normalizedLabel !== 'go deeper';
}

function ensureEligibleHeadingIds(main, allHtml) {
  const originalIdCounts = collectIdCounts(allHtml);
  const used = new Set(originalIdCounts.keys());
  let eligibleIndex = 0;
  const html = main.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (whole, attrs, inner) => {
    const label = plainText(inner);
    if (!isEligibleHeading(attrs, label)) return whole;
    eligibleIndex++;
    const parsed = parseOpenTag(`<h2${attrs}>`);
    const existing = getAttrFromParsed(parsed, 'id');
    if (existing) {
      if (originalIdCounts.get(existing) !== 1) {
        throw new Error(`eligible heading id is not unique: ${existing}`);
      }
      return whole;
    }
    const id = allocateId(slugifyHeading(label, eligibleIndex), used);
    setAttr(parsed, 'id', id);
    return `${serializeOpenTag(parsed)}${inner}</h2>`;
  });
  if (!eligibleIndex) throw new Error('guide has no eligible section headings');
  return html;
}

function collectEligibleHeadings(main) {
  const headings = [];
  const re = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi;
  let match;
  while ((match = re.exec(main))) {
    const label = plainText(match[2]);
    if (!isEligibleHeading(match[1], label)) continue;
    const id = getAttr(`<h2${match[1]}>`, 'id');
    if (!id) throw new Error(`eligible heading lacks id: ${label}`);
    headings.push({ id, label, start: match.index, end: re.lastIndex });
  }
  return headings;
}

function cleanOverflowStyle(parsed) {
  const style = getAttrFromParsed(parsed, 'style');
  if (!style) return;
  const declarations = style.split(';').map(item => item.trim()).filter(Boolean);
  const kept = declarations.filter(item => {
    const property = item.split(':', 1)[0].trim().toLowerCase();
    return property !== 'overflow-x' && property !== '-webkit-overflow-scrolling';
  });
  if (kept.length) setAttr(parsed, 'style', `${kept.join('; ')};`);
  else removeAttr(parsed, 'style');
}

function isGeneratedTableRegion(node) {
  return node && node.tag === 'section' && getAttr(node, 'data-guide-table') === 'true';
}

function findAncestor(node, predicate) {
  let current = node ? node.parent : null;
  while (current) {
    if (predicate(current)) return current;
    current = current.parent;
  }
  return null;
}

function tableColumnCount(tableHtml) {
  const row = /<tr\b[^>]*>([\s\S]*?)<\/tr>/i.exec(tableHtml);
  return row ? (row[1].match(/<t[hd]\b/gi) || []).length : 0;
}

function stripGeneratedTableUi(main) {
  const nodes = scanElements(main);
  const tables = nodes.filter(node => node.tag === 'table' && node.end != null);
  const patches = [];

  for (const table of tables) {
    let current = table.parent;
    let generatedRoot = null;
    while (current) {
      const generatedBlock = classTokens(current).has('guide-table-block') &&
        getAttr(current, 'data-guide-table-block') === 'true';
      const generatedRegion = getAttr(current, 'data-guide-table') === 'true';
      if (generatedBlock || generatedRegion) generatedRoot = current;
      current = current.parent;
    }
    if (!generatedRoot || generatedRoot.end == null) continue;
    patches.push({
      start: generatedRoot.start,
      end: generatedRoot.end,
      replacement: main.slice(table.start, table.end)
    });
  }

  const unique = [...new Map(patches.map(patch => [`${patch.start}:${patch.end}`, patch])).values()];
  unique.sort((a, b) => b.start - a.start);
  for (let index = 1; index < unique.length; index++) {
    if (unique[index - 1].start < unique[index].end) {
      throw new Error('overlapping generated table wrappers');
    }
  }
  let html = main;
  for (const patch of unique) html = html.slice(0, patch.start) + patch.replacement + html.slice(patch.end);
  return html;
}

function enhanceTables(main, guideSlug, usedIds) {
  const nodes = scanElements(main);
  const tables = nodes.filter(node => node.tag === 'table' && node.end != null);
  const headings = collectEligibleHeadings(main);
  const patches = [];

  for (let index = 0; index < tables.length; index++) {
    const table = tables[index];
    if (findAncestor(table, isGeneratedTableRegion)) continue;

    const tableHtml = main.slice(table.start, table.end);
    const closestHeading = [...headings].reverse().find(heading => heading.start < table.start);
    const label = closestHeading ? closestHeading.label : 'Guide comparison table';
    const regionLabel = `Data table ${index + 1}: ${label}`;
    const hintId = allocateId(`${guideSlug}-table-${index + 1}-hint`, usedIds);
    const columns = tableColumnCount(tableHtml);
    const wideClass = columns >= 5 ? ' is-wide' : '';
    const hint = `<p class="guide-table-hint" id="${escapeHtml(hintId)}">Scroll horizontally to compare every column.</p>`;

    const parent = table.parent;
    const parentClasses = parent ? classTokens(parent) : new Set();
    const parentStyle = parent ? String(getAttr(parent, 'style') || '') : '';
    const promotableParent = parent && parent.tag === 'div' && parent.end != null &&
      (parentClasses.has('guide-price-table-wrap') || parentClasses.has('guide-table-scroll') || /(?:^|;)\s*overflow-x\s*:\s*auto\b/i.test(parentStyle)) &&
      !main.slice(parent.openEnd, table.start).trim() &&
      !main.slice(table.end, parent.closeStart).trim() &&
      tables.filter(candidate => candidate.start > parent.openEnd && candidate.end < parent.closeStart).length === 1;

    let rangeStart = table.start;
    let rangeEnd = table.end;
    const region = `<section class="guide-table-scroll${wideClass}" data-guide-table="true" tabindex="0" aria-label="${escapeHtml(regionLabel)}" aria-describedby="${escapeHtml(hintId)}">${tableHtml}</section>`;
    if (promotableParent) {
      rangeStart = parent.start;
      rangeEnd = parent.end;
    }

    const replacement = `<div class="guide-table-block" data-guide-table-block="true">\n${hint}\n${region}\n</div>`;
    patches.push({ start: rangeStart, end: rangeEnd, replacement });
  }

  patches.sort((a, b) => b.start - a.start);
  for (let index = 1; index < patches.length; index++) {
    if (patches[index - 1].start < patches[index].end) {
      throw new Error('overlapping guide-table transforms');
    }
  }
  let html = main;
  for (const patch of patches) {
    html = html.slice(0, patch.start) + patch.replacement + html.slice(patch.end);
  }
  return html;
}

function tocMarkup(headings) {
  const items = headings.map((heading, index) => {
    const number = String(index + 1).padStart(2, '0');
    return `  <li><a href="#${escapeHtml(heading.id)}"><span class="guide-toc-number" aria-hidden="true">${number}</span><span class="guide-toc-label">${escapeHtml(heading.label)}</span></a></li>`;
  }).join('\n');
  return `${TOC_START}\n<nav class="guide-toc" aria-label="On this page">\n  <p class="guide-toc-title">On this page</p>\n  <ol class="guide-toc-list">\n${items}\n  </ol>\n</nav>\n${TOC_END}\n`;
}

function insertToc(main, headings) {
  const nodes = scanElements(main);
  const tldr = nodes.find(node => node.tag === 'section' && node.end != null && classTokens(node).has('tldr'));
  let insertAt = headings[0].start;
  if (tldr && tldr.start < headings[0].start) {
    insertAt = tldr.end;
    const whitespace = /^\s*/.exec(main.slice(insertAt));
    insertAt += whitespace ? whitespace[0].length : 0;
  }
  const toc = tocMarkup(headings);
  return main.slice(0, insertAt) + toc + main.slice(insertAt);
}

function normalizeGuideCardCtas(main) {
  return main.replace(/<(a|span)\b([^>]*\bclass="[^"]*\bcv-cta\b[^"]*"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (whole, tag, attrs, inner) => {
      const normalized = inner.replace(/\s*(?:→|-&gt;|->)\s*$/i, '');
      return `<${tag}${attrs}>${normalized}</${tag}>`;
    });
}

function validateEnhancedMain(main, guideSlug) {
  if (countOccurrences(main, TOC_START) !== 1 || countOccurrences(main, TOC_END) !== 1) {
    throw new Error(`${guideSlug}: expected one generated TOC marker pair`);
  }
  const headings = collectEligibleHeadings(main);
  const tocMatch = new RegExp(`${TOC_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${TOC_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).exec(main);
  if (!tocMatch) throw new Error(`${guideSlug}: generated TOC cannot be read`);
  const links = [...tocMatch[1].matchAll(/href="#([^"]+)"/g)].map(match => decodeEntities(match[1]));
  if (links.length !== headings.length || links.some((id, index) => id !== headings[index].id)) {
    throw new Error(`${guideSlug}: TOC links do not match eligible headings in document order`);
  }

  const ids = collectIdCounts(main);
  for (const heading of headings) {
    if (ids.get(heading.id) !== 1) throw new Error(`${guideSlug}: heading id is not unique: ${heading.id}`);
  }

  const nodes = scanElements(main);
  const tables = nodes.filter(node => node.tag === 'table' && node.end != null);
  for (const table of tables) {
    const region = findAncestor(table, isGeneratedTableRegion);
    if (!region) throw new Error(`${guideSlug}: table is missing generated scroll region`);
    if (region.tag !== 'section' || getAttr(region, 'tabindex') !== '0' || !getAttr(region, 'aria-label')) {
      throw new Error(`${guideSlug}: table scroll region is missing accessibility attributes`);
    }
    const describedBy = getAttr(region, 'aria-describedby');
    if (!describedBy || ids.get(describedBy) !== 1) {
      throw new Error(`${guideSlug}: table scroll hint is missing or not unique`);
    }
  }
  if (/overflow-x\s*:\s*auto\b/i.test(main)) {
    throw new Error(`${guideSlug}: inline overflow-x:auto remains after table enhancement`);
  }
}

function enhanceGuide(html, guideSlug) {
  const parts = getMainParts(html);
  const tocStarts = countOccurrences(parts.inner, TOC_START);
  const tocEnds = countOccurrences(parts.inner, TOC_END);
  if (tocStarts !== tocEnds) throw new Error('unbalanced generated TOC markers');

  let main = parts.inner.replace(/<!-- GUIDE-TOC:START -->[\s\S]*?<!-- GUIDE-TOC:END -->\r?\n?/g, '');
  main = stripGeneratedTableUi(main);
  main = normalizeGuideCardCtas(main);
  const withoutOldToc = parts.before + main + parts.after;
  main = ensureEligibleHeadingIds(main, withoutOldToc);
  const usedIds = new Set(collectIdCounts(parts.before + main + parts.after).keys());
  main = enhanceTables(main, guideSlug, usedIds);
  const headings = collectEligibleHeadings(main);
  main = insertToc(main, headings);
  validateEnhancedMain(main, guideSlug);
  return parts.before + main + parts.after;
}

function guideFiles() {
  if (!fs.existsSync(GUIDES_DIR)) throw new Error(`missing guides directory: ${GUIDES_DIR}`);
  return fs.readdirSync(GUIDES_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => ({ slug: entry.name, file: path.join(GUIDES_DIR, entry.name, 'index.html') }))
    .filter(entry => fs.existsSync(entry.file))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function run() {
  const files = guideFiles();
  if (files.length < MIN_EXPECTED_GUIDES) {
    throw new Error(`found ${files.length} child guides; expected at least ${MIN_EXPECTED_GUIDES}`);
  }

  // Transform and validate every page before writing any page. A malformed guide
  // therefore cannot leave the directory half-enhanced.
  const outputs = files.map(({ slug, file }) => {
    const before = fs.readFileSync(file, 'utf8');
    const after = enhanceGuide(before, slug);
    const secondPass = enhanceGuide(after, slug);
    if (secondPass !== after) throw new Error(`${slug}: guide enhancement is not idempotent in memory`);
    return { slug, file, before, after };
  });

  let changed = 0;
  for (const output of outputs) {
    if (output.after === output.before) continue;
    fs.writeFileSync(output.file, output.after, 'utf8');
    changed++;
  }

  const tableCount = outputs.reduce((total, output) => {
    const main = getMainParts(output.after).inner;
    return total + scanElements(main).filter(node => node.tag === 'table' && node.end != null).length;
  }, 0);
  console.log(`enhance-guide-reader-ui: ${changed}/${files.length} guides updated; ${files.length} TOCs; ${tableCount} accessible table regions.`);
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(`enhance-guide-reader-ui: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  GUIDES_DIR,
  MIN_EXPECTED_GUIDES,
  TOC_END,
  TOC_START,
  classTokens,
  collectEligibleHeadings,
  collectIdCounts,
  countOccurrences,
  decodeEntities,
  enhanceGuide,
  findAncestor,
  getAttr,
  getMainParts,
  guideFiles,
  isEligibleHeading,
  isGeneratedTableRegion,
  normalizeGuideCardCtas,
  plainText,
  scanElements,
  stripGeneratedTableUi
};
