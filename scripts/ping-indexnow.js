#!/usr/bin/env node
/**
 * ping-indexnow.js — Notify Bing/Yandex et al. of new/updated URLs via IndexNow.
 * Key file must be live at https://pattaya-gym.com/{KEY}.txt
 *
 * Run after deploy: node scripts/ping-indexnow.js
 * Optional: node scripts/ping-indexnow.js --all-new-guides
 */

const fs = require('fs');
const path = require('path');

const SITE = 'https://pattaya-gym.com';
const HOST = 'pattaya-gym.com';
const ROOT = path.resolve(__dirname, '..');
const KEY_FILE = path.join(ROOT, 'bd7f2a9c1e48.txt');
const PRIORITY = path.join(ROOT, 'scripts', 'gsc-index-priority.txt');
const INDEXNOW = 'https://api.indexnow.org/indexnow';

function readKey() {
  if (!fs.existsSync(KEY_FILE)) {
    console.error('IndexNow key file missing:', KEY_FILE);
    process.exit(1);
  }
  return fs.readFileSync(KEY_FILE, 'utf8').trim();
}

function priorityUrls() {
  if (!fs.existsSync(PRIORITY)) return [];
  return fs.readFileSync(PRIORITY, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('http'));
}

async function ping(urlList, key) {
  const body = {
    host: HOST,
    key,
    keyLocation: `${SITE}/${key}.txt`,
    urlList,
  };
  const res = await fetch(INDEXNOW, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  return res;
}

(async () => {
  const key = readKey();
  let urls = priorityUrls();
  if (!urls.length) {
    urls = [`${SITE}/sitemap.xml`, `${SITE}/guides/`];
  }
  console.log(`IndexNow: submitting ${urls.length} URL(s) with key ${key}`);
  try {
    const res = await ping(urls, key);
    if (res.status === 200 || res.status === 202) {
      console.log(`  [OK] IndexNow HTTP ${res.status}`);
    } else {
      const text = await res.text().catch(() => '');
      console.log(`  [WARN] IndexNow HTTP ${res.status}${text ? ': ' + text.slice(0, 120) : ''}`);
    }
  } catch (e) {
    console.log(`  [SKIP] IndexNow: ${e.message}`);
  }
  urls.slice(0, 5).forEach(u => console.log(`    · ${u}`));
  if (urls.length > 5) console.log(`    … and ${urls.length - 5} more`);
})();
