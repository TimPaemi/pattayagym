# Batch 1 research report — Muay Thai and climbing

Verified: 2026-07-20

Scope: six source-layer records only. No page, build, summary-data or Pattaya Insider edits were made.

## Backlog reconciliation

The mission text describes three Muay Thai and three climbing discoveries, but the current `DISCOVERED-VENUES.md` contains only two names in each category:

- Muay Thai: FIGHT EVO360 and Sitpholek Muay Thai.
- Climbing: Deep Climbing Gym and Bean Cow Climbing Gym.

All four are already present in `data.js` and already have venue source/page files. The backlog is therefore stale relative to the repository. This batch still creates source-layer JSON for those four identities because the requested research layer did not exist.

To complete six records without inventing backlog entries:

- O. Sansuk Muay Thai Gym Pattaya was added as the third Muay Thai discovery. It is a real, active Pattaya camp not found in the current site data.
- Chill out Climbing Gym was added as the only defensible third dedicated regional climbing candidate found. It is in Si Racha, outside the current six-area Pattaya taxonomy, and is pre-opening. It is deliberately `low` confidence and `unclear`, not publication-ready.

STICKY Climbing Gym is not a seventh venue: its address and Facebook identity show it is the current name of Bean Cow Climbing Gym.

## Records written

| Record | Category | Confidence | Status | Publication read |
|---|---|---:|---:|---|
| `o-sansuk-muay-thai-gym.json` | Muay Thai | medium | open | Usable after direct price/trainer confirmation |
| `fight-evo360.json` | Muay Thai | medium | open | Strong schedule/facility record; resolve price-channel and trainer gaps |
| `sitpholek-muay-thai.json` | Muay Thai | medium | open | Hold for current prices, timetable and coaching roster |
| `deep-climbing-gym.json` | Climbing | medium | closed | Do not publish as an open venue |
| `bean-cow-climbing-gym.json` | Climbing | medium | open | Rebrand confirmed; verify current phone and post-rebrand prices |
| `chill-out-climbing-gym.json` | Climbing | low | unclear | Hold until it opens and earns independent coverage/reviews |

## Sources and independence

Counts below distinguish URLs recorded from genuinely independent source families. Multiple pages from one venue and multiple Reddit threads do not inflate the independent-family count.

| Venue | Source URLs | Independent source families | Independent sources used |
|---|---:|---:|---|
| O. Sansuk | 7 | 7 | Official Facebook; Google Maps; MuayThaiMap; Wanderlog; Tapology; Muay Thai Records; Reddit trainee discussion |
| FIGHT EVO360 | 8 | 5 | Official Gymdesk; Google Maps; NOW Muay Thai; Reddit trainee discussions; Pattaya Trader |
| Sitpholek | 7 | 6 | Official Facebook; Google Maps; Muay Thai Camps in Thailand; Fight Passport; Thailand Nomads; Reddit. Top-Rated.Online is recorded but treated as a Google-derived aggregator, not an extra independent family. |
| Deep | 6 | 5 | Harborland; Google Maps; Tripadvisor; Pattaya Mail; GoToPattaya. Wanderlog is recorded for its review timeline but partly mirrors Google material. |
| STICKY / Bean Cow | 8 | 7 | Official Bean Cow/STICKY channels; Google Maps; GoToPattaya; Tripadvisor; Traveloka; Climbing-Gyms.com; Reddit visitor discussion |
| Chill out | 3 | 2 | Official website/Instagram; Google Maps pre-opening listing |

Chill out fails the four-independent-source gate. That is a research result, not a waiver: the record stays `low` confidence and should be held.

## Unverified fields, grouped by field

### Pricing

- `pricing.dropIn`: missing current figure for Sitpholek. Deep's old prices were deliberately excluded because the venue is closed.
- `pricing.weekly`: O. Sansuk and Sitpholek.
- `pricing.monthly`: Sitpholek.
- `pricing.packages`: O. Sansuk and Sitpholek.
- `pricing.privateTraining`: O. Sansuk, Sitpholek and Chill out.
- Price currency/currentness: O. Sansuk prices come from MuayThaiMap rather than a current gym-owned price page. FIGHT EVO360 has a product difference between NOW Muay Thai and the official Gymdesk monthly membership. STICKY's detailed price menu remains on the legacy Bean Cow site and needs confirmation after rebranding. Chill out's figures are pre-opening and provisional.

### Accommodation and travel logistics

- `accommodation`: no current on-site product was confirmed for O. Sansuk, FIGHT EVO360, Sitpholek, STICKY/Bean Cow or Chill out. It is irrelevant to the closed Deep listing but no accommodation relationship was found there either.
- Visa help: unverified for all three Muay Thai venues.

### People and fight pedigree

- `people.headTrainer`: entirely unverified for FIGHT EVO360, STICKY/Bean Cow and Chill out; only partially verified for Sitpholek because current day-to-day responsibility is unclear.
- `people.credentials`: FIGHT EVO360 has no named current roster. Kru OT's career history at O. Sansuk is sourced to social-profile material but not independently corroborated. Sitpholek's ownership/promoter material is historical.
- `people.notableAlumni`: not found for FIGHT EVO360. O. Sansuk's active fighters are supported by fight-record sources; Sitpholek's named fighters are historical.
- `people.staffCount`: unavailable for all operational gyms.
- Sitpholek's claim of nine world champions was not independently substantiated and is not presented as fact.

