@echo off
REM ============================================================
REM PUSH_ROUND11.cmd
REM
REM Trust + usability + polish pass. Code-only, no editorial dependency.
REM
REM What ships:
REM   1. Per-venue "★ Verified by Tim · [date]" badge in every venue hero
REM      (uses existing `verified:` field in data.js)
REM   2. Trust signals row site-wide — "Hand-checked · No paid placement ·
REM      How we rank" pills below every venue hero
REM   3. Author byline + reading time on every guide page
REM      ("By Tim Paemi · 8 min read · Updated 2026-05-18 · How we rank")
REM   4. Public /changelog/ page documenting all 11 rounds shipped
REM   5. Pattaya local-time widget in every footer
REM      (live ICT clock — useful for visitors checking from abroad)
REM   6. Print stylesheet — venue pages print cleanly for offline use
REM   7. Larger footer version badge linking to /changelog/
REM   8. Asset version bumped 406 -> 407
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
node --check scripts\write-changelog.js || (echo write-changelog.js syntax FAIL & exit /b 1)

echo.
echo === 4. Build-v2 (verified badges + trust pills + footer time widget) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. Write changelog page ===
node scripts\write-changelog.js
if errorlevel 1 (echo write-changelog FAIL & exit /b 1)

echo.
echo === 6. Rebuild tool stubs (catches up to new footer/version) ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs FAIL & exit /b 1)

echo.
echo === 7. Inject guide schema + bylines ===
node scripts\inject-guide-schema.js
if errorlevel 1 (echo inject-guide-schema FAIL & exit /b 1)

echo.
echo === 8. Sync legacy pages to v407 ===
node scripts\bump-legacy-assets.js
if errorlevel 1 (echo bump-legacy-assets FAIL & exit /b 1)

echo.
echo === 8b. Auto-sync CSP hashes from current inline scripts ===
node scripts\sync-csp-hashes.js
if errorlevel 1 (echo sync-csp-hashes FAIL & exit /b 1)

echo.
echo === 9. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (
  echo VERIFY FAILED - inspect output above
  echo Note: new inline script for Pattaya time widget will have a new sha256 hash.
  echo If verify reports a missing hash, add it to _headers CSP and re-run.
  exit /b 1
)

echo.
echo === 10. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 11: trust signals + bylines + changelog + Pattaya time widget" -m "Per-venue hero now shows '★ Verified by Tim · [verified date]' badge using the existing verified field in data.js. Plus '100%% Hand-checked', 'No paid placement', and 'How we rank →' trust pills on every venue page. Big visible trust signal that was previously buried in the venue info table." -m "Guide pages now display a byline strip after the h1: 'By Tim Paemi · [N] min read · Updated [date] · How we rank →'. Reading time auto-calculated from body word count at 200 wpm. E-E-A-T win." -m "NEW: public /changelog/ page documenting all 11 rounds shipped with date, version tag, summary, and per-bullet detail. Linked from the footer version badge. Operational transparency signal." -m "NEW: live Pattaya local-time widget in every footer ('Pattaya · 17:42 ICT'). Updates every 30 seconds via a small inline script. Useful for tourists checking the site from abroad." -m "NEW: print stylesheet — venue pages print cleanly (hides marquee/nav/footer/back-to-top; black text on white; external link URLs shown inline)." -m "Footer version badge enlarged + linked to /changelog/. Asset version bumped 406 -> 407."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 11. Tag rollback + refspec push to main ===
git tag -f main-pre-round11 origin/main
git push origin main-pre-round11 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Round 11 SHIPPED.
echo.
echo VERIFY:
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/  (verified badge in hero, trust pills)
echo   https://pattaya-gym.com/guides/best-muay-thai-pattaya/  (byline + reading time after h1)
echo   https://pattaya-gym.com/changelog/  (NEW — public changelog of 11 rounds)
echo   Bottom of any page: footer shows live Pattaya time and clickable v407 badge
echo.
echo Rollback: git push origin main-pre-round11:main --force-with-lease
echo ============================================================
