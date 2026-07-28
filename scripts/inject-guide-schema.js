#!/usr/bin/env node
/**
 * inject-guide-schema.js
 *
 * Codex Nuclear V3 P2-6: guide pages currently emit only CollectionPage + BreadcrumbList
 * JSON-LD. They lack Article schema (which unlocks article-rich snippets) and FAQPage
 * schema (which unlocks the expandable FAQ rich result in Google).
 *
 * This script reads each guide HTML, injects:
 *   - Article schema (headline, author, datePublished, publisher, image)
 *   - FAQPage schema IF the body contains FAQ-shaped content (h2/h3 followed by paragraph)
 *
 * Idempotent — checks for existing Article/FAQPage and skips if present.
 *
 * Run from repo root: `node scripts/inject-guide-schema.js`
 */

const fs = require('fs');
const path = require('path');
const { normalizeGuideHeadMeta } = require('./lib/normalize-guide-head-meta');
const { bylineAuthorHtml, timpaemiRef, timpaemiOrganization, authorRefs, authorPersons, TIM_ID, PAEMI_ID } = require('./lib/timpaemi-author');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
function escAttr(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Extract a list of FAQ-shaped Q/A pairs from the body HTML.
// Heuristic: any h2/h3 that ends with "?" or starts with "How/What/Why/Can/Is/Are/Do/Does/Should/When/Where"
// followed by one or more <p> tags before the next heading.
function extractFAQ(bodyHtml) {
  const faqs = [];
  const bodyNoCta = bodyHtml
    .replace(/<div class="venue-cta-foot"[\s\S]*?<\/div>/gi, '')
    .replace(/<div class="guide-compare-cta"[\s\S]*?<\/div>/gi, '');
  const re = /<(h[23])\b[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<h[1-6]\b|<\/article>|<\/main>|$)/gi;
  let m;
  const FAQ_RE = /\?$|^(how |what |what's |why |can |is |are |do |does |should |when |where |which |who |will |how's |best )/i;
  const SKIP_Q = /compare these side-by-side|want to compare/i;
  while ((m = re.exec(bodyNoCta))) {
    const headingText = stripTags(m[2]);
    if (!headingText) continue;
    if (SKIP_Q.test(headingText)) continue;
    if (!FAQ_RE.test(headingText)) continue;
    // Pull first 1-3 <p> tags as the answer
    const pMatches = m[3].match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi);
    if (!pMatches) continue;
    const answer = stripTags(pMatches.slice(0, 3).join(' '));
    if (answer.length < 30) continue;
    faqs.push({ question: headingText, answer });
  }
  return faqs;
}

// Ranked guides use <section class="guide-faq"> with <details>/<summary> — prefer that over h2 heuristics.
// Editorial guides: <li><strong>Question?</strong> → answer</li>
function extractFAQFromListItems(bodyHtml) {
  const faqs = [];
  const re = /<li>\s*<strong>([^<]*\?[^<]*)<\/strong>\s*(?:→|—|–|-)?\s*([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = re.exec(bodyHtml))) {
    const question = stripTags(m[1]).trim();
    const answer = stripTags(m[2]).trim();
    if (question.length < 8 || answer.length < 20) continue;
    faqs.push({ question, answer });
  }
  return faqs;
}

function extractFAQFromDetails(bodyHtml) {
  const faqs = [];
  const sec = bodyHtml.match(/<section\s+class="guide-faq"[\s\S]*?<\/section>/i);
  if (!sec) return faqs;
  const re = /<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(sec[0]))) {
    const question = stripTags(m[1]);
    const answer = stripTags(m[2]);
    if (question.length < 8 || answer.length < 20) continue;
    faqs.push({ question, answer });
  }
  return faqs;
}

function readGuidePages() {
  const out = [];
  const guidesDir = path.join(ROOT, 'guides');
  if (!fs.existsSync(guidesDir)) return out;
  for (const entry of fs.readdirSync(guidesDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const p = path.join(guidesDir, entry.name, 'index.html');
      if (fs.existsSync(p)) {
        out.push({ slug: entry.name, path: p, url: `${SITE}/guides/${entry.name}/` });
      }
    }
  }
  return out;
}

let articleAdded = 0;
let faqAdded = 0;
let skipped = 0;
let authorPatched = 0;
const newlyDated = [];

