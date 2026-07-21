@echo off
REM ============================================================
REM PUSH_GEO.cmd
REM
REM Ships the geo-enriched build to production after GEOCODE_VENUES.cmd
REM populated data/venue-geo.json.
REM
REM This is a thin push — just regenerates every page (which now picks
REM up the geo cache automatically) and pushes. No new source changes
REM beyond what GEOCODE_VENUES.cmd wrote.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock

echo.
echo === 2. Confirm branch + geo cache exists ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 ^(on %BRANCH%^) & exit /b 1)
if not exist data\venue-geo.json (
  echo data\venue-geo.json NOT FOUND
  echo Run GEOCODE_VENUES.cmd first
  exit /b 1
)
for /f %%i in ('powershell -Command "(Get-Content data\venue-geo.json -Raw ^| ConvertFrom-Json ^| Get-Member -MemberType NoteProperty).Count"') do set GEO_COUNT=%%i
echo Geo cache: %GEO_COUNT% venue entries

echo.
echo === 3. Syntax check ===
node --check build-v2.js || (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js || (echo data.js syntax FAIL & exit /b 1)

echo.
echo === 4. Build ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. Helper scripts ===
node scripts\rebuild-tool-stubs.js
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js

echo.
echo === 6. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 7. Commit + push redesign-2026 ===
git add -A
git commit -m "ship: geo coordinates from Nominatim cache into LocalBusiness schema" -m "data/venue-geo.json populated by GEOCODE_VENUES.cmd. build-v2.js now injects geo: { '@type': 'GeoCoordinates', latitude, longitude } into every venue's LocalBusiness JSON-LD where Nominatim returned a verified result." -m "Codex Nuclear V3 called this 'the single biggest local-SEO unlock' — venue schema goes from geo 0/158 to whatever Nominatim resolved cleanly (typical 130-150/158)."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 8. Tag + refspec push to main ===
git tag -f main-pre-geo origin/main
git push origin main-pre-geo --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Geo-enriched build SHIPPED.
echo.
echo Verify:
echo   curl.exe -s https://pattaya-gym.com/gyms/fairtex-pattaya/ ^| findstr GeoCoordinates
echo   Should now appear in the LocalBusiness JSON-LD on every resolved venue.
echo.
echo Rollback: git push origin main-pre-geo:main --force-with-lease
echo ============================================================
