<!-- NETWORK-HEADER v1 -->
# READ FIRST

**`C:\Projects\NETWORK-RULES.md` is the rulebook for every site in this network.** Read it before
touching footers, cross-domain links, schema, canonicals, indexing or design. It overrides
anything in this file.

**The two that break things most often:** exactly ONE cross-domain link per page (the followed
`timpaemi.com` author credit) and ZERO sister-site links anywhere — including JSON-LD, `sameAs`,
`llms.txt` and anything the build scripts inject.

**Before any structural change** (footer · publisher entity · canonicals · internal-link pattern ·
`noindex`/pruning · redesign · URL changes): log it in `C:\Projects\NETWORK-CHANGE-LOG.md`, and
do only one at a time. Content enrichment is not structural — ship that continuously.

**Site:** Pattaya Gym — https://pattaya-gym.com/
**Deploy:** `.\SHIP-GYM.ps1` — build + every gate + push. Never hand-roll it.
Gates that must pass: `validate` · `verify-encoding` (mojibake - a bad save once broke every price on the site and no other gate saw it) · `check-no-network-links` · `verify-deploy` · `verify` · `seo-audit` · `verify-design-layer` ·
`verify-redirects` (the only check comparing `_redirects`, `sitemap.xml` and the pages on disk —
it stops a retired area x category combo being rebuilt and 301d away when a venue refills it;
`npm run fix:redirects` removes only the shadowing rules) · `html:validate`.

**Retired 26 Jul 2026 — ignore anything below that says otherwise:** the publisher is
**TimPaemi**, not Pattaya Authority. Pattaya Authority must not appear on this site in any
footer, byline, JSON-LD, `llms.txt`, `humans.txt` or prose.
<!-- END NETWORK-HEADER -->

---

# SCOPE LOCK — this repo only

Added 2026-07-27. Several windows run in parallel, one per site. They collide,
and it is always the same failure: a window reads a network rulebook, concludes
it is working on a network, and starts building or wiring shared machinery.
This section exists to stop that.

**The repo is `C:\Projects\pattayagym`. Everything outside it is read-only.**

## 1 · Never build anything shared

No generator, engine, factory, template system, shared component library, shared
script or "reusable" module intended to serve more than this one site. Not in
this repo, not anywhere.

If you catch yourself writing the words *reusable*, *shared*, *for all sites*,
*network-wide*, *so the other sites can use it*, or *we can lift this out later*
— stop and delete that plan.

Duplication across sites is the intended trade. Each site is built separately,
on purpose. A copy that one window can change safely beats a shared module six
windows fight over. Do not de-duplicate across repos. Do not propose it. Do not
leave a TODO suggesting it.

## 2 · Never use a generator built for another repo

Do not import, call, copy-by-reference or depend on anything living outside this
repo — including `C:\Projects\_brand\`, a sibling site's `scripts/`, or a shared
file at the `C:\Projects` root.

If this repo ever gains such a dependency, cut it:

1. Find every build-time or runtime reference resolving outside this folder —
   imports, CSS `@import`, script `src`, config paths, any `node` script reading
   `../` above the repo root.
2. Copy those files in, to this repo's own `scripts/`, `src/lib/` or
   `src/styles/`. Copy, never move.
3. Repoint every reference at the local copy.
4. Strip anything the copy carries for other sites: per-site switches, site maps,
   theme registries, `if (site === 'x')` branches, CLI flags selecting a target
   site. What is left does exactly one thing for exactly this site, values
   hardcoded.
5. Delete nothing outside this repo. Other windows are still using those files.
6. Build, confirm output is unchanged, and report what you vendored in.

**The test: this repo must build with the rest of `C:\Projects` deleted.**
Verified clean on 2026-07-27 — no build-time or runtime path escapes this folder.

## 3 · Reading is fine, writing is not

You may read another repo to copy a pattern, check how something was solved, or
match a convention. You may never write to one, refactor one, tidy one, rename
in one, or run a build in one.

Two Astro builds at once delete each other's `dist/` and both fail. One build at
a time, in this repo only.

Files at the `C:\Projects` root are shared by every window. Do not edit them.

## 4 · If something outside this repo needs to change

Say so and stop. Describe what needs changing and why. Do not do it and mention
it afterwards — another window may be mid-edit in that exact file.

## 5 · Index-affecting changes need explicit approval

`noindex`, pruning, canonicals, redirects, URL changes, sitemap rules, robots
directives, bulk frontmatter edits. Not routine. Must not be bundled into other
work.

State the downside in clicks, not pages or percentages, and wait for a yes.

In July 2026 an index gate quarantined 4,635 pages on one site and took it from
40 clicks a day to zero within 24 hours. Nothing was deleted and it was fully
reverted, but the traffic did not come back the same day. Do not rebuild
anything like it.

**Content enrichment is not structural. Ship that continuously.**

## Before you report

- the repo you worked in, by full path
- that no file outside it was written, renamed or deleted
- anything you vendored in to cut an external dependency
- that no shared or reusable module was created
- that no `noindex` value was added or removed without being asked

**Do not commit. Do not push. Tim ships.**

