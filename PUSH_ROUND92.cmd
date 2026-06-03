@echo off
REM Round 92 — venue More actions, sticky TOC, WhatsApp label
cd /d "%~dp0"
call npm install --silent || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\bump-legacy-assets.js || exit /b 1
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add PUSH_ROUND92.cmd
git commit -m "Round 92: venue More actions, sticky TOC, WhatsApp label" -m "Mobile toggle for Email, Website, and Share; sticky on-page nav with active section; Ask Pattaya.Gym clarifies directory WhatsApp. Asset v454."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 92 SHIPPED.
