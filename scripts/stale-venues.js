#!/usr/bin/env node
/**
 * stale-venues.js
 *
 * Outputs a CSV-style list of venues whose `verified:` date is more than
 * 30 days old. Sorted oldest-first. Run when you want to know what to
 * refresh editorially.
 *
 *   node scripts/stale-venues.js
 *   node scripts/stale-venues.js --days 14   (custom threshold)
 *   node scripts/stale-venues.js --csv > stale.csv
 */

const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { GYMS } = require(path.join(ROOT, 'data.js'));

const args = process.argv.slice(2);
const daysFlag = args.indexOf('--days');
const THRESHOLD = daysFlag >= 0 && args[daysFlag + 1] ? parseInt(args[daysFlag + 1], 10) : 30;
const CSV_MODE = args.includes('--csv');

const today = new Date();
const stale = GYMS
  .filter(g => g.verified)
  .map(g => {
    const d = new Date(g.verified);
    const ageDays = Math.round((today.getTime() - d.getTime()) / 86400000);
    return { id: g.id, name: g.name, category: g.category, area: g.area, verified: g.verified, ageDays, website: g.website || '', mapsUrl: g.mapsUrl || '' };
  })
  .filter(v => v.ageDays > THRESHOLD)
  .sort((a, b) => b.ageDays - a.ageDays);

if (CSV_MODE) {
  console.log('id,name,category,area,verified,age_days,website,maps_url');
  for (const v of stale) {
    const row = [v.id, v.name, v.category, v.area, v.verified, v.ageDays, v.website, v.mapsUrl]
      .map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',');
    console.log(row);
  }
} else {
  console.log(`\n=== Stale venues (verified > ${THRESHOLD} days old) ===\n`);
  console.log(`${stale.length} of ${GYMS.length} venues are stale.\n`);
  if (stale.length === 0) {
    console.log('Nothing to refresh.');
  } else {
    console.log('ID                                       AGE   VERIFIED    NAME');
    console.log('---------------------------------------- ----- ----------- ----------------------------------------');
    for (const v of stale.slice(0, 40)) {
      const idCol = v.id.padEnd(40);
      const ageCol = String(v.ageDays + 'd').padStart(5);
      const dateCol = v.verified;
      console.log(`${idCol} ${ageCol} ${dateCol}  ${v.name}`);
    }
    if (stale.length > 40) {
      console.log(`\n... and ${stale.length - 40} more. Run with --csv to dump all.`);
    }
    console.log(`\nRun \`node scripts/stale-venues.js --csv > stale.csv\` for the full list.`);
    console.log(`To refresh a venue: visit its mapsUrl, check official website, edit data.js + venues/<id>.md frontmatter, commit.`);
  }
}
