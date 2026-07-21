#!/usr/bin/env node
/**
 * apply-phones-r75.js — Apply manual-phones-r75.json to venues/*.md and data.js.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANUAL_PATH = path.join(ROOT, 'data', 'manual-phones-r75.json');
const DATA_PATH = path.join(ROOT, 'data.js');

const manual = JSON.parse(fs.readFileSync(MANUAL_PATH, 'utf8'));
let dataJs = fs.readFileSync(DATA_PATH, 'utf8');
let mdN = 0;
let dataN = 0;

for (const [id, row] of Object.entries(manual)) {
  if (id.startsWith('_')) continue;
  const phone = (row.phone || '').trim();
  if (phone.length < 6) continue;

  const mdPath = path.join(ROOT, 'venues', `${id}.md`);
  if (fs.existsSync(mdPath)) {
    let md = fs.readFileSync(mdPath, 'utf8');
    if (/^phone:\s*.*/m.test(md)) {
      md = md.replace(/^phone:\s*.*$/m, `phone: "${phone}"`);
    } else {
      md = md.replace(/^(---\n[\s\S]*?\n)(?=\w)/, `$1phone: "${phone}"\n`);
    }
    if (row.website) {
      if (/^website:\s*.*/m.test(md)) {
        md = md.replace(/^website:\s*.*$/m, `website: ${row.website}`);
      }
    }
    fs.writeFileSync(mdPath, md);
    mdN++;
  }

  const idRe = new RegExp(`(\\{ id: "${id}"[\\s\\S]*?phone: )"[^"]*"`, 'm');
  if (idRe.test(dataJs)) {
    dataJs = dataJs.replace(idRe, `$1"${phone}"`);
    dataN++;
  } else {
    console.warn(`apply-phones-r75: no data.js phone field for ${id}`);
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
console.log(`apply-phones-r75: md=${mdN}, data.js=${dataN}`);
console.log(`apply-phones-r75: ${withPhone}/${GYMS.length} venues with phone in data.js`);
