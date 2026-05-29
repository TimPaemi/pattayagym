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
const OUT_DIR = path.join(ROOT, 'outreach');
const CSV_PATH = path.join(OUT_DIR, 'venue-outreach.csv');

function csvCell(s) {
  const v = String(s || '').replace(/"/g, '""');
  return `"${v}"`;
}

const gyms = loadGyms(ROOT).filter(g => g.website && String(g.website).startsWith('http'));
gyms.sort((a, b) => a.name.localeCompare(b.name));

const header = ['venue_id', 'venue_name', 'category', 'area', 'listing_url', 'website', 'phone', 'badge_url', 'email_template'];
const rows = gyms.map(g => {
  const listing = `${SITE}/gyms/${g.id}/`;
  const badge = `${SITE}/badge-listed.svg`;
  const template = `Subject: Your venue on Pattaya.Gym — ${g.name}\n\nHi ${g.name} team,\n\nWe run ${SITE} — independent directory of 158 Pattaya sport venues. Your free listing: ${listing}\n\nIf you'd like to show visitors you're listed, link to your page or use our badge: ${badge}\n\nReply with any corrections to hours or prices.\n\nTim — Pattaya.Gym`;
  return [
    g.id,
    g.name,
    g.category,
    g.area,
    listing,
    g.website,
    g.phone || '',
    badge,
    template,
  ].map(csvCell).join(',');
});

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(CSV_PATH, [header.join(','), ...rows].join('\n'), 'utf8');

const readme = `# Venue outreach export

Generated: ${new Date().toISOString().slice(0, 10)}

- **${gyms.length}** venues with a public website
- **Badge:** ${SITE}/badge-listed.svg
- **Listing pattern:** ${SITE}/gyms/{slug}/

Import \`venue-outreach.csv\` into Google Sheets. Track: Emailed · Replied · Linked.
`;

fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readme, 'utf8');
console.log(`Exported ${gyms.length} venues → ${CSV_PATH}`);
