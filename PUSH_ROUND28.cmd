@echo off
REM ============================================================
REM PUSH_ROUND28.cmd
REM
REM Round 28 - Pattaya Authority network footer alignment.
REM
REM Applies the network footer prompt: shared tagline +
REM self-exclusion from the sister-site list.
REM
REM   1) Network tagline: "Built in Pattaya. For Pattaya."
REM      - rendered under the pattaya.gym wordmark in every
REM        footer (260 pages)
REM      - added to Organization JSON-LD on the homepage as the
REM        "slogan" field for schema-graph recognition
REM
REM   2) Footer Projects: self-link removed per the canonical
REM      Pattaya Authority spec - the Projects column lists the
REM      10 OTHER network sites (a site does not link to itself).
REM
REM   3) New .footer-slogan CSS: mono cyan strapline that fits
REM      the existing dark-theme palette.
REM
REM Verified: 260 pages, tagline present on every page, self-link
REM absent everywhere, 10 li in every footer Projects col,
REM Organization.slogan present in homepage JSON-LD, deploy gate
REM passes clean.
REM
REM Asset version 423 -> 424.
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
git commit -m "Round 28: Pattaya Authority network tagline + footer self-exclusion" -m "Applies the Pattaya Authority network footer prompt to pattaya-gym.com: shared tagline added under the brand wordmark, and self-exclusion from the sister-site Projects list per the canonical spec." -m "Network tagline: 'Built in Pattaya. For Pattaya.' rendered under the pattaya.gym wordmark on every page (260 pages), and added to Organization JSON-LD on the homepage as 'slogan' for schema-graph recognition." -m "Footer Projects: the self-link <a href='/'>Pattaya Gym</a> is removed so the list shows the 10 OTHER network sites - a site should not link to itself in its network list. New .footer-slogan CSS (mono cyan strapline) fits the existing dark-theme palette." -m "Asset version 423 -> 424."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 8. Tag rollback + refspec push to main ===
git tag -f main-pre-round28 origin/main
git push origin main-pre-round28 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 9. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 28 SHIPPED.
echo.
echo   Tagline:      "Built in Pattaya. For Pattaya." on every page
echo   Org schema:   slogan field added on homepage
echo   Footer:       self-exclusion applied (11 -^> 10 sister sites)
echo   Asset version: 423 -^> 424
echo.
echo Rollback: git push origin main-pre-round28:main --force-with-lease
echo ============================================================
