@echo off
REM Round 50 — Climbing guide, climbing mesh
cd /d "%~dp0"
if exist .git\index.lock del /f /q .git\index.lock
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
if not "%BRANCH%"=="redesign-2026" (echo Not on redesign-2026 & exit /b 1)
call npm install --silent || exit /b 1
node scripts\write-round50-guides.js || exit /b 1
node scripts\write-round42-guides.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\inject-internal-linking-r41.js || exit /b 1
node scripts\inject-area-category-intros-r43.js || exit /b 1
node scripts\inject-venue-faq-r47.js || exit /b 1
node scripts\inject-ranked-editorial-funnel.js || exit /b 1
node scripts\polish-ranked-guide-body.js || exit /b 1
node scripts\deepen-round43-ranked.js || exit /b 1
node scripts\deepen-round44-ranked.js || exit /b 1
node scripts\deepen-round45-ranked.js || exit /b 1
node scripts\deepen-round46-ranked.js || exit /b 1
node scripts\sync-guides-hub.js || exit /b 1
node scripts\inject-homepage-seo.js || exit /b 1
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
git commit -m "Round 50: Climbing guide, climbing category mesh" -m "Climbing editorial, Deep vs Bean Cow, homepage intent. Asset 445 to 446."
if errorlevel 1 echo Nothing to commit
git push origin redesign-2026 || exit /b 1
git tag -f main-pre-round50 origin/main
git push origin main-pre-round50 --force
git push origin redesign-2026:main || exit /b 1
node scripts\ping-sitemap.js
node scripts\ping-indexnow.js
echo Round 50 SHIPPED.
