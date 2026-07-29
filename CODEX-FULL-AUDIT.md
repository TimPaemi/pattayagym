# CODEX — PATTAYA-GYM FULL AUDIT v1

**Written 2026-07-28.** Every standard quoted below was verified against a primary source on
that date, with the source's own last-updated date recorded. Nothing here is folklore, and
§2 lists the folklore explicitly so you do not reintroduce it.

Paste this whole file, or just:

> **Read `CODEX-FULL-AUDIT.md` in `C:\Projects\pattayagym` and run the full audit.**

---

## 0 · WHAT THIS IS, AND THE ONE RULE

This is a **read-only audit**. You produce a report. You change nothing.

**Do not edit a single file. Do not run a build. Do not commit. Do not push.**
Not `--fix`, not "while I was there", not a typo. If you find something broken, you write it
down. Tim decides and Tim ships. An audit that mutates the tree cannot be trusted, because
nobody can tell which findings were real and which you caused.

The one exception: you write your report to `.internal-docs/AUDIT-2026-07.md`. That is the
only file you create. `.internal-docs/` is blocked from the web root in `_redirects` and is
not served.

**Scope:** `C:\Projects\pattayagym` only. Everything outside it is read-only — other windows
are working in sibling repos right now. Read `CLAUDE.md` and `AGENTS.md` first; they bind you.

**Working method.** Do not sample. This site is 355 pages and 215 records — small enough to
check exhaustively with a script. Every count in your report must come from a command you
actually ran, and you must paste the command. A finding without a reproducible count is an
opinion, and opinions are what got this site into trouble before.

---

## 1 · WHAT THE SITE IS, AND WHAT "GOOD" MEANS IN 2026

pattaya-gym.com is an independent directory of 215 sport and fitness venues in one Thai city.
Static HTML, no framework, built by `build-v2.js` plus ~98 scripts, deployed to Cloudflare
Pages from GitHub `main`. No money from venues, no paid placement, no ads. Two named human
authors (Tim and Paemi) under TimPaemi Co., Ltd.

**The competitive situation, measured July 2026.** Across five realistic queries
(`gyms in Pattaya`, `muay thai pattaya`, `24 hour gym pattaya`, `badminton court pattaya
booking`, `pattaya fitness price`) only two pattaya-gym.com URLs surfaced at all: the homepage
and one guide. **Not one individual venue page surfaced.** Meanwhile:

- **No competitor dates their prices.** Not TripAdvisor, TrainAway, MuayThaiMap, RoamFit,
  pattayaknowledge.com, or any legacy Pattaya directory.
- **No competitor discloses a verification method.**
- **No competitor exceeds ~50 venues.**
- Badminton, racket sports, diving, climbing, equestrian and swimming have **no credible
  English-language incumbent** — those SERPs are Instagram pages, a scuba site, and legacy
  directories.

**The structural risk, measured.** Third-party visibility data across the Dec 2025, Mar 2026
and May 2026 core updates shows one consistent split — and it is the split this site sits on
the wrong side of by *shape* and the right side of by *substance*:

| Lost | Held or gained |
|---|---|
| TripAdvisor −44.8, Yelp −33.1, Expedia −32.7, Glassdoor −21.7%, Lonely Planet −23.8% | Trustpilot +49%, Capterra +61%, Healthgrades +31%, Niche.com +13% |
| Open aggregation of other people's data | Verified, structured, proprietary data |
| The intermediary layer between searcher and thing | The originator of the thing |

Sources: Amsive/SISTRIX analyses 15 Jan 2026 and 30 Apr 2026; Aleyda Solis/Sistrix 12 Apr 2026
and 3 Jun 2026. All third-party measurement — **Google has published nothing directory-specific,
and you must not claim otherwise.**

Lily Ray's conclusion on the March 2026 update, verbatim: *"The competitive answer is not better
SEO — it is a stronger product."*

**So the audit question is not "is the SEO correct."** It is: **does this site hold facts that
exist nowhere else, are those facts on the page in extractable form, and is anything in the
build actively destroying that advantage?** Everything in §3 serves that question.

---

## 2 · THE 2026 BASELINE — WHAT IS TRUE, AND WHAT IS DEAD

Read this before you check anything. Half of published SEO advice is now wrong, and several
things this repo currently does were correct when they were written and are not any more.

### 2.1 Confirmed dead — do not recommend, do not "fix" back

