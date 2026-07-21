@echo off
REM ============================================================
REM PUSH_ROUND30.cmd — Cursor migration + CI fix
REM
REM Round 30:
REM   - Mobile menu: div[role=navigation] -> native <nav> (fixes CI)
REM   - GitHub Actions: add verify-deploy.js gate
REM   - AGENTS.md: Cursor agent workflow
REM   - Asset version 425 -> 426
REM ============================================================

cd /d "%~dp0"

echo === 1. Cleanup ===
if exist .git\index.lock del /f /q .git\index.lock
if exist .wrangler rmdir /s /q .wrangler

echo.
echo === 2. Branch check ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 ^(on %BRANCH%^) & exit /b 1)

echo.
echo === 3. Syntax check ===
node --check build-v2.js || exit /b 1
node --check data.js || exit /b 1
node --check scripts\verify-deploy.js || exit /b 1

echo.
echo === 4. npm install ===
call npm install --silent
if errorlevel 1 exit /b 1

echo.
echo === 5. Build pipeline ===
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js || exit /b 1
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts/sync-csp-hashes.js

echo.
echo === 6. Pre-push verify ===
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate
if errorlevel 1 exit /b 1

echo.
echo === 7. Commit + push redesign-2026 ===
git add -A
git commit -m "Round 30: Cursor migration — fix CI mobile nav + verify-deploy gate" -m "Mobile menu uses native nav element (html-validate prefer-native-element). GitHub Actions now runs verify-deploy.js. AGENTS.md documents Cursor workflow. Asset version 425 -> 426."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026
if errorlevel 1 exit /b 1

echo.
echo === 8. Tag rollback + refspec push to main ===
git tag -f main-pre-round30 origin/main
git push origin main-pre-round30 --force
git push origin redesign-2026:main
if errorlevel 1 exit /b 1

echo.
echo === 9. Ping sitemap ===
node scripts\ping-sitemap.js

echo.
echo ============================================================
echo Round 30 SHIPPED. Rollback: git push origin main-pre-round30:main --force-with-lease
echo ============================================================
