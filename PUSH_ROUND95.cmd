@echo off
REM Round 95 — guide v2-nav + tool empty states
cd /d "%~dp0"
call npm install --silent || exit /b 1
node build-v2.js || exit /b 1
node scripts\patch-guide-nav.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\bump-legacy-assets.js || exit /b 1
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add PUSH_ROUND95.cmd scripts/patch-guide-nav.js
git commit -m "Round 95: guide nav parity + tool empty states" -m "v2-nav on all guides; richer search/compare empty UX. Asset v457."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 95 SHIPPED.
