# CODEX TASK — TECHNICAL SPEED PASS (NO DESIGN CHANGES)

**Repo:** `C:\pattayagym` on `main` (fresh from hard revert to `8551051` + `9469710` for `scripts/verify.js`).
**Goal:** Lighthouse mobile Performance ≥ 90 on the 6 representative URLs below, with verified determinism and zero visual changes.
**Lane:** Technical only. No design edits, no content edits, no CSS rule changes, no template restructuring. Bytes can change; pixels cannot.

The owner just unwound a multi-day design regression by hard-reverting. Do not touch design. If something you're about to do could change a layout, a color, a font size, or a margin — **stop and report**, do not ship.

---

## Hard rules — read before starting

1. **No design changes.** No CSS rule additions, deletions, reordering, or selector changes. Only byte-level transformations (minification, gzip-friendly whitespace) are allowed on `styles.css`.
2. **Determinism.** Two consecutive `node build.js && node build-extras.js && node build-discovery.js` runs must produce byte-identical output.
3. **verify.js gate.** `node scripts/verify.js` must pass before any commit. Run it after every batch.
4. **Bump `ASSET_VERSION` exactly once at the end** of the pass, across all 3 build files. Do not bump mid-pass.
5. **No new runtime dependencies.** Build-time-only deps are fine (`terser`, `csso`, `html-minifier-terser`, `sharp`, etc.). Anything that ships to the browser must be justified in the report.
6. **Branch:** work on `main` directly; commit in small batches (one batch = one commit); push at the end with `--force-with-lease`.
7. **No commits to the prompt/report `.md` files.** They are untracked reference docs.
8. **Stop and report** if any batch breaks visual output, breaks verify, breaks determinism, or rejects on push.

---

## STEP 0 — Baseline measurement (do not skip)

Before changing anything, capture the baseline so we can prove the speed pass moved the needle. From `C:\pattayagym`:

```bash
npm install -g lighthouse 2>nul
mkdir lighthouse-baseline 2>nul

REM Run mobile Lighthouse against each canary URL
for %U in (
  "https://pattaya-gym.com/"
  "https://pattaya-gym.com/category/golf/"
  "https://pattaya-gym.com/gyms/fairtex-pattaya/"
  "https://pattaya-gym.com/guides/best-muay-thai-pattaya/"
  "https://pattaya-gym.com/contact/"
  "https://pattaya-gym.com/about/"
) do lighthouse %U --preset=desktop --output=json --output-path=lighthouse-baseline/desktop-%~nU.json --quiet --chrome-flags="--headless --no-sandbox"
```

Record per URL: Performance score, LCP ms, CLS, TBT, Speed Index, Total Bytes. Save as `lighthouse-baseline/SUMMARY.md`.

Also capture file sizes:

```bash
dir styles.css site-ui.js analytics.js sw.js index.html
du -sh gyms/ category/ area/ guides/ assets/ 2>nul
```

Save the dir output in `lighthouse-baseline/SUMMARY.md` too. **This baseline is required.** Without it we can't tell if anything actually got faster.

---

## STEP 1 — Easy wins (1 commit)

These are pure-config / pure-header changes. Zero risk to visuals.

1. **`_headers` audit.** Confirm long `Cache-Control` on static assets (CSS, JS, images, fonts, SVG, woff2). 1-year immutable on hashed assets; 1-hour to 1-day on HTML. Verify Brotli compression is implicit via Cloudflare (no header needed). If anything is missing, add it.
2. **Preconnect / DNS-prefetch.** In `<head>` of build templates and static HTML, ensure preconnect to:
   - `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (only if Google Fonts is in use — if fonts are self-hosted, skip)
   - `https://www.googletagmanager.com` (GA)
   - `https://static.cloudflareinsights.com`
   Add `<link rel="preconnect" crossorigin>` and `<link rel="dns-prefetch">` fallback. Do not add preconnects to domains that aren't actually used.
3. **`<script>` tag audit.** Every non-critical `<script>` gets `defer` (or `async` for analytics). The only sync script allowed is one that's required for first paint — there shouldn't be any. Specifically:
   - `analytics.js` → `defer`
   - GA gtag inline → `async`
   - `site-ui.js` → `defer`
   - Service worker registration inline → wrap in `window.addEventListener('load', ...)` if it isn't already
