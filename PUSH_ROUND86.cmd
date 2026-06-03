@echo off
REM Round 86 — +5 verified venue phones; telephone gate 133
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\apply-manual-phones.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\inject-internal-linking-r84.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\write-status-json.js
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add data/manual-phones-r86.json PUSH_ROUND86.cmd
git commit -m "Round 86: +5 verified venue phones; telephone gate 133" -m "Pattaya Boxing World, golf driving range (300 Yards), Kitesurf/KBA, ATV Tours hotline, Banchang lawn bowls enquiries."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 86 SHIPPED.
