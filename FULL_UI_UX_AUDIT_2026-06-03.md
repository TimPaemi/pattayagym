# Full UI/UX audit — pattaya-gym.com

**Date:** 2026-06-03  
**Scope:** Visual design, navigation, touch targets, tools (search/compare/plan/map), venue pages, accessibility, perceived performance — **desktop and mobile**.  
**Production:** https://pattaya-gym.com/ (v452, post Round 90)  
**Methods:** Code review (`styles.css`, `site-ui.js`, templates), live browser (390×844 mobile, 1280×800 desktop), Lighthouse 12.6.

---

## Executive summary

Pattaya.Gym delivers a **distinct, high-trust editorial experience** on a consistent dark design system. Accessibility and layout stability are **production-grade** (homepage mobile: **100 a11y**, **CLS 0**, **SEO 100**). The main UX debt is **wayfinding consistency** (homepage nav differs from the rest of the site), **search-page load cost** (157 cards in DOM), **very long venue pages** on mobile, and a few **CSS token gaps** (`--card`, `--border` undefined).

**Overall grades (subjective 1–10)**

| Area | Desktop | Mobile |
|------|---------|--------|
| Visual design | 9 | 9 |
| Navigation & IA | 7 | 7 |
| Touch targets | 8 | 7 |
| Venue detail UX | 7 | 6 |
| Tools (search/compare) | 7 | 6 |
| Accessibility | 9 | 9 |
| Performance (felt) | 7 | 7 |
| Scannability | 8 | 7 |

---

## Lighthouse (live production)

| Page | Form factor | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|------|-------------|---------------|---------------|----------------|-----|-----|-----|
| `/` | Mobile | **86** | **100** | **100** | **100** | 3.7 s | **0** |
| `/` | Desktop | **72** | **100** | **100** | **100** | 2.3 s | — |
| `/search/` | Mobile | **76** | **98** | — | — | Poor (≈55 score) | **0** |

Earlier Codex notes cited homepage CLS **0.343** and search **0.490**; Round 7+ reservations in `styles.css` (`.marquee`, `.btn-row`, `.pa-network`, `.result-card`) appear to have **resolved CLS** on current production.

---

## Design system

### Strengths

- **Tokens:** Surfaces, accents (pink/cyan/mint/yellow), spacing scale, `--max: 1280px`, responsive `--pad` (22px → 40px).
- **Typography:** `clamp()` on heroes; Space Grotesk display + Inter body; mono for labels/metadata.
- **Motion:** `prefers-reduced-motion` disables animations and smooth scroll; marquee can be paused.
- **Focus:** Global `:focus-visible` cyan outline; skip link visible on keyboard focus only.
- **Dark mode:** `color-scheme: dark`, `theme-color` #000, no flash of light theme.

### Issue — undefined CSS variables (P0)

`.intent-card`, `.guide-price-table-wrap`, and related blocks use `var(--card)` and `var(--border)`, but **`:root` does not define them**. Browsers treat invalid declarations as absent, so cards may render with **missing background/border** depending on cascade.

**Fix:** Add to `:root`:

```css
--card: var(--surface-2);
--border: var(--line);
```

---

## Navigation & information architecture

### Desktop (≥900px)

- Sticky nav with blur backdrop; center **nav-links** on category pages (`Muay Thai`, `Fitness`, `Golf`, `Guides`, `Search`).
- **Homepage exception:** Desktop links point to **in-page anchors** (`#sports`, `#areas`, `#operate`, `#contact`) instead of `/sports/`, `/area/…`, `/about/`. Users leaving the homepage see a **different nav model** — cognitive friction.

### Mobile (<900px)

- **Burger + full-screen overlay** (`nav-mobile`): `hidden` by default, `body.nav-open` locks scroll, **Escape** closes, first link focused on open — solid pattern.
- **nav-cta** “★ Find a gym” remains visible beside burger — good primary action, but row is crowded on narrow phones (~390px).
- Mobile menu includes **Plan / Compare / Changelog**; desktop category nav on inner pages does **not** surface Compare or Plan in the top bar (only mobile menu + footer).

### Breadcrumbs

- Present on venues, guides, tools — good.
- **Tap targets ~13px tall** on mobile (below 44×44 WCAG target size). Readable but hard to tap.

---

## Homepage UX

### Hero

- Strong value prop; **5 CTAs** in `.btn-row` (Find gym, Best MT, All camps, Compare, Guides). Mobile reserves `min-height: 120px` — good for CLS.
- **Recommendation:** On mobile, collapse tertiary CTAs into a single “More tools” or keep 2 primaries above the fold.

