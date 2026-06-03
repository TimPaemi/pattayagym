@echo off
REM Round 93 — UX: search nav, sticky filters, homepage More tools, compare scroll
cd /d "%~dp0"
call npm install --silent || exit /b 1
node build-v2.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\bump-legacy-assets.js || exit /b 1
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add PUSH_ROUND93.cmd
git commit -m "Round 93: UX search nav, sticky filters, tool discovery" -m "Search mobile menu and sticky filters; homepage More tools; compare sticky labels; venue TOC swipe hint. Asset v455."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 93 SHIPPED.
