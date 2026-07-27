# Pattaya.Gym brand kit

**Scope: this repository only.** These assets, generators and the palette are for
pattaya-gym.com and nothing else. Do not copy them into another repo, do not
register them in a shared design system, and do not modify any folder outside
`C:\Projects\pattayagym`.

---

## What is here

`brand-kit/`
- `pattaya-gym.css` — the palette, with measured contrast ratios in the header
- `generators/build-logo.py` — emits every SVG from the variable font
- `generators/rasterize.mjs` — SVG → PNG at exact pixel sizes
- `generators/og.mjs` — builds the 1200×630 social card
- `generators/build-press-kit.reference.js` — copy of the shipped press-kit script

`brand/` (served, and zipped for download at `/brand/pattaya-gym-press-kit.zip`)
- `logo-lockup-light.svg` / `logo-lockup-dark.svg` — primary logo
- `logo-wordmark-ink.svg` / `logo-wordmark-white.svg` — wordmark alone
- `logo-mark.svg` / `logo-mark-on-dark.svg` — mark alone
- `favicon.svg`, `favicon.ico` (16/32/48)
- `icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`
- `avatar-800.png`, `og-image.png`

Root copies exist for the paths browsers expect: `/favicon.ico`, `/favicon.svg`,
`/icon-180.png`, `/icon-192.png`, `/icon-512.png`, `/icon-512-maskable.png`,
`/og-image.png`.

---

## The two decisions worth preserving

**The wordmark is outlined paths, not live `<text>`.** A logo carrying
`font-family` renders in a fallback face on every machine that lacks Space
Grotesk — which is every machine except the build box. Outlines are what make
the files safe to hand to a journalist, a partner or a printer. If you ever
regenerate the wordmark, keep it outlined.

**Three mark variants exist because one file cannot do three jobs.** The primary
mark uses a 7-unit rule on a 64 grid. The favicon variant uses 10, because 7
mushes into noise at 16px. The maskable variant pulls the ring into the centre
56% and lets the volt bleed to all four edges, because Android crops app icons
to a circle and would otherwise clip it. Check all three after any change:
`rasterize.mjs` writes them, and the zoomed strip in `zoom.png` is how you judge
16px legibility honestly.

---

## Palette

| Token | Hex | Use |
|---|---|---|
| Volt | `#cbff3c` | The accent. **A fill only — never a text colour.** |
| Volt ink | `#4c5f00` | AA-safe volt-flavoured text |
| Brand ink | `#3f6212` | Links, the wordmark dot |
| Ink | `#14180f` | Body text, primary buttons, the ring rule |
| Canvas | `#f7f8f3` | Page background |
| Panel | `#171c11` | Footer and dark bands |

Volt as text on the light canvas is roughly 1.4:1 — invisible. Every volt
surface carries near-black ink. Measured ratios are in `pattaya-gym.css`.

Type: Space Grotesk (display, wordmark), Inter (body), JetBrains Mono (numbers).

---

## Regenerating

Logo and icons need `fontTools`, `brotli`, `Pillow` and Playwright — deliberately
*not* dependencies of this repo, so they run outside the build:

```bash
python3 generators/build-logo.py     # all SVG
node    generators/rasterize.mjs     # PNGs at exact sizes
node    generators/og.mjs            # 1200x630 social card
```

The press kit **does** run in the build, with no extra dependencies:

```cmd
node scripts/build-press-kit.js
```

It must run **after** `apply-design-2026.js` and `polish-design-2026.js` and
**before** `sync-csp-hashes.js` and `update-sitemap-lastmod.js`. It replaces
`<main>` on `/press/` and preserves the chrome around it — run it before a sweep
and the sweep silently overwrites it. That already happened once during the
build: the script reported success and the page was unchanged. `SHIP-GYM.ps1`
has it in the correct position.

`og-image.png` is a static asset because regenerating it needs a browser.
Rebuild it when the headline figures move materially, not on every deploy.

---

## The press kit rule

Every figure on `/press/` is computed from `data.js` and the venue records at
build time — listings, operating count, closures, sports, areas, guides,
editorial word count, sourced-record count, verification window. The boilerplate
paragraphs interpolate those same numbers.

**Never hand-type a number onto that page.** It is the one page journalists and
partners quote, and a hand-typed figure is a figure that will eventually be
wrong. If something cannot be computed from this repo, it does not belong there.

No traffic, follower or view counts. Only what the site itself evidences.

---

## Still worth doing

The wordmark is Space Grotesk 700 outlined at −3% tracking with a coloured dot.
It is consistent, free and technically correct — but it is a typographic lockup,
not drawn lettering. A designed wordmark is the one item here worth paying a
designer for.
