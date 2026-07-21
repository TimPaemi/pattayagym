# Backlog validation — 2026-07-20

## Decision rule

This is a cheap validation pass over every actual `✨` data row in
`DISCOVERED-VENUES.md`. Table-header rows are not venues. Results use the required
controlled vocabulary:

- `RESEARCH`: current, in-scope, and not already represented in `data.js`.
- `ALREADY-COVERED`: the same venue already has a `data.js` record.
- `CLOSED`: the venue is closed now, including a clearly documented temporary closure.
- `PRE-OPENING`: announced but not trading yet.
- `NOT-A-VENUE`: not a visitable Pattaya sports venue, out of area, or no verifiable
  venue identity after exact-name checks.
- `DUPLICATE-OF-<slug>`: another backlog row or an existing record is the primary
  identity.

Precedence is: current closure / not-a-venue, then duplicate, then already covered.
An entry is not labelled `ALREADY-COVERED` merely because the repository contains an
unsupported stub. “Open” below means that a current operator page, current listing,
recent activity, or the repository's April 2026 verification and a still-live identity
support trading status. It is not a guarantee of today's opening hours.

## Corrected counts

The source document contains **66 actual `✨` venue rows**. Its `~72 remaining` estimate
and its per-section labels are stale: fitness contains 11 rows (not 10), watersports 9
(not 8), and kids/youth 6 (not 5). There are no uncovered, currently operating venues
left in this backlog.

| Category | Actual `✨` rows | ALREADY-COVERED | CLOSED | NOT-A-VENUE | DUPLICATE | RESEARCH | Active unique identities represented |
|---|---:|---:|---:|---:|---:|---:|---:|
| Muay Thai | 2 | 2 | 0 | 0 | 0 | 0 | 2 |
| Fitness / commercial gyms | 11 | 10 | 0 | 1 | 0 | 0 | 10 |
| Yoga / Pilates | 4 | 4 | 0 | 0 | 0 | 0 | 4 |
| Golf | 13 | 12 | 1 | 0 | 0 | 0 | 12 |
| Racquet sports | 12 | 9 | 0 | 0 | 3 | 0 | 9 |
| Swimming | 5 | 2 | 0 | 3 | 0 | 0 | 2 |
| Watersports / diving | 9 | 6 | 0 | 2 | 1 | 0 | 6 |
| Climbing | 2 | 0 | 1 | 0 | 1 | 0 | 1 |
| Running / cycling clubs | 1 | 1 | 0 | 0 | 0 | 0 | 1 |
| Kids / youth sports | 6 | 4 | 0 | 1 | 1 | 0 | 4 |
| Equestrian / adventure | 1 | 1 | 0 | 0 | 0 | 0 | 1 |
| **Total** | **66** | **51** | **2** | **7** | **6** | **0** | **51** |

“Active unique identities represented” removes the six duplicate rows and excludes
closed / invalid rows. Chatrium Soi Dao is not counted active on the validation date.

## Row-by-row validation

### Muay Thai

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 1 | FIGHT EVO360 | ALREADY-COVERED | `fight-evo360` | Open identity; Batch 1 revalidated official, social and current review evidence. [E01] |
| 2 | Sitpholek Muay Thai Gym | ALREADY-COVERED | `sitpholek-muay-thai` | Open identity; Batch 1 resolved the current Institute of Muay Thai Techniques identity. [E02] |

