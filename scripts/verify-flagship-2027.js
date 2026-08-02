#!/usr/bin/env node
'use strict';
/** Hard gate for the promises introduced by the 2027 flagship pass. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { GYMS } = require(path.join(ROOT, 'data.js'));
const TIM = 'https://timpaemi.com/#tim';
const PAEMI = 'https://timpaemi.com/#paemi';
const COMPANY = 'https://timpaemi.com/#timpaemi';
const errors = [];
const skip = new Set(['.git', 'node_modules', '.internal-docs', '.backups', 'packages', '.wrangler', '.cursor', '.github', 'dist', 'tmp', 'private', 'research', 'docs', 'scripts', 'venues', '_audit-tmp']);
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, out);
    else if (/\.html$/i.test(entry.name)) out.push(file);
  }
  return out;
}
function rel(file) { return path.relative(ROOT, file).replace(/\\/g, '/'); }
function fail(message) { errors.push(message); }
function ids(value) {
  return [].concat(value || []).map(x => x && x['@id']).filter(Boolean).sort();
}
function visitJson(node, file) {
  if (Array.isArray(node)) { node.forEach(x => visitJson(x, file)); return; }
  if (!node || typeof node !== 'object') return;
  const types = [].concat(node['@type'] || []);
  const authored = types.some(t => typeof t === 'string' && ((/Page$/.test(t) && t !== 'FAQPage') || /Article$/.test(t) || t === 'WebApplication'));
  if (authored) {
    const authors = ids(node.author);
    if (JSON.stringify(authors) !== JSON.stringify([PAEMI, TIM].sort())) fail(`${file}: ${types.join('/')} author is not Tim + Paemi @id references`);
    if (!node.publisher || node.publisher['@id'] !== COMPANY) fail(`${file}: ${types.join('/')} publisher is not TimPaemi Co. @id`);
  }
  Object.values(node).forEach(x => visitJson(x, file));
}

const files = walk(ROOT);
let evidencePages = 0;
for (const venue of GYMS) {
  const record = fs.readFileSync(path.join(ROOT, 'venues', `${venue.id}.md`), 'utf8');
  const recordDate = (record.match(/^verified:\s*([0-9-]+)/m) || [])[1];
  if (recordDate !== venue.verified) fail(`review-date mismatch ${venue.id}: data.js=${venue.verified || 'missing'}, venue record=${recordDate || 'missing'}`);
}
for (const file of files) {
  const fileRel = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  if (/googletagmanager\.com\/gtag\/js/i.test(html)) fail(`${fileRel}: loads Google tag before consent`);
  if (/\bhand[- ]checked\b/i.test(html)) fail(`${fileRel}: still uses ambiguous hand-checked language`);
  const firstHand = html.match(/\bwe visited\b|\bwe trained\b|\bwhen (?:we )?dropped\b|\bmats felt\b|\bwe watched\b|\bpersonally confirmed\b|\bchecked in person\b|\bwe photographed\b|\bour visit\b/i);
  if (firstHand) fail(`${fileRel}: unsupported first-hand claim "${firstHand[0]}"`);
  const absolute = html.match(/every (?:claim|fact|detail) (?:comes|is sourced|was verified)|every venue record cites its sources|100% source-checked/i);
  if (absolute) fail(`${fileRel}: absolute provenance claim "${absolute[0]}"`);

  const publisherLinks = [...html.matchAll(/<a\b([^>]*\s)?href="https:\/\/timpaemi\.com\/?"([^>]*)>/gi)];
  const followed = publisherLinks.filter(m => !/rel="[^"]*nofollow/i.test(m[0]));
  if (followed.length !== 1) fail(`${fileRel}: expected exactly one followed timpaemi.com publisher link, found ${followed.length}`);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { visitJson(JSON.parse(match[1]), fileRel); }
    catch (error) { fail(`${fileRel}: invalid JSON-LD (${error.message})`); }
  }
  if (/^gyms\/[^/]+\/index\.html$/.test(fileRel)) {
    if (!/class="evidence-ledger"/.test(html)) fail(`${fileRel}: missing visible evidence ledger`);
    else evidencePages++;
  }
}
if (evidencePages !== GYMS.length) fail(`venue evidence ledgers: expected ${GYMS.length}, found ${evidencePages}`);

const geo = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'venue-geo.json'), 'utf8'));
for (const [id, point] of Object.entries(geo)) {
  const unsafe = ['area_fallback', 'area_centroid', 'outside_pattaya_region', 'missing_exact_geo'].includes(point._flag) || point.strategy === 'area_centroid';
  if (unsafe && (point.lat != null || point.lng != null)) fail(`data/venue-geo.json:${id}: unsafe ${point._flag || point.strategy} still carries coordinates`);
}

const map = fs.readFileSync(path.join(ROOT, 'map', 'index.html'), 'utf8');
const coach = fs.readFileSync(path.join(ROOT, 'find-my-coach', 'index.html'), 'utf8');
for (const [name, html] of [['map', map], ['find-my-coach', coach]]) {
  if (/noindex/i.test((html.match(/<meta name="robots" content="([^"]+)"/) || [])[1] || '')) fail(`/${name}/ is still noindex`);
  if (!new RegExp(`data-location-tool="${name === 'find-my-coach' ? 'coach' : name}"`).test(html)) fail(`/${name}/ is not a functional location tool`);
  if (!/\/location-tools\.js\?v=/.test(html)) fail(`/${name}/ does not load the versioned tool client`);
}
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const url of ['https://pattaya-gym.com/map/', 'https://pattaya-gym.com/find-my-coach/']) if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap missing ${url}`);

const search = fs.readFileSync(path.join(ROOT, 'search', 'index.html'), 'utf8');
const ssrCards = (search.match(/class="result-card"/g) || []).length;
if (ssrCards < 24) fail(`/search/ has ${ssrCards} server-rendered cards; expected at least 24`);
if (/\sautofocus(?:\s|\/?>)/i.test(search)) fail('/search/ still steals focus on load');

const analytics = fs.readFileSync(path.join(ROOT, 'analytics.js'), 'utf8');
for (const marker of ['pg_analytics_consent_v1', 'globalPrivacyControl', 'doNotTrack', 'Privacy choices']) if (!analytics.includes(marker)) fail(`analytics.js missing consent marker: ${marker}`);
const privacy = fs.readFileSync(path.join(ROOT, 'privacy', 'index.html'), 'utf8');
for (const marker of ['pg_analytics_consent_v1', 'pgym_recent_v1', 'pg_favorites_v1']) if (!privacy.includes(marker)) fail(`/privacy/ does not disclose ${marker}`);

const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
for (const rule of ['/venue-outreach-list.csv', '/scripts/*', '/*.cmd', '/*.md', '/*.ps1']) if (!redirects.includes(rule)) fail(`_redirects missing public-exposure rule ${rule}`);
if (fs.existsSync(path.join(ROOT, 'venue-outreach-list.csv'))) fail('root venue-outreach-list.csv still exists');
for (const dead of ['app.js', 'app.bundle.js', 'recent.js', 'data/reviews.json']) if (fs.existsSync(path.join(ROOT, dead))) fail(`dead public asset still present: ${dead}`);

const status = JSON.parse(fs.readFileSync(path.join(ROOT, 'status.json'), 'utf8'));
if (!status.catalog || status.catalog.venues_total !== GYMS.length) fail(`status.json venue count ${status.catalog && status.catalog.venues_total} != ${GYMS.length}`);
if (status.site && status.site.handChecked === true) fail('status.json still claims handChecked=true');
if (!status.site || status.site.firstHandVisitsClaimed !== false) fail('status.json does not explicitly disclaim first-hand visits');

if (errors.length) {
  console.error(`verify:flagship-2027 FAILED (${errors.length})`);
  errors.slice(0, 80).forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`verify:flagship-2027 OK — ${files.length} pages, ${evidencePages} evidence ledgers, safe geo quarantine, functional map/coach, SSR search, consent-first analytics, one publisher link per page.`);
