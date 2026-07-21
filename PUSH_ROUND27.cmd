@echo off
REM ============================================================
REM PUSH_ROUND27.cmd
REM
REM Round 27 - Network expansion to 11 sites + footer alignment.
REM
REM The TimPaemi / Pattaya Authority empire network grew from 8
REM to 11 sites. Round 27 propagates the full canonical 11-site
REM list across every network reference on pattaya-gym.com.
REM
REM Three new sister sites added everywhere:
REM   - pattaya-medical.com         (Pattaya Medical)
REM   - pattayapets.com             (PattayaPets)
REM   - pattaya-vehicle-rentals.com (Pattaya Vehicle Rentals)
REM
REM Label corrections to match the canonical list:
REM   Coffee Guide          -> Pattaya Coffee
REM   Pattaya Stream        -> Pattaya Villa Stream
REM   TimPaemi (parent)     -> TimPaemi
REM   Restaurant Guide      -> Pattaya Restaurant Guide
REM   School Guide          -> Pattaya School Guide
REM   Visa Help             -> Pattaya Visa Help
REM
REM Footer alignment: 11 entries would stack tall and dominate
REM the footer. New .footer-projects CSS lays the list out as 2
REM columns on desktop and stacks to 1 column on mobile - footer
REM reads balanced on every viewport.
REM
REM Updated across:
REM   - build-v2.js footer() + about + privacy + Person sameAs
REM   - rebuild-tool-stubs.js, build-compare-page.js,
REM     build-plan-page.js, write-changelog.js
REM   - homepage Organization JSON-LD sameAs + footer
REM   - llms.txt sister sites section
REM   - 19 static legacy guide + search pages
REM
REM Verified: 260 pages, 11 li in every footer Projects col,
REM 10-entry Organization sameAs, deploy gate clean.
REM
REM Asset version 422 -> 423.
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
git commit -m "Round 27: network expansion to 11 sites + footer 2-col alignment" -m "The TimPaemi / Pattaya Authority empire network grew from 8 to 11 sites. Round 27 propagates the full canonical 11-site list across every network reference on pattaya-gym.com." -m "Three new sister sites added everywhere: pattaya-medical.com (Pattaya Medical), pattayapets.com (PattayaPets), pattaya-vehicle-rentals.com (Pattaya Vehicle Rentals). Label corrections to match the canonical list: 'Coffee Guide' -> 'Pattaya Coffee', 'Pattaya Stream' -> 'Pattaya Villa Stream', 'TimPaemi (parent)' -> 'TimPaemi', 'Restaurant Guide' -> 'Pattaya Restaurant Guide', 'School Guide' -> 'Pattaya School Guide', 'Visa Help' -> 'Pattaya Visa Help'." -m "Footer alignment: 11 entries would stack tall and dominate the footer. New .footer-projects CSS lays the list out as 2 columns on desktop and stacks to 1 column on mobile - footer reads balanced on every viewport." -m "Updated across build-v2.js (footer + about + privacy + Person sameAs), rebuild-tool-stubs, build-compare-page, build-plan-page, write-changelog, homepage (Organization sameAs + footer), llms.txt, and the 19 static legacy guide + search pages." -m "Asset version 422 -> 423."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 13. Tag rollback + refspec push to main ===
git tag -f main-pre-round27 origin/main
git push origin main-pre-round27 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 14. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 27 SHIPPED.
echo.
echo   Network:      8 -^> 11 sites everywhere (footer, schema,
echo                 llms.txt, about, privacy, 19 static pages)
echo   Footer:       2-column Projects col on desktop, balanced
echo                 on every viewport
echo   Labels:       canonical brand names propagated
echo   Asset version: 422 -^> 423
echo.
echo Rollback: git push origin main-pre-round27:main --force-with-lease
echo ============================================================
