# Codex Visual Fix Report — 2026-05-15

## What was broken
- Subpage navigation and hero areas could visually clip because oversized decorative hero art and large clamps extended beyond the viewport.
- Generated pages used a different nav/footer structure from the homepage, including legacy brand-mark remnants and old footer/newsletter patterns.
- Category venue cards still assumed image-led card layouts and used generic "View full page" CTAs.
- Category guide links rendered as thin pills instead of proper editorial cards.
- Venue/category metadata used emoji-leading fragments that wrapped poorly on phones.
- The about page repeated the About eyebrow immediately after the breadcrumb.
- Mobile tap targets were inconsistent on nav, breadcrumbs, card links, favorite buttons, map pins, and footer/body text links.
- The bottom marquee and old compatibility CSS were still loud and/or fighting the main stylesheet.

## What changed
- Added `C:\pattayagym\_shared.js` with the shared editorial nav, top marquee, bottom marquee, and footer used across generated pages and static pages.
- Updated `C:\pattayagym\build.js`, `C:\pattayagym\build-extras.js`, and `C:\pattayagym\build-discovery.js` to use the shared chrome, asset version `227`, text-only metadata labels, descriptive card CTAs, no feedback widget output, and no decorative `venue-hero-art`.
- Rebuilt all generated venue, category, area, guide, utility, API, feed, and sitemap output.
- Reworked the end of `C:\pattayagym\styles.css` into a stable editorial chassis: 1280px wrap, consistent padding ladder, overflow guards, capped H1 scales, unified card behavior, mobile dropdown nav, proper guide cards, touch-target hardening, and long-link wrapping.
- Updated `C:\pattayagym\index.html`, `C:\pattayagym\compare\index.html`, and `C:\pattayagym\colophon\index.html` to use the shared chrome and `?v=227` assets.
- Updated `C:\pattayagym\site-ui.js` so the hamburger script binds to the shared `.nav` and the back-to-top visible class matches CSS.
- Updated `C:\pattayagym\sw.js` to `pattaya-gym-v227-20260515` and refreshed cached asset URLs.
- Replaced `C:\pattayagym\venue.css` with a no-op compatibility stylesheet so old page references do not 404 but active card styling lives in `styles.css`.
- Removed newsletter/Buttondown/subscribe remnants from shipped source/output and removed the about-page duplicate eyebrow from the generator.

## Final stats
- `styles.css`: 5,795 lines, 149,221 bytes.
- Asset version: `227` in all three build files, static page refs, and service worker cache.
- Build status: PASS.
- `node --check build.js`, `node --check build-extras.js`, `node --check build-discovery.js`: PASS.
- `node validate.js`: PASS with 0 errors and 166 existing optional venue-data warnings.
- Determinism: PASS. Two consecutive full builds produced byte-identical hashes for generated HTML/CSS/JS/JSON/XML/TXT/YAML outputs.
- Git diff before this report: 220 tracked files changed, 19,480 insertions, 21,785 deletions, plus new `_shared.js`.

## Responsive verification
- Used local Edge/Chrome DevTools Protocol against local file output; no network fetches.
- Targeted widths: 320, 360, 414, 480, 600, 720, 1024, 1320, 1920, 2509.
- Sampled pages: `/`, `/category/golf/`, `/about/`, `/gyms/fairtex-pattaya/`, `/guides/best-muay-thai-pattaya/`, `/area/jomtien/`, `/compare/`, `/map/`.
- Result: sampled pages held document `scrollWidth` at or below viewport width. Remaining ignored overflow was intentional clipped marquee/Leaflet internals, not page-level horizontal scroll.

## Files created
- `C:\pattayagym\_shared.js`
- `C:\pattayagym\CODEX_VISUAL_FIX_REPORT.md`

## Files deleted
- None.

## Notes for Claude/review
- `styles.css` still contains older rules above the final chassis block. The final cascade now wins, but a future cleanup could delete dead historical sections once the visual result is approved.
- `node validate.js` warnings are pre-existing optional data/frontmatter gaps, not introduced visual regressions.
- The generated output is large because the shared nav/footer and template changes touched all generated pages.
