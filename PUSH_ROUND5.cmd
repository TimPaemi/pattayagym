@echo off
REM ============================================================
REM PUSH_ROUND5.cmd
REM
REM Codex Nuclear Audit V3 P0 + metadata fixes:
REM   P0-1: stale live styles.css?v=405 (Cloudflare immutable cache)
REM         -> bump v406 + remove immutable cache directive
REM   P0-2: 23 legacy pages still on v404
REM         -> scripts/bump-legacy-assets.js syncs them to current
REM   P1-5: missing twitter:site, robots meta, x-dns-prefetch-control,
REM         homepage og:site_name (now in build-v2.js head() + index.html)
REM   P2-5: white-on-pink contrast fail (3.53:1)
REM         -> .back-to-top text color now #000 (5.94:1)
REM
REM Steps:
REM   1. Cleanup + branch check
REM   2. node --check
REM   3. node build-v2.js (regenerates 188 pages with v406 + new metadata)
REM   4. node scripts/bump-legacy-assets.js (syncs 23 legacy pages)
REM   5. node scripts/verify-deploy.js (hard gate)
REM   6. Commit + push redesign-2026
REM   7. Refspec push to main (no checkout self-destruct)
REM
REM AFTER PUSH: purge Cloudflare cache ONCE from dashboard so the new
REM            non-immutable cache rules take effect immediately.
REM            Caching > Configuration > Purge Everything
REM            Cache stays in sync going forward.
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
node --check build-v2.js
if errorlevel 1 (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js
if errorlevel 1 (echo data.js syntax FAIL & exit /b 1)
node --check scripts\bump-legacy-assets.js
if errorlevel 1 (echo bump-legacy-assets.js syntax FAIL & exit /b 1)

echo.
echo === 4. Regenerate build-v2 pages with v406 + new metadata ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. Sync 23 legacy pages to v406 ===
node scripts\bump-legacy-assets.js
if errorlevel 1 (echo legacy bump FAIL & exit /b 1)

echo.
echo === 6. Pre-push integrity check ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED - inspect output above & exit /b 1)

echo.
echo === 7. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 5: P0 cache-bust + metadata polish (Codex Nuclear Audit V3)" -m "P0-1: ASSET_VERSION 405 -> 406; removed 'immutable' from CSS/JS cache headers; now max-age=3600 must-revalidate so future bumps actually work without manual Cloudflare purge." -m "P0-2: scripts/bump-legacy-assets.js syncs 23 legacy guide/tool pages (which don't go through build-v2.js) to current asset version automatically. Will run as part of PUSH script going forward." -m "P1-5: head() now emits og:site_name, twitter:site @PattayaGym, robots index/follow/max-image-preview, x-dns-prefetch-control, dns-prefetch hints for maps.google.com + googletagmanager.com. Homepage gets same treatment." -m "P2-5: .back-to-top text color #fff -> #000 on pink. Contrast goes 3.53:1 (fail) -> 5.94:1 (AA pass)." -m "Codex audit context: site already at rank 1-8 for '24 hour gym Pattaya', 4-10 for 'best gym Pattaya'. 6-month outlook with P0+P1 shipped: realistic page 1 for 'gyms in Pattaya' and 'pattaya muay thai camps'."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 8. Tag rollback + refspec push to main ===
git tag -f main-pre-round5 origin/main
git push origin main-pre-round5 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Round 5 SHIPPED.
echo.
echo IMPORTANT: purge Cloudflare cache ONCE so the new non-immutable
echo            cache rules take effect:
echo   1. Cloudflare dashboard ^> pattaya-gym.com
echo   2. Caching ^> Configuration
echo   3. Purge Everything
echo   4. Wait ~30s
echo.
echo Then verify:
echo   https://pattaya-gym.com/styles.css?v=406  (should be ~44KB now, not 35KB)
echo   https://pattaya-gym.com/search/           (filter chips styled, CLS fixed)
echo   https://pattaya-gym.com/guides/best-muay-thai-pattaya/  (v406 footer)
echo   View source on homepage: og:site_name, twitter:site, robots meta present
echo.
echo Rollback: git push origin main-pre-round5:main --force-with-lease
echo ============================================================
