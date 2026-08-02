#!/usr/bin/env node
'use strict';
/**
 * repair-agents-doc.cjs - restores the generated SHIP-CHAIN block in AGENTS.md
 * when a network sync has dropped it. The block content comes from
 * write-ship-chain-doc.js render() (i.e. from scripts/ship-chain.json), so
 * nothing is hand-written. Pair with: node scripts/verify-encoding.js --fix
 */
const fs = require('fs');
const path = require('path');
const m = require('./write-ship-chain-doc.js');
const file = path.resolve(__dirname, '..', 'AGENTS.md');
let s = fs.readFileSync(file, 'utf8');
let changed = [];
if (s.charCodeAt(0) === 0xFEFF) { s = s.slice(1); changed.push('BOM stripped'); }
if (!s.includes(m.START)) {
  s = s.replace(/\s*$/, '') + '\n\n' + m.render() + '\n';
  changed.push('SHIP-CHAIN block restored');
}
if (changed.length) {
  fs.writeFileSync(file, s, 'utf8');
  console.log('[repair-agents-doc] ' + changed.join(' + '));
} else {
  console.log('[repair-agents-doc] AGENTS.md clean - nothing to do');
}
