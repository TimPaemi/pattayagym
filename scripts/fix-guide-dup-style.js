#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const guidesDir = path.join(__dirname, '..', 'guides');
let n = 0;
for (const e of fs.readdirSync(guidesDir, { withFileTypes: true })) {
  if (!e.isDirectory()) continue;
  const f = path.join(guidesDir, e.name, 'index.html');
  if (!fs.existsSync(f)) continue;
  let h = fs.readFileSync(f, 'utf8');
  const o = h;
  h = h.replace(
    /class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;"\s+style="/g,
    'class="hero-lede" style="text-align:left; margin-left:0; max-width:760px; '
  );
  if (h !== o) {
    fs.writeFileSync(f, h);
    n++;
  }
}
console.log('fixed duplicate style on', n, 'guides');
