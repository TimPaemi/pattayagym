@echo off
REM Round 65 — AF Academy dedupe, dynamic venue counts, audit fixes
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\sync-index-venue-count.js || exit /b 1
node build-v2.js || exit /b 1
if exist gyms\af-academy-football rmdir /s /q gyms\af-academy-football
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js
node scripts\export-venue-outreach.js
node scripts\fix-af-academy-orphan-links-r65.js
node scripts\write-russian-speaking-guide.js
node scripts\inject-guide-schema.js
node scripts\sync-csp-hashes.js
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
node scripts\content-quality-audit.js
node scripts\full-site-audit.js
git add -A
git commit -m "Round 65: dedupe AF Academy stub, dynamic venue counts" -m "Remove af-academy-football from data.js; 301 retained; sync 157 venue copy; full-site-audit false-positive fixes."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 65 SHIPPED.