### Fitness / commercial gyms

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 3 | Coco Fitness | ALREADY-COVERED | `coco-fitness` | Existing exact venue; current Maps/social identity. [E03] |
| 4 | Universe Gym | ALREADY-COVERED | `universe-gym` | Existing exact venue; current Maps identity in Welcome Town. [E04] |
| 5 | Fitz Club (Royal Cliff Hotels) | ALREADY-COVERED | `fitz-club` | Active Royal Cliff sports club; gym and racquets are one venue. [E05] |
| 6 | Elite Gym & Fitness Pattaya | ALREADY-COVERED | `elite-gym-fitness` | Active official site and exact existing record. [E06] |
| 7 | Jetts Fitness | ALREADY-COVERED | `jetts-fitness-pattaya` | Little Walk is the represented Pattaya branch; Royal Garden is not treated as a second live branch. [E07] |
| 8 | Fitness 7 | ALREADY-COVERED | `fitness-7` | Active The Avenue venue and exact existing record. [E08] |
| 9 | True Fitness | NOT-A-VENUE | — | No current Pattaya branch in operator/location, Maps, social, or exact-name checks. Search results repeat the repository's unsupported claim; the existing stub is not evidence. |
| 10 | Castra Gym | ALREADY-COVERED | `castra-gym` | Active official contact page plus July 2026 activity. [E09] |
| 11 | SUN Fitness Buakao | ALREADY-COVERED | `sun-fitness-buakao` | Current Pattaya social activity in July 2026; one multi-branch identity. [E10] |
| 12 | Cross Pattaya Pratamnak | ALREADY-COVERED | `cross-pattaya-pratamnak` | Operating hotel fitness/day-use identity and exact existing record. [E11] |
| 13 | Manhattan Pattaya Fitness | ALREADY-COVERED | `manhattan-pattaya-fitness` | Operating hotel-gym identity and exact existing record. [E12] |

### Yoga / Pilates

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 14 | Ashtanga Yoga Pattaya | ALREADY-COVERED | `ashtanga-yoga-pattaya` | Current official location/contact page. [E13] |
| 15 | One-D Yoga Studio | ALREADY-COVERED | `one-d-yoga-studio` | Live Maps listing: open hours, 4.9/34 reviews, a review five months ago and owner response two months ago; phone and Facebook match the older source. [E14] |
| 16 | Nok Yoga Pattaya | ALREADY-COVERED | `nok-yoga-pattaya` | A distinct Nong Prue/Jomtien-area identity, not One-D; existing record is the match. [E15] |
| 17 | Balance Yoga Studio Pattaya | ALREADY-COVERED | `balance-yoga-studio-pattaya` | Active official studio site and exact existing record. [E16] |

### Golf

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 18 | Laem Chabang International Country Club | ALREADY-COVERED | `laem-chabang-international` | Active official site with 2026 material. [E17] |
| 19 | Phoenix Gold Golf & Country Club | ALREADY-COVERED | `phoenix-gold-golf` | Active official booking/course identity. [E18] |
| 20 | Burapha Golf Club | ALREADY-COVERED | `burapha-golf-club` | Active; appears in current 2026 competition scheduling and exact existing record. [E19] |
| 21 | Treasure Hill Golf Club | ALREADY-COVERED | `treasure-hill-golf` | Active official site and exact existing record. [E20] |
| 22 | Chee Chan Golf | ALREADY-COVERED | `chee-chan-golf` | Active official site/contact identity. [E21] |
| 23 | Chatrium Golf Resort Soi Dao | CLOSED | `chatrium-golf-soi-dao` | **Temporarily closed 1 June–24 July 2026** for course work. Official plan says nine holes reopen 25 July and all 18 on 1 November; closed on this pass's 20 July date. [E22] |
| 24 | Pattana Sports Resort | ALREADY-COVERED | `pattana-sports-resort` | Active official site, current July 2026 activity and stay/play offer. [E23] |
| 25 | St. Andrews 2000 | ALREADY-COVERED | `st-andrews-2000` | Active 2026 tournament/booking identity and exact existing record. [E24] |
| 26 | Khao Kheow Country Club | ALREADY-COVERED | `khao-kheow-country-club` | Active July 2026 booking inventory and exact existing record. [E25] |
| 27 | Bangpra International | ALREADY-COVERED | `bangpra-international` | Active July 2026 rate inventory and exact existing record. [E26] |
| 28 | Mountain Shadow Country Club | ALREADY-COVERED | `mountain-shadow-country-club` | Active July 2026 all-in promotion plus 2026 club play reports. [E27] |
| 29 | Pattaya Country Club | ALREADY-COVERED | `pattaya-country-club` | Active official rates/reservation page. [E28] |
| 30 | Pattaya Golf Driving Range | ALREADY-COVERED | `pattaya-golf-driving-range` | Current listing/review identity and exact existing record. [E29] |

