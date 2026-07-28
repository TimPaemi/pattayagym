# CODEX — PATTAYA.GYM ENRICH LOOP v4

Paste this whole file, or just:

> **Read `CODEX-GYM-ENRICH-LOOP.md` in `C:\Projects\pattayagym` and do exactly one run.**

One paste = ONE run. Run it as many times as you like, back to back. Every run picks its own
targets from state, so you never have to tell it what to work on. **Nothing is committed and
nothing is pushed — Tim reviews and ships.**

Rewritten 2026-07-28 after a full SEO audit of all 355 pages. Every rule below traces to
something that actually broke or something Google actually documents. Nothing here is folklore.

---

## 0 · WHAT THIS SITE IS, AND WHY THAT DECIDES EVERYTHING

pattaya-gym.com is an independent directory of 215 sport venues in one Thai city. It takes no
money from venues. Its only asset is that a page here tells you something you cannot get from
Google Maps.

That is not a slogan, it is the indexing bar. Google confirmed in April 2026 that
**"Crawled – currently not indexed" is a quality verdict, not a technical problem**, and the
March and May 2026 core updates specifically demoted *replaceable* directory pages — sites that
are "a derivative summary of someone else's data". Aggregators that were the definitive
destination for their niche recovered; reference layers did not.

So before you write a single line, apply **the test**:

> **If Google Maps already shows this, it is not content. It is padding.**

Name, address, phone, a star rating and a category are all on Maps. What is not on Maps: the
price with the date you saw it, which class times are real versus aspirational, whether a
beginner is welcome, what the walk from the road is actually like, and what you *could not*
confirm. Write those. Skip the rest.

---

## 1 · THE ELEVEN NON-NEGOTIABLES

Break any of these and the run is worse than useless, because Tim has to find it and undo it.

**1. Never invent a fact.** Every price, hour, phone number, class time, trainer name and
   founding year comes from a source you can cite in the record's `sources:` list — or it is
   omitted. "Probably around ฿400" is a fabrication. So is "typically open until late".

**2. Never imply a first-hand visit.** Nobody from this site visited the venue. Do not write
   "we visited", "when we dropped in", "the mats felt", "the aircon struggles", "we watched a
   class". The footer now says *"researched from operator sources and public listings, each
   carrying the date we checked it"* — your prose must be able to stand behind that sentence.
   This one is not stylistic. A false first-hand claim is the single fastest way to lose a
   manual review, and since April 2026 competitor spam reports can trigger one.

**3. Write UTF-8. Always. Explicitly.** On 2026-07-27 something re-saved `data.js`,
   `build-v2.js` and `build-discovery.js` through a Windows codepage. Every baht sign turned into
   a three-character run and every em dash into a four-character one, and a build propagated it
   into 306 files. Every gate passed, because mojibake is valid UTF-8 — structurally perfect,
   semantically garbage, and visible only to a human reading the page. (This file deliberately
   describes the damage rather than showing it: a document that quotes corrupt bytes trips the
   very gate that detects them.) If you write a file with PowerShell, use
   `Set-Content -Encoding utf8` — never bare `>` or `Out-File`, which default to the system ANSI
   codepage. Run `node scripts/verify-encoding.js` before you finish. If it fails,
   `node scripts/verify-encoding.js --fix`, rebuild, run it again.

**4. Never add rating or review markup.** No `aggregateRating`, no `review`, no `ratingValue`,
   ever, in any schema block. Google's review-snippet rules (updated 2026-07-24) say verbatim:
   *"Don't rely on human editors to create, curate, or compile ratings information for local
   businesses."* This site currently has zero review markup across 1,695 JSON-LD blocks. Keep it
   at zero. A star rating in *prose*, attributed to a platform with a date, is fine —
   "4.6 on Google Maps from 210 reviews, checked 2026-07-28".

