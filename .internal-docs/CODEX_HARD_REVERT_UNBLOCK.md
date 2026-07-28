# CODEX — UNBLOCK FOR HARD REVERT

You stopped at Step 1 of `CODEX_HARD_REVERT_PROMPT.md` because the worktree is dirty. That dirty state is intentional and safe to discard — every changed file is something the reset to `8551051` is going to overwrite anyway. The owner has confirmed: throw it all away.

## Do exactly this, in order. Do not deviate.

### 1. Wipe the worktree clean

```bash
cd C:/pattayagym

REM Preserve verify.js to TEMP FIRST (it lives in 6cd08f3, also present in worktree)
git show 6cd08f3:scripts/verify.js > "%TEMP%\verify.js.preserved"

REM Preserve the revert prompts too, since they are untracked
copy CODEX_HARD_REVERT_PROMPT.md "%TEMP%\CODEX_HARD_REVERT_PROMPT.md"
copy HARD_REVERT_PLAYBOOK.md     "%TEMP%\HARD_REVERT_PLAYBOOK.md"
copy CODEX_HARD_REVERT_UNBLOCK.md "%TEMP%\CODEX_HARD_REVERT_UNBLOCK.md"

REM Sanity check the preserved verify.js
type "%TEMP%\verify.js.preserved" | find /c /v ""
REM Must be ~203 lines. If 0 or wrong, STOP.
```

Then nuke the worktree:

```bash
git reset --hard HEAD
git clean -fd
git status --porcelain
REM Must be empty now. If not, STOP and report.
```

### 2. Resume the original prompt from Step 2 onward

Open `CODEX_HARD_REVERT_PROMPT.md` and run steps 2 through 9 exactly as written. The verify.js you need in Step 6 is already at `%TEMP%\verify.js.preserved` — that step's `git show` command will still work, so just follow the prompt as written.

### 3. After Step 9, restore the prompt files so the owner has them on disk

```bash
copy "%TEMP%\CODEX_HARD_REVERT_PROMPT.md" C:\pattayagym\
copy "%TEMP%\HARD_REVERT_PLAYBOOK.md"     C:\pattayagym\
copy "%TEMP%\CODEX_HARD_REVERT_UNBLOCK.md" C:\pattayagym\
```

These are reference docs, do NOT commit them. Just have them on disk for the owner to read.

### 4. Write the report at `CODEX_HARD_REVERT_REPORT.md` as already specified.

---

## Hard rules — unchanged

- `--force-with-lease`, never plain `--force`.
- No design edits, no CSS edits, no template tweaks, no asset bumps.
- If `node scripts/verify.js` fails after Step 6 of the original prompt, STOP. Do not push.
- The safety tag in Step 4 is non-negotiable. Push it before the reset.
