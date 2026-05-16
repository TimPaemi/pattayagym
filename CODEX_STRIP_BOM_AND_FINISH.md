# CODEX — STRIP BOM, VERIFY, COMMIT, PUSH, REPORT

The reset to `8551051` succeeded. The safety tag is pushed. The only thing left is a BOM on `scripts/verify.js` that's blocking Node.

## Strip the BOM, then continue

```cmd
cd C:\pattayagym

REM 1. Rewrite verify.js as UTF-8 without BOM (PowerShell one-liner)
powershell -NoProfile -Command "$c = Get-Content -Raw -Encoding UTF8 'scripts\verify.js'; if ($c[0] -eq [char]0xFEFF) { $c = $c.Substring(1) }; [System.IO.File]::WriteAllText((Resolve-Path 'scripts\verify.js'), $c, (New-Object System.Text.UTF8Encoding $false))"

REM 2. Confirm no BOM (first 3 bytes should NOT be EF BB BF)
powershell -NoProfile -Command "Format-Hex -Path scripts\verify.js -Count 8"

REM 3. Run verify
node scripts\verify.js
REM All 8 checks MUST pass. If not, STOP.

REM 4. Commit
git add scripts/verify.js
git commit -m "Preserve scripts/verify.js across hard revert to 8551051"

REM 5. Force-push with lease
git push --force-with-lease origin main

REM 6. Confirm remote head matches
git log --oneline origin/main -2
REM Top line should be the verify.js preserve commit
REM Second line should be: 8551051 Unify nav site-wide ...

REM 7. Restore reference docs to disk (DO NOT commit)
copy "%TEMP%\CODEX_HARD_REVERT_PROMPT.md" .\ 2>nul
copy "%TEMP%\HARD_REVERT_PLAYBOOK.md"     .\ 2>nul
copy "%TEMP%\CODEX_HARD_REVERT_UNBLOCK.md" .\ 2>nul
copy "%TEMP%\CODEX_STRIP_BOM_AND_FINISH.md" .\ 2>nul
```

## Then spot-check Cloudflare and write the report

Wait ~60 seconds for Cloudflare Pages to redeploy from the new HEAD. Open each URL in a private/incognito window with hard refresh:

- `https://pattaya-gym.com/`
- `https://pattaya-gym.com/category/golf/`
- `https://pattaya-gym.com/gyms/fairtex-pattaya/`
- `https://pattaya-gym.com/guides/best-muay-thai-pattaya/`
- `https://pattaya-gym.com/contact/`
- `https://pattaya-gym.com/about/`

Write `C:\pattayagym\CODEX_HARD_REVERT_REPORT.md` containing:

1. Each completed step (1-7 above) with exit status.
2. `styles.css` line count at HEAD.
3. Full output of `node scripts/verify.js`.
4. For each of the 6 spot-check URLs: one line, either `OK` or `BROKEN: <what's wrong>`.
5. Anything unexpected.

That's the entire job. Do NOT commit the report. Do NOT touch any other files.

## If `git push --force-with-lease` is rejected

Stop and report immediately. Do NOT use plain `--force`. Print the exact rejection message in the report.
