# Wave 2 batch 1 research report — badminton

Verified: **2026-07-20**

Scope: eight source-layer badminton records only. No pages, `data.js`, category
configuration, builds, Insider files or existing venue records were edited.

## Records written

All eight records use the existing `racquet` category and add `sport:
"badminton"`, `categoryLabel: "Badminton"`, and the requested `courts`,
`booking`, `equipment`, `coaching`, `languages` and `englishConfidence` blocks.

| Record | Area | Confidence | Status | English confidence | Publication read |
|---|---|---:|---:|---:|---|
| `badminton-khaonoi.json` | East Pattaya | medium | open | likely | Strong facility count; hold current rate and overnight-hours claims for confirmation |
| `pattaya-monkey-badminton-center.json` | East Pattaya | medium | open | confirmed | Usable with a booking-friction warning; venue-owned tariff still needed |
| `jp-badminton.json` | Jomtien / Thepprasit | medium | open | likely | Best visitor-logistics record; confirm third-party tariff with reception |
| `272-estadio-de-pattaya.json` | East Pattaya | medium | open | confirmed | Usable with heat, shoe-rule and tariff-currentness cautions |
| `sb-badminton-huai-yai.json` | Huai Yai | low | open | unknown | Hold until operator contact, rates and English provision are verified |
| `naklua-16-badminton.json` | Naklua | medium | open | likely | Usable after reconfirming booking, phone and current court count |
| `baan-badminton-sriracha.json` | Sriracha | medium | open | likely | Strong community/review identity; hold hours, rates and coaching |
| `sriracha-arena.json` | Sriracha | high | open | likely | Strongest record; official rate page is undated, so confirm price before publication |

Confidence totals: **1 high, 6 medium, 1 low**. All eight were currently
operating at verification time.

## Sources and independent publishers

Multiple pages from one operator count as one publisher. A mirror of operator
posts does not create another independent source, and Wanderlog's Google-derived
reviews do not inflate the Google publisher count.

| Venue | Source URLs | Independent publisher families | Publishers used |
|---|---:|---:|---|
| Badminton-Khaonoi | 8 | 7 | Operator Facebook (plus mirror as the same family); Google Maps; Pattaya Unlimited; WorldPlaces; ThaiThurkic; Private Scuba; ASEAN NOW |
| Pattaya Monkey | 6 | 5 | Google Maps; BadWeb Thailand; Fastwork coach; Private Scuba; Pattaya Flight. Wanderlog is useful review access but partly Google-derived. |
| JP Badminton | 6 | 6 | Google Maps; ThaiLink; Around Pattaya; Pattaya Unlimited; Private Scuba; DataForThai |
| 272 Estadio | 6 | 6 | Operator Facebook; Google Maps; Around Pattaya; Pattaya Sports Club; Fastwork coach; Lemon8 visitor account |
| SB Badminton Huai Yai | 4 | 3 fully inspectable + operator identity | Google Maps; ThaiThurkic; thdata; operator Facebook identity linked by ThaiThurkic but inaccessible during research |
| Naklua 16 | 7 | 7 | Operator Facebook; Google Maps; Around Pattaya; Private Scuba; WorldPlaces; BadmintonOpen; thdata |
| Baan Badminton Sriracha | 7 | 7 | Operator Facebook; Google Maps; ThaiThurkic; Sriracha Diary; Longdo; thdata; Court Chon Buri |
| Sriracha Arena | 8 | 5 | Official Sriracha Arena pages (one family); Google Maps; DataForThai; Badminton Association of Thailand; Rayong Badminton Club |

SB is deliberately `low`: four URLs exist, but the operator page could not be
read and the three inspectable publishers are a map plus two directories. That is
not enough depth to turn its thin facility and review evidence into medium
confidence.

## English provision outcomes

The method used three evidence classes: explicit bilingual services; current
English operator material or foreign-group use; and absence of either. English-
language reviews alone were treated as an indicator, not proof that reception
staff speak English.

