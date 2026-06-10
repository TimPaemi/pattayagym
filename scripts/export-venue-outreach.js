#!/usr/bin/env node
/**
 * export-venue-outreach.js
 * CSV of venues with websites for backlink outreach + badge URL.
 */

const fs = require('fs');
const path = require('path');
const { loadGyms } = require('./lib/load-gyms');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pattaya-gym.com';
const OUT_DIR = path.join(ROOT, 'private', 'outreach');
const CSV_PATH = path.join(OUT_DIR, 'venue-outreach.csv');

function csvCell(s) {
  const v = String(s || '').replace(/"/g, '""');
  return `"${v}"`;
}

const allGyms = loadGyms(ROOT);
const venueN = allGyms.length;
const gyms = allGyms.filter(g => g.website && String(g.website).startsWith('http'));
gyms.sort((a, b) => a.name.localeCompare(b.name));

function embedHtml(g, listing) {
  return `<a href="${listing}" title="${g.name} — verified listing on Pattaya.Gym"><img src="${SITE}/badge-listed.svg" alt="Listed on Pattaya.Gym — independent Pattaya sport directory" width="180" height="44" loading="lazy"></a>`;
}

function embedTextLink(g, listing) {
  return `<a href="${listing}">Verified listing on Pattaya.Gym</a> — independent directory of ${venueN} Pattaya sport venues.`;
}

const header = ['venue_id', 'venue_name', 'category', 'area', 'listing_url', 'website', 'phone', 'badge_url', 'embed_html_badge', 'embed_html_textlink', 'email_template'];
const rows = gyms.map(g => {
  const listing = `${SITE}/gyms/${g.id}/`;
  const badge = `${SITE}/badge-listed.svg`;
  const template = `Subject: Your venue is listed on Pattaya.Gym — ${g.name}\n\nHi ${g.name} team,\n\nWe run ${SITE} — an independent, hand-checked directory of ${venueN} Pattaya sport venues. No paid placements, no commissions. Your listing is free and live here:\n\n${listing}\n\nTwo quick things:\n\n1. If any hours, prices, or contact details are wrong, reply and we'll fix them within days.\n2. If the listing is useful, we'd appreciate a link to it from your website — it helps visitors confirm you're open and verified. Copy-paste badge code:\n\n${embedHtml(g, listing)}\n\nOr a plain text link works just as well:\n\n${embedTextLink(g, listing)}\n\nThanks,\nTim — Pattaya.Gym (${SITE})\nWhatsApp +66 96 728 6999`;
  return [
    g.id,
    g.name,
    g.category,
    g.area,
    listing,
    g.website,
    g.phone || '',
    badge,
    embedHtml(g, listing),
    embedTextLink(g, listing),
    template,
  ].map(csvCell).join(',');
});

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(CSV_PATH, [header.join(','), ...rows].join('\n'), 'utf8');

// Public stub overwrites any cached full CSV at /outreach/venue-outreach.csv on deploy.
const STUB = path.join(ROOT, 'outreach', 'venue-outreach.csv');
const stubText = `# This export is not published on the web.
# Generate locally: node scripts/export-venue-outreach.js
# Output: private/outreach/venue-outreach.csv
`;
fs.mkdirSync(path.dirname(STUB), { recursive: true });
fs.writeFileSync(STUB, stubText, 'utf8');

const readme = `# Venue outreach export

Generated: ${new Date().toISOString().slice(0, 10)}

- **${gyms.length}** venues with a public website
- **Badge:** ${SITE}/badge-listed.svg
- **Listing pattern:** ${SITE}/gyms/{slug}/

Import \`venue-outreach.csv\` into Google Sheets. Track: Emailed · Replied · Linked.

See \`badge-kit.md\` for the full backlink playbook (embed codes, email template, targets).
`;

const badgeKit = `# Pattaya.Gym backlink badge kit

Generated: ${new Date().toISOString().slice(0, 10)}

## Why this matters

The domain is new (registered 2026-04). Google ranks it only when independent
sites link to it. Listed venues are the warmest possible targets: the link
benefits them (proof of verification) and us (local, topically relevant
backlinks — the strongest kind for "gym pattaya" queries).

**Target: 10–20 live venue links in 60 days.** That alone moves domain trust
more than any on-page change.

## Per-venue embed codes

\`venue-outreach.csv\` has three ready columns for each of the ${gyms.length} venues
with websites:

- \`embed_html_badge\` — SVG badge linking to the venue's listing
- \`embed_html_textlink\` — plain text link (for venues that won't host images)
- \`email_template\` — full outreach email, personalised per venue

## Generic badge embed (any page)

\`\`\`html
<a href="${SITE}/" title="Pattaya.Gym — independent Pattaya sport directory"><img src="${SITE}/badge-listed.svg" alt="Listed on Pattaya.Gym" width="180" height="44" loading="lazy"></a>
\`\`\`

## Outreach sequence

1. Email (template in CSV) → wait 5 days
2. WhatsApp/LINE follow-up if the venue has one (numbers in CSV) — Thai venues respond far better on LINE
3. Offer the trade explicitly: we keep their hours/prices current forever; they host one link
4. Log status in the sheet: Emailed · Replied · Linked · Declined

## Beyond venues (next tier)

- r/MuayThai, r/Pattaya — answer real questions, link specific guides (not the homepage)
- ASEAN Now Pattaya forum — active expat audience
- Muay Thai gear/training blogs — offer venue data or a quote as a source
- Sister-network sites already link in; they don't add authority — external links do
`;

fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readme, 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'badge-kit.md'), badgeKit, 'utf8');
console.log(`Exported ${gyms.length} venues → ${CSV_PATH}`);
console.log(`Badge kit → ${path.join(OUT_DIR, 'badge-kit.md')}`);
