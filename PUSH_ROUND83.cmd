@echo off
REM Round 83 — yoga, inter-club, Greta, Jetts, M16, Sitpholek, Universe, Pattaya Bowl
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
git add -u
git add data/manual-phones-r83.json PUSH_ROUND83.cmd
git commit -m "Round 83: +8 verified venue phones; telephone gate 115" -m "Ashtanga Yoga, inter-club, Greta, Jetts Little Walk, Rambaa M16, Sitpholek, Universe Gym, Pattaya Bowl."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 83 SHIPPED.
