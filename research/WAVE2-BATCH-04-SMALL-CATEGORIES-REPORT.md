# Wave 2 batch 4 research report — swimming, Muay Thai, taekwondo, yoga and tennis

Verified: **2026-07-20**

Scope: every uncovered row in the five remaining small categories, researched
as one batch without intermediate gates. Sixteen source-layer venue records
were written. No production pages, `data.js`, category configuration, build or
other repository was touched.

## Corrected row-count reconciliation

The first literal count incorrectly returned zero taekwondo rows because the
ledger stores the five candidates under `martial-arts`. Counting the actual
taekwondo identities rather than the category string gives the corrected table:

| Category | Mission mention-count | Actual ledger rows | Already covered | Uncovered rows | Records written | Non-venues |
|---|---:|---:|---:|---:|---:|---:|
| Swimming | 9 | 8 | 1 | 7 | 5 | 2 |
| Muay Thai | 5 | 4 | 0 | 4 | 4 | 0 |
| Taekwondo | 5 | 5 | 0 | 5 | 5 | 0 |
| Yoga | 4 | 3 | 1 | 2 | 2 | 0 |
| Tennis | 1 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **24** | **20** | **2** | **18** | **16** | **2** |

The generic Thanita Martial Arts row is not one of the five taekwondo mentions
and was excluded from this category batch. The sole tennis mention is the
already-covered Pattaya Tennis & Badminton Inter Club row stored under
badminton; it is not a new tennis venue.

## Outcome

| Category | Record | Confidence | Status | Deciding result |
|---|---|---:|---:|---|
| Swimming | `swimming-kids-pattaya.json` | low | open | Price, class size, ratio and children's-pool field missing |
| Swimming | `baby-shark-swim-school-pattaya.json` | low | open | Price, age range, ratio and children's-pool field missing |
| Watersports | `pattaya-water-sports-club.json` | medium | open | Category corrected; not a swim school |
| Swimming | `micky-phim-swimming-pool-club.json` | low | open | Genuine THB 50 day-pass pool; no lesson block |
| Swimming | `pattaya-city-school-11-swimming-pool.json` | low | open | 50 m/8-lane event pool; public access and lessons unknown |
| Muay Thai | `mahasan-muay-thai.json` | low | open | Trainer record/alumni incomplete; most tariffs missing |
| Muay Thai | `kor-prakaikaew-99-muay-thai.json` | low | open | One publisher; foreign access, trainers and adult price missing |
| Muay Thai | `mavinn-muay-thai-pattaya.json` | high | open | All three ★ blocks established |
| Muay Thai | `eagle-gym-pratamnak.json` | low | open | Under four publishers; trainers and prices missing |
| Taekwondo | `rsr-pattaya-taekwondo-team.json` | low | open | Federation/grading, pricing and English instruction missing |
| Taekwondo | `pesuso-martial-arts-academy-pattaya.json` | low | open | Relocated identity; same three ★ blocks incomplete |
| Taekwondo | `rsr-grand-taekwondo.json` | low | open | Same three ★ blocks incomplete |
| Taekwondo | `rangsiya-gym-taekwondo-pattaya.json` | low | open | Coach pedigree strong; same three ★ blocks incomplete |
| Taekwondo | `stc-monkeys-taekwondo-pattaya.json` | low | open team | Current competition team; physical timetable remains thin |
| Yoga | `chama-yoga-sound-healing-studio.json` | low | open | Thai/English participation established; pricing missing |
| Yoga | `lek-thai-yoga.json` | medium | open | Language and current programme prices established |

Totals: **16 records — 1 high, 2 medium, 13 low**. Three records are medium+
and thirteen are forced to low by the category-specific ★ rule.

## Swimming findings

The seven uncovered rows resolve to five venues and two non-venues:

- **Swimming Kids Pattaya** and **Baby Shark** are genuine child swim schools.
  Both clear four source families, but neither publishes the parent-decision
  fields that matter most: exact class size, child-to-instructor ratio, regular
  term/drop-in structure, numeric prices or whether a distinct children's pool
  is used. English instruction is also not established.
- **Micky Phim** is a public day-pass pool, not a swim school. THB 50 entry is
  supported by a January 2026 visitor record. Two recent Thai reviews raise
  water-quality concerns, including brown water and an unpleasant taste; those
  are recorded rather than softened.
- **Pattaya City School 11** is a real 50 m, eight-lane long-course competition
  facility with a June 2026 event. Public day-pass access and a lesson product
  are not established.