| Thing | Status | Source + date |
|---|---|---|
| **FAQPage rich results** | **Stopped appearing 7 May 2026.** Search Console report and Rich Results Test support dropped Jun 2026; API support ends **Aug 2026** | `developers.google.com/search/docs/appearance/structured-data/faqpage`, doc updated 2026-05-08 |
| **HowTo structured data** | Dead since 13 Sep 2023, docs deleted | `developers.google.com/search/blog/2023/08/howto-faq-changes` |
| **Practice problem** | Removed 6 Jan 2026 | Google docs changelog |
| **`<priority>` / `<changefreq>` in sitemaps** | *"Google ignores `<priority>` and `<changefreq>` values."* Verbatim, still current | `developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap`, updated **2026-07-08** |
| **`crawl-delay` in robots.txt** | Never supported by Google. *"other fields such as `crawl-delay` aren't supported"* | robots.txt spec doc, updated **2026-07-08** |
| **`noindex` in robots.txt** | Not supported | same |
| **`rel=next` / `rel=prev`** | *"Google no longer uses these tags."* | Pagination doc, 2025-12-10 |
| **Sitemap ping endpoint** | Returns 404 since 2023 | `developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping` |
| **FID** | Retired Mar 2024, replaced by INP | web.dev |
| **"Googlebot reads the first 15MB"** | **Now 2MB for Google Search.** The 15MB figure applies only to crawlers that don't specify a limit | `developers.google.com/search/blog/2026/03/crawler-blog-post`, **2026-03-31** |
| **HSTS `preload`** | hstspreload.org itself now says preloading *"is not recommended."* Chrome 154 (Oct 2026) turns on HTTPS-by-default for everyone, making it largely redundant | hstspreload.org; `security.googleblog.com/2025/10/https-by-default.html` |
| **Helpful Content System as a separate thing to recover from** | Folded into core Mar 2024, formally archived Aug 2024 | Ranking systems guide, "Retired systems" |
| **llms.txt as an SEO lever** | *"Google Search ignores them"* … *"will neither harm nor help your site's visibility or rankings"* | AI optimization guide, updated **2026-07-10**; changelog 15 Jun 2026 |

### 2.2 Confirmed true — the standards you audit against

**Content and quality**

- **Non-commodity content is the official term.** Verbatim: *"Don't just recycle what others on
  the internet have already said, or could easily be produced by a generative AI model."*
  Google's own contrast: "7 Tips for First-Time Homebuyers" (commodity, bad) vs "Why We Waived
  the Inspection & Saved Money" (non-commodity, good).
  — `developers.google.com/search/docs/fundamentals/ai-optimization-guide`, updated **2026-07-10**
- **Scaled content abuse**, verbatim: *"many pages are generated for the primary purpose of
  manipulating search rankings and not helping users… large amounts of unoriginal content that
  provides little to no value to users, **no matter how it's created**."* There is **no page-count
  threshold** anywhere in Google's docs — anyone quoting one invented it.
  — Spam policies, updated **2026-05-15**
- **Fan-out pages are explicitly named as a violation.** Verbatim: creating separate content for
  every query variation *"primarily to manipulate rankings or generative AI responses in Google
  Search **violates Google's scaled content abuse spam policy**… a high quantity of pages doesn't
  make a website higher quality."* — AI optimization guide, 2026-07-10
- **Doorway abuse**, two bullets that bear directly on this repo's 52 category×area pages:
  *"Having multiple domain names or pages targeted at specific regions or cities that funnel users
  to one page"* and *"Creating substantially similar pages that are closer to search results than
  a clearly defined, browseable hierarchy."* — Spam policies, 2026-05-15
- **"Crawled – currently not indexed" is *sometimes* a quality verdict — at pattern level only.**
  John Mueller, verbatim: *"if our systems are seriously worried about the quality of a website,
  they will reduce the number of pages that they index… you'll see things like 'crawled not
  indexed'."* But Martin Splitt, same episode: *"there's no such thing as a ratio between indexed
  and non-indexed pages… That's not something that you need to worry about"* — Google's own
  developer docs index ~5% of their pages.
  — Search Off the Record ep. 112, **16 Jul 2026**
- **Mueller's 2026 test for AI-assisted content is distinguishability, not authorship:**
  *"That's not to say that all AI-generated content is bad. But sometimes you just run across
  websites where you're like, '**Anyone could have written this. This tells me nothing.**'"* — same
- **E-E-A-T has not changed since Dec 2022.** Zero changelog entries Jan 2025 → Jul 2026. Verbatim:
  *"While E-E-A-T itself isn't a specific ranking factor."* Trust is the most important component.
  **There is no 2026 Quality Rater Guidelines** — current edition is **September 2025**, 182 pages.
- **Small sites are not penalised for obscurity.** QRG §3.3.5, verbatim: *"small websites may have
  little or no reputation information. **This is not indicative of high or low quality.**"*
- **Curation and functionality count as effort.** QRG §3.2: effort includes *"designing page
  functionality or building systems that power a webpage."* Directory navigation, comparison and
  filtering are the effort signal.
- **The Low-rating trap.** QRG §5.2.1: Low applies where content is *"copied, paraphrased,
  embedded or reposted, with a low amount of effort to create value by editing, manually curating,
  reformatting or injecting some original content."* Named low-value example: *"'Best' lists based
  on existing reviews and lists with little original content."*
- **Deleting content is a last resort.** Verbatim from the core updates doc. Do not recommend
  bulk pruning as a core-update remedy.

**AI surfaces**

