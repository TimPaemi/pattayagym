#!/usr/bin/env node
/**
 * fix-guide-meta-entities-r68.js — Repair multiply-escaped &amp; in guide <title> and social meta.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function decodeAmpChain(s) {
  let prev;
  let out = String(s);
  do {
    prev = out;
    out = out.replace(/&amp;/g, '&');
  } while (out !== prev);
  return out;
}

function escMeta(s) {
  return decodeAmpChain(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fixHtml(html) {
  let next = html;
  next = next.replace(/<title>([^<]*)<\/title>/i, (_, t) => `<title>${escMeta(t)} | Pattaya.Gym</title>`.replace(' | Pattaya.Gym | Pattaya.Gym', ' | Pattaya.Gym'));
  // title may already include suffix — normalize
  next = next.replace(/<title>([^<]*)<\/title>/i, (m, t) => {
    const plain = decodeAmpChain(t).replace(/\s*\|\s*Pattaya\.Gym\s*$/i, '').trim();
    return `<title>${escMeta(plain)} | Pattaya.Gym</title>`;
  });
  next = next.replace(/<meta\s+property="og:title"\s+content="([^"]*)"/gi, (_, c) => `<meta property="og:title" content="${escMeta(c)}"`);
  next = next.replace(/<meta\s+name="twitter:title"\s+content="([^"]*)"/gi, (_, c) => `<meta name="twitter:title" content="${escMeta(c)}"`);
  // Breadcrumb visible text (unescaped span)
  next = next.replace(/(font-weight:600;">)([^<]*(?:&amp;)+[^<]*)(<\/span><\/nav>)/g, (m, pre, text, post) => {
    if (!text.includes('&amp;amp')) return m;
    return pre + decodeAmpChain(text).replace(/&/g, '&amp;') + post;
  });
  return next;
}

let fixed = 0;
const guidesDir = path.join(ROOT, 'guides');
for (const ent of fs.readdirSync(guidesDir, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  const fp = path.join(guidesDir, ent.name, 'index.html');
  if (!fs.existsSync(fp)) continue;
  const orig = fs.readFileSync(fp, 'utf8');
  if (!/&amp;amp/.test(orig)) continue;
  const next = fixHtml(orig);
  if (next !== orig) {
    fs.writeFileSync(fp, next, 'utf8');
    fixed++;
    console.log(`  fixed ${ent.name}`);
  }
}
console.log(`fix-guide-meta-entities-r68: ${fixed} guide(s).`);
