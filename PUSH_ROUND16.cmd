@echo off
REM ============================================================
REM PUSH_ROUND16.cmd
REM
REM Round 16: make /compare/ a real, functional, client-side
REM side-by-side venue comparison tool.
REM
REM Was: honest static stub from Round 7 telling users to use /search/.
REM Now: pick up to 4 of 158 venues, see 12 attributes side-by-side,
REM       bookmarkable + shareable URL state (?a=&b=&c=&d=).
REM
REM Key bits:
REM   - scripts/build-compare-page.js (NEW) generates /compare/index.html
REM     with all 158-venue summary JSON embedded, picker UI, comparison
REM     table, 3 presets, Web Share API + clipboard fallback.
REM   - scripts/rebuild-tool-stubs.js updated to SKIP 'compare' (the
REM     real builder owns that slug now).
REM   - changelog.js gets entries for rounds 12-16 backfilled.
REM
REM Asset version bumped 411 -> 412.
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
node --check scripts\build-compare-page.js || (echo build-compare-page.js syntax FAIL & exit /b 1)
node --check scripts\rebuild-tool-stubs.js || (echo rebuild-tool-stubs.js syntax FAIL & exit /b 1)
node --check scripts\write-changelog.js || (echo write-changelog.js syntax FAIL & exit /b 1)

echo.
echo === 4. Build-v2 (regenerates venue/category/area/guide pages) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. Rebuild tool stubs (compare is now EXCLUDED — has its own builder) ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs.js FAIL & exit /b 1)

echo.
echo === 6. Build real /compare/ page (must run AFTER rebuild-tool-stubs) ===
node scripts\build-compare-page.js
if errorlevel 1 (echo build-compare-page.js FAIL & exit /b 1)

echo.
echo === 7. /status.json + changelog refresh ===
node scripts\write-status-json.js
node scripts\write-changelog.js

echo.
echo === 8. Helper scripts ===
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js

echo.
echo === 9. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 10. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 16: make /compare/ a real functional side-by-side comparison tool" -m "Was: honest static stub from Round 7 directing users to /search/. Now: pick up to 4 of 158 venues, see 12 attributes side-by-side, bookmarkable + shareable URL state (?a=&b=&c=&d=)." -m "scripts/build-compare-page.js (NEW) generates /compare/index.html with 158-venue summary JSON embedded, picker UI, comparison table, 3 presets (premium Muay Thai / hotel gyms / budget camps), Web Share API + clipboard fallback. rebuild-tool-stubs.js updated to SKIP 'compare' so the real builder owns the slug. Changelog backfilled with rounds 12-16." -m "Closes last open Codex P0-3 tool-page finding. Asset version 411 -> 412."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 11. Tag rollback + refspec push to main ===
git tag -f main-pre-round16 origin/main
git push origin main-pre-round16 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 12. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 16 SHIPPED.
echo.
echo SHOWPIECE:
echo   https://pattaya-gym.com/compare/
echo   Try: https://pattaya-gym.com/compare/?a=fairtex-pattaya^&b=sitsongpeenong-pattaya
echo.
echo Rollback: git push origin main-pre-round16:main --force-with-lease
echo ============================================================
