@echo off
REM Round 88 — homepage area hub + Naklua public pool phone
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
git add data/manual-phones-r88.json PUSH_ROUND88.cmd
git commit -m "Round 88: homepage area hub and Naklua public pool phone" -m "Hero links to top guides and categories; six-area hub on homepage; sister-context deep links; Nongprue City pool line for Naklua public pool."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 88 SHIPPED.
