# CODEX PATTAYA-GYM ENRICHMENT LOOP v3 — built for long queues

One paste = one session. Queue as many back-to-back as you like; nothing is
pushed between them. `ENRICH-STATE.json` guarantees each run takes a different
batch.

Read first — these govern, this file only defines the recurring work:
`AGENTS.md`, `EDITORIAL_STYLE_GUIDE.md`, `SCHEMA_REFERENCE.md`,
`DESIGN_RULES.md`, and `ENRICH-STATE.json`.

Finish by updating `ENRICH-STATE.json`, appending to `WORK_LOG_CODEX.md`, then
STOP. Do not ask questions or wait for confirmation — make the call, log it,
move on.

---

## NON-NEGOTIABLES

1. **Never invent a fact.** Price, hours, phone, class schedule, trainer count,
   ring count, floor area, founding year, equipment brands, instructor names —
   each traces to a URL in that record's `sources:` list, or it is omitted.
   Not softened. Omitted.

2. **Never write or imply a first-hand visit.** The site says venues are checked
   in person by Tim and Paemi. You have not been there. No "we visited", "when we
   trained here", "the mats smell of", "we counted", "on our visit", "we spoke
   to". No sensory detail you could only have by being present. Attribute
   instead: "the venue's rate card lists", "its Google listing shows", "the club
   posted in June 2026". **Breaking this turns an honest directory into
   fabrication at scale. It is the worst thing you can do here.**

3. **Cite the exact page, not the profile.** If a price comes from a Facebook post
   dated 13 July 2026, the post's own URL goes in `sources:` — not just
   `facebook.com/venuename`. A reader must be able to click through to the thing
   you read. Set `priceAsOf:` and `priceSourceUrl:` in frontmatter for the price
   you used (this convention is now standard on this site).

