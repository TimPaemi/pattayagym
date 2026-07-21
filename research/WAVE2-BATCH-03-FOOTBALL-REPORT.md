# Wave 2 batch 3 research report — football and futsal

Verified: **2026-07-20**

Scope: the complete football candidate category in the approved wave-2 ledger.
Five source-layer records were written. No pages, `data.js`, category
configuration, builds, other categories or other repositories were touched.

## Outcome and row-count reconciliation

The programme says **9 football candidates**, but
`research/DISCOVERED-VENUES-WAVE2.md` contains **6 football rows**. The ledger's
own summary also says `football | 6 | 5 | 5`. Counting actual rows rather than
mentions produces this reconciliation:

| Ledger row | Identity result | Current result | Batch action |
|---|---|---|---|
| Palladium FC | New; no address, phone or coordinate match in the 157 | open | Record written |
| K Football Stadium Pattaya | New; no address, phone or coordinate match in the 157 | open | Record written |
| Pattaya Soccer Khao Noi | New; the second Thai map label is the same coordinate and business | open | One record written |
| Premier Football Arena | New; distinct from the nearby-name Planet Football record | open | Record written |
| PRIMO Football Academy | Same academy identity, but its current operator page gives a different area and phone from the old Huai Yai pin | open at low confidence; current ground details thin | Relocated current record written; old-location facts not transferred |
| IP Soccer Club Pattaya | Exact host already named in `fast-pro-football-academy` | open | No duplicate record |

The real result is therefore **6 ledger identities, 5 eligible new records and
1 exact existing match**. The stated nine exceeds the ledger by three; there
are no three missing rows to manufacture.

## Records written

| Record | Venue type | Confidence | Status | English | Source URLs | Independent publisher families |
|---|---|---:|---:|---:|---:|---:|
| `palladium-fc.json` | commercial pitch hire | low | open | confirmed | 6 | 5 |
| `k-football-stadium-pattaya.json` | commercial pitch hire | low | open | likely | 8 | 8 |
| `pattaya-soccer-khao-noi.json` | club and tournament ground | low | open | unknown | 8 | 8 |
| `premier-football-arena-pattaya.json` | club and academy ground; walking-football host | low | open | confirmed | 9 | 8 |
| `primo-football-academy.json` | club or academy ground | low | open | likely | 5 | 4 |

Confidence totals: **0 high, 0 medium, 5 low**. Every record has at least four
independent publisher families. PRIMO's dead official site and its Facebook
page count as one operator family; they do not inflate its independent count.
The confidence result is driven by the deciding fields, not by source totals.

## Deciding star fields

| Venue | ★ floodlit | ★ hourly rate | ★ pickup games | Confidence consequence |
|---|---|---|---|---|
| Palladium FC | **Established.** The operator documented a January 2026 LED upgrade, and current activity includes evening play. | **Missing.** No numeric pitch tariff was found. | **Established.** A current owner reply says daily at 17:00; a recent foreign player separately documents Saturday at 16:00. Foreigners are explicitly present and the owner gives the manager's phone. | Low because the rate is missing. |
| K Football Stadium | **Established.** The two pitches are covered and lit for its 24-hour operation; reviews discuss the lighting quality rather than an absence of lights. | **Established with caveat.** An independent Pattaya guide updated in April 2025 gives ฿1,200-1,800 per hour by pitch, time and date. The current operator tariff is not published. | **Missing current evidence.** A 2017 expat post reported nightly games, but a recent Maps join request was unanswered. | Low because current pickup play is missing. |
| Pattaya Soccer Khao Noi | **Established.** Current night use and artificial-turf imagery support a lit outdoor ground. | **Missing.** No numeric rate was found. | **Missing current evidence.** December 2023 community evidence documents foreign over-50s play, but a September 2024 request for confirmation received no answer. | Low because rate and current pickup play are missing. |
| Premier Football Arena | **Missing.** Night activity and a 24-hour directory listing suggest lights, but no direct floodlighting specification was found. | **Missing.** No numeric rate was found. | **Established.** The current walking-football page lists Sunday at 17:00, welcomes all skill levels and gives a phone/email joining route; foreigners are explicitly part of the group. | Low because floodlighting and the hourly rate are missing. |
| PRIMO Football Academy | **Missing at the current location.** The former ground's facilities were not transferred. | **Missing.** An old review's former-ground rate is stale and location-specific. | **Missing.** No adult pickup game or stranger joining route was found. | Low; all three deciding fields are missing. |

