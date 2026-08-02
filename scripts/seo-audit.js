#!/usr/bin/env node
/**
 * seo-audit.js — on-page SEO gate for shipped HTML.
 * Fails on truncated meta descriptions, pre-consent Google tags, and homepage H1 issues.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'scripts', 'venues', 'data', 'docs', '.backups', '.internal-docs', '_audit-tmp', 'private', 'research']);

const issues = {
  truncDesc: [],
  shortDesc: [],
  longDesc: [],
  longTitle: [],
  preConsentGtag: [],
  thinH1: [],
};

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

for (const file of walk(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  const r = rel(file);

  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]+)"/) || [])[1];
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
  const h1Text = h1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  if (title && title.length > 65) issues.longTitle.push({ file: r, len: title.length, title });
  if (desc) {
    if (desc.endsWith('...')) issues.truncDesc.push(r);
    if (desc.length < 100) issues.shortDesc.push({ file: r, len: desc.length });
    if (desc.length > 165) issues.longDesc.push({ file: r, len: desc.length });
  }
  if (/googletagmanager\.com\/gtag\/js/i.test(html)) {
    issues.preConsentGtag.push(r);
  }
  if (r === 'index.html' && h1Text && !/pattaya/i.test(h1Text)) {
    issues.thinH1.push(r);
  }
}

console.log('SEO audit —', new Date().toISOString().slice(0, 10));
console.log('HTML files scanned:', walk(ROOT).length);
console.log('Truncated meta (...):', issues.truncDesc.length, issues.truncDesc.slice(0, 5).join(', ') || '—');
console.log('Short meta (<100):', issues.shortDesc.length);
console.log('Long meta (>165):', issues.longDesc.length);
console.log('Long title (>65):', issues.longTitle.length);
console.log('Pre-consent Google tags:', issues.preConsentGtag.length, issues.preConsentGtag.join(', ') || '—');
console.log('Homepage H1 missing Pattaya:', issues.thinH1.length);

const analytics = fs.readFileSync(path.join(ROOT, 'analytics.js'), 'utf8');
const consentBroken = !analytics.includes('pg_analytics_consent_v1') || !analytics.includes('globalPrivacyControl');
console.log('Consent-first analytics client:', consentBroken ? 'BROKEN' : 'OK');
const fail = issues.truncDesc.length + issues.preConsentGtag.length + issues.thinH1.length + (consentBroken ? 1 : 0);
if (fail) {
  console.error('\nSEO GATE FAIL — fix before ship.');
  process.exit(1);
}
console.log('\nSEO GATE PASS');
