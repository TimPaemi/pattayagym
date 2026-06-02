@echo off
REM Round 66 — Compare/plan external JSON + venue count hygiene
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\sync-index-venue-count.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-round62-tier-b.js
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js
node scripts\inject-guide-schema.js
node scripts\sync-csp-hashes.js
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
node scripts\content-quality-audit.js
node scripts\full-site-audit.js
git add -A
git commit -m "Round 66: external JSON for compare and plan tools" -m "Shrink tool HTML by fetching /data/*.json; verify-deploy gates; 157 venue copy in stubs and guide-bodies."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 66 SHIPPED.
