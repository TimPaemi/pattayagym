@echo off
REM Round 84 — full internal linking mesh (r41 + r84), expanded pa-network, audit
cd /d "%~dp0"
call npm install --silent || exit /b 1
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
node scripts\audit-internal-links.js
call npm run html:validate || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add scripts/lib/pa-network-block.js scripts/inject-internal-linking-r84.js scripts/audit-internal-links.js PUSH_ROUND84.cmd
git commit -m "Round 84: full internal linking mesh and 12-site pa-network" -m "Venue taxonomy/nearby/tools strips, sister-context on guides and utilities, r41+r84 injectors, shared pa-network-block in build and editorial shell."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 84 SHIPPED.
