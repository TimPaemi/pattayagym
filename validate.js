#!/usr/bin/env node
/**
 * Validate pattaya-gym.com source data before generation.
 *
 * This intentionally uses the same no-dependency style as the build scripts so it
 * can run on Cloudflare Pages, GitHub Actions, and local machines without setup.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VENUES_DIR = path.join(ROOT, 'venues');
const DATA_FILE = path.join(ROOT, 'data.js');
const REQUIRED_FIELDS = ['id', 'name', 'category', 'area', 'verified'];
const OPTIONAL_FIELDS = ['address', 'phone', 'website', 'social', 'hours', 'priceRange', 'description', 'tags', 'mapsUrl'];

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: text, hasFrontmatter: false };
  const yaml = m[1];
  const body = m[2];
  const fm = {};
  const lines = yaml.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const flat = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (flat && !line.startsWith('  ')) {
      const key = flat[1];
      let val = flat[2];
      if (val === '' || val === null) {
        const block = [];
        i++;
        while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
          block.push(lines[i]);
          i++;
        }
        if (block.some(l => l.trim().startsWith('- '))) {
          fm[key] = block
            .filter(l => l.trim().startsWith('- '))
            .map(l => l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''));
        } else {
          const obj = {};
          block.forEach(l => {
            const kv = l.trim().match(/^([\w-]+):\s*(.*)$/);
            if (kv) obj[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
          });
          fm[key] = obj;
        }
        continue;
      }
      if (val.startsWith('[') && val.endsWith(']')) {
        fm[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else {
        fm[key] = val.replace(/^["']|["']$/g, '');
      }
      i++;
      continue;
    }
    i++;
  }
  return { fm, body, hasFrontmatter: true };
}

function loadData(root = ROOT) {
  const code = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
  const win = {};
  new Function('window', code)(win);
  return { GYMS: win.GYMS || [], CATEGORIES: win.CATEGORIES || [] };
}

function groupDuplicates(items, keyFn) {
  const seen = new Map();
  const dupes = [];
  items.forEach(item => {
    const key = keyFn(item);
    if (!key) return;
    if (seen.has(key)) dupes.push(key);
    else seen.set(key, item);
  });
  return dupes;
}

function validate(options = {}) {
  const root = options.root || ROOT;
  const venuesDir = path.join(root, 'venues');
  const dataFile = path.join(root, 'data.js');
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(dataFile)) errors.push('Missing data.js');
  if (!fs.existsSync(venuesDir)) errors.push('Missing venues/ directory');
  if (errors.length) return report(errors, warnings, options);

  const { GYMS, CATEGORIES } = loadData(root);
  const categoryKeys = new Set(CATEGORIES.map(c => c.key));
  const dataById = new Map();
  const dataIds = new Set();
  const mdIds = new Set();

  groupDuplicates(GYMS, g => g.id).forEach(id => errors.push(`Duplicate data.js venue id: ${id}`));
  groupDuplicates(CATEGORIES, c => c.key).forEach(key => errors.push(`Duplicate data.js category key: ${key}`));

  GYMS.forEach(g => {
    if (!g.id) errors.push(`data.js venue missing id: ${g.name || '(unnamed)'}`);
    else {
      dataById.set(g.id, g);
      dataIds.add(g.id);
    }
    if (g.category && !categoryKeys.has(g.category)) {
      errors.push(`data.js venue ${g.id || g.name} uses unknown category: ${g.category}`);
    }
    ['name', 'category', 'area', 'verified'].forEach(field => {
      if (g[field] == null || String(g[field]).trim() === '') {
        errors.push(`data.js venue ${g.id || g.name || '(unnamed)'} missing required field: ${field}`);
      }
    });
  });

  const mdFiles = fs.readdirSync(venuesDir).filter(f => f.endsWith('.md')).sort();
  groupDuplicates(mdFiles, f => f.replace(/\.md$/, '')).forEach(id => errors.push(`Duplicate venue markdown filename id: ${id}`));

  mdFiles.forEach(file => {
    const idFromFile = file.replace(/\.md$/, '');
    const full = path.join(venuesDir, file);
    const raw = fs.readFileSync(full, 'utf8');
    const parsed = parseFrontmatter(raw);
    const fm = parsed.fm;
    mdIds.add(idFromFile);

    if (!parsed.hasFrontmatter) errors.push(`${file} missing YAML frontmatter`);
    REQUIRED_FIELDS.forEach(field => {
      if (fm[field] == null || String(fm[field]).trim() === '') {
        errors.push(`${file} missing required frontmatter field: ${field}`);
      }
    });
    OPTIONAL_FIELDS.forEach(field => {
      if (fm[field] == null || (typeof fm[field] === 'string' && fm[field].trim() === '')) {
        warnings.push(`${file} missing optional field: ${field}`);
      }
    });
    if (fm.id && fm.id !== idFromFile) {
      errors.push(`${file} frontmatter id "${fm.id}" does not match filename "${idFromFile}"`);
    }
    if (fm.category && !categoryKeys.has(fm.category)) {
      errors.push(`${file} uses unknown category: ${fm.category}`);
    }
    if (!dataById.has(idFromFile)) {
      errors.push(`${file} has no matching data.js record`);
    } else {
      const record = dataById.get(idFromFile);
      ['name', 'category', 'area'].forEach(field => {
        if (fm[field] && record[field] && String(fm[field]) !== String(record[field])) {
          warnings.push(`${file} ${field} differs from data.js (${JSON.stringify(fm[field])} vs ${JSON.stringify(record[field])})`);
        }
      });
    }
    if (!parsed.body.trim()) warnings.push(`${file} has empty markdown body`);
  });

  dataIds.forEach(id => {
    if (!mdIds.has(id)) errors.push(`data.js record has no matching venues/${id}.md`);
  });

  return report(errors, warnings, options);
}

function report(errors, warnings, options = {}) {
  if (!options.silent) {
    const maxWarnings = options.maxWarnings === Infinity
      ? warnings.length
      : (Number.isInteger(options.maxWarnings) ? options.maxWarnings : 80);
    warnings.slice(0, maxWarnings).forEach(w => console.warn('[WARN] ' + w));
    if (warnings.length > maxWarnings) {
      console.warn('[WARN] ' + (warnings.length - maxWarnings) + ' more warning(s) omitted. Run node validate.js --all-warnings to show every warning.');
    }
    errors.forEach(e => console.error('[ERR] ' + e));
    console.log(`Validation: ${errors.length} error(s), ${warnings.length} warning(s)`);
  }
  return { ok: errors.length === 0, errors, warnings };
}

if (require.main === module) {
  const result = validate({
    maxWarnings: process.argv.includes('--all-warnings') ? Infinity : 80
  });
  process.exit(result.ok ? 0 : 1);
}

module.exports = { validate, parseFrontmatter };
