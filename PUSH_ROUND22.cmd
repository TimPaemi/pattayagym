@echo off
REM ============================================================
REM PUSH_ROUND22.cmd
REM
REM Round 22 - self-audit fixes.
REM
REM Post-Round-21 self-audit. The site passed every structural
REM check (260 pages, 0 truncation, 0 asset-version drift, 0
REM duplicate IDs). Two real issues remained:
REM
REM   SITEMAPS - robots.txt advertised 7 sitemaps, but 6 were
REM     stale legacy files (sitemap-index / -venues / -categories
REM     / -areas / -guides / -core) last generated 11+ days ago
REM     by the retired build-extras.js. Google was being fed
REM     stale, conflicting sitemap data. robots.txt now advertises
REM     only the single live sitemap.xml (256 URLs, regenerated
REM     every build). The 6 stale files are deleted below.
REM     verify-deploy.js now FAILS if robots.txt advertises any
REM     sitemap file that does not exist on disk.
REM
REM   NAV - the /sports/ all-categories hub (added Round 21) is
REM     now in the primary navigation on every generated page,
REM     not just the footer.
REM
REM Asset version 417 -> 418.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
if exist push-output.txt del /f /q push-output.txt
if exist .wrangler rmdir /s /q .wrangler
REM Round 22 - remove the 6 stale legacy sitemaps (keep sitemap.xml)
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
echo === 8. /status.json + changelog + data endpoints ===
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js
if errorlevel 1 (echo write-data-endpoints.js FAIL & exit /b 1)

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
git commit -m "Round 22: self-audit - sitemap consolidation + /sports/ nav link" -m "Post-Round-21 self-audit. The site passed every structural check (260 pages, 0 truncation, 0 asset-version drift, 0 duplicate IDs). Two real issues remained." -m "Sitemaps: robots.txt advertised 7 sitemaps but 6 were stale legacy files (sitemap-index/-venues/-categories/-areas/-guides/-core), last generated 11+ days ago by the retired build-extras.js - Google was being fed stale, conflicting sitemap data. robots.txt now advertises only the single live sitemap.xml (256 URLs, regenerated every build); the 6 stale files are deleted. verify-deploy.js now fails the build if robots.txt advertises any sitemap with no local file." -m "Nav: the /sports/ all-categories hub (added Round 21) is now in the primary navigation on every generated page, not just the footer." -m "Asset version 417 -> 418."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 12. Tag rollback + refspec push to main ===
git tag -f main-pre-round22 origin/main
git push origin main-pre-round22 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 13. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 22 SHIPPED.
echo.
echo   Sitemaps:  7 advertised -^> 1 (6 stale legacy files deleted)
echo   Nav:       /sports/ hub now in primary nav on every page
echo   Deploy gate: +1 (robots.txt sitemap existence check)
echo   Asset version: 417 -^> 418
echo.
echo Rollback: git push origin main-pre-round22:main --force-with-lease
echo ============================================================
