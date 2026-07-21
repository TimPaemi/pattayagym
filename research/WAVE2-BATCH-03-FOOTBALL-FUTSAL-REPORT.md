# Wave 2 batch 3 research report — football and futsal

> Superseded on 2026-07-20 by `WAVE2-BATCH-03-FOOTBALL-REPORT.md`, which
> resolves PRIMO's relocation/current operator identity and uses the final
> canonical record filenames. Retained as an audit trail only.

Verified: **2026-07-20**

Scope: the complete set of literal `football` rows in the approved wave-2
ledger. Five research-layer records were written. No page, `data.js`, category
configuration, build output, Insider file, swimming record or other repository
was touched.

## Outcome and row-count reconciliation

The programme states **9 football/futsal candidates**, but
`research/DISCOVERED-VENUES-WAVE2.md` contains **6 literal `football` rows** —
three fewer than stated. The exact six are:

| Ledger row | Existing-directory result | Research action |
|---|---|---|
| Palladium FC | New identity | Full low-confidence record |
| K Football Stadium Pattaya | New identity | Full low-confidence record |
| Pattaya Soccer Khao Noi | New identity; two same-coordinate Maps labels already merged in discovery | Full low-confidence record |
| Premier Football Arena | New identity | Full low-confidence record |
| PRIMO Football Academy | New identity; current status remains unclear | Full low-confidence record |
| IP Soccer Club Pattaya | Existing host already represented by `fast-pro-football-academy` | No duplicate record |

Four separate ledger rows are categorised `multi-sport` and happen to be
stadiums. They are not football rows and were not silently folded into this
batch. Counting them would produce **10 football-relevant rows**, not 9. The
row-based answer is therefore unambiguously **6**, with **5 eligible new
identities** after the existing-host check.

## Records written, confidence and source counts

All five source records use research-only `category: "football"`,
`categoryLabel: "Football & Futsal"` and `categoryStatus: "proposed"`. No
production category key was added.

| Record | Area | Status | Confidence | Source URLs | Independent publisher/evidence families |
|---|---|---|---|---:|---:|
| `palladium-fc.json` | Central/South Pattaya | open | low | 6 | 5 |
| `k-football-stadium-pattaya.json` | East/Central Pattaya | open | low | 9 | 8 |
| `pattaya-soccer-khao-noi.json` | East Pattaya | open | low | 6 | 6 |
| `premier-football-arena.json` | East/South Pattaya | open | low | 8 | 7 |
| `primo-football-academy.json` | Huai Yai | unclear | low | 4 | 4 |

Publisher counts are conservative. Palladium's official Facebook page and its
syndicated operator-post mirror count as one evidence family. K's two
company-registry mirrors count as one DBD-derived family. Premier's two Walking
Football Association pages count as one publisher.

Every record reaches the four-publisher minimum. Confidence is still **low on
all five** because the mission makes the three football-specific ★ fields a
harder gate than source count.

## The three decisive ★ fields

