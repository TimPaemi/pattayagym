# Pattaya.Gym Self-Audit — Round 19

**Generated:** 2026-05-18  
**Pages scanned:** 259  
**Total findings:** 71

## Severity summary

| Severity | Count |
|---|---:|
| P1 | 7 |
| P2 | 56 |
| P3 | 8 |

## Findings by dimension

| Dimension | Findings |
|---|---:|
| 1.HTML | 1 |
| 12.Sister | 7 |
| 15.InlineStyle | 1 |
| 16.Sitemap | 1 |
| 17.CSP | 1 |
| 3.Titles | 24 |
| 4.Desc | 10 |
| 8.Links | 3 |
| 9.Orphans | 23 |

## html-validate aggregate

- Total errors across 259 pages: **21**
- Total warnings: **0**
- Top violated rules:
  - `information:`: 1

## All findings (grouped by severity)

### P1 (7 items)

- **[8.Links]** Broken internal link: /gyms/' + escapeHtml(v.id) + '/
  - file: `/compare/`
  - detail: Referenced from: /compare/
  - fix: Fix the URL or create the page
- **[8.Links]** Broken internal link: /category/' + escapeHtml(v.category) + '/
  - file: `/compare/`
  - detail: Referenced from: /compare/
  - fix: Fix the URL or create the page
- **[8.Links]** Broken internal link: /gyms/' + encodeURIComponent(v.id) + '/
  - file: `/gyms/play-padel-pattaya/`
  - detail: Referenced from: /gyms/play-padel-pattaya/, /gyms/castra-gym/, /gyms/venum-training-camp/
  - fix: Fix the URL or create the page
- **[12.Sister]** Sister site pattayastream.com NEVER linked from pattaya-gym.com
  - detail: Zero outbound links found
  - fix: Add to footer, Organization.sameAs, and at least one contextual placement
- **[12.Sister]** Sister site pattaya-coffee.com NEVER linked from pattaya-gym.com
  - detail: Zero outbound links found
  - fix: Add to footer, Organization.sameAs, and at least one contextual placement
- **[12.Sister]** Sister site pattaya-school-guide.com NEVER linked from pattaya-gym.com
  - detail: Zero outbound links found
  - fix: Add to footer, Organization.sameAs, and at least one contextual placement
- **[12.Sister]** Sister site timpaemi.com NEVER linked from pattaya-gym.com
  - detail: Zero outbound links found
  - fix: Add to footer, Organization.sameAs, and at least one contextual placement

### P2 (56 items)

- **[3.Titles]** <title> >70 chars
  - file: `area/east-pattaya/adventure/index.html`
  - detail: len=73 title='Adventure / Multi-Sport in East Pattaya / Darkside, Pattaya | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `area/east-pattaya/clubs/index.html`
  - detail: len=73 title='Running / Cycling Clubs in East Pattaya / Darkside, Pattaya | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `area/east-pattaya/racquet/index.html`
  - detail: len=73 title='Tennis / Padel / Squash in East Pattaya / Darkside, Pattaya | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `area/naklua/adventure/index.html`
  - detail: len=72 title='Adventure / Multi-Sport in Naklua / North Pattaya, Pattaya | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `area/naklua/clubs/index.html`
  - detail: len=72 title='Running / Cycling Clubs in Naklua / North Pattaya, Pattaya | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[4.Desc]** meta description >160 chars
  - file: `find-my-coach/index.html`
  - detail: len=195
  - fix: Truncate to 150-160 at word boundary
- **[3.Titles]** <title> >70 chars
  - file: `gyms/bangkok-hospital-pattaya-rehab/index.html`
  - detail: len=77 title='Bangkok Hospital Pattaya — Sports Rehabilitation &amp; Wellness | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `gyms/big-buddha-hill-wat-phra-yai/index.html`
  - detail: len=79 title='Big Buddha Hill (Wat Phra Yai) — Pratamnak Landmark + Stair Climb | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `gyms/cartoon-network-amazone/index.html`
  - detail: len=81 title='Cartoon Network Amazone Waterpark (now Columbia Pictures Aquaverse) | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `gyms/fitz-club/index.html`
  - detail: len=83 title='Fitz Club — Racquets, Health &amp; Fitness (Royal Cliff Hotels Group) | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[4.Desc]** meta description >160 chars
  - file: `gyms/kba-kiteboarding-pattaya/index.html`
  - detail: len=162
  - fix: Truncate to 150-160 at word boundary
- **[3.Titles]** <title> >70 chars
  - file: `gyms/khao-chi-chan-buddha-mountain/index.html`
  - detail: len=72 title='Khao Chi Chan (Buddha Mountain) — Walking &amp; Meditation | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[4.Desc]** meta description >160 chars
  - file: `gyms/khao-kheow-country-club/index.html`
  - detail: len=162
  - fix: Truncate to 150-160 at word boundary
- **[3.Titles]** <title> >70 chars
  - file: `gyms/koh-larn-coral-island/index.html`
  - detail: len=80 title='Koh Larn (Coral Island) — Pattaya&#39;s Day-Trip Beach Destination | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `gyms/nongnooch-cultural-show/index.html`
  - detail: len=77 title='Nong Nooch Tropical Garden — Thai Cultural &amp; Muay Thai Show | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `gyms/ocean-marina-jomtien/index.html`
  - detail: len=72 title='Ocean Marina Jomtien — Southeast Asia&#39;s Largest Marina | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[4.Desc]** meta description >160 chars
  - file: `gyms/pattana-sports-resort/index.html`
  - detail: len=162
  - fix: Truncate to 150-160 at word boundary
