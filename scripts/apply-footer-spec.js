#!/usr/bin/env node
/**
 * apply-footer-spec.js — FOOTER-SPEC-2026 sweep for static pages.
 *
 * build-v2.js regenerates venue/category/area/utility pages, but many pages
 * are static files (homepage, search, compare, map, plan-my-trip, favorites,
 * guides/*, changelog, …) with the old footer baked in. This script:
 *
 *   1. Replaces any old `<footer class="footer">…</footer>` with the shared
 *      five-block footer (skips files already carrying FOOTER-SPEC-2026).
 *   2. Removes the bottom scrolling marquee.
 *   3. Removes any PA-NET publisher block outside the footer.
 *   4. Ensures the TimPaemi Organization entity JSON-LD is present once,
 *      and that an author/publisher reference exists (adds a WebPage node
 *      if the page has no author at all).
 *
 * Idempotent. Run from repo root: `node scripts/apply-footer-spec.js`
 */

const fs = require('fs');
const path = require('path');
const { siteFooterHtml } = require('./lib/site-footer.js');
const { timpaemiRef, timpaemiOrganization } = require('./lib/timpaemi-author');

const ROOT = path.resolve(__dirname, '..');
const { GYMS } = require(path.join(ROOT, 'data.js'));
const VENUE_N = GYMS.length;
const SITE = 'https://pattaya-gym.com';

const SKIP_DIRS = new Set(['node_modules', 'research', '.git', 'fonts', 'og', 'packages']);

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

const FOOTER_RE = /<footer class="footer"[^>]*>[\s\S]*?<\/footer>/;
const BOTTOM_MARQUEE_RE = /[ \t]*<div class="marquee marquee-bottom"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\n?/g;
const PA_NET_RE = /<!--PA-NET:START-->[\s\S]*?<!--PA-NET:END-->\n?/g;
const ENTITY_RE = /"@type":"Organization","@id":"https:\/\/timpaemi\.com\/#timpaemi"/;

let footersReplaced = 0, marqueesRemoved = 0, paNetRemoved = 0, ldAdded = 0, files = 0;

for (const file of htmlFiles(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const orig = html;

  // 1. Footer
  if (!html.includes('FOOTER-SPEC-2026') && FOOTER_RE.test(html)) {
    html = html.replace(FOOTER_RE, siteFooterHtml(VENUE_N));
    footersReplaced++;
  }

  // 2. Bottom marquee  (use .match, not .test — /g regexes carry lastIndex between calls)
  if ((html.match(BOTTOM_MARQUEE_RE) || []).length) {
    html = html.replace(BOTTOM_MARQUEE_RE, '');
    marqueesRemoved++;
  }

  // 3. Stray PA-NET blocks (outside the footer)
  if ((html.match(PA_NET_RE) || []).length) {
    html = html.replace(PA_NET_RE, '');
    paNetRemoved++;
  }

  // 3b. <meta name="author"> for head-only crawlers and AI engines
  if (!/<meta name="author"/.test(html) && html.includes('</head>')) {
    html = html.replace('</head>', '<meta name="author" content="TimPaemi (timpaemi.com)">\n</head>');
  }

  // 4. JSON-LD: entity once per page + author/publisher reference
  if (html.includes('</head>')) {
    const blocks = [];
    if (!/"author"/.test(html)) {
      const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      const url = canonicalMatch ? canonicalMatch[1] : SITE + '/';
      blocks.push({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url: url,
        name: titleMatch ? titleMatch[1] : 'Pattaya.Gym',
        author: timpaemiRef(),
        publisher: timpaemiRef()
      });
    }
    if (!ENTITY_RE.test(html)) {
      blocks.push({ '@context': 'https://schema.org', ...timpaemiOrganization() });
    }
    if (blocks.length) {
      const scripts = blocks.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n') + '\n';
      html = html.replace('</head>', scripts + '</head>');
      ldAdded++;
    }
  }

  if (html !== orig) {
    fs.writeFileSync(file, html, 'utf8');
    files++;
  }
}

console.log(`apply-footer-spec: ${files} files changed — footers replaced ${footersReplaced}, bottom marquees removed ${marqueesRemoved}, stray PA-NET removed ${paNetRemoved}, JSON-LD added ${ldAdded}`);
