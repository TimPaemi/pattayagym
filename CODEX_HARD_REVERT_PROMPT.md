# CODEX TASK — HARD REVERT TO `8551051`

**Repo:** `C:\pattayagym` (origin: `pattaya-gym.com` GitHub → Cloudflare Pages)
**Branch:** `main`
**Risk level:** rewrites remote history. Coordinate before pushing.

You are reverting the `main` branch to commit `8551051` ("Unify nav site-wide"). Everything after that commit is being thrown away — that includes a Codex visual pass and 5 emergency CSS patches that started a regression spiral. The repo owner has approved this. Do not negotiate, do not try to "save" any of the wiped commits.

The ONLY thing that must survive the revert is **`scripts/verify.js`** — a 203-line pre-push integrity check. It lives in commit `6cd08f3` which will be wiped. You must extract it before the reset and re-commit it after.

---

## STEP 0 — Read this fully before touching anything

The commit graph right now is:
```
1d863cc  v233: ink/bone section rhythm subpages          ← HEAD (wipe)
8e23d15  v232: FAQ accordion dark + CSP + 2-bone-bg     ← wipe
6cd08f3  Repair truncated homepage + scripts/verify.js   ← wipe (but save verify.js)
67abc7a  Emergency: repair truncated styles.css          ← wipe
1f65197  Codex visual fix pass v227                      ← wipe (this is the disaster)
9e21a3a  Fix horizontal overflow — clamp H1              ← wipe
8551051  Unify nav site-wide ★                           ← TARGET (keep)
6ab4ed9  Visual cleanup — OG-image kill, feedback widget kill
8cc5903  Codex technical fix pass — 8 batches
02bc03d  Add Google Analytics (G-F5F6KD3XFZ) site-wide
0f124f3  Add 3-channel contact (Email/WA/LINE)
...
```

Everything good (editorial design v3.x, 3-channel contact, GA, OG-image kill, Codex tech fixes, unified nav) predates `8551051` and is preserved.

**styles.css line count at target:** 5,659 (vs current ~6,044 with 11 stacked emergency-override blocks).

---

## STEP 1 — Verify you're on the right branch and clean

```bash
cd C:/pattayagym
git rev-parse --abbrev-ref HEAD   # must print: main
git status --porcelain            # must be empty. If not, STOP and report.
```

If `git status` shows uncommitted changes, do NOT stash and do NOT continue. Print the file list and stop. The owner will deal with it.

---

## STEP 2 — Confirm target commit exists locally

```bash
git cat-file -e 8551051 && echo "target ok"
git log --oneline -1 8551051      # must print: 8551051 Unify nav site-wide ...
```

If either fails, stop.

---

## STEP 3 — Extract verify.js to a temp location

```bash
git show 6cd08f3:scripts/verify.js > "%TEMP%\verify.js.preserved"
```

(Linux/Mac: `git show 6cd08f3:scripts/verify.js > /tmp/verify.js.preserved`)

Sanity check:
```bash
wc -l "%TEMP%\verify.js.preserved"   # must be ~203 lines
```

If the file is empty or wrong size, stop.

---

## STEP 4 — Tag the current tip as a safety net

```bash
git tag spiral-end-2026-05-15
git push origin spiral-end-2026-05-15
```

This is the undo button. If anything later looks worse than the current broken state, the owner can `git reset --hard spiral-end-2026-05-15 && git push --force-with-lease origin main` and we are back to exactly this moment.

---

## STEP 5 — Hard reset main to 8551051

```bash
git reset --hard 8551051
```

Confirm:
```bash
git log --oneline -1              # must print: 8551051 Unify nav site-wide ...
wc -l styles.css                  # must print: 5659 (give or take a few)
```

---

## STEP 6 — Restore verify.js

```bash
mkdir scripts 2>nul
copy "%TEMP%\verify.js.preserved" "scripts\verify.js"
```

(Linux/Mac: `mkdir -p scripts && cp /tmp/verify.js.preserved scripts/verify.js`)

Run it:
```bash
node scripts/verify.js
```

**All 8 checks MUST pass.** If anything fails, stop and report the failure. Do not push a failing tree.

---

## STEP 7 — Commit the preserved verify.js

```bash
git add scripts/verify.js
git commit -m "Preserve scripts/verify.js across hard revert to 8551051"
```

---

## STEP 8 — Force-push the rewritten history

```bash
git push --force-with-lease origin main
```

If `--force-with-lease` rejects because remote has commits you don't have, **stop and report**. Do not use plain `--force`. The owner needs to investigate first.

---

## STEP 9 — Watch the Cloudflare Pages deploy

Wait ~60 seconds. Open `https://pattaya-gym.com/` in an incognito window (or hard-refresh with Ctrl+Shift+R). Compare against the broken state described below.

Spot-check these URLs:
- `https://pattaya-gym.com/`                              (homepage)
- `https://pattaya-gym.com/category/golf/`                (category page that triggered the spiral)
- `https://pattaya-gym.com/gyms/fairtex-pattaya/`         (representative venue page)
- `https://pattaya-gym.com/guides/best-muay-thai-pattaya/` (guide)
- `https://pattaya-gym.com/contact/`                      (contact — 3 channels)
- `https://pattaya-gym.com/about/`                        (about)

Each should render with the editorial design intact, no broken bottom marquee, no invisible-text-on-bone bands, no random alternating black/cream sections without rhythm.

---

## REPORT BACK

After step 9, write a one-page report at `C:\pattayagym\CODEX_HARD_REVERT_REPORT.md` covering:

1. Each step's exit status (ok / fail + error).
2. styles.css final line count.
3. `node scripts/verify.js` final output.
4. The 6 spot-check URLs — for each, one line: `OK` or `BROKEN: <what's wrong>`.
5. Anything unexpected.

That's the entire job. **Do not touch any other files.** No design changes, no CSS edits, no template tweaks, no asset version bumps. Just the revert + verify.js preservation + force-push + report.

---

## RULES — do not deviate

- Do NOT use plain `git push --force`. Always `--force-with-lease`.
- Do NOT skip the safety tag in step 4.
- Do NOT modify styles.css, build.js, build-extras.js, build-discovery.js, or any HTML file.
- Do NOT bump ASSET_VERSION. It's at 233 at the target commit. Leave it.
- Do NOT add new files beyond `scripts/verify.js` (and the report at the very end).
- If `node scripts/verify.js` fails after step 6, STOP and report. Do not push.
- If anything looks unexpected, STOP and report. The undo tag exists for a reason.
