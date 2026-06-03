@echo off
REM Round 78 — post-audit phone batch 3
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\apply-manual-phones.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\inject-area-guide-faq-r74.js || exit /b 1
node scripts\inject-guide-schema.js || exit /b 1
node scripts\fix-guide-meta-entities-r68.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\write-status-json.js
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -A
git commit -m "Round 78: +7 phones post-audit; telephone gate 70" -m "Thai Wake, Balance Yoga, Planet Football, Siam Bayshore tennis, Padel Club, Adventure/Real Divers. Audit refresh 2026-06-03."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 78 SHIPPED.
