@echo off
REM Round 71 — Head meta in schema pipeline; demote map CTAs in build-discovery
cd /d "%~dp0"
call npm install --silent || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
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
git commit -m "Round 71: guide head meta in schema pipeline; demote map CTAs" -m "normalize-guide-head-meta runs after inject-guide-schema. build-discovery search-first area CTAs; map labeled rebuilding."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 71 SHIPPED.
