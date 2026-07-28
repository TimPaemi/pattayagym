# HARD REVERT — Path A

**Date:** 2026-05-15
**Reason:** Stacked CSS emergency-override blocks fighting each other. Each fix breaks something adjacent. Spiral cannot be unwound surgically.

**Target commit:** `8551051` — *"Unify nav site-wide — editorial PATTAYA.GYM brand + sport links on every page"*

This commit has, all preserved:
- Editorial design system v3.x
- 3-channel contact (Email / WhatsApp / LINE)
- Google Analytics G-F5F6KD3XFZ site-wide
- All Codex technical fixes (null bytes, broken links, deterministic builds)
- OG-image-as-card removed, feedback widget killed, breadcrumb dup fixed
- Unified nav across all pages
- styles.css = **5,659 lines** (vs. current 6,044 with the override pile)

What gets wiped (6 commits):
- `9e21a3a` Fix horizontal overflow — clamp H1
- `1f65197` Codex visual fix pass v227 ← the big one
- `67abc7a` Emergency: repair truncated styles.css
- `6cd08f3` Repair truncated homepage + compare + scripts/verify.js
- `8e23d15` v232: FAQ accordion dark + CSP + 2-bone-bg fix
- `1d863cc` v233: ink/bone section rhythm subpages

What we preserve out of the wiped commits:
- `scripts/verify.js` (203 lines) — pre-push integrity check.
  Backed up at: `C:\Users\nnamm\AppData\Roaming\Claude\local-agent-mode-sessions\...\outputs\verify.js.preserved`
  I'll restore this in step 5 below.

---

## EXACT CMD STEPS — run these in order from your own terminal

### 1. Make sure you have no uncommitted work you want to keep
```cmd
cd C:\pattayagym
git status
```
If anything important is uncommitted, stash it: `git stash push -m "pre-revert"`

### 2. Clear the stale git lock files (sandbox couldn't)
```cmd
del /f C:\pattayagym\.git\index.lock
del /f C:\pattayagym\.git\index.stash.3.lock
```

### 3. Tag the current tip as a safety net (so we can always get back)
```cmd
git tag spiral-end-2026-05-15
git push origin spiral-end-2026-05-15
```

### 4. Hard reset to the clean commit
```cmd
git reset --hard 8551051
```

### 5. Restore scripts/verify.js (it lived in a wiped commit)
Open `verify.js.preserved` from the outputs folder and copy it to `C:\pattayagym\scripts\verify.js`.
Or run from CMD if PowerShell is available:
```cmd
copy "C:\Users\nnamm\AppData\Roaming\Claude\local-agent-mode-sessions\743f1a06-b339-4ab9-9af7-1bee78fa296a\9b18a530-3fc7-45cc-a4cf-bad9e670564c\local_f222c7ac-c460-4fdb-9c15-e21ce8d32d9d\outputs\verify.js.preserved" "C:\pattayagym\scripts\verify.js"
```

### 6. Sanity-check the file tree
```cmd
node scripts\verify.js
```
Expected: all 8 checks pass. If not, stop and tell me what failed.

### 7. Commit the preserved verify.js
```cmd
git add scripts/verify.js
git commit -m "Preserve scripts/verify.js across hard revert"
```

### 8. Force-push the new (rewritten) history
**This rewrites remote history. Coordinate if anyone else has a clone.**
```cmd
git push --force-with-lease origin main
```

### 9. Watch the Cloudflare Pages deploy
Cloudflare will redeploy from the new HEAD within ~60 seconds. Hard-refresh (Ctrl+Shift+R) once it's green.

---

## After the revert — house rules going forward

1. **No more bulk visual rewrites.** Design changes are surgical, 5-20 lines per commit max.
2. **`node scripts/verify.js` is mandatory before every push.** If it fails, do not push.
3. **No more Codex visual passes.** Codex stays on technical/data work only.
4. **Screenshot before push.** Open the changed page locally, eyeball it, then commit.
5. **One concern per commit.** No "fix marquee + adjust FAQ + tweak spacing" combo commits.

## Recovery if anything goes wrong

The safety tag from step 3 is your undo button:
```cmd
git reset --hard spiral-end-2026-05-15
git push --force-with-lease origin main
```

That puts you back exactly where you are right now, broken design and all — but at least nothing is lost.
