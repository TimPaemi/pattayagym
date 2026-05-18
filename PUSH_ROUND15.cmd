@echo off
REM ============================================================
REM PUSH_ROUND15.cmd
REM
REM Real Pattaya Sport Stats dashboard at /pattaya-sport-stats/.
REM
REM Was: ~150 words of static bullet lists.
REM Now: server-rendered SVG dashboard with:
REM
REM   - 4 big stat tiles (venues / categories / areas / paid placements)
REM   - Horizontal bar chart: 15 categories ranked by venue count (rotates
REM     through 15 accent colors)
REM   - Horizontal bar chart: 6 neighborhoods ranked by venue count
REM   - SVG donut chart: price-tier distribution (฿/฿฿/฿฿฿/฿฿฿฿) with legend
REM   - Verification freshness breakdown (within 30 / 30-60 / older)
REM   - 4 schema-completeness gauges (body / geo / phone / website)
REM   - Sister-sites cross-link block
REM
REM All inline SVG. No JS, no charting library, no external dependencies.
REM Regenerates on every build from current data.js + venue-geo cache.
REM
REM Asset version bumped 410 -> 411.
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
echo === 4. Build-v2 (regenerates /pattaya-sport-stats/ with live data) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. /status.json + changelog refresh ===
node scripts\write-status-json.js
node scripts\write-changelog.js

echo.
echo === 6. Helper scripts ===
node scripts\rebuild-tool-stubs.js
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js

echo.
echo === 7. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 8. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 15: real /pattaya-sport-stats/ dashboard with server-rendered SVG charts" -m "Was: ~150 words of static bullet lists. Now: dashboard with 4 big-stat tiles, horizontal bar chart of 15 categories, horizontal bar chart of 6 neighborhoods, SVG donut of price-tier distribution, verification freshness breakdown, 4 schema-completeness gauges." -m "All inline SVG — no JS, no charting library, no external dependencies. Numbers regenerate on every build from current data.js + venue-geo cache. Cross-references /api/venues.json and /status.json for the machine-readable equivalent." -m "Novel feature competitors don't have. Visible proof of breadth + transparency. Asset version 410 -> 411."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 9. Tag rollback + refspec push to main ===
git tag -f main-pre-round15 origin/main
git push origin main-pre-round15 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 10. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 15 SHIPPED.
echo.
echo SHOWPIECE:
echo   https://pattaya-gym.com/pattaya-sport-stats/
echo   Should now be a visual dashboard with multiple SVG charts.
echo.
echo Rollback: git push origin main-pre-round15:main --force-with-lease
echo ============================================================
