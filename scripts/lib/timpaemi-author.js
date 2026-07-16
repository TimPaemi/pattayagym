/**
 * timpaemi-author.js — single source of truth for the TimPaemi author entity.
 *
 * Entity-SEO goal: every article across the network attributes to the same
 * Person node (TimPaemi · timpaemi.com) so Google/AI engines consolidate
 * "TimPaemi", "Tim Paemi", "Paemi Tim" searches onto one knowledge entity.
 */

const SITE = 'https://pattaya-gym.com';
const TIMPAEMI_URL = 'https://timpaemi.com/';
// Canonical author photo lives at the entity home (timpaemi.com) — one URL
// network-wide so Google binds every byline image to the same Person node.
const AUTHOR_IMAGE = 'https://timpaemi.com/authors/timpaemi.jpg';

const SOCIAL_SAMEAS = [
  'https://www.youtube.com/@timpaemi',
  'https://www.tiktok.com/@timpaemi.com',
  'https://www.instagram.com/timpaemi/',
  'https://www.facebook.com/timpaemi',
];

// sameAs = social profiles + honest publisher hub only. Sister sites are NOT
// the same entity's profiles — do not list network domains here (link-network signal).
const NETWORK_SAMEAS = [
  ...SOCIAL_SAMEAS,
  'https://pattaya-authority.com/',
  'https://pattaya-gym.com/',
];

/** Canonical Person node for JSON-LD `author` fields. */
function authorPerson() {
  return {
    '@type': 'Person',
    '@id': `${TIMPAEMI_URL}#timpaemi`,
    name: 'TimPaemi',
    alternateName: ['Tim Paemi', 'Paemi Tim', 'Tim & Paemi', 'TIMPAEMI'],
    url: TIMPAEMI_URL,
    image: AUTHOR_IMAGE,
    jobTitle: 'Founders & editors, Pattaya Authority network',
    worksFor: { '@id': `${SITE}/#organization` },
    knowsAbout: ['Pattaya', 'Muay Thai', 'Fitness', 'Sport tourism Thailand', 'Pattaya nightlife', 'Local directory editorial'],
    sameAs: NETWORK_SAMEAS,
  };
}

/** Visible byline HTML (guides). */
function bylineAuthorHtml() {
  return `By <a href="${TIMPAEMI_URL}" rel="author" target="_blank">TimPaemi</a>`;
}

module.exports = { authorPerson, bylineAuthorHtml, NETWORK_SAMEAS, SOCIAL_SAMEAS, TIMPAEMI_URL, AUTHOR_IMAGE };
