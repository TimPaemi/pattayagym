#!/usr/bin/env node
'use strict';

/**
 * verify-guide-reader-ui.js
 *
 * Hard gate for the server-rendered guide TOC and accessible table-scroll layer.
 * It checks every child guide, resolves each TOC fragment to one heading, and
 * proves every guide table is inside one named, keyboard-focusable region.
 */

const fs = require('fs');
const path = require('path');
const {
  MIN_EXPECTED_GUIDES,
  TOC_END,
  TOC_START,
  classTokens,
  collectEligibleHeadings,
  collectIdCounts,
  countOccurrences,
  decodeEntities,
  findAncestor,
  getAttr,
  getMainParts,
  guideFiles,
  isGeneratedTableRegion,
  scanElements
} = require('./enhance-guide-reader-ui.js');

const ROOT = path.resolve(__dirname, '..');
const problems = [];
let headingTotal = 0;
let tableTotal = 0;

function problem(slug, message) {
  problems.push(`guides/${slug}/index.html (${message})`);
}

function descendantTables(region, tables) {
  return tables.filter(table => findAncestor(table, ancestor => ancestor === region));
}

const files = guideFiles();
if (files.length < MIN_EXPECTED_GUIDES) {
  problems.push(`guides/ (found ${files.length} child guides; expected at least ${MIN_EXPECTED_GUIDES})`);
}

for (const { slug, file } of files) {
  try {
    const html = fs.readFileSync(file, 'utf8');
    const main = getMainParts(html).inner;

    if (countOccurrences(main, TOC_START) !== 1 || countOccurrences(main, TOC_END) !== 1) {
      problem(slug, 'expected exactly one GUIDE-TOC marker pair');
      continue;
    }

    const tocStart = main.indexOf(TOC_START);
    const tocEnd = main.indexOf(TOC_END, tocStart + TOC_START.length);
    const toc = main.slice(tocStart, tocEnd + TOC_END.length);
    const nodes = scanElements(main);
    const tocNavs = nodes.filter(node => node.tag === 'nav' && classTokens(node).has('guide-toc'));
    if (tocNavs.length !== 1) problem(slug, `expected one .guide-toc nav, found ${tocNavs.length}`);
    else {
      const nav = tocNavs[0];
      if (nav.start < tocStart || nav.end > tocEnd + TOC_END.length) {
        problem(slug, '.guide-toc nav is outside its generated marker pair');
      }
      if (getAttr(nav, 'aria-label') !== 'On this page') {
        problem(slug, '.guide-toc nav is missing aria-label="On this page"');
      }
    }

    const headings = collectEligibleHeadings(main);
    headingTotal += headings.length;
    if (!headings.length) problem(slug, 'no eligible H2 sections');
    const idCounts = collectIdCounts(html);
    for (const heading of headings) {
      if (idCounts.get(heading.id) !== 1) {
        problem(slug, `eligible heading id must resolve exactly once: ${heading.id}`);
      }
    }

    const tocLinks = [...toc.matchAll(/<a\b[^>]*href="#([^"]+)"[^>]*>/gi)]
      .map(match => decodeEntities(match[1]));
    if (tocLinks.length !== headings.length) {
      problem(slug, `TOC has ${tocLinks.length} links for ${headings.length} eligible headings`);
    } else {
      for (let index = 0; index < headings.length; index++) {
        if (tocLinks[index] !== headings[index].id) {
          problem(slug, `TOC order/target mismatch at item ${index + 1}`);
          break;
        }
      }
    }
    for (const fragment of tocLinks) {
      if (idCounts.get(fragment) !== 1) problem(slug, `TOC fragment does not resolve once: #${fragment}`);
    }
    const numberCount = (toc.match(/class="guide-toc-number"/g) || []).length;
    const labelCount = (toc.match(/class="guide-toc-label"/g) || []).length;
    if (numberCount !== headings.length || labelCount !== headings.length) {
      problem(slug, 'TOC item number/label markup is incomplete');
    }

    const tables = nodes.filter(node => node.tag === 'table' && node.end != null);
    const regions = nodes.filter(node => isGeneratedTableRegion(node));
    const allMarkedRegions = nodes.filter(node => getAttr(node, 'data-guide-table') === 'true');
    const blocks = nodes.filter(node => classTokens(node).has('guide-table-block') && getAttr(node, 'data-guide-table-block') === 'true');
    tableTotal += tables.length;
    if (regions.length !== tables.length) {
      problem(slug, `found ${regions.length} generated table regions for ${tables.length} tables`);
    }
    if (allMarkedRegions.length !== regions.length) {
      problem(slug, 'legacy or non-native generated table region remains');
    }
    if (blocks.length !== tables.length) {
      problem(slug, `found ${blocks.length} generated table blocks for ${tables.length} tables`);
    }

    for (const table of tables) {
      const region = findAncestor(table, isGeneratedTableRegion);
      if (!region) {
        problem(slug, `table at byte ${table.start} lacks .guide-table-scroll region`);
        continue;
      }
      if (!classTokens(region).has('guide-table-scroll')) {
        problem(slug, 'generated table region lacks .guide-table-scroll');
      }
      if (region.tag !== 'section' || getAttr(region, 'tabindex') !== '0') {
        problem(slug, 'table region must be a native section with tabindex="0"');
      }
      if (!String(getAttr(region, 'aria-label') || '').trim()) {
        problem(slug, 'table region has no accessible name');
      }
      const describedBy = getAttr(region, 'aria-describedby');
      if (!describedBy || idCounts.get(describedBy) !== 1) {
        problem(slug, 'table region hint id is missing or not unique');
      } else {
        const hint = nodes.find(node => getAttr(node, 'id') === describedBy && classTokens(node).has('guide-table-hint'));
        if (!hint) problem(slug, `aria-describedby target is not a .guide-table-hint: ${describedBy}`);
      }
      const block = findAncestor(region, ancestor =>
        classTokens(ancestor).has('guide-table-block') && getAttr(ancestor, 'data-guide-table-block') === 'true');
      if (!block) problem(slug, 'table region lacks generated .guide-table-block parent');
    }

    for (const region of regions) {
      const count = descendantTables(region, tables).length;
      if (count !== 1) problem(slug, `table region contains ${count} tables; expected one`);
    }

    for (const node of nodes) {
      if (/overflow-x\s*:\s*auto\b/i.test(String(getAttr(node, 'style') || ''))) {
        problem(slug, 'inline overflow-x:auto remains instead of shared table wrapper');
        break;
      }
    }
  } catch (error) {
    problem(slug, error.message);
  }
}

