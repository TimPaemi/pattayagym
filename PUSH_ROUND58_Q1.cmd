@echo off
REM Round 58 Q1 — Content quality audit + Russian-speaking editorial rewrite
cd /d "%~dp0"
if exist .git\index.lock del /f /q .git\index.lock
call npm install --silent || exit /b 1
node scripts\write-russian-speaking-guide.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js || exit /b 1
node scripts\inject-guide-schema.js
node scripts\sync-csp-hashes.js
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
node scripts\content-quality-audit.js
git add -A
git commit -m "Round 58 Q1: content quality audit + Russian-speaking editorial rewrite" -m "Adds content-quality-audit.js. Full editorial rewrite pattaya-russian-speaking-sport from venue MD. Fixes UPDATED WEEKLY to UPDATED ROLLING in editorial-guide-shell. Removes ranked deepen injects for Russian guide."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
node scripts\full-site-audit.js
echo Round 58 Q1 SHIPPED.
