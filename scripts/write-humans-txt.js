#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { GYMS, CATEGORIES } = require(path.join(ROOT, 'data.js'));
const text = `# pattaya-gym.com — humans.txt
# A source-checked sport directory made in Pattaya.

/* PEOPLE */
  Authors:           Tim and Paemi
  Publisher:         TimPaemi Co., Ltd.
  Publisher hub:     https://timpaemi.com/
  Contact:           info@pattaya-gym.com
  Location:          Pattaya, Chon Buri, Thailand
  Publisher scope:   20+ independently managed Pattaya publications and products

/* SITE */
  Records:           ${GYMS.length}
  Sport categories:  ${CATEGORIES.length}
  Purpose:           Dated, sourced sport-venue facts with visible uncertainty
  Commercial policy: No paid placement, booking commission or venue affiliate links
  Visit claims:      None; Pattaya.Gym does not claim first-hand venue visits

/* CURRENT STACK */
  Static HTML + CSS + first-party vanilla JavaScript
  Node.js build chain: build-v2.js + scripts/ship-chain.json
  YAML frontmatter + Markdown venue records
  Consent-first optional Google Analytics; Google code is not requested before opt-in
  Cloudflare Pages, with public-path denial rules in _redirects and _headers
  Local variable fonts; no third-party font request

/* DATA */
  /api/venues.json       — directory records (CC BY 4.0)
  /api/categories.json   — records grouped by sport
  /api/areas.json        — records grouped by location
  /status.json           — current completeness and build figures
  /feed.json             — JSON Feed 1.1
  /openapi.yaml          — OpenAPI 3.1 schema

/* STANDARDS */
  HTML5, CSS, JSON-LD, Open Graph, RFC 9116 security.txt
  Accessibility target: WCAG 2.2 AA
  Structured authors: two Person nodes; publisher: TimPaemi Co., Ltd.

Generated ${new Date().toISOString().slice(0, 10)} from the live dataset and ship manifest.
`;
fs.writeFileSync(path.join(ROOT, 'humans.txt'), text, 'utf8');
console.log(`humans.txt written for ${GYMS.length} records and current stack.`);