4. **`<link rel="stylesheet">` non-blocking pattern.** Keep the existing `preload` + `stylesheet` pair if already present. If not, leave alone (do not introduce critical-CSS inlining yet — that's Step 4).

**Commit message:** `perf: headers, preconnects, defer scripts (Step 1)`
Run `node scripts/verify.js`. Run two builds, hash-compare. Commit.

---

## STEP 2 — Asset minification (1 commit)

Add a build-time minification pass. **Do not minify by hand.** Wire it into the build so it stays consistent.

1. **Install dev tools:**
   ```bash
   npm install --save-dev terser csso-cli html-minifier-terser
   ```
   Add an entry to `package.json` if there is one; otherwise create one with minimal `devDependencies`.

2. **Add `scripts/minify.js`** that runs after the existing build, in this order:
   - `styles.css` → minified with `csso` (preserves cascade order, no rule removal). Output back to `styles.css` (no separate file — the build output is the minified version).
   - `site-ui.js`, `analytics.js` → `terser` with safe defaults (no mangle of identifiers exposed to HTML, no top-level mangle).
   - All generated `.html` files → `html-minifier-terser` with conservative options: `collapseWhitespace: true, removeComments: true, minifyCSS: false, minifyJS: false, keepClosingSlash: true, decodeEntities: false`. Do NOT use `removeAttributeQuotes` or `removeEmptyAttributes` — they have edge cases that change attribute parsing.
   - `sw.js` → `terser`.

3. **Wire into build chain.** Update `build.js`'s `main()` to call `scripts/minify.js` as the last step. Same for `build-extras.js` and `build-discovery.js` if they have their own main entries — or have the master build script chain them and then minify.

4. **Determinism check.** Run the full build twice in a row; hash all output files and compare. If any hash differs, fix the source of nondeterminism (probably timestamp or `Date.now()` in minify config) before committing.

5. **verify.js gate.** `node scripts/verify.js` must still pass with all 8 checks. Minified HTML must still tokenize cleanly.

**Commit message:** `perf: build-time minify css/js/html/sw (Step 2)`

---

## STEP 3 — Image audit and conversion (1 commit, optional)

Only do this batch if `du -sh` from Step 0 shows images dominating page weight (likely if venue cards have OG images).

1. Inventory images under `assets/`, `og/`, `gyms/*/`, etc. List by size, format.
2. Convert any PNG ≥ 50KB and JPG ≥ 80KB to WebP and AVIF using `sharp`. Keep the original as fallback. Update `<img>` tags to use `<picture>` with `<source type="image/avif">`, `<source type="image/webp">`, and `<img>` fallback. Do this in the build templates, not by hand-editing each file.
3. Ensure every `<img>` has `loading="lazy"` (except hero/LCP images), `decoding="async"`, and explicit `width` + `height` attributes (CLS prevention).
4. Do NOT replace the LCP image with a lazy-loaded one. Identify the LCP element first via the baseline Lighthouse report.

If images aren't the bottleneck, **skip this step** and note it in the report.

**Commit message:** `perf: webp/avif fallback + lazy-load + explicit dims (Step 3)`

---

## STEP 4 — Critical CSS inlining (1 commit, only if Step 1-3 leave LCP > 2.5s)

Skip unless mobile LCP is still > 2.5s after Steps 1-3 ship and re-measure.

1. Generate critical CSS for each page type (homepage, category, venue, guide, area) using `critical` or `penthouse`. Inline it in `<style>` in the `<head>` of each template.
2. Move the full `styles.css` `<link>` to use `media="print" onload="this.media='all'"` pattern with `<noscript>` fallback.
3. Keep the `preload` line — it warms the cache.
4. Verify visually that no FOUC appears on the 6 canary URLs at mobile + desktop widths.

**Commit message:** `perf: inline critical css per template (Step 4)`

---

## STEP 5 — Bump ASSET_VERSION + final push

After all batches that ran are committed and verified:

```bash
REM Bump ASSET_VERSION in all 3 build files. Pick a number > current (currently v225 at HEAD).
REM Use the same number across all three files. Suggest: '300'.
```

Edit `build.js`, `build-extras.js`, `build-discovery.js`: change `const ASSET_VERSION = '225';` to `'300'`.

Edit `sw.js`: bump the cache name to `pattaya-gym-v300-<YYYYMMDD>`.

Run the full build chain once more (this regenerates all HTML with `?v=300` refs). Run verify. Two-build hash check.

```bash
git add -A
git commit -m "perf: bump asset version to 300 (speed pass)"
git push --force-with-lease origin main
```

---

## STEP 6 — Post-deploy Lighthouse re-measure

Wait 60s for Cloudflare to redeploy. Run the same Lighthouse loop from Step 0, write to `lighthouse-after/`. Compute the deltas.

---

## REPORT — `C:\pattayagym\CODEX_SPEED_PASS_REPORT.md`

Sections (in order):

1. **Steps executed** — list each step number, batch commit hash, exit status. Note any step you skipped and why.
2. **Baseline → After table** — one row per canary URL × metric (Performance, LCP, CLS, TBT, Speed Index, Total Bytes). Show absolute values and deltas.
3. **File-size deltas** — `styles.css`, `site-ui.js`, generated HTML samples, total `gyms/` directory size, before/after.
4. **Determinism** — confirmation that two consecutive builds produce identical hashes.
5. **verify.js** — final output of `node scripts/verify.js`.
6. **Visual sanity** — for each of the 6 canary URLs, one line: `OK` or `DIFFERS: <description>`. If anything visually differs, **call it out**; do not gloss over it.
7. **Risks / open items** — anything you wanted to do but didn't, anything that smells off, anything that needs human eyes.

Do NOT commit this report. Leave it on disk for review.

---

## What you are NOT doing

- Not touching colors, typography, spacing, layout, or any visual property.
- Not adding new CSS rules, removing rules, reordering rules, or PurgeCSS'ing.
- Not changing template structure (no new `<section>` wrappers, no nav rearrangements).
- Not adding new JS libraries that ship to the browser.
- Not adding skeleton screens, loading spinners, or animation polish.
- Not refactoring `build.js` / `build-extras.js` / `build-discovery.js` beyond wiring the minify step.
- Not editing content, copy, headings, or alt text.
- Not bumping `ASSET_VERSION` mid-pass — only once, at Step 5.

If something looks like a tempting fix but is in the above list, write it as a recommendation in the report and leave it for the owner to greenlight.
