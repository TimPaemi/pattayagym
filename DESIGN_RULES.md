# Pattaya Gym — Design Rules

**Locked.** Every template must follow these. Any deviation requires an explicit written change to this document before code is written.

---

## 1. Brand

- **Brand mark**: `Pattaya.Gym` (lowercase-friendly title case)
- **Brand mark CSS**: `font-weight:800; letter-spacing:-0.03em; color:#0A1220; font-size:18px`
- **The dot is always orange `#C84A0A`** — wherever the brand appears: header, footer, favicon, OG image
- Never use ALL CAPS for the brand. Never display it bigger than 18px in chrome.

## 2. Colors (single source of truth)

| Token | Value | Use |
|---|---|---|
| `--blue` | `#0057B8` | Primary CTA, brand emphasis, focused state |
| `--blue-deep` | `#032B5C` | Reserved |
| `--blue-soft` | `#eff6ff` | Soft blue chip background, brand-tag pill |
| `--orange` | `#C84A0A` | Brand dot, stats numbers, accent moments |
| `--orange-soft` | `#fff5ec` | Fitness category icon background |
| `--ink` | `#0A1220` | Primary text |
| `--muted` | `#526174` | Secondary text, meta |
| `--hint` | `#94a3b8` | Placeholder, tertiary text |
| `--bg` | `#ffffff` | Page background |
| `--surface-alt` | `#f8fafc` | Section alternation |
| `--line` | `#e2e8f0` | Subtle border |
| `--star` | `#f59e0b` | Rating star |
| `--star-bg` | `#fffbeb` / `--star-text` `#92400e` | Rating pill |

No hex codes anywhere outside `:root` declaration. Components reference tokens only.

## 3. Typography

- Family: `Inter, system-ui, -apple-system, sans-serif` (Google Fonts CDN preloaded)
- **Sentence case everywhere.** Never display ALL CAPS. Mono labels excepted (e.g. `EMAIL`, `WHATSAPP`, `LINE`).
- Hero H1: `clamp(32px, 8vw, 52px) / 1.04 / 800 / -0.04em`
- Section H2: `clamp(22px, 6vw, 30px) / 1.08 / 800 / -0.03em`
- Card title (H3): `15-16px / 700 / ink`
- Body: `16px / 1.55-1.6 / muted`
- Meta: `13px / 1.5 / muted`
- Tag / pill: `11-12px / 500-700`
- No font sizes below 11px.

## 4. Spacing

- Mobile container side-padding: `22px`. Desktop: `32px`.
- Max container width: `1184px`, auto-centered.
- Section vertical padding: `48px` mobile, `64px` desktop.
- Card padding: `20-22px`.
- Card gap: `12px`.
- Touch target: minimum `44px`.

## 5. Component patterns

- **Card radius**: `22px` (xl).
- **Pill radius**: `999px`.
- **Button radius**: `14-18px`.
- **Card border**: `1px solid #e2e8f0`, white background.
- **Card hover**: `border-color: #0057B8`, `transform: translateY(-2px)`, `box-shadow: 0 4px 16px -4px rgba(10,18,32,0.12)`.
- **Primary button**: `background:#0057B8; color:#fff; border-radius:14px; padding:12px 20px; font-weight:600`.
- **Secondary button**: `background:#fff; color:#0A1220; border:1.5px solid #0A1220; border-radius:14px`.
- **Brand tag** (e.g. category label on venue card): `background:#eff6ff; color:#0057B8; font-weight:600; padding:5px 11px; border-radius:999px`.
- **Generic tag**: `background:#f1f5f9; color:#1e293b; font-weight:500; padding:5px 11px; border-radius:999px`.

## 6. Universal page chrome

Every page, top to bottom:

1. **Sticky header**: brand left, 2 round icon buttons right (search + menu). `40px × 40px`. Grey background for search, ink background for menu.
2. **Main content** — page-specific.
3. **Dark contact card** (only on homepage and info pages, not every page).
4. **Footer**: light grey background, brand mark, single-line tag, divider, copyright.

No marquees. No mono `// SECTION 01` labels. No scrollbars visible anywhere. No service worker. No `!important` in CSS.

## 7. Page-type templates

- **Homepage**: hero w/ search → stats card → categories → top picks → why us → contact → footer
- **Category page**: breadcrumb → hero (icon + name + count) → filter chips (wrap, no scroll) → quick pick → all venues → curated guides → footer
- **Venue page**: breadcrumb → hero (name + rating + meta) → 3 contact CTAs → quick info card (hours/price/area/level) → about body → nearby venues → footer
- **Guide page**: breadcrumb → hero (title + date) → TOC card → numbered list → footer
- **Search page**: hero search → quick chips → results list → popular searches → footer
- **Info page** (about/contact/methodology/press/etc.): breadcrumb → small hero → body prose → contact card → footer

## 8. SEO contract (every page)

Required in every `<head>`:

- `<title>` — page-specific, 50-60 chars
- `<meta name="description">` — 150-160 chars
- `<meta name="theme-color" content="#0057B8">`
- `<link rel="canonical" href="...">`
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- Twitter Card: `summary_large_image`
- Google Analytics tag `G-F5F6KD3XFZ` on every page

Required in `<body>`:

- One `<h1>` per page (never more)
- Semantic markup: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
- Skip link to `#main` first DOM element
- JSON-LD structured data:
  - Homepage: `WebSite` + `Organization`
  - Venue: `LocalBusiness` (or `SportsActivityLocation`) with `name`, `address`, `geo`, `priceRange`, `openingHours`
  - Category / area: `ItemList`
  - Guide: `Article`
  - All subpages: `BreadcrumbList`
- Image `alt` on every meaningful `<img>`; decorative SVGs get `aria-hidden="true"`
- Internal linking density: every page links back to home + parent category/area; every venue links to its category

## 9. Performance contract

- LCP < 2.5s on mobile 4G
- CLS < 0.1
- TBT < 200ms
- Page weight < 100KB transferred per page (excluding fonts + images)
- One `styles.css`. No `venue.css`. No service worker.
- Inter loaded via `font-display: swap` with system fallback chain.
- All SVG icons inlined or lucide-static (no separate icon font requests).
- Lighthouse mobile budget: Performance ≥ 90, Accessibility ≥ 95, Best Practices = 100, SEO = 100.

## 10. Workflow rules

- **Branch isolation**: every visual change goes through `redesign-2026` branch with Cloudflare preview deploys. Live `pattaya-gym.com` stays on `main` until explicit merge approval.
- **Pre-push gate**: `node scripts/verify.js` must pass. CI also runs it on every push.
- **One CSS file**: `styles.css`. Touching it is a deliberate act, never a sprawl.
- **No Codex on design**: Codex stays on data, research, audits, technical fixes only. Visual changes are written by hand with explicit screenshot approval per commit.
- **One concern per commit**: never combine "fix marquee + adjust FAQ + tweak spacing" into one push. If verify fails or a regression appears, the diff is small enough to bisect.
- **Asset versioning**: bump `ASSET_VERSION` once per release. One script (`bump-and-push.js`) updates all references.
- **Screenshot per push**: every redesign-2026 push gets a screenshot from the Cloudflare preview URL before the next push.

---

This document is the contract. Templates that violate it get rejected at gate review. The rules cost nothing to follow up front and prevent every category of regression we've hit.