- **Pattaya Water Sports Club** offers flyboard, wakeboard, SUP, jet ski and
  kayak. It is a genuine venue but was misclassified as swimming. It is the
  only medium-confidence record in this ledger group because its own category
  identity, status and bookable activities are well corroborated.
- **JN Swimming Pool Center** is a pool construction, renovation and
  maintenance contractor. Its reviews discuss building and repairing pools,
  not public swimming. No venue record was written.
- **JPS-PattayaSwim** is a coaching service operating at Ban Rai Swimming Pool,
  not an independently located venue. The discovery ledger already called it
  `NOT-A-VENUE`; no duplicate host/provider record was forced.
- **G Swim Academy / IG Center** is the exact existing `manta-kids-pattaya`
  identity at 53/48 Chaiyaphruek 2.

Swimming instruction therefore produces **two new schools but zero at
medium+**. The Thai query found real parent-market businesses, but their public
information is too thin for a confident family comparison.

## Muay Thai findings

- **MAVINN Pattaya** is the batch's strongest record. Current operator and
  first-hand June 2026 evidence establish head trainer Namsaknoi, a 300+ fight
  record with a reported 95% win rate, co-head trainer Kaolan, active Mavinn
  fighters, foreign/beginner/women access and a complete THB 700–42,000 pass
  ladder. It is `high`.
- **Mahasan** is bookable in English for group/private beginner sessions, but
  Kru Pat's exact fight record, alumni, fixed ratio and most local tariffs are
  missing. Historical Mahasan Poptheeratham fight results were kept as name
  context, not transferred into the current trainer field.
- **Kor Prakaikaew 99** is a genuine Thai neighbourhood camp with current child
  activity. A parent review says youth training is free. Only one inspectable
  publisher exists, and adult/foreign access is unknown.
- **Eagle Gym** clearly welcomes expatriates and beginners, but publishes no
  trainer pedigree or numeric Muay Thai tariff and has only three publisher
  families.

Muay Thai now has seven research records across Wave 2, but only four at
medium+; it does not clear six.

## Taekwondo findings

All five academies are real active teams, but **none clears the gate**.
Competition results prove competition participation; they do not prove current
federation membership, grading portability, English coaching or a numeric fee.
Those distinctions matter to families who may relocate.

- RSR Pattaya, RSR Grand, Rangsiya, Pesuso and Monkeys all appear in current or
  recent competition systems.
- Rangsiya has the strongest named-coach pedigree: Kru June Rangsiya Nisaisom,
  2011 world champion and 2012 Olympian.
- Pesuso's ledger location was stale. Its current official and map identity is
  the second floor of Lotus's North Pattaya. The former Chaiyaphruek rating,
  hours and facilities were not carried over.
- STC Monkeys has July 2026 competition activity under Coach Ake, but its map
  reviews say it was moving and no current physical timetable is published.
  The record says `open team`, with the site limitation explicit.

## Yoga findings

- **Lek Thai Yoga** clears both deciding blocks. The operator publishes in
  English and lists current private, workshop and teacher-training prices.
  It is appointment-only, not a walk-in class studio.
- **Chama** has credible Thai and English participation and good current review
  themes, but no numeric price of any kind. It is low under the required rule.
- The generic Maps listing “Yoga” is the exact existing
  `yoga-pattaya-studio` location on Thepprasit Soi 12.

## Price publication

| Category slice | Venues with usable numeric web price | Rate |
|---|---:|---:|
| Child swim schools | 0 / 2 | 0% |
| Swimming venues (excluding corrected watersports) | 1 / 4 | 25% |
| New Muay Thai camps | 2 / 4 | 50% |
| Taekwondo academies | 0 / 5 | 0% |
| Yoga studios | 1 / 2 | 50% |

Kor Prakaikaew's youth-free statement is useful but is not counted as a full
adult training tariff. Pattaya Water Sports Club's September 2024 flyboard
figures are recorded with their exact date and are not described as a current
2026 operator tariff.

## Identity check against the existing 157

All recorded phone numbers were normalised and checked against `data.js`; none
matches the 157. Exact address/site checks found two known relationships:

1. G Swim/Manta Kids is an exact existing identity and was excluded.
2. G Fitness, researched later in the fitness batch, is a distinct sub-venue at
   the same IG Center complex with a different phone and sport.

No name-string-only decision was used. The current Pesuso location and the
separate Pattaya/Sattahip Rangsiya branches were handled as location identities,
and no old-location rating, price or facility was transferred.

## Category result

None of the small categories clears six medium-confidence records. Muay Thai
is closest at four medium+ across all Wave-2 records. Swimming instruction,
taekwondo and yoga remain useful records to fold into existing site groupings,
not defensible new production categories.

