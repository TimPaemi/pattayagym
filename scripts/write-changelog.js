#!/usr/bin/env node
/**
 * write-changelog.js
 *
 * Generates a public-facing /changelog/ page listing every shipped round.
 * Linked from the footer version badge. Trust + transparency signal.
 *
 * Run: node scripts/write-changelog.js
 * Idempotent — rewrites the page each time so it stays in sync with
 * the current ASSET_VERSION and BUILD_TIMESTAMP.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const buildSrc = fs.readFileSync(path.join(ROOT, 'build-v2.js'), 'utf8');
const versionMatch = buildSrc.match(/const ASSET_VERSION\s*=\s*['"](\d+)['"]/);
const ASSET_VERSION = versionMatch ? versionMatch[1] : '407';
const ASSET = `?v=${ASSET_VERSION}`;
const TODAY = new Date().toISOString().slice(0, 10);
const BUILD_TS = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const TOP = ['★ EVERY GYM','EVERY RING','EVERY COURT','158 VENUES','HAND-CHECKED','NO PAID PLACEMENTS','PATTAYA · THAILAND','UPDATED ROLLING'];
const BOT = ['★ PATTAYA VILLA','NO PAID PLACEMENTS','HAND-CHECKED','EVERY GYM','EVERY RING','EVERY COURT','★ LIVE 158 VENUES','UPDATED ROLLING'];

function marquee(items, bot) {
  const cls = bot ? 'marquee marquee-bottom' : 'marquee';
  const inner = items.map(it => `<span>${esc(it)}</span><span class="star">·</span>`).join('');
  return `<div class="${cls}" aria-hidden="true"><div class="marquee-track"><div class="marquee-set">${inner}</div><div class="marquee-set" aria-hidden="true">${inner}</div></div></div>`;
}

const ROUNDS = [
  {
    n: 49, date: '2026-05-31', tag: 'v445',
    title: 'Tennis & badminton editorial guide + racquet mesh expansion',
    summary: 'Round 49 adds a dedicated tennis and badminton guide complementing the padel/pickleball editorial, cross-links the racquet category, and refreshes luxury-club funnel cards.',
    bullets: [
      'New: /guides/tennis-badminton-pattaya/ — Fitz Club, central tennis, Greta covered courts, badminton halls.',
      'Padel guide cross-link + racquet category strips and venue FAQ links updated.',
      'Homepage intent: Tennis & badminton card on Pratamnak/Fitz cluster.',
      '37 guides total. Asset 444 -> 445.'
    ]
  },
  {
    n: 48, date: '2026-05-31', tag: 'v444',
    title: 'Swimming & pools guide + venue FAQ on all 158 venues',
    summary: 'Round 48 adds a swimming/pools editorial guide and rolls programmatic FAQ blocks with FAQPage schema to every venue page — with improved category templates and plain-text schema encoding.',
    bullets: [
      'New: /guides/swimming-pools-pattaya/ — hotel pools, water parks, lap swim, family days.',
      'inject-venue-faq-r47.js now covers all 158 venues (was 25 flagship pages).',
      'Enhanced FAQ templates for kids-youth, climbing, adventure, equestrian, clubs, swimming.',
      '36 guides total. Asset 443 -> 444.'
    ]
  },
  {
    n: 47, date: '2026-05-31', tag: 'v443',
    title: 'CrossFit guide, venue FAQ on 25 top venues, homepage BJJ/CrossFit intents',
    summary: 'Round 47 adds CrossFit editorial, programmatic FAQ blocks with FAQPage schema on 25 flagship venue pages, homepage intent cards for BJJ/MMA and CrossFit, and CRLF-safe venue guide injection.',
    bullets: [
      'New: /guides/crossfit-pattaya/ — Jungle Gym affiliate + functional fitness alternatives.',
      'inject-venue-faq-r47.js — FAQ + FAQPage schema on 25 top venues (featured + guide anchors).',
      'Homepage intent router: BJJ/MMA and CrossFit cards.',
      '35 guides total. Asset 442 -> 443.'
    ]
  },
  {
    n: 46, date: '2026-05-31', tag: 'v442',
    title: 'BJJ & MMA editorial guide + complete ranked deepen pass',
    summary: 'Round 46 adds the first dedicated BJJ/MMA editorial guide and finishes editorial depth blocks on all remaining ranked guides — best Muay Thai, Walking Street, golf, childcare, Russian, seniors, Bangkok day trips.',
    bullets: [
      'New: /guides/bjj-mma-pattaya/ — ALFA BJJ, Venum, Rage, Kombat, Rambaa M16.',
      'deepen-round46-ranked.js — 7 remaining ranked guides now have editorial depth.',
      'MMA/BJJ category strips, venue links, and area×category intros wired.',
      '34 guides total. All ranked guides now have deepen blocks. Asset 441 -> 442.'
    ]
  },
  {
    n: 45, date: '2026-05-31', tag: 'v441',
    title: 'Na Jomtien & Sattahip area guide, ranked deepen, IndexNow',
    summary: 'Round 45 completes the six-area editorial set with the far-south marina/resort belt, deepens four ranked lifestyle guides, and adds IndexNow ping automation for Bing/Yandex.',
    bullets: [
      'New: /guides/best-gym-sattahip-pattaya/ — Ocean Marina, Ramayana, Andaz, U-Tapao corridor.',
      'deepen-round45-ranked.js — solo female, digital nomad, luxury clubs, dive operators.',
      'IndexNow: bd7f2a9c1e48.txt + scripts/ping-indexnow.js (runs in PUSH pipeline).',
      '33 guides total. All 6 area hubs now have editorial anchors. Asset 440 -> 441.'
    ]
  },
  {
    n: 44, date: '2026-05-31', tag: 'v440',
    title: 'East Pattaya (Darkside) area guide + deepen beginners/family/female ranked guides',
    summary: 'Round 44 completes the area editorial set with East Pattaya — Kombat Group, Mabprachan, Nong Prue — and adds editorial depth blocks to three high-traffic ranked guides.',
    bullets: [
      'New: /guides/best-gym-east-pattaya/ — Huai Yai, Mabprachan, Darkside camps and lake sport.',
      'deepen-round44-ranked.js — best-for-beginners, family-friendly, female-friendly guides.',
      'East area hub, venue links, and area×category intros wired to new guide.',
      '32 guides total. Asset 439 -> 440.'
    ]
  },
  {
    n: 43, date: '2026-05-31', tag: 'v439',
    title: 'MT safety guide, Central Pattaya area hub, yoga retreat, network expansion',
    summary: 'Round 43 closes the last major area gap (Central Pattaya), answers the high-intent safety query, adds yoga retreat editorial, deepens 24h/cheapest ranked guides, and enriches 45 area×category pages.',
    bullets: [
      'New: /guides/is-muay-thai-safe-pattaya/, /guides/best-gym-central-pattaya/, /guides/yoga-retreat-pattaya/.',
      'deepen-round43-ranked.js — editorial blocks on 24-hour and cheapest guides.',
      'inject-area-category-intros-r43.js — local intro paragraphs on 45 area×category pages.',
      'Full TimPaemi network mesh: villa, personal trainer, mrweoutside, vehicle rentals. 31 guides; asset 438 -> 439.'
    ]
  },
  {
    n: 42, date: '2026-05-30', tag: 'v438',
    title: 'Padel/pickleball + training visa guides, Thai terms editorial rebuild, sister-site links',
    summary: 'Round 42 fills racquet and long-stay keyword gaps and rebuilds thai-gym-terms as full editorial. Editorial shell gains in-content Pattaya network links (visa, medical, restaurants).',
    bullets: [
      'New: /guides/padel-pickleball-pattaya/ and /guides/training-thailand-visa-pattaya/.',
      'Rebuild: /guides/thai-gym-terms-pattaya/ — phrase tables, MT class words, FAQ.',
      'editorial-guide-shell.js sister-context block for cross-network SEO mesh.',
      '28 guides total; gsc-index-priority.txt for indexing queue. Asset 437 -> 438.'
    ]
  },
  {
    n: 41, date: '2026-05-29', tag: 'v437',
    title: 'Internal linking — category/area strips, venue guide blocks, funnel expansion',
    summary: 'Closes the taxonomy orphan gap from the SEO audit: every category and area page surfaces editorial guides; 158 venue pages link to relevant trip planners; remaining ranked guides get editorial funnel cards; guide count footer fixed to 26.',
    bullets: [
      'inject-internal-linking-r41.js — 15 category strips, 6 area hubs, 45 area×category strips.',
      '158 venue pages: contextual guide link block (MT, fitness, dive, family, area guides).',
      '11 more ranked guides get editorial-funnel-r41 cards; Browse all 26 fixes.',
      'Asset version 436 -> 437.'
    ]
  },
  {
    n: 40, date: '2026-05-29', tag: 'v436',
    title: 'Naklua & Pratamnak area guide + ranked → editorial funnel links',
    summary: 'Closes the area-guide gap after Jomtien: Fairtex/Sityodtong north and Muscle Factory/padel hilltop in one editorial page. Ranked Muay Thai and budget guides now surface beginner, trip-length, and day-pass editorials in Related.',
    bullets: [
      'New guide: /guides/best-gym-naklua-pratamnak-pattaya/ (~1,500 words).',
      'inject-ranked-editorial-funnel.js on 6 ranked guides (best MT, beginners, cheapest, Walking St, female-friendly, 24h).',
      'Homepage intent router + guides hub; 26 guides total.',
      'Asset version 435 -> 436.'
    ]
  },
  {
    n: 39, date: '2026-05-29', tag: 'v435',
    title: 'Trip-length guide — train Muay Thai Pattaya 1 week vs 1 month',
    summary: 'Completes the planner funnel after city compare, holiday, and beginners: realistic goals, camp picks, budgets, schedules, and visa notes for 7-day vs 30-day stays.',
    bullets: [
      'New guide: /guides/train-muay-thai-pattaya-1-week-1-month/ (~1,500 words, full editorial).',
      'Homepage intent router + guides hub card and TL;DR link.',
      '25 guides total; sitemap auto-includes new slug on build.',
      'Asset version 434 -> 435.'
    ]
  },
  {
    n: 38, date: '2026-05-29', tag: 'v434',
    title: 'Deepen Round 37 guides — full editorial depth (~1,500 words each)',
    summary: 'Round 37 shipped thin SEO outlines by mistake. Round 38 rewrites all three guides to match Round 32 editorial standard: long venue write-ups, 6 FAQs, pricing tables, bylines.',
    bullets: [
      'muay-thai-pattaya-beginners expanded to 7 camps with full paragraphs.',
      'best-gym-jomtien-pattaya expanded with geography, weekly rhythm, venue depth.',
      'pattaya-vs-phuket expanded with decision tree and honest bias disclosure.',
      'deepen-round37-guides.js + guide-bodies/ module; editorial shell gains byline block.',
      'Asset version 433 -> 434.'
    ]
  },
  {
    n: 37, date: '2026-05-29', tag: 'v433',
    title: 'Three high-intent SEO guides — beginners, Jomtien, Pattaya vs Phuket',
    summary: 'Round 37 adds the next keyword cluster from the SEO gap analysis: dedicated Muay Thai beginners, Jomtien area gym guide, and Pattaya vs Phuket training comparison.',
    bullets: [
      '/guides/muay-thai-pattaya-beginners/ — absolute beginner camps, gear, costs, red flags.',
      '/guides/best-gym-jomtien-pattaya/ — Jomtien MT, fitness, yoga, pools with area hub links.',
      '/guides/pattaya-vs-phuket-muay-thai-training/ — comparison table + who should pick which city.',
      'editorial-guide-shell.js shared writer; homepage intent router updated to 24 guides.',
      'Asset version 432 -> 433.'
    ]
  },
  {
    n: 36, date: '2026-05-29', tag: 'v432',
    title: 'SEO machine — training holiday guide, price table, outreach CSV, homepage intent router, network hub',
    summary: 'Turns Pattaya.Gym into the traffic anchor of the Pattaya Authority network: high-intent content, comparison tooling surfaced on homepage, venue backlink export, and cross-site network linking sitewide.',
    bullets: [
      'New guide: /guides/muay-thai-training-holiday-pattaya/ (~1k/mo intent).',
      'Cheapest-gyms guide: auto-generated fitness price comparison table from venue data.',
      'outreach/venue-outreach.csv — 100+ venues with websites + badge-listed.svg for backlink campaign.',
      'Homepage intent router (8 cards) + Pattaya network hub linking all TimPaemi properties.',
      'pa-network grid on every build-v2 page footer zone; guides hub updated.',
      'Scripts: write-training-holiday-guide, inject-cheapest-price-table, export-venue-outreach, inject-homepage-seo, sync-guides-hub.',
      'Asset version 431 -> 432.'
    ]
  },
  {
    n: 35, date: '2026-05-28', tag: 'v431',
    title: 'Ranked guide body polish — TL;DR, venue cards, section styling in styles.css',
    summary: 'Guide pages never loaded venue.css, so ranked cards and TL;DR blocks were effectively unstyled. Round 35 adds full guide-body CSS to styles.css and polishes all ranked guide markup.',
    bullets: [
      'TL;DR blocks: cyan gradient panel, proper list typography, no bogus Chapter counters.',
      'Venue cards: grid layout, hover lift, mono meta, pill tags — now in styles.css (was orphaned in venue.css).',
      'Section headings before card grids use guide-rank-section styling instead of editorial chapter H2.',
      'Compare CTA, related guides, and FAQ blocks get dedicated guide-* classes.',
      'polish-ranked-guide-body.js strips inline styles and normalizes HTML across 18 pages.',
      'Asset version 430 -> 431.'
    ]
  },
  {
    n: 34, date: '2026-05-28', tag: 'v430',
    title: 'Ranked guides — full editorial hero parity with Round 32 originals',
    summary: 'Round 33 only swapped nav/fonts; this round rebuilds every ranked guide hero to match the editorial template: accent headline, rich kicker, hero-meta line, and clean section structure.',
    bullets: [
      'migrate-legacy-guides-chrome.js v2: per-slug accent H1, kicker, hero-meta (replaces venue-hero-meta chips).',
      'Guides hub rebuilt: Pattaya gym guides. with accent-cyan, hero outside broken nested wrappers.',
      '17 ranked guides + hub updated; 3 editorial guides unchanged.',
      'Asset version 429 -> 430.'
    ]
  },
  {
    n: 33, date: '2026-05-28', tag: 'v429',
    title: 'Legacy guide design unification — V2 chrome + hero on all ranked guides',
    summary: 'Ranked/list guides now share the same shell as Round 32 editorial guides: mobile nav, deferred analytics, self-hosted fonts, and large hero typography — while keeping venue cards, TL;DR, and FAQs intact.',
    bullets: [
      'New script: migrate-legacy-guides-chrome.js — 17 ranked guides + /guides/ hub upgraded.',
      'Preserves cat-venue-grid rankings, favorite buttons, FAQ blocks, and existing JSON-LD.',
      'Fixes duplicate section wrappers and split-hero markup from the old venue-hero layout.',
      'Editorial guides (English MT, stay-and-train, day pass) unchanged.',
      'Added to AGENTS.md build gate and PUSH pipeline.',
      'Asset version 428 -> 429.'
    ]
  },
  {
    n: 32, date: '2026-05-28', tag: 'v428',
    title: 'High-intent editorial guides — English Muay Thai, stay-and-train, day pass + Walking Street deepen',
    summary: 'Ships the three Codex-flagged long-tail guides that were scripted but never published, plus a Walking Street distance/Soi reference section for tourists staying Beach Road.',
    bullets: [
      'New guide: /guides/english-speaking-muay-thai-pattaya/ — 10 Tier-A English-fluent camps with venue links + FAQ schema.',
      'New guide: /guides/muay-thai-camps-with-accommodation-pattaya/ — 8 stay-and-train camps with pricing tiers and booking checklist.',
      'New guide: /guides/gym-day-pass-pattaya/ — 12 walk-in gyms with day/weekly pass pricing.',
      'Deepened /guides/best-gyms-near-walking-street-pattaya/ — walking minutes from Bali Hai Pier + Soi Diana/Buakhao/LK Metro reference.',
      'Guides hub updated with new cards + tldr links. Sitemap auto-includes new slugs from disk.',
      'Asset version 427 -> 428.'
    ]
  },
  {
    n: 31, date: '2026-05-29', tag: 'v427',
    title: 'Performance + accessibility audit — deferred analytics, site-ui.js, contrast fixes',
    summary: 'Full Lighthouse audit (homepage + venue). Round 31 targets LCP, console errors, color contrast, and link distinguishability without changing editorial content or URLs.',
    bullets: [
      'GA4 moved out of <head> — gtag + analytics.js load deferred at end of body so they no longer compete with LCP font/CSS.',
      'Inline nav/scroll/clock scripts consolidated into cached /site-ui.js (one file, defer, CSP-safe). Removes ~3 duplicate inline scripts per page.',
      'Font preload trimmed to Space Grotesk only (LCP display face). Inter + JetBrains load on demand via CSS @font-face.',
      'Font URLs in styles.css synced to ASSET_VERSION on every build. JetBrains Mono uses font-display: optional.',
      'Button contrast fixed: btn-secondary/btn-tertiary now pass WCAG AA. u-cyan / venue-source links underlined for link-in-text-block.',
      'CSP updated for Cloudflare Web Analytics beacon (fixes console CSP violation). favicon.svg served as static file. feed.json alternate link added.',
      'Asset version 426 -> 427.'
    ]
  },
  {
    n: 29, date: '2026-05-24', tag: 'v425',
    title: 'Homepage \'What we operate\' rebuilt as the 11-property network grid',
    summary: 'The homepage verticals section was factually wrong (\'four verticals\') after the network expanded to 11. Round 29 rebuilds it as an accurate, scalable 11-tile network grid - one agency + ten verticals, each with its own tile.',
    bullets: [
      'Headline updated: \'One agency. Four verticals.\' -> \'One agency. Ten verticals.\'',
      'Intro rewritten to reflect 10 editorial verticals + the flagship Pattaya Authority agency, not 4 sites.',
      'Grid expanded from 4 big cards to 11 compact network tiles with auto-fit layout (responsive: 1 col mobile, 2 col tablet, 3-4 col desktop). Each tile carries its vertical label, brand wordmark with accent dot, domain, and a one-line value prop.',
      'Tiles cycle through the four existing project-card accent colours (pink / yellow / cyan / mint) for visual rhythm without new CSS classes per vertical.',
      'New tiles: TimPaemi (parent brand), Pattaya School Guide, Pattaya Coffee, Pattaya Villa Stream, Pattaya Medical, PattayaPets, Pattaya Vehicle Rentals. Existing four (Authority, Gym, Restaurant Guide, Visa Help) retained.',
      'Asset version 424 -> 425.'
    ]
  },
  {
    n: 28, date: '2026-05-24', tag: 'v424',
    title: 'Network tagline + footer self-exclusion (Pattaya Authority alignment)',
    summary: 'Pattaya Authority network adopted a unified tagline across all owned sites. Round 28 applies the network footer prompt: the tagline appears under the brand wordmark in every footer, in Organization.slogan in the homepage JSON-LD, and the self-link is removed from the Projects sister-site list (a site should not link to itself in its network list).',
    bullets: [
      'New network tagline: \'Built in Pattaya. For Pattaya.\' rendered under the pattaya.gym wordmark on every page in a mono cyan strapline.',
      'Organization JSON-LD on the homepage now carries the slogan field for schema-graph recognition.',
      'Footer Projects column went from 11 items to 10 - the self-link (Pattaya Gym -> /) is removed per the canonical Pattaya Authority spec. The 10 external sister sites still display in the user-specified order.',
      'Applied across every surface: build-v2.js footer(), rebuild-tool-stubs.js, build-compare-page.js, build-plan-page.js, write-changelog.js, homepage index.html, and the 19 static legacy guide + search pages.',
      'New .footer-slogan CSS to fit the existing dark-theme palette.',
      'Asset version 423 -> 424.'
    ]
  },
  {
    n: 27, date: '2026-05-24', tag: 'v423',
    title: 'Network expansion - 11-site TimPaemi / Pattaya Authority network + footer alignment',
    summary: 'The Pattaya Authority empire network grew from 8 to 11 sites. Round 27 propagates the full canonical 11-site list across every network reference on pattaya-gym.com - footer, Organization and Person JSON-LD sameAs, llms.txt, the about page, and the privacy page - with the correct authoritative labels.',
    bullets: [
      'Three new sister sites added everywhere: pattaya-medical.com (Pattaya Medical), pattayapets.com (PattayaPets), pattaya-vehicle-rentals.com (Pattaya Vehicle Rentals).',
      'Label corrections to match the canonical list: \'Coffee Guide\' -> \'Pattaya Coffee\', \'Pattaya Stream\' -> \'Pattaya Villa Stream\', \'TimPaemi (parent)\' -> \'TimPaemi\', \'Restaurant Guide\' -> \'Pattaya Restaurant Guide\', \'School Guide\' -> \'Pattaya School Guide\', \'Visa Help\' -> \'Pattaya Visa Help\'.',
      'Footer alignment: the Projects column would have dominated the footer with 11 entries stacked vertically. New .footer-projects CSS lays the list out as 2 columns on desktop and stacks cleanly to 1 column on mobile - footer reads balanced on every viewport.',
      'Updated across every surface: build-v2.js (footer + about + privacy + Person sameAs), rebuild-tool-stubs.js, build-compare-page.js, build-plan-page.js, write-changelog.js, homepage (Organization sameAs + footer), llms.txt, and the 19 static legacy guide and search pages.',
      'Asset version 422 -> 423.'
    ]
  },
  {
    n: 26, date: '2026-05-24', tag: 'v422',
    title: 'Mobile menu + brand logo - closing the empire-flagship audit',
    summary: 'Round 25 audit (AUDIT_BRAND_MOBILE_DESKTOP_2026.md) flagged one real P1 gap and a brand-asset issue. Round 26 closes both, plus the polish items.',
    bullets: [
      'P1 - Mobile menu. Below 900 px the site had no navigation at all - only the brand logo and the Find-a-gym CTA were visible. Now: a hamburger button appears next to the CTA on mobile, opening a full-screen overlay menu (12 links + CTA), accessible (aria-expanded, aria-controls, ESC to close, focus management), with reduced-motion respected. Generated by nav() so all 260 pages get it from one source.',
      'P2 - Square brand logo. Organization JSON-LD now points to /brand-logo.png - a clean 512x512 pink P on a rounded black square that matches the favicon, instead of the rectangular OG image. Better Google Knowledge Panel rendering.',
      'P2 - JetBrains Mono is now preloaded alongside Inter and Space Grotesk; no more flash of substitute mono font in the nav, marquees and eyebrows.',
      'P2 - .trust-pill.is-link gets min-height 44 px so the linkable variants meet the WCAG 2.5.5 target-size guideline on small phones.',
      'P3 - manifest.json polished with description, id, scope, categories, lang, dir for richer PWA install / OS integration.',
      'Asset version 421 -> 422.'
    ]
  },
  {
    n: 25, date: '2026-05-23', tag: 'v421',
    title: 'Area-page FAQs - completing the answer-engine layer',
    summary: 'Round 24 added FAQ sections and FAQPage schema to the 15 sport category pages. Round 25 completes that work by extending it to the 6 neighbourhood / area pages, which are real landing pages for queries such as gyms in Jomtien.',
    bullets: [
      'New data/area-faqs.js: 24 hand-authored Q&A pairs across all 6 areas (Jomtien, Naklua, Pratamnak, East Pattaya / Darkside, Central Pattaya, Sattahip) - whether the area suits a training base, what sports it is best for, how to get around, and who it best suits.',
      'Each area page now renders the same accessible FAQ accordion (native HTML details element, no JavaScript) and emits FAQPage JSON-LD. Structured Q&A now covers every category page, every area page, and every guide.',
      'Answers are grounded in the per-area editorial content already on the site - accurate, no fabrication.',
      'Asset version 420 -> 421.'
    ]
  },
  {
    n: 24, date: '2026-05-23', tag: 'v420',
    title: 'Category FAQs - answer-engine-ready content on all 15 sport pages',
    summary: 'Extended every sport category page with a hand-authored FAQ section and FAQPage structured data. Category pages are where head-term search intent lands (for example \'muay thai pattaya\'), and a structured FAQ is the single most effective format for being quoted by AI answer engines such as ChatGPT, Claude and Perplexity.',
    bullets: [
      'New data/category-faqs.js: around 50 hand-authored, genuinely useful question-and-answer pairs across all 15 sport categories - cost, beginners, booking, seasons, areas and category-specific questions.',
      'Each category page now renders an accessible FAQ accordion (native HTML details element, no JavaScript) and emits FAQPage JSON-LD, making the Q&A eligible for FAQ rich results and easy for AI crawlers to extract and cite.',
      'Honest content - no fabricated prices (rates that go stale are never republished); answers point to the venue pages and the Plan My Trip tool for specifics.',
      'New .faq-list / .faq-item CSS for the dark-theme accordion.',
      'Asset version 419 -> 420.'
    ]
  },
  {
    n: 23, date: '2026-05-23', tag: 'v419',
    title: 'Plan My Trip - a real, data-driven trip planner',
    summary: 'Extended the site with a genuine new tool. /plan-my-trip/ had been an honest \'being rebuilt\' stub since Round 7; it is now a real, working, client-side trip planner built on the 158-venue dataset.',
    bullets: [
      'New scripts/build-plan-page.js generates /plan-my-trip/ as a real tool: the visitor answers four questions (sport, trip length, budget, travel style) and gets a tailored plan - a ranked base venue, a training structure keyed to trip length, complementary venues for rest days, and practical notes.',
      'Honest by design - it uses only data the venue set genuinely supports: category, price tier, editor picks, and three reliable tag clusters (family-friendly, stay-and-train, drop-in). The free-text area field is messy (130+ variants) so it is deliberately not used as a filter.',
      'Pure client-side, no external dependencies; bookmarkable and shareable ?sport=&length=&budget=&style= URLs; ranks on fit only - no paid placements.',
      'The page is now indexable (it was noindex) and is back in llms.txt and the sitemap. rebuild-tool-stubs.js no longer overwrites it with a stub.',
      'Asset version 418 -> 419.'
    ]
  },
  {
    n: 22, date: '2026-05-22', tag: 'v418',
    title: 'Self-audit Round 22 - sitemap consolidation + nav hub link',
    summary: 'Post-Round-21 self-audit. The site passed every structural check (260 pages, 0 truncation, 0 asset-version drift, 0 duplicate IDs). Two real issues remained: robots.txt was still advertising stale legacy sitemaps, and the new /sports/ hub was not in the primary navigation.',
    bullets: [
      'Sitemaps - robots.txt advertised 7 sitemaps, but 6 were stale legacy files (sitemap-index / -venues / -categories / -areas / -guides / -core), last generated 11+ days ago by the retired build-extras.js. Google was being fed stale, conflicting sitemap data. robots.txt now advertises only the single live sitemap.xml (256 URLs, regenerated every build); the 6 stale files are deleted.',
      'verify-deploy.js now fails the build if robots.txt advertises any sitemap file that does not exist on disk - so this class of drift cannot recur.',
      'Nav - the /sports/ all-categories hub (added in Round 21) is now in the primary navigation on every generated page, not just the footer.',
      'Asset version 417 -> 418.'
    ]
  },
  {
    n: 21, date: '2026-05-21', tag: 'v417',
    title: 'Codex nuclear audit Round 21 - release-state consolidation',
    summary: 'Codex Round 21 audit found 0 critical issues but flagged release-state drift as the top problem: asset version, font preloads, status.json, the changelog and API metadata did not all agree. Round 21 makes every version marker consistent and closes the rest of the P1/P2 findings.',
    bullets: [
      'P1-1 Version - One canonical asset version (417) across build-v2.js, every generated page, font preloads, status.json, API endpoints and the changelog. Round 20\'s intended 416 bump did not fully propagate (font preloads were stranded on 414/416); Round 21 corrects it. verify-deploy.js now fails the build on any stale ?v= asset reference.',
      'P1-3 Tools - Find My Coach, Plan My Trip and Favorites are honest roadmap pages, so they are now noindex,follow and removed from llms.txt core tools and the sitemap until they ship as real tools.',
      'P1-4 Trust - Softened over-strong verification copy (\'every phone dialed\', \'100% hand-checked\') into accurate language that matches the data.',
      'P1-5 Linking - New /sports/ hub links all 15 categories so BJJ and every other sport is reachable from the homepage crawl graph, not just the sitemap.',
      'P2 - Fixed dangling-pipe category-area titles, enriched short meta descriptions, unified the sister-network footer across 20 pages, removed a duplicate compare-status live region, taught the search open-now filter to honor weekday + seasonal hours, trimmed 3 unused third-party origins from the CSP, and upgraded 7 venue links to HTTPS.',
      'New scripts/write-data-endpoints.js regenerates the JSON API + feed on every build so machine-readable freshness never drifts again.',
      'Asset version 415 -> 417.'
    ]
  },
  {
    n: 20, date: '2026-05-18', tag: 'v416',
    title: 'Nuclear self-audit v2 — geo enrichment + GA4 events + CSP prune',
    summary: 'Self-audit v2 (SELF_AUDIT_2026_ROUND20.md) gave the site a clean bill of health: 0 html-validate errors across 259 pages, 551 JSON-LD blocks all valid, no broken internal links, no duplicate content. The only real gap was missing geo coordinates on 140 venues. Round 20 closes the biggest remaining items.',
    bullets: [
      'Geo - Hand-plotted lat/lng for 39 well-known Pattaya landmarks (Fairtex, Sityodtong, Royal Cliff, Sanctuary of Truth, Cartoon Network Amazone, Phoenix Gold Golf, Siam Country Club, etc.). LocalBusiness geo coverage went from 18/158 (11%) to 55/158 (35%).',
      'Geo - New scripts/geocode-venues-v2.js with smarter 3-strategy Nominatim retry (name+area, name+Pattaya, area-centroid fallback) for filling more over time.',
      'F4.Desc - Wired truncateDesc(155) to venue and area page meta descriptions. 10 over-160 description warnings closed.',
      'F22.CSP - sync-csp-hashes.js now PRUNES obsolete inline-script hashes by default (4 unused hashes removed). --keep-obsolete flag preserves the legacy behaviour.',
      'F24.Analytics - 4 new GA4 custom events: share_venue (venue share button), compare_pick (compare selection change), filter_apply (search filter change, debounced), sister_site_click (outbound to any of the 7 sister sites).',
      'Asset version 415 -> 416.'
    ]
  },
  {
    n: 19, date: '2026-05-18', tag: 'v415',
    title: 'Sister-network cross-linking + orphan-page graph fixes',
    summary: 'Closed the biggest finding from the Round 19 self-audit: 4 of 7 TimPaemi sister sites had zero inbound links from pattaya-gym.com. Plus killed 22 orphan pages by adding a category cross-link matrix to area pages and an expanded footer "Site" column.',
    bullets: [
      'F-Sister - Sister network now fully cross-linked: timpaemi.com, pattaya-authority.com, pattaya-restaurant-guide.com, pattayavisahelp.com, pattayastream.com, pattaya-coffee.com, pattaya-school-guide.com all linked from footer + Organization.sameAs + Person.sameAs + privacy + about + press pages + llms.txt + humans.txt.',
      'F08.1 - Area pages now include a "Browse this area by sport" matrix linking every existing /area/<a>/<sport>/ combination. Closes 15 orphan category-area pages.',
      'F08.1 - Footer "The site" column expanded with /compare/, /pattaya-sport-stats/, /changelog/, /privacy/, /press/, /add-your-gym/. Closes 7 utility-page orphans.',
      'F05.1 - truncateTitle() and truncateDesc() helpers added; auto-truncate at word boundary for venue/category/area/category-area pages. Caps titles at 65 chars, descs at 155.',
      'Self-audit script wrote SELF_AUDIT_2026_ROUND19.md with 71 findings before the round started.',
      'Asset version bumped 414 -> 415.'
    ]
  },
  {
    n: 18, date: '2026-05-18', tag: 'v414',
    title: 'Self-hosted fonts + 56% inline-style reduction',
    summary: 'Two big engineering wins from the Round 17 Codex audit backlog. Removed every third-party font request and shrank the inline-style surface so a future strict CSP becomes realistic.',
    bullets: [
      'F14.1 — Google Fonts removed from every page. Self-hosted Space Grotesk (variable), Inter (400/500/600/700), JetBrains Mono (500/600/700) in /fonts/ with font-display: swap. CSP no longer allowlists fonts.googleapis.com or fonts.gstatic.com.',
      'F10.1 — Inline style="..." count dropped from 11,212 to 4,905 (-56%) by adding 30+ utility classes covering the most-repeated patterns. Builds the foundation for removing \'unsafe-inline\' from style-src in a future round.',
      'Privacy page updated to drop the "may self-host in future" caveat — fonts are now self-hosted.',
      'New /fonts/* immutable cache rule in _headers.',
      'verify-deploy.js still passes the hardened gate (NUL/BOM scan + sitemap URL check).',
      'Asset version bumped 413 -> 414.'
    ]
  },
  {
    n: 17, date: '2026-05-18', tag: 'v413',
    title: 'Codex Nuclear V4 audit — 5 P1 fixes + 10 P2 wins',
    summary: 'Closed every P1 finding from the Codex Round 17 audit plus 10 quick P2 wins. The single biggest improvement: generated venue HTML went from 210 html-validate errors to 0 by replacing the regex Markdown converter with markdown-it.',
    bullets: [
      'F02.1 — Replaced bespoke regex mdToHtml with markdown-it; generated venue HTML now passes html-validate cleanly (210 → 0 structural errors).',
      'F07.1 — Sitemap GUIDE_SLUGS is now derived from disk so the sitemap can no longer advertise URLs whose local files do not exist.',
      'F20.1 — New /privacy/ page: Google Analytics 4, localStorage keys, AI crawler policy, GDPR/PDPA rights, full disclosure.',
      'F21.1 — Softened every "updated weekly" / "within 7 days" claim across homepage, marquees, generated pages, methodology, and about. Honest copy matching actual rolling-verification cadence.',
      'F23.1 — Hardened verify-deploy.js: NUL/BOM scan now covers every text source file; every sitemap URL must resolve to a local file.',
      'F01.1 — Search "Open now" filter now parses real HH:MM windows against ICT.',
      'F01.2 — Fixed 2 venue Markdown front-matter category mismatches (ALFA → bjj, Rambaa → mma).',
      'F04.1 — Geo coordinates in LocalBusiness JSON-LD rounded to 6 decimals.',
      'F05.2 — robots.txt now explicitly allows /og/ so Google/Twitter can fetch per-venue OG images.',
      'F07.3 — Deleted stray extensionless junk files from repo root, added .wrangler/ to .gitignore.',
      'F12.1 — ARIA live regions on search stats and compare status.',
      'F12.2 — Visible 3px focus-visible outline on search filter selects.',
      'F19.2 — Added browsing-topics=() to Permissions-Policy.',
      'F20.2 — Replaced overstated "privacy-respecting" GA copy with precise statement linking to /privacy/.',
      'Asset version bumped 412 → 413.'
    ]
  },
  {
    n: 16, date: '2026-05-18', tag: 'v412',
    title: 'Real side-by-side /compare/ tool',
    summary: 'The /compare/ page was the last remaining honest-stub tool from Round 7. Round 16 turns it into a real, fully-functional, client-side comparison tool — pick up to 4 venues, see them side-by-side across 12 attributes, share the URL.',
    bullets: [
      '/compare/ now embeds a 158-venue summary JSON and renders a side-by-side comparison table on demand.',
      'Up to 4 venues compared at once (slots a/b/c/d) with bookmarkable, shareable ?a=&b=&c=&d= URLs.',
      '12 comparison rows: name · editors-pick · sport · area · price · hours · phone · website · maps · tags · description · verified-date.',
      '3 preset buttons (premium Muay Thai, hotel gyms, budget camps) for instant exploration.',
      'Web Share API + clipboard fallback on the Share button.',
      'rebuild-tool-stubs.js skips /compare/ now that it has its own real builder.',
      'Asset version bumped 411 → 412.'
    ]
  },
  {
    n: 15, date: '2026-05-18', tag: 'v411',
    title: 'Live Pattaya Sport Stats dashboard',
    summary: '/pattaya-sport-stats/ was ~150 words of static bullets. Now it is a server-rendered SVG dashboard regenerated on every build — proof of breadth and transparency competitors do not have.',
    bullets: [
      '4 big stat tiles: venues / categories / areas / paid placements.',
      'Horizontal bar chart of 15 categories ranked by venue count (15-color accent rotation).',
      'Horizontal bar chart of 6 neighborhoods ranked by venue count.',
      'SVG donut chart of price-tier distribution (฿/฿฿/฿฿฿/฿฿฿฿) with legend.',
      'Verification-freshness breakdown (within 30 / 30-60 / older).',
      '4 schema-completeness ring gauges (body / geo / phone / website).',
      'All inline SVG — no JS, no charting library, no external dependencies. Asset version 410 → 411.'
    ]
  },
  {
    n: 14, date: '2026-05-18', tag: 'v410',
    title: 'Per-area neighborhood guide depth',
    summary: 'Codex V3 P1-6 finding closed — every area page now has a real ~2000-word neighborhood guide instead of a sparse venue list. 6 areas covered in editorial depth.',
    bullets: [
      'AREA_CONTENT map keyed by area slug: summary, intro, best-for, transport, landmarks, starter picks.',
      'areaPage() rewritten to render rich, opinionated neighborhood guides above the venue grid.',
      '6 areas covered: Jomtien, Naklua, Pratamnak, Central Pattaya, East Pattaya, Sattahip.',
      'Sattahip page went from 104 words to ~2100 words — same uplift across all 6 areas.',
      'Channel-card h3/h4 markup mismatches from earlier rounds fixed across 5 variants.',
      'Asset version bumped 409 → 410.'
    ]
  },
  {
    n: 13, date: '2026-05-18', tag: 'v409',
    title: 'Open-now indicator + Share + Person schema',
    summary: 'Live operational signals on every venue page + cleaner social sharing + richer authorship signal for E-E-A-T.',
    bullets: [
      'Live "Open now / Closed" pill on every venue page driven by data-hours-spec attribute and visitor local time.',
      'Recently-verified feed surfaces the freshest hand-checks at the top of the site.',
      'Web Share API button on every venue page with clipboard fallback for unsupported browsers.',
      'Person schema for Tim Paemi on /about/ — explicit author entity for E-E-A-T.',
      'Asset version bumped 408 → 409.'
    ]
  },
  {
    n: 12, date: '2026-05-18', tag: 'v408',
    title: 'Community trust + ops tooling',
    summary: 'Sources, editor-pick badges, recently-viewed memory + machine-readable site state + operational tooling for the long tail.',
    bullets: [
      'Per-venue Sources block populated from each venue\'s front-matter for full citation transparency.',
      '"Spot an error?" mailto link on every venue — explicit invitation to crowdsource corrections.',
      'Editor\'s Pick trust pill surfaces hand-selected favorites in the trust bar.',
      'Recently-viewed (localStorage, last 8) at the top of every venue page.',
      '/status.json — machine-readable site identity, build version, schema completeness, freshness, endpoints, policies.',
      'scripts/ping-sitemap.js — pings Google + Bing on every push.',
      'scripts/stale-venues.js — CSV report of venues whose verified date is > 30 days.',
      'Asset version bumped 407 → 408.'
    ]
  },
  {
    n: 11, date: '2026-05-18', tag: 'v407',
    title: 'Trust + usability polish',
    summary: 'Per-venue verified-by-Tim badge, trust signals row, guide bylines, reading-time estimator, Pattaya local-time widget, print stylesheet, public changelog page (this one), larger footer version badge, /methodology/ cross-links from every ranking surface.',
    bullets: [
      'Every venue page now shows "★ Verified by Tim · [date]" in the hero.',
      'Every venue + category + area page shows "Hand-checked · No paid placement · How we rank" trust pills.',
      'Guide pages display author byline + reading time + last-updated date.',
      'Footer shows live Pattaya time (ICT) — useful for tourists checking from abroad.',
      'Print stylesheet means venue pages print clean for offline reference.',
      'Public /changelog/ page (this one) — full transparency on what changes each round.',
      'Asset version bumped 406 → 407.'
    ]
  },
  {
    n: 10, date: '2026-05-17', tag: 'v406',
    title: '3 new long-tail guide pages',
    summary: 'Autonomous editorial round — wrote 3 substantive new guides targeting high-intent commercial queries Codex flagged as missing.',
    bullets: [
      '/guides/english-speaking-muay-thai-pattaya/ — 10 gyms with English-fluent kru, ~1900 words.',
      '/guides/muay-thai-camps-with-accommodation-pattaya/ — 8 stay-and-train camps with pricing tiers, ~1800 words.',
      '/guides/gym-day-pass-pattaya/ — 12 gyms accepting walk-in day passes, ~1700 words.',
      'Each guide auto-gets Article schema + FAQPage schema + 8-12 internal venue links.'
    ]
  },
  {
    n: 9, date: '2026-05-17', tag: 'v406',
    title: 'Repo hygiene + README + NEXT_STEPS playbook',
    summary: 'Closed remaining Codex V3 P2/P3 polish items + wrote the off-page playbook.',
    bullets: [
      '.gitignore cleaned (stripped UTF-16 garbage, added archive patterns).',
      'Duplicate sitemap_index.xml deleted.',
      'README.md rewritten to V2 reality (build-v2.js, PUSH workflow, full schema map).',
      'NEXT_STEPS.md — comprehensive off-page playbook (GSC, Bing, GBP, backlinks, content).'
    ]
  },
  {
    n: 8, date: '2026-05-17', tag: 'v406',
    title: 'Geo coordinates pipeline + sitemap priority',
    summary: 'Codex called geo "the single biggest local-SEO unlock." Built the Nominatim pipeline.',
    bullets: [
      'scripts/geocode-venues.js — one-time Nominatim geocoder for all 158 venues.',
      'build-v2.js reads data/venue-geo.json and injects geo into LocalBusiness JSON-LD.',
      'Sitemap now emits priority + changefreq per URL pattern.'
    ]
  },
  {
    n: 7, date: '2026-05-17', tag: 'v406',
    title: 'Mobile CLS + tool stubs + guide schema',
    summary: 'Closed three biggest remaining Codex V3 findings in one pass.',
    bullets: [
      'Mobile CLS fixes — reserved space on .marquee, .btn-row, .result-card, .pa-network, .nav-row.',
      'Tool pages (/map/, /compare/, /plan-my-trip/, /find-my-coach/, /favorites/) converted to honest V2 static stubs with 3 working-alternative cards each.',
      'Article + FAQPage JSON-LD auto-injected on 17 guide pages.'
    ]
  },
  {
    n: 6, date: '2026-05-17', tag: 'v406',
    title: 'Category-area landing pages + postalCode fallback + heading hierarchy',
    summary: 'The biggest long-tail SEO unlock per Codex V3 Section L.',
    bullets: [
      '~80 combined category-area pages now generated at /area/<area>/<category>/ targeting "muay thai in jomtien pattaya" etc.',
      'parsePostalAddress() now infers Thai postal codes from area context (Bang Lamung=20150, Sattahip=20250).',
      '<h4 class="channel-card-name"> → <h3> globally (fixes 163-page heading hierarchy issue).'
    ]
  },
  {
    n: 5, date: '2026-05-17', tag: 'v406',
    title: 'Cache fix + metadata polish + contrast',
    summary: 'Closed all four Round 4 Codex P0s.',
    bullets: [
      'Removed `immutable` from _headers CSS/JS cache rules (now max-age=3600, must-revalidate).',
      'Asset version bumped 405 → 406 to force Cloudflare cache invalidation.',
      'Added og:site_name, twitter:site, robots meta, x-dns-prefetch-control, dns-prefetch hints to head().',
      'Back-to-top button text color #fff → #000 on pink (contrast 3.53:1 → 5.94:1, WCAG AA pass).'
    ]
  },
  {
    n: 4, date: '2026-05-17', tag: 'v405',
    title: 'P0 ship-blocker fixes (Codex Nuclear V3)',
    summary: 'Repaired three critical production issues + added deploy guard.',
    bullets: [
      'Homepage truncation repaired (was 307 lines mid-attribute, now 603 with proper closing tags).',
      'styles.css unclosed .back-to-top block fixed; restored .skip-link, .back-to-top.is-visible, prefers-reduced-motion rules.',
      'CSP rewrote with 3 active sha256 hashes + Cloudflare Insights origin allowed.',
      'NEW: scripts/verify-deploy.js — pre-push integrity check (truncation, NULs, brace balance, CSP coverage).'
    ]
  },
  {
    n: 3, date: '2026-05-17', tag: 'v404',
    title: 'P0+P1 from Codex post-live audit',
    summary: 'Sanitized tel: links, sitemap completeness, multi-session hours parsing, footer/heading fixes.',
    bullets: [
      'phoneToTel() helper sanitizes display phones into E.164-clean dial values.',
      'Sitemap +26 URLs (17 guides, 6 tool pages, 4 utility pages).',
      'parseHoursSpec() handles multi-session via & continuation (Fairtex now emits both 07:30-10:30 AND 15:30-18:30).',
      'rel="noopener noreferrer" sitewide; footer h4 → div.footer-col-h.',
      '5 broken YAML venue MDs fixed; --hint #555 → #888 (WCAG AA pass).'
    ]
  },
  {
    n: 2, date: '2026-05-17', tag: 'v403',
    title: 'Schema-rich rebuild + legacy migration',
    summary: 'Codex audit Round 2 fix order — biggest schema completion pass.',
    bullets: [
      '158/158 venue pages get BreadcrumbList + LocalBusiness with PostalAddress + parsed openingHoursSpecification.',
      '15/15 category + 6/6 area pages get BreadcrumbList alongside ItemList.',
      'Homepage gets WebSite + Organization + SearchAction JSON-LD graph.',
      '24 legacy pages (guides + tools) migrated to V2 chrome.',
      'HOTFIX: linked 141 orphan venue body markdowns via detailFile in data.js.'
    ]
  },
  {
    n: 1, date: '2026-05-16', tag: 'v402',
    title: 'V2 redesign ships to production',
    summary: 'Complete visual rebuild + content recovery.',
    bullets: [
      'TimPaemi-inspired V2 design: black bg, multi-color neon accents, infinite seamless marquees, pattaya<dot>gym brand mark.',
      'Restored truncated index.html, stripped NUL bytes from 7 corrupted files, repointed package.json at build-v2.js.',
      '158/158 venues now render with full body content (median 1,165 words).',
      'redesign-2026 branch merged to main; pattaya-gym.com live on V2.'
    ]
  }
];

const url = `${SITE}/changelog/`;
const title = 'Changelog — pattaya-gym.com';
const desc = 'Public transparency log of every update shipped to pattaya-gym.com. Each round of fixes documented with date, version tag, and scope.';

const webpage = {'@context':'https://schema.org','@type':'WebPage','@id':`${url}#webpage`,url,name:title,description:desc,inLanguage:'en',isPartOf:{'@id':`${SITE}/#website`}};
const crumbs = {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
  {'@type':'ListItem','position':1,'name':'Home','item':`${SITE}/`},
  {'@type':'ListItem','position':2,'name':'Changelog','item':url}
]};

const head = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<link rel="preload" href="/styles.css${ASSET}" as="style">
<link rel="stylesheet" href="/styles.css${ASSET}">
<link rel="preload" href="/fonts/space-grotesk.woff2${ASSET}" as="font" type="font/woff2" crossorigin>
<link rel="alternate" type="application/json" href="/feed.json" title="Pattaya.Gym feed">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pattaya.Gym">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@PattayaGym">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<script type="application/ld+json">${JSON.stringify(webpage)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>`;

const nav = `<header class="nav" role="banner"><div class="nav-row"><a href="/" class="brand">pattaya<span class="dot">.</span>gym</a><nav class="nav-links" aria-label="Primary"><a href="/category/muay-thai/">Muay Thai</a><a href="/category/fitness/">Fitness</a><a href="/category/golf/">Golf</a><a href="/sports/">All sports</a><a href="/guides/">Guides</a><a href="/search/">Search</a></nav><button type="button" class="nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile"><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span><span class="nav-burger-bar"></span></button><a href="/search/" class="nav-cta">★ Find a gym</a></div></header>
<nav class="nav-mobile" id="nav-mobile" hidden aria-label="Mobile menu">
  <a href="/" class="nav-mobile-link">Home</a>
  <a href="/category/muay-thai/" class="nav-mobile-link">Muay Thai</a>
  <a href="/category/fitness/" class="nav-mobile-link">Fitness</a>
  <a href="/category/golf/" class="nav-mobile-link">Golf</a>
  <a href="/sports/" class="nav-mobile-link">All sports</a>
  <a href="/guides/" class="nav-mobile-link">Guides</a>
  <a href="/plan-my-trip/" class="nav-mobile-link">Plan my trip</a>
  <a href="/compare/" class="nav-mobile-link">Compare</a>
  <a href="/search/" class="nav-mobile-link">Search</a>
  <a href="/about/" class="nav-mobile-link">About</a>
  <a href="/methodology/" class="nav-mobile-link">Methodology</a>
  <a href="/changelog/" class="nav-mobile-link">Changelog</a>
  <a href="/search/" class="nav-mobile-cta">★ Find a gym</a>
</nav>`;

const breadcrumb = `<nav aria-label="Breadcrumb" style="max-width:var(--max); margin:0 auto; padding:var(--s-6) var(--pad) 0; font-family:var(--font-mono); font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted);"><a href="/" class="u-muted">Home</a> <span class="u-crumb-sep">/</span> <span class="u-text-bold">Changelog</span></nav>`;

const pa = `<section class="pa-network"><a href="https://pattaya-authority.com/" target="_blank" rel="noopener noreferrer" class="u-plain-link"><div class="pa-network-badge">★ A Pattaya Authority property ★</div></a><h2 class="pa-network-h">Pattaya <span class="accent">Authority.</span></h2><p class="pa-network-sub">// Site engineered, operated &amp; maintained in-house<br>by the founders of TimPaemi</p></section>`;

const footer = `<footer class="footer" role="contentinfo"><div class="footer-grid"><div><div class="footer-brand">pattaya<span class="accent">.gym</span></div><div class="footer-slogan">Built in Pattaya. For Pattaya.</div><p class="footer-tag"><strong>Every gym, every ring, every court in Pattaya.</strong> 158 venues hand-checked. No paid placements. Independent directory operated by TimPaemi Co., Ltd. from our Pattaya villa.</p><p class="u-foot-meta">— Tim &amp; Paemi, founders</p><div class="footer-meta">TimPaemi Co., Ltd.<br>Pattaya City, Bang Lamung District<br>Chon Buri 20150 · Thailand</div></div><div class="footer-col"><div class="footer-col-h">// The site</div><ul><li><a href="/about/">About</a></li><li><a href="/methodology/">Methodology</a></li><li><a href="/guides/">Guides</a></li><li><a href="/sports/">All sports</a></li><li><a href="/search/">Search</a></li><li><a href="/compare/">Compare</a></li><li><a href="/pattaya-sport-stats/">Sport stats</a></li><li><a href="/changelog/">Changelog</a></li><li><a href="/privacy/">Privacy</a></li><li><a href="/press/">Press</a></li><li><a href="/add-your-gym/">Add your venue</a></li></ul></div><div class="footer-col"><div class="footer-col-h">// Projects</div><ul class="footer-projects"><li><a href="https://pattaya-authority.com/" target="_blank" rel="noopener noreferrer">Pattaya Authority</a></li><li><a href="https://timpaemi.com/" target="_blank" rel="noopener noreferrer">TimPaemi</a></li><li><a href="https://pattaya-restaurant-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya Restaurant Guide</a></li><li><a href="https://pattayavisahelp.com/" target="_blank" rel="noopener noreferrer">Pattaya Visa Help</a></li><li><a href="https://pattaya-school-guide.com/" target="_blank" rel="noopener noreferrer">Pattaya School Guide</a></li><li><a href="https://pattaya-coffee.com/" target="_blank" rel="noopener noreferrer">Pattaya Coffee</a></li><li><a href="https://pattayastream.com/" target="_blank" rel="noopener noreferrer">Pattaya Villa Stream</a></li><li><a href="https://pattaya-medical.com/" target="_blank" rel="noopener noreferrer">Pattaya Medical</a></li><li><a href="https://pattayapets.com/" target="_blank" rel="noopener noreferrer">PattayaPets</a></li><li><a href="https://pattaya-vehicle-rentals.com/" target="_blank" rel="noopener noreferrer">Pattaya Vehicle Rentals</a></li></ul></div><div class="footer-col"><div class="footer-col-h">// Direct</div><ul><li><a href="mailto:info@pattaya-gym.com">info@pattaya-gym.com</a></li><li><a href="https://api.whatsapp.com/send/?phone=66967286999" target="_blank" rel="noopener noreferrer">WhatsApp · +66 96 728 6999</a></li><li><a href="https://line.me/ti/p/~timpaemi" target="_blank" rel="noopener noreferrer">LINE · @timpaemi</a></li><li><a href="/contact/">Contact page</a></li></ul></div></div><div class="footer-base"><span>© 2026 TimPaemi Co., Ltd. · All rights reserved</span><span class="footer-version-badge">Built ${BUILD_TS} · <a href="/changelog/">v${ASSET_VERSION}</a></span><span class="pattaya-time">Pattaya · <span class="pattaya-time-value" id="pt-clock">--:--</span> ICT</span></div></footer>
<div class="progress-bar" aria-hidden="true"></div>
<button class="back-to-top" type="button" aria-label="Back to top">↑</button>
<script defer src="/site-ui.js${ASSET}"></script>
<script defer src="https://www.googletagmanager.com/gtag/js?id=G-F5F6KD3XFZ"></script>
<script defer src="/analytics.js${ASSET}"></script>`;

const rounds = ROUNDS.map(r => `
<article class="changelog-entry" style="border-left:3px solid var(--pink); padding:var(--s-3) 0 var(--s-5) var(--s-5); margin-bottom:var(--s-6);">
  <header class="u-mb-3">
    <div style="font-family:var(--font-mono); font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); margin-bottom:6px;">
      <span class="u-cyan">Round ${r.n}</span>
      <span class="u-crumb-sep">·</span>
      <time datetime="${esc(r.date)}">${esc(r.date)}</time>
      <span class="u-crumb-sep">·</span>
      <span class="trust-pill" style="display:inline; padding:3px 8px;">${esc(r.tag)}</span>
    </div>
    <h2 style="font-family:var(--font-display); font-size:clamp(20px, 3vw, 28px); font-weight:700; margin:0; color:var(--text);">${esc(r.title)}</h2>
  </header>
  <p style="color:var(--text-2); margin:0 0 var(--s-3); line-height:1.6;">${esc(r.summary)}</p>
  <ul style="color:var(--text-2); padding-left:24px; margin:0; line-height:1.7;">${r.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
</article>
`).join('');

const html = head + marquee(TOP, false) + nav + breadcrumb + `
<main id="main">

<section class="hero" style="padding-top:var(--s-10); padding-bottom:var(--s-6); text-align:left;">
  <div class="hero-inner u-wrap-max">
    <div class="hero-kicker">// Public changelog · v${ASSET_VERSION} · Updated ${TODAY}</div>
    <h1 class="hero-h1" style="font-size:clamp(40px,8vw,96px); text-align:left;">
      Every <span class="accent-pink">change.</span>
    </h1>
    <p class="hero-lede" style="text-align:left; margin-left:0; max-width:760px;">
      Public log of every update shipped to <strong>pattaya-gym.com</strong>. We believe in operational transparency — every round of fixes is documented here with date, version tag, and scope. No silent changes.
    </p>
    <div class="trust-bar">
      <span class="trust-pill is-verified">★ ${ROUNDS.length} rounds shipped</span>
      <span class="trust-pill">Latest: v${ASSET_VERSION} · ${ROUNDS[0].date}</span>
      <span class="trust-pill">158/158 venues live</span>
      <a href="/methodology/" class="trust-pill is-link">Methodology →</a>
    </div>
  </div>
</section>

<section class="section u-pt-4">
  <div class="wrap">
    <div class="eyebrow"><span class="num">01</span> Release history</div>
    <h2 class="h-section">From <span class="accent-cyan">round 1</span> to <span class="accent-pink">round ${ROUNDS[0].n}.</span></h2>
    <p class="lede">All rounds are tagged in git with a <code>main-pre-round&lt;N&gt;</code> rollback point. Most-recent-first.</p>
    <div style="max-width:880px; margin:var(--s-6) 0;">
      ${rounds}
    </div>
  </div>
</section>

<section class="section u-pt-0">
  <div class="wrap">
    <div class="eyebrow"><span class="num">02</span> Why a public changelog</div>
    <h2 class="h-section">Operating in the <span class="accent-yellow">open.</span></h2>
    <p class="lede u-max-760">Most directories silently update. Pattaya.Gym tells you what changed and when. Every venue page also shows a <strong>verified date</strong> in the hero — that's when we last hand-checked it. If something goes stale, you know.</p>
    <p class="lede u-max-760">Independent. No paid placements. No fake reviews. <a href="/methodology/" class="u-cyan">Full methodology →</a></p>
  </div>
</section>

</main>
` + pa + marquee(BOT, true) + footer + '\n</body>\n</html>\n';

const dir = path.join(ROOT, 'changelog');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
console.log(`/changelog/ written (${(html.length/1024).toFixed(1)} KB, ${ROUNDS.length} rounds documented)`);
