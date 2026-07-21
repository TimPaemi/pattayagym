# pattaya-gym.com — Growth Playbook 2026

**The problem this solves:** the site is technically excellent after 22 build
rounds, but technical quality does not bring visitors. Nothing so far has been
*off-page*. This playbook is the off-page half — getting found, getting linked,
getting cited. It is written to be worked top to bottom. Most of it is free and
costs only time.

Owner: Tim · Site: https://pattaya-gym.com · Network: TimPaemi Co., Ltd.

---

## Phase 1 — Foundations (Week 1, ~2 hours, do this first)

Until these are done you are flying blind — you cannot see what Google sees.

### 1.1 Google Search Console — the single most important account

1. Go to `search.google.com/search-console`, sign in with your Google account.
2. Add a property → choose **Domain** → enter `pattaya-gym.com`.
3. It gives you a TXT record. You are on **Cloudflare**, so: Cloudflare
   dashboard → pattaya-gym.com → DNS → add the TXT record → verify. Takes minutes.
4. Once verified: **Sitemaps** → submit `sitemap.xml`. (Just `sitemap.xml` —
   Round 22 deliberately removed the stale ones.)
5. Leave it. In 3–7 days it starts showing **impressions, clicks, queries, and
   average position**. That data is the steering wheel for everything below.

### 1.2 Bing Webmaster Tools — this is also your ChatGPT strategy

Bing is small for search, but **ChatGPT Search and Microsoft Copilot run on
Bing's index**. If you want to be cited by ChatGPT, you must be indexed well by
Bing.

1. `bing.com/webmasters` → sign in.
2. Add `pattaya-gym.com` → **import from Google Search Console** (one click,
   carries the verification over).
3. Submit `sitemap.xml`.
4. Turn on **IndexNow** (Bing Webmaster offers it). Cloudflare also has a free
   IndexNow integration — enable it under the Cloudflare domain → Settings.
   IndexNow pings Bing instantly whenever a page changes.

### 1.3 Confirm GA4 is actually recording

You had GA4 display trouble before. Open Analytics → Reports → Realtime, load
your own site in another tab, confirm you appear. If Reports still looks empty,
the snapshot template was never chosen — Reports → "User behaviour" → *Choose
this template*.

**Phase 1 done = you can now measure. Do not skip ahead without it.**

---

## Phase 2 — The local entity (Week 1, ~1 hour)

You have a **physical presence in Pattaya** — use it. A web directory itself is
not eligible for a Google Business Profile, but **TimPaemi Co., Ltd.** (the
agency) is — as a "Media company" / "Internet marketing service."

1. `business.google.com` → create a profile for **TimPaemi Co., Ltd.**
2. Category: Media company (or Internet marketing service).
3. Add the registered Pattaya address, hours, phone, and — in the profile's
   website + posts — link to `pattaya-authority.com` and the directories
   including `pattaya-gym.com`.
4. This creates a verified local business *entity* that Google trusts, and it
   anchors the whole network to a real Pattaya address. It also strengthens the
   `Organization` schema already on every site.

This is an authority signal a scraper can never fake. It is your moat made
visible.

---

## Phase 3 — The venue backlink campaign (Weeks 2–6, highest ROI)

This is the big one. Backlinks are still the #1 off-page ranking factor, and you
have a **built-in, ethical, easy source competitors do not have: the 158 venues
themselves.**

Roughly 105 of your venues have their own websites. You have given each one a
free, professional, well-built listing. Most small gyms and camps will happily
link to "as featured on pattaya-gym.com" — it is social proof *for them*.

**The play:**

1. Export the venues that have a website (from `data.js` — I can generate this
   list for you as a spreadsheet on request).
2. Email each one. Realistic conversion: 15–30% will link back. Even 20% of 105
   = **~20 relevant, local, topical backlinks** — that is a serious month of
   link-building done in evenings.
3. Track replies in a simple sheet: Venue · Emailed · Replied · Linked.

**Copy-paste outreach email:**

