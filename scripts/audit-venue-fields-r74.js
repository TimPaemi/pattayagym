#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { GYMS } = require('../data.js');

function parseFm(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const val = kv[2].replace(/^["']|["']$/g, '').trim();
    if (val) fm[kv[1]] = val;
  }
  return fm;
}

let mdPhone = 0;
let syncable = [];
let hoursMd = 0;
let zipInAddr = 0;
for (const g of GYMS) {
  if (!g.detailFile) continue;
  const fp = path.join(__dirname, '..', g.detailFile);
  if (!fs.existsSync(fp)) continue;
  const fm = parseFm(fs.readFileSync(fp, 'utf8'));
  if (fm.phone && fm.phone.length > 4) mdPhone++;
  const dataEmpty = !g.phone || g.phone.length < 5;
  if (fm.phone && fm.phone.length > 4 && dataEmpty) syncable.push({ id: g.id, phone: fm.phone });
  if (fm.hours && fm.hours.length > 3) hoursMd++;
  if (/\d{5}/.test(g.address || '') || /\d{5}/.test(fm.address || '')) zipInAddr++;
}

const gymsDir = path.join(__dirname, '..', 'gyms');
let htmlTel = 0;
let htmlHours = 0;
let htmlZip = 0;
for (const g of GYMS) {
  const fp = path.join(gymsDir, g.id, 'index.html');
  if (!fs.existsSync(fp)) continue;
  const h = fs.readFileSync(fp, 'utf8');
  if (h.includes('"telephone"')) htmlTel++;
  if (h.includes('openingHoursSpecification')) htmlHours++;
  if (h.includes('"postalCode"')) htmlZip++;
}

console.log({
  mdPhone,
  dataPhone: GYMS.filter(g => g.phone && g.phone.length > 4).length,
  syncableToData: syncable.length,
  hoursInMd: hoursMd,
  htmlTelephone: htmlTel,
  htmlOpeningHoursSpec: htmlHours,
  htmlPostalCode: htmlZip,
  total: GYMS.length,
});
if (syncable.length) {
  console.log('\nSyncable phones (md → data.js):');
  syncable.slice(0, 20).forEach(r => console.log(`  ${r.id}: ${r.phone}`));
}
