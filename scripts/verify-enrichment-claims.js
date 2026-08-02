#!/usr/bin/env node
'use strict';
/** Verify source-bound claims produced by an enrichment run. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('Usage: node scripts/verify-enrichment-claims.js <venue-id> [...]');
  process.exit(2);
}
function text(html) {
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ').trim().toLowerCase();
}
const errors = [];
let claims = 0;
for (const id of ids) {
  const mdFile = path.join(ROOT, 'venues', `${id}.md`);
  const pageFile = path.join(ROOT, 'gyms', id, 'index.html');
  const ledgerFile = path.join(ROOT, 'research', 'claim-ledger', `${id}.json`);
  for (const [label, file] of [['record', mdFile], ['rendered page', pageFile], ['claim ledger', ledgerFile]]) {
    if (!fs.existsSync(file)) errors.push(`${id}: missing ${label} ${path.relative(ROOT, file)}`);
  }
  if (![mdFile, pageFile, ledgerFile].every(fs.existsSync)) continue;
  const md = fs.readFileSync(mdFile, 'utf8');
  const html = fs.readFileSync(pageFile, 'utf8');
  const visible = text(html);
  let ledger;
  try { ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8')); }
  catch (error) { errors.push(`${id}: invalid ledger JSON (${error.message})`); continue; }
  if (ledger.id !== id) errors.push(`${id}: ledger id is ${ledger.id || 'missing'}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ledger.reviewed || '')) errors.push(`${id}: ledger reviewed must be YYYY-MM-DD`);
  if (!Array.isArray(ledger.claims) || !ledger.claims.length) errors.push(`${id}: ledger has no claims`);
  for (const [index, entry] of (ledger.claims || []).entries()) {
    claims++;
    const at = `${id} claim ${index + 1}`;
    if (!entry.claim || entry.claim.length < 12) errors.push(`${at}: human-readable claim is missing/too short`);
    if (!entry.pageNeedle || entry.pageNeedle.length < 12) errors.push(`${at}: pageNeedle is missing/too short`);
    if (!/^https?:\/\//.test(entry.sourceUrl || '')) errors.push(`${at}: sourceUrl must be HTTP(S)`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.sourceRetrievedAt || '')) errors.push(`${at}: sourceRetrievedAt must be YYYY-MM-DD`);
    if (entry.sourceState !== 'live') errors.push(`${at}: sourceState must be live; blocked/dead sources cannot support a new current fact`);
    if (entry.sourceUrl && !md.includes(entry.sourceUrl)) errors.push(`${at}: sourceUrl is not retained in venues/${id}.md`);
    if (entry.sourceUrl && !html.includes(entry.sourceUrl.replace(/&/g, '&amp;')) && !html.includes(entry.sourceUrl)) errors.push(`${at}: sourceUrl is not linked on the rendered page`);
    if (entry.pageNeedle && !visible.includes(text(entry.pageNeedle))) errors.push(`${at}: pageNeedle did not survive the generator: "${entry.pageNeedle}"`);
  }
}
if (errors.length) {
  console.error(`verify:enrichment-claims FAILED (${errors.length})`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`verify:enrichment-claims OK — ${ids.length} record(s), ${claims} source-bound rendered claim(s).`);
