# Pattaya Gym Wave 2 final research report

Verified: **2026-07-20**

Wave 2 is complete at the source-record layer. No `data.js`, production page,
category configuration, build, Pattaya Insider file or other repository was
changed.

## Final source-layer state

| Measure | Result |
|---|---:|
| Research records | 58 |
| High confidence | 4 |
| Medium confidence | 14 |
| Low confidence | 40 |
| Open | 55 |
| Closed | 1 |
| Unclear / pre-opening | 2 |

The final batch added 37 records to the previous 21: 16 across swimming,
Muay Thai, taekwondo and yoga, plus 21 fitness records. Every JSON file parses.

## Verified final count table

The mission's remaining figures were mention-counts. The actual ledger result
is:

| Remaining category | Stated | Actual rows | Already covered | Uncovered | Records written | Non-venue / no row |
|---|---:|---:|---:|---:|---:|---:|
| Swimming | 9 | 8 | 1 | 7 | 5 | 2 non-venues |
| Muay Thai | 5 | 4 | 0 | 4 | 4 | 0 |
| Taekwondo | 5 | 5 | 0 | 5 | 5 | 0 |
| Yoga | 4 | 3 | 1 | 2 | 2 | 0 |
| Fitness | 24 | 22 | 1 | 21 | 21 | 0 |
| Tennis | 1 | 0 | 0 | 0 | 0 | 1 incidental mention |
| **Total** | **48** | **42** | **3** | **39** | **37** | **3** |

The taekwondo correction is important: the five candidates are stored under
`martial-arts`, so a literal `taekwondo` count of zero was wrong. All five were
researched.

## Final category viability

The gate is six usable open records at medium confidence or better. “Records”
below means the source-layer count; “usable open” excludes closed and
pre-opening/unclear identities.

| Category grouping | Records | Usable open | Medium+ usable | Clears six? | Outcome |
|---|---:|---:|---:|---:|---|
| Racquet (badminton + padel) | 10 | 10 | 9 | **Yes** | Only clear success; keep inside existing enum |
| Climbing | 3 | 1 | 1 | No | One verified open wall after closure/pre-opening checks |
| Muay Thai | 7 | 7 | 4 | No | Useful records, insufficient depth across six |
| Football / futsal | 5 | 5 | 0 | No | Raw venues exist; all fail deciding-field gate |
| Swimming | 4 | 4 | 0 | No | Two schools plus two pools; parent fields opaque |
| Watersports correction | 1 | 1 | 1 | No | Genuine venue, not a category case |
| Taekwondo | 5 | 5 | 0 | No | Competition activity strong; family decision fields absent |
| Yoga | 2 | 2 | 1 | No | Fold into existing yoga category |
| Fitness | 21 | 20 | 1 | No | Large raw seam, almost no complete membership terms |
| Tennis-only discoveries | 0 | 0 | 0 | No | No new row |

## Proposal set

**Racquet is the only grouping that clears.** It already exists, so the
proposal is to fold the nine medium+ badminton/padel records into the current
`racquet` enum, not add a new production key.

No new category is proposed. Football, fitness and Muay Thai have enough names
to look promising in a shallow count, but not six publication-ready records
under the owner's deciding-field rule.

## Revised directory size

The 58 research files are not 58 new publication-ready venues. Some first-batch
files represent identities already in the 157, one climbing venue is closed,
two are unclear/pre-opening and 40 records are low.

The genuine new medium+ additions are:

- 7 badminton venues.
- 2 padel venues.
- O. Sansuk Muay Thai.
- MAVINN Muay Thai Pattaya.
- Lek Thai Yoga.
- Pattaya Water Sports Club, corrected out of swimming.
- Jetts Central Si Racha.

That is **14 genuine new medium+ venues**. The defensible revised directory
size is therefore **157 + 14 = 171**, subject to the normal editorial import
and production verification step. Low-confidence records are not included in
that number.

## Pricing transparency — the Wave-2 editorial finding

| Category slice | Numeric current-web coverage | What it means |
|---|---:|---|
| Operating padel clubs | 4 / 4 (100%) | Premium imported sport; mostly operator-owned tariffs |
| New badminton venues | 4 / 8 (50%) | Mixed; no clearly date-stamped 2026 operator tariff |
| New football records | 1 / 5 (20%) | Almost entirely phone/DM pricing |
| Child swim schools | 0 / 2 (0%) | Parents cannot compare lesson cost or ratios online |
| Swimming venues | 1 / 4 (25%) | Only the neighbourhood day-pass pool publishes a usable number |
| New Muay Thai camps | 2 / 4 (50%) | Commercial/booking-visible camps publish; local Thai camp does not |
| Taekwondo academies | 0 / 5 (0%) | Children's fees and grading costs are entirely contact-only |
| Yoga studios | 1 / 2 (50%) | Appointment-led Lek publishes; neighbourhood Chama does not |
| Fitness candidates | 7 / 21 (33%) | Even published rates usually omit joining and cancellation terms |

The pattern is real: **premium imported sports and national chains publish
prices; local-market sports usually do not.** Padel is fully transparent.
Badminton is mixed. Football, swimming instruction, taekwondo and local fitness
are opaque. This is stronger than a directory-data footnote and could support
a guide about the true cost of joining sports in Pattaya, including a
“questions to ask before visiting” checklist.

## What Thai-language search actually added

The hypothesis was partly correct. Thai and geography-specific searches found
39 uncovered ledger identities, especially:

- neighbourhood badminton halls;
- child swim schools and the School 11 competition pool;
- Thai youth taekwondo academies;
- Bang Saray and Sattahip local gyms;
- Laem Chabang and Sriracha industrial-area fitness clubs;
- local Muay Thai camps with very little English discovery visibility.

But discovery volume did not translate into publication depth. In the final 37
records, only **four** are medium+: MAVINN, Lek Thai Yoga, Pattaya Water Sports
Club and Jetts Central Si Racha. The other 33 are low because decisive prices,
contracts, ratios, federation status, English provision or current facilities
are absent—not because the venues are imaginary.

## Categories where the seam did not produce a buildable result

- No new tennis row.
- Swimming found real venues but zero medium+ swimming records.
- Taekwondo found five active teams but zero medium+ records.
- Football found grounds but zero medium+ records.
- Fitness found 21 identities but only one medium+ record.
- Yoga found only two new studios, one medium+.
- Climbing resolved to one usable open venue.

## Honest Wave-3 assessment

**Do not run another broad venue-discovery wave now.** Wave 2 proves that the
Thai-language seam contains real businesses, so the 157 was not literally
complete by raw venue name. It also proves that the remaining seam is mostly
contact-only and too thin to build reliable category sections. More search
queries will produce more low-confidence names faster than publication-ready
records.

The directory is best described as **materially expandable by 14 strong
venues, but effectively complete enough that the next priority should move up
the content stack**: guides, the existing category layer and area pages. A site
with roughly 171 defensible venues still has only 48 guides, 15 categories and
6 area pages.

A future Wave 3 should be targeted, not a crawl:

1. Revisit Vamos Padel on/after 1 September 2026 and Padium on/after
   18 September 2026.
2. Contact a short list of high-value fitness operators for joining fees,
   cancellation terms and air-conditioning confirmation.
3. Ask the two swim schools for ratios, parent viewing, English instruction and
   current fees.
4. Verify Pesuso's post-relocation timetable and STC Monkeys' physical site.
5. Recheck Laem Chabang Fitness Center through the municipality.

Those are finite verification jobs. Another generic Thai Maps sweep is not the
highest-value next move.

