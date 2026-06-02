@echo off
REM Round 69 — Outreach 302 redirect (CF-compatible), llms sync, changelog
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\sync-index-venue-count.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\sync-llms-guides.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\write-status-json.js
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
git add -A
git commit -m "Round 69: fix outreach redirects for Cloudflare Pages" -m "Use 302 to /404.html instead of unsupported 404 status; robots Disallow; remove public outreach folder; sync all 44 guides in llms.txt."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 69 SHIPPED.
