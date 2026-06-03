@echo off
REM Round 91 — UX: CSS tokens, nav, search pagination, compare table
cd /d "%~dp0"
call npm install --silent || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-changelog.js || exit /b 1
node scripts\inject-internal-linking-r84.js || exit /b 1
node scripts\sync-csp-hashes.js || exit /b 1
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate-all || exit /b 1
node scripts\ping-sitemap.js
git add -u
git add FULL_UI_UX_AUDIT_2026-06-03.md PUSH_ROUND91.cmd
git commit -m "Round 91: UX tokens, search pagination, compare table CSS" -m "Define --card and --border; align homepage nav with global shell; search shows 24 results with load more; compare table styling; trim venue hero CTAs on mobile. Asset v453."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
echo Round 91 SHIPPED.
