/**
 * timpaemi-author.js — single source of truth for the TimPaemi author entity.
 *
 * Entity-SEO goal: every article across the network attributes to the same
 * Person node (TimPaemi · timpaemi.com) so Google/AI engines consolidate
 * "TimPaemi", "Tim Paemi", "Paemi Tim" searches onto one knowledge entity.
 */

const SITE = 'https://pattaya-gym.com';
const TIMPAEMI_URL = 'https://timpaemi.com/';
const AUTHOR_IMAGE = `${SITE}/authors/timpaemi.jpg`;

const NETWORK_SAMEAS = [
  'https://timpaemi.com/',
  'https://pattaya-authority.com/',
  'https://pattaya-gym.com/',
  'https://pattaya-afterdark.com/',
  'https://pattaya-restaurant-guide.com/',
  'https://pattayavisahelp.com/',
  'https://pattaya-school-guide.com/',
  'https://pattaya-coffee.com/',
  'https://pattayastream.com/',
  'https://pattaya-medical.com/',
  'https://pattayapets.com/',
  'https://pattaya-vehicle-rentals.com/',
  'https://pattayavilla.com/',
  'https://pattayapersonaltrainer.com/',
  'https://mrweoutside.com/',
];

/** Canonical Person node for JSON-LD `author` fields. */
function authorPerson() {
  return {
    '@type': 'Person',
    '@id': `${TIMPAEMI_URL}#timpaemi`,
    name: 'TimPaemi',
    alternateName: ['Tim Paemi', 'Paemi Tim', 'Tim & Paemi'],
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

module.exports = { authorPerson, bylineAuthorHtml, NETWORK_SAMEAS, TIMPAEMI_URL, AUTHOR_IMAGE };
