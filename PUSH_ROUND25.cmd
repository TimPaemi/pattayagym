@echo off
REM ============================================================
REM PUSH_ROUND25.cmd
REM
REM Round 25 - Area-page FAQs: completing the answer-engine layer.
REM
REM Round 24 added FAQ sections + FAQPage schema to the 15 sport
REM category pages. Round 25 extends that to the 6 neighbourhood /
REM area pages, which are real landing pages for queries such as
REM "gyms in Jomtien". Structured Q&A now covers every category
REM page, every area page, and every guide.
REM
REM   - New data/area-faqs.js: 24 hand-authored Q&A pairs across
REM     all 6 areas (Jomtien, Naklua, Pratamnak, East Pattaya,
REM     Central Pattaya, Sattahip).
REM   - Each area page renders the FAQ accordion (native
REM     <details>, no JavaScript) and emits FAQPage JSON-LD.
REM   - Answers grounded in the existing per-area editorial.
REM
REM Verified: 18 area JSON-LD blocks valid, 6/6 area pages carry
REM a FAQPage block, deploy gate clean.
REM
REM Asset version 420 -> 421.
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
git commit -m "Round 25: area-page FAQs + FAQPage schema - completes the answer-engine layer" -m "Round 24 added FAQ sections + FAQPage schema to the 15 sport category pages. Round 25 extends that to the 6 neighbourhood / area pages, real landing pages for queries such as 'gyms in Jomtien'. Structured Q&A now covers every category page, every area page, and every guide." -m "New data/area-faqs.js: 24 hand-authored Q&A pairs across all 6 areas (Jomtien, Naklua, Pratamnak, East Pattaya, Central Pattaya, Sattahip). Each area page renders the FAQ accordion (native <details>, no JavaScript) and emits FAQPage JSON-LD. Answers grounded in the existing per-area editorial content." -m "Verified: 18 area JSON-LD blocks valid, 6/6 area pages carry a FAQPage block. Asset version 420 -> 421." -m "Note: this push also carries Rounds 22-24 if they were not pushed individually."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 13. Tag rollback + refspec push to main ===
git tag -f main-pre-round25 origin/main
git push origin main-pre-round25 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 14. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 25 SHIPPED.
echo.
echo   Area FAQs:  24 Q&A across all 6 neighbourhood pages
echo   Schema:     6/6 area pages emit FAQPage JSON-LD
echo   Coverage:   structured Q&A now on categories + areas + guides
echo   Asset version: 420 -^> 421
echo.
echo Rollback: git push origin main-pre-round25:main --force-with-lease
echo ============================================================
