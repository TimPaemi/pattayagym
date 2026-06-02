@echo off
REM Round 73 — Manual geo seeds + area fallback + full regen
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\apply-geo-r73.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\inject-guide-schema.js || exit /b 1
node scripts\fix-guide-meta-entities-r68.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\write-status-json.js
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -A
git commit -m "Round 73: LocalBusiness geo 155/157 venues" -m "Manual coords for 46 flagship venues; area fallback for remaining failed geocodes. Full HTML regen with GeoCoordinates in schema."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 73 SHIPPED.
