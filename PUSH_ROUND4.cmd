@echo off
REM ============================================================
REM PUSH_ROUND4.cmd
REM Round 4 fixes (Codex Nuclear Audit V2 P0s):
REM
REM P0-1: Homepage truncation repaired (now ends with </html>)
REM P0-2: styles.css unclosed .back-to-top block fixed
REM       + .back-to-top.is-visible rule added
REM       + .skip-link CSS restored
REM       + prefers-reduced-motion block restored
REM       + asset version bumped 404 -> 405 (busts Cloudflare cache)
REM P0-3: CSP hash for back-to-top script added
REM       + 7 stale hashes stripped
REM       + Cloudflare Insights script-src origin allowed
REM P0-guard: scripts/verify-deploy.js (truncation + NUL + CSS brace check)
REM
REM Steps:
REM   1. Run node build-v2.js (regenerate 211 pages with v=405)
REM   2. Run verify-deploy.js (fail-fast on truncation / NULs / CSP gaps)
REM   3. Commit + push redesign-2026
REM   4. Push redesign-2026:main (refspec, no checkout self-destruct)
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock

echo.
echo === 2. Confirm redesign-2026 branch ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (
  echo Not on redesign-2026 - currently on %BRANCH%
  exit /b 1
)

echo.
echo === 3. node --check syntax ===
node --check build-v2.js
if errorlevel 1 (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js
if errorlevel 1 (echo data.js syntax FAIL & exit /b 1)

echo.
echo === 4. Regenerate all pages with new asset version (v=405) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAILED & exit /b 1)

echo.
echo === 5. Pre-push integrity check (verify-deploy.js) ===
node scripts\verify-deploy.js
if errorlevel 1 (
  echo VERIFY FAILED - inspect output above and re-run
  echo Aborting push to avoid shipping broken state
  exit /b 1
)

echo.
echo === 6. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 4 fixes: P0 truncation + CSS + CSP repairs from Codex Nuclear Audit V2" -m "P0-1: Homepage index.html was truncated mid-attribute - restored full footer, body, and html closings." -m "P0-2: styles.css had an unclosed .back-to-top block (270 vs 269 braces). Repaired the brace, restored .back-to-top.is-visible, .skip-link, and prefers-reduced-motion rules that had been swallowed." -m "P0-2 bonus: bumped ASSET_VERSION 404 -> 405 to bust Cloudflare's stale immutable CSS cache." -m "P0-3: _headers CSP: added missing sha256-3sFDjj07/v+AcynubQTiklcYgjsk0m15gevlYPkjOxc= (back-to-top/progress script); stripped 7 stale hashes; added https://static.cloudflareinsights.com to script-src so Cloudflare's beacon stops being blocked." -m "P0-guard: scripts/verify-deploy.js - pre-push integrity check. Fails if any HTML file lacks </html>, ends mid-attribute, or contains NUL bytes; if styles.css braces unbalanced; if any current inline-script hash missing from CSP. Wire this into the PUSH script chain."
if errorlevel 1 echo No commit needed
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 7. Tag rollback point ===
git fetch origin main
git tag -f main-pre-round4 origin/main
git push origin main-pre-round4 --force

echo.
echo === 8. Push redesign-2026 to main via refspec (no checkout) ===
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Round 4 SHIPPED. Cloudflare redeploys in ~60s.
echo.
echo VERIFY URLS:
echo   https://pattaya-gym.com/                        (full page, ends ^</html^>)
echo   https://pattaya-gym.com/styles.css?v=405        (new asset version)
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/   (CSP no longer blocks back-to-top)
echo   https://pattaya-gym.com/_headers (via curl -I)  (CSP has 3 hashes only)
echo.
echo Rollback (production back to pre-Round-4):
echo   git push origin main-pre-round4:main --force-with-lease
echo ============================================================
