@echo off
REM ============================================================
REM PUSH_ROUND23.cmd
REM
REM Round 23 - Plan My Trip: a real, data-driven trip planner.
REM
REM Extended the site with a genuine new tool. /plan-my-trip/ had
REM been an honest "being rebuilt" stub since Round 7. It is now a
REM real, working, client-side trip planner built on the 158-venue
REM dataset.
REM
REM   - New scripts/build-plan-page.js generates /plan-my-trip/.
REM     The visitor answers 4 questions (sport, trip length,
REM     budget, travel style) and gets a tailored plan: a ranked
REM     base venue, a training structure keyed to trip length,
REM     complementary venues for rest days, and practical notes.
REM
REM   - Honest by design - uses only data the venue set genuinely
REM     supports (category, price tier, editor picks, and the
REM     family / stay-and-train / drop-in tag clusters). The messy
REM     free-text area field is deliberately NOT a filter.
REM
REM   - Pure client-side, no external dependencies. Bookmarkable
REM     ?sport=&length=&budget=&style= URLs. Ranks on fit only.
REM
REM   - Page is now indexable (was noindex), back in llms.txt and
REM     the sitemap. rebuild-tool-stubs.js no longer stubs it.
REM
REM   - New .plan-select CSS for the dark-theme form selects.
REM
REM Asset version 418 -> 419.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
if exist push-output.txt del /f /q push-output.txt
if exist .wrangler rmdir /s /q .wrangler
REM Stale legacy sitemaps (Round 22) - delete here too so Round 23 is self-sufficient
REM whether or not PUSH_ROUND22.cmd was run first.
for %%S in (sitemap-index.xml sitemap-venues.xml sitemap-categories.xml sitemap-areas.xml sitemap-guides.xml sitemap-core.xml) do (
  if exist "%%S" del /f /q "%%S"
)

echo.
echo === 2. Branch check ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 ^(on %BRANCH%^) & exit /b 1)

echo.
echo === 3. Syntax check ===
node --check build-v2.js || (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js || (echo data.js syntax FAIL & exit /b 1)
node --check search-page.js || (echo search-page.js syntax FAIL & exit /b 1)
node --check scripts\build-compare-page.js || (echo build-compare-page.js syntax FAIL & exit /b 1)
node --check scripts\build-plan-page.js || (echo build-plan-page.js syntax FAIL & exit /b 1)
node --check scripts\rebuild-tool-stubs.js || (echo rebuild-tool-stubs.js syntax FAIL & exit /b 1)
node --check scripts\write-changelog.js || (echo write-changelog.js syntax FAIL & exit /b 1)
node --check scripts\write-status-json.js || (echo write-status-json.js syntax FAIL & exit /b 1)
node --check scripts\write-data-endpoints.js || (echo write-data-endpoints.js syntax FAIL & exit /b 1)
node --check scripts\verify-deploy.js || (echo verify-deploy.js syntax FAIL & exit /b 1)
node --check scripts\sync-csp-hashes.js || (echo sync-csp-hashes.js syntax FAIL & exit /b 1)
node --check scripts\bump-legacy-assets.js || (echo bump-legacy-assets.js syntax FAIL & exit /b 1)

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
echo === 8. Real /plan-my-trip/ page ===
node scripts\build-plan-page.js
if errorlevel 1 (echo build-plan-page.js FAIL & exit /b 1)

echo.
echo === 9. /status.json + changelog + data endpoints ===
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js
if errorlevel 1 (echo write-data-endpoints.js FAIL & exit /b 1)

echo.
echo === 10. Helper scripts ===
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js

echo.
echo === 11. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 12. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 23: Plan My Trip - real data-driven trip planner" -m "Extended the site with a genuine new tool. /plan-my-trip/ had been an honest 'being rebuilt' stub since Round 7; it is now a real, working, client-side trip planner built on the 158-venue dataset." -m "New scripts/build-plan-page.js: the visitor answers four questions (sport, trip length, budget, travel style) and gets a tailored plan - a ranked base venue, a training structure keyed to trip length, complementary venues for rest days, and practical notes. Honest by design: uses only data the venue set genuinely supports (category, price tier, editor picks, family / stay-and-train / drop-in tag clusters); the messy free-text area field is not a filter." -m "Pure client-side, no external dependencies; bookmarkable ?sport=&length=&budget=&style= URLs; ranks on fit only, no paid placements. The page is now indexable (was noindex) and back in llms.txt + the sitemap; rebuild-tool-stubs.js no longer overwrites it. New .plan-select dark-theme CSS." -m "Asset version 418 -> 419."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 13. Tag rollback + refspec push to main ===
git tag -f main-pre-round23 origin/main
git push origin main-pre-round23 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 14. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 23 SHIPPED.
echo.
echo   New tool:   /plan-my-trip/ is a real trip planner
echo   Indexable:  was noindex stub -^> now indexed + in sitemap + llms.txt
echo   Pages:      260 HTML, verify gate clean
echo   Asset version: 418 -^> 419
echo.
echo Try it live after deploy:
echo   pattaya-gym.com/plan-my-trip/?sport=muay-thai^&length=week^&budget=3^&style=solo
echo.
echo Rollback: git push origin main-pre-round23:main --force-with-lease
echo ============================================================