4. **Every price carries an as-of date** in the prose too: "฿1,599 per month
   (operator's membership graphic, 13 July 2026, checked 2026-07-26)".

5. **Sources are first-hand.** The venue's own site, its Facebook or Instagram
   with recent activity, a live Google Maps listing, a federation register (PADI,
   IBJJF, tournament sites), or local press. **Not** SERP AI summaries, not
   aggregators, not other directories, not TripAdvisor prose.

6. **No padding — but skip ONLY for identity, never for missing prices.**
   Runs 1–15 skipped 61% of attempted venues, and most of those skips were
   wrong. Petchrungruang was skipped with "supports the active family camp,
   phone and current fight activity, but no stable owner tariff" — that is a
   confirmed, operating, well-documented gym and it deserved a page.

   **Skip a venue if and only if one of these is true:**
   - it is permanently closed (then set `status: closed`, see PART A), or
   - you cannot confirm the venue currently exists as a distinct identity —
     no live Maps place, no operator channel, name collides with other venues.

   **Never skip because a price, timetable, or equipment list is unpublished.**
   If existence and operation are confirmed, you have an address, a phone,
   hours, a discipline and a category — that is a genuinely useful 450-word
   page. "No published rate card; here is exactly what to ask when you call"
   is the most useful sentence on the page. That is what the *What we could
   not verify* section is for. A confirmed venue is never a skip.

7. **Do not touch the headline venue counts.** 4 of 215 records are closed, so
   211 operate. Tim is deciding how to word that. Leave the homepage title, meta
   descriptions and hero counts alone. In new copy you write, say "records" or
   "listings" rather than asserting all are open.

8. **No cross-domain links** except the existing `timpaemi.com` publisher credit.
   Internal links are encouraged.

9. **Never commit, push, tag or deploy.** Tim ships. Leave a clean tree with
   passing gates.

10. **Do not touch** `styles.css`, `index.html`, `scripts/apply-design-2026.js`,
    `scripts/polish-design-2026.js`, `scripts/verify-design-layer.js`,
    `scripts/lib/v2-nav.js`, `scripts/lib/site-footer.js`, `SHIP-GYM.ps1`. The
    design layer is finished and gated. You add content.

11. **Never run `node build-v2.js` on its own.** It regenerates all 215 venue
    pages and wipes the FAQ, intro, internal-linking and geo injection layers.
    If you build, you run the whole chain (PART D). A bare build leaves the tree
    broken for the next run in the queue.

---

## STEP 0 — claim your batch

Open `ENRICH-STATE.json`. Compute this and write the list at the top of your
session before touching anything:

```
venues   = first 6 ids in venueQueue in neither done.venues nor skipped.venues
repair   = first 2 ids in repairQueue not in done.repaired
           (when repairQueue is exhausted, use reopenQueue instead — PART A2)
guide    = first 2 slugs in guideQueue not in done.guides
category = first key  in categoryQueue not in done.categories
area     = first slug in areaQueue     not in done.areas
```

Wrap to index 0 if a queue is exhausted — a second pass deepens, which is fine.

`venueQueue` is thinnest-first. **Do not reorder it and do not pick your own
favourites** — that is what makes queued runs collide and waste sessions. Drop
to 4 venues if research is slow and say so in the log.

---

## PART A — the 6 venue records

Edit `venues/<id>.md`. Target **450–750 words of body prose**, reached only by
adding real information.

### Frontmatter

- Bump `verified:` to today — only for fields you actually re-checked.
- Add every source URL you used, at page-level precision (rule 3).
- Set `priceAsOf:` and `priceSourceUrl:` when you record a price.
- Fill `website`, `social`, `hours`, `priceRange`, `phone`, `address` where found
  and previously blank.
- **Never blank or change an existing verified field** unless a source shows it
  changed — then say so in the body and flag it in your report.
- **Closed, moved or renamed:** set `status: closed` in the record frontmatter
  **and** on the matching entry in `data.js` — both, or the page will not show
  the closure badge. Rewrite `description` to lead with the closure. Add `closed`
  to `tags`. `build-v2.js` renders a red PERMANENTLY CLOSED pill and suppresses
  the live-hours indicator off that field. Flag it prominently in your report.

### Body structure — USE THESE SIX H2 STRINGS VERBATIM

This is a hard requirement, not a suggestion. Across runs 2–15, 25 of 35
enriched records invented their own headings ("Weekly hours checked 26 July
2026", "Training format and price"), and only 5 of 35 kept *What we could not
verify* — the one section no competing directory has. Inconsistent structure
across 215 pages destroys scannability and the sense of one system.

Copy these six headings character-for-character. Keep their order. If a section
has nothing in it, write one honest sentence saying so — do not rename it, do
not merge it into a neighbour, do not delete it.

- `## What training is on offer`
- `## What it costs`
- `## Who it suits — and who it does not`
- `## Getting there`
- `## Before you go`
- `## What we could not verify`

**Markdown links only** — `[text](/path/)`. Never raw `<a href>`; four recent
records used raw HTML and it is inconsistent with the rest of the site.

```markdown
# <Venue name>

<Lede, 40–60 words: what it actually is, who it suits, one honest limitation.
No marketing adjectives.>

## What training is on offer
<Disciplines, class formats, equipment categories, ring / court / lane / bay
counts, floor area if published, whether coaching is included. Attribute each
claim.>

## What it costs
<Every published rate with an as-of date: walk-in, weekly, monthly, per-class,
course, joining fee. State what is NOT included — towels, lockers, gloves, pad
work, class booking. If nothing is published, say so and list exactly what to
ask when calling.>

## Who it suits — and who it does not
<An honest fit judgement from the facts above: first-timer, returning amateur,
fight-prep, family, long-stay, budget. Name who should look elsewhere and link a
better-fitting venue or guide. This section is where the site earns trust.>

## Getting there
<Area, nearest recognisable landmark, road, baht-bus route if known, parking if
published. No invented travel times or fares.>

## Before you go
<Booking requirement, what to bring, glove and wrap hire, language of
instruction, walk-in versus contract, minimum age, anything a first-timer would
otherwise get wrong.>

## What we could not verify
<Explicit bullets for the gaps: "No current rate card is published." "Class
timetable not online as of 2026-07-26." This section is a feature — it adds
honest length, tells the reader what to ask, and no competitor does it.>
```

2–4 internal links per record, in prose: its category (`/category/<key>/`), its
area (`/area/<slug>/`), the most relevant guide (`/guides/<slug>/`). No link
dumps, no "click here", never the same anchor text twice on a page.

---

## PART A2 — repair two off-template records (do this every run)

`ENRICH-STATE.json` has a `repairQueue` of 30 records that were enriched with
good prose but the wrong structure, and a `reopenQueue` of 40 that were skipped
for missing prices when the venue verifiably operates.

Every run, take **the first 2 ids in `repairQueue`** not already in
`done.repaired`, and reshape them onto the six canonical headings. Keep every
verified fact and source — this is a restructure, not a rewrite. Add the
*What we could not verify* section if it is missing. Convert any raw `<a href>`
to markdown links. Then append those ids to `done.repaired`.

When `repairQueue` is empty, take **the first 2 ids in `reopenQueue`** instead
and write them properly under the new rule 6, removing them from
`skipped.venues` and adding them to `done.venues`.

---

## PART B — one category page, one area page

Category intros live in `scripts/inject-area-category-intros-r43.js` and
`build-v2.js`; area copy in `build-v2.js`. **Edit those sources, never the
generated HTML** — generated HTML is overwritten on every build.

Target **350+ words each**, decision-useful rather than descriptive:

- What the category or area actually offers, with real counts from `data.js`
- The price range across those venues, with as-of dates
- How the options differ — the trade-off a chooser faces
- Who it suits and who it does not
- Two or three internal links to the strongest records and the relevant guide
- If the count includes closed or unverified records, say so (see rule 7)

---

## PART C — two guides

After 15 runs all 15 categories are done and the area queue has wrapped, but
only 15 of 47 guides are touched. Guides are now **two per run** to catch up.

Deepen each assigned `guide`. Find the `scripts/write-*.js` or
`scripts/deepen-*.js` that owns it and **edit that writer, not the built HTML**.
Aim for 1,200+ words total:

- A comparison table where one helps, built from `data.js` plus dated sources
- The trade-off the guide is actually about, stated plainly
- A short "if you only read one thing" answer near the top
- Two or three FAQ entries feeding the existing FAQPage schema
- Fresh internal links to venues that now have enriched records

Do not restructure the guide shell or its schema. Add inside it.

---

## PART D — build and gate

One command. Runs the full chain, every gate, and cannot touch git:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File SHIP-GYM.ps1 -DryRun
```

Fallback if PowerShell is unavailable — the whole chain from `AGENTS.md`, not a
bare build (rule 11), ending with `validate.js`, `verify-deploy.js`,
`verify-design-layer.js`, `verify.js`, `seo-audit.js`, `npm run html:validate`.

**All gates must pass with zero errors.** Fix failures in this session. Never
disable a gate. `verify-deploy.js` and `verify-design-layer.js` are hard gates.

---

## PART E — state and log

In `ENRICH-STATE.json`: `runCount` += 1, set `lastRunAt`, append finished venue
ids to `done.venues`, append the category / area / guide to their `done` arrays,
and for anything you could not honestly expand append the id to
`skipped.venues` with a one-line reason in `skipped.reasonByVenue`.

Never remove ids from `venueQueue` — `done` and `skipped` advance the loop, the
queue is the fixed running order.

**Append** to `WORK_LOG_CODEX.md`. Never edit or reflow an earlier run's entry —
in a long queue that destroys the audit trail. Record:

- venues enriched, before → after word counts
- each new fact and the exact URL it came from
- venues skipped, with reasons
- closures, moves, renames — and confirmation you set `status: closed` in both
  `venues/<id>.md` and `data.js`
- category / area / guide touched
- gate results and the venue-page count the build printed
- what you left for the next run

---

## STOP CONDITION

If this run skipped **every** venue in its batch, and the log shows the two
previous runs also skipped everything, stop and write at the top of your report:
`QUEUE STALLED — three consecutive all-skip runs. Tim should reorder
venueQueue or add new venues before continuing.` Do not keep grinding.

---

## SELF-CHECK — answer these explicitly, fix any "no" before finishing

0. **Grep each record you wrote for the six literal headings.** All six present,
   spelled exactly, in order? If not, fix it before anything else.
1. Can every number, price, hour and name be traced to a URL in that record's
   `sources:` list?
2. Does every price carry an as-of date, with `priceAsOf` and `priceSourceUrl`
   set, and does the source URL point at the exact page or post — not a profile?
3. Have I written nothing implying a first-hand visit?
4. Did I add information rather than words? Would a reader planning a trip be
   measurably better off?
5. Did I skip ONLY closed venues and unconfirmable identities — never a venue
   that verifiably operates but publishes no price?
6. For any closure: did I set `status: closed` in **both** the `.md` and
   `data.js`?
7. **Does every internal link I wrote resolve?** Never guess a venue slug —
   open `data.js` and copy the exact `id`. A pre-existing guide body shipped
   `/gyms/tos-badminton-pattaya/` and `/gyms/euro-tennis-pattaya/`, neither of
   which exists, and the anchor text named venues that do not exist either
   (the real ones are TOS Tennis Academy and Euro Badminton Club). Broken
   internal links waste crawl budget; invented venue names are worse.
8. Did I edit source scripts rather than generated HTML?
9. Did I leave the eight protected design files untouched?
10. Do all gates pass?
11. Is `ENRICH-STATE.json` advanced so the next queued run picks a different
    batch?
12. Did I append to the work log without altering earlier entries, and leave the
    tree uncommitted for Tim?

---

## What "rich" means, and what it does not

**Does mean:** someone choosing between three gyms can decide from your page.
Real prices with dates. Honest limitations. Who it is wrong for. Precise gaps.

**Does not mean:** word count. Never write "nestled in the heart of vibrant
Pattaya", "whether you're a seasoned athlete or just starting out",
"state-of-the-art facilities", "something for everyone". **If a sentence would
survive swapping in a different gym's name, delete it.**
