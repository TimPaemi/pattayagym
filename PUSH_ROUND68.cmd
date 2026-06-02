@echo off
REM Round 68 — 157 count sync, guides ItemList, family guide depth, tool noscript, meta fix
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\sync-index-venue-count.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\sync-guides-hub.js || exit /b 1
node scripts\fix-guide-meta-entities-r68.js || exit /b 1
node scripts\deepen-round68-family-ranked.js || exit /b 1
node scripts\inject-homepage-seo.js || exit /b 1
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js
node scripts\inject-guide-schema.js
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
node scripts\content-quality-audit.js
git add -A
git commit -m "Round 68: 157 count sync, guides ItemList 44, family guide depth" -m "llms.txt and search copy; replace stale ItemList JSON-LD; deepen family guides; compare/plan noscript; fix childcare title encoding; CSP sync after tool HTML."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 68 SHIPPED.
