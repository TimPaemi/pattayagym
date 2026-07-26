# CODEX PATTAYA-GYM ENRICHMENT LOOP — paste this repeatedly, one paste = one session

Your job is to make thin pages genuinely worth reading, a few at a time, without
ever inventing a fact. The site currently averages **107 words of body prose per
venue** across 215 venues (median 104; 200 of 215 are under 150 words). Nothing
is wrong with the design or the build — the content is the bottleneck.

Read these first; they govern, this file only defines the recurring work:

- `AGENTS.md` — stack, build gate, deploy rules
- `EDITORIAL_STYLE_GUIDE.md` — voice, venue structure
- `SCHEMA_REFERENCE.md` — structured data
- `DESIGN_RULES.md` — the 2026 design system (do not fight it)
- `ENRICH-STATE.json` — the work queue. **This is what makes the loop work.**

At the end, append a session entry to `WORK_LOG_CODEX.md`, update
`ENRICH-STATE.json`, then STOP.

---

## NON-NEGOTIABLES — read every time, these matter more than word count

1. **Never invent a fact.** Price, hours, phone, class schedule, trainer count,
   ring count, floor area, founding year, equipment brands, instructor names —
   each comes from a source you can cite in that record's `sources:` list, or it
   is omitted. Not softened, not hedged. Omitted.

2. **Never write or imply a first-hand visit.** The site says venues are checked
   in person by Tim and Paemi. You have not been there. So never write "we
   visited", "when we trained here", "the mats smell of", "we counted", "on our
   visit", or any sensory detail you could only know by being present. Write in
   the informative register the existing records use. Attribute to sources:
   "the venue's rate card lists", "its Google listing shows", "the club's
   Facebook page posted in June 2026". **Breaking this rule turns an honest
   directory into a fabrication at scale — it is the worst thing you can do
   here.**

3. **Every price carries an as-of date.** "฿400 per day (venue rate card, checked
   2026-07-26)". A rate with no date is a rumour.

4. **Sources are first-hand.** The venue's own site, its Facebook or Instagram
   with recent activity, a live Google Maps listing, a federation or association
   register (PADI, IBJJF, tournament sites, Thai golf association), or local
   press. **Not** SERP AI summaries, not scraped aggregator pages, not other
   directories, not TripAdvisor prose.

5. **No padding, ever.** If a venue has almost nothing verifiable, it gets an
   honest short record and you mark it skipped (see STEP 4). A 600-word page
   built from 60 words of fact is worse than the 60-word page — it is the exact
   thin-content pattern search engines demote and readers resent. **A short
   honest record is a correct outcome, not a failure.**

6. **No cross-domain links** except the existing `timpaemi.com` publisher credit.
   Internal links are encouraged (see the linking rule in PART A).

7. **Never commit, push, tag or deploy.** Tim ships. You leave a clean working
   tree with passing gates.

8. **Do not touch** `styles.css`, `scripts/apply-design-2026.js`,
   `scripts/polish-design-2026.js`, `scripts/lib/v2-nav.js`,
   `scripts/lib/site-footer.js`, or `index.html`. The design layer is done and
   gated. You are adding content, not restyling.

---

## STEP 0 — claim your batch (deterministic, do this first)

Open `ENRICH-STATE.json`. Compute your batch exactly like this and write the list
at the top of your session before doing anything else:

```
venues   = first 6 ids in venueQueue that are in neither done.venues nor skipped.venues
category = first key  in categoryQueue not in done.categories
area     = first slug in areaQueue     not in done.areas
guide    = first slug in guideQueue    not in done.guides
```

If a queue is exhausted, wrap to index 0 — a second pass deepens rather than
creates, which is fine and expected.

`venueQueue` is ordered thinnest-first, so the loop always attacks the worst
pages next. **Do not reorder it and do not pick your own favourites** — that is
what makes consecutive runs overlap and waste sessions. At 6 venues per run,
full venue coverage is about 36 runs.

If research is going slowly, do 4 venues instead of 6 and say so in the log. A
smaller honest batch beats a rushed one.

---

## PART A — venue records (your batch of 6)

For each, edit `venues/<id>.md`. Target **450–750 words of body prose**, reached
by adding real information, never by padding.

### Frontmatter

- Bump `verified:` to today's date — you only do that for fields you actually
  re-checked this session.
- Add every new source URL to `sources:`.
- Fill `website`, `social`, `hours`, `priceRange`, `phone`, `address` where you
  found them and they were blank.
- **Never blank or change an existing verified field** unless a source shows it
  changed — and if it did, say so in the body and flag it in your report.
- If the venue has closed, moved or been renamed: record it plainly, do not
  silently keep it as if operating, and flag it prominently in your report.

### Body structure

Use these headings. Drop any section you genuinely cannot fill — an absent
section is better than an empty one.

