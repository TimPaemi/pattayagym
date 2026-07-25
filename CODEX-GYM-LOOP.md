# CODEX PATTAYA-GYM LOOP — add + update venues (paste repeatedly)

One paste = ONE session. Read `AGENTS.md` first (stack, build gate, deploy rules), plus
`EDITORIAL_STYLE_GUIDE.md` and `SCHEMA_REFERENCE.md`. Those govern; this file only defines the
recurring work. Append a session entry to `WORK_LOG_CODEX.md` at the end, then STOP.

## NON-NEGOTIABLES
1. **Never invent a fact.** Price, hours, phone, class schedule, trainer count, opening year —
   each comes from a source you can cite in the record's `sources:` list, or it is omitted.
2. **Sources = first-hand.** Venue's own site/Facebook/Instagram, live Google Maps listing,
   federation/association listings (PADI, IBJJF, tournament sites), local press. Not SERP AI
   summaries, not scraped aggregator text.
3. **Every record carries `verified: YYYY-MM-DD`** — the date YOU confirmed it this session.
4. **No `aggregateRating` in schema.** Ratings may appear in prose with platform + date.
5. **No thin filler.** A venue with almost nothing verifiable gets a short honest record, not
   padded prose. Missing data is stated as unknown, never guessed.
6. **Never commit, push or deploy.** Tim ships.
7. **Run the full gate before finishing** (AGENTS.md "Before every ship"): `node build-v2.js`
   plus the script chain, `npm run validate`, `verify-deploy.js`, `npm run html:validate`.
   Zero errors required. Report the venue-page count the build prints.

## STEP 0 — orient
Read the last entry in `WORK_LOG_CODEX.md`. Check `DISCOVERED-VENUES.md`,
`DISCOVERED-VENUES-WAVE2.md` and `BACKLOG-VALIDATED.md` for already-found candidates that were
never written up — those come first, before new discovery.

## PART A — REFRESH: the 15 oldest records
Take the 15 `venues/*.md` files with the oldest `verified:` dates. Re-check against live
sources: still operating · address/phone/website current · hours · **prices** (the field that
rots fastest — day pass, weekly, monthly, per-class, course fees) · schedule/classes · anything
the record claims that a source no longer supports.
- Update changed fields, refresh `sources:`, bump `verified:`.
- Closed/moved/renamed: record it plainly (`status`-style note in the record and the work log)
  and flag it in the report — do not silently keep it as if operating.
- Unchanged after checking: still bump `verified:` and note "re-verified, no change".

## PART B — ADD: up to 8 new venues
Priority order, because these categories are thin or empty in the current data:
**MMA · BJJ · Boxing · CrossFit** (near-zero venues today), then muay-thai gyms outside the
tourist strip, then racquet/padel/badminton, swimming, climbing, kids-youth, equestrian.

For each new venue:
1. Confirm it exists and operates now (2+ independent current sources; one may be the venue's
   own channel if it has recent activity).
2. Check `data.js` and `venues/` for an existing record under any name variant — no duplicates.
3. Write `venues/<id>.md` with the same frontmatter shape existing files use: `id, name,
   category, area, address, phone, website, social, hours, priceRange, distinction, verified,
   sources, description, mapsUrl, tags` plus the category-specific fields the neighbours use
   (e.g. `courses`/`diveSites` for watersports, class/trainer detail for muay-thai).
   `category` MUST be one of the existing keys in `data.js`.
4. Add the matching entry to `data.js`.
5. Body: what training is actually offered, who it suits, what it costs with the as-of date,
   how to get there, and what a first-timer should know. Honest limits included.

## PART C — regenerate + QA
Run the full build gate. Report: venue-page count · validate errors and warnings (warning
counts by type) · verify-deploy result · html:validate result · sitemap/lastmod updated ·
any category that still has zero venues.

## SESSION ENTRY (append to `WORK_LOG_CODEX.md`, matching existing format)
Records refreshed (with what changed) · venues added by category · closures/renames found ·
build + validation numbers · what was left for next session.
