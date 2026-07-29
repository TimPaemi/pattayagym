#!/usr/bin/env node
'use strict';
/**
 * verify-ship-chain.js — S2-F1 gate.
 *
 * The July 2026 audit found three documents each defining a different ship
 * chain for one site: AGENTS.md, .internal-docs/ENRICH-2026-07.md and
 * SHIP-GYM.ps1. AGENTS.md omitted normalize-entity-graph.js, ordered
 * verify-deploy ahead of the encoding and network gates, and never mentioned
 * validate.js, verify.js, seo-audit.js or html:validate-all. Whichever document
 * you happened to read, you ran a different build.
 *
 * scripts/ship-chain.json is now the only definition. This gate proves it:
 *
 *   1. every script the manifest names actually exists;
 *   2. the generated block in AGENTS.md matches the manifest exactly;
 *   3. SHIP-GYM.ps1 still reads the manifest rather than a hardcoded list.
 *
 * Fix (1) by correcting the manifest, (2) with `node scripts/write-ship-chain-doc.js`.
 */
const fs = require('fs');
const path = require('path');
const { render, START, END, chain } = require('./write-ship-chain-doc.js');

const ROOT = path.resolve(__dirname, '..');
const errors = [];

// 1. every listed script exists
const listed = [...chain.build, ...chain.gates, ...(chain.manual || [])].filter(s => s.script);
for (const s of listed) {
  if (!fs.existsSync(path.join(ROOT, s.script))) errors.push(`ship-chain.json names a script that does not exist: ${s.script}`);
}

// 1b. every npm gate resolves to a real package script
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
for (const g of chain.gates.filter(x => x.npm)) {
  if (!pkg.scripts || !pkg.scripts[g.npm]) errors.push(`ship-chain.json names an npm script that package.json does not define: ${g.npm}`);
}

// 2. AGENTS.md is in sync
const md = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
const i = md.indexOf(START), j = md.indexOf(END);
if (i < 0 || j <= i) {
  errors.push('AGENTS.md has no SHIP-CHAIN block. Run: node scripts/write-ship-chain-doc.js');
} else if (md.slice(i, j + END.length) !== render()) {
  errors.push('AGENTS.md ship-chain block is out of date. Run: node scripts/write-ship-chain-doc.js');
}

// 3. SHIP-GYM.ps1 still drives off the manifest
const ship = fs.readFileSync(path.join(ROOT, 'SHIP-GYM.ps1'), 'utf8');
if (!/ship-chain\.json/.test(ship)) {
  errors.push('SHIP-GYM.ps1 no longer reads scripts/ship-chain.json — the chain has two definitions again.');
}

if (errors.length) {
  console.error('verify:ship-chain FAILED');
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}
console.log(`verify:ship-chain OK — ${chain.build.length} build steps, ${chain.gates.length} gates, one definition, AGENTS.md in sync.`);
