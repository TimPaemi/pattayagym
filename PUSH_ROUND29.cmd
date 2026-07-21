@echo off
REM ============================================================
REM PUSH_ROUND29.cmd
REM
REM Round 29 - Homepage "What we operate" rebuilt as the
REM 11-property network grid.
REM
REM The homepage verticals section was factually wrong after
REM the network expanded to 11 ("One agency. Four verticals.").
REM Round 29 rebuilds it as an accurate, scalable 11-tile network
REM grid - one agency + ten editorial verticals.
REM
REM   - Headline updated: "One agency. Four verticals." -> "One
REM     agency. Ten verticals."
REM   - Intro rewritten: 10 editorial verticals + the flagship
REM     Pattaya Authority agency (not 4 sites).
REM   - Grid expanded from 4 big cards to 11 compact network
REM     tiles. Auto-fit responsive (1 col mobile, 2 col tablet,
REM     3-4 col desktop).
REM   - New tiles: TimPaemi (parent), Pattaya School Guide,
REM     Pattaya Coffee, Pattaya Villa Stream, Pattaya Medical,
REM     PattayaPets, Pattaya Vehicle Rentals.
REM   - Pattaya Gym tile marked "// Fitness vertical * this site".
REM   - Tiles cycle the 4 existing accent colours (pink / yellow
REM     / cyan / mint) - no new CSS classes per vertical.
REM
REM Asset version 424 -> 425. Deploy gate clean.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
if exist push-output.txt del /f /q push-output.txt
if exist .wrangler rmdir /s /q .wrangler
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
node --check data\category-faqs.js || (echo category-faqs.js syntax FAIL & exit /b 1)
node --check data\area-faqs.js || (echo area-faqs.js syntax FAIL & exit /b 1)
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
echo === 5. Build pipeline ===
node build-v2.js || (echo build-v2.js FAIL & exit /b 1)
node scripts\rebuild-tool-stubs.js || (echo rebuild-tool-stubs.js FAIL & exit /b 1)
node scripts\build-compare-page.js || (echo build-compare-page.js FAIL & exit /b 1)
node scripts\build-plan-page.js || (echo build-plan-page.js FAIL & exit /b 1)
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js || (echo write-data-endpoints.js FAIL & exit /b 1)
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js

echo.
echo === 6. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 7. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 29: homepage 'What we operate' rebuilt as 11-tile network grid" -m "The homepage verticals section was factually wrong ('Four verticals') after the network expanded to 11. Round 29 rebuilds it as an accurate, scalable 11-tile network grid - one agency + ten editorial verticals, each with its own tile." -m "Headline 'One agency. Four verticals.' -> 'One agency. Ten verticals.' Intro rewritten to reflect 10 editorial verticals + the flagship Pattaya Authority agency. Grid expanded from 4 big cards to 11 compact tiles with auto-fit responsive layout (1 col mobile, 2 col tablet, 3-4 col desktop). New tiles: TimPaemi (parent), Pattaya School Guide, Pattaya Coffee, Pattaya Villa Stream, Pattaya Medical, PattayaPets, Pattaya Vehicle Rentals. Existing four tiles retained. Tiles cycle the 4 existing accent colours - no new CSS classes per vertical." -m "Asset version 424 -> 425."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 8. Tag rollback + refspec push to main ===
git tag -f main-pre-round29 origin/main
git push origin main-pre-round29 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 9. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 29 SHIPPED.
echo.
echo   Section:     4 big cards -^> 11 compact network tiles
echo   Headline:    "One agency. Ten verticals."
echo   New tiles:   TimPaemi, School, Coffee, Stream, Medical,
echo                PattayaPets, Vehicle Rentals
echo   Layout:      auto-fit responsive (1/2/3-4 cols by viewport)
echo   Asset version: 424 -^> 425
echo.
echo Rollback: git push origin main-pre-round29:main --force-with-lease
echo ============================================================