This is a deliberately severe result. General evidence that a venue is real,
popular or long-running cannot replace a current tariff or a usable route into
a game.

## Football pricing publication rate

Only **1 of 5 new records (20%)** has a numeric pitch-hire range. Restricting
the denominator to the four commercial or broadly hire-oriented grounds still
produces only **1 of 4 (25%)**. The available range is **฿1,200-1,800 per
pitch-hour**, and even that comes from an independent guide rather than a
current operator tariff.

| Venue | Numeric current-web rate? | Finding |
|---|---:|---|
| Palladium FC | No | Phone/Facebook booking path, no public number |
| K Football Stadium | Yes, third party | ฿1,200-1,800/hour; exact bands need operator confirmation |
| Pattaya Soccer Khao Noi | No | Phone/Facebook only |
| Premier Football Arena | No | Phone only |
| PRIMO Football Academy | No | Former-ground historical price rejected as current evidence |

Football is even less price-visible than badminton and far behind padel.
Badminton had numeric current-rate evidence at **4/8 venues (50%)**, although
none had a clearly date-stamped 2026 operator tariff. Padel was **4/4 (100%)**
numeric with a ฿600-1,200 court-hour range. Football is **1/5 (20%)** and is a
more expensive full-pitch product at the one venue that discloses a figure.
Every retained numeric price has an `asOf` date and `priceSourceUrl` in the
record.

Thai and English searches combining each exact venue name with `ราคา`,
`ค่าเช่า`, `ต่อชั่วโมง`, `price`, `hourly`, `booking` and `เช่าสนาม` produced no
usable numeric rate for the other four. Operator Facebook mirrors, directories,
Maps questions and community discussions were also checked. Descriptions such
as “good price” were not converted into numbers.

## Pickup-game findings

### Current, usable stranger routes

- **Palladium FC:** yes. A 2026 owner reply says a game runs every day at
  17:00 and directs prospective players to +66 83 923 1595. A recent English
  review independently describes a Saturday 16:00 game with many foreign
  players. Cost and skill level remain unpublished.
- **Premier Football Arena:** yes, for walking football. The current
  Thailand/Jomtien Walking Football page lists Sunday at 17:00, welcomes all
  skill levels and provides +66 61 560 0949 and
  `team@thailand-jomtien-wf.com`. The session cost is not published. This is a
  genuine visitor pathway, but it should not be described as ordinary
  full-speed pickup football.

### Historical community play, not current enough to promise

- **K Football Stadium:** a 2017 Pattaya Addicts post said games ran every
  night and suggested walking in. The old 2019 league used a private LINE
  group. Neither establishes a current stranger session.
- **Pattaya Soccer Khao Noi:** a German forum documents Friday 10:30 over-50s
  play in December 2023 and younger groups on Monday/Tuesday. A later request
  asking whether it still ran went unanswered. AroundPattaya also lists an
  all-ability women's group, but the page has no dependable current date.

### No route found

- **PRIMO:** the current page presents a children's academy, not an adult
  pickup venue. No Facebook/Line/Telegram group, stranger game, cost or joining
  channel was found.

Thai and English Facebook searches, referenced LINE routes, Telegram mentions,
Google questions, Pattaya expat forums, German/Russian community discussions
and walking-football pages were checked. The negative result at three venues is
reported as missing evidence, not as proof that informal games never occur.

## English-confidence outcomes

| Venue | Outcome | Evidence and method |
|---|---|---|
| Palladium FC | **confirmed** | Current English owner replies give a time and manager phone to people asking to join; foreign participants independently describe the Saturday group. |
| K Football Stadium | **likely** | A historical league provided Thai/English contacts and an English invite route, and foreign players review the venue. The current phone did not produce a captured English response. |
| Pattaya Soccer Khao Noi | **unknown** | German expatriates used the ground historically, but that does not establish current English-speaking venue staff and no current English booking reply was found. |
| Premier Football Arena | **confirmed** | The current walking-football organiser publishes the exact weekly venue in English, welcomes every skill level and gives a Pattaya phone and email. This confirms English for the organised session, not necessarily the private-hire desk. |
| PRIMO Football Academy | **likely** | The current operator page is bilingual and gives an English email, but no first-hand current interaction was found. |

