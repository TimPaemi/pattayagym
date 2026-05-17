#!/usr/bin/env node
/**
 * verify-deploy.js
 * Pre-push integrity check. Fails fast if the working tree has:
 *   - Any HTML file not ending with </html>
 *   - Any HTML file ending mid-attribute (truncation)
 *   - styles.css with unbalanced braces
 *   - Any file with trailing NUL bytes (recurring Windows-mount artifact)
 *   - build-v2.js or data.js failing node --check
 *
 * Run from repo root: `node scripts/verify-deploy.js`
 * Exit code 0 = clean, 1 = failures (logged).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const errors = [];

// --- Syntax check key JS files ---
for (const f of ['build-v2.js', 'data.js']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) {
    errors.push(`${f}: missing`);
    continue;
  }
  try {
    execSync(`node --check "${p}"`, { stdio: 'pipe' });
  } catch (e) {
    errors.push(`${f}: node --check FAILED - ${e.stderr ? e.stderr.toString().split('\n')[0] : e.message}`);
  }
}

// --- Walk HTML files ---
const htmlFiles = [];
function walkHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.backups') continue;
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(fp);
    else if (entry.name.endsWith('.html')) htmlFiles.push(fp);
  }
}
walkHtml(ROOT);

let truncated = 0, midAttr = 0, nulled = 0;
for (const fp of htmlFiles) {
  const buf = fs.readFileSync(fp);
  const trimmed = buf.subarray(0, buf.length).toString('utf8').trimEnd();
  if (!trimmed.endsWith('</html>')) {
    errors.push(`${path.relative(ROOT, fp)}: does NOT end with </html>`);
    truncated++;
  }
  // Mid-attribute detection: last 100 chars contain an unclosed quote-in-attr pattern
  const tail = trimmed.slice(-200);
  if (/href="[^"]*$/.test(tail) || /src="[^"]*$/.test(tail) || /class="[^"]*$/.test(tail)) {
    errors.push(`${path.relative(ROOT, fp)}: ends mid-attribute`);
    midAttr++;
  }
  // NUL byte check
  if (buf.includes(0)) {
    errors.push(`${path.relative(ROOT, fp)}: contains NUL bytes (${buf.filter(b => b === 0).length} of them)`);
    nulled++;
  }
}

// --- CSS brace balance check ---
const cssPath = path.join(ROOT, 'styles.css');
if (fs.existsSync(cssPath)) {
  const cssBuf = fs.readFileSync(cssPath);
  const cssStr = cssBuf.toString('utf8');
  const opens = (cssStr.match(/\{/g) || []).length;
  const closes = (cssStr.match(/\}/g) || []).length;
  if (opens !== closes) {
    errors.push(`styles.css: brace imbalance - ${opens} { vs ${closes} }`);
  }
  if (cssBuf.includes(0)) {
    errors.push(`styles.css: contains NUL bytes`);
  }
}

// --- CSP hash sanity (informational, not blocking) ---
const headersPath = path.join(ROOT, '_headers');
if (fs.existsSync(headersPath)) {
  const hdrs = fs.readFileSync(headersPath, 'utf8');
  const cspHashes = [...hdrs.matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g)].map(m => m[1]);
  // Compute hashes of all unique inline scripts across HTML files
  const crypto = require('crypto');
  const found = new Set();
  for (const fp of htmlFiles) {
    const html = fs.readFileSync(fp, 'utf8');
    const re = /<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(html))) {
      const body = m[1];
      if (!body.trim()) continue;
      const h = crypto.createHash('sha256').update(body, 'utf8').digest('base64');
      found.add(h);
    }
  }
  const missing = [...found].filter(h => !cspHashes.includes(h));
  if (missing.length) {
    console.error('\n--- CSP hash debug ---');
    console.error('Hashes in _headers CSP (' + cspHashes.length + '):');
    for (const h of cspHashes) console.error('  cspHashes: [' + h + ']');
    console.error('Hashes computed from inline scripts (' + found.size + '):');
    for (const h of found) console.error('  found:     [' + h + ']');
    console.error('--- end debug ---\n');
    for (const m of missing) errors.push(`_headers CSP: missing inline-script hash sha256-${m}`);
  }
}

// --- Report ---
console.log(`HTML files checked: ${htmlFiles.length}`);
console.log(`  truncated (no </html>): ${truncated}`);
console.log(`  mid-attribute endings:  ${midAttr}`);
console.log(`  with NUL bytes:         ${nulled}`);

if (errors.length === 0) {
  console.log('\n✓ Deploy verify PASSED');
  process.exit(0);
} else {
  console.error(`\n✗ Deploy verify FAILED with ${errors.length} issue(s):`);
  for (const e of errors.slice(0, 25)) console.error('  - ' + e);
  if (errors.length > 25) console.error(`  ... and ${errors.length - 25} more`);
  process.exit(1);
}