**5. Never link to a sister site.** No pattayavisahelp.com, pattaya-restaurant-guide.com,
   mrweoutside.com, pattaya-school-guide.com, pattaya-medical.com, pattaya-coffee.com or any
   other network domain, in any file, including markdown. The only permitted cross-domain link
   is the existing followed timpaemi.com author credit. `node scripts/check-no-network-links.js`
   enforces this and now scans `.md` too.

**6. Never touch the encoding, structure or ordering of `data.js` beyond your own records.**
   Edit the fields of the venues you worked on. Do not reformat, do not re-sort, do not
   "tidy". It is 215 records on single lines by design.

**7. Never run a bare `node build-v2.js` and stop there.** That regenerates venue pages and
   drops the design layer, the FAQ blocks, the internal linking and the press kit. Run the full
   chain in §5 or run nothing.

**8. Never commit, never push, never deploy.** Not even "just the safe files". Tim ships with
   `SHIP-GYM.ps1`.

**9. Never add or remove `noindex`, canonicals, redirects or sitemap rules.** If you think a
   page should be removed, merged or de-indexed, write it in the report and stop. In July 2026 an
   index gate on a sibling site quarantined 4,635 pages and took it from 40 clicks a day to zero
   in 24 hours.

**10. A thin honest record beats a padded one.** If a venue has almost nothing verifiable, say
   so in 80 words and move on. Do not reach for generic reassurance — "day passes vary, call
   ahead" appears verbatim on 44 pages already and it is the weakest text on the site.

**11. Work only in `C:\Projects\pattayagym`.** Everything outside it is read-only. Other windows
   are working in the sibling repos right now.

---

## 2 · PICK YOUR TARGETS (do this first, every run)

Read `ENRICH-STATE.json`. Then run this to get the live queue — it is the single source of truth
for what is thin, and it changes every run:

```bash
node -e "
const fs=require('fs'), d=require('./data.js');
const H='## What training is on offer';
const SKIP=new Set(['closed','likely-closed','unverified','out-of-area','non-sport','non-sport-attraction','public-beach','limited-operation']);
const rows=d.GYMS.filter(g=>!SKIP.has(g.status)).map(g=>{
  const f='venues/'+g.id+'.md'; if(!fs.existsSync(f)) return null;
  const t=fs.readFileSync(f,'utf8'), b=t.replace(/^---[\s\S]*?---/,'');
  return {id:g.id, w:(b.match(/\b[\p{L}0-9][\p{L}0-9'-]*/gu)||[]).length,
          tpl:t.includes(H), cat:g.category, price:!!g.priceAsOf,
          hrs:/\d{1,2}:\d{2}/.test(g.hours||'')};
}).filter(Boolean);
const need=rows.filter(r=>!r.tpl).sort((a,b)=>a.w-b.w);
console.log('needing enrichment: '+need.length);
need.slice(0,12).forEach(r=>console.log('  '+String(r.w).padStart(4)+'w  '+r.id.padEnd(38)+r.cat));
console.log('missing priceAsOf: '+rows.filter(r=>!r.price).length+'   vague hours: '+rows.filter(r=>!r.hrs).length);
"
```

**Take the 6–10 thinnest.** Thinnest first, always — those are the pages at real deindex risk,
and a 90-word page is where 400 words of research changes the most.

If that list ever comes back empty, switch to the second queue in this order:

1. **Records with no `priceAsOf`.** Only 48 of 215 currently carry one. A price without a date is
   a liability; a price with a date is the most citable thing on the page.
2. **Records with vague hours.** 144 of 215 have specific clock times. The rest say things like
   "contact the gym" — go and find the timetable.
3. **Records verified longest ago.** Prices rot faster than anything else.
4. **New venues** that genuinely exist and are not yet listed — but only after 1–3 are clear.

---

## 3 · WHAT A FINISHED RECORD LOOKS LIKE

Rewrite `venues/<id>.md`. Keep the YAML front matter valid. The body uses **these six H2
headings, verbatim, in this order** — the build, the FAQ injector and the internal-link pass all
key off them:

