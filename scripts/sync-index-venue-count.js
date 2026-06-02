#!/usr/bin/env node
/**
 * sync-index-venue-count.js — Align hand-maintained index.html venue counts with data.js GYMS.length.
 * Run after removing or adding venues in data.js.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const { GYMS } = require(path.join(ROOT, 'data.js'));
const n = GYMS.length;

let html = fs.readFileSync(INDEX, 'utf8');
const orig = html;
html = html
  .replace(/\b158\+/g, `${n}+`)
  .replace(/\b158 VENUES\b/g, `${n} VENUES`)
  .replace(/\b158 Venues\b/g, `${n} Venues`)
  .replace(/\b158 venues\b/g, `${n} venues`)
  .replace(/\b158 hand-checked\b/gi, `${n} hand-checked`);

if (html === orig) {
  console.log(`sync-index-venue-count: index.html already shows ${n} venues (no 158 literals found).`);
} else {
  fs.writeFileSync(INDEX, html, 'utf8');
  console.log(`sync-index-venue-count: updated index.html to ${n} venues.`);
}
