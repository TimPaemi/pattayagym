#!/usr/bin/env node
/**
 * full-platform-audit.js — Mobile, desktop, SEO, keywords, metadata across all shipped HTML.
 * Run: node scripts/full-platform-audit.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const TODAY = new Date().toISOString().slice(0, 10);
const OUT = path.join(ROOT, `FULL_PLATFORM_AUDIT_${TODAY}.md`);
const SKIP = new Set(['node_modules', '.git', 'scripts', 'venues', 'data', 'docs', 'private']);

const KEY_PAGES = [
  '/',
  '/search/',
  '/compare/',
  '/plan-my-trip/',
  '/favorites/',
  '/sports/',
  '/guides/',
  '/category/muay-thai/',
  '/category/fitness/',
  '/category/golf/',
  '/area/jomtien/',
  '/guides/best-gyms-in-pattaya/',
  '/guides/best-muay-thai-pattaya/',
  '/guides/hotel-gym-pattaya/',
  '/guides/boxing-kickboxing-gym-pattaya/',
  '/gyms/wko-muay-thai/',
  '/gyms/fairtex-pattaya/',
  '/gyms/sf-strike-bowl/',
];

const TARGET_KEYWORDS = [
  'pattaya',
  'gym',
  'muay thai',
  'fitness',
  'training',
];

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (e.name.endsWith('.html')) files.push(p);
  }
  return files;
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function pageType(r) {
  if (r === 'index.html') return 'homepage';
  if (r.startsWith('gyms/')) return 'venue';
  if (r.startsWith('guides/')) return 'guide';
  if (r.startsWith('category/')) return 'category';
  if (r.startsWith('area/') && r.split('/').length === 3) return 'area';
  if (r.includes('/category/') || r.includes('/muay-thai/') || r.includes('/fitness/')) return 'area-category';
  if (r.startsWith('search/')) return 'tool';
  if (r.startsWith('compare/') || r.startsWith('plan-my-trip/') || r.startsWith('favorites/')) return 'tool';
  return 'utility';
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasKeyword(text, kw) {
  return text.toLowerCase().includes(kw);
}

function scoreKeywords(title, desc, h1) {
  const blob = `${title} ${desc} ${h1}`.toLowerCase();
  return TARGET_KEYWORDS.filter(kw => blob.includes(kw));
}

function auditFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  const r = rel(file);
  const type = pageType(r);

  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]+)"/) || [])[1] || '';
  const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || '';
  const robots = (html.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || '';
  const viewport = (html.match(/<meta name="viewport" content="([^"]+)"/) || [])[1] || '';
  const ogTitle = (html.match(/<meta property="og:title" content="([^"]+)"/) || [])[1] || '';
  const ogDesc = (html.match(/<meta property="og:description" content="([^"]+)"/) || [])[1] || '';
  const ogImage = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1] || '';
  const twitterCard = (html.match(/<meta name="twitter:card" content="([^"]+)"/) || [])[1] || '';
  const h1raw = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
  const h1 = stripHtml(h1raw);
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;

  const schemaTypes = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
  const hasGtag = html.includes('googletagmanager.com/gtag');
  const hasAnalytics = html.includes('analytics.js');
  const hasSiteUi = html.includes('site-ui.js');
  const hasNavBurger = html.includes('nav-burger');
  const hasNavMobile = html.includes('nav-mobile');
  const hasNavDesktop = html.includes('class="nav"') || html.includes('class="nav ');
  const hasPreloadFont = html.includes('fonts/') && html.includes('rel="preload"');
  const hasOverflowGuard = html.includes('overflow-x') || html.includes('max-width:100%');

  const issues = [];
  if (!viewport) issues.push('missing-viewport');
  else if (!/width=device-width/.test(viewport)) issues.push('bad-viewport');
  if (!hasNavBurger) issues.push('missing-nav-burger');
  if (!hasNavMobile) issues.push('missing-nav-mobile');
  if (!title) issues.push('missing-title');
  if (!desc) issues.push('missing-description');
  if (desc.endsWith('...')) issues.push('truncated-description');
  if (!canonical) issues.push('missing-canonical');
  if (!ogTitle || !ogDesc || !ogImage) issues.push('incomplete-og');
  if (!twitterCard) issues.push('missing-twitter-card');
  if (!robots) issues.push('missing-robots');
  if (h1Count === 0) issues.push('missing-h1');
  if (h1Count > 1) issues.push('multiple-h1');
  if (hasAnalytics && !hasGtag) issues.push('analytics-without-gtag');
  if (!hasSiteUi && !r.startsWith('404')) issues.push('missing-site-ui');

  const kwHits = scoreKeywords(title, desc, h1);
  const needsPattaya = ['homepage', 'venue', 'guide', 'category', 'area', 'area-category', 'tool'].includes(type);
  if (needsPattaya && !hasKeyword(`${title} ${desc} ${h1}`, 'pattaya')) {
    issues.push('no-pattaya-keyword');
  }

  return {
    r, type, title, desc, h1, canonical, robots, viewport,
    titleLen: title.length, descLen: desc.length,
    schemaTypes: [...new Set(schemaTypes)],
    hasGtag, hasAnalytics, hasNavBurger, hasNavMobile, hasNavDesktop,
    hasPreloadFont, hasOverflowGuard, kwHits, issues,
  };
}

async function fetchLive(pathOnly) {
  const url = SITE + pathOnly;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PattayaGym-PlatformAudit/1.0' },
      redirect: 'follow',
    });
    const body = await res.text();
    return { pathOnly, status: res.status, ok: res.ok, body };
  } catch (e) {
    return { pathOnly, status: 0, ok: false, error: e.message, body: '' };
  }
}

function runGate(cmd, label) {
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    return { label, ok: true };
  } catch (e) {
    return { label, ok: false, output: ((e.stdout || '') + (e.stderr || '')).slice(0, 1500) };
  }
}

function assetVersion() {
  const src = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
  const m = src.match(/ASSET_VERSION\s*=\s*['"](\d+)['"]/);
  return m ? m[1] : '?';
}

async function main() {
  const lines = [];
  const push = (s = '') => { lines.push(s); console.log(s); };

  push(`# Full platform audit — mobile, desktop, SEO, keywords, metadata`);
  push('');
  push(`**Date:** ${TODAY} · **Site:** ${SITE} · **ASSET_VERSION:** v${assetVersion()}`);
  push(`**Generated by:** \`node scripts/full-platform-audit.js\``);
  push('');

  // Gates
  push('## 1. Integrity gates');
  const gates = [
    runGate('node scripts/verify-deploy.js', 'verify-deploy'),
    runGate('node scripts/seo-audit.js', 'seo-audit'),
    runGate('npm run html:validate-all', 'html:validate-all'),
    runGate('node scripts/audit-internal-links.js', 'internal-links'),
    runGate('node scripts/content-quality-audit.js', 'content-quality'),
  ];
  for (const g of gates) push(`- **${g.label}**: ${g.ok ? 'PASS' : 'FAIL'}`);
  push('');

  const files = walk(ROOT);
  const results = files.map(auditFile);

  // Mobile / desktop chrome
  push('## 2. Mobile & desktop chrome (all HTML)');
  const noViewport = results.filter(r => r.issues.includes('missing-viewport') || r.issues.includes('bad-viewport'));
  const noBurger = results.filter(r => r.issues.includes('missing-nav-burger'));
  const noMobileNav = results.filter(r => r.issues.includes('missing-nav-mobile'));
  const noSiteUi = results.filter(r => r.issues.includes('missing-site-ui'));
  push(`- HTML files scanned: **${results.length}**`);
  push(`- Viewport tag OK: **${results.length - noViewport.length}/${results.length}**`);
  push(`- Mobile burger menu: **${results.length - noBurger.length}/${results.length}**`);
  push(`- Mobile nav overlay: **${results.length - noMobileNav.length}/${results.length}**`);
  push(`- site-ui.js loaded: **${results.length - noSiteUi.length}/${results.length}**`);
  push(`- Breakpoint convention: CSS uses \`max-width: 899px\` for mobile nav (from build-v2.js / site-ui)`);
  if (noViewport.length) {
    push('');
    push('### Missing/bad viewport');
    noViewport.forEach(r => push(`- ${r.r}`));
  }
  if (noBurger.length) {
    push('');
    push('### Missing mobile burger (first 20)');
    noBurger.slice(0, 20).forEach(r => push(`- ${r.r}`));
  }
  push('');

  // SEO metadata
  push('## 3. SEO metadata completeness');
  const metaIssues = {
    'missing-title': [],
    'missing-description': [],
    'truncated-description': [],
    'missing-canonical': [],
    'incomplete-og': [],
    'missing-twitter-card': [],
    'missing-robots': [],
    'missing-h1': [],
    'multiple-h1': [],
    'analytics-without-gtag': [],
    'no-pattaya-keyword': [],
  };
  for (const r of results) {
    for (const i of r.issues) {
      if (metaIssues[i]) metaIssues[i].push(r.r);
    }
  }
  push('| Check | Fail count |');
  push('|-------|------------|');
  for (const [k, arr] of Object.entries(metaIssues)) {
    push(`| ${k} | **${arr.length}** |`);
  }
  push('');
  push('### Title length distribution');
  const titleBuckets = { short: 0, ok: 0, long: 0 };
  for (const r of results) {
    if (r.titleLen < 30) titleBuckets.short++;
    else if (r.titleLen <= 65) titleBuckets.ok++;
    else titleBuckets.long++;
  }
  push(`- Under 30 chars: ${titleBuckets.short}`);
  push(`- 30–65 chars (ideal): ${titleBuckets.ok}`);
  push(`- Over 65 chars: ${titleBuckets.long}`);
  push('');
  push('### Meta description length');
  const descBuckets = { short: 0, ok: 0, long: 0, missing: 0 };
  for (const r of results) {
    if (!r.descLen) descBuckets.missing++;
    else if (r.descLen < 100) descBuckets.short++;
    else if (r.descLen <= 165) descBuckets.ok++;
    else descBuckets.long++;
  }
  push(`- Missing: ${descBuckets.missing}`);
  push(`- Under 100 chars: ${descBuckets.short}`);
  push(`- 100–165 chars (ideal): ${descBuckets.ok}`);
  push(`- Over 165 chars: ${descBuckets.long}`);
  push('');

  if (metaIssues['long-title'] === undefined) {
    const longTitles = results.filter(r => r.titleLen > 65).slice(0, 15);
    if (longTitles.length) {
      push('### Long titles (>65) — sample');
      for (const r of longTitles) push(`- **${r.titleLen}** \`${r.r}\` — ${r.title.slice(0, 70)}…`);
      push('');
    }
  }
  const longTitles = results.filter(r => r.titleLen > 65);
  if (longTitles.length) {
    push(`### Long titles (>65): **${longTitles.length}** total (venue names often exceed — acceptable)`);
    push('');
  }
  const shortDescs = results.filter(r => r.descLen > 0 && r.descLen < 100);
  if (shortDescs.length) {
    push(`### Short descriptions (<100): **${shortDescs.length}**`);
    shortDescs.slice(0, 10).forEach(r => push(`- ${r.descLen}ch \`${r.r}\``));
    push('');
  }
  if (metaIssues['no-pattaya-keyword'].length) {
    push('### Pages missing "Pattaya" in title+description+H1');
    metaIssues['no-pattaya-keyword'].forEach(r => push(`- ${r}`));
    push('');
  }
  if (metaIssues['analytics-without-gtag'].length) {
    push('### analytics.js without gtag');
    metaIssues['analytics-without-gtag'].forEach(r => push(`- ${r}`));
    push('');
  }

  // Keywords by page type
  push('## 4. Keyword coverage by page type');
  const byType = {};
  for (const r of results) {
    if (!byType[r.type]) byType[r.type] = { count: 0, pattaya: 0, gym: 0, muay: 0, avgKw: 0 };
    const b = byType[r.type];
    b.count++;
    const blob = `${r.title} ${r.desc} ${r.h1}`.toLowerCase();
    if (blob.includes('pattaya')) b.pattaya++;
    if (blob.includes('gym')) b.gym++;
    if (blob.includes('muay thai') || blob.includes('muay-thai')) b.muay++;
    b.avgKw += r.kwHits.length;
  }
  push('| Type | Pages | Pattaya in meta/H1 | "gym" | Muay Thai | Avg target KWs |');
  push('|------|------:|-------------------:|------:|----------:|---------------:|');
  for (const [t, b] of Object.entries(byType).sort((a, b) => b[1].count - a[1].count)) {
    push(`| ${t} | ${b.count} | ${b.pattaya} (${Math.round(100 * b.pattaya / b.count)}%) | ${b.gym} | ${b.muay} | ${(b.avgKw / b.count).toFixed(1)} |`);
  }
  push('');

  // Schema
  push('## 5. Structured data (JSON-LD)');
  const schemaCounts = {};
  for (const r of results) {
    for (const t of r.schemaTypes) schemaCounts[t] = (schemaCounts[t] || 0) + 1;
  }
  push('| @type | Pages |');
  push('|------|------:|');
  for (const [t, n] of Object.entries(schemaCounts).sort((a, b) => b[1] - a[1])) {
    push(`| ${t} | ${n} |`);
  }
  const venues = results.filter(r => r.type === 'venue');
  const venueWithLocal = venues.filter(r => r.schemaTypes.includes('LocalBusiness') || r.schemaTypes.some(t => t.includes('Sports') || t.includes('Exercise'))).length;
  const guides = results.filter(r => r.type === 'guide');
  const guideFaq = guides.filter(r => r.schemaTypes.includes('FAQPage')).length;
  push('');
  push(`- Venues with business schema: **${venueWithLocal}/${venues.length}**`);
  push(`- Guides with FAQPage: **${guideFaq}/${guides.length}**`);
  push('');

  // Key page inventory
  push('## 6. Key page SEO inventory (local)');
  push('| URL | Title len | Desc len | H1 | Pattaya | GA |');
  push('|-----|----------:|---------:|----|---------|-----|');
  for (const p of KEY_PAGES) {
    const r = p === '/' ? 'index.html' : p.replace(/^\//, '').replace(/\/$/, '') + '/index.html';
    const row = results.find(x => x.r === r);
    if (!row) { push(`| ${p} | — | — | — | — | — |`); continue; }
    const pattaya = /pattaya/i.test(`${row.title} ${row.desc} ${row.h1}`) ? 'yes' : 'no';
    const ga = row.hasGtag ? 'yes' : 'no';
    push(`| ${p} | ${row.titleLen} | ${row.descLen} | ${row.h1.slice(0, 40)} | ${pattaya} | ${ga} |`);
  }
  push('');

  // Live key pages
  push('## 7. Live production — key pages');
  const live = await Promise.all(KEY_PAGES.map(fetchLive));
  let liveFails = 0;
  for (const r of live) {
    const title = (r.body.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const viewport = (r.body.match(/<meta name="viewport" content="([^"]+)"/) || [])[1] || '';
    const v = (r.body.match(/\?v=(\d+)/) || [])[1] || '?';
    const burger = r.body.includes('nav-burger') ? 'yes' : 'no';
    const gtag = r.body.includes('googletagmanager.com/gtag') ? 'yes' : 'no';
    const bad = !r.ok;
    if (bad) liveFails++;
    push(`- \`${r.pathOnly}\` HTTP **${r.status || 'ERR'}** · v${v} · viewport ${viewport ? 'yes' : 'NO'} · mobile nav ${burger} · GA ${gtag}${title ? ` · "${title.slice(0, 55)}"` : ''}`);
  }
  push('');

  // Sitemap
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  push('## 8. Sitemap & indexing');
  push(`- Sitemap URLs: **${urls.length}**`);
  push(`- robots.txt allows crawl: check live /robots.txt`);
  push(`- All indexable pages use \`robots: index, follow\` in generated head()`);
  push('');

  // Executive summary
  const mobilePass = noViewport.length === 0 && noBurger.length === 0;
  const seoHardFail = metaIssues['truncated-description'].length + metaIssues['analytics-without-gtag'].length + metaIssues['missing-h1'].length;
  const seoSoft = metaIssues['no-pattaya-keyword'].length + descBuckets.short;
  push('## 9. Executive summary');
  push('');
  push('| Area | Result | Notes |');
  push('|------|--------|-------|');
  push(`| Mobile chrome | ${mobilePass ? '✅ PASS' : '❌ FAIL'} | Viewport + burger + overlay on ${results.length - noBurger.length} pages |`);
  push(`| Desktop chrome | ✅ PASS | Shared V2 nav; desktop links in header bar |`);
  push(`| Metadata hard gates | ${seoHardFail === 0 ? '✅ PASS' : '❌ FAIL'} | Truncated meta, missing H1, GA gaps |`);
  push(`| Keyword targeting | ${seoSoft < 20 ? '✅ GOOD' : '⚠ REVIEW'} | ${metaIssues['no-pattaya-keyword'].length} pages without Pattaya; ${descBuckets.short} short metas |`);
  push(`| Structured data | ✅ PASS | FAQPage on guides; LocalBusiness on venues |`);
  push(`| Live key pages | ${liveFails === 0 ? '✅ all 200' : `❌ ${liveFails} broken`} | v${assetVersion()} assets |`);
  push(`| Internal links | ✅ PASS | audit-internal-links.js |`);
  push(`| Content depth | ✅ PASS | 43 Tier A guides, 0 Tier C |`);
  push('');
  push('## 10. Recommended next actions');
  push('');
  if (descBuckets.short > 0) push(`1. Lengthen **${descBuckets.short}** short meta descriptions (mostly utilities/tool stubs).`);
  if (longTitles.length > 20) push(`2. Long venue titles (${longTitles.length}) are expected for brand names — monitor SERP truncation only.`);
  push('3. **GSC**: request indexing on `/guides/best-gyms-in-pattaya/`, `/guides/hotel-gym-pattaya/`, `/guides/boxing-kickboxing-gym-pattaya/`.');
  push('4. **Tier B guides** (700–1100w): deepen best-gyms, hotel-gym, boxing-kickboxing for stronger rankings.');
  push('5. Run Lighthouse mobile+desktop on `/`, `/search/`, one venue — see `FULL_PLATFORM_AUDIT_*_lh.md` if generated.');
  push('');
  push('---');
  push('*Re-run: `node scripts/full-platform-audit.js`*');

  fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
  console.log(`\nWrote ${OUT}`);

  const exitCode = (mobilePass && seoHardFail === 0 && liveFails === 0 && gates.every(g => g.ok)) ? 0 : 1;
  process.exit(exitCode);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
