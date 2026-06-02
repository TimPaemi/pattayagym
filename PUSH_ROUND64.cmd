@echo off
REM Round 64 — Consolidate ranked deepen blocks + depth status + audit
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\consolidate-ranked-deepen-r64.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\inject-guide-schema.js
node scripts\sync-csp-hashes.js
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
node scripts\content-quality-audit.js
node scripts\write-depth-status-r64.js
node scripts\full-site-audit.js
git add -A
git commit -m "Round 64: consolidate ranked deepen injects to primer sections" -m "Merge deepen-rNN blocks into guide-rank-primer; depth status report; zero inject audit flags target."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 64 SHIPPED.