Methods that produced no upgrade included treating an English business name as
language evidence, inferring English from a tourist location, relying only on
foreign reviews, and carrying old contact-language claims to a new phone. None
of those was accepted as `confirmed`.

## Category proposal

**Verified ledger count:** 6 identities: Palladium FC, K Football Stadium,
Pattaya Soccer Khao Noi, Premier Football Arena, PRIMO Football Academy and the
existing IP Soccer Club host record.

**Three representative examples:** Palladium FC for joinable evening play; K
Football Stadium for covered commercial pitch hire; Pattaya Soccer Khao Noi for
an outdoor multi-pitch community and tournament ground.

**Proposed definition:**

> `football` covers Pattaya-area football and futsal grounds, commercial pitch
> operators and academy/club grounds where non-exclusive users can book a
> pitch, join organised play, enter a programme or attend a league. It includes
> artificial, natural and hard-court futsal surfaces and 5-, 7- and 11-a-side
> configurations. It excludes school, university, hotel and condominium fields
> unless public access is independently verified, and excludes academies with
> no verifiable Pattaya-area ground identity.

**Gate result:** it does **not** clear six at `medium` confidence or better.
The ledger reaches six identities, but all five newly researched records are
low under the required star-field rule. Premier and Palladium each establish a
current stranger-access route, but both still lack a numeric hourly rate. The
exact existing IP Soccer Club/FAST PRO host match cannot turn that into six
medium records. `football` is a useful
research taxonomy and remains the strongest structural gap in the present 15
categories, but this batch does not justify changing production configuration.

## Identity traps, status findings and exclusions

- **IP Soccer Club Pattaya:** exact existing host of
  `fast-pro-football-academy`; the existing record already names IP Soccer Club.
  No duplicate was written.
- **Pattaya Soccer Khao Noi:** the second Thai listing is the same coordinate,
  phone and ground. It was merged into one record.
- **PRIMO relocation:** the old Google/Mapcarta ground is at Huai Yai/Ban
  Amphur, uses +66 63 170 6267 and carries a 4.8/5 score across four old
  reviews. The current operator page instead says Tungklom-Tan Man and gives
  +66 64 090 3801. Its old URL redirects to the current page, establishing one
  academy rather than two. The former natural-grass pitch, old rating and an
  old ฿500 claim were not copied to the relocated record.
- **PRIMO status limitation:** the current page is accessible and shows an
  operating academy identity with visible activity dated 16 October 2025, but
  its website now fails DNS and its precise current ground is unpublished. It
  is `open` at low confidence, not publication-ready as a walk-in pitch.
- **Premier versus Planet Football:** the phones and addresses differ. Current
  Google plus codes place Premier (`WV9H+J7F`) and Planet (`WWJV+CC`) about
  7.2 km apart. The stored manual coordinate for Planet is misleadingly near
  Premier; current map identity resolves the false proximity. The production
  geo file was not edited because this mission is records only.
- **Nearest-coordinate checks:** Palladium's closest stored venue is a
  different business about 0.554 km away; K Stadium's is a different business
  about 0.427 km away; Khao Noi's is a different business about 0.578 km away.
  Premier is distinct after the current Planet-map correction above. PRIMO has
  no safe current coordinate to compare.
- **Closed football candidates:** none.
- **Pre-opening football candidates:** none.
- **Non-venues:** none among the six actual football rows.

The five new phone numbers and exact address strings do not occur in the
existing 157. Name similarity was not used as an identity test.

## Padel pre-opening diary

- **Vamos Padel Club Pattaya:** revisit on or after **1 September 2026**.
- **Padium Padel Club Pattaya:** revisit on or after **18 September 2026**.

These dates are carried forward from the approved padel gate; neither future
venue was edited in this batch.

## Unverified fields by record

### Palladium FC — 19