```
## What training is on offer
## What it costs
## Who it suits — and who it does not
## Getting there
## Before you go
## What we could not verify
```

Target **450–700 words of body prose** for a live venue. Under 300 is the failure zone.

### The rules that make it worth indexing

**Lead with the answer.** Every guide on this site opens with a plain-prose "if you only read one
thing" paragraph, and it is the most extraction-friendly pattern here. Do the same on venue pages.
An AI answer engine quotes the first specific sentence it can find.

**Put numbers in visible prose, not only in tables or front matter.** This is what a strong
record reads like — from `gyms/fairtex-pattaya`:

> *"Operator prices checked on 25 July 2026: Muay Thai: ฿800 for one session … Muay Thai
> unlimited: ฿16,500 for one month … BJJ: ฿300 for one session."*

And this is what a weak one reads like — currently on 35 pages:

> *"Listed tier: varies (varies). Monthly contracts and tourist passes differ."*

The first is quotable. The second is noise. If you cannot write the first, write §"What we could
not verify" instead — that is also unique, also useful, and also true.

**Every price carries the date you saw it**, in the prose *and* in `data.js` as `priceAsOf`, with
`priceSourceUrl` pointing at the page you read it on.

**"What we could not verify" is a feature, not an apology.** The best page in the whole corpus,
`gyms/crossfit-pattaya`, says:

> *"No current first-hand public day-pass, weekly or monthly price was found on the pages checked
> 2026-07-27. That means this record can confirm format and schedule, but not a numeric tariff."*

Nobody else writes that. Write it every time it is true.

**Be specific about who it does not suit.** "Suitable for all levels" is filler. "The published
timetable is two sessions a day at fixed times with no drop-in class between them, so it does not
work around a normal office day" is a fact somebody can act on.

**Getting there means transport, not coordinates.** Nearest landmark, which road, roughly what a
Bolt or songthaew costs from a known point, whether there is parking. Cite where you got it.

---

## 4 · WHERE TO LOOK

Roughly in order of how much Google already knows. Cast wide — the whole point of this loop is
to surface what a single English search does not.

**Operator-first**
- The venue's own site, especially `/prices`, `/schedule`, `/timetable`, `/classes`, `/rates` —
  and the same in Thai (`/ราคา`, `/ตารางเรียน`)
- Facebook page: pinned posts, Photos tab, recent posts. Thai gyms post price cards as images —
  read the image text, and cite the post URL and date
- Instagram bio links, Story highlights, LINE Official Account pages
- Google Maps: hours, "popular times", recent Q&A, owner replies, and *photos posted by visitors*
  that show a printed price board

**Thai-language sources — do this, it is the biggest untapped edge**
Google's May 2026 core update strongly favoured local-market entities for local-market queries.
Out-of-market `.com` domains lost heavily. A price found on a Thai Facebook post and reported here
in English is exactly the non-commodity information that survives.
- Search the venue name in Thai script
- `พัทยา ยิม ราคา`, `ค่าสมาชิก ฟิตเนส พัทยา`, `มวยไทย พัทยา ราคา`, `สนามแบดมินตัน พัทยา`
- Thai Facebook groups and Pantip threads about specific venues

**Federations and registries** — PADI / SSI dive-centre locators, IBJJF and academy affiliations,
Thai Boxing associations, tournament and league pages, municipal sports-facility listings for
Nong Prue, Bang Lamung, Sattahip and Pattaya City

**Local press and community** — Pattaya Mail, The Thaiger, expat forums, Reddit r/Thailand and
r/Pattaya, YouTube gym tours (the video description often carries the current price list)

**What is not a source:** an AI summary at the top of a search page, a scraped aggregator, another
directory, or your own memory. If you cannot link it, you cannot write it.

---

## 5 · THE BUILD CHAIN — run it in full, in this order