- **There is no AI-specific markup, file format, or schema.** Verbatim: *"Structured data isn't
  required for generative AI search, and there's no special schema.org markup you need to add."*
  Google's explicit "don't bother" list also covers content chunking, AI-specific rewriting, and
  seeking inauthentic brand mentions. — AI optimization guide, **2026-07-10**
- **Google's framing:** *"optimizing for generative AI search is optimizing for the search
  experience, and thus still SEO."* There is no separate AEO/GEO discipline per Google.
- **Structured data does not lift AI citations.** The best-controlled study (Ahrefs 2026, 1,885
  pages adding JSON-LD vs ~4,000 matched controls) found AI Overviews citations **fell 4.6%**
  relative to controls; ChatGPT and AI Mode were statistically zero. Studies claiming a lift had
  no control group. Retrieval rank dominates: 43% citation rate at position 1 → 5% by position 7.
  **Implement schema for rich-result eligibility and correctness, never as a citation strategy.**
- **Ranking no longer predicts citation.** Only **37.9%** of AI Overview citations came from
  top-10 URLs in Jan 2026, down from ~76% in Jul 2025; 31% came from URLs ranking outside the top
  100. — Ahrefs, 863k SERPs, 2 Mar 2026
- **Genuine update recency correlates strongly with LLM citation.** 75% of pages LLMs cite were
  updated within the last year; over half of those within three months. By *publish* date only
  42% were within a year — *"the freshness LLMs reward is being manufactured by updates, not by
  new publishing."* — Seer Interactive, n=47,097 citations, **24 Jul 2026**
- **Spam policies now cover generative AI responses** — changelog 15 May 2026.

**Structured data**

- **Review markup, the hard rule for this site**, verbatim: *"Ratings must be sourced directly
  from users. **Don't rely on human editors to create, curate, or compile ratings information for
  local businesses.**"* Plus *"Don't aggregate reviews or ratings from other websites"* and, added
  **24 Jul 2026**, *"Don't include fake or undisclosed incentivized reviews."* Violations can
  trigger a manual action. — Review snippet doc, updated **2026-07-24**
- **LocalBusiness** requires only `address` and `name`. Use the most specific subtype.
  **`additionalType` is explicitly unsupported** — use a `@type` array.
- **Organization** has zero required properties and Google explicitly says: *"You don't need to
  include it on every page of your site."* Home page or About page only.
- **Person has no standalone rich result.** It surfaces via `Article.author`, `ProfilePage`, and
  entity understanding.
- **schema.org current release is v30.0, 19 Mar 2026.**
- **Audit against the HTML docs, not the `.md.txt` mirrors** — Google's plain-text mirrors lag and
  still list FAQ.

**Technical**

- **Core Web Vitals are still exactly LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at p75.** No new metric has
  been added. Soft Navigations is in origin trial and is **not** a CWV.
- **Googlebot fetches up to 2MB per URL**, headers included, and *"content past the cutoff is
  entirely ignored."* Subresources have their own separate counters. Google explicitly recommends
  **externalising heavy CSS/JS rather than inlining**, and putting `<title>`, meta, canonical and
  structured data **early in the HTML**.
- **The Web Rendering Service is stateless** and clears local storage between requests.
- **Googlebot supports HTTP/1.1 and HTTP/2 only** (no HTTP/3), and gzip/deflate/brotli (no zstd).
- **`lastmod` is used only when consistently accurate and verifiable.** Omit it rather than fake it.
- **Redirect signals:** 301 and 308 both transfer canonical. **307 and 302 do not.** Google follows
  up to 10 hops.
- **Cloudflare Pages:** redirects always win over static assets and over `_headers`; **redirect
  chains do not resolve** (only the first hop applies); `_headers` is capped at **100 rules**,
  `_redirects` at 2,100. Default cacheable-asset header is `public, max-age=0, must-revalidate` —
  it revalidates *everything* unless overridden. Early Hints is **on by default** and needs
  genuinely cacheable assets or resources get fetched twice.
- **CSP:** for a static site use a **hash-based** strict CSP (nonces are impossible). `report-uri`
  is deprecated in favour of `report-to`. COOP/COEP are only needed for cross-origin isolation —
  not required here. Permissions-Policy is still not Baseline.
- **WCAG 2.2 is current. WCAG 3.0 is an incomplete draft and is years away.** Target 2.2 AA.
- **European Accessibility Act:** the microenterprise exemption (<10 staff, ≤€2m turnover) is a
  complete carve-out for *services*. Note it and move on; it is a legal question, not yours.
- **Lighthouse is at 13.3.0** (2026-05-07). v13 removed 7 audits including `font-size`,
  `offscreen-images` and `preload-fonts` — do not chase deleted audits. Performance scoring is
  unchanged. The new **Agentic Browsing** category audits for llms.txt, which **directly
  contradicts Google Search's position** — different teams, different consumers. Do not treat it
  as an SEO signal.

**Threat surface**

