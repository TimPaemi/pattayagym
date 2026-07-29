/**
 * timpaemi-author.js — single source of truth for the authorship entities.
 *
 * SCOPE: pattaya-gym.com only. Hardcoded to this site by design. Do not add a
 * site switch and do not copy it out to another repo.
 *
 * THE MODEL, AND WHY IT CHANGED ON 2026-07-28
 * -------------------------------------------
 * TimPaemi is a company AND two people: TimPaemi Co., Ltd., run by Tim and
 * Paemi. Until now the markup only expressed the company half - every `author`
 * on every page resolved to an `Organization`, and the two `Person` nodes that
 * existed carried nothing but a bare `name`.
 *
 * That is backwards for E-E-A-T. Google's Article documentation is explicit:
 *
 *   "Use Person or Organization … add a url or sameAs property pointing to a
 *    page about the author … To help Google best understand authors across
 *    various features."
 *
 * An audit on 2026-07-28 found 704 Person nodes across 350 pages and ZERO of
 * them carried `url` or `sameAs`. Two named local people is the single strongest
 * differentiator this site has against every scraped aggregator in the niche,
 * and it existed only in prose that machines discard.
 *
 * The corrected model:
 *
 *   publisher  -> Organization  (TimPaemi Co., Ltd.)  — who stands behind it
 *   author     -> [Person Tim, Person Paemi]          — who wrote it
 *   founder    -> the same two Person nodes, by @id   — one entity, not copies
 *
 * Each Person carries `url` pointing at its own anchor on /about/, plus the
 * shared `sameAs` social set. /about/ is an existing indexed page with a photo
 * and a "Who runs this" section, so this needs no new URL and no sitemap change.
 *
 * Two rules from Google's Article doc that are easy to get wrong and are
 * deliberately observed below:
 *   - separate `author` entries per person; never "Tim and Paemi" in one `name`
 *   - `name` carries the name ONLY - no job title, no honorific, no "posted by"
 *     (jobTitle is a sibling property, which is allowed and used here)
 */

const SITE = 'https://pattaya-gym.com';
const TIMPAEMI_URL = 'https://timpaemi.com/';

// Canonical author photo lives at the entity home (timpaemi.com) — one URL
// network-wide so Google binds every byline image to the same entity.
const AUTHOR_IMAGE = 'https://timpaemi.com/authors/timpaemi.jpg';

const SOCIAL_SAMEAS = [
  'https://www.youtube.com/@timpaemi',
  'https://www.tiktok.com/@timpaemi.com',
  'https://www.instagram.com/timpaemi/',
  'https://www.facebook.com/timpaemi',
];

// sameAs = social profiles + the publisher hub only. Sister sites are NOT this
// entity's profiles — listing network domains here would be a link-network
// signal, not an identity signal. Do not add them.
const NETWORK_SAMEAS = [
  ...SOCIAL_SAMEAS,
  'https://pattaya-gym.com/',
];

const TIMPAEMI_ID = 'https://timpaemi.com/#timpaemi';
const TIM_ID = 'https://timpaemi.com/#tim';
const PAEMI_ID = 'https://timpaemi.com/#paemi';

/* Bio anchors on this site's own /about/ page. Google wants `url` to lead to
   "further information about the author"; /about/ carries the photo and the
   "Who runs this" section, so it qualifies without inventing a new page. */
const TIM_BIO = `${SITE}/about/#tim`;
const PAEMI_BIO = `${SITE}/about/#paemi`;

const KNOWS_ABOUT = [
  'Muay Thai',
  'Gyms and fitness in Pattaya',
  'Sport tourism in Thailand',
  'Pattaya, Chon Buri',
  'Local directory editorial',
];

/** Person node — Tim. Emitted once per page, referenced by @id elsewhere. */
function personTim() {
  return {
    '@type': 'Person',
    '@id': TIM_ID,
    name: 'Tim',
    alternateName: 'Tim Paemi',
    url: TIM_BIO,
    image: AUTHOR_IMAGE,
    jobTitle: 'Founder and editor',
    description: 'Long-time Pattaya resident; researches and writes the venue records and guides on Pattaya.Gym.',
    homeLocation: { '@type': 'Place', name: 'Pattaya, Chon Buri, Thailand' },
    knowsAbout: KNOWS_ABOUT,
    worksFor: { '@id': TIMPAEMI_ID },
    sameAs: NETWORK_SAMEAS,
  };
}

/** Person node — Paemi. */
function personPaemi() {
  return {
    '@type': 'Person',
    '@id': PAEMI_ID,
    name: 'Paemi',
    url: PAEMI_BIO,
    image: AUTHOR_IMAGE,
    jobTitle: 'Co-founder and editor',
    description: 'Co-founder of TimPaemi Co., Ltd.; Pattaya-based, works on venue research and Thai-language sourcing.',
    homeLocation: { '@type': 'Place', name: 'Pattaya, Chon Buri, Thailand' },
    knowsAbout: KNOWS_ABOUT,
    worksFor: { '@id': TIMPAEMI_ID },
    sameAs: NETWORK_SAMEAS,
  };
}

/** Both Person nodes, for pages that emit the full entity graph. */
function authorPersons() {
  return [personTim(), personPaemi()];
}

/**
 * Reference array for JSON-LD `author`. Two separate entries, per Google's
 * documented requirement — never one node with both names in it.
 */
function authorRefs() {
  return [{ '@id': TIM_ID }, { '@id': PAEMI_ID }];
}

/** Reference object for JSON-LD `publisher` — the company, not the people. */
function timpaemiRef() {
  return { '@id': TIMPAEMI_ID };
}

/** The publisher Organization — emit exactly once per page. */
function timpaemiOrganization() {
  return {
    '@type': 'Organization',
    '@id': TIMPAEMI_ID,
    name: 'TimPaemi',
    legalName: 'TimPaemi Co., Ltd.',
    url: TIMPAEMI_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE}/brand/logo-mark.svg`,
      contentUrl: `${SITE}/brand/logo-mark.svg`,
    },
    foundingLocation: { '@type': 'Place', name: 'Pattaya, Chon Buri, Thailand' },
    // Reference the Person nodes by @id rather than restating them, so the two
    // people are one entity each across the whole graph.
    founder: [{ '@id': TIM_ID }, { '@id': PAEMI_ID }],
    employee: [{ '@id': TIM_ID }, { '@id': PAEMI_ID }],
    sameAs: SOCIAL_SAMEAS,
  };
}

/** Legacy single-Person node. Superseded; retained only so old imports resolve. */
function authorPerson() {
  return personTim();
}

/** Visible byline HTML. */
function bylineAuthorHtml() {
  return 'By Tim &amp; Paemi';
}

module.exports = {
  personTim,
  personPaemi,
  authorPersons,
  authorRefs,
  authorPerson,
  bylineAuthorHtml,
  timpaemiRef,
  timpaemiOrganization,
  TIMPAEMI_ID,
  TIM_ID,
  PAEMI_ID,
  TIM_BIO,
  PAEMI_BIO,
  NETWORK_SAMEAS,
  SOCIAL_SAMEAS,
  TIMPAEMI_URL,
  AUTHOR_IMAGE,
};
