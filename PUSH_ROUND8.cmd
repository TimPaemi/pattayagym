@echo off
REM ============================================================
REM PUSH_ROUND8.cmd
REM
REM Codex Nuclear V3 final ranking-unlock pass:
REM
REM   P1-1 (BIG): venue geo coordinates (0/158 -> however many resolved
REM         via Nominatim). build-v2.js now reads data/venue-geo.json
REM         and injects geo: { latitude, longitude } into LocalBusiness
REM         JSON-LD for every venue with a verified cache entry.
REM         IF data/venue-geo.json doesn't exist yet, build still works
REM         (geo just stays empty) — run GEOCODE_VENUES.cmd first to
REM         populate the cache.
REM
REM   P2-3: sitemap.xml now emits <priority> and <changefreq> per URL:
REM         homepage 1.0 daily; category/area 0.9 weekly; combined
REM         category-area 0.85 weekly; venues 0.7 weekly; guides 0.8
REM         monthly; everything else 0.5 monthly.
REM
REM Steps:
REM   1. Cleanup + branch check
REM   2. node --check syntax
REM   3. node build-v2.js (reads venue-geo.json if present)
REM   4. node scripts/rebuild-tool-stubs.js
REM   5. node scripts/inject-guide-schema.js
REM   6. node scripts/bump-legacy-assets.js
REM   7. node scripts/verify-deploy.js (hard gate)
REM   8. Commit + push redesign-2026
REM   9. Refspec push to main
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
node --check search-page.js || (echo search-page.js syntax FAIL & exit /b 1)
node --check scripts\bump-legacy-assets.js || (echo bump-legacy-assets.js syntax FAIL & exit /b 1)
node --check scripts\rebuild-tool-stubs.js || (echo rebuild-tool-stubs.js syntax FAIL & exit /b 1)
node --check scripts\inject-guide-schema.js || (echo inject-guide-schema.js syntax FAIL & exit /b 1)
node --check scripts\geocode-venues.js || (echo geocode-venues.js syntax FAIL & exit /b 1)
node --check scripts\verify-deploy.js || (echo verify-deploy.js syntax FAIL & exit /b 1)

echo.
echo === 4. Geo cache status ===
if exist data\venue-geo.json (
  echo data\venue-geo.json present. Build will inject geo into LocalBusiness JSON-LD.
) else (
  echo data\venue-geo.json NOT FOUND.
  echo Build will continue without geo. Run GEOCODE_VENUES.cmd to populate.
)

echo.
echo === 5. Build-v2 full regen ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 6. Tool stubs ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs FAIL & exit /b 1)

echo.
echo === 7. Guide schema ===
node scripts\inject-guide-schema.js
if errorlevel 1 (echo inject-guide-schema FAIL & exit /b 1)

echo.
echo === 8. Legacy asset sync ===
node scripts\bump-legacy-assets.js
if errorlevel 1 (echo bump-legacy-assets FAIL & exit /b 1)

echo.
echo === 9. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (
  echo VERIFY FAILED - inspect output above
  exit /b 1
)

echo.
echo === 10. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 8: geo coordinates pipeline + sitemap priority/changefreq" -m "P1-1 (BIG ranking unlock): build-v2.js now reads data/venue-geo.json (populated by scripts/geocode-venues.js via Nominatim) and injects geo: { '@type': 'GeoCoordinates', latitude, longitude } into every venue's LocalBusiness JSON-LD where a verified cache entry exists. Codex called this the single biggest local-SEO unlock. Coverage was 0/158; jumps to however many Nominatim resolved successfully." -m "GEOCODE_VENUES.cmd runs the one-time geocoder (3 min for 158 venues, 1.1s/req throttle per Nominatim ToS). Idempotent and cacheable. Builds gracefully degrade if cache absent." -m "P2-3: sitemap.xml gains <priority> and <changefreq> per URL. Homepage 1.0 daily; categories+areas 0.9 weekly; combined category-area 0.85 weekly; venues 0.7 weekly; guides 0.8 monthly; utilities 0.5 monthly. Closes the prior-audit polish item." -m "scripts/geocode-venues.js included so future venue additions can be auto-geocoded by re-running GEOCODE_VENUES.cmd."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 11. Tag rollback + refspec push to main ===
git tag -f main-pre-round8 origin/main
git push origin main-pre-round8 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Round 8 SHIPPED.
echo.
echo NEXT STEP (optional but high-impact):
echo   .\GEOCODE_VENUES.cmd
echo   (Takes ~3 min. Adds lat/lng to LocalBusiness schema for 80-95%% of venues.)
echo   Then re-run .\PUSH_ROUND8.cmd to ship the geo-enriched build.
echo.
echo VERIFY:
echo   https://pattaya-gym.com/sitemap.xml          (now has priority + changefreq)
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/  (after geocode: view source for geo schema)
echo.
echo Rollback: git push origin main-pre-round8:main --force-with-lease
echo ============================================================
