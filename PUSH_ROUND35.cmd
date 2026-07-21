@echo off
REM Round 35 — Ranked guide body polish (TL;DR + venue cards in styles.css)
cd /d "%~dp0"
if exist .git\index.lock del /f /q .git\index.lock
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 & exit /b 1)
call npm install --silent || exit /b 1
node scripts\migrate-legacy-guides-chrome.js || exit /b 1
node scripts\polish-ranked-guide-body.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js || exit /b 1
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
git add -A
git commit -m "Round 35: ranked guide body polish — TL;DR panels and venue cards" -m "styles.css gains guide-body card/TL;DR rules (guides never loaded venue.css). polish-ranked-guide-body.js normalizes 17 ranked guides + hub. Asset 430 -> 431."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026 || exit /b 1
git tag -f main-pre-round35 origin/main
git push origin main-pre-round35 --force
git push origin redesign-2026:main || exit /b 1
node scripts\ping-sitemap.js
echo Round 35 SHIPPED.
