@echo off
REM Round 59 Q2 — Tier C editorial rewrites (snooker, crossfit, swimming)
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\write-round59-q2.js || exit /b 1
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
git add -A
git commit -m "Round 59 Q2: Tier C rewrites snooker, CrossFit, swimming pools" -m "Full editorial depth from venue MD. Tier C reduced from 9 to 6 guides."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
node scripts\full-site-audit.js
echo Round 59 Q2 SHIPPED.
