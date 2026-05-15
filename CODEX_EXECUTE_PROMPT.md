# CODEX — EXECUTE: TECHNICAL FIX PASS
## Site: pattaya-gym.com · Repo: C:\pattayagym
## Mode: AUDIT + FIX. You will modify code.

You are a **senior site reliability engineer**. The site is already live on Cloudflare Pages. The **visual editorial design is done** and was implemented by Claude — that side is not your problem. Your job is the technical layer underneath.

You will work autonomously, making real edits, committing nothing (Claude reviews the diff). Output a **summary of what you changed** when done.

---

## DIVISION OF LABOR (READ THIS FIRST)

### YOU (Codex) own the TECHNICAL layer:
- Build chain integrity (`build.js`, `build-extras.js`, `build-discovery.js`)
- Generated HTML correctness (200+ pages — make them valid, lean, schema-perfect)
- SEO meta + canonical + Open Graph + Twitter + hreflang
- Schema.org JSON-LD (all 16+ types, deep validation)
- Internal link integrity (no 404s, no orphans, no `click here`)
- Performance (image dims, lazy load, font weights, JS bundle size)
- Security headers (`_headers`, CSP, HSTS, COOP/CORP)
- Accessibility (focus, ARIA, alt text, heading hierarchy, tap targets)
- Dead code removal (unused functions, unused CSS selectors, console.logs)
- Data hygiene (`data.js`, venue MD frontmatter consistency, validate.js coverage)
- File integrity (null bytes, truncation, character encoding)
- robots.txt, sitemap-*.xml, llms.txt, feed.json, openapi.yaml, .well-known/ai-plugin.json
- Build determinism (no Math.random, stable sort orders, deterministic timestamps)
- Service worker cache strategy (`sw.js`)
- Code structure (function deduplication across the 3 build files)

### CLAUDE owns the VISUAL + CONTENT layer (DO NOT TOUCH):
- `styles.css` — editorial design system. Do not edit values, do not add styles, do not "improve" the visual hierarchy. If a CSS class is broken or unused, **report it**, don't fix it.
- `index.html` HTML structure of homepage sections (hero, stats, sports grid, top venues, areas, how-it-works, FAQ, contact, marquees, footer). You may add/fix `<meta>` and `<link>` tags in `<head>`. Body sections — report issues, don't restructure.
- Editorial copy. Don't rewrite headlines, hero quotes, section labels, the `// MONO` eyebrows, marquee text, footer credit. Fix typos only if you find them. Otherwise leave the words alone.
- Venue markdown body content (`venues/*.md` body after frontmatter). You may correct frontmatter fields; you may NOT rewrite the prose.
- Brand voice. Don't change `Pattaya Gym Directory` to anything else. Don't change `info@pattaya-gym.com`. Don't change WhatsApp number or LINE handle.
- The footer credit line: `// SITE BUILT & MANAGED BY PATTAYA AUTHORITY · TIM PAEMI ★ ©2026`. Keep exact wording, character set, spacing.

When in doubt: **fix the engine, not the paint.**

---

## SAFETY RULES

1. **Git checkpoint first.** Before any edit, confirm `git status` is clean or note dirty files. Do not lose uncommitted work.
2. **Don't truncate files.** Claude has hit a recurring file-truncation bug. Use atomic Python rewrites for any file > 1000 lines. Never partial-stream a write to a large file.
3. **Run the build after every batch.** `node build.js && node build-extras.js && node build-discovery.js`. If it fails, fix the regression before moving on.
4. **Don't bump `ASSET_VERSION`** unless you ship a hashed asset change. Claude is at v222 — leave it there unless you change a referenced asset.
5. **Don't delete files** without listing them in your summary. If you remove `index.new.html` or stray `.tmp.driveupload`, say so.
6. **Don't add new dependencies.** No npm install. The site is dependency-free.
7. **Validate after every batch.** Run `node validate.js` if it exists. Check syntax with `node --check build.js` etc.
8. **Preserve every existing `<link rel="canonical">` and `og:*` value.** You can fix bad ones, you cannot remove correct ones.
9. **Preserve Google Analytics tag** `G-F5F6KD3XFZ` — it's freshly installed everywhere. Don't strip it.
10. **Preserve `info@pattaya-gym.com` everywhere.** Don't substitute another email.

---

## THE FIX QUEUE (in priority order)

### BATCH 1 — Deploy blockers / data integrity