### Racquet sports

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 31 | Fitz Club | DUPLICATE-OF-fitz-club | `fitz-club` | Same venue as row 5; tennis, squash and fitness are facilities of one Royal Cliff club. [E05] |
| 32 | Greta Sport Club Pattaya / Greta Farms | ALREADY-COVERED | `greta-sport-club` | Active venue; current July 2026 LTAT calendar evidence. [E30] |
| 33 | Tara Tennis Club | ALREADY-COVERED | `tara-tennis-club` | Current exact Maps identity and existing venue record. [E31] |
| 34 | Tos Tennis | ALREADY-COVERED | `tos-tennis` | Current academy/shop listing and exact existing record. [E32] |
| 35 | Siam Bayshore Resort tennis | ALREADY-COVERED | `siam-bayshore-tennis` | Real resort courts already represented as their own amenity record. [E33] |
| 36 | Dusit Thani Hotel tennis | DUPLICATE-OF-dusit-thani-pattaya | `dusit-thani-pattaya` | Courts are an amenity of the represented resort, not a separate club. [E34] |
| 37 | Horseshoe Point | DUPLICATE-OF-horseshoe-point-resort | `horseshoe-point-resort` | Same multi-sport/resort identity as the equestrian backlog row. [E35] |
| 38 | Euro Badminton | ALREADY-COVERED | `euro-badminton` | Current exact Maps identity and existing venue record. [E36] |
| 39 | Diamond Badminton | ALREADY-COVERED | `diamond-badminton` | Current exact Maps identity and existing venue record. [E37] |
| 40 | Pattaya Tennis & Badminton Inter Club | ALREADY-COVERED | `pattaya-tennis-badminton-inter-club` | Active; current February 2026 posts and exact record. [E38] |
| 41 | Play Padel Pattaya | ALREADY-COVERED | `play-padel-pattaya` | Active official site and exact existing record. [E39] |
| 42 | Pattaya Sports Club | ALREADY-COVERED | `pattaya-sports-club` | Active member sports-club identity and exact existing record. [E40] |

### Swimming

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 43 | Manta Kids Pattaya | ALREADY-COVERED | `manta-kids-pattaya` | Active official Pattaya swim-school page. [E41] |
| 44 | First Serve Sports Club | NOT-A-VENUE | — | The real club is in Pak Kret, Nonthaburi, not Pattaya. Its official site gives the Nonthaburi address. [E42] |
| 45 | Hard Rock Hotel Pool | ALREADY-COVERED | `hard-rock-pool` | Real Pattaya hotel pool/day-use product already represented. [E43] |
| 46 | Public Pool Naklua | NOT-A-VENUE | — | Exact-name checks found no Pattaya City facility, address, hours, phone, listing or independent current corroboration; only the repository-generated page appears. |
| 47 | Public Pool Jomtien (between South Pattaya and Jomtien) | NOT-A-VENUE | — | No verifiable municipal facility identity or current independent corroboration; the vague location cannot support a venue record. |