### Classes and fight-track detail

- Exact session timetable: unavailable for Sitpholek, STICKY/Bean Cow and Chill out.
- `classes.languages`: unavailable for Sitpholek and Chill out.
- Westerners joining regular sparring: unverified for O. Sansuk, FIGHT EVO360 and Sitpholek.
- FIGHT EVO360's live schedule displays Sunday open-gym blocks, but drop-in eligibility was not confirmed. A July 13-19 week displayed closed markers without a published explanation.

### Facilities

- Exact ring/equipment counts: O. Sansuk, FIGHT EVO360 and Sitpholek.
- Current wall height and route counts: STICKY/Bean Cow.
- Wall dimensions, route count, rental inventory and whether rope/top-rope/lead climbing will exist: Chill out.
- Deep's facilities are historical only; disposition of the equipment is unknown.

### Identity, contact and location

- O. Sansuk: whether the older phone `+66 62 762 5033` remains active.
- STICKY/Bean Cow: current phone, exact rebrand date and whether legal ownership changed.
- Chill out: phone, coordinates, hours and actual opening date.
- Chill out's `si-racha` area is outside the site's current six-area taxonomy and needs an editorial scope decision before any future build.

### Reviews and status

- Chill out has no review score, count or review themes because it has not opened; review posting is disabled on its current Google listing.
- Deep: exact closure date, closure reason, equipment disposition and reopening/replacement plans are unverified.
- STICKY/Bean Cow: current reviews support the rebranded venue, but post-rebrand rate confirmation is still missing.

## Closed or unclear venues

### Deep Climbing Gym — closed

Google Maps currently labels the exact Harbor Pattaya location **permanently closed**. The listing has 4.2/5 from 73 reviews and the matching eighth-floor address. Wanderlog exposes a May 2025 Google review describing a visit then, which narrows the likely closure to after that review but does not establish a date. Tripadvisor and GoToPattaya still show stale open-era information; those conflicts are why confidence is `medium`, not `high`. The current Google business status is the controlling operational evidence.

The existing Pattaya Gym page/data still describes Deep as open. This batch flags that problem but does not fix it, per mission scope.

### Chill out Climbing Gym — unclear / pre-opening

The official site says opening in autumn 2026. Google Maps says “opens 1 October” and has no reviews. There is no evidence that the doors have opened, and only two independent source families were found. Hold the record until an opening-day verification, live hours, reviews and current price confirmation exist.

## Duplicate, misfiled and non-sport findings

- FIGHT EVO360, Sitpholek, Deep and Bean Cow are backlog duplicates of venue identities already present in `data.js`; the missing item was the new `research/venues` source layer.
- STICKY is Bean Cow's current brand, not a separate third climbing venue.
- “Pattaya Extreme” surfaced as an old Mike Shopping Mall search trace but could not be corroborated as a current dedicated climbing gym, so no record was created.
- Hotel/resort climbing walls were excluded: they are amenities within another venue type, not dedicated climbing gyms for this category.
- O. Sansuk is a genuine new Muay Thai identity relative to the current Pattaya Gym data.
- Chill out is a genuine dedicated climbing project, but it is regional (Si Racha) and pre-opening.

## Depth gate

The six records do not all support the site's existing long-form depth:

- **Muay Thai:** FIGHT EVO360 has strong current price, schedule and facility material. O. Sansuk has enough for a useful smaller-camp profile but still needs direct price and trainer-pedigree confirmation. Sitpholek lacks current prices, a session timetable, current coaching roster, accommodation information and independently supported championship pedigree. Sitpholek should not be expanded to a deep page from this record alone.
- **Climbing:** only STICKY/Bean Cow is a verified open Pattaya climbing gym, and even it has a rebrand-versus-legacy-price conflict. Deep is closed. Chill out is outside Pattaya proper, pre-opening, reviewless and below the four-source minimum. These three cannot support three current open-venue pages or a claim that Pattaya has multiple verified open dedicated walls.

## Cross-domain duplicate-brand confirmation — flag only

All five requested venue identities are present in both properties' content/research inventories. No Pattaya Insider file was edited.

| Venue identity | Pattaya Gym slug | Pattaya Insider service slug |
|---|---|---|
| Battle & Conquer Gym | `battle-conquer-gym` | `battle-and-conquer-gym` |
| Fitness 7 Pattaya | `fitness-7` | `fitness7-pattaya` |
| Khao Kheow Country Club | `khao-kheow-country-club` | `khao-kheow-country-club` |
| SF Strike Bowl | `sf-strike-bowl` | `sf-strike-bowl` |
| Siam Country Club | `siam-country-club` | `siam-country-club` |

The first two are the same venue identities under different slugs. Pattaya Insider currently has service-content files for all five and state entries under the service slugs. This confirms the cross-domain brand-query overlap described in the mission; remediation belongs in Pattaya Insider and was not attempted here.