- **Spam reports can now trigger manual actions.** Changed **14 Apr 2026**; the old wording said
  reports were never used for direct action. Google also states: *"we must send the submission
  text to the site owner."* Competitor reports are now a live threat vector — which raises the
  cost of any false claim on this site.
- **Site reputation abuse is not this site's risk.** A directory's own listings are first-party
  product. Exposure exists only if it hosts guest, sponsored or white-label editorial.
- **Cloudflare changes AI-bot defaults on 15 Sep 2026** — new domains default to Training and
  Agent blocked on ad-displaying pages, Search permitted. Existing domains should verify their
  setting deliberately.

### 2.3 Claims you must not make in your report

If you write any of these, the report is wrong:

- "E-E-A-T is a ranking factor."
- "The 2026 Quality Rater Guidelines say…" (there is no 2026 edition)
- "Google says directories should…" (Google has published nothing directory-specific)
- "Add llms.txt / FAQ schema / special markup to get into AI Overviews."
- "Structured data improves rankings." (Mueller, 13 Apr 2025: *"Structured data won't make your
  site rank better."*)
- "Low index ratio means Google thinks the site is low quality."
- "Information gain is a Google ranking signal." (It is a 2022 patent, scoped to automated
  assistants, never confirmed for web search. Google's own words are *"original information,
  reporting, research, or analysis"* and *"substantial additional value and originality."*)
- Any page-count threshold for scaled content abuse.
- Any claim that publishing in Thai improves English-language rankings. **No study exists in
  either direction.** Thai is valuable as a *source* of facts nobody else has — that routes into
  the evidenced originality criterion, not into a language signal.

---

## 3 · THE AUDIT — TEN DOMAINS

Work through all ten. For each finding give: **what**, **where** (file:line or URL), **how many**
(with the command), **why it matters** (cite the dated standard from §2), **severity**, and
**the smallest fix**. Do not fix it.

Severity rubric:

- **S1 — actively harmful.** Costing traffic, indexing or trust right now, or exposes the site to
  a manual action.
- **S2 — blocking upside.** Not harmful, but a documented advantage is being left unclaimed.
- **S3 — dead weight.** Harmless but wrong: bytes, maintenance cost, or an obsolete pattern that
  will mislead the next person.
- **S4 — note.** Worth knowing, no action implied.

Anything that would change indexing — `noindex`, canonicals, redirects, URL changes, sitemap
rules, pruning — goes in a **separate "Needs Tim's explicit yes"** section with the downside
stated **in clicks, not pages or percentages**. In July 2026 an index gate on a sibling site
quarantined 4,635 pages and took it from 40 clicks a day to zero in 24 hours.

---

### A · CONTENT ORIGINALITY — the one that decides everything

This is the audit's centre of gravity. Everything else is hygiene.

1. **Cross-record duplication.** Run the existing gate across all 215 records:
   `node scripts/check-record-originality.js <every id>`. Then go further than it does: find every
   sentence of 8+ words appearing on 3+ pages **anywhere on the site**, including guides, category
   and area pages — not just `venues/`. Report the worst 20 with their page counts.
2. **The commodity test, per page type.** For a sample of 20 venue pages, 10 guides, 10
   category×area pages, answer in one line each: **what does this page say that Google Maps, the
   venue's own Facebook page, and TripAdvisor do not?** If the answer is "nothing", say so. Count
   how many of the 40 have a real answer.
3. **Extractable specifics.** Count pages containing at least one of: a price with a date, a clock
   time, a phone number, a street address, a named coach, a class timetable. Then count pages
   whose entire body could be swapped onto another venue without a reader noticing.
4. **The hedge inventory.** Find every phrase repeated across 10+ pages that carries no
   information — "day passes vary, call ahead", "suitable for all levels", "contact the gym",
   "prices may change". Give exact counts. These are the weakest text on the site.
5. **Dated facts coverage.** How many of 215 records carry `priceAsOf`? `priceSourceUrl`? Specific
   clock hours? A `verified` date older than 90 days? This is the site's stated differentiator and
   **no competitor has it** — quantify how much of it is actually landed.
6. **First-hand claims.** Nobody from this site has visited any venue. Grep the whole corpus for
   "we visited", "we trained", "when we dropped in", "the mats felt", "our visit", "we watched",
   "in person", "on site". Any hit is **S1** — a false first-hand claim is the fastest route to a
   manual review, and since 14 Apr 2026 a competitor spam report can trigger one.
7. **Thin pages.** List every live venue record under 300 body words and every category×area page
   under 300 words, with counts. Do **not** recommend deletion — Google's own guidance is that
   deleting content is a last resort.
8. **Author and byline integrity.** Do the two Person entities resolve? Do bylines lead to real
   bio pages? Does every page that presents an author in prose also carry it in markup, and vice
   versa? Google: *"Make sure that all the authors that are presented as authors on the web page
   are also included in markup."*

**Pass criteria:** zero first-hand claims; zero sentences repeated on 3+ pages; every live venue
page answers the commodity test with something concrete.

---

### B · STRUCTURED DATA

1. **Dead FAQPage blocks.** The last count was **262 pages** carrying `FAQPage`. FAQ rich results
   stopped appearing **7 May 2026** and Search Console API support ends **Aug 2026**. Confirm the
   current count and total bytes. Note Google's own position: *"there's no need to proactively
   remove it… Structured data that's not being used does not cause problems for Search."* So this
   is **S3, not S1** — report the byte cost and let Tim decide. Do not overstate it.
2. **Review and rating markup.** Confirm the count of `aggregateRating`, `ratingValue`, `review`
   and `Review` across all JSON-LD is **zero**. If it is not zero, that is **S1** — the site
   compiles venue information editorially, and Google's rule is explicit: *"Don't rely on human
   editors to create, curate, or compile ratings information for local businesses."*
3. **LocalBusiness correctness.** Are venues using the most specific subtype available
   (`ExerciseGym`, `SportsClub`, `GolfCourse`, `PublicSwimmingPool`, `TennisComplex`,
   `StadiumOrArena`, `HealthClub`, `BowlingAlley`)? Is `additionalType` used anywhere? It is
   **explicitly unsupported** — must be a `@type` array. Are `geo`, `openingHoursSpecification`,
   `telephone`, `url`, `priceRange` present where the data exists?
4. **Organization placement.** Google: *"You don't need to include it on every page."* Count how
   many of 355 pages carry an Organization block. If it is on all of them, that is **S3** bytes.
5. **Markup vs visible text.** Google's structured-data policy requires markup to match visible
   content. Sample 20 venue pages and check every JSON-LD claim (hours, price, address, phone)
   appears in the rendered HTML. Any mismatch is **S1**.
6. **Validation.** ~49% of deployed schema in the wild fails validation. Parse every JSON-LD block
   on all 355 pages and report parse errors, undefined `@type`s, broken `@id` references, and
   dangling `sameAs` URLs. The last known figure was **1,695 blocks** — confirm it and confirm
   zero parse errors.
7. **`datePublished` / `dateModified` integrity.** Google, verbatim: *"Don't specify future dates,
   or the date of the action described on the page. The dates must describe the publication or
   update date of the page, not the stories or events described therein."* **This is a direct hit
   on this site's model.** Verify that no `priceAsOf` or "checked on" date has leaked into
   `dateModified`. Check no dates are in the future. Check `dateModified` reflects real change,
   not a build timestamp — a build that stamps today's date on 355 unchanged pages is manufacturing
   a freshness signal Google explicitly warns about.
8. **Schema that is dead weight.** Any `HowTo`, `speakable`, or other retired type still emitted.

---

### C · CRAWLING, INDEXING, SITEMAP, ROBOTS

1. **`<priority>` and `<changefreq>`.** Last count: **351 of each** in `sitemap.xml`. Google
   ignores both — verbatim, in a doc updated **2026-07-08**. Confirm the count. **S3** — pure bytes.
2. **`lastmod` honesty.** Does every `lastmod` reflect a real content change? A build that rewrites
   all 355 `lastmod` values on every deploy destroys the signal. Google: *"if your page changed 7
   years ago, but you're telling us it changed yesterday, eventually we're not going to believe
   you."* Compare `data/sitemap-lastmod.json` against actual git history for 20 sampled pages.
   Divergence is **S2**.
3. **`robots.txt` audit.** The current file has real problems — verify each:
   - **`Crawl-delay: 1` in the `*` group.** Google does not support it. Harmless to Google but
     **it is honoured by some crawlers and is throttling them for no reason.**
   - **`Claude-Web` and `anthropic-ai` are legacy tokens** not named in Anthropic's current
     crawler doc (updated 7 Apr 2026). The live tokens are **ClaudeBot** (training),
     **Claude-User** (user-triggered) and **Claude-SearchBot** (search/citation). Two of the three
     are missing.
   - **`OAI-AdsBot` is missing** (added by OpenAI since 2025).
   - Every AI crawler is currently `Allow: /`, including training-only bots. That is a deliberate
     choice Tim may want to keep — **report it as a decision, not a defect.** The relevant fact:
     blocking `Google-Extended` costs **nothing** in Search (Google says so explicitly), and
     `GPTBot` is training-only while `OAI-SearchBot` is what produces ChatGPT citations. Same
     split for `ClaudeBot` vs `Claude-SearchBot`. Blocking training while keeping citation surfaces
     is possible and free.
   - Confirm `Disallow: /uploads/` and `/outreach/` actually correspond to real paths, and that
     `.internal-docs/` is not reachable.
4. **Sitemap vs disk vs `_redirects`.** `scripts/verify-redirects.js` covers this — run it and
   report. Additionally: is every indexable page in the sitemap, and is every sitemap URL a live
   200? Any sitemap URL that 301s or 404s is **S2**.
5. **Canonicals.** Every page self-canonical, absolute URL, exactly one per page, no conflict
   between HTML `<link>` and any HTTP `Link:` header. Paginated pages must be **self**-canonical,
   never canonical to page 1.
6. **`*.pages.dev` preview host.** Is the Cloudflare preview domain indexable? robots.txt disallow
   is **not** sufficient to deindex — it needs `X-Robots-Tag: noindex`. Check and report.
7. **Orphan and doorway risk.** Which of the 52 category×area pages are reachable only from the
   sitemap? Google's doorway wording names *"substantially similar pages that are closer to search
   results than a clearly defined, browseable hierarchy."* For each thin category×area page,
   report: word count, how many venues it lists, how many internal links point to it, and how much
   of its text is shared with its siblings. **This is the site's single largest doorway exposure —
   be specific and be fair.**
8. **Index state.** You cannot see Search Console. Do not guess at index counts. Instead report
   what would let Tim check: which URL patterns to inspect, and what a healthy answer looks like
   given that index ratio itself is meaningless.

---

### D · AI SEARCH SURFACES

1. **`llms.txt`.** The file exists. Google ignores it (verbatim, changelog 15 Jun 2026), no AI
   platform has ever claimed to consume it, and a 137,210-domain log study found **97% of llms.txt
   files received zero requests in May 2026** — and **zero requests arrived for files that don't
   exist**, meaning AI systems do not probe for it. It costs nothing to keep. Report it as **S4,
   keep or drop, no impact either way** — and note the one real caveat: Lighthouse's new Agentic
   Browsing category audits for it, which contradicts Google Search. Do **not** recommend expanding
   it, and do not recommend building more files like it.
2. **Extractability.** AI answer engines quote the first specific sentence they can find. For 20
   sampled venue pages: does the opening paragraph contain a concrete, quotable fact — a dated
   price, a clock time, a specific limitation — or does it open with a hedge? Count.
3. **Citation-shaped content.** The only controlled academic evidence (GEO, KDD 2024) found
   quotations, statistics and cited sources improved generative-engine visibility 30–40%, while
   **keyword stuffing scored *below* baseline**. Assess how many pages carry a citable statistic
   or a directly quotable sourced claim. Caveat this properly — it is 2023-era models on a
   synthetic benchmark, and it is not vendor guidance.
4. **Update recency.** Given that 75% of LLM-cited pages were updated within a year and over half
   within three months, report the actual distribution of genuine last-substantive-change dates
   across the 215 records. Not build timestamps — real content change, from git.
5. **Preferred Sources.** The opt-in link was added sitewide. Confirm it is present, correct, and
   uses the domain-level format — subdirectories are not eligible.
6. **What NOT to recommend.** Do not propose content chunking, AI-specific rewriting, brand-mention
   campaigns, or any special markup. Google names all four as unnecessary in a doc updated
   2026-07-10.

---

### E · TECHNICAL AND PERFORMANCE

1. **Page weight against the 2MB Googlebot cap.** Largest page is currently `changelog/index.html`
   at ~164KB — comfortably under. Confirm nothing exceeds 2MB including headers, and flag anything
   over 500KB as a trend to watch.
2. **Inline vs external.** Venue pages currently carry ~13KB of inline `<script>` and zero inline
   `<style>`. Google explicitly recommends externalising heavy CSS/JS because inline bytes count
   against the 2MB HTML budget while subresources have their own. Report total inline JS across
   the site and whether any of it could be external. **S3 at current sizes** — do not overstate.
3. **Head order.** Are `<title>`, meta description, canonical and JSON-LD in the first bytes of
   `<head>`, before any inline CSS or script? Google recommends exactly this.
4. **Cache policy.** `_headers` currently uses `max-age=300` and `max-age=3600`. The site versions
   assets with a `?v=` query (`ASSET_VERSION`), which means **fingerprinted assets could safely
   use `max-age=31536000, immutable`** and are instead being revalidated hourly. Quantify the
   wasted round-trips. Note Cloudflare Pages' own default is `max-age=0, must-revalidate`, and
   that Early Hints (on by default) double-fetches resources that aren't genuinely cacheable.
   **This is likely the single highest-leverage performance finding — measure it properly.**
5. **`_headers` and `_redirects` limits.** Currently 33 and 39 rules against caps of 100 and 2,100.
   Report headroom. Flag any redirect chain — Cloudflare Pages **does not resolve chains**, only
   the first hop applies.
6. **Redirect status codes.** Every permanent redirect must be 301 or 308. Any 302/307 intended as
   permanent is **S1** — those do not transfer the canonical signal.
7. **Security headers.** Verify CSP is hash-based (correct for a static site), check for the
   deprecated `report-uri` without `report-to`, confirm `nosniff` and `frame-ancestors`. Check
   whether HSTS carries `preload` — if it does, note that hstspreload.org now advises against it
   and that removal takes months. Do not recommend COOP/COEP; they are not needed here.
8. **Core Web Vitals.** LCP, INP, CLS only. With no photography, the LCP element is almost
   certainly a font or a text block, and CLS risk is font swap. Check `font-display`, whether fonts
   are self-hosted WOFF2 and subset, and whether every `<img>`/`<svg>` has explicit dimensions.
9. **HTTP/3 and Early Hints.** Both are Cloudflare-side. Confirm HTTP/3 is on (pure user win —
   Googlebot doesn't use it, so there is no crawl risk) and that Early Hints isn't double-fetching.
10. **JS dependency.** The WRS is stateless and clears local storage. Verify no content depends on
    `localStorage`, cookies, or consent state to render — favourites and search are the obvious
    candidates. Content that only appears post-interaction is invisible to Google.

---

### F · THE BUILD CHAIN ITSELF

The build is 98 scripts. It has silently broken things before — mojibake propagated to 306 files
with every gate green, and `check-no-network-links` was a `prebuild` hook that `SHIP-GYM.ps1`
bypassed on every deploy.

1. **Order dependencies.** Which scripts must run after which, and does the chain in `AGENTS.md`
   §Before-every-ship match `CODEX-GYM-ENRICH-LOOP.md` §5 and match `SHIP-GYM.ps1`? **Three
   sources of truth for one chain is a defect** — report every divergence.
2. **Idempotency.** Which scripts are safe to run twice? Run the chain's claims against reality:
   any script that produces different output on a second run without a source change is **S1**.
3. **Silent failures.** Which scripts can fail without a non-zero exit? Which write files without
   checking the write succeeded? Which use `fs.renameSync` over an existing file (breaks on some
   filesystems — `scripts/apply-geo-r73.js:115` is a known instance)?
4. **Dead scripts.** 98 scripts, one chain. Which are never called by `SHIP-GYM.ps1`, `package.json`
   or another script? `bump-and-push.js` is already documented as never-run. List the orphans.
5. **Gate coverage.** For each of the three historical failures — mojibake, sister-site links in
   `.md`, false in-person claims — is there now a gate that would catch a recurrence? Name it. For
   each gate, name the failure it prevents. Any gate that prevents nothing is **S3**.
6. **The gate that is missing.** Given §A, is there a gate for cross-page duplicate prose outside
   `venues/`? `check-record-originality.js` covers venue records only.
7. **Encoding.** `verify-encoding.js` gates mojibake. Does anything in the chain write files
   without an explicit UTF-8 encoding? PowerShell `Out-File` and bare `>` default to the system
   ANSI codepage — that is what caused the 2026-07-27 incident.

---

### G · TRUST, TRANSPARENCY AND CLAIMS

Google's stated trust questions, verbatim: *"Does the content present information in a way that
makes you want to trust it, such as clear sourcing, evidence of the expertise involved, background
about the author or the site that publishes it, **such as through links to an author page or a
site's About page**?"*

1. **The About page is off-domain** at timpaemi.com. Google's own wording asks about *"a site's
   About page."* This is **S2** and cheap to fix. Report what exists on-domain today.
2. **Verify every factual claim the site makes about itself.** The site claims no paid placement,
   dated prices, and a stated verification method. For each claim: is it true, is it verifiable
   from the page, and does the corpus actually deliver it? A claim the site cannot back is **S1** —
   more so since 14 Apr 2026, when spam reports became a manual-action trigger.
3. **Venue count consistency.** Google's indexed title for the homepage still reads **"157 Venues"**
   while the site says 215. Find every place a venue count is hardcoded rather than computed, and
   check `llms.txt`, `humans.txt`, `status.json`, `press/`, meta descriptions and JSON-LD all agree
   with `GYMS.length`.
4. **Methodology page.** Does `/methodology/` describe what actually happens, in enough detail to
   satisfy Google's "How" guidance — which asks for method disclosure *"accompanied by evidence"*?
5. **Closed and unverified venues.** `pattaya-boxing-world` has `status: unverified` in its front
   matter but no status field in `data.js`, so the generator treats it as operating and has
   injected an FAQ block. Find every record where front matter and `data.js` disagree on status.
   **This is S1** — the site is publishing a page as live for a venue it has marked unverified.
6. **Cross-domain links.** Exactly one followed timpaemi.com credit per page, zero sister-site
   links anywhere including JSON-LD, `sameAs` and `.md` files. `check-no-network-links.js` gates
   this — run it and confirm. Note `/about/` and `/press/` legitimately carry two.
7. **Corrections and contact.** Is there a route for a venue to report a wrong price? Is it visible?

---

### H · ACCESSIBILITY

Target **WCAG 2.2 AA**. WCAG 3.0 is a draft and irrelevant. Accessibility is **not** a Google
ranking factor and no primary source claims it is — do not argue it as one. Argue it as: correct
for users, mechanically overlapping with SEO (alt text feeds image search, heading hierarchy and
link text are parsed, crawlable `<a href>` is required for discovery, CLS is both a CWV and a
usability defect), and newly relevant to agent readability since Chrome fused a11y-tree quality
into Lighthouse's Agentic Browsing category.

1. Heading hierarchy: exactly one `<h1>` per page, no skipped levels, across all 355 pages.
2. Colour contrast against the 2026 redesign palette (light canvas, single volt accent) — 4.5:1
   body, 3:1 large text and UI components.
3. Keyboard operability: every interactive element reachable and visibly focused. Check the map,
   search, compare and favourites tools specifically.
4. Link text: count instances of "click here", "read more", "learn more" and bare URLs.
5. Form labels on search, contact and add-your-gym.
6. `lang` attribute present and correct; Thai venue names marked with `lang="th"` where they appear.
7. Every `<img>` and inline `<svg>` has explicit dimensions and a correct `alt` (empty for
   decorative). The site ships no photography — flag any alt text describing an image that does
   not exist.

---

### I · CODE QUALITY AND SECURITY

1. **Secrets.** Scan the whole repo including `.internal-docs/`, `tmp/`, `private/`, `research/`
   and `outreach/` for API keys, tokens and credentials. Confirm `.gitignore` covers them. Any hit
   is **S1**.
2. **What is in git that should not be.** `node_modules/` tracked? Build artefacts? Backup zips?
   `venue-outreach-list.csv` contains venue contact data — is it in git, and is it served?
3. **The ~90 `PUSH_ROUND*.cmd` files.** All superseded by `SHIP-GYM.ps1`. They are **S3** clutter,
   but each one is also a script someone could run by accident against production. Report the
   count and whether any still contains a live push command.
4. **Dependencies.** `npm audit`. Report actual exploitability for a static site with no server —
   most build-time advisories are not real risk. Do not pad the report with them.
5. **Client JS.** ~13KB inline per page. Any `innerHTML` with unsanitised input, any `eval`, any
   inline handler that breaks the hash-based CSP.
6. **Dead code.** Unreferenced CSS in a 71KB `styles.css`, unreferenced JS, unreferenced files in
   the web root (`647720c1a840875fc8363ef71cf5dd4a.txt`, `bd7f2a9c1e48.txt` — verification files?
   Confirm before suggesting anything).

---

### J · WHAT IS NOT BEING CLAIMED

The competitive gaps are real and measured. Report them as opportunities, sized:

1. **Sports with no incumbent** — badminton, racket sports, diving, climbing, equestrian,
   swimming. For each: how many venues does the site already hold, how complete are those records,
   and what is missing to make them the definitive English-language page?
2. **The dated-price moat.** No competitor dates prices. How many of 215 records have one, and
   what is the realistic ceiling?
3. **Venue pages do not surface; guides do.** Only guides appeared in test SERPs. Diagnose why —
   internal linking, thinness, title patterns, or the fact that guides answer a query and venue
   pages answer a name.
4. **The largest structural gap: no transactional capability and no verified UGC.** Both were named
   as table stakes in the March 2026 winner analysis, and TrainAway has the transaction. This is a
   product observation, not an SEO fix. State it plainly and do not propose review markup as the
   answer — review markup is prohibited for this site's model.

---

## 4 · OUTPUT

Write `.internal-docs/AUDIT-2026-07.md`. That is the only file you create. Structure:

```
# PATTAYA-GYM FULL AUDIT — 2026-07-<dd>

## 0 · How to read this
<3 sentences. What you checked, what you could not check, biggest single finding.>

## 1 · The scoreboard
| Domain | S1 | S2 | S3 | S4 | Verdict (one line) |
<one row per domain A–J>

## 2 · S1 — act now
<each finding: what · where (file:line) · count + the exact command · why (dated standard) ·
smallest fix. Ordered by damage.>

## 3 · S2 — upside being left on the table
## 4 · S3 — dead weight
## 5 · S4 — notes

## 6 · NEEDS TIM'S EXPLICIT YES
<anything index-affecting. Downside stated in clicks. One recommendation per item, no bundles.>

## 7 · What I could not check
<Search Console, live CrUX, real rankings, anything needing credentials or a browser. Say what
you would need. Do not guess and do not fill gaps with plausible numbers.>

## 8 · What is already right
<Honest. This site has gates most sites don't. Name them so nobody removes them later.>

## 9 · Commands appendix
<every command you ran, copy-pasteable, so Tim can reproduce any count.>
```

**Report discipline:**

- Every count comes with the command that produced it.
- Every "why it matters" cites a dated source from §2. If you cannot cite one, mark the finding
  **"my judgement, unevidenced"** and say so plainly. That is allowed and useful. Dressing an
  opinion as a standard is not.
- Where the evidence is third-party measurement rather than Google guidance, say which.
- **No severity inflation.** 262 dead FAQ blocks is S3 because Google explicitly says unused
  structured data causes no problems. Calling it S1 to make the report look urgent destroys the
  report's usefulness.
- If a domain is clean, say "clean" in one line and move on. Do not manufacture findings.
- No fix that has not been checked against `CLAUDE.md` and `AGENTS.md`.

Then **stop**. Do not fix anything. Do not build. Do not commit. Do not push.
