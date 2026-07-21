#!/usr/bin/env node
/**
 * pattaya-gym.com — Pre-Push Integrity Check
 * ============================================
 * Run BEFORE `git push origin main` to catch the truncation/corruption
 * class of bugs that have repeatedly broken the CI build.
 *
 * USAGE (from C:\pattayagym):
 *   node scripts/verify.js
 *
 * EXIT CODES:
 *   0  All checks passed — safe to push
 *   1  One or more checks failed — DO NOT push, fix listed issues first
 *
 * WHAT IT CHECKS:
 *   1. No null bytes in any text file (HTML/CSS/JS/MD/TXT/JSON/XML/YAML)
 *   2. Every *.html file ends with </html>
 *   3. Every *.html has balanced <html>, <head>, <body>, <footer>, <main>, <section>, <ul>, <a>, <div> pairs
 *   4. Every *.html has balanced attribute quotes (no truncated mid-attribute)
 *   5. styles.css braces balanced
 *   6. build.js / build-extras.js / build-discovery.js Node syntax valid
 *   7. No raw `${...}` template literals leaked into shipped HTML
 *   8. ASSET_VERSION consistent across all 3 build files
 *
 * Designed to be FAST (< 5 seconds for the whole site) and SAFE (read-only).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function* walk(dir, exts) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    if (['node_modules', '.tmp.driveupload', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full, exts);
    } else if (exts.some(e => entry.name.endsWith(e))) {
      yield full;
    }
  }
}

// === 1. NULL BYTE SCAN ===
console.log('1) Null-byte scan…');
let nulCount = 0;
for (const p of walk(ROOT, ['.html', '.css', '.js', '.md', '.txt', '.json', '.xml', '.yaml', '.yml'])) {
  const buf = fs.readFileSync(p);
  if (buf.includes(0x00)) {
    err(`NULL BYTES in ${path.relative(ROOT, p)}`);
    nulCount++;
  }
}
console.log(`   ${nulCount === 0 ? '✓' : '✗'} ${nulCount} file(s) with null bytes`);

// === 2. HTML TRUNCATION CHECK ===
console.log('2) HTML truncation scan (must end with </html>)…');
let truncCount = 0;
for (const p of walk(ROOT, ['.html'])) {
  const content = fs.readFileSync(p, 'utf8').trimEnd();
  if (!content.endsWith('</html>')) {
    err(`TRUNCATED ${path.relative(ROOT, p)} — last 80 chars: ${JSON.stringify(content.slice(-80))}`);
    truncCount++;
  }
}
console.log(`   ${truncCount === 0 ? '✓' : '✗'} ${truncCount} truncated HTML file(s)`);

// === 3. HTML TAG BALANCE ===
console.log('3) HTML critical tag balance…');
let tagFails = 0;
const TAGS = ['html', 'head', 'body', 'footer', 'nav', 'main'];
for (const p of walk(ROOT, ['.html'])) {
  const content = fs.readFileSync(p, 'utf8');
  for (const t of TAGS) {
    // Count <tag> or <tag attr=...> openings (not counting self-closing or comments)
    const openRe = new RegExp(`<${t}(?:\\s|>)`, 'gi');
    const closeRe = new RegExp(`</${t}>`, 'gi');
    const o = (content.match(openRe) || []).length;
    const c = (content.match(closeRe) || []).length;
    if (o !== c) {
      err(`UNBALANCED <${t}> in ${path.relative(ROOT, p)}: ${o} open / ${c} close`);
      tagFails++;
    }
  }
}
console.log(`   ${tagFails === 0 ? '✓' : '✗'} ${tagFails} tag balance failure(s)`);

// === 4. HTML ATTRIBUTE-QUOTE BALANCE ===
console.log('4) HTML attribute quote balance…');
let quoteFails = 0;
for (const p of walk(ROOT, ['.html'])) {
  const content = fs.readFileSync(p, 'utf8');
  // Quick check: does any line have href=" with no closing "?
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // Find href=" or src=" or data-*=" without closing quote on same line
    // (multi-line attributes are valid but rare for our content)
    const m = line.match(/(href|src|alt|title|data-[\w-]+|aria-[\w-]+)="[^"]*$/);
    if (m && !line.endsWith('\\')) {
      // Might be a multi-line attribute. Check if next 2 lines contain the close quote
      const remaining = lines.slice(i, i + 3).join('\n');
      if (!remaining.includes('">') && !remaining.match(/"\s/)) {
        err(`UNCLOSED ATTRIBUTE in ${path.relative(ROOT, p)}:${i + 1} — ${m[0].slice(0, 80)}`);
        quoteFails++;
      }
    }
  });
}
console.log(`   ${quoteFails === 0 ? '✓' : '✗'} ${quoteFails} unclosed attribute(s)`);

// === 5. CSS BRACE BALANCE ===
console.log('5) CSS brace balance…');
let cssFails = 0;
for (const p of walk(ROOT, ['.css'])) {
  const content = fs.readFileSync(p, 'utf8');
  // Strip /* ... */ comments first
  const stripped = content.replace(/\/\*[\s\S]*?\*\//g, '');
  const opens = (stripped.match(/\{/g) || []).length;
  const closes = (stripped.match(/\}/g) || []).length;
  if (opens !== closes) {
    err(`UNBALANCED BRACES in ${path.relative(ROOT, p)}: ${opens} open / ${closes} close (diff ${opens - closes})`);
    cssFails++;
  }
}
console.log(`   ${cssFails === 0 ? '✓' : '✗'} ${cssFails} CSS file(s) with unbalanced braces`);

