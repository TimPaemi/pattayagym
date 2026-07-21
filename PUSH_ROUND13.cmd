@echo off
REM ============================================================
REM PUSH_ROUND13.cmd
REM
REM Functional + E-E-A-T pass — three visible improvements per venue page:
REM
REM   1. LIVE "Open now" indicator in the trust bar.
REM      Reads parsed openingHoursSpecification from data, compares to
REM      current Pattaya time client-side, renders:
REM        green "● Open · closes 18:30" when within hours
REM        red   "○ Closed · opens 07:30 (tomorrow)" when outside
REM      Works on the 37 venues with parseable hours; static "Verified by
REM      Tim" pill remains the trust signal for the rest.
REM
REM   2. NEW "↗ Share" button in the venue action row.
REM      Uses navigator.share() (Web Share API) on mobile, clipboard
REM      fallback on desktop with "✓ Link copied" feedback. Tourists
REM      share venue picks with friends in two taps.
REM
REM   3. Person schema for Tim on /about/.
REM      JSON-LD Person node (@id pattaya-gym.com/about/#tim-paemi)
REM      with name, jobTitle, knowsAbout, worksFor link to Organization,
REM      sameAs links to 3 sister sites. Visible author = E-E-A-T win.
REM
REM   4. Asset version bumped 408 -> 409.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock

echo.
echo === 2. Branch check ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 ^(on %BRANCH%^) & exit /b 1)

echo.
echo === 3. Syntax check ===
node --check build-v2.js || (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js || (echo data.js syntax FAIL & exit /b 1)

echo.
echo === 4. Build-v2 (open-now indicator + share button + Person schema) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. /status.json refresh ===
node scripts\write-status-json.js
if errorlevel 1 (echo write-status-json FAIL & exit /b 1)

echo.
echo === 6. Changelog refresh ===
node scripts\write-changelog.js
if errorlevel 1 (echo write-changelog FAIL & exit /b 1)

echo.
echo === 7. Tool stubs ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs FAIL & exit /b 1)

echo.
echo === 8. Guide schema + bylines ===
node scripts\inject-guide-schema.js
if errorlevel 1 (echo inject-guide-schema FAIL & exit /b 1)

echo.
echo === 9. Sync legacy pages to v409 ===
node scripts\bump-legacy-assets.js
if errorlevel 1 (echo bump-legacy-assets FAIL & exit /b 1)

echo.
echo === 10. Auto-sync CSP hashes (open-now + share inline scripts will add new hashes) ===
node scripts\sync-csp-hashes.js
if errorlevel 1 (echo sync-csp-hashes FAIL & exit /b 1)

echo.
echo === 11. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 12. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 13: live open-now indicator + share button + Person schema" -m "LIVE 'Open now' indicator in venue trust bar — reads parsed openingHoursSpecification client-side, compares to Pattaya time, swaps text to 'Open · closes 18:30' (green) or 'Closed · opens 07:30 (tomorrow)' (red). Works on the 37 venues with parseable hours." -m "NEW '↗ Share' button in venue action row. Uses navigator.share() on mobile (native share sheet), clipboard fallback on desktop with '✓ Link copied' feedback. Tourists share picks with friends in two taps." -m "Person JSON-LD schema for Tim Paemi on /about/. Includes name, jobTitle, knowsAbout array, worksFor link to Organization, sameAs to 3 sister sites. Visible author = E-E-A-T win." -m "Asset version 408 -> 409. CSP hashes auto-synced via sync-csp-hashes.js."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 13. Tag rollback + refspec push to main ===
git tag -f main-pre-round13 origin/main
git push origin main-pre-round13 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 14. Ping sitemap to Google + Bing ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 13 SHIPPED.
echo.
echo VERIFY in your browser:
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/
echo   - Look at trust bar near hero: should now show "● Open · closes 10:30"
echo     or "○ Closed · opens 07:30 (tomorrow)" depending on current Pattaya time
echo   - Click "↗ Share" in action row: on mobile it opens share sheet;
echo     on desktop "✓ Link copied" appears
echo.
echo Page source on /about/ should include Person JSON-LD for Tim Paemi.
echo.
echo Rollback: git push origin main-pre-round13:main --force-with-lease
echo ============================================================
