@echo off
REM Round 81 — kart, golf, marina, cricket, tri-league, helicopter phones
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
git commit -m "Round 81: +9 verified venue phones; telephone gate 96" -m "Kart, Chatrium Soi Dao, SailBreeze, Hard Rock pool, cricket, Pattana, marathon/triathlon (Tri-League), Sky Ride."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 81 SHIPPED.