### Watersports / diving

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 48 | Pattaya Dive Centre | ALREADY-COVERED | `pattaya-dive-centre` | Active official dive-centre site. [E44] |
| 49 | Seafari PADI Dive Centre | ALREADY-COVERED | `seafari-padi-dive` | Active official dive-centre site. [E45] |
| 50 | Pattaya Scuba Adventures | ALREADY-COVERED | `pattaya-scuba-adventures` | Active official dive-centre site. [E46] |
| 51 | No Limit Divers | DUPLICATE-OF-jomtien-dive-center | `jomtien-dive-center` | Current PADI profile is named No Limit Divers but uses Jomtien Dive Center's site and phone; treat as one operator identity. [E47] |
| 52 | Jomtien Dive Center | ALREADY-COVERED | `jomtien-dive-center` | Active operator identity and exact existing record. [E48] |
| 53 | Clubloongchat Watersports | ALREADY-COVERED | `clubloongchat-watersports` | Active official watersports site. [E49] |
| 54 | Kitesurf Pattaya | NOT-A-VENUE | — | No current exact-name business identity, official page, Maps venue or independent current listing after exact-name checks; generic Jomtien kitesurf references are not this venue. |
| 55 | KBA - Kiteboarding Asia Pattaya | ALREADY-COVERED | `kba-kiteboarding-pattaya` | Active operator site and exact existing record. [E50] |
| 56 | Wave Pattaya Watersports | NOT-A-VENUE | — | Exact-name searches resolve Wave Hotel and generic beach operators, not a distinct sports operator; no usable address/contact identity. |

### Climbing

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 57 | Deep Climbing Gym | CLOSED | `deep-climbing-gym` | Google Maps marks the Harbor Pattaya venue permanently closed; Batch 1 retained the negative finding. [E51] |
| 58 | Bean Cow Climbing Gym | DUPLICATE-OF-bean-cow-climbing-gym | `bean-cow-climbing-gym` | Same address/contact identity now trading as STICKY; Batch 1 resolved the rebrand. [E52] |

### Running / cycling clubs

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 59 | Pattaya Monkey Hash House Harriers | ALREADY-COVERED | `pattaya-monkey-hash-house` | Current chapter genealogy and exact existing club record. [E53] |

### Kids / youth sports

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 60 | AF Academy | ALREADY-COVERED | `af-academy-pattaya` | Active official football-academy site. [E54] |
| 61 | Pattaya City Football Academy | ALREADY-COVERED | `pattaya-city-football-academy` | Active May 2026 activity and exact existing record. [E55] |
| 62 | Planet Football (pattayafootball.com) | ALREADY-COVERED | `planet-football-pattaya` | Active official football-academy site. [E56] |
| 63 | Rusich Club | ALREADY-COVERED | `rusich-club-football` | Active venue, but the backlog sport is wrong: current programs are combat/functional/youth activities rather than a football academy. Recategorize later; do not research as a new venue. [E57] |
| 64 | Regents International School Pattaya | NOT-A-VENUE | — | School facilities are presented for enrolled students and school sport, not as an independently bookable public sports venue. [E58] |
| 65 | Manta Kids | DUPLICATE-OF-manta-kids-pattaya | `manta-kids-pattaya` | Same swim school as row 43. [E41] |

### Equestrian / adventure

| # | Backlog entry | Result | Existing slug | Current-status / identity note |
|---:|---|---|---|---|
| 66 | Horseshoe Point Resort & Country Club | ALREADY-COVERED | `horseshoe-point-resort` | Active multi-sport/equestrian resort identity, also the primary identity for row 37. [E35] |

## Category viability after de-duplication

This answers whether the validated backlog itself supports a useful standalone browse
category; it does not erase stronger categories already supported by the wider 157-record
directory.

| Category | Viability | Reason |
|---|---|---|
| Muay Thai | Viable in the directory | These two add no new identity, but the wider directory is already deep. |
| Fitness / commercial gyms | Viable | Ten active identities survive this backlog alone. Remove the unsupported True Fitness stub. |
| Yoga / Pilates | Viable, small | Four distinct active studios survive. One-D and Nok must not share an address. |
| Golf | Viable | Twelve are trading; Chatrium is temporarily closed on the validation date. All 13 already have records. |
| Racquet sports | Viable | Nine active primary identities after folding hotel/multi-sport duplicates into their parent venues. |
| Swimming | Not yet viable as a clean standalone venue category | Only a kids swim school and a hotel pool survive; the apparent public-pool depth was unsupported. |
| Watersports / diving | Viable | Six active primary operators survive; merge No Limit/Jomtien and remove two invented/unverifiable identities. |
| Climbing | Not viable as a Pattaya category yet | One current identity survives after Deep's closure and the Bean Cow→STICKY continuity. |
| Running / cycling clubs | Not viable from this backlog alone | One current hash chapter is too thin; better grouped under clubs until more are verified. |
| Kids / youth sports | Borderline but usable | Four active providers survive, spanning football, swimming and martial/functional programs. |
| Equestrian / adventure | Not viable as a standalone category from this backlog | One multi-sport resort; keep it under adventure/multi-sport unless more public operators are validated. |

