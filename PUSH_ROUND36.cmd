@echo off
REM Round 36 — SEO machine (content + homepage + outreach + network)
cd /d "%~dp0"
if exist .git\index.lock del /f /q .git\index.lock
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 & exit /b 1)
call npm install --silent || exit /b 1
node scripts\write-training-holiday-guide.js || exit /b 1
node scripts\inject-cheapest-price-table.js || exit /b 1
node scripts\export-venue-outreach.js || exit /b 1
node scripts\inject-homepage-seo.js || exit /b 1
node scripts\sync-guides-hub.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\write-data-endpoints.js || exit /b 1
node scripts\inject-guide-schema.js
node scripts\bump-legacy-assets.js
node scripts\sync-csp-hashes.js
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
git add -A
git commit -m "Round 36: SEO machine - training holiday, price table, outreach, network hub" -m "High-intent guide, fitness price table, venue outreach CSV, homepage intent router, pa-network grid sitewide. Asset 431 to 432."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026 || exit /b 1
git tag -f main-pre-round36 origin/main
git push origin main-pre-round36 --force
git push origin redesign-2026:main || exit /b 1
node scripts\ping-sitemap.js
echo Round 36 SHIPPED.
