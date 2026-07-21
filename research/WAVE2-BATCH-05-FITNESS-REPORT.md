# Wave 2 batch 5 research report — fitness

Verified: **2026-07-20**

Scope: every uncovered fitness row in the approved Wave-2 ledger. Twenty-one
source records were written. No production page, `data.js`, category
configuration, build or other repository was touched.

## Count reconciliation

The mission's 24 is a mention-count. The ledger contains **22 fitness rows**:
21 uncovered candidates plus the exact existing Anytime Fitness at Again
Pattaya identity. The complete batch is therefore **21 records**, not 24.

| Ledger result | Count |
|---|---:|
| Actual fitness rows | 22 |
| Exact existing identity | 1 |
| Uncovered identities researched | 21 |
| Records written | 21 |
| Open | 20 |
| Status unclear | 1 |

The unclear record is Laem Chabang Fitness Center. Its municipal identity and
map pin are real, but no dated 2026 municipal hours or activity notice was
found. It is not called open merely because an undated review says entry is
free.

## Confidence and ★-field result

| Record | Sources/families | Membership block | Hours | Air conditioning | Confidence |
|---|---:|---|---|---|---:|
| James GYM | 5 | Rates, but joining/contract missing | 24/7 | No | low |
| Jomtien Gym | 3 | Missing | Closing time only | Unknown | low |
| Better Bodies | 5 | Monthly only | Complete | Yes | low |
| G Fitness Pattaya | 2 | Missing | Closing time only | Unknown | low |
| Fatburn Fitness | 5 | Rates, but joining/contract missing | Complete | Conflicting | low |
| Human Strong | 5 | Rates, but joining/contract missing | Complete | No | low |
| LEVANT | 3 | Historical monthly + current day pass; terms missing | Closing time only | Unknown | low |
| GAYA Branch 1 | 3 | Private package only | Daily + conditional 24/7 claim | Unknown | low |
| Infinite Laem Chabang | 3 | Missing | Complete | Unknown | low |
| Universe Laem Chabang | 1 | Missing | Partial | Unknown | low |
| Laem Chabang Fitness Center | 2 | Missing | Missing | Unknown | low |
| WeSquare | 3 | Current tariff missing | Closing time only | No | low |
| Chan Pilates | 2 | Missing | Closing time only | Yes | low |
| NRS.gym | 1 | Missing | Closing time only | Unknown | low |
| The Best Fitness Sattahip | 3 | Missing | Complete | Unknown | low |
| Fitness Lifestyle Srirachanakorn | 3 | Missing | Complete | Unknown | low |
| Jetts Central Si Racha | 5+ | Complete | 24/7 + staffed hours | Yes | **high** |
| The Gym Boxing & Fitness | 2 | Missing | Closing time only | Unknown | low |
| Station 24 Sriracha | 2 | Missing | Closing time only | Unknown | low |
| Fitness Lifestyle Tiger Zoo | 5 | Missing | Complete | Unknown | low |
| Real Fitness Sriracha | 2 | Missing | Complete | Unknown | low |

Totals: **1 high, 0 medium, 20 low**.

The strict result matters. James, Better Bodies and Human Strong initially
looked capable of medium because they have public rates, usable hours and clear
climate evidence. The mission's ★ block, however, explicitly includes joining
fee and contract terms. Those are not published, so all three remain low.

Jetts is the sole record with current official joining/access-fee values,
monthly options, a tourist day pass, minimum terms, cancellation/hold rules,
24-hour access and an enclosed air-conditioned branch.

## Price transparency

Only **7 of 21 (33%)** publish or have a defensible current numeric price:

| Venue | Numeric evidence | Limitation |
|---|---|---|
| James GYM | Day, week and month | Current sources conflict on monthly amount |
| Better Bodies | THB 1,000/month | Joining, day pass and contract missing |
| Fatburn | THB 120 day, THB 700 week, THB 990 month | Joining/contract missing; AC evidence conflicts |
| Human Strong | THB 149 day, THB 1,299 month and other durations | Joining/cancellation terms missing |
| LEVANT | THB 300 day pass; 2024 membership table | Detailed table is historical |
| GAYA | THB 3,333 for three private sessions | Not a public gym-membership tariff |
| Jetts Central Si Racha | Current joining, access, monthly, term and visitor-pass prices | Promotion eligibility varies |

The other fourteen publish no usable current number. “Good price,” “not
expensive” and an undated municipal “free” review were not converted into
tariffs. WeSquare's four-year-old, internally inconsistent THB 50/150 review
was deliberately excluded as current pricing.

## Air-conditioning result

This field was more discoverable than contracts but still weak:

- **Confirmed yes:** Better Bodies, Chan Pilates, Jetts Central Si Racha.
- **Confirmed no:** James GYM, Human Strong, WeSquare.
- **Conflicting:** Fatburn Fitness. Current directories say air-conditioned;
  a November 2025 user update says no, while a Thai review mentions fans and
  air conditioning. The record stays `null`, not guessed.
- **Unknown:** the other fourteen.

Climate is therefore documented for only **7 of 21**, and one of those seven is
contradictory.

## Thai review themes that changed the records

- James is clean and well ventilated but open-air.
- Fatburn's equipment is adequate rather than modern, and the air-conditioning
  reports conflict.
- Human Strong is deliberately fan-cooled and open-concept.
- Infinite's equipment is praised, but a reviewer says users leave plates on
  machines and the room may be awkward for beginners.
- Jetts has repeated June 2026 odour/freshness complaints, machine-hogging and
  criticism of class cueing/form correction. Those are material despite the
  chain's strong facilities.
- Real Fitness is varied but small.
- Fitness Lifestyle Tiger Zoo is friendly to beginners, yet package pricing
  and suspension terms remain opaque even in a Thai visitor account.

## Identity traps

- **Anytime Fitness at Again Pattaya** is already included in
  `anytime-fitness-pattaya`; no duplicate was written.
- **Universe Gym Laem Chabang** is distinct from the existing Welcome Town
  Universe Gym: address and phone both differ.
- **Jetts Central Si Racha** is distinct from the existing Jetts Little Walk
  Pattaya record: address and phone both differ.
- **G Fitness** shares 53/48 Chaiyaphruek 2 and the IG Center site with the
  existing Manta Kids swim record, but it is a different sport sub-venue with a
  different phone. The relationship is explicit in the record.
- **CHAN STUDIO / Chan Pilates** are two pins about eight metres apart at the
  same 88/259 site. They were merged into one record.
- **GAYA Branch 1** and Gaya Wellness have different coordinates. Only the
  ledger's Chaiyaphruek 2 branch was recorded.

All 21 new phone numbers were normalised against the 157; none matched. The
production dataset has no dependable coordinate field for all 157, so current
map coordinates/plus codes were combined with phone and exact-address checks
rather than pretending a complete coordinate join existed.

## Fitness category result

Fitness has enough raw identities but **fails decisively at 1 of 21 medium+**.
It should not be proposed as a new production layer from this evidence. A
direct-contact project could improve several records, but another search crawl
will not reveal joining fees and contract terms that the operators choose not
to publish.

