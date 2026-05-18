@echo off
REM ============================================================
REM PUSH_ROUND14.cmd
REM
REM Per-area page depth expansion — closes Codex V3 P1-6.
REM
REM Each of the 6 area pages goes from thin list-only (104-677 words)
REM to substantive neighborhood guide:
REM
REM   /area/jomtien/        — south beachfront, family + watersports + yoga
REM   /area/naklua/         — north quiet, Muay Thai cluster, Wong Amat beach
REM   /area/pratamnak/      — luxury hill, Hilton + Royal Cliff cluster
REM   /area/central-pattaya/— original Pattaya, budget gyms, walkable
REM   /area/east-pattaya/   — Darkside, expat residential, serious training
REM   /area/sattahip/       — far south, diving + golf + airport
REM
REM Each page now includes:
REM   - 200-300 word neighborhood intro
REM   - "Best for" sport breakdown (4-5 reasons each)
REM   - Transport notes (how to get there, baht-bus routes)
REM   - 5-6 named landmarks for orientation
REM   - Starter pick recommendation
REM   - Top-6 sport categories with venue counts + links to combined pages
REM   - Existing full venue list at bottom
REM
REM Also cleaned: stray <h3>...</h4> mismatches from earlier round (now h3/h3).
REM
REM Asset version bumped 409 -> 410.
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

echo.
echo === 4. Build-v2 (6 area pages now substantial neighborhood guides) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. /status.json + changelog refresh ===
node scripts\write-status-json.js
node scripts\write-changelog.js

echo.
echo === 6. Tool stubs ===
node scripts\rebuild-tool-stubs.js

echo.
echo === 7. Guide schema + bylines ===
node scripts\inject-guide-schema.js

echo.
echo === 8. Sync legacy pages to v410 ===
node scripts\bump-legacy-assets.js

echo.
echo === 9. Auto-sync CSP hashes ===
node scripts\sync-csp-hashes.js

echo.
echo === 10. Pre-push verify ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 11. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 14: per-area neighborhood guides + h3/h4 cleanup" -m "Codex V3 P1-6 closure. Each of 6 area pages goes from thin list-only (Sattahip 104w, East Pattaya 231w, others 200-700w) to substantive neighborhood guide with: 200-300 word intro, best-for sport breakdown, transport notes, 5-6 landmarks for orientation, starter pick recommendation, top-6 sport categories with venue counts." -m "Each area page now ~1500-2000 words. Targets ranking for: 'jomtien gym', 'pratamnak fitness', 'east pattaya muay thai', 'sattahip diving', 'naklua sport venues', 'central pattaya gym'. The 80 combined category-area pages link back to these neighborhood guides for the topical-cluster signal." -m "Also fixed: stray <h3>name</h4> mismatches in channel-card markup from earlier round (all now h3/h3). Closes residual html-validate errors." -m "Asset version 409 -> 410."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 12. Tag rollback + refspec push to main ===
git tag -f main-pre-round14 origin/main
git push origin main-pre-round14 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 13. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 14 SHIPPED.
echo.
echo VERIFY (each is now a substantial neighborhood guide):
echo   https://pattaya-gym.com/area/jomtien/
echo   https://pattaya-gym.com/area/naklua/
echo   https://pattaya-gym.com/area/pratamnak/
echo   https://pattaya-gym.com/area/central-pattaya/
echo   https://pattaya-gym.com/area/east-pattaya/
echo   https://pattaya-gym.com/area/sattahip/
echo.
echo Each page now: hero + summary + "About this neighborhood" + "Best for" cards
echo + Transport + Landmarks + Starter pick + Sports-in-this-area button row
echo + full venue list at bottom.
echo.
echo Rollback: git push origin main-pre-round14:main --force-with-lease
echo ============================================================
