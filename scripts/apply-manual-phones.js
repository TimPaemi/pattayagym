#!/usr/bin/env node
/**
 * apply-manual-phones.js — Merge all data/manual-phones-r*.json into venues/*.md and data.js.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data.js');

const files = fs
  .readdirSync(path.join(ROOT, 'data'))
  .filter((f) => /^manual-phones-r\d+\.json$/.test(f))
  .sort();

let manual = {};
for (const f of files) {
  const chunk = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
  for (const [id, row] of Object.entries(chunk)) {
    if (id.startsWith('_')) continue;
    manual[id] = row;
  }
}

let dataJs = fs.readFileSync(DATA_PATH, 'utf8');
let mdN = 0;
let dataN = 0;

for (const [id, row] of Object.entries(manual)) {
  const phone = (row.phone || '').trim();
  if (phone.length < 6) continue;

  const mdPath = path.join(ROOT, 'venues', `${id}.md`);
  if (fs.existsSync(mdPath)) {
    let md = fs.readFileSync(mdPath, 'utf8');
    if (/^phone:\s*.*/m.test(md)) {
      md = md.replace(/^phone:\s*.*$/m, `phone: "${phone}"`);
    } else {
      md = md.replace(/^(id:.*\n)/, `$1phone: "${phone}"\n`);
    }
    if (row.website && /^website:\s*.*/m.test(md)) {
      md = md.replace(/^website:\s*.*$/m, `website: ${row.website}`);
    }
    fs.writeFileSync(mdPath, md);
    mdN++;
  }

  const idRe = new RegExp(`(\\{ id: "${id}"[\\s\\S]*?phone: )"[^"]*"`, 'm');
  if (idRe.test(dataJs)) {
    dataJs = dataJs.replace(idRe, `$1"${phone}"`);
    dataN++;
  } else {
    console.warn(`apply-manual-phones: no data.js phone field for ${id}`);
  }

  if (row.website) {
    const webRe = new RegExp(`(\\{ id: "${id}"[\\s\\S]*?website: )"[^"]*"`, 'm');
    if (webRe.test(dataJs)) {
      dataJs = dataJs.replace(webRe, `$1"${row.website}"`);
    }
  }
}

fs.writeFileSync(DATA_PATH, dataJs);

const { GYMS } = require(DATA_PATH);
const withPhone = GYMS.filter((g) => g.phone && g.phone.length > 4).length;
console.log(`apply-manual-phones: ${files.length} file(s), md=${mdN}, data.js=${dataN}`);
console.log(`apply-manual-phones: ${withPhone}/${GYMS.length} venues with phone in data.js`);
