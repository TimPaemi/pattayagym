@echo off
REM Round 89 — nearby fallback, BOUNCE phone, utility hub links
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
git add data/manual-phones-r89.json PUSH_ROUND89.cmd
git commit -m "Round 89: nearby fallback, BOUNCE phone, utility hub links" -m "Same-area nearby when cross-category peers are sparse; Harbor mall line for BOUNCE; site tools and sister-context on sports, about, and methodology pages."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 89 SHIPPED.
