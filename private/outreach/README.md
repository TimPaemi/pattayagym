# Venue outreach export (local only)

Public `/outreach/*` URLs redirect away on production (`_redirects`).

Generate the CSV locally:

```cmd
node scripts/export-venue-outreach.js
```

Output: `private/outreach/venue-outreach.csv` (gitignored).

Import into Google Sheets. Track: Emailed · Replied · Linked.
