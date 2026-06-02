@echo off
REM Round 72 — Family guides Tier A + geocode batch + full regen
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\polish-family-guides-r72.js || exit /b 1
node scripts\geocode-venues-v2.js --limit 65 || exit /b 1
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
node scripts\content-quality-audit.js
node scripts\ping-sitemap.js
git add -A
git commit -m "Round 72: family guides Tier A; venue geo batch" -m "Polish family ranked guides. Geocode remaining venues into venue-geo.json. Regenerate venue LocalBusiness schema with GeoCoordinates."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 72 SHIPPED.
