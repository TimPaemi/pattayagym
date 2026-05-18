@echo off
REM ============================================================
REM PUSH_ROUND6.cmd
REM
REM Codex Nuclear Audit V3 ranking-unlock pass:
REM
REM   P1-3: Combined category-area landing pages (the #1 long-tail unlock)
REM         New build-v2.js function categoryAreaPage() generates pages at
REM         /area/<area>/<category>/ — e.g., /area/jomtien/muay-thai/.
REM         Up to 90 pages possible (15 cats x 6 areas); skips empty combos.
REM         Each page: V2 hero, ItemList JSON-LD, BreadcrumbList, cross-links
REM         back to /category/ and /area/ parents + search filter deep-link.
REM         Sitemap auto-includes them.
REM
REM   P1-1: postalCode auto-fallback when address lacks 5-digit zip.
REM         Maps area context -> Thai postal code:
REM           Bang Lamung (Pattaya proper) = 20150
REM           Sattahip                     = 20250
REM           Sriracha / Laem Chabang      = 20110
REM           Bo Win                       = 20230
REM         Pre-fix coverage was 59/158. Should jump to ~150/158 instantly.
REM
REM   P1-4: Heading hierarchy fix — all <h4 class="channel-card-name">
REM         promoted to <h3> so pages stop jumping h2->h4.
REM         CSS rule .channel-card-name keeps the same visual treatment.
REM
REM Steps:
REM   1. Cleanup + branch check
REM   2. node --check syntax (build-v2.js, data.js, search-page.js, verify)
REM   3. node build-v2.js (regenerates 188 + ~80 category-area pages = ~270)
REM   4. node scripts/bump-legacy-assets.js (syncs 23 legacy pages to v406)
REM   5. node scripts/verify-deploy.js (HARD GATE — aborts on any issue)
REM   6. Commit + push redesign-2026
REM   7. Refspec push to main (no checkout self-destruct)
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
node --check search-page.js
if errorlevel 1 (echo search-page.js syntax FAIL & exit /b 1)
node --check scripts\bump-legacy-assets.js
if errorlevel 1 (echo bump-legacy-assets.js syntax FAIL & exit /b 1)
node --check scripts\verify-deploy.js
if errorlevel 1 (echo verify-deploy.js syntax FAIL & exit /b 1)

echo.
echo === 4. Regenerate pages (build-v2) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. Sync legacy pages to v406 ===
node scripts\bump-legacy-assets.js
if errorlevel 1 (echo legacy bump FAIL & exit /b 1)

echo.
echo === 6. Pre-push integrity check (verify-deploy) ===
node scripts\verify-deploy.js
if errorlevel 1 (
  echo VERIFY FAILED - inspect output above
  echo Aborting push to avoid shipping broken state
  exit /b 1
)

echo.
echo === 7. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 6: Codex V3 ranking unlocks - category-area pages + postalCode + h3 hierarchy" -m "P1-3 (BIG): combined category-area landing pages now generated at /area/<area>/<category>/ - up to 90 new long-tail URLs targeting queries like 'muay thai in jomtien pattaya', 'fitness in pratamnak pattaya', 'golf in sattahip pattaya'. Each page has its own V2 hero, ItemList JSON-LD, BreadcrumbList, and cross-links to both parent category and area pages plus search deep-link. Sitemap auto-includes only non-empty combos." -m "P1-1: parsePostalAddress() now infers Thai postal code from area context when address lacks a 5-digit zip. Bang Lamung district (Pattaya proper) = 20150; Sattahip = 20250; Sriracha/Laem Chabang = 20110; Bo Win = 20230. Should lift LocalBusiness schema postalCode coverage from 59/158 to ~150/158." -m "P1-4: <h4 class='channel-card-name'> -> <h3 class='channel-card-name'> globally. Removes the h2->h4 hierarchy skip that Codex flagged on 163 pages. CSS rule unchanged so visual stays identical." -m "Codex audit: ranking estimates currently 1-8 for '24 hour gym Pattaya', 4-10 for 'best gym Pattaya'. Category-area pages are the #1 long-tail unlock per Codex V3 Section L. 6-month outlook: page 1 for 'gyms in Pattaya' and 'pattaya muay thai camps' realistic."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 8. Tag rollback + refspec push to main ===
git tag -f main-pre-round6 origin/main
git push origin main-pre-round6 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Round 6 SHIPPED.
echo.
echo VERIFY:
echo   https://pattaya-gym.com/area/jomtien/muay-thai/    (NEW page)
echo   https://pattaya-gym.com/area/pratamnak/fitness/    (NEW page)
echo   https://pattaya-gym.com/area/sattahip/golf/        (NEW page)
echo   https://pattaya-gym.com/area/east-pattaya/muay-thai/  (NEW page)
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/      (view source - postalCode should be 20150)
echo   https://pattaya-gym.com/sitemap.xml                (should have ~285 URLs now)
echo.
echo Rollback: git push origin main-pre-round6:main --force-with-lease
echo ============================================================