| Venue | Outcome | Evidence that resolved it |
|---|---|---|
| Pattaya Monkey | **confirmed** | A current independent coach explicitly sells Thai/English group sessions at Monkey. English reviews show foreign visitors using rentals and service. Reception English remains unverified. |
| 272 Estadio | **confirmed** | The same coach explicitly schedules Thai/English groups at 272 on Monday and Wednesday. This confirms an English coaching path, not necessarily English reception. |
| Badminton-Khaonoi | **likely** | Bilingual venue identity, multiple English local listings and an expat-facing Decathlon event at the court. No direct staff reply was found. |
| JP Badminton | **likely** | The Maps-linked guide is fully English and gives solo-player, rental and coaching instructions; older English directories publish an email. The guide's operator relationship is not established. |
| Naklua 16 | **likely** | A multi-day Russian badminton camp used the venue, and English local directories list it. This proves foreign-group access but not staff language. |
| Baan Badminton Sriracha | **likely** | A Japanese expatriate group documents regular venue use and welcomes visiting Japanese players. It is a foreign-access indicator, not direct English proof. |
| Sriracha Arena | **likely** | The operator publishes English navigation, labels, contact details and email, and serves international-company sports events. No current English badminton-desk reply was captured. |
| SB Badminton Huai Yai | **unknown** | Accessible evidence contained no English replies, English booking page, foreign-member reference or readable English-service claim. |

Outcome totals: **2 confirmed, 5 likely, 1 unknown**. Importantly, **no venue
reception desk was directly confirmed in English**; both confirmed outcomes are
bilingual coaching paths.

## What the Thai reviews changed

- **Badminton-Khaonoi:** two reviews from roughly three months before
  verification praise the courts but criticise an older female employee's tone
  and unclear booking guidance.
- **Pattaya Monkey:** three reviews from roughly seven months before verification
  say the Line administrator prioritised regular groups, replied tersely and did
  not offer viable slots to new customers.
- **JP Badminton:** a detailed review says the 12-court hall, bathrooms, food and
  parking are strong, but daytime sun can make the unairconditioned hall feel like
  a sauna.
- **272 Estadio:** Thai reviews identify heat and poor ventilation, a strict
  refusal to allow an early warm-up, and mandatory badminton shoes with uncertain
  loan sizes.
- **SB Huai Yai:** the sparse Thai set supports six courts and clean bathrooms but
  is too thin to establish a complaint pattern.
- **Naklua 16:** a review from roughly two months before verification says a
  reservation was not entered, every court was full on arrival and staff did not
  apologise.
- **Baan Badminton:** recent reviews praise non-glare lighting, parking, court
  standard and the friendly owner; no repeated current complaint emerged.
- **Sriracha Arena:** reviews support the large, clean, well-serviced complex and
  modern floor; one complains about cigarette and vape smoke in covered areas.

These themes are in the records as paraphrases, not marketing copy or translated
review quotations.

## Identity cross-check against the existing 157

No further identity trap was found in this batch.

- None of the eight names, current phones or exact addresses appears in the 157
  `data.js` records.
- `Pattaya Monkey Badminton Center` is unrelated to the existing Pattaya Monkey
  Hash House Harriers; name overlap is only the word “Monkey.”
- Universe-style branch logic did not apply: both Sriracha venues have different
  addresses and phones, and they are separate operators.
- SB's two published phone numbers resolve to the same plus-code location, not two
  venues.
- JP's current Maps phone differs from older directory contacts, but its address
  and active company registration resolve to the same JP venue.

## Unverified fields, grouped by venue

### Badminton-Khaonoi

- Current weekly hours and overnight access; air conditioning; ceiling height.
- Booking lead time and all court rates: hourly, peak, off-peak and member.
- Racket hire, shuttle provision/cost and pro shop.
- Coaching availability, group/private rates and junior programme.
- Direct English-speaking booking staff and beginner suitability.

### Pattaya Monkey Badminton Center

- Coordinates, full weekly hours, court count, surface and ceiling height.
- Venue-owned hourly tariff, peak/off-peak/member rates. The recorded hourly
  figure is the court value inside an external coach's package.
- Racket hire, shoe-hire fee and sizes, shuttle provision/cost and pro shop.
- Venue reception English and whether coaching is contracted by the venue or
  solely external.

