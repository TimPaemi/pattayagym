#!/usr/bin/env node
'use strict';
/**
 * Final reader-facing trust/privacy sweep.
 * Runs after every HTML writer so legacy generators cannot re-add pre-consent
 * Google tags, first-hand-sounding trust language, or duplicate publisher links.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['.git', 'node_modules', '.internal-docs', '.backups', 'packages',
  '.wrangler', '.cursor', '.github', 'dist', 'tmp', 'private', 'research', 'docs', 'scripts', 'venues']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, out);
    else if (entry.name.endsWith('.html')) out.push(file);
  }
  return out;
}

function keepOnePublisherLink(html) {
  const re = /<a\b[^>]*href="https:\/\/timpaemi\.com\/?"[^>]*>[\s\S]*?<\/a>/gi;
  const matches = [...html.matchAll(re)];
  if (matches.length <= 1) return html;
  const keepAt = matches[matches.length - 1].index;
  return html.replace(re, (anchor, offset) => {
    if (offset === keepAt) return anchor;
    const inner = anchor.replace(/^<a\b[^>]*>/i, '').replace(/<\/a>$/i, '');
    return `<span class="publisher-mention">${inner}</span>`;
  });
}

function patch(html) {
  let next = html
    .replace(/\s*<script\b[^>]*src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]+"[^>]*><\/script>/gi, '')
    .replace(/\s*<link\b[^>]*rel="dns-prefetch"[^>]*href="\/\/www\.googletagmanager\.com"[^>]*>/gi, '')
    .replace(/<script src="\/data\.js(\?v=[^"]+)?"><\/script>/gi, '<script defer src="/data.js$1"></script>')
    .replace(/100% Hand-checked/gi, 'Source-checked record')
    .replace(/Verified by Tim/gi, 'Sources reviewed')
    .replace(/HAND-CHECKED/g, 'SOURCE-CHECKED')
    .replace(/Hand-checked/g, 'Source-checked')
    .replace(/hand-checked/g, 'source-checked')
    .replace(/first-hand (tariff|amount|price|visitor tariff)/gi, 'operator-published $1')
    .replace(/first-hand (sources?|pages?|material|evidence)/gi, 'operator-published $1')
    .replace(/For those, see our sister sites:/gi, 'Other local categories are intentionally outside this directory:')
    .replace(/Pattaya Authority/gi, 'retired network property')
    .replace(/Pattaya After Dark/gi, 'retired network property')
    .replace(/pattaya-afterdark\.com/gi, 'retired-network.invalid');
  next = keepOnePublisherLink(next);
  return next;
}

let changed = 0;
let pages = 0;
for (const file of walk(ROOT)) {
  pages++;
  const before = fs.readFileSync(file, 'utf8');
  const after = patch(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed++;
  }
}

console.log(`apply-flagship-2027: ${changed}/${pages} HTML files normalized for consent, source language and publisher-link uniqueness.`);
