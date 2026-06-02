@echo off
REM Round 61 — Audit critical fixes (trust, schema, sitemap, noindex)
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\sync-marquee-rolling.js || exit /b 1
node build-v2.js || exit /b 1
node scripts\rebuild-tool-stubs.js || exit /b 1
node scripts\build-compare-page.js || exit /b 1
node scripts\build-plan-page.js || exit /b 1
node scripts\write-status-json.js
node scripts\write-changelog.js
node scripts\inject-guide-schema.js
node scripts\sync-csp-hashes.js
node scripts\verify-deploy.js || exit /b 1
call npm run html:validate || exit /b 1
node scripts\content-quality-audit.js
git add -A
git commit -m "Round 61: audit critical fixes trust, FAQ schema, sitemap" -m "UPDATED ROLLING marquees, FAQPage rebuild, drop duplicate gym from sitemap, noindex 404 and map stub."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
node scripts\full-site-audit.js
echo Round 61 AUDIT FIXES SHIPPED.
