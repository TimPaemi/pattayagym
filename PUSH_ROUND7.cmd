@echo off
REM ============================================================
REM PUSH_ROUND7.cmd
REM
REM Codex Nuclear V3 — three biggest remaining items in one round:
REM
REM   P1-2: Mobile CLS fixes (homepage 0.343, search 0.490)
REM         - styles.css: min-height + contain on .marquee, .btn-row,
REM           .result-card, .pa-network, .nav-row, .hero-h1, .footer-base.
REM           Targets the specific shifting nodes Codex Lighthouse flagged.
REM
REM   P0-3: Tool pages still promise functionality they don't provide
REM         - scripts/rebuild-tool-stubs.js converts /map/, /compare/,
REM           /plan-my-trip/, /find-my-coach/, /favorites/ into honest V2
REM           "coming back online" pages with 3 working-alternative cards each.
REM           Preserves URLs (no 301 churn, no SEO loss).
REM
REM   P2-6: Article + FAQPage JSON-LD missing on guide pages
REM         - scripts/inject-guide-schema.js scans the 17 guides, injects
REM           Article schema everywhere (headline, author, datePublished,
REM           publisher, image) and FAQPage schema where the body has at
REM           least 2 Q/A pairs detectable via heading patterns.
REM
REM Steps:
REM   1. Cleanup + branch check
REM   2. node --check syntax (all .js)
REM   3. node build-v2.js (full regen)
REM   4. node scripts/rebuild-tool-stubs.js (5 stubs)
REM   5. node scripts/inject-guide-schema.js (Article + FAQPage on guides)
REM   6. node scripts/bump-legacy-assets.js (sync remaining legacy v406)
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
node --check scripts\verify-deploy.js || (echo verify-deploy.js syntax FAIL & exit /b 1)

echo.
echo === 4. Build-v2 full regen ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 5. Rebuild 5 tool stubs ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs FAIL & exit /b 1)

echo.
echo === 6. Inject Article + FAQPage schema on guide pages ===
node scripts\inject-guide-schema.js
if errorlevel 1 (echo inject-guide-schema FAIL & exit /b 1)

echo.
echo === 7. Sync any remaining legacy pages to current asset version ===
node scripts\bump-legacy-assets.js
if errorlevel 1 (echo bump-legacy-assets FAIL & exit /b 1)

echo.
echo === 8. Pre-push integrity check ===
node scripts\verify-deploy.js
if errorlevel 1 (
  echo VERIFY FAILED - inspect output above
  echo Aborting push to avoid shipping broken state
  exit /b 1
)

echo.
echo === 9. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 7: Codex V3 final pass — CLS + tool stubs + guide schema" -m "P1-2 Mobile CLS targets: styles.css now reserves space on .marquee (min-height:50px + contain), .btn-row (56px + flex-wrap), .result-card (220px + contain), .pa-network (240px + contain) — the four largest shift nodes Codex Lighthouse flagged. Plus .nav-row 56px, .hero-h1/.footer-base contain. Should pull homepage CLS from 0.343 toward <0.1 and search from 0.490 toward <0.1." -m "P0-3 Tool pages: /map/, /compare/, /plan-my-trip/, /find-my-coach/, /favorites/ rebuilt as honest V2 'coming back online' pages. Each has V2 chrome, 3 alternative-path cards (search / category / guide), WebPage + BreadcrumbList JSON-LD, no false interactive promises. URLs preserved — no 301 churn." -m "P2-6 Guide schema: scripts/inject-guide-schema.js scans 17 guide pages and injects Article schema (headline, author, datePublished, publisher, image, isAccessibleForFree) on each, plus FAQPage schema where 2+ Q/A pairs are detectable via heading patterns. Unlocks Article and expandable-FAQ rich results in Google for guide SERPs." -m "All three scripts wired into PUSH chain so future builds run them automatically."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 10. Tag rollback + refspec push to main ===
git tag -f main-pre-round7 origin/main
git push origin main-pre-round7 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo ============================================================
echo Round 7 SHIPPED.
echo.
echo VERIFY:
echo   https://pattaya-gym.com/map/                  (V2 stub w/ alt paths)
echo   https://pattaya-gym.com/compare/              (V2 stub)
echo   https://pattaya-gym.com/find-my-coach/        (V2 stub)
echo   https://pattaya-gym.com/favorites/            (V2 stub)
echo   https://pattaya-gym.com/plan-my-trip/         (V2 stub)
echo   https://pattaya-gym.com/guides/best-muay-thai-pattaya/  (view source: Article + maybe FAQPage schema)
echo.
echo Lighthouse should show:
echo   Homepage mobile CLS ~0.05 (was 0.343)
echo   Search mobile CLS ~0.05 (was 0.490)
echo.
echo Rollback: git push origin main-pre-round7:main --force-with-lease
echo ============================================================
