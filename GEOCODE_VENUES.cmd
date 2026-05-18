@echo off
REM ============================================================
REM GEOCODE_VENUES.cmd
REM
REM Runs scripts/geocode-venues.js to populate data/venue-geo.json
REM via Nominatim (OpenStreetMap's free geocoder).
REM
REM Time: ~3 minutes for all 158 venues (1.1s throttle per request).
REM Idempotent: re-running only queries venues not already cached.
REM Pass --refresh as argument to force re-query everything.
REM
REM Cache file: data/venue-geo.json (commit this to git)
REM
REM After running, the next build (node build-v2.js OR PUSH_ROUND8.cmd)
REM will inject geo coordinates into the LocalBusiness JSON-LD of every
REM venue that resolved successfully.
REM ============================================================

cd /d C:\pattayagym

echo === Geocoding all 158 venues via Nominatim... ===
echo This takes ~3 minutes. Sit tight.
echo.

node scripts\geocode-venues.js %*
if errorlevel 1 (echo Geocode FAILED & exit /b 1)

echo.
echo ============================================================
echo Geocode complete. Cache written to data\venue-geo.json
echo.
echo Next: run PUSH_ROUND8.cmd to ship the geo-enriched LocalBusiness schema.
echo ============================================================