> **Subject:** Your gym is featured on Pattaya.Gym
>
> Hi [Venue name] team,
>
> I run pattaya-gym.com — an independent, no-paid-placements directory of every
> sport and training venue in Pattaya. I have written up a full free listing for
> you here: [https://pattaya-gym.com/gyms/SLUG/]
>
> There is no charge and nothing to do. If anything on the page is out of date
> — hours, phone, prices — just reply and I will fix it within a few days.
>
> If you would like to show visitors you are listed, you are welcome to link to
> your page from your website or socials ("Featured on Pattaya.Gym"). It helps
> people find you and helps the directory too.
>
> Thanks for what you do for sport in Pattaya,
> Tim — pattaya-gym.com

Doing this also improves your **data quality** (venues reply with corrections —
that kills the "Verify"/"Stub" placeholders for free) *and* earns links. Two
problems, one campaign.

---

## Phase 4 — The sister-network cluster (Week 2, ongoing)

You have 10+ Pattaya sites. Right now they link each other in **footers** only.
Footer links are weak. **In-content editorial links are strong.**

- On `pattaya-restaurant-guide.com`, in articles about Jomtien or Pratamnak,
  link naturally to pattaya-gym.com ("burn off the pad thai — here are the gyms
  nearby").
- On `pattayavisahelp.com`, long-stay-visa content → "settling in Pattaya"
  naturally links to the gym, coffee, school guides.
- `pattayastream.com` content → embed/link the directories.
- Goal: every site links every other site **at least once from inside an
  article**, not just the footer.

This is free, fully under your control, and turns 10 separate sites into one
authority cluster Google reads as a real local publisher.

---

## Phase 5 — Community seeding (Weeks 2–8, ~30 min/week)

Be genuinely helpful in places Pattaya questions get asked. Never spam — answer
the question, link only when it truly helps.

- **ASEAN NOW forum** (formerly ThaiVisa) — health & fitness / Pattaya sub-forums.
- **Reddit** — r/Pattaya, r/Thailand, r/MuayThai (people constantly ask "best
  gym in Pattaya for X").
- **Facebook groups** — Pattaya expat groups are huge; answer "where should I
  train" questions with a real recommendation + the relevant page.
- When someone asks a question your site answers, that is the moment to link.

These are not "backlinks" in the SEO sense (mostly nofollow) but they drive
**real referral traffic** and brand searches — and brand searches are a signal
Google weighs heavily.

---

## Phase 6 — Content cadence (ongoing — one piece every 1–2 weeks)

Guides are what rank for long-tail queries and what AI engines quote. Pick the
next topic from real demand (Search Console's query report will tell you what
people already almost-find you for). Strong candidates right now:

- "Muay Thai Pattaya price" / cost comparison
- "Train Muay Thai Pattaya 1 week / 1 month" (trip-length intent)
- "Pattaya gym day pass" deep-dive
- Per-area "best gym in Jomtien / Pratamnak" explainers
- Seasonal: "Pattaya fitness in rainy season"

Ask me and I will draft any of these to the same standard as your existing
guides.

---

## Phase 7 — The weekly measurement loop (15 min every Monday)

1. Open Search Console → Performance. Note total clicks vs last week.
2. Look at **Queries** — what are you ranking 5–20 for? Those are the
   *almost-winning* keywords. A small content tweak can push them to page 1.
3. Look at **Pages** — which pages get impressions but no clicks? Their title or
   description needs work.
4. Check GA4 once for traffic sources.
5. That is it. Let data, not guessing, choose the next move.

---

## The 30-day checklist

**Week 1**
- [ ] Google Search Console verified + `sitemap.xml` submitted
- [ ] Bing Webmaster Tools verified (import from GSC) + sitemap submitted
- [ ] IndexNow enabled (Cloudflare)
- [ ] GA4 confirmed recording
- [ ] Google Business Profile created for TimPaemi Co., Ltd.
- [ ] Run `node scripts\geocode-venues-v2.js`, then re-push (finishes venue geo)

**Week 2**
- [ ] Venue-website list exported (ask me — I will build the spreadsheet)
- [ ] First 25 venue outreach emails sent
- [ ] One in-content link added between each pair of sister sites
- [ ] First forum/Reddit/FB answer posted

**Week 3**
- [ ] Next 25 venue emails sent; replies logged + data corrections applied
- [ ] One new guide published
- [ ] First Search Console data reviewed

**Week 4**
- [ ] Remaining venue emails sent
- [ ] Second new guide published
- [ ] Weekly measurement loop is now a habit

---

## What I (Claude) can do for you on request

- Build the **venue-website outreach spreadsheet** from `data.js` (venue, page
  URL, website, email if known) — ready to mail-merge.
- Draft any **guide** from Phase 6 to your existing standard.
- Build a real **"Find My Coach" or "Plan My Trip"** tool (currently hidden
  stubs) — a genuine feature worth linking and citing.
- Write **outreach copy** for forums, FB, or sister-site articles.

What only you can do: send the emails, make the calls, post in the groups,
create the GBP. That is the real-world half — and it is the half that finally
moves the numbers.

---

*The site is built. This is how it gets found.*