```markdown
# <Venue name>

<Lede, 40–60 words: what this place actually is, who it suits, and one honest
limitation. No marketing adjectives.>

## What training is on offer
<Disciplines, class formats, equipment categories, number of rings / courts /
lanes / bays, floor area if published, whether coaching is included or extra.
Attribute each claim.>

## What it costs
<Every published rate with an as-of date: walk-in, weekly, monthly, per-class,
course, membership joining fee. State what is NOT included — towels, lockers,
gloves, pad work, class booking. If nothing is published, say so plainly and
list exactly what to ask when calling.>

## Who it suits — and who it does not
<An honest fit judgement derived only from the facts above: first-timer,
returning amateur, fight-prep, family, long-stay, budget. Name who should look
elsewhere and link a better-fitting venue or guide. This section is where the
site earns trust.>

## Getting there
<Area, nearest recognisable landmark, road, whether it is on a baht-bus route,
parking if published. No invented travel times or fares.>

## Before you go
<Booking requirement, what to bring, glove and wrap hire, language of
instruction, walk-in versus contract, minimum age, anything a first-timer would
otherwise get wrong.>

## What we could not verify
<Explicit bullets for the gaps: "No current rate card is published." "Class
timetable not available online as of 2026-07-26." This section is a feature.
It adds honest length, it tells the reader what to ask, and no competing
directory does it. Never fabricate to avoid writing it.>
```

### Internal linking

2–4 internal links per record, in prose, pointing where they genuinely help:
its category (`/category/<key>/`), its area (`/area/<slug>/`), and the most
relevant guide (`/guides/<slug>/`). No link dumps, no "click here", and never
the same anchor text twice on one page.

---

## PART B — one category page and one area page

Category intros live in `scripts/inject-area-category-intros-r43.js` and
`build-v2.js`; area copy in `build-v2.js`. Find where the copy for your assigned
`category` and `area` is defined and expand it there, **not** in the generated
HTML — generated HTML is overwritten on every build.

Target **350+ words each**, and make it decision-useful rather than descriptive:

- What the category or area actually offers in Pattaya, with real counts from
  `data.js`
- The price range you actually see across those venues, with as-of dates
- How the options differ from one another — the trade-offs a chooser faces
- Who the area or category suits, and who it does not
- Two or three internal links to the strongest venues and the relevant guide

---

## PART C — one guide

Deepen your assigned `guide`. Guides are written by `scripts/write-*-guides.js`
and shaped by `scripts/lib/editorial-guide-shell.js`. **Edit the writer script,
not the built HTML.**

Add genuine substance, aiming for 1,200+ words total:

- A concrete comparison table where one helps (prices, hours, what is included),
  built from `data.js` plus dated sources
- The trade-off the guide is actually about, stated plainly
- A short "if you only read one thing" answer near the top
- Two or three FAQ entries that answer real questions, feeding the existing
  FAQPage schema
- Fresh internal links to venues that now have enriched records

Do not restructure the guide shell or its schema. Add content inside it.

---

## PART D — build and gate

The one-command route runs the full chain plus every gate and cannot touch git:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File SHIP-GYM.ps1 -DryRun
```

If PowerShell is unavailable, run the chain listed in `AGENTS.md` under "Before
every ship", ending with:

```cmd
node scripts/apply-design-2026.js
node scripts/polish-design-2026.js
node scripts/inject-guide-schema.js
node validate.js
node scripts/verify-deploy.js
node scripts/verify-design-layer.js
npm run html:validate
```

**All gates must pass with zero errors.** If one fails, fix it in this session —
do not leave a broken tree and do not disable a gate. `verify-deploy.js` and
`verify-design-layer.js` are hard gates.

---

## PART E — update state and log

In `ENRICH-STATE.json`:

- `runCount` += 1, set `lastRunAt` to today
- append each finished venue id to `done.venues`
- append the finished category / area / guide to their `done` arrays
- for any venue you could not honestly expand, append its id to
  `skipped.venues` and add a one-line reason to `skipped.reasonByVenue`,
  e.g. `"true-fitness-pattaya": "No rate card, timetable or equipment list
  published anywhere; Google listing is the only live source."`

Never remove ids from `venueQueue`. `done` and `skipped` are what advance the
loop; the queue is the fixed running order.

Then append to `WORK_LOG_CODEX.md`, matching the existing format:

- venues enriched, with before → after word counts
- new facts found per venue, and the source for each
- venues skipped, with the reason
- closures, moves or renames discovered
- category / area / guide touched
- gate results: validate errors and warnings, verify-deploy, verify-design-layer,
  html:validate, and the venue-page count the build printed
- what you left for the next run

---

## SELF-CHECK before you finish

Answer these explicitly in your report. If any answer is no, fix it first.

1. Can every number, price, hour and name in what I wrote be traced to a URL in
   that record's `sources:` list?
2. Does every price carry an as-of date?
3. Have I written nothing that implies a first-hand visit?
4. Did I add information rather than words? Would a reader planning a trip be
   measurably better off?
5. Did I leave short records short instead of padding them, and mark them
   skipped with a reason?
6. Do all gates pass?
7. Is `ENRICH-STATE.json` updated so the next run picks a different batch?
8. Did I leave the working tree uncommitted for Tim?

---

## What "rich" means here, and what it does not

**Does mean:** a reader deciding between three gyms can make that decision from
your page. Real prices with dates. Honest limitations. Who it is wrong for.
Precise gaps.

**Does not mean:** word count. Never write "nestled in the heart of vibrant
Pattaya", "whether you're a seasoned athlete or just starting out", "state-of-
the-art facilities", "something for everyone", or any sentence that would be
equally true of a venue you had never heard of. If a sentence would survive
swapping in a different gym's name, delete it.
