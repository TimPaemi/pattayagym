@echo off
REM Round 96 — favorites tool, plan UX, hub heroes
cd /d "%~dp0"
call npm install --silent || exit /b 1
node build-v2.js || exit /b 1
node scripts\build-favorites-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\bump-legacy-assets.js || exit /b 1
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add PUSH_ROUND96.cmd scripts/build-favorites-page.js
git commit -m "Round 96: favorites tool, plan UX, hub heroes" -m "Live favorites shortlist; plan empty states and scroll-to-results; mobile category/area heroes. Asset v458."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 96 SHIPPED.