### JP Badminton

- Coordinates, court surface and ceiling height.
- Whether the Maps-linked ThaiLink page is operator-authorised; current
  venue-owned tariff, booking lead time and member rate.
- Coaching group/private rates and junior programme.
- Direct English-speaking booking staff and reconciliation of the current Maps
  phone with older directory phone numbers.

### 272 Estadio De Pattaya

- Coordinates, full weekly hours, current venue-owned tariff, surface and ceiling
  height.
- Peak/off-peak/member rates, shuttle provision/cost and pro-shop status.
- Venue reception English and current swimming-pool access conditions.

### SB Badminton Huai Yai

- Coordinates; hours against an operator schedule; relationship between the two
  published phone numbers.
- Court surface, air conditioning and ceiling height.
- Booking lead time and all rates.
- All equipment fields and all coaching fields.
- English provision, beginner suitability and any repeated recent complaint
  theme.
- The fourth-source gate remains weak because the operator Facebook page was not
  inspectable.

### Naklua 16 Badminton

- Current weekly hours and current phone; Google Maps publishes no phone.
- Current court count after the 2023 six-court source, surface, air conditioning
  and ceiling height.
- Booking lead time and all rates.
- All equipment fields and all coaching fields.
- Direct English-speaking booking staff and beginner suitability.

### Baan Badminton Sriracha

- Coordinates, current weekly hours, court count, surface, air conditioning and
  ceiling height.
- Booking lead time and all current rates; a historical price was intentionally
  excluded.
- All equipment fields and all coaching fields.
- Direct English-speaking booking staff, beginner suitability and any repeated
  current complaint theme.

### Sriracha Arena Sport Club

- Coordinates; publication date/currentness of the official rate page.
- Air conditioning, ceiling height, booking lead time and member rate.
- Racket hire, shoe-hire fee, shuttle provision/cost.
- Private coaching rate, current academy schedule and class size.
- Direct English-speaking badminton receptionist.

## Category-wide findings

- **Four of eight** have no numeric current court-rate evidence at all:
  Badminton-Khaonoi, SB, Naklua 16 and Baan Badminton.
- Monkey's numeric rate is from an external coach, JP's from a third-party guide,
  and 272's from a 2025-checked directory corroborated by the coach. Sriracha
  Arena is the only venue with an operator-published tariff, and that page is
  undated. Therefore **none of the eight has a clearly date-stamped 2026 operator
  tariff**.
- Numeric equipment hire is published only for JP and 272. Arena confirms shoe
  hire without a price. Equipment details are otherwise a major category gap.
- Ceiling height is unpublished for all eight. Court surface is firm only for
  Khaonoi (8 mm rubber) and Sriracha Arena (Pulastic).
- Coaching is well evidenced at Monkey and 272 through an external bilingual
  coach and at Sriracha Arena through its academy. It remains unverified at the
  other five.

## Proposed new categories

No category configuration or `data.js` value was changed.

### Propose: `football` — label “Football & Futsal”

The owner-approved wave-2 count is **9 venues**, clearing the six-venue viability
threshold. Three clear examples are:

1. Palladium FC
2. K Football Stadium Pattaya
3. Pattaya Soccer Khao Noi

The category should cover bookable football/futsal pitches and dedicated football
academies whose primary searchable intent is the pitch or club. It should not
absorb generic multi-sport municipal complexes without a record-level reason.

### Flag only: taekwondo — 5 venues

Taekwondo has **5 candidates**, below the six-venue threshold, so this report does
**not** propose a new production category yet. Examples are RSR Pattaya Taekwondo
Team, Pesuso Taekwondo Chaiyaphruek and RSR Grand Taekwondo. Their records should
wait for the owner's taxonomy decision or one more viable venue.

Badminton, padel and tennis remain expressible under the existing `racquet`
category and do not need new production keys.

## Status outturn and stop point

None of these eight turned out closed, pre-opening or not a sports venue. SB is
open but low-confidence, not a closure finding. The batch is complete and stops
here; no padel or remaining badminton records were started.
