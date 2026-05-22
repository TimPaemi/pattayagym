@echo off
REM ============================================================
REM PUSH_ROUND21.cmd
REM
REM Round 21 - Codex nuclear audit Round 21 fixes.
REM
REM Codex Round 21 audit (CODEX_REPORT_2026_ROUND21.md) found
REM 0 P0, 5 P1, 10 P2, 8 P3. Top finding: release-state drift -
REM asset version, font preloads, status.json, changelog and the
REM API metadata did not all agree. This round closes it.
REM
REM   P1-1  Version - one canonical asset version (417) across
REM         build-v2.js, every page, font preloads, status.json,
REM         API endpoints and changelog. Round 20's intended 416
REM         bump never propagated (fonts stranded on 414/416).
REM         verify-deploy.js now FAILS on any stale ?v= ref.
REM
REM   P1-3  Tools - Find My Coach / Plan My Trip / Favorites are
REM         noindex,follow and dropped from llms.txt + sitemap
REM         until they ship as real tools.
REM
REM   P1-4  Trust - softened over-strong verification copy.
REM
REM   P1-5  Linking - new /sports/ hub links all 15 categories so
REM         BJJ + every sport is reachable from the homepage.
REM
REM   P2    Dangling-pipe titles, richer meta descriptions,
REM         unified sister-network footer across 20 pages,
REM         duplicate compare-status removed, open-now honors
REM         weekday/season, 3 unused CSP origins trimmed,
REM         7 venue links upgraded to HTTPS.
REM
REM   New scripts/write-data-endpoints.js regenerates the JSON
REM   API + feed every build (P2-8 freshness).
REM
REM   P3    Removed dead compare.js, stray file 70, root archive
REM         files; added .editorconfig; fixed og-image cache.
REM
REM Asset version 415 -> 417.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
for %%F in (30 Venue af-academy-pattaya git kids-youth main 70) do (
  if exist "%%F" del /f /q "%%F"
)
if exist "kids-youth)" del /f /q "kids-youth)"
if exist compare.js del /f /q compare.js
if exist push-output.txt del /f /q push-output.txt
del /f /q pattayagym_*.zip 2>nul
del /f /q pattayagym_*.tar.gz 2>nul
if exist .wrangler rmdir /s /q .wrangler

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
git commit -m "Round 21: Codex nuclear audit R21 - version consolidation + P1/P2 fixes" -m "Codex Round 21 audit (CODEX_REPORT_2026_ROUND21.md) found 0 P0, 5 P1, 10 P2, 8 P3. Top finding was release-state drift: asset version, font preloads, status.json, changelog and API metadata did not agree." -m "P1-1 Version: one canonical asset version (417) everywhere. Round 20's intended 416 bump never propagated - font preloads were stranded on 414/416. verify-deploy.js now fails the build on any stale ?v= asset reference. P1-3: Find My Coach / Plan My Trip / Favorites are noindex,follow and dropped from llms.txt + sitemap. P1-4: softened over-strong verification copy. P1-5: new /sports/ hub links all 15 categories so BJJ is reachable from the homepage crawl graph." -m "P2: fixed dangling-pipe category-area titles, enriched short meta descriptions, unified the sister-network footer across 20 pages, removed a duplicate compare-status live region, taught search open-now to honor weekday + seasonal hours, trimmed 3 unused CSP origins, upgraded 7 venue links to HTTPS. New scripts/write-data-endpoints.js regenerates the JSON API + feed every build. P3: removed dead compare.js + stray files + root archives, added .editorconfig, fixed og-image cache TTL." -m "Asset version 415 -> 417."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 12. Tag rollback + refspec push to main ===
git tag -f main-pre-round21 origin/main
git push origin main-pre-round21 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 13. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 21 SHIPPED.
echo.
echo NEW METRICS:
echo   Asset version:  415 -^> 417 (consolidated, was drifting 414/415/416)
echo   New page:       /sports/ hub - all 15 categories linked
echo   Sitemap URLs:   258 -^> 256 (3 unbuilt tools out, /sports/ in)
echo   Deploy gates:   +2 (asset-version drift, duplicate-id)
echo   CSP origins:    trimmed 3 unused (plausible, unpkg, CF Insights)
echo.
echo OPTIONAL (after deploy) - improves P1-2 geo coverage:
echo   node scripts\geocode-venues-v2.js
echo   Wait ~5 min, then re-run PUSH_ROUND21.cmd to ship more geos.
echo.
echo Rollback: git push origin main-pre-round21:main --force-with-lease
echo ============================================================
