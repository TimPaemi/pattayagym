@echo off
REM Round 94 — venue mobile sections + v2-nav on tools
cd /d "%~dp0"
call npm install --silent || exit /b 1
node build-v2.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\bump-legacy-assets.js || exit /b 1
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add PUSH_ROUND94.cmd scripts/lib/v2-nav.js
git commit -m "Round 94: venue mobile sections + shared tool nav" -m "Collapsible venue sections on mobile; v2-nav on compare/plan/map stubs. Asset v456."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 94 SHIPPED.