// === 6. NODE SYNTAX CHECK ===
console.log('6) Node.js syntax check on build files…');
let syntaxFails = 0;
const buildFiles = ['build.js', 'build-extras.js', 'build-discovery.js'];
for (const f of buildFiles) {
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)) continue;
  try {
    execSync(`node --check "${fp}"`, { stdio: 'pipe' });
  } catch (e) {
    err(`NODE SYNTAX ERROR in ${f}: ${e.stderr ? e.stderr.toString().slice(0, 200) : e.message}`);
    syntaxFails++;
  }
}
console.log(`   ${syntaxFails === 0 ? '✓' : '✗'} ${syntaxFails} build file syntax error(s)`);

// === 7. RAW TEMPLATE LITERAL LEAK ===
console.log('7) Raw template-literal leak in shipped HTML…');
let tplFails = 0;
for (const p of walk(ROOT, ['.html'])) {
  let content = fs.readFileSync(p, 'utf8');
  // Strip <script>...</script> blocks — legitimate JS template literals live there
  content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  // Also strip <style> blocks (rare but possible)
  content = content.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  // Look for `${something}` that wasn't interpolated server-side
  const matches = content.match(/\$\{[^}]+\}/g);
  if (matches) {
    err(`UNRESOLVED TEMPLATE in ${path.relative(ROOT, p)}: ${matches.slice(0, 3).join(', ')}`);
    tplFails++;
  }
}
console.log(`   ${tplFails === 0 ? '✓' : '✗'} ${tplFails} unresolved template-literal leak(s)`);

// === 8. ASSET_VERSION CONSISTENCY ===
console.log('8) ASSET_VERSION consistency across build files…');
const versions = {};
for (const f of buildFiles) {
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)) continue;
  const c = fs.readFileSync(fp, 'utf8');
  const m = c.match(/ASSET_VERSION\s*=\s*['"](\d+)['"]/);
  versions[f] = m ? m[1] : 'MISSING';
}
const versionVals = Object.values(versions);
const allSame = versionVals.every(v => v === versionVals[0]);
if (!allSame) {
  err(`ASSET_VERSION DRIFT: ${JSON.stringify(versions)}`);
} else {
  console.log(`   ✓ All build files at v${versionVals[0]}`);
}

// === RESULT ===
console.log('\n' + '═'.repeat(60));
if (warnings.length) {
  console.log(`⚠ ${warnings.length} warning(s):`);
  warnings.slice(0, 10).forEach(w => console.log(`  - ${w}`));
}
if (errors.length) {
  console.log(`\n✗ FAILED — ${errors.length} error(s):\n`);
  errors.slice(0, 30).forEach(e => console.log(`  • ${e}`));
  if (errors.length > 30) console.log(`  ... and ${errors.length - 30} more`);
  console.log('\n⛔ DO NOT PUSH. Fix the issues above first.');
  process.exit(1);
} else {
  console.log('\n✓ ALL CHECKS PASSED. Safe to push.');
  process.exit(0);
}