| Venue | ★ floodlit | ★ booking.hourlyRate | ★ pickupGames | Confidence consequence |
|---|---|---|---|---|
| Palladium FC | **Established:** operator documented an LED upgrade for night play in January 2026 | **Not established:** no numeric web tariff | **Established:** manager says daily 17:00; recent player says Saturday 16:00 attracts many foreigners; call manager | Low — hourly rate missing |
| K Football Stadium | **Established:** roofed pitch lighting is directly reviewed, including a criticism of its quality | **Established:** ฿1,200–1,800/hour, varying by pitch/time/weekend/holiday, as of 2025-04-07 ([source](https://www.pattayaunlimited.com/football-in-pattaya/)) | **Not established:** a recent review says several teams can be joined, but no schedule, cost or placement process is published | Low — actionable pickup block missing |
| Pattaya Soccer Khao Noi | **Not established:** 24-hour operator claim and night use are not a sufficient lighting specification | **Not established:** no numeric web tariff | **Not established currently:** a 2023 German-expat post documented Friday 10:30 over-50 football, but a September 2024 currency question went unanswered | Low — all three current blocks are incomplete |
| Premier Football Arena | **Not established:** outdoor/no-roof is confirmed, lighting specification is not | **Not established:** no numeric web tariff | **Established:** Sunday 17:00 walking football, all levels, with current English phone/email join route | Low — floodlighting and hourly rate missing |
| PRIMO Football Academy | **Not established** | **Not established:** an old review is not treated as a current tariff | **Not established:** no current stranger-game evidence | Low — all three missing and status unclear |

No record is medium or high under the supplied rule. This is deliberate; making
the other facility fields look complete would not compensate for a missing
rate or an unusable stranger-game pathway.

## Pricing publication rate

Only **1 of 5 records (20%)** has a current-enough numeric hourly range online.
That single range is K Stadium's third-party **฿1,200–1,800 per hour**, published
7 April 2025 at the source linked above. None of the five has a clearly dated
2026 operator-owned tariff.

| Venue | Numeric current web rate? | Evidence outcome |
|---|---|---|
| Palladium FC | No | “Good price”/price-band language only; no number |
| K Football Stadium | Yes | ฿1,200–1,800/hour, third-party, as of 2025-04-07 ([source](https://www.pattayaunlimited.com/football-in-pattaya/)) |
| Pattaya Soccer Khao Noi | No | Operator and Maps publish contact routes but no number |
| Premier Football Arena | No | Venue and walking-football sources publish contacts but no hire price or session cost |
| PRIMO Football Academy | No | A stale review price was intentionally excluded from the current publication rate |

This is **more opaque than badminton**, where 4/8 records had some numeric
current court-rate evidence, and radically less transparent than padel's 4/4.
The pricing-transparency hypothesis holds; the price-level hypothesis does not.
The only current football range is not near badminton's ฿150–200 — it is
**6–12 times higher** and overlaps/exceeds padel's ฿600–1,200 range. One venue
is not enough to generalise a category price, so the honest conclusion is:
football resembles badminton in opacity, not in the sole published price point.

## Pickup-game findings

### Actionable now

- **Palladium FC:** this is the strongest ordinary-football result. A recent
  foreign player documented a Saturday 16:00 group with many foreign players.
  In separate current review replies, the manager told newcomers that games run
  daily at 17:00, supplied +66 83 923 1595, and pointed one player to Jomtien
  United. [Google Maps location/reviews](https://www.google.com/maps/search/?api=1&query=Palladium%20FC%20Pattaya).
- **Premier Football Arena:** the Walking Football Association publishes
  **Sunday 17:00**, “all skill levels”, and a current phone/email join route.
  The English-language programme and its international tournament history make
  foreigner access explicit. [Current where-we-play page](https://thailand-jomtien-wf.com/walk/whereweplay.html).

Neither publishes a session cost.

### Partial or stale

- **K Stadium:** a review from seven months before verification says players
  can join several teams, and international players are repeatedly documented.
  It does not state when, what it costs or how a stranger is placed. The block
  is therefore not actionable enough to pass.
- **Pattaya Soccer Khao Noi:** a German expat community documented Friday 10:30
  over-50 play in December 2023 and said interested players could turn up.
  Later users asked if it was still current, without a confirming reply. It is
  preserved as historical evidence, not published as a 2026 schedule.
  [Community thread](https://www.pattayaforum.net/forums/threads/fussball-spielen-in-pattaya.102069/).
- **PRIMO:** no pickup or stranger-team evidence survived.

The category's most valuable finding is also its clearest content gap: only two
of five venues yield a game a new arrival can act on, and **0/5 publishes a
pickup-session cost**.

## English-confidence outcomes

| Venue | Outcome | Method and evidence |
|---|---|---|
| Palladium FC | **confirmed** | Current manager replies in English give foreign visitors a daily time and phone number; the operator also publishes bilingual posts. |
| Premier Football Arena | **confirmed** | A current English association runs the weekly all-level session at this exact venue with phone/email contact; recent English reviews and an international event corroborate use. |
| K Football Stadium | **likely** | English operator intro, current international reviews and an English-language academy at the venue; no full English booking exchange found. |
| Pattaya Soccer Khao Noi | **likely** | Actual foreign-player reviews and expat-game history, but the operator page is Thai-first and no current English booking exchange was captured. |
| PRIMO Football Academy | **unknown** | Two older English reviews are insufficient; the former official domain no longer resolves and no current English contact path surfaced. |

Methods that produced nothing are part of the finding:

- Thai/English web and Facebook searches found no current K Stadium stranger
  schedule or Line-group invitation.
- The Khao Noi expat thread produced a specific historical schedule but no
  current confirmation.
- Premier's former operator Facebook page is no longer publicly available
  directly; the independent Walking Football Association resolved the join
  question instead.
- PRIMO's former domain failed DNS, the current Maps listing has no hours, and
  no current operator social page surfaced.

## Category proposal

**Proposed label:** Football & Futsal

**Definition:** publicly accessible commercial football/futsal pitches and
venue-based social-play grounds in the Pattaya area. Include academy, school,
hotel or municipal grounds only when outside users can demonstrably hire the
pitch or join a documented game. Exclude coaching services without an
independent venue, private student/guest-only fields, football shops and team
pages that do not provide venue access.

Three representative examples:

1. **Palladium FC** — local outdoor artificial 7-a-side hire plus an actionable
   foreign-player route.
2. **K Football Stadium Pattaya** — roofed commercial pitches with a published
   hourly range.
3. **Pattaya Soccer Khao Noi** — six-pitch Thai local-market complex with active
   tournaments.

Verified ledger count: **6 football rows**, including one already-covered host.
New records written: **5**. Medium-or-better new records: **0**. The proposal
therefore **does not clear the requested threshold of six at medium confidence
or better**. A production category should not be added from this batch yet.
The strongest next evidence would be direct operator confirmation of hourly
rates, lighting and current pickup schedules — not more directory mentions.

## Identity traps, status findings and non-venues

- **IP Soccer Club Pattaya is not a sixth new record.** Its address/host role is
  already represented in `fast-pro-football-academy`, which explicitly names IP
  Soccer Club as a training location.
- **Pattaya Soccer Khao Noi had two Maps names at one coordinate.** Discovery
  correctly merged them; the current official Facebook page, phone and exact
  12.9261184, 100.9045643 coordinate resolve one venue.
- **K Stadium is not Planet Football.** One third-party summary conflates them
  and claims three pitches. The K-specific address, phone and current operator
  page support two K pitches; the conflated three-pitch claim was rejected.
- **The Walking Football Association is a programme, not a second venue.** It is
  evidence for games at Premier Football Arena, not an additional record.
- **Palladium's alternate phone does not create another identity.** Current
  Maps/operator evidence agrees on +66 83 923 1595; an operator-post mirror also
  carries +66 92 738 1409, retained only as unverified/possibly historical.
- **“Huay Yai Soccer” was not merged into PRIMO.** No matching phone or exact
  coordinate proof was found, so a name-level guess would violate the identity
  rule.

The five exact phones and addresses were normalised and checked across all 157
production rows; none matched. Exact candidate coordinates were captured from
Maps and used for same-site/host checks. The production dataset itself stores
no lat/lng for its 157 rows, so a claimed 157-way numerical nearest-neighbour
join would be false precision; address, phone, host and visible same-site Maps
identity carried the catalogue comparison.

No football candidate is confirmed closed or pre-opening. **PRIMO remains
`unclear`**, not “open by assumption”: its current Maps entry is not marked
closed, but it publishes no hours, its newest visible reviews are about a year
old, and its former official domain fails DNS.

### Padel opening diary carried forward

- **Vamos Padel Club Pattaya:** revisit after **1 September 2026**.
- **Padium Padel Club Pattaya:** revisit after **18 September 2026**.

## Every unverified field, grouped by record

### Palladium FC

1. Single authoritative weekly opening-hours schedule.
2. Whether +66 92 738 1409 remains an active alternate phone.
3. Pitch count.
4. Netting.
5. Pitch dimensions.
6. Hourly, peak and off-peak hire rates.
7. Booking lead time, minimum booking and deposit policy.
8. Pickup-game cost and skill level.
9. Boot rule, showers, changing rooms, parking and spectator area.
10. Formal league name and whether new teams can enter.

### K Football Stadium Pattaya

1. Whether the former `kfspattaya.com` domain will return to service.
2. Current operator-owned hourly tariff and the exact time/weekend/holiday bands
   within the third-party ฿1,200–1,800 range (as of 2025-04-07;
   [source](https://www.pattayaunlimited.com/football-in-pattaya/)).
3. Netting and exact dimensions of both pitches.
4. Booking lead time, minimum booking and deposit policy.
5. Current organised pickup schedule, cost, skill level and stranger-placement
   process.
6. Boot rule, showers and changing rooms.
7. Current parking capacity.
8. Whether the venue hosts a public league open to new teams.
9. Confirmed English booking service.

### Pattaya Soccer Khao Noi

1. One authoritative current weekly-hours schedule.
2. Which of the two published phones is preferred for booking.
3. Floodlighting, netting, and exact sizes/dimensions of all six pitches.
4. Hourly, peak and off-peak rates.
5. Booking lead time, minimum booking and deposit policy.
6. Whether the documented 2023 over-50 pickup game still runs.
7. Current pickup schedule, cost and join channel.
8. Boot rule, showers and changing rooms.
9. Whether new teams can enter current tournaments.
10. Confirmed English booking service.

### Premier Football Arena

1. Official Thai name.
2. Preferred venue phone.
3. Pitch count, surface, sizes, floodlighting, netting and dimensions.
4. Hourly, peak and off-peak rates.
5. Booking lead time, minimum booking and deposit policy.
6. Walking-football session cost.
7. Boot rule, changing rooms, parking and spectator area.
8. Whether new teams can enter current competitions.

### PRIMO Football Academy

1. Current operating status and current stranger access.
2. Current hours, official website and official social page.
3. Pitch count, current surface condition, sizes, floodlighting, netting and
   dimensions.
4. Hourly, peak and off-peak rates.
5. Booking lead time, minimum booking and deposit policy.
6. Every pickup-game field.
7. Boot rule, showers, changing rooms, parking and spectator area.
8. Current refreshment service.
9. Current league or tournament programme.
10. English service.

## Stop point

The football/futsal category pass is complete at the evidence standard
specified: six ledger rows reconciled, one existing host rejected, five
research records written, and all five honestly held at low confidence. The
batch stops here. **Swimming instruction research was not started.**
