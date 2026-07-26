# Design rules — pattaya-gym.com (2026 system)

Replaces the 2025 "black background · multi-colour accents · neon glow ·
marquee strips" rules. If you are an agent working on this repo, this file
governs visual decisions. Read it before touching `styles.css` or any template.

## The system in one paragraph

Light canvas, dark footer panel, one accent. Structure, type scale, radii,
shadows and motion come from the TimPaemi network tokens so this site reads as
the same publisher as Pattaya Insider — the network carries **no cross-site
links**, so shared visual language is the only publisher signal there is.
Colour is the only thing that differs per site, and for this site it is volt.

## Palette

| Token | Value | Use |
|---|---|---|
| `--accent` | `#cbff3c` | **The volt.** A fill only — CTA pills, highlights, marks. Never text. |
| `--accent-ink` | `#4c5f00` | AA-safe volt-flavoured text |
| `--brand-ink` | `#3f6212` | Link text, dark buttons' hover |
| `--brand-bright` | `#cbff3c` | Volt on dark surfaces (footer only) |
| `--ink` | `#14180f` | Body text, primary buttons |
| `--canvas` / `--surface` | `#f7f8f3` / `#ffffff` | Page / cards |
| `--panel` | `#171c11` | Footer panel |

**The rule that breaks the site if you get it wrong:** volt is a fill. Volt as
text on the light canvas is about 1.4:1 — invisible. Every volt surface carries
`--ink`. Anything volt-flavoured that must be readable as text uses
`--accent-ink`.

The canonical copy lives at `C:\Projects\_brand\themes\pattaya-gym.css`, with the
measured contrast ratios in its header comment. Run
`node check-contrast.mjs themes/pattaya-gym.css` from `_brand` before changing
any colour.

## Do

- **One accent.** The old design used pink, cyan, yellow, mint and red at once.
  The `.accent-*` classes still exist (there are ~2,600 uses) but they all now
  resolve to two calm colours. Do not reintroduce a third.
- **Type:** Space Grotesk display, Inter body, JetBrains Mono for numbers —
  prices, counts, dates, verified stamps. Mono on data is what makes a directory
  read as a directory.
- **Type scale:** the 1.200 minor third in `:root`. `--text-2xs` through
  `--text-4xl`. Do not hand-pick px sizes.
- **Cards:** 1px `--line` border, `--r-lg` radius, `--shadow-flat` at rest,
  `--shadow-soft` and a 2px lift on hover. Nothing else.
- **Sections:** `.section` owns the rhythm. `.section + .section` drops the top
  pad automatically — do not add `u-pt-0` unless you are fighting an injected
  block.
- **Eyebrows** are `.eyebrow` with an optional `.num`. The trailing rule is drawn
  by `::after`; do not add an `<hr>`.

## Do not

- **No glow.** The `--glow-*` tokens still exist but are neutralised to flat
  shadows so old inline styles degrade gracefully. Do not restore neon.
- **No marquee.** Both tickers are gone and `.marquee*` is `display:none`.
- **No scroll-progress bar.** `.progress-bar` is `display:none`.
- **No emoji as iconography.** ⭐ 🕐 📍 💰 ✎ were removed sitewide — they render
  differently on every OS, cannot be brand-coloured, and cannot be sized against
  the type scale. `★ ♡ ✓ → ↑` are text dingbats and are fine.
- **No cross-site link blocks.** The network hub and projects grid are gone. One
  nofollowed `timpaemi.com` publisher credit per page is the limit.
- **No photography** is a permanent constraint across the network. Identity is
  carried by type, the volt, and the mark.

## Two things that will bite you

### 1. Inline styles are load-bearing

The generated HTML carries **~8,300 inline `style=` attributes** referencing 24
CSS custom properties: `--s-1`…`--s-20`, `--surface`, `--line`, `--r-lg`,
`--r-pill`, `--muted`, `--text`, `--text-2`, `--hint`, `--text-muted`, `--cyan`,
`--pink`, `--mint`, `--yellow`, `--font-mono`, `--font-display`, `--max`,
`--pad`, `--t-fast`.

No stylesheet rule can reach an inline style. That is why the whole restyle was
done by **repointing those variable names at new values, not renaming them**.
Rename or delete one and hundreds of pages break silently, with no build error.
`--cyan` and `--mint` now mean "link green"; `--pink` and `--yellow` mean
"volt-dark". They are misnamed on purpose — the names are an API.

If you need to change layout that lives in an inline style, you must edit the
emitting template, not the CSS. `scripts/polish-design-2026.js` is where that
kind of sweep goes.

### 2. Two sweep scripts must stay in the build chain

`scripts/apply-design-2026.js` rolls the header, footer, marquee removal, light
metas and asset version onto every HTML file — including the ~59 static pages
`build-v2.js` never regenerates, and the 4 orphaned `area/*/*` pages that fell
out of every other script's allowlist.

`scripts/polish-design-2026.js` fixes the inline-style leftovers and patches the
templates that emit them, so a rebuild agrees with the swept HTML.

Both are idempotent and both are in the `AGENTS.md` ship chain. Dropping them
means the next build silently reverts guide and tool pages to the old chrome.

## Component vocabulary

`styles.css` is organised in labelled blocks and defines a rule for **every one
of the 280 class names the generated HTML uses**. Before inventing a class,
grep — there is very likely one already. The header comment in `styles.css`
explains anything unobvious, including which rules were added reactively after
rendering the built pages rather than reading the markup.
