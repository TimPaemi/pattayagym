@echo off
REM ============================================================
REM FIX_AND_PUSH_CENTERING.cmd
REM Run from C:\pattayagym in a normal cmd window.
REM
REM What it does:
REM   1. Restores all HTML files from HEAD (fixes 212 truncated
REM      files + 3 with null-byte pollution).
REM   2. Re-applies the v=225 -> v=235 sed bump in all HTML.
REM   3. Runs node scripts\verify.js.
REM   4. Commits and force-pushes-with-lease.
REM
REM Preserves on disk:
REM   - styles.css (your centering fix block at line ~5662)
REM   - build.js, build-extras.js, build-discovery.js
REM     (ASSET_VERSION already bumped to 235)
REM ============================================================

cd /d C:\pattayagym

REM 1. Clear any stale git locks
del /f /q .git\index.lock 2>nul
del /f /q .git\HEAD.lock  2>nul

REM 2. Restore every HTML file from HEAD (NOT styles.css / build*.js — they keep our edits)
git checkout HEAD -- "*.html"
if errorlevel 1 (
  echo Failed to restore HTML from HEAD. Stopping.
  exit /b 1
)

REM 3. Re-apply the v=225 -> v=235 bump in HTML (PowerShell because cmd has no sed)
powershell -NoProfile -Command "Get-ChildItem -Recurse -Filter *.html -Path . | Where-Object { $_.FullName -notmatch '\\.git\\' } | ForEach-Object { (Get-Content $_.FullName -Raw -Encoding UTF8) -replace 'styles\.css\?v=225','styles.css?v=235' | Set-Content -NoNewline -Encoding UTF8 $_.FullName }"

REM 4. Verify
node scripts\verify.js
if errorlevel 1 (
  echo verify.js failed. Do NOT push. Stopping.
  exit /b 1
)

REM 5. Commit
git add -A
git commit -m "fix(layout): universal centering for .venue-page children + bump v=235

- Add `.venue-page > *` chassis: max-width 1320px, auto margins, 32px pad
- Mirrors the homepage .wrap pattern so non-allowlisted direct children
  (.tool-grid, .channels, .tldr section, h2#full-list, etc.) stop drifting left
- Full-bleed opt-outs preserved for .marquee, .marquee-bottom, .full-bleed
- Override legacy h2#full-list left-pin and .channels margin:32px 0
- Bump ASSET_VERSION 225 -> 235 in all 3 build files + all HTML refs
- All 8 verify.js checks pass"

REM 6. Force-push (with lease)
git push --force-with-lease origin main
if errorlevel 1 (
  echo Push rejected. Investigate before retrying. Do NOT use plain --force.
  exit /b 1
)

echo.
echo ============================================================
echo Pushed. Wait 60s for Cloudflare to redeploy, then hard-refresh
echo any subpage and verify the centering.
echo Spot-check URLs:
echo   https://pattaya-gym.com/category/fitness/
echo   https://pattaya-gym.com/find-my-coach/
echo   https://pattaya-gym.com/guides/
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/
echo ============================================================
