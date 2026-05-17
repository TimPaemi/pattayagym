@echo off
REM ============================================================
REM PUSH_ROUND4_SEARCH.cmd
REM Fix /search/ properly.
REM
REM Changes:
REM   - styles.css: full V2 search styles (input, pills, dropdowns, result cards, empty state)
REM   - search-page.js (new): live client-side search using window.GYMS
REM   - search/index.html: cleaner V2 hero markup + loads /data.js + /search-page.js
REM   - All asset refs bumped to ?v=405
REM
REM Result:
REM   - Filter pills look like proper chips (pink active state, hover state)
REM   - Search input has cyan focus ring
REM   - Live filtering on text input, category pill, area dropdown, price dropdown, open-now
REM   - Results render as V2 cards in a responsive grid
REM   - Empty state with "Clear filters" reset button
REM   - URL params (?q=foo, ?cat=muay-thai) deep-link supported
REM   - Mobile: single-column results, stacked filters
REM
REM CSP: /search-page.js is served from 'self' origin (already allowed).
REM     No new inline-script hashes needed.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock

echo.
echo === 2. Branch check ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 ^(on %BRANCH%^) & exit /b 1)

echo.
echo === 3. Syntax ===
node --check build-v2.js
if errorlevel 1 (echo build-v2.js syntax FAIL & exit /b 1)
node --check data.js
if errorlevel 1 (echo data.js syntax FAIL & exit /b 1)
node --check search-page.js
if errorlevel 1 (echo search-page.js syntax FAIL & exit /b 1)

echo.
echo === 4. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED - inspect output above & exit /b 1)

echo.
echo === 5. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 4 follow-up: fix /search/ with V2 design + live client-side search" -m "styles.css: V2 search styles - input with cyan focus ring, filter pills as proper chips (pink active), V2-styled dropdowns, responsive result-card grid, empty state with Clear filters reset." -m "search-page.js (new): client-side search against window.GYMS - text query (name + area + category + tags + description), category pill filter, area + price dropdowns, open-now flag, URL-param deep linking (?q=, ?cat=), live filter on input change." -m "search/index.html: cleaner V2 hero markup (chapter eyebrow, accent-pink h1, search input + pill row + filter panel + results grid). Loads /data.js + /search-page.js. Asset refs bumped to ?v=405." -m "Mobile: filters stack, results single-column. CSP: no new hashes needed - external script under 'self' origin."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 6. Push redesign-2026 to main via refspec ===
git tag -f main-pre-search-fix origin/main
git push origin main-pre-search-fix --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Search page SHIPPED. Cloudflare redeploys in ~60s.
echo.
echo VERIFY:
echo   https://pattaya-gym.com/search/                 (live filter, V2 design)
echo   https://pattaya-gym.com/search/?cat=muay-thai   (deep link)
echo   https://pattaya-gym.com/search/?q=fairtex       (text search)
echo   Mobile: filter pills wrap, results stack
echo.
echo Rollback: git push origin main-pre-search-fix:main --force-with-lease
echo ============================================================
