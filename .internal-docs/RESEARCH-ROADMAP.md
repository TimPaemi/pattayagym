# Pattaya Gym Directory — Research Roadmap

A multi-session plan to populate pattaya-gym.com with every gym and sports venue
in Pattaya. Each wave is a focused research session — keep them separate so the
data quality stays high and you don't burn out.

The site already ships with 12 seed venues. Goal: 200-300+ verified entries.

---

## Wave 1 — Muay Thai (Pattaya's strongest category)

**Target: 40-60 venues.** Pattaya is one of the world's top Muay Thai destinations.

Big-name camps to confirm and expand on:
- Fairtex (seeded), Sityodtong (seeded), WKO (seeded), Khongsittha (seeded)
- Tiger Muay Thai (Phuket but cross-list), Sumalee, Phuket Top Team — out of scope
- Sit Sor Por Tor Taew, Sor Klinmee, Pattaya Muay Thai Camp
- Lookbanyai, Por Pramuk, Kombat Group Pattaya
- Aussie Muay Thai, Bryan Popejoy's Boxing Works
- Pakorn PKSaenchai Muay Thai Gym

Sources:
- muaythailand.com directory
- AseanNow / ThaiVisa expat threads ("best muay thai pattaya")
- /r/MuayThai subreddit threads
- Google Maps query: "muay thai" within Pattaya bounds
- Facebook: "Pattaya Muay Thai" group
- YouTube reviews from fight tourists

For each: trainer pedigree, fighter alumni, beginner-friendliness,
accommodation available, English-spoken, drop-in vs package pricing.

---

## Wave 2 — CrossFit, MMA, BJJ, Boxing

**Target: 20-30 venues.**

- CrossFit Pattaya (seeded), CrossFit X-Plicit, CrossFit One More
- BJJ: Phoenix BJJ, Carlson Gracie Pattaya, Titan MMA
- MMA: Combat Sports Asia, MMA gyms inside the bigger Muay Thai camps
- Boxing-only: Western boxing gyms, Sweet Science Boxing

Sources:
- CrossFit affiliate map (map.crossfit.com)
- BJJ Heroes academy directory
- IBJJF affiliate list
- Smoothcomp / Tap Cancer Out competitor maps for Pattaya BJJ

---

## Wave 3 — Commercial Fitness & Yoga/Pilates

**Target: 30-50 venues.**

- Commercial chains: Fitness First, Tony's Gym (seeded), Platinum (seeded),
  World Gym, Anytime Fitness Pattaya, Virgin Active (if any)
- Hotel gyms with day-pass access
- Yoga: Yoga Pattaya (seeded), Yoga Pad Thai, Anahata, Bliss Yoga,
  hot yoga / Bikram studios
- Pilates / barre / reformer studios

Sources:
- Google Maps "fitness" + "yoga" sweep across Jomtien, Naklua, Central, Pratumnak
- ClassPass partners
- TripAdvisor "fitness centers in Pattaya"

---

## Wave 4 — Golf & Racquet Sports

**Target: 30-40 venues. Pattaya is golf-rich.**

Golf courses (full + 9-hole + driving ranges):
- Siam Country Club (seeded — Old, Plantation, Waterside, Rolling Hills)
- Phoenix Gold, Pattaya Country Club, Burapha, St. Andrews 2000,
  Pattana Sports Resort, Khao Kheow, Bangpra International, Mountain Shadow,
  Treasure Hill, Laem Chabang International
- Driving ranges around East Pattaya

Tennis / Padel / Squash / Badminton:
- Pattaya Sports Club, hotel courts (Centara, Hilton, Pullman)
- Padel: rapidly growing — verify current padel courts (Padel Pattaya etc.)
- Badminton halls (popular among Thai residents)

Sources: golfasian.com, golfdigg.com, Pattaya Mail sports section

---

## Wave 5 — Watersports, Swimming, Climbing

**Target: 30-50 venues.**

- Diving: Mermaid's (seeded), Aquanauts, Adventure Divers, Davy Jones Locker
- Kitesurfing: Kiteboarding Asia Pattaya
- Jet ski / parasailing operators (Beach Road, Jomtien)
- Sailing schools, yacht charters
- Stand-up paddleboard rentals
- Swimming pools: public pools, hotel pools with day passes, swim coaching
- Climbing: indoor bouldering gyms (RockDomain or similar)

Sources: PADI dive shop locator, Garmin connect saved courses,
expat Facebook groups, TripAdvisor "watersports Pattaya"

---

## Wave 6 — Clubs, Running, Cycling, Misc

**Target: 20-30 entries.**

- Running: Pattaya Hash House Harriers (seeded), parkrun Pattaya (if exists),
  Saturday morning running groups, marathon training clubs
- Cycling: road clubs (Pattaya Cycling Club), MTB groups, e-bike tours
- Triathlon clubs
- Martial arts not yet listed: Aikido, Judo, Karate dojos, Capoeira
- Sports academies for kids
- Trampoline / parkour parks
- Esports / gaming venues (if relevant to "sports" interpretation)

Sources: Strava clubs filtered to Pattaya, parkrun.co.th, Garmin segments

---

## Verification standard

For every entry, before it ships:
1. Two of: official website, Google Maps listing, Facebook page
2. Phone or LINE number captured if public
3. `verified` field set to date the row was last sanity-checked
4. Mark `priceRange` as `฿` (budget), `฿฿` (mid), `฿฿฿` (premium), `฿฿฿฿` (luxury)

Re-verification cadence: every 6 months, sweep Google Maps + websites for closures.

---

## SEO content layer (post-data)

Once 100+ venues are loaded, add:
- Category landing pages (e.g. /muay-thai, /crossfit) with editorial intro
- Area pages (/jomtien, /naklua, /pratumnak, /east-pattaya, /central)
- Long-form guides: "Best Muay Thai gyms for beginners in Pattaya",
  "Pattaya golf courses ranked", "Diving in Pattaya: complete guide"
- Each venue gets its own URL with full schema.org LocalBusiness markup

---

## How to resume in a new session

Tell the next session: "Continue ULTRA research from RESEARCH-ROADMAP.md,
starting Wave [N]. Current count is [X] venues in data.js."