1. Single authoritative weekly opening-hours schedule.
2. Whether +66 92 738 1409 remains an active alternate phone.
3. `football.pitches.count`.
4. `football.pitches.netted`.
5. `football.pitches.pitchDimensions`.
6. `football.booking.hourlyRate`.
7. `football.booking.peakRate`.
8. `football.booking.offPeakRate`.
9. `football.booking.leadTime`.
10. `football.booking.minimumBooking`.
11. `football.booking.depositRequired`.
12. `football.pickupGames.cost`.
13. `football.pickupGames.skillLevel`.
14. `football.rules.bootType`.
15. `football.rules.showers`.
16. `football.rules.changingRooms`.
17. `football.rules.parking`.
18. `football.rules.spectatorArea`.
19. Formal league name and whether new teams can enter.

### K Football Stadium Pattaya — 17

1. Current operator-confirmed hourly tariff.
2. Exact peak and off-peak bands.
3. Booking lead time.
4. Minimum booking.
5. Deposit requirement.
6. Authoritative current pitch formats and markings.
7. Metric pitch dimensions.
8. Whether pitches are fully netted.
9. Boot or stud restrictions.
10. Showers.
11. Changing rooms.
12. Current organised pickup games.
13. Pickup cost and joining channel.
14. Current league schedule.
15. Whether leagues accept new teams.
16. Peak-event parking capacity.
17. Direct English booking service.

### Pattaya Soccer Khao Noi — 19

1. Exact pitch count.
2. All available pitch formats.
3. Metric pitch dimensions.
4. Whether pitches are fully netted.
5. Current numeric hourly rate.
6. Peak and off-peak rates.
7. Whether public hourly hire is available.
8. Booking lead time.
9. Minimum booking.
10. Deposit requirement.
11. Current organised pickup games.
12. Pickup cost and joining method.
13. Foreigners-welcome policy.
14. Boot or stud restrictions.
15. Showers.
16. Changing rooms.
17. Parking availability.
18. Whether current leagues accept new teams.
19. Current English-speaking venue staff.

### Premier Football Arena — 22

1. Pitch count.
2. Pitch surface.
3. Available pitch formats.
4. Metric pitch dimensions.
5. Floodlighting specification.
6. Whether pitches are netted.
7. Current numeric hourly rate.
8. Peak and off-peak rates.
9. Whether general public hourly hire is available.
10. Booking lead time.
11. Minimum booking.
12. Deposit requirement.
13. Walking-football session cost.
14. Boot or stud restrictions.
15. Showers.
16. Changing rooms.
17. Parking availability.
18. Spectator area.
19. Refreshments.
20. Whether current leagues accept new teams.
21. English-speaking staff for private pitch hire.
22. Relationship between the arena and Pattaya Inter Academy shown in reviews.

### PRIMO Football Academy — 33

1. Exact current street address.
2. Current latitude.
3. Current longitude.
4. Current operating hours beyond the Facebook `Always open` label.
5. Current physical-pitch identity.
6. `football.pitches.count`.
7. `football.pitches.surface`.
8. `football.pitches.sizes`.
9. `football.pitches.indoor`.
10. `football.pitches.floodlit`.
11. `football.pitches.netted`.
12. `football.pitches.pitchDimensions`.
13. Current numeric `football.booking.hourlyRate`.
14. `football.booking.peakRate`.
15. `football.booking.offPeakRate`.
16. `football.booking.leadTime`.
17. `football.booking.minimumBooking`.
18. `football.booking.depositRequired`.
19. `football.pickupGames.organised`.
20. `football.pickupGames.schedule`.
21. `football.pickupGames.cost`.
22. `football.pickupGames.howToJoin`.
23. `football.pickupGames.foreignersWelcome`.
24. `football.rules.bootType`.
25. `football.rules.showers`.
26. `football.rules.changingRooms`.
27. `football.rules.parking`.
28. `football.rules.spectatorArea`.
29. `football.rules.refreshments`.
30. `football.leagues.hosted` at the current location.
31. `football.leagues.openToNewTeams`.
32. Current location-specific rating and review themes.
33. Confirmed current staff English provision.

## Stop point

Football/futsal research stops here. The evidence supports five useful low-
confidence source records, one existing duplicate, two genuinely current
stranger-game routes and a pricing-opacity finding. No production taxonomy
change or page work was performed. Swimming remains untouched for the next
instruction.