1. **Phone-number sanitization across all venue pages.** Some `tel:` links contain `ext.`, `(Mr.Name)`, or two numbers in one href. Sanitize so every `tel:` href is one valid dialable number. Source of truth: `venues/*.md` frontmatter `phone` field. Update both the frontmatter and the build template so future runs stay clean.
2. **Schema TODO leak.** Some venue schemas contain "Coordinates pending field survey" as a value. That's fine to keep, but **if any page still has the old "TODO replace with venue-specific" wording**, replace it.
3. **Broken internal links.** Scan every `<a href="/...">` in every generated HTML page. Any that resolve to a file that doesn't exist — fix the link OR remove it. Common issue: links to venue slugs that don't have a page.
4. **Stray legacy files.** Remove `index.new.html` if it exists. Remove `.tmp.driveupload/` if it exists. Remove any backup files (`*.bak`, `*.old`, `*~`).
5. **Null-byte scan.** Run `python3 -c "import glob; [print(p) for p in glob.glob('**/*', recursive=True) if open(p,'rb').read().count(b'\x00') > 0]"` (filter to text files). Strip any found.
6. **Sitemap parity.** Every URL in `sitemap-*.xml` must have a corresponding HTML file. Every generated HTML file in `gyms/`, `category/`, `area/`, `guides/` must be in a sitemap. Fix drift.

### BATCH 2 — SEO meta hygiene

7. **Unique titles.** Find every `<title>` over 60 chars or under 30 chars. Rewrite to fit, preserving keyword + brand. Report any pages where you couldn't find a clean rewrite.
8. **Unique descriptions.** Find every `<meta name="description">` over 160 chars or under 100 chars. Fix.
9. **Canonical URL drift.** Every page's `<link rel="canonical">` must exactly match the page's own URL path. Find drift, fix.
10. **OG image existence.** Every `og:image` value should resolve to an actual file. Audit `og/*.png` vs. references. Fix mismatches.
11. **Twitter card consistency.** Every page has `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:src`. Fix missing.
12. **Hreflang consistency.** Every page declares `hreflang="en"` and `hreflang="x-default"` both pointing to itself. Fix missing.

### BATCH 3 — Schema.org JSON-LD

13. **Every venue page** has LocalBusiness + SportsActivityLocation + BreadcrumbList + WebPage + FAQPage schema. Audit all 158. Fix anything malformed (broken `@id` refs, missing required fields, invalid datetime).
14. **Every category page** has CollectionPage + ItemList + BreadcrumbList. Audit.
15. **Every area page** has Place + ItemList + BreadcrumbList. Audit.
16. **Every guide page** has Article + Speakable + BreadcrumbList. Audit.
17. **Organization schema** (homepage) has accurate `contactPoint.email = info@pattaya-gym.com`, `sameAs` URLs that resolve, `knowsAbout` list. Audit.
18. **No orphan @id** — every `@id` reference inside a schema points to a schema that exists.

### BATCH 4 — Internal linking + sitemap

19. **Orphan page detection.** Any URL in a sitemap with zero incoming internal links. List and fix by linking from a relevant category/area/footer.
20. **Anchor text quality.** Find every internal link with anchor text "click here", "here", "read more", "this", "→" alone, "view full page →" alone. Where the anchor is not descriptive, change to descriptive text that includes the venue name or category.
21. **Footer link parity.** Every page footer must link to: home, contact, methodology, all 6 areas, top 8 categories, top 8 guides. Audit & fix drift.
22. **Sitemap index.** `sitemap-index.xml` must reference all sitemap shards. Add Bing-style `<sitemap>` blocks if missing.

### BATCH 5 — Performance + accessibility

23. **Image attrs.** Every `<img>` has `alt`, `width`, `height`, `loading` (`eager` for above-the-fold hero, `lazy` otherwise), `decoding="async"`. Fix bare ones.
24. **Font weight inventory.** Currently loading 6+ Inter Tight weights. Drop any not actually used in CSS to reduce font payload.
25. **`<button>` type attribute.** Every `<button>` should have `type="button"` or `type="submit"`. Codex audit reported 2,649 missing. Fix in build templates so future builds emit it.
26. **Heading hierarchy.** No skipped levels (H1 → H3). Fix in templates.
27. **Focus-visible states.** Every interactive element should be keyboard-reachable with a visible focus ring. The CSS rule exists; report any element that escapes it (e.g., raw `<div>` with click handler).
28. **`prefers-reduced-motion`.** Confirm every CSS animation/transition is gated by the reduce-motion media query.
29. **`tabindex="-1"` audit.** Any `tabindex="-1"` should be intentional (decorative duplicate links). List any that look wrong.
30. **Service worker.** Update `sw.js` cache name to match latest deploy, scope correctly, don't cache HTML aggressively, do cache hashed assets.

### BATCH 6 — Code structure + determinism

31. **Function deduplication.** `criticalCss()`, `desktopTocCriticalCss()`, `accessibilityCriticalCss()`, `header()`, `footer()`, `autoLinkVenues()`, `escHtml()` appear in multiple build files. Move shared helpers into a `_shared.js` module. Import where needed. Verify byte-identical output before and after refactor.
32. **Dead code.** Functions defined but never called. CSS selectors that match no markup. Data fields that are never read. List and remove.
33. **`console.log`.** Strip from production JS (`app.bundle.js`, `share.js`, `favorites.js`, `compare.js`). Keep them in build scripts (those run at build time, not in browser).
34. **Build determinism.** `Math.random()` for related-venue ordering, `Date.now()` baked into output, Set iteration order. Replace with deterministic alternatives. Two consecutive builds should produce byte-identical output (except `lastmod` dates).
35. **Inline event handlers.** Every `onclick=`, `onerror=`, `onload=` in shipped HTML. Replace with CSP-friendly addEventListener once moved to JS files.
36. **`${...}` in attribute context.** Any unescaped template interpolation inside an HTML attribute. Must go through `escHtml()`.

