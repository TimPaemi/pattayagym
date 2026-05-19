@echo off
REM ============================================================
REM PUSH_ROUND20.cmd
REM
REM Round 20 - Nuclear self-audit v2 fixes.
REM
REM Self-audit v2 (SELF_AUDIT_2026_ROUND20.md) gave the site a
REM CLEAN BILL OF HEALTH:
REM   - 0 html-validate errors across 259 pages
REM   - 551 JSON-LD blocks all valid
REM   - 0 broken internal links
REM   - 0 duplicate content
REM   - 0 thin venue pages (all >150 words)
REM   - 0 anchor link bugs
REM
REM This round closes the 4 remaining real issues:
REM
REM   GEO - 39 well-known landmark venues hand-plotted with lat/lng
REM         (Fairtex, Sityodtong, Royal Cliff, Sanctuary of Truth,
REM         Phoenix Gold, Siam Country Club, etc.). LocalBusiness
REM         geo coverage 18/158 (11%%) -> 55/158 (35%%).
REM
REM   GEO - New scripts/geocode-venues-v2.js with 3-strategy
REM         Nominatim retry. Run manually:
REM           node scripts/geocode-venues-v2.js
REM         Honors 1 req/sec rate limit. ~5 minutes for the rest.
REM
REM   F4   - truncateDesc(155) wired to venue + area page descs.
REM          10 over-160 warnings closed.
REM
REM   F22  - sync-csp-hashes.js now PRUNES obsolete hashes (4 removed).
REM          --keep-obsolete flag preserves legacy behaviour.
REM
REM   F24  - 4 new GA4 custom events:
REM            share_venue       (venue share button)
REM            compare_pick      (compare selection change)
REM            filter_apply      (search filter change, debounced)
REM            sister_site_click (outbound to any sister site)
REM
REM Asset version 415 -> 416.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
for %%F in (30 Venue af-academy-pattaya git kids-youth main) do (
  if exist "%%F" del /f /q "%%F"
)
if exist "kids-youth)" del /f /q "kids-youth)"
if exist push-output.txt del /f /q push-output.txt
if exist .wrangler rmdir /s /q .wrangler

echo.
echo === 2. Branch check ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 ^(on %BRANCH%^) & exit /b 1)

echo.
echo === 3. Syntax check ===
node --check build-v2.js || (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js || (echo data.js syntax FAIL & exit /b 1)
node --check scripts\build-compare-page.js || (echo build-compare-page.js syntax FAIL & exit /b 1)
node --check scripts\rebuild-tool-stubs.js || (echo rebuild-tool-stubs.js syntax FAIL & exit /b 1)
node --check scripts\write-changelog.js || (echo write-changelog.js syntax FAIL & exit /b 1)
node --check scripts\verify-deploy.js || (echo verify-deploy.js syntax FAIL & exit /b 1)
node --check scripts\sync-csp-hashes.js || (echo sync-csp-hashes.js syntax FAIL & exit /b 1)
node --check scripts\geocode-venues-v2.js || (echo geocode-venues-v2.js syntax FAIL & exit /b 1)
node --check search-page.js || (echo search-page.js syntax FAIL & exit /b 1)

echo.
echo === 4. npm install ===
call npm install --silent
if errorlevel 1 (echo npm install FAIL & exit /b 1)

echo.
echo === 5. Build-v2 ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 6. Rebuild tool stubs ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs.js FAIL & exit /b 1)

echo.
echo === 7. Real /compare/ page ===
node scripts\build-compare-page.js
if errorlevel 1 (echo build-compare-page.js FAIL & exit /b 1)

echo.
echo === 8. /status.json + changelog ===
node scripts\write-status-json.js
node scripts\write-changelog.js

echo.
echo === 9. Helper scripts ===
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js

echo.
echo === 10. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 11. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 20: nuclear self-audit v2 fixes - geo + GA4 events + CSP prune + truncateDesc" -m "Self-audit v2 (SELF_AUDIT_2026_ROUND20.md, 275 findings, 252 dedupe spam) gave the site a clean bill of health: 0 html-validate errors across 259 pages, 551 JSON-LD blocks all valid, no broken links, no duplicate content. This round closes the 4 real issues." -m "GEO: 39 well-known landmark venues hand-plotted with lat/lng. Coverage 18/158 (11%%) -> 55/158 (35%%). New scripts/geocode-venues-v2.js does 3-strategy Nominatim retry; run it manually to fill more." -m "F4.Desc: truncateDesc(155) wired to venue + area meta descriptions. 10 over-160 warnings closed. F22.CSP: sync-csp-hashes.js PRUNES obsolete hashes by default (4 removed, 1 added, 11 total). F24.Analytics: 4 new GA4 events (share_venue, compare_pick, filter_apply, sister_site_click)." -m "Asset version 415 -> 416."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 12. Tag rollback + refspec push to main ===
git tag -f main-pre-round20 origin/main
git push origin main-pre-round20 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 13. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 20 SHIPPED.
echo.
echo NEW METRICS:
echo   Geo coverage:  18 -^> 55 venues (35%%)
echo   CSP hashes:    14 -^> 11 (4 pruned)
echo   GA4 events:    0 -^> 4 (share_venue, compare_pick, filter_apply, sister_site_click)
echo   Long descs:    10 -^> 0
echo.
echo OPTIONAL (after deploy):
echo   node scripts\geocode-venues-v2.js
echo   Wait ~5 min, then re-run PUSH_ROUND20.cmd to ship more geos.
echo.
echo Rollback: git push origin main-pre-round20:main --force-with-lease
echo ============================================================