- **[3.Titles]** <title> >70 chars
  - file: `gyms/pattaya-cycling-clubs/index.html`
  - detail: len=85 title='Pattaya Cycling Clubs (Cuore Masters / Monkey Xtreme / Jomtien Cycling) | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `gyms/pattaya-floating-market/index.html`
  - detail: len=76 title='Pattaya Floating Market — Muay Talay &amp; Cultural Activities | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `gyms/pattaya-lawn-bowls/index.html`
  - detail: len=74 title='Pattaya Lawn Bowls Clubs (Banchang / Paradise / The Retreat) | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[4.Desc]** meta description >160 chars
  - file: `gyms/pattaya-public-pool-jomtien/index.html`
  - detail: len=166
  - fix: Truncate to 150-160 at word boundary
- **[4.Desc]** meta description >160 chars
  - file: `gyms/pattaya-public-pool-naklua/index.html`
  - detail: len=162
  - fix: Truncate to 150-160 at word boundary
- **[3.Titles]** <title> >70 chars
  - file: `gyms/pattaya-running-routes/index.html`
  - detail: len=89 title='Pattaya Public Running Routes &amp; Parks (Beach + Mabprachan + City Parks) | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `gyms/pattaya-sky-ride-helicopter/index.html`
  - detail: len=79 title='Pattaya Sky Ride — Helicopter Tours &amp; Bangkok-Pattaya Charter | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[4.Desc]** meta description >160 chars
  - file: `gyms/petchrungruang-gym/index.html`
  - detail: len=162
  - fix: Truncate to 150-160 at word boundary
- **[4.Desc]** meta description >160 chars
  - file: `gyms/pickleball-pattaya/index.html`
  - detail: len=162
  - fix: Truncate to 150-160 at word boundary
- **[4.Desc]** meta description >160 chars
  - file: `gyms/play-padel-pattaya/index.html`
  - detail: len=166
  - fix: Truncate to 150-160 at word boundary
- **[3.Titles]** <title> >70 chars
  - file: `gyms/sanctuary-of-truth/index.html`
  - detail: len=72 title='Sanctuary of Truth — Wood Temple &amp; Cultural-Sport Park | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[4.Desc]** meta description >160 chars
  - file: `gyms/seafari-padi-dive/index.html`
  - detail: len=162
  - fix: Truncate to 150-160 at word boundary
- **[3.Titles]** <title> >70 chars
  - file: `gyms/underwater-world-pattaya/index.html`
  - detail: len=77 title='Underwater World Pattaya — Aquarium &amp; Shark Dive Experience | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[3.Titles]** <title> >70 chars
  - file: `gyms/wong-amat-beach/index.html`
  - detail: len=76 title='Wong Amat Beach — Naklua / Pattaya&#39;s Family Swimming Beach | Pattaya.Gym'
  - fix: Truncate at word boundary, target 60-65
- **[9.Orphans]** Orphan page (no inbound links): /404.html/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /add-your-gym/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/central-pattaya/crossfit/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/central-pattaya/golf/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/central-pattaya/swimming/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/central-pattaya/yoga/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/east-pattaya/climbing/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/east-pattaya/golf/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/east-pattaya/kids-youth/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/east-pattaya/mma/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/east-pattaya/swimming/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/east-pattaya/watersports/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/jomtien/adventure/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/jomtien/golf/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/jomtien/kids-youth/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/jomtien/racquet/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /area/naklua/adventure/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /colophon/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /favorites/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /find-my-coach/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /pattaya-sport-stats/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /plan-my-trip/
  - fix: Add link from a related page or noindex
- **[9.Orphans]** Orphan page (no inbound links): /press/
  - fix: Add link from a related page or noindex
- **[16.Sitemap]** Page exists locally but is missing from sitemap.xml: https://pattaya-gym.com/404.html/
  - fix: Add to sitemap or noindex if intentional
- **[1.HTML]** 1x html-validate violations of rule "information:"
  - fix: See html-validate output for fix

### P3 (8 items)

- **[3.Titles]** <title> <25 chars (too short)
  - file: `favorites/index.html`
  - detail: len=23 title='Your saved Pattaya gyms'
  - fix: Expand to 40-65 chars
- **[3.Titles]** <title> <25 chars (too short)
  - file: `find-my-coach/index.html`
  - detail: len=23 title='Find your Pattaya coach'
  - fix: Expand to 40-65 chars
- **[3.Titles]** <title> <25 chars (too short)
  - file: `gyms/castra-gym/index.html`
  - detail: len=24 title='Castra Gym | Pattaya.Gym'
  - fix: Expand to 40-65 chars
- **[12.Sister]** Sister site pattaya-restaurant-guide.com linked 263x (well-linked)
  - detail: OK
- **[12.Sister]** Sister site pattayavisahelp.com linked 263x (well-linked)
  - detail: OK
- **[12.Sister]** Sister site pattaya-authority.com linked 638x (well-linked)
  - detail: OK
- **[15.InlineStyle]** 113 inline style attrs on a single page
  - file: `changelog/index.html`
  - fix: Extract to utility classes
- **[17.CSP]** style-src still has unsafe-inline (Round 18 reduced 56% but more needed for strict)
  - file: `_headers`
  - fix: Continue inline-style refactor; then drop unsafe-inline

## Sister-network cross-linking status

| Sister site | Outbound links | Status |
|---|---:|---|
| pattaya-restaurant-guide.com | 263 | ✓ well-linked |
| pattayavisahelp.com | 263 | ✓ well-linked |
| pattayastream.com | 0 | ✗ ZERO LINKS |
| pattaya-coffee.com | 0 | ✗ ZERO LINKS |
| pattaya-school-guide.com | 0 | ✗ ZERO LINKS |
| timpaemi.com | 0 | ✗ ZERO LINKS |
| pattaya-authority.com | 638 | ✓ well-linked |
