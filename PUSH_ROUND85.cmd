@echo off
REM Round 85 — +11 verified venue phones; telephone gate 126
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\apply-manual-phones.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\inject-internal-linking-r84.js || exit /b 1
node scripts\inject-guide-schema.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\write-status-json.js
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add data/manual-phones-r85.json PUSH_ROUND85.cmd
git commit -m "Round 85: +11 verified venue phones; telephone gate 126" -m "Sor Klinmee, Cho Nateetong, Fight EVO360, three yoga studios, Bean Cow, Clubloongchat, Aquanauts, St Andrews 2000, SF Strike Bowl."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 85 SHIPPED.
