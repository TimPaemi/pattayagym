# CODEX — VISUAL DISASTER REPAIR
## Site: pattaya-gym.com · Repo: C:\pattayagym
## Mode: AUDIT + FIX. You can edit ANY file including styles.css.

The site is **live and looks broken** to the owner. The previous "do not touch styles.css" constraint is **lifted**. You have full permission to:

- Edit `styles.css` (currently ~5500 lines, accumulated cruft)
- Restructure HTML in build templates (`build.js`, `build-extras.js`, `build-discovery.js`)
- Add/remove/reorder DOM elements
- Add/remove CSS rules
- Edit `index.html` (homepage hand-written)

The **ONLY** things you must preserve:
- Brand: `PATTAYA.GYM` (with gold dot separator) — this is the editorial wordmark
- Contact info: `info@pattaya-gym.com`, WhatsApp `+66 96 728 6999`, LINE `@timpaemi`
- Google Analytics tag: `G-F5F6KD3XFZ` (Plausible also stays)
- Footer credit: `// Site built & managed by PATTAYA AUTHORITY · TIM PAEMI ★ ©2026`
- 158 venue records in `data.js` and venue MD body content — don't rewrite venue prose
- Routing: `/gyms/{slug}/`, `/category/{slug}/`, `/area/{slug}/`, `/guides/{slug}/`

Everything else is **fair game**. If the design is broken, fix it. If a CSS rule is fighting another CSS rule, reconcile. If the build template generates ugly markup, change it.

---

## CONTEXT — what the user is seeing right now

The site was rebuilt with an "editorial magazine" design language: ink-black background, bone off-white text, gold accent, coral pop, JetBrains Mono `// ` prefixes, massive Inter Tight 900 H1s, hairline cards, no border-radius.

**The implementation has degraded into chaos.** Specific complaints with evidence:

### Desktop bugs (from screenshots)

1. **Nav clips on subpages.** User scrolled and the nav showed `ATTAYA.GYM` (missing the `P`). Root cause: horizontal overflow somewhere causing body scroll. Fix verified to need: cap H1 sizes, force `overflow-x: hidden`, audit for any element wider than its container.

2. **Category page H1 (`GOLF IN PATTAYA`) is gigantic.** Looks like it's overflowing the layout. The clamp was `(48px, 10vw, 140px)` — at desktop widths that's 140px, which is ~1500px wide for "GOLF IN PATTAYA". Container is 1320px. Hence horizontal scroll.

3. **"Hand-picked guides for this category" section is anemic.** Just 2-4 small text pills, no visual weight. Should be proper editorial cards with hover state.

4. **About page had duplicate `// ABOUT` eyebrow** appearing after the `// DIRECTORY > ABOUT` breadcrumb.

5. **Yellow OG image blocks were used as venue card thumbnails.** They're social-media graphics, not photos — look cheap. Should be removed everywhere (cards should be text-only, or use actual photos if you have them).

6. **"Was this page helpful?" feedback widget** at the bottom of venue pages. Should be killed. We don't want feedback widgets.

7. **Inconsistent navigation.** Homepage nav uses one structure (`PATTAYA.GYM` + sport links). Subpages used another (`[P] PATTAYA GYM` brand-mark + generic Directory/About). Should be **identical on every page**.

8. **Bottom marquee** ("FIND YOUR GYM · BOOK A SESSION · TRAIN IN PATTAYA") is in gold and feels too loud. Make it a subtler closer.

### Mobile bugs (user just said "tried on phone as well, it's a disaster")

