@echo off
REM Round 62 — Tier B editorial guides → Tier A depth
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\write-round62-tier-b.js || exit /b 1
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
git commit -m "Round 62: deepen Tier B editorial guides to Tier A" -m "16 guides expanded via guide-bodies; FAQ schema from guide-faq details; audit inject counter fix."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
node scripts\full-site-audit.js
echo Round 62 SHIPPED.
