#!/usr/bin/env node
'use strict';
/* NETWORK-RULES §2 / §3 gate.
   Owned site: zero sister-site references in anything that ships. The only
   permitted cross-domain link is the followed timpaemi.com author credit.

   WHY THIS WAS REWRITTEN ON 2026-07-29
   ------------------------------------
   The previous version tested exactly one shape:

       new RegExp(`href=["'][^"']*${domain}`)

   so it could only ever see a literal anchor. On 2026-07-28 the site shipped
   344/355 HTML files carrying 688 `https://pattaya-authority.com/` references
   inside the author `sameAs` array - including the live homepage - and this
   gate reported "0 sister-site links" every single time. AGENTS.md:9 has always
   said zero references "including JSON-LD, `sameAs`", and NETWORK-RULES §2
   names six channels: footers, navs, JSON-LD, sameAs, sitemaps, llms.txt,
   humans.txt and JS arrays. Only the first was ever checked.

   WHAT IT CHECKS NOW
   ------------------
   Every sister domain is looked for in every position a machine can follow:

     - HTML attribute values      href, src, action, content, data-*, srcset
     - <script> contents          JSON-LD sameAs/url/@id, and plain JS arrays
     - machine-consumed files     .json .xml .txt .webmanifest .css .js
                                  (llms.txt, humans.txt, robots.txt, sitemap.xml,
                                  feed.xml, feed.json, api/*.json - all of these
                                  are read by machines end to end, so any
                                  occurrence anywhere in them is a reference)

   A bare mention in HTML prose or Markdown is reported as a WARNING, not a
   failure. That distinction is deliberate and load-bearing: /changelog/ is the
   site's own dated record of when the sister links were added and later
   removed, and a literal "any occurrence anywhere" rule would fail the build on
   the honest description of the fix. Prose is not a link and carries no
   PageRank. If the count moves, the warning says so.

   Files that `_redirects` blocks from the public site are skipped entirely and
   listed. That is derived from `_redirects` rather than hand-listed, so if the
   block is ever removed the gate starts failing on them again by itself.
   `.md` is in scope because that is exactly how the last leak happened: 68
   internal Markdown files sat at the web root naming every sister site while
   this gate reported clean, because it never opened them. Cloudflare Pages
   serves whatever is in the deploy directory, not just what the sitemap lists. */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['.internal-docs', '.backups', 'node_modules', 'dist', '.git', '.wrangler', '.cursor', '.github', 'scripts', 'tmp', 'research', 'docs']);
const EXT = /\.(html?|css|js|mjs|json|txt|xml|webmanifest|md)$/i;
const SKIP_FILES = new Set(['package-lock.json', 'package.json']);
const SKIP_PATTERNS = [/^lh-.*\.json$/i]; // local Lighthouse dumps, never shipped

/* Machine-consumed end to end: no prose in them, so any hit is a reference. */
const MACHINE_EXT = /\.(css|js|mjs|json|txt|xml|webmanifest)$/i;

const SISTER = [
  'pattaya-school-guide.com',
  'pattaya-authority.com', 'pattaya-restaurant-guide.com', 'pattayavisahelp.com',
  'pattaya-afterdark.com', 'pattaya-coffee.com', 'pattayastream.com',
  'pattaya-medical.com', 'pattayapets.com', 'pattaya-vehicle-rentals.com',
  'pattaya-insider.com', 'timpaemi.live', 'pattaya-golf.com', 'retire-in-pattaya.com',
  'movetopattaya.com', 'pattayatools.pages.dev', 'koh-larn-thailand.com',
  'mrweoutside.com', 'pattayaolympian.com', 'pattayapersonaltrainer.com',
];

/* Paths `_redirects` sends to /404.html (or anywhere else) are not publicly
   readable, so they are not a leak channel. Derived, never hand-maintained. */
function blockedPaths() {
  const out = [];
  const f = path.join(root, '_redirects');
  if (!fs.existsSync(f)) return out;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(\/\S+)\s+(\S+)\s+30[12]\s*$/);
    if (m && /404/.test(m[2])) out.push(m[1].replace(/^\//, '').toLowerCase());
  }
  return out;
}
const BLOCKED = blockedPaths();
function isBlocked(rel) {
  const value = rel.toLowerCase();
  return BLOCKED.some(pattern => {
    const re = '^' + pattern.split('*')
      .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*') + '$';
    return new RegExp(re).test(value);
  });
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (EXT.test(e.name) && !SKIP_FILES.has(e.name) && !SKIP_PATTERNS.some((re) => re.test(e.name))) out.push(f);
  }
  return out;
}

/* Every span of an HTML file a machine reads as a reference rather than as
   words on a page: attribute values, and the inside of every <script>. */
function referenceText(html) {
  const parts = [];
  for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) parts.push(m[1]);
  for (const m of html.matchAll(/\b(?:href|src|srcset|action|content|data-[\w-]+|cite|poster|formaction)\s*=\s*("[^"]*"|'[^']*')/gi)) parts.push(m[1]);
  return parts.join('\n');
}

const errors = [];
const warnings = [];
const skipped = [];
let timpaemiLinks = 0;
let pagesChecked = 0;

for (const file of walk(root)) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  if (isBlocked(rel)) { skipped.push(rel); continue; }
  const s = fs.readFileSync(file, 'utf8');
  const isHtml = /\.html?$/i.test(rel);
  const machine = MACHINE_EXT.test(rel) ? s : isHtml ? referenceText(s) : '';

  for (const d of SISTER) {
    const esc = d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(esc, 'ig');
    const inRef = (machine.match(re) || []).length;
    const total = (s.match(re) || []).length;
    if (inRef > 0) {
      errors.push(`${rel}: ${inRef} machine-readable reference(s) to sister site ${d}`);
    } else if (total > 0) {
      warnings.push(`${rel}: ${total} prose mention(s) of ${d} (not a link - no action needed unless unexpected)`);
    }
  }

  if (/class="(network-intents|pa-net)"|<!--PA-NET:START-->/.test(s)) {
    errors.push(`${rel}: retired network module still present`);
  }

  if (isHtml && rel !== 'offline.html') {
    pagesChecked++;
    const links = (s.match(/href="https:\/\/timpaemi\.com\/?"/g) || []).length;
    if (links !== 1) errors.push(`${rel}: expected exactly one timpaemi.com publisher link, found ${links}`);
    timpaemiLinks += links;
    if (/href="https:\/\/timpaemi\.com[^"]*"[^>]*rel="[^"]*nofollow/.test(s)) {
      errors.push(`${rel}: the timpaemi.com author credit must be followed, not nofollow`);
    }
  }
}

if (warnings.length) {
  console.log(`check:no-network-links - ${warnings.length} prose mention(s), no links:`);
  for (const w of warnings.slice(0, 10)) console.log('  note: ' + w);
  if (warnings.length > 10) console.log(`  ...and ${warnings.length - 10} more`);
}
if (skipped.length) {
  console.log(`check:no-network-links - ${skipped.length} file(s) skipped, blocked from the public site by _redirects: ${skipped.join(', ')}`);
}

if (errors.length) {
  console.error('check:no-network-links FAILED');
  for (const e of errors.slice(0, 40)) console.error('  ' + e);
  if (errors.length > 40) console.error(`  ...and ${errors.length - 40} more`);
  process.exit(1);
}
console.log(`check:no-network-links OK - ${pagesChecked} pages, ${timpaemiLinks} followed timpaemi.com credits, 0 sister-site references in any machine-readable position`);
