@echo off
REM Round 76 — phone sprint batch 2 (dive, golf, water park, hotel gym)
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\apply-manual-phones.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\inject-area-guide-faq-r74.js || exit /b 1
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
git commit -m "Round 76: +7 verified venue phones; telephone gate 57" -m "Ramayana, dive shops, Manhattan gym, Thai Polo, Chee Chan, Seafari. apply-manual-phones.js merges all manual-phones-r*.json."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 76 SHIPPED.