function stripFaqLd(html) {
  return html.replace(/<script type="application\/ld\+json">\{[^<]*"@type":"FAQPage"[^<]*\}<\/script>\s*/g, '');
}

function wordCountFromMain(html) {
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const bodyHtml = mainMatch ? mainMatch[1] : html;
  const plain = bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.split(/\s+/).filter(Boolean).length;
}

for (const guide of readGuidePages()) {
  let html = fs.readFileSync(guide.path, 'utf8');
  html = stripFaqLd(html);

  // Parse title + description from meta
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  /* The visible date is rendered as `Updated <time datetime="YYYY-MM-DD">`. The two
     patterns below it were written for a `Updated \u00b7 YYYY-MM-DD` form that this
     template has not emitted for some time, so neither ever matched and every guide
     silently fell back to the hardcoded 2026-05-17. Result, measured 2026-07-28:
     43 of 47 guides displayed one date and declared a different one in their own
     Article schema. Read the <time> element first. */
  const dateMatch = html.match(/Updated\s*<time[^>]+datetime="(\d{4}-\d{2}-\d{2})"/i)
    || html.match(/Last updated · ([\d-]+)/)
    || html.match(/Updated · ([\d-]+)/);
  const title = titleMatch ? decodeEntities(titleMatch[1]).split('|')[0].trim() : 'Pattaya.Gym guide';
  const desc = descMatch ? decodeEntities(descMatch[1]) : '';
  /* No visible date yet means this script is adding the byline for the first time -
     the guide was just written by one of the write-*-guides scripts in this same run.
     Stamp today, not a hardcoded 2026-05-17, which is how a freshly generated guide
     used to ship claiming it was two months old. */
  const pubDate = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);
  if (!dateMatch) newlyDated.push(guide.url);

  const blocks = [];

  // 1) Article schema (skip if already present)
  if (!/"@type"\s*:\s*"Article"/.test(html)) {
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${guide.url}#article`,
      headline: title,
      description: desc,
      image: `${SITE}/og-image.png`,
      url: guide.url,
      inLanguage: 'en',
      datePublished: pubDate,
      dateModified: pubDate,
      author: authorRefs(),
      publisher: timpaemiRef(),
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${guide.url}#webpage` },
      isAccessibleForFree: true
    };
    blocks.push(`<script type="application/ld+json">${JSON.stringify(articleLd)}</script>`);
    articleAdded++;
  } else {
    // FOOTER-SPEC-2026: consolidate author AND publisher onto @id references
    // to the TimPaemi Organization entity. Matches the legacy flat author
    // shape, the prior embedded Person-entity shape, and the prior
    // Pattaya.Gym Organization publisher. Idempotent on re-runs.
    const canonicalAuthor = `"author":${JSON.stringify(authorRefs())}`;
    const canonicalPublisher = `"publisher":${JSON.stringify(timpaemiRef())}`;
    let patched = html.replace(
      /"author":\{"@type":"Person","name":"Tim Paemi","url":"[^"]*"\}/g,
      canonicalAuthor
    );
    patched = patched.replace(
      /"author":\{"@type":"Person","@id":"https:\/\/timpaemi\.com\/#timpaemi".*?"sameAs":\[[^\]]*\]\}/g,
      canonicalAuthor
    );
    patched = patched.replace(
      /"publisher":\{"@type":"Organization","@id":"https:\/\/pattaya-gym\.com\/#organization","name":"Pattaya\.Gym","logo":\{[^{}]*\}\}/g,
      canonicalPublisher
    );
    // Any surviving single-node author (the @id form this script used to write)
    // becomes the two-Person array.
    patched = patched.replace(
      /"author":\{"@id":"https:\/\/timpaemi\.com\/#timpaemi"\}/g,
      canonicalAuthor
    );
    // dateModified must equal what the reader sees. A page that displays one date
    // and declares another is a trust signal pointing the wrong way.
    patched = patched.replace(
      /("@type":"Article"[\s\S]*?)"dateModified":"\d{4}-\d{2}-\d{2}"/g,
      (m, head) => `${head}"dateModified":"${pubDate}"`
    );
    // Drop the 2026-01-01 placeholder datePublished; if we do not know when a guide
    // was first published, claiming a date is worse than omitting one.
    patched = patched.replace(/"datePublished":"2026-01-01",?/g, '');
    if (patched !== html) { html = patched; authorPatched++; }
  }

  // FOOTER-SPEC-2026: emit the TimPaemi Organization entity once per page.
  /* REPLACE, don't skip. A guide that already carried an Organization block kept
     whatever shape it was written with - including the old `founder` array of bare
     {"@type":"Person","name":"Tim"} nodes with no url and no @id. 76 of those
     survived the first pass of this fix on 2026-07-28 precisely because this check
     said "already present, leave it". Rewrite it every run so one definition wins. */
  const orgScript = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...timpaemiOrganization() })}</script>`;
  const orgRe = /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"Organization","@id":"https:\/\/timpaemi\.com\/#timpaemi"[\s\S]*?<\/script>/g;
  if (orgRe.test(html)) {
    html = html.replace(orgRe, orgScript);
  } else {
    blocks.push(orgScript);
  }
  // The two Person nodes the author refs point at. Without these the @ids dangle,
  // and a dangling author reference is worth exactly nothing to Google.
  // Same rule for the two Person nodes: one definition, rewritten each run.
  const personRe = /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"Person","@id":"https:\/\/timpaemi\.com\/#(?:tim|paemi)"[\s\S]*?<\/script>\s*/g;
  html = html.replace(personRe, '');
  for (const person of authorPersons()) {
    blocks.push(`<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...person })}</script>`);
  }

  // 2) FAQPage schema — rebuild from on-page FAQ headings (CTA blocks excluded)
  {
    const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    const bodyHtml = mainMatch ? mainMatch[1] : html;
    let faqs = extractFAQFromDetails(bodyHtml);
    if (faqs.length < 2) faqs = extractFAQ(bodyHtml);
    if (faqs.length < 2) faqs = extractFAQFromListItems(bodyHtml);
    if (faqs.length >= 2) {
      const faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(q => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer
          }
        }))
      };
      blocks.push(`<script type="application/ld+json">${JSON.stringify(faqLd)}</script>`);
      faqAdded++;
    }
  }

  if (blocks.length > 0) {
    // Inject schema before </head>
    const headInjection = blocks.join('\n') + '\n';
    html = html.replace(/<\/head>/i, headInjection + '</head>');
  } else {
    skipped++;
  }

  const words = wordCountFromMain(html);
  const readingMin = Math.max(2, Math.round(words / 200));

  if (!/<div class="guide-byline"/.test(html)) {
    const byline = `<div class="guide-byline">
  <span class="guide-byline-author">${bylineAuthorHtml()}</span>
  <span class="guide-byline-dot">·</span>
  <span class="guide-byline-time">${readingMin} min read</span>
  <span class="guide-byline-dot">·</span>
  <span class="guide-byline-date">Updated <time datetime="${pubDate}">${pubDate}</time></span>
  <span class="guide-byline-dot">·</span>
  <a href="/methodology/" class="guide-byline-link">How we rank →</a>