The user reports mobile is broken. Specifically known issues:
- Hero H1 might be too big at narrow widths
- Hamburger menu might not toggle properly
- Cards might have wrong card padding (some were assuming a leading image that's now removed)
- Text overlapping with sticky nav
- Touch targets under 44×44px
- Horizontal scroll on mobile (same overflow bug as desktop)
- Mobile sticky bottom action bar overlapping content

### General quality bugs (suspected from accumulated CSS)

- `styles.css` is ~5500 lines and has multiple `!important` overrides fighting each other
- Multiple `.cat-venue-card` rule blocks (venue.css injects some, styles.css overrides with `!important`)
- Multiple breakpoint passes layered (some at 720px, some at 480px, some at 360px)
- Functions like `pageFeedbackHtml()` returning empty strings but still emitting wrapper divs

---

## YOUR JOB — fix everything visible

Be ruthless. The site needs to **look as good as it reads**. Right now it doesn't.

### Specific fix queue

#### A. Layout sanity
1. Pick ONE max-content-width (suggest 1280px). Apply everywhere via a single `.wrap` / `.container` class. Kill all conflicting `max-width` declarations.
2. Pick ONE page padding ladder (e.g., 32px desktop / 24px tablet / 20px mobile). Apply consistently.
3. Force `overflow-x: hidden` on `html, body, .venue-page, main`. **No element should ever cause horizontal scroll.**
4. Every container has `box-sizing: border-box` and `max-width: 100%`.

#### B. Typography rationalization
5. Pick ONE H1 scale that works at 320px through 2560px. Suggest `clamp(36px, 6vw, 88px)` for content pages, `clamp(40px, 9vw, 140px)` for the homepage hero.
6. Every H1, H2, H3 gets `word-wrap: break-word; overflow-wrap: break-word; max-width: 100%`.
7. Body text: 15-16px base, 1.55-1.65 line-height. No smaller than 13px anywhere except mono labels (which can go 11px minimum).
8. Audit every `clamp()` declaration. If it produces output > viewport width at any breakpoint, fix.

#### C. The single nav, the single footer
9. Define nav as a SHARED helper function used by build.js + build-extras.js + build-discovery.js. Currently the same HTML is duplicated in 3 files and drifts. Same for footer.
10. Nav structure must be:
    ```html
    <nav class="nav">
      <div class="nav-row">
        <a href="/" class="brand">PATTAYA<span class="dot">.</span>GYM</a>
        <ul class="nav-links">
          <li><a href="/category/muay-thai/">Muay Thai</a></li>
          <li><a href="/category/fitness/">Gyms</a></li>
          <li><a href="/category/golf/">Golf</a></li>
          <li><a href="/category/yoga/">Yoga</a></li>
          <li><a href="/guides/">Guides</a></li>
          <li><a href="/map/">Map</a></li>
        </ul>
        <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
        <a href="/search/" class="nav-cta">FIND A SPOT →</a>
      </div>
    </nav>
    ```
11. On mobile: hamburger toggles `.nav-links.open` as a position-absolute drop-down below nav. Brand left, hamburger + CTA right. No `order: -1`.

#### D. Card system unification
12. There are multiple card classes: `.cat-card`, `.cat-venue-card`, `.related-card`, `.nearby-card`, `.linkup-card`, `.area-card`, `.latest-card`, `.voice-card`, `.cv-pill`. Pick one card system. Apply uniform paddings (28px desktop, 22px mobile). Kill the inconsistent ones.
13. Cards have NO border-radius (this is the editorial rule). NO box-shadow. Hairline 1px borders only. Background flips ink ↔ ink-2 on hover.
14. NO OG image at top of cards. Cards are text-only.

#### E. Section rhythm
15. Section padding consistent: 80-120px desktop, 56-72px mobile.
16. Sections alternate `--ink` and `--bone` backgrounds for rhythm. Currently inconsistent.
17. Every section starts with `// MONO EYEBROW` (coral `//` + gold uppercase label). Pattern is consistent for the editorial feel.
18. NO duplicate eyebrows (about page bug). Breadcrumb is breadcrumb, eyebrow is eyebrow.

#### F. Mobile-specific
19. Test at 320, 360, 414, 480, 600, 720 widths. Every page must render without horizontal scroll.
20. Touch targets ≥ 44×44px.
21. Hamburger menu: tap toggle, full-width drop-down beneath nav. Not pushed inline.
22. Sticky bottom action bar (`.sticky-actions`) only shows on mobile. Body gets `padding-bottom: 70px` so content doesn't slide under.
23. H1 caps at ~40px on small phones. H2 at ~28px. Body 15-16px.
24. NO emoji-only meta lines that mash together (`📍 Address🕐 Hours💰 Price`). Use proper line breaks or stack vertically.

#### G. Curated guides + listicles
25. The "Hand-picked guides for this category" section must look like an actual feature, not 2 stray pill links. Make it a 4-column grid (2 on tablet, 1 on mobile) with proper card padding, eyebrow `// GUIDE`, large title, hover state.

#### H. Kill remnants
26. Remove `pageFeedbackHtml()` calls entirely from build templates (don't leave empty wrapper).
27. Remove `venue-hero-img` (`.cv-img`) — these were OG images used as visuals, they look bad.
28. Remove any references to `newsletter`, `Buttondown`, `subscribe`. Strip from CSS, build templates, generated HTML.
29. Remove the `.brand-mark` yellow square (currently `display: none` but lingering in markup). Use the editorial wordmark only.

#### I. Marquee tuning
30. Top marquee: subtle, ink background, 11-12px mono. 8 copies of content so it never gaps on wide screens.
31. Bottom marquee: subtler than current. Either drop the gold band or make it ink-on-bone with gold stars. Currently it dominates the page below the content.

#### J. Build chain hygiene (do this last, only if time)
32. Move the duplicate `header()`, `footer()`, `escHtml()`, `criticalCss()` into a `_shared.js`. Currently they exist in 3 files and drift.
33. Bump `ASSET_VERSION` once at end of fix pass. Currently at 226.
34. Run `node build.js` to confirm clean.
35. Verify two consecutive builds produce byte-identical output.

---

## METHOD

1. **Read styles.css end to end.** It's 5500 lines but it's the source of the chaos. Get a feel for what's there.
2. **Look at the actual rendered HTML** of a category page, an area page, a guide page, a venue page. Don't trust the build templates — look at the output.
3. **Test in a mental render at 320px viewport.** Where does anything overflow? Where do elements touch? Where is text smaller than 13px?
4. **Refactor styles.css** into a coherent system. You can write a new one if cleaner. Don't lose any class names that exist in the HTML (or update the HTML in build templates too).
5. **Run the build after every meaningful change.** `node build.js`. Verify it passes.
6. **Spot-check the output** by reading a few generated HTML files. Confirm they look right.

---

## OUTPUT

When done, write `CODEX_VISUAL_FIX_REPORT.md` with:
- What was broken (bullet list)
- What you changed (per file, per fix)
- Final stats: `styles.css` line count, asset version, build status
- Screenshots impossible from here — but spec the dimensions you targeted

Do not commit. Do not push. Local fix only. The user reviews diff first.

---

## EXTREMELY IMPORTANT

The user has lost trust in the visual quality. **Don't ship anything that creates more bugs.** Test mentally at every breakpoint. If your fix introduces a new issue, fix that too before moving on.

When you're done, the site should look like a **legitimate editorial directory** — Coconuts Bangkok / The Thaiger / Time Out-tier. Magazine. Lean. Readable on phone. Fast. Not "AI-built site that doesn't quite work."

Go fix it.
