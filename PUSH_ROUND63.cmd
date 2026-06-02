@echo off
REM Round 63 — Finish Tier B → Tier A (editorial + ranked depth)
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\write-round62-tier-b.js || exit /b 1
node scripts\expand-ranked-tier-b-r63.js || exit /b 1
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
git commit -m "Round 63: clear remaining Tier B guides to Tier A" -m "Expand editorial guide-bodies and ranked r63 depth blocks; regenerate guides and schema."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 63 SHIPPED.