```bash
node build-v2.js
node scripts/rebuild-tool-stubs.js
node scripts/build-compare-page.js
node scripts/build-plan-page.js
node scripts/write-status-json.js
node scripts/write-changelog.js
node scripts/write-data-endpoints.js
node scripts/inject-area-guide-faq-r74.js
node scripts/inject-guide-schema.js
node scripts/fix-guide-meta-entities-r68.js
node scripts/write-round55-guides.js
node scripts/inject-venue-faq-r47.js
node scripts/inject-area-category-intros-r43.js
node scripts/deepen-round43-ranked.js
node scripts/inject-internal-linking-r84.js
node scripts/inject-ranked-editorial-funnel.js
node scripts/write-round37-guides.js
node scripts/deepen-round37-guides.js
node scripts/write-training-holiday-guide.js
node scripts/inject-cheapest-price-table.js
node scripts/export-venue-outreach.js
node scripts/inject-homepage-seo.js
node scripts/sync-guides-hub.js
node scripts/migrate-legacy-guides-chrome.js
node scripts/polish-ranked-guide-body.js
node scripts/apply-design-2026.js
node scripts/polish-design-2026.js
node scripts/inject-guide-schema.js
node scripts/build-press-kit.js
node scripts/normalize-entity-graph.js
node scripts/bump-legacy-assets.js
node scripts/sync-csp-hashes.js
node scripts/sync-llms-guides.js
node scripts/patch-guide-map-cta-r70.js
node scripts/apply-geo-r73.js
node scripts/update-sitemap-lastmod.js
```

The two design sweeps must run after every generator, and `build-press-kit.js` must run after
them — run it earlier and a sweep silently overwrites the page.

## 6 · GATES — every one must pass before you write your report

```bash
node validate.js
node scripts/verify-encoding.js
node scripts/check-no-network-links.js
node scripts/verify-deploy.js
node scripts/verify.js
node scripts/seo-audit.js
node scripts/verify-design-layer.js
node scripts/verify-redirects.js
npm run html:validate
node scripts/check-record-originality.js <id-1> <id-2> …
```

A failing gate is your problem to fix, not Tim's. If you genuinely cannot fix it, revert your
own edits to the affected file and say so in the report.

## 7 · SELF-CHECK — paste this and read the output before you stop

```bash
node -e "
const fs=require('fs');
const H=['## What training is on offer','## What it costs','## Who it suits — and who it does not','## Getting there','## Before you go','## What we could not verify'];
const BAD=/\b(we visited|when we visited|our visit|we trained|we dropped in|we watched|we stopped by|i visited)\b/i;
const ids=process.argv.slice(1);
let ok=true;
for(const id of ids){
  const f='venues/'+id+'.md';
  if(!fs.existsSync(f)){ console.log('MISSING  '+f); ok=false; continue; }
  const t=fs.readFileSync(f,'utf8'), b=t.replace(/^---[\s\S]*?---/,'');
  const miss=H.filter(h=>!t.includes(h));
  const w=(b.match(/\b[\p{L}0-9][\p{L}0-9'-]*/gu)||[]).length;
  const src=(t.match(/^\s+- https?:/gm)||[]).length;
  const firstHand=BAD.test(b);
  const prob=[];
  if(miss.length) prob.push(miss.length+' heading(s) missing');
  if(w<300) prob.push('only '+w+' words');
  if(src<2) prob.push('only '+src+' source(s)');
  if(firstHand) prob.push('FIRST-HAND CLAIM');
  if(prob.length){ ok=false; console.log('FAIL  '+id+'  — '+prob.join(' · ')); }
  else console.log('ok    '+id+'  '+w+'w, '+src+' sources');
}
process.exit(ok?0:1);
" <id-1> <id-2> <id-3>
```

Replace `<id-1> …` with the venue ids you touched. Fix anything it flags, then re-run it.

**Then run the originality gate — this one is not optional:**

```bash
node scripts/check-record-originality.js <id-1> <id-2> …
```

It must print `PASS`. It fails a run on four things the check above cannot see:

1. **two records sharing a passage** — two or more sentences in common, or a single sentence
   of 15+ words. Prose is per venue: if a paragraph fits two venues, it describes neither.
   One short factual line in common is fine and deliberately not flagged — two venues checked
   on the same day will write "No current operator tariff was found on 27 July 2026" the same
   way, and that is the honest §3 pattern, not padding.
2. **three or more records gaining an identical number of words.** A constant delta is one
   block pasted N times. Two records can coincide; three cannot.
3. **added sentences containing no digit at all.** No price, no clock time, no date, no street
   number. Enrichment that adds no number added no fact.
4. **a stray `+` or `-` alone on a line** — a diff-paste leftover. Eighteen of these reached
   built pages once and rendered as a visible plus sign at the end of a paragraph.

**Why this exists.** On 2026-07-28 runs 39–42 appended the same six boilerplate sections to 24
records — 405–512 words each, every venue in a run gaining exactly the same count, `fairtex-pattaya`
gaining 233 words and not one new fact. The §7 check above passed all 24, because headings, word
count, source count and absence of first-hand claims were all satisfied. Every gate in §6 passed
too. The work log said `PASS` nine times. All of it had to be reverted by hand.

Padding is the failure mode this loop is most prone to, because the queue rewards word count.
A record that trips this gate is worse than the 90-word record it replaced: it is 400 words of
text that is true, useless, and near-identical to 23 other pages — which is the exact profile the
March and May 2026 core updates demoted. **If you cannot find venue-specific facts, write §"What
we could not verify" and stop. A thin honest record is a pass. A padded one is a revert.**

## 8 · REPORT, THEN STOP

Append one entry to `WORK_LOG_CODEX.md` and print the same thing:

```
## Run <n> — <date>
Records enriched:  <id> (<before>w → <after>w), …
New facts landed:  <e.g. "3 price ladders with dates, 5 timetables, 2 phone numbers">
priceAsOf added:   <n>
Could not verify:  <venue> — <what was missing and where you looked>
Sources used:      <count>, of which Thai-language: <count>
Gates:             validate ✓  encoding ✓  network-links ✓  deploy ✓  verify ✓
                   seo-audit ✓  design-layer ✓  redirects ✓  html-validate ✓
Build printed:     <n> venues · <n> categories · <n> areas · <n> category-area
Flagged for Tim:   <anything structural you noticed and did NOT change>
```

Then **stop**. Do not start another venue, do not commit, do not push.

---

## 9 · THINGS THAT ARE NO LONGER TRUE — do not "fix" them back

Ignore any older instruction, anywhere in this repo, that says otherwise.

- **FAQ rich results are dead.** Google dropped them on 2026-05-07 for every site type. The FAQ
  blocks stay because the visible Q&A still feeds snippets and AI retrieval — but never add
  `FAQPage` markup for the sake of a rich result, and never add an FAQ to a closed or unverified
  venue. Those records deliberately have none now.
- **`llms.txt` is not an SEO lever.** Google, May 2026: *"You don't need to create new machine
  readable files, AI text files, markup, or Markdown to appear in Google Search."* The file is
  kept only because a script keeps its numbers honest. Do not expand it and do not build more
  files like it.
- **There is no special schema for AI search.** Google, same guide: *"Structured data isn't
  required for generative AI search, and there's no special schema.org markup you need to add."*
  No content chunking, no AI-keyword rewriting, no `about`/`mentions` padding. Optimising for AI
  answers is writing a specific, sourced, dated fact where a competitor wrote a hedge.
- **`author` is two Persons, `publisher` is the company.** TimPaemi Co., Ltd. publishes; Tim and
  Paemi write. Both Person nodes carry `url` and `sameAs` and are defined in
  `scripts/lib/timpaemi-author.js`. Do not collapse them back into one Organization.
- **The site ships no photography.** Do not write alt text, image captions or "pictured above"
  for images that do not exist.
