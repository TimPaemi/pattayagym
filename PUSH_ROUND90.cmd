@echo off
REM Round 90 — nearby 157/157, phones, utility hub links
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\apply-manual-phones.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\inject-internal-linking-r84.js || exit /b 1
node scripts\write-status-json.js
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add data/manual-phones-r90.json PUSH_ROUND90.cmd
git commit -m "Round 90: full venue-nearby mesh and two verified phones" -m "Sriracha and offshore area slugs; Bangkok and category nearby fallbacks; Khao Chi Chan and Flight of the Gibbon booking lines; utility pages get site-tools hub."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 90 SHIPPED.