### New (Round 88) — area hub

- Six area cards + fitness/golf/best Muay Thai — **excellent mobile grid** (`intent-grid` `minmax(240px, 1fr)` stacks to one column).
- Reduces reliance on footer-only area discovery.

### Length

- Homepage is **long** (many sections: intent router, sports grid, network, pa-network, sister-context). Acceptable for SEO hub; mobile users need **progress indicator** or sticky section jump (optional).

---

## Venue pages (sample: Fairtex)

### Strengths

- Trust bar: Editor’s pick, **live open/closed** from hours JSON, verified date, methodology link.
- Primary actions: Call (venue tel), Map, Website, Share, Favorites.
- Taxonomy pills (category / area / browse), nearby block (157/157), tools strip, guide links — strong **internal UX mesh**.

### Mobile friction

- Document height **~33,000px** on mobile — excellent for SEO, heavy for **decision-making**.
- **6 buttons** in hero row (Call, WhatsApp, Email, Map, Website, Share) — all ≥48px tall (good taps), but visually noisy.
- **WhatsApp** uses site operator number (`+66 96 728 6999`), not venue line — label says “WhatsApp us” which may **surprise** users expecting the gym.

### Horizontal TOC / jump links

- Numbered section pills scroll horizontally (scrollbar hidden) — works, but easy to miss on first visit.

---

## Tool pages

### Search (`/search/`)

- Searchbox with placeholder examples; category **chip buttons**; filter panel stacks on mobile (`max-width: 700px`).
- **157 result cards** rendered in `.search-results` grid — explains **lower mobile performance (76)** and weak LCP subscore.
- **Recommendations:** Pagination, “load more”, or virtualized list; defer off-screen card images if added later.

### Compare (`/compare/`)

- Functional: 4 slot selects, share URL, presets, `overflow-x:auto` on table mount.
- **Gap:** No `.compare-table` / `.compare-picker` rules in `styles.css` — table typography and sticky header row are **browser-default**, harder to scan on phone (wide horizontal scroll).

### Plan / Map / Favorites

- Built as real tools with external JSON payloads (per changelog) — not re-audited in depth this pass; expect same nav/footer chrome as compare.

---

## Accessibility

| Check | Status |
|-------|--------|
| Skip to content | Pass |
| Landmark roles (`banner`, `main`, `contentinfo`) | Pass |
| Mobile menu `aria-expanded` / `aria-controls` | Pass |
| Search `role="searchbox"` | Pass |
| Color contrast (Lighthouse) | **100** on homepage |
| Reduced motion | Pass |
| Form labels (compare selects) | Pass |

**Minor:** Some venue inline links in table of contents use low contrast muted greys; audit with axe on longest guide pages if needed.

---

## Performance & perceived speed

- **Self-hosted WOFF2**, preload display font on venues — good.
- **No horizontal overflow** on tested venue page (mobile).
- **Analytics** deferred (`analytics.js`) — good for TBT (homepage TBT score 100).
- **Search** is the heaviest interactive page for mobile users — prioritize if optimizing “find a gym” funnel.

---

## Prioritized recommendations

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| **P0** | Define `--card` / `--border` in `:root` | Low | Visual consistency on cards/tables |
| **P1** | Unify homepage desktop nav with global links | Low | IA consistency |
| **P1** | Search: paginate or virtualize results | Medium | Mobile perf + LCP |
| **P2** | Styles for `.compare-table` (sticky first col, zebra, min-width) | Medium | Compare UX on phone |
| **P2** | Venue: sticky mini-nav or collapsible “Overview” | Medium | Mobile scroll fatigue |
| **P2** | Enlarge breadcrumb / brand tap padding | Low | Mobile usability |
| **P3** | Clarify WhatsApp CTA (“Ask Pattaya.Gym” vs gym) | Low | Trust |

---

## Suggested Round 91+ (UX-only slice)

1. CSS token fix + compare table stylesheet.  
2. Homepage `nav-links` alignment with `build-v2` shell.  
3. Search pagination (e.g. 24 per page + “Load more”).  
4. Optional: venue hero max **3** visible CTAs on mobile (rest in “More actions” menu).

---

*Generated from local audit pass; Lighthouse JSON artifacts: `_lh-mobile-home2.json`, `_lh-mobile-search.json`, `_lh-desktop-home.json` (not committed).*