### BATCH 7 — Security headers

37. `_headers` file. CSP should not have `'unsafe-inline'` for scripts (already removed by Claude). Verify. Style-src may keep `'unsafe-inline'` because editorial inline styles exist.
38. CSP must allow these external origins exactly: `https://www.googletagmanager.com`, `https://www.google-analytics.com`, `https://plausible.io`, `https://fonts.googleapis.com`, `https://fonts.gstatic.com`. Fix missing.
39. HSTS `max-age >= 31536000; includeSubDomains; preload`. Verify.
40. `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. Verify.
41. Permissions-Policy denies `camera`, `microphone`, `geolocation`, `payment`, `usb`, `interest-cohort`. Verify.
42. CORS on `/api/*` should be `Access-Control-Allow-Origin: *` (intentional — data is CC BY 4.0). Verify it's still there.
43. Cache-Control: HTML `max-age=300, must-revalidate`; hashed assets `max-age=31536000, immutable`; OG images `max-age=31536000, immutable`.

### BATCH 8 — AI search + structured data

44. `robots.txt` must allow all of: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, ChatGPT-User, Applebot-Extended, CCBot, anthropic-ai, OAI-SearchBot, Perplexity-User, Bytespider, Amazonbot, FacebookBot, facebookexternalhit, Meta-ExternalAgent, cohere-ai, Diffbot. Verify.
45. `llms.txt` is well-formed, references every content cluster, has example queries.
46. `/api/venues.json` validates as JSON, has CC BY 4.0 license header in source comment.
47. `/feed.json` is JSON Feed 1.1 valid.
48. `/.well-known/ai-plugin.json` is valid ChatGPT plugin manifest.

---

## WORKFLOW

1. Read this entire prompt before starting.
2. Read the audit context in `CODEX_NUCLEAR_AUDIT.md` if it exists — that's the read-only findings from the last pass.
3. Read `SEO_IGNITION_KIT.md` for context on the SEO strategy (don't execute SEO outreach — that's Tim's job).
4. Work the 8 batches in order. Don't skip ahead. After each batch:
   - Run `node build.js && node build-extras.js && node build-discovery.js`
   - Run `node --check build.js build-extras.js build-discovery.js`
   - Run `node validate.js` if it exists
   - Note any regression. Fix before continuing.
5. After all 8 batches:
   - Final build.
   - Produce summary report at `C:\pattayagym\CODEX_EXECUTE_REPORT.md`

---

## REPORT FORMAT (CODEX_EXECUTE_REPORT.md)

```
# Codex Execute Report — [DATE]

## Summary
- Batches completed: [1-8 / N]
- Files modified: NNN
- Lines changed: NNN
- Build status: PASS / FAIL
- New issues introduced: [list or "none"]

## Batch 1 — Deploy blockers
- [issue + file:line fix description]

## Batch 2 — SEO meta
- ...

[etc for each batch 1-8]

## Files I refused to touch (per DO NOT TOUCH list)
- styles.css [reason]
- editorial copy in index.html [reason]
- ...

## Recommendations for Claude
- [Things that need visual/content judgment, not technical fix]

## Files I created
- ...

## Files I deleted
- ...

## Open questions / I couldn't decide
- ...
```

---

## WHAT YOU MUST NOT DO

1. Do not rewrite Claude's editorial copy. Headlines, eyebrows, pull-quotes, marquee text, footer credit, brand name, contact info — all locked.
2. Do not change visual styling. `styles.css` is locked. CSS class semantics are locked.
3. Do not introduce a CSS framework (no Tailwind, no Bootstrap).
4. Do not change the build system architecture. 3 build files exist — fix bugs within them but don't migrate to Astro/Eleventy/Vite.
5. Do not add JavaScript frameworks (no React, no Vue, no Svelte).
6. Do not change the routing scheme. `/gyms/{slug}/`, `/category/{slug}/`, `/area/{slug}/`, `/guides/{slug}/`.
7. Do not commit anything. Claude reviews diffs before commit.
8. Do not push to GitHub. Local fix only.
9. Do not edit `data.js` venue records (the 158 hand-curated venues). You may fix syntax bugs, never the content.

---

## ONE THING TO REMEMBER

This site is already a high-quality editorial directory. The goal of this pass is to make the **technical chassis match the visual quality**. Lean code, fast pages, perfect schema, no broken links, no inconsistencies, deterministic builds.

When you're done, the build chain should produce byte-identical output on two consecutive runs. Every page should validate against W3C HTML and schema.org. Every link should resolve. Every image should have explicit dims. CSP should be tight. No console errors anywhere.

Go.
