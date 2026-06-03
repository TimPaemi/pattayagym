@echo off
REM Round 87 — full audit PASS; changelog pa-network fix; write-changelog before inject
cd /d "%~dp0"
call npm install --silent || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\inject-internal-linking-r84.js || exit /b 1
node scripts\inject-guide-schema.js || exit /b 1
node scripts\write-status-json.js
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
node scripts\audit-internal-links.js
node scripts\full-site-audit.js
node scripts\content-quality-audit.js
call npm run html:validate || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add PUSH_ROUND87.cmd FULL_AUDIT_2026-06-03.md
git commit -m "Round 87: full audit PASS; changelog 12-site pa-network" -m "write-changelog uses pa-network-block; pipeline runs changelog before inject-r84. Audits: 282/282 live, 134 phones, 44 Tier A guides."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 87 SHIPPED.