## Evidence index

The existing-record check was performed against [`data.js`](../data.js). External links
below support current identity/status; Batch 1 JSON contains its full per-source evidence.

- **E01** — [`fight-evo360.json`](venues/fight-evo360.json)
- **E02** — [`sitpholek-muay-thai.json`](venues/sitpholek-muay-thai.json)
- **E03** — [Coco Fitness current Maps identity](https://www.google.com/maps/search/?api=1&query=Coco+Fitness+Pattaya)
- **E04** — [Universe Gym current Maps identity](https://www.google.com/maps/search/?api=1&query=Universe+Gym+Pattaya)
- **E05** — [Fitz Club official page](https://www.royalcliff.com/facilities/fitz-club/)
- **E06** — [Elite Gym official site](https://elitegympattaya.com/)
- **E07** — [Jetts Thailand](https://www.jetts.co.th/en/)
- **E08** — [Fitness 7 official site](https://fitness7thailand.com/)
- **E09** — [Castra Gym official contact page](https://castragym.com/contact/)
- **E10** — [SUN Fitness current social/listing mirror](https://www.localgymsandfitness.com/TH/Pattaya/)
- **E11** — [Cross Pattaya Pratamnak official site](https://www.crosshotelsandresorts.com/cross-pattaya-pratamnak/)
- **E12** — [Manhattan Pattaya current Maps identity](https://www.google.com/maps/search/?api=1&query=Manhattan+Pattaya+Hotel)
- **E13** — [Ashtanga Yoga Pattaya official location/contact](https://ashtangayogapattaya.weebly.com/location--contact-us.html)
- **E14** — [One-D Yoga current Maps listing](https://www.google.com/maps/search/?api=1&query=ONE-D+YOGA+PATTAYA)
- **E15** — [One-D and Nok independently described](https://www.thailandnomads.com/yoga-studios-pattaya/)
- **E16** — [Balance Yoga official site](https://balancepattaya.com/)
- **E17** — [Laem Chabang official 2026 page](https://new.laemchabanggolf.com/2026/)
- **E18** — [Phoenix Gold official site](https://www.phoenixgoldgolf.com/)
- **E19** — [Thailand Golf Association](https://www.tga.or.th/)
- **E20** — [Treasure Hill official site](https://www.treasurehill.co.th/)
- **E21** — [Chee Chan official contact page](https://cheechangolf.com/contact-us/)
- **E22** — [Chatrium Golf Soi Dao official page and closure notice](https://www.chatrium.com/golfsoidaochanthaburi)
- **E23** — [Pattana official stay/play page](https://pattana.co.th/stay-play-package/)
- **E24** — [St. Andrews 2000 current Maps identity](https://www.google.com/maps/search/?api=1&query=St+Andrews+2000+Golf+Club)
- **E25** — [Khao Kheow July 2026 booking inventory](https://www.monkeytravel.com/th/en/product/product_detail.php?product_id=992653203)
- **E26** — [Bangpra July 2026 rates](https://gogolf.co.th/course/bangpra-golf-club?tm=2026-07-01)
- **E27** — [Mountain Shadow July 2026 promotion](https://www.clubthailandcard.com/ko/pattaya-rayongarea)
- **E28** — [Pattaya Country Club official rates/reservations](https://www.pattayacountryclub.com/main/rate-reservation/index.php)
- **E29** — [Pattaya Golf Driving Range current listing/reviews](https://wanderlog.com/place/details/5953433/pattaya-golf-driving-range)
- **E30** — [LTAT 2026 beach-tennis calendar](https://www.tour.ltat.org/beach-tennis-calendar-2026.html)
- **E31** — [Tara Tennis current Maps identity](https://www.google.com/maps/search/?api=1&query=Tara+Tennis+Club+Pattaya)
- **E32** — [TOS Tennis current listing](https://www.tourna.in.th/shop.html?id=41)
- **E33** — [Siam Bayshore current Maps identity](https://www.google.com/maps/search/?api=1&query=Siam+Bayshore+Resort+tennis)
- **E34** — [Dusit Thani Pattaya official site](https://www.dusit.com/dusitthani-pattaya/)
- **E35** — [Horseshoe Point current Maps identity](https://www.google.com/maps/search/?api=1&query=Horseshoe+Point+Pattaya)
- **E36** — [Euro Badminton current Maps identity](https://www.google.com/maps/search/?api=1&query=Euro+Badminton+Pattaya)
- **E37** — [Diamond Badminton current Maps identity](https://www.google.com/maps/search/?api=1&query=Diamond+Badminton+Pattaya)
- **E38** — [Inter Club current activity](https://www.localgymsandfitness.com/TH/Pattaya/285394718642137/Pattaya-Tennis-%26-Badminton-Inter-Club)
- **E39** — [Play Padel official site](https://www.playpadelpattaya.com/)
- **E40** — [Pattaya Sports Club official site](https://pattayasports.org/)
- **E41** — [Manta Kids official Pattaya page](https://mantakids.com/pattaya/)
- **E42** — [First Serve official swimming page and Nonthaburi address](https://www.firstservesportsclub.com/swimming)
- **E43** — [Hard Rock Hotel Pattaya official site](https://www.hardrockhotels.com/pattaya/)
- **E44** — [Pattaya Dive Centre official site](https://www.divecentrepattaya.com/)
- **E45** — [Seafari official site](https://seafari.co.th/)
- **E46** — [Pattaya Scuba Adventures official site](https://www.pattaya-scuba-adventures.com/)
- **E47** — [PADI No Limit Divers profile](https://www.padi.com/dive-center/thailand/no-limit-divers-2/)
- **E48** — [Jomtien Dive Center current listing](https://thailanddivemap.com/shops/jomtien-dive-center)
- **E49** — [Clubloongchat official site](https://www.clubloongchat.com/)
- **E50** — [Kiteboarding Asia official site](https://kiteboardingasia.com/)
- **E51** — [`deep-climbing-gym.json`](venues/deep-climbing-gym.json)
- **E52** — [`bean-cow-climbing-gym.json`](venues/bean-cow-climbing-gym.json)
- **E53** — [Thailand hash chapter genealogy](https://genealogy.gotothehash.net/index.php?country=Thailand&r=chapters%2Flist)
- **E54** — [AF Academy official site](https://www.afacademy.pro/en)
- **E55** — [Pattaya City Football Academy current activity](https://www.localgymsandfitness.com/TH/Pattaya/)
- **E56** — [Planet Football official site](https://www.pattayafootball.com/)
- **E57** — [Rusich Club official programs](https://rusich.club/en/home_en/)
- **E58** — [Regents official facilities and school-sport page](https://www.nordangliaeducation.com/risp-pattaya/campus/facilities)

## Part B gate

All 13 golf backlog rows were eliminated by Part A: 12 are `ALREADY-COVERED` and
Chatrium Soi Dao is `CLOSED` on 2026-07-20. Therefore the requested “14 discovered minus
Part A eliminations” candidate pool contains **zero eligible golf venues**. No golf
deep-research JSON was started; doing six would knowingly spend the effort on entries
the validation gate just removed.