</div>`;
    html = html.replace(/(<\/h1>)/, '$1\n' + byline);
  } else {
    html = html.replace(
      /<span class="guide-byline-time">[^<]*<\/span>/,
      `<span class="guide-byline-time">${readingMin} min read</span>`
    );
    // Normalize existing bylines onto the TimPaemi entity
    html = html.replace(
      /<span class="guide-byline-author">By <a [^>]*>[^<]*<\/a><\/span>/,
      `<span class="guide-byline-author">${bylineAuthorHtml()}</span>`
    );
  }

  // <meta name="author"> for crawlers/AI that read head metadata only
  if (!/<meta name="author"/.test(html)) {
    html = html.replace(/(<meta name="robots")/, '<meta name="author" content="Tim and Paemi, TimPaemi Co., Ltd.">\n$1');
  }

  html = normalizeGuideHeadMeta(html);
  fs.writeFileSync(guide.path, html, 'utf8');
}

console.log(`Guide schema enrichment: Article added to ${articleAdded} guides; FAQPage added to ${faqAdded} guides; ${skipped} already had both; author entity patched on ${authorPatched}. Bylines + reading time + head meta normalized.`);
if (newlyDated.length) {
  console.log(`  ${newlyDated.length} guide(s) had no byline yet and were stamped with today's date:`);
  newlyDated.forEach(u => console.log(`    ${u}`));
}
console.log('  every other guide dateModified was read from the date the page actually displays');
