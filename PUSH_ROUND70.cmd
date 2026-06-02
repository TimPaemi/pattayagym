@echo off
REM Round 70 — Guide map CTAs, head meta normalize, CI validate-all
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\patch-guide-map-cta-r70.js || exit /b 1
node scripts\fix-guide-meta-entities-r68.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\write-status-json.js
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
node scripts\ping-sitemap.js
git add -A
git commit -m "Round 70: guide CTAs to search; CI html validate-all" -m "Map stub noindex — ranked guides link to /search/. Normalize guide head meta each ship. GitHub Actions validate-all-html job."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 70 SHIPPED.
