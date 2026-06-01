@echo off
REM Round 60 Q3 — Tier C editorial rewrites (6 remaining guides)
cd /d "%~dp0"
call npm install --silent || exit /b 1
node scripts\write-round60-q3.js || exit /b 1
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
git commit -m "Round 60 Q3: Tier C rewrites for six remaining guides" -m "Full editorial depth from venue MD. Clears Tier C queue: tennis, equestrian, kids, climbing, BJJ/MMA, running clubs."
if errorlevel 1 echo Nothing to commit
git push origin main || exit /b 1
node scripts\full-site-audit.js
echo Round 60 Q3 SHIPPED.
