#!/usr/bin/env node
/**
 * inject-twitter-cards-r104.js — Add twitter:card meta to pages with OG but missing Twitter tags.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'scripts', 'venues', 'data', 'docs', 'private']);

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (e.name.endsWith('.html')) files.push(p);
  }
  return files;
}

function injectTwitter(html) {
  if (html.includes('twitter:card') || !html.includes('og:title')) return null;
  const title = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1]
    || (html.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta property="og:description" content="([^"]*)"/) || [])[1]
    || (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const image = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1]
    || 'https://pattaya-gym.com/og-image.png';
  const block = `<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@PattayaGym">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${image}">`;
  if (html.includes('<meta name="robots"')) {
    return html.replace(/<meta name="robots"/, `${block}\n<meta name="robots"`);
  }
  if (html.includes('</head>')) {
    return html.replace('</head>', `${block}\n</head>`);
  }
  return null;
}

let updated = 0;
for (const file of walk(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  const next = injectTwitter(html);
  if (next) {
    fs.writeFileSync(file, next, 'utf8');
    updated++;
  }
}
console.log(`Twitter cards injected: ${updated} pages.`);
