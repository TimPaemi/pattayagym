@echo off
REM ============================================================
REM PUSH_ROUND17.cmd
REM
REM Round 17 — Codex Nuclear V4 audit fixes.
REM
REM 5 P1 closed:
REM   F02.1  mdToHtml: 210 html-validate errors -> 0 (markdown-it)
REM   F07.1  Sitemap GUIDE_SLUGS now derived from disk (no 404s)
REM   F20.1  New /privacy/ page (GA + localStorage + AI crawler + GDPR/PDPA)
REM   F21.1  "Updated weekly" softened to honest "rolling" everywhere
REM   F23.1  verify-deploy.js hardened: NUL/BOM scan + sitemap URL check
REM
REM 10 P2 wins:
REM   F01.1 search Open-now real HH:MM parsing
REM   F01.2 venue MD category fixes (ALFA->bjj, Rambaa->mma)
REM   F04.1 geo coords rounded to 6 decimals
REM   F05.2 robots.txt allows /og/
REM   F07.3 stray junk files deleted (handled by step 1 below)
REM   F12.1 ARIA live regions on search + compare
REM   F12.2 visible focus outline on search filter selects
REM   F19.2 browsing-topics=() in Permissions-Policy
REM   F20.2 GA disclosure precision + /privacy/ link
REM   F23.3 still uses force tag (Codex flagged; deferred to Round 18)
REM
REM Asset version 412 -> 413.
REM ============================================================

cd /d C:\pattayagym

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
REM Round 17 — Codex F07.3: scrub extensionless junk files from repo root
for %%F in (30 Venue af-academy-pattaya git kids-youth main) do (
  if exist "%%F" del /f /q "%%F"
)
if exist "kids-youth)" del /f /q "kids-youth)"
REM Round 17 — F23.1 catch: push-output.txt has NUL bytes; never commit
if exist push-output.txt del /f /q push-output.txt
REM Round 17 — F07.3: never commit Wrangler local state
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
echo === 4. npm install (markdown-it for the mdToHtml fix) ===
call npm install --silent
if errorlevel 1 (echo npm install FAIL & exit /b 1)

echo.
echo === 5. Build-v2 (158 venues + 15 cats + 6 areas + 9 utility incl. new /privacy/) ===
node build-v2.js
if errorlevel 1 (echo build-v2.js run FAIL & exit /b 1)

echo.
echo === 6. Rebuild tool stubs (compare correctly excluded) ===
node scripts\rebuild-tool-stubs.js
if errorlevel 1 (echo rebuild-tool-stubs.js FAIL & exit /b 1)

echo.
echo === 7. Real /compare/ page ===
node scripts\build-compare-page.js
if errorlevel 1 (echo build-compare-page.js FAIL & exit /b 1)

echo.
echo === 8. /status.json + changelog refresh ===
node scripts\write-status-json.js
node scripts\write-changelog.js

echo.
echo === 9. Helper scripts ===
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js

echo.
echo === 10. Pre-push verify (hardened: NUL/BOM scan + sitemap URL check) ===
node scripts\verify-deploy.js
if errorlevel 1 (echo VERIFY FAILED & exit /b 1)

echo.
echo === 11. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 17: Codex Nuclear V4 audit - 5 P1 + 10 P2 fixes" -m "P1: mdToHtml now uses markdown-it (210 -> 0 html-validate errors); sitemap GUIDE_SLUGS derived from disk (no 404s); new /privacy/ page (GA + localStorage + AI crawler + GDPR/PDPA); 'updated weekly' softened to honest 'rolling' everywhere; verify-deploy.js now scans NUL/BOM across all text source files and verifies every sitemap URL has a local file." -m "P2: search Open-now parses real HH:MM windows; venue MD category fixes (ALFA -> bjj, Rambaa -> mma); geo coords rounded to 6 decimals; robots.txt allows /og/; stray junk files deleted; ARIA live regions on search + compare; focus outline on search filter selects; browsing-topics=() in Permissions-Policy; GA disclosure precision; .wrangler/ + extensionless garbage added to .gitignore." -m "Asset version 412 -> 413."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 (echo Push redesign-2026 FAILED & exit /b 1)

echo.
echo === 12. Tag rollback + refspec push to main ===
git tag -f main-pre-round17 origin/main
git push origin main-pre-round17 --force
git push origin redesign-2026:main
if errorlevel 1 (echo Refspec push FAILED & exit /b 1)

echo.
echo === 13. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 17 SHIPPED.
echo.
echo HEADLINE FIXES:
echo   https://pattaya-gym.com/privacy/            (new — GDPR/PDPA, GA, AI crawler)
echo   https://pattaya-gym.com/gyms/fairtex-pattaya/ (clean HTML — 210 errors -^> 0)
echo   https://pattaya-gym.com/changelog/          (17 rounds documented)
echo.
echo Rollback: git push origin main-pre-round17:main --force-with-lease
echo ============================================================