const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const requiredCss = [
  ['.guide-toc', /\.guide-toc\s*\{/],
  ['.guide-toc-title', /\.guide-toc-title\s*\{/],
  ['.guide-toc-list', /\.guide-toc-list\s*\{/],
  ['.guide-toc-list a', /\.guide-toc-list\s+a\s*\{/],
  ['.guide-toc-number', /\.guide-toc-number\s*\{/],
  ['.guide-table-block', /\.guide-table-block\s*\{/],
  ['.guide-table-hint', /\.guide-table-hint\s*\{/],
  ['.guide-table-scroll', /\.guide-table-scroll\s*\{/],
  ['.guide-table-scroll table', /\.guide-table-scroll\s+table\s*\{/],
  ['.guide-table-scroll:focus-visible', /\.guide-table-scroll:focus-visible\s*\{/],
  ['.guide-table-scroll.is-wide table', /\.guide-table-scroll\.is-wide\s+table\s*\{/]
];
for (const [selector, pattern] of requiredCss) {
  if (!pattern.test(css)) problems.push(`styles.css (missing ${selector})`);
}

console.log(`Guide reader UI: ${files.length} child guides, ${headingTotal} TOC targets, ${tableTotal} table regions checked.`);
if (problems.length) {
  console.error(`  x ${problems.length} guide reader UI regression(s):`);
  for (const item of problems.slice(0, 16)) console.error(`      ${item}`);
  if (problems.length > 16) console.error(`      ... and ${problems.length - 16} more`);
  console.error('x Guide reader UI FAILED. Run scripts/enhance-guide-reader-ui.js after all guide writers and keep the shared CSS selectors present.');
  process.exit(1);
}

console.log('Guide reader UI consistent on every child guide.');
process.exit(0);
