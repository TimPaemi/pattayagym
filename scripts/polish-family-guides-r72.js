#!/usr/bin/env node
/**
 * polish-family-guides-r72.js — Merge deepen-r68 inject sections; rename legacy deepen h2 ids.
 * Targets Tier B family ranked guides (1199w → Tier A, no deepen-rNN section markers).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SLUGS = ['family-friendly-pattaya', 'pattaya-gyms-childcare-family-pools'];

function polish(html) {
  let next = html;
  // Legacy h2 ids (not counted as injects, but clean for coherence)
  next = next.replace(/id="deepen-r44-block-fam-h"/g, 'id="guide-family-planning-h"');
  next = next.replace(/id="deepen-r63-block-fam2-h"/g, 'id="guide-family-rainy-h"');
  next = next.replace(/id="deepen-r68-block-fam-h"/g, 'id="guide-family-itinerary-h"');
  next = next.replace(/id="deepen-r68-block-cc-h"/g, 'id="guide-family-morning-h"');

  const injectRe = /<section class="guide-editorial-depth" id="deepen-r68-block"[\s\S]*?<\/section>\s*/i;
  const m = next.match(injectRe);
  if (m) {
    const inner = m[0]
      .replace(/<section class="guide-editorial-depth" id="deepen-r68-block"[^>]*>/i, '')
      .replace(/<\/section>\s*$/i, '')
      .replace(/id="guide-family-itinerary-h"/, 'id="guide-family-itinerary-h"');
    next = next.replace(injectRe, '');
    const primerClose = next.indexOf('</section>', next.indexOf('class="guide-rank-primer"'));
    if (primerClose > -1) {
      const note =
        '<p class="guide-rank-note">Confirm kids policies, pool depth, and supervision rules on arrival — our directory is hand-checked on a rolling schedule, not live operations data.</p>\n  ';
      next = next.slice(0, primerClose) + '\n  ' + inner.trim() + '\n  ' + note + next.slice(primerClose);
    } else {
      const anchor = '<div id="full-list"></div>';
      next = next.replace(anchor, inner + '\n  ' + anchor);
    }
  } else if (!next.includes('guide-rank-note')) {
    const primerClose = next.indexOf('</section>', next.indexOf('class="guide-rank-primer"'));
    if (primerClose > -1) {
      const note =
        '<p class="guide-rank-note">Confirm kids policies, pool depth, and supervision rules on arrival — our directory is hand-checked on a rolling schedule, not live operations data.</p>\n  ';
      next = next.slice(0, primerClose) + '\n  ' + note + next.slice(primerClose);
    }
  }
  return next;
}

let n = 0;
for (const slug of SLUGS) {
  const fp = path.join(ROOT, 'guides', slug, 'index.html');
  if (!fs.existsSync(fp)) continue;
  const orig = fs.readFileSync(fp, 'utf8');
  const next = polish(orig);
  if (next !== orig) {
    fs.writeFileSync(fp, next, 'utf8');
    console.log(`  polished ${slug}`);
    n++;
  }
}
console.log(`polish-family-guides-r72: ${n} guide(s).`);
