@echo off
REM ============================================================
REM PUSH_ROUND19.cmd
REM
REM Round 19 — Self-audit fixes.
REM
REM Self-audit (SELF_AUDIT_2026_ROUND19.md) surfaced 71 findings.
REM This round closes the biggest ones:
REM
REM   F-Sister  4 of 7 TimPaemi sister sites had ZERO inbound links
REM             from pattaya-gym.com. All 7 now linked from footer
REM             + Organization.sameAs + Person.sameAs + privacy page
REM             + about page + press page + llms.txt + humans.txt.
REM             That's pattayastream.com, pattaya-coffee.com,
REM             pattaya-school-guide.com, timpaemi.com — each now
REM             referenced from 239 HTML files instead of 0.
REM
REM   F08.1     22 orphan pages killed. Area pages now include a
REM             "Browse this area by sport" cross-link matrix, closing
REM             all 15 area-category orphans. Footer "The site" column
REM             expanded with /compare/, /pattaya-sport-stats/,
REM             /changelog/, /privacy/, /press/, /add-your-gym/.
REM             Closes 7 utility-page orphans.
REM
REM   F05.1     Long titles cut from 24 to 0 by truncateTitle() helper
REM             (caps at 65 chars, word-boundary aware). truncateDesc()
REM             helper for the same on meta descriptions.
REM
REM Asset version 414 -> 415.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
for %%F in (30 Venue af-academy-pattaya git kids-youth main) do (
  if exist "%%F" del /f /q "%%F"
)
if exist "kids-youth)" del /f /q "kids-youth)"
if exist push-output.txt del /f /q push-output.txt
if exist .wrangler rmdir /s /q .wrangler

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
node --check scripts\verify-deploy.js || (echo verify-deploy.js syntax FAIL & exit /b 1)

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
echo === 8. /status.json + changelog ===
node scripts\write-status-json.js
node scripts\write-changelog.js

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
git commit -m "Round 19: self-audit fixes - sister network + orphan pages + title truncation" -m "Sister network: 4 sites that had ZERO inbound links (pattayastream, pattaya-coffee, pattaya-school-guide, timpaemi) now linked from 239 HTML files via footer + Organization.sameAs + Person.sameAs + privacy + about + press pages + llms.txt + humans.txt." -m "Orphan pages: 22 orphans killed. Area pages now have a 'Browse this area by sport' cross-link matrix - 15 area-category pages no longer orphans. Footer 'The site' column expanded with utility pages (compare/sport-stats/changelog/privacy/press/add-your-gym) - 7 utility orphans linked." -m "Titles: truncateTitle()/truncateDesc() helpers cap titles at 65 chars and descs at 155 chars at word boundary. Long titles dropped from 24 to 0." -m "Asset version 414 -> 415."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 12. Tag rollback + refspec push to main ===
git tag -f main-pre-round19 origin/main
git push origin main-pre-round19 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 13. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 19 SHIPPED.
echo.
echo HEADLINE FIXES:
echo   Sister network: 4 sites that were never linked are now
echo                   referenced from 239 HTML files each.
echo                   Footer + JSON-LD + privacy + about + press.
echo   Orphan kill:   22 pages went from 0 inbound links to many.
echo   Title length:  24 titles >70 chars -^> 0.
echo.
echo Self-audit report: SELF_AUDIT_2026_ROUND19.md (71 findings,
echo                    keep handy for Round 20 prioritization).
echo.
echo Rollback: git push origin main-pre-round19:main --force-with-lease
echo ============================================================
